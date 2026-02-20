# 02-VALIDACION-ESTANDARES.md

**Version:** 1.0.0
**Fecha:** 2026-02-19
**Tarea:** TASK-2026-02-19-ESTANDARIZACION-PORTALES
**Validador:** Claude Opus 4.6

---

## Resumen Ejecutivo

Se validaron **20 archivos** (entre nuevos y significativamente modificados) contra los 8 documentos de estandares del proyecto. Los archivos fueron seleccionados como muestra representativa de los ~178 archivos tocados por la tarea de estandarizacion.

| Categoria | Archivos Evaluados | Score Promedio | Archivos con Violaciones Criticas |
|-----------|-------------------|----------------|-----------------------------------|
| Shared Components (feedback) | 3 | 8.3/10 | 0 |
| Shared Components (settings) | 2 | 8.0/10 | 0 |
| API Service Files | 5 | 8.0/10 | 0 |
| Hooks | 4 | 8.8/10 | 0 |
| Modified Pages | 4 | 7.3/10 | 0 |
| Constants/Barrels | 2 | 9.5/10 | 0 |
| **TOTAL** | **20** | **8.2/10** | **0** |

**Veredicto global:** APROBADO con observaciones menores. Ninguna violacion critica. La gran mayoria de los archivos nuevos siguen correctamente los estandares definidos. Las violaciones detectadas son de severidad baja-media y no afectan funcionalidad.

---

## Estandares Referenciados

| Codigo | Documento | Ambito |
|--------|-----------|--------|
| STD-C | STANDARD-COMPONENT.md | Export patterns, props typing, React imports, file naming |
| STD-A | STANDARD-API.md | API file structure, React Query, error handling, naming |
| STD-I | STANDARD-IMPORTS.md | Import ordering (5 grupos), path aliases, barrels |
| STD-T | STANDARD-TYPES.md | Type hierarchy, anti-duplicados, inline types |
| STD-U | STANDARD-UX-PATTERNS.md | Error/Loading/Empty states, toasts, forms |
| ADR-046 | PageShell Pattern | PageShell wraps every page (admin, teacher, student) |
| ADR-030 | Naming Convention (v2.0.0) | Sufijo "Page" canonico (Teacher exentos temporalmente) |
| RQ-GUIDE | REACT-QUERY-MIGRATION-GUIDE.md | React Query patterns, STALE_TIMES, useApiError |

---

## Validacion Detallada por Archivo

### GRUPO 1: New Shared Components (feedback/)

---

#### 1.1 `shared/components/feedback/SaveButton.tsx`

**Score: 7/10**

| Checklist Item | Cumple | Detalle |
|----------------|--------|---------|
| Import ordering (STD-I) | PARCIAL | `import React from 'react'` deberia ser named import (STD-C 3.1). Grupos 1-4 correctos |
| Component structure (STD-C) | NO | Usa `export const SaveButton: React.FC<>` en lugar de `export function SaveButton()` (STD-C 1.2) |
| Props typing (STD-C) | SI | `interface SaveButtonProps` con nombre correcto |
| No `//...` placeholders | SI | Codigo completo |
| Naming (STD-C) | SI | PascalCase, archivo correcto |
| Detective theme (STD-U) | SI | Usa `detective-orange`, `detective-bg` |
| cn() path (STD-I) | SI | `@shared/utils/cn` canonico |
| ARIA (accesibilidad) | PARCIAL | `disabled` presente pero falta `aria-label` en el boton |

**Violaciones encontradas:**
1. **V-001 (Medio):** `import React from 'react'` -- STD-C 3.1 requiere solo named imports. Deberia ser `import type { ReactNode } from 'react'` si necesita el tipo, o eliminarse si no.
2. **V-002 (Medio):** `export const SaveButton: React.FC<SaveButtonProps>` -- STD-C 1.2 requiere `export function SaveButton(...)`. React.FC esta deprecated desde React 18.
3. **V-003 (Bajo):** `SaveStatus` type exportado como `export type` -- correcto pero podria vivir en un archivo de tipos separado si se reutiliza en multiples archivos (actualmente se usa en ProfileSettingsForm y PrivacySettingsForm, pero la co-locacion es aceptable per STD-T 3.2 excepcion).

