"""Tests for the error boundary that gives every failure one shape."""

from __future__ import annotations

from collections.abc import AsyncIterator
from http import HTTPStatus

from fastapi import FastAPI, HTTPException, Query
from httpx import ASGITransport, AsyncClient
import pytest

from backend.errors import (
    ABOUT_BLANK,
    INVALID_REQUEST_TYPE,
    PROBLEM_MEDIA_TYPE,
    ProblemDetails,
    RejectedValue,
    _pointer,
    _rejected_value,
    _status_title,
    register_error_handlers,
)


@pytest.fixture
def problem_app() -> FastAPI:
    """Expose one route per failure source, behind the real handlers.

    Returns:
        An application whose routes each raise exactly one kind of failure.
    """
    app = FastAPI()
    register_error_handlers(app)

    @app.get("/teapot")
    def teapot() -> None:
        """Raise the framework's own exception, as 35 sites still do."""
        raise HTTPException(status_code=418, detail="I am a teapot.")

    @app.get("/not-modified")
    def not_modified() -> None:
        """Raise a failure whose status code forbids a response body."""
        raise HTTPException(status_code=304, detail="Unchanged since you last asked.")

    @app.get("/unhandled")
    def unhandled() -> None:
        """Fail in a way nothing anticipated."""
        raise RuntimeError("/config/session.yaml is unreadable")

    @app.post("/stack")
    def stack(name: str = Query(...), body: dict[str, int] | None = None) -> dict[str, str]:
        """Accept a value in the query and a value in the body, so both can be rejected.

        Args:
            name: Stack name, read from the query string.
            body: Arbitrary integer fields, read from the request body.

        Returns:
            What it was given, which no test asserts on.
        """
        return {"name": name, "body": str(body)}

    return app


@pytest.fixture
async def problem_client(problem_app: FastAPI) -> AsyncIterator[AsyncClient]:
    """Drive the probe application without swallowing an unhandled exception.

    Args:
        problem_app: The application under test.

    Yields:
        A client that returns the boundary's response rather than re-raising,
        so the 500 body can be asserted on.
    """
    transport = ASGITransport(app=problem_app, raise_app_exceptions=False)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client


async def test_a_status_forbidding_a_body_sends_none(problem_client: AsyncClient) -> None:
    """A problem is not worth breaking the status code's own contract for."""
    response = await problem_client.get("/not-modified")

    assert response.status_code == 304
    assert response.content == b""


async def test_an_http_exception_becomes_a_typeless_problem(problem_client: AsyncClient) -> None:
    """The existing raise sites gain the member set without being touched."""
    response = await problem_client.get("/teapot")

    assert response.status_code == 418
    assert response.headers["content-type"] == PROBLEM_MEDIA_TYPE
    assert response.json() == {
        "type": ABOUT_BLANK,
        "status": 418,
        "title": "I'm a Teapot",
        "detail": "I am a teapot.",
    }


async def test_an_unrouted_path_is_a_problem_too(problem_client: AsyncClient) -> None:
    """Starlette raises `HTTPException` itself, so this handler outlives our raises."""
    response = await problem_client.get("/no-such-route")

    assert response.status_code == 404
    assert response.headers["content-type"] == PROBLEM_MEDIA_TYPE
    assert response.json() == {
        "type": ABOUT_BLANK,
        "status": 404,
        "title": "Not Found",
        "detail": "Not Found",
    }


async def test_an_unhandled_exception_answers_without_describing_itself(
    problem_client: AsyncClient,
) -> None:
    """RFC 9457 §5: the wire carries no implementation detail."""
    response = await problem_client.get("/unhandled")

    assert response.status_code == 500
    assert response.headers["content-type"] == PROBLEM_MEDIA_TYPE
    assert response.json() == {
        "type": ABOUT_BLANK,
        "status": 500,
        "title": "Internal Server Error",
        "detail": "The server could not complete the request.",
    }
    assert "session.yaml" not in response.text


