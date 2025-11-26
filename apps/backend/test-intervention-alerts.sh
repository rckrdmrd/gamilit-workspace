#!/bin/bash

###############################################################################
# SCRIPT DE TESTING MANUAL - INTERVENTION ALERTS API
###############################################################################
#
# Descripción: Script para validar manualmente los endpoints de alertas
# de intervención estudiantil del portal Teacher.
#
# Prerrequisitos:
# - Backend corriendo en http://localhost:3006
# - Token JWT válido de un teacher (ADMIN_TEACHER o SUPER_ADMIN)
# - Base de datos con tabla student_intervention_alerts creada
#
# Uso:
#   ./test-intervention-alerts.sh <JWT_TOKEN>
#
# Ejemplo:
#   ./test-intervention-alerts.sh "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
#
###############################################################################

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
BASE_URL="http://localhost:3006/api/v1"
TOKEN="${1}"

if [ -z "$TOKEN" ]; then
    echo -e "${RED}Error: JWT token requerido${NC}"
    echo "Uso: $0 <JWT_TOKEN>"
    exit 1
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}TESTING INTERVENTION ALERTS API${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Test 1: Listar todas las alertas
echo -e "${YELLOW}Test 1: GET /teacher/alerts${NC}"
curl -X GET "${BASE_URL}/teacher/alerts" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n\n"

# Test 2: Listar alertas con filtros
echo -e "${YELLOW}Test 2: GET /teacher/alerts?severity=critical&status=active${NC}"
curl -X GET "${BASE_URL}/teacher/alerts?severity=critical&status=active&limit=10" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n\n"

# Test 3: Búsqueda por texto
echo -e "${YELLOW}Test 3: GET /teacher/alerts?search=estudiante${NC}"
curl -X GET "${BASE_URL}/teacher/alerts?search=estudiante" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n\n"

# Test 4: Generar alertas manualmente (testing)
echo -e "${YELLOW}Test 4: POST /teacher/alerts/generate${NC}"
curl -X POST "${BASE_URL}/teacher/alerts/generate" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n\n"

# Test 5: Obtener detalle de alerta específica (requiere ID válido)
echo -e "${YELLOW}Test 5: GET /teacher/alerts/:id${NC}"
echo -e "${YELLOW}(Se omite - requiere ID de alerta existente)${NC}\n"

# Test 6: Acknowledge alerta (requiere ID válido)
echo -e "${YELLOW}Test 6: PATCH /teacher/alerts/:id/acknowledge${NC}"
echo -e "${YELLOW}(Se omite - requiere ID de alerta existente)${NC}\n"

# Test 7: Resolver alerta (requiere ID válido)
echo -e "${YELLOW}Test 7: PATCH /teacher/alerts/:id/resolve${NC}"
echo -e "${YELLOW}(Se omite - requiere ID de alerta existente)${NC}\n"

# Test 8: Descartar alerta (requiere ID válido)
echo -e "${YELLOW}Test 8: PATCH /teacher/alerts/:id/dismiss${NC}"
echo -e "${YELLOW}(Se omite - requiere ID de alerta existente)${NC}\n"

# Test 9: Historial de alertas de estudiante (requiere student_id válido)
echo -e "${YELLOW}Test 9: GET /teacher/alerts/student/:studentId/history${NC}"
echo -e "${YELLOW}(Se omite - requiere ID de estudiante existente)${NC}\n"

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Testing completado${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${YELLOW}Notas:${NC}"
echo "- Tests 5-9 requieren IDs válidos para ejecutarse"
echo "- Usa los IDs obtenidos del Test 1 para probar endpoints individuales"
echo ""
echo -e "${YELLOW}Ejemplo de testing completo con ID:${NC}"
echo "  ALERT_ID=\$(curl -s \"${BASE_URL}/teacher/alerts\" -H \"Authorization: Bearer \${TOKEN}\" | jq -r '.data[0].id')"
echo "  curl -X GET \"${BASE_URL}/teacher/alerts/\${ALERT_ID}\" -H \"Authorization: Bearer \${TOKEN}\""
echo "  curl -X PATCH \"${BASE_URL}/teacher/alerts/\${ALERT_ID}/acknowledge\" -H \"Authorization: Bearer \${TOKEN}\""
echo ""
