# 04 - Brechas de Documentacion

**Version:** 1.0.0
**Fecha:** 2026-02-21
**Tarea:** TASK-2026-02-21-ANALISIS-PORTALES
**Fuente:** WS09 consolidado

---

## 1. Matriz de Cobertura Documental

### 1.1 Flujos de Proceso (por portal)

| Portal | Paginas reales | Flujos documentados | Flujos verdes (completos) | Flujos amarillos (parciales) | Sin flujo | Cobertura % |
|--------|---------------|---------------------|--------------------------|------------------------------|-----------|-------------|
| Admin | 19 | 11 (FL-ADM-01..11) | 1 (FL-ADM-07) | 10 | 8 paginas | 58% |
| Teacher | 19 | 9 (FL-TCH-01..09) | 5 (FL-TCH-02,03,04,05,06) | 4 | 10 paginas | 47% |
| Student | 22 | 21 | 3 (FL-STU-13,14,15) + 5 completos | 13 | 1 pagina | 95% |
| Parent | 4 | 7 (FL-PRN-01..07) | 3 (FL-PRN-01,02,03) | 4 | 0 | 100%+ |
| Auth/Shared | 6 | 6 | 6 | 0 | 0 | 100% |
| **Total** | **70** | **54** | **23** | **31** | **19** | **73%** |

### 1.2 Especificaciones de Pagina

| Portal | Paginas | Specs existentes | Specs faltantes | Cobertura % |
|--------|---------|-----------------|-----------------|-------------|
| Admin | 19 | 4 detalladas | 15 | 21% |
| Teacher | 19 | 12 (parciales, fecha antigua) | 7 | 63% |
| Student | 22 | 12 | 10 | 55% |
| Parent | 4 | 1 (guia general) | 3 | 25% |
| **Total** | **64** | **29** | **35** | **45%** |

### 1.3 API Services

| Indicador | Valor |
|-----------|-------|
| API service files existentes en codigo | 67 |
| API services documentados en API-SERVICES.md | 37 |
| Sin documentar | ~30 (45%) |
| Ubicacion sin documentar | `shared/api/` y features recientes |

### 1.4 Estandares y Guias

| Tipo | Existentes | Necesarios | Gap |
|------|-----------|-----------|-----|
| Estandares frontend (STANDARD-*) | 5 + ESTANDAR-FE | 6 | 0 |
| ADRs relevantes frontend | 25 | 25 | 0 |
| Guias de implementacion | 23+ | ~30 estimado | ~7 |

---

## 2. Documentacion Faltante por Prioridad

### 2.1 P0 -- Critico (bloquea trazabilidad)

| # | Brecha | Archivo propuesto | Descripcion |
|---|--------|-------------------|-------------|
| 1 | Gaps G-003, G-004, G-005 sin documento | `docs/60-portals/student/specs/gaps/STUDENT-GAPS-003-004-005-STATUS.md` | Confirmar si estos gaps existieron, fueron resueltos sin documentar, o la numeracion es un artefacto. Actualizar `_MAP.md`. |
| 2 | API-SERVICES.md incompleto (37/67) | `docs/50-guides/frontend/impl/API-SERVICES.md` (actualizar) | Inventariar los 30 services faltantes en `shared/api/` y features. |

### 2.2 P1 -- Alta prioridad (afecta desarrollo y onboarding)

