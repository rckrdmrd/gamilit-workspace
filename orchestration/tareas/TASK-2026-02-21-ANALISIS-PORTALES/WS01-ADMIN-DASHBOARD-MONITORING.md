# WS01 - Admin: Dashboard, Monitoring, Analytics, Audit

**Fecha:** 2026-02-21
**Scope:** Portal Admin — Paginas de Dashboard, Monitoreo, Analytics y Audit Logs
**Estado:** Analisis completo

---

## 1. Inventario de Paginas

---

### AdminDashboardPage

- **Archivo:** `apps/frontend/src/apps/admin/pages/AdminDashboardPage.tsx`
- **Ruta:** `/admin/dashboard` (inferida por convencion; verificar en App.tsx)
- **Ultima actualizacion doc:** 2026-02-18 (refactor AdminPageShell + extraccion de secciones inline)

#### Componentes (arbol de renderizado)

```
AdminPageShell
  └─ div.space-y-6
      ├─ Header (h1 + DetectiveButton[Actualizar])
      ├─ aria-live[error] → DetectiveCard → div[role=alert]
      ├─ [loading] → spinner div[role=status]
      │   └─ [!loading] → DashboardStatsGrid (metrics)
      ├─ [!loading] → div[role=region, aria-label="Salud del sistema y alertas"]
      │   ├─ SystemHealthCard (systemHealth, activeSessions)
      │   └─ AlertsNotificationsCard (alerts, flaggedContentCount, onDismissAlert)
      └─ [!loading] → DashboardQuickActions (metrics)
```

- **Hooks consumidos:**
  - `useAdminDashboard` — fuente de todos los datos de la pagina

- **Endpoints API (via useAdminDashboard → adminAPI):**
  - `GET /admin/health` → salud del sistema (interval 30s)
  - `GET /admin/metrics` → metricas de sistema (interval 60s)
  - `GET /admin/actions?limit=10` → acciones recientes (interval 120s)
  - `GET /admin/alerts` → alertas activas (interval 30s)
  - `GET /admin/activity?groupBy=day` → actividad de usuario (interval 300s)
  - `PATCH /admin/alerts/:id/suppress` → descartar alerta (mutacion)

- **Estado:**
  - React Query (TanStack Query) con 5 queries paralelas + 1 mutacion
  - `loading` = true solo si TODAS las queries estan cargando simultaneamente (AND logic)
  - `error` = primer error de metricsQuery, actionsQuery o activityQuery (healthQuery y alertsQuery tienen fallback silencioso)

- **Interacciones:**
  - Boton "Actualizar": llama `refreshAll()` → `queryClient.invalidateQueries(dashboardKeys.all)`
  - Boton "x" por alerta: llama `dismissAlert(id)` → mutacion PATCH
  - Quick actions (4 botones): navegacion a `/admin/users`, `/admin/institutions`, `/admin/content`, `/admin/gamification`

- **Errores:**
  - Error de metricas/acciones/actividad → `aria-live="polite"` + `role="alert"` con mensaje textual
  - healthQuery y alertsQuery fallan silenciosamente con valores de fallback (status 'critical', arreglo vacio)
  - No hay retry button explicito en el bloque de error; el boton "Actualizar" del header actua como retry

- **Carga (loading states):**
  - Spinner centralizado cuando `loading && !metrics` (primera carga total)
  - Las secciones de salud/alertas/quick-actions se ocultan condicionalmente con `!loading` (desaparecen durante refresh)
  - No usa skeletons, solo spinner de pagina completa o ausencia de secciones

- **Accesibilidad:**
  - `aria-live="polite"` en contenedor de error
  - `role="alert"` en mensaje de error
  - `role="status"` + `span.sr-only` en spinner
  - `role="region"` + `aria-label` en seccion salud+alertas
  - Boton refresh tiene texto visible "Actualizar" mas icono
  - FALTA: `aria-label` en boton de dismiss de alerta (solo texto "×")
  - FALTA: Los 4 botones de QuickActions no tienen `aria-label` ni descripcion accesible mas alla del texto visible

- **Responsividad:**
  - Stats grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
  - Health+Alerts grid: `grid-cols-1 lg:grid-cols-2`
  - Quick Actions grid: `grid-cols-2 md:grid-cols-4`

- **Issues identificados:**
  - [P1] **Loading logic AND-gate**: `loading` usa `&&` en lugar de `||` — si cualquier query individual carga mas rapido que las demas, `loading` vuelve false prematuramente y se muestran secciones parcialmente vacias
  - [P2] **AdminDashboardHero no se usa**: componente `AdminDashboardHero` (rico, con framer-motion, barras de progreso, animacion critica) existe en `components/dashboard/` pero NO es importado ni referenciado en `AdminDashboardPage`. La pagina usa `SystemHealthCard` mas simple en su lugar
  - [P2] **9 componentes orphaned en dashboard/index.ts**: `SystemMetricsGrid`, `QuickActionsGrid`, `RecentActionsTable`, `UserActivityChart`, `SystemAlertsPanel`, `UserManagementTable`, `SystemLogsViewer`, `OrganizationsTable` — exportados pero no usados en ninguna pagina de este scope
  - [P2] **No hay skeleton loaders**: la experiencia es binaria (spinner o contenido completo); las refetches en segundo plano ocultan secciones completas
  - [P2] **flaggedContentCount siempre null**: `transformSystemMetrics` asigna `flaggedContentCount: null` explicitamente — el card "Contenido Flagged" y el fallback en AlertsNotificationsCard siempre muestran "N/A"
  - [P2] **userGrowth y organizationGrowth siempre null**: campos de crecimiento ignorados en transformacion — UI no puede mostrar tendencias
  - [P2] **Dismiss alert usa endpoint "suppress"** en lugar de un endpoint dedicado de dismiss — puede tener semantica distinta en backend

---

### AdminMonitoringPage

- **Archivo:** `apps/frontend/src/apps/admin/pages/AdminMonitoringPage.tsx`
- **Ruta:** `/admin/monitoring`
- **Ultima actualizacion doc:** 2025-11-24 (Plan 4 completo)

#### Componentes (arbol de renderizado)

