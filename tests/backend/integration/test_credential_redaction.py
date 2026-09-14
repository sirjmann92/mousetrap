"""Coverage for credentials reaching a log, the event log, or the UI.

`get_status` surfaces its failure message as a status and, since the points
guardrails learned to report it, as an automation skip reason shown in the UI.
An aiohttp failure can carry the whole proxy URL, so these tests pin that the
message is redacted at the point it is built.
"""

from typing import Any

import pytest

from backend import mam_api
from backend.utils_redact import REDACTED, redact_text

_PASSWORD = "hunter2SECRET"  # noqa: S105 - a fake credential this test asserts never escapes
_USERNAME = "alice"
_MAM_ID = "MAMIDSECRET123"
_PROXY = {
    "label": "vpn",
    "host": "proxy.invalid",
    # Out of range, so aiohttp rejects the URL and puts it in the exception.
    # A number field with no bounds accepts this from the UI.
    "port": 999999,
    "username": _USERNAME,
    "password": _PASSWORD,
}


def test_redact_text_removes_known_secrets_and_url_credentials() -> None:
    """Both the values held by the caller and a generic userinfo URL are stripped."""
    text = f"Cannot connect to http://{_USERNAME}:{_PASSWORD}@proxy.invalid:8080"
    assert redact_text(text, _PASSWORD) == f"Cannot connect to http://{REDACTED}@proxy.invalid:8080"


def test_redact_text_strips_url_credentials_it_was_not_given() -> None:
    """An unanticipated message still cannot carry credentials through."""
    assert _PASSWORD not in redact_text(f"proxy http://{_USERNAME}:{_PASSWORD}@host:1/path failed")


def test_redact_text_leaves_short_values_alone() -> None:
    """A one-character secret must not rewrite unrelated text into nonsense."""
    assert redact_text("Failed to fetch status: timeout", "a") == "Failed to fetch status: timeout"


def test_redact_text_keeps_the_host_readable() -> None:
    """Redaction must not cost the user the diagnostic part of the message."""
    assert "proxy.invalid:8080" in redact_text(
        f"http://{_USERNAME}:{_PASSWORD}@proxy.invalid:8080", _PASSWORD
    )


@pytest.mark.integration
async def test_a_proxy_failure_message_carries_no_credentials() -> None:
    """The real `get_status` failure path is exercised, not a hand-written string.

    A mistyped port makes aiohttp raise with the proxy URL as the exception
    text, which is the shape that leaked the password into the event log.
    """
    result: dict[str, Any] = await mam_api.get_status(mam_id=_MAM_ID, proxy_cfg=_PROXY)

    message = result["message"]
    assert result["points"] is None
    assert _PASSWORD not in message
    assert _USERNAME not in message
    assert _MAM_ID not in message
    assert REDACTED in message
    # The reason for the failure still has to survive the redaction.
    assert "proxy.invalid" in message


@pytest.mark.integration
async def test_the_redacted_message_is_what_the_ui_is_told() -> None:
    """`points_unavailable_reason` reads the redacted message, not a raw one."""
    result = await mam_api.get_status(mam_id=_MAM_ID, proxy_cfg=_PROXY)

    reason = mam_api.points_unavailable_reason(result)
    assert _PASSWORD not in reason
    assert _USERNAME not in reason
