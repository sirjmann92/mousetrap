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
from typing import Any

import aiohttp
import yaml

_logger: logging.Logger = logging.getLogger(__name__)
# Notification config (could be loaded from YAML or env)
NOTIFY_CONFIG_PATH = os.environ.get("NOTIFY_CONFIG_PATH", "/config/notify.yaml")


async def send_webhook_notification(url: str, payload: dict, discord: bool = False) -> bool:
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
    timeout = aiohttp.ClientTimeout(total=10)
    try:
        async with aiohttp.ClientSession(timeout=timeout) as session:
            if discord:
                # Discord expects {"content": ...}
                data = {"content": payload.get("message") or str(payload)}
                async with session.post(url, json=data) as resp:
                    if resp.status >= 400:
                        text = await resp.text()
                        raise Exception(f"HTTP {resp.status}: {text[:200]}")
            else:
                async with session.post(url, json=payload) as resp:
                    if resp.status >= 400:
                        text = await resp.text()
                        raise Exception(f"HTTP {resp.status}: {text[:200]}")
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


async def send_apprise_notification(
    apprise_url: str,
    notify_url_string: str,
    payload: dict,
    include_prefix: bool = False,
    *,
    mode: str = "stateless",
    key: str = "",
    tags: str = "",
) -> bool:
    """Send a notification using Apprise.

    Supports both stateless (URLs in request) and stateful (key/tags) modes.

    Args:
        apprise_url: Base URL of the Apprise server (e.g., http://localhost:8000)
        notify_url_string: For stateless mode - comma-separated notification URLs
        payload: Notification payload with event_type, status, message, etc.
        include_prefix: Whether to prefix title with "MouseTrap: "
        mode: "stateless" (default) or "stateful"
        key: For stateful mode - the configuration key on the Apprise server
        tags: For stateful mode - comma-separated tags to filter notifications

    Returns:
        True on success, False on failure.
    """
    # Validate required fields based on mode
    if mode == "stateful":
        if not key or not apprise_url:
            _logger.error("[Notify] Apprise stateful config missing apprise_url or key")
            return False
    elif not notify_url_string or not apprise_url:
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

        # Build URL and request data based on mode
        if mode == "stateful":
            # Stateful: POST /notify/{key} with optional tags
            post_url = f"{apprise_base}/notify/{key}"
            request_data: dict[str, str] = {
                "body": message,
                "title": title,
                "type": notif_type,
            }
            if tags:
                request_data["tag"] = tags
        else:
            # Stateless: POST /notify with URLs
            if apprise_base.lower().endswith("/notify"):
                post_url = apprise_base
            else:
                post_url = f"{apprise_base}/notify"
            request_data = {
                "urls": notify_url_string,
                "body": message,
                "title": title,
                "type": notif_type,
            }

        timeout = aiohttp.ClientTimeout(total=5)
        async with (
            aiohttp.ClientSession(timeout=timeout) as session,
            session.post(post_url, data=request_data) as resp,
        ):
            if resp.status < 200 or resp.status >= 300:
                text = await resp.text()
                _logger.error(
                    "[Notify] Apprise failed. Response: %s - %s",
                    resp.status,
                    text,
                )
                return False

            # Try to parse JSON; if JSON is present and explicitly indicates failure,
            # treat that as a failure. If JSON can't be parsed, fall back to treating
            # the 200 as success.
            try:
                resp_json = await resp.json()
            except Exception:
                resp_json = None

            if isinstance(resp_json, dict) and resp_json.get("success") is False:
                _logger.error("[Notify] Apprise failed. success=false: %s", resp_json)
                return False

    except Exception as e:
        # Catch all errors including asyncio.TimeoutError (not a subclass of
        # aiohttp.ClientError) so a slow/unreachable Apprise server never
        # propagates an unhandled exception up to the ASGI layer.
        _logger.error("[Notify] Apprise failed. %s: %s", type(e).__name__, e)
        return False
    else:
        _logger.info("[Notify] Apprise sent successfully (mode=%s)", mode)
        return True


def load_notify_config() -> dict[str, Any]:
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
    with Path(NOTIFY_CONFIG_PATH).open(encoding="utf-8") as f:
        return yaml.safe_load(f) or {}


async def notify_event(
    event_type: str,
    label: str | None = None,
    status: str | None = None,
    message: str | None = None,
    details: dict[str, Any] | None = None,
) -> None:
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
    # Check if this notification event is explicitly disabled via the 'enabled' flag
    # If enabled is False, don't send any notifications regardless of channel settings
    if rule.get("enabled") is False:
        return
    # Prevent spam: only send if at least one channel is enabled for this event
    if not rule.get("email") and not rule.get("webhook") and not rule.get("apprise"):
        return
    # Always prepend MouseTrap and session name to the message
    mousetrap_prefix = "MouseTrap: "
    session_part = f"Session: {label}, " if label else ""
    full_message = (
        f"{mousetrap_prefix}{session_part}{message}"
        if message
        else f"{mousetrap_prefix}{session_part}".rstrip(", ")
    )
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
            await send_webhook_notification(webhook_url, payload, discord=discord_webhook)
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
        mode = apprise_cfg.get("mode", "stateless")
        notify_url_string = apprise_cfg.get("notify_url_string", "")
        key = apprise_cfg.get("key", "")
        tags = apprise_cfg.get("tags", "")
        include_prefix = apprise_cfg.get("include_prefix", False)

        # Check if config is valid based on mode
        config_valid = False
        if (
            mode == "stateful"
            and apprise_url
            and key
            or mode == "stateless"
            and apprise_url
            and notify_url_string
        ):
            config_valid = True

        if config_valid:
            await send_apprise_notification(
                apprise_url=apprise_url,
                notify_url_string=notify_url_string,
                payload=payload,
                include_prefix=include_prefix,
                mode=mode,
                key=key,
                tags=tags,
            )


async def safe_notify_event(*args: Any, **kwargs: Any) -> None:
    """Call :func:`notify_event` and swallow any exception.

    Notification failures must never crash the caller — especially inside
    error-recovery paths where raising a secondary exception would mask the
    original problem and produce an unhandled ASGI 500 response.
    """
    try:
        await notify_event(*args, **kwargs)
    except Exception as e:  # noqa: BLE001
        _logger.warning(
            "[Notify] safe_notify_event suppressed an unexpected error: %s: %s",
            type(e).__name__,
            e,
        )
