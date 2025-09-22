"""Port Monitor Stack Backend Module.

This module manages stack-based port checks and coordinated restarts.
"""

from datetime import UTC, datetime
import logging
import os
from pathlib import Path
import socket
import threading
import time

import yaml

from backend.event_log import append_ui_event_log
from backend.notifications_backend import notify_event

try:
    import docker
except ImportError:
    docker = None

_logger: logging.Logger = logging.getLogger(__name__)
PORT_MONITOR_CONFIG_PATH = Path(
    os.environ.get("PORT_MONITOR_CONFIG_PATH", "/config/port_monitoring_stacks.yaml")
)


class PortMonitorStack:
    """Represents a monitored port "stack".

    A stack defines a primary container/port pair and optional secondary
    containers that should be restarted if the primary's public port is
    unreachable. This object holds runtime state used by the manager.
    """

    def __init__(
        self,
        name: str,
        primary_container: str,
        primary_port: int,
        secondary_containers: list[str],
        interval: int = 60,
        public_ip: str | None = None,
        public_ip_detected: bool | None = None,
    ):
        """Initialize a PortMonitorStack.

        Args:
            name: Human-readable stack name.
            primary_container: Name of the primary docker container to monitor.
            primary_port: Public port on the primary container to check.
            secondary_containers: List of secondary container names to restart if primary fails.
            interval: Check interval in minutes (default: 60).
            public_ip: Optional manual public IP override for the primary container.
            public_ip_detected: Optional flag indicating whether the public IP was detected automatically.
        """
        self.name = name
        self.primary_container = primary_container
        self.primary_port = primary_port
        self.secondary_containers = secondary_containers
        self.interval = interval
        self.status = "Unknown"
        self.last_checked = 0.0
        self.last_result = False
        self.public_ip = public_ip
        self.public_ip_detected = public_ip_detected
        self.consecutive_manual_ip_failures = 0  # Track failures for manual IP
        self.manual_ip_paused = False  # Pause restarts if threshold reached


