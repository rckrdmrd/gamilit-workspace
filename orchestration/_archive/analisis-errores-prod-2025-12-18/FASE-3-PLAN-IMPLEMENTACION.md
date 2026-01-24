# FASE 3: Plan de Implementación - Correcciones Producción

**Fecha:** 2025-12-18
**Proyecto:** Gamilit
**Ambiente:** Producción (74.208.126.102)

---

## 1. RESUMEN DEL PROBLEMA

La base de datos de producción **NO tiene las tablas/objetos necesarios** porque el script `create-database.sh` no se ejecutó correctamente.

---

## 2. OPCIONES DE SOLUCIÓN

### Opción A: Clean Database Load (RECOMENDADA)

**Descripción:** Ejecutar `create-database.sh` completo para crear todos los objetos.

**Ventajas:**
- ✅ Garantiza integridad completa
- ✅ Incluye todos los triggers, funciones, índices
- ✅ Ejecuta seeds automáticamente
- ✅ Valida automáticamente

**Desventajas:**
- ⚠️ Requiere BD vacía o backup previo
- ⚠️ Pierde datos existentes (usuarios registrados)

**Recomendado si:** La BD está mayormente vacía o los datos pueden recrearse.

### Opción B: Migración Selectiva de Objetos

**Descripción:** Ejecutar solo los DDL de las tablas faltantes.

**Ventajas:**
- ✅ Preserva datos existentes
- ✅ Menor impacto

**Desventajas:**
- ⚠️ Requiere verificar dependencias manualmente
- ⚠️ Puede haber inconsistencias
- ⚠️ Más propenso a errores

**Recomendado si:** Hay datos valiosos que no pueden perderse.

---

## 3. PLAN DE IMPLEMENTACIÓN - OPCIÓN A

### 3.1 Pre-requisitos

```bash
# 1. Conectar al servidor de producción
ssh user@74.208.126.102

# 2. Verificar estado actual
cd /path/to/gamilit
psql -U gamilit_user -d gamilit_platform -c "SELECT COUNT(*) FROM auth.users;"
```

### 3.2 Backup (CRÍTICO)

```bash
# Crear backup completo
pg_dump -U gamilit_user -d gamilit_platform -F c -f backup_$(date +%Y%m%d_%H%M%S).dump

# Verificar backup
pg_restore --list backup_*.dump | head -20
```

### 3.3 Ejecución

```bash
# Navegar al directorio de base de datos
cd apps/database

# Ejecutar script completo
./create-database.sh

# O si necesita recrear desde cero:
./drop-and-recreate-database.sh
```

### 3.4 Validación

```bash
# Ejecutar validación automática
./validate-create-database.sh
./validate-db-ready.sh
```

---

## 4. PLAN DE IMPLEMENTACIÓN - OPCIÓN B

### 4.1 Orden de Ejecución DDL

**IMPORTANTE:** Respetar este orden para evitar errores de dependencias.

#### Paso 1: Verificar/Crear Schemas

```sql
-- Verificar schemas existentes
SELECT schema_name FROM information_schema.schemata
WHERE schema_name IN ('gamification_system', 'progress_tracking', 'educational_content', 'notifications');

-- Crear si no existen
CREATE SCHEMA IF NOT EXISTS gamification_system;
CREATE SCHEMA IF NOT EXISTS progress_tracking;
CREATE SCHEMA IF NOT EXISTS educational_content;
CREATE SCHEMA IF NOT EXISTS notifications;
```

#### Paso 2: ENUMs (si no existen)

```bash
# gamification_system ENUMs
psql -U gamilit_user -d gamilit_platform -f apps/database/ddl/schemas/gamification_system/types/notification_type.sql
psql -U gamilit_user -d gamilit_platform -f apps/database/ddl/schemas/gamification_system/types/notification_priority.sql
psql -U gamilit_user -d gamilit_platform -f apps/database/ddl/schemas/gamification_system/types/maya_rank.sql
psql -U gamilit_user -d gamilit_platform -f apps/database/ddl/schemas/gamification_system/types/mission_type.sql
psql -U gamilit_user -d gamilit_platform -f apps/database/ddl/schemas/gamification_system/types/mission_status.sql

# progress_tracking ENUMs
psql -U gamilit_user -d gamilit_platform -f apps/database/ddl/schemas/progress_tracking/types/progress_status.sql

# educational_content ENUMs
psql -U gamilit_user -d gamilit_platform -f apps/database/ddl/schemas/educational_content/types/difficulty_level.sql
```

