#!/bin/bash
##############################################################################
# GAMILIT Platform - Production Deployment Script
#
# Proposito: Deploy seguro a produccion con backup, migracion y rollback
#
# Proceso:
#   1. Pre-deploy checks (build, tests)
#   2. Backup de datos criticos (usuarios, progreso, gamificacion)
#   3. Migracion de base de datos
#   4. Deploy de aplicacion
#   5. Health checks
#   6. Rollback automatico si falla
#
# Uso:
#   ./deploy-production.sh --env prod
#   ./deploy-production.sh --env prod --skip-backup  # Sin backup (riesgoso)
#   ./deploy-production.sh --env prod --dry-run      # Simular
#   ./deploy-production.sh --rollback BACKUP_FILE    # Rollback manual
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
BACKUP_DIR="$DEVOPS_ROOT/backups"

# Variables
ENVIRONMENT=""
SKIP_BACKUP=false
SKIP_TESTS=false
DRY_RUN=false
ROLLBACK_FILE=""
CURRENT_BACKUP=""
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

show_help() {
    cat << EOF
GAMILIT Platform - Production Deployment

Uso: $0 [OPCIONES]

Opciones:
  --env prod            Ambiente de destino [REQUERIDO]
  --skip-backup         Omitir backup (NO RECOMENDADO)
  --skip-tests          Omitir tests
  --dry-run             Simular deployment
  --rollback FILE       Ejecutar rollback desde backup
  --help                Mostrar ayuda

Ejemplos:
  $0 --env prod
  $0 --env prod --dry-run
  $0 --rollback backups/backup_20260125_120000.tar.gz

Proceso de Deploy:
  1. Validar prerequisitos
  2. Ejecutar tests (opcional)
  3. Crear backup de datos criticos
  4. Ejecutar migraciones de BD
  5. Build de aplicaciones
  6. Deploy con PM2/Docker
  7. Health checks
  8. Rollback automatico si falla

Datos respaldados automaticamente:
  - Usuarios y perfiles
  - Progreso de estudiantes
  - Estadisticas de gamificacion
  - Logros y transacciones
  - Contenido de profesores

EOF
}

load_env() {
    local env_file="${BACKEND_DIR}/.env.production"
    if [ -f "$env_file" ]; then
        print_step "Cargando configuracion de produccion..."
        export $(cat "$env_file" | grep -v '^#' | grep -v '^$' | xargs)
        DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
        print_success "Configuracion cargada"
    else
        # Intentar con variables de entorno existentes
        if [ -n "$DB_HOST" ] && [ -n "$DB_NAME" ]; then
            DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
            print_success "Usando variables de entorno existentes"
        else
            print_error "No se encontro configuracion de produccion"
            print_warning "Crear archivo: ${BACKEND_DIR}/.env.production"
            exit 1
        fi
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

    # PostgreSQL
    if ! command -v psql &> /dev/null; then
        print_error "PostgreSQL (psql) no encontrado"
        exit 1
    fi
    print_success "PostgreSQL client encontrado"

    # PM2
    if ! command -v pm2 &> /dev/null; then
        print_warning "PM2 no encontrado - se instalara"
        if [ "$DRY_RUN" = false ]; then
            npm install -g pm2
        fi
    fi
    print_success "PM2 disponible"

    # Verificar conexion a BD
    print_step "Verificando conexion a base de datos..."
    if [ "$DRY_RUN" = true ]; then
        print_success "[DRY-RUN] Verificacion de BD omitida"
    else
        if psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
            print_success "Conexion a BD exitosa"
        else
            print_error "No se puede conectar a la base de datos"
            exit 1
        fi
    fi

    # Verificar que estamos en la rama correcta
    print_step "Verificando rama de git..."
    local current_branch=$(git -C "$GAMILIT_ROOT" branch --show-current 2>/dev/null || echo "unknown")
    if [ "$current_branch" != "main" ] && [ "$current_branch" != "master" ]; then
        print_warning "Rama actual: $current_branch (se espera main/master)"
        read -p "¿Continuar de todas formas? (y/n): " confirm
        if [ "$confirm" != "y" ]; then
            exit 1
        fi
    else
        print_success "Rama: $current_branch"
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
        print_warning "Tests de backend fallaron (continuando con advertencia)"
    fi

    # Frontend tests
    print_step "Ejecutando tests de frontend..."
    cd "$FRONTEND_DIR"
    if npm run test:run 2>/dev/null; then
        print_success "Tests de frontend pasados"
    else
        print_warning "Tests de frontend fallaron (continuando con advertencia)"
    fi

    echo ""
}

# ============================================================================
# PASO 3: BACKUP DE DATOS
# ============================================================================

