"""Gate the published API contract against the error contract's end state.

Every route is meant to publish a schema a client can program against: a typed
success body, no `success` flag standing in for the status line, and the failure
statuses it can actually answer with. Almost none does yet, and converting them
is an arc of pull requests rather than one change.

This module makes the remaining work a number instead of a belief. Each check
below computes the routes that violate it and asserts that set is **exactly**
the set named in a list here, so a route that regresses fails, and a route that
is converted without its entry being removed also fails. The lists therefore
cannot drift from the code in either direction, and emptying them is what proves
the arc finished: the closure change deletes them along with the machinery that
reads them.

Two kinds of list appear, and the difference is permanent:

- **Conversion-pending** lists shrink to nothing. Each entry is a route that has
  not been converted yet.
- **Not derivable from the schema** lists stay. Whether a route can fail at all,
  and whether it accepts a request body, are facts about what the code does that
  no schema states. They are the only human judgements this gate trusts, and
  each entry carries the reason it is there.

Testing the published schema rather than the source text is deliberate: it is
the artifact clients consume, and it cannot be satisfied by a handler that looks
right while declaring something else. The routes serving files rather than JSON
set `include_in_schema=False`, so they are outside the published contract and
outside this gate with it.
"""

from __future__ import annotations

from typing import Any

import pytest

from backend.app import app

_MUTATION_METHODS = frozenset({"POST", "PUT", "PATCH"})

_AUTOMATIC_VALIDATION_STATUS = "422"


def _operations() -> dict[str, dict[str, Any]]:
    """Return every published operation, keyed by method and path.

    Routes are read from the schema rather than from `app.routes`: fastapi
    0.139 records an included router as a single `_IncludedRouter` entry and
    resolves its routes on demand instead of flattening them, so `app.routes`
    exposes 28 of this application's 50 operations and every router-mounted
    route is invisible to a walk over it.

    Returns:
        A mapping of `"<METHOD> <path>"` to that operation's OpenAPI object.
    """
    schema = app.openapi()
    return {
        f"{method.upper()} {path}": operation
        for path, operations in schema["paths"].items()
        for method, operation in operations.items()
    }


def _resolve(schema: Any, seen: tuple[str, ...] = ()) -> dict[str, Any]:
    """Follow a schema reference to the schema it names.

    Args:
        schema: A schema object, which may be a `$ref`.
        seen: Component names already followed, so a recursive model
            terminates.

    Returns:
        The referenced schema, or an empty mapping for anything unresolvable.
    """
    if not isinstance(schema, dict):
        return {}
    reference = schema.get("$ref")
    if reference is None:
        return schema
    name = reference.rsplit("/", 1)[-1]
    if name in seen:
        return {}
    components = app.openapi().get("components", {}).get("schemas", {})
    return _resolve(components.get(name, {}), (*seen, name))


def _property_names(schema: Any, seen: tuple[str, ...] = ()) -> set[str]:
    """Return every property name reachable within a schema.

    Args:
        schema: The schema to walk.
        seen: Component names already followed, so a recursive model
            terminates.

    Returns:
        Property names declared anywhere in the schema, including inside
        arrays, additional properties and composed subschemas.
    """
    resolved = _resolve(schema, seen)
    names = set(resolved.get("properties", {}))
    nested: list[Any] = [resolved.get("items"), resolved.get("additionalProperties")]
    nested += [*resolved.get("allOf", []), *resolved.get("anyOf", []), *resolved.get("oneOf", [])]
    nested += list(resolved.get("properties", {}).values())
    for subschema in nested:
        if isinstance(subschema, dict):
            names |= _property_names(subschema, seen)
    return names


def _is_erased(schema: Any) -> bool:
    """Report whether a schema describes its payload or merely its container.

    `response_model=dict` and a bare `-> dict[str, Any]` annotation both publish
    an object with no properties, which tells a client nothing it did not
    already know. The same holds for an array with no item schema.

    Args:
        schema: The response schema to judge.

    Returns:
        True when the schema names no field of the payload.
    """
    resolved = _resolve(schema)
    if not resolved:
        return True
    if resolved.get("type") == "object" and not resolved.get("properties"):
        return True
    return resolved.get("type") == "array" and not _resolve(resolved.get("items", {}))


