#!/bin/sh
set -e

# Set PUID/PGID, defaulting to 1000 if not provided
PUID=${PUID:-1000}
PGID=${PGID:-1000}
USERNAME=appuser
GROUPNAME=appgroup

# Change appgroup GID if needed
if [ "$(getent group "$GROUPNAME" | cut -d: -f3)" != "$PGID" ]; then
	delgroup "$GROUPNAME"
	addgroup -g "$PGID" "$GROUPNAME"
fi

# Change appuser UID/GID if needed
if [ "$(id -u "$USERNAME")" != "$PUID" ] || [ "$(id -g "$USERNAME")" != "$PGID" ]; then
	deluser "$USERNAME"
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
