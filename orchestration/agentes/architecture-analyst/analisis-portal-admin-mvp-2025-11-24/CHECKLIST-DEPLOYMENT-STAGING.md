# Checklist de Deployment a Staging - Portal Admin MVP

**Fecha:** 2025-11-24
**Analista:** Architecture-Analyst
**Target Environment:** Staging
**Versión:** MVP 1.0

---

## 🎯 Objetivo

Asegurar un deployment exitoso y sin riesgos del Portal Admin MVP al ambiente de staging, validando todos los componentes antes de producción.

---

## ⚠️ Pre-Requisitos CRÍTICOS

### BLOQUEANTE #1: Resolver Discrepancia API US-AE-007 🔴

**Status:** ❌ **PENDIENTE - BLOQUEANTE**

**Descripción:** Rutas API de frontend no coinciden con backend para Classroom-Teacher assignments.

**Acción Requerida:**
- [ ] Leer reporte: `REPORTE-CRITICO-DISCREPANCIA-API-US-AE-007.md`
- [ ] Implementar Opción 1 (modificar backend - agregar endpoints REST)
- [ ] Testing de integración frontend-backend
- [ ] Confirmar que TODAS las rutas funcionan (0/7 actualmente)

**Owner:** Backend Developer
**Deadline:** ANTES de cualquier deployment
**Tiempo Estimado:** 2 días

**Verificación:**
```bash
# Test manual de endpoints
curl -X GET http://localhost:3006/api/admin/classrooms/{uuid}/teachers \
  -H "Authorization: Bearer {token}"
# Debe retornar 200 (actualmente 404)
```

---

## 📋 Checklist de Pre-Deployment

### 1. Código y Build ✅

#### Frontend

- [ ] **Branch actualizado:**
  ```bash
  cd apps/frontend
  git checkout main
  git pull origin main
  ```

- [ ] **Dependencies actualizadas:**
  ```bash
  npm install
  npm audit fix
  ```

- [ ] **TypeScript sin errores:**
  ```bash
  npm run type-check
  # Debe retornar 0 errores
  ```

- [ ] **ESLint sin errores críticos:**
  ```bash
  npm run lint
  # Warnings OK, errors NO
  ```

- [ ] **Build exitoso:**
  ```bash
  NODE_ENV=production npm run build
  # Verificar dist/ creado
  # Verificar tamaños de bundles < 500 KB (main)
  ```

- [ ] **Environment variables configuradas:**
  - [ ] `.env.staging` existe
  - [ ] `VITE_API_URL` apunta a staging backend
  - [ ] `VITE_APP_ENV=staging`
  - [ ] No hay secrets hardcodeados

#### Backend

- [ ] **Branch actualizado:**
  ```bash
  cd apps/backend
  git checkout main
  git pull origin main
  ```

- [ ] **Dependencies actualizadas:**
  ```bash
  npm install
  npm audit fix --production
  ```

- [ ] **TypeScript sin errores:**
  ```bash
  npm run build
  # Dist/ debe crearse sin errores
  ```

- [ ] **Tests passing:**
  ```bash
  npm run test
  # Todos los tests deben pasar (100%)
  ```

- [ ] **Coverage aceptable:**
  ```bash
  npm run test:cov
  # > 70% de cobertura en módulos críticos
  ```

- [ ] **Environment variables configuradas:**
  - [ ] `.env.staging` existe
  - [ ] `DATABASE_URL` apunta a staging DB
  - [ ] `JWT_SECRET` diferente a producción
  - [ ] `PORT=3006` o configurado
  - [ ] No hay secrets en código

### 2. Base de Datos 🗄️

- [ ] **Backup de staging DB:**
  ```bash
  pg_dump -U gamilit_user -h staging-db.example.com \
    gamilit_platform > backup-staging-$(date +%Y%m%d).sql
  ```

- [ ] **Migraciones aplicadas:**
  ```bash
  npm run migration:run
  # Verificar que todas las migraciones están aplicadas
  ```

- [ ] **Seeds ejecutados:**
  ```bash
  # Solo seeds de staging, NO producción
  npm run db:seed-staging
  ```

