# Stage 1: Build frontend
# Build on the builder's native platform so Node.js never runs under QEMU.
# The output is pure static files (JS/CSS/HTML), so it can be copied into
# images for any target architecture.
FROM --platform=$BUILDPLATFORM node:22.20.0-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install --global npm@11 --no-fund \
    && npm ci --silent --no-fund
COPY frontend/ ./
# Build the frontend using devDependencies (Vite and plugins).
RUN npm run build

# Stage 2: Backend (FastAPI)
FROM python:3.13-alpine AS backend
WORKDIR /app

# Copy dependency metadata first for better caching.
COPY pyproject.toml /app/pyproject.toml

# Install system dependencies, create users/groups, and install Python deps
RUN apk add --no-cache --virtual .build-deps gcc musl-dev libffi-dev \
    && apk add --no-cache gettext su-exec shadow \
    && (getent group 992 || addgroup -g 992 docker) \
    && addgroup -g 1000 appgroup \
    && adduser -u 1000 -G appgroup -D -s /bin/sh appuser \
    && adduser appuser docker \
    && python -m pip install --no-cache-dir --upgrade "pip>=25.1" \
    && python -m pip install --no-cache-dir --group runtime \
    && apk del .build-deps \
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
# Copy startup script and set permissions
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh \
    && mkdir -p /frontend && ln -s /app/frontend/build /frontend/build

# Expose the default port
EXPOSE 39842

# Ensure container starts as root for user/group management
# Required for unRAID and other systems that may force non-root startup
USER root

ENTRYPOINT ["/app/start.sh"]
