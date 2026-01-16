#!/bin/bash
# ============================================================================
# Script: Carga de Seeds para Ambiente DEV
# Fecha: 2026-01-16
# Task: TASK-2026-01-16-005
# ============================================================================
#
# DESCRIPCION:
#   Este script carga los seeds de desarrollo en el orden correcto,
#   respetando las dependencias entre schemas. Incluye datos de testing
#   y configuraciones extendidas para desarrollo local.
#
# USO:
#   ./load-dev-seeds.sh [DATABASE_URL]
#
# EJEMPLO:
#   ./load-dev-seeds.sh "postgresql://user:password@localhost:5432/gamilit_dev"
#
# DIFERENCIAS CON STAGING:
#   - Incluye _testing seeds
#   - Incluye admin_dashboard seeds
#   - Datos de progress_tracking extendidos
#   - Configuraciones de audit_logging más completas
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
# CONFIGURACION
# ============================================================================

DATABASE_URL="${1:-${DATABASE_URL:-}}"

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}ERROR: DATABASE_URL no está configurada${NC}"
    echo "Uso: $0 <DATABASE_URL>"
    echo "Ejemplo: $0 'postgresql://user:password@localhost:5432/gamilit_dev'"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SEEDS_DIR="$SCRIPT_DIR/dev"
LOG_FILE="$SCRIPT_DIR/load-dev-seeds-$(date +%Y%m%d_%H%M%S).log"

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
        log_warning "Archivo no encontrado (opcional): $file"
        return 0
    fi

    if psql "$DATABASE_URL" -f "$file" >> "$LOG_FILE" 2>&1; then
        log_success "Completado: $(basename $file)"
        return 0
    else
        log_error "Error ejecutando: $file"
        log_error "Ver detalles en: $LOG_FILE"
        return 1
    fi
}

# ============================================================================
# INICIO
# ============================================================================

log "============================================================================"
log "INICIO: Carga de Seeds DEV - GAMILIT"
log "============================================================================"
log "DATABASE_URL: ${DATABASE_URL%%\?*}"
log "SEEDS_DIR: $SEEDS_DIR"
log "LOG_FILE: $LOG_FILE"
log ""

# Verificar conexion
log "Verificando conexion a la base de datos..."
if ! psql "$DATABASE_URL" -c "SELECT version();" >> "$LOG_FILE" 2>&1; then
    log_error "No se pudo conectar a la base de datos"
    exit 1
fi
log_success "Conexion exitosa"
log ""

# ============================================================================
# FASE 1: SYSTEM CONFIGURATION (sin dependencias)
# ============================================================================

log "============================================================================"
log "FASE 1: SYSTEM CONFIGURATION"
log "============================================================================"

execute_sql "$SEEDS_DIR/system_configuration/01-system_settings.sql" "Seeds: system_settings"
execute_sql "$SEEDS_DIR/system_configuration/01-feature_flags_seeds.sql" "Seeds: feature_flags"
execute_sql "$SEEDS_DIR/system_configuration/02-gamification_parameters_seeds.sql" "Seeds: gamification_parameters"
execute_sql "$SEEDS_DIR/system_configuration/03-notification_settings_global.sql" "Seeds: notification_settings_global"
execute_sql "$SEEDS_DIR/system_configuration/04-rate_limits.sql" "Seeds: rate_limits"

log_success "FASE 1 completada"
log ""

# ============================================================================
# FASE 2: AUDIT LOGGING (sin dependencias)
# ============================================================================

log "============================================================================"
log "FASE 2: AUDIT LOGGING"
log "============================================================================"

execute_sql "$SEEDS_DIR/audit_logging/01-default-config.sql" "Seeds: audit_logging default config"
execute_sql "$SEEDS_DIR/audit_logging/01-audit-logs.sql" "Seeds: audit_logs sample"
execute_sql "$SEEDS_DIR/audit_logging/01-activity_log_sample.sql" "Seeds: activity_log sample"
execute_sql "$SEEDS_DIR/audit_logging/02-system-metrics.sql" "Seeds: system-metrics"

log_success "FASE 2 completada"
log ""

# ============================================================================
# FASE 3: AUTH MANAGEMENT (tenants y auth_providers)
# ============================================================================

log "============================================================================"
log "FASE 3: AUTH MANAGEMENT - Base"
log "============================================================================"

