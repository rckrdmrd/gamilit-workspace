#!/bin/bash

# Script de resumen rápido de diferencias DDL
# Uso: ./quick-summary.sh

ORIGEN="/home/isem/workspace/projects/gamilit/apps/database/ddl/schemas"
DESTINO="/home/isem/workspace-old/wsl-ubuntu/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas"

echo "========================================================================"
echo "RESUMEN RÁPIDO - DIFERENCIAS DDL"
echo "========================================================================"
echo ""

# Contar archivos en cada directorio
echo "CONTEO DE ARCHIVOS SQL:"
echo "------------------------"
origen_count=$(find "$ORIGEN" -name "*.sql" 2>/dev/null | wc -l)
destino_count=$(find "$DESTINO" -name "*.sql" 2>/dev/null | wc -l)
echo "Archivos en ORIGEN:  $origen_count"
echo "Archivos en DESTINO: $destino_count"
echo "Diferencia:          $((origen_count - destino_count))"
echo ""

# Archivos nuevos según git status
echo "ARCHIVOS NUEVOS DETECTADOS (git status ??):"
echo "--------------------------------------------"
cd /home/isem/workspace/projects/gamilit
git status --porcelain | grep "^??" | grep "apps/database/ddl/schemas" | grep "\.sql$"
echo ""

# Archivos modificados según git status
echo "ARCHIVOS MODIFICADOS DETECTADOS (git status M):"
echo "------------------------------------------------"
cd /home/isem/workspace/projects/gamilit
git status --porcelain | grep "^ M" | grep "apps/database/ddl/schemas" | grep "\.sql$"
echo ""

# Conteo por schema
echo "CONTEO POR SCHEMA:"
echo "------------------"
echo "Schema                  | Origen | Destino | Diff"
echo "------------------------|--------|---------|-----"
for schema in admin_dashboard audit_logging auth auth_management communication content_management educational_content gamification_system gamilit lti_integration notifications progress_tracking public social_features storage system_configuration; do
  o_count=$(find "$ORIGEN/$schema" -name "*.sql" 2>/dev/null | wc -l)
  d_count=$(find "$DESTINO/$schema" -name "*.sql" 2>/dev/null | wc -l)
  diff=$((o_count - d_count))
  printf "%-24s| %6d | %7d | %4d\n" "$schema" "$o_count" "$d_count" "$diff"
done
echo ""

echo "========================================================================"
echo "Para análisis completo, ejecute:"
echo "  cd /home/isem/workspace/projects/gamilit/orchestration/analisis-homologacion-database-2025-12-18"
echo "  python3 analyze_direct.py"
echo "========================================================================"
