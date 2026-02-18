#!/bin/bash
##############################################################################
# GAMILIT Platform - Database Recreation Script
#
# Propósito: ELIMINACIÓN COMPLETA y recreación (usuario + BD)
#            ⚠️  DESTRUYE TODOS LOS DATOS ⚠️
#
# Uso:
#   ./recreate-database.sh                      # Modo interactivo
#   ./recreate-database.sh --env dev            # Desarrollo
#   ./recreate-database.sh --env prod           # Producción
#   ./recreate-database.sh --env dev --force    # Sin confirmación
#
# Funcionalidades:
#   1. ⚠️ Elimina completamente la BD gamilit_platform
#   2. ⚠️ Elimina el usuario gamilit_user
#   3. Ejecuta init-database.sh para recrear todo
#
##############################################################################

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuración
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INIT_SCRIPT="$SCRIPT_DIR/init-database.sh"
CONFIG_DIR="$SCRIPT_DIR/config"
DATABASE_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

DB_NAME="gamilit_platform"
DB_USER="gamilit_user"
DB_HOST="localhost"
DB_PORT="${DB_PORT:-5432}"  # FUENTE VERDAD: apps/database/scripts/config/dev.conf | prod.conf
POSTGRES_USER="postgres"

ENVIRONMENT=""
FORCE_MODE=false
DB_PASSWORD_ARG=""
ENV_DB_HOST=""
ENV_DB_PORT=""
ENV_CREATE_BACKUP_BEFORE_DROP="false"
ENV_BACKUP_DIR="backups/pre-init"

# ============================================================================
# FUNCIONES AUXILIARES
# ============================================================================

print_header() {
    echo ""
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}$1${NC}"
    echo -e "${RED}========================================${NC}"
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

print_info() {
    echo "  $1"
}

load_environment_config() {
    local config_file="$CONFIG_DIR/${ENVIRONMENT}.conf"
    if [ -f "$config_file" ]; then
        source "$config_file"
        if [ -n "$ENV_DB_HOST" ]; then
            DB_HOST="$ENV_DB_HOST"
        fi
        if [ -n "$ENV_DB_PORT" ]; then
            DB_PORT="$ENV_DB_PORT"
        fi
    fi
}

validate_environment_safety() {
    if [ "$ENVIRONMENT" = "prod" ]; then
        print_step "Aplicando controles de seguridad para PROD..."

        # En producción el password debe ser explícito para evitar desalineación con .env
        if [ -z "$DB_PASSWORD_ARG" ] && [ -z "$GAMILIT_DB_PASSWORD" ]; then
            print_error "En PROD debes pasar --password o exportar GAMILIT_DB_PASSWORD"
            exit 1
        fi

        # Evitar recreación con backend online para reducir conexiones activas inesperadas
        if command -v pm2 &> /dev/null; then
            if pm2 list 2>/dev/null | grep -E "gamilit-backend|gamilit-frontend" | grep -q "online"; then
                print_error "PM2 está online. Ejecuta: pm2 stop ecosystem.config.js antes de recrear en PROD"
                exit 1
            fi
        fi

        print_warning "Asegura backup previo antes de continuar en PROD"
    fi
}

create_pre_drop_backup() {
    if [ "$ENVIRONMENT" != "prod" ]; then
        return
    fi

    if [ "${ENV_CREATE_BACKUP_BEFORE_DROP:-false}" != "true" ]; then
        print_warning "Backup pre-drop deshabilitado en config PROD"
        return
    fi

    local db_exists
    db_exists=$(query_as_postgres "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")
    if [ -z "$db_exists" ]; then
        print_info "No existe BD previa, omitiendo backup pre-drop"
        return
    fi

    local backup_dir="$DATABASE_ROOT/${ENV_BACKUP_DIR:-backups/pre-init}"
    local backup_file="$backup_dir/${DB_NAME}_pre_recreate_$(date +%Y%m%d_%H%M%S).sql"

    print_step "Generando backup pre-drop de PROD..."
    mkdir -p "$backup_dir"

    if [ "$USE_SUDO" = true ]; then
        if sudo -u postgres pg_dump "$DB_NAME" > "$backup_file" 2>/dev/null; then
            print_success "Backup creado: $backup_file"
        else
            print_error "No se pudo crear backup pre-drop con sudo"
            exit 1
        fi
    else
        local backup_password="$DB_PASSWORD_ARG"
        if [ -z "$backup_password" ]; then
            backup_password="${GAMILIT_DB_PASSWORD:-}"
        fi
        if [ -z "$backup_password" ]; then
            print_error "No hay password disponible para backup TCP en PROD"
            exit 1
        fi
        if PGPASSWORD="$backup_password" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$POSTGRES_USER" "$DB_NAME" > "$backup_file" 2>/dev/null; then
            print_success "Backup creado: $backup_file"
        else
            print_error "No se pudo crear backup pre-drop por TCP"
            exit 1
        fi
    fi
}

