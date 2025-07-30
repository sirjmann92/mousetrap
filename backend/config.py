import yaml
import os
import threading

CONFIG_PATH = os.path.join(os.path.dirname(__file__), "..", "config", "config.yaml")
LOCK = threading.Lock()

def load_config():
    if not os.path.exists(CONFIG_PATH):
        return get_default_config()
    with LOCK, open(CONFIG_PATH, "r") as f:
        cfg = yaml.safe_load(f) or get_default_config()
        if "mam_ip" not in cfg:
            cfg["mam_ip"] = ""
        return cfg

def save_config(cfg):
    with LOCK, open(CONFIG_PATH, "w") as f:
        yaml.safe_dump(cfg, f)

def get_default_config():
    return {
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