import os
import requests
from bs4 import BeautifulSoup
import logging

def build_proxy_dict(proxy_cfg):
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

def get_status(mam_id=None, proxy_cfg=None):
    if not mam_id:
        return {
            "mam_cookie_exists": False,
            "points": None,
            "cheese": None,
            "wedge_active": None,
            "vip_active": None,
            "message": "No MaM ID provided."
        }
    url = "https://www.myanonamouse.net/jsonLoad.php?snatch_summary"
    cookies = {"mam_id": mam_id}
    proxies = build_proxy_dict(proxy_cfg)
    try:
        resp = requests.get(url, cookies=cookies, timeout=10, proxies=proxies)
        resp.raise_for_status()
        data = resp.json()
        # Parse points, cheese, wedge, VIP status from response
        points = data.get("seedbonus")
        cheese = data.get("cheese")
        wedge_active = data.get("wedge_active")
        vip_active = data.get("vip_active")
        # Fallbacks for legacy/alternate keys
        if wedge_active is None:
            wedge_active = data.get("wedge", False)
        if vip_active is None:
            vip_active = data.get("vip", False)
        # Fallback: If cheese is None, try to scrape it from /store.php
        if cheese is None:
            try:
                store_url = "https://www.myanonamouse.net/store.php"
                store_resp = requests.get(store_url, cookies=cookies, timeout=10, proxies=proxies)
                store_resp.raise_for_status()
                soup = BeautifulSoup(store_resp.text, "html.parser")
                cheese_span = soup.find("span", id="currentCheese")
                if cheese_span and cheese_span.text.isdigit():
                    cheese = int(cheese_span.text)
                else:
                    cheese = None
            except Exception as scrape_e:
                logging.debug(f"Cheese scrape failed: {scrape_e}")
                cheese = None
        # --- Compose a more informative status message ---
        msg = []
        if data.get("ip") or data.get("asn"):
            msg.append("IP/ASN Unchanged.")
        msg.append("Status fetched successfully.")
        return {
            "mam_cookie_exists": True,
            "points": points,
            "cheese": cheese,
            "wedge_active": wedge_active,
            "vip_active": vip_active,
            "message": " ".join(msg),
            "raw": data
        }
    except Exception as e:
        return {
            "mam_cookie_exists": False,
            "points": None,
            "cheese": None,
            "wedge_active": None,
            "vip_active": None,
            "message": f"Failed to fetch status: {e}"
        }

def dummy_purchase(item):
    # Simulate a purchase action
    return {
        "result": "success",
        "item": item,
        "message": f"Dummy purchase of {item} completed (stub)."
    }

def buy_wedge_with_cheese(mam_id=None, proxy_cfg=None):
    """
    Attempt to buy a wedge using cheese. Returns a dict with success/failure, message, and raw response.
    """
    if not mam_id:
        return {
            "success": False,
            "message": "No MaM ID provided.",
            "raw": None
        }
    url = "https://www.myanonamouse.net/json/bonusBuy.php/?spendtype=wedges&source=cheese"
    cookies = {"mam_id": mam_id}
    proxies = build_proxy_dict(proxy_cfg)
    try:
        resp = requests.get(url, cookies=cookies, timeout=10, proxies=proxies)
        resp.raise_for_status()
        data = resp.json()
        # Determine success/failure from response
        if data.get("success") or data.get("result") == "success":
            message = data.get("message", "Wedge purchased with cheese successfully.")
            return {
                "success": True,
                "message": message,
                "raw": data
            }
        else:
            message = data.get("message", "Purchase failed.")
            return {
                "success": False,
                "message": message,
                "raw": data
            }
    except Exception as e:
        return {
            "success": False,
            "message": f"Exception during cheese wedge purchase: {e}",
            "raw": None
        }

def get_mam_seen_ip_info(mam_id=None, proxy_cfg=None):
    """
    Calls MAM's /json/jsonIp.php endpoint to get the IP, ASN, and AS as seen by MAM for the session/cookie.
    Returns dict: {"ip": str, "ASN": int, "AS": str} or error info.
    """
    if not mam_id:
        return {"error": "No MaM ID provided."}
    url = "https://t.myanonamouse.net/json/jsonIp.php"
    cookies = {"mam_id": mam_id}
    proxies = build_proxy_dict(proxy_cfg)
    try:
        resp = requests.get(url, cookies=cookies, timeout=10, proxies=proxies)
        resp.raise_for_status()
        data = resp.json()
        return data
    except Exception as e:
        return {"error": f"Failed to fetch MAM-seen IP info: {e}"}