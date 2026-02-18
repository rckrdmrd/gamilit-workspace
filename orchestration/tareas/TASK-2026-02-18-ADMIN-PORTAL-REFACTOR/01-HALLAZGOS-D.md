# Hallazgos -- Grupo D: Analytics + Reports + Progress + Assignments

**Agente:** D
**Fecha:** 2026-02-18
**Alcance:** 4 paginas, 5 hooks, 15 componentes (24 archivos, ~5,700 lineas)

---

## Resumen

- Paginas analizadas: 4
- Hooks analizados: 5
- Componentes analizados: 15
- Total violaciones: 31 (3 CRITICA, 10 ALTA, 13 MEDIA, 5 BAJA)
- Lineas totales (paginas): 1,212
- Lineas totales (hooks): 1,081
- Lineas totales (componentes): 3,408

---

## PAGINAS

### 1. AdminAnalyticsPage.tsx (300 lineas)

**Ruta:** `apps/frontend/src/apps/admin/pages/AdminAnalyticsPage.tsx`

#### Violaciones

1. **[ALTA]** Lineas 59-97: Boilerplate admin duplicado (useAuth + useUserGamification + displayGamificationData fallback de 12 lineas + handleLogout). Identico a las otras 3 paginas.
2. **[ALTA]** Lineas 62-63, 99-111, 113-119: Toast manual con useState + useEffect auto-dismiss. Inconsistente con AdminAssignmentsPage que usa el hook `useToast`. ~25 lineas de toast boilerplate.
3. **[MEDIA]** Lineas 122-153: Tab configuration definida inline dentro del componente (32 lineas). Deberia ser constante fuera del componente o en archivo aparte.
4. **[MEDIA]** Lineas 219-266: Tabs navigation renderizado inline con boilerplate de tooltip/badge (48 lineas). Patron reutilizable en todas las paginas con tabs.
5. **[MEDIA]** Lineas 155-161: AdminLayout wrapper duplicado con props identicos en las 4 paginas.
6. **[BAJA]** Linea 44-53: `TabConfig` interface y `TabType` type definidos localmente. Podrian estar en types compartidos.

#### Boilerplate Duplicado
- **Admin Layout wrapping:** 6 lineas (identico en 4 paginas)
- **Auth + Gamification + Logout:** 30 lineas (identico en 4 paginas)
- **Toast manual:** 25 lineas (presente en 3 de 4 paginas; AdminAssignmentsPage usa useToast)
- **Export CSV handler:** 12 lineas (variante en 3 de 4 paginas)

#### Mapa de Dependencias
- **Hooks:** `useAuth`, `useUserGamification`, `useAnalytics`
- **Components:** `OverviewTab`, `EngagementTab`, `GamificationTab`, `RetentionTab`, `DetectiveButton`, `DetectiveCard`
- **Icons:** `TrendingUp`, `RefreshCw`, `Download`, `BarChart3`, `Users`, `Award`, `Target`

---

### 2. AdminReportsPage.tsx (302 lineas)

**Ruta:** `apps/frontend/src/apps/admin/pages/AdminReportsPage.tsx`

#### Violaciones

1. **[CRITICA]** Lineas 170-245: Toast notification inline con SVG icons duplicados (76 lineas). El componente de toast success/error con inline SVGs para check, error y close icons es masivo y deberia usar un componente Toast compartido (como `useToast` que ya existe en el proyecto).
2. **[ALTA]** Lineas 28-71: Boilerplate admin identico (useAuth + useUserGamification + displayGamificationData + handleLogout).
3. **[ALTA]** Lineas 247-271: Error display inline con SVG duplicado del toast error (25 lineas adicionales). Duplica el patron de error del toast.
4. **[MEDIA]** Linea 302: Pagina tiene 302 lineas, mas del doble del limite de 150. La mitad son toast/error inline SVGs.
5. **[MEDIA]** Lineas 76-135: Tres handlers de operacion (generate, download, delete) con patron identico try/catch/setToast. Deberian abstraerse en un wrapper generico.

