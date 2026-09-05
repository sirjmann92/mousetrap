"""Shared client for Servarr-style indexer services (Prowlarr, Chaptarr).

Both services expose the same `/api/v1/indexer` API and were implemented as
near-identical modules — 91.5% of their lines matched once the service name was
normalised. This holds the one implementation; the per-service modules supply a
:class:`ServarrService` describing where they genuinely differ and keep their
existing public functions as thin wrappers.

The differences are deliberately narrow and each is load-bearing:

- **How the MAM indexer is recognised.** Prowlarr matches ``definitionName``
  exactly; Chaptarr matches ``implementation`` case-insensitively.
- **Whether the update forces a save.** Chaptarr appends ``?forceSave=true``.
- **The spelling used in messages.** Prowlarr says "MyAnonamouse", Chaptarr
  says "MyAnonaMouse", and both spellings are user-visible.

The MAM ID field itself is ``mamId`` on both, lowercase. Chaptarr shipped with
``MamId`` and it failed with "MAM ID field not found" until 4e08272f corrected
it; the match is exact rather than case-insensitive on both services.
"""

from dataclasses import dataclass
import json
import logging
from typing import Any

import aiohttp

from backend.url_builder import build_service_url

_logger: logging.Logger = logging.getLogger(__name__)
_TIMEOUT = aiohttp.ClientTimeout(total=10)

# The MAM ID field is spelled the same on every Servarr service.
MAM_ID_FIELD = "mamId"


@dataclass(frozen=True)
class ServarrService:
    """Describes how one Servarr-style service differs from the others.

    Attributes:
        name: Display name used in messages and log lines.
        config_key: Key holding this service's settings in a session config.
        indexer_match_field: Indexer field naming the implementation.
        indexer_label: Spelling of the MAM indexer in user-visible messages.
        match_case_insensitive: Whether the indexer match ignores case.
        force_save: Whether the update PUT appends ``?forceSave=true``.

    """

    name: str
    config_key: str
    indexer_match_field: str
    indexer_label: str
    match_case_insensitive: bool
    force_save: bool


async def test_connection(
    service: ServarrService, host: str, port: int, api_key: str
) -> dict[str, Any]:
    """Test connectivity and report how many indexers the service has.

    Args:
        service: Service description.
        host: Service host.
        port: Service port.
        api_key: Service API key.

    Returns:
        dict with ``success``, ``message`` and, on success, ``indexer_count``.

    """
    url = build_service_url(host, port, "/api/v1/indexer")
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
        _logger.error("%s connection test failed: %s", service.name, e)
        return {"success": False, "message": str(e)}


def _is_mam_indexer(service: ServarrService, indexer: dict[str, Any]) -> bool:
    """Return whether an indexer entry is the MAM indexer for this service."""
    value = indexer.get(service.indexer_match_field, "")
    if service.match_case_insensitive:
        return str(value).lower() == service.indexer_label.lower()
    return bool(value == service.indexer_label)


async def find_indexer_id(
    service: ServarrService, host: str, port: int, api_key: str
) -> dict[str, Any]:
    """Locate the MAM indexer's id by scanning the service's indexer list.

    Args:
        service: Service description.
        host: Service host.
        port: Service port.
        api_key: Service API key.

    Returns:
        dict with ``success``, ``message`` and, when found, ``indexer_id``.

    """
    url = build_service_url(host, port, "/api/v1/indexer")
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
                if _is_mam_indexer(service, indexer):
                    indexer_id = indexer.get("id")
                    _logger.info(
                        "Found MAM indexer in %s: id=%s, name=%s",
                        service.name,
                        indexer_id,
                        indexer.get("name"),
                    )
                    return {
                        "success": True,
                        "indexer_id": indexer_id,
                        "message": f"Found {service.indexer_label} indexer (ID: {indexer_id})",
                    }

            return {
                "success": False,
                "message": (
                    f"{service.indexer_label} indexer not found in {service.name}. "
                    "Please add it first."
                ),
            }

    except Exception as e:
        _logger.exception("Failed to find MAM indexer")
        return {"success": False, "message": f"Error: {e!s}"}


