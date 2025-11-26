#!/bin/bash

###############################################################################
# Test Script for Exercise Responses Endpoints
#
# Description: Tests all endpoints for teacher exercise responses
# Usage: ./test-exercise-responses.sh
#
# Prerequisites:
# - Backend server running on http://localhost:3000
# - Valid teacher JWT token
# - Student data in database
###############################################################################

# Configuration
API_BASE_URL="http://localhost:3000/api"
TEACHER_TOKEN="${TEACHER_JWT_TOKEN:-YOUR_TEACHER_JWT_TOKEN_HERE}"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper function to print test results
print_test() {
    local test_name="$1"
    local status="$2"

    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✓ PASS${NC} - $test_name"
    elif [ "$status" = "FAIL" ]; then
        echo -e "${RED}✗ FAIL${NC} - $test_name"
    else
        echo -e "${YELLOW}⚠ SKIP${NC} - $test_name"
    fi
}

# Helper function to make API request
make_request() {
    local method="$1"
    local endpoint="$2"
    local data="$3"

    if [ -z "$data" ]; then
        curl -s -X "$method" \
            -H "Authorization: Bearer $TEACHER_TOKEN" \
            -H "Content-Type: application/json" \
            "$API_BASE_URL$endpoint"
    else
        curl -s -X "$method" \
            -H "Authorization: Bearer $TEACHER_TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$API_BASE_URL$endpoint"
    fi
}

echo "=================================================="
echo "Testing Exercise Responses Endpoints"
echo "=================================================="
echo ""

# Check if token is set
if [ "$TEACHER_TOKEN" = "YOUR_TEACHER_JWT_TOKEN_HERE" ]; then
    echo -e "${RED}ERROR: Please set TEACHER_JWT_TOKEN environment variable${NC}"
    echo "Usage: TEACHER_JWT_TOKEN=your_token ./test-exercise-responses.sh"
    exit 1
fi

echo "Using API Base URL: $API_BASE_URL"
echo ""

###############################################################################
# Test 1: GET /teacher/attempts - Get all attempts (paginated)
###############################################################################
echo "Test 1: GET /teacher/attempts (paginated list)"
response=$(make_request "GET" "/teacher/attempts?page=1&limit=10")
http_code=$(echo "$response" | jq -r '.statusCode // 200')

if echo "$response" | jq -e '.data' > /dev/null 2>&1; then
    count=$(echo "$response" | jq -r '.data | length')
    total=$(echo "$response" | jq -r '.total')
    print_test "Get paginated attempts" "PASS"
    echo "  → Found $count attempts (total: $total)"
else
    print_test "Get paginated attempts" "FAIL"
    echo "  → Response: $response"
fi
echo ""

###############################################################################
# Test 2: GET /teacher/attempts with filters
###############################################################################
echo "Test 2: GET /teacher/attempts (with filters)"
response=$(make_request "GET" "/teacher/attempts?is_correct=true&limit=5")

if echo "$response" | jq -e '.data' > /dev/null 2>&1; then
    count=$(echo "$response" | jq -r '.data | length')
    print_test "Get filtered attempts (correct only)" "PASS"
    echo "  → Found $count correct attempts"
else
    print_test "Get filtered attempts" "FAIL"
fi
echo ""

###############################################################################
# Test 3: GET /teacher/attempts/:id - Get attempt detail
###############################################################################
echo "Test 3: GET /teacher/attempts/:id (attempt detail)"

# First get an attempt ID from the list
attempt_id=$(make_request "GET" "/teacher/attempts?limit=1" | jq -r '.data[0].id // empty')

if [ -n "$attempt_id" ] && [ "$attempt_id" != "null" ]; then
    response=$(make_request "GET" "/teacher/attempts/$attempt_id")

    if echo "$response" | jq -e '.id' > /dev/null 2>&1; then
        student_name=$(echo "$response" | jq -r '.student_name')
        exercise_title=$(echo "$response" | jq -r '.exercise_title')
        score=$(echo "$response" | jq -r '.score')
        print_test "Get attempt detail" "PASS"
        echo "  → Student: $student_name"
        echo "  → Exercise: $exercise_title"
        echo "  → Score: $score"
    else
        print_test "Get attempt detail" "FAIL"
        echo "  → Response: $response"
    fi
