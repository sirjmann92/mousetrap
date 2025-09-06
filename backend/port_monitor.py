# Port Monitor Stack Backend Module
# This module manages stack-based port checks and coordinated restarts.

import threading
import time
import socket
import logging
from typing import List, Optional

try:
    import docker  # type: ignore
except ImportError:
    docker = None

import os
PORT_MONITOR_CONFIG_PATH = os.environ.get('PORT_MONITOR_CONFIG_PATH', '/config/port_monitoring_stacks.yaml')

class PortMonitorStack:
    def __init__(self, name: str, primary_container: str, primary_port: int, secondary_containers: List[str], interval: int = 60, public_ip: Optional[str] = None, public_ip_detected: Optional[bool] = None):
        self.name = name
        self.primary_container = primary_container
        self.primary_port = primary_port
        self.secondary_containers = secondary_containers
        self.interval = interval
        self.status = 'Unknown'
        self.last_checked = 0.0
        self.last_result = False
        self.public_ip = public_ip
        self.public_ip_detected = public_ip_detected
        self.consecutive_manual_ip_failures = 0  # Track failures for manual IP
        self.manual_ip_paused = False  # Pause restarts if threshold reached

class PortMonitorStackManager:
    def __init__(self):
        self.stacks: List[PortMonitorStack] = []
        self.running = False
        self.thread = None
        self._docker_client = None
        self._last_warning_times = {}  # Rate limiting for warnings
        self.load_stacks()

    def _should_log_warning(self, key: str, min_interval: int = 30) -> bool:
        """Rate limit warnings to prevent log spam"""
        current_time = time.time()
        if key not in self._last_warning_times:
            self._last_warning_times[key] = current_time
            return True
        if current_time - self._last_warning_times[key] >= min_interval:
            self._last_warning_times[key] = current_time
            return True
        return False

    def load_stacks(self):
        import yaml
        import logging
        if not os.path.exists(PORT_MONITOR_CONFIG_PATH):
            self.stacks = []
            logging.info(f"[PortMonitor] No config found at {PORT_MONITOR_CONFIG_PATH}")
            return
        try:
            with open(PORT_MONITOR_CONFIG_PATH, 'r') as f:
                data = yaml.safe_load(f) or []
            seen = set()
            unique_stacks = []
            for d in data:
                name = d['name']
                if name in seen:
                    logging.warning(f"[PortMonitorStack] Duplicate stack name '{name}' found in config, ignoring duplicate.")
                    continue
                seen.add(name)
                unique_stacks.append(PortMonitorStack(
                    d['name'],
                    d['primary_container'],
                    d['primary_port'],
                    d.get('secondary_containers', []),
                    d.get('interval', 60),
                    d.get('public_ip'),
                    d.get('public_ip_detected', None)
                ))
            self.stacks = unique_stacks
            logging.info(f"[PortMonitorStack] Loaded stacks: {[s.name for s in self.stacks]}")
        except Exception as e:
            logging.error(f"[PortMonitorStack] Failed to load stacks: {e}")
            self.stacks = []

    def save_stacks(self):
        import yaml
        try:
            with open(PORT_MONITOR_CONFIG_PATH, 'w') as f:
                yaml.safe_dump([
                    {
                        'name': s.name,
                        'primary_container': s.primary_container,
                        'primary_port': s.primary_port,
                        'secondary_containers': s.secondary_containers,
                        'interval': getattr(s, 'interval', 60),
                        'public_ip': getattr(s, 'public_ip', None),
                        'public_ip_detected': getattr(s, 'public_ip_detected', None),
                    }
                    for s in self.stacks
                ], f)
        except Exception as e:
            import logging
            logging.error(f"[PortMonitorStack] Failed to save stacks: {e}")

    def get_docker_client(self):
        if self._docker_client is not None:
            return self._docker_client
        if not docker:
            return None
        try:
            client = docker.from_env()
            self._docker_client = client
            return self._docker_client
        except Exception:
            return None

    def check_port(self, container_name: str, port: int) -> bool:
        """
        Check if the container's public IP and port are reachable from the host (outside the container),
        matching the behavior of 'nc -zv <public_ip> <port>' from the host.
        Tries manual override, then curl, then wget.
        """
        import logging
        # Find the stack object to check for manual public_ip override
        stack = next((s for s in self.stacks if s.primary_container == container_name), None)
        ip = None
        public_ip_detected = False
        if stack and getattr(stack, 'public_ip', None):
            ip = stack.public_ip
            logging.info(f"[PortMonitorStack] Using manual public_ip override for {container_name}: {ip}")
            public_ip_detected = True
        else:
            client = self.get_docker_client()
            if not client:
                warning_key = f"docker_client_{container_name}"
                if self._should_log_warning(warning_key, min_interval=60):
                    logging.warning(f"[PortMonitorStack] Docker client not available for container {container_name}")
                if stack:
                    stack.public_ip_detected = False
                return False
            try:
                container = client.containers.get(container_name)
                # Try curl first
                exec_result = container.exec_run('curl -s https://ipinfo.io/ip')
                ip = exec_result.output.decode().strip()
                if not ip or 'not found' in ip or 'OCI runtime exec' in ip or 'command not found' in ip:
                    # Try wget as fallback
                    exec_result = container.exec_run('wget -qO- https://ipinfo.io/ip')
                    ip = exec_result.output.decode().strip()
                
                logging.debug(f"[PortMonitorStack] Fetched public IP for {container_name}: {ip}")  # Changed to DEBUG
                if not ip or 'not found' in ip or 'OCI runtime exec' in ip or 'command not found' in ip:
                    warning_key = f"no_ip_{container_name}"
                    if self._should_log_warning(warning_key, min_interval=60):
                        logging.warning(f"[PortMonitorStack] No valid public IP found for {container_name}")
                    if stack:
                        stack.public_ip_detected = False
                    return False
                else:
                    public_ip_detected = True
            except Exception as e:
                logging.error(f"[PortMonitorStack] Error fetching public IP for {container_name}: {e}")
                if stack:
                    stack.public_ip_detected = False
                return False
        # Try to connect from the host to the container's public IP and port
        try:
            with socket.create_connection((ip, port), timeout=3):
                logging.debug(f"[PortMonitorStack] Port {port} on {ip} (container {container_name}) is reachable from host.")  # Changed to DEBUG
                if stack:
                    stack.public_ip_detected = public_ip_detected
                return True
        except Exception as e:
            warning_key = f"port_check_{container_name}_{port}_{ip}"
            if self._should_log_warning(warning_key, min_interval=30):
                logging.warning(f"[PortMonitorStack] Port {port} on {ip} (container {container_name}) is NOT reachable from host: {e}")
            if stack:
                stack.public_ip_detected = public_ip_detected
            return False

    def restart_container(self, container_name: str):
        client = self.get_docker_client()
        if not client:
            return False
        try:
            container = client.containers.get(container_name)
            container.restart()
            return True
        except Exception:
            return False

    def restart_stack(self, stack: PortMonitorStack):
        import datetime
        from backend.event_log import append_ui_event_log
        from backend.notifications_backend import notify_event
        
        # Set status to 'Restarting...'
        stack.status = 'Restarting...'
        self.save_stacks()
        
        # Log restart event
        append_ui_event_log({
            'event': 'port_monitor_restart',
            'event_type': 'port_monitor_restart',
            'label': stack.name,
            'stack': stack.name,
            'primary_container': stack.primary_container,
            'primary_port': stack.primary_port,
            'timestamp': datetime.datetime.utcnow().isoformat() + 'Z',
            'status': 'Restarting...',
            'status_message': f"Restarting stack '{stack.name}' (primary: {stack.primary_container}:{stack.primary_port})...",
            'details': {
                'primary_container': stack.primary_container,
                'primary_port': stack.primary_port,
                'secondaries': stack.secondary_containers,
            },
            'level': 'warning',
        })
        
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
                    running = container.status == 'running'
                except Exception:
                    running = False
                    
            if running:
                # Notify user: port unreachable, but container running, proceeding
                append_ui_event_log({
                    'event': 'port_monitor_port_timeout',
                    'event_type': 'port_monitor_port_timeout',
                    'label': stack.name,
                    'stack': stack.name,
                    'primary_container': stack.primary_container,
                    'primary_port': stack.primary_port,
                    'timestamp': datetime.datetime.utcnow().isoformat() + 'Z',
                    'status': 'Port unreachable, container running',
                    'status_message': f"Port {stack.primary_port} on {stack.primary_container} not reachable after 60s, but container is running. Proceeding to restart secondaries.",
                    'details': {},
                    'level': 'warning',
                })
                notify_event(
                    event_type='port_monitor_port_timeout',
                    label=stack.name,
                    status='WARNING',
                    message=f"Port {stack.primary_port} on {stack.primary_container} not reachable after 60s, but container is running. Proceeding to restart secondaries.",
                    details={}
                )
            else:
                # Notify user: container not running
                append_ui_event_log({
                    'event': 'port_monitor_container_not_running',
                    'event_type': 'port_monitor_container_not_running',
                    'label': stack.name,
                    'stack': stack.name,
                    'primary_container': stack.primary_container,
                    'primary_port': stack.primary_port,
                    'timestamp': datetime.datetime.utcnow().isoformat() + 'Z',
                    'status': 'Container not running',
                    'status_message': f"Container {stack.primary_container} is not running after restart. Secondary containers not restarted.",
                    'details': {},
                    'level': 'error',
                })
                notify_event(
                    event_type='port_monitor_container_not_running',
                    label=stack.name,
                    status='ERROR',
                    message=f"Container {stack.primary_container} is not running after restart. Secondary containers not restarted.",
                    details={}
                )
                return  # Do not restart secondaries
                
        # Restart all secondaries
        for sec in stack.secondary_containers:
            self.restart_container(sec)
            
        # Immediately recheck status after restart (this will update status and log result)
        self.recheck_stack(stack.name)

    def add_stack(self, name: str, primary_container: str, primary_port: int, secondary_containers: List[str], interval: int = 60, public_ip: Optional[str] = None):
        # Prevent duplicate stack names
        if any(s.name == name for s in self.stacks):
            import logging
            logging.warning(f"[PortMonitorStack] Attempted to add duplicate stack '{name}', ignoring.")
            return
        stack = PortMonitorStack(name, primary_container, primary_port, secondary_containers, interval, public_ip)
        # Immediately check status on creation
        result = self.check_port(primary_container, primary_port)
        stack.last_checked = time.time()
        stack.last_result = result
        stack.status = 'OK' if result else 'Failed'
        self.stacks.append(stack)
        self.save_stacks()
        import logging
        logging.info(f"[PortMonitorStack] Added stack '{name}' with initial status: {'OK' if result else 'Failed'}")

    def recheck_stack(self, name: str):
        stack = self.get_stack(name)
        if not stack:
            return False
        result = self.check_port(stack.primary_container, stack.primary_port)
        stack.last_checked = time.time()
        stack.last_result = result
        stack.status = 'OK' if result else 'Failed'
        self.save_stacks()
        return True

    def remove_stack(self, name: str):
        self.stacks = [s for s in self.stacks if s.name != name]
        self.save_stacks()

    def get_stack(self, name: str) -> Optional[PortMonitorStack]:
        for s in self.stacks:
            if s.name == name:
                return s
        return None

    def list_stacks(self) -> List[PortMonitorStack]:
        return self.stacks

    def monitor_loop(self):
        import logging
        from backend.event_log import append_ui_event_log
        from backend.notifications_backend import notify_event
        self.running = True
        
        # Perform initial status checks immediately at startup
        logging.info("[PortMonitorStack] Starting port monitoring with immediate initial checks...")
        for stack in self.stacks:
            result = self.check_port(stack.primary_container, stack.primary_port)
            stack.last_checked = time.time()
            stack.last_result = result
            stack.status = 'OK' if result else 'Failed'
            logging.info(f"[PortMonitorStack] Initial check for {stack.primary_container}:{stack.primary_port} (stack '{stack.name}'): {'OK' if result else 'FAILED'}")
        self.save_stacks()
        logging.info("[PortMonitorStack] Initial status checks complete, beginning periodic monitoring...")
        
        while self.running:
            now = time.time()
            for stack in self.stacks:
                # Only check if enough time has passed since last check
                interval_min = getattr(stack, 'interval', 60)  # interval in minutes
                interval_sec = interval_min * 60
                if not stack.last_checked or (now - stack.last_checked) >= interval_sec:
                    # Manual IP failure tracking logic
                    manual_ip = getattr(stack, 'public_ip', None)
                    result = self.check_port(stack.primary_container, stack.primary_port)
                    stack.last_checked = time.time()
                    stack.last_result = result
                    stack.status = 'OK' if result else 'Failed'
                    logging.info(f"[PortMonitorStack] Port check for {stack.primary_container}:{stack.primary_port} (stack '{stack.name}'): {'OK' if result else 'FAILED'}")
                    import datetime
                    ts = stack.last_checked
                    if not ts:
                        ts = time.time()
                    append_ui_event_log({
                        'event': 'port_monitor_check',
                        'event_type': 'port_monitor_check',
                        'label': stack.name,
                        'stack': stack.name,
                        'primary_container': stack.primary_container,
                        'primary_port': stack.primary_port,
                        'status': 'OK' if result else 'Failed',
                        'timestamp': datetime.datetime.utcfromtimestamp(ts).isoformat() + 'Z',
                        'status_message': f"Port check for {stack.primary_container}:{stack.primary_port} (stack '{stack.name}'): {'OK' if result else 'FAILED'}",
                        'details': {
                            'primary_container': stack.primary_container,
                            'primary_port': stack.primary_port,
                            'result': result,
                            'interval': getattr(stack, 'interval', 60),
                            'secondaries': stack.secondary_containers,
                        },
                        'level': 'primary' if result else 'warning',
                    })
                    if manual_ip:
                        if not result:
                            stack.consecutive_manual_ip_failures = getattr(stack, 'consecutive_manual_ip_failures', 0) + 1
                            if stack.consecutive_manual_ip_failures >= 3:
                                stack.manual_ip_paused = True
                                append_ui_event_log({
                                    'event': 'port_monitor_manual_ip_paused',
                                    'event_type': 'port_monitor_manual_ip_paused',
                                    'label': stack.name,
                                    'stack': stack.name,
                                    'primary_container': stack.primary_container,
                                    'primary_port': stack.primary_port,
                                    'timestamp': datetime.datetime.utcnow().isoformat() + 'Z',
                                    'status': 'Manual IP unreachable, auto-restart paused',
                                    'status_message': f"Manual IP {manual_ip} unreachable for 3+ cycles. Auto-restart paused until user updates or disables manual IP.",
                                    'details': {},
                                    'level': 'error',
                                })
                                notify_event(
                                    event_type='port_monitor_manual_ip_paused',
                                    label=stack.name,
                                    status='ERROR',
                                    message=f"Manual IP {manual_ip} unreachable for 3+ cycles. Auto-restart paused until user updates or disables manual IP.",
                                    details={}
                                )
                                self.save_stacks()
                                continue  # Skip restart
                        else:
                            stack.consecutive_manual_ip_failures = 0
                            stack.manual_ip_paused = False
                    if not result:
                        if getattr(stack, 'manual_ip_paused', False):
                            continue  # Don't restart if paused
                        notify_event(
                            event_type='port_monitor_failure',
                            label=stack.name,
                            status='FAILED',
                            message=f"Docker Port Monitor: {stack.primary_container}:{stack.primary_port} unreachable (stack '{stack.name}')",
                            details={
                                'primary_container': stack.primary_container,
                                'primary_port': stack.primary_port,
                                'stack': stack.name,
                                'secondaries': stack.secondary_containers,
                            }
                        )
                        self.restart_stack(stack)
                    self.save_stacks()
            time.sleep(5)

    def start(self):
        self.load_stacks()
        # Perform initial status checks for all stacks
        for stack in self.stacks:
            result = self.check_port(stack.primary_container, stack.primary_port)
            stack.last_checked = time.time()
            stack.last_result = result
            stack.status = 'OK' if result else 'Failed'
        self.save_stacks()
        if not self.running:
            self.thread = threading.Thread(target=self.monitor_loop, daemon=True)
            self.thread.start()

    def stop(self):
        self.running = False
        if self.thread:
            self.thread.join()

# Singleton instance
port_monitor_manager = PortMonitorStackManager()
