# FASE 6: Analisis del Pipeline de Deployment a Produccion

**Fecha:** 2026-02-19
**Autor:** Agente de Analisis (Claude Opus 4.6)
**Alcance:** Evaluacion end-to-end del pipeline de deploy, identificacion de gaps, evaluacion de rollback
**Archivos analizados:** 19 archivos en 6 categorias

---

## 1. Inventario de Scripts de Deploy

Se identificaron **multiples scripts de deploy** en el repositorio, lo cual representa un problema de fragmentacion:

| Script | Ubicacion | Proposito | Estado |
|--------|-----------|-----------|--------|
| `deploy-production.sh` | `apps/devops/scripts/` | Deploy completo con backup + rollback | **Principal (documentado en CLAUDE.md)** |
| `deploy-production.sh` | `scripts/` | Deploy PM2 simple (sin backup/tests) | **Duplicado / Legacy** |
| `update-production.sh` | `scripts/` | Actualizacion completa (10 pasos, recrea BD) | **Alternativo / Mas agresivo** |
| `deploy.sh` | `apps/devops/scripts/` | Deploy generico dev/prod | **Alternativo** |
| `deploy-staging.sh` | `apps/devops/scripts/` | Deploy a staging | Staging-only |
| PM2 `deploy.production` | `ecosystem.config.js` | Deploy via `pm2 deploy` | **Configurado pero no documentado** |

**Hallazgo critico:** Existen al menos 4 formas diferentes de desplegar a produccion, sin claridad sobre cual es la oficial.

---

## 2. Flujo de Deployment (Script Principal: `apps/devops/scripts/deploy-production.sh`)

```
                    deploy-production.sh --env prod
                              |
                    +-------------------+
                    | PASO 1: VALIDAR   |
                    | - Node.js         |
                    | - npm             |
                    | - psql            |
                    | - PM2             |
                    | - Conexion BD     |
                    | - Rama git        |
                    +-------------------+
                              |
                    +-------------------+
                    | PASO 2: TESTS     |  <-- NO BLOQUEAN (solo warning)
                    | - npm test        |
                    | - npm run test:run|
                    +-------------------+
                              |
                    +-------------------+
                    | PASO 3: BACKUP    |
                    | - backup-prod...sh|  <-- Solo datos (no full dump)
                    | - Tablas criticas |
                    +-------------------+
                              |
                    +-------------------+
                    | PASO 4: MIGRACION |
                    | - SQL en /migrat. |  <-- Directorio no existe
                    | - Mover a /exec.  |
                    +-------------------+
                              |
                    +-------------------+
                    | PASO 5: BUILD     |
                    | - npm ci backend  |  <-- Falla = rollback
                    | - npm ci frontend |  <-- Falla = rollback
                    +-------------------+
                              |
                    +-------------------+
                    | PASO 6: DEPLOY    |
                    | - pm2 stop all    |  <-- DOWNTIME TOTAL
                    | - pm2 startOrRes. |
                    | - pm2 save        |
                    +-------------------+
                              |
                    +-------------------+
                    | PASO 7: HEALTH    |
                    | - sleep 15        |
                    | - curl /api/health|  <-- URL INCORRECTA
                    | - 5 retries x 5s  |
                    | - Falla = rollback|
                    +-------------------+
                              |
                         COMPLETADO
```

---

## 3. Analisis Detallado por Componente

### 3.1 Validaciones Pre-Deploy (PASO 1)

**Fortalezas:**
- Verifica presencia de herramientas (Node, npm, psql, PM2)
- Valida conexion a base de datos antes de continuar
- Verifica rama git (main/master)
- Instala PM2 automaticamente si no existe

**Debilidades:**
- No verifica version de Node.js (requiere v20, pero no lo valida)
- No verifica espacio en disco disponible
- No verifica que no haya otro deploy en curso (lock file)
- La verificacion de rama usa `read -p` interactivo (no funciona en CI/CD)
- No valida que el build anterior exista como fallback

