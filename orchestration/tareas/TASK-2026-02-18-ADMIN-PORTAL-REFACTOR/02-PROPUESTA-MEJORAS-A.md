# Propuesta de Mejoras -- Grupo A: Dashboard + Monitoring + Advanced

**Agente:** A (Dashboard + Monitoring + Advanced)
**Fecha:** 2026-02-18
**Modo:** ANALYSIS
**Referencia:** `01-HALLAZGOS-A.md` para detalles de cada violacion

---

## Resumen de Impacto Estimado

| Metrica | Antes | Despues | Reduccion |
|---------|-------|---------|-----------|
| Lineas totales (3 paginas) | 724 | ~310 | -57% |
| Lineas totales (4 hooks) | 1,159 | ~650 | -44% |
| Lineas totales (26 componentes) | 8,209 | ~5,800 | -29% |
| Violaciones CRITICA | 6 | 0 | -100% |
| Violaciones ALTA | 14 | ~2 | -86% |
| Archivos nuevos a crear | - | 14 | - |
| Archivos a eliminar | - | 2 | - |

---

## M1: Extraer Boilerplate Admin Page (CRITICA)

**Problema:** 36-51 lineas identicas en las 3 paginas (y probablemente en las ~15 restantes del portal admin).

**Archivos afectados:**
- `apps/frontend/src/apps/admin/pages/AdminDashboardPage.tsx`
- `apps/frontend/src/apps/admin/pages/AdminMonitoringPage.tsx`
- `apps/frontend/src/apps/admin/pages/AdminAdvancedPage.tsx`
- (Agentes B-E verificaran las demas paginas admin)

### M1a: Crear hook `useAdminPageSetup`

**Archivo nuevo:** `apps/frontend/src/apps/admin/hooks/useAdminPageSetup.ts`
**Lineas estimadas:** ~45

```typescript
// useAdminPageSetup.ts
// Centraliza: useAuth + useUserGamification + displayGamificationData fallback + handleLogout
// Retorna: { user, displayGamificationData, handleLogout, isReady }
```

**Contenido propuesto:**
- Encapsula `useAuth()` + `useUserGamification(user?.id)`
- Construye `displayGamificationData` con fallback una sola vez
- Expone `handleLogout` con el patron `logout() + window.location.href = '/login'`
- Expone `isReady` (cuando user ya esta disponible)

### M1b: Crear HOC/wrapper `AdminPageWrapper`

**Archivo nuevo:** `apps/frontend/src/apps/admin/components/layout/AdminPageWrapper.tsx`
**Lineas estimadas:** ~30

```typescript
// AdminPageWrapper.tsx
// Combina useAdminPageSetup + AdminLayout en un wrapper limpio
// Elimina la necesidad de repetir las 4 props de AdminLayout en cada pagina
```

**Contenido propuesto:**
- Recibe `children` y opcional `organizationName`
- Internamente llama `useAdminPageSetup()`
- Renderiza `<AdminLayout user={user} gamificationData={...} onLogout={...}>{children}</AdminLayout>`

### Resultado en cada pagina

**AdminDashboardPage.tsx:** 398 -> ~290 lineas (-108)
```tsx
// ANTES (lineas 25-65):
const { user, logout } = useAuth();
const { gamificationData, isLoading } = useUserGamification(user?.id);
const displayGamificationData = gamificationData || { ... 12 props ... };
const handleLogout = () => { ... };
return (
  <AdminLayout user={user} gamificationData={displayGamificationData} organizationName="..." onLogout={handleLogout}>
    ...
  </AdminLayout>
);

// DESPUES:
return (
  <AdminPageWrapper>
    ...
  </AdminPageWrapper>
);
```

**AdminMonitoringPage.tsx:** 184 -> ~133 lineas (-51)
**AdminAdvancedPage.tsx:** 142 -> ~111 lineas (-31)

---

## M2: Descomponer `useAdminDashboard` (CRITICA)

**Archivo actual:** `apps/frontend/src/apps/admin/hooks/useAdminDashboard.ts` (486 lineas)

### M2a: Extraer `useAdminHealth`

**Archivo nuevo:** `apps/frontend/src/apps/admin/hooks/useAdminHealth.ts`
**Lineas estimadas:** ~80

- Migrar `fetchSystemHealth` + `transformSystemHealth` (lineas 117-167)
- Estado: `systemHealth`, `loading`, `error`
- Unico intervalo: `intervals.health`
- `transformSystemHealth` como funcion pura fuera del hook
- Constante nombrada `SECONDS_PER_DAY = 86400` en vez de magic number

### M2b: Extraer `useAdminMetrics`

