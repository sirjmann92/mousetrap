# Example Dockerfile for backend
FROM python:3.11-slim

WORKDIR /app

COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

COPY frontend/public /app/frontend/public
COPY frontend/build /app/frontend/build

CMD sh -c "uvicorn backend.app:app --host 0.0.0.0 --port ${PORT:-8000}"