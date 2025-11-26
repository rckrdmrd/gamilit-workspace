#!/bin/bash
# =====================================================
# Script: Testing Manual - Fix de XP y Sistema de Rangos
# Fecha: 2025-11-24
# Propósito: Validar que XP se acumula y promociones funcionan
# =====================================================

# Configuración de conexión
export PGPASSWORD='3RZ2uYhCnJBXQqEwPPbZK3NFfk4T4W4Q'
DB_HOST="localhost"
DB_USER="gamilit_user"
DB_NAME="gamilit_platform"

PSQL="psql -h $DB_HOST -U $DB_USER -d $DB_NAME"

echo "========================================="
echo "TESTING MANUAL - FIX DE XP Y RANGOS"
echo "========================================="
echo ""

# =====================================================
# TEST 1: Verificar usuario de prueba existente
# =====================================================
echo "📋 TEST 1: Buscando usuario de prueba (student)..."
echo ""

TEST_USER_ID=$($PSQL -t -c "SELECT user_id FROM authentication.users WHERE email = 'student@gamilit.com' LIMIT 1;" | xargs)

if [ -z "$TEST_USER_ID" ]; then
    echo "❌ No se encontró usuario student@gamilit.com"
    echo "Por favor, usa otro usuario o crea uno de prueba."
    exit 1
fi

echo "✅ Usuario encontrado: $TEST_USER_ID"
echo ""

# =====================================================
# TEST 2: Ver estado inicial del usuario
# =====================================================
echo "========================================="
echo "📊 TEST 2: Estado INICIAL del usuario"
echo "========================================="
echo ""

$PSQL -c "
SELECT
    user_id,
    level,
    total_xp,
    current_rank,
    ml_coins,
    exercises_completed,
    modules_completed
FROM gamification_system.user_stats
WHERE user_id = '$TEST_USER_ID'::uuid;
"

echo ""
echo "💡 Apunta estos valores para comparar después del test."
echo ""

# =====================================================
# TEST 3: Simular ganancia de XP directamente en DB
# =====================================================
echo "========================================="
echo "🔧 TEST 3: Simular ganancia de +100 XP"
echo "========================================="
echo ""

read -p "¿Deseas simular +100 XP para este usuario? (s/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo "Actualizando XP..."

    $PSQL -c "
    UPDATE gamification_system.user_stats
    SET total_xp = total_xp + 100
    WHERE user_id = '$TEST_USER_ID'::uuid;
    "

    echo ""
    echo "✅ XP actualizado. Los triggers deberían ejecutarse automáticamente."
    echo ""

    # Dar tiempo para que triggers ejecuten
    sleep 1

    # =====================================================
    # TEST 4: Ver estado después de +100 XP
    # =====================================================
    echo "========================================="
    echo "📊 TEST 4: Estado DESPUÉS de +100 XP"
    echo "========================================="
    echo ""

    $PSQL -c "
    SELECT
        user_id,
        level,
        total_xp,
        current_rank,
        ml_coins,
        rank_progress,
        rank_achieved_at
    FROM gamification_system.user_stats
    WHERE user_id = '$TEST_USER_ID'::uuid;
    "

    echo ""
    echo "✅ Validaciones esperadas:"
    echo "   - total_xp debería AUMENTAR en 100 (no disminuir)"
    echo "   - level podría aumentar si alcanzó umbral"
    echo "   - current_rank podría cambiar si alcanzó 500, 1000, 1500 o 2250 XP"
    echo ""
fi

# =====================================================
# TEST 5: Verificar historial de rangos
# =====================================================
echo "========================================="
echo "📜 TEST 5: Historial de promociones"
echo "========================================="
echo ""

$PSQL -c "
SELECT
    old_rank,
    new_rank,
    xp_at_promotion,
    promoted_at
FROM gamification_system.rank_history
WHERE user_id = '$TEST_USER_ID'::uuid
ORDER BY promoted_at DESC
LIMIT 5;
"

echo ""

# =====================================================
# TEST 6: Verificar achievements de rank
# =====================================================
echo "========================================="
echo "🏆 TEST 6: Achievements de promoción"
echo "========================================="
echo ""

$PSQL -c "
SELECT
    achievement_code,
    unlocked_at,
    metadata
FROM gamification_system.user_achievements
WHERE user_id = '$TEST_USER_ID'::uuid
  AND achievement_code LIKE 'RANK_PROMOTION%'
ORDER BY unlocked_at DESC
LIMIT 5;
"

echo ""

# =====================================================
# TEST 7: Verificar notificaciones
# =====================================================
echo "========================================="
echo "🔔 TEST 7: Notificaciones de rank_up"
echo "========================================="
echo ""

$PSQL -c "
SELECT
    notification_type,
    title,
    body,
    is_read,
    created_at
FROM gamification_system.notifications
WHERE user_id = '$TEST_USER_ID'::uuid
  AND notification_type = 'rank_up'
ORDER BY created_at DESC
LIMIT 5;
"

echo ""

# =====================================================
# TEST 8: Simular promoción a Nacom (500 XP)
# =====================================================
echo "========================================="
echo "🚀 TEST 8: Promoción a Nacom (OPCIONAL)"
echo "========================================="
echo ""

CURRENT_XP=$($PSQL -t -c "SELECT total_xp FROM gamification_system.user_stats WHERE user_id = '$TEST_USER_ID'::uuid;" | xargs)

