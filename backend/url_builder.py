"""Utilities for building service URLs from UI host and port fields."""

from urllib.parse import urlparse


def build_service_url(host: str, port: int | str | None, path: str = "") -> str:
    """Build a service URL from host, port, and path.

    Supports both legacy configuration values, such as:
        host=service.example.com, port=8080

    and scheme-aware values, such as:
        host=https://service.example.com, port=443

    If host already includes http:// or https://, the scheme is honored.
    Otherwise, https is inferred for port 443 and http for all other ports.
    """
    host = (host or "").strip().rstrip("/")
    parsed = urlparse(host)

    if parsed.scheme in {"http", "https"}:
        base = host
        if port and parsed.port is None and int(port) not in {80, 443}:
            base = f"{base}:{int(port)}"
    else:
        port_int = int(port or 80)
        scheme = "https" if port_int == 443 else "http"
        base = f"{scheme}://{host}:{port_int}"

    return f"{base}{path}"
