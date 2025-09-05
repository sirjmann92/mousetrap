# September 5, 2025

## IP Lookup System Overhaul 🚀

### **Token-Aware Provider Chain**
- **Intelligent fallback strategy:** System now adapts provider chain based on available API tokens
- **Four token scenarios supported:** Both tokens, IPinfo only, ipdata only, or no tokens
- **Optimal provider selection:** Automatically uses best available provider first

### **Enhanced Authentication & Rate Limits**
- **IPinfo Lite API:** Added Bearer token authentication (50,000 requests/month)
- **IPinfo Standard fallback:** Free tier HTTPS fallback (1,000 requests/month) 
- **ipdata.co improvements:** Uses free tier (1,500/day) when no API key provided
- **Graceful degradation:** Works reliably even without any API tokens

### **Performance & Reliability Improvements**
- **Request caching:** 30-second cache prevents duplicate API calls
- **Rate-limited logging:** Prevents log spam while maintaining error visibility  
- **Connection error handling:** Robust fallback when providers are unreachable
- **Provider validation:** Comprehensive testing of all fallback scenarios

### **Enhanced Logging & Visibility**
- **Session check visibility:** Core IP/ASN comparison results now visible at INFO level
- **Operational confidence:** Clear logging when "No change needed" during normal operation
- **Provider status:** Easy monitoring of which providers are active/failing
- **Debugging tools:** Enhanced troubleshooting commands and documentation

### **Documentation Updates**
- **Complete provider strategy guide:** Comprehensive documentation of token-based selection
- **Setup instructions:** Clear configuration steps for both IPinfo and ipdata tokens
- **Troubleshooting section:** Commands and techniques for diagnosing provider issues
- **Performance recommendations:** Best practices for optimal API usage

---

# August 30, 2025

## Major Changes

- **Unified Docker Port Monitoring:**
  - All port monitoring logic is now unified under a single backend/API. Legacy/duplicate code removed.
  - `/api/port-monitor/containers` endpoint provides a live Docker container list for the UI.
  - Manual public IPs: If a user enters a manual IP, the system will pause auto-restarts and notify the user after 3 consecutive unreachable checks. A warning is shown in the UI/event log until the user updates/disables the manual IP.
  - After restarting a primary container, the system waits up to 60s for the port to be reachable. If not, but the container is running, it proceeds to restart secondaries and notifies the user. If not running, secondaries are not restarted and the user is notified.
  - All port monitoring actions (checks, restarts, failures, manual IP pauses) are logged to the UI event log and backend logs.
  - If Docker socket permissions are missing, port monitoring is disabled and a warning is shown in the UI.
  - The `DOCKER_GID` environment variable can be set to match your host's Docker group GID for proper Docker socket access. See README for details.

## Other Improvements
- Improved event log clarity and error reporting for all automation types.
- Documentation scrubbed of real IDs, usernames, IPs, ASNs, and other personal data.
- All documentation and changelogs updated for new port monitoring workflow and environment variable usage.

## Late August 2025

### New Features & Fixes
- **Upload Credit Automation:**
  - Added backend automation for upload credit purchases, supporting both point-based and time-based triggers.
  - UI and backend now support all three automation types: Wedge, VIP, and Upload Credit.
- **Integer Guardrails:**
  - All automation logic now safely handles None values for points and thresholds, preventing comparison errors and automation crashes.
- **VIP Duration Label:**
  - The VIP purchase dropdown label in the UI is now "VIP Duration" for clarity.
- **Bugfixes:**
  - Fixed rare automation errors when points or thresholds were None.
  - Improved event log clarity and error reporting for all automation types.

# MouseTrap Changelog & Upgrade Notes

## August 2025

### Major Features & Improvements
- **Port Monitoring:**
  - Global card for monitoring Docker container ports, with auto-restart and event logging.
  - Per-check intervals, persistent config in `/config/port_monitoring.yaml`.
  - Color-coded status, public IP display, and robust Docker permission handling.
- **Event Log:**
  - Filter by Global, All Events, or any session label.
  - UI and backend event log improvements, color-coded entries, and persistent storage.
- **UI/UX:**
  - Modernized dashboard, improved dark mode support, and better error/warning feedback.
  - All controls and logs are accessible and color-coded for clarity.
- **Security:**
  - Compose files in `.gitignore` by default; secrets never committed.
  - Sensitive data handling and documentation improvements.

### Recent Updates (August 2025)
- **ASN Changed Notification:**
  - Added backend and frontend support for ASN change detection and notification. Users can now enable notifications for ASN changes in the Notifications card.
- **Notification System Improvements:**
  - Notification event types are now fully configurable in the UI, including new event types.
  - Webhook and email notification options improved for reliability and clarity.
- **Scrollbar & Gutter UI:**
  - Scrollbar and gutter width are now thinner and visually less intrusive, with stable layout across browsers.
- **Documentation & Data Privacy:**
  - All documentation scrubbed of real IDs, usernames, IPs, ASNs, and other personal data. Only example values are used.
  - Docs are now safe to publish and included in version control.

### Upgrade Notes
- If upgrading from a previous version, ensure your `/config` and `/logs` volumes are mapped as shown in the README.
- Port monitoring config is now stored in `/config/port_monitoring.yaml` (host path).
- If you see permission errors, check your Docker group membership and volume mounts.

---

See the README for full usage, configuration, and troubleshooting details.
