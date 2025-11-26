#!/bin/bash

###############################################################################
# Test Script for Admin Alerts Endpoints
###############################################################################
# Description: Script de prueba para endpoints de alertas del sistema
# Module: AdminAlertsController
# Date: 2025-11-24
###############################################################################

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# API Configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:3006}"
API_PREFIX="/api"

# Test results
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

###############################################################################
# Helper Functions
###############################################################################

print_header() {
    echo -e "\n${YELLOW}========================================${NC}"
    echo -e "${YELLOW}$1${NC}"
    echo -e "${YELLOW}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
    ((PASSED_TESTS++))
    ((TOTAL_TESTS++))
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
    ((FAILED_TESTS++))
    ((TOTAL_TESTS++))
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

###############################################################################
# Authentication
###############################################################################

print_header "Autenticación"

# Check if JWT token is provided
if [ -z "$JWT_TOKEN" ]; then
    print_info "No se proporcionó JWT_TOKEN. Usando token de prueba..."
    print_info "Para usar token real: export JWT_TOKEN='your-token-here'"

    # Try to login with admin credentials
    LOGIN_RESPONSE=$(curl -s -X POST \
        "$API_BASE_URL$API_PREFIX/auth/login" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "admin@gamilit.com",
            "password": "admin123"
        }')

    JWT_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token // empty')

    if [ -z "$JWT_TOKEN" ]; then
        print_error "No se pudo obtener token de autenticación"
        print_info "Respuesta del servidor: $LOGIN_RESPONSE"
        exit 1
    else
        print_success "Token de autenticación obtenido correctamente"
    fi
else
    print_success "Usando JWT_TOKEN proporcionado"
fi

AUTH_HEADER="Authorization: Bearer $JWT_TOKEN"

###############################################################################
# Test 1: Get Alerts Statistics
###############################################################################

print_header "Test 1: Obtener estadísticas de alertas"

STATS_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET \
    "$API_BASE_URL$API_PREFIX/admin/alerts/stats/summary" \
    -H "$AUTH_HEADER" \
    -H "Content-Type: application/json")

HTTP_CODE=$(echo "$STATS_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$STATS_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    print_success "GET /admin/alerts/stats/summary - HTTP $HTTP_CODE"
    echo "Estadísticas:"
    echo "$RESPONSE_BODY" | jq '.'
else
    print_error "GET /admin/alerts/stats/summary - HTTP $HTTP_CODE"
    echo "Respuesta: $RESPONSE_BODY"
fi

###############################################################################
# Test 2: Create Manual Alert
###############################################################################

print_header "Test 2: Crear alerta manual"

CREATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    "$API_BASE_URL$API_PREFIX/admin/alerts" \
    -H "$AUTH_HEADER" \
    -H "Content-Type: application/json" \
    -d '{
        "alert_type": "performance_degradation",
        "severity": "high",
        "title": "Test Alert - High CPU Usage",
        "description": "CPU usage exceeded 90% for more than 5 minutes",
        "source_system": "backend",
        "source_module": "gamification",
        "affected_users": 150,
        "context_data": {
            "cpu_percentage": 95,
            "duration_minutes": 7
        },
        "metrics": {
            "avg_response_time_ms": 2500,
            "error_rate": 0.05
        }
    }')

HTTP_CODE=$(echo "$CREATE_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$CREATE_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "201" ]; then
    print_success "POST /admin/alerts - HTTP $HTTP_CODE"
    ALERT_ID=$(echo "$RESPONSE_BODY" | jq -r '.id')
    print_info "Alert ID: $ALERT_ID"
    echo "$RESPONSE_BODY" | jq '.'
else
    print_error "POST /admin/alerts - HTTP $HTTP_CODE"
    echo "Respuesta: $RESPONSE_BODY"
    ALERT_ID=""
fi

###############################################################################
# Test 3: List Alerts (with filters)
###############################################################################

print_header "Test 3: Listar alertas con filtros"

LIST_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET \
    "$API_BASE_URL$API_PREFIX/admin/alerts?severity=high&status=open&limit=10" \
    -H "$AUTH_HEADER" \
    -H "Content-Type: application/json")

