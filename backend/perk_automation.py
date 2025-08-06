import requests
import time
import yaml
import logging

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

def buy_upload_credit(gb, mam_id=None):
    """
    Purchase upload credit via the MaM API. Returns a result dict.
    mam_id: required session cookie for authentication
    """
    try:
        if not mam_id:
            return {"success": False, "error": "mam_id (cookie) required for upload credit purchase", "gb": gb}
        timestamp = int(time.time() * 1000)
        url = f"https://www.myanonamouse.net/json/bonusBuy.php/?spendtype=upload&amount={gb}&_={timestamp}"
        cookies = {"mam_id": mam_id}
        logging.debug(f"[buy_upload_credit] Requesting: {url} with cookies: {cookies}")
        resp = requests.get(url, cookies=cookies, timeout=10)
        logging.debug(f"[buy_upload_credit] Response: {resp.status_code} {resp.text}")
        resp.raise_for_status()
        data = resp.json()
        if data.get("success") or data.get("Success"):
            return {"success": True, "gb": gb, "response": data}
        else:
            return {"success": False, "gb": gb, "response": data}
    except Exception as e:
        logging.error(f"[buy_upload_credit] Exception: {e}")
        return {"success": False, "error": str(e), "gb": gb}

def buy_vip(weeks):
    # Implement POST/cURL logic to purchase VIP status
    pass

def buy_wedge(mam_id, method="points"):
    """
    Purchase a wedge using points or cheese via the MaM API.
    method: "points" or "cheese"
    """
    if method not in ("points", "cheese"):
        raise Exception(f"Unsupported wedge purchase method: {method}")
    timestamp = int(time.time() * 1000)
    url = f"https://www.myanonamouse.net/json/bonusBuy.php/?spendtype=wedges&source={method}&_={timestamp}"
    cookies = {"mam_id": mam_id}
    try:
        resp = requests.get(url, cookies=cookies, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        if data.get("success") or data.get("Success"):
            return {"success": True, "method": method, "response": data}
        else:
            return {"success": False, "method": method, "response": data}
    except Exception as e:
        return {"success": False, "error": str(e), "method": method}

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