# MouseTrap Troubleshooting Guide

This guide covers common issues, their symptoms, causes, and solutions when running MouseTrap.

---

## 🚨 Common Issues

### 1. Cannot Access Web UI

**Symptoms:**
- Browser shows "This site can't be reached" or connection timeout
- Error: "ERR_CONNECTION_REFUSED"

**Causes & Solutions:**

**Port Issues:**
- **Check port mapping**: Ensure `39842:39842` is in your `docker-compose.yml` ports section
- **Port conflicts**: If 39842 is in use, change the external port: `39843:39842`
- **Firewall blocking**: Check host firewall rules and router port forwarding

**Container Issues:**
- **Container not running**: `docker ps` to verify mousetrap container is up
- **Container crashed**: `docker logs mousetrap` to check for startup errors
- **Wrong network mode**: If using VPN networking, access via VPN container's exposed port

**Network Mode Confusion:**
```yaml
# ❌ Wrong - no port mapping with network_mode
services:
  mousetrap:
    network_mode: "service:gluetun"
    ports:
      - 39842:39842  # This won't work!

# ✅ Correct - port on VPN container
services:
  gluetun:
    ports:
      - 39842:39842  # Expose through VPN container
  mousetrap:
    network_mode: "service:gluetun"
    # No ports section needed
```

---

### 2. Docker Socket Permission Errors

**Symptoms:**
- Port monitoring shows "Docker permissions not available"
- Backend logs: "Permission denied: '/var/run/docker.sock'"
- No containers shown in port monitoring dropdown

**Causes & Solutions:**

**Docker Socket Not Mounted:**
```yaml
# Add this to your docker-compose.yml:
volumes:
  - /var/run/docker.sock:/var/run/docker.sock:ro
```

**Wrong Docker Group GID:**
```bash
# Find your host's Docker group GID:
getent group docker
# Example output: docker:x:281:

# Set DOCKER_GID in docker-compose.yml:
environment:
  - DOCKER_GID=281  # Use your actual GID
```

**SELinux/AppArmor Issues:**
```bash
# For SELinux systems, use :Z flag:
volumes:
  - /var/run/docker.sock:/var/run/docker.sock:ro,Z
```

---

### 3. Session Configuration Issues

**Symptoms:**
- "Failed to fetch status" errors
- Empty or incorrect data in status card
- Automation not triggering

**Causes & Solutions:**

**Invalid MAM ID:**
- **Check format**: MAM ID should be numeric (e.g., `123456`)
- **Copy from browser**: Get from browser cookies or seedbox config
- **No quotes**: Don't wrap MAM ID in quotes in YAML files

**IP Address Issues:**
- **Use external IP**: Set `mam_ip` to your external/public IP, not local
- **VPN IP detection**: Use proxy test feature to detect correct VPN IP
- **Manual vs Auto**: Set session_type to "manual" if providing static IP

**Proxy Configuration:**
- **Test proxy first**: Use "Test Proxy" button before assigning to session
- **Correct credentials**: Verify username/password for authenticated proxies
- **Network connectivity**: Ensure proxy is reachable from container

---

### 4. Automation Not Working

**Symptoms:**
- Purchases never trigger automatically
- "Automation skipped" in event log
- No automation events logged

**Causes & Solutions:**

**Multiple Sessions Same UID:**
- **One automation per UID**: Only one session per MAM user can have each automation type enabled
- **Check all sessions**: Verify no other sessions have same automation enabled
- **Use different MAM accounts**: For multiple automations, use separate MAM accounts

**Insufficient Points:**
- **Check minimum points**: Session-level minimum points setting blocks purchases
- **Wait for points**: Automation waits until both trigger conditions AND sufficient points
- **Verify costs**: Upload credit (500/GB), VIP (1250/week), Wedge (10000 points)

**Trigger Conditions Not Met:**
- **Time trigger**: Check "days since last purchase" requirement
- **Point trigger**: Verify current points exceed trigger threshold
- **Both trigger**: Both conditions must be met when using "both" trigger type

**Configuration Errors:**
```yaml
# ❌ Common mistakes:
perk_automation:
  upload_credit:
    enabled: "true"  # Should be boolean true, not string
    gb: "2"          # Should be number 2, not string
    trigger_days: 0  # Should be > 0 for time-based triggers

# ✅ Correct format:
perk_automation:
  upload_credit:
    enabled: true
    gb: 2
    trigger_days: 7
    trigger_type: "time"
```

---

### 5. VPN/Proxy Issues

**Symptoms:**
- Proxy test fails
- Wrong IP detected
- "Connection timeout" errors

**Causes & Solutions:**

**VPN Container Networking:**
```yaml
# ❌ Wrong - containers on different networks
services:
  gluetun:
    image: qmcgaw/gluetun
  mousetrap:
    image: ghcr.io/sirjmann92/mousetrap
    # No network_mode specified - uses default bridge

# ✅ Correct - shared networking
services:
  gluetun:
    image: qmcgaw/gluetun
    ports:
      - 39842:39842
  mousetrap:
    image: ghcr.io/sirjmann92/mousetrap
    network_mode: "service:gluetun"
```

**HTTP Proxy Not Enabled:**
```yaml
# Gluetun proxy configuration:
gluetun:
  environment:
    - HTTPPROXY=on                    # Enable HTTP proxy
    - HTTPPROXY_USER=myuser          # Optional auth
    - HTTPPROXY_PASSWORD=mypass      # Optional auth
  ports:
    - 8888:8888                      # Expose proxy port
```

