# MouseTrap API Reference

This document provides a comprehensive reference for MouseTrap's REST API endpoints. The API is built with FastAPI and serves both the web UI and potential external integrations.

## Base URL
- Default: `http://localhost:39842/api`
- Configurable via `PORT` environment variable

## Authentication
Currently, MouseTrap does not implement authentication. All endpoints are publicly accessible on the configured port.

---

## Session Management

### GET `/api/sessions`
List all configured sessions.

**Response:**
```json
[
  {
    "label": "session-name",
    "mam_id": "your_mam_id", 
    "session_type": "auto",
    "mam_ip": "1.2.3.4",
    "check_frequency": 30
  }
]
```

### GET `/api/session/{label}`
Get detailed configuration for a specific session.

**Parameters:**
- `label` (path): Session label/name

**Response:**
```json
{
  "label": "session-name",
  "mam_id": "your_mam_id",
  "session_type": "auto", 
  "mam_ip": "1.2.3.4",
  "check_frequency": 30,
  "perk_automation": {
    "min_points": 0,
    "upload_credit": {
      "enabled": false,
      "gb": 1,
      "trigger_type": "time",
      "trigger_days": 7
    },
    "vip": {
      "enabled": false,
      "weeks": 4,
      "trigger_type": "time",
      "trigger_days": 7
    }
  },
  "proxy_label": null
}
```

### POST `/api/session/{label}`
Create or update a session configuration.

**Parameters:**
- `label` (path): Session label/name

**Request Body:**
```json
{
  "mam_id": "your_mam_id",
  "session_type": "auto",
  "mam_ip": "1.2.3.4", 
  "check_frequency": 30,
  "proxy_label": null
}
```

### DELETE `/api/session/{label}`
Delete a session configuration.

**Parameters:**
- `label` (path): Session label/name

---

## Status & Monitoring

### GET `/api/status`
Get the current status for a specific session.

**Query Parameters:**
- `label` (**required** for session data): Session label to query. If omitted, the response returns `configured: false` along with a list of available session labels.
- `force` (optional): Set to `1` to bypass the cache and perform a fresh status check immediately.

**Response (configured session):**
```json
{
  "configured": true,
  "status_message": "OK",
  "mam_id": "your_mam_id",
  "points": 50000,
  "mam_cookie_exists": true,
  "wedge_active": false,
  "vip_active": true,
  "current_ip": "1.2.3.4",
  "current_ip_asn": "12345",
  "mam_session_as": "AS12345 Some ISP",
  "mam_seen_asn": "12345",
  "mam_seen_as": "AS12345 Some ISP",
  "configured_ip": "1.2.3.4",
  "configured_asn": "12345",
  "check_freq": 15,
  "last_check_time": "2025-09-04T12:00:00+00:00",
  "next_check_time": "2025-09-04T12:15:00+00:00",
  "auto_update_seedbox": null,
  "details": {},
  "detected_public_ip": "1.2.3.4",
  "detected_public_ip_asn": "12345",
  "detected_public_ip_as": "AS12345 Some ISP",
  "proxied_public_ip": null,
  "proxied_public_ip_asn": null,
  "proxied_public_ip_as": null,
  "ip_monitoring_mode": "auto"
}
```

**Response (no label provided or label not found):**
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

### POST `/api/update-seedbox/{label}`
Manually trigger seedbox update for a session.

**Parameters:**
- `label` (path): Session label/name

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

### POST `/api/automation/{label}`
Update automation settings for a session.

**Parameters:**
- `label` (path): Session label/name

**Request Body:**
```json
{
  "min_points": 10000,
  "upload_credit": {
    "enabled": true,
    "gb": 50,
    "trigger_type": "time",
    "trigger_days": 14
  },
  "vip": {
    "enabled": true,
    "weeks": 8,
    "trigger_type": "points",
    "trigger_point_threshold": 30000
  }
}
```

### POST `/api/purchase/{label}/{item_type}`
Manually trigger a purchase.

**Parameters:**
- `label` (path): Session label/name
- `item_type` (path): One of `upload`, `vip`

**Request Body (for upload credit):**
```json
{
  "gb": 50
}
```

**Request Body (for VIP):**
```json
{
  "weeks": 4
}
```

---

## Proxy Management

### GET `/api/proxies`
List all configured proxies.

