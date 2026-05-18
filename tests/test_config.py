"""Tests for durable session configuration persistence."""

from pathlib import Path
from typing import Any

import pytest
import yaml

from backend import config
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
