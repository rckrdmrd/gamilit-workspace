# Plan de Migración: ENUMs desde Public Schema

**Fecha**: 2025-11-08
**Versión**: 1.0
**Responsable**: Validación y Alineación Backend-BD
**Estado**: EN REVISIÓN

## Resumen Ejecutivo

Este documento presenta el plan de migración para reubicar **10 ENUMs** que actualmente residen en el schema `public` hacia sus schemas correctos según la arquitectura multi-schema de Gamilit.

### Métricas Actuales

- **Total ENUMs en proyecto**: 35
- **ENUMs correctamente ubicados**: 25 (71%)
- **ENUMs en public schema (incorrecto)**: 10 (29%)
- **Impacto estimado**: MEDIO
- **Esfuerzo estimado**: 2-3 días de desarrollo

---

## 1. ENUMs a Migrar

### 1.1 Autenticación (1 ENUM)

#### 🔴 P1: `public.auth_provider` → `auth_management.auth_provider`

**Ubicación actual**: `apps/database/ddl/00-prerequisites.sql:48`

**Valores**:
```sql
CREATE TYPE auth_management.auth_provider AS ENUM (
    'local', 'google', 'facebook', 'apple', 'microsoft', 'github'
);
```

**Tablas afectadas**:
- `auth_management.user_accounts.auth_provider`
- `auth_management.user_external_auth.provider`

**Entidades backend afectadas**:
- `apps/backend/src/modules/auth/entities/user-account.entity.ts`
- `apps/backend/src/modules/auth/entities/user-external-auth.entity.ts`

**Documentación**:
- RF: `docs/01-requerimientos/01-autenticacion-autorizacion/RF-AUTH-003-oauth.md`
- ET: `docs/02-especificaciones-tecnicas/01-autenticacion-autorizacion/ET-AUTH-003-oauth.md`

**Prioridad**: P1 (Alta)
**Justificación**: Pertenece lógicamente al schema de autenticación

---

### 1.2 Gamificación y Notificaciones (2 ENUMs)

#### 🔴 P1: `public.notification_type` → `gamification_system.notification_type`

**Ubicación actual**: `apps/database/ddl/00-prerequisites.sql:84`

**Valores**:
```sql
CREATE TYPE gamification_system.notification_type AS ENUM (
    'achievement_unlocked',
    'rank_up',
    'friend_request',
    'guild_invitation',
    'mission_completed',
    'level_up',
    'message_received',
    'system_announcement',
    'ml_coins_earned',
    'streak_milestone',
    'exercise_feedback'
);
```

**Tablas afectadas**:
- `gamification_system.notifications.notification_type`

**Entidades backend afectadas**:
- `apps/backend/src/modules/gamification/entities/notification.entity.ts`

**Documentación**:
- RF: `docs/01-requerimientos/06-notificaciones/RF-NOT-001-tipos-notificaciones.md`
- ET: `docs/02-especificaciones-tecnicas/06-notificaciones/ET-NOT-001-tipos-notificaciones.md`

**Prioridad**: P1 (Alta)
**Justificación**: Notificaciones están relacionadas con eventos de gamificación

---

#### 🔴 P1: `public.notification_priority` → `gamification_system.notification_priority`

**Ubicación actual**: `apps/database/ddl/00-prerequisites.sql:103`

**Valores**:
```sql
CREATE TYPE gamification_system.notification_priority AS ENUM (
    'low', 'medium', 'high', 'critical'
);
```

**Tablas afectadas**:
- `gamification_system.notifications.priority`

**Entidades backend afectadas**:
- `apps/backend/src/modules/gamification/entities/notification.entity.ts`

**Documentación**:
- RF: `docs/01-requerimientos/06-notificaciones/RF-NOT-001-tipos-notificaciones.md`
- ET: `docs/02-especificaciones-tecnicas/06-notificaciones/ET-NOT-001-tipos-notificaciones.md`

