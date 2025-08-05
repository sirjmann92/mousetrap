# MouseTrap

_A Dockerized web interface for automating MyAnonaMouse seedbox and account management tasks._

![MouseTrap logo](frontend/src/assets/logo.svg)

## Features

- Web config for all automation parameters
- Auto-purchase (wedges, VIP, upload)
- Notifications (email, webhook)
- Status dashboard
- Per-session proxy support (with authentication)
- Designed for Docker Compose and ease of use

## Quick Start

```bash
git clone https://github.com/YOURREPO/mousetrap.git
cd mousetrap
docker-compose up --build
```

Access the web UI at [http://localhost:39842](http://localhost:39842)

## Configuration

All user settings and state are stored in the `/config` directory (mapped as a volume).

- Edit `config/config.yaml` for global options.
- Each session has its own config: `config/session-*.yaml` (created via the UI).
- **Proxy support:** Enter HTTP proxy details (host, port, username, password) per session in the UI. Passwords are encrypted at rest.
- **IP/ASN:** Enter the IP you want MaM to see for each session. The backend will use this for all MaM API calls.

## Environment Variables

- `TZ`: Set the timezone for logs and scheduling (e.g. `Europe/London`).
- `PUID`/`PGID`: Set user/group IDs for Docker volume permissions (optional).
- `IPINFO_TOKEN`: (Optional) For more reliable ASN lookups.

## Automation & Status

- The backend checks each session at the configured interval (`check_freq` in minutes).
- If the IP or ASN changes (and session type matches), MouseTrap auto-updates your MaM seedbox session (rate-limited to once per hour).
- Use the "Check Now" and "Update Seedbox" buttons in the UI to force checks/updates.

## Testing IP/ASN Changes

1. Change the session's `mam_ip` in the UI or YAML.
2. Save and use "Update Seedbox" or wait for the next scheduled check.
3. The backend will update MaM if the IP/ASN is different and log the result.
4. For ASN changes, use an IP from a different provider (VPN/proxy).

## Troubleshooting

- **Proxy errors:** Ensure your proxy supports HTTP CONNECT and credentials are correct.
- **Rate limit:** MaM only allows seedbox updates once per hour per session.
- **Session not updating?** Check backend logs for errors and confirm your entered IP is correct.
- **Permissions:** If running in Docker, set `PUID`/`PGID` to match your user for config volume access.

## VPN Integration

MouseTrap can connect to MyAnonaMouse via your VPN container in two ways:

### 1. Native Networking (Docker Compose network)
- Place MouseTrap and your VPN container (e.g., Gluetun, binhex/arch-delugevpn) on the same Docker network.
- Set the `mam_ip` in your session config to the VPN's external IP.
- All MaM API calls will go out via the VPN container if you set the `network_mode` in Compose:

```yaml
services:
  mousetrap:
    image: your/mousetrap
    network_mode: "service:gluetun"  # or your VPN container name
    ...
```

### 2. HTTP Proxy (Recommended for multi-session/multi-IP)
- Use your VPN container's built-in HTTP proxy (e.g., Gluetun, binhex/arch-delugevpn, qmcgaw/gluetun).
- Enter the proxy details (host, port, username, password) in each session's config in the MouseTrap UI.
- MouseTrap will route MaM API calls for that session through the proxy, using the VPN's IP.

#### Example: Gluetun HTTP Proxy
- Enable HTTP proxy in Gluetun: [Gluetun HTTP Proxy Docs](https://github.com/qdm12/gluetun-wiki/blob/main/setup/http-proxy.md)
- Use the proxy address (e.g., `gluetun:8888`) in your session config.

#### Example: binhex/arch-delugevpn HTTP Proxy
- Enable Privoxy: [binhex/arch-delugevpn Privoxy Docs](https://github.com/binhex/documentation/blob/master/docker/faq/vpn.md#privoxy-support)
- Use the proxy address (e.g., `delugevpn:8118`) in your session config.

#### More Info
- [qmcgaw/gluetun HTTP Proxy](https://github.com/qdm12/gluetun-wiki/blob/main/setup/http-proxy.md)
- [binhex/arch-delugevpn Privoxy](https://github.com/binhex/documentation/blob/master/docker/faq/vpn.md#privoxy-support)

## Session Management

- Each session in MouseTrap is independent: you can set a different MaM account, IP, proxy, and automation settings per session.
- Session configs are stored in `/config/session-*.yaml`.
- You can switch between sessions in the UI, and each will use its own proxy and IP for MaM API calls.
- This allows you to manage both VPN and non-VPN sessions from a single MouseTrap instance.

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

- In HTTP proxy mode, enter `gluetun:8888` and your proxy credentials in each session's proxy config in the MouseTrap UI.
- For other VPN containers (e.g., binhex/arch-delugevpn), see their docs for enabling Privoxy or HTTP proxy and adjust the Compose file accordingly.
- Do NOT set a `PORT` environment variable—MouseTrap always runs on 39842.

**Note:**
- In VPN mode, only the VPN container should expose ports. In non-VPN/proxy mode, expose 39842 on the `mousetrap` service.
- The backend always listens on port 39842 by default; no need to set or override `PORT`.

## License

<!-- You may add your license details here if desired. -->