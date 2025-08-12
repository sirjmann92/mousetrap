import re

def extract_asn_number(asn_str):
    if not asn_str or not isinstance(asn_str, str):
        return None
    match = re.search(r'AS?(\d+)', asn_str, re.IGNORECASE)
    if match:
        return match.group(1)
    # fallback: if it's just a number string
    if asn_str.strip().isdigit():
        return asn_str.strip()
    return None

def build_status_message(status: dict) -> str:
    """
    Generate a user-friendly status message for the session based on the status dict.
    This is a placeholder; you can expand logic as needed for your app.
    """
    # If error present, always show error
    if status.get("error"):
        return f"Error: {status['error']}"

    # If a static message is present (from mam_api or other), use it
    if status.get("message"):
        return status["message"]

    # Fallbacks for legacy or unexpected cases
    if status.get("auto_update_seedbox"):
        result = status["auto_update_seedbox"]
        if isinstance(result, dict):
            if result.get("success"):
                return "IP Changed. Seedbox IP updated."
            else:
                return result.get("error", "Seedbox update failed.")
    return "No change detected. Update not needed."
