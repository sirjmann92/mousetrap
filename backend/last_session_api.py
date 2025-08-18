import os
import yaml
from fastapi import APIRouter, HTTPException, Request

router = APIRouter()
LAST_SESSION_FILE = "/config/last_session.yaml"

def read_last_session():
    if not os.path.exists(LAST_SESSION_FILE):
        return None
    with open(LAST_SESSION_FILE, "r") as f:
        data = yaml.safe_load(f)
        return data.get("label") if isinstance(data, dict) else None

def write_last_session(label):
    with open(LAST_SESSION_FILE, "w") as f:
        yaml.safe_dump({"label": label}, f)

@router.get("/last_session")
def get_last_session():
    label = read_last_session()
    if label is None:
        return {"label": None}
    return {"label": label}

@router.post("/last_session")
async def set_last_session(request: Request):
    data = await request.json()
    label = data.get("label")
    if not label:
        raise HTTPException(status_code=400, detail="Label required.")
    write_last_session(label)
    return {"success": True, "label": label}
