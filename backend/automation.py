"""Automation helpers for scheduled MaM perk purchases.

This module contains functions that implement scheduled automation jobs for
MyAnonamouse (MaM) perk purchases such as upload credit and VIP.
Each job enumerates saved sessions, evaluates guardrails (session-level and
automation-level), and attempts purchases via helper functions in
`backend.perk_automation`. Events and status updates are recorded via
`append_ui_event_log` and `notify_event`.

Functions provided:
- run_all_automation_jobs: convenience runner that invokes each job.
- upload_credit_automation_job: automation for upload credit purchases.
- vip_automation_job: automation for VIP purchases.
"""

from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
import logging
import threading
import time
from typing import Any

from backend.config import list_sessions, load_session, save_session
from backend.event_log import append_ui_event_log
from backend.mam_api import get_status
from backend.notifications_backend import notify_event
from backend.perk_automation import buy_upload_credit, buy_vip
from backend.proxy_config import resolve_proxy_from_session_cfg

_logger: logging.Logger = logging.getLogger(__name__)

# Point costs for the enforce-minimum-points guardrail
_VIP_POINTS_COST: dict[int, int] = {4: 5_000, 8: 10_000}  # weeks -> points; 90/max is variable
_UPLOAD_POINTS_PER_GB = 500
_shutdown_event = threading.Event()


def reset_automation_shutdown() -> None:
    """Allow scheduled automation work to start."""
    _shutdown_event.clear()


def request_automation_shutdown() -> None:
    """Prevent scheduled automation from starting another transaction."""
    _shutdown_event.set()


def automation_shutdown_requested() -> bool:
    """Return whether scheduled automation should stop at its next boundary."""
    return _shutdown_event.is_set()


def _persist_automation_state(
    label: str,
    section: str,
    updates: dict[str, Any],
    remove: tuple[str, ...] = (),
) -> None:
    """Reload the session fresh from disk before persisting automation state.

    The automation jobs run on their own fixed interval, independent of each
    session's own check_freq-driven session_check_job — which also saves the
    session file (mam_id rotation, indexer sync, IP/ASN updates). Both jobs
    read the whole file, mutate it, and write the whole file back, so reusing
    a `cfg` loaded at the top of an automation job's loop and saving it later
    risks silently discarding whatever the other job wrote in between.
    Reloading immediately before this save closes that window.
    """
    fresh_cfg = load_session(label)
    automation_cfg = fresh_cfg.setdefault("perk_automation", {}).setdefault(section, {})
    automation_cfg.update(updates)
    for key in remove:
        automation_cfg.pop(key, None)
    save_session(fresh_cfg, old_label=label)


# --- Automation Scheduler ---
@dataclass(frozen=True)
class _PerkJob:
    """Names the parts of a perk automation job that differ between perks.

    The upload-credit and VIP jobs write the same guardrail-skip event ten
    times between them, varying only in these fields and the reason text.

    Attributes:
        purchase_type: Value recorded as `purchase_type` in the event log.
        state_key: Key under `perk_automation` holding this perk's settings.
        log_prefix: Prefix used in this job's log lines, e.g. "[AutoUpload]".
        perk_label: Human-readable perk name used in user-facing messages.

    """

    purchase_type: str
    state_key: str
    log_prefix: str
    perk_label: str


_UPLOAD_JOB = _PerkJob("upload_credit", "upload_credit", "[AutoUpload]", "Upload Credit")
_VIP_JOB = _PerkJob("vip", "vip_automation", "[AutoVIP]", "VIP")


def _log_automation_skip(
    job: _PerkJob,
    label: str,
    amount: Any,
    points: Any,
    reason: str,
    now: datetime,
) -> None:
    """Record a guardrail-blocked purchase in the log and the UI event log.

    Args:
        job: Which perk job is skipping.
        label: Session label.
        amount: Perk amount that would have been purchased.
        points: Points held before the skip, for the event details.
        reason: Guardrail explanation shown to the user.
        now: Current time, so the event shares the job's clock.

    """
    _logger.info(
        "%s SKIP: Automated %s purchase for session '%s' skipped: %s",
        job.log_prefix,
        job.perk_label,
        label,
        reason,
    )
    append_ui_event_log(
        {
            "timestamp": now.isoformat(),
            "label": label,
            "event_type": "automation",
            "trigger": "automation",
            "purchase_type": job.purchase_type,
            "amount": amount,
            "details": {"points_before": points},
            "result": "skipped",
            "status_message": f"Automated {job.perk_label} purchase skipped: {reason}",
        }
    )


