# Purchase Rules: Manual and Automated

This document describes all rules and guardrails for purchases (Upload Credit, VIP) in MouseTrap, for both manual and automated flows.

## 1. Session-Level Guardrails (Apply to All Automations)
- **Minimum Points:**
  - Each session can define a minimum points value (`min_points`).
  - No automated or manual purchase will be attempted if the user's current points are below this session-level minimum.
  - This rule is enforced before any individual automation or purchase rule.

- **Unknown Points:**
  - Every points guardrail is a comparison against the balance MaM reports, so none can be applied when MaM returns no balance at all — an unreachable API, a rejected session cookie, or a response that omits the balance.
  - An automation run in that state skips the session and records the MaM failure as the reason, rather than measuring a guardrail against an assumed zero.
  - A manual purchase in that state is blocked and reports the same failure, since the guardrail the user asked for cannot be enforced.
  - A balance MaM reports as zero is a real balance and is measured normally.

## 2. Automation-Specific Guardrails
- **Enabled State (One Automation per User):**
  - You can only enable each automation type (VIP, Upload Credit) for one session per user account (`uid`).
  - If you have multiple sessions with the same `uid`, only one session can have automation enabled for each purchase type. All other sessions for that user will be ignored for automation of that type.
  - **Example:** If you have two sessions (Session A and Session B) both using the same `uid`, and you enable VIP automation for Session A, you cannot enable VIP automation for Session B. Only Session A will run VIP automation; Session B’s VIP automation will be ignored.
- **Trigger Type and Thresholds:**
  - Each automation can be configured with a trigger type (points, time, or both) and a threshold (e.g., trigger_point_threshold, trigger_days).
  - The automation will only attempt a purchase if the trigger condition is met (e.g., enough points, enough days since last purchase).
- **Cost Guardrail:**
  - The automation will only attempt a purchase if the user has enough points to cover the cost.

## 3. Manual Purchase Rules
- **Session Minimum Points:**
  - Manual purchases are also blocked if the session's minimum points is not met.
- **Cost Guardrail:**
  - Manual purchases are only allowed if the user has enough points to cover the cost.
- **No Automation Rules:**
  - Manual purchases are not subject to automation trigger types or thresholds.

## 4. General Rules
- **No Double Automation:**
  - Only one session per user (uid) can have automation enabled for a given purchase type at a time.
- **No Logging for Disabled Automations:**
  - If automation is not enabled for a session, no event log entry is created for skipped or attempted purchases.
- **Proxy Use:**
  - If a session is configured with a proxy, all purchase attempts (manual or automated) will use the proxy for MaM API calls.

## 5. Purchase Types and Costs
- **Upload Credit:** 500 points per GB (50 GB or 100 GB per purchase)
- **VIP:** 5,000 points per 4 weeks (configurable duration per automation)

---
_Last updated: 2025-09-01_

## VIP Minimum-Purchase Guardrail

MaM refuses any VIP purchase made through its API that would add less than a
full week, reporting `Min VIP is 1 week purchased for Automated methods`. It
counts a purchase made through MouseTrap as automated even when a person
clicked the button, so this applies to manual purchases as well as automated
ones.

MaM caps VIP at **90 days**, so once more than **83 days** remain no purchase
can add the required week. MouseTrap reads `vip_until` from the session's last
status check and skips the purchase above that threshold, for every duration
rather than just "Max me out!". The Purchase VIP button is disabled while this
applies, with the reason on hover, and re-enables itself once enough VIP has
burned off without needing a page reload.

MaM displays VIP in weeks, but the cap itself is in days; a reading of
"12.765 weeks" is 89.4 days and is above the threshold.

Notes:

- `vip_until` is an absolute timestamp, so the stored status stays accurate
  without refetching; no extra request is made to evaluate this guardrail.
- A session with no stored status, or an unreadable `vip_until`, is never
  blocked. Blocking wrongly would stop a purchase the user cannot otherwise
  make, while allowing one that fails costs a single clear message from MaM.
- MaM's own error remains the authority. The guardrail avoids the common case;
  it is not a substitute for the error.
- If VIP is bought directly on the MaM website, the stored `vip_until` is
  behind until the next check, which can only permit a purchase MaM then
  refuses. Use **Check Now** to refresh it.

## Rejected Session Guardrail

MaM answers a session it does not accept by redirecting to its login page and
serving HTML, so no purchase can succeed while a session is in that state.

When the last status check was rejected — `mam_invalid_since` is set, or the
check reported no usable cookie — both **Purchase VIP** and **Purchase Upload**
are disabled, with the reason on hover. Update the MAM ID and use **Check Now**
to clear it.

A session that has never been checked has no verdict yet and is not blocked.

If a purchase is attempted anyway, for example through the API directly, the
login redirect is reported as "MaM rejected the session and redirected to its
login page", rather than as a JSON decoder error followed by the markup of the
login page.

