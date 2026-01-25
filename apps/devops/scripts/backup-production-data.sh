#!/bin/bash
##############################################################################
# GAMILIT Platform - Production Data Backup Script
#
# Proposito: Respaldar datos criticos antes de deploy a produccion
#
# Datos que respalda:
#   1. Usuarios (auth.users + auth_management.profiles)
#   2. Progreso de estudiantes (progress_tracking.*)
#   3. Logros y gamificacion (gamification_system.*)
#   4. Contenido de profesores (educational_content.teacher_content)
#
# Uso:
#   ./backup-production-data.sh --db-url "postgresql://user:pass@host:5432/db"
#   ./backup-production-data.sh --env prod  # Usa .env.production
#   ./backup-production-data.sh --list      # Listar backups existentes
#   ./backup-production-data.sh --restore BACKUP_FILE  # Restaurar backup
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

# Configuracion
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="${SCRIPT_DIR}/../backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATABASE_URL=""
ACTION="backup"
RESTORE_FILE=""

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
GAMILIT Platform - Production Data Backup

Uso: $0 [OPCIONES]

Opciones:
  --db-url URL          URL de conexion PostgreSQL
  --env dev|prod        Cargar .env del ambiente especificado
  --output-dir DIR      Directorio de salida (default: ../backups)
  --list                Listar backups existentes
  --restore FILE        Restaurar desde backup
  --help                Mostrar ayuda

Ejemplos:
  $0 --db-url "postgresql://user:pass@localhost:5432/gamilit_platform"
  $0 --env prod
  $0 --list
  $0 --restore backups/backup_20260125_120000.tar.gz

Datos respaldados:
  - auth.users (usuarios del sistema)
  - auth_management.profiles (perfiles de usuario)
  - auth_management.user_preferences (preferencias)
  - progress_tracking.* (progreso de estudiantes)
  - gamification_system.user_stats (estadisticas de gamificacion)
  - gamification_system.user_achievements (logros)
  - gamification_system.ml_coins_transactions (transacciones)
  - educational_content.teacher_content (contenido de profesores)

EOF
}

# ============================================================================
# CARGAR CONFIGURACION
# ============================================================================

load_env() {
    local env_file="${SCRIPT_DIR}/../../backend/.env.${1}"
    if [ -f "$env_file" ]; then
        print_step "Cargando configuracion desde $env_file..."
        export $(cat "$env_file" | grep -v '^#' | xargs)
        DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
        print_success "Configuracion cargada"
    else
        print_error "Archivo .env no encontrado: $env_file"
        exit 1
    fi
}

# ============================================================================
# BACKUP DE TABLAS CRITICAS
# ============================================================================

backup_table() {
    local schema=$1
    local table=$2
    local output_file=$3

    print_step "  Respaldando ${schema}.${table}..."

    if pg_dump "$DATABASE_URL" \
        --schema="$schema" \
        --table="${schema}.${table}" \
        --data-only \
        --column-inserts \
        --no-owner \
        --no-privileges \
        -f "$output_file" 2>/dev/null; then

        local rows=$(wc -l < "$output_file")
        print_success "  ${schema}.${table} - $(grep -c "^INSERT" "$output_file" 2>/dev/null || echo "0") registros"
    else
        print_warning "  ${schema}.${table} - No existe o sin datos"
        echo "-- Tabla ${schema}.${table} no encontrada o vacia" > "$output_file"
    fi
}

backup_schema() {
    local schema=$1
    local output_file=$2

    print_step "  Respaldando schema completo: ${schema}..."

    if pg_dump "$DATABASE_URL" \
        --schema="$schema" \
        --data-only \
        --column-inserts \
        --no-owner \
        --no-privileges \
        -f "$output_file" 2>/dev/null; then

        print_success "  Schema ${schema} respaldado"
    else
        print_warning "  Schema ${schema} - No existe o sin datos"
        echo "-- Schema ${schema} no encontrado o vacio" > "$output_file"
    fi
}

# ============================================================================
# EJECUTAR BACKUP
# ============================================================================

