"""MouseTrap backend FastAPI application.

This module implements the main FastAPI application for the MouseTrap backend,
including API endpoints for session management, vault configuration and
automation, background job registration (APScheduler), and related helpers.
"""

from __future__ import annotations

import asyncio
from datetime import UTC, datetime, timedelta
import inspect
import logging
import os
from pathlib import Path
import re
import time
from typing import Any

import aiohttp
from apscheduler.schedulers.background import BackgroundScheduler  # type: ignore[import-untyped]
from apscheduler.triggers.interval import IntervalTrigger  # type: ignore[import-untyped]
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse

from backend.api_automation import router as automation_router
from backend.api_event_log import router as event_log_router
from backend.api_notifications import router as notifications_router
from backend.api_port_monitor import router as port_monitor_router
from backend.api_proxy import router as proxy_router
from backend.automation import run_all_automation_jobs
from backend.config import (
    delete_session,
    get_session_path,
    list_sessions,
    load_config,
    load_session,
    save_session,
)
from backend.event_log import append_ui_event_log, clear_ui_event_log_for_session
from backend.ip_lookup import get_asn_and_timezone_from_ip, get_ipinfo_with_fallback, get_public_ip
from backend.last_session_api import router as last_session_router, write_last_session
from backend.mam_api import get_mam_seen_ip_info, get_proxied_public_ip, get_status
from backend.millionaires_vault_automation import VaultAutomationManager
from backend.millionaires_vault_cookies import (
    generate_cookie_extraction_bookmarklet,
    get_cheese_and_wedges,
    get_last_donation_from_donate_page,
    get_vault_total_points,
    perform_vault_donation,
    validate_browser_mam_id_with_config,
)
from backend.notifications_backend import notify_event
from backend.port_monitor import port_monitor_manager
from backend.prowlarr_integration import (
    find_mam_indexer_id,
    sync_mam_id_to_prowlarr,
    test_prowlarr_connection,
)
from backend.proxy_config import resolve_proxy_from_session_cfg
from backend.utils import build_proxy_dict, build_status_message, extract_asn_number, setup_logging
from backend.vault_config import (
    delete_vault_configuration,
    extract_mam_id_from_browser_cookies,
    get_default_vault_configuration,
    get_effective_proxy_config,
    get_effective_uid,
    get_vault_configuration,
    list_vault_configurations,
    load_vault_config,
    save_vault_configuration,
    update_pot_tracking,
    validate_vault_configuration,
)
from backend.vault_uid_manager import (
    check_vault_automation_conflicts,
    get_uid_vault_summary,
    sync_browser_mam_id_across_uid_sessions,
)

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_BUILD_DIR = (Path(BASE_DIR) / "../frontend/build").resolve()
FRONTEND_PUBLIC_DIR = os.environ.get(
    "FRONTEND_PUBLIC_DIR", str((Path(BASE_DIR) / "../frontend/public").resolve())
)

# Build output directories (Vite puts hashed assets under build/assets)
ASSETS_DIR = Path(FRONTEND_BUILD_DIR) / "assets"

# Set up global logging configuration
setup_logging()
_logger: logging.Logger = logging.getLogger(__name__)

# FastAPI app creation
app = FastAPI(title="MouseTrap API")

# Mount static files BEFORE any catch-all routes
# Serve logs directory as static files for UI event log access
logs_dir = Path(__file__).resolve().parent.parent / "logs"
if logs_dir.is_dir():
    app.mount("/logs", StaticFiles(directory=str(logs_dir)), name="logs")

if ASSETS_DIR.is_dir():
    app.mount("/assets", StaticFiles(directory=str(ASSETS_DIR)), name="assets")
else:
    _logger.warning(
        "Frontend assets directory %s does not exist; skipping /assets mount (dev mode?)",
        ASSETS_DIR,
    )

# Mount API routers
app.include_router(automation_router, prefix="/api")
app.include_router(last_session_router, prefix="/api")
app.include_router(proxy_router, prefix="/api")
app.include_router(event_log_router, prefix="/api")
app.include_router(notifications_router, prefix="/api")
app.include_router(port_monitor_router, prefix="/api/port-monitor")

# Initialize vault automation manager
vault_automation_manager = VaultAutomationManager()

# APScheduler setup
scheduler = BackgroundScheduler()

session_status_cache: dict[str, Any] = {}
# Global cache for notification deduplication by MAM ID
# Format: {mam_id: {event_type: {count_change_key: timestamp}}}
notification_dedup_cache: dict[str, dict[str, dict[str, float]]] = {}


def redact_mam_id(mam_id: str, show_last: int = 8) -> str:
    """Redact MAM ID for security, showing only the last N characters.

    Args:
        mam_id: The full MAM ID
        show_last: Number of characters to show at the end (default 8)

    Returns:
        Redacted string like "MAM ID ending in ...abcd1234"
    """
    if not mam_id or len(mam_id) <= show_last:
        return "MAM ID ending in " + ("*" * show_last)

    return f"MAM ID ending in ...{mam_id[-show_last:]}"


def should_send_notification(
    mam_id: str, event_type: str, old_count: int, new_count: int, dedup_window_minutes: int = 60
) -> bool:
    """Check if we should send a notification based on deduplication cache.

    Args:
        mam_id: The MAM account ID
        event_type: Type of event (e.g., 'inactive_hit_and_run', 'inactive_unsatisfied')
        old_count: Previous count value
        new_count: New count value
        dedup_window_minutes: Minutes to prevent duplicate notifications (default 60)

    Returns:
        True if notification should be sent, False if it's a duplicate
    """
    if not mam_id:
        return True  # Always allow if no MAM ID

    # Create a unique key for this specific count change
    count_change_key = f"{old_count}→{new_count}"
    now = time.time()
    dedup_window_seconds = dedup_window_minutes * 60

    # Initialize nested dict structure if needed
    if mam_id not in notification_dedup_cache:
        notification_dedup_cache[mam_id] = {}
    if event_type not in notification_dedup_cache[mam_id]:
        notification_dedup_cache[mam_id][event_type] = {}

    # Check if we've recently notified about this exact change
    last_notification_time = notification_dedup_cache[mam_id][event_type].get(count_change_key)

    if last_notification_time and (now - last_notification_time) < dedup_window_seconds:
        # Duplicate notification within window - skip it
        return False

    # Record this notification and clean up old entries
    notification_dedup_cache[mam_id][event_type][count_change_key] = now

    # Clean up old entries to prevent memory growth
    cutoff_time = now - dedup_window_seconds
    for key in list(notification_dedup_cache[mam_id][event_type].keys()):
        if notification_dedup_cache[mam_id][event_type][key] < cutoff_time:
            del notification_dedup_cache[mam_id][event_type][key]

    return True


def is_vault_automation_enabled() -> bool:
    """Check if vault automation is enabled globally in any vault configuration."""
    try:
        vault_config = load_vault_config()
        vault_configurations = vault_config.get("vault_configurations", {})

        # Check if any vault configuration has automation enabled
        return any(
            config.get("automation", {}).get("enabled", False)
            for config in vault_configurations.values()
        )
    except Exception as e:
        _logger.error("[VaultAutomation] Error checking vault automation status: %s", e)
        return False


def get_auto_update_val(status: dict[str, Any]) -> str:
    """Return a human-readable representation of the auto-update status.

    The input may be a dict containing keys like 'success', 'msg', 'reason',
    or 'error'. This helper normalizes those cases into a short string suitable
    for display in the UI or logs. If the value is missing or invalid, returns
    the string "N/A".
    """
    val = status.get("auto_update_seedbox") if isinstance(status, dict) else None
    if val is None or val == "" or val is False:
        return "N/A"
    if isinstance(val, dict):
        msg = val.get("msg")
        reason = val.get("reason")
        error = val.get("error")
        if val.get("success") and msg:
            # If reason is present, append it for clarity
            if reason:
                return f"{msg} ({reason})"
            return msg
        if error:
            if reason:
                return f"{error} ({reason})"
            return error
        return "N/A"
    return str(val)


async def check_and_notify_count_increments(cfg: dict, new_status: dict, label: str) -> None:
    """Check for increments in hit & run and unsatisfied counts and send notifications."""
    # Get the previous status
    old_status = cfg.get("last_status", {})
    if not isinstance(old_status, dict) or not isinstance(new_status, dict):
        return

    # Get MAM ID for deduplication
    mam_id = cfg.get("mam", {}).get("mam_id", "")

    old_raw = old_status.get("raw", {})
    new_raw = new_status.get("raw", {})

    # Check inactive hit & run increment
    old_inact_hnr_raw = (
        old_raw.get("inactHnr", {}).get("count", 0)
        if isinstance(old_raw.get("inactHnr"), dict)
        else 0
    )
    new_inact_hnr_raw = (
        new_raw.get("inactHnr", {}).get("count", 0)
        if isinstance(new_raw.get("inactHnr"), dict)
        else 0
    )
    # Ensure values are integers for comparison
    old_inact_hnr = (
        int(old_inact_hnr_raw)
        if isinstance(old_inact_hnr_raw, int | str) and str(old_inact_hnr_raw).isdigit()
        else 0
    )
    new_inact_hnr = (
        int(new_inact_hnr_raw)
        if isinstance(new_inact_hnr_raw, int | str) and str(new_inact_hnr_raw).isdigit()
        else 0
    )

    if new_inact_hnr > old_inact_hnr:
        increment = new_inact_hnr - old_inact_hnr

        # Check deduplication - only notify if this change hasn't been reported recently for this MAM ID
        if should_send_notification(mam_id, "inactive_hit_and_run", old_inact_hnr, new_inact_hnr):
            await notify_event(
                event_type="inactive_hit_and_run",
                label=label,
                status="INCREMENT",
                message=f"Inactive Hit & Run count increased by {increment} (from {old_inact_hnr} to {new_inact_hnr})",
                details={
                    "old_count": old_inact_hnr,
                    "new_count": new_inact_hnr,
                    "increment": increment,
                    "mam_id": mam_id,
                },
            )

    # Check inactive unsatisfied increment
    old_inact_unsat_raw = (
        old_raw.get("inactUnsat", {}).get("count", 0)
        if isinstance(old_raw.get("inactUnsat"), dict)
        else 0
    )
    new_inact_unsat_raw = (
        new_raw.get("inactUnsat", {}).get("count", 0)
        if isinstance(new_raw.get("inactUnsat"), dict)
        else 0
    )
    # Ensure values are integers for comparison
    old_inact_unsat = (
        int(old_inact_unsat_raw)
        if isinstance(old_inact_unsat_raw, int | str) and str(old_inact_unsat_raw).isdigit()
        else 0
    )
    new_inact_unsat = (
        int(new_inact_unsat_raw)
        if isinstance(new_inact_unsat_raw, int | str) and str(new_inact_unsat_raw).isdigit()
        else 0
    )

    if new_inact_unsat > old_inact_unsat:
        increment = new_inact_unsat - old_inact_unsat

        # Check deduplication - only notify if this change hasn't been reported recently for this MAM ID
        if should_send_notification(
            mam_id, "inactive_unsatisfied", old_inact_unsat, new_inact_unsat
        ):
            await notify_event(
                event_type="inactive_unsatisfied",
                label=label,
                status="INCREMENT",
                message=f"Inactive Unsatisfied (Pre-H&R) count increased by {increment} (from {old_inact_unsat} to {new_inact_unsat})",
                details={
                    "old_count": old_inact_unsat,
                    "new_count": new_inact_unsat,
                    "increment": increment,
                    "mam_id": mam_id,
                },
            )


def check_mam_session_expiry() -> None:
    """Check all sessions for approaching MAM session expiry and send notifications.

    This runs daily to check if any sessions with Prowlarr integration have
    MAM sessions that are approaching the 90-day expiry limit.
    """
    _logger.info("[ExpiryCheck] Checking MAM session expiry for all sessions")

    try:
        sessions = list_sessions()
        for label in sessions:
            try:
                cfg = load_session(label)
                prowlarr_cfg = cfg.get("prowlarr", {})

                # Skip if Prowlarr not enabled or no created date
                if not prowlarr_cfg.get("enabled"):
                    continue

                created_date_str = cfg.get("mam_session_created_date")
                if not created_date_str:
                    continue

                # Parse the created date
                try:
                    # Handle both ISO format with timezone and datetime-local format
                    if "T" in created_date_str and len(created_date_str) == 16:
                        # datetime-local format: YYYY-MM-DDTHH:MM
                        created_date = datetime.fromisoformat(created_date_str)
                    else:
                        # ISO format with timezone
                        created_date = datetime.fromisoformat(created_date_str)
                except (ValueError, AttributeError) as e:
                    _logger.warning(
                        "[ExpiryCheck] Invalid date format for session '%s': %s", label, e
                    )
                    continue

                # Calculate expiry (90 days from creation)
                expiry_date = created_date + timedelta(days=90)
                days_until_expiry = (expiry_date - datetime.now()).days

                # Check if we should notify
                notify_days = prowlarr_cfg.get("notify_before_expiry_days", 7)

                if days_until_expiry <= notify_days and days_until_expiry >= 0:
                    _logger.info(
                        "[ExpiryCheck] Session '%s' expires in %d days - sending notification",
                        label,
                        days_until_expiry,
                    )

                    # Get MAM ID and redact for security
                    mam_id = cfg.get("mam", {}).get("mam_id", "N/A")
                    redacted_mam_id = redact_mam_id(mam_id) if mam_id != "N/A" else "N/A"

                    # Prepare notification message
                    message = (
                        f"⚠️ MAM Session Expiring Soon!\n\n"
                        f"Session: {label}\n"
                        f"{redacted_mam_id}\n"
                        f"Created: {created_date.strftime('%Y-%m-%d %H:%M')}\n"
                        f"Expires: {expiry_date.strftime('%Y-%m-%d %H:%M')}\n"
                        f"Days Remaining: {days_until_expiry} day{'s' if days_until_expiry != 1 else ''}\n\n"
                        f"You will need to refresh your MAM session and update Prowlarr.\n"
                    )

                    if prowlarr_cfg.get("host"):
                        message += (
                            f"Prowlarr: {prowlarr_cfg['host']}:{prowlarr_cfg.get('port', 9696)}"
                        )

                    details = {
                        "session_label": label,
                        "mam_id": redacted_mam_id,  # Use redacted version in details too
                        "created_date": created_date.isoformat(),
                        "expiry_date": expiry_date.isoformat(),
                        "days_remaining": days_until_expiry,
                        "prowlarr_host": prowlarr_cfg.get("host", "N/A"),
                    }

                    # Send notification asynchronously
                    asyncio.run(
                        notify_event(
                            event_type="mam_session_expiry",
                            label=label,
                            status="WARNING",
                            message=message,
                            details=details,
                        )
                    )

                elif days_until_expiry < 0:
                    _logger.warning(
                        "[ExpiryCheck] Session '%s' expired %d days ago!",
                        label,
                        abs(days_until_expiry),
                    )

            except Exception as e:
                _logger.error("[ExpiryCheck] Error checking session '%s': %s", label, e)

    except Exception as e:
        _logger.error("[ExpiryCheck] Error in MAM expiry check: %s", e)


