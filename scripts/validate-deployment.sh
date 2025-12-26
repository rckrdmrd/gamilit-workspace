#!/bin/bash
################################################################################
# GAMILIT Platform - Validacion de Deployment
################################################################################
#
# Este script valida que el deployment este funcionando correctamente.
# Ejecutar despues de cualquier deployment o cambio de configuracion.
#
# USO:
#   ./scripts/validate-deployment.sh
#   ./scripts/validate-deployment.sh --ssl
#   ./scripts/validate-deployment.sh --verbose
#
################################################################################

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Variables
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERBOSE=false
CHECK_SSL=false
ERRORS=0
WARNINGS=0

# Valores esperados en BD
EXPECTED_TENANTS=14
EXPECTED_USERS=20
EXPECTED_MODULES=5
EXPECTED_RANKS=5
EXPECTED_FLAGS=26

################################################################################
# FUNCIONES
################################################################################

print_header() {
    echo -e "${BLUE}"
    echo "============================================================================"
    echo "  GAMILIT Platform - Validacion de Deployment"
    echo "============================================================================"
    echo -e "${NC}"
}

print_section() {
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

check_ok() {
    echo -e "${GREEN}✓${NC} $1"
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
    ((ERRORS++))
}

check_warn() {
    echo -e "${YELLOW}!${NC} $1"
    ((WARNINGS++))
}

check_info() {
    if [ "$VERBOSE" = true ]; then
        echo -e "${BLUE}ℹ${NC} $1"
    fi
}

################################################################################
# VALIDACIONES
################################################################################

validate_env_files() {
    print_section "ARCHIVOS DE CONFIGURACION"

    # Backend .env.production
    if [ -f "$PROJECT_ROOT/apps/backend/.env.production" ]; then
        check_ok "Backend .env.production existe"

        # Verificar variables criticas
        if grep -q "^JWT_SECRET=.*CHANGE\|^JWT_SECRET=$" "$PROJECT_ROOT/apps/backend/.env.production" 2>/dev/null; then
            check_fail "JWT_SECRET no configurado correctamente"
        else
            check_ok "JWT_SECRET configurado"
        fi

        if grep -q "^DB_PASSWORD=$\|^DB_PASSWORD=<" "$PROJECT_ROOT/apps/backend/.env.production" 2>/dev/null; then
            check_fail "DB_PASSWORD no configurado"
        else
            check_ok "DB_PASSWORD configurado"
        fi

        if grep -q "^CORS_ORIGIN=" "$PROJECT_ROOT/apps/backend/.env.production"; then
            CORS=$(grep "^CORS_ORIGIN=" "$PROJECT_ROOT/apps/backend/.env.production" | cut -d'=' -f2)
            check_ok "CORS_ORIGIN: $CORS"
        else
            check_warn "CORS_ORIGIN no definido"
        fi

        if grep -q "^ENABLE_SWAGGER=true" "$PROJECT_ROOT/apps/backend/.env.production"; then
            check_warn "ENABLE_SWAGGER=true en produccion (deberia ser false)"
        fi
    else
        check_fail "Backend .env.production NO existe"
    fi

    # Frontend .env.production
    if [ -f "$PROJECT_ROOT/apps/frontend/.env.production" ]; then
        check_ok "Frontend .env.production existe"

        if grep -q "^VITE_API_PROTOCOL=https" "$PROJECT_ROOT/apps/frontend/.env.production"; then
            check_ok "VITE_API_PROTOCOL=https"
        else
            check_warn "VITE_API_PROTOCOL no es https"
        fi

        if grep -q "^VITE_WS_PROTOCOL=wss" "$PROJECT_ROOT/apps/frontend/.env.production"; then
            check_ok "VITE_WS_PROTOCOL=wss"
        else
            check_warn "VITE_WS_PROTOCOL no es wss"
        fi

        if grep -q "^VITE_MOCK_API=true" "$PROJECT_ROOT/apps/frontend/.env.production"; then
            check_fail "VITE_MOCK_API=true en produccion"
        fi
    else
        check_fail "Frontend .env.production NO existe"
    fi
}

validate_builds() {
    print_section "BUILDS"

    # Backend build
    if [ -f "$PROJECT_ROOT/apps/backend/dist/main.js" ]; then
        check_ok "Backend build existe (dist/main.js)"
        BUILD_DATE=$(stat -c %y "$PROJECT_ROOT/apps/backend/dist/main.js" 2>/dev/null | cut -d' ' -f1)
        check_info "Backend build fecha: $BUILD_DATE"
    else
        check_fail "Backend build NO existe"
    fi

    # Frontend build
    if [ -d "$PROJECT_ROOT/apps/frontend/dist" ]; then
        check_ok "Frontend build existe (dist/)"
        FILE_COUNT=$(find "$PROJECT_ROOT/apps/frontend/dist" -type f | wc -l)
        check_info "Frontend: $FILE_COUNT archivos en dist/"
    else
        check_fail "Frontend build NO existe"
    fi
}

validate_pm2() {
    print_section "PM2 PROCESOS"

    if ! command -v pm2 &> /dev/null; then
        check_fail "PM2 no esta instalado"
        return
    fi

    # Backend
    if pm2 list 2>/dev/null | grep -q "gamilit-backend.*online"; then
        check_ok "gamilit-backend: online"

        # Obtener info adicional
        BACKEND_INSTANCES=$(pm2 jlist 2>/dev/null | grep -o '"name":"gamilit-backend"' | wc -l)
        check_info "Backend instancias: $BACKEND_INSTANCES"
    else
        check_fail "gamilit-backend: NO esta online"
    fi

    # Frontend
    if pm2 list 2>/dev/null | grep -q "gamilit-frontend.*online"; then
        check_ok "gamilit-frontend: online"
    else
        check_fail "gamilit-frontend: NO esta online"
    fi

    # Verificar si hay errores recientes en logs
    BACKEND_ERRORS=$(pm2 logs gamilit-backend --lines 50 --nostream 2>/dev/null | grep -i "error\|exception" | wc -l)
    if [ "$BACKEND_ERRORS" -gt 0 ]; then
        check_warn "Backend tiene $BACKEND_ERRORS errores en ultimos 50 logs"
    else
        check_ok "Backend logs sin errores recientes"
    fi

    FRONTEND_ERRORS=$(pm2 logs gamilit-frontend --lines 50 --nostream 2>/dev/null | grep -i "error\|exception" | wc -l)
    if [ "$FRONTEND_ERRORS" -gt 0 ]; then
        check_warn "Frontend tiene $FRONTEND_ERRORS errores en ultimos 50 logs"
    else
        check_ok "Frontend logs sin errores recientes"
    fi
}

validate_endpoints() {
    print_section "ENDPOINTS (HTTP LOCAL)"

    # Backend health
    BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3006/api/health 2>/dev/null || echo "000")
    if [ "$BACKEND_STATUS" == "200" ]; then
        check_ok "Backend health: HTTP $BACKEND_STATUS"

        # Obtener mas info
        if [ "$VERBOSE" = true ]; then
            HEALTH_RESPONSE=$(curl -s http://localhost:3006/api/health 2>/dev/null | head -c 200)
            check_info "Response: $HEALTH_RESPONSE..."
        fi
    else
        check_fail "Backend health: HTTP $BACKEND_STATUS"
    fi

    # Frontend
    FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3005 2>/dev/null || echo "000")
    if [ "$FRONTEND_STATUS" == "200" ]; then
        check_ok "Frontend: HTTP $FRONTEND_STATUS"
    else
        check_fail "Frontend: HTTP $FRONTEND_STATUS"
    fi

    # API v1
    API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3006/api/v1/health 2>/dev/null || echo "000")
    if [ "$API_STATUS" == "200" ]; then
        check_ok "API v1 health: HTTP $API_STATUS"
    elif [ "$API_STATUS" == "404" ]; then
        check_info "API v1 health: 404 (endpoint puede no existir)"
    else
        check_warn "API v1 health: HTTP $API_STATUS"
    fi
}

