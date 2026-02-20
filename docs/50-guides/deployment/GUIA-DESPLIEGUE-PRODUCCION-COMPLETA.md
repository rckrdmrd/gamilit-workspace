# Guia Completa de Despliegue en Produccion - GAMILIT

> **Version:** 1.0.0
> **Fecha:** 2025-12-18
> **Servidor:** 74.208.126.102
> **Autor:** Documentacion generada por analisis de configuracion existente

---

## Indice

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Arquitectura de Produccion](#2-arquitectura-de-produccion)
3. [Pre-requisitos del Servidor](#3-pre-requisitos-del-servidor)
4. [Configuracion de Base de Datos](#4-configuracion-de-base-de-datos)
5. [Configuracion de Aplicaciones](#5-configuracion-de-aplicaciones)
6. [Proceso de Despliegue con PM2](#6-proceso-de-despliegue-con-pm2)
7. [Configuracion HTTPS con Certbot](#7-configuracion-https-con-certbot)
8. [Comandos de Referencia Rapida](#8-comandos-de-referencia-rapida)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Resumen Ejecutivo

### Componentes Desplegados

| Componente | Puerto | Instancias | Tecnologia |
|------------|--------|------------|------------|
| **Backend API** | 3006 | 2 (cluster) | NestJS + TypeORM |
| **Frontend** | 3005 | 1 (fork) | React + Vite |
| **PostgreSQL** | 5432 | 1 | PostgreSQL 15+ |

### URLs de Acceso

```
Frontend:    http://74.208.126.102:3005
Backend API: http://74.208.126.102:3006/api
API Docs:    http://74.208.126.102:3006/api/docs (deshabilitado en produccion)
```

---

## 2. Arquitectura de Produccion

```
                    ┌─────────────────────────────────────────────────────────────┐
                    │                  SERVIDOR 74.208.126.102                     │
                    │                                                              │
  Usuario           │   ┌──────────────┐      ┌──────────────────────────────┐    │
     │              │   │   Frontend   │      │         Backend API          │    │
     │              │   │  (Vite)      │      │        (NestJS)              │    │
     │              │   │  :3005       │      │        :3006                 │    │
     ▼              │   │              │      │  ┌────────┐  ┌────────┐     │    │
  ┌──────┐          │   │  1 instancia │      │  │ Inst 1 │  │ Inst 2 │     │    │
  │ HTTP │──────────┼───┤              │◄─────┼──┤ Cluster│  │ Cluster│     │    │
  └──────┘          │   └──────────────┘      │  └────────┘  └────────┘     │    │
                    │                         └──────────────┬───────────────┘    │
                    │                                        │                     │
                    │                                        ▼                     │
                    │                         ┌──────────────────────────────┐    │
                    │                         │      PostgreSQL 15+          │    │
                    │                         │         :5432                │    │
                    │                         │   DB: gamilit_platform       │    │
                    │                         └──────────────────────────────┘    │
                    │                                                              │
                    │   ┌──────────────────────────────────────────────────────┐  │
                    │   │                       PM2                             │  │
                    │   │  - Gestion de procesos                               │  │
                    │   │  - Auto-restart                                       │  │
                    │   │  - Cluster mode (backend)                            │  │
                    │   │  - Logs centralizados                                │  │
                    │   └──────────────────────────────────────────────────────┘  │
                    └─────────────────────────────────────────────────────────────┘
```

---

## 3. Pre-requisitos del Servidor

### Software Requerido

| Software | Version Minima | Comando de Verificacion |
|----------|---------------|------------------------|
| Node.js | 18.0.0+ | `node -v` |
| npm | 9.0.0+ | `npm -v` |
| PostgreSQL | 16+ | `psql --version` |
| PM2 | Latest | `pm2 -v` |
| Git | Latest | `git --version` |

### Instalacion de PM2 (si no esta instalado)

```bash
npm install -g pm2
```

### Verificacion Pre-Deploy

```bash
# Verificar Node.js
node -v     # Debe ser >= 18.0.0

# Verificar npm
npm -v      # Debe ser >= 9.0.0

# Verificar PostgreSQL
psql --version

# Verificar PM2
pm2 -v

# Verificar espacio en disco
df -h
```

---

## 4. Configuracion de Base de Datos

### 4.1 Estructura de Schemas

La base de datos contiene **17 schemas**:

| Schema | Descripcion |
|--------|-------------|
| `auth` | Autenticacion (Supabase-compatible) |
| `auth_management` | Gestion de usuarios, perfiles, roles |
| `educational_content` | Modulos, ejercicios, rubricas |
| `gamification_system` | XP, ML Coins, logros, rangos, tienda |
| `progress_tracking` | Progreso de usuarios, intentos |
| `social_features` | Escuelas, aulas, amistades |
| `notifications` | Sistema de notificaciones |
| `content_management` | Gestion de contenido |
| `communication` | Mensajeria entre usuarios |
| `audit_logging` | Logs de auditoria |
| `system_configuration` | Feature flags, parametros |
| `admin_dashboard` | Vistas administrativas |
| `lti_integration` | Learning Tools Interoperability |
| `storage` | Almacenamiento de archivos |
| `gamilit` | Funciones compartidas |
| `public` | Schema legacy |

### 4.2 Credenciales de Base de Datos

```bash
# Variables de entorno requeridas
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gamilit_platform
DB_USER=gamilit_user
DB_PASSWORD=<CONTRASEÑA_SEGURA>
```

### 4.3 Crear Base de Datos desde Cero

#### Opcion A: Creacion Limpia (Recomendado para primer despliegue)

```bash
cd apps/database

# Definir URL de conexion
export DATABASE_URL="postgresql://gamilit_user:<PASSWORD>@localhost:5432/gamilit_platform"

# Ejecutar script de creacion
./create-database.sh "$DATABASE_URL"
```

#### Opcion B: Drop y Recreacion (Para reset completo)

```bash
cd apps/database

# ADVERTENCIA: Esto ELIMINARA toda la data existente
export DATABASE_URL="postgresql://gamilit_user:<PASSWORD>@localhost:5432/gamilit_platform"

./drop-and-recreate-database.sh "$DATABASE_URL"
```

### 4.4 Fases de Creacion de Base de Datos

El script `create-database.sh` ejecuta **16 fases** en orden:

| Fase | Descripcion | Contenido |
|------|-------------|-----------|
| 0 | Extensions | pgcrypto, uuid-ossp |
| 1 | Prerequisites | Schemas y ENUMs base |
| 2 | Funciones Compartidas | Schema gamilit |
| 3 | Auth Schema | Autenticacion Supabase |
| 4 | Storage Schema | Almacenamiento |
| 5 | Auth Management | Usuarios, perfiles |
| 6 | Educational Content | Modulos, ejercicios |
| 6.5 | Notifications | Sistema de notificaciones |
| 7 | Gamification System | XP, rangos, logros |
| 8 | Progress Tracking | Progreso usuarios |
| 9 | Social Features | Escuelas, aulas |
| 9.5 | FK Constraints | Dependencias circulares |
| 10 | Content Management | Gestion contenido |
| 10.5 | Communication | Mensajeria |
| 11 | Audit Logging | Logs auditoria |
| 12-15 | Otros | Config, Admin, LTI |
| 16 | **Seeds PROD** | **66 entries de datos iniciales** |

### 4.5 Seeds de Produccion (66 entries)

Los seeds de produccion cargan:

| Categoria | Registros | Descripcion |
|-----------|-----------|-------------|
| **Usuarios** | 48 | 3 testing + 45 produccion |
| **Modulos** | 5 | Modulos educativos (M1-M5) |
| **Ejercicios** | 23 | M1: 5, M2: 5, M3: 5, M4: 5, M5: 3 |
| **Logros** | 30 | Achievement system |
| **Rangos Maya** | 5 | Ajaw, Nacom, Ah K'in, Halach Uinic, K'uk'ulkan |
| **Tienda** | 25 | 5 categorias, 20 items |
| **Misiones** | 11 | Templates de misiones |
| **Feature Flags** | 26 | Configuracion de features |
| **Escuelas** | 2+ | Demo + produccion |
| **Aulas** | 4+ | Aulas de prueba |

---

## 5. Configuracion de Aplicaciones

### 5.1 Backend - `.env.production`

Ubicacion: `apps/backend/.env.production`

```bash
# ============================================================================
# GAMILIT Backend - Production Environment
# Servidor: 74.208.126.102
# ============================================================================

# Server
NODE_ENV=production
PORT=3006
API_PREFIX=api

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gamilit_platform
DB_USER=gamilit_user
DB_PASSWORD=${DB_PASSWORD}
DB_SYNCHRONIZE=false
DB_LOGGING=false

# JWT (IMPORTANTE: Cambiar a valor seguro)
# Generar con: openssl rand -base64 32
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://74.208.126.102:3005,http://74.208.126.102,http://74.208.126.102:80
ENABLE_CORS=true
ENABLE_SWAGGER=false

# Logging
LOG_LEVEL=warn
LOG_TO_FILE=true

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

# Session
SESSION_SECRET=${SESSION_SECRET}
SESSION_MAX_AGE=86400000

# Email
EMAIL_FROM=noreply@gamilit.com
EMAIL_REPLY_TO=support@gamilit.com

# Frontend URL
FRONTEND_URL=http://74.208.126.102:3005
```

### 5.2 Frontend - `.env.production`

Ubicacion: `apps/frontend/.env.production`

```bash
# ============================================================================
# GAMILIT Frontend - Production Environment
# Servidor: 74.208.126.102
# ============================================================================

# Application
VITE_APP_NAME=GAMILIT Platform
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=production
VITE_ENV=production

# API Configuration
VITE_API_HOST=74.208.126.102:3006
VITE_API_PROTOCOL=http
VITE_API_VERSION=v1
VITE_API_TIMEOUT=30000

# WebSocket
VITE_WS_HOST=74.208.126.102:3006
VITE_WS_PROTOCOL=ws

# Authentication
VITE_JWT_EXPIRATION=7d

# Feature Flags
VITE_ENABLE_GAMIFICATION=true
VITE_ENABLE_SOCIAL_FEATURES=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=false
VITE_ENABLE_STORYBOOK=false
VITE_MOCK_API=false

# External Services (configurar en produccion)
VITE_GOOGLE_ANALYTICS_ID=
VITE_SENTRY_DSN=

# Logging
VITE_LOG_LEVEL=error
```

### 5.3 PM2 - `ecosystem.config.js`

Ubicacion: Raiz del proyecto

```javascript
module.exports = {
  apps: [
    // BACKEND - NestJS API
    {
      name: 'gamilit-backend',
      cwd: './apps/backend',
      script: 'dist/main.js',
      node_args: '-r tsconfig-paths/register',
      instances: 2,           // 2 instancias en cluster
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3006,
      },
      env_file: './.env.production',
      error_file: '../../logs/backend-error.log',
      out_file: '../../logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      min_uptime: '10s',
      max_restarts: 10,
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
    },

    // FRONTEND - Vite Preview
    {
      name: 'gamilit-frontend',
      cwd: './apps/frontend',
      script: 'npx',
      args: 'vite preview --port 3005 --host 0.0.0.0',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env_production: {
        NODE_ENV: 'production',
        VITE_ENV: 'production',
      },
      env_file: './.env.production',
      error_file: '../../logs/frontend-error.log',
      out_file: '../../logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      min_uptime: '10s',
      max_restarts: 10,
      kill_timeout: 5000,
    },
  ],
};
```

---

## 6. Proceso de Despliegue con PM2

### 6.1 Flujo Completo de Despliegue

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     PROCESO DE DESPLIEGUE PRODUCCION                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  PASO 1: Preparacion                                                         │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ 1.1 git pull origin master                                               │ │
│  │ 1.2 Verificar pre-requisitos                                           │ │
│  │ 1.3 Configurar variables de entorno (.env.production)                  │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                              │                                               │
│                              ▼                                               │
│  PASO 2: Base de Datos (si es necesario)                                    │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ 2.1 cd apps/database                                                   │ │
│  │ 2.2 export DATABASE_URL="postgresql://..."                             │ │
│  │ 2.3 ./create-database.sh "$DATABASE_URL"  (o drop-and-recreate)       │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                              │                                               │
│                              ▼                                               │
│  PASO 3: Build de Aplicaciones                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ 3.1 cd apps/backend && npm install && npm run build                    │ │
│  │ 3.2 cd apps/frontend && npm install && npm run build:prod              │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                              │                                               │
│                              ▼                                               │
│  PASO 4: Despliegue PM2                                                     │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ 4.1 pm2 start ecosystem.config.js --env production                     │ │
│  │ 4.2 pm2 save                                                           │ │
│  │ 4.3 pm2 startup (para auto-inicio)                                     │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                              │                                               │
│                              ▼                                               │
│  PASO 5: Verificacion                                                        │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ 5.1 pm2 status                                                         │ │
│  │ 5.2 curl http://74.208.126.102:3006/api/health                        │ │
│  │ 5.3 Acceder a http://74.208.126.102:3005                              │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Comandos Paso a Paso

#### Paso 1: Preparacion

```bash
# Ir al directorio del proyecto
cd /path/to/gamilit

# Obtener ultimos cambios
git pull origin master
```

#### Paso 2: Base de Datos (Solo si es necesario)

```bash
# Ir al directorio de database
cd apps/database

# Configurar URL de conexion
export DATABASE_URL="postgresql://gamilit_user:TU_PASSWORD@localhost:5432/gamilit_platform"

# OPCION A: Crear base de datos nueva
./create-database.sh "$DATABASE_URL"

# OPCION B: Reset completo (ELIMINA TODA LA DATA)
./drop-and-recreate-database.sh "$DATABASE_URL"

# Volver al directorio raiz
cd ../..
```

#### Paso 3: Build de Aplicaciones

```bash
# Build Backend
cd apps/backend
npm install
npm run build

# Verificar build exitoso
ls -la dist/main.js

# Build Frontend
cd ../frontend
npm install
npm run build:prod

# Verificar build exitoso
ls -la dist/

# Volver al directorio raiz
cd ../..
```

#### Paso 4: Despliegue con PM2

```bash
# Crear directorio de logs
mkdir -p logs

# Detener procesos anteriores (si existen)
pm2 delete gamilit-backend gamilit-frontend 2>/dev/null || true

# Iniciar aplicaciones
pm2 start ecosystem.config.js --env production

# Guardar configuracion
pm2 save

# Configurar inicio automatico (primera vez)
pm2 startup
# Ejecutar el comando que muestre el output anterior
```

#### Paso 5: Verificacion

```bash
# Ver estado de procesos
pm2 status

# Verificar health del backend
curl http://74.208.126.102:3006/api/health

# Ver logs en tiempo real
pm2 logs

# Acceder al frontend en el navegador
# http://74.208.126.102:3005
```

### 6.3 Script Automatizado

Existe un script que automatiza el proceso:

```bash
# Ejecutar script de despliegue
./scripts/deploy-production.sh
```

Este script:
1. Verifica que PM2 este instalado
2. Verifica que los builds existan
3. Verifica archivos `.env.production`
4. Crea directorio de logs
5. Detiene procesos PM2 existentes
6. Inicia backend (2 instancias cluster)
7. Inicia frontend (1 instancia)
8. Guarda configuracion PM2
9. Muestra resumen final

---

## 7. Configuracion HTTPS con Certbot

### 7.1 Arquitectura HTTPS

```
                           ARQUITECTURA HTTPS PRODUCCION
  ┌─────────────────────────────────────────────────────────────────────────────┐
  │                                                                              │
  │    Usuario                                                                   │
  │       │                                                                      │
  │       │ HTTPS (443)                                                          │
  │       ▼                                                                      │
  │   ┌────────────────────────────────────────────────────────────────────┐    │
  │   │                         NGINX REVERSE PROXY                         │    │
  │   │                         (Terminacion SSL)                           │    │
  │   │                                                                     │    │
  │   │  ┌─────────────────────┐    ┌─────────────────────────────────┐   │    │
  │   │  │ SSL Certificate     │    │ Rutas:                          │   │    │
  │   │  │ (Certbot/LE)        │    │   /       → Frontend :3005      │   │    │
  │   │  │                     │    │   /api    → Backend :3006       │   │    │
  │   │  │ /etc/letsencrypt/   │    │   /socket.io → Backend :3006    │   │    │
  │   │  └─────────────────────┘    └─────────────────────────────────┘   │    │
  │   └────────────────────────────────────────────────────────────────────┘    │
  │                         │                           │                        │
  │                         │ HTTP (interno)            │ HTTP (interno)         │
  │                         ▼                           ▼                        │
  │              ┌──────────────────┐        ┌──────────────────────┐           │
  │              │    Frontend      │        │      Backend         │           │
  │              │   (Vite)         │        │     (NestJS)         │           │
  │              │   :3005          │        │     :3006            │           │
  │              │   interno        │        │     interno          │           │
  │              └──────────────────┘        └──────────────────────┘           │
  │                                                                              │
  └─────────────────────────────────────────────────────────────────────────────┘
```

**Concepto clave:** Nginx actua como terminador SSL. Las aplicaciones (Backend/Frontend) siguen corriendo en HTTP internamente, pero todo el trafico externo usa HTTPS.

### 7.2 Requisitos para HTTPS

| Requisito | Descripcion | Estado |
|-----------|-------------|--------|
| **Dominio** | Necesario para Certbot/Let's Encrypt | Opcional (IP requiere certificado autofirmado) |
| **Nginx** | Reverse proxy y terminador SSL | Requerido |
| **Certbot** | Cliente ACME para Let's Encrypt | Requerido (con dominio) |
| **Puertos abiertos** | 80 (HTTP), 443 (HTTPS) | Requerido |

### 7.3 Instalacion de Nginx y Certbot

```bash
# Actualizar repositorios
sudo apt update

# Instalar Nginx
sudo apt install nginx -y

# Verificar Nginx
sudo systemctl status nginx

# Instalar Certbot con plugin Nginx
sudo apt install certbot python3-certbot-nginx -y

# Verificar Certbot
certbot --version
```

### 7.4 Opcion A: HTTPS con Dominio (Recomendado)

#### Paso 1: Configurar DNS

Asegurar que el dominio apunte a la IP del servidor:
```
A Record:     gamilit.com      → 74.208.126.102
A Record:     www.gamilit.com  → 74.208.126.102
A Record:     api.gamilit.com  → 74.208.126.102 (opcional)
```

#### Paso 2: Configurar Nginx inicial (HTTP)

Crear `/etc/nginx/sites-available/gamilit`:

```nginx
server {
    listen 80;
    server_name gamilit.com www.gamilit.com;

    # Frontend - React App
    location / {
        proxy_pass http://127.0.0.1:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:3006;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts para API
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://127.0.0.1:3006;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;

        # Timeouts para WebSocket
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;
    }
}
```

Habilitar sitio:

```bash
# Crear symlink
sudo ln -s /etc/nginx/sites-available/gamilit /etc/nginx/sites-enabled/

# Eliminar default si existe
sudo rm /etc/nginx/sites-enabled/default 2>/dev/null || true

# Verificar configuracion
sudo nginx -t

# Recargar Nginx
sudo systemctl reload nginx
```

#### Paso 3: Obtener Certificado SSL con Certbot

```bash
# Obtener certificado (automatico)
sudo certbot --nginx -d gamilit.com -d www.gamilit.com

# Durante el proceso:
# 1. Ingresar email para notificaciones
# 2. Aceptar terminos de servicio
# 3. Elegir si redirigir HTTP a HTTPS (recomendado: SI)
```

Certbot automaticamente:
- Obtiene el certificado de Let's Encrypt
- Modifica la configuracion de Nginx
- Configura renovacion automatica

#### Paso 4: Verificar Configuracion Nginx (Post-Certbot)

Despues de ejecutar certbot, el archivo se vera asi:

```nginx
server {
    listen 80;
    server_name gamilit.com www.gamilit.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name gamilit.com www.gamilit.com;

    # Certificados generados por Certbot
    ssl_certificate /etc/letsencrypt/live/gamilit.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/gamilit.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Frontend - React App
    location / {
        proxy_pass http://127.0.0.1:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:3006;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket (wss://)
    location /socket.io {
        proxy_pass http://127.0.0.1:3006;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

### 7.5 Opcion B: HTTPS con IP (Sin Dominio)

Si no tienes dominio, necesitas certificado autofirmado:

```bash
# Crear directorio para certificados
sudo mkdir -p /etc/nginx/ssl

# Generar certificado autofirmado (valido 365 dias)
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/gamilit.key \
  -out /etc/nginx/ssl/gamilit.crt \
  -subj "/C=MX/ST=Estado/L=Ciudad/O=Gamilit/CN=74.208.126.102"
```

Configuracion Nginx para IP con SSL:

```nginx
server {
    listen 80;
    server_name 74.208.126.102;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name 74.208.126.102;

    # Certificado autofirmado
    ssl_certificate /etc/nginx/ssl/gamilit.crt;
    ssl_certificate_key /etc/nginx/ssl/gamilit.key;

    # Configuracion SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_session_cache shared:SSL:10m;

    # Frontend
    location / {
        proxy_pass http://127.0.0.1:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:3006;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://127.0.0.1:3006;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

**Nota:** Los navegadores mostraran advertencia de certificado no confiable.

### 7.6 Actualizar Variables de Entorno para HTTPS

#### Backend `.env.production`

```bash
# ANTES (HTTP)
CORS_ORIGIN=http://74.208.126.102:3005,http://74.208.126.102
FRONTEND_URL=http://74.208.126.102:3005

# DESPUES (HTTPS con dominio)
CORS_ORIGIN=https://gamilit.com,https://www.gamilit.com,https://74.208.126.102
FRONTEND_URL=https://gamilit.com

# DESPUES (HTTPS con IP)
CORS_ORIGIN=https://74.208.126.102
FRONTEND_URL=https://74.208.126.102
```

#### Frontend `.env.production`

```bash
# ANTES (HTTP)
VITE_API_HOST=74.208.126.102:3006
VITE_API_PROTOCOL=http
VITE_WS_HOST=74.208.126.102:3006
VITE_WS_PROTOCOL=ws

# DESPUES (HTTPS con Nginx proxy - RECOMENDADO)
# Nginx maneja SSL, frontend accede via proxy
VITE_API_HOST=gamilit.com
VITE_API_PROTOCOL=https
VITE_WS_HOST=gamilit.com
VITE_WS_PROTOCOL=wss

# DESPUES (HTTPS con IP)
VITE_API_HOST=74.208.126.102
VITE_API_PROTOCOL=https
VITE_WS_HOST=74.208.126.102
VITE_WS_PROTOCOL=wss
```

### 7.7 Rebuild y Reinicio

Despues de cambiar las variables de entorno:

```bash
# 1. Rebuild del Frontend (variables VITE_ se embeben en build)
cd apps/frontend
npm run build:prod

# 2. Reiniciar servicios
pm2 restart all

# 3. Verificar Nginx
sudo nginx -t
sudo systemctl reload nginx
```

### 7.8 Renovacion Automatica de Certificados

Certbot configura renovacion automatica. Verificar:

```bash
# Ver timer de renovacion
sudo systemctl status certbot.timer

# Probar renovacion (dry-run)
sudo certbot renew --dry-run

# Forzar renovacion si es necesario
sudo certbot renew --force-renewal
```

Los certificados de Let's Encrypt expiran cada 90 dias. Certbot los renueva automaticamente.

### 7.9 URLs Finales con HTTPS

#### Con Dominio
```
Frontend:     https://gamilit.com
Backend API:  https://gamilit.com/api
WebSocket:    wss://gamilit.com/socket.io
Health Check: https://gamilit.com/api/health
```

#### Con IP (certificado autofirmado)
```
Frontend:     https://74.208.126.102
Backend API:  https://74.208.126.102/api
WebSocket:    wss://74.208.126.102/socket.io
Health Check: https://74.208.126.102/api/health
```

### 7.10 Verificacion HTTPS

```bash
# Verificar certificado SSL
curl -vI https://gamilit.com 2>&1 | grep -E "SSL|certificate|subject"

# Verificar API sobre HTTPS
curl -s https://gamilit.com/api/health | jq

# Verificar que HTTP redirige a HTTPS
curl -I http://gamilit.com

# Verificar WebSocket (requiere wscat)
npm install -g wscat
wscat -c wss://gamilit.com/socket.io
```

### 7.11 Checklist HTTPS

- [ ] Nginx instalado y corriendo
- [ ] Certbot instalado
- [ ] Dominio configurado en DNS (o usar IP)
- [ ] Configuracion Nginx creada en sites-available
- [ ] Symlink creado en sites-enabled
- [ ] `nginx -t` sin errores
- [ ] Certificado SSL obtenido (certbot o autofirmado)
- [ ] `CORS_ORIGIN` actualizado con https://
- [ ] `FRONTEND_URL` actualizado con https://
- [ ] `VITE_API_PROTOCOL=https` en frontend
- [ ] `VITE_WS_PROTOCOL=wss` en frontend
- [ ] Frontend recompilado (`npm run build:prod`)
- [ ] PM2 reiniciado (`pm2 restart all`)
- [ ] Nginx recargado (`sudo systemctl reload nginx`)
- [ ] Health check responde sobre HTTPS
- [ ] Frontend carga sin errores de mixed content
- [ ] WebSocket conecta sobre wss://

---

## 8. Comandos de Referencia Rapida

### PM2 - Operaciones Basicas

```bash
# Ver estado
pm2 status
pm2 list

# Logs
pm2 logs                      # Todos los logs
pm2 logs gamilit-backend      # Solo backend
pm2 logs gamilit-frontend     # Solo frontend

# Monitoreo
pm2 monit                     # Monitor interactivo

# Reinicio
pm2 restart all               # Reiniciar todo
pm2 restart gamilit-backend   # Solo backend
pm2 reload gamilit-backend    # Zero-downtime reload

# Detener
pm2 stop all
pm2 stop gamilit-backend

# Eliminar
pm2 delete all
pm2 delete gamilit-backend
```

### PM2 - Operaciones Avanzadas

```bash
# Informacion detallada
pm2 show gamilit-backend

# Flush logs
pm2 flush

# Guardar configuracion
pm2 save

# Restaurar procesos guardados
pm2 resurrect

# Configurar inicio automatico
pm2 startup

# Actualizar PM2
pm2 update
```

### Base de Datos

```bash
# Variables
export DATABASE_URL="postgresql://gamilit_user:PASSWORD@localhost:5432/gamilit_platform"

# Crear estructura DDL + Seeds
./create-database.sh "$DATABASE_URL"

# Drop y recrear (RESET TOTAL)
./drop-and-recreate-database.sh "$DATABASE_URL"

# Conectar a PostgreSQL
psql "$DATABASE_URL"

# Backup
pg_dump -U gamilit_user -d gamilit_platform -F c -f backup_$(date +%Y%m%d).dump

# Restore
pg_restore -U gamilit_user -d gamilit_platform -c backup_20251218.dump
```

### Build

```bash
# Backend
cd apps/backend && npm run build

# Frontend (produccion)
cd apps/frontend && npm run build:prod

# Frontend (desarrollo)
cd apps/frontend && npm run build
```

---

## 9. Troubleshooting

### Problema: Backend no inicia

```bash
# Ver logs de error
pm2 logs gamilit-backend --err --lines 50

# Verificar que el build existe
ls -la apps/backend/dist/main.js

# Verificar conexion a base de datos
psql "$DATABASE_URL" -c "SELECT 1"

# Verificar puerto no ocupado
sudo lsof -i :3006
```

### Problema: Frontend no inicia

```bash
# Ver logs de error
pm2 logs gamilit-frontend --err --lines 50

# Verificar que el build existe
ls -la apps/frontend/dist/

# Verificar puerto no ocupado
sudo lsof -i :3005
```

### Problema: Error de conexion a BD

```bash
# Verificar PostgreSQL corriendo
sudo systemctl status postgresql

# Reiniciar PostgreSQL
sudo systemctl restart postgresql

# Verificar usuario y permisos
psql -U postgres -c "\\du"
psql -U postgres -c "\\l"
```

### Problema: Puerto ocupado

```bash
# Encontrar proceso usando el puerto
sudo lsof -i :3006
sudo lsof -i :3005

# Matar proceso
sudo kill -9 <PID>

# O usar fuser
sudo fuser -k 3006/tcp
```

### Problema: Memoria alta

```bash
# Ver uso de memoria PM2
pm2 monit

# Reiniciar con limite de memoria
pm2 restart gamilit-backend --max-memory-restart 500M
```

### Problema: CORS

```bash
# Verificar CORS_ORIGIN en backend
grep CORS_ORIGIN apps/backend/.env.production

# Debe incluir el origen del frontend
# CORS_ORIGIN=http://74.208.126.102:3005,http://74.208.126.102
```

---

## Checklist de Despliegue

### Pre-Despliegue
- [ ] Verificar version de Node.js >= 18
- [ ] Verificar version de npm >= 9
- [ ] Verificar PostgreSQL corriendo
- [ ] Verificar PM2 instalado
- [ ] Actualizar codigo: `git pull origin master`

### Base de Datos
- [ ] Configurar DATABASE_URL
- [ ] Ejecutar `create-database.sh` (o `drop-and-recreate`)
- [ ] Verificar que los seeds cargaron correctamente

### Configuracion
- [ ] Configurar `apps/backend/.env.production`
- [ ] Configurar `apps/frontend/.env.production`
- [ ] Verificar JWT_SECRET es seguro
- [ ] Verificar CORS_ORIGIN correcto

### Build
- [ ] Build backend: `npm run build`
- [ ] Build frontend: `npm run build:prod`
- [ ] Verificar archivos en `dist/`

### Despliegue
- [ ] Ejecutar `pm2 start ecosystem.config.js --env production`
- [ ] Verificar `pm2 status` - ambos online
- [ ] Ejecutar `pm2 save`
- [ ] Configurar `pm2 startup` (primera vez)

### Verificacion
- [ ] Verificar health: `curl http://74.208.126.102:3006/api/health`
- [ ] Acceder a frontend: http://74.208.126.102:3005
- [ ] Probar login con usuario de prueba
- [ ] Verificar logs sin errores: `pm2 logs`

---

## Contacto y Soporte

Para problemas de despliegue:
1. Revisar logs: `pm2 logs`
2. Consultar esta documentacion
3. Verificar `DEPLOYMENT-MASTER.md` para guia consolidada completa

---

> **Nota:** Esta documentacion fue generada automaticamente analizando los archivos de configuracion existentes en el proyecto. Mantener actualizada cuando haya cambios en la arquitectura.
