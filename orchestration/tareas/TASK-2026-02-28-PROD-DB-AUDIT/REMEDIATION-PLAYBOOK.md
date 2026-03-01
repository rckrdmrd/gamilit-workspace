---
title: "Playbook de Remediación — Servidor Producción"
task: "TASK-2026-02-28-PROD-DB-AUDIT"
agent: "SA-7A"
date: "2026-02-28"
version: "1.0.0"
status: "FINAL"
server: "74.208.126.102"
user: "isem"
---

# Playbook de Remediación — Servidor Producción

**Servidor:** 74.208.126.102
**Usuario SSH:** isem
**Base de datos:** gamilit_platform (PostgreSQL 16.11)
**Referencia:** PROD-DB-AUDIT-REPORT.md (mismo directorio)

> **IMPORTANTE:** Este playbook es un documento de análisis. Los pasos contienen los comandos exactos a ejecutar, pero no modifican código fuente. Ejecutar únicamente con acceso SSH al servidor de producción.

---

## Pre-requisitos

Antes de ejecutar cualquier paso, verificar:

- [ ] Acceso SSH al servidor `74.208.126.102` como usuario `isem`
- [ ] Acceso a PostgreSQL como superusuario (`sudo -u postgres psql`)
- [ ] PM2 CLI disponible (`pm2 --version`)
- [ ] Directorio de trabajo: `/home/isem/gamilit-workspace`

---

## Paso 0: Diagnóstico Inmediato (5 minutos)

**Objetivo:** Determinar el estado actual del servidor antes de cualquier acción.

Ejecutar estos comandos en orden y registrar la salida de cada uno:

```bash
# 1. Estado de PM2 — ¿está el backend en "errored" o "online"?
pm2 status

# 2. Últimos errores del backend
pm2 logs gamilit-backend --lines 50

# 3. Estado de PostgreSQL
systemctl status postgresql

# 4. Estado de Redis
systemctl status redis-server

# 5. ¿Está el backend respondiendo?
curl -k https://localhost:3006/api/v1/health

# 6. ¿Está el frontend respondiendo?
curl http://localhost:3005 --max-time 5

# 7. ¿Nginx está configurado correctamente?
nginx -t

# 8. ¿La BD es accesible desde la aplicación?
psql -U gamilit_user -d gamilit_platform -c "SELECT 1 AS ok;"

# 9. CRÍTICO: ¿El .env.production tiene valores reales (no placeholders)?
grep -c '<' /home/isem/gamilit-workspace/apps/backend/.env.production
# Resultado esperado: 0 (cero placeholders)

# 10. ¿Cuántas conexiones activas tiene gamilit_user?
sudo -u postgres psql -d gamilit_platform -c "SELECT count(*) FROM pg_stat_activity WHERE usename='gamilit_user';"

# 11. Estado de BYPASSRLS del rol de la app
sudo -u postgres psql -c "SELECT rolname, rolbypassrls FROM pg_roles WHERE rolname = 'gamilit_user';"
```

### Interpretación de Resultados

| Resultado | Diagnóstico | Ir a Paso |
|-----------|-------------|-----------|
| PM2 muestra `gamilit-backend` en status `errored` | Causa principal confirmada (PM2 restart exhaustion) | Paso 1 |
| `grep -c '<' .env.production` devuelve >0 | .env.production tiene placeholders — NO reiniciar | Paso 2 primero |
| `systemctl status redis-server` → inactive | Redis no está corriendo | Paso 3 primero |
| `systemctl status postgresql` → inactive | PostgreSQL no está corriendo | Emergencia: `systemctl start postgresql` |
| `curl .../health` devuelve 200 OK | Backend ya está funcionando | Solo aplicar fixes preventivos |

---

## Paso 1: Restaurar Servicio (Si PM2 muestra "errored")

**Contexto:** El backend crasheó durante el incidente de PostgreSQL (~8 min downtime). PM2 agotó sus 10 reintentos y marcó el proceso como "errored", deteniéndose de auto-reiniciar.

```bash
# Navegar al directorio del proyecto
cd /home/isem/gamilit-workspace

# Reiniciar todos los procesos PM2
pm2 restart ecosystem.config.js

# Esperar 15 segundos y verificar
sleep 15
pm2 status

# Verificar que el backend responde
curl -k https://localhost:3006/api/v1/health
# Resultado esperado: {"status":"ok"} o similar

# Si el frontend también estaba caído
curl http://localhost:3005 --max-time 5
```

