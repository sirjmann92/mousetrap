"""Utilities for building service URLs from UI host and port fields."""

from typing import Any
from urllib.parse import urlparse


def build_service_url(host: str, port: int, path: str = "") -> str:
    """Build a service URL from host, port, and path.

    Tolerates common user input mistakes:
    - Strips leading http:// or https:// scheme from the hostname field
      (scheme is inferred from the port instead)
    - Strips an embedded port from the hostname (e.g. "host:9696" → "host")

    Supports both legacy configuration values, such as:
        host=service.example.com, port=8080

    and scheme-aware values, such as:
        host=https://service.example.com, port=443

    If host already includes http:// or https://, the scheme is stripped and
    re-inferred from the port (443 → https, all others → http), so that the
    dedicated port field always takes precedence.  To explicitly use https on
    a non-443 port, set port=443 or prefix the host with https://.
    """
    host = (host or "").strip().rstrip("/")
    if not host:
        raise ValueError("Host is required")

    parsed = urlparse(host)

    # Strip any scheme the user may have typed into the host field; we always
    # re-infer it from the port so the two fields stay consistent.
    if parsed.scheme in {"http", "https"}:
        # urlparse puts the real hostname in parsed.netloc (may include port)
        host = parsed.netloc or parsed.path
        host = host.rstrip("/")

    # Strip an embedded port from the hostname (e.g. "myhost:9696")
    if ":" in host:
        host = host.rsplit(":", 1)[0]

    if not host:
        raise ValueError("Host is required")

    scheme = "https" if port == 443 else "http"
    base = f"{scheme}://{host}:{port}"

    return f"{base}{path}"


def coerce_port(value: Any) -> Any:
    """Return a numeric-string port as an ``int``, passing anything else through.

    Ports reach :func:`build_service_url` from session YAML and from JSON request
    bodies, neither of which guarantees the ``int`` the integration helpers
    declare. A quoted ``"443"`` is the case that matters: it compares unequal to
    ``443``, so the scheme would fall back to ``http`` for a service that is
    actually on TLS and the API key would go out in the clear.

    Values that are not numeric strings are returned unchanged, so every
    caller's existing missing-field guard keeps behaving exactly as before.

    Args:
        value: A port as read from configuration or a request body.

    Returns:
        The value as an ``int`` when it is a numeric string, else unchanged.

    """
    if isinstance(value, str):
        stripped = value.strip()
        if stripped.isdigit():
            return int(stripped)
    return value
