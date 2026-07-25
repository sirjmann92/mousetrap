"""Configuration helpers for session and global config files.

This module provides utilities to read/write session-specific YAML
configuration files, a default global config, and simple helpers used by
the backend to locate and manage session files.
"""

import logging
from os import environ
from pathlib import Path
from typing import Any

from backend.yaml_store import backup_path, load_yaml_file, lock_yaml_files, write_yaml_file

CONFIG_DIR = Path(environ.get("CONFIG_DIR", "/config"))
CONFIG_PATH = CONFIG_DIR / "config.yaml"


SESSION_PREFIX = "session-"
SESSION_SUFFIX = ".yaml"
BACKUP_SUFFIX = ".bak"
_logger = logging.getLogger(__name__)


def get_session_path(label: str) -> Path:
    """Return the filesystem path for a session identified by ``label``.

    The path is constructed using the module-level ``CONFIG_DIR`` and the
    session prefix/suffix constants.
    """
    return CONFIG_DIR / f"{SESSION_PREFIX}{label}{SESSION_SUFFIX}"


def list_sessions() -> list[str]:
    """Return a list of session labels present in the config directory.

    Scans the ``CONFIG_DIR`` for files that match the session naming
    convention, including backup-only files, and returns the extracted labels.
    """
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


def save_session(cfg: dict, old_label: str | None = None) -> None:
    """Persist a session configuration to disk.

    If ``old_label`` is provided and different from the new label the
    existing file will be renamed. The function ensures the containing
    directory exists and writes the YAML representation of ``cfg``.
    """
    label = cfg.get("label")
    if not label:
        raise ValueError("Session label is required to save a session.")
    path = get_session_path(label)
    old_path = get_session_path(old_label) if old_label else None
    lock_paths = (path,) if old_path is None else (old_path, path)
    with lock_yaml_files(*lock_paths):
        if old_path is not None and not (old_path.exists() or backup_path(old_path).exists()):
            _logger.warning(
                "[ConfigStore] Discarding stale update for retired session %s",
                old_label,
            )
            return
        if old_path is not None and old_path != path:
            _rename_session_file_with_backup(old_path, path)
        path.parent.mkdir(parents=True, exist_ok=True)
        # No encryption: just save password as-is
        if "browser_cookie" not in cfg:
            cfg["browser_cookie"] = ""
        write_yaml_file(path, cfg)


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

    path = get_session_path(label)
    with lock_yaml_files(path):
        _delete_session_file_with_backup(path)


def _rename_session_file_with_backup(old_path: Path, new_path: Path) -> None:
    """Rename a session YAML file and its last-known-good backup.

    Args:
        old_path: Current session YAML path.
        new_path: New session YAML path.
    """
    if old_path.exists():
        old_path.rename(new_path)
    old_backup = backup_path(old_path)
    new_backup = backup_path(new_path)
    if old_backup.exists():
        old_backup.replace(new_backup)
    elif new_backup.exists():
        new_backup.unlink()


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
