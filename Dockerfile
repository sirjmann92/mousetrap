# Stage 1: Build frontend
FROM node:20 AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend (FastAPI)
FROM python:3.11 AS backend
WORKDIR /app

COPY backend/ /app/backend/
COPY backend/app.py /app/app.py

# Copy frontend build output to the expected path
COPY --from=frontend-build /frontend/build /frontend/build

COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

EXPOSE 39842

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "39842"]
