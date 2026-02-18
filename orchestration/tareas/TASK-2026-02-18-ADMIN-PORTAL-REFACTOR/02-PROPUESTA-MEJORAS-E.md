# Propuesta de Mejoras -- Grupo E: Notifications + Alerts + Settings + AuditLogs

**Agente:** E
**Fecha:** 2026-02-18
**Version:** 1.0.0

---

## Resumen de Impacto

| Metrica | Antes | Despues | Reduccion |
|---------|-------|---------|-----------|
| Lineas totales (paginas) | 1,850 | ~815 | -56% |
| Lineas totales (hooks) | 1,531 | ~830 | -46% |
| Lineas totales (componentes) | 2,279 | ~2,050 | -10% |
| Archivos nuevos | 0 | ~15 | +15 |
| Archivos eliminados | 0 | 1 (useSettings) | -1 |
| Violaciones CRITICA | 5 | 0 | -100% |

---

## Mejora Transversal T1: Eliminar Boilerplate de Admin Page

**Prioridad:** CRITICA
**Impacto:** Todas las 18 paginas admin (no solo scope E)

### Descripcion

Crear un hook `useAdminPage` que encapsule el boilerplate repetido en todas las paginas admin:

### Archivos nuevos

**`apps/frontend/src/apps/admin/hooks/useAdminPage.ts`** (~40 lineas)

```typescript
// Encapsula: useAuth + useUserGamification + displayGamificationData fallback + handleLogout
export function useAdminPage() {
  const { user, logout } = useAuth();
  const { gamificationData, isLoading } = useUserGamification(user?.id);

  const displayGamificationData = gamificationData || {
    userId: user?.id || '',
    level: isLoading ? 0 : 1,
    totalXP: 0,
    mlCoins: 0,
    rank: isLoading ? 'Cargando...' : 'Ajaw',
    rankColor: '#9E9E9E',
    progressToNextLevel: 0,
    xpToNextLevel: 100,
    achievements: [],
    totalAchievements: 0,
  };

  const handleLogout = useCallback(() => {
    logout();
    window.location.href = '/login';
  }, [logout]);

  return { user, gamificationData: displayGamificationData, handleLogout };
}
```

**Ahorro:** ~25 lineas x 18 paginas = 450 lineas eliminadas globalmente.

### Estandarizacion de imports

- TODAS las paginas admin deben usar `import { useAuth } from '@features/auth/hooks/useAuth'` (no `@/app/providers/AuthContext`)
- TODAS las paginas admin deben usar `import { AdminLayout } from '../layouts/AdminLayout'` (named, no default)

---

## Mejora Transversal T2: Hook useCSVExport compartido

**Prioridad:** ALTA
**Impacto:** 13 archivos admin que duplican logica CSV

### Archivos nuevos

**`apps/frontend/src/apps/admin/hooks/useCSVExport.ts`** (~60 lineas)

```typescript
export function useCSVExport() {
  const exportToCSV = useCallback((
    headers: string[],
    rows: Array<Record<string, unknown>>,
    filename: string,
    fieldExtractor: (row: Record<string, unknown>) => string[]
  ) => {
    // ... logica compartida de CSV
  }, []);

  return { exportToCSV };
}
```

**Ahorro:** ~49 lineas x 13 archivos = 637 lineas eliminadas.

---

## Mejora Transversal T3: Estandarizar formateo de fechas

**Prioridad:** MEDIA
**Impacto:** 4+ archivos con funciones duplicadas

### Accion

- Eliminar TODAS las funciones `formatDate`, `formatRelativeTime` locales
- Usar `@shared/utils/formatters` para `formatRelativeTime`
- Agregar `formatDateTime` a `@shared/utils/formatters` si no existe (para el formato con segundos usado por AuditLogs)

---

## 1. AdminAuditLogsPage.tsx

**Actual:** 762 lineas --> **Objetivo:** ~95 lineas

### Extracciones

| # | Nuevo archivo | Lineas extraidas | Descripcion |
|---|---------------|-----------------|-------------|
| 1 | `components/audit/LogDetailModal.tsx` | ~106 | Modal de detalle de log (lineas 50-163) |
| 2 | `components/audit/AuditLogFilters.tsx` | ~145 | Panel de filtros con busqueda (lineas 417-559) |
| 3 | `components/audit/AuditLogStats.tsx` | ~50 | Tarjetas de estadisticas (lineas 562-607) |
| 4 | `components/audit/AuditLogTable.tsx` | ~120 | Tabla con paginacion (lineas 642-752) |
| 5 | `components/audit/index.ts` | ~5 | Barrel exports |

### Refactoring adicional

- Usar `useAdminPage()` hook (T1) en vez de boilerplate
- Usar `useCSVExport()` hook (T2) en vez de logica inline
- Usar `@shared/utils/formatters` para fechas (T3)
- Eliminar toast manual + useEffect, usar `toast` de react-hot-toast

### Resultado

