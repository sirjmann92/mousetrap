"""Tests for port monitor persistence behavior."""

from __future__ import annotations

import asyncio
import logging
from pathlib import Path
from threading import Event, Thread
from unittest.mock import AsyncMock, Mock

import pytest

from backend import notifications_backend, port_monitor
from backend.port_monitor import PortMonitorStack, PortMonitorStackManager
from backend.yaml_store import YamlStoreError


def test_constructor_does_not_load_corrupt_config(monkeypatch: pytest.MonkeyPatch) -> None:
    """Construct the optional manager without reading its persisted config."""

    def fail_load(*_args: object, **_kwargs: object) -> list[object]:
        raise YamlStoreError("corrupt stack configuration")

    monkeypatch.setattr(port_monitor, "load_yaml_file", fail_load)

    manager = PortMonitorStackManager()

    assert manager.stacks == []
    assert manager.running is False
    assert manager.thread is None
    assert manager._config_loaded is False


def test_start_with_corrupt_config_disables_monitoring_without_modifying_file(
    monkeypatch: pytest.MonkeyPatch,
    caplog: pytest.LogCaptureFixture,
    tmp_path: Path,
) -> None:
    """Leave corrupt optional config untouched and do not start monitoring."""
    config_path = tmp_path / "port_monitoring_stacks.yaml"
    corrupt_bytes = b"stacks: [invalid\n"
    config_path.write_bytes(corrupt_bytes)
    manager = PortMonitorStackManager()
    save_stacks = Mock()
    thread = Mock()
    monkeypatch.setattr(port_monitor, "PORT_MONITOR_CONFIG_PATH", config_path)
    monkeypatch.setattr(manager, "save_stacks", save_stacks)
    monkeypatch.setattr(port_monitor.threading, "Thread", thread)

    with caplog.at_level(logging.ERROR, logger=port_monitor.__name__):
        manager.start()

    assert "Failed to load stacks; port monitoring disabled" in caplog.text
    assert manager.running is False
    assert manager.thread is None
    assert manager.stacks == []
    assert manager._config_loaded is False
    save_stacks.assert_not_called()
    thread.assert_not_called()
    assert config_path.read_bytes() == corrupt_bytes