```
AdminPageShell
  └─ div.space-y-6
      ├─ Header (h1 + Activity icon)
      ├─ AdminTabBar (tabs: logs|metrics|errors|alerts, variant="underline")
      └─ div[role=region, aria-label="Contenido de pestana: {label}"]
          ├─ [activeTab=logs]    → LogsViewer
          ├─ [activeTab=metrics] → MetricsTab (metrics, isLoading, onRefresh)
          ├─ [activeTab=errors]  → ErrorTrackingTab (stats, recentErrors, trends, isLoading, onRefresh)
          └─ [activeTab=alerts]  → AlertasTab (alerts, stats, isLoading, onRefresh, onAcknowledge, onResolve)
```

- **Hooks consumidos:**
  - `useMonitoring` — metricas extendidas + stats de errores + errores recientes + tendencias
  - `useAlerts` — lista de alertas + stats de alertas + mutaciones acknowledge/resolve

- **Endpoints API:**
  - **useMonitoring:**
    - `GET /admin/monitoring/metrics/extended` → `ExtendedSystemMetrics` (sin interval)
    - `GET /admin/monitoring/errors/stats?hours=24` → `ErrorStats` (sin interval)
    - `GET /admin/monitoring/errors/recent?limit=20&level=all` → `RecentError[]` (sin interval)
    - `GET /admin/monitoring/errors/trends?hours=24&group_by=hour` → `ErrorTrendDataPoint[]` (sin interval)
  - **useAlerts:**
    - `GET /admin/alerts` (paginado, limit=20) → `PaginatedResponse<Alert>` (sin interval)
    - `GET /admin/alerts/stats` → `AlertsStats` (sin interval)
    - `PATCH /admin/alerts/:id/acknowledge` → mutacion acknowledge
    - `PATCH /admin/alerts/:id/resolve` → mutacion resolve
    - `PATCH /admin/alerts/:id/suppress` → mutacion suppress
  - **LogsViewer (interno):**
    - `GET /admin/system/audit-log` (via `getAuditLogs`) — paginado, filtros success/startDate/endDate

- **Estado:**
  - Tab activo: `useState<MonitoringTabType>` local en la pagina
  - Datos: React Query en useMonitoring + useAlerts
  - `isLoading` de useMonitoring = OR de las 4 queries (cualquiera cargando)

- **Interacciones:**
  - Tab navigation: click en AdminTabBar → cambio de tab (sin URL routing de tabs)
  - Tab "Logs": LogsViewer tiene filtros internos (status/fecha), refresh, export CSV
  - Tab "Metricas": toggle auto-refresh (5s via setInterval local en MetricsTab), refresh manual
  - Tab "Errors": selector de periodo (24h/48h/7d) — NOTA: cambia UI pero no refetch (periodo fijo en hook)
  - Tab "Alertas": acknowledge/resolve con nota hardcodeada, navegacion a `/admin/alerts`

- **Errores:**
  - useMonitoring expone `error` pero AdminMonitoringPage NO lo renderiza en UI
  - Errores de mutaciones de alertas: `console.error` en AlertasTab, sin feedback visual al usuario
  - LogsViewer muestra errores de fetch inline dentro del card

- **Carga (loading states):**
  - `isLoading` de useMonitoring pasado a MetricsTab y ErrorTrackingTab
  - MetricsTab: EmptyState cuando `!metrics`; DetectiveButton disabled+spin cuando loading
  - LogsViewer: spinner centrado durante primera carga; mantiene tabla visible durante refetches
  - AlertasTab: botones de accion disabled durante `actioningAlertId`

- **Accesibilidad:**
  - `role="region"` + `aria-label` dinamico en contenedor de tab content
  - AdminTabBar: requiere verificacion de ARIA roles (no leido en este analisis)
  - MetricsTab: checkbox de auto-refresh tiene label visible
  - FALTA: useMonitoring error no tiene contenedor aria-live en pagina
  - FALTA: Botones de accion rapida (Reconocer/Resolver) en AlertasTab no tienen aria-label descriptivo

- **Responsividad:**
  - MetricsTab: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
  - ErrorTrackingTab: controles `flex-col sm:flex-row`
  - AlertasTab: `flex-wrap` en badges de alerta

- **Issues identificados:**
  - [P1] **Errores de useMonitoring no se muestran en pagina**: la pagina no renderiza el campo `error` de useMonitoring — si todas las queries fallan, el usuario ve paginas vacias sin feedback
  - [P1] **Period selector de ErrorTrackingTab es decorativo**: los botones 24h/48h/7d cambian `timePeriod` en estado local pero el hook useMonitoring fija `hours=24` en el queryFn — no hay refetch con el periodo seleccionado
  - [P1] **Tab "Logs" duplica AdminAuditLogsPage**: LogsViewer es funcionalmente identico a AdminAuditLogsPage pero con menos filtros (sin campo email/IP search) — ambos consumen `useAuditLogs` con los mismos endpoints
  - [P2] **Sin auto-refresh en useMonitoring**: a diferencia de useAdminDashboard, las queries de useMonitoring no tienen `refetchInterval` — datos de metricas y errores envejecen sin refresco automatico
  - [P2] **Acknowledge/Resolve con nota hardcodeada**: `handleAcknowledge` envia siempre `'Reconocido desde Monitoreo'`; `handleResolve` envia siempre `'Resuelto desde Monitoreo - Verificacion manual completada'` — sin posibilidad de que el admin ingrese nota personalizada
  - [P2] **LogsViewer filtra solo por success/fecha**: no tiene filtro por email ni IP; AdminAuditLogsPage si los tiene

---

### AdminAnalyticsPage

- **Archivo:** `apps/frontend/src/apps/admin/pages/AdminAnalyticsPage.tsx`
- **Ruta:** `/admin/analytics`
- **Ultima actualizacion doc:** 2025-11-24

#### Componentes (arbol de renderizado)

```
AdminPageShell
  └─ div.space-y-6
      ├─ Header (h1 + TrendingUp icon)
      ├─ Action buttons: [Exportar CSV] + [Actualizar]
      ├─ aria-live[error] → div[role=alert]
      ├─ aria-live[toast] → div[role=status] con boton cerrar
      ├─ AdminTabBar (tabs: overview|engagement|gamification|retention, variant="cards")
      ├─ [isLoading] → DetectiveCard → spinner (RefreshCw animated)
      └─ [!isLoading] → div[role=region, aria-label="Contenido de pestana: {label}"]
          ├─ [overview]     → OverviewTab (overview, activityTimeline, topUsers)
          ├─ [engagement]   → EngagementTab (engagement)
          ├─ [gamification] → GamificationTab (gamification)
          └─ [retention]    → RetentionTab (retention)
```

