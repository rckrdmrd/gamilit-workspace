# DATABASE INVENTORY MASTER (DIM)

**Generado:** 2025-11-07
**Propósito:** Fuente de verdad única para todos los objetos de database

---

## 📊 RESUMEN EJECUTIVO

- **Schemas:** 13
- **Tablas:** 62
- **Enums:** 35 definiciones (35 únicos)
- **Functions:** 61
- **Triggers:** 49
- **RLS Policies:** 18 archivos
- **Foreign Keys:** 94

### ⚠️ DUPLICADOS DETECTADOS: 0


---

## 🗂️ SCHEMAS

### `admin_dashboard`
- **Tablas:** 0
- **Functions:** 0

### `audit_logging`
- **Tablas:** 6
- **Functions:** 1

### `auth`
- **Tablas:** 1
- **Functions:** 1

### `auth_management`
- **Tablas:** 12
- **Functions:** 6

### `content_management`
- **Tablas:** 5
- **Functions:** 0

### `educational_content`
- **Tablas:** 4
- **Functions:** 2

### `gamification_system`
- **Tablas:** 13
- **Functions:** 23

### `gamilit`
- **Tablas:** 0
- **Functions:** 13

### `progress_tracking`
- **Tablas:** 5
- **Functions:** 7

### `public`
- **Tablas:** 6
- **Functions:** 7

### `social_features`
- **Tablas:** 7
- **Functions:** 1

### `storage`
- **Tablas:** 0
- **Functions:** 0

### `system_configuration`
- **Tablas:** 3
- **Functions:** 0

---

## 📋 TABLAS (con dependencias)

### Schema: `audit_logging`

#### `01-audit_logs`

**Propósito:** Registro de auditoría de acciones del sistema
**Archivo:** `apps/database/ddl/schemas/audit_logging/tables/01-audit_logs.sql`

**Foreign Keys:**
- → `auth_management.profiles`
- → `auth_management.tenants`

---

#### `02-performance_metrics`

**Propósito:** Métricas de rendimiento del sistema
**Archivo:** `apps/database/ddl/schemas/audit_logging/tables/02-performance_metrics.sql`

**Foreign Keys:**
- → `auth_management.tenants`
- → `auth_management.profiles`

---

#### `03-system_alerts`

**Propósito:** Alertas del sistema - rendimiento, seguridad, errores
**Archivo:** `apps/database/ddl/schemas/audit_logging/tables/03-system_alerts.sql`

**Foreign Keys:**
- → `auth_management.profiles`
- → `auth_management.profiles`
- → `auth_management.tenants`

---

#### `04-system_logs`

**Propósito:** Logs del sistema - errores, advertencias, información de debugging
**Archivo:** `apps/database/ddl/schemas/audit_logging/tables/04-system_logs.sql`

**Foreign Keys:**
- → `auth_management.tenants`
- → `auth_management.profiles`

---

#### `05-user_activity_logs`

**Propósito:** Registro de actividad de usuarios para analytics
**Archivo:** `apps/database/ddl/schemas/audit_logging/tables/05-user_activity_logs.sql`

**Foreign Keys:**
- → `auth_management.tenants`
- → `auth_management.profiles`

---

#### `06-user_activity`

**Propósito:** User activity log for admin monitoring
**Archivo:** `apps/database/ddl/schemas/audit_logging/tables/06-user_activity.sql`

---

### Schema: `auth`

#### `01-users`

**Propósito:** Usuario base para autenticación (Supabase Auth)
**Archivo:** `apps/database/ddl/schemas/auth/tables/01-users.sql`

**Enums usados:**
- `auth_management.gamilit_role`

---

### Schema: `auth_management`

#### `01-tenants`

**Propósito:** Multi-tenancy: organizaciones, escuelas, instituciones
**Archivo:** `apps/database/ddl/schemas/auth_management/tables/01-tenants.sql`

---

#### `02-auth_attempts`

**Propósito:** Registro de intentos de autenticación para seguridad y auditoría
**Archivo:** `apps/database/ddl/schemas/auth_management/tables/02-auth_attempts.sql`

---

#### `03-profiles`

**Propósito:** Perfil completo de usuario: datos personales, rol, configuraciones
**Archivo:** `apps/database/ddl/schemas/auth_management/tables/03-profiles.sql`

**Foreign Keys:**
- → `auth_management.tenants`
- → `auth.users`

