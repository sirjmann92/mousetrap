# MouseTrap API Reference

This document provides a comprehensive reference for MouseTrap's REST API endpoints. The API is built with FastAPI and serves both the web UI and potential external integrations.

## Base URL
- Default: `http://localhost:39842/api`
- Configurable via `PORT` environment variable

## Authentication
MouseTrap does not implement authentication. Every endpoint is reachable by
anyone who can reach the configured port, and several return stored secrets
verbatim:

| Endpoint | Secrets in the response |
| --- | --- |
| `GET /api/session/{label}` | MAM ID, browser cookie, indexer integration API keys |
| `GET /api/notify/config` | SMTP password, webhook URL, Pushover token |
| `GET /api/proxies` | Proxy passwords |

Expose the port only to a trusted network, or place it behind an authenticating
reverse proxy.

### Cross-site requests

A page on another website can make the user's browser send requests to
MouseTrap. It cannot read the replies, but without a guard a `POST` would still
run. So a state-changing request (`POST`, `PUT`, `PATCH`, `DELETE`) that a
browser marks as coming from another site is refused with `403` before it
reaches any route:

- With `Sec-Fetch-Site`, which browsers send to HTTPS and loopback addresses,
  only `same-origin` and `none` are allowed. `same-site` is refused, because
  another app on the same host on a different port is same-site.
- Without it, as over plain HTTP to a LAN address, `Origin` must match the
  address the request was sent to: `Host`, or `X-Forwarded-Host` when a reverse
  proxy rewrites `Host`.
- A request carrying neither header is not from a browser and is allowed, so
  scripts and tools calling the API are unaffected. `GET` requests are never
  refused.

---

## Session Management

### GET `/api/sessions`
List the configured session labels. This returns labels only, not session
contents — use `GET /api/session/{label}` for one session's configuration.

**Response:**
```json
{ "sessions": ["Primary", "Seedbox"] }
```

### GET `/api/session/{label}`
Get the full stored configuration for a session. Returns `404` if no session has
that label.

**Parameters:**
- `label` (path): Session label/name

**Response:** the session config as persisted, with any missing fields filled in
from defaults:
```json
{
  "label": "example",
  "mam": { "mam_id": "", "session_type": "ip", "ip_monitoring_mode": "auto" },
  "browser_cookie": "",
  "mam_ip": "",
  "proxy": { "host": "", "port": 0, "username": "", "password": "" },
  "last_check_time": null,
  "perk_automation": {
    "upload_credit": {
      "enabled": false, "gb": 1, "min_points": 0, "points_to_keep": 0,
      "trigger_type": "time", "trigger_days": 7, "trigger_point_threshold": 50000
    },
    "vip_automation": {
      "enabled": false, "trigger_type": "time", "trigger_days": 7,
      "trigger_point_threshold": 50000, "weeks": 4
    }
  },
  "prowlarr": {
    "enabled": false, "host": "", "port": 9696, "api_key": "",
    "auto_update_on_save": false
  },
  "mam_invalid_notified": false,
  "mam_invalid_since": null,
  "last_mam_valid_check": null
}
```

A saved session also carries backend-managed fields such as `last_seedbox_ip`,
`last_seedbox_asn`, `proxied_public_ip`, and `last_status`. Those are written by
status checks, not by the client, and `POST /api/session/save` preserves them
when they are absent from the request.

### POST `/api/session/save`
Create or update a session. The label comes from the body, not the path.

**Request Body:**
```json
{
  "label": "example",
  "old_label": "",
  "mam": { "mam_id": "your_mam_id", "session_type": "ip", "ip_monitoring_mode": "auto" },
  "mam_ip": "1.2.3.4",
  "check_freq": 30,
  "proxy": { "label": "my-proxy" }
}
```

- `label` is required; a missing or blank one returns `400`.
- `old_label` renames an existing session. The new file is written before the old
  one is removed, and the scheduler job is re-registered under the new label.
- `proxy` is a mapping, not a bare string. `{"label": "my-proxy"}` selects a
  configured proxy and `{}` means none.
- A proxy label that names no configured proxy returns `400`. A session holding
  an unresolvable label runs with no proxy at all, so its MyAnonaMouse traffic
  would leave over a direct connection with nothing in the UI saying so. Pick an
  existing proxy, or none.
- Sessions predating named proxies carry inline host details and no label; those
  are still accepted.
