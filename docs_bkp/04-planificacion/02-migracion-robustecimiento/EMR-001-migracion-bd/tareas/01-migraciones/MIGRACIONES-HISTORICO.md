# Histórico de Migraciones - GAMILIT Platform

**Épica:** EMR-001 - Migración y Robustecimiento de BD
**Fecha:** 2025-11-02
**Origen:** `/docs/03-desarrollo/base-de-datos/MIGRACIONES.md`

---

## Resumen Ejecutivo

- **Total de Migraciones:** 19 migraciones aplicadas
- **Patches:** 1 patch crítico (P0-001)
- **Migraciones con Rollback:** 3
- **Estado:** Base de datos en versión estable v1.0
- **Total de Tablas:** 44 tablas
- **Total de Schemas:** 9 schemas

---

## 1. Fases de Migración

### Fase 1: Autenticación y Estructura Base (001-002)

#### Migration 001: Auth Advanced Tables
**Archivo:** `001_auth_advanced_tables.sql`
**Fecha:** 2025-10 (Early)
**Propósito:** Extensión de tablas de autenticación avanzadas

**Tablas creadas:**
- `password_reset_tokens`
- `email_verification_tokens`
- `security_events`
- `user_suspensions`

**Rollback:** `001_auth_advanced_tables_rollback.sql`

---

#### Migration 001b: Remove Email Requirement
**Archivo:** `001_remove_email_requirement.sql`
**Rollback:** `001_remove_email_requirement_rollback.sql`
**Fecha:** 2025-10 (Mid)

**Cambio crítico:**
```sql
-- Hacer email opcional
ALTER TABLE auth_management.profiles
    ALTER COLUMN email DROP NOT NULL;
```

**Justificación:** Soporte para autenticación con username o identificadores alternativos

---

#### Migration 002: Admin Tables
**Archivo:** `002_admin_tables.sql`
**Fecha:** 2025-10

**Tablas creadas:**
- Configuración de administradores
- Permisos y roles administrativos
- Dashboards de administración

---

### Fase 2: Contenido Educativo (003)

#### Migration 003: Add Exercise Types
**Archivo:** `003_add_exercise_types.sql`
**Fecha:** 2025-10

**Cambios:**
```sql
ALTER TYPE exercise_type ADD VALUE IF NOT EXISTS 'simulation';
ALTER TYPE exercise_type ADD VALUE IF NOT EXISTS 'virtual_lab';
ALTER TYPE exercise_type ADD VALUE IF NOT EXISTS 'data_analysis';
```

**Nota:** PostgreSQL no permite eliminar valores de ENUMs una vez agregados

---

### Fase 3: Gamificación Avanzada (004)

#### Migration 004: Missions Tables
**Archivo:** `004_missions_tables.sql`
**Fecha:** 2025-10

**Tabla creada:**
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

**RLS Policies:** Habilitado

---

#### Migration 004b: Missions Install
**Archivo:** `004_missions_install.sql`
**Propósito:** Scripts de instalación adicionales para sistema de misiones

---

### Fase 4: Módulo de Profesores (005-006)

#### Migration 005: Teacher Tables
**Archivo:** `005_teacher_tables.sql`

**Tablas creadas:**
- `teacher_module.classrooms`
- `teacher_module.classroom_students`
- `teacher_module.assignments`
- `teacher_module.assignment_exercises`
- `teacher_module.assignment_classrooms`
- `teacher_module.assignment_students`
- `teacher_module.assignment_submissions`

**Nota:** Existe overlap con `social_features.classrooms` (consolidación pendiente)

---

#### Migration 006: Teacher Module Updates
**Archivo:** `006_teacher_module_updates.sql`
**Propósito:** Actualizaciones y refinamientos al módulo de profesores

---

### Fase 5: Notificaciones (007, 010)

#### Migration 007: Notifications Table
**Archivo:** `007_notifications_table.sql`

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
```

**Índices para performance:**
- `idx_notifications_user_id`
- `idx_notifications_user_read`
- `idx_notifications_user_created`
- `idx_notifications_data_gin` (GIN en JSONB)

---

#### Migration 010: Update Notification Types
**Archivo:** `010_update_notification_types.sql`

**Tipos de notificaciones:**
- `achievement_unlocked`
- `rank_promotion`
- `mission_assigned`
- `mission_completed`
- `assignment_graded`
- `classroom_invite`
- `friend_request`
- `system_announcement`

---

### Fase 6: Administración Avanzada (008)

#### Migration 008: Admin Module Tables
**Archivo:** `008_admin_module_tables.sql`
**Propósito:** Tablas adicionales para administración avanzada

---

### Fase 7: Leaderboards y Analytics (009)

#### Migration 009: Create Leaderboards Views
**Archivo:** `009_create_leaderboards_views.sql`

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
```

