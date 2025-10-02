"""API routes for port monitoring management.

Provides endpoints to list Docker containers, and to create, update,
delete, recheck and restart port monitoring stacks. Events are emitted to
the UI event log for important actions.
"""

import asyncio
from datetime import UTC, datetime
import logging
import threading
import time
from typing import Any

from fastapi import APIRouter, Body, HTTPException, Query
from pydantic import BaseModel, Field

from backend.event_log import append_ui_event_log
from backend.port_monitor import port_monitor_manager

_logger: logging.Logger = logging.getLogger(__name__)
_CONTAINER_WARN_INTERVAL = 60
_last_container_warn = 0.0
router = APIRouter()


# List Docker containers endpoint
@router.get("/containers", response_model=list[str])
def list_containers() -> list[str]:
    """Returns a list of running Docker container names."""
    client = port_monitor_manager.get_docker_client()
    if not client:
        # Docker client unavailable (SDK missing or unable to connect)
        # Return an empty list for graceful degradation in environments
        # where Docker is not present (e.g., dev without docker socket).
        global _last_container_warn  # noqa: PLW0603
        now = time.monotonic()
        if now - _last_container_warn >= _CONTAINER_WARN_INTERVAL:
            _logger.warning(
                "[PortMonitorAPI] Docker client not available when listing containers; returning empty list"
            )
            _last_container_warn = now
        return []
    try:
        containers = client.containers.list()
        return [c.name for c in containers]
    except Exception as e:
        _logger.exception("[PortMonitorAPI] Error listing containers")
        raise HTTPException(status_code=500, detail=f"Error listing containers: {e}") from e


class UpdatePortMonitorStackRequest(BaseModel):
    """Request schema for updating an existing port monitor stack.

    Fields correspond to the saved stack configuration used by the
    port monitor manager.
    """

    primary_container: str
    primary_port: int
    secondary_containers: list[str] = []
    interval: int = 60
    public_ip: str | None = None


@router.put("/stacks", response_model=dict)
def update_stack(
    name: str = Query(..., description="Stack name"), req: UpdatePortMonitorStackRequest = Body(...)
) -> dict[str, Any]:
    """Update fields for a named port monitor stack and trigger a recheck.

    The endpoint updates stack configuration, persists it, and triggers an
    immediate status recheck. Returns a success dict or raises HTTP errors
    for invalid stack names.
    """

    stack = port_monitor_manager.get_stack(name)
    _logger.info("[PortMonitorStackAPI] Update requested for stack '%s'", name)
    if not stack:
        raise HTTPException(status_code=404, detail="Stack not found")
    # Only log if something actually changed
    changed = (
        stack.primary_container != req.primary_container
        or stack.primary_port != req.primary_port
        or stack.secondary_containers != req.secondary_containers
        or stack.interval != req.interval
    )
    old_values = {
        "primary_container": stack.primary_container,
        "primary_port": stack.primary_port,
        "secondary_containers": stack.secondary_containers,
        "interval": stack.interval,
    }
    stack.primary_container = req.primary_container
    stack.primary_port = req.primary_port
    stack.secondary_containers = req.secondary_containers
    stack.interval = req.interval
    stack.public_ip = req.public_ip
    port_monitor_manager.save_stacks()
    # Immediately recheck status after edit
    port_monitor_manager.recheck_stack(name)
    if changed:
        append_ui_event_log(
            {
                "event": "port_monitor_edit",
                "event_type": "port_monitor_edit",
                "label": name,
                "stack": name,
                "timestamp": datetime.now(UTC).isoformat(),
                "status_message": f"Stack '{name}' edited: primary={req.primary_container}:{req.primary_port}, secondaries={req.secondary_containers}, interval={req.interval} minutes.",
                "details": {
                    "old": old_values,
                    "new": {
                        "primary_container": req.primary_container,
                        "primary_port": req.primary_port,
                        "secondary_containers": req.secondary_containers,
                        "interval": req.interval,
                    },
                },
                "message": f"Stack '{name}' edited",
                "level": "info",
            }
        )
    return {"success": True}


class PortMonitorStackModel(BaseModel):
    """Response model representing the runtime and configuration state of a stack."""

    name: str = Field(..., description="Stack name")
    primary_container: str = Field(..., description="Primary container name")
    primary_port: int = Field(..., ge=1, le=65535, description="Primary container port")
    secondary_containers: list[str] = Field([], description="Secondary containers")
    interval: int = Field(60, description="Check interval in minutes")
    status: str = Field(..., description="Current status")
    last_checked: float | None = Field(None, description="Last checked timestamp (epoch)")
    last_result: bool | None = Field(None, description="Last check result (True=OK, False=Failed)")
    public_ip: str | None = Field(
        None, description="Manual public IP override for this stack, if set."
    )
    public_ip_detected: bool | None = Field(
        None, description="Was a public IP detected for this stack's primary container?"
    )


class AddPortMonitorStackRequest(BaseModel):
    """Request schema for creating a new port monitor stack."""

    name: str
    primary_container: str
    primary_port: int
    secondary_containers: list[str] = []
    interval: int = 60
    public_ip: str | None = None


