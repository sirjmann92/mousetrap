"""Backend MAM API tests for the proxied public IP lookup and status failures."""

import logging
from types import TracebackType
from typing import Any, Self

import aiohttp
import pytest

from backend import mam_api

# `build_proxy_dict` renders host and port into the URL the lookup must proxy through.
PROXY_CFG = {"host": "proxy.invalid", "port": 8080}
PROXY_URL = "http://proxy.invalid:8080"
IPIFY_URL = "https://api.ipify.org"


class _StubResponse:
    """Stub ``aiohttp`` response replaying a fixed status and body."""

    def __init__(self, body: str, status: int) -> None:
        """Record the status and body this stub replays to the caller.

        Args:
            body: Text returned by ``text()``.
            status: HTTP status the stub reports.

        """
        self.status = status
        self.cookies: dict[str, Any] = {}
        self._body = body

    async def text(self) -> str:
        """Return the configured body."""
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


class _StubSession:
    """Stub ``aiohttp`` session recording each request and replaying one outcome."""

    def __init__(self, outcome: _StubResponse | Exception) -> None:
        """Bind the outcome every request replays.

        Args:
            outcome: Response to hand back, or exception to raise from ``get()``.

        """
        self.requests: list[tuple[str, str | None]] = []
        self._outcome = outcome

    def get(self, url: str, *, proxy: str | None = None, **_kwargs: Any) -> _StubResponse:
        """Record the requested URL and proxy, then replay the configured outcome."""
        self.requests.append((url, proxy))
        if isinstance(self._outcome, Exception):
            raise self._outcome
        return self._outcome

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


@pytest.fixture
def stub_session(monkeypatch: pytest.MonkeyPatch) -> Any:
    """Replace the lookup's ``aiohttp`` session with a test-local double."""

    def install(outcome: _StubResponse | Exception) -> _StubSession:
        """Install a stub session replaying the supplied outcome.

        Args:
            outcome: Response to hand back, or exception to raise from ``get()``.

        Returns:
            The stub session the lookup will use, for post-run assertions.

        """
        session = _StubSession(outcome)
        monkeypatch.setattr(
            mam_api.aiohttp, "ClientSession", lambda **_kwargs: session, raising=True
        )
        return session

    return install


async def test_returns_the_trimmed_body_on_a_200(stub_session: Any) -> None:
    """Return the response body, stripped, when the provider answers 200."""
    session = stub_session(_StubResponse(" 203.0.113.7\n", 200))

    result = await mam_api.get_proxied_public_ip(PROXY_CFG)

    assert result == "203.0.113.7"
    assert session.requests == [(IPIFY_URL, PROXY_URL)]


async def test_returns_none_on_a_non_200(stub_session: Any) -> None:
    """Return None, without logging, when the provider answers a non-200 status."""
    session = stub_session(_StubResponse("service unavailable", 503))

    result = await mam_api.get_proxied_public_ip(PROXY_CFG)

    assert result is None
    assert session.requests == [(IPIFY_URL, PROXY_URL)]


async def test_warns_and_returns_none_when_the_request_raises(
    caplog: pytest.LogCaptureFixture, stub_session: Any
) -> None:
    """Log a warning and return None when the proxied request raises."""
    stub_session(aiohttp.ClientError("proxy refused"))

    with caplog.at_level(logging.WARNING, logger=mam_api.__name__):
        result = await mam_api.get_proxied_public_ip(PROXY_CFG)

    assert result is None
    assert "[get_proxied_public_ip] Failed: proxy refused" in caplog.text


async def test_returns_none_without_a_request_when_no_proxy_is_configured(
    stub_session: Any,
) -> None:
    """Return None before any request when the config resolves to no proxy."""
    session = stub_session(_StubResponse("203.0.113.7", 200))

    result = await mam_api.get_proxied_public_ip({})

    assert result is None
    assert session.requests == []


def _assert_status_failure_shape(result: dict[str, Any]) -> None:
    """Assert the payload every ``get_status`` failure path returns.

    Args:
        result: Value returned by ``get_status``.

    """
    assert list(result) == [
        "mam_cookie_exists",
        "points",
        "wedge_active",
        "vip_active",
        "message",
    ]
    assert result["mam_cookie_exists"] is False
    assert result["points"] is None
    assert result["wedge_active"] is None
    assert result["vip_active"] is None


async def test_status_without_a_mam_id_returns_the_failure_payload() -> None:
    """Report the missing mam_id without reaching the network."""
    result = await mam_api.get_status("")

    _assert_status_failure_shape(result)
    assert result["message"] == "No MaM ID provided."


async def test_status_on_unparseable_json_returns_the_failure_payload(
    stub_session: Any,
) -> None:
    """Report a 200 that is not JSON, quoting the body MAM actually sent."""
    stub_session(_StubResponse("<html>maintenance</html>", 200))

    result = await mam_api.get_status("cookie")

    _assert_status_failure_shape(result)
    assert result["message"].startswith("MaM API did not return valid JSON: ")
    assert result["message"].endswith(". Response: <html>maintenance</html>")


async def test_status_on_a_request_failure_returns_the_failure_payload(
    stub_session: Any,
) -> None:
    """Report a failed request, carrying the redacted reason."""
    stub_session(aiohttp.ClientError("proxy refused"))

    result = await mam_api.get_status("cookie")

    _assert_status_failure_shape(result)
    assert result["message"] == "Failed to fetch status: proxy refused"


async def test_status_on_an_http_error_returns_the_failure_payload(
    stub_session: Any,
) -> None:
    """Report an HTTP error through the same payload, quoting the body."""
    stub_session(_StubResponse("Invalid session", 403))

    result = await mam_api.get_status("cookie")

    _assert_status_failure_shape(result)
    assert result["message"] == "Failed to fetch status: HTTP 403: Invalid session"


async def test_status_success_keeps_its_own_distinct_payload(stub_session: Any) -> None:
    """The success path shares no shape with the failures and must stay separate."""
    stub_session(_StubResponse('{"seedbonus": 1200, "wedge_active": true}', 200))

    result = await mam_api.get_status("cookie")

    assert list(result) == [
        "mam_cookie_exists",
        "points",
        "wedge_active",
        "vip_active",
        "updated_mam_id",
        "raw",
    ]
    assert result["mam_cookie_exists"] is True
    assert result["points"] == 1200
    assert "message" not in result


async def test_mam_seen_ip_info_reports_a_non_object_response() -> None:
    """A JSON array from MAM is reported, not handed back as a mapping.

    `get_mam_seen_ip_info` declares a dict and its callers index it like one, so
    a list would previously have surfaced as an AttributeError somewhere
    downstream rather than as this function's own error.
    """

    class _ListResponse:
        status = 200

        async def json(self) -> Any:
            return ["not", "an", "object"]

        async def text(self) -> str:
            return "[]"

        async def __aenter__(self) -> Self:
            return self

        async def __aexit__(self, *_exc: object) -> None:
            """Leave the response context."""

    class _Session:
        def get(self, *_args: Any, **_kwargs: Any) -> _ListResponse:
            return _ListResponse()

        async def __aenter__(self) -> Self:
            return self

        async def __aexit__(self, *_exc: object) -> None:
            """Leave the session context."""

    with pytest.MonkeyPatch.context() as mp:
        mp.setattr(mam_api.aiohttp, "ClientSession", lambda **_k: _Session(), raising=True)
        result = await mam_api.get_mam_seen_ip_info("cookie", proxy_cfg={})

    assert "error" in result
    assert "list" in result["error"]
