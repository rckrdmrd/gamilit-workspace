# D: Flujo-to-Implementation Mapping

**Fecha:** 2026-02-17
**Agente:** D (Flujos-to-Implementation)
**Version:** 1.0.0

---

## Summary

| Metric | Value |
|--------|-------|
| Total flujos in TRACEABILITY-MATRIX.md | 43 (42 unique + FL-TCH-07 alias of FL-SHR-01) |
| Flujo .md files on disk | 39 (excludes index/audit/template files) |
| Flujos with ALL frontend refs valid | 39 / 43 |
| Flujos with ALL backend refs valid | 36 / 43 |
| Flujos with ALL database refs valid | 30 / 43 |
| Flujos fully valid (all 3 layers) | 27 / 43 |
| Flujos with at least one broken ref | 16 / 43 |
| Frontend routes covered by flujos | 37 / 72 |
| Frontend routes without any flujo | 35 / 72 |
| Coverage percentage (routes) | 51.4% |

---

## Per-Flujo Verification

| Flujo ID | Name | FE Refs Valid | BE Refs Valid | DB Refs Valid | Status |
|----------|------|:---:|:---:|:---:|:---:|
| FL-AUTH-01 | Registro y Login | YES | YES | YES | VALID |
| FL-AUTH-02 | Recuperacion Password | YES | PARTIAL | YES | BROKEN-BE |
| FL-AUTH-03 | Verificacion Email | YES | YES | YES | VALID |
| FL-STU-01 | Ejercicio Completo | YES | YES | YES | VALID |
| FL-STU-02 | Ejercicio M3-M5 | YES | YES | YES | VALID |
| FL-STU-03 | Tienda Compra | YES | YES | YES | VALID |
| FL-STU-04 | Logros Misiones Claim | YES | YES | YES | VALID |
| FL-STU-05 | Perfil Ajustes Estudiante (Compuesto) | YES | YES | YES | VALID |
| FL-STU-06 | Dashboard Academico (Compuesto) | YES | YES | YES | VALID |
| FL-STU-07 | Tienda Overview | YES | YES | YES | VALID |
| FL-STU-08 | Inventario Items | YES | YES | YES | VALID |
| FL-STU-09 | Amigos | YES | YES | PARTIAL | BROKEN-DB |
| FL-STU-10 | Gremios | YES | YES | PARTIAL | BROKEN-DB |
| FL-STU-11 | Settings Dispositivos | YES | YES | YES | VALID |
| FL-STU-12 | Settings Notificaciones | YES | YES | YES | VALID |
| FL-STU-13 | Dashboard Progreso | YES | YES | YES | VALID |
| FL-STU-14 | Leaderboards | YES | YES | NO | BROKEN-DB |
| FL-STU-15 | Pagina Aprendizaje | YES | YES | YES | VALID |
| FL-SHR-01 | Perfil Configuracion | YES | YES | YES | VALID |
| FL-SHR-02 | Sesion Seguridad (Compuesto) | YES | YES | YES | VALID |
| FL-SHR-03 | White-Label Theming | YES | YES | NO | BROKEN-DB |
| FL-TCH-01 | Revision Manual M3-M5 | YES | YES | YES | VALID |
| FL-TCH-02 | Asignaciones Clase | YES | YES | YES | VALID |
| FL-TCH-03 | Monitoreo Alertas | YES | YES | NO | BROKEN-DB |
| FL-TCH-04 | Analytics Reportes | YES | YES | NO | BROKEN-DB |
| FL-TCH-05 | Gestion Contenido | YES | YES | NO | BROKEN-DB |
| FL-TCH-06 | Login Docente | YES | YES | YES | VALID |
| FL-TCH-07 | Perfil Config Docente (alias SHR-01) | YES | PARTIAL | PARTIAL | BROKEN-BE/DB |
| FL-ADM-01 | Gestion Usuarios Roles | YES | YES | YES | VALID |
| FL-ADM-02 | Configuracion Sistema | YES | PARTIAL | NO | BROKEN-BE/DB |
| FL-ADM-03 | Aprobacion Contenido | YES | YES | YES | VALID |
| FL-ADM-04 | Monitoreo Sistema | YES | YES | NO | BROKEN-DB |
| FL-ADM-05 | Integraciones LTI | YES | YES | YES | VALID |
| FL-ADM-06 | Audit Logs | YES | YES | PARTIAL | BROKEN-DB |
| FL-ADM-07 | Constructor Ejercicios | YES | YES | NO | BROKEN-DB |
| FL-ADM-08 | Gestion Gamificacion | YES | YES | YES | VALID |
| FL-PRN-01 | Vinculacion Padre-Estudiante | GENERIC | YES | YES | VALID-GENERIC |
| FL-PRN-02 | Seguimiento Progreso | GENERIC | YES | NO | BROKEN-DB |
| FL-PRN-03 | Notificaciones Padres | GENERIC | YES | YES | VALID-GENERIC |
| FL-PRN-04 | Login Padres | YES | YES | YES | VALID |
| FL-PRN-05 | Registro Padres | YES | YES | YES | VALID |
| FL-PRN-06 | Dashboard Padres | YES | YES | NO | BROKEN-DB |
| FL-PRN-07 | Progreso Hijo | YES | YES | NO | BROKEN-DB |

