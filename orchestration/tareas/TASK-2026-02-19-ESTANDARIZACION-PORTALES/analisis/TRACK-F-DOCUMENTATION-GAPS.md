# Track F: Analisis de Documentacion y Flujos

**Fecha:** 2026-02-19
**Archivos analizados:** 87 documentation files
**Portales evaluados:** Teacher (19 pages), Admin (19 pages)
**Version:** 1.0.0

---

## Resumen Ejecutivo

La documentacion de los portales Teacher y Admin es **sustancialmente completa** en cuanto a flujos de usuario (100% de cobertura declarada), pero presenta **gaps en la frescura y consistencia** de los documentos de portal, guias de frontend, y estandares. Los 5 STANDARD-*.md del task actual no estan integrados en la estructura formal de `docs/40-standards/`. La FRONTEND_INVENTORY.yml tiene discrepancias menores en conteos de hooks y componentes. La API Reference cubre solo ~191 de 904 endpoints y NO tiene una seccion dedicada al Admin portal mas alla de un documento separado (ADMIN-PORTAL-ENDPOINTS.md) enfocado en P2 endpoints.

**Hallazgos criticos:**
- 1 flujo teacher (FL-TCH-01) y 1 flujo shared (FL-SHR-01) tienen solo 4 secciones de 9 (calidad sub-estandar)
- ADR faltante para PageShell/withLayout pattern (patron activamente usado en 38+ pages)
- ADR faltante para portal standardization strategy (el task actual lo requiere)
- 5 STANDARD-*.md en task folder no integrados en docs/40-standards/
- Guia de frontend no cubre React Query migration patterns ni PageShell
- PORTAL-TEACHER-GUIDE.md v1.0.0 desactualizada (lista 15 pages, real = 19; hooks = 17, real = 25)
- PORTAL-ADMIN-GUIDE.md v2.0.0 mas actualizada pero aun con gaps post-Sprint 2

---

## 1. Flujos (User Flows)

### Flujos Teacher Existentes

| ID | Nombre | Archivo | Secciones (de 9) | Estado |
|----|--------|---------|-------------------|--------|
| FL-TCH-01 | Revision manual M3-M5 | teacher/FLUJO-REVISION-MANUAL-M3-M5.md | 4/9 | Sub-estandar |
| FL-TCH-02 | Asignaciones clase | teacher/FLUJO-ASIGNACIONES-CLASE.md | 9/9 | Completo |
| FL-TCH-03 | Monitoreo y alertas | teacher/FLUJO-MONITOREO-ALERTAS.md | 9/9 | Completo |
| FL-TCH-04 | Analytics y reportes | teacher/FLUJO-ANALYTICS-REPORTES.md | 9/9 | Completo |
| FL-TCH-05 | Gestion contenido | teacher/FLUJO-GESTION-CONTENIDO.md | 9/9 | Completo |
| FL-TCH-06 | Login docente | teacher/FLUJO-LOGIN-DOCENTE.md | 9/9 | Completo |
| FL-TCH-07 | Config y mensajeria | shared/FLUJO-PERFIL-CONFIGURACION.md | 4/9 | Sub-estandar (compartido) |
| FL-TCH-08 | Dashboard docente | teacher/FLUJO-DASHBOARD-DOCENTE.md | 9/9 | Completo |
| FL-TCH-09 | Gestion clases | teacher/FLUJO-GESTION-CLASES.md | 9/9 | Completo |

**Resumen Teacher:** 9 flujos documentados. 7/9 con 9 secciones completas (78%). 2 flujos sub-estandar (FL-TCH-01 y FL-TCH-07/FL-SHR-01).

### Flujos Admin Existentes

