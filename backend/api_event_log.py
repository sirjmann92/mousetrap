from fastapi import APIRouter
from backend.event_log import get_ui_event_log, clear_ui_event_log

router = APIRouter()

@router.get("/ui_event_log")
def api_ui_event_log():
    return get_ui_event_log()

@router.delete("/ui_event_log")
def api_ui_event_log_delete():
    success = clear_ui_event_log()
    if success:
        return {"success": True}
    else:
        return {"success": False, "error": "Failed to clear event log."}
