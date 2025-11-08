# Historial de Migraciones - GAMILIT Platform

**Plataforma:** GAMILIT(Gamified Learning Interactive Toolkit)
**Base de datos:** PostgreSQL 14+
**Última actualización:** 2025-10-27

---

## Resumen Ejecutivo

- **Total de Migraciones:** 19 migraciones aplicadas
- **Patches:** 1 patch crítico
- **Migraciones con Rollback:** 3
- **Estado:** Base de datos en versión estable

---

## 1. Estrategia de Migraciones

### 1.1 Nomenclatura
```
[NUMBER]_[DESCRIPTION].sql

Ejemplos:
001_auth_advanced_tables.sql
011_fix_enums_critical.sql
```

### 1.2 Tipos de Archivos
- **Migraciones (UP):** Archivo principal con nombre descriptivo
- **Rollbacks (DOWN):** Archivo con sufijo `_rollback` o `_DOWN`
- **Patches:** Prefijo `P0-` para fixes críticos

---

## 2. Listado Completo de Migraciones

### 2.1 Phase 1: Autenticación y Estructura Base

#### Migration 001: Auth Advanced Tables
**Archivo:** `001_auth_advanced_tables.sql`
**Fecha:** 2025-10 (Early)
**Propósito:** Extensión de tablas de autenticación avanzadas.

**Cambios:**
- Tablas adicionales de autenticación:
  - `password_reset_tokens`
  - `email_verification_tokens`
  - `security_events`
  - `user_suspensions`

**Rollback:** `001_auth_advanced_tables_rollback.sql` (si existe)

**DDL Key:**
```sql
CREATE TABLE auth_management.password_reset_tokens (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    token_hash VARCHAR(255) UNIQUE,
    expires_at TIMESTAMPTZ,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ
);
```

---

#### Migration 001b: Remove Email Requirement
**Archivo:** `001_remove_email_requirement.sql`
**Rollback:** `001_remove_email_requirement_rollback.sql`
**Fecha:** 2025-10 (Mid)
**Propósito:** Hacer email opcional para nuevos modelos de autenticación.

**Cambios:**
```sql
-- Antes: email TEXT UNIQUE NOT NULL
-- Después: email TEXT UNIQUE
ALTER TABLE auth_management.profiles
    ALTER COLUMN email DROP NOT NULL;
```

**Justificación:** Soporte para autenticación con username o identificadores alternativos.

---

### 2.2 Phase 2: Módulos Administrativos

#### Migration 002: Admin Tables
**Archivo:** `002_admin_tables.sql`
**Fecha:** 2025-10
**Propósito:** Tablas para módulo de administración.

**Tablas creadas:**
- Tablas de configuración de administradores
- Permisos y roles administrativos
- Dashboards de administración

---

### 2.3 Phase 3: Contenido Educativo

#### Migration 003: Add Exercise Types
**Archivo:** `003_add_exercise_types.sql`
**Fecha:** 2025-10
**Propósito:** Agregar nuevos tipos de ejercicios al ENUM `exercise_type`.

**Cambios:**
```sql
-- Agregar tipos faltantes a exercise_type
ALTER TYPE exercise_type ADD VALUE IF NOT EXISTS 'simulation';
ALTER TYPE exercise_type ADD VALUE IF NOT EXISTS 'virtual_lab';
ALTER TYPE exercise_type ADD VALUE IF NOT EXISTS 'data_analysis';
```

**Nota:** PostgreSQL no permite eliminar valores de ENUMs una vez agregados.

---

### 2.4 Phase 4: Gamificación Avanzada

#### Migration 004: Missions Tables
**Archivo:** `004_missions_tables.sql`
**Fecha:** 2025-10
**Propósito:** Sistema de misiones diarias/semanales.

**Tablas creadas:**
```sql
CREATE TABLE gamification_system.missions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    template_id TEXT NOT NULL,
    title TEXT NOT NULL,
    mission_type TEXT CHECK (mission_type IN ('daily', 'weekly', 'special')),
    objectives JSONB NOT NULL,
    rewards JSONB NOT NULL,
    status TEXT,
    progress FLOAT,
    start_date TIMESTAMP,
    end_date TIMESTAMP
);
```

**RLS Policies:** Habilitado (usuarios ven solo sus misiones).

