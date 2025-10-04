# October 4, 2025

## Browser Cookie Setup Card & UI Improvements ✨

### **New Browser Cookie Setup Card**
- **Separated browser cookie management from Vault Configuration:**
  - Created dedicated `MAMBrowserSetupCard.jsx` component for browser cookie extraction and validation
  - Renamed from "MAM Browser Cookie Setup" to "Browser Cookie Setup" for clarity
  - Moved bookmarklet, browser cookie input, connection method, and vault access testing to new card
  - Vault Configuration card now focuses solely on donation settings and automation
- **React 19 bookmarklet compatibility fix:**
  - Fixed bookmarklet drag-to-bookmark functionality broken by React 19 security changes
  - Implemented callback ref pattern: `ref={(node) => { if (node) node.setAttribute('href', code); }}`
  - Sets `href` immediately when element is created, bypassing React's security blocking of `javascript:` URLs
  - Works with React 19's stricter security model without compromising functionality

### **Notification Card Enhancements**
- **Visual notification method indicators:**
  - Added icon-based indicators showing which notification methods are configured
  - Icons displayed on far right of card header, clickable to expand card and Configuration accordion
  - Uses official brand logos from Wikimedia Commons for Gmail and Discord (proper licensing and consistency)
- **Icon implementations:**
  - **Gmail:** Multicolor "M" logo SVG from Wikimedia Commons (automatically detected when SMTP host contains "gmail")
  - **Discord:** Official blurple game controller logo SVG from Wikimedia Commons (for Discord webhooks)
  - **Email:** Material-UI EmailIcon in blue (#4285F4) for non-Gmail SMTP
  - **Webhook:** Material-UI WebhookIcon in red (#FF6B6B) for generic webhooks
  - **Apprise:** Font Awesome bullhorn icon in orange (#FFA726) - no official logo available
- **Removed info tooltip:** Cleaned up card header by removing redundant info icon tooltip
- **Smart detection:** Checks actual configuration fields (smtp.host, webhook_url, apprise.url) not event rules

### **Perk Automation Card Improvements**
- **Vault currency display:**
  - Added Wedges and Cheese counters next to Points display in card header
  - Fetches from associated vault configuration (prefers matching session, falls back to first available)
  - Displays as: `Points: 12,345 | Wedges: 678 | Cheese: 901` with green success color
  - Currency values shown only when available and not loading

### **Component Organization**
- **Card reordering for better workflow:**
  1. Session Status
  2. Session Configuration
  3. Perk Purchase & Automation
  4. Millionaire's Vault Configuration
  5. **Notifications** (moved up from position 8)
  6. **Browser Cookie Setup** (new card, position 6)
  7. Docker Port Monitor
  8. Proxy Configuration
- **Parent state management:**
  - `vaultConfigurations` now managed in `App.jsx` and passed to child components
  - Added `onConfigUpdate` callback for child components to trigger parent refresh
  - Prevents stale data and unnecessary API calls

### **Technical Details**
- Added Font Awesome 6.5.1 CDN to `index.html` for Apprise bullhorn icon
- Inline SVG components for Gmail and Discord logos (no external dependencies)
- Callback ref pattern bypasses React 19's `href` security: sets attribute after render but before React's security check
- Bookmarklet extracts `mam_id`, `uid`, and browser type in one click

---

## Vault Donation Success Detection Fix 🔧

### **Bug Fixes**
- **Fixed vault donation success detection race condition:**
  - Added 2-second delay after donation POST before checking points balance
  - Prevents false "no success confirmation" errors when MAM backend processes donation slowly
  - Affects both direct and proxy donation methods
  - Race condition occurred when points verification happened before MAM's database updated

### **Improved Vault Donation Logging**
- **Enhanced points verification logging:**
  - Changed verification logs from DEBUG to INFO level for better visibility
  - Added actual delta calculation: shows exact point change vs expected change
  - Improved error messages with detailed point comparison data
  - Format: `Points before: X, Current: Y, Expected: Z, Actual delta: W`
- **Better failure diagnostics:**
  - Error messages now include point deltas when verification fails
  - Shows tolerance threshold (100 points) in warning messages
  - Helps identify whether donation actually succeeded but verification had timing issues

### **Technical Details**
- Added `await asyncio.sleep(2)` after donation POST in both `_perform_vault_donation_direct()` and `_perform_vault_donation_proxy()`
- Improved error message from generic "Donation not processed - no success confirmation received" to more detailed "Donation may have failed - no success confirmation in response and points verification inconclusive (points before: X, after: Y, expected: Z)"
- All three verification paths updated: session-based, browser-based, and proxy-based

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

### **Vault Configuration Improvements**
- **Last Donation display:** Prominent celebration-themed section showing timestamp, amount, and type (Automated/Manual) of last donation
  - Uses existing `automation.last_run` data - no need to wait for new donations!
  - Green celebration icons (🎉) flanking header for visual appeal
  - Conditionally displays: shown when viewing existing configs, hidden when creating new
  - Replaces redundant Configuration Name field (already shown in dropdown)
- **Pot tracking backend:** Enhanced to track donation amount and type for future donations
  - Backward compatible: automatically merges old configs with new fields
  - `update_pot_tracking()` now accepts amount and donation_type parameters
- **Configuration dropdown spacing:** Reduced excessive spacing when no configuration selected
- **Browser MAM ID validation:** Red border only shows after save attempt (consistent with other cards)
- **Button heights standardized:** Get Browser Cookies, Test Vault Access, and Donate Now buttons now match input field height (40px)

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

### **Backend Data Structure Updates**
- **vault_config.py:** 
  - Added `get_vault_configuration()` field merging for backward compatibility
  - Default pot_tracking schema includes `last_donation_amount` and `last_donation_type`
- **millionaires_vault_automation.py:** Updated to pass donation details to `update_pot_tracking()`

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
- **Redesigned Notifications Card:** Consolidated success/failure notification pairs into single rows with checkboxes (automation, manual_purchase, seedbox_update, vault_donation) for space efficiency
- **Configuration Accordion:** Moved Webhook, SMTP, and Apprise configuration sections into collapsible accordion within Notifications card
- **Prowlarr Accordion:** Converted Prowlarr Integration to proper MUI Accordion pattern matching Notifications styling with consistent borders and spacing
- **Dynamic MAM ID fields:** MAM ID and Browser MAM ID + UID fields now auto-resize (2 rows hidden, 6 rows visible) for better space utilization
- **Refined spacing:** Reduced gaps between form sections throughout UI (Configuration accordion, Prowlarr sections, MAM Session Created)
- **Button layout optimization:** Moved UPDATE PROWLARR button to same row as "Notify Before Expiry" field, aligned right
- **Info tooltips:** Replaced long helper text with info icon tooltips for cleaner appearance (Notify Before Expiry, Prowlarr Integration header)
- **Required field indicators:** Added asterisks to all required fields in Prowlarr configuration (Host, Port, API Key)
- **Fixed duplicate asterisks:** Removed manual asterisk from Vault Config "Connection Method" label (MUI adds it automatically)
- **Dark mode datetime picker:** Native browser datetime-local input now respects dark theme with `colorScheme` CSS
- **Server timezone handling:** NOW button fetches server time via `/api/server_time` endpoint for consistent timestamps
- **Vault session auto-update:** Vault configurations automatically update when associated session is renamed
- **Prowlarr config persistence:** Fixed bug where Prowlarr settings weren't loading after container restart
- **Vault points refresh:** Points display auto-refreshes when changing associated session (no browser refresh needed)

### **Backend Enhancements**
- **Daily scheduler job:** APScheduler runs `check_mam_session_expiry()` at 8:00 AM daily
- **Multi-channel notifications:** Expiry warnings sent via configured channels (SMTP/Webhook/Apprise)
- **Configurable threshold:** Set notification warning days before expiry (default: 7 days)
- **Auto-update logic:** `update_prowlarr_mam_id()` function handles Prowlarr API interactions
- **Session label tracking:** `update_session_label_references()` prevents orphaned vault configurations

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
- **Applied globally:** Fixes applied to both MouseTrapConfigCard and VaultConfigCard components

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

### **Reduced Logging Verbosity**
- **Vault donation automation:** Converted detailed browser interaction logs from INFO to DEBUG level
- **Cleaner production logs:** Essential success/failure information remains at INFO, detailed parsing moved to DEBUG
- **Better log readability:** Reduced noise in production environments while maintaining full debugging capability

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