| ID | Nombre | Archivo | Secciones (de 9) | Estado |
|----|--------|---------|-------------------|--------|
| FL-ADM-01 | Gestion usuarios/roles | admin/FLUJO-GESTION-USUARIOS-ROLES.md | 9/9 | Completo (sin numeracion) |
| FL-ADM-02 | Configuracion sistema | admin/FLUJO-CONFIGURACION-SISTEMA.md | 9/9 | Completo (sin numeracion) |
| FL-ADM-03 | Aprobacion contenido | admin/FLUJO-APROBACION-CONTENIDO.md | 9/9 | Completo (sin numeracion) |
| FL-ADM-04 | Monitoreo sistema | admin/FLUJO-MONITOREO-SISTEMA.md | 9/9 | Completo (sin numeracion) |
| FL-ADM-05 | Integraciones LTI | admin/FLUJO-INTEGRACIONES-LTI.md | 9/9 | Completo (sin numeracion) |
| FL-ADM-06 | Audit logs | admin/FLUJO-AUDIT-LOGS.md | 9/9 | Completo (sin numeracion) |
| FL-ADM-07 | Constructor ejercicios | admin/FLUJO-CONSTRUCTOR-EJERCICIOS.md | 9/9 | Completo |
| FL-ADM-08 | Gestion gamificacion | admin/FLUJO-GESTION-GAMIFICACION.md | 9/9 | Completo |
| FL-ADM-09 | Dashboard admin | admin/FLUJO-DASHBOARD-ADMIN.md | 9/9 | Completo |
| FL-ADM-10 | Instituciones y roles | admin/FLUJO-INSTITUCIONES-ROLES.md | 9/9 | Completo |
| FL-ADM-11 | Reportes analytics | admin/FLUJO-REPORTES-ANALYTICS-ADMIN.md | 9/9 | Completo |

**Resumen Admin:** 11 flujos documentados. 11/11 con 9 secciones completas (100%). Nota: FL-ADM-01 a FL-ADM-06 usan secciones sin numeracion (ej. "## Resumen" en lugar de "## 1. Resumen") — funcionalmente equivalente pero inconsistente con template.

### Paginas SIN Flujo Documentado

| Portal | Pagina | Funcionalidad | Flujo Necesario? |
|--------|--------|---------------|-----------------|
| Teacher | TeacherGamification.tsx | Vista gamificacion de aula (bonus, economía) | Si — no hay flujo para teacher otorgando bonus/ML Coins a estudiantes |
| Teacher | TeacherProgress.tsx | Vista progreso general del docente | Parcial — cubierto parcialmente por FL-TCH-08 (dashboard) |
| Teacher | TeacherContent.tsx | Vista de contenido del docente | Parcial — cubierto por FL-TCH-05 (gestion contenido) |
| Teacher | TeacherNotifications.tsx | Bandeja de notificaciones docente | No — funcionalidad generica |
| Teacher | TeacherNotificationPreferences.tsx | Preferencias de notificaciones | No — cubierto por FL-STU-12 (patron compartido) |
| Teacher | TeacherExerciseResponses.tsx | Respuestas de ejercicios | Parcial — relacionado con FL-TCH-01 (revision) |
| Teacher | TeacherAlertConfig.tsx | Configuracion de alertas | Parcial — cubierto por FL-TCH-03 (alertas) |
| Teacher | TeacherMonitoring.tsx | Monitoreo en tiempo real | Parcial — cubierto por FL-TCH-03 |
| Teacher | TeacherStudents.tsx | Gestion de estudiantes | Parcial — cubierto por FL-TCH-09 (clases) |
| Admin | AdminAlertsPage.tsx | Alertas del sistema | No — cubierto por FL-ADM-04 (monitoreo sistema) |
| Admin | AdminProgressPage.tsx | Vista progreso global | Si — no hay flujo para admin viendo progreso global |
| Admin | AdminNotificationsPage.tsx | Notificaciones admin | No — funcionalidad generica |
| Admin | AdminNotificationPreferencesPage.tsx | Preferencias notificaciones | No — patron compartido |
| Admin | AdminAssignmentsPage.tsx | Gestion asignaciones admin | Si — no hay flujo para admin gestionando asignaciones cross-classroom |
| Admin | AdminClassroomTeacherPage.tsx | Asignacion classroom-teacher | Si — no hay flujo dedicado (solo mencionado en ADR-017) |
| Admin | AdminSettingsPage.tsx | Settings sistema | Parcial — cubierto por FL-ADM-02 (config sistema) |
| Admin | AdminRolesPage.tsx | Gestion de roles | Parcial — cubierto por FL-ADM-01 (usuarios/roles) y FL-ADM-10 (instituciones/roles) |

