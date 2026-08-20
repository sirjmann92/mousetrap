"""Backend IP lookup tests for provider-chain response handling."""

from collections.abc import Generator
from types import TracebackType
from typing import Any, Self

import pytest

from backend import ip_lookup

# ip-api.com, ipinfo.io standard, and ipdata.co: the providers offered for a
# specific IP once the two token-gated entries are removed from the chain.
PROVIDERS_FOR_A_SPECIFIC_IP = 3


class _Noop:
    """Awaitable no-op mirroring the return value of ``aiohttp`` ``release()``."""

    def __await__(self) -> Generator[None]:
        """Yield once so the value is awaitable but harmless when discarded."""
        yield


class _StubResponse:
    """Stub ``aiohttp`` response that counts how often it is released."""

    def __init__(self, payload: Any, status: int = 200) -> None:
        """Record the payload and status this stub replays to the caller.

        Args:
            payload: Value returned by ``json()``, or rendered by ``text()``.
            status: HTTP status the stub reports.

        """
        self.status = status
        self.releases = 0
        self._payload = payload

    async def json(self) -> Any:
        """Return the configured payload."""
        return self._payload

    async def text(self) -> str:
        """Return the configured payload rendered as text."""
        return str(self._payload)

    def release(self) -> _Noop:
        """Count the release and return an awaitable, as ``aiohttp`` does."""
        self.releases += 1
        return _Noop()

    async def __aenter__(self) -> Self:
        """Enter the response context."""
        return self

    async def __aexit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        tb: TracebackType | None,
    ) -> None:
        """Release the response on every exit path, as ``aiohttp`` does."""
        self.release()


class _StubRequest:
    """Stub request handle that is both awaitable and an async context manager."""

    def __init__(self, response: _StubResponse) -> None:
        """Bind the response this handle resolves to.

        Args:
            response: Response returned by both the await and the context entry.

        """
        self._response = response

    def __await__(self) -> Generator[Any, None, _StubResponse]:
        """Resolve to the response, matching an un-managed ``session.get()``."""
        return self._resolve().__await__()

    async def _resolve(self) -> _StubResponse:
        """Return the bound response."""
        return self._response

    async def __aenter__(self) -> _StubResponse:
        """Enter the underlying response context."""
        return await self._response.__aenter__()

    async def __aexit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        tb: TracebackType | None,
    ) -> None:
        """Exit the underlying response context."""
        await self._response.__aexit__(exc_type, exc, tb)


class _StubSession:
    """Stub ``aiohttp`` session handing out one prepared response per request."""

    def __init__(self, response_factory: Any) -> None:
        """Bind the factory that builds a response per request.

        Args:
            response_factory: Zero-argument callable returning a stub response.

        """
        self.responses: list[_StubResponse] = []
        self._response_factory = response_factory

    def get(self, _url: str, **_kwargs: Any) -> _StubRequest:
        """Return a request handle for a freshly built response."""
        response = self._response_factory()
        self.responses.append(response)
        return _StubRequest(response)

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
def stub_lookup_chain(monkeypatch: pytest.MonkeyPatch) -> Any:
    """Replace the provider chain's session and cache with test-local doubles."""
    monkeypatch.delenv("IPINFO_TOKEN", raising=False)
    monkeypatch.delenv("IPDATA_API_KEY", raising=False)
    monkeypatch.setattr(ip_lookup, "_ip_cache", {})
    monkeypatch.setattr(ip_lookup, "_last_cache_log_time", {})

    def install(response_factory: Any) -> _StubSession:
        """Install a stub session built from the supplied response factory.

        Args:
            response_factory: Zero-argument callable returning a stub response.

        Returns:
            The stub session the lookup will use, for post-run assertions.

        """
        session = _StubSession(response_factory)
        monkeypatch.setattr(
            ip_lookup.aiohttp, "ClientSession", lambda **_kwargs: session, raising=True
        )
        return session

    return install


async def test_response_is_released_when_normalization_raises(stub_lookup_chain: Any) -> None:
    """Release the response even when parsing the decoded payload raises."""
    # A JSON list decodes cleanly and then fails the provider normalizers, which
    # all call `data.get(...)`, so the failure lands on the outer error path.
    session = stub_lookup_chain(lambda: _StubResponse([]))

    result = await ip_lookup.get_ipinfo_with_fallback("203.0.113.7")

    assert result == {"ip": None, "asn": None, "org": "", "timezone": None}
    assert len(session.responses) == PROVIDERS_FOR_A_SPECIFIC_IP
    assert [response.releases for response in session.responses] == [
        1
    ] * PROVIDERS_FOR_A_SPECIFIC_IP


async def test_response_is_released_on_a_non_200_status(stub_lookup_chain: Any) -> None:
    """Release the response when a provider answers with a non-200 status."""
    session = stub_lookup_chain(lambda: _StubResponse({}, status=503))

    result = await ip_lookup.get_ipinfo_with_fallback("203.0.113.7")

    assert result == {"ip": None, "asn": None, "org": "", "timezone": None}
    assert [response.releases for response in session.responses] == [
        1
    ] * PROVIDERS_FOR_A_SPECIFIC_IP


async def test_response_is_released_on_invalid_json(
    monkeypatch: pytest.MonkeyPatch, stub_lookup_chain: Any
) -> None:
    """Release the response when a provider body fails to decode as JSON."""

    async def raise_decode_error(_self: _StubResponse) -> Any:
        """Fail as an undecodable body would."""
        raise ValueError("not json")

    monkeypatch.setattr(_StubResponse, "json", raise_decode_error)
    session = stub_lookup_chain(lambda: _StubResponse(None))

    result = await ip_lookup.get_ipinfo_with_fallback("203.0.113.7")

    assert result == {"ip": None, "asn": None, "org": "", "timezone": None}
    assert [response.releases for response in session.responses] == [
        1
    ] * PROVIDERS_FOR_A_SPECIFIC_IP


async def test_response_is_released_on_the_success_path(stub_lookup_chain: Any) -> None:
    """Release the response once a provider returns a usable payload."""
    session = stub_lookup_chain(
        lambda: _StubResponse({"ip": "203.0.113.7", "asn": {"asn": "64500", "name": "TEST-NET"}})
    )

    result = await ip_lookup.get_ipinfo_with_fallback("203.0.113.7")

    assert result["ip"] == "203.0.113.7"
    assert result["asn"] == "AS64500 TEST-NET"
    assert len(session.responses) == 1
    assert session.responses[0].releases == 1
