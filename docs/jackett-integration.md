# Jackett Integration

## Overview

The Jackett integration allows MouseTrap to automatically update the MAM ID in your Jackett MyAnonamouse indexer configuration when you switch sessions.

## Key Differences from Prowlarr/Chaptarr

Unlike Prowlarr and Chaptarr, Jackett:
- **Does not have a full admin API** for managing indexer configurations
- **Stores indexer configs as individual JSON files** on disk
- **Requires file system access** to the Jackett config directory
- The integration uses **direct file editing** rather than API calls

## Setup Requirements

1. **File System Access**: MouseTrap needs access to your Jackett configuration directory
2. **MyAnonamouse Indexer**: You must have a MyAnonamouse indexer configured in Jackett
3. **MAM ID Field**: The indexer config must have a `mam_id` field

## Configuration

In your session configuration, add the following Jackett settings:

```yaml
jackett:
  enabled: true
  host: "192.168.0.130"  # Your Jackett instance IP/hostname
  port: 9117              # Jackett port (default: 9117)
  api_key: "your_jackett_api_key"
  config_path: "/path/to/jackett/config/Jackett"  # Path to Jackett config directory
```

### Finding Your Config Path

The config path should point to the directory containing your Jackett configuration. Common paths:

- **Docker**: `/path/to/jackett/config/Jackett`
- **Linux**: `~/.config/Jackett`
- **Windows**: `C:\ProgramData\Jackett`

The integration looks for: `{config_path}/Indexers/myanonamouse.json`

## API Endpoints

### Test Connection
**POST** `/api/jackett/test`

Tests Jackett connectivity and verifies the MAM indexer config file exists.

**Request:**
```json
{
  "host": "192.168.0.130",
  "port": 9117,
  "api_key": "your_api_key",
  "config_path": "/path/to/jackett/config/Jackett"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Connected successfully. Found MAM config file.",
  "config_file": "/path/to/jackett/config/Jackett/Indexers/myanonamouse.json"
}
```

### Update MAM ID
**POST** `/api/jackett/update`

Updates the MAM ID in the Jackett indexer configuration file.

**Request:**
```json
{
  "label": "session_name",
  "mam_id": "new_mam_id_here"  // optional, uses session's MAM ID if not provided
}
```

**Response:**
```json
{
  "success": true,
  "message": "MAM ID updated successfully in Jackett config file",
  "old_mam_id": "previous_value",
  "file_path": "/path/to/jackett/config/Jackett/Indexers/myanonamouse.json"
}
```

## How It Works

1. **Session Switch**: When you change sessions in MouseTrap
2. **Config Lookup**: The integration finds the MyAnonamouse config file
3. **Read Config**: Reads the current JSON configuration
4. **Update Field**: Finds and updates the `mam_id` field value
5. **Write Back**: Saves the updated configuration to disk
6. **Jackett Reload**: Jackett automatically detects the file change and reloads

## Creating a Test Indexer

Use the provided helper script to create a minimal MyAnonamouse indexer for testing:

```bash
python tests/create_test_jackett_indexer.py
```

This creates: `/path/to/jackett/config/Jackett/Indexers/myanonamouse.json`

## Testing the Integration

Run the integration test suite:

```bash
python tests/test_jackett_integration.py
```

This will:
1. Test Jackett connectivity (basic check)
2. Find the MAM indexer config file
3. Read the current configuration
4. Update the MAM ID
5. Verify the update was successful

## Troubleshooting

### "MyAnonamouse indexer not found"

The integration looks for a file named `myanonamouse.json` (case-insensitive) in the Indexers directory. Ensure:
1. You have created a MyAnonamouse indexer in Jackett's web UI
2. The config path is correct
3. The Indexers directory exists

### File Permission Errors

Ensure MouseTrap has read/write access to the Jackett config directory:
```bash
# Check permissions
ls -la /path/to/jackett/config/Jackett/Indexers/

# Fix permissions if needed (adjust user/group as needed)
sudo chown -R your_user:your_group /path/to/jackett/config/
```

### Changes Not Appearing in Jackett

Jackett typically auto-reloads when config files change. If not:
1. Restart your Jackett instance
2. Check Jackett logs for errors
3. Verify the JSON file is valid

## Implementation Details

### File Structure

The MyAnonamouse indexer config follows this structure:

```json
{
  "id": "myanonamouse",
  "name": "MyAnonamouse",
  "configData": [
    {
      "id": "mam_id",
      "type": "text",
      "name": "MAM ID",
      "value": "your_mam_id_here"
    }
  ]
}
```

### Integration Code

The integration is implemented in:
- **Backend Module**: `backend/jackett_integration.py`
- **API Endpoints**: `backend/app.py` (`/api/jackett/*`)
- **Test Suite**: `tests/test_jackett_integration.py`

## Unified Indexer Update

The Jackett integration is included in the unified indexer update endpoint:

**POST** `/api/indexer/update`

This endpoint updates all enabled indexer integrations (Prowlarr, Chaptarr, and Jackett) in one call.
