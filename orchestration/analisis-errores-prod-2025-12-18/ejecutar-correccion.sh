#!/bin/bash
# ============================================================================
# SCRIPT DE EJECUCIÓN DE CORRECCIÓN - GAMILIT PRODUCCIÓN
# ============================================================================
# Uso: ./ejecutar-correccion.sh [host] [port] [database] [user]
# Ejemplo: ./ejecutar-correccion.sh 74.208.126.102 5432 gamilit_platform gamilit_user
# ============================================================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parámetros (con valores por defecto)
DB_HOST="${1:-localhost}"
DB_PORT="${2:-5432}"
DB_NAME="${3:-gamilit_platform}"
DB_USER="${4:-gamilit_user}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_FILE="$SCRIPT_DIR/SCRIPT-CORRECCION-PRODUCCION.sql"

echo -e "${BLUE}=============================================="
echo "CORRECCIÓN DE BD PRODUCCIÓN - GAMILIT"
echo -e "==============================================${NC}"
echo ""
echo -e "Host:     ${YELLOW}$DB_HOST${NC}"
echo -e "Puerto:   ${YELLOW}$DB_PORT${NC}"
echo -e "Base:     ${YELLOW}$DB_NAME${NC}"
echo -e "Usuario:  ${YELLOW}$DB_USER${NC}"
echo ""

# Verificar que el archivo SQL existe
if [ ! -f "$SQL_FILE" ]; then
    echo -e "${RED}ERROR: No se encontró el archivo SQL: $SQL_FILE${NC}"
    exit 1
fi

# Confirmar ejecución
echo -e "${YELLOW}ADVERTENCIA: Este script modificará la base de datos.${NC}"
echo ""
read -p "¿Desea continuar? (s/n): " confirm

if [ "$confirm" != "s" ] && [ "$confirm" != "S" ]; then
    echo -e "${RED}Operación cancelada.${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}Verificando conexión...${NC}"

# Verificar conexión
if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1; then
    echo -e "${RED}ERROR: No se puede conectar a la base de datos.${NC}"
    echo "Verifique los parámetros de conexión."
    exit 1
fi

echo -e "${GREEN}Conexión verificada.${NC}"
echo ""

# Solicitar contraseña
read -sp "Ingrese la contraseña de $DB_USER: " DB_PASSWORD
echo ""
echo ""

# Crear backup antes de ejecutar
BACKUP_FILE="backup_pre_correccion_$(date +%Y%m%d_%H%M%S).sql"
echo -e "${BLUE}Creando backup en: $BACKUP_FILE${NC}"

PGPASSWORD="$DB_PASSWORD" pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --schema=gamification_system \
    --schema=progress_tracking \
    --schema=educational_content \
    -f "$SCRIPT_DIR/$BACKUP_FILE" 2>/dev/null || {
        echo -e "${YELLOW}Advertencia: No se pudo crear backup completo (los schemas pueden no existir aún).${NC}"
    }

echo ""
echo -e "${BLUE}Ejecutando script de corrección...${NC}"
echo ""

# Ejecutar el script SQL
PGPASSWORD="$DB_PASSWORD" psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    -f "$SQL_FILE"

echo ""
echo -e "${GREEN}=============================================="
echo "CORRECCIÓN COMPLETADA"
echo -e "==============================================${NC}"
echo ""
echo "Próximos pasos:"
echo "1. Reiniciar el backend: pm2 restart gamilit-backend"
echo "2. Probar registro de nuevo usuario"
echo "3. Verificar dashboard sin errores"
echo ""
echo -e "Backup guardado en: ${YELLOW}$SCRIPT_DIR/$BACKUP_FILE${NC}"
echo ""
