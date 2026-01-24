# Reporte de Análisis de Configuraciones de Producción - GAMILIT
**Fecha:** 2025-12-18
**Analista:** Architecture-Analyst
**Servidor Producción:** 74.208.126.102

---

## 1. RESUMEN EJECUTIVO

### Estado General
- **Archivos de configuración:** SINCRONIZADOS
- **Código fuente:** IDÉNTICOS
- **Scripts de producción:** SOLO EN WORKSPACE VIEJO
- **Dependencias:** LIGERAS DIFERENCIAS

### Hallazgos Principales
1. Los archivos `.env.production` están **IDÉNTICOS** en ambos workspaces
2. El código de configuración (main.ts, app.config.ts) está **SINCRONIZADO**
3. Scripts críticos de producción (`update-production.sh`, `diagnose-production.sh`) **NO EXISTEN** en workspace nuevo
4. Configuraciones CORS correctamente establecidas usando HTTP (no HTTPS)
5. Ligeras diferencias en versiones de dependencias entre workspaces

---

## 2. COMPARACIÓN DETALLADA DE ARCHIVOS

### 2.1 ecosystem.config.js
**Estado:** IDÉNTICOS ✅

Ambos workspaces tienen la misma configuración PM2:

```javascript
Backend:
- Puerto: 3006
- Instancias: 2 (cluster mode)
- Max memory: 1G
- Archivo: dist/main.js
- ENV file: .env.production

Frontend:
- Puerto: 3005
- Instancias: 1 (fork mode)
- Max memory: 512M
- Comando: npx vite preview --port 3005 --host 0.0.0.0
- ENV file: .env.production
```

**Nota:** La línea 138 tiene path del workspace VIEJO hardcodeado, debe actualizarse en deployment:
```javascript
path: '/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit'
```

---

### 2.2 Backend .env.production
**Estado:** IDÉNTICOS ✅

**Ubicación:**
- **Nuevo:** `/home/isem/workspace/projects/gamilit/apps/backend/.env.production`
- **Viejo:** `/home/isem/workspace-old/wsl-ubuntu/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/backend/.env.production`

**Configuración actual:**
```bash
# Server
NODE_ENV=production
PORT=3006
API_PREFIX=api

# Database
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-gamilit_platform}
DB_USER=${DB_USER:-gamilit_user}
DB_PASSWORD=${DB_PASSWORD}
DB_SYNCHRONIZE=false
DB_LOGGING=false

# JWT
JWT_SECRET=${JWT_SECRET:-CHANGE_THIS_IN_PRODUCTION}
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS - CONFIGURACIÓN CRÍTICA
CORS_ORIGIN=${CORS_ORIGIN:-http://74.208.126.102:3005,http://74.208.126.102,http://74.208.126.102:80}
ENABLE_CORS=true
ENABLE_SWAGGER=false

# Logging
LOG_LEVEL=warn
LOG_TO_FILE=true

# Frontend URL
FRONTEND_URL=${FRONTEND_URL:-http://74.208.126.102:3005}
```

**Advertencias:**
- ⚠️ JWT_SECRET tiene valor por defecto inseguro
- ⚠️ SESSION_SECRET tiene valor por defecto inseguro
- ⚠️ DB_PASSWORD debe configurarse vía variable de entorno del sistema

---

### 2.3 Frontend .env.production
**Estado:** IDÉNTICOS ✅

**Ubicación:**
- **Nuevo:** `/home/isem/workspace/projects/gamilit/apps/frontend/.env.production`
- **Viejo:** `/home/isem/workspace-old/wsl-ubuntu/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/frontend/.env.production`

**Configuración actual:**
```bash
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

# Feature Flags
VITE_ENABLE_GAMIFICATION=true
VITE_ENABLE_SOCIAL_FEATURES=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=false
VITE_ENABLE_STORYBOOK=false
VITE_MOCK_API=false

# Production
VITE_LOG_LEVEL=error
```

**Advertencias:**
- ⚠️ Configurado para HTTP (no HTTPS)
- ⚠️ WebSocket usando WS (no WSS)
- ⚠️ TODO: Cambiar a dominio cuando esté configurado DNS

---

### 2.4 Código de Configuración CORS

#### main.ts (Backend)
**Estado:** IDÉNTICOS ✅

