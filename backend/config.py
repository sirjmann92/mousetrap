"""Configuration helpers for session and global config files.

This module provides utilities to read/write session-specific YAML
configuration files, a default global config, and simple helpers used by
the backend to locate and manage session files.
"""

from enum import Enum
import json
import logging
import os
from os import environ
from pathlib import Path
import tempfile
import threading
from typing import Any

import yaml

from backend.yaml_store import backup_path, load_yaml_file, lock_yaml_files, write_yaml_file

CONFIG_DIR = Path(environ.get("CONFIG_DIR", "/config"))
CONFIG_PATH = CONFIG_DIR / "config.yaml"


SESSION_PREFIX = "session-"
SESSION_SUFFIX = ".yaml"
BACKUP_SUFFIX = ".bak"
_logger = logging.getLogger(__name__)
RENAME_JOURNAL_GLOB = ".session-rename-*.json"
RENAME_PENDING_GLOB = ".session-rename-*.pending.yaml"
_RENAME_LOCK = threading.RLock()


class SaveSessionResult(Enum):
    """Outcome of a session persistence request."""

    SAVED = "saved"
    STALE = "stale"


def get_session_path(label: str) -> Path:
    """Return the filesystem path for a session identified by ``label``.

    The path is constructed using the module-level ``CONFIG_DIR`` and the
    session prefix/suffix constants.
    """
    if (
        not isinstance(label, str)
        or not label
        or "/" in label
        or "\\" in label
        or "\x00" in label
        or label in {".", ".."}
    ):
        raise ValueError("Session label must be a non-empty filesystem basename.")
    filename = f"{SESSION_PREFIX}{label}{SESSION_SUFFIX}"
    if Path(filename).name != filename:
        raise ValueError("Session label must resolve directly within the config directory.")
    return CONFIG_DIR / filename


def list_sessions() -> list[str]:
    """Return a list of session labels present in the config directory.

    Scans the ``CONFIG_DIR`` for files that match the session naming
    convention, including backup-only files, and returns the extracted labels.
    """
    _recover_rename_transactions()
    labels = {
        f.name[len(SESSION_PREFIX) : -len(SESSION_SUFFIX)]
        for f in CONFIG_DIR.glob(f"{SESSION_PREFIX}*{SESSION_SUFFIX}")
    }
    labels.update(
        f.name[len(SESSION_PREFIX) : -len(SESSION_SUFFIX + BACKUP_SUFFIX)]
        for f in CONFIG_DIR.glob(f"{SESSION_PREFIX}*{SESSION_SUFFIX}{BACKUP_SUFFIX}")
    )
    return sorted(labels)


def encrypt_password(password: str) -> str:
    """Placeholder for password encryption.

    Currently a no-op that returns the plain password. Intended to be
    replaced with a real encryption mechanism if/when needed.
    """
    # No-op: return plain text for now
    return password


def decrypt_password(token: str) -> str:
    """Placeholder for password decryption.

    Returns the original token in the current implementation.
    """
    # No-op: return plain text for now
    return token


def load_session(label: str) -> dict[str, Any]:
    """Load a session configuration by label.

    If the session file does not exist the backup is tried before defaults are
    returned. The returned dictionary is guaranteed to contain keys expected by
    the application (some defaults are populated if missing).
    """
    _recover_rename_transactions()
    path = get_session_path(label)
    cfg = _load_config_mapping(path, get_default_config(label))
    # --- Ensure all perk automation configs are always present and complete ---
    perk_auto = cfg.setdefault("perk_automation", {})
    # Upload Credit Automation defaults
    upload_defaults = {
        "enabled": False,
        "gb": 1,
        "min_points": 0,
        "points_to_keep": 0,
        "trigger_type": "time",
        "trigger_days": 7,
        "trigger_point_threshold": 50000,
    }
    upload_auto = perk_auto.setdefault("upload_credit", {})
    for k, v in upload_defaults.items():
        upload_auto.setdefault(k, v)

    # Wedge Automation defaults
    wedge_defaults = {
        "enabled": False,
        "trigger_days": 7,
        "trigger_point_threshold": 50000,
        "trigger_type": "time",
    }
    wedge_auto = perk_auto.setdefault("wedge_automation", {})
    for k, v in wedge_defaults.items():
        wedge_auto.setdefault(k, v)

    # VIP Automation defaults
    vip_defaults = {
        "enabled": False,
        "trigger_type": "time",
        "trigger_days": 7,
        "trigger_point_threshold": 50000,
        "weeks": 4,
    }
    vip_auto = perk_auto.setdefault("vip_automation", {})
    for k, v in vip_defaults.items():
        vip_auto.setdefault(k, v)

    if "mam_ip" not in cfg:
        cfg["mam_ip"] = ""
    # Backward compatibility for ip_monitoring_mode
    if "ip_monitoring_mode" not in cfg.get("mam", {}):
        cfg.setdefault("mam", {})["ip_monitoring_mode"] = "auto"
    if "last_check_time" not in cfg:
        cfg["last_check_time"] = None
    if "label" not in cfg:
        cfg["label"] = label
    if "browser_cookie" not in cfg:
        cfg["browser_cookie"] = ""

    # Prowlarr integration defaults
    prowlarr_defaults = {
        "enabled": False,
        "host": "",
        "port": 9696,
        "api_key": "",
        "auto_update_on_save": False,
    }
    prowlarr_cfg = cfg.setdefault("prowlarr", {})
    for k, v in prowlarr_defaults.items():
        prowlarr_cfg.setdefault(k, v)

    # MAM cookie-validity tracking (response-based, see classify_mam_response)
    if "mam_invalid_notified" not in cfg:
        cfg["mam_invalid_notified"] = False
    if "mam_invalid_since" not in cfg:
        cfg["mam_invalid_since"] = None
    if "last_mam_valid_check" not in cfg:
        cfg["last_mam_valid_check"] = None

    return cfg


