# The request was not accepted

**Type:** `https://github.com/sirjmann92/mousetrap/blob/main/docs/problems/invalid-request.md`
**Status:** `422`

The request reached the endpoint but carried a value it could not accept: a
missing parameter, a field of the wrong type, or a body that is not valid JSON.
Nothing was changed on the server.

---

## Extension members

### `errors`

An array with one entry per rejected value. Every entry has a `detail`, and at
most one locator saying where the value was.

| Shape | Means |
| --- | --- |
| `{"detail": ..., "pointer": "#/port"}` | A value in the request body, located by a [JSON Pointer](https://www.rfc-editor.org/rfc/rfc6901) rooted at the body. |
| `{"detail": ..., "name": "label", "in": "query"}` | A value outside the body, named as the OpenAPI schema names it. `in` is one of `query`, `path`, `header`, `cookie`. |
| `{"detail": ...}` | A value that cannot be located, such as a body that failed to parse at all. |

A pointer is only ever sent for a value inside the body, because a JSON Pointer
addresses a position in a JSON document and a query parameter is not in one.

---

## Examples

A missing query parameter:

```json
{
  "type": "https://github.com/sirjmann92/mousetrap/blob/main/docs/problems/invalid-request.md",
  "status": 422,
  "title": "The request was not accepted",
  "detail": "The request could not be accepted as sent.",
  "errors": [
    { "detail": "Field required", "name": "name", "in": "query" }
  ]
}
```

A body field of the wrong type:

```json
{
  "type": "https://github.com/sirjmann92/mousetrap/blob/main/docs/problems/invalid-request.md",
  "status": 422,
  "title": "The request was not accepted",
  "detail": "The request could not be accepted as sent.",
  "errors": [
    {
      "detail": "Input should be a valid integer, unable to parse string as an integer",
      "pointer": "#/primary_port"
    }
  ]
}
```

Every rejected value is reported in one response, so a client can show all of
them at once rather than surfacing them one request at a time.

---

## Resolving it

Correct the values named in `errors` and send the request again. Repeating it
unchanged will fail the same way: this status means the request itself is the
problem, not the server's state.
