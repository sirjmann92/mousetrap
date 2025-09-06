#!/bin/sh
set -e

# This script must run as root to manage users/groups, then drops to appuser
# Container explicitly starts as root (USER root in Dockerfile) to ensure
# compatibility with unRAID and other platforms that may force non-root startup

# Set PUID/PGID, defaulting to 1000 if not provided
PUID=${PUID:-1000}
PGID=${PGID:-1000}
USERNAME=appuser
GROUPNAME=appgroup

# Change appuser UID/GID if needed - delete user first to avoid group conflicts
if [ "$(id -u "$USERNAME" 2>/dev/null)" != "$PUID" ] || [ "$(id -g "$USERNAME" 2>/dev/null)" != "$PGID" ]; then
	# Delete user first to avoid "still has group as primary group" error
	if id "$USERNAME" >/dev/null 2>&1; then
		deluser "$USERNAME"
	fi
fi

# Change appgroup GID if needed - can now safely delete group after user is removed
if [ "$(getent group "$GROUPNAME" | cut -d: -f3 2>/dev/null)" != "$PGID" ]; then
	if getent group "$GROUPNAME" >/dev/null 2>&1; then
		delgroup "$GROUPNAME"
	fi
	addgroup -g "$PGID" "$GROUPNAME"
fi

# Re-create user if it was deleted or doesn't exist
if ! id "$USERNAME" >/dev/null 2>&1; then
	adduser -u "$PUID" -G "$GROUPNAME" -D -s /bin/sh "$USERNAME"
fi




# If DOCKER_GID is set, update/create docker group and add appuser
if [ -n "$DOCKER_GID" ]; then
	if getent group docker >/dev/null; then
		delgroup docker
	fi
	addgroup -g "$DOCKER_GID" docker
	adduser "$USERNAME" docker
fi

# Ensure ownership of /app/logs and /config if they exist
chown -R "$PUID":"$PGID" /app/logs 2>/dev/null || true
chown -R "$PUID":"$PGID" /config 2>/dev/null || true

# Normalize LOGLEVEL to lowercase and map common values
case "${LOGLEVEL:-info}" in
	CRITICAL|critical) uvicorn_loglevel=critical ;;
	ERROR|error) uvicorn_loglevel=error ;;
	WARNING|warning|WARN|warn) uvicorn_loglevel=warning ;;
	INFO|info) uvicorn_loglevel=info ;;
	DEBUG|debug) uvicorn_loglevel=debug ;;
	TRACE|trace) uvicorn_loglevel=trace ;;
	*) uvicorn_loglevel=info ;;
esac


# Generate logconfig.yaml from template at runtime for dynamic log level
if [ -f /app/logconfig.yaml.template ]; then
	export LOGLEVEL="${LOGLEVEL:-INFO}"
	if ! command -v envsubst >/dev/null 2>&1; then
		echo "envsubst is required but not found. Please install gettext." >&2
		exit 1
	fi
	envsubst < /app/logconfig.yaml.template > /app/logconfig.yaml
fi

# Start Uvicorn with dynamic log config if present
if [ -f /app/logconfig.yaml ]; then
	exec su-exec "$USERNAME" uvicorn app:app --host 0.0.0.0 --port "${PORT:-39842}" --no-access-log --log-config /app/logconfig.yaml
else
	exec su-exec "$USERNAME" uvicorn app:app --host 0.0.0.0 --port "${PORT:-39842}" --no-access-log --log-level "$uvicorn_loglevel"
fi
