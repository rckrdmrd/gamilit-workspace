---
titulo: Guia de Pipeline de Migraciones DDL en Deploy
version: 1.0.0
fecha_creacion: 2026-02-14
tags: [database, migraciones, deploy, ddl]
aplica_a: [database, devops]
estado: vigente
---

# Guia de Pipeline de Migraciones DDL en Deploy

> **Version:** 1.0.0 | **Fecha:** 2026-02-14 | **Estado:** Vigente
> **SSOT operativo:** `orchestration/referencias/MATRIZ-SSOT-DEV-PROD.md`

## 1. Proposito

Definir el pipeline de migraciones DDL durante el deploy a produccion del servidor `74.208.126.102`. Este documento establece el flujo completo para manejar cambios en la base de datos (`apps/database/ddl/`) de forma segura, con rollback automatizado y sin perdida de datos.

Gamilit utiliza un enfoque **DDL-first** (sin migraciones de TypeORM) donde los cambios de esquema se definen como archivos SQL en `apps/database/ddl/` y se aplican manualmente o mediante `init-database.sh`. Este pipeline complementa ese enfoque con un patron de **Expand/Contract** para cambios que requieren zero-downtime.

---

## 2. Flujo Completo

```
+-------------------------------------------------------------+
|                 PIPELINE DE DEPLOY                           |
|                                                              |
|  1. PRE-DEPLOY                                               |
|  +-- Backup completo de BD                                   |
|  +-- Verificar cambios DDL (git diff apps/database/)         |
|  +-- SI hay cambios DDL -> continuar, SI NO -> paso 4        |
|                                                              |
|  2. EXPAND PHASE                                             |
|  +-- Ejecutar EXPAND SQL (additive changes only)             |
|  +-- Verificar que app actual sigue funcionando              |
|  +-- Ejecutar backfill si necesario                          |
|                                                              |
|  3. DEPLOY NEW CODE                                          |
|  +-- git pull origin master                                  |
|  +-- npm ci + npm run build (backend + frontend)             |
|  +-- pm2 restart ecosystem.config.js --env production        |
|                                                              |
|  4. POST-DEPLOY VALIDATION                                   |
|  +-- Health check: curl /api/v1/health                       |
|  +-- Smoke tests manuales                                    |
|  +-- Verificar logs sin errores (pm2 logs)                   |
|                                                              |
|  5. CONTRACT PHASE (siguiente deploy)                        |
|  +-- Ejecutar CONTRACT SQL (remove old structures)           |
|  +-- Solo despues de verificar migracion completa            |
|                                                              |
|  ROLLBACK (si falla cualquier paso)                          |
|  +-- pm2 restart con version anterior                        |
|  +-- pg_restore desde backup                                 |
|  +-- Notificar equipo                                        |
+-------------------------------------------------------------+
```

---

## 3. Deteccion de Cambios DDL

Antes de ejecutar el pipeline completo, verificar si hay cambios en el directorio de base de datos desde el ultimo deploy:

```bash
# Desde el servidor de produccion
cd /home/isem/gamilit-workspace

# Verificar si hay cambios DDL desde ultimo deploy
git fetch origin
git diff HEAD..origin/master --name-only -- apps/database/ddl/

# Si hay output -> hay cambios DDL, ejecutar pipeline completo
# Si no hay output -> skip phases 2 y 5, ir directo a deploy de codigo
```

Para identificar el tipo de cambio:

```bash
# Ver cambios DDL detallados
git diff HEAD..origin/master -- apps/database/ddl/ | head -100

# Clasificar por tipo de archivo
git diff HEAD..origin/master --name-only -- apps/database/ddl/ | \
  awk -F'/' '{print $4"/"$5}' | sort | uniq -c | sort -rn
```

---

## 4. Tipos de Cambio DDL y Su Manejo

| Tipo de Cambio | Riesgo | Estrategia | Ejemplo |
|----------------|--------|------------|---------|
| ADD columna (nullable) | Bajo | Deploy directo | `ALTER TABLE ... ADD COLUMN x TEXT;` |
| ADD columna (NOT NULL + DEFAULT) | Bajo | Deploy directo | `ALTER TABLE ... ADD COLUMN x INT NOT NULL DEFAULT 0;` |
| ADD tabla nueva | Bajo | Deploy directo | `CREATE TABLE ...` |
| ADD indice | Medio | `CREATE INDEX CONCURRENTLY` | Evita bloqueo de tabla |
| MODIFY columna tipo | Alto | Expand/Contract obligatorio | Columna nueva + backfill + drop vieja |
| DROP columna | Alto | Expand/Contract obligatorio | Codigo deja de usarla -> deploy -> drop |
| DROP tabla | Critico | Verificar no hay FK, dual deploy | Confirmar que no hay referencias |
| ADD RLS policy | Bajo | Deploy directo | `CREATE POLICY ...` |
| MODIFY funcion/trigger | Medio | Test en dev primero | `CREATE OR REPLACE FUNCTION ...` |
| ADD schema nuevo | Medio | Deploy directo + grants | Requiere `GRANT USAGE` para `gamilit_user` |
| MODIFY enum | Alto | Expand/Contract o recrear | PostgreSQL no permite DROP de valores enum |

