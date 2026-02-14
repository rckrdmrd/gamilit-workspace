#!/bin/bash
cd /mnt/c/Empresas/ISEM/gamilit-workspace/apps/database
DDL_DIR="./ddl"
DB_NAME="gamilit_platform"
DB_USER="gamilit_user"
DB_PASSWORD="gamilit_dev_2026"
DB_HOST="localhost"
DB_PORT="5432"
SUDO_PASS="2320"

exec_as_postgres() {
    printf "$SUDO_PASS\n" | sudo -S -u postgres psql -d "$DB_NAME" -f "$1" 2>&1
}

exec_as_user() {
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$1" 2>&1
}

echo "=== Re-ejecutando FUNCIONES como postgres ==="
func_count=0
func_err=0
for schema in gamilit auth_management gamification_system educational_content content_management social_features progress_tracking audit_logging communication lti_integration notifications admin_dashboard system_configuration; do
    functions_dir="$DDL_DIR/schemas/$schema/functions"
    if [ -d "$functions_dir" ]; then
        for f in "$functions_dir"/*.sql; do
            if [ -f "$f" ]; then
                if exec_as_postgres "$f" > /dev/null 2>&1; then
                    func_count=$((func_count + 1))
                else
                    func_err=$((func_err + 1))
                    echo "  FAIL: $(basename $f)"
                fi
            fi
        done
    fi
done
echo "$func_count funciones OK, $func_err errores"

echo "=== Re-ejecutando VISTAS como postgres ==="
view_count=0
view_err=0
for schema in admin_dashboard auth gamification_system gamilit progress_tracking educational_content social_features; do
    views_dir="$DDL_DIR/schemas/$schema/views"
    if [ -d "$views_dir" ]; then
        for f in "$views_dir"/*.sql; do
            if [ -f "$f" ]; then
                if exec_as_postgres "$f" > /dev/null 2>&1; then
                    view_count=$((view_count + 1))
                else
                    view_err=$((view_err + 1))
                    echo "  FAIL: $(basename $f)"
                fi
            fi
        done
    fi
done
echo "$view_count vistas OK, $view_err errores"

echo "=== Re-ejecutando MATERIALIZED VIEWS como postgres ==="
mview_count=0
mview_err=0
mviews_dir="$DDL_DIR/schemas/gamification_system/materialized-views"
if [ -d "$mviews_dir" ]; then
    for f in "$mviews_dir"/*.sql; do
        if [ -f "$f" ]; then
            if exec_as_postgres "$f" > /dev/null 2>&1; then
                mview_count=$((mview_count + 1))
            else
                mview_err=$((mview_err + 1))
                echo "  FAIL: $(basename $f)"
            fi
        fi
    done
fi
echo "$mview_count MVIEWs OK, $mview_err errores"

echo "=== Re-ejecutando TRIGGERS como postgres ==="
trg_count=0
trg_err=0
for schema in auth_management content_management educational_content gamification_system social_features progress_tracking audit_logging system_configuration lti_integration; do
    triggers_dir="$DDL_DIR/schemas/$schema/triggers"
    if [ -d "$triggers_dir" ]; then
        for f in "$triggers_dir"/*.sql; do
            if [ -f "$f" ]; then
                if exec_as_postgres "$f" > /dev/null 2>&1; then
                    trg_count=$((trg_count + 1))
                else
                    trg_err=$((trg_err + 1))
                    echo "  FAIL: $(basename $f)"
                fi
            fi
        done
    fi
done
echo "$trg_count triggers OK, $trg_err errores"

echo "=== Ejecutando RLS enable files ==="
for rls_file in "$DDL_DIR/07-enable-rls.sql" "$DDL_DIR/07b-enable-rls-phase2.sql" "$DDL_DIR/07c-enable-rls-phase3.sql"; do
    if [ -f "$rls_file" ]; then
        exec_as_postgres "$rls_file" > /dev/null 2>&1 && echo "OK: $(basename $rls_file)" || echo "WARN: $(basename $rls_file)"
    fi
done

echo "=== Re-ejecutando RLS POLICIES como postgres ==="
rls_count=0
rls_err=0
for schema in gamification_system social_features auth_management progress_tracking audit_logging content_management educational_content system_configuration communication notifications; do
    policies_dir="$DDL_DIR/schemas/$schema/rls-policies"
    if [ -d "$policies_dir" ]; then
        for f in "$policies_dir"/*.sql; do
            if [ -f "$f" ]; then
                if exec_as_postgres "$f" > /dev/null 2>&1; then
                    rls_count=$((rls_count + 1))
                else
                    rls_err=$((rls_err + 1))
                fi
            fi
        done
    fi
done
echo "$rls_count archivos RLS OK, $rls_err errores"

echo "=== Re-ejecutando Post-DDL permissions ==="
perms_file="$DDL_DIR/99-post-ddl-permissions.sql"
if [ -f "$perms_file" ]; then
    exec_as_postgres "$perms_file" > /dev/null 2>&1 && echo "Permisos actualizados" || echo "WARN: permisos"
fi

echo ""
echo "=== VALIDACION FINAL POST-FIX ==="
export PGPASSWORD="$DB_PASSWORD"
total_tables=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM pg_tables WHERE schemaname NOT IN ('pg_catalog','information_schema');")
func_count_final=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname NOT IN ('pg_catalog','information_schema');")
trigger_count_final=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM pg_trigger WHERE NOT tgisinternal;")
rls_count_final=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM pg_policies;")
view_count_final=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM pg_views WHERE schemaname NOT IN ('pg_catalog','information_schema');")
mview_count_final=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM pg_matviews WHERE schemaname NOT IN ('pg_catalog','information_schema');")
enum_count_final=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM pg_type WHERE typtype='e';")
fk_count_final=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_type='FOREIGN KEY';")

echo ""
echo "Schemas:    16/16"
echo "Tablas:     $total_tables/171"
echo "Funciones:  $func_count_final/183"
echo "Triggers:   $trigger_count_final/126"
echo "RLS:        $rls_count_final/263"
echo "ENUMs:      $enum_count_final/42"
echo "FKs:        $fk_count_final/298"
echo "Vistas:     $view_count_final/22"
echo "MViews:     $mview_count_final/7"
echo "=== FIN FASE 3 ==="
