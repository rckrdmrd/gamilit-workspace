# DEPLOYMENT-MASTER.md - Guia Consolidada de Deployment GAMILIT

**Version:** 1.0.0
**Fecha:** 2026-02-03
**Consolidado desde:** 8 documentos previos
**Servidor Produccion:** 74.208.126.102

---

## INDICE

1. [Quick Start (5 minutos)](#1-quick-start-5-minutos)
2. [Informacion del Servidor](#2-informacion-del-servidor)
3. [Guia Completa de Deployment](#3-guia-completa-de-deployment)
4. [Configuracion SSL/Certbot](#4-configuracion-sslcertbot)
5. [Instrucciones para Agentes de IA](#5-instrucciones-para-agentes-de-ia)
6. [Referencia de Produccion](#6-referencia-de-produccion)
7. [Troubleshooting](#7-troubleshooting)
8. [Apendices](#8-apendices)

---

## 1. QUICK START (5 MINUTOS)

### Checklist Rapido (10 Pasos)

```bash
# 1. BACKUP (SIEMPRE PRIMERO)
BACKUP_DIR="/home/gamilit/backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR/config"
cp apps/backend/.env.production "$BACKUP_DIR/config/"
cp apps/frontend/.env.production "$BACKUP_DIR/config/"

# 2. BACKUP BASE DE DATOS
pg_dump "$DATABASE_URL" | gzip > "$BACKUP_DIR/gamilit.sql.gz"

# 3. PULL CAMBIOS
git fetch origin && git reset --hard origin/master

# 4. RESTAURAR CONFIG
cp "$BACKUP_DIR/config/backend.env.production" apps/backend/.env.production
cp "$BACKUP_DIR/config/frontend.env.production" apps/frontend/.env.production

# 5. INSTALAR DEPENDENCIAS
cd apps/backend && npm install && cd ../frontend && npm install && cd ../..

# 6. BUILD
cd apps/backend && npm run build && cd ../frontend && npm run build && cd ../..

# 7. RECREAR BASE DE DATOS (si hay cambios DDL)
cd apps/database && ./drop-and-recreate-database.sh "$DATABASE_URL" && cd ..

# 8. DEPLOY PM2
pm2 delete all 2>/dev/null; pm2 start ecosystem.config.js --env production; pm2 save

# 9. VALIDAR
./scripts/validate-deployment.sh --ssl

# 10. STARTUP (solo primera vez)
pm2 startup && pm2 save
```

### Escenarios Comunes

| Escenario | Comandos |
|-----------|----------|
| Solo actualizar codigo (sin cambios BD) | `git pull && cd apps/backend && npm install && npm run build && cd ../frontend && npm install && npm run build && cd ../.. && pm2 restart all` |
| Solo frontend | `git pull && cd apps/frontend && npm install && npm run build && cd .. && pm2 restart gamilit-frontend` |
| Solo backend | `git pull && cd apps/backend && npm install && npm run build && cd .. && pm2 restart gamilit-backend` |
| Cambios en .env | Editar archivo, rebuild frontend si cambian VITE_*, `pm2 restart all` |

### Comandos de Emergencia

```bash
# Rollback rapido
pg_restore "$BACKUP_DIR/gamilit.sql.gz" | psql "$DATABASE_URL"
cp "$BACKUP_DIR/config/backend.env.production" apps/backend/.env.production
cp "$BACKUP_DIR/config/frontend.env.production" apps/frontend/.env.production
pm2 restart all

# Ver logs de errores
pm2 logs --err --lines 100

# Restart de emergencia
pm2 kill && pm2 start ecosystem.config.js --env production

# Status completo
pm2 list && pm2 logs --lines 10 --nostream
```

---

## 2. INFORMACION DEL SERVIDOR

### Configuracion de Produccion

| Aspecto | Valor |
|---------|-------|
| **IP** | 74.208.126.102 |
| **OS** | Linux (Ubuntu 20.04+) |
| **Usuario** | isem / gamilit |
| **Node.js** | v18+ |
| **PM2** | Instalado globalmente |
| **PostgreSQL** | 16+ |

### Servicios Desplegados

| Servicio | Puerto | Instancias | Modo |
|----------|--------|------------|------|
| Backend API | 3006 | 2 | cluster |
| Frontend | 3005 | 1 | fork |
| PostgreSQL | 5432 | 1 | standalone |
| Nginx | 80/443 | 1 | reverse proxy |

### URLs de Acceso

| Servicio | URL HTTP | URL HTTPS |
|----------|----------|-----------|
| Frontend | http://74.208.126.102:3005 | https://gamilit.com |
| Backend API | http://74.208.126.102:3006/api | https://gamilit.com/api |
| API Docs | http://74.208.126.102:3006/api/docs | https://gamilit.com/api/docs |
| Health Check | http://74.208.126.102:3006/api/health | https://gamilit.com/api/health |
| WebSocket | ws://74.208.126.102:3006 | wss://gamilit.com/socket.io |

---

## 3. GUIA COMPLETA DE DEPLOYMENT

### 3.1 Prerequisitos

#### Requisitos del Sistema

```bash
# Verificar Node.js (v18+)
node --version

# Verificar npm (v9+)
npm --version

# Verificar PM2
pm2 -v

# Verificar PostgreSQL
psql --version

# Verificar Nginx (si aplica SSL)
nginx -v
```

#### Variables de Entorno Requeridas

```bash
# Database
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=gamilit_platform
export DB_USER=gamilit_user
export DB_PASSWORD="[PASSWORD_SEGURO]"
export DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

# Seguridad
export JWT_SECRET="[openssl rand -base64 32]"
export SESSION_SECRET="[openssl rand -base64 32]"

# CORS
export CORS_ORIGIN="https://gamilit.com,https://www.gamilit.com"

# URLs
export FRONTEND_URL="https://gamilit.com"
export BACKEND_URL="https://gamilit.com/api"

# Backups
export BACKUP_BASE="/home/gamilit/backups"
```

### 3.2 Proceso de Deployment Completo

#### FASE 1: Backup

```bash
# Crear timestamp y directorio
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${BACKUP_BASE:-/home/gamilit/backups}/$TIMESTAMP"
mkdir -p "$BACKUP_DIR"/{database,config,logs}

# Backup de base de datos
PGPASSWORD="$DB_PASSWORD" pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --format=plain \
    --no-owner \
    --no-acl \
    | gzip > "$BACKUP_DIR/database/gamilit_$TIMESTAMP.sql.gz"

# Backup de configuraciones
cp apps/backend/.env.production "$BACKUP_DIR/config/backend.env.production" 2>/dev/null || true
cp apps/frontend/.env.production "$BACKUP_DIR/config/frontend.env.production" 2>/dev/null || true
cp ecosystem.config.js "$BACKUP_DIR/config/" 2>/dev/null || true

# Backup de logs
cp logs/*.log "$BACKUP_DIR/logs/" 2>/dev/null || true

# Actualizar symlink 'latest'
ln -sfn "$BACKUP_DIR" "${BACKUP_BASE:-/home/gamilit/backups}/latest"
```

#### FASE 2: Detener Servicios

```bash
pm2 stop all
pm2 list
```

#### FASE 3: Actualizar Codigo

```bash
# Fetch y mostrar commits pendientes
git fetch origin
git log HEAD..origin/master --oneline 2>/dev/null || echo "Ya actualizado"

# Pull forzado
git reset --hard origin/master

# Mostrar ultimo commit
git log --oneline -1
```

#### FASE 4: Restaurar Configuraciones

```bash
# Restaurar .env files desde backup
cp "$BACKUP_DIR/config/backend.env.production" apps/backend/.env.production
cp "$BACKUP_DIR/config/frontend.env.production" apps/frontend/.env.production

# Crear symlinks .env -> .env.production
cd apps/backend && ln -sf .env.production .env && cd ../..
cd apps/frontend && ln -sf .env.production .env && cd ../..
```

#### FASE 5: Recrear Base de Datos (si aplica)

```bash
cd apps/database
chmod +x create-database.sh
./create-database.sh
cd ../..
```

#### FASE 6: Build

```bash
# Backend
cd apps/backend
npm install --production=false
npm run build
cd ../..

# Frontend
cd apps/frontend
npm install --production=false
npm run build
cd ../..
```

#### FASE 7: Iniciar Servicios

```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 list
```

#### FASE 8: Validacion

```bash
# Health check backend
curl -s http://localhost:3006/api/health | head -10

# Health check frontend
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:3005

# PM2 status
pm2 list

# Logs recientes
pm2 logs --lines 10 --nostream
```

### 3.3 Configuracion PM2

#### ecosystem.config.js

```javascript
module.exports = {
  apps: [
    {
      name: 'gamilit-backend',
      script: 'dist/main.js',
      cwd: './apps/backend',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3006
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'gamilit-frontend',
      script: 'npx',
      args: 'serve -s dist -l 3005',
      cwd: './apps/frontend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      autorestart: true,
      watch: false
    }
  ]
};
```

#### Comandos PM2

```bash
# Gestion basica
pm2 status              # Ver estado
pm2 logs                # Ver logs (todos)
pm2 logs gamilit-backend  # Ver logs backend
pm2 monit               # Monitor interactivo

# Reiniciar
pm2 restart all         # Reiniciar todos
pm2 reload gamilit-backend  # Zero-downtime (cluster)
pm2 restart gamilit-frontend

# Detener/Eliminar
pm2 stop all
pm2 delete all

# Persistencia
pm2 save                # Guardar config
pm2 resurrect           # Restaurar
pm2 startup             # Auto-inicio en boot
```

### 3.4 Variables de Entorno

#### Backend `.env.production`

```bash
NODE_ENV=production
PORT=3006
HOST=0.0.0.0

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gamilit_platform
DB_USER=gamilit_user
DB_PASSWORD=<PASSWORD>
DB_SSL=false
DB_LOGGING=false

# JWT
JWT_SECRET=<openssl rand -base64 32>
JWT_EXPIRES_IN=24h

# CORS (HTTPS)
CORS_ORIGIN=https://gamilit.com,https://www.gamilit.com
FRONTEND_URL=https://gamilit.com

# Email (SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM=noreply@gamilit.com

# Web Push (VAPID)
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:admin@gamilit.com

# Swagger
ENABLE_SWAGGER=false

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=info
```

#### Frontend `.env.production`

```bash
VITE_ENV=production
VITE_API_HOST=gamilit.com
VITE_API_PROTOCOL=https
VITE_API_URL=https://gamilit.com/api
VITE_WS_HOST=gamilit.com
VITE_WS_PROTOCOL=wss
VITE_WS_URL=wss://gamilit.com
VITE_APP_NAME=GAMILIT
VITE_APP_VERSION=2.0.0
VITE_MOCK_API=false
VITE_ENABLE_DEBUG=false
```

---

## 4. CONFIGURACION SSL/CERTBOT

### 4.1 Arquitectura SSL

```
                    Internet
                       |
                       v
              +------------------+
              |  Puerto 80/443   |
              |     (Nginx)      |
              +--------+---------+
                       |
        +--------------+---------------+
        |              |               |
        v              v               v
   /api/*         /socket.io       /*
        |              |               |
        v              v               v
+------------+  +------------+  +------------+
|  Backend   |  | WebSocket  |  | Frontend   |
|   :3006    |  |   :3006    |  |   :3005    |
+------------+  +------------+  +------------+
```

### 4.2 Instalacion Rapida

#### Opcion A: Con Dominio Real (Let's Encrypt)

```bash
# Hacer script ejecutable
chmod +x scripts/setup-ssl-certbot.sh

# Ejecutar con dominio
sudo ./scripts/setup-ssl-certbot.sh gamilit.com

# Para multiples dominios
sudo ./scripts/setup-ssl-certbot.sh gamilit.com www.gamilit.com
```

#### Opcion B: Sin Dominio (Auto-firmado)

```bash
chmod +x scripts/setup-ssl-certbot.sh
sudo ./scripts/setup-ssl-certbot.sh --self-signed
```

### 4.3 Configuracion Manual de Nginx

#### Instalar Nginx y Certbot

```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx
```

#### Configuracion Nginx

Crear `/etc/nginx/sites-available/gamilit`:

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

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/gamilit.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/gamilit.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

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

    # Cache de assets estaticos
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Habilitar Sitio

```bash
sudo ln -sf /etc/nginx/sites-available/gamilit /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### Obtener Certificado

```bash
sudo certbot --nginx -d gamilit.com -d www.gamilit.com

# Verificar renovacion automatica
sudo certbot renew --dry-run
```

### 4.4 Renovacion SSL

```bash
# Verificar timer de renovacion
sudo systemctl status certbot.timer

# Ver certificados
sudo certbot certificates

# Renovacion manual
sudo certbot renew

# Renovacion forzada
sudo certbot renew --force-renewal
```

### 4.5 Validacion SSL

```bash
# Frontend HTTPS
curl -I https://gamilit.com

# API HTTPS
curl https://gamilit.com/api/health

# Redirect HTTP->HTTPS
curl -I http://gamilit.com

# Verificar certificado
echo | openssl s_client -connect gamilit.com:443 2>/dev/null | openssl x509 -noout -dates
```

---

## 5. INSTRUCCIONES PARA AGENTES DE IA

### 5.1 Prompt Basico para Deployment

```
Ejecuta el deployment de GAMILIT siguiendo el procedimiento:

1. Backup BD y configs a /home/gamilit/backups/TIMESTAMP/
2. pm2 stop all
3. git reset --hard origin/master
4. Restaurar configs desde backup
5. Recrear BD (si hay cambios DDL)
6. Build backend y frontend
7. pm2 start ecosystem.config.js --env production
8. Validar endpoints

Ejecuta paso a paso mostrando outputs.
```

### 5.2 Estructura de Backups

```
/home/gamilit/backups/
+-- YYYYMMDD_HHMMSS/
|   +-- database/
|   |   +-- gamilit_YYYYMMDD_HHMMSS.sql.gz
|   +-- config/
|   |   +-- backend.env.production
|   |   +-- frontend.env.production
|   |   +-- ecosystem.config.js
|   +-- logs/
|       +-- backend-error.log
|       +-- backend-out.log
+-- latest -> YYYYMMDD_HHMMSS/
```

### 5.3 Valores Esperados Post-Deployment

```sql
-- Verificar datos cargados
SELECT 'tenants' as tabla, COUNT(*) as total FROM auth_management.tenants
UNION ALL SELECT 'users', COUNT(*) FROM auth.users
UNION ALL SELECT 'modules', COUNT(*) FROM educational_content.modules
UNION ALL SELECT 'maya_ranks', COUNT(*) FROM gamification_system.maya_ranks
UNION ALL SELECT 'feature_flags', COUNT(*) FROM system_configuration.feature_flags;
```

| Tabla | Minimo Esperado |
|-------|-----------------|
| tenants | 14+ |
| users | 20+ |
| modules | 5 |
| maya_ranks | 5 |
| feature_flags | 26+ |

### 5.4 Reporte de Errores

Si algo falla, reportar:
1. Numero de FASE donde fallo (1-8)
2. Comando exacto que fallo
3. Mensaje de error completo
4. Output de: `pm2 list` y `pm2 logs --lines 50 --nostream`

---

## 6. REFERENCIA DE PRODUCCION

### 6.1 Estructura del Proyecto

```
/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/
+-- apps/
|   +-- backend/          # NestJS API (puerto 3006, 2 instancias PM2)
|   +-- frontend/         # React App (puerto 3005, 1 instancia PM2)
|   +-- database/         # DDL, Seeds, Scripts
+-- scripts/              # Scripts de produccion
+-- ecosystem.config.js   # Configuracion PM2
+-- logs/                 # Logs de aplicacion
```

### 6.2 Scripts Disponibles

| Script | Ubicacion | Proposito |
|--------|-----------|-----------|
| drop-and-recreate-database.sh | apps/database/ | Recrear BD completa |
| create-database.sh | apps/database/ | Solo DDL + Seeds |
| init-database.sh | apps/database/scripts/ | Crear usuario + BD |
| build-production.sh | scripts/ | Solo build |
| deploy-production.sh | scripts/ | Solo deploy PM2 |
| pre-deploy-check.sh | scripts/ | Validacion pre-deploy |
| diagnose-production.sh | scripts/ | Diagnostico del sistema |
| setup-ssl-certbot.sh | scripts/ | Configurar SSL |
| validate-deployment.sh | scripts/ | Validar deployment |

### 6.3 Database Migrations

```bash
cd apps/backend

# Crear migracion
npm run migration:create -- -n MigrationName

# Ejecutar migraciones
npm run migration:run

# Revertir
npm run migration:revert

# Mostrar
npm run migration:show
```

### 6.4 Backup y Recovery

#### Backup Automatizado

```bash
#!/bin/bash
# scripts/backup-database.sh

BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="gamilit_platform"
DB_USER="gamilit_user"

# Crear backup
pg_dump -U $DB_USER -d $DB_NAME -F c -f $BACKUP_DIR/gamilit_$DATE.dump

# Mantener solo ultimos 7 dias
find $BACKUP_DIR -name "gamilit_*.dump" -mtime +7 -delete
```

#### Cron para Backup Diario

```bash
crontab -e
# Agregar:
0 2 * * * /path/to/scripts/backup-database.sh
```

#### Restaurar Base de Datos

```bash
# Desde formato custom
pg_restore -U gamilit_user -d gamilit_platform -c backups/gamilit_20251212.dump

# Desde SQL comprimido
gunzip -c backups/gamilit_20251212.sql.gz | psql -U gamilit_user -d gamilit_platform
```

### 6.5 Rollback Completo

```bash
# 1. Detener servicios
pm2 stop all

# 2. Restaurar codigo
git checkout <previous-commit-hash>

# 3. Restaurar BD
gunzip -c "$BACKUP_DIR/database/gamilit_*.sql.gz" | psql "$DATABASE_URL"

# 4. Restaurar configs
cp "$BACKUP_DIR/config/backend.env.production" apps/backend/.env.production
cp "$BACKUP_DIR/config/frontend.env.production" apps/frontend/.env.production

# 5. Rebuild
cd apps/backend && npm run build && cd ../..
cd apps/frontend && npm run build && cd ../..

# 6. Revertir migracion (si aplica)
cd apps/backend && npm run migration:revert && cd ../..

# 7. Reiniciar
pm2 start ecosystem.config.js --env production
```

---

## 7. TROUBLESHOOTING

### 7.1 Problemas Comunes y Soluciones

| Problema | Diagnostico | Solucion |
|----------|-------------|----------|
| PM2 no inicia | `pm2 logs --err` | `pm2 kill && pm2 start ecosystem.config.js --env production` |
| CORS error | `grep CORS apps/backend/.env.production` | Actualizar CORS_ORIGIN y reiniciar |
| SSL no funciona | `sudo nginx -t` | `sudo systemctl restart nginx` |
| BD no conecta | `psql "$DATABASE_URL" -c "SELECT 1"` | Verificar DB_PASSWORD y PostgreSQL |
| Build falla | Ver logs del build | `rm -rf node_modules && npm install` |
| Puerto ocupado | `sudo lsof -i :3006` | `kill -9 <PID>` |
| Proceso se reinicia | `pm2 show gamilit-backend` | Aumentar max_memory_restart |

### 7.2 Diagnostico del Backend

```bash
# Ver logs de errores
pm2 logs gamilit-backend --err --lines 50

# Verificar archivo .env
cat apps/backend/.env.production

# Verificar conectividad BD
PGPASSWORD="$DB_PASSWORD" psql -h localhost -U gamilit_user -d gamilit_platform -c "SELECT 1"

# Verificar que el build existe
ls -la apps/backend/dist/main.js
```

### 7.3 Diagnostico del Frontend

```bash
# Ver logs
pm2 logs gamilit-frontend --lines 50

# Verificar build
ls -la apps/frontend/dist/

# Verificar API URL
cat apps/frontend/.env.production | grep VITE_API
```

### 7.4 Diagnostico de SSL

```bash
# Verificar sintaxis Nginx
sudo nginx -t

# Verificar status
sudo systemctl status nginx

# Verificar certificado
sudo certbot certificates

# Logs de Certbot
sudo tail -f /var/log/letsencrypt/letsencrypt.log

# Test HTTPS
curl -vk https://74.208.126.102/api/health
```

### 7.5 Diagnostico de Base de Datos

```bash
# Verificar PostgreSQL
sudo systemctl status postgresql

# Reiniciar PostgreSQL
sudo systemctl restart postgresql

# Verificar conexion
psql -U gamilit_user -d gamilit_platform -c "SELECT 1"

# Ver tablas
psql -U gamilit_user -d gamilit_platform -c "\dt auth_management.*"
```

### 7.6 Logs y Monitoreo

```bash
# Ubicacion de logs PM2
logs/
+-- backend-error.log
+-- backend-out.log
+-- frontend-error.log
+-- frontend-out.log

# Ver logs en tiempo real
pm2 logs --lines 100

# Monitor de recursos
pm2 monit

# Informacion de proceso
pm2 show gamilit-backend
```

---

## 8. APENDICES

### 8.1 Docker Deployment (Alternativo)

#### Dockerfile Backend

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3006
CMD ["node", "dist/main.js"]
```

#### Dockerfile Frontend

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3005
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: gamilit_platform
      POSTGRES_USER: gamilit_user
      POSTGRES_PASSWORD: your_secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build:
      context: ./apps/backend
    ports:
      - "3006:3006"
    environment:
      NODE_ENV: production
      DB_HOST: postgres
    depends_on:
      - postgres

  frontend:
    build:
      context: ./apps/frontend
    ports:
      - "3005:3005"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### 8.2 Checklist de Seguridad

- [ ] Cambiar passwords por defecto
- [ ] Habilitar firewall (ufw)
- [ ] Configurar SSL/TLS
- [ ] Mantener dependencias actualizadas
- [ ] Ejecutar auditorias (`npm audit`)
- [ ] Implementar rate limiting
- [ ] Usar variables de entorno para secrets
- [ ] Backups regulares de BD
- [ ] Monitorear logs por actividad sospechosa
- [ ] Deshabilitar login SSH como root
- [ ] Permisos restrictivos en archivos .env (`chmod 600`)

### 8.3 Checklist Pre-Deployment

- [ ] Codigo mergeado a rama `main`
- [ ] Tests pasando (`npm test`)
- [ ] Variables de entorno actualizadas
- [ ] Secrets de produccion configurados
- [ ] Pre-deploy check ejecutado
- [ ] Build exitoso
- [ ] Base de datos migrada (si aplica)
- [ ] CORS configurado correctamente

### 8.4 Checklist Post-Deployment

- [ ] Logs monitoreados
- [ ] Health check respondiendo
- [ ] Frontend cargando
- [ ] Backend API respondiendo
- [ ] HTTPS funcionando (si aplica)
- [ ] WebSocket funcionando

### 8.5 CI/CD Pipeline (Referencia)

```yaml
# .github/workflows/deploy.yml
name: Deploy Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to server
        run: |
          ssh user@74.208.126.102 'cd /path/to/gamilit && git pull && ./scripts/deploy-production.sh'
```

### 8.6 Performance Tuning

#### PM2 Cluster Mode

Backend ejecuta 2 instancias en cluster para mejor rendimiento y disponibilidad.

#### Database Optimization

```sql
-- Ejecutar mantenimiento
VACUUM ANALYZE;

-- Ver tamano de tablas
SELECT schemaname, tablename,
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

#### Log Rotation

```
# /etc/logrotate.d/gamilit
/path/to/gamilit/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0644 username username
}
```

---

## HISTORIAL DE VERSIONES

| Version | Fecha | Descripcion |
|---------|-------|-------------|
| 1.0.0 | 2026-02-03 | Consolidacion inicial de 8 documentos |

---

## DOCUMENTOS ARCHIVADOS

Los siguientes documentos han sido consolidados en este archivo y movidos a `_archived/`:

1. DEPLOYMENT.md
2. DEPLOYMENT-GUIDE.md
3. DIRECTIVA-DEPLOYMENT.md
4. GUIA-DEPLOYMENT-AGENTE-PRODUCCION.md
5. GUIA-DEPLOYMENT-RAPIDO.md
6. GUIA-SSL-CERTBOT-DEPLOYMENT.md
7. INSTRUCCIONES-DEPLOYMENT.md
8. REFERENCIA-DEPLOYMENT-PRODUCCION.md

---

**Responsable:** DevOps Team
**Soporte:** Ver seccion Troubleshooting o contactar equipo DevOps