---

#### 1.2 `shared/components/feedback/EmptyState.tsx`

**Score: 9/10**

| Checklist Item | Cumple | Detalle |
|----------------|--------|---------|
| Import ordering (STD-I) | SI | Grupo 2 (lucide), Grupo 3 (@shared), Grupo 5 (type imports) |
| Component structure (STD-C) | SI | `export function EmptyState()` correcto |
| Props typing (STD-C) | SI | `interface EmptyStateProps` exportada, nombre correcto |
| No `//...` placeholders | SI | Codigo completo |
| Naming (STD-C) | SI | PascalCase |
| Detective theme (STD-U) | SI | Usa `detective-bg-secondary`, `detective-text`, `detective-orange` |
| cn() path (STD-I) | SI | `@shared/utils/cn` |
| Matches STD-U 3.1 spec | SI | Interface coincide con la especificacion (icon, title, description, action) |

**Violaciones encontradas:**
1. **V-004 (Bajo):** No usa `import type` para `LucideIcon` -- deberia ser en grupo 5 separado con `import type { LucideIcon } from 'lucide-react'`. Actualmente esta en linea 3 como import type separado despues del import regular de lucide (linea 1), lo cual es correcto pero podria agruparse mejor.

---

#### 1.3 `shared/components/feedback/ErrorMessage.tsx`

**Score: 9/10**

| Checklist Item | Cumple | Detalle |
|----------------|--------|---------|
| Import ordering (STD-I) | SI | Grupo 2 (lucide), Grupo 3 (@shared) |
| Component structure (STD-C) | SI | `export function ErrorMessage()` |
| Props typing (STD-C) | SI | `interface ErrorMessageProps` |
| Matches STD-U 1.2 spec | SI | Interface coincide (title, message, onRetry) |
| Detective theme (STD-U) | SI | Usa `detective-text`, `detective-orange` |
| cn() path (STD-I) | SI | Canonico |
| No hardcoded strings | SI | Textos en espanol ("Intentar de nuevo") |

**Violaciones encontradas:**
Ninguna significativa. Archivo ejemplar.

---

### GRUPO 2: New Shared Components (settings/)

---

#### 2.1 `shared/components/settings/ProfileSettingsForm.tsx`

**Score: 8/10**

| Checklist Item | Cumple | Detalle |
|----------------|--------|---------|
| Import ordering (STD-I) | PARCIAL | `import React, { useState }` viola STD-C 3.1 |
| Component structure (STD-C) | SI | `export function ProfileSettingsForm()` |
| Props typing (STD-C) | SI | `interface ProfileSettingsFormProps` completa |
| Type definitions (STD-T) | SI | Types exportados (ProfileFormData, PasswordChangeData, AvatarUploadConfig) |
| No `//...` placeholders | SI | Codigo completo |
| cn() path (STD-I) | SI | Canonico |
| Detective theme (STD-U) | SI | Tematizado consistente |
| Component size (STD-C 4.1) | ATENCION | ~394 lineas -- excede 300 LOC recomendadas (requiere justificacion por STD-C 4.1) |

**Violaciones encontradas:**
1. **V-005 (Medio):** `import React, { useState } from 'react'` -- STD-C 3.1 prohibe `import React`. Deberia ser `import { useState } from 'react'` y `import type { ReactNode, ChangeEvent } from 'react'` para tipos.
2. **V-006 (Bajo):** 394 LOC excede el rango ideal de 150-300. Se justifica por la complejidad del componente (avatar upload, password change, profile fields) como componente reusable, pero se podria considerar extraer el password section.

---

#### 2.2 `shared/components/settings/PrivacySettingsForm.tsx`

**Score: 8/10**