- **Hooks consumidos:**
  - `useAnalytics` — 6 queries paralelas + exportToCSV
  - `useApiError` — manejo de error en exportacion

- **Endpoints API (via useAnalytics → adminAPI.analytics):**
  - `GET /admin/analytics/overview` → `AnalyticsOverview`
  - `GET /admin/analytics/engagement` → `EngagementAnalytics`
  - `GET /admin/analytics/gamification` → `GamificationAnalytics`
  - `GET /admin/analytics/activity-timeline?days=30` → `{ timeline: DailyActivity[] }`
  - `GET /admin/analytics/top-users?metric=xp&limit=10` → `{ users: TopUser[] }`
  - `GET /admin/analytics/retention` → `RetentionAnalytics`
  - `GET /admin/analytics/export?type=overview&format=csv` → `Blob` (download)

- **Estado:**
  - Tab activo: `useState<TabType>` local
  - Toast: `useState<{ type, message } | null>` con auto-dismiss a 5s
  - Exportacion: `useState<boolean> isExporting`
  - Datos: React Query en useAnalytics (staleTime: DYNAMIC, sin refetchInterval)

- **Interacciones:**
  - Tab navigation: AdminTabBar → cambio de tab local
  - Boton "Actualizar": `refresh()` → `queryClient.invalidateQueries(analyticsKeys.all)`
  - Boton "Exportar CSV": `handleExport()` → `exportToCSV()` → Blob download
  - Toast de exportacion: auto-dismiss 5s, boton cerrar manual con aria-label
  - Charts (Recharts): hover tooltips, leyendas clickeables

- **Errores:**
  - Error de queries: `aria-live="polite"` + `role="alert"` con texto
  - Error de export: `handleError(err, 'Error al exportar CSV')` via `useApiError` (no muestra toast de error — FALTA coherencia con success toast)
  - Tabs individuales: EmptyState cuando datos son null

- **Carga (loading states):**
  - `isLoading` de useAnalytics = OR de las 6 queries
  - Loading global: spinner centrado en DetectiveCard
  - Tab content oculto durante loading (`!isLoading`)
  - Boton Exportar y Actualizar disabled durante loading/exporting

- **Accesibilidad:**
  - `aria-live="polite"` en contenedores de error y toast
  - `role="alert"` en error, `role="status"` en toast
  - Boton cerrar toast tiene `aria-label="Cerrar notificacion"`
  - `role="region"` + `aria-label` en contenedor de tab content
  - FALTA: Recharts charts no tienen accesibilidad (sin aria-labels, sin datos en tabla alternativa)
  - FALTA: Tab "Engagement" tiene badge "Datos limitados" y "Retention" tiene badge "Beta" — no hay role/aria para leer estos avisos con screen reader

- **Responsividad:**
  - Header: `flex-col md:flex-row`
  - OverviewTab stats: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
  - Charts: `ResponsiveContainer width="100%"` (Recharts, se adapta)

- **Documentacion extra:** Los badges en tabs ('Datos limitados', 'Beta') tienen `badgeTooltip` para contexto educativo sobre limitaciones de datos — buena practica para transparencia con admins

- **Issues identificados:**
  - [P1] **Error de exportacion no muestra toast de error**: `handleError` de `useApiError` no actualiza el estado `toast` de la pagina — el usuario no recibe feedback visual cuando falla la exportacion (diferente a error de queries que si muestra bloque rojo)
  - [P1] **Loading bloquea todo el tab content**: cuando `isLoading=true` (cualquiera de 6 queries), todo el contenido desaparece — si una query es lenta (retention, engagement), bloquea tabs que ya tienen datos
  - [P2] **Charts sin accesibilidad**: PieChart, LineChart, BarChart de Recharts no tienen aria-label, role="img", ni tablas alternativas — ilegibles para screen readers
  - [P2] **Top users hardcoded a metric=xp**: `getTopUsers({ metric: 'xp', limit: 10 })` — no hay opcion de ordenar por otros criterios (ejercicios, streak)
  - [P2] **exportToCSV crea elemento DOM sin cleanup**: `document.body.appendChild(link); link.click(); link.remove()` — falta `window.URL.revokeObjectURL(url)` inmediatamente post-click (memory leak potencial en navegadores lentos)
  - [P2] **staleTime DYNAMIC para analytics**: los datos de analytics pueden estar obsoletos si el admin no hace refresh manual — considera STATIC para reducir fetches innecesarios

---

### AdminAuditLogsPage

- **Archivo:** `apps/frontend/src/apps/admin/pages/AdminAuditLogsPage.tsx`
- **Ruta:** `/admin/audit-logs`
- **Ultima actualizacion doc:** 2026-01-20
- **User Story:** US-AE-011

#### Componentes (arbol de renderizado)

```
AdminPageShell
  └─ div.mx-auto.max-w-7xl.space-y-6
      ├─ Header (h1 + Shield icon)
      ├─ Action buttons: [Exportar CSV] + [Actualizar]
      ├─ motion.div[toast] con boton X
      ├─ AuditLogFilters (filters, pageSize, onFilterChange, onClearFilters, searchText, ...)
      ├─ AuditLogStats (total, successCount, failedCount)
      ├─ AuditLogTable (logs, page, pageSize, total, totalPages, isLoading, error, ...)
      └─ [selectedLog] → LogDetailModal (log, onClose)
```

- **Hooks consumidos:**
  - `useAuditLogs({ filters, page, pageSize: 20, autoFetch: true })`

- **Endpoints API:**
  - `GET /admin/system/audit-log` (via `getAuditLogs`) con params: `success`, `startDate`, `endDate`, `email`, `ipAddress`, `page`, `limit=20`

- **Estado:**
  - `filters: AuditLogFiltersType` — estado local sincronizado con hook
  - `currentPage: number` — estado local sincronizado con hook
  - `searchText: string` — texto de busqueda pendiente (se aplica al buscar)
  - `selectedLog: AuditLogEntry | null` — log seleccionado para modal
  - `toast: { type, message } | null` — con auto-dismiss 5s
  - Paginacion y datos: React Query en useAuditLogs

