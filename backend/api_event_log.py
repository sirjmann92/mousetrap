"""API routes for UI event logging.

This module exposes FastAPI routes to:
- retrieve the UI event log,
- delete all UI event logs,
- delete UI event logs for a specific session label.
"""

from typing import Any

from fastapi import APIRouter

from backend.event_log import clear_ui_event_log, clear_ui_event_log_for_session, get_ui_event_log

router = APIRouter()


@router.get("/ui_event_log")
def api_ui_event_log() -> list:
    """Retrieve the UI event log.

    Returns:
        The UI event log as returned by backend.event_log.get_ui_event_log().

    """
    return get_ui_event_log()


# Delete all logs (all sessions)
@router.delete("/ui_event_log")
def api_ui_event_log_delete() -> dict[str, Any]:
    """Delete all UI event logs.

    Calls backend.event_log.clear_ui_event_log() to remove all logged UI events.

    Returns:
        dict: {"success": True} on success, otherwise {"success": False, "error": <message>}.

    """
    success = clear_ui_event_log()
    if success:
        return {"success": True}
    return {"success": False, "error": "Failed to clear event log."}


# Delete logs for a specific session label
@router.delete("/ui_event_log/{label}")
def api_ui_event_log_delete_for_session(label: str) -> dict[str, Any]:
    """Delete UI event logs for a specific session label.

    Calls backend.event_log.clear_ui_event_log_for_session(label) to remove
    logged UI events for the given session label.

    Args:
        label (str): Session label whose UI event logs should be cleared.

    Returns:
        dict: {"success": True} on success, otherwise {"success": False, "error": <message>}.

    """
    success = clear_ui_event_log_for_session(label)
    if success:
        return {"success": True}
    return {"success": False, "error": f"Failed to clear event log for session '{label}'."}
