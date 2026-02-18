# Hallazgos -- Grupo E: Notifications + Alerts + Settings + AuditLogs

**Agente:** E
**Fecha:** 2026-02-18
**Version:** 1.0.0

---

## Resumen

- **Paginas analizadas:** 5 (1,850 lineas totales)
- **Hooks analizados:** 7 (1,531 lineas totales)
- **Componentes analizados:** 13 (2,279 lineas totales)
- **Total archivos:** 25
- **Total lineas:** 5,660
- **Total violaciones:** 34 (5 CRITICA, 12 ALTA, 12 MEDIA, 5 BAJA)

---

## 1. AdminAuditLogsPage.tsx (762 lineas)

**Ruta:** `apps/frontend/src/apps/admin/pages/AdminAuditLogsPage.tsx`

### Violaciones

1. **[CRITICA]** Lineas 58-163: `LogDetailModal` definido INLINE dentro del mismo archivo (~106 lineas). Viola SRP y la regla de "no inline modal definitions". Debe ser un componente separado en `components/audit/`.
2. **[CRITICA]** Lineas 293-341: Logica de exportacion CSV (~49 lineas) duplicada con al menos 12 otros archivos admin (AdminUsersPage, AdminAnalyticsPage, AdminProgressPage, etc.). Debe ser un hook/utilidad compartida `useCSVExport`.
3. **[CRITICA]** Lineas 168-761: Componente principal de 594 lineas (sin contar el modal inline). Excede 4x el limite de 150 lineas SRP.
4. **[ALTA]** Lineas 417-559: Panel de filtros inline (~143 lineas). Debe extraerse a `AuditLogFilters` componente.
5. **[ALTA]** Lineas 562-607: Panel de estadisticas inline (~46 lineas). Debe extraerse a `AuditLogStats` componente.
6. **[ALTA]** Lineas 642-752: Tabla con paginacion inline (~111 lineas). Debe extraerse a `AuditLogTable` componente.
7. **[ALTA]** Lineas 169-198: Boilerplate `displayGamificationData` fallback (30 lineas) -- duplicado en 14+ paginas admin.
8. **[ALTA]** Lineas 219-222: `handleLogout` boilerplate (4 lineas) -- duplicado en 16+ paginas admin.
9. **[MEDIA]** Lineas 278-288: `formatDate` definida localmente en vez de usar `@shared/utils/formatters`. Tambien duplicada dentro de `LogDetailModal` (lineas 61-72).
10. **[MEDIA]** Lineas 346-351: `useEffect` manual para auto-dismiss toast en vez de usar `react-hot-toast` como el resto del admin portal.
11. **[MEDIA]** Linea 20: Usa `useEffect` para data fetching en vez de React Query.

### Boilerplate Duplicado

| Patron | Lineas | Ocurrencias en admin/ |
|--------|--------|----------------------|
| `useAuth()` import + destructure | 22, 169 | 18 paginas |
| `useUserGamification()` + fallback | 184-198 | 14 paginas |
| `handleLogout` | 219-222 | 16 paginas |
| `AdminLayout` wrapper | 358-364, 759 | 18 paginas |
| CSV export logic | 293-341 | 13 archivos |

### Mapa de Dependencias

```
AdminAuditLogsPage
  +-- useAuth (@features/auth/hooks/useAuth)
  +-- useUserGamification (@shared/hooks/useUserGamification)
  +-- useAuditLogs (../hooks/useAuditLogs)
  +-- AdminLayout (../layouts/AdminLayout) [named import]
  +-- DetectiveCard (@shared/components/base/DetectiveCard)
  +-- DetectiveButton (@shared/components/base/DetectiveButton)
  +-- AuditLogFilters, AuditLogEntry (@/services/api/adminTypes)
  +-- LogDetailModal [INLINE]
  +-- lucide-react: FileText, Download, Filter, CheckCircle, XCircle, ChevronLeft, ChevronRight, RefreshCw, Search, Calendar, Shield, Eye, X
  +-- framer-motion: motion
```

---

## 2. AdminNotificationsPage.tsx (397 lineas)

**Ruta:** `apps/frontend/src/apps/admin/pages/AdminNotificationsPage.tsx`

### Violaciones

