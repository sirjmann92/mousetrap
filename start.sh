#!/bin/sh
set -e

# Set up user/group for PUID/PGID
PUID=${PUID:-1000}
PGID=${PGID:-1000}
USERNAME=appuser

# Create group if needed
if ! getent group "$PGID" >/dev/null; then
	addgroup -g "$PGID" "$USERNAME" || true
fi
# Create user if needed
if ! id -u "$PUID" >/dev/null 2>&1; then
	adduser -D -u "$PUID" -G "$USERNAME" "$USERNAME" || true
fi

# Ensure ownership of /app/logs and /config if they exist
chown -R "$PUID":"$PGID" /app/logs 2>/dev/null || true
chown -R "$PUID":"$PGID" /config 2>/dev/null || true

# Run as the created user
exec gosu "$PUID":"$PGID" uvicorn app:app --host 0.0.0.0 --port "${PORT:-39842}" --log-config logconfig.yaml --no-access-log
