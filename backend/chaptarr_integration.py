"""Chaptarr integration for syncing the MAM ID to its MyAnonaMouse indexer.

The API calls live in :mod:`backend.servarr_client`, which Prowlarr shares. This
module supplies Chaptarr's service description and keeps the public functions
the rest of the app imports.

Chaptarr differs from Prowlarr in three ways, all captured in `CHAPTARR` below:
it names the implementation in `implementation` and matches case-insensitively,
it spells the indexer "MyAnonaMouse", and its update PUT needs `forceSave=true`.
The MAM ID field is `mamId` on both, lowercase.
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

CHAPTARR = ServarrService(
    name="Chaptarr",
    config_key="chaptarr",
    indexer_match_field="implementation",
    indexer_label="MyAnonaMouse",
    match_case_insensitive=True,
    force_save=True,
)


async def test_chaptarr_connection(host: str, port: int, api_key: str) -> dict[str, Any]:
    """Test connection to Chaptarr and return indexer count."""
    return await test_connection(CHAPTARR, host, port, api_key)


async def find_mam_indexer_id(host: str, port: int, api_key: str) -> dict[str, Any]:
    """Find the MyAnonaMouse indexer ID in Chaptarr, matching case-insensitively."""
    return await find_indexer_id(CHAPTARR, host, port, api_key)


async def get_indexer_config(host: str, port: int, api_key: str, indexer_id: int) -> dict[str, Any]:
    """Fetch the full indexer configuration from Chaptarr."""
    return await _get_indexer_config(CHAPTARR, host, port, api_key, indexer_id)


async def update_mam_id_in_chaptarr(
    host: str, port: int, api_key: str, indexer_id: int, new_mam_id: str
) -> dict[str, Any]:
    """Update the MAM ID on a Chaptarr indexer, forcing a save."""
    return await update_mam_id(CHAPTARR, host, port, api_key, indexer_id, new_mam_id)


async def sync_mam_id_to_chaptarr(session_cfg: dict[str, Any], mam_id: str) -> dict[str, Any]:
    """Sync the MAM ID to Chaptarr, auto-detecting the indexer each time."""
    return await sync_mam_id(CHAPTARR, session_cfg, mam_id)
