#!/bin/bash

# Script de Validacion Post-Fixes
# Verifica que los critical fixes se hayan aplicado correctamente
#
# Uso: ./validate-fixes.sh
# Exit codes:
#   0 = Todos los checks pasaron
#   1 = Uno o mas checks fallaron

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

# Helper functions
pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASSED++))
}

fail() {
    echo -e "${RED}✗${NC} $1"
    ((FAILED++))
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

header() {
    echo ""
    echo "========================================"
    echo "$1"
    echo "========================================"
}

# ============================================================================
# CHECK 1: AssignmentsController prefix
# ============================================================================

header "CHECK 1: AssignmentsController Prefix"

ASSIGNMENTS_CONTROLLER="apps/backend/src/modules/assignments/controllers/assignments.controller.ts"

if [ ! -f "$ASSIGNMENTS_CONTROLLER" ]; then
    fail "AssignmentsController file not found"
else
    # Check for incorrect 'api/teacher/assignments'
    if grep -q "@Controller('api/teacher/assignments')" "$ASSIGNMENTS_CONTROLLER"; then
        fail "AssignmentsController still has hardcoded 'api/' prefix"
        echo "   Expected: @Controller('teacher/assignments')"
        echo "   Found:    @Controller('api/teacher/assignments')"
    else
        pass "AssignmentsController prefix is correct"
    fi

    # Check that guards are uncommented
    if grep -q "// @UseGuards(JwtAuthGuard" "$ASSIGNMENTS_CONTROLLER"; then
        warn "JwtAuthGuard is still commented out (security issue)"
    else
        pass "Guards are active (security OK)"
    fi
fi

# ============================================================================
# CHECK 2: api-endpoints.ts environment variable
# ============================================================================

header "CHECK 2: Frontend api-endpoints.ts"

API_ENDPOINTS="apps/frontend/src/shared/constants/api-endpoints.ts"

if [ ! -f "$API_ENDPOINTS" ]; then
    fail "api-endpoints.ts file not found"
else
    # Check for incorrect VITE_API_BASE_URL
    if grep -q "VITE_API_BASE_URL" "$API_ENDPOINTS"; then
        fail "api-endpoints.ts still uses VITE_API_BASE_URL"
        echo "   Should use: VITE_API_URL"
    else
        pass "Using correct environment variable (VITE_API_URL)"
    fi

    # Check for incorrect port 3000
    if grep -q "localhost:3000" "$API_ENDPOINTS"; then
        fail "api-endpoints.ts still references port 3000"
        echo "   Should use: localhost:3006"
    else
        pass "Using correct port (3006)"
    fi

    # Check for hardcoded /api/v1
    if grep -q "/api/v1" "$API_ENDPOINTS"; then
        fail "api-endpoints.ts still has hardcoded /api/v1"
        echo "   Should use: /api (without version)"
    else
        pass "No hardcoded API version"
    fi
fi

# ============================================================================
# CHECK 3: Multiple axios instances
# ============================================================================

header "CHECK 3: Axios Instances"

AXIOS_INSTANCES=$(find apps/frontend/src -name "*.ts" -type f -exec grep -l "axios.create" {} \; 2>/dev/null | wc -l)

echo "Found $AXIOS_INSTANCES axios instances"

if [ "$AXIOS_INSTANCES" -gt 1 ]; then
    warn "Multiple axios instances detected ($AXIOS_INSTANCES)"
    echo "   Files:"
    find apps/frontend/src -name "*.ts" -type f -exec grep -l "axios.create" {} \; 2>/dev/null | sed 's/^/   - /'
    echo "   Target: 1 instance (in services/api/apiClient.ts)"
else
    pass "Single axios instance (unified)"
fi

# ============================================================================
# CHECK 4: fetch() usage
# ============================================================================

header "CHECK 4: Direct fetch() Calls"

FETCH_COUNT=$(grep -r "fetch(" apps/frontend/src --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "// @allowed-fetch" | grep -v ".test.ts" | grep -v ".spec.ts" | wc -l)

echo "Found $FETCH_COUNT fetch() calls"

if [ "$FETCH_COUNT" -gt 0 ]; then
    warn "Direct fetch() calls detected ($FETCH_COUNT)"
    echo "   Should use apiClient instead"
    echo "   First 10 occurrences:"
    grep -rn "fetch(" apps/frontend/src --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "// @allowed-fetch" | grep -v ".test.ts" | head -10 | sed 's/^/   /'
else
    pass "No direct fetch() calls (using apiClient)"
fi

# ============================================================================
# CHECK 5: Hardcoded controllers
# ============================================================================

header "CHECK 5: Backend Controller Patterns"

# Check MissionsController
MISSIONS_CONTROLLER="apps/backend/src/modules/gamification/controllers/missions.controller.ts"
if [ -f "$MISSIONS_CONTROLLER" ]; then
    if grep -q "@Controller('gamification/missions')" "$MISSIONS_CONTROLLER"; then
        warn "MissionsController still hardcodes path"
        echo "   Should use: extractBasePath(API_ROUTES.GAMIFICATION.BASE)"
    else
        pass "MissionsController uses helper pattern"
    fi
fi

# Check RanksController
RANKS_CONTROLLER="apps/backend/src/modules/gamification/controllers/ranks.controller.ts"
if [ -f "$RANKS_CONTROLLER" ]; then
    if grep -q "@Controller('gamification/ranks')" "$RANKS_CONTROLLER"; then
        warn "RanksController still hardcodes path"
    else
        pass "RanksController uses helper pattern"
    fi
fi

# Check ComodinesController
COMODINES_CONTROLLER="apps/backend/src/modules/gamification/controllers/comodines.controller.ts"
if [ -f "$COMODINES_CONTROLLER" ]; then
    if grep -q "@Controller('gamification/comodines')" "$COMODINES_CONTROLLER"; then
        warn "ComodinesController still hardcodes path"
    else
        pass "ComodinesController uses helper pattern"
    fi
fi

# ============================================================================
# CHECK 6: Environment files
# ============================================================================

header "CHECK 6: Environment Configuration"

FRONTEND_ENV="apps/frontend/.env"

if [ ! -f "$FRONTEND_ENV" ]; then
    fail ".env file not found"
else
    # Check that VITE_API_URL is defined
    if grep -q "^VITE_API_URL=" "$FRONTEND_ENV"; then
        pass "VITE_API_URL is defined in .env"

        # Show the value
        API_URL=$(grep "^VITE_API_URL=" "$FRONTEND_ENV" | cut -d '=' -f2)
        echo "   Value: $API_URL"

        # Check if it points to correct port
        if echo "$API_URL" | grep -q "3006"; then
            pass "Points to correct port (3006)"
        else
            warn "May be pointing to incorrect port"
        fi
    else
        fail "VITE_API_URL not defined in .env"
    fi

    # Check that VITE_API_BASE_URL is NOT defined (deprecated)
    if grep -q "^VITE_API_BASE_URL=" "$FRONTEND_ENV"; then
        warn "Deprecated VITE_API_BASE_URL found in .env"
        echo "   Should remove this variable"
    else
        pass "No deprecated variables in .env"
    fi
fi

# ============================================================================
# CHECK 7: Tenant header consistency
# ============================================================================

header "CHECK 7: Tenant Header Consistency"

# Check for X-Tenant-Id (incorrect case)
TENANT_ID_LOWERCASE=$(grep -r "X-Tenant-Id" apps/frontend/src --include="*.ts" 2>/dev/null | wc -l)

if [ "$TENANT_ID_LOWERCASE" -gt 0 ]; then
    warn "Found X-Tenant-Id (should be X-Tenant-ID)"
    grep -rn "X-Tenant-Id" apps/frontend/src --include="*.ts" 2>/dev/null | head -5 | sed 's/^/   /'
else
    pass "Tenant header case is consistent (X-Tenant-ID)"
fi

# ============================================================================
# CHECK 8: Build validation
# ============================================================================

header "CHECK 8: Build Validation"

echo "Testing backend build..."
if cd apps/backend && npm run build --silent 2>&1 | grep -q "successfully"; then
    pass "Backend builds successfully"
    cd ../..
else
    fail "Backend build failed"
    cd ../..
fi

echo "Testing frontend build..."
if cd apps/frontend && npm run build --silent 2>&1; then
    pass "Frontend builds successfully"
    cd ../..
else
    fail "Frontend build failed"
    cd ../..
fi

# ============================================================================
# SUMMARY
# ============================================================================

header "VALIDATION SUMMARY"

TOTAL=$((PASSED + FAILED))

echo "Total checks: $TOTAL"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"

if [ "$FAILED" -eq 0 ]; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}   ALL CHECKS PASSED ✓${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    exit 0
else
    echo ""
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}   SOME CHECKS FAILED ✗${NC}"
    echo -e "${RED}========================================${NC}"
    echo ""
    echo "Review the failed checks above and apply necessary fixes."
    echo "Refer to QUICK-FIXES.md for detailed instructions."
    exit 1
fi