#### Paso 3: Tablas Críticas (en orden de dependencias)

```bash
# 1. gamification_system - tablas base
psql -U gamilit_user -d gamilit_platform -f apps/database/ddl/schemas/gamification_system/tables/01-user_stats.sql
psql -U gamilit_user -d gamilit_platform -f apps/database/ddl/schemas/gamification_system/tables/13-maya_ranks.sql
psql -U gamilit_user -d gamilit_platform -f apps/database/ddl/schemas/gamification_system/tables/02-user_ranks.sql
psql -U gamilit_user -d gamilit_platform -f apps/database/ddl/schemas/gamification_system/tables/08-notifications.sql
psql -U gamilit_user -d gamilit_platform -f apps/database/ddl/schemas/gamification_system/tables/20-mission_templates.sql
psql -U gamilit_user -d gamilit_platform -f apps/database/ddl/schemas/gamification_system/tables/06-missions.sql

# 2. progress_tracking
psql -U gamilit_user -d gamilit_platform -f apps/database/ddl/schemas/progress_tracking/tables/01-module_progress.sql

# 3. educational_content
psql -U gamilit_user -d gamilit_platform -f apps/database/ddl/schemas/educational_content/tables/01-modules.sql
psql -U gamilit_user -d gamilit_platform -f apps/database/ddl/schemas/educational_content/tables/02-exercises.sql
```

#### Paso 4: Funciones Críticas

```bash
# Función de inicialización de usuario
psql -U gamilit_user -d gamilit_platform -f apps/database/ddl/schemas/gamilit/functions/04-initialize_user_stats.sql
```

#### Paso 5: Triggers

```bash
# Trigger de inicialización automática
psql -U gamilit_user -d gamilit_platform -f apps/database/ddl/schemas/auth_management/triggers/04-trg_initialize_user_stats.sql
```

#### Paso 6: Índices

```bash
# Índices de gamification_system
psql -U gamilit_user -d gamilit_platform -f apps/database/ddl/schemas/gamification_system/indexes/01-idx_user_stats_user_id.sql
psql -U gamilit_user -d gamilit_platform -f apps/database/ddl/schemas/gamification_system/indexes/05-idx_notifications_user_id.sql

# Índices de progress_tracking
psql -U gamilit_user -d gamilit_platform -f apps/database/ddl/schemas/progress_tracking/indexes/01-idx_module_progress_analytics_gin.sql
```

#### Paso 7: RLS Policies

```bash
# Habilitar RLS y crear políticas
psql -U gamilit_user -d gamilit_platform -f apps/database/ddl/schemas/gamification_system/rls-policies/01-enable-rls.sql
psql -U gamilit_user -d gamilit_platform -f apps/database/ddl/schemas/gamification_system/rls-policies/02-policies.sql
psql -U gamilit_user -d gamilit_platform -f apps/database/ddl/schemas/progress_tracking/rls-policies/01-enable-rls.sql
psql -U gamilit_user -d gamilit_platform -f apps/database/ddl/schemas/educational_content/rls-policies/01-enable-rls.sql
```

#### Paso 8: Seeds Críticos

```bash
# Maya Ranks (PRIMERO - requerido por user_ranks)
psql -U gamilit_user -d gamilit_platform -f apps/database/seeds/prod/gamification_system/03-maya_ranks.sql

# Mission Templates (requerido por missions)
psql -U gamilit_user -d gamilit_platform -f apps/database/seeds/prod/gamification_system/10-mission_templates.sql

# Modules
psql -U gamilit_user -d gamilit_platform -f apps/database/seeds/prod/educational_content/01-modules.sql
```

#### Paso 9: Inicializar Usuarios Existentes

