# Especificaciones Tecnicas - EAI-003-EXT

**EPIC:** EAI-003-EXT - Gamificacion Social
**Ultima actualizacion:** 2026-01-20

---

## Resumen

Especificaciones tecnicas formales para el sistema de gamificacion social.

---

## Indice de Especificaciones

| ID | Titulo | RF Relacionado | Estado |
|----|--------|----------------|--------|
| **[ET-SOC-001](./ET-SOC-001-sistema-amigos.md)** | Diseno Tecnico Sistema Amigos | RF-SOC-001 | Especificado |
| **[ET-SOC-002](./ET-SOC-002-gremios.md)** | Diseno Tecnico Sistema Gremios | RF-SOC-002 | Especificado |

---

## Descripcion de Especificaciones

### ET-SOC-001: Diseno Tecnico Sistema Amigos

**Proposito:** Documentar el diseno tecnico del sistema de amigos, leaderboard de amigos y multiplicador de ML Coins.

**Incluye:**
- Arquitectura de servicios
- Diseno de APIs
- Modelo de datos detallado
- Estrategia de cache para leaderboard
- Calculo de multiplicador

**Afecta a:**
- Backend: FriendsModule, LeaderboardModule
- Frontend: FriendsPage, LeaderboardPage
- Database: friendships, friend_requests

---

### ET-SOC-002: Diseno Tecnico Sistema Gremios

**Proposito:** Documentar el diseno tecnico del sistema de gremios, misiones colaborativas y sistema de recompensas.

**Incluye:**
- Arquitectura de servicios
- Diseno de APIs
- Modelo de datos detallado
- Sistema de roles y permisos
- Generacion de misiones (CRON)
- Calculo de recompensas

**Afecta a:**
- Backend: GuildsModule, GuildMissionsModule
- Frontend: GuildsPage, GuildDetailPage
- Database: guilds, guild_members, guild_missions

---

## Especificaciones Pendientes

| ID | Titulo | Prioridad | Estado |
|----|--------|-----------|--------|
| - | Sin especificaciones pendientes | - | - |

**Nota:** Todas las especificaciones de esta epica estan documentadas.

---

**Generado:** 2026-01-20
**Sistema:** SIMCO (Sistema Indexado Modular por Contexto)
