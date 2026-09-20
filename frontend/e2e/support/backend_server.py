"""Run the real FastAPI app with deterministic external-service boundaries."""

import importlib
import os
from pathlib import Path
import sys
from typing import Any

import uvicorn

sys.path.insert(0, str(Path(__file__).resolve().parents[3]))
app_module: Any = importlib.import_module("backend.app")
api_proxy_module: Any = importlib.import_module("backend.api_proxy")
api_automation_module: Any = importlib.import_module("backend.api_automation")


async def _public_ip(*_args: Any, **_kwargs: Any) -> str:
    return "192.0.2.100"


async def _ipinfo(*_args: Any, **_kwargs: Any) -> dict[str, str]:
    return {
        "asn": "AS64500",
        "ip": "192.0.2.100",
        "org": "TEST-NET",
        "timezone": "UTC",
    }


async def _asn(*_args: Any, **_kwargs: Any) -> tuple[str, str]:
    # get_asn_and_timezone_from_ip is called with (ip, proxy_cfg) positionally,
    # so a single-positional stub made /api/status raise a TypeError.
    return "AS64500", "UTC"


async def _mam_seen(*_args: Any, **_kwargs: Any) -> dict[str, str | int]:
    return {"AS": "TEST-NET", "ASN": 64500, "ip": "192.0.2.100"}


# A session using this MaM ID is answered as rejected, so the E2E suite can
# exercise the invalid-session surfaces without a real bad cookie.
REJECTED_MAM_ID = "e2e-rejected-mam-id"


async def _mam_status(*args: Any, **kwargs: Any) -> dict[str, Any]:
    mam_id = kwargs.get("mam_id") or (args[0] if args else None)
    if mam_id == REJECTED_MAM_ID:
        # Shaped like get_status's failure return: no raw, cookie not accepted.
        return {
            "mam_cookie_exists": False,
            "points": None,
            "wedge_active": None,
            "vip_active": None,
            "message": "Failed to fetch status: HTTP 403: Invalid session - Invalid Cookie",
        }
    return {
        "mam_cookie_exists": True,
        "points": 0,
        "status_message": "OK",
        "vip_active": False,
        "wedge_active": False,
        # Shaped like a jsonLoad.php body so the MAM Details panel renders.
        # Not a real account: every value here is from the TEST-NET fixtures.
        "raw": {
            "classname": "VIP",
            "connectable": "yes",
            "downloaded": "1.00 GiB",
            "ratio": 1.0,
            "seedbonus": 0,
            "uid": 64500,
            "uploaded": "1.00 GiB",
            "username": "e2e-user",
            "vip_until": "2099-01-02 03:04:05",
        },
    }


# MaM's verbatim refusal when a purchase would add less than a full week, from
# https://github.com/sirjmann92/mousetrap/issues/72. Stubbed so the purchase
# routes exercise the failure surfaces without reaching myanonamouse.net.
_MIN_VIP_REFUSAL = {
    "success": False,
    "error": "Min VIP is 1 week purchased for Automated methods",
}


async def _buy_vip(*_args: Any, **_kwargs: Any) -> dict[str, Any]:
    return {
        "success": False,
        "error": _MIN_VIP_REFUSAL["error"],
        "response": dict(_MIN_VIP_REFUSAL),
    }


app_module.get_public_ip = _public_ip
app_module.get_ipinfo_with_fallback = _ipinfo
app_module.get_asn_and_timezone_from_ip = _asn
app_module.get_mam_seen_ip_info = _mam_seen
app_module.get_status = _mam_status
api_proxy_module.get_ipinfo_with_fallback = _ipinfo
api_automation_module.buy_vip = _buy_vip
api_automation_module.get_status = _mam_status

if __name__ == "__main__":
    uvicorn.run(
        app_module.app,
        host="127.0.0.1",
        port=int(os.environ.get("E2E_BACKEND_PORT", "39852")),
    )
