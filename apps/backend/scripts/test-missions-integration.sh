#!/bin/bash

###############################################################################
# Script de Prueba: Integración MissionsService en ExerciseAttemptService
#
# Propósito: Validar que las misiones se actualizan correctamente al completar ejercicios
#
# Flujo de prueba:
# 1. Crear una misión diaria con objetivo 'complete_exercises'
# 2. Completar un ejercicio correctamente
# 3. Verificar que la misión se actualizó
#
# Uso: bash scripts/test-missions-integration.sh
###############################################################################

set -e

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

API_BASE_URL="http://localhost:3000/api"
AUTH_TOKEN=""

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Test: Missions Integration - Exercise Completion${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Step 1: Login como estudiante
echo -e "${YELLOW}[1/5] Logging in as student...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student1@test.com",
    "password": "test123"
  }')

AUTH_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')
USER_ID=$(echo $LOGIN_RESPONSE | jq -r '.user.id')

if [ -z "$AUTH_TOKEN" ] || [ "$AUTH_TOKEN" = "null" ]; then
  echo -e "${RED}❌ Login failed${NC}"
  echo "$LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Logged in successfully (User ID: $USER_ID)${NC}\n"

# Step 2: Obtener misiones diarias actuales
echo -e "${YELLOW}[2/5] Getting current daily missions...${NC}"
MISSIONS_BEFORE=$(curl -s -X GET "${API_BASE_URL}/gamification/missions?type=daily" \
  -H "Authorization: Bearer ${AUTH_TOKEN}")

echo -e "${BLUE}Current missions:${NC}"
echo "$MISSIONS_BEFORE" | jq '.[] | {id, title, progress, objectives}'
echo ""

MISSION_ID=$(echo "$MISSIONS_BEFORE" | jq -r '.[0].id')
PROGRESS_BEFORE=$(echo "$MISSIONS_BEFORE" | jq -r '.[0].progress')

echo -e "${GREEN}Mission ID: $MISSION_ID${NC}"
echo -e "${GREEN}Progress before: $PROGRESS_BEFORE%${NC}\n"

# Step 3: Obtener un ejercicio activo
echo -e "${YELLOW}[3/5] Getting active exercise...${NC}"
EXERCISES=$(curl -s -X GET "${API_BASE_URL}/educational/exercises?is_active=true" \
  -H "Authorization: Bearer ${AUTH_TOKEN}")

EXERCISE_ID=$(echo "$EXERCISES" | jq -r '.[0].id')
EXERCISE_TITLE=$(echo "$EXERCISES" | jq -r '.[0].title')

if [ -z "$EXERCISE_ID" ] || [ "$EXERCISE_ID" = "null" ]; then
  echo -e "${RED}❌ No active exercises found${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Exercise found: $EXERCISE_TITLE (ID: $EXERCISE_ID)${NC}\n"

# Step 4: Crear un intento de ejercicio CORRECTO
echo -e "${YELLOW}[4/5] Creating correct exercise attempt...${NC}"
ATTEMPT_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/progress/exercise-attempts" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"exercise_id\": \"$EXERCISE_ID\",
    \"is_correct\": true,
    \"score\": 100,
    \"xp_earned\": 100,
    \"ml_coins_earned\": 10,
    \"time_spent\": 60,
    \"hints_used\": 0,
    \"comodines_used\": [],
    \"submitted_answers\": {\"answer\": \"correct\"}
  }")

ATTEMPT_ID=$(echo "$ATTEMPT_RESPONSE" | jq -r '.id')

if [ -z "$ATTEMPT_ID" ] || [ "$ATTEMPT_ID" = "null" ]; then
  echo -e "${RED}❌ Failed to create attempt${NC}"
  echo "$ATTEMPT_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Attempt created successfully (ID: $ATTEMPT_ID)${NC}"
echo -e "${BLUE}XP Earned:${NC} $(echo "$ATTEMPT_RESPONSE" | jq -r '.xp_earned')"
echo -e "${BLUE}ML Coins Earned:${NC} $(echo "$ATTEMPT_RESPONSE" | jq -r '.ml_coins_earned')\n"

# Wait for async processing
echo -e "${YELLOW}Waiting 2 seconds for missions update...${NC}"
sleep 2

# Step 5: Verificar que la misión se actualizó
echo -e "${YELLOW}[5/5] Verifying mission progress updated...${NC}"
MISSIONS_AFTER=$(curl -s -X GET "${API_BASE_URL}/gamification/missions?type=daily" \
  -H "Authorization: Bearer ${AUTH_TOKEN}")

PROGRESS_AFTER=$(echo "$MISSIONS_AFTER" | jq -r '.[0].progress')
OBJECTIVE_CURRENT=$(echo "$MISSIONS_AFTER" | jq -r '.[0].objectives[0].current')
OBJECTIVE_TARGET=$(echo "$MISSIONS_AFTER" | jq -r '.[0].objectives[0].target')

echo -e "${BLUE}Progress after: $PROGRESS_AFTER%${NC}"
echo -e "${BLUE}Objective progress: $OBJECTIVE_CURRENT / $OBJECTIVE_TARGET${NC}\n"

# Validación
if (( $(echo "$PROGRESS_AFTER > $PROGRESS_BEFORE" | bc -l) )); then
  echo -e "${GREEN}========================================${NC}"
  echo -e "${GREEN}✅ TEST PASSED: Mission progress updated!${NC}"
  echo -e "${GREEN}Progress increased from $PROGRESS_BEFORE% to $PROGRESS_AFTER%${NC}"
  echo -e "${GREEN}========================================${NC}"
  exit 0
else
  echo -e "${RED}========================================${NC}"
  echo -e "${RED}❌ TEST FAILED: Mission progress not updated${NC}"
  echo -e "${RED}Progress remained at $PROGRESS_BEFORE%${NC}"
  echo -e "${RED}========================================${NC}"
  echo -e "\n${YELLOW}Debug Info:${NC}"
  echo -e "${BLUE}Missions after:${NC}"
  echo "$MISSIONS_AFTER" | jq '.'
  exit 1
fi