**Prioridad**: P1 (Alta)
**Justificación**: Acompaña a notification_type

---

### 1.3 Contenido Educativo (1 ENUM)

#### 🟡 P2: `public.difficulty_level` → `educational_content.difficulty_level`

**Ubicación actual**: `apps/database/ddl/00-prerequisites.sql:131`

**Valores**:
```sql
CREATE TYPE educational_content.difficulty_level AS ENUM (
    'beginner', 'intermediate', 'advanced',
    'very_easy', 'easy', 'medium', 'hard', 'very_hard'
);
```

**Tablas afectadas**:
- `educational_content.modules.difficulty_level`
- `educational_content.exercises.difficulty_level`

**Entidades backend afectadas**:
- `apps/backend/src/modules/educational/entities/module.entity.ts`
- `apps/backend/src/modules/educational/entities/exercise.entity.ts`

**Documentación**:
- No tiene RF/ET específico (tipo compartido)

**Prioridad**: P2 (Media)
**Justificación**: Usado principalmente en contenido educativo

**Nota**: ⚠️ Existe migración previa en `migrations/2025-11-08-migrate-difficulty-level-enum.sql` que podría estar incompleta o no aplicada

---

### 1.4 Gestión de Contenido (4 ENUMs)

#### 🟡 P2: `public.content_status` → `content_management.content_status`

**Ubicación actual**: `apps/database/ddl/00-prerequisites.sql:139`

**Valores**:
```sql
CREATE TYPE content_management.content_status AS ENUM (
    'draft', 'published', 'archived', 'under_review'
);
```

**Tablas afectadas**:
- `content_management.content_templates.status`
- Potencialmente otras tablas de contenido

**Entidades backend afectadas**:
- `apps/backend/src/modules/content/entities/content-template.entity.ts`

**Documentación**:
- No tiene RF/ET específico (tipo compartido)

**Prioridad**: P2 (Media)
**Justificación**: Genérico para gestión de contenido

**Nota**: ⚠️ Existe duplicación con `educational_content.module_status` - revisar si se pueden consolidar

---

#### 🟡 P2: `public.media_type` → `content_management.media_type`

**Ubicación actual**: `apps/database/ddl/00-prerequisites.sql:150`

**Valores**:
```sql
CREATE TYPE content_management.media_type AS ENUM (
    'image', 'video', 'audio', 'document', 'interactive'
);
```

**Tablas afectadas**:
- `content_management.media_files.media_type`

**Entidades backend afectadas**:
- `apps/backend/src/modules/content/entities/media-file.entity.ts`

**Documentación**:
- RF: `docs/01-requerimientos/07-contenido-media/RF-CNT-001-gestion-media.md`
- ET: `docs/02-especificaciones-tecnicas/07-contenido-media/ET-CNT-001-gestion-media.md`

**Prioridad**: P2 (Media)
**Justificación**: Específico de gestión de archivos multimedia

---

#### 🟡 P2: `public.processing_status` → `content_management.processing_status`

**Ubicación actual**: `apps/database/ddl/00-prerequisites.sql:157`

**Valores**:
```sql
CREATE TYPE content_management.processing_status AS ENUM (
    'pending', 'processing', 'completed', 'failed'
);
```

**Tablas afectadas**:
- `content_management.media_files.processing_status`

**Entidades backend afectadas**:
- `apps/backend/src/modules/content/entities/media-file.entity.ts`

**Documentación**:
- RF: `docs/01-requerimientos/07-contenido-media/RF-CNT-001-gestion-media.md`
- ET: `docs/02-especificaciones-tecnicas/07-contenido-media/ET-CNT-001-gestion-media.md`

**Prioridad**: P2 (Media)
**Justificación**: Específico de procesamiento de archivos multimedia

---

#### 🟢 P3: `public.content_type` → `content_management.content_type`

**Ubicación actual**: `apps/database/ddl/schemas/public/enums/content_type.sql`

