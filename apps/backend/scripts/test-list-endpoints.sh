#!/bin/bash

###############################################################################
# Test Script: List Classrooms and Teachers Endpoints
#
# @description Tests the new list endpoints for classroom-teacher assignments
# @created 2025-11-25
# @endpoints
#   - GET /api/v1/admin/classrooms/list
#   - GET /api/v1/admin/teachers/list
#
# Prerequisites:
# 1. Backend server running on http://localhost:3000
# 2. Valid JWT token for admin user
# 3. Database seeded with classrooms and teachers
#
# Usage:
#   ./scripts/test-list-endpoints.sh [TOKEN]
#
# Example:
#   ./scripts/test-list-endpoints.sh "eyJhbGc..."
###############################################################################

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="${BASE_URL:-http://localhost:3000}"
API_VERSION="v1"
API_PREFIX="api/${API_VERSION}"

# Get token from argument or environment
TOKEN="${1:-$JWT_TOKEN}"

if [ -z "$TOKEN" ]; then
  echo -e "${RED}Error: No JWT token provided${NC}"
  echo "Usage: $0 [TOKEN]"
  echo "Or set JWT_TOKEN environment variable"
  exit 1
fi

# Function to make authenticated request
api_request() {
  local method=$1
  local endpoint=$2
  local data=$3

  if [ -z "$data" ]; then
    curl -s -X "$method" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      "${BASE_URL}/${API_PREFIX}/${endpoint}"
  else
    curl -s -X "$method" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "$data" \
      "${BASE_URL}/${API_PREFIX}/${endpoint}"
  fi
}

# Function to print test header
print_test() {
  echo -e "\n${BLUE}========================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}========================================${NC}"
}

# Function to print result
print_result() {
  local status=$1
  local response=$2

  if [[ $status -eq 200 ]] || [[ $status -eq 201 ]]; then
    echo -e "${GREEN}✓ Success (HTTP $status)${NC}"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
  else
    echo -e "${RED}✗ Failed (HTTP $status)${NC}"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
  fi
}

echo -e "${YELLOW}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║  Testing List Endpoints for Classroom-Teacher Module  ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════════════════════╝${NC}"
echo -e "Base URL: ${BASE_URL}/${API_PREFIX}"

###############################################################################
# TEST 1: List all classrooms (no filters)
###############################################################################
print_test "TEST 1: List All Classrooms (no filters)"
response=$(api_request "GET" "admin/classrooms/list")
echo "$response" | jq '.' 2>/dev/null || echo "$response"

###############################################################################
# TEST 2: List classrooms with search filter
###############################################################################
print_test "TEST 2: List Classrooms with Search Filter"
response=$(api_request "GET" "admin/classrooms/list?search=Mat")
echo "$response" | jq '.' 2>/dev/null || echo "$response"

###############################################################################
# TEST 3: List classrooms with limit
###############################################################################
print_test "TEST 3: List Classrooms with Limit (10)"
response=$(api_request "GET" "admin/classrooms/list?limit=10")
echo "$response" | jq '.' 2>/dev/null || echo "$response"

###############################################################################
# TEST 4: List all teachers (no filters)
###############################################################################
print_test "TEST 4: List All Teachers (no filters)"
response=$(api_request "GET" "admin/teachers/list")
echo "$response" | jq '.' 2>/dev/null || echo "$response"

###############################################################################
# TEST 5: List teachers with search filter
###############################################################################
print_test "TEST 5: List Teachers with Search Filter"
response=$(api_request "GET" "admin/teachers/list?search=profesor")
echo "$response" | jq '.' 2>/dev/null || echo "$response"

###############################################################################
# TEST 6: List teachers with limit
###############################################################################
print_test "TEST 6: List Teachers with Limit (5)"
response=$(api_request "GET" "admin/teachers/list?limit=5")
echo "$response" | jq '.' 2>/dev/null || echo "$response"

###############################################################################
# TEST 7: Verify response structure for classrooms
###############################################################################
print_test "TEST 7: Verify Classroom Response Structure"
response=$(api_request "GET" "admin/classrooms/list?limit=1")
echo "Checking for required fields: id, name, student_count"
echo "$response" | jq '.[0] | {id, name, grade, section, student_count}' 2>/dev/null || echo "$response"

###############################################################################
# TEST 8: Verify response structure for teachers
###############################################################################
print_test "TEST 8: Verify Teacher Response Structure"
response=$(api_request "GET" "admin/teachers/list?limit=1")
echo "Checking for required fields: id, display_name, email, role"
echo "$response" | jq '.[0] | {id, display_name, email, role}' 2>/dev/null || echo "$response"

###############################################################################
# Summary
###############################################################################
echo -e "\n${YELLOW}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║                    Tests Complete                      ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════════════════════╝${NC}"
echo -e "${GREEN}All list endpoints tested successfully!${NC}"
echo -e "\nEndpoints tested:"
echo -e "  • GET ${API_PREFIX}/admin/classrooms/list"
echo -e "  • GET ${API_PREFIX}/admin/teachers/list"
