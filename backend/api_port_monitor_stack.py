import logging
from backend.event_log import append_ui_event_log

from fastapi import APIRouter, HTTPException, Query, Body
from pydantic import BaseModel, Field
from typing import List, Optional
from backend.port_monitor_stack import port_monitor_stack_manager

router = APIRouter()

class UpdatePortMonitorStackRequest(BaseModel):
    primary_container: str
    primary_port: int
    secondary_containers: List[str] = []
    interval: int = 60

@router.put("/stacks", response_model=dict)
def update_stack(
    name: str = Query(..., description="Stack name"),
    req: UpdatePortMonitorStackRequest = Body(...)
):
    stack = port_monitor_stack_manager.get_stack(name)
    logging.info(f"[PortMonitorStackAPI] Restart requested for stack '{name}'")
    if not stack:
        raise HTTPException(status_code=404, detail="Stack not found")
    # Only log if something actually changed
    changed = (
        stack.primary_container != req.primary_container or
        stack.primary_port != req.primary_port or
        stack.secondary_containers != req.secondary_containers or
        stack.interval != req.interval
    )
    old_values = {
        'primary_container': stack.primary_container,
        'primary_port': stack.primary_port,
        'secondary_containers': stack.secondary_containers,
        'interval': stack.interval
    }
    stack.primary_container = req.primary_container
    stack.primary_port = req.primary_port
    stack.secondary_containers = req.secondary_containers
    stack.interval = req.interval
    port_monitor_stack_manager.save_stacks()
    # Immediately recheck status after edit
    port_monitor_stack_manager.recheck_stack(name)
    if changed:
        import datetime
        append_ui_event_log({
            'event': 'port_monitor_stack_restart_requested',
            'event_type': 'port_monitor_stack_edit',
            'label': name,
            'stack': name,
            'timestamp': datetime.datetime.utcnow().isoformat() + 'Z',
            'status_message': f"Stack '{name}' edited: primary={req.primary_container}:{req.primary_port}, secondaries={req.secondary_containers}, interval={req.interval} minutes.",
            'details': {
                'old': old_values,
                'new': {
                    'primary_container': req.primary_container,
                    'primary_port': req.primary_port,
                    'secondary_containers': req.secondary_containers,
                    'interval': req.interval
                }
            },
            'message': f"Restart requested for stack '{name}'",
            'level': 'info'
        })
    return {"success": True}

class PortMonitorStackModel(BaseModel):
    name: str = Field(..., description="Stack name")
    primary_container: str = Field(..., description="Primary container name")
    primary_port: int = Field(..., ge=1, le=65535, description="Primary container port")
    secondary_containers: List[str] = Field([], description="Secondary containers")
    interval: int = Field(60, description="Check interval in minutes")
    status: str = Field(..., description="Current status")
    last_checked: Optional[float] = Field(None, description="Last checked timestamp (epoch)")
    last_result: Optional[bool] = Field(None, description="Last check result (True=OK, False=Failed)")

class AddPortMonitorStackRequest(BaseModel):
    name: str
    primary_container: str
    primary_port: int
    secondary_containers: List[str] = []
    interval: int = 60

# Add update model and endpoint after router definition

@router.get("/stacks", response_model=List[PortMonitorStackModel])
def list_stacks():
    return [
        PortMonitorStackModel(
            name=s.name,
            primary_container=s.primary_container,
            primary_port=s.primary_port,
            secondary_containers=s.secondary_containers,
            interval=getattr(s, 'interval', 60),
            status=s.status,
            last_checked=s.last_checked,
            last_result=s.last_result
        ) for s in port_monitor_stack_manager.list_stacks()
    ]

@router.post("/stacks", response_model=dict)
def add_stack(req: AddPortMonitorStackRequest):
    port_monitor_stack_manager.add_stack(
        req.name, req.primary_container, req.primary_port, req.secondary_containers, req.interval
    )
    return {"success": True}
@router.post("/stacks/recheck", response_model=dict)
def recheck_stack(name: str = Query(..., description="Stack name")):
    ok = port_monitor_stack_manager.recheck_stack(name)
    if not ok:
        raise HTTPException(status_code=404, detail="Stack not found")
    return {"success": True}

@router.delete("/stacks", response_model=dict)
def delete_stack(name: str = Query(..., description="Stack name")):
    port_monitor_stack_manager.remove_stack(name)
    return {"success": True}

import threading

@router.post("/stacks/restart", response_model=dict)
def restart_stack(name: str = Query(..., description="Stack name")):
    stack = port_monitor_stack_manager.get_stack(name)
    if not stack:
        raise HTTPException(status_code=404, detail="Stack not found")
    # Set status to 'Restarting' and save immediately
    stack.status = 'Restarting'
    port_monitor_stack_manager.save_stacks()
    logging.info(f"[PortMonitorStackAPI] Stack '{name}' status set to 'Restarting'")
    append_ui_event_log({
        'event': 'port_monitor_stack_status',
        'stack': name,
        'status': 'Restarting',
        'message': f"Stack '{name}' status set to 'Restarting'",
        'level': 'info'
    })
    # Run restart in background
    def do_restart():
        logging.info(f"[PortMonitorStackAPI] Background restart thread started for stack '{name}'")
        append_ui_event_log({
            'event': 'port_monitor_stack_restart_started',
            'stack': name,
            'message': f"Background restart thread started for stack '{name}'",
            'level': 'info'
        })
        port_monitor_stack_manager.restart_stack(stack)
        logging.info(f"[PortMonitorStackAPI] Restart complete for stack '{name}', rechecking status...")
        append_ui_event_log({
            'event': 'port_monitor_stack_restart_complete',
            'stack': name,
            'message': f"Restart complete for stack '{name}', rechecking status...",
            'level': 'info'
        })
        port_monitor_stack_manager.recheck_stack(stack.name)
        logging.info(f"[PortMonitorStackAPI] Status recheck complete for stack '{name}'")
        append_ui_event_log({
            'event': 'port_monitor_stack_status_rechecked',
            'stack': name,
            'message': f"Status recheck complete for stack '{name}'",
            'level': 'info'
        })
    threading.Thread(target=do_restart, daemon=True).start()
    return {"success": True}