#### Boilerplate Duplicado
- **Admin Layout wrapping:** 6 lineas
- **Auth + Gamification + Logout:** 30 lineas
- **Toast inline con SVGs:** 76 lineas (PEOR CASO del grupo -- usa SVGs inline en vez de Lucide o Toast component)
- **Error display inline:** 25 lineas

#### Mapa de Dependencias
- **Hooks:** `useAuth`, `useUserGamification`, `useReports`
- **Components:** `ReportGenerationForm`, `ReportsList`, `BetaBanner`
- **Types:** `GenerateReportParams`

---

### 3. AdminProgressPage.tsx (315 lineas)

**Ruta:** `apps/frontend/src/apps/admin/pages/AdminProgressPage.tsx`

#### Violaciones

1. **[ALTA]** Lineas 42-100: Boilerplate admin: useAuth + useUserGamification (version simplificada, 7 lineas vs 12) + handleLogout.
2. **[ALTA]** Lineas 80-84: `useEffect` para fetch imperative en mount (`fetchOverview`). El hook `useProgress` usa `useState`+`useCallback` manual en vez de React Query. Deberia migrar a React Query como `useAdminAssignments`.
3. **[MEDIA]** Linea 315: Supera el limite de 150 lineas. Delega bien a componentes hijos pero retiene demasiada logica de coordinacion de vistas.
4. **[MEDIA]** Lineas 127-154: `handleRefresh` y `handleExport` contienen logica condicional por vista activa. Este patron de "view router" podria extraerse.
5. **[MEDIA]** Lineas 157-172: Breadcrumb construido con useMemo en la pagina. Podria ser un componente `Breadcrumb` reutilizable.
6. **[BAJA]** Linea 18: Import de `React` no necesario con React 17+ JSX transform (solo se usa en `React.Fragment`).

#### Boilerplate Duplicado
- **Admin Layout wrapping:** 6 lineas
- **Auth + Gamification + Logout:** 18 lineas (version simplificada)
- **Export CSV handler:** 15 lineas

#### Mapa de Dependencias
- **Hooks:** `useAuth`, `useUserGamification`, `useProgress`, `useClassroomsList`
- **Components:** `OverviewView`, `ClassroomsView`, `StudentDetailView`, `ClassroomSelector`, `StudentSearch`, `DetectiveButton`, `DetectiveCard`
- **Icons:** `TrendingUp`, `RefreshCw`, `Download`, `School`, `User`

---

### 4. AdminAssignmentsPage.tsx (295 lineas)

**Ruta:** `apps/frontend/src/apps/admin/pages/AdminAssignmentsPage.tsx`

#### Violaciones

1. **[ALTA]** Lineas 47-79: Boilerplate admin (useAuth + useUserGamification + displayGamificationData + handleLogout). Igual que las otras 3 paginas.
2. **[ALTA]** Lineas 147-213: Stats cards inline (67 lineas). 5 cards con patron identico (icon + label + value) deberian ser un componente `StatsGrid` o similar con data driven rendering.
3. **[MEDIA]** Linea 295: Supera limite de 150 lineas.
4. **[MEDIA]** Lineas 257-280: Paginacion inline. Patron duplicable que podria ser un componente `Pagination` compartido.
5. **[BAJA]** Linea 139: Titulo mezclado espanol/ingles ("Assignments" en h1 vs "Visualiza y monitorea" en p). Inconsistencia de idioma.

#### Boilerplate Duplicado
- **Admin Layout wrapping:** 6 lineas
- **Auth + Gamification + Logout:** 20 lineas
- **Stats cards inline:** 67 lineas (patron data-driven posible)

#### Mapa de Dependencias
- **Hooks:** `useAuth`, `useUserGamification`, `useAssignments`, `useAssignmentsStats`, `useToast`
- **Components:** `AssignmentsTable`, `AssignmentDetailModal`, `AssignmentFiltersComponent`, `DetectiveCard`, `DetectiveButton`, `ToastContainer`
- **Functions:** `downloadAssignmentsCSV`
- **Icons:** `ClipboardList`, `Download`, `RefreshCw`, `FileText`, `CheckCircle`, `Clock`, `AlertCircle`