def _success_schemas(operation: dict[str, Any]) -> list[Any]:
    """Return the JSON schemas a route publishes for its 2xx responses.

    Args:
        operation: One OpenAPI operation object.

    Returns:
        One schema per 2xx response carrying a JSON body.
    """
    return [
        response.get("content", {}).get("application/json", {}).get("schema", {})
        for status, response in operation.get("responses", {}).items()
        if status.startswith("2")
    ]


def _violations(predicate: Any) -> set[str]:
    """Return the routes for which a check does not hold.

    Args:
        predicate: A callable taking a route key and its operation object, and
            returning True when that route violates the check.

    Returns:
        The route keys that violate it.
    """
    return {route for route, operation in _operations().items() if predicate(route, operation)}


def _assert_exactly(violating: set[str], waived: frozenset[str], remedy: str) -> None:
    """Assert the violating routes are exactly the ones listed as waived.

    Args:
        violating: Routes the check found wanting.
        waived: Routes listed here as expected to violate it.
        remedy: What the author of a newly violating route should do instead.

    Raises:
        AssertionError: If a route violates the check without being listed, or
            is listed without violating it.
    """
    unlisted = sorted(violating - waived)
    assert not unlisted, (
        f"{len(unlisted)} route(s) violate this check and are not listed.\n{remedy}\n"
        + "\n".join(f"  {route}" for route in unlisted)
    )
    stale = sorted(waived - violating)
    assert not stale, (
        f"{len(stale)} listed route(s) no longer violate this check. Delete their entries:\n"
        + "\n".join(f"  {route}" for route in stale)
    )


ROUTES_THAT_CANNOT_FAIL = frozenset(
    {
        "GET /api/server_time",  # TZ, falling back to ZoneInfo("UTC") on any value
        "GET /api/version",  # APP_VERSION, defaulting to "dev"
    }
)

ROUTES_WITHOUT_A_REQUEST_BODY = frozenset(
    {
        "POST /api/port-monitor/stacks/recheck",  # ?name=
        "POST /api/port-monitor/stacks/restart",  # ?name=
        "POST /api/session/refresh",  # declares `request: Request` and never reads it
    }
)


ROUTES_WITH_AN_ERASED_RESPONSE_SCHEMA = frozenset(
    {
        "DELETE /api/port-monitor/stacks",
        "DELETE /api/proxies/{label}",
        "DELETE /api/session/delete/{label}",
        "DELETE /api/ui_event_log",
        "DELETE /api/ui_event_log/{label}",
        "GET /api/automation/guardrails",
        "GET /api/last_session",
        "GET /api/notify/config",
        "GET /api/proxies",
        "GET /api/proxies/usage",
        "GET /api/proxy_test/{label}",
        "GET /api/server_time",
        "GET /api/session/{label}",
        "GET /api/sessions",
        "GET /api/status",
        "GET /api/ui_event_log",
        "GET /api/version",
        "POST /api/audiobookrequest/test",
        "POST /api/audiobookrequest/update",
        "POST /api/autobrr/test",
        "POST /api/autobrr/update",
        "POST /api/automation/upload_auto",
        "POST /api/automation/vip",
        "POST /api/chaptarr/test",
        "POST /api/chaptarr/update",
        "POST /api/indexer/update",
        "POST /api/jackett/test",
        "POST /api/jackett/update",
        "POST /api/last_session",
        "POST /api/notify/config",
        "POST /api/notify/test/apprise",
        "POST /api/notify/test/pushover",
        "POST /api/notify/test/smtp",
        "POST /api/notify/test/webhook",
        "POST /api/port-monitor/stacks",
        "POST /api/port-monitor/stacks/recheck",
        "POST /api/port-monitor/stacks/restart",
        "POST /api/prowlarr/find_indexer",
        "POST /api/prowlarr/test",
        "POST /api/prowlarr/update",
        "POST /api/proxies",
        "POST /api/session/perkautomation/save",
        "POST /api/session/refresh",
        "POST /api/session/save",
        "POST /api/session/test_asn_notifications",
        "POST /api/session/update_seedbox",
        "PUT /api/port-monitor/stacks",
        "PUT /api/proxies/{label}",
    }
)

