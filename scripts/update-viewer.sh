#!/bin/bash
# Quick viewer update script - pull latest code and rebuild viewer container only

set -e

REMOTE_HOST="${1:-kanyo.lan}"
CODE_DIR="/opt/services/kanyo-viewer"

if [ "$1" == "" ]; then
    echo "Using default host: ${REMOTE_HOST}"
fi

echo "Updating Kanyo Viewer on ${REMOTE_HOST}..."

# Pull latest code
echo "📥 Pulling latest code..."
ssh -A "${REMOTE_HOST}" "cd ${CODE_DIR} && git pull"

# Rebuild viewer container with new code
echo "🔨 Rebuilding viewer container..."
ssh -t "${REMOTE_HOST}" "cd ${CODE_DIR} && docker compose up -d --build viewer"

echo ""
echo "✓ Viewer updated!"
echo ""
echo "To view logs:"
echo "  ssh ${REMOTE_HOST} 'cd ${CODE_DIR} && docker compose logs -f viewer'"
echo ""
echo "Access viewer at: http://kanyo.lan:3000"
