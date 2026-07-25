"""Small, atomic YAML persistence helpers."""

from __future__ import annotations

from contextlib import suppress
import os
from pathlib import Path
import stat
import tempfile
from typing import Any

import yaml


class YamlStoreError(RuntimeError):
    """Raised when YAML persistence cannot satisfy its file contract."""


def load_yaml_file(
    path: Path,
    default: Any,
    expected_type: type[Any] | tuple[type[Any], ...] | None = None,
) -> Any:
    """Load one YAML file.

    Args:
        path: YAML file to load.
        default: Value returned only when ``path`` does not exist.
        expected_type: Optional required type for the parsed top-level value.

    Returns:
        The parsed YAML value, including ``None`` for an explicit YAML null.

    Raises:
        YamlStoreError: If the file is empty, unreadable, malformed, or has an
            unexpected top-level type.
    """
    try:
        text = path.read_text(encoding="utf-8")
    except FileNotFoundError:
        return default
    except (OSError, UnicodeError) as err:
        raise YamlStoreError(f"Could not read YAML file {path}: {err}") from err

    if not text.strip():
        raise YamlStoreError(f"YAML file is empty: {path}")
    try:
        data = yaml.safe_load(text)
    except yaml.YAMLError as err:
        raise YamlStoreError(f"Malformed YAML file {path}: {err}") from err
    if expected_type is not None and not isinstance(data, expected_type):
        raise YamlStoreError(
            f"YAML file {path} has top-level type {type(data).__name__}; "
            f"expected {_type_name(expected_type)}"
        )
    return data


def write_yaml_file(path: Path, data: Any) -> None:
    """Atomically write a YAML value through one same-directory temporary file.

    Args:
        path: Destination YAML path.
        data: YAML-serializable value to persist.

    Raises:
        YamlStoreError: If serialization or persistence fails.
    """
    temp_path: Path | None = None
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        try:
            mode = stat.S_IMODE(path.stat().st_mode)
        except FileNotFoundError:
            mode = 0o600
        descriptor, temp_name = tempfile.mkstemp(
            prefix=f".{path.name}.", suffix=".tmp", dir=path.parent
        )
        temp_path = Path(temp_name)
        try:
            os.fchmod(descriptor, mode)
        except OSError:
            os.close(descriptor)
            raise
        with os.fdopen(descriptor, "w", encoding="utf-8") as file_obj:
            yaml.safe_dump(data, file_obj)
            file_obj.flush()
            os.fsync(file_obj.fileno())
        temp_path.replace(path)
        temp_path = None
        _fsync_directory(path.parent)
    except (OSError, yaml.YAMLError) as err:
        raise YamlStoreError(f"Could not write YAML file {path}: {err}") from err
    finally:
        if temp_path is not None:
            with suppress(OSError):
                temp_path.unlink()


def _fsync_directory(directory: Path) -> None:
    """Best-effort sync a directory after replacing an entry."""
    try:
        descriptor = os.open(directory, os.O_RDONLY)
    except OSError:
        return
    try:
        os.fsync(descriptor)
    except OSError:
        pass
    finally:
        os.close(descriptor)


def _type_name(expected_type: type[Any] | tuple[type[Any], ...]) -> str:
    """Return a readable expected-type name for an error message."""
    if isinstance(expected_type, tuple):
        return " or ".join(item.__name__ for item in expected_type)
    return expected_type.__name__
