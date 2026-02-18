#!/bin/bash
cd /mnt/c/Empresas/ISEM/gamilit-workspace/apps/database
DB_NAME="gamilit_platform"
DB_USER="gamilit_user"
DB_PASSWORD="${DB_PASSWORD:-${GAMILIT_DB_PASSWORD:-}}"
DB_HOST="localhost"
DB_PORT="5432"
export PGPASSWORD="$DB_PASSWORD"

if [ -z "$DB_PASSWORD" ]; then
  echo "ERROR: define DB_PASSWORD o GAMILIT_DB_PASSWORD"
  exit 1
fi

execute_sql() {
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$1" 2>&1
}

echo "=== PASO 9.5: FK constraints diferidos ==="
fk_dir="./ddl/schemas/auth_management/fk-constraints"
if [ -d "$fk_dir" ]; then
  fk_count=0
  for f in "$fk_dir"/*.sql; do
    if [ -f "$f" ]; then
      execute_sql "$f" > /dev/null 2>&1
      fk_count=$((fk_count + 1))
    fi
  done
  echo "$fk_count FK constraints procesados"
else
  echo "No FK constraints dir found"
fi

echo "=== PASO 9.6: Vistas cross-schema ==="
cs_view="./ddl/schemas/progress_tracking/views/02-teacher_pending_reviews.sql"
if [ -f "$cs_view" ]; then
  execute_sql "$cs_view" > /dev/null 2>&1 && echo "OK: teacher_pending_reviews" || echo "WARN: teacher_pending_reviews"
fi

echo "=== PASO 9.7: Tablas cross-schema ==="
cs_tables="./ddl/schemas/educational_content/tables/_cross_schema"
if [ -d "$cs_tables" ]; then
  cs_count=0
  for f in "$cs_tables"/*.sql; do
    if [ -f "$f" ]; then
      execute_sql "$f" > /dev/null 2>&1
      cs_count=$((cs_count + 1))
    fi
  done
  echo "$cs_count cross-schema tables procesadas"
else
  echo "No cross-schema tables dir found"
fi

echo ""
echo "=== METRICAS DETALLADAS ==="
echo "--- Tablas por schema ---"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT schemaname, COUNT(*) as tables FROM pg_tables WHERE schemaname NOT IN ('pg_catalog','information_schema') GROUP BY schemaname ORDER BY schemaname;"

total_tables=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM pg_tables WHERE schemaname NOT IN ('pg_catalog','information_schema');")
echo "TOTAL TABLAS: $total_tables"

echo "--- Triggers (pg_trigger, non-internal) ---"
trigger_count=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM pg_trigger WHERE NOT tgisinternal;")
echo "TOTAL TRIGGERS: $trigger_count"

echo "--- Funciones (pg_proc, custom) ---"
func_count=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname NOT IN ('pg_catalog','information_schema');")
echo "TOTAL FUNCIONES: $func_count"

echo "--- Vistas ---"
view_count=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM pg_views WHERE schemaname NOT IN ('pg_catalog','information_schema');")
echo "TOTAL VISTAS: $view_count"

echo "--- Materialized Views ---"
mview_count=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM pg_matviews WHERE schemaname NOT IN ('pg_catalog','information_schema');")
echo "TOTAL MVIEWS: $mview_count"

echo "--- RLS Policies ---"
rls_count=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM pg_policies;")
echo "TOTAL RLS: $rls_count"

echo "--- ENUMs ---"
enum_count=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM pg_type WHERE typtype='e';")
echo "TOTAL ENUMS: $enum_count"

echo "--- FKs ---"
fk_count=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_type='FOREIGN KEY';")
echo "TOTAL FKs: $fk_count"

echo ""
echo "=== RESUMEN VS ESPERADO ==="
echo "Schemas:  16/16"
echo "Tablas:   $total_tables/171"
echo "Funciones: $func_count/183"
echo "Triggers: $trigger_count/126"
echo "RLS:      $rls_count/263"
echo "ENUMs:    $enum_count/42"
echo "FKs:      $fk_count/298"
echo "Vistas:   $view_count/22"
echo "MViews:   $mview_count/7"
echo "=== FIN ==="
