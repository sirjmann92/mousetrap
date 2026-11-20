# AGENTS.md

This file gives coding agents the project-specific context needed to work on
MouseTrap. It is intended to stand alone for the upstream repository.

## Project Overview

MouseTrap is a Docker-first web app for automating MyAnonaMouse seedbox and
account management.

- Backend: Python 3.13, FastAPI, YAML-backed configuration/state files, and a
  SQLite-backed event log.
- Frontend: React 19, Vite, Material UI, TypeScript checking, Biome formatting.
- Runtime: Docker image serving the built frontend and FastAPI backend on port
  `39842`.
- Persistent data: user configuration and state default to `/config` in the
  container and can be relocated with the `CONFIG_DIR` environment variable.

## Repository Layout

- `backend/`: FastAPI app, integrations, automation logic, config/state helpers,
  notifications, proxy handling, event log, and port monitoring.
- `frontend/`: React/Vite application.
- `tests/backend/`: Python pytest suite, including integration and workflow coverage.
- `frontend/e2e/`: Playwright end-to-end coverage.
- `docs/`: user and implementation documentation.
- `scripts/`: setup, test-gate, container-smoke, coverage-summary, lint, backend
  launch, and dependency-maintenance helpers; production containers use `start.sh`.
- `.github/workflows/`: backend, development Playwright, Docker smoke, and
  coverage-reporting workflows.
- `Dockerfile`: production image build.
- `pyproject.toml`: Python project metadata, including the release version,
  and dependencies plus uv, pytest, coverage, mypy, and Ruff configuration.
- `uv.lock`: exact version and hashes of every Python dependency.
- `prek.toml`: repository hook configuration.

## General Working Rules

- Prefer root-cause fixes over narrow patches that only mask symptoms.
- Keep changes scoped to the requested behavior and adjacent code needed to make
  it correct.
- Preserve user data compatibility. Treat files in the configured persistent
  data directory (default `/config`) as production data that may already exist
  in user deployments.
- Do not introduce migrations or schema changes without backward-compatible
  loading behavior and clear docs.
- Avoid broad rewrites unless the requested change explicitly calls for them.
- Do not commit generated caches, virtual environments, coverage output, build
  output, or local config files.
- Use `main` as the default branch name.

## Backend Guidelines

- Add type annotations to new or changed Python functions and methods.
- Keep imports at the top of files and rely on existing module boundaries before
  adding new abstractions.
- Add or update docstrings for all files, classes and methods, including private methods and nested methods. Method docstrings must follow the Google Style.
- Prefer `pathlib.Path` for filesystem work.
- For YAML-backed configuration or state, preserve existing fields when possible
  and handle missing, empty, or malformed files gracefully.
- Writes to persistent config/state should be durable. Avoid truncating in-place
  writes for important YAML files; use atomic write patterns when changing those
  paths.
- Catch specific exception types where practical and log enough context for a
  user to diagnose deployment issues.
- Do not log credentials, session IDs, cookies, API keys, proxy passwords, or MAM
  identifiers that could grant account access. Use existing redaction utilities
  where available.
- Keep Docker socket access optional. Port monitoring must degrade cleanly when
  Docker is unavailable or not mounted.

## Frontend Guidelines

- Follow the existing React component style in `frontend/src`.
- Use Material UI components consistently with the current UI.
- Keep API calls aligned with the existing backend routes and response shapes.
- Run TypeScript and Biome checks for frontend changes.
- Do not add a new state-management library unless a change clearly requires it.
- Keep forms resilient to missing or partial backend data.

## Documentation Guidelines

- Update `README.md` or files in `docs/` when changing user-visible behavior,
  configuration, environment variables, deployment steps, or troubleshooting
  expectations.
- Keep examples Docker-focused unless the change is specifically about local
  development.
- Redact secrets in logs, examples, screenshots, and troubleshooting snippets.

**Any change to an API route updates `docs/api-reference.md` in the same
change.** That means a new or removed endpoint, a changed path or method, a
changed request or response shape, and a new status code a caller can receive.

The reference drifted badly once because this was left implicit: an audit
against the running routes found 13 documented endpoints that did not exist and
33 real ones that were undocumented, out of 49. Request and response bodies had
drifted as far as the paths, and two places claimed `/api/status` returns the
MAM ID, which it never has — documentation wrong in a direction that invites
someone to "fix" the code to match it.

Verify the shape rather than describing it from memory or from the handler
name. Read the code, or call the endpoint and dump the keys. To check nothing
has drifted, compare the documented endpoints against the routes FastAPI
actually registers:

```python
from backend.app import app
{f"{m.upper()} {p}" for p, ops in app.openapi()["paths"].items() for m in ops}
```

## Local Setup

Set up both backend and frontend development environments:

```bash
./scripts/setup.sh
```

The helper requires uv, Node.js 24.18.0 or newer, and npm 11.16.0 or newer. It
runs `uv sync`, which creates `.venv` with the Python version `pyproject.toml`
requires and installs the project and the `dev` dependency group at the locked
versions, and runs `npm ci` against the frontend lockfile. Rerunning it brings
an existing `.venv` back in line with the lock, removing anything the lock does
not name.

