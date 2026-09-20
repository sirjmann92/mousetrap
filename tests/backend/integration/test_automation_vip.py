"""Backend integration coverage for the manual VIP purchase route."""

from typing import Any

from httpx import AsyncClient
import pytest

from backend import api_automation, config
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
@pytest.mark.parametrize("weeks", ["abc", None, 4.5, True])
async def test_unparseable_weeks_is_rejected_without_purchasing(
    api_client: AsyncClient,
    purchases: list[str],
    guardrail: bool,
    weeks: object,
) -> None:
    """A week count that is not a whole number is a client error on every session."""
    _save_vip_session("seedbox", guardrail=guardrail)

    response = await api_client.post(
        "/api/automation/vip", json={"label": "seedbox", "weeks": weeks}
    )

    assert response.status_code == 400
    assert repr(weeks) in response.json()["detail"]
    assert purchases == []


@pytest.mark.integration
@pytest.mark.parametrize(("weeks", "duration"), [(4, "4"), ("8", "8"), ("max", "max"), (90, "max")])
async def test_accepted_weeks_reach_the_purchase(
    api_client: AsyncClient,
    purchases: list[str],
    weeks: object,
    duration: str,
) -> None:
    """The accepted domain still reaches MAM, with "max" and 90 weeks equivalent."""
    _save_vip_session("seedbox", guardrail=False)

    response = await api_client.post(
        "/api/automation/vip", json={"label": "seedbox", "weeks": weeks}
    )

    assert response.json() == {"success": True}
    assert purchases == [duration]


@pytest.mark.integration
async def test_guardrail_blocks_a_priced_purchase(
    api_client: AsyncClient, purchases: list[str], monkeypatch: pytest.MonkeyPatch
) -> None:
    """A parsed week count still prices the purchase against the points guardrail."""

    async def fake_status(mam_id: str, proxy_cfg: dict[str, Any] | None = None) -> dict[str, Any]:
        return {"points": 5_500}

    monkeypatch.setattr(api_automation, "get_status", fake_status)
    _save_vip_session("seedbox", guardrail=True)

    response = await api_client.post("/api/automation/vip", json={"label": "seedbox", "weeks": "4"})

    body = response.json()
    assert body["success"] is False
    assert "minimum points" in body["error"]
    assert purchases == []


# MAM's verbatim refusal when a purchase would add less than a full week. See
# https://github.com/sirjmann92/mousetrap/issues/72 for the captured response.
_MIN_VIP_REFUSAL = {
    "success": False,
    "error": "Min VIP is 1 week purchased for Automated methods",
}


@pytest.mark.integration
@pytest.mark.parametrize(("weeks", "amount"), [("max", "max"), (4, 4)])
async def test_mam_refusal_reason_reaches_the_caller_and_the_event_log(
    api_client: AsyncClient,
    monkeypatch: pytest.MonkeyPatch,
    weeks: object,
    amount: object,
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
        "/api/automation/vip", json={"label": "seedbox", "weeks": weeks}
    )

    body = response.json()
    assert body["success"] is False
    assert body["error"] == "Min VIP is 1 week purchased for Automated methods"

    event = get_ui_event_log()[-1]
    assert event["result"] == "failed"
    assert event["amount"] == amount
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
