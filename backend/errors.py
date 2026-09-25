"""The API's error boundary.

Every failure this API reports leaves as RFC 9457 problem details with the
`application/problem+json` media type, whatever raised it. Three handlers feed
that one shape: `HTTPException` for the routes that raise FastAPI's own,
`RequestValidationError` for a request value no route could accept, and a
catch-all so an unhandled exception does not escape as plain text. Before these
handlers existed, `detail` was a string from the first and a list of objects
from the second, so no client could read both with one branch.

Nothing here logs. The catch-all in particular must not: Starlette's
`ServerErrorMiddleware` re-raises after the handler answers, and that re-raise
is what reaches the server's own logging, so logging here as well would record
one failure twice.

A problem type of this application's own -- one with a URI of its own, or
extension members a status code cannot carry -- needs an exception that names
them. None exists yet, so that machinery arrives with the first failure that
raises one rather than waiting here for it.
"""

from __future__ import annotations

from http import HTTPStatus
from typing import TYPE_CHECKING

from fastapi.exceptions import RequestValidationError
from fastapi.utils import is_body_allowed_for_status_code
from pydantic import BaseModel, ConfigDict, Field
from starlette.exceptions import HTTPException
from starlette.responses import JSONResponse, Response

if TYPE_CHECKING:
    from collections.abc import Mapping, Sequence

    from fastapi import FastAPI
    from starlette.requests import Request

PROBLEM_MEDIA_TYPE = "application/problem+json"

ABOUT_BLANK = "about:blank"

_PARAMETER_LOCATIONS = frozenset({"query", "path", "header", "cookie"})

# Pydantic reports an undecodable body with a character offset where a field
# path would otherwise be, so no pointer into the body can be built for it.
_UNPARSED_BODY = "json_invalid"

_GENERIC_FAILURE_DETAIL = "The server could not complete the request."

INVALID_REQUEST_TYPE = (
    "https://github.com/sirjmann92/mousetrap/blob/main/docs/problems/invalid-request.md"
)


class RejectedValue(BaseModel):
    """One value a request carried that the endpoint could not accept.

    Locating the value is not one member, because a request is not one document.
    A value in the body is located by a JSON Pointer into that body, written in
    the fragment form RFC 9457 §3's validation example uses. A value outside the
    body is in no document, so no pointer can name it truthfully; it is named the
    way the published OpenAPI schema names it, by parameter name and the part of
    the request it was read from. A value this boundary cannot place carries
    neither, rather than a locator pointing at nothing.

    Attributes:
        detail: What was wrong with the value.
        pointer: JSON Pointer to the value within the request body, in fragment
            form, for a value read from the body.
        name: Parameter name, for a value read from anywhere else.
        location: Part of the request that parameter was read from, serialized
            as `in` to match OpenAPI's parameter object.
    """

    model_config = ConfigDict(extra="forbid")

    detail: str
    pointer: str | None = None
    name: str | None = None
    location: str | None = Field(default=None, serialization_alias="in")


class ProblemDetails(BaseModel):
    """An RFC 9457 problem details body.

    `type` is always sent. A failure adding nothing to its status code sends
    `about:blank`, which §4.2.1 defines as exactly that, rather than omitting the
    member and leaving every consumer to supply the default — a default that is
    silently missed rather than loudly missed when a consumer forgets it.
    `status` repeats the status line because §3.1.2 asks for it wherever a
    message is persisted without its HTTP context, which is what this
    application's event log does; it is rendered from the same attribute that
    sets the status line, so the two cannot disagree. `instance` is never sent:
    an identifier correlating to nothing is worse than none.

    `detail` is required and non-empty, so a problem that cannot say what
    happened cannot be constructed, and a client never has to fall back to
    `title` for a valid problem body.

    A problem type carrying extension members declares them as typed fields on a
    subclass. Undeclared members are rejected rather than allowed: every member
    reaching the wire is one a model names, which is what keeps internal values
    off it.
    """

    model_config = ConfigDict(extra="forbid")

    type: str = ABOUT_BLANK
    status: int
    title: str
    detail: str = Field(min_length=1)


class InvalidRequestProblem(ProblemDetails):
    """The problem answering a request this API could not accept.

    `errors` is the extension member RFC 9457 §3 defines for validation
    failures, and carrying it is why this problem names a type of its own:
    `about:blank` promises no semantics beyond the status code, which an
    extension member contradicts. A client therefore reads `errors` off the
    problem type rather than off the 422, since §3.2 scopes an extension member
    to the type that defines it.
    """

    type: str = INVALID_REQUEST_TYPE
    title: str = "The request was not accepted"
    errors: list[RejectedValue]


