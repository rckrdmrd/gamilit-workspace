<!-- RFC-0001: Estándar de Documentación Técnica -->
<!-- Proyecto: GAMILIT - Plataforma Gamificada de Machine Learning -->
<!-- Documento: WebSocket - Índice Principal -->
<!-- Versión: 1.0.0 -->
<!-- Última Actualización: 2025-11-01 -->

# WebSocket y Comunicación en Tiempo Real

## Información General

**Tecnología:** Socket.IO 4.8.1
**Transporte:** WebSocket + Polling (fallback)
**Autenticación:** JWT Token
**Endpoint:** `ws://localhost:3006/socket.io/`

---

## Índice de Documentación

### 1. [WebSocket-Conexiones.md](./WebSocket-Conexiones.md)
Documentación de gestión de conexiones y autenticación WebSocket.

**Contenido:**
- Arquitectura WebSocket
- Inicialización del Servidor
- Autenticación JWT
- Conexión y Desconexión de Clientes
- Salas (Rooms)
- RealtimeService

**Conceptos Clave:** Conexiones, Autenticación, Rooms

---

### 2. [WebSocket-Eventos.md](./WebSocket-Eventos.md)
Documentación de eventos y tipos de notificaciones en tiempo real.

**Contenido:**
- Eventos del Servidor
- Eventos del Cliente
- Tipos de Notificaciones
- Cliente WebSocket (Frontend)
- Flujos de Comunicación

**Conceptos Clave:** Eventos, Notificaciones, Emisión

---

### 3. [WebSocket-Seguridad.md](./WebSocket-Seguridad.md)
Documentación de seguridad, testing y monitoreo del sistema WebSocket.

**Contenido:**
- Manejo de Errores y Reconexión
- Testing WebSocket
- Monitoreo y Debugging
- Mejores Prácticas
- Optimizaciones de Rendimiento

**Conceptos Clave:** Seguridad, Testing, Monitoreo

---

## Arquitectura General

```
┌─────────────────────────────────────────────────┐
│           Cliente (Frontend)                    │
│   - Socket.IO Client                            │
│   - Auto-reconexión                             │
│   - Event listeners                             │
└──────────────────┬──────────────────────────────┘
                   │
                   ↓ (WebSocket/Polling)
┌─────────────────────────────────────────────────┐
│       Socket.IO Server (Backend)                │
│   - socket.server.ts                            │
│   - Autenticación JWT                           │
│   - Gestión de conexiones                       │
│   - Salas (rooms) por usuario                   │
└──────────────────┬──────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────┐
│        RealtimeService                          │
│   - Registro de sockets por usuario             │
│   - Emisión de notificaciones                   │
│   - Broadcast a grupos                          │
│   - Contadores en vivo                          │
└──────────────────┬──────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────┐
│     Servicios del Backend                       │
│   - NotificationsService                        │
│   - GamificationService                         │
│   - MissionsService                             │
│   - etc.                                        │
└─────────────────────────────────────────────────┘
```

---

## Eventos Principales

### Eventos del Servidor (Emitidos al Cliente)

| Evento | Descripción | Payload |
|--------|-------------|---------|
| `authenticated` | Confirmación de autenticación exitosa | `{ success: true, userId, email, socketId }` |
| `new_notification` | Nueva notificación recibida | `{ notification, timestamp }` |
| `notification_read` | Notificación marcada como leída | `{ notificationId, success }` |
| `notification_deleted` | Notificación eliminada | `{ notificationId, timestamp }` |
| `unread_count_updated` | Actualización de contador no leídas | `{ count, timestamp }` |
| `error` | Error general | `{ message }` |

### Eventos del Cliente (Emitidos al Servidor)

| Evento | Descripción | Payload |
|--------|-------------|---------|
| `mark_as_read` | Marcar notificación como leída | `{ notificationId }` |

---

## Tipos de Notificaciones

```typescript
type NotificationType =
  | 'achievement_unlocked'   // Logro desbloqueado
  | 'mission_completed'      // Misión completada
  | 'level_up'              // Subida de nivel
  | 'friend_request'        // Solicitud de amistad
  | 'guild_invitation'      // Invitación a gremio
  | 'assignment_graded'     // Tarea calificada
  | 'new_assignment'        // Nueva tarea publicada
  | 'system_announcement';  // Anuncio del sistema
```

