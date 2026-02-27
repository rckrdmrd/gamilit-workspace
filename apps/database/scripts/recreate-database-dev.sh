#!/bin/bash
# ============================================================================
# recreate-database-dev.sh - Wrapper DEV para recreacion de BD con WSL2 awareness
# ============================================================================
# Detecta automaticamente si estamos dentro de WSL2 o en Windows (Git Bash/MSYS)
# y configura DB_HOST apropiadamente antes de ejecutar recreate-database.sh.
#
# Estrategia:
#   - Dentro de WSL2: PostgreSQL es local → DB_HOST=localhost
#   - Desde Windows (Git Bash): detecta IP de la distro WSL2 → DB_HOST=<WSL_IP>
#   - Sin WSL: fallback a localhost
#
# Ver: docs/20-architecture/AMBIENTES-DEV-PROD.md (seccion "Scripts de Base de Datos")
# Ver: scripts/update-wsl-ip.sh (script de referencia para deteccion WSL2)
# ============================================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# --- WSL2 IP Detection ---
if grep -qi microsoft /proc/version 2>/dev/null; then
    # Estamos DENTRO de WSL2: PostgreSQL corre localmente
    export DB_HOST="localhost"
elif command -v wsl.exe &>/dev/null; then
    # Estamos en Windows: detectar IP de la distro WSL2 donde corre PostgreSQL
    WSL_IP=$(wsl.exe hostname -I 2>/dev/null | tr -d '\r' | awk '{print $1}')
    if [ -n "$WSL_IP" ]; then
        export DB_HOST="$WSL_IP"
        echo "[recreate-dev] WSL2 detected: DB_HOST=$WSL_IP"
    else
        export DB_HOST="localhost"
        echo "[recreate-dev] WSL2 IP not found, falling back to DB_HOST=localhost"
    fi
else
    export DB_HOST="localhost"
fi

exec bash "$SCRIPT_DIR/recreate-database.sh" --env dev "$@"
