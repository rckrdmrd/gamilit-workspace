#!/bin/bash
# Script para ejecutar tests del módulo Admin y generar reporte de coverage
# Fecha: 2024-12-05
# Objetivo: Aumentar coverage del módulo Admin a 50%+

echo "=================================================="
echo "GAMILIT - Tests Módulo Admin"
echo "=================================================="
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. FeatureFlagsService
echo -e "${BLUE}[1/3] Ejecutando tests: FeatureFlagsService${NC}"
npm test -- --testPathPattern=feature-flags.service.spec \
  --coverage \
  --collectCoverageFrom='src/modules/admin/services/feature-flags.service.ts' \
  --no-cache \
  --silent

echo ""

# 2. AdminReportsService
echo -e "${BLUE}[2/3] Ejecutando tests: AdminReportsService${NC}"
npm test -- --testPathPattern=admin-reports.service.spec \
  --coverage \
  --collectCoverageFrom='src/modules/admin/services/admin-reports.service.ts' \
  --no-cache \
  --silent

echo ""

# 3. AdminRolesService
echo -e "${BLUE}[3/3] Ejecutando tests: AdminRolesService${NC}"
npm test -- --testPathPattern=admin-roles.service.spec \
  --coverage \
  --collectCoverageFrom='src/modules/admin/services/admin-roles.service.ts' \
  --no-cache \
  --silent

echo ""

# 4. Coverage total del módulo admin
echo -e "${YELLOW}[COVERAGE] Generando reporte de coverage del módulo Admin completo${NC}"
npm test -- --testPathPattern=admin/__tests__ \
  --coverage \
  --collectCoverageFrom='src/modules/admin/**/*.service.ts' \
  --coverageDirectory='coverage/admin-module' \
  --no-cache

echo ""
echo -e "${GREEN}=================================================="
echo "Tests completados!"
echo "=================================================="
echo ""
echo "Revisar coverage en: coverage/admin-module/lcov-report/index.html"
echo -e "${NC}"
