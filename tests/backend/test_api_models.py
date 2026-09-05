"""Tests for the typed request bodies used by the JSON API."""

from pydantic import ValidationError
import pytest

from backend.api_models import IndexerTestRequest, IndexerUpdateRequest


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


def test_update_request_requires_a_usable_label() -> None:
    """A blank or whitespace-only label is refused before the session lookup."""
    for label in ("", "   "):
        with pytest.raises(ValidationError):
            IndexerUpdateRequest.model_validate({"label": label})


def test_update_request_treats_mam_id_as_optional() -> None:
    """These endpoints fall back to the session's stored mam_id, so absent is valid."""
    model = IndexerUpdateRequest.model_validate({"label": "seedbox"})

    assert model.label == "seedbox"
    assert model.mam_id == ""


def test_update_request_strips_its_values() -> None:
    """Whitespace around a label or mam_id is not part of the value."""
    model = IndexerUpdateRequest.model_validate({"label": " seedbox ", "mam_id": " cookie "})

    assert (model.label, model.mam_id) == ("seedbox", "cookie")
