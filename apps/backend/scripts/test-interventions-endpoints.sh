#!/bin/bash

################################################################################
# Test Script for Admin Interventions Endpoints (BE-001)
#
# Purpose: Test student intervention alerts management endpoints
# Target: Admin Portal - Student Intervention Alerts System
#
# Endpoints Tested:
#   GET    /admin/interventions - List all alerts with filters
#   GET    /admin/interventions/:id - Get specific alert
#   PATCH  /admin/interventions/:id/acknowledge - Acknowledge alert
#   PATCH  /admin/interventions/:id/resolve - Resolve alert
#   DELETE /admin/interventions/:id/dismiss - Dismiss alert
#
# Prerequisites:
#   - Backend running on http://localhost:3000
#   - Valid JWT token with SUPER_ADMIN or ADMIN_TEACHER role
#   - Database with student_intervention_alerts table populated
#
# Usage:
#   ./test-interventions-endpoints.sh <JWT_TOKEN>
################################################################################

set -e

# Configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:3000}"
JWT_TOKEN="${1:-}"

if [ -z "$JWT_TOKEN" ]; then
  echo "Error: JWT token is required"
  echo "Usage: $0 <JWT_TOKEN>"
  exit 1
fi

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Admin Interventions Endpoints Test${NC}"
echo -e "${BLUE}================================${NC}\n"

# Test 1: List all intervention alerts (no filters)
echo -e "${YELLOW}[TEST 1]${NC} List all intervention alerts"
echo -e "${BLUE}GET /admin/interventions${NC}"
curl -s -X GET \
  "${API_BASE_URL}/admin/interventions" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" | jq '.'

echo -e "\n${GREEN}✓ Test 1 completed${NC}\n"

# Test 2: List alerts with filters (severity=high, status=active)
echo -e "${YELLOW}[TEST 2]${NC} List high severity active alerts"
echo -e "${BLUE}GET /admin/interventions?severity=high&status=active${NC}"
curl -s -X GET \
  "${API_BASE_URL}/admin/interventions?severity=high&status=active" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" | jq '.'

echo -e "\n${GREEN}✓ Test 2 completed${NC}\n"

# Test 3: List alerts by alert_type (low_score)
echo -e "${YELLOW}[TEST 3]${NC} List low_score alerts"
echo -e "${BLUE}GET /admin/interventions?alert_type=low_score${NC}"
curl -s -X GET \
  "${API_BASE_URL}/admin/interventions?alert_type=low_score" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" | jq '.'

echo -e "\n${GREEN}✓ Test 3 completed${NC}\n"

# Test 4: List with pagination
echo -e "${YELLOW}[TEST 4]${NC} List alerts with pagination (page=1, limit=5)"
echo -e "${BLUE}GET /admin/interventions?page=1&limit=5${NC}"
curl -s -X GET \
  "${API_BASE_URL}/admin/interventions?page=1&limit=5" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" | jq '.'

echo -e "\n${GREEN}✓ Test 4 completed${NC}\n"

# Test 5: Get first alert ID for detailed operations
echo -e "${YELLOW}[TEST 5]${NC} Get alert ID from list"
ALERT_ID=$(curl -s -X GET \
  "${API_BASE_URL}/admin/interventions?limit=1" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" | jq -r '.data[0].id // empty')

if [ -z "$ALERT_ID" ]; then
  echo -e "${RED}No alerts found in database. Please populate student_intervention_alerts table.${NC}"
  echo -e "${YELLOW}Skipping remaining tests that require an alert ID.${NC}\n"
  exit 0
fi

echo -e "Alert ID: ${GREEN}${ALERT_ID}${NC}\n"

# Test 6: Get specific alert by ID
echo -e "${YELLOW}[TEST 6]${NC} Get alert by ID"
echo -e "${BLUE}GET /admin/interventions/${ALERT_ID}${NC}"
curl -s -X GET \
  "${API_BASE_URL}/admin/interventions/${ALERT_ID}" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" | jq '.'

echo -e "\n${GREEN}✓ Test 6 completed${NC}\n"

# Test 7: Acknowledge alert
echo -e "${YELLOW}[TEST 7]${NC} Acknowledge alert"
echo -e "${BLUE}PATCH /admin/interventions/${ALERT_ID}/acknowledge${NC}"
curl -s -X PATCH \
  "${API_BASE_URL}/admin/interventions/${ALERT_ID}/acknowledge" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "acknowledgment_note": "Reviewing student progress and planning intervention"
  }' | jq '.'

echo -e "\n${GREEN}✓ Test 7 completed${NC}\n"

# Test 8: Resolve alert
echo -e "${YELLOW}[TEST 8]${NC} Resolve alert"
echo -e "${BLUE}PATCH /admin/interventions/${ALERT_ID}/resolve${NC}"
curl -s -X PATCH \
  "${API_BASE_URL}/admin/interventions/${ALERT_ID}/resolve" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "resolution_notes": "Met with student and parent. Created personalized study plan. Will monitor progress weekly."
  }' | jq '.'

echo -e "\n${GREEN}✓ Test 8 completed${NC}\n"

# Test 9: Get another alert for dismiss test
echo -e "${YELLOW}[TEST 9]${NC} Get another alert for dismiss test"
ALERT_ID_2=$(curl -s -X GET \
  "${API_BASE_URL}/admin/interventions?status=active&limit=1" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" | jq -r '.data[0].id // empty')

if [ -n "$ALERT_ID_2" ]; then
  echo -e "Alert ID 2: ${GREEN}${ALERT_ID_2}${NC}\n"

  # Test 10: Dismiss alert
  echo -e "${YELLOW}[TEST 10]${NC} Dismiss alert"
  echo -e "${BLUE}DELETE /admin/interventions/${ALERT_ID_2}/dismiss${NC}"
  curl -s -X DELETE \
    "${API_BASE_URL}/admin/interventions/${ALERT_ID_2}/dismiss" \
    -H "Authorization: Bearer ${JWT_TOKEN}" \
    -H "Content-Type: application/json" | jq '.'

  echo -e "\n${GREEN}✓ Test 10 completed${NC}\n"
else
  echo -e "${YELLOW}No additional active alerts found. Skipping dismiss test.${NC}\n"
fi

echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}All tests completed successfully!${NC}"
echo -e "${BLUE}================================${NC}\n"

echo -e "Filter Examples:"
echo -e "  - By severity:     ${BLUE}?severity=critical${NC}"
echo -e "  - By status:       ${BLUE}?status=active${NC}"
echo -e "  - By type:         ${BLUE}?alert_type=low_score${NC}"
echo -e "  - By student:      ${BLUE}?student_id=UUID${NC}"
echo -e "  - By classroom:    ${BLUE}?classroom_id=UUID${NC}"
echo -e "  - By date range:   ${BLUE}?date_from=2025-01-01T00:00:00Z&date_to=2025-12-31T23:59:59Z${NC}"
echo -e "  - Combined:        ${BLUE}?severity=high&status=active&alert_type=low_score&page=1&limit=10${NC}"
