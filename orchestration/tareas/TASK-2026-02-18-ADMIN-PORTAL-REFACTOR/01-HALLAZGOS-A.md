# Hallazgos -- Grupo A: Dashboard + Monitoring + Advanced

**Agente:** A (Dashboard + Monitoring + Advanced)
**Fecha:** 2026-02-18
**Modo:** ANALYSIS

---

## Resumen

- Paginas analizadas: 3
- Hooks analizados: 4
- Componentes analizados: 26
- Total violaciones: 52 (6 CRITICA, 14 ALTA, 22 MEDIA, 10 BAJA)

---

## 1. AdminDashboardPage.tsx (398 lineas)

### Violaciones

1. **[CRITICA]** Lineas 36-47: Boilerplate `displayGamificationData` fallback — objeto literal de 12 propiedades identico en las 3 paginas admin analizadas. Debe ser extraido a un helper compartido o a un hook wrapper.
2. **[CRITICA]** Lineas 49-52: Patron `handleLogout` identico en todas las paginas admin — duplicado textualmente en AdminMonitoringPage (L65-68) y AdminAdvancedPage (L52-55).
3. **[CRITICA]** Lineas 59-65 y 395: `AdminLayout` wrapper con las mismas 4 props (`user`, `gamificationData`, `organizationName`, `onLogout`) repetido identicamente en las 3 paginas. Debe extraerse a un HOC o un layout wrapper con contexto.
4. **[ALTA]** Lineas 104-174: 4 stat cards inlined directamente (~70 lineas) en lugar de usar un componente `StatCard` reutilizable. `QuickActionsGrid` existe como componente pero NO se usa — el dashboard reimplementa una version inferior inline (lineas 346-393).
5. **[ALTA]** Lineas 178-260: Seccion "Estado del Sistema" con logica de status-color ternarios anidados (~82 lineas inline). Deberia ser un componente `SystemHealthPanel`.
6. **[ALTA]** Lineas 262-341: Seccion "Alertas y Notificaciones" inline (~80 lineas) con logica de color-por-severidad repetida. El componente `SystemAlertsPanel` existe pero no se usa en esta pagina.
7. **[MEDIA]** Linea 55-57: `useEffect(() => { refreshAll(); }, [refreshAll])` — duplica la llamada inicial que ya hace `useAdminDashboard` internamente en su propio useEffect (linea 415-418 del hook). Potencial doble fetch en mount.
8. **[MEDIA]** Lineas 97-101: Loading state custom spinner duplicado (patron comun en todo el admin portal).
9. **[MEDIA]** Lineas 346-393: Quick Actions reimplementados inline con `navigate()` en vez de usar el componente `QuickActionsGrid` que ya existe con Link-based navigation, gradients, badges, etc.
10. **[BAJA]** Linea 2, 7: `useAuth` y `useUserGamification` importados solo para el boilerplate que deberia estar en el layout.
11. **[BAJA]** Linea 153: Icono `BookOpen` usado para "Almacenamiento" — semanticamente incorrecto.

### Boilerplate Duplicado
- Lineas 25-52 (28 lineas): `useAuth + useUserGamification + displayGamificationData + handleLogout` — identico en las 3 paginas admin.
- Lineas 59-65 + 395 (8 lineas): `AdminLayout` wrapper con props identicas.
- **Total boilerplate:** 36 lineas identicas por pagina = 108 lineas duplicadas en 3 paginas.

### Mapa de Dependencias
- **Hooks:** `useAuth`, `useAdminDashboard`, `useUserGamification`, `useNavigate`
- **Componentes:** `AdminLayout`, `DetectiveCard`, `DetectiveButton` (NO usa: QuickActionsGrid, SystemAlertsPanel, SystemMetricsGrid, AdminDashboardHero, RecentActionsTable, UserActivityChart)
- **API calls:** Indirectas via `useAdminDashboard` (5 endpoints: health, metrics, actions, alerts, activity)
- **Iconos:** Users, BookOpen, Trophy, Activity, Building2, ShieldCheck, AlertCircle, RefreshCw

---

## 2. AdminMonitoringPage.tsx (184 lineas)

### Violaciones

