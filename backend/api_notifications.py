import yaml
from fastapi import APIRouter, HTTPException

from backend.notifications_backend import (
    NOTIFY_CONFIG_PATH,
    load_notify_config,
    send_apprise_notification,
    send_smtp_notification,
    send_webhook_notification,
)

router = APIRouter()


def save_notify_config(cfg):
    with open(NOTIFY_CONFIG_PATH, "w") as f:
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
    url = cfg.get("webhook_url")
    discord_webhook = cfg.get("discord_webhook", False)
    if not url:
        raise HTTPException(status_code=400, detail="Webhook URL not set.")
    ok = send_webhook_notification(url, payload, discord=discord_webhook)
    return {"success": ok}


@router.post("/notify/test/smtp")
def test_smtp(payload: dict):
    cfg = load_notify_config()
    smtp = cfg.get("smtp", {})
    required = ["host", "port", "username", "password", "to_email"]
    if not all(k in smtp for k in required):
        raise HTTPException(status_code=400, detail="SMTP config incomplete.")
    ok = send_smtp_notification(
        smtp["host"],
        smtp["port"],
        smtp["username"],
        smtp["password"],
        smtp["to_email"],
        payload.get("subject", "Test"),
        payload.get("body", "Test"),
        smtp.get("use_tls", True),
    )
    return {"success": ok}


@router.post("/notify/test/apprise")
def test_apprise(payload: dict):
    cfg = load_notify_config()
    apprise_cfg = cfg.get("apprise", {})
    apprise_url = apprise_cfg.get("url")
    notify_url_string = apprise_cfg.get("notify_url_string")
    include_prefix = apprise_cfg.get("include_prefix", False)
    if not apprise_url or not notify_url_string:
        raise HTTPException(status_code=400, detail="Apprise config incomplete.")

    test_payload = {
        "event_type": payload.get("event_type", "test"),
        "label": payload.get("label", "UI Test"),
        "status": payload.get("status", "TEST"),
        "message": payload.get(
            "message", "Session: UI Test, Test Apprise notification from MouseTrap"
        ),
        "details": payload.get("details", {}),
    }

    ok = send_apprise_notification(apprise_url, notify_url_string, test_payload, include_prefix)
    return {"success": ok}
