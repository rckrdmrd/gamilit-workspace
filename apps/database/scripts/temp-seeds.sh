#!/bin/bash
cd /mnt/c/Empresas/ISEM/gamilit-workspace/apps/database
DB_NAME="gamilit_platform"
DB_USER="gamilit_user"
DB_PASSWORD="${DB_PASSWORD:-${GAMILIT_DB_PASSWORD:-}}"
DB_HOST="localhost"
DB_PORT="5432"
SUDO_PASS="${GAMILIT_SUDO_PASSWORD:-}"
SEEDS_DIR="./seeds/dev"

if [ -z "$DB_PASSWORD" ]; then
    echo "ERROR: define DB_PASSWORD o GAMILIT_DB_PASSWORD"
    exit 1
fi

export PGPASSWORD="$DB_PASSWORD"

exec_seed() {
    local file="$1"
    if [ -f "$file" ]; then
        if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$file" 2>&1 | grep -qi "error"; then
            echo "  WARN: $(basename $file)"
            return 1
        else
            return 0
        fi
    fi
    return 1
}

echo "=== CARGANDO SEEDS (dev) ==="
loaded=0
failed=0
skipped=0

seed_files=(
    # FASE 1: Auth Base
    "$SEEDS_DIR/auth_management/01-tenants.sql"
    "$SEEDS_DIR/auth_management/02-auth_providers.sql"
    "$SEEDS_DIR/auth/01-demo-users.sql"
    "$SEEDS_DIR/auth/02-production-users.sql"

    # FASE 2: Profiles
    "$SEEDS_DIR/auth_management/03-profiles.sql"
    "$SEEDS_DIR/auth_management/04-profiles-complete.sql"
    "$SEEDS_DIR/auth_management/06-profiles-production.sql"
    "$SEEDS_DIR/auth_management/04-user_roles.sql"
    "$SEEDS_DIR/auth_management/05-user_preferences.sql"
    "$SEEDS_DIR/auth_management/06-auth_attempts.sql"
    "$SEEDS_DIR/auth_management/07-security_events.sql"

    # FASE 2.1: Notification Preferences
    "$SEEDS_DIR/notifications/02-notification_preferences_defaults.sql"
    "$SEEDS_DIR/notifications/02-user_devices_dev.sql"

    # FASE 3: System Configuration
    "$SEEDS_DIR/system_configuration/01-system_settings.sql"
    "$SEEDS_DIR/system_configuration/01-feature_flags_seeds.sql"
    "$SEEDS_DIR/system_configuration/02-feature_flags.sql"
    "$SEEDS_DIR/system_configuration/02-gamification_parameters_seeds.sql"
    "$SEEDS_DIR/system_configuration/03-notification_settings_global.sql"
    "$SEEDS_DIR/system_configuration/04-rate_limits.sql"
    "$SEEDS_DIR/notifications/01-notification_templates.sql"

    # FASE 4: Gamification Base
    "$SEEDS_DIR/gamification_system/01-achievement_categories.sql"
    "$SEEDS_DIR/gamification_system/02-leaderboard_metadata.sql"
    "$SEEDS_DIR/gamification_system/03-maya_ranks.sql"
    "$SEEDS_DIR/gamification_system/04-achievements.sql"

    # FASE 5: Gamification Avanzado
    "$SEEDS_DIR/gamification_system/05-user_stats.sql"
    "$SEEDS_DIR/gamification_system/06-user_ranks.sql"
    "$SEEDS_DIR/gamification_system/07-ml_coins_transactions.sql"
    "$SEEDS_DIR/gamification_system/08-user_achievements.sql"
    "$SEEDS_DIR/gamification_system/09-comodines_inventory.sql"
    "$SEEDS_DIR/gamification_system/10-mission_templates.sql"
    "$SEEDS_DIR/gamification_system/12-shop_categories.sql"
    "$SEEDS_DIR/gamification_system/13-shop_items.sql"

    # FASE 6: Educational Content
    "$SEEDS_DIR/educational_content/01-modules.sql"
    "$SEEDS_DIR/educational_content/02-exercises-module1.sql"
    "$SEEDS_DIR/educational_content/03-exercises-module2.sql"
    "$SEEDS_DIR/educational_content/04-exercises-module3.sql"
    "$SEEDS_DIR/educational_content/05-exercises-module4.sql"
    "$SEEDS_DIR/educational_content/06-exercises-module5.sql"
    "$SEEDS_DIR/educational_content/07-assessment-rubrics.sql"
    "$SEEDS_DIR/educational_content/05-assignments.sql"
    "$SEEDS_DIR/educational_content/08-difficulty_criteria.sql"
    "$SEEDS_DIR/educational_content/09-exercise_mechanic_mapping.sql"
    "$SEEDS_DIR/educational_content/10-exercise_validation_config.sql"
    "$SEEDS_DIR/educational_content/11-module_dependencies.sql"
    "$SEEDS_DIR/educational_content/12-taxonomies.sql"

    # FASE 7: Content Management
    "$SEEDS_DIR/content_management/01-marie-curie-bio.sql"
    "$SEEDS_DIR/content_management/02-media-files.sql"
    "$SEEDS_DIR/content_management/03-tags.sql"

    # FASE 8: Social Features
    "$SEEDS_DIR/social_features/00-schools-default.sql"
    "$SEEDS_DIR/social_features/01-schools.sql"
    "$SEEDS_DIR/social_features/02-classrooms.sql"
    "$SEEDS_DIR/social_features/03-classroom-members.sql"
    "$SEEDS_DIR/social_features/04-teams.sql"
    "$SEEDS_DIR/social_features/04-friendships.sql"
    "$SEEDS_DIR/social_features/05-teacher-reports.sql"

    # FASE 9: Progress & Audit
    "$SEEDS_DIR/progress_tracking/01-demo-progress.sql"
    "$SEEDS_DIR/progress_tracking/02-exercise-attempts.sql"
    "$SEEDS_DIR/progress_tracking/03-manual-reviews.sql"
    "$SEEDS_DIR/audit_logging/01-audit-logs.sql"
    "$SEEDS_DIR/audit_logging/02-system-metrics.sql"

    # FASE 10: Integraciones
    "$SEEDS_DIR/lti_integration/01-lti_consumers.sql"

    # FASE 11: Admin Dashboard
    "$SEEDS_DIR/admin_dashboard/01-bulk_operations.sql"
    "$SEEDS_DIR/admin_dashboard/02-admin_reports.sql"

    # FASE 12: Communication
    "$SEEDS_DIR/communication/01-system-messages.sql"
    "$SEEDS_DIR/communication/02-message_participants.sql"
)