1. **[CRITICA]** Lineas 25-68: Boilerplate identico (useAuth + useUserGamification + displayGamificationData + handleLogout) = 44 lineas. Mismo patron que Dashboard y Advanced.
2. **[ALTA]** Lineas 90-143: Tabs reimplementados manualmente con 4 botones — 54 lineas de JSX repetitivo para tabs con el mismo patron CSS. No usa un componente `TabBar` compartido. Este patron de tabs se repite con variaciones en otras paginas admin (Settings, Gamification).
3. **[MEDIA]** Linea 8: Importa `useMonitoring` pero el archivo se llama `useMonitoring.ts` (verificar) — hook separado de `useSystemMonitoring`. Hay potencial confusion entre hooks de monitoring similares.
4. **[MEDIA]** Linea 26: Estado de tab local `useState<'metrics' | 'logs' | 'errors' | 'alerts'>` — deberia ser URL-driven (query param) para que el tab sea compartible y persistente.
5. **[BAJA]** Linea 70-76: `AdminLayout` wrapper duplicado con props identicas a las otras paginas.

### Boilerplate Duplicado
- Lineas 25-68 (44 lineas): Patron completo auth+gamification+logout identico.
- Lineas 70-76 (7 lineas): AdminLayout wrapper identico.
- **Total boilerplate:** 51 lineas.

### Mapa de Dependencias
- **Hooks:** `useAuth`, `useMonitoring`, `useAlerts`, `useUserGamification`
- **Componentes:** `AdminLayout`, `LogsViewer`, `MetricsTab`, `ErrorTrackingTab`, `AlertasTab`
- **API calls:** Indirectas via `useMonitoring` (metrics, errors, trends) y `useAlerts` (alerts CRUD)
- **Iconos:** Activity, AlertTriangle, FileText, XCircle

---

## 3. AdminAdvancedPage.tsx (142 lineas)

### Violaciones

1. **[CRITICA]** Lineas 33-55: Boilerplate identico (useAuth + useUserGamification + displayGamificationData + handleLogout) = 23 lineas.
2. **[ALTA]** Linea 30: `const SHOW_CONTENT = true;` — feature flag hardcoded como constante module-level. Este es un dead code path — el branch `else` (lineas 129-136) nunca se ejecutara. Debe limpiarse removiendo el condicional y la rama muerta.
3. **[MEDIA]** Lineas 99-127: Placeholder cards ("Gestion de Tenants", "Herramientas Economicas") se muestran como DetectiveCards staticas. Los componentes `TenantManagementPanel` y `EconomicInterventionPanel` existen completamente implementados pero NO se usan aqui.
4. **[BAJA]** Linea 4: Import `UnderConstruction` solo se usa en la rama muerta (SHOW_CONTENT=false).
5. **[BAJA]** Lineas 71, 83, 93: `FeatureBadge` usado 3 veces — correcto pero verbose.

### Boilerplate Duplicado
- Lineas 33-55 (23 lineas): Patron auth+gamification+logout identico.
- Lineas 57-63 + 137 (8 lineas): AdminLayout wrapper identico.
- **Total boilerplate:** 31 lineas.

### Mapa de Dependencias
- **Hooks:** `useAuth`, `useUserGamification`
- **Componentes:** `AdminLayout`, `FeatureBadge`, `UnderConstruction` (dead), `DetectiveCard`, `FeatureFlagsPanel`, `ABTestingDashboard` (NO usa: TenantManagementPanel, EconomicInterventionPanel)
- **API calls:** Ninguna directa (delegadas a componentes hijos)
- **Iconos:** Zap, Beaker, Users, Wrench

---

## 4. useAdminDashboard.ts (486 lineas)

### Violaciones

1. **[CRITICA]** Lineas 88-97 + 99-106 + 270-351 + 383-452: Hook monolitico de 486 lineas que gestiona 5 flujos de datos independientes (health, metrics, actions, alerts, activity) con 5 setInterval separados. Viola SRP masivamente. Cada flujo deberia ser un hook independiente orquestado por un hook compuesto.
2. **[ALTA]** Lineas 415-418 + 423-452: La pagina `AdminDashboardPage` llama `refreshAll()` en su propio useEffect ADEMAS de que el hook ya tiene un useEffect interno que llama `refreshAll()` en mount. Esto produce un doble-fetch: 10 API calls en mount en vez de 5.
3. **[ALTA]** Lineas 19-22: Importa `apiClient` y `API_ENDPOINTS` directamente Y tambien importa `adminAPI` — mezcla de abstracciones. El `apiClient.patch` en linea 365 deberia usar `adminAPI`.
4. **[ALTA]** Lineas 84-85: `eslint-disable-next-line react-hooks/exhaustive-deps` para `intervals` — el merge de intervals no es memoizado, lo que podria causar re-renders innecesarios.
5. **[MEDIA]** Lineas 117-137 y 174-187: Funciones `transformSystemHealth` y `transformSystemMetrics` estan definidas dentro del hook pero no son callbacks ni memoizadas. Deberian estar fuera del hook como funciones puras o en un archivo de transformers.
6. **[MEDIA]** Lineas 356-381: `dismissAlert` usa `apiClient.patch` directamente en vez de `adminAPI`.
7. **[MEDIA]** Lineas 330-341: Logging en `refreshAll` con array de nombres hardcoded — fragil si se agregan/remueven fetches.
8. **[BAJA]** Lineas 117-137: `transformSystemHealth` usa magic number `86400` para calcular uptime percentage — deberia ser una constante nombrada.