### 3.2 Tests (PASO 2) -- SEVERIDAD CRITICA

**Problema principal:** Los tests **NO bloquean** el deploy.

```bash
# Linea 229 - deploy-production.sh
print_warning "Tests de backend fallaron (continuando con advertencia)"
# Linea 237
print_warning "Tests de frontend fallaron (continuando con advertencia)"
```

Los tests fallan silenciosamente con un warning y el deploy **continua de todos modos**. El flag `--skip-tests` existe pero es redundante ya que los tests nunca bloquean.

### 3.3 Backup (PASO 3)

**Que respalda `backup-production-data.sh`:**
- `auth.users` + `auth_management.profiles` + `user_preferences` + `user_roles`
- `progress_tracking.*` (schema completo)
- `gamification_system.user_stats` + `user_achievements` + `user_ranks` + `ml_coins_transactions` + `comodines_inventory`
- `educational_content.teacher_content` + `published_teacher_content`
- `social_features.friendships` + `classroom_members` + `team_members`

**Que NO respalda (gaps):**
- `educational_content.modules`, `exercises`, `exercise_types` -- contenido educativo base
- `educational_content.readings`, `reading_passages` -- lecturas
- `gamification_system.shop_items`, `comodin_types` -- configuracion de tienda
- `auth_management.tenants`, `tenant_settings` -- configuracion multi-tenant
- `notification_system.*` -- historial de notificaciones
- `gamification_system.missions_templates`, `daily_missions` -- configuracion misiones
- `communication.*` -- mensajes
- **NO hace pg_dump full** -- solo data-only de tablas seleccionadas

**Formato:** Archivos SQL individuales con `--column-inserts`, comprimidos en `.tar.gz`. Metadatos en JSON.

**Retencion:** No definida en el script de backup de deploy (solo `pre-deploy-backup.sh` tiene retencion de 7 dias).

### 3.4 Migraciones (PASO 4)

**Directorio esperado:** `apps/database/migrations/`

Este directorio **no existe** actualmente. El proyecto usa DDL-First (ver ADR y `check-no-migrations.sh` en CI). Las migraciones SQL se gestionan manualmente. El paso simplemente imprime "No hay directorio de migraciones" y continua.

**Riesgo:** Si alguna vez se colocan archivos SQL en ese directorio, se ejecutaran **como gamilit_user** (no como superuser), lo cual fallara para operaciones que requieren privilegios de postgres (funciones SECURITY DEFINER, triggers, RLS policies).

### 3.5 Build (PASO 5)

**Backend:** `npm ci --production=false && npm run build`
**Frontend:** `npm ci && npm run build:prod`

Ambos builds **si bloquean** el deploy si fallan (ejecutan `do_rollback` y `exit 1`).

**Problema:** El build se ejecuta **en el servidor de produccion** despues de detener los servicios. Esto significa que durante todo el tiempo de `npm ci` + `npm run build` (potencialmente 2-5 minutos), **el sistema esta completamente caido**.

### 3.6 Deploy PM2 (PASO 6) -- SEVERIDAD CRITICA

```bash
# Linea 399
pm2 stop all 2>/dev/null || true
# Linea 403
pm2 startOrRestart ecosystem.config.js --env production
```

**`pm2 stop all` causa DOWNTIME TOTAL.** No hay zero-downtime deployment.

**Analisis de `ecosystem.config.js`:**

| Parametro | Backend | Frontend |
|-----------|---------|----------|
| `exec_mode` | `fork` | `fork` |
| `instances` | `1` | `1` |
| `max_memory_restart` | `1G` | `512M` |
| `max_restarts` | `10` | `10` |
| `min_uptime` | `10s` | `10s` |
| `kill_timeout` | `5000` | `5000` |
| `wait_ready` | `true` | N/A |
| `listen_timeout` | `10000` | N/A |

**Problemas del PM2 config:**

1. **Fork mode con 1 instancia:** Imposibilita zero-downtime reload. `pm2 reload` con cluster mode permite reiniciar instancias una a una. Fork mode siempre tiene downtime.