**Valores**:
```sql
CREATE TYPE content_management.content_type AS ENUM (
    'video', 'text', 'interactive', 'quiz', 'game', 'simulation'
);
```

**Tablas afectadas**:
- Investigar: posiblemente `content_management` tables (no está documentado)

**Entidades backend afectadas**:
- No encontrado en backend actual

**Documentación**:
- Fuente: SA-DB-005

**Prioridad**: P3 (Baja)
**Justificación**: Posiblemente no está en uso actualmente

**Nota**: ⚠️ Verificar si este ENUM está realmente en uso antes de migrar

---

### 1.5 Configuración y Métricas (2 ENUMs)

#### 🟡 P2: `public.setting_type` → `system_configuration.setting_type`

**Ubicación actual**: `apps/database/ddl/00-prerequisites.sql:195`

**Valores**:
```sql
CREATE TYPE system_configuration.setting_type AS ENUM (
    'string', 'number', 'boolean', 'json', 'array'
);
```

**Tablas afectadas**:
- `system_configuration.system_settings.setting_type`

**Entidades backend afectadas**:
- `apps/backend/src/modules/system/entities/system-setting.entity.ts`

**Documentación**:
- No tiene RF/ET específico (tipo de configuración)

**Prioridad**: P2 (Media)
**Justificación**: Específico del schema de configuración del sistema

---

#### 🟢 P3: `public.metric_type` → `admin_dashboard.metric_type`

**Ubicación actual**: `apps/database/ddl/schemas/public/enums/metric_type.sql`

**Valores**:
```sql
CREATE TYPE admin_dashboard.metric_type AS ENUM (
    'engagement', 'performance', 'completion',
    'time_spent', 'accuracy', 'streak', 'social_interaction'
);
```

**Tablas afectadas**:
- Investigar: posiblemente `admin_dashboard` tables (no está documentado)

**Entidades backend afectadas**:
- No encontrado en backend actual

**Documentación**:
- Fuente: SA-DB-005

**Prioridad**: P3 (Baja)
**Justificación**: Posiblemente no está en uso actualmente

**Nota**: ⚠️ Verificar si este ENUM está realmente en uso antes de migrar

---

## 2. Estrategia de Migración

### 2.1 Fases del Proyecto

#### **Fase 1: Preparación** (4 horas)
1. Validar uso actual de cada ENUM en tablas
2. Validar referencias en backend TypeORM
3. Identificar dependencias circulares
4. Crear scripts de validación pre-migración

#### **Fase 2: Migración P1 (Alta Prioridad)** (1 día)
ENUMs a migrar:
- `auth_provider` → `auth_management`
- `notification_type` → `gamification_system`
- `notification_priority` → `gamification_system`

Pasos por ENUM:
1. Crear nuevo ENUM en schema destino
2. Actualizar tablas para usar nuevo ENUM
3. Eliminar ENUM antiguo de public
4. Actualizar entidades backend TypeORM
5. Actualizar constantes TypeScript
6. Probar compilación backend

#### **Fase 3: Migración P2 (Media Prioridad)** (1 día)
ENUMs a migrar:
- `difficulty_level` → `educational_content`
- `content_status` → `content_management`
- `media_type` → `content_management`
- `processing_status` → `content_management`
- `setting_type` → `system_configuration`

Mismo proceso que Fase 2

#### **Fase 4: Migración P3 (Baja Prioridad)** (4 horas)
ENUMs a migrar:
- `content_type` → `content_management` (si está en uso)
- `metric_type` → `admin_dashboard` (si está en uso)

Mismo proceso que Fase 2

#### **Fase 5: Validación Final** (2 horas)
1. Ejecutar tests del backend
2. Validar que no hay errores de compilación
3. Validar integridad referencial en BD
4. Actualizar documentación

---

### 2.2 Template de Migration SQL

Cada migración seguirá este patrón:

```sql
-- ============================================================================
-- MIGRATION: Migrate {enum_name} from public to {target_schema}
-- Date: {YYYY-MM-DD}
-- Priority: {P1|P2|P3}
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: Crear nuevo ENUM en schema destino
-- ============================================================================

DO $$ BEGIN
    CREATE TYPE {target_schema}.{enum_name} AS ENUM (
        {enum_values}
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

COMMENT ON TYPE {target_schema}.{enum_name} IS '{description}';

-- ============================================================================
-- STEP 2: Validar datos existentes
-- ============================================================================

-- Verificar que no hay valores huérfanos
DO $$
DECLARE
    v_invalid_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_invalid_count
    FROM {schema}.{table}
    WHERE {column} IS NOT NULL
      AND {column}::text NOT IN ({enum_values_list});

    IF v_invalid_count > 0 THEN
        RAISE EXCEPTION 'Found % invalid values in {table}.{column}', v_invalid_count;
    END IF;
END $$;

-- ============================================================================
-- STEP 3: Migrar columnas de tablas
-- ============================================================================

-- Para cada tabla que usa el ENUM:
ALTER TABLE {schema}.{table}
  ALTER COLUMN {column} TYPE {target_schema}.{enum_name}
  USING {column}::text::{target_schema}.{enum_name};

-- ============================================================================
-- STEP 4: Eliminar ENUM antiguo de public
-- ============================================================================

DROP TYPE IF EXISTS public.{enum_name};

-- ============================================================================
-- STEP 5: Validación post-migración
-- ============================================================================

-- Verificar que el nuevo ENUM existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_namespace n ON t.typnamespace = n.oid
        WHERE n.nspname = '{target_schema}' AND t.typname = '{enum_name}'
    ) THEN
        RAISE EXCEPTION 'ENUM {target_schema}.{enum_name} was not created';
    END IF;
END $$;

-- Verificar que el antiguo ENUM no existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_namespace n ON t.typnamespace = n.oid
        WHERE n.nspname = 'public' AND t.typname = '{enum_name}'
    ) THEN
        RAISE EXCEPTION 'ENUM public.{enum_name} was not dropped';
    END IF;
END $$;

COMMIT;

-- ============================================================================
-- ROLLBACK SCRIPT
-- ============================================================================

/*
BEGIN;

-- Recrear ENUM en public
CREATE TYPE public.{enum_name} AS ENUM ({enum_values});

-- Revertir columnas a public ENUM
ALTER TABLE {schema}.{table}
  ALTER COLUMN {column} TYPE public.{enum_name}
  USING {column}::text::public.{enum_name};

-- Eliminar nuevo ENUM
DROP TYPE {target_schema}.{enum_name};

COMMIT;
*/
```

---

### 2.3 Template de Actualización Backend

Para cada ENUM migrado, actualizar:

#### **1. Constants file**: `apps/backend/src/shared/constants/enums.constants.ts`

```typescript
// ANTES:
// No cambios necesarios - los valores del ENUM siguen igual

// DESPUÉS:
// Agregar comentario indicando el nuevo schema
/**
 * {EnumName}
 * @database {target_schema}.{enum_name}
 * @version 1.1 (2025-11-08) - Migrado de public a {target_schema}
 */
export enum {EnumName}Enum {
  VALUE_1 = 'value_1',
  // ...
}
```

#### **2. Entity file**: Actualizar decorator

```typescript
// ANTES:
@Column({
  type: 'enum',
  enum: {EnumName}Enum,
  enumName: '{enum_name}', // public.{enum_name}
})

// DESPUÉS:
@Column({
  type: 'enum',
  enum: {EnumName}Enum,
  enumName: '{enum_name}',
  schema: '{target_schema}', // Agregar schema explícito
})
```

**Nota**: Verificar si TypeORM 0.3.17 soporta el parámetro `schema` en el decorator. Si no, podría no ser necesario cambiar nada en el backend si el ENUM mantiene el mismo nombre.

