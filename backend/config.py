"""Configuration helpers for session and global config files.

This module provides utilities to read/write session-specific YAML
configuration files, a default global config, and simple helpers used by
the backend to locate and manage session files.
"""

from os import environ
from pathlib import Path
from typing import Any

from backend.yaml_store import YamlStoreError, load_yaml_file, write_yaml_file

CONFIG_DIR = Path(environ.get("CONFIG_DIR", "/config"))
CONFIG_PATH = CONFIG_DIR / "config.yaml"


SESSION_PREFIX = "session-"
SESSION_SUFFIX = ".yaml"


def get_session_path(label: str) -> Path:
    """Return the filesystem path for a session identified by ``label``.

    The path is constructed using the module-level ``CONFIG_DIR`` and the
    session prefix/suffix constants.
    """
    return CONFIG_DIR / f"{SESSION_PREFIX}{label}{SESSION_SUFFIX}"


def session_exists(label: str) -> bool:
    """Return whether a session file exists on disk for ``label``.

    :func:`load_session` synthesises a full default configuration when no file
    is present, so it can never report a missing session. Callers that need to
    distinguish "not configured" from "configured with defaults" must ask here
    before loading.

    Args:
        label: Session label to look for.

    Returns:
        ``True`` when a session file exists for the label.

    """
    return get_session_path(label).is_file()


def list_sessions() -> list[str]:
    """Return a list of session labels present in the config directory.

    Scans the ``CONFIG_DIR`` for files that match the session naming
    convention and returns the extracted labels.
    """
    files = list(CONFIG_DIR.glob(f"{SESSION_PREFIX}*{SESSION_SUFFIX}"))
    return [f.name[len(SESSION_PREFIX) : -len(SESSION_SUFFIX)] for f in files]


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


def _ensure_mapping(parent: dict[str, Any], key: str, section: str) -> dict[str, Any]:
    """Return a mutable config section, rejecting persisted non-mappings."""
    value = parent.setdefault(key, {})
    if not isinstance(value, dict):
        raise YamlStoreError(f"Session section '{section}' must be a mapping.")
    return value


def load_session(label: str) -> dict[str, Any]:
    """Load a session configuration by label.

    The returned dictionary contains the keys expected by the application.
    """
    path = get_session_path(label)
    cfg = load_yaml_file(path, get_default_config(label), expected_type=dict)
    # --- Ensure all perk automation configs are always present and complete ---
    perk_auto = _ensure_mapping(cfg, "perk_automation", "perk_automation")
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
    upload_auto = _ensure_mapping(
        perk_auto,
        "upload_credit",
        "perk_automation.upload_credit",
    )
    for k, v in upload_defaults.items():
        upload_auto.setdefault(k, v)

    # Wedge Automation defaults
    wedge_defaults = {
        "enabled": False,
        "trigger_days": 7,
        "trigger_point_threshold": 50000,
        "trigger_type": "time",
    }
    wedge_auto = _ensure_mapping(
        perk_auto,
        "wedge_automation",
        "perk_automation.wedge_automation",
    )
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
    vip_auto = _ensure_mapping(
        perk_auto,
        "vip_automation",
        "perk_automation.vip_automation",
    )
    for k, v in vip_defaults.items():
        vip_auto.setdefault(k, v)

    if "mam_ip" not in cfg:
        cfg["mam_ip"] = ""
    # Backward compatibility for ip_monitoring_mode
    mam_cfg = _ensure_mapping(cfg, "mam", "mam")
    if "ip_monitoring_mode" not in mam_cfg:
        mam_cfg["ip_monitoring_mode"] = "auto"
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
    prowlarr_cfg = _ensure_mapping(cfg, "prowlarr", "prowlarr")
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


def save_session(cfg: dict[str, Any], old_label: str | None = None) -> None:
    """Persist a session configuration to disk.

    If ``old_label`` is provided and different from the new label the
    new file is written completely before the old file is removed. An old-file
    unlink failure is propagated and may leave both complete files present.
    """
    label = cfg.get("label")
    if not label:
        raise ValueError("Session label is required to save a session.")
    path = get_session_path(label)
    if "browser_cookie" not in cfg:
        cfg["browser_cookie"] = ""
    write_yaml_file(path, cfg)
    if old_label and old_label != label:
        old_path = get_session_path(old_label)
        if old_path.exists():
            old_path.unlink()


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
    cfg = load_yaml_file(CONFIG_PATH, get_default_config(), expected_type=dict)
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
    path.unlink(missing_ok=True)
