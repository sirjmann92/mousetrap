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
- `tests/`: Python pytest suite.
- `docs/`: user and implementation documentation.
- `scripts/start-backend.sh`: local-only FastAPI launcher used by
  `npm run backend` and `npm run dev`; production containers use `start.sh`.
- `scripts/setup.sh`: creates the Python virtual environment and installs
  Python and frontend development dependencies.
- `scripts/lint.sh`: repository-wide lint, format, and type-check wrapper matching
  the GitHub lint workflow.
- `Dockerfile`: production image build.
- `pyproject.toml`: Python dependencies plus pytest, coverage, mypy, and Ruff
  configuration.
- `.pre-commit-config.yaml`: repository hook configuration.

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

## Local Setup

Set up both backend and frontend development environments:

```bash
./scripts/setup.sh
```

The helper requires Python 3.13 or newer and Node.js 22.20.0 or newer. It
creates or reuses `.venv`, installs the Python `dev` dependency group, and runs
`npm ci` against the frontend lockfile.

The root `package.json` forwards frontend commands into `frontend/`.

For local source development:

```bash
# Start only FastAPI with reload.
npm run backend

# Start FastAPI and Vite together with reload.
npm run dev
```

The local backend helper defaults `CONFIG_DIR` to the repository's ignored
`config/` directory so development never writes configuration, session state,
notifications, proxies, port-monitor state, or the SQLite event log to
production's `/config` path. Preserve explicit `CONFIG_DIR` and per-file path
overrides when changing the helper. Use `VITE_BACKEND_PORT` to change the
backend port for the combined `npm run dev` command; the helper also accepts
`PORT` when starting only the backend. Do not use `scripts/start-backend.sh` as
a production entrypoint.

For routine dependency maintenance, run:

```bash
./scripts/update-dependencies.sh
```

When `.venv` exists, the update helper upgrades its Python `dev` dependency
group and verifies it with `pip check`; otherwise it skips that step. It updates
pre-commit hooks through the project or global installation when available,
updates frontend dependencies within the constraints in `frontend/package.json`,
normalizes the lockfile, synchronizes `frontend/node_modules` with a clean
install, and audits the resulting npm dependency tree. Review its configuration
and lockfile changes before committing.

## Validation Commands

Run the checks that match the files you changed. For cross-cutting changes, run
the same repository-wide checks as CI. Some hooks apply safe fixes and
formatting changes, so review the working tree afterward.

```bash
./scripts/lint.sh
```

Python tests:

```bash
.venv/bin/pytest
```

Python lint and format:

```bash
.venv/bin/ruff check .
.venv/bin/ruff format --check .
```

Python type checking:

```bash
.venv/bin/mypy backend tests
```

Frontend lint:

```bash
npm run lint
```

Frontend type check:

```bash
npm run tsc
```

Frontend production build:

```bash
npm run build
```

Pre-commit hooks:

```bash
.venv/bin/pre-commit run --all-files
```

Docker build smoke check:

```bash
docker build -t mousetrap:local .
```

## Testing Expectations

- Add or update pytest coverage for changed backend behavior.
- Use focused tests for bug fixes, especially around persistence, recovery,
  automation rules, and API response behavior.
- For frontend changes, at minimum run lint and TypeScript checks. Add component
  or integration tests if the repository gains a frontend test harness.
- If a validation command cannot be run, note the exact reason in the handoff.

## Security and Privacy

- Treat MAM session IDs, cookies, API tokens, SMTP credentials, webhook URLs, and
  proxy credentials as secrets.
- Do not print raw config files or request/response bodies if they may include
  secrets.
- Keep Docker socket operations limited to the port-monitoring feature and avoid
  expanding socket permissions without documentation and user-visible warnings.

## Pull Request Handoff

When preparing a change for review, include:

- Summary of user-visible behavior changes.
- Backend, frontend, and documentation files touched.
- Validation commands run and their results.
- Any deployment or data-compatibility notes.