for seed in "${seed_files[@]}"; do
    if [ -f "$seed" ]; then
        if exec_seed "$seed" > /dev/null 2>&1; then
            loaded=$((loaded + 1))
        else
            failed=$((failed + 1))
        fi
    else
        skipped=$((skipped + 1))
    fi
done

echo "Seeds: $loaded OK, $failed errores, $skipped no encontrados"

echo ""
echo "=== POST-SEEDS: Sincronizar profiles y gamificacion ==="
fix_sql="
BEGIN;
ALTER TABLE auth_management.profiles DISABLE TRIGGER ALL;
INSERT INTO auth_management.profiles (user_id, tenant_id, email, first_name, last_name, display_name, full_name, role)
SELECT u.id, (SELECT id FROM auth_management.tenants ORDER BY created_at ASC LIMIT 1),
  u.email, COALESCE(u.raw_user_meta_data->>'firstName', SPLIT_PART(u.email, '@', 1)),
  COALESCE(u.raw_user_meta_data->>'lastName', 'Usuario'), SPLIT_PART(u.email, '@', 1),
  CONCAT(COALESCE(u.raw_user_meta_data->>'firstName', SPLIT_PART(u.email, '@', 1)), ' ', COALESCE(u.raw_user_meta_data->>'lastName', 'Usuario')),
  CASE WHEN u.gamilit_role IN ('student','admin_teacher','super_admin') THEN u.gamilit_role ELSE 'student'::auth_management.gamilit_role END
FROM auth.users u WHERE NOT EXISTS (SELECT 1 FROM auth_management.profiles p WHERE p.user_id = u.id) ON CONFLICT (user_id) DO NOTHING;
ALTER TABLE auth_management.profiles ENABLE TRIGGER ALL;
COMMIT;

BEGIN;
INSERT INTO gamification_system.user_stats (user_id, tenant_id, total_xp, level, current_rank, ml_coins, ml_coins_earned_total)
SELECT p.id, p.tenant_id, 0, 1, 'Ajaw', 100, 100
FROM auth_management.profiles p WHERE p.role IN ('student','admin_teacher','super_admin')
AND NOT EXISTS (SELECT 1 FROM gamification_system.user_stats us WHERE us.user_id = p.id) ON CONFLICT (user_id) DO NOTHING;
COMMIT;

BEGIN;
INSERT INTO gamification_system.user_ranks (user_id, tenant_id, current_rank, is_current, achieved_at)
SELECT p.id, p.tenant_id, 'Ajaw'::gamification_system.maya_rank, true, NOW()
FROM auth_management.profiles p WHERE p.role IN ('student','admin_teacher','super_admin')
AND NOT EXISTS (SELECT 1 FROM gamification_system.user_ranks ur WHERE ur.user_id = p.id);
COMMIT;
"

if [ -n "$SUDO_PASS" ]; then
    printf '%s\n' "$SUDO_PASS" | sudo -S -u postgres psql -d "$DB_NAME" -c "$fix_sql" 2>&1 | tail -5
else
    sudo -u postgres psql -d "$DB_NAME" -c "$fix_sql" 2>&1 | tail -5
fi

echo ""
echo "=== VALIDACION POST-SEEDS ==="
user_count=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM auth.users WHERE deleted_at IS NULL;" 2>/dev/null)
profile_count=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM auth_management.profiles;" 2>/dev/null)
module_count=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM educational_content.modules;" 2>/dev/null)
tenant_count=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM auth_management.tenants;" 2>/dev/null)
stats_count=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM gamification_system.user_stats;" 2>/dev/null)

echo "Usuarios: $user_count"
echo "Profiles: $profile_count"
echo "Tenants: $tenant_count"
echo "Modulos: $module_count"
echo "User Stats: $stats_count"
echo "=== SEEDS COMPLETADOS ==="
