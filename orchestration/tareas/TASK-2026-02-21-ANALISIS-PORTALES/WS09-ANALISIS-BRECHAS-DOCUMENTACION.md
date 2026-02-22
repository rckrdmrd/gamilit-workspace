# WS09 - Analisis de Brechas en Documentacion

**Version:** 1.0.0
**Fecha:** 2026-02-21
**Estado:** Activo
**Tarea:** TASK-2026-02-21-ANALISIS-PORTALES
**Scope:** Inventario completo de documentacion frontend + identificacion de brechas

---

## 1. Inventario de Documentacion Existente

### 1.1 docs/30-ux-ui/flujos/

#### Documentos de gobernanza y auditoria de flujos

| Archivo | Ultima Mod | Descripcion | Estado |
|---------|------------|-------------|--------|
| `README.md` | 2026-02-17 | Indice maestro de todos los flujos catalogados | Completo |
| `_TEMPLATE-FLUJO.md` | 2026-02-17 | Plantilla estandar de 9 secciones para flujos | Completo |
| `COBERTURA-TOTAL-PROCESOS.md` | 2026-02-17 | Matriz maestra de 43 procesos end-to-end con trazabilidad completa | Completo |
| `TRACEABILITY-MATRIX.md` | 2026-02-21 | Matriz FE/BE/DB para 46 flujos FL-* catalogados (v1.8.0) | Completo |
| `MATRIZ-BRECHAS-TRAZABILIDAD-2026-02-17.md` | 2026-02-17 | 8 gaps de trazabilidad identificados (GAP-TRZ-001..008) | Completo |
| `VALIDACION-ANALISIS-VS-INTEGRACION.md` | 2026-02-17 | Validacion cruzada analisis inicial vs integracion documental | Completo |
| `AUDITORIA-CONSISTENCIA-FE-BE-DB.md` | 2026-02-17 | Checklist y metodologia de auditoria por flujo | Completo |
| `AUDITORIA-FASE1-CALIDAD-FLUJOS-2026-02-17.md` | 2026-02-17 | Auditoria de calidad: 14 verdes, 25 amarillos, 3 naranja | Completo |
| `AUDITORIA-P0-RESULTADOS.md` | 2026-02-17 | Resultados auditoria oleada P0 (FL-STU-03, FL-STU-04, FL-TCH-01) | Completo |
| `AUDITORIA-RESIDUAL-FULL.md` | 2026-02-17 | Auditoria oleada full P1/P2/transversal, estado: Cerrado | Completo |
| `REPORTE-FINAL-CONFORMIDAD-FULL.md` | 2026-02-17 | Reporte final de conformidad de todos los flujos | Completo |

#### Flujos Auth/Shared

| Archivo | ID Flujo | Ultima Mod | Descripcion | Estado |
|---------|---------|------------|-------------|--------|
| `auth/FLUJO-REGISTRO-LOGIN.md` | FL-AUTH-01 | 2026-02-17 | Registro + login + inicializacion de usuario | Completo |
| `auth/FLUJO-RECUPERACION-PASSWORD.md` | FL-AUTH-02 | 2026-02-17 | Recuperacion y reset de password | Completo |
| `auth/FLUJO-VERIFICACION-EMAIL.md` | FL-AUTH-03 | 2026-02-17 | Verificacion de email post-registro | Completo |
| `shared/FLUJO-PERFIL-CONFIGURACION.md` | FL-SHR-01 / FL-TCH-07 | 2026-02-17 | Perfil y configuracion multi-portal (v1.1.0) | Completo |
| `shared/FLUJO-SESION-SEGURIDAD.md` | FL-SHR-02 (Compuesto) | 2026-02-17 | Sesion y seguridad — referencia a FL-AUTH-01/02/03 | Completo |
| `shared/FLUJO-WHITE-LABEL-THEMING.md` | FL-SHR-03 | 2026-02-17 | White-label y theming de tenants | Completo |

#### Admin Flows

| Archivo | ID Flujo | Ultima Mod | Descripcion | Estado de Plantilla |
|---------|---------|------------|-------------|---------------------|
| `admin/FLUJO-GESTION-USUARIOS-ROLES.md` | FL-ADM-01 | 2026-02-17 | Alta/edicion/asignacion de roles de usuario | Parcial (sin template completo) |
| `admin/FLUJO-CONFIGURACION-SISTEMA.md` | FL-ADM-02 | 2026-02-18 | Configuracion global del sistema, feature flags | Parcial |
| `admin/FLUJO-APROBACION-CONTENIDO.md` | FL-ADM-03 | 2026-02-18 | Aprobacion/rechazo de contenido educativo (v1.1.0) | Parcial |
| `admin/FLUJO-MONITOREO-SISTEMA.md` | FL-ADM-04 | 2026-02-18 | Salud operativa y alertas de plataforma (v1.1.0) | Parcial |
| `admin/FLUJO-INTEGRACIONES-LTI.md` | FL-ADM-05 | 2026-02-19 | Configuracion de consumidores LTI | Parcial |
| `admin/FLUJO-AUDIT-LOGS.md` | FL-ADM-06 | 2026-02-18 | Consulta de logs de auditoria | Parcial |
| `admin/FLUJO-CONSTRUCTOR-EJERCICIOS.md` | FL-ADM-07 | 2026-02-21 | Constructor de ejercicios 4 pasos, 17 tipos (v1.3.0) | VERDE (template completo) |
| `admin/FLUJO-GESTION-GAMIFICACION.md` | FL-ADM-08 | 2026-02-18 | Configuracion de logros, misiones, rangos, economia (v1.1.0) | Parcial |
| `admin/FLUJO-DASHBOARD-ADMIN.md` | FL-ADM-09 | 2026-02-18 | Dashboard principal admin, 4 secciones (v1.1.0) | Parcial |
| `admin/FLUJO-INSTITUCIONES-ROLES.md` | FL-ADM-10 | 2026-02-18 | Gestion de instituciones/tenants y roles (v1.1.0) | Parcial |
| `admin/FLUJO-REPORTES-ANALYTICS-ADMIN.md` | FL-ADM-11 | 2026-02-19 | Reportes y analytics del administrador (v1.1.0) | Parcial |

**Total flujos Admin documentados: 11 de 11 paginas funcionales cubiertas**
> Nota: 8 paginas adicionales (AdminNotificationsPage, AdminNotificationPreferencesPage, AdminProgressPage, AdminAssignmentsPage, AdminClassroomTeacherPage, AdminSettingsPage, AdminAdvancedPage, AdminAlertsPage) carecen de flujo dedicado. Algunos se cubren parcialmente por flujos existentes.

#### Teacher Flows

