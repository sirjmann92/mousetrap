"""Focused port-monitor persistence tests."""

import asyncio
from pathlib import Path
from unittest.mock import AsyncMock

import pytest

from backend import notifications_backend, port_monitor
from backend.yaml_store import YamlStoreError


def test_constructor_does_not_load(monkeypatch: pytest.MonkeyPatch) -> None:
    """Construction has no configuration I/O side effect."""
    monkeypatch.setattr(
        port_monitor.PortMonitorStackManager,
        "load_stacks",
        lambda _self: pytest.fail("must not load"),
    )
    manager = port_monitor.PortMonitorStackManager()
    assert manager.stacks == []
    assert not manager._config_loaded


def test_start_contains_invalid_config_without_overwrite(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    """Invalid persisted YAML disables startup and remains untouched."""
    path = tmp_path / "port_monitor.yaml"
    contents = "broken: [\n"
    path.write_text(contents, encoding="utf-8")
    monkeypatch.setattr(port_monitor, "PORT_MONITOR_CONFIG_PATH", path)
    manager = port_monitor.PortMonitorStackManager()
    manager.start()
    assert not manager.running
    assert not manager._config_loaded
    assert path.read_text(encoding="utf-8") == contents
    with pytest.raises(YamlStoreError):
        manager.add_stack("x", "container", 80, [])


def test_loaded_manager_writes_with_shared_store(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    """A successfully loaded configuration can be mutated and persisted."""
    path = tmp_path / "port_monitor.yaml"
    monkeypatch.setattr(port_monitor, "PORT_MONITOR_CONFIG_PATH", path)
    manager = port_monitor.PortMonitorStackManager()
    manager.load_stacks()
    manager.add_stack("x", "container", 80, [])
    assert "name: x" in path.read_text(encoding="utf-8")


def test_save_stacks_propagates_write_failure(monkeypatch: pytest.MonkeyPatch) -> None:
    """Expose persistence failure to API mutations and the monitor worker."""
    manager = port_monitor.PortMonitorStackManager()
    manager._config_loaded = True

    def fail_write(_path: Path, _data: object) -> None:
        raise YamlStoreError("disk full")

    monkeypatch.setattr(port_monitor, "write_yaml_file", fail_write)
    with pytest.raises(YamlStoreError, match="disk full"):
        manager.save_stacks()


def test_run_monitor_loop_logs_reraises_and_clears_running(
    monkeypatch: pytest.MonkeyPatch, caplog: pytest.LogCaptureFixture
) -> None:
    """Expose unexpected worker failures while releasing running state."""
    manager = port_monitor.PortMonitorStackManager()
    manager.running = True
    monitor_loop = AsyncMock(side_effect=RuntimeError("worker failed"))
    monkeypatch.setattr(manager, "monitor_loop", monitor_loop)

    with pytest.raises(RuntimeError, match="worker failed"):
        manager._run_monitor_loop()

    monitor_loop.assert_awaited_once_with()
    assert not manager.running
    assert "Monitor loop terminated unexpectedly" in caplog.text


def test_notification_failure_does_not_block_restart_or_persistence(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Contain optional notification failure during a failed port check."""
    manager = port_monitor.PortMonitorStackManager()
    manager._config_loaded = True
    manager.running = True
    stack = port_monitor.PortMonitorStack("x", "container", 80, [], 0)
    manager.stacks = [stack]
    monkeypatch.setattr(manager, "check_port", lambda *_args: False)
    restart = AsyncMock()
    monkeypatch.setattr(manager, "restart_stack", restart)
    monkeypatch.setattr(port_monitor, "append_ui_event_log", lambda _event: None)
    saves: list[bool] = []
    monkeypatch.setattr(manager, "save_stacks", lambda: saves.append(True))
    monkeypatch.setattr(
        notifications_backend,
        "notify_event",
        AsyncMock(side_effect=RuntimeError("invalid notify config")),
    )

    async def stop_after_cycle(_delay: float) -> None:
        manager.running = False

    monkeypatch.setattr(port_monitor.asyncio, "sleep", stop_after_cycle)
    asyncio.run(manager.monitor_loop())

    restart.assert_awaited_once_with(stack)
    assert len(saves) == 2
