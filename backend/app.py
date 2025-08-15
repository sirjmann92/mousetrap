def get_auto_update_val(status):
    val = status.get('auto_update_seedbox') if isinstance(status, dict) else None
    if val is None or val == '' or val is False:
        return 'N/A'
    if isinstance(val, dict):
        msg = val.get('msg')
        reason = val.get('reason')
        error = val.get('error')
        if val.get('success') and msg:
            # If reason is present, append it for clarity
            if reason:
                return f"{msg} ({reason})"
            return msg
        if error:
            if reason:
                return f"{error} ({reason})"
            return error
        return 'N/A'
    return str(val)

from backend.ip_lookup import get_ipinfo_with_fallback, get_asn_and_timezone_from_ip, get_public_ip
import re
from backend.event_log import UI_EVENT_LOG_PATH, UI_EVENT_LOG_LOCK
from backend.automation import wedge_automation_job, vip_automation_job
from backend.utils import build_status_message
from backend.utils import extract_asn_number
from fastapi import FastAPI, Request, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse
import os
from datetime import datetime, timezone, timedelta
import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
import requests

from backend.config import load_config, save_config, list_sessions, load_session, save_session, delete_session
from backend.mam_api import get_status, get_mam_seen_ip_info
from backend.perk_automation import buy_wedge, buy_vip, buy_upload_credit
from backend.last_session_api import router as last_session_router

from backend.api_event_log import router as event_log_router
from backend.api_config import router as config_router
from backend.api_automation import router as automation_router
from backend.api_port_monitor import router as port_monitor_router


# --- FastAPI app creation ---
app = FastAPI(title="MouseTrap API")

# Mount API routers
app.include_router(event_log_router, prefix="/api")
app.include_router(config_router, prefix="/api")
app.include_router(automation_router, prefix="/api")
app.include_router(port_monitor_router)
# Serve logs directory as static files for UI event log access (must be before any catch-all routes)
logs_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'logs')
if os.path.isdir(logs_dir):
    app.mount("/logs", StaticFiles(directory=logs_dir), name="logs")
@app.get("/api/automation/guardrails")
def api_automation_guardrails():
    """
    Returns a mapping of session labels to MaM usernames and enabled automations for guardrail logic.
    Example:
        {
            "Gluetun": {"username": "example_user", "autoUpload": true, "autoWedge": false, "autoVIP": false},
            ...
        }
    """
    sessions = list_sessions()
    result = {}
    for label in sessions:
        cfg = load_session(label)
        # Try to get username from last_status.raw.username
        username = None
        last_status = cfg.get("last_status", {})
        raw = last_status.get("raw", {})
        username = raw.get("username")
        # Fallback: try mam_id or proxy.username if username missing
        if not username:
            username = cfg.get("mam", {}).get("mam_id") or cfg.get("proxy", {}).get("username")
        perk_auto = cfg.get("perk_automation", {})
        result[label] = {
            "username": username,
            "autoUpload": perk_auto.get("upload_credit", {}).get("enabled", False),
            "autoWedge": perk_auto.get("wedge_automation", {}).get("enabled", False),
            "autoVIP": perk_auto.get("vip_automation", {}).get("enabled", False),
        }
    return result

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev; restrict in prod!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(last_session_router)

session_status_cache = {}


# Configure logging at the top of the file (after imports)

# Configure logging at the top of the file (after imports)
loglevel = os.environ.get("LOGLEVEL", "INFO").upper()
logging.basicConfig(
    level=getattr(logging, loglevel, logging.WARNING),
    format='[%(asctime)s %(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S %Z',
)

# Suppress overly verbose DEBUG logs from requests, urllib3, httpx unless explicitly set to DEBUG
if getattr(logging, loglevel, logging.WARNING) > logging.DEBUG:
    logging.getLogger("urllib3").setLevel(logging.INFO)
    logging.getLogger("httpx").setLevel(logging.INFO)
    logging.getLogger("requests").setLevel(logging.INFO)

# Set APScheduler logs to WARNING to suppress DEBUG/INFO from APScheduler internals
logging.getLogger('apscheduler').setLevel(logging.WARNING)

# Set APScheduler logs to WARNING to suppress DEBUG/INFO from APScheduler internals
logging.getLogger('apscheduler').setLevel(logging.WARNING)


