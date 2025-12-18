#!/bin/bash
# =====================================================
# Script: verify-missions-status.sh
# Description: Verifica el estado de las misiones en la base de datos
# Author: Database-Agent
# Created: 2025-11-24
# =====================================================

set -e

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}VERIFICACIÓN DE MISIONES - GAMILIT${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Leer credenciales
DB_USER="gamilit_user"
DB_NAME="gamilit_platform"
DB_HOST="localhost"

# Verificar si existe el archivo de credenciales
if [ -f "database-credentials-dev.txt" ]; then
    DB_PASSWORD=$(grep "Password:" database-credentials-dev.txt | awk '{print $2}')
else
    echo -e "${YELLOW}⚠️  No se encontró archivo de credenciales${NC}"
    echo "Por favor ingresa la contraseña de la base de datos:"
    read -s DB_PASSWORD
fi

export PGPASSWORD="$DB_PASSWORD"

echo -e "${GREEN}1. RESUMEN GENERAL${NC}"
echo "-------------------------------------------"
psql -U "$DB_USER" -d "$DB_NAME" -h "$DB_HOST" -c "
SELECT
    COUNT(*) as total_missions,
    COUNT(DISTINCT user_id) as unique_users,
    SUM(CASE WHEN mission_type = 'daily' THEN 1 ELSE 0 END) as daily_missions,
    SUM(CASE WHEN mission_type = 'weekly' THEN 1 ELSE 0 END) as weekly_missions
FROM gamification_system.missions;
"

echo ""
echo -e "${GREEN}2. USUARIOS CON Y SIN MISIONES${NC}"
echo "-------------------------------------------"
psql -U "$DB_USER" -d "$DB_NAME" -h "$DB_HOST" -c "
SELECT
    CASE
        WHEN email LIKE '%@gamilit.com' THEN 'Test Users'
        ELSE 'Production Users'
    END as user_type,
    COUNT(*) as total_users,
    SUM(CASE WHEN has_missions THEN 1 ELSE 0 END) as with_missions,
    SUM(CASE WHEN NOT has_missions THEN 1 ELSE 0 END) as without_missions
FROM (
    SELECT
        p.email,
        EXISTS (SELECT 1 FROM gamification_system.missions m WHERE m.user_id = p.id) as has_missions
    FROM auth_management.profiles p
) subq
GROUP BY user_type
ORDER BY user_type;
"

echo ""
echo -e "${GREEN}3. DISTRIBUCIÓN DE MISIONES POR USUARIO${NC}"
echo "-------------------------------------------"
psql -U "$DB_USER" -d "$DB_NAME" -h "$DB_HOST" -c "
SELECT
    p.email,
    p.role,
    COUNT(m.id) as total_missions,
    SUM(CASE WHEN m.mission_type = 'daily' THEN 1 ELSE 0 END) as daily,
    SUM(CASE WHEN m.mission_type = 'weekly' THEN 1 ELSE 0 END) as weekly,
    CASE
        WHEN COUNT(m.id) = 0 THEN '❌ Sin misiones'
        WHEN COUNT(m.id) = 8 THEN '✅ OK (8)'
        WHEN COUNT(m.id) > 8 THEN '⚠️  Duplicadas (' || COUNT(m.id) || ')'
        ELSE '⚠️  Incompletas (' || COUNT(m.id) || ')'
    END as status
FROM auth_management.profiles p
LEFT JOIN gamification_system.missions m ON p.id = m.user_id
GROUP BY p.email, p.role
ORDER BY
    CASE WHEN p.email LIKE '%@gamilit.com' THEN 0 ELSE 1 END,
    p.email;
"

echo ""
echo -e "${GREEN}4. MISIONES POR TEMPLATE${NC}"
echo "-------------------------------------------"
psql -U "$DB_USER" -d "$DB_NAME" -h "$DB_HOST" -c "
SELECT
    template_id,
    mission_type,
    COUNT(DISTINCT user_id) as users_with_mission,
    COUNT(*) as total_instances,
    CASE
        WHEN COUNT(*) = COUNT(DISTINCT user_id) THEN '✅ No duplicadas'
        ELSE '⚠️  ' || (COUNT(*) - COUNT(DISTINCT user_id)) || ' duplicadas'
    END as status
FROM gamification_system.missions
GROUP BY template_id, mission_type
ORDER BY mission_type, template_id;
"

echo ""
echo -e "${GREEN}5. USUARIOS SIN MISIONES (si existen)${NC}"
echo "-------------------------------------------"
psql -U "$DB_USER" -d "$DB_NAME" -h "$DB_HOST" -c "
SELECT
    p.email,
    p.role,
    p.created_at::date as created_date
FROM auth_management.profiles p
WHERE NOT EXISTS (
    SELECT 1 FROM gamification_system.missions m WHERE m.user_id = p.id
)
ORDER BY p.created_at;
"

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}VERIFICACIÓN COMPLETADA${NC}"
echo -e "${BLUE}========================================${NC}"

# Limpiar variable de entorno
unset PGPASSWORD
