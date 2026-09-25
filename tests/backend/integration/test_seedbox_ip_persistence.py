"""Coverage for what an accepted seedbox IP update writes back to the session.

Two writers record the same seedbox state. `auto_update_seedbox_if_needed` does
it for the scheduled check, and `POST /api/session/update_seedbox` does it for
the button in the UI. Each writes it twice, once for MaM's success reply and
once for its "No change" reply, and MaM returns the latter often enough that the
second block is not an edge case.

The two writers deliberately disagree about one field: the scheduled check
rewrites ``mam_ip`` to the address it just detected, because that address is the
one it told MaM about, while the manual route leaves the address the user typed
exactly as typed. These tests pin both sides of that disagreement, so folding
the four blocks into a single shared helper fails here rather than silently
normalising an entered value.
"""

from datetime import UTC, datetime
import logging
from types import TracebackType
from typing import Any, Self

from httpx import AsyncClient
import pytest

from backend import app, config

_DETECTED_IP = "198.51.100.7"
_PROXIED_IP = "203.0.113.9"
_ENTERED_IP = "203.0.113.4"
_STALE_IP = "192.0.2.1"
_STALE_ASN = "64500"
_ASN = "64496"
_NOW = datetime(2026, 1, 2, 3, 4, 5, tzinfo=UTC)
_PROXY = {"label": "vpn", "host": "proxy.internal", "port": 8080}

_ACCEPTED_REPLIES = [
    {"Success": True, "msg": "Completed"},
    {"Success": False, "msg": "No change"},
]


class _Response:
    """Stub ``aiohttp`` response replaying one ``dynamicSeedbox.php`` reply."""

    def __init__(self, payload: dict[str, Any]) -> None:
        """Record what this stub replays.

        Args:
            payload: Decoded JSON body returned by ``json()``.

        """
        self.status = 200
        self.cookies: dict[str, Any] = {}
        self._payload = payload

    async def json(self) -> dict[str, Any]:
        """Return the configured payload."""
        return self._payload

    async def text(self) -> str:
        """Return the configured payload rendered as text."""
        return str(self._payload)

    async def __aenter__(self) -> Self:
        """Enter the response context."""
        return self

    async def __aexit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        tb: TracebackType | None,
    ) -> None:
        """Exit the response context."""


class _Session:
    """Stub ``aiohttp`` session replaying one response to the seedbox call."""

    def __init__(self, payload: dict[str, Any]) -> None:
        """Bind the reply every request replays.

        Args:
            payload: Decoded JSON body the seedbox endpoint returns.

        """
        self._payload = payload

    def get(self, *_args: Any, **_kwargs: Any) -> _Response:
        """Replay the configured reply."""
        return _Response(self._payload)

    async def __aenter__(self) -> Self:
        """Enter the session context."""
        return self

    async def __aexit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        tb: TracebackType | None,
    ) -> None:
        """Exit the session context."""


def _stale_session() -> dict[str, Any]:
    """Build an IP-locked session whose recorded seedbox IP and ASN are stale."""
    return {
        "label": "seedbox",
        "mam": {"mam_id": "cookie", "session_type": "ip"},
        "mam_ip": _STALE_IP,
        "last_seedbox_ip": _STALE_IP,
        "last_seedbox_asn": _STALE_ASN,
    }


def _install_scheduled_check(
    monkeypatch: pytest.MonkeyPatch,
    payload: dict[str, Any],
    proxy: dict[str, Any] | None = None,
) -> tuple[list[dict[str, Any]], list[str]]:
    """Point the scheduled check at one stubbed MaM reply and record what it does.

    Args:
        monkeypatch: Fixture used to replace the check's collaborators.
        payload: Decoded JSON body the stubbed seedbox endpoint returns.
        proxy: Proxy the session resolves to, or None for a direct session.

    Returns:
        Two lists: a snapshot of the config on every save, and one entry per
        lookup of the host's own unproxied address.

    """
    saved: list[dict[str, Any]] = []
    direct_lookups: list[str] = []

    async def detected_ip() -> str:
        direct_lookups.append(_DETECTED_IP)
        return _DETECTED_IP

    async def noop(*_args: Any, **_kwargs: Any) -> None:
        return None

    monkeypatch.setattr(app, "get_public_ip", detected_ip)
    monkeypatch.setattr(app, "resolve_proxy_from_session_cfg", lambda _cfg: proxy)
    monkeypatch.setattr(app, "apply_mam_validity_classification", noop)
    monkeypatch.setattr(app, "safe_notify_event", noop)
    monkeypatch.setattr(app, "save_session", lambda cfg, **_kwargs: saved.append(dict(cfg)))
    monkeypatch.setattr(app.aiohttp, "ClientSession", lambda **_kwargs: _Session(payload))
    return saved, direct_lookups