### Si el restart falla con error de conexión a BD

```bash
# Ver logs del error específico
pm2 logs gamilit-backend --lines 100 | grep -i "error\|connect"

# Si el error es ECONNREFUSED o similar, verificar PostgreSQL primero
systemctl status postgresql

# Si PostgreSQL está caído, levantarlo
sudo systemctl start postgresql
sleep 5

# Luego intentar PM2 restart de nuevo
pm2 restart ecosystem.config.js
```

### Guardar el estado PM2 para que sobreviva reboots

```bash
pm2 save
```

---

## Paso 2: Verificar y Corregir .env.production

**Contexto:** El archivo `.env.production.example` contiene 8 valores placeholder (`<...>`). Si `.env.production` fue regenerado desde este template sin reemplazar los valores, el backend no arrancará.

```bash
# Verificar si hay placeholders en el .env.production real
grep '<' /home/isem/gamilit-workspace/apps/backend/.env.production
# Si esta línea imprime ALGO, hay placeholders — continúar

# Ver qué variables tienen placeholders
grep -n '<' /home/isem/gamilit-workspace/apps/backend/.env.production
```

Si hay placeholders, reemplazarlos con valores reales:

```bash
# Generar secrets seguros
JWT_SECRET=$(openssl rand -base64 64)
SESSION_SECRET=$(openssl rand -base64 64)
DB_PASSWORD="gamilit_dev_2026"  # Para dev — usar contraseña rotada en prod

echo "JWT_SECRET=$JWT_SECRET"
echo "SESSION_SECRET=$SESSION_SECRET"

# Editar el archivo con los valores reales
nano /home/isem/gamilit-workspace/apps/backend/.env.production
# Reemplazar cada <...> con el valor real correspondiente

# Verificar que no quedan placeholders
grep -c '<' /home/isem/gamilit-workspace/apps/backend/.env.production
# Resultado esperado: 0

# Si se cambió DB_PASSWORD, también cambiar en PostgreSQL
sudo -u postgres psql -c "ALTER ROLE gamilit_user WITH PASSWORD 'nueva_password_aqui';"

# Asegurar permisos restrictivos en el archivo
chmod 600 /home/isem/gamilit-workspace/apps/backend/.env.production

# Reiniciar PM2 para que tome los nuevos valores
pm2 restart ecosystem.config.js
```

### Variables críticas a verificar

| Variable | Requerimiento | Cómo generar |
|----------|---------------|--------------|
| DB_PASSWORD | ≥8 chars, sin placeholder | Usar contraseña de PostgreSQL configurada |
| JWT_SECRET | ≥32 chars | `openssl rand -base64 64` |
| JWT_REFRESH_SECRET | ≥32 chars | `openssl rand -base64 64` |
| SESSION_SECRET | ≥32 chars | `openssl rand -base64 64` |
| REDIS_PASSWORD | vacío si sin auth, o la contraseña real | Ver configuración de Redis |

---

## Paso 3: Verificar Redis

**Contexto:** Redis es requerido para Socket.IO y mensajería en tiempo real. Si está caído, el backend arranca pero con funcionalidad degradada (modo in-memory sin persistencia).

```bash
# ¿Redis está corriendo?
systemctl status redis-server

# ¿Redis responde?
redis-cli ping
# Resultado esperado: PONG

# Si Redis NO está corriendo
sudo systemctl start redis-server
sudo systemctl enable redis-server  # Para que inicie automáticamente con el server

# Verificar tras iniciar
redis-cli ping

# Verificar que el .env.production tiene la URL correcta
grep REDIS /home/isem/gamilit-workspace/apps/backend/.env.production
# Resultado esperado: REDIS_URL=redis://localhost:6379

# Si Redis usa autenticación, verificar que REDIS_PASSWORD no tiene placeholder
grep REDIS_PASSWORD /home/isem/gamilit-workspace/apps/backend/.env.production
```

---

## Paso 4: Decisión — Fix Incremental vs Recreación

**La base de datos está 100% alineada con el DDL.** La auditoría confirma:
- 173/173 tablas coinciden con DDL (0 diferencias de columnas)
- 42/42 ENUMs coinciden
- 185/185 funciones coinciden
- 483/483 políticas RLS coinciden
- 57 usuarios + todos los datos de semilla intactos

