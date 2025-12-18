#!/bin/bash
# ============================================================================
# Script: Validación de Gaps DB-127
# Fecha: 2025-11-24
# Autor: Database-Agent
# ============================================================================
#
# DESCRIPCIÓN:
#   Valida que los 3 gaps Database↔Backend estén resueltos
#
# USO:
#   ./scripts/DB-127-validar-gaps.sh [DATABASE_URL]
#
# ============================================================================

set -e  # Exit on error
set -u  # Exit on undefined variable

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get database URL from argument or environment
DATABASE_URL="${1:-${DATABASE_URL:-}}"

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}ERROR: DATABASE_URL no está configurada${NC}"
    echo "Uso: ./scripts/DB-127-validar-gaps.sh <DATABASE_URL>"
    exit 1
fi

echo -e "${BLUE}============================================================================${NC}"
echo -e "${BLUE}VALIDACIÓN DE GAPS DB-127${NC}"
echo -e "${BLUE}============================================================================${NC}"
echo ""

# Extract database name from URL
DB_NAME=$(echo "$DATABASE_URL" | sed -n 's|.*://[^/]*/\([^?]*\).*|\1|p')
echo -e "Base de datos: ${YELLOW}$DB_NAME${NC}"
echo ""

# Run validation SQL script
echo -e "${YELLOW}Ejecutando validación...${NC}"
echo ""

psql "$DATABASE_URL" -f "$(dirname "$0")/validate-gap-fixes.sql"

EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ VALIDACIÓN COMPLETADA${NC}"
    echo ""
    echo -e "${GREEN}Próximos pasos:${NC}"
    echo "1. Verificar que los 3 gaps muestran estado '✅ RESUELTO'"
    echo "2. Probar endpoints backend:"
    echo "   - GET /api/admin/dashboard/actions/recent"
    echo "   - GET /api/admin/dashboard/alerts"
    echo "   - GET /api/admin/tenants"
    echo "   - GET /api/classrooms?is_deleted=false"
    echo ""
else
    echo -e "${RED}❌ ERROR EN VALIDACIÓN${NC}"
    echo "Revisar logs arriba para detalles del error"
    exit 1
fi