```sql
-- Para usuarios que ya existen sin user_stats/user_ranks
-- Ejecutar manualmente la inicialización

-- 1. Crear user_stats para usuarios sin stats
INSERT INTO gamification_system.user_stats (user_id, tenant_id, ml_coins, ml_coins_earned_total)
SELECT p.user_id, p.tenant_id, 100, 100
FROM auth_management.profiles p
WHERE p.role IN ('student', 'admin_teacher', 'super_admin')
  AND NOT EXISTS (SELECT 1 FROM gamification_system.user_stats us WHERE us.user_id = p.user_id);

-- 2. Crear user_ranks para usuarios sin ranks
INSERT INTO gamification_system.user_ranks (user_id, tenant_id, current_rank, is_current)
SELECT p.user_id, p.tenant_id, 'Ajaw'::gamification_system.maya_rank, true
FROM auth_management.profiles p
WHERE p.role IN ('student', 'admin_teacher', 'super_admin')
  AND NOT EXISTS (SELECT 1 FROM gamification_system.user_ranks ur WHERE ur.user_id = p.user_id);
```

---

## 5. SCRIPT CONSOLIDADO PARA OPCIÓN B

Crear un script ejecutable:

```bash
#!/bin/bash
# migrate-production-critical.sh
# Migra solo los objetos críticos faltantes

set -e

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-gamilit_platform}"
DB_USER="${DB_USER:-gamilit_user}"

PSQL="psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME"

echo "=== MIGRACIÓN CRÍTICA PRODUCCIÓN ==="
echo "Base de datos: $DB_NAME"
echo ""

# Función para ejecutar SQL
run_sql() {
    echo "Ejecutando: $1"
    $PSQL -f "$1"
}

# Paso 1: Verificar conexión
echo "1. Verificando conexión..."
$PSQL -c "SELECT 1" > /dev/null

# Paso 2: ENUMs
echo "2. Creando ENUMs faltantes..."
run_sql "apps/database/ddl/schemas/gamification_system/types/notification_type.sql" 2>/dev/null || true
run_sql "apps/database/ddl/schemas/gamification_system/types/notification_priority.sql" 2>/dev/null || true
run_sql "apps/database/ddl/schemas/gamification_system/types/maya_rank.sql" 2>/dev/null || true

# Paso 3: Tablas
echo "3. Creando tablas faltantes..."
run_sql "apps/database/ddl/schemas/gamification_system/tables/01-user_stats.sql" 2>/dev/null || true
run_sql "apps/database/ddl/schemas/gamification_system/tables/13-maya_ranks.sql" 2>/dev/null || true
run_sql "apps/database/ddl/schemas/gamification_system/tables/02-user_ranks.sql" 2>/dev/null || true
run_sql "apps/database/ddl/schemas/gamification_system/tables/08-notifications.sql" 2>/dev/null || true
run_sql "apps/database/ddl/schemas/gamification_system/tables/20-mission_templates.sql" 2>/dev/null || true
run_sql "apps/database/ddl/schemas/gamification_system/tables/06-missions.sql" 2>/dev/null || true
run_sql "apps/database/ddl/schemas/progress_tracking/tables/01-module_progress.sql" 2>/dev/null || true
run_sql "apps/database/ddl/schemas/educational_content/tables/01-modules.sql" 2>/dev/null || true

# Paso 4: Funciones y Triggers
echo "4. Creando funciones y triggers..."
run_sql "apps/database/ddl/schemas/gamilit/functions/04-initialize_user_stats.sql" 2>/dev/null || true
run_sql "apps/database/ddl/schemas/auth_management/triggers/04-trg_initialize_user_stats.sql" 2>/dev/null || true

# Paso 5: Seeds
echo "5. Ejecutando seeds críticos..."
run_sql "apps/database/seeds/prod/gamification_system/03-maya_ranks.sql"
run_sql "apps/database/seeds/prod/gamification_system/10-mission_templates.sql"
run_sql "apps/database/seeds/prod/educational_content/01-modules.sql"

# Paso 6: Inicializar usuarios existentes
echo "6. Inicializando usuarios existentes..."
$PSQL << 'EOF'
-- Crear user_stats para usuarios sin stats
INSERT INTO gamification_system.user_stats (user_id, tenant_id, ml_coins, ml_coins_earned_total)
SELECT p.user_id, p.tenant_id, 100, 100
FROM auth_management.profiles p
WHERE p.role IN ('student', 'admin_teacher', 'super_admin')
  AND NOT EXISTS (SELECT 1 FROM gamification_system.user_stats us WHERE us.user_id = p.user_id)
ON CONFLICT (user_id) DO NOTHING;

-- Crear user_ranks para usuarios sin ranks
INSERT INTO gamification_system.user_ranks (user_id, tenant_id, current_rank, is_current)
SELECT p.user_id, p.tenant_id, 'Ajaw'::gamification_system.maya_rank, true
FROM auth_management.profiles p
WHERE p.role IN ('student', 'admin_teacher', 'super_admin')
  AND NOT EXISTS (SELECT 1 FROM gamification_system.user_ranks ur WHERE ur.user_id = p.user_id)
ON CONFLICT (user_id) DO NOTHING;
EOF

echo ""
echo "=== MIGRACIÓN COMPLETADA ==="
echo "Verificar con: ./validate-db-ready.sh"
```

