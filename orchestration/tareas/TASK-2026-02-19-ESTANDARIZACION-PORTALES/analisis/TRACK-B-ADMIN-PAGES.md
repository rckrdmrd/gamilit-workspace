# Track B: Analisis Pagina-por-Pagina -- Portal Admin

**Fecha:** 2026-02-19
**Archivos analizados:** 19 pages, 32 hooks, 2 type files, 1 monolith API (adminAPI.ts)
**Analista:** Claude Opus 4.6 (agente de analisis)

---

## Resumen Ejecutivo

El Portal Admin consta de 19 paginas, de las cuales **18 usan AdminPageShell** correctamente (1 excepcion: `AdminExerciseCreatePage`). La mayoria de paginas fueron refactorizadas en Sprint 1 (2026-02-18) hacia un patron mas consistente, pero persisten divergencias significativas en data fetching, error handling, loading states, temas de estilo (detective vs gray-scale), y accesibilidad.

**Hallazgos principales:**
- **adminAPI.ts monolito:** 1,818 lineas, 77 funciones -- necesita splitting urgente
- **Data fetching legacy:** 13/19 paginas usan `useState+useEffect` en lugar de React Query
- **Hooks duplicados:** `useSystemMonitoring` vs `useMonitoring` vs `useSystemMetrics` (3 hooks solapados para metricas/salud)
- **AdminTabBar vs shared TabBar:** Funcionalidad duplicada con diferencias en accesibilidad (shared TabBar tiene keyboard nav, AdminTabBar no)
- **Theme inconsistency:** 2 paginas (RolesPage, ReportsPage) usan gray-scale en lugar de detective theme
- **Toast ad-hoc:** 5+ paginas implementan toast inline en lugar de usar `ToastContainer`/`useToast` compartido
- **Empty states:** Solo 1 pagina usa shared `EmptyState` -- 4 paginas tienen inline empty state, 14 no tienen ninguno

**Score promedio:** 6.3/10

---

## Matriz de Evaluacion

Escala por criterio: OK = cumple, PARCIAL = cumple parcialmente, FALTA = no cumple

| # | Pagina | Layout | Export | Data Fetch | Error | Loading | Empty | Shared | Types | Imports | A11y | Score |
|---|--------|--------|--------|------------|-------|---------|-------|--------|-------|---------|------|-------|
| 1 | AdminDashboardPage | OK | OK | PARCIAL | PARCIAL | FALTA | FALTA | OK | OK | PARCIAL | FALTA | 5/10 |
| 2 | AdminUsersPage | OK | OK | PARCIAL | PARCIAL | FALTA | FALTA | OK | OK | PARCIAL | FALTA | 5/10 |
| 3 | AdminContentPage | OK | OK | OK | PARCIAL | FALTA | FALTA | OK | OK | OK | PARCIAL | 7/10 |
| 4 | AdminSettingsPage | OK | OK | OK | FALTA | FALTA | FALTA | OK | OK | PARCIAL | PARCIAL | 6/10 |
| 5 | AdminAnalyticsPage | OK | OK | PARCIAL | PARCIAL | PARCIAL | FALTA | OK | OK | PARCIAL | PARCIAL | 6/10 |
| 6 | AdminReportsPage | OK | OK | PARCIAL | PARCIAL | FALTA | FALTA | PARCIAL | OK | PARCIAL | FALTA | 4/10 |
| 7 | AdminGamificationPage | OK | OK | OK | OK | OK | FALTA | OK | OK | OK | PARCIAL | 8/10 |
| 8 | AdminAuditLogsPage | OK | OK | PARCIAL | PARCIAL | FALTA | FALTA | OK | OK | PARCIAL | FALTA | 5/10 |
| 9 | AdminAdvancedPage | OK | OK | OK | FALTA | FALTA | FALTA | OK | FALTA | PARCIAL | FALTA | 5/10 |
| 10 | AdminMonitoringPage | OK | OK | PARCIAL | FALTA | FALTA | FALTA | OK | FALTA | OK | PARCIAL | 5/10 |
| 11 | AdminAlertsPage | OK | OK | PARCIAL | PARCIAL | FALTA | FALTA | OK | OK | PARCIAL | FALTA | 5/10 |
| 12 | AdminProgressPage | OK | OK | PARCIAL | OK | FALTA | FALTA | OK | FALTA | PARCIAL | FALTA | 5/10 |
| 13 | AdminNotifPrefsPage | OK | OK | PARCIAL | PARCIAL | PARCIAL | FALTA | PARCIAL | FALTA | FALTA | FALTA | 4/10 |
| 14 | AdminAssignmentsPage | OK | OK | OK | PARCIAL | PARCIAL | FALTA | OK | OK | PARCIAL | FALTA | 6/10 |
| 15 | AdminClassroomTeacher | OK | OK | OK | FALTA | FALTA | FALTA | PARCIAL | FALTA | PARCIAL | FALTA | 4/10 |
| 16 | AdminNotificationsPage | OK | OK | PARCIAL | PARCIAL | PARCIAL | OK | PARCIAL | FALTA | PARCIAL | FALTA | 5/10 |
| 17 | AdminExerciseCreatePage | FALTA | OK | FALTA | FALTA | FALTA | FALTA | PARCIAL | OK | PARCIAL | FALTA | 3/10 |
| 18 | AdminInstitutionsPage | OK | OK | PARCIAL | PARCIAL | FALTA | FALTA | OK | OK | OK | FALTA | 6/10 |
| 19 | AdminRolesPage | OK | OK | PARCIAL | PARCIAL | OK | OK | PARCIAL | OK | PARCIAL | FALTA | 6/10 |

**Promedio:** 5.2/10 | **Mediana:** 5/10 | **Rango:** 3-8

---

## Hallazgos Detallados por Pagina

### 1. AdminDashboardPage (88 lineas)

**Archivo:** `apps/frontend/src/apps/admin/pages/AdminDashboardPage.tsx`

| Criterio | Estado | Detalle |
|----------|--------|---------|
| Layout | OK | Usa `AdminPageShell` |
| Export | OK | `export default function` |
| Data Fetch | PARCIAL | `useAdminDashboard` hook usa useState+useEffect+setInterval internamente, no React Query |
| Error | PARCIAL | Muestra error en `DetectiveCard` con div rojo inline -- no usa `useApiError` ni componente compartido |
| Loading | FALTA | Spinner inline: `<div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-detective-orange">` -- no usa `LoadingSpinner` compartido |
| Empty | FALTA | No tiene estado vacio para cuando metrics es null/empty |
| Shared | OK | Importa correctamente de `@shared/components/base/` |
| Types | OK | Usa tipos de `../types` (portal-level) |
| Imports | PARCIAL | Mezcla imports: lucide-react esta entre los component imports, no agrupado con external libs |
| A11y | FALTA | Sin roles ARIA, boton refresh sin aria-label |

