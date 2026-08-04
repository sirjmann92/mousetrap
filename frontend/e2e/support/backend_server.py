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


async def _public_ip(*_args: Any, **_kwargs: Any) -> str:
    return "192.0.2.100"


async def _ipinfo(*_args: Any, **_kwargs: Any) -> dict[str, str]:
    return {
        "asn": "AS64500",
        "ip": "192.0.2.100",
        "org": "TEST-NET",
        "timezone": "UTC",
    }


async def _asn(_ip: str, **_kwargs: Any) -> tuple[str, str]:
    return "AS64500", "UTC"


async def _mam_seen(*_args: Any, **_kwargs: Any) -> dict[str, str | int]:
    return {"AS": "TEST-NET", "ASN": 64500, "ip": "192.0.2.100"}


async def _mam_status(*_args: Any, **_kwargs: Any) -> dict[str, Any]:
    return {
        "mam_cookie_exists": True,
        "points": 0,
        "status_message": "OK",
        "vip_active": False,
        "wedge_active": False,
    }


app_module.get_public_ip = _public_ip
app_module.get_ipinfo_with_fallback = _ipinfo
app_module.get_asn_and_timezone_from_ip = _asn
app_module.get_mam_seen_ip_info = _mam_seen
app_module.get_status = _mam_status
api_proxy_module.get_ipinfo_with_fallback = _ipinfo

if __name__ == "__main__":
    uvicorn.run(
        app_module.app,
        host="127.0.0.1",
        port=int(os.environ.get("E2E_BACKEND_PORT", "39852")),
    )
