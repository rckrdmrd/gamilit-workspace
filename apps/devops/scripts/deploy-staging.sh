#!/bin/bash
##############################################################################
# GAMILIT Platform - STAGING Deployment Script
#
# ╔═══════════════════════════════════════════════════════════════════════╗
# ║                     *** STAGING ENVIRONMENT ***                      ║
# ║  Este script despliega al ambiente de STAGING, NO a produccion.      ║
# ║  Los datos de staging pueden ser reiniciados en cualquier momento.   ║
# ╚═══════════════════════════════════════════════════════════════════════╝
#
# Proposito: Deploy a staging para QA y pruebas de integracion
#
# Proceso (simplificado vs produccion):
#   1. Pre-deploy checks (build)
#   2. Build de aplicaciones
#   3. Deploy con PM2
#   4. Health checks
#
# NOTA: No incluye backup de datos (staging es efimero)
#       No incluye rollback automatico (se puede redesplegar)
#
# Uso:
#   ./deploy-staging.sh
#   ./deploy-staging.sh --skip-tests   # Sin tests
#   ./deploy-staging.sh --dry-run      # Simular
#
# Permisos: chmod +x deploy-staging.sh
#
##############################################################################

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Configuracion
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEVOPS_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
APPS_ROOT="$(cd "$DEVOPS_ROOT/.." && pwd)"
GAMILIT_ROOT="$(cd "$APPS_ROOT/.." && pwd)"
BACKEND_DIR="$APPS_ROOT/backend"
FRONTEND_DIR="$APPS_ROOT/frontend"
DATABASE_DIR="$APPS_ROOT/database"
CONFIG_DIR="$DEVOPS_ROOT/config"

# Staging-specific paths
DEPLOY_PATH="/home/deploy/staging/gamilit"
ECOSYSTEM_CONFIG="$CONFIG_DIR/ecosystem.staging.config.js"
BACKEND_PORT=3016
FRONTEND_PORT=3015
PM2_BACKEND_NAME="gamilit-backend-staging"
PM2_FRONTEND_NAME="gamilit-frontend-staging"

# Variables
SKIP_TESTS=false
DRY_RUN=false
DATABASE_URL=""

# ============================================================================
# FUNCIONES AUXILIARES
# ============================================================================

