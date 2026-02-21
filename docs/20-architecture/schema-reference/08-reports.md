# Schema 8: Reports — social_features (3 tablas, 10 RLS policies)

> **Version:** 2.0.0 | **Fecha:** 2026-02-20
> Las tablas de reportes de maestro residen en `social_features`, no en un schema `reports` separado.
> DDL: `apps/database/ddl/schemas/social_features/tables/08-*.sql`

> Parte de [Schema Reference](_INDEX.md) - GAMILIT

---

## Arquitectura

El sistema de reportes para maestros consta de 3 tablas:

1. **teacher_reports** -- Metadatos de reportes generados (individual, classroom, progress, analytics)
2. **scheduled_reports** -- Configuracion de reportes programados para generacion automatica
3. **shared_reports** -- Registro de reportes compartidos entre maestros

---

### social_features.teacher_reports
Metadatos de reportes generados por profesores.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| teacher_id | UUID | NOT NULL | - | FK auth_management.profiles |
| classroom_id | UUID | NULL | NULL | FK social_features.classrooms |
| tenant_id | UUID | NOT NULL | - | FK auth_management.tenants |
| report_name | VARCHAR(255) | NOT NULL | - | Nombre descriptivo del reporte |
| report_type | VARCHAR(50) | NOT NULL | - | Tipo de reporte (CHECK constraint) |
| report_format | VARCHAR(10) | NOT NULL | - | Formato de archivo (CHECK constraint) |
| student_count | INTEGER | NULL | 0 | Estudiantes incluidos |
| period_start | DATE | NULL | NULL | Inicio del periodo reportado |
| period_end | DATE | NULL | NULL | Fin del periodo reportado |
| file_path | TEXT | NULL | NULL | Ruta del archivo generado |
| file_size_bytes | BIGINT | NULL | NULL | Tamano del archivo en bytes |
| generated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | Timestamp de generacion |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**CHECK constraints:**
- `report_type IN ('individual', 'classroom', 'progress', 'analytics')`
- `report_format IN ('pdf', 'excel', 'csv')`

**Foreign Keys:**
- `fk_teacher_reports_teacher` -> `auth_management.profiles(id)` ON DELETE CASCADE
- `fk_teacher_reports_classroom` -> `social_features.classrooms(id)` ON DELETE SET NULL
- `fk_teacher_reports_tenant` -> `auth_management.tenants(id)` ON DELETE CASCADE

**Indices:** 5
- `idx_teacher_reports_teacher_id` (teacher_id)
- `idx_teacher_reports_tenant_id` (tenant_id)
- `idx_teacher_reports_generated_at` (generated_at DESC)
- `idx_teacher_reports_classroom_id` (classroom_id) WHERE classroom_id IS NOT NULL
- `idx_teacher_reports_report_type` (report_type)

**RLS:** 5 policies (SELECT: 2, INSERT: 1, UPDATE: 1, DELETE: 1)
- `teacher_reports_teacher_policy` -- SELECT: teacher sees own reports
- `teacher_reports_admin_policy` -- SELECT: admins see all in tenant (via user_roles lookup)
- `teacher_reports_teacher_insert` -- INSERT: teacher creates own
- `teacher_reports_teacher_update` -- UPDATE: teacher updates own
- `teacher_reports_teacher_delete` -- DELETE: teacher deletes own

**Entity:** `TeacherReport` (`teacher/entities/teacher-report.entity.ts`)
**DDL:** `social_features/tables/08-teacher_reports.sql`
**RLS:** `social_features/rls-policies/08-teacher-reports-policies.sql`

---

### social_features.scheduled_reports
Configuracion de reportes programados para generacion automatica.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| teacher_id | UUID | NOT NULL | - | FK auth_management.profiles |
| classroom_id | UUID | NULL | NULL | FK social_features.classrooms |
| tenant_id | UUID | NOT NULL | - | FK auth_management.tenants |
| report_name | VARCHAR(255) | NOT NULL | - | Nombre descriptivo |
| report_type | VARCHAR(50) | NOT NULL | - | Tipo de reporte (CHECK constraint) |
| report_format | VARCHAR(10) | NOT NULL | 'pdf' | Formato del archivo (CHECK constraint) |
| template_id | VARCHAR(50) | NULL | NULL | ID de plantilla opcional |
| student_ids | UUID[] | NULL | NULL | Array de student IDs para filtrar |
| frequency | VARCHAR(20) | NOT NULL | - | Frecuencia (CHECK constraint) |
| day_of_week | INTEGER | NULL | NULL | 0=Dom, 6=Sab (para weekly) |
| day_of_month | INTEGER | NULL | NULL | 1-28 (para monthly) |
| time_of_day | TIME | NOT NULL | '08:00:00' | **DEPRECATED**: usar preferred_hour |
| preferred_hour | INTEGER | NULL | NULL | Hora preferida 0-23 |
| timezone | VARCHAR(50) | NULL | 'America/Mexico_City' | Zona horaria |
| is_active | BOOLEAN | NULL | true | **DEPRECATED**: usar status |
| status | VARCHAR(20) | NULL | 'active' | Estado del schedule (CHECK constraint) |
| last_run_at | TIMESTAMPTZ | NULL | NULL | Ultima ejecucion |
| next_run_at | TIMESTAMPTZ | NULL | NULL | Proxima ejecucion |
| last_error | TEXT | NULL | NULL | Ultimo error si fallo |
| run_count | INTEGER | NULL | 0 | Veces ejecutado |
| notify_email | BOOLEAN | NULL | false | Notificar por email |
| email_recipients | TEXT[] | NULL | NULL | Lista de emails |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**CHECK constraints:**
- `report_type IN ('individual', 'classroom', 'progress', 'analytics')`
- `report_format IN ('pdf', 'excel', 'csv')`
- `frequency IN ('daily', 'weekly', 'monthly')`
- `status IN ('active', 'paused', 'completed')`
- `day_of_week BETWEEN 0 AND 6`
- `day_of_month BETWEEN 1 AND 28`
- `preferred_hour >= 0 AND preferred_hour <= 23`

