#!/bin/bash
# ============================================================================
# GAMILIT - Script de Actualizacion de Produccion
# ============================================================================
# Uso: ./scripts/update-production.sh
#
# Este script realiza una actualizacion completa del servidor de produccion:
# 1. Detiene servicios PM2
# 2. Respalda configuraciones (.env files)
# 3. Respalda base de datos completa (pg_dump)
# 4. Pull del repositorio (preferencia a remoto)
# 5. Restaura configuraciones
# 6. Recrea base de datos limpia
# 7. Instala dependencias
# 8. Build de aplicaciones
# 9. Inicia servicios
# 10. Valida deployment
#
# Variables de entorno requeridas:
#   DB_PASSWORD - Password de la base de datos
#
# IMPORTANTE: Ejecutar desde la raiz del proyecto
#
# ============================================================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Obtener directorio del script y proyecto
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Configuracion
BACKUP_BASE="${BACKUP_BASE:-/home/gamilit/backups}"
DB_NAME="${DB_NAME:-gamilit_platform}"
DB_USER="${DB_USER:-gamilit_user}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
# DB_PASSWORD debe estar en variable de entorno

# Timestamp para este deployment
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$BACKUP_BASE/$TIMESTAMP"

# Cambiar al directorio del proyecto
cd "$PROJECT_DIR"

echo -e "${BLUE}"
echo "=============================================="
echo "   ACTUALIZACION PRODUCCION GAMILIT"
echo "=============================================="
echo -e "${NC}"
echo "Timestamp: $TIMESTAMP"
echo "Proyecto: $PROJECT_DIR"
echo "Backup: $BACKUP_DIR"
echo ""

# ============================================================================
# Verificaciones previas
# ============================================================================
echo -e "${YELLOW}=== VERIFICACIONES PREVIAS ===${NC}"

# Verificar que DB_PASSWORD esta configurado
if [ -z "$DB_PASSWORD" ]; then
    echo -e "${RED}ERROR: DB_PASSWORD no esta configurado${NC}"
    echo "Ejecutar: export DB_PASSWORD='tu_password'"
    exit 1
fi

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] || [ ! -d "apps" ]; then
    echo -e "${RED}ERROR: No estamos en el directorio raiz del proyecto${NC}"
    echo "Ejecutar desde: $PROJECT_DIR"
    exit 1
fi

# Verificar conexion a BD
if ! PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${RED}ERROR: No se puede conectar a la base de datos${NC}"
    echo "Verificar credenciales y que PostgreSQL este corriendo"
    exit 1
fi

echo -e "${GREEN}Verificaciones OK${NC}"
echo ""

# ============================================================================
# PASO 1: Detener servicios
# ============================================================================
echo -e "${YELLOW}[1/10] Deteniendo servicios PM2...${NC}"
pm2 stop all 2>/dev/null || echo "PM2 no tenia procesos activos"
echo -e "${GREEN}Servicios detenidos${NC}"
echo ""

# ============================================================================
# PASO 2: Respaldar configuraciones
# ============================================================================
echo -e "${YELLOW}[2/10] Respaldando configuraciones...${NC}"

mkdir -p "$BACKUP_DIR/config"
mkdir -p "$BACKUP_DIR/database"

# Respaldar archivos de configuracion
cp apps/backend/.env.production "$BACKUP_DIR/config/backend.env.production" 2>/dev/null || true
cp apps/backend/.env "$BACKUP_DIR/config/backend.env" 2>/dev/null || true
cp apps/frontend/.env.production "$BACKUP_DIR/config/frontend.env.production" 2>/dev/null || true
cp apps/frontend/.env "$BACKUP_DIR/config/frontend.env" 2>/dev/null || true
cp ecosystem.config.js "$BACKUP_DIR/config/ecosystem.config.js" 2>/dev/null || true

echo "Archivos respaldados:"
ls -la "$BACKUP_DIR/config/"
echo -e "${GREEN}Configuraciones respaldadas${NC}"
echo ""

# ============================================================================
# PASO 3: Respaldar base de datos
# ============================================================================
echo -e "${YELLOW}[3/10] Respaldando base de datos...${NC}"

BACKUP_FILE="$BACKUP_DIR/database/gamilit_$TIMESTAMP.sql"

PGPASSWORD="$DB_PASSWORD" pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --format=plain \
    --no-owner \
    --no-acl \
    > "$BACKUP_FILE"

# Comprimir
gzip "$BACKUP_FILE"

echo "Backup creado: ${BACKUP_FILE}.gz"
ls -lh "${BACKUP_FILE}.gz"
echo -e "${GREEN}Base de datos respaldada${NC}"
echo ""

# ============================================================================
# PASO 4: Pull del repositorio
# ============================================================================
echo -e "${YELLOW}[4/10] Actualizando desde repositorio remoto...${NC}"

# Mostrar estado actual
echo "Rama actual:"
git branch --show-current

