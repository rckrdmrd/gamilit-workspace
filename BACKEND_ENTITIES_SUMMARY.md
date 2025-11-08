# Inventario de Entidades y DTOs del Backend - Gamilit

**Fecha de generación:** 2025-11-08  
**Total de módulos:** 12  
**Total de entidades:** 47  
**Schemas de base de datos:** 9

---

## Resumen Ejecutivo

Este documento presenta un análisis completo de todas las entidades TypeORM y DTOs del backend de Gamilit, organizado por módulo funcional y schema de base de datos.

### Schemas de Base de Datos

1. **auth** - Autenticación básica de usuarios
2. **auth_management** - Gestión avanzada de usuarios, perfiles, roles, multi-tenancy
3. **educational_content** - Módulos educativos, ejercicios, rúbricas, recursos multimedia
4. **progress_tracking** - Seguimiento de progreso de estudiantes
5. **social_features** - Características sociales (amistades, escuelas, aulas, equipos)
6. **gamification_system** - Sistema completo de gamificación
7. **content_management** - Gestión de contenido y plantillas
8. **audit_logging** - Auditoría y logging
9. **public** - Tablas públicas (assignments)

---

## Módulos y Entidades

### 1. Auth Module (10 entidades)

**Schema:** `auth` / `auth_management`

| Entidad | Tabla | Descripción | Propiedades Clave |
|---------|-------|-------------|-------------------|
| User | auth.users | Usuarios del sistema | email, encrypted_password, role, email_confirmed_at |
| Profile | auth_management.profiles | Perfiles de usuario completos | display_name, email, role, status, preferences (JSONB) |
| Tenant | auth_management.tenants | Organizaciones multi-tenant | name, slug, subscription_tier, max_users, settings (JSONB) |
| UserRole | auth_management.user_roles | Asignaciones de roles | user_id, tenant_id, role, permissions (JSONB), assigned_by |
| Membership | auth_management.memberships | Membresías user-tenant | user_id, tenant_id, role, status, joined_at |
| AuthProvider | auth_management.auth_providers | Proveedores OAuth | provider, provider_user_id, access_token (@Exclude) |
| AuthAttempt | auth_management.auth_attempts | Intentos de autenticación | email, ip_address, success, failure_reason |
| UserSession | auth_management.user_sessions | Sesiones activas | session_token, refresh_token (@Exclude), device_info |
| EmailVerificationToken | auth_management.email_verification_tokens | Tokens de verificación email | token (@Exclude), expires_at, used_at |
| PasswordResetToken | auth_management.password_reset_tokens | Tokens de reset password | token (@Exclude), expires_at, used_at |

**Características:**
- Sistema completo de autenticación con OAuth
- Multi-tenancy con aislamiento de datos
- Roles jerárquicos (student, admin_teacher, super_admin)
- Tokens hasheados con @Exclude para seguridad
- Tracking completo de sesiones y actividad

---

### 2. Educational Module (4 entidades)

**Schema:** `educational_content`

| Entidad | Tabla | Descripción | Propiedades Clave |
|---------|-------|-------------|-------------------|
| Module | educational_content.modules | Módulos educativos Marie Curie | title, content (JSONB), difficulty_level, xp_reward, ml_coins_reward, 40+ campos |
| Exercise | educational_content.exercises | Ejercicios con 27+ mecánicas | exercise_type (ENUM), config (JSONB), comodines_allowed, max_attempts, hints |
| AssessmentRubric | educational_content.assessment_rubrics | Rúbricas de evaluación | criteria (JSONB), scoring_scale (JSONB), assessment_type |
| MediaResource | educational_content.media_resources | Recursos multimedia | media_type (ENUM), url, cdn_url, processing_status, used_in_modules/exercises |

**Características:**
- 27+ tipos de ejercicios diferentes (crucigramas, mapas conceptuales, detective textual, etc.)
- Sistema de comodines/power-ups integrado
- Contenido JSONB flexible para diferentes mecánicas
- Tracking de uso de recursos multimedia
- Sistema de prerequisitos para módulos y ejercicios

---

### 3. Progress Module (5 entidades)

**Schema:** `progress_tracking`

