# Multi-stage build for backend and frontend
FROM node:20-alpine as frontend
WORKDIR /app
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install
COPY frontend ./frontend
RUN cd frontend && npm run build

FROM python:3.11-slim AS backend
WORKDIR /app
COPY backend/ ./backend/
COPY config/ ./config/
RUN pip install fastapi[all] pyyaml uvicorn
COPY --from=frontend /app/frontend/build ./frontend

EXPOSE 39842
CMD ["uvicorn", "backend.app:app", "--host", "0.0.0.0", "--port", "39842"]