def auto_update_seedbox_if_needed(cfg, label, ip_to_use, asn, now):
    session_type = cfg.get('mam', {}).get('session_type', '').lower()  # 'ip locked' or 'asn locked'
    last_seedbox_ip = cfg.get('last_seedbox_ip')
    last_seedbox_asn = cfg.get('last_seedbox_asn')
    last_seedbox_update = cfg.get('last_seedbox_update')
    mam_id = cfg.get('mam', {}).get('mam_id', "")
    # Do not log mam_id value
    update_needed = False
    reason = None
    # Remove all IP logic for the API call; only use mam_id and proxy
    proxy_cfg = cfg.get('proxy', {})
    proxies = None
    proxy_url = None
    # Only use proxy if proxy config is present and has a host
    if proxy_cfg and proxy_cfg.get('host'):
        # If config is already a URL string
        proxy_url = proxy_cfg.get('http') or proxy_cfg.get('https') or proxy_cfg.get('all')
        # If not, try to build from host/port/username/password
        if not proxy_url and 'host' in proxy_cfg and 'port' in proxy_cfg:
            userpass = ''
            if proxy_cfg.get('username') and proxy_cfg.get('password'):
                userpass = f"{proxy_cfg['username']}:{proxy_cfg['password']}@"
            proxy_url = f"http://{userpass}{proxy_cfg['host']}:{proxy_cfg['port']}"
        if proxy_url:
            proxies = {
                'http': proxy_url,
                'https': proxy_url
            }
        else:
            # Check for partial (malformed) config: some but not all fields present
            proxy_fields = [proxy_cfg.get('host'), proxy_cfg.get('port'), proxy_cfg.get('username'), proxy_cfg.get('password')]
            filled = [v for v in proxy_fields if v]
            if 0 < len(filled) < len(proxy_fields):
                logging.warning(f"[AutoUpdate] label={label} proxy config is incomplete or malformed; skipping proxy usage.")
            # If all are empty, just ignore (proxy is optional)
            proxies = None
    # If no proxy config or no host, proxies remains None (no error, direct connection)
    # Do not log proxies dict (may contain sensitive info)
    # Only trigger update if something changed (IP or ASN)
    update_needed = False
    reason = None
    # If ASN-locked and ASN changed but IP did not, update ASN in config only
    if session_type == 'asn locked':
        # Always get ASN using proxy if available
        proxied_ip = cfg.get('proxied_public_ip')
        proxy_cfg = cfg.get('proxy', {})
        asn_to_check, _ = get_asn_and_timezone_from_ip(proxied_ip or ip_to_use, proxy_cfg if proxied_ip else None)

        norm_last = extract_asn_number(last_seedbox_asn)
        norm_check = extract_asn_number(asn_to_check) if 'asn_to_check' in locals() else None
        # Always store the normalized ASN number
        if norm_check is not None:
            cfg["last_seedbox_asn"] = norm_check
            save_session(cfg, old_label=label)
        # Log ASN compare and result at INFO level, but only once per check
        if norm_last != norm_check:
            reason = f"ASN changed: {norm_last} -> {norm_check}"
            logging.info(f"[AutoUpdate] label={label} ASN changed, no seedbox API call. reason={reason}")
            logging.debug(f"[AutoUpdate][RETURN] label={label} Returning after ASN change, no seedbox update performed. reason={reason}")
            return False, {"success": True, "msg": "ASN changed, no seedbox update performed.", "reason": reason}
        else:
            logging.info(f"[AutoUpdate] label={label} ASN compare: {norm_last} -> {norm_check} | ASN result: No change needed.")
    # For proxied sessions, use proxied IP; for non-proxied, use detected public IP
    proxied_ip = cfg.get('proxied_public_ip')
    if proxied_ip:
        ip_to_check = proxied_ip
    else:
        # For non-proxied, get detected public IP (not mam_ip)
        detected_ip = get_public_ip()
        ip_to_check = detected_ip
    if last_seedbox_ip is None or ip_to_check != last_seedbox_ip:
        update_needed = True
        reason = f"IP changed: {last_seedbox_ip} -> {ip_to_check or 'N/A'}"
    # Log IP compare and result at INFO level, but only once per check
    if last_seedbox_ip is None or ip_to_check != last_seedbox_ip:
        logging.info(f"[AutoUpdate] label={label} IP changed: {last_seedbox_ip} -> {ip_to_check or 'N/A'}")
    else:
        logging.info(f"[AutoUpdate] label={label} IP compare: {last_seedbox_ip} -> {ip_to_check} | IP result: No change needed.")
    if update_needed:
        logging.info(f"[AutoUpdate] label={label} update_needed=True asn={asn} reason={reason}")
        logging.debug(f"[AutoUpdate][DEBUG] label={label} session_type={session_type} update_needed={update_needed}")
        # If update is needed (IP or proxied IP changed), call seedbox API
        if not mam_id:
            logging.warning(f"[AutoUpdate] label={label} update_needed=True but mam_id is missing. Skipping seedbox API call.")
            logging.debug(f"[AutoUpdate][RETURN] label={label} Returning due to missing mam_id. reason={reason}")
            return False, {"success": False, "error": "mam_id missing", "reason": reason}
        # Only treat as rate-limited if the API actually returns 429 or 'too recent', not just based on timer
        try:
            logging.debug(f"[AutoUpdate][TRACE] label={label} About to call seedbox API (using proxy)")
            cookies = {"mam_id": mam_id}
            resp = requests.get("https://t.myanonamouse.net/json/dynamicSeedbox.php", cookies=cookies, timeout=10, proxies=proxies)
            logging.debug(f"[AutoUpdate][TRACE] label={label} Seedbox API call complete. Status={resp.status_code}")
            try:
                result = resp.json()
                logging.debug(f"[AutoUpdate][TRACE] label={label} Seedbox API response JSON received")
            except Exception as e_json:
                logging.warning(f"[AutoUpdate][TRACE] label={label} Non-JSON response from seedbox API (error: {e_json})")
                result = {"Success": False, "msg": f"Non-JSON response: {resp.text}"}
            if resp.status_code == 200 and result.get("Success"):
                # Update last_seedbox_ip and mam_ip to the new detected/proxied IP
                proxied_ip = cfg.get('proxied_public_ip')
                if proxied_ip:
                    new_ip = proxied_ip
                else:
                    new_ip = get_public_ip()
                cfg["last_seedbox_ip"] = new_ip
                cfg["mam_ip"] = new_ip
                cfg["last_seedbox_update"] = now.isoformat()
                cfg["last_seedbox_asn"] = asn
                logging.debug(f"[AutoUpdate][DEBUG] label={label} about to save config")
                try:
                    save_session(cfg, old_label=label)
                    logging.debug(f"[AutoUpdate][DEBUG] label={label} save_session successful.")
                except Exception as e:
                    logging.error(f"[AutoUpdate][ERROR] label={label} save_session failed: {e}")
                logging.info(f"[AutoUpdate] label={label} result=success reason={reason}")
                api_msg = result.get("msg", "").strip()
                if not api_msg or api_msg.lower() == "completed":
                    api_msg = "IP Changed. Seedbox IP updated."
                return True, {"success": True, "msg": api_msg, "reason": reason}
            elif resp.status_code == 200 and result.get("msg") == "No change":
                proxied_ip = cfg.get('proxied_public_ip')
                if proxied_ip:
                    new_ip = proxied_ip
                else:
                    new_ip = get_public_ip()
                cfg["last_seedbox_ip"] = new_ip
                cfg["mam_ip"] = new_ip
                cfg["last_seedbox_update"] = now.isoformat()
                cfg["last_seedbox_asn"] = asn
                logging.debug(f"[AutoUpdate][DEBUG] label={label} about to save config")
                try:
                    save_session(cfg, old_label=label)
                    logging.debug(f"[AutoUpdate][DEBUG] label={label} save_session successful.")
                except Exception as e:
                    logging.error(f"[AutoUpdate][ERROR] label={label} save_session failed: {e}")
                logging.info(f"[AutoUpdate] label={label} result=no_change reason={reason}")
                return True, {"success": True, "msg": "No change: IP/ASN already set.", "reason": reason}
            elif resp.status_code == 429 or (
                isinstance(result.get("msg"), str) and "too recent" in result.get("msg", "")
            ):
                # Do NOT update last_seedbox_ip or mam_ip if rate-limited; return rate-limit info for UI
                rate_limit_minutes = 60
                if last_seedbox_update:
                    last_update_dt = datetime.fromisoformat(last_seedbox_update)
                    minutes_left = max(0, 60 - int((now - last_update_dt).total_seconds() // 60))
                    rate_limit_minutes = minutes_left
                return True, {"success": False, "error": f"Rate limit: last change too recent. Try again in {rate_limit_minutes} minutes.", "reason": reason, "rate_limit_minutes": rate_limit_minutes}
            else:
                logging.info(f"[AutoUpdate] label={label} result=error reason={reason}")
                return True, {"success": False, "error": result.get("msg", "Unknown error"), "reason": reason}
        except Exception as e:
            logging.warning(f"[AutoUpdate] label={label} result=exception reason={reason} error={e}")
            logging.debug(f"[AutoUpdate][RETURN] label={label} Returning after exception in seedbox API call. reason={reason}")
            return True, {"success": False, "error": str(e), "reason": reason}
    else:
        # Already logged IP/ASN compare and result above, so just add a single debug trace for return
        logging.debug(f"[AutoUpdate][RETURN] label={label} Returning default path (no update needed or triggered).")
    return False, None

@app.get("/api/status")
def api_status(label: str = Query(None), force: int = Query(0)):
    global session_status_cache
    # Only fetch non-proxied IP/ASN for UI display (not for backend automation if proxied session is active)
    detected_ipinfo_data = get_ipinfo_with_fallback()
    detected_public_ip = get_public_ip(ipinfo_data=detected_ipinfo_data)
    detected_public_ip_asn = None
    if detected_public_ip:
        asn_full_pub, _ = get_asn_and_timezone_from_ip(detected_public_ip, ipinfo_data=detected_ipinfo_data)
        match_pub = re.search(r'(AS)?(\d+)', asn_full_pub or "") if asn_full_pub else None
        detected_public_ip_asn = match_pub.group(2) if match_pub else asn_full_pub

    cfg = load_session(label) if label else None
    if cfg is None:
        # Always return detected_public_ip and asn, even if label is missing
        return {
            "configured": False,
            "status_message": "Session not configured. Please save session details to begin.",
            "last_check_time": None,
            "next_check_time": None,
            "details": {},
            "detected_public_ip": detected_public_ip,
            "detected_public_ip_asn": detected_public_ip_asn,
        }
    # --- Proxied public IP/ASN detection (only once) ---
    from backend.mam_api import get_proxied_public_ip_and_asn
    proxy_cfg = cfg.get("proxy", {})
    proxied_public_ip, proxied_public_ip_asn = None, None
    if proxy_cfg and proxy_cfg.get("host"):
        # Only fetch proxied IP/ASN for backend logic if proxied session is active
        proxied_ipinfo_data = get_ipinfo_with_fallback(proxy_cfg=proxy_cfg)
        proxied_public_ip = get_public_ip(proxy_cfg=proxy_cfg, ipinfo_data=proxied_ipinfo_data)
        asn_full_proxied, _ = get_asn_and_timezone_from_ip(proxied_public_ip, proxy_cfg=proxy_cfg, ipinfo_data=proxied_ipinfo_data)
        asn_str = str(asn_full_proxied) if asn_full_proxied is not None else ""
        match_proxied = re.search(r'(AS)?(\d+)', asn_str) if asn_str else None
        proxied_public_ip_asn = match_proxied.group(2) if match_proxied else asn_str
        # Save to config if changed
        if proxied_public_ip and cfg.get("proxied_public_ip") != proxied_public_ip:
            cfg["proxied_public_ip"] = proxied_public_ip
            cfg["proxied_public_ip_asn"] = proxied_public_ip_asn
            save_session(cfg, old_label=label)
    else:
        # Clear if no proxy
        if cfg.get("proxied_public_ip") or cfg.get("proxied_public_ip_asn"):
            cfg["proxied_public_ip"] = None
            cfg["proxied_public_ip_asn"] = None
            save_session(cfg, old_label=label)
    if not label:
        # Always return detected_public_ip and asn, even if label is missing
        return {
            "configured": False,
            "status_message": "Session label required.",
            "last_check_time": None,
            "next_check_time": None,
            "details": {},
            "detected_public_ip": detected_public_ip,
            "detected_public_ip_asn": detected_public_ip_asn,
        }
    cfg = load_session(label)
    mam_id = cfg.get('mam', {}).get('mam_id', "")
    mam_ip_override = cfg.get('mam_ip', "").strip()
    # If session is not configured (no mam_id), return not configured status
    if not mam_id:
        return {
            "configured": False,
            "status_message": "Session not configured. Please save session details to begin.",
            "last_check_time": None,
            "next_check_time": None,
            "details": {},
            "detected_public_ip": detected_public_ip,
            "detected_public_ip_asn": detected_public_ip_asn,
        }
    # Use proxied public IP if available, else fallback
    ip_to_use = mam_ip_override or proxied_public_ip or detected_public_ip
    # Get ASN for configured IP
    asn_full, _ = get_asn_and_timezone_from_ip(ip_to_use) if ip_to_use else (None, None)
    match = re.search(r'(AS)?(\d+)', asn_full or "") if asn_full else None
    asn = match.group(2) if match else asn_full
    mam_session_as = asn_full
    # Also get MAM's perspective for display only
    mam_seen = get_mam_seen_ip_info(mam_id, proxy_cfg=proxy_cfg)
    mam_seen_asn = str(mam_seen.get("ASN")) if mam_seen.get("ASN") is not None else None
    mam_seen_as = mam_seen.get("AS")
    tz_env = os.environ.get("TZ")
    timezone_used = tz_env if tz_env else "UTC"
    now = datetime.now(timezone.utc)
    # Remove timer persistence: do not use session file for last_check_time
    cache = session_status_cache.get(label, {})
    status = cache.get("status", {})
    last_check_time = cache.get("last_check_time")
    auto_update_result = None
    # Always fetch ASN for detected_public_ip
    detected_public_ip_asn = None
    detected_public_ip_as = None
    if detected_public_ip:
        asn_full_pub, _ = get_asn_and_timezone_from_ip(detected_public_ip)
        match_pub = re.search(r'(AS)?(\d+)', asn_full_pub or "") if asn_full_pub else None
        detected_public_ip_asn = match_pub.group(2) if match_pub else asn_full_pub
        detected_public_ip_as = asn_full_pub
    # If session has never been checked (no last_status and not forced), return not configured
    if not force and (label not in session_status_cache or not session_status_cache[label].get("status")):
        last_status = cfg.get('last_status')
        last_check_time = cfg.get('last_check_time')
        if not last_status or not last_check_time:
            return {
                "configured": False,
                "status_message": "Session not configured. Please save session details to begin.",
                "last_check_time": None,
                "next_check_time": None,
                "details": {},
            }
    if force or not status:
        if force:
            logging.debug(f"[SessionCheck][TRIGGER] label={label} source=forced_api_status")
            mam_status = get_status(mam_id=mam_id, proxy_cfg=proxy_cfg)
            mam_status['configured_ip'] = ip_to_use
            mam_status['configured_asn'] = asn
            mam_status['configured_asn'] = asn
            mam_status['mam_seen_asn'] = mam_seen_asn
            mam_status['mam_seen_as'] = mam_seen_as
            """
            Returns a mapping of session labels to MaM usernames and enabled automations for guardrail logic.
            Example:
                {
                    "Gluetun": {"username": "sirjmann92", "autoUpload": true, "autoWedge": false, "autoVIP": false},
                    ...
                }
            """
            session_status_cache[label] = {"status": mam_status, "last_check_time": now.isoformat()}
            status = mam_status
            last_check_time = now.isoformat()
            # --- Auto-update logic ---
            auto_update_triggered, auto_update_result = auto_update_seedbox_if_needed(cfg, label, ip_to_use, asn, now)
            if auto_update_triggered and auto_update_result:
                status['auto_update_seedbox'] = auto_update_result
            # Reload config from disk to ensure latest values (e.g., last_seedbox_ip) are used
            cfg = load_session(label)
            # Save last status to session file
            cfg['last_status'] = status
            cfg['last_check_time'] = last_check_time
            save_session(cfg, old_label=label)
        else:
            # Only load from session file if cache is empty
            if label not in session_status_cache or not session_status_cache[label].get("status"):
                last_status = cfg.get('last_status')
                last_check_time = cfg.get('last_check_time')
                if last_status:
                    status = last_status
                    session_status_cache[label] = {"status": status, "last_check_time": last_check_time}
                else:
                    status = {}
            else:
                # Use cached status/times
                status = session_status_cache[label]["status"]
                last_check_time = session_status_cache[label]["last_check_time"]

    # Only log an event if a real check was performed (force=1 or no cached status)
    if force or not (label in session_status_cache and session_status_cache[label].get("status")):
        safe_status = status if isinstance(status, dict) else {}
        prev_ip = cfg.get('last_seedbox_ip')
        prev_asn = cfg.get('last_seedbox_asn')
        proxied_ip = cfg.get('proxied_public_ip')
        mam_ip_override = cfg.get('mam_ip', "").strip()
        detected_ip = detected_public_ip
        curr_ip = mam_ip_override or proxied_ip or detected_ip
        asn_full, _ = get_asn_and_timezone_from_ip(curr_ip) if curr_ip else (None, None)
        match = re.search(r'(AS)?(\d+)', asn_full or "") if asn_full else None
        curr_asn = match.group(2) if match else asn_full
        event_status_message = None
        error_val = auto_update_result.get('error') if (auto_update_result and isinstance(auto_update_result, dict)) else None
        # If rate limit, show attempted new IP/ASN in event log
        if error_val and isinstance(error_val, str) and 'rate limit' in error_val.lower():
            event_status_message = error_val
            attempted_ip = None
            attempted_asn = None
            if auto_update_result and isinstance(auto_update_result, dict):
                reason = auto_update_result.get('reason', '')
                ip_match = re.search(r'IP changed: ([^ ]+) -> ([^ ]+)', reason)
                asn_match = re.search(r'ASN changed: ([^ ]+) -> ([^ ]+)', reason)
                if ip_match:
                    attempted_ip = ip_match.group(2)
                if asn_match:
                    attempted_asn = asn_match.group(2)
            if not attempted_ip:
                attempted_ip = proxied_ip or detected_ip
            if not attempted_asn:
                attempted_asn = curr_asn
            event_ip_compare = f"{prev_ip} -> {attempted_ip}"
            event_asn_compare = f"{prev_asn} -> {attempted_asn}"
        else:
            event_status_message = build_status_message(safe_status)
            event_ip_compare = f"{prev_ip} -> {curr_ip}"
            event_asn_compare = f"{prev_asn} -> {curr_asn}"
        # Determine event type
        if force:
            event_type = "manual"
        elif auto_update_result is not None:
            event_type = "automation"
        else:
            event_type = "scheduled"
        # All variables are defined in this scope, so log event here
        auto_update_val = get_auto_update_val(safe_status)
        event = {
            "timestamp": now.isoformat(),
            "label": label,
            "event_type": event_type,
            "details": {
                "ip_compare": event_ip_compare,
                "asn_compare": event_asn_compare,
                "auto_update": auto_update_val,  # Always a string
            },
            "status_message": status.get('status_message') or event_status_message or build_status_message(status)
        }
        from backend.event_log import append_ui_event_log
        append_ui_event_log(event)
    # Always include the current session's saved proxy config in status
    status['proxy'] = cfg.get('proxy', {})
    status['detected_public_ip'] = detected_public_ip
    status['detected_public_ip_asn'] = detected_public_ip_asn
    status['detected_public_ip_as'] = detected_public_ip_as
    status['proxied_public_ip'] = proxied_public_ip
    status['proxied_public_ip_asn'] = proxied_public_ip_asn
    status['proxied_public_ip_as'] = None
    if proxied_public_ip:
        # Get full AS string for proxied IP
        asn_full_proxied, _ = get_asn_and_timezone_from_ip(proxied_public_ip)
        status['proxied_public_ip_as'] = asn_full_proxied
    # Always set the top-level status message for the UI, prioritizing error/rate limit, then success, then fallback
    if auto_update_result is not None:
        status['auto_update_seedbox'] = auto_update_result
        # Priority: error (rate limit or other)
        error_val = auto_update_result.get('error') if isinstance(auto_update_result, dict) else None
        if error_val and isinstance(error_val, str):
            status['status_message'] = error_val
        # Next: explicit success message
        elif auto_update_result.get('success') is True and auto_update_result.get('msg'):
            status['status_message'] = auto_update_result['msg']
        # Fallback: use build_status_message
        else:
            status['status_message'] = build_status_message(status)
    elif status.get('error'):
        status['status_message'] = f"Error: {status['error']}"
    elif status.get('message'):
        status['status_message'] = status['message']
    else:
        status['status_message'] = build_status_message(status)
    # Calculate next_check_time (UTC ISO format)
    check_freq_minutes = cfg.get("check_freq", 5)
    # Parse last_check_time as datetime
    try:
        last_check_dt = datetime.fromisoformat(last_check_time) if last_check_time else None
    except Exception:
        last_check_dt = None
    if not last_check_dt:
        # Fallback: use now as last_check_time if missing/invalid
        last_check_dt = now
        last_check_time = now.isoformat()
    next_check_dt = last_check_dt + timedelta(minutes=check_freq_minutes)
    next_check_time = next_check_dt.isoformat()
    response = {
        "mam_cookie_exists": status.get("mam_cookie_exists"),
        "points": status.get("points"),
        "cheese": status.get("cheese"),
        "wedge_active": status.get("wedge_active"),
        "vip_active": status.get("vip_active"),
        "current_ip": ip_to_use,
    "current_ip_asn": asn,
    "mam_session_as": mam_session_as,
        "configured_ip": ip_to_use,
        "configured_asn": asn,
    "configured_asn": asn,
        "mam_seen_asn": mam_seen_asn,
        "mam_seen_as": mam_seen_as,
        "detected_public_ip": detected_public_ip,
    "detected_public_ip_asn": detected_public_ip_asn,
    "detected_public_ip_as": detected_public_ip_as,
        "proxied_public_ip": proxied_public_ip,
    "proxied_public_ip_asn": proxied_public_ip_asn,
    "proxied_public_ip_as": status.get("proxied_public_ip_as"),
        "ip_source": "configured",
        "message": status.get("message", "Please provide your MaM ID in the configuration."),
        "last_check_time": last_check_time,
        "next_check_time": next_check_time,
        "timezone": timezone_used,
        "check_freq": check_freq_minutes,
        "status_message": status.get("status_message"),
        "details": status
    }
    return response


@app.post("/api/session/refresh")
def api_session_refresh(request: Request):
    cfg = load_config()
    mam_id = cfg.get('mam', {}).get('mam_id', "")
    if not mam_id:
        raise HTTPException(status_code=400, detail="MaM ID not configured.")
    try:
        return {"success": True, "message": "Session refreshed."}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/api/sessions")
def api_list_sessions():
    sessions = list_sessions()
    logging.debug(f"[Session] Listed sessions: count={len(sessions)}")
    return {"sessions": sessions}

@app.get("/api/session/{label}")
def api_load_session(label: str):
    return load_session(label)

@app.post("/api/session/save")
async def api_save_session(request: Request):
    try:
        cfg = await request.json()
        old_label = cfg.get("old_label")
        proxy_cfg = cfg.get("proxy", {})
        if "proxy" in cfg:
            from backend.config import load_session
            prev_cfg = None
            if old_label:
                try:
                    prev_cfg = load_session(old_label)
                except Exception:
                    prev_cfg = None
            elif cfg.get("label"):
                try:
                    prev_cfg = load_session(cfg["label"])
                except Exception:
                    prev_cfg = None
            # If password is missing but previous session had one, keep it
            if (not proxy_cfg.get("password")) and prev_cfg and prev_cfg.get("proxy", {}).get("password"):
                proxy_cfg["password"] = prev_cfg["proxy"]["password"]
            cfg["proxy"] = proxy_cfg
        import os
        from backend.config import get_session_path
        from backend.event_log import append_ui_event_log
        label = cfg.get('label')
        session_path = get_session_path(label)
        is_new = not os.path.exists(session_path)
        save_session(cfg, old_label=old_label)
        logging.info(f"[Session] Saved session: label={label} old_label={old_label}")
        if is_new:
            append_ui_event_log({
                "event": "session_created",
                "label": label,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "user_action": True
            })
        append_ui_event_log({
            "event": "session_saved",
            "label": label,
            "old_label": old_label,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "user_action": True
        })
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save session: {e}")

@app.delete("/api/session/delete/{label}")
def api_delete_session(label: str):
    try:
        delete_session(label)
        logging.info(f"[Session] Deleted session: label={label}")
        from backend.event_log import append_ui_event_log
        append_ui_event_log({
            "event": "session_deleted",
            "label": label,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "user_action": True
        })
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete session: {e}")

@app.post("/api/session/perkautomation/save")
async def api_save_perkautomation(request: Request):
    try:
        data = await request.json()
        label = data.get("label")
        if not label:
            raise HTTPException(status_code=400, detail="Session label required.")
        cfg = load_session(label)
        # Save automation settings to session config
        cfg["perk_automation"] = data.get("perk_automation", {})
        save_session(cfg, old_label=label)
        return {"success": True}
    except Exception as e:
        logging.warning(f"[PerkAutomation] Failed to save automation settings: {e}")
        return {"success": False, "error": str(e)}

@app.post("/api/session/update_seedbox")
async def api_update_seedbox(request: Request):
    try:
        data = await request.json()
        label = data.get("label")
        if not label:
            raise HTTPException(status_code=400, detail="Session label required.")
        cfg = load_session(label)
        mam_id = cfg.get('mam', {}).get('mam_id', "")
        if not mam_id:
            raise HTTPException(status_code=400, detail="MaM ID not configured in session.")
        mam_ip_override = cfg.get('mam_ip', "").strip()
        if not mam_ip_override:
            raise HTTPException(status_code=400, detail="Session mam_ip (entered IP) is required.")
        ip_to_use = mam_ip_override
        asn_full, _ = get_asn_and_timezone_from_ip(ip_to_use)
        match = re.search(r'(AS)?(\d+)', asn_full or "") if asn_full else None
        asn = match.group(2) if match else asn_full
        last_seedbox_ip = cfg.get("last_seedbox_ip")
        last_seedbox_asn = cfg.get("last_seedbox_asn")
        last_seedbox_update = cfg.get("last_seedbox_update")
        now = datetime.now(timezone.utc)
        update_needed = (ip_to_use != last_seedbox_ip) or (asn != last_seedbox_asn)
        if last_seedbox_update:
            last_update_dt = datetime.fromisoformat(last_seedbox_update)
            if (now - last_update_dt) < timedelta(hours=1):
                minutes_left = 60 - int((now - last_update_dt).total_seconds() // 60)
                return {"success": False, "error": f"Rate limit: wait {minutes_left} more minutes before updating seedbox IP/ASN."}
        if not update_needed:
            return {"success": True, "msg": "No change: IP/ASN already set."}
        # Proxy config
        proxy_cfg = cfg.get("proxy", {})
        # No more password decryption logic needed
        cookies = {"mam_id": mam_id}
        proxies = None
        from backend.mam_api import build_proxy_dict
        proxies = build_proxy_dict(proxy_cfg)
        resp = requests.get("https://t.myanonamouse.net/json/dynamicSeedbox.php", cookies=cookies, timeout=10, proxies=proxies)
        logging.info(f"[SeedboxUpdate] MaM API response: status={resp.status_code}, text={resp.text}")
        try:
            result = resp.json()
        except Exception:
            result = {"Success": False, "msg": f"Non-JSON response: {resp.text}"}
        if resp.status_code == 200 and result.get("Success"):
            cfg["last_seedbox_ip"] = ip_to_use
            cfg["last_seedbox_asn"] = asn
            cfg["last_seedbox_update"] = now.isoformat()
            save_session(cfg, old_label=label)
            # Use a user-friendly message if the API message is missing or generic
            api_msg = result.get("msg", "").strip()
            if not api_msg or api_msg.lower() == "completed":
                api_msg = "IP Changed. Seedbox IP updated."
            return {"success": True, "msg": api_msg, "ip": ip_to_use, "asn": asn}
        elif resp.status_code == 200 and result.get("msg") == "No change":
            cfg["last_seedbox_ip"] = ip_to_use
            cfg["last_seedbox_asn"] = asn
            cfg["last_seedbox_update"] = now.isoformat()
            save_session(cfg, old_label=label)
            return {"success": True, "msg": "No change: IP/ASN already set.", "ip": ip_to_use, "asn": asn}
        elif resp.status_code == 429 or (
            isinstance(result.get("msg"), str) and "too recent" in result.get("msg", "")
        ):
            return {"success": False, "error": "Rate limit: last change too recent. Try again later.", "msg": result.get("msg")}
        else:
            return {"success": False, "error": result.get("msg", "Unknown error"), "raw": result}
    except Exception as e:
        logging.error(f"[SeedboxUpdate] Failed: {e}")
        return {"success": False, "error": str(e)}

# --- FAVICON ROUTES: must be registered before static/catch-all routes ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_BUILD_DIR = os.path.abspath(os.path.join(BASE_DIR, '../frontend/build'))
FRONTEND_PUBLIC_DIR = "/app/frontend/public"  # Force correct path for Docker
# If running in Docker, BASE_DIR is /app/backend, so ../frontend/public is /app/frontend/public
STATIC_DIR = os.path.join(FRONTEND_BUILD_DIR, 'static')

@app.get("/favicon.ico", include_in_schema=False)
def favicon_ico():
    path = os.path.join(FRONTEND_PUBLIC_DIR, "favicon.ico")
    if os.path.exists(path):
        return FileResponse(path, media_type="image/x-icon")
    raise HTTPException(status_code=404, detail="favicon.ico not found")

@app.get("/favicon.svg", include_in_schema=False)
def favicon_svg():
    path = os.path.join(FRONTEND_PUBLIC_DIR, "favicon.svg")
    if os.path.exists(path):
        return FileResponse(path, media_type="image/svg+xml")
    raise HTTPException(status_code=404, detail="favicon.svg not found")

logging.debug(f"Serving static from: {STATIC_DIR}")
if not os.path.isdir(STATIC_DIR):
    raise RuntimeError(f"Directory '{STATIC_DIR}' does not exist")
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.get("/", include_in_schema=False)
def serve_react_index():
    index_path = os.path.join(FRONTEND_BUILD_DIR, 'index.html')
    return FileResponse(index_path)

@app.get("/{full_path:path}", include_in_schema=False)
def serve_react_app(full_path: str):
    index_path = os.path.join(FRONTEND_BUILD_DIR, 'index.html')
    if os.path.exists(index_path):
        return FileResponse(index_path)
    raise HTTPException(status_code=404, detail="Not Found")

def session_check_job(label):
    try:
        trigger_source = "scheduled"
        import inspect
        frame = inspect.currentframe()
        if frame is not None:
            args, _, _, values = inspect.getargvalues(frame)
            if 'trigger_source' in values:
                trigger_source = values['trigger_source']
        logging.debug(f"[SessionCheck][TRIGGER] label={label} source={trigger_source}")
        cfg = load_session(label)
        mam_id = cfg.get('mam', {}).get('mam_id', "")
        check_freq = cfg.get("check_freq", 5)
        mam_ip_override = cfg.get('mam_ip', "").strip()
        proxy_cfg = cfg.get("proxy", {})
        detected_public_ip = get_public_ip()
        # If proxy is configured, actively detect proxied public IP and update config
        if proxy_cfg and proxy_cfg.get('host'):
            from backend.mam_api import get_proxied_public_ip
            proxied_ip = get_proxied_public_ip(proxy_cfg)
            if proxied_ip:
                cfg['proxied_public_ip'] = proxied_ip
                save_session(cfg, old_label=label)
        # Use mam_ip_override if set, else proxied_public_ip if set, else detected_public_ip
        ip_to_use = mam_ip_override or cfg.get('proxied_public_ip') or detected_public_ip
        # Get ASN for IP sent to MaM (current_ip)
        if ip_to_use:
            asn_full, _ = get_asn_and_timezone_from_ip(ip_to_use, proxy_cfg if (proxy_cfg and proxy_cfg.get('host') and ip_to_use == cfg.get('proxied_public_ip')) else None)
            match = re.search(r'(AS)?(\d+)', asn_full or "")
            asn = match.group(2) if match else asn_full
        else:
            asn = None
        now = datetime.now(timezone.utc)
        if mam_id:
            proxy_cfg = cfg.get("proxy", {})
            # Capture old IP/ASN before update
            prev_ip = cfg.get('last_seedbox_ip')
            prev_asn = cfg.get('last_seedbox_asn')
            # Determine new IP/ASN (what we want to set)
            detected_ip = get_public_ip()
            proxied_ip = cfg.get('proxied_public_ip')
            mam_ip_override = cfg.get('mam_ip', "").strip()
            new_ip = proxied_ip or detected_ip
            asn_full, _ = get_asn_and_timezone_from_ip(new_ip) if new_ip else (None, None)
            match = re.search(r'(AS)?(\d+)', asn_full or "") if asn_full else None
            new_asn = match.group(2) if match else asn_full
            status = get_status(mam_id=mam_id, proxy_cfg=proxy_cfg)
            session_status_cache[label] = {"status": status, "last_check_time": now.isoformat()}
            cfg["last_check_time"] = now.isoformat()
            # --- Auto-update logic ---
            auto_update_triggered, auto_update_result = auto_update_seedbox_if_needed(cfg, label, ip_to_use, asn, now)
            if auto_update_result is not None:
                status['auto_update_seedbox'] = auto_update_result
                # Log the result of the update attempt for visibility
                if auto_update_result.get('success'):
                    logging.info(f"[AutoUpdate] label={label} update result: {auto_update_result.get('msg', 'Success')} reason={auto_update_result.get('reason')}")
                else:
                    logging.info(f"[AutoUpdate] label={label} update result: {auto_update_result.get('error', 'Error')} reason={auto_update_result.get('reason')}")
            else:
                status['auto_update_seedbox'] = 'N/A'
            # --- Always update last_status with the latest automation result ---
            status['status_message'] = build_status_message(status)
            cfg['last_status'] = status
            save_session(cfg, old_label=label)
            # Log event using pre-update (old) and detected/proxied (new) values
            from backend.event_log import append_ui_event_log
            # Ensure auto_update is always a string, never None/null in JSON
            auto_update_val = get_auto_update_val(status)
            # ...removed debug logging...
            if prev_ip is None or prev_asn is None or new_ip is None or new_asn is None:
                warn_msg = "Unable to determine current or new IP/ASN—check connectivity or configuration. No update performed."
                event = {
                    "timestamp": now.isoformat(),
                    "label": label,
                    "event_type": "scheduled",
                    "details": {
                        "ip_compare": f"{prev_ip} -> {new_ip}",
                        "asn_compare": f"{prev_asn} -> {new_asn}",
                        "auto_update": auto_update_val,  # Always a string
                    },
                    "status_message": warn_msg
                }
                append_ui_event_log(event)
                logging.warning(f"[SessionCheck][WARNING] label={label} {warn_msg}")
            else:
                event = {
                    "timestamp": now.isoformat(),
                    "label": label,
                    "event_type": "scheduled",
                    "details": {
                        "ip_compare": f"{prev_ip} -> {new_ip}",
                        "asn_compare": f"{prev_asn} -> {new_asn}",
                        "auto_update": auto_update_val,  # Always a string
                    },
                    "status_message": status.get('status_message', status.get('message', 'OK'))
                }
                append_ui_event_log(event)
                # ...removed debug logging...
    except Exception as e:
        logging.error(f"[APScheduler] Error in job for '{label}': {e}")

# --- APScheduler setup ---
scheduler = BackgroundScheduler()

# On startup, reset last_check_time to now for all sessions to keep timers in sync
def reset_all_last_check_times():
    now = datetime.now(timezone.utc).isoformat()
    session_labels = list_sessions()
    for label in session_labels:
        try:
            cfg = load_session(label)
            cfg['last_check_time'] = now
            save_session(cfg, old_label=label)
        except Exception as e:
            logging.warning(f"[Startup] Failed to reset last_check_time for session '{label}': {e}")

reset_all_last_check_times()

# Register jobs for all sessions on startup
def register_all_session_jobs():
    session_labels = list_sessions()
    for label in session_labels:
        cfg = load_session(label)
        check_freq = cfg.get("check_freq")
        mam_id = cfg.get('mam', {}).get('mam_id', "")
        # Only register if frequency is set and valid, and MaM ID is present
        if not check_freq or not isinstance(check_freq, int) or check_freq < 1 or not mam_id:
            logging.info(f"[APScheduler] Skipping job registration for session '{label}' (missing or invalid frequency or MaM ID)")
            continue
        job_id = f"session_check_{label}"
        # Remove any existing job for this label
        if scheduler.get_job(job_id):
            scheduler.remove_job(job_id)
        scheduler.add_job(
            session_check_job,
            trigger=IntervalTrigger(minutes=check_freq),
            args=[label],
            id=job_id,
            replace_existing=True,
            coalesce=True,
            max_instances=1
        )
        logging.info(f"[APScheduler] Registered job for session '{label}' every {check_freq} min")

# --- Immediate session check for all sessions at startup ---
def run_initial_session_checks():
    session_labels = list_sessions()
    for label in session_labels:
        try:
            logging.info(f"[Startup] Running initial session check for '{label}'")
            session_check_job(label)
        except Exception as e:
            logging.warning(f"[Startup] Initial session check failed for '{label}': {e}")

run_initial_session_checks()

register_all_session_jobs()
scheduler.start()

# --- Upload Credit Automation Job ---
def upload_credit_automation_job():
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
            min_points = automation.get('min_points', 0)
            points_to_keep = automation.get('points_to_keep', 0)
            gb = automation.get('gb', 1)
            trigger_type = automation.get('trigger_type', 'points')
            proxy_cfg = cfg.get('proxy', {})
            # Get current status/points
            status = get_status(mam_id=mam_id, proxy_cfg=proxy_cfg)
            points = status.get('points', 0) if isinstance(status, dict) else 0
            # Guardrails
            if points is None or points < min_points:
                logging.info(f"[UploadAuto] label={label} trigger=automation result=skipped reason=not_enough_points points={points} min_points={min_points}")
                continue
            # Each GB costs 500 points
            total_cost = gb * 500
            if points - total_cost < points_to_keep:
                logging.info(f"[UploadAuto] label={label} trigger=automation result=skipped reason=points_to_keep_guardrail points={points} cost={total_cost} points_to_keep={points_to_keep}")
                continue
            # Trigger automation
            result = buy_upload_credit(gb, mam_id=mam_id, proxy_cfg=proxy_cfg)
            success = result.get('success', False) if result else False
            event = {
                "timestamp": now.isoformat(),
                "label": label,
                "trigger": "automation",
                "purchase_type": "upload_credit",
                "amount": gb,
                "details": {
                    "points_before": points,
                },
                "result": "success" if success else "failed",
                "error": None,
            }
            if success:
                logging.info(f"[UploadAuto] label={label} trigger=automation result=success gb={gb} points_before={points}")
            else:
                err_msg = result.get('error') or result.get('response') or 'Unknown error'
                event["error"] = err_msg
                logging.warning(f"[UploadAuto] label={label} trigger=automation result=failed gb={gb} points_before={points} error={err_msg}")
            # append_ui_event_log(event) moved to automation.py or relevant module
        except Exception as e:
            logging.error(f"[UploadAuto] label={label} trigger=automation result=exception error={e}")

# Register the automation jobs to run every 10 minutes
if not scheduler.get_job('upload_credit_automation'):
    scheduler.add_job(
        upload_credit_automation_job,
        trigger=IntervalTrigger(minutes=10),
        id='upload_credit_automation',
        replace_existing=True,
        coalesce=True,
        max_instances=1
    )
    logging.info("[APScheduler] Registered upload credit automation job (every 10 min)")
if not scheduler.get_job('wedge_automation'):
    scheduler.add_job(
        wedge_automation_job,
        trigger=IntervalTrigger(minutes=10),
        id='wedge_automation',
        replace_existing=True,
        coalesce=True,
        max_instances=1
    )
    logging.info("[APScheduler] Registered wedge automation job (every 10 min)")
if not scheduler.get_job('vip_automation'):
    scheduler.add_job(
        vip_automation_job,
        trigger=IntervalTrigger(minutes=10),
        id='vip_automation',
        replace_existing=True,
        coalesce=True,
        max_instances=1
    )
    logging.info("[APScheduler] Registered VIP automation job (every 10 min)")