2. **`wait_ready: true` sin `process.send('ready')`:** El backend tiene `wait_ready: true` y `listen_timeout: 10000`, pero `main.ts` **NO tiene** la llamada `process.send('ready')`. Esto significa que PM2 espera 10 segundos y luego asume que esta listo, independientemente del estado real.

3. **Frontend usa `npx vite preview`:** En produccion se ejecuta Vite Preview en lugar de un servidor web optimizado (Nginx). Vite Preview es explicitamente "not designed for production" segun la documentacion de Vite. Impactos:
   - Sin compresion gzip/brotli a nivel de servidor
   - Sin cache headers optimizados
   - Sin HTTP/2
   - Sin rate limiting
   - Sin proteccion contra ataques DDoS a nivel de servidor estatico

   (Nota: Nginx termina SSL en el servidor, por lo que puede estar proxying a vite preview, mitigando algunos de estos puntos.)

4. **`env_file: './.env.production'`:** PM2 `env_file` no es una opcion nativa de PM2. Las variables de entorno se cargan via NestJS `ConfigModule` con `envFilePath`, no por PM2. Este campo es ignorado por PM2.

5. **Ecosystem deploy config:**
   ```javascript
   'post-deploy': 'npm install && npm run build:all && pm2 reload ecosystem.config.js --env production && pm2 save'
   ```
   Usa `pm2 reload` (zero-downtime) pero el proceso es fork mode, asi que reload se comporta igual que restart.

### 3.7 Health Checks (PASO 7) -- SEVERIDAD ALTA

```bash
curl -s "http://localhost:${backend_port}/api/health"
```

**URL INCORRECTA.** El backend tiene global prefix `/api/v1` (definido en `main.ts` linea 25), y el health controller esta en `@Controller('health')`. La URL correcta es:

```
http://localhost:3006/api/v1/health
```

El health check **siempre falla** con la URL actual `/api/health` (devuelve 404), lo que dispara rollback automatico innecesariamente. En la practica, esto significa que el script de deploy probablemente **nunca ha sido ejecutado exitosamente** con health checks habilitados.

**Otros problemas del health check:**
- Solo verifica el backend, no el frontend
- Timeout total: 15s (sleep) + 5 retries * 5s = 40 segundos maximo. Para un backend con 11 datasources, esto puede ser insuficiente
- No verifica que el backend realmente pueda servir requests (solo que responda en /api/health)
- No verifica conectividad a Redis
- El backend tiene endpoints mas detallados (`/health/ready`, `/health/live`) que no se usan

**Swagger check inadecuado:**
```bash
curl -s "http://localhost:${backend_port}/api/v1/docs"
```
En produccion, Swagger esta **deshabilitado** (segun CLAUDE.md), asi que este check siempre falla silenciosamente.

---

## 4. Mecanismo de Rollback

### 4.1 Rollback en `deploy-production.sh` (devops)

```bash
do_rollback() {
    # Restaurar backup de datos
    bash backup-production-data.sh --db-url "$DATABASE_URL" --restore "$backup_to_restore"

    # Reiniciar servicios
    pm2 restart all 2>/dev/null || true
}
```

**Limitaciones criticas:**

1. **No restaura el codigo anterior.** Solo restaura datos de backup. El `pm2 restart all` reinicia la version actual (la nueva, que puede ser la problematica).

2. **No hay versionamiento de builds.** No se guarda el `dist/` anterior antes de hacer build. Si el rollback se activa despues del build, no hay forma de volver al build anterior.

3. **`pm2 restart all` reinicia la version nueva**, no la anterior. Esto no es un rollback real del aplicativo.

4. **La restauracion de datos puede fallar silenciosamente.** El script de restore usa `|| true` en cada operacion SQL:
   ```bash
   psql "$DATABASE_URL" -f "$sql_file" > /dev/null 2>&1 || true
   ```