def _evaluate_time_trigger(
    last_purchase_iso: str | None,
    trigger_type: str,
    trigger_days: Any,
    now: datetime,
) -> tuple[bool, str]:
    """Decide whether a time-based automation trigger is satisfied.

    Shared by the upload-credit and VIP jobs, which carried identical copies of
    this arithmetic. A trigger type that does not include time is always
    satisfied here; the caller applies its own points guardrail separately.

    A session with no recorded purchase is deliberately held back rather than
    treated as due: the interval is measured from the last successful purchase,
    so the timer only starts once one has been recorded. An unparseable
    timestamp is treated the same way as no timestamp at all.

    Args:
        last_purchase_iso: Stored ISO timestamp of the last purchase, if any.
        trigger_type: Configured trigger type, e.g. "time", "points" or "both".
        trigger_days: Configured interval in days, as stored in YAML.
        now: Current time, passed in so callers share one clock.

    Returns:
        ``(satisfied, reason)``. ``reason`` is empty when satisfied, and
        otherwise carries the user-facing explanation for the skip.

    """
    last_purchase = None
    if last_purchase_iso:
        try:
            last_purchase = datetime.fromisoformat(last_purchase_iso)
        except Exception:
            last_purchase = None

    if trigger_type not in ("time", "both"):
        return True, ""

    if last_purchase:
        next_allowed = last_purchase + timedelta(days=int(trigger_days))
        if now >= next_allowed:
            return True, ""
        return False, (
            f"Time-based trigger not satisfied: next allowed after {next_allowed.isoformat()}"
        )

    return False, (
        "No previous purchase timestamp found. "
        "Please toggle and save the automation to start the timer. "
        "(Time-based trigger not satisfied.)"
    )


async def run_all_automation_jobs() -> None:
    """Run all available automation jobs.

    Convenience function to sequentially run upload credit and VIP automation
    jobs. Intended to be called by a scheduler or from startup code.
    """
    for automation_job in (
        upload_credit_automation_job,
        vip_automation_job,
    ):
        if automation_shutdown_requested():
            return
        await automation_job()


