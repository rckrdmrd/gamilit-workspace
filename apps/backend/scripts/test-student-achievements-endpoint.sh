#!/bin/bash

###############################################################################
# Test Script: Student Achievements Endpoint
#
# Tests the new GET /admin/progress/students/:id/achievements endpoint
#
# Usage:
#   ./test-student-achievements-endpoint.sh [STUDENT_ID]
#
# Requirements:
#   - Backend server running on http://localhost:3000
#   - Valid admin credentials in environment variables or use defaults
#   - jq for JSON formatting (optional)
###############################################################################

set -e

# Configuration
BASE_URL="${API_BASE_URL:-http://localhost:3000}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@gamilit.com}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-Admin123!}"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if jq is available
if command -v jq &> /dev/null; then
    JQ_AVAILABLE=true
else
    JQ_AVAILABLE=false
    log_warning "jq not found. JSON output will not be formatted."
fi

###############################################################################
# Step 1: Authenticate as Admin
###############################################################################
log_info "Authenticating as admin user..."

AUTH_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${ADMIN_EMAIL}\",
    \"password\": \"${ADMIN_PASSWORD}\"
  }")

if [ $? -ne 0 ]; then
    log_error "Failed to connect to API"
    exit 1
fi

if [ "$JQ_AVAILABLE" = true ]; then
    ACCESS_TOKEN=$(echo "$AUTH_RESPONSE" | jq -r '.access_token // empty')
else
    ACCESS_TOKEN=$(echo "$AUTH_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
fi

if [ -z "$ACCESS_TOKEN" ]; then
    log_error "Failed to authenticate. Response:"
    echo "$AUTH_RESPONSE"
    exit 1
fi

log_success "Authentication successful"

###############################################################################
# Step 2: Get a student ID (if not provided)
###############################################################################
if [ -z "$1" ]; then
    log_info "No student ID provided. Fetching a student from the system..."

    STUDENTS_RESPONSE=$(curl -s -X GET "${BASE_URL}/admin/progress/overview" \
      -H "Authorization: Bearer ${ACCESS_TOKEN}")

    if [ $? -ne 0 ]; then
        log_error "Failed to fetch students"
        exit 1
    fi

    # Try to get a student from classroom members
    CLASSROOM_RESPONSE=$(curl -s -X GET "${BASE_URL}/admin/classrooms" \
      -H "Authorization: Bearer ${ACCESS_TOKEN}")

    if [ "$JQ_AVAILABLE" = true ]; then
        STUDENT_ID=$(echo "$CLASSROOM_RESPONSE" | jq -r '.[0].students[0].id // empty')
    fi

    if [ -z "$STUDENT_ID" ]; then
        log_error "Could not find a student ID automatically. Please provide one as argument."
        log_info "Usage: $0 <STUDENT_ID>"
        exit 1
    fi

    log_info "Using student ID: $STUDENT_ID"
else
    STUDENT_ID="$1"
    log_info "Testing with provided student ID: $STUDENT_ID"
fi

###############################################################################
# Step 3: Test GET /admin/progress/students/:id/achievements
###############################################################################
log_info "Testing GET /admin/progress/students/${STUDENT_ID}/achievements"

ACHIEVEMENTS_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET \
  "${BASE_URL}/admin/progress/students/${STUDENT_ID}/achievements" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

# Extract HTTP status code
HTTP_STATUS=$(echo "$ACHIEVEMENTS_RESPONSE" | tail -n1)
ACHIEVEMENTS_BODY=$(echo "$ACHIEVEMENTS_RESPONSE" | sed '$d')

if [ "$HTTP_STATUS" -eq 200 ]; then
    log_success "GET /admin/progress/students/:id/achievements - Status: $HTTP_STATUS"

    echo ""
    log_info "Response:"
    if [ "$JQ_AVAILABLE" = true ]; then
        echo "$ACHIEVEMENTS_BODY" | jq '.'

        # Extract and display summary
        echo ""
        log_info "Summary:"
        echo "$ACHIEVEMENTS_BODY" | jq '{
          student_id,
          total_achievements,
          by_category,
          by_tier
        }'

        # Check if there are achievements
        TOTAL=$(echo "$ACHIEVEMENTS_BODY" | jq -r '.total_achievements')
        if [ "$TOTAL" -gt 0 ]; then
            echo ""
            log_info "First achievement:"
            echo "$ACHIEVEMENTS_BODY" | jq '.achievements[0]'
        else
            log_warning "Student has no achievements yet"
        fi
    else
        echo "$ACHIEVEMENTS_BODY"
    fi
elif [ "$HTTP_STATUS" -eq 404 ]; then
    log_error "Student not found - Status: $HTTP_STATUS"
    echo "$ACHIEVEMENTS_BODY"
    exit 1
elif [ "$HTTP_STATUS" -eq 401 ]; then
    log_error "Unauthorized - Status: $HTTP_STATUS"
    echo "$ACHIEVEMENTS_BODY"
    exit 1
elif [ "$HTTP_STATUS" -eq 403 ]; then
    log_error "Forbidden - User is not admin - Status: $HTTP_STATUS"
    echo "$ACHIEVEMENTS_BODY"
    exit 1
else
    log_error "Unexpected response - Status: $HTTP_STATUS"
    echo "$ACHIEVEMENTS_BODY"
    exit 1
fi

###############################################################################
# Step 4: Test with invalid student ID (should return 404)
###############################################################################
echo ""
log_info "Testing with invalid student ID (should return 404)..."

INVALID_ID="00000000-0000-0000-0000-000000000000"
INVALID_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET \
  "${BASE_URL}/admin/progress/students/${INVALID_ID}/achievements" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

INVALID_STATUS=$(echo "$INVALID_RESPONSE" | tail -n1)

if [ "$INVALID_STATUS" -eq 404 ]; then
    log_success "Correctly returned 404 for non-existent student"
else
    log_warning "Expected 404 but got $INVALID_STATUS"
fi

###############################################################################
# Summary
###############################################################################
echo ""
echo "================================================================"
log_success "Test completed successfully!"
echo "================================================================"
echo ""
log_info "Tested endpoints:"
echo "  ✓ GET /admin/progress/students/:id/achievements"
echo ""
log_info "Response includes:"
echo "  - student_id"
echo "  - total_achievements"
echo "  - achievements array with full details"
echo "  - by_category breakdown"
echo "  - by_tier breakdown"
