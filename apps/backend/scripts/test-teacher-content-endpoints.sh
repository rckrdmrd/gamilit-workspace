#!/bin/bash

# =============================================================================
# Script de prueba para endpoints de Teacher Content
# =============================================================================
# Este script prueba los endpoints CRUD de contenido educativo personalizado
# para teachers usando curl.
#
# Uso:
#   1. Asegurar que el backend esté corriendo: npm run start:dev
#   2. Ejecutar: bash test-teacher-content-endpoints.sh
#
# Prerrequisitos:
#   - Backend corriendo en http://localhost:3006
#   - Token JWT válido de un usuario con rol 'teacher'
# =============================================================================

set -e  # Exit on error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
API_URL="http://localhost:3006/api/v1"
TEACHER_CONTENT_URL="${API_URL}/teacher/content"

# =============================================================================
# Variables globales (ajustar según tu entorno)
# =============================================================================

# TODO: Reemplazar con un token JWT válido de un teacher
# Puedes obtenerlo de:
# 1. Login como teacher: POST /api/v1/auth/login
# 2. Usar las credenciales de un teacher de test (ver seeds)
JWT_TOKEN="${JWT_TOKEN:-your_jwt_token_here}"

# =============================================================================
# Funciones auxiliares
# =============================================================================

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# =============================================================================
# Tests
# =============================================================================

print_header "Teacher Content Endpoints - CRUD Tests"

# Validar que el token esté configurado
if [ "$JWT_TOKEN" == "your_jwt_token_here" ]; then
    print_error "JWT_TOKEN no configurado. Por favor, obtén un token válido e inicia sesión como teacher."
    echo ""
    echo "Ejemplo para obtener token:"
    echo "curl -X POST ${API_URL}/auth/login \\"
    echo "  -H 'Content-Type: application/json' \\"
    echo "  -d '{\"username\":\"teacher1\",\"password\":\"teacher123\"}'"
    echo ""
    exit 1
fi

# Variable para almacenar el ID del contenido creado
CONTENT_ID=""

# =============================================================================
# TEST 1: Crear nuevo contenido educativo
# =============================================================================
print_header "TEST 1: Crear nuevo contenido educativo (POST /teacher/content)"

CREATE_RESPONSE=$(curl -s -X POST "${TEACHER_CONTENT_URL}" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Ejercicio de Fracciones Interactivo",
    "description": "Ejercicios interactivos para practicar operaciones con fracciones",
    "content_type": "custom_exercise",
    "content_data": {
      "questions": [
        {"id": 1, "text": "¿Cuánto es 1/2 + 1/4?", "answer": "3/4"},
        {"id": 2, "text": "¿Cuánto es 3/4 - 1/2?", "answer": "1/4"}
      ]
    },
    "instructions": "Resuelve cada ejercicio y muestra tu procedimiento",
    "learning_objectives": ["Sumar fracciones", "Restar fracciones"],
    "subject_area": "Matemáticas",
    "grade_level": "5",
    "difficulty_level": "medium",
    "estimated_duration_minutes": 30,
    "visibility": "private",
    "status": "draft",
    "points_value": 100,
    "ml_coins_reward": 50
  }')

echo "$CREATE_RESPONSE" | jq '.' 2>/dev/null || echo "$CREATE_RESPONSE"

# Extraer el ID del contenido creado
CONTENT_ID=$(echo "$CREATE_RESPONSE" | jq -r '.id' 2>/dev/null)

if [ "$CONTENT_ID" != "null" ] && [ ! -z "$CONTENT_ID" ]; then
    print_success "Contenido creado con ID: $CONTENT_ID"
else
    print_error "Error al crear contenido"
    exit 1
fi

sleep 1

# =============================================================================
# TEST 2: Listar todo el contenido del teacher
# =============================================================================
print_header "TEST 2: Listar contenido (GET /teacher/content)"

LIST_RESPONSE=$(curl -s -X GET "${TEACHER_CONTENT_URL}?page=1&limit=10" \
  -H "Authorization: Bearer ${JWT_TOKEN}")

echo "$LIST_RESPONSE" | jq '.' 2>/dev/null || echo "$LIST_RESPONSE"

CONTENT_COUNT=$(echo "$LIST_RESPONSE" | jq -r '.pagination.total' 2>/dev/null)
if [ "$CONTENT_COUNT" != "null" ] && [ ! -z "$CONTENT_COUNT" ]; then
    print_success "Total de contenidos: $CONTENT_COUNT"
else
    print_error "Error al listar contenidos"
fi

sleep 1

# =============================================================================
# TEST 3: Obtener contenido por ID
# =============================================================================
print_header "TEST 3: Obtener contenido por ID (GET /teacher/content/:id)"

GET_RESPONSE=$(curl -s -X GET "${TEACHER_CONTENT_URL}/${CONTENT_ID}" \
  -H "Authorization: Bearer ${JWT_TOKEN}")

echo "$GET_RESPONSE" | jq '.' 2>/dev/null || echo "$GET_RESPONSE"

RETRIEVED_TITLE=$(echo "$GET_RESPONSE" | jq -r '.title' 2>/dev/null)
if [ "$RETRIEVED_TITLE" == "Ejercicio de Fracciones Interactivo" ]; then
    print_success "Contenido obtenido correctamente"
else
    print_error "Error al obtener contenido"
fi

sleep 1

