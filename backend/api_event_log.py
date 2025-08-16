from fastapi import APIRouter
from backend.event_log import get_ui_event_log, clear_ui_event_log, clear_ui_event_log_for_session

router = APIRouter()

@router.get("/ui_event_log")
def api_ui_event_log():
    return get_ui_event_log()


# Delete all logs (all sessions)
@router.delete("/ui_event_log")
def api_ui_event_log_delete():
    success = clear_ui_event_log()
    if success:
        return {"success": True}
    else:
        return {"success": False, "error": "Failed to clear event log."}

# Delete logs for a specific session label
@router.delete("/ui_event_log/{label}")
def api_ui_event_log_delete_for_session(label: str):
    success = clear_ui_event_log_for_session(label)
    if success:
        return {"success": True}
    else:
        return {"success": False, "error": f"Failed to clear event log for session '{label}'."}
