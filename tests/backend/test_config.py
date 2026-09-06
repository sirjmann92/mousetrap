"""Focused backend tests for session configuration lifecycle behavior."""

from pathlib import Path
from typing import Any

import pytest

from backend import config
from backend.yaml_store import YamlStoreError


@pytest.fixture
def config_dir(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Path:
    """Point configuration persistence at an isolated directory."""
    monkeypatch.setattr(config, "CONFIG_DIR", tmp_path)
    monkeypatch.setattr(config, "CONFIG_PATH", tmp_path / "config.yaml")
    return tmp_path


def test_missing_session_returns_defaults(config_dir: Path) -> None:
    """Return normalized defaults when a primary session is absent."""
    loaded = config.load_session("Missing")
    assert loaded["label"] == "Missing"
    assert loaded["browser_cookie"] == ""


@pytest.mark.parametrize("contents", ["broken: [", "- wrong\n- shape\n"])
def test_invalid_session_yaml_raises(config_dir: Path, contents: str) -> None:
    """Expose corrupt and wrong-shaped persisted YAML as store errors."""
    config.get_session_path("Bad").write_text(contents, encoding="utf-8")
    with pytest.raises(YamlStoreError):
        config.load_session("Bad")


@pytest.mark.parametrize(
    ("contents", "section"),
    [
        ("perk_automation: []\n", "perk_automation"),
        ("perk_automation:\n  upload_credit: []\n", "perk_automation.upload_credit"),
        ("perk_automation:\n  vip_automation: []\n", "perk_automation.vip_automation"),
        ("mam: []\n", "mam"),
        ("prowlarr: []\n", "prowlarr"),
    ],
)
def test_invalid_nested_session_mapping_raises(
    config_dir: Path, contents: str, section: str
) -> None:
    """Reject wrong-shaped session sections before mutating defaults."""
    config.get_session_path("Bad").write_text(contents, encoding="utf-8")
    with pytest.raises(YamlStoreError, match=rf"'{section}' must be a mapping"):
        config.load_session("Bad")


def test_save_update_rename_and_delete(config_dir: Path) -> None:
    """Support the complete primary-file lifecycle."""
    config.save_session({"label": "Old", "value": 1})
    config.save_session({"label": "Old", "value": 2}, old_label="Old")
    config.save_session({"label": "New", "value": 3}, old_label="Old")
    assert config.list_sessions() == ["New"]
    assert config.load_session("New")["value"] == 3
    config.delete_session("New")
    assert config.list_sessions() == []


def test_rename_write_failure_preserves_old_session(
    config_dir: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Keep the source session intact when writing its renamed copy fails."""
    config.save_session({"label": "Old", "value": 1})
    old_path = config.get_session_path("Old")
    new_path = config.get_session_path("New")

    def fail_write(_path: Path, _data: dict[str, Any]) -> None:
        """Simulate an ordinary destination write failure."""
        raise YamlStoreError("disk full")

    monkeypatch.setattr(config, "write_yaml_file", fail_write)

    with pytest.raises(YamlStoreError, match="disk full"):
        config.save_session({"label": "New", "value": 2}, old_label="Old")

    assert config.load_session("Old")["value"] == 1
    assert old_path.exists()
    assert not new_path.exists()


def test_rename_unlink_failure_leaves_two_complete_sessions(
    config_dir: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Propagate old-file cleanup failure after writing the complete new file."""
    config.save_session({"label": "Old", "value": 1})
    old_path = config.get_session_path("Old")
    real_unlink = Path.unlink

    def fail_old_unlink(path: Path, *args: Any, **kwargs: Any) -> None:
        if path == old_path:
            raise OSError("unlink denied")
        real_unlink(path, *args, **kwargs)

    monkeypatch.setattr(Path, "unlink", fail_old_unlink)
    with pytest.raises(OSError, match="unlink denied"):
        config.save_session({"label": "New", "value": 2}, old_label="Old")

    assert config.load_session("Old")["value"] == 1
    assert config.load_session("New")["value"] == 2