class PortMonitorStackManager:
    """Manager for PortMonitorStack instances and the background monitoring loop.

    This class is responsible for loading and saving configured PortMonitorStack
    objects, running a background thread that periodically checks stack ports,
    coordinating container restarts when failures are detected, caching a Docker
    client instance, and applying rate-limiting to warning logs and notifications.

    Attributes:
        stacks (list[PortMonitorStack]): Configured port-monitor stacks.
        running (bool): Whether the monitoring loop is active.
        thread (threading.Thread | None): Background monitoring thread.
        _docker_client: Cached Docker client or None if unavailable.
        _last_warning_times (dict): Timestamps used for rate-limiting warnings.
    """

    def __init__(self):
        """Initialize the PortMonitorStackManager and load configured stacks.

        The manager holds a list of PortMonitorStack objects and manages
        background monitoring state, docker client caching, and rate limiting
        for warnings.
        """
        self.stacks: list[PortMonitorStack] = []
        self.running = False
        self.thread = None
        self._docker_client = None
        self._last_warning_times = {}  # Rate limiting for warnings
        self.load_stacks()

    def _should_log_warning(self, key: str, min_interval: int = 30) -> bool:
        """Rate limit warnings to prevent log spam."""
        current_time = time.time()
        if key not in self._last_warning_times:
            self._last_warning_times[key] = current_time
            return True
        if current_time - self._last_warning_times[key] >= min_interval:
            self._last_warning_times[key] = current_time
            return True
        return False

    def load_stacks(self):
        """Load stacks from the configured YAML file.

        If the config file does not exist an empty stack list is used. Any
        parse or IO errors are caught and logged; in that case the stacks
        list will be empty.
        """
        if not Path(PORT_MONITOR_CONFIG_PATH).exists():
            self.stacks = []
            _logger.info("[PortMonitor] No config found at %s", PORT_MONITOR_CONFIG_PATH)
            return
        try:
            with PORT_MONITOR_CONFIG_PATH.open() as f:
                data = yaml.safe_load(f) or []
            seen = set()
            unique_stacks = []
            for d in data:
                name = d["name"]
                if name in seen:
                    _logger.warning(
                        "[PortMonitorStack] Duplicate stack name '%s' found in config, ignoring duplicate.",
                        name,
                    )
                    continue
                seen.add(name)
                unique_stacks.append(
                    PortMonitorStack(
                        d["name"],
                        d["primary_container"],
                        d["primary_port"],
                        d.get("secondary_containers", []),
                        d.get("interval", 60),
                        d.get("public_ip"),
                        d.get("public_ip_detected", None),
                    )
                )
            self.stacks = unique_stacks
            _logger.info("[PortMonitorStack] Loaded stacks: %s", [s.name for s in self.stacks])
        except Exception as e:
            _logger.error("[PortMonitorStack] Failed to load stacks: %s", e)
            self.stacks = []

    def save_stacks(self):
        """Persist the current stack list to the configured YAML path.

        Errors during writing are logged but not raised to the caller.
        """
        try:
            with PORT_MONITOR_CONFIG_PATH.open("w") as f:
                yaml.safe_dump(
                    [
                        {
                            "name": s.name,
                            "primary_container": s.primary_container,
                            "primary_port": s.primary_port,
                            "secondary_containers": s.secondary_containers,
                            "interval": getattr(s, "interval", 60),
                            "public_ip": getattr(s, "public_ip", None),
                            "public_ip_detected": getattr(s, "public_ip_detected", None),
                        }
                        for s in self.stacks
                    ],
                    f,
                )
        except Exception as e:
            _logger.error("[PortMonitorStack] Failed to save stacks: %s", e)

    def get_docker_client(self):
        """Return a cached Docker client or create one from the environment.

        Returns None if the docker SDK is unavailable or client creation
        fails.
        """
        if self._docker_client is not None:
            return self._docker_client
        if not docker:
            return None
        try:
            client = docker.from_env()
            self._docker_client = client
        except Exception:
            return None
        else:
            return self._docker_client

    def check_port(self, container_name: str, port: int) -> bool:
        """Check if the container's public IP and port are reachable from the host (outside the container),
        matching the behavior of 'nc -zv <public_ip> <port>' from the host.
        Tries manual override, then curl, then wget.
        """
        # Find the stack object to check for manual public_ip override
        stack = next((s for s in self.stacks if s.primary_container == container_name), None)
        ip = None
        public_ip_detected = False
        if stack and getattr(stack, "public_ip", None):
            ip = stack.public_ip
            _logger.info(
                "[PortMonitorStack] Using manual public_ip override for %s: %s",
                container_name,
                ip,
            )
            public_ip_detected = True
        else:
            client = self.get_docker_client()
            if not client:
                warning_key = f"docker_client_{container_name}"
                if self._should_log_warning(warning_key, min_interval=60):
                    _logger.warning(
                        "[PortMonitorStack] Docker client not available for container %s",
                        container_name,
                    )
                if stack:
                    stack.public_ip_detected = False
                return False
            try:
                container = client.containers.get(container_name)
                # Try curl first
                exec_result = container.exec_run("curl -s https://ipinfo.io/ip")
                ip = exec_result.output.decode().strip()
                if (
                    not ip
                    or "not found" in ip
                    or "OCI runtime exec" in ip
                    or "command not found" in ip
                ):
                    # Try wget as fallback
                    exec_result = container.exec_run("wget -qO- https://ipinfo.io/ip")
                    ip = exec_result.output.decode().strip()

                _logger.debug(
                    "[PortMonitorStack] Fetched public IP for %s: %s",
                    container_name,
                    ip,
                )  # Changed to DEBUG
                if (
                    not ip
                    or "not found" in ip
                    or "OCI runtime exec" in ip
                    or "command not found" in ip
                ):
                    warning_key = f"no_ip_{container_name}"
                    if self._should_log_warning(warning_key, min_interval=60):
                        _logger.warning(
                            "[PortMonitorStack] No valid public IP found for %s",
                            container_name,
                        )
                    if stack:
                        stack.public_ip_detected = False
                    return False
                public_ip_detected = True
            except Exception as e:
                _logger.error(
                    "[PortMonitorStack] Error fetching public IP for %s: %s",
                    container_name,
                    e,
                )
                if stack:
                    stack.public_ip_detected = False
                return False
        # Try to connect from the host to the container's public IP and port
        try:
            with socket.create_connection((ip, port), timeout=3):
                _logger.debug(
                    "[PortMonitorStack] Port %s on %s (container %s) is reachable from host.",
                    port,
                    ip,
                    container_name,
                )  # Changed to DEBUG
                if stack:
                    stack.public_ip_detected = public_ip_detected
                return True
        except Exception as e:
            warning_key = f"port_check_{container_name}_{port}_{ip}"
            if self._should_log_warning(warning_key, min_interval=30):
                _logger.warning(
                    "[PortMonitorStack] Port %s on %s (container %s) is NOT reachable from host: %s",
                    port,
                    ip,
                    container_name,
                    e,
                )
            if stack:
                stack.public_ip_detected = public_ip_detected
            return False

    def restart_container(self, container_name: str):
        """Restart a container by name using the docker client.

        Returns True on success, False if the docker client is not
        available or the restart operation failed.
        """
        client = self.get_docker_client()
        if not client:
            return False
        try:
            container = client.containers.get(container_name)
            container.restart()
        except Exception:
            return False
        else:
            return True

    def restart_stack(self, stack: PortMonitorStack):
        """Restart the primary and secondary containers for a stack.

        This method updates stack status, records an event in the UI event
        log, restarts the primary container and, if appropriate, restarts
        the secondary containers and rechecks the stack status.
        """
        # Set status to 'Restarting...'
        stack.status = "Restarting..."
        self.save_stacks()

        # Log restart event
        append_ui_event_log(
            {
                "event": "port_monitor_restart",
                "event_type": "port_monitor_restart",
                "label": stack.name,
                "stack": stack.name,
                "primary_container": stack.primary_container,
                "primary_port": stack.primary_port,
                "timestamp": datetime.now(tz=UTC).isoformat(),
                "status": "Restarting...",
                "status_message": f"Restarting stack '{stack.name}' (primary: {stack.primary_container}:{stack.primary_port})...",
                "details": {
                    "primary_container": stack.primary_container,
                    "primary_port": stack.primary_port,
                    "secondaries": stack.secondary_containers,
                },
                "level": "warning",
            }
        )

        # Restart primary
        self.restart_container(stack.primary_container)

        # Wait for primary to be reachable (up to 60s), fallback to running status
        port_ok = False
        for _ in range(12):  # Wait up to 12*5=60s
            if self.check_port(stack.primary_container, stack.primary_port):
                port_ok = True
                break
            time.sleep(5)

        if not port_ok:
            # Check if container is running
            client = self.get_docker_client()
            running = False
            if client:
                try:
                    container = client.containers.get(stack.primary_container)
                    running = container.status == "running"
                except Exception:
                    running = False

            if running:
                # Notify user: port unreachable, but container running, proceeding
                append_ui_event_log(
                    {
                        "event": "port_monitor_port_timeout",
                        "event_type": "port_monitor_port_timeout",
                        "label": stack.name,
                        "stack": stack.name,
                        "primary_container": stack.primary_container,
                        "primary_port": stack.primary_port,
                        "timestamp": datetime.now(tz=UTC).isoformat(),
                        "status": "Port unreachable, container running",
                        "status_message": f"Port {stack.primary_port} on {stack.primary_container} not reachable after 60s, but container is running. Proceeding to restart secondaries.",
                        "details": {},
                        "level": "warning",
                    }
                )
                notify_event(
                    event_type="port_monitor_port_timeout",
                    label=stack.name,
                    status="WARNING",
                    message=f"Port {stack.primary_port} on {stack.primary_container} not reachable after 60s, but container is running. Proceeding to restart secondaries.",
                    details={},
                )
            else:
                # Notify user: container not running
                append_ui_event_log(
                    {
                        "event": "port_monitor_container_not_running",
                        "event_type": "port_monitor_container_not_running",
                        "label": stack.name,
                        "stack": stack.name,
                        "primary_container": stack.primary_container,
                        "primary_port": stack.primary_port,
                        "timestamp": datetime.now(tz=UTC).isoformat(),
                        "status": "Container not running",
                        "status_message": f"Container {stack.primary_container} is not running after restart. Secondary containers not restarted.",
                        "details": {},
                        "level": "error",
                    }
                )
                notify_event(
                    event_type="port_monitor_container_not_running",
                    label=stack.name,
                    status="ERROR",
                    message=f"Container {stack.primary_container} is not running after restart. Secondary containers not restarted.",
                    details={},
                )
                return  # Do not restart secondaries

        # Restart all secondaries
        for sec in stack.secondary_containers:
            self.restart_container(sec)

        # Immediately recheck status after restart (this will update status and log result)
        self.recheck_stack(stack.name)

    def add_stack(
        self,
        name: str,
        primary_container: str,
        primary_port: int,
        secondary_containers: list[str],
        interval: int = 60,
        public_ip: str | None = None,
    ):
        """Add a new PortMonitorStack and perform an immediate status check.

        If a stack with the same name already exists the operation is
        ignored.
        """
        # Prevent duplicate stack names
        if any(s.name == name for s in self.stacks):
            _logger.warning(
                "[PortMonitorStack] Attempted to add duplicate stack '%s', ignoring.", name
            )
            return
        stack = PortMonitorStack(
            name, primary_container, primary_port, secondary_containers, interval, public_ip
        )
        # Immediately check status on creation
        result = self.check_port(primary_container, primary_port)
        stack.last_checked = time.time()
        stack.last_result = result
        stack.status = "OK" if result else "Failed"
        self.stacks.append(stack)
        self.save_stacks()

        _logger.info(
            "[PortMonitorStack] Added stack '%s' with initial status: %s",
            name,
            "OK" if result else "Failed",
        )

    def recheck_stack(self, name: str):
        """Re-evaluate a single stack's primary port and update its state.

        Returns True if the stack exists and was rechecked, False otherwise.
        """
        stack = self.get_stack(name)
        if not stack:
            return False
        result = self.check_port(stack.primary_container, stack.primary_port)
        stack.last_checked = time.time()
        stack.last_result = result
        stack.status = "OK" if result else "Failed"
        self.save_stacks()
        return True

    def remove_stack(self, name: str):
        """Remove a stack by name and persist the updated stack list."""
        self.stacks = [s for s in self.stacks if s.name != name]
        self.save_stacks()

    def get_stack(self, name: str) -> PortMonitorStack | None:
        """Return the stack with the given name or None if not found."""
        for s in self.stacks:
            if s.name == name:
                return s
        return None

    def list_stacks(self) -> list[PortMonitorStack]:
        """Return the list of configured PortMonitorStack objects."""
        return self.stacks

    def monitor_loop(self):
        """Background monitoring loop.

        Periodically checks configured stacks and triggers restarts/notifications
        when a primary port is unreachable according to configured guardrails.
        """
        self.running = True

        # Perform initial status checks immediately at startup
        _logger.info("[PortMonitorStack] Starting port monitoring with immediate initial checks...")
        for stack in self.stacks:
            result = self.check_port(stack.primary_container, stack.primary_port)
            stack.last_checked = time.time()
            stack.last_result = result
            stack.status = "OK" if result else "Failed"
            _logger.info(
                "[PortMonitorStack] Initial check for %s:%s (stack '%s'): %s",
                stack.primary_container,
                stack.primary_port,
                stack.name,
                "OK" if result else "FAILED",
            )
        self.save_stacks()
        _logger.info(
            "[PortMonitorStack] Initial status checks complete, beginning periodic monitoring..."
        )

        while self.running:
            now = time.time()
            for stack in self.stacks:
                # Only check if enough time has passed since last check
                interval_min = getattr(stack, "interval", 60)  # interval in minutes
                interval_sec = interval_min * 60
                if not stack.last_checked or (now - stack.last_checked) >= interval_sec:
                    # Manual IP failure tracking logic
                    manual_ip = getattr(stack, "public_ip", None)
                    result = self.check_port(stack.primary_container, stack.primary_port)
                    stack.last_checked = time.time()
                    stack.last_result = result
                    stack.status = "OK" if result else "Failed"
                    _logger.info(
                        "[PortMonitorStack] Port check for %s:%s (stack '%s'): %s",
                        stack.primary_container,
                        stack.primary_port,
                        stack.name,
                        "OK" if result else "FAILED",
                    )

                    ts = stack.last_checked
                    if not ts:
                        ts = time.time()
                    append_ui_event_log(
                        {
                            "event": "port_monitor_check",
                            "event_type": "port_monitor_check",
                            "label": stack.name,
                            "stack": stack.name,
                            "primary_container": stack.primary_container,
                            "primary_port": stack.primary_port,
                            "status": "OK" if result else "Failed",
                            "timestamp": datetime.fromtimestamp(ts, tz=UTC).isoformat(),
                            "status_message": f"Port check for {stack.primary_container}:{stack.primary_port} (stack '{stack.name}'): {'OK' if result else 'FAILED'}",
                            "details": {
                                "primary_container": stack.primary_container,
                                "primary_port": stack.primary_port,
                                "result": result,
                                "interval": getattr(stack, "interval", 60),
                                "secondaries": stack.secondary_containers,
                            },
                            "level": "primary" if result else "warning",
                        }
                    )
                    if manual_ip:
                        if not result:
                            stack.consecutive_manual_ip_failures = (
                                getattr(stack, "consecutive_manual_ip_failures", 0) + 1
                            )
                            if stack.consecutive_manual_ip_failures >= 3:
                                stack.manual_ip_paused = True
                                append_ui_event_log(
                                    {
                                        "event": "port_monitor_manual_ip_paused",
                                        "event_type": "port_monitor_manual_ip_paused",
                                        "label": stack.name,
                                        "stack": stack.name,
                                        "primary_container": stack.primary_container,
                                        "primary_port": stack.primary_port,
                                        "timestamp": datetime.now(tz=UTC).isoformat(),
                                        "status": "Manual IP unreachable, auto-restart paused",
                                        "status_message": f"Manual IP {manual_ip} unreachable for 3+ cycles. Auto-restart paused until user updates or disables manual IP.",
                                        "details": {},
                                        "level": "error",
                                    }
                                )
                                notify_event(
                                    event_type="port_monitor_manual_ip_paused",
                                    label=stack.name,
                                    status="ERROR",
                                    message=f"Manual IP {manual_ip} unreachable for 3+ cycles. Auto-restart paused until user updates or disables manual IP.",
                                    details={},
                                )
                                self.save_stacks()
                                continue  # Skip restart
                        else:
                            stack.consecutive_manual_ip_failures = 0
                            stack.manual_ip_paused = False
                    if not result:
                        if getattr(stack, "manual_ip_paused", False):
                            continue  # Don't restart if paused
                        notify_event(
                            event_type="port_monitor_failure",
                            label=stack.name,
                            status="FAILED",
                            message=f"Docker Port Monitor: {stack.primary_container}:{stack.primary_port} unreachable (stack '{stack.name}')",
                            details={
                                "primary_container": stack.primary_container,
                                "primary_port": stack.primary_port,
                                "stack": stack.name,
                                "secondaries": stack.secondary_containers,
                            },
                        )
                        self.restart_stack(stack)
                    self.save_stacks()
            time.sleep(5)

    def start(self):
        """Start background monitoring in a daemon thread.

        This initializes stack status and spawns the monitoring thread if it
        is not already running.
        """
        self.load_stacks()
        # Perform initial status checks for all stacks
        for stack in self.stacks:
            result = self.check_port(stack.primary_container, stack.primary_port)
            stack.last_checked = time.time()
            stack.last_result = result
            stack.status = "OK" if result else "Failed"
        self.save_stacks()
        if not self.running:
            self.thread = threading.Thread(target=self.monitor_loop, daemon=True)
            self.thread.start()

    def stop(self):
        """Stop the background monitoring loop and join the thread."""
        self.running = False
        if self.thread:
            self.thread.join()


# Singleton instance
port_monitor_manager = PortMonitorStackManager()
