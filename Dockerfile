# Stage 1: Build frontend
FROM node:20-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend (FastAPI)
FROM python:3.11-alpine AS backend
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
    && rm -rf /root/.cache/pip

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    ENV=production \
    PUID=1000 \
    PGID=1000

# Now copy the rest of the backend code and config
COPY backend/ /app/backend/
COPY backend/app.py logconfig.yaml.template /app/
# Copy frontend build output and public directory (needed for favicons)
COPY --from=frontend-build /frontend/build /app/frontend/build
COPY frontend/public /app/frontend/public
RUN mkdir -p /frontend && ln -s /app/frontend/build /frontend/build

EXPOSE 39842

COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Ensure container starts as root for user/group management
# Required for unRAID and other systems that may force non-root startup
USER root

ENTRYPOINT ["/app/start.sh"]