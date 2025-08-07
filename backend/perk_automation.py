import requests
import time
import yaml
import logging
from bs4 import Tag, BeautifulSoup
import datetime

def load_config(path="backend/perks_config.yaml"):
    with open(path, "r") as f:
        return yaml.safe_load(f)

def get_current_points():
    # Implement API or script to get user points
    pass

def get_current_cheese():
    # Implement API or script to get user cheese
    pass

def get_vip_weeks():
    # Implement API or script to get current VIP duration
    pass

def get_last_wedge_time():
    # Implement tracking file/timestamp for last wedge
    pass

def buy_upload_credit(gb, mam_id=None, proxy_cfg=None):
    """
    Purchase upload credit via the MaM API. Returns a result dict.
    mam_id: required session cookie for authentication
    proxy_cfg: optional proxy config dict
    """
    try:
        if not mam_id:
            return {"success": False, "error": "mam_id (cookie) required for upload credit purchase", "gb": gb}
        timestamp = int(time.time() * 1000)
        url = f"https://www.myanonamouse.net/json/bonusBuy.php/?spendtype=upload&amount={gb}&_={timestamp}"
        cookies = {"mam_id": mam_id}
        proxies = None
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
        if proxy_cfg is not None:
            from backend.mam_api import build_proxy_dict
            proxies = build_proxy_dict(proxy_cfg)
            logging.debug(f"[buy_upload_credit] Using proxy config: {proxy_cfg}")
            logging.debug(f"[buy_upload_credit] Built proxies dict: {proxies}")
        logging.debug(f"[buy_upload_credit] Requesting: {url}\n  cookies: {cookies}\n  proxies: {proxies}\n  headers: {headers}")
        resp = requests.get(url, cookies=cookies, timeout=10, proxies=proxies, headers=headers)
        logging.debug(f"[buy_upload_credit] Response: status={resp.status_code}\n  headers: {dict(resp.headers)}\n  text: {resp.text[:500]}")
        resp.raise_for_status()
        try:
            data = resp.json()
        except Exception as json_e:
            return {"success": False, "error": f"MaM API did not return valid JSON: {json_e}. Response: {resp.text[:200]}", "gb": gb}
        if data.get("success") or data.get("Success"):
            return {"success": True, "gb": gb, "response": data}
        else:
            return {"success": False, "gb": gb, "response": data}
    except Exception as e:
        logging.error(f"[buy_upload_credit] Exception: {e}")
        return {"success": False, "error": str(e), "gb": gb}

def buy_vip(mam_id, duration='max', proxy_cfg=None):
    """
    Purchase VIP status via the MaM API. Returns a result dict.
    mam_id: required session cookie for authentication
    duration: 'max', '4', '8', etc. (string)
    proxy_cfg: optional proxy config dict
    """
    import time
    timestamp = int(time.time() * 1000)
    url = f"https://www.myanonamouse.net/json/bonusBuy.php/"
    params = {
        'spendtype': 'VIP',
        'duration': duration,
        '_': timestamp
    }
    cookies = {"mam_id": mam_id}
    proxies = None
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "Accept-Language": "en-US,en;q=0.5",
        "Referer": "https://www.myanonamouse.net/store.php"
    }
    if proxy_cfg is not None:
        from backend.mam_api import build_proxy_dict
        proxies = build_proxy_dict(proxy_cfg)
        logging.debug(f"[buy_vip] Using proxy config: {proxy_cfg}")
        logging.debug(f"[buy_vip] Built proxies dict: {proxies}")
    try:
        logging.debug(f"[buy_vip] Requesting: {url} params={params}\n  cookies: {cookies}\n  proxies: {proxies}\n  headers: {headers}")
        resp = requests.get(url, params=params, cookies=cookies, timeout=10, proxies=proxies, headers=headers)
        logging.debug(f"[buy_vip] Response: status={resp.status_code}\n  headers: {dict(resp.headers)}\n  text: {resp.text[:500]}")
        resp.raise_for_status()
        try:
            data = resp.json()
        except Exception as json_e:
            return {
                "success": False,
                "error": f"Non-JSON response: {json_e}",
                "raw_response": resp.text[:500],
                "status_code": resp.status_code
            }
        if data.get("success") or data.get("Success"):
            return {"success": True, "response": data}
        else:
            return {"success": False, "response": data}
    except Exception as e:
        logging.error(f"[buy_vip] Exception: {e}")
        return {"success": False, "error": str(e)}

