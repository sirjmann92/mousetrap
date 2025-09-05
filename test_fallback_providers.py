#!/usr/bin/env python3
"""
Test the full provider chain manually by simulating failures
"""

import requests
import json
import os
import sys
from unittest.mock import patch

def test_ipinfo_standard():
    """Test IPinfo Standard when other providers fail"""
    print("=== Testing IPinfo Standard Fallback ===")
    
    # Test the actual API
    try:
        response = requests.get("https://ipinfo.io/8.8.8.8/json", timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Raw response: {json.dumps(data, indent=2)}")
            # Normalize like our code does
            normalized = {
                'ip': data.get('ip'),
                'asn': data.get('org', '').split()[0] if data.get('org') else None,
                'org': data.get('org', '').split(' ', 1)[1] if data.get('org') and ' ' in data.get('org', '') else data.get('org'),
                'timezone': data.get('timezone')
            }
            print(f"✅ Normalized: {json.dumps(normalized, indent=2)}")
            return True
        else:
            print(f"❌ Failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Exception: {e}")
        return False

def test_ipify():
    """Test ipify as final fallback"""
    print("\n=== Testing ipify.org (IP-only fallback) ===")
    
    try:
        response = requests.get("https://api.ipify.org?format=json", timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Raw response: {json.dumps(data, indent=2)}")
            normalized = {
                'ip': data.get('ip'),
                'asn': None,
                'org': None,
                'timezone': None
            }
            print(f"✅ Normalized: {json.dumps(normalized, indent=2)}")
            return True
        else:
            print(f"❌ Failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Exception: {e}")
        return False

if __name__ == "__main__":
    success_count = 0
    
    if test_ipinfo_standard():
        success_count += 1
    
    if test_ipify():
        success_count += 1
        
    print(f"\n=== SUMMARY ===")
    print(f"Working providers: {success_count}/2")
    
    if success_count == 2:
        print("✅ All fallback providers working!")
        sys.exit(0)
    else:
        print("❌ Some providers failed")
        sys.exit(1)
