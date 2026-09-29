"""Coverage for keeping each indexer's MAM ID current.

MAM rolls the cookie on every response and a value nobody refreshes expires
after about 30 days. MouseTrap kept its own copy current, but pushed the new
value only to indexers with "Auto-update on Save" on, so the rest went stale and
started failing until the user pressed UPDATE. The keepalive now refreshes every
enabled indexer once a day, and reports the result as a success or failure
notification the user can route either way.
"""

import logging
from typing import Any

from httpx import AsyncClient
import pytest

from backend import app

_MAM_ID = "current-mam-id"
_JACKETT_KEY = "jackett-api-key"


def _cfg(**indexers: dict[str, Any]) -> dict[str, Any]:
    """Build a session holding the given indexer integration settings."""
    return {"label": "seedbox", "mam": {"mam_id": _MAM_ID}, **indexers}


def _install(
    monkeypatch: pytest.MonkeyPatch, results: dict[str, Any] | None = None
) -> tuple[list[tuple[str, str]], list[dict[str, Any]], list[dict[str, Any]]]:
    """Stub each indexer push and record what the refresh does.

    Args:
        monkeypatch: Fixture used to replace the collaborators.
        results: Result per integration key, or an exception to raise. Any key
            missing succeeds.

    Returns:
        The pushes made as (key, MAM ID), the notifications sent, and the UI
        event log entries written.
    """
    pushes: list[tuple[str, str]] = []
    notified: list[dict[str, Any]] = []
    events: list[dict[str, Any]] = []

    async def push(_cfg: dict[str, Any], key: str, mam_id: str) -> dict[str, Any]:
        pushes.append((key, mam_id))
        outcome = (results or {}).get(key, {"success": True, "message": "Updated"})
        if isinstance(outcome, Exception):
            raise outcome
        return dict(outcome)

    async def notify(**kwargs: Any) -> None:
        notified.append(kwargs)

    monkeypatch.setattr(app, "_push_to_indexer", push)
    monkeypatch.setattr(app, "safe_notify_event", notify)
    monkeypatch.setattr(app, "append_ui_event_log", events.append)
    return pushes, notified, events


