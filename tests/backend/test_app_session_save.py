"""Focused backend API session-persistence tests."""

import asyncio
from pathlib import Path
from typing import Any

import pytest

from backend import app, config


class JsonRequest:
    """Minimal request double."""

    def __init__(self, payload: dict[str, Any]) -> None:
        """Store the request body."""
        self.payload = payload

    async def json(self) -> dict[str, Any]:
        """Return the configured request body."""
        return self.payload


def test_save_persists_once_before_side_effects(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    """Persist exactly once before event, scheduler, and integration work."""
    calls: list[str] = []
    path = tmp_path / "session-example.yaml"
    monkeypatch.setattr(app, "load_session", lambda _label: {})
    monkeypatch.setattr(app, "get_session_path", lambda _label: path)
    monkeypatch.setattr(app, "save_session", lambda *_a, **_k: calls.append("save"))
    monkeypatch.setattr(app, "clear_ui_event_log_for_session", lambda _label: calls.append("clear"))
    monkeypatch.setattr(app, "append_ui_event_log", lambda _event: calls.append("event"))
    monkeypatch.setattr(app, "register_session_job", lambda _label: calls.append("job"))

    async def sync(*_args: Any) -> None:
        calls.append("sync")

    monkeypatch.setattr(app, "_sync_integrations_if_mam_id_changed", sync)
    result = asyncio.run(
        app.api_save_session(JsonRequest({"label": "Example", "mam": {"mam_id": "id"}}))
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
    monkeypatch.setattr(app, "append_ui_event_log", lambda _event: None)
    monkeypatch.setattr(app, "register_session_job", lambda _label: None)

    async def sync(*_args: Any) -> None:
        return None

    monkeypatch.setattr(app, "_sync_integrations_if_mam_id_changed", sync)
    result = asyncio.run(
        app.api_save_session(
            JsonRequest(
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
    monkeypatch.setattr(app, "load_session", lambda _label: {})
    monkeypatch.setattr(app, "get_session_path", lambda _label: tmp_path / "session.yaml")
    monkeypatch.setattr(app, "save_session", lambda *_a, **_k: calls.append("save"))

    def fail_clear(_label: str) -> None:
        calls.append("clear")
        raise RuntimeError("event log unavailable")

    monkeypatch.setattr(app, "clear_ui_event_log_for_session", fail_clear)
    result = asyncio.run(
        app.api_save_session(JsonRequest({"label": "Example", "mam": {"mam_id": "id"}}))
    )
    assert result == {"success": True}
    assert calls == ["save", "clear"]
