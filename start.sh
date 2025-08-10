#!/bin/sh
set -e

# Set up user/group for PUID/PGID
PUID=${PUID:-1000}
PGID=${PGID:-1000}
USERNAME=appuser


# Create group if needed (Debian/Ubuntu syntax)
if ! getent group "$PGID" >/dev/null; then
	ADDGROUP_OUT=$(addgroup --gid "$PGID" "$USERNAME" 2>&1) || true
	if [ "${DEBUG:-0}" = "1" ]; then
		echo "$ADDGROUP_OUT"
	fi
fi
# Create user if needed (Debian/Ubuntu syntax)
if ! id -u "$PUID" >/dev/null 2>&1; then
	ADDUSER_OUT=$(adduser --uid "$PUID" --gid "$PGID" --disabled-password --gecos "" "$USERNAME" 2>&1) || true
	if [ "${DEBUG:-0}" = "1" ]; then
		echo "$ADDUSER_OUT"
	fi
fi

# Ensure ownership of /app/logs and /config if they exist
chown -R "$PUID":"$PGID" /app/logs 2>/dev/null || true
chown -R "$PUID":"$PGID" /config 2>/dev/null || true

# Run as the created user
exec gosu "$PUID":"$PGID" uvicorn app:app --host 0.0.0.0 --port "${PORT:-39842}" --log-config logconfig.yaml --no-access-log
