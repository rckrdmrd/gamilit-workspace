# US-NOT-001a: Infraestructura WebSocket y Sistema de Entrega en Tiempo Real

**Épica:** EXT-003 - Sistema de Notificaciones
**Sprint:** Mes 3, Semana 1-2
**Story Points:** 10 SP
**Presupuesto:** $13,160 MXN
**Prioridad:** Alta (Extensión Fase 3)
**Estado:** 📋 Planificada
**Relación:** Parte de US-NOT-001 (dividida en a/b/c por PF-001)

---

## Descripción

**Como** desarrollador del sistema
**Quiero** implementar la infraestructura completa de WebSocket con Socket.IO, Redis adapter, autenticación JWT y sistema de entrega de notificaciones
**Para** permitir comunicación en tiempo real confiable, escalable y segura entre el servidor y los clientes

**Contexto:** Esta user story es parte del sistema completo de notificaciones (EXT-003), dividida para cumplir con PF-001. Esta parte implementa la **infraestructura técnica** base para comunicación en tiempo real.

**Alcance:**
- WebSocket server con Socket.IO en puerto dedicado (3001)
- Autenticación JWT para conexiones WebSocket
- Redis adapter para horizontal scaling (multi-instance)
- Sistema de rooms por usuario (`user:${userId}`)
- Heartbeat y reconnection automática
- Sistema de prioridades de notificaciones (P0-P3)
- Rate limiting y anti-spam
- Persistencia y sincronización de notificaciones offline
- Analytics y monitoring de métricas críticas
- Seguridad y encriptación de comunicación

---

## Valor de Negocio

- **WebSocket Latency**: <500ms entrega de notificaciones (SLA)
- **Delivery Rate**: >99% notificaciones entregadas exitosamente
- **WebSocket Uptime**: >99.9% disponibilidad de servicio
- **Scalability**: Soporte para 10,000+ conexiones concurrentes
- Infraestructura reutilizable para features futuras (chat, live updates)

---

## Criterios de Aceptación

### CA-01: Infraestructura WebSocket con Socket.IO
**Dado** que se requiere comunicación en tiempo real
**Cuando** un usuario se conecta a la plataforma
**Entonces** debe establecerse conexión WebSocket:

**Configuración del Servidor**:
- Socket.IO server en puerto 3001 (separado de API REST en 3000)
- Autenticación vía JWT token en handshake
- Rooms por usuario: `user:${userId}` para envío directo
- Reconnection automática con backoff exponencial (1s → 5s)
- Heartbeat cada 25 segundos para mantener conexión activa
- Redis adapter para horizontal scaling (múltiples servidores)
- Compression habilitada para reducir bandwidth (gzip)
- CORS configurado correctamente para dominio frontend
- Soporte de fallback a long polling si WebSocket no disponible
- Graceful shutdown en deploy (desconectar clientes con warning)

**Validación**:
- Usuario autenticado se conecta y se une a room `user:123`
- Notificación enviada a `user:123` llega solo a ese usuario
- Redis distribuye mensajes a todas las instancias del servidor
- Reconexión automática funciona tras pérdida de conexión

### CA-02: Sistema de Prioridades
**Dado** que existen múltiples notificaciones con diferentes urgencias
**Cuando** el sistema decide orden de entrega
**Entonces** debe priorizar según:

**Niveles de Prioridad**:
1. **Crítico (P0)**: Sistema en mantenimiento, errores de seguridad
2. **Alto (P1)**: Solicitudes de amistad, invitaciones de gremio
3. **Medio (P2)**: Logros raros/épicos, desafíos de gremio
4. **Bajo (P3)**: Logros comunes, actividades de amigos

**Comportamiento**:
- P0/P1: Envío inmediato, bypass de rate limiting
- P2: Envío inmediato, toast normal
- P3: Batch cada 5 minutos (agrupar para reducir ruido)
- Agrupación: Si >10 del mismo tipo en 1 minuto → consolidar

**Validación**:
- Notificación P0 entregada antes que P3 aunque P3 llegó primero
- Notificaciones P3 agrupadas en batches de 5 minutos

### CA-03: Rate Limiting y Anti-Spam
**Dado** que se previene spam de notificaciones
**Cuando** el sistema genera notificaciones
**Entonces** debe aplicar límites:

**Límites Globales por Usuario**:
- Máximo 50 notificaciones/usuario/hora
- Máximo 200 notificaciones/usuario/día
- Deduplicación: No enviar 2x la misma notificación en 5 minutos
- Agrupación automática: Consolidar notificaciones similares