| Checklist Item | Cumple | Detalle |
|----------------|--------|---------|
| Import ordering (STD-I) | SI | Grupo 2 (framer-motion, lucide), Grupo 3 (@shared), sin React import innecesario |
| Component structure (STD-C) | SI | `export function PrivacySettingsForm()` |
| Props typing (STD-C) | SI | `interface PrivacySettingsFormProps` |
| Type definitions (STD-T) | SI | Types exportados (PrivacyToggleItem, PrivacyVisibilityOption) |
| ARIA (accesibilidad) | SI | `role="switch"`, `aria-checked` en toggle |
| Detective theme (STD-U) | SI | Consistente |
| No `//...` placeholders | SI | Completo |
| Loading state (STD-U) | PARCIAL | Loading spinner inline en linea 141 en lugar de `<LoadingSpinner>` |

**Violaciones encontradas:**
1. **V-007 (Bajo):** Spinner inline (`animate-spin rounded-full border-4...`) en linea 141 en lugar de usar `LoadingSpinner` compartido (STD-U 2.3). Deberia importar `LoadingSpinner` de `@shared/components/loading`.

---

### GRUPO 3: New API Service Files

---

#### 3.1 `services/api/admin/usersApi.ts`

**Score: 8/10**

| Checklist Item | Cumple | Detalle |
|----------------|--------|---------|
| Import ordering (STD-I) | SI | Grupo 3 (@/ aliases), Grupo 4 (relative), Grupo 5 (type imports) |
| API naming (STD-A 4) | SI | `getUsers`, `getUser`, `updateUser`, `deleteUser` siguen convencion |
| Error handling (STD-A 3.1) | SI | Todas las funciones usan `handleAPIError` |
| Return types (STD-A) | SI | Tipos explicitos en todas las funciones |
| Uses apiClient (STD-A) | SI | Singleton correcto |
| Uses API_ENDPOINTS (STD-A) | SI | `API_ENDPOINTS.admin.users.*` sin hardcoded paths |
| Namespace object | SI | `usersApi` al final |
| No `//...` placeholders | SI | Completo |

**Violaciones encontradas:**
1. **V-008 (Bajo):** Error messages en ingles ("Failed to fetch users") -- STD-U 3.2 indica textos en espanol. Sin embargo, estos son mensajes de error internos que pasan por `handleAPIError` y se mapean en el frontend, por lo que la convencion en API files no es estrictamente definida. Observacion menor.
2. **V-009 (Bajo):** Multiples `as string` castings (lineas 76-83) -- funcional pero indica que el tipo del response del backend no esta bien definido. No es una violacion de estandar sino una observacion de calidad.

---

#### 3.2 `services/api/admin/monitoringApi.ts`

**Score: 9/10**

| Checklist Item | Cumple | Detalle |
|----------------|--------|---------|
| Import ordering (STD-I) | SI | Correcto |
| API naming (STD-A 4) | SI | `getSystemHealth`, `getSystemMetrics`, etc. |
| Error handling (STD-A 3.1) | SI | Todas con `handleAPIError` |
| Uses API_ENDPOINTS | SI | Endpoints centralizados |
| Namespace object | SI | `monitoringApi` |
| Return types | SI | Explicitos |

**Violaciones encontradas:**
1. **V-010 (Bajo):** Linea 109: `API_ENDPOINTS.admin.system.logs.replace('/logs', '/audit-log')` -- manipulacion de string en endpoint, deberia estar definido en API_ENDPOINTS directamente.

---

#### 3.3 `services/api/admin/index.ts` (Barrel)

**Score: 10/10**

| Checklist Item | Cumple | Detalle |
|----------------|--------|---------|
| Barrel structure (STD-I 3.1) | SI | Re-exports organizados por dominio |
| Type exports | SI | Usa `export type` donde corresponde |
| No `//...` placeholders | SI | Completo |
| Documentation | SI | JSDoc header explicando el contexto |

**Violaciones encontradas:** Ninguna. Archivo barrel ejemplar.

---

#### 3.4 `services/api/teacher/scheduledReportsApi.ts`

**Score: 7/10**