### Reglas de decision

- **Riesgo Bajo:** Ejecutar SQL directamente antes del deploy de codigo.
- **Riesgo Medio:** Ejecutar en dev, verificar, luego aplicar en produccion con rollback preparado.
- **Riesgo Alto/Critico:** Obligatorio usar patron Expand/Contract en dos deploys separados.

---

## 5. Patron Expand/Contract

El patron Expand/Contract divide cambios destructivos en dos fases:

### Fase EXPAND (Deploy N)

Agregar las nuevas estructuras sin eliminar las viejas. La aplicacion actual sigue funcionando sin modificaciones.

```sql
-- Ejemplo: Renombrar columna "name" a "full_name"

-- EXPAND: Agregar nueva columna
ALTER TABLE gamilit.users ADD COLUMN full_name VARCHAR(255);

-- BACKFILL: Copiar datos existentes
UPDATE gamilit.users SET full_name = name WHERE full_name IS NULL;

-- TRIGGER: Mantener sincronizacion dual durante transicion
CREATE OR REPLACE FUNCTION gamilit.sync_name_columns()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.name IS DISTINCT FROM OLD.name THEN
    NEW.full_name := NEW.name;
  ELSIF NEW.full_name IS DISTINCT FROM OLD.full_name THEN
    NEW.name := NEW.full_name;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_name_columns
  BEFORE UPDATE ON gamilit.users
  FOR EACH ROW EXECUTE FUNCTION gamilit.sync_name_columns();
```

### Deploy de codigo (Deploy N)

Actualizar la aplicacion para usar la nueva columna (`full_name`) mientras mantiene compatibilidad con la vieja (`name`).

### Fase CONTRACT (Deploy N+1)

Solo despues de verificar que todo funciona correctamente con la nueva estructura:

```sql
-- CONTRACT: Eliminar estructuras viejas
DROP TRIGGER IF EXISTS trg_sync_name_columns ON gamilit.users;
DROP FUNCTION IF EXISTS gamilit.sync_name_columns();
ALTER TABLE gamilit.users DROP COLUMN name;
```

---

## 6. Script de Backup Pre-Deploy

Ejecutar SIEMPRE antes de cualquier cambio DDL en produccion:

```bash
#!/bin/bash
# pre-deploy-backup.sh
# Ejecutar en: 74.208.126.102 como usuario isem

BACKUP_DIR="/home/isem/backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
DB_NAME="gamilit_platform"

# Crear directorio si no existe
mkdir -p "$BACKUP_DIR"

echo "=== Backup de $DB_NAME - $TIMESTAMP ==="

# Backup en formato custom (rapido para pg_restore)
pg_dump -Fc "$DB_NAME" > "$BACKUP_DIR/gamilit-$TIMESTAMP.dump"
echo "Backup custom: $BACKUP_DIR/gamilit-$TIMESTAMP.dump"

# Backup en formato SQL (legible y portable)
pg_dump "$DB_NAME" > "$BACKUP_DIR/gamilit-$TIMESTAMP.sql"
echo "Backup SQL: $BACKUP_DIR/gamilit-$TIMESTAMP.sql"

# Verificar que los backups no estan vacios
DUMP_SIZE=$(stat --format="%s" "$BACKUP_DIR/gamilit-$TIMESTAMP.dump" 2>/dev/null || echo "0")
SQL_SIZE=$(stat --format="%s" "$BACKUP_DIR/gamilit-$TIMESTAMP.sql" 2>/dev/null || echo "0")

if [ "$DUMP_SIZE" -lt 1000 ] || [ "$SQL_SIZE" -lt 1000 ]; then
  echo "ERROR: Backup sospechosamente pequeno. Verificar manualmente."
  exit 1
fi

# Rotar: mantener ultimos 7 de cada tipo
ls -t "$BACKUP_DIR"/gamilit-*.dump 2>/dev/null | tail -n +8 | xargs rm -f 2>/dev/null
ls -t "$BACKUP_DIR"/gamilit-*.sql 2>/dev/null | tail -n +8 | xargs rm -f 2>/dev/null

echo "=== Backup completado exitosamente ==="
echo "Archivos en $BACKUP_DIR:"
ls -lh "$BACKUP_DIR"/gamilit-$TIMESTAMP.*
```

---

## 7. Procedimiento de Rollback

