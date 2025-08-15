# MouseTrap

_A Dockerized web interface for automating MyAnonaMouse seedbox and account management tasks._

<!-- Updated logo August 2025 -->
<p align="center">
  <img src="frontend/src/assets/mousetrap-icon.svg" alt="MouseTrap logo" width="120" height="120" />
</p>


## Features

- Modern web UI for all automation and session parameters
- Persistent, timestamped event log (viewable in the UI)
- Auto-purchase: wedges, VIP, upload credit (per session)
- Perk automation (auto-spend points for perks)
- Notifications: email, webhook, and in-app event log
- Status dashboard with real-time updates and color-coded feedback
- Per-session proxy support (with authentication)
- Multi-session: manage multiple MAM IDs in one instance
- Detects and updates on public IP/ASN changes (VPN/proxy aware)
- Rate limit handling and clear error/warning messages
- Designed for Docker Compose and ease of use
- **Port Monitoring:** Global card for monitoring container ports, with auto-restart and event logging. Feature is robust to missing Docker permissions.
- **Sensitive Data Handling:** Compose files are now in `.gitignore` by default. Never commit secrets (like API tokens) to version control. If secrets are exposed, use `git filter-repo` to remove them and rotate the token.

## Quick Start

```bash
git clone https://github.com/sirjmann92/mousetrap.git
cd mousetrap
docker-compose up --build
```

Access the web UI at [http://localhost:39842](http://localhost:39842)



## Security & Sensitive Data

- All common Docker Compose file names are now included in `.gitignore` by default.
- If you accidentally commit secrets (like API tokens) to git, use `git filter-repo` to scrub them from history and force-push. All collaborators must re-clone after a history rewrite.
- Never store secrets in version control. Use environment variables or Docker secrets for sensitive data.
- If you exposed an API token, rotate it immediately after removing it from git history.

## Configuration

All user settings and state are stored in the `/config` directory (mapped as a volume).

- Edit `config/config.yaml` for global options.
- Each session has its own config: `config/session-*.yaml` (created via the UI).
- **Proxy support:** Enter HTTP proxy details (host, port, username, password) per session in the UI. Passwords are encrypted at rest.
- **IP/ASN:** Enter the IP you want MAM to see for each session. The backend will use this for all MAM API calls.

---

## Networking & Proxy Setup

MouseTrap supports two main networking modes for VPN/proxy integration. Choosing the right setup is important for correct routing and security:

### 1. VPN Container with `network_mode: service:gluetun` (Recommended for single-IP)

- Attach MouseTrap directly to your VPN container using `network_mode: service:gluetun` in your gluetun Compose file.
- All outbound traffic from MouseTrap will be routed through the VPN container.
- You do NOT need to configure a proxy in MouseTrap for this mode.
- The IP Address in your MouseTrap session config should match the VPN's external IP (you can use the "Detected Public IP in MouseTrap).
- Only the VPN container should expose ports (e.g., `39842:39842` on gluetun).

**When to use:**
- You want all sessions to use the same VPN IP.
- You do not need per-session proxies or multiple exit IPs.

### 2. Standalone/HTTP Proxy Mode (Recommended for multi-session or multi-IP)

- Run MouseTrap and your VPN container (e.g., Gluetun) as separate services, but on the same Docker network.
- Enable the HTTP proxy feature in your VPN container (see Gluetun docs).
- In MouseTrap, configure the proxy for each session you want proxied using the proxy's Docker network address (e.g. the Gluetun container's Docker IP).
    - **Do NOT use your host's IP address.** Use the Docker container name or its internal IP.
- Both containers must be on the same Docker network (default for Compose is `bridge`, but you can define a custom network for clarity).

**When to use:**
- You want different sessions to use different proxies or VPN exit IPs.
- You want to run MouseTrap and Gluetun as independent containers.

#### Example: Custom Docker Network

```yaml
networks:
  vpnnet:

services:
  gluetun:
    image: qmcgaw/gluetun
    networks:
      - vpnnet
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
- **Session creation, save, and delete actions are now logged as global events in the UI event log.** These events are always visible, not session-specific.
- All port monitoring actions (add/delete check, container restart) are also logged globally.


## Port Monitoring

- The Port Monitoring card is global (not per-session) and allows you to monitor the reachability of Docker container ports.
- If Docker permissions are missing, the UI disables controls and shows a warning, but the rest of the app remains fully functional.
- All port check actions and container restarts are logged in the UI event log.

## Full Docker Compose Examples

### 1. Native VPN Networking (network_mode)

```yaml
version: '3.8' # Not needed for newer versions of Docker/Compose
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
    build: .
    container_name: mousetrap
    network_mode: "service:gluetun"
    environment:
      - TZ=Europe/London
      - PUID=1000
      - PGID=1000
    volumes:
      - ./config:/config
    # No ports here! All traffic is routed through gluetun
```

- Access the UI at `http://localhost:39842` (traffic is routed through the VPN container).
- Do NOT set a `PORT` environment variable—MouseTrap always runs on 39842.

### 2. HTTP Proxy Mode (recommended for multi-session)

```yaml
version: '3.8' # Not needed for newer versions of Docker/Compose
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
    build: .
    container_name: mousetrap
    environment:
      - TZ=Europe/London
      - PUID=1000
      - PGID=1000
    volumes:
      - ./config:/config
    ports:
      - 39842:39842
    depends_on:
      - gluetun
```

- In HTTP proxy mode, enter your proxy credentials in each session's proxy config in the MouseTrap UI that you want to route through the proxy's connection.
- For other VPN containers see their docs for enabling Privoxy or HTTP proxy and adjust the Compose file accordingly.

**Note:**
- In VPN mode, only the VPN container should expose ports. In non-VPN/proxy mode, expose 39842 on the `mousetrap` service.
- The backend listens on port 39842 by default; you can override this with the `PORT` environment variable in case of conflicts.

## Logging & Debugging

MouseTrap uses Python's standard logging with timestamps and log levels (DEBUG, INFO, WARNING, ERROR, CRITICAL).

- **Control log level with the `LOGLEVEL` environment variable.**
- Default is `INFO`. For troubleshooting, set `LOGLEVEL=DEBUG` in your Compose file or environment.
- All backend checks, updates, and warnings/errors are also logged to the persistent event log (viewable in the UI).

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