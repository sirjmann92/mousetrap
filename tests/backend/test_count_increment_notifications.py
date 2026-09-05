"""Backend tests for the hit-and-run and unsatisfied count increment notifier."""

from typing import Any

import pytest

from backend import app


@pytest.fixture
def sent_notifications(monkeypatch: pytest.MonkeyPatch) -> list[dict[str, Any]]:
    """Record notifications instead of dispatching them, over an empty dedup cache."""
    sent: list[dict[str, Any]] = []

    async def fake_notify_event(**kwargs: Any) -> None:
        """Capture the keyword payload the notifier would have dispatched."""
        sent.append(kwargs)

    monkeypatch.setattr(app, "notify_event", fake_notify_event)
    monkeypatch.setattr(app, "notification_dedup_cache", {})
    return sent


def _status(inact_hnr: int, inact_unsat: int) -> dict[str, Any]:
    """Build a MAM status payload carrying the two counts the notifier compares.

    Args:
        inact_hnr: Value for the inactive hit-and-run count.
        inact_unsat: Value for the inactive unsatisfied count.

    Returns:
        A status mapping shaped like the one ``get_status`` returns.

    """
    return {
        "raw": {
            "uid": 7,
            "username": "reader",
            "inactHnr": {"count": inact_hnr},
            "inactUnsat": {"count": inact_unsat},
        }
    }


async def test_non_mapping_last_status_returns_without_notifying(
    sent_notifications: list[dict[str, Any]],
) -> None:
    """A persisted non-mapping ``last_status`` stops the comparison before it reads ``raw``."""
    cfg = {"last_status": "corrupted-by-hand", "mam": {"mam_id": "cookie"}}

    await app.check_and_notify_count_increments(cfg, _status(9, 9), "seedbox")

    assert sent_notifications == []


async def test_missing_last_status_defaults_to_an_empty_mapping(
    sent_notifications: list[dict[str, Any]],
) -> None:
    """An absent ``last_status`` passes the guard and compares against zero counts."""
    cfg: dict[str, Any] = {"mam": {"mam_id": "cookie"}}

    await app.check_and_notify_count_increments(cfg, _status(2, 0), "seedbox")

    assert [event["event_type"] for event in sent_notifications] == ["inactive_hit_and_run"]


async def test_both_counts_increasing_notify_once_each(
    sent_notifications: list[dict[str, Any]],
) -> None:
    """Increments in both counts each raise their own notification."""
    cfg = {"last_status": _status(1, 4), "mam": {"mam_id": "cookie"}}

    await app.check_and_notify_count_increments(cfg, _status(3, 6), "seedbox")

    assert [event["event_type"] for event in sent_notifications] == [
        "inactive_hit_and_run",
        "inactive_unsatisfied",
    ]
    assert "increased by 2 (from 1 to 3)" in sent_notifications[0]["message"]
    assert "increased by 2 (from 4 to 6)" in sent_notifications[1]["message"]


async def test_unchanged_counts_notify_nothing(
    sent_notifications: list[dict[str, Any]],
) -> None:
    """Equal counts on both sides raise no notification."""
    cfg = {"last_status": _status(3, 6), "mam": {"mam_id": "cookie"}}

    await app.check_and_notify_count_increments(cfg, _status(3, 6), "seedbox")

    assert sent_notifications == []