show_help() {
    cat << EOF
GAMILIT Platform - Recreación Completa de Base de Datos

⚠️  ADVERTENCIA: Este script ELIMINA TODOS LOS DATOS

Uso: $0 [OPCIONES]

Opciones:
  --env dev|prod        Ambiente
  --password PASSWORD   Password para el usuario de BD (requerido en prod)
  --force               No pedir confirmación
  --help                Mostrar ayuda

Ejemplos:
  $0 --env dev
  $0 --env prod --password 'mi_password_seguro' --force

Este script:
  1. Elimina la base de datos gamilit_platform
  2. Elimina el usuario gamilit_user
  3. Ejecuta init-database.sh para recrear todo

EOF
}

# ============================================================================
# FUNCIONES SQL
# ============================================================================

execute_as_postgres() {
    local sql="$1"
    if [ "$USE_SUDO" = true ]; then
        echo "$sql" | sudo -u postgres psql 2>&1
    else
        PGPASSWORD="$PGPASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$POSTGRES_USER" -c "$sql" 2>&1
    fi
}

query_as_postgres() {
    local sql="$1"
    if [ "$USE_SUDO" = true ]; then
        echo "$sql" | sudo -u postgres psql -t | xargs
    else
        PGPASSWORD="$PGPASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$POSTGRES_USER" -t -c "$sql" | xargs
    fi
}

# ============================================================================
# VERIFICACIÓN
# ============================================================================

check_prerequisites() {
    print_step "Verificando prerequisitos..."

    if ! command -v psql &> /dev/null; then
        print_error "psql no encontrado"
        exit 1
    fi

    if [ ! -f "$INIT_SCRIPT" ]; then
        print_error "Script de inicialización no encontrado: $INIT_SCRIPT"
        exit 1
    fi

    # Verificar conexión PostgreSQL
    if sudo -n -u postgres psql -c "SELECT 1" &> /dev/null 2>&1; then
        USE_SUDO=true
        print_success "Conectado a PostgreSQL (sudo)"
    elif [ -n "$PGPASSWORD" ] && psql -h "$DB_HOST" -p "$DB_PORT" -U "$POSTGRES_USER" -c "SELECT 1" &> /dev/null 2>&1; then
        USE_SUDO=false
        print_success "Conectado a PostgreSQL (TCP)"
    else
        print_error "No se puede conectar a PostgreSQL"
        exit 1
    fi
}

# ============================================================================
# PASO 1: ELIMINAR BASE DE DATOS
# ============================================================================

drop_database() {
    print_step "PASO 1/3: Eliminando base de datos..."

    db_exists=$(query_as_postgres "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")

    if [ -z "$db_exists" ]; then
        print_info "Base de datos '$DB_NAME' no existe"
        return
    fi

    print_info "Terminando conexiones activas..."
    execute_as_postgres "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();" > /dev/null 2>&1 || true
    sleep 1

    print_info "Eliminando base de datos '$DB_NAME'..."
    if execute_as_postgres "DROP DATABASE IF EXISTS $DB_NAME;" > /dev/null 2>&1; then
        print_success "Base de datos eliminada"
    else
        print_error "Error al eliminar base de datos"
        exit 1
    fi
}

# ============================================================================
# PASO 2: ELIMINAR USUARIO
# ============================================================================