**Legend:**
- VALID = All referenced files, endpoints, and tables exist
- VALID-GENERIC = FE references use prose descriptions ("portal padres (vinculacion)") instead of file paths
- BROKEN-BE = Backend endpoint path mismatch
- BROKEN-DB = Database schema/table reference does not exist
- PARTIAL = Some references valid, some not

---

## Broken References

### A. Flujos with Invalid Backend References

| Flujo | Reference in Doc | Actual Endpoint | Issue |
|-------|-----------------|-----------------|-------|
| FL-AUTH-02 | `/auth/forgot-password` | `/auth/reset-password/request` | Endpoint name mismatch: actual is `POST /auth/reset-password/request` (PasswordController) |
| FL-AUTH-02 | `/auth/reset-password` | `/auth/reset-password` | Valid (this one matches) |
| FL-ADM-02 | `/api/v1/settings/*` | No `/settings` controller | No standalone settings module exists. System config is in `admin/system` controller (`GET /admin/system/config`) |
| FL-ADM-02 | `/api/v1/admin/config/*` | `/admin/system/config` | Route prefix mismatch: actual is `admin/system/config`, not `admin/config` |
| FL-TCH-07 | `/api/v1/teacher/settings/*` | No endpoint | No `teacher/settings` controller endpoint exists. Teacher has `alert-config`, `assignments`, `content`, etc. but no general `settings` |

### B. Flujos with Invalid Database References

