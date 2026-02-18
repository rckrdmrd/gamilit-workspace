#!/bin/bash
# ============================================================================
# GAMILIT - create-database.sh (compat wrapper)
# ============================================================================
# Este script se mantiene por compatibilidad histórica.
# Flujo canónico vigente:
#   - apps/database/scripts/init-database.sh
#   - apps/database/scripts/recreate-database.sh
# ============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CANONICAL_SCRIPT="$SCRIPT_DIR/scripts/init-database.sh"

ENVIRONMENT="${ENVIRONMENT:-dev}"
FORCE_MODE=false
DB_PASSWORD_ARG=""

show_help() {
  cat << 'EOF'
Uso (canónico recomendado):
  bash apps/database/scripts/init-database.sh --env dev --force

Compat wrapper (este script):
  ./create-database.sh --env dev --force
  ./create-database.sh --env prod --password "<pass>" --force
  ./create-database.sh "<DATABASE_URL>"   # legacy

Opciones:
  --env dev|prod
  --password <password>
  --force
  --help
EOF
}

extract_password_from_url() {
  local url="$1"
  python - "$url" << 'PY'
import sys
from urllib.parse import urlparse
u = urlparse(sys.argv[1])
print(u.password or "")
PY
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --env)
      ENVIRONMENT="$2"
      shift 2
      ;;
    --password)
      DB_PASSWORD_ARG="$2"
      shift 2
      ;;
    --force)
      FORCE_MODE=true
      shift
      ;;
    --help)
      show_help
      exit 0
      ;;
    *)
      # Compatibilidad legacy: primer argumento puede ser DATABASE_URL
      if [[ -z "${DATABASE_URL_LEGACY:-}" ]]; then
        DATABASE_URL_LEGACY="$1"
        shift
      else
        echo "Opción no reconocida: $1"
        show_help
        exit 1
      fi
      ;;
  esac
done

if [[ "$ENVIRONMENT" != "dev" && "$ENVIRONMENT" != "prod" ]]; then
  echo "Ambiente inválido: $ENVIRONMENT"
  exit 1
fi

if [[ -n "${DATABASE_URL_LEGACY:-}" && -z "$DB_PASSWORD_ARG" ]]; then
  DB_PASSWORD_ARG="$(extract_password_from_url "$DATABASE_URL_LEGACY")"
fi

if [[ ! -f "$CANONICAL_SCRIPT" ]]; then
  echo "No se encontró script canónico: $CANONICAL_SCRIPT"
  exit 1
fi

echo "[INFO] create-database.sh es wrapper legacy -> scripts/init-database.sh"

ARGS=(--env "$ENVIRONMENT")
if [[ -n "$DB_PASSWORD_ARG" ]]; then
  ARGS+=(--password "$DB_PASSWORD_ARG")
fi
if [[ "$FORCE_MODE" == true ]]; then
  ARGS+=(--force)
fi

exec bash "$CANONICAL_SCRIPT" "${ARGS[@]}"
