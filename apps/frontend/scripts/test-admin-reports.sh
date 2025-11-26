#!/bin/bash

###############################################################################
# Manual Testing Script - AdminReportsPage
#
# Este script proporciona comandos curl para probar manualmente
# los endpoints de reportes del backend
#
# Uso:
#   1. Asegúrate de que el backend esté corriendo en localhost:3006
#   2. Obtén un token JWT de super_admin (login primero)
#   3. Reemplaza YOUR_JWT_TOKEN con tu token real
#   4. Ejecuta los comandos uno por uno
#
# @author Frontend-Agent
# @date 2025-11-24
###############################################################################

set -e

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuración
API_BASE="http://localhost:3006/api/v1"
TOKEN="${JWT_TOKEN:-YOUR_JWT_TOKEN}"

# Banner
echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║         Admin Reports Testing Script - GAMILIT               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar que el token esté configurado
if [ "$TOKEN" == "YOUR_JWT_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  WARNING: JWT_TOKEN no está configurado${NC}"
    echo ""
    echo "Para usar este script:"
    echo "  1. Login en /api/v1/auth/login y obtén tu token"
    echo "  2. Exporta la variable: export JWT_TOKEN='tu-token-aqui'"
    echo "  3. Vuelve a ejecutar este script"
    echo ""
    echo "O ejecuta cada comando manualmente reemplazando YOUR_JWT_TOKEN"
    echo ""
fi

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Función helper para hacer requests
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4

    echo -e "${GREEN}➤ ${description}${NC}"
    echo -e "${YELLOW}${method} ${endpoint}${NC}"

    if [ -z "$data" ]; then
        curl -X ${method} \
            -H "Authorization: Bearer ${TOKEN}" \
            -H "Content-Type: application/json" \
            "${API_BASE}${endpoint}" \
            -w "\n\nHTTP Status: %{http_code}\n" \
            2>/dev/null | jq . || echo "Response received"
    else
        curl -X ${method} \
            -H "Authorization: Bearer ${TOKEN}" \
            -H "Content-Type: application/json" \
            -d "${data}" \
            "${API_BASE}${endpoint}" \
            -w "\n\nHTTP Status: %{http_code}\n" \
            2>/dev/null | jq . || echo "Response received"
    fi

    echo ""
    echo -e "${BLUE}───────────────────────────────────────────────────────────────${NC}"
    echo ""
}

# Test 1: Generar Reporte de Usuarios (CSV)
make_request \
    "POST" \
    "/admin/reports/generate" \
    '{
        "type": "users",
        "format": "csv",
        "start_date": "2025-01-01T00:00:00Z",
        "end_date": "2025-12-31T23:59:59Z"
    }' \
    "Test 1: Generar Reporte de Usuarios (CSV)"

# Test 2: Generar Reporte de Progreso (Excel)
make_request \
    "POST" \
    "/admin/reports/generate" \
    '{
        "type": "progress",
        "format": "excel"
    }' \
    "Test 2: Generar Reporte de Progreso (Excel)"

# Test 3: Generar Reporte de Gamificación (PDF)
make_request \
    "POST" \
    "/admin/reports/generate" \
    '{
        "type": "gamification",
        "format": "pdf",
        "start_date": "2025-11-01T00:00:00Z"
    }' \
    "Test 3: Generar Reporte de Gamificación (PDF)"

# Test 4: Listar Todos los Reportes
make_request \
    "GET" \
    "/admin/reports" \
    "" \
    "Test 4: Listar Todos los Reportes"

# Test 5: Listar Reportes por Tipo
make_request \
    "GET" \
    "/admin/reports?type=users" \
    "" \
    "Test 5: Listar Reportes de Usuarios"

# Test 6: Listar Reportes por Status
make_request \
    "GET" \
    "/admin/reports?status=completed" \
    "" \
    "Test 6: Listar Reportes Completados"

# Test 7: Listar con Paginación
make_request \
    "GET" \
    "/admin/reports?page=1&limit=5" \
    "" \
    "Test 7: Listar Reportes (Paginación)"

echo -e "${GREEN}✓ Tests completados${NC}"
echo ""
echo -e "${YELLOW}Nota:${NC} Para descargar un reporte:"
echo "  GET /admin/reports/{id}/download"
echo ""
echo "Para eliminar un reporte:"
echo "  DELETE /admin/reports/{id}"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
