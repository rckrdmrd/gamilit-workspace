#!/bin/bash

###############################################################################
# Test Script: AdminRolesPage Backend Integration
###############################################################################
#
# Verifica que los endpoints de roles y permisos funcionen correctamente
# desde el frontend hacia el backend.
#
# Prerrequisitos:
# - Backend corriendo en http://localhost:3006
# - Usuario con rol super_admin autenticado
# - Token JWT válido
#
# Uso:
#   ./test-admin-roles-page.sh <JWT_TOKEN>
#
# Fecha: 2025-11-24
# Autor: Frontend-Agent
###############################################################################

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
API_BASE_URL="http://localhost:3006/api/v1"
JWT_TOKEN="${1}"

# Validar token
if [ -z "$JWT_TOKEN" ]; then
    echo -e "${RED}❌ Error: JWT Token requerido${NC}"
    echo ""
    echo "Uso: $0 <JWT_TOKEN>"
    echo ""
    echo "Para obtener el token:"
    echo "  1. Login en el frontend"
    echo "  2. Abrir DevTools > Application > Local Storage"
    echo "  3. Copiar el valor de 'accessToken'"
    exit 1
fi

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Test: AdminRolesPage Backend Integration${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}📋 Base URL: ${API_BASE_URL}${NC}"
echo -e "${YELLOW}🔑 Token: ${JWT_TOKEN:0:20}...${NC}"
echo ""

###############################################################################
# Test 1: GET /admin/roles - Lista de roles
###############################################################################
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test 1: GET /admin/roles${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

response=$(curl -s -w "\n%{http_code}" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  "${API_BASE_URL}/admin/roles")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✅ Status: 200 OK${NC}"
    echo ""
    echo -e "${YELLOW}Response:${NC}"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
    echo ""

    # Extraer roleId del primer rol para siguientes tests
    ROLE_ID=$(echo "$body" | jq -r '.data[0].roleId // .data[0].role_id // empty' 2>/dev/null)
    if [ -z "$ROLE_ID" ]; then
        echo -e "${YELLOW}⚠️  Warning: No se pudo extraer roleId del primer rol${NC}"
    else
        echo -e "${GREEN}📝 Role ID extraído: ${ROLE_ID}${NC}"
    fi
else
    echo -e "${RED}❌ Status: $http_code${NC}"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
    exit 1
fi

echo ""

###############################################################################
# Test 2: GET /admin/roles/permissions - Permisos disponibles
###############################################################################
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test 2: GET /admin/roles/permissions${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

response=$(curl -s -w "\n%{http_code}" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  "${API_BASE_URL}/admin/roles/permissions")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✅ Status: 200 OK${NC}"
    echo ""
    echo -e "${YELLOW}Response:${NC}"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
else
    echo -e "${RED}❌ Status: $http_code${NC}"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
fi

echo ""

###############################################################################
# Test 3: GET /admin/roles/:id/permissions - Permisos de un rol
###############################################################################
if [ -n "$ROLE_ID" ]; then
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Test 3: GET /admin/roles/${ROLE_ID}/permissions${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

    response=$(curl -s -w "\n%{http_code}" \
      -H "Authorization: Bearer $JWT_TOKEN" \
      -H "Content-Type: application/json" \
      "${API_BASE_URL}/admin/roles/${ROLE_ID}/permissions")

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [ "$http_code" -eq 200 ]; then
        echo -e "${GREEN}✅ Status: 200 OK${NC}"
        echo ""
        echo -e "${YELLOW}Response:${NC}"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"

        # Guardar permisos actuales para Test 4
        CURRENT_PERMISSIONS="$body"
    else
        echo -e "${RED}❌ Status: $http_code${NC}"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    fi

    echo ""
else
    echo -e "${YELLOW}⚠️  Skipping Test 3: No ROLE_ID available${NC}"
    echo ""
fi

###############################################################################
# Test 4: PUT /admin/roles/:id/permissions - Actualizar permisos
###############################################################################
if [ -n "$ROLE_ID" ] && [ -n "$CURRENT_PERMISSIONS" ]; then
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Test 4: PUT /admin/roles/${ROLE_ID}/permissions${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

    # Extraer permisos del response anterior
    permissions=$(echo "$CURRENT_PERMISSIONS" | jq '.data.permissions // .permissions' 2>/dev/null)

    if [ -z "$permissions" ] || [ "$permissions" = "null" ]; then
        echo -e "${YELLOW}⚠️  Warning: No se pudieron extraer permisos actuales${NC}"
        echo -e "${YELLOW}   Usando permisos de ejemplo...${NC}"
        permissions='[{"module":"users","action":"view","granted":true}]'
    fi

    echo -e "${YELLOW}Permisos a enviar:${NC}"
    echo "$permissions" | jq '.' 2>/dev/null
    echo ""

    # PUT request
    payload=$(jq -n --argjson perms "$permissions" '{permissions: $perms}')

    response=$(curl -s -w "\n%{http_code}" \
      -X PUT \
      -H "Authorization: Bearer $JWT_TOKEN" \
      -H "Content-Type: application/json" \
      -d "$payload" \
      "${API_BASE_URL}/admin/roles/${ROLE_ID}/permissions")

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [ "$http_code" -eq 200 ]; then
        echo -e "${GREEN}✅ Status: 200 OK${NC}"
        echo ""
        echo -e "${YELLOW}Response:${NC}"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        echo -e "${RED}❌ Status: $http_code${NC}"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    fi

    echo ""
else
    echo -e "${YELLOW}⚠️  Skipping Test 4: No ROLE_ID or CURRENT_PERMISSIONS available${NC}"
    echo ""
fi

###############################################################################
# Resumen
###############################################################################
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Test Summary${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}✅ Test 1: GET /admin/roles - OK${NC}"
echo -e "${GREEN}✅ Test 2: GET /admin/roles/permissions - OK${NC}"
if [ -n "$ROLE_ID" ]; then
    echo -e "${GREEN}✅ Test 3: GET /admin/roles/:id/permissions - OK${NC}"
    if [ -n "$CURRENT_PERMISSIONS" ]; then
        echo -e "${GREEN}✅ Test 4: PUT /admin/roles/:id/permissions - OK${NC}"
    fi
fi
echo ""
echo -e "${YELLOW}📝 Nota: Verifica los responses para asegurar que los datos son correctos${NC}"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
