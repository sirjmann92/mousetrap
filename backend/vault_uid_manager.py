"""UID-based Millionaire's Vault Management.

This module handles Browser MAM ID sharing across sessions with the same UID,
preventing duplicate vault automations and ensuring consistent vault access.
"""

import logging
from typing import Any

from backend.config import list_sessions, load_session, save_session

_logger: logging.Logger = logging.getLogger(__name__)


def get_sessions_by_uid(target_uid: str) -> list[dict[str, Any]]:
    """Find all sessions that share the same UID.

    Args:
        target_uid: The UID to search for

    Returns:
        List of session data dicts with matching UIDs
    """
    matching_sessions = []

    try:
        session_labels = list_sessions()

        for label in session_labels:
            try:
                session_config = load_session(label)
                session_uid = session_config.get("last_status", {}).get("raw", {}).get("uid")

                if str(session_uid) == str(target_uid):
                    matching_sessions.append(
                        {
                            "label": label,
                            "config": session_config,
                            "uid": session_uid,
                            "browser_mam_id": session_config.get("browser_mam_id", ""),
                        }
                    )

            except Exception as e:
                _logger.warning("[get_sessions_by_uid] Error loading session %s: %s", label, e)
                continue

    except Exception as e:
        _logger.error("[get_sessions_by_uid] Error: %s", e)

    return matching_sessions


def sync_browser_mam_id_across_uid_sessions(target_uid: str, browser_mam_id: str) -> dict[str, Any]:
    """Sync Browser MAM ID across all sessions with the same UID.

    Args:
        target_uid: UID to sync across
        browser_mam_id: Browser MAM ID to propagate

    Returns:
        Dict with sync results
    """
    result: dict[str, Any] = {"success": False, "updated_sessions": [], "errors": [], "message": ""}

    try:
        # Find all sessions with this UID
        uid_sessions = get_sessions_by_uid(target_uid)

        if not uid_sessions:
            result["message"] = f"No sessions found with UID {target_uid}"
            return result

        # Update browser_mam_id for all sessions with this UID
        for session_data in uid_sessions:
            try:
                session_config = session_data["config"]
                session_label = session_data["label"]

                # Update browser_mam_id
                session_config["browser_mam_id"] = browser_mam_id

                # Save the updated session
                save_session(session_config, old_label=session_label)
                result["updated_sessions"].append(session_label)

            except Exception as e:
                error_msg = f"Failed to update session {session_data['label']}: {e}"
                result["errors"].append(error_msg)
                _logger.warning("[sync_browser_mam_id_across_uid_sessions] %s", error_msg)

        if result["updated_sessions"]:
            result["success"] = True
            result["message"] = (
                f"Browser MAM ID synced across {len(result['updated_sessions'])} sessions for UID {target_uid}"
            )
        else:
            result["message"] = "No sessions were updated"

    except Exception as e:
        result["message"] = f"Sync error: {e!s}"
        _logger.error("[sync_browser_mam_id_across_uid_sessions] Error: %s", e)

    return result


def check_vault_automation_conflicts(target_uid: str) -> dict[str, Any]:
    """Check if vault automation is already active for this UID across any session.

    Args:
        target_uid: UID to check

    Returns:
        Dict with conflict information
    """
    result: dict[str, Any] = {"has_conflict": False, "active_sessions": [], "message": ""}

    try:
        uid_sessions = get_sessions_by_uid(target_uid)

        for session_data in uid_sessions:
            session_config = session_data["config"]

            # Check if vault automation is enabled in any session with this UID
            vault_enabled = session_config.get("millionaires_vault", {}).get("enabled", False)

            if vault_enabled:
                result["has_conflict"] = True
                result["active_sessions"].append(
                    {"label": session_data["label"], "uid": session_data["uid"]}
                )

        if result["has_conflict"]:
            active_labels = [s["label"] for s in result["active_sessions"]]
            result["message"] = (
                f"Vault automation already active for UID {target_uid} in sessions: {', '.join(active_labels)}"
            )
        else:
            result["message"] = f"No vault automation conflicts for UID {target_uid}"

    except Exception as e:
        result["message"] = f"Conflict check error: {e!s}"
        _logger.error("[check_vault_automation_conflicts] Error: %s", e)

    return result


def get_uid_vault_summary(target_uid: str) -> dict[str, Any]:
    """Get summary of vault setup across all sessions for a UID.

    Args:
        target_uid: UID to summarize

    Returns:
        Dict with vault summary information
    """
    result: dict[str, Any] = {
        "uid": target_uid,
        "total_sessions": 0,
        "sessions_with_browser_mam_id": 0,
        "sessions_with_vault_enabled": 0,
        "browser_mam_id_values": set(),
        "vault_enabled_sessions": [],
        "sessions": [],
    }

    try:
        uid_sessions = get_sessions_by_uid(target_uid)
        result["total_sessions"] = len(uid_sessions)

        for session_data in uid_sessions:
            session_config = session_data["config"]
            session_label = session_data["label"]
            browser_mam_id = session_data["browser_mam_id"]

            session_info = {
                "label": session_label,
                "has_browser_mam_id": bool(browser_mam_id),
                "vault_enabled": session_config.get("millionaires_vault", {}).get("enabled", False),
            }

            if browser_mam_id:
                result["sessions_with_browser_mam_id"] += 1
                result["browser_mam_id_values"].add(browser_mam_id)

            if session_info["vault_enabled"]:
                result["sessions_with_vault_enabled"] += 1
                result["vault_enabled_sessions"].append(session_label)

            result["sessions"].append(session_info)

        # Convert set to list for JSON serialization
        result["browser_mam_id_values"] = list(result["browser_mam_id_values"])

    except Exception as e:
        _logger.error("[get_uid_vault_summary] Error: %s", e)

    return result
