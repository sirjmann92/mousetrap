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

# Install system dependencies (if needed)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    ENV=production

# Copy backend code and requirements
COPY backend/ /app/backend/
COPY backend/app.py /app/app.py
COPY backend/requirements.txt /app/requirements.txt

# Install Python dependencies with build-essential, then remove build-essential in a single layer
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential \
    && pip install --no-cache-dir -r /app/requirements.txt \
    && apt-get purge -y --auto-remove build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy frontend build output and static assets
COPY --from=frontend-build /frontend/build /frontend/build
COPY --from=frontend-build /frontend/build /app/frontend/build
COPY frontend/public/favicon.ico /app/frontend/build/favicon.ico
COPY frontend/public/favicon.svg /app/frontend/build/favicon.svg
COPY favicon_io/ /app/frontend/build/
COPY frontend/public/favicon.ico /app/frontend/public/favicon.ico
COPY frontend/public/favicon.svg /app/frontend/public/svg
COPY favicon_io/ /app/frontend/public/

COPY logconfig.yaml /app/logconfig.yaml

EXPOSE 39842

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "39842", "--log-config", "logconfig.yaml", "--no-access-log"]