---

## HOOKS

### 5. useAnalytics.ts (223 lineas)

**Ruta:** `apps/frontend/src/apps/admin/hooks/useAnalytics.ts`

#### Violaciones

1. **[CRITICA]** Lineas 56-63, 68-170: Hook completo basado en `useState` + `useCallback` + `useEffect` manual en vez de React Query. Gestiona 6 estados independientes, 6 fetchs individuales, loading global. Este patron ya fue resuelto correctamente en `useAdminAssignments.ts` con React Query.
2. **[ALTA]** Lineas 183-203: CSV export con DOM manipulation (`createElement('a')`) duplicado en 3 hooks (useAnalytics, useProgress, useAdminAssignments).
3. **[MEDIA]** Lineas 206-208: `useEffect` para fetch en mount -- anti-patron cuando React Query tiene `initialData` y refetch built-in.

#### Mapa de Dependencias
- **API:** `adminAPI.analytics.getOverview`, `getEngagement`, `getGamification`, `getActivityTimeline`, `getTopUsers`, `getRetention`, `exportCSV`
- **Types:** `AnalyticsOverview`, `EngagementAnalytics`, `GamificationAnalytics`, `RetentionAnalytics`, `DailyActivity`, `TopUser`

---

### 6. useReports.ts (272 lineas)

**Ruta:** `apps/frontend/src/apps/admin/hooks/useReports.ts`

#### Violaciones

1. **[CRITICA]** Lineas 63-108, 120-206: Hook completamente basado en `useState` + `useCallback` + refs manuales + `setInterval` para auto-refresh. React Query tiene `refetchInterval` built-in (como ya se usa en `useAssignmentsStats`).
2. **[ALTA]** Lineas 71-73, 245-252: Refs manuales `isMountedRef` y `refreshTimerRef` para cleanup -- innecesarios con React Query que maneja esto automaticamente.
3. **[MEDIA]** Lineas 143-185: Download con DOM manipulation duplicado.

#### Mapa de Dependencias
- **API:** `adminAPI.reports.list`, `generate`, `download`, `delete`
- **Types:** `Report`, `ReportListFilters`, `GenerateReportParams`, `PaginatedResponse`

---

### 7. useProgress.ts (222 lineas)

**Ruta:** `apps/frontend/src/apps/admin/hooks/useProgress.ts`

#### Violaciones

1. **[ALTA]** Linea 16: `/* eslint-disable @typescript-eslint/no-explicit-any */` -- desactiva regla TypeScript globalmente en el archivo.
2. **[ALTA]** Lineas 43-44: Parametros tipados como `any` en `fetchStudentProgress` y `fetchModuleProgress`. Deberian tener interfaces explicitas.
3. **[MEDIA]** Lineas 50-59: 5 estados independientes con `useState` -- mismo anti-patron que useAnalytics. Deberia usar React Query.
4. **[MEDIA]** Lineas 162-187: CSV export con DOM manipulation (3ra instancia del mismo patron).

#### Mapa de Dependencias
- **API:** `adminAPI.progress.getOverview`, `getClassroomProgress`, `getStudentProgress`, `getModuleProgress`, `getExerciseStats`, `exportCSV`
- **Types:** `ProgressOverview`, `ClassroomProgress`, `StudentProgress`, `ModuleProgressStats`, `ExerciseStats`

---

### 8. useAdminAssignments.ts (292 lineas)

**Ruta:** `apps/frontend/src/apps/admin/hooks/useAdminAssignments.ts`

#### Violaciones

1. **[MEDIA]** Lineas 18-119: 102 lineas de definiciones de tipos inline en el hook. Deberian estar en un archivo `types/assignments.types.ts` separado.
2. **[MEDIA]** Lineas 128-146, 182-197: Duplicacion del patron de `URLSearchParams` construction entre `fetchAssignments` y `exportAssignments`.
3. **[BAJA]** Lineas 281-289: `useAdminAssignments()` hook es un wrapper trivial que solo retorna references a los otros hooks/functions. Innecesario ya que las funciones se exportan individualmente.