**Notas adicionales:**
- `useEffect(() => { refreshAll(); }, [refreshAll])` en linea 22-24 causa llamada doble porque `useAdminDashboard` ya hace `refreshAll()` internamente en su propio useEffect

---

### 2. AdminUsersPage (137 lineas)

**Archivo:** `apps/frontend/src/apps/admin/pages/AdminUsersPage.tsx`

| Criterio | Estado | Detalle |
|----------|--------|---------|
| Layout | OK | Usa `AdminPageShell` |
| Export | OK | `export default function` |
| Data Fetch | PARCIAL | `useUserManagement` hook usa useState+useEffect, no React Query. Manual debounce con setTimeout |
| Error | PARCIAL | Error inline con div rojo dentro de DetectiveCard |
| Loading | FALTA | Loading delegado a `UsersTable` sin indicador de carga visible a nivel pagina |
| Empty | FALTA | No maneja caso 0 usuarios explicitamente |
| Shared | OK | Importa FeatureBadge, ConfirmDialog, ToastContainer de shared |
| Types | OK | `SystemUser` from `../types` |
| Imports | PARCIAL | `lucide-react` mezclado al final despues de component imports |
| A11y | FALTA | Sin roles ARIA, sin navegacion por teclado en tabla |

**Notas adicionales:**
- Manual debounce con 3 useEffects encadenados (lineas 43-50) -- deberia usar un hook `useDebounce`
- `eslint-disable-next-line react-hooks/exhaustive-deps` en linea 49

---

### 3. AdminContentPage (137 lineas)

**Archivo:** `apps/frontend/src/apps/admin/pages/AdminContentPage.tsx`

| Criterio | Estado | Detalle |
|----------|--------|---------|
| Layout | OK | Usa `AdminPageShell` |
| Export | OK | `export default function` |
| Data Fetch | OK | `usePendingExercisesQuery` usa React Query internamente |
| Error | PARCIAL | Solo `console.error` en handleApproveFromPreview -- no muestra feedback visual al usuario |
| Loading | FALTA | No hay indicador de carga a nivel pagina |
| Empty | FALTA | Delegado a tab components |
| Shared | OK | Usa AdminTabBar, AdminPageShell correctamente |
| Types | OK | Importa AdminTab, PendingExercise de tipos correctos |
| Imports | OK | Sigue orden correcto: react, components, hooks, icons, types |
| A11y | PARCIAL | AdminTabBar provee `role="tablist"` y `aria-selected` |

**Notas adicionales:**
- Buen ejemplo de pagina bien refactorizada -- tabs como componentes autonomos
- Falta feedback visual al usuario en caso de error en approve/reject

---

### 4. AdminSettingsPage (101 lineas)

**Archivo:** `apps/frontend/src/apps/admin/pages/AdminSettingsPage.tsx`

| Criterio | Estado | Detalle |
|----------|--------|---------|
| Layout | OK | Usa `AdminPageShell` |
| Export | OK | `export default function` |
| Data Fetch | OK | Delegado a sub-componentes (GeneralSettings, SecuritySettings, ProfileSettings) |
| Error | FALTA | No maneja errores a nivel pagina -- delegado completamente a sub-componentes |
| Loading | FALTA | No tiene loading state a nivel pagina |
| Empty | FALTA | No tiene empty state |
| Shared | OK | Usa AdminTabBar, DetectiveCard correctamente |
| Types | OK | `AdminTab<TabType>` definido correctamente |
| Imports | PARCIAL | `AlertTriangle` importado de lucide pero mezclado con components |
| A11y | PARCIAL | AdminTabBar provee semantics basicos |

**Notas adicionales:**
- Pagina limpia, bien delegada a sub-componentes
- `renderTabContent()` con switch usa patron correcto
- Warning footer con DetectiveCard es buena practica UX

---

### 5. AdminAnalyticsPage (216 lineas)

**Archivo:** `apps/frontend/src/apps/admin/pages/AdminAnalyticsPage.tsx`

| Criterio | Estado | Detalle |
|----------|--------|---------|
| Layout | OK | Usa `AdminPageShell` |
| Export | OK | `export default function` |
| Data Fetch | PARCIAL | `useAnalytics` hook usa useState+useEffect con Promise.all, no React Query |
| Error | PARCIAL | Error inline con div rojo, no usa componente compartido |
| Loading | PARCIAL | Usa `RefreshCw` con animate-spin dentro de DetectiveCard -- no usa LoadingSpinner compartido pero es razonablemente visible |
| Empty | FALTA | No maneja caso sin datos en ninguna tab |
| Shared | OK | Importa de `@shared/components/base/` |
| Types | OK | Usa `AdminTab<TabType>` tipado |
| Imports | PARCIAL | Secciones marcadas con `// Components`, `// Icons`, `// Types` pero lucide-react separado de react |
| A11y | PARCIAL | AdminTabBar con cards variant provee ARIA basico |

**Notas adicionales:**
- **Toast ad-hoc:** Implementa toast con useState + useEffect para auto-dismiss (lineas 51-87) en vez de usar `useToast` compartido
- Badge tooltips en tabs ("Datos limitados", "Beta") son buena practica UX

---

### 6. AdminReportsPage (195 lineas)

**Archivo:** `apps/frontend/src/apps/admin/pages/AdminReportsPage.tsx`

| Criterio | Estado | Detalle |
|----------|--------|---------|
| Layout | OK | Usa `AdminPageShell` |
| Export | OK | `export default function` |
| Data Fetch | PARCIAL | `useReports` hook no es React Query, usa useState+useEffect |
| Error | PARCIAL | Muestra error con div rojo inline con AlertCircle icon |
| Loading | FALTA | Delegado a `ReportsList` component |
| Empty | FALTA | No tiene empty state explicito |
| Shared | PARCIAL | Usa `cn` de shared pero estilos son `text-gray-900 dark:text-white` (NO detective theme!) |
| Types | OK | Importa `GenerateReportParams` de `@/services/api/adminTypes` |
| Imports | PARCIAL | `cn` mezclado con component imports |
| A11y | FALTA | Sin roles ARIA, sin navegacion accesible |

