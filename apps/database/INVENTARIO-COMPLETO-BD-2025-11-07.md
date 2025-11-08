# 📦 INVENTARIO COMPLETO BASE DE DATOS GAMILIT

**Fecha:** 2025-11-07
**Versión:** 1.0
**Sistema:** GAMILIT Platform Database
**Propósito:** Inventario exhaustivo de objetos DB + Mapeo con documentación

---

## 📊 RESUMEN EJECUTIVO

### Estadísticas Generales

| Componente | Cantidad | Estado |
|------------|----------|--------|
| **Archivos SQL totales** | 323 | ✅ Completo |
| **Schemas** | 13 | ✅ Completo |
| **Tablas** | 61 | ✅ Completo |
| **Funciones** | 61 | ✅ Completo |
| **Vistas** | 12 | ✅ Completo |
| **Vistas Materializadas** | 4 | ✅ Completo |
| **Triggers** | 49 | ✅ Completo |
| **Índices** | 74 archivos | ✅ Completo |
| **RLS Policies** | 24 archivos | ✅ Completo |
| **ENUMs** | 36 | ✅ Completo |
| **Archivos _MAP.md** | 85+ | ✅ Completo |

### Archivos de Documentación

| Tipo | Cantidad |
|------|----------|
| Reportes de validación | 12 |
| Documentos de análisis | 8 |
| Archivos _MAP.md | 85+ |
| Guías de implementación | 6 |
| READMEs | 15+ |

---

## 🗂️ ESTRUCTURA DE DIRECTORIOS

```
apps/database/
├── ddl/                              # Definiciones DDL (323 archivos SQL)
│   ├── 00-prerequisites.sql          # ⚠️ PRIMERO - Schemas, ENUMs, funciones base
│   ├── 99-post-ddl-permissions.sql   # ⚠️ ÚLTIMO - Permisos
│   ├── migrations/                   # Migraciones versionadas (vacío)
│   ├── views/                        # Vistas compartidas (vacío)
│   └── schemas/                      # 13 schemas con objetos DB
│       ├── admin_dashboard/          # Dashboard administrativo (4 archivos)
│       ├── audit_logging/            # Auditoría y logs (9 archivos)
│       ├── auth/                     # Autenticación base (4 archivos)
│       ├── auth_management/          # Gestión usuarios (29 archivos)
│       ├── content_management/       # CMS (11 archivos)
│       ├── educational_content/      # Contenido educativo (13 archivos)
│       ├── gamification_system/      # Gamificación (62 archivos) ⭐
│       ├── gamilit/                  # Funciones utilitarias (13 archivos)
│       ├── progress_tracking/        # Seguimiento progreso (18 archivos)
│       ├── public/                   # Schema público (109 archivos) ⭐⭐
│       ├── social_features/          # Características sociales (21 archivos)
│       ├── storage/                  # Almacenamiento (1 archivo)
│       └── system_configuration/     # Configuración sistema (6 archivos)
│
├── docs/                             # Documentación técnica
│   ├── inventarios/                  # Inventarios de objetos
│   │   ├── 01-SCHEMAS-INVENTORY.md
│   │   ├── 02-TABLES-INVENTORY.md
│   │   ├── 03-ENUMS-INVENTORY.md
│   │   └── INVENTORY-MASTER-REPORT.md
│   ├── REPORTE-FUENTE-DE-VERDAD-2025-11-07.md
│   ├── REPORTE-CONTRADICCIONES-CRITICAS-2025-11-07.md
│   ├── REPORTE-VALIDACION-2025-11-07.md
│   └── ...
│
├── scripts/                          # Scripts de utilidad
│   ├── backup/                       # Scripts de backup
│   ├── restore/                      # Scripts de restore
│   ├── inventory/                    # Scripts de inventario
│   └── ...
│
├── seeds/                            # Datos semilla
│   ├── prod/                         # Seeds producción (100% idempotentes)
│   └── dev/                          # Seeds desarrollo (82% idempotentes)
│
├── migrations/                       # Migraciones históricas
│   └── sprint-0/
│
├── reportes/                         # Reportes de validación y análisis
│   └── 2025-11-07-validacion/       # Validación completa (A+)
│       ├── 00-CONSOLIDADO-FINAL.md  # Reporte oficial validación
│       ├── historicos/
│       └── analisis-especificos/
├── MATRIZ-COBERTURA-MODULOS-PLATAFORMA-2025-11-07.md  # Cobertura módulos
├── REPORTE-CORRECCIONES-APLICADAS-2025-11-07.md       # Correcciones aplicadas
└── _MAP.md                           # Mapa principal
```

---

## 📋 INVENTARIO DETALLADO POR SCHEMA

### 1. SCHEMA: admin_dashboard

**Propósito:** Vistas de dashboard administrativo
**Total archivos:** 4
**Documentación:** `ddl/schemas/admin_dashboard/views/_MAP.md`

| Tipo | Cantidad | Archivos |
|------|----------|----------|
| **Vistas** | 4 | ✅ |

#### Objetos:
1. `moderation_queue.sql` - Cola de moderación
2. `organization_stats_summary.sql` - Estadísticas de organización
3. `recent_admin_actions.sql` - Acciones recientes de admin
4. `user_stats_summary.sql` - Resumen de stats de usuario

#### Referencias a Documentación:
- **Matriz de Cobertura:** REQ 4.1 (Dashboard de Métricas para Investigador) - 100%
- **Módulo:** 2.2.1.4 Analytics e Investigación

---

### 2. SCHEMA: audit_logging

**Propósito:** Sistema completo de auditoría y logging
**Total archivos:** 9
**Documentación:** `ddl/schemas/audit_logging/_MAP.md`

| Tipo | Cantidad | Archivos |
|------|----------|----------|
| **Tablas** | 6 | ✅ |
| **Funciones** | 1 | ✅ |
| **Triggers** | 1 | ✅ |
| **RLS Policies** | 1 | ✅ |

#### Tablas (6):
1. `01-audit_logs.sql` - Logs de auditoría general
2. `02-performance_metrics.sql` - Métricas de performance
3. `03-system_alerts.sql` - Alertas del sistema
4. `04-system_logs.sql` - Logs del sistema
5. `05-user_activity_logs.sql` - Logs de actividad de usuario
6. `06-user_activity.sql` - Actividad de usuario

#### Funciones (1):
- `log_audit_event.sql` - Función para registrar eventos de auditoría

#### Triggers (1):
- `01-trg_system_alerts_updated_at.sql` - Actualizar timestamp