#### Notas Positivas
- **MEJOR PATRON del grupo:** Usa React Query correctamente con `useQuery`, `staleTime`, `gcTime`, `refetchInterval`, `enabled`.
- Separacion clara entre API functions y hooks.
- Tipado completo sin `any`.

#### Mapa de Dependencias
- **API:** `apiClient.get` directo (no usa `adminAPI`)
- **Config:** `API_ENDPOINTS.admin.assignments.export`
- **React Query:** `useQuery` de `@tanstack/react-query`

---

### 9. useClassroomsList.ts (72 lineas)

**Ruta:** `apps/frontend/src/apps/admin/hooks/useClassroomsList.ts`

#### Violaciones

Ninguna significativa. Este es el hook mejor estructurado del grupo.

#### Notas Positivas
- Usa React Query correctamente
- Tipado completo
- Configuracion apropiada (`staleTime`, `gcTime`, `retry`, `refetchOnWindowFocus`)
- JSDoc con ejemplo de uso
- Bajo acoplamiento

#### Mapa de Dependencias
- **API:** `adminAPI.classrooms.getAll`
- **Types:** `ClassroomBasic` de adminTypes
- **React Query:** `useQuery`

---

## COMPONENTES

### 10. analytics/OverviewTab.tsx (311 lineas)

**Ruta:** `apps/frontend/src/apps/admin/components/analytics/OverviewTab.tsx`

#### Violaciones
1. **[ALTA]** Linea 13: `/* eslint-disable @typescript-eslint/no-explicit-any */`
2. **[ALTA]** Linea 53: `icon: any` en StatCard -- deberia ser `React.ComponentType<{ className?: string }>`.
3. **[MEDIA]** 311 lineas, mas del doble del limite de 150. Contiene StatCard inline, pie chart, line chart, y tabla -- cada uno podria ser componente separado.
4. **[MEDIA]** Linea 154: `label` callback en Pie usa `any` (entry: any).

### 11. analytics/EngagementTab.tsx (221 lineas)

**Ruta:** `apps/frontend/src/apps/admin/components/analytics/EngagementTab.tsx`

#### Violaciones
1. **[MEDIA]** 221 lineas, supera limite de 150.
2. **[MEDIA]** Lineas 72-116: Summary cards con patron identico al de OverviewTab. Podria usar componente `StatCard` compartido.

### 12. analytics/GamificationTab.tsx (252 lineas)

**Ruta:** `apps/frontend/src/apps/admin/components/analytics/GamificationTab.tsx`

#### Violaciones
1. **[MEDIA]** 252 lineas, supera limite de 150.
2. **[MEDIA]** Lineas 83-124: Summary cards identico al patron de EngagementTab y OverviewTab.
3. **[BAJA]** Tooltip `contentStyle` duplicado 3 veces con mismos valores literales. Deberia ser constante compartida.

### 13. analytics/RetentionTab.tsx (309 lineas)

**Ruta:** `apps/frontend/src/apps/admin/components/analytics/RetentionTab.tsx`

#### Violaciones
1. **[ALTA]** 309 lineas, mas del doble del limite.
2. **[MEDIA]** Linea 144: `formatter={(value: any) => ...}` -- `any` no necesario.
3. **[MEDIA]** Lineas 83-127: Summary cards duplicadas (3ra instancia del mismo patron en analytics/).

### 14. reports/BetaBanner.tsx (90 lineas)

**Ruta:** `apps/frontend/src/apps/admin/components/reports/BetaBanner.tsx`

#### Violaciones
Ninguna significativa. Componente bien dimensionado y con buena estructura.

#### Notas Positivas
- 90 lineas -- dentro del limite
- Usa localStorage para persistencia de dismiss
- Props bien tipadas
- Incluye `aria-label`

### 15. reports/ReportsList.tsx (339 lineas)

**Ruta:** `apps/frontend/src/apps/admin/components/reports/ReportsList.tsx`