---

## Flujo de Conexión

```
1. Cliente se conecta con token JWT
   ↓
2. socketAuthMiddleware valida token
   ↓
3. Si válido: adjunta userData al socket
   ↓
4. Socket se une a sala personal: `user:${userId}`
   ↓
5. RealtimeService registra socket del usuario
   ↓
6. Servidor emite evento 'authenticated'
   ↓
7. Cliente recibe confirmación y está listo
```

---

## Diagrama de Flujo: Notificación en Tiempo Real

```
┌───────────────────────────────────────────────┐
│ Usuario completa ejercicio                    │
└──────────────────┬────────────────────────────┘
                   ↓
┌───────────────────────────────────────────────┐
│ ExercisesService.submitExercise()            │
│ - Evalúa respuesta                            │
│ - Otorga recompensas                          │
│ - Verifica logros desbloqueados               │
└──────────────────┬────────────────────────────┘
                   ↓
┌───────────────────────────────────────────────┐
│ GamificationService.unlockAchievement()      │
│ - Crea registro en user_achievements          │
│ - Otorga coins + XP                           │
└──────────────────┬────────────────────────────┘
                   ↓
┌───────────────────────────────────────────────┐
│ NotificationsService.createNotification()    │
│ - Persiste notificación en DB                 │
└──────────────────┬────────────────────────────┘
                   ↓
┌───────────────────────────────────────────────┐
│ RealtimeService.emitNotificationToUser()     │
│ - Emite evento a sala user:${userId}          │
└──────────────────┬────────────────────────────┘
                   ↓
┌───────────────────────────────────────────────┐
│ Socket.IO emite 'new_notification'           │
│ - Solo a sockets del usuario                  │
└──────────────────┬────────────────────────────┘
                   ↓
┌───────────────────────────────────────────────┐
│ Cliente recibe evento                         │
│ - Muestra modal de logro                      │
│ - Reproduce sonido                            │
│ - Actualiza UI                                │
└───────────────────────────────────────────────┘
```

---

## Quick Start

### Servidor (Backend)

```typescript
// En server.ts
import { initializeSocketServer } from './websocket/socket.server';

const httpServer = createServer(app);
const io = initializeSocketServer(httpServer);

// Inicializar RealtimeService
realtimeService.initialize(io);

httpServer.listen(PORT);
```

### Cliente (Frontend)

```typescript
import { io } from 'socket.io-client';

// Conectar
const socket = io('ws://localhost:3006', {
  auth: { token: `Bearer ${jwtToken}` },
  transports: ['websocket', 'polling']
});

// Escuchar eventos
socket.on('authenticated', (data) => {
  console.log('Connected:', data);
});

socket.on('new_notification', (data) => {
  console.log('Notification:', data.notification);
  showNotification(data.notification);
});

// Emitir eventos
socket.emit('mark_as_read', { notificationId: 'uuid' });
```

---

## Mejores Prácticas

1. **Siempre autenticar** antes de permitir conexiones WebSocket
2. **Usar salas (rooms)** para enviar mensajes dirigidos
3. **Manejar reconexiones** automáticamente en el cliente
4. **Validar eventos del cliente** antes de procesarlos
5. **Limitar rate** de eventos del cliente (anti-spam)
6. **Persistir notificaciones** en DB antes de emitir por WebSocket
7. **Logs detallados** de conexiones/desconexiones para debugging
8. **Monitorear** número de conexiones activas
9. **Graceful shutdown** - desconectar todos los sockets antes de cerrar servidor

---

## Navegación

- **Inicio:** [Backend README](../README.md)
- **Conexiones:** [WebSocket-Conexiones.md](./WebSocket-Conexiones.md)
- **Eventos:** [WebSocket-Eventos.md](./WebSocket-Eventos.md)
- **Seguridad:** [WebSocket-Seguridad.md](./WebSocket-Seguridad.md)

---

**Documentación generada siguiendo RFC-0001**
**Proyecto:** GAMILIT - Plataforma Gamificada de Machine Learning
**Última Actualización:** 2025-11-01
