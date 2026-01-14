#!/bin/bash
# Quick reference for common Kanyo Viewer commands

cat << 'EOF'
╔══════════════════════════════════════════════════════════════════════╗
║                     KANYO VIEWER - QUICK REFERENCE                    ║
╚══════════════════════════════════════════════════════════════════════╝

📦 DEPLOYMENT
─────────────────────────────────────────────────────────────────────────
Deploy to production:
  ./scripts/deploy-viewer.sh
  OR
  make deploy

Quick update (no full rebuild):
  ./scripts/update-viewer.sh
  OR
  make update

🔧 DEVELOPMENT
─────────────────────────────────────────────────────────────────────────
Start backend (terminal 1):
  cd backend
  uvicorn app.main:app --reload --port 5000
  OR
  make dev-backend

Start frontend (terminal 2):
  cd frontend
  npm run dev
  OR
  make dev-frontend

🐳 DOCKER (LOCAL)
─────────────────────────────────────────────────────────────────────────
Build:
  docker compose build
  OR
  make build

Start:
  docker compose up -d
  OR
  make up

Stop:
  docker compose down
  OR
  make down

View logs:
  docker compose logs -f viewer
  OR
  make logs

🖥️  SERVER OPERATIONS (kanyo.lan)
─────────────────────────────────────────────────────────────────────────
SSH to server:
  ssh kanyo.lan

View container status:
  ssh kanyo.lan "docker compose -f /opt/services/kanyo-viewer/docker-compose.yml ps"

View logs:
  ssh kanyo.lan "docker compose -f /opt/services/kanyo-viewer/docker-compose.yml logs -f viewer"

Restart container:
  ssh kanyo.lan "cd /opt/services/kanyo-viewer && docker compose restart viewer"

🔍 TROUBLESHOOTING
─────────────────────────────────────────────────────────────────────────
Check backend health:
  curl http://localhost:5000/api/streams

Check frontend build:
  cd frontend && npm run build

Check Docker logs:
  docker compose logs --tail=100 viewer

Clear Docker cache:
  docker compose down
  docker system prune -af
  docker compose up -d --build

📝 CONFIGURATION
─────────────────────────────────────────────────────────────────────────
Stream config:       backend/streams.yaml
Environment:         .env, backend/.env
Docker compose:      docker-compose.yml
Docker dev compose:  docker-compose.dev.yml

🌐 ACCESS URLS
─────────────────────────────────────────────────────────────────────────
Development:
  Frontend:  http://localhost:5173
  Backend:   http://localhost:5000
  API Docs:  http://localhost:5000/docs

Production:
  Viewer:    http://kanyo.lan:3000
  API:       http://kanyo.lan:3000/api
  API Docs:  http://kanyo.lan:3000/docs

📚 DOCUMENTATION
─────────────────────────────────────────────────────────────────────────
README.md           - Overview and quick start
DEVELOPMENT.md      - Development guide
PROJECT_STATUS.md   - Project status and features
Makefile           - All available commands (run 'make help')

EOF