- [ ] **Datos de prueba:**
  - [ ] 1 super_admin (admin@gamilit.com)
  - [ ] 3 teachers (teacher1-3@gamilit.com)
  - [ ] 10 students
  - [ ] 5 classrooms
  - [ ] Datos de gamificación (parámetros, rangos)

- [ ] **Verificación de integridad:**
  ```sql
  -- Verificar tablas críticas
  SELECT COUNT(*) FROM auth.profiles;
  SELECT COUNT(*) FROM auth.system_settings;
  SELECT COUNT(*) FROM gamification.maya_ranks;
  SELECT COUNT(*) FROM social.classrooms;
  ```

### 3. Testing Pre-Deployment 🧪

- [ ] **Unit tests (Backend):**
  ```bash
  npm run test --coverage
  # Debe pasar 100% de tests
  ```

- [ ] **Integration tests:**
  ```bash
  npm run test:e2e
  # Tests de API endpoints críticos
  ```

- [ ] **E2E tests (Frontend):**
  ```bash
  cd apps/frontend
  npx playwright test
  # Al menos tests de prioridad ALTA pasando
  ```

- [ ] **Smoke tests manuales:**
  - [ ] Login como admin funciona
  - [ ] Dashboard carga sin errores
  - [ ] Instituciones muestra datos
  - [ ] Gamificación carga parámetros
  - [ ] Classroom-Teacher asigna y remueve (⚠️ después de resolver discrepancia)

- [ ] **Performance tests:**
  ```bash
  # Lighthouse score
  npm run lighthouse -- --url=http://staging.gamilit.com/admin
  # Performance > 80, Accessibility > 90
  ```

### 4. Documentación 📚

- [ ] **README actualizado:**
  - [ ] Instrucciones de deployment
  - [ ] Variables de entorno necesarias
  - [ ] Comandos de troubleshooting

- [ ] **CHANGELOG.md:**
  - [ ] Listar features nuevas (MVP)
  - [ ] Listar bugs fixes
  - [ ] Listar breaking changes (si existen)

- [ ] **API Documentation:**
  - [ ] Swagger docs actualizadas en `/api/docs`
  - [ ] Postman collection exportada

- [ ] **User Manual:**
  - [ ] `MANUAL-USUARIO-ADMIN-ALCANCE-MVP.md` disponible
  - [ ] Screenshots actualizados

### 5. Monitoreo y Logs 📊

- [ ] **Logging configurado:**
  - [ ] Winston/Pino configurado
  - [ ] Logs a archivo + consola
  - [ ] Log rotation configurado

- [ ] **Error tracking:**
  - [ ] Sentry (o similar) configurado
  - [ ] DSN de staging (NO producción)
  - [ ] Source maps subidos

- [ ] **Monitoring:**
  - [ ] Health check endpoint: `/health`
  - [ ] Metrics endpoint: `/metrics` (Prometheus format opcional)

- [ ] **Alerting:**
  - [ ] Email/Slack alerts configurados
  - [ ] Thresholds definidos (CPU > 80%, Memory > 85%, Errors > 100/min)

---

## 🚀 Proceso de Deployment

### Opción A: Manual Deployment (Simple)

#### Step 1: Frontend

```bash
# 1. Build
cd apps/frontend
NODE_ENV=staging npm run build

# 2. Upload a servidor staging
rsync -avz --delete dist/ user@staging-server:/var/www/gamilit-admin/

# 3. Restart nginx (si aplica)
ssh user@staging-server 'sudo systemctl reload nginx'

# 4. Verificar
curl -I https://staging.gamilit.com/admin
# Debe retornar 200
```

#### Step 2: Backend

```bash
# 1. Build
cd apps/backend
npm run build

# 2. Upload a servidor staging
rsync -avz --delete dist/ user@staging-server:/opt/gamilit-backend/

# 3. Install dependencies (solo production)
ssh user@staging-server 'cd /opt/gamilit-backend && npm ci --production'

# 4. Restart service
ssh user@staging-server 'sudo systemctl restart gamilit-backend'

# 5. Verificar health
curl https://api-staging.gamilit.com/health
# Debe retornar {"status": "ok"}
```

### Opción B: Docker Deployment (Recomendado)

#### Step 1: Build Images

