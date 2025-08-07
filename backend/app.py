from fastapi import FastAPI, Request, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse
import os
import requests
from datetime import datetime, timezone, timedelta
import re
import logging
from typing import Dict, Any
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger

from backend.config import load_config, save_config, list_sessions, load_session, save_session, delete_session
from backend.mam_api import get_status, dummy_purchase, get_mam_seen_ip_info
from backend.perk_automation import buy_wedge, buy_vip, buy_upload_credit
from backend.millionaires_vault import router as millionaires_vault_router
from backend.last_session_api import router as last_session_router

app = FastAPI(title="MouseTrap API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev; restrict in prod!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(millionaires_vault_router)
app.include_router(last_session_router)

session_status_cache: Dict[str, Dict[str, Any]] = {}

# Configure logging at the top of the file (after imports)
loglevel = os.environ.get("LOGLEVEL", "WARNING").upper()
logging.basicConfig(
    level=getattr(logging, loglevel, logging.WARNING),
    format='[%(asctime)s %(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S %Z',
)

def get_asn_and_timezone_from_ip(ip):
    try:
        token = os.environ.get("IPINFO_TOKEN")
        url = f"https://ipinfo.io/{ip}/json"
        if token:
            url += f"?token={token}"
        logging.debug(f"ASN lookup for IP: {ip} (url: {url})")
        resp = requests.get(url, timeout=4)
        logging.debug(f"ipinfo.io response: {resp.status_code} {resp.text}")
        if resp.status_code == 200:
            data = resp.json()
            asn = data.get("org", "Unknown ASN")
            tz = data.get("timezone", None)
            return asn, tz
        return "Unknown ASN", None
    except Exception as e:
        logging.warning(f"ASN lookup failed for IP {ip}: {e}")
        return "Unknown ASN", None

def get_public_ip():
    try:
        resp = requests.get("https://api.ipify.org", timeout=4)
        if resp.status_code == 200:
            return resp.text.strip()
        return None
    except Exception:
        return None

def auto_update_seedbox_if_needed(cfg, label, ip_to_use, asn, now):
    session_type = cfg.get('session_type', '').lower()  # 'ip locked' or 'asn locked'
    last_seedbox_ip = cfg.get('last_seedbox_ip')
    last_seedbox_asn = cfg.get('last_seedbox_asn')
    last_seedbox_update = cfg.get('last_seedbox_update')
    mam_id = cfg.get('mam', {}).get('mam_id', "")
    update_needed = False
    reason = None
    if session_type == 'ip locked' and ip_to_use and ip_to_use != last_seedbox_ip:
        update_needed = True
        reason = f"IP changed: {last_seedbox_ip} -> {ip_to_use}"
    elif session_type == 'asn locked' and asn and asn != last_seedbox_asn:
        update_needed = True
        reason = f"ASN changed: {last_seedbox_asn} -> {asn}"
    if update_needed and last_seedbox_update:
        last_update_dt = datetime.fromisoformat(last_seedbox_update)
        if (now - last_update_dt) < timedelta(hours=1):
            return False, {"success": False, "error": "Rate limit: auto-update skipped (wait 1 hour)", "reason": reason}
    if update_needed and mam_id:
        try:
            cookies = {"mam_id": mam_id}
            resp = requests.get("https://t.myanonamouse.net/json/dynamicSeedbox.php", cookies=cookies, timeout=10)
            logging.info(f"[AutoSeedboxUpdate] MaM API response: status={resp.status_code}, text={resp.text}")
            try:
                result = resp.json()
            except Exception:
                result = {"Success": False, "msg": f"Non-JSON response: {resp.text}"}
            if resp.status_code == 200 and result.get("Success"):
                cfg["last_seedbox_ip"] = ip_to_use
                cfg["last_seedbox_asn"] = asn
                cfg["last_seedbox_update"] = now.isoformat()
                save_session(cfg, old_label=label)
                logging.info(f"[AutoSeedboxUpdate] Auto-update successful for {label}: {reason}")
                return True, {"success": True, "msg": result.get("msg", "Completed"), "reason": reason}
            elif resp.status_code == 200 and result.get("msg") == "No change":
                cfg["last_seedbox_ip"] = ip_to_use
                cfg["last_seedbox_asn"] = asn
                cfg["last_seedbox_update"] = now.isoformat()
                save_session(cfg, old_label=label)
                logging.info(f"[AutoSeedboxUpdate] No change needed for {label}: {reason}")
                return True, {"success": True, "msg": "No change: IP/ASN already set.", "reason": reason}
            elif resp.status_code == 429 or (
                isinstance(result.get("msg"), str) and "too recent" in result.get("msg", "")
            ):
                logging.warning(f"[AutoSeedboxUpdate] Rate limit for {label}: {reason}")
                return True, {"success": False, "error": "Rate limit: last change too recent. Try again later.", "reason": reason}
            else:
                logging.error(f"[AutoSeedboxUpdate] Error for {label}: {result.get('msg', 'Unknown error')}")
                return True, {"success": False, "error": result.get("msg", "Unknown error"), "reason": reason}
        except Exception as e:
            logging.error(f"[AutoSeedboxUpdate] Exception for {label}: {e}")
            return True, {"success": False, "error": str(e), "reason": reason}
    return False, None

@app.get("/api/status")
def api_status(label: str = Query(None), force: int = Query(0)):
    global session_status_cache
    if not label:
        raise HTTPException(status_code=400, detail="Session label required.")
    cfg = load_session(label)
    mam_id = cfg.get('mam', {}).get('mam_id', "")
    mam_ip_override = cfg.get('mam_ip', "").strip()
    detected_public_ip = get_public_ip()
    ip_to_use = mam_ip_override if mam_ip_override else detected_public_ip
    # Get ASN for configured IP
    asn_full, _ = get_asn_and_timezone_from_ip(ip_to_use) if ip_to_use else (None, None)
    match = re.search(r'(AS)?(\d+)', asn_full or "") if asn_full else None
    asn = match.group(2) if match else asn_full
    # Proxy config
    proxy_cfg = cfg.get("proxy", {})
    # Also get MAM's perspective for display only
    mam_seen = get_mam_seen_ip_info(mam_id, proxy_cfg=proxy_cfg)
    mam_seen_ip = mam_seen.get("ip")
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
    if detected_public_ip:
        asn_full_pub, _ = get_asn_and_timezone_from_ip(detected_public_ip)
        match_pub = re.search(r'(AS)?(\d+)', asn_full_pub or "") if asn_full_pub else None
        detected_public_ip_asn = match_pub.group(2) if match_pub else asn_full_pub
    if force or not status:
        if force:
            mam_status = get_status(mam_id=mam_id, proxy_cfg=proxy_cfg)
            mam_status['configured_ip'] = ip_to_use
            mam_status['configured_asn'] = asn
            mam_status['mam_seen_ip'] = mam_seen_ip
            mam_status['mam_seen_asn'] = mam_seen_asn
            mam_status['mam_seen_as'] = mam_seen_as
            session_status_cache[label] = {"status": mam_status, "last_check_time": now.isoformat()}
            status = mam_status
            last_check_time = now.isoformat()
            # --- Auto-update logic ---
            auto_update_triggered, auto_update_result = auto_update_seedbox_if_needed(cfg, label, ip_to_use, asn, now)
            if auto_update_triggered and auto_update_result:
                status['auto_update_seedbox'] = auto_update_result
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
    # Always include the current session's saved proxy config in status
    status['proxy'] = cfg.get('proxy', {})
    # --- Improved status message logic ---
    status_message_parts = []
    auto_update = status.get('auto_update_seedbox')
    # Determine if IP or ASN changed for this check
    last_seedbox_ip = cfg.get('last_seedbox_ip')
    last_seedbox_asn = cfg.get('last_seedbox_asn')
    ip_changed = last_seedbox_ip and ip_to_use and ip_to_use != last_seedbox_ip
    asn_changed = last_seedbox_asn and asn and asn != last_seedbox_asn
    # If there is an error or forbidden message, show only the error
    error_message = None
    if status.get('message') and ("forbidden" in status.get('message', '').lower() or "error" in status.get('message', '').lower() or "failed" in status.get('message', '').lower() or status.get('code') == 403):
        error_message = status.get('message')
    elif auto_update and not auto_update.get('success'):
        error_message = auto_update.get('error') or auto_update.get('msg')
    if error_message:
        status_message_parts.append(error_message)
    else:
        if auto_update:
            if auto_update.get('success'):
                if auto_update.get('msg', '').startswith('No change'):
                    status_message_parts.append('IP/ASN Unchanged. Status fetched successfully.')
                else:
                    if ip_changed:
                        status_message_parts.append('IP address changed. Updated MAM session.')
                    elif asn_changed:
                        status_message_parts.append('ASN changed. Updated MAM session.')
                    else:
                        status_message_parts.append('IP/ASN changed. Updated MAM session.')
            else:
                if 'rate limit' in (auto_update.get('error', '') or '').lower():
                    status_message_parts.append('IP/ASN changed, but update was rate-limited.')
                else:
                    status_message_parts.append(f"Seedbox update failed: {auto_update.get('error', 'Unknown error')}")
        else:
            status_message_parts.append('IP/ASN Unchanged. Status fetched successfully.')
        # Always append status fetch result if error
        msg_val = status.get('message') or ''
        if msg_val and isinstance(msg_val, str) and 'failed' in msg_val.lower():
            status_message_parts.append(msg_val)
    status['status_message'] = ' '.join(status_message_parts)
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
        "configured_ip": ip_to_use,
        "configured_asn": asn,
        "mam_seen_ip": mam_seen_ip,
        "mam_seen_asn": mam_seen_asn,
        "mam_seen_as": mam_seen_as,
        "detected_public_ip": detected_public_ip,
        "detected_public_ip_asn": detected_public_ip_asn,
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

@app.get("/api/config")
def api_config():
    cfg = load_config()
    # Ensure new field is always present
    if "mam_ip" not in cfg:
        cfg["mam_ip"] = ""
    return cfg

@app.post("/api/config")
async def api_config_save(request: Request):
    try:
        cfg = await request.json()
        if "mam_ip" not in cfg:
            cfg["mam_ip"] = ""
        save_config(cfg)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save config: {e}")

@app.post("/api/automation/wedge")
async def api_automation_wedge(request: Request):
    """
    Purchase wedge using real MaM API call. Accepts label and method (default 'points'). Returns updated status on success.
    """
    try:
        data = await request.json()
        label = data.get('label')
        method = data.get('method', 'points')
        if not label:
            raise HTTPException(status_code=400, detail="Session label required.")
        cfg = load_session(label)
        mam_id = cfg.get('mam', {}).get('mam_id', "")
        if not mam_id:
            raise HTTPException(status_code=400, detail="MaM ID not configured in session.")
        proxy_cfg = cfg.get("proxy", {})
        result = buy_wedge(mam_id, method=method)  # Add proxy_cfg if supported
        success = result.get("success", False) if result else False
        if not success:
            err_msg = result.get("error") or result.get("response") or "Unknown error during wedge purchase."
            logging.error(f"[Wedge] Purchase failed: {err_msg}")
            return {"success": False, "error": err_msg, "result": result}
        logging.info(f"[Wedge] Purchase successful for {label}")
        mam_status = get_status(mam_id=mam_id, proxy_cfg=proxy_cfg)
        now = datetime.now(timezone.utc)
        mam_status['configured_ip'] = cfg.get('mam_ip', "") or get_public_ip()
        mam_status['configured_asn'] = None
        session_status_cache[label] = {"status": mam_status, "last_check_time": now.isoformat()}
        cfg['last_status'] = mam_status
        cfg['last_check_time'] = now.isoformat()
        save_session(cfg, old_label=label)
        return {"success": True, "result": result, "status": mam_status}
    except Exception as e:
        logging.error(f"[Wedge] Exception: {e}")
        return {"success": False, "error": str(e)}

@app.post("/api/automation/vip")
async def api_automation_vip(request: Request):
    """
    Purchase VIP using real MaM API call. Accepts label. Returns updated status on success.
    """
    try:
        data = await request.json()
        label = data.get('label')
        if not label:
            raise HTTPException(status_code=400, detail="Session label required.")
        cfg = load_session(label)
        mam_id = cfg.get('mam', {}).get('mam_id', "")
        if not mam_id:
            raise HTTPException(status_code=400, detail="MaM ID not configured in session.")
        proxy_cfg = cfg.get("proxy", {})
        result = buy_vip(mam_id)  # Add proxy_cfg if supported
        success = result.get("success", False) if result else False
        if not success:
            if result:
                err_msg = result.get("error") or result.get("response") or "Unknown error during VIP purchase."
            else:
                err_msg = "Unknown error during VIP purchase. (No result returned)"
            logging.error(f"[VIP] Purchase failed: {err_msg}")
            return {"success": False, "error": err_msg, "result": result}
        logging.info(f"[VIP] Purchase successful for {label}")
        mam_status = get_status(mam_id=mam_id, proxy_cfg=proxy_cfg)
        now = datetime.now(timezone.utc)
        mam_status['configured_ip'] = cfg.get('mam_ip', "") or get_public_ip()
        mam_status['configured_asn'] = None
        session_status_cache[label] = {"status": mam_status, "last_check_time": now.isoformat()}
        cfg['last_status'] = mam_status
        cfg['last_check_time'] = now.isoformat()
        save_session(cfg, old_label=label)
        return {"success": True, "result": result, "status": mam_status}
    except Exception as e:
        logging.error(f"[VIP] Exception: {e}")
        return {"success": False, "error": str(e)}

@app.post("/api/automation/upload")
async def api_automation_upload(request: Request):
    """
    Purchase upload credit using real MaM API call. Accepts label and gb. Returns updated status on success.
    """
    try:
        data = await request.json()
        label = data.get('label')
        gb = data.get("gb", 1)
        if not label:
            raise HTTPException(status_code=400, detail="Session label required.")
        cfg = load_session(label)
        mam_id = cfg.get('mam', {}).get('mam_id', "")
        if not mam_id:
            raise HTTPException(status_code=400, detail="MaM ID not configured in session.")
        proxy_cfg = cfg.get("proxy", {})
        try:
            result = buy_upload_credit(gb, mam_id=mam_id, proxy_cfg=proxy_cfg)
        except Exception as e:
            logging.error(f"[Upload] buy_upload_credit failed: {e}")
            return {"success": False, "error": f"Failed to purchase upload credit: {e}"}
        success = result.get("success", False) if result else False
        if not success:
            err_msg = result.get("error") or result.get("response") or "Unknown error during upload purchase."
            logging.error(f"[Upload] Purchase failed: {err_msg}")
            return {"success": False, "error": err_msg, "result": result}
        logging.info(f"[Upload] Purchase successful for {label}")
        # Return updated status (simulate force=1)
        mam_status = get_status(mam_id=mam_id, proxy_cfg=proxy_cfg)
        now = datetime.now(timezone.utc)
        mam_status['configured_ip'] = cfg.get('mam_ip', "") or get_public_ip()
        mam_status['configured_asn'] = None
        session_status_cache[label] = {"status": mam_status, "last_check_time": now.isoformat()}
        cfg['last_status'] = mam_status
        cfg['last_check_time'] = now.isoformat()
        save_session(cfg, old_label=label)
        return {"success": True, "result": result, "status": mam_status}
    except Exception as e:
        logging.error(f"[Upload] Exception: {e}")
        return {"success": False, "error": str(e)}

@app.post("/api/automation/upload_auto")
async def api_automation_upload_auto(request: Request):
    """
    Auto-purchase upload credit if points >= minimum. Accepts label, amount (GB), and min_points.
    """
    try:
        data = await request.json()
        label = data.get('label')
        amount = int(data.get('amount', 1))
        min_points = int(data.get('min_points', 0))
        if not label:
            logging.error("[UploadAuto] No session label provided.")
            raise HTTPException(status_code=400, detail="Session label required.")
        cfg = load_session(label)
        mam_id = cfg.get('mam', {}).get('mam_id', "")
        if not mam_id:
            logging.error(f"[UploadAuto] No MaM ID configured for session {label}.")
            raise HTTPException(status_code=400, detail="MaM ID not configured in session.")
        # Get current points (reuse get_status, now with proxy_cfg)
        proxy_cfg = cfg.get("proxy", {})
        # Redact password for logging
        proxy_cfg_log = dict(proxy_cfg) if proxy_cfg else {}
        if "password" in proxy_cfg_log:
            proxy_cfg_log["password"] = "***REDACTED***"
        try:
            status = get_status(mam_id=mam_id, proxy_cfg=proxy_cfg)
        except Exception as e:
            logging.error(f"[UploadAuto] get_status failed: {e}")
            return {"success": False, "error": f"Failed to fetch status from MaM: {e}"}
        points = status.get('points', 0) if isinstance(status, dict) else 0
        if points is None:
            logging.error(f"[UploadAuto] Could not fetch current points for mam_id={mam_id}.")
            return {"success": False, "error": "Could not fetch current points. (Check session and MaM ID)"}
        if points < min_points:
            msg = f"Not enough points (have {points}, need {min_points})"
            logging.warning(f"[UploadAuto] {msg}")
            return {"success": False, "error": msg}
        # Each GB costs 500 points
        total_cost = amount * 500
        if points < total_cost:
            msg = f"Not enough points for {amount}GB (need {total_cost}, have {points})"
            logging.warning(f"[UploadAuto] {msg}")
            return {"success": False, "error": msg}
        # Purchase upload credit (pass mam_id and proxy_cfg)
        result = buy_upload_credit(amount, mam_id=mam_id, proxy_cfg=proxy_cfg)
        success = result.get("success", False) if result else False
        if not success:
            if result:
                err_msg = result.get("error") or result.get("response") or "Unknown error during upload purchase."
            else:
                err_msg = "Unknown error during upload purchase. (No result returned)"
            logging.error(f"[UploadAuto] Upload purchase failed: {err_msg}")
            return {"success": False, "error": err_msg, "result": result}
        logging.info(f"[UploadAuto] Upload purchase successful: {amount}GB for {label}")
        return {"success": True, "result": result, "points_before": points, "amount": amount}
    except Exception as e:
        logging.error(f"[UploadAuto] Exception: {e}")
        return {"success": False, "error": str(e)}

@app.post("/api/session/refresh")
def api_session_refresh(request: Request):
    cfg = load_config()
    mam_id = cfg.get('mam', {}).get('mam_id', "")
    if not mam_id:
        raise HTTPException(status_code=400, detail="MaM ID not configured.")
    try:
        refreshed = dummy_purchase(mam_id)  # Replace with real session refresh logic
        return {"success": True, "message": "Session refreshed.", "result": refreshed}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/api/sessions")
def api_list_sessions():
    return {"sessions": list_sessions()}

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
        save_session(cfg, old_label=old_label)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save session: {e}")

@app.delete("/api/session/delete/{label}")
def api_delete_session(label: str):
    try:
        delete_session(label)
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
            return {"success": True, "msg": result.get("msg", "Completed"), "ip": ip_to_use, "asn": asn}
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

logging.info(f"Serving static from: {STATIC_DIR}")
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
        cfg = load_session(label)
        mam_id = cfg.get('mam', {}).get('mam_id', "")
        check_freq = cfg.get("check_freq", 5)
        mam_ip_override = cfg.get('mam_ip', "").strip()
        detected_public_ip = get_public_ip()
        ip_to_use = mam_ip_override if mam_ip_override else detected_public_ip
        # Get ASN for IP sent to MaM (current_ip)
        if ip_to_use:
            asn_full, _ = get_asn_and_timezone_from_ip(ip_to_use)
            match = re.search(r'(AS)?(\d+)', asn_full or "")
            asn = match.group(2) if match else asn_full
        else:
            asn = None
        now = datetime.now(timezone.utc)
        if mam_id:
            proxy_cfg = cfg.get("proxy", {})
            mam_status = get_status(mam_id=mam_id, proxy_cfg=proxy_cfg)
            session_status_cache[label] = {"status": mam_status, "last_check_time": now.isoformat()}
            cfg["last_check_time"] = now.isoformat()
            # --- Auto-update logic ---
            auto_update_triggered, auto_update_result = auto_update_seedbox_if_needed(cfg, label, ip_to_use, asn, now)
            if auto_update_triggered and auto_update_result:
                mam_status['auto_update_seedbox'] = auto_update_result
            save_session(cfg, old_label=label)
    except Exception as e:
        logging.error(f"[APScheduler] Error in job for '{label}': {e}")

# --- APScheduler setup ---
scheduler = BackgroundScheduler()

# Register jobs for all sessions on startup
def register_all_session_jobs():
    session_labels = list_sessions()
    for label in session_labels:
        cfg = load_session(label)
        check_freq = cfg.get("check_freq", 5)
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

register_all_session_jobs()
scheduler.start()