---

## 6. VERIFICACIÓN POST-IMPLEMENTACIÓN

### 6.1 Queries de Verificación

```sql
-- 1. Tablas creadas
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_schema IN ('gamification_system', 'progress_tracking', 'educational_content')
ORDER BY table_schema, table_name;

-- 2. Seeds cargados
SELECT 'mission_templates' as tabla, COUNT(*) as registros FROM gamification_system.mission_templates
UNION ALL
SELECT 'maya_ranks', COUNT(*) FROM gamification_system.maya_ranks
UNION ALL
SELECT 'modules', COUNT(*) FROM educational_content.modules;

-- 3. Usuarios con stats
SELECT COUNT(*) as usuarios_con_stats FROM gamification_system.user_stats;

-- 4. Usuarios con ranks
SELECT COUNT(*) as usuarios_con_ranks FROM gamification_system.user_ranks;

-- 5. Trigger activo
SELECT tgname, tgenabled FROM pg_trigger WHERE tgname = 'trg_initialize_user_stats';
```

### 6.2 Prueba Funcional

```bash
# Probar endpoints desde el servidor
curl -k https://74.208.126.102:3006/api/v1/gamification/missions/daily -H "Authorization: Bearer <TOKEN>"
curl -k https://74.208.126.102:3006/api/v1/gamification/ranks/current -H "Authorization: Bearer <TOKEN>"
curl -k https://74.208.126.102:3006/api/v1/notifications/unread-count -H "Authorization: Bearer <TOKEN>"
```

---

## 7. PLAN DE ROLLBACK

### Si algo falla:

```bash
# Restaurar desde backup
pg_restore -U gamilit_user -d gamilit_platform -c backup_YYYYMMDD_HHMMSS.dump

# O si solo se agregaron objetos nuevos, dropearlos:
DROP TABLE IF EXISTS gamification_system.notifications CASCADE;
DROP TABLE IF EXISTS gamification_system.user_stats CASCADE;
DROP TABLE IF EXISTS gamification_system.user_ranks CASCADE;
DROP TABLE IF EXISTS progress_tracking.module_progress CASCADE;
DROP TABLE IF EXISTS educational_content.modules CASCADE;
```

---

## 8. CHECKLIST DE IMPLEMENTACIÓN

- [ ] Crear backup de producción
- [ ] Verificar espacio en disco
- [ ] Notificar a usuarios de mantenimiento
- [ ] Detener backend (PM2 stop)
- [ ] Ejecutar migración (Opción A o B)
- [ ] Validar tablas creadas
- [ ] Validar seeds cargados
- [ ] Validar trigger activo
- [ ] Iniciar backend (PM2 start)
- [ ] Probar endpoints
- [ ] Registrar nuevo usuario de prueba
- [ ] Verificar user_stats y user_ranks creados
- [ ] Confirmar resolución de errores

---

## 9. TIEMPO ESTIMADO

| Actividad | Duración |
|-----------|----------|
| Backup | 5 min |
| Migración Opción A | 2-5 min |
| Migración Opción B | 10-15 min |
| Validación | 5 min |
| Pruebas | 10 min |
| **Total** | **20-35 min** |

---

**Documento generado para Fase 3 - Plan de Implementación**
