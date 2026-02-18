# Traza de Tareas: NEXUS-FRONTEND

**Última actualización:** 2026-02-18 (Student Portal Refactoring Fases 0-4)
**Revisado en auditoría:** 2026-01-10 (Sin cambios - contenido vigente)
**Estado:** ✅ Portal Teacher COMPLETO - 19 páginas refactorizadas (Sprint 0+1+2)
**Estado:** ✅ Portal Student - 10 páginas refactorizadas (Fases 0-4), 94% compliance
**Estado:** ✅ Portal Admin - 19 páginas refactorizadas (Sprint 0+1+2), 85.5% compliance

> **NOTA ARCHIVO (2026-02-11):** Tareas anteriores a 2026 (FE-050 a FE-137, ~4,700 lineas)
> fueron archivadas en `_archive/TRAZA-TAREAS-FRONTEND-HISTORICO.md`.
> Este archivo conserva las tareas mas recientes (2026-01-24 a 2026-02-18).

---

## TASK-2026-02-18-STUDENT-PORTAL-ANALYSIS — Student Portal Refactoring Fases 0-4 ✅

**Estado:** COMPLETADA
**Prioridad:** P1
**Asignado:** CLAUDE-CODE (claude-opus-4-6)
**Fecha:** 2026-02-18
**Tarea Padre:** TASK-2026-02-18-STUDENT-PORTAL-ANALYSIS

### Resumen

Refactorización completa de 10 páginas del portal de estudiantes siguiendo patrón Thin Shell + React Query + Component Extraction. Gold Standard: ExercisePage.tsx (1058→30 líneas).

### Fases Ejecutadas

| Fase | Alcance | Paginas | Reduccion |
|------|---------|---------|-----------|
| Fase 0 | Shared Utilities (prerrequisitos) | 0 | 5 archivos base |
| Fase 1 | Bug Fixes P0 | 2 (AchievementsPage, LearningPage) | -40% |
| Fase 2 | Core Pages P1 | 4 (ShopPage, InventoryPage, ModuleDetailPage, EnhancedProfilePage) | -62% |
| Fase 3 | Engagement Pages P2 | 3 (LeaderboardPage, FriendsPage, GuildsPage) | -71% |
| Fase 4 | Quality Fixes P0/P1/P2 | 1+ (hooks, accessibility, structure) | -36% |

### Archivos Creados (43 total)

| Tipo | Cantidad | Ejemplos |
|------|----------|----------|
| Hooks | 7 | useShopData, useShopPurchase, useInventoryData, useActivatePowerUp, useAchievements, useProfileData, useAvatarUpdate |
| Componentes Phase 2 | 14 | ShopItemCard, PurchaseModal, InventoryItemCard, PowerUpModal, ExerciseCard, ProfileHero, ProfileStatsTab |
| Componentes Phase 3 | 15 | UserPositionCard, LeaderboardStatsGrid, FriendsListTab, DiscoverGuildsTab, CreateGuildModal |
| Componentes Phase 4 | 2 | AchievementsPage (moved), ModuleCard |
| Utilities | 4 | rarityColors.ts, error.util.ts, difficulty.ts, inventory/utils.ts |
| Types | 1 | profile/types.ts |

### Resultado Global

| Metrica | Valor |
|---------|-------|
| Paginas refactorizadas | 10 |
| Lineas antes | 5,719 |
| Lineas despues | 2,307 |
| Reduccion | **-60%** (-3,412 lineas) |
| Archivos nuevos | 43 |
| Build verification | PASS (0 new TS errors) |
| Standards compliance | **94%** (9 PASS, 4 WARN, 0 FAIL) |

### Phase 4 Quality Fixes

| Fix | Detalle |
|-----|---------|
| useProfileData hook | Agrega 4 Zustand stores + useEffect (EnhancedProfilePage 240→213) |
| useAvatarUpdate hook | Optimistic update + API persistence |
| ARIA tabs | role="tablist" + role="tab" + aria-selected (EnhancedProfilePage, InventoryPage) |
| Search labels | sr-only labels (ShopPage, InventoryPage, LearningPage) |
| Error typing | useEquipment.ts: `error: any` → `error: Error` + extractApiErrorMessage |
| AchievementsPage move | pages/ → apps/student/pages/ (single default export) |
| ModuleCard extraction | LearningPage 322→206 lines |

### Documentacion Actualizada