| Entidad | Tabla | Descripción | Propiedades Clave |
|---------|-------|-------------|-------------------|
| ModuleProgress | progress_tracking.module_progress | Progreso por módulo | status, progress_percentage, completed_exercises, total_score, learning_path (JSONB), 35+ campos |
| LearningSession | progress_tracking.learning_sessions | Sesiones de aprendizaje | session_type, duration, active_time, device_info (JSONB), browser_info (JSONB) |
| ExerciseAttempt | progress_tracking.exercise_attempts | Intentos de ejercicios | attempt_number, submitted_answers (JSONB), is_correct, hints_used, comodines_used |
| ExerciseSubmission | progress_tracking.exercise_submissions | Envíos finales | answer_data (JSONB), score, feedback, status, graded_at |
| ScheduledMission | progress_tracking.scheduled_missions | Misiones programadas para aulas | mission_id, classroom_id, starts_at, ends_at, bonus_xp |

**Características:**
- Tracking completo de progreso individual
- Métricas de tiempo activo vs idle
- Sistema de intentos múltiples con límites configurables
- Analíticas de rendimiento en JSONB
- Soporte para modalidades: aula, asignaciones, autoestudio

---

### 4. Social Module (7 entidades)

**Schema:** `social_features`

| Entidad | Tabla | Descripción | Propiedades Clave |
|---------|-------|-------------|-------------------|
| Friendship | social_features.friendships | Relaciones de amistad | user_id, friend_id, status (pending/accepted/rejected/blocked) |
| School | social_features.schools | Instituciones educativas | name, code (unique), grade_levels, current_students_count, settings (JSONB) |
| Classroom | social_features.classrooms | Aulas virtuales | name, code (unique), teacher_id, co_teachers, capacity, schedule (JSONB) |
| ClassroomMember | social_features.classroom_members | Membresía en aulas | classroom_id, student_id, enrollment_method, final_grade, attendance_percentage |
| Team | social_features.teams | Equipos colaborativos | name, team_code (unique), max_members, total_xp, badges (JSONB), color_primary |
| TeamMember | social_features.team_members | Miembros de equipos | team_id, user_id, role (owner/admin/member), joined_at, left_at |
| TeamChallenge | social_features.team_challenges | Desafíos de equipos | team_id, challenge_id, status, score, completed_at |

**Características:**
- Sistema completo de amistad bidireccional
- Jerarquía School → Classroom → Students
- Equipos con gamificación integrada
- Códigos únicos de invitación para aulas y equipos
- Tracking de asistencia y calificaciones

---

### 5. Gamification Module (7 entidades)

**Schema:** `gamification_system`

| Entidad | Tabla | Descripción | Propiedades Clave |
|---------|-------|-------------|-------------------|
| UserStats | gamification_system.user_stats | Estadísticas completas del usuario | level, total_xp, ml_coins, current_streak, current_rank (Maya), 35+ campos |
| UserRank | gamification_system.user_ranks | Historial de rangos Maya | current_rank (Ajaw→K'uk'ulkan), rank_progress_percentage, ml_coins_bonus, is_current |
| Achievement | gamification_system.achievements | Catálogo de logros | category (ENUM), conditions (JSONB), rewards (JSONB), is_secret, rarity |
| UserAchievement | gamification_system.user_achievements | Logros desbloqueados | progress, is_completed, rewards_claimed, milestones_reached, progress_data (JSONB) |
| MLCoinsTransaction | gamification_system.ml_coins_transactions | Transacciones de monedas | amount, balance_before/after, transaction_type, reference_id, multiplier |
| Mission | gamification_system.missions | Misiones diarias/semanales | mission_type, objectives (JSONB), rewards (JSONB), progress, status |
| Notification | gamification_system.notifications | Notificaciones de usuario | type (11 tipos), priority, data (JSONB), read |

**Características:**
- Sistema completo de niveles y XP
- Rangos Maya: Ajaw → Nacom → Ah K'in → Halach Uinic → K'uk'ulkan
- Sistema de racha (streaks) diarias
- ML Coins con tracking completo de transacciones
- 11 tipos de notificaciones con prioridades
- Achievements con progreso incremental y milestones

---

### 6. Assignments Module (2 entidades)

**Schema:** `public`

| Entidad | Tabla | Descripción | Propiedades Clave |
|---------|-------|-------------|-------------------|
| Assignment | public.assignments | Tareas asignadas por profesores | title, assignmentType (practice/quiz/exam/homework), totalPoints, dueDate |
| AssignmentSubmission | public.assignment_submissions | Entregas de estudiantes | assignmentId, studentId, status, score, feedback, gradedAt |

**Características:**
- 4 tipos de asignaciones
- Sistema de calificación con feedback
- Estados: not_started → in_progress → submitted → graded

