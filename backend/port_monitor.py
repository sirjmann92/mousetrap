# Port Monitoring Backend Module
# This module will manage global port checks for Docker containers.

import threading
import time
import socket
from typing import List, Dict, Optional

try:
    import docker  # type: ignore
    from docker.errors import DockerException  # type: ignore
except ImportError:
    docker = None
    DockerException = Exception

import os
PORT_MONITOR_CONFIG_PATH = os.environ.get('PORT_MONITOR_CONFIG_PATH', '/config/port_monitoring.yaml')

class PortCheck:
    def __init__(self, container_name: str, port: int, ip: Optional[str] = None, interval: Optional[int] = None, restart_on_fail: bool = True, notify_on_fail: bool = False):
        self.container_name = container_name
        self.port = port
        self.status = 'Unknown'
        self.last_checked: Optional[float] = None
        self.last_result: Optional[bool] = None
        self.ip: Optional[str] = ip
        self.interval: Optional[int] = interval
        self.restart_on_fail: bool = restart_on_fail
        self.notify_on_fail: bool = notify_on_fail

class PortMonitor:

    def __init__(self, interval: int = 60):
        self.interval = interval
        self.checks: List[PortCheck] = []
        self.running = False
        self.thread = None
        self._docker_client = None  # Lazy init
        self.load_checks()

    def load_checks(self):
        import os, yaml
        if not os.path.exists(PORT_MONITOR_CONFIG_PATH):
            self.checks = []
            return
        try:
            with open(PORT_MONITOR_CONFIG_PATH, 'r') as f:
                data = yaml.safe_load(f) or []
            self.checks = [
                PortCheck(
                    d['container_name'],
                    d['port'],
                    d.get('ip'),
                    d.get('interval'),
                    d.get('restart_on_fail', True),
                    d.get('notify_on_fail', False)
                ) for d in data
            ]
        except Exception as e:
            import logging
            logging.error(f"[PortMonitor] Failed to load checks: {e}")
            self.checks = []

    def save_checks(self):
        import yaml
        try:
            with open(PORT_MONITOR_CONFIG_PATH, 'w') as f:
                yaml.safe_dump([
                    {
                        'container_name': c.container_name,
                        'port': c.port,
                        'ip': c.ip,
                        'interval': c.interval,
                        'restart_on_fail': getattr(c, 'restart_on_fail', True),
                        'notify_on_fail': getattr(c, 'notify_on_fail', False)
                    }
                    for c in self.checks
                ], f)
        except Exception as e:
            import logging
            logging.error(f"[PortMonitor] Failed to save checks: {e}")
    def get_docker_client(self):
        import logging
        # Only cache a valid client; always retry if previous attempt failed
        if self._docker_client is not None:
            logging.debug("[PortMonitor] get_docker_client: Returning cached client.")
            return self._docker_client
        if not docker:
            logging.info("[PortMonitor] docker module not available in backend environment.")
            return None
        try:
            client = docker.from_env()
            self._docker_client = client
            logging.debug("[PortMonitor] get_docker_client: Docker client created.")
            return self._docker_client
        except Exception as e:
            logging.info(f"[PortMonitor] Docker client creation failed: {e}")
            # Do not cache failure; always retry next time
            return None

    def add_check(self, container_name: str, port: int, interval: Optional[int] = None, restart_on_fail: bool = True, notify_on_fail: bool = False):
        check = PortCheck(container_name, port, interval=interval, restart_on_fail=restart_on_fail, notify_on_fail=notify_on_fail)
        check.interval = interval
        self.checks.append(check)
        self.save_checks()
        # Log creation
        try:
            from backend.event_log import append_ui_event_log
            import logging
            event = {
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "label": "global",
                "event_type": "port_monitor_add",
                "details": {"container": container_name, "port": port, "interval": interval},
                "status_message": f"Port check created for {container_name}:{port}"
            }
            append_ui_event_log(event)
            logging.info(f"[PortMonitor] {event['status_message']}")
        except Exception:
            pass
        # Immediate check
        ip, result = self.check_port_with_ip(container_name, port)
        check.last_checked = time.time()
        check.last_result = result
        if result:
            check.status = 'OK'
            status_str = 'OK'
        else:
            if restart_on_fail:
                check.status = 'Restarted'
                status_str = 'Restarted'
            else:
                check.status = 'Failed'
                status_str = 'Failed'
        check.ip = ip
        self.save_checks()
        # Log result
        try:
            from backend.event_log import append_ui_event_log
            import logging
            event = {
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "label": "global",
                "event_type": "port_monitor_check",
                "details": {"container": container_name, "port": port, "result": result, "ip": ip, "interval": interval, "restart_on_fail": restart_on_fail},
                "status_message": f"Initial port check for {container_name}:{port}: {status_str}"
            }
            append_ui_event_log(event)
            logging.info(f"[PortMonitor] {event['status_message']}")
        except Exception:
            pass

    def remove_check(self, container_name: str, port: int):
        self.checks = [c for c in self.checks if not (c.container_name == container_name and c.port == port)]
        self.save_checks()

    def list_running_containers(self) -> List[str]:
        import logging
        client = self.get_docker_client()
        if not client:
            logging.info("[PortMonitor] list_running_containers: No Docker client available.")
            return []
        try:
            containers = client.containers.list()
            names = [c.name for c in containers]
            logging.debug(f"[PortMonitor] list_running_containers: Found containers: {names}")
            return names
        except Exception as e:
            logging.info(f"[PortMonitor] list_running_containers: Exception: {e}")
            return []

    def check_port(self, container_name: str, port: int) -> bool:
        ip, result = self.check_port_with_ip(container_name, port)
        # Update IP for the check if it exists
        for c in self.checks:
            if c.container_name == container_name and c.port == port:
                c.ip = ip
        self.save_checks()
        return result

    def check_port_with_ip(self, container_name: str, port: int):
        client = self.get_docker_client()
        if not client:
            return None, False
        ip = None
        try:
            container = client.containers.get(container_name)
            ip = container.exec_run('wget -qO- https://ipinfo.io/ip').output.decode().strip()
            if not ip:
                return None, False
            with socket.create_connection((ip, port), timeout=3):
                return ip, True
        except Exception:
            return ip, False

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

    def set_interval(self, interval_seconds: int):
        self.interval = interval_seconds

    def monitor_loop(self):
        self.running = True
        while self.running:
            for check in self.checks:
                ip, result = self.check_port_with_ip(check.container_name, check.port)
                check.last_checked = time.time()
                check.last_result = result
                check.ip = ip
                restart_on_fail = getattr(check, 'restart_on_fail', True)
                notify_on_fail = getattr(check, 'notify_on_fail', False)
                status = 'OK'
                status_message = f"Port check for {check.container_name}:{check.port}: OK"
                event_type = "port_monitor_check"
                action_taken = None
                if not result:
                    if restart_on_fail:
                        restarted = self.restart_container(check.container_name)
                        status = 'Restarted' if restarted else 'Restart Failed'
                        action_taken = 'Restarted' if restarted else 'Restart Failed'
                        status_message = f"Port check for {check.container_name}:{check.port}: FAILED. Container restart {'attempted' if restarted else 'FAILED'} due to restart_on_fail."
                    else:
                        status = 'Failed'
                        status_message = f"Port check for {check.container_name}:{check.port}: FAILED. Restart not attempted (restart_on_fail is off)."
                        action_taken = 'No Restart'
                    if notify_on_fail:
                        try:
                            from backend.notifications_backend import notify_event
                            notify_event(
                                event_type="port_monitor_failure",
                                label=check.container_name,
                                status="FAILED",
                                message=f"Port {check.port} check failed for {check.container_name}",
                                details={
                                    "container": check.container_name,
                                    "port": check.port,
                                    "ip": ip,
                                    "restart_on_fail": restart_on_fail,
                                    "notified": True
                                }
                            )
                        except Exception as e:
                            import logging
                            logging.error(f"[Notify] Port monitor notification failed: {e}")
                        status_message += " Notification sent (notify_on_fail is on)."
                        action_taken = (action_taken or "") + ' + Notified'
                    else:
                        status_message += " Notification not sent (notify_on_fail is off)."
                check.status = status
                self.save_checks()
                # Log result
                try:
                    from backend.event_log import append_ui_event_log
                    import logging
                    event = {
                        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                        "label": "global",
                        "event_type": event_type,
                        "details": {
                            "container": check.container_name,
                            "port": check.port,
                            "result": result,
                            "ip": ip,
                            "interval": check.interval,
                            "restart_on_fail": restart_on_fail,
                            "notify_on_fail": notify_on_fail,
                            "action_taken": action_taken
                        },
                        "status_message": status_message
                    }
                    append_ui_event_log(event)
                    logging.info(f"[PortMonitor] {event['status_message']}")
                except Exception:
                    pass
            # Use per-check interval if set, else global
            sleep_time = min([c.interval for c in self.checks if c.interval] or [self.interval])
            time.sleep(sleep_time if sleep_time else self.interval)

    def start(self):
        self.load_checks()
        if not self.running:
            self.thread = threading.Thread(target=self.monitor_loop, daemon=True)
            self.thread.start()

    def stop(self):
        self.running = False
        if self.thread:
            self.thread.join()

# Singleton instance for app
port_monitor = PortMonitor()
