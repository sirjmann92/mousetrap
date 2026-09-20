
# Purchase Logging and Event Log Behavior

This document describes how MouseTrap logs all manual and automated perk purchases (Upload Credit, VIP) in both backend logs and the UI event log. For the rules and guardrails that determine when purchases are allowed, see [purchase_rules.md](purchase_rules.md).

## Overview
All manual and automated purchases are logged if and only if a purchase is attempted or an automation is enabled and actively managed by the backend. No log entries are created for automations that are disabled or for sessions that are not eligible to automate a purchase type (see rules doc).


## Event Log Entries
- **Manual Purchases:**
  - "Purchased 50GB upload credit"
  - "Purchased VIP (4 weeks)"
- **Automated Purchases:**
  - "Automated purchase: 50GB upload credit"
  - "Automated purchase: VIP (4 weeks)"
- **Failures:**
  - Will show as e.g. "Upload credit purchase failed (50GB)" or "Automated VIP purchase failed (4 weeks)"
  - When MaM gave a reason, it is shown beneath the entry as "Reason: ...", in MaM's own wording
- **Skipped Automations:**
  - "Not enough points: 9133 < 20000" (session-level guardrail)
  - "Below automation point threshold: 9133 < 10000" (automation-level guardrail)
  - "Failed to fetch status: ..." (MaM reported no point balance, so no guardrail could be evaluated and the session is left until the next run)
  - Skipped events are only logged for automations that are enabled and managed by the backend.


## Backend Log Entries
- All purchase attempts (manual or automated) are logged with clear, explicit messages, e.g.:
  - "[ManualUpload] Purchase: 50GB upload credit for session 'Gluetun' succeeded."
  - "[VIPAuto] Automated purchase: VIP (4 weeks) for session 'Gluetun' succeeded."
  - Failures are also clearly logged with error details.
  - A purchase MaM refuses is reported with MaM's own wording, e.g. "[ManualVIP] Purchase: VIP (max) for session 'Gluetun' FAILED. Error: Min VIP is 1 week purchased for Automated methods."
- Skipped automations (due to guardrails) are only logged if the automation is enabled for that session.


## Coverage
- Applies to both purchase types: Upload Credit and VIP
- Applies to both manual (API-triggered) and automated (scheduled) flows
- All logs and event log entries are now human-readable and unambiguous
- Logging is always consistent with the rules in [purchase_rules.md](purchase_rules.md)


## How to View
- **Event Log:** Accessible from the UI (Event Log panel/button)
- **Backend Logs:** Viewable in Docker logs or backend log files


## Why a Purchase MaM Accepts on the Website Can Fail Here

`bonusBuy.php` reports a refusal as HTTP `200 OK` with `{"success": false,
"error": "..."}` in the body, so a refused purchase is not an HTTP error and the
reason only exists in that body.

The refusal users hit most often is:

```
Min VIP is 1 week purchased for Automated methods
```

Purchases made through the API must add at least a full week of VIP. The MaM
website has no such restriction, so "Max me out!" can succeed in a browser —
adding a few days — while the same purchase from MouseTrap is refused. This is
a MaM-side rule, not a MouseTrap limitation.

---

_Last updated: 2026-09-19_