**Pages sin flujo dedicado que lo necesitan: 4** (TeacherGamification, AdminProgress, AdminAssignments, AdminClassroomTeacher)

---

## 2. ADRs Relevantes

| ADR | Titulo | Relevancia para Estandarizacion |
|-----|--------|--------------------------------|
| ADR-011 | Estructura de API Clients en Frontend | Alta — define jerarquia de API services |
| ADR-013 | Adopcion React Query (TanStack Query v5) | Alta — patron de data fetching estandar |
| ADR-014 | Nil-Safety Patterns | Media — patron de seguridad en acceso a datos |
| ADR-015 | Centralizacion de Rutas API | Alta — apiConfig.ts como SSOT |
| ADR-017 | Admin Portal Avanzado vs Alcance Inicial | Alta — documenta gap entre spec y realidad admin |
| ADR-019 | Runtime Validation Zod | Media — validacion en frontend |
| ADR-029 | Consolidacion Teacher Resources | Alta — refactor de pagina teacher |
| ADR-030 | Convencion Nombres Paginas | Alta — sin sufijo "Page" para teacher (aplicada), con sufijo para admin (inconsistencia) |
| ADR-044 | Test Coverage Strategy | Baja — testing no es foco de estandarizacion portales |
| ADR-045 | Clean Architecture Pragmatica | Media — patron backend que afecta frontend API contracts |

### ADRs Faltantes (decisiones no documentadas formalmente)

| Decision Pendiente | Impacto | Prioridad |
|-------------------|---------|-----------|
| **PageShell / withLayout Pattern** | Admin usa `AdminPageShell` + `AdminTabBar` (Sprint 0-2). Teacher usa `withTeacherLayout` HOC + `TeacherPageShell`. NO hay ADR que documente esta decision ni justifique la divergencia de patrones entre portales. | P1 |
| **Portal Standardization Strategy** | La tarea actual (TASK-2026-02-19) esta estandarizando patrones cross-portal pero no hay ADR que documente la decision de estandarizar, los criterios, ni el target state. | P1 |
| **React Query Migration Scope** | ADR-013 adopta React Query pero no documenta: que hooks migrar primero, que stores reemplazar, criterios para decidir store vs query. Hay 13 stores + hooks React Query coexistiendo. | P2 |
| **Shared Component Strategy** | 72 shared components existen pero no hay ADR que defina: cuando compartir vs portal-specific, naming, barrel strategy, testing requirements. | P2 |
| **Type Hierarchy (shared vs portal vs feature)** | El STANDARD-TYPES.md del task define 3 niveles, pero no hay ADR formal en docs/90-adr/ que respalde esta decision. | P2 |
| **Naming Convention Inconsistency (ADR-030)** | ADR-030 dice "sin sufijo Page" pero Admin pages TODAS usan sufijo "Page" (AdminDashboardPage.tsx, AdminUsersPage.tsx, etc.). No hay ADR que documente esta excepcion o intencion de normalizar. | P1 |

---

## 3. Standards Coverage

| Standard | Archivo | Cubre Teacher? | Cubre Admin? | Gaps |
|----------|---------|---------------|-------------|------|
| ESTANDAR-FRONTEND-PROFESIONAL | docs/40-standards/ | Si (generico) | Si (generico) | No menciona PageShell, withLayout, portal-specific patterns |
| ESTANDAR-CODIGO | docs/40-standards/ | Si (generico) | Si (generico) | Generico, no portal-specific |
| ESTANDAR-API | docs/40-standards/ | Si (generico) | Si (generico) | No cubre patron de API services por portal |
| ESTANDAR-NOMENCLATURA | docs/40-standards/ | Parcial | Parcial | No cubre ADR-030 inconsistency (Page suffix) |
| ESTANDAR-TESTING | docs/40-standards/ | Si (generico) | Si (generico) | No define testing por portal |
| STANDARD-COMPONENT | task/STANDARD-COMPONENT.md | Si | Si | **NO integrado** en docs/40-standards/ |
| STANDARD-API | task/STANDARD-API.md | Si | Si | **NO integrado** en docs/40-standards/ |
| STANDARD-TYPES | task/STANDARD-TYPES.md | Si | Si | **NO integrado** en docs/40-standards/ |
| STANDARD-IMPORTS | task/STANDARD-IMPORTS.md | Si | Si | **NO integrado** en docs/40-standards/ |
| STANDARD-UX-PATTERNS | task/STANDARD-UX-PATTERNS.md | Si | Si | **NO integrado** en docs/40-standards/ |