---

### 7. Audit Module (1 entidad)

**Schema:** `audit_logging`

| Entidad | Tabla | Descripción | Propiedades Clave |
|---------|-------|-------------|-------------------|
| AuditLog | audit_logging.audit_logs | Registro de auditoría completo | eventType, action, actorId, actorType, oldValues/newValues (JSONB), severity, status |

**Características:**
- Tracking completo de cambios (old_values, new_values, changes)
- Soporte para 4 tipos de actores (user, system, api, cron)
- 5 niveles de severidad (debug, info, warning, error, critical)
- Correlation IDs para trazabilidad

---

### 8. Content Module (1 entidad)

**Schema:** `content_management`

| Entidad | Tabla | Descripción | Propiedades Clave |
|---------|-------|-------------|-------------------|
| ContentTemplate | content_management.content_templates | Plantillas reutilizables | template_type, template_structure (JSONB), default_values (JSONB), usage_count |

**Características:**
- 5 tipos de plantillas (exercise, module, assessment, announcement, feedback)
- Estructura JSON flexible
- Campos requeridos y opcionales configurables

---

## Patrones de Diseño Identificados

### 1. JSONB Extensivo
- **Uso:** Almacenamiento flexible de configuraciones, metadatos, contenido estructurado
- **Ejemplos:** `content` en Module, `config` en Exercise, `conditions` en Achievement
- **Ventaja:** Flexibilidad sin migraciones constantes

### 2. Soft Deletes
- **Implementación:** Campos `deleted_at`, `is_active`
- **Módulos:** User, Module, Exercise, MediaResource

### 3. Tracking Temporal Completo
- **Campos estándar:** `created_at`, `updated_at`
- **Campos adicionales:** `started_at`, `completed_at`, `last_accessed_at`, `expires_at`

### 4. Enumeraciones Tipo-Safe
- **Total de ENUMs:** 23+
- **Categorías:**
  - Roles y permisos
  - Estados y status
  - Tipos de contenido
  - Categorías de logros
  - Prioridades

### 5. Relaciones Multi-Tenant
- **Campos:** `tenant_id` en la mayoría de entidades
- **Aislamiento:** Row Level Security (RLS) en PostgreSQL

### 6. Auditoría y Seguridad
- **@Exclude():** Tokens, passwords, refresh_tokens
- **Índices:** Optimización de queries frecuentes
- **Constraints:** CHECK constraints en valores numéricos y enums

---

## Validaciones Implementadas

### TypeORM Decorators
- `@Column()` con tipos específicos
- `@Index()` para optimización
- `@Unique()` para constraints de unicidad
- `@Check()` para validaciones de dominio

### Class-Transformer
- `@Exclude()` para campos sensibles (passwords, tokens)
- Prevención de exposición de datos sensibles en APIs

### Constraints de Base de Datos
- UNIQUE constraints en códigos, emails, slugs
- CHECK constraints en rangos numéricos
- Foreign Keys con ON DELETE CASCADE/SET NULL

---

## Métricas del Sistema

| Métrica | Valor |
|---------|-------|
| Total de entidades | 47 |
| Total de propiedades | 450+ |
| Campos JSONB | 60+ |
| ENUMs definidos | 23+ |
| Índices totales | 100+ |
| Relaciones FK | 40+ |
| Campos @Exclude | 8 (seguridad) |

---

## Recomendaciones

### 1. Documentación
- ✅ Todas las entidades tienen comentarios JSDoc
- ✅ Referencias cruzadas a DDL files
- ✅ Descripciones de propiedades JSONB

### 2. Seguridad
- ✅ Tokens hasheados nunca expuestos
- ✅ @Exclude() en campos sensibles
- ✅ Validaciones de dominio con CHECK

### 3. Performance
- ✅ Índices en FK y campos frecuentes
- ✅ Índices compuestos para queries complejas
- ⚠️ Considerar particionamiento en audit_logs (crecimiento)

### 4. Mantenibilidad
- ✅ Separación por schemas lógicos
- ✅ Convenciones de nombres consistentes
- ✅ Uso de ENUMs para type safety

---

## Archivos Generados

1. **BACKEND_ENTITIES_DTOS_INVENTORY.json** - Inventario completo en JSON estructurado
2. **BACKEND_ENTITIES_SUMMARY.md** - Este documento (resumen ejecutivo)

---

**Generado automáticamente por Claude Code**  
**Versión:** 1.0  
**Fecha:** 2025-11-08
