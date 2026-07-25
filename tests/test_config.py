"""Focused tests for session configuration lifecycle behavior."""

from pathlib import Path
import threading
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


@pytest.mark.parametrize("label", ["", ".", "..", "../bad", "bad/name", "bad\\name", "x\x00y"])
def test_label_validation(config_dir: Path, label: str) -> None:
    """Reject labels that are not safe filesystem basenames."""
    with pytest.raises(ValueError):
        config.get_session_path(label)


def test_label_byte_limit_uses_primary_filename(config_dir: Path) -> None:
    """Allow exactly the primary filename byte limit and reject one more byte."""
    label = "é" * (config.MAX_SESSION_LABEL_BYTES // 2)
    assert len(config.get_session_path(label).name.encode()) == config.NAME_MAX_BYTES
    with pytest.raises(ValueError):
        config.get_session_path(f"{label}a")


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
    """Expose source cleanup failure after the renamed copy is durable."""
    config.save_session({"label": "Old", "value": 1})
    old_path = config.get_session_path("Old")
    new_path = config.get_session_path("New")
    real_unlink = Path.unlink

    def fail_old_unlink(path: Path, *args: Any, **kwargs: Any) -> None:
        """Fail only the source cleanup step."""
        if path == old_path:
            raise OSError("unlink denied")
        real_unlink(path, *args, **kwargs)

    monkeypatch.setattr(Path, "unlink", fail_old_unlink)

    with pytest.raises(OSError, match="unlink denied"):
        config.save_session({"label": "New", "value": 2}, old_label="Old")

    assert old_path.read_text(encoding="utf-8")
    assert new_path.read_text(encoding="utf-8")
    assert config.load_session("Old")["value"] == 1
    assert config.load_session("New")["value"] == 2


def test_filename_label_is_canonical(config_dir: Path) -> None:
    """Replace a stale embedded label with the requested filename label."""
    config.get_session_path("Canonical").write_text("label: stale\n", encoding="utf-8")
    assert config.load_session("Canonical")["label"] == "Canonical"


def test_stale_update_raises(config_dir: Path) -> None:
    """Reject an update whose expected primary session is absent."""
    with pytest.raises(config.StaleSessionError):
        config.save_session({"label": "Gone"}, old_label="Gone")


def test_queued_update_cannot_recreate_deleted_session(config_dir: Path) -> None:
    """Serialize delete ahead of a stale queued update."""
    config.save_session({"label": "One"})
    config._SESSION_LOCK.acquire()
    try:
        config.delete_session("One")
        errors: list[BaseException] = []

        def update() -> None:
            try:
                config.save_session({"label": "One"}, old_label="One")
            except BaseException as err:
                errors.append(err)

        thread = threading.Thread(target=update)
        thread.start()
    finally:
        config._SESSION_LOCK.release()
    thread.join()
    assert len(errors) == 1
    assert isinstance(errors[0], config.StaleSessionError)
    assert not config.get_session_path("One").exists()


def test_delete_waits_for_in_progress_save(
    config_dir: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Prevent deletion from interleaving with the atomic session write."""
    config.save_session({"label": "One"})
    started = threading.Event()
    release = threading.Event()
    real_write = config.write_yaml_file

    def blocked_write(path: Path, data: dict[str, Any]) -> None:
        started.set()
        release.wait()
        real_write(path, data)

    monkeypatch.setattr(config, "write_yaml_file", blocked_write)
    save_thread = threading.Thread(
        target=config.save_session, args=({"label": "One", "value": 2}, "One")
    )
    save_thread.start()
    assert started.wait(1)
    delete_thread = threading.Thread(target=config.delete_session, args=("One",))
    delete_thread.start()
    release.set()
    save_thread.join()
    delete_thread.join()
    assert not config.get_session_path("One").exists()
