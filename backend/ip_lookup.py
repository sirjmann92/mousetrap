import requests
import os
import logging
from backend.utils import build_proxy_dict
from typing import Optional, Tuple

def get_ipinfo_with_fallback(ip: Optional[str] = None, proxy_cfg=None) -> dict:
    """
    Try ipinfo.io, ipwho.is, ip-api.com, and ipdata.co in order. Return normalized dict with keys: ip, asn, org, timezone.
    """
    providers = []
    token = os.environ.get("IPINFO_TOKEN")
    # Use IPinfo Lite API if token is set, else standard API
    if token:
        if ip:
            url_ipinfo = f"https://api.ipinfo.io/lite/{ip}?token={token}"
        else:
            url_ipinfo = f"https://api.ipinfo.io/lite/me?token={token}"
        providers.append((url_ipinfo, 'ipinfo_lite'))
        logging.debug(f"[IP Lookup] Using IPinfo Lite API with token for IP: {ip or 'self'}")
    else:
        if ip:
            url_ipinfo = f"https://ipinfo.io/{ip}/json"
        else:
            url_ipinfo = "https://ipinfo.io/json"
        providers.append((url_ipinfo, 'ipinfo_standard'))
        logging.debug(f"[IP Lookup] Using IPinfo Standard API (no token) for IP: {ip or 'self'}")
    # Enable fallback providers
    # ip-api.com
    if ip:
        url_ipapi = f"http://ip-api.com/json/{ip}"
    else:
        url_ipapi = "http://ip-api.com/json/"
    providers.append((url_ipapi, 'ipapi'))
    # ipdata.co (test key, low rate limit)
    ipdata_api_key = os.environ.get("IPDATA_API_KEY", "test")
    if ip:
        url_ipdata = f"https://api.ipdata.co/{ip}?api-key={ipdata_api_key}"
    else:
        url_ipdata = f"https://api.ipdata.co/?api-key={ipdata_api_key}"
    providers.append((url_ipdata, 'ipdata'))

    proxies = build_proxy_dict(proxy_cfg) if proxy_cfg else None

    for url, provider in providers:
        try:
            resp = requests.get(url, timeout=5, proxies=proxies)
            if resp.status_code != 200:
                continue
            data = resp.json()
            logging.debug(f"{provider} raw response for IP {ip or 'self'}: {data}")
            # Normalize output for ipinfo_lite and ipinfo_standard
            if provider in ('ipinfo_lite', 'ipinfo_standard'):
                # ipinfo_lite: ip, asn, as_name, as_domain, country_code, country, continent_code, continent
                # ipinfo_standard: ip, org, etc.
                if provider == 'ipinfo_lite':
                    asn_val = data.get('asn')
                    org_val = data.get('as_name')
                else:
                    asn_val = str(data.get('org', ''))
                    org_val = data.get('org', '')
                return {
                    'ip': data.get('ip'),
                    'asn': asn_val,
                    'org': org_val,
                    'timezone': data.get('timezone', None)  # Not present in lite, but included for compatibility
                }
            elif provider == 'ipwho':
                asn_val = data.get('asn') or (data.get('connection', {}).get('asn') if data.get('connection') else '')
                asn_val = str(asn_val) if asn_val is not None else ''
                org_val = data.get('org') or (data.get('connection', {}).get('org') if data.get('connection') else '')
                return {
                    'ip': data.get('ip'),
                    'asn': asn_val,
                    'org': org_val,
                    'timezone': data.get('timezone', None)
                }
            elif provider == 'ipapi':
                asn_val = str(data.get('as', ''))
                return {
                    'ip': data.get('query'),
                    'asn': asn_val,
                    'org': data.get('org', ''),
                    'timezone': data.get('timezone', None)
                }
            elif provider == 'ipdata':
                asn = data.get('asn', {})
                asn_str = f"AS{asn.get('asn', '')} {asn.get('name', '')}" if asn else ''
                asn_str = str(asn_str)
                return {
                    'ip': data.get('ip'),
                    'asn': asn_str,
                    'org': asn.get('name', ''),
                    'timezone': data.get('time_zone', None)
                }
        except Exception as e:
            logging.warning(f"{provider} lookup failed for IP {ip or 'self'}: {e}")
            continue
    return {'ip': None, 'asn': 'Unknown ASN', 'org': '', 'timezone': None}

def get_asn_and_timezone_from_ip(ip, proxy_cfg=None, ipinfo_data=None):
    """
    Returns (asn, timezone) for the given IP, using provided data or by calling get_ipinfo_with_fallback.
    """
    try:
        data = ipinfo_data or get_ipinfo_with_fallback(ip, proxy_cfg)
        asn = data.get('asn', 'Unknown ASN')
        tz = data.get('timezone', None)
        return asn, tz
    except Exception as e:
        logging.warning(f"ASN lookup failed for IP {ip}: {e}")
        return "Unknown ASN", None

def get_public_ip(proxy_cfg=None, ipinfo_data=None):
    """
    Returns the public IP, using provided data or by calling get_ipinfo_with_fallback.
    """
    try:
        data = ipinfo_data or get_ipinfo_with_fallback(None, proxy_cfg)
        return data.get('ip')
    except Exception:
        return None
