"""Tests for atomic YAML store helpers."""

from pathlib import Path
import threading
import time
from typing import Any

import pytest
import yaml

from backend import yaml_store
from backend.yaml_store import backup_path, load_yaml_file, write_yaml_file


def test_write_yaml_file_creates_backup(tmp_path: Path) -> None:
    """Write YAML atomically and refresh a readable backup copy."""
    path = tmp_path / "settings.yaml"
    data: dict[str, Any] = {"label": "Session1", "nested": {"enabled": True}}

    write_yaml_file(path, data)

    assert yaml.safe_load(path.read_text(encoding="utf-8")) == data
    assert yaml.safe_load(backup_path(path).read_text(encoding="utf-8")) == data


def test_write_yaml_file_round_trips_yaml_null(tmp_path: Path) -> None:
    """Preserve a top-level YAML null as valid data instead of corruption."""
    path = tmp_path / "settings.yaml"

    write_yaml_file(path, None)

    assert load_yaml_file(path, {"label": "default"}) is None


def test_write_yaml_file_succeeds_when_backup_refresh_fails(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    """Keep the primary write successful when refreshing the backup fails."""
    path = tmp_path / "settings.yaml"
    old_backup_data = {"label": "old"}
    new_data = {"label": "new"}
    backup_path(path).write_text(yaml.safe_dump(old_backup_data), encoding="utf-8")

    def fail_atomic_copy(src: Path, dst: Path) -> None:
        """Simulate an OS failure while refreshing the backup file."""
        raise OSError("simulated backup refresh failure")

    monkeypatch.setattr(yaml_store, "_atomic_copy", fail_atomic_copy)

    write_yaml_file(path, new_data)

    assert yaml.safe_load(path.read_text(encoding="utf-8")) == new_data
    assert yaml.safe_load(backup_path(path).read_text(encoding="utf-8")) == old_backup_data


def test_write_yaml_file_serializes_same_path_operations(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    """Serialize concurrent writes that target the same YAML path."""
    path = tmp_path / "settings.yaml"
    active_writes = 0
    max_active_writes = 0
    state_lock = threading.Lock()
    start_barrier = threading.Barrier(4)
    thread_errors: list[BaseException] = []

    def slow_atomic_copy(src: Path, dst: Path) -> None:
        """Track whether same-path writes overlap while backup refresh runs."""
        nonlocal active_writes, max_active_writes
        with state_lock:
            active_writes += 1
            max_active_writes = max(max_active_writes, active_writes)
        time.sleep(0.05)
        with state_lock:
            active_writes -= 1

    def write_number(value: int) -> None:
        """Start all worker threads together, then write one YAML payload."""
        try:
            start_barrier.wait()
            write_yaml_file(path, {"value": value})
        except BaseException as err:
            thread_errors.append(err)

    monkeypatch.setattr(yaml_store, "_atomic_copy", slow_atomic_copy)
    threads = [threading.Thread(target=write_number, args=(value,)) for value in range(4)]

    for thread in threads:
        thread.start()
    for thread in threads:
        thread.join()

    assert thread_errors == []
    assert max_active_writes == 1


def test_locking_does_not_retain_per_path_lock_entries(tmp_path: Path) -> None:
    """Avoid retaining one permanent lock entry per arbitrary YAML path."""
    for index in range(100):
        load_yaml_file(tmp_path / f"missing-{index}.yaml", {})

    assert not hasattr(yaml_store, "_PATH_LOCKS")


def test_load_yaml_file_uses_default_without_file(
    caplog: pytest.LogCaptureFixture,
    tmp_path: Path,
) -> None:
    """Return the caller-provided default when no settings file exists."""
    default = {"label": "default"}

    loaded = load_yaml_file(tmp_path / "missing.yaml", default)

    assert loaded == default
    assert not caplog.records


@pytest.mark.parametrize("primary_content", ["", "label: [unterminated\n"])
def test_load_yaml_file_recovers_from_valid_backup(
    tmp_path: Path,
    primary_content: str,
) -> None:
    """Recover valid backup data when the primary YAML file is empty or malformed."""
    path = tmp_path / "settings.yaml"
    backup = backup_path(path)
    backup_data = {"label": "backup", "nested": {"enabled": True}}
    path.write_text(primary_content, encoding="utf-8")
    backup.write_text(yaml.safe_dump(backup_data), encoding="utf-8")

    loaded = load_yaml_file(path, {"label": "default"})

    assert loaded == backup_data
    assert yaml.safe_load(path.read_text(encoding="utf-8")) == backup_data


def test_load_yaml_file_recovers_from_backup_when_primary_missing(tmp_path: Path) -> None:
    """Recover valid backup data when the primary YAML file is missing."""
    path = tmp_path / "settings.yaml"
    backup_data = {"label": "backup"}
    backup_path(path).write_text(yaml.safe_dump(backup_data), encoding="utf-8")

    loaded = load_yaml_file(path, {"label": "default"})

    assert loaded == backup_data
    assert yaml.safe_load(path.read_text(encoding="utf-8")) == backup_data


def test_load_yaml_file_recovers_when_primary_has_wrong_shape(tmp_path: Path) -> None:
    """Recover a mapping backup when the primary contains a valid YAML list."""
    path = tmp_path / "settings.yaml"
    backup_data = {"label": "backup"}
    path.write_text("- wrong\n- shape\n", encoding="utf-8")
    backup_path(path).write_text(yaml.safe_dump(backup_data), encoding="utf-8")

    loaded = load_yaml_file(path, {}, expected_type=dict)

    assert loaded == backup_data
    assert yaml.safe_load(path.read_text(encoding="utf-8")) == backup_data


def test_load_yaml_file_uses_default_when_backup_has_wrong_shape(tmp_path: Path) -> None:
    """Reject a syntactically valid backup with the wrong top-level shape."""
    path = tmp_path / "settings.yaml"
    default = {"label": "default"}
    path.write_text("- wrong\n", encoding="utf-8")
    backup_path(path).write_text("- also-wrong\n", encoding="utf-8")

    assert load_yaml_file(path, default, expected_type=dict) == default


def test_load_yaml_file_recovers_from_invalid_utf8_primary(tmp_path: Path) -> None:
    """Recover from backup when the primary cannot be decoded as UTF-8."""
    path = tmp_path / "settings.yaml"
    backup_data = {"label": "backup"}
    path.write_bytes(b"\xff\xfe")
    backup_path(path).write_text(yaml.safe_dump(backup_data), encoding="utf-8")

    assert load_yaml_file(path, {}, expected_type=dict) == backup_data


def test_load_yaml_file_uses_default_for_invalid_utf8_backup(tmp_path: Path) -> None:
    """Return defaults when both primary and backup fail UTF-8 decoding."""
    path = tmp_path / "settings.yaml"
    path.write_bytes(b"\xff")
    backup_path(path).write_bytes(b"\xfe")

    assert load_yaml_file(path, {"label": "default"}, expected_type=dict) == {"label": "default"}


def test_load_yaml_file_recovers_from_primary_read_error(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    """Recover from backup when reading the primary raises an OS error."""
    path = tmp_path / "settings.yaml"
    backup_data = {"label": "backup"}
    backup_path(path).write_text(yaml.safe_dump(backup_data), encoding="utf-8")
    original_read_text = Path.read_text

    def read_text(candidate: Path, *args: Any, **kwargs: Any) -> str:
        """Fail only the primary read and delegate all other reads."""
        if candidate == path:
            raise OSError("simulated read failure")
        return original_read_text(candidate, *args, **kwargs)

    monkeypatch.setattr(Path, "read_text", read_text)

    assert load_yaml_file(path, {}, expected_type=dict) == backup_data


def test_load_yaml_file_uses_default_for_backup_read_error(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    """Return defaults when the backup read raises an OS error."""
    path = tmp_path / "settings.yaml"
    backup = backup_path(path)
    path.write_text("", encoding="utf-8")
    backup.write_text("label: backup\n", encoding="utf-8")
    original_read_text = Path.read_text

    def read_text(candidate: Path, *args: Any, **kwargs: Any) -> str:
        """Fail only the backup read and delegate all other reads."""
        if candidate == backup:
            raise OSError("simulated backup read failure")
        return original_read_text(candidate, *args, **kwargs)

    monkeypatch.setattr(Path, "read_text", read_text)

    assert load_yaml_file(path, {"label": "default"}, expected_type=dict) == {"label": "default"}


@pytest.mark.parametrize("primary_exists", [False, True])
def test_load_yaml_file_uses_default_when_backup_empty(
    tmp_path: Path,
    primary_exists: bool,
) -> None:
    """Return the default when recovery reaches an empty backup file."""
    path = tmp_path / "settings.yaml"
    default = {"label": "default"}
    if primary_exists:
        path.write_text("", encoding="utf-8")
    backup_path(path).write_text("", encoding="utf-8")

    loaded = load_yaml_file(path, default)

    assert loaded == default


@pytest.mark.parametrize("primary_content", [None, "label: [unterminated\n"])
def test_load_yaml_file_uses_default_when_backup_malformed(
    tmp_path: Path,
    primary_content: str | None,
) -> None:
    """Return the default when recovery reaches a malformed backup file."""
    path = tmp_path / "settings.yaml"
    default = {"label": "default"}
    if primary_content is not None:
        path.write_text(primary_content, encoding="utf-8")
    backup_path(path).write_text("label: [unterminated\n", encoding="utf-8")

    loaded = load_yaml_file(path, default)

    assert loaded == default
