"""Backend MAM status workflow with deterministic network seams."""

from typing import Any

from httpx import AsyncClient
import pytest

from backend import app


@pytest.mark.workflow
async def test_forced_status_fetches_mam_account_and_persists_result(
    api_client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Fetch MAM status through the public endpoint and persist the returned account state."""
    monkeypatch.setattr(app, "register_session_job", lambda _label: None)
    session = {
        "label": "seedbox",
        "mam": {
            "mam_id": "mam-cookie",
            "session_type": "ip",
            "ip_monitoring_mode": "static",
        },
        "mam_ip": "198.51.100.10",
        "proxy": {},
    }
    assert (await api_client.post("/api/session/save", json=session)).is_success

    async def ipinfo(*_args: Any, **_kwargs: Any) -> dict[str, str]:
        """Return deterministic public IP metadata."""
        return {"ip": "198.51.100.10", "asn": "AS64500"}

    async def asn_lookup(*_args: Any, **_kwargs: Any) -> tuple[str, str]:
        """Return deterministic ASN and timezone metadata."""
        return "AS64500", "UTC"

    async def mam_seen(*_args: Any, **_kwargs: Any) -> dict[str, Any]:
        """Return deterministic MAM-observed network metadata."""
        return {"ASN": 64500, "AS": "AS64500 TEST-NET"}

    async def mam_status(mam_id: str, proxy_cfg: dict | None = None) -> dict[str, Any]:
        """Return deterministic MAM account status."""
        assert mam_id == "mam-cookie"
        assert proxy_cfg is None
        return {
            "mam_cookie_exists": True,
            "points": 1234,
            "wedge_active": False,
            "vip_active": True,
            "raw": {"uid": 7, "username": "reader"},
        }

    monkeypatch.setattr(app, "get_ipinfo_with_fallback", ipinfo)
    monkeypatch.setattr(app, "get_asn_and_timezone_from_ip", asn_lookup)
    monkeypatch.setattr(app, "get_mam_seen_ip_info", mam_seen)
    monkeypatch.setattr(app, "get_status", mam_status)

    response = await api_client.get("/api/status?label=seedbox&force=1")
    assert response.status_code == 200
    assert response.json()["mam_cookie_exists"] is True
    assert response.json()["points"] == 1234
    assert response.json()["details"]["raw"]["username"] == "reader"

    persisted = (await api_client.get("/api/session/seedbox")).json()
    assert persisted["last_status"]["points"] == 1234
    assert persisted["last_status"]["raw"]["uid"] == 7


@pytest.mark.workflow
async def test_logged_status_event_reports_the_fetched_auto_update_result(
    api_client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Log the event-log entry from the fetched status rather than from an empty mapping."""
    monkeypatch.setattr(app, "register_session_job", lambda _label: None)
    session = {
        "label": "seedbox",
        "mam": {
            "mam_id": "mam-cookie",
            "session_type": "ip",
            "ip_monitoring_mode": "static",
        },
        "mam_ip": "198.51.100.10",
        "proxy": {},
    }
    assert (await api_client.post("/api/session/save", json=session)).is_success

    async def ipinfo(*_args: Any, **_kwargs: Any) -> dict[str, str]:
        """Return deterministic public IP metadata."""
        return {"ip": "198.51.100.10", "asn": "AS64500"}

    async def asn_lookup(*_args: Any, **_kwargs: Any) -> tuple[str, str]:
        """Return deterministic ASN and timezone metadata."""
        return "AS64500", "UTC"

    async def mam_seen(*_args: Any, **_kwargs: Any) -> dict[str, Any]:
        """Return deterministic MAM-observed network metadata."""
        return {"ASN": 64500, "AS": "AS64500 TEST-NET"}

    async def mam_status(*_args: Any, **_kwargs: Any) -> dict[str, Any]:
        """Return a status whose auto-update result the event log must reproduce."""
        return {
            "mam_cookie_exists": True,
            "points": 1234,
            "auto_update_seedbox": {"success": True, "msg": "Seedbox IP updated"},
            "raw": {"uid": 7, "username": "reader"},
        }

    monkeypatch.setattr(app, "get_ipinfo_with_fallback", ipinfo)
    monkeypatch.setattr(app, "get_asn_and_timezone_from_ip", asn_lookup)
    monkeypatch.setattr(app, "get_mam_seen_ip_info", mam_seen)
    monkeypatch.setattr(app, "get_status", mam_status)

    # A newly created session suppresses its first status event, so the assertion
    # below is about the second check and the log is cleared between the two.
    assert (await api_client.get("/api/status?label=seedbox&force=1")).status_code == 200
    assert (await api_client.delete("/api/ui_event_log")).json() == {"success": True}
    assert (await api_client.get("/api/status?label=seedbox&force=1")).status_code == 200

    events = (await api_client.get("/api/ui_event_log")).json()
    manual = [event for event in events if event.get("event_type") == "manual"]
    assert len(manual) == 1
    assert manual[0]["details"]["auto_update"] == "Seedbox IP updated"
    assert manual[0]["status_message"] == (
        "Static IP mode - No monitoring active. Automation running normally."
    )
