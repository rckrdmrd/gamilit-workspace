#!/bin/bash
set -e

cd /mnt/c/Empresas/ISEM/gamilit-workspace/apps/database
DDL_DIR="./ddl"
DB_NAME="gamilit_platform"
DB_USER="gamilit_user"
DB_PASSWORD="${DB_PASSWORD:-${GAMILIT_DB_PASSWORD:-}}"
DB_HOST="localhost"
DB_PORT="5432"
SUDO_PASS="${GAMILIT_SUDO_PASSWORD:-}"

if [ -z "$DB_PASSWORD" ]; then
    echo "ERROR: define DB_PASSWORD o GAMILIT_DB_PASSWORD"
    exit 1
fi

execute_sql_file() {
    local file="$1"
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$file" 2>&1
}

echo "=== PASO 2c: Cargando ENUMs de schemas ==="
enum_count=0
temp_enums="/tmp/gamilit-ddl-enums.sql"
: > "$temp_enums"

schemas_all="auth auth_management gamilit storage admin_dashboard system_configuration gamification_system educational_content content_management social_features progress_tracking audit_logging communication lti_integration notifications public"

for schema in $schemas_all; do
    enums_dir="$DDL_DIR/schemas/$schema/enums"
    if [ -d "$enums_dir" ]; then
        for enum_file in "$enums_dir"/*.sql; do
            if [ -f "$enum_file" ]; then
                echo "-- ENUM: $(basename $enum_file)" >> "$temp_enums"
                cat "$enum_file" >> "$temp_enums"
                echo "" >> "$temp_enums"
                enum_count=$((enum_count + 1))
            fi
        done
    fi
done

echo "Found $enum_count ENUM files"
if [ $enum_count -gt 0 ]; then
    if [ -n "$SUDO_PASS" ]; then
        printf '%s\n' "$SUDO_PASS" | sudo -S -u postgres psql -d "$DB_NAME" < "$temp_enums" > /dev/null 2>&1
    else
        sudo -u postgres psql -d "$DB_NAME" < "$temp_enums" > /dev/null 2>&1
    fi
    echo "ENUMs cargados"
fi
rm -f "$temp_enums"

echo "=== PASO 2d: Cargando tablas (batch mode) ==="
temp_batch="/tmp/gamilit-ddl-tables.sql"
: > "$temp_batch"
table_count=0

for schema in $schemas_all; do
    tables_dir="$DDL_DIR/schemas/$schema/tables"
    if [ -d "$tables_dir" ]; then
        for table_file in "$tables_dir"/*.sql; do
            if [ -f "$table_file" ]; then
                cat "$table_file" >> "$temp_batch"
                echo "" >> "$temp_batch"
                table_count=$((table_count + 1))
            fi
        done
    fi
done

echo "Found $table_count table files"
if [ -n "$SUDO_PASS" ]; then
    printf '%s\n' "$SUDO_PASS" | sudo -S -u postgres psql -d "$DB_NAME" < "$temp_batch" 2>&1 | grep -ci "error" || echo "0 errors"
else
    sudo -u postgres psql -d "$DB_NAME" < "$temp_batch" 2>&1 | grep -ci "error" || echo "0 errors"
fi
echo "Tablas procesadas"
rm -f "$temp_batch"

echo "=== PASO 2e: Post-DDL Permissions ==="
perms_file="$DDL_DIR/99-post-ddl-permissions.sql"
if [ -f "$perms_file" ]; then
    if [ -n "$SUDO_PASS" ]; then
        printf '%s\n' "$SUDO_PASS" | sudo -S -u postgres psql -d "$DB_NAME" < "$perms_file" > /dev/null 2>&1
    else
        sudo -u postgres psql -d "$DB_NAME" < "$perms_file" > /dev/null 2>&1
    fi
    echo "Permisos otorgados"
fi

echo "=== PASO 3: Funciones ==="
func_count=0
func_err=0
schemas_funcs="gamilit auth_management gamification_system educational_content content_management social_features progress_tracking audit_logging communication lti_integration notifications admin_dashboard system_configuration"

for schema in $schemas_funcs; do
    functions_dir="$DDL_DIR/schemas/$schema/functions"
    if [ -d "$functions_dir" ]; then
        for function_file in "$functions_dir"/*.sql; do
            if [ -f "$function_file" ]; then
                if execute_sql_file "$function_file" > /dev/null 2>&1; then
                    func_count=$((func_count + 1))
                else
                    func_err=$((func_err + 1))
                fi
            fi
        done
    fi
done
echo "$func_count funciones creadas, $func_err errores"

echo "=== PASO 4: Vistas ==="
view_count=0
view_err=0
schemas_views="admin_dashboard auth gamification_system gamilit progress_tracking educational_content social_features"

for schema in $schemas_views; do
    views_dir="$DDL_DIR/schemas/$schema/views"
    if [ -d "$views_dir" ]; then
        for view_file in "$views_dir"/*.sql; do
            if [ -f "$view_file" ]; then
                if execute_sql_file "$view_file" > /dev/null 2>&1; then
                    view_count=$((view_count + 1))
                else
                    view_err=$((view_err + 1))
                fi
            fi
        done
    fi
done
echo "$view_count vistas creadas, $view_err errores"

echo "=== PASO 5: Vistas Materializadas ==="
mview_count=0
mview_err=0
mviews_dir="$DDL_DIR/schemas/gamification_system/materialized-views"
if [ -d "$mviews_dir" ]; then
    for mview_file in "$mviews_dir"/*.sql; do
        if [ -f "$mview_file" ]; then
            if execute_sql_file "$mview_file" > /dev/null 2>&1; then
                mview_count=$((mview_count + 1))
            else
                mview_err=$((mview_err + 1))
            fi
        fi
    done
fi
echo "$mview_count MVIEWs creadas, $mview_err errores"

echo "=== PASO 6: Indices ==="
idx_count=0
idx_err=0
schemas_idx="auth_management content_management gamification_system educational_content audit_logging progress_tracking social_features system_configuration"

for schema in $schemas_idx; do
    indexes_dir="$DDL_DIR/schemas/$schema/indexes"
    if [ -d "$indexes_dir" ]; then
        for index_file in "$indexes_dir"/*.sql; do
            if [ -f "$index_file" ]; then
                if execute_sql_file "$index_file" > /dev/null 2>&1; then
                    idx_count=$((idx_count + 1))
                else
                    idx_err=$((idx_err + 1))
                fi
            fi
        done
    fi
done
echo "$idx_count indices creados, $idx_err errores"

echo "=== PASO 7: Triggers ==="
trg_count=0
trg_err=0
schemas_trg="auth_management content_management educational_content gamification_system social_features progress_tracking audit_logging system_configuration lti_integration"

for schema in $schemas_trg; do
    triggers_dir="$DDL_DIR/schemas/$schema/triggers"
    if [ -d "$triggers_dir" ]; then
        for trigger_file in "$triggers_dir"/*.sql; do
            if [ -f "$trigger_file" ]; then
                if execute_sql_file "$trigger_file" > /dev/null 2>&1; then
                    trg_count=$((trg_count + 1))
                else
                    trg_err=$((trg_err + 1))
                fi
            fi
        done
    fi
done
echo "$trg_count triggers creados, $trg_err errores"

echo "=== PASO 8: RLS Policies ==="
rls_count=0
rls_err=0
schemas_rls="gamification_system social_features auth_management progress_tracking audit_logging content_management educational_content system_configuration communication notifications"

for schema in $schemas_rls; do
    policies_dir="$DDL_DIR/schemas/$schema/rls-policies"
    if [ -d "$policies_dir" ]; then
        for policy_file in "$policies_dir"/*.sql; do
            if [ -f "$policy_file" ]; then
                if execute_sql_file "$policy_file" > /dev/null 2>&1; then
                    rls_count=$((rls_count + 1))
                else
                    rls_err=$((rls_err + 1))
                fi
            fi
        done
    fi
done
echo "$rls_count archivos RLS ejecutados, $rls_err errores"

echo "=== VALIDACION FINAL ==="
export PGPASSWORD="$DB_PASSWORD"
table_count=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM pg_tables WHERE schemaname NOT IN ('pg_catalog', 'information_schema');")
function_count=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema NOT IN ('pg_catalog', 'information_schema');")
trigger_count=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema NOT IN ('pg_catalog', 'information_schema');")
policy_count=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM pg_policies;")
schema_count=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM information_schema.schemata WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast');")
index_count=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM pg_indexes WHERE schemaname NOT IN ('pg_catalog', 'information_schema');")
echo "Schemas: $schema_count"
echo "Tablas: $table_count"
echo "Funciones: $function_count"
echo "Triggers: $trigger_count"
echo "RLS Policies: $policy_count"
echo "Indices: $index_count"
echo "=== DDL COMPLETADO ==="
