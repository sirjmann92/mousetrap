"""Coverage for keeping each indexer's MAM ID current, and telling the user.

An indexer holds only the MAM ID it was last given. MouseTrap kept its own copy
current, but pushed a new value only to indexers with "Auto-update on Save" on,
so the rest went stale and failed until the user pressed UPDATE.

When MAM issues a new MAM ID, every enabled indexer now receives it straight
away, and the "MAM ID Changed" notification says which of them took it. Once a
day the current MAM ID is also resent, quietly, to catch any indexer that fell
behind.
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
    """Stub each indexer push and record what happens.

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
@pytest.mark.parametrize("step", ["announce_mam_id_change", "refresh_indexer_mam_ids"])
async def test_every_enabled_indexer_is_reached_whatever_its_on_save_setting(
    monkeypatch: pytest.MonkeyPatch, step: str
) -> None:
    """The on-save setting covers the user's own edits, not keeping indexers current."""
    pushes, _notified, _events = _install(monkeypatch)
    cfg = _cfg(
        prowlarr={"enabled": True, "auto_update_on_save": False},
        chaptarr={"enabled": True, "auto_update_on_save": True},
        jackett={"enabled": False, "auto_update_on_save": True},
    )

    await getattr(app, step)(cfg, "seedbox")

    assert pushes == [("prowlarr", _MAM_ID), ("chaptarr", _MAM_ID)]


@pytest.mark.integration
@pytest.mark.parametrize(
    "results", [{}, {"jackett": {"success": False, "error": "HTTP 401"}}], ids=["ok", "failed"]
)
async def test_the_daily_refresh_never_notifies(
    monkeypatch: pytest.MonkeyPatch, results: dict[str, Any]
) -> None:
    """The MAM ID has not changed, so a daily message would be noise.

    A failure still reaches the UI event log.
    """
    _pushes, notified, events = _install(monkeypatch, results)
    cfg = _cfg(prowlarr={"enabled": True}, jackett={"enabled": True})

    await app.refresh_indexer_mam_ids(cfg, "seedbox")

    assert notified == []
    assert len(events) == 1
    assert ("Failed" in events[0]["status_message"]) is bool(results)