- This pairs with the `409` on proxy deletion: a delete cannot orphan a
  reference, and a save cannot create a dangling one.
- An omitted proxy password is carried over from the stored session, so a client
  that never received the password does not blank it on save.
- The integration sections (`prowlarr`, `chaptarr`, `jackett`, `audiobookrequest`,
  `autobrr`) are optional and stored as sent. Unlike the backend-managed fields
  above they are not merged from the stored session, so a save that omits one
  drops it.

### DELETE `/api/session/delete/{label}`
Delete a session and clear its UI event-log entries.

**Parameters:**
- `label` (path): Session label/name

---

## Status & Monitoring

### GET `/api/status`
Get the current status for a session.

**Query Parameters:**
- `label` (**required** for session data): Session label to query. If omitted,
  the response reports the available labels instead.
- `force` (optional): Set to `1` to bypass the cache and check immediately.

**Response (configured session):**
```json
{
  "status_message": "OK",
  "message": "",
  "points": 50000,
  "mam_cookie_exists": true,
  "wedge_active": false,
  "vip_active": true,
  "current_ip": "1.2.3.4",
  "current_ip_asn": "12345",
  "ip_source": "proxy",
  "mam_session_as": "AS12345 Some ISP",
  "mam_seen_asn": "12345",
  "mam_seen_as": "AS12345 Some ISP",
  "configured_ip": "1.2.3.4",
  "configured_asn": "12345",
  "check_freq": 15,
  "last_check_time": "2026-09-14T12:00:00+00:00",
  "next_check_time": "2026-09-14T12:15:00+00:00",
  "timezone": "UTC",
  "details": {},
  "detected_public_ip": "1.2.3.4",
  "detected_public_ip_asn": "12345",
  "detected_public_ip_as": "AS12345 Some ISP",
  "proxied_public_ip": null,
  "proxied_public_ip_asn": null,
  "proxied_public_ip_as": null,
  "ip_monitoring_mode": "auto",
  "mam_invalid_since": null,
  "last_mam_valid_check": "2026-09-14T12:00:00+00:00"
}
```

