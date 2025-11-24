#!/bin/bash
# COMANDOS DE VALIDACIÓN RÁPIDA - EJERCICIO 1.3
# Fecha: 2025-11-24
# Agente: Database-Agent
# Uso: ./COMANDOS-VALIDACION-RAPIDA.sh

set -e

echo "🔍 VALIDACIÓN RÁPIDA EJERCICIO 1.3"
echo "===================================="
echo ""

PGPASSWORD='3RZ2uYhCnJBXQqEwPPbZK3NFfk4T4W4Q'
PGUSER='gamilit_user'
PGHOST='localhost'
PGDATABASE='gamilit_platform'

# Test 1: Verificar ejercicio existe
echo "📋 Test 1: Verificar ejercicio 1.3 existe..."
RESULT=$(PGPASSWORD=$PGPASSWORD psql -h $PGHOST -U $PGUSER -d $PGDATABASE -t -c "SELECT COUNT(*) FROM educational_content.exercises WHERE exercise_type = 'completar_espacios' AND order_index = 3;")
if [ "$RESULT" -eq 1 ]; then
    echo "✅ PASADO: Ejercicio 1.3 existe"
else
    echo "❌ FALLADO: Ejercicio 1.3 no encontrado"
    exit 1
fi
echo ""

# Test 2: Verificar estructura alternatives
echo "📋 Test 2: Verificar estructura alternatives..."
RESULT=$(PGPASSWORD=$PGPASSWORD psql -h $PGHOST -U $PGUSER -d $PGDATABASE -t -c "SELECT COUNT(*) FROM educational_content.exercises WHERE exercise_type = 'completar_espacios' AND order_index = 3 AND content->'blanks'->4->'alternatives' IS NOT NULL AND content->'blanks'->5->'alternatives' IS NOT NULL;")
if [ "$RESULT" -eq 1 ]; then
    echo "✅ PASADO: Alternatives presentes en blank_5 y blank_6"
else
    echo "❌ FALLADO: Alternatives no encontradas"
    exit 1
fi
echo ""

# Test 3: Validación ciencias + física (100%)
echo "📋 Test 3: Validación ciencias + física..."
RESULT=$(PGPASSWORD=$PGPASSWORD psql -h $PGHOST -U $PGUSER -d $PGDATABASE -t -c "SELECT score FROM educational_content.validate_and_audit((SELECT id FROM educational_content.exercises WHERE exercise_type = 'completar_espacios' AND order_index = 3 LIMIT 1), (SELECT id FROM auth_management.profiles LIMIT 1), '{\"blanks\": {\"1\": \"Varsovia\", \"2\": \"Władysław\", \"3\": \"Bronisława\", \"4\": \"educación\", \"5\": \"ciencias\", \"6\": \"física\"}}'::jsonb, 1, '{}'::jsonb);")
if [ "$RESULT" -eq 100 ]; then
    echo "✅ PASADO: ciencias + física = 100%"
else
    echo "❌ FALLADO: ciencias + física = $RESULT% (esperado: 100%)"
    exit 1
fi
echo ""

# Test 4: Validación física + matemáticas (100%)
echo "📋 Test 4: Validación física + matemáticas..."
RESULT=$(PGPASSWORD=$PGPASSWORD psql -h $PGHOST -U $PGUSER -d $PGDATABASE -t -c "SELECT score FROM educational_content.validate_and_audit((SELECT id FROM educational_content.exercises WHERE exercise_type = 'completar_espacios' AND order_index = 3 LIMIT 1), (SELECT id FROM auth_management.profiles LIMIT 1), '{\"blanks\": {\"1\": \"Varsovia\", \"2\": \"Władysław\", \"3\": \"Bronisława\", \"4\": \"educación\", \"5\": \"física\", \"6\": \"matemáticas\"}}'::jsonb, 1, '{}'::jsonb);")
if [ "$RESULT" -eq 100 ]; then
    echo "✅ PASADO: física + matemáticas = 100%"
else
    echo "❌ FALLADO: física + matemáticas = $RESULT% (esperado: 100%)"
    exit 1
fi
echo ""

# Test 5: Validación respuesta incorrecta (83%)
echo "📋 Test 5: Validación respuesta incorrecta..."
RESULT=$(PGPASSWORD=$PGPASSWORD psql -h $PGHOST -U $PGUSER -d $PGDATABASE -t -c "SELECT score FROM educational_content.validate_and_audit((SELECT id FROM educational_content.exercises WHERE exercise_type = 'completar_espacios' AND order_index = 3 LIMIT 1), (SELECT id FROM auth_management.profiles LIMIT 1), '{\"blanks\": {\"1\": \"Varsovia\", \"2\": \"Władysław\", \"3\": \"Bronisława\", \"4\": \"educación\", \"5\": \"Polonia\", \"6\": \"matemáticas\"}}'::jsonb, 1, '{}'::jsonb);")
if [ "$RESULT" -eq 83 ]; then
    echo "✅ PASADO: Polonia + matemáticas = 83% (5/6 correctos)"
else
    echo "❌ FALLADO: Polonia + matemáticas = $RESULT% (esperado: 83%)"
    exit 1
fi
echo ""

echo "=================================="
echo "✅ VALIDACIÓN COMPLETA: 5/5 TESTS PASADOS"
echo "=================================="
