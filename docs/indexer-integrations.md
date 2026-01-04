# Indexer Integrations (Prowlarr & Chaptarr)

MouseTrap can automatically sync your MAM session ID with Prowlarr and/or Chaptarr indexers, ensuring your indexers stay up-to-date without manual intervention. Additionally, it tracks MAM session expiry (90 days) and sends notifications before your session expires.

---

## 🎯 Features

### Automatic MAM ID Sync
- **Multi-service support**: Update Prowlarr, Chaptarr, or both simultaneously
- **Smart detection**: Only updates when MAM ID actually changes
- **Manual override**: Force update with "UPDATE" button
- **Event logging**: All operations logged for audit trail
- **Auto-update on save**: Seamlessly syncs when you update your session

### Session Expiry Tracking
- **90-day monitoring**: MAM sessions expire 90 days after creation
- **Daily checks**: Automated scheduler checks all sessions at 8:00 AM
- **Configurable warnings**: Set notification threshold (default: 7 days before expiry)
- **Multi-channel alerts**: Email, Webhook, or Apprise notifications
- **Secure notifications**: MAM IDs redacted (shows only last 8 characters)

### Testing & Validation
- **Connection testing**: Verify connectivity before enabling
- **Indexer discovery**: Automatically finds MyAnonaMouse indexer ID
- **Real-time feedback**: UI shows test results and indexer status

---

## 📋 Prerequisites

### For Prowlarr
1. **Prowlarr instance** running and accessible
2. **Prowlarr API key** (Settings → General → API Key)
3. **MyAnonamouse indexer** already configured in Prowlarr (implementation: "MyAnonamouse")

### For Chaptarr
1. **Chaptarr instance** running and accessible
2. **Chaptarr API key** (Settings → General → Security)
3. **MyAnonaMouse indexer** already configured in Chaptarr (implementation: "MyAnonaMouse")

### Optional
- **Notification channels** configured (for expiry warnings)

---

## 🚀 Quick Start

### 1. Configure Prowlarr

In your MouseTrap session configuration:

1. **Enable Prowlarr Integration**:
   - Toggle "Enable Prowlarr Integration" switch
   
2. **Enter Prowlarr Details**:
   - **Host**: IP or hostname (e.g., `192.168.1.100` or `prowlarr.local`)
   - **Port**: Prowlarr port (default: `9696`)
   - **API Key**: Your Prowlarr API key from Settings → General

3. **Test Connection**:
   - Click "TEST" button
   - Verify green success message
   - Confirm indexer ID is found

4. **Configure Options**:
   - **Notify Before Expiry (days)**: Default 7 days
   - **Auto-update Prowlarr on Save**: Enabled by default

### 2. Configure Chaptarr

In the same session configuration (below Prowlarr):

1. **Enable Chaptarr Integration**:
   - Toggle "Enable Chaptarr Integration" switch
   
2. **Enter Chaptarr Details**:
   - **Host**: IP or hostname (e.g., `192.168.1.100` or `chaptarr.local`)
   - **Port**: Chaptarr port (default: `8789`)
   - **API Key**: Your Chaptarr API key from Settings → General → Security

3. **Test Connection**:
   - Click "TEST" button
   - Verify green success message
   - Confirm indexer ID is found

4. **Configure Options**:
   - **Notify Before Expiry (days)**: Default 7 days
   - **Auto-update Chaptarr on Save**: Enabled by default

### 3. Update Both Services

- Click the **"UPDATE"** button at the bottom of the Indexer Integrations section
- This will push the current MAM ID to whichever services are enabled
- Check the event log for confirmation of which services were updated

### 4. Enable Expiry Notifications

Edit `/config/notify.yaml`:

```yaml
event_rules:
  mam_session_expiry:
    enabled: true
    email: true      # Send via SMTP
    webhook: true    # Send to webhook
    apprise: false   # Send via Apprise
```

---

## 🔧 Configuration Options

### Service Comparison

| Feature | Prowlarr | Chaptarr |
|---------|----------|----------|
| Default Port | `9696` | `8789` |
| Implementation Name | `MyAnonamouse` | `MyAnonaMouse` (case-insensitive) |
| MAM ID Field | `mamId` | `MamId` |
| API Endpoint | `/api/v1/indexer` | `/api/v1/indexer` |
| Force Save | No | Yes (`?forceSave=true`) |

### Configuration Fields

| Field | Description | Example |
|-------|-------------|---------|
| **Enabled** | Toggle service integration | ✅ On/Off |
| **Host** | Server IP/hostname | `192.168.1.100` |
| **Port** | Service port | `9696` / `8789` |
| **API Key** | Service API key | `abc123...` |
| **Notify Before Expiry** | Warning threshold in days | `7` (default) |
| **Auto-update on Save** | Sync MAM ID on session save | ✅ Enabled |

