import os
import json
import logging
from threading import Lock

_ui_event_log_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'logs', 'ui_event_log.json')
_ui_event_log_dir = os.path.dirname(_ui_event_log_path)
_ui_event_log_lock = Lock()

def _init_ui_event_log():
    try:
        os.makedirs(_ui_event_log_dir, exist_ok=True)
        if not os.path.exists(_ui_event_log_path):
            with open(_ui_event_log_path, 'w', encoding='utf-8') as f:
                json.dump([], f)
    except Exception as e:
        logging.error(f"[UIEventLog] Failed to initialize event log: {e}")

_init_ui_event_log()

def append_ui_event_log(event: dict):
    """Append an event (dict) to the persistent UI event log file as a JSON array."""
    _ui_event_log_lock.acquire()
    try:
        # Read existing log
        try:
            with open(_ui_event_log_path, 'r', encoding='utf-8') as f:
                log = json.load(f)
        except Exception:
            log = []
        log.append(event)
        # Keep log at most 1000 entries
        if len(log) > 1000:
            log = log[-1000:]
        with open(_ui_event_log_path, 'w', encoding='utf-8') as f:
            json.dump(log, f, indent=2)
    except Exception as e:
        logging.error(f"[UIEventLog] Failed to append event: {e}")
    finally:
        _ui_event_log_lock.release()

def get_ui_event_log():
    try:
        with open(_ui_event_log_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return []


def clear_ui_event_log():
    """Clear all events from the event log (all sessions)."""
    try:
        with _ui_event_log_lock:
            with open(_ui_event_log_path, 'w', encoding='utf-8') as f:
                json.dump([], f)
        return True
    except Exception as e:
        logging.error(f"[UIEventLog] Failed to clear event log: {e}")
        return False

def clear_ui_event_log_for_session(label):
    """Remove all events for a specific session label from the event log."""
    try:
        with _ui_event_log_lock:
            with open(_ui_event_log_path, 'r', encoding='utf-8') as f:
                log = json.load(f)
            filtered_log = [event for event in log if event.get('label') != label]
            with open(_ui_event_log_path, 'w', encoding='utf-8') as f:
                json.dump(filtered_log, f, indent=2)
        return True
    except Exception as e:
        logging.error(f"[UIEventLog] Failed to clear event log for session '{label}': {e}")
        return False

# Expose the log path for use in app.py
UI_EVENT_LOG_PATH = _ui_event_log_path
UI_EVENT_LOG_LOCK = _ui_event_log_lock
