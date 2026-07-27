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
    monkeypatch.setattr(
        app, "request_automation_shutdown", lambda: events.append("automation-stop")
    )
    monkeypatch.setattr(app, "close_connection", lambda: events.append("db-close"))

    async def run_lifespan() -> None:
        with pytest.raises(RuntimeError, match="startup failed"):
            async with app.app_lifespan(app.app):
                pytest.fail("startup failure must not yield")

    asyncio.run(run_lifespan())
    assert events == [
        "monitor-start",
        "scheduler-start",
        "monitor-stop",
        "automation-stop",
        "db-close",
    ]


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
    monkeypatch.setattr(
        app, "request_automation_shutdown", lambda: events.append("automation-stop")
    )
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
        "automation-stop",
        "scheduler-stop:True",
        "db-close",
    ]


@pytest.mark.parametrize(
    ("failing_cleanup", "expected_events"),
    [
        (
            "monitor-stop",
            ["monitor-stop", "automation-stop", "scheduler-stop:True", "db-close"],
        ),
        (
            "automation-stop",
            ["monitor-stop", "automation-stop", "scheduler-stop:True", "db-close"],
        ),
        (
            "scheduler-stop:True",
            ["monitor-stop", "automation-stop", "scheduler-stop:True", "db-close"],
        ),
    ],
)
def test_lifespan_runs_later_cleanup_after_teardown_failure(
    monkeypatch: pytest.MonkeyPatch,
    failing_cleanup: str,
    expected_events: list[str],
) -> None:
    """Run all later cleanup steps while propagating a teardown failure."""
    events: list[str] = []

    def record(event: str) -> None:
        """Record a cleanup step and fail at the configured boundary."""
        events.append(event)
        if event == failing_cleanup:
            raise RuntimeError(f"{event} failed")

    async def initialize() -> None:
        """Initialize the scheduler test double."""

    monkeypatch.setattr(app, "start_port_monitor_manager", lambda: None)
    monkeypatch.setattr(app, "initialize_scheduler", initialize)
    monkeypatch.setattr(
        app,
        "scheduler",
        type(
            "SchedulerStub",
            (),
            {"running": True, "shutdown": lambda _self, *, wait: record(f"scheduler-stop:{wait}")},
        )(),
    )
    monkeypatch.setattr(app.port_monitor_manager, "stop", lambda: record("monitor-stop"))
    monkeypatch.setattr(app, "request_automation_shutdown", lambda: record("automation-stop"))
    monkeypatch.setattr(app, "close_connection", lambda: record("db-close"))

    async def run_lifespan() -> None:
        """Enter and exit the application lifespan."""
        with pytest.raises(RuntimeError, match=f"{failing_cleanup} failed"):
            async with app.app_lifespan(app.app):
                pass

    asyncio.run(run_lifespan())
    assert events == expected_events