- This response does not include the MAM ID. `GET /api/session/{label}` does;
  see [Authentication](#authentication).
- `auto_update_seedbox` is present only when an automatic seedbox update ran
  during this check, and carries that attempt's result.
- `configured` appears only in the unconfigured response below; its absence
  means a session was found.
- `mam_invalid_since` and `last_mam_valid_check` track cookie validity, set from
  MaM's own response classification rather than from a failed request.

**Response (no label provided, or no sessions exist):**
```json
{
  "configured": false,
  "status_message": "No session label provided. Use ?label=<name>. Available sessions: [\"Primary\"]",
  "available_sessions": ["Primary"],
  "last_check_time": null,
  "next_check_time": null,
  "details": {},
  "detected_public_ip": "1.2.3.4",
  "detected_public_ip_asn": "12345"
}
```

### POST `/api/session/update_seedbox`
Force a seedbox IP/ASN update for a session using the IP entered on it. The
session must have both a `mam_id` and a `mam_ip`; either missing returns `400`.

**Request Body:**
```json
{ "label": "session-name" }
```

**Response:** `{"success": true, "msg": "..."}`, or `{"success": false, "error": "..."}`
when MaM rejects the update or cannot be reached. `{"success": true, "msg": "No
change: IP/ASN already set."}` when nothing needed updating.

---

### POST `/api/session/refresh`
Confirm a session's MaM ID is configured. The frontend calls this to check that
session data are available; it performs no MaM request.

**Request Body:**
```json
{ "label": "session-name" }
```

---

### POST `/api/session/test_asn_notifications`
Test ASN mismatch notification for a session (debugging/testing only).

**Request Body:**
```json
{
  "label": "session-name"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Test ASN mismatch notification sent for session 'session-name'"
}
```

**Notes:**
- Only works for ASN Locked sessions
- Sends test notification via configured notification channels
- Simulates ASN mismatch detection scenario (403 error due to ASN change)
- Use for testing notification delivery without waiting for actual ASN changes

---

## Automation & Purchases

### POST `/api/session/perkautomation/save`
Save a session's perk automation settings. Time-based triggers have their
`last_purchase` timestamp set or cleared as appropriate before the session is
persisted.

**Request Body:**
```json
{
  "label": "session-name",
  "perk_automation": {
    "min_points": 10000,
    "upload_credit": {
      "enabled": true,
      "gb": 50,
      "min_points": 0,
      "points_to_keep": 0,
      "trigger_type": "time",
      "trigger_days": 14,
      "trigger_point_threshold": 50000
    },
    "vip_automation": {
      "enabled": true,
      "weeks": 8,
      "trigger_type": "points",
      "trigger_days": 7,
      "trigger_point_threshold": 30000
    }
  }
}
```

The VIP section is `vip_automation`, not `vip`.

### GET `/api/automation/guardrails`
Report which automations are enabled per session, keyed by label, so the UI can
enforce one enabled automation of each type per MaM account.

**Response:**
```json
{
  "Gluetun": { "username": "example_user", "autoUpload": true, "autoVIP": false }
}
```

### POST `/api/automation/upload_auto`
Manually trigger an upload credit purchase.

**Request Body:**
```json
{
  "label": "session-name",
  "amount": 50
}
```

- `label` is required; a missing label returns `400`.
- `amount` is a number of GB and must be `50` or `100`; any other value returns `400`.
- When the session enables the minimum-points guardrail and MaM returns no point
  balance, the purchase is not attempted and the response carries the MaM failure
  in `error`.
- When MaM refuses the purchase it answers `200 OK` with `{"success": false,
  "error": "..."}`, and that wording is returned verbatim in `error`.

### POST `/api/automation/vip`
Manually trigger a VIP purchase.

**Request Body:**
```json
{
  "label": "session-name",
  "weeks": 4
}
```

- `label` is required; a missing label returns `400`.
- `weeks` is a whole number of weeks, sent as a number or a string, and defaults
  to `4`. `"max"` and `90` both buy the max duration. Any other value returns
  `400`.
- When the session enables the minimum-points guardrail and MaM returns no point
  balance, the purchase is not attempted and the response carries the MaM failure
  in `error`.
- When MaM refuses the purchase it answers `200 OK` with `{"success": false,
  "error": "..."}`, and that wording is returned verbatim in `error`. A common
  refusal is `Min VIP is 1 week purchased for Automated methods`: purchases made
  through the API must add at least a full week, so `max` fails once VIP is
  within a week of its cap even though the MaM website allows a partial top-up.
- When the session's last status reports more than 83 days of VIP remaining, no
  duration can add that full week, so the purchase is not attempted: the
  response is `{"success": false, "error": "..."}` naming the days remaining and
  when the purchase becomes possible. A session with no stored status, or an
  unreadable `vip_until`, is never blocked by this check.

---

## Proxy Management

### GET `/api/proxies`
List the configured proxies, keyed by label.

**Response:**
```json
{
  "proxy-name": {
    "label": "proxy-name",
    "host": "proxy.example.com",
    "port": 8080,
    "username": "user",
    "password": "pass"
  }
}
```

This returns the stored proxy entries verbatim, **including proxy passwords**.
It is not the only endpoint that returns stored secrets; see
[Authentication](#authentication).

### GET `/api/proxies/usage`
Report which sessions select each configured proxy. Every configured proxy
appears, with an empty list when unused, so a caller can tell "unused" from
"unknown".

**Response:**
```json
{ "vpn": ["seedbox", "spare"], "backup-vpn": [] }
```

The UI disables the delete control from this rather than accepting the click
and refusing afterwards. It shares its scan with `DELETE /api/proxies/{label}`,
so the two cannot disagree — a session whose file cannot be parsed is
attributed to every proxy, since its reference cannot be read.

### POST `/api/proxies`
Create a proxy. Returns `400` if a field is missing or invalid, or if a proxy
with that label already exists — this endpoint does not update.

**Request Body:**
```json
{
  "label": "proxy-name",
  "host": "proxy.example.com",
  "port": 8080,
  "username": "user",
  "password": "pass"
}
```

- `label` and `host` are required and must not be blank. A proxy with no host
  resolves to no proxy at all, so a session selecting it would connect
  directly.
- `port` is required and must be a whole number from 1 to 65535. A numeric
  string such as `"8080"` is accepted and stored as a number; a boolean is
  refused.
- `username` and `password` are optional and stored exactly as sent, including
  surrounding spaces.
- A `400` names every invalid field at once, for example
  `"Proxy host is required. Proxy port must be a whole number from 1 to 65535."`
- The stored entry is exactly these five fields; anything else in the body is
  dropped. Entries written before this validation existed are loaded unchanged,
  so an older string port keeps working until the proxy is next edited.

### PUT `/api/proxies/{label}`
Replace an existing proxy's configuration. Returns `404` if no proxy has that
label.

**Parameters:**
- `label` (path): Proxy label/name. The stored proxy is keyed by this path
  value, so a proxy cannot be renamed through this endpoint.

**Request Body:** the same shape and rules as `POST /api/proxies`, answering
`400` on the same conditions and leaving the stored proxy untouched when it
does. The entry is stored with the path's label even if the body names another,
so its `label` field always matches the key sessions reference.

### DELETE `/api/proxies/{label}`
Delete a proxy configuration.

**Parameters:**
- `label` (path): Proxy label/name

- Returns `404` if no proxy has that label.
- Returns `409`, naming the sessions, if any session still selects this proxy.
  Clearing the reference instead would leave those sessions with no proxy at
  all, so their MaM traffic would continue over a direct connection. Change or
  remove the proxy on each session first, then delete it.
- A session whose file cannot be parsed is counted as a user of the proxy,
  since its reference cannot be inspected.

### GET `/api/proxy_test/{label}`
Look up the public IP and ASN seen through a proxy. Returns `404` if no proxy
has that label.

**Parameters:**
- `label` (path): Proxy label/name

**Response:**
```json
{
  "proxied_ip": "1.2.3.4",
  "proxied_asn": "AS12345 Example Network"
}
```

Both values are `null` when the lookup through the proxy fails, which is how a
proxy that is configured but unreachable presents.

---

## Port Monitoring

Stacks are addressed by a `name` **query parameter**, not a path segment.

### GET `/api/port-monitor/stacks`
List the configured stacks.

**Response:**
```json
[
  {
    "name": "gluetun-monitor",
    "primary_container": "gluetun",
    "primary_port": 8080,
    "secondary_containers": ["qbittorrent", "prowlarr"],
    "interval": 60,
    "status": "OK",
    "last_checked": 1757851200.0,
    "last_result": true,
    "public_ip": null,
    "public_ip_detected": null
  }
]
```

`last_checked` is a Unix timestamp, not an ISO string. `interval` is in seconds
and defaults to 60.

### POST `/api/port-monitor/stacks`
Create a stack.

**Request Body:**
```json
{
  "name": "monitor-name",
  "primary_container": "container_name",
  "primary_port": 8080,
  "secondary_containers": ["container2", "container3"],
  "interval": 60,
  "public_ip": "1.2.3.4"
}
```

`name`, `primary_container` and `primary_port` are required; the rest default as
shown.

### PUT `/api/port-monitor/stacks?name={name}`
Update a stack and trigger an immediate recheck.

**Parameters:**
- `name` (query): Stack name

**Request Body:** the same fields as the create body **without** `name`, which
comes from the query parameter.

### DELETE `/api/port-monitor/stacks?name={name}`
Delete a stack.

**Parameters:**
- `name` (query): Stack name

### POST `/api/port-monitor/stacks/recheck?name={name}`
Recheck one stack immediately. Returns `404` if no stack has that name.

**Parameters:**
- `name` (query): Stack name

### POST `/api/port-monitor/stacks/restart?name={name}`
Restart a stack's primary container. The restart runs in a background thread, so
this returns as soon as the stack is marked restarting rather than when the
container is back.

**Parameters:**
- `name` (query): Stack name

### GET `/api/port-monitor/containers`
List running Docker container names.

**Response:** a flat array of strings, not objects.
```json
["gluetun", "qbittorrent", "prowlarr"]
```

Returns an empty list when the Docker socket is not mounted; port monitoring
degrades rather than failing.

---

## Notifications

Notification settings are global, not per session.

### GET `/api/notify/config`
Return the stored notification configuration.

**Response:**
```json
{
  "webhook_url": "https://discord.com/api/webhooks/...",
  "discord_webhook": true,
  "smtp": {
    "host": "smtp.example.com",
    "port": 587,
    "username": "user@example.com",
    "password": "app-password",
    "to_email": "recipient@example.com"
  },
  "apprise": {
    "url": "http://apprise:8000",
    "mode": "stateless",
    "notify_url_string": "",
    "key": "",
    "tags": "",
    "include_prefix": false
  },
  "pushover": { "user_key": "...", "api_token": "..." },
  "event_rules": {
    "automation_success": {
      "enabled": true, "email": false, "webhook": true,
      "apprise": false, "pushover": false
    }
  }
}
```

`webhook_url` and `discord_webhook` are top-level, not nested under a `webhook`
object. SMTP requires all of `host`, `port`, `username`, `password` and
`to_email`; a partial section is skipped rather than half-sent.

An event fires only when its rule enables at least one channel, and an explicit
`"enabled": false` on the rule suppresses it regardless of the channel flags.

### POST `/api/notify/config`
Replace the notification configuration. The body is the same shape returned by
`GET /api/notify/config`.

**Response:** `{"success": true}`

### POST `/api/notify/test/webhook`
Send a test payload to the configured webhook. Returns `400` if no webhook URL
is configured.

**Request Body:** an arbitrary object, forwarded as the payload.

### POST `/api/notify/test/smtp`
Send a test email using the stored SMTP settings. Returns `400` if the SMTP
configuration is incomplete.

**Request Body:**
```json
{ "subject": "optional", "body": "optional" }
```

### POST `/api/notify/test/apprise`
Send a test notification via Apprise, in whichever of stateless (URLs) or
stateful (key/tags) mode is configured.

**Request Body:**
```json
{ "event_type": "optional", "label": "optional", "status": "optional",
  "message": "optional", "details": {} }
```

### POST `/api/notify/test/pushover`
Send a test Pushover notification. Returns `400` if `user_key` or `api_token`
are not configured.

**Request Body:**
```json
{ "message": "optional" }
```

All four test endpoints answer `{"success": true|false}`.

---

## Indexer Integrations

MouseTrap can push a session's MAM ID into Prowlarr, Chaptarr, Jackett,
AudioBookRequest and Autobrr, so a rotated cookie does not have to be pasted
into each one by hand.

Every endpoint here answers `200` with `{"success": false, "message": "..."}`
on failure rather than an HTTP error status, because the frontend reads these
bodies without checking the status code.

### Connection tests

`POST /api/prowlarr/test`, `/api/chaptarr/test`, `/api/jackett/test`,
`/api/audiobookrequest/test`, `/api/autobrr/test`

**Request Body:**
```json
{
  "host": "prowlarr",
  "port": 9696,
  "api_key": "your-api-key",
  "admin_password": ""
}
```

`host`, `port` and `api_key` are required. `port` is declared as an integer, so
a numeric string is converted and anything else is rejected. `admin_password`
is used only by Jackett, which authenticates before its API accepts calls.

**Response:** `{"success": true, "message": "...", "indexer_count": 12}` — the
Prowlarr test also reports `indexer_id` when it finds the MyAnonamouse indexer.

### POST `/api/prowlarr/find_indexer`
Locate the MyAnonamouse indexer's ID in Prowlarr. Same request body as the
connection tests.

### MAM ID updates

`POST /api/prowlarr/update`, `/api/chaptarr/update`, `/api/jackett/update`,
`/api/audiobookrequest/update`, `/api/autobrr/update`

**Request Body:**
```json
{ "label": "session-name", "mam_id": "" }
```

`label` is required and names the session whose stored integration settings are
used. `mam_id` is optional: when omitted or blank, the session's current MAM ID
is sent, which is what the automatic sync after a cookie rotation does.

### POST `/api/indexer/update`
Update every integration enabled on the session in one call, rather than one
endpoint at a time. Same request body as the individual updates.

---

## Event Log

The UI event log is stored in SQLite under the persistent config directory.

### GET `/api/ui_event_log`
Return every logged event in insertion order. There are no query parameters;
filtering and limiting are done by the client.

**Response:** events are stored as whole JSON objects, so the keys vary by event
type. An automation event looks like:
```json
[
  {
    "timestamp": "2026-09-14T12:00:00+00:00",
    "label": "session-name",
    "event_type": "automation",
    "trigger": "automation",
    "purchase_type": "vip",
    "amount": 4,
    "details": { "points_before": 51234 },
    "result": "success",
    "status_message": "Automated VIP purchase succeeded: 4 weeks"
  }
]
```

`result` is one of `success`, `failed` or `skipped`. A skipped event's
`status_message` names the guardrail that blocked the purchase, or the MaM
failure that stopped any guardrail from being evaluated — in which case
`details.points_before` is `null`, since no balance was read.

Returns an empty list if the log cannot be read, rather than erroring.

### DELETE `/api/ui_event_log`
Clear the whole event log.

**Response:** `{"success": true}`, or `{"success": false, "error": "..."}`.

### DELETE `/api/ui_event_log/{label}`
Clear only the events for one session. Called automatically when a session is
deleted.

**Parameters:**
- `label` (path): Session label/name

---

## Health & Information

There is no `/api/health` endpoint. Container health is checked by the
Dockerfile `HEALTHCHECK`, which requests the application root.

### GET `/api/version`
Return the running application version.

**Response:**
```json
{ "version": "2.4.6" }
```

The value comes from the `APP_VERSION` build argument injected during the Docker
build, and is `dev` for a local source run. Release versions come from git tags;
`frontend/package.json`'s `version` field is inert.

### GET `/api/server_time`
Return the server's current time in its local timezone, ISO formatted. The UI
uses it to render schedules in the container's `TZ` rather than the browser's.

### GET `/api/last_session`
Return the session label the UI last had selected.

**Response:** `{"label": "session-name"}`, or `{"label": null}` if none is saved.

### POST `/api/last_session`
Persist the selected session label. Returns `400` if `label` is missing.

**Request Body:**
```json
{ "label": "session-name" }
```

---

## Error Responses

There is no single error shape. Which one you get depends on how the endpoint
reports failure, and the difference matters to clients:

**1. An HTTP error status** — used for refusals such as a missing session, a
proxy still in use, or a session naming a proxy that does not exist. The body is
an [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457) problem details document,
sent as `application/problem+json`:
```json
{
  "type": "about:blank",
  "status": 409,
  "title": "Conflict",
  "detail": "Proxy 'vpn' is still used by 'seedbox'. Change or remove ..."
}
```

Every failure with an error status answers in that shape, whatever raised it,
including a rejected request body and an unhandled server error. `detail` is
always a string and always present, so a client can show it without checking its
type first. `type` is `about:blank` when the status code says everything there
is to say, and otherwise a URI naming the problem and addressing its page under
[`docs/problems/`](problems/README.md), which documents the members that type
adds. `status` repeats the status line and is advisory; the status line is
authoritative.

**2. `200` with a success flag** — used by the automation and indexer endpoints,
because the frontend reads those bodies without checking the status code.
Binding their bodies as FastAPI parameters would return `422` instead and break
that:
```json
{ "success": false, "message": "Session 'seedbox' not found" }
```

**3. `200` with an `error` key** — the seedbox update and manual purchase
routes, where the call reached MaM and MaM refused:
```json
{ "success": false, "error": "Rate limit: last change too recent. Try again in 42 minutes." }
```

Status codes in use:
- `200`: Success, or a handled failure in shapes 2 and 3 above
- `400`: Bad request — a missing label, an unparsable body, a proxy label
  naming no configured proxy
- `403`: A state-changing request a browser sent on behalf of another site; see
  [Cross-site requests](#cross-site-requests)
- `404`: Session, proxy, or port-monitor stack not found
- `409`: Proxy still selected by a session, so it was not deleted
- `422`: A request value was rejected — see
  [`invalid-request`](problems/invalid-request.md), which lists every rejected
  value and where it was
- `500`: Unhandled server error

---

## Rate Limiting

MouseTrap does not impose its own rate limits on MaM calls. It paces scheduled
work and surfaces the limits MaM itself enforces.

**What MouseTrap paces:**
- Status checks run on each session's configured interval (`check_freq`, in
  minutes). There is no additional hourly cap.
- The MaM session keepalive runs at most once every 24 hours per session,
  enough to hold off the roughly 30-day session expiry.

**What MaM enforces:**
- Seedbox IP/ASN updates are refused when the previous change was too recent.
  MouseTrap detects this from the response rather than from a local timer — a
  `429`, or a message containing "too recent" — and reports how many minutes
  remain in `rate_limit_minutes` alongside the `error` string.
- Purchases have no MouseTrap-side limit and are subject to whatever MaM
  applies.

A rate-limited seedbox update is a handled outcome, not an error: it is logged
to the event log as `seedbox_update_rate_limited` and answers `200` in shape 3
above.