### Gaps Criticos en Standards

1. **5 STANDARD-*.md viven solo en el task folder** — no en la ubicacion canonica `docs/40-standards/`. Si el task se archiva, estos estandares se pierden como referencia activa.
2. **No existe un estandar dedicado para patrones de portal** (PageShell, layout HOC, hook architecture per-portal).
3. **ESTANDAR-FRONTEND-PROFESIONAL.md** es generico (v1.0.0 de 2026-02-02) y no referencia los patrones descubiertos en los audits del task actual (602 archivos analizados).

---

## 4. FRONTEND_INVENTORY.yml Accuracy

| Seccion | Inventory Says | Reality (verified) | Discrepancy? |
|---------|---------------|---------|-------------|
| Teacher pages | 19 | 19 .tsx files | No |
| Teacher hooks | 25 (24 + index barrel) | 26 files (25 hooks + index.ts) | Si — inventory says 24 hooks but actually 25 hook files + useTeacherPageSetup (new, untracked) |
| Teacher components | 57 | ~55 .tsx counted via Glob | Minor — Glob count may miss .ts barrels/index files counted as "components" |
| Admin pages | 19 | 19 .tsx files | No |
| Admin hooks | 31 (25+5+1) | 32 files (31 hooks + index.ts) | Si — useLtiConsumers modified, useAdminPageSetup new — inventory total appears close but breakdown may be stale |
| Admin components | 121 | ~100+ .tsx (Glob truncated at ~97) | Uncertain — need full count; inventory may include index.ts and .example.tsx |
| Total pages | 70 | Matches with 20+19+19+4+8 | No |
| Routes | 73 | Not re-verified (inventory says verified 2026-02-17) | Likely accurate |
| API service files | 53 | Not re-verified | Likely accurate |
| Stores | 13 | Not re-verified | Likely accurate |

### Key Discrepancy: Teacher hooks

FRONTEND_INVENTORY.yml `apps_teacher_hooks: 24` but the actual directory contains 25 unique hook .ts files (excluding index.ts):
- useTeacherPageSetup.ts appears in git status as new/untracked
- This is a +1 discrepancy not yet reflected

### Key Discrepancy: Admin hooks

FRONTEND_INVENTORY.yml `apps_admin_hooks: 25` in por_directorio but total says 31. Actual count is 31 .ts files (excluding index.ts). The breakdown should be updated to 31 base (not 25+5+1 from sprint tracking).

---

## 5. Portal Documentation

### Teacher Portal Docs

| Documento | Ubicacion | Version | Estado | Gaps |
|-----------|-----------|---------|--------|------|
| PORTAL-TEACHER-GUIDE.md | docs/60-portals/teacher/ | v1.0.0 | Desactualizado | Lists 15 pages (real: 19), hooks=17 (real: 25), no mention of withTeacherLayout, TeacherPageShell, settings split |
| PORTAL-TEACHER-API-REFERENCE.md | docs/60-portals/teacher/ | v1.0.0 | Parcialmente vigente | Lists 45+ endpoints in 7 controllers — counts may need update |
| PORTAL-TEACHER-FLOWS.md | docs/60-portals/teacher/ | v1.0.0 | Complementario | Data flow diagrams for key flows (dashboard, reviews, etc.) — still relevant |

**Gaps criticos Teacher Portal Docs:**
- No documenta los 4 pages nuevos desde v1.0.0 (TeacherAlertConfig, TeacherReviewPanel, TeacherNotifications, TeacherNotificationPreferences)
- No documenta el patron withTeacherLayout HOC ni TeacherPageShell
- No documenta los hooks de React Query migration
- Version v1.0.0 (2025-11-29) — 3+ meses sin actualizacion