**Notas adicionales:**
- **CRITICO: Theme inconsistency** -- Usa `text-gray-900 dark:text-white`, `text-gray-600 dark:text-gray-400` en lugar de `text-detective-text`, `text-detective-text-secondary`. Esto rompe la consistencia visual con las demas paginas admin
- **Toast ad-hoc** con CheckCircle/XCircle icons en vez de ToastContainer compartido

---

### 7. AdminGamificationPage (227 lineas)

**Archivo:** `apps/frontend/src/apps/admin/pages/AdminGamificationPage.tsx`

| Criterio | Estado | Detalle |
|----------|--------|---------|
| Layout | OK | Usa `AdminPageShell` |
| Export | OK | `export default function` |
| Data Fetch | OK | `useGamificationConfig` usa React Query hooks internamente (useParameters, useMayaRanks, useStats) |
| Error | OK | Muestra pantalla completa de error con boton reintentar cuando `hasErrors` |
| Loading | OK | Pantalla completa de loading con Loader2 spinner |
| Empty | FALTA | No maneja caso de datos vacios en tabs individuales |
| Shared | OK | Importa de `@shared/components/base/` correctamente |
| Types | OK | Importa tipos de `@/services/api/schemas/adminSchemas` |
| Imports | OK | Buen orden: hook, shell, tab, components, icons, types |
| A11y | PARCIAL | AdminTabBar con ARIA basico, modales probablemente accesibles |

**Notas adicionales:**
- **Mejor pagina del portal** -- usa React Query, tiene loading/error states completos, modales bien organizados con estado centralizado
- Patron `INITIAL_MODAL_STATE` para multiples modales es limpio y reutilizable
- Usa `window.location.reload()` para reintentar -- deberia usar invalidateQueries en su lugar

---

### 8. AdminAuditLogsPage (203 lineas)

**Archivo:** `apps/frontend/src/apps/admin/pages/AdminAuditLogsPage.tsx`

| Criterio | Estado | Detalle |
|----------|--------|---------|
| Layout | OK | Usa `AdminPageShell` |
| Export | OK | `export default function` |
| Data Fetch | PARCIAL | `useAuditLogs` hook -- parece custom pero no React Query |
| Error | PARCIAL | Error delegado a `AuditLogTable` component |
| Loading | FALTA | Delegado a `AuditLogTable` |
| Empty | FALTA | Delegado a `AuditLogTable` |
| Shared | OK | Importa DetectiveButton, downloadCSV de shared |
| Types | OK | Importa AuditLogFilters, AuditLogEntry de adminTypes |
| Imports | PARCIAL | `motion` de framer-motion importado innecesariamente |
| A11y | FALTA | Sin roles ARIA en pagina principal, boton X para cerrar toast sin aria-label |

**Notas adicionales:**
- `motion.div` para toast animation pero `framer-motion` es overhead si solo se usa para fade-in/out de un toast
- **Toast ad-hoc** en vez de usar componente compartido
- `CSV_HEADERS` definido como constante fuera del componente -- buena practica

---

### 9. AdminAdvancedPage (108 lineas)

**Archivo:** `apps/frontend/src/apps/admin/pages/AdminAdvancedPage.tsx`

| Criterio | Estado | Detalle |
|----------|--------|---------|
| Layout | OK | Usa `AdminPageShell` |
| Export | OK | `export default function` |
| Data Fetch | OK | Delegado a `FeatureFlagsPanel` y `ABTestingDashboard` |
| Error | FALTA | No maneja errores a nivel pagina |
| Loading | FALTA | No tiene loading state |
| Empty | FALTA | Placeholders para features futuras pero no empty state formal |
| Shared | OK | Usa FeatureBadge, DetectiveCard, UnderConstruction de shared |
| Types | FALTA | No importa tipos -- inline no-types component |
| Imports | PARCIAL | `lucide-react` agrupado correctamente |
| A11y | FALTA | Sin roles ARIA, cards placeholder sin semantica |

**Notas adicionales:**
- `SHOW_CONTENT = true` constante como feature flag -- deberia usar el propio sistema de feature flags del backend
- Dead code path: el else branch con `UnderConstruction` nunca se ejecuta

---

### 10. AdminMonitoringPage (109 lineas)

**Archivo:** `apps/frontend/src/apps/admin/pages/AdminMonitoringPage.tsx`

| Criterio | Estado | Detalle |
|----------|--------|---------|
| Layout | OK | Usa `AdminPageShell` |
| Export | OK | `export default function` |
| Data Fetch | PARCIAL | Usa `useMonitoring` y `useAlerts` -- ambos son useState+useEffect, no React Query |
| Error | FALTA | No muestra errores en la pagina -- errores solo en console.error |
| Loading | FALTA | No tiene loading state a nivel pagina |
| Empty | FALTA | No maneja tabs vacios |
| Shared | OK | Importa de shared correctamente |
| Types | FALTA | No importa tipos explicitamente (usa tipos de hooks) |
| Imports | OK | Buen orden de imports |
| A11y | PARCIAL | AdminTabBar con ARIA basico |

**Notas adicionales:**
- Instancia ambos `useMonitoring` y `useAlerts` -- `useAlerts` se usa tambien en `AdminAlertsPage`, potencial de data duplication si ambas paginas estan montadas

---

### 11. AdminAlertsPage (188 lineas)

**Archivo:** `apps/frontend/src/apps/admin/pages/AdminAlertsPage.tsx`

| Criterio | Estado | Detalle |
|----------|--------|---------|
| Layout | OK | Usa `AdminPageShell` |
| Export | OK | `export default function` |
| Data Fetch | PARCIAL | `useAlerts` hook usa useState+useEffect, no React Query |
| Error | PARCIAL | Muestra error inline con div rojo |
| Loading | FALTA | Loading delegado a subcomponentes |
| Empty | FALTA | Delegado a AlertsList |
| Shared | OK | Importa DetectiveButton de shared |
| Types | OK | Importa SystemAlert de adminTypes |
| Imports | PARCIAL | `// Components`, `// Icons`, `// Types` separadores OK pero lucide separado |
| A11y | FALTA | `window.confirm()` nativo para suprimir alerta -- no accesible, no themed |

**Notas adicionales:**
- `window.confirm()` en `handleSuppress` (linea 82-92) es anti-patron -- deberia usar `ConfirmDialog` compartido
- Modales bien separados (details, acknowledge, resolve)

---

### 12. AdminProgressPage (290 lineas)

