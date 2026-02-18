# Propuesta de Mejoras -- Grupo D: Analytics + Reports + Progress + Assignments

**Agente:** D
**Fecha:** 2026-02-18

---

## Resumen de Impacto

| Pagina | Lineas Actuales | Lineas Objetivo | Reduccion |
|--------|----------------|-----------------|-----------|
| AdminAnalyticsPage.tsx | 300 | ~110 | -63% |
| AdminReportsPage.tsx | 302 | ~85 | -72% |
| AdminProgressPage.tsx | 315 | ~130 | -59% |
| AdminAssignmentsPage.tsx | 295 | ~120 | -59% |
| **Total paginas** | **1,212** | **~445** | **-63%** |

---

## FASE 1: Extracciones Transversales (afectan todas las paginas)

### M1: HOC/Wrapper `withAdminPage` o hook `useAdminPage`

**Archivo a crear:** `apps/frontend/src/apps/admin/hooks/useAdminPage.ts` (~30 lineas)

**Descripcion:** Encapsula el boilerplate que se repite en las 4 paginas:
- `useAuth()` para obtener `user` y `logout`
- `useUserGamification(user?.id)` con fallback data
- `handleLogout` con redirect a `/login`
- Retorna `{ user, displayGamificationData, handleLogout }` listo para pasar a `AdminLayout`

**Impacto:** Elimina 20-40 lineas de boilerplate por pagina (80-160 lineas total).

**Alternativa:** Un componente wrapper `AdminPageShell` que envuelve AdminLayout y maneja todo internamente. Las paginas solo pasan `children` y titulo.

```tsx
// Ejemplo de uso
export default function AdminAnalyticsPage() {
  const { user, gamificationData, handleLogout } = useAdminPage();
  // ... solo logica especifica de la pagina ...
  return (
    <AdminLayout user={user} gamificationData={gamificationData} onLogout={handleLogout}>
      {/* contenido */}
    </AdminLayout>
  );
}
```

---

### M2: Unificar Toast a `useToast` en todas las paginas

**Archivos a modificar:** `AdminAnalyticsPage.tsx`, `AdminReportsPage.tsx`
**Referencia:** `AdminAssignmentsPage.tsx` ya usa `useToast` correctamente.

**Descripcion:** Reemplazar:
- `const [toast, setToast] = useState(...)` + `useEffect` auto-dismiss (25-76 lineas)
- Con: `const { toasts, showToast } = useToast()` + `<ToastContainer toasts={toasts} />`

**Impacto:**
- AdminAnalyticsPage: -22 lineas
- AdminReportsPage: -73 lineas (elimina SVGs inline masivos)
- AdminProgressPage: Agregar toast donde no existe (para exportacion)

---

### M3: Utilidad `downloadBlob`

**Archivo a crear:** `apps/frontend/src/shared/utils/downloadBlob.ts` (~15 lineas)

**Descripcion:** Funcion reutilizable que encapsula el patron de download:
```tsx
export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
```

**Archivos a modificar:** `useAnalytics.ts`, `useProgress.ts`, `useAdminAssignments.ts`, `useReports.ts`

**Impacto:** -10 lineas x 4 hooks = -40 lineas total.

---

### M4: Hook `useTableSort<T>`

**Archivo a crear:** `apps/frontend/src/shared/hooks/useTableSort.ts` (~25 lineas)

**Descripcion:** Hook generico para sorting de tablas:
```tsx
export function useTableSort<T>(data: T[], initialField: keyof T, initialOrder: 'asc' | 'desc' = 'asc') {
  const [sortField, setSortField] = useState(initialField);
  const [sortOrder, setSortOrder] = useState(initialOrder);
  const sorted = useMemo(() => /* sorting logic */, [data, sortField, sortOrder]);
  const handleSort = (field: keyof T) => { /* toggle logic */ };
  return { sorted, sortField, sortOrder, handleSort };
}
```

**Archivos a modificar:** `ClassroomsView.tsx` (-20 lineas), `AssignmentsTable.tsx` (-20 lineas)

**Impacto:** -40 lineas total + patron reutilizable para futuras tablas.

---

### M5: Componente `AdminStatCard`

**Archivo a crear:** `apps/frontend/src/apps/admin/components/shared/AdminStatCard.tsx` (~35 lineas)

**Descripcion:** Componente presentacional para stat cards que se repite en 6+ componentes:
```tsx
interface AdminStatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;      // e.g. 'blue', 'green', 'orange'
  subtitle?: string;
}
```

**Archivos a modificar:** `OverviewTab.tsx` (elimina StatCard local), `EngagementTab.tsx`, `GamificationTab.tsx`, `RetentionTab.tsx`, `AdminAssignmentsPage.tsx`

**Impacto:** -15 lineas promedio x 5 archivos = -75 lineas.