print_header() {
    echo ""
    echo -e "${MAGENTA}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${MAGENTA}║ $1$(printf '%*s' $((60 - ${#1})) '')║${NC}"
    echo -e "${MAGENTA}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_step() {
    echo -e "${CYAN}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_staging_banner() {
    echo ""
    echo -e "${YELLOW}╔═══════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║                                                                       ║${NC}"
    echo -e "${YELLOW}║         ███████╗████████╗ █████╗  ██████╗ ██╗███╗   ██╗ ██████╗       ║${NC}"
    echo -e "${YELLOW}║         ██╔════╝╚══██╔══╝██╔══██╗██╔════╝ ██║████╗  ██║██╔════╝       ║${NC}"
    echo -e "${YELLOW}║         ███████╗   ██║   ███████║██║  ███╗██║██╔██╗ ██║██║  ███╗      ║${NC}"
    echo -e "${YELLOW}║         ╚════██║   ██║   ██╔══██║██║   ██║██║██║╚██╗██║██║   ██║      ║${NC}"
    echo -e "${YELLOW}║         ███████║   ██║   ██║  ██║╚██████╔╝██║██║ ╚████║╚██████╔╝      ║${NC}"
    echo -e "${YELLOW}║         ╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═╝╚═╝  ╚═══╝ ╚═════╝      ║${NC}"
    echo -e "${YELLOW}║                                                                       ║${NC}"
    echo -e "${YELLOW}║          GAMILIT Platform - Staging Deployment                        ║${NC}"
    echo -e "${YELLOW}║          Backend: port ${BACKEND_PORT} | Frontend: port ${FRONTEND_PORT}                      ║${NC}"
    echo -e "${YELLOW}║                                                                       ║${NC}"
    echo -e "${YELLOW}╚═══════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

show_help() {
    cat << EOF
GAMILIT Platform - Staging Deployment

Uso: $0 [OPCIONES]

Opciones:
  --skip-tests          Omitir tests
  --dry-run             Simular deployment
  --help                Mostrar ayuda

Ejemplos:
  $0
  $0 --dry-run
  $0 --skip-tests

Proceso de Deploy (Staging):
  1. Validar prerequisitos
  2. Ejecutar tests (opcional)
  3. Build de aplicaciones
  4. Deploy con PM2 (ecosystem.staging.config.js)
  5. Health checks

NOTA: Staging NO incluye backup de datos ni rollback automatico.
      Si algo falla, simplemente redesplegar.

Servicios:
  Backend:  ${PM2_BACKEND_NAME}  (port ${BACKEND_PORT})
  Frontend: ${PM2_FRONTEND_NAME} (port ${FRONTEND_PORT})

EOF
}

load_env() {
    local env_file="${BACKEND_DIR}/.env.staging"
    if [ -f "$env_file" ]; then
        print_step "Cargando configuracion de staging..."
        export $(cat "$env_file" | grep -v '^#' | grep -v '^$' | xargs)
        DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
        print_success "Configuracion staging cargada"
    else
        print_error "No se encontro configuracion de staging"
        print_warning "Crear archivo: ${BACKEND_DIR}/.env.staging"
        exit 1
    fi
}

# ============================================================================
# PASO 1: VALIDACIONES PRE-DEPLOY
# ============================================================================

validate_prerequisites() {
    print_header "PASO 1: VALIDACIONES PRE-DEPLOY"

    # Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js no encontrado"
        exit 1
    fi
    print_success "Node.js $(node -v)"

    # npm
    if ! command -v npm &> /dev/null; then
        print_error "npm no encontrado"
        exit 1
    fi
    print_success "npm $(npm -v)"

    # PM2
    if ! command -v pm2 &> /dev/null; then
        print_warning "PM2 no encontrado - se instalara"
        if [ "$DRY_RUN" = false ]; then
            npm install -g pm2
        fi
    fi
    print_success "PM2 disponible"

    # Verificar ecosystem config
    if [ ! -f "$ECOSYSTEM_CONFIG" ]; then
        print_error "Ecosystem config no encontrado: $ECOSYSTEM_CONFIG"
        print_warning "Se esperaba: apps/devops/config/ecosystem.staging.config.js"
        exit 1
    fi
    print_success "Ecosystem staging config encontrado"

    # Verificar conexion a BD staging
    print_step "Verificando conexion a base de datos staging..."
    if [ "$DRY_RUN" = true ]; then
        print_success "[DRY-RUN] Verificacion de BD omitida"
    else
        if command -v psql &> /dev/null; then
            if psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
                print_success "Conexion a BD staging exitosa"
            else
                print_warning "No se puede conectar a BD staging - puede necesitar crearse"
            fi
        else
            print_warning "psql no encontrado - omitiendo verificacion de BD"
        fi
    fi

    # Verificar rama de git
    print_step "Verificando rama de git..."
    local current_branch=$(git -C "$GAMILIT_ROOT" branch --show-current 2>/dev/null || echo "unknown")
    print_success "Rama: $current_branch"
    if [ "$current_branch" != "main" ] && [ "$current_branch" != "staging" ] && [ "$current_branch" != "develop" ]; then
        print_warning "Rama '$current_branch' - staging normalmente despliega desde main, staging o develop"
    fi

    echo ""
}

# ============================================================================
# PASO 2: EJECUTAR TESTS
# ============================================================================

run_tests() {
    if [ "$SKIP_TESTS" = true ]; then
        print_warning "Tests omitidos (--skip-tests)"
        return 0
    fi

    print_header "PASO 2: EJECUTAR TESTS"

    if [ "$DRY_RUN" = true ]; then
        print_success "[DRY-RUN] Tests omitidos"
        return 0
    fi

    # Backend tests
    print_step "Ejecutando tests de backend..."
    cd "$BACKEND_DIR"
    if npm test -- --passWithNoTests 2>/dev/null; then
        print_success "Tests de backend pasados"
    else
        print_warning "Tests de backend fallaron (continuando - es staging)"
    fi

    # Frontend tests
    print_step "Ejecutando tests de frontend..."
    cd "$FRONTEND_DIR"
    if npm run test:run 2>/dev/null; then
        print_success "Tests de frontend pasados"
    else
        print_warning "Tests de frontend fallaron (continuando - es staging)"
    fi

    echo ""
}

# ============================================================================
# PASO 3: BUILD DE APLICACIONES
# ============================================================================

build_applications() {
    print_header "PASO 3: BUILD DE APLICACIONES"

    if [ "$DRY_RUN" = true ]; then
        print_success "[DRY-RUN] Build omitido"
        return 0
    fi

    # Backend
    print_step "Building backend (staging)..."
    cd "$BACKEND_DIR"
    if npm ci --production=false && npm run build; then
        print_success "Backend build completado"
    else
        print_error "Backend build fallo"
        exit 1
    fi

    # Frontend
    print_step "Building frontend (staging)..."
    cd "$FRONTEND_DIR"
    if npm ci && VITE_APP_ENV=staging npm run build; then
        print_success "Frontend build completado"
    else
        print_error "Frontend build fallo"
        exit 1
    fi

    echo ""
}

# ============================================================================
# PASO 4: DEPLOY
# ============================================================================

deploy_application() {
    print_header "PASO 4: DEPLOY CON PM2 (STAGING)"

    if [ "$DRY_RUN" = true ]; then
        print_success "[DRY-RUN] Deploy omitido"
        return 0
    fi

    cd "$GAMILIT_ROOT"

    # Stop staging services (si existen)
    print_step "Deteniendo servicios staging actuales..."
    pm2 stop "$PM2_BACKEND_NAME" 2>/dev/null || true
    pm2 stop "$PM2_FRONTEND_NAME" 2>/dev/null || true
    pm2 delete "$PM2_BACKEND_NAME" 2>/dev/null || true
    pm2 delete "$PM2_FRONTEND_NAME" 2>/dev/null || true

    # Iniciar con configuracion staging
    print_step "Iniciando servicios staging..."
    pm2 start "$ECOSYSTEM_CONFIG" --env staging

    # Guardar configuracion PM2
    pm2 save

    print_success "Aplicacion staging desplegada"
    echo ""
}

# ============================================================================
# PASO 5: HEALTH CHECKS
# ============================================================================

health_checks() {
    print_header "PASO 5: HEALTH CHECKS"

    if [ "$DRY_RUN" = true ]; then
        print_success "[DRY-RUN] Health checks omitidos"
        return 0
    fi

    print_step "Esperando 10 segundos para que los servicios inicien..."
    sleep 10

    local max_retries=5
    local retry=0

    # Backend health check
    print_step "Verificando backend staging..."
    while [ $retry -lt $max_retries ]; do
        if curl -s "http://localhost:${BACKEND_PORT}/api/health" > /dev/null 2>&1; then
            print_success "Backend staging respondiendo en puerto $BACKEND_PORT"
            break
        fi
        retry=$((retry + 1))
        print_warning "Intento $retry/$max_retries fallido, esperando..."
        sleep 5
    done

    if [ $retry -eq $max_retries ]; then
        print_error "Backend staging no responde despues de $max_retries intentos"
        print_warning "Verificar logs: pm2 logs $PM2_BACKEND_NAME"
        exit 1
    fi

    # Verificar Swagger docs (habilitado en staging)
    if curl -s "http://localhost:${BACKEND_PORT}/api/v1/docs" > /dev/null 2>&1; then
        print_success "API Documentation disponible (Swagger habilitado en staging)"
    fi

    # Frontend check
    print_step "Verificando frontend staging..."
    if curl -s "http://localhost:${FRONTEND_PORT}" > /dev/null 2>&1; then
        print_success "Frontend staging respondiendo en puerto $FRONTEND_PORT"
    else
        print_warning "Frontend staging no responde en puerto $FRONTEND_PORT"
    fi

    # Mostrar status de PM2
    echo ""
    pm2 status
    echo ""
}

# ============================================================================
# RESUMEN FINAL
# ============================================================================

show_summary() {
    print_header "STAGING DEPLOY COMPLETADO"

    echo -e "${YELLOW}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║                   STAGING ENVIRONMENT                         ║${NC}"
    echo -e "${YELLOW}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    echo -e "${CYAN}Ambiente:${NC} STAGING"
    echo -e "${CYAN}Timestamp:${NC} $(date '+%Y-%m-%d %H:%M:%S')"
    echo -e "${CYAN}Database:${NC} gamilit_staging"
    echo -e "${CYAN}Redis DB:${NC} 1"
    echo ""

    echo -e "${CYAN}Servicios desplegados:${NC}"
    echo -e "  ${GREEN}✓${NC} Backend API:  http://localhost:${BACKEND_PORT}"
    echo -e "  ${GREEN}✓${NC} API Docs:     http://localhost:${BACKEND_PORT}/api/v1/docs"
    echo -e "  ${GREEN}✓${NC} Frontend:     http://localhost:${FRONTEND_PORT}"
    echo ""

    echo -e "${CYAN}PM2 Procesos:${NC}"
    echo -e "  ${PM2_BACKEND_NAME}   → port ${BACKEND_PORT}"
    echo -e "  ${PM2_FRONTEND_NAME}  → port ${FRONTEND_PORT}"
    echo ""

    echo -e "${CYAN}Comandos utiles:${NC}"
    echo -e "  pm2 status                              # Ver status"
    echo -e "  pm2 logs ${PM2_BACKEND_NAME}    # Backend logs"
    echo -e "  pm2 logs ${PM2_FRONTEND_NAME}   # Frontend logs"
    echo -e "  pm2 monit                               # Monitor"
    echo ""

    echo -e "${YELLOW}NOTA: Este es STAGING. Para produccion usar deploy-production.sh${NC}"
    echo ""
}

# ============================================================================
# MAIN
# ============================================================================

main() {
    # Parsear argumentos
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                print_error "Opcion desconocida: $1"
                show_help
                exit 1
                ;;
        esac
    done

    # Staging banner
    print_staging_banner

    if [ "$DRY_RUN" = true ]; then
        print_warning "=== MODO DRY-RUN: No se ejecutaran cambios reales ==="
        echo ""
    fi

    # Cargar configuracion
    load_env

    # Ejecutar pasos
    validate_prerequisites
    run_tests
    build_applications
    deploy_application
    health_checks
    show_summary
}

main "$@"