**Enums usados:**
- `auth_management.gamilit_role`
- `auth_management.user_status`
- `._`

---

#### `04-roles`

**Propósito:** Asignaciones de roles a usuarios con permisos específicos
**Archivo:** `apps/database/ddl/schemas/auth_management/tables/04-roles.sql`

**Foreign Keys:**
- → `auth_management.profiles`
- → `auth_management.profiles`
- → `auth_management.tenants`
- → `auth_management.profiles`

**Enums usados:**
- `auth_management.gamilit_role`

---

#### `05-auth_providers`

**Propósito:** Configuración de proveedores de autenticación OAuth/Social (Google, Facebook, Apple, Microsoft, GitHub)
**Archivo:** `apps/database/ddl/schemas/auth_management/tables/05-auth_providers.sql`

---

#### `06-email_verification_tokens`

**Propósito:** Stores email verification tokens for new user registration
**Archivo:** `apps/database/ddl/schemas/auth_management/tables/06-email_verification_tokens.sql`

**Foreign Keys:**
- → `auth.users`

---

#### `07-password_reset_tokens`

**Propósito:** Stores password reset tokens for user password recovery
**Archivo:** `apps/database/ddl/schemas/auth_management/tables/07-password_reset_tokens.sql`

**Foreign Keys:**
- → `auth.users`

---

#### `08-security_events`

**Propósito:** Audit log for security-related events
**Archivo:** `apps/database/ddl/schemas/auth_management/tables/08-security_events.sql`

**Foreign Keys:**
- → `auth.users`

---

#### `09-user_preferences`

**Propósito:** Preferencias personalizadas de cada usuario para la interfaz y experiencia de la aplicación
**Archivo:** `apps/database/ddl/schemas/auth_management/tables/09-user_preferences.sql`

---

#### `10-memberships`

**Propósito:** Relaciones usuario-tenant con permisos y restricciones
**Archivo:** `apps/database/ddl/schemas/auth_management/tables/10-memberships.sql`

**Foreign Keys:**
- → `auth_management.tenants`
- → `auth_management.profiles`

---

#### `11-user_sessions`

**Propósito:** Sesiones activas de usuarios con información de dispositivo y ubicación
**Archivo:** `apps/database/ddl/schemas/auth_management/tables/11-user_sessions.sql`

**Foreign Keys:**
- → `auth_management.tenants`
- → `auth_management.profiles`

---

#### `12-user_suspensions`

**Propósito:** User account suspensions and bans
**Archivo:** `apps/database/ddl/schemas/auth_management/tables/12-user_suspensions.sql`

---

### Schema: `content_management`

#### `01-content_templates`

**Propósito:** Plantillas reutilizables para crear contenido
**Archivo:** `apps/database/ddl/schemas/content_management/tables/01-content_templates.sql`

**Foreign Keys:**
- → `auth_management.profiles`
- → `auth_management.tenants`

---

#### `02-marie_curie_content`

**Propósito:** Contenido curado sobre Marie Curie - biografía, descubrimientos, legado
**Archivo:** `apps/database/ddl/schemas/content_management/tables/02-marie_curie_content.sql`

**Foreign Keys:**
- → `auth_management.profiles`
- → `auth_management.profiles`
- → `auth_management.profiles`
- → `auth_management.tenants`

---

#### `03-media_files`

**Propósito:** Archivos multimedia - imágenes, videos, audio, documentos
**Archivo:** `apps/database/ddl/schemas/content_management/tables/03-media_files.sql`

**Foreign Keys:**
- → `auth_management.tenants`
- → `auth_management.profiles`

---

#### `04-content_versions`

**Propósito:** Control de versiones para contenido educativo
**Archivo:** `apps/database/ddl/schemas/content_management/tables/04-content_versions.sql`

---

#### `05-flagged_content`

**Propósito:** Content flagged for moderation review
**Archivo:** `apps/database/ddl/schemas/content_management/tables/05-flagged_content.sql`

---

### Schema: `educational_content`

#### `01-modules`

**Propósito:** Módulos educativos con contenido y configuraciones
**Archivo:** `apps/database/ddl/schemas/educational_content/tables/01-modules.sql`

**Foreign Keys:**
- → `auth_management.profiles`
- → `auth_management.profiles`
- → `auth_management.profiles`
- → `auth_management.tenants`

**Enums usados:**
- `gamification_system.maya_rank`
- `gamification_system.maya_rank`

---

#### `02-exercises`