def test_start_loads_valid_config_and_starts_monitoring(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    """Load valid persisted stacks before starting the monitoring thread."""
    config_path = tmp_path / "port_monitoring_stacks.yaml"
    config_path.write_text(
        """
- name: valid
  primary_container: primary
  primary_port: 8000
  secondary_containers: []
""".lstrip(),
        encoding="utf-8",
    )
    manager = PortMonitorStackManager()
    manager.check_port = Mock(return_value=True)
    manager.save_stacks = Mock()
    thread = Mock()
    thread_instance = thread.return_value
    monkeypatch.setattr(port_monitor, "PORT_MONITOR_CONFIG_PATH", config_path)
    monkeypatch.setattr(port_monitor.threading, "Thread", thread)

    manager.start()

    assert [stack.name for stack in manager.stacks] == ["valid"]
    manager.check_port.assert_called_once_with("primary", 8000)
    manager.save_stacks.assert_called_once_with()
    thread.assert_called_once()
    thread_instance.start.assert_called_once_with()
    assert manager.thread is thread_instance


@pytest.mark.parametrize("operation", ["save", "add", "remove"])
def test_mutations_after_failed_start_preserve_corrupt_config(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
    operation: str,
) -> None:
    """Reject mutations while optional configuration remains unavailable."""
    config_path = tmp_path / "port_monitoring_stacks.yaml"
    corrupt_bytes = b"stacks: [invalid\n"
    config_path.write_bytes(corrupt_bytes)
    manager = PortMonitorStackManager()
    monkeypatch.setattr(port_monitor, "PORT_MONITOR_CONFIG_PATH", config_path)
    manager.start()
    mutations = {
        "save": manager.save_stacks,
        "add": lambda: manager.add_stack("new", "primary", 8000, []),
        "remove": lambda: manager.remove_stack("existing"),
    }

    with pytest.raises(YamlStoreError, match="configuration is unavailable"):
        mutations[operation]()

    assert manager.stacks == []
    assert config_path.read_bytes() == corrupt_bytes


def test_failed_restart_stops_running_manager_and_clears_stale_stacks(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Disable a running manager when its configuration can no longer load."""
    manager = PortMonitorStackManager()
    manager.running = True
    manager.stacks = [PortMonitorStack("stale", "primary", 8000, [])]
    manager._config_loaded = True

    def fail_load(*_args: object, **_kwargs: object) -> list[object]:
        raise YamlStoreError("corrupt stack configuration")

    monkeypatch.setattr(port_monitor, "load_yaml_file", fail_load)

    manager.start()

    assert manager.running is False
    assert manager.stacks == []
    assert manager._config_loaded is False
    assert manager.get_stack("stale") is None
    assert manager.recheck_stack("stale") is False


def test_restart_waits_for_existing_monitor_before_starting_replacement(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Join the old monitor before reloading and starting one replacement."""
    manager = PortMonitorStackManager()
    old_started = Event()
    old_exited = Event()
    poll = Event()

    def old_monitor() -> None:
        old_started.set()
        while manager.running:
            poll.wait(0.001)
        old_exited.set()

    manager.running = True
    old_thread = Thread(target=old_monitor)
    manager.thread = old_thread
    old_thread.start()
    assert old_started.wait(timeout=1)

    def load_after_old_exit() -> None:
        assert old_exited.is_set()
        manager.stacks = []
        manager._config_loaded = True

    replacement_thread = Mock()
    replacement_thread_instance = replacement_thread.return_value
    monkeypatch.setattr(manager, "load_stacks", load_after_old_exit)
    monkeypatch.setattr(manager, "save_stacks", Mock())
    monkeypatch.setattr(port_monitor.threading, "Thread", replacement_thread)

    manager.start()

    assert not old_thread.is_alive()
    replacement_thread.assert_called_once()
    replacement_thread_instance.start.assert_called_once_with()
    assert manager.thread is replacement_thread_instance


def test_cancel_before_monitor_loop_entry_does_not_reenable_running() -> None:
    """Honor cancellation that occurs before a newly spawned loop enters."""
    manager = PortMonitorStackManager()
    manager._config_loaded = True
    manager.save_stacks = Mock()
    manager.running = True
    worker_ready = Event()
    enter_loop = Event()
    worker_finished = Event()

    def delayed_monitor_entry() -> None:
        worker_ready.set()
        enter_loop.wait()
        asyncio.run(manager.monitor_loop())
        worker_finished.set()

    worker = Thread(target=delayed_monitor_entry, daemon=True)
    worker.start()
    assert worker_ready.wait(timeout=1)

    manager.running = False
    enter_loop.set()

    assert worker_finished.wait(timeout=1)
    worker.join(timeout=1)
    assert not worker.is_alive()
    assert manager.running is False


def test_worker_failure_allows_exactly_one_replacement(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Release worker ownership after failure so the next start replaces it."""
    manager = PortMonitorStackManager()
    manager.running = True
    manager.monitor_loop = AsyncMock(side_effect=RuntimeError("monitor failed"))

    with pytest.raises(RuntimeError, match="monitor failed"):
        manager._run_monitor_loop()

    assert manager.running is False
    dead_thread = Mock()
    dead_thread.is_alive.return_value = False
    manager.thread = dead_thread

    def load_config() -> None:
        manager.stacks = []
        manager._config_loaded = True

    replacement_thread = Mock()
    replacement_thread_instance = replacement_thread.return_value
    monkeypatch.setattr(manager, "load_stacks", load_config)
    monkeypatch.setattr(manager, "save_stacks", Mock())
    monkeypatch.setattr(port_monitor.threading, "Thread", replacement_thread)

    manager.start()

    replacement_thread.assert_called_once_with(target=manager._run_monitor_loop, daemon=True)
    replacement_thread_instance.start.assert_called_once_with()
    assert manager.thread is replacement_thread_instance
    assert manager.running is True


def test_load_stacks_propagates_yaml_store_error(monkeypatch: pytest.MonkeyPatch) -> None:
    """Do not replace a corrupt port-monitor configuration with an empty one."""
    manager = PortMonitorStackManager.__new__(PortMonitorStackManager)

    def fail_load(*_args: object, **_kwargs: object) -> list[object]:
        """Model a typed YAML corruption failure."""
        raise YamlStoreError("corrupt stack configuration")

    monkeypatch.setattr(port_monitor, "load_yaml_file", fail_load)

    with pytest.raises(YamlStoreError, match="corrupt stack configuration"):
        manager.load_stacks()


def test_load_stacks_rejects_invalid_entry_without_clearing_runtime_state(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Keep active stacks intact when persisted entries are semantically invalid."""
    manager = PortMonitorStackManager.__new__(PortMonitorStackManager)
    existing_stack = PortMonitorStack("existing", "primary", 8000, [])
    manager.stacks = [existing_stack]
    monkeypatch.setattr(
        port_monitor,
        "load_yaml_file",
        lambda *_args, **_kwargs: [{"name": "invalid"}],
    )

    with pytest.raises(YamlStoreError, match="Invalid port-monitor stack configuration"):
        manager.load_stacks()

    assert manager.stacks == [existing_stack]


@pytest.mark.asyncio
async def test_monitor_cycle_saves_each_due_stack_before_continue(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Persist each due stack, including state before a pause continues."""
    manager = PortMonitorStackManager.__new__(PortMonitorStackManager)
    paused_stack = PortMonitorStack(
        "paused",
        "primary-a",
        8000,
        [],
        interval=0,
        public_ip="192.0.2.1",
    )
    paused_stack.consecutive_manual_ip_failures = 2
    healthy_stack = PortMonitorStack(
        "healthy",
        "primary-b",
        8001,
        [],
        interval=0,
    )
    manager.stacks = [paused_stack, healthy_stack]
    manager.running = True
    manager.thread = None
    manager._docker_client = None
    manager._last_warning_times = {}
    manager.check_port = Mock(side_effect=[False, True, False, True])
    manager.restart_stack = AsyncMock()

    saved_states: list[tuple[bool, int]] = []

    def record_save() -> None:
        saved_states.append(
            (
                paused_stack.manual_ip_paused,
                paused_stack.consecutive_manual_ip_failures,
            )
        )

    manager.save_stacks = Mock(side_effect=record_save)

    async def stop_after_cycle(_seconds: float) -> None:
        manager.running = False

    monkeypatch.setattr("backend.port_monitor.asyncio.sleep", stop_after_cycle)
    monkeypatch.setattr("backend.port_monitor.safe_notify_event", AsyncMock())
    monkeypatch.setattr("backend.port_monitor.append_ui_event_log", Mock())

    await manager.monitor_loop()

    assert manager.save_stacks.call_count == 3
    assert saved_states == [(False, 2), (True, 3), (True, 3)]
    assert healthy_stack.status == "OK"
    manager.restart_stack.assert_not_awaited()


@pytest.mark.asyncio
async def test_monitor_cycle_saves_due_stack_before_restart_transition(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Persist the due check before the restart transition is persisted."""
    manager = PortMonitorStackManager.__new__(PortMonitorStackManager)
    stack = PortMonitorStack("failed", "primary", 8000, [], interval=0)
    manager.stacks = [stack]
    manager.running = True
    manager.thread = None
    manager._docker_client = None
    manager._last_warning_times = {}
    manager.check_port = Mock(side_effect=[True, False])
    manager.save_stacks = Mock()

    async def restart_and_save(_stack: PortMonitorStack) -> None:
        manager.save_stacks()

    async def stop_after_cycle(_seconds: float) -> None:
        manager.running = False

    manager.restart_stack = AsyncMock(side_effect=restart_and_save)
    monkeypatch.setattr("backend.port_monitor.asyncio.sleep", stop_after_cycle)
    monkeypatch.setattr("backend.port_monitor.safe_notify_event", AsyncMock())
    monkeypatch.setattr("backend.port_monitor.append_ui_event_log", Mock())

    await manager.monitor_loop()

    manager.restart_stack.assert_awaited_once_with(stack)
    assert manager.save_stacks.call_count == 3


def test_save_stacks_logs_yaml_store_error(
    monkeypatch: pytest.MonkeyPatch,
    caplog: pytest.LogCaptureFixture,
) -> None:
    """Log typed persistence failures without raising them to callers."""
    manager = PortMonitorStackManager.__new__(PortMonitorStackManager)
    manager.stacks = [PortMonitorStack("stack", "primary", 8000, [])]
    manager._config_loaded = True

    def fail_write(*_args: object, **_kwargs: object) -> None:
        raise YamlStoreError("disk unavailable")

    monkeypatch.setattr(port_monitor, "write_yaml_file", fail_write)

    with caplog.at_level(logging.ERROR, logger=port_monitor.__name__):
        manager.save_stacks()

    assert "Failed to save stacks: disk unavailable" in caplog.text


def test_save_stacks_propagates_serialization_programming_error() -> None:
    """Do not hide programming errors while constructing persisted stack data."""
    manager = PortMonitorStackManager.__new__(PortMonitorStackManager)
    manager._config_loaded = True

    class InvalidStack:
        @property
        def name(self) -> str:
            raise RuntimeError("broken stack serialization")

    manager.stacks = [InvalidStack()]  # type: ignore[list-item]

    with pytest.raises(RuntimeError, match="broken stack serialization"):
        manager.save_stacks()


@pytest.mark.asyncio
async def test_notification_failure_does_not_prevent_monitor_restart(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Continue the failed-port recovery path when notification delivery raises."""
    manager = PortMonitorStackManager.__new__(PortMonitorStackManager)
    stack = PortMonitorStack("failed", "primary", 8000, [], interval=0)
    manager.stacks = [stack]
    manager.running = True
    manager.thread = None
    manager._docker_client = None
    manager._last_warning_times = {}
    manager.check_port = Mock(side_effect=[True, False])
    manager.save_stacks = Mock()
    manager.restart_stack = AsyncMock()

    async def stop_after_cycle(_seconds: float) -> None:
        manager.running = False

    monkeypatch.setattr("backend.port_monitor.asyncio.sleep", stop_after_cycle)
    monkeypatch.setattr("backend.port_monitor.append_ui_event_log", Mock())
    monkeypatch.setattr(
        notifications_backend,
        "notify_event",
        AsyncMock(side_effect=RuntimeError("notification config failed")),
    )

    await manager.monitor_loop()

    manager.restart_stack.assert_awaited_once_with(stack)
