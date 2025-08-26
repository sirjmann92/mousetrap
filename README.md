
# MouseTrap

_A beginner-friendly Docker web app for automating MyAnonaMouse seedbox and account management._

<p align="center">
  <img src="frontend/src/assets/mousetrap-icon.svg" alt="MouseTrap logo" width="120" height="120" />
</p>

---

## 🚀 Quick Start (Recommended for Beginners)

**1. Create a `docker-compose.yml` file in your project directory.**

Copy and paste this example (using the prebuilt image):

```yaml
version: '3.8'
services:
  mousetrap:
    image: ghcr.io/sirjmann92/mousetrap:latest
    container_name: mousetrap
    environment:
      - TZ=Europe/London
      - PUID=1000
      - PGID=1000
    volumes:
      - ./config:/config
      - ./logs:/app/logs
    ports:
      - 39842:39842
```

**2. Start MouseTrap:**

```bash
docker-compose up -d
```

**3. Open the UI:**

Visit [http://localhost:39842](http://localhost:39842) in your browser.

**4. Configure your sessions and automation in the web UI.**

---

## 🛠️ What You Get

- Modern web UI for all automation and session parameters
- Persistent event log (viewable in the UI)
- Auto-purchase: wedges, VIP, upload credit (per session)
- Perk automation (auto-spend points for perks)
- Notifications: email, webhook, and in-app event log
- Status dashboard with real-time updates
- Per-session proxy support (with authentication)
- Multi-session: manage multiple MAM IDs in one instance
- Detects and updates on public IP/ASN changes (VPN/proxy aware)
- Rate limit handling and clear error/warning messages
- **Port Monitoring:** Monitor container ports, auto-restart, persistent config, color-coded status, and event logging

---

## 🧑‍💻 Advanced Options

### Build from Source

If you want to build your own image:

```bash
git clone https://github.com/sirjmann92/mousetrap.git
cd mousetrap
# In your docker-compose.yml, uncomment 'build: .' and remove 'image:'
docker-compose up --build -d
```

### VPN/Proxy Integration

MouseTrap supports two main networking modes:

#### 1. VPN Container (Single IP)

Attach MouseTrap to your VPN container using `network_mode: service:gluetun`:

```yaml
services:
  mousetrap:
    image: ghcr.io/sirjmann92/mousetrap:latest
    network_mode: "service:gluetun"
    # ...other config...
```

All traffic is routed through the VPN. Only the VPN container should expose ports.

#### 2. HTTP Proxy (Multi-session/Multi-IP)

Enable HTTP proxy in your VPN container (see Gluetun docs) and enter proxy details per session in MouseTrap UI.

Both containers must be on the same Docker network. Use the container name (not host IP) for proxy config.

---

## 📝 Configuration & Data

- All settings and state are stored in `/config` (mapped as a volume)
- Edit `config/config.yaml` for global options
- Each session: `config/session-*.yaml` (created via the UI)
- Port Monitoring: `/config/port_monitoring.yaml` (auto-created/updated)
- Logs: `/logs` (persisted outside the container)

---

## 🆘 Troubleshooting

- **Error: `no configuration file provided: not found`**
  - Make sure you have a valid `docker-compose.yml` before running Docker commands.
- **Can't access UI?**
  - Confirm port 39842 is exposed and not blocked by firewall.
- **Proxy/VPN issues?**
  - Ensure containers are on the same Docker network. Use container name for proxy host.
- **Permissions:**
  - Set `PUID`/`PGID` to match your user for config/logs volume access.
- **Port Monitoring not working?**
  - Mount `/var/run/docker.sock:/var/run/docker.sock:ro` to enable. Otherwise, feature is disabled but app works.
- **Session not updating?**
  - Check backend logs and UI event log for errors. Confirm entered IP is correct.

---

## 📚 More Info & Advanced Features

- [docs/CHANGELOG.md](docs/CHANGELOG.md): Recent features & bugfixes
- [docs/architecture-and-rules.md](docs/architecture-and-rules.md): Automation logic & rules
- [docs/purchase_logging_and_event_log.md](docs/purchase_logging_and_event_log.md): Event log details
- [Gluetun HTTP Proxy Setup](https://github.com/qdm12/gluetun-wiki/blob/main/setup/http-proxy.md)

---

## 💬 Support

If you get stuck, check the event log in the UI, review logs in `/logs`, or open an issue on GitHub.

---

## 🏗️ Full Compose Examples (Advanced)

See below for advanced Compose setups (VPN, proxy, port monitoring, etc).

---
    # ...
  mousetrap:
    build: .
    networks:
      - vpnnet
    # ...
```

#### Example: Proxy Configuration in MouseTrap UI

- Host: `gluetun` (the container name, or use the container's Docker IP)
- Port: `8888` (or whatever you set in Gluetun)
- Username/Password: (if set in Gluetun)

**Important:**
- If MouseTrap and Gluetun are not on the same Docker network, they cannot communicate via container name or Docker IP.
- If you use the host's IP address for the proxy, it will not work as expected—always use the Docker network address.

#### Troubleshooting
- If you see connection errors, double-check that both containers are on the same Docker network and that the proxy is enabled in Gluetun.
- You can inspect Docker networks with `docker network ls` and `docker network inspect <network>`.

---


## IP/ASN Lookup & Fallbacks

MouseTrap uses a robust, privacy-friendly fallback chain to determine your public IP address and ASN for each session:

- **Primary:** [ipinfo.io](https://ipinfo.io/) (recommended, supports free API token)
- **Fallbacks:** [ipwho.is](https://ipwho.is/), [ip-api.com](http://ip-api.com/), [ipdata.co](https://ipdata.co/)

If the primary provider is unavailable or rate-limited, MouseTrap will automatically try the next provider in the chain. This ensures reliable detection of your public IP and ASN, even if one or more services are down or blocked.

**No extra setup is required for fallback support.**

### Using an ipinfo.io API Token (Recommended)

ipinfo.io offers a free API token with generous limits for non-commercial use. Using a token increases reliability and reduces the chance of hitting rate limits.

1. Sign up for a free account at [ipinfo.io/signup](https://ipinfo.io/signup).
2. Copy your API token from the dashboard.
3. Set the token as an environment variable in your Docker Compose file or host:

   ```yaml
   environment:
     - IPINFO_TOKEN=your_token_here
   ```

   Or export it in your shell before running Docker:

   ```bash
   export IPINFO_TOKEN=your_token_here
   ```

If you do not set a token, MouseTrap will still work, but may fall back to other providers more often if you exceed the free rate limit.

## Environment Variables

- `TZ`: Set the timezone for logs and scheduling (e.g. `Europe/London`).
- `PUID`/`PGID`: Set user/group IDs for Docker volume permissions (optional).
- `IPINFO_TOKEN`: (Recommended) ipinfo.io API token for reliable IP/ASN lookups and higher rate limits. See above for details.
- `LOGLEVEL`: Set backend log level (`DEBUG`, `INFO`, `WARNING`, etc). Default: `INFO`.
- `PORT`: (Advanced) Override backend port (default: 39842; not recommended).

## Automation & Status

- The backend checks each session at the configured interval (`check_freq` in minutes; minimum 5).
- If the IP changes, MouseTrap auto-updates your MAM seedbox session (rate-limited to once per hour).
- All status checks and updates are logged to a persistent event log (viewable in the UI).
- Use the "Check Now" and "Update Seedbox" buttons in the UI to force checks/updates.
- Event log includes both successful updates and warnings/errors (e.g., unable to determine IP/ASN).

## Testing IP/ASN Changes

1. Change the session's `IP Address` in the UI or `mam_ip` in session-LABEL.yaml.
2. Save and use "Update Seedbox" or wait for the next scheduled check.
3. The backend will update MAM if the IP/ASN is different and log the result.
4. For ASN changes, use an IP from a different provider (VPN/proxy).

## Troubleshooting

- **Proxy errors:** Ensure your proxy supports HTTP CONNECT and credentials are correct.
- **Rate limit:** MAM only allows seedbox updates once per hour per session.
- **Session not updating?** Check backend logs and the UI event log for errors and confirm your entered IP is correct.
- **Permissions:** If running in Docker, set `PUID`/`PGID` to match your user for config volume access.
- **Event log missing entries?** Only real backend checks (not cached status) are logged. Warnings/errors are also shown in the event log.

## VPN Integration

MouseTrap can connect to MyAnonaMouse via your VPN container in two ways:

### 1. Native Networking (Docker Compose network)
- Place MouseTrap and your VPN container (e.g., Gluetun, binhex/arch-delugevpn) on the same Docker network.
- Set the `mam_ip` in your session config (`IP Address` in the UI) to the VPN's external IP.
- All MAM API calls will go out via the VPN container if you set the `network_mode` in Compose:

```yaml
services:
  mousetrap:
    image: your/mousetrap
    network_mode: "service:gluetun"  # or your VPN container name
    ...
```

### 2. HTTP Proxy (Recommended for multi-session/multi-IP)
- Use your VPN container's built-in HTTP proxy (e.g. qmcgaw/gluetun).
- Enter the proxy details (host, port, username, password) in each session's config in the MouseTrap UI.
- MouseTrap will route MAM API calls for that session through the proxy, using the VPN's IP.

#### Example: Gluetun HTTP Proxy
- Enable HTTP proxy in Gluetun: [Gluetun HTTP Proxy Docs](https://github.com/qdm12/gluetun-wiki/blob/main/setup/http-proxy.md)
- Use the proxy address (e.g., `gluetun:8888`) in your session config.

#### More Info
- [qmcgaw/gluetun HTTP Proxy](https://github.com/qdm12/gluetun-wiki/blob/main/setup/http-proxy.md)


## Session Management & Event Logging

- Each session in MouseTrap is independent: you can set a different MAM account, IP, proxy, and automation settings per session.
- Session configs are stored in `/config/session-*.yaml`.
- You can switch between sessions in the UI, and each will use its own proxy and IP for MAM API calls.
- **Event Log Filtering:** The event log modal supports filtering by Global events, All Events, or by session label. The dropdown is dynamic and always reflects available sessions and global actions.
- **Session creation, save, and delete actions are now logged as global events in the UI event log.** These events are always visible, not session-specific.
- All port monitoring actions (add/delete check, container restart) are also logged globally and filterable in the event log.


## Port Monitoring

- The Port Monitoring card is global (not per-session) and allows you to monitor the reachability of Docker container ports.
- All port checks and settings are persisted in `/config/port_monitoring.yaml`.
- Each check can be configured with its own interval (minimum 1 minute). Status is color-coded (green/yellow/red) based on reachability and last check time.
- If Docker permissions are missing, the UI disables controls and shows a warning, but the rest of the app remains fully functional.
- All port check actions and container restarts are logged in the UI event log and filterable by label.

## Full Docker Compose Examples


### 1. Native VPN Networking (network_mode)

```yaml
version: '3.8'
services:
  gluetun:
    image: qmcgaw/gluetun
    container_name: gluetun
    cap_add:
      - NET_ADMIN
    environment:
      - VPN_SERVICE_PROVIDER=protonvpn
      - OPENVPN_USER=youruser
      - OPENVPN_PASSWORD=yourpass
      - TZ=Europe/London
    ports:
      - 39842:39842  # Expose MouseTrap's web UI via VPN container
    volumes:
      - ./gluetun:/gluetun

  mousetrap:
    image: ghcr.io/sirjmann92/mousetrap:latest # If you prefer to build your own, remove this line & uncomment the next line
    # build: .
    container_name: mousetrap
    network_mode: "service:gluetun"
    environment:
      - TZ=Europe/London
      - PUID=1000
      - PGID=1000
    volumes:
      - ./config:/config
      - ./logs:/app/logs  # Persist logs outside the container
      # Optional: Enable port monitoring by mounting the Docker socket
      - /var/run/docker.sock:/var/run/docker.sock:ro
    # No ports here! All traffic is routed through gluetun
```

> **Note:** The `/var/run/docker.sock` mount is only required if you want to enable the Port Monitoring feature. Without it, MouseTrap will run with port monitoring disabled and all other features will work normally.

- Access the UI at `http://localhost:39842` (traffic is routed through the VPN container).
- Do NOT set a `PORT` environment variable—MouseTrap always runs on 39842.


### 2. HTTP Proxy Mode (recommended for multi-session)

```yaml
version: '3.8'
services:
  gluetun:
    image: qmcgaw/gluetun
    container_name: gluetun
    cap_add:
      - NET_ADMIN
    environment:
      - VPN_SERVICE_PROVIDER=protonvpn
      - OPENVPN_USER=youruser
      - OPENVPN_PASSWORD=yourpass
      - TZ=Europe/London
      - HTTPPROXY=on
      - HTTPPROXY_USER=proxyuser
      - HTTPPROXY_PASSWORD=proxypass
    ports:
      - 8888:8888  # HTTP proxy
    volumes:
      - ./gluetun:/gluetun

  mousetrap:
    image: ghcr.io/sirjmann92/mousetrap:latest # If you prefer to build your own, remove this line & uncomment the next line
    # build: .
    container_name: mousetrap
    environment:
      - TZ=Europe/London
      - PUID=1000
      - PGID=1000
    volumes:
      - ./config:/config
      - ./logs:/app/logs  # Persist logs outside the container
      # Optional: Enable port monitoring by mounting the Docker socket
      - /var/run/docker.sock:/var/run/docker.sock:ro
    ports:
      - 39842:39842
    depends_on:
      - gluetun
```

> **Note:**
> - The `/var/run/docker.sock` mount is only required if you want to enable the Port Monitoring feature. Without it, MouseTrap will run with port monitoring disabled and all other features will work normally.
> - The `./logs:/app/logs` volume is recommended to persist logs outside the container. This allows you to view logs even if the container is removed or recreated.

- In HTTP proxy mode, enter your proxy credentials in each session's proxy config in the MouseTrap UI that you want to route through the proxy's connection.
- For other VPN containers see their docs for enabling Privoxy or HTTP proxy and adjust the Compose file accordingly.

**Note:**
- In VPN mode, only the VPN container should expose ports. In non-VPN/proxy mode, expose 39842 on the `mousetrap` service.
- The backend listens on port 39842 by default; you can override this with the `PORT` environment variable in case of conflicts.



## Port Monitor Notifications: Global vs Per-Port

MouseTrap supports two ways to notify you of port check failures:

- **Global Notification Rule:**
  - In the Notifications card, enable "Port Monitor Failure" for global notifications.
  - Any port check failure will trigger a notification via the selected channels (email/webhook/Discord).
  - Use this for a simple, all-or-nothing approach.

- **Per-Port "Notify on Fail":**
  - In the Port Monitoring card, enable "Notify on Fail" for each port check you want to monitor individually.
  - Only failures for ports with this setting enabled will trigger a notification.
  - Use this for granular control when monitoring multiple ports.

**If both are enabled, you may receive duplicate notifications for the same failure.**
For most users, the per-port setting is more flexible. For simple setups, the global rule is easier to manage.

---
## Notifications & Email

MouseTrap supports notifications via Email (SMTP) and Webhook (including Discord). Configure these in the Notifications card in the UI.

### Email (SMTP)

- Enter your SMTP server details, username, password, and recipient email in the UI.
- For Gmail, you must use an <b>App Password</b> (not your main password) and enable 2-Step Verification on your account.
- Host: <b>smtp.gmail.com</b>
- Port: <b>587</b> (TLS) or <b>465</b> (SSL)
- See the UI tooltip for a quick Gmail setup guide, or visit:
  - [Create App Password](https://support.google.com/mail/answer/185833?hl=en)
  - [SMTP Setup Instructions](https://support.google.com/a/answer/176600?hl=en)

### Webhook

- Enter your webhook URL in the UI. For Discord, check the "Discord" box to send Discord-compatible messages.
- You can test both Email and Webhook notifications directly from the UI.

---
## Logging & Debugging

MouseTrap uses Python's standard logging with timestamps and log levels (DEBUG, INFO, WARNING, ERROR, CRITICAL).

- **Control log level with the `LOGLEVEL` environment variable.**
- Default is `INFO`. For troubleshooting, set `LOGLEVEL=DEBUG` in your Compose file or environment.
- All backend checks, updates, warnings/errors, and port monitoring actions are also logged to the persistent event log (viewable in the UI and filterable).

### Example: Enable DEBUG Logging in Docker Compose

```yaml
services:
  mousetrap:
    # ...other config...
    environment:
      - LOGLEVEL=DEBUG
      - TZ=Europe/London
      - PUID=1000
      - PGID=1000
    # ...
```

You can use any standard log level: `DEBUG`, `INFO`, `WARNING`, `ERROR`, `CRITICAL`.

Logs will include timestamps, log level, and message for easy troubleshooting.

---

## Changelog

See [`docs/CHANGELOG.md`](docs/CHANGELOG.md) for a summary of recent features, bugfixes, and upgrade notes.