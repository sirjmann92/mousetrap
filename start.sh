#!/bin/sh
set -e
PORT_TO_USE="${PORT:-39842}"
exec uvicorn app:app --host 0.0.0.0 --port "$PORT_TO_USE" --log-config logconfig.yaml --no-access-log