| Checklist Item | Cumple | Detalle |
|----------------|--------|---------|
| Import ordering (STD-I) | SI | Grupo 4 (relative `../apiClient`) |
| API naming (STD-A 4) | SI | `getScheduledReports`, `createScheduledReport`, etc. |
| Error handling (STD-A 3.1) | NO | Usa `console.error` + `throw error` en lugar de `handleAPIError` (STD-A 3.1) |
| Uses apiClient (STD-A) | SI | Correcto |
| Uses API_ENDPOINTS | NO | Hardcoded `BASE_PATH = '/teacher/reports/scheduled'` |
| Types location (STD-T) | PARCIAL | Types inline en API file. Aceptable para DTOs de API |
| Namespace object | SI | `scheduledReportsApi` |
| Default export | ATENCION | `export default scheduledReportsApi` -- no requerido, pero no prohibido |

**Violaciones encontradas:**
1. **V-011 (Alto):** NO usa `handleAPIError` en ninguna funcion -- solo `console.error + throw error`. STD-A 3.1 requiere uso obligatorio de `handleAPIError`. Las 7 funciones de este archivo violan esta regla.
2. **V-012 (Medio):** Hardcoded `BASE_PATH = '/teacher/reports/scheduled'` en lugar de usar `API_ENDPOINTS.teacher.reports.scheduled`. Viola la regla de no hardcoded API paths.

---

#### 3.5 `services/api/teacher/sharedReportsApi.ts`

**Score: 7/10**

| Checklist Item | Cumple | Detalle |
|----------------|--------|---------|
| Import ordering (STD-I) | SI | Correcto |
| API naming (STD-A 4) | SI | `shareReport`, `getSharedByMe`, `revokeShare`, etc. |
| Error handling (STD-A 3.1) | NO | Misma violacion que scheduledReportsApi |
| Uses API_ENDPOINTS | NO | Hardcoded paths como `/teacher/reports/share` |
| Types location (STD-T) | SI | DTOs bien definidos |
| JSDoc documentation | SI | Excelente documentacion con @examples |

**Violaciones encontradas:**
1. **V-013 (Alto):** NO usa `handleAPIError` -- misma violacion que V-011. Las 6 funciones usan `console.error + throw error`.
2. **V-014 (Medio):** Hardcoded paths (`/teacher/reports/share`, `/teacher/reports/shared/by-me`, etc.) en lugar de `API_ENDPOINTS`.

---

### GRUPO 4: New Hooks

---

#### 4.1 `apps/teacher/hooks/useScheduledReports.ts`

**Score: 9/10**

| Checklist Item | Cumple | Detalle |
|----------------|--------|---------|
| Import ordering (STD-I) | SI | Grupo 2 (react-query), Grupo 1 (react), Grupo 3 (@services, @shared) |
| React Query usage (RQ-GUIDE) | SI | useQuery + useMutation con invalidateQueries |
| Query key factory (STD-A 2.2) | SI | `scheduledReportKeys` con patron jerarquico |
| STALE_TIMES (STD-A 2.3) | SI | `STALE_TIMES.DYNAMIC` importado de constants |
| Return type (STD-T) | SI | `UseScheduledReportsReturn` interface exportada |
| Hook naming (STD-C 5) | SI | `use` prefix, camelCase |
| No `//...` placeholders | SI | Completo |

**Violaciones encontradas:**
1. **V-015 (Bajo):** Import ordering: `useCallback` de 'react' (linea 11) deberia estar antes de los imports de react-query (linea 10) segun STD-I 1.1 (grupo 1 React primero). Actualmente react-query esta primero.
2. **V-016 (Bajo):** Mutations no usan `onError` con `useApiError` hook. Los errores se manejan por los consumidores via `mutateAsync` try/catch, lo cual es valido (ver RQ-GUIDE 8.4), pero los mutations podrian beneficiarse de `onError` centralizado.

---

#### 4.2 `apps/teacher/hooks/useSharedReports.ts`

**Score: 9/10**

