#!/bin/bash

# Script para probar el endpoint de registro con auto-login
# Fecha: 2025-11-24
# Uso: ./test-register-auto-login.sh

set -e

echo "=========================================="
echo "TEST: POST /auth/register (Auto-Login)"
echo "=========================================="
echo ""

# Generar email único con timestamp
TIMESTAMP=$(date +%s)
TEST_EMAIL="test_${TIMESTAMP}@example.com"

echo "📋 Datos de prueba:"
echo "  Email: $TEST_EMAIL"
echo "  Password: Test1234!"
echo "  First Name: Test"
echo "  Last Name: User"
echo ""

echo "🚀 Enviando petición de registro..."
echo ""

RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'"$TEST_EMAIL"'",
    "password": "Test1234!",
    "first_name": "Test",
    "last_name": "User"
  }')

# Extraer HTTP code
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE:/d')

echo "📊 Respuesta del servidor:"
echo "  HTTP Status: $HTTP_CODE"
echo ""

if [ "$HTTP_CODE" != "201" ]; then
  echo "❌ ERROR: Se esperaba HTTP 201, pero se obtuvo $HTTP_CODE"
  echo ""
  echo "Body de respuesta:"
  echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
  exit 1
fi

echo "✅ HTTP 201 - Usuario creado exitosamente"
echo ""

# Parsear JSON con jq
echo "🔍 Validando estructura de respuesta..."
echo ""

# Verificar que existan los campos esperados
USER_ID=$(echo "$BODY" | jq -r '.user.id // empty')
USER_EMAIL=$(echo "$BODY" | jq -r '.user.email // empty')
ACCESS_TOKEN=$(echo "$BODY" | jq -r '.accessToken // empty')
REFRESH_TOKEN=$(echo "$BODY" | jq -r '.refreshToken // empty')

# Validaciones
ERRORS=0

if [ -z "$USER_ID" ]; then
  echo "❌ ERROR: Campo 'user.id' no encontrado o vacío"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ Campo 'user.id' presente: $USER_ID"
fi

if [ -z "$USER_EMAIL" ]; then
  echo "❌ ERROR: Campo 'user.email' no encontrado o vacío"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ Campo 'user.email' presente: $USER_EMAIL"
fi

if [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ ERROR: Campo 'accessToken' no encontrado o vacío"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ Campo 'accessToken' presente (longitud: ${#ACCESS_TOKEN})"
fi

if [ -z "$REFRESH_TOKEN" ]; then
  echo "❌ ERROR: Campo 'refreshToken' no encontrado o vacío"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ Campo 'refreshToken' presente (longitud: ${#REFRESH_TOKEN})"
fi

echo ""

if [ $ERRORS -gt 0 ]; then
  echo "❌ Validación FALLIDA: $ERRORS errores encontrados"
  echo ""
  echo "Body completo de respuesta:"
  echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
  exit 1
fi

echo "=========================================="
echo "✅ TODAS LAS VALIDACIONES PASARON"
echo "=========================================="
echo ""

# Mostrar respuesta formateada
echo "📋 Respuesta completa (formateada):"
echo "$BODY" | jq '{
  user: {
    id: .user.id,
    email: .user.email,
    role: .user.role,
    emailVerified: .user.emailVerified,
    isActive: .user.isActive
  },
  accessToken: .accessToken[0:50] + "...",
  refreshToken: .refreshToken[0:50] + "..."
}'

echo ""
echo "=========================================="
echo "TEST FINALIZADO EXITOSAMENTE"
echo "=========================================="
echo ""
echo "💡 Siguiente paso: Probar login con estos tokens"
echo "   curl -X GET http://localhost:3000/api/auth/profile \\"
echo "     -H \"Authorization: Bearer $ACCESS_TOKEN\""
echo ""
