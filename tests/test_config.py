"""Tests for durable session configuration persistence."""

from pathlib import Path
import threading
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


def test_load_session_recovers_mapping_backup_from_list_primary(
    temp_config_paths: Path,
) -> None:
    """Apply session defaults to a mapping recovered from a wrong-shaped primary."""
    path = config.get_session_path("Session1")
    path.write_text("- wrong-shape\n", encoding="utf-8")
    backup_path(path).write_text(
        yaml.safe_dump({"label": "Session1", "mam": {"mam_id": "recovered"}}),
        encoding="utf-8",
    )

    loaded = config.load_session("Session1")

    assert loaded["mam"]["mam_id"] == "recovered"
    assert loaded["browser_cookie"] == ""


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


def test_queued_save_cannot_recreate_deleted_session(
    caplog: pytest.LogCaptureFixture,
    temp_config_paths: Path,
) -> None:
    """Drop an existing-session update queued behind a completed delete."""
    session = {"label": "Session1", "mam": {"mam_id": "original"}}
    config.save_session(session)
    path = config.get_session_path("Session1")
    delete_finished = threading.Event()

    def delete_then_signal() -> None:
        """Delete the session before allowing the queued save to run."""
        config.delete_session("Session1")
        delete_finished.set()

    thread = threading.Thread(target=delete_then_signal)
    thread.start()
    assert delete_finished.wait(timeout=2)

    config.save_session(
        {"label": "Session1", "mam": {"mam_id": "stale"}},
        old_label="Session1",
    )
    thread.join()

    assert not path.exists()
    assert not backup_path(path).exists()
    assert "Discarding stale update for retired session Session1" in caplog.text


def test_in_flight_save_is_removed_by_waiting_delete(
    monkeypatch: pytest.MonkeyPatch,
    temp_config_paths: Path,
) -> None:
    """Ensure a delete waiting on an in-flight write removes its final output."""
    config.save_session({"label": "Session1"})
    path = config.get_session_path("Session1")
    write_started = threading.Event()
    allow_write = threading.Event()
    original_write = config.write_yaml_file

    def blocked_write(candidate: Path, data: Any) -> None:
        """Pause the write while the session lifecycle lock remains held."""
        write_started.set()
        assert allow_write.wait(timeout=2)
        original_write(candidate, data)

    monkeypatch.setattr(config, "write_yaml_file", blocked_write)
    save_thread = threading.Thread(
        target=config.save_session,
        args=({"label": "Session1", "mam": {"mam_id": "updated"}}, "Session1"),
    )
    save_thread.start()
    assert write_started.wait(timeout=2)

    delete_thread = threading.Thread(target=config.delete_session, args=("Session1",))
    delete_thread.start()
    allow_write.set()
    save_thread.join(timeout=2)
    delete_thread.join(timeout=2)

    assert not save_thread.is_alive()
    assert not delete_thread.is_alive()
    assert not path.exists()
    assert not backup_path(path).exists()


def test_queued_old_label_save_cannot_recreate_renamed_session(
    monkeypatch: pytest.MonkeyPatch,
    temp_config_paths: Path,
) -> None:
    """Drop a stale update for an old label after rename retires its files."""
    config.save_session({"label": "Old", "mam": {"mam_id": "original"}})
    rename_write_started = threading.Event()
    allow_rename_write = threading.Event()
    stale_save_started = threading.Event()
    original_write = config.write_yaml_file

    def blocked_rename_write(candidate: Path, data: Any) -> None:
        """Pause the rename's final write while lifecycle locks remain held."""
        if candidate == config.get_session_path("New"):
            rename_write_started.set()
            assert allow_rename_write.wait(timeout=2)
        original_write(candidate, data)

    monkeypatch.setattr(config, "write_yaml_file", blocked_rename_write)

    def save_stale_update() -> None:
        """Signal before attempting the old-label save held behind rename."""
        stale_save_started.set()
        config.save_session(
            {"label": "Old", "mam": {"mam_id": "stale"}},
            old_label="Old",
        )

    rename_thread = threading.Thread(
        target=config.save_session,
        args=({"label": "New", "mam": {"mam_id": "renamed"}}, "Old"),
    )
    rename_thread.start()
    assert rename_write_started.wait(timeout=2)

    stale_thread = threading.Thread(target=save_stale_update)
    stale_thread.start()
    assert stale_save_started.wait(timeout=2)
    allow_rename_write.set()
    rename_thread.join(timeout=2)
    stale_thread.join(timeout=2)

    old_path = config.get_session_path("Old")
    assert not rename_thread.is_alive()
    assert not stale_thread.is_alive()
    assert not old_path.exists()
    assert not backup_path(old_path).exists()
    assert config.load_session("New")["mam"]["mam_id"] == "renamed"


def test_existing_session_save_accepts_backup_only_source(
    temp_config_paths: Path,
) -> None:
    """Allow an existing-session update when only its recoverable backup remains."""
    path = config.get_session_path("Session1")
    backup_path(path).write_text(yaml.safe_dump({"label": "Session1"}), encoding="utf-8")

    config.save_session(
        {"label": "Session1", "mam": {"mam_id": "updated"}},
        old_label="Session1",
    )

    assert yaml.safe_load(path.read_text(encoding="utf-8"))["mam"]["mam_id"] == "updated"


def test_save_session_without_old_label_creates_new_session(
    temp_config_paths: Path,
) -> None:
    """Preserve explicit creation when no existing-session label is supplied."""
    config.save_session({"label": "New", "mam": {"mam_id": "created"}})

    assert config.load_session("New")["mam"]["mam_id"] == "created"
