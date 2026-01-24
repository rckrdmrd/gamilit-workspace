# REPORTE DE ANALISIS: Implementacion Produccion GAMILIT

**Tipo:** Analisis de Requerimientos Completo
**Rol:** Requirements Analyst (SIMCO)
**Fecha:** 2025-12-18
**Version:** 1.0.0

---

## RESUMEN EJECUTIVO

Este reporte analiza exhaustivamente los requerimientos para implementar el proyecto GAMILIT en produccion, comparando el estado actual del repositorio (`/home/isem/workspace/projects/gamilit`) con el servidor de produccion (`/home/isem/workspace-old/wsl-ubuntu/workspace/workspace-gamilit/gamilit/projects/gamilit`).

**Conclusion Principal:** El proyecto cuenta con documentacion y scripts robustos, pero existen gaps especificos que requieren atencion para un deployment sin friccion.

---

## INDICE

1. [Analisis Comparativo](#1-analisis-comparativo)
2. [Gaps Identificados](#2-gaps-identificados)
3. [SSL/HTTPS con Certbot](#3-sslhttps-con-certbot)
4. [Deployment con PM2](#4-deployment-con-pm2)
5. [Base de Datos](#5-base-de-datos)
6. [CORS y Certificados](#6-cors-y-certificados)
7. [Plan de Correcciones](#7-plan-de-correcciones)
8. [Checklist de Validacion](#8-checklist-de-validacion)

---

## 1. ANALISIS COMPARATIVO

### 1.1 Estructura de Directorios

| Componente | Proyecto Actual | Proyecto Antiguo | Estado |
|------------|-----------------|------------------|--------|
| Backend (NestJS) | `apps/backend/` | `apps/backend/` | IDENTICO |
| Frontend (Vite) | `apps/frontend/` | `apps/frontend/` | IDENTICO |
| Database DDL | `apps/database/ddl/` | `apps/database/ddl/` | IDENTICO |
| Seeds prod | `apps/database/seeds/prod/` | `apps/database/seeds/prod/` | SINCRONIZADO |
| Scripts deploy | `scripts/` | `scripts/` | IDENTICO |
| PM2 Config | `ecosystem.config.js` | `ecosystem.config.js` | IDENTICO |
| Docs deployment | `docs/95-guias-desarrollo/` | `docs/95-guias-desarrollo/` | IDENTICO |

### 1.2 Archivos de Configuracion Criticos

```
PROYECTO ACTUAL:
├── apps/backend/.env.production.example     ✅ Existe
├── apps/backend/.env.production             ✅ Existe (NO commitear)
├── apps/frontend/.env.production.example    ✅ Existe
├── apps/frontend/.env.production            ✅ Existe (NO commitear)
└── ecosystem.config.js                      ✅ Completo

GAPS:
├── Script unificado de setup SSL           ❌ No existe
├── Script de validacion post-deploy         ⚠️  Parcial
└── Documentacion de rollback SSL            ❌ No existe
```

### 1.3 Documentacion Existente

| Documento | Ubicacion | Completitud |
|-----------|-----------|-------------|
| `GUIA-SSL-NGINX-PRODUCCION.md` | `docs/95-guias-desarrollo/` | 80% |
| `GUIA-SSL-AUTOFIRMADO.md` | `docs/95-guias-desarrollo/` | 90% |
| `GUIA-CORS-PRODUCCION.md` | `docs/95-guias-desarrollo/` | 95% |
| `GUIA-DESPLIEGUE-PRODUCCION-COMPLETA.md` | `docs/95-guias-desarrollo/` | 85% |
| `GUIA-CREAR-BASE-DATOS.md` | `docs/95-guias-desarrollo/` | 90% |
| `DIRECTIVA-DEPLOYMENT.md` | `docs/95-guias-desarrollo/` | 90% |
| `INSTRUCCIONES-DEPLOYMENT.md` | `raiz/` | 100% |

---

## 2. GAPS IDENTIFICADOS

### 2.1 CRITICOS (Bloquean deployment)

| ID | Gap | Impacto | Solucion |
|----|-----|---------|----------|
| GAP-001 | No existe script automatizado para setup SSL con Certbot | Proceso manual propenso a errores | Crear `scripts/setup-ssl-certbot.sh` |
| GAP-002 | Variables .env deben ser creadas manualmente | Riesgo de configuracion incorrecta | Crear script de generacion con prompts |
| GAP-003 | No hay validacion automatica de certificados SSL | Deployment puede fallar silenciosamente | Agregar a `pre-deploy-check.sh` |

### 2.2 IMPORTANTES (Afectan operacion)

| ID | Gap | Impacto | Solucion |
|----|-----|---------|----------|
| GAP-004 | Falta procedimiento de renovacion automatica SSL | Certificado expira sin aviso | Documentar cron de certbot |
| GAP-005 | Logs de Nginx no integrados con PM2 logs | Debugging fragmentado | Documentar ubicacion logs |
| GAP-006 | No hay healthcheck para Nginx | Falla SSL no detectada | Agregar healthcheck |

### 2.3 MENORES (Mejoras)

| ID | Gap | Impacto | Solucion |
|----|-----|---------|----------|
| GAP-007 | Falta diagrama de arquitectura SSL | Onboarding lento | Agregar a documentacion |
| GAP-008 | No hay script de backup de certificados | Recuperacion lenta ante fallo | Crear script backup |

---

## 3. SSL/HTTPS CON CERTBOT

### 3.1 Arquitectura Requerida

```
                    INTERNET (HTTPS :443)
                            │
                            ▼
                  ┌─────────────────────┐
                  │   Nginx             │
                  │   SSL Termination   │◀── Let's Encrypt (Certbot)
                  │   Reverse Proxy     │
                  └──────────┬──────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
           ▼                 ▼                 ▼
    ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
    │ Frontend    │   │ Backend     │   │ WebSocket   │
    │ :3005 HTTP  │   │ :3006 HTTP  │   │ :3006 HTTP  │
    │ /           │   │ /api/*      │   │ /socket.io  │
    └─────────────┘   └─────────────┘   └─────────────┘
```

### 3.2 Prerequisitos

```bash
# 1. Dominio apuntando al servidor (DNS A record)
# Verificar:
dig gamilit.com +short
# Debe mostrar: 74.208.126.102

# 2. Puertos abiertos
# - 80 (HTTP - necesario para validacion Certbot)
# - 443 (HTTPS)
# - 3005, 3006 (solo localhost)

# 3. Nginx instalado
sudo apt install -y nginx certbot python3-certbot-nginx
```

### 3.3 Procedimiento de Configuracion SSL

**PASO 1: Configurar Nginx SIN SSL (para validacion Certbot)**

```bash
sudo tee /etc/nginx/sites-available/gamilit << 'EOF'
server {
    listen 80;
    server_name gamilit.com www.gamilit.com;  # CAMBIAR POR DOMINIO REAL

    # Frontend
    location / {
        proxy_pass http://localhost:3005;
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
        proxy_pass http://localhost:3006;
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
        proxy_pass http://localhost:3006;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
EOF

# Habilitar sitio
sudo ln -sf /etc/nginx/sites-available/gamilit /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Verificar y reiniciar
sudo nginx -t && sudo systemctl restart nginx
```

**PASO 2: Obtener Certificado SSL**

```bash
# Obtener certificado (INTERACTIVO - pedira email)
sudo certbot --nginx -d gamilit.com -d www.gamilit.com

# Verificar renovacion automatica
sudo certbot renew --dry-run

# Ver certificados instalados
sudo certbot certificates
```

**PASO 3: Configuracion Nginx FINAL (post-certbot)**

Certbot modifica automaticamente el archivo, quedando asi:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name gamilit.com www.gamilit.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name gamilit.com www.gamilit.com;

    # SSL (configurado por Certbot)
    ssl_certificate /etc/letsencrypt/live/gamilit.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/gamilit.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # CRITICO: NO agregar headers CORS aqui
    # NestJS maneja CORS internamente
    # Headers duplicados causan: "multiple values" error

    # Frontend
    location / {
        proxy_pass http://localhost:3005;
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
        proxy_pass http://localhost:3006;
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
        proxy_pass http://localhost:3006;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```

**PASO 4: Actualizar Variables de Entorno**

Backend `.env.production`:
```bash
# CORS - Solo HTTPS (SIN puerto si va por Nginx :443)
CORS_ORIGIN=https://gamilit.com,https://www.gamilit.com
FRONTEND_URL=https://gamilit.com
```

Frontend `.env.production`:
```bash
# API a traves de Nginx (puerto 443 implicito)
VITE_API_HOST=gamilit.com
VITE_API_PROTOCOL=https
VITE_WS_HOST=gamilit.com
VITE_WS_PROTOCOL=wss
```

**PASO 5: Rebuild y Restart**

```bash
# Rebuild frontend con nuevas variables
cd apps/frontend && npm run build && cd ../..

# Restart PM2
pm2 restart all
```

### 3.4 Renovacion Automatica (Cron)

Certbot configura automaticamente la renovacion. Verificar:

```bash
# Timer de systemd
sudo systemctl list-timers | grep certbot

# O cron
sudo cat /etc/cron.d/certbot

# Manual dry-run
sudo certbot renew --dry-run
```

### 3.5 Certificado Auto-firmado (Sin Dominio)

Si NO se tiene dominio, usar certificado auto-firmado:

```bash
# Generar certificado auto-firmado
sudo mkdir -p /etc/nginx/ssl
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/gamilit.key \
    -out /etc/nginx/ssl/gamilit.crt \
    -subj "/C=MX/ST=Estado/L=Ciudad/O=Gamilit/CN=74.208.126.102"

# Nginx config con auto-firmado
server {
    listen 443 ssl http2;
    server_name 74.208.126.102;

    ssl_certificate /etc/nginx/ssl/gamilit.crt;
    ssl_certificate_key /etc/nginx/ssl/gamilit.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # ... resto de config igual ...
}
```

**NOTA:** El navegador mostrara advertencia de certificado no confiable.

---

## 4. DEPLOYMENT CON PM2

### 4.1 Arquitectura PM2

```
PM2 Process Manager
├── gamilit-backend (cluster mode)
│   ├── Instance 0 (port 3006)
│   └── Instance 1 (port 3006)
└── gamilit-frontend (fork mode)
    └── Instance 0 (port 3005)
```

### 4.2 Configuracion Actual (ecosystem.config.js)

```javascript
module.exports = {
  apps: [
    {
      name: 'gamilit-backend',
      cwd: './apps/backend',
      script: 'dist/main.js',
      instances: 2,
      exec_mode: 'cluster',
      autorestart: true,
      max_memory_restart: '1G',
      env_file: './.env.production',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3006,
      },
      error_file: '../../logs/backend-error.log',
      out_file: '../../logs/backend-out.log',
      wait_ready: true,
      listen_timeout: 10000,
    },
    {
      name: 'gamilit-frontend',
      cwd: './apps/frontend',
      script: 'npx',
      args: 'vite preview --port 3005 --host 0.0.0.0',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '512M',
      env_file: './.env.production',
      env_production: {
        NODE_ENV: 'production',
        VITE_ENV: 'production',
      },
      error_file: '../../logs/frontend-error.log',
      out_file: '../../logs/frontend-out.log',
    },
  ],
};
```

### 4.3 Procedimiento de Deployment Completo

```bash
# 1. BACKUP (antes de cualquier cambio)
BACKUP_DIR="/home/gamilit/backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR/config"
cp apps/backend/.env.production "$BACKUP_DIR/config/"
cp apps/frontend/.env.production "$BACKUP_DIR/config/"
pg_dump "$DATABASE_URL" | gzip > "$BACKUP_DIR/database/gamilit.sql.gz"

# 2. PULL (actualizar codigo)
git fetch origin
git reset --hard origin/main

# 3. RESTAURAR CONFIG
cp "$BACKUP_DIR/config/.env.production" apps/backend/
cp "$BACKUP_DIR/config/.env.production" apps/frontend/

# 4. INSTALAR DEPENDENCIAS
npm install
cd apps/backend && npm install && cd ../..
cd apps/frontend && npm install && cd ../..

# 5. BUILD
cd apps/backend && npm run build && cd ../..
cd apps/frontend && npm run build && cd ../..

# 6. DATABASE (si hubo cambios DDL)
cd apps/database
./drop-and-recreate-database.sh "$DATABASE_URL"
cd ..

# 7. DEPLOY PM2
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js --env production
pm2 save

# 8. VALIDAR
pm2 list
curl -s http://localhost:3006/api/health | head -5
curl -s -o /dev/null -w "HTTP: %{http_code}\n" http://localhost:3005

# 9. STARTUP (auto-inicio en reboot)
pm2 startup
pm2 save
```

### 4.4 Comandos PM2 Utiles

```bash
# Monitoreo
pm2 list                    # Estado de procesos
pm2 monit                   # Monitor interactivo
pm2 logs                    # Logs en tiempo real
pm2 logs gamilit-backend    # Logs solo backend

# Control
pm2 restart all             # Reiniciar todo
pm2 reload all              # Reload sin downtime
pm2 stop all                # Detener todo
pm2 delete all              # Eliminar procesos

# Mantenimiento
pm2 save                    # Guardar config actual
pm2 startup                 # Configurar auto-inicio
pm2 unstartup               # Remover auto-inicio
pm2 resurrect               # Restaurar procesos guardados
```

### 4.5 Script Recomendado para Deployment

Crear `scripts/deploy.sh`:

```bash
#!/bin/bash
set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "=== GAMILIT Deployment ==="

# 1. Verificaciones
[ -f "apps/backend/.env.production" ] || { echo "ERROR: .env.production backend no existe"; exit 1; }
[ -f "apps/frontend/.env.production" ] || { echo "ERROR: .env.production frontend no existe"; exit 1; }
[ -f "apps/backend/dist/main.js" ] || { echo "ERROR: Build backend no existe"; exit 1; }
[ -d "apps/frontend/dist" ] || { echo "ERROR: Build frontend no existe"; exit 1; }

# 2. Crear logs dir
mkdir -p logs

# 3. PM2 deploy
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js --env production
pm2 save

# 4. Validar
sleep 5
pm2 list

BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3006/api/health || echo "000")
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3005 || echo "000")

[ "$BACKEND_STATUS" == "200" ] && echo "Backend: OK" || echo "Backend: FAIL ($BACKEND_STATUS)"
[ "$FRONTEND_STATUS" == "200" ] && echo "Frontend: OK" || echo "Frontend: FAIL ($FRONTEND_STATUS)"

echo "=== Deployment completado ==="
```

---

## 5. BASE DE DATOS

### 5.1 Arquitectura de Scripts

```
apps/database/
├── ddl/
│   ├── 00-prerequisites.sql         # ENUMs, schemas base
│   └── schemas/                     # 17 esquemas con tablas/funciones
├── seeds/
│   ├── dev/                         # Datos desarrollo
│   ├── staging/                     # Datos staging
│   └── prod/                        # Datos produccion (38+ archivos)
├── scripts/
│   ├── init-database.sh             # Crea usuario + BD + DDL + Seeds
│   ├── init-database-v3.sh          # Con dotenv-vault
│   ├── reset-database.sh            # Reset manteniendo usuario
│   └── recreate-database.sh         # Drop usuario + BD completo
├── create-database.sh               # DDL + Seeds (BD ya existe)
└── drop-and-recreate-database.sh    # Drop BD + Create + DDL + Seeds
```

### 5.2 Escenarios de Uso

```
¿Primera instalacion? (Usuario no existe)
├── SI → Escenario 1: ./scripts/init-database.sh --env prod --password "$DB_PASSWORD"
└── NO → ¿Necesitas borrar TODO (datos + estructura)?
         ├── SI → Escenario 2: ./drop-and-recreate-database.sh "$DATABASE_URL"
         └── NO → ¿BD existe pero esta vacia?
                  ├── SI → Escenario 3: ./create-database.sh "$DATABASE_URL"
                  └── NO → Escenario 2: ./drop-and-recreate-database.sh
```

### 5.3 Procedimiento Recomendado (Produccion)

```bash
# Variables necesarias
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=gamilit_platform
export DB_USER=gamilit_user
export DB_PASSWORD="<PASSWORD_SEGURO>"
export DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"

# ESCENARIO MAS COMUN: Recrear BD limpia
cd apps/database
./drop-and-recreate-database.sh "$DATABASE_URL"

# Verificar
psql "$DATABASE_URL" -c "
SELECT 'tenants' as tabla, COUNT(*) FROM auth_management.tenants
UNION ALL SELECT 'users', COUNT(*) FROM auth.users
UNION ALL SELECT 'modules', COUNT(*) FROM educational_content.modules
UNION ALL SELECT 'ranks', COUNT(*) FROM gamification_system.maya_ranks
UNION ALL SELECT 'flags', COUNT(*) FROM system_configuration.feature_flags;"
```

### 5.4 Valores Esperados Post-Seeds

| Tabla | Cantidad Esperada |
|-------|-------------------|
| tenants | 14+ |
| users | 20+ |
| modules | 5 |
| maya_ranks | 5 |
| feature_flags | 26+ |
| exercises | 50+ |

### 5.5 Troubleshooting Base de Datos

```bash
# Error: Usuario no puede conectar
psql -U postgres -c "ALTER USER gamilit_user WITH PASSWORD 'nueva_password';"

# Error: BD no existe
psql -U postgres -c "CREATE DATABASE gamilit_platform OWNER gamilit_user;"

# Error: Extension no instalada
psql -U postgres -d gamilit_platform -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
psql -U postgres -d gamilit_platform -c "CREATE EXTENSION IF NOT EXISTS \"pgcrypto\";"

# Verificar conexion
psql "$DATABASE_URL" -c "SELECT current_database(), current_user, version();"
```

---

## 6. CORS Y CERTIFICADOS

### 6.1 Problema Conocido: Headers CORS Duplicados

**Sintoma:**
```
Access to XMLHttpRequest has been blocked by CORS policy:
The 'Access-Control-Allow-Origin' header contains multiple values
```

**Causa:** Tanto Nginx como NestJS agregan headers CORS.

**Solucion:**

1. **NestJS maneja CORS** (en `main.ts`):
```typescript
app.enableCors({
  origin: process.env.CORS_ORIGIN?.split(','),
  credentials: true,
});
```

2. **Nginx NO agrega headers CORS** - Solo hace proxy:
```nginx
# CORRECTO - Sin headers CORS
location /api {
    proxy_pass http://localhost:3006;
    proxy_set_header Host $host;
    # ... otros headers de proxy ...
}

# INCORRECTO - Causa duplicados
location /api {
    add_header 'Access-Control-Allow-Origin' '*';  # NO HACER
    proxy_pass http://localhost:3006;
}
```

### 6.2 Configuracion CORS Correcta

Backend `.env.production`:
```bash
# Con dominio
CORS_ORIGIN=https://gamilit.com,https://www.gamilit.com

# Sin dominio (IP directa)
CORS_ORIGIN=https://74.208.126.102

# Durante transicion HTTP→HTTPS
CORS_ORIGIN=https://gamilit.com,http://gamilit.com,https://www.gamilit.com
```

### 6.3 Validacion de Certificados

```bash
# Verificar certificado desde el servidor
openssl s_client -connect gamilit.com:443 -servername gamilit.com </dev/null 2>/dev/null | openssl x509 -noout -dates

# Verificar desde cliente
curl -vI https://gamilit.com 2>&1 | grep -E "SSL|certificate|issuer"

# Verificar cadena completa
curl -vvv https://gamilit.com 2>&1 | grep -E "SSL certificate|subject:|issuer:"
```

### 6.4 Troubleshooting SSL/CORS

| Problema | Causa | Solucion |
|----------|-------|----------|
| ERR_CERT_AUTHORITY_INVALID | Certificado auto-firmado | Usar Let's Encrypt o agregar excepcion |
| Mixed Content | Frontend HTTPS llama backend HTTP | Asegurar VITE_API_PROTOCOL=https |
| CORS multiple values | Nginx y NestJS ambos agregan | Remover headers CORS de Nginx |
| WebSocket falla | WSS no configurado | Asegurar VITE_WS_PROTOCOL=wss |
| Certbot falla validacion | Puerto 80 cerrado | Abrir puerto 80 temporalmente |

---

## 7. PLAN DE CORRECCIONES

### 7.1 Fase 1: Scripts de Automatizacion (Prioridad ALTA)

**Crear:** `scripts/setup-ssl-certbot.sh`
```bash
#!/bin/bash
# Script para configurar SSL con Certbot automaticamente
# Uso: ./scripts/setup-ssl-certbot.sh <dominio>
```

**Contenido requerido:**
- Verificar prerequisitos (nginx, certbot)
- Crear configuracion Nginx inicial (HTTP)
- Ejecutar certbot
- Validar certificado
- Actualizar .env files
- Rebuild frontend
- Restart servicios

**Crear:** `scripts/validate-deployment.sh`
```bash
#!/bin/bash
# Validacion completa post-deployment
# Uso: ./scripts/validate-deployment.sh
```

**Verificaciones:**
- PM2 procesos activos
- Health endpoints (backend, frontend)
- Base de datos conectada
- Certificado SSL valido
- WebSocket funcional
- Sin errores en logs recientes

### 7.2 Fase 2: Documentacion (Prioridad MEDIA)

**Actualizar:** `docs/95-guias-desarrollo/GUIA-SSL-NGINX-PRODUCCION.md`
- Agregar seccion de troubleshooting
- Agregar procedimiento de rollback
- Agregar diagrama de arquitectura ASCII

**Crear:** `docs/95-guias-desarrollo/GUIA-DEPLOYMENT-RAPIDO.md`
- Checklist de 10 pasos
- Comandos copy-paste
- Valores por defecto

### 7.3 Fase 3: Mejoras Operacionales (Prioridad BAJA)

- Script de backup de certificados SSL
- Healthcheck para Nginx en PM2
- Alertas de expiracion de certificado

---

## 8. CHECKLIST DE VALIDACION

### 8.1 Pre-Deployment

```
[ ] Backup de .env.production (backend y frontend)
[ ] Backup de base de datos
[ ] Dominio apunta al servidor (si aplica)
[ ] Puertos 80 y 443 abiertos
[ ] PM2 instalado globalmente
[ ] Node.js >= 18.0.0
[ ] PostgreSQL corriendo
```

### 8.2 Configuracion SSL

```
[ ] Nginx instalado
[ ] Certbot instalado (si usa Let's Encrypt)
[ ] Certificado generado y valido
[ ] Nginx configurado como reverse proxy
[ ] NO hay headers CORS en Nginx
[ ] HTTP redirige a HTTPS
```

### 8.3 Variables de Entorno

Backend `.env.production`:
```
[ ] NODE_ENV=production
[ ] PORT=3006
[ ] DB_* configurados correctamente
[ ] JWT_SECRET generado (32+ chars)
[ ] SESSION_SECRET generado (32+ chars)
[ ] CORS_ORIGIN con dominio HTTPS
[ ] FRONTEND_URL con HTTPS
[ ] ENABLE_SWAGGER=false
```

Frontend `.env.production`:
```
[ ] VITE_ENV=production
[ ] VITE_API_PROTOCOL=https
[ ] VITE_WS_PROTOCOL=wss
[ ] VITE_API_HOST sin puerto si usa Nginx
[ ] VITE_MOCK_API=false
[ ] VITE_ENABLE_DEBUG=false
```

### 8.4 Post-Deployment

```
[ ] pm2 list muestra procesos online
[ ] curl http://localhost:3006/api/health → 200
[ ] curl http://localhost:3005 → 200
[ ] curl https://DOMINIO/api/v1/health → 200
[ ] curl https://DOMINIO → 200
[ ] Base de datos con datos esperados
[ ] No errores en pm2 logs (ultimos 50 lines)
[ ] WebSocket conecta correctamente
[ ] Login funciona sin errores CORS
```

---

## ANEXO A: COMANDOS RAPIDOS

```bash
# === DEPLOYMENT COMPLETO ===
git pull origin main
cp /backup/.env.production apps/backend/
cp /backup/.env.production apps/frontend/
npm install
cd apps/backend && npm install && npm run build && cd ../..
cd apps/frontend && npm install && npm run build && cd ../..
cd apps/database && ./drop-and-recreate-database.sh "$DATABASE_URL" && cd ..
pm2 delete all; pm2 start ecosystem.config.js --env production; pm2 save

# === SOLO RESTART ===
pm2 restart all

# === SOLO REBUILD FRONTEND (cambio .env) ===
cd apps/frontend && npm run build && cd ../..
pm2 restart gamilit-frontend

# === VER LOGS ===
pm2 logs --lines 50

# === SSL STATUS ===
sudo certbot certificates
curl -I https://gamilit.com
```

---

## ANEXO B: ESTRUCTURA DE ARCHIVOS FINAL

```
gamilit/
├── apps/
│   ├── backend/
│   │   ├── .env.production          # CONFIGURAR
│   │   ├── dist/                    # BUILD
│   │   └── package.json
│   ├── frontend/
│   │   ├── .env.production          # CONFIGURAR
│   │   ├── dist/                    # BUILD
│   │   └── package.json
│   └── database/
│       ├── drop-and-recreate-database.sh
│       ├── create-database.sh
│       ├── ddl/
│       └── seeds/
├── scripts/
│   ├── deploy-production.sh         # USAR
│   ├── build-production.sh          # USAR
│   ├── setup-ssl-certbot.sh         # CREAR
│   └── validate-deployment.sh       # CREAR
├── ecosystem.config.js              # PM2 CONFIG
├── logs/                            # LOGS PM2
└── docs/95-guias-desarrollo/
    ├── GUIA-SSL-NGINX-PRODUCCION.md
    ├── GUIA-CORS-PRODUCCION.md
    └── GUIA-DEPLOYMENT-RAPIDO.md    # CREAR
```

---

**FIN DEL REPORTE**

---

**Generado por:** Requirements Analyst (SIMCO)
**Fecha:** 2025-12-18
**Siguiente Accion:** Revisar gaps y aprobar plan de correcciones
