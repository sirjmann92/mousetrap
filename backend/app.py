from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse
import os
import requests
from datetime import datetime, timezone
import sys
from typing import Dict, Optional, Any

from backend.config import load_config, save_config, list_sessions, load_session, save_session, delete_session
from backend.mam_api import get_status, dummy_purchase
from backend.notifications import send_test_email, send_test_webhook
from backend.perk_automation import buy_wedge, buy_vip, buy_upload_credit

app = FastAPI(title="MouseTrap API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev; restrict in prod!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

asn_cache: Dict[str, Optional[Any]] = {"ip": None, "asn": None, "tz": None}
mam_status_cache: Dict[str, Optional[Any]] = {"result": None, "last_check_time": None}

def log_with_timestamp(message):
    now = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')
    print(f"[{now}] {message}", file=sys.stdout)

def get_asn_and_timezone_from_ip(ip):
    try:
        token = os.environ.get("IPINFO_TOKEN")
        url = f"https://ipinfo.io/{ip}/json"
        if token:
            url += f"?token={token}"
        log_with_timestamp(f"ASN lookup for IP: {ip} (url: {url})")
        resp = requests.get(url, timeout=4)
        log_with_timestamp(f"ipinfo.io response: {resp.status_code} {resp.text}")
        if resp.status_code == 200:
            data = resp.json()
            asn = data.get("org", "Unknown ASN")
            tz = data.get("timezone", None)
            return asn, tz
        return "Unknown ASN", None
    except Exception as e:
        log_with_timestamp(f"ASN lookup failed for IP {ip}: {e}")
        return "Unknown ASN", None

def get_public_ip():
    try:
        resp = requests.get("https://api.ipify.org", timeout=4)
        if resp.status_code == 200:
            return resp.text.strip()
        return None
    except Exception:
        return None

@app.get("/api/status")
def api_status():
    global asn_cache, mam_status_cache
    cfg = load_config()
    mam_id = cfg.get('mam', {}).get('mam_id', "")
    mam_ip_override = cfg.get('mam_ip', "").strip()
    detected_public_ip = get_public_ip()
    ip_to_use = mam_ip_override if mam_ip_override else detected_public_ip

    # Only query ASN if IP changes, else use cached ASN
    if ip_to_use and ip_to_use != asn_cache["ip"]:
        asn, tz = get_asn_and_timezone_from_ip(ip_to_use)
        asn_cache = {"ip": ip_to_use, "asn": asn, "tz": tz}
    else:
        asn = asn_cache["asn"] if ip_to_use else "N/A"
        tz = asn_cache["tz"] if ip_to_use else None

    # Timezone: prefer TZ env var, else use IP-based
    tz_env = os.environ.get("TZ")
    timezone_used = tz_env if tz_env else tz if tz else "UTC"

    # Use persistent last_check_time from config
    last_check_time = cfg.get("last_check_time")
    check_freq = cfg.get("check_freq", 5)

    status = {
        "mam_cookie_exists": False,
        "points": None,
        "wedge_active": None,
        "vip_active": None,
        "current_ip": ip_to_use,
        "asn": asn,
        "message": "Please provide your MaM ID in the configuration.",
        "detected_public_ip": detected_public_ip,
        "ip_source": "override" if mam_ip_override else "detected",
        "last_check_time": last_check_time,
        "timezone": timezone_used,
        "check_freq": check_freq
    }

    now = datetime.now(timezone.utc)
    do_real_check = False
    if mam_id:
        # Only do a real check if enough time has passed
        last_check_dt = None
        if mam_status_cache["last_check_time"]:
            try:
                last_check_dt = datetime.fromisoformat(mam_status_cache["last_check_time"])
            except Exception:
                last_check_dt = None
        if not last_check_dt or (now - last_check_dt).total_seconds() >= check_freq * 60:
            # Do real MaM API check
            mam_status = get_status(mam_id=mam_id)
            mam_status_cache["result"] = mam_status
            mam_status_cache["last_check_time"] = now.isoformat()
            log_with_timestamp(f"[MaM API] Real check for mam_id={mam_id}")
            do_real_check = True
        else:
            mam_status = mam_status_cache["result"] or {}
            log_with_timestamp(f"[MaM API] Using cached result for mam_id={mam_id}")
        if 'message' in mam_status:
            log_with_timestamp(f"mam_status message: {mam_status['message']}")
        mam_status.pop('asn', None)
        status.update(mam_status)
        status["current_ip"] = status["current_ip"]
        status["ip_source"] = status["ip_source"]
        status["message"] = "Status fetched successfully." if mam_status.get("points") is not None else "Could not fetch status, check your MaM ID."
        # Only update last_check_time if a real check occurred
        if do_real_check and mam_status.get("points") is not None:
            status["last_check_time"] = now.isoformat()
            cfg["last_check_time"] = now.isoformat()
            save_config(cfg)
        else:
            status["last_check_time"] = mam_status_cache["last_check_time"]
    return status

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
def api_automation_wedge(request: Request):
    cfg = load_config()
    mam_id = cfg.get('mam', {}).get('mam_id', "")
    if not mam_id:
        raise HTTPException(status_code=400, detail="MaM ID not configured.")
    try:
        result = buy_wedge(mam_id)
        return {"success": True, "result": result}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/api/automation/vip")
def api_automation_vip(request: Request):
    cfg = load_config()
    mam_id = cfg.get('mam', {}).get('mam_id', "")
    if not mam_id:
        raise HTTPException(status_code=400, detail="MaM ID not configured.")
    try:
        result = buy_vip(mam_id)
        return {"success": True, "result": result}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/api/automation/upload")
async def api_automation_upload(request: Request):
    cfg = load_config()
    mam_id = cfg.get('mam', {}).get('mam_id', "")
    if not mam_id:
        raise HTTPException(status_code=400, detail="MaM ID not configured.")
    try:
        data = await request.json()
        gb = data.get("gb", 1)  # Default to 1GB if not specified
        result = buy_upload_credit(gb)
        return {"success": True, "result": result}
    except Exception as e:
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

# --- STATIC FILES SETUP (robust, works in Docker and locally) ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_BUILD_DIR = os.path.abspath(os.path.join(BASE_DIR, '../frontend/build'))
FRONTEND_PUBLIC_DIR = "/app/frontend/public"  # Force correct path for Docker
STATIC_DIR = os.path.join(FRONTEND_BUILD_DIR, 'static')

log_with_timestamp(f"Serving static from: {STATIC_DIR}")  # This prints the location it will use

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
