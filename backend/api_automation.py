"""API endpoints for manual perk purchases (upload credit, wedge, VIP).

This module exposes FastAPI endpoints under `/automation/*` that allow a
client to trigger manual perk purchases for a configured session. Each
endpoint expects a JSON body containing at minimum a `label` that identifies
the saved session; additional fields vary by endpoint (for example,
`amount` for upload credits or `weeks` for VIP). Events are recorded via the
event log and notifications are attempted via the notifications backend.
"""

from datetime import UTC, datetime
import logging

from fastapi import APIRouter, HTTPException, Request

from backend.config import load_session
from backend.event_log import append_ui_event_log
from backend.notifications_backend import notify_event
from backend.perk_automation import buy_upload_credit, buy_vip, buy_wedge
from backend.proxy_config import resolve_proxy_from_session_cfg
from backend.utils_redact import redact_sensitive

_logger: logging.Logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/automation/upload_auto")
async def manual_upload_credit(request: Request):
    """Trigger a manual upload-credit purchase for a session.

    Expects a JSON body with the following fields:
    - label: session label (required)
    - amount: number of GB to purchase (optional, defaults to 1)

    The endpoint will attempt the purchase, write an event to the UI event
    log, and attempt to notify configured notification backends. It returns
    a dict including a "success" boolean and any result details from the
    purchase attempt.

    Raises:
        HTTPException: If the required `label` field is missing from the
            request JSON.

    """
    data = await request.json()
    label = data.get("label")
    amount = data.get("amount", 1)
    if not label:
        raise HTTPException(status_code=400, detail="Session label required.")
    cfg = load_session(label)
    if cfg is None:
        _logger.warning("[ManualUpload] Session '%s' not found or not configured.", label)
        return {"success": False, "error": f"Session '{label}' not found."}
    mam_id = cfg.get("mam", {}).get("mam_id", "")

    proxy_cfg = resolve_proxy_from_session_cfg(cfg)
    now = datetime.now(UTC)
    result = buy_upload_credit(amount, mam_id=mam_id, proxy_cfg=proxy_cfg)
    success = result.get("success", False)
    status_message = (
        f"Purchased {amount}GB Upload Credit"
        if success
        else f"Upload Credit purchase failed ({amount}GB)"
    )
    event = {
        "timestamp": now.isoformat(),
        "label": label,
        "event_type": "manual",
        "trigger": "manual",
        "purchase_type": "upload_credit",
        "amount": amount,
        "details": {},
        "result": "success" if success else "failed",
        "error": result.get("error") if not success else None,
        "status_message": status_message,
    }
    append_ui_event_log(event)
    try:
        if success:
            notify_event(
                event_type="manual_purchase_success",
                label=label,
                status="SUCCESS",
                message=f"Manual Upload Credit purchase succeeded: {amount}GB",
                details={"amount": amount},
            )
        else:
            notify_event(
                event_type="manual_purchase_failure",
                label=label,
                status="FAILED",
                message=f"Manual Upload Credit purchase failed: {amount}GB",
                details={"amount": amount, "error": result.get("error")},
            )
    except Exception:
        _logger.debug("[ManualUpload] Manual upload credit purchase notification failed.")
    if success:
        _logger.info(
            "[ManualUpload] Purchase: %sGB upload credit for session '%s' succeeded.",
            amount,
            label,
        )
    else:
        redacted_result = redact_sensitive(result)
        error_val = (
            redacted_result.get("error") if isinstance(redacted_result, dict) else redacted_result
        )
        _logger.warning(
            "[ManualUpload] Purchase: %sGB upload credit for session '%s' FAILED. Error: %s",
            amount,
            label,
            error_val,
        )
    return {"success": success, **result}


@router.post("/automation/wedge")
async def manual_wedge(request: Request):
    """Trigger a manual wedge purchase for a session.

    Expects a JSON body with the following fields:
    - label: session label (required)
    - method: purchase method (optional, defaults to "points")

    The endpoint logs the event, attempts the wedge purchase via the
    perk_automation module, and tries to notify configured notification
    backends. Returns a dict with a "success" boolean and details from the
    purchase attempt.

    Raises:
        HTTPException: If the required `label` field is missing from the
            request JSON.

    """
    data = await request.json()
    label = data.get("label")
    method = data.get("method", "points")
    if not label:
        raise HTTPException(status_code=400, detail="Session label required.")
    cfg = load_session(label)
    if cfg is None:
        _logger.warning("[ManualWedge] Session '%s' not found or not configured.", label)
        return {"success": False, "error": f"Session '{label}' not found."}
    mam_id = cfg.get("mam", {}).get("mam_id", "")

    proxy_cfg = resolve_proxy_from_session_cfg(cfg)
    now = datetime.now(UTC)
    result = buy_wedge(mam_id, method=method, proxy_cfg=proxy_cfg)
    success = result.get("success", False)
    status_message = (
        f"Purchased Wedge ({method})" if success else f"Wedge purchase failed ({method})"
    )
    event = {
        "timestamp": now.isoformat(),
        "label": label,
        "event_type": "manual",
        "trigger": "manual",
        "purchase_type": "wedge",
        "amount": 1,
        "details": {"method": method},
        "result": "success" if success else "failed",
        "error": result.get("error") if not success else None,
        "status_message": status_message,
    }
    append_ui_event_log(event)
    try:
        if success:
            notify_event(
                event_type="manual_purchase_success",
                label=label,
                status="SUCCESS",
                message=f"Manual Wedge purchase succeeded: {method}",
                details={"method": method},
            )
        else:
            notify_event(
                event_type="manual_purchase_failure",
                label=label,
                status="FAILED",
                message=f"Manual Wedge purchase failed: {method}",
                details={"method": method, "error": result.get("error")},
            )
    except Exception:
        _logger.debug("[ManualWedge] Manual wedge purchse notification failed.")
    if success:
        _logger.info(
            "[ManualWedge] Purchase: Wedge (%s) for session '%s' succeeded.",
            method,
            label,
        )
    else:
        redacted_result = redact_sensitive(result)
        error_val = (
            redacted_result.get("error") if isinstance(redacted_result, dict) else redacted_result
        )
        _logger.warning(
            "[ManualWedge] Purchase: Wedge (%s) for session '%s' FAILED. Error: %s",
            method,
            label,
            error_val,
        )
    return {"success": success, **result}


