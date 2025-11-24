#!/bin/bash
# ============================================================================
# COMANDOS DE VALIDACIÓN - GAP-EJERCICIO-1.3-001
# Fecha: 2025-11-24
# Descripción: Scripts para validar soporte de alternativas en ejercicio 1.3
# ============================================================================

set -e

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================="
echo "VALIDACIÓN: GAP-EJERCICIO-1.3-001"
echo "========================================="
echo ""

# ============================================================================
# 1. RECREAR BASE DE DATOS
# ============================================================================
echo -e "${YELLOW}[FASE 1] Recreando base de datos...${NC}"
cd /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database
export DATABASE_URL="postgresql://gamilit_user:3RZ2uYhCnJBXQqEwPPbZK3NFfk4T4W4Q@localhost:5432/gamilit_platform"
./drop-and-recreate-database.sh > /tmp/db-recreation.log 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Base de datos recreada exitosamente${NC}"
else
    echo -e "${RED}❌ Error recreando base de datos${NC}"
    cat /tmp/db-recreation.log
    exit 1
fi

echo ""

# ============================================================================
# 2. CARGAR SEEDS
# ============================================================================
echo -e "${YELLOW}[FASE 2] Cargando seeds...${NC}"
export PGPASSWORD="3RZ2uYhCnJBXQqEwPPbZK3NFfk4T4W4Q"

psql -h localhost -U gamilit_user -d gamilit_platform -f seeds/prod/auth_management/01-tenants.sql -q
psql -h localhost -U gamilit_user -d gamilit_platform -f seeds/prod/auth_management/06-profiles-production.sql -q 2>&1 | grep -v "ERROR.*foreign key" || true
psql -h localhost -U gamilit_user -d gamilit_platform -f seeds/prod/educational_content/01-modules.sql -q
psql -h localhost -U gamilit_user -d gamilit_platform -f seeds/prod/educational_content/02-exercises-module1.sql -q

echo -e "${GREEN}✅ Seeds cargados${NC}"
echo ""

# ============================================================================
# 3. CREAR USUARIO DE PRUEBA
# ============================================================================
echo -e "${YELLOW}[FASE 3] Creando usuario de prueba...${NC}"

psql -h localhost -U gamilit_user -d gamilit_platform -q << 'EOF'
INSERT INTO auth.users (id, email)
VALUES (gen_random_uuid(), 'test@validation.com')
ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email;
EOF

echo -e "${GREEN}✅ Usuario de prueba creado${NC}"
echo ""

# ============================================================================
# 4. EJECUTAR TESTS DE VALIDACIÓN
# ============================================================================
echo -e "${YELLOW}[FASE 4] Ejecutando tests de validación...${NC}"
echo ""

psql -h localhost -U gamilit_user -d gamilit_platform << 'EOF'
\echo '========================================='
\echo 'TESTS DE VALIDACIÓN - EJERCICIO 1.3'
\echo '========================================='
\echo ''

-- Obtener IDs
DO $$
DECLARE
    v_exercise_id UUID;
    v_user_id UUID;
BEGIN
    SELECT id INTO v_exercise_id FROM educational_content.exercises WHERE exercise_type = 'completar_espacios' AND order_index = 3 LIMIT 1;
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'test@validation.com' LIMIT 1;

    RAISE NOTICE 'Exercise ID: %', v_exercise_id;
    RAISE NOTICE 'User ID: %', v_user_id;
END $$;

\echo ''
\echo 'Test 1: ciencias + física'
SELECT
    score,
    is_correct,
    CASE
        WHEN score = 100 AND is_correct = true THEN '✅ PASS'
        ELSE '❌ FAIL (esperado: 100 puntos, true)'
    END as result
FROM educational_content.validate_and_audit(
    (SELECT id FROM educational_content.exercises WHERE exercise_type = 'completar_espacios' AND order_index = 3 LIMIT 1),
    (SELECT id FROM auth.users WHERE email = 'test@validation.com' LIMIT 1),
    '{"blanks": {"1": "Varsovia", "2": "Władysław", "3": "Bronisława", "4": "educación", "5": "ciencias", "6": "física"}}'::jsonb,
    1,
    '{}'::jsonb
);
\echo ''

\echo 'Test 2: ciencias + matemáticas (original)'
SELECT
    score,
    is_correct,
    CASE
        WHEN score = 100 AND is_correct = true THEN '✅ PASS'
        ELSE '❌ FAIL (esperado: 100 puntos, true)'
    END as result
