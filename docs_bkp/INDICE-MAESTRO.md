# Índice Maestro de Documentación - Gamilit

**Versión:** 2.0
**Fecha:** 2025-11-07
**Estado:** 🔄 En construcción (Estructura modular implementada)

---

## 📋 Propósito

Este índice maestro proporciona una vista completa de toda la documentación del proyecto Gamilit, organizada de forma modular con referencias cruzadas entre requerimientos, especificaciones técnicas, e implementación.

---

## 🗂️ Estructura de Documentación

```
docs/
├── 00-overview/                     # Visión general del proyecto
├── 01-requerimientos/               # ⭐ Requerimientos funcionales
│   ├── 01-autenticacion-autorizacion/
│   │   ├── _MAP.md                  # Índice del módulo
│   │   ├── RF-AUTH-001-roles.md
│   │   ├── RF-AUTH-002-estados-cuenta.md
│   │   └── RF-AUTH-003-oauth.md
│   ├── 02-gamificacion/
│   │   ├── _MAP.md
│   │   ├── RF-GAM-001-achievements.md
│   │   └── RF-GAM-002-comodines.md
│   ├── 03-contenido-educativo/
│   │   ├── _MAP.md
│   │   ├── RF-EDU-001-mecanicas-ejercicios.md
│   │   ├── RF-EDU-002-niveles-dificultad.md
│   │   └── RF-EDU-003-taxonomia-bloom.md
│   ├── 04-progreso-seguimiento/
│   │   ├── _MAP.md
│   │   ├── RF-PRG-001-tracking-progreso.md
│   │   └── RF-PRG-002-intentos-ejercicios.md
│   ├── 05-caracteristicas-sociales/
│   │   ├── _MAP.md
│   │   ├── RF-SOC-001-aulas-virtuales.md
│   │   ├── RF-SOC-002-equipos-colaborativos.md
│   │   └── RF-SOC-003-sistema-amigos.md
│   ├── 06-notificaciones/
│   │   ├── _MAP.md
│   │   ├── RF-NOT-001-tipos-notificaciones.md
│   │   └── RF-NOT-002-priorizacion.md
│   ├── 07-contenido-media/
│   │   ├── _MAP.md
│   │   ├── RF-CNT-001-ciclo-vida-contenido.md
│   │   ├── RF-CNT-002-multimedia.md
│   │   └── RF-CNT-003-procesamiento-media.md
│   ├── 08-auditoria-configuracion/
│   │   ├── _MAP.md
│   │   ├── RF-AUD-001-registro-acciones.md
│   │   ├── RF-AUD-002-logging-sistema.md
│   │   ├── RF-AUD-003-sistema-alertas.md
│   │   ├── RF-AUD-004-workflow-alertas.md
│   │   └── RF-CFG-001-sistema-configuracion.md
│   └── _MAP.md                      # Índice general de requerimientos
│
├── 02-especificaciones-tecnicas/    # ⭐ Especificaciones técnicas
│   ├── 01-autenticacion-autorizacion/
│   │   ├── _MAP.md
│   │   ├── ET-AUTH-001-rbac.md
│   │   ├── ET-AUTH-002-estados-cuenta.md
│   │   └── ET-AUTH-003-oauth.md
│   ├── 02-gamificacion/
│   │   ├── _MAP.md
│   │   ├── ET-GAM-001-achievements.md
│   │   └── ET-GAM-002-comodines.md
│   ├── 03-contenido-educativo/
│   │   ├── _MAP.md
│   │   ├── ET-EDU-001-mecanicas-ejercicios.md
│   │   ├── ET-EDU-002-niveles-dificultad.md
│   │   └── ET-EDU-003-taxonomia-bloom.md
│   ├── 04-progreso-seguimiento/
│   │   ├── _MAP.md
│   │   ├── ET-PRG-001-tracking-progreso.md
│   │   └── ET-PRG-002-intentos-ejercicios.md
│   ├── 05-caracteristicas-sociales/
│   │   ├── _MAP.md
│   │   ├── ET-SOC-001-aulas-virtuales.md
│   │   ├── ET-SOC-002-equipos-colaborativos.md
│   │   └── ET-SOC-003-sistema-amigos.md
│   ├── 06-notificaciones/
│   │   ├── _MAP.md
│   │   ├── ET-NOT-001-tipos-notificaciones.md
│   │   └── ET-NOT-002-priorizacion.md
│   ├── 07-contenido-media/
│   │   ├── _MAP.md
│   │   ├── ET-CNT-001-ciclo-vida-contenido.md
│   │   ├── ET-CNT-002-multimedia.md
│   │   └── ET-CNT-003-procesamiento-media.md
│   ├── 08-auditoria-configuracion/
│   │   ├── _MAP.md
│   │   ├── ET-AUD-001-registro-acciones.md
│   │   ├── ET-AUD-002-logging-sistema.md
│   │   ├── ET-AUD-003-sistema-alertas.md
│   │   ├── ET-AUD-004-workflow-alertas.md
│   │   └── ET-CFG-001-sistema-configuracion.md
│   ├── adr/                         # Architectural Decision Records
│   └── _MAP.md
│
├── 03-desarrollo/                   # ⭐ Documentación de desarrollo
│   ├── base-de-datos/
│   │   ├── MAPEO-REQUERIMIENTOS-IMPLEMENTACION.md  # 📊 Mapeo completo
│   │   ├── TIPOS-Y-ENUMS.md
│   │   ├── ESQUEMA-COMPLETO.md
│   │   └── _MAP.md
│   ├── backend/
│   │   └── _MAP.md
│   └── frontend/
│       └── _MAP.md
│
├── 04-planificacion/                # Planificación y roadmap
├── 05-implementacion/               # Guías de implementación
└── INDICE-MAESTRO.md               # 📖 Este archivo
```

