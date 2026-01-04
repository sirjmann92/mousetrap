# January 4, 2026

## Docker Socket Proxy Support Added 🔒

### **Enhanced Security for Port Monitoring**
- **Docker Socket Proxy support**: Connect to Docker via HTTP proxy instead of direct socket access
- **Set `DOCKER_HOST` environment variable**: Point to socket proxy (e.g., `tcp://docker-proxy:2375`)
- **Backward compatible**: Existing direct socket access continues to work unchanged
- **Production-ready**: Industry best practice for secure container management

### **Two Access Methods**

**Docker Socket Proxy (Recommended)**
- No direct socket mount required
- Fine-grained permission control (CONTAINERS, POST, etc.)
- Enhanced security - MouseTrap never touches the Docker socket
- Compatible with Tecnativa/docker-socket-proxy and similar solutions

**Direct Socket Access (Existing)**
- Mount `/var/run/docker.sock:/var/run/docker.sock:ro`
- Set `DOCKER_GID` for non-standard Docker group IDs
- Works as before - zero breaking changes

### **Implementation Details**
- Updated `get_docker_client()` in port_monitor.py
- Auto-detects `DOCKER_HOST` environment variable
- Falls back to default socket if not set
- Enhanced logging shows connection method used
- Error messages include DOCKER_HOST value for debugging

### **Documentation Updates**
- README: Added Docker Socket Proxy configuration example
- Port Monitoring docs: Explained both access methods
- Troubleshooting guide: Socket proxy setup and debugging
- Features guide: Updated Docker access section

---

# January 3, 2026

## Chaptarr Integration Added 🎉

### **Multi-Indexer Support**
- **Chaptarr integration:** MouseTrap now supports both Prowlarr and Chaptarr indexer integrations
- **Unified interface:** New "Indexer Integrations" section replaces the old "Prowlarr Integration"
- **Independent configuration:** Each service (Prowlarr/Chaptarr) can be enabled/disabled separately
- **Simultaneous updates:** When both are enabled, MAM ID updates are pushed to both services
- **Smart notifications:** Event logs show which service(s) were successfully updated or failed

### **Key Differences**
| Feature | Prowlarr | Chaptarr |
|---------|----------|----------|
| Default Port | 9696 | 8789 |
| Implementation | MyAnonamouse | MyAnonaMouse (case-insensitive) |
| Field Name | mamId | MamId |
| Force Save | No | Yes |

### **New API Endpoints**
- `POST /api/chaptarr/test` - Test Chaptarr connection and find MAM indexer
- `POST /api/chaptarr/update` - Update MAM ID in Chaptarr for a session
- `POST /api/indexer/update` - Unified endpoint that updates all enabled indexers

### **UI Changes**
- **"UPDATE PROWLARR" → "UPDATE":** Button now updates whichever services are enabled
- **Tooltip added:** Explains that clicking updates Prowlarr, Chaptarr, or both depending on configuration
- **Separate test buttons:** Each service has its own TEST button for troubleshooting
- **Independent auto-update:** Each service can be configured to auto-update on save independently

### **Backend Changes**
- **Auto-sync logic:** When MAM ID changes, both Prowlarr and Chaptarr are updated if enabled
- **Detailed event logging:** Shows which services succeeded/failed with specific error messages
- **Expiry notifications:** Notifications now list all enabled indexer services
- **New integration module:** `chaptarr_integration.py` mirrors Prowlarr functionality

### **Documentation**
- **New guide:** [Indexer Integrations](docs/indexer-integrations.md) covers both services
- **Migration notes:** Existing Prowlarr configurations continue to work unchanged
- **Configuration examples:** YAML examples showing both services configured

### **Backward Compatibility**
- Existing Prowlarr configurations remain unchanged
- Old API endpoints (`/api/prowlarr/*`) still work for backward compatibility
- Sessions without Chaptarr configuration simply won't use it
- No breaking changes to existing workflows

---

# October 22, 2025

## Notification System Consolidation 🔔

### **Consolidated Notification Event Types**
- **Port monitor events consolidated:**
  - All port monitoring failures now use `port_monitor_failure` event type
  - Consolidated: `port_monitor_port_timeout`, `port_monitor_container_not_running`, `port_monitor_manual_ip_paused`
  - Single "Docker Port Monitor Failure" checkbox controls all port monitoring notifications
  - Different failure scenarios still have distinct messages for clarity
  
