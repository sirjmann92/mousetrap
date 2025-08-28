
from fastapi import APIRouter, HTTPException, Query
from backend.proxy_config import load_proxies, save_proxies

router = APIRouter()
# Test a proxy and return its proxied public IP and ASN
@router.get("/proxy_test/{label}")
def proxy_test(label: str):
    from backend.ip_lookup import get_ipinfo_with_fallback, get_public_ip, get_asn_and_timezone_from_ip
    proxies = load_proxies()
    proxy_cfg = proxies.get(label)
    if not proxy_cfg:
        raise HTTPException(status_code=404, detail="Proxy not found.")
    ipinfo_data = get_ipinfo_with_fallback(proxy_cfg=proxy_cfg)
    proxied_ip = get_public_ip(proxy_cfg=proxy_cfg, ipinfo_data=ipinfo_data)
    asn_full, _ = get_asn_and_timezone_from_ip(proxied_ip, proxy_cfg=proxy_cfg, ipinfo_data=ipinfo_data)
    return {
        "proxied_ip": proxied_ip,
        "proxied_asn": asn_full
    }

@router.get("/proxies")
def list_proxies():
    """List all proxy configurations."""
    return load_proxies()

@router.post("/proxies")
def create_proxy(proxy: dict):
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
def update_proxy(label: str, proxy: dict):
    """Update an existing proxy configuration."""
    proxies = load_proxies()
    if label not in proxies:
        raise HTTPException(status_code=404, detail="Proxy not found.")
    proxies[label] = proxy
    save_proxies(proxies)
    return {"success": True}

@router.delete("/proxies/{label}")
def delete_proxy(label: str):
    """Delete a proxy configuration by label."""
    proxies = load_proxies()
    if label not in proxies:
        raise HTTPException(status_code=404, detail="Proxy not found.")
    del proxies[label]
    save_proxies(proxies)
    return {"success": True}