def save_session(cfg: dict, old_label: str | None = None) -> SaveSessionResult:
    """Persist a session configuration to disk.

    If ``old_label`` is provided and different from the new label the
    existing file will be renamed. The function ensures the containing
    directory exists and writes the YAML representation of ``cfg``.

    Returns:
        The persistence outcome, including a stale update that was discarded.
    """
    label = cfg.get("label")
    if not label:
        raise ValueError("Session label is required to save a session.")
    path = get_session_path(label)
    old_path = get_session_path(old_label) if old_label else None
    lock_paths = (path,) if old_path is None else (old_path, path)
    with _RENAME_LOCK, lock_yaml_files(*lock_paths):
        if old_path is not None and not (old_path.exists() or backup_path(old_path).exists()):
            _logger.warning(
                "[ConfigStore] Discarding stale update for retired session %s",
                old_label,
            )
            return SaveSessionResult.STALE
        if old_path is not None and old_path != path:
            journal = _begin_rename_transaction(old_path, path, cfg)
            _complete_rename_transaction(journal)
            return SaveSessionResult.SAVED
        path.parent.mkdir(parents=True, exist_ok=True)
        # No encryption: just save password as-is
        if "browser_cookie" not in cfg:
            cfg["browser_cookie"] = ""
        write_yaml_file(path, cfg)
        return SaveSessionResult.SAVED


def get_default_config(label: str | None = None) -> dict[str, Any]:
    """Return a default configuration dictionary used for new sessions.

    The returned structure matches the shape expected by the rest of the
    application and is safe to mutate by callers.
    """
    return {
        "label": label or "",
        "mam": {
            "mam_id": "",
            "session_type": "ip",
            "ip_monitoring_mode": "auto",  # "auto", "manual", "static"
            "auto_purchase": {"wedge": False, "vip": False, "upload": False},
        },
        "browser_cookie": "",
        "mam_ip": "",
        "proxy": {"host": "", "port": 0, "username": "", "password": ""},
        "last_check_time": None,
        "perk_automation": {},
    }


def load_config() -> dict[str, Any]:
    """Load the global default configuration from CONFIG_PATH.

    If the config file does not exist the backup is tried before defaults are
    returned. Ensures a few expected keys are present before returning.
    """
    cfg = _load_config_mapping(CONFIG_PATH, get_default_config())
    if "mam_ip" not in cfg:
        cfg["mam_ip"] = ""
    if "last_check_time" not in cfg:
        cfg["last_check_time"] = None
    if "label" not in cfg:
        cfg["label"] = ""
    return cfg


def save_config(cfg: dict[str, Any]) -> None:
    """Persist the given global configuration to CONFIG_PATH.

    Ensures the config directory exists and writes the YAML file.
    """
    # Save to config.yaml (for defaults)
    config_dir = CONFIG_PATH.parent
    config_dir.mkdir(parents=True, exist_ok=True)
    write_yaml_file(CONFIG_PATH, cfg)


def delete_session(label: str) -> None:
    """Delete the session file and backup for a given label if they exist."""

    _recover_rename_transactions()
    path = get_session_path(label)
    with _RENAME_LOCK, lock_yaml_files(path):
        _delete_session_file_with_backup(path)


def _begin_rename_transaction(old_path: Path, new_path: Path, cfg: dict[str, Any]) -> Path:
    """Durably stage the exact new config and record its rename transaction."""
    old_path.parent.mkdir(parents=True, exist_ok=True)
    journal = old_path.parent / (
        f".session-rename-{old_path.name.removeprefix(SESSION_PREFIX)}.json"
    )
    pending = old_path.parent / (
        f".session-rename-{old_path.name.removeprefix(SESSION_PREFIX)}.pending.yaml"
    )
    if "browser_cookie" not in cfg:
        cfg["browser_cookie"] = ""
    _write_pending_config(pending, cfg)
    _rename_fault_point("pending")
    fd, temp_name = tempfile.mkstemp(dir=old_path.parent, prefix=f"{journal.name}.", suffix=".tmp")
    temp_path = Path(temp_name)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as file_obj:
            json.dump(
                {
                    "old": old_path.name,
                    "new": new_path.name,
                    "pending": pending.name,
                },
                file_obj,
            )
            file_obj.flush()
            os.fsync(file_obj.fileno())
        temp_path.replace(journal)
        _fsync_config_dir()
    finally:
        if temp_path.exists():
            temp_path.unlink()
    _rename_fault_point("journal")
    return journal