- **Interacciones:**
  - Filtro de estado (success/failed/todos): `handleFilterChange('success', value)`
  - Filtro de fecha inicio/fin: `handleFilterChange('startDate'/'endDate', value)`
  - Campo de busqueda: typing libre; Enter o boton buscar aplica filtro a email o IP (deteccion automatica por @ o patron de IP)
  - Boton "Limpiar filtros": reset completo de filtros y pagina
  - Paginacion: `handlePageChange(newPage)` — sincroniza estado local + hook
  - Boton "Ver detalle" por fila: abre LogDetailModal
  - Boton "Exportar CSV": genera CSV del lado del cliente desde datos de pagina actual
  - Boton "Actualizar": `refetch()`
  - Modal: cierre por boton o backdrop (segun comportamiento de shared Modal)

- **Errores:**
  - Error de fetch: mostrado en AuditLogTable inline
  - Error de exportacion: `console.error` + toast de error
  - Empty state con mensaje contextual (filtros activos vs sin datos)

- **Carga (loading states):**
  - AuditLogTable: spinner en primera carga; tabla visible en refetches posteriores
  - Boton Actualizar: icono spin durante loading
  - Boton Exportar: disabled cuando `logs.length === 0 || isLoading`

- **Accesibilidad:**
  - Toast: sin `aria-live` ni `role` — FALTA
  - Boton X de toast: sin `aria-label` — FALTA
  - LogDetailModal: usa shared `Modal` que implementa Escape-close, body scroll lock y focus trap — BIEN
  - FALTA: AuditLogTable no tiene `role="table"` ni headers con `scope` (usa DataTable compartido — requiere auditoria separada)

- **Responsividad:**
  - Header: `flex-col md:flex-row`
  - AuditLogStats: `grid-cols-1 md:grid-cols-3`
  - AuditLogFilters: `grid-cols-1 md:grid-cols-4`

- **Issues identificados:**
  - [P1] **Export CSV es de pagina actual, no de todos los registros**: `handleExportCSV` exporta solo `logs` (la pagina actual de 20 registros), no el total de `total` registros — el boton dice "Exportar CSV" pero no exporta el dataset completo; puede ser confuso para admins que esperan un export completo
  - [P1] **AuditLogStats.successCount/failedCount son de pagina actual**: los labels dicen "(pagina actual)" pero los stat cards aparecen como metricas globales — riesgo de malinterpretacion; `total` si es el total real del servidor
  - [P2] **pageSize selector esta disabled**: `AuditLogFilters` renderiza un selector de page size (20/50/100) pero esta deshabilitado porque `useAuditLogs` no expone `setPageSize` — funcionalidad prometida en UI pero no implementada
  - [P2] **Toast sin aria-live**: el toast de exito/error aparece sin anuncio para screen readers
  - [P2] **Busqueda por texto no limpia filtros previos**: `handleSearch` detecta si el texto es email o IP y aplica el filtro correspondiente, pero no limpia el otro — buscar "192.168.1.1" mantiene un filtro de email previo
  - [P2] **No hay enlace a AdminMonitoringPage/LogsViewer**: las dos paginas de logs son independientes sin cross-navigation

---

## 2. Catalogo de Componentes

### Dashboard Components

| Componente | Archivo | Props principales | Proposito | Usado en pagina |
|---|---|---|---|---|
| `DashboardStatsGrid` | `components/dashboard/DashboardStatsGrid.tsx` | `metrics: SystemMetrics \| null` | Grid 4 cards: Usuarios, Instituciones, Storage, Flagged | AdminDashboardPage |
| `SystemHealthCard` | `components/dashboard/SystemHealthCard.tsx` | `systemHealth, activeSessions?` | Panel de salud del sistema con status badge | AdminDashboardPage |
| `AlertsNotificationsCard` | `components/dashboard/AlertsNotificationsCard.tsx` | `alerts, flaggedContentCount?, onDismissAlert` | Panel de alertas con dismiss; max 5 alertas | AdminDashboardPage |
| `DashboardQuickActions` | `components/dashboard/DashboardQuickActions.tsx` | `metrics: SystemMetrics \| null` | Grid 4 botones: Users/Institutions/Content/Gamification | AdminDashboardPage |
| `AdminDashboardHero` | `components/dashboard/AdminDashboardHero.tsx` | `health, loading?, onRefresh?` | Banner completo con CPU/Memory/Uptime/Users/Req+Error barras animadas (framer-motion) | **ORPHANED** |
| `SystemMetricsGrid` | `components/dashboard/SystemMetricsGrid.tsx` | (ver archivo) | Grid 6 metricas con counters animados y sparklines | **ORPHANED** |
| `QuickActionsGrid` | `components/dashboard/QuickActionsGrid.tsx` | (badges, links) | Grid 6 acciones rapidas con gradientes y Link | **ORPHANED** |
| `RecentActionsTable` | `components/dashboard/RecentActionsTable.tsx` | (ver archivo) | Tabla de acciones recientes | **ORPHANED** |
| `UserActivityChart` | `components/dashboard/UserActivityChart.tsx` | (ver archivo) | Chart de actividad de usuarios | **ORPHANED** |
| `SystemAlertsPanel` | `components/dashboard/SystemAlertsPanel.tsx` | (ver archivo) | Panel de alertas del sistema | **ORPHANED** |
| `UserManagementTable` | `components/dashboard/UserManagementTable.tsx` | (ver archivo) | Tabla de gestion de usuarios | **ORPHANED** |
| `SystemLogsViewer` | `components/dashboard/SystemLogsViewer.tsx` | (ver archivo) | Visor de logs del sistema | **ORPHANED** |
| `OrganizationsTable` | `components/dashboard/OrganizationsTable.tsx` | (ver archivo) | Tabla de organizaciones | **ORPHANED** |

### Monitoring Components

