"""Millionaire's Vault cookie validation and management utilities."""

import asyncio
import logging
import re
import time
from typing import Any
import urllib.parse

import aiohttp

from backend.config import list_sessions, load_session
from backend.mam_api import get_status
from backend.utils import build_proxy_dict

_logger: logging.Logger = logging.getLogger(__name__)


def build_browser_cookies_from_session(session_config: dict, browser_mam_id: str) -> str:
    """Build browser cookie string using browser mam_id + existing uid from session data.

    Args:
        session_config: Session configuration containing last_status with uid
        browser_mam_id: Browser mam_id (different from seedbox mam_id)

    Returns:
        Properly formatted cookie string: "mam_id=browser_value; uid=session_uid"
    """
    if not browser_mam_id:
        return ""

    # Extract uid from existing session data
    uid = session_config.get("last_status", {}).get("raw", {}).get("uid")

    if not uid:
        return ""

    return f"mam_id={browser_mam_id}; uid={uid}"


def parse_browser_mam_id(cookie_string_or_mam_id: str) -> str:
    """Extract just the browser mam_id from either a full cookie string or standalone mam_id.

    Args:
        cookie_string_or_mam_id: Either "mam_id=value; uid=value" or just "mam_id_value"

    Returns:
        Just the mam_id value
    """
    if not cookie_string_or_mam_id:
        return ""

    # If it looks like a cookie string, parse it
    if ";" in cookie_string_or_mam_id and "=" in cookie_string_or_mam_id:
        cookies = parse_browser_cookies(cookie_string_or_mam_id)
        return cookies.get("mam_id", "")

    # Otherwise treat as standalone mam_id
    return cookie_string_or_mam_id.strip()


def get_browser_headers(browser_type: str = "chrome") -> dict[str, Any]:
    """Get appropriate headers for the specified browser including User-Agent and Accept headers.

    Args:
        browser_type: Browser type (firefox, chrome, edge, safari, opera)

    Returns:
        Dict of headers matching the browser fingerprint
    """
    browser_headers = {
        "firefox": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate, br",
            "DNT": "1",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
        },
        "chrome": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            "sec-ch-ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
        },
        "edge": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            "sec-ch-ua": '"Not_A Brand";v="8", "Chromium";v="120", "Microsoft Edge";v="120"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
        },
        "safari": {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
        },
        "opera": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
        },
    }

    browser_type = browser_type.lower()
    headers = browser_headers.get(browser_type, browser_headers["chrome"])

    _logger.info(
        "[get_browser_headers] Using headers for %s: User-Agent: %s...",
        browser_type,
        headers["User-Agent"][:50],
    )
    return headers


def get_browser_user_agent(browser_type: str = "chrome") -> str:
    """Get appropriate user agent string for the specified browser (backwards compatibility).

    Args:
        browser_type: Browser type (firefox, chrome, edge, safari, opera)

    Returns:
        User agent string matching the browser
    """
    headers = get_browser_headers(browser_type)
    return headers["User-Agent"]


def parse_browser_cookies(cookie_string: str) -> dict[str, str]:
    """Parse browser cookie string into mam_id, uid, and browser components.

    Args:
        cookie_string: Cookie string like "mam_id=value; uid=value; browser=firefox"

    Returns:
        Dict containing mam_id, uid, and browser values
    """

    cookies = {
        "mam_id": "",
        "uid": "",
        "browser": "chrome",
    }  # Default to chrome for backward compatibility
    if not cookie_string:
        return cookies

    try:
        # Split by semicolon and extract key=value pairs
        for part in cookie_string.split(";"):
            part = part.strip()
            if "=" in part:
                key, value = part.split("=", 1)
                key = key.strip()
                value = value.strip()
                if key in ["mam_id", "uid", "browser"]:
                    # URL decode the value in case it's encoded from bookmarklet
                    if key == "mam_id":
                        value = urllib.parse.unquote(value)
                    cookies[key] = value

        _logger.debug("[parse_browser_cookies] Parsed cookies: %s", list(cookies.keys()))
    except Exception as e:
        _logger.error("[parse_browser_cookies] Error parsing cookie string: %s", e)

    return cookies


async def validate_browser_mam_id(
    browser_mam_id: str, session_config: dict, proxy_cfg: dict[str, Any] | None = None
) -> dict[str, Any]:
    """Validate browser mam_id by combining with existing session UID and testing vault access.

    Args:
        browser_mam_id: Browser mam_id value
        session_config: Session configuration containing uid and vault preferences
        proxy_cfg: Proxy configuration if needed

    Returns:
        Dict with validation results
    """
    result = {
        "valid": False,
        "has_browser_mam_id": False,
        "has_session_uid": False,
        "vault_accessible": False,
        "cookie_string": "",
        "error": None,
    }

    try:
        # Check if we have browser mam_id
        result["has_browser_mam_id"] = bool(browser_mam_id)

        # Get UID from existing session data
        uid = session_config.get("last_status", {}).get("raw", {}).get("uid")
        result["has_session_uid"] = bool(uid)

        if not result["has_browser_mam_id"]:
            result["error"] = "Browser mam_id is required"
            return result

        if not result["has_session_uid"]:
            result["error"] = "Session UID not found. Please refresh session status first."
            return result

        # Parse cookies to detect browser type if available
        parsed_cookies = parse_browser_cookies(browser_mam_id)
        browser_type = parsed_cookies.get("browser", "chrome")  # Default to chrome
        actual_mam_id = parsed_cookies.get("mam_id") or browser_mam_id

        # Build full cookie string using extracted values
        cookie_string = f"mam_id={actual_mam_id}; uid={uid}"
        result["cookie_string"] = cookie_string

        _logger.debug(
            "[validate_browser_mam_id] Testing browser_mam_id with session UID %s, browser: %s",
            uid,
            browser_type,
        )

        # Parse cookies for validation
        cookies = {"mam_id": actual_mam_id, "uid": str(uid)}

        # Use auto vault connection method (try direct first, then proxy fallback)
        vault_method = "auto"

        # Use browser-specific headers to prevent logout
        headers = {"User-Agent": get_browser_user_agent(browser_type)}

        vault_url = "https://www.myanonamouse.net/millionaires/donate.php"

        if vault_method == "proxy":
            # Only try proxy
            return await _try_vault_access_proxy(vault_url, cookies, headers, proxy_cfg, result)
        if vault_method == "direct":
            # Only try direct
            return await _try_vault_access_direct(vault_url, cookies, headers, result)
        # Auto mode - try direct first, then proxy
        return await _try_vault_access_auto(vault_url, cookies, headers, proxy_cfg, result)

    except Exception as e:
        result["error"] = f"Validation error: {e!s}"
        _logger.error("[validate_browser_mam_id] Exception: %s", e)

    return result


