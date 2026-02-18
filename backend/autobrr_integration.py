"""Autobrr integration for updating MAM indexer configuration.

This module provides functionality to:
- Test Autobrr API connectivity
- Update MAM session ID in Autobrr when session changes

Key details:
- Authentication: X-API-Token header
- Endpoint: PUT /api/indexer/{id}
- Field name: settings.cookie (contains mam_id)
- Indexer identifier: "myanonamouse" (lowercase)
"""

import logging
from typing import Any

import aiohttp

from backend.utils import handle_http_error

_logger = logging.getLogger(__name__)
_TIMEOUT = aiohttp.ClientTimeout(total=10)
_INDEXER_IDENTIFIER = "myanonamouse"  # Lowercase identifier used by Autobrr


async def test_autobrr_connection(host: str, port: int, api_key: str) -> dict[str, Any]:
    """Test connection to Autobrr API.

    Attempts to GET the indexer list to verify connectivity and auth.

    Args:
        host: Autobrr host
        port: Autobrr port
        api_key: Autobrr API key (X-API-Token header)

    Returns:
        dict with keys:
            - success: bool
            - message: str
    """
    url = f"http://{host}:{port}/api/indexer"
    headers = {"X-API-Token": api_key}

    try:
        async with (
            aiohttp.ClientSession() as session,
            session.get(url, headers=headers, timeout=_TIMEOUT) as response,
        ):
            if response.status == 200:
                indexers = await response.json()
                # Check if MAM indexer exists
                mam_indexer = next(
                    (idx for idx in indexers if idx.get("identifier") == _INDEXER_IDENTIFIER),
                    None,
                )
                if mam_indexer:
                    return {
                        "success": True,
                        "message": f"Connected successfully. MyAnonamouse indexer found (ID: {mam_indexer.get('id')}).",
                    }
                return {
                    "success": True,
                    "message": "Connected successfully. MyAnonamouse indexer not configured.",
                }

            # Handle errors (returns with 'error' key, convert to 'message' for test endpoint)
            error_result = handle_http_error(response.status, await response.text(), "MyAnonamouse")
            return {"success": False, "message": error_result.get("error", "Unknown error")}

    except aiohttp.ClientConnectorError:
        return {
            "success": False,
            "message": f"Cannot connect to {host}:{port}. Check host and port.",
        }
    except TimeoutError:
        return {"success": False, "message": "Connection timeout"}
    except Exception as e:
        _logger.exception("Autobrr connection test failed")
        return {"success": False, "message": str(e)}


async def sync_mam_id_to_autobrr(
    host: str, port: int, api_key: str, new_mam_id: str
) -> dict[str, Any]:
    """Update MAM session ID in Autobrr.

    Finds the MyAnonamouse indexer and updates its settings.cookie field via PUT request.

    Args:
        host: Autobrr host
        port: Autobrr port
        api_key: Autobrr API key (X-API-Token header)
        new_mam_id: New MAM session ID to set

    Returns:
        dict with keys:
            - success: bool
            - message: str (if success)
            - error: str (if failure)
    """
    headers = {"X-API-Token": api_key, "Content-Type": "application/json"}
    list_url = f"http://{host}:{port}/api/indexer"

    try:
        # First, get the list of indexers to find MAM indexer ID
        async with aiohttp.ClientSession() as session:
            async with session.get(list_url, headers=headers, timeout=_TIMEOUT) as response:
                if response.status != 200:
                    return handle_http_error(response.status, await response.text(), "MyAnonamouse")

                indexers = await response.json()

            # Find MAM indexer by identifier
            mam_indexer = next(
                (idx for idx in indexers if idx.get("identifier") == _INDEXER_IDENTIFIER),
                None,
            )

            if not mam_indexer:
                return {
                    "success": False,
                    "error": "MyAnonamouse indexer not found. Please configure it in Autobrr first.",
                }

            indexer_id = mam_indexer["id"]

            # Get full indexer details
            get_url = f"http://{host}:{port}/api/indexer/{indexer_id}"
            async with session.get(get_url, headers=headers, timeout=_TIMEOUT) as response:
                if response.status != 200:
                    return handle_http_error(response.status, await response.text(), "MyAnonamouse")

                indexer_data = await response.json()

            # Update the settings.cookie field
            if "settings" not in indexer_data:
                indexer_data["settings"] = {}
            indexer_data["settings"]["cookie"] = new_mam_id

            # Send PUT request to update indexer
            put_url = f"http://{host}:{port}/api/indexer/{indexer_id}"
            async with session.put(
                put_url, headers=headers, json=indexer_data, timeout=_TIMEOUT
            ) as response:
                if response.status in [200, 204]:
                    _logger.info(
                        "[Autobrr] Successfully updated MAM cookie (mam_id) to '%s'", new_mam_id
                    )
                    return {
                        "success": True,
                        "message": f"Successfully updated MAM session ID to {new_mam_id}",
                    }

                # Use shared error handler
                error_result = handle_http_error(
                    response.status, await response.text(), "MyAnonamouse"
                )
                _logger.error("Autobrr update failed: %s", error_result.get("error"))
                return error_result

    except aiohttp.ClientConnectorError:
        return {
            "success": False,
            "error": f"Cannot connect to {host}:{port}. Check host and port.",
        }
    except TimeoutError:
        return {"success": False, "error": "Connection timeout"}
    except Exception as e:
        _logger.exception("Autobrr MAM ID sync failed")
        return {"success": False, "error": str(e)}