# Start PortMonitorStackManager monitor loop on FastAPI startup
@app.on_event("startup")  # type: ignore[deprecated]
def start_port_monitor_manager() -> None:
    """Start the PortMonitor manager when the FastAPI app starts.

    This triggers the background monitoring loop for configured port monitor
    stacks so that their status is kept up-to-date.
    """
    port_monitor_manager.start()


# Start VaultAutomationManager on FastAPI startup
@app.on_event("startup")  # type: ignore[deprecated]
async def start_vault_automation_manager() -> None:
    """Start the VaultAutomationManager as a background task on startup.

    This schedules the vault automation manager to run concurrently with
    the FastAPI event loop without blocking startup.
    """
    # Start the vault automation manager in the background
    asyncio.create_task(vault_automation_manager.start())  # noqa: RUF006


# Initialize APScheduler on FastAPI startup
@app.on_event("startup")  # type: ignore[deprecated]
async def initialize_scheduler() -> None:
    """Initialize APScheduler and register all session jobs on startup."""
    reset_all_last_check_times()
    await run_initial_session_checks()

    # Register all jobs BEFORE starting the scheduler
    register_all_session_jobs()

    # Register the automation jobs to run every 10 minutes
    try:
        scheduler.add_job(
            sync_automation_jobs,
            trigger=IntervalTrigger(minutes=10),
            id="automation_jobs",
            replace_existing=True,
            coalesce=True,
            max_instances=1,
        )
        _logger.info("[APScheduler] Registered automation jobs to run every 10 min")
    except Exception as e:
        _logger.error("[APScheduler] Failed to register automation jobs: %s", e)

    # Register MAM session expiry check to run daily
    try:
        scheduler.add_job(
            check_mam_session_expiry,
            trigger=IntervalTrigger(hours=24),
            id="check_mam_expiry",
            replace_existing=True,
            coalesce=True,
            max_instances=1,
        )
        _logger.info("[APScheduler] Registered MAM session expiry check to run daily")
    except Exception as e:
        _logger.error("[APScheduler] Failed to register MAM expiry check: %s", e)

    # Start scheduler AFTER all jobs are registered
    scheduler.start()
    _logger.info("[APScheduler] Background scheduler started")


@app.get("/api/automation/guardrails")
def api_automation_guardrails() -> dict[str, Any]:
    """Returns a mapping of session labels to MaM usernames and enabled automations for guardrail logic.

    Example:
        {
            "Gluetun": {"username": "example_user", "autoUpload": true, "autoWedge": false, "autoVIP": false},
            ...
        }

    """
    sessions = list_sessions()
    result: dict[str, Any] = {}
    for label in sessions:
        cfg = load_session(label)
        # Try to get username from last_status.raw.username
        username = None
        last_status = cfg.get("last_status", {})
        raw = last_status.get("raw", {})
        username = raw.get("username")
        # Fallback: try mam_id or proxy.username if username missing
        if not username:
            username = cfg.get("mam", {}).get("mam_id") or cfg.get("proxy", {}).get("username")
        perk_auto = cfg.get("perk_automation", {})
        result[label] = {
            "username": username,
            "autoUpload": perk_auto.get("upload_credit", {}).get("enabled", False),
            "autoWedge": perk_auto.get("wedge_automation", {}).get("enabled", False),
            "autoVIP": perk_auto.get("vip_automation", {}).get("enabled", False),
        }
    return result


async def auto_update_seedbox_if_needed(
    cfg: dict[str, Any], label: str, ip_to_use: str | None, asn: str | None, now: datetime
) -> tuple[bool, dict[str, Any] | None]:
    """Check whether a seedbox auto-update should be performed and perform it.

    Args:
        cfg: Session configuration dict.
        label: Session label string.
        ip_to_use: IP address to compare/update.
        asn: ASN value associated with the IP (string or None).
        now: Current datetime (UTC).

    Returns:
        Tuple (update_performed: bool, result: dict|None). If an update was
        triggered, result contains details about success/error/msg/reason.
        Otherwise returns (False, None).

    """
    if not ip_to_use:
        return False, None
    session_type = cfg.get("mam", {}).get("session_type", "").lower()  # 'ip locked' or 'asn locked'
    last_seedbox_ip: str | None = cfg.get("last_seedbox_ip")
    last_seedbox_asn: str | None = cfg.get("last_seedbox_asn")
    last_seedbox_update = cfg.get("last_seedbox_update")
    mam_id: str = cfg.get("mam", {}).get("mam_id", "")
    # Do not log mam_id value
    update_needed = False
    reason: str | None = None
    # Remove all IP logic for the API call; only use mam_id and proxy
    proxy_cfg = resolve_proxy_from_session_cfg(cfg)
    proxies = None
    if proxy_cfg:
        proxies = build_proxy_dict(proxy_cfg)
    # Do not log proxies dict (may contain sensitive info)
    # Only trigger update if something changed (IP or ASN)

    # If ASN-locked and ASN changed but IP did not, update ASN in config only
    if session_type == "asn locked":
        # Always get ASN using proxy if available
        proxied_ip = cfg.get("proxied_public_ip")
        proxy_cfg = resolve_proxy_from_session_cfg(cfg)
        asn_to_check, _ = await get_asn_and_timezone_from_ip(
            proxied_ip or ip_to_use, proxy_cfg if proxied_ip else None
        )

        # If ASN lookup failed, skip config update and logging
        if asn_to_check is None or asn_to_check == "Unknown ASN":
            _logger.info(
                "[AutoUpdate] label=%s ASN lookup failed or unavailable (likely fallback provider). Skipping ASN comparison to avoid false notifications.",
                label,
            )
            # Don't return an error - just skip ASN comparison for this check
            # Continue with normal processing without ASN change detection
        else:
            norm_last = extract_asn_number(last_seedbox_asn) if last_seedbox_asn else None
            norm_check = extract_asn_number(asn_to_check) if "asn_to_check" in locals() else None
            # Always store the normalized ASN number if available
            if norm_check is not None:
                cfg["last_seedbox_asn"] = norm_check
                save_session(cfg, old_label=label)
            # Log ASN compare and result at INFO level, but only once per check
            if norm_last != norm_check:
                reason = f"ASN changed: {norm_last} -> {norm_check}"
                _logger.info(
                    "[AutoUpdate] label=%s ASN changed, no seedbox API call. reason=%s",
                    label,
                    reason,
                )
                _logger.debug(
                    "[AutoUpdate][RETURN] label=%s Returning after ASN change, no seedbox update performed. reason=%s",
                    label,
                    reason,
                )

                await notify_event(
                    event_type="asn_changed",
                    label=label,
                    status="CHANGED",
                    message=reason,
                    details={"old_asn": norm_last, "new_asn": norm_check},
                )
                return False, {
                    "success": True,
                    "msg": "ASN changed, no seedbox update performed.",
                    "reason": reason,
                }
            _logger.info(
                "[AutoUpdate] label=%s ASN check: %s -> %s | No change needed",
                label,
                norm_last,
                norm_check,
            )
    # For proxied sessions, use proxied IP; for non-proxied, use detected public IP
    proxied_ip = cfg.get("proxied_public_ip")
    if proxied_ip:
        ip_to_check = proxied_ip
    else:
        # For non-proxied, get detected public IP (not mam_ip)
        detected_ip = await get_public_ip()
        ip_to_check = detected_ip
    # If IP lookup failed, skip config update and logging
    if ip_to_check is None:
        _logger.warning(
            "[AutoUpdate] label=%s Could not detect valid public IP. Skipping config update and ASN/IP change _logger.",
            label,
        )
        return False, {"success": False, "msg": "IP lookup failed. No update performed."}
    if last_seedbox_ip is None or ip_to_check != last_seedbox_ip:
        update_needed = True
        reason = f"IP changed: {last_seedbox_ip} -> {ip_to_check or 'N/A'}"
        _logger.info(
            "[AutoUpdate] label=%s IP changed: %s -> %s",
            label,
            last_seedbox_ip,
            ip_to_check or "N/A",
        )
    else:
        _logger.info(
            "[AutoUpdate] label=%s IP check: %s -> %s | No change needed",
            label,
            last_seedbox_ip,
            ip_to_check,
        )
    if update_needed:
        _logger.info(
            "[AutoUpdate] label=%s update_needed=True asn=%s reason=%s",
            label,
            asn,
            reason,
        )
        # If update is needed (IP or proxied IP changed), call seedbox API
        if not mam_id:
            _logger.warning(
                "[AutoUpdate] label=%s update_needed=True but mam_id is missing. Skipping seedbox API call.",
                label,
            )
            _logger.debug(
                "[AutoUpdate][RETURN] label=%s Returning due to missing mam_id. reason=%s",
                label,
                reason,
            )
            return False, {"success": False, "error": "mam_id missing", "reason": reason}
        # Only treat as rate-limited if the API actually returns 429 or 'too recent', not just based on timer
        try:
            _logger.debug(
                "[AutoUpdate][TRACE] label=%s About to call seedbox API (using proxy)",
                label,
            )
            cookies = {"mam_id": mam_id}
            proxy_url = None
            if proxies and isinstance(proxies, dict):
                proxy_url = proxies.get("https") or proxies.get("http")

            timeout = aiohttp.ClientTimeout(total=10)
            async with (
                aiohttp.ClientSession(timeout=timeout) as session,
                session.get(
                    "https://t.myanonamouse.net/json/dynamicSeedbox.php",
                    cookies=cookies,
                    proxy=proxy_url,
                ) as resp,
            ):
                _logger.debug(
                    "[AutoUpdate][TRACE] label=%s Seedbox API call complete. Status=%s",
                    label,
                    resp.status,
                )
                try:
                    result = await resp.json()
                    _logger.debug(
                        "[AutoUpdate][TRACE] label=%s Seedbox API response JSON received",
                        label,
                    )
                except Exception as e_json:
                    _logger.warning(
                        "[AutoUpdate][TRACE] label=%s Non-JSON response from seedbox API (error: %s)",
                        label,
                        e_json,
                    )
                    text = await resp.text()
                    result = {"Success": False, "msg": f"Non-JSON response: {text}"}

                if resp.status == 200 and result.get("Success"):
                    # Update last_seedbox_ip and mam_ip to the new detected/proxied IP
                    proxied_ip = cfg.get("proxied_public_ip")
                    if proxied_ip:
                        new_ip = proxied_ip
                    else:
                        new_ip = await get_public_ip()
                    cfg["last_seedbox_ip"] = new_ip
                    cfg["mam_ip"] = new_ip
                    cfg["last_seedbox_update"] = now.isoformat()
                    cfg["last_seedbox_asn"] = asn
                    try:
                        save_session(cfg, old_label=label)
                    except Exception as e:
                        _logger.error(
                            "[AutoUpdate][ERROR] label=%s save_session failed: %s",
                            label,
                            e,
                        )
                    _logger.info(
                        "[AutoUpdate] label=%s result=success reason=%s",
                        label,
                        reason,
                    )
                    api_msg = result.get("msg", "").strip()
                    if not api_msg or api_msg.lower() == "completed":
                        api_msg = "IP Changed. Seedbox IP updated."
                    await notify_event(
                        event_type="seedbox_update_success",
                        label=label,
                        status="SUCCESS",
                        message=api_msg,
                        details={"reason": reason, "ip": new_ip, "asn": asn},
                    )
                    return True, {"success": True, "msg": api_msg, "reason": reason}
                if resp.status == 200 and result.get("msg") == "No change":
                    proxied_ip = cfg.get("proxied_public_ip")
                    if proxied_ip:
                        new_ip = proxied_ip
                    else:
                        new_ip = await get_public_ip()
                    cfg["last_seedbox_ip"] = new_ip
                    cfg["mam_ip"] = new_ip
                    cfg["last_seedbox_update"] = now.isoformat()
                    cfg["last_seedbox_asn"] = asn
                    try:
                        save_session(cfg, old_label=label)
                    except Exception as e:
                        _logger.error(
                            "[AutoUpdate][ERROR] label=%s save_session failed: %s", label, e
                        )
                    _logger.info(
                        "[AutoUpdate] label=%s result=no_change reason=%s",
                        label,
                        reason,
                    )
                    return True, {
                        "success": True,
                        "msg": "No change: IP/ASN already set.",
                        "reason": reason,
                    }
                if resp.status == 429 or (
                    isinstance(result.get("msg"), str) and "too recent" in result.get("msg", "")
                ):
                    # Do NOT update last_seedbox_ip or mam_ip if rate-limited; return rate-limit info for UI
                    rate_limit_minutes = 60
                    if last_seedbox_update:
                        last_update_dt = datetime.fromisoformat(last_seedbox_update)
                        elapsed = (now - last_update_dt).total_seconds() / 60
                        if elapsed < 0:
                            # If last update is in the future, treat as no cooldown
                            rate_limit_minutes = 0
                        elif elapsed < 60:
                            rate_limit_minutes = int(60 - elapsed)
                        else:
                            rate_limit_minutes = 0
                    await notify_event(
                        event_type="seedbox_update_rate_limited",
                        label=label,
                        status="RATE_LIMITED",
                        message="Rate limit: last change too recent.",
                        details={"reason": reason, "rate_limit_minutes": rate_limit_minutes},
                    )
                    return True, {
                        "success": False,
                        "error": f"Rate limit: last change too recent. Try again in {rate_limit_minutes} minutes.",
                        "reason": reason,
                        "rate_limit_minutes": rate_limit_minutes,
                    }
                _logger.info(
                    "[AutoUpdate] label=%s result=error reason=%s",
                    label,
                    reason,
                )
                await notify_event(
                    event_type="seedbox_update_failure",
                    label=label,
                    status="FAILED",
                    message=result.get("msg", "Unknown error"),
                    details={"reason": reason},
                )
                return True, {
                    "success": False,
                    "error": result.get("msg", "Unknown error"),
                    "reason": reason,
                }
        except Exception as e:
            _logger.warning(
                "[AutoUpdate] label=%s result=exception reason=%s error=%s",
                label,
                reason,
                e,
            )
            _logger.debug(
                "[AutoUpdate][RETURN] label=%s Returning after exception in seedbox API call. reason=%s",
                label,
                reason,
            )

            await notify_event(
                event_type="seedbox_update_exception",
                label=label,
                status="EXCEPTION",
                message=str(e),
                details={"reason": reason},
            )
            return True, {"success": False, "error": str(e), "reason": reason}
    else:
        # Already logged IP/ASN compare and result above, so just add a single debug trace for return
        _logger.debug(
            "[AutoUpdate][RETURN] label=%s Returning default path (no update needed or triggered).",
            label,
        )
    return False, None


