# Dependencias Cruzadas -- Grupo A: Dashboard + Monitoring + Advanced

**Agente:** A (Dashboard + Monitoring + Advanced)
**Fecha:** 2026-02-18
**Modo:** ANALYSIS
**Referencia:** `01-HALLAZGOS-A.md` y `02-PROPUESTA-MEJORAS-A.md`

---

## 1. Mapa de Grupos de Agentes

| Agente | Scope | Paginas |
|--------|-------|---------|
| **A (este)** | Dashboard + Monitoring + Advanced | AdminDashboardPage, AdminMonitoringPage, AdminAdvancedPage |
| B | Settings + Gamification Config | AdminSettingsPage, AdminGamificationPage |
| C | Users + Organizations + Content | AdminUsersPage, AdminOrganizationsPage, AdminContentPage |
| D | Classroom-Teacher + Reports | AdminClassroomTeacherPage, AdminReportsPage |
| E | Shared (Layout, Navigation, Types) | AdminLayout, GamilitSidebar, types/, api/ |

---

## 2. Dependencias con Grupo E (Layout + Shared)

### 2.1 AdminLayout -- DEPENDENCIA CRITICA

**Situacion actual:** Las 3 paginas de Grupo A (y presumiblemente todas las demas) tienen un patron identico:

```tsx
<AdminLayout
  user={user || undefined}
  gamificationData={displayGamificationData}
  organizationName="GAMILIT Platform Admin"
  onLogout={handleLogout}
>
```

**Propuesta M1** (de `02-PROPUESTA-MEJORAS-A.md`) crea `AdminPageWrapper` que encapsula este patron.

**Coordinacion necesaria con Agente E:**
- El `AdminPageWrapper` propuesto depende de la interfaz `AdminLayoutProps` que Agente E gestiona
- Si Agente E propone cambios a `AdminLayout` (agregar props, cambiar firma), debe coordinarse ANTES de que M1 se implemente
- Si Agente E propone mover autenticacion al layout (haciendo que AdminLayout lea `useAuth` internamente), la propuesta M1 cambiaria significativamente — el wrapper podria ser innecesario
- **Recomendacion:** Agente E debe decidir si el patron auth+gamification pertenece al layout o a un wrapper; Agente A implementa lo que se decida

### 2.2 GamilitSidebar -- DEPENDENCIA INFORMATIVA

- `AdminAdvancedPage` esta oculta del menu del sidebar (comentario en linea 29)
- Si Agente E propone reorganizar la navegacion, las paginas de Grupo A se ven afectadas indirectamente
- No hay dependencia directa de codigo

### 2.3 Tipos compartidos (`../types`)

**Tipos usados por Grupo A:**
- `SystemHealth` -- usado en `useAdminDashboard`, `useSystemMonitoring`
- `SystemMetrics` -- usado en `useAdminDashboard`
- `AdminAction` -- usado en `useAdminDashboard`
- `SystemAlert` -- usado en `useAdminDashboard`, `useSystemMonitoring`
- `UserActivityData` -- usado en `useAdminDashboard`
- `FeatureFlag` -- usado en `useFeatureFlags`

**Conflicto detectado:** `SystemMetrics` tiene 3 definiciones:
1. En `apps/frontend/src/apps/admin/types/` (hook types, usado por useAdminDashboard)
2. En `apps/frontend/src/apps/admin/hooks/useSystemMetrics.ts` (linea 5, local al hook)
3. En `apps/frontend/src/services/api/adminTypes.ts` (API response types)

**Coordinacion necesaria con Agente E:**
- Agente E debe consolidar las 3 definiciones de `SystemMetrics` en una sola fuente de verdad
- La definicion API (`adminTypes.ts`) y la definicion UI (`../types`) deben ser distintas pero con nombres claros (e.g., `SystemMetricsApiResponse` vs `SystemMetricsUI`)
- La definicion local en `useSystemMetrics.ts` debe eliminarse (propuesta M4a)

---

## 3. Dependencias con Grupo B (Settings + Gamification)

### 3.1 Boilerplate compartido -- DEPENDENCIA CRITICA

**Patron `useAuth + useUserGamification + displayGamificationData + handleLogout`** esta identicamente presente en:
- Grupo A: 3 paginas (confirmado)
- Grupo B: AdminSettingsPage, AdminGamificationPage (por confirmar por Agente B)

**Coordinacion necesaria:**
- La propuesta M1 (`useAdminPageSetup` + `AdminPageWrapper`) debe aplicarse a TODAS las paginas admin, no solo las de Grupo A
- Agente B debe confirmar el patron en sus paginas y adoptar la misma solucion
- **Riesgo de conflicto:** Si Agente B propone una solucion diferente para el mismo boilerplate

