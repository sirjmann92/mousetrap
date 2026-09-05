"""Backend MAM API tests for the proxied public IP lookup."""

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