| Flujo | Referenced Table/Schema | Actual DDL | Issue |
|-------|------------------------|-----------|-------|
| FL-STU-09 | `social_features.friend_requests` | `social_features.friend_requests` (10-friend_requests.sql) | VALID |
| FL-STU-10 | `social_features.guilds` | `social_features.guilds` (21-guilds.sql) | VALID |
| FL-STU-10 | `social_features.guild_members` | `social_features.guild_members` (22-guild_members.sql) | VALID |
| FL-STU-14 | `social_features.leaderboard_entries` | NO TABLE | Table does not exist in any schema. Leaderboard data is computed dynamically; only `gamification_system.leaderboard_metadata` exists. |
| FL-SHR-03 | `auth_management.tenant_settings` | NO TABLE | Table does not exist. Tenant configuration is stored in `system_configuration.tenant_configurations`. |
| FL-TCH-03 | `analytics.*` | NO SCHEMA | No `analytics` schema exists. Analytics data lives in `data_warehouse` schema and `audit_logging.user_activity_logs`. |
| FL-TCH-04 | `analytics.*` | NO SCHEMA | Same as above. |
| FL-TCH-04 | `data_warehouse.*` | `data_warehouse` schema exists | VALID (partial) |
| FL-TCH-05 | `educational_content.content_items` | NO TABLE | Table does not exist. Content is in `content_management.content_templates`, `content_management.content_categories`, and `educational_content.teacher_content`. |
| FL-TCH-05 | `educational_content.content_templates` | NO TABLE in this schema | Table exists as `content_management.content_templates`, not `educational_content.content_templates`. Wrong schema reference. |
| FL-TCH-07 | `communication.*` | `communication` schema | Schema exists with 3 tables (messages, message_participants, conversation_participants). VALID. |
| FL-ADM-02 | `platform_settings.*` | NO SCHEMA | No `platform_settings` schema. Actual schema is `system_configuration` (with tables: system_settings, gamification_parameters, etc.). |
| FL-ADM-02 | `audit.*` | NO SCHEMA | No `audit` schema. Actual schema is `audit_logging` (with tables: audit_logs, system_logs, etc.). |
| FL-ADM-04 | `monitoring.*` | NO SCHEMA | No `monitoring` schema exists. Monitoring data is in `audit_logging` (system_alerts, performance_metrics). |
| FL-ADM-06 | `audit_logging.user_activity` | `audit_logging.user_activity_logs` | Table name mismatch (missing `_logs` suffix). |
| FL-ADM-06 | `auth_management.login_attempts` | `auth_management.auth_attempts` | Table name mismatch: actual is `auth_attempts` (02-auth_attempts.sql). |
| FL-ADM-07 | `educational_content.exercise_options` | NO TABLE | No `exercise_options` table exists. Exercise options are stored as JSONB within `educational_content.exercises`. |
| FL-PRN-02 | `analytics.*` | NO SCHEMA | Same phantom schema reference as FL-TCH-03/04. |
| FL-PRN-06 | `analytics.*` | NO SCHEMA | Same phantom schema reference. |
| FL-PRN-07 | `analytics.*` | NO SCHEMA | Same phantom schema reference. |

### C. Flujos with Generic/Unverifiable Frontend References

| Flujo | Reference | Issue |
|-------|-----------|-------|
| FL-PRN-01 | `portal padres (vinculacion)` | Prose description, not a file path. Actual page: `apps/parent/pages/ParentDashboardPage.tsx` handles linking. |
| FL-PRN-02 | `portal padres (dashboard progreso)` | Prose description. Actual: `apps/parent/pages/ChildProgressPage.tsx`. |
| FL-PRN-03 | `portal padres (inbox)` | Prose description. No dedicated inbox page exists in parent portal; notifications are on `ParentDashboardPage.tsx`. |

---

## Unmapped Routes (no flujo coverage)

### Student Portal (10 unmapped)

| Route Path | Component | Notes |
|-----------|-----------|-------|
| `/progress` | MyProgressPage | Dedicated progress overview; partially covered by FL-STU-13 (dashboard) but no dedicated flujo |
| `/progress/modules/:moduleId` | ModuleDetailsPage | Module detail drill-down; no flujo |
| `/profile` | EnhancedProfilePage | Student profile page; FL-SHR-01 covers settings not profile view |
| `/notifications` | NotificationsPage | Notification center/inbox; no flujo |
| `/assignments` | AssignmentsPage | Student view of assignments; FL-TCH-02 only covers teacher side |
| `/assignments/:id` | AssignmentDetailPage | Assignment detail; no flujo |
| `/modules/:moduleId` | ModuleDetailPage | Module overview within learning hub; partially relates to FL-STU-15 |

### Teacher Portal (12 unmapped)