### 3.2 Tabs compartidos -- DEPENDENCIA MEDIA

- `AdminMonitoringPage` (Grupo A) reimplementa tabs manualmente
- `AdminSettingsPage` (Grupo B) probablemente tiene tabs similares
- `AdminGamificationPage` (Grupo B) podria tener tabs

**Coordinacion necesaria:**
- La propuesta M7 (`AdminTabBar`) beneficia a ambos grupos
- Agente B debe confirmar si sus paginas usan tabs y si la interfaz propuesta es compatible

### 3.3 `useGamificationConfig` hook

- `AdminGamificationPage` (Grupo B) probablemente tiene un hook para configuracion de gamificacion
- El `useAdminDashboard` (Grupo A) no tiene dependencia directa, pero ambos podrian compartir el endpoint de metricas de gamificacion

**Coordinacion:** Baja prioridad, no hay conflicto directo.

---

## 4. Dependencias con Grupo C (Users + Organizations + Content)

### 4.1 `AdminDashboardPage` muestra metricas de usuarios y organizaciones

**Datos de Grupo A que provienen del dominio de Grupo C:**
- `metrics.totalUsers` (del endpoint `/admin/system/metrics`)
- `metrics.totalOrganizations` (del endpoint `/admin/system/metrics`)
- `metrics.activeSessions` (active users 24h)
- `metrics.flaggedContentCount` (contenido flagged)

**Estos datos NO se obtienen de los hooks de Grupo C** sino del endpoint central de metricas. No hay dependencia directa de codigo.

### 4.2 Quick Actions navigation

`AdminDashboardPage` lineas 350-391 navegan a:
- `/admin/users` (Grupo C)
- `/admin/institutions` (Grupo C)
- `/admin/content` (Grupo C)
- `/admin/gamification` (Grupo B)

**Coordinacion necesaria:**
- Si Grupo C o B cambian sus rutas, los Quick Actions de Grupo A se rompen
- La propuesta M10 sugiere usar el componente `QuickActionsGrid` existente que tiene las rutas definidas como datos; esto centraliza las rutas en un solo lugar

### 4.3 `OrganizationsTable` y `UserManagementTable`

Estos componentes estan en `apps/admin/components/dashboard/` pero son dominio de Grupo C:
- `OrganizationsTable.tsx` (182 lineas) -- muestra organizaciones en dashboard
- `UserManagementTable.tsx` (157 lineas) -- muestra usuarios en dashboard

**Coordinacion necesaria con Agente C:**
- Estos componentes podrian duplicar logica que ya existe en las paginas de Users/Organizations de Grupo C
- Verificar si Grupo C tiene componentes de tabla similares que podrian reutilizarse
- **Recomendacion:** Si Grupo C tiene `UsersTable` y `OrganizationsTable` completos, los de dashboard deberian ser versiones simplificadas que reusen el mismo servicio/hook

---

## 5. Dependencias con Grupo D (Classroom-Teacher + Reports)

### 5.1 Dependencia baja

No se detectaron dependencias directas significativas entre Grupo A y Grupo D.

### 5.2 Patron CSV Export compartido

- Grupo A tiene 3+ implementaciones duplicadas de CSV export (M8)
- `AdminReportsPage` (Grupo D) probablemente tiene funcionalidad de export tambien

**Coordinacion necesaria:**
- La propuesta M8 (`useExportCSV`) deberia ser en `shared/hooks/` para que Grupo D tambien lo use
- Verificar si `useExportData` (usado por `UserActivityMonitor`) ya cubre este caso

---

## 6. Patrones Transversales que Requieren Solucion Cross-Group

### 6.1 Admin Page Boilerplate (CRITICO -- afecta TODOS los grupos)

| Patron | Grupos afectados | Lineas duplicadas est. |
|--------|-----------------|----------------------|
| `useAuth + useUserGamification + fallback + handleLogout` | A, B, C, D | ~36 x ~15 paginas = ~540 |
| `AdminLayout` wrapper con 4 props | A, B, C, D | ~8 x ~15 paginas = ~120 |

**Propuesta central:** M1 (useAdminPageSetup + AdminPageWrapper) -- Grupo A lo propone, TODOS los grupos deben adoptarlo.

**Responsable de implementacion:** Agente E (Shared) o Agente A (primero en detectarlo).

### 6.2 CSV Export Duplication (MEDIA -- afecta A, posiblemente D)

