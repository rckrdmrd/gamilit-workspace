#!/bin/bash

# ============================================================================
# GAMILIT - Script de Inicio de Servidores de Desarrollo
# ============================================================================
# Este script inicia el Frontend (puerto 3005) y Backend (puerto 3006)
# en modo desarrollo.
#
# Uso:
#   ./start-dev.sh          # Inicia ambos servidores
#   ./start-dev.sh frontend # Solo Frontend
#   ./start-dev.sh backend  # Solo Backend
# ============================================================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Directorio base del proyecto
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$PROJECT_DIR/apps/frontend"
BACKEND_DIR="$PROJECT_DIR/apps/backend"

# Archivos PID
FRONTEND_PID_FILE="/tmp/gamilit-frontend.pid"
BACKEND_PID_FILE="/tmp/gamilit-backend.pid"

# Archivos de log
FRONTEND_LOG="/tmp/gamilit-frontend.log"
BACKEND_LOG="/tmp/gamilit-backend.log"

# Función para imprimir header
print_header() {
    echo ""
    echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC}                                                               ${BLUE}║${NC}"
    echo -e "${BLUE}║${NC}   ${GREEN}🚀 GAMILIT - Inicio de Servidores de Desarrollo${NC}          ${BLUE}║${NC}"
    echo -e "${BLUE}║${NC}                                                               ${BLUE}║${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Función para verificar si un puerto está en uso
check_port() {
    local port=$1
    if lsof -i:$port > /dev/null 2>&1; then
        return 0 # Puerto en uso
    else
        return 1 # Puerto libre
    fi
}

# Función para detener servidor existente
stop_existing_server() {
    local name=$1
    local pid_file=$2
    local port=$3

    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null 2>&1; then
            echo -e "${YELLOW}⚠️  Deteniendo $name existente (PID: $pid)...${NC}"
            kill -9 $pid 2>/dev/null || true
            rm -f "$pid_file"
        fi
    fi

    # Verificar si hay proceso en el puerto
    if check_port $port; then
        echo -e "${YELLOW}⚠️  Puerto $port en uso, liberando...${NC}"
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
}

# Función para iniciar Frontend
start_frontend() {
    echo -e "${BLUE}📦 Iniciando Frontend (puerto 3005)...${NC}"

    # Detener servidor existente
    stop_existing_server "Frontend" "$FRONTEND_PID_FILE" 3005

    # Iniciar servidor
    cd "$FRONTEND_DIR"
    npm run dev > "$FRONTEND_LOG" 2>&1 &
    local pid=$!
    echo $pid > "$FRONTEND_PID_FILE"

    # Esperar a que inicie
    sleep 5

    # Verificar que esté corriendo
    if ps -p $pid > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend iniciado exitosamente${NC}"
        echo -e "   ${BLUE}➜${NC} Local:   http://localhost:3005/"
        echo -e "   ${BLUE}➜${NC} PID:     $pid"
        echo -e "   ${BLUE}➜${NC} Log:     $FRONTEND_LOG"
        return 0
    else
        echo -e "${RED}❌ Error al iniciar Frontend${NC}"
        echo -e "${YELLOW}Ver logs en: $FRONTEND_LOG${NC}"
        return 1
    fi
}

# Función para iniciar Backend
start_backend() {
    echo -e "${BLUE}📦 Iniciando Backend (puerto 3006)...${NC}"

    # Detener servidor existente
    stop_existing_server "Backend" "$BACKEND_PID_FILE" 3006

    # Iniciar servidor
    cd "$BACKEND_DIR"
    npm run dev > "$BACKEND_LOG" 2>&1 &
    local pid=$!
    echo $pid > "$BACKEND_PID_FILE"

    # Esperar a que inicie
    sleep 8

    # Verificar que esté corriendo
    if ps -p $pid > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend iniciado exitosamente${NC}"
        echo -e "   ${BLUE}➜${NC} Server:  http://localhost:3006"
        echo -e "   ${BLUE}➜${NC} Docs:    http://localhost:3006/api/docs"
        echo -e "   ${BLUE}➜${NC} PID:     $pid"
        echo -e "   ${BLUE}➜${NC} Log:     $BACKEND_LOG"
        return 0
    else
        echo -e "${RED}❌ Error al iniciar Backend${NC}"
        echo -e "${YELLOW}Ver logs en: $BACKEND_LOG${NC}"
        return 1
    fi
}

# Main
print_header

case "${1:-all}" in
    frontend)
        start_frontend
        ;;
    backend)
        start_backend
        ;;
    all|*)
        start_backend
        echo ""
        start_frontend
        ;;
esac

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Servidores iniciados${NC}"
echo ""
echo -e "${YELLOW}Para detener los servidores:${NC}"
echo -e "   ./stop-dev.sh"
echo ""
echo -e "${YELLOW}Para ver logs en tiempo real:${NC}"
echo -e "   tail -f $FRONTEND_LOG  # Frontend"
echo -e "   tail -f $BACKEND_LOG   # Backend"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