| Route Path | Component | Notes |
|-----------|-----------|-------|
| `/teacher/dashboard` | TeacherDashboardPage | Main teacher dashboard; no dedicated flujo |
| `/teacher/communication` | TeacherCommunicationPage | Messaging system; partially referenced by FL-TCH-07 but no dedicated flujo |
| `/teacher/gamification` | TeacherGamificationPage | Teacher view of gamification; no flujo |
| `/teacher/monitoring` | TeacherMonitoring | Real-time monitoring; FL-TCH-03 covers alerts only |
| `/teacher/progress` | TeacherProgress | Student progress tracking from teacher view; no flujo |
| `/teacher/reports` | TeacherReports | Reports (covered partially by FL-TCH-04 alongside analytics); route exists but flujo combines with analytics |
| `/teacher/responses` | TeacherExerciseResponses | Exercise response viewer; no flujo |
| `/teacher/resources` | Redirect to /teacher/dashboard | Deprecated route; no flujo needed |
| `/teacher/classes` | TeacherClassesPage | Classroom management; no flujo |
| `/teacher/students` | TeacherStudentsPage | Student roster/management; no flujo |
| `/teacher/notifications` | TeacherNotificationsPage | Teacher notification center; no flujo |
| `/teacher/settings/notifications` | TeacherNotificationPreferencesPage | Teacher notification preferences; no flujo (FL-STU-12 is student-only) |
| `/teacher/settings/alerts` | TeacherAlertConfig | Alert configuration (US-PM-007); no flujo |

### Admin Portal (14 unmapped)

| Route Path | Component | Notes |
|-----------|-----------|-------|
| `/admin/dashboard` | AdminDashboardPage | Main admin dashboard; no flujo |
| `/admin/institutions` | AdminInstitutionsPage | Institution/tenant management; no flujo |
| `/admin/roles` | AdminRolesPage | Role management; FL-ADM-01 covers users but roles page has its own route |
| `/admin/content` | AdminContentPage | Content management; FL-ADM-03 covers approvals only |
| `/admin/reports` | AdminReportsPage | System reports; no flujo |
| `/admin/settings` | AdminSettingsPage | General settings; FL-ADM-02 points to AdminAdvancedPage |
| `/admin/notifications` | AdminNotificationsPage | Admin notification center; no flujo |
| `/admin/settings/notifications` | AdminNotificationPreferencesPage | Admin notification preferences; no flujo |
| `/admin/alerts` | AdminAlertsPage | System alerts management; no flujo |
| `/admin/analytics` | AdminAnalyticsPage | Platform analytics; no flujo |
| `/admin/progress` | AdminProgressPage | Student progress oversight; no flujo |
| `/admin/classroom-teachers` | AdminClassroomTeacherPage | Teacher-classroom assignments; no flujo |
| `/admin/assignments` | AdminAssignmentsPage | Assignment management; no flujo |
| `/admin/exercises/:id/edit` | AdminExerciseCreatePage (reused) | Exercise editor; FL-ADM-07 covers create but not edit route |

### Utility Routes (2 unmapped)

| Route Path | Component | Notes |
|-----------|-----------|-------|
| `/unauthorized` | UnauthorizedPage | Error page; no flujo needed |
| `*` (404) | NotFoundPage | Error page; no flujo needed |

---

## Phantom Schema/Table Summary

The following schema and table names appear in flujo documentation but do NOT exist in the DDL:

| Phantom Reference | Appears In | Correct DDL Equivalent |
|-------------------|-----------|----------------------|
| `analytics` (schema) | FL-TCH-03, FL-TCH-04, FL-PRN-02, FL-PRN-06, FL-PRN-07 | `data_warehouse` + `audit_logging` |
| `monitoring` (schema) | FL-ADM-04 | `audit_logging` (system_alerts, performance_metrics) |
| `platform_settings` (schema) | FL-ADM-02 | `system_configuration` |
| `audit` (schema) | FL-ADM-02 | `audit_logging` |
| `social_features.leaderboard_entries` | FL-STU-14 | Computed dynamically; `gamification_system.leaderboard_metadata` for config |
| `auth_management.tenant_settings` | FL-SHR-03 | `system_configuration.tenant_configurations` |
| `auth_management.login_attempts` | FL-ADM-06 | `auth_management.auth_attempts` |
| `audit_logging.user_activity` | FL-ADM-06 | `audit_logging.user_activity_logs` |
| `educational_content.content_items` | FL-TCH-05 | `content_management` schema or `educational_content.teacher_content` |
| `educational_content.content_templates` | FL-TCH-05 | `content_management.content_templates` (wrong schema) |
| `educational_content.exercise_options` | FL-ADM-07 | No table; stored as JSONB in `exercises.content` |

