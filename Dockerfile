# Multi-stage Dockerfile for Kanyo Viewer
# Stage 1: Build React frontend with Vite
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY frontend/ ./

# Build frontend
RUN npm run build

# Stage 2: Python backend serving FastAPI + static files
FROM python:3.11-slim

WORKDIR /app

# Install Node 20 LTS (required for yt-dlp-ejs JS runtime)
RUN apt-get update && apt-get install -y curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install deno (pinned) — required for yt-dlp's PO-token / BotGuard challenge on
# pure-live YouTube streams. node (above) only solves the nsig challenge; without
# deno the backend cannot resolve the live HLS manifest and the player shows
# "Stream playback error — retrying...".
RUN apt-get update && apt-get install -y unzip \
    && curl -fsSL -o /tmp/deno.zip https://github.com/denoland/deno/releases/download/v2.9.3/deno-x86_64-unknown-linux-gnu.zip \
    && unzip -q /tmp/deno.zip -d /usr/local/bin \
    && rm /tmp/deno.zip \
    && chmod 755 /usr/local/bin/deno \
    && deno --version \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/ ./

# Copy built frontend from stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose port
EXPOSE 3000

# Environment
ENV KANYO_ENV=production

# Run FastAPI with uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3000"]
