"""AudioBookRequest integration for updating MAM indexer configuration.

This module provides functionality to:
- Test AudioBookRequest API connectivity
- Update MAM session ID in AudioBookRequest when session changes

Key details:
- Authentication: Bearer token
- Endpoint: PATCH /api/indexers/MyAnonamouse
- Field name: mam_session_id (mapped from mam_id internally)
- Indexer name: "MyAnonamouse" (hardcoded, case-sensitive)
"""

import logging
from typing import Any

import aiohttp

_logger = logging.getLogger(__name__)
_TIMEOUT = aiohttp.ClientTimeout(total=10)
_INDEXER_NAME = "MyAnonamouse"  # Case-sensitive indexer name


def _handle_http_error(status: int, text: str = "") -> dict[str, Any]:
    """Handle common HTTP error status codes.

    Args:
        status: HTTP status code
        text: Response text (optional)

    Returns:
        dict with success=False and appropriate error message
    """
    if status == 401:
        return {"success": False, "error": "Authentication failed. Check API key."}
    if status == 403:
        return {"success": False, "error": "Forbidden. Check API key permissions."}
    if status == 404:
        return {
            "success": False,
            "error": f"{_INDEXER_NAME} indexer not found. Please configure it first.",
        }
    return {
        "success": False,
        "error": f"HTTP {status} - {text[:100]}" if text else f"HTTP {status}",
    }


async def test_audiobookrequest_connection(host: str, port: int, api_key: str) -> dict[str, Any]:
    """Test connection to AudioBookRequest API.

    Attempts to GET the indexer configurations to verify connectivity and auth.

    Args:
        host: AudioBookRequest host
        port: AudioBookRequest port
        api_key: AudioBookRequest API key (Bearer token)

    Returns:
        dict with keys:
            - success: bool
            - message: str
    """
    url = f"http://{host}:{port}/api/indexers/configurations"
    headers = {"Authorization": f"Bearer {api_key}", "accept": "application/json"}

    try:
        async with (
            aiohttp.ClientSession() as session,
            session.get(url, headers=headers, timeout=_TIMEOUT) as response,
        ):
            if response.status == 200:
                config = await response.json()
                has_mam = _INDEXER_NAME in config
                suffix = "found." if has_mam else "not configured."
                return {
                    "success": True,
                    "message": f"Connected successfully. {_INDEXER_NAME} indexer {suffix}",
                }

            # Handle errors (returns with 'error' key, convert to 'message' for test endpoint)
            error_result = _handle_http_error(response.status, await response.text())
            return {"success": False, "message": error_result.get("error", "Unknown error")}

    except aiohttp.ClientConnectorError:
        return {
            "success": False,
            "message": f"Cannot connect to {host}:{port}. Check host and port.",
        }
    except TimeoutError:
        return {"success": False, "message": "Connection timeout"}
    except Exception as e:
        _logger.exception("AudioBookRequest connection test failed")
        return {"success": False, "message": str(e)}


async def sync_mam_id_to_audiobookrequest(
    host: str, port: int, api_key: str, new_mam_id: str
) -> dict[str, Any]:
    """Update MAM session ID in AudioBookRequest.

    Sends a PATCH request to update the mam_session_id field for MyAnonamouse indexer.

    Args:
        host: AudioBookRequest host
        port: AudioBookRequest port
        api_key: AudioBookRequest API key (Bearer token)
        new_mam_id: New MAM session ID to set

    Returns:
        dict with keys:
            - success: bool
            - message: str (if success)
            - error: str (if failure)
    """
    url = f"http://{host}:{port}/api/indexers/{_INDEXER_NAME}"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "accept": "application/json",
        "Content-Type": "application/json",
    }
    payload = {"mam_session_id": new_mam_id}  # Map internal mam_id to mam_session_id

    try:
        async with (
            aiohttp.ClientSession() as session,
            session.patch(url, headers=headers, json=payload, timeout=_TIMEOUT) as response,
        ):
            if response.status in [200, 204]:
                _logger.info(
                    "[AudioBookRequest] Successfully updated mam_session_id to '%s'", new_mam_id
                )
                return {
                    "success": True,
                    "message": f"Successfully updated MAM session ID to {new_mam_id}",
                }

            # Use shared error handler
            error_result = _handle_http_error(response.status, await response.text())
            _logger.error("AudioBookRequest update failed: %s", error_result.get("error"))
            return error_result

    except aiohttp.ClientConnectorError:
        return {
            "success": False,
            "error": f"Cannot connect to {host}:{port}. Check host and port.",
        }
    except TimeoutError:
        return {"success": False, "error": "Connection timeout"}
    except Exception as e:
        _logger.exception("Error syncing MAM ID to AudioBookRequest")
        return {"success": False, "error": str(e)}
