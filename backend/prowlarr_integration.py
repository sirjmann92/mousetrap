"""Prowlarr integration for syncing the MAM ID to its MyAnonamouse indexer.

The API calls live in :mod:`backend.servarr_client`, which Chaptarr shares. This
module supplies Prowlarr's service description and keeps the public functions
the rest of the app imports.
"""

from typing import Any

from backend.servarr_client import (
    ServarrService,
    find_indexer_id,
    get_indexer_config as _get_indexer_config,
    sync_mam_id,
    test_connection,
    update_mam_id,
)

# Prowlarr names the implementation in `definitionName` and matches it exactly,
# and does not need forceSave on the update.
PROWLARR = ServarrService(
    name="Prowlarr",
    config_key="prowlarr",
    indexer_match_field="definitionName",
    indexer_label="MyAnonamouse",
    match_case_insensitive=False,
    force_save=False,
)


async def test_prowlarr_connection(host: str, port: int, api_key: str) -> dict[str, Any]:
    """Test connection to Prowlarr and return indexer count."""
    return await test_connection(PROWLARR, host, port, api_key)


async def find_mam_indexer_id(host: str, port: int, api_key: str) -> dict[str, Any]:
    """Find the MyAnonamouse indexer ID in Prowlarr."""
    return await find_indexer_id(PROWLARR, host, port, api_key)


async def get_indexer_config(host: str, port: int, api_key: str, indexer_id: int) -> dict[str, Any]:
    """Fetch the full indexer configuration from Prowlarr."""
    return await _get_indexer_config(PROWLARR, host, port, api_key, indexer_id)


async def update_mam_id_in_prowlarr(
    host: str, port: int, api_key: str, indexer_id: int, new_mam_id: str
) -> dict[str, Any]:
    """Update the MAM ID on a Prowlarr indexer."""
    return await update_mam_id(PROWLARR, host, port, api_key, indexer_id, new_mam_id)


async def sync_mam_id_to_prowlarr(session_cfg: dict[str, Any], mam_id: str) -> dict[str, Any]:
    """Sync the MAM ID to Prowlarr, auto-detecting the indexer each time."""
    return await sync_mam_id(PROWLARR, session_cfg, mam_id)
