# FASE 2: Resultado del Análisis - Errores Producción

**Fecha:** 2025-12-18
**Proyecto:** Gamilit
**Ambiente:** Producción

---

## 1. DIAGNÓSTICO DEFINITIVO

### 1.1 Causa Raíz Principal

**El script `create-database.sh` NO se ejecutó correctamente en producción.**

Esto implica que:
- ❌ Los schemas pueden existir pero las tablas NO
- ❌ Los triggers NO existen
- ❌ Los seeds NO se ejecutaron
- ❌ Los ENUMs pueden estar incompletos

### 1.2 Evidencia

| Componente | En Repositorio | En Producción |
|------------|---------------|---------------|
| `gamification_system.notifications` | ✅ DDL existe | ❌ Error 500 |
| `progress_tracking.module_progress` | ✅ DDL existe | ❌ Error 500 |
| `educational_content.modules` | ✅ DDL existe | ❌ Error 500 |
| `mission_templates` seeds | ✅ 11 templates | ❌ Error 400 |
| `user_stats` trigger | ✅ Trigger existe | ❌ No se ejecuta |

---

## 2. ESTRUCTURA DE DDL CONFIRMADA

### 2.1 Script Principal: `create-database.sh`

**Ubicación:** `apps/database/create-database.sh`

**Ejecuta 16 Fases en orden:**

```
FASE 0:  Extensiones (pgcrypto, uuid-ossp)
FASE 1:  Prerequisites (13 schemas + ENUMs base)
FASE 2:  Funciones compartidas (gamilit/functions, views)
FASE 3:  Auth Schema (Supabase)
FASE 4:  Storage Schema
FASE 5:  Auth Management (profiles, triggers)
FASE 6:  Educational Content
FASE 6.5: Notifications Schema ⭐ CRÍTICO
FASE 7:  Gamification System
FASE 8:  Progress Tracking
FASE 9:  Social Features
FASE 9.5: FK Constraints diferidos
FASE 10: Content Management
FASE 10.5: Communication Schema
FASE 11: Audit Logging
FASE 12: System Configuration
FASE 13: Admin Dashboard (opcional)
FASE 14: LTI Integration
FASE 15: Post-DDL Permissions
FASE 16: Seeds (38 archivos producción)
```

### 2.2 Scripts Auxiliares

| Script | Propósito |
|--------|----------|
| `validate-create-database.sh` | Valida integridad post-creación |
| `validate-db-ready.sh` | Valida BD lista para app |
| `migrate-missing-objects.sh` | Migra objetos faltantes |
| `drop-and-recreate-database.sh` | Reset completo |

---

## 3. SEEDS CONFIRMADOS

### 3.1 Mission Templates (CRÍTICO para Error 400)

**Archivo:** `apps/database/seeds/prod/gamification_system/10-mission_templates.sql`

| ID | Nombre | Tipo | XP | ML Coins |
|----|--------|------|----|----|
| 20000001-...-000000000001 | Calentamiento Científico | daily | 50 | 10 |
| 20000001-...-000000000002 | Mente Brillante | daily | 75 | 15 |
| 20000001-...-000000000003 | Acumulador de Sabiduría | daily | 30 | 5 |
| 20000001-...-000000000004 | Perfeccionista del Día | daily | 100 | 25 |
| 20000002-...-000000000001 | Maratón de Conocimiento | weekly | 200 | 50 |
| 20000002-...-000000000002 | Constancia Científica | weekly | 300 | 75 |
| 20000002-...-000000000003 | Ascenso Semanal | weekly | 150 | 40 |
| 20000002-...-000000000004 | Explorador Curioso | weekly | 175 | 45 |
| 20000002-...-000000000005 | Semana de Excelencia | weekly | 400 | 100 |
| 20000003-...-000000000001 | Dominio del Módulo | special | 500 | 150 |
| 20000003-...-000000000002 | Estratega Sabio | special | 75 | 20 |

**Total:** 11 templates (4 daily + 5 weekly + 2 special)

### 3.2 Maya Ranks (CRÍTICO para Error 404)

**Archivo:** `apps/database/seeds/prod/gamification_system/03-maya_ranks.sql`

| Rango | XP Mínimo | XP Máximo | Multiplicador |
|-------|-----------|-----------|---------------|
| Ajaw | 0 | 499 | 1.00 |
| Nacom | 500 | 999 | 1.10 |
| Ah K'in | 1000 | 1499 | 1.15 |
| Halach Uinic | 1500 | 1899 | 1.20 |
| K'uk'ulkan | 1900 | ∞ | 1.25 |

### 3.3 Modules (CRÍTICO para Error 500)

**Archivo:** `apps/database/seeds/prod/educational_content/01-modules.sql`

| # | Código | Nombre | XP |
|---|--------|--------|-----|
| 1 | MOD-01-LITERAL | Comprensión Literal | 100 |
| 2 | MOD-02-INFERENCIAL | Comprensión Inferencial | 150 |
| 3 | MOD-03-CRITICA | Comprensión Crítica | 200 |
| 4 | MOD-04-DIGITAL | Digital y Multimodal | 175 |
| 5 | MOD-05-PRODUCCION | Producción y Expresión | 250 |

---

## 4. FLUJO DE REGISTRO DE USUARIO

### 4.1 Flujo Esperado

```
1. Usuario se registra
   │
   ├─► auth.service.ts:register()
   │   │
   │   ├─► Crear User en auth.users ✅
   │   │
   │   └─► Crear Profile en auth_management.profiles ✅
   │       │
   │       └─► TRIGGER: trg_initialize_user_stats
   │           │
   │           ├─► INSERT gamification_system.user_stats ❌ (tabla no existe)
   │           │
   │           └─► INSERT gamification_system.user_ranks ❌ (tabla no existe)
```