---

#### Migration 004b: Missions Install
**Archivo:** `004_missions_install.sql`
**Fecha:** 2025-10
**Propósito:** Scripts de instalación adicionales para sistema de misiones.

---

### 2.5 Phase 5: Módulo de Profesores

#### Migration 005: Teacher Tables
**Archivo:** `005_teacher_tables.sql`
**Fecha:** 2025-10
**Propósito:** Funcionalidades específicas para profesores.

**Tablas creadas:**
- `teacher_module.classrooms` (versión para profesores)
- `teacher_module.classroom_students`
- `teacher_module.assignments`
- `teacher_module.assignment_exercises`
- `teacher_module.assignment_classrooms`
- `teacher_module.assignment_students`
- `teacher_module.assignment_submissions`

**Nota:** Existe overlap con `social_features.classrooms` (consolidación pendiente).

---

#### Migration 006: Teacher Module Updates
**Archivo:** `006_teacher_module_updates.sql`
**Fecha:** 2025-10
**Propósito:** Actualizaciones y refinamientos al módulo de profesores.

---

### 2.6 Phase 6: Notificaciones

#### Migration 007: Notifications Table
**Archivo:** `007_notifications_table.sql`
**Fecha:** 2025-10
**Propósito:** Sistema de notificaciones en tiempo real.

**Tabla creada:**
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    type VARCHAR(100),
    title VARCHAR(255),
    message TEXT,
    data JSONB,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);

-- Índices para performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_data_gin ON notifications USING GIN(data);
```

**Trigger:**
```sql
CREATE TRIGGER trigger_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.update_updated_at_column();
```

---

#### Migration 010: Update Notification Types
**Archivo:** `010_update_notification_types.sql`
**Fecha:** 2025-10
**Propósito:** Refinamiento de tipos de notificaciones.

**Tipos de notificaciones:**
- `achievement_unlocked` - Logro desbloqueado
- `rank_promotion` - Promoción de rango Maya
- `mission_assigned` - Nueva misión asignada
- `mission_completed` - Misión completada
- `assignment_graded` - Tarea calificada
- `classroom_invite` - Invitación a aula
- `friend_request` - Solicitud de amistad
- `system_announcement` - Anuncio del sistema

---

### 2.7 Phase 7: Administración Avanzada

#### Migration 008: Admin Module Tables
**Archivo:** `008_admin_module_tables.sql`
**Fecha:** 2025-10
**Propósito:** Tablas adicionales para administración avanzada.

---

### 2.8 Phase 8: Leaderboards y Analytics

#### Migration 009: Create Leaderboards Views
**Archivo:** `009_create_leaderboards_views.sql`
**Fecha:** 2025-10
**Propósito:** Vistas materializadas para leaderboards de alto performance.

**Vista materializada creada:**
```sql
CREATE MATERIALIZED VIEW gamification_system.leaderboards_view AS
SELECT
    p.id as user_id,
    p.display_name,
    p.avatar_url,
    us.level,
    us.total_xp,
    us.ml_coins,
    us.current_streak,
    us.global_rank_position,
    ur.current_rank as maya_rank,
    p.tenant_id
FROM auth_management.profiles p
JOIN gamification_system.user_stats us ON p.id = us.user_id
JOIN gamification_system.user_ranks ur ON p.id = ur.user_id AND ur.is_current = true
WHERE p.status = 'active';

-- Índices en vista
CREATE UNIQUE INDEX idx_leaderboards_user_id
    ON gamification_system.leaderboards_view(user_id);
CREATE INDEX idx_leaderboards_level
    ON gamification_system.leaderboards_view(level DESC);
CREATE INDEX idx_leaderboards_xp
    ON gamification_system.leaderboards_view(total_xp DESC);