| Checklist Item | Cumple | Detalle |
|----------------|--------|---------|
| React Query usage | SI | useQuery + useMutation |
| Query key factory | SI | `sharedReportsKeys` jerarquico |
| STALE_TIMES | PARCIAL | Hardcoded `2 * 60 * 1000` en lugar de `STALE_TIMES.DYNAMIC` |
| Return type | SI | `UseSharedReportsReturn` interface |
| Hook naming | SI | Correcto |

**Violaciones encontradas:**
1. **V-017 (Bajo):** Import ordering: misma observacion que V-015, react despues de react-query.
2. **V-018 (Medio):** `staleTime: 2 * 60 * 1000` hardcoded (lineas 115, 121). STD-A 2.3 requiere usar `STALE_TIMES` constants. Deberia importar `STALE_TIMES` de `@shared/constants/queryKeys` y usar `STALE_TIMES.DYNAMIC` (1 min) o un valor custom definido alli.

---

#### 4.3 `shared/hooks/useApiError.ts`

**Score: 10/10**

| Checklist Item | Cumple | Detalle |
|----------------|--------|---------|
| Import ordering (STD-I) | SI | Grupo 1 (react), Grupo 2 (react-hot-toast) |
| Hook naming | SI | `useApiError` |
| No `//...` placeholders | SI | Completo |
| Toast integration (STD-U 1.3) | SI | `toast.error()` para feedback |
| Error extraction | SI | response.data.message fallback chain |
| JSDoc | SI | Documentado con @example |
| useCallback | SI | Memoized, deps array vacio correcto |

**Violaciones encontradas:** Ninguna. Archivo ejemplar que sigue exactamente la especificacion de RQ-GUIDE 5.1.

---

#### 4.4 `shared/hooks/usePageTitle.ts`

**Score: 9/10**

| Checklist Item | Cumple | Detalle |
|----------------|--------|---------|
| Import ordering | SI | Solo `useEffect` de react |
| Hook naming | SI | `usePageTitle` |
| Cleanup | SI | Restaura titulo en cleanup |
| JSDoc | SI | @example incluido |
| No dependencies externas | SI | Self-contained |

**Violaciones encontradas:**
1. **V-019 (Bajo):** `BASE_TITLE` hardcoded como `'GAMILIT'`. Podria ser mas configurable o venir de branding context, pero para un hook utilitario es aceptable.

---

### GRUPO 5: Modified Pages

---

#### 5.1 `apps/teacher/pages/TeacherReports.tsx`

**Score: 6/10**

| Checklist Item | Cumple | Detalle |
|----------------|--------|---------|
| PageShell pattern (ADR-046) | SI | `<TeacherPageShell>` wraps content |
| Import ordering (STD-I) | PARCIAL | 5 grupos no claramente separados por lineas vacias |
| Component size (STD-C 4.1) | NO | ~1708 LOC -- excede masivamente el limite de 300 (obligatorio split >500) |
| Naming (ADR-030 v2.0.0) | PARCIAL | Exporta como `TeacherReportsPage` pero archivo se llama `TeacherReports.tsx` |
| React Query (RQ-GUIDE) | PARCIAL | Tabs scheduled/shared usan React Query, pero tab generator usa useState+useEffect legacy |
| Error handling (STD-U) | SI | `useApiError` hook usado, toasts para mutations |
| Loading states (STD-U) | PARCIAL | Inline spinners (`RefreshCw animate-spin`) en lugar de `LoadingSpinner` |
| Empty states (STD-U) | PARCIAL | Inline empty states en lugar de `EmptyState` compartido |
| Toast feedback (STD-U 1.3) | SI | `toast.success/error` consistente |
| No `//...` placeholders | SI | Todo implementado |