| Archivo | ID Flujo | Ultima Mod | Descripcion | Estado de Plantilla |
|---------|---------|------------|-------------|---------------------|
| `teacher/FLUJO-REVISION-MANUAL-M3-M5.md` | FL-TCH-01 | 2026-02-21 | Cola pendiente → rubrica → completado → recompensas (v1.0.1) | Parcial (sin secciones 2,3,4 formales) |
| `teacher/FLUJO-ASIGNACIONES-CLASE.md` | FL-TCH-02 | 2026-02-17 | Crear y publicar asignaciones de clase | VERDE (template completo) |
| `teacher/FLUJO-MONITOREO-ALERTAS.md` | FL-TCH-03 | 2026-02-19 | Monitoreo en tiempo real y gestion de alertas docentes (v1.1.0) | VERDE (template completo) |
| `teacher/FLUJO-ANALYTICS-REPORTES.md` | FL-TCH-04 | 2026-02-21 | Analytics y reportes docentes, scheduled+shared (v1.1.0) | VERDE (template completo) |
| `teacher/FLUJO-GESTION-CONTENIDO.md` | FL-TCH-05 | 2026-02-21 | Gestion de contenido docente | VERDE (template completo) |
| `teacher/FLUJO-LOGIN-DOCENTE.md` | FL-TCH-06 | 2026-02-17 | Login con redireccion por rol | VERDE (template completo) |
| `teacher/FLUJO-DASHBOARD-DOCENTE.md` | FL-TCH-08 | 2026-02-18 | Dashboard docente, 4 tabs | Parcial |
| `teacher/FLUJO-GESTION-CLASES.md` | FL-TCH-09 | 2026-02-21 | Gestion de clases y estudiantes | Parcial |

**Total flujos Teacher documentados: 8 (mas FL-TCH-07 compartido con shared/FLUJO-PERFIL-CONFIGURACION.md)**
> Paginas sin flujo dedicado: TeacherCommunicationPage, TeacherGamificationPage, TeacherExerciseResponsesPage, TeacherNotificationsPage, TeacherNotificationPreferencesPage, TeacherAlertConfigPage — 6 paginas.

#### Student Flows

| Archivo | ID Flujo | Ultima Mod | Descripcion | Estado de Plantilla |
|---------|---------|------------|-------------|---------------------|
| `student/FLUJO-EJERCICIO-COMPLETO.md` | FL-STU-01 | 2026-02-18 | Resolucion ejercicio M1-M2 autocalificable | Parcial |
| `student/FLUJO-EJERCICIO-M3-M5.md` | FL-STU-02 | 2026-02-21 | Ejercicio con revision manual (estado pendiente) (v1.1.0) | Parcial |
| `student/FLUJO-TIENDA-COMPRA.md` | FL-STU-03 | 2026-02-17 | Compra en tienda con validacion de logro | Parcial |
| `student/FLUJO-LOGROS-MISIONES-CLAIM.md` | FL-STU-04 | 2026-02-19 | Claim de logros y misiones | Parcial |
| `student/FLUJO-PERFIL-AJUSTES-ESTUDIANTE.md` | FL-STU-05 (Compuesto) | 2026-02-21 | Perfil y ajustes: perfil, cuenta, notificaciones, privacidad (v1.2.0) | Completo |
| `student/FLUJO-DASHBOARD-ACADEMICO.md` | FL-STU-06 (Compuesto) | 2026-02-21 | Dashboard academico orquestador (sub-flujos: FL-STU-13,01,04,15) | Completo |
| `student/FLUJO-TIENDA-OVERVIEW.md` | FL-STU-07 | 2026-02-17 | Overview y catalogo de tienda | Parcial |
| `student/FLUJO-INVENTARIO-ITEMS.md` | FL-STU-08 | 2026-02-21 | Inventario de items y uso de power-ups | Completo |
| `student/FLUJO-AMIGOS.md` | FL-STU-09 | 2026-02-17 | Sistema de amigos, solicitudes, feed social | Parcial |
| `student/FLUJO-GREMIOS.md` | FL-STU-10 | 2026-02-21 | Crear y gestionar gremios/equipos | Parcial |
| `student/FLUJO-SETTINGS-DISPOSITIVOS.md` | FL-STU-11 | 2026-02-17 | Gestion de dispositivos para notificaciones | Parcial |
| `student/FLUJO-SETTINGS-NOTIFICACIONES.md` | FL-STU-12 | 2026-02-17 | Preferencias de notificaciones | Parcial |
| `student/FLUJO-DASHBOARD-PROGRESO.md` | FL-STU-13 | 2026-02-21 | Dashboard y overview de progreso academico | VERDE (template completo) |
| `student/FLUJO-LEADERBOARDS.md` | FL-STU-14 | 2026-02-19 | Leaderboards y rankings por aula/global | VERDE (template completo) |
| `student/FLUJO-PAGINA-APRENDIZAJE.md` | FL-STU-15 | 2026-02-21 | Pagina de aprendizaje: modulos y ejercicios | VERDE (template completo) |
| `student/FLUJO-PROGRESO-ACADEMICO.md` | FL-STU-16 | 2026-02-19 | Progreso academico por modulo y sesion | Parcial |
| `student/FLUJO-ASIGNACIONES-ESTUDIANTE.md` | FL-STU-17 | 2026-02-21 | Asignaciones del estudiante, detalle y envio | Parcial |
| `student/FLUJO-PERFIL-NOTIFICACIONES.md` | FL-STU-18 | 2026-02-18 | Perfil extendido y centro de notificaciones | Parcial |
| `student/FLUJO-EQUIPAMIENTO-ITEMS-COSMETICOS.md` | FL-STU-19 | 2026-02-21 | Equipar/desequipar items cosmeticos (v1.1.0) | Completo |
| `student/FLUJO-COMPRA-INVENTARIO-EQUIPAR.md` | FL-STU-20 (Compuesto) | 2026-02-21 | Flujo compuesto: compra + inventario + equipar | Completo |
| `student/FLUJO-PERSONALIZACION-AVATAR.md` | — | 2026-02-18 | Personalizacion de avatar | Parcial |

**Total flujos Student documentados: 21 documentos de flujo**

#### Parent Flows