---

## 📚 Módulos de Documentación

### 🔐 Módulo 1: Autenticación y Autorización

**Requerimientos Funcionales:**
- [`RF-AUTH-001: Sistema de Roles`](01-requerimientos/01-autenticacion-autorizacion/RF-AUTH-001-roles.md) → Define roles: student, admin_teacher, super_admin
- [`RF-AUTH-002: Estados de Cuenta`](01-requerimientos/01-autenticacion-autorizacion/RF-AUTH-002-estados-cuenta.md) → Ciclo de vida: pending, active, inactive, suspended, banned
- [`RF-AUTH-003: Proveedores OAuth`](01-requerimientos/01-autenticacion-autorizacion/RF-AUTH-003-oauth.md) → 6 proveedores: local, google, facebook, apple, microsoft, github

**Especificaciones Técnicas:**
- [`ET-AUTH-001: RBAC`](02-especificaciones-tecnicas/01-autenticacion-autorizacion/ET-AUTH-001-rbac.md) → Implementación RLS, guards, policies
- [`ET-AUTH-002: Estados de Cuenta`](02-especificaciones-tecnicas/01-autenticacion-autorizacion/ET-AUTH-002-estados-cuenta.md) → Workflow, triggers, validaciones
- [`ET-AUTH-003: OAuth Providers`](02-especificaciones-tecnicas/01-autenticacion-autorizacion/ET-AUTH-003-oauth.md) → Strategies, callbacks, configuración

**ENUMs:**
- `auth_management.gamilit_role` → `00-prerequisites.sql:30-32`
- `auth_management.user_status` → `00-prerequisites.sql:34-36`
- `public.auth_provider` → `00-prerequisites.sql:38-40`

**Índice del módulo:** [`_MAP.md`](01-requerimientos/01-autenticacion-autorizacion/_MAP.md)

---

### 🎮 Módulo 2: Gamificación

**Requerimientos Funcionales:**
- [`RF-GAM-001: Sistema de Logros`](01-requerimientos/02-gamificacion/RF-GAM-001-achievements.md) → Achievements con tipos y categorías
- [`RF-GAM-002: Sistema de Comodines`](01-requerimientos/02-gamificacion/RF-GAM-002-comodines.md) → Power-ups con ML Coins

**Especificaciones Técnicas:**
- [`ET-GAM-001: Achievements`](02-especificaciones-tecnicas/02-gamificacion/ET-GAM-001-achievements.md) → Triggers, recompensas, criterios
- [`ET-GAM-002: Comodines`](02-especificaciones-tecnicas/02-gamificacion/ET-GAM-002-comodines.md) → Economía, restricciones, efectos

**ENUMs:**
- `gamification_system.achievement_type` → `00-prerequisites.sql:51-54`
- `gamification_system.achievement_category` → `00-prerequisites.sql:47-50`
- `gamification_system.comodin_type` → `00-prerequisites.sql:55-58`

---

### 📚 Módulo 3: Contenido Educativo