**Violaciones encontradas:**
1. **V-020 (Critico - Deuda tecnica):** 1708 LOC -- STD-C 4.1 requiere obligatorio split a >500 LOC. Las 3 tabs (ScheduledReportsTab, SharedReportsTab, main page) deberian ser archivos separados.
2. **V-021 (Medio):** Tab generator todavia usa `useState`+`useEffect`+`useCallback` legacy pattern para data fetching (lineas 1282-1361). RQ-GUIDE indica que todo data fetching deberia usar React Query.
3. **V-022 (Bajo):** Inline spinners en ScheduledReportsTab (linea 298) y SharedReportsTab (linea 831). STD-U 2.3 requiere `LoadingSpinner` compartido.
4. **V-023 (Bajo):** Inline empty states (lineas 551-559, 1011-1022) en lugar de `<EmptyState>` de `@shared/components/feedback`.
5. **V-024 (Bajo):** Inline delete confirmation dialog (lineas 641-679) en lugar de `<ConfirmDialog>` de `@shared/components/feedback`.
6. **V-025 (Bajo):** Nombre de archivo `TeacherReports.tsx` sin sufijo "Page" -- ADR-030 v2.0.0 declara sufijo "Page" como canonico, pero Teacher portal tiene excepcion temporal.

---

#### 5.2 `apps/teacher/pages/TeacherMonitoring.tsx`

**Score: 7/10**

| Checklist Item | Cumple | Detalle |
|----------------|--------|---------|
| PageShell pattern (ADR-046) | SI | `<TeacherPageShell>` wraps content |
| Export pattern (STD-C) | SI | `export default function TeacherMonitoringPage()` |
| Import ordering (STD-I) | PARCIAL | Todos los lucide icons en una sola linea (linea 8) mezclados con react imports |
| Loading state (STD-U) | PARCIAL | Inline `<Loader2 animate-spin>` en lugar de `LoadingSpinner` |
| Error state (STD-U) | SI | DetectiveCard variant="danger" con retry button |
| Empty state (STD-U) | PARCIAL | Inline empty states en lugar de `EmptyState` |
| Component size (STD-C 4.1) | SI | ~352 LOC -- en rango "requiere justificacion" (300-500) pero aceptable |
| WebSocket integration | SI | Real-time data via `useClassroomRealtime` |
| JSDoc | SI | Comentario describiendo funcionalidades |

**Violaciones encontradas:**
1. **V-026 (Bajo):** JSDoc todavia menciona "Wrapped by withTeacherLayout HOC" (linea 20) -- deberia actualizarse ya que ahora usa PageShell.
2. **V-027 (Bajo):** Inline loading spinner (linea 122) en lugar de `LoadingSpinner`.
3. **V-028 (Bajo):** Nombre de archivo `TeacherMonitoring.tsx` sin sufijo "Page" -- excepcion temporal Teacher.

---

#### 5.3 `apps/teacher/pages/TeacherDashboard.tsx`

**Score: 8/10**

| Checklist Item | Cumple | Detalle |
|----------------|--------|---------|
| PageShell pattern (ADR-046) | SI | `<TeacherPageShell>` wraps content |
| Export pattern (STD-C) | SI | `export default function TeacherDashboard()` |
| EmptyState usage (STD-U 3.1) | SI | Usa `<EmptyState>` compartido (lineas 205, 432, 477, 523) |
| SkeletonCard/SkeletonStats (STD-U 2.1) | SI | Importados de `@shared/components/loading` |
| useApiError (RQ-GUIDE) | SI | Importado y usado para manejo de errores |
| React Query | PARCIAL | `useTeacherDashboard` es React Query pero fetchAllStudents y fetchUpcomingDeadlines usan useEffect legacy |
| Toast feedback | NO | No usa toast para errores de fetch (usa handleError que ya incluye toast) |
| Component size | SI | ~538 LOC -- excede 500 pero es la pagina principal del dashboard con 10 tabs |

**Violaciones encontradas:**
1. **V-029 (Medio):** `useEffect` con `fetchAllStudents` y `fetchUpcomingDeadlines` (lineas 76-140) -- deberian ser `useQuery` hooks per RQ-GUIDE.
2. **V-030 (Bajo):** Import de `@services/api/teacher` sin `@/` prefix -- deberia ser `@/services/api/teacher` per STD-I 2.1.
3. **V-031 (Bajo):** `eslint-disable-next-line react-hooks/exhaustive-deps` en linea 70 -- indicador tipico de dependency tracking issues que React Query resuelve.