### Rollback rapido (sin cambios DDL aplicados)

```bash
# 1. Detener aplicacion
pm2 stop ecosystem.config.js

# 2. Revertir codigo
cd /home/isem/gamilit-workspace
git checkout HEAD~1

# 3. Rebuild
cd apps/backend && npm ci --production=false && npm run build
cd ../frontend && npm ci && npm run build

# 4. Restart
cd /home/isem/gamilit-workspace
pm2 restart ecosystem.config.js --env production
pm2 save

# 5. Verificar
curl -f http://localhost:3006/api/v1/health || echo "HEALTH CHECK FAILED"
```

### Rollback completo (con restauracion de BD)

```bash
# 1. Detener aplicacion
pm2 stop ecosystem.config.js

# 2. Identificar ultimo backup
LAST_BACKUP=$(ls -t /home/isem/backups/gamilit-*.dump | head -1)
echo "Restaurando desde: $LAST_BACKUP"

# 3. Restaurar BD
sudo -u postgres psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'gamilit_platform' AND pid <> pg_backend_pid();"
sudo -u postgres psql -c "DROP DATABASE IF EXISTS gamilit_platform;"
sudo -u postgres psql -c "CREATE DATABASE gamilit_platform OWNER gamilit_user;"
pg_restore -d gamilit_platform "$LAST_BACKUP"

# 4. Verificar restauracion
sudo -u postgres psql -d gamilit_platform -c "SELECT count(*) FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog', 'information_schema');"

# 5. Revertir codigo
cd /home/isem/gamilit-workspace
git checkout HEAD~1

# 6. Rebuild
cd apps/backend && npm ci --production=false && npm run build
cd ../frontend && npm ci && npm run build

# 7. Restart
cd /home/isem/gamilit-workspace
pm2 restart ecosystem.config.js --env production
pm2 save

# 8. Verificar
curl -f http://localhost:3006/api/v1/health || echo "HEALTH CHECK FAILED"
curl -f http://localhost:3005 || echo "FRONTEND CHECK FAILED"
pm2 logs --lines 10 --nostream
```

---

## 8. Integracion con init-database.sh

### Cuando usar Expand/Contract vs recreate-database.sh

| Escenario | Herramienta | Justificacion |
|-----------|-------------|---------------|
| Agregar 1-5 columnas/tablas | Expand/Contract | Cambio menor, sin downtime |
| Modificar tipo de columna existente | Expand/Contract | Requiere migracion de datos |
| Nuevo schema completo | `recreate-database.sh` | Demasiados objetos para Expand/Contract |
| Reestructuracion masiva (>20 objetos) | `recreate-database.sh` | Mas seguro recrear desde cero |
| Actualizacion de funciones/triggers existentes | Deploy directo | `CREATE OR REPLACE` es idempotente |
| Actualizacion de politicas RLS | Deploy directo | `DROP POLICY IF EXISTS` + `CREATE POLICY` |

### Uso de recreate-database.sh en produccion

```bash
cd /home/isem/gamilit-workspace

# SIEMPRE con --env prod y --password
bash apps/database/scripts/recreate-database.sh \
  --env prod \
  --password '<PASSWORD_PRODUCCION>' \
  --force

# Post-recreacion: recargar funciones como postgres si hay errores de GRANT
for schema in gamilit auth_management gamification_system educational_content \
  content_management social_features progress_tracking audit_logging \
  communication notifications admin_dashboard system_configuration; do
    dir="apps/database/ddl/schemas/$schema/functions"
    [ -d "$dir" ] && for f in "$dir"/*.sql; do
        [ -f "$f" ] && sudo -u postgres psql -d gamilit_platform -f "$f" 2>/dev/null
    done
done
```

**Advertencia:** `recreate-database.sh` hace DROP + CREATE de la base de datos completa. Todos los datos se pierden. SIEMPRE hacer backup primero. SIEMPRE usar `--env prod` en produccion.

---

## 9. Aplicacion de SQL Incremental

Para cambios que no requieren recreacion completa, aplicar SQL directamente:

```bash
# Desde el servidor de produccion
cd /home/isem/gamilit-workspace

# Aplicar un archivo DDL especifico como superuser
sudo -u postgres psql -d gamilit_platform -f apps/database/ddl/schemas/gamilit/tables/nuevo_tabla.sql

# Aplicar con ON_ERROR_STOP para detectar errores
sudo -u postgres psql -d gamilit_platform \
  -v ON_ERROR_STOP=1 \
  -f apps/database/ddl/schemas/gamilit/tables/nuevo_tabla.sql

# Aplicar multiples archivos (funciones de un schema)
for f in apps/database/ddl/schemas/gamification_system/functions/*.sql; do
  echo "Aplicando: $f"
  sudo -u postgres psql -d gamilit_platform -v ON_ERROR_STOP=1 -f "$f" || {
    echo "ERROR en: $f"
    break
  }
done

# Otorgar permisos despues de agregar objetos nuevos
sudo -u postgres psql -d gamilit_platform -c "
  GRANT USAGE ON SCHEMA nuevo_schema TO gamilit_user;
  GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA nuevo_schema TO gamilit_user;
  GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA nuevo_schema TO gamilit_user;
"
```

