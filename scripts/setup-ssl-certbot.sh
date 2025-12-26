#!/bin/bash
################################################################################
# GAMILIT Platform - Setup SSL con Certbot
################################################################################
#
# Este script configura SSL/HTTPS usando Let's Encrypt (Certbot) con Nginx.
#
# PREREQUISITOS:
#   - Dominio apuntando al servidor (DNS A record)
#   - Puertos 80 y 443 abiertos
#   - Backend y Frontend corriendo en PM2
#
# USO:
#   ./scripts/setup-ssl-certbot.sh gamilit.com
#   ./scripts/setup-ssl-certbot.sh gamilit.com www.gamilit.com
#
# ALTERNATIVA (certificado auto-firmado sin dominio):
#   ./scripts/setup-ssl-certbot.sh --self-signed
#
################################################################################

set -e  # Exit on error

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Directorio raiz del proyecto
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Variables
DOMAIN=""
EXTRA_DOMAINS=""
SELF_SIGNED=false
SERVER_IP="74.208.126.102"  # Cambiar si es diferente

################################################################################
# FUNCIONES
################################################################################

print_header() {
    echo -e "${BLUE}"
    echo "============================================================================"
    echo "  GAMILIT Platform - Setup SSL/HTTPS"
    echo "============================================================================"
    echo -e "${NC}"
}

print_step() {
    echo -e "${CYAN}→ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}! $1${NC}"
}

check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "Este script debe ejecutarse como root (sudo)"
        exit 1
    fi
}

check_prerequisites() {
    print_step "Verificando prerequisitos..."

    # Nginx
    if ! command -v nginx &> /dev/null; then
        print_warning "Nginx no instalado. Instalando..."
        apt update && apt install -y nginx
    fi
    print_success "Nginx instalado"

    # Certbot (solo si no es self-signed)
    if [ "$SELF_SIGNED" = false ]; then
        if ! command -v certbot &> /dev/null; then
            print_warning "Certbot no instalado. Instalando..."
            apt update && apt install -y certbot python3-certbot-nginx
        fi
        print_success "Certbot instalado"
    fi

    # PM2 procesos
    if ! pm2 list 2>/dev/null | grep -q "gamilit"; then
        print_warning "Procesos PM2 de GAMILIT no detectados"
        print_warning "Asegurate de que backend y frontend esten corriendo"
    else
        print_success "Procesos PM2 activos"
    fi
}

verify_dns() {
    if [ "$SELF_SIGNED" = true ]; then
        return 0
    fi

    print_step "Verificando DNS para $DOMAIN..."

    RESOLVED_IP=$(dig +short "$DOMAIN" | head -1)

    if [ -z "$RESOLVED_IP" ]; then
        print_error "No se pudo resolver $DOMAIN"
        print_error "Asegurate de que el DNS este configurado correctamente"
        exit 1
    fi

    if [ "$RESOLVED_IP" != "$SERVER_IP" ]; then
        print_warning "DNS resuelve a $RESOLVED_IP (esperado: $SERVER_IP)"
        read -p "¿Continuar de todas formas? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi

    print_success "DNS configurado correctamente ($DOMAIN → $RESOLVED_IP)"
}

