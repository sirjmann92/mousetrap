# Millionaire's Vault Automation

MouseTrap now supports automated donations to MAM's Millionaire's Vault feature with enhanced browser cookie management.

## Overview

The Millionaire's Vault is a special MAM feature that requires browser authentication (different from seedbox authentication). This automation allows you to:

- Schedule automatic donations to the vault
- Set point-based and time-based triggers
- Monitor cookie health and expiration
- Receive notifications for successful donations and errors

## Requirements

### Browser Cookies Required
Unlike other MAM automations that work with seedbox `mam_id`, Millionaire's Vault donations require **browser session cookies**:

- `mam_id` (browser version, different from seedbox)
- `uid` (user ID from browser session)

### Cookie Format
```
mam_id=your_browser_mam_id_value; uid=your_uid_value
```

## Setup Instructions

### 1. Extract Browser Cookies

**Method 1: Manual Extraction**
1. Log into MyAnonamouse.net in your browser
2. Press F12 to open Developer Tools
3. Go to **Application** tab → **Storage** → **Cookies** → `myanonamouse.net`
4. Find and copy the values for:
   - `mam_id` 
   - `uid`
5. Format as: `mam_id=yourvalue; uid=yourvalue`

**Method 2: Bookmarklet (Future Feature)**
- Use the provided JavaScript bookmarklet for easy extraction
- Available at `/api/vault/bookmarklet`

### 2. Configure Session
1. Open your session configuration in MouseTrap
2. Paste browser cookies in the "Browser Cookies" field
3. Use the **Validate** button to test cookie health
4. Save your session configuration

### 3. Set Up Automation
Configure automation settings similar to other perk automations:
- **Trigger Type**: Points-based, time-based, or both
- **Point Threshold**: Minimum points to trigger donation
- **Time Interval**: Days between donations
- **Donation Amount**: Points to donate

## Cookie Management

### Health Monitoring
MouseTrap automatically monitors cookie health:
- **Healthy**: Cookies are valid and vault is accessible
- **Expired**: Cookies need refreshing from browser
- **Invalid Format**: Cookie string format is incorrect
- **Missing**: No cookies configured

### Expiration Handling
Browser cookies expire periodically. MouseTrap will:
- Detect expired cookies before automation runs
- Send notifications when cookies need refreshing
- Skip automation attempts with invalid cookies
- Log all cookie-related events

### Validation Features
- **Pre-flight validation**: Test cookies before donations
- **Real-time health checks**: Monitor cookie status
- **Format validation**: Ensure correct cookie format
- **Vault accessibility**: Verify actual vault page access

## Security Considerations

### Cookie Storage
- Cookies are stored in session configuration files
- Same security as other MAM credentials
- No additional encryption beyond existing MAM ID storage

### Network Requirements
- Works with both proxied and direct ISP connections
- Uses same proxy configuration as other session features
- Respects IP monitoring modes (Auto/Manual/Static)

### Rate Limiting
- Respects MAM's rate limiting
- Implements same guardrails as other automations
- Session-level minimum points protection

## Automation Features

### Scheduling
- **Point-based triggers**: Donate when points exceed threshold
- **Time-based triggers**: Donate every N days
- **Combined triggers**: Both conditions must be met
- **Session minimum points**: Global point guardrails

### Notifications
Full notification support for all events:
- Successful donations
- Cookie expiration warnings
- Validation failures
- Rate limiting
- Network errors

### Event Logging
Complete event logging integration:
- Donation attempts and results
- Cookie health changes
- Validation events
- Error tracking and recovery

## Troubleshooting

### Common Issues

**"Cookies invalid or expired"**
- Extract fresh cookies from your browser
- Ensure you're logged into MAM in the browser
- Check that both `mam_id` and `uid` are present

**"Invalid cookie format"**
- Use exact format: `mam_id=value; uid=value`
- Include the semicolon and space between cookies
- Don't include extra spaces or characters

**"Vault not accessible"**
- Verify cookies work by manually visiting vault page
- Check proxy configuration if using VPN
- Ensure MAM account has vault access

**"Rate limited"**
- Wait for rate limit period to expire
- Check automation timing settings
- Verify not conflicting with manual donations

### Validation Tools
- Use the **Validate** button to test cookies
- Check `/api/session/{label}/cookie_health` for status
- Monitor event logs for detailed error information

## API Endpoints

### Cookie Validation
```
POST /api/session/validate_cookies
{
  "label": "session_name",
  "cookie_string": "mam_id=...; uid=..."
}
```

### Cookie Health Check
```
GET /api/session/{label}/cookie_health
```

### Bookmarklet Generator
```
GET /api/vault/bookmarklet
```

## Integration with Existing Features

### Session Management
- Browser cookies are part of session configuration
- Same save/load/backup mechanisms
- Integrated with session switching

### Proxy Support
- Uses session proxy configuration
- Works with Gluetun, custom SOCKS5, HTTP proxies
- Respects IP monitoring modes

### Automation Framework
- Same scheduling system as upload credit/wedges/VIP
- Integrated with notification system
- Uses existing event logging
- Respects session guardrails

## Future Enhancements

### Planned Features
- Browser extension for automatic cookie sync
- Smart cookie refresh detection
- Advanced scheduling options
- Donation history tracking
- Vault balance monitoring

### API Improvements
- Real-time cookie health monitoring
- Automated cookie refresh workflows
- Enhanced validation endpoints
- Bulk session cookie updates
