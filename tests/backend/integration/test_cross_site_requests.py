"""Coverage for refusing state-changing requests sent on behalf of another site.

Any page a user visits can make their browser POST to MouseTrap. The page never
sees the reply, but before this guard the request still ran: a `text/plain` body
reached handlers that read JSON without checking its content type, and a
cross-site page could overwrite a session's MAM ID.
"""

from typing import Any

from httpx import AsyncClient
import pytest
from starlette.datastructures import Headers

from backend import app
from backend.cross_site import REFUSED_DETAIL, cross_site_reason

# The API client's requests are addressed to this host.
_HOST = "testserver"
_ATTACKER = "https://attacker.example"


@pytest.mark.parametrize(
    ("headers", "refused"),
    [
        # Browsers send Sec-Fetch-Site to HTTPS and loopback addresses.
        ({"sec-fetch-site": "same-origin"}, False),
        ({"sec-fetch-site": "none"}, False),
        ({"sec-fetch-site": "cross-site"}, True),
        # Another app on the same host, on another port, is same-site.
        ({"sec-fetch-site": "same-site"}, True),
        ({"sec-fetch-site": "SAME-ORIGIN"}, False),
        # Sec-Fetch-Site decides even when Origin would have matched.
        ({"sec-fetch-site": "cross-site", "origin": f"http://{_HOST}"}, True),
        # Plain HTTP on a LAN address: no Sec-Fetch-Site, so Origin decides.
        ({"origin": f"http://{_HOST}", "host": _HOST}, False),
        ({"origin": f"http://{_HOST.upper()}", "host": _HOST}, False),
        ({"origin": _ATTACKER, "host": _HOST}, True),
        ({"origin": f"http://{_HOST}:8989", "host": _HOST}, True),
        ({"origin": "null", "host": _HOST}, True),
        ({"origin": "not a url", "host": _HOST}, True),
        # A reverse proxy that rewrote Host to the upstream address.
        (
            {
                "origin": "https://mt.example",
                "host": "mousetrap:39842",
                "x-forwarded-host": "mt.example",
            },
            False,
        ),
        (
            {
                "origin": "https://mt.example",
                "host": "mousetrap:39842",
                "x-forwarded-host": "a.example, b",
            },
            True,
        ),
        (
            {"origin": "https://mt.example", "host": "x", "x-forwarded-host": "mt.example, proxy2"},
            False,
        ),
        # Neither header: a script or command-line tool, not a browser.
        ({}, False),
        ({"host": _HOST}, False),
    ],
)
def test_cross_site_reason(headers: dict[str, str], refused: bool) -> None:
    """Only a request a browser marks as coming from another site is refused."""
    assert (cross_site_reason(Headers(headers)) is not None) is refused


async def _save_session(api_client: AsyncClient, mam_id: str) -> None:
    """Persist the session the forged requests target, through a same-origin save."""
    saved = await api_client.post(
        "/api/session/save", json={"label": "victim", "mam": {"mam_id": mam_id}}
    )
    assert saved.is_success


async def _stored_mam_id(api_client: AsyncClient) -> Any:
    """Read back the MAM ID the victim session holds."""
    return (await api_client.get("/api/session/victim")).json()["mam"]["mam_id"]


@pytest.mark.integration
@pytest.mark.parametrize(
    "headers",
    [
        # A page on the internet, reaching MouseTrap over plain HTTP on the LAN.
        {"origin": _ATTACKER},
        # The same page, reaching MouseTrap over HTTPS or loopback.
        {"origin": _ATTACKER, "sec-fetch-site": "cross-site"},
        # A compromised app on the same host.
        {"origin": f"http://{_HOST}:8989", "sec-fetch-site": "same-site"},
    ],
)
async def test_a_forged_session_save_is_refused_and_changes_nothing(
    api_client: AsyncClient, monkeypatch: pytest.MonkeyPatch, headers: dict[str, str]
) -> None:
    """The attack this guard exists for: overwriting a session's MAM ID.

    The body is sent as `text/plain`, the content type a page can send without
    a CORS preflight, which is how it reached the handler before.
    """
    monkeypatch.setattr(app, "register_session_job", lambda _label: None)
    await _save_session(api_client, "real-cookie")

    forged = await api_client.post(
        "/api/session/save",
        headers={**headers, "content-type": "text/plain;charset=UTF-8"},
        content='{"label": "victim", "mam": {"mam_id": "attacker-value"}}',
    )

    assert forged.status_code == 403
    # Answered before routing, but in the same problem details shape as every
    # other error status.
    assert forged.headers["content-type"] == "application/problem+json"
    assert forged.json() == {
        "type": "about:blank",
        "status": 403,
        "title": "Forbidden",
        "detail": REFUSED_DETAIL,
    }
    assert await _stored_mam_id(api_client) == "real-cookie"


@pytest.mark.integration
async def test_a_bodyless_cross_site_post_never_reaches_its_handler(
    api_client: AsyncClient,
) -> None:
    """A query-only POST needs no body to trigger its side effect, here a restart.

    The handler answers 404 for a stack that does not exist, so a 403 shows the
    request was refused before routing rather than by the handler.
    """
    reached = await api_client.post("/api/port-monitor/stacks/restart?name=gluetun")
    assert reached.status_code == 404

    refused = await api_client.post(
        "/api/port-monitor/stacks/restart?name=gluetun", headers={"origin": _ATTACKER}
    )

    assert refused.status_code == 403


@pytest.mark.integration
@pytest.mark.parametrize("method", ["PUT", "DELETE", "PATCH"])
async def test_every_unsafe_method_is_guarded(api_client: AsyncClient, method: str) -> None:
    """PUT and DELETE already need a preflight, but the guard does not rely on it."""
    refused = await api_client.request(method, "/api/proxies/vpn", headers={"origin": _ATTACKER})

    assert refused.status_code == 403


@pytest.mark.integration
@pytest.mark.parametrize(
    "headers",
    [
        {"origin": f"http://{_HOST}"},
        {"origin": "https://mousetrap.example", "sec-fetch-site": "same-origin"},
        {},
    ],
)
async def test_this_apps_own_pages_and_non_browser_clients_still_save(
    api_client: AsyncClient, monkeypatch: pytest.MonkeyPatch, headers: dict[str, str]
) -> None:
    """The UI over LAN HTTP, the UI over HTTPS, and a script all keep working."""
    monkeypatch.setattr(app, "register_session_job", lambda _label: None)
    await _save_session(api_client, "real-cookie")

    saved = await api_client.post(
        "/api/session/save",
        headers=headers,
        json={"label": "victim", "mam": {"mam_id": "new-cookie"}},
    )

    assert saved.is_success
    assert await _stored_mam_id(api_client) == "new-cookie"


@pytest.mark.integration
async def test_reads_are_left_to_the_same_origin_policy(api_client: AsyncClient) -> None:
    """A cross-site page cannot read a response, so safe methods are not refused."""
    listed = await api_client.get(
        "/api/sessions", headers={"origin": _ATTACKER, "sec-fetch-site": "cross-site"}
    )

    assert listed.status_code == 200