FROM educational_content.validate_and_audit(
    (SELECT id FROM educational_content.exercises WHERE exercise_type = 'completar_espacios' AND order_index = 3 LIMIT 1),
    (SELECT id FROM auth.users WHERE email = 'test@validation.com' LIMIT 1),
    '{"blanks": {"1": "Varsovia", "2": "Władysław", "3": "Bronisława", "4": "educación", "5": "ciencias", "6": "matemáticas"}}'::jsonb,
    1,
    '{}'::jsonb
);
\echo ''

\echo 'Test 3: física + matemáticas'
SELECT
    score,
    is_correct,
    CASE
        WHEN score = 100 AND is_correct = true THEN '✅ PASS'
        ELSE '❌ FAIL (esperado: 100 puntos, true)'
    END as result
FROM educational_content.validate_and_audit(
    (SELECT id FROM educational_content.exercises WHERE exercise_type = 'completar_espacios' AND order_index = 3 LIMIT 1),
    (SELECT id FROM auth.users WHERE email = 'test@validation.com' LIMIT 1),
    '{"blanks": {"1": "Varsovia", "2": "Władysław", "3": "Bronisława", "4": "educación", "5": "física", "6": "matemáticas"}}'::jsonb,
    1,
    '{}'::jsonb
);
\echo ''

\echo 'Test 4: matemáticas + ciencias'
SELECT
    score,
    is_correct,
    CASE
        WHEN score = 100 AND is_correct = true THEN '✅ PASS'
        ELSE '❌ FAIL (esperado: 100 puntos, true)'
    END as result
FROM educational_content.validate_and_audit(
    (SELECT id FROM educational_content.exercises WHERE exercise_type = 'completar_espacios' AND order_index = 3 LIMIT 1),
    (SELECT id FROM auth.users WHERE email = 'test@validation.com' LIMIT 1),
    '{"blanks": {"1": "Varsovia", "2": "Władysław", "3": "Bronisława", "4": "educación", "5": "matemáticas", "6": "ciencias"}}'::jsonb,
    1,
    '{}'::jsonb
);
\echo ''

\echo 'Test 5: matemáticas + física'
SELECT
    score,
    is_correct,
    CASE
        WHEN score = 100 AND is_correct = true THEN '✅ PASS'
        ELSE '❌ FAIL (esperado: 100 puntos, true)'
    END as result
FROM educational_content.validate_and_audit(
    (SELECT id FROM educational_content.exercises WHERE exercise_type = 'completar_espacios' AND order_index = 3 LIMIT 1),
    (SELECT id FROM auth.users WHERE email = 'test@validation.com' LIMIT 1),
    '{"blanks": {"1": "Varsovia", "2": "Władysław", "3": "Bronisława", "4": "educación", "5": "matemáticas", "6": "física"}}'::jsonb,
    1,
    '{}'::jsonb
);
\echo ''

\echo 'Test 6: física + ciencias'
SELECT
    score,
    is_correct,
    CASE
        WHEN score = 100 AND is_correct = true THEN '✅ PASS'
        ELSE '❌ FAIL (esperado: 100 puntos, true)'
    END as result
FROM educational_content.validate_and_audit(
    (SELECT id FROM educational_content.exercises WHERE exercise_type = 'completar_espacios' AND order_index = 3 LIMIT 1),
    (SELECT id FROM auth.users WHERE email = 'test@validation.com' LIMIT 1),
    '{"blanks": {"1": "Varsovia", "2": "Władysław", "3": "Bronisława", "4": "educación", "5": "física", "6": "ciencias"}}'::jsonb,
    1,
    '{}'::jsonb
);
\echo ''

\echo 'Test 7: Polonia en espacio 5 (incorrecto)'
SELECT
    score,
    is_correct,
    CASE
        WHEN score = 83 AND is_correct = false THEN '✅ PASS'
        ELSE '❌ FAIL (esperado: 83 puntos, false)'
    END as result
FROM educational_content.validate_and_audit(
    (SELECT id FROM educational_content.exercises WHERE exercise_type = 'completar_espacios' AND order_index = 3 LIMIT 1),
    (SELECT id FROM auth.users WHERE email = 'test@validation.com' LIMIT 1),
    '{"blanks": {"1": "Varsovia", "2": "Władysław", "3": "Bronisława", "4": "educación", "5": "Polonia", "6": "matemáticas"}}'::jsonb,
    1,
    '{}'::jsonb
);
\echo ''

\echo '========================================='
\echo 'FIN DE TESTS'
\echo '========================================='
EOF

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}VALIDACIÓN COMPLETA${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "Logs guardados en:"
echo "  - /tmp/db-recreation.log"
echo ""
echo "Para ver detalles de la implementación:"
echo "  cat orchestration/agentes/database/ejercicio-1-3-validacion-alternativas-2025-11-24/03-VALIDACION-DATABASE.md"
echo ""
