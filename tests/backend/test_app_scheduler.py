"""Focused backend scheduler persistence tests."""

import asyncio
import logging
import threading

import pytest

from backend import app
from backend.yaml_store import YamlStoreError


def test_sync_automation_jobs_times_out_and_cancels(
    monkeypatch: pytest.MonkeyPatch, caplog: pytest.LogCaptureFixture
) -> None:
    """A blocked aggregate automation run is promptly cancelled at timeout."""
    started = threading.Event()
    cancelled = threading.Event()

    async def blocked_automation() -> None:
        started.set()
        try:
            await asyncio.Event().wait()
        finally:
            cancelled.set()

    monkeypatch.setattr(app, "run_all_automation_jobs", blocked_automation)
    monkeypatch.setattr(app, "AUTOMATION_JOB_TIMEOUT_SECONDS", 0.01)

    with caplog.at_level(logging.ERROR):
        worker = threading.Thread(target=app.sync_automation_jobs)
        worker.start()
        assert started.wait(timeout=1)
        worker.join(timeout=1)

    assert not worker.is_alive()
    assert cancelled.is_set()
    assert "timed out after 0.01 seconds and was cancelled" in caplog.text


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
