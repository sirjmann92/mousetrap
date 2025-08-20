# Purchase Logging and Event Log Behavior

## Overview
All manual and automated perk purchases (Upload Credit, VIP, Wedge) are now fully logged in both the backend logs and the UI event log. This applies to both manual (user-triggered) and automated (scheduled/automatic) purchases.

## Event Log Entries
- **Manual Purchases:**
  - "Purchased 1GB upload credit"
  - "Purchased VIP (4 weeks)"
  - "Purchased Wedge (points)"
- **Automated Purchases:**
  - "Automated purchase: 1GB upload credit"
  - "Automated purchase: VIP (4 weeks)"
  - "Automated purchase: Wedge (points)"
- **Failures:**
  - Will show as e.g. "Upload credit purchase failed (1GB)" or "Automated VIP purchase failed (4 weeks)"

## Backend Log Entries
- All purchase attempts are logged with clear, explicit messages, e.g.:
  - "[ManualUpload] Purchase: 1GB upload credit for session 'Gluetun' succeeded."
  - "[VIPAuto] Automated purchase: VIP (4 weeks) for session 'Gluetun' succeeded."
  - Failures are also clearly logged with error details.

## Coverage
- Applies to all three purchase types: Upload Credit, VIP, Wedge
- Applies to both manual (API-triggered) and automated (scheduled) flows
- All logs and event log entries are now human-readable and unambiguous

## How to View
- **Event Log:** Accessible from the UI (Event Log panel/button)
- **Backend Logs:** Viewable in Docker logs or backend log files

---
_Last updated: 2025-08-16_