| Archivo | ID Flujo | Ultima Mod | Descripcion | Estado de Plantilla |
|---------|---------|------------|-------------|---------------------|
| `parents/FLUJO-LOGIN-PADRES.md` | FL-PRN-04 | 2026-02-17 | Login al portal de padres | Parcial |
| `parents/FLUJO-REGISTRO-PADRES.md` | FL-PRN-05 | 2026-02-17 | Registro de cuenta padre | Parcial |
| `parents/FLUJO-DASHBOARD-PADRES.md` | FL-PRN-06 | 2026-02-17 | Dashboard portal padres, progreso general | Parcial |
| `parents/FLUJO-PROGRESO-HIJO.md` | FL-PRN-07 | 2026-02-17 | Vista de detalle de progreso por hijo | Parcial |
| `parents/FLUJO-VINCULACION-PADRE-ESTUDIANTE.md` | FL-PRN-01 | 2026-02-17 | Alta de vinculacion/codigo de invitacion | VERDE (template completo) |
| `parents/FLUJO-SEGUIMIENTO-PROGRESO.md` | FL-PRN-02 | 2026-02-17 | Seguimiento de progreso con filtros y detalle | VERDE (template completo) |
| `parents/FLUJO-NOTIFICACIONES-PADRES.md` | FL-PRN-03 | 2026-02-17 | Notificaciones escuela-familia, confirmacion | VERDE (template completo) |

**Total flujos Parents documentados: 7 de 4 paginas activas en codigo**
> Nota: Mas paginas que paginas fisicas — los flujos PRN cubren escenarios adicionales al sistema de paginas.

---

### 1.2 docs/50-guides/frontend/

#### Guias de implementacion general

| Archivo | Ultima Mod | Descripcion | Estado |
|---------|------------|-------------|--------|
| `impl/README.md` | 2026-02-11 | Indice de guias de implementacion frontend | Completo |
| `impl/SETUP-DEVELOPMENT.md` | 2026-02-11 | Configuracion del entorno de desarrollo | Completo |
| `impl/ESTRUCTURA-FEATURES.md` | 2026-02-11 | Estructura de carpetas por features | Completo |
| `impl/ESTRUCTURA-SHARED.md` | 2026-02-11 | Estructura del directorio shared/ | Completo |
| `impl/COMPONENTES-INVENTARIO.md` | 2026-02-11 | Inventario de componentes | Parcial (fecha antigua, puede estar desactualizado) |
| `impl/COMPONENTES-UI.md` | 2026-02-11 | Componentes UI disponibles | Parcial |
| `impl/COMPONENT-PATTERNS.md` | 2026-02-19 | Patrones de componentes (exportaciones, props) | Completo |
| `impl/HOOK-PATTERNS.md` | 2026-02-11 | Patrones de hooks React | Parcial |
| `impl/STATE-MANAGEMENT.md` | 2026-02-11 | Estrategia de estado: React Query + Zustand | Parcial |
| `impl/API-ARCHITECTURE.md` | 2026-02-11 | Arquitectura del cliente API | Completo |
| `impl/API-INTEGRATION.md` | 2026-02-11 | Integracion con API backend | Completo |
| `impl/API-SERVICES.md` | 2026-02-21 | Catalogo de 37+ API services (v3.4) | Parcial (37 services documentados vs 67 existentes) |
| `impl/API-TYPES-BEST-PRACTICES.md` | 2026-02-11 | Mejores practicas para tipos de API | Completo |
| `impl/GENERATED-API-TYPES.md` | 2026-02-11 | Tipos generados de la API | Parcial |
| `impl/MIGRATION-EXAMPLE-GENERATED-TYPES.md` | 2026-02-11 | Ejemplo de migracion a tipos generados | Completo |
| `impl/TYPES-CONVENTIONS.md` | 2026-02-11 | Convenciones de tipos TypeScript | Completo |
| `impl/TYPES-CONSOLIDATION-ANALYSIS.md` | 2026-02-11 | Analisis de consolidacion de tipos | Completo |
| `impl/TYPES-CONSOLIDATION-PLAN.md` | 2026-02-11 | Plan de consolidacion de tipos | Completo |
| `impl/TYPES-CONSOLIDATION-VALIDATION.md` | 2026-02-11 | Validacion de consolidacion de tipos | Completo |
| `impl/MECANICAS-EDUCATIVAS.md` | 2026-02-11 | Inventario de 30 mecanicas de ejercicio (v1.0) | Completo |
| `impl/TESTING-GUIDE.md` | 2026-02-11 | Guia de testing frontend | Parcial |
| `GUIA-DETECTIVE-THEME.md` | 2026-02-21 | Sistema de tema Detective (CSS custom props + Tailwind) (v1.1.0) | Completo |
| `GUIA-WCAG-ACCESSIBILITY.md` | 2026-02-21 | Guia de accesibilidad WCAG | Completo |

#### Guias de implementacion por portal — Admin

| Archivo | Ultima Mod | Descripcion | Estado |
|---------|------------|-------------|--------|
| `impl/admin/_MAP.md` | 2026-02-11 | Indice de documentacion admin | Completo |
| `impl/admin/ADMIN-COMPONENTS-CATALOG.md` | 2026-02-11 | Catalogo de componentes admin | Parcial |
| `impl/admin/components/_MAP.md` | 2026-02-11 | Mapa de componentes admin | Completo |
| `impl/admin/components/ALERT-COMPONENTS-ARCHITECTURE.md` | 2026-02-11 | Arquitectura del sistema de alertas admin | Completo |
| `impl/admin/hooks/_MAP.md` | 2026-02-11 | Mapa de hooks admin | Completo |
| `impl/admin/hooks/ADMIN-CLASSROOMS-HOOK.md` | 2026-02-11 | Documentacion hook useAdminClassrooms | Completo |
| `impl/admin/hooks/ADMIN-GAMIFICATION-CONFIG-HOOK.md` | 2026-02-17 | Documentacion hook useGamificationConfig | Completo |
| `impl/admin/pages/_MAP.md` | 2026-01-04 | Mapa de especificaciones de paginas admin | Parcial (solo 3 specs de 19 paginas) |
| `impl/admin/pages/AdminAlertsPage-Specification.md` | 2026-02-11 | Especificacion pagina de alertas | Completo |
| `impl/admin/pages/AdminGamificationPage-Specification.md` | 2026-02-17 | Especificacion pagina de gamificacion | Completo |
| `impl/admin/pages/AdminUsersPage-Specification.md` | 2026-02-11 | Especificacion pagina de usuarios | Completo |
| `impl/especificaciones/_MAP.md` | 2026-02-11 | Mapa de especificaciones adicionales | Completo |
| `impl/especificaciones/AdminReportsPage-UI-Specification.md` | 2026-02-11 | Especificacion UI de reportes admin | Completo |
| `impl/guides/_MAP.md` | 2026-02-11 | Mapa de guias de implementacion | Completo |
| `impl/guides/Frontend-Alert-System-Guide.md` | 2026-02-11 | Guia del sistema de alertas frontend | Completo |

#### Guias de implementacion por portal — Teacher

