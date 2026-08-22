"""Regression tests for cooperative automation shutdown."""

import asyncio
from datetime import UTC, datetime, tzinfo
import threading
from typing import Self
from unittest.mock import AsyncMock, Mock

import pytest

from backend import automation


def test_shutdown_finishes_current_purchase_and_skips_later_work(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Persist an accepted purchase before stopping later sessions and phases."""
    first_upload_credit: dict[str, object] = {
        "enabled": True,
        "trigger_type": "points",
        "trigger_point_threshold": 50_000,
        "gb": 50,
    }
    first_config = {
        "mam": {"mam_id": "first-id"},
        "perk_automation": {"upload_credit": first_upload_credit},
    }
    second_config = {
        "mam": {"mam_id": "second-id"},
        "perk_automation": {
            "upload_credit": {
                "enabled": True,
                "trigger_type": "points",
                "trigger_point_threshold": 50_000,
                "gb": 50,
            }
        },
    }
    expected_upload_credit = first_upload_credit | {
        "last_upload_time": "2026-08-03T12:34:56+00:00",
    }
    expected_first_config = {
        "mam": {"mam_id": "first-id"},
        "perk_automation": {"upload_credit": expected_upload_credit},
    }
    purchase_started = threading.Event()
    release_purchase = threading.Event()
    saved_labels: list[str] = []

    class FixedDateTime(datetime):
        """Provide a deterministic automation timestamp for persistence assertions."""

        @classmethod
        def now(cls, current_tz: tzinfo | None = None) -> Self:
            """Return the fixed test timestamp in the requested timezone."""
            assert current_tz is UTC
            return cls(2026, 8, 3, 12, 34, 56, tzinfo=UTC)

    async def buy_then_request_shutdown(
        _amount: int, *, mam_id: str, proxy_cfg: object
    ) -> dict[str, bool]:
        del mam_id, proxy_cfg
        purchase_started.set()
        await asyncio.to_thread(release_purchase.wait)
        automation.request_automation_shutdown()
        return {"success": True}

    def save(config: dict[str, object], *, old_label: str) -> None:
        assert config == expected_first_config
        saved_labels.append(old_label)

    monkeypatch.setattr(automation, "list_sessions", lambda: ["first", "second"])
    monkeypatch.setattr(
        automation,
        "load_session",
        lambda label: first_config if label == "first" else second_config,
    )
    monkeypatch.setattr(automation, "resolve_proxy_from_session_cfg", lambda _cfg: None)
    monkeypatch.setattr(automation, "get_status", AsyncMock(return_value={"points": 100_000}))
    monkeypatch.setattr(automation, "buy_upload_credit", buy_then_request_shutdown)
    monkeypatch.setattr(automation, "save_session", save)
    monkeypatch.setattr(automation, "notify_event", AsyncMock())
    monkeypatch.setattr(automation, "append_ui_event_log", Mock())
    monkeypatch.setattr(automation, "datetime", FixedDateTime)
    wedge_job = AsyncMock()
    vip_job = AsyncMock()
    monkeypatch.setattr(automation, "wedge_automation_job", wedge_job)
    monkeypatch.setattr(automation, "vip_automation_job", vip_job)
    automation.reset_automation_shutdown()

    worker = threading.Thread(target=lambda: asyncio.run(automation.run_all_automation_jobs()))
    try:
        worker.start()
        assert purchase_started.wait(timeout=1)
        automation.request_automation_shutdown()
        assert worker.is_alive()
    finally:
        release_purchase.set()
        worker.join(timeout=1)
        automation.reset_automation_shutdown()

    assert not worker.is_alive()
    assert saved_labels == ["first"]
    wedge_job.assert_not_awaited()
    vip_job.assert_not_awaited()
