# Problem Types

When a MouseTrap API request fails, the response body is an
[RFC 9457](https://www.rfc-editor.org/rfc/rfc9457) problem details document sent
as `application/problem+json`. Its `type` member is a URI naming what went
wrong, and that URI is the address of a page in this directory.

Failure is signalled by the HTTP status line and by nothing else. A `2xx`
response never reports a failure, so a client decides success by the status code
alone and never by reading a field out of the body.

---

## The members every problem carries

```json
{
  "type": "https://github.com/sirjmann92/mousetrap/blob/main/docs/problems/invalid-request.md",
  "status": 422,
  "title": "The request was not accepted",
  "detail": "The request could not be accepted as sent."
}
```

- **`type`** — a URI identifying the kind of problem. Always present.
- **`status`** — the same code as the status line, repeated so a stored copy of
  the body still says what happened once the response is gone. It is advisory:
  the status line is authoritative.
- **`title`** — a fixed summary of the problem *type*. It does not vary between
  occurrences, so it is safe to use as a heading.
- **`detail`** — a sentence about *this* occurrence. Always present and never
  empty.

A problem type may define extra members of its own, documented on its page. Any
member you do not recognise should be ignored.

`instance` is never sent.

---

## `about:blank`, and why most failures use it

`type` is `about:blank` when the status code says everything there is to say —
RFC 9457 §4.2.1 defines that URI as "no additional semantics beyond that of the
HTTP status code". A 404 for a session that does not exist needs nothing more
than a 404, so inventing a URI for it would add a name without adding meaning.

A type gets a URI and a page here when it carries something a status code
cannot: extra members, or a specific cause among several that share a code.

---

## Reading a problem in a client

Branch on `type`, not on `status`, when you want a problem type's extra members.
RFC 9457 scopes those members to the type that defines them, so the same status
code can arrive from several types and only one of them promises the member you
are about to read.

Never parse `detail` for data. RFC 9457 §3.1.4 asks consumers not to, and
anything worth extracting is published as a member instead. `detail` is for
showing a person.

---

## Types

| Type | Status | Title |
| --- | --- | --- |
| [`invalid-request`](invalid-request.md) | 422 | The request was not accepted |

---

## Adding a type

1. Add the page here, named for the slug in its URI.
2. Subclass `MouseTrapError` in `backend/errors.py`, setting `status`, `type`
   (via `problem_type("<slug>")`) and `title`. Build the message inside the
   class from typed constructor parameters.
3. Declare any extra members as fields on a `ProblemDetails` subclass and return
   it from `problem()`.
4. Declare the status on every route that can raise it, in the route's
   `responses={...}`. An exception handler is invisible to the OpenAPI schema,
   so a route that raises without declaring publishes a contract claiming it
   cannot fail.

A type URI is an identity, not a location. Once a client has seen it, it does
not change: RFC 9457 §3.1.1 warns that changing one introduces a breaking change
even if the page has only moved. Renaming a page therefore means keeping the old
URI, not updating it.
