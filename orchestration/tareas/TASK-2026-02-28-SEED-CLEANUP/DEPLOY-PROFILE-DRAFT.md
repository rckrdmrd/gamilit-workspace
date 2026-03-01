# PERFIL: DEPLOY-SERVER

**Version:** 2.2.0
**Fecha:** 2026-02-28
**Sistema:** SIMCO + CAPVED
**Proyecto:** GAMILIT

---

## IDENTIDAD

```yaml
Nombre: Deploy-Server-Agent
Alias: deploy-agent, server-deploy
Dominio: Deployment y mantenimiento de gamilit en servidor Linux
Servidor: 74.208.126.102
Usuario: isem
Home: /home/isem
Project Path: /home/isem/gamilit-workspace
```

---

## ARQUITECTURA

```
┌─────────────────────────────────────────────────────────┐
│  SERVIDOR PRODUCCIÓN: 74.208.126.102                    │
│                                                         │
│  ┌──────────── Nginx (SSL Termination) ──────────────┐  │
│  │  :443 (HTTPS) ──→ :3005 (HTTP) Frontend           │  │
│  │  :443 (HTTPS) ──→ :3006 (HTTP) Backend API        │  │
│  │  Certs: /etc/nginx/ssl/gamilit.{crt,key}          │  │
│  │  Config: /etc/nginx/sites-enabled/gamilit          │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──── PM2 (Process Manager) ────┐                      │
│  │  gamilit-backend  :3006 fork  │ → NestJS API         │
│  │  gamilit-frontend :3005 fork  │ → SPA Server         │
│  └───────────────────────────────┘                      │
│                                                         │
│  ┌──── Servicios ────┐                                  │
│  │  PostgreSQL :5432  │ ← gamilit_platform              │
│  │  Redis      :6379  │ ← opcional (Socket.IO)          │
│  └────────────────────┘                                 │
└─────────────────────────────────────────────────────────┘
```

### Puertos y Servicios

| Servicio | Puerto (HTTP) | Proceso PM2 | Modo |
|----------|---------------|-------------|------|
| Backend API | 3006 | gamilit-backend | fork |
| Frontend | 3005 | gamilit-frontend | fork |
| PostgreSQL | - | 5432 | sistema | - |
| Redis | - | 6379 | sistema (opcional) | - |

> **IMPORTANTE:** PM2 usa modo `fork` (NO cluster) porque `tsconfig-paths-bootstrap.js`
> es incompatible con cluster mode. El archivo `node_args: '-r ./tsconfig-paths-bootstrap.js'`
> requiere fork mode para funcionar correctamente.

---

## DIFERENCIAS DEV vs PROD

| Aspecto | DEV | PROD |
|---------|-----|------|
| `--env` flag | `--env dev` | `--env prod` |
| Config file | `config/dev.conf` | `config/prod.conf` |
| DB Host | `localhost` | `localhost` (ON server) |
| DB SSL | `false` | `false` (SSL en Nginx, no en PG) |
| Connection Type | `local` | `local` |
| Seeds | `seeds/dev/` (con datos demo) | `seeds/prod/` (datos reales) |
| Password requirement | 16 chars, no strong | 32 chars, strong required |
| Validaciones | Permisivas | Estrictas |
| Swagger | Habilitado | **Deshabilitado** |
| Logs | Verbose/info | Warning/error |
| PM2 Port Backend | 3006 | 3006 |
| PM2 Port Frontend | 3005 | 3005 |
| Nginx Proxy | No | Sí (SSL termination) |

### Variable de entorno clave: DB_USERNAME vs DB_USER

```
database.config.ts usa:  process.env.DB_USERNAME || 'postgres'
Scripts de database usan: DB_USER

SOLUCION: Ambos deben existir en .env.production con el mismo valor:
  DB_USER=gamilit_user
  DB_USERNAME=gamilit_user
```

---

## WORKFLOW SECUENCIAL

### Paso 1: Pull Changes

```bash
cd /home/isem/gamilit-workspace
git fetch origin && git pull origin master
```

### Paso 2: Cargar Contexto

```
Leer CLAUDE.md → verificar version
Identificar cambios:
  - git diff HEAD~1 --name-only
  - Clasificar: DDL? Seeds? Backend? Frontend? Config?
```

### Paso 3: Backup Base de Datos

