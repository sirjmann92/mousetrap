"""Backend integration coverage for the manual VIP purchase route."""

from typing import Any

from httpx import AsyncClient
import pytest

from backend import api_automation, config


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