```

**Refresh strategy:**
```sql
-- Job periódico (cada 5 minutos)
REFRESH MATERIALIZED VIEW CONCURRENTLY gamification_system.leaderboards_view;
```

---

### 2.9 Phase 9: Critical Fixes

#### Migration 011: Fix ENUMs Critical
**Archivo:** `011_fix_enums_critical.sql`
**Rollback:** `011_fix_enums_critical_DOWN.sql`
**Fecha:** 2025-10-20
**Propósito:** Corrección crítica de ENUMs inconsistentes.

**Problemas resueltos:**
1. **maya_rank → rango_maya:** Rename de tipo
2. **UPPERCASE → lowercase:** Conversión de valores de rango_maya
3. **difficulty_level:** Agregar `beginner`, `intermediate`, `advanced`
4. **comodin_type:** Crear tipo faltante
5. **content_status:** Duplicar desde module_status
6. **processing_status:** Crear tipo faltante
7. **achievement_category:** Crear tipo faltante

**DDL key:**
```sql
-- Fix 1: Rename maya_rank to rango_maya
ALTER TYPE maya_rank RENAME TO rango_maya;

-- Fix 2: Convert to lowercase values
CREATE TYPE rango_maya_new AS ENUM (
    'nacom', 'batab', 'holcatte', 'guerrero', 'mercenario'
);
DROP TYPE rango_maya CASCADE;
ALTER TYPE rango_maya_new RENAME TO rango_maya;

-- Fix 3: Add missing difficulty values
ALTER TYPE difficulty_level ADD VALUE IF NOT EXISTS 'beginner';
ALTER TYPE difficulty_level ADD VALUE IF NOT EXISTS 'intermediate';
ALTER TYPE difficulty_level ADD VALUE IF NOT EXISTS 'advanced';

-- Fix 4: Create comodin_type
CREATE TYPE comodin_type AS ENUM (
    'pistas', 'vision_lectora', 'segunda_oportunidad'
);

-- Fix 5: Create content_status
CREATE TYPE content_status AS ENUM (
    'draft', 'published', 'archived', 'under_review'
);

-- Fix 6: Create processing_status
CREATE TYPE processing_status AS ENUM (
    'uploading', 'processing', 'ready', 'error', 'optimizing'
);

-- Fix 7: Create achievement_category
CREATE TYPE achievement_category AS ENUM (
    'progress', 'streak', 'completion', 'social',
    'special', 'mastery', 'exploration'
);
```

**Impacto:** Crítico - Base de datos no funcional sin estos fixes.

**Lecciones aprendidas:**
- Validar ENUMs en fase de diseño
- Mantener consistencia de nomenclatura
- Agregar todos los valores necesarios desde el inicio

---

#### Migration 012: Validate ENUMs
**Archivo:** `012_validate_enums.sql`
**Fecha:** 2025-10-20
**Propósito:** Validación post-migración de ENUMs.

**Verificaciones:**
```sql
-- Verificar que todos los ENUMs existen
SELECT typname FROM pg_type WHERE typname IN (
    'gamilit_role', 'user_status', 'rango_maya',
    'achievement_category', 'exercise_type', 'difficulty_level',
    'comodin_type', 'content_status', 'processing_status'
);

-- Verificar valores de rango_maya
SELECT enumlabel FROM pg_enum
WHERE enumtypid = 'rango_maya'::regtype
ORDER BY enumsortorder;
-- Debe retornar: nacom, batab, holcatte, guerrero, mercenario
```

---

#### Migration 013: Hash Refresh Tokens Security Fix
**Archivo:** `013_hash_refresh_tokens_security_fix.sql`
**Rollback:** `013_hash_refresh_tokens_security_fix_ROLLBACK.sql`
**Fecha:** 2025-10-21
**Propósito:** Security hardening de refresh tokens.

**Cambios:**
```sql
-- Agregar columna para hash de refresh token
ALTER TABLE auth_management.user_sessions
    ADD COLUMN refresh_token_hash VARCHAR(255);

-- Índice en hash
CREATE INDEX idx_user_sessions_refresh_hash
    ON auth_management.user_sessions(refresh_token_hash);

-- Deprecar columna plaintext (no eliminar por compatibilidad)
-- refresh_token ahora se almacena hasheado en refresh_token_hash
```

**Justificación:** Refresh tokens en plaintext son riesgo de seguridad.

**Implementación recomendada:**
- Backend hashea token con bcrypt/argon2 antes de almacenar
- Token plaintext nunca se almacena en BD
- Comparación usa hash comparison seguro

---

### 2.10 Phase 10: Data Fixes

#### Migration: Backfill User Levels
**Archivo:** `backfill-user-levels.sql`
**Fecha:** 2025-10-21
**Propósito:** Recalcular niveles de usuarios existentes.

**Script:**
```sql
-- Recalcular niveles para usuarios con XP pero nivel incorrecto
UPDATE gamification_system.user_stats
SET level = FLOOR(SQRT(total_xp::numeric / 100.0)) + 1
WHERE level != FLOOR(SQRT(total_xp::numeric / 100.0)) + 1;