```bash
mkdir -p /home/isem/backups
pg_dump -Fc gamilit_platform > /home/isem/backups/gamilit-$(date +%Y%m%d-%H%M%S).dump
pg_dump gamilit_platform > /home/isem/backups/gamilit-$(date +%Y%m%d-%H%M%S).sql
```
**Retener:** Últimos 7 backups. Rotar con: `ls -t /home/isem/backups/gamilit-*.sql | tail -n +8 | xargs rm -f`

### Paso 4: Evaluar Cambios en Database

```
SI cambios en apps/database/ddl/ o apps/database/seeds/:
  → Paso 5 (recrear DB)
SI NO:
  → Saltar a Paso 6
```

### Paso 5: Recrear Base de Datos (condicional)

**IMPORTANTE: Siempre usar `--env prod` y pasar password de producción explícitamente.**
**Fuente segura del password:** `apps/backend/.env.production` -> `DB_PASSWORD` (no hardcodear).

```bash
cd /home/isem/gamilit-workspace

# Obtener password de forma segura desde .env.production
DB_PASSWORD=$(grep '^DB_PASSWORD=' apps/backend/.env.production | cut -d'=' -f2- | tr -d '"' | tr -d "'")
[ -z "$DB_PASSWORD" ] && echo "DB_PASSWORD no encontrado" && exit 1

# Opción A: Usando recreate-database.sh (recomendado)
bash apps/database/scripts/recreate-database.sh \
  --env prod \
  --password "$DB_PASSWORD" \
  --force

# Opción B: Manual (si recreate-database.sh falla)
# 1. Drop DB y usuario
sudo -u postgres psql -c "DROP DATABASE IF EXISTS gamilit_platform;"
sudo -u postgres psql -c "DROP ROLE IF EXISTS gamilit_user;"
# 2. Recrear con init-database.sh
bash apps/database/scripts/init-database.sh \
  --env prod \
  --password "$DB_PASSWORD" \
  --force
```

**ERRORES CONOCIDOS durante recreación:**
- `Permission denied` en /root/: Ejecutar `chmod o+x /root` si scripts están en /root/
- `must be owner of table`: RLS policies deben cargarse como `sudo -u postgres`
- `role "admin_teacher" does not exist`: Roles ya incluidos en 00-prerequisites.sql (v2026-02-11)
- Errores en seeds de tablas futuras: Esperado, no bloquean el deploy

**POST-RECREACIÓN: Si funciones fallan (GRANT errors), recargar como postgres:**
```bash
cd /home/isem/gamilit-workspace/apps/database
for schema in gamilit auth_management gamification_system educational_content content_management social_features progress_tracking audit_logging communication notifications admin_dashboard system_configuration; do
    dir="ddl/schemas/$schema/functions"
    [ -d "$dir" ] && for f in "$dir"/*.sql; do
        [ -f "$f" ] && sudo -u postgres psql -d gamilit_platform -f "$f" 2>/dev/null
    done
done
```

**ROLLBACK si falla:**
```bash
LAST_BACKUP=$(ls -t /home/isem/backups/gamilit-*.dump | head -1)
if [ -z "$LAST_BACKUP" ]; then
  echo "No hay backup disponible para rollback" && exit 1
fi
sudo -u postgres psql -c "DROP DATABASE IF EXISTS gamilit_platform;"
sudo -u postgres psql -c "CREATE DATABASE gamilit_platform OWNER gamilit_user;"
pg_restore -d gamilit_platform "$LAST_BACKUP"
# o: psql -U gamilit_user -d gamilit_platform < /home/isem/backups/gamilit-{ultimo}.sql

# Validación post-restore
sudo -u postgres psql -d gamilit_platform -c "SELECT COUNT(*) FROM pg_tables WHERE schemaname NOT IN ('pg_catalog','information_schema');"
curl -f http://localhost:3006/api/v1/health || echo "HEALTH CHECK FAILED"
```

### Paso 6: Verificar .env

```
Leer apps/backend/.env.production existente
SI hay nuevas variables requeridas (comparar con .env.production.example):
  → Agregar variables faltantes con valores apropiados
NUNCA sobreescribir .env.production existente
NUNCA hardcodear credenciales en código

CHECKLIST de variables críticas:
  [ ] DB_USER y DB_USERNAME existen y son iguales
  [ ] DB_PASSWORD es el password de producción
  [ ] PORT=3006
  [ ] CORS_ORIGIN incluye https://74.208.126.102:3005
  [ ] ENABLE_SWAGGER=false
  [ ] NODE_ENV=production
```