- **Seedbox exception handling improved:**
  - Changed `seedbox_update_exception` to `seedbox_update_failure`
  - Unexpected seedbox update errors now respect "Seedbox Update → Failure" checkbox
  - Consistent failure handling across all seedbox update issues

- **Removed unused UI elements:**
  - Removed non-functional "ASN Changed" notification checkbox
  - ASN mismatch notifications properly handled via "Seedbox Update → Failure"

### **Impact**
All notification checkboxes in the UI now properly control their related backend events. No more orphaned notifications or missed alerts due to event type mismatches.

---

# October 21, 2025

## ASN Notification Improvements & Session Management 🔔

### **ASN Mismatch Detection for ASN Locked Sessions**
- **Smart ASN change handling:**
  - ASN changes are now tracked silently without triggering preventive notifications
  - For **ASN Locked** sessions: Only notifies when 403 errors occur due to ASN mismatch
  - For **IP Locked** sessions: ASN changes are tracked but ignored (not relevant to IP-locked sessions)
- **Enhanced 403 error notifications:**
  - Detects when MAM invalidates cookies due to ASN mismatch on ASN Locked sessions
  - Provides step-by-step instructions for adding new ASN via MAM's Manage Session UI
  - Notification includes: old ASN → new ASN comparison, exact workflow steps, no guesswork
