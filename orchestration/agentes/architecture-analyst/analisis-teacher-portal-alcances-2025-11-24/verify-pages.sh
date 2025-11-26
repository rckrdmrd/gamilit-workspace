#!/bin/bash

# Script de Verificación - Teacher Portal Pages
# Fecha: 2025-11-24
# Propósito: Verificar estado de páginas y componentes UnderConstruction

echo "=================================="
echo "VERIFICACIÓN TEACHER PORTAL PAGES"
echo "=================================="
echo ""

BASE_DIR="apps/frontend/src/apps/teacher/pages"
COMPONENT_DIR="apps/frontend/src/shared/components/common"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar que estamos en la raíz del proyecto
if [ ! -d "$BASE_DIR" ]; then
  echo -e "${RED}❌ ERROR: No se encontró el directorio $BASE_DIR${NC}"
  echo "Por favor ejecute este script desde la raíz del proyecto gamilit."
  exit 1
fi

echo -e "${BLUE}📁 Directorio base: $BASE_DIR${NC}"
echo ""

# Lista de páginas a verificar
declare -a PAGES_TO_CHECK=(
  "TeacherCommunicationPage"
  "TeacherResourcesPage"
  "TeacherContentPage"
  "TeacherContentManagement"
  "TeacherGamificationPage"
  "TeacherAlertsPage"
)

# Contadores
TOTAL=0
EXISTS=0
HAS_UNDERCONSTRUCTION=0
MISSING_UNDERCONSTRUCTION=0
NOT_FOUND=0

echo "─────────────────────────────────────────────────────────"
echo "VERIFICACIÓN DE PÁGINAS FUERA DEL ALCANCE INICIAL"
echo "─────────────────────────────────────────────────────────"
echo ""

for page in "${PAGES_TO_CHECK[@]}"; do
  ((TOTAL++))
  file="$BASE_DIR/${page}.tsx"

  echo -e "${BLUE}Verificando: ${page}${NC}"

  if [ -f "$file" ]; then
    ((EXISTS++))
    echo -e "  ${GREEN}✅ Archivo existe:${NC} $file"

    # Verificar si tiene UnderConstruction
    if grep -q "UnderConstruction" "$file"; then
      ((HAS_UNDERCONSTRUCTION++))
      echo -e "  ${GREEN}✅ Tiene componente UnderConstruction${NC}"

      # Extraer el featureName si es posible
      FEATURE_NAME=$(grep -oP 'featureName="\K[^"]+' "$file" | head -1)
      if [ -n "$FEATURE_NAME" ]; then
        echo -e "  ${BLUE}ℹ️  Feature Name: $FEATURE_NAME${NC}"
      fi
    else
      ((MISSING_UNDERCONSTRUCTION++))
      echo -e "  ${YELLOW}⚠️  NO tiene UnderConstruction${NC}"
      echo -e "  ${RED}❌ ACCIÓN REQUERIDA: Agregar componente UnderConstruction${NC}"
    fi
  else
    ((NOT_FOUND++))
    echo -e "  ${RED}❌ Archivo NO existe${NC}"
    echo -e "  ${YELLOW}ℹ️  Si esta funcionalidad no está planeada, ignorar${NC}"
  fi

  echo ""
done

echo "─────────────────────────────────────────────────────────"
echo "RESUMEN DE VERIFICACIÓN"
echo "─────────────────────────────────────────────────────────"
echo ""
echo -e "Total de páginas verificadas:       ${BLUE}$TOTAL${NC}"
echo -e "Páginas que existen:                ${GREEN}$EXISTS${NC}"
echo -e "Páginas con UnderConstruction:      ${GREEN}$HAS_UNDERCONSTRUCTION${NC}"
echo -e "Páginas SIN UnderConstruction:      ${YELLOW}$MISSING_UNDERCONSTRUCTION${NC}"
echo -e "Páginas que no existen:             ${RED}$NOT_FOUND${NC}"
echo ""

if [ $MISSING_UNDERCONSTRUCTION -gt 0 ]; then
  echo -e "${RED}❌ ACCIÓN REQUERIDA:${NC}"
  echo "Hay $MISSING_UNDERCONSTRUCTION página(s) que existen pero NO tienen UnderConstruction"
  echo ""
  echo "Para agregar UnderConstruction, importar el componente:"
  echo ""
  echo -e "${BLUE}import { UnderConstruction } from '@/shared/components/common/UnderConstruction';${NC}"
  echo ""
  echo "Y reemplazar el contenido con:"
  echo ""
  echo -e "${BLUE}<UnderConstruction"
  echo "  featureName=\"Nombre de la Funcionalidad\""
  echo "  description=\"Descripción breve\""
  echo "  estimatedDate=\"Fase 3 - Post-MVP\""
  echo "  upcomingFeatures={[...]}"
  echo "/>${NC}"
  echo ""
fi

if [ $HAS_UNDERCONSTRUCTION -eq $EXISTS ] && [ $EXISTS -gt 0 ]; then
  echo -e "${GREEN}✅ ÉXITO: Todas las páginas existentes tienen UnderConstruction${NC}"
elif [ $EXISTS -eq 0 ]; then
  echo -e "${YELLOW}ℹ️  INFO: Ninguna de las páginas verificadas existe aún${NC}"
  echo "   Esto puede ser correcto si esas funcionalidades no están planeadas."
fi

echo ""
echo "─────────────────────────────────────────────────────────"
echo "VERIFICACIÓN DE COMPONENTE UNDERCONSTRUCTION"
echo "─────────────────────────────────────────────────────────"
echo ""

UNDERCONSTRUCTION_FILE="$COMPONENT_DIR/UnderConstruction.tsx"

if [ -f "$UNDERCONSTRUCTION_FILE" ]; then
  echo -e "${GREEN}✅ Componente UnderConstruction existe${NC}"
  echo -e "   Ubicación: $UNDERCONSTRUCTION_FILE"

  # Verificar exports
  if grep -q "export.*UnderConstruction" "$UNDERCONSTRUCTION_FILE"; then
    echo -e "${GREEN}✅ Componente está exportado correctamente${NC}"
  else
    echo -e "${YELLOW}⚠️  Verificar export del componente${NC}"
  fi
else
  echo -e "${RED}❌ ERROR: Componente UnderConstruction NO existe${NC}"
  echo "   Ubicación esperada: $UNDERCONSTRUCTION_FILE"
  echo ""
  echo -e "${RED}ACCIÓN CRÍTICA: Crear el componente UnderConstruction${NC}"
fi

echo ""
echo "=================================="
echo "FIN DE LA VERIFICACIÓN"
echo "=================================="
echo ""

# Exit code basado en resultado
if [ $MISSING_UNDERCONSTRUCTION -gt 0 ]; then
  exit 1  # Hay páginas sin UnderConstruction
elif [ ! -f "$UNDERCONSTRUCTION_FILE" ]; then
  exit 2  # Componente UnderConstruction no existe
else
  exit 0  # Todo OK
fi