| Archivo | Ultima Mod | Descripcion | Estado |
|---------|------------|-------------|--------|
| `impl/teacher/_MAP.md` | 2026-02-11 | Mapa de documentacion teacher | Completo |
| `impl/teacher/components/_MAP.md` | 2026-02-11 | Mapa de componentes teacher | Completo |
| `impl/teacher/components/TEACHER-MONITORING-COMPONENTS.md` | 2026-02-11 | Componentes de monitoreo del portal teacher | Completo |
| `impl/teacher/components/TEACHER-RESPONSE-MANAGEMENT.md` | 2026-02-11 | Gestion de respuestas de ejercicios | Completo |
| `impl/teacher/constants/_MAP.md` | 2026-02-11 | Mapa de constantes teacher | Completo |
| `impl/teacher/constants/TEACHER-CONSTANTS-REFERENCE.md` | 2026-02-11 | Referencia de constantes del portal teacher | Completo |
| `impl/teacher/pages/_MAP.md` | 2026-02-11 | Mapa de especificaciones de paginas teacher | Completo |
| `impl/teacher/pages/TEACHER-PAGES-SPECIFICATIONS.md` | 2025-12-18 | Especificaciones de paginas teacher (12 paginas) | Parcial (12 de 19 paginas, fecha antigua) |
| `impl/teacher/types/_MAP.md` | 2026-02-11 | Mapa de tipos teacher | Completo |
| `impl/teacher/types/TEACHER-TYPES-REFERENCE.md` | 2026-02-11 | Referencia de tipos TypeScript teacher | Completo |
| `impl/types/GAMIFICATION-TYPES.md` | 2026-02-11 | Tipos de gamificacion | Completo |

#### Guias de implementacion por portal — Student

| Archivo | Ultima Mod | Descripcion | Estado |
|---------|------------|-------------|--------|
| `impl/student/_MAP.md` | 2026-02-11 | Mapa de documentacion student | Completo |
| `impl/student/README.md` | 2026-02-18 | Inventario del portal student (v1.0, metricas 2026-02-18) | Parcial (metricas infladas: dice 70 paginas en total, referencias a paginas eliminadas) |

---

### 1.3 docs/60-portals/

| Archivo | Ultima Mod | Descripcion | Estado |
|---------|------------|-------------|--------|
| `README.md` | 2026-02-11 | Indice de portales | Completo |
| `_INDEX.md` | 2026-02-11 | Indice global de portales | Completo |
| `admin/PORTAL-ADMIN-GUIDE.md` | 2026-02-18 | Guia de desarrollo portal admin v2.0.0 | Parcial (lista 19 paginas pero spec detallada solo de algunas) |
| `PORTAL-ADMIN-API-REFERENCE.md` | 2026-02-21 | Referencia de API para el portal admin | Completo |
| `student/PORTAL-STUDENT-GUIDE.md` | 2026-02-18 | Guia del portal student (overview general) | Completo |
| `teacher/PORTAL-TEACHER-GUIDE.md` | 2026-02-21 | Guia de desarrollo portal teacher v3.0.0 | Completo |
| `teacher/PORTAL-TEACHER-API-REFERENCE.md` | 2026-02-21 | Referencia de API para el portal teacher | Completo |
| `teacher/PORTAL-TEACHER-FLOWS.md` | 2026-02-21 | Flujos de datos e integracion teacher (v1.0.0) | Completo |
| `parents/PORTAL-PARENTS-GUIDE.md` | 2026-02-21 | Guia del portal de padres v2.0.0 | Completo |

#### Especificaciones del Portal Student (docs/60-portals/student/specs/)

| Archivo | Ultima Mod | Descripcion | Estado |
|---------|------------|-------------|--------|
| `specs/README.md` | 2026-02-11 | Indice de specs del portal student | Completo |
| `specs/_MAP.md` | 2026-02-11 | Mapa de specs | Completo |
| `specs/SPEC-DASHBOARD.md` | 2026-02-11 | Especificacion del dashboard | Completo |
| `specs/SPEC-EXERCISES.md` | 2026-02-11 | Especificacion de ejercicios | Completo |
| `specs/SPEC-MODULES.md` | 2026-02-11 | Especificacion de modulos | Completo |
| `specs/SPEC-GAMIFICATION.md` | 2026-02-11 | Especificacion de gamificacion | Completo |
| `specs/SPEC-ACHIEVEMENTS.md` | 2026-02-11 | Especificacion de logros | Completo |
| `specs/SPEC-PROGRESS.md` | 2026-02-11 | Especificacion de progreso | Completo |
| `specs/SPEC-PROFILE.md` | 2026-02-11 | Especificacion de perfil | Completo |
| `specs/SPEC-SOCIAL.md` | 2026-02-11 | Especificacion de funciones sociales | Completo |
| `specs/SPEC-MULTIMEDIA.md` | 2026-02-11 | Especificacion multimedia | Completo |
| `specs/SPEC-PDF-EXCEL.md` | 2026-02-11 | Especificacion exportacion PDF/Excel | Completo |
| `specs/SPEC-API-CONTRACTS.md` | 2026-02-11 | Contratos de API del portal student | Completo |
| `specs/ASSIGNMENTS-SPEC.md` | 2026-02-11 | Especificacion de asignaciones | Completo |
| `specs/AUTH-PAGES-SPEC.md` | 2026-02-11 | Especificacion de paginas de autenticacion | Completo |
| `specs/STUDENT-HOOKS-SPEC.md` | 2026-02-11 | Especificacion de hooks del portal student | Completo |
| `specs/dependencies/DEPENDENCY-MATRIX.md` | 2026-02-11 | Matriz de dependencias del portal | Completo |
| `specs/inventory/IMPLEMENTATIONS-2025-11-24.md` | 2026-02-11 | Inventario de implementaciones de noviembre 2025 | Historico |
| `specs/analysis/_MAP.md` | 2026-02-11 | Mapa de analisis | Completo |
| `specs/traces/TRACE-DASHBOARD-ERRORS-FIX-2026-01-04.md` | 2026-02-11 | Traza de correccion de errores dashboard | Historico |
| `specs/traces/TRACE-EXERCISE-BUTTONS-FIX-2025-11-29.md` | 2026-02-11 | Traza de correccion de botones de ejercicio | Historico |
| `specs/traces/TRACE-P0-CORRECTIONS.md` | 2026-02-11 | Traza de correcciones P0 | Historico |

#### Gaps documentados del Portal Student (docs/60-portals/student/specs/gaps/)

| Archivo | Estado del Gap | Descripcion |
|---------|---------------|-------------|
| `gaps/STUDENT-GAP-001-missions-rewards.md` | RESUELTO (2025-11-24) | Recompensas de misiones no se otorgaban — integracion MLCoins+XP+Ranks |
| `gaps/STUDENT-GAP-002-missions-update-progress.md` | RESUELTO (2025-11-29) | Progreso de misiones no se actualizaba — tipos de objetivo desalineados con triggers |
| `gaps/STUDENT-GAP-006-profile-stats.md` | RESUELTO (2025-11-24) | Estadisticas de perfil hardcodeadas — implementacion de hook useUserStatistics |
| `gaps/STUDENT-GAP-007-settings-persistence.md` | RESUELTO (2025-11-24) | Configuraciones de settings eran mock — persistencia real en backend |
| `gaps/STUDENT-GAP-008-backend-statistics.md` | RESUELTO (2025-11-24) | getUserStatistics() retornaba datos mock — queries reales a BD |