1. **[ALTA]** Lineas 71-396: Componente de 326 lineas, excede 2x el limite de 150 lineas.
2. **[ALTA]** Lineas 149-162: `formatRelativeTime` definida localmente (14 lineas) cuando existe `formatRelativeTime` en `@shared/utils/formatters` y `@shared/utils/format.util` -- duplicacion directa de utilidad compartida.
3. **[MEDIA]** Lineas 47-66: Constantes `notificationIcons` y `notificationLabels` definidas inline en el archivo de pagina. Deberian estar en un archivo de constantes o utilidades de notificaciones.
4. **[MEDIA]** Lineas 306-392: Lista de notificaciones renderizada inline (~87 lineas). Podria extraerse a `NotificationsList` componente.
5. **[MEDIA]** Linea 40: Usa `useAuth` de `@/app/providers/AuthContext` -- inconsistente con las otras 16 paginas admin que importan de `@features/auth/hooks/useAuth`.
6. **[MEDIA]** Linea 36: Importa `AdminLayout` como default export (`import AdminLayout from`) -- inconsistente con las otras 16 paginas que usan named export (`import { AdminLayout } from`).
7. **[BAJA]** Linea 76-86: Usa Zustand store (`useNotificationsStore`) en vez de React Query. Este es el unico archivo en mi scope que usa Zustand -- patron inconsistente.
8. **[BAJA]** Lineas 94-98: `useEffect` para fetch en mount -- patron manual vs React Query.

### Boilerplate Duplicado

| Patron | Lineas | Nota |
|--------|--------|------|
| `useAuth()` import + destructure | 40, 72 | Importa de path diferente al resto |
| `useUserGamification()` | 73 | Sin fallback (inconsistente con otras paginas) |
| `AdminLayout` wrapper | 164-169, 394-395 | Sin `organizationName` ni `handleLogout` redirect -- pasa `logout` directamente |

### Mapa de Dependencias

```
AdminNotificationsPage
  +-- useAuth (@/app/providers/AuthContext) [INCONSISTENTE]
  +-- useUserGamification (@shared/hooks/useUserGamification)
  +-- useNotificationsStore (@/features/notifications/store/notificationsStore) [Zustand]
  +-- AdminLayout (../layouts/AdminLayout) [default import -- INCONSISTENTE]
  +-- cn (@shared/utils/cn)
  +-- lucide-react: Bell, CheckCheck, Trash2, Settings, Filter, AlertCircle, Megaphone, RefreshCw, Check, Shield, Users, Building2, Activity, Database
  +-- framer-motion: motion, AnimatePresence
  +-- react-router-dom: Link
```

---

## 3. AdminNotificationPreferencesPage.tsx (311 lineas)

**Ruta:** `apps/frontend/src/apps/admin/pages/AdminNotificationPreferencesPage.tsx`

### Violaciones

1. **[ALTA]** Lineas 47-310: Componente de 264 lineas, excede ~1.8x el limite de 150 lineas.
2. **[MEDIA]** Lineas 191-258: Tabla de preferencias con toggles inline (~68 lineas). Podria extraerse a `PreferencesTable` componente.
3. **[MEDIA]** Lineas 260-306: Seccion de dispositivos registrados inline (~47 lineas). Podria extraerse a `RegisteredDevices` componente.
4. **[MEDIA]** Linea 31: Importa `useAuth` de `@/app/providers/AuthContext` -- inconsistente con las otras paginas admin.
5. **[MEDIA]** Linea 26: Importa `AdminLayout` como default -- inconsistente con el resto.
6. **[BAJA]** Lineas 38-45: Constante `notificationTypes` duplicada parcialmente con `notificationLabels` en AdminNotificationsPage.

### Boilerplate Duplicado

| Patron | Lineas | Nota |
|--------|--------|------|
| `useAuth()` import | 31, 48 | Path inconsistente |
| `useUserGamification()` | 49 | Sin fallback |
| `AdminLayout` wrapper | 131-136, 308-309 | Sin `organizationName` |

### Mapa de Dependencias

```
AdminNotificationPreferencesPage
  +-- useAuth (@/app/providers/AuthContext) [INCONSISTENTE]
  +-- useUserGamification (@shared/hooks/useUserGamification)
  +-- useNotificationsStore (@/features/notifications/store/notificationsStore)
  +-- usePushNotifications (@/features/notifications/hooks/usePushNotifications)
  +-- AdminLayout (../layouts/AdminLayout) [default import -- INCONSISTENTE]
  +-- cn (@shared/utils/cn)
  +-- lucide-react: Bell, ArrowLeft, Smartphone, Mail, MonitorSmartphone, Loader2, Trash2
  +-- framer-motion: motion
  +-- react-router-dom: Link
```

