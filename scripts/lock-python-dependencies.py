#!/usr/bin/env python3
"""Pin every Python dependency to an exact version in requirements/constraints.txt.

`pyproject.toml` names the dependencies in its dependency groups without
versions, so each fresh install took whatever was newest that day: the Docker
image, CI and every local `.venv` could run different code. This resolves the
`dev` group, which includes every other group, and writes the result as a
version-only constraints file. Every `pip install --group ...` in the repository
passes it with `-c`, so all of them install the same versions.

Versions only, no hashes or file URLs: the same pins then serve the production
image (Alpine on amd64 and arm64), CI (Ubuntu) and any developer machine, with
pip choosing the right wheel for each.

The resolve targets the Python version in the Dockerfile's base image, since
that is what ships. Two checks guard what that cannot cover from here:

- pip targets another Python version for wheels and `Requires-Python`, but
  still evaluates environment markers against the interpreter running this
  script. A dependency required only on the target version would be missing
  from the pins, so the script refuses to write them if one exists.
- The image has no compiler, so every runtime pin must have a wheel for both
  production platforms. A pin without one would fail the release build.
"""

import json
from pathlib import Path
import re
import subprocess
import sys
import tempfile
from typing import Any

from packaging.requirements import Requirement
from packaging.utils import canonicalize_name

REPO_ROOT = Path(__file__).resolve().parent.parent
CONSTRAINTS = REPO_ROOT / "requirements" / "constraints.txt"
DOCKERFILE = REPO_ROOT / "Dockerfile"

# The image's platforms, as the wheel tags the Alpine base image accepts on
# each. Alpine's musl also takes wheels built for older musllinux versions,
# which is what `python:3.13-alpine` reports from `packaging.tags.sys_tags()`;
# checking the newest tag alone wrongly rejects them.
PRODUCTION_PLATFORMS = {
    arch: tuple(f"musllinux_1_{minor}_{arch}" for minor in (2, 1, 0))
    for arch in ("x86_64", "aarch64")
}

HEADER = """\
# Exact versions of every Python dependency, resolved for Python {python}, the
# version the Docker image and CI run. Every `pip install --group ...` in this
# repository passes this file with `-c`, so the image, CI and local
# environments install the same versions.
#
# Regenerate with scripts/update-dependencies.sh. Dependabot also bumps
# individual pins in a weekly pull request.
"""


def _say(message: str) -> None:
    """Report progress on standard output.

    Args:
        message: Line to write.
    """
    sys.stdout.write(f"{message}\n")


def _target_python() -> str:
    """Return the Python version of the Dockerfile's backend base image.

    Returns:
        The `major.minor` version, such as `3.13`.

    Raises:
        SystemExit: If the Dockerfile names no `python:X.Y` base image.
    """
    match = re.search(r"^FROM python:(\d+\.\d+)", DOCKERFILE.read_text(), re.MULTILINE)
    if not match:
        sys.exit(f"{DOCKERFILE}: no 'FROM python:X.Y' base image found")
    return match.group(1)


def _pip(*args: str) -> None:
    """Run pip from the interpreter running this script, failing on error.

    Args:
        *args: Arguments passed to `pip`.
    """
    # Every argument is fixed here or derived from this repository's own files.
    subprocess.run([sys.executable, "-m", "pip", *args], check=True, cwd=REPO_ROOT)  # noqa: S603


def _resolve(python: str) -> dict[str, Any]:
    """Resolve the `dev` group for the target Python version without installing.

    Args:
        python: Target `major.minor` Python version.

    Returns:
        pip's installation report.
    """
    with tempfile.TemporaryDirectory() as tmp:
        report = Path(tmp) / "report.json"
        _pip(
            "install",
            "--dry-run",
            "--ignore-installed",
            "--quiet",
            "--report",
            str(report),
            "--python-version",
            python,
            "--only-binary=:all:",
            "--group",
            "dev",
        )
        result: dict[str, Any] = json.loads(report.read_text())
        return result


def _markers_missed(report: dict[str, Any], python: str) -> list[str]:
    """Find dependencies the target Python needs that the resolve left out.

    Args:
        report: pip's installation report.
        python: Target `major.minor` Python version.

    Returns:
        One description per missed dependency, empty when none were missed.
    """
    install = report["install"]
    environment = report["environment"]
    resolved = {canonicalize_name(item["metadata"]["name"]) for item in install}
    target = dict(environment, python_version=python, python_full_version=f"{python}.0")
    missed = []
    for item in install:
        for spec in item["metadata"].get("requires_dist") or []:
            requirement = Requirement(spec)
            marker = requirement.marker
            if marker is None or "extra" in str(marker):
                continue
            if (
                marker.evaluate(target)
                and not marker.evaluate(environment)
                and canonicalize_name(requirement.name) not in resolved
            ):
                missed.append(f"{requirement.name} ({item['metadata']['name']}: {marker})")
    return missed


def _write(report: dict[str, Any], python: str) -> list[str]:
    """Write the constraints file.

    Args:
        report: pip's installation report.
        python: Target `major.minor` Python version.

    Returns:
        The pins written, as `name==version` lines.
    """
    pins = sorted(
        (
            f"{item['metadata']['name']}=={item['metadata']['version']}"
            for item in report["install"]
        ),
        key=str.casefold,
    )
    CONSTRAINTS.parent.mkdir(exist_ok=True)
    CONSTRAINTS.write_text(HEADER.format(python=python) + "".join(f"{pin}\n" for pin in pins))
    return pins


def _check_production_wheels(python: str) -> None:
    """Confirm the runtime group installs from wheels on every production platform.

    Args:
        python: Target `major.minor` Python version.
    """
    for arch, platforms in PRODUCTION_PLATFORMS.items():
        _say(f"Checking runtime wheels for Python {python} on Alpine {arch}...")
        _pip(
            "install",
            "--dry-run",
            "--ignore-installed",
            "--quiet",
            "--python-version",
            python,
            *(arg for platform in platforms for arg in ("--platform", platform)),
            "--only-binary=:all:",
            "--group",
            "runtime",
            "--constraint",
            str(CONSTRAINTS),
        )


def main() -> None:
    """Resolve, guard, write and verify the pins."""
    python = _target_python()
    _say(f"Resolving every dependency group for Python {python}...")
    report = _resolve(python)

    missed = _markers_missed(report, python)
    if missed:
        sys.exit(
            f"Python {python} needs dependencies a resolve from Python "
            f"{sys.version_info.major}.{sys.version_info.minor} cannot see:\n  "
            + "\n  ".join(missed)
            + f"\nRun this script with Python {python} instead."
        )

    pins = _write(report, python)
    _say(f"Wrote {len(pins)} pins to {CONSTRAINTS.relative_to(REPO_ROOT)}.")
    _check_production_wheels(python)


if __name__ == "__main__":
    main()
