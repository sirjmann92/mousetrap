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
    if not host:
        raise ValueError("Host is required")

    parsed = urlparse(host)

    if parsed.scheme in {"http", "https"}:
        base = host
    else:
        if port is None or str(port).strip() == "":
            raise ValueError("Port is required when host does not include a scheme")

        port_int = int(port)
        scheme = "https" if port_int == 443 else "http"
        base = f"{scheme}://{host}:{port_int}"

    return f"{base}{path}"
