
# Purchase Logging and Event Log Behavior

This document describes how MouseTrap logs all manual and automated perk purchases (Upload Credit, VIP) in both backend logs and the UI event log. For the rules and guardrails that determine when purchases are allowed, see [purchase_rules.md](purchase_rules.md).

## Overview
All manual and automated purchases are logged if and only if a purchase is attempted or an automation is enabled and actively managed by the backend. No log entries are created for automations that are disabled or for sessions that are not eligible to automate a purchase type (see rules doc).


## Event Log Entries
- **Manual Purchases:**
  - "Purchased 1GB upload credit"
  - "Purchased VIP (4 weeks)"
- **Automated Purchases:**
  - "Automated purchase: 1GB upload credit"
  - "Automated purchase: VIP (4 weeks)"
- **Failures:**
  - Will show as e.g. "Upload credit purchase failed (1GB)" or "Automated VIP purchase failed (4 weeks)"
- **Skipped Automations:**
  - "Not enough points: 9133 < 20000" (session-level guardrail)
  - "Below automation point threshold: 9133 < 10000" (automation-level guardrail)
  - Skipped events are only logged for automations that are enabled and managed by the backend.


## Backend Log Entries
- All purchase attempts (manual or automated) are logged with clear, explicit messages, e.g.:
  - "[ManualUpload] Purchase: 1GB upload credit for session 'Gluetun' succeeded."
  - "[VIPAuto] Automated purchase: VIP (4 weeks) for session 'Gluetun' succeeded."
  - Failures are also clearly logged with error details.
- Skipped automations (due to guardrails) are only logged if the automation is enabled for that session.


## Coverage
- Applies to both purchase types: Upload Credit and VIP
- Applies to both manual (API-triggered) and automated (scheduled) flows
- All logs and event log entries are now human-readable and unambiguous
- Logging is always consistent with the rules in [purchase_rules.md](purchase_rules.md)


## How to View
- **Event Log:** Accessible from the UI (Event Log panel/button)
- **Backend Logs:** Viewable in Docker logs or backend log files

---

_Last updated: 2025-09-01_
