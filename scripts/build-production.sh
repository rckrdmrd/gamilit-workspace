#!/bin/bash

################################################################################
# GAMILIT Platform - Build Script para Producción
################################################################################
#
# Este script compila tanto el backend como el frontend para producción.
#
# Uso:
#   ./scripts/build-production.sh
#
################################################################################

set -e  # Exit on error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Directorio raíz del proyecto
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo -e "${BLUE}"
echo "============================================================================"
echo "  GAMILIT Platform - Build para Producción"
echo "============================================================================"
echo -e "${NC}"

# Verificar Node.js
echo -e "${YELLOW}→ Verificando Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js no está instalado${NC}"
    exit 1
fi
NODE_VERSION=$(node --version)
echo -e "${GREEN}✓ Node.js ${NODE_VERSION}${NC}"

# Verificar npm
echo -e "${YELLOW}→ Verificando npm...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm no está instalado${NC}"
    exit 1
fi
NPM_VERSION=$(npm --version)
echo -e "${GREEN}✓ npm ${NPM_VERSION}${NC}"

# Instalar dependencias de la raíz si es necesario
echo ""
echo -e "${YELLOW}→ Instalando dependencias de la raíz...${NC}"
cd "$PROJECT_ROOT"
npm install --production=false

################################################################################
# BUILD BACKEND
################################################################################
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  BACKEND - NestJS API${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd "$PROJECT_ROOT/apps/backend"

# Instalar dependencias
echo -e "${YELLOW}→ Instalando dependencias del backend...${NC}"
npm install --production=false

# Limpiar build anterior
echo -e "${YELLOW}→ Limpiando build anterior...${NC}"
rm -rf dist

# Compilar TypeScript
echo -e "${YELLOW}→ Compilando TypeScript...${NC}"
npm run build

# Verificar que el build fue exitoso
if [ ! -f "dist/main.js" ]; then
    echo -e "${RED}✗ Error: El build del backend falló${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Backend compilado exitosamente${NC}"
echo -e "${GREEN}  → Archivo principal: dist/main.js${NC}"

################################################################################
# BUILD FRONTEND
################################################################################
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  FRONTEND - React + Vite${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd "$PROJECT_ROOT/apps/frontend"

# Instalar dependencias
echo -e "${YELLOW}→ Instalando dependencias del frontend...${NC}"
npm install --production=false

# Limpiar build anterior
echo -e "${YELLOW}→ Limpiando build anterior...${NC}"
rm -rf dist

# Compilar para producción
echo -e "${YELLOW}→ Compilando para producción...${NC}"
npm run build:prod

# Verificar que el build fue exitoso
if [ ! -d "dist" ]; then
    echo -e "${RED}✗ Error: El build del frontend falló${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Frontend compilado exitosamente${NC}"
echo -e "${GREEN}  → Archivos estáticos en: dist/${NC}"

################################################################################
# RESUMEN
################################################################################
echo ""
echo -e "${BLUE}"
echo "============================================================================"
echo "  BUILD COMPLETADO"
echo "============================================================================"
echo -e "${NC}"

echo -e "${GREEN}✓ Backend:${NC} apps/backend/dist/main.js"
echo -e "${GREEN}✓ Frontend:${NC} apps/frontend/dist/"

# Tamaño de los builds
BACKEND_SIZE=$(du -sh "$PROJECT_ROOT/apps/backend/dist" | cut -f1)
FRONTEND_SIZE=$(du -sh "$PROJECT_ROOT/apps/frontend/dist" | cut -f1)

echo ""
echo -e "${YELLOW}Tamaños:${NC}"
echo -e "  Backend:  ${BACKEND_SIZE}"
echo -e "  Frontend: ${FRONTEND_SIZE}"

echo ""
echo -e "${GREEN}→ Listo para desplegar con PM2${NC}"
echo -e "${YELLOW}→ Usa: ${NC}./scripts/deploy-production.sh"
echo ""
