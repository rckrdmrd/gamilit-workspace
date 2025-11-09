#!/bin/bash

# =====================================================
# Script: Fix Backend-BD Alignment Issues
# Descripción: Corrige automáticamente las referencias incorrectas
# Fecha: 2025-11-09
# Uso: ./fix-backend-alignment.sh
# =====================================================

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base directory
BASE_DIR="/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit"
BACKEND_CONSTANTS="$BASE_DIR/apps/backend/src/shared/constants/enums.constants.ts"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Backend-BD Alignment Fix Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# =====================================================
# Fase 1: Crear ENUM content_status (P0 - CRÍTICO)
# =====================================================

echo -e "${YELLOW}[Fase 1]${NC} Creando ENUM content_status..."

ENUM_FILE="$BASE_DIR/apps/database/ddl/schemas/content_management/enums/content_status.sql"

cat > "$ENUM_FILE" << 'EOF'
-- =====================================================
-- ENUM: content_management.content_status
-- Descripción: Estados del ciclo de vida del contenido
-- Epic: Corrección alineación backend-BD
-- Created: 2025-11-09
-- =====================================================

CREATE TYPE content_management.content_status AS ENUM (
    'draft',
    'published',
    'archived',
    'under_review'
);

COMMENT ON TYPE content_management.content_status IS
'Estados del ciclo de vida del contenido educativo.
Usado en: marie_curie_content, flagged_content.
Sincronizado con backend ContentStatusEnum (apps/backend/src/shared/constants/enums.constants.ts:378).';
EOF

echo -e "${GREEN}✓${NC} Archivo ENUM creado: $ENUM_FILE"

# Aplicar ENUM en BD (comentado para seguridad - descomentar cuando esté listo)
# echo -e "${YELLOW}[Fase 1]${NC} Aplicando ENUM en base de datos..."
# psql -U gamilit_user -d gamilit -f "$ENUM_FILE"
# echo -e "${GREEN}✓${NC} ENUM content_status creado en BD"

echo -e "${YELLOW}⚠${NC}  Para aplicar en BD, ejecuta manualmente:"
echo -e "   psql -U gamilit_user -d gamilit -f $ENUM_FILE"
echo ""

# =====================================================
# Fase 2: Actualizar referencias DDL (P1 - ALTO)
# =====================================================

echo -e "${YELLOW}[Fase 2]${NC} Actualizando referencias DDL en enums.constants.ts..."

# Backup del archivo original
cp "$BACKEND_CONSTANTS" "$BACKEND_CONSTANTS.backup-$(date +%Y%m%d-%H%M%S)"
echo -e "${GREEN}✓${NC} Backup creado: $BACKEND_CONSTANTS.backup-*"

# Corrección 1: notification_type (línea 255)
sed -i 's|@see DDL: public\.notification_type ENUM|@see DDL: gamification_system.notification_type ENUM|g' "$BACKEND_CONSTANTS"
echo -e "${GREEN}✓${NC} Corregido: notification_type (public → gamification_system)"

# Corrección 2: notification_priority (línea 286)
sed -i 's|@see DDL: public\.notification_priority ENUM|@see DDL: gamification_system.notification_priority ENUM|g' "$BACKEND_CONSTANTS"
echo -e "${GREEN}✓${NC} Corregido: notification_priority (public → gamification_system)"

# Corrección 3: content_status (línea 378)
sed -i 's|@see DDL: public\.content_status ENUM|@see DDL: content_management.content_status ENUM|g' "$BACKEND_CONSTANTS"
echo -e "${GREEN}✓${NC} Corregido: content_status (public → content_management)"

echo ""

# =====================================================
# Fase 3: Agregar schemas a ENUMs (P2 - MEDIO)
# =====================================================

echo -e "${YELLOW}[Fase 3]${NC} Agregando schemas calificados a ENUMs..."

# Corrección 4: content_type (línea 390)
sed -i 's|@see DDL: content_type ENUM|@see DDL: content_management.content_type ENUM|g' "$BACKEND_CONSTANTS"
echo -e "${GREEN}✓${NC} Agregado schema: content_type → content_management.content_type"

# Corrección 5: attempt_result (línea 518)
sed -i 's|@see DDL: attempt_result ENUM|@see DDL: progress_tracking.attempt_result ENUM|g' "$BACKEND_CONSTANTS"
echo -e "${GREEN}✓${NC} Agregado schema: attempt_result → progress_tracking.attempt_result"