```bash
# Frontend
docker build -t gamilit-admin-frontend:staging ./apps/frontend

# Backend
docker build -t gamilit-backend:staging ./apps/backend

# Tag para registry
docker tag gamilit-admin-frontend:staging registry.example.com/gamilit-admin-frontend:staging
docker tag gamilit-backend:staging registry.example.com/gamilit-backend:staging

# Push a registry
docker push registry.example.com/gamilit-admin-frontend:staging
docker push registry.example.com/gamilit-backend:staging
```

#### Step 2: Deploy con Docker Compose

```yaml
# docker-compose.staging.yml
version: '3.8'

services:
  frontend:
    image: registry.example.com/gamilit-admin-frontend:staging
    ports:
      - "5173:80"
    environment:
      - VITE_API_URL=https://api-staging.gamilit.com
      - VITE_APP_ENV=staging
    restart: unless-stopped

  backend:
    image: registry.example.com/gamilit-backend:staging
    ports:
      - "3006:3006"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - NODE_ENV=staging
    restart: unless-stopped
    depends_on:
      - postgres

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=gamilit_platform
      - POSTGRES_USER=gamilit_user
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres-data:
```

```bash
# Deploy
docker-compose -f docker-compose.staging.yml up -d

# Verificar
docker-compose -f docker-compose.staging.yml ps
```

### Opción C: CI/CD Pipeline (Ideal)

**GitHub Actions Workflow:**

```yaml
# .github/workflows/deploy-staging.yml
name: Deploy to Staging

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test
      - run: npm run build

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: NODE_ENV=staging npm run build
      - uses: appleboy/scp-action@master
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: ${{ secrets.STAGING_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          source: "apps/frontend/dist/*"
          target: "/var/www/gamilit-admin/"

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run build
      - uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: ${{ secrets.STAGING_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/gamilit-backend
            git pull origin main
            npm ci --production
            npm run build
            sudo systemctl restart gamilit-backend
```

---

## ✅ Post-Deployment Verification

### Smoke Tests Automáticos

```bash
#!/bin/bash
# smoke-test-staging.sh

STAGING_URL="https://staging.gamilit.com"
API_URL="https://api-staging.gamilit.com"

# 1. Frontend accesible
echo "Testing frontend..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $STAGING_URL)
if [ $HTTP_STATUS -eq 200 ]; then
  echo "✅ Frontend OK"
else
  echo "❌ Frontend FAILED (HTTP $HTTP_STATUS)"
  exit 1
fi

# 2. Backend health check
echo "Testing backend health..."
HEALTH=$(curl -s $API_URL/health | jq -r '.status')
if [ "$HEALTH" = "ok" ]; then
  echo "✅ Backend OK"
else
  echo "❌ Backend FAILED"
  exit 1
fi

# 3. Login endpoint
echo "Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gamilit.com","password":"admin123"}')
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')
if [ "$TOKEN" != "null" ]; then
  echo "✅ Login OK"
else
  echo "❌ Login FAILED"
  exit 1
fi

# 4. Admin dashboard endpoint
echo "Testing admin dashboard..."
DASHBOARD=$(curl -s -H "Authorization: Bearer $TOKEN" $API_URL/admin/dashboard/stats)
if [ $? -eq 0 ]; then
  echo "✅ Admin API OK"
else
  echo "❌ Admin API FAILED"
  exit 1
fi

echo "🎉 All smoke tests PASSED"
```

### Manual Verification Checklist

- [ ] **Frontend:**
  - [ ] Login page carga (`/login`)
  - [ ] Login como admin exitoso
  - [ ] Redirect a `/admin` funciona
  - [ ] Dashboard carga sin errores console
  - [ ] Sidebar muestra 11 items
  - [ ] Header muestra usuario y gamification data

- [ ] **Dashboard:**
  - [ ] 4 métricas principales visibles
  - [ ] Datos actualizados (no placeholder/hardcoded)
  - [ ] Sin errores en Network tab

- [ ] **Instituciones:**
  - [ ] Lista de organizaciones carga
  - [ ] Búsqueda funciona
  - [ ] Badges "En Construcción" en botones CRUD

