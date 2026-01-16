#!/bin/bash
# ============================================================================
# Script Maestro: Creación Completa de Base de Datos Gamilit
# Fecha: 2025-11-08
# Versión: 1.1 (2026-01-07)
# ============================================================================
#
# DESCRIPCIÓN:
#   Este script crea la base de datos completa de Gamilit ejecutando todos
#   los archivos DDL en el orden correcto respetando las dependencias.
#
# USO:
#   ./create-database.sh [DATABASE_URL]
#
# EJEMPLO:
#   ./create-database.sh "postgresql://user:password@localhost:5432/gamilit"
#
# VARIABLES DE ENTORNO REQUERIDAS (si no se pasa DATABASE_URL):
#   - DATABASE_URL: URL de conexión a PostgreSQL
#
# CHANGELOG:
#   v1.1 (2026-01-07): CONSOLIDACION BD
#     - Agregados ENUMs para auth_management y system_configuration
#     - Triggers consolidados en 00-batch_updated_at_triggers.sql por schema
#     - Excluye automaticamente directorios _deprecated/
#     - Ver: PLAN-CONSOLIDACION-BD-2026-01-07.md
#
#   v1.0 (2025-11-08): Versión inicial
#
# ============================================================================

set -e  # Exit on error
set -u  # Exit on undefined variable

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# CONFIGURACIÓN
# ============================================================================

# Get database URL from argument or environment
DATABASE_URL="${1:-${DATABASE_URL:-}}"

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}ERROR: DATABASE_URL no está configurada${NC}"
    echo "Uso: $0 <DATABASE_URL>"
    echo "Ejemplo: $0 'postgresql://user:password@localhost:5432/gamilit'"
    exit 1
fi

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DDL_DIR="$SCRIPT_DIR/ddl"

# Log file
LOG_FILE="$SCRIPT_DIR/create-database-$(date +%Y%m%d_%H%M%S).log"

# ============================================================================
# PURGA DE LOGS ANTIGUOS - Mantener solo los últimos 5
# ============================================================================
purge_old_logs() {
    local logs_to_keep=5
    local log_pattern="create-database-*.log"

    # Contar logs existentes
    local log_count=$(find "$SCRIPT_DIR" -maxdepth 1 -name "$log_pattern" -type f 2>/dev/null | wc -l)

    if [ "$log_count" -gt "$logs_to_keep" ]; then
        local logs_to_delete=$((log_count - logs_to_keep))
        echo -e "${YELLOW}[PURGA] Eliminando $logs_to_delete logs antiguos (manteniendo últimos $logs_to_keep)${NC}"

        # Eliminar los más antiguos, mantener los últimos 5
        find "$SCRIPT_DIR" -maxdepth 1 -name "$log_pattern" -type f -printf '%T@ %p\n' 2>/dev/null | \
            sort -n | \
            head -n "$logs_to_delete" | \
            cut -d' ' -f2- | \
            xargs -r rm -f

        echo -e "${GREEN}[PURGA] ✅ Logs antiguos eliminados${NC}"
    fi
}

# Ejecutar purga antes de iniciar
purge_old_logs

# ============================================================================
# FUNCIONES
# ============================================================================

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1${NC}" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1${NC}" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

execute_sql() {
    local file="$1"
    local description="${2:-Executing $file}"

    log "$description"

    if [ ! -f "$file" ]; then
        log_error "Archivo no encontrado: $file"
        return 1
    fi

    if psql "$DATABASE_URL" -f "$file" >> "$LOG_FILE" 2>&1; then
        log_success "Completado: $description"
        return 0
    else
        log_error "Error ejecutando: $file"
        log_error "Ver detalles en: $LOG_FILE"
        return 1
    fi
}

execute_sql_files() {
    local dir="$1"
    local pattern="${2:-*.sql}"
    local description="${3:-Ejecutando archivos en $dir}"

    if [ ! -d "$dir" ]; then
        log_warning "Directorio no encontrado (opcional): $dir"
        return 0
    fi

    local file_count=$(find "$dir" -name "$pattern" -type f 2>/dev/null | wc -l)

    if [ "$file_count" -eq 0 ]; then
        log_warning "No se encontraron archivos en: $dir"
        return 0
    fi

    log "$description ($file_count archivos)"

    find "$dir" -name "$pattern" -type f ! -path "*/_deprecated/*" ! -path "*/tests/*" | sort | while read -r file; do
        local filename=$(basename "$file")
        if ! execute_sql "$file" "  → $filename"; then
            log_error "Fallo al ejecutar: $filename"
            return 1
        fi
    done
}

# ============================================================================
# VALIDACIÓN PRE-EJECUCIÓN
# ============================================================================