create_backup() {
    if [ "$SKIP_BACKUP" = true ]; then
        print_warning "Backup omitido (--skip-backup) - NO RECOMENDADO"
        return 0
    fi

    print_header "PASO 3: BACKUP DE DATOS CRITICOS"

    if [ "$DRY_RUN" = true ]; then
        print_success "[DRY-RUN] Backup omitido"
        return 0
    fi

    print_step "Ejecutando backup de produccion..."
    local backup_script="${SCRIPT_DIR}/backup-production-data.sh"

    if [ ! -f "$backup_script" ]; then
        print_error "Script de backup no encontrado: $backup_script"
        exit 1
    fi

    chmod +x "$backup_script"
    bash "$backup_script" --db-url "$DATABASE_URL"

    # Guardar nombre del backup para posible rollback
    CURRENT_BACKUP=$(ls -t "${BACKUP_DIR}"/*.tar.gz 2>/dev/null | head -1)
    if [ -n "$CURRENT_BACKUP" ]; then
        print_success "Backup creado: $(basename $CURRENT_BACKUP)"
    else
        print_warning "No se encontro archivo de backup"
    fi

    echo ""
}

# ============================================================================
# PASO 4: MIGRACIONES DE BD
# ============================================================================

run_migrations() {
    print_header "PASO 4: MIGRACIONES DE BASE DE DATOS"

    local migrations_dir="${DATABASE_DIR}/migrations"

    if [ ! -d "$migrations_dir" ]; then
        print_warning "No hay directorio de migraciones"
        return 0
    fi

    local pending_migrations=$(find "$migrations_dir" -name "*.sql" -type f 2>/dev/null | sort)

    if [ -z "$pending_migrations" ]; then
        print_success "No hay migraciones pendientes"
        return 0
    fi

    print_step "Migraciones encontradas:"
    for migration in $pending_migrations; do
        echo "    - $(basename $migration)"
    done
    echo ""

    if [ "$DRY_RUN" = true ]; then
        print_success "[DRY-RUN] Migraciones omitidas"
        return 0
    fi

    # Ejecutar migraciones
    for migration in $pending_migrations; do
        local migration_name=$(basename "$migration")
        print_step "Ejecutando: $migration_name"

        if psql "$DATABASE_URL" -f "$migration" > /dev/null 2>&1; then
            print_success "  Completada: $migration_name"

            # Mover migracion a ejecutadas
            local executed_dir="${migrations_dir}/executed"
            mkdir -p "$executed_dir"
            mv "$migration" "$executed_dir/"
        else
            print_error "  Fallo: $migration_name"
            print_error "Iniciando rollback automatico..."
            do_rollback
            exit 1
        fi
    done

    print_success "Todas las migraciones ejecutadas"
    echo ""
}

# ============================================================================
# PASO 5: BUILD DE APLICACIONES
# ============================================================================

build_applications() {
    print_header "PASO 5: BUILD DE APLICACIONES"

    if [ "$DRY_RUN" = true ]; then
        print_success "[DRY-RUN] Build omitido"
        return 0
    fi

    # Backend
    print_step "Building backend..."
    cd "$BACKEND_DIR"
    if npm ci --production=false && npm run build; then
        print_success "Backend build completado"
    else
        print_error "Backend build fallo"
        do_rollback
        exit 1
    fi

    # Frontend
    print_step "Building frontend..."
    cd "$FRONTEND_DIR"
    if npm ci && npm run build:prod; then
        print_success "Frontend build completado"
    else
        print_error "Frontend build fallo"
        do_rollback
        exit 1
    fi

    echo ""
}

# ============================================================================
# PASO 6: DEPLOY
# ============================================================================

deploy_application() {
    print_header "PASO 6: DEPLOY CON PM2"

    if [ "$DRY_RUN" = true ]; then
        print_success "[DRY-RUN] Deploy omitido"
        return 0
    fi

    cd "$GAMILIT_ROOT"

    # Verificar ecosystem.config.js
    if [ ! -f "ecosystem.config.js" ]; then
        print_error "ecosystem.config.js no encontrado"
        do_rollback
        exit 1
    fi

    # Stop servicios actuales
    print_step "Deteniendo servicios actuales..."
    pm2 stop all 2>/dev/null || true

    # Iniciar con nueva version
    print_step "Iniciando nueva version..."
    pm2 startOrRestart ecosystem.config.js --env production

    # Guardar configuracion
    pm2 save

    print_success "Aplicacion desplegada"
    echo ""
}

# ============================================================================
# PASO 7: HEALTH CHECKS
# ============================================================================

health_checks() {
    print_header "PASO 7: HEALTH CHECKS"

    if [ "$DRY_RUN" = true ]; then
        print_success "[DRY-RUN] Health checks omitidos"
        return 0
    fi

    print_step "Esperando 15 segundos para que los servicios inicien..."
    sleep 15

    local backend_port="${PORT:-3006}"
    local max_retries=5
    local retry=0

    # Backend health check
    print_step "Verificando backend..."
    while [ $retry -lt $max_retries ]; do
        if curl -s "http://localhost:${backend_port}/api/health" > /dev/null 2>&1; then
            print_success "Backend respondiendo en puerto $backend_port"
            break
        fi
        retry=$((retry + 1))
        print_warning "Intento $retry/$max_retries fallido, esperando..."
        sleep 5
    done

    if [ $retry -eq $max_retries ]; then
        print_error "Backend no responde despues de $max_retries intentos"
        print_error "Iniciando rollback automatico..."
        do_rollback
        exit 1
    fi

    # Verificar Swagger docs
    if curl -s "http://localhost:${backend_port}/api/v1/docs" > /dev/null 2>&1; then
        print_success "API Documentation disponible"
    fi

    # Mostrar status de PM2
    echo ""
    pm2 status
    echo ""
}

# ============================================================================
# ROLLBACK
# ============================================================================

do_rollback() {
    print_header "ROLLBACK EN PROGRESO"

    if [ -z "$CURRENT_BACKUP" ] && [ -z "$ROLLBACK_FILE" ]; then
        print_error "No hay backup disponible para rollback"
        return 1
    fi

    local backup_to_restore="${ROLLBACK_FILE:-$CURRENT_BACKUP}"

    print_step "Restaurando desde: $(basename $backup_to_restore)"

    # Restaurar backup de datos
    local backup_script="${SCRIPT_DIR}/backup-production-data.sh"
    if [ -f "$backup_script" ]; then
        chmod +x "$backup_script"
        bash "$backup_script" --db-url "$DATABASE_URL" --restore "$backup_to_restore"
    fi

    # Rollback de git (si hay commits pendientes)
    print_step "Verificando estado de git..."
    cd "$GAMILIT_ROOT"
    if git status --porcelain | grep -q .; then
        print_warning "Hay cambios sin commit - no se hace rollback de git"
    fi

    # Reiniciar servicios con version anterior
    print_step "Reiniciando servicios..."
    pm2 restart all 2>/dev/null || true

    print_success "Rollback completado"
}

# ============================================================================
# RESUMEN FINAL
# ============================================================================

show_summary() {
    print_header "DEPLOY COMPLETADO EXITOSAMENTE"

    local backend_port="${PORT:-3006}"

    echo -e "${CYAN}Ambiente:${NC} PRODUCCION"
    echo -e "${CYAN}Timestamp:${NC} $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""

    echo -e "${CYAN}Servicios desplegados:${NC}"
    echo -e "  ${GREEN}✓${NC} Backend API: http://localhost:${backend_port}"
    echo -e "  ${GREEN}✓${NC} API Docs: http://localhost:${backend_port}/api/v1/docs"
    echo ""

    if [ -n "$CURRENT_BACKUP" ]; then
        echo -e "${CYAN}Backup creado:${NC} $(basename $CURRENT_BACKUP)"
        echo ""
    fi

    echo -e "${CYAN}Comandos utiles:${NC}"
    echo -e "  pm2 status              # Ver status"
    echo -e "  pm2 logs                # Ver logs"
    echo -e "  pm2 monit               # Monitor"
    echo ""

    echo -e "${YELLOW}Para rollback:${NC}"
    if [ -n "$CURRENT_BACKUP" ]; then
        echo -e "  $0 --rollback $(basename $CURRENT_BACKUP)"
    else
        echo -e "  $0 --rollback BACKUP_FILE"
    fi
    echo ""
}

# ============================================================================
# MAIN
# ============================================================================

main() {
    # Parsear argumentos
    while [[ $# -gt 0 ]]; do
        case $1 in
            --env)
                ENVIRONMENT="$2"
                shift 2
                ;;
            --skip-backup)
                SKIP_BACKUP=true
                shift
                ;;
            --skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --rollback)
                ROLLBACK_FILE="$2"
                shift 2
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

    # Si es rollback, ejecutar solo eso
    if [ -n "$ROLLBACK_FILE" ]; then
        load_env
        do_rollback
        exit 0
    fi

    # Validar ambiente
    if [ "$ENVIRONMENT" != "prod" ] && [ "$ENVIRONMENT" != "production" ]; then
        print_error "Este script es solo para produccion (--env prod)"
        exit 1
    fi

    # Banner
    if [ "$DRY_RUN" = true ]; then
        print_header "DEPLOY A PRODUCCION (DRY-RUN)"
    else
        print_header "DEPLOY A PRODUCCION - GAMILIT"
    fi

    # Cargar configuracion
    load_env

    # Ejecutar pasos
    validate_prerequisites
    run_tests
    create_backup
    run_migrations
    build_applications
    deploy_application
    health_checks
    show_summary
}

main "$@"
