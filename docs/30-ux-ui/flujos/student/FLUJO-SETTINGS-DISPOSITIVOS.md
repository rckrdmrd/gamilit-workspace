# Flujo Student - Settings Dispositivos

**Version:** 1.0.0  
**Fecha:** 2026-02-17  
**Estado:** Activo

---

## Resumen

Flujo para consultar y gestionar dispositivos registrados para notificaciones push.

## Diagrama Mermaid

```mermaid
flowchart TD
    page[DeviceManagementSection] --> fetch[GET /notifications/devices]
    fetch --> update[PATCH /notifications/devices/:id]
    fetch --> remove[DELETE /notifications/devices/:id]
    update --> db[(notifications.user_devices)]
    remove --> db
    db --> ui[Lista actualizada]
```

## Trazabilidad

### Frontend
- `apps/frontend/src/apps/student/pages/DeviceManagementSection.tsx`
- `apps/frontend/src/services/api/notificationsAPI.ts`

### Backend
- `apps/backend/src/modules/notifications/controllers/devices.controller.ts`
- `apps/backend/src/modules/notifications/services/devices.service.ts`

### Datos
- `notifications.user_devices`
