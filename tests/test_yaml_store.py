"""Tests for atomic YAML store helpers."""

from pathlib import Path
from typing import Any

import pytest
import yaml

from backend import yaml_store
from backend.yaml_store import backup_path, load_yaml_file, write_yaml_file


def test_write_yaml_file_creates_backup(tmp_path: Path) -> None:
    """Write YAML atomically and refresh a readable backup copy."""
    path = tmp_path / "settings.yaml"
    data: dict[str, Any] = {"label": "Session1", "nested": {"enabled": True}}

    write_yaml_file(path, data)

    assert yaml.safe_load(path.read_text(encoding="utf-8")) == data
    assert yaml.safe_load(backup_path(path).read_text(encoding="utf-8")) == data


def test_write_yaml_file_succeeds_when_backup_refresh_fails(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    """Keep the primary write successful when refreshing the backup fails."""
    path = tmp_path / "settings.yaml"
    old_backup_data = {"label": "old"}
    new_data = {"label": "new"}
    backup_path(path).write_text(yaml.safe_dump(old_backup_data), encoding="utf-8")

    def fail_atomic_copy(src: Path, dst: Path) -> None:
        """Simulate an OS failure while refreshing the backup file."""
        raise OSError("simulated backup refresh failure")

    monkeypatch.setattr(yaml_store, "_atomic_copy", fail_atomic_copy)

    write_yaml_file(path, new_data)

    assert yaml.safe_load(path.read_text(encoding="utf-8")) == new_data
    assert yaml.safe_load(backup_path(path).read_text(encoding="utf-8")) == old_backup_data


def test_load_yaml_file_uses_default_without_file(tmp_path: Path) -> None:
    """Return the caller-provided default when no settings file exists."""
    default = {"label": "default"}

    loaded = load_yaml_file(tmp_path / "missing.yaml", default)

    assert loaded == default


@pytest.mark.parametrize("primary_content", ["", "label: [unterminated\n"])
def test_load_yaml_file_recovers_from_valid_backup(
    tmp_path: Path,
    primary_content: str,
) -> None:
    """Recover valid backup data when the primary YAML file is empty or malformed."""
    path = tmp_path / "settings.yaml"
    backup = backup_path(path)
    backup_data = {"label": "backup", "nested": {"enabled": True}}
    path.write_text(primary_content, encoding="utf-8")
    backup.write_text(yaml.safe_dump(backup_data), encoding="utf-8")

    loaded = load_yaml_file(path, {"label": "default"})

    assert loaded == backup_data
    assert yaml.safe_load(path.read_text(encoding="utf-8")) == backup_data


def test_load_yaml_file_recovers_from_backup_when_primary_missing(tmp_path: Path) -> None:
    """Recover valid backup data when the primary YAML file is missing."""
    path = tmp_path / "settings.yaml"
    backup_data = {"label": "backup"}
    backup_path(path).write_text(yaml.safe_dump(backup_data), encoding="utf-8")

    loaded = load_yaml_file(path, {"label": "default"})

    assert loaded == backup_data
    assert yaml.safe_load(path.read_text(encoding="utf-8")) == backup_data


@pytest.mark.parametrize("primary_exists", [False, True])
def test_load_yaml_file_uses_default_when_backup_empty(
    tmp_path: Path,
    primary_exists: bool,
) -> None:
    """Return the default when recovery reaches an empty backup file."""
    path = tmp_path / "settings.yaml"
    default = {"label": "default"}
    if primary_exists:
        path.write_text("", encoding="utf-8")
    backup_path(path).write_text("", encoding="utf-8")

    loaded = load_yaml_file(path, default)

    assert loaded == default


@pytest.mark.parametrize("primary_content", [None, "label: [unterminated\n"])
def test_load_yaml_file_uses_default_when_backup_malformed(
    tmp_path: Path,
    primary_content: str | None,
) -> None:
    """Return the default when recovery reaches a malformed backup file."""
    path = tmp_path / "settings.yaml"
    default = {"label": "default"}
    if primary_content is not None:
        path.write_text(primary_content, encoding="utf-8")
    backup_path(path).write_text("label: [unterminated\n", encoding="utf-8")

    loaded = load_yaml_file(path, default)

    assert loaded == default
