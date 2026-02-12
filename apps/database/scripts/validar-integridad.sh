#!/bin/bash
# ============================================================================
# Script: Validacion Rapida de Integridad de Base de Datos
# Fecha: 2025-11-24
# Proposito: Ejecutar validaciones rapidas de integridad post-recreacion
# ============================================================================

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-gamilit_platform}
DB_USER=${DB_USER:-gamilit_user}

echo -e "${BLUE}============================================================================${NC}"
echo -e "${BLUE}VALIDACION DE INTEGRIDAD - BASE DE DATOS GAMILIT${NC}"
echo -e "${BLUE}============================================================================${NC}"
echo -e "Database: ${YELLOW}$DB_NAME${NC}"
echo -e "Host: ${YELLOW}$DB_HOST:$DB_PORT${NC}"
echo -e "User: ${YELLOW}$DB_USER${NC}"
echo ""

# Validacion 1: Conexion
echo -e "${YELLOW}[1/10] Validando conexion...${NC}"
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Conexion exitosa${NC}"
else
    echo -e "${RED}✗ Error de conexion${NC}"
    exit 1
fi

# Validacion 2: Schemas
echo -e "${YELLOW}[2/10] Validando schemas...${NC}"
SCHEMAS=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
    SELECT count(*)
    FROM information_schema.schemata
    WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast');
")
if [ "$SCHEMAS" -ge 18 ]; then
    echo -e "${GREEN}✓ $SCHEMAS schemas creados${NC}"
else
    echo -e "${RED}✗ Solo $SCHEMAS schemas (esperados: 18+)${NC}"
fi

# Validacion 3: Tablas
echo -e "${YELLOW}[3/10] Validando tablas...${NC}"
TABLES=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
    SELECT count(*)
    FROM information_schema.tables
    WHERE table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      AND table_type = 'BASE TABLE';
")
if [ "$TABLES" -ge 100 ]; then
    echo -e "${GREEN}✓ $TABLES tablas creadas${NC}"
else
    echo -e "${RED}✗ Solo $TABLES tablas (esperadas: 100+)${NC}"
fi

# Validacion 4: Funciones
echo -e "${YELLOW}[4/10] Validando funciones...${NC}"
FUNCTIONS=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
    SELECT count(*)
    FROM information_schema.routines
    WHERE routine_schema NOT IN ('pg_catalog', 'information_schema');
")
if [ "$FUNCTIONS" -ge 150 ]; then
    echo -e "${GREEN}✓ $FUNCTIONS funciones creadas${NC}"
else
    echo -e "${YELLOW}⚠ $FUNCTIONS funciones (esperadas: 150+)${NC}"
fi

# Validacion 5: Triggers
echo -e "${YELLOW}[5/10] Validando triggers...${NC}"
TRIGGERS=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
    SELECT count(DISTINCT trigger_name)
    FROM information_schema.triggers;
")
if [ "$TRIGGERS" -ge 70 ]; then
    echo -e "${GREEN}✓ $TRIGGERS triggers activos${NC}"
else
    echo -e "${YELLOW}⚠ $TRIGGERS triggers (esperados: 70+)${NC}"
fi

# Validacion 6: RLS Policies
echo -e "${YELLOW}[6/10] Validando RLS policies...${NC}"
POLICIES=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
    SELECT count(*) FROM pg_policies;
")
if [ "$POLICIES" -ge 150 ]; then
    echo -e "${GREEN}✓ $POLICIES RLS policies activas${NC}"
else
    echo -e "${YELLOW}⚠ $POLICIES policies (esperadas: 150+)${NC}"
fi

# Validacion 7: Usuarios
echo -e "${YELLOW}[7/10] Validando usuarios...${NC}"
USERS=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
    SELECT count(*) FROM auth_management.profiles;
")
if [ "$USERS" -gt 0 ]; then
    echo -e "${GREEN}✓ $USERS usuarios cargados${NC}"
else
    echo -e "${RED}✗ No hay usuarios${NC}"
fi

# Validacion 8: Modulos
echo -e "${YELLOW}[8/10] Validando modulos educativos...${NC}"
MODULES=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
    SELECT count(*) FROM educational_content.modules;
")
if [ "$MODULES" -ge 5 ]; then
    echo -e "${GREEN}✓ $MODULES modulos educativos${NC}"
else
    echo -e "${RED}✗ Solo $MODULES modulos (esperados: 5+)${NC}"
fi

# Validacion 9: Rangos Maya
echo -e "${YELLOW}[9/10] Validando rangos Maya...${NC}"
RANKS=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
    SELECT count(*) FROM gamification_system.maya_ranks WHERE is_active = true;
")
if [ "$RANKS" -eq 5 ]; then
    echo -e "${GREEN}✓ $RANKS rangos Maya activos${NC}"
else
    echo -e "${YELLOW}⚠ $RANKS rangos Maya (esperados: 5)${NC}"
fi

# Validacion 10: User Stats
echo -e "${YELLOW}[10/10] Validando inicializacion de user stats...${NC}"
USER_STATS=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
    SELECT count(*) FROM gamification_system.user_stats;
")
if [ "$USER_STATS" -eq "$USERS" ]; then
    echo -e "${GREEN}✓ Todos los usuarios tienen user_stats inicializados${NC}"
else
    echo -e "${RED}✗ $USER_STATS user_stats de $USERS usuarios${NC}"
fi

echo ""
echo -e "${BLUE}============================================================================${NC}"
echo -e "${GREEN}✓ VALIDACION COMPLETADA${NC}"
echo -e "${BLUE}============================================================================${NC}"
echo ""
echo "Resumen:"
echo "  - Schemas: $SCHEMAS"
echo "  - Tablas: $TABLES"
echo "  - Funciones: $FUNCTIONS"
echo "  - Triggers: $TRIGGERS"
echo "  - RLS Policies: $POLICIES"
echo "  - Usuarios: $USERS"
echo "  - Modulos: $MODULES"
echo "  - Rangos Maya: $RANKS"
echo ""
echo "Para validaciones mas detalladas, ejecutar:"
echo "  psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f VALIDACIONES-RAPIDAS-POST-RECREACION.sql"
echo ""
