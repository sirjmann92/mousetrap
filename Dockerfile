# Stage 1: Build frontend
FROM node:22.20.0-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
COPY frontend/ ./
RUN npm ci --silent \
    && npm cache clean --force \
    # Build the frontend using devDependencies (vite, plugins)
    && npm run build \
    # Clean up everything except the build output - we only need /frontend/build in the next stage
    && npm cache clean --force \
    && rm -rf node_modules src public package*.json

# Stage 2: Backend (FastAPI)
FROM python:3.13-alpine AS backend
WORKDIR /app

# Copy requirements first for better caching
COPY backend/requirements.txt /app/requirements.txt

# Install system dependencies, create users/groups, and install Python deps
RUN apk add --no-cache --virtual .build-deps gcc musl-dev libffi-dev \
    && apk add --no-cache gettext su-exec shadow \
    && (getent group 992 || addgroup -g 992 docker) \
    && addgroup -g 1000 appgroup \
    && adduser -u 1000 -G appgroup -D -s /bin/sh appuser \
    && adduser appuser docker \
    && pip install --no-cache-dir -r /app/requirements.txt \
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
COPY backend/requirements.txt /app/backend/
COPY backend/app.py logconfig.yaml.template /app/
# Copy frontend build output and minimal public assets
COPY --from=frontend-build /frontend/build /app/frontend/build
COPY frontend/public/favicon.ico frontend/public/favicon.svg /app/frontend/public/
# Copy VERSION file and startup script, set permissions
COPY VERSION /app/VERSION
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh \
    && mkdir -p /frontend && ln -s /app/frontend/build /frontend/build

# Expose the default port
EXPOSE 39842

# Ensure container starts as root for user/group management
# Required for unRAID and other systems that may force non-root startup
USER root

ENTRYPOINT ["/app/start.sh"]