### Mapa de Dependencias
- **Imports:** `apiClient`, `API_ENDPOINTS`, `adminAPI`, tipos de `adminTypes` y `../types`
- **Retorna:** 13 propiedades (5 data, 3 state, 7 actions)
- **Endpoints usados:** `adminAPI.getSystemHealth()`, `adminAPI.getSystemMetrics()`, `adminAPI.getRecentActions()`, `adminAPI.getAlerts()`, `adminAPI.getUserActivity()`, `API_ENDPOINTS.admin.alertActions.suppress()`

---

## 5. useSystemMonitoring.ts (303 lineas)

### Violaciones

1. **[ALTA]** Lineas 45-47: Intervalos AGRESIVOS — `HEALTH_CHECK_INTERVAL = 10000` (10s) y `ALERT_CHECK_INTERVAL = 5000` (5s). Esto genera 18 API calls/minuto solo de este hook. Contradice el fix LOW-001 en useAdminDashboard que ajusto intervalos por ser "too aggressive".
2. **[ALTA]** Lineas 243-267: DOS useEffects ejecutados en mount — uno para `init()` (fetches health+alerts) y otro para `startMonitoring()` (que TAMBIEN fetches health+alerts). Esto produce 4 API calls redundantes en mount.
3. **[MEDIA]** Lineas 216-234: `clearAllAlerts` — itera `activeAlerts` del state para hacer N API calls individuales. N+1 problem — deberia haber un bulk endpoint o al menos un limite.
4. **[MEDIA]** Linea 274: `criticalAlertCount` filtra por `severity === 'high'` pero se llama "criticalAlertCount" — deberia filtrar por `severity === 'critical'`.
5. **[MEDIA]** Patron general: Mucha funcionalidad solapada con `useAdminDashboard` — ambos fetchean system health y alerts. No es claro cuando usar uno vs otro.

### Mapa de Dependencias
- **Imports:** `apiClient`, `API_ENDPOINTS`, tipos `SystemHealth`, `SystemAlert`
- **Retorna:** 11 propiedades (health, healthHistory, alerts, counts, state, actions)

---

## 6. useSystemMetrics.ts (101 lineas)

### Violaciones

1. **[MEDIA]** Lineas 36-57: `fetchMetrics` no es wrapped en `useCallback` — sera recreada en cada render, causando que el `useEffect` (linea 59-63) limpie y re-cree el interval en cada render.
2. **[MEDIA]** Linea 63: `useEffect` tiene `refreshInterval` en deps pero `fetchMetrics` no esta en deps — violacion de exhaustive-deps (suprimida implicitamente).
3. **[MEDIA]** Lineas 25-66 vs 77-100: Dos hooks exportados desde el mismo archivo (`useSystemMetrics` y `useHealthStatus`) — deberian estar en archivos separados por SRP.
4. **[BAJA]** Linea 5: Interfaz `SystemMetrics` definida localmente — hay OTRA interfaz `SystemMetrics` en `../types` y otra en `@/services/api/adminTypes`. Tres definiciones del mismo concepto.

### Mapa de Dependencias
- **Imports:** `apiClient`, `API_ENDPOINTS`
- **Retorna:** (`useSystemMetrics`) metrics, history, loading, error, refresh; (`useHealthStatus`) health, loading

---

## 7. useFeatureFlags.ts (269 lineas)

### Violaciones

1. **[CRITICA]** Lineas 41-84: `MOCK_FLAGS` — 43 lineas de datos mock hardcoded en el hook. Estos deberian estar en un archivo de fixtures separado o eliminados si ya no se necesitan.
2. **[ALTA]** Linea 87: `USE_MOCK_DATA = FEATURE_FLAGS.USE_MOCK_DATA || FEATURE_FLAGS.MOCK_API` — decision de mock/real no deberia estar en el hook sino en la capa de API.
3. **[ALTA]** Lineas 97-119, 124-166, 171-209, 214-240: Cada operacion CRUD (fetch, create, update, delete) tiene duplicacion del patron `if (USE_MOCK_DATA) { delay + local state } else { apiClient call }`. Esto deberia estar en una capa de servicio.
4. **[MEDIA]** Linea 91: `loading` state es shared para TODAS las operaciones — un create en progreso bloquea visualmente todo el panel. Deberia ser loading per-operation.
5. **[MEDIA]** Lineas 245-256: `toggleFlag` accede a `flags` state directamente — stale closure risk si flags cambia entre renders.