**Límites por Tipo**:
- `friend:request`: Max 10 solicitudes/hora
- `guild:*`: Max 20 notificaciones/gremio/hora
- `system:*`: Sin límite (alta prioridad)
- `achievement:unlocked`: Max 30/hora

**Comportamiento al Exceder Límites**:
- Notificaciones adicionales puestas en cola
- Log de notificaciones suprimidas
- Alert a admins si usuario excede límites consistentemente

**Implementación**:
- Redis para rate limiting (counter con TTL)
- Sliding window algorithm
- Cache de deduplicación (hash de contenido)

**Validación**:
- Usuario que excede 50 notif/hora → siguientes en cola
- Duplicado en 5 minutos → bloqueado

### CA-04: Persistencia y Sincronización
**Dado** que un usuario puede estar offline
**Cuando** se reconecta a la plataforma
**Entonces** debe sincronizar notificaciones:

**Sincronización al Reconectar**:
- Cargar notificaciones no leídas desde última conexión (max 50)
- Actualizar contador de badge inmediatamente
- Mostrar notificaciones importantes (P0/P1) como toasts
- Marcar notificaciones >7 días como vistas automáticamente

**Persistencia**:
- Notificaciones guardadas en PostgreSQL (tabla `notifications`)
- Retención de 30 días (auto-eliminadas vía cron job)
- Índices en `user_id + read` para queries rápidas

**Validación**:
- Usuario offline recibe 10 notificaciones → al reconectar, las ve todas
- Badge muestra número correcto tras reconexión

### CA-05: Analytics y Monitoring
**Dado** que se monitorea el sistema
**Cuando** se recolectan métricas en tiempo real
**Entonces** debe trackear:

**Métricas de Performance**:
- Latencia de entrega: P50, P95, P99 (objetivo: P95 <500ms)
- Tasa de entrega exitosa: % (objetivo: >99%)
- Conexiones WebSocket activas
- Tasa de desconexión/reconexión (objetivo: <2%)
- Throughput: Notificaciones procesadas por segundo
- Queue depth: Tamaño de cola pendientes
- Redis latency

**Alertas Críticas**:
- Latencia >1s por más de 5 minutos
- Tasa de error >1%
- WebSocket server caído
- Redis adapter desconectado
- Queue depth >1000

**Herramientas**: Sentry (errors), DataDog/Prometheus (métricas)

### CA-06: Seguridad y Privacidad
**Dado** que se manejan notificaciones sensibles
**Cuando** el sistema procesa y entrega notificaciones
**Entonces** debe garantizar seguridad:

