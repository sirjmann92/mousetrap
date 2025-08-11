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
                continue
            # (Time-based triggers would need last-run tracking, omitted for brevity)
            # Each wedge costs 10,000 points (adjust as needed)
            total_cost = 10000
            if points < total_cost:
                logging.debug(f"[WedgeAuto] label={label} trigger=automation result=skipped reason=not_enough_points points={points} cost={total_cost}")
                continue
            # Trigger automation
            result = buy_wedge(mam_id, proxy_cfg=proxy_cfg)
            success = result.get('success', False) if result else False
            event = {
                "timestamp": now.isoformat(),
                "label": label,
                "trigger": "automation",
                "purchase_type": "wedge",
                "amount": 1,
                "details": {
                    "points_before": points,
                },
                "result": "success" if success else "failed",
                "error": None,
            }
            if success:
                logging.info(f"[WedgeAuto] label={label} trigger=automation result=success points_before={points}")
            else:
                err_msg = result.get('error') or result.get('response') or 'Unknown error'
                event["error"] = err_msg
                logging.warning(f"[WedgeAuto] label={label} trigger=automation result=failed points_before={points} error={err_msg}")
            append_ui_event_log(event)
        except Exception as e:
            logging.error(f"[WedgeAuto] label={label} trigger=automation result=exception error={e}")

def vip_automation_job():
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
            status = get_status(mam_id=mam_id, proxy_cfg=proxy_cfg)
            points = status.get('points', 0) if isinstance(status, dict) else 0
            # Guardrails (example: only trigger if points >= threshold)
            if trigger_type in ('points', 'both') and points < trigger_point_threshold:
                logging.debug(f"[VIPAuto] label={label} trigger=automation result=skipped reason=below_point_threshold points={points} threshold={trigger_point_threshold}")
                continue
            # (Time-based triggers would need last-run tracking, omitted for brevity)
            # Each 4 weeks costs 5,000 points (adjust as needed)
            weeks = 4
            total_cost = 5000
            if points < total_cost:
                logging.debug(f"[VIPAuto] label={label} trigger=automation result=skipped reason=not_enough_points points={points} cost={total_cost}")
                continue
            # Trigger automation
            result = buy_vip(mam_id, duration=str(weeks), proxy_cfg=proxy_cfg)
            success = result.get('success', False) if result else False
            event = {
                "timestamp": now.isoformat(),
                "label": label,
                "trigger": "automation",
                "purchase_type": "vip",
                "amount": weeks,
                "details": {
                    "points_before": points,
                },
                "result": "success" if success else "failed",
                "error": None,
            }
            if success:
                logging.info(f"[VIPAuto] label={label} trigger=automation result=success points_before={points}")
            else:
                err_msg = result.get('error') or result.get('response') or 'Unknown error'
                event["error"] = err_msg
                logging.warning(f"[VIPAuto] label={label} trigger=automation result=failed points_before={points} error={err_msg}")
            append_ui_event_log(event)
        except Exception as e:
            logging.error(f"[VIPAuto] label={label} trigger=automation result=exception error={e}")
