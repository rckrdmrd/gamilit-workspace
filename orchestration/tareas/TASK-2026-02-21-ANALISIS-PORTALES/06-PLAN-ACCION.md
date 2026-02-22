# 06 - Plan de Accion Priorizado

**Version:** 1.0.0
**Fecha:** 2026-02-21
**Tarea:** TASK-2026-02-21-ANALISIS-PORTALES
**Fuente:** Consolidacion de WS01-WS10

---

## 1. Resumen de Acciones

| Categoria | Acciones P0 | Acciones P1 | Acciones P2 | Total |
|-----------|-------------|-------------|-------------|-------|
| Bugs/Fixes de codigo | 8 | 15 | 20 | 43 |
| Homologacion cross-portal | 2 | 4 | 4 | 10 |
| Eliminacion de dead code | 0 | 3 | 5 | 8 |
| Documentacion | 2 | 8 | 8 | 18 |
| **Total** | **12** | **30** | **37** | **79** |

---

## 2. Sprint 1: P0 Criticos (Semana 1-2)

**Objetivo:** Resolver todos los issues P0 y P1 criticos que bloquean funcionalidad.

### 2.1 Fixes de Codigo (8 P0)

| # | Issue | Esfuerzo | Responsable | Descripcion |
|---|-------|----------|-------------|-------------|
| 1 | P0-004: Ruta edicion ejercicios | 2d | Frontend | Implementar carga de datos en `/admin/exercises/:id/edit` via useParams + GET |
| 2 | P0-005: useRolePermissions anti-patron | 0.5d | Frontend | Cambiar `enabled` a `!!selectedRoleId`, queryKey a `['role-permissions', roleId]` |
| 3 | P0-006: Links muertos ParentDashboard | 0.5d | Frontend | Eliminar 4 links a paginas inexistentes o implementar paginas |
| 4 | P0-007: Forgot-password Parent | 1d | Frontend + Backend | Implementar `/parent/forgot-password` o reutilizar ruta compartida |
| 5 | P0-008: TeacherReportsPage sin datos | 1d | Backend + Frontend | Verificar seeds + Puppeteer; agregar empty state informativo |
| 6 | P0-003: WCAG Notification Preferences | 1d | Frontend | Agregar labels, keyboard nav, contraste WCAG AA |
| 7 | P0-001: Feature Flags mock | 1d decision + 2d impl | Frontend + Backend | Decidir: implementar API real o documentar como placeholder |
| 8 | P0-002: A/B Testing hardcoded | 1d decision | Product + Dev | Decidir: implementar backend o documentar como demo |

### 2.2 Fixes Cross-Portal Urgentes

| # | Issue | Esfuerzo | Descripcion |
|---|-------|----------|-------------|
| 9 | H-008: ProtectedRoute redirect Parent | 0.5d | Detectar portal origin, redirigir a `/parent/login` |
| 10 | H-010: GamificationOverlay leak | 0.5d | Restringir a Student + Teacher portals |
| 11 | STU-P1-04: BottomNavigation rutas invalidas | 0.5d | Corregir 2 rutas invalidas |

### Total Sprint 1: ~12 dias de esfuerzo

---

## 3. Sprint 2: Homologacion + P1 Criticos (Semana 3-4)

**Objetivo:** Unificar layouts, temas, y resolver P1 de mayor impacto.

### 3.1 Homologacion de Layouts

| # | Recomendacion | Esfuerzo | Descripcion |
|---|--------------|----------|-------------|
| 1 | H-001: SharedPortalLayout | 3-5d | Crear layout compartido Admin+Teacher, eliminar 97% duplicacion |
| 2 | H-002: Unificar AdminPageShell | 2-3d | Migrar features/admin/ al patron apps/admin/ |
| 3 | H-003: Parent detective-theme | 2-3d | Integrar indigo/purple al detective-theme framework |

### 3.2 P1 de Admin (top 10)

| # | Issue | Esfuerzo | Descripcion |
|---|-------|----------|-------------|
| 4 | DASH-P1-01: AND-gate loading | 0.5d | Cambiar a OR-gate o estado loading individual |
| 5 | CNT-P1-01: ExerciseTypeSelector 17/23+ | 1d | Agregar tipos M4 y M5 faltantes |
| 6 | CNT-P1-02: AdminAssignments orphan endpoints | 1d | Implementar endpoints backend o eliminar pagina |
| 7 | USR-P1-01: Modal edit race condition | 0.5d | Guardar snapshot de datos antes de abrir modal |
| 8 | USR-P1-12: Doble click submit | 0.5d | Agregar `isSubmitting` guard a todos los modales admin |
| 9 | SET-P1-08: LTI credentials texto plano | 0.5d | Agregar mascara/copy-to-clipboard |
| 10 | SET-P1-11: Admin notifications Zustand -> RQ | 1d | Migrar fetch a React Query, mantener push en Zustand |

