#!/bin/bash

# =============================================================================
# Script: validar-simco.sh
# Descripción: Valida cumplimiento del estándar SIMCO (Sistema Indexado
#              Modular por COntexto) en el proyecto Gamilit
# Autor: Database Team
# Fecha: 2025-11-07
# =============================================================================

set -e

PROJECT_ROOT="/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit"
DOCS_DIR="$PROJECT_ROOT/docs"
APPS_DIR="$PROJECT_ROOT/apps"
REPORT_FILE="$DOCS_DIR/REPORTE-VALIDACION-SIMCO-$(date +%Y%m%d-%H%M%S).md"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contadores
TOTAL_ERRORS=0
TOTAL_WARNINGS=0
TOTAL_OK=0

# Función para escribir en reporte
write_report() {
    echo "$1" >> "$REPORT_FILE"
}

# Función para logging
log_error() {
    echo -e "${RED}❌ ERROR: $1${NC}"
    write_report "❌ **ERROR**: $1"
    TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
}

log_warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
    write_report "⚠️  **WARNING**: $1"
    TOTAL_WARNINGS=$((TOTAL_WARNINGS + 1))
}

log_ok() {
    echo -e "${GREEN}✅ OK: $1${NC}"
    write_report "✅ **OK**: $1"
    TOTAL_OK=$((TOTAL_OK + 1))
}

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
    write_report ""
    write_report "### $1"
    write_report ""
}

# Inicializar reporte
cat > "$REPORT_FILE" << EOF
# Reporte de Validación SIMCO

**Fecha**: $(date +"%Y-%m-%d %H:%M:%S")
**Proyecto**: Gamilit Platform
**Estándar**: SIMCO (Sistema Indexado Modular por COntexto)

---

## Resumen Ejecutivo

EOF

echo ""
echo "========================================="
echo "  VALIDACIÓN SIMCO - Gamilit Platform"
echo "========================================="
echo ""

# =============================================================================
# VALIDACIÓN 1: Estructura de _MAP.md
# =============================================================================

log_info "1. Validando estructura de _MAP.md"

# Verificar _MAP.md raíz
if [ -f "$DOCS_DIR/_MAP.md" ]; then
    log_ok "_MAP.md existe en raíz de docs/"
else
    log_error "_MAP.md no encontrado en raíz de docs/"
fi

# Contar _MAP.md en subdirectorios
MAP_COUNT=$(find "$DOCS_DIR" -name "_MAP.md" -type f | wc -l)
echo "   Archivos _MAP.md encontrados: $MAP_COUNT"
write_report "- Archivos _MAP.md encontrados: $MAP_COUNT"

# Verificar que cada directorio principal tenga _MAP.md
for dir in "$DOCS_DIR"/01-requerimientos "$DOCS_DIR"/02-especificaciones-tecnicas "$DOCS_DIR"/03-desarrollo "$DOCS_DIR"/04-planificacion; do
    if [ -d "$dir" ]; then
        if [ -f "$dir/_MAP.md" ]; then
            log_ok "$(basename $dir) tiene _MAP.md"
        else
            log_warning "$(basename $dir) no tiene _MAP.md"
        fi
    fi
done

# =============================================================================
# VALIDACIÓN 2: Referencias en Documentación
# =============================================================================

log_info "2. Validando referencias en documentación"

# Verificar que documentos RF/ET tengan sección de referencias
RF_FILES=$(find "$DOCS_DIR/01-requerimientos" -name "RF-*.md" -type f 2>/dev/null | wc -l)
RF_WITH_REF=$(find "$DOCS_DIR/01-requerimientos" -name "RF-*.md" -type f -exec grep -l "## 🔗 Referencias" {} \; 2>/dev/null | wc -l)

ET_FILES=$(find "$DOCS_DIR/02-especificaciones-tecnicas" -name "ET-*.md" -type f 2>/dev/null | wc -l)
ET_WITH_REF=$(find "$DOCS_DIR/02-especificaciones-tecnicas" -name "ET-*.md" -type f -exec grep -l "## 🔗 Referencias" {} \; 2>/dev/null | wc -l)

