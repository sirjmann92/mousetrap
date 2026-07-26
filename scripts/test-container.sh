#!/bin/sh
set -eu

# Build and exercise the production Docker image through its public HTTP port.
# The container, image, and temporary configuration directory are always cleaned up.

SCRIPT_DIR="$(CDPATH='' cd -P "$(dirname "$0")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
FRONTEND_DIR="$REPO_ROOT/frontend"
RUN_SUFFIX="${E2E_RUN_ID:-$$}"
CONTAINER_NAME="${E2E_CONTAINER_NAME:-mousetrap-e2e-$RUN_SUFFIX}"
IMAGE_NAME="${E2E_IMAGE_NAME:-mousetrap-e2e:local-$RUN_SUFFIX}"
ARTIFACT_DIR="${E2E_ARTIFACT_DIR:-$FRONTEND_DIR/test-results/container-diagnostics-$RUN_SUFFIX}"
CONFIG_DIR="${E2E_CONFIG_DIR:-}"
OWNS_CONFIG_DIR=false
OWNS_TEMP_ROOT=false
IMAGE_BUILT=false
CONTAINER_STARTED=false
PLAYWRIGHT_LOG=""
BASE_URL=""
CAPTURE_DIAGNOSTICS=false

if [ -n "${RUNNER_TEMP:-}" ]; then
  TEMP_ROOT="$RUNNER_TEMP"
else
  # Colima and Docker Desktop reliably share the checked-out repository, while
  # macOS system temporary directories such as /var/folders may exist only on
  # the host and resolve to a different path inside the Docker VM.
  TEMP_ROOT="$REPO_ROOT/.e2e-tmp"
  OWNS_TEMP_ROOT=true
fi

collect_failure_diagnostics() {
  mkdir -p "$ARTIFACT_DIR"

  if [ -n "$PLAYWRIGHT_LOG" ] && [ -f "$PLAYWRIGHT_LOG" ]; then
    cp "$PLAYWRIGHT_LOG" "$ARTIFACT_DIR/playwright-container.log"
  fi

  docker ps -a \
    --filter 'name=^/'"$CONTAINER_NAME"'$' \
    >"$ARTIFACT_DIR/docker-ps.txt" 2>&1 || true
  docker inspect "$CONTAINER_NAME" \
    >"$ARTIFACT_DIR/container-inspect.json" 2>&1 || true
  docker logs "$CONTAINER_NAME" \
    >"$ARTIFACT_DIR/container.log" 2>&1 || true

  if [ -n "$BASE_URL" ]; then
    printf '%s\n' "$BASE_URL" >"$ARTIFACT_DIR/base-url.txt"
  fi

  echo "Container failure diagnostics: $ARTIFACT_DIR" >&2
}

cleanup() {
  status=$?
  trap - 0 HUP INT TERM

  if [ "$status" -ne 0 ] && [ "$CAPTURE_DIAGNOSTICS" = true ]; then
    collect_failure_diagnostics
  fi

  if [ "$CONTAINER_STARTED" = true ]; then
    docker rm --force "$CONTAINER_NAME" >/dev/null 2>&1 || true
  fi
  if [ "$IMAGE_BUILT" = true ]; then
    docker image rm "$IMAGE_NAME" >/dev/null 2>&1 || true
  fi
  if [ "$OWNS_CONFIG_DIR" = true ]; then
    case "$CONFIG_DIR" in
      "$TEMP_ROOT"/mousetrap-e2e-config.*)
        rm -rf "$CONFIG_DIR"
        ;;
      *)
        echo "Refusing to remove unexpected temporary directory: $CONFIG_DIR" >&2
        ;;
    esac
  fi
  if [ "$OWNS_TEMP_ROOT" = true ]; then
    rmdir "$TEMP_ROOT" 2>/dev/null || true
  fi

  exit "$status"
}

