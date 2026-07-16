# Indexer Integrations

MouseTrap can automatically sync your MAM session ID with Prowlarr, Chaptarr, Jackett, AudioBookRequest, and/or Autobrr, ensuring your indexers stay up-to-date without manual intervention. Additionally, it detects when MAM has actually invalidated your session cookie and sends a notification so you can refresh it.

---

## 🎯 Features

### Automatic MAM ID Sync
- **Multi-service support**: Update Prowlarr, Chaptarr, Jackett, AudioBookRequest, and/or Autobrr simultaneously
- **Smart detection**: Only updates when MAM ID actually changes
- **Manual override**: Force update with "UPDATE" button
- **Event logging**: All operations logged for audit trail
- **Auto-update on save**: Seamlessly syncs when you update your session

### MAM Session Validity Detection
- **Response-based, not time-based**: a daily keepalive ping to MAM's seedbox API is classified using MAM's own documented error messages, rather than guessing from elapsed time
- **Fires on the real signal**: only a confirmed "cookie is dead" response triggers a notification — IP/ASN lock mismatches and MAM session-settings issues are surfaced differently, since regenerating your cookie wouldn't fix those
- **Multi-channel alerts**: Email, Webhook, Apprise, or Pushover notifications
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

### For Jackett
1. **Jackett instance** running and accessible
2. **Jackett API key** (found in top-right corner or server settings)
3. **MyAnonamouse indexer** added and configured in Jackett

### For AudioBookRequest
1. **AudioBookRequest instance** running and accessible
2. **AudioBookRequest API key** (Settings → Account → API Keys)
3. **MyAnonamouse indexer** configured in AudioBookRequest

### For Autobrr
1. **Autobrr instance** running and accessible
2. **Autobrr API key** (Settings → API Keys)
3. **MyAnonamouse indexer** configured in Autobrr

### Optional
- **Notification channels** configured (for session-invalid alerts)

---

## 🚀 Quick Start

### 1. Configure Prowlarr

In your MouseTrap session configuration:

1. **Enable Prowlarr Integration**:
   - Toggle "Enable Prowlarr Integration" switch
   
2. **Enter Prowlarr Details**:
   - **Host**: Hostname or IP only — do not include `http://` or a port (e.g., `192.168.1.100`, `prowlarr.local`, or `prowlarr.example.com`). For HTTPS reverse proxies use port `443`.
   - **Port**: Prowlarr port (default: `9696`; use `443` for HTTPS reverse proxy)
   - **API Key**: Your Prowlarr API key from Settings → General

3. **Test Connection**:
   - Click "TEST" button
   - Verify green success message
   - Confirm indexer ID is found

4. **Configure Options**:
   - **Auto-update Prowlarr on Save**: Enabled by default

### 2. Configure Chaptarr

In the same session configuration (below Prowlarr):

1. **Enable Chaptarr Integration**:
   - Toggle "Enable Chaptarr Integration" switch
   
2. **Enter Chaptarr Details**:
   - **Host**: Hostname or IP only — do not include `http://` or a port (e.g., `192.168.1.100`, `chaptarr.local`, or `chaptarr.example.com`). For HTTPS reverse proxies use port `443`.
   - **Port**: Chaptarr port (default: `8789`; use `443` for HTTPS reverse proxy)
   - **API Key**: Your Chaptarr API key from Settings → General → Security

3. **Test Connection**:
   - Click "TEST" button
   - Verify green success message
   - Confirm indexer ID is found

4. **Configure Options**:
   - **Auto-update Chaptarr on Save**: Enabled by default

### 3. Configure Jackett (Optional)

1. **Enable Jackett Integration**:
   - Toggle "Enable Jackett Integration" switch
   
2. **Enter Jackett Details**:
   - **Host**: Hostname or IP only — do not include `http://` or a port (e.g., `192.168.1.100`, `jackett.local`, or `jackett.example.com`). For HTTPS reverse proxies use port `443`.
   - **Port**: Jackett port (default: `9117`; use `443` for HTTPS reverse proxy)
   - **API Key**: Your Jackett API key (top-right corner)
   - **Admin Password**: Optional, only if Jackett has admin password protection

3. **Test Connection**:
   - Click "TEST" button
   - Verify green success message
   - Confirm MyAnonamouse indexer found

4. **Configure Options**:
   - **Auto-update Jackett on Save**: Disabled by default

### 4. Configure AudioBookRequest (Optional)

1. **Enable AudioBookRequest Integration**:
   - Toggle "Enable AudioBookRequest Integration" switch
   
2. **Enter AudioBookRequest Details**:
   - **Host**: Hostname or IP only — do not include `http://` or a port (e.g., `192.168.1.100` or `localhost`). For HTTPS reverse proxies use port `443`.
   - **Port**: AudioBookRequest port (default: `8000`; use `443` for HTTPS reverse proxy)
   - **API Key**: Your AudioBookRequest API key (Settings → Account → API Keys)

3. **Test Connection**:
   - Click "TEST" button
   - Verify green success message
   - Confirm MyAnonamouse indexer status

4. **Configure Options**:
   - **Auto-update AudioBookRequest on Save**: Disabled by default

### 5. Configure Autobrr (Optional)

1. **Enable Autobrr Integration**:
   - Toggle "Enable Autobrr Integration" switch
   
2. **Enter Autobrr Details**:
   - **Host**: Hostname or IP only — do not include `http://` or a port (e.g., `192.168.1.100` or `localhost`). For HTTPS reverse proxies use port `443`.
   - **Port**: Autobrr port (default: `7474`; use `443` for HTTPS reverse proxy)
   - **API Key**: Your Autobrr API key (Settings → API Keys)

3. **Test Connection**:
   - Click "TEST" button
   - Verify green success message
   - Confirm MyAnonamouse indexer status

4. **Configure Options**:
   - **Auto-update Autobrr on Save**: Disabled by default

### 6. Update All Services

- Click the **"UPDATE"** button at the bottom of the Indexer Integrations section
- This will push the current MAM ID to whichever services are enabled
- Check the event log for confirmation of which services were updated

### 7. Enable Session Validity Notifications

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
| **Auto-update on Save** | Sync MAM ID on session save | ✅ Enabled |

> **Note:** MAM session validity detection runs at the session level (not per-indexer) — see [Prowlarr Integration](prowlarr-integration.md#mam-session-validity-detection) for how it works.

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

### Session Invalid Notification

When MAM confirms a session's mam_id is invalid:

```
Session: DirectSession
MAM ID ending in ...N4k3Jrmn

MAM reports this session's mam_id is invalid.
MAM message: Invalid session

You will need to generate a new MAM session ID and update it in MouseTrap,
then push the update to your indexer(s).
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
prowlarr:
  enabled: true
  host: "prowlarr"
  port: 9696
  api_key: "prowlarr-api-key"
  auto_update_on_save: true
chaptarr:
  enabled: true
  host: "chaptarr"
  port: 8789
  api_key: "chaptarr-api-key"
  auto_update_on_save: true
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
