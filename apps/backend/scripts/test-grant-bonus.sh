#!/bin/bash

###############################################################################
# Script de prueba para el endpoint de Grant Bonus ML Coins
# Endpoint: POST /teacher/students/:studentId/bonus
#
# Uso:
#   ./test-grant-bonus.sh <TEACHER_TOKEN> <STUDENT_ID>
#
# Ejemplo:
#   ./test-grant-bonus.sh "eyJhbGc..." "550e8400-e29b-41d4-a716-446655440000"
###############################################################################

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuración
BASE_URL="${BASE_URL:-http://localhost:3006}"
API_PREFIX="/api/v1"

# Validar argumentos
if [ -z "$1" ] || [ -z "$2" ]; then
  echo -e "${RED}Error: Se requieren 2 argumentos${NC}"
  echo "Uso: $0 <TEACHER_TOKEN> <STUDENT_ID>"
  exit 1
fi

TEACHER_TOKEN="$1"
STUDENT_ID="$2"

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Test: Grant Bonus ML Coins${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""
echo "BASE_URL: $BASE_URL"
echo "STUDENT_ID: $STUDENT_ID"
echo ""

###############################################################################
# Test 1: Otorgar bonus válido
###############################################################################
echo -e "${GREEN}[1/4] Otorgando 50 ML Coins al estudiante...${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  "${BASE_URL}${API_PREFIX}/teacher/students/${STUDENT_ID}/bonus" \
  -H "Authorization: Bearer ${TEACHER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50,
    "reason": "Excelente participación en clase y ayuda a compañeros"
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Status: $HTTP_CODE"
echo "Response:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

if [ "$HTTP_CODE" -eq 201 ]; then
  echo -e "${GREEN}✓ Test 1 PASSED${NC}"
else
  echo -e "${RED}✗ Test 1 FAILED${NC}"
fi
echo ""

###############################################################################
# Test 2: Validar amount mínimo (debe fallar con 0)
###############################################################################
echo -e "${GREEN}[2/4] Intentando otorgar 0 ML Coins (debe fallar)...${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  "${BASE_URL}${API_PREFIX}/teacher/students/${STUDENT_ID}/bonus" \
  -H "Authorization: Bearer ${TEACHER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 0,
    "reason": "Test de validación de mínimo"
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Status: $HTTP_CODE"
echo "Response:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

if [ "$HTTP_CODE" -eq 400 ]; then
  echo -e "${GREEN}✓ Test 2 PASSED (validación correcta)${NC}"
else
  echo -e "${RED}✗ Test 2 FAILED${NC}"
fi
echo ""

###############################################################################
# Test 3: Validar amount máximo (debe fallar con 1001)
###############################################################################
echo -e "${GREEN}[3/4] Intentando otorgar 1001 ML Coins (debe fallar)...${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  "${BASE_URL}${API_PREFIX}/teacher/students/${STUDENT_ID}/bonus" \
  -H "Authorization: Bearer ${TEACHER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1001,
    "reason": "Test de validación de máximo"
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Status: $HTTP_CODE"
echo "Response:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

if [ "$HTTP_CODE" -eq 400 ]; then
  echo -e "${GREEN}✓ Test 3 PASSED (validación correcta)${NC}"
else
  echo -e "${RED}✗ Test 3 FAILED${NC}"
fi
echo ""

###############################################################################
# Test 4: Validar reason mínimo (debe fallar con menos de 10 chars)
###############################################################################
echo -e "${GREEN}[4/4] Intentando otorgar con reason corto (debe fallar)...${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  "${BASE_URL}${API_PREFIX}/teacher/students/${STUDENT_ID}/bonus" \
  -H "Authorization: Bearer ${TEACHER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50,
    "reason": "Corto"
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Status: $HTTP_CODE"
echo "Response:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

if [ "$HTTP_CODE" -eq 400 ]; then
  echo -e "${GREEN}✓ Test 4 PASSED (validación correcta)${NC}"
else
  echo -e "${RED}✗ Test 4 FAILED${NC}"
fi
echo ""

###############################################################################
# Resumen
###############################################################################
echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Resumen de Tests${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""
echo "Verifica que:"
echo "  - Test 1: Bonus otorgado correctamente (HTTP 201)"
echo "  - Test 2: Validación de amount mínimo (HTTP 400)"
echo "  - Test 3: Validación de amount máximo (HTTP 400)"
echo "  - Test 4: Validación de reason mínimo (HTTP 400)"
echo ""
echo -e "${GREEN}Tests completados!${NC}"
