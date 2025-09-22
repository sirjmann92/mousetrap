"""API endpoints for storing and retrieving the last selected session label.

This module exposes two endpoints under `/last_session`:
- GET `/last_session`: returns the last saved session label (or None).
- POST `/last_session`: accepts JSON {"label": "..."} and persists it.

Persistence is a simple YAML file located at `LAST_SESSION_FILE`.
"""

from pathlib import Path

from fastapi import APIRouter, HTTPException, Request
import yaml

router = APIRouter()
LAST_SESSION_FILE = Path("/config/last_session.yaml")


def read_last_session():
    """Read the last session label from disk.

    Returns:
        The saved label string, or None if the file does not exist or is malformed.
    """
    if not LAST_SESSION_FILE.exists():
        return None
    with LAST_SESSION_FILE.open(encoding="utf-8") as f:
        data = yaml.safe_load(f)
        return data.get("label") if isinstance(data, dict) else None


def write_last_session(label):
    """Persist the given session label to disk as YAML.

    Args:
        label: The session label to persist.
    """
    LAST_SESSION_FILE.parent.mkdir(parents=True, exist_ok=True)
    with LAST_SESSION_FILE.open("w", encoding="utf-8") as f:
        yaml.safe_dump({"label": label}, f)


@router.get("/last_session")
def get_last_session():
    """HTTP GET handler that returns the last saved session label.

    Returns:
        A JSON object with the key "label" whose value is the saved label or None.
    """
    label = read_last_session()
    if label is None:
        return {"label": None}
    return {"label": label}


@router.post("/last_session")
async def set_last_session(request: Request):
    """HTTP POST handler to set and persist the last session label.

    Expects a JSON body with key `label`. Returns the saved label on success.

    Raises:
        HTTPException(400) if `label` is missing from the request body.
    """
    data = await request.json()
    label = data.get("label")
    if not label:
        raise HTTPException(status_code=400, detail="Label required.")
    write_last_session(label)
    return {"success": True, "label": label}