do_backup() {
    print_header "BACKUP DE DATOS DE PRODUCCION - GAMILIT"

    # Crear directorio de backup
    local backup_name="backup_${TIMESTAMP}"
    local backup_path="${BACKUP_DIR}/${backup_name}"
    mkdir -p "$backup_path"

    print_step "Directorio de backup: $backup_path"
    echo ""

    # 1. USUARIOS
    print_step "1. Respaldando USUARIOS..."
    mkdir -p "$backup_path/01-users"
    backup_table "auth" "users" "$backup_path/01-users/auth_users.sql"
    backup_table "auth_management" "profiles" "$backup_path/01-users/profiles.sql"
    backup_table "auth_management" "user_preferences" "$backup_path/01-users/user_preferences.sql"
    backup_table "auth_management" "user_roles" "$backup_path/01-users/user_roles.sql"
    echo ""

    # 2. PROGRESO DE ESTUDIANTES
    print_step "2. Respaldando PROGRESO DE ESTUDIANTES..."
    mkdir -p "$backup_path/02-progress"
    backup_schema "progress_tracking" "$backup_path/02-progress/progress_tracking_full.sql"
    echo ""

    # 3. GAMIFICACION
    print_step "3. Respaldando GAMIFICACION..."
    mkdir -p "$backup_path/03-gamification"
    backup_table "gamification_system" "user_stats" "$backup_path/03-gamification/user_stats.sql"
    backup_table "gamification_system" "user_achievements" "$backup_path/03-gamification/user_achievements.sql"
    backup_table "gamification_system" "user_ranks" "$backup_path/03-gamification/user_ranks.sql"
    backup_table "gamification_system" "ml_coins_transactions" "$backup_path/03-gamification/ml_coins_transactions.sql"
    backup_table "gamification_system" "comodines_inventory" "$backup_path/03-gamification/comodines_inventory.sql"
    echo ""

    # 4. CONTENIDO DE PROFESORES
    print_step "4. Respaldando CONTENIDO DE PROFESORES..."
    mkdir -p "$backup_path/04-teacher-content"
    backup_table "educational_content" "teacher_content" "$backup_path/04-teacher-content/teacher_content.sql"
    backup_table "educational_content" "published_teacher_content" "$backup_path/04-teacher-content/published_teacher_content.sql"
    echo ""

    # 5. SOCIAL (relaciones entre usuarios)
    print_step "5. Respaldando DATOS SOCIALES..."
    mkdir -p "$backup_path/05-social"
    backup_table "social_features" "friendships" "$backup_path/05-social/friendships.sql"
    backup_table "social_features" "classroom_members" "$backup_path/05-social/classroom_members.sql"
    backup_table "social_features" "team_members" "$backup_path/05-social/team_members.sql"
    echo ""

    # Crear archivo de metadata
    print_step "6. Creando metadata del backup..."
    cat > "$backup_path/BACKUP_METADATA.json" << EOF
{
    "timestamp": "${TIMESTAMP}",
    "date_human": "$(date '+%Y-%m-%d %H:%M:%S')",
    "database_url": "${DATABASE_URL%%@*}@[REDACTED]",
    "backup_version": "1.0.0",
    "gamilit_version": "MVP",
    "contents": [
        "01-users: auth.users, auth_management.profiles, user_preferences, user_roles",
        "02-progress: progress_tracking (schema completo)",
        "03-gamification: user_stats, user_achievements, user_ranks, ml_coins_transactions, comodines_inventory",
        "04-teacher-content: teacher_content, published_teacher_content",
        "05-social: friendships, classroom_members, team_members"
    ],
    "restore_command": "./backup-production-data.sh --restore ${backup_name}.tar.gz"
}
EOF
    print_success "Metadata creado"

    # Comprimir backup
    print_step "7. Comprimiendo backup..."
    cd "$BACKUP_DIR"
    tar -czf "${backup_name}.tar.gz" "$backup_name"
    rm -rf "$backup_name"

    local size=$(du -h "${backup_name}.tar.gz" | cut -f1)
    print_success "Backup comprimido: ${backup_name}.tar.gz ($size)"

    echo ""
    print_header "BACKUP COMPLETADO"
    echo -e "${CYAN}Archivo:${NC} ${BACKUP_DIR}/${backup_name}.tar.gz"
    echo -e "${CYAN}Tamano:${NC} $size"
    echo ""
    echo -e "${YELLOW}Para restaurar:${NC}"
    echo "  $0 --restore ${backup_name}.tar.gz"
    echo ""
}

# ============================================================================
# LISTAR BACKUPS
# ============================================================================