async def _try_vault_access_direct(
    vault_url: str, cookies: dict, headers: dict, result: dict
) -> dict[str, Any]:
    """Try vault access via direct connection."""
    try:
        _logger.info("[validate_browser_mam_id] Attempting vault access via direct connection")

        timeout = aiohttp.ClientTimeout(total=10)
        async with (
            aiohttp.ClientSession(timeout=timeout) as session,
            session.get(vault_url, cookies=cookies, headers=headers) as resp,
        ):
            _logger.info("[validate_browser_mam_id] Direct access result: status=%s", resp.status)

            if resp.status == 200:
                html = (await resp.text()).lower()

                has_login_form = 'type="password"' in html or 'name="password"' in html
                has_login_text = "login" in html and ("username" in html or "password" in html)
                has_vault_terms = any(
                    term in html
                    for term in ["donation", "millionaire", "vault", "contribute", "donate"]
                )

                _logger.info(
                    "[validate_browser_mam_id] Direct access analysis: login_form=%s, login_text=%s, vault_terms=%s",
                    has_login_form,
                    has_login_text,
                    has_vault_terms,
                )

                if not (has_login_form or has_login_text) and has_vault_terms:
                    result["vault_accessible"] = True
                    result["valid"] = True
                    result["access_method"] = "direct"
                    _logger.info(
                        "[validate_browser_mam_id] Vault access successful via direct connection!"
                    )
                else:
                    result["error"] = (
                        "Direct connection failed - browser MAM ID may be tied to different IP"
                    )
            else:
                result["error"] = f"Direct connection HTTP {resp.status}"

    except Exception as e:
        result["error"] = f"Direct connection failed: {e!s}"
        _logger.warning("[validate_browser_mam_id] Direct access failed: %s", e)

    return result


async def _try_vault_access_proxy(
    vault_url: str, cookies: dict, headers: dict, proxy_cfg: dict[str, Any] | None, result: dict
) -> dict[str, Any]:
    """Try vault access via proxy connection."""
    try:
        if not proxy_cfg:
            result["error"] = "Proxy method selected but no proxy configured"
            return result

        proxies = build_proxy_dict(proxy_cfg)
        if not proxies:
            result["error"] = "Proxy method selected but proxy configuration invalid"
            return result

        _logger.info("[validate_browser_mam_id] Attempting vault access via proxy")

        proxy_url = proxies.get("https") or proxies.get("http")

        timeout = aiohttp.ClientTimeout(total=10)
        async with (
            aiohttp.ClientSession(timeout=timeout) as session,
            session.get(vault_url, cookies=cookies, headers=headers, proxy=proxy_url) as resp,
        ):
            _logger.info("[validate_browser_mam_id] Proxy access result: status=%s", resp.status)

            if resp.status == 200:
                html = (await resp.text()).lower()

                has_login_form = 'type="password"' in html or 'name="password"' in html
                has_login_text = "login" in html and ("username" in html or "password" in html)
                has_vault_terms = any(
                    term in html
                    for term in ["donation", "millionaire", "vault", "contribute", "donate"]
                )

                _logger.info(
                    "[validate_browser_mam_id] Proxy access analysis: login_form=%s, login_text=%s, vault_terms=%s",
                    has_login_form,
                    has_login_text,
                    has_vault_terms,
                )

                if not (has_login_form or has_login_text) and has_vault_terms:
                    result["vault_accessible"] = True
                    result["valid"] = True
                    result["access_method"] = "proxy"
                    _logger.info("[validate_browser_mam_id] Vault access successful via proxy!")
                else:
                    result["error"] = (
                        "Proxy connection failed - browser MAM ID may not work with this proxy IP"
                    )
            else:
                result["error"] = f"Proxy connection HTTP {resp.status}"

    except Exception as e:
        result["error"] = f"Proxy connection failed: {e!s}"
        _logger.warning("[validate_browser_mam_id] Proxy access failed: %s", e)

    return result


async def _try_vault_access_auto(
    vault_url: str, cookies: dict, headers: dict, proxy_cfg: dict[str, Any] | None, result: dict
) -> dict[str, Any]:
    """Try vault access - direct first, then proxy fallback."""
    # First try direct
    _logger.info("[validate_browser_mam_id] Auto mode: trying direct connection first")
    result = await _try_vault_access_direct(vault_url, cookies, headers, result)

    if result["valid"]:
        return result

    # If direct failed and we have proxy config, try proxy
    if proxy_cfg:
        _logger.info("[validate_browser_mam_id] Auto mode: direct failed, trying proxy")
        result = await _try_vault_access_proxy(vault_url, cookies, headers, proxy_cfg, result)

        if result["valid"]:
            return result

    # If we get here, both methods failed
    result["error"] = (
        "Both direct and proxy connections failed - browser MAM ID may be tied to different IP"
    )
    _logger.warning("[validate_browser_mam_id] Auto mode: both direct and proxy access failed")

    return result


