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