---

## 4. AdminAlertsPage.tsx (216 lineas)

**Ruta:** `apps/frontend/src/apps/admin/pages/AdminAlertsPage.tsx`

### Violaciones

1. **[ALTA]** Lineas 47-54: Boilerplate `displayGamificationData` fallback con propiedades incompletas (falta `rankColor`, `progressToNextLevel`, `xpToNextLevel`, `totalAchievements`) -- inconsistente con AdminAuditLogsPage y AdminSettingsPage que usan el fallback completo de 12 propiedades.
2. **[ALTA]** Lineas 83-86: `handleLogout` boilerplate duplicado en 16 paginas.
3. **[BAJA]** Lineas 103-115: Usa `window.confirm()` para confirmar supresion -- no tematico, no accesible, inconsistente con el patron de modales del resto de la pagina.

### Aspectos Positivos

Esta pagina es la **mejor estructurada** del grupo E:
- Usa container/presentational pattern correctamente
- Componentes extraidos a `components/alerts/` (AlertsStats, AlertFilters, AlertsList, modales)
- 216 lineas esta dentro de un rango aceptable (150 ideal, 216 tolerable)
- Modales como componentes separados (AlertDetailsModal, AcknowledgeAlertModal, ResolveAlertModal)
- Hook `useAlerts` encapsula toda la logica de negocio

### Boilerplate Duplicado

| Patron | Lineas | Nota |
|--------|--------|------|
| `useAuth()` + destructure | 19, 43 | `@features/auth/hooks/useAuth` (consistente) |
| `useUserGamification()` + fallback | 46-54 | Fallback INCOMPLETO |
| `handleLogout` + redirect | 83-86 | Estandar |
| `AdminLayout` wrapper | 134-140, 213-214 | Named import (consistente) |

### Mapa de Dependencias

```
AdminAlertsPage
  +-- useAuth (@features/auth/hooks/useAuth)
  +-- useUserGamification (@shared/hooks/useUserGamification)
  +-- useAlerts (../hooks/useAlerts)
  +-- AdminLayout (../layouts/AdminLayout) [named import]
  +-- AlertsStats (../components/alerts/AlertsStats)
  +-- AlertFilters (../components/alerts/AlertFilters)
  +-- AlertsList (../components/alerts/AlertsList)
  +-- AlertDetailsModal (../components/alerts/AlertDetailsModal)
  +-- AcknowledgeAlertModal (../components/alerts/AcknowledgeAlertModal)
  +-- ResolveAlertModal (../components/alerts/ResolveAlertModal)
  +-- DetectiveButton (@shared/components/base/DetectiveButton)
  +-- SystemAlert (@/services/api/adminTypes)
  +-- lucide-react: AlertTriangle, RefreshCw
```

---

## 5. AdminSettingsPage.tsx (164 lineas)

**Ruta:** `apps/frontend/src/apps/admin/pages/AdminSettingsPage.tsx`

### Violaciones

1. **[MEDIA]** Lineas 65-76: Boilerplate `displayGamificationData` fallback duplicado.
2. **[MEDIA]** Lineas 78-81: `handleLogout` boilerplate duplicado.

### Aspectos Positivos

- 164 lineas -- casi dentro del limite de 150 (solo 14 lineas de exceso, 9% -- tolerable)
- Usa tabs correctamente con TABS constant array
- Delega contenido a componentes separados (GeneralSettings, SecuritySettings, ProfileSettings)
- Usa `useSystemConfig` hook (no el deprecated `useSettings`)
- Estructura limpia y legible

### Boilerplate Duplicado

| Patron | Lineas | Nota |
|--------|--------|------|
| `useAuth()` + destructure | 2, 58 | Consistente con resto |
| `useUserGamification()` + fallback | 62-76 | Fallback COMPLETO (12 propiedades) |
| `handleLogout` + redirect | 78-81 | Estandar |
| `AdminLayout` wrapper | 96-102, 161-162 | Named import (consistente) |

### Mapa de Dependencias

