#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# SCRIPT: update-governance-indexes.sh
# ═══════════════════════════════════════════════════════════════════════════════
#
# Sistema: NEXUS v4.0 + Gobernanza de Documentación
# Proyecto: GAMILIT
# Propósito: Actualizar automáticamente los índices de gobernanza
#
# Uso: ./orchestration/scripts/update-governance-indexes.sh
#
# ═══════════════════════════════════════════════════════════════════════════════

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Directorio base del proyecto
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$PROJECT_ROOT"

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  ACTUALIZACIÓN DE ÍNDICES DE GOBERNANZA - GAMILIT${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# ─────────────────────────────────────────────────────────────────────────────────
# FUNCIÓN: Contar archivos
# ─────────────────────────────────────────────────────────────────────────────────
count_files() {
    local pattern=$1
    local path=$2
    find "$path" -name "$pattern" 2>/dev/null | wc -l | tr -d ' '
}

# ─────────────────────────────────────────────────────────────────────────────────
# RECOLECTAR ESTADÍSTICAS
# ─────────────────────────────────────────────────────────────────────────────────
echo -e "${YELLOW}[1/4] Recolectando estadísticas...${NC}"

# Documentación
MD_DOCS=$(count_files "*.md" "docs")
MD_ORCHESTRATION=$(count_files "*.md" "orchestration")
MD_CLAUDE=$(count_files "*.md" ".claude")
YML_ORCHESTRATION=$(count_files "*.yml" "orchestration")

# Tareas
TAREAS_EXISTENTES=$(find orchestration/analisis/tareas -maxdepth 1 -type d -name "TAREA-*" 2>/dev/null | wc -l | tr -d ' ')

# Trazas
TRAZAS_DOMINIO=$(find orchestration/trazas -name "TRAZA-TAREAS-*.md" 2>/dev/null | wc -l | tr -d ' ')
TRAZAS_AGENTE=$(find orchestration/trazas -name "TRAZA-AGENTE-*.md" 2>/dev/null | wc -l | tr -d ' ')

# Inventarios
INVENTARIOS=$(find orchestration/inventarios -name "*.yml" 2>/dev/null | wc -l | tr -d ' ')

# Análisis especializados
ANALISIS=$(find orchestration -maxdepth 1 -type d -name "analisis-*" 2>/dev/null | wc -l | tr -d ' ')

# Reportes
REPORTES=$(count_files "*.md" "orchestration/reportes")

echo -e "  ${GREEN}✓${NC} Estadísticas recolectadas"

# ─────────────────────────────────────────────────────────────────────────────────
# MOSTRAR ESTADÍSTICAS
# ─────────────────────────────────────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}[2/4] Estadísticas del proyecto:${NC}"
echo ""
echo "  ┌─────────────────────────────────────────────┐"
echo "  │ DOCUMENTACIÓN                               │"
echo "  ├─────────────────────────────────────────────┤"
printf "  │ MD en docs/:           %18s │\n" "$MD_DOCS"
printf "  │ MD en orchestration/:  %18s │\n" "$MD_ORCHESTRATION"
printf "  │ MD en .claude/:        %18s │\n" "$MD_CLAUDE"
printf "  │ YML en orchestration/: %18s │\n" "$YML_ORCHESTRATION"
echo "  ├─────────────────────────────────────────────┤"
echo "  │ GOBERNANZA                                  │"
echo "  ├─────────────────────────────────────────────┤"
printf "  │ Tareas documentadas:   %18s │\n" "$TAREAS_EXISTENTES"
printf "  │ Trazas por dominio:    %18s │\n" "$TRAZAS_DOMINIO"
printf "  │ Trazas por agente:     %18s │\n" "$TRAZAS_AGENTE"
printf "  │ Inventarios:           %18s │\n" "$INVENTARIOS"
printf "  │ Análisis especializados: %16s │\n" "$ANALISIS"
printf "  │ Reportes:              %18s │\n" "$REPORTES"
echo "  └─────────────────────────────────────────────┘"
echo ""

# ─────────────────────────────────────────────────────────────────────────────────
# VERIFICAR ÍNDICES
# ─────────────────────────────────────────────────────────────────────────────────
echo -e "${YELLOW}[3/4] Verificando índices de gobernanza...${NC}"

check_file() {
    local file=$1
    local name=$2
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✓${NC} $name existe"
        return 0
    else
        echo -e "  ${RED}✗${NC} $name NO existe"
        return 1
    fi
}

ERRORS=0

check_file "orchestration/analisis/tareas/_INDEX.yml" "_INDEX.yml (Tareas)" || ((ERRORS++))
check_file "orchestration/trazas/_INDEX.yml" "_INDEX.yml (Trazas)" || ((ERRORS++))
check_file "orchestration/MAPA-DOCUMENTACION-GAMILIT.yml" "MAPA-DOCUMENTACION-GAMILIT.yml" || ((ERRORS++))
check_file "orchestration/referencias/ALIASES-GOBERNANZA.yml" "ALIASES-GOBERNANZA.yml" || ((ERRORS++))
check_file "orchestration/analisis/tareas/_templates/METADATA-TEMPLATE.yml" "METADATA-TEMPLATE.yml" || ((ERRORS++))
check_file "orchestration/analisis/tareas/_templates/MAPEO-FASES.md" "MAPEO-FASES.md" || ((ERRORS++))

echo ""

# ─────────────────────────────────────────────────────────────────────────────────
# RESUMEN
# ─────────────────────────────────────────────────────────────────────────────────
echo -e "${YELLOW}[4/4] Resumen:${NC}"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "  ${GREEN}✓ Todos los índices de gobernanza están presentes${NC}"
    echo ""
    echo "  Archivos de gobernanza:"
    echo "  ─────────────────────────────────────────────"
    echo "  @INDICE-TAREAS     → orchestration/analisis/tareas/_INDEX.yml"
    echo "  @INDICE-TRAZAS     → orchestration/trazas/_INDEX.yml"
    echo "  @MAPA-DOC-GAMILIT  → orchestration/MAPA-DOCUMENTACION-GAMILIT.yml"
    echo "  @ALIASES           → orchestration/referencias/ALIASES-GOBERNANZA.yml"
    echo ""
else
    echo -e "  ${RED}✗ Faltan $ERRORS archivos de gobernanza${NC}"
    echo ""
    echo "  Ejecutar integración de gobernanza para crear archivos faltantes."
    exit 1
fi

# ─────────────────────────────────────────────────────────────────────────────────
# FECHA DE ACTUALIZACIÓN
# ─────────────────────────────────────────────────────────────────────────────────
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "  Última verificación: $(date '+%Y-%m-%d %H:%M:%S')"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