create_nginx_config_http() {
    print_step "Creando configuracion Nginx inicial (HTTP)..."

    local SERVER_NAME="$DOMAIN"
    if [ -n "$EXTRA_DOMAINS" ]; then
        SERVER_NAME="$DOMAIN $EXTRA_DOMAINS"
    fi

    if [ "$SELF_SIGNED" = true ]; then
        SERVER_NAME="$SERVER_IP"
    fi

    cat > /etc/nginx/sites-available/gamilit << EOF
# GAMILIT Platform - Nginx Configuration
# Generado por setup-ssl-certbot.sh

server {
    listen 80;
    server_name $SERVER_NAME;

    # Frontend (/)
    location / {
        proxy_pass http://localhost:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Backend API (/api)
    location /api {
        proxy_pass http://localhost:3006;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # WebSocket (/socket.io)
    location /socket.io {
        proxy_pass http://localhost:3006;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
    }
}
EOF

    # Habilitar sitio
    ln -sf /etc/nginx/sites-available/gamilit /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default

    # Verificar y reiniciar
    nginx -t || { print_error "Configuracion Nginx invalida"; exit 1; }
    systemctl restart nginx

    print_success "Nginx configurado (HTTP)"
}

generate_self_signed_cert() {
    print_step "Generando certificado auto-firmado..."

    mkdir -p /etc/nginx/ssl

    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/nginx/ssl/gamilit.key \
        -out /etc/nginx/ssl/gamilit.crt \
        -subj "/C=MX/ST=Estado/L=Ciudad/O=Gamilit/CN=$SERVER_IP"

    print_success "Certificado auto-firmado generado"
}

run_certbot() {
    print_step "Ejecutando Certbot para obtener certificado SSL..."

    local CERTBOT_DOMAINS="-d $DOMAIN"
    if [ -n "$EXTRA_DOMAINS" ]; then
        for d in $EXTRA_DOMAINS; do
            CERTBOT_DOMAINS="$CERTBOT_DOMAINS -d $d"
        done
    fi

    certbot --nginx $CERTBOT_DOMAINS --non-interactive --agree-tos --email admin@$DOMAIN

    print_success "Certificado SSL obtenido"

    # Verificar renovacion automatica
    print_step "Verificando renovacion automatica..."
    certbot renew --dry-run
    print_success "Renovacion automatica configurada"
}

create_nginx_config_ssl_self_signed() {
    print_step "Configurando Nginx con SSL auto-firmado..."

    cat > /etc/nginx/sites-available/gamilit << EOF
# GAMILIT Platform - Nginx Configuration (Self-Signed SSL)
# Generado por setup-ssl-certbot.sh

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name $SERVER_IP;
    return 301 https://\$server_name\$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name $SERVER_IP;

    # SSL (auto-firmado)
    ssl_certificate /etc/nginx/ssl/gamilit.crt;
    ssl_certificate_key /etc/nginx/ssl/gamilit.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # IMPORTANTE: NO agregar headers CORS aqui
    # NestJS maneja CORS internamente

    # Frontend (/)
    location / {
        proxy_pass http://localhost:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Backend API (/api)
    location /api {
        proxy_pass http://localhost:3006;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # WebSocket (/socket.io)
    location /socket.io {
        proxy_pass http://localhost:3006;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
    }
}
EOF

    nginx -t || { print_error "Configuracion Nginx invalida"; exit 1; }
    systemctl restart nginx

    print_success "Nginx configurado con SSL auto-firmado"
}

update_env_files() {
    print_step "Actualizando archivos .env..."

    local PROTOCOL="https"
    local HOST="$DOMAIN"

    if [ "$SELF_SIGNED" = true ]; then
        HOST="$SERVER_IP"
    fi

    # Backup
    cp "$PROJECT_ROOT/apps/backend/.env.production" "$PROJECT_ROOT/apps/backend/.env.production.backup" 2>/dev/null || true
    cp "$PROJECT_ROOT/apps/frontend/.env.production" "$PROJECT_ROOT/apps/frontend/.env.production.backup" 2>/dev/null || true

    # Backend - actualizar CORS_ORIGIN y FRONTEND_URL
    if [ -f "$PROJECT_ROOT/apps/backend/.env.production" ]; then
        sed -i "s|^CORS_ORIGIN=.*|CORS_ORIGIN=https://$HOST|" "$PROJECT_ROOT/apps/backend/.env.production"
        sed -i "s|^FRONTEND_URL=.*|FRONTEND_URL=https://$HOST|" "$PROJECT_ROOT/apps/backend/.env.production"
        print_success "Backend .env.production actualizado"
    else
        print_warning "No se encontro apps/backend/.env.production"
    fi

    # Frontend - actualizar API y WS
    if [ -f "$PROJECT_ROOT/apps/frontend/.env.production" ]; then
        sed -i "s|^VITE_API_HOST=.*|VITE_API_HOST=$HOST|" "$PROJECT_ROOT/apps/frontend/.env.production"
        sed -i "s|^VITE_API_PROTOCOL=.*|VITE_API_PROTOCOL=https|" "$PROJECT_ROOT/apps/frontend/.env.production"
        sed -i "s|^VITE_WS_HOST=.*|VITE_WS_HOST=$HOST|" "$PROJECT_ROOT/apps/frontend/.env.production"
        sed -i "s|^VITE_WS_PROTOCOL=.*|VITE_WS_PROTOCOL=wss|" "$PROJECT_ROOT/apps/frontend/.env.production"
        print_success "Frontend .env.production actualizado"
    else
        print_warning "No se encontro apps/frontend/.env.production"
    fi
}

rebuild_frontend() {
    print_step "Rebuilding frontend con nuevas variables..."

    cd "$PROJECT_ROOT/apps/frontend"
    npm run build
    cd "$PROJECT_ROOT"

    print_success "Frontend rebuildeado"
}

restart_services() {
    print_step "Reiniciando servicios PM2..."

    pm2 restart all
    sleep 3

    print_success "Servicios PM2 reiniciados"
}

validate_ssl() {
    print_step "Validando configuracion SSL..."

    local HOST="$DOMAIN"
    if [ "$SELF_SIGNED" = true ]; then
        HOST="$SERVER_IP"
    fi

    # Verificar HTTPS
    local HTTPS_STATUS=$(curl -sk -o /dev/null -w "%{http_code}" "https://$HOST" || echo "000")
    if [ "$HTTPS_STATUS" == "200" ]; then
        print_success "Frontend HTTPS: OK ($HTTPS_STATUS)"
    else
        print_warning "Frontend HTTPS: $HTTPS_STATUS"
    fi

    # Verificar API
    local API_STATUS=$(curl -sk -o /dev/null -w "%{http_code}" "https://$HOST/api/health" || echo "000")
    if [ "$API_STATUS" == "200" ]; then
        print_success "Backend API HTTPS: OK ($API_STATUS)"
    else
        print_warning "Backend API HTTPS: $API_STATUS"
    fi

    # Verificar HTTP redirect
    local HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://$HOST" || echo "000")
    if [ "$HTTP_STATUS" == "301" ] || [ "$HTTP_STATUS" == "302" ]; then
        print_success "HTTP redirect a HTTPS: OK"
    else
        print_warning "HTTP redirect: $HTTP_STATUS"
    fi
}

print_summary() {
    echo ""
    echo -e "${GREEN}============================================================================${NC}"
    echo -e "${GREEN}  SSL CONFIGURADO EXITOSAMENTE${NC}"
    echo -e "${GREEN}============================================================================${NC}"
    echo ""

    local HOST="$DOMAIN"
    if [ "$SELF_SIGNED" = true ]; then
        HOST="$SERVER_IP"
        echo -e "${YELLOW}NOTA: Certificado auto-firmado. El navegador mostrara advertencia.${NC}"
        echo ""
    fi

    echo "  Frontend: https://$HOST"
    echo "  API:      https://$HOST/api"
    echo "  Health:   https://$HOST/api/health"
    echo ""
    echo "  PM2:      pm2 list"
    echo "  Logs:     pm2 logs"
    echo "  Nginx:    sudo systemctl status nginx"
    echo ""

    if [ "$SELF_SIGNED" = false ]; then
        echo "  Certificados: sudo certbot certificates"
        echo "  Renovar:      sudo certbot renew"
    fi

    echo ""
    echo -e "${GREEN}============================================================================${NC}"
}

show_help() {
    echo "Uso: $0 <dominio> [dominios adicionales...]"
    echo "      $0 --self-signed"
    echo ""
    echo "Ejemplos:"
    echo "  $0 gamilit.com"
    echo "  $0 gamilit.com www.gamilit.com"
    echo "  $0 --self-signed"
    echo ""
    echo "Opciones:"
    echo "  --self-signed    Generar certificado auto-firmado (sin dominio)"
    echo "  --help, -h       Mostrar esta ayuda"
}

################################################################################
# MAIN
################################################################################

print_header

# Parsear argumentos
if [ $# -eq 0 ]; then
    show_help
    exit 1
fi

if [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
    show_help
    exit 0
fi

if [ "$1" == "--self-signed" ]; then
    SELF_SIGNED=true
else
    DOMAIN="$1"
    shift
    EXTRA_DOMAINS="$*"
fi

# Verificar root
check_root

# Ejecutar pasos
check_prerequisites
verify_dns

if [ "$SELF_SIGNED" = true ]; then
    create_nginx_config_http
    generate_self_signed_cert
    create_nginx_config_ssl_self_signed
else
    create_nginx_config_http
    run_certbot
fi

update_env_files
rebuild_frontend
restart_services
validate_ssl
print_summary

echo ""
print_success "Setup SSL completado"