| Artefacto | Cambio |
|-----------|--------|
| FRONTEND_INVENTORY.yml v10.0.0 | componentes 571, hooks 119 |
| MASTER_INVENTORY.yml v11.0.0 | componentes 571, hooks 119 |
| 3 flujos student | Paths AchievementsPage corregidos |
| COBERTURA-TOTAL-PROCESOS.md | Path actualizado |
| TRACEABILITY-MATRIX.md | Path actualizado |
| 02-RESULTADOS-REFACTORIZACION.md | Fases 0-4 completas |
| 03-VALIDACION-ESTANDARES-FINAL.md | 13 dimensiones, 94% score |

### Impacto

- Componentes: +31 (+2 Phase 4) = 571 total
- Hooks: +7 = 119 total
- API Service Files: 53 (sin cambios)

---

## MQ-009 — Sync XP multiplierMap FE con SSOT Backend ✅

**Estado:** COMPLETADA
**Prioridad:** P2
**Asignado:** CLAUDE-CODE (claude-opus-4-6)
**Fecha:** 2026-02-18
**Backlog Item:** EPIC-WS-004 / MQ-009

### Resumen

Sincronizacion de datos de rangos Maya entre frontend y DB seeds. RanksSection.tsx usaba 78 lineas de mock data con valores incorrectos (wrong rank order, wrong XP thresholds, wrong multipliers 1.0-3.0). Reemplazado con import directo del SSOT (ranks.constants.ts).

### Archivos Modificados (6)

| Archivo | Cambio |
|---------|--------|
| `shared/constants/ranks.constants.ts` | v2.0→v2.1: Halach Uinic xpMax 2249→1899, K'uk'ulkan xpMin 2250→1900 (sync DB seeds v2.1) |
| `apps/student/components/gamification/RanksSection.tsx` | Replaced 78 lines hardcoded mock → import MAYA_RANKS_ORDERED + RANK_GRADIENT_MAP |
| `apps/student/hooks/useDashboardData.ts` | JSDoc clarified: ML Coins multipliers (1.0-2.0) ≠ DB xp_multiplier (1.0-1.25). `getRankIcon()` migrado a SSOT import (5/5 icons divergian). `defaultRankData.rankIcon` 🏹→🌱 |
| `apps/student/components/gamification/GamificationHero.tsx` | Replaced 32-line hardcoded MAYA_RANKS → SSOT import + `getRankDisplay()` + local RANK_GRADIENT_MAP. Icons 5/5 aligned |
| `apps/student/components/dashboard/RankProgressWidget.tsx` | Replaced 37-line hardcoded MAYA_RANKS → SSOT import + `getRankDisplay()` + local RANK_STYLE_MAP. Removed 2 debug console.logs |

### Validacion

| Check | Resultado |
|-------|-----------|
| XP thresholds FE = DB seeds | ✅ 5/5 ranks aligned |
| XP multipliers FE = DB seeds | ✅ 5/5 ranks aligned |
| Colors FE = DB seeds | ✅ 5/5 hex values match |
| ML Coins bonus FE = DB seeds | ✅ 5/5 values match |
| No `any` in modified files | ✅ |
| SSOT import pattern | ✅ (import MAYA_RANKS_ORDERED) |
| Safe-edit compliance | ✅ (minimal changes, no placeholders) |

---

## TASK-2026-02-18-ADMIN-PORTAL-REFACTOR — Admin Portal Refactoring Sprint 0+1+2 ✅

**Estado:** COMPLETADA
**Prioridad:** P1
**Asignado:** CLAUDE-CODE (claude-opus-4-6)
**Fecha:** 2026-02-18

### Resumen

Refactorización de 19 páginas del portal admin en 3 sprints. Creación de AdminPageShell + AdminTabBar como infraestructura cross-cutting.

### Resultado

| Metrica | Valor |
|---------|-------|
| Paginas migradas | 19/19 (100%) |
| Lineas antes | 7,471 |
| Lineas despues | 3,568 |
| Reduccion | **-52.2%** (-3,903 lineas) |
| Componentes nuevos | 30 |
| Hooks nuevos | 6 |
| Standards compliance | **85.5%** |

---

## TASK-2026-02-18-ANALISIS-MISIONES-LOGROS — Missions/Achievements Analysis + 12 Fixes ✅

**Estado:** COMPLETADA
**Prioridad:** P1
**Asignado:** CLAUDE-CODE (claude-opus-4-6)
**Fecha:** 2026-02-18

### Resumen