| Implementacion | Grupo | Archivo |
|---------------|-------|---------|
| Blob download manual | A | RecentActionsTable.tsx |
| Blob download manual | A | SystemLogsViewer.tsx (dashboard) |
| Blob download manual | A | LogsViewer.tsx (monitoring) |
| `useExportData` hook | A | UserActivityMonitor.tsx |
| Probable export manual | D | AdminReportsPage (por confirmar) |

**Propuesta central:** M8 (useExportCSV en shared/) -- hook reutilizable.

### 6.3 Utility Function Duplication (MEDIA -- afecta A, posiblemente B)

| Funcion | Duplicaciones en A | Posible en otros grupos |
|---------|-------------------|----------------------|
| `formatUptime(seconds)` | 3 (Hero, MetricsGrid, MetricsTab) | B (GamificationPage?) |
| `formatNumber(num)` | 3 (Hero, MetricsGrid, MetricsTab) | C (UsersPage totals?) |
| Color mappers | 6+ | Probablemente todos |

**Propuesta central:** M6 (adminFormatters + adminColorUtils) -- utils en `admin/utils/`.

### 6.4 Tab Pattern Reimplementation (MEDIA -- afecta A, B)

| Pagina | Grupo | Num tabs | Lineas de tabs |
|--------|-------|----------|---------------|
| AdminMonitoringPage | A | 4 | 54 |
| AdminSettingsPage | B | ? | ~50 est. |
| AdminGamificationPage | B | ? | ~50 est. |

**Propuesta central:** M7 (AdminTabBar) -- componente compartido.

### 6.5 Loading Spinner Duplication (BAJA -- afecta todos)

Spinner identico (`animate-spin rounded-full border-b-2 border-detective-orange`) aparece en:
- AdminDashboardPage lineas 97-101
- SystemHealthIndicators lineas 89-96
- Multiples componentes en otros grupos (presumible)

**Propuesta:** Extraer a `shared/components/base/LoadingSpinner.tsx` (probablemente ya existe -- verificar con Agente E).

---

## 7. Potenciales Conflictos entre Agentes

### 7.1 Conflicto de Propiedad: Hooks de Admin

| Hook | Grupo propietario | Consumidores |
|------|------------------|-------------|
| `useAdminDashboard` | A | AdminDashboardPage (A) |
| `useSystemMonitoring` | A | Componentes monitoring (A) |
| `useSystemMetrics` | A | SystemPerformanceDashboard (A), SystemHealthIndicators (A) |
| `useFeatureFlags` | A | FeatureFlagsPanel (A), FeatureFlagControls (A) |
| `useMonitoring` | A | AdminMonitoringPage (A) |
| `useAlerts` | A | AdminMonitoringPage (A) |
| `useGamificationConfig` | B | AdminGamificationPage (B) |
| `useAdminDashboard` tipos | E | Definidos en types/ (E) |

**No hay conflicto de propiedad.** Los hooks de Grupo A son consumidos exclusivamente por componentes de Grupo A.

### 7.2 Conflicto Potencial: Doble refactor de AdminLayout

- **Agente A** propone `AdminPageWrapper` que envuelve AdminLayout (M1b)
- **Agente E** podria proponer cambios internos a AdminLayout (mover auth dentro)

**Resolucion:** Ambas propuestas son compatibles si se coordinan. Si Agente E mueve auth dentro de AdminLayout, la propuesta M1a (useAdminPageSetup) se vuelve innecesaria, y M1b cambia a simplemente usar `<AdminLayout>` sin props explícitas.

**Acuerdo necesario:** Definir DONDE vive la logica auth+gamification:
- Opcion 1: En `AdminPageWrapper` (Agente A propone) -- cambio minimo a AdminLayout
- Opcion 2: Dentro de `AdminLayout` via contexto (Agente E propone) -- cambio mayor pero mas limpio

### 7.3 Conflicto Potencial: Tipos compartidos

Si multiples agentes modifican `apps/frontend/src/apps/admin/types/index.ts` simultaneamente, habra conflictos de merge.

**Resolucion:**
- Cada agente puede AGREGAR tipos en archivos separados dentro de `types/`
- Solo Agente E deberia MODIFICAR `types/index.ts` (barrel file)
- Agentes A-D documentan tipos nuevos en sus propuestas

### 7.4 Conflicto Potencial: Componentes en `shared/`

- Agente A propone `useExportCSV` en `shared/hooks/` (M8)
- Agente A propone `Pagination` en `shared/components/` (M9a)
- Agente A propone `ConfirmationDialog` en `shared/components/` (M9c)

