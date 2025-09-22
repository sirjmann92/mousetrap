"""Manage a persistent JSON UI event log with helpers to append, read, and clear
events; sensitive fields are redacted before being written to disk. This module
is used by the backend to record UI events for debugging and auditing.
"""

import json
import logging
from pathlib import Path
from threading import Lock
from typing import Any

from backend.utils_redact import redact_sensitive

_logger: logging.Logger = logging.getLogger(__name__)
_ui_event_log_path = Path(__file__).parent.parent / "logs" / "ui_event_log.json"
_ui_event_log_dir = _ui_event_log_path.parent
_ui_event_log_lock = Lock()

# Expose the log path for use in app.py
UI_EVENT_LOG_PATH = _ui_event_log_path
UI_EVENT_LOG_LOCK = _ui_event_log_lock


def _init_ui_event_log() -> None:
    try:
        _ui_event_log_dir.mkdir(parents=True, exist_ok=True)
        if not _ui_event_log_path.exists():
            with _ui_event_log_path.open("w", encoding="utf-8") as f:
                json.dump([], f)
    except Exception as e:
        _logger.error("[UIEventLog] Failed to initialize event log: %s", e)


_init_ui_event_log()


def append_ui_event_log(event: dict[str, Any]) -> None:
    """Append an event (dict) to the persistent UI event log file as a JSON array, with sensitive fields redacted."""
    _ui_event_log_lock.acquire()
    try:
        # Read existing log
        try:
            with _ui_event_log_path.open(encoding="utf-8") as f:
                log = json.load(f)
        except Exception:
            log = []
        redacted_event = redact_sensitive(event)
        log.append(redacted_event)
        # Keep log at most 1000 entries
        if len(log) > 1000:
            log = log[-1000:]
        with _ui_event_log_path.open("w", encoding="utf-8") as f:
            json.dump(log, f, indent=2)
    except Exception as e:
        _logger.error("[UIEventLog] Failed to append event: %s", e)
    finally:
        _ui_event_log_lock.release()


def get_ui_event_log() -> list:
    """Return the current UI event log as a list of events.

    Reads the JSON array stored at UI_EVENT_LOG_PATH and returns it as Python
    objects; if the file cannot be read or parsed, an empty list is returned.

    Returns:
        list: The list of logged UI events, or an empty list on error.
    """
    try:
        with _ui_event_log_lock, _ui_event_log_path.open(encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []


def clear_ui_event_log() -> bool:
    """Clear all events from the event log (all sessions)."""
    try:
        _logger.info("[UIEventLog] Attempting to clear event log at: %s", _ui_event_log_path)
        with _ui_event_log_lock, _ui_event_log_path.open("w", encoding="utf-8") as f:
            json.dump([], f)
        _logger.info("[UIEventLog] Successfully cleared event log at: %s", _ui_event_log_path)
    except Exception as e:
        _logger.error("[UIEventLog] Failed to clear event log at %s: %s", _ui_event_log_path, e)
        return False
    else:
        return True


def clear_ui_event_log_for_session(label: str) -> bool:
    """Remove all events for a specific session label from the event log."""
    try:
        with _ui_event_log_lock:
            with _ui_event_log_path.open(encoding="utf-8") as f:
                log = json.load(f)
            filtered_log = [event for event in log if event.get("label") != label]
            with _ui_event_log_path.open("w", encoding="utf-8") as f:
                json.dump(filtered_log, f, indent=2)
    except Exception as e:
        _logger.error("[UIEventLog] Failed to clear event log for session '%s': %s", label, e)
        return False
    else:
        return True