```
AdminSettingsPage
  +-- useAuth (@features/auth/hooks/useAuth)
  +-- useUserGamification (@shared/hooks/useUserGamification)
  +-- AdminLayout (../layouts/AdminLayout) [named import]
  +-- GeneralSettings, SecuritySettings (../components/settings)
  +-- ProfileSettings (../components/settings/ProfileSettings)
  +-- DetectiveCard (@shared/components/base/DetectiveCard)
  +-- lucide-react: AlertTriangle, Settings, Shield, User
```

---

## 6. useAuditLogs.ts (135 lineas)

**Ruta:** `apps/frontend/src/apps/admin/hooks/useAuditLogs.ts`

### Violaciones

1. **[ALTA]** Lineas 10-135: Usa `useState` + `useEffect` + `useCallback` manual para data fetching en vez de React Query. Toda la logica de fetching, caching, pagination, y error handling esta reimplementada manualmente.

### Mapa de Dependencias

```
useAuditLogs
  +-- getAuditLogs (@/services/api/adminAPI)
  +-- AuditLogEntry, AuditLogFilters, PaginatedResponse (@/services/api/adminTypes)
```

---

## 7. useAlerts.ts (299 lineas)

**Ruta:** `apps/frontend/src/apps/admin/hooks/useAlerts.ts`

### Violaciones

1. **[CRITICA]** Lineas 66-298: Hook de 233 lineas que maneja CRUD + estadisticas + paginacion + filtering todo en un solo hook. Excede el limite de 150 lineas. Deberia dividirse en `useAlertsList` (queries) y `useAlertActions` (mutations).
2. **[ALTA]** Lineas 66-299: Usa `useState` + `useEffect` + `useCallback` manual para todo el data fetching. React Query manejaría caching, invalidation, optimistic updates, y retry automaticamente.
3. **[MEDIA]** Linea 70: `selectedAlert` state gestionada dentro del hook pero tambien se gestiona en AdminAlertsPage (linea 75). Duplicacion de estado.

### Mapa de Dependencias

```
useAlerts
  +-- adminAPI (@/services/api/adminAPI)
  +-- Alert, AlertFilters, AlertsStats, PaginatedResponse (@/services/api/adminTypes)
```

---

## 8. useSystemConfig.ts (93 lineas)

**Ruta:** `apps/frontend/src/apps/admin/hooks/useSystemConfig.ts`

### Violaciones

1. **[MEDIA]** Linea 1: `eslint-disable @typescript-eslint/no-explicit-any` -- suprime reglas de TypeScript para todo el archivo.
2. **[MEDIA]** Lineas 26, 54: Usa `any` (2 ocurrencias) en vez de tipos genericos o `Record<string, unknown>`.

### Aspectos Positivos

- 93 lineas -- dentro del limite
- API limpia y enfocada
- Usado por GeneralSettings y SecuritySettings

### Mapa de Dependencias

```
useSystemConfig
  +-- adminAPI (@/services/api/adminAPI)
  +-- SystemConfig (@/services/api/adminTypes)
```

---

## 9. useSettings.ts (313 lineas) -- DEPRECATED

**Ruta:** `apps/frontend/src/apps/admin/hooks/useSettings.ts`

### Violaciones

1. **[CRITICA]** Lineas 1-313: **ARCHIVO MUERTO** -- marcado como `@deprecated` (linea 4), sin importadores (0 archivos lo usan), 313 lineas de codigo muerto. Debe eliminarse.
2. **[MEDIA]** Linea 15: `eslint-disable @typescript-eslint/no-explicit-any` -- suprime TypeScript strict.
3. **[BAJA]** Lineas 181-201, 232-263, 269-289: Tres funciones con implementacion MOCK (`sendTestEmail`, `createBackup`, `clearCache`) marcadas como deprecated individualmente.

### Mapa de Dependencias

```
useSettings [DEAD CODE -- 0 importers]
  +-- adminAPI (@/services/api/adminAPI)
```

---

## 10. useConfigCategories.ts (173 lineas)

**Ruta:** `apps/frontend/src/apps/admin/hooks/useConfigCategories.ts`

### Violaciones

1. **[BAJA]** Lineas 69-172: Hook registrado en `hooks/index.ts` pero no usado por ningun archivo de pagina o componente en el scope. Potencialmente muerto o de uso futuro.

### Mapa de Dependencias

