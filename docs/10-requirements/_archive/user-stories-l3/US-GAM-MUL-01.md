# US-GAM-MUL-01: Modo Multijugador y Duelos

**Sistema:** SIMCO v4.0.0 | **Template:** User Story Level 3 (L3)

**Epica:** EPIC-GAM-BACKEND, EPIC-GAM-FRONTEND
**Modulo(s):** social, leaderboard, gamification
**Story Points:** 13
**Prioridad:** P1
**Sprint:** En progreso

## Descripcion
**Como** estudiante de K-12
**Quiero** competir con otros estudiantes en duelos de comprension lectora y participar en equipos
**Para** motivarme a mejorar mediante competencia amigable y colaboracion

## Criterios de Aceptacion

### CA-1: Matchmaking de Duelos 1v1
**Given** un estudiante que solicita un duelo
**When** el sistema busca oponente
**Then** empareja con un estudiante de rango similar (+/- 1 nivel), ambos reciben notificacion en tiempo real, se genera una sala de duelo con ejercicio compartido, y un temporizador de aceptacion (30 segundos)

### CA-2: Ejecucion de Duelo en Tiempo Real
**Given** dos estudiantes en una sala de duelo activa
**When** ambos responden al ejercicio asignado
**Then** las respuestas se procesan en paralelo via WebSocket, se muestra progreso del oponente en tiempo real (sin revelar respuestas), al finalizar ambos se comparan puntajes, y el ganador recibe XP bonus + ML Coins

### CA-3: Formacion de Equipos
**Given** un estudiante que desea crear o unirse a un equipo
**When** accede a la seccion de equipos
**Then** puede crear equipo (nombre, icono maya, limite 5 miembros), invitar companeros del mismo aula, aceptar invitaciones pendientes, y ver estadisticas del equipo (XP grupal, victorias, racha)

### CA-4: Retos entre Equipos
**Given** dos equipos formados en la misma escuela
**When** un lider de equipo desafia a otro equipo
**Then** se genera un reto grupal con serie de ejercicios, cada miembro contribuye con su puntaje individual, el equipo con mayor puntaje acumulado gana, y todos los miembros del equipo ganador reciben recompensas

### CA-5: Feed de Actividad Social
**Given** un estudiante autenticado en su portal
**When** accede al feed social
**Then** ve actividad reciente de companeros de aula: logros desbloqueados, promociones de rango, resultados de duelos, y puede reaccionar con likes

### CA-6: Estado de Presencia
**Given** estudiantes conectados a la plataforma
**When** el sistema detecta conexion/desconexion
**Then** muestra indicador de presencia (online/offline/en ejercicio/en duelo) de companeros del aula, actualizado en tiempo real via WebSocket

## Notas Tecnicas

| Aspecto | Detalle |
|---------|---------|
| Stack | NestJS 11, React 19, Socket.IO 4.8+, Redis (matchmaking queue) |
| Entidades BD | teams, team_members, social_interactions, social_feed, duels, duel_results |
| Endpoints API | `POST /api/v1/social/duels/request` `POST /api/v1/social/duels/:id/accept` `GET /api/v1/social/duels/:id/status` `POST /api/v1/social/teams` `POST /api/v1/social/teams/:id/invite` `GET /api/v1/social/feed` `GET /api/v1/social/presence` |
| Componentes FE | DuelMatchmaker, DuelArena, DuelResult, TeamCreate, TeamDashboard, SocialFeed, PresenceIndicator, ChallengeCard |
| WebSocket Events | `duel:requested`, `duel:accepted`, `duel:progress`, `duel:completed`, `team:challenge`, `presence:update`, `social:activity` |
| Dependencias | US-GAM-GAM-01 (XP), US-GAM-RT-01 (WebSockets) |

## Definition of Done
- [ ] Matchmaking por rango implementado
- [ ] Duelos 1v1 en tiempo real funcionales
- [ ] Formacion y gestion de equipos
- [ ] Retos entre equipos
- [ ] Feed social con actividad de companeros
- [ ] Indicadores de presencia en tiempo real
- [ ] Tests unitarios (cobertura >= 75%)
- [ ] Inventarios actualizados

## Trazabilidad

| Artefacto | Referencia |
|-----------|------------|
| Requerimiento | RF-GAM-021, RF-GAM-032, RF-GAM-033 |
| Epica padre | EPIC-GAM-BACKEND, EPIC-GAM-FRONTEND |