@router.post("/automation/vip")
async def manual_vip(request: Request):
    """Trigger a manual VIP purchase for a session.

    Expects a JSON body with the following fields:
    - label: session label (required)
    - weeks: number of weeks for VIP (optional, defaults to 4). Special
      values like "max" or "90" are treated as max-duration purchases.

    The endpoint performs the VIP purchase, records an event, and attempts
    notifications. Returns a dict with a "success" boolean and purchase
    details.

    Raises:
        HTTPException: If the required `label` field is missing from the
            request JSON.

    """
    data = await request.json()
    label = data.get("label")
    weeks = data.get("weeks", 4)
    if not label:
        raise HTTPException(status_code=400, detail="Session label required.")
    cfg = load_session(label)
    if cfg is None:
        _logger.warning("[ManualVIP] Session '%s' not found or not configured.", label)
        return {"success": False, "error": f"Session '{label}' not found."}
    mam_id = cfg.get("mam", {}).get("mam_id", "")
    proxy_cfg = resolve_proxy_from_session_cfg(cfg)
    now = datetime.now(UTC)
    is_max = str(weeks).lower() in ["max", "90"]
    if is_max:
        result = buy_vip(mam_id, duration="max", proxy_cfg=proxy_cfg)
        success = result.get("success", False)
        status_message = (
            "Purchased VIP (Max me out!)" if success else "VIP purchase failed (Max me out!)"
        )
        event = {
            "timestamp": now.isoformat(),
            "label": label,
            "event_type": "manual",
            "trigger": "manual",
            "purchase_type": "vip",
            "amount": "max",
            "details": {},
            "result": "success" if success else "failed",
            "error": result.get("error") if not success else None,
            "status_message": status_message,
        }
        append_ui_event_log(event)
        try:
            if success:
                notify_event(
                    event_type="manual_purchase_success",
                    label=label,
                    status="SUCCESS",
                    message="Manual VIP purchase succeeded: Max me out!",
                    details={"weeks": "max"},
                )
            else:
                notify_event(
                    event_type="manual_purchase_failure",
                    label=label,
                    status="FAILED",
                    message="Manual VIP purchase failed: Max me out!",
                    details={"weeks": "max", "error": result.get("error")},
                )
        except Exception:
            _logger.debug("[ManualVIP] Manual VIP (max) purchase notification failed.")
        if success:
            _logger.info(
                "[ManualVIP] Purchase: VIP (max) for session '%s' succeeded.",
                label,
            )
        else:
            redacted_result = redact_sensitive(result)
            error_val = (
                redacted_result.get("error")
                if isinstance(redacted_result, dict)
                else redacted_result
            )
            _logger.warning(
                "[ManualVIP] Purchase: VIP (max) for session '%s' FAILED. Error: %s",
                label,
                error_val,
            )
        return {"success": success, **result}
    # For 4 or 8 weeks, just send the value as string
    result = buy_vip(mam_id, duration=str(weeks), proxy_cfg=proxy_cfg)
    success = result.get("success", False)
    status_message = (
        f"Purchased VIP ({weeks} weeks)" if success else f"VIP purchase failed ({weeks} weeks)"
    )
    event = {
        "timestamp": now.isoformat(),
        "label": label,
        "event_type": "manual",
        "trigger": "manual",
        "purchase_type": "vip",
        "amount": weeks,
        "details": {},
        "result": "success" if success else "failed",
        "error": result.get("error") if not success else None,
        "status_message": status_message,
    }
    append_ui_event_log(event)
    try:
        if success:
            notify_event(
                event_type="manual_purchase_success",
                label=label,
                status="SUCCESS",
                message=f"Manual VIP purchase succeeded: {weeks} weeks",
                details={"weeks": weeks},
            )
        else:
            notify_event(
                event_type="manual_purchase_failure",
                label=label,
                status="FAILED",
                message=f"Manual VIP purchase failed: {weeks} weeks",
                details={"weeks": weeks, "error": result.get("error")},
            )
    except Exception:
        _logger.debug("[ManualVIP] Manual VIP purchase notification failed.")
    if success:
        _logger.info(
            "[ManualVIP] Purchase: VIP (%s weeks) for session '%s' succeeded.",
            weeks,
            label,
        )
    else:
        redacted_result = redact_sensitive(result)
        error_val = (
            redacted_result.get("error") if isinstance(redacted_result, dict) else redacted_result
        )
        _logger.warning(
            "[ManualVIP] Purchase: VIP (%s weeks) for session '%s' FAILED. Error: %s",
            weeks,
            label,
            error_val,
        )
    return {"success": success, **result}