Análisis de 5 pistas + implementación de 12 correcciones (REC-001 a REC-012): UNIQUE constraints, timezone cron, missionsStore deletion, seeds renaming, DB function deprecation, retry jobs, template_id migration.

### Impacto

- Entities: 154→155 (+UserEquippedItem), Services: 172→173, FKs: 298→299
- Stores: 14→13 (-missionsStore), API files: 53→52 (-missionsAPI)

---

## Reestructuración Sistema Ejercicios ✅

**Estado:** COMPLETADA
**Asignado:** CLAUDE-CODE (claude-opus-4-6)
**Fecha:** 2026-02-18

### Resumen

Descomposición del monolito ExercisePage.tsx (~1058 líneas → 30 líneas) con Registry Pattern. 30 mecánicas registradas, React Context para state, backward-compat wrapper.

### Impacto

- Componentes: +10, Hooks: +3, Contexts: +1 (ExerciseContext)

---

## P1 Gaps: Admin Portal Hooks (System Logs + Config Categories) ✅

**Estado:** COMPLETADA
**Prioridad:** P1
**Asignado:** CLAUDE-CODE (claude-opus-4-5-20251101)
**Fecha:** 2026-01-25
**Tarea Padre:** TASK-2026-01-25-VALIDACION-INTEGRAL-GAMILIT

### Resumen

Creación de hooks React para integración con endpoints backend existentes de System Logs y Config Categories. Los endpoints ya estaban implementados en backend pero faltaban hooks frontend para consumirlos.

### Archivos Creados

| Archivo | Tipo | Líneas | Descripción |
|---------|------|--------|-------------|
| `apps/admin/hooks/useSystemLogs.ts` | Hook | 194 | Consulta de logs del sistema con filtrado |
| `apps/admin/hooks/useConfigCategories.ts` | Hook | 168 | Categorías de config y validación |

### Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `apps/admin/hooks/index.ts` | +export useSystemLogs, useConfigCategories |
| `services/api/adminTypes.ts` | +ConfigValidationResult type |

### useSystemLogs.ts - Funcionalidades

| Función | Descripción |
|---------|-------------|
| `fetchLogs(filters)` | Obtener logs con filtros opcionales |
| Paginación | Soporte para page, limit, total |
| Filtrado | level, date, search |
| Error handling | Estados loading, error, refetch |

### useConfigCategories.ts - Funcionalidades

| Función | Descripción |
|---------|-------------|
| `fetchCategories()` | Obtener lista de categorías disponibles |
| `validateConfig(category, config)` | Validar configuración contra schema |
| Loading states | Separados para fetch y validate |

### Endpoints Consumidos (Backend Existente)

| Endpoint | Hook |
|----------|------|
| GET /admin/system/logs | useSystemLogs |
| GET /admin/system/config/categories | useConfigCategories |
| POST /admin/system/config/validate | useConfigCategories.validateConfig |

### Impacto

- Hooks: +2 (110 → 112)
- Líneas nuevas: ~362
- Archivos: +2 (910 → 912)

### Nota

Los endpoints backend ya existían y fueron verificados durante TASK-2026-01-25-VALIDACION-INTEGRAL-GAMILIT. Solo faltaban hooks para consumirlos desde el frontend.

---

## TASK-019: US-PM-007 - Configuración de Alertas (Frontend) ✅

**Estado:** COMPLETADA
**Prioridad:** P1
**Asignado:** CLAUDE-CODE (claude-opus-4-5-20251101)
**Fecha:** 2026-01-25
**Story Points:** 4 SP (parte de 8 SP full-stack)
**User Story:** US-PM-007

### Resumen

Implementación del frontend para configuración de alertas de intervención personalizadas. Página con cards por tipo de alerta, toggles enable/disable, edición de umbrales y preferencias de notificación.

### Archivos Creados

| Archivo | Tipo | Líneas | Descripción |
|---------|------|--------|-------------|
| `services/api/teacher/alertConfigApi.ts` | API Client | 180 | CRUD + getDefaults + initializeDefaults |
| `apps/teacher/hooks/useAlertConfig.ts` | Hook | 220 | Estado + métodos + toast notifications |
| `apps/teacher/pages/TeacherAlertConfig.tsx` | Page | 420 | UI con 6 cards de alerta |

### Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `App.tsx` | +ruta /teacher/settings/alerts |
| `apps/teacher/hooks/index.ts` | +export useAlertConfig, AlertConfigType |
| `services/api/teacher/index.ts` | +export alertConfigApi y tipos |

### Características UI

