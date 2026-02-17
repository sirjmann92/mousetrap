# Autobrr Integration

MouseTrap can automatically update your MyAnonamouse session ID in [Autobrr](https://autobrr.com) when it changes.

## Overview

Autobrr is an automation tool for torrents and Usenet that monitors IRC announce channels and supports RSS/Torznab/Newznab feeds. This integration allows MouseTrap to keep your MAM indexer credentials (cookie) up-to-date automatically.

## Features

- **Auto-update on Save**: Automatically sync your MAM session ID to Autobrr when it changes
- **Test Connection**: Verify connectivity and authentication before enabling
- **API Key Authentication**: Secure API access using your Autobrr API key
- **Undocumented API Support**: Uses Autobrr's undocumented PUT endpoint for updating indexers

## Configuration

### Prerequisites

1. Autobrr installed and running
2. MyAnonamouse indexer configured in Autobrr
3. Autobrr API key generated

### Getting Your API Key

1. Log into Autobrr
2. Navigate to **Settings → API Keys**
3. Create a new API key
4. Copy the key for use in MouseTrap

### Setup in MouseTrap

1. Open your session configuration
2. Expand the **Indexer Integrations** section
3. Enable **Autobrr Integration**
4. Fill in the following fields:
   - **Host**: Autobrr hostname or IP (e.g., `localhost`)
   - **Port**: Autobrr port (default: `7474`)
   - **API Key**: Your Autobrr API key
5. Click **TEST** to verify connectivity
6. Enable **Auto-update Autobrr on Save** if desired
7. Click **SAVE** to save your configuration

## How It Works

### Authentication

Autobrr uses **X-API-Token header authentication**. MouseTrap includes your API key in the `X-API-Token` header for all requests:

```http
X-API-Token: <your-api-key>
```

### API Endpoints Used

This integration uses **undocumented Autobrr API endpoints** discovered through source code inspection:

- **GET /api/indexer**: List all indexers (to find MyAnonamouse indexer by identifier)
- **GET /api/indexer/{id}**: Get full indexer details including settings
- **PUT /api/indexer/{id}**: Update indexer configuration (undocumented endpoint)

The official [Autobrr API documentation](https://autobrr.com/api#indexers) only lists GET and PATCH endpoints, but the source code reveals a full PUT endpoint that supports updating all indexer fields.

### Field Mapping

MouseTrap maps its `mam_id` field to Autobrr's `settings.cookie` field in the MyAnonamouse indexer configuration:

```json
{
  "settings": {
    "cookie": "mam_id=<your-session-id>"
  }
}
```

### Update Process

When updating the MAM session ID:

1. MouseTrap lists all indexers to find the MyAnonamouse indexer (identifier: `myanonamouse`)
2. Retrieves the full indexer configuration via GET
3. Updates the `settings.cookie` field with the new MAM session ID
4. Sends a PUT request with the complete indexer configuration
5. Logs the result in the UI event log

## Auto-Update Behavior

When **Auto-update Autobrr on Save** is enabled:

1. MouseTrap detects when your MAM ID changes
2. Automatically finds your MyAnonamouse indexer in Autobrr
3. Updates the `settings.cookie` field with the new session ID
4. Logs the result in the UI event log

## Manual Updates

You can manually trigger an update at any time:

1. Navigate to the **Status** tab
2. Click the **UPDATE** button next to "Update Indexer(s)"
3. MouseTrap will sync to all enabled integrations (Prowlarr, Chaptarr, Jackett, AudioBookRequest, and/or Autobrr)

## Troubleshooting

### Connection Test Fails

**Error: "Authentication failed. Check API key."**
- Verify your API key is correct
- Ensure the API key hasn't been revoked in Autobrr

**Error: "Cannot connect to host:port. Check host and port."**
- Verify Autobrr is running
- Check the host and port are correct
- If using Docker, ensure network connectivity between containers

**Error: "MyAnonamouse indexer not found. Please configure it in Autobrr first."**
- Add the MyAnonamouse indexer in Autobrr before enabling this integration
- The indexer must use the identifier `myanonamouse` (lowercase)

### Auto-Update Not Working

1. Verify **Auto-update Autobrr on Save** is enabled
2. Check that your MAM ID actually changed (auto-update only triggers on change)
3. Review the logs for any error messages
4. Ensure the MyAnonamouse indexer exists in Autobrr

### Understanding the Cookie Format

Autobrr expects the MAM cookie in the format: `mam_id=<session-id>`. MouseTrap automatically handles this formatting when updating the cookie field.

## Technical Details

### Indexer Struct

The Autobrr indexer configuration follows this structure (Go):

```go
type Indexer struct {
    ID                 int64             `json:"id"`
    Name               string            `json:"name"`
    Identifier         string            `json:"identifier"`
    IdentifierExternal string            `json:"identifier_external"`
    Enabled            bool              `json:"enabled"`
    Implementation     string            `json:"implementation"`
    BaseURL            string            `json:"base_url,omitempty"`
    UseProxy           bool              `json:"use_proxy"`
    Proxy              *Proxy            `json:"proxy"`
    ProxyID            int64             `json:"proxy_id"`
    Settings           map[string]string `json:"settings,omitempty"`
}
```

The `Settings` field is a key-value map that contains credentials and other indexer-specific configuration, including `cookie`, `apikey`, `passkey`, `rsskey`, etc.

### Security

Autobrr's MarshalJSON implementation automatically redacts sensitive fields (including `cookie`) in API responses. While you can update these fields, they will appear as `<redacted>` in GET responses for security.

## Advanced Usage

### Testing the API Directly

You can test the Autobrr API directly using curl:

```bash
# List all indexers
curl -H "X-API-Token: YOUR_API_KEY" http://localhost:7474/api/indexer

# Get specific indexer by ID
curl -H "X-API-Token: YOUR_API_KEY" http://localhost:7474/api/indexer/1

# Update indexer (replace with actual indexer data)
curl -X PUT -H "X-API-Token: YOUR_API_KEY" \\
     -H "Content-Type: application/json" \\
     -d '{"id":1,"name":"MyAnonamouse",...,"settings":{"cookie":"new_mam_id"}}' \\
     http://localhost:7474/api/indexer/1
```

## Related Documentation

- [Indexer Integrations Overview](indexer-integrations.md)
- [Prowlarr Integration](prowlarr-integration.md)
- [Chaptarr Integration](chaptarr-integration.md)
- [Jackett Integration](jackett-integration.md)
- [AudioBookRequest Integration](audiobookrequest-integration.md)
- [Official Autobrr Documentation](https://autobrr.com/docs)
- [Autobrr API Reference](https://autobrr.com/api)