```
AdminAuditLogsPage (~95 lineas)
  +-- useAdminPage (T1)
  +-- useAuditLogs (existente)
  +-- useCSVExport (T2)
  +-- AdminLayout
  +-- LogDetailModal (nuevo)
  +-- AuditLogFilters (nuevo)
  +-- AuditLogStats (nuevo)
  +-- AuditLogTable (nuevo)
```

---

## 2. AdminNotificationsPage.tsx

**Actual:** 397 lineas --> **Objetivo:** ~85 lineas

### Extracciones

| # | Nuevo archivo | Lineas extraidas | Descripcion |
|---|---------------|-----------------|-------------|
| 1 | `components/notifications/NotificationsList.tsx` | ~90 | Lista con animaciones (lineas 306-392) |
| 2 | `components/notifications/NotificationFilters.tsx` | ~55 | Filtros de estado y tipo (lineas 229-279) |
| 3 | `components/notifications/notificationUtils.ts` | ~25 | Constantes notificationIcons, notificationLabels (lineas 47-66) |

### Refactoring adicional

- Usar `useAdminPage()` hook (T1)
- Eliminar `formatRelativeTime` local, usar `@shared/utils/formatters` (T3)
- Cambiar import de `useAuth` a `@features/auth/hooks/useAuth`
- Cambiar import de `AdminLayout` a named import

### Resultado

```
AdminNotificationsPage (~85 lineas)
  +-- useAdminPage (T1)
  +-- useNotificationsStore (existente)
  +-- AdminLayout
  +-- NotificationsList (nuevo)
  +-- NotificationFilters (nuevo)
  +-- notificationUtils (nuevo)
```

---

## 3. AdminNotificationPreferencesPage.tsx

**Actual:** 311 lineas --> **Objetivo:** ~100 lineas

### Extracciones

| # | Nuevo archivo | Lineas extraidas | Descripcion |
|---|---------------|-----------------|-------------|
| 1 | `components/notifications/PreferencesTable.tsx` | ~70 | Tabla de toggles (lineas 191-258) |
| 2 | `components/notifications/RegisteredDevices.tsx` | ~50 | Lista de dispositivos (lineas 260-306) |

### Refactoring adicional

- Usar `useAdminPage()` hook (T1)
- Reutilizar constantes de `notificationUtils.ts` (del punto anterior)
- Cambiar imports a consistentes

### Resultado

```
AdminNotificationPreferencesPage (~100 lineas)
  +-- useAdminPage (T1)
  +-- useNotificationsStore (existente)
  +-- usePushNotifications (existente)
  +-- AdminLayout
  +-- PreferencesTable (nuevo)
  +-- RegisteredDevices (nuevo)
```

---

## 4. AdminAlertsPage.tsx

**Actual:** 216 lineas --> **Objetivo:** ~110 lineas

### Cambios (ya bien estructurada)

- Usar `useAdminPage()` hook (T1) -- elimina ~25 lineas
- Corregir fallback `displayGamificationData` incompleto
- Reemplazar `window.confirm()` por un `ConfirmDialog` componente

### Resultado

```
AdminAlertsPage (~110 lineas)
  +-- useAdminPage (T1)
  +-- useAlerts (existente)
  +-- Componentes alerts/ (existentes, sin cambios)
```

---

## 5. AdminSettingsPage.tsx

**Actual:** 164 lineas --> **Objetivo:** ~95 lineas

### Cambios (ya bien estructurada)

- Usar `useAdminPage()` hook (T1) -- elimina ~25 lineas
- Exportar ProfileSettings desde `settings/index.ts`

### Resultado

```
AdminSettingsPage (~95 lineas)
  +-- useAdminPage (T1)
  +-- GeneralSettings, SecuritySettings, ProfileSettings (existentes)
```

---

## 6. Hooks: Migrar a React Query

**Prioridad:** ALTA
**Impacto:** 6 hooks activos (excluye useSettings deprecated)

### useAuditLogs.ts

**Actual:** 135 lineas --> **Objetivo:** ~45 lineas con React Query

```typescript
export function useAuditLogs(filters: AuditLogFilters, page: number, pageSize: number) {
  return useQuery({
    queryKey: ['audit-logs', filters, page, pageSize],
    queryFn: () => getAuditLogs({ ...filters, page, limit: pageSize }),
  });
}
```

### useAlerts.ts

**Actual:** 299 lineas --> **Objetivo:** ~80 lineas (split en 2)

- `useAlertsList` (~30 lineas): `useQuery` para lista + stats
- `useAlertActions` (~50 lineas): `useMutation` para acknowledge/resolve/suppress con invalidation

### useSystemConfig.ts

**Actual:** 93 lineas --> **Objetivo:** ~35 lineas

```typescript
export function useSystemConfig(category: string) {
  const query = useQuery({...});
  const mutation = useMutation({...});
  return { config: query.data, isLoading: query.isLoading, updateConfig: mutation.mutateAsync };
}
```

### useSystemLogs.ts

**Actual:** 194 lineas --> **Objetivo:** ~40 lineas

Mismo patron que useAuditLogs con React Query.

### useLtiConsumers.ts

**Actual:** 324 lineas --> **Objetivo:** ~90 lineas (split en 2)