@pytest.mark.integration
async def test_every_enabled_indexer_is_refreshed_whatever_its_on_save_setting(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """The on-save setting covers the user's own edits, not keeping indexers current."""
    pushes, _notified, _events = _install(monkeypatch)
    cfg = _cfg(
        prowlarr={"enabled": True, "auto_update_on_save": False},
        chaptarr={"enabled": True, "auto_update_on_save": True},
        jackett={"enabled": False, "auto_update_on_save": True},
    )

    await app.refresh_indexer_mam_ids(cfg, "seedbox")

    assert pushes == [("prowlarr", _MAM_ID), ("chaptarr", _MAM_ID)]


@pytest.mark.integration
async def test_nothing_happens_without_an_enabled_indexer(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """No push, no event and no notification when there is nothing to refresh."""
    pushes, notified, events = _install(monkeypatch)

    await app.refresh_indexer_mam_ids(_cfg(prowlarr={"enabled": False}), "seedbox")

    assert (pushes, notified, events) == ([], [], [])


@pytest.mark.integration
async def test_a_successful_refresh_sends_the_success_event(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """The user can ask to hear about it, and it names the indexers updated."""
    _pushes, notified, _events = _install(monkeypatch)
    cfg = _cfg(prowlarr={"enabled": True}, chaptarr={"enabled": True})

    await app.refresh_indexer_mam_ids(cfg, "seedbox")

    assert len(notified) == 1
    assert notified[0]["event_type"] == "indexer_sync_success"
    assert notified[0]["status"] == "SUCCESS"
    assert notified[0]["message"] == "MAM ID updated in Prowlarr, Chaptarr"
    assert _MAM_ID not in str(notified)


@pytest.mark.integration
async def test_a_failed_push_sends_the_failure_event_with_its_reason_redacted(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Jackett takes its API key in the URL, and the error text carries the URL.

    The reason reaches Discord, email or Pushover, so the key is redacted from
    it. The indexers that did update are still named.
    """
    _pushes, notified, events = _install(
        monkeypatch,
        {"jackett": {"success": False, "error": f"HTTP 401 for /api?apikey={_JACKETT_KEY}"}},
    )
    cfg = _cfg(prowlarr={"enabled": True}, jackett={"enabled": True, "api_key": _JACKETT_KEY})

    await app.refresh_indexer_mam_ids(cfg, "seedbox")

    assert len(notified) == 1
    assert notified[0]["event_type"] == "indexer_sync_failure"
    assert notified[0]["status"] == "FAILED"
    assert notified[0]["message"].startswith("Could not update the MAM ID in Jackett (HTTP 401")
    assert notified[0]["message"].endswith(". Updated in Prowlarr")
    assert _JACKETT_KEY not in str(notified)
    assert _JACKETT_KEY not in str(events)


@pytest.mark.integration
async def test_an_exception_is_reported_as_a_failure_and_redacted(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """One indexer raising does not stop the rest, and its text is redacted too."""
    pushes, notified, _events = _install(
        monkeypatch, {"prowlarr": RuntimeError(f"refused {_MAM_ID} for key {_JACKETT_KEY}")}
    )
    cfg = _cfg(
        prowlarr={"enabled": True},
        chaptarr={"enabled": True},
        jackett={"enabled": False, "api_key": _JACKETT_KEY},
    )

    await app.refresh_indexer_mam_ids(cfg, "seedbox")

    assert [key for key, _ in pushes] == ["prowlarr", "chaptarr"]
    assert notified[0]["event_type"] == "indexer_sync_failure"
    assert _MAM_ID not in str(notified)
    assert _JACKETT_KEY not in str(notified)


@pytest.mark.integration
async def test_nothing_logged_carries_the_mam_id_or_an_api_key(
    monkeypatch: pytest.MonkeyPatch, caplog: pytest.LogCaptureFixture
) -> None:
    """The push used to log the old and new MAM ID on every roll."""
    _install(
        monkeypatch,
        {"jackett": {"success": False, "error": f"key {_JACKETT_KEY} for {_MAM_ID}"}},
    )
    cfg = _cfg(prowlarr={"enabled": True}, jackett={"enabled": True, "api_key": _JACKETT_KEY})

    with caplog.at_level(logging.DEBUG):
        await app.refresh_indexer_mam_ids(cfg, "seedbox")

    assert caplog.records, "the refresh is expected to log its progress"
    assert _MAM_ID not in caplog.text
    assert _JACKETT_KEY not in caplog.text


@pytest.mark.integration
@pytest.mark.parametrize(
    ("new", "pushed"),
    [("edited-mam-id", [("chaptarr", "edited-mam-id")]), (_MAM_ID, [])],
    ids=["changed", "unchanged"],
)
async def test_saving_a_mam_id_still_pushes_only_on_save_indexers_and_never_notifies(
    monkeypatch: pytest.MonkeyPatch, new: str, pushed: list[tuple[str, str]]
) -> None:
    """The Save path keeps its meaning: a user edit, pushed where the user asked.

    It sends no notification: the user is looking at the result.
    """
    pushes, notified, _events = _install(monkeypatch)
    cfg = _cfg(
        prowlarr={"enabled": True, "auto_update_on_save": False},
        chaptarr={"enabled": True, "auto_update_on_save": True},
    )

    await app._sync_integrations_if_mam_id_changed(cfg, "seedbox", new, _MAM_ID)

    assert pushes == pushed
    assert notified == []


@pytest.mark.integration
async def test_a_status_check_that_rolls_the_cookie_adopts_it_without_pushing(
    api_client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """MAM rolls the cookie on every status check; the indexers wait for the daily refresh.

    Chaptarr's own sync is watched rather than the push seam, so this also
    fails against the code that pushed at every check.
    """
    pushes: list[str] = []

    async def chaptarr(_cfg: Any, mam_id: str) -> dict[str, Any]:
        pushes.append(mam_id)
        return {"success": True, "message": "Updated"}

    monkeypatch.setattr(app, "sync_mam_id_to_chaptarr", chaptarr)
    monkeypatch.setattr(app, "register_session_job", lambda _label: None)

    async def status(**_kwargs: Any) -> dict[str, Any]:
        return {"mam_cookie_exists": True, "points": 1, "raw": {}, "updated_mam_id": "rolled"}

    async def lookup(*_args: Any, **_kwargs: Any) -> dict[str, Any]:
        return {"ip": "198.51.100.7", "asn": "AS64500"}

    async def asn(*_args: Any, **_kwargs: Any) -> tuple[str, None]:
        return ("AS64500 Example", None)

    monkeypatch.setattr(app, "get_status", status)
    monkeypatch.setattr(app, "get_ipinfo_with_fallback", lookup)
    monkeypatch.setattr(app, "get_asn_and_timezone_from_ip", asn)
    saved = await api_client.post(
        "/api/session/save",
        json={
            "label": "seedbox",
            "mam": {"mam_id": _MAM_ID},
            "mam_ip": "198.51.100.7",
            "chaptarr": {"enabled": True, "auto_update_on_save": True},
        },
    )
    assert saved.is_success
    pushes.clear()

    await app.api_status(label="seedbox", force=1)

    assert (await api_client.get("/api/session/seedbox")).json()["mam"]["mam_id"] == "rolled"
    assert pushes == []