### 3.3 P1 de Parent

| # | Issue | Esfuerzo | Descripcion |
|---|-------|----------|-------------|
| 11 | PRN-P1-04: Parent refresh token | 1d | Implementar refresh token logic en parentStore |
| 12 | PRN-P1-05: ChildProgress loading skeleton | 0.5d | Agregar skeleton mientras cargan datos |

### Total Sprint 2: ~14-18 dias de esfuerzo

---

## 4. Sprint 3: Deuda Tecnica + Dead Code (Semana 5-6)

**Objetivo:** Eliminar dead code, normalizar state management, resolver P1 restantes.

### 4.1 Eliminacion de Dead Code

| # | Item | Esfuerzo | Impacto |
|---|------|----------|---------|
| 1 | LegacyExercisePage (993 lineas) | 0.5d | -993 lineas |
| 2 | 14 componentes huerfanos Admin (WS01) | 1d | ~14 archivos |
| 3 | 6 componentes shared huerfanos (WS07) | 0.5d | 6 archivos |
| 4 | 4 hooks huerfanos Admin (WS01) | 0.5d | 4 archivos |
| 5 | LogsViewer duplicado con AuditLogsPage | 0.5d | 1 archivo, consolidar |

### 4.2 Normalizacion de State Management

| # | Item | Esfuerzo | Descripcion |
|---|------|----------|-------------|
| 6 | H-006a: Parent data fetch -> React Query | 3d | Crear useParentDashboard, useChildProgress hooks con RQ |
| 7 | H-006b: Teacher legacy pages -> RQ | 3d | Migrar paginas con useState/useEffect directo |
| 8 | Registrar VerdaderoFalso.SECURE.tsx | 0.5d | Agregar al registry o eliminar si no se usa |

### 4.3 P1 Admin Restantes (seleccion)

| # | Issue | Esfuerzo | Descripcion |
|---|-------|----------|-------------|
| 9 | USR-P1-03: Filtros en URL | 1d | Persistir filtros en query params |
| 10 | USR-P1-10: Debounce busqueda | 0.5d | Agregar useDebouncedValue |
| 11 | SET-P1-03: Alerts auto-refresh | 0.5d | Agregar polling con React Query |
| 12 | SET-P1-06: Reports flicker | 0.5d | Usar staleTime/keepPreviousData |

### 4.4 Estandarizacion Cross-Portal

| # | Recomendacion | Esfuerzo | Descripcion |
|---|--------------|----------|-------------|
| 13 | H-004: Loading states estandarizados | 3-4d | Crear PageSkeleton, ComponentSkeleton, InlineSpinner |
| 14 | H-005: Error handling estandarizado | 5-7d | Crear useErrorHandler, integrar con RQ global |

### Total Sprint 3: ~20-25 dias de esfuerzo

---

## 5. Sprint 4: Documentacion (Semana 7-8)

**Objetivo:** Cerrar brechas documentales criticas.

### 5.1 Documentacion P0

| # | Tarea | Esfuerzo | Descripcion |
|---|-------|----------|-------------|
| 1 | Cerrar G-003/004/005 | 0.5d | Documento formal de status |
| 2 | API-SERVICES.md (+30 services) | 1-2d | Inventariar y documentar services faltantes |

### 5.2 Documentacion P1

| # | Tarea | Esfuerzo | Descripcion |
|---|-------|----------|-------------|
| 3 | 8 flujos Admin faltantes | 4d | FL-ADM-12 a FL-ADM-17 |
| 4 | 6 flujos Teacher faltantes | 3d | FL-TCH-10 a FL-TCH-14 |
| 5 | Actualizar TEACHER-PAGES-SPECS | 2d | +7 paginas faltantes |
| 6 | Normalizar 25 flujos amarillos | 5d | Template 9 secciones |
| 7 | Actualizar STATE-MANAGEMENT.md | 0.5d | 13 stores, patron canonico |
| 8 | Actualizar student/README.md | 0.5d | Metricas reales |

### 5.3 Documentacion P2

| # | Tarea | Esfuerzo | Descripcion |
|---|-------|----------|-------------|
| 9 | 15 specs paginas Admin | 5d | Crear en impl/admin/pages/ |
| 10 | 10 specs paginas Student | 3d | Crear en student/specs/ |
| 11 | 3 specs paginas Parent | 1d | Crear en parents/specs/ |
| 12 | Guia testing mecanicas | 2d | TESTING-EXERCISE-MECHANICS.md |
| 13 | Actualizar HOOK-PATTERNS.md | 1d | 127 hooks, patrones canonicos |
| 14 | Actualizar COMPONENTES-INVENTARIO.md | 1d | 590 componentes |

### Total Sprint 4: ~29 dias de esfuerzo (puede distribuirse en 2 sprints)

---

## 6. Sprint 5+: P2 Restantes y Mejoras (Semana 9+)