**Propósito:** Ejercicios individuales: preguntas, respuestas, hints
**Archivo:** `apps/database/ddl/schemas/educational_content/tables/02-exercises.sql`

**Foreign Keys:**
- → `auth_management.profiles`
- → `educational_content.modules`
- → `auth_management.profiles`

**Enums usados:**
- `educational_content.exercise_type`

---

#### `03-assessment_rubrics`

**Propósito:** Rúbricas de evaluación para ejercicios y módulos. Relación polimórfica: cada rúbrica se asocia SOLO a un ejercicio O a un módulo, nunca a ambos.
**Archivo:** `apps/database/ddl/schemas/educational_content/tables/03-assessment_rubrics.sql`

**Foreign Keys:**
- → `auth_management.profiles`
- → `educational_content.exercises`
- → `educational_content.modules`

---

#### `04-media_resources`

**Propósito:** Recursos multimedia para contenido educativo - imágenes, videos, audio
**Archivo:** `apps/database/ddl/schemas/educational_content/tables/04-media_resources.sql`

**Foreign Keys:**
- → `auth_management.profiles`
- → `auth_management.tenants`

---

### Schema: `gamification_system`

#### `01-user_stats`

**Propósito:** Estadísticas acumuladas del usuario: XP, nivel, ML Coins
**Archivo:** `apps/database/ddl/schemas/gamification_system/tables/01-user_stats.sql`

**Foreign Keys:**
- → ``
- → ``

**Enums usados:**
- `gamification_system.maya_rank`

---

#### `02-user_ranks`

**Propósito:** COMMENT ON TABLE gamification_system.user_ranks IS
**Archivo:** `apps/database/ddl/schemas/gamification_system/tables/02-user_ranks.sql`

**Foreign Keys:**
- → `auth.users`
- → `auth_management.tenants`

---

#### `03-achievements`

**Propósito:** Logros disponibles en el sistema
**Archivo:** `apps/database/ddl/schemas/gamification_system/tables/03-achievements.sql`

**Foreign Keys:**
- → `auth_management.profiles`
- → `auth_management.tenants`

**Enums usados:**
- `gamification_system.achievement_category`

---

#### `04-user_achievements`

**Propósito:** Logros desbloqueados por usuarios
**Archivo:** `apps/database/ddl/schemas/gamification_system/tables/04-user_achievements.sql`

**Foreign Keys:**
- → `gamification_system.achievements`
- → `auth_management.profiles`

---

#### `05-ml_coins_transactions`

**Propósito:** Registro de transacciones de ML Coins - earning y spending
**Archivo:** `apps/database/ddl/schemas/gamification_system/tables/05-ml_coins_transactions.sql`

**Foreign Keys:**
- → `auth_management.profiles`

**Enums usados:**
- `gamification_system.transaction_type`

---

#### `06-missions`

**Propósito:** User missions/quests with objectives and rewards
**Archivo:** `apps/database/ddl/schemas/gamification_system/tables/06-missions.sql`

**Foreign Keys:**
- → `auth_management.profiles`

---

#### `07-comodines_inventory`

**Propósito:** Inventario de comodines (power-ups) por usuario
**Archivo:** `apps/database/ddl/schemas/gamification_system/tables/07-comodines_inventory.sql`

**Foreign Keys:**
- → `auth_management.profiles`

---

#### `08-notifications`

**Propósito:** Notificaciones push para usuarios
**Archivo:** `apps/database/ddl/schemas/gamification_system/tables/08-notifications.sql`

**Foreign Keys:**
- → `auth_management.profiles`

**Enums usados:**
- `public.notification_type`

---

#### `09-leaderboard_metadata`

**Propósito:** Tracks refresh status and statistics for materialized leaderboard views
**Archivo:** `apps/database/ddl/schemas/gamification_system/tables/09-leaderboard_metadata.sql`

---

#### `10-achievement_categories`

**Propósito:** Categorías para organizar y clasificar los logros del sistema de gamificación
**Archivo:** `apps/database/ddl/schemas/gamification_system/tables/10-achievement_categories.sql`

---

#### `11-active_boosts`

**Propósito:** Bonificadores temporales activos que multiplican XP, monedas, suerte o drop rate para usuarios
**Archivo:** `apps/database/ddl/schemas/gamification_system/tables/11-active_boosts.sql`

---

#### `12-inventory_transactions`