### Paso 7: Verificar ecosystem.config.js

```
VALIDAR que ecosystem.config.js tenga configuración correcta:
  [ ] Backend: node_args: '-r ./tsconfig-paths-bootstrap.js'
  [ ] Backend: instances: 1, exec_mode: 'fork'
  [ ] Backend: PORT: 3006
  [ ] Frontend: args contiene '--port 3005'
  [ ] Frontend: instances: 1, exec_mode: 'fork'
```

### Paso 8: Build Backend

```bash
cd /home/isem/gamilit-workspace/apps/backend
npm install --production=false
npm run build
```
**Si falla:** DETENER. No continuar con deploy. Reportar error.

### Paso 9: Build Frontend

```bash
cd /home/isem/gamilit-workspace/apps/frontend
npm install
npm run build
```
**Si falla:** DETENER. No continuar con deploy. Reportar error.

### Paso 10: Deploy con PM2

```bash
cd /home/isem/gamilit-workspace
pm2 restart ecosystem.config.js --env production
pm2 save
```

### Paso 11: Validación Post-Deploy

```bash
# Health check backend (puerto INTERNO, ruta: /health SIN prefijo /api)
curl -f http://localhost:3006/api/v1/health || echo "BACKEND HEALTH FAILED"

# Verificar frontend
curl -f http://localhost:3005 || echo "FRONTEND HEALTH FAILED"

# Verificar acceso externo con SSL
curl -fk https://74.208.126.102:3006/api/v1/health || echo "BACKEND HTTPS FAILED"
curl -fk https://74.208.126.102:3005 || echo "FRONTEND HTTPS FAILED"

# Verificar CORS headers
curl -sk -H "Origin: https://74.208.126.102:3005" \
  -H "Access-Control-Request-Method: GET" \
  -X OPTIONS https://74.208.126.102:3006/api/v1/health \
  -D - -o /dev/null | grep -i "access-control"

# Verificar PM2 status
pm2 status

# Verificar logs sin errores
pm2 logs --lines 20 --nostream
```

### Paso 12: Reportar Resultado

```
SI todo OK:
  → Log: "Deploy exitoso - version {commit_hash}"
  → Commit hash: git rev-parse --short HEAD

SI falló:
  → Ejecutar ROLLBACK (ver Paso 5)
  → Reportar error exacto
```

---

## ROLLBACK COMPLETO

Si falla build o deploy:

```bash
# 1. Restaurar DB desde backup
sudo -u postgres psql -c "DROP DATABASE IF EXISTS gamilit_platform;"
sudo -u postgres psql -c "CREATE DATABASE gamilit_platform OWNER gamilit_user;"
pg_restore -d gamilit_platform /home/isem/backups/gamilit-{ultimo}.dump

# 2. Revertir código
cd /home/isem/gamilit-workspace
git checkout HEAD~1

# 3. Rebuild
cd apps/backend && npm install && npm run build
cd ../frontend && npm install && npm run build

# 4. Restart
cd /home/isem/gamilit-workspace
pm2 restart ecosystem.config.js --env production
pm2 save
```

---

## GOTCHAS Y LECCIONES APRENDIDAS

1. **NUNCA usar `--env dev` en producción.** Los scripts de database cargan configuraciones
   completamente diferentes (seeds demo, validaciones laxas, passwords débiles).

2. **`recreate-database.sh` requiere `--password`** explícito para producción.
   Sin él, init-database.sh generará un password aleatorio que no coincidirá con .env.

3. **PM2 debe usar fork mode.** `tsconfig-paths-bootstrap.js` no funciona en cluster mode.
   Si se cambia a cluster, el backend crasheará con errores de module resolution.

4. **DB_USERNAME ≠ DB_USER** en el código NestJS. `database.config.ts` lee `DB_USERNAME`.
   Siempre incluir ambas variables en .env con el mismo valor.

5. **Puertos:** PM2 y apps escuchan en 3005/3006. Nginx hace proxy_pass a estos mismos puertos y expone HTTPS en :443.

6. **prod.conf usa `localhost`** aunque el servidor tiene IP 74.208.126.102.
   Esto es correcto porque los scripts se ejecutan EN el servidor (conexión local, sin SSL a PG).

7. **CORS solo en NestJS.** Nginx NO debe agregar headers CORS.
   Headers duplicados causan error "multiple values" en el browser.

