"""Utilities to automate purchases of perks (upload credit, VIP, wedges) via the MaM API.

Functions handle proxy configuration, make HTTP requests to the MaM JSON API,
and return structured result dictionaries.
"""

import logging
import time
from typing import Any

import aiohttp

from backend.utils import build_proxy_dict

_logger: logging.Logger = logging.getLogger(__name__)


async def buy_upload_credit(
    gb: int, mam_id: str | None = None, proxy_cfg: dict[str, Any] | None = None
) -> dict[str, Any]:
    """Purchase upload credit via the MaM API. Returns a result dict.

    mam_id: required session cookie for authentication
    proxy_cfg: optional proxy config dict
    """
    try:
        if not mam_id:
            return {
                "success": False,
                "error": "mam_id (cookie) required for upload credit purchase",
                "gb": gb,
            }
        timestamp = int(time.time() * 1000)
        url = f"https://www.myanonamouse.net/json/bonusBuy.php/?spendtype=upload&amount={gb}&_={timestamp}"
        cookies = {"mam_id": mam_id}
        proxies = None
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        if proxy_cfg is not None:
            proxies = build_proxy_dict(proxy_cfg)
            if proxies:
                proxy_label = proxy_cfg.get("label") if proxy_cfg else None
                proxy_url_log = {
                    k: v.replace(proxy_cfg.get("password", ""), "***")
                    if proxy_cfg and proxy_cfg.get("password")
                    else v
                    for k, v in proxies.items()
                }
                _logger.debug(
                    "[buy_upload_credit] Using proxy label: %s, proxies: %s",
                    proxy_label,
                    proxy_url_log,
                )
        _logger.debug("[buy_upload_credit] Making request to: %s", url)
        proxy_url = None
        proxy_auth = None
        if proxy_cfg is not None:
            proxies = build_proxy_dict(proxy_cfg)
            proxy_url = (
                proxies.get("https")
                if proxies and proxies.get("https")
                else (proxies.get("http") if proxies else None)
            )
            username = proxy_cfg.get("username") if proxy_cfg else None
            password = proxy_cfg.get("password") if proxy_cfg else None
            if username and password:
                proxy_auth = aiohttp.BasicAuth(username, password)

        timeout = aiohttp.ClientTimeout(total=10)
        async with (
            aiohttp.ClientSession(timeout=timeout) as session,
            session.get(
                url, cookies=cookies, proxy=proxy_url, proxy_auth=proxy_auth, headers=headers
            ) as resp,
        ):
            _logger.debug("[buy_upload_credit] Response: status=%s", resp.status)
            if resp.status != 200:
                text = await resp.text()
                return {
                    "success": False,
                    "error": f"HTTP {resp.status}",
                    "gb": gb,
                    "raw_response": text[:500],
                    "status_code": resp.status,
                }
            try:
                data = await resp.json()
            except Exception as json_e:
                text = await resp.text()
                return {
                    "success": False,
                    "error": f"MaM API did not return valid JSON: {json_e}. Response: {text[:200]}",
                    "gb": gb,
                }
        if data.get("success") or data.get("Success"):
            return {"success": True, "gb": gb, "response": data}
    except Exception as e:
        _logger.error("[buy_upload_credit] Exception: %s", e)
        return {"success": False, "error": str(e), "gb": gb}
    else:
        return {"success": False, "gb": gb, "response": data}