- **Cards por tipo de alerta:** 6 tipos con iconos y colores distintos
- **Toggle enable/disable:** Switch visual por alerta
- **Edición de umbrales:** Input numérico con unidad (%, días, veces, min)
- **Notificaciones:** Botones Email / In-App seleccionables
- **Inicializar defaults:** Botón para crear configuraciones predeterminadas
- **Estados:** Loading skeleton, error con retry, empty state

### Ruta Agregada

```tsx
<Route path="/teacher/settings/alerts" element={<TeacherAlertConfig />} />
```

### Impacto

- Pages: +1 (74 → 75)
- Hooks: +1 (109 → 110)
- API Services: +1 (24 → 25)
- Líneas nuevas: ~820

---

## TASK-018: US-PM-006 - Bloqueo/Desbloqueo de Alumnos (Frontend) ✅

**Estado:** COMPLETADA
**Prioridad:** P1
**Asignado:** CLAUDE-CODE (claude-opus-4-5-20251101)
**Fecha:** 2026-01-25
**Story Points:** 4 SP
**User Story:** US-PM-006

### Resumen

Implementación del frontend para bloqueo/desbloqueo de estudiantes en el Portal del Maestro. El backend ya existía implementado en `student-blocking.service.ts`. Se crearon componentes visuales y hook de integración.

### Archivos Creados

| Archivo | Tipo | Líneas | Descripción |
|---------|------|--------|-------------|
| `apps/teacher/hooks/useStudentBlocking.ts` | Hook | 160 | Estado + blockStudent + unblockStudent |
| `apps/teacher/components/monitoring/SuspendStudentModal.tsx` | Component | 180 | Modal con tipo de bloqueo y razón |
| `apps/teacher/components/monitoring/StudentActionsMenu.tsx` | Component | 150 | Dropdown con acciones contextuales |

### Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `services/api/teacher/classroomsApi.ts` | +BlockType, +BlockStudentDto, +3 métodos API |
| `apps/teacher/hooks/index.ts` | +export useStudentBlocking, BlockType |
| `apps/teacher/components/monitoring/StudentMonitoringPanel.tsx` | +integración completa |

### Características UI

- **Modal de suspensión:**
  - Info del estudiante (avatar, nombre)
  - Selector de tipo: Completo / Parcial
  - Campo de razón (obligatorio)
  - Botones Cancelar / Suspender

- **Menú de acciones:**
  - Ver Detalles
  - Enviar Mensaje
  - Suspender / Desbloquear (condicional)
  - Ver Alertas
  - Ver Historial

- **Badge de bloqueado:** Indicador visual "Bloqueado" en listados

### Tipos Agregados a classroomsApi.ts

```typescript
export enum BlockType {
  FULL = 'full',
  PARTIAL = 'partial',
}

export interface BlockStudentDto {
  reason: string;
  block_type: BlockType;
  blocked_modules?: string[];
  blocked_exercises?: string[];
}

export interface StudentPermissionsResponse {
  student_id: string;
  is_blocked: boolean;
  block_reason?: string;
  block_type?: BlockType;
  blocked_modules: string[];
  blocked_exercises: string[];
  blocked_at?: string;
  blocked_by_name?: string;
}
```

### Impacto

- Components: +2 (463 → 465)
- Hooks: +1 (108 → 109)
- Líneas nuevas: ~490

### Análisis de Impacto

✅ **CERO afectación a Student Portal** - Confirmado mediante análisis exhaustivo:
- Componentes teacher-only (no compartidos)
- Hook exclusivo del módulo teacher
- API endpoints protegidos con TeacherGuard
- Sin modificaciones a rutas/stores del student

---

## TASK-011: Correcciones del Portal Teacher - Validación Integral (Fases 1-4) ✅

**Estado:** COMPLETADA
**Prioridad:** ALTA
**Asignado:** CLAUDE-CODE (claude-opus-4-5-20251101)
**Fecha:** 2026-01-25
**Story Points:** 8 SP
**Commits:** f37ecee3, d3269316, 9a8e92ae, 66fb4dcd

### Resumen

Validación exhaustiva del Portal Teacher identificando 31 issues y corrigiendo 15 de ellos organizados en 4 fases por severidad.

### Issues Corregidos

#### Fase 1 - CRÍTICOS (5)
| Issue | Archivo | Corrección |
|-------|---------|------------|
| Tipos InterventionAlert desincronizados | types/index.ts, AlertCard.tsx | Renombrar priority→severity, message→title, resolved→status |
| Datos mock como fallback | AssignmentCreator.tsx | Eliminar mock, agregar toast.error |
| Fallback silencioso a 0 | ReviewDetail.tsx | Validar explícitamente totalScore |
| console.log en backend | manual-review.controller.ts | Eliminar logs de debug |
| Validación classroom_id | - | Verificado OK via RLS |