log "============================================================================"
log "INICIO: Creación de Base de Datos Gamilit"
log "============================================================================"
log "DATABASE_URL: ${DATABASE_URL%%\?*}"  # Print URL without credentials
log "DDL_DIR: $DDL_DIR"
log "LOG_FILE: $LOG_FILE"
log ""

# Verificar que psql está instalado
if ! command -v psql &> /dev/null; then
    log_error "psql no está instalado. Por favor instala PostgreSQL client."
    exit 1
fi

# Verificar conexión a la base de datos
log "Verificando conexión a la base de datos..."
if ! psql "$DATABASE_URL" -c "SELECT version();" >> "$LOG_FILE" 2>&1; then
    log_error "No se pudo conectar a la base de datos"
    log_error "Verifica DATABASE_URL y que PostgreSQL esté corriendo"
    exit 1
fi
log_success "Conexión exitosa a la base de datos"
log ""

# ============================================================================
# FASE 0: EXTENSIONS (REQUIRED)
# ============================================================================

log "============================================================================"
log "FASE 0: HABILITANDO EXTENSIONES REQUERIDAS"
log "============================================================================"

# Enable pgcrypto extension (required for password hashing in seeds)
psql "$DATABASE_URL" -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;" >> "$LOG_FILE" 2>&1
log_success "pgcrypto extension habilitada"

# Enable uuid-ossp extension (if not already enabled)
psql "$DATABASE_URL" -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";" >> "$LOG_FILE" 2>&1
log_success "uuid-ossp extension habilitada"

log_success "FASE 0 completada - Extensiones habilitadas"
log ""

# ============================================================================
# FASE 1: PREREQUISITES (Schemas y ENUMs)
# ============================================================================

log "============================================================================"
log "FASE 1: PREREQUISITES - Schemas y ENUMs"
log "============================================================================"

execute_sql "$DDL_DIR/00-prerequisites.sql" "Crear schemas y ENUMs base"

log_success "FASE 1 completada"
log ""

# ============================================================================
# FASE 2: FUNCIONES COMPARTIDAS (gamilit schema)
# ============================================================================

log "============================================================================"
log "FASE 2: FUNCIONES COMPARTIDAS (gamilit schema)"
log "============================================================================"

execute_sql_files "$DDL_DIR/schemas/gamilit/functions" "*.sql" "Funciones compartidas"
execute_sql_files "$DDL_DIR/schemas/gamilit/views" "*.sql" "Vistas utilitarias"

log_success "FASE 2 completada"
log ""

# ============================================================================
# FASE 3: AUTH SCHEMA (Supabase Authentication)
# ============================================================================

log "============================================================================"
log "FASE 3: AUTH SCHEMA (Supabase)"
# ============================================================================"

execute_sql_files "$DDL_DIR/schemas/auth/enums" "*.sql" "ENUMs de autenticación"
execute_sql_files "$DDL_DIR/schemas/auth/tables" "*.sql" "Tablas de autenticación"
execute_sql_files "$DDL_DIR/schemas/auth/functions" "*.sql" "Funciones de autenticación"
execute_sql_files "$DDL_DIR/schemas/auth/views" "*.sql" "Vistas de autenticación"

log_success "FASE 3 completada"
log ""

# ============================================================================
# FASE 4: STORAGE SCHEMA (Supabase Storage)
# ============================================================================

log "============================================================================"
log "FASE 4: STORAGE SCHEMA (Supabase)"
log "============================================================================"

execute_sql_files "$DDL_DIR/schemas/storage/enums" "*.sql" "ENUMs de storage"

log_success "FASE 4 completada"
log ""

# ============================================================================
# FASE 5: AUTH_MANAGEMENT SCHEMA
# ============================================================================

log "============================================================================"
log "FASE 5: AUTH_MANAGEMENT SCHEMA"
log "============================================================================"

# FASE 2 CONSOLIDACION (2026-01-07): ENUMs migrados a archivos individuales
execute_sql_files "$DDL_DIR/schemas/auth_management/enums" "*.sql" "ENUMs de auth_management (gamilit_role, user_status, auth_provider)"
execute_sql_files "$DDL_DIR/schemas/auth_management/tables" "*.sql" "Tablas de gestión de usuarios"
execute_sql_files "$DDL_DIR/schemas/auth_management/functions" "*.sql" "Funciones de auth_management"
execute_sql_files "$DDL_DIR/schemas/auth_management/triggers" "*.sql" "Triggers de auth_management"
execute_sql_files "$DDL_DIR/schemas/auth_management/indexes" "*.sql" "Índices de auth_management"
execute_sql_files "$DDL_DIR/schemas/auth_management/rls-policies" "*.sql" "RLS Policies de auth_management"

log_success "FASE 5 completada"
log ""

# ============================================================================
# FASE 6: EDUCATIONAL_CONTENT SCHEMA
# ============================================================================