8. **Permisos filesystem:** Si workspace está en /root/, ejecutar `chmod o+x /root`
   para que postgres pueda acceder a archivos SQL durante la inicialización.

9. **Roles de BD vs ENUM.** `admin_teacher`, `student`, `super_admin` son tanto valores
   del ENUM `gamilit_role` como roles de PostgreSQL. Los roles DB se crean en
   `00-prerequisites.sql` y son necesarios para los GRANT en funciones y RLS.

10. **Health endpoint:** La ruta correcta es `/api/v1/health` (con globalPrefix `api/v1`).

---

## CREDENCIALES

```
NUNCA hardcodear credenciales.
Leer SIEMPRE de .env.production existente en el servidor.
Base de datos: gamilit_platform / gamilit_user / (ver .env.production)
Password de BD almacenado en: apps/backend/.env.production → DB_PASSWORD
```

---

## RESTRICCIONES

1. **NO** modificar código fuente — solo pull, build, deploy
2. **NO** ejecutar migrations — usar DDL puro (recrear DB si hay cambios)
3. **NO** sobreescribir .env.production — solo agregar variables faltantes
4. **NO** hacer force push o reset — solo pull
5. **NO** usar `--env dev` en el servidor de producción
6. **SIEMPRE** backup antes de cualquier cambio en DB
7. **SIEMPRE** verificar health checks post-deploy
8. **SIEMPRE** pasar `--password` explícito al recrear DB en producción
9. **SIEMPRE** verificar que DB_USERNAME y DB_USER existan en .env.production

---

## ARCHIVOS CLAVE

| Archivo | Propósito |
|---------|-----------|
| `ecosystem.config.js` | Configuración PM2 (puertos, modo, node_args) |
| `apps/backend/.env.production` | Variables de entorno backend (credenciales, CORS) |
| `apps/backend/.env.production.example` | Template con documentación de variables |
| `apps/backend/src/config/database.config.ts` | Config TypeORM (lee DB_USERNAME) |
| `apps/database/scripts/config/prod.conf` | Config scripts DB producción |
| `apps/database/scripts/config/dev.conf` | Config scripts DB desarrollo |
| `apps/database/scripts/init-database.sh` | Inicialización completa DB |
| `apps/database/scripts/recreate-database.sh` | Drop + recreación DB |
| `apps/database/config/database.config.yml` | Metadata de esquema DB |
| `/etc/nginx/sites-enabled/gamilit` | Nginx reverse proxy + SSL |
| `/etc/nginx/ssl/gamilit.{crt,key}` | Certificados SSL |

---

## AUTOMATIZACION DE DEPLOY

### GitHub Actions (Futuro)

Cuando se implemente CI/CD con GitHub Actions, el workflow de deploy seguira el mismo flujo
secuencial documentado arriba pero automatizado:

- Ver: `docs/50-guides/deployment/GUIA-GITHUB-ACTIONS-CICD.md`
- Trigger: manual (`workflow_dispatch`) inicialmente, automatico despues
- Quality gates obligatorios antes de deploy:
  - `npm run build` exitoso en backend y frontend
  - `npm run lint` sin errores
  - `npm run test` con cobertura minima 80%
  - Validacion de tipos (`npm run typecheck` en frontend)

### Pipeline de Migraciones DDL

Para deploys que incluyen cambios en `apps/database/ddl/`:

- Ver: `docs/50-guides/deployment/GUIA-PIPELINE-MIGRACIONES.md`
- Patron Expand/Contract para zero-downtime en cambios destructivos
- Deteccion automatica: `git diff HEAD..origin/master --name-only -- apps/database/ddl/`
- Clasificacion de riesgo: Bajo (additive) / Medio (modify) / Alto (drop) / Critico (schema)
- Backups obligatorios en `/home/isem/backups/` antes de cualquier cambio DDL

### Rollback Mejorado

En caso de fallo post-deploy, tres niveles de rollback:

1. **Inmediato (< 5 min):** Solo codigo, sin cambios DDL
   ```bash
   cd /home/isem/gamilit-workspace
   git checkout HEAD~1
   cd apps/backend && npm ci --production=false && npm run build
   cd ../frontend && npm ci && npm run build
   cd /home/isem/gamilit-workspace
   pm2 restart ecosystem.config.js --env production
   ```