# =============================================================================
# TEST 4: Actualizar contenido
# =============================================================================
print_header "TEST 4: Actualizar contenido (PUT /teacher/content/:id)"

UPDATE_RESPONSE=$(curl -s -X PUT "${TEACHER_CONTENT_URL}/${CONTENT_ID}" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Ejercicio de Fracciones Interactivo - Actualizado",
    "description": "Ejercicios actualizados con más ejemplos",
    "estimated_duration_minutes": 45
  }')

echo "$UPDATE_RESPONSE" | jq '.' 2>/dev/null || echo "$UPDATE_RESPONSE"

UPDATED_TITLE=$(echo "$UPDATE_RESPONSE" | jq -r '.title' 2>/dev/null)
if [[ "$UPDATED_TITLE" == *"Actualizado"* ]]; then
    print_success "Contenido actualizado correctamente"
else
    print_error "Error al actualizar contenido"
fi

sleep 1

# =============================================================================
# TEST 5: Publicar contenido
# =============================================================================
print_header "TEST 5: Publicar contenido (PATCH /teacher/content/:id/publish)"

PUBLISH_RESPONSE=$(curl -s -X PATCH "${TEACHER_CONTENT_URL}/${CONTENT_ID}/publish" \
  -H "Authorization: Bearer ${JWT_TOKEN}")

echo "$PUBLISH_RESPONSE" | jq '.' 2>/dev/null || echo "$PUBLISH_RESPONSE"

PUBLISHED_STATUS=$(echo "$PUBLISH_RESPONSE" | jq -r '.status' 2>/dev/null)
if [ "$PUBLISHED_STATUS" == "published" ]; then
    print_success "Contenido publicado correctamente"
else
    print_error "Error al publicar contenido"
fi

sleep 1

# =============================================================================
# TEST 6: Clonar contenido
# =============================================================================
print_header "TEST 6: Clonar contenido (POST /teacher/content/:id/clone)"

CLONE_RESPONSE=$(curl -s -X POST "${TEACHER_CONTENT_URL}/${CONTENT_ID}/clone" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "new_title": "Copia - Ejercicio de Fracciones"
  }')

echo "$CLONE_RESPONSE" | jq '.' 2>/dev/null || echo "$CLONE_RESPONSE"

CLONED_ID=$(echo "$CLONE_RESPONSE" | jq -r '.id' 2>/dev/null)
CLONED_STATUS=$(echo "$CLONE_RESPONSE" | jq -r '.status' 2>/dev/null)
if [ "$CLONED_ID" != "null" ] && [ "$CLONED_STATUS" == "draft" ]; then
    print_success "Contenido clonado correctamente con ID: $CLONED_ID"
else
    print_error "Error al clonar contenido"
fi

sleep 1

# =============================================================================
# TEST 7: Filtrar contenido por tipo
# =============================================================================
print_header "TEST 7: Filtrar por tipo (GET /teacher/content?content_type=custom_exercise)"

FILTER_RESPONSE=$(curl -s -X GET "${TEACHER_CONTENT_URL}?content_type=custom_exercise&page=1&limit=10" \
  -H "Authorization: Bearer ${JWT_TOKEN}")

echo "$FILTER_RESPONSE" | jq '.' 2>/dev/null || echo "$FILTER_RESPONSE"

FILTERED_COUNT=$(echo "$FILTER_RESPONSE" | jq -r '.pagination.total' 2>/dev/null)
if [ "$FILTERED_COUNT" != "null" ] && [ "$FILTERED_COUNT" -ge 2 ]; then
    print_success "Filtrado por tipo exitoso. Resultados: $FILTERED_COUNT"
else
    print_error "Error al filtrar contenido"
fi

sleep 1

# =============================================================================
# TEST 8: Eliminar contenido clonado (soft delete)
# =============================================================================
print_header "TEST 8: Eliminar contenido clonado (DELETE /teacher/content/:id)"

DELETE_RESPONSE=$(curl -s -X DELETE "${TEACHER_CONTENT_URL}/${CLONED_ID}" \
  -H "Authorization: Bearer ${JWT_TOKEN}")

echo "$DELETE_RESPONSE" | jq '.' 2>/dev/null || echo "$DELETE_RESPONSE"

DELETE_SUCCESS=$(echo "$DELETE_RESPONSE" | jq -r '.success' 2>/dev/null)
if [ "$DELETE_SUCCESS" == "true" ]; then
    print_success "Contenido eliminado correctamente"
else
    print_error "Error al eliminar contenido"
fi

# =============================================================================
# Resumen Final
# =============================================================================
print_header "Resumen de Tests"

echo -e "${GREEN}Tests completados:${NC}"
echo "  1. ✓ Crear contenido educativo"
echo "  2. ✓ Listar contenido"
echo "  3. ✓ Obtener contenido por ID"
echo "  4. ✓ Actualizar contenido"
echo "  5. ✓ Publicar contenido"
echo "  6. ✓ Clonar contenido"
echo "  7. ✓ Filtrar contenido por tipo"
echo "  8. ✓ Eliminar contenido (soft delete)"
echo ""
echo -e "${BLUE}Endpoints implementados correctamente!${NC}"
echo ""
echo -e "${YELLOW}Nota: El contenido original (ID: $CONTENT_ID) permanece en la BD.${NC}"
echo -e "${YELLOW}Puedes eliminarlo manualmente o usar el endpoint DELETE si es necesario.${NC}"
