# Jackett Integration

## Overview

The Jackett integration allows MouseTrap to automatically update the MAM ID in your Jackett MyAnonamouse indexer configuration when your session changes.

## How It Works

MouseTrap uses the **Jackett HTTP API** to update indexer settings remotely — no file system access required.

Authentication with Jackett requires a session cookie, which MouseTrap obtains automatically:

1. **GET `/UI/Login`** — retrieves the required `TestCookie` and `Jackett` session cookie
2. **POST `/UI/Dashboard`** (if admin password is set) — authenticates and gets a full session cookie
3. **GET/POST `/api/v2.0/indexers/{name}/config`** — reads and updates the MAM ID field

## Setup

1. Open your session configuration in MouseTrap
2. Expand the **Indexer Integrations** section
3. Enable **Jackett Integration**
4. Fill in the following fields:
   - **Host**: Hostname or IP only — do not include `http://` or a port (e.g., `192.168.1.100`, `jackett.local`, or `jackett.example.com`). For HTTPS reverse proxies use port `443`.
   - **Port**: Jackett port (default: `9117`; use `443` for HTTPS reverse proxy)
   - **API Key**: Your Jackett API key (found at the top of the Jackett Dashboard page)
   - **Admin Password**: Optional — only needed if you have set an admin password in Jackett settings
5. Click **TEST** to verify connectivity
6. Enable **Auto-update Jackett on Save** if desired
7. Click **SAVE**

## Prerequisites

1. **Jackett instance** running and accessible from the MouseTrap host
2. **Jackett API key** (shown at the top of the Jackett Dashboard page)
3. **MyAnonamouse indexer** already added and configured in Jackett

## API Endpoints

### Test Connection
**POST** `/api/jackett/test`

Tests connectivity and verifies the MyAnonamouse indexer is present.

**Request:**
```json
{
  "host": "192.168.0.130",
  "port": 9117,
  "api_key": "your_api_key",
  "admin_password": ""
}
```

**Response:**
```json
{
  "success": true,
  "message": "Connected to Jackett. MyAnonamouse indexer found."
}
```

### Update MAM ID
Jackett updates are triggered via the unified endpoint:

**POST** `/api/indexer/update`

```json
{ "label": "session_name" }
```

## Troubleshooting

### "Wrong password" or authentication error

- Verify the **Admin Password** field matches your Jackett admin password exactly
- If Jackett authentication is disabled, leave **Admin Password** blank

### "MyAnonamouse indexer not found"

- Confirm you have added a MyAnonamouse indexer in Jackett's web UI
- Verify the indexer is enabled and saved in Jackett

### Connection refused / timeout

- Check Jackett is running and reachable on the configured host/port
- Confirm no firewall is blocking the connection from the MouseTrap host
- For reverse proxy setups, verify port `443` is set and the proxy is forwarding correctly

## Integration Code

- **Backend Module**: `backend/jackett_integration.py`
- **API Endpoints**: `backend/app.py` (`/api/jackett/*`)