**Refresh strategy:** Cada 5 minutos (CONCURRENTLY)

---

### Fase 8: Critical Fixes (011-013)

#### Migration 011: Fix ENUMs Critical
**Archivo:** `011_fix_enums_critical.sql`
**Rollback:** `011_fix_enums_critical_DOWN.sql`
**Fecha:** 2025-10-20
**Impacto:** CRÍTICO

**Problemas resueltos:**
1. **maya_rank → rango_maya:** Rename de tipo
2. **UPPERCASE → lowercase:** Conversión de valores
3. **difficulty_level:** Agregar `beginner`, `intermediate`, `advanced`
4. **comodin_type:** Crear tipo faltante
5. **content_status:** Duplicar desde module_status
6. **processing_status:** Crear tipo faltante
7. **achievement_category:** Crear tipo faltante

**Lecciones aprendidas:**
- Validar ENUMs en fase de diseño
- Mantener consistencia de nomenclatura
- Agregar todos los valores necesarios desde el inicio

---

#### Migration 012: Validate ENUMs
**Archivo:** `012_validate_enums.sql`
**Propósito:** Validación post-migración de ENUMs

---

#### Migration 013: Hash Refresh Tokens Security Fix
**Archivo:** `013_hash_refresh_tokens_security_fix.sql`
**Rollback:** `013_hash_refresh_tokens_security_fix_ROLLBACK.sql`
**Fecha:** 2025-10-21

**Cambios:**
```sql
ALTER TABLE auth_management.user_sessions
    ADD COLUMN refresh_token_hash VARCHAR(255);

CREATE INDEX idx_user_sessions_refresh_hash
    ON auth_management.user_sessions(refresh_token_hash);
```

**Justificación:** Refresh tokens en plaintext son riesgo de seguridad

---

### Fase 9: Data Fixes

#### Migration: Backfill User Levels
**Archivo:** `backfill-user-levels.sql`

**Script:**
```sql
UPDATE gamification_system.user_stats
SET level = FLOOR(SQRT(total_xp::numeric / 100.0)) + 1
WHERE level != FLOOR(SQRT(total_xp::numeric / 100.0)) + 1;
```

---

### Fase 10: Patches Críticos

#### Patch P0-001: Social Tables Fix
**Archivo:** `P0-001-social-tables-fix.sql`
**Rollback:** `P0-001-rollback.sql`

**Cambios:**
- Fix de foreign keys en `friendships`
- Fix de check constraints en `team_members`
- Agregar missing table: `team_challenges`

---

## 2. Estrategia de Rollback

### Migraciones con Rollback Disponible
- `001_remove_email_requirement`
- `011_fix_enums_critical`
- `013_hash_refresh_tokens_security_fix`
- `P0-001-social-tables-fix`

### Migraciones Irreversibles
- Agregar valores a ENUMs
- Migraciones de datos (backfills)
- Algunos cambios de schema destructivos

**Estrategia:** Backup de base de datos antes de aplicar migraciones críticas

---

## 3. Historia de Versiones

| Versión | Fecha      | Descripción                          | Migraciones           |
|---------|------------|--------------------------------------|-----------------------|
| v0.1    | 2025-10-15 | Setup inicial                        | 001-003               |
| v0.2    | 2025-10-18 | Gamificación completa                | 004-007               |
| v0.3    | 2025-10-20 | Fix crítico de ENUMs                 | 011-012               |
| v0.4    | 2025-10-21 | Security hardening                   | 013                   |
| v1.0    | 2025-10-27 | Versión estable de producción        | Todas (001-013)       |

**Versión actual:** v1.0

---

## 4. Referencias

- **Origen:** `/docs/03-desarrollo/base-de-datos/MIGRACIONES.md`
- **Esquema Completo:** `tareas/03-documentacion/ESQUEMA-COMPLETO.md`
- **Scripts:** `/docs/03-desarrollo/base-de-datos/backup-ddl/`

---

**Última actualización:** 2025-11-02
**Consolidado por:** ARTEMIS (Agente de Migración)