Ambos workspaces implementan:
```typescript
// CORS configuration - Supports multiple origins separated by comma
const corsOrigin = configService.get<string>('app.corsOrigin') ||
  'http://localhost:3005,http://localhost:3006';
const allowedOrigins = corsOrigin.split(',').map(origin => origin.trim());

app.enableCors({
  origin: (origin: string | undefined, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id'],
});
```

**Características:**
- ✅ Soporta múltiples orígenes (separados por coma)
- ✅ Permite requests sin origin (móvil, Postman, server-to-server)
- ✅ Logging de bloqueos CORS
- ✅ Credentials habilitado
- ✅ Headers: Authorization, x-tenant-id

#### app.config.ts
**Estado:** IDÉNTICOS ✅

```typescript
// CORS Configuration
corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3005,http://localhost:3006'
```

---

## 3. COMPARACIÓN DE DEPENDENCIAS

### 3.1 package.json Root

#### Diferencias Workspace NUEVO tiene:
```json
"devDependencies": {
  "@commitlint/cli": "^18.4.3",
  "@commitlint/config-conventional": "^18.4.3",
  "@types/web-push": "^3.6.4",
  "lint-staged": "^15.2.0"
}

"overrides": {
  "jws": "^4.0.1",
  "js-yaml": "^4.1.1",
  "glob": "^11.0.0",
  "validator": "^13.15.22"
}
```

**Impacto:** Mejoras en seguridad y validaciones (workspace NUEVO más actualizado)

---

### 3.2 Backend package.json

#### Workspace NUEVO tiene versiones más recientes:
```json
"@nestjs/terminus": "^11.0.0" (vs ^10.2.0 en viejo)
"@nestjs/throttler": "^6.0.0" (vs ^5.0.1 en viejo)
"cache-manager": "^6.0.0" (vs ^5.2.4 en viejo)
"dotenv": "^16.4.7" (vs ^16.3.1 en viejo)
"express-rate-limit": "^7.5.0" (vs ^7.1.5 en viejo)
"helmet": "^8.1.0" (vs ^7.1.0 en viejo)
"typeorm": "^0.3.22" (vs ^0.3.17 en viejo)

# Nuevas dependencias:
"@types/nodemailer": "^7.0.4"
"nodemailer": "^7.0.11"
"web-push": "^3.6.7"
```

#### Workspace NUEVO tiene scripts adicionales:
```json
"generate:vapid": "node scripts/generate-vapid-keys.js"
```

**Impacto:** Workspace NUEVO tiene mejoras de seguridad y funcionalidades nuevas (push notifications, email)

---

### 3.3 Frontend package.json

#### Workspace NUEVO tiene dependencias adicionales:
```json
"@dnd-kit/core": "^6.3.1",
"@dnd-kit/sortable": "^10.0.0",
"@dnd-kit/utilities": "^3.2.2",
"date-fns": "^4.1.0",
"firebase": "^12.6.0"
```

#### Workspace NUEVO tiene versiones más recientes de ESLint:
```json
"@eslint/js": "^9.17.0",
"typescript-eslint": "^8.18.0",
"eslint": "^9.17.0"
```

#### Workspace VIEJO tiene Storybook v7, NUEVO tiene v10+:
```json
# NUEVO
"@storybook/react-vite": "^10.1.4",
"storybook": "^10.1.4"

# VIEJO
"@storybook/react-vite": "^7.6.5",
"storybook": "^7.6.20"
```

**Impacto:** Workspace NUEVO tiene funcionalidades adicionales y mejores herramientas de desarrollo

---

## 4. SCRIPTS DE PRODUCCIÓN

### 4.1 update-production.sh
**Estado:** SOLO EXISTE EN WORKSPACE VIEJO ❌

**Ubicación:** `/home/isem/workspace-old/.../scripts/update-production.sh`

**Funcionalidad:**
1. Detiene servicios PM2
2. Respalda configuraciones (.env files)
3. Respalda base de datos completa (pg_dump)
4. Pull del repositorio (preferencia a remoto: `git reset --hard origin/main`)
5. Restaura configuraciones
6. Recrea base de datos limpia
7. Instala dependencias (backend y frontend)
8. Build de aplicaciones
9. Inicia servicios con PM2
10. Valida deployment

