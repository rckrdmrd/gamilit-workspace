#!/bin/bash
##############################################################################
# GAMILIT Platform - Database Recreation Script v1.1-TCP
#
# Propósito: ELIMINACIÓN COMPLETA y recreación (usuario + BD)
#            ⚠️  DESTRUYE TODOS LOS DATOS ⚠️
#
# Versión: 1.1-TCP - Soporte conexión TCP para ambientes sin socket local
#
# Cambios v1.1-TCP (2026-01-13):
#   - Soporte conexión TCP con gamilit_user (privilegio CREATEDB)
#   - Carga password desde backend/.env automáticamente
#   - drop_user() salta eliminación cuando conectado como gamilit_user
#   - Compatibilidad con WSL2 y ambientes donde PostgreSQL solo tiene TCP
#
# Uso:
#   ./recreate-database.sh                      # Modo interactivo
#   ./recreate-database.sh --env dev            # Desarrollo
#   ./recreate-database.sh --env prod           # Producción
#   ./recreate-database.sh --env dev --force    # Sin confirmación
#
# Funcionalidades:
#   1. ⚠️ Elimina completamente la BD gamilit_platform
#   2. ⚠️ Elimina el usuario gamilit_user (excepto en modo TCP)
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

DB_NAME="gamilit_platform"
DB_USER="gamilit_user"
DB_HOST="localhost"
DB_PORT="5432"
POSTGRES_USER="postgres"

ENVIRONMENT=""
FORCE_MODE=false
USE_SUDO=false
USE_GAMILIT_USER=false
DB_PASSWORD=""

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

show_help() {
    cat << EOF
GAMILIT Platform - Recreación Completa de Base de Datos

⚠️  ADVERTENCIA: Este script ELIMINA TODOS LOS DATOS

Uso: $0 [OPCIONES]

Opciones:
  --env dev|prod    Ambiente
  --force           No pedir confirmación
  --help            Mostrar ayuda

Ejemplos:
  $0 --env dev
  $0 --env prod --force

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
    elif [ "$USE_GAMILIT_USER" = true ]; then
        # Usar gamilit_user con CREATEDB privilege
        PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "$sql" 2>&1
    else
        PGPASSWORD="$PGPASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$POSTGRES_USER" -c "$sql" 2>&1
    fi
}

query_as_postgres() {
    local sql="$1"
    if [ "$USE_SUDO" = true ]; then
        echo "$sql" | sudo -u postgres psql -t | xargs
    elif [ "$USE_GAMILIT_USER" = true ]; then
        # Usar gamilit_user con CREATEDB privilege
        PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -t -c "$sql" 2>/dev/null | xargs
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

    # Cargar configuración del ambiente
    local config_file="$SCRIPT_DIR/config/${ENVIRONMENT}.conf"
    if [ -f "$config_file" ]; then
        source "$config_file"
        print_info "Configuración cargada: $config_file"
    fi

    # Cargar DB_PASSWORD desde backend/.env si no está definido
    local backend_env="$SCRIPT_DIR/../../backend/.env"
    if [ -z "$DB_PASSWORD" ] && [ -f "$backend_env" ]; then
        DB_PASSWORD=$(grep -E "^DB_PASSWORD=" "$backend_env" | cut -d'=' -f2- | tr -d '"' | tr -d "'")
        if [ -n "$DB_PASSWORD" ]; then
            print_info "Password cargado desde backend/.env"
        fi
    fi

    # Usar ENV_DB_HOST/PORT si están definidos
    [ -n "$ENV_DB_HOST" ] && DB_HOST="$ENV_DB_HOST"
    [ -n "$ENV_DB_PORT" ] && DB_PORT="$ENV_DB_PORT"

    # Verificar conexión PostgreSQL
    # Prioridad 1: Conexión TCP con gamilit_user (tiene CREATEDB)
    if [ -n "$DB_PASSWORD" ] && PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "SELECT 1" &> /dev/null 2>&1; then
        USE_SUDO=false
        USE_GAMILIT_USER=true
        print_success "Conectado a PostgreSQL (TCP con $DB_USER)"
    # Prioridad 2: Conexión TCP con postgres user
    elif [ -n "$PGPASSWORD" ] && psql -h "$DB_HOST" -p "$DB_PORT" -U "$POSTGRES_USER" -c "SELECT 1" &> /dev/null 2>&1; then
        USE_SUDO=false
        USE_GAMILIT_USER=false
        print_success "Conectado a PostgreSQL (TCP con postgres)"
    # Prioridad 3: sudo -u postgres (socket local)
    elif sudo -n -u postgres psql -c "SELECT 1" &> /dev/null 2>&1; then
        USE_SUDO=true
        USE_GAMILIT_USER=false
        print_success "Conectado a PostgreSQL (sudo)"
    else
        print_error "No se puede conectar a PostgreSQL"
        print_info "Opciones:"
        print_info "  1. Verificar que PostgreSQL está corriendo"
        print_info "  2. Verificar archivo config/${ENVIRONMENT}.conf con DB_PASSWORD"
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

    # Si usamos gamilit_user, no podemos eliminarnos a nosotros mismos
    if [ "$USE_GAMILIT_USER" = true ]; then
        print_info "Usando conexión TCP con $DB_USER - saltando eliminación de usuario"
        print_info "El usuario será reutilizado (ya tiene CREATEDB)"
        return
    fi

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

    local init_args="--env $ENVIRONMENT"
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

    confirm_deletion
    check_prerequisites
    drop_database
    drop_user
    reinitialize

    echo ""
    print_header "✅ BASE DE DATOS RECREADA"
    echo -e "${GREEN}Base de datos y usuario recreados desde cero${NC}"
    echo ""
}

main "$@"
