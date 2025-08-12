def get_proxied_public_ip(proxy_cfg):
    """
    Returns the public IP as seen through the given proxy config.
    """
    proxies = build_proxy_dict(proxy_cfg)
    if not proxies:
        return None
    try:
        resp = requests.get("https://api.ipify.org", timeout=6, proxies=proxies)
        if resp.status_code == 200:
            return resp.text.strip()
        return None
    except Exception as e:
        logging.warning(f"[get_proxied_public_ip] Failed: {e}")
        return None

def get_proxied_public_ip_and_asn(proxy_cfg):
    """
    Returns (public_ip, asn) as seen through the given proxy config, using ipinfo.io and the API token if available.
    """
    proxies = build_proxy_dict(proxy_cfg)
    token = os.environ.get("IPINFO_TOKEN")
    url = "https://ipinfo.io/json"
    if token:
        url += f"?token={token}"
    try:
        resp = requests.get(url, timeout=6, proxies=proxies)
        if resp.status_code == 200:
            data = resp.json()
            ip = data.get("ip")
            asn = data.get("org", "Unknown ASN")
            return ip, asn
        return None, None
    except Exception as e:
        logging.warning(f"[get_proxied_public_ip_and_asn] Failed: {e}")
        return None, None
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
    # Redact password for logging
    proxy_cfg_log = dict(proxy_cfg) if proxy_cfg else {}
    if "password" in proxy_cfg_log:
        proxy_cfg_log["password"] = "***REDACTED***"
    try:
        resp = requests.get(url, cookies=cookies, timeout=10, proxies=proxies)
        try:
            resp.raise_for_status()
        except requests.HTTPError as http_err:
            if resp.status_code == 403:
                logging.warning(f"[get_status] 403 Forbidden for url: {url} | proxies: {proxy_cfg_log} | cookies: {cookies}")
            else:
                logging.warning(f"[get_status] HTTP error {resp.status_code} for url: {url} | proxies: {proxy_cfg_log} | cookies: {cookies}")
            raise
        try:
            data = resp.json()
        except Exception as json_e:
            return {
                "mam_cookie_exists": False,
                "points": None,
                "cheese": None,
                "wedge_active": None,
                "vip_active": None,
                "message": f"MaM API did not return valid JSON: {json_e}. Response: {resp.text[:200]}"
            }
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
                    # Try to find <a> with text like 'Cheese: NNN'
                    def cheese_match(t):
                        return isinstance(t, str) and t.strip().startswith("Cheese:")
                    cheese_link = soup.find("a", string=cheese_match)
                    if cheese_link:
                        import re
                        match = re.search(r"Cheese:\s*(\d+)", cheese_link.text)
                        if match:
                            cheese = int(match.group(1))
                        else:
                            cheese = None
                    else:
                        cheese = None
            except Exception as scrape_e:
                logging.debug(f"Cheese scrape failed: {scrape_e}")
                cheese = None
        # --- Compose a more informative status message ---
        msg = "No change detected. Update not needed."
        return {
            "mam_cookie_exists": True,
            "points": points,
            "cheese": cheese,
            "wedge_active": wedge_active,
            "vip_active": vip_active,
            "message": msg,
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