# MouseTrap Features Guide

This comprehensive guide covers all MouseTrap features, their configuration, and best practices for usage.

---

## 🎯 Core Features Overview

MouseTrap provides automated management for MyAnonamouse (MaM) seedbox sessions with a modern web interface. All features work together to provide seamless automation while maintaining full manual control when needed.

---

## 📊 Session Management

### Multi-Session Support
- **Manage multiple MaM accounts** in a single MouseTrap instance
- **Independent configuration** for each session (automation, proxy, IP settings)
- **Session switching** via dropdown in the web UI
- **Isolated event logging** with global and per-session filtering

### Session Configuration
- **MAM ID**: Your numeric MaM user identifier
- **IP Address**: Public IP address for seedbox updates
- **Session Type**: Auto (detect IP changes) or Manual (static IP)
- **Check Frequency**: How often to check for IP changes (5-60 minutes)
- **Proxy Assignment**: Optional proxy selection from global proxy list

### Session Types
- **Auto Sessions**: Automatically detect and update IP/ASN changes
- **Manual Sessions**: Use fixed IP address, no automatic updates
- **VPN/Proxy Sessions**: Route traffic through configured proxies

---

## 🔄 Automation Engine

### Perk Automation Types

**Upload Credit Automation:**
- **Cost**: 500 points per GB
- **Configurable amount**: 1-10 GB per purchase
- **Trigger types**: Time-based, point-based, or both
- **Time trigger**: Days since last purchase
- **Point trigger**: Minimum points before purchase

**VIP Automation:**
- **Cost**: 1,250 points per week
- **Configurable duration**: 1-52 weeks per purchase
- **Same trigger options** as upload credit
- **Duration optimization**: Buy longer durations for better point efficiency

**Wedge Automation:**
- **Methods**: Points (10,000) or Cheese (5 pieces)
- **Trigger types**: Time-based, point-based, or both
- **Method selection**: Choose points or cheese for purchases

### Automation Rules & Guardrails

**Session-Level Minimum Points:**
- **Global guardrail**: Set minimum points that must always be maintained
- **Blocks all purchases**: Both manual and automated purchases respect this limit
- **Per-session setting**: Different minimums for different sessions

**One Automation Per User (UID):**
- **Single automation rule**: Only one session per MaM user can have each automation type enabled
- **Multi-account support**: Use different MaM accounts for multiple automations
- **Automatic enforcement**: System prevents conflicting automation configurations

**Cost Verification:**
- **Real-time checking**: Verifies sufficient points before attempting purchase
- **Cost calculation**: Accounts for exact point costs (GB amount, VIP duration, etc.)
- **Graceful failure**: Logs insufficient points without attempting purchase

### Automation Triggers

**Time-Based Triggers:**
- **Days since last purchase**: Wait specified days before next purchase
- **Flexible scheduling**: 1-365 day intervals supported
- **Purchase history tracking**: Remembers last purchase dates automatically

**Point-Based Triggers:**
- **Threshold system**: Purchase when points exceed specified amount
- **Buffer maintenance**: Ensures minimum points are maintained after purchase
- **Dynamic thresholds**: Different thresholds for different automation types

**Combined Triggers (Both):**
- **Dual conditions**: Both time AND point conditions must be met
- **Maximum safety**: Prevents accidental over-purchasing
- **Recommended setting**: Best for conservative automation strategies

---

## 🌐 Network & Proxy Management

### Global Proxy System
- **Centralized management**: Configure proxies once, use across sessions
- **Interactive proxy testing**: Built-in "Test Proxy" button for each configured proxy
- **Real-time validation**: Test connectivity and IP detection with visual feedback
- **Success/failure notifications**: Material-UI alerts show test results with auto-dismiss
- **Instant IP detection**: See what IP MaM will detect through each proxy
- **Authentication support**: Username/password for authenticated proxies

### Proxy Types Supported
- **HTTP proxies**: Standard HTTP proxy protocol
- **VPN container proxies**: Gluetun, binhex containers with HTTP proxy
- **SOCKS proxies**: Via HTTP proxy bridges
- **Authenticated proxies**: Username/password authentication

### IP Monitoring Modes

MouseTrap offers three IP monitoring modes to suit different use cases and network environments:

