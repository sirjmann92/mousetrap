"""Configuration helpers for session and global config files.

This module provides utilities to read/write session-specific YAML
configuration files, a default global config, and simple helpers used by
the backend to locate and manage session files.
"""

import logging
from os import environ
from pathlib import Path
import threading
from typing import Any

from backend.yaml_store import load_yaml_file, write_yaml_file

CONFIG_DIR = Path(environ.get("CONFIG_DIR", "/config"))
CONFIG_PATH = CONFIG_DIR / "config.yaml"


SESSION_PREFIX = "session-"
SESSION_SUFFIX = ".yaml"
NAME_MAX_BYTES = 255
MAX_SESSION_LABEL_BYTES = NAME_MAX_BYTES - len(f"{SESSION_PREFIX}{SESSION_SUFFIX}".encode())
_logger = logging.getLogger(__name__)
_SESSION_LOCK = threading.RLock()


class StaleSessionError(RuntimeError):
    """Raised when an update targets a session that no longer exists."""


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
    try:
        label_bytes = label.encode("utf-8")
    except UnicodeEncodeError as err:
        raise ValueError("Session label must be valid UTF-8.") from err
    if len(label_bytes) > MAX_SESSION_LABEL_BYTES:
        raise ValueError(f"Session label must be at most {MAX_SESSION_LABEL_BYTES} UTF-8 bytes.")
    filename = f"{SESSION_PREFIX}{label}{SESSION_SUFFIX}"
    if Path(filename).name != filename:
        raise ValueError("Session label must resolve directly within the config directory.")
    return CONFIG_DIR / filename


def list_sessions() -> list[str]:
    """Return a list of session labels present in the config directory.

    Scans the ``CONFIG_DIR`` for files that match the session naming
    convention and returns the extracted labels.
    """
    with _SESSION_LOCK:
        labels: set[str] = set()
        for file_path in CONFIG_DIR.glob(f"{SESSION_PREFIX}*{SESSION_SUFFIX}"):
            label = file_path.name[len(SESSION_PREFIX) : -len(SESSION_SUFFIX)]
            try:
                get_session_path(label)
            except ValueError as err:
                _logger.warning(
                    "[ConfigStore] Skipping invalid legacy session file %s: %s",
                    file_path,
                    err,
                )
                continue
            labels.add(label)
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


def _load_session_unlocked(label: str) -> dict[str, Any]:
    """Load a session configuration by label.

    The returned dictionary contains the keys expected by the application.
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


def load_session(label: str) -> dict[str, Any]:
    """Load and normalize a session configuration under the lifecycle lock."""
    with _SESSION_LOCK:
        return _load_session_unlocked(label)


def save_session(cfg: dict[str, Any], old_label: str | None = None) -> None:
    """Persist a session configuration to disk.

    If ``old_label`` is provided and different from the new label the
    existing file will be renamed.

    Raises:
        StaleSessionError: If ``old_label`` no longer has a primary file.
    """
    label = cfg.get("label")
    if not label:
        raise ValueError("Session label is required to save a session.")
    path = get_session_path(label)
    old_path = get_session_path(old_label) if old_label else None
    with _SESSION_LOCK:
        if old_path is not None and not old_path.exists():
            raise StaleSessionError(f"Session no longer exists: {old_label}")
        if old_path is not None and old_path != path:
            old_path.replace(path)
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

    If the config file does not exist, defaults are returned. Existing corrupt
    or wrong-shaped YAML raises ``YamlStoreError``. Ensures a few expected keys
    are present before returning.
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
    """Persist the given global configuration to CONFIG_PATH."""
    # Save to config.yaml (for defaults)
    write_yaml_file(CONFIG_PATH, cfg)


def delete_session(label: str) -> None:
    """Delete the primary session file for a given label if it exists."""
    path = get_session_path(label)
    with _SESSION_LOCK:
        path.unlink(missing_ok=True)


def _load_config_mapping(path: Path, default: dict[str, Any]) -> dict[str, Any]:
    """Load a YAML config file and ensure callers receive a mapping.

    Args:
        path: YAML config path.
        default: Default config returned when the file is missing.

    Returns:
        Parsed config mapping or ``default``.

    Raises:
        YamlStoreError: If an existing file is corrupt or not a mapping.
    """
    return load_yaml_file(path, default, expected_type=dict)
