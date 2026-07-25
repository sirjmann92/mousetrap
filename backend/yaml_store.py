"""Durable YAML file persistence helpers.

The application stores user settings as YAML files under ``/config``. These
files must not be rewritten in place: if the container is stopped, restarted,
or killed during a normal ``open(..., "w")`` write, the destination file can be
left empty or partially written. The helpers in this module write through a
same-directory temporary file, atomically replace the destination, and keep a
last-known-good backup for recovery.
"""

from __future__ import annotations

from collections.abc import Iterator
from contextlib import contextmanager
import logging
import os
from pathlib import Path
import shutil
import stat
import threading
import time
from typing import Any
import uuid

import yaml

_logger = logging.getLogger(__name__)
_EMPTY_YAML = object()
_LOCK_STRIPE_COUNT = 64
_LOCK_STRIPES = tuple(threading.RLock() for _ in range(_LOCK_STRIPE_COUNT))


def backup_path(path: Path) -> Path:
    """Return the backup path for a YAML settings file.

    Args:
        path: Destination YAML path.

    Returns:
        Path ending with ``.bak`` beside the destination file.
    """
    return path.with_name(f"{path.name}.bak")


def load_yaml_file(
    path: Path,
    default: Any,
    expected_type: type[Any] | tuple[type[Any], ...] | None = None,
) -> Any:
    """Load YAML from a file, falling back to the last-known-good backup.

    Empty and malformed YAML files are treated as corrupt instead of as a valid
    empty config. This prevents a transient truncation from becoming permanent
    when the application later saves defaults back over the real settings.

    Args:
        path: YAML file to load.
        default: Value returned when neither the main file nor backup can be
            loaded.
        expected_type: Optional required top-level type. Data of another type
            is treated as corrupt and triggers backup recovery.

    Returns:
        Parsed YAML content, backup content, or ``default``.
    """
    with _lock_for_path(path):
        return _load_yaml_file_unlocked(path, default, expected_type)


def _load_yaml_file_unlocked(
    path: Path,
    default: Any,
    expected_type: type[Any] | tuple[type[Any], ...] | None,
) -> Any:
    """Load YAML while the caller holds the path lock.

    Args:
        path: YAML file to load.
        default: Value returned when neither the main file nor backup can be
            loaded.
        expected_type: Optional required top-level type.

    Returns:
        Parsed YAML content, backup content, or ``default``.
    """
    primary_missing = False
    try:
        data = _read_yaml_file(path)
    except FileNotFoundError:
        primary_missing = True
    except (OSError, UnicodeError, yaml.YAMLError) as err:
        _logger.warning("[ConfigStore] Could not read YAML at %s: %s", path, err)
    else:
        if data is not _EMPTY_YAML and _matches_expected_type(data, expected_type):
            return data
        reason = "empty" if data is _EMPTY_YAML else "wrong-shaped"
        _logger.warning(
            "[ConfigStore] YAML at %s is %s; attempting backup recovery",
            path,
            reason,
        )

    backup = backup_path(path)
    try:
        backup_data = _read_yaml_file(backup)
    except FileNotFoundError:
        if primary_missing:
            return default
        _logger.warning("[ConfigStore] No backup found for %s; using defaults", path)
        return default
    except (OSError, UnicodeError, yaml.YAMLError) as err:
        _logger.warning("[ConfigStore] Could not read backup YAML at %s: %s", backup, err)
        return default

    if backup_data is _EMPTY_YAML or not _matches_expected_type(backup_data, expected_type):
        reason = "empty" if backup_data is _EMPTY_YAML else "wrong-shaped"
        _logger.warning("[ConfigStore] Backup YAML is %s at %s; using defaults", reason, backup)
        return default

    if primary_missing:
        _logger.warning("[ConfigStore] YAML file missing at %s; recovering backup", path)
    _logger.warning("[ConfigStore] Recovered %s from backup %s", path, backup)
    try:
        write_yaml_file(path, backup_data)
    except (OSError, yaml.YAMLError) as err:
        _logger.error("[ConfigStore] Recovery write failed for %s: %s", path, err)
    return backup_data


def write_yaml_file(path: Path, data: Any, *, refresh_backup: bool = True) -> None:
    """Atomically write YAML and refresh the last-known-good backup.

    Args:
        path: Destination YAML path.
        data: YAML-serializable value to persist.
        refresh_backup: Whether to refresh the adjacent last-known-good backup.
    """
    with _lock_for_path(path):
        _write_yaml_file_unlocked(path, data, refresh_backup=refresh_backup)


def _write_yaml_file_unlocked(path: Path, data: Any, *, refresh_backup: bool = True) -> None:
    """Atomically write YAML while the caller holds the path lock.

    Args:
        path: Destination YAML path.
        data: YAML-serializable value to persist.
        refresh_backup: Whether to refresh the adjacent last-known-good backup.
    """
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, temp_path = _create_persistent_temp(
        path,
        prefix=".yaml-write-",
        suffix=".tmp",
    )
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as file_obj:
            yaml.safe_dump(data, file_obj)
            file_obj.flush()
            os.fsync(file_obj.fileno())

        temp_path.replace(path)
        _fsync_directory(path.parent)
        if refresh_backup:
            try:
                _atomic_copy(path, backup_path(path))
            except OSError as err:
                _logger.warning("[ConfigStore] Backup refresh failed for %s: %s", path, err)
    finally:
        if temp_path.exists():
            temp_path.unlink()


