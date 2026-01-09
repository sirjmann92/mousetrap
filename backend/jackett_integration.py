"""Jackett integration for updating MAM indexer configuration via API.

This module provides functionality to:
- Authenticate with Jackett admin password
- Get indexer configuration via API
- Update MAM ID in Jackett config via API

Key implementation:
- Uses Jackett HTTP API endpoints
- Requires admin password authentication (session cookie)
- Works across all deployment types (Docker/Windows/Linux)
- API endpoints: GET/POST /api/v2.0/indexers/{indexer}/config
"""

import logging
from typing import Any

import aiohttp
from yarl import URL

_logger = logging.getLogger(__name__)
_TIMEOUT = aiohttp.ClientTimeout(total=10)


async def jackett_login(host: str, port: int, admin_password: str) -> str | None:
    """Authenticate with Jackett and get session cookie.

    Jackett requires session cookies even when authentication is disabled:
    1. GET /UI/Login to receive TestCookie and Jackett session cookie
    2. If admin_password provided: POST /UI/Dashboard with password to authenticate

    Args:
        host: Jackett host
        port: Jackett port
        admin_password: Jackett admin password (empty string if auth disabled)

    Returns:
        Session cookie string if successful, None otherwise
    """
    login_url = f"http://{host}:{port}/UI/Login"
    dashboard_url = f"http://{host}:{port}/UI/Dashboard"

    try:
        # Create cookie jar with unsafe=True to allow cookies for non-secure HTTP domains
        jar = aiohttp.CookieJar(unsafe=True)

        async with aiohttp.ClientSession(cookie_jar=jar) as session:
            # Step 1: GET /UI/Login to receive TestCookie and Jackett session cookie
            async with session.get(login_url, allow_redirects=True, timeout=_TIMEOUT) as response:
                # Get all cookies after visiting login page
                cookies = session.cookie_jar.filter_cookies(URL(f"http://{host}:{port}"))

                # Check for required cookies
                has_test_cookie = any(cookie.key == "TestCookie" for cookie in cookies.values())
                has_jackett_cookie = any(cookie.key == "Jackett" for cookie in cookies.values())

                if not has_test_cookie:
                    _logger.error("Jackett login failed: No TestCookie received from %s", login_url)
                    return None

                # If we have Jackett cookie and no password needed, we're done
                if has_jackett_cookie and not admin_password:
                    cookie_str = "; ".join([f"{k}={v.value}" for k, v in cookies.items()])
                    _logger.info("Jackett session established (no authentication)")
                    return cookie_str

            # Step 2: If password provided, POST to Dashboard to authenticate
            if admin_password:
                form_data = {"password": admin_password}

                async with session.post(
                    dashboard_url, data=form_data, allow_redirects=True, timeout=_TIMEOUT
                ) as response:
                    # Get all cookies after authentication
                    cookies = session.cookie_jar.filter_cookies(URL(f"http://{host}:{port}"))

                    # Check for Jackett auth cookie
                    has_jackett_cookie = any(cookie.key == "Jackett" for cookie in cookies.values())

                    if has_jackett_cookie:
                        cookie_str = "; ".join([f"{k}={v.value}" for k, v in cookies.items()])
                        _logger.info("Successfully authenticated with Jackett")
                        return cookie_str

                    # No Jackett cookie = authentication failed
                    response_text = await response.text()
                    is_login_page = (
                        "Admin password" in response_text or "login" in str(response.url).lower()
                    )

                    if is_login_page:
                        _logger.error(
                            "Jackett auth failed: Redirected back to login page (wrong password)"
                        )
                    else:
                        _logger.error("Jackett auth failed: No Jackett cookie received")

                    return None

            # Should not reach here, but return cookies we have
            cookies = session.cookie_jar.filter_cookies(URL(f"http://{host}:{port}"))
            if cookies:
                return "; ".join([f"{k}={v.value}" for k, v in cookies.items()])

            return None

    except Exception:
        _logger.exception("Error during Jackett login")
        return None


async def test_jackett_connection(
    host: str, port: int, api_key: str, admin_password: str
) -> dict[str, Any]:
    """Test connection to Jackett API with optional authentication.

    Args:
        host: Jackett host
        port: Jackett port
        api_key: Jackett API key
        admin_password: Jackett admin password (empty string if auth disabled)

    Returns:
        dict with success, message, and optional indexer_count
    """
    try:
        # Always go through login flow to get required cookies
        # Even with auth disabled, Jackett requires TestCookie and Jackett session cookie
        session_cookie = await jackett_login(host, port, admin_password)
        if not session_cookie and admin_password:
            # Only fail if password was provided but login failed
            return {
                "success": False,
                "message": "Failed to authenticate with Jackett. Check admin password.",
            }

        # Test API access
        url = f"http://{host}:{port}/api/v2.0/indexers"
        headers = {"X-Api-Key": api_key}
        if session_cookie:
            headers["Cookie"] = session_cookie

        jar = aiohttp.CookieJar(unsafe=True)
        async with (
            aiohttp.ClientSession(cookie_jar=jar) as session,
            session.get(
                url,
                headers=headers,
                params={"apikey": api_key},
                timeout=_TIMEOUT,
                allow_redirects=False,
            ) as response,
        ):
            # Check for redirect to login page (authentication required but cookies not working)
            if response.status == 302:
                location = response.headers.get("Location", "")
                if "Login" in location:
                    if admin_password:
                        # Password was provided but still getting redirect
                        return {
                            "success": False,
                            "message": "Authentication failed. The admin password may be incorrect.",
                        }
                    # No password provided but still getting redirect - cookie issue
                    return {
                        "success": False,
                        "message": "Failed to establish Jackett session. Try entering your admin password if authentication is enabled.",
                    }

            if response.status == 200:
                indexers = await response.json()
                auth_status = "authenticated" if admin_password else "no authentication"
                return {
                    "success": True,
                    "message": f"Connected to Jackett successfully ({auth_status})",
                    "indexer_count": len(indexers) if isinstance(indexers, list) else 0,
                }

            return {"success": False, "message": f"Jackett API returned status {response.status}"}

    except aiohttp.ClientError as e:
        _logger.exception("Jackett connection error")
        return {"success": False, "message": f"Connection error: {e}"}
    except Exception as e:
        _logger.exception("Unexpected error testing Jackett")
        return {"success": False, "message": f"Error: {e}"}


