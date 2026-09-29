"""Coverage for adopting the MAM ID that MAM rolls on each response.

MAM rolls the `mam_id` cookie on every response, and saving the new value is
what keeps a session alive indefinitely. Four requests read it: the status
check, the daily keepalive, and the automatic and manual seedbox updates. All
four adopt it from a response MAM accepted. None may adopt it from a refusal:
three did, so a refusal that cleared the cookie replaced a working MAM ID with
the clearing value and pushed it to every indexer.
"""

from datetime import UTC, datetime
from http.cookies import SimpleCookie
import json
from pathlib import Path
from types import TracebackType
from typing import Any, Self

from httpx import AsyncClient
import pytest

from backend import app, config, mam_api
from backend.mam_api import rotated_mam_id

_WORKING = "working-cookie"
_ROLLED = "rolled-cookie"
_NOW = datetime(2026, 9, 29, 12, 0, tzinfo=UTC)

# A normal accepted reply, rolling the cookie as MAM does on every response.
_ACCEPTED: dict[str, Any] = {
    "status": 200,
    "body": {"Success": True, "msg": "Completed"},
    "cookie": (_ROLLED, {"max-age": "2592000"}),
}
# A refusal that also clears the cookie, the standard way to log a client out.
_REFUSED_CLEARING: dict[str, Any] = {
    "status": 403,
    "body": {"Success": False, "msg": "Invalid session - Invalid Cookie"},
    "cookie": ("deleted", {"max-age": "0"}),
}


def _cookies(value: str, attributes: dict[str, str]) -> SimpleCookie:
    """Build the cookies a response set, as aiohttp exposes them.

    Args:
        value: The `mam_id` value.
        attributes: Cookie attributes such as `max-age` or `expires`.

    Returns:
        A cookie jar holding one `mam_id` morsel.
    """
    jar: SimpleCookie = SimpleCookie()
    jar["mam_id"] = value
    for name, attribute in attributes.items():
        jar["mam_id"][name] = attribute
    return jar


class _Response:
    """Stub MAM response with a status, a JSON body, and the cookies it set."""

    def __init__(self, reply: dict[str, Any]) -> None:
        """Record the reply this stub replays.

        Args:
            reply: `status`, `body` and `cookie` for the response.
        """
        self.status = reply["status"]
        self._body = reply["body"]
        self.cookies = _cookies(*reply["cookie"])

    async def text(self) -> str:
        """Return the body as JSON text, as MAM sends it."""
        return json.dumps(self._body)

    async def json(self, **_kwargs: Any) -> Any:
        """Return the decoded body."""
        return self._body

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
    """Stub aiohttp session answering every request with one reply."""

    def __init__(self, reply: dict[str, Any]) -> None:
        """Bind the reply.

        Args:
            reply: The reply every request receives.
        """
        self._reply = reply

    def get(self, *_args: Any, **_kwargs: Any) -> _Response:
        """Answer the request."""
        return _Response(self._reply)

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


@pytest.mark.parametrize(
    ("status", "value", "attributes", "adopted"),
    [
        (200, _ROLLED, {"max-age": "2592000"}, _ROLLED),
        (200, _ROLLED, {}, _ROLLED),
        (200, _ROLLED, {"expires": "Fri, 01 Jan 2100 00:00:00 GMT"}, _ROLLED),
        # A refusal is never trusted, whatever it sets.
        (403, _ROLLED, {"max-age": "2592000"}, None),
        (429, _ROLLED, {}, None),
        (500, _ROLLED, {}, None),
        # A cookie that deletes itself is never adopted, whatever the status.
        (200, "deleted", {"max-age": "0"}, None),
        (200, "deleted", {"max-age": "-1"}, None),
        (200, "deleted", {"expires": "Thu, 01 Jan 1970 00:00:00 GMT"}, None),
        # When in doubt, keep the cookie that works.
        (200, "", {}, None),
        (200, "   ", {}, None),
        (200, _ROLLED, {"max-age": "soon"}, None),
        (200, _ROLLED, {"expires": "whenever"}, None),
    ],
)
def test_rotated_mam_id(
    status: int, value: str, attributes: dict[str, str], adopted: str | None
) -> None:
    """Only a new, live cookie on an accepted response is adopted."""
    assert rotated_mam_id(status, _cookies(value, attributes)) == adopted


def test_a_response_that_set_no_cookie_adopts_nothing() -> None:
    """Most test stubs, and some real responses, set no cookie at all."""
    assert rotated_mam_id(200, {}) is None


def _record_pushes(monkeypatch: pytest.MonkeyPatch) -> list[str | None]:
    """Record every push of a new MAM ID to the indexers.

    Args:
        monkeypatch: Fixture used to replace the push.

    Returns:
        The MAM IDs pushed, in order.
    """
    pushed: list[str | None] = []

    async def push(_cfg: Any, _label: str, new: str | None, _prev: str | None) -> None:
        pushed.append(new)

    monkeypatch.setattr(app, "_sync_integrations_if_mam_id_changed", push)
    return pushed