**🔄 Auto (Full) - Default Mode:**
- **Automatic IP detection**: Uses multiple IP lookup services with fallbacks
- **Fallback chain**: ipinfo.io → ipdata.co → ip-api.com → ipify.org → hardcoded endpoints
- **DNS-free fallbacks**: Hardcoded IP endpoints (34.102.136.180, 54.230.100.253) bypass DNS issues
- **Smart ASN handling**: Preserves previous ASN when fallback providers don't support ASN data
- **Rate limiting**: Respects MaM's rate limits (1 update per hour)
- **Best for**: Regular internet connections, properly configured VPNs

**✋ Manual Mode:**
- **User-controlled updates**: Manual IP address entry and updates only
- **No automatic detection**: Completely disables automatic IP lookup services
- **Manual refresh option**: User can trigger IP updates when needed
- **Preserved automation**: All purchase automation continues to work normally
- **Best for**: Custom IP configurations, troubleshooting, controlled environments

**🔒 Static (No Monitoring) Mode:**
- **Zero IP monitoring**: Completely disables IP change detection and auto-updates
- **IP detection available**: Current IP still detected for convenience (USE DETECTED IP button)
- **No monitoring calls**: Eliminates seedbox update API calls when IP changes
- **Full automation**: All purchase automation continues independently
- **Reduced monitoring overhead**: No IP change comparisons or automated responses
- **Best for**: Static IP users, restricted networks, VPN environments with DNS issues

### Choosing the Right Mode

**Use Auto (Full) when:**
- You have a dynamic IP address
- Your VPN allows DNS resolution to IP lookup services
- You want real-time IP change notifications
- You're using standard home/office internet

**Use Manual when:**
- You have a semi-static IP that occasionally changes
- You want control over when IP updates occur
- You're troubleshooting IP detection issues
- You prefer manual verification of IP changes

**Use Static when:**
- You have a truly static IP address (home/business with static IP)
- Your VPN blocks DNS resolution to IP services
- You don't need IP change monitoring
- You want to minimize external network dependencies
- You're in a restricted network environment

**Use Manual when:**
- You have a semi-static IP that occasionally changes
- You want control over when IP updates occur
- You're troubleshooting IP detection issues
- You prefer manual verification of IP changes
- You have a static IP but want the option to manually update when needed

### Configuration

Configure IP monitoring mode per session in the MouseTrap Config card:
1. Select your session from the dropdown
2. Choose your preferred IP Monitoring mode
3. For Static/Manual modes: Set your IP address in the "IP Address" field
4. Click Save Configuration
5. Changes take effect immediately (no restart required)

**Static IP without VPN/Proxy**: If you have a static IP and don't use a VPN or proxy, either Static or Manual mode works well. Static mode completely disables IP monitoring, while Manual mode lets you update the IP if it ever changes.

**Note**: Each session can use a different monitoring mode based on its specific network environment and requirements.

### VPN Integration Options

**Network Mode (Shared Networking):**
```yaml
services:
  gluetun:
    ports:
      - 39842:39842  # Expose MouseTrap through VPN
  mousetrap:
    network_mode: "service:gluetun"  # Share VPN's network
```

**Proxy Mode (Recommended):**
```yaml
services:
  gluetun:
    environment:
      - HTTPPROXY=on
    ports:
      - 8888:8888    # HTTP proxy port
  mousetrap:
    ports:
      - 39842:39842  # Direct access to MouseTrap
```

---

## 🔔 Notification System

### Notification Channels

**Email (SMTP):**
- **Gmail support**: App Password authentication
- **Custom SMTP**: Any SMTP server configuration
- **TLS/SSL support**: Secure email transmission
- **Test functionality**: Verify email setup before use

**Webhook:**
- **Discord integration**: Native Discord message formatting
- **Generic webhooks**: Custom webhook URL support
- **JSON payloads**: Structured data for integrations
- **Test functionality**: Verify webhook connectivity

### Event Types & Notifications

**Automation Events:**
- `automation_success`: Successful automated purchases
- `automation_failure`: Failed purchase attempts
- `automation_guardian_block`: Blocked by guardrails (insufficient points, etc.)

**System Events:**
- `asn_changed`: IP/ASN change detection and updates
- `detection_failure`: Unable to detect IP/ASN
- `rate_limited`: MaM API rate limiting encountered

