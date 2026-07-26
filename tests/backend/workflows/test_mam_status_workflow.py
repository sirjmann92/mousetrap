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
        return {"ip": "198.51.100.10", "asn": "AS64500"}

    async def asn_lookup(*_args: Any, **_kwargs: Any) -> tuple[str, str]:
        return "AS64500", "UTC"

    async def mam_seen(*_args: Any, **_kwargs: Any) -> dict[str, Any]:
        return {"ASN": 64500, "AS": "AS64500 TEST-NET"}

    async def mam_status(mam_id: str, proxy_cfg: dict | None = None) -> dict[str, Any]:
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