**Archivo nuevo:** `apps/frontend/src/apps/admin/hooks/useAdminMetrics.ts`
**Lineas estimadas:** ~70

- Migrar `fetchMetrics` + `transformSystemMetrics` (lineas 174-203)
- Estado: `metrics`, `loading`, `error`
- Unico intervalo: `intervals.metrics`
- `transformSystemMetrics` como funcion pura fuera del hook

### M2c: Extraer `useAdminAlerts`

**Archivo nuevo:** `apps/frontend/src/apps/admin/hooks/useAdminAlerts.ts`
**Lineas estimadas:** ~90

- Migrar `fetchAlerts` + `dismissAlert` (lineas 229-381)
- Estado: `alerts`, `loading`, `error`
- Unico intervalo: `intervals.alerts`
- Usar exclusivamente `adminAPI` (no mezclar con `apiClient.patch`)

### M2d: Refactorizar `useAdminDashboard` como orquestador

**Archivo modificado:** `apps/frontend/src/apps/admin/hooks/useAdminDashboard.ts`
**Lineas resultado:** ~120 (de 486)

```typescript
// useAdminDashboard.ts (orquestador)
export function useAdminDashboard(customIntervals?: Partial<RefreshIntervals>) {
  const health = useAdminHealth(customIntervals?.health);
  const metrics = useAdminMetrics(customIntervals?.metrics);
  const alerts = useAdminAlerts(customIntervals?.alerts);
  const actions = useAdminActions(customIntervals?.actions);
  const activity = useAdminActivity(customIntervals?.activity);

  const refreshAll = useCallback(async () => {
    await Promise.allSettled([
      health.refresh(),
      metrics.refresh(),
      alerts.refresh(),
      actions.refresh(),
      activity.refresh(),
    ]);
  }, [health, metrics, alerts, actions, activity]);

  // ... pauseRefresh, resumeRefresh delegados a cada sub-hook
}
```

### M2e: Eliminar doble-fetch en mount

- **Remover** el `useEffect(() => { refreshAll() }, [refreshAll])` de `AdminDashboardPage.tsx` (linea 55-57)
- Cada sub-hook ya tendra su propio useEffect de inicializacion

---

## M3: Eliminar `useSystemMonitoring` y consolidar (ALTA)

**Archivo a deprecar:** `apps/frontend/src/apps/admin/hooks/useSystemMonitoring.ts` (303 lineas)

**Justificacion:** Este hook tiene funcionalidad casi identica a `useAdminDashboard` (ambos fetchean health + alerts). Ademas tiene bugs documentados (criticalAlertCount filtra 'high', doble fetch en mount, intervalos agresivos).

### Propuesta

1. **No usar** `useSystemMonitoring` directamente en ninguna pagina
2. Los componentes que lo necesiten deben usar `useAdminHealth` + `useAdminAlerts` (los nuevos hooks de M2)
3. Si algun componente necesita `healthHistory` (historial de snapshots), agregar ese feature a `useAdminHealth`
4. Marcar `useSystemMonitoring.ts` como `@deprecated` con referencia a los reemplazos
5. Eliminar en siguiente sprint cuando se confirme 0 importers

**Impacto:** -303 lineas (deprecacion), evita 18 API calls/min de polling agresivo

---

## M4: Separar `useSystemMetrics` en 2 archivos (MEDIA)

**Archivo actual:** `apps/frontend/src/apps/admin/hooks/useSystemMetrics.ts` (101 lineas, 2 hooks)

### M4a: `useSystemMetrics` queda en su archivo

**Archivo modificado:** `apps/frontend/src/apps/admin/hooks/useSystemMetrics.ts`
**Lineas resultado:** ~55

- Remover `useHealthStatus` a archivo propio
- Wrap `fetchMetrics` en `useCallback`
- Agregar `fetchMetrics` a deps del useEffect
- Eliminar interfaz local `SystemMetrics` y usar la de `../types` (single source of truth)

### M4b: Extraer `useHealthStatus`

**Archivo nuevo:** `apps/frontend/src/apps/admin/hooks/useHealthStatus.ts`
**Lineas estimadas:** ~35

- Mover lineas 68-100 del archivo actual
- La interfaz `HealthStatus` se mueve junto

---

## M5: Limpiar `useFeatureFlags` (ALTA)

**Archivo actual:** `apps/frontend/src/apps/admin/hooks/useFeatureFlags.ts` (269 lineas)

### M5a: Extraer mock data a fixture

**Archivo nuevo:** `apps/frontend/src/apps/admin/hooks/__fixtures__/featureFlags.fixtures.ts`
**Lineas estimadas:** ~50