def problem_response(problem: ProblemDetails, headers: Mapping[str, str] | None = None) -> Response:
    """Render problem details as the response the client receives.

    Args:
        problem: The problem details to send.
        headers: Response headers to preserve, if the failure carried any.

    Returns:
        A response carrying the problem as `application/problem+json`, or a
        bodyless response for a status code that allows no content.
    """
    if not is_body_allowed_for_status_code(problem.status):
        return Response(status_code=problem.status, headers=headers)
    return JSONResponse(
        problem.model_dump(mode="json", exclude_none=True, by_alias=True),
        status_code=problem.status,
        headers=headers,
        media_type=PROBLEM_MEDIA_TYPE,
    )


def register_error_handlers(app: FastAPI) -> None:
    """Route every failure through this boundary.

    Handlers are registered through the decorator in call form so that each one
    keeps its own exception type in its signature. `add_exception_handler` takes
    a handler declared over plain `Exception`, which would cost either a
    suppression or an `isinstance` guard that cannot fail.

    Args:
        app: The application to register the handlers on.
    """
    app.exception_handler(HTTPException)(_http_exception_handler)
    app.exception_handler(RequestValidationError)(_request_validation_error_handler)
    app.exception_handler(Exception)(_unhandled_exception_handler)


async def _http_exception_handler(request: Request, exc: HTTPException) -> Response:
    """Answer a route that raised FastAPI's own exception.

    These sites name no problem type, so the type is `about:blank`: no semantics
    beyond the status code. Starlette also raises this itself for an unrouted
    path and a disallowed method, so this handler outlives the last
    `raise HTTPException` in `backend/`.

    Args:
        request: The request that failed.
        exc: The exception the route raised.

    Returns:
        The problem details response for this failure, keeping any headers the
        exception carried.
    """
    title = _status_title(exc.status_code)
    return problem_response(
        ProblemDetails(
            status=exc.status_code,
            title=title,
            detail=str(exc.detail) if exc.detail else title,
        ),
        headers=exc.headers,
    )


async def _request_validation_error_handler(
    request: Request, exc: RequestValidationError
) -> Response:
    """Answer a request this API could not accept.

    Args:
        request: The request that failed.
        exc: The validation failure, carrying one entry per rejected value.

    Returns:
        The problem details response, listing each rejected value under
        `errors`.
    """
    return problem_response(
        InvalidRequestProblem(
            status=HTTPStatus.UNPROCESSABLE_ENTITY.value,
            detail="The request could not be accepted as sent.",
            errors=[_rejected_value(error) for error in exc.errors()],
        )
    )


async def _unhandled_exception_handler(request: Request, exc: Exception) -> Response:
    """Answer a failure nothing else claimed, without describing it.

    RFC 9457 §5 warns against putting implementation detail on the wire, so the
    detail is fixed and says only that the request did not complete. Nothing is
    logged here: Starlette hands this handler to `ServerErrorMiddleware`, which
    re-raises after the response is sent, and that re-raise is what the server
    logs and what lets a test client see the original exception.

    Args:
        request: The request that failed.
        exc: The exception nothing else handled.

    Returns:
        A generic problem details response.
    """
    status = HTTPStatus.INTERNAL_SERVER_ERROR
    return problem_response(
        ProblemDetails(
            status=status.value,
            title=status.phrase,
            detail=_GENERIC_FAILURE_DETAIL,
        )
    )


def _status_title(status: int) -> str:
    """Return the reason phrase a status code is known by.

    Args:
        status: HTTP status code.

    Returns:
        The registered reason phrase, or a generic title for an unregistered
        code.
    """
    try:
        return HTTPStatus(status).phrase
    except ValueError:
        return "Error"


def _rejected_value(error: Mapping[str, object]) -> RejectedValue:
    """Describe one rejected value, locating it only where that can be truthful.

    Args:
        error: One entry from `RequestValidationError.errors()`.

    Returns:
        The rejected value with at most one locator: a JSON Pointer for a value
        in the body, a parameter name and location for a value outside it, and
        neither when the value cannot be placed.
    """
    detail = str(error.get("msg", "")) or "The value was rejected."
    location = error.get("loc")
    if not isinstance(location, tuple) or not location:
        return RejectedValue(detail=detail)

    part, *rest = location
    if part in _PARAMETER_LOCATIONS:
        # A parameter is named by one segment; anything deeper is a structured
        # parameter, whose dotted path is how OpenAPI spells the same nesting.
        return RejectedValue(
            detail=detail,
            name=".".join(str(segment) for segment in rest) or None,
            location=str(part),
        )
    if part == "body" and error.get("type") != _UNPARSED_BODY:
        return RejectedValue(detail=detail, pointer=_pointer(rest))
    return RejectedValue(detail=detail)


def _pointer(segments: Sequence[object]) -> str:
    """Return the JSON Pointer naming a value inside the request body.

    Args:
        segments: Path to the value, relative to the body. Integer segments are
            array indices; the body-relative root is an empty path.

    Returns:
        An RFC 6901 pointer in fragment form, rooted at the body.
    """
    escaped = (str(segment).replace("~", "~0").replace("/", "~1") for segment in segments)
    return "#" + "".join(f"/{segment}" for segment in escaped)
