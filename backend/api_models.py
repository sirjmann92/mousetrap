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
