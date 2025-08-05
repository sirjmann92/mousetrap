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

## License

Private for now (not yet open source).