async def upload_credit_automation_job() -> None:
    """Evaluate and run upload credit automation for all sessions.

    For each configured session this function:
    - loads session configuration
    - checks session- and automation-level guardrails (min points, time,
        point thresholds)
    - attempts an upload credit purchase via `buy_upload_credit` when
        guardrails are satisfied
    - logs results, updates session timestamps on success and records an
        event via `append_ui_event_log`.
    """
    session_labels = list_sessions()
    now = datetime.now(UTC)
    for label in session_labels:
        if automation_shutdown_requested():
            return
        try:
            cfg = load_session(label)
            mam_id = cfg.get("mam", {}).get("mam_id", "")
            if not mam_id:
                continue
            automation = cfg.get("perk_automation", {}).get("upload_credit", {})
            enabled = automation.get("enabled", False)
            if not enabled:
                continue
            trigger_type = automation.get("trigger_type", "points")
            trigger_days = automation.get("trigger_days", 7)
            trigger_point_threshold = automation.get("trigger_point_threshold", 50000)
            gb_amount = automation.get("gb", 10)

            # Validate upload credit amount - MAM only accepts certain values
            # As of January 2026, MAM requires minimum 50GB purchase
            valid_amounts = [50, 100]
            if gb_amount not in valid_amounts:
                _logger.error(
                    "[UploadAuto] Invalid upload credit amount configured: %sGB. Skipping session '%s'. Valid amounts are: %s",
                    gb_amount,
                    label,
                    ", ".join(map(str, valid_amounts)),
                )
                continue

            proxy_cfg = resolve_proxy_from_session_cfg(cfg)
            status = await get_status(mam_id=mam_id, proxy_cfg=proxy_cfg)
            points = status.get("points", 0)
            if points is None:
                points = 0
            # --- Session-level minimum points guardrail (first, before any automation-level checks) ---
            session_min_points = cfg.get("perk_automation", {}).get("min_points")
            if session_min_points is not None and int(points) < int(session_min_points):
                guardrail_reason = f"Below session minimum points: {points} < {session_min_points}"
                _log_automation_skip(_UPLOAD_JOB, label, gb_amount, points, guardrail_reason, now)
                # Do not check any automation-level guardrails if session minimum is not met
                continue
            # --- Enforce minimum points guardrail (prevent spend below minimum) ---
            enforce_min_points_guardrail = cfg.get("perk_automation", {}).get(
                "enforce_min_points_guardrail", False
            )
            if enforce_min_points_guardrail and session_min_points is not None:
                purchase_cost = int(gb_amount) * _UPLOAD_POINTS_PER_GB
                if int(points) - purchase_cost < int(session_min_points):
                    guardrail_reason = (
                        f"Purchase would drop below minimum points: "
                        f"{points} - {purchase_cost} = {int(points) - purchase_cost} "
                        f"< {session_min_points}"
                    )
                    _log_automation_skip(
                        _UPLOAD_JOB, label, gb_amount, points, guardrail_reason, now
                    )
                    continue
            # --- Time-based trigger enforcement ---
            last_upload_time = (
                cfg.get("perk_automation", {}).get("upload_credit", {}).get("last_upload_time")
            )
            time_trigger_ok, guardrail_reason = _evaluate_time_trigger(
                last_upload_time, trigger_type, trigger_days, now
            )
            if not time_trigger_ok:
                _log_automation_skip(_UPLOAD_JOB, label, gb_amount, points, guardrail_reason, now)
                continue
            # --- Automation-level point threshold guardrail ---
            if trigger_type in ("points", "both") and int(points) < int(trigger_point_threshold):
                guardrail_reason = (
                    f"Below automation point threshold: {points} < {trigger_point_threshold}"
                )
                _log_automation_skip(_UPLOAD_JOB, label, gb_amount, points, guardrail_reason, now)
                continue
            # All guardrails passed, attempt purchase
            result = await buy_upload_credit(gb_amount, mam_id=mam_id, proxy_cfg=proxy_cfg)
            success = result.get("success", False) if result else False
            status_message = (
                f"Automated purchase: Upload Credit ({gb_amount} GB)"
                if success
                else f"Automated Upload Credit purchase failed ({gb_amount} GB)"
            )
            event = {
                "timestamp": now.isoformat(),
                "label": label,
                "event_type": "automation",
                "trigger": "automation",
                "purchase_type": "upload_credit",
                "amount": gb_amount,
                "details": {"points_before": points},
                "result": "success" if success else "failed",
                "error": None
                if success
                else (result.get("error") or result.get("response") or "Unknown error"),
                "status_message": status_message,
            }

            if success:
                _logger.info(
                    "[UploadAuto] Automated purchase: Upload Credit (%s GB) for session '%s' succeeded.",
                    gb_amount,
                    label,
                )
                # Update last purchase timestamp in new field
                _persist_automation_state(
                    label, "upload_credit", {"last_upload_time": now.isoformat()}
                )
                await notify_event(
                    event_type="automation_success",
                    label=label,
                    status="SUCCESS",
                    message=f"Automated Upload Credit purchase succeeded: {gb_amount} GB",
                    details={"amount": gb_amount, "points_before": points},
                )
            else:
                _logger.warning(
                    "[UploadAuto] Automated purchase: Upload Credit (%s GB) for session '%s' FAILED. Error: %s",
                    gb_amount,
                    label,
                    event["error"],
                )
                await notify_event(
                    event_type="automation_failure",
                    label=label,
                    status="FAILED",
                    message=f"Automated Upload Credit purchase failed: {gb_amount} GB",
                    details={"amount": gb_amount, "points_before": points, "error": event["error"]},
                )
            append_ui_event_log(event)
        except Exception as e:
            _logger.error("[UploadAuto] Error for '%s': %s", label, e)


