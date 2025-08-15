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

PORT_MONITOR_CONFIG_PATH = 'config/port_monitoring.yaml'

class PortCheck:
    def __init__(self, container_name: str, port: int):
        self.container_name = container_name
        self.port = port
        self.status = 'Unknown'
        self.last_checked: Optional[float] = None
        self.last_result: Optional[bool] = None

class PortMonitor:
    def __init__(self, interval: int = 60):
        self.interval = interval
        self.checks: List[PortCheck] = []
        self.running = False
        self.thread = None
        self._docker_client = None  # Lazy init

    def get_docker_client(self):
        if self._docker_client is not None:
            return self._docker_client
        if not docker:
            return None
        try:
            self._docker_client = docker.from_env()
            # Test connection
            self._docker_client.ping()
            return self._docker_client
        except Exception:
            self._docker_client = None
            return None

    def add_check(self, container_name: str, port: int):
        self.checks.append(PortCheck(container_name, port))

    def remove_check(self, container_name: str, port: int):
        self.checks = [c for c in self.checks if not (c.container_name == container_name and c.port == port)]

    def list_running_containers(self) -> List[str]:
        client = self.get_docker_client()
        if not client:
            return []
        try:
            return [c.name for c in client.containers.list()]
        except Exception:
            return []

    def check_port(self, container_name: str, port: int) -> bool:
        client = self.get_docker_client()
        if not client:
            return False
        try:
            container = client.containers.get(container_name)
            ip = container.exec_run('wget -qO- https://ipinfo.io/ip').output.decode().strip()
            if not ip:
                return False
            with socket.create_connection((ip, port), timeout=3):
                return True
        except Exception:
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

    def monitor_loop(self):
        self.running = True
        while self.running:
            for check in self.checks:
                result = self.check_port(check.container_name, check.port)
                check.last_checked = time.time()
                check.last_result = result
                check.status = 'OK' if result else 'Restarted'
                if not result:
                    self.restart_container(check.container_name)
                    # TODO: Log event to backend log and UI event log
            time.sleep(self.interval)

    def start(self):
        if not self.running:
            self.thread = threading.Thread(target=self.monitor_loop, daemon=True)
            self.thread.start()

    def stop(self):
        self.running = False
        if self.thread:
            self.thread.join()

# Singleton instance for app
port_monitor = PortMonitor()
