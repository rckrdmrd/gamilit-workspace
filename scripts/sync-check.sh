#!/bin/bash
##############################################################################
# GAMILIT Platform - Sync Check Script
#
# Proposito: Verificar sincronizacion entre codigo y documentacion
# Version: 1.0
# Fecha: 2025-12-26
#
# Uso:
#   ./scripts/sync-check.sh              # Ejecutar todas las verificaciones
#   ./scripts/sync-check.sh --database   # Solo verificar database
#   ./scripts/sync-check.sh --backend    # Solo verificar backend
#   ./scripts/sync-check.sh --frontend   # Solo verificar frontend
#   ./scripts/sync-check.sh --report     # Generar reporte markdown
#
##############################################################################

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Rutas
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
INVENTORY_DIR="$PROJECT_ROOT/orchestration/inventarios"
REPORT_FILE="$PROJECT_ROOT/orchestration/sync-report-$(date +%Y%m%d).md"

# Contadores
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNINGS=0

# Opciones
CHECK_DATABASE=true
CHECK_BACKEND=true
CHECK_FRONTEND=true
GENERATE_REPORT=false

# ============================================================================
# FUNCIONES AUXILIARES
# ============================================================================

print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_check() {
    echo -e "  ${BLUE}▶${NC} $1"
}

print_pass() {
    echo -e "  ${GREEN}✓${NC} $1"
    ((PASSED_CHECKS++))
    ((TOTAL_CHECKS++))
}

print_fail() {
    echo -e "  ${RED}✗${NC} $1"
    ((FAILED_CHECKS++))
    ((TOTAL_CHECKS++))
}