**Response:**
```json
{
  "proxy-name": {
    "host": "proxy.example.com",
    "port": 8080,
    "username": "user",
    "password": "pass"
  }
}
```

### POST `/api/proxies`
Create or update proxy configuration.

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

### DELETE `/api/proxies/{label}`
Delete a proxy configuration.

**Parameters:**
- `label` (path): Proxy label/name

### GET `/api/proxy_test/{label}`
Test a proxy and return detected IP.

**Parameters:**
- `label` (path): Proxy label/name

**Response:**
```json
{
  "success": true,
  "detected_ip": "1.2.3.4",
  "asn": "AS12345",
  "message": "Proxy test successful"
}
```

---

## Port Monitoring

### GET `/api/port-monitor/stacks`
List all port monitoring configurations.

**Response:**
```json
[
  {
    "name": "gluetun-monitor",
    "primary_container": "gluetun",
    "primary_port": 8080,
    "secondary_containers": ["qbittorrent", "prowlarr"],
    "interval": 5,
    "public_ip": null,
    "status": "OK",
    "last_check": "2025-09-04T12:00:00Z"
  }
]
```

### POST `/api/port-monitor/stacks`
Create a new port monitoring configuration.

**Request Body:**
```json
{
  "name": "monitor-name",
  "primary_container": "container_name",
  "primary_port": 8080,
  "secondary_containers": ["container2", "container3"],
  "interval": 5,
  "public_ip": "1.2.3.4"
}
```

### PUT `/api/port-monitor/stacks/{name}`
Update an existing port monitoring configuration.

### DELETE `/api/port-monitor/stacks/{name}`
Delete a port monitoring configuration.

**Parameters:**
- `name` (path): Monitor configuration name

### GET `/api/port-monitor/containers`
List all available Docker containers.

**Response:**
```json
[
  {
    "name": "gluetun",
    "status": "running",
    "id": "container_id_here"
  }
]
```

---

## Notifications

### GET `/api/notifications`
Get current notification configuration.

**Response:**
```json
{
  "email": {
    "enabled": true,
    "smtp_server": "smtp.gmail.com",
    "smtp_port": 587,
    "username": "user@gmail.com",
    "recipient": "recipient@gmail.com"
  },
  "webhook": {
    "enabled": true,
    "url": "https://discord.com/api/webhooks/...",
    "discord": true
  },
  "event_rules": {
    "automation_success": {
      "email": false,
      "webhook": true
    },
    "automation_failure": {
      "email": true, 
      "webhook": true
    }
  }
}
```

### POST `/api/notifications`
Update notification configuration.

### POST `/api/notifications/test-email`
Test email notification configuration.

### POST `/api/notifications/test-webhook`
Test webhook notification configuration.

### POST `/api/notify/test/apprise`
Test Apprise notification configuration.

### POST `/api/notify/test/pushover`
Test Pushover notification configuration.

**Raises:** `400` if `user_key` or `api_token` are not configured.

---

## Event Log

### GET `/api/event-log`
Retrieve event log entries.

**Query Parameters:**
- `filter` (optional): Filter by session label or "global"
- `limit` (optional): Number of entries to return (default: 50)

**Response:**
```json
[
  {
    "timestamp": "2025-09-04T12:00:00Z",
    "event": "automation_success",
    "event_type": "automation_success", 
    "label": "session-name",
    "details": "VIP purchase successful (4 weeks)",
    "status": "success",
    "auto_update": "N/A"
  }
]
```

### DELETE `/api/event-log`
Clear all event log entries.

---

## Health & Information

### GET `/api/health`
Basic health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-09-04T12:00:00Z"
}
```

### GET `/api/version`
Get application version information.

**Response:**
```json
{
  "version": "1.0.0",
  "build_date": "2025-09-04",
  "git_commit": "abc123"
}
```

---

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong",
  "details": "Additional technical details (optional)"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request (invalid parameters)
- `404`: Not Found (session/proxy/monitor not found)  
- `500`: Internal Server Error

---

## Rate Limiting

MouseTrap implements internal rate limiting for MaM API calls:
- Status checks: Maximum once per hour per session
- Seedbox updates: Maximum once per hour per session
- Purchase attempts: No built-in rate limiting (respects MaM's limits)

Rate limiting information is included in status responses when active.