#### Referencias a Documentación:
- **Matriz de Cobertura:** REQ 4.4 (Tracking Detallado de Interacciones) - 100%
- **Módulo:** 2.2.1.4 Analytics e Investigación
- **Documentación adicional:** `ddl/schemas/audit_logging/_MAP.md`

---

### 3. SCHEMA: auth

**Propósito:** Autenticación base (integración con sistema externo)
**Total archivos:** 4
**Documentación:** Archivos _MAP.md individuales

| Tipo | Cantidad | Archivos |
|------|----------|----------|
| **Tablas** | 1 | ✅ |
| **Funciones** | 1 | ✅ |
| **ENUMs** | 2 | ✅ |

#### Tablas (1):
- `01-users.sql` - Tabla base de usuarios (integración externa)

#### Funciones (1):
- `get_current_user_id.sql` - Obtener ID de usuario actual

#### ENUMs (2):
- `aal_level.sql` - Authentication Assurance Level
- `code_challenge_method.sql` - Método de challenge code

#### Referencias a Documentación:
- **Matriz de Cobertura:** REQ 1.1 (Sistema de Autenticación) - 100%
- **Módulo:** 2.2.1.1 Fundamentos y Mecánicas Base
- **Documentación:** `ddl/schemas/auth/enums/_MAP.md`, `ddl/schemas/auth/functions/_MAP.md`

---

### 4. SCHEMA: auth_management

**Propósito:** Gestión completa de autenticación, perfiles, roles y seguridad
**Total archivos:** 29
**Documentación:** `ddl/schemas/auth_management/tables/_MAP.md` (+ subsecciones)

| Tipo | Cantidad | Archivos |
|------|----------|----------|
| **Tablas** | 12 | ✅ |
| **Funciones** | 6 | ✅ |
| **Triggers** | 6 | ✅ |
| **Índices** | 2 | ✅ |
| **RLS Policies** | 1 | ✅ |
| **ENUMs** | 2 | ✅ |

#### Tablas (12):
1. `01-tenants.sql` - Multi-tenancy (organizaciones)
2. `02-auth_attempts.sql` - Intentos de autenticación (seguridad)
3. `03-profiles.sql` - Perfiles de usuario ⭐ CORE
4. `04-roles.sql` - Roles de usuario
5. `05-auth_providers.sql` - Proveedores OAuth
6. `06-email_verification_tokens.sql` - Tokens verificación email
7. `07-password_reset_tokens.sql` - Tokens reset contraseña
8. `08-security_events.sql` - Eventos de seguridad
9. `09-user_preferences.sql` - Preferencias de usuario
10. `10-memberships.sql` - Membresías
11. `11-user_sessions.sql` - Sesiones activas
12. `12-user_suspensions.sql` - Suspensiones de usuario

#### Funciones (6):
1. `01-assign_role_to_user.sql`
2. `02-get_user_role.sql`
3. `03-verify_user_permission.sql`
4. `04-remove_role_from_user.sql`
5. `05-hash_token.sql`
6. `06-update_user_preferences.sql`

#### ENUMs (2):
- `gamilit_role.sql` - Roles: 'student', 'admin_teacher', 'super_admin'
- `user_status.sql` - Estados: 'active', 'inactive', 'suspended', 'banned', 'pending'

#### Referencias a Documentación:
- **Matriz de Cobertura:**
  - REQ 1.1 (Sistema de Autenticación y Perfiles) - 100%
  - REQ 5.1 (Panel Administrativo) - 100%
- **Módulo:** 2.2.1.1 Fundamentos + 2.2.1.5 Administración
- **Documentación:**
  - `ddl/schemas/auth_management/tables/_MAP.md`
  - `ddl/schemas/auth_management/functions/_MAP.md`
  - `ddl/schemas/auth_management/triggers/_MAP.md`

---

### 5. SCHEMA: content_management

**Propósito:** Gestión de contenido, media files, versiones y moderación
**Total archivos:** 11
**Documentación:** `ddl/schemas/content_management/_MAP.md`

| Tipo | Cantidad | Archivos |
|------|----------|----------|
| **Tablas** | 5 | ✅ |
| **Triggers** | 3 | ✅ |
| **Índices** | 2 | ✅ |
| **RLS Policies** | 1 | ✅ |

#### Tablas (5):
1. `01-content_templates.sql` - Templates de contenido
2. `02-marie_curie_content.sql` - Contenido de Marie Curie ⭐
3. `03-media_files.sql` - Archivos multimedia
4. `04-content_versions.sql` - Versionamiento de contenido
5. `05-flagged_content.sql` - Contenido reportado

#### Índices GIN (2):
- `01-idx_marie_content_grade_levels_gin.sql` - Búsqueda por grados
- `02-idx_marie_content_keywords_gin.sql` - Búsqueda por keywords

#### Referencias a Documentación:
- **Matriz de Cobertura:**
  - REQ 3.2 (Narrativa Adaptativa por Módulo) - 100%
  - REQ 5.1 (Panel Administrativo para Carga de Contenidos) - 100%
- **Módulo:** 2.2.1.3 Gamificación Avanzada + 2.2.1.5 Administración
- **Documentación:** `ddl/schemas/content_management/_MAP.md`

---

### 6. SCHEMA: educational_content

**Propósito:** Contenido educativo (módulos, ejercicios, recursos)
**Total archivos:** 13
**Documentación:** Archivos _MAP.md por sección

| Tipo | Cantidad | Archivos |
|------|----------|----------|
| **Tablas** | 4 | ✅ |
| **Funciones** | 2 | ✅ |
| **Triggers** | 4 | ✅ |
| **RLS Policies** | 2 | ✅ |
| **ENUMs** | 1 | ⭐⭐⭐ |

#### Tablas (4):
1. `01-modules.sql` - Módulos educativos ⭐
2. `02-exercises.sql` - Ejercicios (35 mecánicas) ⭐⭐⭐
3. `03-assessment_rubrics.sql` - Rúbricas de evaluación
4. `04-media_resources.sql` - Recursos multimedia

#### ENUMs (1):
- `exercise_type.sql` - **35 MECÁNICAS** de ejercicios interactivos
  - **Módulo 1:** Comprensión Literal (5 mecánicas)
  - **Módulo 2:** Comprensión Inferencial (5 mecánicas)
  - **Módulo 3:** Comprensión Crítica (5 mecánicas)
  - **Módulo 4:** Lectura Digital (9 mecánicas) ⚠️ Corregido 2025-11-07
  - **Módulo 5:** Producción Lectora (3 mecánicas)
  - **Auxiliares:** (8 mecánicas)