#### Fase 2 - ALTA (3)
| Issue | Archivo | Corrección |
|-------|---------|------------|
| RLS validation | exercise-responses.service.ts | Verificado implementación existente |
| Error sin feedback UI | ResponseFilters.tsx | Agregar toast.error |
| Error genérico | manual-review.controller.ts | Usar UnauthorizedException |

#### Fase 3 - MEDIA (3)
| Issue | Archivo | Corrección |
|-------|---------|------------|
| Archivo deprecado | manualReviewExercises.ts | ELIMINADO (156 líneas) |
| useEffects superpuestos | TeacherProgress.tsx | Consolidar en 1 effect |
| Respuestas vacías | - | Verificado patrón REST correcto |

#### Fase 4 - BAJA (4)
| Issue | Archivo | Corrección |
|-------|---------|------------|
| 12 console.log debug | ReviewDetail.tsx | Eliminados todos |
| Tipos 'any' | StudentProgressList.tsx | Cambiar a string\|number |
| console.warn sin UI | TeacherProgress.tsx | Reemplazar con toast |
| eslint-disable innecesario | StudentProgressList.tsx | Eliminado |

### Métricas
- Issues identificados: 31
- Issues corregidos: 15
- Archivos modificados: 10
- Archivo eliminado: 1
- Líneas eliminadas: ~195
- Líneas agregadas: ~45

### Documentación
- Carpeta: `orchestration/tareas/TASK-011-teacher-portal-validation-fixes/`
- METADATA.yml: Completo con CAPVED
- Contexto: 01-CONTEXTO.md
- Análisis: 02-ANALISIS.md
- Ejecución: 03-EJECUCION.md

---

## TASK-009: Fix cache invalidation en Teacher Reviews - Completadas no aparecen ✅

**Estado:** COMPLETADA
**Prioridad:** P1
**Asignado:** CLAUDE-CODE
**Fecha:** 2026-01-25
**Story Points:** 2 SP

### Resumen

Corrección de bug donde los reviews completados no aparecían en la pestaña "Completadas" del Teacher Portal hasta refrescar la página manualmente.

### Problema

Después de calificar un ejercicio:
1. El review se marcaba como completed en BD correctamente
2. El modal de éxito se mostraba
3. Al cerrar modal y volver a lista, el review NO aparecía en "Completadas"
4. Solo aparecía después de F5 (refresh manual)

### Causa Raíz

En `ReviewDetail.tsx:231`, se llamaba directamente a `manualReviewApi.completeReview()` en lugar de usar el hook `useCompleteReview()`. El hook tiene la lógica de invalidar la cache de React Query en `onSuccess`, pero al llamar directamente a la API, la cache quedaba desactualizada.

### Solución

| Archivo | Líneas | Cambio |
|---------|--------|--------|
| `apps/teacher/components/review-panel/ReviewDetail.tsx` | +8 | Agregar invalidación manual de cache |

### Código

**Imports agregados:**
```typescript
import { useQueryClient } from '@tanstack/react-query';
import { manualReviewKeys } from '../../hooks/useManualReviews';
```

**Hook agregado:**
```typescript
const queryClient = useQueryClient();
```

**Invalidación agregada (después de completeReview exitoso):**
```typescript
queryClient.invalidateQueries({ queryKey: manualReviewKeys.all });
```

### Validación

| Check | Resultado |
|-------|-----------|
| Build Frontend | ✅ `built in 27.54s` |
| Lint | ✅ 0 errores nuevos |
| TypeScript | ✅ Sin errores |

### Referencias

- Documentación: `orchestration/tareas/TASK-009-fix-teacher-reviews-cache/`
- Commit: `f63bafc5`

---

## TASK-008: Fix notifDate.getTime is not a function en NotificationDropdown ✅

**Estado:** COMPLETADA
**Prioridad:** P1 CRÍTICO
**Asignado:** CLAUDE-CODE
**Fecha:** 2026-01-25
**Story Points:** 1 SP

### Resumen

Corrección de bug crítico que causaba pantalla blanca al hacer clic en el icono de notificaciones en el Student Portal.

### Problema

