# Dependencias Cruzadas -- Grupo E: Notifications + Alerts + Settings + AuditLogs

**Agente:** E
**Fecha:** 2026-02-18
**Version:** 1.0.0

---

## 1. Componentes Compartidos Usados por Grupo E

### Componentes de UI base (usados por todos los grupos)

| Componente | Path | Usado por (Scope E) |
|-----------|------|---------------------|
| `DetectiveCard` | `@shared/components/base/DetectiveCard` | AdminAuditLogsPage, AdminAlertsPage, AdminSettingsPage, GeneralSettings, SecuritySettings, ProfileSettings, AlertCard, AlertsStats |
| `DetectiveButton` | `@shared/components/base/DetectiveButton` | AdminAuditLogsPage, AdminAlertsPage, AlertCard, AlertFilters, AlertsList, AlertDetailsModal, AcknowledgeAlertModal, ResolveAlertModal |
| `AdminLayout` | `apps/admin/layouts/AdminLayout` | Todas las 5 paginas |
| `cn` utility | `@shared/utils/cn` | AdminNotificationsPage, AdminNotificationPreferencesPage, ProfileSettings |

### Hooks compartidos (usados por todos los grupos)

| Hook | Path | Usado por (Scope E) |
|------|------|---------------------|
| `useAuth` | `@features/auth/hooks/useAuth` | AdminAuditLogsPage, AdminAlertsPage, AdminSettingsPage |
| `useAuth` (path alternativo) | `@/app/providers/AuthContext` | AdminNotificationsPage, AdminNotificationPreferencesPage |
| `useUserGamification` | `@shared/hooks/useUserGamification` | Todas las 5 paginas |

### Stores compartidos

| Store | Path | Usado por (Scope E) |
|-------|------|---------------------|
| `useNotificationsStore` | `@/features/notifications/store/notificationsStore` | AdminNotificationsPage, AdminNotificationPreferencesPage |

### API services compartidos

| Service | Path | Usado por (Scope E) |
|---------|------|---------------------|
| `adminAPI` | `@/services/api/adminAPI` | useAlerts, useSystemConfig, useSettings, useConfigCategories |
| `getAuditLogs` | `@/services/api/adminAPI` | useAuditLogs |
| `getSystemLogs` | `@/services/api/adminAPI` | useSystemLogs |
| `getConfigCategories, validateConfig` | `@/services/api/adminAPI` | useConfigCategories |
| `ltiApi` | `@/lib/api/lti.api` | useLtiConsumers |
| `profileAPI` | `@/services/api/profileAPI` | ProfileSettings |

### Tipos compartidos

| Tipo | Path | Usado por (Scope E) |
|------|------|---------------------|
| `AuditLogEntry, AuditLogFilters` | `@/services/api/adminTypes` | AdminAuditLogsPage, useAuditLogs |
| `SystemAlert, AlertFilters, AlertsStats` | `@/services/api/adminTypes` | AdminAlertsPage, useAlerts, AlertCard, AlertDetailsModal, etc. |
| `SystemConfig, SettingsCategory` | `@/services/api/adminTypes` | useSystemConfig, useConfigCategories |
| `LogEntry, LogFilters` | `@/services/api/adminTypes` | useSystemLogs |
| `PaginatedResponse` | `@/services/api/adminTypes` | useAuditLogs, useAlerts, useSystemLogs |

---

## 2. Patrones que Necesitan Solucion Cross-Cutting

### P1: Hook useAdminPage (CRITICA -- afecta todos los 5 grupos)

**Problema:** Todas las 18 paginas admin repiten ~25 lineas de boilerplate identico (useAuth + useUserGamification + displayGamificationData fallback + handleLogout + AdminLayout props).

**Solucion propuesta por Grupo E:** Crear `useAdminPage()` hook.

**Coordinacion necesaria:** Este hook debe ser creado UNA VEZ y adoptado por los 5 grupos simultaneamente. Si cada grupo lo crea de forma diferente, habra conflictos de merge.