@pytest.mark.integration
async def test_the_daily_refresh_does_nothing_without_an_enabled_indexer(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """No push and no event when there is nothing to refresh."""
    pushes, notified, events = _install(monkeypatch)

    await app.refresh_indexer_mam_ids(_cfg(prowlarr={"enabled": False}), "seedbox")

    assert (pushes, notified, events) == ([], [], [])


@pytest.mark.integration
async def test_a_new_mam_id_is_announced_with_the_indexers_that_took_it(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """One "MAM ID Changed" notification, naming the indexers updated."""
    _pushes, notified, _events = _install(monkeypatch)
    cfg = _cfg(prowlarr={"enabled": True}, chaptarr={"enabled": True})

    await app.announce_mam_id_change(cfg, "seedbox")

    assert len(notified) == 1
    assert notified[0]["event_type"] == "mam_id_changed"
    assert notified[0]["message"] == (
        "MAM issued a new MAM ID for this session. Updated in Prowlarr, Chaptarr."
    )
    assert _MAM_ID not in str(notified)


@pytest.mark.integration
async def test_a_new_mam_id_is_announced_without_any_indexer(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """The change is worth knowing about whether or not an indexer uses it."""
    pushes, notified, _events = _install(monkeypatch)

    await app.announce_mam_id_change(_cfg(), "seedbox")

    assert pushes == []
    assert [n["message"] for n in notified] == ["MAM issued a new MAM ID for this session."]


@pytest.mark.integration
async def test_an_indexer_that_did_not_take_it_is_named_with_its_reason_redacted(
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

    await app.announce_mam_id_change(cfg, "seedbox")

    assert len(notified) == 1
    message = notified[0]["message"]
    assert "Updated in Prowlarr." in message
    assert "Could not update Jackett (HTTP 401" in message
    assert message.endswith("press UPDATE to retry.")
    assert _JACKETT_KEY not in str(notified)
    assert _JACKETT_KEY not in str(events)


@pytest.mark.integration
async def test_an_exception_is_reported_and_redacted(monkeypatch: pytest.MonkeyPatch) -> None:
    """One indexer raising does not stop the rest, and its text is redacted too."""
    pushes, notified, _events = _install(
        monkeypatch, {"prowlarr": RuntimeError(f"refused {_MAM_ID} for key {_JACKETT_KEY}")}
    )
    cfg = _cfg(
        prowlarr={"enabled": True},
        chaptarr={"enabled": True},
        jackett={"enabled": False, "api_key": _JACKETT_KEY},
    )

    await app.announce_mam_id_change(cfg, "seedbox")

    assert [key for key, _ in pushes] == ["prowlarr", "chaptarr"]
    assert "Could not update Prowlarr" in notified[0]["message"]
    assert _MAM_ID not in str(notified)
    assert _JACKETT_KEY not in str(notified)


@pytest.mark.integration
async def test_nothing_logged_carries_the_mam_id_or_an_api_key(
    monkeypatch: pytest.MonkeyPatch, caplog: pytest.LogCaptureFixture
) -> None:
    """The push used to log the old and new MAM ID every time it ran."""
    _install(
        monkeypatch,
        {"jackett": {"success": False, "error": f"key {_JACKETT_KEY} for {_MAM_ID}"}},
    )
    cfg = _cfg(prowlarr={"enabled": True}, jackett={"enabled": True, "api_key": _JACKETT_KEY})

    with caplog.at_level(logging.DEBUG):
        await app.announce_mam_id_change(cfg, "seedbox")
        await app.refresh_indexer_mam_ids(cfg, "seedbox")

    assert caplog.records, "expected the pushes to log their progress"
    assert _MAM_ID not in caplog.text
    assert _JACKETT_KEY not in caplog.text


@pytest.mark.integration
@pytest.mark.parametrize(
    ("new", "pushed"),
    [("edited-mam-id", [("chaptarr", "edited-mam-id")]), (_MAM_ID, [])],
    ids=["changed", "unchanged"],
)
async def test_saving_a_mam_id_pushes_only_on_save_indexers_and_never_notifies(
    monkeypatch: pytest.MonkeyPatch, new: str, pushed: list[tuple[str, str]]
) -> None:
    """A MAM ID the user saved is not "MAM ID Changed": the user made the change."""
    pushes, notified, _events = _install(monkeypatch)
    cfg = _cfg(
        prowlarr={"enabled": True, "auto_update_on_save": False},
        chaptarr={"enabled": True, "auto_update_on_save": True},
    )

    await app._sync_integrations_if_mam_id_changed(cfg, "seedbox", new, _MAM_ID)

    assert pushes == pushed
    assert notified == []


@pytest.mark.integration
async def test_a_status_check_that_gets_a_new_mam_id_passes_it_on_and_announces_it(
    api_client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """End to end from the status route, through Chaptarr's own sync.

    Chaptarr is set not to update on save, so only the new path can reach it.
    """
    pushes: list[str] = []
    notified: list[dict[str, Any]] = []

    async def chaptarr(_cfg: Any, mam_id: str) -> dict[str, Any]:
        pushes.append(mam_id)
        return {"success": True, "message": "Updated"}

    async def notify(**kwargs: Any) -> None:
        notified.append(kwargs)

    monkeypatch.setattr(app, "sync_mam_id_to_chaptarr", chaptarr)
    monkeypatch.setattr(app, "register_session_job", lambda _label: None)

    async def status(**_kwargs: Any) -> dict[str, Any]:
        return {"mam_cookie_exists": True, "points": 1, "raw": {}, "updated_mam_id": "issued"}

    async def lookup(*_args: Any, **_kwargs: Any) -> dict[str, Any]:
        return {"ip": "198.51.100.7", "asn": "AS64500"}

    async def asn(*_args: Any, **_kwargs: Any) -> tuple[str, None]:
        return ("AS64500 Example", None)

    async def no_update(*_args: Any, **_kwargs: Any) -> tuple[bool, None]:
        return False, None

    monkeypatch.setattr(app, "get_status", status)
    monkeypatch.setattr(app, "get_ipinfo_with_fallback", lookup)
    monkeypatch.setattr(app, "get_asn_and_timezone_from_ip", asn)
    # The status route goes on to the automatic seedbox update, which would
    # otherwise look up the real public IP and call MAM.
    monkeypatch.setattr(app, "auto_update_seedbox_if_needed", no_update)
    saved = await api_client.post(
        "/api/session/save",
        json={
            "label": "seedbox",
            "mam": {"mam_id": _MAM_ID},
            "mam_ip": "198.51.100.7",
            "chaptarr": {"enabled": True, "auto_update_on_save": False},
        },
    )
    assert saved.is_success
    monkeypatch.setattr(app, "safe_notify_event", notify)

    await app.api_status(label="seedbox", force=1)

    assert (await api_client.get("/api/session/seedbox")).json()["mam"]["mam_id"] == "issued"
    assert pushes == ["issued"]
    assert [n["event_type"] for n in notified] == ["mam_id_changed"]
