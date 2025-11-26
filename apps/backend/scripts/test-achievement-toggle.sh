#!/bin/bash

##############################################################################
# Test Script: PATCH /api/v1/gamification/achievements/:id
# Descripción: Prueba el endpoint de toggle de estado activo/inactivo de achievements
# Uso: ./test-achievement-toggle.sh [ACHIEVEMENT_ID] [true|false]
##############################################################################

# Configuración
API_BASE_URL="${API_BASE_URL:-http://localhost:3000/api/v1}"
ACHIEVEMENT_ID="${1}"
IS_ACTIVE="${2:-false}"

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir encabezados
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# Función para imprimir resultados
print_result() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Función para imprimir errores
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Función para imprimir advertencias
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Validar parámetros
if [ -z "$ACHIEVEMENT_ID" ]; then
    print_error "Error: ACHIEVEMENT_ID es requerido"
    echo "Uso: $0 <ACHIEVEMENT_ID> [true|false]"
    echo "Ejemplo: $0 550e8400-e29b-41d4-a716-446655440000 false"
    exit 1
fi

if [[ "$IS_ACTIVE" != "true" && "$IS_ACTIVE" != "false" ]]; then
    print_error "Error: IS_ACTIVE debe ser 'true' o 'false'"
    echo "Uso: $0 <ACHIEVEMENT_ID> [true|false]"
    exit 1
fi

print_header "TEST: Toggle Achievement Status"
echo "API Base URL: $API_BASE_URL"
echo "Achievement ID: $ACHIEVEMENT_ID"
echo "New Status: $IS_ACTIVE"
echo ""

# Obtener token de autenticación (ajustar según tu sistema de auth)
# Por ahora, asumimos que hay un token en variable de entorno
if [ -z "$AUTH_TOKEN" ]; then
    print_warning "AUTH_TOKEN no configurado. El endpoint requiere autenticación."
    print_warning "Configura AUTH_TOKEN en tu entorno o modifica este script."
    echo ""
fi

##############################################################################
# 1. Obtener achievement antes del cambio
##############################################################################
print_header "1. Obtener Achievement (BEFORE)"
BEFORE_RESPONSE=$(curl -s -X GET \
    "${API_BASE_URL}/gamification/achievements/${ACHIEVEMENT_ID}" \
    -H "Content-Type: application/json" \
    ${AUTH_TOKEN:+-H "Authorization: Bearer $AUTH_TOKEN"})

echo "$BEFORE_RESPONSE" | jq '.' 2>/dev/null || echo "$BEFORE_RESPONSE"
echo ""

# Extraer estado anterior
BEFORE_STATUS=$(echo "$BEFORE_RESPONSE" | jq -r '.is_active' 2>/dev/null)
if [ "$BEFORE_STATUS" != "null" ] && [ -n "$BEFORE_STATUS" ]; then
    print_result "Estado anterior: $BEFORE_STATUS"
else
    print_warning "No se pudo obtener el estado anterior"
fi
echo ""

##############################################################################
# 2. Actualizar estado del achievement
##############################################################################
print_header "2. PATCH Achievement Status"
UPDATE_RESPONSE=$(curl -s -X PATCH \
    "${API_BASE_URL}/gamification/achievements/${ACHIEVEMENT_ID}" \
    -H "Content-Type: application/json" \
    ${AUTH_TOKEN:+-H "Authorization: Bearer $AUTH_TOKEN"} \
    -d "{\"is_active\": $IS_ACTIVE}")

echo "$UPDATE_RESPONSE" | jq '.' 2>/dev/null || echo "$UPDATE_RESPONSE"
echo ""

# Validar respuesta
SUCCESS=$(echo "$UPDATE_RESPONSE" | jq -r '.success' 2>/dev/null)
NEW_STATUS=$(echo "$UPDATE_RESPONSE" | jq -r '.achievement.is_active' 2>/dev/null)

if [ "$SUCCESS" = "true" ] && [ "$NEW_STATUS" = "$IS_ACTIVE" ]; then
    print_result "Estado actualizado exitosamente: $BEFORE_STATUS → $NEW_STATUS"
else
    print_error "Error al actualizar el estado"
fi
echo ""

##############################################################################
# 3. Verificar el cambio
##############################################################################
print_header "3. Obtener Achievement (AFTER)"
AFTER_RESPONSE=$(curl -s -X GET \
    "${API_BASE_URL}/gamification/achievements/${ACHIEVEMENT_ID}" \
    -H "Content-Type: application/json" \
    ${AUTH_TOKEN:+-H "Authorization: Bearer $AUTH_TOKEN"})

echo "$AFTER_RESPONSE" | jq '.' 2>/dev/null || echo "$AFTER_RESPONSE"
echo ""

# Extraer estado posterior
AFTER_STATUS=$(echo "$AFTER_RESPONSE" | jq -r '.is_active' 2>/dev/null)
if [ "$AFTER_STATUS" = "$IS_ACTIVE" ]; then
    print_result "Verificación exitosa: is_active = $AFTER_STATUS"
else
    print_error "Verificación fallida. Esperado: $IS_ACTIVE, Obtenido: $AFTER_STATUS"
fi
echo ""

##############################################################################
# Resumen
##############################################################################
print_header "RESUMEN"
echo "Achievement ID: $ACHIEVEMENT_ID"
echo "Estado anterior: $BEFORE_STATUS"
echo "Estado solicitado: $IS_ACTIVE"
echo "Estado actual: $AFTER_STATUS"

if [ "$AFTER_STATUS" = "$IS_ACTIVE" ]; then
    print_result "✓ TEST PASSED"
else
    print_error "✗ TEST FAILED"
    exit 1
fi
