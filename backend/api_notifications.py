"""API endpoints for testing and configuring notification backends.

This module exposes FastAPI routes under `/notify/*` to read and write the
notification configuration and to trigger test notifications for webhook,
SMTP, and Apprise-based notification backends. The endpoints delegate to the
utilities in :mod:`backend.notifications_backend` for the actual sending logic.
"""

from pathlib import Path

from fastapi import APIRouter, HTTPException
import yaml

from backend.notifications_backend import (
    NOTIFY_CONFIG_PATH,
    load_notify_config,
    send_apprise_notification,
    send_smtp_notification,
    send_webhook_notification,
)

router = APIRouter()


def save_notify_config(cfg):
    """Persist the notification configuration to disk.

    Args:
        cfg: Dictionary containing the notification configuration to save.

    """
    path = Path(NOTIFY_CONFIG_PATH)
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w") as f:
        yaml.safe_dump(cfg, f)


@router.get("/notify/config")
def get_notify_config():
    """Return the current notification configuration.

    The configuration is loaded from the configured notify config path and
    returned as a dictionary.
    """
    return load_notify_config()


@router.post("/notify/config")
def set_notify_config(cfg: dict):
    """Save a new notification configuration.

    Args:
        cfg: Dict representing the notification configuration to persist.

    Returns:
        A dict with a "success" boolean indicating the write succeeded.

    """
    save_notify_config(cfg)
    return {"success": True}


@router.post("/notify/test/webhook")
def test_webhook(payload: dict):
    """Send a test payload to the configured webhook URL.

    Args:
        payload: Arbitrary dict that will be forwarded to the webhook.

    Returns:
        A dict with a "success" boolean indicating whether the notification
        was sent successfully.

    Raises:
        HTTPException: If no webhook URL is configured.

    """
    cfg = load_notify_config()
    url = cfg.get("webhook_url")
    discord_webhook = cfg.get("discord_webhook", False)
    if not url:
        raise HTTPException(status_code=400, detail="Webhook URL not set.")
    ok = send_webhook_notification(url, payload, discord=discord_webhook)
    return {"success": ok}


@router.post("/notify/test/smtp")
def test_smtp(payload: dict):
    """Send a test SMTP notification using the configured SMTP settings.

    Args:
        payload: A dict that may contain `subject` and `body` keys for the
            test message.

    Returns:
        A dict with a "success" boolean indicating whether the message was
        sent successfully.

    Raises:
        HTTPException: If the SMTP configuration is incomplete.

    """
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
    """Send a test notification via Apprise.

    The function builds a small test payload from the provided `payload`
    argument and dispatches it using the configured Apprise settings.

    Args:
        payload: Dict that may include `event_type`, `label`, `status`,
            `message`, and `details` to include in the test notification.

    Returns:
        A dict with a "success" boolean indicating whether the notification
        was successfully queued/sent.

    Raises:
        HTTPException: If the Apprise configuration is incomplete.

    """
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