#### Funciones (2):
- `calculate_learning_path.sql` - Calcular ruta de aprendizaje
- `get_recommended_missions.sql` - Obtener misiones recomendadas

#### Referencias a Documentación:
- **Matriz de Cobertura:**
  - REQ 1.3 (Motor de Actividades Básicas) - 100%
  - REQ 2.1-2.4 (Actividades Interactivas Avanzadas) - 100%
  - REQ 5.1 (Panel Administrativo para Carga de Contenidos) - 100%
- **Módulo:**
  - 2.2.1.1 Fundamentos
  - 2.2.1.2 Actividades Avanzadas
  - 2.2.1.5 Administración
- **Corrección aplicada:**
  - D1 - 4 mecánicas agregadas a Módulo 4 (2025-11-07)
  - Ver: `REPORTE-CORRECCIONES-APLICADAS-2025-11-07.md`
- **Documentación:**
  - `ddl/schemas/educational_content/functions/_MAP.md`
  - `ddl/schemas/educational_content/rls-policies/_MAP.md`

---

### 7. SCHEMA: gamification_system ⭐⭐⭐ (EL MÁS COMPLEJO)

**Propósito:** Sistema completo de gamificación (XP, rangos, achievements, leaderboards)
**Total archivos:** 62 (19.3% del total)
**Documentación:** Múltiples archivos _MAP.md

| Tipo | Cantidad | Archivos |
|------|----------|----------|
| **Tablas** | 12 | ✅ |
| **Funciones** | 23 | ✅⭐ |
| **Vistas** | 4 | ✅ |
| **Vistas Materializadas** | 4 | ✅ |
| **Triggers** | 7 | ✅ |
| **Índices** | 4 | ✅ |
| **RLS Policies** | 8 | ✅ |
| **ENUMs** | 4 | ✅ |

#### Tablas (12):
1. `01-user_stats.sql` - Estadísticas de usuario ⭐⭐⭐ CORE
2. `02-user_ranks.sql` - Rangos maya de usuario
3. `03-achievements.sql` - Logros/achievements
4. `04-user_achievements.sql` - Logros de usuario
5. `05-ml_coins_transactions.sql` - Transacciones ML Coins ⭐⭐
6. `06-missions.sql` - Misiones
7. `07-comodines_inventory.sql` - Inventario de comodines
8. `08-notifications.sql` - Notificaciones
9. `09-leaderboard_metadata.sql` - Metadata de leaderboards
10. `10-achievement_categories.sql` - Categorías de logros
11. `11-active_boosts.sql` - Boosts activos
12. `12-inventory_transactions.sql` - Transacciones de inventario

#### ENUMs (4):
- `maya_rank.sql` - Rangos: 'Ajaw', 'Nacom', 'Ah K'in', 'Halach Uinic', 'K'uk'ulkan'
- `achievement_category.sql` - 7 categorías de achievements
- `achievement_type.sql` - Tipos de achievements
- `transaction_type.sql` - Tipos de transacciones

#### Funciones (23) - Sistema más complejo:
1. `apply_xp_boost.sql`
2. `award_ml_coins.sql` ⭐
3. `calculate_level_from_xp.sql`
4. `calculate_user_rank.sql`
5. `check_and_award_achievements.sql`
6. `claim_achievement_reward.sql`
7. `consume_comodin.sql`
8. `get_user_comodines.sql`
9. `get_user_current_rank.sql`
10. `get_user_inventory.sql`
11. `get_user_inventory_summary.sql`
12. `get_user_rank_progress.sql`
13. `get_user_rank_requirements.sql`
14. `grant_achievement.sql`
15. `process_exercise_completion.sql` ⭐⭐
16. `redeem_comodin.sql`
17. `update_leaderboard_coins.sql`
18. `update_leaderboard_global.sql`
19. `update_leaderboard_streaks.sql`
20. `update_user_rank.sql`
21. `update_missions_updated_at.sql`
22. `update_notifications_updated_at.sql`
23. `recalculate_level_on_xp_change.sql`

#### Vistas (4):
- `01-leaderboard_coins.sql` - Leaderboard por ML Coins
- `02-leaderboard_global.sql` - Leaderboard global
- `03-leaderboard_streaks.sql` - Leaderboard por rachas
- `04-leaderboard_xp.sql` - Leaderboard por XP

#### Vistas Materializadas (4):
- `01-mv_global_leaderboard.sql` - Cache leaderboard global
- `02-mv_classroom_leaderboard.sql` - Cache leaderboard classroom
- `03-mv_weekly_leaderboard.sql` - Cache leaderboard semanal
- `04-mv_mechanic_leaderboard.sql` - Cache leaderboard por mecánica

#### Referencias a Documentación:
- **Matriz de Cobertura:**
  - REQ 1.2 (Dashboard Principal Gamificado) - 100%
  - REQ 1.4 (Sistema de Puntos y Niveles) - 100%
  - REQ 3.1 (Sistema de Insignias y Logros) - 100%
  - REQ 3.3 (Tabla de Clasificaciones/Leaderboard) - 100%
  - REQ 3.4 (Recompensas Dinámicas) - 100%
- **Módulo:**
  - 2.2.1.1 Fundamentos
  - 2.2.1.3 Gamificación Avanzada
- **Documentación:**
  - `ddl/schemas/gamification_system/functions/_MAP.md` ⭐⭐⭐
  - `ddl/schemas/gamification_system/tables/_MAP.md`
  - `ddl/schemas/gamification_system/views/_MAP.md`
  - `ddl/schemas/gamification_system/materialized-views/_MAP.md`
  - `ddl/schemas/gamification_system/rls-policies/_MAP.md`

---

### 8. SCHEMA: gamilit

**Propósito:** Funciones utilitarias del sistema (compartidas)
**Total archivos:** 13
**Documentación:** `ddl/schemas/gamilit/functions/_MAP.md`

| Tipo | Cantidad | Archivos |
|------|----------|----------|
| **Funciones** | 13 | ✅ |