---

### M6: Constante `CHART_TOOLTIP_STYLE`

**Archivo a crear (o agregar a):** `apps/frontend/src/apps/admin/components/analytics/chartConfig.ts` (~10 lineas)

**Descripcion:**
```tsx
export const CHART_TOOLTIP_STYLE = {
  backgroundColor: '#1F2937',
  border: '1px solid #374151',
  borderRadius: '8px',
};

export const CHART_GRID_STROKE = '#374151';
export const CHART_AXIS_STROKE = '#9CA3AF';
```

**Archivos a modificar:** `OverviewTab.tsx`, `EngagementTab.tsx`, `GamificationTab.tsx`, `RetentionTab.tsx`

**Impacto:** Consistencia visual + -4 lineas x 8 charts = -32 lineas.

---

## FASE 2: Migracion de Hooks a React Query

### M7: Migrar `useAnalytics` a React Query

**Archivo a reescribir:** `apps/frontend/src/apps/admin/hooks/useAnalytics.ts`

**Lineas actuales:** 223
**Lineas objetivo:** ~80

**Descripcion:** Reemplazar 8 `useState` + 6 `useCallback` + 1 `useEffect` por:
- `useQuery(['admin', 'analytics', 'overview'], () => adminAPI.analytics.getOverview())`
- `useQuery(['admin', 'analytics', 'engagement'], ...)`
- etc.
- Un wrapper que combina los 6 queries con `isLoading` derivado
- La funcion `refresh` se reemplaza por `queryClient.invalidateQueries(['admin', 'analytics'])`

**Beneficios:** Cache automatico, refetch on focus, no race conditions, loading/error states per-query.

---

### M8: Migrar `useReports` a React Query

**Archivo a reescribir:** `apps/frontend/src/apps/admin/hooks/useReports.ts`

**Lineas actuales:** 272
**Lineas objetivo:** ~90

**Descripcion:** Reemplazar:
- `useState` + `useCallback` + `useRef` + `setInterval` por:
- `useQuery(['admin', 'reports', filters], ..., { refetchInterval: hasPending ? 5000 : false })`
- `useMutation` para generate, download, delete con `onSuccess: () => queryClient.invalidateQueries(['admin', 'reports'])`

**Beneficios:** Elimina `isMountedRef`, `refreshTimerRef`, manual cleanup. Auto-refresh condicional built-in.

---

### M9: Migrar `useProgress` a React Query

**Archivo a reescribir:** `apps/frontend/src/apps/admin/hooks/useProgress.ts`

**Lineas actuales:** 222
**Lineas objetivo:** ~70

**Descripcion:** Reemplazar 7 `useState` + 7 `useCallback` por queries individuales:
- `useProgressOverview()` -- enabled when view is 'overview'
- `useClassroomProgress(classroomId)` -- enabled when classroomId is set
- `useStudentProgress(studentId, filters)` -- enabled when studentId is set

**Impacto adicional:** Simplifica `AdminProgressPage.tsx` que ya no necesita coordinar fetch imperativo.

---

### M10: Eliminar `eslint-disable` y corregir `any`

**Archivos a modificar:**
- `useProgress.ts` linea 16: Eliminar `eslint-disable`, tipar parametros correctamente
- `OverviewTab.tsx` linea 13: Eliminar `eslint-disable`, tipar `icon` como `React.ComponentType` y `entry` del Pie chart
- `RetentionTab.tsx` linea 144: Tipar `value` del formatter

**Impacto:** 0 lineas cambiadas, mejora de type-safety.

---

## FASE 3: Descomposicion de Componentes

### M11: Descomponer `ReportsList.tsx` (339 -> ~120 + componentes)

**Archivos a crear:**
1. `reports/ReportRow.tsx` (~60 lineas) -- fila individual con botones de accion
2. `reports/EmptyReportsState.tsx` (~25 lineas) -- estado vacio

**Descripcion:** Reemplazar SVGs inline con Lucide icons (`Loader2`, `Download`, `Trash2`). Extraer fila de tabla a componente separado.

---

### M12: Descomponer `ReportGenerationForm.tsx` (365 -> ~150 + hooks)

**Cambios:**
1. Migrar fetches de organizations/classrooms a React Query hooks (elimina 50 lineas de useEffect manual)
2. Extraer constantes `REPORT_TYPES` y `REPORT_FORMATS` a archivo separado
3. Reemplazar SVG spinner con `Loader2` de Lucide

---

### M13: Descomponer `AssignmentDetailModal.tsx` (285 -> ~100 + componentes)

**Archivos a crear:**
1. `assignments/AssignmentStatsCards.tsx` (~40 lineas)
2. `assignments/EngagementMetrics.tsx` (~30 lineas)
3. `assignments/GradeDistribution.tsx` (~35 lineas)
4. `assignments/SubmissionsTable.tsx` (~50 lineas)

