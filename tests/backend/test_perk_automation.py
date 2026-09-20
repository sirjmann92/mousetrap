"""Backend perk automation tests for the headers the bonusBuy purchases send."""

from datetime import UTC, datetime, timedelta
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


class _RefusingResponse(_StubResponse):
    """Stub response replaying a MaM refusal, which arrives as HTTP 200."""

    def __init__(self, payload: Any) -> None:
        """Bind the refusal body this response decodes to.

        Args:
            payload: Decoded JSON body bonusBuy.php replies with.

        """
        self._payload = payload

    async def json(self) -> Any:
        """Return the refusal body."""
        return self._payload


class _RefusingSession(_StubSession):
    """Stub session whose every purchase is refused by MaM."""

    def __init__(self, payload: Any) -> None:
        """Bind the refusal body every request resolves to.

        Args:
            payload: Decoded JSON body bonusBuy.php replies with.

        """
        super().__init__()
        self._payload = payload

    def get(self, _url: str, *, headers: dict[str, str], **_kwargs: Any) -> _StubRequest:
        """Record the headers and hand back a refusal.

        Args:
            _url: Request URL, unused because no request leaves the process.
            headers: Request headers, recorded to match the base stub.
            **_kwargs: Cookies, proxy and proxy auth, none of which are asserted.

        Returns:
            A request handle resolving to a refusing stub response.

        """
        self.headers_sent.append(headers)
        return _StubRequest(_RefusingResponse(self._payload))


# MaM's verbatim wording when a VIP purchase would add less than a full week,
# captured in https://github.com/sirjmann92/mousetrap/issues/72.
MIN_VIP_REFUSAL = {
    "success": False,
    "error": "Min VIP is 1 week purchased for Automated methods",
}


@pytest.fixture
def refusing_session(monkeypatch: pytest.MonkeyPatch) -> _RefusingSession:
    """Replace the purchase transport with one that refuses every purchase."""
    session = _RefusingSession(MIN_VIP_REFUSAL)
    monkeypatch.setattr(
        perk_automation.aiohttp, "ClientSession", lambda **_kwargs: session, raising=True
    )
    return session


async def test_vip_refusal_reports_mam_wording(refusing_session: _RefusingSession) -> None:
    """Lift MaM's reason into ``error``, which every caller reads.

    A refusal arrives as HTTP 200 with the reason in the body. Leaving it only
    under ``response`` made every surface report ``Error: None`` (issue #145).
    """
    result = await perk_automation.buy_vip(PLACEHOLDER_MAM_ID)

    assert result["success"] is False
    assert result["error"] == "Min VIP is 1 week purchased for Automated methods"
    assert result["response"] == MIN_VIP_REFUSAL


async def test_upload_credit_refusal_reports_mam_wording(
    refusing_session: _RefusingSession,
) -> None:
    """Report the same way for upload credit, which dropped the reason too."""
    result = await perk_automation.buy_upload_credit(1, mam_id=PLACEHOLDER_MAM_ID)

    assert result["success"] is False
    assert result["error"] == "Min VIP is 1 week purchased for Automated methods"
    assert result["gb"] == 1


# hobesman's real reading from issue #145: MaM independently reported 12.765
# weeks remaining for this timestamp, which is what fixes the value as UTC.
REAL_VIP_UNTIL = {"vip_until": "2026-12-18 23:01:14"}
REAL_READING_AT = datetime(2026, 9, 20, 14, 43, 34, tzinfo=UTC)


def test_vip_days_remaining_matches_mam_own_figure() -> None:
    """Reproduce MaM's "12.765 weeks" from vip_until read as UTC.

    The tolerance covers the few minutes between reading the MaM page and
    posting the figure, and is far tighter than any timezone offset: the
    smallest whole hour is 0.006 weeks, so a site-local value could not land
    this close.
    """
    days = perk_automation.vip_days_remaining(REAL_VIP_UNTIL, now=REAL_READING_AT)

    assert days is not None
    assert abs(days / 7 - 12.765) < 0.003


def test_vip_purchase_is_blocked_with_too_much_banked() -> None:
    """Refuse the purchase MaM refused, and say when it becomes possible."""
    reason = perk_automation.vip_purchase_block_reason(REAL_VIP_UNTIL, now=REAL_READING_AT)

    assert "89.3 days remaining" in reason
    # 83 days before expiry, the point at which a full week fits under the cap.
    assert "2026-09-26 23:01 UTC" in reason


@pytest.mark.parametrize(
    "raw",
    [
        None,
        {},
        {"vip_until": ""},
        {"vip_until": "   "},
        {"vip_until": "not a date"},
        {"vip_until": 1766098874},
        [],
    ],
)
def test_unknown_vip_expiry_never_blocks(raw: Any) -> None:
    """Allow the purchase whenever the expiry cannot be read.

    Blocking wrongly stops a purchase the user cannot otherwise make; allowing
    wrongly costs one clear message from MaM, so the unknown case allows.
    """
    assert perk_automation.vip_purchase_block_reason(raw, now=REAL_READING_AT) == ""


@pytest.mark.parametrize(
    ("days_left", "blocked"),
    [(200.0, True), (89.4, True), (84.0, True), (83.5, True), (83.0, False), (1.0, False)],
)
def test_block_threshold_boundary(days_left: float, blocked: bool) -> None:
    """Block strictly above 83 days, allowing the boundary itself through.

    MaM caps VIP at 90 days and requires a purchase to add a full week, so
    83 days remaining is the last point at which one still fits.
    """
    raw = {"vip_until": (REAL_READING_AT + timedelta(days=days_left)).strftime("%Y-%m-%d %H:%M:%S")}

    reason = perk_automation.vip_purchase_block_reason(raw, now=REAL_READING_AT)

    assert bool(reason) is blocked


def test_lapsed_vip_is_not_blocked() -> None:
    """Never block when VIP has already expired."""
    raw = {"vip_until": "2020-01-01 00:00:00"}

    assert perk_automation.vip_purchase_block_reason(raw, now=REAL_READING_AT) == ""
    assert (perk_automation.vip_days_remaining(raw, now=REAL_READING_AT) or 0) < 0