### Python dependency pins

`pyproject.toml` is a uv project. The backend's runtime dependencies are in
`project.dependencies` and the development tools are in `[dependency-groups]`,
all named without versions. `uv.lock` is the single version source: it records
the exact version and the hashes of every Python dependency, resolved together
for Python 3.13, the only version `requires-python` accepts.

**Every install in the Dockerfile and the CI workflows is `uv sync --locked`**,
with `--no-dev` in the Dockerfile and the group each CI job needs. `--locked`
refuses to install when `uv.lock` no longer matches `pyproject.toml`, so a
dependency added without re-locking fails every job that installs. Use the same
command at any new install site. The local scripts use plain `uv sync` and
`uv run`, which re-lock after a `pyproject.toml` edit; commit the resulting
`uv.lock` change with it.

Without a lock, each fresh install took whatever was newest that day, so the
Docker image, CI and local environments ran different code. A FastAPI release
once silently changed what `app.routes` returns and broke the API drift check in
Documentation Guidelines, while a stale local environment kept it looking
correct. `uv sync` installs exactly what the lock names and removes everything
else, so a stale environment cannot hide a change like that.

`uv.lock` is generated; do not edit it by hand. Run `uv lock` after changing
`pyproject.toml`, `uv lock --upgrade-package <name>` to move one dependency, or
`./scripts/update-dependencies.sh` to move all of them.

The image has no compiler, so every runtime dependency must have a wheel for
Alpine on both production platforms. `[tool.uv] required-environments` names
Linux on `x86_64` and `aarch64`, and `minimum-libc-version` sets the libc those
wheels must support to musl 1.2, the series the Alpine base image ships.
`uv lock` then fails when a dependency is published only as wheels and has none
for musl on either platform. A dependency that also publishes a source
distribution still locks without such a wheel, so the two `musl-wheels` prek
hooks resolve the runtime install for each platform with building forbidden,
whenever `pyproject.toml` or `uv.lock` changes. `minimum-libc-version` is a uv
preview feature, enabled by name in `preview-features`.

`[tool.uv] required-version` sets the oldest uv the project accepts.
`astral-sh/setup-uv` reads it in CI, and the Dockerfile copies one uv release
from the uv image by digest.

The prek mypy hook installs its own copy of the typecheck and runtime packages,
by name only. They are not pinned there, because Dependabot does not edit
`prek.toml` and pins in two places would drift apart.

The root `package.json` forwards frontend commands into `frontend/`.

For local source development:

```bash
# Start only FastAPI with reload.
npm run backend

# Start FastAPI and Vite together with reload.
npm run dev
```

The local backend helper defaults `CONFIG_DIR` to the repository's ignored
`config/` directory. An explicit `CONFIG_DIR` or per-file path override takes
precedence and can direct configuration, session state, notifications, proxies,
port-monitor state, and the SQLite event log anywhere, including production's
`/config`; check overrides before running local commands. Use
`VITE_BACKEND_PORT` to change the backend port for the combined `npm run dev`
command; the helper also accepts `PORT` when starting only the backend. Do not
use `scripts/start-backend.sh` as a production entrypoint.

For routine dependency maintenance, run:

```bash
./scripts/update-dependencies.sh
```

The helper re-resolves the newest Python dependencies and rewrites `uv.lock`,
updates the frontend dependencies, and keeps their generated tool configuration
synchronized. Review configuration and
lockfile changes, then run `./scripts/lint.sh` before committing.

## Validation Commands

Run the checks that match the files you changed. For cross-cutting changes, run
the same repository-wide checks as CI. Some hooks apply safe fixes and
formatting changes, so review the working tree afterward.

```bash
./scripts/lint.sh
```

Complete local test gate:

```bash
./scripts/test.sh              # Backend pytest plus development Playwright E2E.
./scripts/test.sh --full       # Default gate plus production container smoke test.
./scripts/test.sh --container  # Production container smoke test only.
```

The default and `--full` modes write coverage separately to `coverage/backend/`
for backend pytest and `coverage/frontend/` for Playwright E2E.

### Dependency advisories

CI's `Dependency review` check fails a pull request only for a vulnerable
dependency that the pull request itself adds or changes. Do not put back a bare
`npm audit` (or any whole-lockfile audit) as a pull request gate: it failed
every pull request, including Python-only ones, whenever an advisory was
published against a package already on `main`, and one advisory had no fixed
release at all. Advisories against existing dependencies arrive as Dependabot
alerts and security update pull requests. `./scripts/lint.sh` audits only the
dependencies that ship (`npm audit --omit=dev`).

## Testing Expectations

- Add or update pytest integration or workflow coverage for changed backend behavior,
  especially around persistence, recovery, automation rules, and API responses.
- Add or update Playwright E2E coverage for frontend behavior changes. Prefer
  accessible role and label locators; use a minimal `data-testid` only when no
  stable semantic locator exists.
- Add container smoke coverage for production-image, startup, or persistence changes.
- For frontend changes and for the JavaScript helpers under `scripts/`, at
  minimum run lint and TypeScript checks. The frontend TypeScript project covers
  both.