**DECISION: INCREMENTAL. NO recrear la base de datos.**

Recrear la BD destruiría los 57 usuarios (52 de ellos estudiantes reales con datos históricos de Nov 2025 – Feb 2026).

Los pasos 5-7 aplican cambios incrementales seguros (todos idempotentes).

---

## Paso 5: Aplicar FORCE RLS Faltante (8 tablas)

**Contexto:** El archivo `apps/database/ddl/07d-rls-policies-pending-tables.sql` contiene `FORCE ROW LEVEL SECURITY` para 8 tablas que aún no están en producción.

**Severidad:** HIGH — `two_factor_tokens` sin FORCE RLS es un gap de seguridad.

```bash
# Conectar a PostgreSQL como superusuario
sudo -u postgres psql -d gamilit_platform

# Verificar estado actual
SELECT schemaname, tablename, rowsecurity, forcerowsecurity
FROM pg_tables
WHERE tablename IN (
  'two_factor_tokens', 'user_purchases', 'user_learning_paths',
  'engagement_metrics', 'progress_snapshots', 'guild_join_requests',
  'user_difficulty_progresses', 'rate_limits'
)
ORDER BY schemaname, tablename;
```

Aplicar FORCE RLS para las 8 tablas:

```sql
-- Ejecutar en psql como superusuario
ALTER TABLE auth_management.two_factor_tokens FORCE ROW LEVEL SECURITY;
ALTER TABLE gamification_system.user_purchases FORCE ROW LEVEL SECURITY;
ALTER TABLE progress_tracking.user_learning_paths FORCE ROW LEVEL SECURITY;
ALTER TABLE progress_tracking.engagement_metrics FORCE ROW LEVEL SECURITY;
ALTER TABLE progress_tracking.progress_snapshots FORCE ROW LEVEL SECURITY;
ALTER TABLE social_features.guild_join_requests FORCE ROW LEVEL SECURITY;
ALTER TABLE progress_tracking.user_difficulty_progresses FORCE ROW LEVEL SECURITY;
ALTER TABLE system_configuration.rate_limits FORCE ROW LEVEL SECURITY;
```

Verificar aplicación:

```sql
-- Debe mostrar forcerowsecurity = true para las 8 tablas
SELECT schemaname, tablename, rowsecurity, forcerowsecurity
FROM pg_tables
WHERE tablename IN (
  'two_factor_tokens', 'user_purchases', 'user_learning_paths',
  'engagement_metrics', 'progress_snapshots', 'guild_join_requests',
  'user_difficulty_progresses', 'rate_limits'
)
ORDER BY schemaname, tablename;
```

Alternativamente, aplicar el archivo DDL completo (idempotente):

```bash
cd /home/isem/gamilit-workspace
sudo -u postgres psql -d gamilit_platform -f apps/database/ddl/07d-rls-policies-pending-tables.sql
```

---

## Paso 6: Aplicar Triggers updated_at Faltantes (48 triggers)

**Contexto:** 48 triggers `updated_at` están definidos en DDL pero no aplicados en producción. Son todos de mantenimiento de timestamp, sin lógica de negocio. Todos usan el patrón idempotente `DROP TRIGGER IF EXISTS ... CASCADE; CREATE TRIGGER`.

**Severidad:** MEDIUM — Las tablas afectadas no actualizan `updated_at` automáticamente.

