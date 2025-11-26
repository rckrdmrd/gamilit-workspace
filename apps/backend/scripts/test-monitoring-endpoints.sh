#!/bin/bash

###############################################################################
# Test Script for Admin Monitoring Module Endpoints
# Tests all 5 monitoring endpoints with various query parameters
###############################################################################

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:3006}"
JWT_TOKEN="${JWT_TOKEN}"

# Test counter
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

###############################################################################
# Helper Functions
###############################################################################

print_header() {
  echo -e "\n${BLUE}========================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}========================================${NC}\n"
}

print_test() {
  echo -e "${YELLOW}TEST $((TOTAL_TESTS + 1)):${NC} $1"
}

print_success() {
  echo -e "${GREEN}✓ PASSED:${NC} $1\n"
  ((PASSED_TESTS++))
  ((TOTAL_TESTS++))
}

print_failure() {
  echo -e "${RED}✗ FAILED:${NC} $1\n"
  ((FAILED_TESTS++))
  ((TOTAL_TESTS++))
}

print_summary() {
  echo -e "\n${BLUE}========================================${NC}"
  echo -e "${BLUE}TEST SUMMARY${NC}"
  echo -e "${BLUE}========================================${NC}"
  echo -e "Total Tests:  ${TOTAL_TESTS}"
  echo -e "${GREEN}Passed:       ${PASSED_TESTS}${NC}"
  if [ $FAILED_TESTS -gt 0 ]; then
    echo -e "${RED}Failed:       ${FAILED_TESTS}${NC}"
  else
    echo -e "Failed:       ${FAILED_TESTS}"
  fi
  echo -e "${BLUE}========================================${NC}\n"
}

make_request() {
  local method=$1
  local endpoint=$2
  local description=$3

  print_test "$description"

  if [ -z "$JWT_TOKEN" ]; then
    print_failure "JWT_TOKEN not set. Please set JWT_TOKEN environment variable."
    return 1
  fi

  local response=$(curl -s -w "\n%{http_code}" \
    -X "$method" \
    -H "Authorization: Bearer $JWT_TOKEN" \
    -H "Content-Type: application/json" \
    "$API_BASE_URL$endpoint")

  local body=$(echo "$response" | head -n -1)
  local status_code=$(echo "$response" | tail -n 1)

  echo "Status Code: $status_code"
  echo "Response Body:"
  echo "$body" | jq '.' 2>/dev/null || echo "$body"

  if [ "$status_code" -eq 200 ]; then
    print_success "$description"
    return 0
  else
    print_failure "$description (HTTP $status_code)"
    return 1
  fi
}

###############################################################################
# Authentication Check
###############################################################################

check_authentication() {
  print_header "AUTHENTICATION CHECK"

  if [ -z "$JWT_TOKEN" ]; then
    echo -e "${RED}ERROR: JWT_TOKEN environment variable is not set${NC}"
    echo -e "${YELLOW}Please set it using:${NC}"
    echo -e "  export JWT_TOKEN='your-jwt-token-here'"
    echo -e "\n${YELLOW}To get a token, login as an admin user:${NC}"
    echo -e "  curl -X POST $API_BASE_URL/auth/login \\"
    echo -e "    -H 'Content-Type: application/json' \\"
    echo -e "    -d '{\"email\":\"admin@example.com\",\"password\":\"your-password\"}' | jq -r '.access_token'"
    exit 1
  fi

  echo -e "${GREEN}✓ JWT_TOKEN is set${NC}"
}

###############################################################################
# Test Cases
###############################################################################

test_system_metrics() {
  print_header "TEST 1: Get Current System Metrics"
  make_request "GET" "/admin/monitoring/metrics" "Get current system metrics"
}

test_metrics_history_default() {
  print_header "TEST 2: Get Metrics History (Default 24h)"
  make_request "GET" "/admin/monitoring/metrics/history" "Get metrics history with default parameters"
}

test_metrics_history_custom() {
  print_header "TEST 3: Get Metrics History (Custom 48h)"
  make_request "GET" "/admin/monitoring/metrics/history?hours=48" "Get metrics history for 48 hours"
}

test_metrics_history_max() {
  print_header "TEST 4: Get Metrics History (Max 168h / 7 days)"
  make_request "GET" "/admin/monitoring/metrics/history?hours=168" "Get metrics history for 7 days"
}

test_error_stats_default() {
  print_header "TEST 5: Get Error Statistics (Default 24h)"
  make_request "GET" "/admin/monitoring/errors/stats" "Get error statistics with default parameters"
}

test_error_stats_custom() {
  print_header "TEST 6: Get Error Statistics (Custom 72h)"
  make_request "GET" "/admin/monitoring/errors/stats?hours=72" "Get error statistics for 72 hours"
}

test_recent_errors_default() {
  print_header "TEST 7: Get Recent Errors (Default)"
  make_request "GET" "/admin/monitoring/errors/recent" "Get recent errors with default parameters"
}

test_recent_errors_limit() {
  print_header "TEST 8: Get Recent Errors (Limit 10)"
  make_request "GET" "/admin/monitoring/errors/recent?limit=10" "Get recent 10 errors"
}

test_recent_errors_fatal_only() {
  print_header "TEST 9: Get Recent Fatal Errors"
  make_request "GET" "/admin/monitoring/errors/recent?level=fatal&limit=5" "Get recent fatal errors only"
}

