---
titulo: "Especificaciones Tecnicas - EXT-003"
tipo: mapa-navegacion
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# Especificaciones Tecnicas - EXT-003

**EPIC:** EXT-003 - Sistema de Notificaciones
**Ultima actualizacion:** 2026-01-04
**Estado:** ✅ IMPLEMENTADO

---

## Indice de Especificaciones

| ID | Titulo | RF Relacionado | Estado |
|----|--------|----------------|--------|
| ET-NOT-001 | Arquitectura de Notificaciones | RF-NOT-001 | ✅ Done |
| ET-NOT-002 | Canales de Notificacion | RF-NOT-002/003 | ✅ Done |
| ET-NOT-003 | Integracion WebSocket | RF-NOT-001 | ✅ Done |

---

## ET-NOT-001: Arquitectura de Notificaciones

### Componentes del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                    NOTIFICATION SYSTEM                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐     ┌──────────────────┐     ┌────────────┐  │
│  │   Backend    │────▶│   WebSocket      │────▶│  Frontend  │  │
│  │   NestJS     │     │   Gateway        │     │   React    │  │
│  └──────────────┘     └──────────────────┘     └────────────┘  │
│         │                                             │         │
│         ▼                                             ▼         │
│  ┌──────────────┐                           ┌────────────────┐ │
│  │  PostgreSQL  │                           │  Zustand Store │ │
│  │  (Schema:    │                           │  notifications │ │
│  │  notifications)                          │  Store         │ │
│  └──────────────┘                           └────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Schema de Base de Datos

**Schema:** `notifications`

**Tablas:**
1. `notifications` - Notificaciones principales
2. `notification_preferences` - Preferencias por usuario
3. `notification_logs` - Logs de envio
4. `notification_templates` - Plantillas
5. `notification_queue` - Cola de procesamiento
6. `user_devices` - Dispositivos para push

### Backend Services

| Service | Archivo | Responsabilidad |
|---------|---------|-----------------|
| NotificationService | notification.service.ts | CRUD de notificaciones |
| WebSocketService | websocket.service.ts | Emision en tiempo real |
| PushNotificationService | push-notification.service.ts | Push web notifications |

### Frontend Components

| Componente | Portal | Ubicacion |
|------------|--------|-----------|
| NotificationBell | Todos | GamifiedHeader |
| NotificationsPage | Students | /apps/students/pages |
| TeacherNotificationsPage | Teacher | /apps/teacher/pages |
| AdminNotificationsPage | Admin | /apps/admin/pages |

---

## ET-NOT-002: Canales de Notificacion

### Canales Soportados

| Canal | Estado | Implementacion |
|-------|--------|----------------|
| **In-App** | ✅ Activo | WebSocket + Store Zustand |
| **Email** | ✅ Activo | Templates + SMTP |
| **Push** | ✅ Activo | Web Push API (VAPID) |

### Configuracion por Canal

**In-App:**
- Persistencia en `notifications.notifications`
- Tiempo real via Socket.IO
- Indicador de no leidas en NotificationBell

**Email:**
- Templates en `notification_templates`
- Frecuencias: immediate, daily, weekly, never
- Provider: SMTP configurable

**Push:**
- Suscripcion via Service Worker
- VAPID keys en variables de entorno
- Registro en `user_devices`

---

## ET-NOT-003: Integracion WebSocket

### Gateway Configuration

```typescript
// WebSocket Gateway - Socket.IO 4.x
@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL },
  namespace: '/notifications'
})
export class NotificationsGateway {
  // Eventos emitidos:
  // - 'new_notification' (al crear)
  // - 'notification_read' (al marcar leida)
  // - 'unread_count' (contador)
}
```

### Client Connection

```typescript
// Frontend - useWebSocket.ts
const socket = io(WEBSOCKET_URL, {
  reconnectionDelayMax: 30000,
  reconnectionAttempts: Infinity,
  randomizationFactor: 0.5,
  timeout: 20000,
});
```

### Flujo de Eventos

```
1. Usuario autenticado conecta a WebSocket
2. Backend valida JWT y asocia socket a userId
3. Al crear notificacion:
   - Guardar en BD
   - Emitir 'new_notification' al socket del usuario
4. Frontend recibe y actualiza store
5. NotificationBell muestra contador actualizado
```

---

## Archivos Implementados

### Backend

| Archivo | Lineas | Cambios |
|---------|--------|---------|
| notification-multichannel.controller.ts | ~200 | ForbiddenException, @CurrentUser |
| notification.service.ts | ~400 | Logger, WebSocket emission |
| websocket.service.ts | ~150 | emitNotificationToUser |

### Frontend

| Archivo | Lineas | Portal |
|---------|--------|--------|
| notificationsStore.ts | ~200 | Compartido |
| useWebSocket.ts | ~250 | Compartido |
| TeacherNotificationsPage.tsx | ~350 | Teacher |
| TeacherNotificationPreferencesPage.tsx | ~300 | Teacher |
| AdminNotificationsPage.tsx | ~350 | Admin |
| AdminNotificationPreferencesPage.tsx | ~280 | Admin |

---

**Generado:** 2026-01-04
**Sistema:** NEXUS v4.1 + SIMCO
