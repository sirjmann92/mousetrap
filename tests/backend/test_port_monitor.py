"""Focused backend port-monitor persistence tests."""

import asyncio
from pathlib import Path
from unittest.mock import AsyncMock, Mock

import pytest

from backend import api_port_monitor, notifications_backend, port_monitor
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


def test_recheck_updates_status_when_background_save_fails(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Runtime rechecks succeed even when their best-effort save fails."""
    manager = port_monitor.PortMonitorStackManager()
    stack = port_monitor.PortMonitorStack("x", "container", 80, [])
    manager.stacks = [stack]
    monkeypatch.setattr(manager, "check_port", lambda *_args: True)
    monkeypatch.setattr(manager, "save_stacks", lambda: (_ for _ in ()).throw(YamlStoreError()))

    assert manager.recheck_stack("x")
    assert stack.status == "OK"
    assert stack.last_result is True


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


def test_background_save_failure_does_not_block_restart(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """A transient status write failure does not stop the monitor cycle."""
    manager = port_monitor.PortMonitorStackManager()
    manager.running = True
    stack = port_monitor.PortMonitorStack("x", "container", 80, [], 0)
    manager.stacks = [stack]
    monkeypatch.setattr(manager, "check_port", lambda *_args: False)
    monkeypatch.setattr(manager, "save_stacks", lambda: (_ for _ in ()).throw(YamlStoreError()))
    monkeypatch.setattr(port_monitor, "append_ui_event_log", lambda _event: None)
    monkeypatch.setattr(port_monitor, "safe_notify_event", AsyncMock())
    restart = AsyncMock()
    monkeypatch.setattr(manager, "restart_stack", restart)

    async def stop_after_cycle(_delay: float) -> None:
        manager.running = False

    monkeypatch.setattr(port_monitor.asyncio, "sleep", stop_after_cycle)
    asyncio.run(manager.monitor_loop())
    restart.assert_awaited_once_with(stack)


@pytest.mark.parametrize("port_ok", [True, False])
def test_restart_rechecks_once_on_completion_paths(
    monkeypatch: pytest.MonkeyPatch, port_ok: bool
) -> None:
    """Manager-owned restart completion performs exactly one status recheck."""
    manager = port_monitor.PortMonitorStackManager()
    stack = port_monitor.PortMonitorStack("x", "container", 80, ["secondary"])
    manager.stacks = [stack]
    monkeypatch.setattr(manager, "restart_container", lambda _name: True)
    monkeypatch.setattr(manager, "check_port", lambda *_args: port_ok)
    monkeypatch.setattr(manager, "get_docker_client", lambda: None)
    monkeypatch.setattr(port_monitor.asyncio, "sleep", AsyncMock())
    monkeypatch.setattr(port_monitor, "append_ui_event_log", lambda _event: None)
    monkeypatch.setattr(port_monitor, "safe_notify_event", AsyncMock())
    recheck = Mock(return_value=True)
    monkeypatch.setattr(manager, "recheck_stack", recheck)

    asyncio.run(manager.restart_stack(stack))
    recheck.assert_called_once_with("x")


@pytest.mark.parametrize("operation", ["add", "remove"])
def test_config_mutation_rolls_back_on_save_failure(
    monkeypatch: pytest.MonkeyPatch, operation: str
) -> None:
    """Failed strict persistence restores the prior configured stack list."""
    manager = port_monitor.PortMonitorStackManager()
    manager._config_loaded = True
    existing = port_monitor.PortMonitorStack("existing", "container", 80, [])
    manager.stacks = [existing]
    monkeypatch.setattr(manager, "check_port", lambda *_args: True)
    monkeypatch.setattr(manager, "save_stacks", lambda: (_ for _ in ()).throw(YamlStoreError()))

    def mutate() -> None:
        if operation == "add":
            manager.add_stack("new", "other", 81, [])
        else:
            manager.remove_stack("existing")

    with pytest.raises(YamlStoreError):
        mutate()
    assert manager.stacks == [existing]


def test_update_stack_restores_values_on_save_failure(monkeypatch: pytest.MonkeyPatch) -> None:
    """The update endpoint leaves no unpersisted configuration in memory."""
    stack = port_monitor.PortMonitorStack("x", "old", 80, ["secondary"], 60, "1.1.1.1")
    monkeypatch.setattr(api_port_monitor.port_monitor_manager, "get_stack", lambda _name: stack)
    monkeypatch.setattr(
        api_port_monitor.port_monitor_manager,
        "save_stacks",
        lambda: (_ for _ in ()).throw(YamlStoreError()),
    )
    request = api_port_monitor.UpdatePortMonitorStackRequest(
        primary_container="new",
        primary_port=81,
        secondary_containers=[],
        interval=5,
        public_ip="2.2.2.2",
    )

    with pytest.raises(YamlStoreError):
        api_port_monitor.update_stack("x", request)
    assert (stack.primary_container, stack.primary_port, stack.secondary_containers) == (
        "old",
        80,
        ["secondary"],
    )
    assert (stack.interval, stack.public_ip) == (60, "1.1.1.1")
