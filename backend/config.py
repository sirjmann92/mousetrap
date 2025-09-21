"""Configuration helpers for session and global config files.

This module provides utilities to read/write session-specific YAML
configuration files, a default global config, and simple helpers used by
the backend to locate and manage session files.
"""

from pathlib import Path
import threading

import yaml

CONFIG_DIR = Path("/config")
CONFIG_PATH = CONFIG_DIR / "config.yaml"
LOCK = threading.Lock()


SESSION_PREFIX = "session-"
SESSION_SUFFIX = ".yaml"


def get_session_path(label):
    """Return the filesystem path for a session identified by ``label``.

    The path is constructed using the module-level ``CONFIG_DIR`` and the
    session prefix/suffix constants.
    """
    return CONFIG_DIR / f"{SESSION_PREFIX}{label}{SESSION_SUFFIX}"


def list_sessions():
    """Return a list of session labels present in the config directory.

    Scans the ``CONFIG_DIR`` for files that match the session naming
    convention and returns the extracted labels (without prefix/suffix).
    """
    files = list(CONFIG_DIR.glob(f"{SESSION_PREFIX}*{SESSION_SUFFIX}"))
    return [f.name[len(SESSION_PREFIX) : -len(SESSION_SUFFIX)] for f in files]


def encrypt_password(password):
    """Placeholder for password encryption.

    Currently a no-op that returns the plain password. Intended to be
    replaced with a real encryption mechanism if/when needed.
    """
    # No-op: return plain text for now
    return password


def decrypt_password(token):
    """Placeholder for password decryption.

    Returns the original token in the current implementation.
    """
    # No-op: return plain text for now
    return token


def load_session(label):
    """Load a session configuration by label.

    If the session file does not exist the default config is returned. The
    returned dictionary is guaranteed to contain keys expected by the
    application (some defaults are populated if missing).
    """
    path = get_session_path(label)
    if not path.exists():
        cfg = get_default_config(label)
    else:
        with LOCK, path.open() as f:
            cfg = yaml.safe_load(f) or get_default_config(label)
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
    return cfg


def save_session(cfg, old_label=None):
    """Persist a session configuration to disk.

    If ``old_label`` is provided and different from the new label the
    existing file will be renamed. The function ensures the containing
    directory exists and writes the YAML representation of ``cfg``.
    """
    label = cfg.get("label")
    if not label:
        raise ValueError("Session label is required to save a session.")
    path = get_session_path(label)
    # If label changed, rename file
    if old_label and old_label != label:
        old_path = get_session_path(old_label)
        if old_path.exists():
            old_path.rename(path)
    config_dir = path.parent
    config_dir.mkdir(parents=True, exist_ok=True)
    # No encryption: just save password as-is
    if "browser_cookie" not in cfg:
        cfg["browser_cookie"] = ""
    with LOCK, path.open("w") as f:
        yaml.safe_dump(cfg, f)


def get_default_config(label=None):
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


def load_config():
    """Load the global default configuration from CONFIG_PATH.

    If the config file does not exist returns a default config. Ensures a
    few expected keys are present before returning.
    """
    # Load default config.yaml for defaults only
    if not CONFIG_PATH.exists():
        return get_default_config()
    with LOCK, CONFIG_PATH.open() as f:
        cfg = yaml.safe_load(f) or get_default_config()
        if "mam_ip" not in cfg:
            cfg["mam_ip"] = ""
        if "last_check_time" not in cfg:
            cfg["last_check_time"] = None
        if "label" not in cfg:
            cfg["label"] = ""
        return cfg


def save_config(cfg):
    """Persist the given global configuration to CONFIG_PATH.

    Ensures the config directory exists and writes the YAML file.
    """
    # Save to config.yaml (for defaults)
    config_dir = CONFIG_PATH.parent
    config_dir.mkdir(parents=True, exist_ok=True)
    with LOCK, CONFIG_PATH.open("w") as f:
        yaml.safe_dump(cfg, f)


def delete_session(label):
    """Delete the session file for a given label if it exists."""

    path = get_session_path(label)
    if path.exists():
        path.unlink()
