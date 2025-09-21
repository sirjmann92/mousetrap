"""Proxy configuration helpers.

This module manages loading and saving proxy definitions from a YAML file
mounted at `PROXIES_PATH`. It provides a small compatibility helper to
resolve inline proxy configs from session configuration structures.
"""

import logging
from pathlib import Path
import threading

import yaml

PROXIES_PATH = "/config/proxies.yaml"
LOCK = threading.Lock()
logger: logging.Logger = logging.getLogger(__name__)


def resolve_proxy_from_session_cfg(cfg):
    """Given a session config dict, return the full proxy config dict (from proxies.yaml) if a label is set,
    or the inline proxy config if present (for backward compatibility).
    Returns None if no proxy is set.
    """

    proxy = cfg.get("proxy", {})
    logger.debug("[resolve_proxy_from_session_cfg] Input cfg proxy: %s", proxy)
    if isinstance(proxy, dict) and "label" in proxy:
        proxies = load_proxies()
        label = proxy["label"]
        resolved = proxies.get(label)
        logger.debug(
            "[resolve_proxy_from_session_cfg] Looking up label '%s' in proxies.yaml. Resolved: %s",
            label,
            resolved,
        )
        return resolved
    # fallback: legacy inline proxy config
    if proxy.get("host"):
        logger.debug("[resolve_proxy_from_session_cfg] Using inline proxy config: %s", proxy)
        return proxy
    logger.debug("[resolve_proxy_from_session_cfg] No proxy config found.")
    return None


def load_proxies():
    """Load proxies from PROXIES_PATH.

    Returns a dict parsed from YAML or an empty dict if the file does not
    exist or is empty. The LOCK is used to synchronize file access.
    """
    if not Path(PROXIES_PATH).exists():
        return {}
    with LOCK, Path(PROXIES_PATH).open() as f:
        return yaml.safe_load(f) or {}


def save_proxies(proxies):
    """Persist the given proxies mapping to PROXIES_PATH as YAML.

    Ensures the parent directory exists before attempting to write. Uses
    the LOCK to synchronize concurrent access.
    """
    Path(PROXIES_PATH).parent.mkdir(parents=True, exist_ok=True)
    with LOCK, Path(PROXIES_PATH).open("w") as f:
        yaml.safe_dump(proxies, f)