validate_ssl() {
    print_section "SSL/HTTPS"

    # Verificar Nginx
    if systemctl is-active --quiet nginx 2>/dev/null; then
        check_ok "Nginx: activo"
    else
        check_warn "Nginx: no activo o no instalado"
        return
    fi

    # Obtener dominio/IP de config
    local HOST=""
    if [ -f "$PROJECT_ROOT/apps/frontend/.env.production" ]; then
        HOST=$(grep "^VITE_API_HOST=" "$PROJECT_ROOT/apps/frontend/.env.production" | cut -d'=' -f2 | tr -d '"')
    fi

    if [ -z "$HOST" ]; then
        HOST="localhost"
    fi

    # HTTPS frontend
    HTTPS_FRONTEND=$(curl -sk -o /dev/null -w "%{http_code}" "https://$HOST" 2>/dev/null || echo "000")
    if [ "$HTTPS_FRONTEND" == "200" ]; then
        check_ok "HTTPS Frontend ($HOST): HTTP $HTTPS_FRONTEND"
    elif [ "$HTTPS_FRONTEND" == "000" ]; then
        check_warn "HTTPS Frontend ($HOST): No responde"
    else
        check_warn "HTTPS Frontend ($HOST): HTTP $HTTPS_FRONTEND"
    fi

    # HTTPS API
    HTTPS_API=$(curl -sk -o /dev/null -w "%{http_code}" "https://$HOST/api/health" 2>/dev/null || echo "000")
    if [ "$HTTPS_API" == "200" ]; then
        check_ok "HTTPS API ($HOST/api): HTTP $HTTPS_API"
    elif [ "$HTTPS_API" == "000" ]; then
        check_warn "HTTPS API ($HOST/api): No responde"
    else
        check_warn "HTTPS API ($HOST/api): HTTP $HTTPS_API"
    fi

    # Verificar certificado
    if command -v openssl &> /dev/null; then
        CERT_EXPIRY=$(echo | openssl s_client -servername "$HOST" -connect "$HOST:443" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null | grep "notAfter" | cut -d'=' -f2)
        if [ -n "$CERT_EXPIRY" ]; then
            check_ok "Certificado SSL valido hasta: $CERT_EXPIRY"
        fi
    fi

    # HTTP redirect
    HTTP_REDIRECT=$(curl -s -o /dev/null -w "%{http_code}" "http://$HOST" 2>/dev/null || echo "000")
    if [ "$HTTP_REDIRECT" == "301" ] || [ "$HTTP_REDIRECT" == "302" ]; then
        check_ok "HTTP redirect a HTTPS: $HTTP_REDIRECT"
    elif [ "$HTTP_REDIRECT" == "200" ]; then
        check_warn "HTTP no redirige a HTTPS"
    fi
}