---

## 3. Riesgos y Mitigaciones

### 3.1 Riesgos Identificados

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Dependencias circulares entre schemas | Media | Alto | Ejecutar migraciones en orden correcto (auth → educational → content → system) |
| Datos inconsistentes en tablas | Baja | Alto | Validar datos antes de migración con queries de verificación |
| TypeORM no reconoce schema del ENUM | Media | Medio | Probar en ambiente de desarrollo antes de aplicar en producción |
| Migración interrumpida | Baja | Alto | Usar transacciones y scripts de rollback |
| Backend no compila después de cambios | Media | Alto | Ejecutar `npm run build` después de cada cambio |

### 3.2 Plan de Rollback

Cada migration incluye:
1. Script de rollback comentado al final del archivo
2. Backup de valores antes de modificar
3. Validaciones pre y post migración
4. Logs detallados de cada paso

---

## 4. Checklist de Ejecución

### Pre-Migración
- [ ] Crear branch de git: `feature/migrate-enums-from-public`
- [ ] Backup de base de datos
- [ ] Validar que backend compila: `npm run build`
- [ ] Documentar estado actual de ENUMs

### Durante Migración (por cada ENUM)
- [ ] Crear migration SQL file
- [ ] Ejecutar validación pre-migración
- [ ] Aplicar migration en BD de desarrollo
- [ ] Actualizar entity backend si es necesario
- [ ] Actualizar constants backend (agregar comentarios)
- [ ] Compilar backend: `npm run build`
- [ ] Ejecutar tests: `npm run test`
- [ ] Commit cambios: `git commit -m "feat(db): migrate {enum_name} to {schema}"`

### Post-Migración
- [ ] Ejecutar suite completa de tests
- [ ] Validar integridad referencial
- [ ] Actualizar `00-prerequisites.sql` con nuevas ubicaciones
- [ ] Generar reporte de migración
- [ ] Actualizar este documento con resultados
- [ ] Crear PR para revisión

---

## 5. Orden de Ejecución Recomendado

1. **auth_provider** → `auth_management` (independiente)
2. **notification_type** + **notification_priority** → `gamification_system` (relacionados)
3. **difficulty_level** → `educational_content` (independiente)
4. **media_type** + **processing_status** → `content_management` (relacionados)
5. **content_status** → `content_management` (independiente)
6. **setting_type** → `system_configuration` (independiente)
7. **content_type** → `content_management` (si está en uso)
8. **metric_type** → `admin_dashboard` (si está en uso)

---

## 6. Referencias

### Documentación
- Validación inicial: `REPORTE-VALIDACION-PROYECTO-GAMILIT.md`
- Arquitectura BD: `apps/database/ddl/00-prerequisites.sql`
- ENUMs Backend: `apps/backend/src/shared/constants/enums.constants.ts`

### Migraciones Previas (Referencia)
- `migrations/2025-11-08-migrate-difficulty-level-enum.sql`
- `migrations/2025-11-08-migrate-progress-status-enum.sql`
- `migrations/2025-11-08-migrate-comodin-type-enum.sql`
- `migrations/2025-11-07-fix-achievement-enums-schema.sql`

### ADRs Relacionados
- ADR-004: Gamification System Design
- (Crear) ADR-XXX: Multi-Schema ENUM Organization

---

## 7. Próximos Pasos

1. **Aprobación del Plan**: Revisar este documento con el equipo
2. **Crear Branch**: `git checkout -b feature/migrate-enums-from-public`
3. **Iniciar Fase 1**: Validación y preparación
4. **Ejecutar Fase 2**: Migraciones P1 (ENUMs críticos)

---

**Documento creado**: 2025-11-08
**Última actualización**: 2025-11-08
**Estado**: ✅ Listo para revisión
**Autor**: Sistema de Validación Backend-BD
