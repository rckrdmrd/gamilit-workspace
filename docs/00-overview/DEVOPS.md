# DevOps - GAMILIT

**Version:** 1.0.0
**Fecha:** 2026-02-07

---

## Ambiente de Desarrollo

### Puertos de Servicios

| Servicio | Puerto | Descripcion |
|----------|--------|-------------|
| Frontend Web | 3005 | Vite dev server (React 19) |
| Backend API | 3006 | NestJS server |
| PostgreSQL | 5432 | Base de datos principal |
| Redis | 6379 | Cache y sesiones (DB 0) |

### WSL (Windows Subsystem for Linux)

**Distribucion:** Ubuntu-24.04
**Usuario:** developer
**Password:** developer_wsl_2026

Los servicios de base de datos (PostgreSQL, Redis) corren dentro de WSL. El codigo fuente reside en Windows y se accede via `/mnt/c/`.

### Docker Compose (Desarrollo Local)

```yaml
# docker-compose.yml
version: '3.9'
services:
  backend:
    build: ./apps/backend
    ports:
      - "3006:3006"
    environment:
      - DATABASE_HOST=postgres
      - DATABASE_PORT=5432
      - DATABASE_NAME=gamilit_platform
      - DATABASE_USER=gamilit_user
      - DATABASE_PASSWORD=gamilit_dev_2026
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - REDIS_DB=0
    depends_on:
      - postgres
      - redis

  frontend:
    build: ./apps/frontend
    ports:
      - "3005:3005"
    environment:
      - VITE_API_URL=http://localhost:3006

  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=gamilit_platform
      - POSTGRES_USER=gamilit_user
      - POSTGRES_PASSWORD=gamilit_dev_2026
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

---

## Database Management

### Recrear Base de Datos

```bash
# Recrear BD completa desde DDL (via WSL)
wsl -d Ubuntu-24.04 -u developer -- bash '/mnt/c/Empresas/ISEM/workspace-arch/workspace-projects/scripts/database/unified-recreate-db.sh' gamilit --drop

# Conectar a BD
psql -U gamilit_user -d gamilit_platform -h localhost -p 5432

# Backup
pg_dump -U gamilit_user -h localhost gamilit_platform > backup_$(date +%Y%m%d).sql

# Restore
psql -U gamilit_user -h localhost gamilit_platform < backup.sql
```

### Flujo DDL
1. Modificar archivos `.sql` en `apps/database/ddl/`
2. Ejecutar script de recreacion en WSL
3. Verificar que entities coinciden con tablas
4. Ejecutar tests de backend
5. Commit + Push

---

## Build Process

### Backend (NestJS 11)
```bash
cd apps/backend

# Desarrollo
npm run start:dev       # Hot reload en puerto 3006

# Build produccion
npm run build           # Genera dist/ con tsc
npm run start:prod      # Ejecuta build de produccion

# Validaciones
npm run lint            # ESLint
npm run test            # Jest (833 tests)
npm run test:cov        # Cobertura de tests
```

### Frontend (React 19 + Vite 7)
```bash
cd apps/frontend

# Desarrollo
npm run dev             # Vite dev server en puerto 3005

# Build produccion
npm run build           # Vite build -> dist/
npm run preview         # Preview de build de produccion

# Validaciones
npm run lint            # ESLint
npm run typecheck       # TypeScript compiler check
npm run test            # Vitest
```

---

## Deployment

### Estructura de Deployment

```
Production
+-- Load Balancer (Nginx)
    +-- Frontend (Static files served by Nginx)
    +-- Backend (NestJS, multiple instances)
    +-- PostgreSQL 16 (Primary + Replica)
    +-- Redis (Cache + Sessions)