| # | Brecha | Archivo propuesto | Descripcion |
|---|--------|-------------------|-------------|
| 3 | 15 specs de paginas Admin faltantes | `docs/50-guides/frontend/impl/admin/pages/` | Crear especificacion por pagina: estructura, componentes, hooks, API calls, estados. |
| 4 | 8 flujos Admin faltantes | `docs/30-ux-ui/flujos/admin/` | FL-ADM-12 a FL-ADM-17: NotificationsPage, ProgressPage, AssignmentsPage, ClassroomTeacherPage, SettingsPage/AdvancedPage, AlertsPage. |
| 5 | 6 flujos Teacher faltantes | `docs/30-ux-ui/flujos/teacher/` | FL-TCH-10 a FL-TCH-14: CommunicationPage, GamificationPage, ExerciseResponsesPage, NotificationsPage, AlertConfigPage. |
| 6 | 7 specs de paginas Teacher faltantes | `docs/50-guides/frontend/impl/teacher/pages/TEACHER-PAGES-SPECIFICATIONS.md` (actualizar) | Agregar: CommunicationPage, GamificationPage, AlertConfigPage, NotificationsPage, NotificationPreferencesPage, ContentManagementPage, ExerciseResponsesPage. |
| 7 | 25 flujos amarillos sin template completo | `docs/30-ux-ui/flujos/` (actualizar) | Normalizar 25 flujos al template de 9 secciones: precondiciones, casos de error, criterios de aceptacion, historial de cambios. |
| 8 | STATE-MANAGEMENT.md desactualizado | `docs/50-guides/frontend/impl/STATE-MANAGEMENT.md` (actualizar) | Reflejar 13 stores actuales, eliminacion de missionsStore, patron canonico useEquipment vs useInventory. |

### 2.3 P2 -- Media prioridad (mejora mantenibilidad)

| # | Brecha | Archivo propuesto | Descripcion |
|---|--------|-------------------|-------------|
| 9 | student/README.md metricas infladas | `docs/50-guides/frontend/impl/student/README.md` (actualizar) | Corregir: 22 paginas reales (no "70 total"). Remover referencias a GamificationTestPage, NewLeaderboardPage. |
| 10 | 10 specs de paginas Student faltantes | `docs/60-portals/student/specs/` | MissionsPage, LearningPage, LeaderboardPage, FriendsPage, GuildsPage, ShopPage, InventoryPage, ModuleDetailPage, EnhancedProfilePage, NotificationsPage. |
| 11 | Documentar endpoints sociales sin integrar | ADR o documento de decision | 40 endpoints sociales backend (teams, peers, challenges) sin frontend. Documentar decision explicita. |
| 12 | HOOK-PATTERNS.md desactualizado | `docs/50-guides/frontend/impl/HOOK-PATTERNS.md` (actualizar) | Documentar 127 hooks con patrones canonicos. Incluir useEquipment, useExerciseSubmission, useManualReviews. |
| 13 | Guia de test para mecanicas de ejercicio | `docs/50-guides/frontend/impl/TESTING-EXERCISE-MECHANICS.md` (crear) | Como testear los 30 tipos de ejercicio, patrones de mock para ExerciseContext. |
| 14 | Specs de paginas Parent (3) | `docs/60-portals/parents/specs/` (crear) | ParentDashboardPage, ChildProgressPage, ParentLoginPage. |
| 15 | Flujo dedicado MissionsPage | `docs/30-ux-ui/flujos/student/FLUJO-MISIONES-PAGINA.md` | Separar de FL-STU-04 (que mezcla logros y misiones). |
| 16 | COMPONENTES-INVENTARIO.md desactualizado | `docs/50-guides/frontend/impl/COMPONENTES-INVENTARIO.md` (actualizar) | No refleja los 590 componentes actuales. |

---

## 3. Documentos Desactualizados

| Documento | Fecha | Problema | Accion |
|-----------|-------|---------|--------|
| `impl/API-SERVICES.md` | 2026-02-21 | 37 de 67 services (55% coverage) | Actualizar con 30 services faltantes |
| `impl/student/README.md` | 2026-02-18 | Dice "70 paginas total", lista paginas eliminadas | Corregir metricas a 22 paginas reales |
| `impl/teacher/pages/TEACHER-PAGES-SPECIFICATIONS.md` | 2025-12-18 | Fecha antigua, 12 de 19 paginas | Agregar 7 paginas faltantes |
| `impl/STATE-MANAGEMENT.md` | 2026-02-11 | Lista 5 stores de ejemplo vs 13 reales | Actualizar a estado actual |
| `impl/COMPONENTES-INVENTARIO.md` | 2026-02-11 | Fecha antigua, no refleja 590 componentes | Actualizar inventario |
| `impl/HOOK-PATTERNS.md` | 2026-02-11 | No refleja 127 hooks ni patron useEquipment | Actualizar patrones |
| `PORTAL-ADMIN-GUIDE.md` | 2026-02-18 | Lista 19 paginas pero spec detallada solo de algunas | Completar specs |

