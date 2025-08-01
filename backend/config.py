import yaml
import os
import threading

CONFIG_PATH = os.path.join(os.path.dirname(__file__), "..", "config", "config.yaml")
LOCK = threading.Lock()

def load_config():
    if not os.path.exists(CONFIG_PATH):
        cfg = get_default_config()
        cfg["last_check_time"] = None
        if "label" not in cfg:
            cfg["label"] = "Session01"
        return cfg
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
    # Ensure the config directory exists before saving
    config_dir = os.path.dirname(CONFIG_PATH)
    os.makedirs(config_dir, exist_ok=True)
    with LOCK, open(CONFIG_PATH, "w") as f:
        yaml.safe_dump(cfg, f)

def get_default_config():
    return {
        "label": "Session01",
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