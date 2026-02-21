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
CURRENT_FULL_BACKUP=""
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
  3. Crear backup (full pg_dump + selectivo por tablas)
  4. Ejecutar migraciones de BD
  5. Build de aplicaciones (ANTES de detener servicios)
  6. Deploy con PM2 reload (zero-downtime)
  7. Health checks
  8. Validacion post-deploy de BD (tablas, funciones, schemas)
  9. Rollback automatico si falla

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
        print_error "Tests de backend fallaron"
        return 1
    fi

    # Frontend tests
    print_step "Ejecutando tests de frontend..."
    cd "$FRONTEND_DIR"
    if npm run test:run 2>/dev/null; then
        print_success "Tests de frontend pasados"
    else
        print_error "Tests de frontend fallaron"
        return 1
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

    # ALT-13: Full pg_dump backup (custom format, includes schema + data)
    # This is the primary recovery mechanism — the selective backup below is supplementary
    mkdir -p "$BACKUP_DIR"
    local full_dump_file="${BACKUP_DIR}/full_backup_$(date +%Y%m%d_%H%M%S).dump"

    print_step "Ejecutando full pg_dump backup..."
    if pg_dump -U "${DB_USER:-gamilit_user}" \
               -h "${DB_HOST:-localhost}" \
               -p "${DB_PORT:-5432}" \
               -d "${DB_NAME:-gamilit_platform}" \
               -F c \
               -f "$full_dump_file" 2>/dev/null; then
        local dump_size=$(du -h "$full_dump_file" | cut -f1)
        print_success "Full backup creado: $(basename $full_dump_file) ($dump_size)"
        CURRENT_FULL_BACKUP="$full_dump_file"
    else
        print_error "Full pg_dump backup fallo"
        print_warning "Intentando backup selectivo como alternativa..."
    fi

    # ALT-13: Retention cleanup — keep last 5 full backups, remove older ones
    print_step "Limpiando backups antiguos (retencion: 5 mas recientes)..."
    local old_dumps
    old_dumps=$(ls -t "${BACKUP_DIR}"/full_backup_*.dump 2>/dev/null | tail -n +6)
    if [ -n "$old_dumps" ]; then
        local removed_count=0
        while IFS= read -r old_dump; do
            rm -f "$old_dump"
            removed_count=$((removed_count + 1))
        done <<< "$old_dumps"
        print_success "Eliminados $removed_count backups antiguos"
    else
        print_success "No hay backups antiguos que limpiar"
    fi

    # Selective table-level backup (supplementary — for granular restore)
    print_step "Ejecutando backup selectivo de tablas criticas..."
    local backup_script="${SCRIPT_DIR}/backup-production-data.sh"

    if [ ! -f "$backup_script" ]; then
        print_warning "Script de backup selectivo no encontrado: $backup_script"
    else
        chmod +x "$backup_script"
        bash "$backup_script" --db-url "$DATABASE_URL"
    fi

    # Guardar nombre del backup para posible rollback
    CURRENT_BACKUP=$(ls -t "${BACKUP_DIR}"/*.tar.gz 2>/dev/null | head -1)
    if [ -n "$CURRENT_BACKUP" ]; then
        print_success "Backup selectivo creado: $(basename $CURRENT_BACKUP)"
    else
        print_warning "No se encontro archivo de backup selectivo"
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

    # ALT-12: Use pm2 reload for zero-downtime deployment
    # Build already completed in PASO 5 — no service interruption during build phase
    # pm2 reload gracefully restarts processes one-by-one (zero-downtime)
    # Falls back to startOrRestart if processes are not yet running
    print_step "Recargando servicios con zero-downtime..."
    if pm2 id gamilit-backend > /dev/null 2>&1 || pm2 id gamilit-frontend > /dev/null 2>&1; then
        # Processes exist — use reload for graceful restart (zero-downtime)
        print_step "Procesos existentes detectados — usando pm2 reload (zero-downtime)..."
        pm2 reload ecosystem.config.js --env production
    else
        # First deploy or processes not found — use startOrRestart
        print_step "Primera ejecucion — usando pm2 startOrRestart..."
        pm2 startOrRestart ecosystem.config.js --env production
    fi

    # Guardar configuracion
    pm2 save

    print_success "Aplicacion desplegada (zero-downtime)"
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
        if curl -s "http://localhost:${backend_port}/api/v1/health" > /dev/null 2>&1; then
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
# PASO 8: POST-DEPLOY DATABASE VALIDATION (ALT-14)
# ============================================================================

validate_database() {
    print_header "PASO 8: VALIDACION POST-DEPLOY DE BASE DE DATOS"

    if [ "$DRY_RUN" = true ]; then
        print_success "[DRY-RUN] Validacion de BD omitida"
        return 0
    fi

    # ALT-14: Thresholds based on current known counts (2026-02-20)
    # Tables: 169 (DDL source), Functions: 183 (DDL) / 249 (runtime), Seeds: 88
    local MIN_TABLES=169
    local MIN_FUNCTIONS=158
    local MIN_SEEDS=88
    local validation_errors=0

    # Count tables across all schemas
    print_step "Verificando conteo de tablas (minimo: ${MIN_TABLES})..."
    local table_count
    table_count=$(psql "$DATABASE_URL" -t -A -c \
        "SELECT COUNT(*) FROM information_schema.tables
         WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
           AND table_type = 'BASE TABLE';" 2>/dev/null || echo "0")
    table_count=$(echo "$table_count" | tr -d '[:space:]')

    if [ "$table_count" -ge "$MIN_TABLES" ] 2>/dev/null; then
        print_success "Tablas: $table_count (>= $MIN_TABLES)"
    else
        print_error "Tablas: $table_count (esperado >= $MIN_TABLES)"
        validation_errors=$((validation_errors + 1))
    fi

    # Count functions
    print_step "Verificando conteo de funciones (minimo: ${MIN_FUNCTIONS})..."
    local function_count
    function_count=$(psql "$DATABASE_URL" -t -A -c \
        "SELECT COUNT(*) FROM information_schema.routines
         WHERE routine_schema NOT IN ('pg_catalog', 'information_schema')
           AND routine_type = 'FUNCTION';" 2>/dev/null || echo "0")
    function_count=$(echo "$function_count" | tr -d '[:space:]')

    if [ "$function_count" -ge "$MIN_FUNCTIONS" ] 2>/dev/null; then
        print_success "Funciones: $function_count (>= $MIN_FUNCTIONS)"
    else
        print_error "Funciones: $function_count (esperado >= $MIN_FUNCTIONS)"
        validation_errors=$((validation_errors + 1))
    fi

    # Verify core schemas exist
    print_step "Verificando schemas core..."
    local core_schemas=("auth" "auth_management" "educational_content" "gamification_system" "progress_tracking" "social_features" "gamilit")
    local missing_schemas=0
    for schema in "${core_schemas[@]}"; do
        local exists
        exists=$(psql "$DATABASE_URL" -t -A -c \
            "SELECT COUNT(*) FROM information_schema.schemata WHERE schema_name = '$schema';" 2>/dev/null || echo "0")
        exists=$(echo "$exists" | tr -d '[:space:]')
        if [ "$exists" -eq 0 ] 2>/dev/null; then
            print_error "  Schema faltante: $schema"
            missing_schemas=$((missing_schemas + 1))
        fi
    done

    if [ "$missing_schemas" -eq 0 ]; then
        print_success "Todos los schemas core presentes (${#core_schemas[@]}/${#core_schemas[@]})"
    else
        print_error "$missing_schemas schemas faltantes"
        validation_errors=$((validation_errors + 1))
    fi

    # Verify essential data exists (users, profiles)
    print_step "Verificando datos esenciales..."
    local user_count
    user_count=$(psql "$DATABASE_URL" -t -A -c \
        "SELECT COUNT(*) FROM auth.users;" 2>/dev/null || echo "0")
    user_count=$(echo "$user_count" | tr -d '[:space:]')

    if [ "$user_count" -gt 0 ] 2>/dev/null; then
        print_success "Usuarios en BD: $user_count"
    else
        print_error "No se encontraron usuarios en auth.users"
        validation_errors=$((validation_errors + 1))
    fi

    # Summary
    echo ""
    if [ "$validation_errors" -gt 0 ]; then
        print_error "Validacion de BD: $validation_errors problemas encontrados"
        print_warning "Revisar logs y considerar rollback si los datos son criticos"
        return 1
    else
        print_success "Validacion de BD completada: todos los checks pasaron"
    fi

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

    if [ -n "$CURRENT_FULL_BACKUP" ]; then
        echo -e "${CYAN}Full backup:${NC} $(basename $CURRENT_FULL_BACKUP)"
    fi
    if [ -n "$CURRENT_BACKUP" ]; then
        echo -e "${CYAN}Backup selectivo:${NC} $(basename $CURRENT_BACKUP)"
    fi
    echo ""

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
    build_applications      # ALT-12: Build completes BEFORE any service interruption
    deploy_application      # ALT-12: Uses pm2 reload (zero-downtime) after build
    health_checks
    validate_database       # ALT-14: Post-deploy DB validation with thresholds
    show_summary
}

main "$@"