---

## 10. Validacion Post-Migracion

Verificar que la base de datos esta en estado consistente despues de aplicar cambios DDL:

```bash
# Contar objetos principales
sudo -u postgres psql -d gamilit_platform -c "
  SELECT schemaname, count(*) as tablas
  FROM pg_tables
  WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
  GROUP BY schemaname
  ORDER BY schemaname;
"

# Verificar funciones
sudo -u postgres psql -d gamilit_platform -c "
  SELECT n.nspname as schema, count(*) as funciones
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
  GROUP BY n.nspname
  ORDER BY n.nspname;
"

# Verificar politicas RLS
sudo -u postgres psql -d gamilit_platform -c "
  SELECT schemaname, tablename, count(*) as policies
  FROM pg_policies
  GROUP BY schemaname, tablename
  ORDER BY schemaname, tablename;
"

# Verificar que el backend puede conectar
curl -f http://localhost:3006/api/v1/health
```

---

## 11. Checklist de Deploy con Migraciones

Usar esta lista antes y durante cada deploy que incluya cambios DDL:

### Pre-Deploy

- [ ] Backup de BD completado (`/home/isem/backups/gamilit-*.dump`)
- [ ] Backup verificado (tamano > 1KB)
- [ ] Cambios DDL identificados (`git diff ... -- apps/database/ddl/`)
- [ ] Cambios clasificados por riesgo (ver tabla seccion 4)
- [ ] EXPAND SQL probado en entorno de desarrollo
- [ ] Rollback procedure preparado y documentado

### Durante Deploy

- [ ] EXPAND SQL aplicado exitosamente (si aplica)
- [ ] App actual sigue funcionando con nuevas estructuras
- [ ] `git pull origin master` ejecutado
- [ ] `npm ci && npm run build` exitoso en backend
- [ ] `npm ci && npm run build` exitoso en frontend
- [ ] `pm2 restart ecosystem.config.js --env production` ejecutado

### Post-Deploy

- [ ] Health check backend exitoso: `curl -f http://localhost:3006/api/v1/health`
- [ ] Health check frontend exitoso: `curl -f http://localhost:3005`
- [ ] Health check HTTPS backend: `curl -fk https://74.208.126.102:3006/api/v1/health`
- [ ] Health check HTTPS frontend: `curl -fk https://74.208.126.102:3005`
- [ ] Logs sin errores criticos: `pm2 logs --lines 30 --nostream`
- [ ] PM2 status muestra ambos procesos como `online`
- [ ] CONTRACT SQL programado para siguiente deploy (si aplica)
- [ ] Resultado reportado al equipo

---

## 12. Errores Comunes y Soluciones

| Error | Causa | Solucion |
|-------|-------|----------|
| `permission denied for schema` | SQL ejecutado como `gamilit_user` en vez de `postgres` | Usar `sudo -u postgres psql` |
| `relation already exists` | Tabla ya fue creada en deploy anterior | Usar `IF NOT EXISTS` en DDL |
| `cannot drop column used by view` | Vista depende de la columna | Hacer DROP + CREATE de la vista primero |
| `deadlock detected` | `CREATE INDEX` bloquea tabla en uso | Usar `CREATE INDEX CONCURRENTLY` |
| `column does not exist` | Codigo nuevo referencia columna que no se creo aun | Aplicar EXPAND SQL antes del deploy de codigo |
| `violates foreign key constraint` | Intentar DROP tabla referenciada | Verificar FK antes de DROP |
| `must be owner of table` | Politica RLS necesita ser creada por owner | Ejecutar como `postgres` superuser |

---

## 13. Referencias

- `orchestration/agents/perfiles/PERFIL-DEPLOY-SERVER.md` — Perfil de agente de deploy
- `apps/database/scripts/init-database.sh` — Script de inicializacion de BD
- `apps/database/scripts/recreate-database.sh` — Script de recreacion de BD
- `docs/50-guides/deployment/GUIA-ACTUALIZACION-PRODUCCION.md` — Guia de actualizacion
- `docs/50-guides/deployment/GUIA-DESPLIEGUE-PRODUCCION-COMPLETA.md` — Guia completa de despliegue

---

## Historial de Cambios

| Version | Fecha | Descripcion |
|---------|-------|-------------|
| 1.0.0 | 2026-02-14 | Version inicial del pipeline de migraciones DDL |
