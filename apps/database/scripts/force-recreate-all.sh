#!/bin/bash
##############################################################################
# GAMILIT Platform - Force Database Recreation
#
# Proposito: Eliminar completamente la BD y usuario, luego recrear desde cero
# Version: 2.0.0 - Sin passwords hardcodeados
#
# Cambios v2.0:
#   - Eliminar passwords hardcodeados (seguridad)
#   - Leer credenciales desde archivos de configuracion
#   - Puerto estandar 5432 (instancia unica compartida)
#   - Validacion de credenciales post-recreacion
#
# Uso:
#   ./force-recreate-all.sh                    # Usa credenciales de .env
#   ./force-recreate-all.sh --password "pass"  # Password manual
#
# IMPORTANTE: Este script requiere acceso sudo para operar como postgres
#
##############################################################################

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuracion de rutas
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATABASE_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
APPS_ROOT="$(cd "$DATABASE_ROOT/.." && pwd)"
BACKEND_DIR="$APPS_ROOT/backend"
CREDENTIALS_FILE="$DATABASE_ROOT/database-credentials-dev.txt"

# Configuracion de base de datos
DB_NAME="gamilit_platform"
DB_USER="gamilit_user"
DB_HOST="localhost"
DB_PORT="5432"  # Puerto estandar de PostgreSQL (instancia unica compartida)
DB_PASS=""

# ============================================================================
# FUNCIONES AUXILIARES
# ============================================================================

print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

