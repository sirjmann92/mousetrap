# AudioBookRequest Integration

MouseTrap can automatically update your MyAnonamouse session ID in [AudioBookRequest](https://github.com/markbeep/AudioBookRequest) when it changes.

## Overview

AudioBookRequest is an audiobook request and management system. This integration allows MouseTrap to keep your MAM indexer credentials up-to-date automatically.

## Features

- **Auto-update on Save**: Automatically sync your MAM session ID to AudioBookRequest when it changes
- **Test Connection**: Verify connectivity and authentication before enabling
- **Expiry Notifications**: Get notified before your MAM session expires (configurable)
- **Bearer Token Authentication**: Secure API access using your AudioBookRequest API key

## Configuration

### Prerequisites

1. AudioBookRequest installed and running
2. MyAnonamouse indexer configured in AudioBookRequest
3. AudioBookRequest API key generated

### Getting Your API Key

1. Log into AudioBookRequest
2. Navigate to **Settings → API Keys**
3. Generate a new API key
4. Copy the key for use in MouseTrap

### Setup in MouseTrap

1. Open your session configuration
2. Expand the **Indexer Integrations** section
3. Enable **AudioBookRequest Integration**
4. Fill in the following fields:
   - **Host**: AudioBookRequest hostname or IP (e.g., `localhost`)
   - **Port**: AudioBookRequest port (default: `8000`)
   - **API Key**: Your AudioBookRequest API key
5. Click **TEST** to verify connectivity
6. Set **Notify Before Expiry** days (default: 7 days)
7. Enable **Auto-update AudioBookRequest on Save** if desired
8. Click **SAVE** to save your configuration

## How It Works

### Authentication

AudioBookRequest uses **Bearer token authentication**. MouseTrap includes your API key in the `Authorization` header for all requests:

```http
Authorization: Bearer <your-api-key>
```

### API Endpoints Used

- **GET /api/indexers/configurations**: Verify connectivity and check if MyAnonamouse indexer exists
- **PATCH /api/indexers/MyAnonamouse**: Update the `mam_session_id` field

### Field Mapping

MouseTrap internally maps its `mam_id` field to AudioBookRequest's `mam_session_id` field. This mapping is transparent to the user.

## Auto-Update Behavior

When **Auto-update AudioBookRequest on Save** is enabled:

1. MouseTrap detects when your MAM ID changes
2. Automatically sends a PATCH request to AudioBookRequest
3. Updates the `mam_session_id` field for the MyAnonamouse indexer
4. Logs the result in the UI event log

## Manual Updates

You can manually trigger an update at any time:

1. Navigate to the **Status** tab
2. Click the **UPDATE** button next to "Update Indexer(s)"
3. MouseTrap will sync to all enabled integrations (Prowlarr, Chaptarr, Jackett, and/or AudioBookRequest)

## Troubleshooting

### Connection Test Fails

**Error: "Authentication failed. Check API key."**
- Verify your API key is correct
- Ensure the API key hasn't been revoked in AudioBookRequest

**Error: "Cannot connect to host:port. Check host and port."**
- Verify AudioBookRequest is running
- Check the host and port are correct
- If using Docker, ensure network connectivity between containers

**Error: "MyAnonamouse indexer not found. Please configure it first."**
- Add the MyAnonamouse indexer in AudioBookRequest before enabling this integration

### Auto-Update Not Working

1. Verify **Auto-update AudioBookRequest on Save** is enabled
2. Check that your MAM ID actually changed (auto-update only triggers on change)
3. Review the UI event log for error messages
4. Test the connection manually to ensure credentials are still valid

### API Errors

**HTTP 403 Forbidden**
- Your API key may lack necessary permissions
- Try generating a new API key in AudioBookRequest

**HTTP 404 Not Found**
- The MyAnonamouse indexer name must be exactly `MyAnonamouse` (case-sensitive)
- Verify the indexer exists in AudioBookRequest

## Default Values

| Setting | Default Value |
|---------|--------------|
| Port | 8000 |
| Notify Before Expiry | 7 days |
| Auto-update on Save | Disabled |

## API Reference

### Test Connection

```http
POST /api/audiobookrequest/test
Content-Type: application/json

{
  "host": "localhost",
  "port": 8000,
  "api_key": "your-api-key"
}
```

### Manual Update

```http
POST /api/audiobookrequest/update
Content-Type: application/json

{
  "label": "Session1",
  "mam_id": "your-new-mam-id"  // optional, uses session's MAM ID if omitted
}
```

## Integration with Other Services

AudioBookRequest can be used **alongside** Prowlarr, Chaptarr, and Jackett integrations. All four can be enabled simultaneously, and MouseTrap will update all enabled services when your MAM ID changes.

## Security Notes

- API keys are stored in your session configuration file
- Never commit your session configuration to public repositories
- MouseTrap's `.gitignore` excludes `config/` by default
- Use environment variables or secrets management for production deployments

## See Also

- [Prowlarr Integration](./prowlarr-integration.md)
- [Chaptarr Integration](./chaptarr-integration.md)
- [Jackett Integration](./jackett-integration.md)
- [AudioBookRequest Documentation](https://markbeep.github.io/AudioBookRequest/)
- [AudioBookRequest API Docs](https://markbeep.github.io/AudioBookRequest/docs/tutorials/api/indexers/)