| Componente | Archivo | Props principales | Proposito | Usado en pagina |
|---|---|---|---|---|
| `LogsViewer` | `components/monitoring/LogsViewer.tsx` | (ninguna — self-contained) | Tabla de audit logs con filtros internos + paginacion + CSV export; consume `useAuditLogs` directamente | AdminMonitoringPage (tab Logs) |
| `MetricsTab` | `components/monitoring/MetricsTab.tsx` | `metrics, isLoading, onRefresh` | Grid 6 cards de metricas (Memory, CPU, Heap, Uptime, Handles, Requests) + Info de sistema; toggle auto-refresh 5s local | AdminMonitoringPage (tab Metricas) |
| `ErrorTrackingTab` | `components/monitoring/ErrorTrackingTab.tsx` | `stats, recentErrors, trends, isLoading, onRefresh` | Stats cards + bar chart horizontal de tendencias + tabla expandible de errores recientes con copy | AdminMonitoringPage (tab Errors) |
| `AlertasTab` | `components/monitoring/AlertasTab.tsx` | `alerts, stats, isLoading, onRefresh, onAcknowledge, onResolve` | Stats de alertas + lista top-10 con acciones rapidas + link a /admin/alerts | AdminMonitoringPage (tab Alertas) |
| `SystemPerformanceDashboard` | `components/monitoring/SystemPerformanceDashboard.tsx` | (ver archivo) | Dashboard completo de performance | **ORPHANED** (exportado en index.ts) |
| `MetricsChart` | `components/monitoring/MetricsChart.tsx` | (ver archivo) | Chart de metricas | **ORPHANED** (exportado en index.ts) |
| `UserActivityMonitor` | `components/monitoring/UserActivityMonitor.tsx` | (ver archivo) | Monitor de actividad de usuarios | **ORPHANED** (exportado en index.ts) |
| `ErrorTrackingPanel` | `components/monitoring/ErrorTrackingPanel.tsx` | (ver archivo) | Panel de error tracking | **ORPHANED** (exportado en index.ts) |
| `SystemHealthIndicators` | `components/monitoring/SystemHealthIndicators.tsx` | (ver archivo) | Indicadores de salud del sistema | **ORPHANED** (exportado en index.ts) |

### Audit Components

| Componente | Archivo | Props principales | Proposito | Usado en pagina |
|---|---|---|---|---|
| `AuditLogFilters` | `components/audit/AuditLogFilters.tsx` | `filters, pageSize, onFilterChange, onClearFilters, searchText, onSearchTextChange, onSearch` | Panel colapsable de filtros: busqueda, estado, fechas, page size (disabled) | AdminAuditLogsPage |
| `AuditLogStats` | `components/audit/AuditLogStats.tsx` | `total, successCount, failedCount` | 3 stat cards: total registros, exitosos, fallidos (pagina actual) | AdminAuditLogsPage |
| `AuditLogTable` | `components/audit/AuditLogTable.tsx` | `logs, page, pageSize, total, totalPages, isLoading, error, activeFiltersCount, onPageChange, onViewDetail` | Tabla paginada de audit logs con DataTable + Pagination; boton "Ver detalle" por fila | AdminAuditLogsPage |
| `LogDetailModal` | `components/audit/LogDetailModal.tsx` | `log: AuditLogEntry \| null, onClose` | Modal detalle: estado, email, fecha, IP, userId, userAgent, razon de fallo | AdminAuditLogsPage |

### Analytics Components

| Componente | Archivo | Props principales | Proposito | Usado en pagina |
|---|---|---|---|---|
| `OverviewTab` | `components/analytics/OverviewTab.tsx` | `overview, activityTimeline, topUsers` | 4 stat cards + PieChart segmentos + LineChart actividad 30d + DataTable top-10 usuarios | AdminAnalyticsPage |
| `EngagementTab` | `components/analytics/EngagementTab.tsx` | `engagement: EngagementAnalytics \| null` | 3 summary cards + BarChart engagement por segmento + DataTable desglose por segmento | AdminAnalyticsPage |
| `GamificationTab` | `components/analytics/GamificationTab.tsx` | `gamification: GamificationAnalytics \| null` | 3 summary cards + BarChart XP distribution + BarChart rangos + DataTable rangos + BarChart niveles | AdminAnalyticsPage |
| `RetentionTab` | `components/analytics/RetentionTab.tsx` | `retention: RetentionAnalytics \| null` | 3 summary cards + LineChart tendencia + cards mejor/peor cohorte + DataTable cohortes | AdminAnalyticsPage |

---

## 3. Analisis de Hooks

### useAdminDashboard

- **Archivo:** `apps/frontend/src/apps/admin/hooks/useAdminDashboard.ts`
- **Patron:** React Query (5 useQuery + 1 useMutation)
- **API calls:**
  - `adminAPI.getSystemHealth()` → `/admin/health` (refetchInterval 30s)
  - `adminAPI.getSystemMetrics()` → `/admin/metrics` (refetchInterval 60s)
  - `adminAPI.getRecentActions(10)` → `/admin/actions?limit=10` (refetchInterval 120s)
  - `adminAPI.getAlerts()` → `/admin/alerts` (refetchInterval 30s)
  - `adminAPI.getUserActivity({ groupBy: 'day' })` → `/admin/activity` (refetchInterval 300s)
  - `apiClient.patch(alertActions.suppress(id))` → `PATCH /admin/alerts/:id/suppress`
- **Transform:** Convierte `APISystemHealth` → `SystemHealth` (mapeo snake_case → camelCase) y `APISystemMetrics` → `SystemMetrics`
- **Return type:** `UseAdminDashboardResult` (systemHealth, metrics, recentActions, alerts, userActivity, loading, error, lastUpdated, refresh*, dismissAlert, pauseRefresh, resumeRefresh, isPaused)
- **Consumidores:** AdminDashboardPage
- **Notas:**
  - `loading` usa AND-gate: solo true cuando TODAS las queries estan cargando simultaneamente
  - `error` ignora errores de healthQuery y alertsQuery (tienen catch interno)
  - pauseRefresh/resumeRefresh expuestos pero no usados en pagina

### useAdminData

- **Archivo:** `apps/frontend/src/apps/admin/hooks/useAdminData.ts`
- **Patron:** React Query (useQuery + useMutation por funcion)
- **Exporta 3 hooks:**
  - `useUserActivity(filters?)` → `GET /admin/activity` (refetchInterval 30s)
  - `useErrorTracking(filters?)` → `GET /admin/errors/list` + `PATCH /admin/errors/:id/resolve`
  - `useExportData()` → utilidad CSV pura (sin API)
- **Consumidores:** Ninguno en el scope analizado (potencialmente componentes orphaned)

### useMonitoring

