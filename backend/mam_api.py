"""Utilities for interacting with the MyAnonamouse (MaM) API and performing IP/proxy lookups.

This module provides helper functions to query MaM for user status, simulate purchases,
and resolve public IP/ASN information through optional proxy configurations.
"""

import json
import logging
import os
from typing import Any

import aiohttp

from backend.utils import build_proxy_dict

_logger: logging.Logger = logging.getLogger(__name__)


async def get_proxied_public_ip(proxy_cfg: dict) -> str | None:
    """Returns the public IP as seen through the given proxy config."""
    proxies = build_proxy_dict(proxy_cfg)
    if not proxies:
        return None
    try:
        proxy_url = (
            proxies.get("https") or proxies.get("http") if isinstance(proxies, dict) else None
        )
        try:
            timeout = aiohttp.ClientTimeout(total=10)
            async with (
                aiohttp.ClientSession(timeout=timeout) as session,
                session.get("https://api.ipify.org", timeout=timeout, proxy=proxy_url) as resp,
            ):
                text = await resp.text()
                if resp.status == 200:
                    return text.strip()
        except Exception as e:
            _logger.warning("[get_proxied_public_ip] Failed: %s", e)
            return None
    except Exception as e:
        # Defensive: preserve original behavior on unexpected errors
        _logger.warning("[get_proxied_public_ip] Failed: %s", e)
        return None
    return None


async def get_proxied_public_ip_and_asn(proxy_cfg: dict[str, Any]) -> tuple[str | None, str | None]:
    """Returns (public_ip, asn) as seen through the given proxy config, using ipinfo.io and the API token if available."""
    proxies = build_proxy_dict(proxy_cfg)
    token = os.environ.get("IPINFO_TOKEN")
    url = "https://ipinfo.io/json"
    if token:
        url += f"?token={token}"
    proxy_url = proxies.get("https") or proxies.get("http") if isinstance(proxies, dict) else None
    try:
        timeout = aiohttp.ClientTimeout(total=10)
        async with (
            aiohttp.ClientSession(timeout=timeout) as session,
            session.get(url, timeout=timeout, proxy=proxy_url) as resp,
        ):
            text = await resp.text()
            if resp.status == 200:
                try:
                    data = json.loads(text)
                except Exception as je:
                    _logger.warning("[get_proxied_public_ip_and_asn] JSON parse failed: %s", je)
                    return None, None
                ip = data.get("ip")
                asn = data.get("org", "Unknown ASN")
                return ip, asn
    except Exception as e:
        _logger.warning("[get_proxied_public_ip_and_asn] Failed: %s", e)
        return None, None
    return None, None


