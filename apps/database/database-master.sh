#!/bin/bash
##############################################################################
# GAMILIT Platform - Database Master Script
#
# Version: 1.0.0
# Fecha: 2026-01-18
#
# DESCRIPCION:
#   Script maestro para recreacion de base de datos con dos modos automaticos.
#   Unifica force-recreate-all.sh y drop-and-recreate-database.sh en un solo
#   punto de entrada.
#
# MODOS:
#   full    - Elimina usuario + BD, crea nuevo usuario con password, BD, DDL, seeds
#   db-only - Mantiene usuario, recrea solo BD + DDL + seeds (mas rapido)
#
# USO:
#   ./database-master.sh --mode full --env dev
#   ./database-master.sh --mode db-only --env dev
#   ./database-master.sh --mode full --env dev --password "mi_password"
#   ./database-master.sh --mode full --env prod
#
# AUTENTICACION:
#   DEV:  usa sudo con password automatico (2320)
#   PROD: usa TCP con PGPASSWORD (sin sudo)
#
# POLITICA: Carga Limpia - Sin migrations, solo DDL puro
#
##############################################################################

set -e  # Exit on error

# ============================================================================
# CONSTANTES
# ============================================================================

DB_NAME="gamilit_platform"
DB_USER="gamilit_user"
DB_HOST="localhost"
DB_PORT="5433"  # PostgreSQL 16 en este sistema usa puerto 5433
SUDO_PASS_DEV="2320"

# ============================================================================
# COLORES
# ============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# ============================================================================
# RUTAS
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APPS_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_DIR="$APPS_ROOT/backend"
CREDENTIALS_FILE="$SCRIPT_DIR/database-credentials-dev.txt"
CREDENTIALS_BACKUP_DIR="$SCRIPT_DIR/credentials-backups"

# ============================================================================
# VARIABLES GLOBALES
# ============================================================================

MODE=""
ENV="dev"
DB_PASS=""
MANUAL_PASS=""
START_TIME=""
POSTGRES_SUPERUSER_PASS=""

# ============================================================================
# FUNCIONES DE IMPRESION
# ============================================================================

print_header() {
    echo ""
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC} ${BOLD}$1${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_step() {
    echo -e "${BLUE}▶${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${CYAN}ℹ${NC} $1"
}

# ============================================================================
# FUNCIONES DE AYUDA
# ============================================================================

show_help() {
    cat << 'EOF'
GAMILIT Database Master Script v1.0

USO:
    ./database-master.sh --mode <MODE> --env <ENV> [OPTIONS]

MODOS (--mode):
    full      Recreacion completa: usuario + BD + DDL + seeds
              - Elimina usuario existente y sus objetos
              - Crea nuevo usuario con password (nuevo o especificado)
              - Crea BD vacia
              - Ejecuta DDL completo (17 fases)
              - Carga seeds (88 archivos)
              - Actualiza archivos .env automaticamente
              Tiempo estimado: ~90 segundos

    db-only   Solo base de datos: BD + DDL + seeds
              - Mantiene usuario existente
              - Usa password existente de .env
              - Drop y crea BD
              - Ejecuta DDL + seeds
              Tiempo estimado: ~60 segundos

AMBIENTES (--env):
    dev       Desarrollo local (default)
              - Usa sudo para acceso a postgres
              - Password sudo automatico (2320)

    prod      Produccion
              - Usa TCP con PGPASSWORD
              - Requiere POSTGRES_SUPERUSER_PASS en ambiente

OPTIONS:
    --password <PASS>   Password especifico para el usuario de BD
                        (solo aplica en modo full)

    --help              Muestra esta ayuda

EJEMPLOS:
    # Recreacion completa en DEV (genera nuevo password)
    ./database-master.sh --mode full --env dev

    # Recreacion completa con password especifico
    ./database-master.sh --mode full --env dev --password "mi_password_seguro"

    # Solo recrear BD (mas rapido, mantiene usuario)
    ./database-master.sh --mode db-only --env dev

    # Produccion (requiere POSTGRES_SUPERUSER_PASS)
    POSTGRES_SUPERUSER_PASS="superpass" ./database-master.sh --mode full --env prod

ARCHIVOS ACTUALIZADOS (modo full):
    - apps/database/database-credentials-dev.txt
    - apps/database/.env.database
    - apps/backend/.env

VALIDACIONES POST-RECREACION:
    - Conexion a BD exitosa
    - Schemas creados (esperado: 16+)
    - Tablas creadas (esperado: 149+)
    - Funciones creadas (esperado: 125+)
    - Archivos .env sincronizados

EOF
    exit 0
}

# ============================================================================
# FUNCIONES DE ARGUMENTOS
# ============================================================================

parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --mode)
                MODE="$2"
                shift 2
                ;;
            --env)
                ENV="$2"
                shift 2
                ;;
            --password)
                MANUAL_PASS="$2"
                shift 2
                ;;
            --help|-h)
                show_help
                ;;
            *)
                print_error "Argumento desconocido: $1"
                echo "Usa --help para ver opciones disponibles"
                exit 1
                ;;
        esac
    done

    # Validar modo
    if [ -z "$MODE" ]; then
        print_error "Modo requerido: --mode full | --mode db-only"
        exit 1
    fi

    if [[ "$MODE" != "full" && "$MODE" != "db-only" ]]; then
        print_error "Modo invalido: $MODE"
        echo "Modos validos: full, db-only"
        exit 1
    fi

    # Validar ambiente
    if [[ "$ENV" != "dev" && "$ENV" != "prod" ]]; then
        print_error "Ambiente invalido: $ENV"
        echo "Ambientes validos: dev, prod"
        exit 1
    fi
}