print_warn() {
    echo -e "  ${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

# ============================================================================
# VERIFICACION DATABASE
# ============================================================================

check_database() {
    print_header "DATABASE SYNC CHECK"

    # Contar tablas en DDL
    print_check "Contando tablas en DDL..."
    local ddl_tables=$(find "$PROJECT_ROOT/apps/database/ddl/schemas" -name "*.sql" -path "*/tables/*" | wc -l)
    echo "    Tablas en DDL: $ddl_tables"

    # Verificar _MAP.md en cada schema
    print_check "Verificando _MAP.md en schemas..."
    local schemas_dir="$PROJECT_ROOT/apps/database/ddl/schemas"
    local schemas_with_map=0
    local schemas_total=0

    for schema_dir in "$schemas_dir"/*/; do
        if [ -d "$schema_dir" ]; then
            ((schemas_total++))
            if [ -f "${schema_dir}_MAP.md" ]; then
                ((schemas_with_map++))
            else
                print_warn "Falta _MAP.md en $(basename $schema_dir)"
            fi
        fi
    done

    if [ $schemas_with_map -eq $schemas_total ]; then
        print_pass "Todos los schemas tienen _MAP.md ($schemas_with_map/$schemas_total)"
    else
        print_fail "Schemas sin _MAP.md: $((schemas_total - schemas_with_map))/$schemas_total"
    fi

    # Verificar funciones
    print_check "Contando funciones..."
    local ddl_functions=$(find "$PROJECT_ROOT/apps/database/ddl/schemas" -name "*.sql" -path "*/functions/*" | wc -l)
    echo "    Funciones en DDL: $ddl_functions"

    # Verificar triggers
    print_check "Contando triggers..."
    local ddl_triggers=$(find "$PROJECT_ROOT/apps/database/ddl/schemas" -name "*.sql" -path "*/triggers/*" | wc -l)
    echo "    Triggers en DDL: $ddl_triggers"

    # Verificar inventario existe
    if [ -f "$INVENTORY_DIR/DATABASE_INVENTORY.yml" ]; then
        print_pass "DATABASE_INVENTORY.yml existe"
    else
        print_fail "DATABASE_INVENTORY.yml no encontrado"
    fi
}

# ============================================================================
# VERIFICACION BACKEND
# ============================================================================

check_backend() {
    print_header "BACKEND SYNC CHECK"

    local backend_dir="$PROJECT_ROOT/apps/backend/src"

    # Contar modulos
    print_check "Contando modulos..."
    local modules=$(find "$backend_dir/modules" -maxdepth 1 -type d | wc -l)
    modules=$((modules - 1))  # Excluir el directorio modules mismo
    echo "    Modulos en codigo: $modules"

    # Contar controllers
    print_check "Contando controllers..."
    local controllers=$(find "$backend_dir" -name "*.controller.ts" | wc -l)
    echo "    Controllers: $controllers"

    # Contar services
    print_check "Contando services..."
    local services=$(find "$backend_dir" -name "*.service.ts" | wc -l)
    echo "    Services: $services"

    # Contar entities
    print_check "Contando entities..."
    local entities=$(find "$backend_dir" -name "*.entity.ts" | wc -l)
    echo "    Entities: $entities"

    # Contar DTOs
    print_check "Contando DTOs..."
    local dtos=$(find "$backend_dir" -name "*.dto.ts" | wc -l)
    echo "    DTOs: $dtos"

    # Verificar inventario existe
    if [ -f "$INVENTORY_DIR/BACKEND_INVENTORY.yml" ]; then
        print_pass "BACKEND_INVENTORY.yml existe"
    else
        print_fail "BACKEND_INVENTORY.yml no encontrado"
    fi

    # Verificar documentacion API
    local api_docs_dir="$PROJECT_ROOT/docs/90-transversal/api"
    if [ -d "$api_docs_dir" ]; then
        local api_docs=$(find "$api_docs_dir" -name "API-*.md" | wc -l)
        echo "    Documentos API: $api_docs"
        if [ $api_docs -ge 3 ]; then
            print_pass "Documentacion API existe ($api_docs archivos)"
        else
            print_warn "Pocos documentos API ($api_docs archivos)"
        fi
    else
        print_fail "Directorio de documentacion API no encontrado"
    fi
}

# ============================================================================
# VERIFICACION FRONTEND
# ============================================================================

check_frontend() {
    print_header "FRONTEND SYNC CHECK"

    local frontend_dir="$PROJECT_ROOT/apps/frontend/src"

    # Contar componentes
    print_check "Contando componentes..."
    local components=$(find "$frontend_dir" -name "*.tsx" | wc -l)
    echo "    Componentes: $components"

    # Contar pages
    print_check "Contando pages..."
    local pages=$(find "$frontend_dir" -path "*/pages/*" -name "*.tsx" | wc -l)
    echo "    Pages: $pages"

    # Contar stores
    print_check "Contando stores Zustand..."
    local stores=$(find "$frontend_dir" -name "*Store.ts" -o -name "*store.ts" | wc -l)
    echo "    Stores: $stores"

    # Contar API services
    print_check "Contando API services..."
    local api_services=$(find "$frontend_dir/services/api" -name "*.ts" | wc -l)
    echo "    API Services: $api_services"

    # Contar mecanicas
    print_check "Contando mecanicas..."
    local mechanics=$(find "$frontend_dir/features/mechanics" -maxdepth 2 -type d | wc -l)
    echo "    Mecanicas (dirs): $mechanics"

    # Verificar inventario existe
    if [ -f "$INVENTORY_DIR/FRONTEND_INVENTORY.yml" ]; then
        print_pass "FRONTEND_INVENTORY.yml existe"
    else
        print_fail "FRONTEND_INVENTORY.yml no encontrado"
    fi

    # Verificar documentacion stores
    if [ -f "$PROJECT_ROOT/docs/frontend/architecture/STORES.md" ]; then
        print_pass "STORES.md existe"
    else
        print_warn "STORES.md no encontrado"
    fi

    # Verificar documentacion API services
    if [ -f "$PROJECT_ROOT/docs/frontend/API-SERVICES.md" ]; then
        print_pass "API-SERVICES.md existe"
    else
        print_warn "API-SERVICES.md no encontrado"
    fi
}

# ============================================================================
# GENERAR REPORTE
# ============================================================================

generate_report() {
    print_header "GENERANDO REPORTE"

    cat > "$REPORT_FILE" << EOF
# Sync Check Report

**Fecha:** $(date +%Y-%m-%d)
**Generado por:** sync-check.sh

---

## Resumen

| Metrica | Valor |
|---------|-------|
| Total verificaciones | $TOTAL_CHECKS |
| Pasadas | $PASSED_CHECKS |
| Fallidas | $FAILED_CHECKS |
| Advertencias | $WARNINGS |
| Tasa de exito | $(( PASSED_CHECKS * 100 / TOTAL_CHECKS ))% |

---

## Conteos Detectados

### Database
$(find "$PROJECT_ROOT/apps/database/ddl/schemas" -name "*.sql" -path "*/tables/*" | wc -l) tablas
$(find "$PROJECT_ROOT/apps/database/ddl/schemas" -name "*.sql" -path "*/functions/*" | wc -l) funciones
$(find "$PROJECT_ROOT/apps/database/ddl/schemas" -name "*.sql" -path "*/triggers/*" | wc -l) triggers

### Backend
$(find "$PROJECT_ROOT/apps/backend/src/modules" -maxdepth 1 -type d | wc -l) modulos
$(find "$PROJECT_ROOT/apps/backend/src" -name "*.controller.ts" | wc -l) controllers
$(find "$PROJECT_ROOT/apps/backend/src" -name "*.service.ts" | wc -l) services
$(find "$PROJECT_ROOT/apps/backend/src" -name "*.entity.ts" | wc -l) entities
$(find "$PROJECT_ROOT/apps/backend/src" -name "*.dto.ts" | wc -l) DTOs

### Frontend
$(find "$PROJECT_ROOT/apps/frontend/src" -name "*.tsx" | wc -l) componentes
$(find "$PROJECT_ROOT/apps/frontend/src" -path "*/pages/*" -name "*.tsx" | wc -l) pages
$(find "$PROJECT_ROOT/apps/frontend/src" -name "*Store.ts" -o -name "*store.ts" | wc -l) stores
$(find "$PROJECT_ROOT/apps/frontend/src/services/api" -name "*.ts" | wc -l) API services

---

*Generado automaticamente por sync-check.sh*
EOF

    print_pass "Reporte generado: $REPORT_FILE"
}

# ============================================================================
# RESUMEN FINAL
# ============================================================================

print_summary() {
    print_header "RESUMEN"

    echo ""
    echo -e "  Total verificaciones: $TOTAL_CHECKS"
    echo -e "  ${GREEN}Pasadas:${NC} $PASSED_CHECKS"
    echo -e "  ${RED}Fallidas:${NC} $FAILED_CHECKS"
    echo -e "  ${YELLOW}Advertencias:${NC} $WARNINGS"
    echo ""

    if [ $FAILED_CHECKS -eq 0 ]; then
        echo -e "  ${GREEN}✓ Sincronizacion OK${NC}"
    else
        echo -e "  ${RED}✗ Hay $FAILED_CHECKS problemas de sincronizacion${NC}"
    fi
    echo ""
}

# ============================================================================
# MAIN
# ============================================================================

main() {
    # Parsear argumentos
    while [[ $# -gt 0 ]]; do
        case $1 in
            --database)
                CHECK_BACKEND=false
                CHECK_FRONTEND=false
                shift
                ;;
            --backend)
                CHECK_DATABASE=false
                CHECK_FRONTEND=false
                shift
                ;;
            --frontend)
                CHECK_DATABASE=false
                CHECK_BACKEND=false
                shift
                ;;
            --report)
                GENERATE_REPORT=true
                shift
                ;;
            --help)
                echo "Uso: $0 [--database|--backend|--frontend] [--report]"
                exit 0
                ;;
            *)
                echo "Opcion desconocida: $1"
                exit 1
                ;;
        esac
    done

    print_header "GAMILIT Sync Check v1.0"
    echo "Verificando sincronizacion codigo <-> documentacion..."

    # Ejecutar verificaciones
    if [ "$CHECK_DATABASE" = true ]; then
        check_database
    fi

    if [ "$CHECK_BACKEND" = true ]; then
        check_backend
    fi

    if [ "$CHECK_FRONTEND" = true ]; then
        check_frontend
    fi

    # Generar reporte si se solicito
    if [ "$GENERATE_REPORT" = true ]; then
        generate_report
    fi

    # Mostrar resumen
    print_summary

    # Exit code basado en resultados
    if [ $FAILED_CHECKS -gt 0 ]; then
        exit 1
    fi
    exit 0
}

main "$@"
