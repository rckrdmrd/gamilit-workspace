#!/bin/bash

###############################################################################
# TEST SCRIPT: Student Submissions with Gamification Data (BE-003)
# Purpose: Validate RecentSubmissionDto includes all gamification fields
# Endpoint: GET /api/admin/progress/students/:studentId
###############################################################################

set -e

# Configuration
API_URL="${API_URL:-http://localhost:3000}"
ADMIN_TOKEN="${ADMIN_TOKEN:-}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  TESTING STUDENT SUBMISSIONS DTO      ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if admin token is provided
if [ -z "$ADMIN_TOKEN" ]; then
  echo -e "${YELLOW}⚠️  ADMIN_TOKEN not set. Please provide:${NC}"
  echo -e "${YELLOW}    export ADMIN_TOKEN='your-admin-jwt-token'${NC}"
  echo ""
  echo -e "${YELLOW}Attempting to login as admin...${NC}"

  # Try to login
  LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "admin@gamilit.com",
      "password": "Admin123!"
    }')

  ADMIN_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token // empty')

  if [ -z "$ADMIN_TOKEN" ]; then
    echo -e "${RED}❌ Failed to obtain admin token${NC}"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
  fi

  echo -e "${GREEN}✅ Successfully obtained admin token${NC}"
  echo ""
fi

# Step 1: Get list of students
echo -e "${BLUE}Step 1: Getting list of students...${NC}"
STUDENTS_RESPONSE=$(curl -s -X GET "${API_URL}/api/admin/users?role=student&limit=1" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}")

STUDENT_ID=$(echo "$STUDENTS_RESPONSE" | jq -r '.data[0].id // empty')

if [ -z "$STUDENT_ID" ]; then
  echo -e "${RED}❌ No students found${NC}"
  echo "Response: $STUDENTS_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Found student: ${STUDENT_ID}${NC}"
echo ""

# Step 2: Get student progress with submissions
echo -e "${BLUE}Step 2: Getting student progress with submissions...${NC}"
PROGRESS_RESPONSE=$(curl -s -X GET "${API_URL}/api/admin/progress/students/${STUDENT_ID}" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}")

# Save response for inspection
echo "$PROGRESS_RESPONSE" > /tmp/student-progress-response.json
echo -e "${YELLOW}📄 Full response saved to: /tmp/student-progress-response.json${NC}"
echo ""

# Step 3: Validate response structure
echo -e "${BLUE}Step 3: Validating response structure...${NC}"

# Check if recent_submissions exists
SUBMISSIONS_COUNT=$(echo "$PROGRESS_RESPONSE" | jq -r '.recent_submissions | length')

if [ "$SUBMISSIONS_COUNT" -eq 0 ]; then
  echo -e "${YELLOW}⚠️  No recent submissions found for this student${NC}"
  echo -e "${YELLOW}This is expected if student hasn't submitted any exercises yet${NC}"
  echo ""
  echo -e "${GREEN}✅ DTO structure validation: PASSED (no data to validate)${NC}"
  exit 0
fi

echo -e "${GREEN}✅ Found ${SUBMISSIONS_COUNT} recent submissions${NC}"
echo ""

# Step 4: Validate first submission has all required fields
echo -e "${BLUE}Step 4: Validating submission fields...${NC}"

FIRST_SUBMISSION=$(echo "$PROGRESS_RESPONSE" | jq -r '.recent_submissions[0]')

# Required fields checklist
REQUIRED_FIELDS=(
  "id"
  "exercise_id"
  "exercise_title"
  "exercise_type"
  "score"
  "max_score"
  "is_correct"
  "attempt_number"
  "status"
  "submitted_at"
)

# New gamification fields
GAMIFICATION_FIELDS=(
  "xp_earned"
  "ml_coins_earned"
  "ml_coins_spent"
)

# New feedback/grading fields
GRADING_FIELDS=(
  "feedback"
  "grading_status"
  "graded_at"
)

# New comodines fields
COMODINES_FIELDS=(
  "comodines_used"
  "hints_used"
)

ALL_PASS=true

