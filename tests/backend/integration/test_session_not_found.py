"""Backend integration tests for reporting a session that does not exist."""

from httpx import AsyncClient
import pytest

from backend.config import session_exists

# Endpoints that take a session label in the body and answer 200 with a
# success flag rather than raising, which is this API's existing convention.
BODY_LABEL_ENDPOINTS = [
    "/api/jackett/update",
    "/api/prowlarr/update",
    "/api/chaptarr/update",
    "/api/autobrr/update",
    "/api/audiobookrequest/update",
    "/api/indexer/update",
]


def test_session_exists_distinguishes_saved_from_absent(isolated_backend: object) -> None:
    """`load_session` synthesises defaults, so existence needs its own check."""
    assert session_exists("never-saved") is False


@pytest.mark.integration
async def test_loading_an_absent_session_is_a_404(api_client: AsyncClient) -> None:
    """The documented 404 for a missing session is actually raised.

    `load_session` returns a fully populated default config for any label, so
    this endpoint previously answered 200 with a fabricated session.
    """
    response = await api_client.get("/api/session/never-saved")

    assert response.status_code == 404
    assert "never-saved" in response.json()["detail"]


@pytest.mark.integration
@pytest.mark.parametrize("endpoint", BODY_LABEL_ENDPOINTS)
async def test_indexer_updates_report_the_missing_session(
    api_client: AsyncClient, endpoint: str
) -> None:
    """A missing label is reported as such, not as a downstream misconfiguration.

    These previously ran against a synthesised default config and failed later
    with "MAM ID not configured in session", which points at the wrong thing.
    """
    response = await api_client.post(endpoint, json={"label": "never-saved"})

    body = response.json()
    assert body["success"] is False
    assert "not found" in body["message"].lower()


@pytest.mark.integration
@pytest.mark.parametrize("endpoint", ["/api/automation/vip", "/api/automation/upload_auto"])
async def test_manual_purchases_report_the_missing_session(
    api_client: AsyncClient, endpoint: str
) -> None:
    """A manual purchase against an absent session is refused before any MAM call.

    `amount` is a valid upload-credit amount so the request reaches the session check rather than
    being turned away by upload-credit amount validation first.
    """
    response = await api_client.post(
        endpoint, json={"label": "never-saved", "weeks": 4, "amount": 50}
    )

    body = response.json()
    assert body["success"] is False
    assert "not found" in str(body.get("error") or body.get("message", "")).lower()