log "============================================================================"
log "FASE 6: EDUCATIONAL_CONTENT SCHEMA"
log "============================================================================"

execute_sql_files "$DDL_DIR/schemas/educational_content/enums" "*.sql" "ENUMs educativos (si existen)"
execute_sql_files "$DDL_DIR/schemas/educational_content/tables" "*.sql" "Tablas de contenido educativo"
execute_sql_files "$DDL_DIR/schemas/educational_content/functions" "*.sql" "Funciones educativas"
execute_sql_files "$DDL_DIR/schemas/educational_content/views" "*.sql" "Vistas de análisis educativo"
execute_sql_files "$DDL_DIR/schemas/educational_content/triggers" "*.sql" "Triggers educativos"
execute_sql_files "$DDL_DIR/schemas/educational_content/indexes" "*.sql" "Índices educativos"
execute_sql_files "$DDL_DIR/schemas/educational_content/rls-policies" "*.sql" "RLS Policies educativas"

log_success "FASE 6 completada"
log ""

# ============================================================================
# FASE 6.5: NOTIFICATIONS SCHEMA (Debe cargar ANTES de gamification_system)
# ============================================================================
# IMPORTANTE: gamification_system tiene triggers que insertan en
# notifications.notifications, por lo que este schema debe existir primero.
# Movido desde FASE 9.7 por dependencia cruzada (2025-11-28).

log "============================================================================"
log "FASE 6.5: NOTIFICATIONS SCHEMA"
log "============================================================================"

execute_sql_files "$DDL_DIR/schemas/notifications/tables" "*.sql" "Tablas de notificaciones"
execute_sql_files "$DDL_DIR/schemas/notifications/functions" "*.sql" "Funciones de notificaciones"
execute_sql_files "$DDL_DIR/schemas/notifications/triggers" "*.sql" "Triggers de notificaciones (si existen)"
execute_sql_files "$DDL_DIR/schemas/notifications/indexes" "*.sql" "Índices de notificaciones (si existen)"
execute_sql_files "$DDL_DIR/schemas/notifications/rls-policies" "*.sql" "RLS Policies de notificaciones (si existen)"

log_success "FASE 6.5 completada - Notifications schema creado"
log ""

# ============================================================================
# FASE 7: GAMIFICATION_SYSTEM SCHEMA
# ============================================================================

log "============================================================================"
log "FASE 7: GAMIFICATION_SYSTEM SCHEMA"
log "============================================================================"

execute_sql_files "$DDL_DIR/schemas/gamification_system/enums" "*.sql" "ENUMs de gamificación"
execute_sql_files "$DDL_DIR/schemas/gamification_system/tables" "*.sql" "Tablas de gamificación"
execute_sql_files "$DDL_DIR/schemas/gamification_system/functions" "*.sql" "Funciones de gamificación"
execute_sql_files "$DDL_DIR/schemas/gamification_system/triggers" "*.sql" "Triggers de gamificación"
execute_sql_files "$DDL_DIR/schemas/gamification_system/indexes" "*.sql" "Índices de gamificación"
execute_sql_files "$DDL_DIR/schemas/gamification_system/views" "*.sql" "Vistas de gamificación"
execute_sql_files "$DDL_DIR/schemas/gamification_system/materialized-views" "*.sql" "Vistas materializadas"
execute_sql_files "$DDL_DIR/schemas/gamification_system/rls-policies" "*.sql" "RLS Policies de gamificación"

log_success "FASE 7 completada"
log ""

# ============================================================================
# FASE 8: PROGRESS_TRACKING SCHEMA
# ============================================================================

log "============================================================================"
log "FASE 8: PROGRESS_TRACKING SCHEMA"
log "============================================================================"

execute_sql_files "$DDL_DIR/schemas/progress_tracking/enums" "*.sql" "ENUMs de progreso"
execute_sql_files "$DDL_DIR/schemas/progress_tracking/tables" "*.sql" "Tablas de progreso"
execute_sql_files "$DDL_DIR/schemas/progress_tracking/functions" "*.sql" "Funciones de progreso"
execute_sql_files "$DDL_DIR/schemas/progress_tracking/triggers" "*.sql" "Triggers de progreso"
execute_sql_files "$DDL_DIR/schemas/progress_tracking/indexes" "*.sql" "Índices de progreso"
# CORR-009: Solo vistas que NO dependen de social_features (02-teacher_pending_reviews.sql se ejecuta en FASE 9.6)
execute_sql_files "$DDL_DIR/schemas/progress_tracking/views" "user_progress_summary.sql" "Vistas de progreso (sin dependencias cross-schema)"
execute_sql_files "$DDL_DIR/schemas/progress_tracking/rls-policies" "*.sql" "RLS Policies de progreso"