else
    print_test "Get attempt detail" "SKIP"
    echo "  → No attempts found to test"
fi
echo ""

###############################################################################
# Test 4: GET /teacher/attempts/student/:studentId
###############################################################################
echo "Test 4: GET /teacher/attempts/student/:studentId"

# First get a student ID from the list
student_id=$(make_request "GET" "/teacher/attempts?limit=1" | jq -r '.data[0].student_id // empty')

if [ -n "$student_id" ] && [ "$student_id" != "null" ]; then
    response=$(make_request "GET" "/teacher/attempts/student/$student_id")

    if echo "$response" | jq -e '. | type == "array"' > /dev/null 2>&1; then
        count=$(echo "$response" | jq -r 'length')
        print_test "Get student attempts" "PASS"
        echo "  → Found $count attempts for student $student_id"
    else
        print_test "Get student attempts" "FAIL"
        echo "  → Response: $response"
    fi
else
    print_test "Get student attempts" "SKIP"
    echo "  → No student found to test"
fi
echo ""

###############################################################################
# Test 5: GET /teacher/exercises/:exerciseId/responses
###############################################################################
echo "Test 5: GET /teacher/exercises/:exerciseId/responses"

# First get an exercise ID from the list
exercise_id=$(make_request "GET" "/teacher/attempts?limit=1" | jq -r '.data[0].exercise_id // empty')

if [ -n "$exercise_id" ] && [ "$exercise_id" != "null" ]; then
    response=$(make_request "GET" "/teacher/exercises/$exercise_id/responses")

    if echo "$response" | jq -e '.data' > /dev/null 2>&1; then
        count=$(echo "$response" | jq -r '.data | length')
        total=$(echo "$response" | jq -r '.total')
        print_test "Get exercise responses" "PASS"
        echo "  → Found $count responses (total: $total) for exercise $exercise_id"
    else
        print_test "Get exercise responses" "FAIL"
        echo "  → Response: $response"
    fi
else
    print_test "Get exercise responses" "SKIP"
    echo "  → No exercise found to test"
fi
echo ""

###############################################################################
# Test 6: GET /teacher/attempts with date filters
###############################################################################
echo "Test 6: GET /teacher/attempts (with date filters)"
from_date="2024-01-01T00:00:00Z"
to_date="2024-12-31T23:59:59Z"

response=$(make_request "GET" "/teacher/attempts?from_date=$from_date&to_date=$to_date&limit=5")

if echo "$response" | jq -e '.data' > /dev/null 2>&1; then
    count=$(echo "$response" | jq -r '.data | length')
    print_test "Get attempts with date filter" "PASS"
    echo "  → Found $count attempts in date range"
else
    print_test "Get attempts with date filter" "FAIL"
fi
echo ""

###############################################################################
# Test 7: GET /teacher/attempts with sorting
###############################################################################
echo "Test 7: GET /teacher/attempts (with sorting)"
response=$(make_request "GET" "/teacher/attempts?sort_by=score&sort_order=desc&limit=5")

if echo "$response" | jq -e '.data' > /dev/null 2>&1; then
    print_test "Get attempts sorted by score" "PASS"
    echo "  → Top 5 scores:"
    echo "$response" | jq -r '.data[] | "    • \(.student_name): \(.score) points"'
else
    print_test "Get attempts sorted by score" "FAIL"
fi
echo ""

###############################################################################
# Test 8: Authorization Check (should fail without token)
###############################################################################
echo "Test 8: Authorization Check (without token)"
response=$(curl -s -X GET \
    -H "Content-Type: application/json" \
    "$API_BASE_URL/teacher/attempts")

if echo "$response" | jq -e '.statusCode == 401' > /dev/null 2>&1; then
    print_test "Unauthorized request rejected" "PASS"
else
    print_test "Unauthorized request rejected" "FAIL"
    echo "  → Expected 401, got: $response"
fi
echo ""

###############################################################################
# Summary
###############################################################################
echo "=================================================="
echo "Test Suite Completed"
echo "=================================================="
echo ""
echo "Note: Some tests may show SKIP if no data is available in the database."
echo "To fully test, ensure you have:"
echo "  • Student accounts in teacher's classrooms"
echo "  • Exercise attempts in progress_tracking.exercise_attempts"
echo "  • Valid teacher JWT token"
echo ""
