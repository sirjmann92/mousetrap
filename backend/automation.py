import logging
from backend.config import list_sessions, load_session
from backend.mam_api import get_status
from backend.event_log import append_ui_event_log
from backend.perk_automation import buy_vip
from backend.config import save_session
from backend.perk_automation import buy_wedge

# --- Automation Scheduler ---
def run_all_automation_jobs():
    upload_credit_automation_job()
    wedge_automation_job()
    vip_automation_job()

def upload_credit_automation_job():
    from datetime import datetime, timezone, timedelta
    from backend.perk_automation import buy_upload_credit
    session_labels = list_sessions()
    now = datetime.now(timezone.utc)
    for label in session_labels:
        try:
            cfg = load_session(label)
            mam_id = cfg.get('mam', {}).get('mam_id', "")
            if not mam_id:
                continue
            automation = cfg.get('perk_automation', {}).get('upload_credit', {})
            enabled = automation.get('enabled', False)
            if not enabled:
                continue
            trigger_type = automation.get('trigger_type', 'points')
            trigger_days = automation.get('trigger_days', 7)
            trigger_point_threshold = automation.get('trigger_point_threshold', 50000)
            gb_amount = automation.get('gb', 10)
            from backend.proxy_config import resolve_proxy_from_session_cfg
            proxy_cfg = resolve_proxy_from_session_cfg(cfg)
            status = get_status(mam_id=mam_id, proxy_cfg=proxy_cfg)
            points = status.get('points', 0) if isinstance(status, dict) else 0
            if points is None:
                points = 0
            # --- Session-level minimum points guardrail (first, before any automation-level checks) ---
            session_min_points = cfg.get('perk_automation', {}).get('min_points')
            if session_min_points is not None and int(points) < int(session_min_points):
                guardrail_reason = f"Below session minimum points: {points} < {session_min_points}"
                log_msg = f"[AutoUpload] SKIP: Automated Upload Credit purchase for session '{label}' skipped: {guardrail_reason}"
                logging.info(log_msg)
                append_ui_event_log({
                    "timestamp": now.isoformat(),
                    "label": label,
                    "event_type": "automation",
                    "trigger": "automation",
                    "purchase_type": "upload_credit",
                    "amount": gb_amount,
                    "details": {"points_before": points},
                    "result": "skipped",
                    "status_message": f"Automated Upload Credit purchase skipped: {guardrail_reason}"
                })
                # Do not check any automation-level guardrails if session minimum is not met
                continue
            # --- Time-based trigger enforcement ---
            last_upload_time = cfg.get('perk_automation', {}).get('upload_credit', {}).get('last_upload_time')
            last_purchase = None
            if last_upload_time:
                try:
                    last_purchase = datetime.fromisoformat(last_upload_time if 'T' in last_upload_time else last_upload_time.replace(' ', 'T'))
                except Exception:
                    last_purchase = None
            now_dt = now if isinstance(now, datetime) else datetime.now(timezone.utc)
            time_trigger_ok = True
            if trigger_type in ('time', 'both'):
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
                    guardrail_reason = f"Time-based trigger not satisfied: next allowed after {next_allowed_str}"
                else:
                    guardrail_reason = (
                        "No previous purchase timestamp found. "
                        "Please toggle and save the automation to start the timer. "
                        "(Time-based trigger not satisfied.)"
                    )
                log_msg = f"[AutoUpload] SKIP: Automated Upload Credit purchase for session '{label}' skipped: {guardrail_reason}"
                logging.info(log_msg)
                append_ui_event_log({
                    "timestamp": now.isoformat(),
                    "label": label,
                    "event_type": "automation",
                    "trigger": "automation",
                    "purchase_type": "upload_credit",
                    "amount": gb_amount,
                    "details": {"points_before": points},
                    "result": "skipped",
                    "status_message": f"Automated Upload Credit purchase skipped: {guardrail_reason}"
                })
                continue
            # --- Automation-level point threshold guardrail ---
            if trigger_type in ('points', 'both') and int(points) < int(trigger_point_threshold):
                guardrail_reason = f"Below automation point threshold: {points} < {trigger_point_threshold}"
                log_msg = f"[AutoUpload] SKIP: Automated Upload Credit purchase for session '{label}' skipped: {guardrail_reason}"
                logging.info(log_msg)
                append_ui_event_log({
                    "timestamp": now.isoformat(),
                    "label": label,
                    "event_type": "automation",
                    "trigger": "automation",
                    "purchase_type": "upload_credit",
                    "amount": gb_amount,
                    "details": {"points_before": points},
                    "result": "skipped",
                    "status_message": f"Automated Upload Credit purchase skipped: {guardrail_reason}"
                })
                continue
            # All guardrails passed, attempt purchase
            result = buy_upload_credit(gb_amount, mam_id=mam_id, proxy_cfg=proxy_cfg)
            success = result.get('success', False) if result else False
            status_message = f"Automated purchase: Upload Credit ({gb_amount} GB)" if success else f"Automated Upload Credit purchase failed ({gb_amount} GB)"
            event = {
                "timestamp": now.isoformat(),
                "label": label,
                "event_type": "automation",
                "trigger": "automation",
                "purchase_type": "upload_credit",
                "amount": gb_amount,
                "details": {"points_before": points},
                "result": "success" if success else "failed",
                "error": None if success else (result.get('error') or result.get('response') or 'Unknown error'),
                "status_message": status_message
            }
            from backend.notifications_backend import notify_event
            if success:
                logging.info(f"[UploadAuto] Automated purchase: Upload Credit ({gb_amount} GB) for session '{label}' succeeded.")
                # Update last purchase timestamp in new field
                cfg['perk_automation']['upload_credit']['last_upload_time'] = now_dt.isoformat()
                save_session(cfg, old_label=label)
                notify_event(
                    event_type="automation_success",
                    label=label,
                    status="SUCCESS",
                    message=f"Automated Upload Credit purchase succeeded: {gb_amount} GB",
                    details={"amount": gb_amount, "points_before": points}
                )
            else:
                logging.warning(f"[UploadAuto] Automated purchase: Upload Credit ({gb_amount} GB) for session '{label}' FAILED. Error: {event['error']}")
                notify_event(
                    event_type="automation_failure",
                    label=label,
                    status="FAILED",
                    message=f"Automated Upload Credit purchase failed: {gb_amount} GB",
                    details={"amount": gb_amount, "points_before": points, "error": event['error']}
                )
            append_ui_event_log(event)
        except Exception as e:
            logging.error(f"[UploadAuto] Error for '{label}': {e}")