### 4.2 Trigger de Inicialización

**Archivo:** `apps/database/ddl/schemas/auth_management/triggers/04-trg_initialize_user_stats.sql`

```sql
CREATE TRIGGER trg_initialize_user_stats
  AFTER INSERT ON auth_management.profiles
  FOR EACH ROW
  EXECUTE FUNCTION gamilit.initialize_user_stats();
```

**Función:** `apps/database/ddl/schemas/gamilit/functions/04-initialize_user_stats.sql`

```sql
-- Si el rol es elegible para gamificación
IF NEW.role IN ('student', 'admin_teacher', 'super_admin') THEN
    -- Crear user_stats con 100 ML coins iniciales
    INSERT INTO gamification_system.user_stats (
        user_id, tenant_id, ml_coins, ml_coins_earned_total
    ) VALUES (NEW.user_id, NEW.tenant_id, 100, 100)
    ON CONFLICT (user_id) DO NOTHING;

    -- Crear user_ranks con rango inicial 'Ajaw'
    INSERT INTO gamification_system.user_ranks (
        user_id, tenant_id, current_rank
    ) SELECT NEW.user_id, NEW.tenant_id, 'Ajaw'::gamification_system.maya_rank
    WHERE NOT EXISTS (...);
END IF;
```

### 4.3 Problema Identificado

El trigger **NO puede ejecutarse** porque:
1. La tabla `gamification_system.user_stats` NO EXISTE en producción
2. La tabla `gamification_system.user_ranks` NO EXISTE en producción
3. El trigger probablemente falla silenciosamente

---

## 5. DATASOURCES CONFIRMADOS

### 5.1 Configuración TypeORM

**Archivo:** `apps/backend/src/app.module.ts`

| Datasource | Schema | Entidades Principales |
|------------|--------|----------------------|
| `auth` | `auth_management` | User, Profile, Tenant, Role (14) |
| `educational` | `educational_content` | Module, Exercise, Assignment (12) |
| `gamification` | `gamification_system` | UserStats, UserRanks, Mission (18) |
| `progress` | `progress_tracking` | ModuleProgress, LearningSession (13) |
| `social` | `social_features` | School, Classroom, Friendship |
| `content` | `content_management` | ContentTemplate, MediaFile |
| `audit` | `audit_logging` | AuditLog, SystemLog |
| `notifications` | `notifications` | Notification, NotificationQueue (6) |
| `communication` | `communication` | Message, StudentInterventionAlert |

### 5.2 Problema de Notifications

**Conflicto identificado:**

```typescript
// Sistema básico (legacy)
@Entity({ schema: 'gamification_system', name: 'notifications' })
export class Notification // → datasource 'gamification'

// Sistema consolidado (EXT-003)
@Entity({ schema: 'notifications', name: 'notifications' })
export class Notification // → datasource 'notifications'
```

`NotificationsService` inyecta `@InjectRepository(Notification, 'gamification')` pero el módulo registra la entidad del sistema consolidado con datasource `'notifications'`.

---

## 6. VERIFICACIONES PENDIENTES EN PRODUCCIÓN

### 6.1 Queries de Diagnóstico

```sql
-- 1. Verificar schemas existentes
SELECT schema_name FROM information_schema.schemata
WHERE schema_name IN (
    'gamification_system', 'progress_tracking',
    'educational_content', 'notifications'
);

-- 2. Verificar tablas críticas
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_schema = 'gamification_system'
  AND table_name IN ('notifications', 'user_stats', 'user_ranks', 'mission_templates');

SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_schema = 'progress_tracking'
  AND table_name = 'module_progress';

SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_schema = 'educational_content'
  AND table_name = 'modules';

-- 3. Verificar trigger
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trg_initialize_user_stats';

-- 4. Verificar función
SELECT routine_name, routine_schema
FROM information_schema.routines
WHERE routine_name = 'initialize_user_stats';

-- 5. Contar seeds existentes
SELECT COUNT(*) as mission_templates FROM gamification_system.mission_templates;
SELECT COUNT(*) as maya_ranks FROM gamification_system.maya_ranks;
SELECT COUNT(*) as modules FROM educational_content.modules;
```

---

## 7. RESUMEN DE OBJETOS FALTANTES

### 7.1 Tablas Críticas

| Schema | Tabla | Estado |
|--------|-------|--------|
| `gamification_system` | `notifications` | ❌ Faltante |
| `gamification_system` | `user_stats` | ❌ Faltante |
| `gamification_system` | `user_ranks` | ❌ Faltante |
| `gamification_system` | `mission_templates` | ❌ Faltante |
| `gamification_system` | `missions` | ❌ Faltante |
| `gamification_system` | `maya_ranks` | ❌ Faltante |
| `progress_tracking` | `module_progress` | ❌ Faltante |
| `educational_content` | `modules` | ❌ Faltante |

### 7.2 Seeds Críticos

| Schema | Seed | Registros |
|--------|------|-----------|
| `gamification_system` | `mission_templates` | 11 |
| `gamification_system` | `maya_ranks` | 5 |
| `educational_content` | `modules` | 5 |

### 7.3 Triggers Críticos

| Trigger | Tabla | Función |
|---------|-------|---------|
| `trg_initialize_user_stats` | `auth_management.profiles` | `gamilit.initialize_user_stats()` |

---

## 8. SIGUIENTE FASE

**FASE 3:** Planear implementaciones y correcciones
- Definir orden de ejecución de DDL
- Listar scripts a ejecutar
- Identificar dependencias
- Crear plan de rollback

---

**Documento generado por análisis de Fase 2**
