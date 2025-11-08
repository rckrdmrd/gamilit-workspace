# Inventario de Schemas - Base de Datos GAMILIT

**Fecha generación:** 2025-11-07
**Versión:** 1.0
**Total schemas:** 13
**Método:** Análisis de estructura DDL

---

## 📑 Índice de Schemas

| # | Schema | Tipo | Objetos | Estado Doc | Prioridad |
|---|--------|------|---------|------------|-----------|
| 01 | [auth](#01-auth) | Core | Tablas(1), ENUMs, Functions | ✅ Documentado | P0 |
| 02 | [auth_management](#02-auth_management) | Core | Tablas, Functions, Triggers, RLS, Indexes | ✅ Documentado | P0 |
| 03 | [gamilit](#03-gamilit) | Core/Utilities | Functions | ✅ Documentado | P0 |
| 04 | [gamification_system](#04-gamification_system) | Feature | Tablas, ENUMs, Functions, RLS, Indexes, MVs | ✅ Documentado | P0 |
| 05 | [educational_content](#05-educational_content) | Feature | Tablas, Functions, Triggers, RLS | ✅ Documentado | P1 |
| 06 | [progress_tracking](#06-progress_tracking) | Feature | Tablas, Functions, Triggers, RLS, Indexes | ✅ Documentado | P1 |
| 07 | [content_management](#07-content_management) | Feature | Tablas, Triggers, RLS, Indexes | ✅ Documentado | P1 |
| 08 | [social_features](#08-social_features) | Feature | Tablas, Functions, Triggers, RLS | ✅ Documentado | P2 |
| 09 | [system_configuration](#09-system_configuration) | System | Tablas, Triggers, RLS | ✅ Documentado | P1 |
| 10 | [audit_logging](#10-audit_logging) | System | Tablas, Functions, Triggers, RLS | ✅ Documentado | P1 |
| 11 | [admin_dashboard](#11-admin_dashboard) | Admin | Views | ⚠️ No documentado | P1 |
| 12 | [storage](#12-storage) | System | ENUMs | ⚠️ No documentado | P2 |
| 13 | [public](#13-public) | Legacy/Unknown | Tablas, ENUMs, Functions, Triggers, Indexes | ⚠️ No documentado | P2 |

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
- **Tablas:** 12
  - users, roles, permissions, user_roles
  - sessions, password_resets, email_verifications
  - oauth_providers, oauth_tokens, user_settings
  - user_profiles, user_preferences
- **Functions:** Sí (gestión de roles, permisos, sesiones)
- **Triggers:** Sí (auditoría, timestamps, validaciones)
- **RLS Policies:** Sí (multi-tenancy, aislamiento por usuario)
- **Indexes:** Sí (optimización de autenticación)

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
**Estado:** ✅ Documentado
**Prioridad:** P1 - Alto

#### Descripción
Sistema de gestión de contenido multimedia y recursos educativos.

#### Estructura de Objetos
```
content_management/
├── _MAP.md
├── indexes/         (Búsqueda de contenido)
├── rls-policies/    (Permisos de edición)
├── tables/          (5 tablas)
└── triggers/        (Versionado, auditoría)
```

#### Objetos Contenidos
- **Tablas:** 5
  - content_items, content_versions
  - media_files, resource_library
  - content_tags
- **Triggers:** Sí (versionado automático)
- **RLS Policies:** Sí (creators pueden editar, otros solo leer)
- **Indexes:** Sí (búsqueda por tags, tipo, fecha)

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
- **Tablas:** 3
  - app_settings, feature_flags
  - system_variables
- **Triggers:** Sí (log de cambios de configuración)
- **RLS Policies:** Sí (solo role admin)

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
  - audit_logs, user_activity_logs
  - data_change_logs, access_logs
  - error_logs, system_events
- **Functions:** Sí (logging helpers)
- **Triggers:** Sí (logging automático de cambios)
- **RLS Policies:** Sí (solo admins pueden leer logs)

#### Dependencias
- **Depende de:** auth_management (Nivel 1)
- **Usado por:** Todos los schemas (auditoría universal)

#### Referencias SIMCO
- **Documentación:** `docs/03-desarrollo/base-de-datos/schemas/audit_logging/`
- **Backend:** `apps/backend/src/modules/audit/`
- **Referencia:** `audit_logging/_MAP.md`

---

### 11. admin_dashboard

**Tipo:** Admin - Dashboard de Administración
**Ubicación:** `apps/database/ddl/schemas/admin_dashboard/`
**Estado:** ⚠️ **NO DOCUMENTADO**
**Prioridad:** P1 - Alto

#### Descripción
Schema dedicado a vistas y queries del dashboard de administración.

#### Estructura de Objetos
```
admin_dashboard/
└── views/           (Vistas pre-calculadas para dashboard)
```

#### Objetos Contenidos
- **Views:** Sí (métricas agregadas, reportes)
  - Vista de usuarios activos
  - Vista de estadísticas de uso
  - Vista de métricas de gamificación
  - Vista de progreso global
  - (Total: 4 vistas estimadas)
- **Tablas:** No
- **Materialized Views:** ¿Posible? (pendiente verificar)

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
**Estado:** ⚠️ **NO DOCUMENTADO**
**Prioridad:** P2 - Medio

#### Descripción
Schema de soporte para integración con sistema de almacenamiento de archivos (MinIO/S3).

#### Estructura de Objetos
```
storage/
└── enums/           (Tipos de archivo, estados de upload)
```

#### Objetos Contenidos
- **ENUMs:** Sí
  - Tipos de archivo (imagen, video, audio, documento)
  - Estados de upload (pending, uploading, completed, failed)
  - Políticas de acceso (public, private, authenticated)
- **Tablas:** No (¿posible? pendiente verificar)
- **Functions:** No (¿posible? pendiente verificar)

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

### 13. public

**Tipo:** Legacy/Unknown - Schema Público
**Ubicación:** `apps/database/ddl/schemas/public/`
**Estado:** ⚠️ **NO DOCUMENTADO - REQUIERE ANÁLISIS**
**Prioridad:** P2 - Medio (puede ser legacy)

#### Descripción
Schema público de PostgreSQL. Uso indeterminado - requiere investigación para determinar si es legacy o funcional.

#### Estructura de Objetos
```
public/
├── enums/           (ENUMs en public schema)
├── functions/       (Funciones en public)
├── indexes/         (Índices)
├── tables/          (9 tablas - posible legacy)
└── triggers/        (Triggers)
```

#### Objetos Contenidos
- **Tablas:** 9 (⚠️ CANTIDAD SIGNIFICATIVA - requiere análisis)
- **ENUMs:** Sí
- **Functions:** Sí
- **Triggers:** Sí
- **Indexes:** Sí

#### ⚠️ Análisis Requerido
**Posibles escenarios:**
1. **Legacy Migration:** Tablas de sistema anterior no migradas completamente
2. **Funcional:** Tablas compartidas o de utilidades que deben estar en public
3. **PostgreSQL Default:** Extensiones o funcionalidades de PostgreSQL
4. **Temporal:** Tablas temporales que deberían moverse a schemas específicos

#### ⚠️ Acción Requerida
- [ ] Listar las 9 tablas en public
- [ ] Investigar propósito de cada tabla
- [ ] Revisar git history para entender origen
- [ ] Determinar si son legacy o funcionales
- [ ] Si legacy: Crear plan de migración o deprecación
- [ ] Si funcional: Documentar propósito y justificación
- [ ] Crear `public/README.md` con análisis

#### Referencias SIMCO
- **Documentación:** ⚠️ FALTANTE - Crear en `docs/03-desarrollo/base-de-datos/schemas/public/`
- **Backend:** ¿Desconocido? - Requiere investigación

---

## 📊 Resumen Estadístico

### Por Tipo de Schema

| Categoría | Schemas | % |
|-----------|---------|---|
| **Core** | 3 (auth, auth_management, gamilit) | 23% |
| **Features** | 5 (gamification, educational, progress, content, social) | 38% |
| **System** | 3 (system_config, audit, storage) | 23% |
| **Admin** | 1 (admin_dashboard) | 8% |
| **Legacy/Unknown** | 1 (public) | 8% |

### Por Estado de Documentación

| Estado | Schemas | % |
|--------|---------|---|
| ✅ Documentado | 10 | 77% |
| ⚠️ No documentado | 3 | **23%** |

### Schemas No Documentados (Prioridad)

1. **admin_dashboard** - P1 Alto (vistas de dashboard)
2. **storage** - P2 Medio (ENUMs de almacenamiento)
3. **public** - P2 Medio (requiere análisis - posible legacy)

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