drop_user() {
    print_step "PASO 2/3: Eliminando usuario..."

    user_exists=$(query_as_postgres "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'")

    if [ -z "$user_exists" ]; then
        print_info "Usuario '$DB_USER' no existe"
        return
    fi

    print_info "Eliminando objetos del usuario..."
    execute_as_postgres "DROP OWNED BY $DB_USER CASCADE;" > /dev/null 2>&1 || true

    print_info "Eliminando usuario '$DB_USER'..."
    if execute_as_postgres "DROP USER IF EXISTS $DB_USER;" > /dev/null 2>&1; then
        print_success "Usuario eliminado"
    else
        print_warning "No se pudo eliminar el usuario"
    fi
}

# ============================================================================
# PASO 3: REINICIALIZAR
# ============================================================================

reinitialize() {
    print_step "PASO 3/3: Reinicializando..."

    print_info "Ejecutando init-database.sh..."
    echo ""

    # Password: usar argumento explícito, o variable de entorno, o pedir interactivamente
    local password_arg=""
    if [ -n "$DB_PASSWORD_ARG" ]; then
        password_arg="--password $DB_PASSWORD_ARG"
    elif [ -n "$GAMILIT_DB_PASSWORD" ]; then
        password_arg="--password $GAMILIT_DB_PASSWORD"
    fi
    local init_args="--env $ENVIRONMENT $password_arg"
    if [ "$FORCE_MODE" = true ]; then
        init_args="$init_args --force"
    fi

    if bash "$INIT_SCRIPT" $init_args; then
        print_success "Reinicialización completada"
    else
        print_error "Error durante reinicialización"
        exit 1
    fi
}

# ============================================================================
# CONFIRMACIÓN
# ============================================================================

confirm_deletion() {
    print_header "⚠️  ADVERTENCIA: ELIMINACIÓN DE DATOS"

    echo -e "${RED}Este script eliminará PERMANENTEMENTE:${NC}"
    echo -e "  • Base de datos: ${YELLOW}$DB_NAME${NC}"
    echo -e "  • Usuario: ${YELLOW}$DB_USER${NC}"
    echo ""
    echo -e "${RED}TODOS LOS DATOS SERÁN ELIMINADOS${NC}"
    echo ""

    if [ "$FORCE_MODE" = false ]; then
        echo -e "${RED}¿Estás COMPLETAMENTE seguro?${NC}"
        read -p "Escribe 'DELETE ALL' para confirmar: " confirmation

        if [ "$confirmation" != "DELETE ALL" ]; then
            print_info "Operación cancelada"
            exit 0
        fi

        read -p "¿Continuar? (yes/no): " final_confirm
        if [ "$final_confirm" != "yes" ]; then
            print_info "Operación cancelada"
            exit 0
        fi
    fi

    print_warning "Iniciando en 3 segundos..."
    sleep 1
    echo -n "3... "
    sleep 1
    echo -n "2... "
    sleep 1
    echo "1..."
    sleep 1
}

# ============================================================================
# MAIN
# ============================================================================

main() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --env)
                ENVIRONMENT="$2"
                shift 2
                ;;
            --password)
                DB_PASSWORD_ARG="$2"
                shift 2
                ;;
            --force)
                FORCE_MODE=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                print_error "Opción desconocida: $1"
                show_help
                exit 1
                ;;
        esac
    done

    if [ -z "$ENVIRONMENT" ]; then
        print_header "GAMILIT Platform - Recreación de BD"
        echo "Selecciona ambiente:"
        echo "  1) dev"
        echo "  2) prod"
        read -p "Opción: " env_option

        case $env_option in
            1) ENVIRONMENT="dev" ;;
            2) ENVIRONMENT="prod" ;;
            *)
                print_error "Opción inválida"
                exit 1
                ;;
        esac
    fi

    if [ "$ENVIRONMENT" != "dev" ] && [ "$ENVIRONMENT" != "prod" ]; then
        print_error "Ambiente inválido: $ENVIRONMENT"
        exit 1
    fi

    load_environment_config
    validate_environment_safety
    confirm_deletion
    check_prerequisites
    create_pre_drop_backup
    drop_database
    drop_user
    reinitialize

    echo ""
    print_header "✅ BASE DE DATOS RECREADA"
    echo -e "${GREEN}Base de datos y usuario recreados desde cero${NC}"
    echo ""
}

main "$@"