> Nota critica: Los gaps G-003, G-004, G-005 no tienen documentos de especificacion en el directorio `gaps/`. No se puede determinar su estado ni existencia desde la documentacion.

---

### 1.4 docs/40-standards/ (relevantes para frontend)

| Archivo | Ultima Mod | Descripcion | Estado |
|---------|------------|-------------|--------|
| `ESTANDAR-FRONTEND-PROFESIONAL.md` | 2026-02-21 | Estandar frontend v1.0.0: compound components, patrones, performance, a11y | Completo |
| `ESTANDAR-CODIGO.md` | 2026-02-11 | Estandar de codigo general (naming, formato) | Completo |
| `ESTANDAR-DOCUMENTACION.md` | 2026-02-11 | Estandar de documentacion de artefactos | Completo |
| `ESTANDAR-NOMENCLATURA.md` | 2026-02-11 | Estandar de nomenclatura general | Completo |
| `ESTANDAR-NOMENCLATURA-API.md` | 2026-02-11 | Nomenclatura especifica de API | Completo |
| `ESTANDAR-API.md` | 2026-02-11 | Estandar de contratos de API | Completo |
| `ESTANDAR-TESTING.md` | 2026-02-11 | Estandar de testing (aplica a FE y BE) | Completo |
| `ESTANDAR-SEGURIDAD.md` | 2026-02-11 | Estandar de seguridad (frontend incluido) | Completo |
| `ESTANDAR-PERFORMANCE.md` | 2026-02-11 | Estandar de performance (aplica a FE) | Completo |
| `ESTANDAR-OBSERVABILIDAD.md` | 2026-02-11 | Estandar de observabilidad | Relevancia FE limitada |
| `ESTANDAR-METADATA-ITEMS.md` | 2026-02-11 | Metadata de items de gamificacion | Relevante para FE store/tienda |
| `ESTANDAR-GIT.md` | 2026-02-11 | Estandar de git (commits, branching) | Completo |
| `STANDARD-COMPONENT.md` | 2026-02-19 | Estandar de componentes React: exports, props, patterns (v1.0.0) | Completo |
| `STANDARD-IMPORTS.md` | 2026-02-19 | Estandar de imports y barrel exports | Completo |
| `STANDARD-TYPES.md` | 2026-02-19 | Estandar de tipos TypeScript | Completo |
| `STANDARD-API.md` | 2026-02-19 | Estandar de servicios API y React Query hooks | Completo |
| `STANDARD-UX-PATTERNS.md` | 2026-02-19 | Estandar de patrones UX: errors, loading, forms | Completo |

> Los 5 archivos STANDARD-*.md (Component, Imports, Types, API, UX-Patterns) fueron creados en 2026-02-19 como resultado de auditoria de codigo real (602+ archivos analizados). Constituyen los estandares de facto mas actualizados para el frontend.

---

### 1.5 docs/90-adr/ (relevantes para frontend)

| ADR | Fecha | Titulo | Relevancia Frontend |
|-----|-------|--------|---------------------|
| ADR-001 | 2025-09-01 | Gamificacion Maya (XP, rangos, moneda) | Alta — define reglas de negocio del frontend |
| ADR-002 | 2025-09-01 | Socket.IO para tiempo real | Alta — WebSocket en MonitoringPage, chat |
| ADR-004 | 2025-09-01 | Exercise Engine modular (23 tipos) | Alta — arquitectura registry pattern |
| ADR-008 | 2025-10-01 | Sistema dual exercise mechanics | Alta — auto-grade vs manual review |
| ADR-009 | 2025-10-15 | Duracion podcast ejercicio M3-M4 | Media — impacta componente PodcastArgumentativo |
| ADR-011 | 2025-11-01 | Frontend API client structure | Alta — estructura de servicios API |
| ADR-013 | 2025-11-23 | Adopcion React Query v5 | Alta — patron de data fetching |
| ADR-014 | 2025-11-23 | Nil safety patterns | Alta — manejo de null/undefined |
| ADR-015 | 2025-11-23 | Centralized API routes configuration | Alta — ROUTES constants |
| ADR-016 | 2025-11-01 | XP acumulacion simplificada | Alta — logica de progresion en FE |
| ADR-017 | 2025-11-15 | Admin portal avanzado vs alcance inicial | Alta — define alcance del portal admin |
| ADR-019 | 2025-12-01 | Runtime validation con Zod | Media — validacion de datos API |
| ADR-020 | 2025-12-15 | Validacion alternativas ejercicio CompletarEspacios | Media — logica especifica de mecanica |
| ADR-021 | 2025-12-15 | Estandarizacion recompensas XP ejercicios | Alta — unifica sistema de recompensas |
| ADR-028 | 2026-01-15 | Roles system hybrid design | Alta — RBAC en frontend |
| ADR-030 | 2026-01-20 | Convencion nombres de paginas | Alta — nomenclatura de componentes |
| ADR-031 | 2026-01-20 | Portal Parent | Alta — decision de arquitectura del portal |
| ADR-038 | 2026-02-11 | Estructura canonica apps/ | Alta — convencion de estructura de portales |
| ADR-042 | 2026-02-11 | Team vs Guild naming | Media — nomenclatura en UI social |
| ADR-044 | 2026-02-11 | Test coverage strategy (50% threshold) | Alta — aplica a tests frontend |
| ADR-045 | 2026-02-11 | Clean architecture pragmatica | Alta — guia de arquitectura |
| ADR-046 | 2026-02-19 | PageShell pattern | Alta — reemplaza HOC wrapping |
| ADR-047 | 2026-02-19 | State architecture Zustand + React Query | Alta — patron canonico de estado |
| ADR-048 | 2026-02-19 | Component sharing strategy | Alta — cuando compartir vs duplicar |
| ADR-049 | 2026-02-19 | Confirm dialog consolidation | Alta — patron de dialogo de confirmacion |

**Total ADRs relevantes para frontend: 25 de 46 totales (sin contar ADRs puramente de BD, backend, CI/CD o gobernanza SIMCO)**

---

## 2. Completitud por Portal

### Conteo de paginas reales por portal