- **Archivo:** `apps/frontend/src/apps/admin/hooks/useMonitoring.ts`
- **Patron:** React Query (4 useQuery, sin refetchInterval)
- **API calls:**
  - `adminAPI.monitoring.getExtendedMetrics()` → `/admin/monitoring/metrics/extended`
  - `adminAPI.monitoring.getErrorStats({ hours: 24 })` → `/admin/monitoring/errors/stats`
  - `adminAPI.monitoring.getRecentErrors({ limit: 20, level: 'all' })` → `/admin/monitoring/errors/recent`
  - `adminAPI.monitoring.getErrorTrends({ hours: 24, group_by: 'hour' })` → `/admin/monitoring/errors/trends`
- **Return type:** `UseMonitoringReturn` (metrics, errorStats, recentErrors, errorTrends, isLoading, error, fetch*, refreshAll)
- **Consumidores:** AdminMonitoringPage

### useSystemMonitoring

- **Archivo:** `apps/frontend/src/apps/admin/hooks/useSystemMonitoring.ts`
- **Patron:** React Query (2 useQuery + 2 useMutation)
- **API calls:**
  - `GET /admin/health` (refetchInterval 10s cuando isMonitoring=true)
  - `GET /admin/alerts?dismissed=false&limit=50` (refetchInterval 5s cuando isMonitoring=true)
  - `PATCH /admin/alerts/:id/suppress` (acknowledge individual)
  - `PATCH /admin/alerts/:id/suppress` en paralelo (clearAll)
- **Return type:** `UseSystemMonitoringResult` (health, healthHistory, activeAlerts, alertCount, criticalAlertCount, loading, error, isMonitoring, start/stopMonitoring, refreshHealth, acknowledgeAlert, clearAllAlerts)
- **Consumidores:** Ninguno en el scope analizado — hook huerfano
- **Notas:**
  - `criticalAlertCount` filtra por `severity === 'high'` (no 'critical') — nombre inconsistente
  - Mantiene `healthHistory[]` hasta 60 snapshots — funcionalidad de historial no consumida

### useSystemMetrics

- **Archivo:** `apps/frontend/src/apps/admin/hooks/useSystemMetrics.ts`
- **Patron:** React Query (useQuery con refetchInterval configurable)
- **Exporta 2 hooks:**
  - `useSystemMetrics(refreshInterval = 30000)` → `GET /admin/metrics` (refetchInterval configurable)
  - `useHealthStatus()` → `GET /health/ready` (refetchInterval 60s)
- **Return:** metricas, history (vacio — placeholder), loading, error, refresh
- **Consumidores:** Ninguno en el scope analizado — hooks huerfanos
- **Notas:** `history` retorna siempre objeto con arrays vacios — funcionalidad de historial no implementada post-migration a React Query

### useAnalytics

- **Archivo:** `apps/frontend/src/apps/admin/hooks/useAnalytics.ts`
- **Patron:** React Query (6 useQuery paralelas, sin refetchInterval; staleTime DYNAMIC)
- **API calls:**
  - `adminAPI.analytics.getOverview()` → `/admin/analytics/overview`
  - `adminAPI.analytics.getEngagement({})` → `/admin/analytics/engagement`
  - `adminAPI.analytics.getGamification()` → `/admin/analytics/gamification`
  - `adminAPI.analytics.getActivityTimeline({ days: 30 })` → `/admin/analytics/activity-timeline`
  - `adminAPI.analytics.getTopUsers({ metric: 'xp', limit: 10 })` → `/admin/analytics/top-users`
  - `adminAPI.analytics.getRetention()` → `/admin/analytics/retention`
  - `adminAPI.analytics.exportCSV({ type: 'overview', format: 'csv' })` → `/admin/analytics/export`
- **Return type:** `UseAnalyticsReturn` (overview, engagement, gamification, activityTimeline, topUsers, retention, isLoading, error, refresh, exportToCSV)
- **Consumidores:** AdminAnalyticsPage
- **Notas:**
  - exportToCSV hace `document.body.appendChild` sin llamar `revokeObjectURL` de inmediato

### useSystemLogs

- **Archivo:** `apps/frontend/src/apps/admin/hooks/useSystemLogs.ts`
- **Patron:** React Query (1 useQuery con filtros/paginacion)
- **API calls:**
  - `getSystemLogs(filters)` → `GET /admin/system/logs` con level/date/search/page/limit
- **Return type:** `UseSystemLogsResult` (logs: LogEntry[], total, page, totalPages, pageSize, isLoading, error, refetch, setFilters, setPage)
- **Consumidores:** Ninguno en el scope analizado — hook potencialmente consumido por LogsViewer pero LogsViewer usa `useAuditLogs` en su lugar

### useAuditLogs

- **Archivo:** `apps/frontend/src/apps/admin/hooks/useAuditLogs.ts`
- **Patron:** React Query (1 useQuery con filtros/paginacion)
- **API calls:**
  - `getAuditLogs({ ...filters, page, limit })` → `GET /admin/system/audit-log`
- **Return type:** `UseAuditLogsResult` (logs: AuditLogEntry[], total, page, totalPages, pageSize, isLoading, error, refetch, setFilters, setPage)
- **Consumidores:** AdminAuditLogsPage, LogsViewer (en MonitoringPage)

### useAlerts (fuera de scope de hooks pero consumido por Monitoring)

- **Archivo:** `apps/frontend/src/apps/admin/hooks/useAlerts.ts`
- **Patron:** React Query (2 useQuery + 3 useMutation; sin refetchInterval)
- **API calls:**
  - `adminAPI.alerts.list(filters)` → `GET /admin/alerts` (paginado)
  - `adminAPI.alerts.getStats()` → `GET /admin/alerts/stats`
  - `adminAPI.alerts.acknowledge(id, note)` → `PATCH /admin/alerts/:id/acknowledge`
  - `adminAPI.alerts.resolve(id, note)` → `PATCH /admin/alerts/:id/resolve`
  - `adminAPI.alerts.suppress(id)` → `PATCH /admin/alerts/:id/suppress`
- **Consumidores:** AdminMonitoringPage

---

## 4. Issues y Recomendaciones

### P0 — Critico (bloquea produccion o causa perdida de datos)

Ninguno identificado en el scope analizado.

---

### P1 — Alto (comportamiento incorrecto o experiencia severamente degradada)

**[P1-01] Loading AND-gate en useAdminDashboard**
- **Archivo:** `apps/frontend/src/apps/admin/hooks/useAdminDashboard.ts:248-253`
- **Descripcion:** `loading = healthQuery.isLoading && metricsQuery.isLoading && ...` — usa AND logico. En la practica, las queries terminan en momentos diferentes. Una vez que la primera termina, `loading` pasa a `false` y la pagina muestra contenido parcialmente vacio.
- **Fix:** Cambiar a `||` para considerar "cargando" mientras cualquier query este en curso, O usar `isLoading` solo para la primera carga y `isFetching` para actualizaciones.