echo "   RF files: $RF_WITH_REF/$RF_FILES con referencias"
echo "   ET files: $ET_WITH_REF/$ET_FILES con referencias"

write_report "- Archivos RF: $RF_WITH_REF/$RF_FILES con referencias ($(awk "BEGIN {printf \"%.1f\", ($RF_WITH_REF/$RF_FILES)*100}")%)"
write_report "- Archivos ET: $ET_WITH_REF/$ET_FILES con referencias ($(awk "BEGIN {printf \"%.1f\", ($ET_WITH_REF/$ET_FILES)*100}")%)"

if [ $RF_WITH_REF -eq $RF_FILES ] && [ $ET_WITH_REF -eq $ET_FILES ]; then
    log_ok "Todos los archivos RF y ET tienen referencias"
else
    log_warning "Algunos archivos RF o ET no tienen sección de referencias"
fi

# =============================================================================
# VALIDACIÓN 3: Rutas Legacy
# =============================================================================

log_info "3. Validando ausencia de rutas legacy"

LEGACY_COUNT=$(grep -r "/home/isem/" "$DOCS_DIR" --include="*.md" 2>/dev/null | wc -l)

if [ $LEGACY_COUNT -eq 0 ]; then
    log_ok "No se encontraron rutas absolutas legacy"
else
    log_error "Se encontraron $LEGACY_COUNT rutas absolutas legacy (/home/isem/...)"
    write_report ""
    write_report "Rutas legacy encontradas:"
    write_report '```'
    grep -r "/home/isem/" "$DOCS_DIR" --include="*.md" -n 2>/dev/null | head -10 >> "$REPORT_FILE"
    write_report '```'
fi

# =============================================================================
# VALIDACIÓN 4: Referencias en Código DDL
# =============================================================================

log_info "4. Validando referencias en código DDL"

if [ -f "$APPS_DIR/database/ddl/00-prerequisites.sql" ]; then
    ENUM_WITH_DOC=$(grep -c "📚 Documentación:" "$APPS_DIR/database/ddl/00-prerequisites.sql" 2>/dev/null || echo "0")

    if [ $ENUM_WITH_DOC -gt 10 ]; then
        log_ok "00-prerequisites.sql tiene $ENUM_WITH_DOC ENUMs documentados"
    else
        log_warning "00-prerequisites.sql solo tiene $ENUM_WITH_DOC ENUMs documentados (esperados: 16+)"
    fi
else
    log_error "00-prerequisites.sql no encontrado"
fi

# Contar tablas con referencias
TABLES_WITH_REF=$(find "$APPS_DIR/database/ddl/schemas" -name "*.sql" -type f -exec grep -l "📚 Documentación:" {} \; 2>/dev/null | wc -l)
TOTAL_TABLES=$(find "$APPS_DIR/database/ddl/schemas" -name "*.sql" -type f 2>/dev/null | wc -l)

echo "   Tablas con referencias: $TABLES_WITH_REF/$TOTAL_TABLES"
write_report "- Tablas DDL con referencias: $TABLES_WITH_REF/$TOTAL_TABLES ($(awk "BEGIN {printf \"%.1f\", ($TABLES_WITH_REF/$TOTAL_TABLES)*100}")%)"

if [ $TABLES_WITH_REF -gt 0 ]; then
    log_ok "Patrón de referencias establecido en DDL ($TABLES_WITH_REF tablas)"
else
    log_warning "Ninguna tabla DDL tiene referencias documentadas"
fi

# =============================================================================
# VALIDACIÓN 5: Enlaces Rotos
# =============================================================================

log_info "5. Validando enlaces rotos en documentación"

BROKEN_LINKS=0