| Portal | Paginas en codigo | Flujos documentados | Specs de pagina | Cobertura estimada |
|--------|-------------------|---------------------|------------------|--------------------|
| Admin | 19 | 11 flujos (FL-ADM-01..11) | 4 specs detalladas | 58% — 8 paginas sin flujo propio |
| Teacher | 19 | 9 flujos (FL-TCH-01..09) | 12 specs en TEACHER-PAGES-SPECIFICATIONS.md (parcial) | 47% — 10 paginas sin flujo dedicado |
| Student | 22 activas + sub-views | 21 documentos de flujo | 12 specs en /student/specs/ | 95% — cobertura alta |
| Parent | 4 | 7 flujos (FL-PRN-01..07) | cubierta por PORTAL-PARENTS-GUIDE.md | 100% — mas flujos que paginas |

> Nota de conteo: El total de 19 paginas admin y 19 paginas teacher incluye paginas de notificaciones, configuracion y funcionalidades que no tienen flujos propios. El portal student tiene 22 paginas de nivel raiz activas en codigo (excluyendo sub-vistas en `pages/settings/` que son secciones de SettingsPage).

### Tabla de completitud detallada

| Portal | Paginas reales | Flujos existentes | Flujos necesarios | Cobertura % |
|--------|---------------|-------------------|-------------------|-------------|
| Admin | 19 | 11 | 19 | 58% |
| Teacher | 19 | 9 | 19 | 47% |
| Student | 22 | 21 | 22 | 95% |
| Parent | 4 | 7 | 4 | 100% (exceso de cobertura) |
| Auth/Shared | 6+ | 6 | 6 | 100% |

---

## 3. Brechas Identificadas

### 3.1 Paginas sin Documentacion de Flujo

#### Portal Admin — 8 paginas sin flujo dedicado

| Pagina | Archivo | Gap | Cobertura parcial |
|--------|---------|-----|-------------------|
| AdminNotificationsPage | `admin/pages/AdminNotificationsPage.tsx` | Sin flujo propio | Ninguna |
| AdminNotificationPreferencesPage | `admin/pages/AdminNotificationPreferencesPage.tsx` | Sin flujo propio | Ninguna |
| AdminProgressPage | `admin/pages/AdminProgressPage.tsx` | Sin flujo propio | Referenciado en FL-ADM-11 de forma parcial |
| AdminAssignmentsPage | `admin/pages/AdminAssignmentsPage.tsx` | Sin flujo propio | Ninguna |
| AdminClassroomTeacherPage | `admin/pages/AdminClassroomTeacherPage.tsx` | Sin flujo propio | Ninguna |
| AdminSettingsPage | `admin/pages/AdminSettingsPage.tsx` | Sin flujo propio | Parcialmente en FL-ADM-02 |
| AdminAdvancedPage | `admin/pages/AdminAdvancedPage.tsx` | Sin flujo propio | Cubierto por FL-ADM-02 (configuracion sistema) |
| AdminAlertsPage | `admin/pages/AdminAlertsPage.tsx` | Sin flujo propio — solo spec tecnica en `/impl/admin/pages/` | Tiene especificacion tecnica pero sin flujo UX |

> Adicionalmente: `AdminExerciseCreatePage.tsx` tiene flujo completo FL-ADM-07 pero carece de spec de pagina detallada.

#### Portal Teacher — 10 paginas sin flujo dedicado

| Pagina | Archivo | Gap |
|--------|---------|-----|
| TeacherCommunicationPage | `teacher/pages/TeacherCommunicationPage.tsx` | Sin flujo ni spec |
| TeacherGamificationPage | `teacher/pages/TeacherGamificationPage.tsx` | Sin flujo ni spec |
| TeacherExerciseResponsesPage | `teacher/pages/TeacherExerciseResponsesPage.tsx` | Sin flujo ni spec |
| TeacherNotificationsPage | `teacher/pages/TeacherNotificationsPage.tsx` | Sin flujo ni spec |
| TeacherNotificationPreferencesPage | `teacher/pages/TeacherNotificationPreferencesPage.tsx` | Sin flujo ni spec |
| TeacherAlertConfigPage | `teacher/pages/TeacherAlertConfigPage.tsx` | Sin flujo ni spec |
| TeacherContentPage | `teacher/pages/TeacherContentPage.tsx` | Marcada "Under Construction" en TEACHER-PAGES-SPECIFICATIONS.md |
| TeacherStudentsPage | `teacher/pages/TeacherStudentsPage.tsx` | Cubierta parcialmente por FL-TCH-09 (Gestion de Clases) |
| TeacherReviewPanelPage | `teacher/pages/TeacherReviewPanelPage.tsx` | Cubierta por FL-TCH-01 pero sin spec de pagina |
| TeacherProgressPage | `teacher/pages/TeacherProgressPage.tsx` | Sin flujo propio — mencionada en TEACHER-PAGES-SPECIFICATIONS.md |

#### Portal Student — 1 pagina sin flujo documentado

| Pagina | Archivo | Gap |
|--------|---------|-----|
| MissionsPage | `student/pages/MissionsPage.tsx` | FL-STU-04 cubre logros+misiones de forma conjunta — no hay flujo dedicado a la pagina de misiones como navegacion completa |

### 3.2 Documentacion Desactualizada

| Documento | Fecha | Desactualizacion detectada |
|-----------|-------|---------------------------|
| `impl/student/README.md` | 2026-02-18 | Reporta "70 paginas" total del sistema, inflacion vs 22 paginas student reales. Lista `GamificationPage.tsx`, `GamificationTestPage.tsx`, `NewLeaderboardPage.tsx` que pueden ser legacy. Lista `ProfilePage.tsx` que fue reemplazado por `EnhancedProfilePage.tsx`. |
| `impl/API-SERVICES.md` | 2026-02-21 | Documenta 37 services pero existen 67 archivos API segun FRONTEND_INVENTORY.yml — brecha de 30 services no documentados |
| `impl/teacher/pages/TEACHER-PAGES-SPECIFICATIONS.md` | 2025-12-18 | Fecha de 2025-12-18, desactualizada. Menciona `TeacherContentPage` como "Under Construction" y `TeacherResourcesPage` como "Placeholder". Cubre 12 paginas de las 19 actuales. No incluye: TeacherCommunicationPage, TeacherGamificationPage, TeacherAlertConfigPage, TeacherNotificationsPage, TeacherNotificationPreferencesPage, TeacherContentManagementPage, TeacherExerciseResponsesPage. |
| `impl/STATE-MANAGEMENT.md` | 2026-02-11 | Fecha antigua. Menciona 5 stores Zustand en ejemplos vs 13 stores actuales. No refleja eliminacion de missionsStore (REC-003). |
| `impl/COMPONENTES-INVENTARIO.md` | 2026-02-11 | Fecha antigua. Puede no reflejar los 590 componentes actuales (auditados 2026-02-21). |
| `impl/HOOK-PATTERNS.md` | 2026-02-11 | No refleja los 127 hooks actuales ni el patron canonico de useEquipment sobre useInventory (deprecado). |
| Flujos con "amarillo" en auditoria (25 flujos) | Varios | Segun AUDITORIA-FASE1-CALIDAD-FLUJOS-2026-02-17.md, 25 flujos tienen Mermaid pero no cumplen la estructura completa del template de 9 secciones. Requieren normalizacion de formato. |