**[P1-02] Errores de useMonitoring no visibles en AdminMonitoringPage**
- **Archivo:** `apps/frontend/src/apps/admin/pages/AdminMonitoringPage.tsx`
- **Descripcion:** El hook retorna `error: string | null` pero la pagina no lo renderiza. Si las queries de monitoring fallan, el usuario ve tabs vacias sin saber por que.
- **Fix:** Agregar bloque `aria-live="polite"` con mensaje de error al inicio del contenido, similar a AdminDashboardPage y AdminAnalyticsPage.

**[P1-03] Period selector de ErrorTrackingTab es decorativo**
- **Archivo:** `apps/frontend/src/apps/admin/components/monitoring/ErrorTrackingTab.tsx:80-138`
- **Descripcion:** Los botones 24h/48h/7d cambian `timePeriod` en estado local pero el hook `useMonitoring` tiene hardcodeado `hours: 24` en sus queryFns. El selector no tiene efecto en los datos.
- **Fix:** Mover el estado de periodo a la pagina o al hook; refetch con el nuevo valor de horas al cambiar. Alternativamente, mostrar el periodo actual como informacion (no como selector activo) mientras no este implementado.

**[P1-04] Tab "Logs" en MonitoringPage duplica AdminAuditLogsPage**
- **Archivo:** `apps/frontend/src/apps/admin/components/monitoring/LogsViewer.tsx`
- **Descripcion:** LogsViewer es funcionalmente casi identico a AdminAuditLogsPage pero incompleto (sin filtro por email/IP ni modal de detalle). Dos superficies para la misma funcionalidad generan confusion y mantenimiento duplicado.
- **Recomendacion:** Evaluar si el tab "Logs" en Monitoring debe navegar a `/admin/audit-logs` (link externo) o si LogsViewer debe reutilizar los componentes de audit/ con las mismas capacidades de filtrado.

**[P1-05] Export CSV de AdminAuditLogsPage solo exporta pagina actual**
- **Archivo:** `apps/frontend/src/apps/admin/pages/AdminAuditLogsPage.tsx:94-110`
- **Descripcion:** `handleExportCSV` usa `logs` (20 registros de pagina actual) en lugar del total de registros del servidor. El boton dice "Exportar CSV" pero no exporta el dataset completo. El admin que ve "Total: 15,432 registros" no puede exportarlos todos.
- **Fix:** O bien agregar endpoint de export con filtros aplicados y descarga server-side, o bien dejar claro en la UI que es "Exportar pagina actual (N registros)".

**[P1-06] Error de exportacion en AdminAnalyticsPage sin feedback visual**
- **Archivo:** `apps/frontend/src/apps/admin/pages/AdminAnalyticsPage.tsx:69-80`
- **Descripcion:** `handleError(err, 'Error al exportar CSV')` usa `useApiError` que no actualiza el estado `toast` de la pagina. El exito de exportacion si muestra toast verde; el fallo no muestra nada visible.
- **Fix:** Mover el manejo de error al bloque catch y setToast({ type: 'error', message: '...' }).

---

### P2 — Medio (degradacion de experiencia o deuda tecnica)

**[P2-01] 9 componentes orphaned en dashboard/index.ts**
- **Descripcion:** `AdminDashboardHero`, `SystemMetricsGrid`, `QuickActionsGrid`, `RecentActionsTable`, `UserActivityChart`, `SystemAlertsPanel`, `UserManagementTable`, `SystemLogsViewer`, `OrganizationsTable` — exportados en barrel pero no usados en ninguna pagina. Son componentes ricos (framer-motion, charts) que representan deuda de mantenimiento y confusion sobre el diseno actual del dashboard.
- **Recomendacion:** Definir si el dashboard debe actualizarse para usar estos componentes (especialmente `AdminDashboardHero` que es mas rico que `SystemHealthCard`) o si deben eliminarse del codebase.

**[P2-02] 4-5 hooks orphaned (useSystemMonitoring, useSystemMetrics, useHealthStatus, useAdminData)**
- **Descripcion:** Hooks bien implementados con React Query que no tienen consumidores activos en el scope analizado. Representan funcionalidad que fue implementada pero no conectada a paginas.
- **Recomendacion:** Auditoria de uso global para confirmar si algun componente fuera de scope los usa; si no, evaluar eliminacion o integracion.

**[P2-03] flaggedContentCount siempre null**
- **Descripcion:** `transformSystemMetrics` asigna `flaggedContentCount: null` — el backend `APISystemMetrics` no retorna este campo. Los cards y AlertsNotificationsCard siempre muestran "N/A".
- **Fix:** Verificar si el backend provee este dato en otro endpoint y agregarlo al transformer, o eliminar el campo de UI.

**[P2-04] criticalAlertCount mal nombrado en useSystemMonitoring**
- **Archivo:** `apps/frontend/src/apps/admin/hooks/useSystemMonitoring.ts:174`
- **Descripcion:** `criticalAlertCount = activeAlerts.filter(a => a.severity === 'high').length` — filtra por 'high' pero la variable se llama 'critical'. El sistema tiene 4 severidades: critical, high, medium, low.
- **Fix:** Renombrar a `highAlertCount` o corregir el filtro para incluir `severity === 'critical'`.

**[P2-05] Sin auto-refresh en useMonitoring**
- **Descripcion:** A diferencia de useAdminDashboard (que tiene refetchInterval configurado), useMonitoring no tiene refetchInterval. Los datos de metricas extendidas y errores envejecen indefinidamente sin refresco automatico.
- **Fix:** Agregar refetchInterval apropiado (ej: 60s para metricas, 120s para errores).

**[P2-06] AuditLogStats muestra totales de pagina como si fueran globales**
- **Descripcion:** `successCount` y `failedCount` se calculan sobre `logs` (pagina actual, max 20 registros). Los labels dicen "(pagina actual)" pero visualmente los cards parecen metricas globales. El `total` si es el total real.
- **Fix:** Calcular success/failed del total via backend (agregar campo al response de paginacion) o cambiar los labels mas claramente.