- If a validation command cannot be run, note the exact reason in the handoff.

## Security and Privacy

- Treat MAM session IDs, cookies, API tokens, SMTP credentials, webhook URLs, and
  proxy credentials as secrets.
- Do not print raw config files or request/response bodies if they may include
  secrets.
- Keep Docker socket operations limited to the port-monitoring feature and avoid
  expanding socket permissions without documentation and user-visible warnings.

## Reviewing Pull Requests

When reviewing a contributor's pull request, verify the claims rather than the
prose: reproduce a reported defect against the pre-fix code, re-derive any
measurement the description asserts, and run the checks that match the files
touched. A description that reads convincingly is not evidence.

Leave a short comment before merging — two to four lines, saying **what was
independently verified and how**, not that it looks good:

> Verified: reproduced the failure on pre-fix code (both tests fail, pass after).
> Confirmed `buy_vip`/`buy_wedge` are byte-identical substitutions, so the change
> is confined to one function. mypy and the backend suite are clean.

This is worth more than an approval stamp on evidence-heavy pull requests: it
tells the contributor which of their claims were checked, and it records why the
change was accepted for whoever reads the pull request later. Say so explicitly
when a claim could not be verified, or when verification went further than the
author could — for example building an architecture the author had no runner for.

Skip the comment for genuinely trivial changes such as a one-line setting.

## Landing Your Own Changes

Open a pull request for your own changes rather than pushing to `main`, and
merge it once its checks pass. `gh release create --generate-notes` builds the
release notes from merged pull requests, so a direct push to `main` ships in the
release but appears nowhere in its notes — it shows up only in the "Full
Changelog" commit range. Anything that should be visible to users in a release
needs a pull request.

Direct pushes remain appropriate for documentation-only changes, which are
excluded from `Tests` by `paths-ignore` and therefore cut no release at all.

## Releases and Versioning

**`Publish Docker image` stays disabled. Do not enable it except to cut a
release the maintainer has asked for, and disable it again afterwards.**
Check its state before merging anything; if it is enabled and no release was
requested, disable it and say so.

That is a standing instruction, not a per-batch technique. Left enabled, the
workflow publishes on *every* merge to `main`: a push runs `Tests`, and a
successful run triggers `Publish Docker image`, which builds the image, pushes
it under the version `pyproject.toml` carries, creates the GitHub Release, and
notifies everyone watching the repository. Each unwanted merge is a publish
that cannot be recalled.

This has already gone wrong once. `v2.4.3` was cut unintentionally because
the workflow was re-enabled to dispatch `v2.4.2` and never disabled again;
the next merge published itself. Nothing was broken by it, but the choice of
when to release was lost.

It matters more now that Dependabot security updates are on, because
Dependabot opens pull requests unprompted, for GitHub Actions, the Python
pins and the frontend lockfile. A security fix merged on a quiet
afternoon would publish a release nobody asked for.

Release versions come only from `project.version` in `pyproject.toml`. The
backend reports it at `/api/version` from the installed distribution's
metadata, and the publish workflow tags the image and the GitHub Release with
what `uv version --short` prints. `frontend/package.json`'s `version` field is
inert and must not be treated as the release version.

A release is a pull request that bumps the version:

```bash
uv version --bump patch
```

| Bump    | Effect on `X.Y.Z` | Use for         |
| ------- | ----------------- | --------------- |
| `major` | `(X+1).0.0`       | Breaking change |
| `minor` | `X.(Y+1).0`       | New feature     |
| `patch` | `X.Y.(Z+1)`       | Everything else |

- `uv version --bump` rewrites the version in `pyproject.toml` and in `uv.lock`.
  Commit both.
- Commit messages do not affect the version. Nothing scans them.
- The publish workflow does not bump anything. It publishes the version `main`
  carries, so the bump has to merge before the workflow is enabled. **Check
  that the version has no tag yet before publishing.**

Merge freely while it is disabled — that is the normal state, and any number
of pull requests can land without publishing anything. When the maintainer
asks for a release:

```bash
git tag --list "v$(uv version --short)"                 # expect no output: not released yet
gh workflow list | grep -i publish                      # expect it absent, i.e. disabled
gh run list --workflow=Tests --branch main --limit 1    # Tests must be green on HEAD
gh workflow enable "Publish Docker image"
gh workflow run "Publish Docker image"
# ...confirm the release, then:
gh workflow disable "Publish Docker image"
```

Two ordering points, both learned the hard way:

- **Wait for `Tests` to reach a terminal state before enabling.** Enabling
  while a run is in flight lets its completion event fire against a now-live
  workflow and publishes early.
- **Confirm `Tests` passed before dispatching.** `workflow_dispatch` is an
  unconditional override and does not check it.

Fetch tags before reporting what is or is not released. `git pull` does not
fetch them, so `git log <tag>..origin/main` against a stale tag list will
report commits as unreleased when they have already shipped.

## Pull Request Handoff

When preparing a change for review, include:

- Summary of user-visible behavior changes.
- Backend, frontend, and documentation files touched.
- Validation commands run and their results.
- Any deployment or data-compatibility notes.
