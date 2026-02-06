#!/bin/bash

################################################################################
# GAMILIT Platform - Pre-Deploy Check
################################################################################
#
# Este script verifica que todo esté listo antes de desplegar.
#
# Uso:
#   ./scripts/pre-deploy-check.sh
#
################################################################################

set -e  # Exit on error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Directorio raíz del proyecto
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

ERRORS=0
WARNINGS=0

echo -e "${BLUE}"
echo "============================================================================"
echo "  GAMILIT Platform - Pre-Deploy Check"
echo "============================================================================"
echo -e "${NC}"

################################################################################
# 1. Verificar Node.js y npm
################################################################################
echo -e "${CYAN}[1/10] Verificando Node.js y npm...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js no está instalado${NC}"
    ((ERRORS++))
else
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js ${NODE_VERSION}${NC}"
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm no está instalado${NC}"
    ((ERRORS++))
else
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓ npm ${NPM_VERSION}${NC}"
fi

################################################################################
# 2. Verificar PM2
################################################################################
echo ""
echo -e "${CYAN}[2/10] Verificando PM2...${NC}"

if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}⚠ PM2 no está instalado${NC}"
    echo -e "${YELLOW}  → Se puede instalar con: npm install -g pm2${NC}"
    ((WARNINGS++))
else
    PM2_VERSION=$(pm2 --version)
    echo -e "${GREEN}✓ PM2 ${PM2_VERSION}${NC}"
fi

################################################################################
# 3. Verificar archivos de configuración
################################################################################
echo ""
echo -e "${CYAN}[3/10] Verificando archivos de configuración...${NC}"

# ecosystem.config.js
if [ ! -f "$PROJECT_ROOT/ecosystem.config.js" ]; then
    echo -e "${RED}✗ ecosystem.config.js no encontrado${NC}"
    ((ERRORS++))
else
    echo -e "${GREEN}✓ ecosystem.config.js${NC}"
fi

# .env.production backend
if [ ! -f "$PROJECT_ROOT/apps/backend/.env.production" ]; then
    echo -e "${RED}✗ apps/backend/.env.production no encontrado${NC}"
    ((ERRORS++))
else
    echo -e "${GREEN}✓ apps/backend/.env.production${NC}"
fi

# .env.production frontend
if [ ! -f "$PROJECT_ROOT/apps/frontend/.env.production" ]; then
    echo -e "${RED}✗ apps/frontend/.env.production no encontrado${NC}"
    ((ERRORS++))
else
    echo -e "${GREEN}✓ apps/frontend/.env.production${NC}"
fi

################################################################################
# 4. Verificar configuración de puertos
################################################################################
echo ""
echo -e "${CYAN}[4/10] Verificando configuración de puertos...${NC}"

# Verificar puerto backend en .env
if grep -q "PORT=3006" "$PROJECT_ROOT/apps/backend/.env.production"; then
    echo -e "${GREEN}✓ Backend configurado en puerto 3006${NC}"
else
    echo -e "${YELLOW}⚠ Backend: Puerto no es 3006${NC}"
    ((WARNINGS++))
fi

# Verificar API URL en frontend
if grep -q "VITE_API_URL=http://74.208.126.102:3006/api" "$PROJECT_ROOT/apps/frontend/.env.production"; then
    echo -e "${GREEN}✓ Frontend apunta a backend en 74.208.126.102:3006${NC}"
else
    echo -e "${YELLOW}⚠ Frontend: Verificar VITE_API_URL${NC}"
    ((WARNINGS++))
fi

################################################################################
# 5. Verificar CORS
################################################################################
echo ""
echo -e "${CYAN}[5/10] Verificando configuración CORS...${NC}"

if grep -q "CORS_ORIGIN.*74.208.126.102:3005" "$PROJECT_ROOT/apps/backend/.env.production"; then
    echo -e "${GREEN}✓ CORS incluye frontend en 74.208.126.102:3005${NC}"
else
    echo -e "${YELLOW}⚠ CORS: Verificar que incluya el frontend${NC}"
    ((WARNINGS++))
fi

################################################################################
# 6. Verificar configuración de base de datos
################################################################################
echo ""
echo -e "${CYAN}[6/10] Verificando configuración de base de datos...${NC}"

if grep -q "DB_HOST=74.208.126.102" "$PROJECT_ROOT/apps/backend/.env.production"; then
    echo -e "${GREEN}✓ Database host configurado${NC}"
else
    echo -e "${RED}✗ DB_HOST no está configurado correctamente${NC}"
    ((ERRORS++))
fi

if grep -q "DB_NAME=gamilit_platform" "$PROJECT_ROOT/apps/backend/.env.production"; then
    echo -e "${GREEN}✓ Database name configurado${NC}"
else
    echo -e "${YELLOW}⚠ Verificar DB_NAME${NC}"
    ((WARNINGS++))
fi

################################################################################
# 7. Verificar secrets de producción
################################################################################
echo ""
echo -e "${CYAN}[7/10] Verificando secrets de producción...${NC}"

if grep -q "JWT_SECRET=PROD_" "$PROJECT_ROOT/apps/backend/.env.production"; then
    echo -e "${GREEN}✓ JWT_SECRET usa secret de producción${NC}"
