#!/usr/bin/env python3
"""
Test script to manually verify all IP lookup providers work correctly.
This tests the actual provider URLs and response parsing.
"""

import requests
import json
import os
import sys

def test_provider(name, url, headers=None):
    """Test a single provider and return normalized results"""
    print(f"\n=== Testing {name} ===")
    print(f"URL: {url}")
    print(f"Headers: {headers}")
    
    try:
        response = requests.get(url, headers=headers or {}, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: HTTP {response.status_code}")
            print(f"Response: {response.text[:200]}")
            return None
            
        data = response.json()
        print(f"Raw Response: {json.dumps(data, indent=2)}")
        
        # Normalize based on provider type
        if 'ipinfo' in name.lower():
            normalized = {
                'ip': data.get('ip'),
                'asn': data.get('org', '').split()[0] if data.get('org') else None,
                'org': data.get('org', '').split(' ', 1)[1] if data.get('org') and ' ' in data.get('org', '') else data.get('org'),
                'timezone': data.get('timezone')
            }
        elif 'ipdata' in name.lower():
            normalized = {
                'ip': data.get('ip'),
                'asn': f"AS{data.get('asn', {}).get('asn')}" if data.get('asn', {}).get('asn') else None,
                'org': data.get('asn', {}).get('name'),
                'timezone': data.get('time_zone', {}).get('name')
            }
        elif 'ip-api' in name.lower():
            normalized = {
                'ip': data.get('query'),
                'asn': data.get('as', '').split()[0] if data.get('as') else None,
                'org': data.get('as', '').split(' ', 1)[1] if data.get('as') and ' ' in data.get('as', '') else data.get('as'),
                'timezone': data.get('timezone')
            }
        elif 'ipify' in name.lower():
            normalized = {
                'ip': data.get('ip'),
                'asn': None,
                'org': None,
                'timezone': None
            }
        else:
            normalized = data
            
        print(f"✅ SUCCESS - Normalized: {json.dumps(normalized, indent=2)}")
        return normalized
        
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        return None

def main():
    """Test all providers in the fallback chain"""
    print("Testing IP Lookup Provider Chain")
    print("=" * 50)
    
    # Test IP (using a known public IP for consistency)
    test_ip = "8.8.8.8"  # Google DNS for consistent testing
    
    # Headers
    headers = {'Accept': 'application/json'}
    
    # Get environment variables (will be empty in this test)
    ipinfo_token = os.environ.get("IPINFO_API_TOKEN")
    ipdata_key = os.environ.get("IPDATA_API_KEY")
    
    print(f"Test IP: {test_ip}")
    print(f"IPinfo Token: {'SET' if ipinfo_token else 'NOT SET'}")
    print(f"IPdata Key: {'SET' if ipdata_key else 'NOT SET'}")
    
    results = {}
    
    # 1. IPinfo Lite (with token)
    if ipinfo_token:
        headers_ipinfo = headers.copy()
        headers_ipinfo['Authorization'] = f'Bearer {ipinfo_token}'
        results['ipinfo_lite'] = test_provider(
            "IPinfo Lite (with token)", 
            f"https://api.ipinfo.io/lite/{test_ip}",
            headers_ipinfo
        )
    else:
        print(f"\n=== Skipping IPinfo Lite (no token) ===")
    
    # 2. ipdata.co (with or without key)
    if ipdata_key:
        results['ipdata_with_key'] = test_provider(
            "ipdata.co (with API key)",
            f"https://api.ipdata.co/{test_ip}?api-key={ipdata_key}",
            headers
        )
    else:
        results['ipdata_free'] = test_provider(
            "ipdata.co (free tier)",
            f"https://api.ipdata.co/{test_ip}",
            headers
        )
    
    # 3. ip-api.com
    results['ipapi'] = test_provider(
        "ip-api.com",
        f"http://ip-api.com/json/{test_ip}",
        headers
    )
    
    # 4. IPinfo Standard (without token)
    if not ipinfo_token:
        results['ipinfo_standard'] = test_provider(
            "IPinfo Standard (no token)",
            f"https://ipinfo.io/{test_ip}/json",
            headers
        )
    else:
        print(f"\n=== Skipping IPinfo Standard (token available) ===")
    
    # 5. ipify.org (IP only)
    results['ipify'] = test_provider(
        "ipify.org (IP only)",
        "https://api.ipify.org?format=json",
        headers
    )
    
    # Summary
    print(f"\n" + "=" * 50)
    print("SUMMARY")
    print("=" * 50)
    
    working_providers = []
    failed_providers = []
    
    for provider, result in results.items():
        if result:
            working_providers.append(provider)
            print(f"✅ {provider}: {result.get('ip', 'N/A')} - {result.get('asn', 'N/A')} - {result.get('org', 'N/A')}")
        else:
            failed_providers.append(provider)
            print(f"❌ {provider}: FAILED")
    
    print(f"\nWorking: {len(working_providers)}/{len(results)}")
    if failed_providers:
        print(f"Failed: {', '.join(failed_providers)}")
        return 1
    else:
        print("All providers working! ✅")
        return 0

if __name__ == "__main__":
    sys.exit(main())