-- Verificación
SELECT
    user_id,
    total_xp,
    level as current_level,
    FLOOR(SQRT(total_xp::numeric / 100.0)) + 1 as calculated_level
FROM gamification_system.user_stats
WHERE level != FLOOR(SQRT(total_xp::numeric / 100.0)) + 1;
```

**Casos de uso:**
- Migración de usuarios legacy
- Fix de inconsistencias de datos
- Aplicación retroactiva de trigger `trg_recalculate_level_on_xp_change`

---

### 2.11 Patches Críticos

#### Patch P0-001: Social Tables Fix
**Archivo:** `P0-001-social-tables-fix.sql`
**Rollback:** `P0-001-rollback.sql`
**Fecha:** 2025-10
**Propósito:** Fix crítico en tablas de features sociales.

**Problema:** Tablas de social_features con constraints incorrectos.

**Cambios:**
- Fix de foreign keys en `friendships`
- Fix de check constraints en `team_members`
- Agregar missing tables: `team_challenges`

---

## 3. Orden de Ejecución

### 3.1 Para Setup Completo desde Cero
```bash
# 1. Prerequisites (OBLIGATORIO PRIMERO)
psql -f 00_prerequisites.sql

# 2. Clean DDL (en orden)
psql -f clean_ddl/01_auth_management_tables.sql
psql -f clean_ddl/02_gamification_tables.sql
psql -f clean_ddl/03_educational_content_tables.sql
psql -f clean_ddl/04_progress_tracking_tables.sql
psql -f clean_ddl/05_social_features_tables.sql
psql -f clean_ddl/05b_social_features_missing_tables.sql
psql -f clean_ddl/06_content_management_tables.sql
psql -f clean_ddl/07_system_configuration_tables.sql
psql -f clean_ddl/08_audit_logging_tables.sql
psql -f clean_ddl/09_constraints_and_indexes.sql
psql -f clean_ddl/10_functions.sql
psql -f clean_ddl/11_triggers.sql
psql -f clean_ddl/12_rls_policies.sql

# 3. Migraciones (en orden numérico)
psql -f migrations/001_auth_advanced_tables.sql
psql -f migrations/002_admin_tables.sql
# ... (resto de migraciones en orden)
psql -f migrations/013_hash_refresh_tokens_security_fix.sql

# 4. Patches si es necesario
psql -f patches/P0-001-social-tables-fix.sql

# 5. Seed Data
psql -f seed_data/01_achievements_seed.sql
psql -f seed_data/02_system_config_seed.sql
psql -f seed_data/03_educational_modules_seed.sql
psql -f seed_data/04_demo_users_and_data_seed.sql
```

---

### 3.2 Para Aplicar Solo Migraciones en DB Existente
```bash
# Aplicar migraciones nuevas en orden
psql -f migrations/[NUMBER]_[DESCRIPTION].sql
```

---

## 4. Estrategia de Rollback

### 4.1 Migraciones con Rollback Disponible
- `001_remove_email_requirement` → `001_remove_email_requirement_rollback.sql`
- `011_fix_enums_critical` → `011_fix_enums_critical_DOWN.sql`
- `013_hash_refresh_tokens_security_fix` → `013_hash_refresh_tokens_security_fix_ROLLBACK.sql`
- `P0-001-social-tables-fix` → `P0-001-rollback.sql`

### 4.2 Aplicar Rollback
```bash
psql -f migrations/[MIGRATION]_rollback.sql
# o
psql -f migrations/[MIGRATION]_DOWN.sql
```

### 4.3 Migraciones sin Rollback
**Migraciones irreversibles:**
- Agregar valores a ENUMs (PostgreSQL no permite eliminar valores)
- Migraciones de datos (backfills)
- Algunos cambios de schema destructivos

**Estrategia:** Backup de base de datos antes de aplicar migraciones críticas.

---

## 5. Testing de Migraciones

### 5.1 Pre-flight Checks
```sql
-- 1. Verificar ENUMs existen
SELECT typname FROM pg_type WHERE typname IN ('gamilit_role', 'rango_maya', 'comodin_type');

