from fastapi import APIRouter
from backend.config import load_config, save_config, list_sessions, load_session, save_session, delete_session

router = APIRouter()

# Add config/session-related endpoints here, e.g.:
# @router.get("/config")
# def ...