**Recomendacion:** Asignar la creacion de `useAdminPage` a un solo agente (sugerido: Grupo A o Grupo E) y que el resto lo consuma.

### P2: Hook useCSVExport (ALTA -- afecta grupos A, B, D, E)

**Problema:** 13 archivos admin duplican logica de exportacion CSV (~49 lineas cada uno).

**Archivos afectados por grupo:**
- **Grupo E:** AdminAuditLogsPage (scope directo)
- **Grupo A/B/D:** AdminUsersPage, AdminAnalyticsPage, AdminProgressPage, hooks/useAdminData, hooks/useAnalytics, hooks/useProgress, hooks/useAdminAssignments, components/users/BulkActionsPanel, components/monitoring/UserActivityMonitor, components/monitoring/LogsViewer, components/dashboard/RecentActionsTable

**Recomendacion:** Crear `useCSVExport` como parte de T1 y coordinarlo con los otros agentes.

### P3: Estandarizar import path de useAuth (MEDIA -- afecta todos los grupos)

**Problema:** 2 paths diferentes para el mismo hook:
- `@features/auth/hooks/useAuth` (16 paginas -- mayoria)
- `@/app/providers/AuthContext` (2 paginas -- AdminNotificationsPage, AdminNotificationPreferencesPage)

**Impacto cross-group:** Si otros agentes (particularmente grupo B que analiza Notifications) tambien cambian estos imports, puede haber conflictos.

**Recomendacion:** Estandarizar a `@features/auth/hooks/useAuth` (el path dominante).

### P4: Estandarizar import style de AdminLayout (BAJA -- afecta todos los grupos)

**Problema:** 2 estilos de import:
- Named: `import { AdminLayout } from '../layouts/AdminLayout'` (16 paginas)
- Default: `import AdminLayout from '../layouts/AdminLayout'` (2 paginas)

**Recomendacion:** Estandarizar a named import. Requiere verificar que AdminLayout tiene named export (si solo tiene default, agregar named export).

### P5: Migrar hooks a React Query (ALTA -- afecta todos los grupos)

**Problema:** TODOS los hooks admin usan useState+useEffect manual. La migracion a React Query es un cambio arquitectonico que afecta a todos los grupos.

**Dependencias:**
- React Query ya esta configurado en el proyecto (usado por student/teacher portals)
- Migrar los hooks requiere cambiar como las paginas consumen datos (de `{ data, isLoading, error, refetch }` pattern manual al mismo pattern pero de React Query)
- La API de retorno es similar, asi que el impacto en las paginas sera minimo

**Recomendacion:** Definir un patron estandar de migracion y aplicarlo incrementalmente, grupo por grupo.

### P6: Funciones de formateo de fechas duplicadas (MEDIA -- afecta todos los grupos)

**Instancias en scope E:**
- `AdminAuditLogsPage.tsx`: 2 copias de `formatDate` (lineas 61-72, 278-288)
- `AdminNotificationsPage.tsx`: `formatRelativeTime` (lineas 149-162)
- `AlertDetailsModal.tsx`: `formatDate` (lineas 51-60)
- `alertUtils.ts`: `formatAlertTimestamp` + `formatAlertTimestampDetailed` (lineas 99-143)

**Instancias fuera de scope E (estimadas):**
- 12+ archivos en admin/ usan `formatDate` local
- `@shared/utils/formatters.ts` y `@shared/utils/format.util.ts` ya exportan `formatRelativeTime`

**Recomendacion:** Centralizar en `@shared/utils/formatters.ts` con variantes necesarias.

---

## 3. Conflictos Potenciales Entre Agentes

### C1: Creacion de useAdminPage hook

| Grupo | Necesita crearlo | Podria crearlo |
|-------|-----------------|----------------|
| A | SI | SI (si analiza Dashboard) |
| B | SI | POSIBLE |
| C | SI | POSIBLE |
| D | SI | POSIBLE |
| **E** | **SI** | **SI (propuesto explicitamente)** |

