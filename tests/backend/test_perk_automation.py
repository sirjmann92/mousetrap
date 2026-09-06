"""Backend perk automation tests for the headers the bonusBuy purchases send."""

from types import TracebackType
from typing import Any, Self

import pytest

from backend import perk_automation

# The four fields a bonusBuy.php purchase presents together, in the order the
# shared constant declares them.
BONUS_HEADER_NAMES = ("User-Agent", "Accept", "Accept-Language", "Referer")

# Not a session cookie. The stub transport sends nothing anywhere, and no real
# mam_id is read, constructed, or logged by these tests.
PLACEHOLDER_MAM_ID = "not-a-session-cookie"


class _StubResponse:
    """Stub ``aiohttp`` response replaying a successful purchase."""

    status = 200

    async def json(self) -> Any:
        """Return the payload a successful purchase decodes to."""
        return {"success": True}

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


class _StubRequest:
    """Stub request handle usable as an async context manager, as ``get()`` is."""

    def __init__(self, response: _StubResponse) -> None:
        """Bind the response this handle resolves to.

        Args:
            response: Response returned when the context is entered.

        """
        self._response = response

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
    """Stub ``aiohttp`` session recording the headers of every request made."""

    def __init__(self) -> None:
        """Start with no recorded requests."""
        self.headers_sent: list[dict[str, str]] = []

    def get(self, _url: str, *, headers: dict[str, str], **_kwargs: Any) -> _StubRequest:
        """Record the request headers and hand back a successful response.

        Args:
            _url: Request URL, unused because no request leaves the process.
            headers: Request headers, recorded for the assertions below.
            **_kwargs: Cookies, proxy and proxy auth, none of which are asserted.

        Returns:
            A request handle resolving to a successful stub response.

        """
        self.headers_sent.append(headers)
        return _StubRequest(_StubResponse())

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
def bonus_buy_session(monkeypatch: pytest.MonkeyPatch) -> _StubSession:
    """Replace the purchase transport with a double that records its headers."""
    session = _StubSession()
    monkeypatch.setattr(
        perk_automation.aiohttp, "ClientSession", lambda **_kwargs: session, raising=True
    )
    return session


async def _buy_one_of_each() -> None:
    """Run every purchase the module offers, one call each."""
    await perk_automation.buy_upload_credit(1, mam_id=PLACEHOLDER_MAM_ID)
    await perk_automation.buy_vip(PLACEHOLDER_MAM_ID)


async def test_every_purchase_sends_identical_headers(bonus_buy_session: _StubSession) -> None:
    """Present one identity across the upload credit and VIP purchases."""
    await _buy_one_of_each()

    upload_credit, vip = bonus_buy_session.headers_sent
    assert upload_credit == vip


async def test_every_purchase_sends_all_four_header_fields(
    bonus_buy_session: _StubSession,
) -> None:
    """Send the whole header set, so a partial update cannot pass unnoticed."""
    await _buy_one_of_each()

    assert [tuple(headers) for headers in bonus_buy_session.headers_sent] == [
        BONUS_HEADER_NAMES
    ] * len(bonus_buy_session.headers_sent)
