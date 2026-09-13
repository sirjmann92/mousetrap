"""Backend public-API integration coverage for the favicon routes."""

from pathlib import Path

from httpx import AsyncClient
import pytest

from backend import app


@pytest.mark.integration
async def test_favicon_routes_serve_the_public_directory(
    api_client: AsyncClient, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Both favicon routes return the file from FRONTEND_PUBLIC_DIR with its media type."""
    monkeypatch.setattr(app, "FRONTEND_PUBLIC_DIR", str(tmp_path))
    (tmp_path / "favicon.ico").write_bytes(b"icon-bytes")
    (tmp_path / "favicon.svg").write_bytes(b"<svg></svg>")

    ico = await api_client.get("/favicon.ico")
    assert ico.status_code == 200
    assert ico.headers["content-type"] == "image/x-icon"
    assert ico.content == b"icon-bytes"

    svg = await api_client.get("/favicon.svg")
    assert svg.status_code == 200
    assert svg.headers["content-type"] == "image/svg+xml"
    assert svg.content == b"<svg></svg>"


@pytest.mark.integration
async def test_favicon_routes_404_when_the_public_directory_lacks_them(
    api_client: AsyncClient, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """An overridden public directory without favicons 404s instead of serving another one."""
    monkeypatch.setattr(app, "FRONTEND_PUBLIC_DIR", str(tmp_path))

    ico = await api_client.get("/favicon.ico")
    assert ico.status_code == 404
    assert ico.json() == {"detail": "favicon.ico not found"}

    svg = await api_client.get("/favicon.svg")
    assert svg.status_code == 404
    assert svg.json() == {"detail": "favicon.svg not found"}