- Mover `MOCK_FLAGS` (lineas 41-84) a archivo de fixtures
- Exportar como `mockFeatureFlags`

### M5b: Extraer logica mock/real a servicio

**Archivo nuevo:** `apps/frontend/src/apps/admin/services/featureFlags.service.ts`
**Lineas estimadas:** ~80

- El servicio decide si usar mock o real basado en config
- Expone: `fetchFlags()`, `createFlag()`, `updateFlag()`, `deleteFlag()`, `toggleFlag()`
- Cada metodo tiene la logica mock/real encapsulada
- El hook solo gestiona estado y llama al servicio

### M5c: Refactorizar hook

**Archivo modificado:** `apps/frontend/src/apps/admin/hooks/useFeatureFlags.ts`
**Lineas resultado:** ~100 (de 269)

- Loading per-operation (no shared)
- Usa servicio de M5b
- Sin mock data inline
- Sin branching mock/real

---

## M6: Extraer utilidades compartidas (ALTA)

### M6a: Crear `adminFormatters.ts`

**Archivo nuevo:** `apps/frontend/src/apps/admin/utils/adminFormatters.ts`
**Lineas estimadas:** ~40

```typescript
// Funciones duplicadas al menos 3 veces cada una:
export function formatUptime(seconds: number): string { ... }
export function formatNumber(num: number): string { ... }
export function formatTimestamp(date: Date | string): string { ... }
export function formatBytes(bytes: number): string { ... }
```

**Archivos que se simplifican al importar:**
- `AdminDashboardHero.tsx` (remove lineas 87-104)
- `SystemMetricsGrid.tsx` (remove lineas 326-341)
- `MetricsTab.tsx` (remove lineas 34-53)
- `ErrorTrackingTab.tsx` (remove formatTimestamp local)

### M6b: Crear `adminColorUtils.ts`

**Archivo nuevo:** `apps/frontend/src/apps/admin/utils/adminColorUtils.ts`
**Lineas estimadas:** ~60

```typescript
// Al menos 6 implementaciones duplicadas del mismo concepto:
export function getStatusColor(status: 'healthy' | 'degraded' | 'critical'): string { ... }
export function getSeverityColor(severity: 'critical' | 'high' | 'medium' | 'low'): string { ... }
export function getMetricColor(value: number, thresholds: { warn: number; danger: number }): string { ... }
export function getProgressColor(percent: number): string { ... }
```

**Archivos que se simplifican al importar:**
- `AdminDashboardPage.tsx` (status ternarios lineas 188-202, 216-231, 273-298)
- `SystemAlertsPanel.tsx` (getAlertColors)
- `ErrorTrackingPanel.tsx` (severity colors)
- `ErrorTrackingTab.tsx` (getErrorLevelColor)
- `MetricsTab.tsx` (getHealthColor, getProgressColor)
- `SystemMetricsGrid.tsx` (getColorClasses)

---

## M7: Extraer `AdminTabBar` compartido (MEDIA)

**Archivo nuevo:** `apps/frontend/src/apps/admin/components/shared/AdminTabBar.tsx`
**Lineas estimadas:** ~45

```typescript
interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
}

interface AdminTabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}
```

**Paginas que se simplifican:**
- `AdminMonitoringPage.tsx`: Reemplaza lineas 90-143 (54 lineas) por ~6 lineas
- Verificar con Agentes B-E: AdminSettingsPage, AdminGamificationPage probablemente usan tabs similares

---

## M8: Extraer CSV Export compartido (MEDIA)

**Archivo nuevo (o reutilizar existente):** `apps/frontend/src/shared/hooks/useExportCSV.ts`
**Lineas estimadas:** ~40

**Nota:** `UserActivityMonitor.tsx` ya usa `useExportData` — verificar si ese hook se puede generalizar para los demas casos.

```typescript
export function useExportCSV() {
  const exportToCSV = useCallback((data: Record<string, unknown>[], filename: string, columns?: string[]) => {
    // Logica comun de generacion CSV + descarga blob
  }, []);
  return { exportToCSV };
}
```

**Archivos que se simplifican al importar:**
- `RecentActionsTable.tsx` (remove lineas 130-158, -28 lineas)
- `SystemLogsViewer.tsx` (remove lineas 55-69, -14 lineas)
- `LogsViewer.tsx` monitoring (remove lineas 100-128, -28 lineas)

---

## M9: Descomponer componentes que exceden 300+ lineas (ALTA)

### M9a: `RecentActionsTable.tsx` (479 -> ~180 + sub-componentes)