#### Violaciones
1. **[ALTA]** 339 lineas, mas del doble del limite. Contiene tabla, estados de carga, empty state, inline SVGs para spinner/download/delete.
2. **[ALTA]** Lineas 120-142, 244-278, 290-325: SVGs spinner inline repetidos 4 veces (~60 lineas de SVG duplicado). Deberia usar un componente `Spinner` o icono de Lucide `Loader2`.
3. **[MEDIA]** Linea 90: `confirm()` nativo para confirmacion de delete. Deberia usar modal de confirmacion coherente con el design system.

### 16. reports/ReportGenerationForm.tsx (365 lineas)

**Ruta:** `apps/frontend/src/apps/admin/components/reports/ReportGenerationForm.tsx`

#### Violaciones
1. **[ALTA]** 365 lineas, mas del doble del limite. El componente mas largo del grupo.
2. **[ALTA]** Lineas 91-141: Dos `useEffect` con fetch imperativo + cancellation manual para cascade dropdowns. Deberia usar React Query con `enabled` condicional (como ya se hace en `useClassroomsList`).
3. **[MEDIA]** Lineas 334-356: SVG spinner inline (4ta instancia). Patron compartido pendiente.

### 17. progress/OverviewView.tsx (143 lineas)

**Ruta:** `apps/frontend/src/apps/admin/components/progress/OverviewView.tsx`

#### Violaciones
Ninguna significativa. Componente bien estructurado.

#### Notas Positivas
- 143 lineas, dentro del limite
- Usa data-driven rendering (array de stats)
- Loading skeleton integrado
- TypeScript correcto

### 18. progress/ClassroomsView.tsx (277 lineas)

**Ruta:** `apps/frontend/src/apps/admin/components/progress/ClassroomsView.tsx`

#### Violaciones
1. **[MEDIA]** 277 lineas, supera limite. Contiene info card + students table con sorting inline.
2. **[MEDIA]** Lineas 54-77: Sorting logic identica a `AssignmentsTable.tsx` lineas 24-40. Patron duplicado que deberia extraerse a un hook `useTableSort`.

### 19. progress/StudentDetailView.tsx (271 lineas)

**Ruta:** `apps/frontend/src/apps/admin/components/progress/StudentDetailView.tsx`

#### Violaciones
1. **[MEDIA]** 271 lineas, supera limite. Tres secciones (info card, modules progress, recent submissions) podrian ser componentes separados.
2. **[BAJA]** Lineas 57-66: `getStatusBadge` funcion con record literal. Patron duplicado con `AssignmentsTable.getStatusBadge` y `AssignmentDetailModal.getSubmissionStatusBadge`.

### 20. progress/ClassroomSelector.tsx (59 lineas)

**Ruta:** `apps/frontend/src/apps/admin/components/progress/ClassroomSelector.tsx`

Excelente. Sin violaciones. Componente presentacional puro, bien tipado, con label y accesibilidad.

### 21. progress/StudentSearch.tsx (150 lineas)

**Ruta:** `apps/frontend/src/apps/admin/components/progress/StudentSearch.tsx`

Buen componente. 150 lineas exactas. Incluye click-outside handling, keyboard patterns, y aria-label.

### 22. assignments/AssignmentsTable.tsx (245 lineas)

**Ruta:** `apps/frontend/src/apps/admin/components/assignments/AssignmentsTable.tsx`

#### Violaciones
1. **[MEDIA]** 245 lineas, supera limite.
2. **[MEDIA]** Lineas 24-40: Sorting logic duplicada de `ClassroomsView`.

### 23. assignments/AssignmentFilters.tsx (195 lineas)

**Ruta:** `apps/frontend/src/apps/admin/components/assignments/AssignmentFilters.tsx`

#### Violaciones
1. **[MEDIA]** 195 lineas, supera limite moderadamente.
2. **[BAJA]** Lineas 101-107, 115-121, 129-135: Input fields con raw ID placeholders ("ID del classroom..."). UX pobre -- deberian ser dropdowns o autocompletes como en `ClassroomSelector`.

