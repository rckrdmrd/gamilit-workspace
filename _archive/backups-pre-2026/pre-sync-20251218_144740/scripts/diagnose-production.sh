#!/bin/bash
# ============================================================================
# GAMILIT - Script de Diagnostico de Produccion
# ============================================================================
# Uso: ./scripts/diagnose-production.sh
#
# Este script verifica el estado completo del sistema GAMILIT en produccion:
# - Estado de PM2
# - Health del backend
# - Conectividad del frontend
# - Conexion a base de datos
# - Tablas criticas (tenants, usuarios, modulos)
# - Recursos del sistema (disco, memoria)
#
# Variables de entorno requeridas:
#   DATABASE_URL - URL de conexion a PostgreSQL
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
BACKEND_URL="${BACKEND_URL:-http://localhost:3006}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:3005}"

echo -e "${BLUE}"
echo "=============================================="
echo "   DIAGNOSTICO SISTEMA GAMILIT PRODUCCION"
echo "=============================================="
echo -e "${NC}"
echo "Fecha: $(date)"
echo "Servidor: $(hostname)"
echo ""

# ============================================================================
# 1. ESTADO PM2
# ============================================================================
echo -e "${YELLOW}=== 1. ESTADO PM2 ===${NC}"
if command -v pm2 &> /dev/null; then
    pm2 list 2>/dev/null || echo -e "${RED}Error al listar procesos PM2${NC}"
else
    echo -e "${RED}PM2 no esta instalado${NC}"
fi
echo ""

# ============================================================================
# 2. HEALTH BACKEND
# ============================================================================
echo -e "${YELLOW}=== 2. HEALTH BACKEND ===${NC}"
health=$(curl -s --connect-timeout 5 "$BACKEND_URL/api/health" 2>/dev/null)
if [ -n "$health" ]; then
    echo -e "${GREEN}Backend respondiendo:${NC}"
    echo "$health" | head -10
else
    echo -e "${RED}Backend NO responde en $BACKEND_URL${NC}"
    echo "Verificar con: pm2 logs gamilit-backend"
fi
echo ""

# ============================================================================
# 3. FRONTEND
# ============================================================================
echo -e "${YELLOW}=== 3. FRONTEND ===${NC}"
frontend_status=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$FRONTEND_URL" 2>/dev/null || echo "000")
if [ "$frontend_status" == "200" ]; then
    echo -e "${GREEN}Frontend OK (HTTP $frontend_status)${NC}"
else
    echo -e "${RED}Frontend ERROR (HTTP $frontend_status)${NC}"
    echo "Verificar con: pm2 logs gamilit-frontend"
fi
echo ""

# ============================================================================
# 4. CONEXION BASE DE DATOS
# ============================================================================
echo -e "${YELLOW}=== 4. CONEXION BASE DE DATOS ===${NC}"
db_version=$(psql "$DATABASE_URL" -t -c "SELECT version();" 2>/dev/null | head -1 | xargs)
if [ -n "$db_version" ]; then
    echo -e "${GREEN}BD conectada:${NC}"
    echo "  $db_version"
else
    echo -e "${RED}No se puede conectar a la BD${NC}"
    echo "Verificar DATABASE_URL y que PostgreSQL este corriendo"
fi
echo ""

# ============================================================================
# 5. TABLAS CRITICAS
# ============================================================================
echo -e "${YELLOW}=== 5. TABLAS CRITICAS ===${NC}"

check_table() {
    local table=$1
    local min_expected=${2:-0}
    local count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM $table;" 2>/dev/null | tr -d ' ')

    if [ -n "$count" ] && [ "$count" -gt 0 ]; then
        if [ "$count" -ge "$min_expected" ]; then
            echo -e "${GREEN}  ✅ $table: $count registros${NC}"
        else
            echo -e "${YELLOW}  ⚠️  $table: $count registros (esperado: $min_expected+)${NC}"
        fi
    else
        echo -e "${RED}  ❌ $table: VACIO o ERROR${NC}"
    fi
}

echo "Verificando tablas criticas..."
check_table "auth_management.tenants" 1
check_table "auth.users" 1
check_table "auth_management.profiles" 1
check_table "educational_content.modules" 5
check_table "educational_content.exercises" 20
check_table "gamification_system.maya_ranks" 5
check_table "gamification_system.achievements" 25
check_table "system_configuration.feature_flags" 20
echo ""

# ============================================================================
# 6. TENANT PRINCIPAL (CRITICO)
# ============================================================================
echo -e "${YELLOW}=== 6. TENANT PRINCIPAL (CRITICO) ===${NC}"
tenant=$(psql "$DATABASE_URL" -t -c "SELECT slug || ' | is_active=' || is_active FROM auth_management.tenants WHERE slug = 'gamilit-prod';" 2>/dev/null | xargs)
if [ -n "$tenant" ]; then
    echo -e "${GREEN}Tenant encontrado: $tenant${NC}"
else
    echo -e "${RED}❌ TENANT PRINCIPAL 'gamilit-prod' NO EXISTE${NC}"
    echo -e "${RED}   EL REGISTRO DE USUARIOS NO FUNCIONARA${NC}"
    echo ""
    echo -e "${YELLOW}SOLUCION:${NC}"
    echo "  cd apps/database"
    echo "  psql \"\$DATABASE_URL\" -f seeds/prod/auth_management/01-tenants.sql"
fi
echo ""

# ============================================================================
# 7. ESPACIO EN DISCO
# ============================================================================
echo -e "${YELLOW}=== 7. ESPACIO EN DISCO ===${NC}"
df -h / | tail -1
echo ""

# ============================================================================
# 8. MEMORIA
# ============================================================================
echo -e "${YELLOW}=== 8. MEMORIA ===${NC}"
free -h 2>/dev/null || echo "Comando free no disponible"
echo ""

# ============================================================================
# 9. PUERTOS EN USO
# ============================================================================
echo -e "${YELLOW}=== 9. PUERTOS EN USO ===${NC}"
echo "Puerto 3005 (Frontend):"
ss -tlnp 2>/dev/null | grep ":3005" || echo "  No hay proceso en puerto 3005"
echo "Puerto 3006 (Backend):"
ss -tlnp 2>/dev/null | grep ":3006" || echo "  No hay proceso en puerto 3006"
echo "Puerto 5432 (PostgreSQL):"
ss -tlnp 2>/dev/null | grep ":5432" || echo "  No hay proceso en puerto 5432"
echo ""

# ============================================================================
# RESUMEN
# ============================================================================
echo -e "${BLUE}"
echo "=============================================="
echo "   DIAGNOSTICO COMPLETADO"
echo "=============================================="
echo -e "${NC}"
echo ""
echo "Guia de troubleshooting:"
echo "  docs/95-guias-desarrollo/GUIA-VALIDACION-PRODUCCION.md"
echo ""