print_step() {
    echo -e "${BLUE}▶ $1${NC}"
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

# ============================================================================
# OBTENER PASSWORD
# ============================================================================

get_password() {
    # Opcion 1: Password pasado como argumento
    if [ -n "$1" ]; then
        DB_PASS="$1"
        print_success "Password obtenido de argumento"
        return
    fi

    # Opcion 2: Variable de entorno GAMILIT_DB_PASSWORD
    if [ -n "$GAMILIT_DB_PASSWORD" ]; then
        DB_PASS="$GAMILIT_DB_PASSWORD"
        print_success "Password obtenido de \$GAMILIT_DB_PASSWORD"
        return
    fi

    # Opcion 3: Leer de backend/.env
    if [ -f "$BACKEND_DIR/.env" ]; then
        local pass=$(grep "^DB_PASSWORD=" "$BACKEND_DIR/.env" 2>/dev/null | cut -d= -f2)
        if [ -n "$pass" ]; then
            DB_PASS="$pass"
            print_success "Password obtenido de backend/.env"
            return
        fi
    fi

    # Opcion 4: Leer de .env.database
    if [ -f "$DATABASE_ROOT/.env.database" ]; then
        local pass=$(grep "^DB_PASSWORD=" "$DATABASE_ROOT/.env.database" 2>/dev/null | cut -d= -f2)
        if [ -n "$pass" ]; then
            DB_PASS="$pass"
            print_success "Password obtenido de .env.database"
            return
        fi
    fi

    # Opcion 5: Generar nuevo password
    print_warning "No se encontro password existente, generando nuevo..."
    DB_PASS=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
    print_success "Password generado: ${DB_PASS:0:8}...${DB_PASS: -4}"
}

# ============================================================================
# FUNCIONES DE BD
# ============================================================================

run_psql_sudo() {
    sudo -u postgres psql -p $DB_PORT -c "$1" 2>/dev/null
}

# ============================================================================
# RESPALDO DE CREDENCIALES ANTERIORES
# ============================================================================

backup_credentials() {
    print_step "Respaldando credenciales anteriores..."

    local BACKUP_DIR="$DATABASE_ROOT/credentials-backups"
    mkdir -p "$BACKUP_DIR"

    local TIMESTAMP=$(date +%Y%m%d_%H%M%S)

    # Respaldar archivos existentes
    if [ -f "$CREDENTIALS_FILE" ]; then
        cp "$CREDENTIALS_FILE" "$BACKUP_DIR/database-credentials-dev.${TIMESTAMP}.txt"
        print_success "Respaldo: database-credentials-dev.${TIMESTAMP}.txt"
    fi

    if [ -f "$BACKEND_DIR/.env" ]; then
        cp "$BACKEND_DIR/.env" "$BACKUP_DIR/backend-env.${TIMESTAMP}"
        print_success "Respaldo: backend-env.${TIMESTAMP}"
    fi

    if [ -f "$DATABASE_ROOT/.env.database" ]; then
        cp "$DATABASE_ROOT/.env.database" "$BACKUP_DIR/env-database.${TIMESTAMP}"
        print_success "Respaldo: env-database.${TIMESTAMP}"
    fi

    # Mantener solo los ultimos 10 respaldos
    ls -t "$BACKUP_DIR"/database-credentials-* 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true

    print_success "Respaldo completado en $BACKUP_DIR"
}

# ============================================================================
# ACTUALIZAR ARCHIVOS DE CONFIGURACION
# ============================================================================

update_config_files() {
    print_step "Actualizando archivos de configuracion..."

    local TIMESTAMP=$(date "+%a %b %d %H:%M:%S %Z %Y")

    # 1. Actualizar database-credentials-dev.txt
    cat > "$CREDENTIALS_FILE" << EOF
GAMILIT Platform - Database Credentials
Environment: dev
Generated: $TIMESTAMP
========================================

Host:     $DB_HOST:$DB_PORT
Database: $DB_NAME
User:     $DB_USER
Password: $DB_PASS

Connection String:
postgresql://$DB_USER:$DB_PASS@$DB_HOST:$DB_PORT/$DB_NAME

========================================
EOF
    chmod 600 "$CREDENTIALS_FILE"
    print_success "Actualizado: database-credentials-dev.txt"

    # 2. Actualizar backend/.env (si existe)
    if [ -f "$BACKEND_DIR/.env" ]; then
        # Crear backup
        cp "$BACKEND_DIR/.env" "$BACKEND_DIR/.env.backup.$(date +%Y%m%d_%H%M%S)"

        # Actualizar DB_PASSWORD
        if grep -q "^DB_PASSWORD=" "$BACKEND_DIR/.env"; then
            sed -i "s|^DB_PASSWORD=.*|DB_PASSWORD=$DB_PASS|" "$BACKEND_DIR/.env"
        fi

        # Actualizar DB_PORT
        if grep -q "^DB_PORT=" "$BACKEND_DIR/.env"; then
            sed -i "s|^DB_PORT=.*|DB_PORT=$DB_PORT|" "$BACKEND_DIR/.env"
        fi

        chmod 600 "$BACKEND_DIR/.env"
        print_success "Actualizado: backend/.env"
    fi

    # 3. Actualizar .env.database (si existe)
    if [ -f "$DATABASE_ROOT/.env.database" ]; then
        cp "$DATABASE_ROOT/.env.database" "$DATABASE_ROOT/.env.database.backup.$(date +%Y%m%d_%H%M%S)"

        if grep -q "^DB_PASSWORD=" "$DATABASE_ROOT/.env.database"; then
            sed -i "s|^DB_PASSWORD=.*|DB_PASSWORD=$DB_PASS|" "$DATABASE_ROOT/.env.database"
        fi

        if grep -q "^DB_PORT=" "$DATABASE_ROOT/.env.database"; then
            sed -i "s|^DB_PORT=.*|DB_PORT=$DB_PORT|" "$DATABASE_ROOT/.env.database"
        fi

        chmod 600 "$DATABASE_ROOT/.env.database"
        print_success "Actualizado: .env.database"
    fi

    print_success "Archivos de configuracion actualizados"
}

# ============================================================================
# VALIDACION POST-RECREACION
# ============================================================================

validate_connection() {
    print_step "Validando conexion con nuevas credenciales..."

    if PGPASSWORD="$DB_PASS" psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" > /dev/null 2>&1; then
        print_success "Conexion validada exitosamente"
        return 0
    else
        print_error "Fallo la validacion de conexion"
        return 1
    fi
}

# ============================================================================
# MAIN
# ============================================================================

main() {
    print_header "FORCE DATABASE RECREATION v2.0"

    # Parsear argumentos
    local MANUAL_PASS=""
    while [[ $# -gt 0 ]]; do
        case $1 in
            --password)
                MANUAL_PASS="$2"
                shift 2
                ;;
            --help)
                echo "Uso: $0 [--password PASSWORD]"
                echo ""
                echo "Opciones:"
                echo "  --password PASS  Password manual para el usuario de BD"
                echo ""
                echo "Si no se especifica password, se busca en:"
                echo "  1. Variable \$GAMILIT_DB_PASSWORD"
                echo "  2. backend/.env (DB_PASSWORD)"
                echo "  3. .env.database (DB_PASSWORD)"
                echo "  4. Se genera uno nuevo"
                exit 0
                ;;
            *)
                shift
                ;;
        esac
    done

    # Verificar que somos root o tenemos sudo
    if ! sudo -n true 2>/dev/null; then
        print_warning "Este script requiere permisos sudo"
        print_warning "Se le pedira su password de sudo..."
    fi

    # Obtener password
    get_password "$MANUAL_PASS"

    if [ -z "$DB_PASS" ]; then
        print_error "No se pudo obtener password para la BD"
        exit 1
    fi

    # Respaldar credenciales anteriores
    backup_credentials

    echo ""
    print_step "[1/6] Terminando conexiones existentes..."
    run_psql_sudo "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();" || true
    print_success "Conexiones terminadas"

    print_step "[2/6] Eliminando base de datos '$DB_NAME'..."
    run_psql_sudo "DROP DATABASE IF EXISTS $DB_NAME;" || true
    print_success "Base de datos eliminada"

    print_step "[3/6] Eliminando usuario '$DB_USER'..."
    run_psql_sudo "DROP OWNED BY $DB_USER CASCADE;" 2>/dev/null || true
    run_psql_sudo "DROP USER IF EXISTS $DB_USER;" || true
    print_success "Usuario eliminado"

    print_step "[4/6] Creando usuario '$DB_USER'..."
    run_psql_sudo "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS' CREATEDB LOGIN;"
    print_success "Usuario creado"

    print_step "[5/6] Creando base de datos '$DB_NAME'..."
    run_psql_sudo "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
    print_success "Base de datos creada"

    # Actualizar archivos de configuracion
    update_config_files

    print_step "[6/6] Validando conexion..."
    if validate_connection; then
        print_header "DATABASE READY"
        echo ""
        echo "Credenciales guardadas en:"
        echo "  - $CREDENTIALS_FILE"
        echo "  - $BACKEND_DIR/.env"
        echo ""
        echo "Para inicializar esquemas y datos, ejecuta:"
        echo "  ./init-database-v3.sh --env dev"
        echo ""
    else
        print_error "La base de datos fue creada pero la conexion fallo"
        print_warning "Verifica las credenciales manualmente"
        exit 1
    fi
}

# Ejecutar
main "$@"
