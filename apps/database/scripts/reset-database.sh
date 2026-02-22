#!/bin/bash
##############################################################################
# GAMILIT Platform - Database Reset Script v2.2
#
# Propósito: Reiniciar SOLO la base de datos (mantiene usuario existente)
#            ⚠️  Elimina datos pero NO el usuario PostgreSQL
#
# Versión: 2.2 - Sincronizado con init-database.sh v3.9
# Fecha: 2025-12-29
#
# Cambios v2.2 (2025-12-29):
#   - Agregado system_configuration a execute_indexes (faltaba)
#   - Agregado lti_integration a execute_triggers (faltaba)
#   - Scripts sincronizados con estructura DDL actual
#
# Cambios v2.1 (2025-12-29):
#   - CRÍTICO: Agregado execute_functions() - carga funciones unificadas de missions
#   - CRÍTICO: Agregado execute_views() - carga vistas necesarias
#   - CRÍTICO: Agregado execute_indexes() - carga índices de rendimiento
#   - CRÍTICO: Agregado execute_triggers() - carga triggers de gamificación
#   - Sin estas funciones, el sistema de misiones NO funcionaba después de reset
#   - Pasos: 4 → 8 (DDL, funciones, vistas, índices, triggers, seeds, fix)
#
# Cambios v2.0 (2025-12-28):
#   - Sincronizado con init-database.sh v3.8
#   - 16 schemas (antes 9)
#   - 56 seeds organizados en 10 fases (antes ~33)
#   - Agregado gamilit, storage, admin_dashboard, communication, lti_integration, notifications
#   - Agregado 00-schools-default.sql (crítico para FK)
#   - Agregado función fix_profiles_and_gamification()
#
# Uso:
#   ./reset-database.sh                         # Modo interactivo
#   ./reset-database.sh --env dev               # Desarrollo
#   ./reset-database.sh --env prod              # Producción
#   ./reset-database.sh --env dev --force       # Sin confirmación
#   ./reset-database.sh --password "mi_pass"    # Con password conocido
#
# Funcionalidades:
#   1. ⚠️ Elimina la BD gamilit_platform
#   2. ✅ Mantiene el usuario gamilit_user
#   3. Recrea BD, ejecuta DDL y carga seeds (sincronizado con init-database.sh)
#
# Ideal para:
#   - Usuario ya existe con password conocido
#   - Resetear datos sin tocar configuración de usuario
#   - Ambientes donde el usuario tiene permisos específicos
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

# Configuración de rutas
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATABASE_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DDL_DIR="$DATABASE_ROOT/ddl"
SEEDS_DIR="$DATABASE_ROOT/seeds"

# Configuración de base de datos
DB_NAME="gamilit_platform"
DB_USER="gamilit_user"
DB_HOST="localhost"
DB_PORT="${DB_PORT:-5432}"
POSTGRES_USER="postgres"

# Variables
ENVIRONMENT=""
FORCE_MODE=false
DB_PASSWORD=""

# ============================================================================
# FUNCIONES AUXILIARES
# ============================================================================

