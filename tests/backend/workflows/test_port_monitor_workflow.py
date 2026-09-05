"""Backend workflow coverage for port-monitor stack management."""

from httpx import AsyncClient
import pytest

from backend.port_monitor import port_monitor_manager


@pytest.mark.workflow
async def test_port_monitor_create_edit_recheck_delete(
    api_client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Run the complete stack-management workflow through HTTP."""
    monkeypatch.setattr(port_monitor_manager, "check_port", lambda _container, _port: True)
    created = await api_client.post(
        "/api/port-monitor/stacks",
        json={
            "name": "media",
            "primary_container": "vpn",
            "primary_port": 51413,
            "secondary_containers": ["client"],
            "interval": 5,
        },
    )
    assert created.json() == {"success": True}
    assert (await api_client.get("/api/port-monitor/stacks")).json()[0]["status"] == "OK"

    updated = await api_client.put(
        "/api/port-monitor/stacks?name=media",
        json={
            "primary_container": "vpn-new",
            "primary_port": 51414,
            "secondary_containers": ["client", "arr"],
            "interval": 10,
        },
    )
    assert updated.json() == {"success": True}
    stack = (await api_client.get("/api/port-monitor/stacks")).json()[0]
    assert (stack["primary_container"], stack["primary_port"], stack["interval"]) == (
        "vpn-new",
        51414,
        10,
    )
    overridden = await api_client.put(
        "/api/port-monitor/stacks?name=media",
        json={
            "primary_container": "vpn-new",
            "primary_port": 51414,
            "secondary_containers": ["client", "arr"],
            "interval": 10,
            "public_ip": "203.0.113.7",
        },
    )
    assert overridden.json() == {"success": True}
    assert (await api_client.get("/api/port-monitor/stacks")).json()[0][
        "public_ip"
    ] == "203.0.113.7"

    assert (await api_client.post("/api/port-monitor/stacks/recheck?name=media")).json() == {
        "success": True
    }
    assert (await api_client.delete("/api/port-monitor/stacks?name=media")).json() == {
        "success": True
    }
    assert (await api_client.get("/api/port-monitor/stacks")).json() == []

    events = (await api_client.get("/api/ui_event_log")).json()
    assert [event["event"] for event in events] == [
        "port_monitor_created",
        "port_monitor_edit",
        "port_monitor_edit",
        "port_monitor_deleted",
    ]
    override_details = events[2]["details"]
    assert (override_details["old"]["public_ip"], override_details["new"]["public_ip"]) == (
        None,
        "203.0.113.7",
    )


@pytest.mark.workflow
async def test_recheck_unknown_stack_returns_not_found(api_client: AsyncClient) -> None:
    """Return an observable 404 for a missing stack."""
    response = await api_client.post("/api/port-monitor/stacks/recheck?name=missing")
    assert response.status_code == 404
    assert response.json() == {"detail": "Stack not found"}
