"""Backend tests for proxy configuration helpers."""

from pathlib import Path
from typing import Any

import pytest

from backend import proxy_config
from backend.yaml_store import YamlStoreError


@pytest.fixture
def temp_proxy_path(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> Path:
    """Point proxy helpers at a temporary proxies file.

    Args:
        monkeypatch: Pytest monkeypatch fixture.
        tmp_path: Temporary directory fixture.

    Returns:
        Temporary proxies YAML path.
    """
    path = tmp_path / "proxies.yaml"
    monkeypatch.setattr(proxy_config, "PROXIES_PATH", str(path))
    return path


@pytest.mark.parametrize("content", ["null\n", "- not-a-mapping\n", "scalar\n"])
def test_load_proxies_rejects_non_mapping_yaml(
    temp_proxy_path: Path,
    content: str,
) -> None:
    """Reject proxies YAML that violates the mapping contract."""
    temp_proxy_path.write_text(content, encoding="utf-8")

    with pytest.raises(YamlStoreError):
        proxy_config.load_proxies()


def test_resolve_proxy_returns_the_labelled_proxy(temp_proxy_path: Path) -> None:
    """Resolve a labelled proxy through proxies.yaml."""
    temp_proxy_path.write_text("work:\n  host: proxy.internal\n  port: 8080\n", encoding="utf-8")

    resolved = proxy_config.resolve_proxy_from_session_cfg({"proxy": {"label": "work"}})

    assert resolved == {"host": "proxy.internal", "port": 8080}


def test_resolve_proxy_returns_the_inline_proxy() -> None:
    """Return a legacy inline proxy config unchanged."""
    inline = {"host": "proxy.internal", "port": 8080}

    resolved = proxy_config.resolve_proxy_from_session_cfg({"proxy": inline})

    assert resolved == inline


@pytest.mark.parametrize(
    "cfg",
    [
        {},
        {"proxy": {}},
        {"proxy": {"label": "", "host": ""}},
        {"proxy": None},
        {"proxy": "not-a-mapping"},
    ],
)
def test_resolve_proxy_returns_none_when_neither_shape_applies(cfg: dict[str, Any]) -> None:
    """Return None for every session config that is neither labelled nor inline."""
    assert proxy_config.resolve_proxy_from_session_cfg(cfg) is None
