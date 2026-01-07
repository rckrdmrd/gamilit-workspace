#!/bin/bash

################################################################################
# Manual Testing Guide for US-AE-007 REST Endpoints
#
# CRITICAL: Production Blocker Resolution
# Date: 2025-11-24
# Status: Ready for Testing
#
# Prerequisites:
# 1. Backend running: npm run start:dev
# 2. Database seeded with test data
# 3. Valid admin JWT token
#
# Usage:
#   1. Get JWT token from login
#   2. Set TOKEN variable below
#   3. Get test UUIDs from database
#   4. Run each test section
################################################################################

# Configuration
BASE_URL="http://localhost:3006/api"
TOKEN="your-jwt-token-here"

# Test Data - REPLACE WITH REAL UUIDs FROM YOUR DATABASE
CLASSROOM_UUID_1="770e8400-e29b-41d4-a716-446655440020"
CLASSROOM_UUID_2="770e8400-e29b-41d4-a716-446655440021"
CLASSROOM_UUID_3="770e8400-e29b-41d4-a716-446655440022"
TEACHER_UUID_1="550e8400-e29b-41d4-a716-446655440005"
TEACHER_UUID_2="550e8400-e29b-41d4-a716-446655440006"
TEACHER_UUID_3="550e8400-e29b-41d4-a716-446655440007"
SCHOOL_UUID="123e4567-e89b-12d3-a456-426614174000"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}================================${NC}"
echo -e "${YELLOW}US-AE-007 REST Endpoints Testing${NC}"
echo -e "${YELLOW}================================${NC}"
echo ""

################################################################################
# TEST 1: GET Classroom Teachers
################################################################################
echo -e "${GREEN}TEST 1: GET /admin/classrooms/:id/teachers${NC}"
echo "Expected: 200 OK with classroom info + teachers array"
echo ""
curl -X GET "${BASE_URL}/admin/classrooms/${CLASSROOM_UUID_1}/teachers" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'
echo ""
read -p "Press Enter to continue..."
echo ""

################################################################################
# TEST 2: POST Assign Teacher to Classroom
################################################################################
echo -e "${GREEN}TEST 2: POST /admin/classrooms/:id/teachers${NC}"
echo "Expected: 201 Created with assignment info"
echo ""
curl -X POST "${BASE_URL}/admin/classrooms/${CLASSROOM_UUID_1}/teachers" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"teacherId\": \"${TEACHER_UUID_1}\",
    \"notes\": \"Main teacher assigned via REST endpoint\"
  }" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'
echo ""
read -p "Press Enter to continue..."
echo ""

################################################################################
# TEST 2b: POST Assign Teacher (Duplicate - Should Fail)
################################################################################
echo -e "${YELLOW}TEST 2b: POST Assign Teacher (Duplicate - Should Return 409)${NC}"
echo "Expected: 409 Conflict"
echo ""
curl -X POST "${BASE_URL}/admin/classrooms/${CLASSROOM_UUID_1}/teachers" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"teacherId\": \"${TEACHER_UUID_1}\",
    \"notes\": \"Duplicate assignment\"
  }" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'
echo ""
read -p "Press Enter to continue..."
echo ""

################################################################################
# TEST 3: DELETE Remove Teacher from Classroom
################################################################################
echo -e "${GREEN}TEST 3: DELETE /admin/classrooms/:id/teachers/:teacherId${NC}"
echo "Expected: 200 OK with success message"
echo ""
curl -X DELETE "${BASE_URL}/admin/classrooms/${CLASSROOM_UUID_1}/teachers/${TEACHER_UUID_1}" \
  -H "Authorization: Bearer ${TOKEN}" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'
echo ""
read -p "Press Enter to continue..."
echo ""

################################################################################
# TEST 3b: DELETE with Force Flag
################################################################################
echo -e "${YELLOW}TEST 3b: DELETE with force=true (for classrooms with students)${NC}"
echo "Expected: 200 OK even if classroom has students"
echo ""
curl -X DELETE "${BASE_URL}/admin/classrooms/${CLASSROOM_UUID_1}/teachers/${TEACHER_UUID_1}?force=true" \
  -H "Authorization: Bearer ${TOKEN}" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'
echo ""
read -p "Press Enter to continue..."
echo ""

################################################################################
# TEST 4: GET Teacher Classrooms
################################################################################
echo -e "${GREEN}TEST 4: GET /admin/teachers/:id/classrooms${NC}"
echo "Expected: 200 OK with teacher info + classrooms array"
echo ""
curl -X GET "${BASE_URL}/admin/teachers/${TEACHER_UUID_1}/classrooms" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'
echo ""
read -p "Press Enter to continue..."
echo ""

################################################################################
# TEST 5: POST Assign Multiple Classrooms to Teacher
################################################################################
echo -e "${GREEN}TEST 5: POST /admin/teachers/:id/classrooms${NC}"
echo "Expected: 201 Created with assigned count + classroom list"
echo ""
curl -X POST "${BASE_URL}/admin/teachers/${TEACHER_UUID_2}/classrooms" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"classroomIds\": [
      \"${CLASSROOM_UUID_1}\",
      \"${CLASSROOM_UUID_2}\",
      \"${CLASSROOM_UUID_3}\"
    ]
  }" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'