```bash
# Aplicar todos los batch trigger files (idempotente — usar DROP IF EXISTS)
cd /home/isem/gamilit-workspace

# Aplicar por schema
sudo -u postgres psql -d gamilit_platform \
  -f apps/database/ddl/schemas/auth_management/triggers/00-batch_updated_at_triggers.sql

sudo -u postgres psql -d gamilit_platform \
  -f apps/database/ddl/schemas/gamification_system/triggers/00-batch_updated_at_triggers.sql

sudo -u postgres psql -d gamilit_platform \
  -f apps/database/ddl/schemas/progress_tracking/triggers/00-batch_updated_at_triggers.sql

sudo -u postgres psql -d gamilit_platform \
  -f apps/database/ddl/schemas/social_features/triggers/00-batch_updated_at_triggers.sql

sudo -u postgres psql -d gamilit_platform \
  -f apps/database/ddl/schemas/educational_content/triggers/00-batch_updated_at_triggers.sql

sudo -u postgres psql -d gamilit_platform \
  -f apps/database/ddl/schemas/notifications/triggers/00-batch_updated_at_triggers.sql

sudo -u postgres psql -d gamilit_platform \
  -f apps/database/ddl/schemas/system_configuration/triggers/00-batch_updated_at_triggers.sql

sudo -u postgres psql -d gamilit_platform \
  -f apps/database/ddl/schemas/content_management/triggers/00-batch_updated_at_triggers.sql

sudo -u postgres psql -d gamilit_platform \
  -f apps/database/ddl/schemas/lti_integration/triggers/00-batch_updated_at_triggers.sql

sudo -u postgres psql -d gamilit_platform \
  -f apps/database/ddl/schemas/auth/triggers/00-batch_updated_at_triggers.sql

# Verificar count de triggers post-aplicación
sudo -u postgres psql -d gamilit_platform -c "SELECT count(*) FROM information_schema.triggers;"
# Resultado esperado: ~120 (72 existentes + 48 nuevos)
```

---

## Paso 7: Aplicar Índices de Optimización Faltantes (~15)

**Contexto:** ~15 índices de optimización definidos en DDL no están en producción. No son únicos ni primary keys — solo rendimiento.

**Severidad:** LOW — Consultas ligeramente más lentas, sin impacto funcional.

```bash
# Aplicar archivos de índices (idempotente con CREATE INDEX IF NOT EXISTS)
cd /home/isem/gamilit-workspace

# Buscar archivos de índices
find apps/database/ddl -name "*.sql" -path "*/indexes/*" | head -20

# Aplicar cada archivo de índices si existe
# (los archivos usan CREATE INDEX IF NOT EXISTS — seguros de re-ejecutar)
for idx_file in $(find apps/database/ddl -name "*.sql" -path "*/indexes/*"); do
  echo "Applying: $idx_file"
  sudo -u postgres psql -d gamilit_platform -f "$idx_file" 2>&1
done

# Verificar count de índices post-aplicación
sudo -u postgres psql -d gamilit_platform -c "SELECT count(*) FROM pg_indexes WHERE schemaname NOT IN ('pg_catalog', 'information_schema');"
# Resultado esperado: ~982 (967 actuales + ~15 nuevos)
```

---

## Paso 8: Fixes de Entidades Backend (Para Próximo Deploy)

**NOTA:** Estos cambios son al código fuente del backend. No se aplican en el servidor — se realizan en el código local y se despliegan en el siguiente deploy normal.

### Fix 8A: ShopItem.icon default (HIGH)

**Archivo:** `apps/backend/src/modules/gamification/entities/shop-item.entity.ts` línea 67

```typescript
// ANTES (incorrecto):
@Column({ type: 'text', default: 'gift' })
  icon!: string;

// DESPUÉS (correcto — alineado con DDL default 'package'):
@Column({ type: 'text', default: 'package' })
  icon!: string;
```

### Fix 8B: auth.users.phone tipo (HIGH)

**Archivo:** `apps/backend/src/modules/auth/entities/user.entity.ts` línea 101

```typescript
// ANTES (incorrecto):
@Column({ type: 'text', nullable: true })
  phone?: string;

// DESPUÉS (correcto — alineado con DDL varchar(15)):
@Column({ type: 'varchar', length: 15, nullable: true })
  phone?: string;
```

### Fix 8C: Verificar message.entity.ts coverage (MEDIUM)

**Archivo:** `apps/backend/src/app.module.ts` línea ~383

Verificar que el glob `message*.entity{.ts,.js}` captura `message.entity.ts`. Si no funciona:

```typescript
// ANTES:
__dirname + '/modules/teacher/entities/message*.entity{.ts,.js}',

// DESPUÉS (path explícito):
__dirname + '/modules/teacher/entities/message.entity{.ts,.js}',
```

---

## Paso 9: Mejorar Configuración PM2

**Contexto:** `max_restarts: 10` fue suficiente para causar el incidente. Con PostgreSQL caído 8 minutos, PM2 agotó sus 10 reintentos en ~5 minutos y dejó de intentar. La mejora aquí es preventiva para futuros incidentes.

**Archivo:** `ecosystem.config.js` (en el repositorio, no en el servidor)