async def get_indexer_config(
    host: str,
    port: int,
    api_key: str,
    session_cookie: str | None,
    indexer_name: str = "myanonamouse",
) -> list | None:
    """Get indexer configuration from Jackett API.

    Args:
        host: Jackett host
        port: Jackett port
        api_key: Jackett API key
        session_cookie: Session cookie from login (optional if auth disabled)
        indexer_name: Name of the indexer

    Returns:
        List of config fields if successful, None otherwise
    """
    url = f"http://{host}:{port}/api/v2.0/indexers/{indexer_name}/config"
    headers = {"X-Api-Key": api_key}
    if session_cookie:
        headers["Cookie"] = session_cookie

    try:
        jar = aiohttp.CookieJar(unsafe=True)
        async with (
            aiohttp.ClientSession(cookie_jar=jar) as session,
            session.get(
                url, headers=headers, params={"apikey": api_key}, timeout=_TIMEOUT
            ) as response,
        ):
            if response.status == 200:
                config = await response.json()
                _logger.info("Retrieved config for %s", indexer_name)
                return config

            text = await response.text()
            _logger.error("Failed to get config: %s - %s", response.status, text[:200])
            return None

    except Exception:
        _logger.exception("Error getting indexer config")
        return None


async def update_indexer_config(
    host: str,
    port: int,
    api_key: str,
    session_cookie: str | None,
    config: list,
    indexer_name: str = "myanonamouse",
) -> bool:
    """Update indexer configuration via Jackett API.

    Args:
        host: Jackett host
        port: Jackett port
        api_key: Jackett API key
        session_cookie: Session cookie from login (optional if auth disabled)
        config: List of config fields to update
        indexer_name: Name of the indexer

    Returns:
        True if successful, False otherwise
    """
    url = f"http://{host}:{port}/api/v2.0/indexers/{indexer_name}/config"
    headers = {
        "X-Api-Key": api_key,
        "Content-Type": "application/json",
    }
    if session_cookie:
        headers["Cookie"] = session_cookie

    try:
        jar = aiohttp.CookieJar(unsafe=True)
        async with (
            aiohttp.ClientSession(cookie_jar=jar) as session,
            session.post(
                url, headers=headers, json=config, params={"apikey": api_key}, timeout=_TIMEOUT
            ) as response,
        ):
            if response.status in [200, 204]:
                _logger.info("Successfully updated config for %s", indexer_name)
                return True

            response_text = await response.text()
            _logger.error("Failed to update config: %s - %s", response.status, response_text[:200])
            return False

    except Exception:
        _logger.exception("Error updating indexer config")
        return False


def update_mam_id_in_config(config: list, new_mam_id: str) -> list:
    """Update the mam_id field in the configuration array.

    Args:
        config: List of config field objects
        new_mam_id: The new MAM ID to set

    Returns:
        Updated configuration list
    """
    for field in config:
        if isinstance(field, dict) and field.get("id") == "mam_id":
            old_value = field.get("value")
            field["value"] = new_mam_id
            _logger.info("[Jackett] Updated mam_id from '%s' to '%s'", old_value, new_mam_id)
            break
    return config


async def sync_mam_id_to_jackett(
    host: str,
    port: int,
    api_key: str,
    admin_password: str,
    new_mam_id: str,
    indexer_name: str = "myanonamouse",
) -> dict[str, Any]:
    """Sync MAM ID to Jackett configuration via API.

    Args:
        host: Jackett host
        port: Jackett port
        api_key: Jackett API key
        admin_password: Jackett admin password
        new_mam_id: The new MAM ID to set
        indexer_name: Name of the indexer

    Returns:
        Dictionary with success/error status and message
    """
    try:
        # Step 1: Always get session cookies (even if auth disabled)
        session_cookie = await jackett_login(host, port, admin_password)
        if not session_cookie and admin_password:
            # Only fail if password was provided but login failed
            return {
                "success": False,
                "error": "Failed to authenticate with Jackett. Check admin password.",
            }

        # Step 2: Get current config
        config = await get_indexer_config(host, port, api_key, session_cookie, indexer_name)
        if config is None:
            return {
                "success": False,
                "error": f"Failed to retrieve config for {indexer_name}. Check API key and indexer name.",
            }

        # Step 3: Update the mam_id field
        updated_config = update_mam_id_in_config(config, new_mam_id)

        # Step 4: Send updated config back
        success = await update_indexer_config(
            host, port, api_key, session_cookie, updated_config, indexer_name
        )
        if success:
            return {
                "success": True,
                "message": f"Successfully updated MAM ID to {new_mam_id} in Jackett",
            }
        return {"success": False, "error": "Failed to update config via API"}

    except Exception as e:
        _logger.exception("Error syncing MAM ID to Jackett")
        return {"success": False, "error": str(e)}