execute_sql "$SEEDS_DIR/auth_management/01-tenants.sql" "Seeds: tenants"
execute_sql "$SEEDS_DIR/auth_management/02-tenants-production.sql" "Seeds: tenants (production)"
execute_sql "$SEEDS_DIR/auth_management/02-auth_providers.sql" "Seeds: auth_providers"

log_success "FASE 3 completada"
log ""

# ============================================================================
# FASE 4: AUTH (usuarios demo y produccion)
# ============================================================================

log "============================================================================"
log "FASE 4: AUTH (usuarios)"
log "============================================================================"

execute_sql "$SEEDS_DIR/auth/01-demo-users.sql" "Seeds: demo users"
execute_sql "$SEEDS_DIR/auth/02-production-users.sql" "Seeds: production users"

log_success "FASE 4 completada"
log ""

# ============================================================================
# FASE 5: NOTIFICATIONS (templates)
# ============================================================================

log "============================================================================"
log "FASE 5: NOTIFICATIONS (templates)"
log "============================================================================"

execute_sql "$SEEDS_DIR/notifications/01-notification_templates.sql" "Seeds: notification_templates"

log_success "FASE 5 completada"
log ""

# ============================================================================
# FASE 6: EDUCATIONAL CONTENT (modulos - ANTES de profiles)
# ============================================================================

log "============================================================================"
log "FASE 6: EDUCATIONAL CONTENT - Modulos"
log "============================================================================"

execute_sql "$SEEDS_DIR/educational_content/01-modules.sql" "Seeds: modules"
execute_sql "$SEEDS_DIR/educational_content/11-module_dependencies.sql" "Seeds: module_dependencies"
execute_sql "$SEEDS_DIR/educational_content/12-taxonomies.sql" "Seeds: taxonomies"

log_success "FASE 6 completada"
log ""

# ============================================================================
# FASE 7: AUTH MANAGEMENT (profiles y roles)
# ============================================================================

log "============================================================================"
log "FASE 7: AUTH MANAGEMENT - Profiles"
log "============================================================================"

execute_sql "$SEEDS_DIR/auth_management/03-profiles.sql" "Seeds: profiles (demo)"
execute_sql "$SEEDS_DIR/auth_management/04-profiles-complete.sql" "Seeds: profiles (complete)"
execute_sql "$SEEDS_DIR/auth_management/06-profiles-production.sql" "Seeds: profiles (production)"
execute_sql "$SEEDS_DIR/auth_management/07-profiles-production-additional.sql" "Seeds: profiles (production additional)"
execute_sql "$SEEDS_DIR/auth_management/04-user_roles.sql" "Seeds: user_roles (basic)"
execute_sql "$SEEDS_DIR/auth_management/07-user_roles.sql" "Seeds: user_roles (extended)"
execute_sql "$SEEDS_DIR/auth_management/05-user_preferences.sql" "Seeds: user_preferences"

log_success "FASE 7 completada"
log ""

# ============================================================================
# FASE 8: NOTIFICATIONS (preferences - despues de profiles)
# ============================================================================

log "============================================================================"
log "FASE 8: NOTIFICATIONS (preferences)"
log "============================================================================"

execute_sql "$SEEDS_DIR/notifications/02-notification_preferences_defaults.sql" "Seeds: notification_preferences"
execute_sql "$SEEDS_DIR/notifications/02-user_devices_dev.sql" "Seeds: user_devices (dev)"

log_success "FASE 8 completada"
log ""

# ============================================================================
# FASE 9: CONTENT MANAGEMENT
# ============================================================================

log "============================================================================"
log "FASE 9: CONTENT MANAGEMENT"
log "============================================================================"

execute_sql "$SEEDS_DIR/content_management/01-default-templates.sql" "Seeds: content_templates"
execute_sql "$SEEDS_DIR/content_management/01-marie-curie-bio.sql" "Seeds: marie_curie_bio"
execute_sql "$SEEDS_DIR/content_management/02-marie_curie_content.sql" "Seeds: marie_curie_content"
execute_sql "$SEEDS_DIR/content_management/02-media-files.sql" "Seeds: media_files"
execute_sql "$SEEDS_DIR/content_management/03-tags.sql" "Seeds: tags"
execute_sql "$SEEDS_DIR/content_management/04-moderation_rules.sql" "Seeds: moderation_rules"

log_success "FASE 9 completada"
log ""

# ============================================================================
# FASE 10: SOCIAL FEATURES
# ============================================================================

log "============================================================================"
log "FASE 10: SOCIAL FEATURES"
log "============================================================================"

