"""Tests for proxy configuration helpers."""

from pathlib import Path

import pytest

from backend import proxy_config


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
def test_load_proxies_returns_empty_dict_for_non_mapping_yaml(
    temp_proxy_path: Path,
    content: str,
) -> None:
    """Return an empty mapping when proxies YAML has a valid non-mapping shape."""
    temp_proxy_path.write_text(content, encoding="utf-8")

    assert proxy_config.load_proxies() == {}