print_header() {
    echo ""
    echo -e "${YELLOW}========================================${NC}"
    echo -e "${YELLOW}$1${NC}"
    echo -e "${YELLOW}========================================${NC}"
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
GAMILIT Platform - Reset de Base de Datos (Mantiene Usuario)

Uso: $0 [OPCIONES]

Opciones:
  --env dev|prod      Ambiente
  --password PASS     Password del usuario existente (requerido)
  --force             No pedir confirmación
  --help              Mostrar ayuda

Ejemplos:
  $0 --env dev --password "mi_password"
  $0 --env prod --password "prod_pass" --force

Este script:
  1. Elimina la base de datos gamilit_platform
  2. Mantiene el usuario gamilit_user
  3. Recrea la BD con DDL y seeds

⚠️  Requiere conocer el password del usuario existente

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

execute_sql_file() {
    local file="$1"
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$file" 2>&1
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
    print_success "psql encontrado"

    if [ ! -d "$DDL_DIR" ]; then
        print_error "Directorio DDL no encontrado: $DDL_DIR"
        exit 1
    fi

    if [ ! -d "$SEEDS_DIR" ]; then
        print_error "Directorio seeds no encontrado: $SEEDS_DIR"
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

    # Verificar que el usuario existe
    user_exists=$(query_as_postgres "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'")
    if [ -z "$user_exists" ]; then
        print_error "Usuario '$DB_USER' no existe"
        print_info "Usa init-database.sh para crear el usuario primero"
        exit 1
    fi
    print_success "Usuario $DB_USER existe"

    # Verificar password del usuario
    if [ -z "$DB_PASSWORD" ]; then
        print_error "Password requerido (usar --password)"
        exit 1
    fi

    # Probar conexión con el password
    if ! PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "SELECT 1" > /dev/null 2>&1; then
        print_error "Password incorrecto para usuario $DB_USER"
        exit 1
    fi
    print_success "Password verificado"
}

# ============================================================================
# PASO 1: ELIMINAR BASE DE DATOS
# ============================================================================

drop_database() {
    print_step "PASO 1/4: Eliminando base de datos..."

    db_exists=$(query_as_postgres "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")

    if [ -z "$db_exists" ]; then
        print_info "Base de datos '$DB_NAME' no existe, se creará nueva"
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
# PASO 2: CREAR BASE DE DATOS
# ============================================================================

create_database() {
    print_step "PASO 2/4: Creando base de datos..."

    print_info "Creando base de datos $DB_NAME..."
    execute_as_postgres "CREATE DATABASE $DB_NAME OWNER $DB_USER ENCODING 'UTF8';" > /dev/null
    print_success "Base de datos creada"

    execute_as_postgres "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" > /dev/null
    print_success "Privilegios otorgados"
}

# ============================================================================
# PASO 3: EJECUTAR DDL Y SEEDS
# ============================================================================

execute_ddl() {
    print_step "PASO 3/4: Ejecutando DDL..."

    export PGPASSWORD="$DB_PASSWORD"

    # Array de schemas sincronizado con init-database.sh v3.8
    local schemas=(
        "auth"
        "auth_management"
        "gamilit"
        "storage"
        "admin_dashboard"
        "system_configuration"
        "gamification_system"
        "educational_content"
        "content_management"
        "social_features"
        "progress_tracking"
        "audit_logging"
        "communication"
        "lti_integration"
        "notifications"
    )

    # Crear schemas
    print_info "Creando schemas..."
    for schema in "${schemas[@]}"; do
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "CREATE SCHEMA IF NOT EXISTS $schema;" > /dev/null 2>&1
    done
    print_success "15 schemas creados"

    # Crear ENUMs
    print_info "Creando ENUMs..."
    if [ -d "$DDL_DIR/schemas/gamification_system/enums" ]; then
        for enum_file in "$DDL_DIR/schemas/gamification_system/enums"/*.sql; do
            if [ -f "$enum_file" ]; then
                execute_sql_file "$enum_file" > /dev/null 2>&1 || true
            fi
        done
    fi
    print_success "ENUMs creados"

    # Crear tablas
    print_info "Creando tablas..."
    local table_count=0
    for schema in "${schemas[@]}"; do
        local tables_dir="$DDL_DIR/schemas/$schema/tables"
        if [ -d "$tables_dir" ]; then
            for table_file in "$tables_dir"/*.sql; do
                if [ -f "$table_file" ]; then
                    if execute_sql_file "$table_file" > /dev/null 2>&1; then
                        ((table_count++))
                    fi
                fi
            done
        fi
    done
    print_success "$table_count tablas creadas"

    # Otorgar permisos a gamilit_user
    print_info "Otorgando permisos a gamilit_user..."
    local perms_file="$DDL_DIR/99-post-ddl-permissions.sql"
    if [ -f "$perms_file" ]; then
        execute_sql_file "$perms_file" > /dev/null 2>&1
        print_success "Permisos otorgados"
    else
        print_warning "Archivo de permisos no encontrado: $perms_file"
    fi

    unset PGPASSWORD
}

# ============================================================================
# PASO 4: EJECUTAR FUNCIONES (SINCRONIZADO CON init-database.sh v3.8)
# ============================================================================

execute_functions() {
    print_step "PASO 4/8: Ejecutando funciones..."

    export PGPASSWORD="$DB_PASSWORD"

    local function_count=0
    local error_count=0
    local schemas=(
        "gamilit"
        "auth_management"
        "gamification_system"
        "educational_content"
        "content_management"
        "social_features"
        "progress_tracking"
        "audit_logging"
        "communication"
        "lti_integration"
        "notifications"
        "admin_dashboard"
        "system_configuration"
    )

    for schema in "${schemas[@]}"; do
        local functions_dir="$DDL_DIR/schemas/$schema/functions"
        if [ -d "$functions_dir" ]; then
            for function_file in "$functions_dir"/*.sql; do
                if [ -f "$function_file" ]; then
                    if execute_sql_file "$function_file" > /dev/null 2>&1; then
                        function_count=$((function_count + 1))
                    else
                        error_count=$((error_count + 1))
                    fi
                fi
            done
        fi
    done

    if [ $error_count -gt 0 ]; then
        print_warning "$function_count funciones creadas, $error_count con errores"
    else
        print_success "$function_count funciones creadas exitosamente"
    fi

    unset PGPASSWORD
}

# ============================================================================
# PASO 5: EJECUTAR VISTAS (SINCRONIZADO CON init-database.sh v3.8)
# ============================================================================

execute_views() {
    print_step "PASO 5/8: Ejecutando vistas..."

    export PGPASSWORD="$DB_PASSWORD"

    local view_count=0
    local error_count=0
    local schemas=(
        "admin_dashboard"
        "auth"
        "gamification_system"
        "gamilit"
        "progress_tracking"
        "educational_content"
        "social_features"
    )

    for schema in "${schemas[@]}"; do
        local views_dir="$DDL_DIR/schemas/$schema/views"
        if [ -d "$views_dir" ]; then
            for view_file in "$views_dir"/*.sql; do
                if [ -f "$view_file" ]; then
                    if execute_sql_file "$view_file" > /dev/null 2>&1; then
                        view_count=$((view_count + 1))
                    else
                        error_count=$((error_count + 1))
                    fi
                fi
            done
        fi
    done

    if [ $error_count -gt 0 ]; then
        print_warning "$view_count vistas creadas, $error_count con errores"
    else
        print_success "$view_count vistas creadas exitosamente"
    fi

    unset PGPASSWORD
}

# ============================================================================
# PASO 6: EJECUTAR ÍNDICES (SINCRONIZADO CON init-database.sh v3.8)
# ============================================================================

execute_indexes() {
    print_step "PASO 6/8: Ejecutando índices..."

    export PGPASSWORD="$DB_PASSWORD"

    local index_count=0
    local error_count=0
    local schemas=(
        "auth_management"
        "content_management"
        "gamification_system"
        "educational_content"
        "audit_logging"
        "progress_tracking"
        "social_features"
        "system_configuration"
    )

    print_info "Creando índices..."

    for schema in "${schemas[@]}"; do
        local indexes_dir="$DDL_DIR/schemas/$schema/indexes"
        if [ -d "$indexes_dir" ]; then
            for index_file in "$indexes_dir"/*.sql; do
                if [ -f "$index_file" ]; then
                    if execute_sql_file "$index_file" > /dev/null 2>&1; then
                        index_count=$((index_count + 1))
                    else
                        error_count=$((error_count + 1))
                    fi
                fi
            done
        fi
    done

    if [ $error_count -gt 0 ]; then
        print_warning "$index_count índices creados, $error_count con errores"
    else
        print_success "$index_count índices creados exitosamente"
    fi

    unset PGPASSWORD
}

# ============================================================================
# PASO 7: EJECUTAR TRIGGERS (SINCRONIZADO CON init-database.sh v3.8)
# ============================================================================

execute_triggers() {
    print_step "PASO 7/8: Ejecutando triggers..."

    export PGPASSWORD="$DB_PASSWORD"

    local trigger_count=0
    local error_count=0
    local schemas=(
        "auth_management"
        "content_management"
        "educational_content"
        "gamification_system"
        "social_features"
        "progress_tracking"
        "audit_logging"
        "system_configuration"
        "lti_integration"
    )

    for schema in "${schemas[@]}"; do
        local triggers_dir="$DDL_DIR/schemas/$schema/triggers"
        if [ -d "$triggers_dir" ]; then
            for trigger_file in "$triggers_dir"/*.sql; do
                if [ -f "$trigger_file" ]; then
                    if execute_sql_file "$trigger_file" > /dev/null 2>&1; then
                        trigger_count=$((trigger_count + 1))
                    else
                        error_count=$((error_count + 1))
                    fi
                fi
            done
        fi
    done

    if [ $error_count -gt 0 ]; then
        print_warning "$trigger_count triggers creados, $error_count con errores"
    else
        print_success "$trigger_count triggers creados exitosamente"
    fi

    unset PGPASSWORD
}

# ============================================================================
# PASO 8: CARGAR SEEDS
# ============================================================================

load_seeds() {
    print_step "PASO 8/8: Cargando seeds..."

    export PGPASSWORD="$DB_PASSWORD"

    local seeds_base="$SEEDS_DIR/$ENVIRONMENT"
    local loaded=0
    local failed=0

    # ============================================================================
    # SEEDS SINCRONIZADOS CON init-database.sh v3.8 (56 seeds en 10 fases)
    # IMPORTANTE: Este orden es crítico para evitar errores de FK
    # ============================================================================
    local seed_files=(
        # =======================================================================
        # FASE 1: Auth Base (4 seeds)
        # =======================================================================
        "$seeds_base/auth_management/01-tenants.sql"
        "$seeds_base/auth_management/02-auth_providers.sql"
        "$seeds_base/auth/01-demo-users.sql"
        "$seeds_base/auth/02-production-users.sql"

        # =======================================================================
        # FASE 2: Profiles (7 seeds)
        # =======================================================================
        "$seeds_base/auth_management/03-profiles.sql"
        "$seeds_base/auth_management/04-profiles-complete.sql"
        "$seeds_base/auth_management/06-profiles-production.sql"
        "$seeds_base/auth_management/04-user_roles.sql"
        "$seeds_base/auth_management/05-user_preferences.sql"
        "$seeds_base/auth_management/06-auth_attempts.sql"
        "$seeds_base/auth_management/07-security_events.sql"

        # =======================================================================
        # FASE 3: System Configuration & Notifications (6 seeds)
        # =======================================================================
        "$seeds_base/system_configuration/01-system_settings.sql"
        "$seeds_base/system_configuration/01-feature_flags_seeds.sql"
        "$seeds_base/system_configuration/02-feature_flags.sql"
        "$seeds_base/system_configuration/02-gamification_parameters_seeds.sql"
        "$seeds_base/system_configuration/03-notification_settings_global.sql"
        "$seeds_base/notifications/01-notification_templates.sql"

        # =======================================================================
        # FASE 4: Gamification Base (4 seeds)
        # =======================================================================
        "$seeds_base/gamification_system/01-achievement_categories.sql"
        "$seeds_base/gamification_system/02-leaderboard_metadata.sql"
        "$seeds_base/gamification_system/03-maya_ranks.sql"
        "$seeds_base/gamification_system/04-achievements.sql"

        # =======================================================================
        # FASE 5: Gamification Avanzado (9 seeds)
        # =======================================================================
        "$seeds_base/gamification_system/05-user_stats.sql"
        "$seeds_base/gamification_system/06-user_ranks.sql"
        "$seeds_base/gamification_system/07-ml_coins_transactions.sql"
        "$seeds_base/gamification_system/08-user_achievements.sql"
        "$seeds_base/gamification_system/09-comodines_inventory.sql"
        "$seeds_base/gamification_system/10-mission_templates.sql"
        "$seeds_base/gamification_system/12-shop_categories.sql"
        "$seeds_base/gamification_system/13-shop_items.sql"

        # =======================================================================
        # FASE 6: Educational Content (13 seeds)
        # =======================================================================
        "$seeds_base/educational_content/01-modules.sql"
        "$seeds_base/educational_content/02-exercises-module1.sql"
        "$seeds_base/educational_content/03-exercises-module2.sql"
        "$seeds_base/educational_content/04-exercises-module3.sql"
        "$seeds_base/educational_content/05-exercises-module4.sql"
        "$seeds_base/educational_content/06-exercises-module5.sql"
        "$seeds_base/educational_content/07-exercises-auxiliar.sql"
        "$seeds_base/educational_content/07-assessment-rubrics.sql"
        "$seeds_base/educational_content/05-assignments.sql"
        "$seeds_base/educational_content/08-difficulty_criteria.sql"
        "$seeds_base/educational_content/09-exercise_mechanic_mapping.sql"
        "$seeds_base/educational_content/10-exercise_validation_config.sql"
        "$seeds_base/educational_content/11-module_dependencies.sql"
        "$seeds_base/educational_content/12-taxonomies.sql"

        # =======================================================================
        # FASE 7: Content Management (3 seeds)
        # =======================================================================
        "$seeds_base/content_management/01-marie-curie-bio.sql"
        "$seeds_base/content_management/02-media-files.sql"
        "$seeds_base/content_management/03-tags.sql"

        # =======================================================================
        # FASE 8: Social Features (6 seeds) - 00-schools-default PRIMERO (FK)
        # =======================================================================
        "$seeds_base/social_features/00-schools-default.sql"
        "$seeds_base/social_features/01-schools.sql"
        "$seeds_base/social_features/02-classrooms.sql"
        "$seeds_base/social_features/03-classroom-members.sql"
        "$seeds_base/social_features/04-teams.sql"
        "$seeds_base/social_features/04-friendships.sql"
        "$seeds_base/social_features/05-teacher-reports.sql"

        # =======================================================================
        # FASE 9: Progress & Audit (5 seeds)
        # =======================================================================
        "$seeds_base/progress_tracking/01-demo-progress.sql"
        "$seeds_base/progress_tracking/02-exercise-attempts.sql"
        "$seeds_base/progress_tracking/03-manual-reviews.sql"
        "$seeds_base/audit_logging/01-audit-logs.sql"
        "$seeds_base/audit_logging/02-system-metrics.sql"

        # =======================================================================
        # FASE 10: Integraciones (1 seed)
        # =======================================================================
        "$seeds_base/lti_integration/01-lti_consumers.sql"
    )

    for seed_file in "${seed_files[@]}"; do
        if [ -f "$seed_file" ]; then
            local basename_file=$(basename "$seed_file")
            print_info "  $basename_file"

            # CRÍTICO: NO ocultar errores - ejecutar y mostrar salida
            if execute_sql_file "$seed_file" 2>&1 | grep -i "error" > /dev/null; then
                ((failed++))
                print_warning "  ⚠️  Errores en $basename_file (continuando...)"
            else
                ((loaded++))
            fi
        else
            print_warning "Seed no encontrado: $(basename $seed_file)"
        fi
    done

    if [ $failed -gt 0 ]; then
        print_warning "$loaded seeds cargados, $failed con errores"
    else
        print_success "$loaded seeds cargados exitosamente"
    fi

    unset PGPASSWORD
}

# ============================================================================
# POST-SEEDS: FIX PROFILES Y GAMIFICACIÓN
# Sincronizado con init-database.sh v3.8
# ============================================================================

fix_profiles_and_gamification() {
    print_step "Post-seeds: Sincronizando profiles y gamificación..."

    # Transacción 1: Insertar profiles con triggers deshabilitados
    local fix_profiles_sql="
BEGIN;
ALTER TABLE auth_management.profiles DISABLE TRIGGER ALL;

INSERT INTO auth_management.profiles (
    user_id,
    tenant_id,
    email,
    first_name,
    last_name,
    display_name,
    full_name,
    role
)
SELECT
    u.id as user_id,
    (SELECT id FROM auth_management.tenants ORDER BY created_at ASC LIMIT 1) as tenant_id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'firstName', SPLIT_PART(u.email, '@', 1)) as first_name,
    COALESCE(u.raw_user_meta_data->>'lastName', 'Usuario') as last_name,
    SPLIT_PART(u.email, '@', 1) as display_name,
    CONCAT(
        COALESCE(u.raw_user_meta_data->>'firstName', SPLIT_PART(u.email, '@', 1)),
        ' ',
        COALESCE(u.raw_user_meta_data->>'lastName', 'Usuario')
    ) as full_name,
    CASE
        WHEN u.gamilit_role IN ('student', 'admin_teacher', 'super_admin')
        THEN u.gamilit_role
        ELSE 'student'::auth_management.gamilit_role
    END as role
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM auth_management.profiles p WHERE p.user_id = u.id
)
ON CONFLICT (user_id) DO NOTHING;

ALTER TABLE auth_management.profiles ENABLE TRIGGER ALL;
COMMIT;
"

    # Transacción 2: Inicializar user_stats (después de que profiles existan)
    local fix_stats_sql="
BEGIN;
INSERT INTO gamification_system.user_stats (
    user_id,
    tenant_id,
    total_xp,
    level,
    current_rank,
    ml_coins,
    ml_coins_earned_total
)
SELECT
    p.id,
    p.tenant_id,
    0,
    1,
    'Ajaw',
    100,
    100
FROM auth_management.profiles p
WHERE p.role IN ('student', 'admin_teacher', 'super_admin')
  AND NOT EXISTS (
    SELECT 1 FROM gamification_system.user_stats us WHERE us.user_id = p.id
)
ON CONFLICT (user_id) DO NOTHING;
COMMIT;
"

    # Transacción 3: Inicializar user_ranks
    local fix_ranks_sql="
BEGIN;
INSERT INTO gamification_system.user_ranks (
    user_id,
    tenant_id,
    current_rank,
    is_current,
    achieved_at
)
SELECT
    p.id,
    p.tenant_id,
    'Ajaw'::gamification_system.maya_rank,
    true,
    NOW()
FROM auth_management.profiles p
WHERE p.role IN ('student', 'admin_teacher', 'super_admin')
  AND NOT EXISTS (
    SELECT 1 FROM gamification_system.user_ranks ur WHERE ur.user_id = p.id
);
COMMIT;
"

    local fix_sql="$fix_profiles_sql $fix_stats_sql $fix_ranks_sql"

    # Ejecutar como superuser (postgres) para poder deshabilitar triggers del sistema
    if [ "$USE_SUDO" = true ]; then
        if echo "$fix_sql" | sudo -u postgres psql -d "$DB_NAME" > /dev/null 2>&1; then
            local profile_count=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc \
                "SELECT COUNT(*) FROM auth_management.profiles;" 2>/dev/null || echo "0")
            local stats_count=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc \
                "SELECT COUNT(*) FROM gamification_system.user_stats;" 2>/dev/null || echo "0")
            local ranks_count=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc \
                "SELECT COUNT(*) FROM gamification_system.user_ranks WHERE is_current = true;" 2>/dev/null || echo "0")
            print_success "$profile_count profiles, $stats_count user_stats, $ranks_count user_ranks sincronizados"
        else
            print_warning "Error sincronizando profiles (algunos seeds pueden haber fallado)"
        fi
    else
        # Sin sudo, intentar con PGPASSWORD
        if echo "$fix_sql" | PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1; then
            print_success "Profiles y gamificación sincronizados"
        else
            print_warning "No se pudo sincronizar profiles (requiere permisos de superuser)"
        fi
    fi
}

# ============================================================================
# CONFIRMACIÓN
# ============================================================================

confirm_reset() {
    print_header "⚠️  ADVERTENCIA: RESET DE BASE DE DATOS"

    echo -e "${YELLOW}Este script:${NC}"
    echo -e "  • Eliminará la base de datos: ${RED}$DB_NAME${NC}"
    echo -e "  • Mantendrá el usuario: ${GREEN}$DB_USER${NC}"
    echo -e "  • Recreará schemas, tablas y datos"
    echo ""

    if [ "$FORCE_MODE" = false ]; then
        read -p "¿Continuar con el reset? (yes/no): " confirm
        if [ "$confirm" != "yes" ]; then
            print_info "Operación cancelada"
            exit 0
        fi
    fi
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
                DB_PASSWORD="$2"
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
        print_header "GAMILIT Platform - Reset de BD"
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

    # Si no se proveyó password, preguntar
    if [ -z "$DB_PASSWORD" ]; then
        read -sp "Password para usuario $DB_USER: " DB_PASSWORD
        echo ""
    fi

    confirm_reset
    check_prerequisites
    drop_database
    create_database
    execute_ddl
    execute_functions
    execute_views
    execute_indexes
    execute_triggers
    load_seeds
    fix_profiles_and_gamification

    print_header "✅ BASE DE DATOS RESETEADA"

    echo -e "${GREEN}Base de datos recreada exitosamente${NC}"
    echo ""
    echo -e "${CYAN}Conexión:${NC}"
    echo -e "  Database: $DB_NAME"
    echo -e "  User:     $DB_USER"
    echo -e "  Host:     $DB_HOST:$DB_PORT"
    echo ""
    print_success "¡Listo para usar!"
    echo ""
}

main "$@"