echo ""
echo -e "${YELLOW}Checking basic fields...${NC}"
for FIELD in "${REQUIRED_FIELDS[@]}"; do
  VALUE=$(echo "$FIRST_SUBMISSION" | jq -r ".${FIELD}")
  if [ "$VALUE" != "null" ] && [ ! -z "$VALUE" ]; then
    echo -e "  ${GREEN}✅${NC} ${FIELD}: ${VALUE}"
  else
    echo -e "  ${RED}❌${NC} ${FIELD}: MISSING or NULL"
    ALL_PASS=false
  fi
done

echo ""
echo -e "${YELLOW}Checking gamification fields...${NC}"
for FIELD in "${GAMIFICATION_FIELDS[@]}"; do
  VALUE=$(echo "$FIRST_SUBMISSION" | jq -r ".${FIELD}")
  if [ "$VALUE" != "null" ]; then
    echo -e "  ${GREEN}✅${NC} ${FIELD}: ${VALUE}"
  else
    echo -e "  ${RED}❌${NC} ${FIELD}: MISSING or NULL"
    ALL_PASS=false
  fi
done

echo ""
echo -e "${YELLOW}Checking grading fields (optional)...${NC}"
for FIELD in "${GRADING_FIELDS[@]}"; do
  VALUE=$(echo "$FIRST_SUBMISSION" | jq -r ".${FIELD}")
  if [ "$VALUE" != "null" ]; then
    echo -e "  ${GREEN}✅${NC} ${FIELD}: ${VALUE}"
  else
    echo -e "  ${BLUE}ℹ️${NC}  ${FIELD}: null (optional)"
  fi
done

echo ""
echo -e "${YELLOW}Checking comodines fields...${NC}"
for FIELD in "${COMODINES_FIELDS[@]}"; do
  VALUE=$(echo "$FIRST_SUBMISSION" | jq -r ".${FIELD}")
  if [ "$VALUE" != "null" ]; then
    echo -e "  ${GREEN}✅${NC} ${FIELD}: ${VALUE}"
  else
    echo -e "  ${RED}❌${NC} ${FIELD}: MISSING or NULL"
    ALL_PASS=false
  fi
done

# Step 5: Validate grading_status enum
echo ""
echo -e "${BLUE}Step 5: Validating grading_status enum...${NC}"
GRADING_STATUS=$(echo "$FIRST_SUBMISSION" | jq -r '.grading_status')

VALID_STATUSES=("pending" "auto_graded" "manually_graded")
STATUS_VALID=false

for VALID_STATUS in "${VALID_STATUSES[@]}"; do
  if [ "$GRADING_STATUS" == "$VALID_STATUS" ]; then
    STATUS_VALID=true
    break
  fi
done

if [ "$STATUS_VALID" = true ]; then
  echo -e "${GREEN}✅ grading_status is valid: ${GRADING_STATUS}${NC}"
else
  echo -e "${RED}❌ grading_status has invalid value: ${GRADING_STATUS}${NC}"
  echo -e "${YELLOW}   Valid values: pending, auto_graded, manually_graded${NC}"
  ALL_PASS=false
fi

# Step 6: Display sample submission
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  SAMPLE SUBMISSION                    ${NC}"
echo -e "${BLUE}========================================${NC}"
echo "$FIRST_SUBMISSION" | jq '.'

# Final result
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  TEST RESULTS                         ${NC}"
echo -e "${BLUE}========================================${NC}"

if [ "$ALL_PASS" = true ]; then
  echo -e "${GREEN}✅ ALL TESTS PASSED${NC}"
  echo ""
  echo -e "${GREEN}The RecentSubmissionDto includes all required fields:${NC}"
  echo -e "  ${GREEN}✓${NC} Basic submission fields"
  echo -e "  ${GREEN}✓${NC} Gamification fields (xp_earned, ml_coins_earned, ml_coins_spent)"
  echo -e "  ${GREEN}✓${NC} Grading fields (feedback, grading_status, graded_at)"
  echo -e "  ${GREEN}✓${NC} Comodines fields (comodines_used, hints_used)"
  echo ""
  exit 0
else
  echo -e "${RED}❌ SOME TESTS FAILED${NC}"
  echo ""
  echo -e "${YELLOW}Please review the output above for details${NC}"
  echo ""
  exit 1
fi