log_success "FASE 8 completada"
log ""

# ============================================================================
# FASE 9: SOCIAL_FEATURES SCHEMA
# ============================================================================

log "============================================================================"
log "FASE 9: SOCIAL_FEATURES SCHEMA"
log "============================================================================"

execute_sql_files "$DDL_DIR/schemas/social_features/enums" "*.sql" "ENUMs sociales"
execute_sql_files "$DDL_DIR/schemas/social_features/tables" "*.sql" "Tablas sociales"
execute_sql_files "$DDL_DIR/schemas/social_features/functions" "*.sql" "Funciones sociales"
execute_sql_files "$DDL_DIR/schemas/social_features/triggers" "*.sql" "Triggers sociales"
execute_sql_files "$DDL_DIR/schemas/social_features/indexes" "*.sql" "Índices sociales (Teacher Portal)"
execute_sql_files "$DDL_DIR/schemas/social_features/views" "*.sql" "Vistas sociales (Teacher Portal)"
execute_sql_files "$DDL_DIR/schemas/social_features/rls-policies" "*.sql" "RLS Policies sociales"

log_success "FASE 9 completada"
log ""

# ============================================================================
# FASE 9.5: FK CONSTRAINTS DIFERIDOS (Resolución de dependencias circulares)
# ============================================================================

log "============================================================================"
log "FASE 9.5: FK CONSTRAINTS DIFERIDOS"
log "============================================================================"

execute_sql_files "$DDL_DIR/schemas/auth_management/fk-constraints" "*.sql" "FK constraints diferidos auth_management"

log_success "FASE 9.5 completada - Dependencias circulares resueltas"
log ""

# ============================================================================
# FASE 9.6: VISTAS CROSS-SCHEMA (Dependen de social_features)
# ============================================================================
# CORR-009: Vistas que dependen de tablas en múltiples schemas
# Estas vistas deben crearse después de que social_features esté disponible

log "============================================================================"
log "FASE 9.6: VISTAS CROSS-SCHEMA (CORR-009)"
log "============================================================================"

# Vista teacher_pending_reviews depende de:
# - progress_tracking.exercise_submissions
# - auth_management.profiles
# - educational_content.exercises
# - educational_content.modules
# - social_features.classroom_members (creado en FASE 9)
# - social_features.classrooms (creado en FASE 9)
execute_sql_files "$DDL_DIR/schemas/progress_tracking/views" "02-teacher_pending_reviews.sql" "Vista teacher_pending_reviews (cross-schema)"

log_success "FASE 9.6 completada - Vistas cross-schema creadas"
log ""

# NOTA: FASE 9.7 (notifications) movida a FASE 6.5 por dependencia con gamification triggers

# ============================================================================
# FASE 10: CONTENT_MANAGEMENT SCHEMA
# ============================================================================

log "============================================================================"
log "FASE 10: CONTENT_MANAGEMENT SCHEMA"
log "============================================================================"

execute_sql_files "$DDL_DIR/schemas/content_management/enums" "*.sql" "ENUMs de gestión de contenido"
execute_sql_files "$DDL_DIR/schemas/content_management/tables" "*.sql" "Tablas de gestión de contenido"
execute_sql_files "$DDL_DIR/schemas/content_management/functions" "*.sql" "Funciones de moderación de contenido"
execute_sql_files "$DDL_DIR/schemas/content_management/triggers" "*.sql" "Triggers de content_management"
execute_sql_files "$DDL_DIR/schemas/content_management/indexes" "*.sql" "Índices de content_management"
execute_sql_files "$DDL_DIR/schemas/content_management/rls-policies" "*.sql" "RLS Policies de content_management"

log_success "FASE 10 completada"
log ""

# ============================================================================
# FASE 10.5: COMMUNICATION SCHEMA (Sistema de Mensajería)
# ============================================================================

log "============================================================================"
log "FASE 10.5: COMMUNICATION SCHEMA (DB-122)"
log "============================================================================"

execute_sql "$DDL_DIR/schemas/communication/00-schema.sql" "Schema communication"
execute_sql_files "$DDL_DIR/schemas/communication/tables" "*.sql" "Tablas de comunicación"
execute_sql_files "$DDL_DIR/schemas/communication/functions" "*.sql" "Funciones de comunicación (si existen)"
execute_sql_files "$DDL_DIR/schemas/communication/triggers" "*.sql" "Triggers de comunicación (si existen)"
execute_sql_files "$DDL_DIR/schemas/communication/indexes" "*.sql" "Índices de comunicación (si existen)"
execute_sql_files "$DDL_DIR/schemas/communication/views" "*.sql" "Vistas de comunicación (si existen)"
execute_sql_files "$DDL_DIR/schemas/communication/rls-policies" "*.sql" "RLS Policies de comunicación (P0-002 AUDIT-DB-001)"

