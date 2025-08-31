# August 2025: New Rules & Workflow

### 1. Unified Port Monitoring
- All port monitoring logic is now unified under a single backend and API. Legacy/duplicate code has been removed.
- The `/api/port-monitor/containers` endpoint provides a live list of Docker containers for the UI.

### 2. Manual Public IP Handling
- If a user enters a manual public IP for a container (e.g., for VPN containers with dynamic IPs), the system will:
  - Attempt to check the port using the manual IP.
  - If the port is unreachable for 3 consecutive checks, auto-restarts are paused and the user is notified to update the IP.
  - A warning is shown in the UI and event log until the user updates or disables the manual IP.

### 3. Restart Workflow & Timeout
- After restarting a primary container, the system:
  - Tries to check if the port is reachable for up to 60 seconds.
  - If not reachable, but the container is running, the system proceeds to restart secondary containers and notifies the user.
  - If the container is not running, secondary containers are not restarted and the user is notified.

### 4. Docker Permissions & DOCKER_GID
- If Docker socket permissions are missing, port monitoring is disabled and a warning is shown in the UI.
- The `DOCKER_GID` environment variable can be set to match your host's Docker group GID, ensuring proper access to `/var/run/docker.sock`.
- See the README for details on setting `DOCKER_GID`.

### 5. Event Logging & Notifications
- All port monitoring actions (checks, restarts, failures, manual IP pauses) are logged to the UI event log and backend logs.
- Users are notified of important events, including repeated manual IP failures and workflow timeouts.

---
# MouseTrap Port Monitoring Feature

## Overview
MouseTrap includes a global Port Monitoring card on the main dashboard, allowing users to monitor the reachability of Docker container ports and automatically restart containers if their forwarded port is unreachable. All events (add/delete check, restart, permission errors) are logged globally and surfaced in the UI event log. The feature is robust to missing Docker permissions.

## 1. UI/UX
- **Port Monitoring Card** is present on the main dashboard (not tied to session)
- Lists all configured port checks:
  - Container name (dropdown of running containers)
  - Port (numeric, 1–65535; example: 12345)
  - Status (OK, Restarted, Error, etc.)
  - Last checked time/result
- Actions:
  - Add new port check
  - Delete port check
  - (Optional) Edit port check
- Tooltip: “Only running containers are shown. Start your container to configure monitoring.”

## 2. Backend
- **Global config** for port checks (not per session)
- Uses Docker SDK to:
  - List running containers
  - Check container IP
  - Restart container if port unreachable
- Uses a **single global timer** (interval) for all port checks
- Logs all restart events, add/delete port checks, and permission errors to:
  - Backend logs
  - UI event log (with clear message; always global)
- Error handling:
  - If Docker unavailable or permissions missing, disables feature and shows a warning in UI. The rest of the app remains fully functional.
  - If container stops running, shows error and disables monitoring for that container

## 3. Validation & Security
- Port: Must be integer, 1–65535 (example: 12345)
- Container: Must be in running list
- All Docker actions via SDK (no shell commands)

## 4. Scalability
- Future: Per-check intervals, notification webhooks, advanced error handling

## 5. References
This doc will be updated as the feature evolves.