- [ ] **Gamificación:**
  - [ ] Tab "Rangos Maya" muestra 5 rangos
  - [ ] Tab "Economía" muestra parámetros
  - [ ] Tab "Estadísticas" muestra métricas
  - [ ] Botones "Editar" muestran alert (MVP behavior)

- [ ] **Classroom-Teacher:** ⚠️ **Solo después de resolver discrepancia**
  - [ ] Tab "Por Classroom" funciona
  - [ ] Buscar classroom por UUID carga datos
  - [ ] Asignar teacher funciona
  - [ ] Remover teacher funciona
  - [ ] Tab "Por Teacher" funciona
  - [ ] Asignar múltiples classrooms funciona

- [ ] **Navegación:**
  - [ ] Todos los sidebar links funcionan
  - [ ] Páginas "Under Construction" muestran componente correcto
  - [ ] Botón "Volver al Dashboard" funciona
  - [ ] Logout funciona

- [ ] **Performance:**
  - [ ] Tiempo de carga inicial < 3 segundos
  - [ ] API responses < 500ms
  - [ ] No memory leaks (verificar con DevTools)

- [ ] **Errors:**
  - [ ] No errores 500 en uso normal
  - [ ] Errores 404 manejados gracefully
  - [ ] Network errors muestran mensaje amigable

---

## 🐛 Rollback Plan

**En caso de fallo crítico en staging:**

### Opción 1: Git Revert

```bash
# Identificar commit problemático
git log --oneline -10

# Revert commit
git revert {commit-hash}

# Push
git push origin main

# Re-deploy
# ... seguir proceso de deployment con código revertido
```

### Opción 2: Restore Backup

```bash
# Frontend
rsync -avz backup/frontend-20241124/ user@staging-server:/var/www/gamilit-admin/

# Backend
ssh user@staging-server 'sudo systemctl stop gamilit-backend'
rsync -avz backup/backend-20241124/ user@staging-server:/opt/gamilit-backend/
ssh user@staging-server 'sudo systemctl start gamilit-backend'

# Database
psql -U gamilit_user -h staging-db.example.com \
  gamilit_platform < backup-staging-20241124.sql
```

### Opción 3: Docker Rollback

```bash
# Ver versiones previas
docker images | grep gamilit

# Deploy versión anterior
docker-compose -f docker-compose.staging.yml down
docker tag registry.example.com/gamilit-backend:previous registry.example.com/gamilit-backend:staging
docker-compose -f docker-compose.staging.yml up -d
```

---

## 📊 Success Criteria

**Deployment es exitoso cuando:**

1. ✅ **Todos los smoke tests passing**
2. ✅ **0 errores críticos en logs (primeras 24 horas)**
3. ✅ **Performance dentro de SLAs:**
   - Frontend: LCP < 2.5s
   - Backend: P95 response time < 500ms
   - Database: Query time P95 < 100ms
4. ✅ **100% uptime en primeras 24 horas**
5. ✅ **User acceptance testing (UAT) aprobado:**
   - Product Owner prueba flujos principales
   - QA valida casos críticos
   - Stakeholders aprueban para producción
6. ✅ **Discrepancia API US-AE-007 RESUELTA** (bloqueante)

---

## 🚨 Troubleshooting Guide

### Problema: Frontend 404 después de deployment

**Síntomas:**
- Página muestra 404 en rutas específicas
- Refresh en `/admin/gamification` muestra 404

**Causa:**
- Nginx/Apache no configurado para SPA routing

**Solución:**
```nginx
# nginx.conf
location / {
  try_files $uri $uri/ /index.html;
}
```

### Problema: Backend retorna 503 Service Unavailable

**Síntomas:**
- API no responde
- Health check falla

**Debug:**
```bash
# Ver logs
journalctl -u gamilit-backend -f

# Verificar proceso corriendo
ps aux | grep node

# Verificar puerto
netstat -tulpn | grep 3006

# Restart service
sudo systemctl restart gamilit-backend
```

### Problema: CORS errors en frontend

**Síntomas:**
- Console muestra "CORS policy blocked"
- Requests fallan con 0 status

**Solución:**
```typescript
// Backend: main.ts
app.enableCors({
  origin: ['https://staging.gamilit.com'],
  credentials: true,
});
```

### Problema: JWT token inválido

