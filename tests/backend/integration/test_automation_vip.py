"""Backend integration coverage for VIP purchases, manual and automated."""

from datetime import UTC, datetime
from typing import Any, Self
from unittest.mock import AsyncMock, Mock

from httpx import AsyncClient
import pytest

from backend import api_automation, automation, config
from backend.event_log import get_ui_event_log
from backend.perk_automation import _rejection_reason


def _save_vip_session(label: str, *, guardrail: bool) -> None:
    """Persist a session with the minimum-points guardrail on or off."""
    config.save_session(
        {
            "label": label,
            "mam": {"mam_id": "cookie"},
            "perk_automation": {
                "enforce_min_points_guardrail": guardrail,
                "min_points": 1000,
            },
        }
    )


@pytest.fixture
def purchases(monkeypatch: pytest.MonkeyPatch) -> list[str]:
    """Record the duration of every purchase, leaving no route to MAM open."""
    durations: list[str] = []

    async def fake_buy_vip(
        _mam_id: str, duration: str = "max", proxy_cfg: dict[str, Any] | None = None
    ) -> dict[str, Any]:
        durations.append(duration)
        return {"success": True}

    async def unblocked_status(
        mam_id: str, proxy_cfg: dict[str, Any] | None = None
    ) -> dict[str, Any]:
        return {"points": 1_000_000}

    monkeypatch.setattr(api_automation, "buy_vip", fake_buy_vip)
    monkeypatch.setattr(api_automation, "get_status", unblocked_status)
    return durations


@pytest.mark.integration
@pytest.mark.parametrize("guardrail", [True, False])
@pytest.mark.parametrize("weeks", ["abc", None, 4.5, True, 4, "8", 0, 90.0])
async def test_a_duration_other_than_max_is_rejected_without_purchasing(
    api_client: AsyncClient,
    purchases: list[str],
    guardrail: bool,
    weeks: object,
) -> None:
    """Anything but max is a client error, since MAM's API refuses it (issue #187).

    MAM answers a week count with "Api sessions can only buy max for VIP", so
    sending one would spend a request on a purchase that cannot succeed.
    """
    _save_vip_session("seedbox", guardrail=guardrail)

    response = await api_client.post(
        "/api/automation/vip", json={"label": "seedbox", "weeks": weeks}
    )

    assert response.status_code == 400
    detail = response.json()["detail"]
    assert repr(weeks) in detail
    assert "only accepts 'max'" in detail
    assert purchases == []


@pytest.mark.integration
@pytest.mark.parametrize("guardrail", [True, False])
@pytest.mark.parametrize(
    "body", [{"weeks": "max"}, {"weeks": " MAX "}, {"weeks": 90}, {"weeks": "90"}, {}]
)
async def test_max_and_its_equivalents_reach_the_purchase_as_max(
    api_client: AsyncClient,
    purchases: list[str],
    guardrail: bool,
    body: dict[str, Any],
) -> None:
    """Every spelling of max, and an omitted duration, buys max.

    The minimum-points guardrail has no fixed price for max to check, so it
    lets the purchase through whether or not it is enabled.
    """
    _save_vip_session("seedbox", guardrail=guardrail)

    response = await api_client.post("/api/automation/vip", json={"label": "seedbox", **body})

    assert response.json() == {"success": True}
    assert purchases == ["max"]


# MAM's verbatim refusal when a purchase would add less than a full week. See
# https://github.com/sirjmann92/mousetrap/issues/72 for the captured response.
_MIN_VIP_REFUSAL = {
    "success": False,
    "error": "Min VIP is 1 week purchased for Automated methods",
}


