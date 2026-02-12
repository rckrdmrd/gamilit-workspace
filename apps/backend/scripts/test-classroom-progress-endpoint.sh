#!/bin/bash

# Script para probar el endpoint GET /api/v1/teacher/classrooms/:id/progress

set -e

BASE_URL="http://localhost:3006/api/v1"
TEACHER_EMAIL="teacher@gamilit.com"
TEACHER_PASSWORD="Test1234"
CLASSROOM_ID="60000000-0000-0000-0000-000000000001"

echo "=========================================="
echo "Testing Classroom Progress Endpoint"
echo "=========================================="
echo ""

# Step 1: Login to get JWT token
echo "Step 1: Logging in as teacher..."
LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEACHER_EMAIL}\",
    \"password\": \"${TEACHER_PASSWORD}\"
  }")

echo "Login Response: ${LOGIN_RESPONSE}"
echo ""

# Extract token using grep and sed (works without jq)
TOKEN=$(echo "${LOGIN_RESPONSE}" | grep -o '"accessToken":"[^"]*' | sed 's/"accessToken":"//')

if [ -z "$TOKEN" ]; then
  echo "ERROR: Failed to extract JWT token"
  echo "Login response: ${LOGIN_RESPONSE}"
  exit 1
fi

echo "JWT Token obtained: ${TOKEN:0:20}..."
echo ""

# Step 2: Call the classroom progress endpoint
echo "Step 2: Fetching classroom progress..."
echo "Classroom ID: ${CLASSROOM_ID}"
echo ""

PROGRESS_RESPONSE=$(curl -s -X GET "${BASE_URL}/teacher/classrooms/${CLASSROOM_ID}/progress" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json")

echo "=========================================="
echo "RESPONSE:"
echo "=========================================="
echo "${PROGRESS_RESPONSE}" | python3 -m json.tool 2>/dev/null || echo "${PROGRESS_RESPONSE}"
echo ""

# Check if response contains expected fields
if echo "${PROGRESS_RESPONSE}" | grep -q "classroomData"; then
  echo "SUCCESS: Response contains 'classroomData'"
else
  echo "WARNING: Response does not contain 'classroomData'"
fi

if echo "${PROGRESS_RESPONSE}" | grep -q "moduleProgress"; then
  echo "SUCCESS: Response contains 'moduleProgress'"
else
  echo "WARNING: Response does not contain 'moduleProgress'"
fi

echo ""
echo "=========================================="
echo "Test completed"
echo "=========================================="
