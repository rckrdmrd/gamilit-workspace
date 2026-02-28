---
titulo: "Esquema de 44 Tablas - GAMILIT Platform"
tipo: requerimiento-funcional
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# Esquema de 44 Tablas - GAMILIT Platform

**Épica:** EMR-001 - Migración y Robustecimiento de BD
**Fecha:** 2025-11-02
**Origen:** `/docs/03-desarrollo/base-de-datos/ESQUEMA-COMPLETO.md`

---

## Resumen Ejecutivo

- **Total de Schemas:** 9
- **Total de Tablas:** 44
- **Total de ENUMs:** 24
- **Total de Funciones:** 26
- **Total de Triggers:** 30
- **Total de Índices:** 150+

---

## 1. Distribución de Tablas por Schema

### 1.1 Schema: auth_management (9 tablas)
- `tenants` - Multi-tenant organizations
- `profiles` - Perfiles de usuario
- `user_roles` - Asignación de roles
- `memberships` - Usuario-tenant memberships
- `user_sessions` - Sesiones activas
- `auth_attempts` - Intentos de autenticación
- `password_reset_tokens` - Tokens de recuperación
- `email_verification_tokens` - Tokens de verificación
- `security_events` - Eventos de seguridad

### 1.2 Schema: gamification_system (9 tablas)
- `user_stats` - Estadísticas de gamificación
- `user_ranks` - Progresión de rangos Maya
- `achievements` - Definiciones de logros
- `user_achievements` - Logros desbloqueados
- `ml_coins_transactions` - Ledger de ML Coins
- `missions` - Misiones/quests
- `comodines_inventory` - Inventario de power-ups
- `notifications` - Notificaciones
- `leaderboard_metadata` - Metadatos de rankings

### 1.3 Schema: educational_content (4 tablas)
- `modules` - 5 módulos de Marie Curie
- `exercises` - 27 tipos de ejercicios
- `assessment_rubrics` - Rúbricas de evaluación
- `media_resources` - Recursos multimedia

### 1.4 Schema: progress_tracking (4 tablas)
- `module_progress` - Progreso por módulo
- `exercise_attempts` - Intentos de ejercicios
- `exercise_submissions` - Entregas
- `learning_sessions` - Sesiones de aprendizaje

### 1.5 Schema: social_features (7 tablas)
- `schools` - Instituciones educativas
- `classrooms` - Aulas virtuales
- `classroom_members` - Inscripciones
- `teams` - Equipos colaborativos
- `team_members` - Miembros de equipos
- `team_challenges` - Desafíos de equipos
- `friendships` - Relaciones de amistad

### 1.6 Schema: content_management (4 tablas)
- `marie_curie_content` - Contenido curado
- `media_files` - Archivos multimedia
- `content_templates` - Plantillas
- `flagged_content` - Contenido para moderación

### 1.7 Schema: system_configuration (2 tablas)
- `system_settings` - Configuración global
- `feature_flags` - Feature toggles

### 1.8 Schema: audit_logging (6 tablas)
- `audit_logs` - Trail de auditoría
- `system_logs` - Logs del sistema
- `performance_metrics` - Métricas de performance
- `user_activity_logs` - Actividad de usuarios
- `system_alerts` - Alertas del sistema
- `user_activity` - Log de actividad

### 1.9 Schema: gamilit (0 tablas)
- Solo funciones utilitarias (`now_mexico()`, `update_updated_at()`)

### 1.10 Schema: auth (1 tabla)
- `users` - Tabla de autenticación estándar (referenciada)

---

## 2. Tablas Críticas por Funcionalidad

### Autenticación y Usuarios
- `auth.users` (sistema)
- `auth_management.profiles`
- `auth_management.user_sessions`

### Gamificación Core
- `gamification_system.user_stats`
- `gamification_system.user_ranks`
- `gamification_system.ml_coins_transactions`

### Contenido Educativo
- `educational_content.modules`
- `educational_content.exercises`

