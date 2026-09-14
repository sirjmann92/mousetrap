"""Coverage for a MaM status response that carries no point balance.

`get_status` returns ``points: None`` whenever it could not read a balance, and
the automation jobs and manual purchase routes each compare that balance against
a guardrail. These tests span the producer and all four consumers: the status
dicts are taken from `get_status` itself rather than written out here, so a
change to its error paths surfaces as a failure instead of passing against a
stale copy.
"""

from types import TracebackType
from typing import Any, Self
from unittest.mock import AsyncMock, Mock

import aiohttp
from httpx import AsyncClient
import pytest

from backend import api_automation, automation, config, mam_api

# A points guardrail every consumer fails when the balance is fabricated as zero.
_MIN_POINTS = 1_000
_POINT_THRESHOLD = 50_000


class _Response:
    """Stub ``aiohttp`` response replaying one status and body to `get_status`."""

    def __init__(self, body: str, status: int = 200) -> None:
        """Record what this stub replays.

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


class _Session:
    """Stub ``aiohttp`` session replaying one outcome to `get_status`."""

    def __init__(self, outcome: _Response | Exception) -> None:
        """Bind the outcome every request replays.

        Args:
            outcome: Response to hand back, or exception to raise from ``get()``.

        """
        self._outcome = outcome

    def get(self, *_args: Any, **_kwargs: Any) -> _Response:
        """Replay the configured outcome."""
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


_TRANSPORT_OUTCOMES: dict[str, _Response | Exception] = {
    "invalid_json": _Response("<html>maintenance</html>"),
    "request_failed": aiohttp.ClientError("connection reset"),
    "http_error": _Response("gateway timeout", status=504),
    "no_seedbonus": _Response('{"username": "someone"}'),
}


async def _produce(path: str) -> dict[str, Any]:
    """Return what `get_status` really returns for one balance-less path.

    Args:
        path: Key of `_TRANSPORT_OUTCOMES`, or "no_mam_id" for the path that
            returns before any request is made.

    Returns:
        The `get_status` result, unmodified.

    """
    if path == "no_mam_id":
        return await mam_api.get_status("")
    outcome = _TRANSPORT_OUTCOMES[path]
    with pytest.MonkeyPatch.context() as mp:
        mp.setattr(mam_api.aiohttp, "ClientSession", lambda **_kwargs: _Session(outcome))
        return await mam_api.get_status("cookie")


@pytest.fixture(params=["no_mam_id", *_TRANSPORT_OUTCOMES])
async def unreadable(request: pytest.FixtureRequest) -> dict[str, Any]:
    """One real `get_status` result per path that reads no point balance."""
    return await _produce(str(request.param))


def _upload_cfg() -> dict[str, Any]:
    """Build a session whose upload-credit automation is enabled and points-triggered."""
    return {
        "label": "seedbox",
        "mam": {"mam_id": "cookie"},
        "perk_automation": {
            "upload_credit": {
                "enabled": True,
                "trigger_type": "points",
                "trigger_point_threshold": _POINT_THRESHOLD,
                "gb": 50,
            }
        },
    }


def _vip_cfg(retry: int | None = None) -> dict[str, Any]:
    """Build a session whose VIP automation is enabled and points-triggered."""
    vip: dict[str, Any] = {
        "enabled": True,
        "trigger_type": "points",
        "trigger_point_threshold": _POINT_THRESHOLD,
        "weeks": 4,
    }
    if retry is not None:
        vip["retry"] = retry
    return {
        "label": "seedbox",
        "mam": {"mam_id": "cookie"},
        "perk_automation": {"vip_automation": vip},
    }


def _install(
    monkeypatch: pytest.MonkeyPatch,
    cfg: dict[str, Any],
    status: dict[str, Any],
    events: list[dict[str, Any]],
    saves: Mock | None = None,
) -> list[str]:
    """Point the automation jobs at one stub session and record what they do.

    Args:
        monkeypatch: Fixture used to replace the jobs' collaborators.
        cfg: Session config both jobs load.
        status: Result the stubbed `get_status` returns.
        events: List every UI event-log payload is appended to.
        saves: Optional mock standing in for `save_session`, so a test can
            assert whether retry state was rewritten.

    Returns:
        A list appended to once per purchase the jobs attempt.

    """
    purchases: list[str] = []

    async def _buy(*_args: Any, **_kwargs: Any) -> dict[str, Any]:
        purchases.append("bought")
        return {"success": True}

    monkeypatch.setattr(automation, "list_sessions", lambda: ["seedbox"])
    monkeypatch.setattr(automation, "load_session", lambda _label: cfg)
    monkeypatch.setattr(automation, "resolve_proxy_from_session_cfg", lambda _cfg: None)
    monkeypatch.setattr(automation, "get_status", AsyncMock(return_value=status))
    monkeypatch.setattr(automation, "buy_upload_credit", _buy)
    monkeypatch.setattr(automation, "buy_vip", _buy)
    monkeypatch.setattr(automation, "save_session", saves or Mock())
    monkeypatch.setattr(automation, "notify_event", AsyncMock())
    monkeypatch.setattr(automation, "append_ui_event_log", events.append)
    automation.reset_automation_shutdown()
    return purchases


@pytest.mark.integration
async def test_the_producer_reports_no_balance_and_says_why(unreadable: dict[str, Any]) -> None:
    """Every balance-less `get_status` path is distinguishable and explainable."""
    assert unreadable["points"] is None
    assert mam_api.points_unavailable_reason(unreadable)


@pytest.mark.integration
@pytest.mark.parametrize(
    ("job", "build"),
    [("upload_credit_automation_job", _upload_cfg), ("vip_automation_job", _vip_cfg)],
)
async def test_an_unreadable_balance_skips_the_job_naming_the_api_failure(
    monkeypatch: pytest.MonkeyPatch,
    unreadable: dict[str, Any],
    job: str,
    build: Any,
) -> None:
    """The skip reports the MaM failure, never a points threshold it never evaluated."""
    events: list[dict[str, Any]] = []
    purchases = _install(monkeypatch, build(), unreadable, events)

    await getattr(automation, job)()

    assert purchases == []
    skipped = [event for event in events if event.get("result") == "skipped"]
    assert len(skipped) == 1
    message = skipped[0]["status_message"]
    assert mam_api.points_unavailable_reason(unreadable) in message
    assert "point threshold" not in message
    assert skipped[0]["details"]["points_before"] is None


@pytest.mark.integration
async def test_an_unreadable_balance_leaves_the_vip_retry_state_untouched(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """A failure to read the balance is no evidence about a purchase, so retries stand.

    The guardrail skips clear `retry` because they establish the session is not
    eligible. An unreachable API establishes nothing either way.
    """
    saves = Mock()
    events: list[dict[str, Any]] = []
    _install(monkeypatch, _vip_cfg(retry=2), await _produce("request_failed"), events, saves=saves)

    await automation.vip_automation_job()

    assert saves.call_count == 0


@pytest.mark.integration
@pytest.mark.parametrize(
    ("job", "build"),
    [("upload_credit_automation_job", _upload_cfg), ("vip_automation_job", _vip_cfg)],
)
async def test_a_genuine_zero_balance_still_fails_the_threshold(
    monkeypatch: pytest.MonkeyPatch, job: str, build: Any
) -> None:
    """A reported balance of zero is a real balance and is still measured.

    MAM reports an empty account as ``seedbonus: 0``, which is not ``None``, so
    the guardrail must still fire and name the threshold.
    """
    events: list[dict[str, Any]] = []
    zero = {"mam_cookie_exists": True, "points": 0, "raw": {"seedbonus": 0}}
    purchases = _install(monkeypatch, build(), zero, events)

    await getattr(automation, job)()

    assert purchases == []
    skipped = [event for event in events if event.get("result") == "skipped"]
    assert len(skipped) == 1
    assert (
        f"Below automation point threshold: 0 < {_POINT_THRESHOLD}" in skipped[0]["status_message"]
    )


@pytest.mark.integration
@pytest.mark.parametrize(
    ("route", "body"),
    [
        ("/api/automation/upload_auto", {"label": "seedbox", "amount": 50}),
        ("/api/automation/vip", {"label": "seedbox", "weeks": 4}),
    ],
)
async def test_an_unreadable_balance_blocks_a_manual_purchase_naming_the_api_failure(
    api_client: AsyncClient,
    monkeypatch: pytest.MonkeyPatch,
    unreadable: dict[str, Any],
    route: str,
    body: dict[str, Any],
) -> None:
    """A guardrail the route cannot evaluate refuses the purchase and says why."""
    purchases: list[str] = []

    async def _buy(*_args: Any, **_kwargs: Any) -> dict[str, Any]:
        purchases.append("bought")
        return {"success": True}

    config.save_session(
        {
            "label": "seedbox",
            "mam": {"mam_id": "cookie"},
            "perk_automation": {
                "enforce_min_points_guardrail": True,
                "min_points": _MIN_POINTS,
            },
        }
    )
    monkeypatch.setattr(api_automation, "get_status", AsyncMock(return_value=unreadable))
    monkeypatch.setattr(api_automation, "buy_upload_credit", _buy)
    monkeypatch.setattr(api_automation, "buy_vip", _buy)

    response = await api_client.post(route, json=body)

    result = response.json()
    assert result["success"] is False
    assert result["error"] == mam_api.points_unavailable_reason(unreadable)
    assert "minimum points" not in result["error"]
    assert purchases == []
