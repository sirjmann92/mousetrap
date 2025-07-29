FROM node:20-alpine as frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN [ -f package.json ] && npm install || echo "No package.json, skipping npm install"
COPY frontend/ ./
RUN [ -f package.json ] && npm run build || echo "No package.json, skipping build"

FROM python:3.11-slim AS backend
WORKDIR /app
COPY backend/ ./backend/
COPY config/ ./config/
RUN pip install --no-cache-dir -r ./backend/requirements.txt
COPY --from=frontend /app/frontend/build ./frontend

EXPOSE 39842
CMD ["uvicorn", "backend.app:app", "--host", "0.0.0.0", "--port", "39842"]