```

### Variables de Entorno

| Variable | Descripcion | Ejemplo |
|----------|-------------|---------|
| NODE_ENV | Ambiente | production |
| DATABASE_HOST | Host de PostgreSQL | postgres.internal |
| DATABASE_PORT | Puerto de PostgreSQL | 5432 |
| DATABASE_NAME | Nombre de BD | gamilit_platform |
| DATABASE_USER | Usuario de BD | gamilit_user |
| DATABASE_PASSWORD | Password de BD | (secret) |
| REDIS_HOST | Host de Redis | redis.internal |
| REDIS_PORT | Puerto de Redis | 6379 |
| REDIS_DB | Database index de Redis | 0 |
| JWT_SECRET | Secret para JWT | (secret) |
| JWT_EXPIRATION | Expiracion de access token | 15m |
| REFRESH_TOKEN_EXPIRATION | Expiracion de refresh token | 7d |
| CORS_ORIGINS | Origenes permitidos | https://app.gamilit.com |
| SMTP_HOST | Host de email | smtp.provider.com |
| SMTP_PORT | Puerto de email | 587 |

---

## Kubernetes Readiness

### Estado
Kubernetes manifests preparados en `apps/devops/k8s/` (readiness stage).

### Manifests Planificados
```
apps/devops/k8s/
+-- namespace.yml
+-- backend-deployment.yml
+-- backend-service.yml
+-- frontend-deployment.yml
+-- frontend-service.yml
+-- postgres-statefulset.yml
+-- postgres-service.yml
+-- redis-deployment.yml
+-- redis-service.yml
+-- ingress.yml
+-- configmap.yml
+-- secrets.yml
+-- hpa.yml                # Horizontal Pod Autoscaler
```

### Recursos Estimados
| Servicio | CPU Request | Memory Request | Replicas |
|----------|-------------|----------------|----------|
| Backend | 250m | 512Mi | 2-4 (HPA) |
| Frontend | 100m | 128Mi | 2 |
| PostgreSQL | 500m | 1Gi | 1 (Primary) |
| Redis | 100m | 256Mi | 1 |

---

## Monitoring

### Health Checks
- **Backend:** GET /health (liveness), GET /health/ready (readiness)
- **PostgreSQL:** Connection pool health
- **Redis:** PING check

### Metricas a Monitorear
| Metrica | Threshold |
|---------|-----------|
| API Response Time (P95) | < 200ms |
| API Error Rate | < 1% |
| Database Connection Pool | < 80% utilization |
| Memory Usage | < 85% |
| CPU Usage | < 70% |
| WebSocket Connections | < 10,000 concurrent |

### Logs
- **Backend:** Structured JSON logging (Winston/Pino)
- **Frontend:** Error boundary + Sentry integration (planned)
- **Database:** PostgreSQL query logs (slow queries > 100ms)

---

## Git Workflow

### Branch Strategy
- **main:** Produccion (protegida)
- **develop:** Desarrollo activo
- **feature/GAM-XXX:** Features individuales
- **hotfix/GAM-XXX:** Hotfixes urgentes

### Commit Convention
```
[GAM-XXX] tipo: descripcion breve

Tipos: feat, fix, refactor, docs, test, chore, perf
Ejemplo: [GAM-042] feat: add exercise spaced repetition engine
```

### Monorepo Workflow
```bash
# Todo en un solo commit+push
git add .
git commit -m "[GAM-XXX] tipo: descripcion"
git push origin main
```

---

## Security Checklist

- [ ] JWT secrets rotados periodicamente
- [ ] RLS policies activas en produccion
- [ ] CORS configurado solo para dominios permitidos
- [ ] Rate limiting activo (100 req/min)
- [ ] SQL injection protegido (TypeORM parameterized queries)
- [ ] XSS protegido (sanitizacion de inputs)
- [ ] HTTPS forzado en produccion
- [ ] Secrets en variables de entorno (no en codigo)
- [ ] Logs no contienen datos sensibles

---

*GAMILIT - DevOps Configuration*
*Puertos: Frontend 3005 | Backend 3006 | PostgreSQL 5432 | Redis 6379*
