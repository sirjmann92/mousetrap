from fastapi import APIRouter, HTTPException, Request, Body, Query
router = APIRouter()
from pydantic import BaseModel, Field
from typing import List, Optional
from backend.port_monitor import port_monitor



# DELETE endpoint to remove a port check by container_name and port
@router.delete("/checks", response_model=dict)
def delete_port_check(
    container_name: str = Query(..., description="Docker container name"),
    port: int = Query(..., description="Port to check")
):
    if not port_monitor.get_docker_client():
        raise HTTPException(status_code=500, detail="Docker Engine is not accessible. Please ensure the Docker socket is mounted and permissions are correct.")
    found = False
    for c in port_monitor.checks:
        if c.container_name == container_name and c.port == port:
            found = True
            break
    if not found:
        raise HTTPException(status_code=404, detail="Port check not found.")
    import logging
    port_monitor.remove_check(container_name, port)
    logging.info(f"[PortMonitor] Deleted port check: container_name={container_name}, port={port}")
    # Add event log entry (global)
    try:
        from backend.event_log import append_ui_event_log
        import time
        append_ui_event_log({
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "label": "global",
            "event_type": "port_monitor_delete",
            "details": {
                "container": container_name,
                "port": port,
                "scope": "global"
            },
            "status_message": f"Port check deleted for {container_name}:{port}"
        })
    except Exception as e:
        logging.error(f"[PortMonitor] Failed to log port check deletion event: {e}")
    return {"success": True, "container_name": container_name, "port": port}




class PortCheckModel(BaseModel):
    container_name: str = Field(..., description="Docker container name")
    port: int = Field(..., ge=1, le=65535, description="Port to check")
    status: str = Field(..., description="Current status")
    last_checked: Optional[float] = Field(None, description="Last checked timestamp (epoch)")
    last_result: Optional[bool] = Field(None, description="Last check result (True=OK, False=Restarted)")
    ip: Optional[str] = Field(None, description="Last known public IP of the container")
    interval: Optional[int] = Field(None, description="Check interval in minutes")
    restart_on_fail: Optional[bool] = Field(True, description="Restart container on failure")
    notify_on_fail: Optional[bool] = Field(False, description="Notify on failure")

class AddPortCheckRequest(BaseModel):
    container_name: str = Field(..., description="Docker container name")
    port: int = Field(..., ge=1, le=65535, description="Port to check")
    interval: Optional[int] = Field(None, description="Check interval in minutes")
    restart_on_fail: Optional[bool] = Field(True, description="Restart container on failure")
    notify_on_fail: Optional[bool] = Field(False, description="Notify on failure")

# PATCH endpoint to update an existing port check's options
@router.patch("/checks", response_model=PortCheckModel)
def update_port_check(
    container_name: str = Body(...),
    port: int = Body(...),
    restart_on_fail: Optional[bool] = Body(None),
    notify_on_fail: Optional[bool] = Body(None),
    interval: Optional[int] = Body(None)
):
    if not port_monitor.get_docker_client():
        raise HTTPException(status_code=500, detail="Docker Engine is not accessible. Please ensure the Docker socket is mounted and permissions are correct.")
    check = next((c for c in port_monitor.checks if c.container_name == container_name and c.port == port), None)
    if not check:
        raise HTTPException(status_code=404, detail="Port check not found.")
    if restart_on_fail is not None:
        check.restart_on_fail = restart_on_fail
    if notify_on_fail is not None:
        check.notify_on_fail = notify_on_fail
    if interval is not None:
        check.interval = interval * 60
    port_monitor.save_checks()
    return PortCheckModel(
        container_name=check.container_name,
        port=check.port,
        status=check.status,
        last_checked=check.last_checked,
        last_result=check.last_result,
        ip=getattr(check, 'ip', None),
        interval=(check.interval // 60 if check.interval else None),
        restart_on_fail=getattr(check, 'restart_on_fail', True),
        notify_on_fail=getattr(check, 'notify_on_fail', False)
    )

@router.get("/containers", response_model=List[str])
def list_running_containers():
    containers = port_monitor.list_running_containers()
    if not port_monitor.get_docker_client() or containers is None:
        raise HTTPException(status_code=500, detail="Docker Engine is not accessible. Please ensure the Docker socket is mounted and permissions are correct.")
    return containers


@router.post("/checks", response_model=PortCheckModel)
def add_port_check(req: AddPortCheckRequest):
    if not port_monitor.get_docker_client():
        raise HTTPException(status_code=500, detail="Docker Engine is not accessible. Please ensure the Docker socket is mounted and permissions are correct.")
    if req.container_name not in port_monitor.list_running_containers():
        raise HTTPException(status_code=400, detail="Container must be running.")
    interval = req.interval * 60 if req.interval else None
    port_monitor.add_check(
        req.container_name,
        req.port,
        interval=interval,
        restart_on_fail=req.restart_on_fail if req.restart_on_fail is not None else True,
        notify_on_fail=req.notify_on_fail if req.notify_on_fail is not None else False
    )
    c = next((c for c in port_monitor.checks if c.container_name == req.container_name and c.port == req.port), None)
    if not c:
        raise HTTPException(status_code=500, detail="Failed to add port check.")
    return PortCheckModel(
        container_name=c.container_name,
        port=c.port,
        status=c.status,
        last_checked=c.last_checked,
        last_result=c.last_result,
        ip=getattr(c, 'ip', None),
        interval=(c.interval // 60 if c.interval else None),
        restart_on_fail=getattr(c, 'restart_on_fail', True),
        notify_on_fail=getattr(c, 'notify_on_fail', False)
    )

@router.get("/checks", response_model=List[PortCheckModel])
def list_port_checks():
    if not port_monitor.get_docker_client():
        raise HTTPException(status_code=500, detail="Docker Engine is not accessible. Please ensure the Docker socket is mounted and permissions are correct.")
    return [PortCheckModel(
        container_name=c.container_name,
        port=c.port,
        status=c.status,
        last_checked=c.last_checked,
        last_result=c.last_result,
        ip=getattr(c, 'ip', None),
        interval=(c.interval // 60 if c.interval else None),
        restart_on_fail=getattr(c, 'restart_on_fail', True),
        notify_on_fail=getattr(c, 'notify_on_fail', False)
    ) for c in port_monitor.checks]

@router.get("/interval", response_model=int)
def get_port_monitor_interval():
    return port_monitor.interval // 60

@router.post("/interval", response_model=int)
async def set_port_monitor_interval(request: Request):
    data = await request.json()
    minutes = int(data.get("interval", 1))
    if minutes < 1 or minutes > 60:
        raise HTTPException(status_code=400, detail="Interval must be between 1 and 60 minutes.")
    port_monitor.set_interval(minutes * 60)
    return minutes
