"""Focused backend port-monitor persistence tests."""

import asyncio
from collections.abc import Callable
import logging
from pathlib import Path
import threading
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
    monkeypatch.setattr(manager, "check_port", lambda *_args: True)
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


def test_stop_bounds_join_for_blocked_worker(
    monkeypatch: pytest.MonkeyPatch, caplog: pytest.LogCaptureFixture
) -> None:
    """A worker blocked in Docker cannot indefinitely block app shutdown."""
    manager = port_monitor.PortMonitorStackManager()
    manager.running = True
    release_worker = threading.Event()
    manager.thread = threading.Thread(target=release_worker.wait, daemon=True)
    manager.thread.start()
    monkeypatch.setattr(port_monitor, "PORT_MONITOR_STOP_TIMEOUT_SECONDS", 0.01)

    try:
        with caplog.at_level(logging.WARNING):
            manager.stop()

        assert not manager.running
        assert manager.thread.is_alive()
        assert "continuing shutdown" in caplog.text
    finally:
        release_worker.set()
        manager.thread.join(timeout=1)


def test_start_does_not_replace_blocked_stopping_worker(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """A timed-out stop prevents reload and replacement until worker exit."""
    manager = port_monitor.PortMonitorStackManager()
    manager.running = True
    release_worker = threading.Event()
    worker_started = threading.Event()

    def blocked_worker() -> None:
        worker_started.set()
        release_worker.wait()

    original_thread = threading.Thread(target=blocked_worker, daemon=True)
    manager.thread = original_thread
    original_thread.start()
    assert worker_started.wait(timeout=1)
    load_stacks = Mock()
    monkeypatch.setattr(manager, "load_stacks", load_stacks)
    monkeypatch.setattr(port_monitor, "PORT_MONITOR_STOP_TIMEOUT_SECONDS", 0.01)

    try:
        manager.stop()
        manager.start()

        assert manager.thread is original_thread
        assert original_thread.is_alive()
        load_stacks.assert_not_called()
    finally:
        release_worker.set()
        original_thread.join(timeout=1)


def test_shutdown_event_replacement_and_restart_registration_share_lock(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Start cannot replace the shutdown event during restart registration."""
    manager = port_monitor.PortMonitorStackManager()
    registration_holds_lock = threading.Event()
    release_registration = threading.Event()
    registered = threading.Event()

    class BlockingEvent:
        def is_set(self) -> bool:
            registration_holds_lock.set()
            assert release_registration.wait(timeout=1)
            return False

    manager._shutdown_event = BlockingEvent()  # type: ignore[assignment]
    monkeypatch.setattr(manager, "load_stacks", lambda: None)
    monkeypatch.setattr(manager, "_run_monitor_loop", lambda: None)

    async def register_restart() -> None:
        task = manager._register_restart_task()
        assert task is asyncio.current_task()
        registered.set()
        manager._unregister_restart_task(task)

    registration_thread = threading.Thread(target=lambda: asyncio.run(register_restart()))
    start_thread = threading.Thread(target=manager.start)
    registration_thread.start()
    assert registration_holds_lock.wait(timeout=1)
    original_event = manager._shutdown_event
    start_thread.start()
    start_thread.join(timeout=0.05)
    assert start_thread.is_alive()
    assert manager._shutdown_event is original_event

    release_registration.set()
    registration_thread.join(timeout=1)
    start_thread.join(timeout=1)

    assert registered.is_set()
    assert not registration_thread.is_alive()
    assert not start_thread.is_alive()
    assert manager._shutdown_event is not original_event


def test_concurrent_stop_signals_worker_published_by_start(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Stop cannot slip between shutdown-event reset and worker publication."""
    manager = port_monitor.PortMonitorStackManager()
    start_publishing = threading.Event()

    class TrackingWorkerLock:
        def __init__(self) -> None:
            self._lock = threading.Lock()
            self._start_acquisitions = 0

        def __enter__(self) -> None:
            self._lock.acquire()
            if threading.current_thread().name == "start":
                self._start_acquisitions += 1
                if self._start_acquisitions == 2:
                    start_publishing.set()

        def __exit__(self, *_args: object) -> None:
            self._lock.release()

    manager._worker_lock = TrackingWorkerLock()  # type: ignore[assignment]
    monkeypatch.setattr(manager, "load_stacks", lambda: None)

    def wait_for_shutdown() -> None:
        manager._shutdown_event.wait()

    monkeypatch.setattr(manager, "_run_monitor_loop", wait_for_shutdown)

    manager._restart_tasks_lock.acquire()
    start_thread = threading.Thread(target=manager.start, name="start")
    stop_thread = threading.Thread(target=manager.stop, name="stop")
    try:
        start_thread.start()
        assert start_publishing.wait(timeout=1)
        stop_thread.start()
        stop_thread.join(timeout=0.05)
        assert stop_thread.is_alive()
    finally:
        manager._restart_tasks_lock.release()
        start_thread.join(timeout=1)
        stop_thread.join(timeout=1)

    assert not start_thread.is_alive()
    assert not stop_thread.is_alive()
    assert manager._shutdown_event.is_set()
    assert not manager.running
    assert manager.thread is None


@pytest.mark.parametrize("shutdown_during_check", [False, True])
def test_initial_checks_skip_state_and_save_after_shutdown(
    monkeypatch: pytest.MonkeyPatch, shutdown_during_check: bool
) -> None:
    """Shutdown before or during an initial check prevents late persistence."""
    manager = port_monitor.PortMonitorStackManager()
    manager.running = shutdown_during_check
    stack = port_monitor.PortMonitorStack("x", "container", 80, [])
    manager.stacks = [stack]
    check_port = Mock(return_value=True)

    if shutdown_during_check:

        def check_then_stop(_container: str, _port: int) -> bool:
            manager.running = False
            return True

        check_port.side_effect = check_then_stop

    save = Mock()
    monkeypatch.setattr(manager, "check_port", check_port)
    monkeypatch.setattr(manager, "_save_stacks_best_effort", save)

    asyncio.run(manager.monitor_loop())

    assert check_port.call_count == int(shutdown_during_check)
    assert stack.last_checked == 0.0
    assert stack.last_result is False
    assert stack.status == "Unknown"
    save.assert_not_called()


@pytest.mark.parametrize(
    "failure_case",
    ["notification", "background-save"],
    ids=["notification-failure-preserves-persistence", "background-save-failure"],
)
def test_monitor_cycle_failure_does_not_block_restart(
    monkeypatch: pytest.MonkeyPatch, failure_case: str
) -> None:
    """Contain optional notification and persistence failures during a failed port check."""
    manager = port_monitor.PortMonitorStackManager()
    manager.running = True
    stack = port_monitor.PortMonitorStack("x", "container", 80, [], 0)
    manager.stacks = [stack]
    monkeypatch.setattr(manager, "check_port", lambda *_args: False)
    restart = AsyncMock(return_value=True)
    monkeypatch.setattr(manager, "restart_stack", restart)
    monkeypatch.setattr(port_monitor, "append_ui_event_log", lambda _event: None)
    saves: list[bool] = []
    if failure_case == "notification":
        manager._config_loaded = True
        monkeypatch.setattr(manager, "save_stacks", lambda: saves.append(True))
        monkeypatch.setattr(
            notifications_backend,
            "notify_event",
            AsyncMock(side_effect=RuntimeError("invalid notify config")),
        )
    else:
        monkeypatch.setattr(
            manager,
            "save_stacks",
            lambda: (_ for _ in ()).throw(YamlStoreError()),
        )
        monkeypatch.setattr(port_monitor, "safe_notify_event", AsyncMock())

    async def stop_after_cycle(_delay: float) -> None:
        manager.running = False

    monkeypatch.setattr(port_monitor.asyncio, "sleep", stop_after_cycle)
    asyncio.run(manager.monitor_loop())

    restart.assert_awaited_once_with(stack, cancel_on_shutdown=True)
    if failure_case == "notification":
        assert len(saves) == 2


def test_monitor_exits_without_persisting_after_cancelled_restart(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """A cancelled background restart cannot reach the cycle's final save."""
    manager = port_monitor.PortMonitorStackManager()
    manager.running = True
    stack = port_monitor.PortMonitorStack("x", "container", 80, [], 0)
    manager.stacks = [stack]
    monkeypatch.setattr(manager, "check_port", lambda *_args: False)
    monkeypatch.setattr(port_monitor, "append_ui_event_log", lambda _event: None)
    monkeypatch.setattr(port_monitor, "safe_notify_event", AsyncMock())
    restart = AsyncMock(return_value=False)
    save = Mock()
    monkeypatch.setattr(manager, "restart_stack", restart)
    monkeypatch.setattr(manager, "_save_stacks_best_effort", save)

    asyncio.run(manager.monitor_loop())

    restart.assert_awaited_once_with(stack, cancel_on_shutdown=True)
    save.assert_called_once_with()


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

    assert asyncio.run(manager.restart_stack(stack))
    recheck.assert_called_once_with("x")


def test_restart_stops_side_effects_when_shutdown_occurs_during_polling(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Shutdown during primary polling prevents all completion side effects."""
    manager = port_monitor.PortMonitorStackManager()
    stack = port_monitor.PortMonitorStack("x", "primary", 80, ["secondary"])
    manager.stacks = [stack]
    restart_container = Mock(return_value=True)
    check_port = Mock(return_value=False)
    events = Mock()
    notify = AsyncMock()
    recheck = Mock(return_value=True)
    save = Mock()

    def stop_during_check(*args: object) -> bool:
        manager.stop()
        return check_port(*args)

    monkeypatch.setattr(manager, "restart_container", restart_container)
    monkeypatch.setattr(manager, "check_port", stop_during_check)
    monkeypatch.setattr(manager, "recheck_stack", recheck)
    monkeypatch.setattr(manager, "_save_stacks_best_effort", save)
    monkeypatch.setattr(port_monitor, "append_ui_event_log", events)
    monkeypatch.setattr(port_monitor, "safe_notify_event", notify)

    assert not asyncio.run(manager.restart_stack(stack, cancel_on_shutdown=True))

    restart_container.assert_called_once_with("primary")
    check_port.assert_called_once_with("primary", 80)
    events.assert_called_once()
    notify.assert_not_awaited()
    recheck.assert_not_called()
    save.assert_not_called()


def test_restart_retry_wait_is_interrupted_by_shutdown(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Shutdown cancels a background retry without waiting five seconds."""
    manager = port_monitor.PortMonitorStackManager()
    stack = port_monitor.PortMonitorStack("x", "primary", 80, [])
    monkeypatch.setattr(manager, "restart_container", lambda _name: True)
    monkeypatch.setattr(manager, "check_port", lambda *_args: False)
    monkeypatch.setattr(port_monitor, "append_ui_event_log", lambda _event: None)

    async def run_restart() -> None:
        task = asyncio.create_task(manager.restart_stack(stack, cancel_on_shutdown=True))
        await asyncio.sleep(0)
        manager.stop()
        assert not await asyncio.wait_for(task, timeout=1)
        assert not manager._restart_tasks

    asyncio.run(run_restart())


def test_restart_propagates_external_cancellation(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Propagate cancellation not initiated by manager shutdown."""
    manager = port_monitor.PortMonitorStackManager()
    stack = port_monitor.PortMonitorStack("x", "primary", 80, [])
    monkeypatch.setattr(manager, "restart_container", lambda _name: True)
    monkeypatch.setattr(port_monitor, "append_ui_event_log", lambda _event: None)
    monkeypatch.setattr(
        port_monitor.asyncio,
        "sleep",
        AsyncMock(side_effect=asyncio.CancelledError),
    )

    with pytest.raises(asyncio.CancelledError):
        asyncio.run(manager.restart_stack(stack, cancel_on_shutdown=True))

    assert not manager._restart_tasks


def test_api_restart_omits_completion_events_after_shutdown_cancellation(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """The API worker must not report completion after restart cancellation."""
    stack = port_monitor.PortMonitorStack("x", "primary", 80, [])
    restart = AsyncMock(return_value=False)
    events = Mock()

    def immediate_thread(*, target: Callable[[], None], daemon: bool) -> Mock:
        assert daemon
        thread = Mock()
        thread.start.side_effect = target
        return thread

    monkeypatch.setattr(
        api_port_monitor.port_monitor_manager,
        "get_stack",
        lambda _name: stack,
    )
    monkeypatch.setattr(api_port_monitor.port_monitor_manager, "restart_stack", restart)
    monkeypatch.setattr(api_port_monitor, "append_ui_event_log", events)
    monkeypatch.setattr(api_port_monitor.threading, "Thread", immediate_thread)

    assert api_port_monitor.restart_stack("x") == {"success": True}
    restart.assert_awaited_once_with(stack, cancel_on_shutdown=True)
    assert [call.args[0]["event"] for call in events.call_args_list] == [
        "port_monitor_status",
        "port_monitor_restart_started",
    ]


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