**Requerimientos Funcionales:**
- [`RF-EDU-001: Mecánicas de Ejercicios`](01-requerimientos/03-contenido-educativo/RF-EDU-001-mecanicas-ejercicios.md) → 31 mecánicas interactivas
- [`RF-EDU-002: Niveles de Dificultad`](01-requerimientos/03-contenido-educativo/RF-EDU-002-niveles-dificultad.md) → 8 niveles: very_easy → very_hard
- [`RF-EDU-003: Taxonomía de Bloom`](01-requerimientos/03-contenido-educativo/RF-EDU-003-taxonomia-bloom.md) → 6 niveles cognitivos

**Especificaciones Técnicas:**
- [`ET-EDU-001: 31 Mecánicas Detalladas`](02-especificaciones-tecnicas/03-contenido-educativo/ET-EDU-001-mecanicas-ejercicios.md) → Handlers, componentes, validación
- [`ET-EDU-002: Escala de Dificultad`](02-especificaciones-tecnicas/03-contenido-educativo/ET-EDU-002-niveles-dificultad.md) → Sistema adaptativo
- [`ET-EDU-003: Bloom Adaptado`](02-especificaciones-tecnicas/03-contenido-educativo/ET-EDU-003-taxonomia-bloom.md) → Reportes cognitivos

**ENUMs:**
- `educational_content.exercise_type` → `00-prerequisites.sql:80-97`
- `public.difficulty_level` → `00-prerequisites.sql:99-101`
- `public.cognitive_level` → `00-prerequisites.sql:111-113`

---

### 📊 Módulo 4: Progreso y Seguimiento

**Requerimientos Funcionales:**
- [`RF-PRG-001: Tracking de Progreso`](01-requerimientos/04-progreso-seguimiento/RF-PRG-001-tracking-progreso.md) → Estados: not_started → mastered
- [`RF-PRG-002: Intentos de Ejercicios`](01-requerimientos/04-progreso-seguimiento/RF-PRG-002-intentos-ejercicios.md) → Flujo: in_progress → graded/reviewed

**Especificaciones Técnicas:**
- [`ET-PRG-001: Sistema de Progreso`](02-especificaciones-tecnicas/04-progreso-seguimiento/ET-PRG-001-tracking-progreso.md) → Criterios, triggers, cálculos
- [`ET-PRG-002: Flujo de Intentos`](02-especificaciones-tecnicas/04-progreso-seguimiento/ET-PRG-002-intentos-ejercicios.md) → Auto-grading, queue, revisión manual

**ENUMs:**
- `public.progress_status` → `00-prerequisites.sql:124-127`
- `public.attempt_status` → `00-prerequisites.sql:128-131`

---

### 👥 Módulo 5: Características Sociales

**Requerimientos Funcionales:**
- [`RF-SOC-001: Aulas Virtuales`](01-requerimientos/05-caracteristicas-sociales/RF-SOC-001-aulas-virtuales.md) → Roles: teacher, student, assistant
- [`RF-SOC-002: Equipos Colaborativos`](01-requerimientos/05-caracteristicas-sociales/RF-SOC-002-equipos-colaborativos.md) → Roles: leader, coordinator, member
- [`RF-SOC-003: Sistema de Amigos`](01-requerimientos/05-caracteristicas-sociales/RF-SOC-003-sistema-amigos.md) → Estados: pending, accepted, blocked

**Especificaciones Técnicas:**
- [`ET-SOC-001: Sistema de Aulas`](02-especificaciones-tecnicas/05-caracteristicas-sociales/ET-SOC-001-aulas-virtuales.md) → Permisos, RLS, gestión
- [`ET-SOC-002: Sistema de Equipos`](02-especificaciones-tecnicas/05-caracteristicas-sociales/ET-SOC-002-equipos-colaborativos.md) → Bonus XP, coordinación
- [`ET-SOC-003: Sistema de Amistades`](02-especificaciones-tecnicas/05-caracteristicas-sociales/ET-SOC-003-sistema-amigos.md) → Workflow, notificaciones

**ENUMs:**
- `public.classroom_role` → `00-prerequisites.sql:133-136`
- `public.team_role` → `00-prerequisites.sql:137-140`
- `public.friendship_status` → `00-prerequisites.sql:141-143`

---

### 🔔 Módulo 6: Notificaciones

**Requerimientos Funcionales:**
- [`RF-NOT-001: Tipos de Notificaciones`](01-requerimientos/06-notificaciones/RF-NOT-001-tipos-notificaciones.md) → 11 tipos de notificaciones
- [`RF-NOT-002: Priorización`](01-requerimientos/06-notificaciones/RF-NOT-002-priorizacion.md) → 4 niveles: low, medium, high, critical