**Variables requeridas:**
```bash
DB_PASSWORD - Password de la base de datos
BACKUP_BASE - Directorio de backups (default: /home/gamilit/backups)
DB_NAME - Nombre de BD (default: gamilit_platform)
DB_USER - Usuario BD (default: gamilit_user)
DB_HOST - Host BD (default: localhost)
DB_PORT - Puerto BD (default: 5432)
```

**Características:**
- ✅ Backups automáticos con timestamp
- ✅ Reset duro a origin/main (no merge conflicts)
- ✅ Recrea BD limpia desde DDL/seeds
- ✅ Validación post-deployment
- ✅ Logs detallados con colores

---

### 4.2 diagnose-production.sh
**Estado:** SOLO EXISTE EN WORKSPACE VIEJO ❌

**Ubicación:** `/home/isem/workspace-old/.../scripts/diagnose-production.sh`

**Funcionalidad:**
1. Estado de PM2 (procesos activos)
2. Health check backend (/api/health)
3. Health check frontend (HTTP status)
4. Conexión a base de datos
5. Validación de tablas críticas (tenants, users, modules, etc.)
6. Validación de tenant principal (gamilit-prod)
7. Espacio en disco
8. Uso de memoria
9. Puertos en uso (3005, 3006, 5432)

**Variables requeridas:**
```bash
DATABASE_URL - URL completa de PostgreSQL
BACKEND_URL - URL del backend (default: http://localhost:3006)
FRONTEND_URL - URL del frontend (default: http://localhost:3005)
```

**Validaciones críticas:**
```bash
# Tablas críticas con conteo mínimo esperado
- auth_management.tenants (min: 1)
- auth.users (min: 1)
- auth_management.profiles (min: 1)
- educational_content.modules (min: 5)
- educational_content.exercises (min: 20)
- gamification_system.maya_ranks (min: 5)
- gamification_system.achievements (min: 25)
- system_configuration.feature_flags (min: 20)

# Validación CRÍTICA
- Tenant 'gamilit-prod' debe existir y estar activo
```

---

### 4.3 Scripts en Workspace NUEVO

El workspace NUEVO NO tiene scripts de producción en `/scripts/`, pero tiene scripts de testing/desarrollo en:
```
/apps/backend/scripts/
/apps/database/scripts/
/apps/devops/scripts/
/apps/frontend/scripts/
```

**Impacto:** Es necesario copiar los scripts de producción al workspace NUEVO antes de deployment.

---

## 5. CONFIGURACIÓN HTTPS/SSL

### Estado Actual: SIN SSL ⚠️

**Backend:**
```bash
# .env.production
CORS_ORIGIN=http://74.208.126.102:3005,http://74.208.126.102,http://74.208.126.102:80
FRONTEND_URL=http://74.208.126.102:3005
```

**Frontend:**
```bash
# .env.production
VITE_API_PROTOCOL=http
VITE_WS_PROTOCOL=ws
VITE_API_HOST=74.208.126.102:3006
```

**Comentarios en archivos:**
```
# IMPORTANTE: Servidor NO tiene SSL configurado actualmente
# Cambiar a https/wss cuando se configure certificado SSL
```

### Pasos para Migrar a HTTPS:

#### 1. Instalar certificado SSL (Let's Encrypt recomendado)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d gamilit.com -d www.gamilit.com
```

#### 2. Actualizar .env.production Backend:
```bash
CORS_ORIGIN=https://gamilit.com,https://www.gamilit.com,https://74.208.126.102
FRONTEND_URL=https://gamilit.com
```

#### 3. Actualizar .env.production Frontend:
```bash
VITE_API_PROTOCOL=https
VITE_WS_PROTOCOL=wss
VITE_API_HOST=gamilit.com  # o api.gamilit.com si se usa subdominio
```

#### 4. Configurar Nginx como reverse proxy:
```nginx
server {
    listen 443 ssl http2;
    server_name gamilit.com www.gamilit.com;

    ssl_certificate /etc/letsencrypt/live/gamilit.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/gamilit.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
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
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name gamilit.com www.gamilit.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 6. ANÁLISIS DE COMPATIBILIDAD DE SCRIPTS

### 6.1 update-production.sh - Compatibilidad

**Requisitos previos para usar en workspace NUEVO:**

1. **Copiar script al workspace NUEVO:**
```bash
mkdir -p /home/isem/workspace/projects/gamilit/scripts
cp /home/isem/workspace-old/wsl-ubuntu/workspace/workspace-gamilit/gamilit/projects/gamilit/scripts/update-production.sh \
   /home/isem/workspace/projects/gamilit/scripts/
chmod +x /home/isem/workspace/projects/gamilit/scripts/update-production.sh
```

2. **Verificar compatibilidad:**
   - ✅ El script es independiente del path del proyecto (usa detección automática)
   - ✅ Usa variables de entorno para configuración
   - ✅ Compatible con estructura de directorios actual
   - ✅ No tiene hardcoded paths (excepto backups)

3. **Configuraciones a verificar antes de ejecutar:**
```bash
# En servidor de producción
export DB_PASSWORD="tu_password_real"
export BACKUP_BASE="/home/isem/backups"  # Crear este directorio si no existe
```

4. **Ajustes recomendados:**
   - Crear directorio de backups: `mkdir -p /home/isem/backups`
   - Verificar que PostgreSQL esté instalado y corriendo
   - Verificar que PM2 esté instalado globalmente
   - Verificar conectividad a GitHub

---

### 6.2 diagnose-production.sh - Compatibilidad

**Requisitos previos para usar en workspace NUEVO:**

1. **Copiar script:**
```bash
cp /home/isem/workspace-old/wsl-ubuntu/workspace/workspace-gamilit/gamilit/projects/gamilit/scripts/diagnose-production.sh \
   /home/isem/workspace/projects/gamilit/scripts/
chmod +x /home/isem/workspace/projects/gamilit/scripts/diagnose-production.sh
```

2. **Verificar compatibilidad:**
   - ✅ Script completamente portable
   - ✅ Usa variables de entorno
   - ✅ No tiene dependencias de paths específicos
   - ✅ Compatible con estructura de BD actual

3. **Configuración antes de ejecutar:**
```bash
# En servidor de producción
export DATABASE_URL="postgresql://gamilit_user:PASSWORD@localhost:5432/gamilit_platform"
export BACKEND_URL="http://74.208.126.102:3006"
export FRONTEND_URL="http://74.208.126.102:3005"
```

---

## 7. RECOMENDACIONES DE SINCRONIZACIÓN

### 7.1 Acciones CRÍTICAS antes de Deployment

#### 1. Copiar scripts de producción ⚠️ CRÍTICO
```bash
# En workspace NUEVO
cd /home/isem/workspace/projects/gamilit
mkdir -p scripts

# Copiar desde workspace VIEJO
cp /home/isem/workspace-old/wsl-ubuntu/workspace/workspace-gamilit/gamilit/projects/gamilit/scripts/update-production.sh scripts/
cp /home/isem/workspace-old/wsl-ubuntu/workspace/workspace-gamilit/gamilit/projects/gamilit/scripts/diagnose-production.sh scripts/

chmod +x scripts/*.sh
```

#### 2. Actualizar ecosystem.config.js
```javascript
// Línea 138, cambiar:
path: '/home/isem/workspace/projects/gamilit',  // Path correcto workspace NUEVO
```

#### 3. Generar secretos seguros para producción
```bash
# Generar JWT_SECRET
openssl rand -base64 32

# Generar SESSION_SECRET
openssl rand -base64 32

# Actualizar en servidor de producción:
export JWT_SECRET="valor_generado_1"
export SESSION_SECRET="valor_generado_2"
export DB_PASSWORD="tu_password_real"
```

#### 4. Verificar configuraciones CORS en servidor
```bash
# En servidor 74.208.126.102
# Verificar que CORS_ORIGIN incluya todas las URLs necesarias
export CORS_ORIGIN="http://74.208.126.102:3005,http://74.208.126.102,http://74.208.126.102:80"
```

#### 5. Crear directorio de backups
```bash
# En servidor de producción
mkdir -p /home/isem/backups
chmod 700 /home/isem/backups
```

---

### 7.2 Acciones RECOMENDADAS (No bloqueantes)

#### 1. Configurar HTTPS/SSL
- Instalar certificado SSL (Let's Encrypt)
- Configurar Nginx como reverse proxy
- Actualizar .env.production con URLs https://

#### 2. Configurar DNS
- Apuntar dominio gamilit.com a 74.208.126.102
- Actualizar configuraciones para usar dominio en lugar de IP

#### 3. Configurar servicios externos
```bash
# En .env.production
VITE_GOOGLE_ANALYTICS_ID=tu_id_aqui
VITE_SENTRY_DSN=tu_dsn_aqui
```

#### 4. Verificar backups automáticos
- Configurar cron job para backups periódicos
- Configurar retención de backups (eliminar antiguos)

---

### 7.3 Checklist Pre-Deployment

```bash
# En workspace NUEVO (desarrollo)
[ ] Scripts de producción copiados
[ ] ecosystem.config.js actualizado con path correcto
[ ] .env.production verificado (backend y frontend)
[ ] Dependencias instaladas (npm install en root, backend, frontend)
[ ] Build exitoso (npm run build en backend y frontend)

# En servidor de producción (74.208.126.102)
[ ] PM2 instalado globalmente
[ ] PostgreSQL corriendo
[ ] Base de datos gamilit_platform existe
[ ] Usuario gamilit_user existe con permisos
[ ] Variables de entorno configuradas (DB_PASSWORD, JWT_SECRET, SESSION_SECRET)
[ ] Directorio /home/isem/backups existe
[ ] Puerto 3005 disponible (frontend)
[ ] Puerto 3006 disponible (backend)
[ ] Puerto 5432 disponible (PostgreSQL)
[ ] Git configurado con acceso al repositorio
```

---

## 8. ADVERTENCIAS Y RIESGOS

### 8.1 Riesgos de Seguridad ⚠️ ALTO

1. **Secretos con valores por defecto**
   - JWT_SECRET tiene valor "CHANGE_THIS_IN_PRODUCTION"
   - SESSION_SECRET tiene valor "session-secret-change-in-production"
   - **ACCIÓN:** Generar y configurar valores únicos antes de deployment

2. **Sin HTTPS configurado**
   - Todas las comunicaciones en texto plano
   - Credenciales, tokens y datos sensibles sin cifrar en tránsito
   - **ACCIÓN:** Configurar SSL/TLS lo antes posible

3. **Uso de IP pública hardcodeada**
   - Configuraciones apuntan a IP 74.208.126.102
   - Sin DNS configurado
   - **ACCIÓN:** Configurar dominio con DNS

### 8.2 Riesgos Operacionales ⚠️ MEDIO

1. **Scripts de producción no copiados**
   - Workspace NUEVO no tiene scripts críticos
   - **ACCIÓN:** Copiar scripts antes de usar workspace NUEVO en producción

2. **Diferencias en dependencias**
   - Workspace NUEVO tiene versiones más recientes
   - Potenciales incompatibilidades o cambios de comportamiento
   - **ACCIÓN:** Testing exhaustivo antes de deployment

3. **Path hardcodeado en ecosystem.config.js**
   - Línea 138 tiene path del workspace VIEJO
   - **ACCIÓN:** Actualizar antes de deployment

### 8.3 Riesgos de Disponibilidad ⚠️ BAJO

1. **update-production.sh hace reset --hard**
   - Pierde cambios locales no commiteados
   - **MITIGACIÓN:** Script hace backups automáticos

2. **Recrea base de datos completamente**
   - Elimina datos existentes
   - **MITIGACIÓN:** Script hace pg_dump antes de recrear

---

## 9. PLAN DE MIGRACIÓN RECOMENDADO

### Fase 1: Preparación (Antes de tocar producción)

```bash
# 1. En workspace NUEVO
cd /home/isem/workspace/projects/gamilit

# 2. Copiar scripts
mkdir -p scripts
cp /home/isem/workspace-old/wsl-ubuntu/workspace/workspace-gamilit/gamilit/projects/gamilit/scripts/*.sh scripts/
chmod +x scripts/*.sh

# 3. Actualizar ecosystem.config.js
# Cambiar línea 138: path: '/home/isem/workspace/projects/gamilit'

# 4. Generar secretos
echo "JWT_SECRET=$(openssl rand -base64 32)"
echo "SESSION_SECRET=$(openssl rand -base64 32)"

# 5. Commit y push
git add .
git commit -m "feat: add production scripts and update paths"
git push origin main
```

### Fase 2: Testing Local

```bash
# 1. Instalar dependencias
npm install
cd apps/backend && npm install && cd ../..
cd apps/frontend && npm install && cd ../..

# 2. Build
cd apps/backend && npm run build && cd ../..
cd apps/frontend && npm run build && cd ../..

# 3. Verificar builds
ls -la apps/backend/dist/
ls -la apps/frontend/dist/
```

### Fase 3: Backup Producción (En servidor)

```bash
# En servidor 74.208.126.102
cd /home/isem/workspace-old/wsl-ubuntu/workspace/workspace-gamilit/gamilit/projects/gamilit

# Configurar variables
export DB_PASSWORD="tu_password_real"
export DATABASE_URL="postgresql://gamilit_user:${DB_PASSWORD}@localhost:5432/gamilit_platform"

# Ejecutar diagnóstico
./scripts/diagnose-production.sh > /tmp/pre-migration-diagnostic.txt

# Backup manual
BACKUP_DIR="/home/isem/backups/manual_$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

# Backup BD
PGPASSWORD="$DB_PASSWORD" pg_dump -h localhost -U gamilit_user -d gamilit_platform > $BACKUP_DIR/db_backup.sql

# Backup configs
cp apps/backend/.env.production $BACKUP_DIR/
cp apps/frontend/.env.production $BACKUP_DIR/
cp ecosystem.config.js $BACKUP_DIR/

# Backup logs
pm2 save
cp ~/.pm2/dump.pm2 $BACKUP_DIR/
```

### Fase 4: Deployment en Producción

```bash
# En servidor 74.208.126.102

# 1. Ir al workspace NUEVO
cd /home/isem/workspace/projects/gamilit

# 2. Configurar variables de entorno
export DB_PASSWORD="tu_password_real"
export JWT_SECRET="valor_generado_seguro_1"
export SESSION_SECRET="valor_generado_seguro_2"
export CORS_ORIGIN="http://74.208.126.102:3005,http://74.208.126.102,http://74.208.126.102:80"

# 3. Ejecutar update-production.sh
chmod +x scripts/update-production.sh
./scripts/update-production.sh

# 4. Verificar deployment
./scripts/diagnose-production.sh

# 5. Validar manualmente
curl http://localhost:3006/api/v1/health
curl http://localhost:3005
```

### Fase 5: Validación Post-Deployment

```bash
# 1. Verificar PM2
pm2 list
pm2 logs --lines 50

# 2. Verificar endpoints críticos
curl http://74.208.126.102:3006/api/v1/health
curl http://74.208.126.102:3006/api/v1/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'

# 3. Verificar frontend
curl -I http://74.208.126.102:3005

# 4. Verificar BD
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM auth.users;"
psql "$DATABASE_URL" -c "SELECT slug, is_active FROM auth_management.tenants;"

# 5. Verificar logs
tail -f logs/backend-out.log
tail -f logs/backend-error.log
tail -f logs/frontend-out.log
tail -f logs/frontend-error.log
```

### Fase 6: Rollback (Si es necesario)

```bash
# Si algo sale mal:

# 1. Detener servicios
pm2 stop all

# 2. Volver al workspace VIEJO
cd /home/isem/workspace-old/wsl-ubuntu/workspace/workspace-gamilit/gamilit/projects/gamilit

# 3. Restaurar BD desde backup
PGPASSWORD="$DB_PASSWORD" psql -h localhost -U gamilit_user -d gamilit_platform < $BACKUP_DIR/db_backup.sql

# 4. Restaurar configs
cp $BACKUP_DIR/.env.production apps/backend/
cp $BACKUP_DIR/.env.production apps/frontend/
cp $BACKUP_DIR/ecosystem.config.js .

# 5. Reiniciar servicios
pm2 start ecosystem.config.js
pm2 logs
```

---

## 10. MONITOREO POST-DEPLOYMENT

### Comandos útiles:

```bash
# Ver status PM2
pm2 status

# Ver logs en tiempo real
pm2 logs

# Ver logs específicos
pm2 logs gamilit-backend
pm2 logs gamilit-frontend

# Monitor interactivo
pm2 monit

# Reiniciar servicios
pm2 restart all

# Recargar sin downtime
pm2 reload all

# Ver métricas
pm2 show gamilit-backend
pm2 show gamilit-frontend

# Ejecutar diagnóstico
./scripts/diagnose-production.sh
```

### Métricas a monitorear:

1. **Disponibilidad:**
   - Backend health: `curl http://74.208.126.102:3006/api/v1/health`
   - Frontend: `curl -I http://74.208.126.102:3005`

2. **Performance:**
   - Tiempo de respuesta API
   - Memoria usada por procesos PM2
   - CPU usage

3. **Errores:**
   - Logs de errores backend
   - Logs de errores frontend
   - Errores CORS en logs
   - Errores de BD en logs

4. **Base de Datos:**
   - Conexiones activas
   - Tamaño de BD
   - Queries lentas

---

## 11. CONCLUSIONES

### Sincronización General: BUENA ✅

1. **Archivos de configuración:** IDÉNTICOS entre workspaces
2. **Código fuente:** SINCRONIZADO
3. **Configuraciones CORS:** CORRECTAS (HTTP)
4. **Dependencias:** Workspace NUEVO más actualizado

### Acciones CRÍTICAS antes de usar workspace NUEVO:

1. ⚠️ **Copiar scripts de producción** (update-production.sh, diagnose-production.sh)
2. ⚠️ **Actualizar path en ecosystem.config.js** (línea 138)
3. ⚠️ **Generar y configurar secretos seguros** (JWT_SECRET, SESSION_SECRET)
4. ⚠️ **Crear directorio de backups** (/home/isem/backups)

### Mejoras Post-Deployment:

1. 🔒 **Configurar HTTPS/SSL** (Let's Encrypt + Nginx)
2. 🌐 **Configurar DNS** (gamilit.com → 74.208.126.102)
3. 📊 **Configurar servicios externos** (Google Analytics, Sentry)
4. 💾 **Automatizar backups** (cron jobs)

### Compatibilidad de Scripts: ALTA ✅

Los scripts del workspace VIEJO son **totalmente compatibles** con el workspace NUEVO:
- No tienen hardcoded paths (excepto backups)
- Usan detección automática de directorios
- Configurables vía variables de entorno
- Solo requieren ser copiados al workspace NUEVO

---

## ANEXOS

### A. Variables de Entorno Requeridas

```bash
# En servidor de producción (74.208.126.102)
# Configurar en /etc/environment o ~/.bashrc

# Database
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=gamilit_platform
export DB_USER=gamilit_user
export DB_PASSWORD="tu_password_seguro_aqui"
export DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

# Seguridad
export JWT_SECRET="valor_generado_con_openssl_rand_base64_32"
export SESSION_SECRET="otro_valor_generado_con_openssl_rand_base64_32"

# CORS
export CORS_ORIGIN="http://74.208.126.102:3005,http://74.208.126.102,http://74.208.126.102:80"

# URLs
export FRONTEND_URL="http://74.208.126.102:3005"
export BACKEND_URL="http://74.208.126.102:3006"

# Backups
export BACKUP_BASE="/home/isem/backups"

# Opcional - cuando se configure SSL
# export CORS_ORIGIN="https://gamilit.com,https://www.gamilit.com"
# export FRONTEND_URL="https://gamilit.com"
# export BACKEND_URL="https://api.gamilit.com"
```

### B. Estructura de Backups

```
/home/isem/backups/
├── 20251218_143000/
│   ├── config/
│   │   ├── backend.env.production
│   │   ├── frontend.env.production
│   │   └── ecosystem.config.js
│   └── database/
│       └── gamilit_20251218_143000.sql.gz
├── 20251217_093000/
│   └── ...
└── manual_20251216_120000/
    └── ...
```

### C. URLs de Documentación Relacionada

- Guía de actualización: `docs/95-guias-desarrollo/GUIA-ACTUALIZACION-PRODUCCION.md`
- Guía de validación: `docs/95-guias-desarrollo/GUIA-VALIDACION-PRODUCCION.md`
- Troubleshooting database: `apps/database/README.md`
- API Cheatsheet: `docs/96-quick-reference/API-CHEATSHEET.md`

---

**Fin del Reporte**

Generado por: Architecture-Analyst
Fecha: 2025-12-18
Workspace Nuevo: `/home/isem/workspace/projects/gamilit/`
Workspace Viejo: `/home/isem/workspace-old/wsl-ubuntu/workspace/workspace-gamilit/gamilit/projects/gamilit/`