async def vip_automation_job() -> None:
    """Evaluate and run VIP automation for all sessions.

    For each configured session this function:
    - loads session configuration
    - checks session- and automation-level guardrails (min points, time,
        point thresholds, retry/cooldown logic)
    - attempts VIP purchases via `buy_vip` when guardrails are satisfied
    - handles retry and cooldown state, persists changes with `save_session`,
        and records events via `append_ui_event_log`.
    """
    session_labels = list_sessions()
    now = datetime.now(UTC)
    for label in session_labels:
        if automation_shutdown_requested():
            return
        try:
            cfg = load_session(label)  # Always reload config
            mam_id = cfg.get("mam", {}).get("mam_id", "")
            if not mam_id:
                continue
            automation = cfg.get("perk_automation", {}).get("vip_automation", {})
            enabled = automation.get("enabled", False)
            if not enabled:
                continue
            trigger_type = automation.get("trigger_type", "points")
            trigger_days = automation.get("trigger_days", 7)
            trigger_point_threshold = automation.get("trigger_point_threshold", 50000)

            proxy_cfg = resolve_proxy_from_session_cfg(cfg)  # Always resolve proxy
            # Read weeks from automation config (default 4)
            weeks = automation.get("weeks", 4)
            status = await get_status(mam_id=mam_id, proxy_cfg=proxy_cfg)
            points = status.get("points", 0)
            if points is None:
                points = 0
            # --- Session-level minimum points guardrail (first, before any automation-level checks) ---
            session_min_points = cfg.get("perk_automation", {}).get("min_points")
            if session_min_points is not None and int(points) < int(session_min_points):
                guardrail_reason = f"Below session minimum points: {points} < {session_min_points}"
                _log_automation_skip(_VIP_JOB, label, weeks, points, guardrail_reason, now)
                # Reset retry state if not eligible
                if "retry" in automation:
                    _persist_automation_state(
                        label, "vip_automation", {}, remove=("retry", "cooldown_until")
                    )
                # Do not check any automation-level guardrails if session minimum is not met
                continue
            # --- Enforce minimum points guardrail (prevent spend below minimum) ---
            enforce_min_points_guardrail = cfg.get("perk_automation", {}).get(
                "enforce_min_points_guardrail", False
            )
            if enforce_min_points_guardrail and session_min_points is not None:
                purchase_cost = (
                    None
                    if str(weeks).lower() in ("max", "90")
                    else _VIP_POINTS_COST.get(int(weeks))
                )
                if purchase_cost is not None and int(points) - purchase_cost < int(
                    session_min_points
                ):
                    guardrail_reason = (
                        f"Purchase would drop below minimum points: "
                        f"{points} - {purchase_cost} = {int(points) - purchase_cost} "
                        f"< {session_min_points}"
                    )
                    _log_automation_skip(_VIP_JOB, label, weeks, points, guardrail_reason, now)
                    if "retry" in automation:
                        _persist_automation_state(
                            label, "vip_automation", {}, remove=("retry", "cooldown_until")
                        )
                    continue
            # --- Time-based trigger enforcement ---
            last_vip_time = (
                cfg.get("perk_automation", {}).get("vip_automation", {}).get("last_vip_time")
            )
            time_trigger_ok, guardrail_reason = _evaluate_time_trigger(
                last_vip_time, trigger_type, trigger_days, now
            )
            if not time_trigger_ok:
                _log_automation_skip(_VIP_JOB, label, weeks, points, guardrail_reason, now)
                # Reset retry state if not eligible
                if "retry" in automation:
                    _persist_automation_state(
                        label, "vip_automation", {}, remove=("retry", "cooldown_until")
                    )
                continue
            # --- Automation-level point threshold guardrail ---
            if trigger_type in ("points", "both") and int(points) < int(trigger_point_threshold):
                guardrail_reason = (
                    f"Below automation point threshold: {points} < {trigger_point_threshold}"
                )
                _log_automation_skip(_VIP_JOB, label, weeks, points, guardrail_reason, now)
                # Reset retry state if not eligible
                if "retry" in automation:
                    _persist_automation_state(
                        label, "vip_automation", {}, remove=("retry", "cooldown_until")
                    )
                continue
            # --- Retry/cooldown logic ---
            retry = automation.get("retry", 0)
            cooldown_until = automation.get("cooldown_until")
            now_ts = int(time.time())
            if cooldown_until and now_ts < cooldown_until:
                _logger.info(
                    "[VIPAuto] label=%s trigger=automation result=skipped reason=cooldown active until %s",
                    label,
                    cooldown_until,
                )
                append_ui_event_log(
                    {
                        "timestamp": now.isoformat(),
                        "label": label,
                        "event_type": "automation",
                        "trigger": "automation",
                        "purchase_type": "vip",
                        "amount": weeks,
                        "details": {"points_before": points},
                        "result": "skipped",
                        "status_message": f"Cooldown active until {cooldown_until}",
                    }
                )
                continue
            # If retry > 0, and last failure was < 60s ago, wait before retrying
            last_fail_time = automation.get("last_fail_time", 0)
            if retry > 0 and (now_ts - last_fail_time) < 60:
                _logger.info(
                    "[VIPAuto] label=%s trigger=automation result=skipped reason=waiting_between_retries retry=%s",
                    label,
                    retry,
                )
                append_ui_event_log(
                    {
                        "timestamp": now.isoformat(),
                        "label": label,
                        "event_type": "automation",
                        "trigger": "automation",
                        "purchase_type": "vip",
                        "amount": weeks,
                        "details": {"points_before": points},
                        "result": "skipped",
                        "status_message": f"Waiting between retries (retry {retry})",
                    }
                )
                continue
            # Support 'max' for automation as well
            is_max = str(weeks).lower() in ["max", "90"]
            duration = "max" if is_max else str(weeks)
            result = await buy_vip(mam_id, duration=duration, proxy_cfg=proxy_cfg)
            success = result.get("success", False) if result else False
            status_message = (
                f"Automated purchase: VIP ({'Max me out!' if is_max else f'{weeks} weeks'})"
                if success
                else f"Automated VIP purchase failed ({'Max me out!' if is_max else f'{weeks} weeks'})"
            )
            event = {
                "timestamp": now.isoformat(),
                "label": label,
                "event_type": "automation",
                "trigger": "automation",
                "purchase_type": "vip",
                "amount": weeks,
                "details": {"points_before": points},
                "result": "success" if success else "failed",
                "error": None
                if success
                else (result.get("error") or result.get("response") or "Unknown error"),
                "status_message": status_message,
            }

            if success:
                _logger.info(
                    "[VIPAuto] Automated purchase: VIP (%s) for session '%s' succeeded.",
                    ("max" if is_max else weeks),
                    label,
                )
                # Update last purchase timestamp and reset retry state on success
                _persist_automation_state(
                    label,
                    "vip_automation",
                    {"last_vip_time": now.isoformat(), "retry": 0},
                    remove=("cooldown_until", "last_fail_time"),
                )
                await notify_event(
                    event_type="automation_success",
                    label=label,
                    status="SUCCESS",
                    message=f"Automated VIP purchase succeeded: {'Max me out!' if is_max else str(weeks) + ' weeks'}",
                    details={"amount": weeks, "points_before": points},
                )
            else:
                _logger.warning(
                    "[VIPAuto] Automated purchase: VIP (%s) for session '%s' FAILED. Error: %s",
                    ("max" if is_max else weeks),
                    label,
                    event["error"],
                )
                # Retry logic: up to 3 times, 1 minute apart
                retry = automation.get("retry", 0) + 1
                retry_updates: dict[str, Any] = {"retry": retry, "last_fail_time": now_ts}
                if retry >= 3:
                    # Set cooldown until next main run (10 min = 600s)
                    retry_updates["cooldown_until"] = now_ts + 600
                    _logger.warning(
                        "[VIPAuto] Automated purchase: VIP (%s) for session '%s' retries_exceeded, cooldown_until=%s",
                        ("max" if is_max else weeks),
                        label,
                        retry_updates["cooldown_until"],
                    )
                _persist_automation_state(label, "vip_automation", retry_updates)
                await notify_event(
                    event_type="automation_failure",
                    label=label,
                    status="FAILED",
                    message=f"Automated VIP purchase failed: {'Max me out!' if is_max else str(weeks) + ' weeks'}",
                    details={"amount": weeks, "points_before": points, "error": event["error"]},
                )
            append_ui_event_log(event)
        except Exception as e:
            _logger.error(
                "[VIPAuto] label=%s trigger=automation result=exception error=%s", label, e
            )
