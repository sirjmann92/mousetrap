from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
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

@app.get("/api/config")
def api_get_config():
    return load_config()

@app.post("/api/config")
async def api_set_config(request: Request):
    data = await request.json()
    save_config(data)
    return {"status": "ok"}

@app.get("/api/status")
def api_status():
    return get_status()

@app.post("/api/automation/purchase/{item}")
async def api_purchase(item: str):
    # item: wedge, vip, upload, etc
    if item not in ["wedge", "vip", "upload"]:
        raise HTTPException(status_code=400, detail="Invalid item")
    return dummy_purchase(item)

@app.post("/api/notifications/email/test")
def api_test_email():
    result = send_test_email()
    if result is True:
        return {"status": "sent"}
    else:
        raise HTTPException(status_code=500, detail="Email failed")

@app.post("/api/notifications/webhook/test")
def api_test_webhook():
    result = send_test_webhook()
    if result is True:
        return {"status": "sent"}
    else:
        raise HTTPException(status_code=500, detail="Webhook failed")