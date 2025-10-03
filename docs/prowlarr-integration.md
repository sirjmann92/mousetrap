# Prowlarr Integration

MouseTrap can automatically sync your MAM session ID with Prowlarr's MyAnonamouse indexer, ensuring your indexer stays up-to-date without manual intervention. Additionally, it tracks MAM session expiry (90 days) and sends notifications before your session expires.

---

## 🎯 Features

### Automatic MAM ID Sync
- **Smart detection**: Only updates when MAM ID actually changes
- **Manual override**: Force update with "UPDATE PROWLARR" button
- **Event logging**: All operations logged for audit trail
- **Auto-update on save**: Seamlessly syncs when you update your session

### Session Expiry Tracking
- **90-day monitoring**: MAM sessions expire 90 days after creation
- **Daily checks**: Automated scheduler checks all sessions at 8:00 AM
- **Configurable warnings**: Set notification threshold (default: 7 days before expiry)
- **Multi-channel alerts**: Email, Webhook, or Apprise notifications
- **Secure notifications**: MAM IDs redacted (shows only last 8 characters)

### Testing & Validation
- **Connection testing**: Verify Prowlarr connectivity before enabling
- **Indexer discovery**: Automatically finds MyAnonamouse indexer ID
- **Test notifications**: Manual trigger to validate notification workflow
- **Real-time feedback**: UI shows test results and indexer status

---

## 📋 Prerequisites

1. **Prowlarr instance** running and accessible
2. **Prowlarr API key** (Settings → General → API Key)
3. **MyAnonamouse indexer** already configured in Prowlarr
4. **Notification channels** configured (optional, for expiry warnings)

---

## 🚀 Quick Start

### 1. Configure Prowlarr Settings

In your MouseTrap session configuration:

1. **Enable Prowlarr Integration**:
   - Toggle "Enable Prowlarr Integration" switch
   
2. **Enter Prowlarr Details**:
   - **Host**: IP or hostname (e.g., `192.168.1.100` or `prowlarr.local`)
   - **Port**: Prowlarr port (default: `9696`)
   - **API Key**: Your Prowlarr API key from Settings → General

3. **Test Connection**:
   - Click "TEST PROWLARR" button
   - Verify green success message
   - Confirm indexer ID is found

4. **Set MAM Session Created Date**:
   - Click "NOW" button to use current server time
   - Or manually select the date/time when you created your MAM session

5. **Configure Expiry Notification** (optional):
   - Set "Notify Before Expiry (days)" (default: 7)
   - This sends a warning X days before the 90-day expiry

6. **Save Configuration**:
   - Click "Save Configuration"
   - If MAM ID changed, Prowlarr updates automatically
   - Check event log for confirmation

### 2. Enable Expiry Notifications

Edit `/config/notify.yaml`:

```yaml
event_rules:
  mam_session_expiry:
    enabled: true
    email: true      # Send via SMTP
    webhook: true    # Send to webhook
    apprise: false   # Send via Apprise
```

Configure your notification channels (SMTP, Webhook, or Apprise) in the same file.

---

## 🔧 Configuration Options

### Prowlarr Settings

| Field | Description | Example |
|-------|-------------|---------|
| **Enabled** | Toggle Prowlarr integration | ✅ On/Off |
| **Host** | Prowlarr server IP/hostname | `192.168.1.100` |
| **Port** | Prowlarr service port | `9696` |
| **API Key** | Prowlarr API key | `abc123...` |
| **MAM Session Created** | When session was created | `2025-10-02 19:45` |
| **Notify Before Expiry** | Warning threshold in days | `7` (default) |

### Auto-Update Behavior

**Triggers automatic update:**
- ✅ MAM ID changes
- ✅ Manual "UPDATE PROWLARR" button

**Does NOT trigger update:**
- ❌ Saving config without MAM ID change
- ❌ Changing other session settings
- ❌ Modifying automation settings

---

## 📊 Notification Format

When a session is approaching expiry, you'll receive:

### Email Subject
```
[MouseTrap] mam_session_expiry - WARNING
```

### Email Body
```
⚠️ MAM Session Expiring Soon!

Session: DirectSession
MAM ID ending in ...N4k3Jrmn
Created: 2025-10-02 19:45
Expires: 2025-12-31 19:45
Days Remaining: 7 days

You will need to refresh your MAM session and update Prowlarr.
Prowlarr: 192.168.0.130:9696
```

**Security Note**: Only the last 8 characters of your MAM ID are shown, similar to credit card masking.

---

## 🧪 Testing Expiry Notifications

### Using the Test Script

Run the included test script from your host:

```bash
cd /home/jase/docker/mousetrap
python3 tests/test_expiry_notification.py DirectSession
```