---

## 4. Known Gaps Status (G-001 a G-008)

| Gap ID | Titulo | Estado | Documento |
|--------|--------|--------|-----------|
| G-001 | Misiones - Recompensas No se Otorgan | RESUELTO (2025-11-24) | Existe |
| G-002 | Misiones - Progreso No Se Actualiza | RESUELTO (2025-11-29) | Existe |
| G-003 | **Desconocido** | **SIN DOCUMENTO** | No existe |
| G-004 | **Desconocido** | **SIN DOCUMENTO** | No existe |
| G-005 | **Desconocido** | **SIN DOCUMENTO** | No existe |
| G-006 | Perfil - Estadisticas Hardcodeadas | RESUELTO (2025-11-24) | Existe |
| G-007 | Settings - Guardar Configuraciones Mock | RESUELTO (2025-11-24) | Existe |
| G-008 | Backend - getUserStatistics() Mock | RESUELTO (2025-11-24) | Existe |

**Accion requerida:** Cerrar formalmente G-003/004/005 con documento de status que explique si nunca existieron o fueron resueltos sin traza.

---

## 5. Notas de Consistencia

1. **COBERTURA-TOTAL-PROCESOS.md** declara "100% cobertura" para todos los portales, pero esto refiere a procesos core, no a cada pagina de la aplicacion. La cobertura real por pagina es 58% admin, 47% teacher.

2. **FL-ADM-05 (LTI)** referencia `features/admin/lti/AdminLtiPage.tsx` que no esta en `apps/admin/pages/`. La pagina existe pero fuera de la estructura canonica.

3. **25 flujos en estado "amarillo"** documentados en AUDITORIA-FASE1 permanecen sin normalizar al template. Esta deuda documental fue registrada como GAP-TRZ-004 pero no tiene fecha de cierre.

4. **PORTAL-TEACHER-GUIDE.md** lista 19 paginas coherentes con el codigo, pero la guia usa nombres ligeramente distintos a los archivos reales.

---

## 6. Plan de Documentacion

### Sprint Documentacion 1 (1 semana)

| # | Tarea | Esfuerzo |
|---|-------|----------|
| 1 | Cerrar G-003/004/005 formalmente | 0.5 dia |
| 2 | Actualizar API-SERVICES.md (+30 services) | 1-2 dias |
| 3 | Actualizar STATE-MANAGEMENT.md | 0.5 dia |
| 4 | Actualizar student/README.md metricas | 0.5 dia |

### Sprint Documentacion 2 (2 semanas)

| # | Tarea | Esfuerzo |
|---|-------|----------|
| 5 | Crear 8 flujos Admin faltantes | 4 dias |
| 6 | Crear 6 flujos Teacher faltantes | 3 dias |
| 7 | Actualizar TEACHER-PAGES-SPECIFICATIONS.md | 2 dias |
| 8 | Normalizar 10 flujos amarillos prioritarios | 3 dias |

### Sprint Documentacion 3 (2 semanas)

| # | Tarea | Esfuerzo |
|---|-------|----------|
| 9 | Crear 15 specs de paginas Admin | 5 dias |
| 10 | Normalizar 15 flujos amarillos restantes | 4 dias |
| 11 | Crear 10 specs Student faltantes | 3 dias |
| 12 | Crear guia de testing mecanicas | 2 dias |

### Total estimado: 5-6 semanas para cerrar todas las brechas documentales.