**Container Name vs IP:**
- **Use container names**: `gluetun:8888` instead of IP addresses when on same network
- **Check container status**: `docker ps` to verify VPN container is running
- **Network inspection**: `docker network inspect bridge` to see container IPs

---

### 6. Notification Issues

**Symptoms:**
- No notifications received
- "Test failed" when testing notifications
- Partial notifications (email works, webhook doesn't)

**Causes & Solutions:**

**Email (SMTP) Issues:**
```yaml
# Gmail example - requires App Password:
smtp_server: smtp.gmail.com
smtp_port: 587
username: your-email@gmail.com
password: your-app-password  # NOT your regular password
```

**Common Email Errors:**
- **2FA required**: Gmail requires 2-step verification + App Password
- **Wrong port**: Use 587 (TLS) or 465 (SSL), not 25
- **Firewall blocking**: Some networks block SMTP ports
- **Authentication failed**: Double-check username/password

**Webhook/Discord Issues:**
- **Invalid URL**: Webhook URL must be complete Discord webhook URL
- **Discord checkbox**: Enable "Discord" checkbox for Discord-compatible formatting
- **Rate limiting**: Discord webhooks have rate limits - test sparingly
- **Network connectivity**: Ensure container can reach external webhooks

**Event Rule Configuration:**
```yaml
# Make sure events are enabled for desired notification channels:
event_rules:
  automation_success:
    email: true     # Enable email notifications
    webhook: true   # Enable webhook notifications
  automation_failure:
    email: true
    webhook: true
```

---

### 7. Log Analysis & Debugging

**Enable Debug Logging:**
```yaml
environment:
  - LOGLEVEL=DEBUG  # Enables verbose logging
```

**Key Log Locations:**
- **Container logs**: `docker logs mousetrap`
- **Persistent logs**: `./logs/` directory (if mounted)
- **Event log**: Available in Web UI under Event Log button

**Common Log Patterns:**

**Connection Issues:**
```
ERROR: Failed to connect to proxy: Connection timeout
ERROR: HTTP 403: Forbidden (check MAM ID/session)
ERROR: HTTP 429: Rate limited (wait before retry)
```

**Permission Issues:**
```
ERROR: Permission denied: '/var/run/docker.sock'
WARNING: Docker client not available, port monitoring disabled
```

**Configuration Issues:**
```
ERROR: Session 'session-name' not found
ERROR: Invalid proxy configuration: missing host
WARNING: Automation skipped: insufficient points
```

---

### 8. Performance Issues

**Symptoms:**
- Slow web UI response
- High CPU/memory usage
- Frequent container restarts

**Causes & Solutions:**

**Resource Allocation:**
```yaml
# Add resource limits to docker-compose.yml:
services:
  mousetrap:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
```

**Check Intervals Too Frequent:**
- **Increase check frequency**: Don't check more often than every 5-10 minutes
- **Rate limiting awareness**: MaM rate limits API calls (once per hour)

**Log File Growth:**
```bash
# Rotate/clear large log files:
docker exec mousetrap rm -f /app/logs/*.log
# Or configure log rotation in Docker:
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

---

## 🔧 Advanced Troubleshooting

### Container Health Checks

```bash
# Check container status
docker ps -a | grep mousetrap

# View container logs
docker logs mousetrap --tail 50 -f

# Execute commands inside container
docker exec -it mousetrap /bin/sh

# Check disk space
docker system df

# Restart container
docker restart mousetrap
```

### Network Diagnostics

```bash
# Test connectivity from inside container
docker exec mousetrap ping myanonamouse.net
docker exec mousetrap curl -I https://myanonamouse.net

# Check proxy connectivity
docker exec mousetrap curl -x proxy:8080 -I https://myanonamouse.net

# View container networks
docker network ls
docker network inspect bridge
```

### Configuration Validation

```bash
# Validate YAML files
python -c "import yaml; yaml.safe_load(open('config/session-name.yaml'))"

# Check file permissions
ls -la config/
ls -la /var/run/docker.sock
```

### Reset/Recovery Options

```bash
# Reset all configurations (CAUTION: deletes all settings)
rm -rf config/*
docker restart mousetrap

# Reset only specific components
rm config/proxies.yaml          # Reset proxy configs
rm config/notify.yaml           # Reset notification configs
rm config/session-*.yaml        # Reset all sessions
rm logs/ui_event_log.json       # Clear event log

# Backup before changes
cp -r config/ config-backup/
```

---

## 📞 Getting Help

If you're still experiencing issues:

1. **Check GitHub Issues**: [MouseTrap Repository Issues](https://github.com/sirjmann92/mousetrap/issues)
2. **Enable debug logging** and collect relevant log entries
3. **Document your setup**: Docker version, OS, network configuration
4. **Provide configuration**: Sanitized YAML configs (remove sensitive data)
5. **Describe symptoms**: Exact error messages and steps to reproduce

**Information to Include in Bug Reports:**
- MouseTrap version/commit hash
- Docker version (`docker --version`)
- Host OS and version
- Complete `docker-compose.yml` (with secrets redacted)
- Relevant log entries with timestamps
- Steps to reproduce the issue
- Expected vs actual behavior