validate_database() {
    print_section "BASE DE DATOS"

    # Verificar conexion
    if [ -z "$DATABASE_URL" ]; then
        # Intentar construir desde .env
        if [ -f "$PROJECT_ROOT/apps/backend/.env.production" ]; then
            source "$PROJECT_ROOT/apps/backend/.env.production" 2>/dev/null || true
            if [ -n "$DB_HOST" ] && [ -n "$DB_USER" ] && [ -n "$DB_PASSWORD" ] && [ -n "$DB_NAME" ]; then
                DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:${DB_PORT:-5432}/$DB_NAME"
            fi
        fi
    fi

    if [ -z "$DATABASE_URL" ]; then
        check_warn "DATABASE_URL no configurada, saltando validacion de BD"
        return
    fi

    # Test conexion
    if psql "$DATABASE_URL" -c "SELECT 1" &>/dev/null; then
        check_ok "Conexion a PostgreSQL exitosa"
    else
        check_fail "No se puede conectar a PostgreSQL"
        return
    fi

    # Contar registros
    echo ""
    echo "  Conteo de registros:"

    TENANTS=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM auth_management.tenants" 2>/dev/null | tr -d ' ')
    if [ "$TENANTS" -ge "$EXPECTED_TENANTS" ]; then
        check_ok "  tenants: $TENANTS (esperado: $EXPECTED_TENANTS+)"
    else
        check_warn "  tenants: $TENANTS (esperado: $EXPECTED_TENANTS+)"
    fi

    USERS=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM auth.users" 2>/dev/null | tr -d ' ')
    if [ "$USERS" -ge "$EXPECTED_USERS" ]; then
        check_ok "  users: $USERS (esperado: $EXPECTED_USERS+)"
    else
        check_warn "  users: $USERS (esperado: $EXPECTED_USERS+)"
    fi

    MODULES=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM educational_content.modules" 2>/dev/null | tr -d ' ')
    if [ "$MODULES" -ge "$EXPECTED_MODULES" ]; then
        check_ok "  modules: $MODULES (esperado: $EXPECTED_MODULES)"
    else
        check_warn "  modules: $MODULES (esperado: $EXPECTED_MODULES)"
    fi

    RANKS=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM gamification_system.maya_ranks" 2>/dev/null | tr -d ' ')
    if [ "$RANKS" -ge "$EXPECTED_RANKS" ]; then
        check_ok "  maya_ranks: $RANKS (esperado: $EXPECTED_RANKS)"
    else
        check_warn "  maya_ranks: $RANKS (esperado: $EXPECTED_RANKS)"
    fi

    FLAGS=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM system_configuration.feature_flags" 2>/dev/null | tr -d ' ')
    if [ "$FLAGS" -ge "$EXPECTED_FLAGS" ]; then
        check_ok "  feature_flags: $FLAGS (esperado: $EXPECTED_FLAGS+)"
    else
        check_warn "  feature_flags: $FLAGS (esperado: $EXPECTED_FLAGS+)"
    fi
}

