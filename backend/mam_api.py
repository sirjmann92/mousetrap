import os
import random

def get_status(mam_id=None):
    # Return real data only if mam_id is present
    if not mam_id:
        return {
            "mam_cookie_exists": False,
            "points": None,
            "wedge_active": None,
            "vip_active": None,
            "asn": None,
            "message": "No MaM ID provided."
        }
    cookie_path = "/config/mam.cookie"
    exists_cookie = os.path.exists(cookie_path)
    return {
        "mam_cookie_exists": exists_cookie,
        "points": random.randint(10000, 120000),  # Replace with API call
        "wedge_active": bool(random.getrandbits(1)),
        "vip_active": bool(random.getrandbits(1)),
        "asn": "AS" + str(random.randint(10000, 99999)),
        "message": "Status stub (replace with live data)"
    }

def dummy_purchase(item):
    # Simulate a purchase action
    return {
        "result": "success",
        "item": item,
        "message": f"Dummy purchase of {item} completed (stub)."
    }