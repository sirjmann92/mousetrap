import logging
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Dict, Optional

import requests
import yaml

# Notification config (could be loaded from YAML or env)
NOTIFY_CONFIG_PATH = os.environ.get("NOTIFY_CONFIG_PATH", "/config/notify.yaml")


def send_webhook_notification(url: str, payload: dict, discord: bool = False) -> bool:
    try:
        if discord:
            # Discord expects {"content": ...}
            data = {"content": payload.get("message") or str(payload)}
            resp = requests.post(url, json=data, timeout=10)
        else:
            resp = requests.post(url, json=payload, timeout=10)
        resp.raise_for_status()
        return True
    except Exception as e:
        logging.error(f"[Notify] Webhook failed: {e}")
        return False


def send_smtp_notification(
    smtp_host: str,
    smtp_port: int,
    username: str,
    password: str,
    to_email: str,
    subject: str,
    body: str,
    use_tls: bool = True,
) -> bool:
    try:
        msg = MIMEMultipart()
        msg["From"] = username
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain"))
        server = smtplib.SMTP(smtp_host, smtp_port, timeout=10)
        if use_tls:
            server.starttls()
        server.login(username, password)
        server.sendmail(username, to_email, msg.as_string())
        server.quit()
        return True
    except Exception as e:
        logging.error(f"[Notify] SMTP failed: {e}")
        return False


def send_apprise_notification(
    apprise_url: str, notify_url_string: str, payload: dict, include_prefix: bool = False
) -> bool:
    """Send a notification using Apprise.

    Returns True on success, False on failure.
    """

    if not notify_url_string or not apprise_url:
        logging.error("[Notify] Apprise config missing apprise_url or notify_url_string")
        return False

    event_type = payload.get("event_type", "Notification").replace("_", " ").title()
    status = (": " + payload.get("status", "").title()) if payload.get("status") else ""
    title_prefix = "MouseTrap: " if include_prefix else ""
    title = f"{title_prefix}{event_type}{status}"
    message = payload.get("message", "")
    notif_type = (
        "success"
        if payload.get("status") == "SUCCESS"
        else "failure"
        if payload.get("status") == "FAILED"
        else "info"
    )

    try:
        apprise_base = apprise_url.rstrip("/")
        if apprise_base.lower().endswith("/notify"):
            post_url = apprise_base
        else:
            post_url = f"{apprise_base}/notify"

        response: requests.Response = requests.post(
            post_url,
            data={"urls": notify_url_string, "body": message, "title": title, "type": notif_type},
            timeout=5,
        )

        if not response.ok:
            logging.error(
                "[Notify] Apprise failed. Response: %s - %s",
                response.status_code,
                response.text,
            )
            return False

        # Try to parse JSON; if JSON is present and explicitly indicates failure,
        # treat that as a failure. If JSON can't be parsed, fall back to treating
        # the 200 as success.
        try:
            resp_json = response.json()
        except ValueError:
            resp_json = None

        if isinstance(resp_json, dict) and resp_json.get("success") is False:
            logging.error("[Notify] Apprise failed. success=false: %s", resp_json)
            return False

    except requests.RequestException as e:
        logging.error("[Notify] Apprise failed. %s: %s", type(e).__name__, e)
        return False
    else:
        logging.info("[Notify] Apprise sent successfully")
        return True


def load_notify_config():
    if not os.path.exists(NOTIFY_CONFIG_PATH):
        return {}
    with open(NOTIFY_CONFIG_PATH, "r") as f:
        return yaml.safe_load(f) or {}


def notify_event(
    event_type: str,
    label: Optional[str] = None,
    status: Optional[str] = None,
    message: Optional[str] = None,
    details: Optional[Dict] = None,
):
    """
    Send notification (webhook and/or SMTP) for important events.
    event_type: e.g. 'port_monitor_failure', 'automation_success', 'automation_failure'
    label: session label or global
    status: e.g. 'FAILED', 'SUCCESS'
    message: summary string
    details: dict of extra info
    """
    cfg = load_notify_config()
    event_rules = cfg.get("event_rules", {})
    rule = event_rules.get(event_type, {"email": False, "webhook": False, "apprise": False})
    # Prevent spam: only send if at least one channel is enabled for this event
    if not rule.get("email") and not rule.get("webhook") and not rule.get("apprise"):
        return
    # Always prepend session name to the message if label is present
    session_prefix = f"Session: {label}, " if label else ""
    full_message = f"{session_prefix}{message}" if message else session_prefix.rstrip(", ")
    payload = {
        "event_type": event_type,
        "label": label,
        "status": status,
        "message": full_message,
        "details": details or {},
    }
    # Webhook
    if rule.get("webhook"):
        webhook_url = cfg.get("webhook_url")
        discord_webhook = cfg.get("discord_webhook", False)
        if webhook_url:
            send_webhook_notification(webhook_url, payload, discord=discord_webhook)
    # SMTP
    if rule.get("email"):
        smtp = cfg.get("smtp", {})
        required = ["host", "port", "username", "password", "to_email"]
        if all(k in smtp for k in required):
            subject = f"[MouseTrap] {event_type} - {status or ''}"
            body = f"Event: {event_type}\nLabel: {label}\nStatus: {status}\nMessage: {full_message}\nDetails: {details}"
            send_smtp_notification(
                smtp["host"],
                smtp["port"],
                smtp["username"],
                smtp["password"],
                smtp["to_email"],
                subject,
                body,
                smtp.get("use_tls", True),
            )

    # Apprise
    if rule.get("apprise"):
        apprise_cfg = cfg.get("apprise", {})
        apprise_url = apprise_cfg.get("url")
        notify_url_string = apprise_cfg.get("notify_url_string")
        include_prefix = apprise_cfg.get("include_prefix", False)
        if apprise_url and notify_url_string:
            send_apprise_notification(
                apprise_url=apprise_url,
                notify_url_string=notify_url_string,
                payload=payload,
                include_prefix=include_prefix,
            )
