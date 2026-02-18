#!/usr/bin/env bash
# ============================================================================
# update-wsl-ip.sh - Resolve DB_HOST deterministically before dev boot
# ============================================================================
# Strategy:
#   - Detect active WSL distro dynamically (or use WSL_DISTRO override)
#   - Resolve DB host using DB_HOST_MODE from apps/backend/.env.dev
#   - Validate PostgreSQL readiness before starting Nest (fail fast if not ready)
# ============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
ENV_FILE="${REPO_ROOT}/apps/backend/.env.dev"
POSTGRES_PORT="5432"
REDIS_PORT="6379"

log() { echo "[predev] $*"; }
warn() { echo "[predev] WARNING: $*"; }
err() { echo "[predev] ERROR: $*" >&2; }

if command -v wsl >/dev/null 2>&1; then
  WSL_BIN="wsl"
elif command -v wsl.exe >/dev/null 2>&1; then
  WSL_BIN="wsl.exe"
else
  warn "WSL command not available. Keeping DB_HOST unchanged."
  exit 0
fi

if [ ! -f "${ENV_FILE}" ]; then
  err "Missing env file: ${ENV_FILE}"
  exit 1
fi

resolve_distro() {
  local requested
  requested="$(awk -F= '/^WSL_DISTRO=/{print $2; exit}' "${ENV_FILE}" | tr -d '\r' || true)"
  if [ -n "${requested}" ]; then
    while IFS= read -r distro; do
      if [ "$(echo "${distro}" | tr -d '\r\000')" = "${requested}" ]; then
        echo "${requested}"
        return 0
      fi
    done < <("${WSL_BIN}" -l -q | tr -d '\000')
    warn "WSL_DISTRO=${requested} not found, using first available distro."
  fi

  "${WSL_BIN}" -l -q | tr -d '\000' | awk 'NF { gsub("\r", "", $0); print; exit }'
}

WSL_DISTRO="$(resolve_distro)"
if [ -z "${WSL_DISTRO}" ]; then
  err "No WSL distro found. Install/start a distro or set DB_HOST=localhost manually."
  exit 1
fi

wsl_exec() {
  "${WSL_BIN}" -d "${WSL_DISTRO}" -- bash -lc "$1"
}

get_env_value() {
  local key="$1"
  awk -F= -v k="${key}" '$1==k {print $2; exit}' "${ENV_FILE}" | tr -d '\r'
}

upsert_env_value() {
  local key="$1"
  local value="$2"
  if awk -F= -v k="${key}" '$1==k {found=1} END {exit !found}' "${ENV_FILE}"; then
    sed -i "s|^${key}=.*|${key}=${value}|" "${ENV_FILE}"
  else
    printf "\n%s=%s\n" "${key}" "${value}" >> "${ENV_FILE}"
  fi
}

detect_wsl_ip() {
  local ip_list token
  ip_list="$(wsl_exec "hostname -I" | tr -d '\r\000')"
  for token in ${ip_list}; do
    echo "${token}"
    return 0
  done
}

check_tcp_from_windows() {
  local host="$1"
  powershell.exe -NoProfile -Command "\$ok=(Test-NetConnection -ComputerName '${host}' -Port ${POSTGRES_PORT} -WarningAction SilentlyContinue).TcpTestSucceeded; if (\$ok) { exit 0 } else { exit 1 }" >/dev/null 2>&1
}

wait_postgres_ready() {
  local attempts="${1:-20}"
  local delay_seconds="${2:-2}"
  local i
  for ((i=1; i<=attempts; i++)); do
    if wsl_exec "pg_isready -h localhost -p ${POSTGRES_PORT} >/dev/null 2>&1"; then
      return 0
    fi
    sleep "${delay_seconds}"
  done
  return 1
}

DB_HOST_MODE="$(get_env_value DB_HOST_MODE)"
DB_HOST_MODE="${DB_HOST_MODE:-auto}"
TARGET_DB_HOST=""

log "Using WSL distro: ${WSL_DISTRO}"
log "DB_HOST_MODE=${DB_HOST_MODE}"

case "${DB_HOST_MODE}" in
  localhost)
    TARGET_DB_HOST="localhost"
    ;;
  wsl-ip)
    TARGET_DB_HOST="$(detect_wsl_ip)"
    if [ -z "${TARGET_DB_HOST}" ]; then
      err "DB_HOST_MODE=wsl-ip but WSL IP could not be detected."
      exit 1
    fi
    ;;
  auto)
    WSL2_IP="$(detect_wsl_ip || true)"
    if [ -n "${WSL2_IP}" ]; then
      TARGET_DB_HOST="${WSL2_IP}"
    else
      warn "Could not detect WSL2 IP, falling back to localhost."
      TARGET_DB_HOST="localhost"
    fi
    ;;
  *)
    err "Invalid DB_HOST_MODE='${DB_HOST_MODE}'. Allowed: auto | localhost | wsl-ip"
    exit 1
    ;;
esac

upsert_env_value "DB_HOST" "${TARGET_DB_HOST}"

REDIS_ENABLED="$(get_env_value REDIS_ENABLED)"
if [ "${REDIS_ENABLED}" = "true" ]; then
  upsert_env_value "REDIS_URL" "redis://${TARGET_DB_HOST}:${REDIS_PORT}"
  log "Updated .env.dev -> DB_HOST=${TARGET_DB_HOST}, REDIS_URL=redis://${TARGET_DB_HOST}:${REDIS_PORT}"
else
  log "Updated .env.dev -> DB_HOST=${TARGET_DB_HOST} (Redis disabled)"
fi

if [ "${TARGET_DB_HOST}" != "localhost" ]; then
  if ! check_tcp_from_windows "${TARGET_DB_HOST}"; then
    warn "DB_HOST=${TARGET_DB_HOST} is not reachable from Windows. Falling back to localhost."
    TARGET_DB_HOST="localhost"
    upsert_env_value "DB_HOST" "${TARGET_DB_HOST}"
  fi
fi

log "Checking PostgreSQL service in WSL..."
if wsl_exec "pg_isready -h localhost -p ${POSTGRES_PORT} >/dev/null 2>&1"; then
  log "PostgreSQL: running"
else
  warn "PostgreSQL not ready. Attempting to start service..."
  wsl_exec "sudo -n service postgresql start >/dev/null 2>&1 || service postgresql start >/dev/null 2>&1 || true"
fi

if ! wait_postgres_ready 20 2; then
  err "PostgreSQL is not ready after waiting 40s. Fix service status before npm run dev."
  exit 1
fi
log "PostgreSQL: ready"

if [ "${REDIS_ENABLED}" = "true" ]; then
  log "Checking Redis service in WSL..."
  if wsl_exec "redis-cli ping >/dev/null 2>&1"; then
    log "Redis: running"
  else
    warn "Redis not ready. Attempting to start service..."
    wsl_exec "sudo -n service redis-server start >/dev/null 2>&1 || service redis-server start >/dev/null 2>&1 || true"
    sleep 1
    if wsl_exec "redis-cli ping >/dev/null 2>&1"; then
      log "Redis: started successfully"
    else
      warn "Redis still unavailable. Socket.IO will use in-memory adapter."
    fi
  fi
fi

log "Done -> DB_HOST=${TARGET_DB_HOST}"
