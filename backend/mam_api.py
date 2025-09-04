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
import logging
from backend.utils import build_proxy_dict

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
    # Log only proxy label and redact password in proxy URL for debugging
    proxy_label = None
    proxy_url_log = None
    if proxies:
        proxy_label = proxy_cfg.get('label') if proxy_cfg else None
        proxy_url_log = {k: v.replace(proxy_cfg.get('password',''), '***') if proxy_cfg and proxy_cfg.get('password') else v for k,v in proxies.items()}
        logging.debug(f"[get_status] Using proxy label: {proxy_label}, proxies: {proxy_url_log}")
    try:
        resp = requests.get(url, cookies=cookies, timeout=10, proxies=proxies)
        try:
            resp.raise_for_status()
        except requests.HTTPError as http_err:
            if resp.status_code == 403:
                logging.warning(f"[get_status] 403 Forbidden for url: {url} | proxy_label: {proxy_label} | proxies: {proxy_url_log} | cookies: {cookies}")
            else:
                logging.warning(f"[get_status] HTTP error {resp.status_code} for url: {url} | proxy_label: {proxy_label} | proxies: {proxy_url_log} | cookies: {cookies}")
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
        wedge_active = data.get("wedge_active")
        vip_active = data.get("vip_active")
        # Fallbacks for legacy/alternate keys
        if wedge_active is None:
            wedge_active = data.get("wedge", False)
        if vip_active is None:
            vip_active = data.get("vip", False)
        # Do not set a default message here; let the main logic in app.py set the status_message
        return {
            "mam_cookie_exists": True,
            "points": points,
            "wedge_active": wedge_active,
            "vip_active": vip_active,
            # No 'message' key unless there is an error
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