#### Funciones Utilitarias (13):
1. `01-audit_profile_changes.sql` - Auditar cambios en perfiles
2. `02-get_current_user_id.sql` - Obtener ID de usuario actual
3. `03-get_current_user_role.sql` - Obtener rol de usuario actual
4. `04-initialize_user_stats.sql` - Inicializar stats de usuario ⭐⭐
5. `05-is_admin.sql` - Verificar si usuario es admin
6. `08-now_mexico.sql` - Timestamp en zona horaria México ⭐
7. `09-set_profile_defaults.sql` - Establecer defaults de perfil
8. `09-update_updated_at_column.sql` - Actualizar updated_at ⭐⭐
9. `10-update_classroom_member_count.sql` - Actualizar contador de classroom
10. `11-update_user_last_login.sql` - Actualizar último login
11. `12-validate_email_format.sql` - Validar formato de email
12. `13-validate_username.sql` - Validar username
13. `14-update_user_stats_on_exercise_complete.sql` - Actualizar stats al completar ejercicio ⭐⭐⭐

#### Funciones Clave:
- **`initialize_user_stats`** - Trigger cross-schema (auth_management → gamification_system)
- **`update_user_stats_on_exercise_complete`** - Trigger cross-schema (progress_tracking → gamification_system)
- **`now_mexico`** - Usada por TODOS los triggers de updated_at
- **`update_updated_at_column`** - Trigger genérico usado en 30+ tablas

#### Referencias a Documentación:
- **Matriz de Cobertura:** Funciones transversales a todos los módulos
- **Validación:** Ver `reportes/2025-11-07-validacion/historicos/v2-completa-3-ejes.md` (EJE 3)
- **Documentación:** `ddl/schemas/gamilit/functions/_MAP.md`

---

### 9. SCHEMA: progress_tracking

**Propósito:** Seguimiento de progreso de estudiantes
**Total archivos:** 18
**Documentación:** Archivos _MAP.md por sección

| Tipo | Cantidad | Archivos |
|------|----------|----------|
| **Tablas** | 5 | ✅ |
| **Funciones** | 7 | ✅ |
| **Vistas** | 1 | ✅ |
| **Triggers** | 3 | ✅ |
| **Índices** | 2 | ✅ |
| **RLS Policies** | 2 | ✅ |

#### Tablas (5):
1. `01-module_progress.sql` - Progreso por módulo ⭐
2. `02-learning_sessions.sql` - Sesiones de aprendizaje
3. `03-exercise_attempts.sql` - Intentos de ejercicios ⭐⭐
4. `04-exercise_submissions.sql` - Submissions de ejercicios
5. `05-scheduled_missions.sql` - Misiones programadas

#### Funciones (7):
1. `01-calculate_module_progress.sql` - Calcular progreso de módulo
2. `02-check_mechanic_completion.sql` - Verificar completitud de mecánica
3. `03-get_user_progress.sql` - Obtener progreso de usuario
4. `04-record_exercise_attempt.sql` - Registrar intento de ejercicio
5. `05-get_classroom_analytics.sql` - Analytics de classroom
6. `06-update_mission_progress.sql` - Actualizar progreso de misión
7. `07-update_exercise_submissions_updated_at.sql` - Actualizar timestamp

#### Vista (1):
- `user_progress_summary.sql` - Resumen de progreso de usuario

#### Referencias a Documentación:
- **Matriz de Cobertura:**
  - REQ 1.5 (Analíticas Básicas de Progreso) - 100%
  - REQ 4.3 (Reportes de Progreso Individual y Grupal) - 100%
- **Módulo:**
  - 2.2.1.1 Fundamentos
  - 2.2.1.4 Analytics e Investigación
- **Documentación:**
  - `ddl/schemas/progress_tracking/functions/_MAP.md`
  - `ddl/schemas/progress_tracking/views/_MAP.md`

---

### 10. SCHEMA: public ⭐⭐ (EL MÁS GRANDE)

**Propósito:** Schema público (assignments, ENUMs globales, índices)
**Total archivos:** 109 (33.9% del total)
**Documentación:** Múltiples archivos _MAP.md

| Tipo | Cantidad | Archivos |
|------|----------|----------|
| **Tablas** | 6 | ✅ |
| **Funciones** | 7 | ✅ |
| **Vistas** | 3 | ✅ |
| **Triggers** | 18 | ✅ |
| **Índices** | 64 | ✅⭐⭐⭐ |
| **ENUMs** | 26 | ✅⭐⭐ |

#### Tablas (6):
1. `assignment_classrooms.sql` - Asignaciones por classroom
2. `assignment_exercises.sql` - Ejercicios asignados
3. `assignment_students.sql` - Estudiantes en asignaciones
4. `assignment_submissions.sql` - Submissions de asignaciones
5. `assignments.sql` - Asignaciones ⭐
6. `teacher_notes.sql` - Notas de profesores

#### ENUMs (26) - Más grande colección:
- `aggregation_period.sql`
- `alert_severity.sql`
- `alert_status.sql`
- `attempt_result.sql`
- `attempt_status.sql`
- `audit_action.sql`
- `classroom_role.sql`
- `cognitive_level.sql`
- `comodin_type.sql`
- `content_status.sql`
- `content_type.sql`
- `difficulty_level.sql`
- `friendship_status.sql`
- `log_level.sql`
- `media_type.sql`
- `metric_type.sql`
- `module_status.sql`
- `notification_channel.sql`
- `notification_priority.sql`
- `notification_type.sql` ⚠️ Corregido 2025-11-07
- `processing_status.sql`
- `progress_status.sql`
- `setting_type.sql`
- `social_event_type.sql`
- `team_role.sql`
- `transaction_type.sql`

#### Índices (64) - Mayor colección:
Incluye índices desde `239-idx_user_achievements_completed.sql` hasta archivos específicos por tabla.

#### Referencias a Documentación:
- **Matriz de Cobertura:**
  - REQ 5.2 (Sistema de Grupos y Asignaciones) - 100%
- **Módulo:** 2.2.1.5 Administración y Escalabilidad
- **Corrección aplicada:**
  - D2 - notification_type ENUM sincronizado (2025-11-07)
  - Ver: `REPORTE-CORRECCIONES-APLICADAS-2025-11-07.md`
- **Documentación:**
  - `ddl/schemas/public/enums/_MAP.md` ⭐⭐
  - `ddl/schemas/public/indexes/_MAP.md` ⭐⭐⭐
  - `ddl/schemas/public/indexes/INDEX_CATALOG.md`
  - `ddl/schemas/public/indexes/IMPLEMENTATION_REPORT.md`

---

### 11. SCHEMA: social_features

**Propósito:** Características sociales (amistades, classrooms, equipos)
**Total archivos:** 21
**Documentación:** Archivos _MAP.md + validaciones individuales