5. **No hay rollback de DDL/migraciones.** Si se ejecutaron migraciones SQL antes del fallo, no se deshacen.

### 4.2 `rollback-migration.sh` (database)

```bash
PGPASSWORD="${ROLLBACK_PASSWORD}" dropdb ... "${DB_NAME}"
PGPASSWORD="${ROLLBACK_PASSWORD}" createdb ... "${DB_NAME}"
gunzip -c "${BACKUP_FILE}" | pg_restore ...
```

**Este script DESTRUYE la base de datos completamente** (`dropdb` + `createdb` + `pg_restore`). Es un rollback nuclear que:
- Borra TODA la base de datos (no solo las tablas afectadas)
- Requiere backup completo en formato `pg_dump --format=custom`
- Usa `--no-owner --no-privileges` (pierde permisos RLS y grants)
- Requiere confirmacion interactiva (`read -p`) -- no funciona en scripts automatizados

### 4.3 `pre-deploy-backup.sh` (database)

Un script separado que hace `pg_dump` completo con:
- Formato custom + compresion nivel 9
- Retencion de 7 dias (borra backups antiguos)
- Validacion de tamano minimo (>1KB)
- Directorio default: `/var/backups/gamilit/`

**Este es el unico script que hace un backup completo** (full pg_dump), pero **NO es invocado** por el deploy principal (`deploy-production.sh` usa `backup-production-data.sh` que solo respalda tablas seleccionadas).

### 4.4 Evaluacion General del Rollback

| Aspecto | Estado | Detalle |
|---------|--------|---------|
| Rollback de datos | Parcial | Solo tablas seleccionadas, no full dump |
| Rollback de codigo | NO EXISTE | No se preserva build anterior |
| Rollback de DDL | NO EXISTE | Migraciones no son reversibles |
| Rollback de git | NO EXISTE | No se hace `git checkout` al commit anterior |
| Rollback automatico | ROTO | Health check URL incorrecta, siempre dispara rollback |
| Rollback manual | Funcional pero destructivo | `rollback-migration.sh` hace dropdb |
| Tiempo de rollback | ~2-5 min | Depende del tamano del backup |

---

## 5. CI/CD Pipeline

### 5.1 Workflows de GitHub Actions

| Workflow | Trigger | Rama | Tests Bloquean? |
|----------|---------|------|-----------------|
| `backend-ci.yml` | push + PR | `master` | lint+typecheck si, unit tests no (coverage continue-on-error) |
| `frontend-ci.yml` | push + PR | `master` | lint si, typecheck NO (continue-on-error), E2E NO |
| `deploy-production.yml` | push to `main` + tags v* + manual | `main` (NO master!) | N/A -- todo es echo/placeholder |
| `validate-api-routes.yml` | push + PR | `master/main/develop` | Si (verifica rutas API) |
| `validate-constants.yml` | push + PR | `main/develop` (NO master!) | Si |
| `validate-traceability.yml` | push + PR | `master/main/develop` | Si |

### 5.2 Hallazgos Criticos del CI/CD

**H-CI-01: Deploy workflow trigger INCORRECTO.**
`deploy-production.yml` se activa en push a `main`, pero el proyecto usa rama `master`. El workflow de deploy **nunca se ejecuta automaticamente**.

**H-CI-02: Deploy workflow es PLACEHOLDER.**
Los pasos de deploy son todos `echo` statements:
```yaml
run: |
  echo "Deploying frontend to production..."
  echo "This would deploy to your hosting provider"
```
No hay deployment real en CI/CD. El deploy se hace manualmente via SSH al servidor.

**H-CI-03: Backend build usa `continue-on-error: true`.**
```yaml
- name: Build for production
  run: npm run build || echo "Build with known TypeScript errors"
  continue-on-error: true
```
El build del backend puede fallar y el workflow sigue adelante. Esto invalida toda la pipeline de CI.

**H-CI-04: Frontend TypeScript check usa `continue-on-error: true`.**
```yaml
- name: Run TypeScript type check
  run: npm run type-check || echo "TypeScript errors exist..."
  continue-on-error: true
```

