#!/bin/bash

# Test script for grading API pagination
# Tests the corrected response structure

BASE_URL="http://localhost:3000/api/teacher/submissions"
TOKEN="${AUTH_TOKEN:-your-auth-token-here}"

echo "========================================"
echo "Testing Grading API Pagination"
echo "========================================"
echo ""

# Test 1: Get all pending submissions
echo "Test 1: Get pending submissions (page 1, limit 10)"
echo "--------------------------------------"
curl -s -X GET "${BASE_URL}?status=pending&page=1&limit=10" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" | jq '.'
echo ""

# Test 2: Verify response structure
echo "Test 2: Verify response has pagination structure"
echo "--------------------------------------"
RESPONSE=$(curl -s -X GET "${BASE_URL}?status=pending&page=1&limit=5" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json")

echo "Response structure:"
echo "$RESPONSE" | jq 'keys'
echo ""

# Check for required fields
echo "Checking required fields:"
echo "  - submissions: $(echo "$RESPONSE" | jq -e 'has("submissions")' && echo "✅ EXISTS" || echo "❌ MISSING")"
echo "  - total: $(echo "$RESPONSE" | jq -e 'has("total")' && echo "✅ EXISTS" || echo "❌ MISSING")"
echo "  - page: $(echo "$RESPONSE" | jq -e 'has("page")' && echo "✅ EXISTS" || echo "❌ MISSING")"
echo "  - limit: $(echo "$RESPONSE" | jq -e 'has("limit")' && echo "✅ EXISTS" || echo "❌ MISSING")"
echo ""

# Test 3: Get graded submissions
echo "Test 3: Get graded submissions"
echo "--------------------------------------"
curl -s -X GET "${BASE_URL}?status=graded&limit=5" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" | jq '.total, .page, .limit, (.submissions | length)'
echo ""

# Test 4: Filter by classroom
echo "Test 4: Filter by classroom_id"
echo "--------------------------------------"
CLASSROOM_ID="${CLASSROOM_ID:-your-classroom-id}"
curl -s -X GET "${BASE_URL}?classroom_id=${CLASSROOM_ID}&limit=10" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" | jq '{total, page, limit, submissions_count: (.submissions | length)}'
echo ""

# Test 5: Filter by date range
echo "Test 5: Filter by date range"
echo "--------------------------------------"
curl -s -X GET "${BASE_URL}?start_date=2025-01-01&end_date=2025-01-31&limit=10" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" | jq '{total, page, limit, submissions_count: (.submissions | length)}'
echo ""

# Test 6: Pagination test (multiple pages)
echo "Test 6: Pagination - Page 1"
echo "--------------------------------------"
curl -s -X GET "${BASE_URL}?status=pending&page=1&limit=3" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" | jq '{page, limit, total, submissions_count: (.submissions | length)}'
echo ""

echo "Test 6: Pagination - Page 2"
echo "--------------------------------------"
curl -s -X GET "${BASE_URL}?status=pending&page=2&limit=3" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" | jq '{page, limit, total, submissions_count: (.submissions | length)}'
echo ""

echo "========================================"
echo "Testing Complete"
echo "========================================"
echo ""
echo "Expected Response Structure:"
echo "{"
echo "  \"submissions\": [ ... ],  // Array of Submission objects"
echo "  \"total\": number,         // Total count of submissions"
echo "  \"page\": number,          // Current page"
echo "  \"limit\": number          // Items per page"
echo "}"
