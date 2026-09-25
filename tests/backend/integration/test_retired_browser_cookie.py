"""The session endpoint never returns the retired vault-era browser cookie."""

from httpx import AsyncClient
import pytest

from backend import config


@pytest.mark.integration
async def test_the_session_endpoint_does_not_return_a_stored_browser_cookie(
    api_client: AsyncClient,
) -> None:
    """A session saved while the Millionaire's Vault existed still holds the cookie on disk.

    `GET /api/session/{label}` returned it for as long as the session was not
    re-saved through the UI.
    """
    config.get_session_path("Legacy").write_text(
        'label: Legacy\nbrowser_cookie: "mam_id=BROWSERSECRET"\nmam:\n  mam_id: seedbox-cookie\n',
        encoding="utf-8",
    )

    body = (await api_client.get("/api/session/Legacy")).text

    assert "BROWSERSECRET" not in body
    assert "seedbox-cookie" in body