### Admin Portal Docs

| Documento | Ubicacion | Version | Estado | Gaps |
|-----------|-----------|---------|--------|------|
| PORTAL-ADMIN-GUIDE.md | docs/60-portals/admin/ | v2.0.0 | Mas actualizado | Covers Sprint 0-2 refactor, AdminPageShell, AdminTabBar, 19 pages listed correctly |

**Gaps Admin Portal Docs:**
- Lacks documentation of the 5 task-level STANDARD-*.md patterns
- No dedicated API Reference document (unlike Teacher which has PORTAL-TEACHER-API-REFERENCE.md)
- No Flows document (unlike Teacher which has PORTAL-TEACHER-FLOWS.md)
- Single file (71KB) — could benefit from decomposition

---

## 6. API Documentation

### API Reference Coverage

| Documento | Endpoints Cubiertos | Total Backend | Cobertura |
|-----------|-------------------|---------------|-----------|
| API-REFERENCE.md | ~191 (representative subset) | 904 | ~21% |
| ADMIN-PORTAL-ENDPOINTS.md | ~25 (P2 endpoints only) | ~78 admin endpoints | ~32% |
| PORTAL-TEACHER-API-REFERENCE.md | ~55 (7 controllers) | ~95 teacher API calls | ~58% |
| ENDPOINTS-INVENTORY-EQUIP.md | Inventory/equip specific | N/A | N/A |

### Teacher API Endpoints

Teacher API documentation (PORTAL-TEACHER-API-REFERENCE.md) covers 7 controllers with ~55 endpoints:
- TeacherController (20 endpoints)
- TeacherClassroomsController (12 endpoints)
- InterventionAlertsController (5 endpoints)
- TeacherCommunicationController (6 endpoints)
- TeacherContentController (5 endpoints)
- ExerciseResponsesController (4 endpoints)
- TeacherGradesController (3 endpoints)

**Gaps:** Does not cover teacher notification endpoints or manual review configuration endpoints.

### Admin API Endpoints

Admin API documentation is fragmented:
- ADMIN-PORTAL-ENDPOINTS.md covers only P2 endpoints (reports schedule, monitoring history)
- API-REFERENCE.md covers generic admin endpoints (users, tenants) but NOT admin-specific controllers
- **No dedicated comprehensive Admin API reference exists** comparable to PORTAL-TEACHER-API-REFERENCE.md

**Missing documentation for:**
- admin-dashboard.controller.ts endpoints
- admin-system.controller.ts endpoints
- admin-progress.controller.ts endpoints
- admin-reports.controller.ts endpoints
- admin-organizations.controller.ts endpoints
- admin-roles.controller.ts endpoints

---

## 7. Frontend Guides

| Guia | Ubicacion | Relevancia | Cubre Patrones Actuales? |
|------|-----------|------------|-------------------------|
| GUIA-WCAG-ACCESSIBILITY.md | docs/50-guides/frontend/ | Media | Accessibility only — no portal patterns |
| Frontend-Alert-System-Guide.md | docs/50-guides/frontend/impl/guides/ | Baja | Alert system specific |
| COMPONENT-PATTERNS.md | docs/50-guides/frontend/impl/ | Alta | Component patterns — may be outdated |
| HOOK-PATTERNS.md | docs/50-guides/frontend/impl/ | Alta | Hook patterns — pre React Query migration |
| STATE-MANAGEMENT.md | docs/50-guides/frontend/impl/ | Alta | State management — pre React Query era |
| API-ARCHITECTURE.md | docs/50-guides/frontend/impl/ | Alta | API architecture — partially current |
| API-INTEGRATION.md | docs/50-guides/frontend/impl/ | Alta | API integration — partially current |
| TESTING-GUIDE.md | docs/50-guides/frontend/impl/ | Media | Testing — generico |
| ADMIN-COMPONENTS-CATALOG.md | docs/50-guides/frontend/impl/admin/ | Alta | Admin components — may be pre-Sprint 2 |
| teacher/ subdirectory | docs/50-guides/frontend/impl/teacher/ | Alta | Has subdirs (components, constants, pages, types) but no MAP or master guide |