log_success "FASE 10.5 completada - Communication schema creado (DB-122)"
log ""

# ============================================================================
# FASE 11: AUDIT_LOGGING SCHEMA
# ============================================================================

log "============================================================================"
log "FASE 11: AUDIT_LOGGING SCHEMA"
log "============================================================================"

execute_sql_files "$DDL_DIR/schemas/audit_logging/enums" "*.sql" "ENUMs de auditoría"
execute_sql_files "$DDL_DIR/schemas/audit_logging/tables" "*.sql" "Tablas de auditoría"
execute_sql_files "$DDL_DIR/schemas/audit_logging/functions" "*.sql" "Funciones de auditoría"
execute_sql_files "$DDL_DIR/schemas/audit_logging/triggers" "*.sql" "Triggers de auditoría"
execute_sql_files "$DDL_DIR/schemas/audit_logging/indexes" "*.sql" "Índices de auditoría"
execute_sql_files "$DDL_DIR/schemas/audit_logging/rls-policies" "*.sql" "RLS Policies de auditoría"

log_success "FASE 11 completada"
log ""

# ============================================================================
# FASE 12: SYSTEM_CONFIGURATION SCHEMA
# ============================================================================

log "============================================================================"
log "FASE 12: SYSTEM_CONFIGURATION SCHEMA"
log "============================================================================"

# FASE 2 CONSOLIDACION (2026-01-07): ENUMs migrados a archivos individuales
execute_sql_files "$DDL_DIR/schemas/system_configuration/enums" "*.sql" "ENUMs de system_configuration (setting_type)"
execute_sql_files "$DDL_DIR/schemas/system_configuration/tables" "*.sql" "Tablas de configuración"
execute_sql_files "$DDL_DIR/schemas/system_configuration/functions" "*.sql" "Funciones de configuración (feature flags)"
execute_sql_files "$DDL_DIR/schemas/system_configuration/triggers" "*.sql" "Triggers de configuración"
execute_sql_files "$DDL_DIR/schemas/system_configuration/rls-policies" "*.sql" "RLS Policies de configuración"

log_success "FASE 12 completada"
log ""

# ============================================================================
# FASE 13: ADMIN_DASHBOARD SCHEMA (OPCIONAL)
# ============================================================================

log "============================================================================"
log "FASE 13: ADMIN_DASHBOARD SCHEMA (OPCIONAL)"
log "============================================================================"

execute_sql_files "$DDL_DIR/schemas/admin_dashboard/tables" "*.sql" "Tablas de dashboard administrativo"
execute_sql_files "$DDL_DIR/schemas/admin_dashboard/functions" "*.sql" "Funciones de dashboard administrativo"
execute_sql_files "$DDL_DIR/schemas/admin_dashboard/views" "*.sql" "Vistas de dashboard administrativo"

log_success "FASE 13 completada"
log ""

# ============================================================================
# FASE 14: LTI_INTEGRATION SCHEMA (Learning Tools Interoperability)
# ============================================================================

log "============================================================================"
log "FASE 14: LTI_INTEGRATION SCHEMA"
log "============================================================================"

execute_sql_files "$DDL_DIR/schemas/lti_integration/tables" "*.sql" "Tablas de LTI"
execute_sql_files "$DDL_DIR/schemas/lti_integration/functions" "*.sql" "Funciones de LTI"
execute_sql_files "$DDL_DIR/schemas/lti_integration/triggers" "*.sql" "Triggers de LTI"

log_success "FASE 14 completada"
log ""

# ============================================================================
# FASE 15: PUBLIC SCHEMA (OPCIONAL - Legacy)
# ============================================================================

log "============================================================================"
log "FASE 15: PUBLIC SCHEMA (OPCIONAL - Legacy)"
log "============================================================================"

log_warning "Saltando public schema - objetos legacy no necesarios para BD nueva"
# execute_sql_files "$DDL_DIR/schemas/public/tables" "*.sql" "Tablas públicas (si existen)"

log ""

# ============================================================================
# FASE 15.5: POST-DDL PERMISSIONS Y CONFIGURACIÓN
# ============================================================================

log "============================================================================"
log "FASE 15.5: POST-DDL PERMISSIONS Y CONFIGURACIÓN"
log "============================================================================"

execute_sql "$DDL_DIR/99-post-ddl-permissions.sql" "Permisos finales y configuración post-DDL"

log_success "FASE 15.5 completada"
log ""

# ============================================================================
# FASE 16: SEED DATA - Carga de Datos Iniciales (PROD)
# ============================================================================

log "============================================================================"
log "FASE 16: SEED DATA - Carga de Datos Iniciales (PROD)"
log "============================================================================"

SEEDS_DIR="$SCRIPT_DIR/seeds/prod"

