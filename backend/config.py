import yaml
import os
import threading
import glob

CONFIG_DIR = os.path.join(os.path.dirname(__file__), "..", "config")
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

def load_session(label):
    path = get_session_path(label)
    if not os.path.exists(path):
        return get_default_config(label)
    with LOCK, open(path, "r") as f:
        cfg = yaml.safe_load(f) or get_default_config(label)
        if "mam_ip" not in cfg:
            cfg["mam_ip"] = ""
        if "last_check_time" not in cfg:
            cfg["last_check_time"] = None
        if "label" not in cfg:
            cfg["label"] = label
        return cfg

def save_session(cfg, old_label=None):
    label = cfg.get("label", "Session01")
    path = get_session_path(label)
    # If label changed, rename file
    if old_label and old_label != label:
        old_path = get_session_path(old_label)
        if os.path.exists(old_path):
            os.rename(old_path, path)
    config_dir = os.path.dirname(path)
    os.makedirs(config_dir, exist_ok=True)
    with LOCK, open(path, "w") as f:
        yaml.safe_dump(cfg, f)

def get_default_config(label="Session01"):
    cfg = {
        "label": label,
        "mam": {
            "mam_id": "",
            "session_type": "ip",
            "buffer": 52000,
            "wedge_hours": 168,
            "auto_purchase": {
                "wedge": True,
                "vip": False,
                "upload": True
            },
            "min_points": 55000,
            "dont_spend_below": 50000
        },
        "automation": {
            "refresh_minutes": 30
        },
        "notifications": {
            "email": {
                "enabled": False,
                "smtp": {
                    "server": "",
                    "port": 587,
                    "username": "",
                    "password": "",
                    "sender": "",
                    "recipient": ""
                },
                "events": {
                    "wedge_purchase": True,
                    "ip_changed": True,
                    "cookie_updated": True,
                    "points_below_threshold": True
                }
            },
            "webhooks": []
        },
        "mam_ip": ""
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
            cfg["label"] = "Session01"
        return cfg

def save_config(cfg):
    # Save to config.yaml (for defaults)
    config_dir = os.path.dirname(CONFIG_PATH)
    os.makedirs(config_dir, exist_ok=True)
    with LOCK, open(CONFIG_PATH, "w") as f:
        yaml.safe_dump(cfg, f)