**Propósito:** Historial de transacciones de items del inventario de usuarios (compras, usos, regalos, expiraciones)
**Archivo:** `apps/database/ddl/schemas/gamification_system/tables/12-inventory_transactions.sql`

---

#### `13-maya_ranks`

**Propósito:** COMMENT ON TABLE gamification_system.maya_ranks IS
**Archivo:** `apps/database/ddl/schemas/gamification_system/tables/13-maya_ranks.sql`

**Enums usados:**
- `gamification_system.maya_rank`
- `gamification_system.maya_rank`

---

### Schema: `progress_tracking`

#### `01-module_progress`

**Propósito:** Progreso del estudiante por módulo
**Archivo:** `apps/database/ddl/schemas/progress_tracking/tables/01-module_progress.sql`

**Foreign Keys:**
- → `educational_content.modules`
- → `auth_management.profiles`

---

#### `02-learning_sessions`

**Propósito:** Sesiones de aprendizaje con tracking de tiempo y actividad
**Archivo:** `apps/database/ddl/schemas/progress_tracking/tables/02-learning_sessions.sql`

**Foreign Keys:**
- → `educational_content.exercises`
- → `educational_content.modules`
- → `auth_management.tenants`
- → `auth_management.profiles`

---

#### `03-exercise_attempts`

**Propósito:** Intentos de ejercicios con respuestas y scoring
**Archivo:** `apps/database/ddl/schemas/progress_tracking/tables/03-exercise_attempts.sql`

**Foreign Keys:**
- → `educational_content.exercises`
- → `auth_management.profiles`

---

#### `04-exercise_submissions`

**Propósito:** Student exercise submissions and attempts
**Archivo:** `apps/database/ddl/schemas/progress_tracking/tables/04-exercise_submissions.sql`

**Foreign Keys:**
- → `educational_content.exercises`
- → `auth_management.profiles`

---

#### `05-scheduled_missions`

**Propósito:** Misiones programadas para aulas específicas con fechas de inicio/fin y bonificaciones opcionales
**Archivo:** `apps/database/ddl/schemas/progress_tracking/tables/05-scheduled_missions.sql`

---

### Schema: `public`

#### `assignment_classrooms`

**Propósito:** Assignments assigned to entire classrooms
**Archivo:** `apps/database/ddl/schemas/public/tables/assignment_classrooms.sql`

---

#### `assignment_exercises`

**Propósito:** Exercises included in assignments (many-to-many)
**Archivo:** `apps/database/ddl/schemas/public/tables/assignment_exercises.sql`

---

#### `assignment_students`

**Propósito:** Assignments assigned to individual students
**Archivo:** `apps/database/ddl/schemas/public/tables/assignment_students.sql`

---

#### `assignment_submissions`

**Propósito:** Student submissions for assignments
**Archivo:** `apps/database/ddl/schemas/public/tables/assignment_submissions.sql`

---

#### `assignments`

**Propósito:** Teacher-created assignments
**Archivo:** `apps/database/ddl/schemas/public/tables/assignments.sql`

---

#### `teacher_notes`

**Propósito:** Teacher notes about students for tracking progress and observations
**Archivo:** `apps/database/ddl/schemas/public/tables/teacher_notes.sql`

---

### Schema: `social_features`

#### `01-friendships`

**Propósito:** Relaciones de amistad entre usuarios
**Archivo:** `apps/database/ddl/schemas/social_features/tables/01-friendships.sql`

**Foreign Keys:**
- → `auth.users`
- → `auth.users`

---

#### `02-schools`

**Propósito:** Instituciones educativas - escuelas y colegios
**Archivo:** `apps/database/ddl/schemas/social_features/tables/02-schools.sql`

**Foreign Keys:**
- → `auth_management.profiles`
- → `auth_management.profiles`
- → `auth_management.tenants`

---

#### `03-classrooms`

**Propósito:** Aulas virtuales para grupos de estudiantes
**Archivo:** `apps/database/ddl/schemas/social_features/tables/03-classrooms.sql`

**Foreign Keys:**
- → `social_features.schools`
- → `auth_management.profiles`
- → `auth_management.tenants`

---

#### `04-classroom_members`

**Propósito:** Membresía de estudiantes en aulas
**Archivo:** `apps/database/ddl/schemas/social_features/tables/04-classroom_members.sql`

**Foreign Keys:**
- → `social_features.classrooms`
- → `auth_management.profiles`
- → `auth_management.profiles`

---

#### `05-teams`

