"""Durable YAML file persistence helpers.

The application stores user settings as YAML files under ``/config``. These
files must not be rewritten in place: if the container is stopped, restarted,
or killed during a normal ``open(..., "w")`` write, the destination file can be
left empty or partially written. The helpers in this module write through a
same-directory temporary file, atomically replace the destination, and keep a
last-known-good backup for recovery.
"""

from __future__ import annotations

import logging
import os
from pathlib import Path
import shutil
import tempfile
from typing import Any

import yaml

_logger = logging.getLogger(__name__)


def backup_path(path: Path) -> Path:
    """Return the backup path for a YAML settings file.

    Args:
        path: Destination YAML path.

    Returns:
        Path ending with ``.bak`` beside the destination file.
    """
    return path.with_name(f"{path.name}.bak")


def load_yaml_file(path: Path, default: Any) -> Any:
    """Load YAML from a file, falling back to the last-known-good backup.

    Empty and malformed YAML files are treated as corrupt instead of as a valid
    empty config. This prevents a transient truncation from becoming permanent
    when the application later saves defaults back over the real settings.

    Args:
        path: YAML file to load.
        default: Value returned when neither the main file nor backup can be
            loaded.

    Returns:
        Parsed YAML content, backup content, or ``default``.
    """
    try:
        data = _read_yaml_file(path)
    except FileNotFoundError:
        return default
    except yaml.YAMLError as err:
        _logger.warning("[ConfigStore] Malformed YAML at %s: %s", path, err)
    else:
        if data is not None:
            return data
        _logger.warning("[ConfigStore] Empty YAML at %s; attempting backup recovery", path)

    backup = backup_path(path)
    try:
        backup_data = _read_yaml_file(backup)
    except FileNotFoundError:
        _logger.warning("[ConfigStore] No backup found for %s; using defaults", path)
        return default
    except yaml.YAMLError as err:
        _logger.warning("[ConfigStore] Backup YAML is malformed at %s: %s", backup, err)
        return default

    if backup_data is None:
        _logger.warning("[ConfigStore] Backup YAML is empty at %s; using defaults", backup)
        return default

    _logger.warning("[ConfigStore] Recovered %s from backup %s", path, backup)
    write_yaml_file(path, backup_data)
    return backup_data


def write_yaml_file(path: Path, data: Any) -> None:
    """Atomically write YAML and refresh the last-known-good backup.

    Args:
        path: Destination YAML path.
        data: YAML-serializable value to persist.
    """
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, temp_name = tempfile.mkstemp(
        dir=str(path.parent),
        prefix=f".{path.name}.",
        suffix=".tmp",
        text=True,
    )
    temp_path = Path(temp_name)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as file_obj:
            yaml.safe_dump(data, file_obj)
            file_obj.flush()
            os.fsync(file_obj.fileno())

        temp_path.replace(path)
        _fsync_directory(path.parent)
        shutil.copy2(path, backup_path(path))
    finally:
        if temp_path.exists():
            temp_path.unlink()


def _read_yaml_file(path: Path) -> Any:
    """Read one YAML file and return ``None`` for empty content.

    Args:
        path: YAML path to read.

    Returns:
        Parsed YAML data or ``None`` when the file is empty.
    """
    with path.open(encoding="utf-8") as file_obj:
        return yaml.safe_load(file_obj)


def _fsync_directory(path: Path) -> None:
    """Best-effort fsync of a directory after atomic replacement.

    Args:
        path: Directory whose metadata should be flushed.
    """
    try:
        dir_fd = os.open(path, os.O_RDONLY)
    except OSError as err:
        _logger.debug("[ConfigStore] Could not open directory %s for fsync: %s", path, err)
        return

    try:
        os.fsync(dir_fd)
    except OSError as err:
        _logger.debug("[ConfigStore] Could not fsync directory %s: %s", path, err)
    finally:
        os.close(dir_fd)
