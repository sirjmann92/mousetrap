"""Prowlarr integration for updating MAM indexer configuration.

This module provides functionality to:
- Test Prowlarr API connectivity
- Auto-detect MyAnonamouse indexer ID
- Update MAM ID in Prowlarr when session changes
"""

import json
import logging
from typing import Any

import aiohttp

_logger = logging.getLogger(__name__)
_TIMEOUT = aiohttp.ClientTimeout(total=10)


async def test_prowlarr_connection(host: str, port: int, api_key: str) -> dict[str, Any]:
    """Test connection to Prowlarr and return indexer count."""
    url = f"http://{host}:{port}/api/v1/indexer"
    headers = {"X-Api-Key": api_key}

    try:
        async with (
            aiohttp.ClientSession() as session,
            session.get(url, headers=headers, timeout=_TIMEOUT) as response,
        ):
            if response.status == 200:
                indexers = await response.json()
                return {
                    "success": True,
                    "message": f"Connected successfully. Found {len(indexers)} indexer(s).",
                    "indexer_count": len(indexers),
                }
            if response.status == 401:
                return {"success": False, "message": "Authentication failed. Check API key."}

            return {"success": False, "message": f"Connection failed: HTTP {response.status}"}
    except TimeoutError:
        return {"success": False, "message": "Connection timeout"}
    except Exception as e:
        _logger.error("Prowlarr connection test failed: %s", e)
        return {"success": False, "message": str(e)}


async def find_mam_indexer_id(host: str, port: int, api_key: str) -> dict[str, Any]:
    """Find the MyAnonamouse indexer ID in Prowlarr.

    Fetches all indexers and searches for one with definitionName="MyAnonamouse".

    Args:
        host: Prowlarr host
        port: Prowlarr port
        api_key: Prowlarr API key

    Returns:
        dict with keys:
            - success: bool
            - indexer_id: int (if found)
            - message: str
    """
    url = f"http://{host}:{port}/api/v1/indexer"
    headers = {"X-Api-Key": api_key}

    try:
        async with (
            aiohttp.ClientSession() as session,
            session.get(url, headers=headers, timeout=_TIMEOUT) as response,
        ):
            if response.status != 200:
                return {
                    "success": False,
                    "message": f"Failed to fetch indexers: HTTP {response.status}",
                }

            indexers = await response.json()
            for indexer in indexers:
                if indexer.get("definitionName") == "MyAnonamouse":
                    indexer_id = indexer.get("id")
                    _logger.info(
                        "Found MAM indexer in Prowlarr: id=%s, name=%s",
                        indexer_id,
                        indexer.get("name"),
                    )
                    return {
                        "success": True,
                        "indexer_id": indexer_id,
                        "message": f"Found MyAnonamouse indexer (ID: {indexer_id})",
                    }

            return {
                "success": False,
                "message": "MyAnonamouse indexer not found in Prowlarr. Please add it first.",
            }

    except Exception as e:
        _logger.exception("Failed to find MAM indexer")
        return {"success": False, "message": f"Error: {e!s}"}


async def get_indexer_config(host: str, port: int, api_key: str, indexer_id: int) -> dict[str, Any]:
    """Fetch the full indexer configuration from Prowlarr.

    Args:
        host: Prowlarr host
        port: Prowlarr port
        api_key: Prowlarr API key
        indexer_id: Prowlarr indexer ID

    Returns:
        dict with keys:
            - success: bool
            - config: dict (if successful)
            - message: str
    """
    url = f"http://{host}:{port}/api/v1/indexer/{indexer_id}"
    headers = {"X-Api-Key": api_key}

    try:
        async with (
            aiohttp.ClientSession() as session,
            session.get(url, headers=headers, timeout=_TIMEOUT) as response,
        ):
            if response.status == 200:
                config = await response.json()
                return {"success": True, "config": config, "message": "Success"}
            if response.status == 404:
                return {
                    "success": False,
                    "message": f"Indexer ID {indexer_id} not found.",
                }
            return {
                "success": False,
                "message": f"HTTP {response.status}: {response.reason}",
            }
    except Exception as e:
        _logger.exception("Failed to fetch indexer config")
        return {"success": False, "message": f"Error: {e!s}"}


