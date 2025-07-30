from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse
import os
import requests

from backend.config import load_config, save_config
from backend.mam_api import get_status, dummy_purchase
from backend.notifications import send_test_email, send_test_webhook

app = FastAPI(title="MouseTrap API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev; restrict in prod!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    cfg = load_config()
    mam_id = cfg.get('mam', {}).get('mam_id', "")
    mam_ip_override = cfg.get('mam_ip', "").strip()
    detected_public_ip = get_public_ip()

    status = {
        "mam_cookie_exists": False,
        "points": None,
        "wedge_active": None,
        "vip_active": None,
        "current_ip": None,
        "asn": None,
        "message": "Please provide your MaM ID in the configuration.",
        "detected_public_ip": detected_public_ip,
        "ip_source": "detected"
    }

    # Use override for MaM IP if present
    if mam_ip_override:
        status["current_ip"] = mam_ip_override
        status["ip_source"] = "override"
    else:
        status["current_ip"] = detected_public_ip
        status["ip_source"] = "detected"

    if mam_id:
        mam_status = get_status(mam_id=mam_id)
        status.update(mam_status)
        status["current_ip"] = status["current_ip"]
        status["ip_source"] = status["ip_source"]
        status["message"] = "Status fetched successfully." if mam_status.get("points") is not None else "Could not fetch status, check your MaM ID."
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
    cfg = await request.json()
    if "mam_ip" not in cfg:
        cfg["mam_ip"] = ""
    save_config(cfg)
    return {"success": True}

# --- STATIC FILES SETUP (robust, works in Docker and locally) ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_BUILD_DIR = os.path.abspath(os.path.join(BASE_DIR, '../frontend/build'))
STATIC_DIR = os.path.join(FRONTEND_BUILD_DIR, 'static')

print("Serving static from:", STATIC_DIR)  # This prints the location it will use

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
