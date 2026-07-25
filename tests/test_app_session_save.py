"""API regressions for session persistence outcomes."""

from pathlib import Path
from typing import Any

from fastapi import HTTPException
import pytest

from backend import app as app_module, config
from backend.config import SaveSessionResult


class _JsonRequest:
    """Minimal request double providing an asynchronous JSON body."""

    async def json(self) -> dict[str, Any]:
        """Return a stale existing-session save payload."""
        return {"label": "Retired", "old_label": "Retired", "mam": {"mam_id": "new"}}


class _PayloadRequest:
    """Minimal request double returning a supplied payload."""

    def __init__(self, payload: dict[str, Any]) -> None:
        """Store the JSON payload."""
        self._payload = payload

    async def json(self) -> dict[str, Any]:
        """Return the stored payload."""
        return self._payload


@pytest.mark.asyncio
async def test_api_stale_save_returns_conflict_without_side_effects(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Reject a retired-session update before events, jobs, or integrations run."""
    side_effects: list[str] = []
    monkeypatch.setattr(app_module, "load_session", lambda label: {})
    monkeypatch.setattr(app_module, "get_session_path", lambda label: "/missing/session.yaml")
    monkeypatch.setattr(
        app_module,
        "save_session",
        lambda cfg, old_label=None: SaveSessionResult.STALE,
    )
    monkeypatch.setattr(
        app_module,
        "clear_ui_event_log_for_session",
        lambda label: side_effects.append("clear"),
    )
    monkeypatch.setattr(
        app_module,
        "append_ui_event_log",
        lambda event: side_effects.append("event"),
    )
    monkeypatch.setattr(
        app_module,
        "register_session_job",
        lambda label: side_effects.append("scheduler"),
    )

    async def record_integration_sync(*args: Any) -> None:
        """Record an integration call that must not occur."""
        side_effects.append("integration")

    monkeypatch.setattr(app_module, "_sync_integrations_if_mam_id_changed", record_integration_sync)

    with pytest.raises(HTTPException) as raised:
        await app_module.api_save_session(_JsonRequest())  # type: ignore[arg-type]

    assert raised.value.status_code == 409
    assert side_effects == []


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("is_new", "expected_event", "expected_branch_side_effect"),
    [
        (True, "session_created", "clear"),
        (False, "session_saved", None),
    ],
)
async def test_api_save_persists_once_before_create_or_update_side_effects(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
    is_new: bool,
    expected_event: str,
    expected_branch_side_effect: str | None,
) -> None:
    """Persist once and emit the branch-specific event for creates and updates."""
    session_path = tmp_path / "session-example.yaml"
    if not is_new:
        session_path.touch()

    calls: list[str] = []
    saved_configs: list[tuple[dict[str, Any], str | None]] = []
    monkeypatch.setattr(app_module, "load_session", lambda label: {})
    monkeypatch.setattr(app_module, "get_session_path", lambda label: session_path)

    def record_save(
        cfg: dict[str, Any],
        old_label: str | None = None,
    ) -> SaveSessionResult:
        """Record the persistence call without writing to disk."""
        calls.append("save")
        saved_configs.append((cfg, old_label))
        return SaveSessionResult.SAVED

    monkeypatch.setattr(app_module, "save_session", record_save)
    monkeypatch.setattr(
        app_module,
        "clear_ui_event_log_for_session",
        lambda label: calls.append("clear"),
    )
    monkeypatch.setattr(
        app_module,
        "append_ui_event_log",
        lambda event: calls.append(f"event:{event['event']}"),
    )
    monkeypatch.setattr(
        app_module,
        "register_session_job",
        lambda label: calls.append("scheduler"),
    )

    async def record_integration_sync(*args: Any) -> None:
        """Record the integration check following persistence."""
        calls.append("integration")

    monkeypatch.setattr(app_module, "_sync_integrations_if_mam_id_changed", record_integration_sync)

    payload = {
        "label": "Example",
        "old_label": None if is_new else "Example",
        "mam": {"mam_id": "secret"},
    }
    result = await app_module.api_save_session(_PayloadRequest(payload))  # type: ignore[arg-type]

    assert result == {"success": True}
    assert saved_configs == [(payload, payload["old_label"])]
    assert calls.count("save") == 1
    assert calls.index("save") < calls.index(f"event:{expected_event}")
    assert calls.count("clear") == (1 if expected_branch_side_effect == "clear" else 0)
    assert calls[-2:] == ["scheduler", "integration"]


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "label", ["../outside", "nested/session", r"nested\\session", "nul\x00label"]
)
async def test_api_rejects_unsafe_label_without_persistence_artifacts(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
    label: str,
) -> None:
    """Return a client error before creating nested, outside, or transaction files."""
    monkeypatch.setattr(config, "CONFIG_DIR", tmp_path)
    monkeypatch.setattr(app_module, "get_session_path", config.get_session_path)

    with pytest.raises(HTTPException) as raised:
        await app_module.api_save_session(  # type: ignore[arg-type]
            _PayloadRequest({"label": label, "old_label": label, "mam": {"mam_id": "secret"}})
        )

    assert raised.value.status_code == 400
    assert not list(tmp_path.iterdir())
    assert not (tmp_path.parent / "session-outside.yaml").exists()


@pytest.mark.asyncio
async def test_api_rejects_label_above_utf8_byte_boundary(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    """Return HTTP 400 before persistence when a label exceeds NAME_MAX."""
    monkeypatch.setattr(config, "CONFIG_DIR", tmp_path)
    monkeypatch.setattr(app_module, "get_session_path", config.get_session_path)

    with pytest.raises(HTTPException) as raised:
        await app_module.api_save_session(  # type: ignore[arg-type]
            _PayloadRequest({"label": "é" * 120, "mam": {"mam_id": "secret"}})
        )

    assert raised.value.status_code == 400
    assert not list(tmp_path.iterdir())
