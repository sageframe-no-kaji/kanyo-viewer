.PHONY: help dev-backend dev-frontend build deploy update clean test

help:
	@echo "Kanyo Viewer - Available Commands"
	@echo ""
	@echo "Development:"
	@echo "  make dev-backend    - Run backend dev server (port 5000)"
	@echo "  make dev-frontend   - Run frontend dev server (port 5173)"
	@echo "  make dev            - Run both backend and frontend"
	@echo ""
	@echo "Docker:"
	@echo "  make build          - Build Docker image"
	@echo "  make up             - Start containers (production)"
	@echo "  make down           - Stop containers"
	@echo "  make logs           - View container logs"
	@echo ""
	@echo "Deployment:"
	@echo "  make deploy         - Deploy to kanyo.lan"
	@echo "  make update         - Quick update on kanyo.lan"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean          - Clean build artifacts"
	@echo "  make test           - Run tests"

dev-backend:
	cd backend && uvicorn app.main:app --reload --port 5000

dev-frontend:
	cd frontend && npm run dev

build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f viewer

deploy:
	./scripts/deploy-viewer.sh

update:
	./scripts/update-viewer.sh

clean:
	rm -rf frontend/dist
	rm -rf frontend/node_modules/.vite
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete

test:
	@echo "Running tests..."
	cd backend && python -m pytest
	cd frontend && npm test