def buy_wedge(mam_id, method="points", proxy_cfg=None):
    """
    Purchase a wedge using points or cheese via the MaM API.
    method: "points" or "cheese"
    proxy_cfg: optional proxy config dict
    """
    if method not in ("points", "cheese"):
        raise Exception(f"Unsupported wedge purchase method: {method}")
    import time
    timestamp = int(time.time() * 1000)
    url = f"https://www.myanonamouse.net/json/bonusBuy.php/?spendtype=wedges&source={method}&_={timestamp}"
    cookies = {"mam_id": mam_id}
    proxies = None
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "Accept-Language": "en-US,en;q=0.5",
        "Referer": "https://www.myanonamouse.net/store.php"
    }
    if proxy_cfg is not None:
        from backend.mam_api import build_proxy_dict
        proxies = build_proxy_dict(proxy_cfg)
        logging.debug(f"[buy_wedge] Using proxy config: {proxy_cfg}")
        logging.debug(f"[buy_wedge] Built proxies dict: {proxies}")
    try:
        logging.debug(f"[buy_wedge] Requesting: {url}\n  cookies: {cookies}\n  proxies: {proxies}\n  headers: {headers}")
        resp = requests.get(url, cookies=cookies, timeout=10, proxies=proxies, headers=headers)
        logging.debug(f"[buy_wedge] Response: status={resp.status_code}\n  headers: {dict(resp.headers)}\n  text: {resp.text[:500]}")
        resp.raise_for_status()
        try:
            data = resp.json()
        except Exception as json_e:
            return {
                "success": False,
                "error": f"Non-JSON response: {json_e}",
                "raw_response": resp.text[:500],
                "status_code": resp.status_code
            }
        if data.get("success") or data.get("Success"):
            return {"success": True, "response": data}
        else:
            return {"success": False, "response": data}
    except Exception as e:
        logging.error(f"[buy_wedge] Exception: {e}")
        return {"success": False, "error": str(e)}

def can_afford_upload(points, config, gb):
    required = gb * 500 + config['buffer']
    return points >= required and points >= config['min_points']

def can_afford_vip(points, weeks, config):
    enough_points = points >= config['min_points'] * weeks
    not_exceed_max = weeks <= config['max_weeks']
    return enough_points and not_exceed_max

def can_afford_wedge(points, cheese, config):
    if config['method'] == "cheese" or (config['prefer_cheese'] and cheese >= config['min_cheese']):
        return cheese >= config['min_cheese']
    else:
        return points >= config['min_points']

def automate_perks(config):
    points = get_current_points()
    cheese = get_current_cheese()
    vip_weeks = get_vip_weeks()
    last_wedge = get_last_wedge_time()

    mam_id = ""  # Retrieve from session or config

    # Upload credit
    if config['perks']['upload_credit']['enabled']:
        for gb in config['perks']['upload_credit']['chunk_sizes']:
            while can_afford_upload(points, config['perks']['upload_credit'], gb):
                buy_upload_credit(gb)
                points = get_current_points()
                time.sleep(config['perks']['upload_credit'].get('cooldown_minutes', 0) * 60)

    # VIP status
    if config['perks']['vip_status']['enabled']:
        if can_afford_vip(points, vip_weeks, config['perks']['vip_status']):
            buy_vip(config['perks']['vip_status']['max_weeks'] - vip_weeks)
            time.sleep(config['perks']['vip_status'].get('cooldown_hours', 0) * 3600)

    # FreeLeech Wedge
    if config['perks']['freeleech_wedge']['enabled']:
        if last_wedge is not None:
            hours_since_last = (time.time() - last_wedge) / 3600
        else:
            hours_since_last = float('inf')  # Treat as eligible if never run
        if hours_since_last >= config['perks']['freeleech_wedge']['cooldown_hours']:
            if can_afford_wedge(points, cheese, config['perks']['freeleech_wedge']):
                buy_wedge(mam_id, config['perks']['freeleech_wedge']['method'])
                # Update last wedge time tracking

def main():
    config = load_config()
    while True:
        automate_perks(config)
        time.sleep(config['general']['check_interval_minutes'] * 60)

if __name__ == "__main__":
    main()