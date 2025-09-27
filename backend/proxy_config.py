"""Proxy configuration helpers.

This module manages loading and saving proxy definitions from a YAML file
mounted at `PROXIES_PATH`. It provides a small compatibility helper to
resolve inline proxy configs from session configuration structures.
"""

import logging
from pathlib import Path
import threading
import time
from typing import Any

import yaml

PROXIES_PATH = "/config/proxies.yaml"
_LOCK = threading.Lock()
_logger: logging.Logger = logging.getLogger(__name__)
_last_resolve_log_time: dict[str, float] = {}
# Minimum seconds between identical resolve debug logs per proxy label/key
_resolve_log_min_interval = 60


def resolve_proxy_from_session_cfg(cfg: dict[str, Any]) -> dict[str, Any] | None:
    """Given a session config dict, return the full proxy config dict (from proxies.yaml) if a label is set,
    or the inline proxy config if present (for backward compatibility).
    Returns None if no proxy is set.
    """

    proxy = cfg.get("proxy", {})
    # Rate-limit debug logs to avoid flooding when this resolver is called frequently
    log_key = None
    try:
        if isinstance(proxy, dict) and proxy.get("label"):
            log_key = f"label:{proxy.get('label')}"
        elif isinstance(proxy, dict) and proxy.get("host"):
            log_key = f"inline:{proxy.get('host')}"
        else:
            log_key = "no_proxy"
    except Exception:
        log_key = "resolve_unknown"
    now = time.monotonic()
    last = _last_resolve_log_time.get(log_key, 0.0)
    if now - last >= _resolve_log_min_interval:
        _logger.debug("[resolve_proxy_from_session_cfg] Input cfg proxy: %s", proxy)
        _last_resolve_log_time[log_key] = now
    if isinstance(proxy, dict) and "label" in proxy:
        proxies = load_proxies()
        label = proxy["label"]
        resolved = proxies.get(label)
        # Rate-limit the resolved-label debug message using the same log key
        now = time.monotonic()
        lookup_key = f"label_lookup:{label}"
        last_lookup = _last_resolve_log_time.get(lookup_key, 0)
        if now - last_lookup >= _resolve_log_min_interval:
            _logger.debug(
                "[resolve_proxy_from_session_cfg] Looking up label '%s' in proxies.yaml. Resolved: %s",
                label,
                resolved,
            )
            _last_resolve_log_time[lookup_key] = now
        return resolved
    # fallback: legacy inline proxy config
    if proxy.get("host"):
        # Inline proxy use - rate-limit the log similarly
        now = time.monotonic()
        inline_key = f"inline:{proxy.get('host')}"
        last_inline = _last_resolve_log_time.get(inline_key, 0)
        if now - last_inline >= _resolve_log_min_interval:
            _logger.debug("[resolve_proxy_from_session_cfg] Using inline proxy config: %s", proxy)
            _last_resolve_log_time[inline_key] = now
        return proxy
    # No proxy configured - rate-limit the log
    now = time.monotonic()
    last_no = _last_resolve_log_time.get("no_proxy", 0.0)
    if now - last_no >= _resolve_log_min_interval:
        _logger.debug("[resolve_proxy_from_session_cfg] No proxy config found.")
        _last_resolve_log_time["no_proxy"] = now
    return None


def load_proxies() -> dict[str, Any]:
    """Load proxies from PROXIES_PATH.

    Returns a dict parsed from YAML or an empty dict if the file does not
    exist or is empty. The _LOCK is used to synchronize file access.
    """
    try:
        with _LOCK, Path(PROXIES_PATH).open(encoding="utf-8") as f:
            return yaml.safe_load(f) or {}
    except FileNotFoundError:
        return {}
    except yaml.YAMLError as e:
        _logger.warning("[load_proxies] Malformed YAML at %s: %s", PROXIES_PATH, e)
        return {}


def save_proxies(proxies: dict[str, Any]) -> None:
    """Persist the given proxies mapping to PROXIES_PATH as YAML.

    Ensures the parent directory exists before attempting to write. Uses
    the _LOCK to synchronize concurrent access.
    """
    Path(PROXIES_PATH).parent.mkdir(parents=True, exist_ok=True)
    with _LOCK, Path(PROXIES_PATH).open("w", encoding="utf-8") as f:
        yaml.safe_dump(proxies, f)