async def test_the_catch_all_still_lets_the_exception_reach_the_server(
    problem_app: FastAPI,
) -> None:
    """Answering is not swallowing.

    Starlette's `ServerErrorMiddleware` re-raises once the handler's response
    has been sent, which is what reaches the server's own logging and what lets
    a test see the original exception. Registering the handler must not cost
    that, and it is why the handler itself logs nothing.
    """
    transport = ASGITransport(app=problem_app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        with pytest.raises(RuntimeError, match="session.yaml is unreadable"):
            await client.get("/unhandled")


async def test_a_rejected_query_parameter_is_named_not_pointed_at(
    problem_client: AsyncClient,
) -> None:
    """A JSON Pointer into a body cannot locate a value that is not in one."""
    response = await problem_client.post("/stack")

    assert response.status_code == 422
    assert response.headers["content-type"] == PROBLEM_MEDIA_TYPE
    body = response.json()
    assert body["type"] == INVALID_REQUEST_TYPE
    assert body["title"] == "The request was not accepted"
    assert body["errors"] == [{"detail": "Field required", "name": "name", "in": "query"}]


async def test_a_rejected_body_value_is_pointed_at(problem_client: AsyncClient) -> None:
    """A value inside the body gets the RFC 6901 pointer that locates it."""
    response = await problem_client.post("/stack?name=media", json={"port": "not-a-number"})

    assert response.json()["errors"] == [
        {
            "detail": "Input should be a valid integer, unable to parse string as an integer",
            "pointer": "#/port",
        }
    ]


async def test_an_unparsable_body_is_located_by_nothing(problem_client: AsyncClient) -> None:
    """Pydantic reports a character offset here, which no pointer can honestly use."""
    response = await problem_client.post(
        "/stack?name=media",
        content="{not json",
        headers={"content-type": "application/json"},
    )

    assert response.json()["errors"] == [{"detail": "JSON decode error"}]


async def test_one_response_lists_every_rejected_value(problem_client: AsyncClient) -> None:
    """The client learns everything wrong with the request from one answer."""
    response = await problem_client.post("/stack", json={"port": "not-a-number"})

    assert [error["detail"] for error in response.json()["errors"]] == [
        "Field required",
        "Input should be a valid integer, unable to parse string as an integer",
    ]


def test_a_value_the_boundary_cannot_place_carries_no_locator() -> None:
    """Neither locator is better than one that points at nothing."""
    assert _rejected_value({"msg": "Field required"}) == RejectedValue(detail="Field required")


def test_a_problem_cannot_be_constructed_without_a_detail() -> None:
    """`detail` is the member a client displays, so an empty one is not a problem."""
    with pytest.raises(ValueError, match="detail"):
        ProblemDetails(status=500, title="Internal Server Error", detail="")


def test_a_problem_rejects_a_member_no_model_declared() -> None:
    """Every member on the wire is one a model named, which keeps the rest off it.

    Validated rather than constructed: mypy already rejects the keyword form,
    so this covers the path that takes keys it did not choose.
    """
    with pytest.raises(ValueError, match="stack_trace"):
        ProblemDetails.model_validate(
            {
                "status": 500,
                "title": "Internal Server Error",
                "detail": "Something went wrong.",
                "stack_trace": "...",
            }
        )


@pytest.mark.parametrize(
    ("segments", "expected"),
    [
        ((), "#"),
        (("port",), "#/port"),
        (("stacks", 0, "port"), "#/stacks/0/port"),
        (("a/b",), "#/a~1b"),
        (("a~b",), "#/a~0b"),
        (("~/",), "#/~0~1"),
    ],
)
def test_a_pointer_escapes_the_two_characters_that_need_it(
    segments: tuple[object, ...], expected: str
) -> None:
    """RFC 6901 escaping is order-dependent: `~` before `/`, or a slash round-trips wrong."""
    assert _pointer(segments) == expected


def test_an_unregistered_status_still_gets_a_title() -> None:
    """`title` is required, so it cannot depend on the status being one Python knows."""
    assert _status_title(HTTPStatus.NOT_FOUND.value) == "Not Found"
    assert _status_title(599) == "Error"
