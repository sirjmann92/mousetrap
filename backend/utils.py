def build_status_message(status: dict) -> str:
    """
    Generate a user-friendly status message for the session based on the status dict.
    This is a placeholder; you can expand logic as needed for your app.
    """
    if not status:
        return "No status available."
    if not status.get("configured", True):
        return "Session not configured. Please save session details to begin."
    if status.get("error"):
        return f"Error: {status['error']}"
    if status.get("auto_update_seedbox"):
        result = status["auto_update_seedbox"]
        if isinstance(result, dict):
            if result.get("success"):
                return result.get("msg", "Seedbox updated successfully.")
            else:
                return result.get("error", "Seedbox update failed.")
    if status.get("mam_seen_ip") and status.get("configured_ip"):
        if status["mam_seen_ip"] == status["configured_ip"]:
            return "Seedbox IP is up to date."
        else:
            return f"Seedbox IP mismatch: MAM sees {status['mam_seen_ip']}, configured {status['configured_ip']}"
    if status.get("mam_seen_ip"):
        return f"MAM sees IP: {status['mam_seen_ip']}"
    if status.get("configured_ip"):
        return f"Configured IP: {status['configured_ip']}"
    return status.get("message", "Status OK.")