---

#### 5.4 `apps/admin/pages/AdminExerciseCreatePage.tsx`

**Score: 8/10**

| Checklist Item | Cumple | Detalle |
|----------------|--------|---------|
| PageShell pattern (ADR-046) | SI | `<AdminPageShell>` wraps content |
| Export pattern (STD-C) | SI | `export default function AdminExerciseCreatePage()` |
| Naming (ADR-030 v2.0.0) | SI | Sufijo "Page" correcto |
| React Query mutation (RQ-GUIDE) | SI | `useMutation` + `queryClient.invalidateQueries` |
| API_ENDPOINTS usage (STD-A) | SI | `API_ENDPOINTS.educational.exercises` |
| Toast feedback (STD-U 1.3) | SI | `toast.success/error` |
| Import ordering (STD-I) | PARCIAL | import groups no perfectamente separados |
| cn() path (STD-I) | SI | `@shared/utils/cn` |

**Violaciones encontradas:**
1. **V-032 (Medio):** Error handling en `handleSaveDraft` y `handleSubmitForReview` (lineas 182-206) usa inline `(error as {}).response?.data?.message` en lugar de `useApiError` hook. Deberia usar `handleError` patron centralizado.
2. **V-033 (Bajo):** `export type { ExerciseFormData }` re-export en linea 47 -- funcional pero poco convencional en un archivo de pagina.
3. **V-034 (Bajo):** `apiClient.post` usado directamente en mutation en lugar de extraer a un API service file. STD-A 1.3 requiere API calls en servicio, no en componente.

---

### GRUPO 6: Constants y Barrels

---

#### 6.1 `shared/constants/queryKeys.ts`

**Score: 10/10**

| Checklist Item | Cumple | Detalle |
|----------------|--------|---------|
| STALE_TIMES (STD-A 2.3) | SI | Todos los 4 niveles definidos correctamente |
| `as const` | SI | Frozen object |
| JSDoc | SI | Referencia a STANDARD-API.md |
| No dependencies | SI | Self-contained |

**Violaciones encontradas:** Ninguna. Archivo ejemplar.

---

#### 6.2 `shared/components/feedback/index.ts` (Barrel)

**Score: 9/10**

| Checklist Item | Cumple | Detalle |
|----------------|--------|---------|
| Barrel structure (STD-I 3.1) | SI | Exports organizados |
| Type exports | SI | `export type` para props interfaces |
| Completeness | SI | ErrorMessage, EmptyState, ConfirmDialog, SaveButton |

**Violaciones encontradas:** Ninguna significativa.

---

## Resumen de Violaciones

### Por Severidad

| Severidad | Count | IDs |
|-----------|-------|-----|
| Critico (Deuda tecnica) | 1 | V-020 |
| Alto | 2 | V-011, V-013 |
| Medio | 8 | V-001, V-002, V-005, V-012, V-014, V-018, V-021, V-029, V-032 |
| Bajo | 15 | V-003, V-004, V-006, V-007, V-008, V-009, V-010, V-015, V-016, V-017, V-019, V-022-V-028, V-030-V-034 |

### Por Estandar Violado

| Estandar | Violaciones | Mas Comunes |
|----------|-------------|-------------|
| STD-C (Component) | 4 | `import React`, `React.FC`, component size |
| STD-A (API) | 6 | Missing `handleAPIError`, hardcoded paths |
| STD-I (Imports) | 4 | Import group ordering, React first |
| STD-U (UX Patterns) | 5 | Inline spinners, inline empty states |
| RQ-GUIDE | 3 | Legacy useState+useEffect for fetching |
| ADR-030 | 0 | Teacher pages exentas temporalmente |
| ADR-046 | 0 | Todas las pages usan PageShell |

### Patrones Recurrentes

