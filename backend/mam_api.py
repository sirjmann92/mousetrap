import os
import requests

def get_status(mam_id=None):
    # Return real data only if mam_id is present
    if not mam_id:
        return {
            "mam_cookie_exists": False,
            "points": None,
            "cheese": None,
            "wedge_active": None,
            "vip_active": None,
            "message": "No MaM ID provided."
        }
    cookie_path = "/config/mam.cookie"
    exists_cookie = os.path.exists(cookie_path)

    # --- MOCK DATA FOR TESTING ---
    status = {
        "mam_cookie_exists": exists_cookie,
        "points": 123456,  # Mock points value
        "cheese": 42,      # Mock cheese value
        "wedge_active": True,
        "vip_active": False,
        "message": "Status mock: replace with live data when ready"
    }
    return status

def dummy_purchase(item):
    # Simulate a purchase action
    return {
        "result": "success",
        "item": item,
        "message": f"Dummy purchase of {item} completed (stub)."
    }