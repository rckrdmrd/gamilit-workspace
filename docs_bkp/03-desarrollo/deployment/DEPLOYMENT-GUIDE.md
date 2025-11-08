# GAMILIT - Guía Completa de Deployment

> **Gamified Literacy Interactive Training - Production Deployment Guide**
>
> Guía técnica completa para el deployment de la plataforma GAMILIT en todos los ambientes.

**Versión:** 1.0.0
**Fecha:** 27 de Octubre, 2025
**Estado:** Production-Ready
**Última Actualización:** 2025-10-27

---

## Tabla de Contenidos

1. [Visión General](#1-visión-general)
2. [Ambientes](#2-ambientes)
3. [Pre-requisitos](#3-pre-requisitos)
4. [Deployment Backend](#4-deployment-backend)
5. [Deployment Frontend](#5-deployment-frontend)
6. [Database Deployment](#6-database-deployment)
7. [Monitoring y Logging](#7-monitoring-y-logging)
8. [CI/CD Pipeline](#8-cicd-pipeline)
9. [Checklists](#9-checklists)
10. [Disaster Recovery](#10-disaster-recovery)
11. [Ejemplos de Configuración](#11-ejemplos-de-configuración)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Visión General

### 1.1 Arquitectura de Deployment

```
┌─────────────────────────────────────────────────────────────────┐
│                     GAMILIT DEPLOYMENT ARCHITECTURE              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Internet                                                         │
│      │                                                            │
│      ▼                                                            │
│  ┌──────────┐                                                    │
│  │  CDN     │ (CloudFlare/CloudFront - Static Assets)           │
│  └────┬─────┘                                                    │
│       │                                                           │
│       ▼                                                           │
│  ┌──────────────────┐                                            │
│  │   Load Balancer  │ (Nginx/HAProxy)                           │
│  └────┬─────────────┘                                            │
│       │                                                           │
│       ├──────────────┬──────────────┬──────────────┐            │
│       ▼              ▼              ▼              ▼            │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐        │
│  │Frontend │   │Frontend │   │Backend  │   │Backend  │        │
│  │Instance │   │Instance │   │Instance │   │Instance │        │
│  │  (SPA)  │   │  (SPA)  │   │(Node.js)│   │(Node.js)│        │
│  └─────────┘   └─────────┘   └────┬────┘   └────┬────┘        │
│                                    │              │             │
│                                    └──────┬───────┘             │
│                                           ▼                      │
│                                    ┌─────────────┐              │
│                                    │   Redis     │              │
│                                    │  (Cache)    │              │
│                                    └─────────────┘              │
│                                           │                      │
│                                           ▼                      │
│                                    ┌─────────────┐              │
│                                    │ PostgreSQL  │              │
│                                    │   Primary   │              │
│                                    └──────┬──────┘              │
│                                           │                      │
│                                           ▼                      │
│                                    ┌─────────────┐              │
│                                    │ PostgreSQL  │              │
│                                    │   Replica   │              │
│                                    └─────────────┘              │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Stack Tecnológico

| Componente | Tecnología | Versión Mínima |
|------------|------------|----------------|
| **Frontend** | React + Vite + TypeScript | Node 20.x, React 19.x |
| **Backend** | Node.js + Express + TypeScript | Node 20.x |
| **Base de Datos** | PostgreSQL | 16.x |
| **Cache** | Redis (Opcional) | 7.x |
| **Reverse Proxy** | Nginx | 1.24.x |
| **Process Manager** | PM2 / systemd | PM2 5.x |
| **Containerization** | Docker + Docker Compose | 24.x |

### 1.3 Flujo de Deployment

```
Desarrollo Local → Git Push → CI/CD Pipeline → Staging → Tests → Production
     (Dev)                      (GitHub Actions)    (QA)            (Prod)
```

---

## 2. Ambientes

### 2.1 Development (Local)

**Propósito:** Desarrollo y pruebas locales

**Configuración:**

```bash
# .env.development (Backend)
NODE_ENV=development
PORT=3006
DB_HOST=localhost
DB_PORT=5432
DB_NAME=glit_platform_dev
DB_USER=glit_user
DB_PASSWORD=dev_password_local
DB_SSL=false
DB_POOL_MIN=2
DB_POOL_MAX=5

# JWT
JWT_SECRET=dev_jwt_secret_change_me
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=http://localhost:3005

# Logging
LOG_LEVEL=debug
LOG_FORMAT=pretty
API_DOCS_ENABLED=true
DEBUG=true

# Features
FEATURE_EMAIL_VERIFICATION_REQUIRED=false
SEED_DATABASE=true
```

```bash
# .env.development (Frontend)
VITE_APP_ENV=development
VITE_API_URL=http://localhost:3006/api
VITE_WS_URL=ws://localhost:3006
VITE_APP_NAME=GAMILIT
VITE_ENABLE_DEVTOOLS=true
VITE_LOG_LEVEL=debug
```

**Características:**
- Base de datos local con datos de prueba (seeds)
- Hot-reload habilitado
- Source maps completos
- Logs detallados
- Debug mode activado
- Sin optimizaciones de producción

---

### 2.2 Staging (Servidor de Pruebas)

**Propósito:** Testing, QA, demostración a stakeholders

**Configuración:**

```bash
# .env.staging (Backend)
NODE_ENV=staging
PORT=3001
DB_HOST=staging-db.internal
DB_PORT=5432
DB_NAME=glit_platform_staging
DB_USER=glit_staging_user
DB_PASSWORD=${STAGING_DB_PASSWORD}  # Desde secrets manager
DB_SSL=true
DB_POOL_MIN=5
DB_POOL_MAX=20

# JWT - Usar secrets manager
JWT_SECRET=${STAGING_JWT_SECRET}
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=https://staging.gamilit.com

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
API_DOCS_ENABLED=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=200

# Features
FEATURE_EMAIL_VERIFICATION_REQUIRED=true
FEATURE_MAINTENANCE_MODE=false

# Monitoring
SENTRY_DSN=${STAGING_SENTRY_DSN}
```

```bash
# .env.staging (Frontend)
VITE_APP_ENV=staging
VITE_API_URL=https://api-staging.gamilit.com/api
VITE_WS_URL=wss://api-staging.gamilit.com
VITE_APP_NAME=GAMILIT [STAGING]
VITE_ENABLE_DEVTOOLS=false
VITE_LOG_LEVEL=info
VITE_SENTRY_DSN=${STAGING_FRONTEND_SENTRY_DSN}
```

**Características:**
- Replica configuración de producción
- Base de datos separada con datos de prueba realistas
- SSL/TLS habilitado
- Monitoreo activo (Sentry staging)
- Logs estructurados (JSON)
- Source maps disponibles para debugging

**URL:** `https://staging.gamilit.com`

---

### 2.3 Production (Producción)

**Propósito:** Ambiente productivo para usuarios finales

**Configuración:**

```bash
# .env.production (Backend)
NODE_ENV=production
PORT=3001
DB_HOST=${PROD_DB_HOST}  # Desde secrets manager
DB_PORT=5432
DB_NAME=glit_platform
DB_USER=glit_prod_user
DB_PASSWORD=${PROD_DB_PASSWORD}  # Desde secrets manager
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=true
DB_POOL_MIN=10
DB_POOL_MAX=50

# JWT - CRITICAL: Usar secrets manager
JWT_SECRET=${PROD_JWT_SECRET}
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
JWT_ALGORITHM=HS256

# CORS
CORS_ORIGIN=https://gamilit.com,https://www.gamilit.com

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET=${PROD_SESSION_SECRET}

# Logging
LOG_LEVEL=warn
LOG_FORMAT=json
LOG_FILE_PATH=/var/log/gamilit/app.log
LOG_MAX_FILES=30d
LOG_MAX_SIZE=50m
API_DOCS_ENABLED=false

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Features
FEATURE_EMAIL_VERIFICATION_REQUIRED=true
FEATURE_MAINTENANCE_MODE=false

# Monitoring
SENTRY_DSN=${PROD_SENTRY_DSN}
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1

# Redis
REDIS_HOST=${PROD_REDIS_HOST}
REDIS_PORT=6379
REDIS_PASSWORD=${PROD_REDIS_PASSWORD}
REDIS_TLS=true

# Email (SendGrid)
SENDGRID_API_KEY=${PROD_SENDGRID_KEY}
SMTP_FROM=noreply@gamilit.com
```

```bash
# .env.production (Frontend)
VITE_APP_ENV=production
VITE_API_URL=https://api.gamilit.com/api
VITE_WS_URL=wss://api.gamilit.com
VITE_APP_NAME=GAMILIT
VITE_ENABLE_DEVTOOLS=false
VITE_LOG_LEVEL=error
VITE_SENTRY_DSN=${PROD_FRONTEND_SENTRY_DSN}
VITE_SENTRY_ENVIRONMENT=production
VITE_GA_TRACKING_ID=${PROD_GA_ID}
```

**Características:**
- Alta disponibilidad (múltiples instancias)
- SSL/TLS obligatorio
- Secrets en secrets manager (AWS Secrets Manager / Vault)
- Logs centralizados
- Monitoreo 24/7
- Backups automáticos
- CDN para assets estáticos
- Redis para caché
- Sin source maps en archivos públicos

**URL:** `https://gamilit.com`

---

### 2.4 Matriz de Variables de Entorno

| Variable | Development | Staging | Production | Descripción |
|----------|-------------|---------|------------|-------------|
| `NODE_ENV` | development | staging | production | Ambiente de ejecución |
| `DB_SSL` | false | true | true | SSL en BD |
| `DB_POOL_MAX` | 5 | 20 | 50 | Conexiones pool |
| `LOG_LEVEL` | debug | info | warn | Nivel de logs |
| `API_DOCS_ENABLED` | true | true | false | Swagger UI |
| `BCRYPT_ROUNDS` | 10 | 10 | 12 | Salt rounds |
| `RATE_LIMIT_MAX` | 1000 | 200 | 100 | Límite rate |
| `JWT_EXPIRES_IN` | 7d | 7d | 7d | Expiración JWT |
| `SEED_DATABASE` | true | false | false | Seeds automáticos |
| `DEBUG` | true | false | false | Debug mode |

---

## 3. Pre-requisitos

### 3.1 Software Requerido

#### 3.1.1 En el Servidor (Backend)

```bash
# Sistema Operativo
- Ubuntu 22.04 LTS / 24.04 LTS (recomendado)
- CentOS 8+ / Rocky Linux 8+
- Debian 11+

# Node.js
- Version: 20.x LTS
- Instalación:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar
node --version  # v20.x.x
npm --version   # 10.x.x

# PostgreSQL Client
- Version: 16.x
sudo apt-get install -y postgresql-client-16

# PM2 (Process Manager)
npm install -g pm2

# Nginx
sudo apt-get install -y nginx

# Git
sudo apt-get install -y git

# Build essentials
sudo apt-get install -y build-essential python3
```

#### 3.1.2 PostgreSQL Database Server

```bash
# PostgreSQL 16
sudo apt-get install -y postgresql-16 postgresql-contrib-16

# Extensiones requeridas
- uuid-ossp
- pgcrypto
- pg_stat_statements (monitoreo)

# Verificar
psql --version  # 16.x
```

#### 3.1.3 Redis (Opcional pero Recomendado)

```bash
# Redis 7.x
sudo apt-get install -y redis-server

# Verificar
redis-cli --version  # 7.x
```

#### 3.1.4 Certificados SSL/TLS

```bash
# Let's Encrypt (Certbot)
sudo apt-get install -y certbot python3-certbot-nginx

# Generar certificados
sudo certbot --nginx -d gamilit.com -d www.gamilit.com -d api.gamilit.com
```

---

### 3.2 Accesos Necesarios

#### 3.2.1 Servidores

- [ ] Acceso SSH con clave pública a todos los servidores
- [ ] Usuario con permisos sudo
- [ ] Firewall configurado (puertos 80, 443, 3001, 5432)
- [ ] Acceso a consola de administración del proveedor cloud

#### 3.2.2 Repositorios

- [ ] Acceso al repositorio GitHub (read/write)
- [ ] Token de acceso personal (PAT) para CI/CD
- [ ] SSH keys configuradas para deployment

#### 3.2.3 Secrets Manager

```bash
# AWS Secrets Manager
- PROD_DB_PASSWORD
- PROD_JWT_SECRET
- PROD_SESSION_SECRET
- PROD_REDIS_PASSWORD
- PROD_SENDGRID_KEY
- PROD_SENTRY_DSN

# Acceso IAM con permisos:
- secretsmanager:GetSecretValue
- secretsmanager:DescribeSecret
```

#### 3.2.4 Servicios Externos

- [ ] Cuenta de SendGrid (email)
- [ ] Cuenta de Sentry (error tracking)
- [ ] Cuenta de CloudFlare/CloudFront (CDN)
- [ ] Google Analytics (opcional)

---

### 3.3 Configuraciones Previas

#### 3.3.1 DNS Records

```bash
# A Records
gamilit.com               → IP_SERVER_FRONTEND
www.gamilit.com           → IP_SERVER_FRONTEND
api.gamilit.com           → IP_SERVER_BACKEND
staging.gamilit.com       → IP_SERVER_STAGING
api-staging.gamilit.com   → IP_SERVER_STAGING

# CNAME (si usa CDN)
cdn.gamilit.com           → cloudfront.net / cloudflare.com
```

#### 3.3.2 Firewall Rules

```bash
# Backend Server
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3001/tcp  # Backend API (interno)
sudo ufw enable

# Database Server (solo desde Backend)
sudo ufw allow from BACKEND_IP to any port 5432
sudo ufw enable

# Redis Server (solo desde Backend)
sudo ufw allow from BACKEND_IP to any port 6379
sudo ufw enable
```

#### 3.3.3 Sistema de Archivos

```bash
# Crear directorios
sudo mkdir -p /var/www/gamilit
sudo mkdir -p /var/log/gamilit
sudo mkdir -p /opt/gamilit/backend
sudo mkdir -p /opt/gamilit/frontend
sudo mkdir -p /opt/gamilit/database/backups

# Permisos
sudo chown -R $USER:$USER /opt/gamilit
sudo chown -R www-data:www-data /var/www/gamilit
sudo chown -R $USER:$USER /var/log/gamilit
```

---

## 4. Deployment Backend

### 4.1 Build Process

#### 4.1.1 Local Build

```bash
# 1. Clonar repositorio
git clone git@github.com:your-org/gamilit-backend.git
cd gamilit-backend

# 2. Instalar dependencias
npm ci --production=false

# 3. Compilar TypeScript a JavaScript
npm run build

# Resultado: carpeta dist/ con código compilado
# dist/
# ├── server.js
# ├── config/
# ├── modules/
# ├── middleware/
# └── ...
```

#### 4.1.2 Build en CI/CD (GitHub Actions)

```yaml
# Ver sección 8.1 para workflow completo
- name: Build Backend
  run: |
    npm ci
    npm run build
    npm run test
```

---

### 4.2 Environment Variables

#### 4.2.1 Secrets Management

```bash
# Opción 1: AWS Secrets Manager
aws secretsmanager create-secret \
  --name gamilit/production/backend \
  --secret-string '{
    "DB_PASSWORD": "strong_password_here",
    "JWT_SECRET": "jwt_secret_32_chars_min",
    "SESSION_SECRET": "session_secret",
    "REDIS_PASSWORD": "redis_password",
    "SENDGRID_API_KEY": "SG.xxxxxxxx"
  }'

# Opción 2: .env file (menos seguro)
# Crear archivo .env en servidor
sudo nano /opt/gamilit/backend/.env
# Copiar variables de producción
# Permisos restrictivos
sudo chmod 600 /opt/gamilit/backend/.env
sudo chown gamilit-user:gamilit-user /opt/gamilit/backend/.env
```

#### 4.2.2 Script de Carga de Secrets

```bash
#!/bin/bash
# /opt/gamilit/backend/scripts/load-secrets.sh

set -e

echo "Loading secrets from AWS Secrets Manager..."

SECRET_JSON=$(aws secretsmanager get-secret-value \
  --secret-id gamilit/production/backend \
  --query SecretString \
  --output text)

# Exportar variables
export DB_PASSWORD=$(echo $SECRET_JSON | jq -r '.DB_PASSWORD')
export JWT_SECRET=$(echo $SECRET_JSON | jq -r '.JWT_SECRET')
export SESSION_SECRET=$(echo $SECRET_JSON | jq -r '.SESSION_SECRET')
export REDIS_PASSWORD=$(echo $SECRET_JSON | jq -r '.REDIS_PASSWORD')
export SENDGRID_API_KEY=$(echo $SECRET_JSON | jq -r '.SENDGRID_API_KEY')

echo "Secrets loaded successfully"
```

---

### 4.3 Database Migrations

Ver **Sección 6.2** para ejecución detallada de migraciones.

---

### 4.4 PM2 Configuration

#### 4.4.1 Ecosystem File

```javascript
// /opt/gamilit/backend/ecosystem.config.js

module.exports = {
  apps: [
    {
      name: 'gamilit-backend',
      script: './dist/server.js',
      instances: 'max', // Cluster mode: todas las CPUs
      exec_mode: 'cluster',

      // Environment
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },

      // Logs
      error_file: '/var/log/gamilit/backend-error.log',
      out_file: '/var/log/gamilit/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // Auto-restart
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 10,
      autorestart: true,

      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 10000,

      // Watch (desactivado en producción)
      watch: false,

      // Source map support
      source_map_support: false,

      // Environment variables file
      env_file: '/opt/gamilit/backend/.env'
    }
  ]
};
```

#### 4.4.2 Comandos PM2

```bash
# Iniciar aplicación
pm2 start ecosystem.config.js

# Ver status
pm2 status
pm2 list

# Logs en tiempo real
pm2 logs gamilit-backend

# Monitoreo
pm2 monit

# Reiniciar (zero-downtime)
pm2 reload gamilit-backend

# Parar
pm2 stop gamilit-backend

# Eliminar
pm2 delete gamilit-backend

# Guardar configuración para auto-inicio
pm2 save
pm2 startup systemd
```

---

### 4.5 Systemd Service (Alternativa a PM2)

#### 4.5.1 Service File

```ini
# /etc/systemd/system/gamilit-backend.service

[Unit]
Description=GAMILIT Backend API
Documentation=https://gamilit.com/docs
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=gamilit-user
WorkingDirectory=/opt/gamilit/backend
Environment="NODE_ENV=production"
EnvironmentFile=/opt/gamilit/backend/.env
ExecStartPre=/opt/gamilit/backend/scripts/load-secrets.sh
ExecStart=/usr/bin/node dist/server.js
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=gamilit-backend

# Security
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/var/log/gamilit /opt/gamilit/backend/uploads

# Limits
LimitNOFILE=65536
LimitNPROC=4096

[Install]
WantedBy=multi-user.target
```

#### 4.5.2 Comandos Systemd

```bash
# Recargar configuración
sudo systemctl daemon-reload

# Habilitar auto-inicio
sudo systemctl enable gamilit-backend

# Iniciar servicio
sudo systemctl start gamilit-backend

# Ver status
sudo systemctl status gamilit-backend

# Logs
sudo journalctl -u gamilit-backend -f

# Reiniciar
sudo systemctl restart gamilit-backend

# Parar
sudo systemctl stop gamilit-backend
```

---

### 4.6 Nginx Configuration (Reverse Proxy)

#### 4.6.1 Site Configuration

```nginx
# /etc/nginx/sites-available/gamilit-backend

# Upstream backend servers
upstream gamilit_backend {
    least_conn;
    server 127.0.0.1:3001 max_fails=3 fail_timeout=30s;
    # Para múltiples instancias:
    # server 127.0.0.1:3002 max_fails=3 fail_timeout=30s;
    # server 127.0.0.1:3003 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=5r/m;

# HTTP -> HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name api.gamilit.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.gamilit.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/api.gamilit.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.gamilit.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_stapling on;
    ssl_stapling_verify on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;

    # Logging
    access_log /var/log/nginx/gamilit-backend-access.log combined buffer=32k flush=5s;
    error_log /var/log/nginx/gamilit-backend-error.log warn;

    # Client settings
    client_max_body_size 10M;
    client_body_timeout 30s;
    client_header_timeout 30s;

    # API endpoints
    location /api/ {
        # Rate limiting
        limit_req zone=api_limit burst=20 nodelay;

        # Proxy settings
        proxy_pass http://gamilit_backend;
        proxy_http_version 1.1;

        # Headers
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Buffering
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;

        # Cache bypass
        proxy_cache_bypass $http_upgrade;
    }

    # Auth endpoints (stricter rate limiting)
    location ~ ^/api/(auth|login|register) {
        limit_req zone=auth_limit burst=5 nodelay;

        proxy_pass http://gamilit_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket (Socket.IO)
    location /socket.io/ {
        proxy_pass http://gamilit_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket timeouts
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;
    }

    # Health check (sin rate limiting)
    location /api/health {
        proxy_pass http://gamilit_backend;
        access_log off;
    }

    # Block dotfiles
    location ~ /\. {
        deny all;
    }
}
```

#### 4.6.2 Activar Configuración

```bash
# Crear symlink
sudo ln -s /etc/nginx/sites-available/gamilit-backend /etc/nginx/sites-enabled/

# Test configuración
sudo nginx -t

# Recargar Nginx
sudo systemctl reload nginx

# Ver logs
sudo tail -f /var/log/nginx/gamilit-backend-error.log
```

---

### 4.7 SSL/TLS Setup

#### 4.7.1 Let's Encrypt (Certbot)

```bash
# Instalar Certbot
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx

# Generar certificados
sudo certbot --nginx -d api.gamilit.com

# Verificar auto-renewal
sudo certbot renew --dry-run

# Configurar auto-renewal (cron)
sudo crontab -e
# Agregar:
0 0,12 * * * certbot renew --quiet --post-hook "systemctl reload nginx"
```

#### 4.7.2 Certificado Personalizado

```bash
# Si tienes certificados de proveedor (ej: DigiCert, Comodo)
sudo mkdir -p /etc/ssl/gamilit
sudo cp your_certificate.crt /etc/ssl/gamilit/
sudo cp your_private_key.key /etc/ssl/gamilit/
sudo cp ca_bundle.crt /etc/ssl/gamilit/

# Permisos
sudo chmod 600 /etc/ssl/gamilit/your_private_key.key
sudo chmod 644 /etc/ssl/gamilit/your_certificate.crt

# Actualizar nginx config
ssl_certificate /etc/ssl/gamilit/your_certificate.crt;
ssl_certificate_key /etc/ssl/gamilit/your_private_key.key;
ssl_trusted_certificate /etc/ssl/gamilit/ca_bundle.crt;
```

---

### 4.8 Deployment Script Backend

```bash
#!/bin/bash
# /opt/gamilit/backend/scripts/deploy.sh

set -e

APP_NAME="gamilit-backend"
APP_DIR="/opt/gamilit/backend"
BACKUP_DIR="/opt/gamilit/backups"
LOG_FILE="/var/log/gamilit/deploy.log"

echo "=== GAMILIT Backend Deployment ===" | tee -a $LOG_FILE
echo "Started at: $(date)" | tee -a $LOG_FILE

# 1. Backup current version
echo "[1/10] Creating backup..." | tee -a $LOG_FILE
BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p $BACKUP_DIR/$BACKUP_NAME
cp -r $APP_DIR/dist $BACKUP_DIR/$BACKUP_NAME/
cp $APP_DIR/.env $BACKUP_DIR/$BACKUP_NAME/

# 2. Pull latest code
echo "[2/10] Pulling latest code from git..." | tee -a $LOG_FILE
cd $APP_DIR
git fetch origin
git checkout main
git pull origin main

# 3. Install dependencies
echo "[3/10] Installing dependencies..." | tee -a $LOG_FILE
npm ci --production=false

# 4. Run tests
echo "[4/10] Running tests..." | tee -a $LOG_FILE
npm run test || {
    echo "ERROR: Tests failed. Deployment aborted." | tee -a $LOG_FILE
    exit 1
}

# 5. Build
echo "[5/10] Building application..." | tee -a $LOG_FILE
npm run build

# 6. Load secrets
echo "[6/10] Loading secrets..." | tee -a $LOG_FILE
./scripts/load-secrets.sh

# 7. Database migrations
echo "[7/10] Running database migrations..." | tee -a $LOG_FILE
./scripts/migrate.sh

# 8. Reload PM2
echo "[8/10] Reloading application (zero-downtime)..." | tee -a $LOG_FILE
pm2 reload ecosystem.config.js

# 9. Health check
echo "[9/10] Health check..." | tee -a $LOG_FILE
sleep 5
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health)
if [ "$HEALTH_STATUS" != "200" ]; then
    echo "ERROR: Health check failed (status: $HEALTH_STATUS)" | tee -a $LOG_FILE
    echo "Rolling back..." | tee -a $LOG_FILE
    # Rollback
    pm2 stop $APP_NAME
    rm -rf $APP_DIR/dist
    cp -r $BACKUP_DIR/$BACKUP_NAME/dist $APP_DIR/
    pm2 start ecosystem.config.js
    exit 1
fi

# 10. Cleanup old backups (keep last 10)
echo "[10/10] Cleaning old backups..." | tee -a $LOG_FILE
cd $BACKUP_DIR
ls -t | tail -n +11 | xargs -r rm -rf

echo "=== Deployment completed successfully ===" | tee -a $LOG_FILE
echo "Finished at: $(date)" | tee -a $LOG_FILE
```

---

## 5. Deployment Frontend

### 5.1 Build Optimization

#### 5.1.1 Vite Production Build

```bash
# Build con optimizaciones
npm run build

# Resultado: carpeta dist/
# dist/
# ├── index.html
# ├── assets/
# │   ├── index-[hash].js        (bundle principal)
# │   ├── vendor-[hash].js       (dependencias)
# │   ├── index-[hash].css       (estilos)
# │   └── [chunks]/              (code splitting)
# └── favicon.ico

# Análisis de bundle
npm run build -- --mode production --report
```

#### 5.1.2 Configuración Vite Optimizada

```typescript
// vite.config.ts

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],

  // Build optimizations
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // No source maps en producción
    minify: 'terser',

    terserOptions: {
      compress: {
        drop_console: true, // Eliminar console.log
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug']
      }
    },

    // Code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'charts': ['chart.js', 'react-chartjs-2'],
          'ui': ['framer-motion', 'lucide-react'],
          'forms': ['react-hook-form', '@hookform/resolvers', 'zod']
        },

        // Asset file names
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    },

    // Chunk size warnings
    chunkSizeWarningLimit: 1000,

    // CSS code splitting
    cssCodeSplit: true,

    // Asset inline limit (base64)
    assetsInlineLimit: 4096 // 4kb
  },

  // Preview server
  preview: {
    port: 4173,
    host: true
  },

  // Resolve
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@stores': path.resolve(__dirname, './src/stores'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types')
    }
  }
});
```

---

### 5.2 Static File Serving

#### 5.2.1 Nginx Configuration Frontend

```nginx
# /etc/nginx/sites-available/gamilit-frontend

# Gzip compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_comp_level 6;
gzip_types
    text/plain
    text/css
    text/javascript
    application/javascript
    application/json
    application/xml
    image/svg+xml;

# Brotli compression (si está disponible)
# brotli on;
# brotli_comp_level 6;
# brotli_types text/plain text/css text/javascript application/javascript application/json;

# HTTP -> HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name gamilit.com www.gamilit.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name gamilit.com www.gamilit.com;

    # SSL Configuration (igual que backend)
    ssl_certificate /etc/letsencrypt/live/gamilit.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/gamilit.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_prefer_server_ciphers off;

    # Root directory
    root /var/www/gamilit;
    index index.html;

    # Logging
    access_log /var/log/nginx/gamilit-frontend-access.log combined;
    error_log /var/log/nginx/gamilit-frontend-error.log warn;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Cache HTML with revalidation
    location ~* \.html$ {
        expires 1h;
        add_header Cache-Control "public, must-revalidate";
    }

    # SPA fallback (todas las rutas -> index.html)
    location / {
        try_files $uri $uri/ /index.html;

        # No cache for index.html
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }

    # Block dotfiles
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Favicon
    location = /favicon.ico {
        access_log off;
        log_not_found off;
    }

    # Robots.txt
    location = /robots.txt {
        access_log off;
        log_not_found off;
    }
}
```

---

### 5.3 CDN Configuration (Futuro)

#### 5.3.1 CloudFlare Setup

```bash
# 1. Crear cuenta en CloudFlare
# 2. Agregar dominio gamilit.com
# 3. Cambiar nameservers en tu registrador

# 4. Configurar Page Rules:

# Rule 1: Cache everything para assets
URL: gamilit.com/assets/*
Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month
  - Browser Cache TTL: 1 year

# Rule 2: No cache para HTML
URL: gamilit.com/*.html
Settings:
  - Cache Level: Bypass

# Rule 3: No cache para index
URL: gamilit.com/
Settings:
  - Cache Level: Bypass

# 5. SSL/TLS settings
- Full (strict)
- Always Use HTTPS: On
- Automatic HTTPS Rewrites: On
- Minimum TLS Version: 1.2
```

#### 5.3.2 AWS CloudFront Setup

```bash
# 1. Crear S3 bucket para assets
aws s3 mb s3://gamilit-cdn

# 2. Crear CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name gamilit-cdn.s3.amazonaws.com \
  --default-root-object index.html

# 3. Configurar invalidaciones
aws cloudfront create-invalidation \
  --distribution-id E1234567890ABC \
  --paths "/*"

# 4. Actualizar DNS
# Crear CNAME: cdn.gamilit.com -> d111111abcdef8.cloudfront.net
```

---

### 5.4 Environment Variables en Build

```bash
# Build con variables de producción
VITE_APP_ENV=production \
VITE_API_URL=https://api.gamilit.com/api \
VITE_WS_URL=wss://api.gamilit.com \
npm run build
```

---

### 5.5 Deployment Script Frontend

```bash
#!/bin/bash
# /opt/gamilit/frontend/scripts/deploy.sh

set -e

APP_NAME="gamilit-frontend"
SOURCE_DIR="/opt/gamilit/frontend"
DEPLOY_DIR="/var/www/gamilit"
BACKUP_DIR="/opt/gamilit/backups"
LOG_FILE="/var/log/gamilit/deploy-frontend.log"

echo "=== GAMILIT Frontend Deployment ===" | tee -a $LOG_FILE
echo "Started at: $(date)" | tee -a $LOG_FILE

# 1. Backup current version
echo "[1/8] Creating backup..." | tee -a $LOG_FILE
BACKUP_NAME="frontend-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p $BACKUP_DIR/$BACKUP_NAME
cp -r $DEPLOY_DIR/* $BACKUP_DIR/$BACKUP_NAME/ || true

# 2. Pull latest code
echo "[2/8] Pulling latest code..." | tee -a $LOG_FILE
cd $SOURCE_DIR
git fetch origin
git checkout main
git pull origin main

# 3. Install dependencies
echo "[3/8] Installing dependencies..." | tee -a $LOG_FILE
npm ci

# 4. Run tests
echo "[4/8] Running tests..." | tee -a $LOG_FILE
npm run test:run || {
    echo "ERROR: Tests failed. Deployment aborted." | tee -a $LOG_FILE
    exit 1
}

# 5. Build with production env
echo "[5/8] Building application..." | tee -a $LOG_FILE
npm run build

# 6. Deploy to web directory
echo "[6/8] Deploying files..." | tee -a $LOG_FILE
rm -rf $DEPLOY_DIR/*
cp -r dist/* $DEPLOY_DIR/

# 7. Set permissions
echo "[7/8] Setting permissions..." | tee -a $LOG_FILE
sudo chown -R www-data:www-data $DEPLOY_DIR
sudo chmod -R 755 $DEPLOY_DIR

# 8. Cleanup old backups (keep last 10)
echo "[8/8] Cleaning old backups..." | tee -a $LOG_FILE
cd $BACKUP_DIR
ls -t | grep "frontend-backup" | tail -n +11 | xargs -r rm -rf

echo "=== Frontend deployment completed ===" | tee -a $LOG_FILE
echo "Finished at: $(date)" | tee -a $LOG_FILE

# Reload nginx (optional)
sudo nginx -t && sudo systemctl reload nginx
```

---

## 6. Database Deployment

### 6.1 Backup Strategy

#### 6.1.1 Pre-Deployment Backup

```bash
#!/bin/bash
# /opt/gamilit/database/scripts/backup-pre-deploy.sh

set -e

DB_NAME="glit_platform"
DB_USER="glit_prod_user"
BACKUP_DIR="/opt/gamilit/database/backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/pre-deploy-$TIMESTAMP.sql"

echo "Creating pre-deployment backup..."

# Crear directorio si no existe
mkdir -p $BACKUP_DIR

# Backup completo
pg_dump -U $DB_USER -h localhost -d $DB_NAME \
  --verbose \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  --format=plain \
  --file=$BACKUP_FILE

# Comprimir
gzip $BACKUP_FILE

echo "Backup created: $BACKUP_FILE.gz"

# Backup de schemas específicos (opcional)
pg_dump -U $DB_USER -h localhost -d $DB_NAME \
  --schema=educational \
  --schema=gamification \
  --schema=social \
  --file="$BACKUP_DIR/schemas-$TIMESTAMP.sql"

gzip "$BACKUP_DIR/schemas-$TIMESTAMP.sql"

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed successfully"
```

#### 6.1.2 Automated Daily Backups

```bash
#!/bin/bash
# /opt/gamilit/database/scripts/backup-daily.sh

set -e

DB_NAME="glit_platform"
DB_USER="glit_prod_user"
BACKUP_DIR="/opt/gamilit/database/backups/daily"
S3_BUCKET="s3://gamilit-db-backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
DATE=$(date +%Y-%m-%d)

mkdir -p $BACKUP_DIR

# Full backup
BACKUP_FILE="$BACKUP_DIR/daily-$DATE-$TIMESTAMP.sql"
pg_dump -U $DB_USER -h localhost -d $DB_NAME \
  --format=custom \
  --compress=9 \
  --file=$BACKUP_FILE

# Upload to S3
aws s3 cp $BACKUP_FILE $S3_BUCKET/daily/

# Keep local backups for 7 days
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete

# Keep S3 backups for 90 days (lifecycle policy)

echo "Daily backup completed: $BACKUP_FILE"
```

#### 6.1.3 Cron Schedule

```bash
# sudo crontab -e

# Daily backup at 2 AM
0 2 * * * /opt/gamilit/database/scripts/backup-daily.sh >> /var/log/gamilit/backup-daily.log 2>&1

# Weekly backup (full) every Sunday at 3 AM
0 3 * * 0 /opt/gamilit/database/scripts/backup-weekly.sh >> /var/log/gamilit/backup-weekly.log 2>&1

# Monthly backup (archive) first day of month at 4 AM
0 4 1 * * /opt/gamilit/database/scripts/backup-monthly.sh >> /var/log/gamilit/backup-monthly.log 2>&1
```

---

### 6.2 Migration Execution

#### 6.2.1 Migration Structure

```bash
# /opt/gamilit/database/migrations/
migrations/
├── 001_initial_schema.sql
├── 002_add_social_features.sql
├── 003_add_indexes.sql
├── 004_add_triggers.sql
├── 005_add_rls_policies.sql
└── ...
```

#### 6.2.2 Migration Script

```bash
#!/bin/bash
# /opt/gamilit/database/scripts/migrate.sh

set -e

DB_NAME="glit_platform"
DB_USER="glit_prod_user"
DB_HOST="localhost"
MIGRATIONS_DIR="/opt/gamilit/database/migrations"
LOG_FILE="/var/log/gamilit/migrations.log"

echo "=== Database Migrations ===" | tee -a $LOG_FILE
echo "Started at: $(date)" | tee -a $LOG_FILE

# Verificar conexión
psql -U $DB_USER -h $DB_HOST -d $DB_NAME -c "SELECT version();" > /dev/null || {
    echo "ERROR: Cannot connect to database" | tee -a $LOG_FILE
    exit 1
}

# Crear tabla de migraciones si no existe
psql -U $DB_USER -h $DB_HOST -d $DB_NAME << EOF
CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL UNIQUE,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    checksum VARCHAR(64)
);
EOF

# Ejecutar migraciones
for migration in $MIGRATIONS_DIR/*.sql; do
    filename=$(basename $migration)

    # Check if already applied
    APPLIED=$(psql -U $DB_USER -h $DB_HOST -d $DB_NAME -tAc \
        "SELECT COUNT(*) FROM migrations WHERE filename='$filename';")

    if [ "$APPLIED" -eq "0" ]; then
        echo "Applying migration: $filename" | tee -a $LOG_FILE

        # Calculate checksum
        CHECKSUM=$(md5sum $migration | awk '{print $1}')

        # Apply migration in transaction
        psql -U $DB_USER -h $DB_HOST -d $DB_NAME << EOF
BEGIN;
\i $migration
INSERT INTO migrations (filename, checksum) VALUES ('$filename', '$CHECKSUM');
COMMIT;
EOF

        if [ $? -eq 0 ]; then
            echo "✓ Migration applied: $filename" | tee -a $LOG_FILE
        else
            echo "✗ Migration failed: $filename" | tee -a $LOG_FILE
            exit 1
        fi
    else
        echo "⊘ Migration already applied: $filename" | tee -a $LOG_FILE
    fi
done

echo "=== Migrations completed ===" | tee -a $LOG_FILE
echo "Finished at: $(date)" | tee -a $LOG_FILE
```

---

### 6.3 Rollback Procedures

#### 6.3.1 Rollback Script

```bash
#!/bin/bash
# /opt/gamilit/database/scripts/rollback.sh

set -e

DB_NAME="glit_platform"
DB_USER="glit_prod_user"
BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: ./rollback.sh <backup_file>"
    echo "Example: ./rollback.sh /opt/gamilit/database/backups/pre-deploy-20251027-120000.sql.gz"
    exit 1
fi

echo "=== Database Rollback ==="
echo "WARNING: This will restore database from backup: $BACKUP_FILE"
read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Rollback cancelled"
    exit 0
fi

# Descomprimir backup si está comprimido
if [[ $BACKUP_FILE == *.gz ]]; then
    echo "Decompressing backup..."
    gunzip -k $BACKUP_FILE
    BACKUP_FILE="${BACKUP_FILE%.gz}"
fi

# Terminar conexiones activas
echo "Terminating active connections..."
psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='$DB_NAME' AND pid <> pg_backend_pid();"

# Drop y recrear base de datos
echo "Dropping database..."
psql -U postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"

echo "Creating database..."
psql -U postgres -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

# Restaurar backup
echo "Restoring backup..."
psql -U $DB_USER -d $DB_NAME -f $BACKUP_FILE

echo "=== Rollback completed ==="
```

#### 6.3.2 Rollback de Migración Específica

```bash
#!/bin/bash
# /opt/gamilit/database/scripts/rollback-migration.sh

set -e

DB_NAME="glit_platform"
DB_USER="glit_prod_user"
MIGRATION_NAME=$1
ROLLBACK_DIR="/opt/gamilit/database/rollbacks"

if [ -z "$MIGRATION_NAME" ]; then
    echo "Usage: ./rollback-migration.sh <migration_name>"
    echo "Example: ./rollback-migration.sh 005_add_rls_policies"
    exit 1
fi

ROLLBACK_FILE="$ROLLBACK_DIR/${MIGRATION_NAME}_rollback.sql"

if [ ! -f "$ROLLBACK_FILE" ]; then
    echo "ERROR: Rollback file not found: $ROLLBACK_FILE"
    exit 1
fi

echo "Rolling back migration: $MIGRATION_NAME"
psql -U $DB_USER -h localhost -d $DB_NAME -f $ROLLBACK_FILE

# Remove from migrations table
psql -U $DB_USER -h localhost -d $DB_NAME -c \
    "DELETE FROM migrations WHERE filename='${MIGRATION_NAME}.sql';"

echo "Rollback completed"
```

---

### 6.4 Data Seeding

#### 6.4.1 Seed Script

```bash
#!/bin/bash
# /opt/gamilit/database/scripts/seed.sh

set -e

DB_NAME="glit_platform"
DB_USER="glit_prod_user"
SEEDS_DIR="/opt/gamilit/database/seeds"
ENVIRONMENT=${1:-development}

echo "=== Database Seeding ($ENVIRONMENT) ==="

if [ "$ENVIRONMENT" == "production" ]; then
    echo "WARNING: Seeding production database"
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo "Seeding cancelled"
        exit 0
    fi
fi

# Seed files in order
SEED_FILES=(
    "01_achievements_seed.sql"
    "02_maya_ranks_seed.sql"
    "03_educational_content_seed.sql"
    "04_missions_seed.sql"
)

if [ "$ENVIRONMENT" == "development" ]; then
    SEED_FILES+=(
        "05_test_users_seed.sql"
        "06_test_data_seed.sql"
    )
fi

for seed_file in "${SEED_FILES[@]}"; do
    echo "Loading seed: $seed_file"
    psql -U $DB_USER -h localhost -d $DB_NAME -f "$SEEDS_DIR/$seed_file"
done

echo "=== Seeding completed ==="
```

---

## 7. Monitoring y Logging

### 7.1 Health Check Endpoints

#### 7.1.1 Backend Health Check

```typescript
// /opt/gamilit/backend/src/routes/health.ts

import { Router, Request, Response } from 'express';
import { pool } from '../config/database';

const router = Router();

/**
 * Basic health check
 * GET /api/health
 */
router.get('/health', async (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

/**
 * Detailed health check
 * GET /api/health/detailed
 */
router.get('/health/detailed', async (req: Request, res: Response) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.APP_VERSION || '1.0.0',
    checks: {
      database: { status: 'unknown' },
      memory: { status: 'unknown' },
      disk: { status: 'unknown' }
    }
  };

  // Database check
  try {
    const result = await pool.query('SELECT 1');
    health.checks.database = {
      status: 'healthy',
      latency: 0, // Add actual latency measurement
      connections: pool.totalCount
    };
  } catch (error) {
    health.status = 'degraded';
    health.checks.database = {
      status: 'unhealthy',
      error: error.message
    };
  }

  // Memory check
  const memUsage = process.memoryUsage();
  const memUsageMB = {
    rss: Math.round(memUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
    external: Math.round(memUsage.external / 1024 / 1024)
  };

  health.checks.memory = {
    status: memUsageMB.heapUsed < 900 ? 'healthy' : 'warning',
    usage: memUsageMB
  };

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

/**
 * Readiness check (for Kubernetes)
 * GET /api/health/ready
 */
router.get('/health/ready', async (req: Request, res: Response) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'not ready', error: error.message });
  }
});

/**
 * Liveness check (for Kubernetes)
 * GET /api/health/live
 */
router.get('/health/live', (req: Request, res: Response) => {
  res.status(200).json({ status: 'alive' });
});

export default router;
```

---

### 7.2 Log Aggregation

#### 7.2.1 Winston Configuration

```typescript
// /opt/gamilit/backend/src/config/logger.ts

import winston from 'winston';
import path from 'path';

const logDir = process.env.LOG_FILE_PATH || './logs';
const logLevel = process.env.LOG_LEVEL || 'info';
const logFormat = process.env.LOG_FORMAT || 'json';

// Custom format
const customFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;

  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }

  return msg;
});

// Create logger
export const logger = winston.createLogger({
  level: logLevel,

  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    logFormat === 'json' ? winston.format.json() : customFormat
  ),

  defaultMeta: {
    service: 'gamilit-backend',
    environment: process.env.NODE_ENV
  },

  transports: [
    // Error logs
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 50 * 1024 * 1024, // 50MB
      maxFiles: 30,
      tailable: true
    }),

    // Combined logs
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 50 * 1024 * 1024,
      maxFiles: 30,
      tailable: true
    }),

    // Console (development)
    ...(process.env.NODE_ENV !== 'production' ? [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          customFormat
        )
      })
    ] : [])
  ],

  // Handle exceptions
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log')
    })
  ],

  // Handle rejections
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'rejections.log')
    })
  ]
});

// Stream for Morgan (HTTP logs)
export const httpLogStream = {
  write: (message: string) => {
    logger.info(message.trim());
  }
};
```

#### 7.2.2 Logrotate Configuration

```bash
# /etc/logrotate.d/gamilit

/var/log/gamilit/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 gamilit-user gamilit-user
    sharedscripts
    postrotate
        # Reload PM2 to reopen log files
        pm2 reloadLogs
    endscript
}
```

---

### 7.3 Error Tracking (Sentry)

#### 7.3.1 Backend Sentry Setup

```typescript
// /opt/gamilit/backend/src/config/sentry.ts

import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

export const initSentry = (app: Express) => {
  if (!process.env.SENTRY_DSN) {
    console.warn('Sentry DSN not configured');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    release: process.env.APP_VERSION || '1.0.0',

    // Performance monitoring
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),

    // Profiling
    profilesSampleRate: 0.1,
    integrations: [
      new ProfilingIntegration(),
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app })
    ],

    // Don't capture these errors
    ignoreErrors: [
      'NotFoundError',
      'UnauthorizedError',
      'ValidationError'
    ],

    // Before send hook
    beforeSend(event, hint) {
      // Don't send if development
      if (process.env.NODE_ENV === 'development') {
        return null;
      }

      // Filter sensitive data
      if (event.request) {
        delete event.request.cookies;
        if (event.request.headers) {
          delete event.request.headers['authorization'];
        }
      }

      return event;
    }
  });
};

// Error handler middleware
export const sentryErrorHandler = Sentry.Handlers.errorHandler();
export const sentryRequestHandler = Sentry.Handlers.requestHandler();
```

#### 7.3.2 Frontend Sentry Setup

```typescript
// /opt/gamilit/frontend/src/config/sentry.ts

import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

export const initSentry = () => {
  if (!import.meta.env.VITE_SENTRY_DSN) {
    console.warn('Sentry DSN not configured');
    return;
  }

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_APP_ENV || 'development',

    integrations: [
      new BrowserTracing(),
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true
      })
    ],

    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    beforeSend(event, hint) {
      // Don't send if development
      if (import.meta.env.MODE === 'development') {
        console.error('Sentry event:', event, hint);
        return null;
      }
      return event;
    }
  });
};
```

---

### 7.4 Performance Monitoring

#### 7.4.1 PostgreSQL Monitoring Queries

```sql
-- /opt/gamilit/database/monitoring/queries.sql

-- Active queries
SELECT
    pid,
    now() - query_start as duration,
    state,
    query
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY duration DESC;

-- Slow queries (>1s)
SELECT
    query,
    calls,
    total_exec_time,
    mean_exec_time,
    max_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 1000
ORDER BY mean_exec_time DESC
LIMIT 20;

-- Database size
SELECT
    pg_size_pretty(pg_database_size('glit_platform')) as size;

-- Table sizes
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 20;

-- Index usage
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC
LIMIT 20;

-- Cache hit ratio (should be >90%)
SELECT
    sum(heap_blks_read) as heap_read,
    sum(heap_blks_hit) as heap_hit,
    sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) * 100 as cache_hit_ratio
FROM pg_statio_user_tables;
```

#### 7.4.2 Monitoring Script

```bash
#!/bin/bash
# /opt/gamilit/scripts/monitor.sh

set -e

DB_NAME="glit_platform"
DB_USER="glit_prod_user"
LOG_FILE="/var/log/gamilit/monitoring.log"

echo "=== GAMILIT Monitoring $(date) ===" | tee -a $LOG_FILE

# Database connections
echo "Database Connections:" | tee -a $LOG_FILE
psql -U $DB_USER -d $DB_NAME -c "SELECT count(*) as active_connections FROM pg_stat_activity WHERE state='active';" | tee -a $LOG_FILE

# Slow queries
echo "Slow Queries (>1s):" | tee -a $LOG_FILE
psql -U $DB_USER -d $DB_NAME -f /opt/gamilit/database/monitoring/queries.sql | tee -a $LOG_FILE

# Backend health
echo "Backend Health:" | tee -a $LOG_FILE
curl -s http://localhost:3001/api/health/detailed | jq . | tee -a $LOG_FILE

# PM2 status
echo "PM2 Status:" | tee -a $LOG_FILE
pm2 jlist | jq '.[] | {name, status, memory, cpu}' | tee -a $LOG_FILE

# Disk usage
echo "Disk Usage:" | tee -a $LOG_FILE
df -h /opt/gamilit /var/log/gamilit | tee -a $LOG_FILE

echo "=== Monitoring completed ===" | tee -a $LOG_FILE
```

---

## 8. CI/CD Pipeline

### 8.1 GitHub Actions Workflow

#### 8.1.1 Backend CI/CD

```yaml
# .github/workflows/backend-deploy.yml

name: Backend CI/CD

on:
  push:
    branches:
      - main
      - develop
    paths:
      - 'backend/**'
      - '.github/workflows/backend-deploy.yml'
  pull_request:
    branches:
      - main
      - develop
    paths:
      - 'backend/**'

env:
  NODE_VERSION: '20.x'
  APP_NAME: gamilit-backend

jobs:
  # ============================================================
  # JOB 1: Test and Build
  # ============================================================
  test-and-build:
    name: Test and Build
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: glit_test
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        working-directory: backend
        run: npm ci

      - name: Run linter
        working-directory: backend
        run: npm run lint

      - name: Run tests
        working-directory: backend
        run: npm run test:coverage
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_NAME: glit_test
          DB_USER: test_user
          DB_PASSWORD: test_password
          JWT_SECRET: test_jwt_secret

      - name: Upload coverage reports
        uses: codecov/codecov-action@v4
        with:
          files: backend/coverage/coverage-final.json
          flags: backend

      - name: Build application
        working-directory: backend
        run: npm run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: backend-dist
          path: backend/dist
          retention-days: 7

  # ============================================================
  # JOB 2: Deploy to Staging
  # ============================================================
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: test-and-build
    if: github.ref == 'refs/heads/develop' && github.event_name == 'push'
    environment:
      name: staging
      url: https://api-staging.gamilit.com

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: backend-dist
          path: backend/dist

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Deploy to staging server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: ${{ secrets.STAGING_USER }}
          key: ${{ secrets.STAGING_SSH_KEY }}
          script: |
            cd /opt/gamilit/backend
            git pull origin develop
            npm ci --production
            npm run build
            ./scripts/migrate.sh
            pm2 reload ecosystem.config.js

      - name: Health check
        run: |
          sleep 10
          response=$(curl -s -o /dev/null -w "%{http_code}" https://api-staging.gamilit.com/api/health)
          if [ "$response" != "200" ]; then
            echo "Health check failed with status: $response"
            exit 1
          fi
          echo "Health check passed"

      - name: Notify Slack
        if: always()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Backend deployment to staging: ${{ job.status }}'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}

  # ============================================================
  # JOB 3: Deploy to Production
  # ============================================================
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: test-and-build
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    environment:
      name: production
      url: https://api.gamilit.com

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: backend-dist
          path: backend/dist

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Create database backup
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.PROD_USER }}
          key: ${{ secrets.PROD_SSH_KEY }}
          script: |
            /opt/gamilit/database/scripts/backup-pre-deploy.sh

      - name: Deploy to production server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.PROD_USER }}
          key: ${{ secrets.PROD_SSH_KEY }}
          script: |
            /opt/gamilit/backend/scripts/deploy.sh

      - name: Health check
        run: |
          sleep 10
          response=$(curl -s -o /dev/null -w "%{http_code}" https://api.gamilit.com/api/health)
          if [ "$response" != "200" ]; then
            echo "Health check failed with status: $response"
            exit 1
          fi
          echo "Health check passed"

      - name: Smoke tests
        run: |
          # Test authentication endpoint
          curl -f https://api.gamilit.com/api/health/detailed

      - name: Create release tag
        if: success()
        run: |
          git tag -a "v${{ github.run_number }}" -m "Release v${{ github.run_number }}"
          git push origin "v${{ github.run_number }}"

      - name: Notify Slack
        if: always()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Backend deployment to production: ${{ job.status }}'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}

      - name: Notify Sentry
        if: success()
        run: |
          curl -sL https://sentry.io/api/0/organizations/${{ secrets.SENTRY_ORG }}/releases/ \
            -X POST \
            -H "Authorization: Bearer ${{ secrets.SENTRY_AUTH_TOKEN }}" \
            -H 'Content-Type: application/json' \
            -d '{"version":"v${{ github.run_number }}","projects":["gamilit-backend"]}'
```

---

#### 8.1.2 Frontend CI/CD

```yaml
# .github/workflows/frontend-deploy.yml

name: Frontend CI/CD

on:
  push:
    branches:
      - main
      - develop
    paths:
      - 'frontend/**'
      - '.github/workflows/frontend-deploy.yml'
  pull_request:
    branches:
      - main
      - develop
    paths:
      - 'frontend/**'

env:
  NODE_VERSION: '20.x'
  APP_NAME: gamilit-frontend

jobs:
  # ============================================================
  # JOB 1: Test and Build
  # ============================================================
  test-and-build:
    name: Test and Build
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        working-directory: frontend
        run: npm ci

      - name: Run linter
        working-directory: frontend
        run: npm run lint

      - name: Type check
        working-directory: frontend
        run: npm run type-check

      - name: Run tests
        working-directory: frontend
        run: npm run test:coverage

      - name: Upload coverage reports
        uses: codecov/codecov-action@v4
        with:
          files: frontend/coverage/coverage-final.json
          flags: frontend

      - name: Build application (Staging)
        if: github.ref == 'refs/heads/develop'
        working-directory: frontend
        run: npm run build
        env:
          VITE_APP_ENV: staging
          VITE_API_URL: https://api-staging.gamilit.com/api
          VITE_WS_URL: wss://api-staging.gamilit.com
          VITE_SENTRY_DSN: ${{ secrets.STAGING_SENTRY_DSN }}

      - name: Build application (Production)
        if: github.ref == 'refs/heads/main'
        working-directory: frontend
        run: npm run build
        env:
          VITE_APP_ENV: production
          VITE_API_URL: https://api.gamilit.com/api
          VITE_WS_URL: wss://api.gamilit.com
          VITE_SENTRY_DSN: ${{ secrets.PROD_SENTRY_DSN }}
          VITE_GA_TRACKING_ID: ${{ secrets.GA_TRACKING_ID }}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: frontend-dist
          path: frontend/dist
          retention-days: 7

      - name: Analyze bundle size
        working-directory: frontend
        run: |
          du -sh dist/
          du -sh dist/assets/

  # ============================================================
  # JOB 2: Deploy to Staging
  # ============================================================
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: test-and-build
    if: github.ref == 'refs/heads/develop' && github.event_name == 'push'
    environment:
      name: staging
      url: https://staging.gamilit.com

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: frontend-dist
          path: frontend/dist

      - name: Deploy to staging server
        uses: appleboy/scp-action@v0.1.4
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: ${{ secrets.STAGING_USER }}
          key: ${{ secrets.STAGING_SSH_KEY }}
          source: "frontend/dist/*"
          target: "/var/www/staging.gamilit.com"
          strip_components: 2

      - name: Set permissions
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: ${{ secrets.STAGING_USER }}
          key: ${{ secrets.STAGING_SSH_KEY }}
          script: |
            sudo chown -R www-data:www-data /var/www/staging.gamilit.com
            sudo chmod -R 755 /var/www/staging.gamilit.com
            sudo systemctl reload nginx

      - name: Smoke test
        run: |
          sleep 5
          response=$(curl -s -o /dev/null -w "%{http_code}" https://staging.gamilit.com)
          if [ "$response" != "200" ]; then
            echo "Smoke test failed with status: $response"
            exit 1
          fi
          echo "Smoke test passed"

  # ============================================================
  # JOB 3: Deploy to Production
  # ============================================================
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: test-and-build
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    environment:
      name: production
      url: https://gamilit.com

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: frontend-dist
          path: frontend/dist

      - name: Deploy to production server
        uses: appleboy/scp-action@v0.1.4
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.PROD_USER }}
          key: ${{ secrets.PROD_SSH_KEY }}
          source: "frontend/dist/*"
          target: "/var/www/gamilit.com"
          strip_components: 2

      - name: Set permissions and reload nginx
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.PROD_USER }}
          key: ${{ secrets.PROD_SSH_KEY }}
          script: |
            sudo chown -R www-data:www-data /var/www/gamilit.com
            sudo chmod -R 755 /var/www/gamilit.com
            sudo nginx -t && sudo systemctl reload nginx

      - name: Invalidate CDN cache (CloudFlare)
        if: success()
        run: |
          curl -X POST "https://api.cloudflare.com/client/v4/zones/${{ secrets.CLOUDFLARE_ZONE_ID }}/purge_cache" \
            -H "Authorization: Bearer ${{ secrets.CLOUDFLARE_API_TOKEN }}" \
            -H "Content-Type: application/json" \
            --data '{"purge_everything":true}'

      - name: Smoke test
        run: |
          sleep 5
          response=$(curl -s -o /dev/null -w "%{http_code}" https://gamilit.com)
          if [ "$response" != "200" ]; then
            echo "Smoke test failed with status: $response"
            exit 1
          fi
          echo "Smoke test passed"

      - name: Notify Slack
        if: always()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Frontend deployment to production: ${{ job.status }}'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

### 8.2 Automated Testing

#### 8.2.1 Backend Tests

```typescript
// backend/tests/integration/health.test.ts

import request from 'supertest';
import app from '../../src/app';

describe('Health Endpoints', () => {
  describe('GET /api/health', () => {
    it('should return 200 and health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('GET /api/health/detailed', () => {
    it('should return detailed health information', async () => {
      const response = await request(app)
        .get('/api/health/detailed')
        .expect(200);

      expect(response.body).toHaveProperty('checks');
      expect(response.body.checks).toHaveProperty('database');
      expect(response.body.checks).toHaveProperty('memory');
    });
  });
});
```

#### 8.2.2 E2E Tests (Playwright)

```typescript
// frontend/tests/e2e/login.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('https://staging.gamilit.com/login');

    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('https://staging.gamilit.com/login');

    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('.error-message')).toBeVisible();
  });
});
```

---

### 8.3 Deployment Automation

Ver **scripts de deployment** en secciones 4.8 y 5.5.

---

### 8.4 Rollback Procedures

#### 8.4.1 Automated Rollback Script

```bash
#!/bin/bash
# /opt/gamilit/scripts/rollback-deployment.sh

set -e

COMPONENT=$1  # backend | frontend | database
VERSION=$2    # backup timestamp or git tag

if [ -z "$COMPONENT" ] || [ -z "$VERSION" ]; then
    echo "Usage: ./rollback-deployment.sh <component> <version>"
    echo "Example: ./rollback-deployment.sh backend 20251027-120000"
    exit 1
fi

echo "=== GAMILIT Rollback ==="
echo "Component: $COMPONENT"
echo "Version: $VERSION"
echo ""

read -p "Are you sure you want to rollback? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Rollback cancelled"
    exit 0
fi

case $COMPONENT in
    backend)
        echo "Rolling back backend..."
        cd /opt/gamilit/backend

        # Restore from backup
        BACKUP_DIR="/opt/gamilit/backups/backup-$VERSION"
        if [ ! -d "$BACKUP_DIR" ]; then
            echo "ERROR: Backup not found: $BACKUP_DIR"
            exit 1
        fi

        pm2 stop gamilit-backend
        rm -rf dist
        cp -r $BACKUP_DIR/dist ./
        cp $BACKUP_DIR/.env ./
        pm2 start ecosystem.config.js

        echo "Backend rollback completed"
        ;;

    frontend)
        echo "Rolling back frontend..."
        BACKUP_DIR="/opt/gamilit/backups/frontend-backup-$VERSION"
        if [ ! -d "$BACKUP_DIR" ]; then
            echo "ERROR: Backup not found: $BACKUP_DIR"
            exit 1
        fi

        sudo rm -rf /var/www/gamilit.com/*
        sudo cp -r $BACKUP_DIR/* /var/www/gamilit.com/
        sudo chown -R www-data:www-data /var/www/gamilit.com
        sudo systemctl reload nginx

        echo "Frontend rollback completed"
        ;;

    database)
        echo "Rolling back database..."
        /opt/gamilit/database/scripts/rollback.sh "/opt/gamilit/database/backups/pre-deploy-$VERSION.sql.gz"
        ;;

    *)
        echo "ERROR: Invalid component: $COMPONENT"
        echo "Valid options: backend | frontend | database"
        exit 1
        ;;
esac

echo "=== Rollback completed ==="
```

---

## 9. Checklists

### 9.1 Pre-Deployment Checklist

**Responsable:** DevOps / Tech Lead

- [ ] **1. Código y Repositorio**
  - [ ] Código revisado y aprobado (pull request)
  - [ ] Tests pasando (unit, integration, e2e)
  - [ ] Linter sin errores
  - [ ] Vulnerabilidades de seguridad resueltas
  - [ ] Changelog actualizado

- [ ] **2. Ambiente**
  - [ ] Variables de entorno configuradas
  - [ ] Secrets actualizados en secrets manager
  - [ ] Certificados SSL vigentes (>30 días)
  - [ ] DNS configurado correctamente
  - [ ] Firewall rules actualizadas

- [ ] **3. Base de Datos**
  - [ ] Backup pre-deployment creado
  - [ ] Migraciones testeadas en staging
  - [ ] Scripts de rollback preparados
  - [ ] Índices optimizados
  - [ ] Espacio en disco suficiente (>30% libre)

- [ ] **4. Infraestructura**
  - [ ] Servidores con recursos suficientes (CPU, RAM, Disk)
  - [ ] Load balancer configurado
  - [ ] Health checks funcionando
  - [ ] Monitoring alerts activos
  - [ ] Logs rotando correctamente

- [ ] **5. Dependencias**
  - [ ] Node.js versión correcta
  - [ ] PostgreSQL versión correcta
  - [ ] Redis disponible (si aplica)
  - [ ] Servicios externos disponibles (SendGrid, Sentry)
  - [ ] CDN configurado (si aplica)

- [ ] **6. Comunicación**
  - [ ] Stakeholders notificados del deployment
  - [ ] Ventana de mantenimiento comunicada (si aplica)
  - [ ] Equipo de soporte alertado
  - [ ] Documentación actualizada
  - [ ] Canales de comunicación activos (Slack)

---

### 9.2 Post-Deployment Verification

**Responsable:** DevOps / QA

- [ ] **1. Servicios**
  - [ ] Backend API respondiendo (200 OK)
  - [ ] Frontend cargando correctamente
  - [ ] Database accesible
  - [ ] WebSocket conectando
  - [ ] Redis disponible

- [ ] **2. Health Checks**
  - [ ] `/api/health` retorna 200
  - [ ] `/api/health/detailed` sin errores
  - [ ] Database check pasando
  - [ ] Memory usage normal (<80%)

- [ ] **3. Funcionalidad Core**
  - [ ] Login funcionando
  - [ ] Registro de usuarios
  - [ ] Dashboard cargando
  - [ ] Mecánicas educativas operativas
  - [ ] Sistema de gamificación activo

- [ ] **4. Performance**
  - [ ] Tiempo de respuesta <500ms (p95)
  - [ ] Time to First Byte <200ms
  - [ ] Page load time <3s
  - [ ] API latency normal

- [ ] **5. Logs y Monitoreo**
  - [ ] Logs escribiendo correctamente
  - [ ] Sin errores críticos en logs
  - [ ] Sentry recibiendo eventos
  - [ ] Métricas en dashboard
  - [ ] Alerts configurados

- [ ] **6. Seguridad**
  - [ ] HTTPS funcionando
  - [ ] Certificados válidos
  - [ ] CORS configurado
  - [ ] Rate limiting activo
  - [ ] Security headers presentes

- [ ] **7. Integración**
  - [ ] Email delivery funcionando
  - [ ] Notificaciones en tiempo real
  - [ ] File uploads operativos
  - [ ] Servicios externos conectados

---

### 9.3 Rollback Checklist

**Responsable:** DevOps / Tech Lead

- [ ] **1. Evaluación**
  - [ ] Issue crítico identificado
  - [ ] Impacto evaluado (usuarios afectados)
  - [ ] Decision de rollback aprobada
  - [ ] Equipo notificado

- [ ] **2. Preparación**
  - [ ] Backup disponible verificado
  - [ ] Scripts de rollback listos
  - [ ] Ventana de rollback comunicada
  - [ ] Equipo en standby

- [ ] **3. Ejecución Backend**
  - [ ] Detener tráfico (load balancer)
  - [ ] Parar servicio backend (PM2/systemd)
  - [ ] Restaurar código desde backup
  - [ ] Restaurar variables de entorno
  - [ ] Reiniciar servicio

- [ ] **4. Ejecución Database**
  - [ ] Terminar conexiones activas
  - [ ] Restaurar backup de base de datos
  - [ ] Verificar integridad de datos
  - [ ] Revertir migraciones (si aplica)

- [ ] **5. Ejecución Frontend**
  - [ ] Restaurar archivos desde backup
  - [ ] Limpiar cache de CDN
  - [ ] Verificar archivos estáticos

- [ ] **6. Verificación**
  - [ ] Health checks pasando
  - [ ] Funcionalidad crítica operativa
  - [ ] Logs sin errores
  - [ ] Performance normal

- [ ] **7. Post-Rollback**
  - [ ] Documentar causa del rollback
  - [ ] Crear tickets para fixes
  - [ ] Notificar stakeholders
  - [ ] Realizar post-mortem

---

## 10. Disaster Recovery

### 10.1 Backup Restoration

#### 10.1.1 Restaurar Base de Datos

```bash
#!/bin/bash
# /opt/gamilit/database/scripts/restore-backup.sh

set -e

BACKUP_FILE=$1
DB_NAME="glit_platform"
DB_USER="glit_prod_user"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: ./restore-backup.sh <backup_file>"
    echo "Example: ./restore-backup.sh /opt/gamilit/database/backups/daily-2025-10-27.sql"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "ERROR: Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "=== Database Restoration ==="
echo "Backup: $BACKUP_FILE"
echo "Database: $DB_NAME"
echo ""

read -p "WARNING: This will replace the entire database. Continue? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Restoration cancelled"
    exit 0
fi

# 1. Stop backend services
echo "Stopping backend services..."
pm2 stop gamilit-backend

# 2. Create safety backup
echo "Creating safety backup..."
SAFETY_BACKUP="/tmp/safety-backup-$(date +%Y%m%d-%H%M%S).sql"
pg_dump -U $DB_USER -h localhost -d $DB_NAME --format=custom --file=$SAFETY_BACKUP
echo "Safety backup created: $SAFETY_BACKUP"

# 3. Terminate active connections
echo "Terminating active connections..."
psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='$DB_NAME' AND pid <> pg_backend_pid();"

# 4. Drop database
echo "Dropping database..."
psql -U postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"

# 5. Recreate database
echo "Creating database..."
psql -U postgres -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

# 6. Restore from backup
echo "Restoring from backup..."
if [[ $BACKUP_FILE == *.sql ]]; then
    psql -U $DB_USER -d $DB_NAME -f $BACKUP_FILE
elif [[ $BACKUP_FILE == *.sql.gz ]]; then
    gunzip -c $BACKUP_FILE | psql -U $DB_USER -d $DB_NAME
else
    # Custom format
    pg_restore -U $DB_USER -d $DB_NAME --verbose $BACKUP_FILE
fi

# 7. Verify restoration
echo "Verifying restoration..."
TABLE_COUNT=$(psql -U $DB_USER -d $DB_NAME -tAc "SELECT count(*) FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog', 'information_schema');")
echo "Tables restored: $TABLE_COUNT"

# 8. Restart backend
echo "Restarting backend services..."
pm2 start gamilit-backend

# 9. Health check
sleep 5
HEALTH=$(curl -s http://localhost:3001/api/health | jq -r '.status')
if [ "$HEALTH" != "ok" ]; then
    echo "ERROR: Health check failed after restoration"
    echo "Consider restoring from safety backup: $SAFETY_BACKUP"
    exit 1
fi

echo "=== Restoration completed successfully ==="
echo "Safety backup available at: $SAFETY_BACKUP"
```

---

### 10.2 Database Recovery

#### 10.2.1 Point-in-Time Recovery (PITR)

```bash
#!/bin/bash
# /opt/gamilit/database/scripts/pitr-recovery.sh

set -e

TARGET_TIME=$1  # Format: YYYY-MM-DD HH:MM:SS

if [ -z "$TARGET_TIME" ]; then
    echo "Usage: ./pitr-recovery.sh 'YYYY-MM-DD HH:MM:SS'"
    echo "Example: ./pitr-recovery.sh '2025-10-27 14:30:00'"
    exit 1
fi

echo "=== Point-in-Time Recovery ==="
echo "Target time: $TARGET_TIME"
echo ""

# Esto requiere que PostgreSQL esté configurado con WAL archiving
# Ver: https://www.postgresql.org/docs/current/continuous-archiving.html

# 1. Stop PostgreSQL
sudo systemctl stop postgresql

# 2. Restore base backup
echo "Restoring base backup..."
rm -rf /var/lib/postgresql/16/main/*
tar -xzf /opt/gamilit/database/backups/base-backup-latest.tar.gz -C /var/lib/postgresql/16/main/

# 3. Create recovery.conf
cat > /var/lib/postgresql/16/main/recovery.conf << EOF
restore_command = 'cp /opt/gamilit/database/wal-archive/%f %p'
recovery_target_time = '$TARGET_TIME'
recovery_target_action = 'promote'
EOF

# 4. Start PostgreSQL
sudo systemctl start postgresql

# 5. Wait for recovery
echo "Waiting for recovery to complete..."
sleep 30

# 6. Verify
psql -U postgres -d glit_platform -c "SELECT now();"

echo "=== PITR Recovery completed ==="
```

---

### 10.3 Service Recovery

#### 10.3.1 Complete Service Recovery

```bash
#!/bin/bash
# /opt/gamilit/scripts/disaster-recovery.sh

set -e

echo "=== GAMILIT Disaster Recovery ==="
echo "This will restore all services from backups"
echo ""

read -p "Continue? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Recovery cancelled"
    exit 0
fi

# 1. Restore Database
echo "[1/4] Restoring database..."
/opt/gamilit/database/scripts/restore-backup.sh /opt/gamilit/database/backups/latest.sql

# 2. Restore Backend
echo "[2/4] Restoring backend..."
cd /opt/gamilit/backend
git fetch origin
git reset --hard origin/main
npm ci --production
npm run build
pm2 reload ecosystem.config.js

# 3. Restore Frontend
echo "[3/4] Restoring frontend..."
LATEST_BACKUP=$(ls -t /opt/gamilit/backups/frontend-backup-* | head -1)
sudo rm -rf /var/www/gamilit.com/*
sudo cp -r $LATEST_BACKUP/* /var/www/gamilit.com/
sudo chown -R www-data:www-data /var/www/gamilit.com
sudo systemctl reload nginx

# 4. Verify all services
echo "[4/4] Verifying services..."
sleep 10

# Database
psql -U glit_prod_user -d glit_platform -c "SELECT 1;" > /dev/null && echo "✓ Database OK" || echo "✗ Database FAILED"

# Backend
BACKEND_HEALTH=$(curl -s http://localhost:3001/api/health | jq -r '.status')
[ "$BACKEND_HEALTH" = "ok" ] && echo "✓ Backend OK" || echo "✗ Backend FAILED"

# Frontend
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://gamilit.com)
[ "$FRONTEND_STATUS" = "200" ] && echo "✓ Frontend OK" || echo "✗ Frontend FAILED"

echo "=== Disaster Recovery completed ==="
```

---

## 11. Ejemplos de Configuración

### 11.1 Docker Compose (Desarrollo)

```yaml
# docker-compose.yml

version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: gamilit-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DB_NAME:-glit_platform}
      POSTGRES_USER: ${DB_USER:-glit_user}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-glit_password}
      POSTGRES_INITDB_ARGS: "--encoding=UTF-8"
    ports:
      - "${DB_PORT:-5432}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init:/docker-entrypoint-initdb.d:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-glit_user}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - gamilit-network

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: gamilit-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
    networks:
      - gamilit-network

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: development
    container_name: gamilit-backend
    restart: unless-stopped
    environment:
      NODE_ENV: ${NODE_ENV:-development}
      PORT: ${PORT:-3001}
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: ${DB_NAME:-glit_platform}
      DB_USER: ${DB_USER:-glit_user}
      DB_PASSWORD: ${DB_PASSWORD:-glit_password}
      JWT_SECRET: ${JWT_SECRET:-dev_jwt_secret}
      REDIS_HOST: redis
      REDIS_PORT: 6379
    ports:
      - "${PORT:-3001}:3001"
    volumes:
      - ./backend/src:/app/src:ro
      - ./backend/package.json:/app/package.json:ro
      - backend_node_modules:/app/node_modules
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - gamilit-network

  # Frontend (Development)
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: development
    container_name: gamilit-frontend
    restart: unless-stopped
    environment:
      VITE_API_URL: http://localhost:3001/api
      VITE_WS_URL: ws://localhost:3001
    ports:
      - "3005:3005"
    volumes:
      - ./frontend/src:/app/src:ro
      - ./frontend/package.json:/app/package.json:ro
      - frontend_node_modules:/app/node_modules
    depends_on:
      - backend
    networks:
      - gamilit-network

  # Nginx (optional for development)
  nginx:
    image: nginx:alpine
    container_name: gamilit-nginx
    restart: unless-stopped
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
    depends_on:
      - backend
      - frontend
    networks:
      - gamilit-network

volumes:
  postgres_data:
  redis_data:
  backend_node_modules:
  frontend_node_modules:

networks:
  gamilit-network:
    driver: bridge
```

---

### 11.2 Nginx Configuration (Production)

Ver **Sección 4.6.1** para configuración completa de Nginx backend.

---

### 11.3 PM2 Ecosystem Configuration

Ver **Sección 4.4.1** para configuración completa de PM2.

---

### 11.4 GitHub Actions Workflow

Ver **Sección 8.1** para workflows completos de CI/CD.

---

## 12. Troubleshooting

### 12.1 Problemas Comunes

#### 12.1.1 Backend no inicia

```bash
# Síntoma: PM2 muestra status "errored"

# 1. Revisar logs
pm2 logs gamilit-backend --lines 100

# 2. Verificar variables de entorno
cat /opt/gamilit/backend/.env

# 3. Verificar conexión a database
psql -U glit_prod_user -h localhost -d glit_platform -c "SELECT 1;"

# 4. Verificar puerto disponible
sudo netstat -tlnp | grep 3001

# 5. Reiniciar servicio
pm2 delete gamilit-backend
pm2 start ecosystem.config.js
```

#### 12.1.2 Database connection errors

```bash
# Síntoma: "Error: connect ECONNREFUSED"

# 1. Verificar PostgreSQL corriendo
sudo systemctl status postgresql

# 2. Verificar credenciales
psql -U glit_prod_user -h localhost -d glit_platform

# 3. Verificar pg_hba.conf
sudo nano /etc/postgresql/16/main/pg_hba.conf
# Debe tener: host all all 0.0.0.0/0 md5

# 4. Reiniciar PostgreSQL
sudo systemctl restart postgresql

# 5. Verificar logs
sudo tail -f /var/log/postgresql/postgresql-16-main.log
```

#### 12.1.3 Frontend 404 en rutas

```bash
# Síntoma: Refresh en /dashboard da 404

# 1. Verificar nginx config (try_files)
sudo nano /etc/nginx/sites-available/gamilit-frontend

# Debe tener:
# location / {
#     try_files $uri $uri/ /index.html;
# }

# 2. Test config
sudo nginx -t

# 3. Reload nginx
sudo systemctl reload nginx
```

#### 12.1.4 SSL Certificate errors

```bash
# Síntoma: "SSL certificate problem"

# 1. Verificar certificado
sudo certbot certificates

# 2. Renovar si expira pronto
sudo certbot renew

# 3. Verificar nginx config
sudo nginx -t

# 4. Reload nginx
sudo systemctl reload nginx
```

#### 12.1.5 High memory usage

```bash
# Síntoma: Backend consume >1GB RAM

# 1. Verificar PM2 instances
pm2 list

# 2. Reducir cluster instances
# Editar ecosystem.config.js: instances: 2

# 3. Reload
pm2 reload gamilit-backend

# 4. Monitorear
pm2 monit
```

---

### 12.2 Comandos de Diagnóstico

```bash
# Sistema
uptime
free -h
df -h
top -n 1

# PostgreSQL
psql -U glit_prod_user -d glit_platform -c "SELECT version();"
psql -U glit_prod_user -d glit_platform -c "SELECT count(*) FROM pg_stat_activity;"

# Nginx
sudo nginx -t
sudo nginx -V
curl -I http://localhost

# PM2
pm2 status
pm2 info gamilit-backend
pm2 logs gamilit-backend --lines 50

# Logs
sudo tail -f /var/log/gamilit/backend-error.log
sudo tail -f /var/log/nginx/gamilit-backend-error.log
sudo journalctl -u gamilit-backend -f
```

---

## Conclusión

Esta guía completa de deployment cubre todos los aspectos necesarios para desplegar GAMILIT en producción de manera segura, eficiente y con alta disponibilidad.

### Próximos Pasos

1. **Configurar ambientes** (Development, Staging, Production)
2. **Implementar CI/CD** con GitHub Actions
3. **Configurar monitoring** (Sentry, logs, health checks)
4. **Realizar deployment a staging** y ejecutar tests
5. **Deployment a producción** con zero-downtime
6. **Monitorear y optimizar** continuamente

### Recursos Adicionales

- **Documentación del Proyecto:** `/home/isem/workspace/docs/projects/gamilit/`
- **Código Backend:** `/home/isem/workspace/projects/glit/backend/`
- **Código Frontend:** `/home/isem/workspace/gamilit-platform-web/`
- **Issues y Features:** `/home/isem/workspace/docs/projects/gamilit/04-planificacion/`

---

**Versión:** 1.0.0
**Última Actualización:** 2025-10-27
**Autor:** GAMILIT DevOps Team
**Licencia:** MIT

---

**[⬆ Volver arriba](#gamilit---guía-completa-de-deployment)**