@app.get("/api/status")
async def api_status(label: str = Query(None), force: int = Query(0)) -> dict[str, Any]:
    """Return the current status for a session label.

    If `force` is truthy, a fresh status check is performed even if a cached
    value exists. The returned dict contains status details expected by the
    frontend UI.
    """
    global session_status_cache
    # Single API call for non-proxied IP/ASN detection (efficiency optimization)
    detected_ipinfo_data = await get_ipinfo_with_fallback()
    detected_public_ip = detected_ipinfo_data.get("ip")
    detected_public_ip_asn = None
    if detected_public_ip:
        asn_full_pub = detected_ipinfo_data.get("asn")
        match_pub = re.search(r"(AS)?(\d+)", asn_full_pub or "") if asn_full_pub else None
        detected_public_ip_asn = match_pub.group(2) if match_pub else asn_full_pub

    cfg = load_session(label) if label else None
    if cfg is None:
        if label is None:
            _logger.debug("No session label provided to status endpoint.")
        else:
            _logger.warning("Session '%s' not found or not configured.", label)
        return {
            "configured": False,
            "status_message": "Session not configured. Please save session details to begin.",
            "last_check_time": None,
            "next_check_time": None,
            "details": {},
            "detected_public_ip": detected_public_ip,
            "detected_public_ip_asn": detected_public_ip_asn,
        }
    # Proxied public IP/ASN detection (single API call optimization)
    proxy_cfg = resolve_proxy_from_session_cfg(cfg)
    proxied_public_ip, proxied_public_ip_asn, proxied_public_ip_as = None, None, None
    proxy_error = None
    if proxy_cfg and proxy_cfg.get("host"):
        # Single API call for proxied IP/ASN data
        try:
            proxied_ipinfo_data = await get_ipinfo_with_fallback(proxy_cfg=proxy_cfg)
            proxied_public_ip = proxied_ipinfo_data.get("ip")
            asn_full_proxied = proxied_ipinfo_data.get("asn")
            asn_str = str(asn_full_proxied) if asn_full_proxied is not None else ""
            match_proxied = re.search(r"(AS)?(\d+)", asn_str) if asn_str else None
            proxied_public_ip_asn = match_proxied.group(2) if match_proxied else asn_str
            proxied_public_ip_as = asn_full_proxied
            # Save to config if changed
            if proxied_public_ip and cfg.get("proxied_public_ip") != proxied_public_ip:
                cfg["proxied_public_ip"] = proxied_public_ip
                cfg["proxied_public_ip_asn"] = proxied_public_ip_asn
                save_session(cfg, old_label=label)
        except Exception as e:
            proxy_error = f"Proxy/VPN connection failed: {e!s}"

            await notify_event(
                event_type="proxy_failure",
                label=label,
                status="FAILED",
                message=proxy_error,
                details={"proxy": proxy_cfg.get("label", "unknown"), "error": str(e)},
            )
    # Clear if no proxy
    elif cfg.get("proxied_public_ip") or cfg.get("proxied_public_ip_asn"):
        cfg["proxied_public_ip"] = None
        cfg["proxied_public_ip_asn"] = None
        save_session(cfg, old_label=label)
    if not label:
        # Always return detected_public_ip and asn, even if label is missing
        return {
            "configured": False,
            "status_message": "Session label required.",
            "last_check_time": None,
            "next_check_time": None,
            "details": {},
            "detected_public_ip": detected_public_ip,
            "detected_public_ip_asn": detected_public_ip_asn,
        }
    # Always reload session config before every check to ensure latest proxy settings
    cfg = load_session(label)
    mam_id = cfg.get("mam", {}).get("mam_id", "")
    mam_ip_override = cfg.get("mam_ip", "").strip()
    ip_monitoring_mode = cfg.get("mam", {}).get("ip_monitoring_mode", "auto")

    # Note: IP detection always happens for user convenience, regardless of monitoring mode
    # Only the monitoring/auto-update logic differs between modes

    # Always resolve proxy config immediately before every get_status call
    proxy_cfg = resolve_proxy_from_session_cfg(cfg)
    # If session is not configured (no mam_id), return not configured status
    if not mam_id:
        return {
            "configured": False,
            "status_message": "Session not configured. Please save session details to begin.",
            "last_check_time": None,
            "next_check_time": None,
            "details": {},
            "detected_public_ip": detected_public_ip,
            "detected_public_ip_asn": detected_public_ip_asn,
        }
    # Use proxied public IP if available, else fallback
    ip_to_use: str | None = mam_ip_override or proxied_public_ip or detected_public_ip
    # Get ASN for configured IP
    asn_full, _ = await get_asn_and_timezone_from_ip(ip_to_use) if ip_to_use else (None, None)
    match = re.search(r"(AS)?(\d+)", asn_full or "") if asn_full else None
    asn = match.group(2) if match else asn_full
    mam_session_as = asn_full
    # Also get MAM's perspective for display only
    mam_seen = await get_mam_seen_ip_info(mam_id, proxy_cfg=proxy_cfg or {})
    mam_seen_asn = str(mam_seen.get("ASN")) if mam_seen.get("ASN") is not None else None
    mam_seen_as = mam_seen.get("AS")
    tz_env = os.environ.get("TZ")
    timezone_used = tz_env if tz_env else "UTC"
    now = datetime.now(UTC)
    # Remove timer persistence: do not use session file for last_check_time
    cache = session_status_cache.get(label, {})
    status = cache.get("status", {})
    last_check_time = cache.get("last_check_time")
    auto_update_result = None
    # Always fetch ASN for detected_public_ip
    detected_public_ip_asn = None
    detected_public_ip_as = None
    if detected_public_ip:
        asn_full_pub, _ = await get_asn_and_timezone_from_ip(detected_public_ip)
        match_pub = re.search(r"(AS)?(\d+)", asn_full_pub or "") if asn_full_pub else None
        detected_public_ip_asn = match_pub.group(2) if match_pub else asn_full_pub
        detected_public_ip_as = asn_full_pub
    # If session has never been checked (no last_status and not forced), return not configured
    if not force and (
        label not in session_status_cache or not session_status_cache[label].get("status")
    ):
        last_status = cfg.get("last_status")
        last_check_time = cfg.get("last_check_time")
        if not last_status or not last_check_time:
            return {
                "configured": False,
                "status_message": "Session not configured. Please save session details to begin.",
                "last_check_time": None,
                "next_check_time": None,
                "details": {},
            }

    # If we have cached data and not forcing, use it and calculate next_check_time
    if not force and status:
        # Use cached data with calculated timing
        check_freq_minutes = cfg.get("check_freq", 15)
        if last_check_time:
            try:
                last_check_dt = datetime.fromisoformat(last_check_time)
                next_check_dt = last_check_dt + timedelta(minutes=check_freq_minutes)
                next_check_time = next_check_dt.isoformat()
            except Exception:
                # Fallback if time parsing fails
                next_check_dt = now + timedelta(minutes=check_freq_minutes)
                next_check_time = next_check_dt.isoformat()
        else:
            next_check_dt = now + timedelta(minutes=check_freq_minutes)
            next_check_time = next_check_dt.isoformat()

        # Return cached status with calculated timing
        return {
            "mam_cookie_exists": status.get("mam_cookie_exists"),
            "points": status.get("points"),
            "wedge_active": status.get("wedge_active"),
            "vip_active": status.get("vip_active"),
            "current_ip": ip_to_use,
            "current_ip_asn": asn,
            "mam_session_as": mam_session_as,
            "mam_seen_asn": mam_seen_asn,
            "mam_seen_as": mam_seen_as,
            "configured_ip": ip_to_use,
            "configured_asn": asn,
            "mam_id": mam_id,
            "check_freq": check_freq_minutes,
            "last_check_time": last_check_time,
            "next_check_time": next_check_time,
            "configured": True,
            "status_message": status.get("status_message", "OK"),
            "auto_update_seedbox": status.get("auto_update_seedbox"),
            "details": status,
            "detected_public_ip": detected_public_ip,
            "detected_public_ip_asn": detected_public_ip_asn,
            "detected_public_ip_as": detected_public_ip_as,
            "proxied_public_ip": proxied_public_ip,
            "proxied_public_ip_asn": proxied_public_ip_asn,
            "proxied_public_ip_as": proxied_public_ip_as,
            "ip_monitoring_mode": ip_monitoring_mode,
            "vault_automation_enabled": is_vault_automation_enabled(),
        }

    if force or not status:
        # Always reload session config and resolve proxy before every real check
        cfg = load_session(label)
        proxy_cfg = resolve_proxy_from_session_cfg(cfg)
        # Always perform a fresh status check and update both cache and YAML
        _logger.debug(
            "[SessionCheck][TRIGGER] label=%s source=%s",
            label,
            "forced_api_status" if force else "auto_api_status",
        )
        mam_status = await get_status(mam_id=mam_id, proxy_cfg=proxy_cfg)
        if "proxy_error" not in mam_status and "proxy_error" in locals() and proxy_error:
            mam_status["proxy_error"] = proxy_error
        mam_status["configured_ip"] = ip_to_use
        mam_status["configured_asn"] = asn
        mam_status["mam_seen_asn"] = mam_seen_asn
        mam_status["mam_seen_as"] = mam_seen_as
        # Auto-update logic
        # Skip auto-update for static/manual modes since they don't need IP monitoring
        if ip_monitoring_mode == "auto":
            auto_update_triggered, auto_update_result = await auto_update_seedbox_if_needed(
                cfg, label, ip_to_use, asn, now
            )
        else:
            auto_update_triggered, auto_update_result = False, None
            _logger.debug(
                "[Status] Skipping auto-update for session '%s' in %s mode",
                label,
                ip_monitoring_mode,
            )

        if auto_update_triggered and auto_update_result:
            mam_status["auto_update_seedbox"] = auto_update_result
            # Always persist the correct status_message after an update
            if auto_update_result.get("error"):
                mam_status["status_message"] = auto_update_result.get("error")
            elif auto_update_result.get("success") is True and (
                auto_update_result.get("msg") or auto_update_result.get("reason")
            ):
                mam_status["status_message"] = auto_update_result.get(
                    "msg"
                ) or auto_update_result.get("reason")
            else:
                mam_status["status_message"] = build_status_message(mam_status, ip_monitoring_mode)
        else:
            mam_status["status_message"] = build_status_message(mam_status, ip_monitoring_mode)
        # Update in-memory cache and YAML file with the latest status
        session_status_cache[label] = {"status": mam_status, "last_check_time": now.isoformat()}
        status = mam_status
        last_check_time = now.isoformat()
        # Reload config from disk to ensure latest values (e.g., last_seedbox_ip) are used
        cfg = load_session(label)
        # Check for increments in hit & run and unsatisfied counts before saving new status
        await check_and_notify_count_increments(cfg, status, label)
        # Save last status to session file
        cfg["last_status"] = status
        cfg["last_check_time"] = last_check_time
        save_session(cfg, old_label=label)
    # If not force and status exists, do NOT update last_check_time or next_check_time; use cached values

    # Only log an event if a real check was performed (force=1 or no cached status),
    # and suppress the very first status check event after session creation

    suppress_next_event = False
    if label in session_status_cache and session_status_cache[label].get("suppress_next_event"):
        suppress_next_event = True
        session_status_cache[label].pop("suppress_next_event", None)
    just_created_session = False
    try:
        just_created_session = not bool(cfg.get("last_status")) and not bool(
            cfg.get("last_check_time")
        )
    except Exception:
        just_created_session = False
    if (
        (force or not (label in session_status_cache and session_status_cache[label].get("status")))
        and not just_created_session
        and not suppress_next_event
    ):
        safe_status = status if isinstance(status, dict) else {}
        prev_ip = cfg.get("last_seedbox_ip")
        prev_asn = cfg.get("last_seedbox_asn")
        proxied_ip = cfg.get("proxied_public_ip")
        mam_ip_override = cfg.get("mam_ip", "").strip()
        detected_ip = detected_public_ip
        curr_ip = mam_ip_override or proxied_ip or detected_ip
        asn_full, _ = await get_asn_and_timezone_from_ip(curr_ip) if curr_ip else (None, None)
        match = re.search(r"(AS)?(\d+)", asn_full or "") if asn_full else None
        curr_asn = match.group(2) if match else asn_full

        # Handle None ASN gracefully - if we can't determine ASN, preserve previous value for comparison
        if curr_asn is None or curr_asn == "Unknown ASN":
            curr_asn = prev_asn  # Use previous ASN to avoid false change notifications

        event_status_message = None
        error_val = (
            auto_update_result.get("error")
            if (auto_update_result and isinstance(auto_update_result, dict))
            else None
        )
        # If rate limit, show attempted new IP/ASN in event log
        if error_val and isinstance(error_val, str) and "rate limit" in error_val.lower():
            event_status_message = error_val
            attempted_ip = None
            attempted_asn = None
            if auto_update_result and isinstance(auto_update_result, dict):
                reason = auto_update_result.get("reason", "")
                ip_match = re.search(r"IP changed: ([^ ]+) -> ([^ ]+)", reason)
                asn_match = re.search(r"ASN changed: ([^ ]+) -> ([^ ]+)", reason)
                if ip_match:
                    attempted_ip = ip_match.group(2)
                if asn_match:
                    attempted_asn = asn_match.group(2)
            if not attempted_ip:
                attempted_ip = proxied_ip or detected_ip
            if not attempted_asn:
                attempted_asn = curr_asn
            event_ip_compare = f"{prev_ip} -> {attempted_ip}"
            event_asn_compare = f"{prev_asn} -> {attempted_asn}"
        else:
            event_status_message = build_status_message(safe_status, ip_monitoring_mode)
            event_ip_compare = f"{prev_ip} -> {curr_ip}"
            event_asn_compare = f"{prev_asn} -> {curr_asn}"
        # Determine event type
        if force:
            event_type = "manual"
        elif auto_update_result is not None:
            event_type = "automation"
        else:
            event_type = "scheduled"
        # All variables are defined in this scope, so log event here
        auto_update_val = get_auto_update_val(safe_status)
        event = {
            "timestamp": now.isoformat(),
            "label": label,
            "event_type": event_type,
            "details": {
                "ip_compare": event_ip_compare,
                "asn_compare": event_asn_compare,
                "auto_update": auto_update_val,  # Always a string
            },
            # Always show the real update message if an update occurred
            "status_message": (
                (
                    auto_update_result.get("msg")
                    or auto_update_result.get("reason")
                    or "IP Changed. Seedbox IP updated."
                )
                if auto_update_result
                and isinstance(auto_update_result, dict)
                and auto_update_result.get("success") is True
                and (auto_update_result.get("msg") or auto_update_result.get("reason"))
                else status.get("status_message")
                or event_status_message
                or build_status_message(status)
            ),
        }
        append_ui_event_log(event)
    # Always include the current session's saved proxy config in status
    status["proxy"] = resolve_proxy_from_session_cfg(cfg) or {}

    # Always provide detected IP for user convenience, regardless of monitoring mode
    status["detected_public_ip"] = detected_public_ip
    status["detected_public_ip_asn"] = detected_public_ip_asn
    status["detected_public_ip_as"] = detected_public_ip_as

    status["proxied_public_ip"] = proxied_public_ip
    status["proxied_public_ip_asn"] = proxied_public_ip_asn
    status["proxied_public_ip_as"] = None
    if proxied_public_ip:
        # Get full AS string for proxied IP
        asn_full_proxied, _ = await get_asn_and_timezone_from_ip(proxied_public_ip)
        status["proxied_public_ip_as"] = asn_full_proxied
    # Always set the top-level status message for the UI, prioritizing error/rate limit, then success, then fallback
    if auto_update_result is not None:
        status["auto_update_seedbox"] = auto_update_result
        # Priority: error (rate limit or other)
        error_val = (
            auto_update_result.get("error") if isinstance(auto_update_result, dict) else None
        )
        if error_val and isinstance(error_val, str):
            status["status_message"] = error_val
        # Next: explicit success message or reason
        elif auto_update_result.get("success") is True and (
            auto_update_result.get("msg") or auto_update_result.get("reason")
        ):
            status["status_message"] = auto_update_result.get("msg") or auto_update_result.get(
                "reason"
            )
        # Fallback: use build_status_message
        else:
            status["status_message"] = build_status_message(status, ip_monitoring_mode)
    elif status.get("error"):
        status["status_message"] = f"Error: {status['error']}"
    elif status.get("message"):
        status["status_message"] = status["message"]
    else:
        status["status_message"] = build_status_message(status, ip_monitoring_mode)
    # Calculate next_check_time (UTC ISO format)
    check_freq_minutes = cfg.get("check_freq", 5)
    # Use cached last_check_time unless a real check was just performed
    try:
        parsed_last_check_dt: datetime | None = (
            datetime.fromisoformat(last_check_time) if last_check_time else None
        )
    except Exception:
        parsed_last_check_dt = None
    if not parsed_last_check_dt:
        # Fallback: use now as last_check_time if missing/invalid
        parsed_last_check_dt = now
        last_check_time = now.isoformat()
    # Only update next_check_time if a real check was performed
    if force or not status:
        next_check_dt = parsed_last_check_dt + timedelta(minutes=check_freq_minutes)
        next_check_time_val: str = next_check_dt.isoformat()
    else:
        # Use cached next_check_time if available
        cached_next_check_time: str | None = cfg.get("next_check_time")
        if not cached_next_check_time:
            # If not present, calculate from last_check_time
            next_check_dt = parsed_last_check_dt + timedelta(minutes=check_freq_minutes)
            next_check_time_val = next_check_dt.isoformat()
        else:
            next_check_time_val = cached_next_check_time
    return {
        "mam_cookie_exists": status.get("mam_cookie_exists"),
        "points": status.get("points"),
        "wedge_active": status.get("wedge_active"),
        "vip_active": status.get("vip_active"),
        "current_ip": ip_to_use,
        "current_ip_asn": asn,
        "mam_session_as": mam_session_as,
        "configured_ip": ip_to_use,
        "configured_asn": asn,
        "mam_seen_asn": mam_seen_asn,
        "mam_seen_as": mam_seen_as,
        "detected_public_ip": detected_public_ip,
        "detected_public_ip_asn": detected_public_ip_asn,
        "detected_public_ip_as": detected_public_ip_as,
        "proxied_public_ip": proxied_public_ip,
        "proxied_public_ip_asn": proxied_public_ip_asn,
        "proxied_public_ip_as": proxied_public_ip_as,
        "ip_monitoring_mode": ip_monitoring_mode,
        "vault_automation_enabled": is_vault_automation_enabled(),
        "ip_source": "configured",
        "message": status.get("message", "Please provide your MaM ID in the configuration."),
        "last_check_time": last_check_time,
        "next_check_time": next_check_time_val,
        "timezone": timezone_used,
        "check_freq": check_freq_minutes,
        "status_message": status.get("status_message"),
        "details": status,
    }


