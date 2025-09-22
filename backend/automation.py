"""Automation helpers for scheduled MaM perk purchases.

This module contains functions that implement scheduled automation jobs for
MyAnonamouse (MaM) perk purchases such as upload credit, VIP, and wedge.
Each job enumerates saved sessions, evaluates guardrails (session-level and
automation-level), and attempts purchases via helper functions in
`backend.perk_automation`. Events and status updates are recorded via
`append_ui_event_log` and `notify_event`.

Functions provided:
- run_all_automation_jobs: convenience runner that invokes each job.
- upload_credit_automation_job: automation for upload credit purchases.
- vip_automation_job: automation for VIP purchases.
- wedge_automation_job: automation for wedge purchases.
"""

from datetime import UTC, datetime, timedelta
import logging
import time

from backend.config import list_sessions, load_session, save_session
from backend.event_log import append_ui_event_log
from backend.mam_api import get_status
from backend.notifications_backend import notify_event
from backend.perk_automation import buy_upload_credit, buy_vip, buy_wedge
from backend.proxy_config import resolve_proxy_from_session_cfg

_logger: logging.Logger = logging.getLogger(__name__)


# --- Automation Scheduler ---
def run_all_automation_jobs():
    """Run all available automation jobs.

    Convenience function to sequentially run upload credit, wedge, and VIP
    automation jobs. Intended to be called by a scheduler or from startup
    code.
    """
    upload_credit_automation_job()
    wedge_automation_job()
    vip_automation_job()


