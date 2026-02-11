#!/bin/bash
# ============================================================================
# update-wsl-ip.sh - Auto-detect WSL2 IP and update backend .env
# ============================================================================
# Usage: bash scripts/update-wsl-ip.sh
# Called automatically by: npm run predev (via package.json)
#
# Why: WSL2 assigns dynamic IPs that change on reboot. The backend needs
#       the direct WSL2 IP (not 127.0.0.1) to avoid ECONNRESET with 10
#       TypeORM datasources connecting simultaneously.
#
# See: orchestration/analisis/ANALISIS-BACKEND-GAMILIT-2026-02-10.md
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_ROOT/apps/backend/.env"

# Detect WSL2 IP
WSL_IP=$(wsl -d Ubuntu-24.04 -u developer -- hostname -I 2>/dev/null | awk '{print $1}')

if [ -z "$WSL_IP" ]; then
  echo "[update-wsl-ip] WARNING: Could not detect WSL2 IP. Is WSL running?"
  echo "[update-wsl-ip] Keeping current DB_HOST value."
  exit 0
fi

# Read current DB_HOST
CURRENT_HOST=$(grep "^DB_HOST=" "$ENV_FILE" 2>/dev/null | cut -d'=' -f2)

if [ "$CURRENT_HOST" = "$WSL_IP" ]; then
  echo "[update-wsl-ip] DB_HOST=$WSL_IP (no change needed)"
  exit 0
fi

# Update DB_HOST in .env
sed -i "s/^DB_HOST=.*/DB_HOST=$WSL_IP/" "$ENV_FILE"
echo "[update-wsl-ip] DB_HOST updated: $CURRENT_HOST -> $WSL_IP"