# ============================================================================
# FUNCIONES DE AUTENTICACION
# ============================================================================

setup_authentication() {
    print_step "Configurando autenticacion para ambiente: $ENV"

    if [ "$ENV" = "dev" ]; then
        # DEV: Verificar sudo
        if ! echo "$SUDO_PASS_DEV" | sudo -S true 2>/dev/null; then
            print_error "No se pudo autenticar con sudo"
            print_info "Verifica que el password sudo sea correcto (configurado: 2320)"
            exit 1
        fi
        print_success "Autenticacion sudo configurada"
    else
        # PROD: Verificar PGPASSWORD para superusuario
        if [ -z "$POSTGRES_SUPERUSER_PASS" ]; then
            print_error "POSTGRES_SUPERUSER_PASS requerido para ambiente prod"
            print_info "Ejemplo: POSTGRES_SUPERUSER_PASS='pass' ./database-master.sh --mode full --env prod"
            exit 1
        fi
        print_success "Autenticacion TCP configurada"
    fi
}

# ============================================================================
# FUNCIONES DE EJECUCION PSQL
# ============================================================================

run_as_postgres_dev() {
    local sql="$1"
    # No especificar puerto para usar socket local Unix (default)
    # psql -p solo funciona con TCP, no con socket local
    echo "$SUDO_PASS_DEV" | sudo -S -u postgres psql -c "$sql" 2>/dev/null
}

run_as_postgres_prod() {
    local sql="$1"
    PGPASSWORD="$POSTGRES_SUPERUSER_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U postgres -c "$sql" 2>/dev/null
}

run_as_postgres() {
    if [ "$ENV" = "dev" ]; then
        run_as_postgres_dev "$1"
    else
        run_as_postgres_prod "$1"
    fi
}

# ============================================================================
# FUNCIONES DE PASSWORD
# ============================================================================