**Propósito:** Equipos dentro de aulas para competencias
**Archivo:** `apps/database/ddl/schemas/social_features/tables/05-teams.sql`

**Foreign Keys:**
- → `social_features.classrooms`
- → `auth_management.profiles`
- → `auth_management.profiles`
- → `auth_management.tenants`

---

#### `06-team_members`

**Propósito:** Miembros de equipos colaborativos
**Archivo:** `apps/database/ddl/schemas/social_features/tables/06-team_members.sql`

**Foreign Keys:**
- → `social_features.teams`
- → `auth.users`

---

#### `07-team_challenges`

**Propósito:** Desafíos asignados a equipos
**Archivo:** `apps/database/ddl/schemas/social_features/tables/07-team_challenges.sql`

**Foreign Keys:**
- → `social_features.teams`

---

### Schema: `system_configuration`

#### `01-system_settings`

**Propósito:** Configuración global de la plataforma
**Archivo:** `apps/database/ddl/schemas/system_configuration/tables/01-system_settings.sql`

**Foreign Keys:**
- → `auth_management.profiles`
- → `auth_management.tenants`
- → `auth_management.profiles`

---

#### `02-feature_flags`

**Propósito:** Feature flags para activación gradual de funcionalidades
**Archivo:** `apps/database/ddl/schemas/system_configuration/tables/02-feature_flags.sql`

**Foreign Keys:**
- → `auth_management.profiles`
- → `auth_management.tenants`
- → `auth_management.profiles`

**Enums usados:**
- `auth_management.gamilit_role`

---

#### `03-notification_settings`

**Propósito:** Configuración de notificaciones por usuario y canal de entrega
**Archivo:** `apps/database/ddl/schemas/system_configuration/tables/03-notification_settings.sql`

**Foreign Keys:**
- → `auth_management.profiles`
- → `auth_management.tenants`
- → `auth_management.profiles`
- → `auth_management.profiles`

---

## 🏷️ ENUMS (con detalles)

### `alert_severity`

**Propósito:** Sin descripción

**Definiciones:**
- `apps/database/ddl/00-prerequisites.sql:159`

---

### `alert_status`

**Propósito:** Sin descripción

**Definiciones:**
- `apps/database/ddl/00-prerequisites.sql:163`

---

### `attempt_status`

**Propósito:** Sin descripción

**Definiciones:**
- `apps/database/ddl/00-prerequisites.sql:128`

---

### `audit_action`

**Propósito:** Sin descripción

**Definiciones:**
- `apps/database/ddl/00-prerequisites.sql:155`

---

### `auth.aal_level`

**Propósito:** Sin descripción

**Definiciones:**
- `apps/database/ddl/schemas/auth/enums/aal_level.sql:5`

---

### `auth.code_challenge_method`

**Propósito:** Sin descripción

**Definiciones:**
- `apps/database/ddl/schemas/auth/enums/code_challenge_method.sql:5`

---

### `auth_management.gamilit_role`

**Propósito:** Roles del sistema: student, admin_teacher, super_admin

**Definiciones:**
- `apps/database/ddl/00-prerequisites.sql:30`

---

### `auth_management.user_status`

**Propósito:** Estados de usuario: active, inactive, suspended, deleted

**Definiciones:**
- `apps/database/ddl/00-prerequisites.sql:34`

---

### `classroom_role`

**Propósito:** Sin descripción

**Definiciones:**
- `apps/database/ddl/00-prerequisites.sql:133`

---

### `cognitive_level`

**Propósito:** Sin descripción

**Definiciones:**
- `apps/database/ddl/00-prerequisites.sql:111`

---

### `comodin_type`

**Propósito:** Sin descripción

**Definiciones:**
- `apps/database/ddl/00-prerequisites.sql:55`

---

### `content_status`

**Propósito:** Sin descripción

**Definiciones:**
- `apps/database/ddl/00-prerequisites.sql:107`

---

### `difficulty_level`

**Propósito:** Sin descripción

**Definiciones:**
- `apps/database/ddl/00-prerequisites.sql:99`

---

### `educational_content.exercise_type`

**Propósito:** Tipos de ejercicio: multiple_choice, true_false, fill_blank, etc.

**Definiciones:**
- `apps/database/ddl/00-prerequisites.sql:80`

---

### `friendship_status`

**Propósito:** Sin descripción

**Definiciones:**
- `apps/database/ddl/00-prerequisites.sql:141`

---

### `gamification_system.achievement_category`