**Especificaciones Técnicas:**
- [`ET-NOT-001: Catálogo de Notificaciones`](02-especificaciones-tecnicas/06-notificaciones/ET-NOT-001-tipos-notificaciones.md) → WebSocket, triggers, templates
- [`ET-NOT-002: Sistema de Priorización`](02-especificaciones-tecnicas/06-notificaciones/ET-NOT-002-priorizacion.md) → SLA, escalamiento, UI

**ENUMs:**
- `public.notification_type` → `00-prerequisites.sql:59-72`
- `public.notification_priority` → `00-prerequisites.sql:75-78`

---

### 🎬 Módulo 7: Contenido y Media

**Requerimientos Funcionales:**
- [`RF-CNT-001: Ciclo de Vida del Contenido`](01-requerimientos/07-contenido-media/RF-CNT-001-ciclo-vida-contenido.md) → draft → under_review → published → archived
- [`RF-CNT-002: Archivos Multimedia`](01-requerimientos/07-contenido-media/RF-CNT-002-multimedia.md) → 5 tipos: image, video, audio, document, interactive
- [`RF-CNT-003: Procesamiento de Media`](01-requerimientos/07-contenido-media/RF-CNT-003-procesamiento-media.md) → Pipeline asíncrono: pending → processing → completed

**Especificaciones Técnicas:**
- [`ET-CNT-001: Workflow de Contenido`](02-especificaciones-tecnicas/07-contenido-media/ET-CNT-001-ciclo-vida-contenido.md) → RLS por estado, aprobaciones
- [`ET-CNT-002: Especificaciones Multimedia`](02-especificaciones-tecnicas/07-contenido-media/ET-CNT-002-multimedia.md) → Storage, CDN, validaciones
- [`ET-CNT-003: Pipeline de Procesamiento`](02-especificaciones-tecnicas/07-contenido-media/ET-CNT-003-procesamiento-media.md) → Queue, FFmpeg, workers

**ENUMs:**
- `public.content_status` → `00-prerequisites.sql:107-110`
- `public.media_type` → `00-prerequisites.sql:115-118`
- `public.processing_status` → `00-prerequisites.sql:119-122`

---

### 📋 Módulo 8: Auditoría y Configuración

**Requerimientos Funcionales:**
- [`RF-AUD-001: Registro de Acciones`](01-requerimientos/08-auditoria-configuracion/RF-AUD-001-registro-acciones.md) → 8 acciones auditables
- [`RF-AUD-002: Logging del Sistema`](01-requerimientos/08-auditoria-configuracion/RF-AUD-002-logging-sistema.md) → 5 niveles de log
- [`RF-AUD-003: Sistema de Alertas`](01-requerimientos/08-auditoria-configuracion/RF-AUD-003-sistema-alertas.md) → 4 severidades de alertas
- [`RF-AUD-004: Workflow de Alertas`](01-requerimientos/08-auditoria-configuracion/RF-AUD-004-workflow-alertas.md) → Estados: active → acknowledged → resolved
- [`RF-CFG-001: Sistema de Configuración`](01-requerimientos/08-auditoria-configuracion/RF-CFG-001-sistema-configuracion.md) → 5 tipos de configuración

**Especificaciones Técnicas:**
- [`ET-AUD-001: Sistema de Auditoría`](02-especificaciones-tecnicas/08-auditoria-configuracion/ET-AUD-001-registro-acciones.md) → Triggers automáticos, retención
- [`ET-AUD-002: Sistema de Logging`](02-especificaciones-tecnicas/08-auditoria-configuracion/ET-AUD-002-logging-sistema.md) → Winston, agregación, alerting
- [`ET-AUD-003: Sistema de Alertas`](02-especificaciones-tecnicas/08-auditoria-configuracion/ET-AUD-003-sistema-alertas.md) → PagerDuty, Slack, SLA
- [`ET-AUD-004: Workflow de Alertas`](02-especificaciones-tecnicas/08-auditoria-configuracion/ET-AUD-004-workflow-alertas.md) → Gestión de incidentes
- [`ET-CFG-001: Sistema de Configuración`](02-especificaciones-tecnicas/08-auditoria-configuracion/ET-CFG-001-sistema-configuracion.md) → Feature flags, validaciones

**ENUMs:**
- `public.audit_action` → `00-prerequisites.sql:155-158`
- `public.log_level` → `00-prerequisites.sql:150-153`
- `public.alert_severity` → `00-prerequisites.sql:159-162`
- `public.alert_status` → `00-prerequisites.sql:163-166`
- `public.setting_type` → `00-prerequisites.sql:146-149`

