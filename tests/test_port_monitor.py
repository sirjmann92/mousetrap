"""Tests for port monitor persistence behavior."""

from __future__ import annotations

from unittest.mock import AsyncMock, Mock

import pytest

from backend import port_monitor
from backend.port_monitor import PortMonitorStack, PortMonitorStackManager
from backend.yaml_store import YamlStoreError


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
    manager.running = False
    manager.thread = None
    manager._docker_client = None
    manager._last_warning_times = {}
    manager.check_port = Mock(side_effect=[False, True, False, True])

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
    monkeypatch.setattr("backend.port_monitor.notify_event", AsyncMock())
    monkeypatch.setattr("backend.port_monitor.append_ui_event_log", Mock())

    await manager.monitor_loop()

    assert manager.save_stacks.call_count == 3
    assert saved_states == [(False, 2), (True, 3), (True, 3)]
    assert healthy_stack.status == "OK"


@pytest.mark.asyncio
async def test_monitor_cycle_saves_due_stack_before_restart_transition(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Persist the due check before the restart transition is persisted."""
    manager = PortMonitorStackManager.__new__(PortMonitorStackManager)
    stack = PortMonitorStack("failed", "primary", 8000, [], interval=0)
    manager.stacks = [stack]
    manager.running = False
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
    monkeypatch.setattr("backend.port_monitor.notify_event", AsyncMock())
    monkeypatch.setattr("backend.port_monitor.append_ui_event_log", Mock())

    await manager.monitor_loop()

    manager.restart_stack.assert_awaited_once_with(stack)
    assert manager.save_stacks.call_count == 3