-- 2. Verificar schemas existen
SELECT schema_name FROM information_schema.schemata
WHERE schema_name IN ('gamilit', 'auth_management', 'gamification_system');

-- 3. Verificar tablas principales existen
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_schema IN ('auth_management', 'gamification_system')
  AND table_type = 'BASE TABLE';
```

### 5.2 Post-migration Validation
```sql
-- 1. Verificar constraints
SELECT conname, contype FROM pg_constraint
WHERE conrelid = 'gamification_system.user_stats'::regclass;

-- 2. Verificar índices
SELECT indexname, indexdef FROM pg_indexes
WHERE schemaname = 'gamification_system' AND tablename = 'user_stats';

-- 3. Verificar triggers
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth_management'
  AND event_object_table = 'profiles';

-- 4. Verificar datos seed
SELECT COUNT(*) FROM gamification_system.achievements;
SELECT COUNT(*) FROM educational_content.modules;
```

---

## 6. Mejores Prácticas

### 6.1 Nomenclatura
- **Prefijo numérico:** 001, 002, 003 (no 1, 2, 3)
- **Descripción clara:** `fix_enums_critical` mejor que `fix_bug`
- **Sufijos:** `_rollback`, `_DOWN` para rollbacks

### 6.2 Contenido de Migración
- **Idempotencia:** Usar `IF EXISTS`, `IF NOT EXISTS`
- **Transacciones:** Wrap en `BEGIN...COMMIT`
- **Comentarios:** Explicar el "por qué", no solo el "qué"
- **Validaciones:** Incluir checks al final

### 6.3 Testing
- **Ambiente de desarrollo primero**
- **Datos de prueba:** Aplicar en DB con datos reales (copia)
- **Rollback:** Probar rollback antes de aplicar en producción

### 6.4 Documentación
- **Migration log:** Mantener este documento actualizado
- **Breaking changes:** Documentar impacto en aplicaciones
- **Deprecations:** Anunciar con anticipación

---

## 7. Migraciones Pendientes (Roadmap)

### 7.1 Short-term
- [ ] Consolidar tablas duplicadas de classrooms
- [ ] Agregar índices faltantes identificados en monitoring
- [ ] Migrar datos legacy de ejercicios

### 7.2 Long-term
- [ ] Partitioning de tablas de logs (ml_coins_transactions, audit_logs)
- [ ] Sharding por tenant_id para multi-tenancy escalable
- [ ] Migración a TimescaleDB para tablas de series de tiempo

---

## 8. Archivos de Referencia

```
/home/isem/workspace/projects/glit/database/
├── 00_prerequisites.sql                # SIEMPRE PRIMERO
├── clean_ddl/                          # Schema base
│   ├── 01_auth_management_tables.sql
│   ├── 02_gamification_tables.sql
│   └── ... (12 archivos)
├── migrations/                         # Migraciones
│   ├── 001_auth_advanced_tables.sql
│   ├── 011_fix_enums_critical.sql
│   ├── 013_hash_refresh_tokens_security_fix.sql
│   └── ... (19 archivos)
├── patches/                            # Patches críticos
│   ├── P0-001-social-tables-fix.sql
│   └── P0-001-rollback.sql
└── seed_data/                          # Datos iniciales
    ├── 01_achievements_seed.sql
    └── ... (9 archivos)
```

---

## 9. Historia de Versiones de Base de Datos

| Versión | Fecha      | Descripción                          | Migraciones           |
|---------|------------|--------------------------------------|-----------------------|
| v0.1    | 2025-10-15 | Setup inicial                        | 001-003               |
| v0.2    | 2025-10-18 | Gamificación completa                | 004-007               |
| v0.3    | 2025-10-20 | Fix crítico de ENUMs                 | 011-012               |
| v0.4    | 2025-10-21 | Security hardening                   | 013                   |
| v1.0    | 2025-10-27 | Versión estable de producción        | Todas (001-013)       |

**Versión actual:** v1.0

---

**Documento generado:** 2025-10-27
**Versión de base de datos:** PostgreSQL 14+
**Plataforma:** GAMILIT(Gamified Learning Interactive Toolkit)