ROUTES_THAT_HAND_VALIDATE_THEIR_BODY = frozenset(
    {
        "POST /api/audiobookrequest/test",
        "POST /api/audiobookrequest/update",
        "POST /api/autobrr/test",
        "POST /api/autobrr/update",
        "POST /api/automation/upload_auto",
        "POST /api/automation/vip",
        "POST /api/chaptarr/test",
        "POST /api/chaptarr/update",
        "POST /api/indexer/update",
        "POST /api/jackett/test",
        "POST /api/jackett/update",
        "POST /api/last_session",
        "POST /api/prowlarr/find_indexer",
        "POST /api/prowlarr/test",
        "POST /api/prowlarr/update",
        "POST /api/session/perkautomation/save",
        "POST /api/session/save",
        "POST /api/session/test_asn_notifications",
        "POST /api/session/update_seedbox",
    }
)

ROUTES_THAT_DECLARE_NO_FAILURE = frozenset(
    {
        "DELETE /api/port-monitor/stacks",
        "DELETE /api/proxies/{label}",
        "DELETE /api/session/delete/{label}",
        "DELETE /api/ui_event_log",
        "DELETE /api/ui_event_log/{label}",
        "GET /api/automation/guardrails",
        "GET /api/last_session",
        "GET /api/notify/config",
        "GET /api/port-monitor/containers",
        "GET /api/port-monitor/stacks",
        "GET /api/proxies",
        "GET /api/proxies/usage",
        "GET /api/proxy_test/{label}",
        "GET /api/session/{label}",
        "GET /api/sessions",
        "GET /api/status",
        "GET /api/ui_event_log",
        "POST /api/audiobookrequest/test",
        "POST /api/audiobookrequest/update",
        "POST /api/autobrr/test",
        "POST /api/autobrr/update",
        "POST /api/automation/upload_auto",
        "POST /api/automation/vip",
        "POST /api/chaptarr/test",
        "POST /api/chaptarr/update",
        "POST /api/indexer/update",
        "POST /api/jackett/test",
        "POST /api/jackett/update",
        "POST /api/last_session",
        "POST /api/notify/config",
        "POST /api/notify/test/apprise",
        "POST /api/notify/test/pushover",
        "POST /api/notify/test/smtp",
        "POST /api/notify/test/webhook",
        "POST /api/port-monitor/stacks",
        "POST /api/port-monitor/stacks/recheck",
        "POST /api/port-monitor/stacks/restart",
        "POST /api/prowlarr/find_indexer",
        "POST /api/prowlarr/test",
        "POST /api/prowlarr/update",
        "POST /api/proxies",
        "POST /api/session/perkautomation/save",
        "POST /api/session/refresh",
        "POST /api/session/save",
        "POST /api/session/test_asn_notifications",
        "POST /api/session/update_seedbox",
        "PUT /api/port-monitor/stacks",
        "PUT /api/proxies/{label}",
    }
)


def test_the_lists_name_routes_that_exist() -> None:
    """Every listed route is published, so a rename cannot orphan an entry."""
    published = set(_operations())
    listed = (
        ROUTES_THAT_CANNOT_FAIL
        | ROUTES_WITHOUT_A_REQUEST_BODY
        | ROUTES_WITH_AN_ERASED_RESPONSE_SCHEMA
        | ROUTES_THAT_HAND_VALIDATE_THEIR_BODY
        | ROUTES_THAT_DECLARE_NO_FAILURE
    )
    assert not sorted(listed - published), "listed routes that no longer exist"


