#!/bin/bash

###############################################################################
# Admin Progress Module - Endpoints Testing Script
# Tests all 6 endpoints of the Admin Progress Module (Plan 3)
###############################################################################

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_URL="${API_URL:-http://localhost:3006}"
TOKEN="${ADMIN_TOKEN:-}"

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

###############################################################################
# Helper Functions
###############################################################################

print_header() {
  echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_test() {
  echo -e "${YELLOW}Testing:${NC} $1"
}

print_success() {
  echo -e "${GREEN}✓ PASSED${NC} - $1"
  ((TESTS_PASSED++))
}

print_failure() {
  echo -e "${RED}✗ FAILED${NC} - $1"
  ((TESTS_FAILED++))
}

print_info() {
  echo -e "${BLUE}ℹ${NC} $1"
}

check_prerequisites() {
  if [ -z "$TOKEN" ]; then
    echo -e "${RED}Error: ADMIN_TOKEN environment variable is not set${NC}"
    echo "Please set it with: export ADMIN_TOKEN='your-admin-jwt-token'"
    exit 1
  fi

  if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}Warning: jq is not installed. JSON output will not be formatted.${NC}"
  fi
}

make_request() {
  local method="$1"
  local endpoint="$2"
  local description="$3"

  print_test "$description"

  response=$(curl -s -w "\n%{http_code}" \
    -X "$method" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    "$API_URL$endpoint")

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')

  if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
    print_success "HTTP $http_code"
    if command -v jq &> /dev/null; then
      echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
      echo "$body"
    fi
    return 0
  else
    print_failure "HTTP $http_code"
    echo "Response: $body"
    return 1
  fi
}

###############################################################################
# Test Cases
###############################################################################

test_progress_overview() {
  print_header "TEST 1: Progress Overview"
  make_request "GET" "/admin/progress/overview" "Get system-wide progress overview"
}

test_classroom_progress() {
  print_header "TEST 2: Classroom Progress"

  # First, get a classroom ID from the system
  print_info "Fetching available classrooms..."
  classrooms=$(curl -s \
    -H "Authorization: Bearer $TOKEN" \
    "$API_URL/admin/classrooms" | jq -r '.[0].id' 2>/dev/null)

  if [ -n "$classrooms" ] && [ "$classrooms" != "null" ]; then
    CLASSROOM_ID="$classrooms"
    make_request "GET" "/admin/progress/classrooms/$CLASSROOM_ID" \
      "Get progress for classroom $CLASSROOM_ID"
  else
    print_info "No classrooms found. Using sample UUID for testing..."
    CLASSROOM_ID="123e4567-e89b-12d3-a456-426614174000"
    make_request "GET" "/admin/progress/classrooms/$CLASSROOM_ID" \
      "Get progress for classroom (may return 404 if not exists)"
  fi
}

test_student_progress() {
  print_header "TEST 3: Student Progress"

  # First, get a student ID from the system
  print_info "Fetching available students..."
  students=$(curl -s \
    -H "Authorization: Bearer $TOKEN" \
    "$API_URL/admin/users?role=student" | jq -r '.[0].id' 2>/dev/null)

  if [ -n "$students" ] && [ "$students" != "null" ]; then
    STUDENT_ID="$students"
    make_request "GET" "/admin/progress/students/$STUDENT_ID" \
      "Get progress for student $STUDENT_ID"

    # Test with query parameters
    echo ""
    if [ -n "$CLASSROOM_ID" ]; then
      make_request "GET" "/admin/progress/students/$STUDENT_ID?classroom_id=$CLASSROOM_ID" \
        "Get student progress filtered by classroom"
    fi
  else
    print_info "No students found. Using sample UUID for testing..."
    STUDENT_ID="123e4567-e89b-12d3-a456-426614174000"
    make_request "GET" "/admin/progress/students/$STUDENT_ID" \
      "Get progress for student (may return 404 if not exists)"
  fi
}