async def get_indexer_config(
    service: ServarrService, host: str, port: int, api_key: str, indexer_id: int
) -> dict[str, Any]:
    """Fetch one indexer's full configuration.

    Args:
        service: Service description.
        host: Service host.
        port: Service port.
        api_key: Service API key.
        indexer_id: Indexer id to fetch.

    Returns:
        dict with ``success``, ``message`` and, on success, ``config``.

    """
    url = build_service_url(host, port, f"/api/v1/indexer/{indexer_id}")
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


async def update_mam_id(
    service: ServarrService,
    host: str,
    port: int,
    api_key: str,
    indexer_id: int,
    new_mam_id: str,
) -> dict[str, Any]:
    """Rewrite the indexer's MAM ID field and save it back.

    Args:
        service: Service description.
        host: Service host.
        port: Service port.
        api_key: Service API key.
        indexer_id: Indexer id to update.
        new_mam_id: MAM ID to write.

    Returns:
        dict with ``success``, ``message`` and, on success, ``old_mam_id``.

    """
    get_result = await get_indexer_config(service, host, port, api_key, indexer_id)
    if not get_result["success"]:
        return get_result

    config = get_result["config"]

    old_mam_id = None
    mam_id_found = False
    for field in config.get("fields", []):
        if field.get("name") == MAM_ID_FIELD:
            old_mam_id = field.get("value", "")
            field["value"] = new_mam_id
            mam_id_found = True
            _logger.info("Updating MAM ID in %s: %s -> %s", service.name, old_mam_id, new_mam_id)
            break

    if not mam_id_found:
        return {
            "success": False,
            "message": "MAM ID field not found in indexer configuration.",
        }

    path = f"/api/v1/indexer/{indexer_id}"
    if service.force_save:
        path += "?forceSave=true"
    url = build_service_url(host, port, path)
    headers = {"X-Api-Key": api_key, "Content-Type": "application/json"}

    try:
        async with (
            aiohttp.ClientSession() as session,
            session.put(url, headers=headers, json=config, timeout=_TIMEOUT) as response,
        ):
            if response.status in (200, 202):
                _logger.info(
                    "Successfully updated MAM ID in %s (indexer %s)", service.name, indexer_id
                )
                return {
                    "success": True,
                    "message": (
                        f"MAM ID updated successfully in {service.name} (indexer {indexer_id})"
                    ),
                    "old_mam_id": old_mam_id,
                }

            # Parse the error body as JSON where possible so the frontend can
            # show the service's own validation detail rather than raw text.
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
                    "detail": error_data,
                }
    except Exception as e:
        _logger.exception("Failed to update MAM ID in %s", service.name)
        return {"success": False, "message": f"Error: {e!s}"}


async def sync_mam_id(
    service: ServarrService, session_cfg: dict[str, Any], mam_id: str
) -> dict[str, Any]:
    """Detect the MAM indexer and write a new MAM ID to it.

    Args:
        service: Service description.
        session_cfg: Session configuration holding this service's settings.
        mam_id: MAM ID to sync.

    Returns:
        dict with ``success`` and ``message``.

    """
    service_cfg = session_cfg.get(service.config_key, {})

    if not service_cfg.get("enabled", False):
        return {
            "success": False,
            "message": (
                f"{service.name} integration is not enabled for this session. "
                f"Please enable {service.name} and save your session."
            ),
        }

    host = service_cfg.get("host", "").strip()
    port = service_cfg.get("port")
    api_key = service_cfg.get("api_key", "").strip()

    if not all([host, port, api_key]):
        return {
            "success": False,
            "message": (
                f"{service.name} configuration incomplete. Please configure host, port, "
                "and API key, then save your session before updating."
            ),
        }

    _logger.info("Auto-detecting MAM indexer ID in %s...", service.name)
    find_result = await find_indexer_id(service, host, port, api_key)
    if not find_result["success"]:
        return find_result

    return await update_mam_id(service, host, port, api_key, find_result["indexer_id"], mam_id)