### 24. assignments/AssignmentDetailModal.tsx (285 lineas)

**Ruta:** `apps/frontend/src/apps/admin/components/assignments/AssignmentDetailModal.tsx`

#### Violaciones
1. **[ALTA]** 285 lineas, casi doble del limite. Contiene stats cards, engagement metrics, grade distribution, submissions table -- todo inline en un solo componente.
2. **[MEDIA]** Linea 78: Modal implementado con div overlay manual. Deberia usar un componente `Modal` compartido del design system.

---

## PATRONES TRANSVERSALES DETECTADOS

### P1: Boilerplate Admin (4/4 paginas)
Todas las paginas repiten:
```tsx
const { user, logout } = useAuth();
const { gamificationData, isLoading: gamificationLoading } = useUserGamification(user?.id);
const displayGamificationData = gamificationData || { /* 7-12 lineas fallback */ };
const handleLogout = () => { logout(); window.location.href = '/login'; };
// ... JSX ...
<AdminLayout user={user || undefined} gamificationData={displayGamificationData}
  organizationName="GAMILIT Platform Admin" onLogout={handleLogout}>
```
**Impacto:** 20-40 lineas por pagina x 4 paginas = 80-160 lineas eliminables.

### P2: Toast Inconsistencia (3 manual vs 1 useToast)
- `AdminAnalyticsPage`: Manual useState + useEffect (25 lineas, version minima)
- `AdminReportsPage`: Manual useState + useEffect + inline SVGs (76 lineas, version gigante)
- `AdminProgressPage`: No tiene toast (usa clearError del hook)
- `AdminAssignmentsPage`: `useToast` hook compartido (3 lineas)
**Impacto:** Deberian todos usar `useToast`.

### P3: CSV Export DOM Manipulation (3/5 hooks)
Patron identico en `useAnalytics`, `useProgress`, `useAdminAssignments`:
```tsx
const url = window.URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = `filename-${Date.now()}.csv`;
document.body.appendChild(link);
link.click();
link.remove();
window.URL.revokeObjectURL(url);
```
**Impacto:** ~10 lineas x 3 = 30 lineas. Deberia ser una utilidad `downloadBlob(blob, filename)`.

### P4: useState Manual vs React Query (3 hooks manual vs 2 React Query)
- `useAnalytics`: Manual (8 useState, 6 useCallback, 1 useEffect)
- `useReports`: Manual (5 useState, 5 useCallback, 3 useEffect, 2 useRef)
- `useProgress`: Manual (7 useState, 7 useCallback)
- `useAdminAssignments`: **React Query** (correcto)
- `useClassroomsList`: **React Query** (correcto)
**Impacto:** Los 3 hooks manuales deberian migrar a React Query para consistencia, cache, y eliminacion de boilerplate.

### P5: Table Sorting Duplicado (2 componentes)
`ClassroomsView` y `AssignmentsTable` tienen logica de sorting identica (~20 lineas cada uno).
**Impacto:** Extraer `useTableSort<T>(data, initialField, initialOrder)`.

### P6: StatCard Pattern Duplicado (4+ componentes)
Patron de card con icon + label + value repetido en: OverviewTab, EngagementTab, GamificationTab, RetentionTab, AssignmentDetailModal.
**Impacto:** Componente `StatCard` existe en OverviewTab pero no se exporta/reutiliza.

### P7: Inline SVGs vs Lucide Icons (reports/)
Los componentes de `reports/` usan SVGs inline para spinners, check marks, close buttons, y download icons. Resto del admin portal usa Lucide icons (`RefreshCw`, `Download`, etc.).
**Impacto:** ~120 lineas de SVG inline eliminables reemplazando con Lucide `Loader2`, `Check`, `X`, `Download`, `Trash2`.

### P8: Chart Tooltip Style Duplicado (analytics/)
Todos los charts en analytics/ repiten:
```tsx
contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
```
**Impacto:** Constante compartida `CHART_TOOLTIP_STYLE`.