**[P2-07] pageSize selector en AuditLogFilters esta disabled**
- **Descripcion:** El selector 20/50/100 existe en UI pero no hace nada. `useAuditLogs` no expone `setPageSize`.
- **Fix:** Exponer `setPageSize` en el hook (modificar estado local `pageSize`) e implementar el handler.

**[P2-08] Charts de Analytics sin accesibilidad**
- **Descripcion:** PieChart, LineChart, BarChart de Recharts no tienen `role="img"`, `aria-label`, ni representacion alternativa en tabla.
- **Fix:** Envolver cada chart en `<figure role="img" aria-label="...">` o proveer una tabla oculta visualmente con los mismos datos.

**[P2-09] Memory leak potencial en exportToCSV de useAnalytics**
- **Archivo:** `apps/frontend/src/apps/admin/hooks/useAnalytics.ts:163-169`
- **Descripcion:** Se crea `URL.createObjectURL(blob)` pero `URL.revokeObjectURL(url)` se llama despues de `link.remove()` — en algunos navegadores el click puede ser asincrono y la URL ya estaria revocada. El orden correcto: click → revocar en timeout o despues de descarga confirmada.
- **Fix:** Usar `setTimeout(() => URL.revokeObjectURL(url), 100)` post-click.

**[P2-10] Nota de acknowledge/resolve hardcodeada en AlertasTab**
- **Descripcion:** Acciones "Reconocer" y "Resolver" envian notas predefinidas. En la pagina dedicada de alertas (`/admin/alerts`) probablemente existan formularios para ingresar notas. El tab de monitoring es una version reducida sin input de nota.
- **Recomendacion:** Documentar explicitamente esta limitacion en el comentario del componente o agregar un campo de texto inline.

**[P2-11] Busqueda en AuditLogFilters no limpia filtro opuesto**
- **Descripcion:** `handleSearch` aplica filtro a email O IP segun deteccion automatica, pero no limpia el otro campo. Si el admin busco por email y luego busca por IP, ambos filtros quedan activos.
- **Fix:** En `handleSearch`, limpiar el campo no detectado antes de aplicar el nuevo.

---

## 5. Cobertura de Documentacion

### Documentacion existente

| Tipo | Archivo | Contenido | Estado |
|---|---|---|---|
| Flujo | `docs/30-ux-ui/flujos/admin/FLUJO-DASHBOARD-ADMIN.md` | FL-ADM-09 v1.1.0 — diagrama, secuencia FE→BE→DB, datos de endpoints | Activo, sincronizado |
| Flujo | `docs/30-ux-ui/flujos/admin/FLUJO-MONITOREO-SISTEMA.md` | FL-ADM-04 v1.1.0 — diagrama de tabs y endpoints de monitoring | Activo, sincronizado |
| Flujo | `docs/30-ux-ui/flujos/admin/FLUJO-REPORTES-ANALYTICS-ADMIN.md` | FL-ADM-11 v1.1.0 — analytics y reportes exportables | Activo |
| Flujo | `docs/30-ux-ui/flujos/admin/FLUJO-AUDIT-LOGS.md` | FL-ADM-06 v1.1.0 — audit logs con filtros y paginacion | Activo |
| Portal | `docs/60-portals/admin/PORTAL-ADMIN-GUIDE.md` | Guia general del portal admin | Activo |

### Brechas de documentacion identificadas

1. **AdminDashboardHero no documentado como orphaned**: el flujo FL-ADM-09 menciona "4 secciones" del dashboard pero no registra la existencia de 9 componentes orphaned ni la deuda de UI.

2. **Loading logic AND-gate no documentada**: ningun flujo documenta el comportamiento actual de loading (bug P1-01).

3. **Period selector como decorativo en ErrorTracking**: FLUJO-MONITOREO-SISTEMA.md documenta la seleccion de periodo como funcional; la realidad es que no lo es (P1-03).

4. **Duplicacion LogsViewer vs AdminAuditLogsPage**: ambos flujos (FL-ADM-04 y FL-ADM-06) documentan sus respectivas paginas de forma independiente sin registrar la duplicacion.

5. **Export CSV de audit logs documentado como export completo**: FL-ADM-06 sugiere export de logs pero no especifica la limitacion de "pagina actual".

6. **Hooks orphaned no documentados**: `useSystemMonitoring`, `useSystemMetrics`, `useHealthStatus` no aparecen en ningun inventario o documentacion de arquitectura frontend como "pendientes de integracion".

7. **Analytics tab con isLoading bloqueante**: FL-ADM-11 no documenta que la carga de cualquier query bloquea todo el tab content (P1-01 variante).

### Cobertura general

- **Alta:** FLUJO-DASHBOARD-ADMIN.md y FLUJO-AUDIT-LOGS.md estan bien sincronizados con la implementacion actual
- **Media:** FLUJO-MONITOREO-SISTEMA.md tiene divergencias (period selector, error display) que no fueron actualizadas post-implementacion
- **Media:** FLUJO-REPORTES-ANALYTICS-ADMIN.md requiere verificacion de si el export CSV es completo o de pagina actual
- **Baja:** Los componentes orphaned, hooks huerfanos y la deuda de UI del dashboard no tienen registro en ningun documento de arquitectura

---

## Resumen Ejecutivo

| Pagina | Estado | Issues P1 | Issues P2 |
|---|---|---|---|
| AdminDashboardPage | Funcional con deuda | 1 (AND-gate loading) | 5 (orphaned components, null fields) |
| AdminMonitoringPage | Funcional con bugs | 3 (error invisible, period selector decorativo, LogsViewer duplicado) | 4 (sin auto-refresh, notas hardcodeadas) |
| AdminAnalyticsPage | Funcional con bug de UX | 2 (loading bloqueante, export error sin feedback) | 4 (accesibilidad charts, memory leak) |
| AdminAuditLogsPage | Funcional con limitaciones | 2 (export pagina actual, stats de pagina) | 3 (pageSize disabled, toast sin aria, busqueda) |

**Total:** 8 issues P1, 16 issues P2, 0 issues P0.

Los issues mas criticos para resolver en orden de impacto:
1. P1-02 — Errores de monitoring sin feedback (silencioso para el usuario)
2. P1-03 — Period selector decorativo (feature rota en produccion)
3. P1-05 — Export CSV incompleto (confusion de datos para admin)
4. P1-01 — AND-gate loading (contenido parcialmente vacio)