- `useLtiConsumersList` (~30 lineas)
- `useLtiConsumerActions` (~60 lineas)

### useConfigCategories.ts

**Actual:** 173 lineas --> **Objetivo:** ~40 lineas

---

## 7. Eliminar codigo muerto

### useSettings.ts -- ELIMINAR

**Actual:** 313 lineas --> **Objetivo:** 0 lineas (archivo eliminado)

- Marcado `@deprecated` en docstring
- 0 importadores en todo el codebase
- Reemplazado por `useSystemConfig`
- 3 funciones mock internas que no hacen nada

---

## 8. Arreglar AlertDetailsModal.tsx

**Actual:** 246 lineas --> **Objetivo:** ~180 lineas

### Cambios

- Eliminar `getSeverityColor` y `getStatusColor` locales (lineas 31-49) -- importar de `alertUtils.ts`
- Eliminar `formatDate` local (lineas 51-60) -- importar de `alertUtils.ts` o `@shared/utils/formatters`
- Ahorro: ~30 lineas

---

## 9. Split SecuritySettings.tsx

**Actual:** 557 lineas --> **Objetivo:** 4 componentes de ~120 lineas cada uno

### Extracciones

| # | Nuevo archivo | Lineas | Descripcion |
|---|---------------|--------|-------------|
| 1 | `PasswordPoliciesSection.tsx` | ~95 | Seccion de politicas de contrasenas |
| 2 | `SessionSettingsSection.tsx` | ~95 | Seccion de configuracion de sesiones |
| 3 | `TwoFactorSection.tsx` | ~100 | Seccion de 2FA |
| 4 | `LoginSecuritySection.tsx` | ~115 | Seccion de seguridad de login |

`SecuritySettings.tsx` se convierte en orquestador de ~60 lineas que compone las 4 secciones dentro de un solo `<form>`.

---

## 10. Split ProfileSettings.tsx

**Actual:** 265 lineas --> **Objetivo:** 2 componentes

| # | Nuevo archivo | Lineas | Descripcion |
|---|---------------|--------|-------------|
| 1 | `ProfileInfoForm.tsx` | ~120 | Avatar + datos publicos |
| 2 | `PasswordChangeForm.tsx` | ~100 | Cambio de contrasena |

`ProfileSettings.tsx` se convierte en compositor de ~45 lineas.

---

## Resumen de Archivos Nuevos

| # | Archivo | Tipo | Lineas estimadas |
|---|---------|------|-----------------|
| 1 | `hooks/useAdminPage.ts` | Hook transversal | ~40 |
| 2 | `hooks/useCSVExport.ts` | Hook transversal | ~60 |
| 3 | `components/audit/LogDetailModal.tsx` | Componente | ~106 |
| 4 | `components/audit/AuditLogFilters.tsx` | Componente | ~145 |
| 5 | `components/audit/AuditLogStats.tsx` | Componente | ~50 |
| 6 | `components/audit/AuditLogTable.tsx` | Componente | ~120 |
| 7 | `components/audit/index.ts` | Barrel | ~5 |
| 8 | `components/notifications/NotificationsList.tsx` | Componente | ~90 |
| 9 | `components/notifications/NotificationFilters.tsx` | Componente | ~55 |
| 10 | `components/notifications/notificationUtils.ts` | Utilidades | ~25 |
| 11 | `components/notifications/PreferencesTable.tsx` | Componente | ~70 |
| 12 | `components/notifications/RegisteredDevices.tsx` | Componente | ~50 |
| 13 | `components/settings/PasswordPoliciesSection.tsx` | Componente | ~95 |
| 14 | `components/settings/SessionSettingsSection.tsx` | Componente | ~95 |
| 15 | `components/settings/TwoFactorSection.tsx` | Componente | ~100 |
| 16 | `components/settings/LoginSecuritySection.tsx` | Componente | ~115 |
| 17 | `components/settings/ProfileInfoForm.tsx` | Componente | ~120 |
| 18 | `components/settings/PasswordChangeForm.tsx` | Componente | ~100 |

## Archivo a Eliminar

| # | Archivo | Razon |
|---|---------|-------|
| 1 | `hooks/useSettings.ts` | @deprecated, 0 importadores, 313 lineas muertas |

---

## Orden de Ejecucion Recomendado

1. **T1:** Crear `useAdminPage` hook (desbloquea todas las paginas)
2. **T2:** Crear `useCSVExport` hook (desbloquea AuditLogs y 12 archivos mas)
3. **Eliminar** `useSettings.ts` (ganancia rapida, 0 riesgo)
4. **Extraer** componentes de AdminAuditLogsPage (mayor impacto: 762-->95)
5. **Extraer** componentes de AdminNotificationsPage
6. **Extraer** componentes de AdminNotificationPreferencesPage
7. **Split** SecuritySettings.tsx (557-->4 componentes)
8. **Split** ProfileSettings.tsx
9. **Arreglar** AlertDetailsModal duplicaciones
10. **Migrar** hooks a React Query (puede hacerse incrementalmente)