---

## 🔄 Auto-Update Behavior

### When MAM ID Changes

If you enable "Auto-update on Save" for either service, MouseTrap will automatically push the new MAM ID when you save your session configuration.

**Example Scenarios**:

1. **Prowlarr only**: Updates Prowlarr
2. **Chaptarr only**: Updates Chaptarr
3. **Both enabled**: Updates both services and reports results for each

**Event Log Messages**:
- Success: `"MAM ID synced to Prowlarr, Chaptarr"`
- Partial: `"MAM ID synced to Prowlarr. Failed: Chaptarr (connection timeout)"`
- Failure: `"Failed to sync MAM ID: Prowlarr (401 Unauthorized), Chaptarr (404 Not Found)"`

---

## 📊 Notification Format

### Multi-Service Expiry Notification

When a session with multiple services is approaching expiry:

```
⚠️ MAM Session Expiring Soon!

Session: DirectSession
MAM ID ending in ...N4k3Jrmn
Created: 2025-10-02 19:45
Expires: 2025-12-31 19:45
Days Remaining: 7 days

You will need to refresh your MAM session and update your indexer(s).

Prowlarr: 192.168.0.130:9696
Chaptarr: 192.168.0.140:8789
```

---

## 🧪 Testing

### Test Individual Services

```bash
# Test Prowlarr
curl -X POST http://localhost:39842/api/prowlarr/test \
  -H "Content-Type: application/json" \
  -d '{
    "host": "prowlarr",
    "port": 9696,
    "api_key": "your-api-key"
  }'

# Test Chaptarr
curl -X POST http://localhost:39842/api/chaptarr/test \
  -H "Content-Type: application/json" \
  -d '{
    "host": "chaptarr",
    "port": 8789,
    "api_key": "your-api-key"
  }'
```

### Update Individual Services

```bash
# Update Prowlarr only
curl -X POST http://localhost:39842/api/prowlarr/update \
  -H "Content-Type: application/json" \
  -d '{"label": "DirectSession"}'

# Update Chaptarr only
curl -X POST http://localhost:39842/api/chaptarr/update \
  -H "Content-Type: application/json" \
  -d '{"label": "DirectSession"}'

# Update all enabled services
curl -X POST http://localhost:39842/api/indexer/update \
  -H "Content-Type: application/json" \
  -d '{"label": "DirectSession"}'
```

---

## 🔍 Troubleshooting

### Connection Test Fails

**Prowlarr**:
- Verify Prowlarr is running: `curl http://prowlarr:9696/api/v1/health`
- Check API key in Settings → General
- Verify implementation name is exactly "MyAnonamouse"

**Chaptarr**:
- Verify Chaptarr is running: `curl http://chaptarr:8789/api/v1/health`
- Check API key in Settings → General → Security
- Implementation name is case-insensitive ("MyAnonaMouse" or "myanonamouse")

### Indexer Not Found

**Problem**: "MyAnonaMouse indexer not found"

**Solutions**:
- Add the indexer in your service first
- For Prowlarr: Check implementation is "MyAnonamouse" (lowercase 'n')
- For Chaptarr: Implementation can be "MyAnonaMouse" (uppercase 'N') - case-insensitive

### Partial Update Success

**Problem**: One service updates, the other fails

**What happens**:
- MouseTrap continues updating all enabled services even if one fails
- Event log shows which services succeeded and which failed
- You'll see a warning alert in the UI with details

**Solutions**:
- Check the failed service's connection and API key
- Use individual TEST buttons to diagnose issues
- Check event log for detailed error messages

---

## 📝 Configuration Example

Example session configuration in YAML:

```yaml
label: DirectSession
mam:
  mam_id: "your-mam-id-here"
  session_type: ip
  ip_monitoring_mode: auto
mam_session_created_date: "2025-01-03T10:00:00"
prowlarr:
  enabled: true
  host: "prowlarr"
  port: 9696
  api_key: "prowlarr-api-key"
  auto_update_on_save: true
  notify_before_expiry_days: 7
chaptarr:
  enabled: true
  host: "chaptarr"
  port: 8789
  api_key: "chaptarr-api-key"
  auto_update_on_save: true
  notify_before_expiry_days: 7
```

---

## 🎉 Migration from Prowlarr-only

If you're upgrading from a version with only Prowlarr support:

1. Your existing Prowlarr configuration remains unchanged
2. Chaptarr section appears below Prowlarr in the UI
3. Enable Chaptarr if you want to use it
4. Old "UPDATE PROWLARR" buttons are now "UPDATE" buttons
5. The UPDATE button syncs to whichever services you have enabled
6. Event logs now show which service(s) were updated

No action required - your existing configuration continues to work!
