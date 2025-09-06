#!/usr/bin/env python3
"""
MAM Millionaire's Vault API Discovery
Test if seedbox mam_id can access vault data through any API endpoints
"""

import requests
import logging
from backend.utils import build_proxy_dict

def test_vault_endpoints(mam_id, proxy_cfg=None):
    """
    Test various MAM endpoints to see if any provide vault data with seedbox mam_id
    """
    proxies = build_proxy_dict(proxy_cfg)
    cookies = {"mam_id": mam_id}
    
    # Use proper browser headers to prevent logout
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    endpoints_to_test = [
        # Known working endpoint
        "https://www.myanonamouse.net/jsonLoad.php?snatch_summary",
        
        # Potential vault-related endpoints to test
        "https://www.myanonamouse.net/jsonLoad.php?millionaires",
        "https://www.myanonamouse.net/jsonLoad.php?vault", 
        "https://www.myanonamouse.net/jsonLoad.php?donate",
        "https://www.myanonamouse.net/jsonLoad.php?user_summary",
        "https://www.myanonamouse.net/jsonLoad.php?bonus_summary",
        
        # Alternative API patterns
        "https://www.myanonamouse.net/api/millionaires",
        "https://www.myanonamouse.net/millionaires/api.php",
    ]
    
    results = {}
    
    for endpoint in endpoints_to_test:
        try:
            logging.info(f"Testing endpoint: {endpoint}")
            resp = requests.get(endpoint, cookies=cookies, timeout=10, proxies=proxies, headers=headers)
            
            results[endpoint] = {
                "status_code": resp.status_code,
                "success": resp.status_code == 200,
                "response_size": len(resp.text),
                "has_json": False,
                "data_preview": resp.text[:200] if resp.text else None
            }
            
            if resp.status_code == 200:
                try:
                    json_data = resp.json()
                    results[endpoint]["has_json"] = True
                    results[endpoint]["json_keys"] = list(json_data.keys()) if isinstance(json_data, dict) else "not_dict"
                    
                    # Look for vault-related data
                    if isinstance(json_data, dict):
                        vault_keys = [k for k in json_data.keys() if any(term in k.lower() for term in ['vault', 'millionaire', 'donate', 'bonus'])]
                        if vault_keys:
                            results[endpoint]["potential_vault_keys"] = vault_keys
                            logging.info(f"Found potential vault keys in {endpoint}: {vault_keys}")
                            
                except Exception as json_e:
                    results[endpoint]["json_error"] = str(json_e)
                    
        except Exception as e:
            results[endpoint] = {
                "error": str(e),
                "success": False
            }
            logging.warning(f"Failed to test {endpoint}: {e}")
    
    return results

def safe_cookie_validation_test(mam_id_browser, uid, proxy_cfg=None):
    """
    Test safe endpoints for browser cookie validation
    These should NOT trigger any donations or state changes
    """
    proxies = build_proxy_dict(proxy_cfg)
    browser_cookies = {"mam_id": mam_id_browser, "uid": uid}
    
    # Use proper browser headers to prevent logout
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    safe_endpoints = [
        # User profile/account pages (read-only)
        "https://www.myanonamouse.net/u/",
        "https://www.myanonamouse.net/preferences.php",
        "https://www.myanonamouse.net/jsonLoad.php?snatch_summary",
        
        # These might be safe for validation
        "https://www.myanonamouse.net/millionaires/",  # Main page (no donation)
    ]
    
    results = {}
    
    for endpoint in safe_endpoints:
        try:
            resp = requests.get(endpoint, cookies=browser_cookies, timeout=10, proxies=proxies, headers=headers)
            results[endpoint] = {
                "status_code": resp.status_code,
                "success": resp.status_code == 200,
                "authenticated": "login" not in resp.url.lower() and resp.status_code != 403
            }
        except Exception as e:
            results[endpoint] = {"error": str(e)}
    
    return results

if __name__ == "__main__":
    # Example usage - would need real credentials to test
    print("MAM Vault API Discovery Tool")
    print("This tool tests if seedbox mam_id can access vault data")
    print("Run with: python -m backend.mam_vault_discovery")
