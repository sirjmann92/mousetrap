"""Tests for durable session configuration persistence."""

from pathlib import Path
from typing import Any

import pytest
import yaml

from backend import config, yaml_store
from backend.yaml_store import backup_path


@pytest.fixture
def temp_config_paths(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> Path:
    """Point config helpers at a temporary config directory.

    Args:
        monkeypatch: Pytest monkeypatch fixture.
        tmp_path: Temporary directory fixture.

    Returns:
        The temporary config directory used by the test.
    """
    monkeypatch.setattr(config, "CONFIG_DIR", tmp_path)
    monkeypatch.setattr(config, "CONFIG_PATH", tmp_path / "config.yaml")
    return tmp_path


def test_load_session_recovers_from_empty_file_backup(temp_config_paths: Path) -> None:
    """Recover a session from backup when the main YAML file is empty."""
    session: dict[str, Any] = {
        "label": "Session1",
        "check_freq": 60,
        "mam": {
            "mam_id": "secret-cookie",
            "session_type": "ASN Locked",
            "ip_monitoring_mode": "auto",
        },
        "mam_ip": "192.0.2.10",
        "proxy": {"label": "VPN"},
        "prowlarr": {"enabled": True, "host": "10.0.0.2", "api_key": "secret"},
    }
    config.save_session(session)
    path = config.get_session_path("Session1")
    assert backup_path(path).exists()

    path.write_text("", encoding="utf-8")

    loaded = config.load_session("Session1")

    assert loaded["mam"]["mam_id"] == "secret-cookie"
    assert loaded["proxy"]["label"] == "VPN"
    assert loaded["prowlarr"]["enabled"] is True
    persisted = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    assert persisted.get("mam", {}).get("mam_id") == "secret-cookie"


def test_load_session_recovers_from_malformed_file_backup(temp_config_paths: Path) -> None:
    """Recover a session from backup when the main YAML file is malformed."""
    session: dict[str, Any] = {
        "label": "Session1",
        "check_freq": 60,
        "mam": {
            "mam_id": "secret-cookie",
            "session_type": "IP Locked",
            "ip_monitoring_mode": "manual",
        },
        "mam_ip": "192.0.2.11",
    }
    config.save_session(session)
    path = config.get_session_path("Session1")

    path.write_text("mam: [unterminated\n", encoding="utf-8")

    loaded = config.load_session("Session1")

    assert loaded["mam"]["mam_id"] == "secret-cookie"
    assert loaded["mam"]["ip_monitoring_mode"] == "manual"


def test_load_session_recovers_from_missing_file_backup(temp_config_paths: Path) -> None:
    """Recover a session from backup when the main YAML file is missing."""
    session: dict[str, Any] = {
        "label": "Session1",
        "mam": {
            "mam_id": "secret-cookie",
            "session_type": "IP Locked",
            "ip_monitoring_mode": "manual",
        },
        "mam_ip": "192.0.2.12",
    }
    config.save_session(session)
    path = config.get_session_path("Session1")
    path.unlink()

    loaded = config.load_session("Session1")

    assert loaded["mam"]["mam_id"] == "secret-cookie"
    assert loaded["mam"]["ip_monitoring_mode"] == "manual"
    assert yaml.safe_load(path.read_text(encoding="utf-8"))["mam"]["mam_id"] == "secret-cookie"


def test_load_session_recovers_from_backup_when_primary_missing(
    temp_config_paths: Path,
) -> None:
    """Recover a session backup when the main YAML file is missing."""
    path = config.get_session_path("Session1")
    backup_data: dict[str, Any] = {
        "label": "Session1",
        "mam": {
            "mam_id": "secret-cookie",
            "session_type": "IP Locked",
            "ip_monitoring_mode": "manual",
        },
        "browser_cookie": "secret-browser-cookie",
    }
    backup_path(path).write_text(yaml.safe_dump(backup_data), encoding="utf-8")

    loaded = config.load_session("Session1")

    assert loaded["mam"]["mam_id"] == "secret-cookie"
    assert loaded["browser_cookie"] == "secret-browser-cookie"
    assert yaml.safe_load(path.read_text(encoding="utf-8"))["label"] == "Session1"


@pytest.mark.parametrize("content", ["null\n", "- not-a-mapping\n", "scalar\n"])
def test_load_session_uses_defaults_for_non_mapping_yaml(
    temp_config_paths: Path,
    content: str,
) -> None:
    """Use defaults when a session file contains valid non-mapping YAML."""
    path = config.get_session_path("Session1")
    path.write_text(content, encoding="utf-8")

    loaded = config.load_session("Session1")

    assert loaded["label"] == "Session1"
    assert loaded["mam"]["mam_id"] == ""


def test_load_config_recovers_from_missing_file_backup(temp_config_paths: Path) -> None:
    """Recover global config from backup when the main YAML file is missing."""
    global_config = config.get_default_config()
    global_config["mam"]["mam_id"] = "global-secret"
    global_config["mam_ip"] = "192.0.2.13"
    config.save_config(global_config)
    config.CONFIG_PATH.unlink()

    loaded = config.load_config()

    assert loaded["mam"]["mam_id"] == "global-secret"
    assert loaded["mam_ip"] == "192.0.2.13"
    assert (
        yaml.safe_load(config.CONFIG_PATH.read_text(encoding="utf-8"))["mam"]["mam_id"]
        == "global-secret"
    )


def test_load_config_recovers_from_backup_when_primary_missing(
    temp_config_paths: Path,
) -> None:
    """Recover the global config backup when the main YAML file is missing."""
    backup_data: dict[str, Any] = {
        "label": "Default",
        "mam": {"mam_id": "global-secret", "session_type": "IP Locked"},
        "mam_ip": "192.0.2.20",
        "last_check_time": "2026-05-21T00:00:00",
    }
    backup_path(config.CONFIG_PATH).write_text(yaml.safe_dump(backup_data), encoding="utf-8")

    loaded = config.load_config()

    assert loaded["mam"]["mam_id"] == "global-secret"
    assert loaded["mam_ip"] == "192.0.2.20"
    assert yaml.safe_load(config.CONFIG_PATH.read_text(encoding="utf-8"))["label"] == "Default"


@pytest.mark.parametrize("content", ["null\n", "- not-a-mapping\n", "scalar\n"])
def test_load_config_uses_defaults_for_non_mapping_yaml(
    temp_config_paths: Path,
    content: str,
) -> None:
    """Use defaults when global config contains valid non-mapping YAML."""
    config.CONFIG_PATH.write_text(content, encoding="utf-8")

    loaded = config.load_config()

    assert loaded["label"] == ""
    assert loaded["mam"]["mam_id"] == ""


def test_list_sessions_includes_backup_only_sessions(temp_config_paths: Path) -> None:
    """List sessions that only have a recoverable backup file."""
    session_path = config.get_session_path("Session1")
    backup_path(session_path).write_text(
        yaml.safe_dump({"label": "Session1", "mam": {"mam_id": "secret-cookie"}}),
        encoding="utf-8",
    )

    assert config.list_sessions() == ["Session1"]


def test_delete_session_removes_primary_and_backup(temp_config_paths: Path) -> None:
    """Delete both the session YAML file and its last-known-good backup."""
    session: dict[str, Any] = {
        "label": "Session1",
        "mam": {
            "mam_id": "secret-cookie",
            "session_type": "IP Locked",
            "ip_monitoring_mode": "manual",
        },
    }
    config.save_session(session)
    path = config.get_session_path("Session1")
    backup = backup_path(path)

    config.delete_session("Session1")

    assert not path.exists()
    assert not backup.exists()


def test_save_session_renames_existing_backup(temp_config_paths: Path) -> None:
    """Move the backup file when a session label changes."""
    session: dict[str, Any] = {
        "label": "Session1",
        "mam": {"mam_id": "secret-cookie", "session_type": "IP Locked"},
        "browser_cookie": "secret-browser-cookie",
    }
    config.save_session(session)
    old_path = config.get_session_path("Session1")
    old_backup = backup_path(old_path)

    renamed = session | {"label": "Session2"}
    config.save_session(renamed, old_label="Session1")
    new_path = config.get_session_path("Session2")
    new_backup = backup_path(new_path)

    assert not old_path.exists()
    assert not old_backup.exists()
    assert yaml.safe_load(new_path.read_text(encoding="utf-8"))["label"] == "Session2"
    assert yaml.safe_load(new_backup.read_text(encoding="utf-8"))["label"] == "Session2"


def test_save_session_rename_removes_old_backup(temp_config_paths: Path) -> None:
    """Prevent a stale backup from resurrecting a renamed session."""
    session: dict[str, Any] = {
        "label": "Old",
        "mam": {
            "mam_id": "secret-cookie",
            "session_type": "IP Locked",
            "ip_monitoring_mode": "manual",
        },
    }
    config.save_session(session)
    old_path = config.get_session_path("Old")
    old_backup = backup_path(old_path)

    session["label"] = "New"
    config.save_session(session, old_label="Old")

    assert not old_path.exists()
    assert not old_backup.exists()
    assert config.load_session("Old")["mam"]["mam_id"] == ""


def test_save_session_rename_removes_stale_destination_backup(
    monkeypatch: pytest.MonkeyPatch,
    temp_config_paths: Path,
) -> None:
    """Remove an unrelated destination backup when no source backup exists."""
    old_path = config.get_session_path("Old")
    new_path = config.get_session_path("New")
    old_path.write_text(yaml.safe_dump({"label": "Old"}), encoding="utf-8")
    stale_new_backup = backup_path(new_path)
    stale_new_backup.write_text(
        yaml.safe_dump({"label": "New", "mam": {"mam_id": "stale-secret"}}),
        encoding="utf-8",
    )

    def fail_atomic_copy(src: Path, dst: Path) -> None:
        """Simulate backup refresh failure after the primary rename/save."""
        raise OSError("simulated backup refresh failure")

    monkeypatch.setattr(yaml_store, "_atomic_copy", fail_atomic_copy)

    config.save_session({"label": "New", "mam": {"mam_id": "fresh"}}, old_label="Old")

    assert not backup_path(old_path).exists()
    assert not stale_new_backup.exists()