| Tipo | Cantidad | Archivos |
|------|----------|----------|
| **Tablas** | 7 | ✅ |
| **Funciones** | 1 | ✅ |
| **Triggers** | 5 | ✅ |
| **RLS Policies** | 8 | ✅ |

#### Tablas (7):
1. `01-friendships.sql` - Amistades entre usuarios
2. `02-schools.sql` - Escuelas/organizaciones
3. `03-classrooms.sql` - Aulas/classrooms ⭐
4. `04-classroom_members.sql` - Miembros de classrooms ⭐
5. `05-teams.sql` - Equipos
6. `06-team_members.sql` - Miembros de equipos
7. `07-team_challenges.sql` - Desafíos de equipo

#### Función (1):
- `cleanup_old_notifications.sql` - Limpiar notificaciones antiguas

#### Validaciones Adicionales:
- `VALIDACION-CLASSROOM-MEMBERS.md`
- `VALIDACION-CLASSROOMS.md`
- `VALIDACION-SCHOOLS.md`
- `VALIDACION-TEAMS.md`

#### Referencias a Documentación:
- **Matriz de Cobertura:**
  - REQ 5.2 (Sistema de Grupos y Asignaciones) - 100%
- **Módulo:** 2.2.1.5 Administración y Escalabilidad
- **Documentación:**
  - `ddl/schemas/social_features/tables/VALIDACION-*.md` (4 archivos)
  - `ddl/schemas/social_features/rls-policies/_MAP.md`

---

### 12. SCHEMA: storage

**Propósito:** Definiciones para storage (Supabase Storage)
**Total archivos:** 1
**Documentación:** `ddl/schemas/storage/enums/_MAP.md`

| Tipo | Cantidad | Archivos |
|------|----------|----------|
| **ENUMs** | 1 | ✅ |

#### ENUM (1):
- `buckettype.sql` - Tipos de buckets de storage

#### Referencias a Documentación:
- **Uso:** Integración con Supabase Storage para archivos multimedia

---

### 13. SCHEMA: system_configuration

**Propósito:** Configuración del sistema y feature flags
**Total archivos:** 6
**Documentación:** `ddl/schemas/system_configuration/_MAP.md`

| Tipo | Cantidad | Archivos |
|------|----------|----------|
| **Tablas** | 3 | ✅ |
| **Triggers** | 2 | ✅ |
| **RLS Policies** | 1 | ✅ |

#### Tablas (3):
1. `01-system_settings.sql` - Configuración general ⭐
2. `02-feature_flags.sql` - Feature flags ⭐⭐
3. `03-notification_settings.sql` - Configuración de notificaciones

#### Referencias a Documentación:
- **Matriz de Cobertura:**
  - REQ 5.3 (Configuración Avanzada de Mecánicas) - 100%
- **Módulo:** 2.2.1.5 Administración y Escalabilidad
- **Documentación:** `ddl/schemas/system_configuration/_MAP.md`

---

## 📄 ARCHIVOS ESPECIALES

### Archivos de Prerrequisitos y Permisos

#### 1. `00-prerequisites.sql` ⚠️ EJECUTAR PRIMERO
**Ubicación:** `apps/database/ddl/00-prerequisites.sql`
**Líneas:** 323
**Propósito:** Archivo de prerrequisitos que DEBE ejecutarse ANTES de cualquier otro DDL

**Contenido:**
- Creación de 12 schemas (líneas 8-23)
- Definición de 40+ ENUMs del sistema (líneas 25-165)
- Funciones base del schema `gamilit` (8 funciones, líneas 167-281)
- Funciones base del schema `gamification_system` (2 funciones, líneas 283-309)

**ENUMs Críticos:**
- `auth_management.gamilit_role`
- `auth_management.user_status`
- `gamification_system.maya_rank`
- `educational_content.exercise_type` (35 valores) ⚠️ Actualizado 2025-11-07
- `notification_type` (11 valores) ⚠️ Actualizado 2025-11-07
- Y 35+ ENUMs adicionales

**Correcciones Aplicadas:**
- ✅ D1: exercise_type - Agregadas 4 mecánicas faltantes (2025-11-07)
- ✅ D2: notification_type - Sincronizado con backend (2025-11-07)

**Orden de Ejecución:** 00 (PRIMERO)

---

#### 2. `99-post-ddl-permissions.sql` ⚠️ EJECUTAR ÚLTIMO
**Ubicación:** `apps/database/ddl/99-post-ddl-permissions.sql`
**Líneas:** 82
**Propósito:** Otorgar permisos al rol `gamilit_user` DESPUÉS de crear todos los objetos

**Contenido:**
- GRANT USAGE en todos los schemas
- GRANT ALL PRIVILEGES en tables
- GRANT ALL PRIVILEGES en sequences
- GRANT EXECUTE en funciones
- ALTER DEFAULT PRIVILEGES para objetos futuros

**Orden de Ejecución:** 99 (ÚLTIMO)

---

## 🗺️ MAPEO CON DOCUMENTACIÓN

### Documentación Principal

#### Reportes de Validación

| Archivo | Propósito | Fecha | Objetos Validados |
|---------|-----------|-------|-------------------|
| `reportes/2025-11-07-validacion/00-CONSOLIDADO-FINAL.md` | Validación exhaustiva final | 2025-11-07 | 1,088 objetos |
| `reportes/2025-11-07-validacion/historicos/v2-completa-3-ejes.md` | Validación completa v2 (3 ejes) | 2025-11-07 | 1,208 objetos |
| `MATRIZ-COBERTURA-MODULOS-PLATAFORMA-2025-11-07.md` | Cobertura de 21 requerimientos | 2025-11-07 | 21 requerimientos |
| `REPORTE-CORRECCIONES-APLICADAS-2025-11-07.md` | Correcciones aplicadas (D1, D2) | 2025-11-07 | 2 discrepancias |

#### Reportes de Análisis

| Archivo | Propósito |
|---------|-----------|
| `docs/REPORTE-FUENTE-DE-VERDAD-2025-11-07.md` | Fuente de verdad autorizada |
| `docs/REPORTE-CONTRADICCIONES-CRITICAS-2025-11-07.md` | 3 contradicciones críticas (P0) |
| `docs/REPORTE-VALIDACION-DUPLICACIONES-2025-11-07.md` | Validación de duplicaciones |
| `reportes/2025-11-07-validacion/analisis-especificos/comparativo-oficial-vs-ddl.md` | Comparación oficial vs DDL |

#### Inventarios

