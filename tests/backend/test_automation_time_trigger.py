"""Characterisation tests for the automation jobs' time-based trigger.

`upload_credit_automation_job` and `vip_automation_job` each carry their own
copy of the same time-trigger evaluation — 27 identical lines, per jscpd. These
tests pin what that logic does today, on both jobs, so a shared implementation
can be shown to preserve it.

They are characterisation tests: written against the jobs as they stand and
asserting current behaviour, not a specification of what it ought to be.
"""

from datetime import UTC, datetime, timedelta, tzinfo
from typing import Any, Self
from unittest.mock import AsyncMock, Mock

import pytest

from backend import automation

NOW = datetime(2026, 9, 6, 12, 0, 0, tzinfo=UTC)


class _FixedDateTime(datetime):
    """datetime whose `now` is pinned, so trigger arithmetic is deterministic."""

    @classmethod
    def now(cls, current_tz: tzinfo | None = None) -> Self:
        """Return the pinned instant in the requested timezone."""
        return cls.fromtimestamp(NOW.timestamp(), tz=current_tz or UTC)


def _install(
    monkeypatch: pytest.MonkeyPatch,
    cfg: dict[str, Any],
    points: int = 1_000_000,
    events: list[dict[str, Any]] | None = None,
) -> list[str]:
    """Point one automation job at a single stub session and record purchases.

    Pass `events` to also capture every UI event-log payload the job writes.
    """
    purchases: list[str] = []

    async def _buy(*_args: Any, **_kwargs: Any) -> dict[str, Any]:
        purchases.append("bought")
        return {"success": True}

    monkeypatch.setattr(automation, "list_sessions", lambda: ["seedbox"])
    monkeypatch.setattr(automation, "load_session", lambda _label: cfg)
    monkeypatch.setattr(automation, "resolve_proxy_from_session_cfg", lambda _cfg: None)
    monkeypatch.setattr(automation, "get_status", AsyncMock(return_value={"points": points}))
    monkeypatch.setattr(automation, "buy_upload_credit", _buy)
    monkeypatch.setattr(automation, "buy_vip", _buy)
    monkeypatch.setattr(automation, "save_session", Mock())
    monkeypatch.setattr(automation, "notify_event", AsyncMock())
    monkeypatch.setattr(
        automation,
        "append_ui_event_log",
        events.append if events is not None else Mock(),
    )
    monkeypatch.setattr(automation, "datetime", _FixedDateTime)
    automation.reset_automation_shutdown()
    return purchases


def _upload_cfg(last: str | None, trigger_type: str = "time", days: int = 7) -> dict[str, Any]:
    """Build a session config with upload-credit automation enabled."""
    auto: dict[str, Any] = {
        "enabled": True,
        "trigger_type": trigger_type,
        "trigger_days": days,
        "trigger_point_threshold": 1,
        "gb": 50,
    }
    if last is not None:
        auto["last_upload_time"] = last
    return {"mam": {"mam_id": "cookie"}, "perk_automation": {"upload_credit": auto}}


def _vip_cfg(last: str | None, trigger_type: str = "time", days: int = 7) -> dict[str, Any]:
    """Build a session config with VIP automation enabled."""
    auto: dict[str, Any] = {
        "enabled": True,
        "trigger_type": trigger_type,
        "trigger_days": days,
        "trigger_point_threshold": 1,
        "weeks": 4,
    }
    if last is not None:
        auto["last_vip_time"] = last
    return {"mam": {"mam_id": "cookie"}, "perk_automation": {"vip_automation": auto}}


@pytest.mark.parametrize(
    ("job", "build"),
    [("upload_credit_automation_job", _upload_cfg), ("vip_automation_job", _vip_cfg)],
)
async def test_no_previous_purchase_blocks_a_time_trigger(
    monkeypatch: pytest.MonkeyPatch, job: str, build: Any
) -> None:
    """Absent a timestamp the job waits, rather than treating "never" as "due".

    This is deliberate: the timer starts on a successful purchase, so a session
    that has never purchased is skipped until one is recorded.
    """
    purchases = _install(monkeypatch, build(None))

    await getattr(automation, job)()

    assert purchases == []


