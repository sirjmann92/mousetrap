# August 2025: Docker Port Monitoring Rules & Workflow

- All port monitoring logic is unified under a single backend/API. Legacy code removed.
- `/api/port-monitor/containers` endpoint provides live Docker container list for the UI.
- Manual public IPs: If a user enters a manual IP, the system will pause auto-restarts and notify the user after 3 consecutive unreachable checks. A warning is shown in the UI/event log until the user updates/disables the manual IP.
- After restarting a primary container, the system waits up to 60s for the port to be reachable. If not, but the container is running, it proceeds to restart secondaries and notifies the user. If not running, secondaries are not restarted and the user is notified.
- All port monitoring actions (checks, restarts, failures, manual IP pauses) are logged to the UI event log and backend logs.
- If Docker socket permissions are missing, port monitoring is disabled and a warning is shown in the UI.
- The `DOCKER_GID` environment variable can be set to match your host's Docker group GID for proper Docker socket access. See README for details.

# Automation Types
- **VIP Automation:** Point-based and time-based triggers, with safe integer checks. UI uses "VIP Duration" for selection.
- **Upload Credit Automation:** Point-based and time-based triggers, with safe integer checks. Now fully implemented and logged.
# MouseTrap Application Documentation

## Overview
MouseTrap is a modular automation and monitoring tool for MaM (MyAnonamouse) seedbox sessions, built with a FastAPI backend and a React frontend. It automates session checks, event logging, and perk purchases, and provides a clear, user-friendly UI for monitoring and control.

---

## Technology Stack
- **Backend:** Python 3, FastAPI, APScheduler, requests
- **Frontend:** React (with MUI), JavaScript/JSX
- **Containerization:** Docker, Docker Compose
- **Data Storage:** YAML for config/session, JSON for event log

---

- **Session Monitoring:** Regularly checks IP/ASN for configured sessions, detects changes, and logs all significant events.
- **Automation:** Supports automated purchases of perks (VIP, Upload Credit) based on user-configured rules. All automations have integer guardrails to prevent errors if points or thresholds are missing or None.
- **Event Log:** All important backend activities (manual, scheduled, automation, session add/delete, port monitoring) are logged and surfaced in the UI with clear event types. Session add/delete and port monitoring events are always global.
- **UI Controls:** Manual check, update, and purchase actions; real-time status and event log display; color-coded status messages. The VIP purchase dropdown is labeled "VIP Duration" for clarity.
- **Config Management:** Edit and save session and automation settings via the UI.
- **Port Monitoring:** Global card for monitoring container ports, with auto-restart and event logging. Feature is robust to missing Docker permissions.

---


- **Comprehensive Logging:**
	- All backend actions (manual, automation, scheduled), session add/save/delete, and port monitoring actions are logged.
	- Session add/delete and port monitoring events are always global (not session-specific).
	- Each log entry includes timestamp, label (if applicable), event type, details, and status message.

- **Auto Update Field:**
	- The `auto_update` field in event log entries is always a user-friendly string.
	- If no update was attempted, `auto_update` is always set to `"N/A"` (never `null`).
	- If an update was attempted, `auto_update` contains a summary string (success/error message).

- **Status Message:**
	- The `status_message` field always reflects the true backend action/result.
	- Priority: error message > explicit success message > fallback status message.
	- No misleading or generic messages after an update attempt.

- **No Nulls:**
	- The event log never writes `null` for `auto_update` or other user-facing fields.

- **UI Consistency:**
	- The frontend event log panel displays all backend activity, color-coded by event type and result.
	- The UI never shows `null` or confusing values for any event log field.


## Example Event Log Entry

```
{
	"timestamp": "2025-08-14T20:59:42.000000+00:00",
	"label": "ExampleSession",
	"event_type": "manual",
	"details": {
		"ip_compare": "192.0.2.1 -> 192.0.2.1",
		"asn_compare": "AS65501 -> AS65501",
		"auto_update": "N/A"
	},
	"status_message": "No change detected. Update not needed."
}
```

## ASN Changed Notification

- MouseTrap detects ASN changes for sessions and logs them as events.
- Users can enable notifications for ASN changes in the Notifications card (email/webhook/Discord).
- Event log entries for ASN changes include old and new ASN values for auditing.

## Port Monitoring

- Port Monitoring is a fully implemented feature.
- The Port Monitoring card on the dashboard allows users to monitor Docker container ports, auto-restart containers, and receive notifications on failures.
- All port monitoring events are logged globally and surfaced in the UI event log.
- Robust to missing Docker permissions; disables gracefully if Docker is unavailable.

## Notification System Improvements

- Notification event types are now fully configurable in the UI, including new event types like ASN Changed.
- Webhook and email notification options improved for reliability and clarity.
- All documentation and event log examples use only example data—no real IDs, usernames, IPs, or ASNs.

# Docker Image Optimization & Static File Handling (2025-08)

## Multi-Stage Build & Static Assets
The Dockerfile uses a multi-stage build to keep the final image small and secure:
- The React frontend is built in a separate stage, and only the production build output is copied into the backend image.
- To avoid duplicating the static build output, the image only stores one copy (in `/app/frontend/build`).
- A symlink is created from `/frontend/build` to `/app/frontend/build` so the backend can serve static files from the expected path, without doubling image size.

**Result:**
- Image size reduced by more than 50% (e.g., from ~550MB to ~240MB).
- No loss of functionality; static files and favicons are handled by the React build process.

## Troubleshooting: Static Directory
- If you see errors about `/frontend/build/static` missing, ensure the symlink is present in the image and that the React build completed successfully.
- The symlink is created in the Dockerfile with:
	```Dockerfile
	RUN mkdir -p /frontend && ln -s /app/frontend/build /frontend/build
	```
- If you change backend static file serving logic, update the Dockerfile and this doc accordingly.

## Port Monitor Notifications: Global vs Per-Port

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
## File/Directory Structure (Key Parts)
- `backend/`: FastAPI app, automation logic, event log, config/session management
- `frontend/`: React app, UI components, event log panel, status card
- `logs/ui_event_log.json`: Stores all UI-visible event log entries
- `config/`: YAML config/session files

---

## How It Works (Summary)
1. **Backend runs scheduled checks** (APScheduler) and logs [scheduled] events.
2. **User actions** (button clicks, purchases, config saves) trigger [manual] or [automation] events.
3. **UI timer** only fetches latest status/event log; does not trigger backend checks or log events.
4. **Event log** is always up-to-date and visible in the UI, with clear event types and details.

---

## Best Practices
- Only trigger manual checks for explicit user actions.
- Use the event log to audit all backend activity.
- Keep config and session files up to date for reliable automation.
- If making code changes, update this documentation to reflect new rules or features.

---

## Contributors
- Project owner: sirjmann92
- Coding assistant: GitHub Copilot

---

## Last Updated
August 20, 2025