execute_sql "$SEEDS_DIR/social_features/00-schools-default.sql" "Seeds: schools (default)"
execute_sql "$SEEDS_DIR/social_features/01-schools.sql" "Seeds: schools (demo)"
execute_sql "$SEEDS_DIR/social_features/02-classrooms.sql" "Seeds: classrooms"
execute_sql "$SEEDS_DIR/social_features/03-classroom-members.sql" "Seeds: classroom_members"
execute_sql "$SEEDS_DIR/social_features/04-friendships.sql" "Seeds: friendships"
execute_sql "$SEEDS_DIR/social_features/04-teams.sql" "Seeds: teams"
execute_sql "$SEEDS_DIR/social_features/05-teacher-reports.sql" "Seeds: teacher_reports"

log_success "FASE 10 completada"
log ""

# ============================================================================
# FASE 10.5: AUTH MANAGEMENT (admin schools - despues de social_features)
# ============================================================================

log "============================================================================"
log "FASE 10.5: AUTH MANAGEMENT - Admin Schools"
log "============================================================================"

execute_sql "$SEEDS_DIR/auth_management/08-assign-admin-schools.sql" "Seeds: assign admin schools"

log_success "FASE 10.5 completada"
log ""

# ============================================================================
# FASE 11: COMMUNICATION
# ============================================================================

log "============================================================================"
log "FASE 11: COMMUNICATION"
log "============================================================================"

execute_sql "$SEEDS_DIR/communication/01-system-messages.sql" "Seeds: system messages"
execute_sql "$SEEDS_DIR/communication/02-message_participants.sql" "Seeds: message_participants"

log_success "FASE 11 completada"
log ""

# ============================================================================
# FASE 12: EDUCATIONAL CONTENT (ejercicios y configuracion)
# ============================================================================

log "============================================================================"
log "FASE 12: EDUCATIONAL CONTENT - Ejercicios"
log "============================================================================"

execute_sql "$SEEDS_DIR/educational_content/02-exercises-module1.sql" "Seeds: exercises M1"
execute_sql "$SEEDS_DIR/educational_content/03-exercises-module2.sql" "Seeds: exercises M2"
execute_sql "$SEEDS_DIR/educational_content/04-exercises-module3.sql" "Seeds: exercises M3"
execute_sql "$SEEDS_DIR/educational_content/05-exercises-module4.sql" "Seeds: exercises M4"
execute_sql "$SEEDS_DIR/educational_content/06-exercises-module5.sql" "Seeds: exercises M5"
execute_sql "$SEEDS_DIR/educational_content/05-assignments.sql" "Seeds: assignments"
execute_sql "$SEEDS_DIR/educational_content/07-assessment-rubrics.sql" "Seeds: assessment_rubrics"
execute_sql "$SEEDS_DIR/educational_content/08-difficulty_criteria.sql" "Seeds: difficulty_criteria"
execute_sql "$SEEDS_DIR/educational_content/09-exercise_mechanic_mapping.sql" "Seeds: exercise_mechanic_mapping"
execute_sql "$SEEDS_DIR/educational_content/10-exercise_validation_config.sql" "Seeds: exercise_validation_config"
execute_sql "$SEEDS_DIR/educational_content/11-exercise_validation_config_m4_m5.sql" "Seeds: exercise_validation_config M4-M5"
execute_sql "$SEEDS_DIR/educational_content/13-exercise_type_rubrics.sql" "Seeds: exercise_type_rubrics"

log_success "FASE 12 completada"
log ""

# ============================================================================
# FASE 13: PROGRESS TRACKING (extended para dev)
# ============================================================================

log "============================================================================"
log "FASE 13: PROGRESS TRACKING"
log "============================================================================"

execute_sql "$SEEDS_DIR/progress_tracking/01-module_progress.sql" "Seeds: module_progress"
execute_sql "$SEEDS_DIR/progress_tracking/01-demo-progress.sql" "Seeds: demo_progress"
execute_sql "$SEEDS_DIR/progress_tracking/02-exercise-attempts.sql" "Seeds: exercise_attempts"
execute_sql "$SEEDS_DIR/progress_tracking/03-manual-reviews.sql" "Seeds: manual_reviews"

log_success "FASE 13 completada"
log ""

# ============================================================================
# FASE 14: LTI INTEGRATION
# ============================================================================

log "============================================================================"
log "FASE 14: LTI INTEGRATION"
log "============================================================================"

