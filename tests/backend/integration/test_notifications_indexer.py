"""Backend integration tests for deterministic external-service seams."""

from httpx import AsyncClient
import pytest

from backend import api_notifications, app


@pytest.mark.integration
async def test_notification_config_and_webhook_dispatch(
    api_client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Persist notification settings and dispatch through the fake webhook seam."""
    sent: list[tuple[str, dict, bool]] = []

    async def fake_send(url: str, payload: dict, discord: bool = False) -> bool:
        sent.append((url, payload, discord))
        return True

    monkeypatch.setattr(api_notifications, "send_webhook_notification", fake_send)
    config = {"webhook_url": "https://notify.invalid/hook", "discord_webhook": True}
    assert (await api_client.post("/api/notify/config", json=config)).json() == {"success": True}
    assert (await api_client.get("/api/notify/config")).json() == config

    payload = {"message": "integration test"}
    assert (await api_client.post("/api/notify/test/webhook", json=payload)).json() == {
        "success": True
    }
    assert sent == [("https://notify.invalid/hook", payload, True)]


@pytest.mark.integration
async def test_prowlarr_public_api_composes_connection_and_indexer_results(
    api_client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Exercise representative indexer behavior without a live Prowlarr server."""

    async def connected(_host: str, _port: int, _api_key: str) -> dict:
        return {"success": True, "message": "Connected", "indexer_count": 3}

    async def found(_host: str, _port: int, _api_key: str) -> dict:
        return {"success": True, "indexer_id": 42}

    monkeypatch.setattr(app, "test_prowlarr_connection", connected)
    monkeypatch.setattr(app, "find_mam_indexer_id", found)
    response = await api_client.post(
        "/api/prowlarr/test",
        json={"host": "prowlarr.local", "port": 9696, "api_key": "secret"},
    )
    assert response.json() == {
        "success": True,
        "message": "Connected",
        "indexer_count": 3,
        "indexer_id": 42,
    }


@pytest.mark.integration
async def test_webhook_requires_configuration(api_client: AsyncClient) -> None:
    """Expose missing notification configuration as a stable client error."""
    response = await api_client.post("/api/notify/test/webhook", json={"message": "test"})
    assert response.status_code == 400
    assert response.json() == {"detail": "Webhook URL not set."}


@pytest.mark.integration
async def test_unified_indexer_update_reports_partial_success(
    api_client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Keep one successful MAM-ID sync observable when another integration times out."""
    monkeypatch.setattr(app, "register_session_job", lambda _label: None)
    session = {
        "label": "seedbox",
        "mam": {"mam_id": "new-cookie"},
        "proxy": {},
        "prowlarr": {"enabled": True},
        "chaptarr": {"enabled": True},
    }
    assert (await api_client.post("/api/session/save", json=session)).is_success

    async def prowlarr_success(_cfg: dict, mam_id: str) -> dict:
        assert mam_id == "new-cookie"
        return {"success": True, "message": "updated"}

    async def chaptarr_timeout(_cfg: dict, mam_id: str) -> dict:
        assert mam_id == "new-cookie"
        raise TimeoutError("service timed out")

    monkeypatch.setattr(app, "sync_mam_id_to_prowlarr", prowlarr_success)
    monkeypatch.setattr(app, "sync_mam_id_to_chaptarr", chaptarr_timeout)
    response = await api_client.post("/api/indexer/update", json={"label": "seedbox"})

    assert response.json() == {
        "success": True,
        "message": ("Partially successful: Updated Prowlarr. Failed: Chaptarr (service timed out)"),
        "warning": True,
    }
    events = (await api_client.get("/api/ui_event_log")).json()
    assert events[-1]["event"] == "indexer_partial_update"
    assert events[-1]["event_type"] == "indexer_update"


AUTH_DISABLED_JACKETT_SESSION = {
    "label": "seedbox",
    "mam": {"mam_id": "new-cookie"},
    "proxy": {},
    "jackett": {
        "enabled": True,
        "host": "jackett.local",
        "port": 9117,
        "api_key": "secret",
        "admin_password": "",
    },
}


@pytest.mark.integration
async def test_jackett_update_accepts_an_auth_disabled_instance(
    api_client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Sync a Jackett instance that has authentication disabled, so no admin password."""
    monkeypatch.setattr(app, "register_session_job", lambda _label: None)
    assert (
        await api_client.post("/api/session/save", json=AUTH_DISABLED_JACKETT_SESSION)
    ).is_success
    synced: list[tuple[str, int, str, str, str]] = []

    async def jackett_success(
        host: str, port: int, api_key: str, admin_password: str, mam_id: str
    ) -> dict:
        synced.append((host, port, api_key, admin_password, mam_id))
        return {"success": True, "message": "updated"}

    monkeypatch.setattr(app, "sync_mam_id_to_jackett", jackett_success)
    response = await api_client.post("/api/jackett/update", json={"label": "seedbox"})

    assert response.json() == {"success": True, "message": "updated"}
    assert synced == [("jackett.local", 9117, "secret", "", "new-cookie")]


@pytest.mark.integration
async def test_unified_indexer_update_accepts_an_auth_disabled_jackett(
    api_client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Reach the same auth-disabled Jackett through the unified indexer endpoint."""
    monkeypatch.setattr(app, "register_session_job", lambda _label: None)
    assert (
        await api_client.post("/api/session/save", json=AUTH_DISABLED_JACKETT_SESSION)
    ).is_success
    synced: list[tuple[str, int, str, str, str]] = []

    async def jackett_success(
        host: str, port: int, api_key: str, admin_password: str, mam_id: str
    ) -> dict:
        synced.append((host, port, api_key, admin_password, mam_id))
        return {"success": True, "message": "updated"}

    monkeypatch.setattr(app, "sync_mam_id_to_jackett", jackett_success)
    response = await api_client.post("/api/indexer/update", json={"label": "seedbox"})

    assert response.json() == {
        "success": True,
        "message": "Successfully updated MAM ID in Jackett",
    }
    assert synced == [("jackett.local", 9117, "secret", "", "new-cookie")]
