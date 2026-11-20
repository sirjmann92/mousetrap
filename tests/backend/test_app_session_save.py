"""Focused backend API session-persistence tests."""

import asyncio
import json
from pathlib import Path
from typing import Any

import pytest
from starlette.requests import Request
from starlette.types import Message

from backend import app, config


def _no_stored_session(_label: str) -> dict[str, Any]:
    """Stand in for ``load_session`` when nothing is stored under the label."""
    return {}


def _discard_event(_event: dict[str, Any]) -> None:
    """Stand in for ``append_ui_event_log`` so no event is written."""


def _skip_job_registration(_label: str) -> None:
    """Stand in for ``register_session_job`` so saving a session schedules nothing."""


def json_request(payload: dict[str, Any]) -> Request:
    """Build a save-session request carrying the payload as its JSON body."""

    async def receive() -> Message:
        """Deliver the whole encoded body as a single ASGI message."""
        return {"type": "http.request", "body": json.dumps(payload).encode(), "more_body": False}

    return Request(
        {"type": "http", "method": "POST", "path": "/api/session/save", "headers": []},
        receive,
    )


def test_save_persists_once_before_side_effects(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    """Persist exactly once before event, scheduler, and integration work."""
    calls: list[str] = []
    path = tmp_path / "session-example.yaml"

    def session_path(_label: str) -> Path:
        """Place the session at the path under test."""
        return path

    def save(*_a: object, **_k: object) -> None:
        """Record the save test double."""
        calls.append("save")

    def clear(_label: str) -> None:
        """Record the event-log clear test double."""
        calls.append("clear")

    def log_event(_event: dict[str, Any]) -> None:
        """Record the event-log append test double."""
        calls.append("event")

    def register_job(_label: str) -> None:
        """Record the job registration test double."""
        calls.append("job")

    monkeypatch.setattr(app, "load_session", _no_stored_session)
    monkeypatch.setattr(app, "get_session_path", session_path)
    monkeypatch.setattr(app, "save_session", save)
    monkeypatch.setattr(app, "clear_ui_event_log_for_session", clear)
    monkeypatch.setattr(app, "append_ui_event_log", log_event)
    monkeypatch.setattr(app, "register_session_job", register_job)

    async def sync(*_args: Any) -> None:
        """Record the integration sync test double."""
        calls.append("sync")

    monkeypatch.setattr(app, "_sync_integrations_if_mam_id_changed", sync)
    result = asyncio.run(
        app.api_save_session(json_request({"label": "Example", "mam": {"mam_id": "id"}}))
    )
    assert result == {"success": True}
    assert calls == ["save", "clear", "event", "job", "sync"]


def test_save_replaces_corrupt_existing_session(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    """Valid UI data replaces corrupt YAML without preserving invalid fields."""
    monkeypatch.setattr(config, "CONFIG_DIR", tmp_path)
    corrupt = config.get_session_path("Existing")
    corrupt.write_text("mam: [unterminated\n", encoding="utf-8")
    monkeypatch.setattr(app, "get_session_path", config.get_session_path)
    monkeypatch.setattr(app, "append_ui_event_log", _discard_event)
    monkeypatch.setattr(app, "register_session_job", _skip_job_registration)

    async def sync(*_args: Any) -> None:
        """Provide a no-op integration sync test double."""
        return

    monkeypatch.setattr(app, "_sync_integrations_if_mam_id_changed", sync)
    result = asyncio.run(
        app.api_save_session(
            json_request(
                {
                    "label": "Existing",
                    "old_label": "Existing",
                    "mam": {"mam_id": "new"},
                }
            )
        )
    )

    assert result == {"success": True}
    assert config.load_session("Existing")["mam"]["mam_id"] == "new"


def test_post_save_side_effect_failure_returns_success(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    """Report success once persistence committed even if later work fails."""
    calls: list[str] = []

    def session_path(_label: str) -> Path:
        """Place the session inside the temporary directory."""
        return tmp_path / "session.yaml"

    def save(*_a: object, **_k: object) -> None:
        """Record the save test double."""
        calls.append("save")

    monkeypatch.setattr(app, "load_session", _no_stored_session)
    monkeypatch.setattr(app, "get_session_path", session_path)
    monkeypatch.setattr(app, "save_session", save)

    def fail_clear(_label: str) -> None:
        """Simulate an unavailable event log after persistence."""
        calls.append("clear")
        raise RuntimeError("event log unavailable")

    monkeypatch.setattr(app, "clear_ui_event_log_for_session", fail_clear)
    result = asyncio.run(
        app.api_save_session(json_request({"label": "Example", "mam": {"mam_id": "id"}}))
    )
    assert result == {"success": True}
    assert calls == ["save", "clear"]