### Mapa de Dependencias
- **Imports:** `apiClient`, `FEATURE_FLAGS`, `API_ENDPOINTS`, tipos de `../types`
- **Retorna:** flags, loading, error, createFlag, updateFlag, deleteFlag, toggleFlag, fetchFlags

---

## 8-26. Componentes

### Dashboard Components

| # | Componente | Lineas | Violaciones |
|---|-----------|--------|-------------|
| 8 | `AdminDashboardHero.tsx` | 340 | **[ALTA]** 340 lineas excede limite de 150. `formatUptime` y `formatNumber` duplicados (existen en SystemMetricsGrid y MetricsTab). 6 motion.div metric cards con estructura repetitiva deberian ser un sub-componente. |
| 9 | `QuickActionsGrid.tsx` | 215 | **[ALTA]** 215 lineas excede limite. Contiene sub-componente QuickActionCard bien separado. `getColorClasses` duplica mapeo de colores de otros componentes. **NO se usa en AdminDashboardPage** — componente huerfano. |
| 10 | `RecentActionsTable.tsx` | 479 | **[CRITICA]** 479 lineas — 3x el limite. CSV export (lineas 130-158) duplica patron de export. Modal inline (lineas 421-475). Paginacion manual reimplementada (lineas 366-418). Tiene `eslint-disable @typescript-eslint/no-explicit-any`. |
| 11 | `SystemAlertsPanel.tsx` | 346 | **[ALTA]** 346 lineas. Modal inline (lineas 176-252). Sub-componente AlertCard bien separado pero recibe 8 props incluyendo funciones helper — deberia usar contexto o module-scope helpers. `getAlertColors` retorna `any`. |
| 12 | `SystemLogsViewer.tsx` | 163 | **[MEDIA]** Export function (lineas 55-69) duplica patron de descarga blob. `eslint-disable @typescript-eslint/no-explicit-any`. fetchLogs no es useCallback — nuevo fetch en cada filter change con race condition potencial. |
| 13 | `SystemMetricsGrid.tsx` | 378 | **[ALTA]** 378 lineas. `formatNumber` y `formatUptime` duplicados (tambien en AdminDashboardHero, MetricsTab). `getColorClasses` duplica mapeo de colores. Animated counter logic en MetricCard podria ser un hook. |
| 14 | `UserActivityChart.tsx` | 325 | **[ALTA]** 325 lineas. `eslint-disable @typescript-eslint/no-explicit-any`. `handleExportChart` (linea 188-192) es un stub que solo hace console.log. ChartJS registration deberia estar en un init file compartido. |
| 15 | `UserManagementTable.tsx` | 157 | **[MEDIA]** OK en tamano. `eslint-disable` en linea 29. No tiene paginacion a diferencia de RecentActionsTable. |
| 16 | `OrganizationsTable.tsx` | 182 | **[ALTA]** Fetch inline con useEffect + useState en vez de React Query. No tiene paginacion. |

### Monitoring Components

| # | Componente | Lineas | Violaciones |
|---|-----------|--------|-------------|
| 17 | `AlertasTab.tsx` | 260 | **[MEDIA]** Correcto tamano pero mezcla logica de filtrado + UI. |
| 18 | `ErrorTrackingPanel.tsx` | 243 | **[MEDIA]** OK. Duplica patron de severity colors ya presente en SystemAlertsPanel y ErrorTrackingTab. |
| 19 | `ErrorTrackingTab.tsx` | 344 | **[ALTA]** 344 lineas. `formatTimestamp` y `getErrorLevelColor` deberian ser utils compartidos. Inline bar chart (lineas 204-234) en vez de componente. |
| 20 | `LogsViewer.tsx` (monitoring) | 351 | **[ALTA]** 351 lineas. CSV export patron duplicado (3ra vez). Paginacion reimplementada (tambien en RecentActionsTable). |
| 21 | `MetricsChart.tsx` | 128 | OK. Bien proporcionado. `eslint-disable @typescript-eslint/no-explicit-any`. |
| 22 | `MetricsTab.tsx` | 373 | **[ALTA]** 373 lineas. `formatUptime` y `formatNumber` duplicados OTRA vez. `getHealthColor` y `getProgressColor` duplican logica de color-by-threshold. |
| 23 | `SystemPerformanceDashboard.tsx` | 233 | **[MEDIA]** Usa `useSystemMetrics` directamente — fetch autonomo separado del useMonitoring del page. Potencial conflicto de datos. |
| 24 | `UserActivityMonitor.tsx` | 239 | **[MEDIA]** CSV export via `useExportData` (bien). Pero fetch autonomo — no recibe data del page. |
| 25 | `SystemHealthIndicators.tsx` | 294 | **[MEDIA]** Mock data mezclado con datos reales (Redis/External APIs hardcoded como `healthy`). `any` cast en linea 242. |