echo "Commits pendientes:"
git fetch origin
git log HEAD..origin/main --oneline 2>/dev/null || echo "Ya esta actualizado"

# Reset a remoto (preferencia a remoto)
git reset --hard origin/main

echo "Ultimo commit:"
git log --oneline -1

echo -e "${GREEN}Repositorio actualizado${NC}"
echo ""

# ============================================================================
# PASO 5: Restaurar configuraciones
# ============================================================================
echo -e "${YELLOW}[5/10] Restaurando configuraciones...${NC}"

# Restaurar .env files
if [ -f "$BACKUP_DIR/config/backend.env.production" ]; then
    cp "$BACKUP_DIR/config/backend.env.production" apps/backend/.env.production
    # Crear enlace simbolico si es necesario
    cd apps/backend && ln -sf .env.production .env 2>/dev/null || true && cd ../..
    echo "Backend .env.production restaurado"
fi

if [ -f "$BACKUP_DIR/config/frontend.env.production" ]; then
    cp "$BACKUP_DIR/config/frontend.env.production" apps/frontend/.env.production
    cd apps/frontend && ln -sf .env.production .env 2>/dev/null || true && cd ../..
    echo "Frontend .env.production restaurado"
fi

echo -e "${GREEN}Configuraciones restauradas${NC}"
echo ""

# ============================================================================
# PASO 6: Recrear base de datos
# ============================================================================
echo -e "${YELLOW}[6/10] Recreando base de datos (limpia)...${NC}"

cd apps/database
export DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

# Ejecutar script de creacion
if [ -f "create-database.sh" ]; then
    chmod +x create-database.sh
    ./create-database.sh
else
    echo -e "${RED}ERROR: No se encuentra create-database.sh${NC}"
    exit 1
fi

cd ../..

echo -e "${GREEN}Base de datos recreada${NC}"
echo ""

# ============================================================================
# PASO 7: Instalar dependencias backend
# ============================================================================
echo -e "${YELLOW}[7/10] Instalando dependencias backend...${NC}"

cd apps/backend
npm install --production=false
cd ../..

echo -e "${GREEN}Dependencias backend instaladas${NC}"
echo ""

# ============================================================================
# PASO 8: Instalar dependencias frontend
# ============================================================================
echo -e "${YELLOW}[8/10] Instalando dependencias frontend...${NC}"

cd apps/frontend
npm install --production=false
cd ../..

echo -e "${GREEN}Dependencias frontend instaladas${NC}"
echo ""

# ============================================================================
# PASO 9: Build de aplicaciones
# ============================================================================
echo -e "${YELLOW}[9/10] Construyendo aplicaciones...${NC}"

echo "Building backend..."
cd apps/backend
npm run build
cd ../..

echo "Building frontend..."
cd apps/frontend
npm run build
cd ../..

echo -e "${GREEN}Aplicaciones construidas${NC}"
echo ""

# ============================================================================
# PASO 10: Iniciar servicios
# ============================================================================
echo -e "${YELLOW}[10/10] Iniciando servicios...${NC}"

# Iniciar con ecosystem.config.js
pm2 start ecosystem.config.js

# Guardar configuracion de PM2
pm2 save

echo ""
pm2 list

echo -e "${GREEN}Servicios iniciados${NC}"
echo ""

# ============================================================================
# VALIDACION
# ============================================================================
echo -e "${BLUE}"
echo "=============================================="
echo "   VALIDACION DE DEPLOYMENT"
echo "=============================================="
echo -e "${NC}"

# Ejecutar script de diagnostico si existe
if [ -f "scripts/diagnose-production.sh" ]; then
    chmod +x scripts/diagnose-production.sh
    ./scripts/diagnose-production.sh
else
    # Validacion basica
    echo "Health check backend:"
    sleep 3
    curl -s http://localhost:3006/api/health | head -5 || echo "Backend no responde aun"

    echo ""
    echo "Frontend status:"
    curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:3005 || echo "Frontend no responde aun"
fi

# ============================================================================
# RESUMEN
# ============================================================================
echo -e "${GREEN}"
echo "=============================================="
echo "   ACTUALIZACION COMPLETADA"
echo "=============================================="
echo -e "${NC}"
echo ""
echo "Timestamp: $TIMESTAMP"
echo "Backup disponible en: $BACKUP_DIR"
echo ""
echo "Archivos de backup:"
echo "  - Configuraciones: $BACKUP_DIR/config/"
echo "  - Base de datos: $BACKUP_DIR/database/"
echo ""
echo "Comandos utiles:"
echo "  pm2 logs              - Ver logs"
echo "  pm2 monit             - Monitor en tiempo real"
echo "  pm2 restart all       - Reiniciar servicios"
echo ""
echo "Para rollback, ver: docs/95-guias-desarrollo/GUIA-ACTUALIZACION-PRODUCCION.md"
echo ""