def _complete_rename_transaction(journal: Path) -> None:
    """Idempotently complete one recorded rename.

    Args:
        journal: Rename journal containing source and destination basenames.
    """
    transaction = json.loads(journal.read_text(encoding="utf-8"))
    old_path = _journal_session_path(transaction["old"])
    new_path = _journal_session_path(transaction["new"])
    pending = _journal_pending_path(transaction["pending"])
    old_backup = backup_path(old_path)
    if pending.exists():
        pending_cfg = yaml.safe_load(pending.read_text(encoding="utf-8"))
        if not isinstance(pending_cfg, dict):
            raise ValueError(f"Invalid pending session config at {pending}")
        new_backup = backup_path(new_path)
        if new_backup.exists():
            new_backup.unlink()
            _fsync_config_dir()
        write_yaml_file(new_path, pending_cfg)
        if not new_backup.exists():
            _write_pending_config(new_backup, pending_cfg)
        _rename_fault_point("publish")
    elif not new_path.exists():
        raise FileNotFoundError(f"Rename pending payload missing: {pending}")

    for candidate in (old_path, old_backup):
        if candidate.exists():
            candidate.unlink()
    _fsync_config_dir()
    _rename_fault_point("cleanup")
    if pending.exists():
        pending.unlink()
    _fsync_config_dir()
    _rename_fault_point("pending_cleanup")
    journal.unlink()
    _fsync_config_dir()


def _recover_rename_transactions() -> None:
    """Complete any rename interrupted after its durable journal was written."""
    if not CONFIG_DIR.exists():
        return
    with _RENAME_LOCK:
        referenced_pending: set[Path] = set()
        for journal in sorted(CONFIG_DIR.glob(RENAME_JOURNAL_GLOB)):
            try:
                transaction = json.loads(journal.read_text(encoding="utf-8"))
                old_path = _journal_session_path(transaction["old"])
                new_path = _journal_session_path(transaction["new"])
                referenced_pending.add(_journal_pending_path(transaction["pending"]))
                with lock_yaml_files(old_path, new_path):
                    _complete_rename_transaction(journal)
            except (KeyError, TypeError, ValueError, OSError, json.JSONDecodeError) as err:
                _logger.error("[ConfigStore] Could not recover rename journal %s: %s", journal, err)
        for pending in CONFIG_DIR.glob(RENAME_PENDING_GLOB):
            if pending not in referenced_pending:
                pending.unlink()
                _fsync_config_dir()


def _journal_session_path(name: str) -> Path:
    """Resolve and validate a session basename stored in a rename journal."""
    if (
        Path(name).name != name
        or not name.startswith(SESSION_PREFIX)
        or not name.endswith(SESSION_SUFFIX)
    ):
        raise ValueError(f"Invalid session path in rename journal: {name!r}")
    return CONFIG_DIR / name


def _journal_pending_path(name: str) -> Path:
    """Resolve and validate a pending payload basename from a rename journal."""
    if (
        Path(name).name != name
        or not name.startswith(".session-rename-")
        or not name.endswith(".pending.yaml")
    ):
        raise ValueError(f"Invalid pending path in rename journal: {name!r}")
    return CONFIG_DIR / name


def _write_pending_config(pending: Path, cfg: dict[str, Any]) -> None:
    """Atomically stage the exact new session payload with owner-only permissions."""
    fd, temp_name = tempfile.mkstemp(dir=pending.parent, prefix=f"{pending.name}.", suffix=".tmp")
    temp_path = Path(temp_name)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as file_obj:
            yaml.safe_dump(cfg, file_obj)
            file_obj.flush()
            os.fsync(file_obj.fileno())
        temp_path.replace(pending)
        pending.chmod(0o600)
        _fsync_config_dir()
    finally:
        if temp_path.exists():
            temp_path.unlink()


def _fsync_config_dir() -> None:
    """Best-effort flush of session directory metadata."""
    try:
        directory_fd = os.open(CONFIG_DIR, os.O_RDONLY)
    except OSError:
        return
    try:
        os.fsync(directory_fd)
    finally:
        os.close(directory_fd)


def _rename_fault_point(step: str) -> None:
    """Provide deterministic rename lifecycle fault injection for tests."""


def _delete_session_file_with_backup(path: Path) -> None:
    """Delete a session YAML file and its last-known-good backup.

    Args:
        path: Session YAML path.
    """
    for candidate in (path, backup_path(path)):
        if candidate.exists():
            candidate.unlink()


def _load_config_mapping(path: Path, default: dict[str, Any]) -> dict[str, Any]:
    """Load a YAML config file and ensure callers receive a mapping.

    Args:
        path: YAML config path.
        default: Default config returned for missing, corrupt, or wrong-shaped data.

    Returns:
        Parsed config mapping or ``default``.
    """
    return load_yaml_file(path, default, expected_type=dict)