### 6.1 P2 Issues

| # | Item | Esfuerzo | Portal |
|---|------|----------|--------|
| 1-20 | ~20 P2 Admin issues | 10-15d | Admin |
| 21-28 | ~8 P2 Teacher issues | 4-6d | Teacher |
| 29-33 | ~5 P2 Student issues | 2-3d | Student |
| 34-42 | ~9 P2 Parent issues | 4-6d | Parent |
| 43-52 | ~10 P2 Cross-portal | 5-8d | Shared |

### 6.2 Mejoras Arquitectonicas

| # | Item | Esfuerzo | Descripcion |
|---|------|----------|-------------|
| 1 | H-007: Documentar/unificar auth | 1-5d | ADR + posible migracion |
| 2 | H-009: Reutilizacion shared en Parent | 3-4d | Adoptar 7+ shared components |
| 3 | Social module frontend integration | 10-15d | 40 endpoints backend sin frontend |
| 4 | Lazy loading Teacher dashboard tabs | 2d | 10 tabs sin code splitting |

---

## 7. Tabla Resumen de Esfuerzo

| Sprint | Semanas | Dias esfuerzo | Prioridad | Foco |
|--------|---------|---------------|-----------|------|
| Sprint 1 | 1-2 | ~12d | P0 | Bugs criticos + quick wins |
| Sprint 2 | 3-4 | ~14-18d | P1 | Homologacion + P1 top |
| Sprint 3 | 5-6 | ~20-25d | P1/P2 | Dead code + state mgmt + estandarizacion |
| Sprint 4 | 7-8 | ~29d | P1/P2 | Documentacion |
| Sprint 5+ | 9+ | ~35-50d | P2/P3 | P2 restantes + mejoras arquitectonicas |
| **Total** | **~10-12** | **~110-134d** | -- | -- |

> Nota: Los dias de esfuerzo son estimaciones para un desarrollador frontend senior trabajando a tiempo completo. Con 2 desarrolladores, los sprints pueden solaparse.

---

## 8. Criterios de Exito

### Sprint 1

- [ ] 0 issues P0 abiertos
- [ ] Parent portal sin links muertos
- [ ] ProtectedRoute redirige correctamente a cada portal
- [ ] GamificationOverlay solo en Student + Teacher

### Sprint 2

- [ ] AdminLayout y TeacherLayout unificados en SharedPortalLayout
- [ ] Parent portal usa detective-theme
- [ ] Top 10 P1 de Admin resueltos
- [ ] Parent auth con refresh token

### Sprint 3

- [ ] 0 componentes/hooks huerfanos
- [ ] LegacyExercisePage eliminado
- [ ] State management normalizado en Teacher
- [ ] Parent data fetching via React Query
- [ ] Loading states y error handling estandarizados

### Sprint 4

- [ ] API-SERVICES.md cubre 67/67 services
- [ ] 0 paginas sin flujo UX documentado
- [ ] 25 flujos amarillos normalizados a template
- [ ] G-003/004/005 cerrados formalmente
- [ ] STATE-MANAGEMENT.md actualizado

### Sprint 5+

- [ ] Todos los P2 resueltos
- [ ] Social module frontend integrado (40 endpoints)
- [ ] Auth system documentado con ADR
- [ ] Cobertura documental > 90% en todos los portales

---

## 9. Riesgos y Dependencias

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|------------|
| Feature Flags/A/B Testing requiere decision de producto | Alta | Media | Agendar decision con stakeholders en Sprint 1 |
| TeacherReportsPage depende de Puppeteer en servidor | Media | Alta | Verificar con equipo de DevOps |
| Unificacion de layouts puede romper CSS existente | Media | Media | Branch feature + QA manual |
| Parent refactor a RQ puede afectar flujos existentes | Baja | Alta | Tests manuales de todos los flujos parent |
| Documentacion puede quedar desactualizada rapidamente | Alta | Media | Integrar actualizacion de docs en PRs de codigo |

---

## 10. Metricas de Seguimiento

| Metrica | Actual | Target Sprint 2 | Target Sprint 4 | Target Final |
|---------|--------|-----------------|-----------------|-------------|
| Issues P0 abiertos | 8 | 0 | 0 | 0 |
| Issues P1 abiertos | ~63 | ~40 | ~10 | 0 |
| Componentes huerfanos | 20+ | 20 | 0 | 0 |
| Lineas dead code | ~993+ | ~993 | 0 | 0 |
| Flujos documentados / necesarios | 54/70 (73%) | 54/70 | 70/70 (100%) | 70/70 |
| Specs de paginas / paginas | 29/64 (45%) | 29/64 | 64/64 (100%) | 64/64 |
| API services documentados / existentes | 37/67 (55%) | 37/67 | 67/67 (100%) | 67/67 |
| Flujos verdes (template completo) | 14/46 (30%) | 14/46 | 46/46 (100%) | 46/46+ |
