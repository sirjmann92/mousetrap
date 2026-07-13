"""SQLite-backed persistence for the backend.

Owns the process-wide connection and schema and currently backs the UI event
log. It is structured to grow additional tables (runtime state, etc.) over
time. Every caller goes through :func:`connection`, which serializes access to
the single shared connection with a lock, so it is safe to use from the FastAPI
threadpool and worker threads alike.
"""

from collections.abc import Iterator
from contextlib import contextmanager
from functools import cache
import sqlite3
from threading import Lock

from backend.config import CONFIG_DIR

DB_PATH = CONFIG_DIR / "mousetrap.db"

_lock = Lock()


def _init(conn: sqlite3.Connection) -> None:
    """Create tables and indexes if they do not already exist."""
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS events (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            label      TEXT,
            event_type TEXT,
            ts         TEXT,
            data       TEXT NOT NULL
        )
        """
    )
    conn.execute("CREATE INDEX IF NOT EXISTS idx_events_label ON events (label)")
    conn.commit()


@cache
def _get_conn() -> sqlite3.Connection:
    """Open the process-wide connection once and apply the schema."""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    _init(conn)
    return conn


@contextmanager
def connection() -> Iterator[sqlite3.Connection]:
    """Yield the process-wide SQLite connection under a lock (created lazily, once)."""
    with _lock:
        yield _get_conn()
