

import os
import yaml
import threading
import glob

CONFIG_DIR = "/config"
CONFIG_PATH = os.path.join(CONFIG_DIR, "config.yaml")
LOCK = threading.Lock()





SESSION_PREFIX = "session-"
SESSION_SUFFIX = ".yaml"

def get_session_path(label):
    return os.path.join(CONFIG_DIR, f"{SESSION_PREFIX}{label}{SESSION_SUFFIX}")

def list_sessions():
    pattern = os.path.join(CONFIG_DIR, f"{SESSION_PREFIX}*{SESSION_SUFFIX}")
    files = glob.glob(pattern)
    labels = [os.path.basename(f)[len(SESSION_PREFIX):-len(SESSION_SUFFIX)] for f in files]
    return labels

def encrypt_password(password):
    # No-op: return plain text for now
    return password

def decrypt_password(token):
    # No-op: return plain text for now
    return token

def load_session(label):
    path = get_session_path(label)
    if not os.path.exists(path):
        cfg = get_default_config(label)
    else:
        with LOCK, open(path, "r") as f:
            cfg = yaml.safe_load(f) or get_default_config(label)
    # --- Ensure all perk automation configs are always present and complete ---
    perk_auto = cfg.setdefault('perk_automation', {})
    # Upload Credit Automation defaults
    upload_defaults = {
        'enabled': False,
        'gb': 1,
        'min_points': 0,
        'points_to_keep': 0,
        'trigger_type': 'time',
        'trigger_days': 7,
        'trigger_point_threshold': 50000,
    }
    upload_auto = perk_auto.setdefault('upload_credit', {})
    for k, v in upload_defaults.items():
        upload_auto.setdefault(k, v)

    # Wedge Automation defaults
    wedge_defaults = {
        'enabled': False,
        'trigger_days': 7,
        'trigger_point_threshold': 50000,
        'trigger_type': 'time',
    }
    wedge_auto = perk_auto.setdefault('wedge_automation', {})
    for k, v in wedge_defaults.items():
        wedge_auto.setdefault(k, v)

    # VIP Automation defaults
    vip_defaults = {
        'enabled': False,
        'trigger_type': 'time',
        'trigger_days': 7,
        'trigger_point_threshold': 50000,
        'weeks': 4,
    }
    vip_auto = perk_auto.setdefault('vip_automation', {})
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
    label = cfg.get("label")
    if not label:
        raise ValueError("Session label is required to save a session.")
    path = get_session_path(label)
    # If label changed, rename file
    if old_label and old_label != label:
        old_path = get_session_path(old_label)
        if os.path.exists(old_path):
            os.rename(old_path, path)
    config_dir = os.path.dirname(path)
    os.makedirs(config_dir, exist_ok=True)
    # No encryption: just save password as-is
    if "browser_cookie" not in cfg:
        cfg["browser_cookie"] = ""
    with LOCK, open(path, "w") as f:
        yaml.safe_dump(cfg, f)

def get_default_config(label=None):
    cfg = {
        "label": label or "",
        "mam": {
            "mam_id": "",
            "session_type": "ip",
            "ip_monitoring_mode": "auto",  # "auto", "manual", "static"
            "auto_purchase": {
                "wedge": False,
                "vip": False,
                "upload": False
            }
        },
        "browser_cookie": "",
        "mam_ip": "",
        "proxy": {
            "host": "",
            "port": 0,
            "username": "",
            "password": ""
        },
        "last_check_time": None,
        "perk_automation": {},
    }
    return cfg

def load_config():
    # Load default config.yaml for defaults only
    if not os.path.exists(CONFIG_PATH):
        return get_default_config()
    with LOCK, open(CONFIG_PATH, "r") as f:
        cfg = yaml.safe_load(f) or get_default_config()
        if "mam_ip" not in cfg:
            cfg["mam_ip"] = ""
        if "last_check_time" not in cfg:
            cfg["last_check_time"] = None
        if "label" not in cfg:
            cfg["label"] = ""
        return cfg

def save_config(cfg):
    # Save to config.yaml (for defaults)
    config_dir = os.path.dirname(CONFIG_PATH)
    os.makedirs(config_dir, exist_ok=True)
    with LOCK, open(CONFIG_PATH, "w") as f:
        yaml.safe_dump(cfg, f)

def delete_session(label):
    path = get_session_path(label)
    if os.path.exists(path):
        os.remove(path)