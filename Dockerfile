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

# Install system dependencies and create app user/group with Docker group membership
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        gettext \
        gosu \
        passwd \
    && rm -rf /var/lib/apt/lists/* \
    # Create docker group with GID 992 if not present
    && (getent group 992 || groupadd -g 992 docker) \
    # Create app group and user with PUID/PGID defaults, and add to docker group
    && groupadd -g 1000 appgroup \
    && useradd -u 1000 -g 1000 -m -s /bin/sh appuser \
    && usermod -aG 992 appuser

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    ENV=production \
    PUID=1000 \
    PGID=1000

# Copy backend code and requirements
COPY backend/ /app/backend/
COPY backend/app.py /app/app.py
COPY backend/requirements.txt /app/requirements.txt

# Copy logging config template for dynamic log level
COPY logconfig.yaml.template /app/logconfig.yaml.template

# Install Python dependencies with build-essential, then remove build-essential in a single layer
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential \
    && pip install --no-cache-dir -r /app/requirements.txt \
    && apt-get purge -y --auto-remove build-essential \
    && rm -rf /var/lib/apt/lists/*
# (docker SDK for Python is installed via requirements.txt)

# Copy frontend build output and static assets
COPY --from=frontend-build /frontend/build /frontend/build
COPY --from=frontend-build /frontend/build /app/frontend/build
COPY frontend/public/favicon.ico /app/frontend/build/favicon.ico
COPY frontend/public/favicon.svg /app/frontend/build/favicon.svg
COPY favicon_io/ /app/frontend/build/
COPY frontend/public/favicon.ico /app/frontend/public/favicon.ico
COPY frontend/public/favicon.svg /app/frontend/public/svg
COPY favicon_io/ /app/frontend/public/


EXPOSE 39842

# TEMP: Install curl for debugging
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh
ENTRYPOINT ["/app/start.sh"]
