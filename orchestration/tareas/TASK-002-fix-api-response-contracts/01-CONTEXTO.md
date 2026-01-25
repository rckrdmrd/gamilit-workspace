# TASK-002: Contexto

## Origen de la Tarea

**Fecha:** 2026-01-25
**Reportado por:** Usuario via errores en consola del navegador
**Tipo:** Bugfix - Inconsistencia en contratos API

## Errores Identificados

### Error 1: claimReward
```
installHook.js:1 [claimReward] Unexpected response format:
{success: true, data: {…}}
installHook.js:1 Formato de respuesta inesperado
```

### Error 2: Notificaciones no se muestran
- Badge de notificaciones muestra contador correcto
- Al abrir dropdown, muestra "No tienes notificaciones"
- Las notificaciones existen en BD pero no cargan

### Error 3: formatTimestamp crash
```
NotificationDropdown.tsx:43 Uncaught TypeError: notifDate.getTime is not a function
    at formatTimestamp (NotificationDropdown.tsx:43:46)
```

## Correcciones Identificadas

| # | Problema | Capa | Causa Raíz |
|---|----------|------|------------|
| 1 | claimReward doble envoltorio | Backend | Controller envuelve manualmente + TransformResponseInterceptor |
| 2 | GET /notifications estructura | Backend | Devuelve `{ data, meta }` pero frontend espera `{ notifications, ... }` |
| 3 | Campo read vs status | Backend | DTO devuelve `read: boolean`, frontend espera `status: 'read' \| 'unread'` |
| 4 | formatTimestamp crash | Frontend | No valida null/undefined antes de llamar Date methods |

## Archivos Clave

### Backend
- `apps/backend/src/modules/gamification/controllers/missions.controller.ts`
- `apps/backend/src/modules/notifications/controllers/notifications.controller.ts`
- `apps/backend/src/modules/notifications/controllers/notification-multichannel.controller.ts`
- `apps/backend/src/modules/notifications/dto/paginated-notifications.dto.ts`
- `apps/backend/src/shared/dto/notifications/notification-response.dto.ts`

### Frontend
- `apps/frontend/src/features/notifications/components/NotificationDropdown.tsx`
- `apps/frontend/src/features/notifications/store/notificationsStore.ts`
- `apps/frontend/src/services/api/notificationsAPI.ts`

## Impacto

- **Misiones:** Usuarios no pueden reclamar recompensas
- **Notificaciones:** Usuarios no ven sus notificaciones
- **UX:** Funcionalidades parecen rotas sin errores claros

## Decision

Usuario aprobó **Opcion A**: Modificar backend para alinear con expectativas del frontend.