**Extracciones:**
| Nuevo componente | Lineas est. | Descripcion |
|-----------------|-------------|-------------|
| `ActionDetailModal.tsx` | ~60 | Modal de detalle de accion (lineas 421-475) |
| `Pagination.tsx` (shared) | ~50 | Paginacion reutilizable (lineas 366-418) |
| Usar `useExportCSV` | -28 | Reemplaza lineas 130-158 |

**Resultado:** `RecentActionsTable.tsx` ~180 lineas

### M9b: `ABTestingDashboard.tsx` (466 -> ~120 + sub-componentes)

**Extracciones:**
| Nuevo componente | Lineas est. | Descripcion |
|-----------------|-------------|-------------|
| `ExperimentList.tsx` | ~80 | Lista de experimentos con acciones |
| `ExperimentDetail.tsx` | ~100 | Panel de detalle con metricas |
| `ExperimentResults.tsx` | ~80 | Visualizacion de resultados A/B |
| `__fixtures__/abTesting.fixtures.ts` | ~60 | Mock data (lineas 40-98) |

**Resultado:** `ABTestingDashboard.tsx` ~120 lineas (orquestador)

### M9c: `EconomicInterventionPanel.tsx` (524 -> ~150 + sub-componentes)

**Extracciones:**
| Nuevo componente | Lineas est. | Descripcion |
|-----------------|-------------|-------------|
| `EconomyOverview.tsx` | ~80 | Cards de resumen economico |
| `CoinAdjustmentForm.tsx` | ~100 | Formulario de ajuste masivo |
| `TransactionHistory.tsx` | ~80 | Historial de transacciones |
| `ConfirmationDialog.tsx` (shared) | ~40 | Reemplaza window.confirm/alert |
| `__fixtures__/economy.fixtures.ts` | ~70 | Mock data |

**Resultado:** `EconomicInterventionPanel.tsx` ~150 lineas

### M9d: `FeatureFlagControls.tsx` -> ELIMINAR

**Justificacion:** Es un duplicado completo de `FeatureFlagsPanel.tsx` con su propio state local y mock data. Solo uno debe existir.

**Accion:** Eliminar `FeatureFlagControls.tsx` (467 lineas). Verificar 0 importers. Si hay importers, redirigir a `FeatureFlagsPanel`.

### M9e: `TenantManagementPanel.tsx` (420 -> ~140 + sub-componentes)

**Extracciones:**
| Nuevo componente | Lineas est. | Descripcion |
|-----------------|-------------|-------------|
| `TenantList.tsx` | ~80 | Lista master con filtros |
| `TenantDetail.tsx` | ~80 | Panel detail con limites |
| `TenantForm.tsx` | ~80 | Formulario crear/editar |
| `__fixtures__/tenants.fixtures.ts` | ~60 | Mock data |

**Resultado:** `TenantManagementPanel.tsx` ~140 lineas

### M9f: Otros componentes > 300 lineas

| Componente | Actual | Objetivo | Accion principal |
|-----------|--------|----------|-----------------|
| `AdminDashboardHero.tsx` | 340 | ~150 | Extraer MetricCard sub-componente, usar adminFormatters |
| `SystemAlertsPanel.tsx` | 346 | ~150 | Extraer AlertDetailModal, usar adminColorUtils |
| `SystemMetricsGrid.tsx` | 378 | ~150 | Extraer MetricCard, usar adminFormatters + adminColorUtils |
| `MetricsTab.tsx` | 373 | ~150 | Extraer sub-secciones, usar utils compartidos |
| `LogsViewer.tsx` | 351 | ~160 | Extraer useExportCSV, paginacion shared |
| `ErrorTrackingTab.tsx` | 344 | ~160 | Extraer BarChart inline, usar utils compartidos |
| `FeatureFlagsPanel.tsx` | 353 | ~150 | Extraer FlagListItem, FlagFilters como sub-componentes |
| `UserActivityChart.tsx` | 325 | ~150 | Extraer ChartConfig a init file, implementar export |

---

## M10: Conectar componentes huerfanos o eliminar (MEDIA)

### Componentes que existen pero NO se usan:

| Componente | Lineas | Decision | Justificacion |
|-----------|--------|----------|---------------|
| `QuickActionsGrid.tsx` | 215 | **USAR** | Reemplazar las acciones inline de AdminDashboardPage (lineas 346-393) por este componente |
| `SystemAlertsPanel.tsx` | 346 | **USAR** | Reemplazar las alertas inline de AdminDashboardPage (lineas 262-341) por este componente |
| `AdminDashboardHero.tsx` | 340 | **EVALUAR** | Si se decide usar, reemplazaria el header + stats de AdminDashboardPage. Si no, eliminar |
| `TenantManagementPanel.tsx` | 420 | **USAR** | Conectar en AdminAdvancedPage reemplazando placeholder card |
| `EconomicInterventionPanel.tsx` | 524 | **USAR** | Conectar en AdminAdvancedPage reemplazando placeholder card |
| `FeatureFlagControls.tsx` | 467 | **ELIMINAR** | Duplicado de FeatureFlagsPanel |

