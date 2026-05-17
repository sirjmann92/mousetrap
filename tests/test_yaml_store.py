"""Tests for atomic YAML store helpers."""

from pathlib import Path
from typing import Any

import yaml

from backend.yaml_store import backup_path, load_yaml_file, write_yaml_file


def test_write_yaml_file_creates_backup(tmp_path: Path) -> None:
    """Write YAML atomically and refresh a readable backup copy."""
    path = tmp_path / "settings.yaml"
    data: dict[str, Any] = {"label": "Session1", "nested": {"enabled": True}}

    write_yaml_file(path, data)

    assert yaml.safe_load(path.read_text(encoding="utf-8")) == data
    assert yaml.safe_load(backup_path(path).read_text(encoding="utf-8")) == data


def test_load_yaml_file_uses_default_without_file(tmp_path: Path) -> None:
    """Return the caller-provided default when no settings file exists."""
    default = {"label": "default"}

    loaded = load_yaml_file(tmp_path / "missing.yaml", default)

    assert loaded == default
