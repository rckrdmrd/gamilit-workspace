#!/bin/bash
# ============================================================================
# Script: Validación de Cobertura DDL
# Fecha: 2025-11-26
# Propósito: Verificar que todos los archivos DDL están cubiertos por create-database.sh
# ============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DDL_SCHEMAS="$SCRIPT_DIR/ddl/schemas"

echo -e "${BLUE}============================================================================${NC}"
echo -e "${BLUE}VALIDACIÓN DE COBERTURA DDL${NC}"
echo -e "${BLUE}============================================================================${NC}"
echo ""

# Contadores
TOTAL_FILES=0
UNCOVERED_FILES=0
WARNINGS=0

# Función para verificar cobertura
check_coverage() {
    local schema="$1"
    local subdir="$2"
    local covered="$3"

    local path="$DDL_SCHEMAS/$schema/$subdir"

    if [ ! -d "$path" ]; then
        return 0
    fi

    local file_count=$(find "$path" -maxdepth 1 -name "*.sql" -type f ! -path "*/_deprecated/*" ! -path "*/tests/*" 2>/dev/null | wc -l)

    if [ "$file_count" -eq 0 ]; then
        return 0
    fi

    TOTAL_FILES=$((TOTAL_FILES + file_count))

    if [ "$covered" = "yes" ]; then
        echo -e "${GREEN}✅${NC} $schema/$subdir ($file_count archivos)"
    else
        echo -e "${RED}❌${NC} $schema/$subdir ($file_count archivos) - NO CUBIERTO"
        UNCOVERED_FILES=$((UNCOVERED_FILES + file_count))
    fi
}

# Verificar prerequisitos
echo -e "${BLUE}=== ARCHIVOS PREREQUISITOS ===${NC}"
if [ -f "$SCRIPT_DIR/ddl/00-prerequisites.sql" ]; then
    echo -e "${GREEN}✅${NC} 00-prerequisites.sql"
else
    echo -e "${RED}❌${NC} 00-prerequisites.sql - NO EXISTE"
    UNCOVERED_FILES=$((UNCOVERED_FILES + 1))
fi

if [ -f "$SCRIPT_DIR/ddl/99-post-ddl-permissions.sql" ]; then
    echo -e "${GREEN}✅${NC} 99-post-ddl-permissions.sql"
else
    echo -e "${RED}❌${NC} 99-post-ddl-permissions.sql - NO EXISTE"
    UNCOVERED_FILES=$((UNCOVERED_FILES + 1))
fi
echo ""

# FASE 2: gamilit
echo -e "${BLUE}=== FASE 2: gamilit ===${NC}"
check_coverage "gamilit" "functions" "yes"
check_coverage "gamilit" "views" "yes"
echo ""

# FASE 3: auth
echo -e "${BLUE}=== FASE 3: auth ===${NC}"
check_coverage "auth" "enums" "yes"
check_coverage "auth" "tables" "yes"
check_coverage "auth" "functions" "yes"
check_coverage "auth" "views" "no"
echo ""

# FASE 4: storage
echo -e "${BLUE}=== FASE 4: storage ===${NC}"
check_coverage "storage" "enums" "yes"
echo ""

# FASE 5: auth_management
echo -e "${BLUE}=== FASE 5: auth_management ===${NC}"
check_coverage "auth_management" "tables" "yes"
check_coverage "auth_management" "functions" "yes"
check_coverage "auth_management" "triggers" "yes"
check_coverage "auth_management" "indexes" "yes"
check_coverage "auth_management" "rls-policies" "yes"
echo ""

# FASE 6: educational_content
echo -e "${BLUE}=== FASE 6: educational_content ===${NC}"
check_coverage "educational_content" "enums" "yes"
check_coverage "educational_content" "tables" "yes"
check_coverage "educational_content" "functions" "yes"
check_coverage "educational_content" "views" "yes"
check_coverage "educational_content" "triggers" "yes"
check_coverage "educational_content" "indexes" "yes"
check_coverage "educational_content" "rls-policies" "yes"
echo ""

# FASE 6.5: notifications (debe cargar ANTES de gamification por dependencia en triggers)
echo -e "${BLUE}=== FASE 6.5: notifications ===${NC}"
check_coverage "notifications" "tables" "yes"
check_coverage "notifications" "functions" "yes"
echo ""

# FASE 7: gamification_system
echo -e "${BLUE}=== FASE 7: gamification_system ===${NC}"
check_coverage "gamification_system" "enums" "yes"
check_coverage "gamification_system" "tables" "yes"
check_coverage "gamification_system" "functions" "yes"
check_coverage "gamification_system" "triggers" "yes"
check_coverage "gamification_system" "indexes" "yes"
check_coverage "gamification_system" "views" "yes"
check_coverage "gamification_system" "materialized-views" "yes"
check_coverage "gamification_system" "rls-policies" "yes"
echo ""

