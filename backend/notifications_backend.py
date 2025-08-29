import os
import smtplib
import requests
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import logging

# Notification config (could be loaded from YAML or env)
NOTIFY_CONFIG_PATH = os.environ.get('NOTIFY_CONFIG_PATH', '/config/notify.yaml')

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
    use_tls: bool = True
) -> bool:
    try:
        msg = MIMEMultipart()
        msg['From'] = username
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))
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


import yaml

def load_notify_config():
    if not os.path.exists(NOTIFY_CONFIG_PATH):
        return {}
    with open(NOTIFY_CONFIG_PATH, 'r') as f:
        return yaml.safe_load(f) or {}

from typing import Optional, Dict

def notify_event(event_type: str, label: Optional[str] = None, status: Optional[str] = None, message: Optional[str] = None, details: Optional[Dict] = None):
    """
    Send notification (webhook and/or SMTP) for important events.
    event_type: e.g. 'port_monitor_failure', 'automation_success', 'automation_failure'
    label: session label or global
    status: e.g. 'FAILED', 'SUCCESS'
    message: summary string
    details: dict of extra info
    """
    cfg = load_notify_config()
    event_rules = cfg.get('event_rules', {})
    rule = event_rules.get(event_type, {"email": False, "webhook": False})
    # Prevent spam: only send if at least one channel is enabled for this event
    if not rule.get("email") and not rule.get("webhook"):
        return
    # Always prepend session name to the message if label is present
    session_prefix = f"Session: {label}, " if label else ""
    full_message = f"{session_prefix}{message}" if message else session_prefix.rstrip(', ')
    payload = {
        "event_type": event_type,
        "label": label,
        "status": status,
        "message": full_message,
        "details": details or {}
    }
    # Webhook
    if rule.get("webhook"):
        webhook_url = cfg.get('webhook_url')
        discord_webhook = cfg.get('discord_webhook', False)
        if webhook_url:
            send_webhook_notification(webhook_url, payload, discord=discord_webhook)
    # SMTP
    if rule.get("email"):
        smtp = cfg.get('smtp', {})
        required = ['host', 'port', 'username', 'password', 'to_email']
        if all(k in smtp for k in required):
            subject = f"[MouseTrap] {event_type} - {status or ''}"
            body = f"Event: {event_type}\nLabel: {label}\nStatus: {status}\nMessage: {full_message}\nDetails: {details}"
            send_smtp_notification(
                smtp['host'], smtp['port'], smtp['username'], smtp['password'],
                smtp['to_email'], subject, body, smtp.get('use_tls', True)
            )