def vip_automation_job():
    from datetime import datetime, timezone, timedelta
    import time
    session_labels = list_sessions()
    now = datetime.now(timezone.utc)
    for label in session_labels:
        try:
            cfg = load_session(label)  # Always reload config
            mam_id = cfg.get('mam', {}).get('mam_id', "")
            if not mam_id:
                continue
            automation = cfg.get('perk_automation', {}).get('vip_automation', {})
            enabled = automation.get('enabled', False)
            if not enabled:
                continue
            trigger_type = automation.get('trigger_type', 'points')
            trigger_days = automation.get('trigger_days', 7)
            trigger_point_threshold = automation.get('trigger_point_threshold', 50000)
            from backend.proxy_config import resolve_proxy_from_session_cfg
            proxy_cfg = resolve_proxy_from_session_cfg(cfg)  # Always resolve proxy
            # Read weeks from automation config (default 4)
            weeks = automation.get('weeks', 4)
            status = get_status(mam_id=mam_id, proxy_cfg=proxy_cfg)
            points = status.get('points', 0) if isinstance(status, dict) else 0
            if points is None:
                points = 0
            # --- Session-level minimum points guardrail (first, before any automation-level checks) ---
            session_min_points = cfg.get('perk_automation', {}).get('min_points')
            if session_min_points is not None and int(points) < int(session_min_points):
                guardrail_reason = f"Below session minimum points: {points} < {session_min_points}"
                log_msg = f"[AutoVIP] SKIP: Automated VIP purchase for session '{label}' skipped: {guardrail_reason}"
                logging.info(log_msg)
                append_ui_event_log({
                    "timestamp": now.isoformat(),
                    "label": label,
                    "event_type": "automation",
                    "trigger": "automation",
                    "purchase_type": "vip",
                    "amount": weeks,
                    "details": {"points_before": points},
                    "result": "skipped",
                    "status_message": f"Automated VIP purchase skipped: {guardrail_reason}"
                })
                # Reset retry state if not eligible
                if 'retry' in automation:
                    automation.pop('retry', None)
                    automation.pop('cooldown_until', None)
                    save_session(cfg, old_label=label)  # type: ignore
                # Do not check any automation-level guardrails if session minimum is not met
                continue
            # --- Time-based trigger enforcement ---
            last_vip_time = cfg.get('perk_automation', {}).get('vip_automation', {}).get('last_vip_time')
            last_purchase = None
            if last_vip_time:
                try:
                    last_purchase = datetime.fromisoformat(last_vip_time if 'T' in last_vip_time else last_vip_time.replace(' ', 'T'))
                except Exception:
                    last_purchase = None
            now_dt = now if isinstance(now, datetime) else datetime.now(timezone.utc)
            time_trigger_ok = True
            if trigger_type in ('time', 'both'):
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
                    guardrail_reason = f"Time-based trigger not satisfied: next allowed after {next_allowed_str}"
                else:
                    guardrail_reason = (
                        "No previous purchase timestamp found. "
                        "Please toggle and save the automation to start the timer. "
                        "(Time-based trigger not satisfied.)"
                    )
                log_msg = f"[AutoVIP] SKIP: Automated VIP purchase for session '{label}' skipped: {guardrail_reason}"
                logging.info(log_msg)
                append_ui_event_log({
                    "timestamp": now.isoformat(),
                    "label": label,
                    "event_type": "automation",
                    "trigger": "automation",
                    "purchase_type": "vip",
                    "amount": weeks,
                    "details": {"points_before": points},
                    "result": "skipped",
                    "status_message": f"Automated VIP purchase skipped: {guardrail_reason}"
                })
                # Reset retry state if not eligible
                if 'retry' in automation:
                    automation.pop('retry', None)
                    automation.pop('cooldown_until', None)
                    save_session(cfg, old_label=label)  # type: ignore
                continue
            # --- Automation-level point threshold guardrail ---
            if trigger_type in ('points', 'both') and int(points) < int(trigger_point_threshold):
                guardrail_reason = f"Below automation point threshold: {points} < {trigger_point_threshold}"
                log_msg = f"[AutoVIP] SKIP: Automated VIP purchase for session '{label}' skipped: {guardrail_reason}"
                logging.info(log_msg)
                append_ui_event_log({
                    "timestamp": now.isoformat(),
                    "label": label,
                    "event_type": "automation",
                    "trigger": "automation",
                    "purchase_type": "vip",
                    "amount": weeks,
                    "details": {"points_before": points},
                    "result": "skipped",
                    "status_message": f"Automated VIP purchase skipped: {guardrail_reason}"
                })
                # Reset retry state if not eligible
                if 'retry' in automation:
                    automation.pop('retry', None)
                    automation.pop('cooldown_until', None)
                    save_session(cfg, old_label=label)  # type: ignore
                continue
            # --- Retry/cooldown logic ---
            retry = automation.get('retry', 0)
            cooldown_until = automation.get('cooldown_until')
            now_ts = int(time.time())
            if cooldown_until and now_ts < cooldown_until:
                logging.info(f"[VIPAuto] label={label} trigger=automation result=skipped reason=cooldown active until {cooldown_until}")
                append_ui_event_log({
                    "timestamp": now.isoformat(),
                    "label": label,
                    "event_type": "automation",
                    "trigger": "automation",
                    "purchase_type": "vip",
                    "amount": weeks,
                    "details": {"points_before": points},
                    "result": "skipped",
                    "status_message": f"Cooldown active until {cooldown_until}"
                })
                continue
            # If retry > 0, and last failure was < 60s ago, wait before retrying
            last_fail_time = automation.get('last_fail_time', 0)
            if retry > 0 and (now_ts - last_fail_time) < 60:
                logging.info(f"[VIPAuto] label={label} trigger=automation result=skipped reason=waiting_between_retries retry={retry}")
                append_ui_event_log({
                    "timestamp": now.isoformat(),
                    "label": label,
                    "event_type": "automation",
                    "trigger": "automation",
                    "purchase_type": "vip",
                    "amount": weeks,
                    "details": {"points_before": points},
                    "result": "skipped",
                    "status_message": f"Waiting between retries (retry {retry})"
                })
                continue
            # Support 'max' for automation as well
            is_max = str(weeks).lower() in ["max", "90"]
            duration = "max" if is_max else str(weeks)
            result = buy_vip(mam_id, duration=duration, proxy_cfg=proxy_cfg)
            success = result.get('success', False) if result else False
            status_message = f"Automated purchase: VIP ({'Max me out!' if is_max else f'{weeks} weeks'})" if success else f"Automated VIP purchase failed ({'Max me out!' if is_max else f'{weeks} weeks'})"
            event = {
                "timestamp": now.isoformat(),
                "label": label,
                "event_type": "automation",
                "trigger": "automation",
                "purchase_type": "vip",
                "amount": weeks,
                "details": {"points_before": points},
                "result": "success" if success else "failed",
                "error": None if success else (result.get('error') or result.get('response') or 'Unknown error'),
                "status_message": status_message
            }
            from backend.notifications_backend import notify_event
            if success:
                logging.info(f"[VIPAuto] Automated purchase: VIP ({'max' if is_max else weeks}) for session '{label}' succeeded.")
                # Update last purchase timestamp and reset retry state on success
                cfg['perk_automation']['vip_automation']['last_vip_time'] = now_dt.isoformat()
                automation['retry'] = 0
                automation.pop('cooldown_until', None)
                automation.pop('last_fail_time', None)
                save_session(cfg, old_label=label)  # type: ignore
                notify_event(
                    event_type="automation_success",
                    label=label,
                    status="SUCCESS",
                    message=f"Automated VIP purchase succeeded: {'Max me out!' if is_max else str(weeks) + ' weeks'}",
                    details={"amount": weeks, "points_before": points}
                )
            else:
                logging.warning(f"[VIPAuto] Automated purchase: VIP ({'max' if is_max else weeks}) for session '{label}' FAILED. Error: {event['error']}")
                # Retry logic: up to 3 times, 1 minute apart
                retry = automation.get('retry', 0) + 1
                automation['retry'] = retry
                automation['last_fail_time'] = now_ts
                if retry >= 3:
                    # Set cooldown until next main run (10 min = 600s)
                    automation['cooldown_until'] = now_ts + 600
                    logging.warning(f"[VIPAuto] Automated purchase: VIP ({'max' if is_max else weeks}) for session '{label}' retries_exceeded, cooldown_until={automation['cooldown_until']}")
                save_session(cfg, old_label=label)  # type: ignore
                notify_event(
                    event_type="automation_failure",
                    label=label,
                    status="FAILED",
                    message=f"Automated VIP purchase failed: {'Max me out!' if is_max else str(weeks) + ' weeks'}",
                    details={"amount": weeks, "points_before": points, "error": event['error']}
                )
            append_ui_event_log(event)
        except Exception as e:
            logging.error(f"[VIPAuto] label={label} trigger=automation result=exception error={e}")