wait_for_health() {
  attempts=0
  while [ "$attempts" -lt 60 ]; do
    if curl --fail --silent "$BASE_URL/api/version" >/dev/null; then
      return 0
    fi
    if ! docker inspect --format '{{.State.Running}}' "$CONTAINER_NAME" 2>/dev/null |
      grep -qx true; then
      echo "Container stopped before becoming healthy." >&2
      return 1
    fi
    attempts=$((attempts + 1))
    sleep 2
  done

  echo "Timed out waiting for $BASE_URL/api/version" >&2
  return 1
}

refresh_base_url() {
  published_address="$(docker port "$CONTAINER_NAME" 39842/tcp)"
  published_port="${published_address##*:}"
  case "$published_port" in
    "" | *[!0-9]*)
      echo "Could not determine the container's published port: $published_address" >&2
      return 1
      ;;
  esac
  BASE_URL="http://127.0.0.1:$published_port"
}

create_config_dir() {
  temp_attempt=0
  while [ "$temp_attempt" -lt 10 ]; do
    temp_candidate="$TEMP_ROOT/mousetrap-e2e-config.$$.$temp_attempt"
    if (umask 077 && mkdir "$temp_candidate") 2>/dev/null; then
      printf '%s\n' "$temp_candidate"
      return 0
    fi
    temp_attempt=$((temp_attempt + 1))
  done

  echo "Could not create a temporary configuration directory under $TEMP_ROOT." >&2
  return 1
}

trap cleanup 0 HUP INT TERM

if [ "$#" -ne 0 ]; then
  echo "Usage: ./scripts/test-container.sh" >&2
  exit 2
fi
if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required for the production container smoke test." >&2
  exit 1
fi
if ! command -v curl >/dev/null 2>&1; then
  echo "curl is required for the production container smoke test." >&2
  exit 1
fi
if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required for the production container smoke test." >&2
  exit 1
fi
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
  echo "Missing frontend dependencies. Run ./scripts/setup.sh before running tests." >&2
  exit 1
fi
if ! docker info >/dev/null 2>&1; then
  echo "The Docker daemon is not available." >&2
  exit 1
fi
CAPTURE_DIAGNOSTICS=true

if [ -z "$CONFIG_DIR" ]; then
  mkdir -p "$TEMP_ROOT"
  CONFIG_DIR="$(create_config_dir)"
  OWNS_CONFIG_DIR=true
fi
chmod 0777 "$CONFIG_DIR"
PLAYWRIGHT_LOG="$CONFIG_DIR/playwright-container.log"

echo "Building production test image $IMAGE_NAME..."
docker build --tag "$IMAGE_NAME" "$REPO_ROOT"
IMAGE_BUILT=true

echo "Starting production test container $CONTAINER_NAME..."
docker run --detach \
  --name "$CONTAINER_NAME" \
  --publish 127.0.0.1::39842 \
  --volume "$CONFIG_DIR:/config" \
  "$IMAGE_NAME" >/dev/null
CONTAINER_STARTED=true

refresh_base_url

echo "Waiting for the production API at $BASE_URL..."
wait_for_health

echo "Verifying mounted configuration and container restart persistence..."
curl --fail --silent --show-error \
  --header 'Content-Type: application/json' \
  --data '{"label":"container-smoke"}' \
  "$BASE_URL/api/session/save" >/dev/null
curl --fail --silent --show-error \
  "$BASE_URL/api/session/container-smoke" >/dev/null
test -s "$CONFIG_DIR/session-container-smoke.yaml"
curl --fail --silent --show-error \
  --request DELETE \
  "$BASE_URL/api/session/delete/container-smoke" >/dev/null
curl --fail --silent --show-error \
  --header 'Content-Type: application/json' \
  --data '{"label":"container-smoke-proxy","host":"127.0.0.1","port":8080}' \
  "$BASE_URL/api/proxies" >/dev/null
docker restart "$CONTAINER_NAME" >/dev/null
refresh_base_url
wait_for_health

echo "Running production container Playwright tests..."
if E2E_BASE_URL="$BASE_URL" npm --prefix "$FRONTEND_DIR" run test:e2e:container \
  >"$PLAYWRIGHT_LOG" 2>&1; then
  cat "$PLAYWRIGHT_LOG"
else
  cat "$PLAYWRIGHT_LOG" >&2
  exit 1
fi