**Archivo:** `apps/frontend/src/apps/admin/pages/AdminProgressPage.tsx`

| Criterio | Estado | Detalle |
|----------|--------|---------|
| Layout | OK | Usa `AdminPageShell` |
| Export | OK | `export default function` |
| Data Fetch | PARCIAL | `useProgress` y `useClassroomsList` -- useState+useEffect, no React Query |
| Error | OK | Usa `DetectiveCard variant="danger"` con clearError button -- buen patron |
| Loading | FALTA | Loading delegado a sub-vistas |
| Empty | FALTA | No maneja caso sin classrooms/students |
| Shared | OK | Importa DetectiveButton, DetectiveCard de shared |
| Types | FALTA | Define `ViewType` inline, no importa tipos de portal |
| Imports | PARCIAL | `import React` importado explicitamente (innecesario en React 19) |
| A11y | FALTA | Breadcrumbs sin nav/aria-label, view selector botones sin roles |

**Notas adicionales:**
- La pagina mas larga (290 lineas) -- podria beneficiarse de mas extraction
- `import React, { useState, useEffect, useMemo }` -- el import de React es innecesario en JSX transform de React 19
- Patron de breadcrumbs con useMemo es buena practica

---

### 13. AdminNotificationPreferencesPage (300 lineas)

**Archivo:** `apps/frontend/src/apps/admin/pages/AdminNotificationPreferencesPage.tsx`

| Criterio | Estado | Detalle |
|----------|--------|---------|
| Layout | OK | Usa `AdminPageShell` |
| Export | OK | `export default function` |
| Data Fetch | PARCIAL | `useNotificationsStore` (Zustand) + `usePushNotifications` -- no React Query |
| Error | PARCIAL | Solo rollback optimistic en handleToggle catch, sin feedback visual |
| Loading | PARCIAL | Usa `Loader2` con animate-spin pero inline |
| Empty | FALTA | No maneja caso sin devices ni preferencias |
| Shared | PARCIAL | Usa `cn` de shared pero **NO usa detective theme** en la mayoria de clases |
| Types | FALTA | Define types inline con Record<string, ...> |
| Imports | FALTA | `motion` from 'framer-motion' mezclado con react-router-dom. Muchas imports desordenadas |
| A11y | FALTA | Toggle buttons son custom `<button>` sin `role="switch"` ni `aria-checked` |

**Notas adicionales:**
- **CRITICO: Theme inconsistency** -- Usa `text-white`, `text-gray-400`, `bg-white/5` en lugar de detective theme. Parece ser de un portal diferente (oscuro/purple) vs detective theme
- `motion.div` usado para animaciones -- framer-motion overhead
- Custom toggle switch buttons sin accesibilidad -- necesitan `role="switch"` y `aria-checked`
- Link de regreso `/admin/notifications` usa `<Link>` -- OK

---

### 14. AdminAssignmentsPage (271 lineas)

**Archivo:** `apps/frontend/src/apps/admin/pages/AdminAssignmentsPage.tsx`

| Criterio | Estado | Detalle |
|----------|--------|---------|
| Layout | OK | Usa `AdminPageShell` |
| Export | OK | `export default function` |
| Data Fetch | OK | `useAssignments` y `useAssignmentsStats` -- aparentan ser React Query hooks |
| Error | PARCIAL | No muestra error de forma visible (no hay bloque de error) |
| Loading | PARCIAL | `isLoadingStats` muestra texto "Cargando estadisticas..." pero no spinner |
| Empty | FALTA | No maneja caso 0 assignments |
| Shared | OK | Usa DetectiveCard, DetectiveButton, ToastContainer, useToast |
| Types | OK | Importa tipos del hook `useAdminAssignments` |
| Imports | PARCIAL | Types y hooks mezclados en mismo import |
| A11y | FALTA | `window.scrollTo` en page change pero sin focus management |

**Notas adicionales:**
- Stats cards estan hardcoded inline (lineas 126-188) -- deberia ser un componente `AssignmentsStatsGrid` como en UsersPage
- Usa `useToast` compartido correctamente -- buen patron a seguir
- Paginacion inline en vez de componente compartido

---

### 15. AdminClassroomTeacherPage (130 lineas)

**Archivo:** `apps/frontend/src/apps/admin/pages/AdminClassroomTeacherPage.tsx`

| Criterio | Estado | Detalle |
|----------|--------|---------|
| Layout | OK | Usa `AdminPageShell` |
| Export | OK | `export default function` |
| Data Fetch | OK | Delegado a tab components |
| Error | FALTA | No maneja errores a nivel pagina |
| Loading | FALTA | No tiene loading state |
| Empty | FALTA | No tiene empty state |
| Shared | PARCIAL | Usa `cn` de shared pero **NO usa AdminTabBar** -- implementa tabs custom con motion |
| Types | FALTA | Define tabs inline con cast `as TabType` |
| Imports | PARCIAL | framer-motion importado para tab animations |
| A11y | FALTA | Tab buttons sin `role="tab"` ni `aria-selected` -- usa motion.button custom |

**Notas adicionales:**
- **NO usa AdminTabBar** -- tiene implementacion custom de tabs con framer-motion. Deberia migrarse a AdminTabBar
- `getTabGradient` helper function al final del archivo es patron no-estandar
- `motion.div` con `layoutId="activeTab"` es un patron visual sofisticado pero innecesario dado AdminTabBar

---

### 16. AdminNotificationsPage (171 lineas)

**Archivo:** `apps/frontend/src/apps/admin/pages/AdminNotificationsPage.tsx`

| Criterio | Estado | Detalle |
|----------|--------|---------|
| Layout | OK | Usa `AdminPageShell` |
| Export | OK | `export default function` |
| Data Fetch | PARCIAL | `useNotificationsStore` (Zustand) con fetchNotifications imperative |
| Error | PARCIAL | Muestra error con div rojo inline |
| Loading | PARCIAL | Usa `RefreshCw` con animate-spin |
| Empty | OK | Tiene empty state con Bell icon, titulo y subtitulo -- pero inline, no usa EmptyState compartido |
| Shared | PARCIAL | Usa componentes extraidos (NotificationHeader, etc.) pero no de shared |
| Types | FALTA | Define `StatusFilter` inline |
| Imports | PARCIAL | `AnimatePresence` importado para list animation |
| A11y | FALTA | Sin roles ARIA en lista de notificaciones |