| Archivo | Propósito |
|---------|-----------|
| `docs/inventarios/01-SCHEMAS-INVENTORY.md` | Inventario de schemas |
| `docs/inventarios/02-TABLES-INVENTORY.md` | Inventario de tablas |
| `docs/inventarios/03-ENUMS-INVENTORY.md` | Inventario de ENUMs |
| `docs/inventarios/INVENTORY-MASTER-REPORT.md` | Reporte maestro de inventario |

#### Guías de Implementación

| Archivo | Propósito |
|---------|-----------|
| `PLAN-VALIDACION-COMPLETO.md` | Plan de validación completo (11 fases) |
| `reportes/2025-11-07-validacion/historicos/plan-correccion-enums.md` | Plan de corrección de ENUMs |
| **Movido:** `../../orchestration/04-logs/database/sa-db-022-implementation.md` | Guía de implementación SA-DB-022 |
| `CRITERIOS-VALIDACION.md` | Criterios de validación |

---

### Sistema de Archivos _MAP.md (85+ archivos)

**Estructura:**
```
apps/database/
├── _MAP.md                              # Mapa principal ⭐⭐⭐
└── ddl/schemas/
    ├── admin_dashboard/
    │   └── views/_MAP.md
    ├── audit_logging/
    │   ├── _MAP.md
    │   ├── functions/_MAP.md
    │   ├── rls-policies/_MAP.md
    │   └── triggers/_MAP.md
    ├── auth/
    │   ├── enums/_MAP.md
    │   └── functions/_MAP.md
    ├── auth_management/
    │   ├── functions/_MAP.md
    │   ├── indexes/_MAP.md
    │   ├── rls-policies/_MAP.md
    │   ├── tables/_MAP.md
    │   └── triggers/_MAP.md
    ├── content_management/
    │   ├── _MAP.md
    │   ├── indexes/_MAP.md
    │   ├── rls-policies/_MAP.md
    │   └── triggers/_MAP.md
    ├── educational_content/
    │   ├── functions/_MAP.md
    │   ├── rls-policies/_MAP.md
    │   └── triggers/_MAP.md
    ├── gamification_system/
    │   ├── functions/_MAP.md ⭐⭐⭐
    │   ├── indexes/_MAP.md
    │   ├── materialized-views/_MAP.md
    │   ├── rls-policies/_MAP.md
    │   ├── triggers/_MAP.md
    │   └── views/_MAP.md
    ├── gamilit/
    │   └── functions/_MAP.md ⭐⭐
    ├── progress_tracking/
    │   ├── functions/_MAP.md
    │   ├── indexes/_MAP.md
    │   ├── rls-policies/_MAP.md
    │   ├── triggers/_MAP.md
    │   └── views/_MAP.md
    ├── public/
    │   ├── enums/_MAP.md ⭐⭐
    │   ├── functions/_MAP.md
    │   ├── indexes/_MAP.md ⭐⭐⭐
    │   ├── tables/_MAP.md
    │   ├── triggers/_MAP.md
    │   └── views/_MAP.md
    ├── social_features/
    │   ├── functions/_MAP.md
    │   ├── rls-policies/_MAP.md
    │   └── triggers/_MAP.md
    ├── storage/
    │   └── enums/_MAP.md
    └── system_configuration/
        ├── _MAP.md
        ├── rls-policies/_MAP.md
        └── triggers/_MAP.md
```

**Total:** 85+ archivos _MAP.md

---

## 🔗 REFERENCIAS CRUZADAS

### Mapeo Schema ↔ Módulo de Plataforma

| Schema | Módulo(s) | Requerimientos |
|--------|-----------|----------------|
| **auth_management** | 2.2.1.1, 2.2.1.5 | REQ 1.1, REQ 5.1 |
| **educational_content** | 2.2.1.1, 2.2.1.2, 2.2.1.5 | REQ 1.3, REQ 2.1-2.4, REQ 5.1 |
| **gamification_system** | 2.2.1.1, 2.2.1.3 | REQ 1.2, REQ 1.4, REQ 3.1-3.4 |
| **progress_tracking** | 2.2.1.1, 2.2.1.4 | REQ 1.5, REQ 4.3 |
| **admin_dashboard** | 2.2.1.4 | REQ 4.1 |
| **audit_logging** | 2.2.1.4 | REQ 4.4 |
| **content_management** | 2.2.1.3, 2.2.1.5 | REQ 3.2, REQ 5.1 |
| **social_features** | 2.2.1.5 | REQ 5.2 |
| **system_configuration** | 2.2.1.5 | REQ 5.3 |
| **public** | 2.2.1.5 | REQ 5.2 |

### Mapeo Archivo ↔ Documentación

#### Archivos DDL Críticos

| Archivo DDL | Documentación | Estado |
|-------------|---------------|--------|
| `00-prerequisites.sql` | `REPORTE-CORRECCIONES-APLICADAS-2025-11-07.md` | ✅ Actualizado |
| `educational_content/enums/exercise_type.sql` | `REPORTE-CORRECCIONES-APLICADAS-2025-11-07.md` (D1) | ✅ Corregido |
| `public/enums/notification_type.sql` | `REPORTE-CORRECCIONES-APLICADAS-2025-11-07.md` (D2) | ✅ Corregido |
| `gamification_system/functions/*.sql` (23 archivos) | `gamification_system/functions/_MAP.md` | ✅ Documentado |
| `gamilit/functions/04-initialize_user_stats.sql` | `reportes/2025-11-07-validacion/historicos/v2-completa-3-ejes.md` (EJE 3) | ✅ Validado |
| `gamilit/functions/14-update_user_stats_on_exercise_complete.sql` | `reportes/2025-11-07-validacion/historicos/v2-completa-3-ejes.md` (EJE 3) | ✅ Validado |

---

## ✅ CHECKLIST DE COMPLETITUD

### Objetos de Base de Datos

- [x] Schemas: 13/13 ✅
- [x] Tablas: 61/61 ✅
- [x] Funciones: 61/61 ✅
- [x] Vistas: 12/12 ✅
- [x] Vistas Materializadas: 4/4 ✅
- [x] Triggers: 49/49 ✅
- [x] Índices: 74/74 archivos ✅
- [x] RLS Policies: 24/24 archivos ✅
- [x] ENUMs: 36/36 ✅

### Documentación

- [x] Archivos _MAP.md: 85+ ✅
- [x] Reportes de validación: 12 ✅
- [x] Documentos de análisis: 8 ✅
- [x] Guías de implementación: 6 ✅
- [x] Inventarios: 4 ✅

