"""Tests for :func:`backend.utils.describe_error`."""

import pytest

from backend.utils import describe_error


@pytest.mark.parametrize(
    ("exc", "expected"),
    [
        (ValueError("bad value"), "bad value"),
        (TimeoutError(), "Request timed out"),
        (ConnectionResetError(), "ConnectionResetError"),
        (RuntimeError("   "), "RuntimeError"),
    ],
)
def test_describe_error_never_returns_empty(exc: BaseException, expected: str) -> None:
    """An exception's own text wins; one with none is described by its type.

    Args:
        exc: Exception to describe.
        expected: Message expected for it.
    """
    assert describe_error(exc) == expected
