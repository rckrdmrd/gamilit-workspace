#!/bin/bash

###############################################################################
# Script de Validación: Tipos Centralizados de Intervention Alerts
###############################################################################
# Fecha: 2025-11-24
# Descripción: Valida que los tipos de Intervention Alerts estén correctamente
#              centralizados y no haya duplicación de enums.
###############################################################################

set -e

echo "========================================================================"
echo "VALIDACIÓN: Tipos Centralizados de Intervention Alerts"
echo "========================================================================"
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de errores
ERRORS=0

###############################################################################
# 1. Verificar que el archivo centralizado existe
###############################################################################
echo "[1/5] Verificando archivo centralizado..."

if [ -f "src/shared/types/intervention-alerts.types.ts" ]; then
    echo -e "${GREEN}✅ Archivo centralizado existe${NC}"
else
    echo -e "${RED}❌ ERROR: Archivo centralizado no encontrado${NC}"
    ERRORS=$((ERRORS + 1))
fi

###############################################################################
# 2. Verificar que se exporta desde index.ts
###############################################################################
echo ""
echo "[2/5] Verificando exportación desde index.ts..."

if grep -q "intervention-alerts.types" "src/shared/types/index.ts"; then
    echo -e "${GREEN}✅ Exportado correctamente desde index.ts${NC}"
else
    echo -e "${RED}❌ ERROR: No se exporta desde index.ts${NC}"
    ERRORS=$((ERRORS + 1))
fi

###############################################################################
# 3. Verificar que NO hay definiciones duplicadas en DTO
###############################################################################
echo ""
echo "[3/5] Verificando que DTO no tiene definiciones duplicadas..."

# Buscar definiciones de enum en DTO (solo debe tener imports)
DTO_FILE="src/modules/teacher/dto/intervention-alerts.dto.ts"

if grep -q "^export enum AlertType" "$DTO_FILE"; then
    echo -e "${RED}❌ ERROR: DTO tiene definición local de AlertType (debe ser import)${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ DTO no tiene definición duplicada de AlertType${NC}"
fi

if grep -q "^export enum AlertSeverity" "$DTO_FILE"; then
    echo -e "${RED}❌ ERROR: DTO tiene definición local de AlertSeverity${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ DTO no tiene definición duplicada de AlertSeverity${NC}"
fi

if grep -q "^export enum AlertStatus" "$DTO_FILE"; then
    echo -e "${RED}❌ ERROR: DTO tiene definición local de AlertStatus${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ DTO no tiene definición duplicada de AlertStatus${NC}"
fi

###############################################################################
# 4. Verificar que NO hay definiciones duplicadas en Entity
###############################################################################
echo ""
echo "[4/5] Verificando que Entity no tiene definiciones duplicadas..."

ENTITY_FILE="src/modules/teacher/entities/student-intervention-alert.entity.ts"

if grep -q "^export enum AlertType" "$ENTITY_FILE"; then
    echo -e "${RED}❌ ERROR: Entity tiene definición local de AlertType${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ Entity no tiene definición duplicada de AlertType${NC}"
fi

if grep -q "^export enum AlertSeverity" "$ENTITY_FILE"; then
    echo -e "${RED}❌ ERROR: Entity tiene definición local de AlertSeverity${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ Entity no tiene definición duplicada de AlertSeverity${NC}"
fi

if grep -q "^export enum AlertStatus" "$ENTITY_FILE"; then
    echo -e "${RED}❌ ERROR: Entity tiene definición local de AlertStatus${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ Entity no tiene definición duplicada de AlertStatus${NC}"
fi

###############################################################################
# 5. Verificar compilación TypeScript sin errores de alertas
###############################################################################
echo ""
echo "[5/5] Verificando compilación TypeScript..."

# Compilar y buscar errores relacionados con alertas
ALERT_ERRORS=$(npx tsc --noEmit 2>&1 | grep -i "alert" | wc -l)

if [ "$ALERT_ERRORS" -eq 0 ]; then
    echo -e "${GREEN}✅ No hay errores de compilación relacionados con alertas${NC}"
else
    echo -e "${RED}❌ ERROR: Hay $ALERT_ERRORS errores relacionados con alertas${NC}"
    ERRORS=$((ERRORS + 1))
fi

###############################################################################
# Resumen final
###############################################################################
echo ""
echo "========================================================================"

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ VALIDACIÓN EXITOSA${NC}"
    echo "Todos los tipos de Intervention Alerts están correctamente centralizados."
    exit 0
else
    echo -e "${RED}❌ VALIDACIÓN FALLIDA${NC}"
    echo "Se encontraron $ERRORS errores."
    echo ""
    echo "Acción requerida:"
    echo "1. Revisar los errores anteriores"
    echo "2. Corregir las duplicaciones o imports faltantes"
    echo "3. Ejecutar este script nuevamente"
    exit 1
fi