**H-CI-05: `validate-constants.yml` no se activa en `master`.**
Configurado para `main/develop` pero el proyecto usa `master`.

**H-CI-06: Node version inconsistente.**
- `backend-ci.yml`: Node 20
- `frontend-ci.yml`: Node 20
- `deploy-production.yml`: **Node 18** (desactualizado)

**H-CI-07: CI no gatilla el deploy.**
No hay conexion entre CI exitoso y deploy. El deploy se hace manualmente SSH al servidor, ejecutando scripts locales.

**H-CI-08: Database validation es superficial.**
Solo cuenta archivos SQL y busca la cadena literal "syntax error" en archivos (nunca presente). No ejecuta los DDL contra PostgreSQL para validar.

---

## 6. Monitoreo Post-Deploy

### 6.1 Scripts de Monitoreo SQL

Se encontraron 5 scripts en `apps/database/scripts/monitoring/`:

| Script | Proposito |
|--------|-----------|
| `check-connections.sql` | Conexiones activas, idle, idle-in-transaction |
| `check-slow-queries.sql` | Top 20 queries mas lentas (requiere pg_stat_statements) |
| `check-vacuum.sql` | Tablas con dead tuples que necesitan vacuum |
| `check-bloat.sql` | Table/index bloat >10MB |
| `check-locks.sql` | Locks bloqueantes activos |

**Integracion con deploy: NINGUNA.**

Estos scripts:
- No se ejecutan automaticamente post-deploy
- No se ejecutan en CI
- No estan referenciados desde ningun script de deploy
- Son puramente manuales (ejecutar via psql)
- No tienen alertas ni thresholds definidos
- No hay cron jobs configurados para ejecutarlos periodicamente

### 6.2 Health Endpoint del Backend

El backend tiene un health module robusto con:
- `GET /api/v1/health` -- check completo (DB + tablas criticas)
- `GET /api/v1/health/live` -- liveness probe
- `GET /api/v1/health/ready` -- readiness probe (DB + Redis)
- `GET /api/v1/health/metrics` -- metricas Prometheus

**Ninguno de estos se usa en el deploy script** (URL incorrecta) ni hay monitoring externo configurado.

---

## 7. Configuracion de Produccion (`prod.conf`)

### 7.1 Thresholds de Validacion

| Parametro | Valor Configurado | Valor Real (DDL) | Gap |
|-----------|-------------------|-------------------|-----|
| `ENV_MIN_SCHEMAS` | 9 | 18 (16 activos) | **Umbral muy bajo (50%)** |
| `ENV_MIN_TABLES` | 64 | 169 | **Umbral muy bajo (38%)** |
| `ENV_MIN_FUNCTIONS` | 60 | 183 (DDL) / 249 (runtime) | **Umbral muy bajo (33%)** |
| `ENV_MIN_TRIGGERS` | 50 | 67 | Aceptable (75%) |
| `ENV_MIN_RLS_POLICIES` | 200 | 227 (DDL) / 467 (runtime) | Aceptable para DDL |
| `ENV_MIN_INDEXES` | 250 | No documentado | Sin referencia |

Los thresholds de tablas y funciones son peligrosamente bajos. Una base de datos con solo 64 tablas (de 169 esperadas) pasaria la validacion, lo que significaria que ~100 tablas podrian faltar sin alarma.

### 7.2 Seguridad

- Password minimo 32 caracteres (adecuado)
- Generacion automatica de passwords
- Guardado encriptado de credenciales
- Demo data deshabilitado (correcto para prod)
- Seed errors bloquean (correcto: `ENV_FAIL_ON_SEED_ERROR=true`)

---

## 8. Calculo de Downtime

