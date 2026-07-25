"""Tests for port monitor persistence behavior."""

from __future__ import annotations

from unittest.mock import AsyncMock, Mock

import pytest

from backend.port_monitor import PortMonitorStack, PortMonitorStackManager


@pytest.mark.asyncio
async def test_monitor_cycle_saves_due_stacks_once_after_continue(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Persist all due-stack changes once, including a paused stack's state."""
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

    assert manager.save_stacks.call_count == 2
    assert saved_states == [(False, 2), (True, 3)]
    assert healthy_stack.status == "OK"


@pytest.mark.asyncio
async def test_monitor_cycle_does_not_save_again_after_last_stack_restart(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Do not duplicate the explicit restart save at the end of the cycle."""
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
    assert manager.save_stacks.call_count == 2