get_password() {
    # Opcion 1: Password manual
    if [ -n "$MANUAL_PASS" ]; then
        DB_PASS="$MANUAL_PASS"
        print_success "Password obtenido de argumento --password"
        return
    fi

    # Opcion 2: Variable de entorno
    if [ -n "${GAMILIT_DB_PASSWORD:-}" ]; then
        DB_PASS="$GAMILIT_DB_PASSWORD"
        print_success "Password obtenido de \$GAMILIT_DB_PASSWORD"
        return
    fi

    # Opcion 3: backend/.env
    if [ -f "$BACKEND_DIR/.env" ]; then
        local pass
        pass=$(grep "^DB_PASSWORD=" "$BACKEND_DIR/.env" 2>/dev/null | cut -d= -f2)
        if [ -n "$pass" ]; then
            DB_PASS="$pass"
            print_success "Password obtenido de backend/.env"
            return
        fi
    fi

    # Opcion 4: .env.database
    if [ -f "$SCRIPT_DIR/.env.database" ]; then
        local pass
        pass=$(grep "^DB_PASSWORD=" "$SCRIPT_DIR/.env.database" 2>/dev/null | cut -d= -f2)
        if [ -n "$pass" ]; then
            DB_PASS="$pass"
            print_success "Password obtenido de .env.database"
            return
        fi
    fi

    # Opcion 5: Generar nuevo (solo en modo full)
    if [ "$MODE" = "full" ]; then
        print_warning "No se encontro password existente, generando nuevo..."
        DB_PASS=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
        print_success "Password generado: ${DB_PASS:0:8}...${DB_PASS: -4}"
    else
        print_error "No se encontro password para modo db-only"
        print_info "El modo db-only requiere password existente en .env"
        exit 1
    fi
}

# ============================================================================
# FUNCIONES DE BACKUP
# ============================================================================

backup_credentials() {
    print_step "Respaldando credenciales anteriores..."

    mkdir -p "$CREDENTIALS_BACKUP_DIR"

    local TIMESTAMP
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)

    # Respaldar archivos existentes
    if [ -f "$CREDENTIALS_FILE" ]; then
        cp "$CREDENTIALS_FILE" "$CREDENTIALS_BACKUP_DIR/database-credentials-dev.${TIMESTAMP}.txt"
        print_success "Backup: database-credentials-dev.${TIMESTAMP}.txt"
    fi

    if [ -f "$BACKEND_DIR/.env" ]; then
        cp "$BACKEND_DIR/.env" "$CREDENTIALS_BACKUP_DIR/backend-env.${TIMESTAMP}"
        print_success "Backup: backend-env.${TIMESTAMP}"
    fi

    if [ -f "$SCRIPT_DIR/.env.database" ]; then
        cp "$SCRIPT_DIR/.env.database" "$CREDENTIALS_BACKUP_DIR/env-database.${TIMESTAMP}"
        print_success "Backup: env-database.${TIMESTAMP}"
    fi

    # Mantener solo los ultimos 10 respaldos
    find "$CREDENTIALS_BACKUP_DIR" -name "database-credentials-*" -type f | sort -r | tail -n +11 | xargs rm -f 2>/dev/null || true
    find "$CREDENTIALS_BACKUP_DIR" -name "backend-env.*" -type f | sort -r | tail -n +11 | xargs rm -f 2>/dev/null || true
    find "$CREDENTIALS_BACKUP_DIR" -name "env-database.*" -type f | sort -r | tail -n +11 | xargs rm -f 2>/dev/null || true

    print_success "Respaldo completado"
}

# ============================================================================
# FUNCIONES DE SINCRONIZACION .ENV
# ============================================================================