@app.post("/api/session/refresh")
def api_session_refresh(request: Request) -> dict[str, Any]:
    """Trigger a lightweight session refresh.

    This validates that a global MaM ID is configured and returns a simple
    success message. Used by the frontend to verify that session data are
    available.
    """
    cfg = load_config()
    mam_id = cfg.get("mam", {}).get("mam_id", "")
    if not mam_id:
        raise HTTPException(status_code=400, detail="MaM ID not configured.")
    try:
        return {"success": True, "message": "Session refreshed."}
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.get("/api/sessions")
def api_list_sessions() -> dict[str, Any]:
    """Return a list of saved session labels.

    Response format: {"sessions": [...labels...]}
    """
    sessions = list_sessions()
    _logger.debug("[Session] Listed sessions: count=%s", len(sessions))
    return {"sessions": sessions}


@app.get("/api/session/{label}")
def api_load_session(label: str) -> dict[str, Any]:
    """Load and return a session configuration by label.

    Raises HTTPException(404) if the session does not exist.
    """
    cfg = load_session(label)
    if cfg is None:
        _logger.warning("Session '%s' not found or not configured.", label)
        raise HTTPException(status_code=404, detail=f"Session '{label}' not found.")
    return cfg


@app.post("/api/session/save")
async def api_save_session(request: Request) -> dict[str, Any]:
    """Save or update a session configuration.

    This endpoint merges backend-managed fields from previous configs,
    preserves sensitive proxy passwords if omitted, persists the session
    YAML, and re-registers scheduler jobs as needed.
    """
    global session_status_cache

    try:
        cfg = await request.json()
        old_label = cfg.get("old_label")
        proxy_cfg = cfg.get("proxy", {}) or {}
        prev_cfg = None

        if "proxy" in cfg:
            if old_label:
                try:
                    prev_cfg = load_session(old_label)
                except Exception:
                    prev_cfg = None
            elif cfg.get("label"):
                try:
                    prev_cfg = load_session(cfg["label"])
                except Exception:
                    prev_cfg = None
            # If password is missing but previous session had one, keep it
            if (
                isinstance(proxy_cfg, dict)
                and (not proxy_cfg.get("password"))
                and prev_cfg
                and prev_cfg.get("proxy", {})
                and prev_cfg.get("proxy", {}).get("password")
            ):
                proxy_cfg["password"] = prev_cfg["proxy"]["password"]
            cfg["proxy"] = proxy_cfg

        # Merge backend-managed fields from previous config unless explicitly overwritten
        backend_fields = [
            "last_seedbox_ip",
            "last_seedbox_asn",
            "last_seedbox_update",
            "last_status",
            "last_check_time",
            "proxied_public_ip",
            "proxied_public_ip_asn",
            "points",
            "vip_active",
        ]
        # If prev_cfg not set above, try to load it now
        if prev_cfg is None:
            if old_label:
                try:
                    prev_cfg = load_session(old_label)
                except Exception:
                    prev_cfg = None
            elif cfg.get("label"):
                try:
                    prev_cfg = load_session(cfg["label"])
                except Exception:
                    prev_cfg = None
        if prev_cfg:
            for field in backend_fields:
                if field in prev_cfg and field not in cfg:
                    cfg[field] = prev_cfg[field]

        label = cfg.get("label")
        session_path = get_session_path(label)
        is_new = not Path(session_path).exists()

        if is_new:
            # Clear any old event log entries for this session label

            clear_ui_event_log_for_session(label)
            # Only log creation event
            save_session(cfg, old_label=old_label)
            _logger.info("[Session] Created session: label=%s", label)
            append_ui_event_log(
                {
                    "event": "session_created",
                    "label": label,
                    "timestamp": datetime.now(UTC).isoformat(),
                    "user_action": True,
                    "status_message": f"Session '{label}' created.",
                }
            )
            # Suppress the first status check event
            if label:
                session_status_cache[label] = session_status_cache.get(label, {})
                session_status_cache[label]["suppress_next_event"] = True
        else:
            # Only log save event (update)
            save_session(cfg, old_label=old_label)
            _logger.info("[Session] Saved session: label=%s old_label=%s", label, old_label)
            append_ui_event_log(
                {
                    "event": "session_saved",
                    "label": label,
                    "old_label": old_label,
                    "timestamp": datetime.now(UTC).isoformat(),
                    "user_action": True,
                    "status_message": f"Session '{label}' saved.",
                }
            )

        # Handle session job management for label changes and updates
        try:
            # If label changed, remove the old job
            if old_label and old_label != label:
                old_job_id = f"session_check_{old_label}"
                if scheduler.get_job(old_job_id):
                    scheduler.remove_job(old_job_id)
                    _logger.info("[APScheduler] Removed job for renamed session '%s'", old_label)

                # Update vault configurations that reference the old session label
                try:
                    from backend.vault_config import (  # noqa: PLC0415
                        update_session_label_references,
                    )

                    if update_session_label_references(old_label, label):
                        _logger.info(
                            "[Session] Updated vault config references: %s -> %s", old_label, label
                        )
                except Exception as vault_err:
                    _logger.error(
                        "[Session] Failed to update vault config references: %s", vault_err
                    )

            # Register/update the job for the current session
            register_session_job(label)
        except Exception as e:
            _logger.error(
                "[APScheduler] Failed to manage session job for '%s' after save: %s", label, e
            )

        # Auto-update Prowlarr if enabled and MAM ID changed
        prowlarr_cfg = cfg.get("prowlarr", {})
        if prowlarr_cfg.get("enabled") and prowlarr_cfg.get("auto_update_on_save"):
            # Check if MAM ID actually changed
            new_mam_id = cfg.get("mam", {}).get("mam_id")
            prev_mam_id = prev_cfg.get("mam", {}).get("mam_id") if prev_cfg else None

            if new_mam_id and new_mam_id != prev_mam_id:
                try:
                    from backend.prowlarr_integration import (  # noqa: PLC0415
                        sync_mam_id_to_prowlarr,
                    )

                    _logger.info(
                        "[Prowlarr] Auto-update triggered for session '%s' (MAM ID changed: %s -> %s)",
                        label,
                        prev_mam_id,
                        new_mam_id,
                    )
                    result = await sync_mam_id_to_prowlarr(cfg, new_mam_id)
                    if result.get("success"):
                        _logger.info("[Prowlarr] Auto-update successful: %s", result.get("message"))
                        append_ui_event_log(
                            {
                                "event": "prowlarr_auto_updated",
                                "label": label,
                                "timestamp": datetime.now(UTC).isoformat(),
                                "user_action": False,
                                "status_message": result.get(
                                    "message", "MAM ID synced to Prowlarr"
                                ),
                            }
                        )
                    else:
                        _logger.warning("[Prowlarr] Auto-update failed: %s", result.get("message"))
                except Exception as e:
                    _logger.error("[Prowlarr] Auto-update error for session '%s': %s", label, e)
            elif new_mam_id == prev_mam_id:
                _logger.debug(
                    "[Prowlarr] Auto-update skipped for session '%s' (MAM ID unchanged: %s)",
                    label,
                    new_mam_id,
                )
            else:
                _logger.debug(
                    "[Prowlarr] Auto-update skipped for session '%s' (no MAM ID provided)", label
                )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save session: {e}") from e
    else:
        return {"success": True}