def _lock_for_path(path: Path) -> threading.RLock:
    """Return the in-process lock for a YAML path.

    Args:
        path: YAML path to protect.

    Returns:
        Re-entrant lock shared by all operations in the same path stripe.
    """
    lock_key = path.resolve(strict=False)
    return _LOCK_STRIPES[hash(lock_key) % _LOCK_STRIPE_COUNT]


@contextmanager
def lock_yaml_files(*paths: Path) -> Iterator[None]:
    """Lock multiple YAML primary paths in stable order.

    Args:
        paths: Primary YAML paths whose lifecycle must be serialized.

    Yields:
        Control while all corresponding re-entrant path locks are held.
    """
    stripe_indexes = sorted(
        {hash(path.resolve(strict=False)) % _LOCK_STRIPE_COUNT for path in paths}
    )
    locks = [_LOCK_STRIPES[index] for index in stripe_indexes]
    for lock in locks:
        lock.acquire()
    try:
        yield
    finally:
        for lock in reversed(locks):
            lock.release()


def _matches_expected_type(
    data: Any,
    expected_type: type[Any] | tuple[type[Any], ...] | None,
) -> bool:
    """Return whether parsed YAML satisfies an optional top-level type."""
    return expected_type is None or isinstance(data, expected_type)


def _atomic_copy(src: Path, dst: Path) -> None:
    """Copy one file to another through an atomic replacement.

    Args:
        src: Source file to copy.
        dst: Destination file to replace atomically.
    """
    fd, temp_path = _create_persistent_temp(
        dst,
        prefix=".yaml-copy-",
        suffix=".tmp",
    )
    try:
        with os.fdopen(fd, "wb") as out_file, src.open("rb") as in_file:
            shutil.copyfileobj(in_file, out_file)
            out_file.flush()
            os.fsync(out_file.fileno())

        temp_path.replace(dst)
        _fsync_directory(dst.parent)
    finally:
        if temp_path.exists():
            temp_path.unlink()


def _create_persistent_temp(
    destination: Path,
    *,
    prefix: str,
    suffix: str,
) -> tuple[int, Path]:
    """Create a replacement temp with the destination's persistent mode.

    For a new destination, ``os.open`` applies the current process umask
    atomically in the kernel. This avoids temporarily changing the
    process-global umask.
    """
    try:
        mode = stat.S_IMODE(destination.stat().st_mode)
    except FileNotFoundError:
        mode = None

    for _attempt in range(100):
        temp_path = destination.parent / f"{prefix}{uuid.uuid4().hex}{suffix}"
        try:
            fd = os.open(
                temp_path,
                os.O_RDWR | os.O_CREAT | os.O_EXCL,
                0o666 if mode is None else mode,
            )
        except FileExistsError:
            continue
        if mode is not None:
            try:
                os.fchmod(fd, mode)
            except BaseException:
                try:
                    os.close(fd)
                finally:
                    temp_path.unlink(missing_ok=True)
                raise
        return fd, temp_path
    raise FileExistsError(f"Could not allocate persistent temp beside {destination}")


def cleanup_store_temp_artifacts(directory: Path, *, min_age_seconds: float = 3600) -> int:
    """Remove old, narrowly store-owned crash temporary files.

    Age gating prevents cleanup from deleting a temporary file owned by an
    active writer. Callers should invoke this from a recovery/startup path.

    Args:
        directory: Store directory to inspect.
        min_age_seconds: Minimum artifact age required for removal.

    Returns:
        Number of artifacts removed.
    """
    if not directory.exists():
        return 0
    cutoff = time.time() - min_age_seconds
    removed = 0
    patterns = (
        ".yaml-write-*.tmp",
        ".yaml-copy-*.tmp",
        ".session-rename-*.json.*.tmp",
        ".session-rename-*.pending.yaml.*.tmp",
    )
    for pattern in patterns:
        for candidate in directory.glob(pattern):
            try:
                if not candidate.is_file() or candidate.stat().st_mtime > cutoff:
                    continue
                candidate.unlink()
                removed += 1
            except OSError as err:
                _logger.warning(
                    "[ConfigStore] Could not remove stale store temp %s: %s",
                    candidate,
                    err,
                )
    if removed:
        _fsync_directory(directory)
    return removed


def _read_yaml_file(path: Path) -> Any:
    """Read one YAML file and return a sentinel for empty content.

    Args:
        path: YAML path to read.

    Returns:
        Parsed YAML data or an internal sentinel when the file is empty.
    """
    text = path.read_text(encoding="utf-8")
    if text.strip() == "":
        return _EMPTY_YAML
    return yaml.safe_load(text)


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