**Seguridad**:
- Autenticación JWT obligatoria en handshake
- Encriptación TLS/SSL en tránsito (wss://)
- Validación de permisos antes de enviar notificación
- Usuario solo puede conectarse a su propia room
- Sanitización de contenido (prevenir XSS)

**Privacidad (GDPR/CCPA)**:
- Usuarios solo reciben sus propias notificaciones
- Respeto de preferencias de privacidad
- Right to delete: Usuario puede borrar todas sus notificaciones
- Logs anonimizados para analytics

**Validación**:
- Token JWT inválido → conexión rechazada
- Contenido con script XSS → sanitizado

---

## Especificaciones Técnicas

### Backend - WebSocket Server

**Tecnologías**: Socket.IO 4.x, Redis 7.x, ioredis, PostgreSQL 15

**Setup Principal** (`server/websocket/notificationServer.ts`):

```typescript
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';

const io = new Server(3001, {
  cors: { origin: process.env.FRONTEND_URL },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

// Redis adapter for horizontal scaling
const pubClient = new Redis(process.env.REDIS_URL);
const subClient = pubClient.duplicate();
io.adapter(createAdapter(pubClient, subClient));

// Authentication middleware
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  try {
    const user = await verifyJWT(token);
    socket.userId = user.id;
    socket.join(`user:${user.id}`);
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
});

// Connection handler
io.on('connection', async (socket) => {
  const unreadNotifications = await NotificationService.getUnread(socket.userId);
  socket.emit('notifications:sync', unreadNotifications);

  socket.on('disconnect', (reason) => {
    console.log(`User ${socket.userId} disconnected: ${reason}`);
  });
});

// Emit notification to user
export function emitNotification(userId: string, notification: Notification) {
  io.to(`user:${userId}`).emit(notification.type, notification);
}
```

**NotificationService** (resumen):

```typescript
export class NotificationService {
  static async send(userId: string, notification: NotificationPayload) {
    // Check rate limit
    if (!await rateLimiter.check(userId, notification.type)) return null;

    // Check duplicates
    if (await this.checkDuplicate(userId, notification)) return null;

    // Persist to database
    const saved = await db.notifications.create({ userId, ...notification });

    // Add to priority queue
    priorityQueue.add(notification.priority, () => {
      emitNotification(userId, saved);
    });

    return saved;
  }

  static async getUnread(userId: string, limit = 50) {
    return db.notifications.findMany({
      where: { userId, read: false },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }
}
```

### Database Schema

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  priority VARCHAR(10) CHECK (priority IN ('critical', 'high', 'medium', 'low')) DEFAULT 'medium',
  title VARCHAR(100) NOT NULL,
  message TEXT,
  data JSONB,
  action_url VARCHAR(255),
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read) WHERE read = false;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);
```

### API Endpoints

```typescript
GET    /api/notifications                // Get user's notifications (paginated)
GET    /api/notifications/unread/count   // Get unread count
PUT    /api/notifications/:id/read       // Mark as read
PUT    /api/notifications/read-all       // Mark all as read
DELETE /api/notifications/:id            // Delete notification
```

---

## Dependencias

**Requiere:**
- Infraestructura de autenticación JWT (AUTH-001)
- Base de datos PostgreSQL configurada
- Redis configurado para producción

**Relacionada:**
- **US-NOT-001b**: Centro de Notificaciones - consume esta infraestructura
- **US-NOT-001c**: Preferencias - usa rate limiting

**Bloquea:**
- Cualquier feature que necesite notificaciones en tiempo real

---

## Definición de Hecho (DoD)

### Desarrollo
- [x] WebSocket server (Socket.IO) implementado en puerto 3001
- [x] Redis adapter configurado con 2+ instancias
- [x] Autenticación JWT en handshake
- [x] Sistema de prioridades (P0-P3) implementado
- [x] Rate limiting con Redis funcional
- [x] Persistencia en PostgreSQL con índices
- [x] Cron job de limpieza de notificaciones expiradas
- [x] API REST endpoints implementados

### Testing
- [x] Tests unitarios: WebSocket server, Rate limiter, Priority queue
- [x] Tests de integración: Redis adapter (multi-instance)
- [x] Load testing: 1000+ conexiones WebSocket concurrentes
- [x] Tests de latency (verificar <500ms P95)
- [x] Tests de seguridad: JWT inválido rechazado, XSS sanitización

### Monitoreo
- [x] Sentry configurado para error tracking
- [x] DataDog/Prometheus métricas expuestas
- [x] Alertas configuradas (latencia, errors, uptime)
- [x] Dashboard con métricas en tiempo real

### Documentación
- [x] API docs (REST endpoints)
- [x] WebSocket events documentation
- [x] Guía de deployment (Redis, multi-instance)

---

## Estimación

- **Backend - WebSocket Server:** 24 horas
- **Backend - Rate Limiting & Priority:** 12 horas
- **Backend - Persistencia & Sync:** 8 horas
- **Backend - Security & Auth:** 8 horas
- **Testing (Unit + Integration + Load):** 16 horas
- **Monitoring & Alertas:** 8 horas
- **Documentación:** 4 horas

**Total:** 80 horas (**10 SP** @ 8h/SP)

---

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| WebSocket no escala con miles de usuarios | Media | Alto | Redis adapter, horizontal scaling, load testing |
| Alta latencia en notificaciones (>500ms) | Baja | Alto | Monitoring estricto, Redis en mismo datacenter |
| Desconexiones frecuentes | Media | Medio | Reconnection automática con backoff exponencial |
| Redis adapter failure | Baja | Alto | Fallback a single-server mode, auto-restart |

---

## Notas

- ✅ Archivo modularizado desde US-NOT-001-FULL.md (2025-11-02)
- ✅ Cumple PF-001 (<400L)
- ✅ Esta es la parte más compleja (10 SP de 19 SP total)
- ✅ Implementar primero esta infraestructura antes que US-NOT-001b/c
- ⚠️ Requiere Redis en producción (costo adicional de infraestructura)
- 🔒 Priorizar seguridad: JWT obligatorio, TLS/SSL, sanitización

---

## Stack Tecnológico

**Backend:** Socket.IO 4.x, Redis 7.x, ioredis, PostgreSQL 15, pg-cron
**Monitoring:** Sentry, DataDog/Prometheus, PagerDuty
**Testing:** Jest, Socket.IO Client, Artillery (load testing)

---

**Tags:** #websocket #socket-io #redis #real-time #infrastructure #backend #ext-003 #fase3