---

## M11: Limpiar codigo muerto (BAJA)

| Archivo | Lineas | Descripcion |
|---------|--------|-------------|
| `AdminAdvancedPage.tsx` L30 | 1 | Remover `SHOW_CONTENT = true` y la rama `else` (lineas 129-136) |
| `AdminAdvancedPage.tsx` L4 | 1 | Remover import `UnderConstruction` (dead) |
| `useSystemMonitoring.ts` L274 | 1 | Fix: `severity === 'high'` -> `severity === 'critical'` |
| `AdminDashboardPage.tsx` L153 | 1 | Cambiar icono `BookOpen` a `HardDrive` para Almacenamiento |
| `UserActivityChart.tsx` L188-192 | 5 | Implementar export o remover stub `console.log` |
| `SystemHealthIndicators.tsx` L136-148 | 12 | Remover mock data hardcoded (Redis, External APIs) |

---

## Resumen de Archivos

### Archivos Nuevos (14)

| # | Archivo | Lineas est. | Propuesta |
|---|---------|-------------|-----------|
| 1 | `hooks/useAdminPageSetup.ts` | ~45 | M1a |
| 2 | `components/layout/AdminPageWrapper.tsx` | ~30 | M1b |
| 3 | `hooks/useAdminHealth.ts` | ~80 | M2a |
| 4 | `hooks/useAdminMetrics.ts` | ~70 | M2b |
| 5 | `hooks/useAdminAlerts.ts` | ~90 | M2c |
| 6 | `hooks/useHealthStatus.ts` | ~35 | M4b |
| 7 | `hooks/__fixtures__/featureFlags.fixtures.ts` | ~50 | M5a |
| 8 | `services/featureFlags.service.ts` | ~80 | M5b |
| 9 | `utils/adminFormatters.ts` | ~40 | M6a |
| 10 | `utils/adminColorUtils.ts` | ~60 | M6b |
| 11 | `components/shared/AdminTabBar.tsx` | ~45 | M7 |
| 12 | `shared/hooks/useExportCSV.ts` | ~40 | M8 |
| 13 | Sub-componentes de M9 (multiples) | ~800 | M9a-f |
| 14 | `__fixtures__/` varios | ~190 | M9b,c,e |

### Archivos a Eliminar (2)

| # | Archivo | Lineas | Propuesta |
|---|---------|--------|-----------|
| 1 | `FeatureFlagControls.tsx` | 467 | M9d (duplicado) |
| 2 | `useSystemMonitoring.ts` | 303 | M3 (deprecar -> eliminar) |

### Archivos Modificados (principales)

| # | Archivo | Antes | Despues | Propuesta |
|---|---------|-------|---------|-----------|
| 1 | `AdminDashboardPage.tsx` | 398 | ~220 | M1, M10 |
| 2 | `AdminMonitoringPage.tsx` | 184 | ~100 | M1, M7 |
| 3 | `AdminAdvancedPage.tsx` | 142 | ~95 | M1, M10, M11 |
| 4 | `useAdminDashboard.ts` | 486 | ~120 | M2 |
| 5 | `useSystemMetrics.ts` | 101 | ~55 | M4 |
| 6 | `useFeatureFlags.ts` | 269 | ~100 | M5 |

---

## Orden de Ejecucion Recomendado

| Fase | Mejoras | Dependencias | Prioridad |
|------|---------|-------------|-----------|
| 1 | M1 (boilerplate), M6 (utils) | Ninguna | CRITICA |
| 2 | M2 (descomponer dashboard hook) | M6 | CRITICA |
| 3 | M3 (deprecar monitoring hook) | M2 | ALTA |
| 4 | M7 (TabBar), M8 (CSV export) | Ninguna | MEDIA |
| 5 | M9 (descomponer componentes) | M6, M7, M8 | ALTA |
| 6 | M10 (conectar huerfanos) | M9 | MEDIA |
| 7 | M4, M5, M11 (cleanup) | Ninguna | BAJA-MEDIA |

**Nota:** Las Fases 1-2 son bloqueantes para el resto. Las Fases 4 y 7 pueden ejecutarse en paralelo con cualquier otra.
