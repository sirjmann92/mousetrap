"""Regression tests for application-owned service lifecycle ordering."""

import asyncio

import pytest

from backend import app


def test_lifespan_cleans_up_when_scheduler_initialization_fails(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """A partial startup still stops the monitor and closes persistence."""
    events: list[str] = []
    monkeypatch.setattr(app, "start_port_monitor_manager", lambda: events.append("monitor-start"))

    async def fail_scheduler() -> None:
        events.append("scheduler-start")
        raise RuntimeError("startup failed")

    monkeypatch.setattr(app, "initialize_scheduler", fail_scheduler)
    monkeypatch.setattr(app, "scheduler", type("SchedulerStub", (), {"running": False})())
    monkeypatch.setattr(app.port_monitor_manager, "stop", lambda: events.append("monitor-stop"))
    monkeypatch.setattr(app, "close_connection", lambda: events.append("db-close"))

    async def run_lifespan() -> None:
        with pytest.raises(RuntimeError, match="startup failed"):
            async with app.app_lifespan(app.app):
                pytest.fail("startup failure must not yield")

    asyncio.run(run_lifespan())
    assert events == ["monitor-start", "scheduler-start", "monitor-stop", "db-close"]


def test_lifespan_stops_monitor_before_waiting_for_scheduler(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Signal the monitor before draining jobs and closing persistence."""
    events: list[str] = []
    monkeypatch.setattr(app, "start_port_monitor_manager", lambda: events.append("monitor-start"))

    async def initialize() -> None:
        events.append("scheduler-start")

    monkeypatch.setattr(app, "initialize_scheduler", initialize)
    monkeypatch.setattr(
        app,
        "scheduler",
        type(
            "SchedulerStub",
            (),
            {
                "running": True,
                "shutdown": lambda _self, *, wait: events.append(f"scheduler-stop:{wait}"),
            },
        )(),
    )
    monkeypatch.setattr(app.port_monitor_manager, "stop", lambda: events.append("monitor-stop"))
    monkeypatch.setattr(app, "close_connection", lambda: events.append("db-close"))

    async def run_lifespan() -> None:
        async with app.app_lifespan(app.app):
            events.append("serving")

    asyncio.run(run_lifespan())
    assert events == [
        "monitor-start",
        "scheduler-start",
        "serving",
        "monitor-stop",
        "scheduler-stop:True",
        "db-close",
    ]