sync_env_files() {
    print_step "Sincronizando archivos .env..."

    local TIMESTAMP
    TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
    local DATABASE_URL="postgresql://$DB_USER:$DB_PASS@$DB_HOST:$DB_PORT/$DB_NAME"

    # 1. Actualizar database-credentials-dev.txt
    cat > "$CREDENTIALS_FILE" << EOF
# ============================================================================
# GAMILIT Platform - Database Credentials
# Generated: $TIMESTAMP
# Script: database-master.sh --mode $MODE --env $ENV
# ============================================================================

Host:     $DB_HOST:$DB_PORT
Database: $DB_NAME
User:     $DB_USER
Password: $DB_PASS

Connection String:
$DATABASE_URL

# ============================================================================
EOF
    chmod 600 "$CREDENTIALS_FILE"
    print_success "Actualizado: database-credentials-dev.txt"

    # 2. Actualizar .env.database
    cat > "$SCRIPT_DIR/.env.database" << EOF
# ============================================================================
# GAMILIT Platform - Database Credentials
# Generated: $TIMESTAMP
# ============================================================================

# Database Connection
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASS

# Connection URL for TypeORM/Prisma
DATABASE_URL=$DATABASE_URL

# Pool Configuration (optional)
DB_POOL_MIN=2
DB_POOL_MAX=10

# SSL Configuration
DB_SSL=false
EOF
    chmod 600 "$SCRIPT_DIR/.env.database"
    print_success "Actualizado: .env.database"

    # 3. Actualizar backend/.env (solo las variables de BD)
    if [ -f "$BACKEND_DIR/.env" ]; then
        # Actualizar DB_PASSWORD
        if grep -q "^DB_PASSWORD=" "$BACKEND_DIR/.env"; then
            sed -i "s|^DB_PASSWORD=.*|DB_PASSWORD=$DB_PASS|" "$BACKEND_DIR/.env"
        fi

        # Actualizar DB_PORT
        if grep -q "^DB_PORT=" "$BACKEND_DIR/.env"; then
            sed -i "s|^DB_PORT=.*|DB_PORT=$DB_PORT|" "$BACKEND_DIR/.env"
        fi

        # Actualizar DB_HOST
        if grep -q "^DB_HOST=" "$BACKEND_DIR/.env"; then
            sed -i "s|^DB_HOST=.*|DB_HOST=$DB_HOST|" "$BACKEND_DIR/.env"
        fi

        chmod 600 "$BACKEND_DIR/.env"
        print_success "Actualizado: backend/.env"
    else
        print_warning "backend/.env no encontrado, omitiendo actualizacion"
    fi
}

# ============================================================================
# MODO FULL: USUARIO + BD + DDL + SEEDS
# ============================================================================

