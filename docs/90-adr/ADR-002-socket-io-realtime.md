---
titulo: "ADR-002: Socket.IO para Interacciones en Tiempo Real"
tipo: adr
fecha_creacion: "2025-08-20"
ultima_actualizacion: "2026-02-27"
estado: aceptada
---

# ADR-002: Socket.IO para Interacciones en Tiempo Real

**Fecha:** 2025-08-20
**Estado:** Aceptada
**Autor:** Equipo GAMILIT

---

## Contexto

GAMILIT requiere comunicacion en tiempo real para varias funcionalidades criticas:
- Actualizaciones instantaneas de leaderboard cuando un estudiante gana XP
- Notificaciones en tiempo real (logros desbloqueados, rango promovido)
- Actualizaciones de progreso para el dashboard del maestro
- Presencia de usuarios (quienes estan conectados)

Se necesita una solucion que sea compatible con NestJS en backend y React en frontend, con soporte para rooms/namespaces para segmentar canales por aula y por tipo de evento.

---

## Decision

Adoptar **Socket.IO 4.8+** como solucion de WebSocket bidireccional para todas las interacciones en tiempo real.

### Implementacion:
- **3 namespaces:** `/gamification`, `/notifications`, `/progress`
- **Rooms por aula:** `classroom:{classroomId}` para leaderboards locales
- **Rooms por usuario:** `user:{userId}` para notificaciones personales
- **Gateway NestJS:** Usando `@WebSocketGateway` decorators
- **Autenticacion:** JWT token validado en middleware de conexion
- **Fallback:** Long polling automatico si WebSocket falla

### Integracion con NestJS:
```typescript
@WebSocketGateway({ namespace: '/gamification' })
export class GamificationGateway {
  // Events: xp-updated, achievement-unlocked, rank-promoted, leaderboard-updated
}
```

### Integracion con React:
```typescript
const socket = io('/gamification', { auth: { token } });
socket.on('xp-updated', handler);
```

---

## Consecuencias

### Positivas
- Experiencia de usuario inmediata (sin polling)
- NestJS tiene soporte nativo excelente para Socket.IO
- Namespaces permiten separacion limpia de concerns
- Rooms permiten broadcasting eficiente por aula
- Reconexion automatica con backoff
- Fallback a long polling (compatibilidad universal)

### Negativas
- Conexiones persistentes consumen memoria en servidor
- Escalamiento horizontal requiere Redis adapter
- Complejidad adicional en testing (tests de WebSocket)
- Debugging mas complejo que REST simple

### Mitigaciones
- Redis adapter para pub/sub en multiples instancias (horizontal scaling)
- Limite de 10,000 conexiones concurrentes por instancia
- Health checks de WebSocket en `/health`
- Logging de eventos para debugging

---

## Alternativas Consideradas

### 1. Server-Sent Events (SSE)
- **Rechazada:** Unidireccional (server -> client only), no soporta rooms/namespaces

### 2. WebSocket nativo (ws library)
- **Rechazada:** Sin rooms, sin reconexion automatica, sin fallback, mas codigo manual

### 3. Polling cada N segundos
- **Rechazada:** Latencia alta (5-30s), desperdicio de recursos, mala UX

### 4. GraphQL Subscriptions
- **Rechazada:** Overhead excesivo para nuestro caso (no usamos GraphQL en el resto)

---

*ADR-002 - Aceptada*