### Gaps Criticos en Guides

1. **No guide for React Query migration** — ADR-013 exists but no step-by-step implementation guide for developers.
2. **No guide for PageShell pattern** — AdminPageShell and TeacherPageShell are used in 38+ pages but not documented as a guide.
3. **No guide for withLayout HOC vs PageShell** — two different layout patterns coexist without guidance on when to use which.
4. **STATE-MANAGEMENT.md** likely outdated — pre-dates React Query adoption (ADR-013 from 2025-11-23).
5. **HOOK-PATTERNS.md** needs update for React Query hook patterns (useQuery, useMutation, queryKey management).
6. **Teacher implementation guides** directory exists but has no master guide — only subdirectories.

---

## 8. Traceability Matrix Coverage

### TRACEABILITY-MATRIX.md (v1.6.1, 2026-02-19)

| Portal | Flujos in Matrix | Total Flujos | Cobertura |
|--------|-----------------|--------------|-----------|
| Auth/Shared | 6 | 6 | 100% |
| Student | 21 | 21 | 100% |
| Teacher | 9 | 9 | 100% |
| Admin | 11 | 11 | 100% |
| Parents | 7 | 7 | 100% |
| **Total** | **54** | **54** | **100%** |

**Nota:** Every flujo in README.md has a corresponding entry in TRACEABILITY-MATRIX.md. The matrix includes all 4 columns (Definicion, Frontend, Backend, Datos implicados).

### Quality Issues in Traceability Matrix

1. **FL-TCH-07** points to `shared/FLUJO-PERFIL-CONFIGURACION.md` which has only 4/9 sections — matrix should flag sub-standard flujos.
2. **FL-TCH-01** points to a file with only 4/9 sections — not flagged in matrix.
3. **Some frontend paths in matrix reference files that don't exist** (e.g., `apps/student/pages/DeviceManagementSection.tsx` referenced in FL-STU-11 — actual path may differ).
4. **COBERTURA-TOTAL-PROCESOS.md** declares 100% coverage for all portals, but the 4 pages identified in Section 1 (TeacherGamification, AdminProgress, AdminAssignments, AdminClassroomTeacher) lack dedicated flujos.

---

## Hallazgos Criticos (P0)

| ID | Hallazgo | Impacto |
|----|----------|---------|
| DOC-P0-01 | **ADR-030 naming inconsistency**: Teacher pages use NO suffix (TeacherDashboard.tsx per ADR-030), Admin pages ALL use suffix (AdminDashboardPage.tsx). ADR-030 says "sin sufijo" for ALL portals. | Conflicto directo entre ADR y realidad — blocks standardization if not resolved |
| DOC-P0-02 | **5 STANDARD-*.md not in canonical location**: STANDARD-COMPONENT, STANDARD-API, STANDARD-TYPES, STANDARD-IMPORTS, STANDARD-UX-PATTERNS exist only in task folder, not in `docs/40-standards/` | Standards will be lost when task is archived |

## Hallazgos Altos (P1)

| ID | Hallazgo | Impacto |
|----|----------|---------|
| DOC-P1-01 | **No ADR for PageShell/withLayout pattern** | Actively used in 38+ pages across 2 portals, undocumented architectural decision |
| DOC-P1-02 | **No ADR for portal standardization strategy** | Current task makes decisions without formal ADR backing |
| DOC-P1-03 | **FL-TCH-01 (Revision Manual) has only 4/9 sections** | Sub-standard quality for a core teacher workflow |
| DOC-P1-04 | **FL-SHR-01 (Perfil Configuracion) has only 4/9 sections** | Shared by FL-TCH-07, affects teacher portal traceability |
| DOC-P1-05 | **PORTAL-TEACHER-GUIDE.md v1.0.0 outdated** (2025-11-29) | Lists 15 pages (real: 19), 17 hooks (real: 25), missing withTeacherLayout and PageShell |
| DOC-P1-06 | **No Admin API Reference document** | Teacher has PORTAL-TEACHER-API-REFERENCE.md; Admin has nothing comparable |
| DOC-P1-07 | **No Admin Flows document** | Teacher has PORTAL-TEACHER-FLOWS.md; Admin has nothing comparable |
| DOC-P1-08 | **4 pages without dedicated flujos** need evaluation | TeacherGamification, AdminProgress, AdminAssignments, AdminClassroomTeacher |

