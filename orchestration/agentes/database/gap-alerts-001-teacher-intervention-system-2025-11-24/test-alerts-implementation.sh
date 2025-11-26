#!/bin/bash
# ============================================================================
# Script de Testing: Sistema de Alertas de Intervención
# Fecha: 2025-11-24
# Autor: Database-Agent
# Epic: GAP-ALERTS-001
# ============================================================================
#
# PROPÓSITO:
#   Validar la implementación del sistema de alertas de intervención
#   sin necesidad de ejecutar en base de datos real.
#
# USO:
#   ./test-alerts-implementation.sh
#
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}============================================================================${NC}"
echo -e "${BLUE}VALIDACIÓN: Sistema de Alertas de Intervención${NC}"
echo -e "${BLUE}============================================================================${NC}"
echo ""

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR/../../../../"
DATABASE_DIR="$PROJECT_ROOT/apps/database"

echo -e "${YELLOW}1. Verificando existencia de archivos...${NC}"

# Verificar tabla
TABLE_FILE="$DATABASE_DIR/ddl/schemas/progress_tracking/tables/15-student_intervention_alerts.sql"
if [ -f "$TABLE_FILE" ]; then
    echo -e "${GREEN}✅ Tabla encontrada: 15-student_intervention_alerts.sql${NC}"
else
    echo -e "${RED}❌ ERROR: Archivo de tabla no encontrado${NC}"
    exit 1
fi

# Verificar función
FUNCTION_FILE="$DATABASE_DIR/ddl/schemas/progress_tracking/functions/15-generate_student_alerts.sql"
if [ -f "$FUNCTION_FILE" ]; then
    echo -e "${GREEN}✅ Función encontrada: 15-generate_student_alerts.sql${NC}"
else
    echo -e "${RED}❌ ERROR: Archivo de función no encontrado${NC}"
    exit 1
fi

# Verificar teacher_classrooms modificado
TEACHER_CLASSROOMS_FILE="$DATABASE_DIR/ddl/schemas/social_features/tables/teacher_classrooms.sql"
if [ -f "$TEACHER_CLASSROOMS_FILE" ]; then
    echo -e "${GREEN}✅ Tabla modificada encontrada: teacher_classrooms.sql${NC}"
else
    echo -e "${RED}❌ ERROR: Archivo teacher_classrooms.sql no encontrado${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}2. Validando contenido de tabla...${NC}"

# Validar CREATE TABLE
if grep -q "CREATE TABLE progress_tracking.student_intervention_alerts" "$TABLE_FILE"; then
    echo -e "${GREEN}✅ CREATE TABLE presente${NC}"
else
    echo -e "${RED}❌ ERROR: CREATE TABLE no encontrado${NC}"
    exit 1
fi

# Validar PRIMARY KEY
if grep -q "PRIMARY KEY" "$TABLE_FILE"; then
    echo -e "${GREEN}✅ PRIMARY KEY definida${NC}"
else
    echo -e "${RED}❌ ERROR: PRIMARY KEY no encontrada${NC}"
    exit 1
fi

# Validar RLS
if grep -q "ENABLE ROW LEVEL SECURITY" "$TABLE_FILE"; then
    echo -e "${GREEN}✅ RLS habilitado${NC}"
else
    echo -e "${RED}❌ ERROR: RLS no habilitado${NC}"
    exit 1
fi

# Contar policies
POLICY_COUNT=$(grep -c "CREATE POLICY" "$TABLE_FILE")
if [ "$POLICY_COUNT" -ge 3 ]; then
    echo -e "${GREEN}✅ Policies creadas: $POLICY_COUNT${NC}"
else
    echo -e "${RED}❌ ERROR: Se esperaban 3+ policies, encontradas: $POLICY_COUNT${NC}"
    exit 1
fi

# Contar índices
INDEX_COUNT=$(grep -c "CREATE INDEX" "$TABLE_FILE")
if [ "$INDEX_COUNT" -ge 8 ]; then
    echo -e "${GREEN}✅ Índices creados: $INDEX_COUNT${NC}"
else
    echo -e "${RED}❌ ERROR: Se esperaban 8+ índices, encontrados: $INDEX_COUNT${NC}"
    exit 1
fi

# Validar campos clave
CAMPOS=("student_id" "classroom_id" "alert_type" "severity" "status" "metrics" "tenant_id")
for campo in "${CAMPOS[@]}"; do
    if grep -q "$campo" "$TABLE_FILE"; then
        echo -e "${GREEN}✅ Campo '$campo' presente${NC}"
    else
        echo -e "${RED}❌ ERROR: Campo '$campo' no encontrado${NC}"
        exit 1
    fi
done

echo ""
echo -e "${YELLOW}3. Validando contenido de función...${NC}"

# Validar CREATE FUNCTION
if grep -q "CREATE OR REPLACE FUNCTION progress_tracking.generate_student_alerts()" "$FUNCTION_FILE"; then
    echo -e "${GREEN}✅ CREATE FUNCTION presente${NC}"
else
    echo -e "${RED}❌ ERROR: CREATE FUNCTION no encontrado${NC}"
    exit 1
fi