```javascript
// Valores actuales (problemáticos):
min_uptime: '10s',
max_restarts: 10,

// Valores recomendados:
min_uptime: '30s',          // Proceso debe vivir 30s para contar como "éxito"
max_restarts: 30,           // 30 reintentos (da ~15 minutos de margen)
restart_delay: 10000,       // 10 segundos entre reintentos (evita spam)
exp_backoff_restart_delay: 100,  // Backoff exponencial entre reintentos
```

El cambio de `max_restarts: 10` a `max_restarts: 30` con `restart_delay: 10000` proporciona:
- 30 reintentos × 10 segundos de delay = ~5 minutos adicionales de budget
- Tiempo total de retry: ~20 minutos (vs los ~5 actuales)

Esto habría evitado el incidente del 28 de febrero: con 20 minutos de retry budget y solo 8 minutos de outage, PM2 habría recuperado el servicio automáticamente cuando PostgreSQL volvió.

**Para aplicar en el servidor sin esperar al siguiente deploy:**

```bash
# En el servidor de producción
cd /home/isem/gamilit-workspace

# Editar ecosystem.config.js con los nuevos valores
nano ecosystem.config.js

# Aplicar la configuración actualizada
pm2 delete all
pm2 start ecosystem.config.js
pm2 save

# Verificar estado
pm2 status
```

---

## Paso 10: Verificación Post-Fix Completa

```bash
# 1. Estado PM2 — todos deben estar "online"
pm2 status
# Esperado: gamilit-backend online, gamilit-frontend online

# 2. Health check del backend
curl -k https://localhost:3006/api/v1/health
# Esperado: {"status":"ok",...}

# 3. Frontend accesible
curl http://localhost:3005 --max-time 5 -o /dev/null -w "%{http_code}"
# Esperado: 200

# 4. Nginx responde correctamente
curl -k https://74.208.126.102/api/v1/health
# Esperado: {"status":"ok",...}

# 5. Autenticación funciona
curl -k -X POST https://74.208.126.102/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gamilit.com","password":"TU_PASSWORD_ADMIN"}' \
  | head -100
# Esperado: JSON con access_token

# 6. Verificar que no hay errores en logs
pm2 logs --lines 30 | grep -i "error"
# Esperado: sin errores de conexión

# 7. Conexiones activas a PostgreSQL
sudo -u postgres psql -c "SELECT usename, count(*) FROM pg_stat_activity GROUP BY usename;"
# Esperado: gamilit_user con 22 conexiones (11 datasources × 2 pool)

# 8. Triggers aplicados correctamente
sudo -u postgres psql -d gamilit_platform -c "SELECT count(*) FROM information_schema.triggers;"
# Esperado: ~120

# 9. FORCE RLS aplicado
sudo -u postgres psql -d gamilit_platform -c "
SELECT count(*) FROM pg_tables
WHERE forcerowsecurity = true;"
# Esperado: ≥38
```

---

## Paso 11: Medidas Preventivas

### Inmediatas (Esta sesión)

1. **Fix backup scripts** — Eliminar `2>/dev/null` de `apps/devops/scripts/backup-production-data.sh` y `apps/devops/scripts/deploy-production.sh` para que los errores de conexión sean visibles.

2. **Agregar validación de tamaño de backup** — En `apps/devops/scripts/deploy-production.sh`, agregar:
   ```bash
   # Después de pg_dump, verificar que el archivo no está vacío
   BACKUP_SIZE=$(stat -c%s "$full_dump_file" 2>/dev/null || echo 0)
   if [ "$BACKUP_SIZE" -lt 1048576 ]; then  # < 1MB
     echo "ERROR: Backup file too small ($BACKUP_SIZE bytes) — possible connection failure"
     exit 1
   fi
   ```

3. **Agregar pre-flight check a backup scripts:**
   ```bash
   # Antes de cualquier pg_dump
   if ! PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
     echo "ERROR: Cannot connect to database before backup"
     exit 1
   fi
   ```

4. **Documentar el procedimiento de recovery PM2:**
   ```
   RUNBOOK — Recuperación tras PM2 restart exhaustion:
   1. SSH a 74.208.126.102 como isem
   2. pm2 status (confirmar "errored")
   3. systemctl status postgresql (confirmar "active")
   4. pm2 restart ecosystem.config.js
   5. pm2 logs --lines 30 (confirmar sin errores)
   6. curl -k https://localhost:3006/api/v1/health (confirmar 200)
   ```

