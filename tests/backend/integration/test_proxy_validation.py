"""Coverage for validating a proxy before it is stored.

The proxy endpoints stored whatever body they were sent, so a mistyped port
saved a proxy that could never connect, and a body with no host saved one that
resolved to no proxy at all, sending a session's traffic direct.
"""

from typing import Any

from httpx import AsyncClient
import pytest

from backend import app
from backend.proxy_config import load_proxies, resolve_proxy_from_session_cfg, save_proxies
from backend.utils import build_proxy_dict

_PORT_MESSAGE = "Proxy port must be a whole number from 1 to 65535."
# A fake credential; the test checks its surrounding spaces survive storage.
_SPACED_PASSWORD = "  pass with spaces  "  # noqa: S105


def _body(**overrides: Any) -> dict[str, Any]:
    """Build a valid proxy body, with any field overridden or removed via None."""
    body: dict[str, Any] = {"label": "vpn", "host": "proxy.local", "port": 8080}
    body.update(overrides)
    return {key: value for key, value in body.items() if value is not None}


@pytest.mark.integration
@pytest.mark.parametrize(
    ("port", "stored"),
    [(8080, 8080), ("8080", 8080), (" 8080 ", 8080), ("08080", 8080), (1, 1), (65535, 65535)],
)
async def test_a_valid_port_is_accepted_and_stored_as_an_integer(
    api_client: AsyncClient, port: Any, stored: int
) -> None:
    """The form sends the port as a string; it is stored as the number it names."""
    created = await api_client.post("/api/proxies", json=_body(port=port))

    assert created.json() == {"success": True}
    assert load_proxies()["vpn"]["port"] == stored


@pytest.mark.integration
@pytest.mark.parametrize("port", [0, 65536, -1, "abc", "", "1e3", 8080.5, True, False, None])
async def test_an_invalid_port_is_refused_and_nothing_is_stored(
    api_client: AsyncClient, port: Any
) -> None:
    """`True` is refused too: it is an int to Python, and would read as port 1.

    `None` stands for a body with no port at all.
    """
    refused = await api_client.post("/api/proxies", json=_body(port=port))

    assert refused.status_code == 400
    assert refused.json()["detail"] == _PORT_MESSAGE
    assert load_proxies() == {}


@pytest.mark.integration
@pytest.mark.parametrize("host", ["", "   ", None])
async def test_a_proxy_with_no_host_is_refused(api_client: AsyncClient, host: Any) -> None:
    """A host-less proxy resolves to no proxy, so a session using it would go direct."""
    refused = await api_client.post("/api/proxies", json=_body(host=host))

    assert refused.status_code == 400
    assert refused.json()["detail"] == "Proxy host is required."
    assert load_proxies() == {}


@pytest.mark.integration
async def test_every_invalid_field_is_named_at_once(api_client: AsyncClient) -> None:
    """The user corrects everything in one pass rather than one field per save."""
    refused = await api_client.post("/api/proxies", json=_body(host="", port="abc"))

    assert refused.json()["detail"] == f"Proxy host is required. {_PORT_MESSAGE}"


@pytest.mark.integration
async def test_an_invalid_update_leaves_the_stored_proxy_untouched(
    api_client: AsyncClient,
) -> None:
    """Replacing a proxy with a bad port must not replace it at all."""
    assert (await api_client.post("/api/proxies", json=_body())).is_success

    refused = await api_client.put("/api/proxies/vpn", json=_body(port=70000))

    assert refused.status_code == 400
    assert load_proxies()["vpn"]["port"] == 8080


@pytest.mark.integration
async def test_an_update_is_stored_under_the_label_sessions_reference(
    api_client: AsyncClient,
) -> None:
    """A body naming another label cannot leave the entry disagreeing with its key."""
    assert (await api_client.post("/api/proxies", json=_body())).is_success

    updated = await api_client.put("/api/proxies/vpn", json=_body(label="other", port="9090"))

    assert updated.is_success
    assert load_proxies() == {
        "vpn": {
            "label": "vpn",
            "host": "proxy.local",
            "port": 9090,
            "username": "",
            "password": "",
        }
    }


@pytest.mark.integration
async def test_credentials_are_stored_exactly_as_typed(api_client: AsyncClient) -> None:
    """Surrounding spaces can be part of a password, so they are not stripped."""
    body = _body(username="alice", password=_SPACED_PASSWORD)

    assert (await api_client.post("/api/proxies", json=body)).is_success

    assert load_proxies()["vpn"]["password"] == _SPACED_PASSWORD


@pytest.mark.integration
async def test_a_duplicate_label_is_still_refused(api_client: AsyncClient) -> None:
    """Validation runs first, and the existing duplicate check still applies."""
    assert (await api_client.post("/api/proxies", json=_body())).is_success

    refused = await api_client.post("/api/proxies", json=_body())

    assert refused.status_code == 400
    assert refused.json()["detail"] == "Proxy label already exists."


@pytest.mark.integration
async def test_a_proxy_saved_before_validation_still_resolves(
    api_client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Existing `proxies.yaml` files hold the port as a string; they load unchanged.

    Validation applies to writes only, so an entry written by an earlier
    version keeps working until it is next edited.
    """
    monkeypatch.setattr(app, "register_session_job", lambda _label: None)
    save_proxies({"vpn": {"label": "vpn", "host": "proxy.local", "port": "8080"}})
    session = {"label": "s", "mam": {"mam_id": "cookie"}, "proxy": {"label": "vpn"}}
    assert (await api_client.post("/api/session/save", json=session)).is_success

    resolved = resolve_proxy_from_session_cfg(session)

    assert resolved is not None
    assert build_proxy_dict(resolved) == {
        "http": "http://proxy.local:8080",
        "https": "http://proxy.local:8080",
    }
