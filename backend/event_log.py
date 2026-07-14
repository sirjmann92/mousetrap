"""Persistent UI event log, backed by the shared SQLite database.

Records UI events (session checks, IP changes, purchases, port-monitor status,
integration syncs, etc.) for the frontend activity feed. Sensitive fields are
redacted before storage, and the log is capped at the newest ``_MAX_EVENTS``.
"""

import json
import logging
import sqlite3
from typing import Any

from backend import db
from backend.utils_redact import redact_sensitive

_MAX_EVENTS = 1000
_logger: logging.Logger = logging.getLogger(__name__)


def append_ui_event_log(event: dict[str, Any]) -> None:
    """Append a redacted event to the log, keeping only the newest _MAX_EVENTS."""
    try:
        redacted = redact_sensitive(event)
        with db.connection() as conn:
            conn.execute(
                "INSERT INTO events (label, event_type, ts, data) VALUES (?, ?, ?, ?)",
                (
                    redacted.get("label"),
                    redacted.get("event_type"),
                    redacted.get("timestamp"),
                    json.dumps(redacted),
                ),
            )
            conn.execute(
                "DELETE FROM events WHERE id <= (SELECT MAX(id) FROM events) - ?",
                (_MAX_EVENTS,),
            )
            conn.commit()
    except (TypeError, ValueError, sqlite3.Error) as e:
        _logger.error("[UIEventLog] Failed to append event: %s", e)


def get_ui_event_log() -> list[dict[str, Any]]:
    """Return the logged events in chronological (insertion) order.

    Returns an empty list if the log cannot be read or a row cannot be parsed.
    """
    try:
        with db.connection() as conn:
            rows = conn.execute("SELECT data FROM events ORDER BY id").fetchall()
        return [json.loads(row["data"]) for row in rows]
    except (json.JSONDecodeError, sqlite3.Error):
        return []


def clear_ui_event_log() -> bool:
    """Clear all events from the event log (all sessions)."""
    try:
        with db.connection() as conn:
            conn.execute("DELETE FROM events")
            conn.commit()
    except sqlite3.Error as e:
        _logger.error("[UIEventLog] Failed to clear event log: %s", e)
        return False
    else:
        return True


def clear_ui_event_log_for_session(label: str) -> bool:
    """Remove all events for a specific session label from the event log."""
    try:
        with db.connection() as conn:
            conn.execute("DELETE FROM events WHERE label = ?", (label,))
            conn.commit()
    except sqlite3.Error as e:
        _logger.error("[UIEventLog] Failed to clear event log for session '%s': %s", label, e)
        return False
    else:
        return True