if [ "$CURRENT_XP" -lt 500 ]; then
    XP_NEEDED=$((500 - CURRENT_XP))
    echo "Usuario actual tiene $CURRENT_XP XP"
    echo "Necesita $XP_NEEDED XP más para llegar a Nacom (500 XP)"
    echo ""

    read -p "¿Deseas agregar $XP_NEEDED XP para forzar promoción a Nacom? (s/n): " -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Ss]$ ]]; then
        echo "Actualizando a 500 XP..."

        $PSQL -c "
        UPDATE gamification_system.user_stats
        SET total_xp = 500
        WHERE user_id = '$TEST_USER_ID'::uuid;
        "

        echo ""
        sleep 1

        echo "📊 Estado después de alcanzar 500 XP:"
        echo ""

        $PSQL -c "
        SELECT
            user_id,
            level,
            total_xp,
            current_rank,
            ml_coins
        FROM gamification_system.user_stats
        WHERE user_id = '$TEST_USER_ID'::uuid;
        "

        echo ""
        echo "✅ Validaciones esperadas:"
        echo "   - total_xp = 500"
        echo "   - current_rank = 'Nacom' (promocionado desde Ajaw)"
        echo "   - ml_coins debería aumentar +100 (bonus de promoción)"
        echo ""

        echo "🏆 Verificar achievement RANK_PROMOTION_NACOM:"
        echo ""

        $PSQL -c "
        SELECT
            achievement_code,
            unlocked_at
        FROM gamification_system.user_achievements
        WHERE user_id = '$TEST_USER_ID'::uuid
          AND achievement_code = 'RANK_PROMOTION_NACOM';
        "
    fi
else
    echo "✅ Usuario ya tiene $CURRENT_XP XP (≥ 500)"
    echo "Ya debería estar en rango Nacom o superior."
fi

echo ""

# =====================================================
# TEST 9: Distribución de rangos (todos los usuarios)
# =====================================================
echo "========================================="
echo "📊 TEST 9: Distribución global de rangos"
echo "========================================="
echo ""

$PSQL -c "
SELECT
    current_rank,
    COUNT(*) as total_users,
    ROUND(AVG(total_xp)) as avg_xp,
    MIN(total_xp) as min_xp,
    MAX(total_xp) as max_xp
FROM gamification_system.user_stats
GROUP BY current_rank
ORDER BY
    CASE current_rank
        WHEN 'Ajaw' THEN 1
        WHEN 'Nacom' THEN 2
        WHEN 'Ah K''in' THEN 3
        WHEN 'Halach Uinic' THEN 4
        WHEN 'K''uk''ulkan' THEN 5
    END;
"

echo ""
echo "✅ Distribución esperada (piramidal):"
echo "   - Ajaw: Mayoría de usuarios"
echo "   - Nacom: Algunos usuarios"
echo "   - Ah K'in: Pocos usuarios"
echo "   - Halach Uinic: Muy pocos"
echo "   - K'uk'ulkan: Rarísimos"
echo ""

# =====================================================
# TEST 10: Validar consistencia (usuarios fuera de rango)
# =====================================================
echo "========================================="
echo "⚠️  TEST 10: Validar consistencia de datos"
echo "========================================="
echo ""

echo "Buscando usuarios con XP alto pero rango bajo (bug potencial)..."
echo ""

$PSQL -c "
SELECT
    user_id,
    current_rank,
    total_xp,
    level,
    CASE
        WHEN current_rank = 'Ajaw' AND total_xp >= 500 THEN '❌ Debería ser Nacom'
        WHEN current_rank = 'Nacom' AND total_xp >= 1000 THEN '❌ Debería ser Ah K''in'
        WHEN current_rank = 'Ah K''in' AND total_xp >= 1500 THEN '❌ Debería ser Halach Uinic'
        WHEN current_rank = 'Halach Uinic' AND total_xp >= 2250 THEN '❌ Debería ser K''uk''ulkan'
        ELSE '✅ OK'
    END as status
FROM gamification_system.user_stats
WHERE
    (current_rank = 'Ajaw' AND total_xp >= 500)
    OR (current_rank = 'Nacom' AND total_xp >= 1000)
    OR (current_rank = 'Ah K''in' AND total_xp >= 1500)
    OR (current_rank = 'Halach Uinic' AND total_xp >= 2250)
ORDER BY total_xp DESC;
"

echo ""
echo "✅ Si no hay filas, todos los usuarios están correctamente rankeados."
echo "❌ Si hay filas, significa que hay usuarios que no fueron promocionados (bug)."
echo ""

# =====================================================
# RESUMEN FINAL
# =====================================================
echo "========================================="
echo "✅ TESTING COMPLETADO"
echo "========================================="
echo ""
echo "📝 Resumen de validaciones:"
echo ""
echo "1. ✅ Usuario de prueba identificado: $TEST_USER_ID"
echo "2. ⏳ Estado inicial documentado"
echo "3. 🧪 XP actualizado (+100 o +500 según tests ejecutados)"
echo "4. 📊 Estado final revisado"
echo "5. 📜 Historial de promociones verificado"
echo "6. 🏆 Achievements de rank verificados"
echo "7. 🔔 Notificaciones verificadas"
echo "8. 📊 Distribución global analizada"
echo "9. ⚠️  Consistencia de datos validada"
echo ""
echo "🎯 CRITERIOS DE ÉXITO:"
echo "   ✅ total_xp AUMENTA (no disminuye)"
echo "   ✅ level se calcula automáticamente desde XP"
echo "   ✅ current_rank cambia al alcanzar umbrales (500, 1000, 1500, 2250)"
echo "   ✅ ml_coins aumentan con bonus de promoción"
echo "   ✅ Achievements RANK_PROMOTION_* se crean"
echo "   ✅ Notificaciones rank_up se envían"
echo ""
echo "📄 Reporte completo en:"
echo "   orchestration/agentes/architecture-analyst/analisis-sistema-xp-rangos-2025-11-24/"
echo ""

# =====================================================
# Restaurar contraseña (por seguridad)
# =====================================================
unset PGPASSWORD
