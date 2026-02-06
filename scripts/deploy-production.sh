#!/bin/bash

################################################################################
# GAMILIT Platform - Script de Despliegue en Producción
################################################################################
#
# Este script despliega el backend y frontend usando PM2 en producción.
#
# IMPORTANTE: Ejecutar build-production.sh primero!
#
# Servidor: 74.208.126.102
# Backend Port: 3006
# Frontend Port: 3005
#
# Uso:
#   ./scripts/deploy-production.sh
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

echo -e "${BLUE}"
echo "============================================================================"
echo "  GAMILIT Platform - Despliegue en Producción"
echo "============================================================================"
echo "  Servidor: 74.208.126.102"
echo "  Backend:  Puerto 3006 (2 instancias)"
echo "  Frontend: Puerto 3005 (1 instancia)"
echo "============================================================================"
echo -e "${NC}"

# Verificar PM2
echo -e "${YELLOW}→ Verificando PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}✗ PM2 no está instalado${NC}"
    echo -e "${YELLOW}→ Instalando PM2 globalmente...${NC}"
    npm install -g pm2
fi
echo -e "${GREEN}✓ PM2 instalado${NC}"

# Verificar que los builds existen
echo ""
echo -e "${YELLOW}→ Verificando builds...${NC}"

if [ ! -f "$PROJECT_ROOT/apps/backend/dist/main.js" ]; then
    echo -e "${RED}✗ Error: Build del backend no encontrado${NC}"
    echo -e "${YELLOW}→ Ejecuta primero: ./scripts/build-production.sh${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Backend build encontrado${NC}"

if [ ! -d "$PROJECT_ROOT/apps/frontend/dist" ]; then
    echo -e "${RED}✗ Error: Build del frontend no encontrado${NC}"
    echo -e "${YELLOW}→ Ejecuta primero: ./scripts/build-production.sh${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Frontend build encontrado${NC}"

# Verificar archivos .env.production
echo ""
echo -e "${YELLOW}→ Verificando archivos de configuración...${NC}"

if [ ! -f "$PROJECT_ROOT/apps/backend/.env.production" ]; then
    echo -e "${RED}✗ Error: apps/backend/.env.production no encontrado${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Backend .env.production${NC}"

if [ ! -f "$PROJECT_ROOT/apps/frontend/.env.production" ]; then
    echo -e "${RED}✗ Error: apps/frontend/.env.production no encontrado${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Frontend .env.production${NC}"

# Crear directorio de logs si no existe
echo ""
echo -e "${YELLOW}→ Creando directorio de logs...${NC}"
mkdir -p "$PROJECT_ROOT/logs"
echo -e "${GREEN}✓ Directorio logs creado${NC}"

# Detener procesos PM2 existentes si están corriendo
echo ""
echo -e "${YELLOW}→ Verificando procesos PM2 existentes...${NC}"
cd "$PROJECT_ROOT"

if pm2 list | grep -q "gamilit-backend\|gamilit-frontend"; then
    echo -e "${YELLOW}→ Deteniendo procesos existentes...${NC}"
    pm2 delete gamilit-backend 2>/dev/null || true
    pm2 delete gamilit-frontend 2>/dev/null || true
    echo -e "${GREEN}✓ Procesos anteriores detenidos${NC}"
else
    echo -e "${CYAN}  No hay procesos anteriores corriendo${NC}"
fi

################################################################################
# INICIAR BACKEND
################################################################################
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  INICIANDO BACKEND${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "${YELLOW}→ Iniciando backend con PM2...${NC}"
pm2 start ecosystem.config.js --only gamilit-backend --env production

if pm2 list | grep -q "gamilit-backend.*online"; then
    echo -e "${GREEN}✓ Backend iniciado correctamente${NC}"
    echo -e "${GREEN}  → 2 instancias en modo cluster${NC}"
    echo -e "${GREEN}  → Puerto: 3006${NC}"
else
    echo -e "${RED}✗ Error al iniciar el backend${NC}"
    pm2 logs gamilit-backend --lines 20
    exit 1
fi

################################################################################
# INICIAR FRONTEND
################################################################################
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  INICIANDO FRONTEND${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "${YELLOW}→ Iniciando frontend con PM2...${NC}"
pm2 start ecosystem.config.js --only gamilit-frontend --env production

if pm2 list | grep -q "gamilit-frontend.*online"; then
    echo -e "${GREEN}✓ Frontend iniciado correctamente${NC}"
    echo -e "${GREEN}  → 1 instancia${NC}"
    echo -e "${GREEN}  → Puerto: 3005${NC}"
else
    echo -e "${RED}✗ Error al iniciar el frontend${NC}"
    pm2 logs gamilit-frontend --lines 20
    exit 1
fi

################################################################################
# GUARDAR CONFIGURACIÓN PM2
################################################################################
echo ""
echo -e "${YELLOW}→ Guardando configuración PM2...${NC}"
pm2 save
echo -e "${GREEN}✓ Configuración guardada${NC}"

################################################################################
# CONFIGURAR INICIO AUTOMÁTICO (opcional)
################################################################################
echo ""
echo -e "${CYAN}→ Para configurar inicio automático en boot, ejecuta:${NC}"
echo -e "${CYAN}  pm2 startup${NC}"
echo -e "${CYAN}  (y sigue las instrucciones que aparezcan)${NC}"

################################################################################
# RESUMEN FINAL
################################################################################
echo ""
echo -e "${BLUE}"
echo "============================================================================"
echo "  DESPLIEGUE COMPLETADO EXITOSAMENTE"
echo "============================================================================"
echo -e "${NC}"

echo -e "${GREEN}✓ Backend:${NC}  http://74.208.126.102:3006"
echo -e "${GREEN}✓ Frontend:${NC} http://74.208.126.102:3005"
echo -e "${GREEN}✓ API Docs:${NC} http://74.208.126.102:3006/api/docs"

echo ""
echo -e "${YELLOW}Comandos útiles:${NC}"
echo -e "  pm2 status                 - Ver estado de procesos"
echo -e "  pm2 logs                   - Ver logs en tiempo real"
echo -e "  pm2 logs gamilit-backend   - Logs del backend"
echo -e "  pm2 logs gamilit-frontend  - Logs del frontend"
echo -e "  pm2 monit                  - Monitor interactivo"
echo -e "  pm2 restart all            - Reiniciar todos los procesos"
echo -e "  pm2 stop all               - Detener todos los procesos"
echo -e "  pm2 delete all             - Eliminar todos los procesos"

echo ""
echo -e "${YELLOW}→ Verificando estado de los procesos...${NC}"
pm2 status

echo ""
echo -e "${GREEN}¡Despliegue completado!${NC}"
echo ""