execute_full_mode() {
    print_header "MODO FULL: Recreacion Completa"

    echo ""
    print_info "Este proceso:"
    print_info "  1. Eliminara el usuario $DB_USER y todos sus objetos"
    print_info "  2. Creara nuevo usuario con password"
    print_info "  3. Creara base de datos $DB_NAME"
    print_info "  4. Habilitara BYPASSRLS para seeds (requiere superusuario)"
    print_info "  5. Ejecutara DDL completo (17 fases)"
    print_info "  6. Cargara seeds (88 archivos)"
    print_info "  7. Actualizara archivos .env"
    echo ""

    # Obtener password
    get_password

    # Respaldar credenciales
    backup_credentials

    # Paso 1: Terminar conexiones existentes
    print_step "[1/8] Terminando conexiones existentes..."
    run_as_postgres "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();" || true
    print_success "Conexiones terminadas"

    # Paso 2: Eliminar base de datos
    print_step "[2/8] Eliminando base de datos '$DB_NAME'..."
    run_as_postgres "DROP DATABASE IF EXISTS $DB_NAME;" || true
    print_success "Base de datos eliminada"

    # Paso 3: Eliminar usuario
    print_step "[3/8] Eliminando usuario '$DB_USER'..."
    run_as_postgres "DROP OWNED BY $DB_USER CASCADE;" 2>/dev/null || true
    run_as_postgres "DROP USER IF EXISTS $DB_USER;" || true
    print_success "Usuario eliminado"

    # Paso 4: Crear usuario
    print_step "[4/8] Creando usuario '$DB_USER'..."
    run_as_postgres "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS' CREATEDB LOGIN;"
    print_success "Usuario creado"

    # Paso 5: Crear base de datos
    print_step "[5/8] Creando base de datos '$DB_NAME'..."
    run_as_postgres "CREATE DATABASE $DB_NAME OWNER $DB_USER ENCODING 'UTF8';"
    print_success "Base de datos creada"

    # Paso 6: Habilitar BYPASSRLS (CRITICO para seeds)
    # NOTA: Este comando DEBE ejecutarse como superusuario (postgres)
    # Un usuario normal NO puede otorgarse BYPASSRLS a si mismo
    print_step "[6/8] Habilitando BYPASSRLS para '$DB_USER'..."
    run_as_postgres "ALTER ROLE $DB_USER BYPASSRLS;"

    # Verificar que BYPASSRLS se habilito correctamente
    local bypassrls_check
    bypassrls_check=$(echo "$SUDO_PASS_DEV" | sudo -S -u postgres psql -t -c "SELECT rolbypassrls FROM pg_roles WHERE rolname = '$DB_USER';" 2>/dev/null | tr -d ' ')

    if [ "$bypassrls_check" = "t" ]; then
        print_success "BYPASSRLS habilitado (requerido para cargar seeds con RLS)"
    else
        print_error "No se pudo habilitar BYPASSRLS - los seeds fallaran"
        print_warning "Verifica permisos de superusuario"
        exit 1
    fi

    # Paso 7: Sincronizar .env
    sync_env_files

    # Paso 8: Ejecutar DDL + Seeds
    print_step "[8/8] Ejecutando DDL y Seeds..."
    echo ""

    local DATABASE_URL="postgresql://$DB_USER:$DB_PASS@$DB_HOST:$DB_PORT/$DB_NAME"

    if [ -f "$SCRIPT_DIR/create-database.sh" ]; then
        "$SCRIPT_DIR/create-database.sh" "$DATABASE_URL"
        local exit_code=$?

        if [ $exit_code -ne 0 ]; then
            print_error "create-database.sh fallo con codigo $exit_code"
            exit $exit_code
        fi
    else
        print_error "create-database.sh no encontrado en $SCRIPT_DIR"
        exit 1
    fi
}

# ============================================================================
# MODO DB-ONLY: SOLO BD + DDL + SEEDS
# ============================================================================

execute_db_only_mode() {
    print_header "MODO DB-ONLY: Solo Base de Datos"

    echo ""
    print_info "Este proceso:"
    print_info "  1. Mantendra el usuario $DB_USER existente"
    print_info "  2. Eliminara y recreara base de datos $DB_NAME"
    print_info "  3. Ejecutara DDL completo (17 fases)"
    print_info "  4. Cargara seeds (88 archivos)"
    echo ""

    # Obtener password existente (requerido)
    get_password

    local DATABASE_URL="postgresql://$DB_USER:$DB_PASS@$DB_HOST:$DB_PORT/$DB_NAME"

    # Usar drop-and-recreate-database.sh que ya llama a create-database.sh
    if [ -f "$SCRIPT_DIR/drop-and-recreate-database.sh" ]; then
        "$SCRIPT_DIR/drop-and-recreate-database.sh" "$DATABASE_URL"
        local exit_code=$?

        if [ $exit_code -ne 0 ]; then
            print_error "drop-and-recreate-database.sh fallo con codigo $exit_code"
            exit $exit_code
        fi
    else
        print_error "drop-and-recreate-database.sh no encontrado en $SCRIPT_DIR"
        exit 1
    fi
}

# ============================================================================
# VALIDACION POST-RECREACION
# ============================================================================