**Descripcion:** El modal actualmente contiene 4 secciones independientes que deberian ser componentes presentacionales.

---

### M14: Descomponer tabs de analytics/ (4 componentes > 150 lineas)

**OverviewTab.tsx (311 -> ~120):**
- Extraer `StatCard` como `AdminStatCard` compartido (M5)
- Extraer tabla de top users a `TopUsersTable.tsx` (~50 lineas)

**EngagementTab.tsx (221 -> ~80):**
- Usar `AdminStatCard` compartido
- Extraer tabla de desglose a `EngagementBreakdownTable.tsx` (~50 lineas)

**GamificationTab.tsx (252 -> ~100):**
- Usar `AdminStatCard` compartido
- Extraer tabla de rangos a `RanksDetailsTable.tsx` (~40 lineas)

**RetentionTab.tsx (309 -> ~120):**
- Usar `AdminStatCard` compartido
- Extraer best/worst cohort cards a `CohortHighlightCard.tsx` (~40 lineas)
- Extraer cohort table a `CohortTable.tsx` (~50 lineas)

---

### M15: Componente `AdminPagination`

**Archivo a crear:** `apps/frontend/src/apps/admin/components/shared/AdminPagination.tsx` (~40 lineas)

**Descripcion:** Componente de paginacion reutilizable:
```tsx
interface AdminPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}
```

**Archivos a modificar:** `AdminAssignmentsPage.tsx` (-22 lineas), `AdminReportsPage.tsx` (-5 lineas)

---

## RESUMEN DE ARCHIVOS NUEVOS A CREAR

| # | Archivo | Lineas | Tipo |
|---|---------|--------|------|
| 1 | `admin/hooks/useAdminPage.ts` | ~30 | Hook compartido |
| 2 | `shared/utils/downloadBlob.ts` | ~15 | Utilidad |
| 3 | `shared/hooks/useTableSort.ts` | ~25 | Hook generico |
| 4 | `admin/components/shared/AdminStatCard.tsx` | ~35 | Componente presentacional |
| 5 | `admin/components/analytics/chartConfig.ts` | ~10 | Constantes |
| 6 | `admin/components/shared/AdminPagination.tsx` | ~40 | Componente presentacional |
| 7 | `admin/components/reports/ReportRow.tsx` | ~60 | Componente presentacional |
| 8 | `admin/components/reports/EmptyReportsState.tsx` | ~25 | Componente presentacional |
| 9 | `admin/components/assignments/AssignmentStatsCards.tsx` | ~40 | Componente presentacional |
| 10 | `admin/components/assignments/EngagementMetrics.tsx` | ~30 | Componente presentacional |
| 11 | `admin/components/assignments/GradeDistribution.tsx` | ~35 | Componente presentacional |
| 12 | `admin/components/assignments/SubmissionsTable.tsx` | ~50 | Componente presentacional |
| 13 | `admin/components/analytics/TopUsersTable.tsx` | ~50 | Componente presentacional |
| 14 | `admin/components/analytics/EngagementBreakdownTable.tsx` | ~50 | Componente presentacional |
| 15 | `admin/components/analytics/RanksDetailsTable.tsx` | ~40 | Componente presentacional |
| 16 | `admin/components/analytics/CohortHighlightCard.tsx` | ~40 | Componente presentacional |
| 17 | `admin/components/analytics/CohortTable.tsx` | ~50 | Componente presentacional |
| **Total nuevos** | | **~625** | |

## RESUMEN DE REDUCCION ESTIMADA

| Categoria | Antes | Despues | Delta |
|-----------|-------|---------|-------|
| Paginas (4) | 1,212 | ~445 | -767 |
| Hooks (5) | 1,081 | ~540 | -541 |
| Componentes (15) | 3,408 | ~2,200 | -1,208 |
| **Subtotal existentes** | **5,701** | **~3,185** | **-2,516** |
| Nuevos archivos (17) | 0 | +625 | +625 |
| **TOTAL NETO** | **5,701** | **~3,810** | **-1,891 (-33%)** |

---

## ORDEN DE EJECUCION RECOMENDADO

1. **Fase 1 (sin riesgo):** M3 (downloadBlob), M5 (AdminStatCard), M6 (chartConfig) -- solo extracciones.
2. **Fase 1 (bajo riesgo):** M1 (useAdminPage), M2 (unificar toast), M4 (useTableSort) -- refactors internos.
3. **Fase 2 (medio riesgo):** M7-M9 (migrar hooks a React Query) -- cambio de paradigma, requiere tests.
4. **Fase 3 (bajo riesgo):** M11-M15 (descomposicion de componentes) -- extracciones de JSX.
5. **Fase cleanup:** M10 (eliminar any/eslint-disable).
