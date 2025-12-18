#!/bin/bash
# ============================================================================
# GAMILIT - Script de Reparacion de Datos Faltantes
# ============================================================================
# Uso: ./scripts/repair-missing-data.sh
#
# Este script verifica y repara datos faltantes en produccion:
# - Tenants (critico para registro)
# - Modulos educativos
# - Rangos Maya
# - Feature flags
# - Otros datos de configuracion
#
# Variables de entorno requeridas:
#   DATABASE_URL - URL de conexion a PostgreSQL
#
# IMPORTANTE: Este script es SEGURO de ejecutar multiples veces.
#             Usa ON CONFLICT para evitar duplicados.
#
# ============================================================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuracion
DATABASE_URL="${DATABASE_URL:-postgresql://gamilit_user:PASSWORD@localhost:5432/gamilit_platform}"

# Obtener directorio del script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DB_DIR="$PROJECT_DIR/apps/database"

echo -e "${BLUE}"
echo "=============================================="
echo "   REPARACION DE DATOS FALTANTES - GAMILIT"
echo "=============================================="
echo -e "${NC}"
echo "Fecha: $(date)"
echo "Database: ${DATABASE_URL%%@*}@..."
echo ""

# Verificar conexion
echo -e "${YELLOW}Verificando conexion a BD...${NC}"
if ! psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${RED}ERROR: No se puede conectar a la base de datos${NC}"
    echo "Verifica DATABASE_URL y que PostgreSQL este corriendo"
    exit 1
fi
echo -e "${GREEN}Conexion OK${NC}"
echo ""

# ============================================================================
# 1. VERIFICAR Y REPARAR TENANTS
# ============================================================================
echo -e "${YELLOW}=== 1. Verificando Tenants ===${NC}"

tenant_count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM auth_management.tenants WHERE is_active = true;" 2>/dev/null | tr -d ' ')
main_tenant=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM auth_management.tenants WHERE slug = 'gamilit-prod';" 2>/dev/null | tr -d ' ')

if [ "$main_tenant" -eq 0 ]; then
    echo -e "${RED}❌ Tenant principal 'gamilit-prod' NO existe${NC}"
    echo "Cargando seeds de tenants..."

    if [ -f "$DB_DIR/seeds/prod/auth_management/01-tenants.sql" ]; then
        psql "$DATABASE_URL" -f "$DB_DIR/seeds/prod/auth_management/01-tenants.sql" > /dev/null 2>&1
        echo -e "${GREEN}✅ Tenant principal cargado${NC}"
    else
        echo -e "${RED}ERROR: No se encuentra el archivo de seeds${NC}"
        echo "Path esperado: $DB_DIR/seeds/prod/auth_management/01-tenants.sql"
    fi

    if [ -f "$DB_DIR/seeds/prod/auth_management/02-tenants-production.sql" ]; then
        psql "$DATABASE_URL" -f "$DB_DIR/seeds/prod/auth_management/02-tenants-production.sql" > /dev/null 2>&1
        echo -e "${GREEN}✅ Tenants de produccion cargados${NC}"
    fi
else
    echo -e "${GREEN}✅ Tenant principal existe ($tenant_count tenants activos)${NC}"
fi
echo ""

# ============================================================================
# 2. VERIFICAR Y REPARAR MODULOS
# ============================================================================
echo -e "${YELLOW}=== 2. Verificando Modulos Educativos ===${NC}"

module_count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM educational_content.modules;" 2>/dev/null | tr -d ' ')

if [ "$module_count" -lt 5 ]; then
    echo -e "${YELLOW}⚠️  Modulos incompletos ($module_count de 5)${NC}"
    echo "Cargando seeds de modulos..."

    if [ -f "$DB_DIR/seeds/prod/educational_content/01-modules.sql" ]; then
        psql "$DATABASE_URL" -f "$DB_DIR/seeds/prod/educational_content/01-modules.sql" > /dev/null 2>&1
        echo -e "${GREEN}✅ Modulos cargados${NC}"
    else
        echo -e "${RED}ERROR: No se encuentra el archivo de seeds${NC}"
    fi
else
    echo -e "${GREEN}✅ Modulos OK ($module_count)${NC}"
fi
echo ""

# ============================================================================
# 3. VERIFICAR Y REPARAR RANGOS MAYA
# ============================================================================
echo -e "${YELLOW}=== 3. Verificando Rangos Maya ===${NC}"

rank_count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM gamification_system.maya_ranks;" 2>/dev/null | tr -d ' ')

if [ "$rank_count" -lt 5 ]; then
    echo -e "${YELLOW}⚠️  Rangos Maya incompletos ($rank_count de 5)${NC}"
    echo "Cargando seeds de rangos..."

    if [ -f "$DB_DIR/seeds/prod/gamification_system/03-maya_ranks.sql" ]; then
        psql "$DATABASE_URL" -f "$DB_DIR/seeds/prod/gamification_system/03-maya_ranks.sql" > /dev/null 2>&1
        echo -e "${GREEN}✅ Rangos Maya cargados${NC}"
    else
        echo -e "${RED}ERROR: No se encuentra el archivo de seeds${NC}"
    fi
