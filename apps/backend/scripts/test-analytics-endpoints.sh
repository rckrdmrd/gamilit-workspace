#!/bin/bash

################################################################################
# Test Script: Admin Analytics Endpoints
# Purpose: Test all 7 analytics endpoints with proper authentication
# Date: 2025-11-24
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="${BASE_URL:-http://localhost:3006}"
API_BASE="${BASE_URL}/api"

# Function to print section headers
print_header() {
  echo ""
  echo -e "${BLUE}========================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}========================================${NC}"
  echo ""
}

# Function to print test results
print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
  echo -e "${RED}✗ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠ $1${NC}"
}

# Function to make API request with error handling
api_request() {
  local method=$1
  local endpoint=$2
  local description=$3
  local extra_args="${4:-}"

  echo -e "${YELLOW}Testing: ${description}${NC}"
  echo "Endpoint: ${method} ${endpoint}"

  if [ -z "$ACCESS_TOKEN" ]; then
    print_error "No access token available. Please login first."
    return 1
  fi

  local response=$(curl -s -w "\n%{http_code}" -X "${method}" \
    "${API_BASE}${endpoint}" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -H "Content-Type: application/json" \
    ${extra_args})

  local http_code=$(echo "$response" | tail -n1)
  local body=$(echo "$response" | sed '$d')

  echo "HTTP Status: ${http_code}"

  if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
    print_success "Request successful"
    echo "Response (formatted):"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
  else
    print_error "Request failed with status ${http_code}"
    echo "Response:"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
    return 1
  fi

  echo ""
  return 0
}

################################################################################
# STEP 1: Authentication
################################################################################

print_header "STEP 1: Authentication"

echo "Please enter admin credentials:"
read -p "Email: " ADMIN_EMAIL
read -sp "Password: " ADMIN_PASSWORD
echo ""

echo "Attempting login..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_BASE}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${ADMIN_EMAIL}\",
    \"password\": \"${ADMIN_PASSWORD}\"
  }")

ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token // empty')

if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" = "null" ]; then
  print_error "Login failed. Please check your credentials."
  echo "Response:"
  echo "$LOGIN_RESPONSE" | jq '.'
  exit 1
fi

print_success "Login successful"
echo "Access token obtained (first 20 chars): ${ACCESS_TOKEN:0:20}..."

################################################################################
# STEP 2: Test Analytics Overview
################################################################################

print_header "STEP 2: Analytics Overview"

api_request "GET" "/admin/analytics/overview" \
  "Get analytics overview with high-level metrics"

################################################################################
# STEP 3: Test Engagement Analytics
################################################################################

print_header "STEP 3: Engagement Analytics"

# Test without filters
api_request "GET" "/admin/analytics/engagement" \
  "Get engagement analytics (no filters)"

# Test with role filter
api_request "GET" "/admin/analytics/engagement?role=student" \
  "Get engagement analytics filtered by role=student"

# Test with date filter
DATE_30_DAYS_AGO=$(date -d '30 days ago' -Iseconds 2>/dev/null || date -v-30d -Iseconds)
api_request "GET" "/admin/analytics/engagement?date_from=${DATE_30_DAYS_AGO}" \
  "Get engagement analytics for users registered in last 30 days"

################################################################################
# STEP 4: Test Gamification Analytics
################################################################################

print_header "STEP 4: Gamification Analytics"

api_request "GET" "/admin/analytics/gamification" \
  "Get gamification analytics (XP, ranks, levels distribution)"

################################################################################
# STEP 5: Test Activity Timeline
################################################################################

print_header "STEP 5: Activity Timeline"

# Test with default days (30)
api_request "GET" "/admin/analytics/activity-timeline" \
  "Get activity timeline (default: 30 days)"

# Test with custom days
api_request "GET" "/admin/analytics/activity-timeline?days=7" \
  "Get activity timeline for last 7 days"

# Test with max days
api_request "GET" "/admin/analytics/activity-timeline?days=90" \
  "Get activity timeline for last 90 days"

################################################################################
# STEP 6: Test Top Users
################################################################################

print_header "STEP 6: Top Users"

