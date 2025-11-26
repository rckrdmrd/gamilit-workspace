#!/bin/bash
# Script de prueba para endpoint PUT /admin/users/:id
# FE-P1-010: Validación de actualización de usuarios

BASE_URL="http://localhost:3006/api/v1"
ADMIN_TOKEN=""

echo "==================================================================="
echo "TEST: PUT /admin/users/:id - Actualización de Usuario"
echo "==================================================================="

# Test 1: Update user basic fields
echo -e "\n1. Actualizar campos básicos de usuario"
curl -X PUT "${BASE_URL}/admin/users/test-user-id" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Usuario Actualizado",
    "email": "updated@example.com",
    "role": "student",
    "status": "active"
  }' | jq .

echo -e "\n\n==================================================================="
echo "Pruebas completadas"
echo "==================================================================="