@pytest.mark.parametrize(
    ("job", "build"),
    [("upload_credit_automation_job", _upload_cfg), ("vip_automation_job", _vip_cfg)],
)
async def test_a_recent_purchase_blocks_a_time_trigger(
    monkeypatch: pytest.MonkeyPatch, job: str, build: Any
) -> None:
    """Inside the interval, the job does not buy again."""
    recent = (NOW - timedelta(days=2)).isoformat()
    purchases = _install(monkeypatch, build(recent, days=7))

    await getattr(automation, job)()

    assert purchases == []


@pytest.mark.parametrize(
    ("job", "build"),
    [("upload_credit_automation_job", _upload_cfg), ("vip_automation_job", _vip_cfg)],
)
async def test_an_elapsed_interval_allows_the_purchase(
    monkeypatch: pytest.MonkeyPatch, job: str, build: Any
) -> None:
    """Once the interval has passed, the purchase proceeds."""
    stale = (NOW - timedelta(days=30)).isoformat()
    purchases = _install(monkeypatch, build(stale, days=7))

    await getattr(automation, job)()

    assert purchases == ["bought"]


@pytest.mark.parametrize(
    ("job", "build"),
    [("upload_credit_automation_job", _upload_cfg), ("vip_automation_job", _vip_cfg)],
)
async def test_an_unparseable_timestamp_is_treated_as_no_purchase(
    monkeypatch: pytest.MonkeyPatch, job: str, build: Any
) -> None:
    """A corrupt timestamp falls back to the no-timestamp path rather than raising."""
    purchases = _install(monkeypatch, build("not-a-timestamp"))

    await getattr(automation, job)()

    assert purchases == []


@pytest.mark.parametrize(
    ("job", "build"),
    [("upload_credit_automation_job", _upload_cfg), ("vip_automation_job", _vip_cfg)],
)
async def test_a_points_trigger_ignores_the_timestamp(
    monkeypatch: pytest.MonkeyPatch, job: str, build: Any
) -> None:
    """With trigger_type "points" the time check is skipped entirely."""
    purchases = _install(monkeypatch, build(None, trigger_type="points"))

    await getattr(automation, job)()

    assert purchases == ["bought"]


@pytest.mark.parametrize(
    ("job", "build", "purchase_type", "prefix"),
    [
        ("upload_credit_automation_job", _upload_cfg, "upload_credit", "Upload Credit"),
        ("vip_automation_job", _vip_cfg, "vip", "VIP"),
    ],
)
async def test_a_time_skip_writes_the_expected_event(
    monkeypatch: pytest.MonkeyPatch, job: str, build: Any, purchase_type: str, prefix: str
) -> None:
    """Pin the skip event's shape, not just that the purchase did not happen.

    Ten of these blocks are written out longhand across the two jobs and are
    identical bar the reason, so the payload is what a shared implementation
    has to reproduce.
    """
    events: list[dict[str, Any]] = []
    recent = (NOW - timedelta(days=2)).isoformat()
    purchases = _install(monkeypatch, build(recent, days=7), events=events)

    await getattr(automation, job)()

    assert purchases == []
    skipped = [e for e in events if e.get("result") == "skipped"]
    assert len(skipped) == 1
    event = skipped[0]
    assert event["label"] == "seedbox"
    assert event["event_type"] == "automation"
    assert event["trigger"] == "automation"
    assert event["purchase_type"] == purchase_type
    assert event["details"] == {"points_before": 1_000_000}
    assert event["status_message"].startswith(f"Automated {prefix} purchase skipped: ")
    assert "Time-based trigger not satisfied" in event["status_message"]
    assert event["timestamp"] == NOW.isoformat()
