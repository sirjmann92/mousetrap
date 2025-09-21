"""IP lookup helpers with multiple-provider fallback and normalization.

This module provides functions to query external IP information providers with a
fallback chain (ipinfo, ipdata, ip-api, ipify and hardcoded-IP fallbacks). Results
are normalized into a common dictionary containing keys: ip, asn, org, timezone.
A small in-memory cache is used to avoid rapid duplicate requests that may cause
rate-limiting or 403 errors.

Public functions:
- get_ipinfo_with_fallback(ip: str | None = None, proxy_cfg=None) -> dict
    Query multiple providers for IP information and return a normalized dict.
- get_asn_and_timezone_from_ip(ip, proxy_cfg=None, ipinfo_data=None)
    Convenience to extract ASN and timezone from provided or fetched data.
- get_public_ip(proxy_cfg=None, ipinfo_data=None)
    Convenience to get the public IP address.

"""

import logging
import os
import time

import requests

from backend.utils import build_proxy_dict

logger: logging.Logger = logging.getLogger(__name__)
# Simple cache to prevent duplicate rapid requests (reduce 403 errors)
_ip_cache = {}
_cache_timeout = 30  # Cache for 30 seconds


def get_ipinfo_with_fallback(ip: str | None = None, proxy_cfg=None) -> dict:
    """Try ipinfo.io, ipdata.co, ip-api.com, and ipify.org in order. Return normalized dict with keys: ip, asn, org, timezone."""
    # Simple caching to prevent rapid duplicate requests that cause 403 errors
    cache_key = f"{ip or 'self'}_{proxy_cfg.get('label') if proxy_cfg else 'no_proxy'}"
    current_time = time.time()

    if cache_key in _ip_cache:
        cached_data, cached_time = _ip_cache[cache_key]
        if current_time - cached_time < _cache_timeout:
            logger.debug("[IP Lookup] Using cached result for %s", ip or "self")
            return cached_data

    providers = []
    ipinfo_token = os.environ.get("IPINFO_TOKEN")
    ipdata_api_key = os.environ.get("IPDATA_API_KEY")

    # Common headers for all requests
    headers = {"Accept": "application/json"}

    # Strategy: Use the best available provider first based on tokens available

    # 1. IPinfo Lite (if token available) - Best data quality and highest limits
    if ipinfo_token:
        logger.debug(
            "[IP Lookup] IPinfo token: ***%s",
            ipinfo_token[-4:] if len(ipinfo_token) > 4 else "***",
        )
        if ip:
            url_ipinfo = f"https://api.ipinfo.io/lite/{ip}"
        else:
            url_ipinfo = "https://api.ipinfo.io/lite/me"
        headers_ipinfo = headers.copy()
        headers_ipinfo["Authorization"] = f"Bearer {ipinfo_token}"
        providers.append((url_ipinfo, "ipinfo_lite", headers_ipinfo))

    # 2. ipdata.co - Use with API key if available, otherwise free tier
    # Note: Currently experiencing connectivity issues, but keeping in chain
    if ipdata_api_key:
        logger.debug(
            "[IP Lookup] ipdata API key: ***%s",
            ipdata_api_key[-4:] if len(ipdata_api_key) > 4 else "***",
        )
        if ip:
            url_ipdata = f"https://api.ipdata.co/{ip}?api-key={ipdata_api_key}"
        else:
            url_ipdata = f"https://api.ipdata.co/?api-key={ipdata_api_key}"
    else:
        logger.debug(
            "[IP Lookup] No IPDATA_API_KEY set, using ipdata.co free tier (1500 requests/day)"
        )
        if ip:
            url_ipdata = f"https://api.ipdata.co/{ip}"
        else:
            url_ipdata = "https://api.ipdata.co/"
    providers.append((url_ipdata, "ipdata", headers))

    # 3. ip-api.com - Reliable free provider (HTTP only, may have issues with proxies)
    if ip:
        url_ipapi = f"http://ip-api.com/json/{ip}"
    else:
        url_ipapi = "http://ip-api.com/json/"
    providers.append((url_ipapi, "ipapi", headers))

    # 4. IPinfo Standard - Good HTTPS fallback without authentication required
    logger.debug("[IP Lookup] Adding IPinfo Standard API as fallback (1000 requests/month)")
    if ip:
        url_ipinfo_std = f"https://ipinfo.io/{ip}/json"
    else:
        url_ipinfo_std = "https://ipinfo.io/json"
    providers.append((url_ipinfo_std, "ipinfo_standard", headers))

    # 5. ipify.org - Very reliable HTTPS but IP-only (final fallback to prevent total failure)
    if not ip:  # Only for own IP lookup, not specific IP lookup
        url_ipify = "https://api.ipify.org?format=json"
        providers.append((url_ipify, "ipify", headers))

    # 6. DNS-free IP fallbacks using hardcoded IPs (for VPN/DNS issues)
    if not ip:  # Only for own IP lookup
        # ipinfo.io hardcoded IP as final DNS-free fallback
        url_ipinfo_ip = "https://34.102.136.180/json"
        providers.append((url_ipinfo_ip, "ipinfo_hardcoded", headers))

        # httpbin.org hardcoded IP as ultimate fallback
        url_httpbin = "https://54.230.100.253/ip"
        providers.append((url_httpbin, "httpbin_hardcoded", headers))

    proxies = build_proxy_dict(proxy_cfg) if proxy_cfg else None
    if proxies:
        proxy_label = proxy_cfg.get("label") if proxy_cfg else None
        proxy_url_log = {
            k: v.replace(proxy_cfg.get("password", ""), "***")
            if proxy_cfg and proxy_cfg.get("password")
            else v
            for k, v in proxies.items()
        }
    logger.debug("[ip_lookup] Using proxy label: %s, proxies: %s", proxy_label, proxy_url_log)

    for provider_data in providers:
        url, provider = provider_data[0], provider_data[1]
        request_headers = provider_data[2] if len(provider_data) > 2 else headers

        try:
            resp = requests.get(url, timeout=10, proxies=proxies, headers=request_headers)
            if resp.status_code != 200:
                logger.warning(
                    "%s lookup failed for IP %s: HTTP %s",
                    provider,
                    ip or "self",
                    resp.status_code,
                )
                continue

            try:
                if provider == "httpbin_hardcoded":
                    # httpbin returns plain text, not JSON
                    data = {"ip": resp.text.strip()}
                else:
                    data = resp.json()
            except Exception as json_e:
                logger.warning(
                    "%s lookup failed for IP %s: Invalid JSON response - %s",
                    provider,
                    ip or "self",
                    json_e,
                )
                continue

            logger.debug("%s raw response for IP %s: %s", provider, ip or "self", data)
            logger.debug("%s lookup successful for IP %s", provider, ip or "self")

            # Normalize output for ipinfo_lite and ipinfo_standard
            result = None
            if provider in ("ipinfo_lite", "ipinfo_standard"):
                # ipinfo_lite: ip, asn, as_name, as_domain, country_code, country, continent_code, continent
                # ipinfo_standard: ip, org, etc.
                if provider == "ipinfo_lite":
                    asn_val = data.get("asn")
                    org_val = data.get("as_name")
                else:
                    asn_val = str(data.get("org", ""))
                    org_val = data.get("org", "")
                result = {
                    "ip": data.get("ip"),
                    "asn": asn_val,
                    "org": org_val,
                    "timezone": data.get(
                        "timezone", None
                    ),  # Not present in lite, but included for compatibility
                }
            elif provider == "ipify":
                # ipify only returns IP, no ASN data - return None for ASN to indicate unavailable
                result = {
                    "ip": data.get("ip"),
                    "asn": None,  # Use None instead of "Unknown ASN" to indicate unavailable data
                    "org": "",
                    "timezone": None,
                }
            elif provider == "ipinfo_hardcoded":
                # ipinfo.io via hardcoded IP (same format as ipinfo_standard)
                asn_val = str(data.get("org", ""))
                org_val = data.get("org", "")
                result = {
                    "ip": data.get("ip"),
                    "asn": asn_val,
                    "org": org_val,
                    "timezone": data.get("timezone", None),
                }
            elif provider == "httpbin_hardcoded":
                # httpbin.org/ip returns just the IP as plain text, handled above
                result = {"ip": data.get("ip"), "asn": None, "org": "", "timezone": None}
            elif provider == "ipapi":
                asn_val = str(data.get("as", ""))
                result = {
                    "ip": data.get("query"),
                    "asn": asn_val,
                    "org": data.get("org", ""),
                    "timezone": data.get("timezone", None),
                }
            elif provider == "ipdata":
                asn = data.get("asn", {})
                if isinstance(asn, dict):
                    asn_str = f"AS{asn.get('asn', '')} {asn.get('name', '')}" if asn else ""
                    org_name = asn.get("name", "")
                else:
                    asn_str = str(asn) if asn else ""
                    org_name = ""
                result = {
                    "ip": data.get("ip"),
                    "asn": asn_str,
                    "org": org_name,
                    "timezone": data.get("time_zone", None),
                }

            # Cache the successful result
            if result:
                _ip_cache[cache_key] = (result, current_time)
                return result

        except Exception as e:
            logger.warning("%s lookup failed for IP %s: %s", provider, ip or "self", e)
            continue

    logger.error(
        "All IP lookup providers failed for IP %s. Fallback chain: ipinfo.io → ipdata.co → ip-api.com → ipify.org → hardcoded IPs",
        ip or "self",
    )
    return {"ip": None, "asn": None, "org": "", "timezone": None}


def get_asn_and_timezone_from_ip(ip, proxy_cfg=None, ipinfo_data=None):
    """Returns (asn, timezone) for the given IP, using provided data or by calling get_ipinfo_with_fallback."""
    try:
        data = ipinfo_data or get_ipinfo_with_fallback(ip, proxy_cfg)
        asn = data.get("asn", None)
        tz = data.get("timezone", None)
    except Exception as e:
        logger.warning("ASN lookup failed for IP %s: %s", ip, e)
        return None, None
    else:
        return asn, tz


def get_public_ip(proxy_cfg=None, ipinfo_data=None):
    """Returns the public IP, using provided data or by calling get_ipinfo_with_fallback."""
    try:
        data = ipinfo_data or get_ipinfo_with_fallback(None, proxy_cfg)
        return data.get("ip")
    except Exception:
        return None