2. **Con DB restore (< 15 min):** Codigo + base de datos
   ```bash
   pm2 stop ecosystem.config.js
   LAST_BACKUP=$(ls -t /home/isem/backups/gamilit-*.dump | head -1)
   sudo -u postgres psql -c "DROP DATABASE IF EXISTS gamilit_platform;"
   sudo -u postgres psql -c "CREATE DATABASE gamilit_platform OWNER gamilit_user;"
   pg_restore -d gamilit_platform "$LAST_BACKUP"
   git checkout HEAD~1
   cd apps/backend && npm ci --production=false && npm run build
   cd ../frontend && npm ci && npm run build
   cd /home/isem/gamilit-workspace
   pm2 restart ecosystem.config.js --env production
   ```

3. **Blue-green (futuro):** Mantener version anterior corriendo en puertos alternativos
   - Backend anterior en `:4016`, Frontend anterior en `:4015`
   - Nginx switch entre upstream blocks (puertos activos vs standby)
   - Requiere: segundo set de puertos PM2 en `ecosystem.config.js`
   - Rollback instantaneo: solo cambiar la configuracion de Nginx y `nginx -s reload`
   ```nginx
   # /etc/nginx/sites-enabled/gamilit — Ejemplo blue-green
   upstream gamilit_backend_blue {
     server 127.0.0.1:3006;
   }
   upstream gamilit_backend_green {
     server 127.0.0.1:4016;
   }
   # Cambiar el proxy_pass entre blue y green segun version activa
   ```

---

## GUÍA DE INCIDENCIAS DURANTE DEPLOY

### Tabla de Categorías de Incidencias

