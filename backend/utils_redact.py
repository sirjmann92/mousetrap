"""Utility to recursively redact sensitive fields from dicts for logging/event logs."""

from typing import Any

REDACT_KEYS = {
    "webhook_url",
    "discord_webhook",
    "password",
    "mam_id",
    "browser_cookie",
    "token",
    "api_key",
    "smtp_password",
}
REDACTED = "********"


def redact_sensitive(data: Any) -> Any:
    """Recursively redact sensitive values in mappings and sequences.

    Parameters
    ----------
    data : Any
        The input data which may be a dict, list, or any primitive value.

    Returns
    -------
    Any
        A new data structure with values for sensitive keys replaced by a redaction string.
    """
    if isinstance(data, dict):
        return {k: (REDACTED if k in REDACT_KEYS else redact_sensitive(v)) for k, v in data.items()}
    if isinstance(data, list):
        return [redact_sensitive(item) for item in data]
    return data
