import logging
from backend.perk_automation import buy_wedge, buy_vip
from backend.event_log import append_ui_event_log
from backend.config import list_sessions, load_session, save_session
from backend.mam_api import get_status
from datetime import datetime, timezone

def wedge_automation_job():
    session_labels = list_sessions()
    now = datetime.now(timezone.utc)
    for label in session_labels:
        try:
            cfg = load_session(label)
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
            proxy_cfg = cfg.get('proxy', {})
            status = get_status(mam_id=mam_id, proxy_cfg=proxy_cfg)
            points = status.get('points', 0) if isinstance(status, dict) else 0
            # Guardrails (example: only trigger if points >= threshold)
            if trigger_type in ('points', 'both') and points < trigger_point_threshold:
                logging.debug(f"[WedgeAuto] label={label} trigger=automation result=skipped reason=below_point_threshold points={points} threshold={trigger_point_threshold}")
                append_ui_event_log({
                    "timestamp": now.isoformat(),
                    "label": label,
                    "event_type": "automation",
                    "trigger": "automation",
                    "purchase_type": "wedge",
                    "amount": 1,
                    "details": {"points_before": points},
                    "result": "skipped",
                    "status_message": f"Below point threshold: {points} < {trigger_point_threshold}"
                })
                continue
            # (Time-based triggers would need last-run tracking, omitted for brevity)
            # Each wedge costs 10,000 points (adjust as needed)
            total_cost = 10000
            if points < total_cost:
                logging.debug(f"[WedgeAuto] label={label} trigger=automation result=skipped reason=not_enough_points points={points} cost={total_cost}")
                append_ui_event_log({
                    "timestamp": now.isoformat(),
                    "label": label,
                    "event_type": "automation",
                    "trigger": "automation",
                    "purchase_type": "wedge",
                    "amount": 1,
                    "details": {"points_before": points},
                    "result": "skipped",
                    "status_message": f"Not enough points: {points} < {total_cost}"
                })
                continue
            # Trigger automation
            result = buy_wedge(mam_id, proxy_cfg=proxy_cfg)
            success = result.get('success', False) if result else False
            status_message = f"Automated purchase: Wedge (points)" if success else f"Automated wedge purchase failed (points)"
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
            if success:
                logging.info(f"[WedgeAuto] Automated purchase: Wedge (points) for session '{label}' succeeded.")
            else:
                logging.warning(f"[WedgeAuto] Automated purchase: Wedge (points) for session '{label}' FAILED. Error: {event['error']}")
            append_ui_event_log(event)
        except Exception as e:
            logging.error(f"[WedgeAuto] label={label} trigger=automation result=exception error={e}")

def vip_automation_job():
    import time
    session_labels = list_sessions()
    now = datetime.now(timezone.utc)
    for label in session_labels:
        try:
            cfg = load_session(label)
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
            proxy_cfg = cfg.get('proxy', {})
            # Always define weeks before any code path that uses it
            weeks = 4
            status = get_status(mam_id=mam_id, proxy_cfg=proxy_cfg)
            points = status.get('points', 0) if isinstance(status, dict) else 0
            # Guardrails (example: only trigger if points >= threshold)
            if trigger_type in ('points', 'both') and points < trigger_point_threshold:
                logging.debug(f"[VIPAuto] label={label} trigger=automation result=skipped reason=below_point_threshold points={points} threshold={trigger_point_threshold}")
                append_ui_event_log({
                    "timestamp": now.isoformat(),
                    "label": label,
                    "event_type": "automation",
                    "trigger": "automation",
                    "purchase_type": "vip",
                    "amount": weeks,
                    "details": {"points_before": points},
                    "result": "skipped",
                    "status_message": f"Below point threshold: {points} < {trigger_point_threshold}"
                })
                # Reset retry state if not eligible
                if 'retry' in automation:
                    automation.pop('retry', None)
                    automation.pop('cooldown_until', None)
                    save_session(cfg, old_label=label)
                continue
            # Each 4 weeks costs 5,000 points (adjust as needed)
            weeks = 4
            total_cost = 5000
            if points < total_cost:
                logging.debug(f"[VIPAuto] label={label} trigger=automation result=skipped reason=not_enough_points points={points} cost={total_cost}")
                append_ui_event_log({
                    "timestamp": now.isoformat(),
                    "label": label,
                    "event_type": "automation",
                    "trigger": "automation",
                    "purchase_type": "vip",
                    "amount": weeks,
                    "details": {"points_before": points},
                    "result": "skipped",
                    "status_message": f"Not enough points: {points} < {total_cost}"
                })
                # Reset retry state if not eligible
                if 'retry' in automation:
                    automation.pop('retry', None)
                    automation.pop('cooldown_until', None)
                    save_session(cfg, old_label=label)
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

            # Trigger automation
            result = buy_vip(mam_id, duration=str(weeks), proxy_cfg=proxy_cfg)
            success = result.get('success', False) if result else False
            status_message = f"Automated purchase: VIP ({weeks} weeks)" if success else f"Automated VIP purchase failed ({weeks} weeks)"
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
            if success:
                logging.info(f"[VIPAuto] Automated purchase: VIP ({weeks} weeks) for session '{label}' succeeded.")
                # Reset retry state on success
                automation['retry'] = 0
                automation.pop('cooldown_until', None)
                automation.pop('last_fail_time', None)
                save_session(cfg, old_label=label)
            else:
                logging.warning(f"[VIPAuto] Automated purchase: VIP ({weeks} weeks) for session '{label}' FAILED. Error: {event['error']}")
                # Retry logic: up to 3 times, 1 minute apart
                retry = automation.get('retry', 0) + 1
                automation['retry'] = retry
                automation['last_fail_time'] = now_ts
                if retry >= 3:
                    # Set cooldown until next main run (10 min = 600s)
                    automation['cooldown_until'] = now_ts + 600
                    logging.warning(f"[VIPAuto] Automated purchase: VIP ({weeks} weeks) for session '{label}' retries_exceeded, cooldown_until={automation['cooldown_until']}")
                save_session(cfg, old_label=label)
            append_ui_event_log(event)
        except Exception as e:
            logging.error(f"[VIPAuto] label={label} trigger=automation result=exception error={e}")
