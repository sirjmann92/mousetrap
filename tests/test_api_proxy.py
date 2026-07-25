"""Tests for proxy configuration API persistence behavior."""

from typing import Any

import pytest

from backend import api_proxy


def test_delete_proxy_marks_session_save_as_existing_update(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Guard proxy cleanup writes against recreating a retired session."""
    saved_sessions: list[tuple[dict[str, Any], str | None]] = []
    saved_proxies: list[dict[str, dict[str, Any]]] = []

    monkeypatch.setattr(api_proxy, "load_proxies", lambda: {"VPN": {"host": "proxy"}})
    monkeypatch.setattr(api_proxy, "save_proxies", saved_proxies.append)
    monkeypatch.setattr(api_proxy, "list_sessions", lambda: ["Session1"])
    monkeypatch.setattr(
        api_proxy,
        "load_session",
        lambda label: {"label": label, "proxy": {"label": "VPN"}},
    )
    monkeypatch.setattr(
        api_proxy,
        "save_session",
        lambda cfg, old_label=None: saved_sessions.append((cfg, old_label)),
    )

    result = api_proxy.delete_proxy("VPN")

    assert result == {"success": True}
    assert saved_proxies == [{}]
    assert "VPN" not in saved_proxies[0]
    assert saved_sessions == [({"label": "Session1", "proxy": {}}, "Session1")]


def test_delete_proxy_ignores_session_retired_during_cleanup(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Treat a concurrent session retirement as a completed cleanup."""

    def raise_stale_session(_cfg: dict[str, Any], old_label: str | None = None) -> None:
        """Simulate a session retired after lifecycle discovery."""
        raise api_proxy.StaleSessionError(f"retired: {old_label}")

    monkeypatch.setattr(api_proxy, "load_proxies", lambda: {"Proxy1": {}})
    monkeypatch.setattr(api_proxy, "save_proxies", lambda proxies: None)
    monkeypatch.setattr(api_proxy, "list_sessions", lambda: ["Session1"])
    monkeypatch.setattr(
        api_proxy,
        "load_session",
        lambda label: {"label": label, "proxy": {"label": "Proxy1"}},
    )
    monkeypatch.setattr(api_proxy, "save_session", raise_stale_session)

    assert api_proxy.delete_proxy("Proxy1") == {"success": True}