execute_sql "$SEEDS_DIR/lti_integration/01-lti_consumers.sql" "Seeds: lti_consumers"

log_success "FASE 14 completada"
log ""

# ============================================================================
# FASE 15: GAMIFICATION SYSTEM
# ============================================================================

log "============================================================================"
log "FASE 15: GAMIFICATION SYSTEM"
log "============================================================================"

execute_sql "$SEEDS_DIR/gamification_system/01-achievement_categories.sql" "Seeds: achievement_categories"
execute_sql "$SEEDS_DIR/gamification_system/02-leaderboard_metadata.sql" "Seeds: leaderboard_metadata"
execute_sql "$SEEDS_DIR/gamification_system/03-maya_ranks.sql" "Seeds: maya_ranks"
execute_sql "$SEEDS_DIR/gamification_system/04-achievements.sql" "Seeds: achievements"
execute_sql "$SEEDS_DIR/gamification_system/14-achievements-m3-m5.sql" "Seeds: achievements M3-M5"
execute_sql "$SEEDS_DIR/gamification_system/10-mission_templates.sql" "Seeds: mission_templates"
execute_sql "$SEEDS_DIR/gamification_system/12-shop_categories.sql" "Seeds: shop_categories"
execute_sql "$SEEDS_DIR/gamification_system/13-shop_items.sql" "Seeds: shop_items"
execute_sql "$SEEDS_DIR/gamification_system/05-user_stats.sql" "Seeds: user_stats"
execute_sql "$SEEDS_DIR/gamification_system/06-user_ranks.sql" "Seeds: user_ranks"
execute_sql "$SEEDS_DIR/gamification_system/07-ml_coins_transactions.sql" "Seeds: ml_coins_transactions"
execute_sql "$SEEDS_DIR/gamification_system/08-user_achievements.sql" "Seeds: user_achievements"
execute_sql "$SEEDS_DIR/gamification_system/09-comodines_inventory.sql" "Seeds: comodines_inventory"

log_success "FASE 15 completada"
log ""

# ============================================================================
# FASE 16: ADMIN DASHBOARD (solo en dev)
# ============================================================================

log "============================================================================"
log "FASE 16: ADMIN DASHBOARD"
log "============================================================================"

execute_sql "$SEEDS_DIR/admin_dashboard/01-bulk_operations.sql" "Seeds: bulk_operations"
execute_sql "$SEEDS_DIR/admin_dashboard/02-admin_reports.sql" "Seeds: admin_reports"

log_success "FASE 16 completada"
log ""

# ============================================================================
# FASE 17: AUTH MANAGEMENT - Security Events (para dev)
# ============================================================================

log "============================================================================"
log "FASE 17: AUTH MANAGEMENT - Security"
log "============================================================================"

execute_sql "$SEEDS_DIR/auth_management/06-auth_attempts.sql" "Seeds: auth_attempts"
execute_sql "$SEEDS_DIR/auth_management/07-security_events.sql" "Seeds: security_events"

log_success "FASE 17 completada"
log ""

# ============================================================================
# FASE 18: _TESTING (opcional, solo para ambiente de desarrollo)
# ============================================================================

log "============================================================================"
log "FASE 18: _TESTING (opcional)"
log "============================================================================"

execute_sql "$SEEDS_DIR/_testing/01-test-exercises-validation.sql" "Seeds: test exercises validation"
execute_sql "$SEEDS_DIR/_testing/02-test-nuevos-validadores-DB-117.sql" "Seeds: test validadores DB-117"
execute_sql "$SEEDS_DIR/_testing/10-test-nuevos-validadores-FE-059.sql" "Seeds: test validadores FE-059"
# NOTA: CREAR-USUARIOS-TESTING.sql se ejecuta manualmente si es necesario

log_success "FASE 18 completada"
log ""

# ============================================================================
# RESUMEN FINAL
# ============================================================================

log "============================================================================"
log "RESUMEN FINAL"
log "============================================================================"

SEED_COUNT=$(find "$SEEDS_DIR" -name "*.sql" -not -path "*/_backlog/*" -not -name "*.deprecated" | wc -l)

log ""
log "Seeds cargados: $SEED_COUNT archivos"
log "Fases completadas: 18"
log ""
log_success "============================================================================"
log_success "✅ SEEDS DEV CARGADOS EXITOSAMENTE"
log_success "============================================================================"
log ""
log "Log completo disponible en: $LOG_FILE"
log ""

exit 0