else
    echo -e "${GREEN}✅ Rangos Maya OK ($rank_count)${NC}"
fi
echo ""

# ============================================================================
# 4. VERIFICAR Y REPARAR FEATURE FLAGS
# ============================================================================
echo -e "${YELLOW}=== 4. Verificando Feature Flags ===${NC}"

flag_count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM system_configuration.feature_flags;" 2>/dev/null | tr -d ' ')

if [ "$flag_count" -lt 20 ]; then
    echo -e "${YELLOW}⚠️  Feature flags incompletos ($flag_count)${NC}"
    echo "Cargando seeds de feature flags..."

    if [ -f "$DB_DIR/seeds/prod/system_configuration/01-feature_flags_seeds.sql" ]; then
        psql "$DATABASE_URL" -f "$DB_DIR/seeds/prod/system_configuration/01-feature_flags_seeds.sql" > /dev/null 2>&1
        echo -e "${GREEN}✅ Feature flags cargados${NC}"
    else
        echo -e "${RED}ERROR: No se encuentra el archivo de seeds${NC}"
    fi
else
    echo -e "${GREEN}✅ Feature flags OK ($flag_count)${NC}"
fi
echo ""

# ============================================================================
# 5. VERIFICAR Y REPARAR LOGROS
# ============================================================================
echo -e "${YELLOW}=== 5. Verificando Logros ===${NC}"

achievement_count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM gamification_system.achievements;" 2>/dev/null | tr -d ' ')

if [ "$achievement_count" -lt 25 ]; then
    echo -e "${YELLOW}⚠️  Logros incompletos ($achievement_count)${NC}"
    echo "Cargando seeds de logros..."

    # Primero categorias
    if [ -f "$DB_DIR/seeds/prod/gamification_system/01-achievement_categories.sql" ]; then
        psql "$DATABASE_URL" -f "$DB_DIR/seeds/prod/gamification_system/01-achievement_categories.sql" > /dev/null 2>&1
    fi

    # Luego logros
    if [ -f "$DB_DIR/seeds/prod/gamification_system/04-achievements.sql" ]; then
        psql "$DATABASE_URL" -f "$DB_DIR/seeds/prod/gamification_system/04-achievements.sql" > /dev/null 2>&1
        echo -e "${GREEN}✅ Logros cargados${NC}"
    else
        echo -e "${RED}ERROR: No se encuentra el archivo de seeds${NC}"
    fi
else
    echo -e "${GREEN}✅ Logros OK ($achievement_count)${NC}"
fi
echo ""

# ============================================================================
# 6. VERIFICAR TIENDA
# ============================================================================
echo -e "${YELLOW}=== 6. Verificando Tienda ===${NC}"

shop_categories=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM gamification_system.shop_categories;" 2>/dev/null | tr -d ' ')
shop_items=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM gamification_system.shop_items;" 2>/dev/null | tr -d ' ')

if [ "$shop_categories" -lt 3 ] || [ "$shop_items" -lt 15 ]; then
    echo -e "${YELLOW}⚠️  Tienda incompleta (categorias: $shop_categories, items: $shop_items)${NC}"
    echo "Cargando seeds de tienda..."

    if [ -f "$DB_DIR/seeds/prod/gamification_system/12-shop_categories.sql" ]; then
        psql "$DATABASE_URL" -f "$DB_DIR/seeds/prod/gamification_system/12-shop_categories.sql" > /dev/null 2>&1
    fi

    if [ -f "$DB_DIR/seeds/prod/gamification_system/13-shop_items.sql" ]; then
        psql "$DATABASE_URL" -f "$DB_DIR/seeds/prod/gamification_system/13-shop_items.sql" > /dev/null 2>&1
        echo -e "${GREEN}✅ Tienda cargada${NC}"
    fi
else
    echo -e "${GREEN}✅ Tienda OK (categorias: $shop_categories, items: $shop_items)${NC}"
fi
echo ""

# ============================================================================
# RESUMEN FINAL
# ============================================================================
echo -e "${BLUE}"
echo "=============================================="
echo "   REPARACION COMPLETADA"
echo "=============================================="
echo -e "${NC}"

echo "Resumen de datos:"
psql "$DATABASE_URL" -c "
SELECT
    'Tenants' as entidad, COUNT(*) as total FROM auth_management.tenants
UNION ALL
SELECT 'Usuarios', COUNT(*) FROM auth.users
UNION ALL
SELECT 'Perfiles', COUNT(*) FROM auth_management.profiles
UNION ALL
SELECT 'Modulos', COUNT(*) FROM educational_content.modules
UNION ALL
SELECT 'Ejercicios', COUNT(*) FROM educational_content.exercises
UNION ALL
SELECT 'Rangos Maya', COUNT(*) FROM gamification_system.maya_ranks
UNION ALL
SELECT 'Logros', COUNT(*) FROM gamification_system.achievements
UNION ALL
SELECT 'Feature Flags', COUNT(*) FROM system_configuration.feature_flags;
"

echo ""
echo -e "${YELLOW}IMPORTANTE: Si se cargaron datos, reiniciar el backend:${NC}"
echo "  pm2 restart gamilit-backend"
echo ""