```
useConfigCategories [potentially unused -- only in hooks/index.ts]
  +-- getConfigCategories, validateConfig (@/services/api/adminAPI)
  +-- SettingsCategory (@/services/api/adminTypes)
```

---

## 11. useSystemLogs.ts (194 lineas)

**Ruta:** `apps/frontend/src/apps/admin/hooks/useSystemLogs.ts`

### Violaciones

1. **[ALTA]** Lineas 70-193: Usa `useState` + `useEffect` manual para data fetching en vez de React Query.
2. **[BAJA]** Hook solo registrado en `hooks/index.ts` -- no usado directamente por ninguna pagina en el scope E. Podria estar usado por AdminMonitoringPage (scope de otro agente).

### Mapa de Dependencias

```
useSystemLogs [not used in scope E]
  +-- getSystemLogs (@/services/api/adminAPI)
  +-- LogEntry, LogFilters (@/services/api/adminTypes)
```

---

## 12. useLtiConsumers.ts (324 lineas)

**Ruta:** `apps/frontend/src/apps/admin/hooks/useLtiConsumers.ts`

### Violaciones

1. **[ALTA]** Lineas 73-323: Hook de 251 lineas que maneja CRUD completo + testing + credentials en un solo hook. Excede el limite de 150 lineas. Deberia dividirse en `useLtiConsumersList` y `useLtiConsumerActions`.
2. **[ALTA]** Lineas 73-323: Usa `useState` + `useEffect` manual en vez de React Query.

### Nota

Usado solo por `features/admin/lti/AdminLtiPage.tsx` -- no directamente por ninguna pagina Settings en scope E.

### Mapa de Dependencias

```
useLtiConsumers
  +-- ltiApi (@/lib/api/lti.api)
  +-- LtiConsumer, CreateLtiConsumerDto, UpdateLtiConsumerDto, etc. (@/shared/types/lti.types)
```

---

## 13-25. Componentes (alerts/ y settings/)

### components/alerts/AlertCard.tsx (125 lineas) -- OK

- Dentro del limite de 150 lineas
- Usa `alertUtils.ts` correctamente para funciones compartidas
- Props-driven (presentational pattern)
- Sin violaciones

### components/alerts/AlertDetailsModal.tsx (246 lineas)

1. **[ALTA]** Lineas 31-49: Funciones `getSeverityColor` y `getStatusColor` **duplicadas** de `alertUtils.ts` (que las exporta). El modal redefine localmente las mismas funciones en vez de importarlas.
2. **[ALTA]** Lineas 51-60: Funcion `formatDate` duplicada localmente. Existe en `@shared/utils/formatters` y en `alertUtils.ts` como `formatAlertTimestampDetailed`.
3. **[MEDIA]** Lineas 28-245: Componente de 218 lineas, excede el limite de 150 lineas.

### components/alerts/AlertFilters.tsx (208 lineas) -- Marginal

1. **[MEDIA]** Lineas 31-207: 177 lineas de componente. Excede el limite por ~18%. Aceptable dado que es un formulario con 5 filtros.

### components/alerts/AlertsList.tsx (129 lineas) -- OK

- Dentro del limite
- Skeleton loading, empty state, pagination
- Props-driven
- Sin violaciones

### components/alerts/AlertsStats.tsx (99 lineas) -- OK

- Dentro del limite
- Skeleton loading, data-driven cards
- Sin violaciones

### components/alerts/alertUtils.ts (144 lineas) -- OK

- Utilidades compartidas correctamente extraidas
- Buen patron de reutilizacion
- Problema: AlertDetailsModal NO las usa (duplica en su lugar)

### components/alerts/index.ts (14 lineas) -- OK

- Barrel export correcto

### components/alerts/AcknowledgeAlertModal.tsx (132 lineas) -- OK

- Dentro del limite
- Manejo de form, error, loading correcto
- Sin violaciones

### components/alerts/ResolveAlertModal.tsx (161 lineas) -- Marginal

- 11 lineas sobre el limite (7% exceso)
- Validacion de minimo 10 caracteres
- Aceptable

### components/settings/index.ts (2 lineas)

1. **[MEDIA]** No exporta `ProfileSettings`. Importada directamente en AdminSettingsPage como `'../components/settings/ProfileSettings'` en vez de via barrel.

### components/settings/GeneralSettings.tsx (197 lineas)

