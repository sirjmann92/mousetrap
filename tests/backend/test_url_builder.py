"""Backend tests for service URL construction."""

from typing import Any

import pytest

from backend.url_builder import build_service_url, coerce_port


@pytest.mark.parametrize(
    ("host", "port", "path", "expected"),
    [
        ("prowlarr.local", 9696, "/api/v1/indexer", "http://prowlarr.local:9696/api/v1/indexer"),
        ("prowlarr.local", 443, "/api/v1/indexer", "https://prowlarr.local:443/api/v1/indexer"),
        ("192.168.1.100", 9117, "", "http://192.168.1.100:9117"),
    ],
)
def test_build_service_url_infers_scheme_from_port(
    host: str,
    port: int,
    path: str,
    expected: str,
) -> None:
    """Build the documented URL, inferring https only for port 443."""
    assert build_service_url(host, port, path) == expected


@pytest.mark.parametrize(
    ("host", "port", "expected"),
    [
        ("https://prowlarr.example.com", 9696, "http://prowlarr.example.com:9696"),
        ("http://prowlarr.example.com", 443, "https://prowlarr.example.com:443"),
        ("https://prowlarr.example.com/", 443, "https://prowlarr.example.com:443"),
    ],
)
def test_build_service_url_reinfers_scheme_typed_into_the_host_field(
    host: str,
    port: int,
    expected: str,
) -> None:
    """Let the port field override a scheme the user typed into the host field."""
    assert build_service_url(host, port) == expected


def test_build_service_url_strips_a_port_embedded_in_the_host_field() -> None:
    """Prefer the port field over a port the user typed into the host field."""
    assert build_service_url("prowlarr.local:9696", 8789) == "http://prowlarr.local:8789"


@pytest.mark.parametrize("host", ["", "   ", "https://"])
def test_build_service_url_rejects_a_host_that_resolves_to_nothing(host: str) -> None:
    """Reject a host field that is empty before or after scheme stripping."""
    with pytest.raises(ValueError, match="Host is required"):
        build_service_url(host, 9696)


@pytest.mark.parametrize(
    ("raw", "expected"),
    [
        ("443", 443),
        ("9117", 9117),
        ("  443  ", 443),
        (443, 443),
        (9117, 9117),
    ],
)
def test_coerce_port_converts_a_numeric_string(raw: object, expected: int) -> None:
    """A port spelled as a number, quoted or not, resolves to that integer."""
    assert coerce_port(raw) == expected


@pytest.mark.parametrize("raw", [None, "", "   ", "abc", "44a3", "-1", "4.5", True])
def test_coerce_port_passes_non_numeric_values_through(raw: object) -> None:
    """Anything that is not a numeric string is returned unchanged.

    Callers guard on the raw value (`port is None`, `all([...])`), so changing
    these would change which requests those guards reject.
    """
    assert coerce_port(raw) is raw


def test_coerce_port_keeps_a_quoted_tls_port_on_https() -> None:
    """A quoted "443" must not silently downgrade the scheme to http.

    Without coercion `"443" == 443` is False, so the URL would be built as
    http and the API key would be sent in the clear.
    """
    assert build_service_url("svc.local", coerce_port("443")) == "https://svc.local:443"

    # Typed Any rather than str: build_service_url declares int, and this pins
    # what reaching it uncoerced would produce, which is the hazard coercion removes.
    uncoerced: Any = "443"
    assert build_service_url("svc.local", uncoerced) == "http://svc.local:443"
