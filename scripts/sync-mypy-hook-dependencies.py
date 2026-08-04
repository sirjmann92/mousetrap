#!/usr/bin/env python3
"""Synchronize the prek mypy hook dependencies from pyproject.toml."""

import argparse
from pathlib import Path
import re
import sys
import tomllib


def _dependency_groups(pyproject_path: Path) -> list[str]:
    """Return dependencies needed to type-check the backend and its tests."""
    with pyproject_path.open("rb") as file:
        project = tomllib.load(file)

    groups = project.get("dependency-groups")
    if not isinstance(groups, dict):
        raise TypeError(f"{pyproject_path}: expected [dependency-groups]")

    runtime = groups.get("runtime")
    if not isinstance(runtime, list) or not all(isinstance(item, str) for item in runtime):
        raise TypeError(f"{pyproject_path}: expected flat string dependency group 'runtime'")
    typecheck = groups.get("typecheck")
    if not isinstance(typecheck, list):
        raise TypeError(f"{pyproject_path}: expected dependency group 'typecheck'")
    typecheck_dependencies: list[str] = []
    runtime_includes = 0
    for item in typecheck:
        if isinstance(item, str):
            typecheck_dependencies.append(item)
        elif item == {"include-group": "runtime"}:
            runtime_includes += 1
        else:
            raise ValueError(f"{pyproject_path}: invalid entry in dependency group 'typecheck'")
    if runtime_includes != 1:
        raise ValueError(
            f"{pyproject_path}: expected typecheck to include runtime exactly once; "
            f"found {runtime_includes}"
        )

    dependencies = sorted((*runtime, *typecheck_dependencies), key=str.casefold)
    if len(dependencies) != len(set(dependencies)):
        raise ValueError(f"{pyproject_path}: duplicate derived mypy hook dependency")
    return dependencies


def synchronize(pyproject_path: Path, prek_path: Path) -> bool:
    """Synchronize the mypy hook dependency block and report whether it changed."""
    dependencies = _dependency_groups(pyproject_path)
    input_text = prek_path.read_text()
    with prek_path.open("rb") as file:
        prek = tomllib.load(file)

    hooks = [
        hook
        for repo in prek.get("repos", [])
        if isinstance(repo, dict)
        for hook in repo.get("hooks", [])
        if isinstance(hook, dict) and hook.get("id") == "mypy"
    ]
    if len(hooks) != 1:
        raise ValueError(f"{prek_path}: expected exactly one mypy hook; found {len(hooks)}")
    current = hooks[0].get("additional_dependencies")
    if not isinstance(current, list) or not all(isinstance(item, str) for item in current):
        raise ValueError(f"{prek_path}: expected mypy additional_dependencies list")
    hook_pattern = re.compile(
        r'(?ms)^\[\[repos\.hooks\]\]\n(?:(?!^\[\[).)*?^id = "mypy"\n'
        r"(?:(?!^\[\[).)*?(?=^\[\[|\Z)"
    )
    hook_matches = list(hook_pattern.finditer(input_text))
    if len(hook_matches) != 1:
        count = len(hook_matches)
        raise ValueError(f"{prek_path}: expected exactly one textual mypy hook; found {count}")
    hook_text = hook_matches[0].group()
    dependency_pattern = re.compile(r"(?ms)^additional_dependencies = \[\n.*?^\]\n")
    dependency_matches = list(dependency_pattern.finditer(hook_text))
    if len(dependency_matches) != 1:
        raise ValueError(
            f"{prek_path}: expected exactly one mypy dependency block; "
            f"found {len(dependency_matches)}"
        )
    if current == dependencies:
        return False

    replacement = "additional_dependencies = [\n"
    replacement += "".join(f'  "{dependency}",\n' for dependency in dependencies)
    replacement += "]\n"
    start = hook_matches[0].start() + dependency_matches[0].start()
    end = hook_matches[0].start() + dependency_matches[0].end()
    prek_path.write_text(input_text[:start] + replacement + input_text[end:])
    return True


def main() -> None:
    """Parse arguments and synchronize the configured files."""
    parser = argparse.ArgumentParser()
    parser.add_argument("pyproject", nargs="?", type=Path, default=Path("pyproject.toml"))
    parser.add_argument("prek", nargs="?", type=Path, default=Path("prek.toml"))
    args = parser.parse_args()
    try:
        changed = synchronize(args.pyproject, args.prek)
    except (OSError, tomllib.TOMLDecodeError, TypeError, ValueError) as error:
        raise SystemExit(f"Cannot synchronize mypy hook dependencies: {error}") from error
    message = "Updated dependencies." if changed else "Mypy hook dependencies are current."
    sys.stdout.write(f"{message}\n")


if __name__ == "__main__":
    main()