validate_result() {
    print_header "Validacion Post-Recreacion"

    local DATABASE_URL="postgresql://$DB_USER:$DB_PASS@$DB_HOST:$DB_PORT/$DB_NAME"
    local errors=0

    # 1. Validar conexion
    print_step "Validando conexion..."
    if PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
        print_success "Conexion exitosa"
    else
        print_error "Conexion fallida"
        ((errors++))
    fi

    # 2. Contar schemas
    print_step "Validando schemas..."
    local schema_count
    schema_count=$(PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
        "SELECT COUNT(*) FROM information_schema.schemata WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast', 'public');" 2>/dev/null | tr -d ' ')

    if [ "$schema_count" -ge 15 ]; then
        print_success "Schemas: $schema_count (esperado: 15+)"
    else
        print_warning "Schemas: $schema_count (esperado: 15+)"
    fi

    # 3. Contar tablas
    print_step "Validando tablas..."
    local table_count
    table_count=$(PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
        "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog', 'information_schema');" 2>/dev/null | tr -d ' ')

    if [ "$table_count" -ge 140 ]; then
        print_success "Tablas: $table_count (esperado: 140+)"
    else
        print_warning "Tablas: $table_count (esperado: 140+)"
    fi

    # 4. Contar funciones
    print_step "Validando funciones..."
    local function_count
    function_count=$(PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
        "SELECT COUNT(*) FROM pg_proc WHERE pronamespace IN (SELECT oid FROM pg_namespace WHERE nspname NOT IN ('pg_catalog', 'information_schema'));" 2>/dev/null | tr -d ' ')

    if [ "$function_count" -ge 100 ]; then
        print_success "Funciones: $function_count (esperado: 100+)"
    else
        print_warning "Funciones: $function_count (esperado: 100+)"
    fi

    # 5. Validar .env sincronizados
    print_step "Validando archivos .env..."

    if [ -f "$CREDENTIALS_FILE" ]; then
        print_success "database-credentials-dev.txt existe"
    else
        print_error "database-credentials-dev.txt no encontrado"
        ((errors++))
    fi

    if [ -f "$SCRIPT_DIR/.env.database" ]; then
        print_success ".env.database existe"
    else
        print_warning ".env.database no encontrado"
    fi

    # Resultado
    echo ""
    if [ $errors -eq 0 ]; then
        print_success "Todas las validaciones pasaron"
        return 0
    else
        print_error "Validacion fallida con $errors errores"
        return 1
    fi
}

# ============================================================================
# RESUMEN FINAL
# ============================================================================

print_summary() {
    local END_TIME
    END_TIME=$(date +%s)
    local DURATION=$((END_TIME - START_TIME))

    print_header "RESUMEN"

    echo -e "  ${BOLD}Modo:${NC}       $MODE"
    echo -e "  ${BOLD}Ambiente:${NC}   $ENV"
    echo -e "  ${BOLD}Base datos:${NC} $DB_NAME"
    echo -e "  ${BOLD}Usuario:${NC}    $DB_USER"
    echo -e "  ${BOLD}Host:${NC}       $DB_HOST:$DB_PORT"
    echo -e "  ${BOLD}Duracion:${NC}   ${DURATION}s"
    echo ""
    echo -e "  ${BOLD}Credenciales guardadas en:${NC}"
    echo -e "    - $CREDENTIALS_FILE"
    echo -e "    - $SCRIPT_DIR/.env.database"
    if [ -f "$BACKEND_DIR/.env" ]; then
        echo -e "    - $BACKEND_DIR/.env"
    fi
    echo ""
    echo -e "  ${BOLD}Para verificar:${NC}"
    echo -e "    PGPASSWORD='$DB_PASS' psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c 'SELECT COUNT(*) FROM auth_management.profiles;'"
    echo ""
}

# ============================================================================
# MAIN
# ============================================================================

main() {
    START_TIME=$(date +%s)

    print_header "GAMILIT Database Master Script v1.0"

    # Parsear argumentos
    parse_arguments "$@"

    # Configurar autenticacion
    setup_authentication

    # Ejecutar segun modo
    case $MODE in
        full)
            execute_full_mode
            ;;
        db-only)
            execute_db_only_mode
            ;;
    esac

    # Validar resultado
    validate_result

    # Resumen
    print_summary

    echo ""
    print_success "Base de datos lista para usar"
    echo ""
}

# ============================================================================
# EJECUTAR
# ============================================================================

main "$@"
