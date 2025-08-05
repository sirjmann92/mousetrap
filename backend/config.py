import yaml
import os
import threading
import glob
from cryptography.fernet import Fernet, InvalidToken
import base64

CONFIG_DIR = "/config"
CONFIG_PATH = os.path.join(CONFIG_DIR, "config.yaml")
LOCK = threading.Lock()

SESSION_PREFIX = "session-"
SESSION_SUFFIX = ".yaml"

FERNET_KEY_PATH = os.path.join(CONFIG_DIR, "fernet.key")

def get_session_path(label):
    return os.path.join(CONFIG_DIR, f"{SESSION_PREFIX}{label}{SESSION_SUFFIX}")

def list_sessions():
    pattern = os.path.join(CONFIG_DIR, f"{SESSION_PREFIX}*{SESSION_SUFFIX}")
    files = glob.glob(pattern)
    labels = [os.path.basename(f)[len(SESSION_PREFIX):-len(SESSION_SUFFIX)] for f in files]
    return labels

def get_fernet():
    if not os.path.exists(FERNET_KEY_PATH):
        key = Fernet.generate_key()
        with open(FERNET_KEY_PATH, "wb") as f:
            f.write(key)
    else:
        with open(FERNET_KEY_PATH, "rb") as f:
            key = f.read()
    return Fernet(key)

def encrypt_password(password):
    if not password:
        return ""
    f = get_fernet()
    return f.encrypt(password.encode()).decode()

def decrypt_password(token):
    if not token:
        return ""
    f = get_fernet()
    try:
        return f.decrypt(token.encode()).decode()
    except InvalidToken:
        return ""

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
        # Decrypt proxy password if present
        if "proxy" in cfg and "password" in cfg["proxy"]:
            cfg["proxy"]["password_decrypted"] = decrypt_password(cfg["proxy"]["password"])
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
    # Encrypt proxy password if present
    if "proxy" in cfg and "password" in cfg["proxy"]:
        if cfg["proxy"]["password"] and not cfg["proxy"]["password"].startswith("gAAAA"):
            cfg["proxy"]["password"] = encrypt_password(cfg["proxy"]["password"])
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
                "wedge": False,
                "vip": False,
                "upload": False
            }
        },
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
            cfg["label"] = "Session01"
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