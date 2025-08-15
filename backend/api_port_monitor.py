from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from backend.port_monitor import port_monitor

router = APIRouter()

class PortCheckModel(BaseModel):
    container_name: str = Field(..., description="Docker container name")
    port: int = Field(..., ge=1, le=65535, description="Port to check")
    status: str = Field(..., description="Current status")
    last_checked: Optional[float] = Field(None, description="Last checked timestamp (epoch)")
    last_result: Optional[bool] = Field(None, description="Last check result (True=OK, False=Restarted)")

class AddPortCheckRequest(BaseModel):
    container_name: str = Field(..., description="Docker container name")
    port: int = Field(..., ge=1, le=65535, description="Port to check")

@router.get("/api/port-monitor/containers", response_model=List[str])
def list_running_containers():
    containers = port_monitor.list_running_containers()
    if not port_monitor.get_docker_client() or containers is None:
        raise HTTPException(status_code=500, detail="Docker Engine is not accessible. Please ensure the Docker socket is mounted and permissions are correct.")
    return containers

@router.get("/api/port-monitor/checks", response_model=List[PortCheckModel])
def list_port_checks():
    if not port_monitor.get_docker_client():
        raise HTTPException(status_code=500, detail="Docker Engine is not accessible. Please ensure the Docker socket is mounted and permissions are correct.")
    return [PortCheckModel(
        container_name=c.container_name,
        port=c.port,
        status=c.status,
        last_checked=c.last_checked,
        last_result=c.last_result
    ) for c in port_monitor.checks]

@router.post("/api/port-monitor/checks", response_model=PortCheckModel)
def add_port_check(req: AddPortCheckRequest):
    if not port_monitor.get_docker_client():
        raise HTTPException(status_code=500, detail="Docker Engine is not accessible. Please ensure the Docker socket is mounted and permissions are correct.")
    if req.container_name not in port_monitor.list_running_containers():
        raise HTTPException(status_code=400, detail="Container must be running.")
    port_monitor.add_check(req.container_name, req.port)
    c = next((c for c in port_monitor.checks if c.container_name == req.container_name and c.port == req.port), None)
    if not c:
        raise HTTPException(status_code=500, detail="Failed to add port check.")
    return PortCheckModel(
        container_name=c.container_name,
        port=c.port,
        status=c.status,
        last_checked=c.last_checked,
        last_result=c.last_result
    )

@router.delete("/api/port-monitor/checks", response_model=List[PortCheckModel])
def delete_port_check(container_name: str, port: int):
    if not port_monitor.get_docker_client():
        raise HTTPException(status_code=500, detail="Docker Engine is not accessible. Please ensure the Docker socket is mounted and permissions are correct.")
    port_monitor.remove_check(container_name, port)
    return [PortCheckModel(
        container_name=c.container_name,
        port=c.port,
        status=c.status,
        last_checked=c.last_checked,
        last_result=c.last_result
    ) for c in port_monitor.checks]
