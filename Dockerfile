# Stage 1: Build frontend
# Build on the builder's native platform so Node.js never runs under QEMU.
# The output is pure static files (JS/CSS/HTML), so it can be copied into
# images for any target architecture.
FROM --platform=$BUILDPLATFORM node:krypton-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install --global "npm@>=11.16.0" --ignore-scripts --no-audit --no-fund \
    && npm ci --strict-allow-scripts --silent --no-fund
COPY frontend/ ./
# Build the frontend using devDependencies (Vite and plugins).
RUN npm run build

# Stage 2: Backend (FastAPI)
FROM python:3.13-alpine AS backend
WORKDIR /app

# Copy dependency metadata first for better caching.
COPY pyproject.toml /app/pyproject.toml

# Install system dependencies, create users/groups, and install Python deps
RUN apk add --no-cache gettext su-exec shadow \
    && (getent group 992 || addgroup -g 992 docker) \
    && addgroup -g 1000 appgroup \
    && adduser -u 1000 -G appgroup -D -s /bin/sh appuser \
    && adduser appuser docker \
    && python -m pip install --no-cache-dir --upgrade "pip>=25.1" \
    && python -m pip install --no-cache-dir --group runtime \
    && rm -rf /root/.cache/pip /tmp/* /var/cache/apk/*

# Set environment variables
ARG APP_VERSION=dev
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    ENV=production \
    PUID=1000 \
    PGID=1000 \
    APP_VERSION=${APP_VERSION}

# Copy the rest of the backend code and config (exclude dev files)
COPY backend/*.py /app/backend/
COPY backend/app.py logconfig.yaml.template /app/
# Copy frontend build output and minimal public assets
COPY --from=frontend-build /frontend/build /app/frontend/build
COPY frontend/public/favicon.ico frontend/public/favicon.svg /app/frontend/public/
# Copy startup script
COPY start.sh /app/start.sh
RUN mkdir -p /frontend && ln -s /app/frontend/build /frontend/build

# Expose the default port
EXPOSE 39842

# Liveness check only — confirms the web server itself is up and responsive.
# Deliberately does not (and cannot) reflect MAM session validity: a MouseTrap
# instance can manage multiple sessions, each independently valid or invalid,
# so there is no single aggregate "healthy" state that would represent. Use
# the mam_session_invalid notification for that instead.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:39842/api/version || exit 1

# Ensure container starts as root for user/group management
# Required for unRAID and other systems that may force non-root startup
USER root

ENTRYPOINT ["/app/start.sh"]