**Notas adicionales:**
- Usa `AnimatePresence mode="popLayout"` para list transitions -- elegante pero no estandar
- La unica pagina con empty state visible, aunque es inline en vez de usar `EmptyState` compartido
- Filtrado client-side con useMemo -- puede escalar mal con muchas notificaciones

---

### 17. AdminExerciseCreatePage (303 lineas)

**Archivo:** `apps/frontend/src/apps/admin/pages/AdminExerciseCreatePage.tsx`

| Criterio | Estado | Detalle |
|----------|--------|---------|
| Layout | **FALTA** | **NO usa AdminPageShell** -- renderiza `<div>` directamente sin layout wrapper |
| Export | OK | `export default function` (pero tambien re-exports type in line 42) |
| Data Fetch | FALTA | No conecta con backend -- `handleSaveDraft` y `handleSubmitForReview` son stubs con setTimeout |
| Error | FALTA | Solo `toast.error()` de `react-hot-toast` (no el sistema de toast compartido) |
| Loading | FALTA | No usa LoadingSpinner, solo `loading` prop en DetectiveButton |
| Empty | FALTA | No tiene empty states |
| Shared | PARCIAL | Usa DetectiveCard, DetectiveButton, cn de shared |
| Types | OK | Importa ExerciseFormData de types file |
| Imports | PARCIAL | Muchos imports de type-configs -- podria beneficiarse de barrel export |
| A11y | FALTA | Step indicator buttons sin keyboard navigation, sin ARIA |

**Notas adicionales:**
- **CRITICO: No usa AdminPageShell** -- es la unica pagina que renderiza sin layout. El usuario vera la pagina sin sidebar/header
- **CRITICO: Backend stubs** -- `handleSaveDraft` y `handleSubmitForReview` usan `setTimeout(r, 800)` sin llamada API real
- Usa `react-hot-toast` directamente en vez del sistema de toast del proyecto (Toast/useToast)
- `export type { ExerciseFormData }` en linea 42 es un re-export innecesario desde una page
- 17 imports de type-configs -- necesitan barrel export

---

### 18. AdminInstitutionsPage (107 lineas)

**Archivo:** `apps/frontend/src/apps/admin/pages/AdminInstitutionsPage.tsx`

| Criterio | Estado | Detalle |
|----------|--------|---------|
| Layout | OK | Usa `AdminPageShell` |
| Export | OK | `export default function` |
| Data Fetch | PARCIAL | `useInstitutionActions` hook -- parece useState-based |
| Error | PARCIAL | Muestra error y operationError/operationSuccess con divs inline |
| Loading | FALTA | Solo muestra tabla cuando loading && !organizations.length -- no tiene spinner |
| Empty | FALTA | No maneja caso sin instituciones |
| Shared | OK | Importa DetectiveButton de shared |
| Types | OK | No necesita importar tipos (delegado a hook) |
| Imports | OK | Orden limpio |
| A11y | FALTA | Sin roles ARIA |

**Notas adicionales:**
- Pagina bien delegada al hook `useInstitutionActions` -- mantiene la pagina simple
- `InstitutionFormModals` agrupa todos los modales -- buen patron de composicion
- Feedback de operacion (operationError/operationSuccess) es ad-hoc -- deberia usar ToastContainer

---

### 19. AdminRolesPage (271 lineas)

**Archivo:** `apps/frontend/src/apps/admin/pages/AdminRolesPage.tsx`

| Criterio | Estado | Detalle |
|----------|--------|---------|
| Layout | OK | Usa `AdminPageShell` |
| Export | OK | `export default function` |
| Data Fetch | PARCIAL | `useRoles` y `useRolePermissions` -- useState-based, no React Query |
| Error | PARCIAL | Muestra error con `Card className="border-red-200 bg-red-50"` -- usa Card de shared pero **NO detective theme** |
| Loading | OK | Usa `LoadingSpinner` de `@shared/components/loading` -- CORRECTO |
| Empty | OK | Tiene empty state con emoji y texto cuando no hay roles |
| Shared | PARCIAL | Importa `Card`, `Button` de shared pero estos son legacy components, no DetectiveCard/DetectiveButton |
| Types | OK | Importa Permission de adminTypes |
| Imports | PARCIAL | Mezcla shared components viejos (Card, Button) con nuevos (LoadingSpinner) |
| A11y | FALTA | Emoji en empty state no es accesible, sin roles ARIA |

**Notas adicionales:**
- **CRITICO: Theme inconsistency** -- Usa `text-gray-900`, `text-gray-600`, `bg-red-50`, `border-red-200` en lugar de detective theme. Es una de las 2 paginas con tema completamente diferente
- Usa `Card` y `Button` legacy en vez de `DetectiveCard` y `DetectiveButton` (que el resto del portal usa)
- Buen patron de two-column layout con RolesTable + RoleEditor
- `successMessage` con Card verde -- deberia usar ToastContainer

---

## Analisis adminAPI.ts Monolito

**Archivo:** `apps/frontend/src/services/api/adminAPI.ts`
**Lineas:** 1,818
**Funciones exportadas:** 77 (50 nombradas + ~27 inline en objeto `adminAPI`)

### Seccion por Lineas

| Seccion | Lineas | Funciones | Porcentaje |
|---------|--------|-----------|------------|
| Dashboard | 1-226 | 5 (getAdminDashboard, getRecentActions, getAlerts, getUserActivity, getMayaRanks) | 12.4% |
| Organizations | 227-401 | 9 (getOrganizations, getOrganization, createOrganization, updateOrganization, deleteOrganization, getOrganizationUsers, updateOrganizationSubscription, updateOrganizationFeatures, getOrganizationStats) | 9.6% |
| Content & Approvals | 402-544 | 6 (getPendingContent, approveContent, rejectContent, getMediaLibrary, deleteMediaFile, getApprovalHistory) | 7.8% |
| Users | 545-780 | 10 (safeToISOString, normalizeUserRole, normalizeUserStatus, transformUser, getUsers, getUser, updateUser, deleteUser, activateUser, deactivateUser, suspendUser, unsuspendUser) | 12.9% |
| Roles & Permissions | 781-861 | 5 (getRoles, getRolePermissions, transformPermissionsToBackend, updateRolePermissions, getAvailablePermissions) | 4.4% |
| Gamification | 862-925 | 4 (getGamificationSettings, updateGamificationSettings, previewGamificationChanges, restoreGamificationDefaults) | 3.5% |
| Monitoring | 926-1063 | 6 (getSystemHealth, getSystemMetrics, getSystemLogs, getAuditLogs, toggleMaintenanceMode) | 7.5% |
| Settings | 1064-1157 | 6 (getSystemConfig, updateSystemConfig, getConfigCategories, getCategoryConfig, updateCategoryConfig, validateConfig) | 5.1% |
| Reports | 1158-1248 | 5 (generateReport, getReports, downloadReport, deleteReport, scheduleReport) | 5.0% |
| Alerts | 1249-1370 | 7 (listAlerts, getAlertById, getAlertsStats, createAlert, acknowledgeAlert, resolveAlert, suppressAlert) | 6.7% |
| Analytics | 1371-1498 | 7 (getAnalyticsOverview, getEngagementAnalytics, getGamificationAnalytics, getActivityTimeline, getTopUsers, getRetentionAnalytics, exportAnalyticsCSV) | 7.0% |
| Progress | 1499-1615 | 6 (getProgressOverview, getClassroomProgress, getStudentProgress, getModuleProgress, getExerciseStats, exportProgressCSV) | 6.4% |
| adminAPI object + classrooms | 1616-1818 | 1 (adminAPI object literal con ~5 inline async) | 11.1% |

