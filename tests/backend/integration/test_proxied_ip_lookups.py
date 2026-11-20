"""Coverage for which third-party IP lookups a proxied session sends directly.

Detecting the host's own public IP must not use the proxy — that lookup exists
to report the unproxied address. Looking up the *proxy's* address is the
opposite case: sending it directly tells a geo provider, from the user's real
IP, which seedbox address to associate with it.
"""

from typing import Any

import pytest

from backend import app

_PROXIED_IP = "203.0.113.9"
_PROXY = {"label": "vpn", "host": "proxy.internal", "port": 8080}


def _resolve_proxy(_cfg: dict[str, Any]) -> dict[str, str | int]:
    """Stand in for ``resolve_proxy_from_session_cfg`` on a session bound to the proxy."""
    return _PROXY


def _load_session(_label: str) -> dict[str, Any]:
    """Stand in for ``load_session`` with a fresh copy of the proxied session."""
    return _cfg()


def _discard_save(*_a: object, **_k: object) -> None:
    """Stand in for ``save_session`` so nothing is persisted."""


def _discard_event(_event: dict[str, Any]) -> None:
    """Stand in for ``append_ui_event_log`` so no event is written."""


def _cfg() -> dict[str, Any]:
    """Build a session bound to a resolvable proxy with a known proxied IP."""
    return {
        "label": "seedbox",
        "mam": {"mam_id": "cookie", "ip_monitoring_mode": "auto"},
        "proxy": {"label": "vpn"},
        "proxied_public_ip": _PROXIED_IP,
        "last_seedbox_ip": _PROXIED_IP,
        "mam_ip": "",
    }


def _install(monkeypatch: pytest.MonkeyPatch) -> list[tuple[str, bool]]:
    """Record every ASN lookup as (ip, whether a proxy was supplied).

    Args:
        monkeypatch: Fixture used to replace the module's collaborators.

    Returns:
        The list each lookup is appended to.

    """
    seen: list[tuple[str, bool]] = []

    async def asn(
        ip: str, proxy_cfg: dict[str, Any] | None = None, ipinfo_data: Any = None
    ) -> tuple[str | None, str | None]:
        seen.append((ip, proxy_cfg is not None))
        return ("AS64496 Example", None)

    async def ipinfo(
        ip: str | None = None, proxy_cfg: dict[str, Any] | None = None
    ) -> dict[str, Any]:
        return {"ip": _PROXIED_IP if proxy_cfg else "198.51.100.7", "asn": "AS64496"}

    async def noop(*_args: Any, **_kwargs: Any) -> Any:
        return None

    async def proxied_ip(_cfg: dict[str, Any]) -> None:
        """Report that the proxied address could not be looked up."""
        await noop()

    monkeypatch.setattr(app, "get_asn_and_timezone_from_ip", asn)
    monkeypatch.setattr(app, "get_ipinfo_with_fallback", ipinfo)
    monkeypatch.setattr(app, "get_proxied_public_ip", proxied_ip)
    monkeypatch.setattr(app, "resolve_proxy_from_session_cfg", _resolve_proxy)
    monkeypatch.setattr(app, "load_session", _load_session)
    monkeypatch.setattr(app, "list_sessions", lambda: ["seedbox"])
    monkeypatch.setattr(app, "save_session", _discard_save)

    async def status(*_args: Any, **_kwargs: Any) -> dict[str, Any]:
        return {"mam_cookie_exists": True, "points": 1000, "raw": {}}

    monkeypatch.setattr(app, "get_status", status)
    monkeypatch.setattr(app, "append_ui_event_log", _discard_event)
    monkeypatch.setattr(app, "safe_notify_event", noop)
    return seen


@pytest.mark.integration
async def test_the_scheduled_check_looks_up_the_proxied_ip_through_the_proxy(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Every lookup of the proxy's own address goes through the proxy."""
    seen = _install(monkeypatch)

    await app.session_check_job("seedbox")

    proxied_lookups = [(ip, used) for ip, used in seen if ip == _PROXIED_IP]
    assert proxied_lookups, "expected the job to look up the proxied IP"
    assert all(used for _ip, used in proxied_lookups), (
        f"a lookup of the proxied IP was sent directly: {proxied_lookups}"
    )


@pytest.mark.integration
async def test_the_status_endpoint_looks_up_the_proxied_ip_through_the_proxy(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """The same holds for the lookup driven by the UI."""
    seen = _install(monkeypatch)

    await app.api_status(label="seedbox", force=1)

    proxied_lookups = [(ip, used) for ip, used in seen if ip == _PROXIED_IP]
    assert proxied_lookups, "expected the status check to look up the proxied IP"
    assert all(used for _ip, used in proxied_lookups), (
        f"a lookup of the proxied IP was sent directly: {proxied_lookups}"
    )