async def check_seedbox_session_health(
    mam_id: str, proxy_cfg: dict[str, Any] | None = None
) -> dict[str, Any]:
    """Check if seedbox mam_id is working for basic API access.

    Used for pre-validation before requesting browser cookies

    Args:
        mam_id: Seedbox mam_id
        proxy_cfg: Proxy configuration if needed

    Returns:
        Dict with health check results
    """
    result: dict[str, Any] = {"valid": False, "points": None, "error": None}

    try:
        proxies = build_proxy_dict(proxy_cfg) if proxy_cfg else None
        api_url = "https://www.myanonamouse.net/jsonLoad.php?snatch_summary"
        cookies = {"mam_id": mam_id}

        timeout = aiohttp.ClientTimeout(total=10)
        proxy_url = None
        if proxies:
            proxy_url = proxies.get("https") or proxies.get("http")

        async with (
            aiohttp.ClientSession(timeout=timeout) as session,
            session.get(api_url, cookies=cookies, proxy=proxy_url) as resp,
        ):
            if resp.status == 200:
                try:
                    data = await resp.json()
                except Exception:
                    data = None

                if isinstance(data, dict) and "seedbonus" in data:
                    result["valid"] = True
                    result["points"] = data.get("seedbonus")
                else:
                    result["error"] = "Invalid API response format"
            else:
                result["error"] = f"HTTP {resp.status} - possible ASN mismatch or invalid mam_id"

    except Exception as e:
        result["error"] = f"Health check error: {e!s}"
        _logger.warning("[check_seedbox_session_health] Error: %s", e)

    return result


def generate_cookie_extraction_bookmarklet() -> str:
    """Generate a JavaScript bookmarklet for easy cookie extraction from browser.

    Returns:
        JavaScript bookmarklet code with browser detection
    """
    js_code = """
    javascript:(function(){
        try{
            if(!window.location.href.includes('myanonamouse.net')){
                alert('Please use this bookmarklet on MyAnonamouse.net');
                return;
            }
            var cookies = document.cookie.split(';');
            var mamId = null;
            var uid = null;

            for(var i = 0; i < cookies.length; i++) {
                var cookie = cookies[i].trim();
                if(cookie.startsWith('mam_id=')) {
                    mamId = cookie.substring(7);
                } else if(cookie.startsWith('uid=')) {
                    uid = cookie.substring(4);
                }
            }

            if(mamId && uid) {
                var browser = 'unknown';
                var ua = navigator.userAgent;
                if(ua.includes('Firefox')) {
                    browser = 'firefox';
                } else if(ua.includes('Chrome') && !ua.includes('Edg')) {
                    browser = 'chrome';
                } else if(ua.includes('Edg')) {
                    browser = 'edge';
                } else if(ua.includes('Safari') && !ua.includes('Chrome')) {
                    browser = 'safari';
                } else if(ua.includes('Opera') || ua.includes('OPR')) {
                    browser = 'opera';
                }

                var cookieString = 'mam_id=' + mamId + '; uid=' + uid + '; browser=' + browser;

                if(navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(cookieString).then(function() {
                        alert('Browser MAM ID copied to clipboard!\\n\\nThis includes both mam_id and uid cookies, plus browser type (' + browser + ') for proper headers.');
                    }).catch(function() {
                        prompt('Browser MAM ID (copy this):', cookieString);
                    });
                } else {
                    prompt('Browser MAM ID (copy this):', cookieString);
                }
            } else {
                var missing = [];
                if(!mamId) missing.push('mam_id');
                if(!uid) missing.push('uid');
                alert('Missing required cookies: ' + missing.join(', ') + '\\n\\nMake sure you are logged in to MyAnonamouse and try again.');
            }
        } catch(e) {
            alert('Bookmarklet error: ' + e.message);
            console.error('MAM Cookie Extractor Error:', e);
        }
    })();
    """

    return js_code.strip()


async def get_cookie_health_status(
    browser_mam_id: str, session_config: dict, proxy_cfg: dict[str, Any] | None = None
) -> dict[str, Any]:
    """Get detailed health status of browser mam_id + session uid combination.

    Args:
        browser_mam_id: Browser mam_id value
        session_config: Session configuration containing uid
        proxy_cfg: Proxy configuration if needed

    Returns:
        Dict with detailed health information
    """
    if not browser_mam_id:
        return {
            "status": "missing",
            "message": "No browser mam_id configured",
            "action_needed": "Enter browser mam_id for Millionaire's Vault automation",
        }

    # Check if we have UID from session
    uid = session_config.get("last_status", {}).get("raw", {}).get("uid")
    if not uid:
        return {
            "status": "missing_uid",
            "message": "Session UID not available",
            "action_needed": "Refresh session status to get UID from MAM",
        }

    validation = await validate_browser_mam_id(browser_mam_id, session_config, proxy_cfg)

    if validation["valid"]:
        return {
            "status": "healthy",
            "message": "Browser mam_id is valid and vault is accessible",
            "action_needed": None,
            "cookie_string": validation["cookie_string"],
        }
    if not validation["has_browser_mam_id"]:
        return {
            "status": "invalid_format",
            "message": "Browser mam_id is required",
            "action_needed": "Enter your browser mam_id (different from seedbox mam_id)",
        }
    return {
        "status": "expired",
        "message": f"Browser mam_id appears invalid: {validation['error']}",
        "action_needed": "Get fresh browser mam_id from your browser session",
    }