def _install_manual_route(monkeypatch: pytest.MonkeyPatch, payload: dict[str, Any]) -> None:
    """Point the manual route at one stubbed MaM reply, leaving its saves real.

    Args:
        monkeypatch: Fixture used to replace the route's collaborators.
        payload: Decoded JSON body the stubbed seedbox endpoint returns.

    """

    async def asn_lookup(
        _ip: str, _proxy_cfg: dict[str, Any] | None = None
    ) -> tuple[str | None, str | None]:
        return (f"AS{_ASN} Example", None)

    monkeypatch.setattr(app, "get_asn_and_timezone_from_ip", asn_lookup)
    monkeypatch.setattr(app, "resolve_proxy_from_session_cfg", lambda _cfg: None)
    monkeypatch.setattr(app.aiohttp, "ClientSession", lambda **_kwargs: _Session(payload))


@pytest.mark.integration
@pytest.mark.parametrize("payload", _ACCEPTED_REPLIES, ids=["success", "no_change"])
async def test_the_scheduled_check_records_the_detected_address_on_every_accepted_reply(
    monkeypatch: pytest.MonkeyPatch, payload: dict[str, Any]
) -> None:
    """Both replies MaM accepts persist the same four fields.

    The "No change" reply is not a no-op: MaM already holds the new address, so
    the session has to catch up or every later check re-sends it.
    """
    cfg = _stale_session()
    saved, _direct = _install_scheduled_check(monkeypatch, payload)

    triggered, result = await app.auto_update_seedbox_if_needed(
        cfg, "seedbox", _DETECTED_IP, _ASN, _NOW
    )

    assert triggered
    assert result is not None
    assert result["success"] is True
    assert cfg["last_seedbox_ip"] == _DETECTED_IP
    assert cfg["mam_ip"] == _DETECTED_IP
    assert cfg["last_seedbox_asn"] == _ASN
    assert cfg["last_seedbox_update"] == _NOW.isoformat()
    assert saved, "an accepted update must be persisted"
    assert saved[-1]["last_seedbox_ip"] == _DETECTED_IP


@pytest.mark.integration
@pytest.mark.parametrize("payload", _ACCEPTED_REPLIES, ids=["success", "no_change"])
async def test_the_scheduled_check_records_the_proxied_address_for_a_proxied_session(
    monkeypatch: pytest.MonkeyPatch, payload: dict[str, Any]
) -> None:
    """A proxied session records the address MaM sees, and never looks up its own.

    The host's unproxied address is not merely the wrong value to record here,
    it is a value this session must not ask a third party for: doing so tells a
    geo provider, from the user's real address, which seedbox address to
    associate with it.
    """
    cfg = _stale_session()
    cfg["proxied_public_ip"] = _PROXIED_IP
    cfg["proxy"] = {"label": "vpn"}
    saved, direct = _install_scheduled_check(monkeypatch, payload, proxy=_PROXY)

    triggered, _result = await app.auto_update_seedbox_if_needed(
        cfg, "seedbox", _PROXIED_IP, _ASN, _NOW
    )

    assert triggered
    assert cfg["last_seedbox_ip"] == _PROXIED_IP
    assert cfg["mam_ip"] == _PROXIED_IP
    assert saved[-1]["last_seedbox_ip"] == _PROXIED_IP
    assert direct == [], f"a proxied session looked up its own address: {direct}"


