#!/bin/bash
# ============================================================================
# update-wsl-ip.sh - Detect WSL2 IP + verify services before dev
# ============================================================================
# Usage: bash scripts/update-wsl-ip.sh
# Called automatically by: npm run predev (via package.json)
#
# WSL2 assigns a dynamic IP on each restart. This script:
#   1. Detects the current WSL2 IP from eth0
#   2. Updates DB_HOST in apps/backend/.env.dev
#   3. If REDIS_ENABLED=true, also updates REDIS_URL to WSL2 IP (bypass svchost proxy)
#   4. Verifies PostgreSQL and Redis are running
#
# DB_HOST uses WSL2 IP to bypass svchost.exe proxy (11 datasources × 2 = 22 connections).
# REDIS_URL only updated when REDIS_ENABLED=true — default is false in dev.
# ============================================================================

ENV_FILE="apps/backend/.env.dev"

echo "[predev] Detecting WSL2 IP..."

# Detect WSL2 IP from eth0
WSL2_IP=$(wsl -d Ubuntu-24.04 -u developer -- ip addr show eth0 2>/dev/null | grep -oP 'inet \K[0-9.]+')

if [ -z "$WSL2_IP" ]; then
  echo "[predev] WARNING: Could not detect WSL2 IP — falling back to 127.0.0.1"
  WSL2_IP="127.0.0.1"
fi

echo "[predev] WSL2 IP detected: $WSL2_IP"

# Update .env if it exists
if [ -f "$ENV_FILE" ]; then
  # Update DB_HOST
  if grep -q "^DB_HOST=" "$ENV_FILE"; then
    sed -i "s/^DB_HOST=.*/DB_HOST=$WSL2_IP/" "$ENV_FILE"
  fi

  # Update REDIS_URL to WSL2 IP if REDIS_ENABLED=true (bypass svchost proxy)
  if grep -q "^REDIS_ENABLED=true" "$ENV_FILE"; then
    if grep -q "^REDIS_URL=" "$ENV_FILE"; then
      sed -i "s|^REDIS_URL=.*|REDIS_URL=redis://$WSL2_IP:6379|" "$ENV_FILE"
    fi
    echo "[predev] Updated $ENV_FILE → DB_HOST=$WSL2_IP, REDIS_URL=redis://$WSL2_IP:6379"
  else
    echo "[predev] Updated $ENV_FILE → DB_HOST=$WSL2_IP (Redis disabled, URL unchanged)"
  fi
else
  echo "[predev] WARNING: $ENV_FILE not found — skipping IP update"
fi

echo "[predev] Checking WSL2 services..."

# Check PostgreSQL
if wsl -d Ubuntu-24.04 -u developer -- pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
  echo "[predev] PostgreSQL: running"
else
  echo "[predev] PostgreSQL: not ready — starting..."
  wsl -d Ubuntu-24.04 -u developer -- sudo service postgresql start 2>/dev/null
  sleep 2
  if wsl -d Ubuntu-24.04 -u developer -- pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
    echo "[predev] PostgreSQL: started successfully"
  else
    echo "[predev] WARNING: PostgreSQL could not be started"
  fi
fi

# Check Redis
if wsl -d Ubuntu-24.04 -u developer -- redis-cli ping >/dev/null 2>&1; then
  echo "[predev] Redis: running"
else
  echo "[predev] Redis: not ready — starting..."
  wsl -d Ubuntu-24.04 -u developer -- sudo service redis-server start 2>/dev/null
  sleep 1
  if wsl -d Ubuntu-24.04 -u developer -- redis-cli ping >/dev/null 2>&1; then
    echo "[predev] Redis: started successfully"
  else
    echo "[predev] WARNING: Redis could not be started (Socket.IO will use in-memory adapter)"
  fi
fi

echo "[predev] Done — DB_HOST=$WSL2_IP (direct WSL2 connection, bypasses svchost proxy)"