@app.delete("/api/session/delete/{label}")
def api_delete_session(label: str) -> dict[str, Any]:
    """Delete a session by label and clear related UI event log entries.

    Returns a success flag or raises HTTPException on failure.
    """
    try:
        delete_session(label)
        clear_ui_event_log_for_session(label)
        # If no sessions remain, blank out last_session.yaml
        if len(list_sessions()) == 0:
            write_last_session(None)
        _logger.info("[Session] Deleted session: label=%s", label)
        append_ui_event_log(
            {
                "event": "session_deleted",
                "label": label,
                "timestamp": datetime.now(UTC).isoformat(),
                "user_action": True,
                "status_message": f"Session '{label}' deleted.",
            }
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete session: {e}") from e
    else:
        return {"success": True}


@app.post("/api/session/perkautomation/save")
async def api_save_perkautomation(request: Request) -> dict[str, Any]:
    """Save perk automation settings for a session.

    Handles time-based triggers by setting or clearing last_purchase timestamps
    as appropriate, then persists the session config.
    """
    try:
        data = await request.json()
        label = data.get("label")
        if not label:
            raise HTTPException(status_code=400, detail="Session label required.")
        cfg = load_session(label)
        if cfg is None:
            _logger.warning("Session '%s' not found or not configured.", label)
            return {"success": False, "error": f"Session '{label}' not found."}
        # Save automation settings to session config
        new_pa = data.get("perk_automation", {})
        old_pa = cfg.get("perk_automation", {})
        now_iso = datetime.now(UTC).isoformat()

        # Helper: set/clear last_purchase timestamps for time-based automations
        def handle_time_trigger(automation_key: str) -> None:
            """Helper to set or clear last_purchase timestamps for an automation.

            This nested helper mutates the passed session automation config
            entry in-place based on whether the automation is enabled and its
            trigger type.
            """
            auto = new_pa.get(automation_key, {})
            enabled = auto.get("enabled", False)
            trigger_type = auto.get("trigger_type", "time")
            # Map automation_key to new timestamp field
            ts_field = None
            if automation_key == "upload_credit":
                ts_field = "last_upload_time"
            elif automation_key == "vip_automation":
                ts_field = "last_vip_time"
            elif automation_key == "wedge_automation":
                ts_field = "last_wedge_time"
            if not ts_field:
                return
            # If disabling, always clear timestamp
            if not enabled:
                if ts_field in auto:
                    auto.pop(ts_field, None)
                if ts_field in cfg.get("perk_automation", {}).get(automation_key, {}):
                    cfg["perk_automation"][automation_key].pop(ts_field, None)
                return
            # If enabling and time-based, set timestamp if missing
            if enabled and trigger_type in ("time", "both"):
                if not old_pa.get(automation_key, {}).get(ts_field):
                    auto[ts_field] = now_iso

        handle_time_trigger("upload_credit")
        handle_time_trigger("vip_automation")
        handle_time_trigger("wedge_automation")

        cfg["perk_automation"] = new_pa
        save_session(cfg, old_label=label)

    except Exception as e:
        _logger.warning("[PerkAutomation] Failed to save automation settings: %s", e)
        return {"success": False, "error": str(e)}
    else:
        return {"success": True}


@app.post("/api/session/update_seedbox")
async def api_update_seedbox(request: Request) -> dict[str, Any]:
    """Force-update the seedbox IP/ASN for a session using an entered IP.

    Validates input, performs the MaM API request, and updates the session
    config if the seedbox response indicates a change.
    """
    try:
        data = await request.json()
        label = data.get("label")
        if not label:
            raise HTTPException(status_code=400, detail="Session label required.")
        cfg = load_session(label)
        if cfg is None:
            _logger.warning("Session '%s' not found or not configured.", label)
            raise HTTPException(status_code=404, detail=f"Session '{label}' not found.")
        mam_id = cfg.get("mam", {}).get("mam_id", "")
        if not mam_id:
            raise HTTPException(status_code=400, detail="MaM ID not configured in session.")
        mam_ip_override = cfg.get("mam_ip", "").strip()
        if not mam_ip_override:
            raise HTTPException(status_code=400, detail="Session mam_ip (entered IP) is required.")
        ip_to_use = mam_ip_override
        asn_full, _ = await get_asn_and_timezone_from_ip(ip_to_use)
        match = re.search(r"(AS)?(\d+)", asn_full or "") if asn_full else None
        asn = match.group(2) if match else asn_full
        last_seedbox_ip = cfg.get("last_seedbox_ip")
        last_seedbox_asn = cfg.get("last_seedbox_asn")
        last_seedbox_update = cfg.get("last_seedbox_update")
        now = datetime.now(UTC)
        update_needed = (ip_to_use != last_seedbox_ip) or (asn != last_seedbox_asn)
        if last_seedbox_update:
            last_update_dt = datetime.fromisoformat(last_seedbox_update)
            if (now - last_update_dt) < timedelta(hours=1):
                minutes_left = 60 - int((now - last_update_dt).total_seconds() // 60)
                return {
                    "success": False,
                    "error": f"Rate limit: wait {minutes_left} more minutes before updating seedbox IP/ASN.",
                }
        if not update_needed:
            return {"success": True, "msg": "No change: IP/ASN already set."}
        # Proxy config: always resolve from proxies.yaml using session config

        proxy_cfg = resolve_proxy_from_session_cfg(cfg)
        cookies = {"mam_id": mam_id}
        if proxy_cfg:
            proxies = build_proxy_dict(proxy_cfg)
        # Log proxy label and redacted URL for debugging
        if proxies:
            proxy_label = proxy_cfg.get("label") if proxy_cfg else None
            proxy_url_log = {
                k: v.replace(proxy_cfg.get("password", ""), "***")
                if proxy_cfg and proxy_cfg.get("password")
                else v
                for k, v in proxies.items()
            }
            _logger.debug(
                "[SeedboxUpdate] Using proxy label: %s, proxies: %s", proxy_label, proxy_url_log
            )

        resp_status = None
        resp_text = None
        result = None
        timeout = aiohttp.ClientTimeout(total=10)
        proxy_url = None
        if proxies and isinstance(proxies, dict):
            proxy_url = proxies.get("https") or proxies.get("http")
        try:
            async with (
                aiohttp.ClientSession(cookies=cookies) as session,
                session.get(
                    "https://t.myanonamouse.net/json/dynamicSeedbox.php",
                    timeout=timeout,
                    proxy=proxy_url,
                ) as resp,
            ):
                resp_status = resp.status
                resp_text = await resp.text()
                try:
                    result = await resp.json()
                except Exception:
                    result = {"Success": False, "msg": f"Non-JSON response: {resp_text}"}
        except Exception as e:
            _logger.warning("[SeedboxUpdate] HTTP request failed: %s", e)
            return {"success": False, "error": str(e)}

        _logger.info("[SeedboxUpdate] MaM API response: status=%s, text=%s", resp_status, resp_text)
        if resp_status == 200 and result.get("Success"):
            cfg["last_seedbox_ip"] = ip_to_use
            cfg["last_seedbox_asn"] = asn
            cfg["last_seedbox_update"] = now.isoformat()
            save_session(cfg, old_label=label)
            # Use a user-friendly message if the API message is missing or generic
            api_msg = result.get("msg", "").strip()
            if not api_msg or api_msg.lower() == "completed":
                api_msg = "IP Changed. Seedbox IP updated."
            return {"success": True, "msg": api_msg, "ip": ip_to_use, "asn": asn}
        if resp_status == 200 and result.get("msg") == "No change":
            cfg["last_seedbox_ip"] = ip_to_use
            cfg["last_seedbox_asn"] = asn
            cfg["last_seedbox_update"] = now.isoformat()
            save_session(cfg, old_label=label)
            return {
                "success": True,
                "msg": "No change: IP/ASN already set.",
                "ip": ip_to_use,
                "asn": asn,
            }
        if resp_status == 429 or (
            isinstance(result.get("msg"), str) and "too recent" in result.get("msg", "")
        ):
            return {
                "success": False,
                "error": "Rate limit: last change too recent. Try again later.",
                "msg": result.get("msg"),
            }
        return {"success": False, "error": result.get("msg", "Unknown error"), "raw": result}
    except Exception as e:
        _logger.error("[SeedboxUpdate] Failed: %s", e)
        return {"success": False, "error": str(e)}


# PROWLARR INTEGRATION ENDPOINTS


@app.post("/api/prowlarr/test_expiry_notification")
async def api_test_expiry_notification(request: Request) -> dict[str, Any]:
    """Manually trigger a test MAM session expiry notification.

    Expects JSON with: label (session label)
    This is for testing the notification system without waiting for actual expiry.
    """
    try:
        data = await request.json()
        label = data.get("label", "").strip()

        if not label:
            return {"success": False, "message": "Session label required"}

        # Load session
        cfg = load_session(label)
        if not cfg:
            return {"success": False, "message": f"Session '{label}' not found"}

        prowlarr_cfg = cfg.get("prowlarr", {})
        if not prowlarr_cfg.get("enabled"):
            return {"success": False, "message": "Prowlarr not enabled for this session"}

        # Get created date or simulate one
        created_date_str = cfg.get("mam_session_created_date")
        if created_date_str:
            try:
                if "T" in created_date_str and len(created_date_str) == 16:
                    created_date = datetime.fromisoformat(created_date_str)
                else:
                    created_date = datetime.fromisoformat(created_date_str)
            except Exception:
                created_date = datetime.now() - timedelta(days=85)
        else:
            # Simulate a session expiring in 5 days
            created_date = datetime.now() - timedelta(days=85)

        expiry_date = created_date + timedelta(days=90)
        days_until_expiry = (expiry_date - datetime.now()).days

        # Get MAM ID and redact for security
        mam_id = cfg.get("mam", {}).get("mam_id", "N/A")
        redacted_mam_id = redact_mam_id(mam_id) if mam_id != "N/A" else "N/A"

        # Prepare test notification message
        message = (
            f"⚠️ MAM Session Expiring Soon! [TEST NOTIFICATION]\n\n"
            f"Session: {label}\n"
            f"{redacted_mam_id}\n"
            f"Created: {created_date.strftime('%Y-%m-%d %H:%M')}\n"
            f"Expires: {expiry_date.strftime('%Y-%m-%d %H:%M')}\n"
            f"Days Remaining: {days_until_expiry} day{'s' if days_until_expiry != 1 else ''}\n\n"
            f"You will need to refresh your MAM session and update Prowlarr.\n"
        )

        if prowlarr_cfg.get("host"):
            message += f"Prowlarr: {prowlarr_cfg['host']}:{prowlarr_cfg.get('port', 9696)}"

        details = {
            "session_label": label,
            "mam_id": redacted_mam_id,  # Use redacted version in details too
            "created_date": created_date.isoformat(),
            "expiry_date": expiry_date.isoformat(),
            "days_remaining": days_until_expiry,
            "prowlarr_host": prowlarr_cfg.get("host", "N/A"),
            "test_notification": True,
        }

        _logger.info("[Prowlarr] Sending test expiry notification for session '%s'", label)

        # Send test notification
        await notify_event(
            event_type="mam_session_expiry",
            label=label,
            status="WARNING",
            message=message,
            details=details,
        )

        return {
            "success": True,
            "message": f"Test notification sent for session '{label}'",
            "details": {
                "created": created_date.strftime("%Y-%m-%d %H:%M"),
                "expires": expiry_date.strftime("%Y-%m-%d %H:%M"),
                "days_remaining": days_until_expiry,
            },
        }

    except Exception as e:
        _logger.exception("[Prowlarr] Failed to send test expiry notification")
        return {"success": False, "message": f"Error: {e!s}"}


@app.post("/api/prowlarr/test")
async def api_prowlarr_test(request: Request) -> dict[str, Any]:
    """Test Prowlarr API connectivity.

    Expects JSON with: host, port, api_key
    """
    try:
        data = await request.json()
        host = data.get("host", "").strip()
        port = data.get("port")
        api_key = data.get("api_key", "").strip()

        _logger.debug(
            "[Prowlarr] Test connection request - host: %s, port: %s (type: %s), api_key: %s",
            host,
            port,
            type(port).__name__,
            "***" + api_key[-4:] if api_key and len(api_key) > 4 else "***",
        )

        if not host or port is None or not api_key:
            return {"success": False, "message": "Missing required fields"}

        # Test connection and find MAM indexer
        conn_result = await test_prowlarr_connection(host, port, api_key)
        if not conn_result["success"]:
            return conn_result

        # If connection successful, try to find MAM indexer
        indexer_result = await find_mam_indexer_id(host, port, api_key)
        if indexer_result["success"]:
            # Merge results: keep connection success, add indexer_id
            return {
                "success": True,
                "message": conn_result["message"],
                "indexer_count": conn_result.get("indexer_count"),
                "indexer_id": indexer_result.get("indexer_id"),
            }

        # MAM indexer not found, but connection was successful
        return {
            "success": True,
            "message": f"{conn_result['message']} However, MyAnonamouse indexer not found.",
            "indexer_count": conn_result.get("indexer_count"),
            "warning": indexer_result.get("message"),
        }
    except Exception as e:
        _logger.exception("Prowlarr test failed")
        return {"success": False, "message": f"Error: {e!s}"}


@app.post("/api/prowlarr/find_indexer")
async def api_prowlarr_find_indexer(request: Request) -> dict[str, Any]:
    """Find MyAnonamouse indexer ID in Prowlarr.

    Expects JSON with: host, port, api_key
    """
    try:
        data = await request.json()
        host = data.get("host", "").strip()
        port = data.get("port")
        api_key = data.get("api_key", "").strip()

        if not all([host, port, api_key]):
            return {"success": False, "message": "Missing required fields"}

        return await find_mam_indexer_id(host, port, api_key)
    except Exception as e:
        _logger.exception("Failed to find MAM indexer")
        return {"success": False, "message": f"Error: {e!s}"}


@app.post("/api/prowlarr/update")
async def api_prowlarr_update(request: Request) -> dict[str, Any]:
    """Update MAM ID in Prowlarr for a session.

    Expects JSON with:
    - label: session label
    - mam_id: (optional) new MAM ID to sync. If not provided, uses session's MAM ID.
    """
    try:
        data = await request.json()
        label = data.get("label")
        if not label:
            return {"success": False, "message": "Session label required"}

        cfg = load_session(label)
        if cfg is None:
            return {"success": False, "message": f"Session '{label}' not found"}

        # Use provided mam_id or fall back to session config
        mam_id = data.get("mam_id") or cfg.get("mam", {}).get("mam_id", "")
        if not mam_id:
            return {
                "success": False,
                "message": "MAM ID not configured in session and not provided",
            }

        result = await sync_mam_id_to_prowlarr(cfg, mam_id)
        if result["success"]:
            # Log success event
            append_ui_event_log(
                {
                    "event": "prowlarr_manual_update",
                    "label": label,
                    "event_type": "prowlarr_update",
                    "status_message": f"Updated Prowlarr MAM ID to {mam_id}",
                    "user_action": True,
                    "timestamp": datetime.now(UTC).isoformat(),
                }
            )
        return result  # noqa: TRY300
    except Exception as e:
        _logger.exception("Failed to update Prowlarr")
        return {"success": False, "message": f"Error: {e!s}"}


@app.get("/api/server_time")
def api_server_time() -> dict[str, Any]:
    """Return current server time in local timezone (ISO format)."""
    from zoneinfo import ZoneInfo  # noqa: PLC0415

    # Get timezone from environment variable or default to UTC
    tz_name = os.environ.get("TZ", "UTC")
    try:
        tz = ZoneInfo(tz_name)
    except Exception:
        tz = ZoneInfo("UTC")

    now = datetime.now(tz)
    return {"server_time": now.isoformat()}


# MILLIONAIRE'S VAULT COOKIE ENDPOINTS


@app.get("/api/vault/bookmarklet")
def api_vault_bookmarklet() -> dict[str, Any]:
    """Get JavaScript bookmarklet for cookie extraction."""

    bookmarklet = generate_cookie_extraction_bookmarklet()

    return {
        "bookmarklet": bookmarklet,
        "instructions": "Drag this bookmarklet to your bookmarks bar, then click it while on MyAnonamouse.net to extract cookies",
    }


@app.get("/api/vault/total")
async def api_vault_total() -> dict[str, Any]:
    """Get the current total points in the Millionaire's Vault (community total)."""
    try:
        vault_config = load_vault_config()
        configurations = vault_config.get("vault_configurations", {})

        if not configurations:
            return {"success": False, "error": "No vault configurations found"}

        # Try to find any configuration with browser cookies to fetch vault total
        for config_id, config in configurations.items():
            browser_mam_id = config.get("browser_mam_id", "").strip()
            if browser_mam_id:
                # Extract the actual mam_id from browser cookies (same as other endpoints)
                extracted_mam_id = await extract_mam_id_from_browser_cookies(browser_mam_id)
                if not extracted_mam_id:
                    continue

                effective_uid = get_effective_uid(config)
                effective_proxy = get_effective_proxy_config(config)

                if effective_uid:
                    result = await get_vault_total_points(
                        extracted_mam_id, effective_uid, effective_proxy
                    )
                    if result.get("success"):
                        return {
                            "success": True,
                            "vault_total_points": result["vault_total_points"],
                            "vault_total_formatted": f"{result['vault_total_points']:,}",
                            "config_used": config_id,
                        }

    except Exception as e:
        _logger.error("[VaultTotal] Error: %s", e)
        return {"success": False, "error": str(e)}
    else:
        return {
            "success": False,
            "error": "No vault configuration found with valid browser cookies",
        }


@app.get("/api/vault/uid/{uid}/summary")
def api_vault_uid_summary(uid: str) -> dict[str, Any]:
    """Get vault setup summary for all sessions sharing a UID."""

    try:
        summary = get_uid_vault_summary(uid)

    except Exception as e:
        _logger.error("[VaultUIDSummary] Error: %s", e)
        return {"status": "error", "message": f"Error getting UID summary: {e!s}"}
    else:
        return {"status": "success", "summary": summary}


@app.post("/api/vault/uid/{uid}/sync_browser_mam_id")
def api_vault_uid_sync_browser_mam_id(uid: str, request: dict[str, Any]) -> dict[str, Any]:
    """Sync browser MAM ID across all sessions with the same UID."""

    try:
        browser_mam_id = request.get("browser_mam_id", "")

        if not browser_mam_id:
            return {"status": "error", "message": "browser_mam_id is required"}

        result = sync_browser_mam_id_across_uid_sessions(uid, browser_mam_id)

        return {"status": "success" if result["success"] else "error", "result": result}

    except Exception as e:
        _logger.error("[VaultUIDSync] Error: %s", e)
        return {"status": "error", "message": f"Error syncing browser MAM ID: {e!s}"}


@app.get("/api/vault/uid/{uid}/conflicts")
def api_vault_uid_conflicts(uid: str) -> dict[str, Any]:
    """Check for vault automation conflicts across sessions with same UID."""

    try:
        conflicts = check_vault_automation_conflicts(uid)

    except Exception as e:
        _logger.error("[VaultUIDConflicts] Error: %s", e)
        return {"status": "error", "message": f"Error checking conflicts: {e!s}"}
    else:
        return {"status": "success", "conflicts": conflicts}


# Vault Configuration Endpoints


@app.get("/api/vault/configurations")
def api_list_vault_configurations() -> dict[str, Any]:
    """List all vault configurations."""

    try:
        config_ids = list_vault_configurations()
        full_config = load_vault_config()

        # Return basic info about each configuration
        configurations = {}
        for config_id in config_ids:
            vault_config = full_config["vault_configurations"][config_id]
            configurations[config_id] = {
                "id": config_id,
                "browser_mam_id": vault_config.get("browser_mam_id", "")[:10] + "..."
                if len(vault_config.get("browser_mam_id", "")) > 10
                else vault_config.get("browser_mam_id", ""),
                "uid_source": vault_config.get("uid_source", "session"),
                "associated_session_label": vault_config.get("associated_session_label", ""),
                "connection_method": vault_config.get("connection_method", "auto"),
                "automation_enabled": vault_config.get("automation", {}).get("enabled", False),
            }

    except Exception as e:
        _logger.error("[VaultConfigAPI] Error listing configurations: %s", e)
        raise HTTPException(status_code=500, detail=str(e)) from e
    else:
        return {"configurations": configurations}


@app.get("/api/vault/configuration/{config_id}")
async def api_get_vault_configuration(config_id: str) -> dict[str, Any]:
    """Get a specific vault configuration with enriched donation data."""

    try:
        vault_config = get_vault_configuration(config_id)
        if vault_config is None:
            raise HTTPException(
                status_code=404, detail=f"Vault configuration '{config_id}' not found"
            )

        # Enrich with MAM donation history if browser cookies are available
        browser_mam_id = vault_config.get("browser_mam_id", "").strip()
        if browser_mam_id:
            try:
                extracted_mam_id = await extract_mam_id_from_browser_cookies(browser_mam_id)
                effective_uid = get_effective_uid(vault_config)
                effective_proxy = get_effective_proxy_config(vault_config)

                if extracted_mam_id and effective_uid:
                    # Get MouseTrap's last donation info from pot_tracking (PRIMARY SOURCE)
                    pot_tracking = vault_config.get("pot_tracking", {})
                    mousetrap_last_time = pot_tracking.get("last_donation_time")
                    mousetrap_amount = pot_tracking.get("last_donation_amount", 0)
                    mousetrap_type = pot_tracking.get("last_donation_type", "automated")

                    # Fetch vault total and MAM donation history (SUPPLEMENTARY)
                    mam_result = await get_vault_total_points(
                        extracted_mam_id, effective_uid, effective_proxy
                    )

                    # Fetch MAM donation history (try pot.php first, fallback to donate.php)
                    mam_donations = []
                    if mam_result.get("success") and mam_result.get("donation_history"):
                        mam_donations = mam_result["donation_history"]

                    # If pot.php has no history (hit donation limit), try donate.php
                    if not mam_donations:
                        donate_result = await get_last_donation_from_donate_page(
                            extracted_mam_id, effective_uid, effective_proxy
                        )
                        if donate_result.get("success") and donate_result.get("last_donation"):
                            mam_donations = [donate_result["last_donation"]]

                    # Now determine what to display
                    if mousetrap_last_time and mam_donations:
                        # Both have data - compare timestamps
                        mousetrap_date = datetime.fromtimestamp(mousetrap_last_time, tz=UTC)
                        mam_last = mam_donations[0]
                        mam_date = datetime.fromisoformat(mam_last["date"])

                        # Check if they're the same donation (within 10 seconds tolerance)
                        time_diff = abs((mam_date - mousetrap_date).total_seconds())

                        if time_diff <= 10:
                            # Same donation - use MouseTrap data (has type info)
                            vault_config["last_donation_display"] = {
                                "timestamp": mousetrap_date.isoformat(),
                                "amount": mousetrap_amount,
                                "type": "Manual" if mousetrap_type == "manual" else "Automated",
                                "source": "MouseTrap",
                            }
                        elif mam_date > mousetrap_date:
                            # MAM donation is NEWER (user donated via website after MouseTrap)
                            vault_config["last_donation_display"] = {
                                "timestamp": mam_last["date"],
                                "amount": mam_last["amount"],
                                "type": None,  # Don't show type for website donations
                                "source": "MyAnonamouse",
                            }
                        else:
                            # MouseTrap donation is newer (shouldn't happen, but use MouseTrap)
                            vault_config["last_donation_display"] = {
                                "timestamp": mousetrap_date.isoformat(),
                                "amount": mousetrap_amount,
                                "type": "Manual" if mousetrap_type == "manual" else "Automated",
                                "source": "MouseTrap",
                            }

                        # Include full MAM donation history
                        vault_config["mam_donation_history"] = mam_donations

                    elif mam_donations:
                        # Only MAM has data (MouseTrap hasn't tracked yet)
                        mam_last = mam_donations[0]
                        vault_config["last_donation_display"] = {
                            "timestamp": mam_last["date"],
                            "amount": mam_last["amount"],
                            "type": None,
                            "source": "MyAnonamouse",
                        }
                        vault_config["mam_donation_history"] = mam_donations

                    elif mousetrap_last_time:
                        # Only MouseTrap has data (MAM history not available - new pot/new day)
                        # This is EXPECTED - pot.php resets with each pot, donate.php resets daily
                        mousetrap_date = datetime.fromtimestamp(mousetrap_last_time, tz=UTC)
                        vault_config["last_donation_display"] = {
                            "timestamp": mousetrap_date.isoformat(),
                            "amount": mousetrap_amount,
                            "type": "Manual" if mousetrap_type == "manual" else "Automated",
                            "source": "MouseTrap",
                        }
                        _logger.debug(
                            "[VaultConfigAPI] Using MouseTrap tracking (MAM history unavailable): %s points on %s",
                            mousetrap_amount,
                            mousetrap_date.isoformat(),
                        )

                    # If neither has data, don't set last_donation_display

            except Exception as e:
                _logger.warning("[VaultConfigAPI] Failed to enrich with donation history: %s", e)
                # Non-fatal - continue without enrichment

    except HTTPException:
        raise
    except Exception as e:
        _logger.error("[VaultConfigAPI] Error getting configuration '%s': %s", config_id, e)
        raise HTTPException(status_code=500, detail=str(e)) from e
    else:
        return vault_config


@app.post("/api/vault/configuration/{config_id}")
async def api_save_vault_configuration(config_id: str, request: Request) -> dict[str, Any]:
    """Save a vault configuration."""

    try:
        vault_config = await request.json()

        # Validate configuration
        validation = validate_vault_configuration(vault_config)
        if not validation["valid"]:
            return {
                "success": False,
                "errors": validation["errors"],
                "warnings": validation["warnings"],
            }

        # Save configuration
        success = save_vault_configuration(config_id, vault_config)

        if success:
            # Log the vault configuration creation
            append_ui_event_log(
                {
                    "event": "vault_configuration_saved",
                    "label": "Global",
                    "config_id": config_id,
                    "timestamp": datetime.now(UTC).isoformat(),
                    "user_action": True,
                    "status_message": f"Vault configuration '{config_id}' saved successfully",
                    "message": f"Vault configuration '{config_id}' saved successfully",
                }
            )
            return {"success": True, "warnings": validation["warnings"]}

    except Exception as e:
        _logger.error("[VaultConfigAPI] Error saving configuration '%s': %s", config_id, e)
        raise HTTPException(status_code=500, detail=str(e)) from e
    else:
        return {"success": False, "errors": ["Failed to save vault configuration"]}


@app.delete("/api/vault/configuration/{config_id}")
def api_delete_vault_configuration(config_id: str) -> dict[str, Any]:
    """Delete a vault configuration."""

    try:
        success = delete_vault_configuration(config_id)
        if success:
            return {"success": True}
        raise HTTPException(status_code=404, detail=f"Vault configuration '{config_id}' not found")
    except Exception as e:
        _logger.error("[VaultConfigAPI] Error deleting configuration '%s': %s", config_id, e)
        raise HTTPException(status_code=500, detail=str(e)) from e


@app.get("/api/vault/configuration/{config_id}/default")
def api_get_default_vault_configuration(config_id: str) -> dict[str, Any]:
    """Get default vault configuration structure."""

    try:
        default_config = get_default_vault_configuration()

    except Exception as e:
        _logger.error("[VaultConfigAPI] Error getting default configuration: %s", e)
        raise HTTPException(status_code=500, detail=str(e)) from e
    else:
        return default_config


@app.post("/api/vault/configuration/{config_id}/validate")
async def api_validate_vault_configuration(config_id: str, request: Request) -> dict[str, Any]:
    """Validate vault configuration and test vault access."""

    try:
        vault_config = await request.json()

        # Basic configuration validation
        validation = validate_vault_configuration(vault_config)
        if not validation["valid"]:
            return {
                "config_valid": False,
                "vault_accessible": False,
                "errors": validation["errors"],
                "warnings": validation["warnings"],
            }

        # Test vault access if we have valid configuration
        browser_mam_id = vault_config.get("browser_mam_id", "").strip()
        effective_uid = get_effective_uid(vault_config)
        effective_proxy = get_effective_proxy_config(vault_config)
        connection_method = vault_config.get("connection_method", "auto")

        if browser_mam_id and effective_uid:
            # Extract just the mam_id value from the browser cookie string

            extracted_mam_id = await extract_mam_id_from_browser_cookies(browser_mam_id)

            if not extracted_mam_id:
                return {
                    "config_valid": True,
                    "vault_accessible": False,
                    "errors": ["Could not extract mam_id from browser cookie string"],
                    "warnings": validation["warnings"],
                }

            # Test vault access
            vault_result = await validate_browser_mam_id_with_config(
                browser_mam_id=browser_mam_id,  # Pass the full browser cookie string with browser type
                uid=effective_uid,
                proxy_cfg=effective_proxy,
                connection_method=connection_method,
            )

            # Log the validation attempt
            append_ui_event_log(
                {
                    "timestamp": datetime.now(UTC).isoformat(),
                    "event_type": "vault_validation_test",
                    "label": "Global",
                    "config_id": config_id,
                    "uid": effective_uid,
                    "status": "success" if vault_result["valid"] else "failed",
                    "status_message": f"Vault access test for '{config_id}': {'successful' if vault_result['valid'] else 'failed'}",
                    "message": f"Vault access test: {'successful' if vault_result['valid'] else 'failed'}",
                }
            )

            _logger.info(
                "[VaultValidation] Test vault access for config '%s' (UID: %s): %s",
                config_id,
                effective_uid,
                "SUCCESS" if vault_result["valid"] else "FAILED",
            )

            return {
                "config_valid": True,
                "vault_accessible": vault_result["valid"],
                "vault_result": vault_result,
                "effective_uid": effective_uid,
                "effective_proxy": effective_proxy.get("label") if effective_proxy else None,
                "warnings": validation["warnings"],
            }
        return {
            "config_valid": True,
            "vault_accessible": False,
            "errors": ["Cannot test vault access - missing browser MAM ID or effective UID"],
            "warnings": validation["warnings"],
        }

    except Exception as e:
        _logger.error("[VaultConfigAPI] Error validating configuration '%s': %s", config_id, e)
        raise HTTPException(status_code=500, detail=str(e)) from e


@app.post("/api/vault/configuration/{config_id}/donate")
async def api_vault_configuration_donate(config_id: str, request: Request) -> dict[str, Any]:
    """Manual vault donation using configuration."""

    try:
        request_data = await request.json()
        amount = request_data.get("amount", 100)
        inline_config = request_data.get("config")  # For unsaved configurations

        if not isinstance(amount, int) or amount < 100 or amount > 2000 or amount % 100 != 0:
            raise HTTPException(
                status_code=400,
                detail="Invalid donation amount. Must be 100-2000 points in increments of 100.",
            )

        # Use inline config if provided (for unsaved configs), otherwise load from disk
        if inline_config:
            vault_config = inline_config
            _logger.info(
                "[VaultDonation] Using inline config for unsaved configuration '%s'",
                config_id,
            )
        else:
            vault_config = get_vault_configuration(config_id)
            if not vault_config:
                raise HTTPException(
                    status_code=404, detail=f"Vault configuration '{config_id}' not found"
                )

        browser_mam_id = vault_config.get("browser_mam_id", "").strip()
        if not browser_mam_id:
            raise HTTPException(status_code=400, detail="Browser MAM ID not configured")

        effective_uid = get_effective_uid(vault_config)
        if not effective_uid:
            raise HTTPException(status_code=400, detail="No effective UID available")

        effective_proxy = get_effective_proxy_config(vault_config)
        connection_method = vault_config.get("connection_method", "auto")

        # Validate browser access before donation (using full browser_mam_id with browser type)
        await validate_browser_mam_id_with_config(
            browser_mam_id=browser_mam_id,  # Pass the full browser cookie string with browser type
            uid=effective_uid,
            proxy_cfg=effective_proxy,
            connection_method=connection_method,
        )

        # Perform actual vault donation

        # Get associated session info for verification
        session_mam_id = None
        if vault_config.get("associated_session_label"):
            try:
                session_config = load_session(vault_config["associated_session_label"])
                session_mam_id = session_config.get("mam", {}).get("mam_id")
            except Exception as e:
                _logger.warning(
                    "[VaultDonation] Could not load associated session for verification: %s",
                    e,
                )

        donation_result = await perform_vault_donation(
            browser_mam_id=browser_mam_id,  # Pass the full browser cookie string with browser type
            uid=effective_uid,
            amount=amount,
            proxy_cfg=effective_proxy,
            connection_method=connection_method,
            verification_mam_id=session_mam_id,  # Pass session mam_id for verification
        )

        if donation_result.get("success"):
            # Update pot tracking for manual donation
            try:
                # Use a generic pot ID for manual donations (we don't track the actual pot ID for manual)
                pot_id = f"manual_{int(time.time())}"
                update_pot_tracking(
                    config_id,
                    pot_id,
                    donation_result.get("amount_donated", amount),
                    "manual",  # This is a manual donation
                )
                _logger.info(
                    "[VaultDonation] Updated pot tracking for manual donation: %s points",
                    donation_result.get("amount_donated", amount),
                )
            except Exception as e:
                _logger.warning("[VaultDonation] Failed to update pot tracking: %s", e)

            # Log the successful manual donation
            append_ui_event_log(
                {
                    "timestamp": datetime.now(UTC).isoformat(),
                    "event_type": "vault_donation_manual",
                    "label": "Global",
                    "config_id": config_id,
                    "amount": donation_result.get("amount_donated", amount),
                    "uid": effective_uid,
                    "points_before": donation_result.get("points_before"),
                    "points_after": donation_result.get("points_after"),
                    "status_message": f"Manual vault donation: {donation_result.get('amount_donated', amount)} points donated for '{config_id}'",
                    "access_method": donation_result.get("access_method"),
                    "status": "success",
                    "message": f"Manual vault donation successful: {donation_result.get('amount_donated', amount)} points",
                }
            )

            # Send success notification
            try:
                await notify_event(
                    event_type="vault_donation_success",
                    label=config_id,
                    status="SUCCESS",
                    message=f"Successfully donated {donation_result.get('amount_donated', amount)} points to the vault",
                    details={
                        "config_id": config_id,
                        "amount_donated": donation_result.get("amount_donated", amount),
                        "points_before": donation_result.get("points_before"),
                        "points_after": donation_result.get("points_after"),
                        "access_method": donation_result.get("access_method"),
                    },
                )
            except Exception as e:
                _logger.warning("[VaultDonation] Failed to send success notification: %s", e)

            _logger.info(
                "[VaultDonation] Manual donation successful for config '%s': %s points (UID: %s)",
                config_id,
                donation_result.get("amount_donated", amount),
                effective_uid,
            )

            # Return unified result with points data
            return {
                "success": True,
                "message": f"Successfully donated {donation_result.get('amount_donated', amount)} points",
                "amount_donated": donation_result.get("amount_donated", amount),
                "points_before": donation_result.get("points_before"),
                "points_after": donation_result.get("points_after"),
                "vault_total_points": donation_result.get("vault_total_points"),
                "access_method": donation_result.get("access_method"),
                "verification_method": donation_result.get("verification_method"),
            }
        # Log the failed donation

        append_ui_event_log(
            {
                "timestamp": datetime.now(UTC).isoformat(),
                "event_type": "vault_donation_manual",
                "label": "Global",
                "config_id": config_id,
                "amount": amount,
                "uid": effective_uid,
                "status": "failed",
                "status_message": f"Manual vault donation failed for '{config_id}': {donation_result.get('error', 'Unknown error')}",
                "error": donation_result.get("error", "Unknown error"),
            }
        )

        # Send failure notification
        try:
            await notify_event(
                event_type="vault_donation_failure",
                label=config_id,
                status="FAILED",
                message=f"Vault donation failed: {donation_result.get('error', 'Unknown error')}",
                details={
                    "config_id": config_id,
                    "amount": amount,
                    "error": donation_result.get("error", "Unknown error"),
                },
            )
        except Exception as e:
            _logger.warning("[VaultDonation] Failed to send failure notification: %s", e)

        _logger.error(
            "[VaultDonation] Manual donation failed for config '%s': %s",
            config_id,
            donation_result.get("error"),
        )

        return {"success": False, "errors": [donation_result.get("error", "Donation failed")]}

    except HTTPException:
        raise
    except Exception as e:
        _logger.error("[VaultConfigAPI] Error during manual donation for '%s': %s", config_id, e)
        raise HTTPException(status_code=500, detail=str(e)) from e


@app.post("/api/vault/configuration/{config_id}/rename")
async def api_vault_configuration_rename(config_id: str, request: Request) -> dict[str, Any]:
    """Rename a vault configuration."""

    try:
        request_data = await request.json()
        new_name = request_data.get("new_name", "").strip()

        if not new_name:
            raise HTTPException(status_code=400, detail="New configuration name is required")

        if new_name == config_id:
            return {"success": True, "message": "No change needed"}

        # Check if new name already exists
        existing_config = get_vault_configuration(new_name)
        if existing_config:
            raise HTTPException(
                status_code=400, detail=f"Configuration '{new_name}' already exists"
            )

        # Get the current configuration
        vault_config = get_vault_configuration(config_id)
        if not vault_config:
            raise HTTPException(
                status_code=404, detail=f"Vault configuration '{config_id}' not found"
            )

        # Save with new name and delete old one
        success = save_vault_configuration(new_name, vault_config)
        if success:
            delete_vault_configuration(config_id)

            # Log the rename event
            append_ui_event_log(
                {
                    "event": "vault_configuration_renamed",
                    "old_config_id": config_id,
                    "new_config_id": new_name,
                    "timestamp": datetime.now(UTC).isoformat(),
                    "user_action": True,
                    "message": f"Vault configuration renamed from '{config_id}' to '{new_name}'",
                }
            )

            return {"success": True, "message": f"Configuration renamed to '{new_name}'"}
        raise HTTPException(status_code=500, detail="Failed to rename configuration")

    except HTTPException:
        raise
    except Exception as e:
        _logger.error("[VaultConfigAPI] Error renaming configuration '%s': %s", config_id, e)
        raise HTTPException(status_code=500, detail=str(e)) from e


@app.post("/api/vault/points")
async def api_vault_get_points(request: Request) -> dict[str, Any]:
    """Get current points for vault configuration using session-based approach."""
    try:
        data = await request.json()
        config_id = data.get("config_id", "").strip()

        _logger.debug("[VaultPoints] Request for config_id: '%s'", config_id)

        if not config_id:
            _logger.warning("[VaultPoints] Config ID is required but not provided")
            raise HTTPException(status_code=400, detail="Config ID is required")

        # Load vault configuration
        vault_config = load_vault_config()
        config = vault_config.get("vault_configurations", {}).get(config_id)

        _logger.debug("[VaultPoints] Processing request for config '%s'", config_id)

        if not config:
            _logger.warning("[VaultPoints] Vault configuration '%s' not found", config_id)
            raise HTTPException(
                status_code=404, detail=f"Vault configuration '{config_id}' not found"
            )

        # Get associated session label
        session_label = config.get("associated_session_label", "").strip()
        if not session_label:
            _logger.warning(
                "[VaultPoints] No associated session configured for vault config '%s'", config_id
            )
            raise HTTPException(
                status_code=400,
                detail="No associated session configured for this vault configuration",
            )

        # Load session configuration to get current mam_id

        try:
            session_config = load_session(session_label)
        except Exception as e:
            _logger.error("[VaultPoints] Failed to load session '%s': %s", session_label, e)
            raise HTTPException(
                status_code=404,
                detail=f"Session '{session_label}' not found or could not be loaded",
            ) from e

        # Get mam_id from session
        mam_id = session_config.get("mam", {}).get("mam_id", "").strip()
        if not mam_id:
            _logger.warning("[VaultPoints] Session '%s' has no mam_id configured", session_label)
            raise HTTPException(
                status_code=400, detail=f"Session '{session_label}' has no mam_id configured"
            )

        # Get proxy configuration from vault config
        proxy_cfg = get_effective_proxy_config(config)

        # Use the existing get_status function to fetch points
        status_result = await get_status(mam_id=mam_id, proxy_cfg=proxy_cfg)

        points = status_result.get("points")
        if points is not None:
            # Scrape cheese and wedges from browser MAM ID (not session mam_id)
            # Cheese/wedges are tied to the browser account, not seedbox
            browser_mam_id_raw = config.get("browser_mam_id", "").strip()
            cheese = None
            wedges = None

            if browser_mam_id_raw:
                # Parse browser_mam_id and uid from the cookie string
                browser_mam_id_match = re.search(r"mam_id=([^;]+)", browser_mam_id_raw)
                browser_uid_match = re.search(r"uid=([^;]+)", browser_mam_id_raw)

                if browser_mam_id_match and browser_uid_match:
                    browser_mam_id = browser_mam_id_match.group(1).strip()
                    browser_uid = browser_uid_match.group(1).strip()

                    # Use browser proxy if configured, otherwise use vault proxy
                    # Browser connections may use different proxy than seedbox
                    browser_proxy_cfg = get_effective_proxy_config(config)

                    # Scrape cheese and wedges from MAM page using browser credentials
                    cheese_wedges_result = await get_cheese_and_wedges(
                        mam_id=browser_mam_id, uid=browser_uid, proxy_cfg=browser_proxy_cfg
                    )

                    cheese = cheese_wedges_result.get("cheese")
                    wedges = cheese_wedges_result.get("wedges")

                    if not cheese_wedges_result.get("success"):
                        _logger.warning(
                            "[VaultPoints] Failed to scrape cheese/wedges: %s",
                            cheese_wedges_result.get("error"),
                        )
                else:
                    _logger.warning(
                        "[VaultPoints] Could not parse mam_id and uid from browser_mam_id"
                    )
            else:
                _logger.warning(
                    "[VaultPoints] No browser MAM ID available for cheese/wedges scraping"
                )

            _logger.info(
                "[VaultPoints] Successfully fetched points for config '%s' via session '%s': %s (Cheese: %s, Wedges: %s)",
                config_id,
                session_label,
                points,
                cheese,
                wedges,
            )
            return {
                "success": True,
                "points": points,
                "cheese": cheese,
                "wedges": wedges,
            }
        error_msg = status_result.get("message", "Unable to fetch points")
        _logger.warning(
            "[VaultPoints] Failed to fetch points for config '%s' via session '%s': %s",
            config_id,
            session_label,
            error_msg,
        )

    except HTTPException:
        raise
    except Exception as e:
        _logger.error("[VaultPoints] Error fetching points: %s", e)
        raise HTTPException(status_code=500, detail=str(e)) from e
    else:
        return {"success": False, "error": error_msg}


@app.get("/favicon.ico", include_in_schema=False)
def favicon_ico() -> FileResponse:
    """Serve the glyphicon favicon.ico from the frontend public directory.

    Returns a FileResponse when the file exists, otherwise raises 404.
    """
    # Try Docker-friendly public dir first, then local repo frontend/public
    candidates = [
        Path(FRONTEND_PUBLIC_DIR) / "favicon.ico",
        Path(BASE_DIR) / "../frontend/public/favicon.ico",
    ]
    for path in candidates:
        if path.exists():
            return FileResponse(str(path), media_type="image/x-icon")
    raise HTTPException(status_code=404, detail="favicon.ico not found")


@app.get("/favicon.svg", include_in_schema=False)
def favicon_svg() -> FileResponse:
    """Serve the favicon.svg from the frontend public directory.

    Returns a FileResponse when the file exists, otherwise raises 404.
    """
    candidates = [
        Path(FRONTEND_PUBLIC_DIR) / "favicon.svg",
        Path(BASE_DIR) / "../frontend/public/favicon.svg",
    ]
    for path in candidates:
        if path.exists():
            return FileResponse(str(path), media_type="image/svg+xml")
    raise HTTPException(status_code=404, detail="favicon.svg not found")


@app.get("/", include_in_schema=False)
def serve_react_index() -> FileResponse:
    """Serve the React app index.html for the root path.

    This endpoint is used by the frontend catch-all route.
    """
    index_path = Path(FRONTEND_BUILD_DIR) / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path))
    raise HTTPException(status_code=404, detail="Frontend index.html not found")


