# Purchase Rules: Manual and Automated

This document describes all rules and guardrails for purchases (Upload Credit, VIP) in MouseTrap, for both manual and automated flows.

## 1. Session-Level Guardrails (Apply to All Automations)
- **Minimum Points:**
  - Each session can define a minimum points value (`min_points`).
  - No automated or manual purchase will be attempted if the user's current points are below this session-level minimum.
  - This rule is enforced before any individual automation or purchase rule.

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
- **Upload Credit:** 500 points per GB (configurable amount per automation)
- **VIP:** 5,000 points per 4 weeks (configurable duration per automation)

---
_Last updated: 2025-09-01_
