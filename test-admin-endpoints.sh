#!/bin/bash

# Script de validación para BUG-ADMIN-002, 003, 004
# Endpoints: /admin/actions/recent, /admin/alerts, /admin/analytics/user-activity

BASE_URL="http://localhost:3000"

echo "========================================"
echo "VALIDACIÓN ENDPOINTS ADMIN DASHBOARD"
echo "BUG-ADMIN-002, 003, 004"
echo "========================================"
echo ""

# Verificar si el servidor está corriendo
if ! curl -s "$BASE_URL/health" > /dev/null 2>&1; then
  echo "❌ ERROR: Servidor backend no está corriendo en $BASE_URL"
  echo "Por favor ejecutar: cd apps/backend && npm run start:dev"
  exit 1
fi

echo "✅ Servidor backend activo"
echo ""

# Test 1: GET /admin/actions/recent (BUG-ADMIN-002)
echo "TEST 1: GET /admin/actions/recent (BUG-ADMIN-002)"
echo "-------------------------------------------"
RESPONSE=$(curl -s "$BASE_URL/admin/dashboard/actions/recent?limit=5")
echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
echo ""

# Test 2: GET /admin/alerts (BUG-ADMIN-003)
echo "TEST 2: GET /admin/alerts (BUG-ADMIN-003)"
echo "-------------------------------------------"
RESPONSE=$(curl -s "$BASE_URL/admin/dashboard/alerts")
echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
echo ""

# Test 3: GET /admin/analytics/user-activity (BUG-ADMIN-004)
echo "TEST 3: GET /admin/analytics/user-activity (BUG-ADMIN-004)"
echo "-------------------------------------------"
RESPONSE=$(curl -s "$BASE_URL/admin/dashboard/analytics/user-activity?groupBy=day")
echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
echo ""

# Test 4: Verificar parámetros de query
echo "TEST 4: Parámetros de query (groupBy=week)"
echo "-------------------------------------------"
RESPONSE=$(curl -s "$BASE_URL/admin/dashboard/analytics/user-activity?groupBy=week&startDate=2025-11-01T00:00:00Z&endDate=2025-11-30T23:59:59Z")
echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
echo ""

echo "========================================"
echo "VALIDACIÓN COMPLETADA"
echo "========================================"
echo ""
echo "Verificar:"
echo "1. ✅ GET /admin/actions/recent retorna array de acciones"
echo "2. ✅ GET /admin/alerts retorna array de alertas"
echo "3. ✅ GET /admin/analytics/user-activity retorna {labels: [], data: []}"
echo "4. ✅ Datos son dinámicos (no hardcodeados)"
