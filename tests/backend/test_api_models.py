"""Tests for the typed request bodies used by the JSON API."""

from pydantic import ValidationError
import pytest

from backend.api_models import IndexerTestRequest


@pytest.mark.parametrize(
    ("raw_port", "expected"),
    [(9117, 9117), ("9117", 9117), ("443", 443), (443, 443)],
)
def test_port_accepts_a_number_however_it_is_spelled(raw_port: object, expected: int) -> None:
    """A quoted port resolves to the same integer as an unquoted one.

    This is the defect behind the `coerce_port` helper: `"443"` compares
    unequal to `443`, so the URL builder chose http for a TLS service.
    """
    model = IndexerTestRequest(host="h", port=raw_port, api_key="k")  # type: ignore[arg-type]

    assert model.port == expected
    assert isinstance(model.port, int)


@pytest.mark.parametrize("raw_port", ["abc", "", None, "44a3", [], {}])
def test_port_rejects_anything_that_is_not_a_number(raw_port: object) -> None:
    """A port that is not a number is refused at the boundary.

    `coerce_port` passed these through unchanged, so `"abc"` reached the URL
    builder and produced `http://host:abc`.
    """
    with pytest.raises(ValidationError):
        IndexerTestRequest(host="h", port=raw_port, api_key="k")  # type: ignore[arg-type]


@pytest.mark.parametrize(("field", "value"), [("host", ""), ("host", "   "), ("api_key", "")])
def test_required_strings_reject_blank_values(field: str, value: str) -> None:
    """Host and API key must survive stripping, matching the old `not host` guard."""
    body: dict[str, object] = {"host": "h", "port": 9117, "api_key": "k", field: value}

    with pytest.raises(ValidationError):
        IndexerTestRequest.model_validate(body)


def test_surrounding_whitespace_is_stripped() -> None:
    """Values are stripped, as the previous `.strip()` calls did."""
    # S106: a placeholder for the strip assertion, not a credential.
    model = IndexerTestRequest(
        host="  h  ",
        port=9117,
        api_key="  k  ",
        admin_password="  p  ",  # noqa: S106
    )

    assert (model.host, model.api_key, model.admin_password) == ("h", "k", "p")


def test_admin_password_is_optional_and_defaults_to_empty() -> None:
    """Jackett auth is optional; omitting the password is valid and yields ''."""
    model = IndexerTestRequest(host="h", port=9117, api_key="k")

    assert model.admin_password == ""