### 3.3 Documentacion Incompleta (Stubs o Parciales)

| Documento | Estado | Faltante |
|-----------|--------|---------|
| `impl/admin/pages/_MAP.md` | Parcial — solo 3 specs de 19 paginas | 16 especificaciones de paginas admin faltan |
| `impl/admin/ADMIN-COMPONENTS-CATALOG.md` | Parcial | Catalogo incompleto de componentes admin |
| `impl/guides/Frontend-Alert-System-Guide.md` | Completo tecnicamente | No actualizado tras Teacher Portal Audit (2026-02-20) que elimino 10 componentes huerfanos |
| `impl/TESTING-GUIDE.md` | Parcial | No cubre patrones de test para mecanicas de ejercicio ni hooks con React Query |
| `docs/60-portals/student/specs/gaps/_MAP.md` | Parcial | Lista G-001, G-002, G-006, G-007, G-008 pero G-003, G-004, G-005 ausentes |
| `PORTAL-ADMIN-GUIDE.md` | Parcial | Lista 19 paginas en vision general pero solo provee especificacion detallada de arquitectura, no flujos de usuario por pagina |
| Todos los flujos "amarillo" de admin | Parcial | Tienen Mermaid y contenido pero sin las 9 secciones del template: precondiciones formales, casos de error, revision/actualizacion |

### 3.4 Brechas de Documentacion de API Services

La brecha mas significativa en documentacion de integracion:

- **Documentados:** 37 services en `impl/API-SERVICES.md`
- **Existentes:** 67 archivos API service (segun FRONTEND_INVENTORY.yml)
- **Sin documentar:** ~30 services API — particularmente en `shared/api/` y servicios de features recientes

---

## 4. Known Gaps Status (G-001 a G-008)

| Gap ID | Titulo | Estado | Documento |
|--------|--------|--------|-----------|
| G-001 | Misiones - Recompensas No se Otorgan | RESUELTO (2025-11-24) | `gaps/STUDENT-GAP-001-missions-rewards.md` — 6/6 CAs cumplidos |
| G-002 | Misiones - Progreso No Se Actualiza Correctamente | RESUELTO (2025-11-29) | `gaps/STUDENT-GAP-002-missions-update-progress.md` — Tipos de objetivo alineados con triggers BD |
| G-003 | Desconocido | SIN DOCUMENTO | No existe `STUDENT-GAP-003-*.md` en el directorio gaps/ |
| G-004 | Desconocido | SIN DOCUMENTO | No existe `STUDENT-GAP-004-*.md` en el directorio gaps/ |
| G-005 | Desconocido | SIN DOCUMENTO | No existe `STUDENT-GAP-005-*.md` en el directorio gaps/ |
| G-006 | Perfil - Estadisticas Hardcodeadas | RESUELTO (2025-11-24) | `gaps/STUDENT-GAP-006-profile-stats.md` — hook useUserStatistics implementado |
| G-007 | Settings - Guardar Configuraciones es Mock | RESUELTO (2025-11-24) | `gaps/STUDENT-GAP-007-settings-persistence.md` — persistencia real en backend |
| G-008 | Backend - getUserStatistics() Returns Mock Data | RESUELTO (2025-11-24) | `gaps/STUDENT-GAP-008-backend-statistics.md` — queries reales a BD implementados |

> Los gaps G-003, G-004 y G-005 representan una brecha de documentacion: si existieron y fueron resueltos, no hay trazabilidad de ello. Si no existieron, la numeracion salto de G-002 a G-006 sin explicacion registrada.

---

## 5. Matriz de Cobertura

| Categoria | Existentes | Necesarios | Gap | Prioridad |
|-----------|-----------|-----------|-----|-----------|
| Flujos Admin (por pagina real) | 11 | 19 | -8 flujos | P1 |
| Flujos Teacher (por pagina real) | 9 | 19 | -10 flujos | P1 |
| Flujos Student (por pagina real) | 21 | 22 | -1 flujo | P2 |
| Flujos Parent (por pagina real) | 7 | 4 | +3 (exceso) | N/A |
| Flujos Auth/Shared | 6 | 6 | 0 | Cubierto |
| Specs de paginas Admin | 4 | 19 | -15 specs | P1 |
| Specs de paginas Teacher | 12 | 19 | -7 specs | P1 |
| Specs de paginas Student | 12 | 22 | -10 specs | P2 |
| Specs de paginas Parent | 1 (guia) | 4 | -3 specs | P2 |
| API Services documentados | 37 | 67 | -30 services | P1 |
| Estandares frontend | 5 STANDARD-* + 1 ESTANDAR-FE | 6 | 0 | Cubierto |
| Guias de implementacion | 23+ archivos | estimado 30 | -7 guias | P2 |
| ADRs frontend relevantes | 25 | 25 activos | 0 pendientes | Cubierto |
| Gaps de portal student | 5 documentados | 8 (G-001..008) | G-003,004,005 sin doc | P2 |
| Flujos con template completo (verde) | 14 | 46 totales | -32 flujos | P1 |
| Flujos parcialmente documentados (amarillo) | 25 | — | Normalizacion pendiente | P1 |

---

## 6. Plan de Documentacion Propuesto

### P0 — Critico (documentos que bloquean trazabilidad o calidad)

1. **Documentar G-003, G-004, G-005 o cerrar formalmente la numeracion:**
   - Archivo: `docs/60-portals/student/specs/gaps/STUDENT-GAPS-003-004-005-STATUS.md`
   - Accion: Confirmar si estos gaps existieron, si fueron resueltos sin documento o si la numeracion es un artefacto. Actualizar `specs/gaps/_MAP.md`.

2. **Actualizar `impl/API-SERVICES.md` para cubrir los 67 services existentes:**
   - Actualmente documenta 37 de 67 — los 30 sin documentar incluyen services recientes de shared/api/ y features nuevas.
   - Accion: Inventariar todos los archivos en `apps/frontend/src/services/api/` y `apps/frontend/src/shared/api/` y agregar entradas.

### P1 — Alta prioridad (afectan desarrollo y onboarding)

3. **Crear especificaciones de paginas Admin faltantes (16 paginas):**
   - AdminNotificationsPage, AdminNotificationPreferencesPage, AdminProgressPage, AdminAssignmentsPage, AdminClassroomTeacherPage, AdminSettingsPage
   - Ubicacion propuesta: `docs/50-guides/frontend/impl/admin/pages/`

