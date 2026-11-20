"""Coverage for the invariant that a saved session's proxy label resolves.

Two guards hold it from opposite directions: deleting a proxy a session uses is
refused, and saving a session that names a proxy which does not exist is
refused. Without the second, a proxy deleted while it was selected in the form
but before the session was ever saved could still be persisted, and the session
would connect directly with nothing saying so.
"""

from typing import TYPE_CHECKING, Any

import pytest

from backend import app

if TYPE_CHECKING:
    from httpx import AsyncClient

_PROXY = {"label": "vpn", "host": "proxy.local", "port": 1080}


def _skip_job_registration(_label: str) -> None:
    """Stand in for ``register_session_job`` so saving a session schedules nothing."""


def _session(proxy: dict[str, Any] | None) -> dict[str, Any]:
    """Build a session save payload carrying the given proxy mapping."""
    return {
        "label": "seedbox",
        "mam": {"mam_id": "cookie"},
        "proxy": proxy if proxy is not None else {},
    }


@pytest.mark.integration
async def test_saving_a_session_naming_a_deleted_proxy_is_refused(
    api_client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """The sequence the UI actually allows: select, delete elsewhere, then save."""
    monkeypatch.setattr(app, "register_session_job", _skip_job_registration)
    assert (await api_client.post("/api/proxies", json=_PROXY)).is_success
    # Nothing references it yet, so the in-use guard permits this delete.
    assert (await api_client.delete("/api/proxies/vpn")).is_success

    refused = await api_client.post("/api/session/save", json=_session({"label": "vpn"}))

    assert refused.status_code == 400
    assert "vpn" in refused.json()["detail"]
    assert (await api_client.get("/api/sessions")).json()["sessions"] == []


@pytest.mark.integration
async def test_saving_a_session_naming_an_existing_proxy_succeeds(
    api_client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """The guard must not block the ordinary case."""
    monkeypatch.setattr(app, "register_session_job", _skip_job_registration)
    assert (await api_client.post("/api/proxies", json=_PROXY)).is_success

    saved = await api_client.post("/api/session/save", json=_session({"label": "vpn"}))

    assert saved.is_success
    assert (await api_client.get("/api/session/seedbox")).json()["proxy"]["label"] == "vpn"


@pytest.mark.integration
@pytest.mark.parametrize("proxy", [{}, None, {"label": ""}])
async def test_a_session_without_a_proxy_still_saves(
    api_client: AsyncClient, monkeypatch: pytest.MonkeyPatch, proxy: dict[str, Any] | None
) -> None:
    """Selecting None, and every shape that means it, stays allowed."""
    monkeypatch.setattr(app, "register_session_job", _skip_job_registration)

    saved = await api_client.post("/api/session/save", json=_session(proxy))

    assert saved.is_success


@pytest.mark.integration
async def test_a_legacy_inline_proxy_without_a_label_still_saves(
    api_client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Sessions predating named proxies carry host details and no label.

    `resolve_proxy_from_session_cfg` still honours those, so the guard must not
    reject them for having nothing to look up.
    """
    monkeypatch.setattr(app, "register_session_job", _skip_job_registration)
    inline = {"host": "proxy.local", "port": 1080, "username": "u", "password": "p"}

    saved = await api_client.post("/api/session/save", json=_session(inline))

    assert saved.is_success
    assert (await api_client.get("/api/session/seedbox")).json()["proxy"]["host"] == "proxy.local"


@pytest.mark.integration
async def test_a_non_string_proxy_label_is_refused(
    api_client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """A label that cannot key the proxy store is rejected at the boundary."""
    monkeypatch.setattr(app, "register_session_job", _skip_job_registration)

    refused = await api_client.post("/api/session/save", json=_session({"label": ["vpn"]}))

    assert refused.status_code == 400
