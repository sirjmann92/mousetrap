"""API endpoints for managing proxy configurations and testing proxied public IPs/ASNs.

This module exposes a FastAPI APIRouter with routes to list, create, update,
delete proxy configurations and to test a proxy by returning its proxied
public IP and ASN. It also ensures sessions referencing deleted proxies are
cleaned up.
"""

import logging
from typing import Any

from fastapi import APIRouter, HTTPException

from backend.config import list_sessions, load_session
from backend.ip_lookup import get_asn_and_timezone_from_ip, get_ipinfo_with_fallback, get_public_ip
from backend.proxy_config import load_proxies, save_proxies
from backend.yaml_store import YamlStoreError

router = APIRouter()
_logger: logging.Logger = logging.getLogger(__name__)


@router.get("/proxy_test/{label}")
async def proxy_test(label: str) -> dict[str, Any]:
    """Test a proxy and return its proxied public IP and ASN."""
    proxies = load_proxies()
    proxy_cfg = proxies.get(label)
    if not proxy_cfg:
        raise HTTPException(status_code=404, detail="Proxy not found.")
    ipinfo_data = await get_ipinfo_with_fallback(proxy_cfg=proxy_cfg)
    proxied_ip = await get_public_ip(proxy_cfg=proxy_cfg, ipinfo_data=ipinfo_data)
    if proxied_ip:
        asn_full, _ = await get_asn_and_timezone_from_ip(
            proxied_ip, proxy_cfg=proxy_cfg, ipinfo_data=ipinfo_data
        )
        return {"proxied_ip": proxied_ip, "proxied_asn": asn_full}
    return {"proxied_ip": None, "proxied_asn": None}


@router.get("/proxies")
def list_proxies() -> dict[str, Any]:
    """List all proxy configurations."""
    return load_proxies()


@router.post("/proxies")
def create_proxy(proxy: dict[str, Any]) -> dict[str, Any]:
    """Create a new proxy configuration. Expects a dict with at least a 'label'."""
    proxies = load_proxies()
    label = proxy.get("label")
    if not label:
        raise HTTPException(status_code=400, detail="Proxy label is required.")
    if label in proxies:
        raise HTTPException(status_code=400, detail="Proxy label already exists.")
    proxies[label] = proxy
    save_proxies(proxies)
    return {"success": True}


@router.put("/proxies/{label}")
def update_proxy(label: str, proxy: dict[str, Any]) -> dict[str, Any]:
    """Update an existing proxy configuration."""
    proxies = load_proxies()
    if label not in proxies:
        raise HTTPException(status_code=404, detail="Proxy not found.")
    proxies[label] = proxy
    save_proxies(proxies)
    return {"success": True}


@router.delete("/proxies/{label}")
def delete_proxy(label: str) -> dict[str, Any]:
    """Delete a proxy configuration by label, unless a session still uses it.

    Deleting a proxy used to clear the reference from every session holding it.
    That left those sessions with no proxy at all, which means their MaM traffic
    silently continued over a direct connection — the opposite of what someone
    who configured a proxy wants, and invisible because the delete reported
    success. A proxy still in use is now refused so the user reassigns those
    sessions deliberately.

    Raises:
        HTTPException: 404 if no such proxy exists, or 409 naming the sessions
            that still reference it.

    """
    proxies = load_proxies()
    if label not in proxies:
        raise HTTPException(status_code=404, detail="Proxy not found.")

    in_use = []
    for sess_label in list_sessions():
        try:
            cfg = load_session(sess_label)
        except YamlStoreError as err:
            # A session that cannot be read cannot be cleared of the reference
            # either, so it counts as in use rather than being skipped.
            _logger.warning(
                "Treating corrupt session '%s' as a possible proxy user: %s",
                sess_label,
                err,
            )
            in_use.append(sess_label)
            continue
        proxy_cfg = cfg.get("proxy", {})
        if isinstance(proxy_cfg, dict) and proxy_cfg.get("label") == label:
            in_use.append(sess_label)

    if in_use:
        listed = ", ".join(f"'{name}'" for name in in_use)
        raise HTTPException(
            status_code=409,
            detail=(
                f"Proxy '{label}' is still used by {listed}. Change or remove the "
                f"proxy on {'those sessions' if len(in_use) > 1 else 'that session'} "
                f"first, then delete it."
            ),
        )

    del proxies[label]
    save_proxies(proxies)
    return {"success": True}