def wedge_automation_job():
    from datetime import datetime, timezone, timedelta
    session_labels = list_sessions()
    now = datetime.now(timezone.utc)
    for label in session_labels:
        try:
            cfg = load_session(label)  # Always reload config
            mam_id = cfg.get('mam', {}).get('mam_id', "")
            if not mam_id:
                continue
            automation = cfg.get('perk_automation', {}).get('wedge_automation', {})
            enabled = automation.get('enabled', False)
            if not enabled:
                continue
            trigger_type = automation.get('trigger_type', 'points')
            trigger_days = automation.get('trigger_days', 7)
            trigger_point_threshold = automation.get('trigger_point_threshold', 50000)
            from backend.proxy_config import resolve_proxy_from_session_cfg
            proxy_cfg = resolve_proxy_from_session_cfg(cfg)  # Always resolve proxy
            status = get_status(mam_id=mam_id, proxy_cfg=proxy_cfg)
            points = status.get('points', 0) if isinstance(status, dict) else 0
            if points is None:
                points = 0
            # --- Session-level minimum points guardrail (first, before any automation-level checks) ---
            session_min_points = cfg.get('perk_automation', {}).get('min_points')
            logging.debug(f"[AutoWedge][DEBUG] Session '{label}': points={points}, session_min_points={session_min_points}")
            if session_min_points is not None and int(points) < int(session_min_points):
                guardrail_reason = f"Below session minimum points: {points} < {session_min_points}"
                log_msg = f"[AutoWedge] SKIP: Automated Wedge purchase for session '{label}' skipped: {guardrail_reason}"
                logging.info(log_msg)
                append_ui_event_log({
                    "timestamp": now.isoformat(),
                    "label": label,
                    "event_type": "automation",
                    "trigger": "automation",
                    "purchase_type": "wedge",
                    "amount": 1,
                    "details": {"points_before": points},
                    "result": "skipped",
                    "status_message": f"Automated Wedge purchase skipped: {guardrail_reason}"
                })
                # Do not check any automation-level guardrails if session minimum is not met
                continue
            # --- Time-based trigger enforcement ---
            last_wedge_time = cfg.get('perk_automation', {}).get('wedge_automation', {}).get('last_wedge_time')
            last_purchase = None
            if last_wedge_time:
                try:
                    last_purchase = datetime.fromisoformat(last_wedge_time if 'T' in last_wedge_time else last_wedge_time.replace(' ', 'T'))
                except Exception:
                    last_purchase = None
            now_dt = now if isinstance(now, datetime) else datetime.now(timezone.utc)
            time_trigger_ok = True
            if trigger_type in ('time', 'both'):
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
                    guardrail_reason = f"Time-based trigger not satisfied: next allowed after {next_allowed_str}"
                else:
                    guardrail_reason = (
                        "No previous purchase timestamp found. "
                        "Please toggle and save the automation to start the timer. "
                        "(Time-based trigger not satisfied.)"
                    )
                log_msg = f"[AutoWedge] SKIP: Automated Wedge purchase for session '{label}' skipped: {guardrail_reason}"
                logging.info(log_msg)
                append_ui_event_log({
                    "timestamp": now.isoformat(),
                    "label": label,
                    "event_type": "automation",
                    "trigger": "automation",
                    "purchase_type": "wedge",
                    "amount": 1,
                    "details": {"points_before": points},
                    "result": "skipped",
                    "status_message": f"Automated Wedge purchase skipped: {guardrail_reason}"
                })
                continue
            # --- Automation-level point threshold guardrail ---
            if trigger_type in ('points', 'both') and int(points) < int(trigger_point_threshold):
                guardrail_reason = f"Below automation point threshold: {points} < {trigger_point_threshold}"
                log_msg = f"[AutoWedge] SKIP: Automated Wedge purchase for session '{label}' skipped: {guardrail_reason}"
                logging.info(log_msg)
                append_ui_event_log({
                    "timestamp": now.isoformat(),
                    "label": label,
                    "event_type": "automation",
                    "trigger": "automation",
                    "purchase_type": "wedge",
                    "amount": 1,
                    "details": {"points_before": points},
                    "result": "skipped",
                    "status_message": f"Automated Wedge purchase skipped: {guardrail_reason}"
                })
                continue
            # All guardrails passed, attempt purchase
            result = buy_wedge(mam_id, proxy_cfg=proxy_cfg)
            success = result.get('success', False) if result else False
            status_message = f"Automated purchase: Wedge (points)" if success else f"Automated Wedge purchase failed (points)"
            event = {
                "timestamp": now.isoformat(),
                "label": label,
                "event_type": "automation",
                "trigger": "automation",
                "purchase_type": "wedge",
                "amount": 1,
                "details": {"points_before": points},
                "result": "success" if success else "failed",
                "error": None if success else (result.get('error') or result.get('response') or 'Unknown error'),
                "status_message": status_message
            }
            from backend.notifications_backend import notify_event
            if success:
                # Update last purchase timestamp in new field
                cfg['perk_automation']['wedge_automation']['last_wedge_time'] = now_dt.isoformat()
                from backend.config import save_session
                save_session(cfg, old_label=label)  # type: ignore
                logging.info(f"[WedgeAuto] Automated purchase: Wedge (points) for session '{label}' succeeded.")
                notify_event(
                    event_type="automation_success",
                    label=label,
                    status="SUCCESS",
                    message="Automated Wedge purchase succeeded: 1",
                    details={"amount": 1, "points_before": points}
                )
            else:
                logging.warning(f"[WedgeAuto] Automated purchase: Wedge (points) for session '{label}' FAILED. Error: {event['error']}")
                notify_event(
                    event_type="automation_failure",
                    label=label,
                    status="FAILED",
                    message="Automated Wedge purchase failed: 1",
                    details={"amount": 1, "points_before": points, "error": event['error']}
                )
            append_ui_event_log(event)
        except Exception as e:
            logging.error(f"[WedgeAuto] label={label} trigger=automation result=exception error={e}")

    