**Síntomas:**
- Login exitoso pero luego 401 Unauthorized
- Token parece correcto pero backend rechaza

**Debug:**
```bash
# Verificar JWT_SECRET en .env
echo $JWT_SECRET

# Verificar que frontend y backend usan mismo secret
# Frontend: localStorage.getItem('token')
# Backend: verify token con mismo secret
```

### Problema: Database connection pool exhausted

**Síntomas:**
- Requests lentos
- Errores "Connection pool timeout"

**Solución:**
```typescript
// TypeORM config
{
  extra: {
    max: 20, // Aumentar pool size
    connectionTimeoutMillis: 5000,
  }
}
```

---

## 📋 Final Checklist Pre-Go-Live

- [ ] ✅ **Discrepancia API US-AE-007 RESUELTA** (bloqueante crítico)
- [ ] ✅ Código en `main` branch actualizado
- [ ] ✅ Build exitoso (frontend + backend)
- [ ] ✅ Tests passing (100% unit, 90% E2E critical)
- [ ] ✅ Database migrations aplicadas
- [ ] ✅ Seeds ejecutados
- [ ] ✅ Environment variables configuradas
- [ ] ✅ Smoke tests passing
- [ ] ✅ Manual verification completa
- [ ] ✅ Performance metrics dentro de SLAs
- [ ] ✅ Monitoring y alerting configurado
- [ ] ✅ Backup de staging DB creado
- [ ] ✅ Rollback plan documentado y probado
- [ ] ✅ Equipo notificado del deployment
- [ ] ✅ User manual actualizado
- [ ] ✅ Changelog generado
- [ ] ✅ Stakeholders informados

---

## 📞 Contacts y Escalation

**En caso de problemas durante deployment:**

| Rol | Contacto | Responsabilidad |
|-----|----------|----------------|
| **Backend Lead** | backend@gamilit.com | API issues, database |
| **Frontend Lead** | frontend@gamilit.com | UI issues, routing |
| **DevOps** | devops@gamilit.com | Infrastructure, deployment |
| **QA Lead** | qa@gamilit.com | Testing, validation |
| **Product Owner** | po@gamilit.com | UAT, approvals |
| **Architecture Analyst** | architect@gamilit.com | Architecture decisions |

**Escalation Matrix:**
1. **Level 1:** Developer que hace deployment (30 min SLA)
2. **Level 2:** Tech Lead / Senior Dev (1 hora SLA)
3. **Level 3:** Architecture Analyst + DevOps (2 horas SLA)
4. **Level 4:** CTO / Product Owner (4 horas SLA)

---

## 📅 Timeline Estimado

| Fase | Duración | Responsable |
|------|----------|-------------|
| **Pre-requisitos** | 2 días | Backend Dev (resolver API discrepancy) |
| **Pre-deployment checks** | 4 horas | QA + DevOps |
| **Deployment** | 2 horas | DevOps |
| **Smoke tests** | 1 hora | QA |
| **Manual verification** | 2 horas | QA + Product Owner |
| **Monitoring (24h)** | 1 día | DevOps + On-call Dev |
| **UAT** | 2-3 días | Product Owner + Stakeholders |
| **TOTAL** | **4-5 días** | |

---

## ✅ Sign-Off

**Aprobar deployment a staging cuando:**

- [ ] Backend Developer: API discrepancy resuelta, tests passing
- [ ] Frontend Developer: Build exitoso, UI verificada
- [ ] QA Engineer: All critical tests passing, no blockers
- [ ] DevOps: Infrastructure ready, monitoring configured
- [ ] Architecture Analyst: Architecture review passed
- [ ] Product Owner: UAT acceptance

**Firmas:**

- **Backend Lead:** _____________________ Date: _______
- **Frontend Lead:** _____________________ Date: _______
- **QA Lead:** _____________________ Date: _______
- **DevOps Lead:** _____________________ Date: _______
- **Product Owner:** _____________________ Date: _______

---

**Generado por:** Architecture-Analyst
**Fecha:** 2025-11-24
**Versión:** 1.0
**Estado:** 📋 Ready for Execution

**IMPORTANTE:** NO proceder con deployment hasta resolver US-AE-007 API discrepancy (bloqueante crítico).
