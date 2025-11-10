#!/bin/bash
# ============================================================================
# Script: fix-missing-gamification-tables.sh
# Descripción: Crea las tablas de gamificación faltantes (user_stats, user_ranks)
# Fecha: 2025-11-09
# Autor: Claude Code (AI Assistant)
# ============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DB_DIR="$(dirname "$SCRIPT_DIR")"

cd "$DB_DIR"

# Cargar credenciales
if [ ! -f "database-credentials-dev.txt" ]; then
    echo "❌ Error: database-credentials-dev.txt no encontrado"
    exit 1
fi

DB_PASSWORD=$(grep "^Password:" database-credentials-dev.txt | awk '{print $2}')
export PGPASSWORD="$DB_PASSWORD"

PSQL="psql -h localhost -p 5432 -U gamilit_user -d gamilit_platform"

echo "════════════════════════════════════════════════════════════════"
echo "  CREANDO TABLAS DE GAMIFICACIÓN FALTANTES"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Verificar si ya existen
echo "📋 Verificando estado actual..."
EXISTING_TABLES=$($PSQL -t -c "
SELECT COUNT(*)
FROM information_schema.tables
WHERE table_schema = 'gamification_system'
  AND table_name IN ('user_stats', 'user_ranks');
" | tr -d ' ')

echo "   Tablas existentes: $EXISTING_TABLES/2"
echo ""

# Crear tabla user_stats si no existe
if $PSQL -t -c "SELECT 1 FROM information_schema.tables WHERE table_schema = 'gamification_system' AND table_name = 'user_stats';" | grep -q 1; then
    echo "✅ Tabla user_stats ya existe"
else
    echo "📊 Creando tabla gamification_system.user_stats..."
    $PSQL -f ddl/schemas/gamification_system/tables/01-user_stats.sql > /dev/null 2>&1
    echo "✅ Tabla user_stats creada"
fi

echo ""

# Crear tabla user_ranks si no existe
if $PSQL -t -c "SELECT 1 FROM information_schema.tables WHERE table_schema = 'gamification_system' AND table_name = 'user_ranks';" | grep -q 1; then
    echo "✅ Tabla user_ranks ya existe"
else
    echo "🏆 Creando tabla gamification_system.user_ranks..."
    $PSQL -f ddl/schemas/gamification_system/tables/02-user_ranks.sql > /dev/null 2>&1
    echo "✅ Tabla user_ranks creada"
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  VERIFICANDO TABLAS CREADAS"
echo "════════════════════════════════════════════════════════════════"
echo ""

$PSQL -c "
SELECT
    table_name,
    '✅ Creada' as status
FROM information_schema.tables
WHERE table_schema = 'gamification_system'
  AND table_name IN ('user_stats', 'user_ranks', 'comodines_inventory')
ORDER BY table_name;
"

echo ""

# Contar columnas para verificación adicional
USER_STATS_COLS=$($PSQL -t -c "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'gamification_system' AND table_name = 'user_stats';" | tr -d ' ')
USER_RANKS_COLS=$($PSQL -t -c "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'gamification_system' AND table_name = 'user_ranks';" | tr -d ' ')

echo "📊 Detalles:"
echo "   user_stats: $USER_STATS_COLS columnas"
echo "   user_ranks: $USER_RANKS_COLS columnas"
echo ""
echo "✅ Tablas de gamificación listas"
echo "════════════════════════════════════════════════════════════════"
echo ""
