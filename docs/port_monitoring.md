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
