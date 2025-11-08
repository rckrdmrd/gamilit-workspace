#!/bin/bash

# =============================================================================
# Script: limpiar-rutas-legacy.sh
# Descripción: Limpia rutas absolutas legacy (/home/isem/...) y las convierte
#              a rutas relativas en archivos de documentación
# Autor: Database Team
# Fecha: 2025-11-07
# =============================================================================

set -e

DOCS_DIR="/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/docs"
LOG_FILE="$DOCS_DIR/scripts/limpieza-rutas-$(date +%Y%m%d-%H%M%S).log"

echo "🧹 Iniciando limpieza de rutas legacy..." | tee "$LOG_FILE"
echo "Fecha: $(date)" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Contar rutas legacy antes de limpiar
BEFORE_COUNT=$(grep -r "/home/isem/" "$DOCS_DIR" --include="*.md" 2>/dev/null | wc -l)
echo "📊 Rutas legacy encontradas: $BEFORE_COUNT" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Patrones de reemplazo comunes
declare -A REPLACEMENTS=(
    ["/home/isem/workspace/workspace-gamilit/docs/"]="../../"
    ["/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/docs/"]=""
    ["/home/isem/workspace/workspace-gamilit/projects/gamilit-platform-web/"]="../../apps/frontend/"
)

# Función para reemplazar rutas en un archivo
replace_in_file() {
    local file="$1"
    local changes=0

    for pattern in "${!REPLACEMENTS[@]}"; do
        replacement="${REPLACEMENTS[$pattern]}"
        if grep -q "$pattern" "$file" 2>/dev/null; then
            sed -i "s|$pattern|$replacement|g" "$file"
            changes=$((changes + 1))
        fi
    done

    if [ $changes -gt 0 ]; then
        echo "  ✅ $file (${changes} patrones reemplazados)" | tee -a "$LOG_FILE"
    fi
}

# Procesar todos los archivos .md
echo "🔄 Procesando archivos..." | tee -a "$LOG_FILE"
find "$DOCS_DIR" -name "*.md" -type f | while read -r file; do
    if grep -q "/home/isem/" "$file" 2>/dev/null; then
        replace_in_file "$file"
    fi
done

echo "" | tee -a "$LOG_FILE"

# Contar rutas legacy después de limpiar
AFTER_COUNT=$(grep -r "/home/isem/" "$DOCS_DIR" --include="*.md" 2>/dev/null | wc -l)
CLEANED=$((BEFORE_COUNT - AFTER_COUNT))

echo "✅ Limpieza completada" | tee -a "$LOG_FILE"
echo "📊 Estadísticas:" | tee -a "$LOG_FILE"
echo "  - Rutas antes: $BEFORE_COUNT" | tee -a "$LOG_FILE"
echo "  - Rutas después: $AFTER_COUNT" | tee -a "$LOG_FILE"
echo "  - Rutas limpiadas: $CLEANED" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

if [ $AFTER_COUNT -gt 0 ]; then
    echo "⚠️  Aún quedan $AFTER_COUNT rutas legacy por revisar manualmente:" | tee -a "$LOG_FILE"
    grep -r "/home/isem/" "$DOCS_DIR" --include="*.md" -n 2>/dev/null | head -10 | tee -a "$LOG_FILE"
fi

echo "" | tee -a "$LOG_FILE"
echo "📄 Log guardado en: $LOG_FILE"
