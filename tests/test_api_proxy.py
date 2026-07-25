"""Focused proxy-cleanup persistence tests."""

from typing import Any

import pytest

from backend import api_proxy
from backend.yaml_store import YamlStoreError


def test_delete_proxy_skips_corrupt_session_and_continues(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """A corrupt session must not prevent cleanup of later valid sessions."""
    saved: list[dict[str, Any]] = []
    monkeypatch.setattr(api_proxy, "load_proxies", lambda: {"VPN": {}})
    monkeypatch.setattr(api_proxy, "save_proxies", lambda _proxies: None)
    monkeypatch.setattr(api_proxy, "list_sessions", lambda: ["bad", "good"])

    def load(label: str) -> dict[str, Any]:
        if label == "bad":
            raise YamlStoreError("malformed")
        return {"label": label, "proxy": {"label": "VPN"}}

    monkeypatch.setattr(api_proxy, "load_session", load)
    monkeypatch.setattr(api_proxy, "save_session", saved.append)

    assert api_proxy.delete_proxy("VPN") == {"success": True}
    assert saved == [{"label": "good", "proxy": {}}]