# Orden correcto respetando dependencias:

# 16.0: Audit Logging (sin dependencias)
execute_sql "$SEEDS_DIR/audit_logging/01-default-config.sql" "Seeds: audit_logging default config"

# 16.1: System Configuration (sin dependencias)
execute_sql "$SEEDS_DIR/system_configuration/01-system_settings.sql" "Seeds: system_settings"
execute_sql "$SEEDS_DIR/system_configuration/01-feature_flags_seeds.sql" "Seeds: feature_flags (26 flags - DB-122)"
execute_sql "$SEEDS_DIR/system_configuration/02-gamification_parameters_seeds.sql" "Seeds: gamification_parameters (37 params - DB-122)"
execute_sql "$SEEDS_DIR/system_configuration/03-notification_settings_global.sql" "Seeds: notification_settings_global"
execute_sql "$SEEDS_DIR/system_configuration/04-rate_limits.sql" "Seeds: rate_limits"

# 16.1.1: Notifications (templates solamente - EXT-003)
# NOTA: notification_preferences se carga después de profiles (ver 16.5.0.2)
execute_sql "$SEEDS_DIR/notifications/01-notification_templates.sql" "Seeds: notification_templates (18 templates - EXT-003, GAP-MED-004)"

# 16.2: Auth Management (tenants y auth_providers)
execute_sql "$SEEDS_DIR/auth_management/01-tenants.sql" "Seeds: tenants"
execute_sql "$SEEDS_DIR/auth_management/02-tenants-production.sql" "Seeds: tenants-production (13 tenants usuarios reales)"
execute_sql "$SEEDS_DIR/auth_management/02-auth_providers.sql" "Seeds: auth_providers"

# 16.3: Auth (usuarios de testing y demo)
execute_sql "$SEEDS_DIR/auth/01-demo-users.sql" "Seeds: users (testing)"
execute_sql "$SEEDS_DIR/auth/02-production-users.sql" "Seeds: users (production - 13 usuarios)"

# 16.4: Educational Content (módulos) - MUST BE LOADED BEFORE PROFILES
# REASON: initialize_user_stats() trigger needs modules to exist when creating module_progress
execute_sql "$SEEDS_DIR/educational_content/01-modules.sql" "Seeds: modules (5)"

# 16.4.1: Educational Content (dependencias y taxonomías) - P0-SEEDS AUDIT-DB-001
execute_sql "$SEEDS_DIR/educational_content/11-module_dependencies.sql" "Seeds: module_dependencies (6 dependencias - P0 AUDIT-DB-001)"
execute_sql "$SEEDS_DIR/educational_content/12-taxonomies.sql" "Seeds: taxonomies (4 taxonomías - P0 AUDIT-DB-001)"

# 16.5: Auth Management (profiles para usuarios)
# NOTE: Trigger initialize_user_stats() fires here and creates module_progress automatically
execute_sql "$SEEDS_DIR/auth_management/04-profiles-complete.sql" "Seeds: profiles (testing + demo - 22)"
# DEPRECATED: 05-profiles-demo.sql movido a _deprecated/ - requiere auth.users que no existen
execute_sql "$SEEDS_DIR/auth_management/06-profiles-production.sql" "Seeds: profiles (production - 13 usuarios)"
execute_sql "$SEEDS_DIR/auth_management/07-profiles-production-additional.sql" "Seeds: profiles (production adicionales - 32 usuarios)"

# 16.5.0.1: Auth Management (roles de usuarios) - P0-SEEDS AUDIT-DB-001
# MUST BE AFTER profiles (FK user_id references profiles)
execute_sql "$SEEDS_DIR/auth_management/07-user_roles.sql" "Seeds: user_roles (8 roles - P0 AUDIT-DB-001)"

# 16.5.0.2: Notifications (preferencias de usuarios) - EXT-003 2026-01-04
# MUST BE AFTER profiles (FK user_id references profiles)
execute_sql "$SEEDS_DIR/notifications/02-notification_preferences_defaults.sql" "Seeds: notification_preferences (defaults por tipo - EXT-003)"

# 16.5.1: Content Management (templates de contenido)
execute_sql "$SEEDS_DIR/content_management/01-default-templates.sql" "Seeds: content_templates"

# 16.5.1.1: Content Management (contenido Marie Curie) - P0-SEEDS AUDIT-DB-001
execute_sql "$SEEDS_DIR/content_management/02-marie_curie_content.sql" "Seeds: marie_curie_content (6 artículos - P0 AUDIT-DB-001)"

# 16.5.1.2: Content Management (tags y moderación) - AUDITORIA 2026-01-04
execute_sql "$SEEDS_DIR/content_management/03-tags.sql" "Seeds: tags (catálogo Marie Curie - 45 tags)"
execute_sql "$SEEDS_DIR/content_management/04-moderation_rules.sql" "Seeds: moderation_rules"