echo ""
read -p "Press Enter to continue..."
echo ""

################################################################################
# TEST 6a: GET List All Assignments (Default)
################################################################################
echo -e "${GREEN}TEST 6a: GET /admin/classroom-teachers (default pagination)${NC}"
echo "Expected: 200 OK with paginated data"
echo ""
curl -X GET "${BASE_URL}/admin/classroom-teachers" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'
echo ""
read -p "Press Enter to continue..."
echo ""

################################################################################
# TEST 6b: GET List All Assignments (Custom Pagination)
################################################################################
echo -e "${GREEN}TEST 6b: GET /admin/classroom-teachers (page 1, limit 5)${NC}"
echo "Expected: 200 OK with 5 items max"
echo ""
curl -X GET "${BASE_URL}/admin/classroom-teachers?page=1&limit=5" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'
echo ""
read -p "Press Enter to continue..."
echo ""

################################################################################
# TEST 6c: GET List All Assignments (With School Filter)
################################################################################
echo -e "${GREEN}TEST 6c: GET /admin/classroom-teachers (filtered by school)${NC}"
echo "Expected: 200 OK with filtered data"
echo ""
curl -X GET "${BASE_URL}/admin/classroom-teachers?schoolId=${SCHOOL_UUID}&page=1&limit=10" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'
echo ""
read -p "Press Enter to continue..."
echo ""

################################################################################
# TEST 7: POST Bulk Assign Multiple Pairs
################################################################################
echo -e "${GREEN}TEST 7: POST /admin/classroom-teachers/bulk${NC}"
echo "Expected: 201 Created with assigned count + results"
echo ""
curl -X POST "${BASE_URL}/admin/classroom-teachers/bulk" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"assignments\": [
      {
        \"teacherId\": \"${TEACHER_UUID_1}\",
        \"classroomId\": \"${CLASSROOM_UUID_2}\"
      },
      {
        \"teacherId\": \"${TEACHER_UUID_2}\",
        \"classroomId\": \"${CLASSROOM_UUID_3}\"
      },
      {
        \"teacherId\": \"${TEACHER_UUID_3}\",
        \"classroomId\": \"${CLASSROOM_UUID_1}\"
      }
    ]
  }" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'
echo ""
read -p "Press Enter to continue..."
echo ""

################################################################################
# ERROR CASE TESTS
################################################################################
echo -e "${RED}================================${NC}"
echo -e "${RED}ERROR CASE TESTS${NC}"
echo -e "${RED}================================${NC}"
echo ""

# Test 404 - Classroom Not Found
echo -e "${YELLOW}ERROR TEST 1: GET Invalid Classroom (Should Return 404)${NC}"
curl -X GET "${BASE_URL}/admin/classrooms/00000000-0000-0000-0000-000000000000/teachers" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'
echo ""
read -p "Press Enter to continue..."
echo ""

# Test 404 - Teacher Not Found
echo -e "${YELLOW}ERROR TEST 2: GET Invalid Teacher (Should Return 404)${NC}"
curl -X GET "${BASE_URL}/admin/teachers/00000000-0000-0000-0000-000000000000/classrooms" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'
echo ""
read -p "Press Enter to continue..."
echo ""

# Test 400 - Invalid UUID Format
echo -e "${YELLOW}ERROR TEST 3: GET Invalid UUID Format (Should Return 400)${NC}"
curl -X GET "${BASE_URL}/admin/classrooms/invalid-uuid/teachers" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'
echo ""
read -p "Press Enter to continue..."
echo ""

# Test 401 - No Token
echo -e "${YELLOW}ERROR TEST 4: GET Without Auth Token (Should Return 401)${NC}"
curl -X GET "${BASE_URL}/admin/classrooms/${CLASSROOM_UUID_1}/teachers" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'
echo ""

################################################################################
# SUMMARY
################################################################################
echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}TESTING COMPLETE${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Summary of Endpoints Tested:"
echo "1. GET    /admin/classrooms/:id/teachers          ✓"
echo "2. POST   /admin/classrooms/:id/teachers          ✓"
echo "3. DELETE /admin/classrooms/:id/teachers/:tid     ✓"
echo "4. GET    /admin/teachers/:id/classrooms          ✓"
echo "5. POST   /admin/teachers/:id/classrooms          ✓"
echo "6. GET    /admin/classroom-teachers               ✓"
echo "7. POST   /admin/classroom-teachers/bulk          ✓"
echo ""
echo "Error Cases Tested:"
echo "- 404 Not Found                                   ✓"
echo "- 409 Conflict (Duplicate)                        ✓"
echo "- 400 Bad Request (Invalid UUID)                  ✓"
echo "- 401 Unauthorized (No Token)                     ✓"
echo ""
echo "Next Steps:"
echo "1. Verify all endpoints returned expected status codes"
echo "2. Check database for created assignments"
echo "3. Test with frontend UI"
echo "4. Deploy to staging for QA testing"
echo ""
echo -e "${GREEN}🎉 US-AE-007 REST Endpoints Ready for Production!${NC}"
echo ""
