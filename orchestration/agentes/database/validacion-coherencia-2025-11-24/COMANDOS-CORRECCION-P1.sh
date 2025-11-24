#!/bin/bash
# ============================================================================
# Script: Corrección ISSUE-P1-001 - Eliminar carpetas migrations
# Fecha: 2025-11-24
# Descripción: Resolver violación de Política de Carga Limpia
# ============================================================================
#
# ISSUE-P1-001: Existen carpetas migrations/ que violan DIRECTIVA-POLITICA-CARGA-LIMPIA.md
#
# Archivos encontrados:
# - apps/database/migrations/2025-11-24-backfill-module-progress.sql
# - apps/database/migrations/2025-11-24-test-initialize-user-stats.sql
# - apps/database/scripts/migrations/DB-126-add-soft-delete-classrooms.sql
# - apps/database/scripts/migrations/DB-131-fix-recent-activity-view.sql
#
# ============================================================================

set -e  # Exit on error
set -u  # Exit on undefined variable

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}============================================================================${NC}"
echo -e "${BLUE}CORRECCIÓN ISSUE-P1-001: Eliminar carpetas migrations${NC}"
echo -e "${BLUE}============================================================================${NC}"
echo ""

# Definir base directory
BASE_DIR="/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit"
DB_DIR="$BASE_DIR/apps/database"
DEPRECATED_DIR="$DB_DIR/_deprecated/migrations-removed-2025-11-24"

# ============================================================================
# PASO 1: Verificar estado actual
# ============================================================================

echo -e "${YELLOW}[PASO 1/5] Verificando estado actual...${NC}"
echo ""

echo "Carpetas migrations encontradas:"
find "$DB_DIR" -type d -name "migrations" 2>/dev/null || echo "  (ninguna)"
echo ""

echo "Archivos en migrations/:"
if [ -d "$DB_DIR/migrations" ]; then
    ls -lh "$DB_DIR/migrations/" 2>/dev/null || echo "  (vacío)"
else
    echo "  (carpeta no existe)"
fi
echo ""

echo "Archivos en scripts/migrations/:"
if [ -d "$DB_DIR/scripts/migrations" ]; then
    ls -lh "$DB_DIR/scripts/migrations/" 2>/dev/null || echo "  (vacío)"
else
    echo "  (carpeta no existe)"
fi
echo ""

# ============================================================================
# PASO 2: Crear carpeta _deprecated
# ============================================================================

echo -e "${YELLOW}[PASO 2/5] Creando carpeta _deprecated...${NC}"
mkdir -p "$DEPRECATED_DIR"
echo -e "${GREEN}✅ Carpeta creada: $DEPRECATED_DIR${NC}"
echo ""

# ============================================================================
# PASO 3: Mover archivos de migrations/
# ============================================================================

echo -e "${YELLOW}[PASO 3/5] Moviendo archivos de migrations/...${NC}"

if [ -d "$DB_DIR/migrations" ] && [ "$(ls -A $DB_DIR/migrations 2>/dev/null)" ]; then
    echo "Moviendo archivos de migrations/ a _deprecated/"
    mv "$DB_DIR/migrations"/* "$DEPRECATED_DIR/" 2>/dev/null || echo "  (sin archivos para mover)"

    # Verificar si la carpeta está vacía
    if [ ! "$(ls -A $DB_DIR/migrations 2>/dev/null)" ]; then
        echo "Eliminando carpeta migrations/ vacía"
        rmdir "$DB_DIR/migrations"
        echo -e "${GREEN}✅ Carpeta migrations/ eliminada${NC}"
    fi
else
    echo -e "${BLUE}ℹ️  Carpeta migrations/ no existe o está vacía${NC}"
fi
echo ""

# ============================================================================
# PASO 4: Mover archivos de scripts/migrations/
# ============================================================================

echo -e "${YELLOW}[PASO 4/5] Moviendo archivos de scripts/migrations/...${NC}"

if [ -d "$DB_DIR/scripts/migrations" ] && [ "$(ls -A $DB_DIR/scripts/migrations 2>/dev/null)" ]; then
    echo "Moviendo archivos de scripts/migrations/ a _deprecated/"
    mv "$DB_DIR/scripts/migrations"/* "$DEPRECATED_DIR/" 2>/dev/null || echo "  (sin archivos para mover)"

    # Verificar si la carpeta está vacía
    if [ ! "$(ls -A $DB_DIR/scripts/migrations 2>/dev/null)" ]; then
        echo "Eliminando carpeta scripts/migrations/ vacía"
        rmdir "$DB_DIR/scripts/migrations"
        echo -e "${GREEN}✅ Carpeta scripts/migrations/ eliminada${NC}"
    fi
else
    echo -e "${BLUE}ℹ️  Carpeta scripts/migrations/ no existe o está vacía${NC}"
fi
echo ""

# ============================================================================
# PASO 5: Verificar resultado
# ============================================================================

echo -e "${YELLOW}[PASO 5/5] Verificando resultado...${NC}"
echo ""

echo "Carpetas migrations restantes:"
REMAINING_MIGRATIONS=$(find "$DB_DIR" -type d -name "migrations" 2>/dev/null | wc -l)
if [ "$REMAINING_MIGRATIONS" -eq 0 ]; then
    echo -e "${GREEN}✅ No quedan carpetas migrations/${NC}"
else
    echo -e "${RED}❌ Aún existen $REMAINING_MIGRATIONS carpetas migrations/${NC}"
    find "$DB_DIR" -type d -name "migrations"
fi
echo ""

echo "Archivos movidos a _deprecated:"
if [ -d "$DEPRECATED_DIR" ]; then
    ls -lh "$DEPRECATED_DIR/" 2>/dev/null || echo "  (vacío)"
else
    echo "  (carpeta _deprecated no existe)"
fi
echo ""

# ============================================================================
# RESUMEN
# ============================================================================

echo -e "${BLUE}============================================================================${NC}"
echo -e "${BLUE}RESUMEN${NC}"
echo -e "${BLUE}============================================================================${NC}"
echo ""

if [ "$REMAINING_MIGRATIONS" -eq 0 ]; then
    echo -e "${GREEN}✅ ISSUE-P1-001 RESUELTO${NC}"
    echo ""
    echo "Acciones realizadas:"
    echo "  1. Archivos migrados a: $DEPRECATED_DIR"
    echo "  2. Carpetas migrations/ eliminadas"
    echo "  3. Política de Carga Limpia: CUMPLIDA"
    echo ""
    echo "Próximos pasos:"
    echo "  1. Validar recreación completa:"
    echo "     cd $DB_DIR"
    echo "     ./drop-and-recreate-database.sh"
    echo ""
    echo "  2. Crear ADR documentando la decisión:"
    echo "     docs/97-adr/ADR-012-removal-migrations-folders.md"
    echo ""
    echo "  3. Commitear cambios:"
    echo "     git add apps/database/"
    echo "     git commit -m 'fix(db): remove migrations folders to comply with Clean Load Policy'"
    echo ""
else
    echo -e "${RED}❌ ISSUE-P1-001 NO RESUELTO COMPLETAMENTE${NC}"
    echo ""
    echo "Carpetas migrations restantes: $REMAINING_MIGRATIONS"
    echo "Por favor, revisar manualmente."
fi

echo -e "${BLUE}============================================================================${NC}"

exit 0
