"""Notification helpers for webhooks, SMTP and Apprise.

This module provides small helper functions used by the application to send
notifications via webhooks (including Discord), SMTP, and the Apprise service.
Only minimal dependencies are required so these helpers can be used in simple
automation and alerting flows.
"""

from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import logging
import os
from pathlib import Path
import smtplib

import requests
import yaml

_logger: logging.Logger = logging.getLogger(__name__)
# Notification config (could be loaded from YAML or env)
NOTIFY_CONFIG_PATH = os.environ.get("NOTIFY_CONFIG_PATH", "/config/notify.yaml")


def send_webhook_notification(url: str, payload: dict, discord: bool = False) -> bool:
    """Send a JSON webhook notification.

    Parameters
    ----------
    url : str
        The webhook URL to post to.
    payload : dict
        JSON-serializable payload to send.
    discord : bool, optional
        If True, format payload for Discord (use `content` field), by default False.

    Returns
    -------
    bool
        True when the request succeeded (HTTP 2xx), False on any exception.
    """
    try:
        if discord:
            # Discord expects {"content": ...}
            data = {"content": payload.get("message") or str(payload)}
            resp = requests.post(url, json=data, timeout=10)
        else:
            resp = requests.post(url, json=payload, timeout=10)
        resp.raise_for_status()
    except Exception as e:
        _logger.error("[Notify] Webhook failed: %s", e)
        return False
    else:
        return True


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
    """Send a simple plain-text SMTP email.

    Parameters
    ----------
    smtp_host : str
        SMTP server hostname.
    smtp_port : int
        SMTP server port.
    username : str
        Username used for SMTP login and the From address.
    password : str
        Password for SMTP authentication.
    to_email : str
        Recipient email address.
    subject : str
        Email subject line.
    body : str
        Email body (plain text).
    use_tls : bool, optional
        Whether to use STARTTLS, by default True.

    Returns
    -------
    bool
        True on success, False on failure.
    """
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
    except Exception as e:
        _logger.error("[Notify] SMTP failed: %s", e)
        return False
    else:
        return True


def send_apprise_notification(
    apprise_url: str, notify_url_string: str, payload: dict, include_prefix: bool = False
) -> bool:
    """Send a notification using Apprise.

    Returns True on success, False on failure.
    """

    if not notify_url_string or not apprise_url:
        _logger.error("[Notify] Apprise config missing apprise_url or notify_url_string")
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
            _logger.error(
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
            _logger.error("[Notify] Apprise failed. success=false: %s", resp_json)
            return False

    except requests.RequestException as e:
        _logger.error("[Notify] Apprise failed. %s: %s", type(e).__name__, e)
        return False
    else:
        _logger.info("[Notify] Apprise sent successfully")
        return True


def load_notify_config():
    """Load notification configuration from a YAML file.

    The path is taken from the NOTIFY_CONFIG_PATH environment variable or
    a sensible default. Returns an empty dict when the file does not exist
    or cannot be parsed.

    Returns
    -------
    dict
        Parsed YAML as a dictionary, or an empty dict on failure.
    """
    if not Path(NOTIFY_CONFIG_PATH).exists():
        return {}
    with Path(NOTIFY_CONFIG_PATH).open() as f:
        return yaml.safe_load(f) or {}


def notify_event(
    event_type: str,
    label: str | None = None,
    status: str | None = None,
    message: str | None = None,
    details: dict | None = None,
):
    """Send notification (webhook and/or SMTP) for important events.

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