1. **[MEDIA]** 197 lineas, excede el limite de 150 por 31%. Podria extraer el info box y los form actions.
- Usa `react-hook-form` correctamente
- Usa `useSystemConfig` hook
- Usa `toast` de react-hot-toast

### components/settings/SecuritySettings.tsx (557 lineas)

1. **[CRITICA]** 557 lineas, excede 3.7x el limite de 150 lineas. Es el segundo archivo mas grande de todo el scope E.
2. **[ALTA]** 4 secciones de formulario (Password Policies, Session Settings, 2FA, Login Security) estan todas en un solo componente. Cada seccion deberia ser su propio componente.

### components/settings/ProfileSettings.tsx (265 lineas)

1. **[ALTA]** 265 lineas, excede 1.7x el limite. Contiene profile + password change + avatar upload.
2. **[MEDIA]** Lineas 50-51, 101-102: Usa `console.error` para error logging en vez de un servicio centralizado.
3. **[MEDIA]** No exportada via `settings/index.ts` barrel.

---

## Patrones Transversales Detectados

### 1. Boilerplate de Admin Page (presente en 5/5 paginas)

```typescript
// Este bloque de ~25 lineas se repite en cada pagina admin:
const { user, logout } = useAuth();
const { gamificationData, isLoading: gamificationLoading } = useUserGamification(user?.id);
const displayGamificationData = gamificationData || { /* 12 propiedades fallback */ };
const handleLogout = () => { logout(); window.location.href = '/login'; };

return (
  <AdminLayout
    user={user || undefined}
    gamificationData={displayGamificationData}
    organizationName="GAMILIT Platform Admin"
    onLogout={handleLogout}
  >
    {/* page content */}
  </AdminLayout>
);
```

**Impacto:** ~25 lineas x 18 paginas = 450 lineas de boilerplate puro.

### 2. Variantes de displayGamificationData Fallback

| Pagina | Propiedades en fallback | Consistente |
|--------|------------------------|-------------|
| AdminAuditLogsPage | 12 (completo) | SI |
| AdminSettingsPage | 12 (completo) | SI |
| AdminAlertsPage | 6 (incompleto) | NO |
| AdminNotificationsPage | Sin fallback | NO |
| AdminNotificationPreferencesPage | Sin fallback | NO |

### 3. Inconsistencia de import paths para useAuth

| Path | Paginas |
|------|---------|
| `@features/auth/hooks/useAuth` | AdminAuditLogsPage, AdminAlertsPage, AdminSettingsPage (3/5) |
| `@/app/providers/AuthContext` | AdminNotificationsPage, AdminNotificationPreferencesPage (2/5) |

### 4. Inconsistencia de import de AdminLayout

| Estilo | Paginas |
|--------|---------|
| Named: `import { AdminLayout } from` | AdminAuditLogsPage, AdminAlertsPage, AdminSettingsPage (3/5) |
| Default: `import AdminLayout from` | AdminNotificationsPage, AdminNotificationPreferencesPage (2/5) |

### 5. Hooks NO usan React Query

Todos los 7 hooks analizados usan `useState` + `useEffect` + `useCallback` manual en vez de React Query:
- useAuditLogs (135 lineas) -- reimplementa pagination + filtering + caching
- useAlerts (299 lineas) -- reimplementa CRUD + stats + pagination
- useSystemConfig (93 lineas) -- reimplementa fetch + update
- useSettings (313 lineas) -- DEPRECATED, codigo muerto
- useConfigCategories (173 lineas) -- reimplementa fetch + validate
- useSystemLogs (194 lineas) -- reimplementa pagination + filtering
- useLtiConsumers (324 lineas) -- reimplementa CRUD + testing

### 6. Duplicacion de funciones de formateo de fechas

`formatDate`, `formatRelativeTime` y variantes definidas localmente en:
- AdminAuditLogsPage.tsx (2 copias: lineas 61-72 y 278-288)
- AdminNotificationsPage.tsx (lineas 149-162)
- AlertDetailsModal.tsx (lineas 51-60)
- alertUtils.ts (lineas 99-143 -- la version "oficial")

Cuando existen versiones compartidas en:
- `@shared/utils/formatters.ts` (exporta `formatRelativeTime`)
- `@shared/utils/format.util.ts` (exporta `formatRelativeTime`)