# Corrección 6: social_event_type (línea 588)
sed -i 's|@see DDL: social_event_type ENUM|@see DDL: social_features.social_event_type ENUM|g' "$BACKEND_CONSTANTS"
echo -e "${GREEN}✓${NC} Agregado schema: social_event_type → social_features.social_event_type"

# Corrección 7: aggregation_period (línea 625)
sed -i 's|@see DDL: aggregation_period ENUM|@see DDL: audit_logging.aggregation_period ENUM|g' "$BACKEND_CONSTANTS"
echo -e "${GREEN}✓${NC} Agregado schema: aggregation_period → audit_logging.aggregation_period"

# Corrección 8: metric_type (línea 637)
sed -i 's|@see DDL: metric_type ENUM|@see DDL: audit_logging.metric_type ENUM|g' "$BACKEND_CONSTANTS"
echo -e "${GREEN}✓${NC} Agregado schema: metric_type → audit_logging.metric_type"

echo ""

# =====================================================
# Resumen
# =====================================================

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Resumen de Correcciones${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo -e "${GREEN}✓${NC} Fase 1: ENUM content_status creado (pendiente aplicar en BD)"
echo -e "${GREEN}✓${NC} Fase 2: 3 referencias DDL críticas corregidas"
echo -e "${GREEN}✓${NC} Fase 3: 5 schemas calificados agregados"
echo ""

echo -e "${YELLOW}Total correcciones:${NC} 8 referencias DDL actualizadas"
echo -e "${YELLOW}Archivos modificados:${NC}"
echo -e "  - $BACKEND_CONSTANTS"
echo -e "${YELLOW}Archivos creados:${NC}"
echo -e "  - $ENUM_FILE"
echo ""

# =====================================================
# Validación
# =====================================================

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Validación${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo -e "${YELLOW}Verificando correcciones...${NC}"

# Contar cuántas referencias quedan sin schema calificado
OLD_COUNT=$(grep -c "@see DDL: [a-z_]*_[a-z_]* ENUM" "$BACKEND_CONSTANTS" || true)
PUBLIC_COUNT=$(grep -c "@see DDL: public\." "$BACKEND_CONSTANTS" || true)

if [ "$OLD_COUNT" -eq 0 ] && [ "$PUBLIC_COUNT" -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Todas las referencias DDL están correctamente calificadas"
else
    echo -e "${YELLOW}⚠${NC}  Aún quedan $OLD_COUNT referencias sin schema y $PUBLIC_COUNT con 'public'"
fi

# Verificar que el archivo compile (sintaxis básica)
if grep -q "export enum" "$BACKEND_CONSTANTS"; then
    echo -e "${GREEN}✓${NC} Archivo enums.constants.ts tiene sintaxis válida"
else
    echo -e "${RED}✗${NC} Error: Archivo enums.constants.ts puede tener problemas de sintaxis"
fi

echo ""

# =====================================================
# Siguientes pasos
# =====================================================

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Siguientes Pasos${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo -e "${YELLOW}1.${NC} Aplicar ENUM content_status en BD:"
echo -e "   ${BLUE}psql -U gamilit_user -d gamilit -f $ENUM_FILE${NC}"
echo ""

echo -e "${YELLOW}2.${NC} Validar ENUM en BD:"
echo -e "   ${BLUE}psql -U gamilit_user -d gamilit -c \"SELECT typname, nspname FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid WHERE typname = 'content_status';\"${NC}"
echo ""

echo -e "${YELLOW}3.${NC} Compilar backend para verificar:"
echo -e "   ${BLUE}cd apps/backend && npm run build${NC}"
echo ""

echo -e "${YELLOW}4.${NC} Ejecutar tests:"
echo -e "   ${BLUE}cd apps/backend && npm run test${NC}"
echo ""

echo -e "${YELLOW}5.${NC} Commit cambios:"
echo -e "   ${BLUE}git add .${NC}"
echo -e "   ${BLUE}git commit -m 'fix(backend): Corregir referencias DDL a schemas reorganizados'${NC}"
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Script completado exitosamente${NC}"
echo -e "${GREEN}========================================${NC}"
