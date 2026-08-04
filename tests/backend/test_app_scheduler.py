"""Focused backend scheduler persistence tests."""

import asyncio
import logging
import threading

import pytest

from backend import app
from backend.yaml_store import YamlStoreError


def test_initialize_scheduler_resets_automation_shutdown_before_start(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """A new scheduler lifecycle accepts automation before jobs can run."""
    events: list[str] = []

    async def initial_checks() -> None:
        events.append("initial-checks")

    class SchedulerStub:
        def add_job(self, *_args: object, **_kwargs: object) -> None:
            events.append("job-added")

        def start(self) -> None:
            events.append("scheduler-start")

    monkeypatch.setattr(app, "reset_automation_shutdown", lambda: events.append("reset"))
    monkeypatch.setattr(app, "reset_all_last_check_times", lambda: events.append("times-reset"))
    monkeypatch.setattr(app, "run_initial_session_checks", initial_checks)
    monkeypatch.setattr(app, "register_all_session_jobs", lambda: events.append("sessions-added"))
    monkeypatch.setattr(app, "scheduler", SchedulerStub())

    asyncio.run(app.initialize_scheduler())

    assert events == [
        "reset",
        "times-reset",
        "initial-checks",
        "sessions-added",
        "job-added",
        "scheduler-start",
    ]


def test_sync_automation_jobs_does_not_cancel_in_flight_work(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Aggregate automation remains alive until in-flight work completes."""
    started = threading.Event()
    release = threading.Event()
    completed = threading.Event()

    async def blocked_automation() -> None:
        started.set()
        await asyncio.to_thread(release.wait)
        completed.set()

    monkeypatch.setattr(app, "run_all_automation_jobs", blocked_automation)

    worker = threading.Thread(target=app.sync_automation_jobs)
    try:
        worker.start()
        assert started.wait(timeout=1)
        worker.join(timeout=0.05)
        assert worker.is_alive()
    finally:
        release.set()
        worker.join(timeout=1)

    assert not worker.is_alive()
    assert completed.is_set()


def test_register_all_session_jobs_skips_malformed_session(
    monkeypatch: pytest.MonkeyPatch, caplog: pytest.LogCaptureFixture
) -> None:
    """Continue registering jobs after one session fails YAML loading."""
    registered: list[str] = []

    def register(label: str) -> None:
        if label == "broken":
            raise YamlStoreError("malformed")
        registered.append(label)

    monkeypatch.setattr(app, "list_sessions", lambda: ["first", "broken", "last"])
    monkeypatch.setattr(app, "register_session_job", register)
    with caplog.at_level(logging.ERROR):
        app.register_all_session_jobs()
    assert registered == ["first", "last"]
    assert "broken" in caplog.text
