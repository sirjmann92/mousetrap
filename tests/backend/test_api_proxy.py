"""Focused backend proxy-deletion tests."""

from typing import Any

from fastapi import HTTPException
import pytest

from backend import api_proxy
from backend.yaml_store import YamlStoreError


def _install(
    monkeypatch: pytest.MonkeyPatch,
    sessions: dict[str, dict[str, Any] | YamlStoreError],
) -> list[dict[str, Any]]:
    """Point `delete_proxy` at one stub proxy store and set of sessions.

    Args:
        monkeypatch: Fixture used to replace the module's collaborators.
        sessions: Session label mapped to the config `load_session` returns, or
            to a `YamlStoreError` instance to raise for that label.

    Returns:
        The list every `save_proxies` call is recorded in.

    """
    saved: list[dict[str, Any]] = []
    monkeypatch.setattr(api_proxy, "load_proxies", lambda: {"VPN": {}})
    monkeypatch.setattr(api_proxy, "save_proxies", saved.append)
    monkeypatch.setattr(api_proxy, "list_sessions", lambda: list(sessions))

    def load(label: str) -> dict[str, Any]:
        value = sessions[label]
        if isinstance(value, YamlStoreError):
            raise value
        return dict(value)

    monkeypatch.setattr(api_proxy, "load_session", load)
    return saved


def test_deleting_an_unused_proxy_succeeds(monkeypatch: pytest.MonkeyPatch) -> None:
    """A proxy no session references is removed from the store."""
    saved = _install(monkeypatch, {"other": {"label": "other", "proxy": {"label": "OTHER"}}})

    assert api_proxy.delete_proxy("VPN") == {"success": True}
    assert saved == [{}]


def test_deleting_a_proxy_in_use_is_refused_and_names_the_sessions(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """A proxy still assigned to a session is kept, and the error says which."""
    saved = _install(
        monkeypatch,
        {
            "seedbox": {"label": "seedbox", "proxy": {"label": "VPN"}},
            "spare": {"label": "spare", "proxy": {"label": "VPN"}},
            "unrelated": {"label": "unrelated", "proxy": {}},
        },
    )

    with pytest.raises(HTTPException) as excinfo:
        api_proxy.delete_proxy("VPN")

    assert excinfo.value.status_code == 409
    assert "'seedbox'" in excinfo.value.detail
    assert "'spare'" in excinfo.value.detail
    assert "unrelated" not in excinfo.value.detail
    assert saved == []


def test_a_corrupt_session_blocks_deletion_rather_than_being_skipped(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """A session that cannot be read might use the proxy, so the delete is refused.

    The reference cannot be cleared from a session that will not load, so
    treating it as unaffected would be the one case where a silent direct
    connection could still result.
    """
    saved = _install(monkeypatch, {"bad": YamlStoreError("malformed")})

    with pytest.raises(HTTPException) as excinfo:
        api_proxy.delete_proxy("VPN")

    assert excinfo.value.status_code == 409
    assert "'bad'" in excinfo.value.detail
    assert saved == []


def test_deleting_an_unknown_proxy_still_reports_not_found(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """The 404 for a missing proxy is unchanged by the in-use guard."""
    _install(monkeypatch, {})

    with pytest.raises(HTTPException) as excinfo:
        api_proxy.delete_proxy("ABSENT")

    assert excinfo.value.status_code == 404
