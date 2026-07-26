"""Shared pytest configuration for backend tests."""

from collections.abc import AsyncIterator, Iterator
from pathlib import Path
import sys

from httpx import ASGITransport, AsyncClient
import pytest

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend import (  # noqa: E402
    api_notifications,
    config,
    db,
    last_session_api,
    notifications_backend,
    port_monitor,
    proxy_config,
)
from backend.app import app  # noqa: E402


@pytest.fixture
def isolated_backend(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Iterator[Path]:
    """Redirect every backend persistence boundary to a temporary directory."""
    db.close_connection()
    monkeypatch.setattr(config, "CONFIG_DIR", tmp_path)
    monkeypatch.setattr(config, "CONFIG_PATH", tmp_path / "config.yaml")
    monkeypatch.setattr(db, "DB_PATH", tmp_path / "mousetrap.db")
    monkeypatch.setattr(proxy_config, "PROXIES_PATH", tmp_path / "proxies.yaml")
    monkeypatch.setattr(notifications_backend, "NOTIFY_CONFIG_PATH", tmp_path / "notify.yaml")
    monkeypatch.setattr(api_notifications, "NOTIFY_CONFIG_PATH", tmp_path / "notify.yaml")
    monkeypatch.setattr(last_session_api, "LAST_SESSION_FILE", tmp_path / "last_session.yaml")
    monkeypatch.setattr(
        port_monitor,
        "PORT_MONITOR_CONFIG_PATH",
        tmp_path / "port_monitoring_stacks.yaml",
    )
    port_monitor.port_monitor_manager.stacks = []
    port_monitor.port_monitor_manager._config_loaded = True
    yield tmp_path
    db.close_connection()


@pytest.fixture
async def api_client(isolated_backend: Path) -> AsyncIterator[AsyncClient]:
    """Expose the public FastAPI surface without running background startup jobs."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client
