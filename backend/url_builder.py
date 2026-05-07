"""Utilities for building service URLs from UI host and port fields."""

from urllib.parse import urlparse


def build_service_url(host: str, port: int | str | None, path: str = "") -> str:
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

    if port is None or str(port).strip() == "":
        raise ValueError("Port is required")

    port_int = int(port)
    scheme = "https" if port_int == 443 else "http"
    base = f"{scheme}://{host}:{port_int}"

    return f"{base}{path}"
