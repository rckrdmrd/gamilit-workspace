#!/bin/bash
# =====================================================
# Script de Testing: Sistema de Reenvío de Ejercicios
# Fecha: 2025-11-24
# Propósito: Validar arquitectura dual attempts/submissions
# =====================================================

set -e

DB_PASSWORD="${DB_PASSWORD:-${GAMILIT_DB_PASSWORD:-}}"
if [ -z "$DB_PASSWORD" ]; then
  echo "ERROR: define DB_PASSWORD o GAMILIT_DB_PASSWORD antes de ejecutar."
  exit 1
fi

echo "========================================="
echo "🧪 TEST: Sistema de Reenvío de Ejercicios"
echo "========================================="
echo ""

# Test 1: Verificar columna exists
echo "📋 Test 1: Verificar columna requires_manual_grading existe"
echo "---------------------------------------------------------"
PGPASSWORD="${DB_PASSWORD}" psql -h localhost -U gamilit_user -d gamilit_platform -c "
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'educational_content'
  AND table_name = 'exercises'
  AND column_name = 'requires_manual_grading';
"
echo ""

# Test 2: Distribución de ejercicios
echo "📊 Test 2: Distribución de ejercicios por tipo"
echo "---------------------------------------------------------"
PGPASSWORD="${DB_PASSWORD}" psql -h localhost -U gamilit_user -d gamilit_platform -c "
SELECT
  requires_manual_grading,
  COUNT(*) as total,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
FROM educational_content.exercises
GROUP BY requires_manual_grading
ORDER BY requires_manual_grading;
"
echo ""

# Test 3: Verificar estudiante de prueba
echo "👤 Test 3: Verificar estudiante de prueba (bbbbbbbb...)"
echo "---------------------------------------------------------"
PGPASSWORD="${DB_PASSWORD}" psql -h localhost -U gamilit_user -d gamilit_platform -c "
SELECT
  p.id as profile_id,
  p.email,
  us.level,
  us.current_rank,
  us.total_xp,
  us.ml_coins
FROM auth_management.profiles p
LEFT JOIN gamification_system.user_stats us ON us.user_id = p.id
WHERE p.id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
"
echo ""

# Test 4: Ejercicios disponibles para testing
echo "🎯 Test 4: Ejercicios disponibles para testing (Módulo 2 y 3)"
echo "---------------------------------------------------------"
PGPASSWORD="${DB_PASSWORD}" psql -h localhost -U gamilit_user -d gamilit_platform -c "
SELECT
  e.id,
  m.order_index as modulo,
  e.order_index as ejercicio,
  e.title,
  e.exercise_type,
  e.requires_manual_grading as manual,
  e.xp_reward as xp,
  e.ml_coins_reward as coins
FROM educational_content.exercises e
JOIN educational_content.modules m ON m.id = e.module_id
WHERE m.order_index IN (2, 3)
  AND e.is_active = true
ORDER BY m.order_index, e.order_index
LIMIT 10;
"
echo ""

# Test 5: Historial de intentos del estudiante
echo "📝 Test 5: Historial de intentos previos del estudiante"
echo "---------------------------------------------------------"
PGPASSWORD="${DB_PASSWORD}" psql -h localhost -U gamilit_user -d gamilit_platform -c "
SELECT
  e.title as ejercicio,
  ea.is_correct,
  ea.score,
  ea.xp_earned,
  ea.ml_coins_earned,
  ea.submitted_at
FROM progress_tracking.exercise_attempts ea
JOIN educational_content.exercises e ON e.id = ea.exercise_id
WHERE ea.user_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
ORDER BY ea.submitted_at DESC
LIMIT 10;
"
echo ""

# Test 6: Verificar que no hay registros en exercise_submissions para autocorregibles
echo "🔍 Test 6: Verificar NO hay ejercicios autocorregibles en submissions"
echo "---------------------------------------------------------"
PGPASSWORD="${DB_PASSWORD}" psql -h localhost -U gamilit_user -d gamilit_platform -c "
SELECT
  COUNT(*) as total_incorrectos,
  'Este número debe ser 0' as nota
FROM progress_tracking.exercise_submissions es
JOIN educational_content.exercises e ON e.id = es.exercise_id
WHERE e.requires_manual_grading = false;
"
echo ""

echo "========================================="
echo "✅ Tests de verificación completados"
echo "========================================="
echo ""
echo "📌 PRÓXIMO PASO:"
echo "   Usar la aplicación frontend para:"
echo "   1. Completar un ejercicio de Módulo 2 o 3"
echo "   2. Intentar reenviar el mismo ejercicio"
echo "   3. Verificar que se permite el reenvío"
echo "   4. Verificar que XP solo se otorga en primer acierto"
echo ""