# Test by XP
api_request "GET" "/admin/analytics/top-users?metric=xp&limit=10" \
  "Get top 10 users by XP"

# Test by exercises
api_request "GET" "/admin/analytics/top-users?metric=exercises&limit=5" \
  "Get top 5 users by exercises completed"

# Test by streak
api_request "GET" "/admin/analytics/top-users?metric=streak&limit=10" \
  "Get top 10 users by current streak"

# Test with role filter
api_request "GET" "/admin/analytics/top-users?metric=xp&role=student&limit=10" \
  "Get top 10 students by XP"

################################################################################
# STEP 7: Test Retention Analytics
################################################################################

print_header "STEP 7: Retention Analytics"

api_request "GET" "/admin/analytics/retention" \
  "Get retention analytics by cohort (last 12 months)"

################################################################################
# STEP 8: Test Export Endpoints
################################################################################

print_header "STEP 8: Export Analytics"

# Test overview export
echo -e "${YELLOW}Testing: Export overview data as CSV${NC}"
echo "Endpoint: GET /admin/analytics/export?type=overview"
OVERVIEW_EXPORT=$(curl -s -X GET \
  "${API_BASE}/admin/analytics/export?type=overview&format=csv" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

if [ ! -z "$OVERVIEW_EXPORT" ]; then
  print_success "Overview export successful"
  echo "First 5 lines of CSV:"
  echo "$OVERVIEW_EXPORT" | head -5
  echo ""
  # Save to file
  echo "$OVERVIEW_EXPORT" > "analytics-overview-export.csv"
  print_success "Saved to: analytics-overview-export.csv"
else
  print_error "Overview export failed"
fi

echo ""

# Test users export
echo -e "${YELLOW}Testing: Export users data as CSV${NC}"
echo "Endpoint: GET /admin/analytics/export?type=users"
USERS_EXPORT=$(curl -s -X GET \
  "${API_BASE}/admin/analytics/export?type=users&format=csv" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

if [ ! -z "$USERS_EXPORT" ]; then
  print_success "Users export successful"
  echo "First 5 lines of CSV:"
  echo "$USERS_EXPORT" | head -5
  echo ""
  # Save to file
  echo "$USERS_EXPORT" > "analytics-users-export.csv"
  print_success "Saved to: analytics-users-export.csv"
else
  print_error "Users export failed"
fi

echo ""

# Test engagement export
echo -e "${YELLOW}Testing: Export engagement data as CSV${NC}"
echo "Endpoint: GET /admin/analytics/export?type=engagement"
ENGAGEMENT_EXPORT=$(curl -s -X GET \
  "${API_BASE}/admin/analytics/export?type=engagement&format=csv" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

if [ ! -z "$ENGAGEMENT_EXPORT" ]; then
  print_success "Engagement export successful"
  echo "CSV content:"
  echo "$ENGAGEMENT_EXPORT"
  echo ""
  # Save to file
  echo "$ENGAGEMENT_EXPORT" > "analytics-engagement-export.csv"
  print_success "Saved to: analytics-engagement-export.csv"
else
  print_error "Engagement export failed"
fi

echo ""

# Test gamification export
echo -e "${YELLOW}Testing: Export gamification data as CSV${NC}"
echo "Endpoint: GET /admin/analytics/export?type=gamification"
GAMIFICATION_EXPORT=$(curl -s -X GET \
  "${API_BASE}/admin/analytics/export?type=gamification&format=csv" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

if [ ! -z "$GAMIFICATION_EXPORT" ]; then
  print_success "Gamification export successful"
  echo "First 10 lines of CSV:"
  echo "$GAMIFICATION_EXPORT" | head -10
  echo ""
  # Save to file
  echo "$GAMIFICATION_EXPORT" > "analytics-gamification-export.csv"
  print_success "Saved to: analytics-gamification-export.csv"
else
  print_error "Gamification export failed"
fi

################################################################################
# STEP 9: Test Error Handling
################################################################################

print_header "STEP 9: Error Handling Tests"

# Test invalid metric
echo -e "${YELLOW}Testing: Invalid metric parameter${NC}"
INVALID_METRIC=$(curl -s -w "\n%{http_code}" -X GET \
  "${API_BASE}/admin/analytics/top-users?metric=invalid" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

HTTP_CODE=$(echo "$INVALID_METRIC" | tail -n1)
if [ "$HTTP_CODE" -eq 400 ]; then
  print_success "Correctly rejected invalid metric (400 Bad Request)"
else
  print_warning "Expected 400, got ${HTTP_CODE}"
fi

echo ""

# Test invalid days (exceeds max)
echo -e "${YELLOW}Testing: Invalid days parameter (exceeds max)${NC}"
INVALID_DAYS=$(curl -s -w "\n%{http_code}" -X GET \
  "${API_BASE}/admin/analytics/activity-timeline?days=200" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

HTTP_CODE=$(echo "$INVALID_DAYS" | tail -n1)
if [ "$HTTP_CODE" -eq 400 ]; then
  print_success "Correctly rejected invalid days parameter (400 Bad Request)"
else
  print_warning "Expected 400, got ${HTTP_CODE}"
fi

echo ""

# Test invalid export type
echo -e "${YELLOW}Testing: Invalid export type${NC}"
INVALID_EXPORT=$(curl -s -w "\n%{http_code}" -X GET \
  "${API_BASE}/admin/analytics/export?type=invalid" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

HTTP_CODE=$(echo "$INVALID_EXPORT" | tail -n1)
if [ "$HTTP_CODE" -eq 400 ]; then
  print_success "Correctly rejected invalid export type (400 Bad Request)"
else
  print_warning "Expected 400, got ${HTTP_CODE}"
fi

echo ""

# Test without authentication
echo -e "${YELLOW}Testing: Request without authentication${NC}"
NO_AUTH=$(curl -s -w "\n%{http_code}" -X GET \
  "${API_BASE}/admin/analytics/overview")

HTTP_CODE=$(echo "$NO_AUTH" | tail -n1)
if [ "$HTTP_CODE" -eq 401 ]; then
  print_success "Correctly rejected request without auth (401 Unauthorized)"
else
  print_warning "Expected 401, got ${HTTP_CODE}"
fi

################################################################################
# SUMMARY
################################################################################

print_header "TEST SUMMARY"

echo -e "${GREEN}All analytics endpoints have been tested!${NC}"
echo ""
echo "Tested endpoints:"
echo "  1. GET /admin/analytics/overview"
echo "  2. GET /admin/analytics/engagement"
echo "  3. GET /admin/analytics/gamification"
echo "  4. GET /admin/analytics/activity-timeline"
echo "  5. GET /admin/analytics/top-users"
echo "  6. GET /admin/analytics/retention"
echo "  7. GET /admin/analytics/export"
echo ""
echo "Exported CSV files:"
echo "  - analytics-overview-export.csv"
echo "  - analytics-users-export.csv"
echo "  - analytics-engagement-export.csv"
echo "  - analytics-gamification-export.csv"
echo ""
echo -e "${GREEN}Testing complete!${NC}"

################################################################################
# USAGE INSTRUCTIONS
################################################################################

: <<'END_USAGE'

USAGE:
------

1. Make script executable:
   chmod +x apps/backend/scripts/test-analytics-endpoints.sh

2. Run the script:
   ./apps/backend/scripts/test-analytics-endpoints.sh

3. With custom base URL:
   BASE_URL=http://localhost:4000 ./apps/backend/scripts/test-analytics-endpoints.sh

PREREQUISITES:
--------------
- Backend server must be running
- Database must be populated with data
- jq must be installed (for JSON formatting)
- Admin user credentials required

ENDPOINTS TESTED:
-----------------
✓ Analytics Overview - High-level metrics
✓ Engagement Analytics - By user segment with filters
✓ Gamification Analytics - XP, ranks, levels distribution
✓ Activity Timeline - Daily activity metrics
✓ Top Users - Ranked by XP, exercises, streak
✓ Retention Analytics - Cohort retention metrics
✓ Export Analytics - CSV export functionality

ERROR HANDLING TESTED:
----------------------
✓ Invalid parameters (400 Bad Request)
✓ Missing authentication (401 Unauthorized)
✓ Parameter validation (class-validator)

END_USAGE