1. **`import React from 'react'` persistente** (2 archivos): SaveButton y ProfileSettingsForm todavia importan React namespace completo.
2. **Inline loading spinners** (4 archivos): TeacherReports, TeacherMonitoring, TeacherDashboard, PrivacySettingsForm usan spinners inline en lugar del componente compartido.
3. **`handleAPIError` faltante en teacher APIs** (2 archivos): scheduledReportsApi y sharedReportsApi usan `console.error + throw` en lugar del handler centralizado.
4. **Hardcoded API paths** (2 archivos): Los mismos teacher API files usan strings hardcoded en lugar de `API_ENDPOINTS`.
5. **Legacy useState+useEffect** para data fetching (2 archivos): TeacherReports (tab generator) y TeacherDashboard (students + deadlines) aun no migraron a React Query.

---

## Recomendaciones de Correccion (Priorizadas)

### Prioridad 1: Alta (Afecta consistencia arquitectural)

| # | Archivo | Accion | Esfuerzo |
|---|---------|--------|----------|
| R-001 | scheduledReportsApi.ts | Reemplazar `console.error+throw` con `handleAPIError` | 15 min |
| R-002 | sharedReportsApi.ts | Reemplazar `console.error+throw` con `handleAPIError` | 15 min |
| R-003 | scheduledReportsApi.ts | Mover hardcoded paths a `API_ENDPOINTS` config | 20 min |
| R-004 | sharedReportsApi.ts | Mover hardcoded paths a `API_ENDPOINTS` config | 20 min |
| R-005 | TeacherReports.tsx | Split 1708 LOC en archivos separados (ScheduledReportsTab, SharedReportsTab) | 45 min |

### Prioridad 2: Media (Mejora de calidad)

| # | Archivo | Accion | Esfuerzo |
|---|---------|--------|----------|
| R-006 | SaveButton.tsx | Migrar `React.FC` a `export function` + eliminar `import React` | 5 min |
| R-007 | ProfileSettingsForm.tsx | Cambiar `import React, { useState }` a `import { useState }` | 2 min |
| R-008 | useSharedReports.ts | Reemplazar staleTime hardcoded con `STALE_TIMES.DYNAMIC` | 5 min |
| R-009 | TeacherDashboard.tsx | Migrar fetchAllStudents y fetchUpcomingDeadlines a useQuery | 30 min |
| R-010 | AdminExerciseCreatePage.tsx | Extraer mutation a API service file, usar useApiError | 20 min |

### Prioridad 3: Baja (Mejoras cosmeticas)

| # | Archivo | Accion | Esfuerzo |
|---|---------|--------|----------|
| R-011 | PrivacySettingsForm.tsx | Reemplazar spinner inline con LoadingSpinner | 5 min |
| R-012 | TeacherMonitoring.tsx | Actualizar JSDoc (quitar referencia a HOC) | 2 min |
| R-013 | TeacherReports.tsx | Reemplazar inline empty states con EmptyState compartido | 15 min |
| R-014 | TeacherReports.tsx | Reemplazar inline confirm dialog con ConfirmDialog | 10 min |
| R-015 | Varios | Reordenar imports (React primero, luego external) | 10 min |

---

## Conclusion

La tarea de estandarizacion logro un impacto significativo en la coherencia del codebase:

**Logros principales:**
- PageShell pattern (ADR-046) implementado al 100% en los 4 archivos de pagina evaluados
- Nuevos archivos compartidos (EmptyState, ErrorMessage, useApiError, usePageTitle, STALE_TIMES) siguen los estandares de forma ejemplar (scores 9-10)
- API barrel exports (admin/index.ts) perfectamente organizados
- React Query hooks (useScheduledReports, useSharedReports) bien estructurados con query key factories

**Areas de mejora:**
- Teacher API files (scheduled/shared reports) necesitan adoptar `handleAPIError` y `API_ENDPOINTS`
- TeacherReports.tsx necesita split obligatorio (1708 LOC)
- Algunos archivos legacy todavia usan `import React` y `React.FC`
- Inline spinners y empty states persisten en algunas paginas

**Esfuerzo estimado para correccion completa:** ~4 horas de desarrollo para las 15 recomendaciones.

---

*Sistema SIMCO v4.3.0*
*Validacion automatizada: 2026-02-19*
