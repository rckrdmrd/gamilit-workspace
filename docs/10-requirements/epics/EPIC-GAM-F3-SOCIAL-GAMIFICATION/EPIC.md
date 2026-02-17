# EAI-003-EXT: Gamificacion Social

**Proyecto:** GAMILIT
**Version:** 1.0
**Ultima actualizacion:** 2026-01-20
**Estado:** Backlog

---

## Informacion de la Epica

| Atributo | Valor |
|----------|-------|
| **Codigo** | EAI-003-EXT |
| **Nombre** | Gamificacion Social (Amigos y Gremios) |
| **Fase** | 3 - Extensiones |
| **Prioridad** | P1 |
| **Story Points** | 39 SP |
| **User Stories** | 6 historias |
| **Sprint** | Sprint 9-11 |
| **Estado** | Backlog |
| **Dependencias** | EAI-003 (Gamificacion Base) |

---

## Objetivo

Implementar las mecanicas sociales de gamificacion que complementan el sistema individual:
- Sistema de amigos con leaderboard entre amigos
- Sistema de gremios/grupos con misiones colaborativas
- Multiplicador de ML Coins por rango (documentado en v6.1)

---

## Objetivo de Negocio

- Incrementar engagement mediante competencia social saludable
- Fomentar colaboracion entre estudiantes
- Completar la vision original de gamificacion documentada en v6.1

---

## Modulos Incluidos

### 1. Sistema de Amigos
- Buscar y agregar amigos
- Gestionar solicitudes de amistad
- Lista de amigos con estado

### 2. Leaderboard de Amigos
- Ranking filtrado entre amigos
- Filtros por periodo (semanal, mensual, historico)
- Notificaciones de posicion

### 3. Sistema de Gremios
- Crear y unirse a gremios
- Roles: Lider, Oficial, Miembro
- Gestion de miembros

### 4. Misiones de Gremio
- Misiones diarias y semanales
- Contribucion colaborativa
- Recompensas compartidas

### 5. Multiplicador ML Coins
- Bonus por rango (1.0x - 2.0x)
- Aplicado a todas las recompensas

---

## User Stories

| ID | Historia | Prioridad | SP | Estado |
|----|----------|-----------|-----|--------|
| **[US-GAM-010](./user-stories/US-GAM-010/US-GAM-010-sistema-amigos.md)** | Sistema de Amigos | P1 | 8 | Backlog |
| **[US-GAM-011](./user-stories/US-GAM-011/US-GAM-011-multiplicador-mlcoins.md)** | Multiplicador ML Coins por Rango | P1 | 5 | Backlog |
| **[US-GAM-012](./user-stories/US-GAM-012/US-GAM-012-leaderboard-amigos.md)** | Leaderboard de Amigos | P1 | 5 | Backlog |
| **[US-GAM-013](./user-stories/US-GAM-013/US-GAM-013-sistema-gremios.md)** | Sistema de Gremios | P2 | 8 | Backlog |
| **[US-GAM-014](./user-stories/US-GAM-014/US-GAM-014-misiones-gremio.md)** | Misiones de Gremio | P2 | 8 | Backlog |
| **[US-GAM-015](./user-stories/US-GAM-015/US-GAM-015-gestion-miembros-gremio.md)** | Gestion de Miembros Gremio | P2 | 5 | Backlog |

**Total Story Points:** 39 SP

---

## Implementacion

### Backend

**Modulo:** `social_features` (extension de gamification)

**Entidades:**
- Friendship
- FriendRequest
- Guild
- GuildMember
- GuildJoinRequest
- GuildMission
- GuildMissionContribution

**Endpoints principales:**
- `GET/POST /api/v1/friends` - Gestion de amigos
- `GET/POST /api/v1/friends/requests` - Solicitudes de amistad
- `GET /api/v1/leaderboards/friends` - Leaderboard de amigos
- `GET/POST /api/v1/guilds` - Gestion de gremios
- `GET /api/v1/guilds/:id/missions` - Misiones de gremio
- `GET /api/v1/users/me/multiplier` - Multiplicador actual

---

### Frontend

**Features:** `apps/frontend/src/features/gamification/social/`

**Paginas existentes (con mockData):**
- `FriendsPage.tsx`
- `GuildsPage.tsx`

**Componentes a implementar (20+):**
- FriendCard, FriendsList, FriendSearch
- FriendRequests, AddFriend
- GuildCard, GuildSearchList, CreateGuildModal
- GuildDetailPage, GuildMissionCard
- ContributorsList, MemberManagementList