test_module_progress() {
  print_header "TEST 4: Module Progress Statistics"

  # First, get a module ID from the system
  print_info "Fetching available modules..."
  modules=$(curl -s \
    -H "Authorization: Bearer $TOKEN" \
    "$API_URL/modules" | jq -r '.[0].id' 2>/dev/null)

  if [ -n "$modules" ] && [ "$modules" != "null" ]; then
    MODULE_ID="$modules"
    make_request "GET" "/admin/progress/modules/$MODULE_ID" \
      "Get statistics for module $MODULE_ID"

    # Test with query parameters
    echo ""
    if [ -n "$CLASSROOM_ID" ]; then
      make_request "GET" "/admin/progress/modules/$MODULE_ID?classroom_id=$CLASSROOM_ID" \
        "Get module statistics filtered by classroom"
    fi
  else
    print_info "No modules found. Using sample UUID for testing..."
    MODULE_ID="123e4567-e89b-12d3-a456-426614174000"
    make_request "GET" "/admin/progress/modules/$MODULE_ID" \
      "Get statistics for module (may return 404 if not exists)"
  fi
}

test_exercise_stats() {
  print_header "TEST 5: Exercise Statistics"

  # First, get an exercise ID from the system
  print_info "Fetching available exercises..."
  exercises=$(curl -s \
    -H "Authorization: Bearer $TOKEN" \
    "$API_URL/exercises" | jq -r '.[0].id' 2>/dev/null)

  if [ -n "$exercises" ] && [ "$exercises" != "null" ]; then
    EXERCISE_ID="$exercises"
    make_request "GET" "/admin/progress/exercises/$EXERCISE_ID" \
      "Get statistics for exercise $EXERCISE_ID"
  else
    print_info "No exercises found. Using sample UUID for testing..."
    EXERCISE_ID="123e4567-e89b-12d3-a456-426614174000"
    make_request "GET" "/admin/progress/exercises/$EXERCISE_ID" \
      "Get statistics for exercise (may return 404 if not exists)"
  fi
}

test_export_progress() {
  print_header "TEST 6: Export Progress Data"

  # Test exporting students
  print_test "Export students progress to CSV"
  response=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer $TOKEN" \
    "$API_URL/admin/progress/export?type=students&format=csv")

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')

  if [ "$http_code" -eq 200 ]; then
    print_success "Students export - HTTP $http_code"
    echo "First 5 lines of CSV:"
    echo "$body" | head -n 5
  else
    print_failure "Students export - HTTP $http_code"
    echo "Response: $body"
  fi

  echo ""

  # Test exporting classrooms
  print_test "Export classrooms progress to CSV"
  response=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer $TOKEN" \
    "$API_URL/admin/progress/export?type=classrooms&format=csv")

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')

  if [ "$http_code" -eq 200 ]; then
    print_success "Classrooms export - HTTP $http_code"
    echo "First 5 lines of CSV:"
    echo "$body" | head -n 5
  else
    print_failure "Classrooms export - HTTP $http_code"
    echo "Response: $body"
  fi

  echo ""

  # Test exporting modules
  print_test "Export modules progress to CSV"
  response=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer $TOKEN" \
    "$API_URL/admin/progress/export?type=modules&format=csv")

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')

  if [ "$http_code" -eq 200 ]; then
    print_success "Modules export - HTTP $http_code"
    echo "First 5 lines of CSV:"
    echo "$body" | head -n 5
  else
    print_failure "Modules export - HTTP $http_code"
    echo "Response: $body"
  fi

  echo ""

  # Test with classroom filter
  if [ -n "$CLASSROOM_ID" ]; then
    print_test "Export students filtered by classroom"
    response=$(curl -s -w "\n%{http_code}" \
      -H "Authorization: Bearer $TOKEN" \
      "$API_URL/admin/progress/export?type=students&classroom_id=$CLASSROOM_ID&format=csv")

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [ "$http_code" -eq 200 ]; then
      print_success "Filtered export - HTTP $http_code"
      echo "First 5 lines of CSV:"
      echo "$body" | head -n 5
    else
      print_failure "Filtered export - HTTP $http_code"
      echo "Response: $body"
    fi
  fi
}

###############################################################################
# Main Execution
###############################################################################

main() {
  echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║  Admin Progress Module - Endpoint Testing Suite               ║${NC}"
  echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo "API URL: $API_URL"
  echo ""

  check_prerequisites

  test_progress_overview
  test_classroom_progress
  test_student_progress
  test_module_progress
  test_exercise_stats
  test_export_progress

  # Summary
  print_header "TEST SUMMARY"
  TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))
  echo -e "Total Tests: $TOTAL_TESTS"
  echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
  echo -e "${RED}Failed: $TESTS_FAILED${NC}"

  if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}✓ All tests passed!${NC}"
    exit 0
  else
    echo -e "\n${RED}✗ Some tests failed${NC}"
    exit 1
  fi
}

# Run main function
main