### Propuesta de Splitting

```
services/api/admin/
  index.ts              -- Re-exports + adminAPI facade object
  dashboardAPI.ts       -- Dashboard (5 funciones, ~225 lineas)
  organizationsAPI.ts   -- Organizations (9 funciones, ~175 lineas)
  contentAPI.ts         -- Content & Approvals (6 funciones, ~142 lineas)
  usersAPI.ts           -- Users (10 funciones + helpers, ~235 lineas)
  rolesAPI.ts           -- Roles & Permissions (5 funciones, ~80 lineas)
  gamificationAPI.ts    -- Gamification (4 funciones, ~63 lineas)
  monitoringAPI.ts      -- Monitoring (6 funciones + inline, ~200 lineas)
  settingsAPI.ts        -- Settings (6 funciones, ~93 lineas)
  reportsAPI.ts         -- Reports (5 funciones, ~90 lineas)
  alertsAPI.ts          -- Alerts (7 funciones, ~121 lineas)
  analyticsAPI.ts       -- Analytics (7 funciones, ~128 lineas)
  progressAPI.ts        -- Progress (6 funciones, ~116 lineas)
  classroomsAPI.ts      -- Classrooms (1 funcion, ~15 lineas)
```

**Beneficios:**
- Archivos de 60-235 lineas en vez de 1,818
- Tree-shaking mejorado (solo se carga lo que se importa)
- Facilita testing unitario por modulo
- Reduce conflictos de merge en team development
- El objeto `adminAPI` en `index.ts` mantiene backward compatibility

### Problemas Adicionales en adminAPI.ts

1. **`getMayaRanks`** esta en la seccion Dashboard (linea 187) -- deberia estar en Gamification
2. **Interface `OrganizationStats`** definida inline (linea 381) -- deberia estar en adminTypes.ts
3. **`transformUser` helper** y `normalizeUserRole`/`normalizeUserStatus` son funciones internas pero podrian vivir en un utils
4. **Inline async functions** en el objeto `adminAPI.monitoring` (lineas 1692-1744) son incoherentes con el patron del resto del archivo
5. **`import type` inline** en lineas 1509-1596 (Progress section) -- deberia importar tipos al inicio del archivo

---

## Analisis AdminTabBar vs shared TabBar

### Comparacion

| Aspecto | AdminTabBar | shared TabBar |
|---------|-------------|---------------|
| **Archivo** | `apps/frontend/src/apps/admin/components/shared/AdminTabBar.tsx` | `apps/frontend/src/shared/components/base/TabBar.tsx` |
| **Lineas** | 153 | 121 |
| **Generics** | `<T extends string>` | `<T extends string>` |
| **Variants** | `'underline' | 'cards'` | `'pills' | 'underline'` |
| **Default variant** | `'underline'` | `'pills'` |
| **ARIA role="tablist"** | Si | Si |
| **ARIA role="tab"** | Si | Si |
| **aria-selected** | Si | Si |
| **tabIndex management** | No | Si (`tabIndex={isActive ? 0 : -1}`) |
| **Keyboard navigation** | **No** | **Si** (ArrowLeft/Right, Home/End) |
| **Focus ring** | No | Si (`focus:ring-2 focus:ring-detective-orange`) |
| **aria-orientation** | No | Si (`"horizontal"`) |
| **Icon support** | `ElementType` (component ref) | `ReactNode` (rendered element) |
| **Badge** | `string` (text badge) | `number` (count badge) |
| **Badge tooltip** | Si | No |
| **Description** | Si (subtitle text) | No |
| **Theme** | Detective theme | Mixed (detective + gray) |

### Conclusiones

1. **shared TabBar es mas accesible** -- tiene keyboard navigation, focus management, tabIndex control
2. **AdminTabBar tiene mas features** -- description, badge tooltip, cards variant
3. **Ambos deberian fusionarse** en un unico componente `TabBar` en shared que soporte todas las features:
   - Variants: `'pills' | 'underline' | 'cards'`
   - Keyboard navigation (de shared TabBar)
   - Badge con tooltip (de AdminTabBar)
   - Description (de AdminTabBar)
   - Icon como `ElementType` (mas flexible que ReactNode para composicion)

### Uso actual de AdminTabBar

Paginas que usan AdminTabBar: `AdminContentPage`, `AdminSettingsPage`, `AdminAnalyticsPage`, `AdminGamificationPage`, `AdminMonitoringPage` (5 paginas)

Paginas que implementan tabs custom: `AdminClassroomTeacherPage` (motion tabs), `AdminProgressPage` (button group)

Paginas que NO usan tabs: Las 12 restantes

---

## Analisis de Hooks Admin

### Inventario (32 hooks)