validate_logs_dir() {
    print_section "DIRECTORIO DE LOGS"

    if [ -d "$PROJECT_ROOT/logs" ]; then
        check_ok "Directorio logs/ existe"

        # Verificar archivos de log
        for LOG_FILE in "backend-error.log" "backend-out.log" "frontend-error.log" "frontend-out.log"; do
            if [ -f "$PROJECT_ROOT/logs/$LOG_FILE" ]; then
                SIZE=$(du -h "$PROJECT_ROOT/logs/$LOG_FILE" | cut -f1)
                check_info "$LOG_FILE: $SIZE"
            fi
        done
    else
        check_warn "Directorio logs/ no existe"
    fi
}

print_summary() {
    echo ""
    echo -e "${BLUE}============================================================================${NC}"
    echo -e "${BLUE}  RESUMEN DE VALIDACION${NC}"
    echo -e "${BLUE}============================================================================${NC}"
    echo ""

    if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}  ✓ DEPLOYMENT VALIDADO: Todo OK${NC}"
    elif [ $ERRORS -eq 0 ]; then
        echo -e "${YELLOW}  ! DEPLOYMENT CON ADVERTENCIAS: $WARNINGS warnings${NC}"
    else
        echo -e "${RED}  ✗ DEPLOYMENT CON ERRORES: $ERRORS errores, $WARNINGS warnings${NC}"
    fi

    echo ""
    echo "  Errores:      $ERRORS"
    echo "  Advertencias: $WARNINGS"
    echo ""

    if [ $ERRORS -gt 0 ]; then
        echo -e "${RED}  Revisa los errores antes de continuar.${NC}"
        exit 1
    fi
}

show_help() {
    echo "Uso: $0 [opciones]"
    echo ""
    echo "Opciones:"
    echo "  --ssl       Incluir validacion de SSL/HTTPS"
    echo "  --verbose   Mostrar informacion adicional"
    echo "  --help, -h  Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0                  # Validacion basica"
    echo "  $0 --ssl            # Incluir SSL"
    echo "  $0 --ssl --verbose  # Completo con detalles"
}

################################################################################
# MAIN
################################################################################

# Parsear argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        --ssl)
            CHECK_SSL=true
            shift
            ;;
        --verbose|-v)
            VERBOSE=true
            shift
            ;;
        --help|-h)
            show_help
            exit 0
            ;;
        *)
            echo "Opcion desconocida: $1"
            show_help
            exit 1
            ;;
    esac
done

print_header

validate_env_files
validate_builds
validate_pm2
validate_endpoints

if [ "$CHECK_SSL" = true ]; then
    validate_ssl
fi

validate_database
validate_logs_dir

print_summary
