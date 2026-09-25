"""Typed request bodies for the JSON API.

Endpoints here historically read `await request.json()` and pulled fields out
with `data.get(...)`, which left the shape unvalidated at the boundary. Two
defects came from that: a non-numeric `weeks` reaching a live MAM purchase, and
a port arriving as a string so that `"443"` selected `http` instead of `https`.

Models are validated explicitly rather than bound as FastAPI parameters, so a
bad body still answers 200 with `{"success": false, ...}` as these endpoints
always have. Binding them as parameters would return 422 instead, and the
frontend reads several of these responses without checking the status code.
"""

from typing import Annotated

from pydantic import BaseModel, BeforeValidator, Field
from pydantic_core import PydanticCustomError


def _strip(value: object) -> object:
    """Strip surrounding whitespace, leaving non-strings for the field to reject."""
    return value.strip() if isinstance(value, str) else value


StrippedStr = Annotated[str, BeforeValidator(_strip)]


class IndexerTestRequest(BaseModel):
    """Connection-test body shared by every indexer test endpoint.

    `port` is declared `int`, so Pydantic converts a numeric string and rejects
    anything else. That is what `coerce_port` was doing defensively at each of
    these call sites, done once and rejecting garbage rather than passing it on.
    """

    host: Annotated[StrippedStr, Field(min_length=1)]
    port: int
    api_key: Annotated[StrippedStr, Field(min_length=1)]
    admin_password: StrippedStr = ""


class IndexerUpdateRequest(BaseModel):
    """Body for the indexer update endpoints, which act on a saved session.

    `mam_id` is optional: these endpoints fall back to the session's stored
    value when the caller does not supply one, so an absent or blank value is
    not an error here.
    """

    label: Annotated[StrippedStr, Field(min_length=1)]
    mam_id: StrippedStr = ""


def _reject_bool(value: object) -> object:
    """Refuse a boolean before Pydantic reads it as the integer 1 or 0.

    Raised as `PydanticCustomError` because Pydantic converts only that,
    `ValueError` and `AssertionError` into a validation error. A `TypeError`
    would escape the model and answer 500 instead of 400.

    Raises:
        PydanticCustomError: If the value is a boolean.
    """
    if isinstance(value, bool):
        raise PydanticCustomError("bool_port", "a boolean is not a port")
    return value


TcpPort = Annotated[int, BeforeValidator(_reject_bool), Field(ge=1, le=65535)]


class ProxyRequest(BaseModel):
    """Body for creating or replacing a proxy.

    `host` and `port` are required because a proxy without them is no proxy at
    all: `build_proxy_dict` returns None for a missing host, so a session
    selecting it would connect directly. The form already required both; the API
    did not. `port` accepts the numeric string the form sends and must be a TCP
    port, so a typo cannot save a proxy that can never connect. Credentials are
    stored exactly as typed.
    """

    label: Annotated[StrippedStr, Field(min_length=1)]
    host: Annotated[StrippedStr, Field(min_length=1)]
    port: TcpPort
    username: str = ""
    password: str = ""
