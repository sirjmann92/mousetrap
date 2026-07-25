"""Focused scheduler persistence tests."""

import logging

import pytest

from backend import app
from backend.yaml_store import YamlStoreError


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