# Validar LANGUAGE plpgsql
if grep -q "LANGUAGE plpgsql" "$FUNCTION_FILE"; then
    echo -e "${GREEN}✅ LANGUAGE plpgsql definido${NC}"
else
    echo -e "${RED}❌ ERROR: LANGUAGE plpgsql no encontrado${NC}"
    exit 1
fi

# Validar SECURITY DEFINER
if grep -q "SECURITY DEFINER" "$FUNCTION_FILE"; then
    echo -e "${GREEN}✅ SECURITY DEFINER configurado${NC}"
else
    echo -e "${RED}❌ ERROR: SECURITY DEFINER no encontrado${NC}"
    exit 1
fi

# Contar tipos de alertas (INSERTs)
INSERT_COUNT=$(grep -c "INSERT INTO progress_tracking.student_intervention_alerts" "$FUNCTION_FILE")
if [ "$INSERT_COUNT" -ge 3 ]; then
    echo -e "${GREEN}✅ Tipos de alertas implementados: $INSERT_COUNT${NC}"
else
    echo -e "${RED}❌ ERROR: Se esperaban 3+ tipos de alertas, encontrados: $INSERT_COUNT${NC}"
    exit 1
fi

# Validar tipos de alerta específicos
ALERT_TYPES=("no_activity" "low_score" "repeated_failures")
for alert_type in "${ALERT_TYPES[@]}"; do
    if grep -q "'$alert_type'" "$FUNCTION_FILE"; then
        echo -e "${GREEN}✅ Tipo de alerta '$alert_type' implementado${NC}"
    else
        echo -e "${RED}❌ ERROR: Tipo de alerta '$alert_type' no encontrado${NC}"
        exit 1
    fi
done

echo ""
echo -e "${YELLOW}4. Validando modificación de teacher_classrooms...${NC}"

# Validar que tiene tenant_id
if grep -q "tenant_id UUID NOT NULL" "$TEACHER_CLASSROOMS_FILE"; then
    echo -e "${GREEN}✅ Campo tenant_id agregado${NC}"
else
    echo -e "${RED}❌ ERROR: Campo tenant_id no encontrado${NC}"
    exit 1
fi

# Validar FK constraint
if grep -q "teacher_classrooms_tenant_fkey" "$TEACHER_CLASSROOMS_FILE" || grep -q "FOREIGN KEY (tenant_id)" "$TEACHER_CLASSROOMS_FILE"; then
    echo -e "${GREEN}✅ FK constraint a tenants presente${NC}"
else
    echo -e "${RED}❌ ERROR: FK constraint no encontrada${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}5. Validando documentación...${NC}"

# Verificar archivos de documentación
DOC_FILES=(
    "$SCRIPT_DIR/01-ANALISIS.md"
    "$SCRIPT_DIR/02-IMPLEMENTACION.md"
    "$SCRIPT_DIR/REPORTE-FINAL-IMPLEMENTACION.md"
)

for doc_file in "${DOC_FILES[@]}"; do
    if [ -f "$doc_file" ]; then
        filename=$(basename "$doc_file")
        echo -e "${GREEN}✅ Documentación encontrada: $filename${NC}"
    else
        filename=$(basename "$doc_file")
        echo -e "${RED}❌ ERROR: Documentación no encontrada: $filename${NC}"
        exit 1
    fi
done

echo ""
echo -e "${YELLOW}6. Análisis de métricas...${NC}"

# Contar líneas de código SQL
TABLE_LINES=$(wc -l < "$TABLE_FILE")
FUNCTION_LINES=$(wc -l < "$FUNCTION_FILE")
TOTAL_SQL_LINES=$((TABLE_LINES + FUNCTION_LINES))

echo -e "${BLUE}📊 Métricas de código:${NC}"
echo -e "   - Líneas en tabla: $TABLE_LINES"
echo -e "   - Líneas en función: $FUNCTION_LINES"
echo -e "   - Total líneas SQL: $TOTAL_SQL_LINES"

# Contar comentarios SQL
COMMENT_COUNT=$(grep -c "COMMENT ON" "$TABLE_FILE")
echo -e "   - Comentarios SQL: $COMMENT_COUNT"

echo ""
echo -e "${GREEN}============================================================================${NC}"
echo -e "${GREEN}✅ VALIDACIÓN COMPLETA EXITOSA${NC}"
echo -e "${GREEN}============================================================================${NC}"
echo ""
echo -e "${BLUE}Resumen de implementación:${NC}"
echo -e "  ✅ Tabla student_intervention_alerts creada"
echo -e "  ✅ Función generate_student_alerts creada"
echo -e "  ✅ Tabla teacher_classrooms modificada"
echo -e "  ✅ $INDEX_COUNT índices implementados"
echo -e "  ✅ $POLICY_COUNT RLS policies implementadas"
echo -e "  ✅ $INSERT_COUNT tipos de alertas implementados"
echo -e "  ✅ Documentación completa (3 archivos)"
echo ""
echo -e "${YELLOW}⚠️  Próximo paso:${NC} Ejecutar carga limpia para validar en base de datos"
echo -e "   Comando: cd apps/database && ./drop-and-recreate-database.sh"
echo ""

exit 0
