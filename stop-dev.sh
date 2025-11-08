#!/bin/bash

# ============================================================================
# GAMILIT - Script de Detención de Servidores de Desarrollo
# ============================================================================
# Este script detiene el Frontend (puerto 3005) y Backend (puerto 3006)
#
# Uso:
#   ./stop-dev.sh           # Detiene ambos servidores
#   ./stop-dev.sh frontend  # Solo Frontend
#   ./stop-dev.sh backend   # Solo Backend
# ============================================================================

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Archivos PID
FRONTEND_PID_FILE="/tmp/gamilit-frontend.pid"
BACKEND_PID_FILE="/tmp/gamilit-backend.pid"

# Función para imprimir header
print_header() {
    echo ""
    echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC}                                                               ${BLUE}║${NC}"
    echo -e "${BLUE}║${NC}   ${YELLOW}🛑 GAMILIT - Detención de Servidores${NC}                     ${BLUE}║${NC}"
    echo -e "${BLUE}║${NC}                                                               ${BLUE}║${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Función para detener servidor
stop_server() {
    local name=$1
    local pid_file=$2
    local port=$3

    echo -e "${BLUE}🛑 Deteniendo $name...${NC}"

    local stopped=0

    # Detener proceso por PID file
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null 2>&1; then
            kill -9 $pid 2>/dev/null && stopped=1
            echo -e "${GREEN}   ✅ Detenido proceso PID $pid${NC}"
        fi
        rm -f "$pid_file"
    fi

    # Detener procesos en el puerto
    if lsof -i:$port > /dev/null 2>&1; then
        local pids=$(lsof -ti:$port)
        if [ -n "$pids" ]; then
            echo "$pids" | xargs kill -9 2>/dev/null && stopped=1
            echo -e "${GREEN}   ✅ Liberado puerto $port${NC}"
        fi
    fi

    if [ $stopped -eq 0 ]; then
        echo -e "${YELLOW}   ⚠️  $name no estaba corriendo${NC}"
    fi
}

# Main
print_header

case "${1:-all}" in
    frontend)
        stop_server "Frontend" "$FRONTEND_PID_FILE" 3005
        ;;
    backend)
        stop_server "Backend" "$BACKEND_PID_FILE" 3006
        ;;
    all|*)
        stop_server "Backend" "$BACKEND_PID_FILE" 3006
        stop_server "Frontend" "$FRONTEND_PID_FILE" 3005
        ;;
esac

echo ""
echo -e "${GREEN}✅ Servidores detenidos${NC}"
echo ""
