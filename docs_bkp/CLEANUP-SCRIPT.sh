#!/bin/bash
# Script para limpiar archivos internos antes de entrega al cliente
# IMPORTANTE: Hacer backup antes de ejecutar este script

# Directorio base
DOCS_DIR="/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/docs"

echo "=========================================="
echo "CLEANUP SCRIPT - Documentación Cliente"
echo "=========================================="
echo ""
echo "ADVERTENCIA: Este script eliminará archivos de uso interno."
echo "Asegúrate de tener un backup completo antes de continuar."
echo ""
read -p "¿Deseas continuar? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Operación cancelada."
    exit 0
fi

echo ""
echo "Iniciando limpieza..."
echo ""

# Contador de archivos eliminados
COUNT=0

# 1. Eliminar todos los archivos _MAP.md
echo "1. Eliminando archivos _MAP.md..."
while IFS= read -r file; do
    echo "  - Eliminando: $file"
    rm "$file"
    ((COUNT++))
done < <(find "$DOCS_DIR" -type f -name "_MAP.md")

# 2. Eliminar archivos de análisis en 04-planificacion/
echo ""
echo "2. Eliminando archivos de análisis..."
ANALISIS_FILES=(
    "$DOCS_DIR/04-planificacion/ANALISIS-COHERENCIA-DOCUMENTACION.md"
    "$DOCS_DIR/04-planificacion/ANALISIS_ENTREGABLES_Y_PLAN_ACCION.md"
    "$DOCS_DIR/04-planificacion/VALIDACION-ENTREGABLES-2.2.1.md"
    "$DOCS_DIR/04-planificacion/VALIDACION-MAPEO-DOCUMENTACION.md"
    "$DOCS_DIR/04-planificacion/VALIDACION-PROPUESTA-VS-IMPLEMENTACION.md"
    "$DOCS_DIR/04-planificacion/PLAN-ACCION-COMPLETITUD.md"
    "$DOCS_DIR/04-planificacion/features/ANALISIS-FEATURES-P3-ESTRATEGICAS.md"
)

for file in "${ANALISIS_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  - Eliminando: $file"
        rm "$file"
        ((COUNT++))
    fi
done

# 3. Eliminar archivos de proceso y metodología
echo ""
echo "3. Eliminando archivos de proceso..."
PROCESO_FILES=(
    "$DOCS_DIR/_MAP_TEMPLATE.md"
    "$DOCS_DIR/01-requerimientos/MODULARIZACION-RFC-0001.md"
    "$DOCS_DIR/standards/RESOLUTION-LOG.md"
    "$DOCS_DIR/02-especificaciones-tecnicas/testing-strategy/MODULARIZATION-REPORT.md"
)

for file in "${PROCESO_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  - Eliminando: $file"
        rm "$file"
        ((COUNT++))
    fi
done

# 4. Eliminar archivos de correcciones (revisar antes)
echo ""
echo "4. Eliminando archivos de correcciones..."
if [ -f "$DOCS_DIR/04-planificacion/correcciones/HISTORIAL-CAMBIOS.md" ]; then
    echo "  - Eliminando: HISTORIAL-CAMBIOS.md"
    rm "$DOCS_DIR/04-planificacion/correcciones/HISTORIAL-CAMBIOS.md"
    ((COUNT++))
fi

echo ""
echo "=========================================="
echo "LIMPIEZA COMPLETADA"
echo "=========================================="
echo "Total de archivos eliminados: $COUNT"
echo ""
echo "PRÓXIMOS PASOS MANUALES:"
echo "1. Revisar todos los archivos README.md (~60 archivos)"
echo "2. Revisar carpeta 04-planificacion/features/"
echo "3. Revisar carpeta 04-planificacion/metricas/"
echo "4. Verificar que no hay referencias rotas a archivos eliminados"
echo ""
echo "Para verificar archivos restantes:"
echo "  find $DOCS_DIR -type f -name '*.md' | wc -l"
echo ""
