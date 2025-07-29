import os
import random

def get_status():
    # Stub: replace with real MaM API logic later
    cookie_path = "/config/mam.cookie"
    exists_cookie = os.path.exists(cookie_path)
    return {
        "mam_cookie_exists": exists_cookie,
        "points": random.randint(10000, 120000),  # Demo value
        "wedge_active": bool(random.getrandbits(1)),
        "vip_active": bool(random.getrandbits(1)),
        "current_ip": "203.0.113." + str(random.randint(10, 200)),
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