@pytest.mark.integration
async def test_mam_refusal_reason_reaches_the_caller_and_the_event_log(
    api_client: AsyncClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """A 200-OK refusal surfaces MAM's wording instead of a bare failure.

    bonusBuy.php reports refusals in the body, so the reason was dropped and
    every surface reported ``Error: None`` (issue #145).
    """

    async def refusing_buy_vip(
        _mam_id: str, duration: str = "max", proxy_cfg: dict[str, Any] | None = None
    ) -> dict[str, Any]:
        return await _passthrough_rejection()

    monkeypatch.setattr(api_automation, "buy_vip", refusing_buy_vip)
    _save_vip_session("seedbox", guardrail=False)

    response = await api_client.post(
        "/api/automation/vip", json={"label": "seedbox", "weeks": "max"}
    )

    body = response.json()
    assert body["success"] is False
    assert body["error"] == "Min VIP is 1 week purchased for Automated methods"

    event = get_ui_event_log()[-1]
    assert event["result"] == "failed"
    assert event["amount"] == "max"
    assert event["error"] == "Min VIP is 1 week purchased for Automated methods"


async def _passthrough_rejection() -> dict[str, Any]:
    """Return what the real ``buy_vip`` builds from a MAM refusal body."""
    return {
        "success": False,
        "error": _rejection_reason(_MIN_VIP_REFUSAL),
        "response": _MIN_VIP_REFUSAL,
    }


@pytest.mark.integration
@pytest.mark.parametrize(
    ("body", "expected"),
    [
        ({"success": False, "error": "Invalid duration specified"}, "Invalid duration specified"),
        ({"success": False, "error": "  padded  "}, "padded"),
        ({"success": False, "msg": "alternate key"}, "alternate key"),
        ({"success": False}, "MaM refused the purchase without giving a reason."),
        ({"success": False, "error": ""}, "MaM refused the purchase without giving a reason."),
        ([], "MaM refused the purchase without giving a reason."),
    ],
)
async def test_rejection_reason_extraction(body: object, expected: str) -> None:
    """Every refusal shape yields a non-empty reason rather than ``None``."""
    assert _rejection_reason(body) == expected


# Enough VIP banked that no purchase can add the week MaM requires.
_OVER_CAP_STATUS = {"raw": {"vip_until": "2026-12-18 23:01:14"}}
_OVER_CAP_NOW = datetime(2026, 9, 20, 14, 43, 34, tzinfo=UTC)


@pytest.mark.integration
@pytest.mark.parametrize("weeks", ["max", 90])
async def test_purchase_is_blocked_before_reaching_mam_when_over_the_cap(
    api_client: AsyncClient,
    purchases: list[str],
    monkeypatch: pytest.MonkeyPatch,
    weeks: object,
) -> None:
    """Stop the purchase without spending a request.

    At 89 days banked a max purchase cannot add a full week, so MAM would
    refuse it.
    """
    monkeypatch.setattr(api_automation, "datetime", _FrozenDatetime)
    config.save_session(
        {
            "label": "seedbox",
            "mam": {"mam_id": "cookie"},
            "perk_automation": {},
            "last_status": _OVER_CAP_STATUS,
        }
    )

    response = await api_client.post(
        "/api/automation/vip", json={"label": "seedbox", "weeks": weeks}
    )

    body = response.json()
    assert body["success"] is False
    assert "89.3 days remaining" in body["error"]
    assert purchases == [], "the guardrail must not reach MAM"

    event = get_ui_event_log()[-1]
    assert event["result"] == "blocked"
    assert "2026-09-26 23:01 UTC" in event["status_message"]


@pytest.mark.integration
async def test_purchase_proceeds_once_enough_vip_has_burned_off(
    api_client: AsyncClient, purchases: list[str], monkeypatch: pytest.MonkeyPatch
) -> None:
    """Let the purchase through at the threshold rather than blocking early."""
    monkeypatch.setattr(api_automation, "datetime", _FrozenDatetime)
    config.save_session(
        {
            "label": "seedbox",
            "mam": {"mam_id": "cookie"},
            "perk_automation": {},
            # Exactly 83 days out, the first point a full week fits.
            "last_status": {"raw": {"vip_until": "2026-12-12 14:43:34"}},
        }
    )

    response = await api_client.post(
        "/api/automation/vip", json={"label": "seedbox", "weeks": "max"}
    )

    assert response.json()["success"] is True
    assert purchases == ["max"]


@pytest.mark.integration
async def test_missing_status_does_not_block_the_purchase(
    api_client: AsyncClient, purchases: list[str]
) -> None:
    """A session that has never been checked still reaches MAM."""
    _save_vip_session("seedbox", guardrail=False)

    response = await api_client.post(
        "/api/automation/vip", json={"label": "seedbox", "weeks": "max"}
    )

    assert response.json()["success"] is True
    assert purchases == ["max"]


@pytest.mark.integration
@pytest.mark.parametrize("saved_weeks", [4, 8, 90, "max", None])
async def test_automation_buys_max_whatever_duration_was_saved(
    monkeypatch: pytest.MonkeyPatch, saved_weeks: object
) -> None:
    """A week count saved by an earlier release still buys max.

    Sessions default to 4 weeks, so without this every existing VIP automation
    would send a duration MAM's API refuses, then retry it into cooldown
    (issue #187).
    """
    vip: dict[str, Any] = {
        "enabled": True,
        "trigger_type": "points",
        "trigger_point_threshold": 1,
    }
    if saved_weeks is not None:
        vip["weeks"] = saved_weeks
    cfg = {
        "label": "seedbox",
        "mam": {"mam_id": "cookie"},
        "perk_automation": {
            "enforce_min_points_guardrail": True,
            "min_points": 1000,
            "vip_automation": vip,
        },
    }
    durations: list[str] = []
    events: list[dict[str, Any]] = []

    async def fake_buy_vip(
        _mam_id: str, duration: str = "max", proxy_cfg: dict[str, Any] | None = None
    ) -> dict[str, Any]:
        durations.append(duration)
        return {"success": True}

    monkeypatch.setattr(automation, "list_sessions", lambda: ["seedbox"])
    monkeypatch.setattr(automation, "load_session", lambda _label: cfg)
    monkeypatch.setattr(automation, "resolve_proxy_from_session_cfg", lambda _cfg: None)
    monkeypatch.setattr(automation, "get_status", AsyncMock(return_value={"points": 50_000}))
    monkeypatch.setattr(automation, "buy_vip", fake_buy_vip)
    monkeypatch.setattr(automation, "save_session", Mock())
    monkeypatch.setattr(automation, "notify_event", AsyncMock())
    monkeypatch.setattr(automation, "append_ui_event_log", events.append)
    automation.reset_automation_shutdown()

    await automation.vip_automation_job()

    assert durations == ["max"]
    assert events[-1]["result"] == "success"
    assert events[-1]["amount"] == "max"
    assert events[-1]["status_message"] == "Automated purchase: VIP (Max me out!)"


class _FrozenDatetime(datetime):
    """Pin ``datetime.now`` to the instant hobesman's reading was taken."""

    @classmethod
    def now(cls, tz: Any = None) -> Self:
        """Return the frozen instant regardless of the requested timezone."""
        return cls.fromtimestamp(_OVER_CAP_NOW.timestamp(), tz=tz or UTC)