list_backups() {
    print_header "BACKUPS DISPONIBLES"

    if [ ! -d "$BACKUP_DIR" ]; then
        print_warning "No hay directorio de backups"
        exit 0
    fi

    local backups=$(ls -1 "$BACKUP_DIR"/*.tar.gz 2>/dev/null | sort -r)

    if [ -z "$backups" ]; then
        print_warning "No hay backups disponibles"
        exit 0
    fi

    echo -e "${CYAN}Directorio:${NC} $BACKUP_DIR"
    echo ""

    printf "%-40s %10s %s\n" "ARCHIVO" "TAMANO" "FECHA"
    printf "%-40s %10s %s\n" "-------" "------" "-----"

    for backup in $backups; do
        local filename=$(basename "$backup")
        local size=$(du -h "$backup" | cut -f1)
        local date=$(stat -c %y "$backup" 2>/dev/null | cut -d' ' -f1 || stat -f "%Sm" -t "%Y-%m-%d" "$backup" 2>/dev/null || echo "N/A")
        printf "%-40s %10s %s\n" "$filename" "$size" "$date"
    done
    echo ""
}

# ============================================================================
# RESTAURAR BACKUP
# ============================================================================

do_restore() {
    print_header "RESTAURACION DE BACKUP - GAMILIT"

    local restore_path=""

    # Verificar si es path absoluto o relativo
    if [ -f "$RESTORE_FILE" ]; then
        restore_path="$RESTORE_FILE"
    elif [ -f "${BACKUP_DIR}/${RESTORE_FILE}" ]; then
        restore_path="${BACKUP_DIR}/${RESTORE_FILE}"
    else
        print_error "Archivo de backup no encontrado: $RESTORE_FILE"
        exit 1
    fi

    print_step "Archivo de backup: $restore_path"

    # Extraer backup
    local temp_dir="${BACKUP_DIR}/restore_temp_${TIMESTAMP}"
    mkdir -p "$temp_dir"

    print_step "Extrayendo backup..."
    tar -xzf "$restore_path" -C "$temp_dir"

    local backup_folder=$(ls "$temp_dir" | head -1)
    local backup_content="${temp_dir}/${backup_folder}"

    # Mostrar metadata
    if [ -f "${backup_content}/BACKUP_METADATA.json" ]; then
        echo ""
        print_step "Metadata del backup:"
        cat "${backup_content}/BACKUP_METADATA.json"
        echo ""
    fi

    print_warning "ATENCION: Esta operacion insertara datos en la base de datos actual."
    print_warning "Se recomienda hacer un backup previo."
    echo ""
    read -p "¿Continuar con la restauracion? (y/n): " confirm

    if [ "$confirm" != "y" ]; then
        print_warning "Restauracion cancelada"
        rm -rf "$temp_dir"
        exit 0
    fi

    # Restaurar en orden
    print_step "Restaurando datos..."

    # 1. Usuarios
    if [ -d "${backup_content}/01-users" ]; then
        print_step "  Restaurando usuarios..."
        for sql_file in "${backup_content}/01-users"/*.sql; do
            if [ -f "$sql_file" ]; then
                psql "$DATABASE_URL" -f "$sql_file" > /dev/null 2>&1 || true
            fi
        done
        print_success "  Usuarios restaurados"
    fi

    # 2. Progreso
    if [ -d "${backup_content}/02-progress" ]; then
        print_step "  Restaurando progreso..."
        for sql_file in "${backup_content}/02-progress"/*.sql; do
            if [ -f "$sql_file" ]; then
                psql "$DATABASE_URL" -f "$sql_file" > /dev/null 2>&1 || true
            fi
        done
        print_success "  Progreso restaurado"
    fi

    # 3. Gamificacion
    if [ -d "${backup_content}/03-gamification" ]; then
        print_step "  Restaurando gamificacion..."
        for sql_file in "${backup_content}/03-gamification"/*.sql; do
            if [ -f "$sql_file" ]; then
                psql "$DATABASE_URL" -f "$sql_file" > /dev/null 2>&1 || true
            fi
        done
        print_success "  Gamificacion restaurada"
    fi

    # 4. Contenido
    if [ -d "${backup_content}/04-teacher-content" ]; then
        print_step "  Restaurando contenido de profesores..."
        for sql_file in "${backup_content}/04-teacher-content"/*.sql; do
            if [ -f "$sql_file" ]; then
                psql "$DATABASE_URL" -f "$sql_file" > /dev/null 2>&1 || true
            fi
        done
        print_success "  Contenido restaurado"
    fi

    # 5. Social
    if [ -d "${backup_content}/05-social" ]; then
        print_step "  Restaurando datos sociales..."
        for sql_file in "${backup_content}/05-social"/*.sql; do
            if [ -f "$sql_file" ]; then
                psql "$DATABASE_URL" -f "$sql_file" > /dev/null 2>&1 || true
            fi
        done
        print_success "  Datos sociales restaurados"
    fi

    # Limpiar
    rm -rf "$temp_dir"

    print_header "RESTAURACION COMPLETADA"
    echo ""
}

# ============================================================================
# MAIN
# ============================================================================

main() {
    # Parsear argumentos
    while [[ $# -gt 0 ]]; do
        case $1 in
            --db-url)
                DATABASE_URL="$2"
                shift 2
                ;;
            --env)
                load_env "$2"
                shift 2
                ;;
            --output-dir)
                BACKUP_DIR="$2"
                shift 2
                ;;
            --list)
                ACTION="list"
                shift
                ;;
            --restore)
                ACTION="restore"
                RESTORE_FILE="$2"
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

    # Crear directorio de backups si no existe
    mkdir -p "$BACKUP_DIR"

    # Ejecutar accion
    case $ACTION in
        backup)
            if [ -z "$DATABASE_URL" ]; then
                print_error "Debe especificar --db-url o --env"
                show_help
                exit 1
            fi
            do_backup
            ;;
        list)
            list_backups
            ;;
        restore)
            if [ -z "$DATABASE_URL" ]; then
                print_error "Debe especificar --db-url o --env para restaurar"
                exit 1
            fi
            if [ -z "$RESTORE_FILE" ]; then
                print_error "Debe especificar archivo de backup"
                exit 1
            fi
            do_restore
            ;;
    esac
}

main "$@"
