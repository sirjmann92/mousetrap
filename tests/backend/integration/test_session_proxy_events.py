"""Backend public-API integration coverage for sessions, proxies, and event persistence."""

from pathlib import Path

from httpx import AsyncClient
import pytest

from backend import app, config


@pytest.mark.integration
async def test_session_lifecycle_persists_events(
    api_client: AsyncClient, isolated_backend: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Create, read, update, and delete a session through HTTP."""
    monkeypatch.setattr(app, "register_session_job", lambda _label: None)
    mam = {"mam_id": "cookie-one"}
    payload: dict[str, object] = {"label": "seedbox", "mam": mam, "proxy": {}}

    created = await api_client.post("/api/session/save", json=payload)
    assert created.json() == {"success": True}
    assert (isolated_backend / "session-seedbox.yaml").exists()
    assert (await api_client.get("/api/sessions")).json() == {"sessions": ["seedbox"]}
    assert (await api_client.get("/api/session/seedbox")).json()["mam"]["mam_id"] == "cookie-one"

    mam["mam_id"] = "cookie-two"
    payload["old_label"] = "seedbox"
    payload["label"] = "archive"
    assert (await api_client.post("/api/session/save", json=payload)).json() == {"success": True}
    assert not (isolated_backend / "session-seedbox.yaml").exists()
    assert (isolated_backend / "session-archive.yaml").exists()
    assert (await api_client.get("/api/sessions")).json() == {"sessions": ["archive"]}

    selected = await api_client.post("/api/last_session", json={"label": "archive"})
    assert selected.json() == {"success": True, "label": "archive"}
    assert (await api_client.get("/api/last_session")).json() == {"label": "archive"}
    events = (await api_client.get("/api/ui_event_log")).json()
    assert [event["event"] for event in events] == ["session_created", "session_created"]

    assert (await api_client.delete("/api/session/delete/archive")).json() == {"success": True}
    assert (await api_client.get("/api/sessions")).json() == {"sessions": []}
    assert (await api_client.get("/api/last_session")).json() == {"label": ""}
    assert [event["event"] for event in (await api_client.get("/api/ui_event_log")).json()] == [
        "session_created",
        "session_deleted",
    ]


@pytest.mark.integration
async def test_deleting_a_proxy_a_session_uses_is_refused(
    api_client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """A proxy in use survives the delete, and so does the session that uses it.

    Clearing the reference instead would leave the session with no proxy at
    all, which means its MaM traffic quietly continues over a direct
    connection.
    """
    monkeypatch.setattr(app, "register_session_job", lambda _label: None)
    proxy = {"label": "vpn", "host": "proxy.local", "port": 1080}
    assert (await api_client.post("/api/proxies", json=proxy)).json() == {"success": True}
    session = {"label": "seedbox", "mam": {"mam_id": "cookie"}, "proxy": {"label": "vpn"}}
    assert (await api_client.post("/api/session/save", json=session)).is_success

    refused = await api_client.delete("/api/proxies/vpn")
    assert refused.status_code == 409
    assert "seedbox" in refused.json()["detail"]
    assert (await api_client.get("/api/proxies")).json() == {"vpn": proxy}
    assert (await api_client.get("/api/session/seedbox")).json()["proxy"] == {"label": "vpn"}


@pytest.mark.integration
async def test_deleting_a_proxy_succeeds_once_the_session_releases_it(
    api_client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """The documented way out of the refusal actually works."""
    monkeypatch.setattr(app, "register_session_job", lambda _label: None)
    proxy = {"label": "vpn", "host": "proxy.local", "port": 1080}
    assert (await api_client.post("/api/proxies", json=proxy)).json() == {"success": True}
    session = {"label": "seedbox", "mam": {"mam_id": "cookie"}, "proxy": {"label": "vpn"}}
    assert (await api_client.post("/api/session/save", json=session)).is_success
    assert (await api_client.delete("/api/proxies/vpn")).status_code == 409

    session["proxy"] = {}
    assert (await api_client.post("/api/session/save", json=session)).is_success

    assert (await api_client.delete("/api/proxies/vpn")).json() == {"success": True}
    assert (await api_client.get("/api/proxies")).json() == {}


@pytest.mark.integration
async def test_status_survives_a_saved_proxy_label_that_is_not_a_string(
    api_client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Serve status for a session whose persisted proxy label cannot be a mapping key.

    The save endpoint refuses such a label, so this writes the config directly.
    That is how the state arises in the first place: a hand-edited file, or one
    written before the reference was validated. The read path has to survive it
    either way.
    """
    monkeypatch.setattr(app, "register_session_job", lambda _label: None)

    async def detected_ipinfo(
        ip: str | None = None, proxy_cfg: dict[str, str] | None = None
    ) -> dict[str, str]:
        """Return deterministic public IP metadata instead of calling out to a provider.

        Args:
            ip: Address to look up; unused, the stub answers for every input.
            proxy_cfg: Proxy to look up through; unused, for the same reason.

        Returns:
            A fixed normalized IP metadata mapping.
        """
        return {"ip": "198.51.100.10", "asn": "AS64500"}

    monkeypatch.setattr(app, "get_ipinfo_with_fallback", detected_ipinfo)
    config.save_session({"label": "seedbox", "mam": {}, "proxy": {"label": ["vpn"]}})

    status = await api_client.get("/api/status?label=seedbox")

    assert status.status_code == 200
    assert status.json()["configured"] is False
