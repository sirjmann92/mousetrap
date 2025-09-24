"""Utility helpers for the backend."""

import logging
import os
import re
from typing import Any


def setup_logging() -> None:
    """Set up global logging configuration for the backend.

    Call this once at app startup (e.g., in app.py).
    """
    loglevel = os.environ.get("LOGLEVEL", "INFO").upper()
    logging.basicConfig(
        level=getattr(logging, loglevel, logging.INFO),
        format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    # Suppress overly verbose logs from dependencies unless DEBUG
    if getattr(logging, loglevel, logging.INFO) > logging.DEBUG:
        logging.getLogger("urllib3").setLevel(logging.INFO)
        logging.getLogger("httpx").setLevel(logging.INFO)
        logging.getLogger("requests").setLevel(logging.INFO)
    logging.getLogger("apscheduler").setLevel(logging.WARNING)


def extract_asn_number(asn_str: str) -> str | None:
    """Extract the numeric ASN from a string.

    Accepts values like "AS12345", "as12345", or plain "12345" and returns the
    numeric portion as a string. Returns None for empty, non-string, or
    non-matching inputs.

    Parameters
    ----------
    asn_str : str
        The ASN string to parse.

    Returns
    -------
    str or None
        The extracted numeric ASN as a string if found, otherwise None.

    """
    if not asn_str or not isinstance(asn_str, str):
        return None
    match = re.search(r"AS?(\d+)", asn_str, re.IGNORECASE)
    if match:
        return match.group(1)
    # fallback: if it's just a number string
    if asn_str.strip().isdigit():
        return asn_str.strip()
    return None


def build_status_message(status: dict, ip_monitoring_mode: str = "auto") -> str:
    """Generate a user-friendly status message for the session based on the status dict."""
    # If error present, always show error
    if status.get("error"):
        return f"Error: {status['error']}"
    # If a static message is present (from mam_api or other), use it
    if status.get("message"):
        return status["message"]

    # Mode-specific status messages
    if ip_monitoring_mode == "static":
        return "Static IP mode - No monitoring active. Automation running normally."
    if ip_monitoring_mode == "manual":
        return "Manual IP mode - IP updates controlled by user. Automation running normally."

    # Auto mode - original logic
    # Fallbacks for legacy or unexpected cases
    if status.get("auto_update_seedbox"):
        result = status["auto_update_seedbox"]
        if isinstance(result, dict):
            if result.get("success"):
                return "IP Changed. Seedbox IP updated."
            return result.get("error", "Seedbox update failed.")
    return "No change detected. Update not needed."


# --- Proxy utility ---
def build_proxy_dict(proxy_cfg: dict[str, Any]) -> dict[str, Any] | None:
    """Given a proxy config dict, return a requests-compatible proxies dict or None.

    Handles host/port/username/password or direct URL fields.
    """
    if not proxy_cfg or not proxy_cfg.get("host"):
        return None
    host = proxy_cfg["host"]
    port = proxy_cfg.get("port", 0)
    username = proxy_cfg.get("username", "")
    password = proxy_cfg.get("password", "")
    if username and password:
        proxy_url = (
            f"http://{username}:{password}@{host}:{port}"
            if port
            else f"http://{username}:{password}@{host}"
        )
    else:
        proxy_url = f"http://{host}:{port}" if port else f"http://{host}"
    return {"http": proxy_url, "https": proxy_url}