@app.get("/{full_path:path}", include_in_schema=False)
def serve_react_app(full_path: str) -> FileResponse:
    """Serve the React app for all frontend paths (catch-all).

    If the build index.html exists, it is returned. Otherwise a 404 is raised.
    """
    index_path = Path(FRONTEND_BUILD_DIR) / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path))
    raise HTTPException(status_code=404, detail="Not Found")


async def session_check_job(label: str) -> None:
    """Scheduled job that checks a single session's MaM status and logs events.

    This function is intended to be registered with APScheduler. It performs
    status detection, optional auto-update attempts, persists last_status and
    last_check_time, and appends UI event log entries.
    """
    try:
        trigger_source = "scheduled"

        frame = inspect.currentframe()
        if frame is not None:
            args, _, _, values = inspect.getargvalues(frame)
            if "trigger_source" in values:
                trigger_source = values["trigger_source"]
        _logger.info("[SessionCheck] label=%s source=%s", label, trigger_source)
        cfg = load_session(label)
        mam_id = cfg.get("mam", {}).get("mam_id", "")
        mam_ip_override = cfg.get("mam_ip", "").strip()
        proxy_cfg = resolve_proxy_from_session_cfg(cfg)
        # Single API call for IP detection (optimization)
        detected_ipinfo_data = await get_ipinfo_with_fallback()
        detected_public_ip = detected_ipinfo_data.get("ip")
        # If proxy is configured, actively detect proxied public IP and update config
        if proxy_cfg and proxy_cfg.get("host"):
            proxied_ip: str | None = await get_proxied_public_ip(proxy_cfg)
            if proxied_ip:
                cfg["proxied_public_ip"] = proxied_ip
                save_session(cfg, old_label=label)
        # Use mam_ip_override if set, else proxied_public_ip if set, else detected_public_ip
        ip_to_use: str | None = (
            mam_ip_override or cfg.get("proxied_public_ip") or detected_public_ip
        )
        # Get ASN for IP sent to MaM (current_ip)
        if ip_to_use:
            asn_full, _ = await get_asn_and_timezone_from_ip(
                ip_to_use,
                proxy_cfg
                if (
                    proxy_cfg
                    and proxy_cfg.get("host")
                    and ip_to_use == cfg.get("proxied_public_ip")
                )
                else None,
            )
            match = re.search(r"(AS)?(\d+)", asn_full or "")
            asn = match.group(2) if match else asn_full
        else:
            asn = None
        now = datetime.now(UTC)
        if mam_id:
            proxy_cfg = resolve_proxy_from_session_cfg(cfg)
            # Capture old IP/ASN before update
            prev_ip = cfg.get("last_seedbox_ip")
            prev_asn = cfg.get("last_seedbox_asn")
            # Determine new IP/ASN (reuse detected data - optimization)
            proxied_ip = cfg.get("proxied_public_ip")
            mam_ip_override = cfg.get("mam_ip", "").strip()
            new_ip = proxied_ip or detected_public_ip  # Reuse data from earlier
            asn_full, _ = await get_asn_and_timezone_from_ip(new_ip) if new_ip else (None, None)
            match = re.search(r"(AS)?(\d+)", asn_full or "") if asn_full else None
            new_asn = match.group(2) if match else asn_full
            status = await get_status(mam_id=mam_id, proxy_cfg=proxy_cfg)
            session_status_cache[label] = {"status": status, "last_check_time": now.isoformat()}
            cfg["last_check_time"] = now.isoformat()
            # Check for increments in hit & run and unsatisfied counts before auto-update logic
            await check_and_notify_count_increments(cfg, status, label)
            # Auto-update logic
            auto_update_triggered, auto_update_result = await auto_update_seedbox_if_needed(
                cfg, label, ip_to_use, asn, now
            )
            if auto_update_result is not None:
                status["auto_update_seedbox"] = auto_update_result
                # Log the result of the update attempt for visibility
                if auto_update_result.get("success"):
                    _logger.info(
                        "[AutoUpdate] label=%s update result: %s reason=%s",
                        label,
                        auto_update_result.get("msg", "Success"),
                        auto_update_result.get("reason"),
                    )
                else:
                    _logger.info(
                        "[AutoUpdate] label=%s update result: %s reason=%s",
                        label,
                        auto_update_result.get("error", "Error"),
                        auto_update_result.get("reason"),
                    )
            else:
                status["auto_update_seedbox"] = "N/A"
            # Always update last_status with the latest automation result
            status["status_message"] = build_status_message(status)
            cfg["last_status"] = status
            save_session(cfg, old_label=label)
            # Log event using pre-update (old) and detected/proxied (new) values
            # Ensure auto_update is always a string, never None/null in JSON
            auto_update_val = get_auto_update_val(status)
            # ...removed debug _logger...
            # If we are rate-limited, log a specific message instead of a generic warning
            rate_limit_result = status.get("auto_update_seedbox")
            is_rate_limited = False
            msg = None
            if isinstance(rate_limit_result, dict):
                err = rate_limit_result.get("error", "").lower()
                if "rate limit" in err or "try again in" in err:
                    is_rate_limited = True
                    msg = (
                        rate_limit_result.get("error")
                        or "Rate limited, waiting to update IP/ASN in config."
                    )
            if is_rate_limited:
                event = {
                    "timestamp": now.isoformat(),
                    "label": label,
                    "event_type": "scheduled",
                    "details": {
                        "ip_compare": f"{prev_ip} -> {new_ip}",
                        "asn_compare": f"{prev_asn} -> {new_asn}",
                        "auto_update": auto_update_val,
                    },
                    "status_message": msg or "Rate limited, waiting to update IP/ASN in config.",
                }
                append_ui_event_log(event)
                _logger.info("[SessionCheck][INFO] label=%s %s", label, msg)
            elif prev_ip is None or prev_asn is None or new_ip is None or new_asn is None:
                warn_msg = "Unable to determine current or new IP/ASN—check connectivity or configuration. No update performed."
                event = {
                    "timestamp": now.isoformat(),
                    "label": label,
                    "event_type": "scheduled",
                    "details": {
                        "ip_compare": f"{prev_ip} -> {new_ip}",
                        "asn_compare": f"{prev_asn} -> {new_asn}",
                        "auto_update": auto_update_val,
                    },
                    "status_message": warn_msg,
                }
                append_ui_event_log(event)
                _logger.warning("[SessionCheck][WARNING] label=%s %s", label, warn_msg)
            else:
                event = {
                    "timestamp": now.isoformat(),
                    "label": label,
                    "event_type": "scheduled",
                    "details": {
                        "ip_compare": f"{prev_ip} -> {new_ip}",
                        "asn_compare": f"{prev_asn} -> {new_asn}",
                        "auto_update": auto_update_val,  # Always a string
                    },
                    "status_message": status.get("status_message", status.get("message", "OK")),
                }
                append_ui_event_log(event)
                # ...removed debug _logger...
    except Exception as e:
        _logger.error("[APScheduler] Error in job for '%s': %s", label, e)