```
Escenario: Deploy normal sin errores

1. pm2 stop all                              =  ~2s
2. npm ci backend (con cache)                =  ~30-60s
3. npm run build backend                     =  ~30-60s
4. npm ci frontend (con cache)               =  ~20-40s
5. npm run build:prod frontend               =  ~30-60s
6. pm2 startOrRestart                        =  ~5s
7. sleep 15 (health check wait)              =  15s
8. Health check retries (best case)          =  ~5s
                                               --------
TOTAL DOWNTIME ESTIMADO:                      2-4 minutos

Escenario: Deploy con npm install from scratch (no cache)
TOTAL DOWNTIME ESTIMADO:                      5-10 minutos
```

**Nota:** `update-production.sh` (scripts/) tiene un downtime aun mayor porque **recrea la BD completa** como parte del deploy.

---

## 9. Lista de Gaps Ordenados por Severidad

### CRITICO (Bloquea deploy confiable)

| # | Gap | Impacto | Archivo |
|---|-----|---------|---------|
| G-01 | **Health check URL incorrecta** (`/api/health` vs `/api/v1/health`) | Rollback automatico siempre se dispara, o health check nunca se ha usado | `apps/devops/scripts/deploy-production.sh:434` |
| G-02 | **Tests no bloquean deploy** -- fallos solo generan warnings | Codigo con tests fallidos puede llegar a produccion | `apps/devops/scripts/deploy-production.sh:229,237` |
| G-03 | **`pm2 stop all` causa downtime total** antes de build | 2-10 minutos de indisponibilidad por deploy | `apps/devops/scripts/deploy-production.sh:399` |
| G-04 | **Rollback no restaura codigo anterior** -- solo datos parciales | Rollback incompleto, servicio reinicia con version nueva (problematica) | `apps/devops/scripts/deploy-production.sh:465-496` |
| G-05 | **CI deploy workflow apunta a `main` en vez de `master`** | Deploy automatico nunca se ejecuta | `.github/workflows/deploy-production.yml:6` |

### ALTO (Riesgo significativo)

| # | Gap | Impacto | Archivo |
|---|-----|---------|---------|
| G-06 | **Backend build en CI usa `continue-on-error: true`** | Build fallido no bloquea pipeline de CI | `.github/workflows/deploy-production.yml:134` |
| G-07 | **Multiples scripts de deploy sin claridad sobre el oficial** | Confusion operativa, posibilidad de usar script inadecuado | `scripts/`, `apps/devops/scripts/` |
| G-08 | **`process.send('ready')` faltante en main.ts** | PM2 `wait_ready` espera timeout en vez de signal real | `apps/backend/src/main.ts`, `ecosystem.config.js:79` |
| G-09 | **Backup parcial (no full dump) antes de deploy** | Datos de tablas no cubiertas se pierden irreversiblemente en rollback | `apps/devops/scripts/backup-production-data.sh` |
| G-10 | **Frontend usa `vite preview` en produccion** | No production-grade, sin optimizaciones de servidor web | `ecosystem.config.js:92` |
| G-11 | **Thresholds de validacion demasiado bajos** (tablas: 64/169 = 38%) | BD corrupta/incompleta pasa validacion | `apps/database/scripts/config/prod.conf:55` |

### MEDIO (Mejora necesaria)

| # | Gap | Impacto | Archivo |
|---|-----|---------|---------|
| G-12 | **No hay lock file para prevenir deploys concurrentes** | Dos personas pueden desplegar simultaneamente | `apps/devops/scripts/deploy-production.sh` |
| G-13 | **No hay verificacion de espacio en disco** | Deploy puede fallar a medio camino si disco esta lleno | `apps/devops/scripts/deploy-production.sh` |
| G-14 | **Monitoreo SQL no integrado en deploy ni en cron** | Problemas de BD no se detectan post-deploy | `apps/database/scripts/monitoring/` |
| G-15 | **Node version inconsistente entre CI workflows** (18 vs 20) | Comportamiento diferente en CI vs produccion | `.github/workflows/deploy-production.yml:22` |
| G-16 | **`validate-constants.yml` no se activa en `master`** | Validacion de constantes nunca se ejecuta en la rama principal | `.github/workflows/validate-constants.yml:9` |
| G-17 | **`read -p` interactivo en scripts** (rama check, rollback confirm) | Scripts no funcionan en ejecucion automatica/CI | Multiples scripts |
| G-18 | **Restauracion SQL swallows errors** (`|| true` en cada psql) | Rollback puede fallar silenciosamente | `apps/devops/scripts/backup-production-data.sh:353` |
| G-19 | **`rollback-migration.sh` usa `dropdb`** | Rollback destructivo, borra toda la BD incluyendo datos post-backup | `apps/database/scripts/rollback-migration.sh:56` |
| G-20 | **PM2 `env_file` no es opcion nativa** | Campo ignorado, variables se cargan por otro mecanismo | `ecosystem.config.js:65,114` |

