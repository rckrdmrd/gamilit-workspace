# US-GAM-RT-01: Tiempo Real con WebSockets

**Sistema:** SIMCO v4.0.0 | **Template:** User Story Level 3 (L3)

**Epica:** EPIC-GAM-BACKEND
**Modulo(s):** gamification, leaderboard, notifications, social
**Story Points:** 13
**Prioridad:** P0
**Sprint:** Completado

## Descripcion
**Como** estudiante conectado a la plataforma
**Quiero** recibir actualizaciones en tiempo real de XP, logros, leaderboards y notificaciones
**Para** tener una experiencia inmersiva y dinamica durante mis sesiones de aprendizaje

## Criterios de Aceptacion

### CA-1: Conexion WebSocket Autenticada
**Given** un usuario autenticado en cualquier portal
**When** se establece la conexion WebSocket
**Then** el servidor valida el JWT token, suscribe al usuario a los canales correspondientes (tenant, classroom, personal), mantiene heartbeat para detectar desconexiones, y reconecta automaticamente si la conexion se pierde

### CA-2: Actualizaciones de XP en Tiempo Real
**Given** un estudiante que completa un ejercicio
**When** el sistema calcula y otorga XP
**Then** emite evento `xp:earned` al estudiante con detalle (cantidad, fuente, total acumulado), actualiza la barra de XP en el dashboard sin refresh, y si cruza umbral de rango emite tambien `rank:promoted`

### CA-3: Leaderboard en Tiempo Real
**Given** un cambio en XP de cualquier estudiante del aula
**When** el ranking del aula se recalcula
**Then** emite evento `leaderboard:updated` a todos los estudiantes del aula, la UI actualiza posiciones con animacion suave, y muestra indicador de cambio (subio/bajo posiciones)

### CA-4: Notificaciones Instantaneas
**Given** un evento que genera notificacion (logro, asignacion, mensaje)
**When** el servidor procesa el evento
**Then** emite notificacion in-app via WebSocket al usuario destino, incrementa el contador de notificaciones no leidas, muestra toast con preview de la notificacion, y persiste en base de datos para acceso posterior

### CA-5: Estado de Presencia
**Given** usuarios conectados via WebSocket
**When** el sistema monitorea conexiones
**Then** publica estado de presencia (online, offline, in-exercise, in-duel) a los companeros del aula, el estado se actualiza en < 3 segundos, y se muestra indicador visual junto al nombre/avatar

### CA-6: Escalabilidad de Conexiones
**Given** multiples usuarios conectados simultaneamente
**When** el servidor gestiona conexiones WebSocket
**Then** soporta salas por tenant y classroom para eficiencia, usa Redis adapter para escalamiento horizontal, implementa rate limiting en eventos (max 10 eventos/segundo por usuario), y comprime payload de eventos grandes

## Notas Tecnicas

| Aspecto | Detalle |
|---------|---------|
| Stack | NestJS 11 (WebSocket Gateway), Socket.IO 4.8+, Redis (adapter + pub/sub) |
| Eventos WebSocket | `xp:earned`, `rank:promoted`, `achievement:unlocked`, `leaderboard:updated`, `notification:new`, `presence:update`, `duel:requested`, `duel:progress`, `duel:completed`, `module:unlocked`, `mission:completed`, `streak:updated` |
| Salas (Rooms) | `tenant:{tenantId}`, `classroom:{classroomId}`, `user:{userId}`, `duel:{duelId}` |
| Endpoints API | `GET /api/v1/ws/health` (health check del WebSocket server) |
| Dependencias | Todos los modulos que emiten eventos en tiempo real |

## Definition of Done
- [ ] WebSocket Gateway configurado con autenticacion JWT
- [ ] 12+ tipos de eventos en tiempo real implementados
- [ ] Salas por tenant, classroom y usuario
- [ ] Notificaciones instantaneas via WebSocket
- [ ] Estado de presencia funcional
- [ ] Redis adapter para escalamiento horizontal
- [ ] Rate limiting en eventos WebSocket
- [ ] Reconexion automatica en cliente
- [ ] Tests unitarios (cobertura >= 80%)
- [ ] Inventarios actualizados

## Trazabilidad

| Artefacto | Referencia |
|-----------|------------|
| Requerimiento | RF-GAM-031, RF-GAM-033, RF-GAM-034 |
| Epica padre | EPIC-GAM-BACKEND |
| ADR | ADR-GAM-002 (Socket.IO for real-time) |
