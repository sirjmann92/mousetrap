"""Public-API integration coverage for sessions, proxies, and event persistence."""

from pathlib import Path

from httpx import AsyncClient
import pytest

from backend import app


@pytest.mark.integration
async def test_session_lifecycle_persists_events(
    api_client: AsyncClient, isolated_backend: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Create, read, update, and delete a session through HTTP."""
    monkeypatch.setattr(app, "register_session_job", lambda _label: None)
    payload = {"label": "seedbox", "mam": {"mam_id": "cookie-one"}, "proxy": {}}

    created = await api_client.post("/api/session/save", json=payload)
    assert created.json() == {"success": True}
    assert (isolated_backend / "session-seedbox.yaml").exists()
    assert (await api_client.get("/api/sessions")).json() == {"sessions": ["seedbox"]}
    assert (await api_client.get("/api/session/seedbox")).json()["mam"]["mam_id"] == "cookie-one"

    payload["mam"]["mam_id"] = "cookie-two"
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
async def test_deleting_proxy_cascades_to_session(
    api_client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Deleting a named proxy removes its reference from every saved session."""
    monkeypatch.setattr(app, "register_session_job", lambda _label: None)
    proxy = {"label": "vpn", "host": "proxy.local", "port": 1080}
    assert (await api_client.post("/api/proxies", json=proxy)).json() == {"success": True}
    session = {"label": "seedbox", "mam": {"mam_id": "cookie"}, "proxy": {"label": "vpn"}}
    assert (await api_client.post("/api/session/save", json=session)).is_success

    assert (await api_client.delete("/api/proxies/vpn")).json() == {"success": True}
    assert (await api_client.get("/api/proxies")).json() == {}
    assert (await api_client.get("/api/session/seedbox")).json()["proxy"] == {}