HTTP_CODE=$(echo "$LIST_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$LIST_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    print_success "GET /admin/alerts (with filters) - HTTP $HTTP_CODE"
    TOTAL=$(echo "$RESPONSE_BODY" | jq -r '.total')
    print_info "Total de alertas: $TOTAL"
    echo "$RESPONSE_BODY" | jq '.data[0:2]'
else
    print_error "GET /admin/alerts - HTTP $HTTP_CODE"
    echo "Respuesta: $RESPONSE_BODY"
fi

###############################################################################
# Test 4: Get Alert by ID
###############################################################################

if [ -n "$ALERT_ID" ]; then
    print_header "Test 4: Obtener alerta por ID"

    GET_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET \
        "$API_BASE_URL$API_PREFIX/admin/alerts/$ALERT_ID" \
        -H "$AUTH_HEADER" \
        -H "Content-Type: application/json")

    HTTP_CODE=$(echo "$GET_RESPONSE" | tail -n1)
    RESPONSE_BODY=$(echo "$GET_RESPONSE" | sed '$d')

    if [ "$HTTP_CODE" = "200" ]; then
        print_success "GET /admin/alerts/:id - HTTP $HTTP_CODE"
        echo "$RESPONSE_BODY" | jq '.'
    else
        print_error "GET /admin/alerts/:id - HTTP $HTTP_CODE"
        echo "Respuesta: $RESPONSE_BODY"
    fi
fi

###############################################################################
# Test 5: Acknowledge Alert
###############################################################################

if [ -n "$ALERT_ID" ]; then
    print_header "Test 5: Reconocer alerta"

    ACK_RESPONSE=$(curl -s -w "\n%{http_code}" -X PATCH \
        "$API_BASE_URL$API_PREFIX/admin/alerts/$ALERT_ID/acknowledge" \
        -H "$AUTH_HEADER" \
        -H "Content-Type: application/json" \
        -d '{
            "acknowledgment_note": "Investigating CPU spike. Reviewing logs and metrics."
        }')

    HTTP_CODE=$(echo "$ACK_RESPONSE" | tail -n1)
    RESPONSE_BODY=$(echo "$ACK_RESPONSE" | sed '$d')

    if [ "$HTTP_CODE" = "200" ]; then
        print_success "PATCH /admin/alerts/:id/acknowledge - HTTP $HTTP_CODE"
        STATUS=$(echo "$RESPONSE_BODY" | jq -r '.status')
        print_info "Nuevo estado: $STATUS"
        echo "$RESPONSE_BODY" | jq '{id, status, acknowledgment_note, acknowledged_at}'
    else
        print_error "PATCH /admin/alerts/:id/acknowledge - HTTP $HTTP_CODE"
        echo "Respuesta: $RESPONSE_BODY"
    fi
fi

###############################################################################
# Test 6: Resolve Alert
###############################################################################

if [ -n "$ALERT_ID" ]; then
    print_header "Test 6: Resolver alerta"

    RESOLVE_RESPONSE=$(curl -s -w "\n%{http_code}" -X PATCH \
        "$API_BASE_URL$API_PREFIX/admin/alerts/$ALERT_ID/resolve" \
        -H "$AUTH_HEADER" \
        -H "Content-Type: application/json" \
        -d '{
            "resolution_note": "Issue resolved by scaling up backend instances and optimizing database queries. CPU usage returned to normal levels."
        }')

    HTTP_CODE=$(echo "$RESOLVE_RESPONSE" | tail -n1)
    RESPONSE_BODY=$(echo "$RESOLVE_RESPONSE" | sed '$d')

    if [ "$HTTP_CODE" = "200" ]; then
        print_success "PATCH /admin/alerts/:id/resolve - HTTP $HTTP_CODE"
        STATUS=$(echo "$RESPONSE_BODY" | jq -r '.status')
        print_info "Nuevo estado: $STATUS"
        echo "$RESPONSE_BODY" | jq '{id, status, resolution_note, resolved_at}'
    else
        print_error "PATCH /admin/alerts/:id/resolve - HTTP $HTTP_CODE"
        echo "Respuesta: $RESPONSE_BODY"
    fi
fi

###############################################################################
# Test 7: List All Alerts (no filters)
###############################################################################

print_header "Test 7: Listar todas las alertas (sin filtros)"

ALL_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET \
    "$API_BASE_URL$API_PREFIX/admin/alerts?page=1&limit=5" \
    -H "$AUTH_HEADER" \
    -H "Content-Type: application/json")

HTTP_CODE=$(echo "$ALL_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$ALL_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    print_success "GET /admin/alerts (no filters) - HTTP $HTTP_CODE"
    echo "$RESPONSE_BODY" | jq '{total, page, limit, total_pages, data: .data[0:2] | map({id, alert_type, severity, status, title})}'
else
    print_error "GET /admin/alerts - HTTP $HTTP_CODE"
    echo "Respuesta: $RESPONSE_BODY"
fi

###############################################################################
# Test Summary
###############################################################################

print_header "Resumen de Pruebas"

echo -e "Total de pruebas: ${TOTAL_TESTS}"
echo -e "${GREEN}Pruebas exitosas: ${PASSED_TESTS}${NC}"
echo -e "${RED}Pruebas fallidas: ${FAILED_TESTS}${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}✓ Todas las pruebas pasaron correctamente${NC}\n"
    exit 0
else
    echo -e "\n${RED}✗ Algunas pruebas fallaron${NC}\n"
    exit 1
fi
