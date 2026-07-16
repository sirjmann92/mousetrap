# Prowlarr Integration

MouseTrap can automatically sync your MAM session ID with Prowlarr's MyAnonamouse indexer, ensuring your indexer stays up-to-date without manual intervention. Additionally, it detects when MAM has actually invalidated your session cookie and sends a notification so you can refresh it.

---

## 🎯 Features

### Automatic MAM ID Sync
- **Smart detection**: Only updates when MAM ID actually changes
- **Manual override**: Force update with "UPDATE PROWLARR" button
- **Event logging**: All operations logged for audit trail
- **Auto-update on save**: Seamlessly syncs when you update your session

### MAM Session Validity Detection
- **Response-based, not time-based**: MouseTrap pings MAM's seedbox API daily and classifies the response using MAM's own documented error messages — it doesn't guess based on elapsed time
- **Fires on the real signal**: Only a confirmed "cookie is dead" response (MAM's `Invalid session` / `Invalid session - Invalid Cookie` messages) triggers a notification — IP/ASN lock mismatches and MAM session-settings issues are surfaced differently since regenerating your cookie wouldn't fix those
- **Multi-channel alerts**: Email, Webhook, Apprise, or Pushover notifications
- **Secure notifications**: MAM IDs redacted (shows only last 8 characters)

### Testing & Validation
- **Connection testing**: Verify Prowlarr connectivity before enabling
- **Indexer discovery**: Automatically finds MyAnonamouse indexer ID
- **Real-time feedback**: UI shows test results and indexer status

---

## 📋 Prerequisites

1. **Prowlarr instance** running and accessible
2. **Prowlarr API key** (Settings → General → API Key)
3. **MyAnonamouse indexer** already configured in Prowlarr
4. **Notification channels** configured (optional, for validity alerts)

---

## 🚀 Quick Start

### 1. Configure Prowlarr Settings

In your MouseTrap session configuration:

1. **Enable Prowlarr Integration**:
   - Toggle "Enable Prowlarr Integration" switch

2. **Enter Prowlarr Details**:
   - **Host**: Hostname or IP only — do not include `http://` or a port (e.g., `192.168.1.100`, `prowlarr.local`, or `prowlarr.example.com`). For HTTPS reverse proxies use port `443`.
   - **Port**: Prowlarr port (default: `9696`; use `443` for HTTPS reverse proxy)
   - **API Key**: Your Prowlarr API key from Settings → General

3. **Test Connection**:
   - Click "TEST PROWLARR" button
   - Verify green success message
   - Confirm indexer ID is found

4. **Save Configuration**:
   - Click "Save Configuration"
   - If MAM ID changed, Prowlarr updates automatically
   - Check event log for confirmation

### 2. Enable Session Validity Notifications

Edit `/config/notify.yaml`:

```yaml
event_rules:
  mam_session_invalid:
    enabled: true
    email: true      # Send via SMTP
    webhook: true    # Send to webhook
    apprise: false   # Send via Apprise
    pushover: false  # Send via Pushover
```

Configure your notification channels (SMTP, Webhook, Apprise, or Pushover) in the same file, or via the Notifications card in the UI.

---

## 🔧 Configuration Options

### Prowlarr Settings

| Field | Description | Example |
|-------|-------------|---------|
| **Enabled** | Toggle Prowlarr integration | ✅ On/Off |
| **Host** | Prowlarr server IP/hostname | `192.168.1.100` |
| **Port** | Prowlarr service port | `9696` |
| **API Key** | Prowlarr API key | `abc123...` |

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

When MAM confirms your session's mam_id is invalid, you'll receive:

### Email Subject
```
[MouseTrap] mam_session_invalid - INVALID
```

### Email Body
```
Session: DirectSession
MAM ID ending in ...N4k3Jrmn

MAM reports this session's mam_id is invalid.
MAM message: Invalid session

You will need to generate a new MAM session ID and update it in MouseTrap.
```

**Security Note**: Only the last 8 characters of your MAM ID are shown, similar to credit card masking.

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

### Session Invalid Notifications Not Received

**Problem**: No notification sent even though MAM has invalidated the session

**Solutions**:
- Check `/config/notify.yaml` has `mam_session_invalid: enabled: true`
- Verify notification channels (SMTP/Webhook/Apprise/Pushover) are configured
- Test notification channels with other events first
- Check logs for keepalive/auto-update errors: `docker compose logs mousetrap | grep -E "Keepalive|AutoUpdate"`
- Note: a `403` from MAM isn't always a dead cookie — IP/ASN lock mismatches and MAM session-settings issues (see [issue #28](https://github.com/sirjmann92/mousetrap/issues/28)) are intentionally *not* classified as "invalid" since a new cookie wouldn't fix them; check the event log for the actual MAM message

### Wrong Timezone in Notifications

**Problem**: Notification times don't match your timezone

**Solutions**:
- Set `TZ` environment variable in `compose.yaml` (e.g., `TZ=America/Chicago`)
- Restart container after changing timezone
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
| `mam_session_invalid` | MAM confirmed this session's mam_id is dead |

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

[2025-12-24 08:00:15] mam_session_invalid - INVALID
  MAM reports this session's mam_id is invalid.
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

### Validity Check Flow

```
Daily keepalive ping (dynamicSeedbox.php), or any IP/ASN-triggered seedbox update
    ↓
Classify MAM's response (see classify_mam_response)
    ↓
"Invalid session" / "Invalid session - Invalid Cookie"? ── No → No action
    ↓ Yes
Already notified for this session? ── Yes → No action (avoid repeat alerts)
    ↓ No
Send notification (SMTP/Webhook/Apprise/Pushover)
    ↓
Mark session as notified (cleared automatically once MAM responds OK again)
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

### Prowlarr Management
- **One source of truth**: Let MouseTrap manage MAM ID updates
- **Verify updates**: Check Prowlarr UI after updates to confirm
- **Backup Prowlarr**: Export Prowlarr config before enabling auto-update
- **Test first**: Use "TEST PROWLARR" before enabling auto-update

### Monitoring
- **Check event log**: Regularly review for failed updates
- **Enable notifications**: Get alerts when MAM invalidates your session
- **Read the MAM message**: The notification includes MAM's own error text — it tells you whether you need a new cookie or just a config fix (e.g. an IP/ASN lock mismatch)

---

## 📅 Session Refresh Workflow

When MouseTrap notifies you that MAM has invalidated your session:

1. **Get notification** from MouseTrap, including MAM's own error message
2. **Log into MAM** with your browser
3. **Generate new session ID**:
   - MyAnonamouse → Security → API Credentials
   - Generate new session ID
4. **Update MouseTrap**:
   - Open session config
   - Paste new MAM ID
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
- ✅ Prowlarr searches complete successfully
- ✅ No `mam_session_invalid` events in the log

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