def _save_session() -> None:
    """Persist a session holding the working cookie."""
    config.save_session(
        {
            "label": "seedbox",
            "mam": {"mam_id": _WORKING, "session_type": "ip"},
            "mam_ip": "192.0.2.10",
            "last_seedbox_ip": "192.0.2.1",
        }
    )


def _stored() -> str:
    """Read back the MAM ID the session holds on disk."""
    return str(config.load_session("seedbox")["mam"]["mam_id"])


@pytest.mark.integration
@pytest.mark.parametrize(
    ("reply", "stored", "pushed"),
    [(_ACCEPTED, _ROLLED, [_ROLLED]), (_REFUSED_CLEARING, _WORKING, [])],
    ids=["accepted", "refused"],
)
async def test_the_keepalive(
    isolated_backend: Path,
    monkeypatch: pytest.MonkeyPatch,
    reply: dict[str, Any],
    stored: str,
    pushed: list[str],
) -> None:
    """The keepalive adopted a refusal's cookie whatever MAM's verdict was."""
    pushes = _record_pushes(monkeypatch)
    monkeypatch.setattr(app, "resolve_proxy_from_session_cfg", lambda _cfg: None)
    monkeypatch.setattr(app.aiohttp, "ClientSession", lambda **_kwargs: _Session(reply))
    _save_session()

    await app.keepalive_mam_session(config.load_session("seedbox"), "seedbox", _NOW)

    assert _stored() == stored
    assert pushes == pushed


@pytest.mark.integration
@pytest.mark.parametrize(
    ("reply", "stored", "pushed"),
    [(_ACCEPTED, _ROLLED, [_ROLLED]), (_REFUSED_CLEARING, _WORKING, [])],
    ids=["accepted", "refused"],
)
async def test_the_automatic_seedbox_update(
    isolated_backend: Path,
    monkeypatch: pytest.MonkeyPatch,
    reply: dict[str, Any],
    stored: str,
    pushed: list[str],
) -> None:
    """The scheduled seedbox update saved a refusal's cookie before its verdict."""
    pushes = _record_pushes(monkeypatch)

    async def detected() -> str:
        return "198.51.100.7"

    monkeypatch.setattr(app, "get_public_ip", detected)
    monkeypatch.setattr(app, "resolve_proxy_from_session_cfg", lambda _cfg: None)
    monkeypatch.setattr(app.aiohttp, "ClientSession", lambda **_kwargs: _Session(reply))
    _save_session()

    await app.auto_update_seedbox_if_needed(
        config.load_session("seedbox"), "seedbox", "198.51.100.7", "64500", _NOW
    )

    assert _stored() == stored
    assert pushes == pushed


@pytest.mark.integration
@pytest.mark.parametrize(
    ("reply", "stored", "pushed"),
    [(_ACCEPTED, _ROLLED, [_ROLLED]), (_REFUSED_CLEARING, _WORKING, [])],
    ids=["accepted", "refused"],
)
async def test_the_update_seedbox_button(
    api_client: AsyncClient,
    monkeypatch: pytest.MonkeyPatch,
    reply: dict[str, Any],
    stored: str,
    pushed: list[str],
) -> None:
    """The Update Seedbox button saved a refusal's cookie before its verdict.

    The button registers the current IP with MAM. It never sets out to change
    the cookie, but MAM's reply rolls it like any other.
    """
    pushes = _record_pushes(monkeypatch)

    async def asn(*_args: Any, **_kwargs: Any) -> tuple[str, None]:
        return ("AS64500 Example", None)

    monkeypatch.setattr(app, "get_asn_and_timezone_from_ip", asn)
    monkeypatch.setattr(app, "resolve_proxy_from_session_cfg", lambda _cfg: None)
    monkeypatch.setattr(app.aiohttp, "ClientSession", lambda **_kwargs: _Session(reply))
    _save_session()

    await api_client.post("/api/session/update_seedbox", json={"label": "seedbox"})

    assert _stored() == stored
    assert pushes == pushed


@pytest.mark.integration
@pytest.mark.parametrize(
    ("reply", "adopted"),
    [(_ACCEPTED, _ROLLED), (_REFUSED_CLEARING, None)],
    ids=["accepted", "refused"],
)
async def test_the_status_check(
    monkeypatch: pytest.MonkeyPatch, reply: dict[str, Any], adopted: str | None
) -> None:
    """The status check was already safe; this keeps it that way."""
    body = {"seedbonus": 1000} if reply is _ACCEPTED else reply["body"]
    monkeypatch.setattr(
        mam_api.aiohttp, "ClientSession", lambda **_kwargs: _Session({**reply, "body": body})
    )

    result = await mam_api.get_status(_WORKING)

    assert result.get("updated_mam_id") == adopted
