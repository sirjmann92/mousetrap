"""Utilities to automate purchases of perks (upload credit, VIP) via the MaM API.

Functions handle proxy configuration, make HTTP requests to the MaM JSON API,
and return structured result dictionaries.
"""

from collections.abc import Mapping
from datetime import UTC, datetime, timedelta
import logging
import time
from typing import Any

import aiohttp

from backend.utils import build_proxy_dict

_logger: logging.Logger = logging.getLogger(__name__)

# MaM refuses any API purchase that would add less than a full week of VIP:
# "Min VIP is 1 week purchased for Automated methods". It counts a purchase made
# through a tool like MouseTrap as automated even when a person clicked the
# button, so this applies to manual purchases too.
VIP_MIN_PURCHASE_DAYS = 7

# MaM caps VIP at 90 days. The API does not report the cap, but MaM's store API
# and documentation both state it, and a purchase refused with 89.36 days banked
# (github.com/sirjmann92/mousetrap/issues/145) is consistent with it. MaM
# displays VIP in weeks, which is presentation only; the cap itself is in days.
VIP_CAP_DAYS = 90

# Above this much VIP remaining, a purchase cannot add the required week.
VIP_PURCHASE_BLOCK_ABOVE_DAYS = VIP_CAP_DAYS - VIP_MIN_PURCHASE_DAYS

# Format of the `vip_until` field in a jsonLoad.php response, in UTC. Confirmed
# against a live account: MaM's own "weeks remaining" figure reproduces exactly
# when the value is read as UTC.
_VIP_UNTIL_FORMAT = "%Y-%m-%d %H:%M:%S"


def vip_days_remaining(
    raw: Mapping[str, Any] | None, *, now: datetime | None = None
) -> float | None:
    """Days of VIP left according to MaM's ``vip_until``.

    ``vip_until`` is an absolute timestamp, so a value read from a cached status
    stays accurate without refetching; the remaining time is simply measured
    against the current clock.

    Args:
        raw: The ``raw`` jsonLoad.php payload from a status check, or None.
        now: Instant to measure from. Defaults to the current UTC time.

    Returns:
        Days remaining as a float, negative when VIP has lapsed, or None when
        the field is missing or unparseable so callers can skip the check
        rather than guess.
    """
    if not isinstance(raw, Mapping):
        return None
    vip_until = raw.get("vip_until")
    if not isinstance(vip_until, str) or not vip_until.strip():
        return None
    try:
        expires = datetime.strptime(vip_until.strip(), _VIP_UNTIL_FORMAT).replace(tzinfo=UTC)
    except ValueError:
        _logger.debug("[vip_days_remaining] Unparseable vip_until: %r", vip_until)
        return None
    return (expires - (now or datetime.now(UTC))).total_seconds() / 86400


def vip_purchase_block_reason(raw: Mapping[str, Any] | None, *, now: datetime | None = None) -> str:
    """Explain why a VIP purchase would be refused for having too much banked.

    Args:
        raw: The ``raw`` jsonLoad.php payload from a status check, or None.
        now: Instant to measure from. Defaults to the current UTC time.

    Returns:
        A reason naming when the purchase becomes possible, or an empty string
        when the purchase should be attempted. Unknown remaining time yields an
        empty string, so a missing field never blocks a purchase.
    """
    remaining = vip_days_remaining(raw, now=now)
    if remaining is None or remaining <= VIP_PURCHASE_BLOCK_ABOVE_DAYS:
        return ""
    eligible_at = (now or datetime.now(UTC)) + timedelta(
        days=remaining - VIP_PURCHASE_BLOCK_ABOVE_DAYS
    )
    return (
        f"VIP has {remaining:.1f} days remaining, and MaM refuses an automated "
        f"purchase that would add less than {VIP_MIN_PURCHASE_DAYS} days. "
        f"Eligible from {eligible_at.strftime('%Y-%m-%d %H:%M')} UTC."
    )


def _rejection_reason(data: Any) -> str:
    """Extract the reason MaM refused a purchase from a 200-OK rejection body.

    bonusBuy.php reports refusals as ``{"success": false, "error": "..."}`` with
    an HTTP 200, so the reason lives in the body rather than the status line.
    Callers read the returned dict's ``error`` key, so the message has to be
    lifted out of the response here or it is lost entirely.

    Args:
        data: Decoded JSON body from bonusBuy.php. Usually a dict, but MaM is
            not obliged to return one.

    Returns:
        MaM's own wording when it supplied a usable message, otherwise a
        generic fallback so callers never report an empty reason.
    """
    if isinstance(data, dict):
        for key in ("error", "Error", "msg", "message"):
            value = data.get(key)
            if isinstance(value, str) and value.strip():
                return value.strip()
    return "MaM refused the purchase without giving a reason."


# Every bonusBuy.php purchase presents this one browser identity.
_BONUS_HEADERS: dict[str, str] = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
    "Accept": "application/json, text/javascript, */*; q=0.01",
    "Accept-Language": "en-US,en;q=0.5",
    "Referer": "https://www.myanonamouse.net/store.php",
}


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
                url, cookies=cookies, proxy=proxy_url, proxy_auth=proxy_auth, headers=_BONUS_HEADERS
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
        return {
            "success": False,
            "error": _rejection_reason(data),
            "gb": gb,
            "response": data,
        }


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
                headers=_BONUS_HEADERS,
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
        return {"success": False, "error": _rejection_reason(data), "response": data}