**Riesgo:** 5 agentes crean versiones diferentes del mismo hook.
**Mitigacion:** Delegar creacion a un solo agente; los demas solo lo referencian.

### C2: Modificacion de AdminLayout exports

Si un agente cambia AdminLayout de default a named export (o viceversa), todos los importadores se rompen.

**Riesgo:** MEDIO
**Mitigacion:** AdminLayout ya tiene AMBOS exports (named y default). Solo estandarizar los imports de las paginas, no modificar AdminLayout.

### C3: formatDate duplicacion cross-scope

AdminAuditLogsPage (scope E) y LogsViewer (scope probablemente C/D) ambos definen `formatDate` inline. Si ambos agentes extraen a shared, podrian duplicar.

**Riesgo:** BAJO
**Mitigacion:** Ambos deben apuntar a `@shared/utils/formatters`.

### C4: useNotificationsStore (scope overlap)

`useNotificationsStore` es usado por AdminNotificationsPage (scope E) pero podria estar en scope de otro agente si analizan features/notifications.

**Riesgo:** BAJO (es un store compartido, no se modifica en esta tarea)

### C5: alertUtils.ts vs AlertDetailsModal.tsx duplicacion

Si el grupo que analiza AlertDetailsModal (deberia ser Grupo E - es mi scope) no arregla la duplicacion, y otro grupo toca alertUtils, pueden quedar inconsistentes.

**Riesgo:** BAJO (ambos estan en scope E)

---

## 4. Dependencias de Ejecucion

### Fase 1: Prerequisitos (debe hacerse primero, 1 solo agente)

```
1. Crear useAdminPage hook (T1)
2. Crear useCSVExport hook (T2)
3. Verificar que @shared/utils/formatters tiene todas las variantes necesarias
```

### Fase 2: Refactoring por grupo (paralelo, sin conflictos)

```
Grupo E:
  - Extraer componentes de AdminAuditLogsPage
  - Extraer componentes de AdminNotificationsPage
  - Extraer componentes de AdminNotificationPreferencesPage
  - Split SecuritySettings
  - Split ProfileSettings
  - Fix AlertDetailsModal duplicaciones
  - Eliminar useSettings.ts

Otros grupos:
  - Sus refactorings respectivos usando useAdminPage/useCSVExport creados en Fase 1
```

### Fase 3: Migracion a React Query (secuencial o paralela por hook)

```
- useAuditLogs -> React Query
- useAlerts -> React Query (split en 2)
- useSystemConfig -> React Query
- useSystemLogs -> React Query
- useConfigCategories -> React Query
- useLtiConsumers -> React Query (split en 2)
```

---

## 5. Resumen de Archivos Compartidos con Otros Grupos

| Archivo compartido | Usado por Grupo E | Modificado por Grupo E | Nota |
|-------------------|-------------------|----------------------|------|
| `AdminLayout.tsx` | SI (5 paginas) | NO | Solo estandarizar imports |
| `useAuth` hook | SI (5 paginas) | NO | Solo estandarizar import path |
| `useUserGamification` | SI (5 paginas) | NO | Encapsulado en useAdminPage |
| `DetectiveCard` | SI (8 archivos) | NO | Sin cambios |
| `DetectiveButton` | SI (8 archivos) | NO | Sin cambios |
| `adminAPI` | SI (5 hooks) | NO | Sin cambios |
| `adminTypes` | SI (8 archivos) | NO | Sin cambios |
| `useNotificationsStore` | SI (2 paginas) | NO | Sin cambios |
| `profileAPI` | SI (1 componente) | NO | Sin cambios |
| `@shared/utils/formatters` | NO (deberia) | POSIBLE adicion | Agregar formatDateTime si falta |
| `@shared/utils/cn` | SI (3 archivos) | NO | Sin cambios |