| Hook | Lineas | Patron | Usado por | Notas |
|------|--------|--------|-----------|-------|
| `useAdminPageSetup` | 57 | Auth+Gamification | AdminPageShell (todas) | Centralizado en Shell -- CORRECTO |
| `useAdminDashboard` | 485 | useState+setInterval | DashboardPage | **LARGO** -- 485 lineas, deberia splittearse |
| `useUserManagement` | ~200 | useState+useEffect | UsersPage | Legacy pattern |
| `useUserActions` | ~100 | useState callbacks | UsersPage | Extracted from page |
| `useCreateUserFlow` | ~80 | useState callbacks | UsersPage | Extracted from page |
| `useAnalytics` | 222 | useState+Promise.all | AnalyticsPage | Legacy pattern |
| `useMonitoring` | 158 | useState+useEffect | MonitoringPage | Legacy pattern |
| `useSystemMonitoring` | 302 | useState+setInterval | **NO USADO** | **DUPLICADO** de useMonitoring+useAdminDashboard |
| `useSystemMetrics` | 100 | useState+setInterval | **hooks/index.ts export** | **DUPLICADO** de useMonitoring metrics |
| `useAlerts` | ~150 | useState+useEffect | AlertsPage, MonitoringPage | |
| `useAuditLogs` | ~120 | useState+useEffect | AuditLogsPage | |
| `useProgress` | ~150 | useState+useEffect | ProgressPage | |
| `useReports` | ~120 | useState+useEffect | ReportsPage | |
| `useRoles` | ~80 | useState+useEffect | RolesPage | |
| `useRolePermissions` | ~100 | useState+useEffect | RolesPage | |
| `useOrganizations` | ~100 | useState+useEffect | (InstitutionsPage via useInstitutionActions) | |
| `useInstitutionActions` | ~200 | useState callbacks | InstitutionsPage | Extracted from page |
| `useFeatureFlags` | ~100 | useState+useEffect | FeatureFlagsPanel | |
| `useClassroomsList` | ~50 | useState+useEffect | ProgressPage | |
| `useSystemLogs` | ~80 | useState+useEffect | LogsViewer | |
| `useConfigCategories` | ~50 | useState+useEffect | (Settings sub-components) | |
| `useSystemConfig` | ~100 | useState+useEffect | GeneralSettings, SecuritySettings | |
| `useLtiConsumers` | ~80 | useState+useEffect | (LTI management) | |
| `useAdminData` | ~100 | useState+useEffect | hooks/index.ts | Exports useUserActivity, useErrorTracking, useExportData |
| `useContentManagement` | ~100 | useState+useEffect | hooks/index.ts | Legacy -- exports useExercises, usePendingExercises, etc. |
| `useContentQueries` | ~120 | **React Query** | ContentPage | **CORRECTO** -- nuevo patron |
| `useGamificationConfig` | ~150 | **React Query** | GamificationPage | **CORRECTO** -- nuevo patron |
| `useAdminAssignments` | ~100 | **React Query** | AssignmentsPage | **CORRECTO** -- nuevo patron |
| `useClassroomTeacher` | ~100 | useState+useEffect | ClassroomTeacherPage tabs | |
| `useSettings` | ~80 | useState+useEffect | (General) | |
| `useModalBehavior` | ~40 | Utility | Various | Generic modal open/close |
| `useAdminDashboard` | See above | | | |

### Duplicaciones Identificadas

1. **useSystemMonitoring** (302 lineas) vs **useMonitoring** (158 lineas) vs **useSystemMetrics** (100 lineas):
   - Los tres obtienen metricas del sistema
   - `useSystemMonitoring` tiene interval-based polling para health + alerts
   - `useMonitoring` obtiene extended metrics + error stats + error trends
   - `useSystemMetrics` obtiene system metrics basicas con history tracking
   - **Accion:** Consolidar en `useMonitoring` unico que cubra todos los casos. Eliminar `useSystemMonitoring` (302 lineas, parece no usarse directamente por ninguna pagina). `useSystemMetrics` exportado desde index.ts pero puede estar sin uso real.

2. **useContentManagement** vs **useContentQueries**:
   - `useContentManagement` es legacy (useState+useEffect)
   - `useContentQueries` es nuevo (React Query)
   - Ambos exportan funciones similares (pending exercises, media, versions)
   - **Accion:** Migrar consumidores de `useContentManagement` a `useContentQueries` y eliminar el legacy

3. **useAdminData** exports (`useUserActivity`, `useErrorTracking`, `useExportData`):
   - Puede solapar con `useAnalytics` (que obtiene user activity) y `useMonitoring` (error tracking)
   - **Accion:** Verificar si tienen consumidores distintos o son dead exports

### Patron de Data Fetching

| Patron | Count | Hooks |
|--------|-------|-------|
| useState + useEffect (legacy) | **25** | La gran mayoria |
| React Query | **3** | useContentQueries, useGamificationConfig, useAdminAssignments |
| Zustand store | **2** | useNotificationsStore (via pages) |
| Utility (no data) | **2** | useAdminPageSetup, useModalBehavior |

**Conclusion:** Solo 3 de 32 hooks usan React Query. La migracion gradual esta en progreso pero el 78% restante necesita migrarse.

---

## Hallazgos Criticos (P0)

### P0-1: AdminExerciseCreatePage sin AdminPageShell
- **Impacto:** La pagina se renderiza sin sidebar, header, ni autenticacion
- **Archivo:** `apps/frontend/src/apps/admin/pages/AdminExerciseCreatePage.tsx`
- **Linea:** 150 -- `return (<div className="space-y-6">` en vez de `<AdminPageShell>`
- **Accion:** Envolver el JSX en `<AdminPageShell>`

### P0-2: AdminExerciseCreatePage con stubs sin backend
- **Impacto:** Save draft y submit for review NO funcionan -- son setTimeout stubs
- **Archivo:** `apps/frontend/src/apps/admin/pages/AdminExerciseCreatePage.tsx`
- **Lineas:** 124-146
- **Accion:** Implementar llamada API real o deshabilitar botones con mensaje

### P0-3: Theme inconsistency en 3 paginas
- **Impacto:** Quiebre visual, usuario percibe interfaz fragmentada
- **Paginas afectadas:**
  - `AdminRolesPage` -- gray scale (Card, Button legacy)
  - `AdminReportsPage` -- gray/dark mode (text-gray-900, dark:text-white)
  - `AdminNotificationPreferencesPage` -- purple/white theme
- **Accion:** Migrar a detective theme (DetectiveCard, DetectiveButton, text-detective-*)

---

## Hallazgos Altos (P1)

### P1-1: adminAPI.ts monolito de 1,818 lineas
- **Impacto:** Mantenibilidad, tree-shaking, merge conflicts
- **Accion:** Split en 13 archivos modulares (ver seccion "Propuesta de Splitting")

### P1-2: 25/32 hooks usan useState+useEffect en vez de React Query
- **Impacto:** No hay caching, no hay deduplication, no hay stale-while-revalidate, no hay retry automatico
- **Accion:** Migrar gradualmente empezando por hooks mas usados (useUserManagement, useAlerts, useProgress)