async def update_mam_id_in_prowlarr(
    host: str, port: int, api_key: str, indexer_id: int, new_mam_id: str
) -> dict[str, Any]:
    """Update the MAM ID field in Prowlarr indexer configuration.

    This performs the pull-modify-push workflow:
    1. GET current indexer config
    2. Find and update the "mamId" field
    3. PUT updated config back to Prowlarr

    Args:
        host: Prowlarr host
        port: Prowlarr port
        api_key: Prowlarr API key
        indexer_id: Prowlarr indexer ID
        new_mam_id: New MAM ID to set

    Returns:
        dict with keys:
            - success: bool
            - message: str
            - old_mam_id: str (if successful)
    """
    # Step 1: Get current config
    get_result = await get_indexer_config(host, port, api_key, indexer_id)
    if not get_result["success"]:
        return get_result

    config = get_result["config"]

    # Step 2: Find and update mamId field
    old_mam_id = None
    mam_id_found = False

    fields = config.get("fields", [])
    for field in fields:
        if field.get("name") == "mamId":
            old_mam_id = field.get("value", "")
            field["value"] = new_mam_id
            mam_id_found = True
            _logger.info("Updating MAM ID in Prowlarr: %s -> %s", old_mam_id, new_mam_id)
            break

    if not mam_id_found:
        return {
            "success": False,
            "message": "MAM ID field not found in indexer configuration.",
        }

    # Step 3: PUT updated config
    url = f"http://{host}:{port}/api/v1/indexer/{indexer_id}"
    headers = {"X-Api-Key": api_key, "Content-Type": "application/json"}

    try:
        async with (
            aiohttp.ClientSession() as session,
            session.put(url, headers=headers, json=config, timeout=_TIMEOUT) as response,
        ):
            if response.status in (200, 202):
                _logger.info(
                    "Successfully updated MAM ID in Prowlarr (indexer %s)",
                    indexer_id,
                )
                return {
                    "success": True,
                    "message": f"MAM ID updated successfully in Prowlarr (indexer {indexer_id})",
                    "old_mam_id": old_mam_id,
                }

            # Try to parse error response as JSON for better error messages
            error_text = await response.text()
            try:
                error_data = json.loads(error_text)
            except json.JSONDecodeError:
                return {
                    "success": False,
                    "message": f"Failed to update: HTTP {response.status} - {error_text}",
                }
            else:
                return {
                    "success": False,
                    "message": f"Failed to update: HTTP {response.status}",
                    "detail": error_data,  # Pass the full error structure to frontend
                }
    except Exception as e:
        _logger.exception("Failed to update MAM ID in Prowlarr")
        return {"success": False, "message": f"Error: {e!s}"}


async def sync_mam_id_to_prowlarr(session_cfg: dict[str, Any], mam_id: str) -> dict[str, Any]:
    """High-level function to sync MAM ID to Prowlarr with auto-detection.

    This is the main entry point for updating Prowlarr. It:
    1. Validates Prowlarr config exists in session
    2. Auto-detects MAM indexer ID (every time, as requested)
    3. Updates the MAM ID

    Args:
        session_cfg: Session configuration dict with prowlarr settings
        mam_id: New MAM ID to sync

    Returns:
        dict with success, message, and optional details
    """
    prowlarr_cfg = session_cfg.get("prowlarr", {})

    # Validate required config
    if not prowlarr_cfg.get("enabled", False):
        return {
            "success": False,
            "message": "Prowlarr integration is not enabled for this session.",
        }

    host = prowlarr_cfg.get("host", "").strip()
    port = prowlarr_cfg.get("port")
    api_key = prowlarr_cfg.get("api_key", "").strip()

    if not all([host, port, api_key]):
        return {
            "success": False,
            "message": "Prowlarr configuration incomplete. Please configure host, port, and API key.",
        }

    # Auto-detect MAM indexer ID
    _logger.info("Auto-detecting MAM indexer ID in Prowlarr...")
    find_result = await find_mam_indexer_id(host, port, api_key)
    if not find_result["success"]:
        return find_result

    indexer_id = find_result["indexer_id"]

    # Update MAM ID
    return await update_mam_id_in_prowlarr(host, port, api_key, indexer_id, mam_id)