def sync_session_check_job(label: str) -> None:
    """Sync wrapper for async session_check_job to work with BackgroundScheduler."""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        loop.run_until_complete(session_check_job(label))
    finally:
        loop.close()


def sync_automation_jobs() -> None:
    """Sync wrapper for async run_all_automation_jobs to work with BackgroundScheduler."""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        loop.run_until_complete(run_all_automation_jobs())
    finally:
        loop.close()


# On startup, reset last_check_time to now for all sessions to keep timers in sync
def reset_all_last_check_times() -> None:
    """Reset the `last_check_time` for all sessions to the current time.

    This is called on startup to align scheduled timers and prevent immediate
    rate-limit collisions after restart.
    """
    now = datetime.now(UTC).isoformat()
    session_labels = list_sessions()
    for label in session_labels:
        try:
            cfg = load_session(label)
            cfg["last_check_time"] = now
            save_session(cfg, old_label=label)
        except Exception as e:
            _logger.warning(
                "[Startup] Failed to reset last_check_time for session '%s': %s", label, e
            )


# Register jobs for all sessions on startup
def register_session_job(label: str) -> None:
    """Register APScheduler job for a single session.

    Args:
        label: The session label to register a job for
    """
    cfg = load_session(label)
    check_freq = cfg.get("check_freq")
    mam_id = cfg.get("mam", {}).get("mam_id", "")

    # Only register if frequency is set and valid, and MaM ID is present
    if not check_freq or not isinstance(check_freq, int) or check_freq < 1 or not mam_id:
        _logger.info(
            "[APScheduler] Skipping job registration for session '%s' (missing or invalid input)",
            label,
        )
        return

    job_id = f"session_check_{label}"
    # Remove any existing job for this label
    if scheduler.get_job(job_id):
        scheduler.remove_job(job_id)

    scheduler.add_job(
        sync_session_check_job,
        trigger=IntervalTrigger(minutes=check_freq),
        args=[label],
        id=job_id,
        replace_existing=True,
        coalesce=True,
        max_instances=1,
    )
    _logger.info(
        "[APScheduler] Registered job for session '%s' every %s min",
        label,
        check_freq,
    )


def register_all_session_jobs() -> None:
    """Register APScheduler jobs for all sessions with valid settings.

    For each saved session this creates a job that runs `session_check_job`
    at the configured `check_freq` interval if the session has a MaM ID and
    a valid integer frequency.
    """
    session_labels = list_sessions()
    for label in session_labels:
        register_session_job(label)


# Immediate session check for all sessions at startup
async def run_initial_session_checks() -> None:
    """Run an immediate check for all sessions at startup.

    Adds a small delay between checks to help avoid triggering external rate
    limits during application startup.
    """
    session_labels = list_sessions()
    for i, label in enumerate(session_labels):
        try:
            # Add a small delay between session checks to prevent rate limiting
            if i > 0:
                await asyncio.sleep(2)
            _logger.info("[Startup] Running initial session check for '%s'", label)
            await session_check_job(label)
        except Exception as e:
            _logger.warning("[Startup] Initial session check failed for '%s': %s", label, e)