### Advanced Components

| # | Componente | Lineas | Violaciones |
|---|-----------|--------|-------------|
| 26 | `ABTestingDashboard.tsx` | 466 | **[CRITICA]** 466 lineas, 3x el limite. Todo mock data en useState (lineas 40-98). Inline experiment details panel completo. window.confirm para confirmaciones. Deberian ser minimo 3 componentes: ExperimentList, ExperimentDetail, ExperimentResults. |
| 27 | `FeatureFlagsPanel.tsx` | 353 | **[ALTA]** 353 lineas. Bien estructurado pero largo. Inline filter + list deberian ser componentes separados. |
| 28 | `FeatureFlagEditor.tsx` | 229 | **[ALTA]** Inline modal (linea 105: `fixed inset-0 z-50`) en vez de usar el componente `Modal` del shared. No tiene backdrop click-to-close. |
| 29 | `FeatureFlagControls.tsx` | 467 | **[CRITICA]** 467 lineas. Duplica TODA la funcionalidad de FeatureFlagsPanel + useFeatureFlags pero con su propio state local y mock data. Parece una version anterior no limpiada. |
| 30 | `RolloutSlider.tsx` | 130 | OK. Bien encapsulado. |
| 31 | `TargetingConfig.tsx` | 140 | OK. Bien encapsulado. |
| 32 | `TenantManagementPanel.tsx` | 420 | **[ALTA]** 420 lineas. Todo mock data. NO se usa desde AdminAdvancedPage (solo placeholder cards). Master-detail pattern inline. |
| 33 | `EconomicInterventionPanel.tsx` | 524 | **[CRITICA]** 524 lineas — el componente mas largo. Todo mock data. `window.confirm` y `alert()` para UX critica de economia. NO se usa desde AdminAdvancedPage. |

---

## Patrones Transversales Identificados

### P1: Boilerplate Admin Page (36 lineas x N paginas)
```
useAuth + useUserGamification + displayGamificationData fallback + handleLogout + AdminLayout wrapper
```
Presente en: AdminDashboardPage, AdminMonitoringPage, AdminAdvancedPage (y probablemente todas las demas paginas admin).

### P2: CSV Export duplicado (3+ implementaciones)
- RecentActionsTable.tsx (lineas 130-158)
- SystemLogsViewer.tsx (lineas 55-69)
- LogsViewer.tsx monitoring (lineas 100-128)
- UserActivityMonitor.tsx (via useExportData — la unica que usa un helper)

### P3: formatUptime / formatNumber duplicados
- AdminDashboardHero.tsx (lineas 87-104)
- SystemMetricsGrid.tsx (lineas 326-341)
- MetricsTab.tsx (lineas 34-53)

### P4: Color mapping functions duplicadas
- getStatusColor, getAlertColors, getMetricColor, severityColors, etc. — al menos 6 implementaciones distintas del mismo concepto.

### P5: Tabs reimplementados
- AdminMonitoringPage (manual buttons)
- Probablemente AdminSettingsPage, AdminGamificationPage (otros grupos verificaran)

### P6: Componentes existentes no utilizados
- `QuickActionsGrid` — existe pero Dashboard usa version inline inferior
- `SystemAlertsPanel` — existe pero Dashboard usa version inline
- `AdminDashboardHero` — existe pero no se usa en ninguna pagina
- `TenantManagementPanel` — existe completo pero Advanced muestra placeholder
- `EconomicInterventionPanel` — existe completo pero Advanced muestra placeholder
- `FeatureFlagControls` — duplicado de FeatureFlagsPanel, ambos existen

### P7: Hooks con overlap funcional
- `useAdminDashboard` vs `useSystemMonitoring` — ambos fetchean health + alerts
- `useSystemMetrics` vs `useMonitoring` — ambos fetchean metricas del sistema
- `useFeatureFlags` con mock data inline vs posible servicio real
