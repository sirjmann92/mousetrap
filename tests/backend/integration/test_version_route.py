"""Backend public-API integration coverage for the version route."""

from importlib.metadata import version

from httpx import AsyncClient
import pytest


@pytest.mark.integration
async def test_version_route_reports_the_installed_distribution(api_client: AsyncClient) -> None:
    """The route answers with the installed distribution's version, not a placeholder."""
    response = await api_client.get("/api/version")

    assert response.status_code == 200
    assert response.json() == {"version": version("mousetrap")}
    assert response.json()["version"] != "dev"