async def validate_browser_mam_id_with_config(
    browser_mam_id: str,
    uid: str,
    proxy_cfg: dict[str, Any] | None = None,
    connection_method: str = "auto",
) -> dict[str, Any]:
    """Validate browser mam_id with direct configuration (for vault config API).

    Args:
        browser_mam_id: Browser mam_id value
        uid: UID to use for validation
        proxy_cfg: Proxy configuration if needed
        connection_method: "direct", "proxy", or "auto"

    Returns:
        Dict with validation results
    """
    result = {
        "valid": False,
        "has_browser_mam_id": False,
        "has_session_uid": False,
        "vault_accessible": False,
        "cookie_string": "",
        "error": None,
    }

    try:
        # Check if we have browser mam_id
        result["has_browser_mam_id"] = bool(browser_mam_id)
        result["has_session_uid"] = bool(uid)

        if not result["has_browser_mam_id"]:
            result["error"] = "Browser mam_id is required"
            return result

        if not result["has_session_uid"]:
            result["error"] = "UID is required"
            return result

        # Parse cookies to detect browser type if available
        parsed_cookies = parse_browser_cookies(browser_mam_id)
        browser_type = parsed_cookies.get("browser", "chrome")  # Default to chrome
        actual_mam_id = parsed_cookies.get("mam_id") or browser_mam_id

        # Build full cookie string using extracted values
        cookie_string = f"mam_id={actual_mam_id}; uid={uid}"
        result["cookie_string"] = cookie_string

        _logger.info(
            "[validate_browser_mam_id_with_config] Raw browser_mam_id: %s...",
            browser_mam_id[:50],
        )
        _logger.info("[validate_browser_mam_id_with_config] Parsed cookies: %s", parsed_cookies)
        _logger.info(
            "[validate_browser_mam_id_with_config] Final cookie_string: %s...",
            cookie_string[:50],
        )
        _logger.info(
            "[validate_browser_mam_id_with_config] Testing browser_mam_id with UID %s, browser: %s",
            uid,
            browser_type,
        )

        # Parse cookies for validation
        cookies = {"mam_id": actual_mam_id, "uid": str(uid)}

        # Use browser-specific headers to prevent logout
        headers = {"User-Agent": get_browser_user_agent(browser_type)}

        vault_url = "https://www.myanonamouse.net/millionaires/donate.php"

        if connection_method == "proxy":
            # Only try proxy
            return await _try_vault_access_proxy(vault_url, cookies, headers, proxy_cfg, result)
        if connection_method == "direct":
            # Only try direct
            return await _try_vault_access_direct(vault_url, cookies, headers, result)
        # Auto mode - try direct first, then proxy
        return await _try_vault_access_auto(vault_url, cookies, headers, proxy_cfg, result)

    except Exception as e:
        result["error"] = f"Validation error: {e!s}"
        _logger.error("[validate_browser_mam_id_with_config] Exception: %s", e)

    return result


async def get_vault_total_points(
    mam_id: str, uid: str, proxy_cfg: dict[str, Any] | None = None
) -> dict[str, Any]:
    """Get the current total points in the Millionaire's Vault (community total).

    Args:
        mam_id: Extracted mam_id value (not full browser cookie string)
        uid: User ID
        proxy_cfg: Optional proxy configuration

    Returns:
        Dict with vault_total_points and status
    """
    result: dict[str, Any] = {"success": False, "vault_total_points": None, "error": None}

    try:
        # Prepare cookies and headers
        cookies = {"mam_id": mam_id, "uid": uid}

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }

        vault_url = "https://www.myanonamouse.net/millionaires/donate.php"

        # Get the vault page
        timeout = aiohttp.ClientTimeout(total=15 if proxy_cfg else 10)
        proxy_url = None
        if proxy_cfg:
            proxies = build_proxy_dict(proxy_cfg)
            proxy_url = proxies.get("https") or proxies.get("http") if proxies else None

        async with (
            aiohttp.ClientSession(timeout=timeout) as session,
            session.get(vault_url, cookies=cookies, headers=headers, proxy=proxy_url) as resp,
        ):
            if resp.status != 200:
                result["error"] = f"Failed to access vault page: HTTP {resp.status}"
                return result

            html = await resp.text()

        # Check if logged in
        if 'type="password"' in html.lower() or 'name="password"' in html.lower():
            result["error"] = "Not logged in - browser MAM ID may be expired"
            return result

        # Parse vault total points from the page

        # Look for patterns like "16,332,800 points" on the vault page
        points_match = re.search(r"(\d+(?:,\d+)*)\s*points?", html, re.IGNORECASE)
        if points_match:
            points_str = points_match.group(1).replace(",", "")
            result["vault_total_points"] = int(points_str)
            result["success"] = True
            _logger.info(
                "[get_vault_total_points] Current vault total: %s points",
                f"{result['vault_total_points']:,}",
            )
        else:
            result["error"] = "Could not parse vault total points from page"

    except Exception as e:
        result["error"] = f"Error fetching vault total: {e!s}"
        _logger.error("[get_vault_total_points] Exception: %s", e)

    return result