Estos archivos estan fuera del scope de admin -- verificar que no colisionen con propuestas de otros agentes.

---

## 8. API Endpoints Consumidos por Grupo A

| Endpoint | Hook consumidor | Frecuencia polling | Compartido con |
|----------|----------------|-------------------|---------------|
| `GET /admin/health` | useAdminDashboard, useSystemMonitoring | 30s / 10s (!) | Solo Grupo A |
| `GET /admin/system/metrics` | useAdminDashboard | 60s | Solo Grupo A |
| `GET /admin/dashboard/actions/recent` | useAdminDashboard | 120s | Solo Grupo A |
| `GET /admin/dashboard/alerts` | useAdminDashboard, useSystemMonitoring | 30s / 5s (!) | Solo Grupo A |
| `GET /admin/dashboard/analytics/user-activity` | useAdminDashboard | 300s | Solo Grupo A |
| `PATCH /admin/alerts/:id/suppress` | useAdminDashboard, useSystemMonitoring | On action | Solo Grupo A |
| `GET /health/ready` | useHealthStatus | 60s | Posiblemente Grupo B |
| `GET /admin/metrics` | useSystemMetrics | 30s | Solo Grupo A |
| `GET /admin/feature-flags` | useFeatureFlags | On demand | Solo Grupo A |
| `POST /admin/feature-flags` | useFeatureFlags | On demand | Solo Grupo A |
| `PATCH /admin/feature-flags/:id` | useFeatureFlags | On demand | Solo Grupo A |
| `DELETE /admin/feature-flags/:id` | useFeatureFlags | On demand | Solo Grupo A |

**Problema critico:** `/admin/health` y `/admin/dashboard/alerts` son fetcheados por DOS hooks diferentes con intervalos distintos:
- `useAdminDashboard`: 30s health, 30s alerts = 4 calls/min
- `useSystemMonitoring`: 10s health, 5s alerts = 18 calls/min
- **Total si ambos activos:** 22 calls/min solo para health+alerts

**Propuesta M3** resuelve esto eliminando `useSystemMonitoring` y consolidando en los sub-hooks de M2.

---

## 9. Resumen de Coordinacion Requerida

| # | Tema | Agentes involucrados | Prioridad | Accion |
|---|------|---------------------|-----------|--------|
| 1 | Admin page boilerplate | A + B + C + D + E | CRITICA | Agente E decide si auth va en layout o wrapper; todos adoptan |
| 2 | Tipos SystemMetrics (3 defs) | A + E | ALTA | Agente E consolida; Agente A elimina local en M4a |
| 3 | TabBar compartido | A + B | MEDIA | Agente B confirma si sus paginas usan tabs |
| 4 | CSV Export compartido | A + D | MEDIA | Agente D confirma si ReportsPage tiene export |
| 5 | Componentes dashboard vs paginas dedicadas | A + C | MEDIA | Agente C verifica si UserManagementTable/OrganizationsTable duplican |
| 6 | Quick Actions rutas | A + B + C | BAJA | Centralizar rutas en QuickActionsGrid |
| 7 | Archivos en shared/ | A + todos | BAJA | Verificar no colision antes de crear |

---

## 10. Diagrama de Dependencias

```
GRUPO A (Dashboard + Monitoring + Advanced)
|
+-- AdminLayout.tsx -----------------------> GRUPO E (Layout)
|   +-- AdminLayoutProps (user, gamData, onLogout)
|   +-- GamifiedHeader
|   +-- GamilitSidebar
|
+-- types/ --------------------------------> GRUPO E (Types)
|   +-- SystemHealth, SystemMetrics, SystemAlert
|   +-- AdminAction, UserActivityData
|   +-- FeatureFlag
|
+-- shared/hooks/ -------------------------> GRUPO E (Shared)
|   +-- useAuth
|   +-- useUserGamification
|   +-- useExportData (existente)
|
+-- Quick Actions navigation --------------> GRUPO B (gamification), GRUPO C (users, orgs, content)
|   +-- /admin/users
|   +-- /admin/institutions
|   +-- /admin/content
|   +-- /admin/gamification
|
+-- dashboard/OrganizationsTable.tsx -------> GRUPO C (conceptual overlap)
+-- dashboard/UserManagementTable.tsx ------> GRUPO C (conceptual overlap)
|
+-- services/api/adminAPI.ts --------------> GRUPO E (API layer)
    +-- getSystemHealth()
    +-- getSystemMetrics()
    +-- getRecentActions()
    +-- getAlerts()
    +-- getUserActivity()
```
