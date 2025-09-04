import requests
import time
import logging


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
            from backend.utils import build_proxy_dict
            proxies = build_proxy_dict(proxy_cfg)
            if proxies:
                proxy_label = proxy_cfg.get('label') if proxy_cfg else None
                proxy_url_log = {k: v.replace(proxy_cfg.get('password',''), '***') if proxy_cfg and proxy_cfg.get('password') else v for k,v in proxies.items()}
                logging.debug(f"[buy_upload_credit] Using proxy label: {proxy_label}, proxies: {proxy_url_log}")
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
        if proxies:
            proxy_label = proxy_cfg.get('label') if proxy_cfg else None
            proxy_url_log = {k: v.replace(proxy_cfg.get('password',''), '***') if proxy_cfg and proxy_cfg.get('password') else v for k,v in proxies.items()}
            logging.debug(f"[buy_vip] Using proxy label: {proxy_label}, proxies: {proxy_url_log}")
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
        return {"success": False, "error": f"Unsupported wedge purchase method: {method}"}
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
        if proxies:
            proxy_label = proxy_cfg.get('label') if proxy_cfg else None
            proxy_url_log = {k: v.replace(proxy_cfg.get('password',''), '***') if proxy_cfg and proxy_cfg.get('password') else v for k,v in proxies.items()}
            logging.debug(f"[buy_wedge] Using proxy label: {proxy_label}, proxies: {proxy_url_log}")
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