### BAJO (Mejora recomendada)

| # | Gap | Impacto | Archivo |
|---|-----|---------|---------|
| G-21 | **Sin notificaciones de deploy** (Slack, email, etc.) | Equipo no se entera de deploys exitosos/fallidos | N/A |
| G-22 | **Sin smoke tests post-deploy** | Solo health check basico, no valida funcionalidad | `apps/devops/scripts/deploy-production.sh` |
| G-23 | **Logs no rotan** (PM2 log files crecen indefinidamente) | Disco se llena con el tiempo | `ecosystem.config.js:68-70` |
| G-24 | **Sin blue-green o canary deployment** | Todo-o-nada, sin capacidad de rollback gradual | Arquitectura |
| G-25 | **Swagger check en prod verifica endpoint deshabilitado** | Linea 451 verifica /api/v1/docs que esta deshabilitado en prod | `apps/devops/scripts/deploy-production.sh:451` |

---

## 10. Recomendaciones de Mejora

### Prioridad 1: Correcciones Inmediatas (1-2 dias)

**R-01: Corregir URL de health check**
```bash
# ANTES (incorrecto):
curl -s "http://localhost:${backend_port}/api/health"

# DESPUES (correcto):
curl -s "http://localhost:${backend_port}/api/v1/health"
```

**R-02: Hacer que tests bloqueen el deploy**
```bash
# ANTES:
print_warning "Tests de backend fallaron (continuando con advertencia)"

# DESPUES:
print_error "Tests de backend fallaron - ABORTANDO DEPLOY"
do_rollback
exit 1
```

**R-03: Corregir branch en `deploy-production.yml`**
```yaml
# ANTES:
branches:
  - main

# DESPUES:
branches:
  - master
```

**R-04: Eliminar `continue-on-error` del backend build en CI**

**R-05: Agregar `process.send('ready')` en `main.ts`**
```typescript
// Al final de bootstrap(), antes del listen:
await app.listen(port);
if (process.send) {
  process.send('ready');
}
```

### Prioridad 2: Reducir Downtime (1 semana)

**R-06: Build antes de stop**
Reordenar el deploy para hacer npm ci + build ANTES de detener servicios:
```
1. git pull
2. npm ci + npm run build (mientras servicios antiguos siguen corriendo)
3. pm2 stop all
4. pm2 start (con build nuevo ya listo)
```
Esto reduce downtime de 2-10 minutos a ~20 segundos.

**R-07: Considerar cluster mode para zero-downtime**
Cambiar `exec_mode: 'cluster'` con `instances: 2` para el backend permite `pm2 reload` sin downtime. Requiere validar que el backend es stateless (no guarda sesiones en memoria).

**R-08: Reemplazar `vite preview` con Nginx para frontend**
Servir archivos estaticos directamente desde Nginx (que ya esta instalado para SSL). Elimina un proceso PM2 innecesario.

### Prioridad 3: Rollback Robusto (2 semanas)

**R-09: Preservar build anterior**
```bash
# Antes de nuevo build:
cp -r apps/backend/dist apps/backend/dist.backup
cp -r apps/frontend/dist apps/frontend/dist.backup
```