test_recent_errors_error_only() {
  print_header "TEST 10: Get Recent Error-Level Errors"
  make_request "GET" "/admin/monitoring/errors/recent?level=error&limit=15" "Get recent error-level errors only"
}

test_error_trends_default() {
  print_header "TEST 11: Get Error Trends (Default - Hourly)"
  make_request "GET" "/admin/monitoring/errors/trends" "Get error trends with default parameters (hourly)"
}

test_error_trends_daily() {
  print_header "TEST 12: Get Error Trends (Daily)"
  make_request "GET" "/admin/monitoring/errors/trends?group_by=day" "Get error trends grouped by day"
}

test_error_trends_weekly() {
  print_header "TEST 13: Get Error Trends (7 days, Daily)"
  make_request "GET" "/admin/monitoring/errors/trends?hours=168&group_by=day" "Get error trends for 7 days grouped by day"
}

test_error_trends_custom() {
  print_header "TEST 14: Get Error Trends (48h, Hourly)"
  make_request "GET" "/admin/monitoring/errors/trends?hours=48&group_by=hour" "Get error trends for 48 hours grouped by hour"
}

###############################################################################
# Validation Tests (Should Fail)
###############################################################################

test_validation_errors() {
  print_header "VALIDATION TESTS (Expected Failures)"

  print_test "Invalid hours parameter (0)"
  local response=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer $JWT_TOKEN" \
    "$API_BASE_URL/admin/monitoring/metrics/history?hours=0")
  local status_code=$(echo "$response" | tail -n 1)

  if [ "$status_code" -eq 400 ]; then
    print_success "Correctly rejected hours=0"
  else
    print_failure "Should reject hours=0 with 400 status"
  fi

  print_test "Invalid hours parameter (200)"
  response=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer $JWT_TOKEN" \
    "$API_BASE_URL/admin/monitoring/errors/stats?hours=200")
  status_code=$(echo "$response" | tail -n 1)

  if [ "$status_code" -eq 400 ]; then
    print_success "Correctly rejected hours=200"
  else
    print_failure "Should reject hours=200 with 400 status"
  fi

  print_test "Invalid level parameter"
  response=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer $JWT_TOKEN" \
    "$API_BASE_URL/admin/monitoring/errors/recent?level=invalid")
  status_code=$(echo "$response" | tail -n 1)

  if [ "$status_code" -eq 400 ]; then
    print_success "Correctly rejected invalid level"
  else
    print_failure "Should reject invalid level with 400 status"
  fi

  print_test "Invalid group_by parameter"
  response=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer $JWT_TOKEN" \
    "$API_BASE_URL/admin/monitoring/errors/trends?group_by=week")
  status_code=$(echo "$response" | tail -n 1)

  if [ "$status_code" -eq 400 ]; then
    print_success "Correctly rejected invalid group_by"
  else
    print_failure "Should reject invalid group_by with 400 status"
  fi
}

###############################################################################
# Authorization Tests
###############################################################################

test_authorization() {
  print_header "AUTHORIZATION TESTS"

  print_test "Request without JWT token"
  local response=$(curl -s -w "\n%{http_code}" \
    "$API_BASE_URL/admin/monitoring/metrics")
  local status_code=$(echo "$response" | tail -n 1)

  if [ "$status_code" -eq 401 ]; then
    print_success "Correctly rejected request without token (401)"
  else
    print_failure "Should reject request without token with 401 status"
  fi
}

###############################################################################
# Performance Tests
###############################################################################

test_performance() {
  print_header "PERFORMANCE TESTS"

  print_test "System metrics response time"
  local start_time=$(date +%s%3N)
  curl -s -o /dev/null \
    -H "Authorization: Bearer $JWT_TOKEN" \
    "$API_BASE_URL/admin/monitoring/metrics"
  local end_time=$(date +%s%3N)
  local duration=$((end_time - start_time))

  echo "Response time: ${duration}ms"

  if [ $duration -lt 1000 ]; then
    print_success "Response time under 1 second (${duration}ms)"
  else
    print_failure "Response time too slow (${duration}ms)"
  fi
}

###############################################################################
# Main Execution
###############################################################################

main() {
  echo -e "${GREEN}"
  echo "╔══════════════════════════════════════════════════════════════╗"
  echo "║   Admin Monitoring Module - Comprehensive Test Suite        ║"
  echo "║   Testing 5 Endpoints with Multiple Scenarios               ║"
  echo "╚══════════════════════════════════════════════════════════════╝"
  echo -e "${NC}\n"

  echo -e "${YELLOW}Configuration:${NC}"
  echo -e "  API Base URL: $API_BASE_URL"
  echo -e "  JWT Token:    ${JWT_TOKEN:0:20}..."

  check_authentication

  # Core functionality tests
  test_system_metrics
  test_metrics_history_default
  test_metrics_history_custom
  test_metrics_history_max
  test_error_stats_default
  test_error_stats_custom
  test_recent_errors_default
  test_recent_errors_limit
  test_recent_errors_fatal_only
  test_recent_errors_error_only
  test_error_trends_default
  test_error_trends_daily
  test_error_trends_weekly
  test_error_trends_custom

  # Validation tests
  test_validation_errors

  # Authorization tests
  test_authorization

  # Performance tests
  test_performance

  # Print summary
  print_summary

  # Exit with appropriate code
  if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}\n"
    exit 0
  else
    echo -e "${RED}Some tests failed. Please review the output above.${NC}\n"
    exit 1
  fi
}

# Run main function
main