@pytest.mark.integration
async def test_a_proxied_session_already_at_its_address_is_left_alone(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Change detection compares the proxied address, so a settled session is quiet.

    Comparing the host's own address instead would find a difference on every
    run of a proxied session and re-announce an address MaM already holds,
    which MaM answers with a rate limit.
    """
    cfg = _stale_session()
    cfg["proxied_public_ip"] = _PROXIED_IP
    cfg["proxy"] = {"label": "vpn"}
    cfg["last_seedbox_ip"] = _PROXIED_IP
    saved, direct = _install_scheduled_check(monkeypatch, _ACCEPTED_REPLIES[0], proxy=_PROXY)

    triggered, result = await app.auto_update_seedbox_if_needed(
        cfg, "seedbox", _PROXIED_IP, _ASN, _NOW
    )

    assert (triggered, result) == (False, None)
    assert saved == []
    assert direct == [], f"a proxied session looked up its own address: {direct}"


@pytest.mark.integration
@pytest.mark.parametrize("payload", _ACCEPTED_REPLIES, ids=["success", "no_change"])
async def test_the_scheduled_check_reports_success_when_the_save_fails(
    monkeypatch: pytest.MonkeyPatch, caplog: pytest.LogCaptureFixture, payload: dict[str, Any]
) -> None:
    """A refused write is logged rather than turning an accepted update into an error.

    MaM has already taken the new address by this point, so reporting failure
    would invite a retry MaM answers with a rate limit.
    """
    cfg = _stale_session()
    _install_scheduled_check(monkeypatch, payload)

    def refuse(*_args: Any, **_kwargs: Any) -> None:
        raise OSError("read-only file system")

    monkeypatch.setattr(app, "save_session", refuse)

    with caplog.at_level(logging.ERROR):
        triggered, result = await app.auto_update_seedbox_if_needed(
            cfg, "seedbox", _DETECTED_IP, _ASN, _NOW
        )

    assert triggered
    assert result is not None
    assert result["success"] is True
    assert "save_session failed" in caplog.text
    assert cfg["last_seedbox_ip"] == _DETECTED_IP


@pytest.mark.integration
@pytest.mark.parametrize("payload", _ACCEPTED_REPLIES, ids=["success", "no_change"])
async def test_the_manual_route_persists_the_entered_address_on_every_accepted_reply(
    api_client: AsyncClient, monkeypatch: pytest.MonkeyPatch, payload: dict[str, Any]
) -> None:
    """Both replies MaM accepts reach disk, read back through a real save."""
    config.save_session(_stale_session() | {"mam_ip": _ENTERED_IP})
    _install_manual_route(monkeypatch, payload)

    response = await api_client.post("/api/session/update_seedbox", json={"label": "seedbox"})

    assert response.status_code == 200
    assert response.json()["success"] is True
    stored = config.load_session("seedbox")
    assert stored["last_seedbox_ip"] == _ENTERED_IP
    assert stored["last_seedbox_asn"] == _ASN
    assert datetime.fromisoformat(stored["last_seedbox_update"]).tzinfo is not None


@pytest.mark.integration
async def test_the_manual_route_leaves_the_entered_address_exactly_as_entered(
    api_client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """``mam_ip`` is the user's input and the route never rewrites it.

    The route trims the entered value before sending it to MaM and records the
    trimmed form as the seedbox IP, but the field the user owns keeps whatever
    they typed. Padding is the only way to observe the two apart, since the
    trimmed value is otherwise identical.
    """
    config.save_session(_stale_session() | {"mam_ip": f"  {_ENTERED_IP}  "})
    _install_manual_route(monkeypatch, _ACCEPTED_REPLIES[0])

    response = await api_client.post("/api/session/update_seedbox", json={"label": "seedbox"})

    assert response.json()["ip"] == _ENTERED_IP
    stored = config.load_session("seedbox")
    assert stored["last_seedbox_ip"] == _ENTERED_IP
    assert stored["mam_ip"] == f"  {_ENTERED_IP}  "
