#!/bin/bash
# Deploy Kanyo Viewer to production server

set -e

PROD_HOST="kanyo.lan"
CODE_DIR="/opt/services/kanyo-viewer"

echo "========================================="
echo "Kanyo Viewer Production Deployment"
echo "========================================="
echo ""
echo "Target: ${PROD_HOST}"
echo ""

# Step 1: Pull latest code
echo "→ Pulling latest code..."
ssh -A "${PROD_HOST}" "cd ${CODE_DIR} && git pull"
echo ""

# Step 2: Stop containers
echo "→ Stopping containers..."
ssh "${PROD_HOST}" "cd ${CODE_DIR} && docker compose down"
echo ""

# Step 3: Rebuild and start
echo "→ Building and starting containers..."
ssh "${PROD_HOST}" "cd ${CODE_DIR} && docker compose up -d --build"
echo ""

# Step 4: Verify
echo "→ Verifying deployment..."
ssh "${PROD_HOST}" "docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Image}}' | grep kanyo"
echo ""
echo "✅ Deployment complete!"
echo ""
echo "Access viewer at: http://kanyo.lan:3000"