# Buscar enlaces markdown y verificar que los archivos existan
while IFS= read -r file; do
    while IFS= read -r link; do
        # Extraer ruta del link
        link_path=$(echo "$link" | sed -E 's/.*\]\((.*)\).*/\1/' | sed 's/#.*//')

        # Si es una ruta relativa
        if [[ "$link_path" == ../* ]] || [[ "$link_path" == ./* ]]; then
            dir=$(dirname "$file")
            full_path="$dir/$link_path"

            if [ ! -f "$full_path" ] && [ ! -d "$full_path" ]; then
                log_warning "Enlace roto en $file: $link_path"
                BROKEN_LINKS=$((BROKEN_LINKS + 1))
            fi
        fi
    done < <(grep -o '\[.*\](\..*\.md)' "$file" 2>/dev/null || true)
done < <(find "$DOCS_DIR" -name "*.md" -type f)

if [ $BROKEN_LINKS -eq 0 ]; then
    log_ok "No se encontraron enlaces rotos"
else
    log_error "Se encontraron $BROKEN_LINKS enlaces potencialmente rotos"
fi

# =============================================================================
# VALIDACIÓN 6: Consistencia de Formato
# =============================================================================

log_info "6. Validando consistencia de formato"

# Verificar que archivos RF/ET usen el formato correcto
INCORRECT_FORMAT=0

for file in $(find "$DOCS_DIR" -name "RF-*.md" -o -name "ET-*.md" 2>/dev/null); do
    # Verificar que tenga metadata
    if ! grep -q "## 📋 Metadata" "$file"; then
        log_warning "$(basename $file) no tiene sección Metadata"
        INCORRECT_FORMAT=$((INCORRECT_FORMAT + 1))
    fi
done

if [ $INCORRECT_FORMAT -eq 0 ]; then
    log_ok "Todos los archivos RF/ET tienen formato consistente"
else
    log_warning "$INCORRECT_FORMAT archivos no tienen formato SIMCO completo"
fi

# =============================================================================
# RESUMEN FINAL
# =============================================================================

echo ""
echo "========================================="
echo "  RESUMEN"
echo "========================================="

write_report ""
write_report "---"
write_report ""
write_report "## Estadísticas Finales"
write_report ""
write_report "| Métrica | Valor |"
write_report "|---------|-------|"
write_report "| ✅ Validaciones OK | $TOTAL_OK |"
write_report "| ⚠️  Warnings | $TOTAL_WARNINGS |"
write_report "| ❌ Errores | $TOTAL_ERRORS |"
write_report ""

echo "✅ Validaciones OK:     $TOTAL_OK"
echo "⚠️  Warnings:           $TOTAL_WARNINGS"
echo "❌ Errores:             $TOTAL_ERRORS"
echo ""

# Calcular score
TOTAL_CHECKS=$((TOTAL_OK + TOTAL_WARNINGS + TOTAL_ERRORS))
if [ $TOTAL_CHECKS -gt 0 ]; then
    SCORE=$(awk "BEGIN {printf \"%.1f\", ($TOTAL_OK/$TOTAL_CHECKS)*100}")
else
    SCORE="0.0"
fi

echo "📊 Score SIMCO: $SCORE%"
write_report "### Score SIMCO: ${SCORE}%"
write_report ""

if [ "$SCORE" == "100.0" ]; then
    echo -e "${GREEN}🎉 ¡Proyecto 100% conforme con SIMCO!${NC}"
    write_report "🎉 **¡Proyecto 100% conforme con SIMCO!**"
elif (( $(echo "$SCORE >= 80.0" | bc -l) )); then
    echo -e "${GREEN}✅ Proyecto mayormente conforme con SIMCO${NC}"
    write_report "✅ **Proyecto mayormente conforme con SIMCO**"
elif (( $(echo "$SCORE >= 60.0" | bc -l) )); then
    echo -e "${YELLOW}⚠️  Proyecto parcialmente conforme - requiere mejoras${NC}"
    write_report "⚠️  **Proyecto parcialmente conforme - requiere mejoras**"
else
    echo -e "${RED}❌ Proyecto no conforme - requiere trabajo significativo${NC}"
    write_report "❌ **Proyecto no conforme - requiere trabajo significativo**"
fi

echo ""
echo "📄 Reporte completo guardado en:"
echo "   $REPORT_FILE"
echo ""

write_report ""
write_report "---"
write_report ""
write_report "*Reporte generado automáticamente por validar-simco.sh*"

exit 0