async def buy_vip(
    mam_id: str, duration: str = "max", proxy_cfg: dict[str, Any] | None = None
) -> dict[str, Any]:
    """Purchase VIP status via the MaM API. Returns a result dict.

    mam_id: required session cookie for authentication
    duration: 'max', '4', '8', etc. (string)
    proxy_cfg: optional proxy config dict
    """

    timestamp = int(time.time() * 1000)
    url = "https://www.myanonamouse.net/json/bonusBuy.php/"
    params: dict[str, Any] = {"spendtype": "VIP", "duration": duration, "_": timestamp}
    cookies = {"mam_id": mam_id}
    proxies = None
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "Accept-Language": "en-US,en;q=0.5",
        "Referer": "https://www.myanonamouse.net/store.php",
    }
    if proxy_cfg is not None:
        proxies = build_proxy_dict(proxy_cfg)
        if proxies:
            proxy_label = proxy_cfg.get("label") if proxy_cfg else None
            proxy_url_log = {
                k: v.replace(proxy_cfg.get("password", ""), "***")
                if proxy_cfg and proxy_cfg.get("password")
                else v
                for k, v in proxies.items()
            }
            _logger.debug(
                "[buy_vip] Using proxy label: %s, proxies: %s", proxy_label, proxy_url_log
            )
    try:
        _logger.debug("[buy_vip] Making request to: %s with params: %s", url, params)
        proxy_url = None
        proxy_auth = None
        if proxy_cfg is not None:
            proxies = build_proxy_dict(proxy_cfg)
            proxy_url = (
                proxies.get("https")
                if proxies and proxies.get("https")
                else (proxies.get("http") if proxies else None)
            )
            username = proxy_cfg.get("username") if proxy_cfg else None
            password = proxy_cfg.get("password") if proxy_cfg else None
            if username and password:
                proxy_auth = aiohttp.BasicAuth(username, password)

        timeout = aiohttp.ClientTimeout(total=10)
        async with (
            aiohttp.ClientSession(timeout=timeout) as session,
            session.get(
                url,
                params=params,
                cookies=cookies,
                proxy=proxy_url,
                proxy_auth=proxy_auth,
                headers=headers,
            ) as resp,
        ):
            _logger.debug("[buy_vip] Response: status=%s", resp.status)
            if resp.status != 200:
                text = await resp.text()
                return {
                    "success": False,
                    "error": f"HTTP {resp.status}",
                    "raw_response": text[:500],
                    "status_code": resp.status,
                }
            try:
                data = await resp.json()
            except Exception as json_e:
                text = await resp.text()
                return {
                    "success": False,
                    "error": f"Non-JSON response: {json_e}",
                    "raw_response": text[:500],
                    "status_code": resp.status,
                }
            if data.get("success") or data.get("Success"):
                return {"success": True, "response": data}
    except Exception as e:
        _logger.error("[buy_vip] Exception: %s", e)
        return {"success": False, "error": str(e)}
    else:
        return {"success": False, "response": data}


async def buy_wedge(
    mam_id: str, method: str = "points", proxy_cfg: dict[str, Any] | None = None
) -> dict[str, Any]:
    """Purchase a wedge using points or cheese via the MaM API.

    method: "points" or "cheese"
    proxy_cfg: optional proxy config dict
    """
    if method not in ("points", "cheese"):
        return {"success": False, "error": f"Unsupported wedge purchase method: {method}"}

    timestamp = int(time.time() * 1000)
    url = f"https://www.myanonamouse.net/json/bonusBuy.php/?spendtype=wedges&source={method}&_={timestamp}"
    cookies = {"mam_id": mam_id}
    proxies = None
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "Accept-Language": "en-US,en;q=0.5",
        "Referer": "https://www.myanonamouse.net/store.php",
    }
    if proxy_cfg is not None:
        proxies = build_proxy_dict(proxy_cfg)
        if proxies:
            proxy_label = proxy_cfg.get("label") if proxy_cfg else None
            proxy_url_log = {
                k: v.replace(proxy_cfg.get("password", ""), "***")
                if proxy_cfg and proxy_cfg.get("password")
                else v
                for k, v in proxies.items()
            }
            _logger.debug(
                "[buy_wedge] Using proxy label: %s, proxies: %s", proxy_label, proxy_url_log
            )
    try:
        _logger.debug("[buy_wedge] Making request to: %s", url)
        proxy_url = None
        proxy_auth = None
        if proxy_cfg is not None:
            proxies = build_proxy_dict(proxy_cfg)
            proxy_url = (
                proxies.get("https")
                if proxies and proxies.get("https")
                else (proxies.get("http") if proxies else None)
            )
            username = proxy_cfg.get("username") if proxy_cfg else None
            password = proxy_cfg.get("password") if proxy_cfg else None
            if username and password:
                proxy_auth = aiohttp.BasicAuth(username, password)

        timeout = aiohttp.ClientTimeout(total=10)
        async with (
            aiohttp.ClientSession(timeout=timeout) as session,
            session.get(
                url, cookies=cookies, proxy=proxy_url, proxy_auth=proxy_auth, headers=headers
            ) as resp,
        ):
            _logger.debug("[buy_wedge] Response: status=%s", resp.status)
            if resp.status != 200:
                text = await resp.text()
                return {
                    "success": False,
                    "error": f"HTTP {resp.status}",
                    "raw_response": text[:500],
                    "status_code": resp.status,
                }
            try:
                data = await resp.json()
            except Exception as json_e:
                text = await resp.text()
                return {
                    "success": False,
                    "error": f"Non-JSON response: {json_e}",
                    "raw_response": text[:500],
                    "status_code": resp.status,
                }
            if data.get("success") or data.get("Success"):
                return {"success": True, "response": data}
    except Exception as e:
        _logger.error("[buy_wedge] Exception: %s", e)
        return {"success": False, "error": str(e)}
    else:
        return {"success": False, "response": data}