else
    echo -e "${RED}✗ JWT_SECRET: Usar un secret específico de producción${NC}"
    ((ERRORS++))
fi

if grep -q "SESSION_SECRET=PROD_" "$PROJECT_ROOT/apps/backend/.env.production"; then
    echo -e "${GREEN}✓ SESSION_SECRET usa secret de producción${NC}"
else
    echo -e "${YELLOW}⚠ SESSION_SECRET: Considerar usar un secret específico de producción${NC}"
    ((WARNINGS++))
fi

################################################################################
# 8. Verificar builds
################################################################################
echo ""
echo -e "${CYAN}[8/10] Verificando builds...${NC}"

if [ -f "$PROJECT_ROOT/apps/backend/dist/main.js" ]; then
    echo -e "${GREEN}✓ Backend build encontrado${NC}"
else
    echo -e "${YELLOW}⚠ Backend no está buildado${NC}"
    echo -e "${YELLOW}  → Ejecutar: ./scripts/build-production.sh${NC}"
    ((WARNINGS++))
fi

if [ -d "$PROJECT_ROOT/apps/frontend/dist" ] && [ "$(ls -A $PROJECT_ROOT/apps/frontend/dist)" ]; then
    echo -e "${GREEN}✓ Frontend build encontrado${NC}"
else
    echo -e "${YELLOW}⚠ Frontend no está buildado${NC}"
    echo -e "${YELLOW}  → Ejecutar: ./scripts/build-production.sh${NC}"
    ((WARNINGS++))
fi

################################################################################
# 9. Verificar conectividad a la base de datos
################################################################################
echo ""
echo -e "${CYAN}[9/10] Verificando conectividad a la base de datos...${NC}"

if command -v psql &> /dev/null; then
    # Extraer credenciales del .env.production
    DB_HOST=$(grep DB_HOST "$PROJECT_ROOT/apps/backend/.env.production" | cut -d '=' -f2)
    DB_PORT=$(grep DB_PORT "$PROJECT_ROOT/apps/backend/.env.production" | cut -d '=' -f2)
    DB_NAME=$(grep DB_NAME "$PROJECT_ROOT/apps/backend/.env.production" | cut -d '=' -f2)
    DB_USER=$(grep DB_USER "$PROJECT_ROOT/apps/backend/.env.production" | cut -d '=' -f2)

    if PGPASSWORD=$(grep DB_PASSWORD "$PROJECT_ROOT/apps/backend/.env.production" | cut -d '=' -f2) psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c '\q' 2>/dev/null; then
        echo -e "${GREEN}✓ Conexión a base de datos exitosa${NC}"
    else
        echo -e "${RED}✗ No se pudo conectar a la base de datos${NC}"
        echo -e "${YELLOW}  Verificar: Host=$DB_HOST, Port=$DB_PORT, DB=$DB_NAME, User=$DB_USER${NC}"
        ((ERRORS++))
    fi
else
    echo -e "${YELLOW}⚠ psql no está instalado - no se puede verificar conexión${NC}"
    ((WARNINGS++))
fi

################################################################################
# 10. Verificar permisos de directorios
################################################################################
echo ""
echo -e "${CYAN}[10/10] Verificando permisos de directorios...${NC}"

# Crear directorio de logs si no existe
if [ ! -d "$PROJECT_ROOT/logs" ]; then
    echo -e "${YELLOW}⚠ Directorio logs no existe - se creará durante el deploy${NC}"
    ((WARNINGS++))
else
    echo -e "${GREEN}✓ Directorio logs existe${NC}"
fi

# Verificar directorio de uploads
if [ ! -d "$PROJECT_ROOT/apps/backend/uploads" ]; then
    echo -e "${YELLOW}⚠ Directorio uploads no existe - se creará automáticamente${NC}"
    ((WARNINGS++))
else
    echo -e "${GREEN}✓ Directorio uploads existe${NC}"
fi

################################################################################
# RESUMEN
################################################################################
echo ""
echo -e "${BLUE}"
echo "============================================================================"
echo "  RESUMEN DEL PRE-DEPLOY CHECK"
echo "============================================================================"
echo -e "${NC}"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ TODAS LAS VERIFICACIONES PASARON${NC}"
    echo -e "${GREEN}→ Listo para desplegar${NC}"
    echo ""
    echo -e "${YELLOW}Próximos pasos:${NC}"
    echo -e "  1. ./scripts/build-production.sh      (si no está buildado)"
    echo -e "  2. ./scripts/deploy-production.sh"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ $WARNINGS advertencia(s) encontrada(s)${NC}"
    echo -e "${YELLOW}→ Puedes continuar, pero revisa las advertencias${NC}"
    echo ""
    echo -e "${YELLOW}Próximos pasos:${NC}"
    echo -e "  1. Revisar advertencias (opcional)"
    echo -e "  2. ./scripts/build-production.sh      (si no está buildado)"
    echo -e "  3. ./scripts/deploy-production.sh"
    exit 0
else
    echo -e "${RED}✗ $ERRORS error(es) encontrado(s)${NC}"
    echo -e "${YELLOW}⚠ $WARNINGS advertencia(s) encontrada(s)${NC}"
    echo -e "${RED}→ Corrige los errores antes de desplegar${NC}"
    exit 1
fi