@pytest.mark.parametrize(
    ("permanent", "pending"),
    [
        (ROUTES_THAT_CANNOT_FAIL, ROUTES_THAT_DECLARE_NO_FAILURE),
        (ROUTES_WITHOUT_A_REQUEST_BODY, ROUTES_THAT_HAND_VALIDATE_THEIR_BODY),
    ],
)
def test_a_route_is_never_both_waived_and_pending(
    permanent: frozenset[str], pending: frozenset[str]
) -> None:
    """A permanent waiver and a pending conversion are different claims.

    Listing a route in both would let its pending entry be deleted with nothing
    failing, which is the one way a route could leave the arc unconverted and
    unnoticed.
    """
    assert not sorted(permanent & pending)


def test_no_response_schema_carries_a_success_flag() -> None:
    """The status line is the only failure discriminant.

    A `success` property is the second channel this contract removes: it can
    disagree with the status line, and nothing rejects a body where it does.

    This check has no subject today and is a guard against reintroduction: every
    route's response schema is currently erased, so no property of any kind is
    declared. It acquires teeth with the first conversion, which is exactly when
    a model could carry the flag forward.
    """
    _assert_exactly(
        _violations(
            lambda _route, op: any(
                "success" in _property_names(schema) for schema in _success_schemas(op)
            )
        ),
        frozenset(),
        "Report failure with a status code, not a field. Delete the flag rather than renaming it.",
    )


def test_no_response_schema_is_erased() -> None:
    """A published schema names the fields of its payload."""
    _assert_exactly(
        _violations(
            lambda _route, op: (
                not _success_schemas(op)
                or any(_is_erased(schema) for schema in _success_schemas(op))
            )
        ),
        ROUTES_WITH_AN_ERASED_RESPONSE_SCHEMA,
        "Declare a response model instead of `dict` or `dict[str, Any]`.",
    )


def test_every_route_taking_a_body_publishes_its_schema() -> None:
    """A mutation's request body is part of the contract it publishes.

    A handler that takes `request: Request` and validates by hand publishes no
    request body, so this check is also how the end of hand validation becomes
    provable rather than diligent.
    """
    _assert_exactly(
        _violations(
            lambda route, op: (
                route.split(" ", 1)[0] in _MUTATION_METHODS and "requestBody" not in op
            )
        ),
        ROUTES_THAT_HAND_VALIDATE_THEIR_BODY | ROUTES_WITHOUT_A_REQUEST_BODY,
        "Bind the body as a parameter so FastAPI validates it and publishes its schema.",
    )


def test_no_route_answering_204_declares_content() -> None:
    """A 204 carries no body, and its schema says so.

    FastAPI empties the body for a 204 whatever the handler returns, so a
    declared content schema would be a published promise the framework breaks.

    Like the success-flag check this has no subject yet: the arc's first 204
    arrives with the conversions that replace `{"success": true}`.
    """
    _assert_exactly(
        _violations(
            lambda _route, op: any(
                status == "204" and response.get("content")
                for status, response in op.get("responses", {}).items()
            )
        ),
        frozenset(),
        "Annotate the handler `-> None` and pass `status_code=204`, declaring no response model.",
    )


def test_every_route_that_can_fail_declares_a_failure_status() -> None:
    """Raising publishes nothing, so the failure statuses are declared.

    FastAPI builds the schema from the signature, and an exception handler is
    not part of it: a route that raises but declares only 200 publishes a
    contract saying it cannot fail.

    The automatic 422 does not count. FastAPI adds it to any route with a bound
    parameter without the author deciding anything, so accepting it as a
    declared failure would let the check pass on routes nobody had considered.
    """
    _assert_exactly(
        _violations(
            lambda _route, op: (
                not [
                    status
                    for status in op.get("responses", {})
                    if not status.startswith("2") and status != _AUTOMATIC_VALIDATION_STATUS
                ]
            )
        ),
        ROUTES_THAT_DECLARE_NO_FAILURE | ROUTES_THAT_CANNOT_FAIL,
        "Declare what the route answers when it fails: `responses={404: {...}}`.",
    )
