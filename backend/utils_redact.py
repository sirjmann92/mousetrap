"""Utilities to redact sensitive values from structures and free text before they
reach a log, the event log, or the UI.
"""

import re
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

    Returns:
    -------
    Any
        A new data structure with values for sensitive keys replaced by a redaction string.
    """
    if isinstance(data, dict):
        return {k: (REDACTED if k in REDACT_KEYS else redact_sensitive(v)) for k, v in data.items()}
    if isinstance(data, list):
        return [redact_sensitive(item) for item in data]
    return data


# Userinfo in a URL, i.e. the "user:pass@" between the scheme and the host.
# Error strings from HTTP clients frequently embed a whole proxy URL.
_URL_CREDENTIALS = re.compile(r"(?<=://)[^\s/@]+(?=@)")

# Below this length a secret is too short to replace safely: a one- or
# two-character password would rewrite unrelated text into nonsense. The URL
# pattern above still covers such a secret wherever it appears in a proxy URL.
_MIN_REPLACEABLE_SECRET = 4


def redact_text(text: str, *secrets: str | None) -> str:
    """Remove credentials from a free-text string bound for a log, event, or the UI.

    Exception strings raised by HTTP clients can embed a full proxy URL
    including its username and password, and those strings are surfaced to the
    user as status and skip messages. Both the secret values held by the caller
    and the generic ``user:pass@`` URL form are removed, so a message shape
    that was never anticipated still cannot carry credentials through.

    Args:
        text: The string to redact.
        *secrets: Known secret values to remove, such as a proxy password or a
            MAM session cookie. ``None`` and empty values are ignored, as are
            values shorter than four characters.

    Returns:
        The string with every recognized credential replaced by the redaction
        marker.

    """
    for secret in secrets:
        if secret and len(secret) >= _MIN_REPLACEABLE_SECRET:
            text = text.replace(secret, REDACTED)
    return _URL_CREDENTIALS.sub(REDACTED, text)
