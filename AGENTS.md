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
- `pyproject.toml`: Python dependencies plus pytest, coverage, mypy, and Ruff
  configuration.
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

## Local Setup

Set up both backend and frontend development environments:

```bash
./scripts/setup.sh
```

The helper requires Python 3.13 or newer, Node.js 24.18.0 or newer, and npm
11.16.0 or newer. It creates or reuses `.venv`, installs the Python `dev` dependency
group, and runs `npm ci` against the frontend lockfile.

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

The helper updates available Python and frontend development dependencies and
keeps their generated tool configuration synchronized. Review configuration and
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

## Testing Expectations

- Add or update pytest integration or workflow coverage for changed backend behavior,
  especially around persistence, recovery, automation rules, and API responses.
- Add or update Playwright E2E coverage for frontend behavior changes. Prefer
  accessible role and label locators; use a minimal `data-testid` only when no
  stable semantic locator exists.
- Add container smoke coverage for production-image, startup, or persistence changes.
- For frontend changes, at minimum run lint and TypeScript checks.
- If a validation command cannot be run, note the exact reason in the handoff.

## Security and Privacy

- Treat MAM session IDs, cookies, API tokens, SMTP credentials, webhook URLs, and
  proxy credentials as secrets.
- Do not print raw config files or request/response bodies if they may include
  secrets.
- Keep Docker socket operations limited to the port-monitoring feature and avoid
  expanding socket permissions without documentation and user-visible warnings.

## Releases and Versioning

Publishing is automatic: a push to `main` runs `Tests`, and a successful run
triggers `Publish Docker image`, which builds the image, derives the next
version, and creates the GitHub Release. Release versions come only from git
tags — `frontend/package.json`'s `version` field is inert and must not be
treated as the release version.

The default is a patch bump. To cut a larger release, include a keyword as a
standalone word in a commit message landing since the previous release:

| Keyword  | Effect on `X.Y.Z` | Use for         |
| -------- | ----------------- | --------------- |
| `#major` | `(X+1).0.0`       | Breaking change |
| `#minor` | `X.(Y+1).0`       | New feature     |
| *none*   | `X.Y.(Z+1)`       | Everything else |

- Only **commit messages** are scanned, never file contents, so documenting
  the keywords in a file like this one is safe.
- Writing a keyword into a commit message *about* the mechanism will promote
  that release. Refer to them indirectly ("hash-minor") when that is not
  intended.
- Keywords are matched as whole words, so `#minority`, `#majorly` and issue
  references such as `#123` do not promote a release.
- `#major` wins when both appear.
- Squash merges keep the PR title and the squashed commit bodies, so a
  contributor can signal intent in a commit and a reviewer can add or remove
  the keyword in the squash message at merge time. **When merging, check the
  squash message for an unintended keyword.**
- A release scans every commit since the last tag, so one flagged commit
  promotes the whole batch.

To merge several pull requests under a single release instead of one release
each, suppress the publish for the duration and then trigger it once:

```bash
gh workflow disable "Publish Docker image"   # before merging
# ...merge the pull requests...
gh workflow enable "Publish Docker image"
gh run list --workflow=Tests --branch main --limit 1   # confirm Tests passed
gh workflow run "Publish Docker image"
```

Confirm `Tests` succeeded on the merged `main` before the final step:
`workflow_dispatch` is an unconditional override and does not check it.

## Pull Request Handoff

When preparing a change for review, include:

- Summary of user-visible behavior changes.
- Backend, frontend, and documentation files touched.
- Validation commands run and their results.
- Any deployment or data-compatibility notes.