async def get_status(mam_id: str, proxy_cfg: dict[str, Any] | None = None) -> dict[str, Any]:
    """Fetch MaM account status using the provided mam_id and optional proxy configuration.

    Parameters
    ----------
    mam_id : str
        MaM session cookie value to identify the user. If None, the function returns a dict indicating
        that no MaM ID was provided.
    proxy_cfg : dict or None
        Optional proxy configuration passed to backend.utils.build_proxy_dict; used for outgoing HTTP requests.

    Returns
    -------
    dict
        A dictionary with keys:
            - mam_cookie_exists (bool): whether a mam_id was provided and a successful response was obtained.
            - points: seedbonus value or None.
            - wedge_active: wedge status (bool) or None.
            - vip_active: vip status (bool) or None.
            - message: present when there is an error or missing mam_id.
            - raw: the raw JSON response when successful.

    Notes
    -----
    Network and JSON parsing exceptions are caught and returned as a message in the result dict rather than
    being raised to the caller.

    """
    if not mam_id:
        return {
            "mam_cookie_exists": False,
            "points": None,
            "cheese": None,
            "wedge_active": None,
            "vip_active": None,
            "message": "No MaM ID provided.",
        }
    url = "https://www.myanonamouse.net/jsonLoad.php?snatch_summary"
    cookies = {"mam_id": mam_id}
    if proxy_cfg:
        proxies = build_proxy_dict(proxy_cfg)
    # Log only proxy label and redact password in proxy URL for debugging
    proxy_label = None
    proxy_url_log = None
    if proxies:
        proxy_label = proxy_cfg.get("label") if proxy_cfg else None
        proxy_url_log = {
            k: v.replace(proxy_cfg.get("password", ""), "***")
            if proxy_cfg and proxy_cfg.get("password")
            else v
            for k, v in proxies.items()
        }
        _logger.debug("[get_status] Using proxy label: %s, proxies: %s", proxy_label, proxy_url_log)
    try:
        timeout = aiohttp.ClientTimeout(total=10)
        proxy_url = (
            proxies.get("https") or proxies.get("http") if isinstance(proxies, dict) else None
        )
        async with (
            aiohttp.ClientSession(cookies=cookies) as session,
            session.get(url, timeout=timeout, proxy=proxy_url) as resp,
        ):
            # Handle HTTP errors similarly to requests.raise_for_status
            if resp.status >= 400:
                if resp.status == 403:
                    _logger.warning(
                        "[get_status] 403 Forbidden for url: %s | proxy_label: %s | proxies: %s | cookies: %s",
                        url,
                        proxy_label,
                        proxy_url_log,
                        cookies,
                    )
                else:
                    _logger.warning(
                        "[get_status] HTTP error %s for url: %s | proxy_label: %s | proxies: %s | cookies: %s",
                        resp.status,
                        url,
                        proxy_label,
                        proxy_url_log,
                        cookies,
                    )
                raise Exception(f"HTTP {resp.status}")
            text = await resp.text()
            try:
                data = json.loads(text)
            except Exception as json_e:
                return {
                    "mam_cookie_exists": False,
                    "points": None,
                    "cheese": None,
                    "wedge_active": None,
                    "vip_active": None,
                    "message": f"MaM API did not return valid JSON: {json_e}. Response: {text[:200]}",
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

    except Exception as e:
        return {
            "mam_cookie_exists": False,
            "points": None,
            "cheese": None,
            "wedge_active": None,
            "vip_active": None,
            "message": f"Failed to fetch status: {e}",
        }
    else:
        # Do not set a default message here; let the main logic in app.py set the status_message
        return {
            "mam_cookie_exists": True,
            "points": points,
            "wedge_active": wedge_active,
            "vip_active": vip_active,
            # No 'message' key unless there is an error
            "raw": data,
        }


def dummy_purchase(item: Any) -> dict[str, Any]:
    """Simulate a purchase action for testing.

    Parameters
    ----------
    item : Any
        Identifier or description of the item to "purchase".

    Returns
    -------
    dict
        A dictionary describing the simulated purchase with keys:
        - result: "success" or "failure"
        - item: the provided item
        - message: human-readable message about the simulated purchase

    """

    return {
        "result": "success",
        "item": item,
        "message": f"Dummy purchase of {item} completed (stub).",
    }


async def get_mam_seen_ip_info(mam_id: str, proxy_cfg: dict[str, Any]) -> dict[str, Any]:
    """Calls MAM's /json/jsonIp.php endpoint to get the IP, ASN, and AS as seen by MAM for the session/cookie.

    Returns dict: {"ip": str, "ASN": int, "AS": str} or error info.
    """
    if not mam_id:
        return {"error": "No MaM ID provided."}
    url = "https://t.myanonamouse.net/json/jsonIp.php"
    cookies = {"mam_id": mam_id}
    proxies = build_proxy_dict(proxy_cfg)
    timeout = aiohttp.ClientTimeout(total=10)
    proxy_url = proxies.get("https") or proxies.get("http") if isinstance(proxies, dict) else None
    try:
        async with (
            aiohttp.ClientSession(cookies=cookies) as session,
            session.get(url, timeout=timeout, proxy=proxy_url) as resp,
        ):
            if resp.status >= 400:
                text = await resp.text()
                raise Exception(f"HTTP {resp.status}: {text}")
            data = await resp.json()

    except Exception as e:
        return {"error": f"Failed to fetch MAM-seen IP info: {e}"}
    else:
        return data
