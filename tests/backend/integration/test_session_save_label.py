"""Backend integration tests for the session-save label requirement."""

from pathlib import Path

from httpx import AsyncClient
import pytest


@pytest.mark.integration
@pytest.mark.parametrize(
    ("label", "case"),
    [
        (None, "explicit null"),
        ("", "empty string"),
        ("   ", "whitespace only"),
    ],
)
async def test_saving_without_a_usable_label_is_a_client_error(
    api_client: AsyncClient, isolated_backend: Path, label: object, case: str
) -> None:
    """A body with no usable label is refused as a 400 and writes nothing.

    Two distinct defects are covered. A missing label previously reached
    `save_session`, whose `ValueError` the blanket handler reported as a 500 —
    a server error for a plainly malformed request. A whitespace-only label is
    truthy, so it passed that guard entirely and created a session file named
    `session-   .yaml`.
    """
    body: dict[str, object] = {"mam": {"mam_id": "x"}}
    if label is not None or case == "explicit null":
        body["label"] = label

    response = await api_client.post("/api/session/save", json=body)

    assert response.status_code == 400
    assert "label" in response.json()["detail"].lower()
    assert list(isolated_backend.glob("session-*.yaml")) == []


@pytest.mark.integration
async def test_saving_with_a_label_still_works(
    api_client: AsyncClient, isolated_backend: Path
) -> None:
    """The guard does not disturb a normal save."""
    response = await api_client.post(
        "/api/session/save", json={"label": "seedbox", "mam": {"mam_id": "x"}}
    )

    assert response.json() == {"success": True}
    assert [p.name for p in isolated_backend.glob("session-*.yaml")] == ["session-seedbox.yaml"]
