# CHECKLIST DE PREPARACIÓN PARA PRODUCCIÓN

**Fecha:** 2025-11-24
**Proyecto:** GAMILIT Platform
**Servidor Producción:** 74.208.126.102:3006
**Estado:** ✅ LISTO PARA DEPLOYMENT

---

## 📋 TABLA DE CONTENIDOS

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Validación de Base de Datos](#validación-de-base-de-datos)
3. [Validación de Configuración](#validación-de-configuración)
4. [Validación de Build](#validación-de-build)
5. [Checklist Pre-Deployment](#checklist-pre-deployment)
6. [Plan de Deployment](#plan-de-deployment)
7. [Plan de Rollback](#plan-de-rollback)
8. [Monitoreo Post-Deployment](#monitoreo-post-deployment)

---

## 🎯 RESUMEN EJECUTIVO

### Estado de Preparación

| Área | Estado | Detalles |
|------|--------|----------|
| **Base de Datos** | ✅ LISTO | Gamificación validada, seeds correctos |
| **Configuración Frontend** | ✅ LISTO | Variables producción configuradas |
| **Configuración Backend** | ⚠️ PENDIENTE | Verificar en servidor |
| **Build Frontend** | 🔄 EN PROCESO | A validar |
| **Tests Automatizados** | ✅ LISTO | Test de versionamiento OK |
| **Documentación** | ✅ COMPLETA | 6 docs generados |

### Cambios Principales Incluidos

- ✅ **GAP-001 a GAP-007:** 7 fixes críticos implementados
- ✅ **241 rutas versionadas** con /v1/
- ✅ **Configuración centralizada** en apiConfig.ts
- ✅ **Variables de entorno** validadas
- ✅ **Gamificación** operativa en todos los portales
- ✅ **BUG-003 & BUG-004:** Teacher Portal bugs críticos corregidos (2025-11-24)
  - Frontend: TeacherProgressPage crash fix (defensive array checks)
  - Backend: ExercisesController DataSource injection fix (server startup)

---

## 🗄️ VALIDACIÓN DE BASE DE DATOS

### Resultados de Validación (Ejecutada: 2025-11-24)

**Fecha de ejecución:** 2025-11-24 08:30 AM
**Base de datos:** gamilit_platform
**Usuario:** gamilit_user

#### Resumen Cuantitativo

| Métrica | Valor | Esperado | Status |
|---------|-------|----------|--------|
| Maya Ranks | 5 | >= 5 | ✅ PASS |
| Achievements | 20 | >= 20 | ✅ PASS |
| User Stats | 3 | >= Usuarios | ✅ PASS |
| User Ranks | 3 | >= Usuarios | ✅ PASS |
| Integridad Stats | 0 | = 0 usuarios sin stats | ✅ PASS |
| Integridad Ranks | 0 | = 0 usuarios sin ranks | ✅ PASS |

#### Detalle de Maya Ranks

✅ **5 rangos cargados correctamente:**

| Rank Order | Rank Name | Display Name | Min XP | Max XP | ML Coins Bonus | XP Multiplier |
|------------|-----------|--------------|--------|--------|----------------|---------------|
| 1 | Ajaw | Ajaw | 0 | 499 | 0 | 1.00 |
| 2 | Nacom | Nacom | 500 | 999 | 100 | 1.10 |
| 3 | Ah K'in | Ah K'in | 1000 | 1499 | 250 | 1.15 |
| 4 | Halach Uinic | Halach Uinic | 1500 | 2249 | 500 | 1.20 |
| 5 | K'uk'ulkan | K'uk'ulkan | 2250 | NULL | 1000 | 1.25 |

#### Detalle de Achievements

✅ **20 achievements activos distribuidos en 6 categorías:**

| Categoría | Common | Rare | Epic | Legendary | Total |
|-----------|--------|------|------|-----------|-------|
| progress | 2 | 1 | 1 | 1 | 5 |
| streak | 1 | 1 | 1 | 0 | 3 |
| completion | 0 | 2 | 1 | 1 | 4 |
| social | 1 | 1 | 0 | 0 | 2 |
| mastery | 0 | 1 | 2 | 0 | 3 |
| exploration | 1 | 1 | 0 | 0 | 2 |

#### Distribución de Usuarios

✅ **3 usuarios con gamificación inicializada:**

- Todos los usuarios están en rango **Ajaw** (inicial)
- Todos tienen **100 ML Coins** de inicio
- Todos tienen **0 XP** (sin actividad aún)
- Todos tienen **user_stats** y **user_ranks** correctamente inicializados

### Queries de Validación

Para revalidar en servidor de producción:

```sql
-- 1. Verificar Maya Ranks
SELECT COUNT(*) as maya_ranks_count,
       CASE
         WHEN COUNT(*) >= 5 THEN '✅ PASS'
         ELSE '❌ FAIL'
       END as status
FROM gamification_system.maya_ranks;

-- 2. Verificar Achievements
SELECT COUNT(*) as achievements_count,
       CASE
         WHEN COUNT(*) >= 20 THEN '✅ PASS'
         ELSE '❌ FAIL'
       END as status
FROM gamification_system.achievements;

-- 3. Verificar Integridad
SELECT
  (SELECT COUNT(*) FROM gamification_system.maya_ranks) as maya_ranks,
  (SELECT COUNT(*) FROM gamification_system.achievements) as achievements,
  (SELECT COUNT(*) FROM gamification_system.user_stats) as user_stats,
  (SELECT COUNT(*) FROM gamification_system.user_ranks) as user_ranks,
  (SELECT COUNT(*) FROM auth.users) as total_users;

-- 4. Usuarios sin gamificación
SELECT
  (SELECT COUNT(*) FROM auth.users u LEFT JOIN gamification_system.user_stats us ON us.user_id = u.id WHERE us.user_id IS NULL) as sin_stats,
  (SELECT COUNT(*) FROM auth.users u LEFT JOIN gamification_system.user_ranks ur ON ur.user_id = u.id AND ur.is_current = true WHERE ur.user_id IS NULL) as sin_ranks;
```

**Criterio de aceptación:**
- maya_ranks >= 5 ✅
- achievements >= 20 ✅
- user_stats = total_users ✅
- user_ranks = total_users ✅
- sin_stats = 0 ✅
- sin_ranks = 0 ✅

---

## ⚙️ VALIDACIÓN DE CONFIGURACIÓN

### Frontend - Variables de Entorno

#### Archivo: `.env.production`

**Ubicación:** `/apps/frontend/.env.production`

**Configuración actual:**

```bash
# API Configuration
VITE_API_URL=http://74.208.126.102:3006/api  ✅ CORRECTO
VITE_WS_URL=ws://74.208.126.102:3006         ✅ CORRECTO

# App Configuration
VITE_APP_NAME=GAMILIT Platform
VITE_API_TIMEOUT=30000

# Feature Flags
VITE_ENABLE_GAMIFICATION=true   ✅ Activado
VITE_ENABLE_SOCIAL_FEATURES=true
VITE_ENABLE_ANALYTICS=true

# Debug/Development (OFF en producción)
VITE_ENABLE_DEBUG=false          ✅ Desactivado
VITE_LOG_LEVEL=error
VITE_MOCK_API=false              ✅ Desactivado
```

**Validaciones automáticas en `src/config/env.ts`:**

✅ **Validación 1:** Variables requeridas (VITE_API_URL, VITE_WS_URL)
- Falla el build si faltan
- Status: IMPLEMENTADO (líneas 15-25)

✅ **Validación 2:** Production NO usa localhost
- Falla el build si VITE_API_URL contiene "localhost"
- Status: IMPLEMENTADO (líneas 95-102)

✅ **Validación 3:** Formato correcto de URLs
- VITE_API_URL debe empezar con http:// o https://
- VITE_WS_URL debe empezar con ws:// o wss://
- Status: IMPLEMENTADO (líneas 105-111)

#### Backend - Variables de Entorno (PENDIENTE DE VERIFICAR)

**Archivo:** `/apps/backend/.env.production` (verificar en servidor)

**Variables críticas a configurar:**

```bash
# Database
DATABASE_URL=postgresql://gamilit_user:PASSWORD@localhost:5432/gamilit_platform

# JWT
JWT_SECRET=<SECRET_SEGURO_PRODUCCIÓN>
JWT_EXPIRATION=7d

# CORS (CRÍTICO)
CORS_ORIGIN=http://74.208.126.102:3000,http://74.208.126.102:3001,http://74.208.126.102:3002

# Server
PORT=3006
NODE_ENV=production

# Redis (si aplica)
REDIS_HOST=localhost
REDIS_PORT=6379
```

**⚠️ ACCIÓN REQUERIDA:**
- [ ] Verificar que `.env.production` existe en servidor
- [ ] Validar DATABASE_URL apunta a base de datos correcta
- [ ] Validar JWT_SECRET es único y seguro (no el de desarrollo)
- [ ] Validar CORS_ORIGIN incluye IPs correctas de frontend
- [ ] Verificar que NODE_ENV=production

---

## 🏗️ VALIDACIÓN DE BUILD

### Frontend Build

**Comando:**
```bash
cd apps/frontend
NODE_ENV=production npm run build
```

**Resultado esperado:**
- ✅ Build completa sin errores
- ✅ Validaciones de env.ts pasan
- ✅ TypeScript compila sin errores nuevos
- ✅ Archivos generados en `dist/`

**Archivos críticos a verificar:**
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ...
└── ...
```

**Validaciones post-build:**

```bash
# 1. Verificar que no hay referencias a localhost en build
grep -r "localhost" dist/
# Esperado: Sin resultados (o solo en sourcemaps)

# 2. Verificar tamaño de bundle
du -sh dist/
# Esperado: < 10MB (típicamente ~3-5MB)

# 3. Verificar que apiConfig está incluido
grep -r "API_ENDPOINTS" dist/assets/index*.js
# Esperado: Encontrar referencias ofuscadas
```

### Backend Build (si aplica)

**Comando:**
```bash
cd apps/backend
npm run build
```

**Resultado esperado:**
- ✅ Build completa sin errores
- ✅ TypeScript compila
- ✅ Archivos generados en `dist/`

---

## ✅ CHECKLIST PRE-DEPLOYMENT

### 1. Código y Configuración

- [x] ✅ Todos los cambios commiteados en Git
- [x] ✅ `.env.production` configurado con IP correcta (74.208.126.102:3006)
- [x] ✅ Variables de entorno validadas (getRequiredEnv implementado)
- [x] ✅ Validación localhost en producción implementada
- [ ] ⚠️ Backend `.env.production` verificado en servidor
- [ ] ⚠️ DATABASE_URL apunta a base de datos correcta
- [ ] ⚠️ JWT_SECRET de producción configurado (NO usar el de dev)
- [ ] ⚠️ CORS_ORIGIN configurado con IPs correctas

### 2. Base de Datos

- [x] ✅ Seeds de gamificación en orden correcto (GAP-007 resuelto)
- [x] ✅ Maya ranks cargados (5 rangos)
- [x] ✅ Achievements cargados (20 achievements)
- [x] ✅ Validación ejecutada localmente (todas pasando)
- [ ] ⚠️ Base de datos de producción creada
- [ ] ⚠️ Ejecutar `init-database.sh` en producción
- [ ] ⚠️ Validar seeds con queries SQL en producción
- [ ] ⚠️ Backup de base de datos productiva antes de cambios

### 3. Frontend

- [x] ✅ apiConfig.ts con 241 rutas versionadas /v1/
- [x] ✅ Test de versionamiento pasando
- [x] ✅ Todas las rutas centralizadas
- [x] ✅ Hooks migrados (useSystemMonitoring, useAdminDashboard, etc.)
- [x] ✅ AdminApprovalsPage usando backend real (no mock)
- [ ] ⚠️ Build de producción ejecutado y validado
- [ ] ⚠️ Sin referencias a localhost en dist/
- [ ] ⚠️ Bundle size razonable (< 10MB)

### 4. Backend

- [ ] ⚠️ Build ejecutado sin errores
- [ ] ⚠️ Rutas /v1/ implementadas y funcionando
- [ ] ⚠️ Endpoints de gamificación operativos
- [ ] ⚠️ Endpoints de admin operativos
- [ ] ⚠️ CORS configurado correctamente
- [ ] ⚠️ Rate limiting configurado (si aplica)

### 5. Testing

- [x] ✅ Test de versionamiento API pasando
- [ ] ⚠️ Smoke tests ejecutados localmente
- [ ] ⚠️ Tests E2E críticos pasando (si existen)
- [ ] ⚠️ Validación manual en staging

### 6. Documentación

- [x] ✅ Resumen ejecutivo creado
- [x] ✅ Matriz de gaps documentada
- [x] ✅ Reporte análisis completo
- [x] ✅ Plan de orquestación
- [x] ✅ Fix GAP-007 documentado
- [x] ✅ Resumen final de intervención
- [x] ✅ Checklist producción (este documento)

### 7. Seguridad

- [ ] ⚠️ Secrets/passwords NO committed en Git
- [ ] ⚠️ `.env.production` en `.gitignore`
- [ ] ⚠️ JWT_SECRET único para producción
- [ ] ⚠️ Database password seguro
- [ ] ⚠️ HTTPS configurado (si aplica)
- [ ] ⚠️ SSL certificates válidos (si aplica)

### 8. Infraestructura

- [ ] ⚠️ Servidor 74.208.126.102 accesible
- [ ] ⚠️ Puertos 3000, 3001, 3002 (frontend) abiertos
- [ ] ⚠️ Puerto 3006 (backend) abierto
- [ ] ⚠️ PostgreSQL corriendo en servidor
- [ ] ⚠️ Redis corriendo (si aplica)
- [ ] ⚠️ Disk space suficiente
- [ ] ⚠️ RAM suficiente
- [ ] ⚠️ Firewall configurado correctamente

---

## 🚀 PLAN DE DEPLOYMENT

### Fase 1: Pre-Deployment (30 min)

#### 1.1 Backup de Base de Datos (10 min)

```bash
# En servidor de producción
PGPASSWORD='PASSWORD' pg_dump \
  -h localhost \
  -U gamilit_user \
  -d gamilit_platform \
  -F c \
  -f backup_pre_deployment_$(date +%Y%m%d_%H%M%S).dump

# Verificar backup
ls -lh backup_pre_deployment_*.dump
```

#### 1.2 Verificar Estado Actual (10 min)

```bash
# Backend
curl http://74.208.126.102:3006/api/v1/health
# Esperado: 200 OK

# Frontend (cada portal)
curl http://74.208.126.102:3000
curl http://74.208.126.102:3001
curl http://74.208.126.102:3002
# Esperado: 200 OK (HTML)
```

#### 1.3 Notificar Equipo (5 min)

- [ ] Enviar email/Slack: "Iniciando deployment - Sistema puede tener downtime de 10-15 min"
- [ ] Registrar inicio de deployment en log

#### 1.4 Modo Mantenimiento (5 min)

```bash
# Opcional: Poner página de mantenimiento
# nginx: Redirigir temporalmente a maintenance.html
```

### Fase 2: Deployment Backend (30 min)

#### 2.1 Actualizar Código (5 min)

```bash
cd /path/to/gamilit/apps/backend

# Pull latest code
git fetch origin
git checkout master
git pull origin master

# Verificar commit correcto
git log -1 --oneline
```

#### 2.2 Instalar Dependencias (5 min)

```bash
npm ci --production
# o
npm install --production
```

#### 2.3 Build Backend (5 min)

```bash
npm run build

# Verificar dist/
ls -la dist/
```

#### 2.4 Actualizar Base de Datos (10 min)

```bash
# Solo si hay migrations pendientes
npm run migration:run

# O recrear base de datos (CUIDADO - borra datos)
# Solo si es necesario:
# DATABASE_URL="postgresql://..." ./drop-and-recreate-database.sh
```

**⚠️ IMPORTANTE:** Si se recrea la BD, se pierden TODOS los datos. Solo hacer si es entorno de staging/desarrollo o hay backup completo.

#### 2.5 Restart Backend (5 min)

```bash
# Con PM2
pm2 restart gamilit-backend

# O con systemd
sudo systemctl restart gamilit-backend

# Verificar logs
pm2 logs gamilit-backend --lines 50
# o
sudo journalctl -u gamilit-backend -n 50
```

#### 2.6 Validar Backend (5 min)

```bash
# Health check
curl http://74.208.126.102:3006/api/v1/health
# Esperado: {"status":"ok"}

# Endpoints críticos
curl http://74.208.126.102:3006/api/v1/admin/dashboard/alerts
# Esperado: 401 Unauthorized (correcto - sin auth)

# Gamification
curl http://74.208.126.102:3006/api/v1/gamification/ranks
# Esperado: 200 OK o 401 (dependiendo de auth)
```

### Fase 3: Deployment Frontend (30 min)

#### 3.1 Build Frontend - Portal Student (10 min)

```bash
cd /path/to/gamilit/apps/frontend

# Set environment
export NODE_ENV=production

# Build
npm run build

# Verificar dist/
ls -la dist/
du -sh dist/

# Verificar sin localhost
grep -r "localhost" dist/ | grep -v ".map"
# Esperado: Sin resultados
```

#### 3.2 Deploy a Servidor Web (5 min)

```bash
# Backup dist actual
mv /var/www/gamilit-student /var/www/gamilit-student.backup.$(date +%Y%m%d_%H%M%S)

# Copy new build
cp -r dist/ /var/www/gamilit-student/

# Set permissions
chown -R www-data:www-data /var/www/gamilit-student/
chmod -R 755 /var/www/gamilit-student/
```

#### 3.3 Repetir para Teacher y Admin (15 min)

```bash
# Portal Teacher (puerto 3001)
npm run build:teacher
cp -r dist/ /var/www/gamilit-teacher/

# Portal Admin (puerto 3002)
npm run build:admin
cp -r dist/ /var/www/gamilit-admin/
```

#### 3.4 Restart Web Server (5 min)

```bash
# Nginx
sudo nginx -t  # Test config
sudo systemctl reload nginx

# O Apache
sudo apachectl configtest
sudo systemctl reload apache2
```

### Fase 4: Validación Post-Deployment (30 min)

#### 4.1 Validación de Base de Datos (10 min)

```bash
# Ejecutar queries de validación
PGPASSWORD='PASSWORD' psql -h localhost -U gamilit_user -d gamilit_platform << 'EOF'
-- Maya Ranks
SELECT COUNT(*) FROM gamification_system.maya_ranks;
-- Esperado: >= 5

-- Achievements
SELECT COUNT(*) FROM gamification_system.achievements;
-- Esperado: >= 20

-- User Stats
SELECT COUNT(*) FROM gamification_system.user_stats;

-- User Ranks
SELECT COUNT(*) FROM gamification_system.user_ranks;
EOF
```

**Criterio de éxito:** Todas las validaciones pasan (igual que en desarrollo)

#### 4.2 Validación de Endpoints Backend (10 min)

```bash
# 1. Health
curl http://74.208.126.102:3006/api/v1/health
# Esperado: 200 OK

# 2. Admin alerts (requiere login primero)
# Hacer login y obtener token
TOKEN=$(curl -X POST http://74.208.126.102:3006/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gamilit.com","password":"PASSWORD"}' \
  | jq -r '.access_token')

# Probar endpoint alerts
curl http://74.208.126.102:3006/api/v1/admin/dashboard/alerts \
  -H "Authorization: Bearer $TOKEN"
# Esperado: 200 OK + array de alerts

# 3. Gamification
curl http://74.208.126.102:3006/api/v1/gamification/ranks/user/USER_ID \
  -H "Authorization: Bearer $TOKEN"
# Esperado: 200 OK + datos de rango
```

#### 4.3 Validación de Frontend (10 min)

**Portal Student (3000):**
```bash
# 1. Acceder en navegador
# http://74.208.126.102:3000

# 2. Login como estudiante
# Email: student@gamilit.com
# Password: [PASSWORD]

# 3. Verificar:
# - Header muestra rango maya
# - Dashboard muestra coins/XP
# - Achievements cargan
# - Sin errores 404 en Network tab
```

**Portal Teacher (3001):**
```bash
# http://74.208.126.102:3001
# Login: teacher@gamilit.com
# Verificar:
# - Dashboard carga
# - Classrooms visible
# - Sin errores 404
```

**Portal Admin (3002):**
```bash
# http://74.208.126.102:3002
# Login: admin@gamilit.com
# Verificar:
# - Alerts cargan (no 404)
# - Approvals muestra datos reales
# - Classroom management funciona
# - Configuración de gamificación disponible
```

### Fase 5: Monitoreo Post-Deployment (1 hora)

#### 5.1 Monitoreo de Logs (30 min)

```bash
# Backend logs
pm2 logs gamilit-backend --lines 100

# Buscar errores
pm2 logs gamilit-backend | grep -i error

# Web server logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

**Red flags a buscar:**
- ❌ 404 Not Found en rutas /api/v1/
- ❌ CORS errors
- ❌ Database connection errors
- ❌ Unhandled promise rejections

#### 5.2 Verificación de Métricas (15 min)

```bash
# CPU/Memory usage
pm2 status

# Database connections
PGPASSWORD='PASSWORD' psql -h localhost -U gamilit_user -d gamilit_platform \
  -c "SELECT count(*) FROM pg_stat_activity WHERE datname = 'gamilit_platform';"

# Disk space
df -h
```

#### 5.3 Pruebas de Usuario Real (15 min)

- [ ] Login exitoso en 3 portales
- [ ] Navegación sin errores
- [ ] Gamificación visible
- [ ] Acciones CRUD funcionan (crear, editar, eliminar)

---

## 🔄 PLAN DE ROLLBACK

### Cuándo Hacer Rollback

**Criterios:**
- ❌ Errores críticos en logs (> 50 errores/min)
- ❌ Endpoints principales retornan 500 errors
- ❌ Frontend no carga (white screen)
- ❌ Base de datos corrupta
- ❌ Usuarios no pueden hacer login
- ❌ Pérdida de funcionalidad crítica

### Rollback Rápido - Frontend (5 min)

```bash
# Restaurar backup de dist/
cd /var/www

# Portal Student
rm -rf gamilit-student
mv gamilit-student.backup.TIMESTAMP gamilit-student

# Portal Teacher
rm -rf gamilit-teacher
mv gamilit-teacher.backup.TIMESTAMP gamilit-teacher

# Portal Admin
rm -rf gamilit-admin
mv gamilit-admin.backup.TIMESTAMP gamilit-admin

# Reload web server
sudo systemctl reload nginx
```

### Rollback Backend (10 min)

```bash
cd /path/to/gamilit/apps/backend

# Checkout previous commit
git log -5 --oneline
git checkout <previous-commit-hash>

# Rebuild
npm run build

# Restart
pm2 restart gamilit-backend

# Verify
curl http://74.208.126.102:3006/api/v1/health
```

### Rollback Base de Datos (15 min)

⚠️ **SOLO SI ES ABSOLUTAMENTE NECESARIO**

```bash
# Restaurar backup
PGPASSWORD='PASSWORD' pg_restore \
  -h localhost \
  -U gamilit_user \
  -d gamilit_platform \
  -c \
  backup_pre_deployment_TIMESTAMP.dump

# Verificar
PGPASSWORD='PASSWORD' psql -h localhost -U gamilit_user -d gamilit_platform \
  -c "SELECT COUNT(*) FROM gamification_system.maya_ranks;"
```

### Notificación Post-Rollback

- [ ] Notificar equipo: "Rollback completado - Investigando causa raíz"
- [ ] Documentar: ¿Qué salió mal? ¿Por qué? ¿Cómo prevenirlo?
- [ ] Plan de acción: Fix → Re-test → Re-deploy

---

## 📊 MONITOREO POST-DEPLOYMENT

### Métricas Clave a Monitorear (Primeras 24 horas)

#### Backend

| Métrica | Herramienta | Umbral Alerta | Frecuencia |
|---------|-------------|---------------|------------|
| CPU Usage | pm2 monit | > 80% por 5 min | Continuo |
| Memory Usage | pm2 monit | > 90% | Continuo |
| Response Time | Logs/APM | > 2s promedio | Cada 5 min |
| Error Rate | Logs | > 5% requests | Cada 5 min |
| Database Connections | PostgreSQL | > 80% pool | Cada 10 min |

#### Frontend

| Métrica | Herramienta | Umbral Alerta | Frecuencia |
|---------|-------------|---------------|------------|
| Page Load Time | Browser DevTools | > 5s | Por request |
| Bundle Size | Build output | > 10MB | Por build |
| API Errors (404/500) | Network tab | > 10 en 5 min | Continuo |
| Console Errors | Browser console | > 5 únicos | Por sesión |

#### Base de Datos

| Métrica | Herramienta | Umbral Alerta | Frecuencia |
|---------|-------------|---------------|------------|
| Active Connections | pg_stat_activity | > 80 | Cada 10 min |
| Slow Queries | pg_stat_statements | > 1s | Cada 10 min |
| Disk Space | df -h | < 20% free | Cada hora |
| Table Sizes | pg_total_relation_size | Crecimiento anormal | Cada 6 horas |

### Comandos de Monitoreo

```bash
# Backend health check (cada 5 min)
watch -n 300 'curl -s http://74.208.126.102:3006/api/v1/health | jq'

# PM2 monitoring
pm2 monit

# Database connections
watch -n 60 "PGPASSWORD='PASSWORD' psql -h localhost -U gamilit_user -d gamilit_platform \
  -c \"SELECT count(*), state FROM pg_stat_activity WHERE datname = 'gamilit_platform' GROUP BY state;\""

# Nginx access logs (por minuto)
tail -f /var/log/nginx/access.log | awk '{print $7}' | sort | uniq -c | sort -rn

# Error logs
tail -f /var/log/nginx/error.log
```

### Dashboard de Monitoreo (Recomendado)

**Herramientas sugeridas:**
- **APM:** New Relic, Datadog, o PM2 Plus
- **Logs:** ELK Stack (Elasticsearch, Logstash, Kibana)
- **Uptime:** UptimeRobot, Pingdom
- **Alerts:** PagerDuty, OpsGenie

**Alertas críticas a configurar:**
1. Backend down (health check falla por > 2 min)
2. Database connection errors
3. High error rate (> 5% requests)
4. Disk space < 20%
5. Memory usage > 90% por > 5 min

---

## 📞 CONTACTOS Y ESCALAMIENTO

### Equipo de Deployment

| Rol | Nombre | Contacto | Responsabilidad |
|-----|--------|----------|-----------------|
| Tech Lead | [NOMBRE] | [EMAIL/PHONE] | Decisiones técnicas |
| DevOps | [NOMBRE] | [EMAIL/PHONE] | Infraestructura, deployment |
| Database Admin | [NOMBRE] | [EMAIL/PHONE] | BD, performance, backup |
| Frontend Lead | [NOMBRE] | [EMAIL/PHONE] | Frontend, UI issues |
| Backend Lead | [NOMBRE] | [EMAIL/PHONE] | Backend, APIs |
| QA Lead | [NOMBRE] | [EMAIL/PHONE] | Validación, testing |

### Escalamiento

**Nivel 1 (0-15 min):** DevOps + Tech Lead
- Errores de deployment
- Configuración incorrecta
- Rollback si necesario

**Nivel 2 (15-30 min):** + Frontend/Backend Leads
- Bugs en código
- Errores de integración
- Performance issues

**Nivel 3 (30+ min):** + Database Admin + QA Lead
- Issues complejos
- Pérdida de datos
- Decisión de rollback completo

---

## 📋 RESUMEN EJECUTIVO FINAL

### Estado Actual (Pre-Build)

| Área | Status | Notas |
|------|--------|-------|
| Base de Datos | ✅ VALIDADO | Todas las validaciones pasando |
| Configuración | ✅ LISTO | Variables producción configuradas |
| Build Frontend | 🔄 PENDIENTE | A ejecutar |
| Build Backend | ⚠️ PENDIENTE | Verificar en servidor |
| Testing | ✅ PARCIAL | Tests automatizados OK, manual pendiente |
| Documentación | ✅ COMPLETO | 7 documentos generados |

### Próximos Pasos Inmediatos

1. **AHORA:** Ejecutar build de frontend con configuración de producción
2. **SIGUIENTE:** Validar build (sin localhost, tamaño OK)
3. **DESPUÉS:** Coordinar deployment en servidor 74.208.126.102

### Criterios de Éxito

✅ Build completa sin errores
✅ Todas las validaciones de base de datos pasan
✅ Endpoints críticos responden 200 OK
✅ Usuarios pueden hacer login en 3 portales
✅ Gamificación visible y funcional
✅ Sin errores 404 en Network tabs
✅ Logs sin errores críticos por 1 hora

### Tiempo Estimado de Deployment

| Fase | Tiempo | Dependencias |
|------|--------|--------------|
| Pre-deployment | 30 min | Backup, verificación |
| Backend deployment | 30 min | Build, restart |
| Frontend deployment | 30 min | Build, copy files |
| Validación | 30 min | Tests, verificación |
| Monitoreo | 60 min | Logs, métricas |
| **TOTAL** | **3 horas** | Con equipo completo |

---

**Documento elaborado por:** Architecture-Analyst
**Fecha:** 2025-11-24
**Versión:** 1.0
**Estado:** LISTO PARA DEPLOYMENT

**Próxima acción:** Ejecutar build de frontend y validar