**Stores existentes (a conectar):**
- `friendsStore`
- `guildsStore`

---

### Base de Datos

**Schema:** `social_features`

**Tablas nuevas:**
- `friendships` - Relaciones de amistad
- `friend_requests` - Solicitudes pendientes
- `guilds` - Gremios
- `guild_members` - Miembros de gremios
- `guild_join_requests` - Solicitudes de union
- `guild_missions` - Misiones de gremio
- `guild_mission_contributions` - Contribuciones

**Funciones:**
- `calculate_rank_multiplier(rank_id)` - Calcula multiplicador
- `generate_daily_guild_missions()` - Genera misiones diarias

---

## Dependencias

### Esta epica depende de:

| Epica/Modulo | Estado | Bloqueante |
|--------------|--------|------------|
| EAI-003 Gamificacion Base | Done | Si |
| EAI-007 M4-M5 | In Progress | No |
| NotificationsService | Done | No |

### Esta epica habilita:

| Epica/Modulo | Razon |
|--------------|-------|
| Torneos | Requiere sistema de amigos |
| Desafios PvP | Requiere sistema de amigos |

---

## Riesgos

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|--------------|---------|------------|
| Cyberbullying | Media | Alto | Reportes, moderacion |
| Spam de solicitudes | Media | Bajo | Rate limiting |
| Gremios inactivos | Alta | Bajo | Cleanup automatico |

---

## Criterios de Aceptacion de la Epica

### Funcionales
- [ ] Multiplicador ML Coins aplica segun rango (1.0x - 2.0x)
- [ ] Sistema de solicitudes de amistad funcional
- [ ] Leaderboard de amigos muestra ranking personalizado
- [ ] Gremios soportan hasta 20 miembros
- [ ] Misiones de gremio otorgan bonus a todos los miembros

### No Funcionales
- [ ] Performance: Leaderboard carga < 2s
- [ ] Seguridad: Privacidad de perfiles respetada
- [ ] Usabilidad: Flujos intuitivos de social

### Tecnicos
- [ ] Cobertura de tests > 70%
- [ ] RLS policies para privacidad
- [ ] Integracion con notificaciones

---

## Estructura de Carpeta

```
EAI-003-EXT-gamificacion-social/
├── README.md                    <- Este archivo
├── _MAP.md                      <- Mapa de navegacion
├── EPICA-EAI-003-EXT.md         <- Documento de epica original
├── requerimientos/
│   ├── _MAP.md
│   ├── RF-SOC-001-sistema-amigos.md
│   └── RF-SOC-002-gremios.md
├── especificaciones/
│   ├── _MAP.md
│   ├── ET-SOC-001-sistema-amigos.md
│   └── ET-SOC-002-gremios.md
├── historias-usuario/
│   ├── US-GAM-010-sistema-amigos.md
│   ├── US-GAM-011-multiplicador-mlcoins.md
│   ├── US-GAM-012-leaderboard-amigos.md
│   ├── US-GAM-013-sistema-gremios.md
│   ├── US-GAM-014-misiones-gremio.md
│   └── US-GAM-015-gestion-miembros-gremio.md
├── tareas/
│   ├── _MAP.md
│   ├── TASK-BE-GAM-002-003-friends-api.md
│   ├── TASK-DB-GAM-003-005-tablas-amigos.md
│   └── TASK-FE-GAM-002-003-friends-ui.md
└── implementacion/
    └── TRACEABILITY.yml
```

---

## Referencias

- **Documento de Diseno:** `docs/00-vision-general/DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md`
- **Backlog:** `docs/04-fase-backlog/FUNCIONALIDADES-GAMIFICACION-PENDIENTES.md`
- **Frontend mockData:** `apps/frontend/src/features/gamification/social/mockData/`
- **[TRACEABILITY](./implementacion/TRACEABILITY.yml)**
- **[_MAP](./_MAP.md)**

---

## Historial

| Fecha | Cambio | Autor |
|-------|--------|-------|
| 2025-12-05 | Creacion de epica | Requirements-Analyst |
| 2026-01-17 | Documentacion completa de 6 USs, renumeracion IDs | Claude-Agent |
| 2026-01-20 | Refactorizacion patron SCRUM (README, _MAP, requirements, specifications, implementacion) | Claude-Agent |

---

**Creada por:** Requirements-Analyst
**Fecha:** 2025-12-05
**Ultima actualizacion:** 2026-01-20
