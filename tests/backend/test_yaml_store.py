"""Backend interface tests for YAML persistence."""

from pathlib import Path
import stat

import pytest

from backend.yaml_store import YamlStoreError, load_yaml_file, write_yaml_file


def test_missing_file_returns_default(tmp_path: Path) -> None:
    """Return the supplied default only for a missing primary file."""
    default = {"enabled": True}
    assert load_yaml_file(tmp_path / "missing.yaml", default) is default


@pytest.mark.parametrize(
    "content",
    ["", "  \n", "key: [unterminated\n"],
)
def test_invalid_content_raises(tmp_path: Path, content: str) -> None:
    """Reject empty and malformed YAML instead of silently using defaults."""
    path = tmp_path / "settings.yaml"
    path.write_text(content, encoding="utf-8")
    with pytest.raises(YamlStoreError):
        load_yaml_file(path, {})


def test_invalid_utf8_raises(tmp_path: Path) -> None:
    """Report invalid UTF-8 through the public store exception."""
    path = tmp_path / "settings.yaml"
    path.write_bytes(b"\xff")
    with pytest.raises(YamlStoreError):
        load_yaml_file(path, {})


def test_yaml_null_is_preserved_without_expected_type(tmp_path: Path) -> None:
    """Preserve an explicit YAML null when no shape contract is requested."""
    path = tmp_path / "settings.yaml"
    path.write_text("null\n", encoding="utf-8")
    assert load_yaml_file(path, {}) is None


def test_wrong_top_level_type_raises(tmp_path: Path) -> None:
    """Reject parsed data that violates the requested top-level type."""
    path = tmp_path / "settings.yaml"
    path.write_text("- value\n", encoding="utf-8")
    with pytest.raises(YamlStoreError, match="expected dict"):
        load_yaml_file(path, {}, expected_type=dict)


def test_write_round_trips_and_creates_owner_only_file(tmp_path: Path) -> None:
    """Create a new owner-only file whose YAML value round trips."""
    path = tmp_path / "nested" / "settings.yaml"
    data = {"label": "example", "enabled": True}
    write_yaml_file(path, data)
    assert load_yaml_file(path, {}, expected_type=dict) == data
    assert stat.S_IMODE(path.stat().st_mode) == 0o600
    assert not list(path.parent.glob(".yaml-*.tmp"))


def test_write_rejects_direct_symlink(tmp_path: Path) -> None:
    """Reject a direct symlink destination without changing its target."""
    target = tmp_path / "target.yaml"
    target.write_text("old: true\n", encoding="utf-8")
    path = tmp_path / "settings.yaml"
    path.symlink_to(target.name)

    with pytest.raises(YamlStoreError, match="Refusing to replace symlink"):
        write_yaml_file(path, {"new": True})
    assert load_yaml_file(target, {}) == {"old": True}


def test_write_preserves_existing_mode(tmp_path: Path) -> None:
    """Keep destination permissions across atomic replacement."""
    path = tmp_path / "settings.yaml"
    path.write_text("old: true\n", encoding="utf-8")
    path.chmod(0o640)
    write_yaml_file(path, {"new": True})
    assert stat.S_IMODE(path.stat().st_mode) == 0o640


def test_failed_replace_keeps_destination_and_cleans_temp(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    """Leave the old destination intact when atomic replacement fails."""
    path = tmp_path / "settings.yaml"
    path.write_text("old: true\n", encoding="utf-8")

    def fail_replace(source: Path, destination: Path) -> None:
        """Simulate an atomic replacement failure."""
        raise OSError("replace failed")

    monkeypatch.setattr(Path, "replace", fail_replace)
    with pytest.raises(YamlStoreError, match="replace failed"):
        write_yaml_file(path, {"new": True})
    assert load_yaml_file(path, {}) == {"old": True}
    assert not list(tmp_path.glob(".yaml-*.tmp"))
