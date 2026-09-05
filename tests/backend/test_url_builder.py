"""Backend tests for service URL construction."""

import pytest

from backend.url_builder import build_service_url


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