**R-10: Full pg_dump antes de deploy**
Usar `pre-deploy-backup.sh` en vez de `backup-production-data.sh` para tener backup completo.

**R-11: Rollback de codigo funcional**
```bash
do_rollback() {
    # Restaurar builds anteriores
    mv apps/backend/dist.backup apps/backend/dist
    mv apps/frontend/dist.backup apps/frontend/dist
    # Restaurar datos
    bash pre-deploy-backup.sh --restore "$BACKUP_FILE"
    # Reiniciar con version anterior
    pm2 restart all
}
```

### Prioridad 4: CI/CD Completo (1 mes)

**R-12: Conectar CI con deploy**
Implementar deploy real en GitHub Actions usando SSH action o self-hosted runner.

**R-13: Consolidar scripts de deploy**
Eliminar scripts duplicados, mantener solo `apps/devops/scripts/deploy-production.sh` como SSOT.

**R-14: Integrar monitoreo post-deploy**
Ejecutar scripts de monitoring SQL automaticamente despues de cada deploy y alertar si hay anomalias.

**R-15: Agregar deploy lock**
```bash
LOCK_FILE="/tmp/gamilit-deploy.lock"
if [ -f "$LOCK_FILE" ]; then
    print_error "Deploy already in progress (lock: $LOCK_FILE)"
    exit 1
fi
echo "$$" > "$LOCK_FILE"
trap "rm -f $LOCK_FILE" EXIT
```

---

## 11. Diagrama de Estado Actual vs Deseado

### Estado Actual
```
Developer --> git push master
                  |
          GitHub Actions CI
          (lint, build, tests)     <-- Parcialmente funcional
          (deploy = placeholder)   <-- NO funciona
                  |
          SSH manual al servidor
                  |
          ./deploy-production.sh   <-- Downtime, health check roto
                  |
          pm2 stop all             <-- 2-10 min downtime
          npm ci + build
          pm2 start
          curl /api/health         <-- URL incorrecta
                  |
          "Esperamos que funcione"  <-- Sin monitoreo
```

### Estado Deseado
```
Developer --> git push master
                  |
          GitHub Actions CI
          (lint, typecheck, tests, build)  <-- Todo debe pasar
                  |
          Automatico: SSH deploy
                  |
          Lock check + pre-deploy backup (full)
                  |
          npm ci + build (SIN detener servicios)
                  |
          pm2 reload (zero-downtime, cluster mode)
                  |
          Health check (/api/v1/health/ready)
          Smoke tests (login, endpoint basico)
                  |
          Notificacion (Slack/email)
                  |
          Monitoreo continuo (connections, slow queries, errors)
                  |
          Rollback automatico si metricas degradan
```

---

## 12. Conclusion

El pipeline de deploy actual tiene **deficiencias criticas** que comprometen la confiabilidad del proceso:

1. **El health check nunca funciona** (URL incorrecta), lo que significa que el deploy principal probablemente nunca se ha ejecutado end-to-end exitosamente, o se ha usado con `--skip-tests` y sin health checks.

2. **No hay zero-downtime deployment.** Cada deploy causa 2-10 minutos de indisponibilidad.

3. **El rollback es incompleto.** No restaura el codigo anterior, solo datos parciales. El servicio se reinicia con la version nueva (problematica).

4. **CI/CD es decorativo.** Los workflows de deploy son placeholder, builds y tests pueden fallar sin bloquear, y la rama principal (`master`) no coincide con la configurada en varios workflows (`main`).

5. **La operacion real es manual** -- SSH al servidor, ejecutar scripts. No hay automatizacion end-to-end.

El sistema funciona en produccion porque el equipo probablemente usa `scripts/update-production.sh` o `scripts/deploy-production.sh` (scripts mas simples) en lugar del script principal documentado, y porque los deploys son poco frecuentes y supervisados manualmente.

**Riesgo general: ALTO.** Un deploy desatendido o un rollback automatico tienen alta probabilidad de fallar o dejar el sistema en estado inconsistente.