```
NotificationDropdown.tsx:47 Uncaught TypeError: notifDate.getTime is not a function
    at formatTimestamp (NotificationDropdown.tsx:47:25)
```

### Causa Raíz

La función `formatTimestamp` verificaba el tipo con `typeof date === 'string'`, pero cuando el dato venía del backend como objeto deserializado (no instancia de Date), la condición fallaba y se asignaba el objeto plano directamente, causando el crash al llamar `.getTime()`.

### Solución

| Archivo | Línea | Cambio |
|---------|-------|--------|
| `features/notifications/components/NotificationDropdown.tsx` | 44 | `typeof date === 'string'` → `date instanceof Date` |

### Código

**Antes:**
```typescript
const notifDate = typeof date === 'string' ? new Date(date) : date;
```

**Después:**
```typescript
const notifDate = date instanceof Date ? date : new Date(date);
```

### Validación

| Check | Resultado |
|-------|-----------|
| TypeScript | ✅ Sin errores nuevos |
| Edición mínima | ✅ 1 línea modificada |

### Referencias

- Documentación: `orchestration/tareas/TASK-008-fix-notification-dropdown/`

---

## TASK-001: Resolver 5 Gaps P0 Críticos en Student Portal ✅

**Estado:** COMPLETADA
**Prioridad:** P0 CRÍTICO
**Asignado:** CLAUDE-CODE
**Fecha:** 2026-01-24
**Story Points:** 21 SP (total, incluye backend)

### Resumen

Implementación de componentes frontend para 5 gaps P0 del Student Portal: 2FA, password reset, user search, WebSocket notifications y email verification.

### Archivos Creados

| Archivo | Tipo | Descripción |
|---------|------|-------------|
| `services/api/twoFactorAPI.ts` | API Client | Cliente para endpoints 2FA |

### Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `services/api/passwordAPI.ts` | validateResetToken() → llamada a backend |
| `services/api/profileAPI.ts` | +verifyEmail, +resendEmailVerification, +getEmailVerificationStatus |
| `apps/student/pages/SettingsPage.tsx` | Modal de verificación de email con estados y handlers |
| `apps/student/pages/NotificationsPage.tsx` | Integración de useWebSocket hook |
| `apps/student/pages/TwoFactorAuthPage.tsx` | Reemplazo de mocks por twoFactorAPI |
| `features/gamification/social/hooks/useFriends.ts` | searchUsers() → llamada a backend /users/search |

### APIs Frontend Implementadas

#### twoFactorAPI.ts
```typescript
twoFactorAPI.getStatus()           // GET /auth/2fa/status
twoFactorAPI.setup(method)         // POST /auth/2fa/setup
twoFactorAPI.verifySetup(code)     // POST /auth/2fa/setup/verify
twoFactorAPI.verify(userId, code)  // POST /auth/2fa/verify
twoFactorAPI.disable(password)     // POST /auth/2fa/disable
twoFactorAPI.resend(userId)        // POST /auth/2fa/resend
```

#### profileAPI.ts (nuevos métodos)
```typescript
profileAPI.verifyEmail(token)              // POST /auth/verify-email
profileAPI.resendEmailVerification()       // POST /auth/verify-email/resend
profileAPI.getEmailVerificationStatus()    // GET /auth/verify-email/status
```

### Flujos Habilitados

1. **2FA Login:** Usuario con 2FA habilitado → página /2fa → ingresa código → Dashboard
2. **Email Verification:** Settings → Click Verify → Modal con input → Verificado
3. **User Search:** Friends → Buscar → Resultados del backend
4. **WebSocket:** Notificaciones en tiempo real sin refresh

### Validación

| Check | Resultado |
|-------|-----------|
| TypeScript | ✅ Sin errores nuevos |
| Coherencia con Backend | ✅ Endpoints alineados |

### Impacto

**Antes:**
- 2FA: Mock con código 123456
- Email verification: Botón sin handler
- User search: Solo filtra recomendaciones locales
- WebSocket: Hook existía pero no integrado

**Después:**
- 2FA: Flujo completo con backend
- Email verification: Flujo completo con modal
- User search: Búsqueda real en backend
- WebSocket: Integrado en NotificationsPage

### Referencias

- Documentación: `orchestration/tareas/TASK-001-fix-p0-gaps/`
- Backend: Ver TRAZA-TAREAS-BACKEND.md (TASK-001)
- Commit: `430e2792`

---

*Archivado: 2026-02-11 | Tareas anteriores en `_archive/TRAZA-TAREAS-FRONTEND-HISTORICO.md`*

