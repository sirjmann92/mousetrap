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

# --- Proxy utility ---
def build_proxy_dict(proxy_cfg):
    """
    Given a proxy config dict, return a requests-compatible proxies dict or None.
    Handles host/port/username/password or direct URL fields.
    """
    if not proxy_cfg or not proxy_cfg.get("host"):
        return None
    host = proxy_cfg["host"]
    port = proxy_cfg.get("port", 0)
    username = proxy_cfg.get("username", "")
    password = proxy_cfg.get("password", "")
    if username and password:
        proxy_url = f"http://{username}:{password}@{host}:{port}" if port else f"http://{username}:{password}@{host}"
    else:
        proxy_url = f"http://{host}:{port}" if port else f"http://{host}"
    proxies = {"http": proxy_url, "https": proxy_url}
    return proxies