# 16.5.2: Social Features (escuelas, aulas y miembros)
execute_sql "$SEEDS_DIR/social_features/00-schools-default.sql" "Seeds: schools (sistema - default)"
execute_sql "$SEEDS_DIR/social_features/01-schools.sql" "Seeds: schools (demo)"
execute_sql "$SEEDS_DIR/social_features/02-classrooms.sql" "Seeds: classrooms (demo)"
execute_sql "$SEEDS_DIR/social_features/03-classroom-members.sql" "Seeds: classroom_members (demo)"
execute_sql "$SEEDS_DIR/social_features/04-friendships.sql" "Seeds: friendships (10 amistades + 3 pending)"
execute_sql "$SEEDS_DIR/social_features/04-teams.sql" "Seeds: teams (equipos colaborativos - 2026-01-14)"
execute_sql "$SEEDS_DIR/social_features/05-teacher-reports.sql" "Seeds: teacher_reports (reportes docentes - 2026-01-14)"

# 16.5.2.1: Communication (mensajes de sistema) - AUDITORIA 2026-01-04
# Depende de: auth_management.profiles, social_features.classrooms
execute_sql "$SEEDS_DIR/communication/01-system-messages.sql" "Seeds: system messages (bienvenida classroom DEFAULT)"
execute_sql "$SEEDS_DIR/communication/02-message_participants.sql" "Seeds: message participants (ISS-SYNC-002)"

# 16.5.3: Auth Management (asignación de escuela a admins) - 2025-12-15
# MUST BE AFTER profiles AND schools
execute_sql "$SEEDS_DIR/auth_management/08-assign-admin-schools.sql" "Seeds: assign admin schools (2025-12-15)"

# 16.6: Educational Content (ejercicios)
execute_sql "$SEEDS_DIR/educational_content/02-exercises-module1.sql" "Seeds: Module 1 - Literal (5 exercises)"
execute_sql "$SEEDS_DIR/educational_content/03-exercises-module2.sql" "Seeds: Module 2 - Inferencial (5 exercises)"
execute_sql "$SEEDS_DIR/educational_content/04-exercises-module3.sql" "Seeds: Module 3 - Crítica (5 exercises)"
execute_sql "$SEEDS_DIR/educational_content/05-assignments.sql" "Seeds: assignments (9 demo for Teacher Portal - CORR-006)"
execute_sql "$SEEDS_DIR/educational_content/05-exercises-module4.sql" "Seeds: Module 4 - Digital (5 exercises)"
execute_sql "$SEEDS_DIR/educational_content/06-exercises-module5.sql" "Seeds: Module 5 - Producción (3 exercises)"
execute_sql "$SEEDS_DIR/educational_content/07-assessment-rubrics.sql" "Seeds: assessment_rubrics"
execute_sql "$SEEDS_DIR/educational_content/08-difficulty_criteria.sql" "Seeds: difficulty_criteria"
execute_sql "$SEEDS_DIR/educational_content/09-exercise_mechanic_mapping.sql" "Seeds: exercise_mechanic_mapping"
execute_sql "$SEEDS_DIR/educational_content/10-exercise_validation_config.sql" "Seeds: exercise_validation_config (15 configs)"
execute_sql "$SEEDS_DIR/educational_content/11-exercise_validation_config_m4_m5.sql" "Seeds: exercise_validation_config M4-M5 (8 configs - 2026-01-14)"
execute_sql "$SEEDS_DIR/educational_content/13-exercise_type_rubrics.sql" "Seeds: exercise_type_rubrics (12 rubricas M3-M5 - CORR-009)"

# NOTA: Modelo JSONB puro - Seeds legacy movidos a _deprecated/
# Total: 23 ejercicios production-ready (módulos 1-5)
# Total seeds PROD: 38 archivos (actualizado DB-122: +63 registros feature_flags & gamification_parameters)

# 16.7: Progress Tracking (progreso inicial de módulos)
# NOTE: This seed is now REDUNDANT since initialize_user_stats() trigger creates module_progress automatically
# KEPT for safety: ON CONFLICT DO NOTHING makes it a no-op if records already exist
execute_sql "$SEEDS_DIR/progress_tracking/01-module_progress.sql" "Seeds: module_progress (backup/fallback)"

# 16.5.2: LTI Integration (consumidores LTI)
execute_sql "$SEEDS_DIR/lti_integration/01-lti_consumers.sql" "Seeds: lti_consumers"