### Progreso del Estudiante
- `progress_tracking.module_progress`
- `progress_tracking.exercise_attempts`

### Social y Colaboración
- `social_features.classrooms`
- `social_features.classroom_members`
- `social_features.teams`

---

## 3. Relaciones Clave (Foreign Keys)

### Relación Central: profiles
```
auth.users (1:1) → auth_management.profiles
                         ↓ (1:1)
                   gamification_system.user_stats
                         ↓ (1:N)
                   progress_tracking.module_progress
```

### Relación Educativa: modules → exercises
```
educational_content.modules (1:N) → educational_content.exercises
                                           ↓ (1:N)
                             progress_tracking.exercise_attempts
```

### Relación Social: classrooms
```
social_features.schools (1:N) → social_features.classrooms
                                        ↓ (N:M)
                          social_features.classroom_members
                                        ↓
                          auth_management.profiles (students)
```

---

## 4. Tablas con JSONB (Flexibilidad)

### Configuraciones
- `auth_management.tenants.settings`
- `auth_management.profiles.preferences`
- `auth_management.user_roles.permissions`

### Contenido Educativo
- `educational_content.modules.content`
- `educational_content.exercises.content`
- `educational_content.exercises.config`

### Gamificación
- `gamification_system.achievements.conditions`
- `gamification_system.achievements.rewards`
- `gamification_system.missions.objectives`

### Auditoría
- `audit_logging.audit_logs.old_values`
- `audit_logging.audit_logs.new_values`

---

## 5. ENUMs Principales (24 tipos)

### Autenticación y Roles
- `gamilit_role`: student, admin_teacher, super_admin
- `user_status`: active, inactive, suspended, deleted

### Gamificación
- `rango_maya`: nacom, batab, holcatte, guerrero, mercenario
- `achievement_category`: progress, streak, completion, social, special, mastery, exploration
- `comodin_type`: pistas, vision_lectora, segunda_oportunidad

### Contenido
- `exercise_type`: 27 tipos (multiple_choice, matching, crossword, etc.)
- `difficulty_level`: beginner, intermediate, advanced
- `content_status`: draft, published, archived, under_review

### Sistema
- `module_status`: not_started, in_progress, completed, locked
- `processing_status`: uploading, processing, ready, error, optimizing

---

## 6. Zona Horaria

**Todas las tablas usan `TIMESTAMPTZ` con zona horaria de México:**
```sql
created_at TIMESTAMPTZ DEFAULT gamilit.now_mexico()
```

**Función:** `gamilit.now_mexico()` retorna `NOW() AT TIME ZONE 'America/Mexico_City'`

---

## 7. Patrones de Diseño

### Soft Delete Pattern
- Campos `is_active` y `deleted_at`

### Audit Trail Pattern
- Tabla `audit_logs` con `old_values` y `new_values` en JSONB

### Multi-tenancy Pattern
- Campo `tenant_id` en todas las tablas principales

### Event Sourcing (Partial)
- `ml_coins_transactions` con `balance_before` / `balance_after`

---

## 8. Convenciones de Nombrado

- **Schemas:** `snake_case`
- **Tablas:** `snake_case` en plural
- **Columnas:** `snake_case`
- **ENUMs:** `snake_case`
- **Funciones:** `snake_case()`

---

## 9. Grados Escolares y Materias

**Grados:** 6, 7 y 8 (primaria superior/secundaria)

**Materias:** Literatura y Ciencias

**Contenido Temático:** 5 módulos sobre Marie Curie

---

## 10. Referencias

- **Esquema Completo:** `/docs/03-desarrollo/base-de-datos/ESQUEMA-COMPLETO.md`
- **Migraciones:** `tareas/01-migraciones/MIGRACIONES-HISTORICO.md`
- **Índices:** `tareas/03-documentacion/INDICES-OPTIMIZACION.md`
- **DDL Scripts:** `/docs/03-desarrollo/base-de-datos/backup-ddl/`

---

**Última actualización:** 2025-11-02
**Consolidado por:** ARTEMIS (Agente de Migración)