# FASE 8: progress_tracking
echo -e "${BLUE}=== FASE 8: progress_tracking ===${NC}"
check_coverage "progress_tracking" "enums" "yes"
check_coverage "progress_tracking" "tables" "yes"
check_coverage "progress_tracking" "functions" "yes"
check_coverage "progress_tracking" "triggers" "yes"
check_coverage "progress_tracking" "indexes" "yes"
check_coverage "progress_tracking" "views" "yes"
check_coverage "progress_tracking" "rls-policies" "yes"
echo ""

# FASE 9: social_features
echo -e "${BLUE}=== FASE 9: social_features ===${NC}"
check_coverage "social_features" "enums" "yes"
check_coverage "social_features" "tables" "yes"
check_coverage "social_features" "functions" "yes"
check_coverage "social_features" "triggers" "yes"
check_coverage "social_features" "rls-policies" "yes"
echo ""

# FASE 9.5: FK constraints
echo -e "${BLUE}=== FASE 9.5: FK Constraints ===${NC}"
check_coverage "auth_management" "fk-constraints" "yes"
echo ""

# NOTA: FASE 9.7 (notifications) movida a FASE 6.5 por dependencia con gamification triggers

# FASE 10: content_management
echo -e "${BLUE}=== FASE 10: content_management ===${NC}"
check_coverage "content_management" "enums" "yes"
check_coverage "content_management" "functions" "no"
check_coverage "content_management" "tables" "yes"
check_coverage "content_management" "triggers" "yes"
check_coverage "content_management" "indexes" "yes"
check_coverage "content_management" "rls-policies" "yes"
echo ""

# FASE 10.5: communication
echo -e "${BLUE}=== FASE 10.5: communication ===${NC}"
if [ -f "$DDL_SCHEMAS/communication/00-schema.sql" ]; then
    echo -e "${GREEN}✅${NC} communication/00-schema.sql"
else
    echo -e "${RED}❌${NC} communication/00-schema.sql - NO EXISTE"
    UNCOVERED_FILES=$((UNCOVERED_FILES + 1))
fi
check_coverage "communication" "tables" "yes"
echo ""

# FASE 11: audit_logging
echo -e "${BLUE}=== FASE 11: audit_logging ===${NC}"
check_coverage "audit_logging" "enums" "yes"
check_coverage "audit_logging" "tables" "yes"
check_coverage "audit_logging" "functions" "yes"
check_coverage "audit_logging" "triggers" "yes"
check_coverage "audit_logging" "indexes" "yes"
check_coverage "audit_logging" "rls-policies" "yes"
echo ""

# FASE 12: system_configuration
echo -e "${BLUE}=== FASE 12: system_configuration ===${NC}"
check_coverage "system_configuration" "functions" "no"
check_coverage "system_configuration" "tables" "yes"
check_coverage "system_configuration" "triggers" "yes"
check_coverage "system_configuration" "rls-policies" "yes"
echo ""

# FASE 13: admin_dashboard
echo -e "${BLUE}=== FASE 13: admin_dashboard ===${NC}"
check_coverage "admin_dashboard" "tables" "no"
check_coverage "admin_dashboard" "functions" "no"
check_coverage "admin_dashboard" "views" "yes"
echo ""

# FASE 14: lti_integration
echo -e "${BLUE}=== FASE 14: lti_integration ===${NC}"
check_coverage "lti_integration" "tables" "yes"
echo ""

# RESUMEN
echo -e "${BLUE}============================================================================${NC}"
echo -e "${BLUE}RESUMEN${NC}"
echo -e "${BLUE}============================================================================${NC}"
echo ""
echo -e "Total archivos SQL analizados: ${TOTAL_FILES}"
echo -e "Archivos cubiertos: $((TOTAL_FILES - UNCOVERED_FILES))"
echo -e "Archivos NO cubiertos: ${UNCOVERED_FILES}"
echo ""

if [ "$UNCOVERED_FILES" -eq 0 ]; then
    echo -e "${GREEN}✅ TODOS LOS ARCHIVOS DDL ESTÁN CUBIERTOS${NC}"
    echo ""
    exit 0
else
    COVERAGE_PERCENT=$(( (TOTAL_FILES - UNCOVERED_FILES) * 100 / TOTAL_FILES ))
    echo -e "${RED}⚠️  COBERTURA: ${COVERAGE_PERCENT}%${NC}"
    echo -e "${YELLOW}Se encontraron ${UNCOVERED_FILES} archivos NO cubiertos${NC}"
    echo ""
    echo -e "${YELLOW}Revisa el reporte completo en:${NC}"
    echo -e "  REPORTE-VALIDACION-DDL-COBERTURA-2025-11-26.md"
    echo ""
    exit 1
fi