async def perform_vault_donation(
    browser_mam_id: str,
    uid: str,
    amount: int,
    proxy_cfg: dict[str, Any] | None = None,
    connection_method: str = "auto",
    verification_mam_id: str | None = None,
) -> dict[str, Any]:
    """Perform actual vault donation to MAM with unified verification approach.

    Args:
        browser_mam_id: Browser mam_id value
        uid: UID to use for donation
        amount: Amount to donate (100-2000 points)
        proxy_cfg: Proxy configuration if needed
        connection_method: "direct", "proxy", or "auto"
        verification_mam_id: Optional session mam_id for points verification

    Returns:
        Dict with donation results including points_before and points_after
    """
    result: dict[str, Any] = {
        "success": False,
        "amount_donated": 0,
        "points_before": None,
        "points_after": None,
        "vault_total_points": None,  # Community vault total
        "error": None,
        "access_method": None,
        "verification_method": None,
    }

    try:
        # Validate amount
        if not isinstance(amount, int) or amount < 100 or amount > 2000 or amount % 100 != 0:
            result["error"] = (
                "Invalid donation amount. Must be 100-2000 points in increments of 100."
            )
            return result

        # Get session configuration for verification if verification_mam_id provided
        session_config = None
        session_proxy_cfg = None
        if verification_mam_id:
            try:
                sessions = list_sessions()

                for label in sessions:
                    config = load_session(label)
                    if config.get("mam", {}).get("mam_id") == verification_mam_id:
                        session_config = config
                        session_proxy_cfg = config.get("proxy")
                        result["verification_method"] = f"session_{label}"
                        break

                if session_config:
                    _logger.info(
                        "[perform_vault_donation] Using session-based verification with mam_id: [REDACTED]"
                    )
                else:
                    _logger.warning(
                        "[perform_vault_donation] Could not find session with mam_id [REDACTED]"
                    )
            except Exception as e:
                _logger.warning(
                    "[perform_vault_donation] Error loading session for verification: %s",
                    e,
                )

        # Step 1: Get points BEFORE donation
        if session_config and verification_mam_id:
            try:
                status_before = await get_status(
                    mam_id=verification_mam_id, proxy_cfg=session_proxy_cfg
                )
                result["points_before"] = status_before.get("points")
                _logger.info(
                    "[perform_vault_donation] Points before donation (session): %s",
                    result["points_before"],
                )
            except Exception as e:
                _logger.warning(
                    "[perform_vault_donation] Could not get points before donation via session: %s",
                    e,
                )
        else:
            result["verification_method"] = "browser_fallback"
            _logger.info("[perform_vault_donation] No session available for verification")

        # Prepare cookies and headers
        # Parse browser_mam_id to detect browser type and extract actual mam_id
        parsed_cookies = parse_browser_cookies(browser_mam_id)
        browser_type = parsed_cookies.get("browser", "chrome")  # Default to chrome
        actual_mam_id = parsed_cookies.get("mam_id") or browser_mam_id

        _logger.info(
            "[perform_vault_donation] Browser parsing - browser_mam_id length: %s, parsed_cookies: %s, browser_type: %s",
            len(browser_mam_id),
            parsed_cookies,
            browser_type,
        )

        cookies = {"mam_id": actual_mam_id, "uid": uid}

        headers = {"User-Agent": get_browser_user_agent(browser_type)}

        # MAM vault donation URL
        vault_donation_url = "https://www.myanonamouse.net/millionaires/donate.php"

        # Step 2: Perform the actual donation
        if connection_method == "direct":
            donation_result = await _perform_vault_donation_direct(
                vault_donation_url, cookies, headers, amount, {}, verification_mam_id
            )
        elif connection_method == "proxy":
            donation_result = await _perform_vault_donation_proxy(
                vault_donation_url, cookies, headers, amount, proxy_cfg, {}, verification_mam_id
            )
        elif connection_method == "auto":
            donation_result = await _perform_vault_donation_auto(
                vault_donation_url, cookies, headers, amount, proxy_cfg, {}, verification_mam_id
            )
        else:
            result["error"] = f"Invalid connection method: {connection_method}"
            return result

        # Copy donation result data
        result["access_method"] = donation_result.get("access_method")

        # Step 3: Get points AFTER donation and determine final success
        if session_config and verification_mam_id and result["points_before"] is not None:
            try:
                # Wait a moment for the donation to be processed

                await asyncio.sleep(3)

                status_after = await get_status(
                    mam_id=verification_mam_id, proxy_cfg=session_proxy_cfg
                )
                result["points_after"] = status_after.get("points")

                if result["points_after"] is not None:
                    expected_points = result["points_before"] - amount
                    points_difference = result["points_before"] - result["points_after"]

                    _logger.info(
                        "[perform_vault_donation] Unified verification - Before: %s, After: %s, Expected: %s, Actual difference: %s",
                        result["points_before"],
                        result["points_after"],
                        expected_points,
                        points_difference,
                    )

                    # Check if points decreased by approximately the donation amount (must be at least 50% of expected)
                    if (
                        points_difference >= (amount * 0.5)
                        and abs(points_difference - amount) <= 50
                    ):  # Stricter verification
                        _logger.info(
                            "[perform_vault_donation] Unified verification successful - donation confirmed"
                        )
                        result["success"] = True
                        result["amount_donated"] = amount
                    else:
                        _logger.warning(
                            "[perform_vault_donation] Unified verification failed - points did not decrease correctly"
                        )
                        result["success"] = False
                        result["error"] = (
                            f"Donation verification failed - expected {amount} point decrease, got {points_difference}"
                        )
                else:
                    _logger.warning("[perform_vault_donation] Could not get points after donation")
                    result["success"] = False
                    result["error"] = (
                        "Could not verify donation - unable to check points after donation"
                    )

            except Exception as e:
                _logger.warning(
                    "[perform_vault_donation] Error during post-donation verification: %s",
                    e,
                )
                result["success"] = False
                result["error"] = f"Donation verification error: {e!s}"
        else:
            # No session verification available - trust the donation method result
            result["success"] = donation_result.get("success", False)
            result["amount_donated"] = donation_result.get("amount_donated", 0)
            result["error"] = donation_result.get("error")
            _logger.info(
                "[perform_vault_donation] No unified verification available - using donation result: %s",
                result["success"],
            )

        # Log final result
        if result["success"]:
            _logger.info(
                "[perform_vault_donation] Final result: SUCCESS - %s points donated via %s",
                result["amount_donated"],
                result["access_method"],
            )
        else:
            _logger.error(
                "[perform_vault_donation] Final result: FAILED - %s",
                result.get("error", "Unknown error"),
            )

    except Exception as e:
        _logger.error("[perform_vault_donation] Exception during donation: %s", e)
        result["error"] = f"Donation failed: {e!s}"
        return result
    else:
        return result