---

## 📊 Estadísticas Generales

### Por Módulo

| Módulo | RFs | ETs | ENUMs | Tablas | Backend | Frontend | Estado |
|--------|-----|-----|-------|--------|---------|----------|--------|
| 1. Autenticación | 3 | 3 | 3 | 5 | ✅ | ✅ | 100% |
| 2. Gamificación | 2 | 2 | 3 | 7 | ✅ | ✅ | 100% |
| 3. Contenido Educativo | 3 | 3 | 3 | 4 | ✅ | ✅ | 100% |
| 4. Progreso | 2 | 2 | 2 | 4 | ✅ | ✅ | 100% |
| 5. Social | 3 | 3 | 3 | 5 | ✅ | ✅ | 100% |
| 6. Notificaciones | 2 | 2 | 2 | 1 | ✅ | ✅ | 100% |
| 7. Media | 3 | 3 | 3 | 2 | ✅ | ✅ | 100% |
| 8. Auditoría | 5 | 5 | 5 | 4 | ✅ | ✅ | 100% |
| **TOTAL** | **23** | **23** | **24** | **32+** | ✅ | ✅ | **100%** |

### Consolidación de Base de Datos

- ✅ **24 ENUMs** consolidados (0 duplicados)
- ✅ **11 referencias incorrectas** corregidas
- ✅ **23 archivos duplicados** eliminados
- ✅ **Database Inventory Master** regenerado
- ✅ **Validación automática** pasando (10/10 tests)

**Fecha última consolidación:** 2025-11-07

---

## 🗺️ Navegación Rápida

### Documentos Clave

1. **Mapeo Completo:**
   - [`MAPEO-REQUERIMIENTOS-IMPLEMENTACION.md`](03-desarrollo/base-de-datos/MAPEO-REQUERIMIENTOS-IMPLEMENTACION.md) - Trazabilidad completa Requerimientos → DDL → Código

2. **Inventarios:**
   - [`DATABASE-INVENTORY-MASTER.md`](../orchestration/05-validaciones/consolidacion/DATABASE-INVENTORY-MASTER-FINAL-2025-11-07.md) - Inventario técnico completo

3. **Reportes:**
   - [`REPORTE-FINAL-VALIDACION.md`](../orchestration/05-validaciones/consolidacion/REPORTE-FINAL-VALIDACION-2025-11-07.md) - Métricas de consolidación

### Por Tipo de Documento

**Requerimientos Funcionales (RF):**
- Prefijo: `RF-{MOD}-{NNN}`
- Ubicación: `docs/01-requerimientos/{modulo}/`
- Total: 23 archivos

**Especificaciones Técnicas (ET):**
- Prefijo: `ET-{MOD}-{NNN}`
- Ubicación: `docs/02-especificaciones-tecnicas/{modulo}/`
- Total: 23 archivos

**Índices de Módulo (_MAP.md):**
- Ubicación: `{modulo}/_MAP.md`
- Total: 16 archivos (8 en requerimientos + 8 en especificaciones)

---

## 🔍 Cómo Usar Esta Documentación

### Para Product Owners

1. Navegar a `01-requerimientos/{modulo}/`
2. Leer archivos `RF-*.md` para entender funcionalidad
3. Verificar estado de implementación en metadata
4. Consultar casos de uso y criterios de aceptación

### Para Desarrolladores

1. Leer `RF-*.md` para contexto de negocio
2. Consultar `ET-*.md` para detalles técnicos
3. Verificar referencias DDL con números de línea exactos
4. Seguir links a backend/frontend para implementación

### Para QA/Testing

1. Leer sección "Casos de Uso" en `RF-*.md`
2. Consultar "Criterios de Aceptación"
3. Revisar "Testing" en `ET-*.md` para test cases
4. Validar coherencia entre capas usando mapeo

---

## 🔗 Referencias Externas

### Repositorio
- **Database DDL:** `apps/database/ddl/`
- **Backend:** `apps/backend/src/`
- **Frontend:** `apps/frontend/src/`

### Estándares
- [NIST RBAC](https://csrc.nist.gov/projects/role-based-access-control)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/current/)

---

## 📅 Historial de Cambios

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 2025-11-07 | Creación de estructura modular inicial |
| 2.0 | 2025-11-07 | Implementación completa de estructura modular con 23 RFs + 23 ETs |

---

**Documento:** `docs/INDICE-MAESTRO.md`
**Última actualización:** 2025-11-07
**Mantenedor:** Database Team
