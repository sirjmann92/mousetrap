def resolve_proxy_from_session_cfg(cfg):
    """
    Given a session config dict, return the full proxy config dict (from proxies.yaml) if a label is set,
    or the inline proxy config if present (for backward compatibility).
    Returns None if no proxy is set.
    """
    proxy = cfg.get("proxy", {})
    if isinstance(proxy, dict) and "label" in proxy:
        proxies = load_proxies()
        label = proxy["label"]
        return proxies.get(label)
    # fallback: legacy inline proxy config
    if proxy.get("host"):
        return proxy
    return None
import os
import yaml
import threading

PROXIES_PATH = "/config/proxies.yaml"
LOCK = threading.Lock()

def load_proxies():
    if not os.path.exists(PROXIES_PATH):
        return {}
    with LOCK, open(PROXIES_PATH, "r") as f:
        proxies = yaml.safe_load(f) or {}
    return proxies

def save_proxies(proxies):
    os.makedirs(os.path.dirname(PROXIES_PATH), exist_ok=True)
    with LOCK, open(PROXIES_PATH, "w") as f:
        yaml.safe_dump(proxies, f)