**Port Monitoring Events:**
- `port_monitor_failure`: Container port unreachable
- `port_monitor_restart`: Container restart triggered
- `port_monitor_container_not_running`: Container stopped/crashed

**Count Increment Events:**
- `inactive_hit_and_run`: Hit & Run count increased
- `inactive_unsatisfied`: Inactive Unsatisfied count increased

### Notification Configuration
- **Per-event settings**: Enable/disable email and webhook per event type
- **Global settings**: Apply notification preferences across all events
- **Testing built-in**: Test email and webhook from UI before enabling
- **Discord formatting**: Automatic Discord-compatible message formatting

---

## 🐳 Container Port Monitoring

### Port Monitoring Capabilities
- **Docker integration**: Monitor ports on running containers
- **Automatic restart**: Restart containers when ports become unreachable
- **Stack support**: Restart primary container + dependent secondary containers
- **Flexible scheduling**: Per-monitor interval configuration (1-60 minutes)

### Monitoring Configuration
- **Primary container**: Main container to monitor and restart
- **Primary port**: Port number to check for reachability
- **Secondary containers**: Additional containers to restart after primary
- **Check interval**: How often to test port reachability
- **Manual IP override**: Use specific IP for port checks (useful for VPN containers)

### Restart Workflow
1. **Port check fails**: System detects port unreachable
2. **Restart primary**: Stops and starts primary container
3. **Wait for stability**: Monitors primary for up to 60 seconds
4. **Restart secondaries**: If primary stable, restart secondary containers
5. **Notification**: Send notifications about restart actions
6. **Event logging**: Log all actions to event log

### Docker Permissions
- **Socket mounting**: Requires `/var/run/docker.sock` mount
- **Group permissions**: Automatic Docker group GID handling
- **Graceful degradation**: All other features work without Docker permissions
- **Clear warnings**: UI shows permission status and requirements

---

## 📝 Event Logging & Monitoring

### Comprehensive Event Log
- **All actions logged**: Manual actions, automation, system events, port monitoring
- **Structured data**: Timestamp, event type, session label, details, status
- **Filterable view**: Filter by session, global events, or all events
- **Persistent storage**: Events survive container restarts
- **Web UI access**: View and filter events directly in interface

### Event Categories

**Session Events:**
- Session creation, modification, deletion
- Status checks and seedbox updates
- IP/ASN change detection and updates

**Automation Events:**
- Purchase attempts (success/failure)
- Guardrail enforcement
- Trigger condition evaluation

**System Events:**
- Application startup/shutdown
- Configuration changes
- Error conditions and warnings

**Port Monitoring Events:**
- Container status checks
- Restart actions and results
- Permission and connectivity issues

### Event Filtering & Search
- **Session filter**: View events for specific sessions
- **Global filter**: System-wide events not tied to sessions
- **Event type**: Filter by specific event types
- **Time-based**: Most recent events shown first
- **Export capability**: Event data available via API

---

## ⚙️ Configuration Management

### Configuration Storage
- **YAML format**: Human-readable configuration files
- **Persistent volumes**: Configuration survives container updates
- **Backup-friendly**: Easy to backup and restore configurations
- **Version control compatible**: Text-based configs work with git

### Configuration Hierarchy
```
/config/
├── config.yaml                 # Global application settings
├── last_session.yaml          # UI state persistence
├── notify.yaml                 # Notification configuration
├── proxies.yaml               # Global proxy configurations
├── port_monitoring_stacks.yaml # Port monitoring settings
└── session-*.yaml             # Individual session configurations
```

### Configuration Validation
- **Real-time validation**: UI validates inputs before saving
- **Error feedback**: Clear error messages for invalid configurations
- **Automatic correction**: Some invalid values automatically corrected
- **Backup on change**: Previous configurations preserved

### Environment Variable Configuration
- **Container behavior**: PUID, PGID, DOCKER_GID for permissions
- **Application settings**: TZ (timezone), LOGLEVEL (logging level)
- **Service configuration**: PORT (override default port)
- **API tokens**: IPINFO_TOKEN for enhanced IP detection

---

## 🔍 Status Dashboard & Monitoring

### Real-Time Status Display
- **Current session info**: MAM ID, IP address, ASN details
- **Account statistics**: Points, cheese, H&R counts, inactive torrents
- **Connectivity status**: Visual connectable indicator (green checkmark/red X)
- **Session status**: Current session state alongside connectivity information
- **Rate limiting**: Visual indication of MaM API rate limiting
- **Last update**: When information was last refreshed from MaM

