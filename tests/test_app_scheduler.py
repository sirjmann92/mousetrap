"""Focused regressions for session scheduler persistence behavior."""

from copy import deepcopy
import logging
from typing import Any

import pytest

from backend import app as app_module
from backend.yaml_store import YamlStoreError


def test_register_all_session_jobs_skips_only_malformed_session(
    monkeypatch: pytest.MonkeyPatch, caplog: pytest.LogCaptureFixture
) -> None:
    """Continue registering later sessions after one YAML load failure."""
    registered: list[str] = []

    def register(label: str) -> None:
        """Record valid registrations and reject one malformed session."""
        if label == "Broken":
            raise YamlStoreError("malformed YAML")
        registered.append(label)

    monkeypatch.setattr(app_module, "list_sessions", lambda: ["First", "Broken", "Last"])
    monkeypatch.setattr(app_module, "register_session_job", register)

    with caplog.at_level(logging.ERROR):
        app_module.register_all_session_jobs()

    assert registered == ["First", "Last"]
    assert "Failed to load session 'Broken'" in caplog.text
    assert "malformed YAML" in caplog.text


def test_register_all_session_jobs_does_not_hide_unexpected_failure(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Propagate non-store failures instead of weakening startup semantics."""
    monkeypatch.setattr(app_module, "list_sessions", lambda: ["Example"])

    def fail_registration(_label: str) -> None:
        """Raise an unexpected scheduler failure."""
        raise RuntimeError("scheduler unavailable")

    monkeypatch.setattr(app_module, "register_session_job", fail_registration)

    with pytest.raises(RuntimeError, match="scheduler unavailable"):
        app_module.register_all_session_jobs()


@pytest.mark.asyncio
async def test_session_check_rotated_mam_id_patches_fresh_config(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Preserve concurrent settings when status I/O rotates the MAM cookie."""
    initial_cfg = {
        "label": "Example",
        "mam": {"mam_id": "old"},
        "mam_ip": "",
        "integration_setting": "before",
    }
    concurrent_cfg = deepcopy(initial_cfg)
    concurrent_cfg["integration_setting"] = "after"
    load_results = iter([initial_cfg, concurrent_cfg])
    saved: list[dict[str, Any]] = []
    synced: list[dict[str, Any]] = []

    monkeypatch.setattr(app_module, "load_session", lambda _label: next(load_results))
    monkeypatch.setattr(app_module, "resolve_proxy_from_session_cfg", lambda _cfg: {})

    async def no_ip() -> dict[str, Any]:
        """Avoid unrelated external IP lookup behavior."""
        return {}

    async def rotated_status(**_kwargs: Any) -> dict[str, Any]:
        """Return a rotated cookie from the awaited status request."""
        return {"updated_mam_id": "new", "mam_cookie_exists": False}

    async def record_sync(
        cfg: dict[str, Any], _label: str, _new: str | None, _old: str | None
    ) -> None:
        """Capture the config used for integration synchronization."""
        synced.append(deepcopy(cfg))
        raise RuntimeError("stop after rotated-cookie persistence")

    monkeypatch.setattr(app_module, "get_ipinfo_with_fallback", no_ip)
    monkeypatch.setattr(app_module, "get_status", rotated_status)
    monkeypatch.setattr(
        app_module,
        "save_session",
        lambda cfg, old_label=None: saved.append(deepcopy(cfg)),
    )
    monkeypatch.setattr(app_module, "_sync_integrations_if_mam_id_changed", record_sync)

    await app_module.session_check_job("Example")

    expected = {
        **concurrent_cfg,
        "mam": {"mam_id": "new"},
    }
    assert saved == [expected]
    assert synced == [expected]
