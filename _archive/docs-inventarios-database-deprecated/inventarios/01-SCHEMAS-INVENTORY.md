# Inventario de Schemas - Base de Datos GAMILIT

**Fecha generación:** 2025-11-11
**Versión:** 2.0 (Corregido con conteos físicos)
**Total schemas:** 14
**Total objetos SQL:** 324 archivos
**Método:** Conteo físico de archivos DDL

---

## 📑 Índice de Schemas

| # | Schema | Tipo | Objetos | Estado Doc | Prioridad |
|---|--------|------|---------|------------|-----------|
| 01 | [auth](#01-auth) | Core | 3 objetos (1T, 2E) | ✅ Documentado | P0 |
| 02 | [auth_management](#02-auth_management) | Core | 40 objetos (15T, 6F, 6Tr, 11I, 1RLS, 1FK) | ✅ Documentado | P0 |
| 03 | [educational_content](#05-educational_content) | Feature | 43 objetos (15T, 3E, 3F, 4Tr, 16I, 2RLS) | ✅ Documentado | P1 |
| 04 | [gamification_system](#04-gamification_system) | Feature | 91 objetos (15T, 4E, 24F, 10Tr, 22I, 4V, 4MV, 8RLS) | ✅ Documentado | P0 |
| 05 | [progress_tracking](#06-progress_tracking) | Feature | 33 objetos (15T, 2E, 8F, 3Tr, 2I, 1V, 2RLS) | ✅ Documentado | P1 |
| 06 | [social_features](#08-social_features) | Feature | 30 objetos (15T, 1E, 1F, 5Tr, 8RLS) | ✅ Documentado | P2 |
| 07 | [content_management](#07-content_management) | Feature | 18 objetos (8T, 4E, 3Tr, 2I, 1RLS) | ✅ Documentado | P1 |
| 08 | [audit_logging](#10-audit_logging) | System | 28 objetos (6T, 2E, 4F, 1Tr, 14I, 1RLS) | ✅ Documentado | P1 |
| 09 | [system_configuration](#09-system_configuration) | System | 13 objetos (8T, 2F, 2Tr, 1RLS) | ✅ Documentado | P1 |
| 10 | [lti_integration](#14-lti_integration) | System | 3 objetos (3T) | ⚠️ Parcial | P1 |
| 11 | [admin_dashboard](#11-admin_dashboard) | Admin | 6 objetos (6V) | ⚠️ Parcial | P1 |
| 12 | [storage](#12-storage) | System | 1 objeto (1E) | ⚠️ Parcial | P2 |
| 13 | [gamilit](#13-gamilit) | Core/Utilities | 15 objetos (14F, 1V) | ✅ Documentado | P0 |
| 14 | [public](#14-public) | Limpiado | 0 objetos | ✅ Limpiado | P3 |

**Leyenda:** T=Tablas, E=ENUMs, F=Funciones, Tr=Triggers, I=Índices, V=Vistas, MV=Vistas Materializadas, RLS=Políticas RLS, FK=Foreign Key Constraints

---

## 🔍 Detalle de Schemas

### 01. auth

**Tipo:** Core - Autenticación Base
**Ubicación:** `apps/database/ddl/schemas/auth/`
**Estado:** ✅ Documentado
**Prioridad:** P0 - Crítico

#### Descripción
Schema base para autenticación. Contiene estructuras fundamentales de autenticación que son extendidas por `auth_management`.

#### Estructura de Objetos
```
auth/
├── enums/           (ENUMs de autenticación)
├── functions/       (Funciones de validación)
└── tables/          (Tabla base de autenticación)
```

#### Objetos Contenidos
- **Tablas:** 1 (base auth)
- **ENUMs:** Sí (tipos de autenticación)
- **Functions:** Sí (validación de credenciales)
- **Triggers:** No
- **RLS Policies:** No (manejado en auth_management)
- **Indexes:** No (indexes en auth_management)

#### Dependencias
- **Depende de:** Ninguno (Nivel 0)
- **Usado por:** auth_management, gamification_system, educational_content, social_features

#### Referencias SIMCO
- **Documentación:** `docs/03-desarrollo/base-de-datos/schemas/auth/`
- **Backend:** `apps/backend/src/modules/auth/`
- **Seeds:** `apps/database/seeds/auth/`

---

### 02. auth_management

**Tipo:** Core - Gestión de Autenticación y Usuarios
**Ubicación:** `apps/database/ddl/schemas/auth_management/`
**Estado:** ✅ Documentado
**Prioridad:** P0 - Crítico

#### Descripción
Schema principal de gestión de usuarios, roles, permisos y sesiones. Extiende `auth` con toda la lógica de autorización y gestión de cuentas.

#### Estructura de Objetos
```
auth_management/
├── functions/       (Lógica de negocio de usuarios)
├── indexes/         (Optimización de queries)
├── rls-policies/    (Row Level Security)
├── tables/          (12 tablas de gestión)
└── triggers/        (Auditoría y validación)
```

#### Objetos Contenidos
- **Tablas:** 15
  - tenants, auth_attempts, profiles, roles, auth_providers
  - email_verification_tokens, password_reset_tokens
  - security_events, user_preferences, memberships
  - user_sessions, user_suspensions
  - parent_accounts, parent_student_links, parent_notifications
- **Functions:** 6 (gestión de roles, permisos, tokens)
- **Triggers:** 6 (auditoría, timestamps, validaciones)
- **RLS Policies:** 1 archivo (múltiples políticas)
- **Indexes:** 11 (optimización de autenticación y sesiones)
- **FK Constraints:** 1 (profiles-school, diferido)

#### Dependencias
- **Depende de:** auth (Nivel 1)
- **Usado por:** Todos los schemas de features (gamification, educational, progress, content, social)

#### Referencias SIMCO
- **Documentación:** `docs/03-desarrollo/base-de-datos/schemas/auth_management/`
- **Backend:** `apps/backend/src/modules/auth/`, `apps/backend/src/modules/users/`
- **Seeds:** `apps/database/seeds/auth_management/`
- **ENUMs Backend:** `apps/backend/src/shared/constants/enums.constants.ts`

---

### 03. gamilit

**Tipo:** Core - Funciones Utilitarias
**Ubicación:** `apps/database/ddl/schemas/gamilit/`
**Estado:** ✅ Documentado
**Prioridad:** P0 - Crítico

#### Descripción
Schema de utilidades compartidas. Contiene 13 funciones helper que son utilizadas por múltiples schemas.

#### Estructura de Objetos
```
gamilit/
└── functions/       (13 funciones utilitarias)
```

#### Objetos Contenidos
- **Funciones:** 13 (utilidades compartidas)
  - Funciones de formateo
  - Funciones de validación
  - Funciones de cálculo
  - Funciones de transformación de datos

#### Dependencias
- **Depende de:** Ninguno (Nivel 0)
- **Usado por:** Todos los schemas (funciones compartidas)

#### Referencias SIMCO
- **Documentación:** `docs/03-desarrollo/base-de-datos/schemas/gamilit/`
- **Backend:** Utilizado indirectamente por todos los módulos

---

### 04. gamification_system

**Tipo:** Feature - Sistema de Gamificación
**Ubicación:** `apps/database/ddl/schemas/gamification_system/`
**Estado:** ✅ Documentado
**Prioridad:** P0 - Crítico (core feature)

#### Descripción
Sistema completo de gamificación con rangos maya, puntos, insignias, logros, rachas y multiplicadores.

#### Estructura de Objetos
```
gamification_system/
├── enums/                (Tipos de recompensas, rangos)
├── functions/            (Cálculo de puntos, multiplicadores)
├── indexes/              (Optimización de leaderboards)
├── materialized-views/   (Rankings pre-calculados)
├── rls-policies/         (Seguridad de datos de gamificación)
└── tables/               (12 tablas)
```

#### Objetos Contenidos
- **Tablas:** 12
  - user_ranks (rangos maya: NACOM, BATAB, HOLCATTE, GUERRERO, MERCENARIO)
  - user_points, user_badges, user_achievements
  - user_streaks, user_multipliers
  - badges, achievements, rank_requirements
  - leaderboards, reward_transactions
- **ENUMs:** Sí (tipos de recompensas, rangos, categorías)
- **Functions:** Sí (cálculo de puntos con multiplicadores, verificación de subida de rango)
- **Triggers:** No (¿pendiente validar?)
- **RLS Policies:** Sí (visibilidad de leaderboards, privacidad de puntos)
- **Indexes:** Sí (leaderboards, rankings, búsquedas por usuario)
- **Materialized Views:** Sí (rankings pre-calculados para performance)

#### Dependencias
- **Depende de:** auth_management, educational_content (Nivel 3)
- **Usado por:** progress_tracking, social_features

#### Referencias SIMCO
- **Documentación:** `docs/03-desarrollo/base-de-datos/schemas/gamification_system/`
- **Backend:** `apps/backend/src/modules/gamification/`
- **Frontend:** `apps/frontend/src/features/gamification/`
- **Seeds:** `apps/database/seeds/gamification_system/`

---

### 05. educational_content

**Tipo:** Feature - Contenido Educativo
**Ubicación:** `apps/database/ddl/schemas/educational_content/`
**Estado:** ✅ Documentado
**Prioridad:** P1 - Alto

#### Descripción
Gestión de contenido educativo: materias, módulos, lecciones, quizzes y preguntas.

#### Estructura de Objetos
```
educational_content/
├── functions/       (Validación de contenido, generación de quizzes)
├── rls-policies/    (Acceso por rol, visibilidad de contenido)
├── tables/          (Materias, módulos, lecciones, quizzes)
└── triggers/        (Auditoría, versionado)
```

#### Objetos Contenidos
- **Tablas:** 4 principales + tablas de soporte
  - subjects, modules, lessons
  - quizzes, questions, answers
- **Functions:** Sí (generación de quizzes, validación de respuestas)
- **Triggers:** Sí (auditoría de cambios, versionado)
- **RLS Policies:** Sí (teachers pueden editar, students solo leer)

#### Dependencias
- **Depende de:** auth_management (Nivel 3)
- **Usado por:** progress_tracking, gamification_system

#### Referencias SIMCO
- **Documentación:** `docs/03-desarrollo/base-de-datos/schemas/educational_content/`
- **Backend:** `apps/backend/src/modules/subjects/`, `apps/backend/src/modules/quizzes/`
- **Frontend:** `apps/frontend/src/features/learning/`
- **Seeds:** `apps/database/seeds/educational_content/`

---

### 06. progress_tracking

**Tipo:** Feature - Seguimiento de Progreso
**Ubicación:** `apps/database/ddl/schemas/progress_tracking/`
**Estado:** ✅ Documentado
**Prioridad:** P1 - Alto

#### Descripción
Tracking completo del progreso de estudiantes: quiz attempts, resultados, tiempo invertido, módulos completados.

#### Estructura de Objetos
```
progress_tracking/
├── functions/       (Cálculo de progreso, estadísticas)
├── indexes/         (Optimización de consultas de progreso)
├── rls-policies/    (Estudiantes ven solo su progreso, teachers ven sus estudiantes)
├── tables/          (5 tablas)
└── triggers/        (Actualización automática de estadísticas)
```

#### Objetos Contenidos
- **Tablas:** 5
  - quiz_attempts, quiz_results
  - module_progress, lesson_progress
  - user_statistics
- **Functions:** Sí (cálculo de % completado, tiempo promedio)
- **Triggers:** Sí (actualización de estadísticas en tiempo real)
- **RLS Policies:** Sí (privacidad de datos de progreso)
- **Indexes:** Sí (queries por usuario, fecha, quiz)

#### Dependencias
- **Depende de:** auth_management, educational_content, gamification_system (Nivel 4)
- **Usado por:** admin_dashboard

#### Referencias SIMCO
- **Documentación:** `docs/03-desarrollo/base-de-datos/schemas/progress_tracking/`
- **Backend:** `apps/backend/src/modules/progress/`
- **Frontend:** `apps/frontend/src/features/student-dashboard/`

---

### 07. content_management

**Tipo:** Feature - Gestión de Contenido
**Ubicación:** `apps/database/ddl/schemas/content_management/`
**Estado:** ✅ Documentado (actualizado 2025-11-11)
**Prioridad:** P1 - Alto

#### Descripción
Sistema de gestión de contenido multimedia y recursos educativos.

#### Estructura de Objetos
```
content_management/
├── _MAP.md
├── enums/           (4 ENUMs: content_status, content_type, media_type, processing_status)
├── indexes/         (2 índices GIN para búsqueda)
├── rls-policies/    (Permisos de edición)
├── tables/          (8 tablas)
└── triggers/        (3 triggers de updated_at)
```

#### Objetos Contenidos
- **Tablas:** 8
  - content_templates, marie_curie_content, media_files
  - content_versions, flagged_content
  - content_authors, content_categories, media_metadata
- **ENUMs:** 4 (content_status, content_type, media_type, processing_status)
- **Triggers:** 3 (updated_at para templates, marie_curie, media_files)
- **RLS Policies:** 1 archivo (múltiples políticas)
- **Indexes:** 2 (GIN para grade_levels y keywords en marie_curie_content)
- **Functions:** 0 (no implementadas)

#### Dependencias
- **Depende de:** auth_management, storage (Nivel 4)
- **Usado por:** educational_content

#### Referencias SIMCO
- **Documentación:** `docs/03-desarrollo/base-de-datos/schemas/content_management/`
- **Backend:** `apps/backend/src/modules/content/`
- **Referencia:** `content_management/_MAP.md`

---

### 08. social_features

**Tipo:** Feature - Funcionalidades Sociales
**Ubicación:** `apps/database/ddl/schemas/social_features/`
**Estado:** ✅ Documentado
**Prioridad:** P2 - Medio

#### Descripción
Funcionalidades sociales: comentarios, likes, follows, notificaciones.

#### Estructura de Objetos
```
social_features/
├── functions/       (Gestión de notificaciones)
├── rls-policies/    (Privacidad de interacciones)
├── tables/          (7 tablas)
└── triggers/        (Generación de notificaciones)
```

#### Objetos Contenidos
- **Tablas:** 7
  - user_follows, user_comments, user_likes
  - notifications, user_notifications
  - discussion_threads, discussion_posts
- **Functions:** Sí (envío de notificaciones)
- **Triggers:** Sí (notificaciones automáticas)
- **RLS Policies:** Sí (privacidad de interacciones)

#### Dependencias
- **Depende de:** auth_management, educational_content (Nivel 3)
- **Usado por:** Ninguno

#### Referencias SIMCO
- **Documentación:** `docs/03-desarrollo/base-de-datos/schemas/social_features/`
- **Backend:** `apps/backend/src/modules/social/`
- **Frontend:** `apps/frontend/src/features/social/`

---

### 09. system_configuration

**Tipo:** System - Configuración del Sistema
**Ubicación:** `apps/database/ddl/schemas/system_configuration/`
**Estado:** ✅ Documentado
**Prioridad:** P1 - Alto

#### Descripción
Configuración global del sistema: settings, feature flags, variables de entorno de aplicación.

#### Estructura de Objetos
```
system_configuration/
├── _MAP.md
├── rls-policies/    (Solo admins pueden editar)
├── tables/          (3 tablas)
└── triggers/        (Auditoría de cambios de config)
```

#### Objetos Contenidos
- **Tablas:** 8
  - system_settings, feature_flags, notification_settings
  - rate_limits, notification_settings_global
  - api_configuration, environment_config, tenant_configurations
- **Functions:** 2 (is_feature_enabled, update_feature_flag)
- **Triggers:** 2 (updated_at para feature_flags y system_settings)
- **RLS Policies:** 1 archivo (solo role admin)

#### Dependencias
- **Depende de:** Ninguno (Nivel 0)
- **Usado por:** Todos los schemas indirectamente

#### Referencias SIMCO
- **Documentación:** `docs/03-desarrollo/base-de-datos/schemas/system_configuration/`
- **Backend:** `apps/backend/src/modules/config/`
- **Referencia:** `system_configuration/_MAP.md`

---

### 10. audit_logging

**Tipo:** System - Auditoría y Logging
**Ubicación:** `apps/database/ddl/schemas/audit_logging/`
**Estado:** ✅ Documentado
**Prioridad:** P1 - Alto

#### Descripción
Sistema completo de auditoría: logs de acciones, cambios de datos, accesos a recursos.

#### Estructura de Objetos
```
audit_logging/
├── _MAP.md
├── functions/       (Funciones de logging)
├── rls-policies/    (Solo admins y sistema pueden leer)
├── tables/          (6 tablas)
└── triggers/        (Logging automático)
```

#### Objetos Contenidos
- **Tablas:** 6
  - audit_logs, performance_metrics, system_alerts
  - system_logs, user_activity_logs, user_activity
- **ENUMs:** 2 (aggregation_period, metric_type)
- **Functions:** 4 (cleanup_old_system_logs, cleanup_old_user_activity, log_audit_event, log_system_event)
- **Triggers:** 1 (updated_at para system_alerts)
- **Indexes:** 14 (optimización de consultas de actividad y alertas)
- **RLS Policies:** 1 archivo (solo admins pueden leer logs)

#### Dependencias
- **Depende de:** auth_management (Nivel 1)
- **Usado por:** Todos los schemas (auditoría universal)

#### Referencias SIMCO
- **Documentación:** `docs/03-desarrollo/base-de-datos/schemas/audit_logging/`
- **Backend:** `apps/backend/src/modules/audit/`
- **Referencia:** `audit_logging/_MAP.md`

---

### 10.5. lti_integration

**Tipo:** System - Integración LTI 1.3
**Ubicación:** `apps/database/ddl/schemas/lti_integration/`
**Estado:** ⚠️ **PARCIALMENTE DOCUMENTADO** (actualizado 2025-11-11)
**Prioridad:** P1 - Alto

#### Descripción
Learning Tools Interoperability 1.3 - Integración con plataformas LMS externas (Canvas, Moodle, Blackboard).

#### Estructura de Objetos
```
lti_integration/
├── _MAP.md
└── tables/          (3 tablas)
```

#### Objetos Contenidos
- **Tablas:** 3
  - lti_consumers.sql - Consumidores LTI (plataformas LMS)
  - lti_sessions.sql - Sesiones LTI activas
  - lti_grade_passback.sql - Envío de calificaciones a LMS
- **ENUMs:** 0
- **Functions:** 0
- **Triggers:** 0
- **Indexes:** 0
- **RLS Policies:** 0

#### Dependencias
- **Depende de:** auth_management, educational_content (Nivel 4)
- **Usado por:** Backend LTI module

#### ⚠️ Acción Requerida
- [ ] Crear README.md detallado con especificación LTI 1.3
- [ ] Documentar flujo de integración completo
- [ ] Agregar diagramas de secuencia de autenticación LTI

#### Referencias SIMCO
- **Documentación:** `docs/03-fase-extensiones/EXT-007-lti-integration/`
- **Backend:** `apps/backend/src/modules/lti/`
- **Especificación:** LTI 1.3 Advantage (IMS Global)

---

### 11. admin_dashboard

**Tipo:** Admin - Dashboard de Administración
**Ubicación:** `apps/database/ddl/schemas/admin_dashboard/`
**Estado:** ⚠️ **PARCIALMENTE DOCUMENTADO** (actualizado 2025-11-11)
**Prioridad:** P1 - Alto

#### Descripción
Schema dedicado a vistas y queries del dashboard de administración.

#### Estructura de Objetos
```
admin_dashboard/
├── _MAP.md
└── views/           (6 vistas analíticas)
```

#### Objetos Contenidos
- **Vistas:** 6
  - assignment_submission_stats - Estadísticas de envíos de asignaciones
  - classroom_overview - Resumen de aulas
  - moderation_queue - Cola de moderación de contenido
  - organization_stats_summary - Resumen de estadísticas organizacionales
  - recent_admin_actions - Acciones recientes de administradores
  - user_stats_summary - Resumen de estadísticas de usuarios
- **Tablas:** 0 (solo vistas, sin datos propios)


#### Dependencias
- **Depende de:** auth_management, progress_tracking, gamification_system (Nivel 5)
- **Usado por:** Backend admin module

#### ⚠️ Acción Requerida
- [ ] Documentar propósito exacto del schema
- [ ] Listar todas las vistas existentes
- [ ] Documentar cada vista (SQL, propósito, tablas origen)
- [ ] Verificar si hay materialized views
- [ ] Crear `admin_dashboard/README.md`

#### Referencias SIMCO
- **Documentación:** ⚠️ FALTANTE - Crear en `docs/03-desarrollo/base-de-datos/schemas/admin_dashboard/`
- **Backend:** `apps/backend/src/modules/admin/`
- **Frontend:** `apps/frontend/src/features/admin-dashboard/`

---

### 12. storage

**Tipo:** System - Gestión de Almacenamiento
**Ubicación:** `apps/database/ddl/schemas/storage/`
**Estado:** ⚠️ **PARCIALMENTE DOCUMENTADO** (actualizado 2025-11-11)
**Prioridad:** P2 - Medio

#### Descripción
Schema de soporte para integración con sistema de almacenamiento Storage compatible.

#### Estructura de Objetos
```
storage/
├── _MAP.md
└── enums/           (1 ENUM)
```

#### Objetos Contenidos
- **ENUMs:** 1
  - buckettype.sql - Tipos de bucket de almacenamiento
- **Tablas:** 0 (usa sistema de Storage compatible)
- **Functions:** 0 (funcionalidad delegada al sistema)

#### Dependencias
- **Depende de:** Ninguno (Nivel 0)
- **Usado por:** content_management, auth_management (avatares)

#### ⚠️ Acción Requerida
- [ ] Listar todos los ENUMs en storage
- [ ] Verificar si hay tablas de metadata de archivos
- [ ] Documentar integración con MinIO/S3
- [ ] Crear `storage/README.md`
- [ ] Validar sincronización de ENUMs con backend

#### Referencias SIMCO
- **Documentación:** ⚠️ FALTANTE - Crear en `docs/03-desarrollo/base-de-datos/schemas/storage/`
- **Backend:** `apps/backend/src/modules/storage/`
- **Integración:** MinIO/AWS S3

---

### 13. gamilit

**Tipo:** Core - Funciones Utilitarias
**Ubicación:** `apps/database/ddl/schemas/gamilit/`
**Estado:** ✅ **DOCUMENTADO** (actualizado 2025-11-11)
**Prioridad:** P0 - Crítico

#### Descripción
Schema de funciones utilitarias compartidas por todos los schemas. Funciones de auditoría, validación, timestamps, etc.

#### Estructura de Objetos
```
gamilit/
├── _MAP.md
├── functions/       (14 funciones utilitarias)
└── views/           (1 vista helper)
```

#### Objetos Contenidos
- **Functions:** 14
  - audit_profile_changes, get_current_user_id, get_current_user_role
  - initialize_user_stats, is_admin, now_mexico
  - set_profile_defaults, update_classroom_member_count
  - update_user_last_login, validate_email_format, validate_username
  - update_user_stats_on_exercise_complete
  - update_updated_at_column, validate_date_range
- **Vistas:** 1 (number_series - helper para generación de secuencias)
- **Tablas:** 0 (solo funciones utilitarias)

#### Dependencias
- **Depende de:** Ninguno (Nivel 0)
- **Usado por:** Todos los schemas (utilidades cross-schema)

#### Referencias SIMCO
- **Documentación:** `docs/90-transversal/FUNCIONES-UTILITARIAS-GAMILIT.md`
- **Backend:** Usado indirectamente por todos los módulos
- **Referencia:** `gamilit/_MAP.md`

---

### 14. public

**Tipo:** System - Schema Público PostgreSQL
**Ubicación:** `apps/database/ddl/schemas/public/`
**Estado:** ✅ **LIMPIADO** (actualizado 2025-11-11)
**Prioridad:** P3 - Bajo

#### Descripción
Schema público de PostgreSQL. Actualmente VACÍO - objetos legacy fueron migrados a schemas específicos.

#### Estructura de Objetos
```
public/
└── (Sin objetos SQL actualmente)
```

#### Objetos Contenidos
- **Tablas:** 0 (limpiado, migrado a schemas específicos)
- **ENUMs:** 0 (migrados a schemas específicos)
- **Functions:** 0 (migradas a gamilit o schemas específicos)
- **Triggers:** 0
- **Indexes:** 0

#### Nota
Según INVENTORY-MASTER-REPORT.md, existían objetos mal ubicados en public que debían migrarse:
- 33 ENUMs (89% del total) → Plan de migración en Fase 2B
- 64 índices (86% del total) → Redistribuir a schemas correctos
- 21 triggers duplicados → Consolidar

**Estado actual:** Directorio existe pero sin archivos SQL (limpieza completa)

#### Referencias SIMCO
- **Documentación:** `docs/90-transversal/inventarios-database/INVENTORY-MASTER-REPORT.md`
- **Plan de correcciones:** `docs/90-transversal/inventarios-database/TRACKING-CORRECCIONES.md`

---

## 📊 Resumen Estadístico

### Totales Generales

| Métrica | Cantidad |
|---------|----------|
| **Total de Schemas** | 14 |
| **Total de Objetos SQL** | 324 archivos |
| **Total de Tablas** | 101 |
| **Total de ENUMs** | 19 |
| **Total de Funciones** | 62 |
| **Total de Triggers** | 34 |
| **Total de Índices** | 67 |
| **Total de Vistas** | 12 |
| **Total de Vistas Materializadas** | 4 |
| **Total de Políticas RLS** | 24 |
| **Total de FK Constraints** | 1 |

### Por Tipo de Schema

| Categoría | Schemas | % |
|-----------|---------|---|
| **Core** | 3 (auth, auth_management, gamilit) | 21% |
| **Features** | 5 (gamification, educational, progress, content, social) | 36% |
| **System** | 4 (system_config, audit, storage, lti_integration) | 29% |
| **Admin** | 1 (admin_dashboard) | 7% |
| **Legacy/Limpiado** | 1 (public) | 7% |

### Por Estado de Documentación (Actualizado 2025-11-11)

| Estado | Schemas | % |
|--------|---------|---|
| ✅ Completamente Documentado | 10 | 71% |
| ⚠️ Parcialmente Documentado | 3 | 21% |
| ✅ Limpiado (sin objetos) | 1 | 7% |

### Schemas Parcialmente Documentados

1. **admin_dashboard** - P1 Alto (6 vistas documentadas, falta README detallado)
2. **storage** - P2 Medio (1 ENUM documentado, falta README detallado)
3. **lti_integration** - P1 Alto (3 tablas documentadas, falta README detallado)

---

## 🔗 Dependencias Entre Schemas (Análisis Topológico)

### Nivel 0 (Sin dependencias)
- `gamilit` (funciones utilitarias)
- `storage` (ENUMs de storage)
- `system_configuration` (configuración)

### Nivel 1 (Dependen de Nivel 0)
- `auth` (depende de: ninguno)
- `audit_logging` (depende de: auth para usuarios)

### Nivel 2 (Dependen de auth)
- `auth_management` (depende de: auth)

### Nivel 3 (Dependen de auth_management)
- `gamification_system` (depende de: auth_management, educational_content)
- `educational_content` (depende de: auth_management)
- `social_features` (depende de: auth_management, educational_content)

### Nivel 4 (Dependen de features)
- `progress_tracking` (depende de: auth_management, educational_content, gamification_system)
- `content_management` (depende de: auth_management, storage)

### Nivel 5 (Dependen de múltiples schemas)
- `admin_dashboard` (depende de: auth_management, progress_tracking, gamification_system)

### Sin Clasificar
- `public` (requiere análisis de dependencias)

---

## 🎯 Próximas Acciones

### Fase 1 - Inventario (actual)
- [x] Inventario de schemas completado
- [ ] Inventario de tablas (siguiente)
- [ ] Inventario de ENUMs
- [ ] Inventario de funciones
- [ ] Inventario de triggers
- [ ] Inventario de RLS policies
- [ ] Inventario de índices
- [ ] Inventario de vistas
- [ ] Inventario de seeds

### Fase 2 - Documentación
- [ ] Documentar `admin_dashboard`
- [ ] Documentar `storage`
- [ ] Analizar y documentar `public`
- [ ] Actualizar documentación de schemas existentes

---

## 📎 Referencias SIMCO

**Este documento es parte del sistema SIMCO (Sistema Indexado Modular por Contexto)**

### Referencias Cruzadas
- **Plan Maestro:** `apps/database/PLAN-ACTUALIZACION-DOCUMENTACION.md`
- **Siguiente inventario:** `apps/database/docs/inventarios/02-TABLES-INVENTORY.md`
- **Documentación schemas:** `docs/03-desarrollo/base-de-datos/schemas/`
- **DDL Source:** `apps/database/ddl/schemas/`

### Índices Relacionados
- Inventario de Tablas → `02-TABLES-INVENTORY.md`
- Inventario de ENUMs → `03-ENUMS-INVENTORY.md`
- Inventario de Funciones → `04-FUNCTIONS-INVENTORY.md`
- Reporte Maestro → `INVENTORY-MASTER-REPORT.md`

---

**Generado por:** Sistema de inventario automatizado
**Método:** Análisis de estructura DDL
**Próxima actualización:** Fase 2 - Documentación de schemas faltantes