async def _perform_vault_donation_direct(
    vault_url: str,
    cookies: dict,
    headers: dict,
    amount: int,
    result: dict,
    verification_mam_id: str | None = None,
) -> dict[str, Any]:
    """Perform vault donation via direct connection."""
    try:
        _logger.info(
            "[perform_vault_donation] Attempting donation via direct connection: %s points",
            amount,
        )

        # First, get the vault page to check current points and get any required form tokens
        timeout = aiohttp.ClientTimeout(total=10)
        async with aiohttp.ClientSession(timeout=timeout) as session:
            resp = await session.get(vault_url, cookies=cookies, headers=headers)

            if resp.status != 200:
                result["error"] = f"Failed to access vault page: HTTP {resp.status}"
                _logger.error("[perform_vault_donation] GET request failed: %s", resp.status)
                return result

            html = await resp.text()
            _logger.debug("[perform_vault_donation] Vault page HTML length: %s", len(html))

            # Check if we're logged in (not seeing login form)
            if 'type="password"' in html.lower() or 'name="password"' in html.lower():
                result["error"] = "Not logged in - browser MAM ID may be expired"
                return result

            # Parse current vault total points from the page (community total)
            points_match = re.search(r"(\d+(?:,\d+)*)\s*points?", html, re.IGNORECASE)
            if points_match:
                points_str = points_match.group(1).replace(",", "")
                result["vault_total_points"] = int(points_str)
                _logger.info(
                    "[perform_vault_donation] Current vault total: %s points",
                    f"{result['vault_total_points']:,}",
                )

            # Look for any hidden form fields or tokens that might be required
            csrf_token = None
            token_patterns = [
                r'<input[^>]*name=["\']?(?:csrf_token|token|_token|authenticity_token)["\']?[^>]*value=["\']?([^"\'>\s]+)',
                r'<input[^>]*value=["\']?([^"\'>\s]+)[^>]*name=["\']?(?:csrf_token|token|_token|authenticity_token)',
                r'"csrf[_-]?token":\s*"([^"]+)"',
                r'"token":\s*"([^"]+)"',
            ]

            for pattern in token_patterns:
                match = re.search(pattern, html, re.IGNORECASE)
                if match:
                    csrf_token = match.group(1)
                    _logger.info(
                        "[perform_vault_donation] Found potential token: %s...",
                        csrf_token[:20],
                    )
                    break

            if not csrf_token:
                _logger.info("[perform_vault_donation] No CSRF token found in page")

            # Look for any other required form fields
            hidden_fields = {}
            hidden_pattern = r'<input[^>]*type=["\']?hidden["\']?[^>]*name=["\']?([^"\'>\s]+)["\']?[^>]*value=["\']?([^"\'>\s]*)'
            for match in re.finditer(hidden_pattern, html, re.IGNORECASE):
                field_name = match.group(1)
                field_value = match.group(2)
                if field_name.lower() not in [
                    "csrf_token",
                    "token",
                    "_token",
                ]:  # Don't duplicate token
                    hidden_fields[field_name] = field_value
                    _logger.info(
                        "[perform_vault_donation] Found hidden field: %s = %s...",
                        field_name,
                        field_value[:20],
                    )

            # Use the documented working format from vault documentation

            # Prepare donation form data using the exact format from documentation
            donation_data = {
                "Donation": str(amount),  # MAM expects 'Donation', not 'amount'
                "time": str(int(time.time())),  # Current timestamp
                "submit": "Donate Points",  # Exact submit value from docs
            }

            # Add proper headers as documented
            headers.update(
                {
                    "Referer": vault_url,
                    "Origin": "https://www.myanonamouse.net",
                    "Content-Type": "application/x-www-form-urlencoded",
                }
            )

            # Use the exact URL from documentation - no need for complex form parsing
            post_url = vault_url  # Always use the same URL for POST as documented

            _logger.info("[perform_vault_donation] POST URL: %s", post_url)
            _logger.info("[perform_vault_donation] Form data: %s", donation_data)
            _logger.info("[perform_vault_donation] Headers: %s", headers)

            # Submit donation
            donation_resp = await session.post(
                post_url, data=donation_data, cookies=cookies, headers=headers
            )

            _logger.info("[perform_vault_donation] POST response status: %s", donation_resp.status)

            if donation_resp.status == 200:
                donation_text = await donation_resp.text()
                donation_html = donation_text.lower()

                # Log response snippet for debugging
                _logger.info(
                    "[perform_vault_donation] Response preview: %s",
                    donation_text[:300],
                )

                # Check for actual success indicators (not just the word "success" in HTML content)
                success_indicators = [
                    "donation successful",
                    "donation complete",
                    "thank you for donating",
                    "points donated",
                    "contribution received",
                    "donated successfully",
                ]

                has_success_indicator = any(
                    indicator in donation_html for indicator in success_indicators
                )

                # If we don't have a clear success indicator, verify by checking points balance
                if not has_success_indicator and result.get("points_before"):
                    _logger.info(
                        "[perform_vault_donation] No clear success indicator found, verifying by checking points balance"
                    )

                    if verification_mam_id:
                        # Using session mam_id for verification - get session config and its proxy
                        try:
                            sessions = list_sessions()
                            session_config = None

                            # Find session with matching mam_id
                            for label in sessions:
                                config = load_session(label)
                                if config.get("mam", {}).get("mam_id") == verification_mam_id:
                                    session_config = config
                                    break

                            if session_config:
                                session_proxy_cfg = session_config.get("proxy")
                                verify_status = await get_status(
                                    mam_id=verification_mam_id, proxy_cfg=session_proxy_cfg
                                )
                                current_points = verify_status.get("points")

                                if current_points is not None:
                                    expected_points = result["points_before"] - amount

                                    _logger.info(
                                        "[perform_vault_donation] Points verification (session) - Before: %s, Current: %s, Expected: %s",
                                        result["points_before"],
                                        current_points,
                                        expected_points,
                                    )

                                    # Check if points decreased by approximately the donation amount
                                    if (
                                        abs(current_points - expected_points) <= 100
                                    ):  # Allow 100 point discrepancy for rounding/timing
                                        _logger.info(
                                            "[perform_vault_donation] Points verification successful - donation appears to have worked"
                                        )
                                        has_success_indicator = True
                                        result["points_after"] = current_points
                                    else:
                                        _logger.warning(
                                            "[perform_vault_donation] Points verification failed - points did not decrease as expected"
                                        )
                                else:
                                    _logger.warning(
                                        "[perform_vault_donation] Could not verify points via session - get_status returned no points"
                                    )
                            else:
                                _logger.warning(
                                    "[perform_vault_donation] Could not find session with mam_id %s for verification",
                                    verification_mam_id,
                                )
                        except Exception as e:
                            _logger.warning(
                                "[perform_vault_donation] Error during session-based verification: %s",
                                e,
                            )

                    if not has_success_indicator:
                        # Fallback to browser mam_id verification using donation proxy

                        mam_id_for_verification = cookies["mam_id"]

                        verify_status = await get_status(
                            mam_id=mam_id_for_verification, proxy_cfg=None
                        )  # Use no proxy for browser verification
                        current_points = verify_status.get("points")

                        if current_points is not None:
                            expected_points = result["points_before"] - amount

                            _logger.info(
                                "[perform_vault_donation] Points verification (browser) - Before: %s, Current: %s, Expected: %s",
                                result["points_before"],
                                current_points,
                                expected_points,
                            )

                            # Check if points decreased by approximately the donation amount
                            if (
                                abs(current_points - expected_points) <= 100
                            ):  # Allow 100 point discrepancy for rounding/timing
                                _logger.info(
                                    "[perform_vault_donation] Points verification successful - donation appears to have worked"
                                )
                                has_success_indicator = True
                                result["points_after"] = current_points
                            else:
                                _logger.warning(
                                    "[perform_vault_donation] Points verification failed - points did not decrease as expected"
                                )
                        else:
                            _logger.warning(
                                "[perform_vault_donation] Could not verify points - get_status returned no points"
                            )

                if has_success_indicator:
                    result["success"] = True
                    result["amount_donated"] = amount
                    result["access_method"] = "direct"

                    # Try to parse new points total from donation response if not already set
                    if not result.get("points_after"):
                        new_points_match = re.search(
                            r"(\d+(?:,\d+)*)\s*points?", donation_text, re.IGNORECASE
                        )
                        if new_points_match:
                            points_str = new_points_match.group(1).replace(",", "")
                            result["points_after"] = int(points_str)

                    _logger.info(
                        "[perform_vault_donation] Direct donation successful: %s points", amount
                    )
                # Look for specific error messages
                elif "insufficient" in donation_html or "not enough" in donation_html:
                    result["error"] = "Insufficient points for donation"
                elif "invalid" in donation_html or "error" in donation_html:
                    result["error"] = "Invalid donation request"
                elif "form" in donation_html and (
                    "token" in donation_html or "csrf" in donation_html
                ):
                    result["error"] = "Missing or invalid security token"
                elif "login" in donation_html or "password" in donation_html:
                    result["error"] = "Authentication failed - cookies may be expired"
                else:
                    result["error"] = "Donation not processed - no success confirmation received"
                    _logger.warning(
                        "[perform_vault_donation] No success indicators found in response"
                    )
            else:
                result["error"] = f"Donation request failed: HTTP {donation_resp.status}"
                _logger.error(
                    "[perform_vault_donation] POST failed with %s: %s",
                    donation_resp.status,
                    donation_text[:200] if "donation_text" in locals() else "",
                )

    except Exception as e:
        result["error"] = f"Direct donation failed: {e!s}"
        _logger.warning("[perform_vault_donation] Direct donation failed: %s", e)

    return result