4. **Crear flujos UX para paginas Admin sin cobertura (8 flujos):**
   - FL-ADM-12: AdminNotificationsPage + AdminNotificationPreferencesPage
   - FL-ADM-13: AdminProgressPage
   - FL-ADM-14: AdminAssignmentsPage
   - FL-ADM-15: AdminClassroomTeacherPage
   - FL-ADM-16: AdminSettingsPage / AdminAdvancedPage (consolidado)
   - FL-ADM-17: AdminAlertsPage (flujo UX, ya tiene spec tecnica)
   - Ubicacion: `docs/30-ux-ui/flujos/admin/`

5. **Crear flujos UX para paginas Teacher sin cobertura (6 flujos):**
   - FL-TCH-10: TeacherCommunicationPage
   - FL-TCH-11: TeacherGamificationPage
   - FL-TCH-12: TeacherExerciseResponsesPage
   - FL-TCH-13: TeacherNotificationsPage + TeacherNotificationPreferencesPage
   - FL-TCH-14: TeacherAlertConfigPage
   - Ubicacion: `docs/30-ux-ui/flujos/teacher/`

6. **Actualizar `impl/teacher/pages/TEACHER-PAGES-SPECIFICATIONS.md`:**
   - Agregar 7 paginas faltantes: TeacherCommunicationPage, TeacherGamificationPage, TeacherAlertConfigPage, TeacherNotificationsPage, TeacherNotificationPreferencesPage, TeacherContentManagementPage, TeacherExerciseResponsesPage.
   - Actualizar estado de TeacherContentPage y TeacherStudentsPage.

7. **Normalizar 25 flujos amarillos al template de 9 secciones:**
   - Segun AUDITORIA-FASE1-CALIDAD-FLUJOS-2026-02-17.md, 25 flujos tienen contenido pero estructura incompleta.
   - Priorizar portales admin y teacher primero.
   - Accion: Migration batch para agregar secciones: precondiciones, casos de error, criterios de aceptacion, historial de cambios.

8. **Actualizar `impl/STATE-MANAGEMENT.md`:**
   - Reflejar 13 stores actuales (no 5 de ejemplos).
   - Documentar eliminacion de missionsStore (REC-003).
   - Actualizar a patron canonico: useEquipment sobre useInventory deprecado.

### P2 — Media prioridad (mejoran mantenibilidad)

9. **Actualizar `impl/student/README.md`:**
   - Corregir metricas infladas (22 paginas reales, no "70 total").
   - Remover referencias a paginas legacy (GamificationTestPage, NewLeaderboardPage, admin/ huerfanos ya eliminados).
   - Clarificar estado de EnhancedProfilePage vs ProfilePage.

10. **Crear specs de paginas Student para las 10 paginas sin spec:**
    - MissionsPage, LearningPage, LeaderboardPage, FriendsPage, GuildsPage, ShopPage, InventoryPage, ModuleDetailPage, EnhancedProfilePage, NotificationsPage
    - Ubicacion: `docs/60-portals/student/specs/`

11. **Documentar integracion social backend-only:**
    - 40 endpoints sociales del backend sin integracion frontend (team challenges: 9, peer challenges: 16, challenge participants: 15).
    - Requiere flujo de decision o decision explicitamente documentada en ADR.
    - Gap referenciado en GAP-TRZ-006.

12. **Actualizar `impl/HOOK-PATTERNS.md`:**
    - Documentar los 127 hooks actuales con patrones canonicos.
    - Incluir useEquipment, useExerciseSubmission, useManualReviews como ejemplos de referencia.

13. **Crear guia de test para mecanicas de ejercicio:**
    - `docs/50-guides/frontend/impl/TESTING-EXERCISE-MECHANICS.md`
    - Cubrir: como testear los 30 tipos de ejercicio, patrones de mock para ExerciseContext, test de submission.

14. **Crear especificaciones de paginas Parent:**
    - `docs/60-portals/parents/specs/` — 4 specs de pagina: ParentLoginPage, ParentRegisterPage, ParentDashboardPage, ChildProgressPage.

15. **Documentar flujo dedicado para MissionsPage (FL-STU-21):**
    - Separar de FL-STU-04 (que mezcla logros y misiones) para cubrir la navegacion completa de la pagina de misiones.

---

## 7. Notas de Consistencia Detectadas

1. **LTI Page como feature vs page:** FL-ADM-05 referencia `features/admin/lti/AdminLtiPage.tsx` pero esta ruta no aparece en el listado de paginas admin bajo `apps/admin/pages/`. Puede ser una feature no registrada como pagina o eliminada.

2. **COBERTURA-TOTAL-PROCESOS.md declara "100% cobertura" para todos los portales** pero esto refiere a procesos core del sistema, no a cada pagina de la aplicacion. La cobertura de 43 procesos en la matriz no es equivalente a cobertura de 19 paginas admin x 19 paginas teacher.

3. **PORTAL-TEACHER-GUIDE.md menciona 19 paginas** pero la auditoria de codigo identifica 19 archivos — ambos coinciden en numero pero el guia lista algunas paginas con nombres distintos a los archivos reales (ej: "TeacherDashboard" vs `TeacherDashboardPage.tsx`).

4. **Flujo FL-ADM-05 (LTI) y la pagina real:** `apps/admin/pages/` no contiene una pagina LTI dedicada. El flujo referencia `features/admin/lti/AdminLtiPage.tsx`. Esta discrepancia requiere verificacion.

5. **25 flujos en estado "amarillo"** documentados en AUDITORIA-FASE1 (2026-02-17) permanecen sin normalizar al template. Esta deuda documental fue registrada como GAP-TRZ-004 pero no tiene fecha de cierre en el backlog.

---

## Resumen Ejecutivo

| Indicador | Valor |
|-----------|-------|
| Total archivos de documentacion frontend inventariados | 147 archivos |
| Flujos de proceso documentados | 46 flujos FL-* en TRACEABILITY-MATRIX.md |
| Flujos con template completo (verde) | 14 / 46 (30%) |
| Flujos con contenido pero formato parcial (amarillo) | 25 / 46 (54%) |
| Flujos con documento compuesto compartido (naranja) | 3 / 46 (7%) |
| Flujos sin documento propio dedicado | 4 / 46 (9%) |
| Paginas admin sin flujo UX dedicado | 8 / 19 (42%) |
| Paginas teacher sin flujo UX dedicado | 10 / 19 (53%) |
| Paginas student sin flujo UX dedicado | 1 / 22 (5%) |
| API services sin documentar | ~30 / 67 (45%) |
| Known gaps G-003, G-004, G-005 | Sin documento ni estado formal |
| Docs desactualizadas criticas | 3 (API-SERVICES, student/README, teacher/pages SPECS) |