**Foreign Keys:**
- `fk_scheduled_reports_teacher` -> `auth_management.profiles(id)` ON DELETE CASCADE
- `fk_scheduled_reports_classroom` -> `social_features.classrooms(id)` ON DELETE SET NULL
- `fk_scheduled_reports_tenant` -> `auth_management.tenants(id)` ON DELETE CASCADE

**Indices:** 7
- `idx_scheduled_reports_teacher_id` (teacher_id)
- `idx_scheduled_reports_tenant_id` (tenant_id)
- `idx_scheduled_reports_next_run` (next_run_at) WHERE is_active = true
- `idx_scheduled_reports_active` (is_active) WHERE is_active = true
- `idx_scheduled_reports_student_ids` GIN (student_ids)
- `idx_scheduled_reports_status` (status) WHERE status = 'active'
- `idx_scheduled_reports_cron_due` (status, next_run_at) WHERE status = 'active' -- composite for CRON job

**RLS:** 2 policies (inline in DDL)
- `scheduled_reports_teacher_policy` -- ALL: teacher CRUD on own schedules
- `scheduled_reports_admin_policy` -- ALL: admins see all in tenant (via current_user_role setting)

**Entity:** `ScheduledReport` (`teacher/entities/scheduled-report.entity.ts`)
**DDL:** `social_features/tables/08b-scheduled_reports.sql`

> **Nota Entity:** ScheduledReport usa `varchar(20)` para las columnas `frequency` y `status` (no ENUMs de PostgreSQL). Los valores son validados por CHECK constraints en DDL y por TypeScript enums (`ScheduleFrequency`, `ScheduleStatus`) en el entity.

---

### social_features.shared_reports
Registro de reportes compartidos entre profesores.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| report_id | UUID | NOT NULL | - | FK social_features.teacher_reports |
| shared_by | UUID | NOT NULL | - | FK auth_management.profiles (quien comparte) |
| shared_with | UUID | NOT NULL | - | FK auth_management.profiles (destinatario) |
| tenant_id | UUID | NOT NULL | - | FK auth_management.tenants |
| permission_level | VARCHAR(20) | NULL | 'view' | Nivel de permiso (CHECK constraint) |
| is_revoked | BOOLEAN | NULL | FALSE | Si el acceso fue revocado |
| accessed_at | TIMESTAMPTZ | NULL | NULL | Ultimo acceso |
| access_count | INTEGER | NULL | 0 | Veces accedido |
| expires_at | TIMESTAMPTZ | NULL | NULL | Expiracion (NULL = sin limite) |
| share_message | TEXT | NULL | NULL | Mensaje opcional |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**CHECK constraints:**
- `permission_level IN ('view', 'download', 'edit')`
- `chk_shared_reports_not_self` -- shared_by != shared_with

**Foreign Keys:**
- `fk_shared_reports_report` -> `social_features.teacher_reports(id)` ON DELETE CASCADE
- `fk_shared_reports_shared_by` -> `auth_management.profiles(id)` ON DELETE CASCADE
- `fk_shared_reports_shared_with` -> `auth_management.profiles(id)` ON DELETE CASCADE
- `fk_shared_reports_tenant` -> `auth_management.tenants(id)` ON DELETE CASCADE

**Indices:** 6 + 1 unique
- `idx_shared_reports_unique` UNIQUE (report_id, shared_with) -- un reporte solo se comparte una vez por destinatario
- `idx_shared_reports_report_id` (report_id)
- `idx_shared_reports_shared_by` (shared_by)
- `idx_shared_reports_shared_with` (shared_with)
- `idx_shared_reports_tenant_id` (tenant_id)
- `idx_shared_reports_expires` (expires_at) WHERE expires_at IS NOT NULL
- `idx_shared_reports_active` (shared_with, is_revoked) WHERE is_revoked = FALSE

**RLS:** 3 policies (inline in DDL)
- `shared_reports_owner_policy` -- ALL: sharer can manage their shares
- `shared_reports_recipient_policy` -- SELECT: recipient can view (if not expired)
- `shared_reports_admin_policy` -- ALL: admins see all in tenant

**Entity:** `SharedReport` (`teacher/entities/shared-report.entity.ts`)
**DDL:** `social_features/tables/08c-shared_reports.sql`

> **Nota Entity:** SharedReport usa `varchar(20)` para `permission_level` (no ENUM de PostgreSQL). Validado por CHECK constraint en DDL y TypeScript enum (`SharePermission`) en el entity.

---

*Generado: 2026-02-20 | Schema Reference v2.0.0*