### Corto Plazo (Este Sprint)

5. **Agregar healthcheck externo** — Ping cada 60 segundos a `https://74.208.126.102/api/v1/health`. Alertar si no responde en 30 segundos.

6. **Validación de DB antes de aplicar DDL en producción:**
   ```bash
   # Antes de cualquier script DDL en producción:
   echo "Active connections before DDL:"
   sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity WHERE usename='gamilit_user';"

   echo "Applying DDL..."
   sudo -u postgres psql -d gamilit_platform -f script.sql

   echo "Restarting PM2 after DDL..."
   pm2 restart ecosystem.config.js
   ```

7. **Aumentar retry budget de TypeORM** (opcional):
   ```env
   # En .env.production
   DB_RETRY_ATTEMPTS=20       # 20 intentos (default: 5)
   DB_RETRY_DELAY=10000       # 10 segundos entre intentos (default: 5000)
   # Total budget: 20 × 10s = 200 segundos (~3.3 minutos)
   ```

### Mediano Plazo (Próximos 2 Sprints)

8. **Aplicar DDL con lock timeout** para evitar bloqueos prolongados:
   ```sql
   SET lock_timeout = '5s';  -- Fallar si no puede adquirir lock en 5 segundos
   -- Luego la sentencia DDL
   ALTER TABLE ...;
   ```

9. **BYPASSRLS — verificar y eliminar si está activo:**
   ```sql
   -- Verificar
   SELECT rolname, rolbypassrls FROM pg_roles WHERE rolname = 'gamilit_user';

   -- Si rolbypassrls = true, eliminar (hace efectivas las 483 políticas RLS)
   ALTER ROLE gamilit_user NOBYPASSRLS;
   ```

10. **Considerar `instances: 2`** en `ecosystem.config.js` para redundancia:
    ```javascript
    instances: 2,         // Dos instancias del backend
    exec_mode: 'cluster', // Redis required para Socket.IO clustering
    // NOTA: Ajustar DB_POOL_MAX a 4 (4 × 2 × 11 = 88 conexiones — seguro)
    ```

---

## Referencia Rápida: Comandos de Emergencia

```bash
# Situación: "El servidor no responde"
# Ejecutar en orden:

# 1. Ver estado general
pm2 status
systemctl status postgresql redis-server nginx

# 2. Si PM2 en "errored"
pm2 restart ecosystem.config.js

# 3. Si PostgreSQL caído
sudo systemctl start postgresql && pm2 restart ecosystem.config.js

# 4. Si Redis caído
sudo systemctl start redis-server && pm2 restart ecosystem.config.js

# 5. Si todo falla — reinicio completo
sudo systemctl restart postgresql redis-server nginx
sleep 10
pm2 restart ecosystem.config.js
pm2 save

# 6. Verificar que todo está OK
pm2 status
curl -k https://localhost:3006/api/v1/health
```

---

## Apéndice: Diagnóstico de BYPASSRLS

```sql
-- Ejecutar como superusuario PostgreSQL
-- para determinar si RLS está siendo bypasseado

-- 1. Estado actual del rol
SELECT rolname, rolbypassrls, rolsuper
FROM pg_roles
WHERE rolname IN ('gamilit_user', 'postgres')
ORDER BY rolname;

-- 2. Tablas con RLS habilitado pero sin FORCE
SELECT schemaname, tablename, rowsecurity, forcerowsecurity
FROM pg_tables
WHERE rowsecurity = true AND forcerowsecurity = false
ORDER BY schemaname, tablename;
-- Resultado esperado: 0 filas (si FORCE RLS está aplicado a todas)

-- 3. Verificar que las políticas están activas para gamilit_user
SET ROLE gamilit_user;
SELECT current_user;
-- Debe mostrar 'gamilit_user'

-- Testear una tabla protegida
SET app.current_user_id = '00000000-0000-0000-0000-000000000000';
SELECT count(*) FROM auth_management.profiles;
-- Debe retornar 0 (no hay usuario con ese UUID)

RESET ROLE;
```

---

*Playbook generado por SA-7A | TASK-2026-02-28-PROD-DB-AUDIT | 2026-02-28*
*Basado en: 13 reportes de subagentes (Phases 1-6), validación independiente SA-6A*
*Causa raíz: PM2 restart exhaustion tras DDL maintenance — confianza 80%*
