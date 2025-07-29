from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse
import os

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

# ... your API endpoints here ...

# Serve React static files
frontend_dir = os.path.join(os.path.dirname(__file__), '..', 'frontend')
app.mount("/static", StaticFiles(directory=os.path.join(frontend_dir, 'static')), name="static")

@app.get("/", include_in_schema=False)
def serve_react_index():
    index_path = os.path.join(frontend_dir, 'index.html')
    return FileResponse(index_path)

@app.get("/{full_path:path}", include_in_schema=False)
def serve_react_app(full_path: str):
    """
    Serve React app for any other route (SPA fallback).
    """
    index_path = os.path.join(frontend_dir, 'index.html')
    if os.path.exists(index_path):
        return FileResponse(index_path)
    raise HTTPException(status_code=404, detail="Not Found")
