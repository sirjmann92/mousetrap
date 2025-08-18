import os
import yaml
from fastapi import APIRouter, HTTPException, Request
from backend.notifications_backend import send_webhook_notification, send_smtp_notification, NOTIFY_CONFIG_PATH

router = APIRouter()

# Load notification config
def load_notify_config():
    if not os.path.exists(NOTIFY_CONFIG_PATH):
        return {}
    with open(NOTIFY_CONFIG_PATH, 'r') as f:
        return yaml.safe_load(f) or {}

def save_notify_config(cfg):
    with open(NOTIFY_CONFIG_PATH, 'w') as f:
        yaml.safe_dump(cfg, f)

@router.get("/notify/config")
def get_notify_config():
    return load_notify_config()

@router.post("/notify/config")
def set_notify_config(cfg: dict):
    save_notify_config(cfg)
    return {"success": True}

@router.post("/notify/test/webhook")
def test_webhook(payload: dict):
    cfg = load_notify_config()
    url = cfg.get('webhook_url')
    discord_webhook = cfg.get('discord_webhook', False)
    if not url:
        raise HTTPException(status_code=400, detail="Webhook URL not set.")
    ok = send_webhook_notification(url, payload, discord=discord_webhook)
    return {"success": ok}

@router.post("/notify/test/smtp")
def test_smtp(payload: dict):
    cfg = load_notify_config()
    smtp = cfg.get('smtp', {})
    required = ['host', 'port', 'username', 'password', 'to_email']
    if not all(k in smtp for k in required):
        raise HTTPException(status_code=400, detail="SMTP config incomplete.")
    ok = send_smtp_notification(
        smtp['host'], smtp['port'], smtp['username'], smtp['password'],
        smtp['to_email'], payload.get('subject', 'Test'), payload.get('body', 'Test'), smtp.get('use_tls', True)
    )
    return {"success": ok}