### Status Color Coding
- **Green**: Everything working normally
- **Yellow**: Warnings (rate limited, minor issues)
- **Red**: Errors (connection failures, configuration problems)
- **Blue**: Informational (updates available, manual actions needed)

### Manual Controls
- **Force refresh**: Update status bypassing cache and rate limits
- **Manual seedbox update**: Force IP/ASN update to MaM
- **Manual purchases**: Override automation for immediate purchases
- **Proxy testing**: Test proxy connectivity and IP detection

### Session Switching
- **Dropdown selection**: Quick switching between configured sessions
- **Independent state**: Each session maintains its own status and settings
- **Session creation**: Create new sessions directly from UI
- **Session management**: Edit, delete, duplicate sessions

---

## 🛡️ Security & Best Practices

### Credential Management
- **No password storage**: MaM passwords not stored (uses session cookies/IDs)
- **Proxy credentials**: Stored encrypted in configuration files
- **Email credentials**: SMTP credentials stored securely
- **Token-based**: API tokens preferred over username/password when available

### Network Security
- **No authentication**: Currently no built-in authentication (run on trusted networks)
- **Proxy support**: Route sensitive traffic through VPNs/proxies
- **Rate limiting**: Built-in rate limiting prevents API abuse
- **Error handling**: Secure error messages without credential exposure

### Best Practices
- **Use Docker networks**: Isolate containers on custom networks
- **Regular backups**: Backup `/config` directory regularly
- **Monitor logs**: Check logs for unusual activity or errors
- **Update regularly**: Keep MouseTrap updated for security fixes
- **Test configurations**: Use test features before enabling automation

### Recommended Setup
```yaml
# Production-ready docker-compose.yml
services:
  mousetrap:
    image: ghcr.io/sirjmann92/mousetrap:latest
    container_name: mousetrap
    restart: unless-stopped
    environment:
      - TZ=America/New_York
      - PUID=1000
      - PGID=1000
      - LOGLEVEL=INFO
    volumes:
      - ./config:/config
      - ./logs:/app/logs
      - /var/run/docker.sock:/var/run/docker.sock:ro
    ports:
      - "127.0.0.1:39842:39842"  # Bind to localhost only
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

---

## 📈 Performance & Optimization

### Resource Usage
- **Lightweight**: ~100MB Docker image size
- **Low CPU**: Minimal CPU usage during normal operation
- **Memory efficient**: ~50-100MB RAM usage typical
- **Storage minimal**: Configuration and logs require minimal disk space

### Optimization Tips
- **Check intervals**: Don't check more frequently than needed (5-10 minutes recommended)
- **Automation triggers**: Use conservative trigger settings to prevent excessive API calls
- **Log rotation**: Configure log rotation to prevent disk space issues
- **Proxy efficiency**: Use local proxies when possible to reduce latency

### Scaling Considerations
- **Single instance per MaM account**: One MouseTrap instance per unique MaM user
- **Multiple sessions**: Multiple sessions supported per instance (same user)
- **Resource limits**: Set Docker resource limits for predictable performance
- **Network bandwidth**: Minimal bandwidth usage for normal operations

---

## 🔧 Advanced Usage

### API Integration
- **REST API**: Full REST API available for external integrations
- **Webhook endpoints**: Receive webhooks from external systems
- **Event data**: Structured event data for monitoring systems
- **Health checks**: Built-in health check endpoints for monitoring

### Custom Automations
- **Trigger combinations**: Mix time and point triggers for sophisticated automation
- **Multi-session strategies**: Different automation strategies per session
- **Purchase optimization**: Configure purchases for maximum point efficiency
- **Seasonal adjustments**: Adjust automation settings based on activity patterns

### Integration Examples
- **Home Assistant**: Monitor MouseTrap status and trigger actions
- **Grafana dashboards**: Visualize automation performance and trends
- **Discord bots**: Custom Discord integrations beyond built-in webhooks
- **Monitoring systems**: Integration with Prometheus, DataDog, etc.

### Development & Customization
- **Source available**: Full source code available for customization
- **Docker build**: Build custom images with modifications
- **Configuration extensions**: Add custom configuration options
- **Theme customization**: Modify UI appearance and behavior