async def _perform_vault_donation_proxy(
    vault_url: str,
    cookies: dict,
    headers: dict,
    amount: int,
    proxy_cfg: dict[str, Any] | None,
    result: dict,
    verification_mam_id: str | None = None,
) -> dict[str, Any]:
    """Perform vault donation via proxy connection."""
    try:
        if not proxy_cfg:
            result["error"] = "Proxy method selected but no proxy configured"
            return result

        _logger.info("[perform_vault_donation] Attempting donation via proxy: %s points", amount)

        # Use the same logic as direct but with proxy
        proxies = build_proxy_dict(proxy_cfg)

        # Get vault page with proxy and submit donation inside same aiohttp session
        timeout = aiohttp.ClientTimeout(total=15)
        proxy_url = None
        if proxies:
            proxy_url = proxies.get("https") or proxies.get("http")

        async with aiohttp.ClientSession(timeout=timeout) as session:
            resp = await session.get(vault_url, cookies=cookies, headers=headers, proxy=proxy_url)

            if resp.status != 200:
                result["error"] = f"Failed to access vault page via proxy: HTTP {resp.status}"
                return result

            # Same donation logic as direct method but with proxies parameter
            html = await resp.text()

            if 'type="password"' in html.lower() or 'name="password"' in html.lower():
                result["error"] = "Not logged in via proxy - browser MAM ID may be expired"
                return result

            # Parse points and form tokens (same as direct method)
            points_match = re.search(r"(\d+(?:,\d+)*)\s*points?", html, re.IGNORECASE)
            if points_match:
                points_str = points_match.group(1).replace(",", "")
                result["points_before"] = int(points_str)

            # Prepare donation form data
            donation_data = {
                "Donation": str(amount),
                "time": str(int(time.time())),
                "submit": "Donate Points",
            }

            headers.update(
                {
                    "Referer": vault_url,
                    "Origin": "https://www.myanonamouse.net",
                    "Content-Type": "application/x-www-form-urlencoded",
                }
            )

            # Submit donation via proxy
            donation_resp = await session.post(
                vault_url, data=donation_data, cookies=cookies, headers=headers, proxy=proxy_url
            )

            if donation_resp.status == 200:
                donation_text = await donation_resp.text()
                donation_html = donation_text.lower()
            else:
                result["error"] = f"Donation request failed via proxy: HTTP {donation_resp.status}"
                return result

            # Check for actual success indicators
            success_indicators = [
                "donation successful",
                "donation complete",
                "thank you for donating",
                "points donated",
                "contribution received",
                "donated successfully",
            ]

            has_success_indicator = any(
                indicator in donation_html for indicator in success_indicators
            )

            # If we don't have a clear success indicator, verify by checking points balance
            if not has_success_indicator and result.get("points_before"):
                _logger.info(
                    "[perform_vault_donation] No clear success indicator found, verifying by checking points balance via proxy"
                )

                # Build proper proxy config for get_status (best-effort)
                proxy_cfg_for_status = None
                if proxies:
                    http_proxy = proxies.get("http", "")
                    if http_proxy and "://" in http_proxy:
                        proxy_match = re.match(
                            r"(https?)://(?:([^:]+):([^@]+)@)?([^:]+):(\d+)", http_proxy
                        )
                        if proxy_match:
                            protocol, username, password, host, port = proxy_match.groups()
                            proxy_cfg_for_status = {
                                "host": host,
                                "port": int(port),
                                "username": username,
                                "password": password,
                            }

                verify_status = await get_status(
                    mam_id=cookies["mam_id"], proxy_cfg=proxy_cfg_for_status
                )
                current_points = verify_status.get("points")

                if current_points is not None:
                    expected_points = result["points_before"] - amount

                    _logger.info(
                        "[perform_vault_donation] Points verification via proxy - Before: %s, Current: %s, Expected: %s",
                        result["points_before"],
                        current_points,
                        expected_points,
                    )

                    if abs(current_points - expected_points) <= 100:
                        _logger.info(
                            "[perform_vault_donation] Points verification successful via proxy - donation appears to have worked"
                        )
                        has_success_indicator = True
                        result["points_after"] = current_points
                    else:
                        _logger.warning(
                            "[perform_vault_donation] Points verification failed via proxy - points did not decrease as expected"
                        )
                else:
                    _logger.warning(
                        "[perform_vault_donation] Could not verify points via proxy - get_status returned no points"
                    )

            if has_success_indicator:
                result["success"] = True
                result["amount_donated"] = amount
                result["access_method"] = "proxy"

                if not result.get("points_after"):
                    new_points_match = re.search(
                        r"(\d+(?:,\d+)*)\s*points?", donation_text, re.IGNORECASE
                    )
                    if new_points_match:
                        points_str = new_points_match.group(1).replace(",", "")
                        result["points_after"] = int(points_str)

                _logger.info(
                    "[perform_vault_donation] Proxy donation successful: %s points", amount
                )
            # Look for specific error messages
            elif "insufficient" in donation_html or "not enough" in donation_html:
                result["error"] = "Insufficient points for donation"
            elif "invalid" in donation_html or "error" in donation_html:
                result["error"] = "Invalid donation request"
            elif "form" in donation_html and ("token" in donation_html or "csrf" in donation_html):
                result["error"] = "Missing or invalid security token"
            elif "login" in donation_html or "password" in donation_html:
                result["error"] = "Authentication failed - cookies may be expired"
            else:
                result["error"] = "Donation not processed - no success confirmation received"
                _logger.warning(
                    "[perform_vault_donation] No success indicators found in proxy response"
                )

    except Exception as e:
        result["error"] = f"Proxy donation failed: {e!s}"
        _logger.warning("[perform_vault_donation] Proxy donation failed: %s", e)

    return result


async def _perform_vault_donation_auto(
    vault_url: str,
    cookies: dict,
    headers: dict,
    amount: int,
    proxy_cfg: dict[str, Any] | None,
    result: dict,
    verification_mam_id: str | None = None,
) -> dict[str, Any]:
    """Perform vault donation using auto method (try direct first, then proxy)."""
    _logger.info("[perform_vault_donation] Attempting auto donation: %s points", amount)

    # Try direct first
    result = await _perform_vault_donation_direct(
        vault_url, cookies, headers, amount, result, verification_mam_id
    )

    if result.get("success"):
        return result

    # If direct failed and proxy is available, try proxy
    if proxy_cfg:
        _logger.info(
            "[perform_vault_donation] Direct failed, trying proxy: %s", result.get("error")
        )
        # Reset result for proxy attempt
        result = {
            "success": False,
            "amount_donated": 0,
            "points_before": result.get("points_before"),  # Keep points if we got them
            "points_after": None,
            "error": None,
            "access_method": None,
        }
        result = await _perform_vault_donation_proxy(
            vault_url, cookies, headers, amount, proxy_cfg, result, verification_mam_id
        )
    else:
        _logger.warning("[perform_vault_donation] Direct failed and no proxy available")

    return result