## Hallazgos Medios (P2)

| ID | Hallazgo | Impacto |
|----|----------|---------|
| DOC-P2-01 | **No React Query migration guide** | ADR-013 exists but no developer guide for migration patterns |
| DOC-P2-02 | **STATE-MANAGEMENT.md likely outdated** | Pre-dates React Query adoption |
| DOC-P2-03 | **HOOK-PATTERNS.md needs update** for React Query hooks | Current patterns differ from guide |
| DOC-P2-04 | **FRONTEND_INVENTORY.yml teacher hooks off by +1** | useTeacherPageSetup untracked |
| DOC-P2-05 | **Admin flujos FL-ADM-01 to FL-ADM-06 use unnumbered sections** | Inconsistent with template (## Resumen vs ## 1. Resumen) |
| DOC-P2-06 | **API-REFERENCE.md covers only ~21% of endpoints** | 191 of 904 documented |
| DOC-P2-07 | **No shared component strategy ADR** | 72 shared components without formal governance |
| DOC-P2-08 | **Teacher impl guides directory has no master guide** | Subdirs exist but no README or MAP |

---

## Acciones Correctivas Recomendadas

### P0 — Inmediatas (bloquean estandarizacion)

1. **Resolver ADR-030 inconsistency**: Crear ADR-046 o enmendar ADR-030 para documentar la excepcion del Admin portal (sufijo "Page") O planificar renombre masivo de Admin pages para alinear con ADR-030.
2. **Mover 5 STANDARD-*.md a docs/40-standards/**: Crear copias canonicas o symlinks en `docs/40-standards/` con el prefijo `ESTANDAR-PORTAL-*.md`, y actualizar `_INDEX.md`.

### P1 — Antes de cerrar el task

3. **Crear ADR-046-pageshell-withlayout-pattern.md**: Documentar la decision de PageShell + TabBar como patron estandar, la coexistencia con withLayout HOC, y el plan de convergencia.
4. **Crear ADR-047-portal-standardization-strategy.md**: Documentar criterios, patrones target, y alcance de la estandarizacion cross-portal.
5. **Elevar FL-TCH-01 a 9/9 secciones**: Agregar secciones faltantes (Precondiciones, Componentes, Reglas, Trazabilidad cruzada, Referencias).
6. **Elevar FL-SHR-01 a 9/9 secciones**: Agregar secciones faltantes.
7. **Actualizar PORTAL-TEACHER-GUIDE.md a v2.0.0**: Reflejar 19 pages, 25 hooks, withTeacherLayout, TeacherPageShell, settings split.
8. **Crear PORTAL-ADMIN-API-REFERENCE.md**: Documentar endpoints de los ~8 admin controllers.
9. **Crear PORTAL-ADMIN-FLOWS.md**: Documentar flujos de datos clave del admin portal.
10. **Evaluar 4 pages sin flujo**: Decidir si necesitan flujo propio o si la cobertura parcial es suficiente.

### P2 — Backlog

11. **Crear guia React Query Migration**: En `docs/50-guides/frontend/impl/guides/`.
12. **Actualizar STATE-MANAGEMENT.md** y **HOOK-PATTERNS.md** para React Query era.
13. **Actualizar FRONTEND_INVENTORY.yml** con conteos correctos post-estandarizacion.
14. **Normalizar numeracion de secciones** en FL-ADM-01 a FL-ADM-06.
15. **Expandir API-REFERENCE.md** para cubrir mas endpoints (objetivo: 50%+ del total).
16. **Crear teacher implementation master guide** en `docs/50-guides/frontend/impl/teacher/`.

---

*Analisis generado por Track F del TASK-2026-02-19-ESTANDARIZACION-PORTALES*
*SIMCO v4.0.0 | NEXUS v4.1*
