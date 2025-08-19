# Stage 1: Build frontend
FROM node:20 AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install --production
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend (FastAPI)
FROM python:3.11-slim AS backend
WORKDIR /app

# Copy requirements first for better caching
COPY backend/requirements.txt /app/requirements.txt

# Install system dependencies, create users/groups, and install Python deps
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential gettext gosu passwd \
    && (getent group 992 || groupadd -g 992 docker) \
    && groupadd -g 1000 appgroup \
    && useradd -u 1000 -g 1000 -m -s /bin/sh appuser \
    && usermod -aG 992 appuser \
    && pip install --no-cache-dir -r /app/requirements.txt \
    && apt-get purge -y --auto-remove build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    ENV=production \
    PUID=1000 \
    PGID=1000

# Now copy the rest of the backend code and config
COPY backend/ /app/backend/
COPY backend/app.py logconfig.yaml.template /app/

# Copy frontend build output once, then symlink /frontend/build to /app/frontend/build to save space
COPY --from=frontend-build /frontend/build /app/frontend/build
RUN mkdir -p /frontend && ln -s /app/frontend/build /frontend/build

EXPOSE 39842

COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh
ENTRYPOINT ["/app/start.sh"]