# Add update model and endpoint after router definition


@router.get("/stacks", response_model=list[PortMonitorStackModel])
def list_stacks() -> list[PortMonitorStackModel]:
    """Return the configured port monitor stacks in the API response model."""

    return [
        PortMonitorStackModel(
            name=s.name,
            primary_container=s.primary_container,
            primary_port=s.primary_port,
            secondary_containers=s.secondary_containers,
            interval=getattr(s, "interval", 60),
            status=s.status,
            last_checked=s.last_checked,
            last_result=s.last_result,
            public_ip=getattr(s, "public_ip", None),
            public_ip_detected=getattr(s, "public_ip_detected", None),
        )
        for s in port_monitor_manager.list_stacks()
    ]


@router.post("/stacks", response_model=dict)
def add_stack(req: AddPortMonitorStackRequest) -> dict[str, Any]:
    """Create a new port monitor stack and emit a UI event about it."""

    port_monitor_manager.add_stack(
        req.name,
        req.primary_container,
        req.primary_port,
        req.secondary_containers,
        req.interval,
        req.public_ip,
    )

    append_ui_event_log(
        {
            "event": "port_monitor_created",
            "event_type": "port_monitor_create",
            "label": req.name,
            "stack": req.name,
            "timestamp": datetime.now(UTC).isoformat(),
            "status_message": f"Stack '{req.name}' created: primary={req.primary_container}:{req.primary_port}, secondaries={req.secondary_containers}, interval={req.interval} minutes.",
            "details": {
                "primary_container": req.primary_container,
                "primary_port": req.primary_port,
                "secondary_containers": req.secondary_containers,
                "interval": req.interval,
            },
            "message": f"Stack '{req.name}' created.",
            "level": "info",
        }
    )
    return {"success": True}


@router.post("/stacks/recheck", response_model=dict)
def recheck_stack(name: str = Query(..., description="Stack name")) -> dict[str, Any]:
    """Trigger an immediate recheck of the named stack.

    Returns success if the stack exists and was rechecked; otherwise raises
    HTTP 404.
    """

    ok = port_monitor_manager.recheck_stack(name)
    if not ok:
        raise HTTPException(status_code=404, detail="Stack not found")
    return {"success": True}


@router.delete("/stacks", response_model=dict)
def delete_stack(name: str = Query(..., description="Stack name")) -> dict[str, Any]:
    """Remove a configured stack by name and emit a UI event about deletion."""

    port_monitor_manager.remove_stack(name)
    append_ui_event_log(
        {
            "event": "port_monitor_deleted",
            "event_type": "port_monitor_delete",
            "label": name,
            "stack": name,
            "timestamp": datetime.now(UTC).isoformat(),
            "status_message": f"Stack '{name}' deleted.",
            "details": {},
            "message": f"Stack '{name}' deleted.",
            "level": "info",
        }
    )
    return {"success": True}


@router.post("/stacks/restart", response_model=dict)
def restart_stack(name: str = Query(..., description="Stack name")) -> dict[str, Any]:
    """Initiate a restart for a stack's primary container in background.

    Marks the stack restarting and runs the restart work in a daemon
    thread so the API call returns immediately.
    """

    stack = port_monitor_manager.get_stack(name)
    if not stack:
        raise HTTPException(status_code=404, detail="Stack not found")
    # Set status to 'Restarting' and save immediately
    stack.status = "Restarting"
    port_monitor_manager.save_stacks()
    _logger.info("[PortMonitorStackAPI] Stack '%s' status set to 'Restarting'", name)
    append_ui_event_log(
        {
            "event": "port_monitor_status",
            "stack": name,
            "status": "Restarting",
            "message": f"Stack '{name}' status set to 'Restarting'",
            "level": "info",
        }
    )

    # Run restart in background
    async def do_restart() -> None:
        """Background worker that performs the restart and subsequent recheck."""
        _logger.info(
            "[PortMonitorStackAPI] Background restart thread started for stack '%s'",
            name,
        )
        append_ui_event_log(
            {
                "event": "port_monitor_restart_started",
                "stack": name,
                "message": f"Background restart thread started for stack '{name}'",
                "level": "info",
            }
        )
        await port_monitor_manager.restart_stack(stack)
        _logger.info(
            "[PortMonitorStackAPI] Restart complete for stack '%s', rechecking status...",
            name,
        )
        append_ui_event_log(
            {
                "event": "port_monitor_restart_complete",
                "stack": name,
                "message": f"Restart complete for stack '{name}', rechecking status...",
                "level": "info",
            }
        )
        port_monitor_manager.recheck_stack(stack.name)
        _logger.info("[PortMonitorStackAPI] Status recheck complete for stack '%s'", name)
        append_ui_event_log(
            {
                "event": "port_monitor_status_rechecked",
                "stack": name,
                "message": f"Status recheck complete for stack '{name}'",
                "level": "info",
            }
        )

    threading.Thread(target=lambda: asyncio.run(do_restart()), daemon=True).start()
    return {"success": True}