# 16.6: Gamification System
execute_sql "$SEEDS_DIR/gamification_system/01-achievement_categories.sql" "Seeds: achievement_categories"
execute_sql "$SEEDS_DIR/gamification_system/02-leaderboard_metadata.sql" "Seeds: leaderboard_metadata"
execute_sql "$SEEDS_DIR/gamification_system/03-maya_ranks.sql" "Seeds: maya_ranks"
execute_sql "$SEEDS_DIR/gamification_system/04-achievements.sql" "Seeds: achievements (30 logros demo - 2025-11-29 updated)"
execute_sql "$SEEDS_DIR/gamification_system/14-achievements-m3-m5.sql" "Seeds: achievements M3-M5 (15 logros modulos 3,4,5 - CORR-009)"

# 16.6.0.1: Mission Templates - P0-SEEDS AUDIT-DB-001
execute_sql "$SEEDS_DIR/gamification_system/10-mission_templates.sql" "Seeds: mission_templates (11 templates - P0 AUDIT-DB-001)"
# NOTA: Archivo no disponible - comentado 2026-01-04
# execute_sql "$SEEDS_DIR/gamification_system/11-missions-production-users.sql" "Seeds: missions-production (8 misiones por usuario prod)"
execute_sql "$SEEDS_DIR/gamification_system/12-shop_categories.sql" "Seeds: shop_categories (5 categorías - 2025-11-29 NEW)"
execute_sql "$SEEDS_DIR/gamification_system/13-shop_items.sql" "Seeds: shop_items (20 items - 2025-11-29 NEW)"
execute_sql "$SEEDS_DIR/gamification_system/05-user_stats.sql" "Seeds: user_stats"
execute_sql "$SEEDS_DIR/gamification_system/06-user_ranks.sql" "Seeds: user_ranks"
execute_sql "$SEEDS_DIR/gamification_system/07-ml_coins_transactions.sql" "Seeds: ml_coins_transactions"
execute_sql "$SEEDS_DIR/gamification_system/08-user_achievements.sql" "Seeds: user_achievements"
execute_sql "$SEEDS_DIR/gamification_system/09-comodines_inventory.sql" "Seeds: comodines_inventory"
# DEPRECADO 2025-11-24: Misiones ahora se crean automáticamente via gamilit.initialize_user_missions()
# execute_sql "$SEEDS_DIR/gamification_system/10-missions-init.sql" "Seeds: missions initialization (student)"

# 16.8: Admin Dashboard - AUDIT-003 (2026-01-04)
execute_sql "$SEEDS_DIR/admin_dashboard/01-bulk_operations.sql" "Seeds: bulk_operations (3 ejemplos - AUDIT-003)"
execute_sql "$SEEDS_DIR/admin_dashboard/02-admin_reports.sql" "Seeds: admin_reports (4 ejemplos - AUDIT-003)"

log_success "FASE 16 completada - Seeds de PROD cargados"
log ""

# ============================================================================
# FASE 17: VALIDACIONES POST-SEEDS
# ============================================================================
# Esta fase asegura que los datos de inicialización estén completos.
# Si el trigger trg_initialize_user_stats falló silenciosamente, aquí se corrige.
# ============================================================================

log "FASE 17: VALIDACIONES POST-SEEDS"
log ""

# 17.1: Validar y crear module_progress faltantes
# El trigger debería haber creado estos registros, pero si falló, este script los crea
execute_sql "$SCRIPT_DIR/scripts/fix-missing-module-progress.sql" "Validation: module_progress (ensure all users have records)"

log_success "FASE 17 completada - Validaciones ejecutadas"
log ""

# ============================================================================
# RESUMEN FINAL
# ============================================================================

log "============================================================================"
log "RESUMEN FINAL"
log "============================================================================"

# Contar objetos creados
log "Contando objetos creados..."

SCHEMA_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.schemata WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast');" 2>/dev/null || echo "0")
TABLE_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog', 'information_schema');" 2>/dev/null || echo "0")
ENUM_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM pg_type WHERE typcategory = 'E';" 2>/dev/null || echo "0")
FUNCTION_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM pg_proc WHERE pronamespace IN (SELECT oid FROM pg_namespace WHERE nspname NOT IN ('pg_catalog', 'information_schema'));" 2>/dev/null || echo "0")
TRIGGER_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema NOT IN ('pg_catalog', 'information_schema');" 2>/dev/null || echo "0")

log ""
log "Objetos creados:"
log "  - Schemas: $SCHEMA_COUNT"
log "  - Tablas: $TABLE_COUNT"
log "  - ENUMs: $ENUM_COUNT"
log "  - Funciones: $FUNCTION_COUNT"
log "  - Triggers: $TRIGGER_COUNT"
log ""

log_success "============================================================================"
log_success "✅ BASE DE DATOS CREADA EXITOSAMENTE"
log_success "============================================================================"
log ""
log "Log completo disponible en: $LOG_FILE"
log ""

exit 0