- **Actionable messaging:**
  - Guides users through: Login → Preferences → Security → Manage Session → Add IP from new ASN
  - MAM auto-detects ASN when IP is added (users don't manually enter ASN numbers)
  - Clear explanation that existing mam_id cookie remains valid once ASN is registered

### **Session Configuration Improvements**
- **MAM Session Created Date persistence:**
  - Fixed datetime-local input compatibility issue (empty string vs null handling)
  - Date now properly persists across page refreshes and session saves
  - Frontend converts between empty strings (input requirement) and null (storage format)

### **Session Type Context**
MouseTrap supports two MAM session types:
- **ASN Locked**: Session locked to specific ASN numbers (recommended for VPNs that switch servers)
- **IP Locked**: Session locked to specific IP addresses (for static IPs or non-switching proxies)

The enhanced ASN mismatch detection only applies to ASN Locked sessions, as IP Locked sessions don't validate ASN.

---

# October 4, 2025

## Prowlarr Integration Fixes 🔧

### **Bug Fixes**
- **Fixed bottom UPDATE PROWLARR button in Session Configuration:**
  - Corrected API endpoint from `/api/prowlarr/update_mam_id` (non-existent) to `/api/prowlarr/update`
  - Button now properly updates MAM ID in Prowlarr
  - Previously showed empty error snackbar due to network error from wrong endpoint
- **Improved Prowlarr error handling and display:**
  - Enhanced error message parsing to show detailed Prowlarr API errors
  - Backend now parses JSON error responses from Prowlarr (e.g., expired mam_id errors)
  - Frontend extracts and displays specific error messages from Prowlarr validation failures
  - Changed error severity from 'warning' to 'error' for better visibility
  - Example: Shows "mam_id expired or invalid" instead of generic "Update failed"

### **Feature Restoration**
- **Restored missing "Auto-update on Save" checkbox:**
  - Re-added checkbox to Prowlarr Integration accordion
  - Label: "Auto-update Prowlarr on Save"
  - When enabled, automatically updates Prowlarr whenever MAM ID is changed and session is saved
  - Backend support (`auto_update_on_save` field) was present but UI checkbox was missing
  - Positioned below "Notify Before Expiry (days)" field and UPDATE PROWLARR button

### **Technical Details**
- Added `json` import to `prowlarr_integration.py` for error response parsing
- Both StatusCard and ProwlarrConfig components now handle detailed error structures
- Backend returns `detail` field with full error object array from Prowlarr API
- Frontend formats error arrays into human-readable messages

---

# October 3, 2025

## UI/UX Polish & Consistency Improvements ✨

### **Session Configuration Enhancements**
- **Manage MAM ID button:** Added quick-access button next to MAM ID field linking to MyAnonamouse Security page for easy session renewal
- **MAM Session Date label fix:** Changed from custom Typography to standard MUI TextField label with proper shrink behavior
- **Required field validation:** Improved consistency - red borders only appear after save attempt (not when empty initially)
  - Session Label, Session Type, Interval, MAM ID, and IP Address now follow same validation pattern
  - Asterisks (*) indicate required fields, red borders indicate validation errors
- **Button alignment:** Fine-tuned "Manage MAM ID" button positioning for perfect alignment with MAM ID field

### **Visual Consistency & Theme Updates**
- **Accordion styling:** Prowlarr Integration and Notifications Configuration accordions now match MAM Details/Network Details style
  - Subtle gray background (`#272626` dark / `#f5f5f5` light)
  - Rounded corners with proper overflow handling
  - Bold subtitle2 headers (instead of h6)
- **Light mode improvements:** Added softer background color (`#f0f2f5`) instead of pure white
  - Better contrast between page and white cards
  - Easier on the eyes, clearer visual boundaries
- **Dark mode cards:** Lightened from `#1e1e1e` to `#242424` for improved button visibility
  - Outlined buttons and disabled states now more readable
- **Status card buttons:** Changed CHECK NOW from outlined to contained variant for consistency with UPDATE SEEDBOX and UPDATE PROWLARR

### **Proxy Configuration Validation**
- **Smart button states:** CLEAR and SAVE PROXY buttons now intelligently enable/disable based on form state
  - All empty: Both buttons disabled
  - Partial input: CLEAR enabled, SAVE PROXY disabled
  - All required fields filled (label, host, port): Both buttons enabled
  - Prevents invalid proxy saves and improves UX clarity

---

# October 2, 2025

## Prowlarr Integration & Session Expiry Tracking 🎯

### **Prowlarr Integration Features**
- **Automatic MAM ID sync:** MouseTrap can now automatically update Prowlarr's MyAnonamouse indexer with your current MAM session ID
- **Smart change detection:** Auto-update only triggers when MAM ID actually changes (not on every save)
- **Manual update button:** Force update Prowlarr with "UPDATE PROWLARR" button for manual control
- **Session creation tracking:** Track when MAM sessions are created with datetime picker (NOW button uses server timezone)
- **90-day expiry monitoring:** Daily automated checks for MAM session expiry with configurable notification threshold
- **Secure notifications:** MAM IDs redacted in notifications (shows only last 8 characters, like credit cards)
- **Test endpoint:** `/api/prowlarr/test_expiry_notification` for validating notification workflow
- **Event logging:** All Prowlarr operations logged to UI event log for audit trail

### **UI/UX Improvements**
- **Redesigned Notifications Card:** Consolidated success/failure notification pairs into single rows with checkboxes (automation, manual_purchase, seedbox_update) for space efficiency
- **Configuration Accordion:** Moved Webhook, SMTP, and Apprise configuration sections into collapsible accordion within Notifications card
- **Prowlarr Accordion:** Converted Prowlarr Integration to proper MUI Accordion pattern matching Notifications styling with consistent borders and spacing
- **Dynamic MAM ID fields:** MAM ID and Browser MAM ID + UID fields now auto-resize (2 rows hidden, 6 rows visible) for better space utilization
- **Refined spacing:** Reduced gaps between form sections throughout UI (Configuration accordion, Prowlarr sections, MAM Session Created)
- **Button layout optimization:** Moved UPDATE PROWLARR button to same row as "Notify Before Expiry" field, aligned right
- **Info tooltips:** Replaced long helper text with info icon tooltips for cleaner appearance (Notify Before Expiry, Prowlarr Integration header)
- **Required field indicators:** Added asterisks to all required fields in Prowlarr configuration (Host, Port, API Key)
- **Dark mode datetime picker:** Native browser datetime-local input now respects dark theme with `colorScheme` CSS
- **Server timezone handling:** NOW button fetches server time via `/api/server_time` endpoint for consistent timestamps
- **Prowlarr config persistence:** Fixed bug where Prowlarr settings weren't loading after container restart

### **Backend Enhancements**
- **Daily scheduler job:** APScheduler runs `check_mam_session_expiry()` at 8:00 AM daily
- **Multi-channel notifications:** Expiry warnings sent via configured channels (SMTP/Webhook/Apprise)
- **Configurable threshold:** Set notification warning days before expiry (default: 7 days)
- **Auto-update logic:** `update_prowlarr_mam_id()` function handles Prowlarr API interactions

### **Documentation & Testing**
- **Prowlarr setup guide:** Comprehensive documentation in `docs/prowlarr-integration.md`
- **Test script:** `tests/test_expiry_notification.py` for validating notification delivery
- **API reference updates:** New Prowlarr endpoints documented
- **Security helper:** `redact_mam_id()` function for safe credential handling in logs/notifications

---

# October 1-2, 2025

## Infrastructure Modernization & Bug Fixes 🚀

### **PR #24: Major Frontend Build System Upgrade**
- **Vite migration:** Replaced Create React App with Vite for 10x faster builds and instant HMR
- **Modern linting:** Migrated from ESLint + Prettier to Biome for unified, faster code quality checks
- **Node.js 22 LTS:** Upgraded from Node 20 to Node 22.20.0 for latest performance improvements
- **Python 3.13:** Backend upgraded to Python 3.13-alpine for enhanced performance and features
- **Build optimization:** Improved Docker multi-stage build with better layer caching

### **Post-Migration UI Fixes**
- **TextField masking restored:** Fixed password masking for multiline MAM ID fields using `WebkitTextSecurity`
- **Auto-expand behavior:** Restored `minRows={2}` `maxRows={6}` for MAM ID fields (auto-expands on content)
- **Form spacing consistency:** Standardized component spacing with `gap: 2, mb: 3` throughout
- **Tooltip positioning:** Fixed info icon overlap issues by adjusting spacing

### **Infrastructure Issues Resolved**
- **Favicon 404 fixed:** Corrected `BASE_DIR` resolution after Docker file structure changes in PR #24
- **Proper uvicorn import:** Changed startup to use `backend.app:app` instead of `app:app`
- **Static file mounting:** Fixed asset serving path to `/app/frontend/build`

### **Logging Improvements**
- **Reduced log noise:** Changed `/api/status` endpoint to use DEBUG level when no session label provided
- **Cleaner production logs:** Eliminated excessive "Session 'None' not found" warnings during normal operation
- **Better debugging:** Maintained WARNING level for actual configuration issues

### **Developer Experience**
- **Pre-commit TypeScript checks:** Added TypeScript validation to prevent type errors
- **Biome integration:** Fast, unified linting and formatting with zero-config defaults
- **GitHub Actions:** Updated CI workflows for new build system and linting tools

---

# September 26, 2025

## Bug Fixes & Improvements

### **VIP Automation Saving/Loading Bug Fixed**
- Fixed an issue where changes to VIP Duration (weeks) in the automation UI were not being saved or loaded correctly
- Now, the correct VIP duration is persisted and restored for each session
- Improved state initialization in the frontend to ensure config values are loaded before rendering

### **Other Notable Changes**
- Updated README and documentation to use `compose.yaml` and `docker compose` commands instead of legacy `docker-compose.yml`/`docker-compose`
- Removed invalid 50GB upload credit option and added backend validation for allowed values
- Fixed notification deduplication for Pre-H&R and H&R events (now works for scheduled jobs)

# September 25, 2025

## Logging & UI Enhancements 🎯

### **Session Scheduler Optimization**
- **Efficient job management:** Session updates now register individual jobs instead of bulk re-registration
- **Performance improvement:** Prevents unnecessary scheduler overhead when only one session changes
- **Targeted updates:** Only modified sessions trigger scheduler updates, improving system efficiency

### **Proxy Testing Feature**
- **Interactive proxy validation:** Added "Test Proxy" button for each configured proxy in the UI
- **Visual feedback:** Success/failure notifications with Material-UI Alert components
- **Auto-dismiss notifications:** 2-second timeout for clean user experience
- **Consistent styling:** Matches PortMonitorCard design patterns for UI consistency

### **Enhanced Status Visibility**
- **Connectable status indicator:** Added "Connectable" status next to Session Status in StatusCard
- **Visual status indicators:** Green checkmark for connectable, red X for non-connectable
- **Real-time connectivity:** Displays current connection health alongside session information
- **Data-driven display:** Pulls connectable status from session details for accuracy

### **Code Quality Improvements**
- **React hooks optimization:** Fixed hooks ordering for proper component lifecycle management
- **Material-UI syntax:** Corrected theme callback syntax for proper conditional rendering
- **Pre-commit hooks:** Automated whitespace trimming and code formatting on commits
- **Consistent patterns:** Aligned proxy testing UI with existing card component styles

---

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
  - UI and backend now support automation types: VIP and Upload Credit.
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