def upload_credit_automation_job():
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

            proxy_cfg = resolve_proxy_from_session_cfg(cfg)
            status = get_status(mam_id=mam_id, proxy_cfg=proxy_cfg)
            points = status.get("points", 0) if isinstance(status, dict) else 0
            if points is None:
                points = 0
            # --- Session-level minimum points guardrail (first, before any automation-level checks) ---
            session_min_points = cfg.get("perk_automation", {}).get("min_points")
            if session_min_points is not None and int(points) < int(session_min_points):
                guardrail_reason = f"Below session minimum points: {points} < {session_min_points}"
                log_msg = "[AutoUpload] SKIP: Automated Upload Credit purchase for session '%s' skipped: %s"
                _logger.info(log_msg, label, guardrail_reason)
                append_ui_event_log(
                    {
                        "timestamp": now.isoformat(),
                        "label": label,
                        "event_type": "automation",
                        "trigger": "automation",
                        "purchase_type": "upload_credit",
                        "amount": gb_amount,
                        "details": {"points_before": points},
                        "result": "skipped",
                        "status_message": f"Automated Upload Credit purchase skipped: {guardrail_reason}",
                    }
                )
                # Do not check any automation-level guardrails if session minimum is not met
                continue
            # --- Time-based trigger enforcement ---
            last_upload_time = (
                cfg.get("perk_automation", {}).get("upload_credit", {}).get("last_upload_time")
            )
            last_purchase = None
            if last_upload_time:
                try:
                    last_purchase = datetime.fromisoformat(last_upload_time)
                except Exception:
                    last_purchase = None
            now_dt = now if isinstance(now, datetime) else datetime.now(UTC)
            time_trigger_ok = True
            if trigger_type in ("time", "both"):
                if last_purchase:
                    next_allowed = last_purchase + timedelta(days=int(trigger_days))
                    if now_dt < next_allowed:
                        time_trigger_ok = False
                else:
                    # No last purchase: skip until a successful purchase sets the timestamp
                    time_trigger_ok = False
            if not time_trigger_ok:
                if last_purchase:
                    next_allowed = last_purchase + timedelta(days=int(trigger_days))
                    next_allowed_str = next_allowed.isoformat()
                    guardrail_reason = (
                        f"Time-based trigger not satisfied: next allowed after {next_allowed_str}"
                    )
                else:
                    guardrail_reason = (
                        "No previous purchase timestamp found. "
                        "Please toggle and save the automation to start the timer. "
                        "(Time-based trigger not satisfied.)"
                    )
                log_msg = "[AutoUpload] SKIP: Automated Upload Credit purchase for session '%s' skipped: %s"
                _logger.info(log_msg, label, guardrail_reason)
                append_ui_event_log(
                    {
                        "timestamp": now.isoformat(),
                        "label": label,
                        "event_type": "automation",
                        "trigger": "automation",
                        "purchase_type": "upload_credit",
                        "amount": gb_amount,
                        "details": {"points_before": points},
                        "result": "skipped",
                        "status_message": f"Automated Upload Credit purchase skipped: {guardrail_reason}",
                    }
                )
                continue
            # --- Automation-level point threshold guardrail ---
            if trigger_type in ("points", "both") and int(points) < int(trigger_point_threshold):
                guardrail_reason = (
                    f"Below automation point threshold: {points} < {trigger_point_threshold}"
                )
                log_msg = "[AutoUpload] SKIP: Automated Upload Credit purchase for session '%s' skipped: %s"
                _logger.info(log_msg, label, guardrail_reason)
                append_ui_event_log(
                    {
                        "timestamp": now.isoformat(),
                        "label": label,
                        "event_type": "automation",
                        "trigger": "automation",
                        "purchase_type": "upload_credit",
                        "amount": gb_amount,
                        "details": {"points_before": points},
                        "result": "skipped",
                        "status_message": f"Automated Upload Credit purchase skipped: {guardrail_reason}",
                    }
                )
                continue
            # All guardrails passed, attempt purchase
            result = buy_upload_credit(gb_amount, mam_id=mam_id, proxy_cfg=proxy_cfg)
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
                cfg["perk_automation"]["upload_credit"]["last_upload_time"] = now_dt.isoformat()
                save_session(cfg, old_label=label)
                notify_event(
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
                notify_event(
                    event_type="automation_failure",
                    label=label,
                    status="FAILED",
                    message=f"Automated Upload Credit purchase failed: {gb_amount} GB",
                    details={"amount": gb_amount, "points_before": points, "error": event["error"]},
                )
            append_ui_event_log(event)
        except Exception as e:
            _logger.error("[UploadAuto] Error for '%s': %s", label, e)


def vip_automation_job():
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
            status = get_status(mam_id=mam_id, proxy_cfg=proxy_cfg)
            points = status.get("points", 0) if isinstance(status, dict) else 0
            if points is None:
                points = 0
            # --- Session-level minimum points guardrail (first, before any automation-level checks) ---
            session_min_points = cfg.get("perk_automation", {}).get("min_points")
            if session_min_points is not None and int(points) < int(session_min_points):
                guardrail_reason = f"Below session minimum points: {points} < {session_min_points}"
                log_msg = "[AutoVIP] SKIP: Automated VIP purchase for session '%s' skipped: %s"
                _logger.info(log_msg, label, guardrail_reason)
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
                        "status_message": f"Automated VIP purchase skipped: {guardrail_reason}",
                    }
                )
                # Reset retry state if not eligible
                if "retry" in automation:
                    automation.pop("retry", None)
                    automation.pop("cooldown_until", None)
                    save_session(cfg, old_label=label)
                # Do not check any automation-level guardrails if session minimum is not met
                continue
            # --- Time-based trigger enforcement ---
            last_vip_time = (
                cfg.get("perk_automation", {}).get("vip_automation", {}).get("last_vip_time")
            )
            last_purchase = None
            if last_vip_time:
                try:
                    last_purchase = datetime.fromisoformat(last_vip_time)
                except Exception:
                    last_purchase = None
            now_dt = now if isinstance(now, datetime) else datetime.now(UTC)
            time_trigger_ok = True
            if trigger_type in ("time", "both"):
                if last_purchase:
                    next_allowed = last_purchase + timedelta(days=int(trigger_days))
                    if now_dt < next_allowed:
                        time_trigger_ok = False
                else:
                    # No last purchase: skip until a successful purchase sets the timestamp
                    time_trigger_ok = False
            if not time_trigger_ok:
                if last_purchase:
                    next_allowed = last_purchase + timedelta(days=int(trigger_days))
                    next_allowed_str = next_allowed.isoformat()
                    guardrail_reason = (
                        f"Time-based trigger not satisfied: next allowed after {next_allowed_str}"
                    )
                else:
                    guardrail_reason = (
                        "No previous purchase timestamp found. "
                        "Please toggle and save the automation to start the timer. "
                        "(Time-based trigger not satisfied.)"
                    )
                log_msg = "[AutoVIP] SKIP: Automated VIP purchase for session '%s' skipped: %s"
                _logger.info(log_msg, label, guardrail_reason)
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
                        "status_message": f"Automated VIP purchase skipped: {guardrail_reason}",
                    }
                )
                # Reset retry state if not eligible
                if "retry" in automation:
                    automation.pop("retry", None)
                    automation.pop("cooldown_until", None)
                    save_session(cfg, old_label=label)
                continue
            # --- Automation-level point threshold guardrail ---
            if trigger_type in ("points", "both") and int(points) < int(trigger_point_threshold):
                guardrail_reason = (
                    f"Below automation point threshold: {points} < {trigger_point_threshold}"
                )
                log_msg = "[AutoVIP] SKIP: Automated VIP purchase for session '%s' skipped: %s"
                _logger.info(log_msg, label, guardrail_reason)
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
                        "status_message": f"Automated VIP purchase skipped: {guardrail_reason}",
                    }
                )
                # Reset retry state if not eligible
                if "retry" in automation:
                    automation.pop("retry", None)
                    automation.pop("cooldown_until", None)
                    save_session(cfg, old_label=label)
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
            result = buy_vip(mam_id, duration=duration, proxy_cfg=proxy_cfg)
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
                cfg["perk_automation"]["vip_automation"]["last_vip_time"] = now_dt.isoformat()
                automation["retry"] = 0
                automation.pop("cooldown_until", None)
                automation.pop("last_fail_time", None)
                save_session(cfg, old_label=label)
                notify_event(
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
                automation["retry"] = retry
                automation["last_fail_time"] = now_ts
                if retry >= 3:
                    # Set cooldown until next main run (10 min = 600s)
                    automation["cooldown_until"] = now_ts + 600
                    _logger.warning(
                        "[VIPAuto] Automated purchase: VIP (%s) for session '%s' retries_exceeded, cooldown_until=%s",
                        ("max" if is_max else weeks),
                        label,
                        automation["cooldown_until"],
                    )
                save_session(cfg, old_label=label)
                notify_event(
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


def wedge_automation_job():
    """Evaluate and run wedge automation for all sessions.

    For each configured session this function:
    - loads session configuration
    - checks session- and automation-level guardrails (min points, time,
      point thresholds)
    - attempts wedge purchases via `buy_wedge` when guardrails are satisfied
    - logs results and records events via `append_ui_event_log`.
    """

    session_labels = list_sessions()
    now = datetime.now(UTC)
    for label in session_labels:
        try:
            cfg = load_session(label)  # Always reload config
            mam_id = cfg.get("mam", {}).get("mam_id", "")
            if not mam_id:
                continue
            automation = cfg.get("perk_automation", {}).get("wedge_automation", {})
            enabled = automation.get("enabled", False)
            if not enabled:
                continue
            trigger_type = automation.get("trigger_type", "points")
            trigger_days = automation.get("trigger_days", 7)
            trigger_point_threshold = automation.get("trigger_point_threshold", 50000)

            proxy_cfg = resolve_proxy_from_session_cfg(cfg)  # Always resolve proxy
            status = get_status(mam_id=mam_id, proxy_cfg=proxy_cfg)
            points = status.get("points", 0) if isinstance(status, dict) else 0
            if points is None:
                points = 0
            # --- Session-level minimum points guardrail (first, before any automation-level checks) ---
            session_min_points = cfg.get("perk_automation", {}).get("min_points")
            _logger.debug(
                "[AutoWedge][DEBUG] Session '%s': points=%s, session_min_points=%s",
                label,
                points,
                session_min_points,
            )
            if session_min_points is not None and int(points) < int(session_min_points):
                guardrail_reason = f"Below session minimum points: {points} < {session_min_points}"
                log_msg = "[AutoWedge] SKIP: Automated Wedge purchase for session '%s' skipped: %s"
                _logger.info(log_msg, label, guardrail_reason)
                append_ui_event_log(
                    {
                        "timestamp": now.isoformat(),
                        "label": label,
                        "event_type": "automation",
                        "trigger": "automation",
                        "purchase_type": "wedge",
                        "amount": 1,
                        "details": {"points_before": points},
                        "result": "skipped",
                        "status_message": f"Automated Wedge purchase skipped: {guardrail_reason}",
                    }
                )
                # Do not check any automation-level guardrails if session minimum is not met
                continue
            # --- Time-based trigger enforcement ---
            last_wedge_time = (
                cfg.get("perk_automation", {}).get("wedge_automation", {}).get("last_wedge_time")
            )
            last_purchase = None
            if last_wedge_time:
                try:
                    last_purchase = datetime.fromisoformat(last_wedge_time)
                except Exception:
                    last_purchase = None
            now_dt = now if isinstance(now, datetime) else datetime.now(UTC)
            time_trigger_ok = True
            if trigger_type in ("time", "both"):
                if last_purchase:
                    next_allowed = last_purchase + timedelta(days=int(trigger_days))
                    if now_dt < next_allowed:
                        time_trigger_ok = False
                else:
                    # No last purchase: skip until a successful purchase sets the timestamp
                    time_trigger_ok = False
            if not time_trigger_ok:
                if last_purchase:
                    next_allowed = last_purchase + timedelta(days=int(trigger_days))
                    next_allowed_str = next_allowed.isoformat()
                    guardrail_reason = (
                        f"Time-based trigger not satisfied: next allowed after {next_allowed_str}"
                    )
                else:
                    guardrail_reason = (
                        "No previous purchase timestamp found. "
                        "Please toggle and save the automation to start the timer. "
                        "(Time-based trigger not satisfied.)"
                    )
                log_msg = "[AutoWedge] SKIP: Automated Wedge purchase for session '%s' skipped: %s"
                _logger.info(log_msg, label, guardrail_reason)
                append_ui_event_log(
                    {
                        "timestamp": now.isoformat(),
                        "label": label,
                        "event_type": "automation",
                        "trigger": "automation",
                        "purchase_type": "wedge",
                        "amount": 1,
                        "details": {"points_before": points},
                        "result": "skipped",
                        "status_message": f"Automated Wedge purchase skipped: {guardrail_reason}",
                    }
                )
                continue
            # --- Automation-level point threshold guardrail ---
            if trigger_type in ("points", "both") and int(points) < int(trigger_point_threshold):
                guardrail_reason = (
                    f"Below automation point threshold: {points} < {trigger_point_threshold}"
                )
                log_msg = "[AutoWedge] SKIP: Automated Wedge purchase for session '%s' skipped: %s"
                _logger.info(log_msg, label, guardrail_reason)
                append_ui_event_log(
                    {
                        "timestamp": now.isoformat(),
                        "label": label,
                        "event_type": "automation",
                        "trigger": "automation",
                        "purchase_type": "wedge",
                        "amount": 1,
                        "details": {"points_before": points},
                        "result": "skipped",
                        "status_message": f"Automated Wedge purchase skipped: {guardrail_reason}",
                    }
                )
                continue
            # All guardrails passed, attempt purchase
            result = buy_wedge(mam_id, proxy_cfg=proxy_cfg)
            success = result.get("success", False) if result else False
            status_message = (
                "Automated purchase: Wedge (points)"
                if success
                else "Automated Wedge purchase failed (points)"
            )
            event = {
                "timestamp": now.isoformat(),
                "label": label,
                "event_type": "automation",
                "trigger": "automation",
                "purchase_type": "wedge",
                "amount": 1,
                "details": {"points_before": points},
                "result": "success" if success else "failed",
                "error": None
                if success
                else (result.get("error") or result.get("response") or "Unknown error"),
                "status_message": status_message,
            }

            if success:
                # Update last purchase timestamp in new field
                cfg["perk_automation"]["wedge_automation"]["last_wedge_time"] = now_dt.isoformat()
                save_session(cfg, old_label=label)
                _logger.info(
                    "[WedgeAuto] Automated purchase: Wedge (points) for session '%s' succeeded.",
                    label,
                )
                notify_event(
                    event_type="automation_success",
                    label=label,
                    status="SUCCESS",
                    message="Automated Wedge purchase succeeded: 1",
                    details={"amount": 1, "points_before": points},
                )
            else:
                _logger.warning(
                    "[WedgeAuto] Automated purchase: Wedge (points) for session '%s' FAILED. Error: %s",
                    label,
                    event["error"],
                )
                notify_event(
                    event_type="automation_failure",
                    label=label,
                    status="FAILED",
                    message="Automated Wedge purchase failed: 1",
                    details={"amount": 1, "points_before": points, "error": event["error"]},
                )
            append_ui_event_log(event)
        except Exception as e:
            _logger.error(
                "[WedgeAuto] label=%s trigger=automation result=exception error=%s", label, e
            )