The script will:
1. Show your session configuration
2. Display current expiry status
3. Send a test notification
4. Show expected notification format

### Using the API Endpoint

Send a POST request to trigger a test notification:

```bash
curl -X POST http://localhost:39842/api/prowlarr/test_expiry_notification \
  -H "Content-Type: application/json" \
  -d '{"label": "DirectSession"}'
```

Response:
```json
{
  "success": true,
  "message": "Test notification sent for session 'DirectSession'",
  "details": {
    "created": "2025-10-02 19:45",
    "expires": "2025-12-31 19:45",
    "days_remaining": 89
  }
}
```

---

## 🔍 Troubleshooting

### Connection Test Fails

**Problem**: "TEST PROWLARR" button shows error

**Solutions**:
- Verify Prowlarr is running and accessible
- Check host/port are correct
- Confirm API key is valid (copy from Prowlarr → Settings → General)
- Test network connectivity: `curl http://prowlarr-host:9696/api/v1/health`
- Check firewall rules

### Indexer Not Found

**Problem**: "MyAnonamouse indexer not found in Prowlarr"

**Solutions**:
- Ensure MyAnonamouse indexer is configured in Prowlarr
- Check indexer is enabled (not disabled)
- Verify indexer name is exactly "MyAnonamouse" (case-sensitive)
- Try refreshing Prowlarr UI

### Auto-Update Not Working

**Problem**: MAM ID doesn't update in Prowlarr

**Solutions**:
- Verify MAM ID actually changed (smart detection prevents unnecessary updates)
- Check event log for update attempts and errors
- Use "UPDATE PROWLARR" button to force manual update
- Enable `LOGLEVEL=DEBUG` and check logs for detailed error messages
- Verify Prowlarr API key has write permissions

### Expiry Notifications Not Received

**Problem**: No notification sent before expiry

**Solutions**:
- Check `/config/notify.yaml` has `mam_session_expiry: enabled: true`
- Verify notification channels (SMTP/Webhook/Apprise) are configured
- Test notification channels with other events first
- Run test script: `python3 tests/test_expiry_notification.py DirectSession`
- Check logs for scheduler errors: `docker compose logs mousetrap | grep ExpiryCheck`
- Verify "MAM Session Created" date is set correctly

### Wrong Timezone in Notifications

**Problem**: Notification times don't match your timezone

**Solutions**:
- Set `TZ` environment variable in `compose.yaml` (e.g., `TZ=America/Chicago`)
- Restart container after changing timezone
- Use "NOW" button for current server time (respects TZ setting)
- Verify timezone with: `docker compose exec mousetrap date`

---

## 📈 Event Log

All Prowlarr operations are logged to the UI event log:

### Event Types

| Event | Description |
|-------|-------------|
| `prowlarr_auto_update` | Automatic MAM ID sync on save |
| `prowlarr_manual_update` | Manual update via button |
| `prowlarr_test` | Connection test result |
| `prowlarr_find_indexer` | Indexer discovery |
| `mam_session_expiry` | Expiry warning notification |

### Viewing Logs

1. Open MouseTrap UI
2. Click "Event Log" tab
3. Filter by session or event type
4. Review success/failure status

Example log entries:
```
[2025-10-02 19:45:12] prowlarr_auto_update - SUCCESS
  MAM ID updated in Prowlarr (indexer: 42)

[2025-10-02 19:46:33] prowlarr_test - SUCCESS
  Connection successful, MyAnonamouse indexer found (ID: 42)

[2025-12-24 08:00:15] mam_session_expiry - WARNING
  Session expires in 7 days
```

---

## 🔐 Security Best Practices

### API Key Protection
- Store API keys in environment variables or Docker secrets
- Never commit API keys to version control
- Rotate API keys periodically
- Use read-write API keys only (Prowlarr requires write access)

### MAM ID Redaction
- Notifications show only last 8 characters: `MAM ID ending in ...abcd1234`
- Event logs may show full MAM ID (stored locally in `/config`)
- Logs directory is mounted locally (protect with appropriate permissions)

### Network Security
- Use internal Docker networks for Prowlarr communication
- Consider VPN/proxy for MAM API calls
- Enable HTTPS for Prowlarr if exposed externally
- Use firewall rules to restrict access

---

## 🔄 How It Works

### Auto-Update Flow

```
User saves session config
    ↓
MAM ID changed? ── No → Skip update
    ↓ Yes
Load old config
    ↓
Compare MAM IDs
    ↓
Different? ── No → Skip update
    ↓ Yes
Test Prowlarr connection
    ↓
Find MyAnonamouse indexer
    ↓
Update indexer MAM ID
    ↓
Log event to UI event log
    ↓
Show success notification
```

### Expiry Check Flow