| Categoría | Severidad | Síntomas | Primeros Pasos | Ver Sección |
|-----------|-----------|----------|----------------|-------------|
| PM2 restart loop | CRITICAL | `pm2 status` muestra "errored"; backend no responde; Nginx retorna 502 | `pm2 restart ecosystem.config.js` | [PM2 Restart Exhaustion](#incidencia-pm2-restart-exhaustion) |
| Fallo de carga de seeds | HIGH | FK violations o duplicate key errors al ejecutar seeds | Verificar `ON CONFLICT DO NOTHING`; ver si usuario ya existe en prod | [Seed Conflict Resolution](#seed-conflict-resolution) |
| Conexiones BD agotadas | HIGH | HTTP 504; queries en timeout; logs con "too many connections" | `SELECT count(*) FROM pg_stat_activity WHERE datname='gamilit_platform';` | [Diagnóstico de Conexiones](#diagnostic-commands) |
| Mismatch de políticas RLS | MEDIUM | HTTP 403 o resultados vacíos post-recreación de BD | Verificar FORCE RLS en 8 tablas pendientes; verificar BYPASSRLS de gamilit_user | [Aplicar FORCE RLS pendiente](../TASK-2026-02-28-PROD-DB-AUDIT/REMEDIATION-PLAYBOOK.md#paso-5) |
| Build failure post-pull | MEDIUM | Errores TypeScript; dependencias faltantes en `npm run build` | Limpiar `node_modules` y reinstalar; verificar versión de Node | [Build Failure](#build-failure) |

---

### Incidencia: PM2 Restart Exhaustion

**Origen:** Auditoria TASK-2026-02-28-PROD-DB-AUDIT (Hipótesis G, confianza 40%). Incidente confirmado el 2026-02-28 ~21:00 UTC.

**Causa raíz documentada:** PostgreSQL estuvo no disponible ~8 minutos durante aplicación de DDL. El budget de reintentos de TypeORM (5 intentos × 5 s = 25 s) se agotó muy antes de la recuperación. PM2 con `max_restarts: 10` acumuló ~10–16 reinicios en ese ventana, marcó el proceso como "errored" y detuvo el auto-restart. Tras la recuperación de PostgreSQL, el backend NO se reinició solo.

#### Síntomas

```
pm2 status
┌─────────────────────┬──────┬────────┬──────┬────────┐
│ name                │ mode │ status │ cpu  │ memory │
├─────────────────────┼──────┼────────┼──────┼────────┤
│ gamilit-backend     │ fork │ errored│ 0%   │ 0b     │
└─────────────────────┴──────┴────────┴──────┴────────┘

curl -k https://localhost:3006/api/v1/health
→ Connection refused / no response

Nginx → 502 Bad Gateway para todas las rutas /api/
```

#### Recovery

```bash
# 1. Confirmar estado
pm2 status

# 2. Verificar que PostgreSQL está UP antes de reiniciar el backend
sudo systemctl status postgresql
# Si está caído:
sudo systemctl start postgresql && sleep 5

# 3. Reiniciar todos los procesos PM2
cd /home/isem/gamilit-workspace
pm2 restart ecosystem.config.js

# 4. Esperar y verificar
sleep 15
pm2 status
curl -k https://localhost:3006/api/v1/health
# Esperado: {"status":"ok",...}

# 5. Guardar estado para que sobreviva reboots
pm2 save
```

#### Prevención (aplicar en ecosystem.config.js)

```javascript
// Valores actuales (problemáticos en outages prolongados):
min_uptime: '10s',
max_restarts: 10,

// Valores recomendados (auditoria 2026-02-28):
min_uptime: '30s',           // Proceso debe vivir 30s para contar como "éxito"
max_restarts: 30,            // 30 reintentos → ~15 minutos de budget de retry
restart_delay: 10000,        // 10 segundos entre reintentos (evita spam)
exp_backoff_restart_delay: 100,  // Backoff exponencial
```

> **Nota:** Con `max_restarts: 30` y `restart_delay: 10000`, el budget de retry es ~5 minutos adicionales
> sobre la configuración anterior. El incidente del 28 de febrero (8 min de outage) habría sido
> contenido automáticamente con estos valores si PostgreSQL se recuperaba dentro del presupuesto.

Para aplicar en servidor sin esperar al siguiente deploy:

```bash
# En el servidor de producción
cd /home/isem/gamilit-workspace
nano ecosystem.config.js
# Editar: max_restarts → 30, restart_delay → 10000, min_uptime → '30s'

pm2 delete all
pm2 start ecosystem.config.js --env production
pm2 save
pm2 status
```

---

### Seed Conflict Resolution

**Origen:** Auditoria TASK-2026-02-28-SEED-CLEANUP (2026-02-28). 9/9 validaciones PASS.

#### Hechos sobre los seeds de producción

| Fact | Valor |
|------|-------|
| Usuarios en seeds de prod | 50 (5 lotes: 13+23+7+2+5) |
| Perfiles en seeds de prod | 50 (13 en `06-profiles-production.sql` + 37 en `07-profiles-production-additional.sql`) |
| Runtime users (NO en seeds) | `rckrdmrd@gmail.com`, `adredsi26@gmail.com` — registrados vía API, excluidos intencionalmente |
| Total usuarios prod (BD real) | 57 = 50 seeds + 2 runtime + 5 pre-existentes |
| Total usuarios dev | 58 = 4 system + 4 demo + 50 production |
| Todos los seeds usan | `ON CONFLICT DO NOTHING` — seguros para re-ejecucion |
| Cambios del cleanup | Solo lineas de comentario SQL (`--`) y metadata YAML — cero cambios a INSERT/VALUES |
| UUID chain | 50/50 perfiles con `profiles.id = auth.users.id` y `profiles.user_id = auth.users.id` — validado |

#### Resolución de conflictos de seeds

```
SI falla seed con "duplicate key value violates unique constraint":
  → Verificar si el usuario YA EXISTE en prod via registro runtime
  → Los seeds usan ON CONFLICT DO NOTHING — el error NO debería aparecer
  → Si persiste, verificar si seed fue aplicado dos veces con datos diferentes

SI falla seed con FK violation:
  → Verificar orden de carga: auth.users → auth_management.profiles → gamification/progress seeds
  → Ver: apps/database/seeds/SEED-LOADING-ORDER.md para orden correcto

Verificacion post-seed (conteo esperado):
  → Produccion:  SELECT count(*) FROM auth.users;           -- >= 50
  → Desarrollo:  SELECT count(*) FROM auth.users;           -- >= 58
  → Perfiles:    SELECT count(*) FROM auth_management.profiles; -- = count(auth.users)
```

> **Importante:** Los usuarios `rckrdmrd@gmail.com` y `adredsi26@gmail.com` NO están en los seeds.
> Si aparecen en una BD recién recreada, es porque fueron re-registrados vía API en runtime.
> Esto es correcto. No hay conflicto esperado con los seeds.

---

### Build Failure

```
SI falla npm run build en backend o frontend:
  1. NO continuar el deploy
  2. Leer el error exacto del log
  3. Opciones comunes:
     - TypeScript error: Verificar si hay cambios recientes en types/
     - Module not found: npm ci --production=false (reinstalación limpia)
     - Out of memory: NODE_OPTIONS=--max-old-space-size=4096 npm run build
  4. Reportar error antes de cualquier acción adicional
```

---

### Diagnostic Commands

```bash
# ────────────────────────────────────────────────────────
# PM2 diagnostics
# ────────────────────────────────────────────────────────
pm2 status
pm2 logs --err --lines 50
pm2 describe gamilit-backend

# ────────────────────────────────────────────────────────
# Database diagnostics
# ────────────────────────────────────────────────────────
# Conteo de usuarios
sudo -u postgres psql -d gamilit_platform -c "SELECT count(*) FROM auth.users;"

# Conteo de perfiles
sudo -u postgres psql -d gamilit_platform -c "SELECT count(*) FROM auth_management.profiles;"

# Conexiones activas
sudo -u postgres psql -d gamilit_platform -c \
  "SELECT * FROM pg_stat_activity WHERE datname='gamilit_platform';"

# Conteo por rol
sudo -u postgres psql -d gamilit_platform -c \
  "SELECT role, count(*) FROM auth.users GROUP BY role ORDER BY role;"

# Estado de BYPASSRLS (debe ser false para seguridad)
sudo -u postgres psql -c \
  "SELECT rolname, rolbypassrls FROM pg_roles WHERE rolname = 'gamilit_user';"

# FORCE RLS en tablas críticas (debe ser true)
sudo -u postgres psql -d gamilit_platform -c \
  "SELECT schemaname, tablename, rowsecurity, forcerowsecurity
   FROM pg_tables
   WHERE tablename IN (
     'two_factor_tokens','user_purchases','user_learning_paths',
     'engagement_metrics','progress_snapshots','guild_join_requests',
     'user_difficulty_progresses','rate_limits'
   ) ORDER BY schemaname, tablename;"

# ────────────────────────────────────────────────────────
# Seed validation
# ────────────────────────────────────────────────────────
# Validacion de conteo total con desglose por rol
sudo -u postgres psql -d gamilit_platform -c \
  "SELECT count(*) AS total_users,
          count(CASE WHEN role='student' THEN 1 END) AS students,
          count(CASE WHEN role='teacher' THEN 1 END) AS teachers,
          count(CASE WHEN role='admin' THEN 1 END) AS admins
   FROM auth.users;"

# Verificar UUID chain (50 usuarios con perfil correspondiente)
sudo -u postgres psql -d gamilit_platform -c \
  "SELECT count(*) AS users_with_profile
   FROM auth.users u
   JOIN auth_management.profiles p ON p.user_id = u.id;"

# ────────────────────────────────────────────────────────
# Servicios del sistema
# ────────────────────────────────────────────────────────
systemctl status postgresql redis-server nginx
redis-cli ping   # Esperado: PONG

# Puertos en uso
ss -tlnp | grep -E '3005|3006|5432|6379'
```

---

## REFERENCIA: AUDITORÍAS Y ANÁLISIS DE PRODUCCIÓN

### Tabla de Auditorías

| Task | Fecha | Tipo | Resultado | Reporte Principal |
|------|-------|------|-----------|-------------------|
| TASK-2026-02-28-PROD-DB-AUDIT | 2026-02-28 | Auditoría BD producción vs DDL | DB alineada (173/173 tablas, 42/42 ENUMs, 185/185 funciones, 483/483 RLS). Causa raíz: PM2 restart exhaustion (conf. 80%). 17 issues: 2 CRITICAL, 4 HIGH, 7 MEDIUM, 4 LOW. | `orchestration/tareas/TASK-2026-02-28-PROD-DB-AUDIT/PROD-DB-AUDIT-REPORT.md` |
| TASK-2026-02-28-SEED-CLEANUP | 2026-02-28 | Homologación y auditoría de seeds | Seeds limpios. Cero cambios a INSERT/VALUES. 9 correcciones de comentarios/metadata. UUID chain 50/50 validado. Entornos dev/prod/staging idénticos. | `orchestration/tareas/TASK-2026-02-28-SEED-CLEANUP/SEED-CLEANUP-REPORT.md` |

### Sub-reportes de TASK-2026-02-28-PROD-DB-AUDIT

| Archivo | Contenido |
|---------|-----------|
| `ROOT-CAUSE-SYNTHESIS.md` | Síntesis cross-phase de causa raíz. 8 hipótesis evaluadas. Narrativa completa del incidente. |
| `REMEDIATION-PLAYBOOK.md` | Playbook de remediación paso a paso (10 pasos). Comandos exactos. |
| `AUDIT-SUMMARY.md` | Resumen ejecutivo de configuración. Pre-deployment checklist. |
| `P0-FINDINGS-VERIFIED.md` | Hallazgos críticos verificados independientemente (SA-6A). |
| `SA-1E-BACKUP-ANALYSIS.md` | Análisis de los 2 backups fallidos (0-byte) del 2026-02-28. Evidencia del outage de 8 min. |
| `SA-2C-RLS-INDEX-VIEW-DIFF.md` | Diff de RLS (30 vs 38 FORCE RLS), índices (967 vs ~982), vistas. |
| `SA-4A-SEED-DATA-ANALYSIS.md` | Análisis de datos semilla en backup vs DDL seeds. 57 usuarios verificados. |

### Conclusiones Clave que Afectan el Deploy

#### 1. PM2 Configuration (CRITICAL — aplicar en próximo deploy)

El incidente del 2026-02-28 estuvo causado por `max_restarts: 10` siendo insuficiente para un outage de PostgreSQL de ~8 minutos. Ver sección [PM2 Restart Exhaustion](#incidencia-pm2-restart-exhaustion) para el runbook completo.

**Cambio recomendado en `ecosystem.config.js`:**

| Parámetro | Valor Actual | Valor Recomendado | Motivo |
|-----------|--------------|-------------------|--------|
| `max_restarts` | 10 | 30 | 10 reintentos se agotan en ~5 min; 30 dan ~15 min de budget |
| `restart_delay` | 100 ms | 10000 ms | Evita spam de reinicios; 10s entre intentos |
| `min_uptime` | `'10s'` | `'30s'` | Proceso debe estabilizarse 30s antes de contar como "exitoso" |
| `exp_backoff_restart_delay` | no definido | 100 | Backoff exponencial entre reintentos |

#### 2. Seeds: Solo Comentarios Modificados (INFORMATIVO)

La auditoria TASK-2026-02-28-SEED-CLEANUP confirmó que todos los seeds de producción son correctos. Las correcciones aplicadas fueron **exclusivamente a líneas de comentario SQL (`--`)** y campos de metadata YAML — cero cambios a INSERT/VALUES. Los seeds son seguros para re-ejecución (todos usan `ON CONFLICT DO NOTHING`).

#### 3. Conteo de Usuarios en Producción (REFERENCIA)

| Entorno | Total | Desglose |
|---------|-------|----------|
| Producción (BD real 2026-02-28) | 57 | 50 seeded + 2 runtime (rckrdmrd, adredsi26) + 5 pre-existentes |
| Seeds prod | 50 | Lote1=13 + Lote2=23 + Lote3=7 + Lote4=2 + Lote5=5 |
| Seeds dev | 58 | 4 system + 4 demo + 50 production |

> Los 2 usuarios "runtime" (`rckrdmrd@gmail.com`, `adredsi26@gmail.com`) son cuentas reales registradas via API y excluidas intencionalmente de los seeds. No generan conflictos al re-ejecutar seeds.

#### 4. Issues Pendientes de Producción (próximo deploy)

| ID | Severidad | Descripción | Fix |
|----|-----------|-------------|-----|
| P1-002 | HIGH | 8 tablas sin FORCE RLS (incl. `two_factor_tokens`) | `REMEDIATION-PLAYBOOK.md` Paso 5 |
| P2-001 | MEDIUM | 48 triggers `updated_at` no aplicados | `REMEDIATION-PLAYBOOK.md` Paso 6 |
| P2-002 | MEDIUM | ~15 índices de optimización faltantes | `REMEDIATION-PLAYBOOK.md` Paso 7 |
| P1-003 | HIGH | `ShopItem.icon` default: entity='gift' vs DDL='package' | Fix en código backend antes del deploy |
| P1-004 | HIGH | `auth.users.phone`: entity=`text` vs DDL=`varchar(15)` | Fix en código backend antes del deploy |
| P2-004 | MEDIUM | BYPASSRLS en gamilit_user — no verificable sin SSH | `sudo -u postgres psql -c "SELECT rolname, rolbypassrls FROM pg_roles WHERE rolname = 'gamilit_user';"` |

---

*PERFIL-DEPLOY-SERVER v2.2.0 - Sistema SIMCO - Actualizado 2026-02-28*
