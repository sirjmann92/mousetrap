"""API endpoints for manual perk purchases (upload credit, VIP).

This module exposes FastAPI endpoints under `/automation/*` that allow a
client to trigger manual perk purchases for a configured session. Each
endpoint expects a JSON body containing at minimum a `label` that identifies
the saved session; additional fields vary by endpoint (for example,
`amount` for upload credits). Events are recorded via the
event log and notifications are attempted via the notifications backend.
"""

from datetime import UTC, datetime
import logging
from typing import Any

from fastapi import APIRouter, HTTPException, Request

from backend.config import load_session, session_exists
from backend.event_log import append_ui_event_log
from backend.mam_api import get_status, points_unavailable_reason
from backend.notifications_backend import notify_event
from backend.perk_automation import buy_upload_credit, buy_vip, vip_purchase_block_reason
from backend.proxy_config import resolve_proxy_from_session_cfg
from backend.utils_redact import redact_sensitive

_logger: logging.Logger = logging.getLogger(__name__)

# Point cost for the enforce-minimum-points guardrail
_UPLOAD_POINTS_PER_GB = 500

router = APIRouter()


@router.post("/automation/upload_auto")
async def manual_upload_credit(request: Request) -> dict[str, Any]:
    """Trigger a manual upload-credit purchase for a session.

    Expects a JSON body with the following fields:
    - label: session label (required)
    - amount: number of GB to purchase (optional, defaults to 1)

    The endpoint will attempt the purchase, write an event to the UI event
    log, and attempt to notify configured notification backends. It returns
    a dict including a "success" boolean and any result details from the
    purchase attempt.

    With the minimum-points guardrail enabled, a MaM status response carrying
    no point balance blocks the purchase and reports that failure, because the
    guardrail the user asked for cannot be evaluated without one.

    Raises:
        HTTPException: If the required `label` field is missing from the
            request JSON.

    """
    data = await request.json()
    label = data.get("label")
    amount = data.get("amount", 1)
    if not label:
        raise HTTPException(status_code=400, detail="Session label required.")

    # Validate upload credit amount - MAM only accepts certain values
    # As of January 2026, MAM requires minimum 50GB purchase
    valid_amounts = [50, 100]
    if amount not in valid_amounts:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid upload credit amount: {amount}GB. Valid amounts are: {', '.join(map(str, valid_amounts))}GB",
        )

    if not session_exists(label):
        _logger.warning("[ManualUpload] Session '%s' not found or not configured.", label)
        return {"success": False, "error": f"Session '{label}' not found."}
    cfg = load_session(label)
    mam_id = cfg.get("mam", {}).get("mam_id", "")

    proxy_cfg = resolve_proxy_from_session_cfg(cfg)
    now = datetime.now(UTC)
    # --- Enforce minimum points guardrail (prevent spend below minimum) ---
    enforce_min_pts = cfg.get("perk_automation", {}).get("enforce_min_points_guardrail", False)
    session_min_points = cfg.get("perk_automation", {}).get("min_points")
    if enforce_min_pts and session_min_points is not None:
        status = await get_status(mam_id=mam_id, proxy_cfg=proxy_cfg)
        current_points = status.get("points")
        purchase_cost = amount * _UPLOAD_POINTS_PER_GB
        if current_points is None:
            guardrail_reason = points_unavailable_reason(status)
        elif int(current_points) - purchase_cost < int(session_min_points):
            guardrail_reason = (
                f"Purchase would drop below minimum points: "
                f"{current_points} - {purchase_cost} = {int(current_points) - purchase_cost} "
                f"< {session_min_points}"
            )
        else:
            guardrail_reason = ""
        if guardrail_reason:
            _logger.info("[ManualUpload] BLOCKED for session '%s': %s", label, guardrail_reason)
            append_ui_event_log(
                {
                    "timestamp": now.isoformat(),
                    "label": label,
                    "event_type": "manual",
                    "trigger": "manual",
                    "purchase_type": "upload_credit",
                    "amount": amount,
                    "details": {"points_before": current_points},
                    "result": "blocked",
                    "status_message": f"Manual Upload Credit purchase blocked: {guardrail_reason}",
                }
            )
            return {"success": False, "error": guardrail_reason}
    result = await buy_upload_credit(amount, mam_id=mam_id, proxy_cfg=proxy_cfg)
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
            await notify_event(
                event_type="manual_purchase_success",
                label=label,
                status="SUCCESS",
                message=f"Manual Upload Credit purchase succeeded: {amount}GB",
                details={"amount": amount},
            )
        else:
            await notify_event(
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


@router.post("/automation/vip")
async def manual_vip(request: Request) -> dict[str, Any]:
    """Trigger a manual VIP purchase for a session.

    MAM's API accepts only a "max" duration for VIP, which tops VIP up to its
    90-day cap (github.com/sirjmann92/mousetrap/issues/187). A fixed week
    count is refused by MAM with "Api sessions can only buy max for VIP", so it
    is rejected here before a request is spent on it.

    Expects a JSON body with the following fields:
    - label: session label (required)
    - weeks: "max" or 90, its equivalent (optional, defaults to "max")

    The endpoint performs the VIP purchase, records an event, and attempts
    notifications. Returns a dict with a "success" boolean and purchase
    details.

    Raises:
        HTTPException: If the required `label` field is missing from the
            request JSON, or if `weeks` is anything other than "max" or 90.

    """
    data = await request.json()
    label = data.get("label")
    weeks = data.get("weeks", "max")
    if not label:
        raise HTTPException(status_code=400, detail="Session label required.")
    is_max = (isinstance(weeks, str) and weeks.strip().lower() in ("max", "90")) or (
        type(weeks) is int and weeks == 90
    )
    if not is_max:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Invalid VIP duration: {weeks!r}. MAM only accepts 'max' for VIP "
                "purchased through its API."
            ),
        )
    if not session_exists(label):
        _logger.warning("[ManualVIP] Session '%s' not found or not configured.", label)
        return {"success": False, "error": f"Session '{label}' not found."}
    cfg = load_session(label)
    mam_id = cfg.get("mam", {}).get("mam_id", "")
    proxy_cfg = resolve_proxy_from_session_cfg(cfg)
    now = datetime.now(UTC)
    # --- MaM minimum-purchase guardrail ---
    # vip_until is absolute, so the stored status stays accurate without a
    # refetch, and the check costs no request.
    vip_block_reason = vip_purchase_block_reason(cfg.get("last_status", {}).get("raw"), now=now)
    if vip_block_reason:
        _logger.info("[ManualVIP] BLOCKED for session '%s': %s", label, vip_block_reason)
        append_ui_event_log(
            {
                "timestamp": now.isoformat(),
                "label": label,
                "event_type": "manual",
                "trigger": "manual",
                "purchase_type": "vip",
                "amount": "max",
                "details": {},
                "result": "blocked",
                "error": vip_block_reason,
                "status_message": f"Manual VIP purchase blocked: {vip_block_reason}",
            }
        )
        return {"success": False, "error": vip_block_reason}
    # Max VIP is priced by how much it tops up, so the enforce-minimum-points
    # guardrail has no fixed cost to check it against.
    result = await buy_vip(mam_id, duration="max", proxy_cfg=proxy_cfg)
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
            await notify_event(
                event_type="manual_purchase_success",
                label=label,
                status="SUCCESS",
                message="Manual VIP purchase succeeded: Max me out!",
                details={"weeks": "max"},
            )
        else:
            await notify_event(
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
            redacted_result.get("error") if isinstance(redacted_result, dict) else redacted_result
        )
        _logger.warning(
            "[ManualVIP] Purchase: VIP (max) for session '%s' FAILED. Error: %s",
            label,
            error_val,
        )
    return {"success": success, **result}