```
Daily at 8:00 AM (server time)
    ↓
Load all sessions
    ↓
For each session:
    ↓
  Prowlarr enabled? ── No → Skip
    ↓ Yes
  MAM Session Created set? ── No → Skip
    ↓ Yes
  Calculate expiry (created + 90 days)
    ↓
  Calculate days remaining
    ↓
  Days ≤ notify threshold? ── No → Skip
    ↓ Yes
  Send notification (SMTP/Webhook/Apprise)
    ↓
  Log event to UI event log
```

---

## 🛠️ API Reference

### POST `/api/prowlarr/test`
Test Prowlarr connection and find MyAnonamouse indexer.

**Request**:
```json
{
  "host": "192.168.1.100",
  "port": 9696,
  "api_key": "your_api_key"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Connection successful",
  "indexer_id": 42,
  "indexer_name": "MyAnonamouse"
}
```

### POST `/api/prowlarr/update_mam_id`
Update MAM ID in Prowlarr indexer.

**Request**:
```json
{
  "label": "DirectSession",
  "force": false
}
```

**Response**:
```json
{
  "success": true,
  "message": "Prowlarr indexer updated successfully",
  "indexer_id": 42,
  "changes": {
    "old_mam_id": "old_value...",
    "new_mam_id": "new_value..."
  }
}
```

### POST `/api/prowlarr/test_expiry_notification`
Send test expiry notification.

**Request**:
```json
{
  "label": "DirectSession"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Test notification sent for session 'DirectSession'",
  "details": {
    "created": "2025-10-02 19:45",
    "expires": "2025-12-31 19:45",
    "days_remaining": 89
  }
}
```

### GET `/api/server_time`
Get current server time in ISO format.

**Response**:
```json
{
  "server_time": "2025-10-02T19:45:00-05:00"
}
```

---

## 💡 Tips & Best Practices

### Session Creation Date
- **Use NOW button**: Automatically uses server timezone
- **Set immediately**: Record date when you first create your MAM session
- **Track manually**: If you don't know exact creation date, estimate conservatively (earlier is safer)

### Notification Timing
- **7 days default**: Good balance between warning time and noise
- **Adjust threshold**: Increase for slower response times (e.g., 14 days)
- **Multiple sessions**: Each session has independent expiry tracking

### Prowlarr Management
- **One source of truth**: Let MouseTrap manage MAM ID updates
- **Verify updates**: Check Prowlarr UI after updates to confirm
- **Backup Prowlarr**: Export Prowlarr config before enabling auto-update
- **Test first**: Use "TEST PROWLARR" before enabling auto-update

### Monitoring
- **Check event log**: Regularly review for failed updates
- **Enable notifications**: Get alerts for expiry warnings
- **Set calendar reminder**: Backup reminder at 85 days (5 days before default warning)
- **Document rotation**: Keep track of when you refresh MAM sessions

---

## 📅 Session Refresh Workflow

When your MAM session expires (or is about to):

1. **Get notification** from MouseTrap (7 days before expiry)
2. **Log into MAM** with your browser
3. **Generate new session ID**:
   - MyAnonamouse → Security → API Credentials
   - Generate new session ID
4. **Update MouseTrap**:
   - Open session config
   - Paste new MAM ID
   - Click "NOW" button for new creation date
   - Save configuration
5. **Verify Prowlarr update**:
   - Check event log for success
   - Open Prowlarr → Indexers → MyAnonamouse
   - Verify Cookie field shows new MAM ID
6. **Test Prowlarr**:
   - Test indexer in Prowlarr
   - Try a search to confirm working

---

## 🎉 Success Indicators

You'll know everything is working when:

- ✅ "TEST PROWLARR" shows green success message
- ✅ Event log shows `prowlarr_auto_update - SUCCESS`
- ✅ Prowlarr indexer shows updated MAM ID
- ✅ Test notification received via configured channels
- ✅ Prowlarr searches complete successfully
- ✅ Event log shows no errors for 90 days

---

## 🆘 Support

If you encounter issues:

1. Check this troubleshooting section
2. Review event log for error details
3. Enable `LOGLEVEL=DEBUG` for verbose logging
4. Check container logs: `docker compose logs mousetrap`
5. Test notification channels independently
6. Create GitHub issue with logs and configuration (redact sensitive data)

---

## 🔗 Related Documentation

- **[Features Guide](features-guide.md)**: Overview of all MouseTrap features
- **[API Reference](api-reference.md)**: Complete API documentation
- **[Troubleshooting](troubleshooting.md)**: General troubleshooting guide
- **[Notifications](features-guide.md#notifications)**: Notification configuration
- **[Event Log](purchase_logging_and_event_log.md)**: Event logging details
