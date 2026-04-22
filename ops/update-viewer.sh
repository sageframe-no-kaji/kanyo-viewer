#!/bin/bash
# Update the kanyo viewer: pull latest code and rebuild viewer container

set -e

REMOTE_HOST="${1:-kanyo}"
CODE_DIR="/opt/services/kanyo-viewer"

echo "Updating Kanyo Viewer on ${REMOTE_HOST}..."

echo "📥 Pulling latest code..."
ssh -A "${REMOTE_HOST}" "cd ${CODE_DIR} && git pull"

echo "🔨 Rebuilding viewer container..."
ssh -t "${REMOTE_HOST}" "cd ${CODE_DIR} && docker compose up -d --build viewer"

echo ""
echo "✓ Viewer updated!"
echo "  Logs: ssh ${REMOTE_HOST} 'cd ${CODE_DIR} && docker compose logs -f viewer'"