**Propósito:** Categorías: learning, social, mastery, exploration

**Definiciones:**
- `apps/database/ddl/00-prerequisites.sql:47`

---

### `gamification_system.achievement_type`

**Propósito:** Tipos de logro: milestone, challenge, special

**Definiciones:**
- `apps/database/ddl/00-prerequisites.sql:51`

---

### `gamification_system.maya_rank`

**Propósito:** Sin descripción

**Definiciones:**
- `apps/database/ddl/schemas/gamification_system/enums/maya_rank.sql:8`

---

### `gamification_system.transaction_type`

**Propósito:** Sin descripción

**Definiciones:**
- `apps/database/ddl/schemas/gamification_system/enums/transaction_type.sql:10`

---

### `log_level`

**Propósito:** Sin descripción

**Definiciones:**
- `apps/database/ddl/00-prerequisites.sql:150`

---

### `media_type`

**Propósito:** Sin descripción

**Definiciones:**
- `apps/database/ddl/00-prerequisites.sql:115`

---

### `module_status`

**Propósito:** Sin descripción

**Definiciones:**
- `apps/database/ddl/00-prerequisites.sql:103`

---

### `notification_priority`

**Propósito:** Sin descripción

**Definiciones:**
- `apps/database/ddl/00-prerequisites.sql:75`

---

### `processing_status`

**Propósito:** Sin descripción

**Definiciones:**
- `apps/database/ddl/00-prerequisites.sql:119`

---

### `progress_status`

**Propósito:** Estados de progreso: not_started, in_progress, completed, reviewed, mastered

**Definiciones:**
- `apps/database/ddl/00-prerequisites.sql:124`

---

### `public.aggregation_period`

**Propósito:** Sin descripción

**Definiciones:**
- `apps/database/ddl/schemas/public/enums/aggregation_period.sql:6`

---

### `public.attempt_result`

**Propósito:** Sin descripción

**Definiciones:**
- `apps/database/ddl/schemas/public/enums/attempt_result.sql:6`

---

### `public.auth_provider`

**Propósito:** Proveedores de autenticación: local, google, facebook, microsoft, apple

**Definiciones:**
- `apps/database/ddl/00-prerequisites.sql:38`

---

### `public.content_type`

**Propósito:** Sin descripción

**Definiciones:**
- `apps/database/ddl/schemas/public/enums/content_type.sql:6`

---

### `public.metric_type`

**Propósito:** Sin descripción

**Definiciones:**
- `apps/database/ddl/schemas/public/enums/metric_type.sql:6`

---

### `public.notification_type`

**Propósito:** Tipos de notificación: achievement, progress, social, system

**Definiciones:**
- `apps/database/ddl/00-prerequisites.sql:59`

---

### `public.setting_type`

**Propósito:** Sin descripción

**Definiciones:**
- `apps/database/ddl/00-prerequisites.sql:146`

---

### `public.social_event_type`

**Propósito:** Sin descripción

**Definiciones:**
- `apps/database/ddl/schemas/public/enums/social_event_type.sql:6`

---

### `storage.buckettype`

**Propósito:** Sin descripción

**Definiciones:**
- `apps/database/ddl/schemas/storage/enums/buckettype.sql:5`

---

### `team_role`

**Propósito:** Sin descripción

**Definiciones:**
- `apps/database/ddl/00-prerequisites.sql:137`

---

## 🎯 PLAN DE ACCIÓN

### Prioridades

#### P0 - CRÍTICO (Bloquea creación de tablas)

1. **Enum `public.gamilit_role` no existe**
   - 11 archivos lo referencian
   - 3 tablas no pueden crearse
   - 7 RLS policies fallan
   - **Acción:** Cambiar todas las referencias a `auth_management.gamilit_role`

2. **Enum `auth_provider` con valores diferentes**
   - 00-prerequisites.sql: 4 valores (falta 'apple')
   - auth_providers.sql: 5 valores (incluye 'apple')
   - **Acción:** Actualizar prerequisites para incluir 'apple'

#### P1 - ALTO (Causa confusión)

3. **6 enums duplicados idénticos**
   - user_status, notification_type, achievement_type, achievement_category, exercise_type
   - **Acción:** Eliminar definiciones duplicadas en archivos individuales

#### P2 - MEDIO (Mantenimiento)

4. **15 enums con ambigüedad de schema**
   - **Acción:** Agregar prefijo `public.` explícitamente