---

## Findings

### F-D-01: Low Route Coverage (51.4%)
Only 37 of 72 frontend routes are documented by flujos. The largest gaps are in the **Admin Portal** (14 unmapped routes out of 22 total = 36% coverage) and **Teacher Portal** (7 covered out of 19 = 37% coverage). The Student Portal has best coverage at 17/24 = 71%.

### F-D-02: Phantom Schema References (5 schemas)
Five schema names referenced across 11 flujos do not exist in DDL: `analytics`, `monitoring`, `platform_settings`, `audit`, and implicit `tenant_settings`. These appear to be conceptual names from early design that were never aligned with actual DDL schema names (`data_warehouse`, `audit_logging`, `system_configuration`).

### F-D-03: Table Name Mismatches (4 instances)
Four table references use incorrect names: `login_attempts` vs `auth_attempts`, `user_activity` vs `user_activity_logs`, `leaderboard_entries` (non-existent), and `exercise_options` (stored as JSONB, not a table).

### F-D-04: Backend Endpoint Path Mismatches (3 instances)
- `forgot-password` is actually `reset-password/request`
- `admin/config` is actually `admin/system/config`
- `teacher/settings` does not exist as an endpoint

### F-D-05: Generic Parent Portal References (3 flujos)
FL-PRN-01, FL-PRN-02, and FL-PRN-03 use prose descriptions ("portal padres (vinculacion)") instead of actual file paths, making automated verification impossible.

### F-D-06: Missing Dedicated Flujos for Core Pages
The following pages represent significant functionality without any flujo documentation:
- **Teacher Dashboard** (`/teacher/dashboard`) - main landing page for teachers
- **Admin Dashboard** (`/admin/dashboard`) - main landing page for admins
- **Student Progress** (`/progress`, `/progress/modules/:moduleId`) - core educational tracking
- **Student Profile** (`/profile`) - user identity/avatar management
- **Student Notifications** (`/notifications`) - notification center
- **Student Assignments** (`/assignments`, `/assignments/:id`) - assignment workflow from student perspective
- **Teacher Classes/Students** (`/teacher/classes`, `/teacher/students`) - classroom management
- **Admin Institutions** (`/admin/institutions`) - multi-tenant management

### F-D-07: Flujo Count Discrepancy
The TRACEABILITY-MATRIX.md lists 43 entries (rows), but FL-TCH-07 is explicitly documented as an alias pointing to the same flujo file as FL-SHR-01 (`FLUJO-PERFIL-CONFIGURACION.md`). The actual unique flujo documents on disk total 39 (excluding index, audit, and template files). Some flujos are composite (FL-STU-05, FL-STU-06, FL-SHR-02) which delegate to sub-flujos rather than documenting their own unique flow.

### F-D-08: All Frontend File References are Valid
Every frontend file path referenced in the TRACEABILITY-MATRIX.md resolves to an existing `.tsx`/`.ts` file on disk. This includes all page components, stores, hooks, and sub-components. Zero broken frontend file references.

---

## Recommendations

1. **Align phantom schemas:** Update all flujo DB references to use actual schema names (`analytics` -> `data_warehouse` + `audit_logging`, etc.).
2. **Fix endpoint paths:** Correct FL-AUTH-02 (`forgot-password` -> `reset-password/request`), FL-ADM-02 (`admin/config` -> `admin/system/config`).
3. **Create missing flujos:** Prioritize flujos for dashboards (teacher, admin), student progress, and student assignments as these are high-traffic pages.
4. **Replace generic FE refs:** Update FL-PRN-01/02/03 to reference actual file paths (`apps/parent/pages/ParentDashboardPage.tsx`, etc.).
5. **Document FL-TCH-07 properly:** Either merge into FL-SHR-01 with teacher-specific details or create a standalone teacher settings flujo.