### Correcciones Aplicadas (2025-11-07)

- [x] D1: exercise_type - 4 mecánicas agregadas ✅
- [x] D2: notification_type - Sincronizado con backend ✅
- [x] C2: Notification Entity - Duplicación corregida ✅

### Validaciones

- [x] Validación exhaustiva: 1,208 objetos ✅
- [x] Cobertura de módulos: 95.2% (20/21 al 100%, 1/21 al 70%) ✅
- [x] Triggers cross-schema validados ✅
- [x] RLS policies implementadas: 114 policies ✅

---

## 📊 DISTRIBUCIÓN DE ARCHIVOS

### Por Schema (Top 5)

1. **public** - 109 archivos (33.9%) ⭐⭐
2. **gamification_system** - 62 archivos (19.3%) ⭐
3. **auth_management** - 29 archivos (9.0%)
4. **social_features** - 21 archivos (6.5%)
5. **progress_tracking** - 18 archivos (5.6%)

### Por Tipo de Objeto

| Tipo | Cantidad | % del Total |
|------|----------|-------------|
| **Índices** | 74 | 22.9% |
| **Tablas** | 61 | 18.9% |
| **Funciones** | 61 | 18.9% |
| **Triggers** | 49 | 15.2% |
| **ENUMs** | 36 | 11.1% |
| **RLS Policies** | 24 | 7.4% |
| **Vistas** | 12 | 3.7% |
| **Vistas Materializadas** | 4 | 1.2% |
| **Otros** | 2 | 0.6% |
| **TOTAL** | **323** | **100%** |

---

## 🎯 OBJETOS CLAVE DESTACADOS

### Funciones Cross-Schema (Críticas)

| Función | Schema | Trigger en | Impacto |
|---------|--------|------------|---------|
| `initialize_user_stats` | gamilit | auth_management.profiles | Crea user_stats, comodines, ranks al crear usuario |
| `update_user_stats_on_exercise_complete` | gamilit | progress_tracking.exercise_submissions | Actualiza XP, coins, achievements al completar ejercicio |

### Tablas CORE (Más Referenciadas)

| Tabla | Schema | Referencias | Impacto |
|-------|--------|-------------|---------|
| `profiles` | auth_management | 30+ FKs | Tabla central de usuarios |
| `user_stats` | gamification_system | 20+ FKs | Stats de gamificación |
| `modules` | educational_content | 15+ FKs | Módulos educativos |
| `exercises` | educational_content | 10+ FKs | Ejercicios (35 mecánicas) |

### ENUMs Críticos

| ENUM | Schema | Valores | Actualizado |
|------|--------|---------|-------------|
| `exercise_type` | educational_content | 35 | ✅ 2025-11-07 |
| `notification_type` | public | 11 | ✅ 2025-11-07 |
| `maya_rank` | gamification_system | 5 | ✅ Completo |
| `gamilit_role` | auth_management | 3 | ✅ Completo |

---

## 📝 ORDEN DE EJECUCIÓN RECOMENDADO

### 1. Prerrequisitos
```bash
psql -d glit_db -f ddl/00-prerequisites.sql
```

### 2. Schemas en Orden de Dependencia

**Nivel 1 (Sin dependencias):**
```bash
# storage
psql -d glit_db -f ddl/schemas/storage/enums/buckettype.sql

# system_configuration
psql -d glit_db -f ddl/schemas/system_configuration/tables/*.sql
```

**Nivel 2 (Dependencia en auth):**
```bash
# auth
psql -d glit_db -f ddl/schemas/auth/tables/*.sql
psql -d glit_db -f ddl/schemas/auth/functions/*.sql

# auth_management
psql -d glit_db -f ddl/schemas/auth_management/tables/*.sql
psql -d glit_db -f ddl/schemas/auth_management/functions/*.sql
psql -d glit_db -f ddl/schemas/auth_management/triggers/*.sql
```

**Nivel 3 (Dependencia en auth_management):**
```bash
# gamification_system
psql -d glit_db -f ddl/schemas/gamification_system/tables/*.sql
psql -d glit_db -f ddl/schemas/gamification_system/functions/*.sql
psql -d glit_db -f ddl/schemas/gamification_system/views/*.sql
psql -d glit_db -f ddl/schemas/gamification_system/materialized-views/*.sql
psql -d glit_db -f ddl/schemas/gamification_system/triggers/*.sql

# educational_content
psql -d glit_db -f ddl/schemas/educational_content/tables/*.sql
psql -d glit_db -f ddl/schemas/educational_content/functions/*.sql
psql -d glit_db -f ddl/schemas/educational_content/triggers/*.sql

# social_features
psql -d glit_db -f ddl/schemas/social_features/tables/*.sql
psql -d glit_db -f ddl/schemas/social_features/functions/*.sql
psql -d glit_db -f ddl/schemas/social_features/triggers/*.sql
```

**Nivel 4 (Dependencia en educational_content y gamification_system):**
```bash
# progress_tracking
psql -d glit_db -f ddl/schemas/progress_tracking/tables/*.sql
psql -d glit_db -f ddl/schemas/progress_tracking/functions/*.sql
psql -d glit_db -f ddl/schemas/progress_tracking/views/*.sql
psql -d glit_db -f ddl/schemas/progress_tracking/triggers/*.sql

# content_management
psql -d glit_db -f ddl/schemas/content_management/tables/*.sql
psql -d glit_db -f ddl/schemas/content_management/triggers/*.sql

# audit_logging
psql -d glit_db -f ddl/schemas/audit_logging/tables/*.sql
psql -d glit_db -f ddl/schemas/audit_logging/functions/*.sql
psql -d glit_db -f ddl/schemas/audit_logging/triggers/*.sql
```

**Nivel 5 (Dependencia en progress_tracking y otros):**
```bash
# public (assignments)
psql -d glit_db -f ddl/schemas/public/tables/*.sql
psql -d glit_db -f ddl/schemas/public/functions/*.sql
psql -d glit_db -f ddl/schemas/public/views/*.sql
psql -d glit_db -f ddl/schemas/public/triggers/*.sql

# admin_dashboard (vistas sobre otros schemas)
psql -d glit_db -f ddl/schemas/admin_dashboard/views/*.sql
```

### 3. Índices y RLS Policies
```bash
# Índices (mejoran performance)
find ddl/schemas -name "*indexes/*.sql" -exec psql -d glit_db -f {} \;

# RLS Policies (seguridad)
find ddl/schemas -name "*rls-policies/*.sql" -exec psql -d glit_db -f {} \;
```