### P1-3: 3 hooks duplicados para monitoring/metrics
- **Impacto:** Codigo redundante, posible double-fetching si multiples hooks activos
- **Hooks:** useSystemMonitoring (302 ln), useMonitoring (158 ln), useSystemMetrics (100 ln)
- **Accion:** Consolidar en uno solo + React Query

### P1-4: AdminTabBar sin keyboard navigation
- **Impacto:** Incumplimiento WCAG 2.1 para tab navigation
- **Accion:** Fusionar con shared TabBar o portar keyboard handling

### P1-5: Toast ad-hoc en 5+ paginas
- **Paginas:** AnalyticsPage, ReportsPage, AuditLogsPage, InstitutionsPage, ContentPage
- **Impacto:** Inconsistencia visual, codigo duplicado (useState toast + useEffect auto-dismiss)
- **Accion:** Migrar a `useToast` + `ToastContainer` compartido (como AssignmentsPage)

---

## Hallazgos Medios (P2)

### P2-1: AdminClassroomTeacherPage no usa AdminTabBar
- **Impacto:** Inconsistencia visual y funcional con otras paginas con tabs
- **Accion:** Migrar a AdminTabBar variant="underline"

### P2-2: window.confirm() nativo en AdminAlertsPage
- **Impacto:** No themed, no accesible, rompe flow visual
- **Accion:** Reemplazar con ConfirmDialog compartido

### P2-3: framer-motion en 5 paginas admin
- **Impacto:** Bundle size, inconsistencia (solo 5 de 19 paginas lo usan)
- **Paginas:** AuditLogs, ClassroomTeacher, ExerciseCreate, Notifications, NotifPrefs
- **Accion:** Evaluar si las animaciones justifican la dependencia; para toast fade reemplazar con CSS transitions

### P2-4: Import de React innecesario
- **Archivo:** AdminProgressPage linea 18 `import React, { useState, ...}`
- **Accion:** Eliminar import de React (JSX transform de React 19 no lo requiere)

### P2-5: SHOW_CONTENT flag hardcodeado
- **Archivo:** AdminAdvancedPage linea 28
- **Accion:** Eliminar branch muerto o conectar con feature flags del backend

### P2-6: Stats cards inline en AssignmentsPage
- **Lineas:** 126-188 (62 lineas de stats cards inline)
- **Accion:** Extraer a `AssignmentsStatsGrid` componente como en UsersPage

### P2-7: 0/19 paginas usan useApiError compartido
- **Impacto:** Manejo de errores inconsistente (algunos console.error, algunos try/catch con setState)
- **Accion:** Integrar `useApiError` en hooks que hacen llamadas API

### P2-8: 0/19 paginas usan EmptyState compartido
- **Impacto:** Solo NotificationsPage y RolesPage tienen empty state, pero inline
- **Accion:** Usar `EmptyState` de `@shared/components/feedback/` en todas las paginas con listas

### P2-9: useAdminDashboard de 485 lineas
- **Accion:** Splitear en sub-hooks: useHealthPolling, useMetricsPolling, useAlertsPolling

### P2-10: Export de tipo re-exportado desde page
- **Archivo:** AdminExerciseCreatePage linea 42 `export type { ExerciseFormData }`
- **Accion:** Eliminar -- pages no deberian re-exportar tipos

---

## Acciones Correctivas Recomendadas

### Sprint Inmediato (P0 - 1-2 dias)

| # | Accion | Esfuerzo | Impacto |
|---|--------|----------|---------|
| 1 | Envolver AdminExerciseCreatePage en AdminPageShell | 15 min | Alto |
| 2 | Migrar AdminRolesPage a detective theme (DetectiveCard, DetectiveButton) | 1h | Alto |
| 3 | Migrar AdminReportsPage a detective theme | 30 min | Alto |
| 4 | Migrar AdminNotificationPreferencesPage a detective theme | 1h | Alto |

### Sprint 2 (P1 - 3-5 dias)

| # | Accion | Esfuerzo | Impacto |
|---|--------|----------|---------|
| 5 | Split adminAPI.ts en 13 modulos | 4h | Alto |
| 6 | Migrar AdminClassroomTeacherPage a AdminTabBar | 1h | Medio |
| 7 | Migrar 5 paginas de toast ad-hoc a useToast+ToastContainer | 2h | Medio |
| 8 | Agregar keyboard navigation a AdminTabBar (o fusionar con shared TabBar) | 2h | Alto |
| 9 | Consolidar 3 hooks de monitoring en 1 | 3h | Alto |
| 10 | Eliminar useContentManagement legacy (migrar a useContentQueries) | 1h | Medio |

### Sprint 3 (P2 - gradual)

| # | Accion | Esfuerzo | Impacto |
|---|--------|----------|---------|
| 11 | Migrar top 5 hooks a React Query (useUserManagement, useAlerts, useProgress, useRoles, useAuditLogs) | 8h | Alto |
| 12 | Agregar EmptyState compartido a 10+ paginas con listas | 2h | Medio |
| 13 | Integrar useApiError en hooks de data fetching | 2h | Medio |
| 14 | Reemplazar window.confirm con ConfirmDialog en AlertsPage | 30 min | Bajo |
| 15 | Implementar backend real para AdminExerciseCreatePage | 4h+ | Alto |
| 16 | Splitear useAdminDashboard (485 ln) en sub-hooks | 2h | Medio |
| 17 | Audit de accesibilidad completo (ARIA roles, keyboard nav, focus management) | 4h | Alto |

---

## Metricas de Resumen

| Metrica | Valor |
|---------|-------|
| Total paginas | 19 |
| Paginas con AdminPageShell | 18/19 (94.7%) |
| Paginas con export default function | 19/19 (100%) |
| Paginas con React Query | 3/19 (15.8%) |
| Paginas con useApiError | 0/19 (0%) |
| Paginas con LoadingSpinner compartido | 1/19 (5.3%) |
| Paginas con EmptyState compartido | 0/19 (0%) |
| Paginas con detective theme correcto | 16/19 (84.2%) |
| Paginas con AdminTabBar | 5/19 (26.3%) |
| Paginas con framer-motion | 5/19 (26.3%) |
| Paginas con toast ad-hoc | 5/19 (26.3%) |
| Paginas con ARIA completo | 0/19 (0%) |
| Hooks totales | 32 |
| Hooks con React Query | 3/32 (9.4%) |
| Hooks duplicados identificados | 3 (useSystemMonitoring, useSystemMetrics, useContentManagement) |
| adminAPI.ts lineas | 1,818 |
| adminAPI.ts funciones | 77 |
