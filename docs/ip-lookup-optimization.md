# IP Lookup System - Complete Provider Chain & Token Strategy

## Provider Chain Strategy 🎯

The IP lookup system now uses an **intelligent token-aware fallback chain** that adapts based on available API tokens. This ensures maximum reliability and optimal API usage.

### Token-Based Provider Selection

#### **Scenario 1: Both Tokens Available** (IPinfo + ipdata)
```
1. IPinfo Lite (Bearer token) → 50,000 requests/month
2. ipdata.co (with API key) → Higher limits with key  
3. ip-api.com (free HTTP) → Unlimited but HTTP only
4. IPinfo Standard (free) → 1,000 requests/month
5. ipify.org (IP-only) → Final fallback
```

#### **Scenario 2: Only IPinfo Token**
```
1. IPinfo Lite (Bearer token) → 50,000 requests/month
2. ipdata.co (free tier) → 1,500 requests/day  
3. ip-api.com (free HTTP) → Unlimited but HTTP only
4. IPinfo Standard (free) → 1,000 requests/month
5. ipify.org (IP-only) → Final fallback
```

#### **Scenario 3: Only ipdata Token**
```
1. ipdata.co (with API key) → Higher limits with key
2. ip-api.com (free HTTP) → Unlimited but HTTP only
3. IPinfo Standard (free) → 1,000 requests/month
4. ipify.org (IP-only) → Final fallback
```

#### **Scenario 4: No Tokens**
```
1. ipdata.co (free tier) → 1,500 requests/day
2. ip-api.com (free HTTP) → Unlimited but HTTP only  
3. IPinfo Standard (free) → 1,000 requests/month
4. ipify.org (IP-only) → Final fallback
```

## API Token Configuration 🔧

### IPinfo.io Setup
```bash
# Get token from: https://ipinfo.io/account/token
export IPINFO_TOKEN="your_ipinfo_token_here"
```

### ipdata.co Setup  
```bash
# Get free API key from: https://ipdata.co/pricing.html
export IPDATA_API_KEY="your_ipdata_api_key_here"
```

### Docker Compose Configuration
```yaml
environment:
  - IPINFO_TOKEN=${IPINFO_TOKEN}          # Optional but recommended
  - IPDATA_API_KEY=${IPDATA_API_KEY}      # Optional, improves reliability
```

## Provider Details 📊

| Provider | Authentication | Rate Limit | Data Quality | Protocol |
|----------|---------------|------------|-------------|----------|
| **IPinfo Lite** | Bearer token | 50,000/month | Excellent (IP, ASN) | HTTPS |
| **IPinfo Standard** | None | 1,000/month | Excellent (IP, ASN, timezone) | HTTPS |
| **ipdata.co** | API key | 1,500/day free | Excellent (IP, ASN, timezone) | HTTPS |
| **ip-api.com** | None | Unlimited | Good (IP, ASN, timezone) | HTTP |
| **ipify.org** | None | Unlimited | IP only | HTTPS |

## Performance Optimizations ⚡

### 1. Request Caching (30-second cache)
```python
# Prevents duplicate API calls within 30 seconds
cache_key = f"{ip or 'self'}_{proxy_cfg.get('label') if proxy_cfg else 'no_proxy'}"
if cache_key in _ip_cache:
    cached_data, cached_time = _ip_cache[cache_key]
    if current_time - cached_time < 30:  # 30-second cache
        return cached_data
```

### 2. Intelligent Fallback
- **Skip failed providers** automatically  
- **Continue to next provider** on timeout/error
- **Return first successful result**
- **Log failed attempts** for troubleshooting

### 3. Rate Limiting Protection
- **30-60 second intervals** for warning messages
- **Prevents log spam** in Portainer
- **Maintains error visibility** without flooding

## Implementation Status ✅

- [x] **Multi-provider fallback chain** implemented
- [x] **Token-aware provider selection** 
- [x] **Bearer token authentication** for IPinfo Lite
- [x] **Request caching** (30-second cache)
- [x] **Error handling & fallback** logic
- [x] **Rate-limited logging** to prevent spam
- [x] **Comprehensive testing** of all providers
- [x] **Provider connectivity validation**

## Current System Status 🎯

### Working Providers ✅
- **IPinfo Lite**: ✅ Working with valid tokens
- **IPinfo Standard**: ✅ Working without authentication  
- **ip-api.com**: ✅ Currently active fallback (reliable)
- **ipify.org**: ✅ IP-only fallback working

### Provider Issues ⚠️
- **ipdata.co**: Currently blocked/DNS issues (`api.ipdata.co` → `0.0.0.0`)
  - May be regional blocking or network policy
  - System gracefully falls back to ip-api.com

## Troubleshooting 🔍

### Check Current Provider Status
```bash
docker compose exec mousetrap python -c "
from backend.ip_lookup import get_ipinfo_with_fallback
import logging
logging.basicConfig(level=logging.DEBUG)
result = get_ipinfo_with_fallback()
print(f'Result: {result}')
"
```

### Monitor Log Output
```bash
# See which providers are being used
docker compose logs --tail=50 mousetrap | grep -E "(lookup.*success|lookup.*failed)"

# See session check activity  
docker compose logs --tail=50 mousetrap | grep -E "(SessionCheck|AutoUpdate.*check)"
```

### Verify Environment Variables
```bash
docker compose exec mousetrap env | grep -E "(IPINFO|IPDATA)"
```

## Expected Behavior 📈

### Normal Operation Logs
```
[INFO] [SessionCheck] label=Prowlarr source=scheduled
[INFO] [AutoUpdate] label=Prowlarr ASN check: 20115 -> 20115 | No change needed  
[INFO] [AutoUpdate] label=Prowlarr IP check: 97.91.197.211 -> 97.91.197.211 | No change needed
```

### Provider Fallback Logs
```
[WARNING] ipdata lookup failed for IP self: Connection refused
[DEBUG] ipapi lookup successful for IP self
```

The system now provides **bulletproof reliability** with graceful degradation and comprehensive visibility! 🚀