### 4. Permisos (ÚLTIMO)
```bash
psql -d glit_db -f ddl/99-post-ddl-permissions.sql
```

---

## 🔍 CÓMO USAR ESTE INVENTARIO

### Buscar Documentación de un Archivo DDL

**Ejemplo 1:** Tengo el archivo `gamification_system/functions/award_ml_coins.sql`

1. Ir a sección **7. SCHEMA: gamification_system**
2. Buscar en subsección **Funciones (23)**
3. Encontrar: `award_ml_coins.sql` - Función para otorgar ML Coins
4. Ver **Referencias a Documentación**: `gamification_system/functions/_MAP.md`
5. Ver **Matriz de Cobertura**: REQ 3.4 (Recompensas Dinámicas)

**Ejemplo 2:** Tengo el archivo `educational_content/enums/exercise_type.sql`

1. Ir a sección **6. SCHEMA: educational_content**
2. Buscar en subsección **ENUMs (1)**
3. Encontrar: `exercise_type.sql` - 35 mecánicas de ejercicios
4. Ver **Corrección aplicada**: D1 - 4 mecánicas agregadas (2025-11-07)
5. Ver documento: `REPORTE-CORRECCIONES-APLICADAS-2025-11-07.md`

### Buscar Archivos DDL para un Requerimiento

**Ejemplo:** Necesito saber qué archivos DDL soportan REQ 3.1 (Insignias y Logros)

1. Ir a **🔗 REFERENCIAS CRUZADAS**
2. Buscar en **Mapeo Schema ↔ Módulo de Plataforma**
3. Encontrar: **gamification_system** → Módulo 2.2.1.3 → REQ 3.1
4. Ir a sección **7. SCHEMA: gamification_system**
5. Encontrar tablas relevantes:
   - `03-achievements.sql`
   - `04-user_achievements.sql`
   - `10-achievement_categories.sql`
6. Encontrar funciones relevantes:
   - `check_and_award_achievements.sql`
   - `grant_achievement.sql`
   - `claim_achievement_reward.sql`

### Validar Completitud

**Pregunta:** ¿Están todos los objetos de `progress_tracking` documentados?

1. Ir a sección **9. SCHEMA: progress_tracking**
2. Ver **Total archivos:** 18
3. Verificar cada tipo:
   - Tablas: 5 ✅
   - Funciones: 7 ✅
   - Vistas: 1 ✅
   - Triggers: 3 ✅
   - Índices: 2 ✅
   - RLS Policies: 2 ✅
4. Ver **Referencias a Documentación**: Todos los tipos tienen archivos _MAP.md
5. Conclusión: ✅ Completamente documentado

---

## 🚨 NOTAS IMPORTANTES

### Correcciones Aplicadas (2025-11-07)

**D1 - exercise_type (Módulo 4 incompleto):**
- **Archivos actualizados:**
  - `ddl/00-prerequisites.sql` (líneas 68-83)
  - `ddl/schemas/educational_content/enums/exercise_type.sql` (líneas 29-39)
  - `apps/backend/src/shared/constants/enums.constants.ts` (líneas 403-413)
- **Cambio:** Agregadas 4 mecánicas faltantes: resena_critica, chat_literario, email_formal, ensayo_argumentativo
- **Impacto:** Módulo 4 (Lectura Digital) ahora 100% funcional (9/9 mecánicas)

**D2 - notification_type (Desincronización backend-DDL):**
- **Archivos actualizados:**
  - `ddl/00-prerequisites.sql` (líneas 58-72)
- **Cambio:** Agregados 5 valores nuevos, renombrado team_invite → guild_invitation
- **Impacto:** 100% sincronización, 0 errores runtime

### Archivos con Prioridad de Ejecución

⚠️ **CRÍTICO:** Ejecutar en orden estricto:
1. `00-prerequisites.sql` - PRIMERO
2. Schemas en orden de dependencia
3. `99-post-ddl-permissions.sql` - ÚLTIMO

### Schemas con Mayor Complejidad

⭐⭐⭐ **gamification_system** (62 archivos, 23 funciones)
⭐⭐ **public** (109 archivos, 64 índices)
⭐ **auth_management** (29 archivos, completo sistema auth)

---

## 📊 MÉTRICAS DE CALIDAD

### Documentación

- **_MAP.md coverage:** 100% (85+ archivos)
- **Reportes de validación:** 12 documentos
- **Guías de implementación:** 6 documentos
- **Estado:** ✅ Excelente

### Validación

- **Objetos validados:** 1,208
- **Calificación:** A+ (97.8%)
- **Cobertura de módulos:** 95.2%
- **Estado:** ✅ Aprobado para entrega

### Integridad

- **Foreign Keys:** 363 (100% validadas)
- **Constraints:** 100+ (100% validadas)
- **RLS Policies:** 114 (activas)
- **Estado:** ✅ Íntegro

---

## 🔗 ENLACES RÁPIDOS

### Documentación Principal
- [Matriz de Cobertura Módulos](MATRIZ-COBERTURA-MODULOS-PLATAFORMA-2025-11-07.md)
- [Reporte Validación Completo](reportes/2025-11-07-validacion/00-CONSOLIDADO-FINAL.md)
- [Reporte Correcciones Aplicadas](REPORTE-CORRECCIONES-APLICADAS-2025-11-07.md)
- [Mapa Principal](_MAP.md)

### Inventarios
- [Inventario de Schemas](docs/inventarios/01-SCHEMAS-INVENTORY.md)
- [Inventario de Tablas](docs/inventarios/02-TABLES-INVENTORY.md)
- [Inventario de ENUMs](docs/inventarios/03-ENUMS-INVENTORY.md)
- [Inventario Maestro](docs/inventarios/INVENTORY-MASTER-REPORT.md)

### Schemas Clave
- [gamification_system - Funciones](ddl/schemas/gamification_system/functions/_MAP.md)
- [gamilit - Funciones Utilitarias](ddl/schemas/gamilit/functions/_MAP.md)
- [public - Índices](ddl/schemas/public/indexes/_MAP.md)
- [educational_content - RLS Policies](ddl/schemas/educational_content/rls-policies/_MAP.md)

---

**Generado:** 2025-11-07
**Versión:** 1.0
**Autor:** Claude Code - Sistema de Inventario
**Total archivos inventariados:** 323 archivos SQL
**Total archivos documentación:** 85+ _MAP.md + 30+ reportes
**Estado:** ✅ **COMPLETO Y VALIDADO**
