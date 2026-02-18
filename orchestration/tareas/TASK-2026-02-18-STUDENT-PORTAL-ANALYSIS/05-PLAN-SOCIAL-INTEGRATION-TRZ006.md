# TRZ-006: Plan de Integracion Frontend para Endpoints Sociales

**Version:** 2.0.0
**Fecha:** 2026-02-18
**Estado:** PLAN (pendiente de ejecucion)
**Fuente:** Auditoria detallada de 14 controladores sociales (agent a95ce6a)

---

## Resumen

**63 endpoints** del backend social tienen **zero o minima integracion frontend**. Estos endpoints estan completamente implementados en backend (entities, services, controllers, DTOs, RLS policies) pero no tienen UI.

**Hallazgo critico:** Existe un **problema de dual-controller** que requiere decision arquitectonica antes de integrar:
- `TeamsController` (`/social/teams`) vs `GuildsController` (`/guilds`) — el frontend usa Teams, el backend tiene ambos
- `FriendshipsController` (`/social/...`) vs `FriendsController` (`/friends`) — el frontend usa ambos via diferentes stores

---

## Inventario Completo de Endpoints Unwired

### Grupo 1: Completamente Unwired (0 llamadas frontend)

| Controlador | Ruta Base | Endpoints | Estado |
|-------------|-----------|-----------|--------|
| `PeerChallengesController` | `/social/peer-challenges` | 14 | Zero FE calls |
| `ChallengeParticipantsController` | `/social/challenge-participants` | 15 | Zero FE calls |
| `TeamChallengesController` | `/social/team-challenges` | 8 de 9 | 1 read-only wired (guildsStore) |
| `UserFollowsController` | `/social/follows` | 7 | Zero FE calls (marcado EXT-010) |
| `GuildsController` | `/guilds` | 14 | Zero FE calls (frontend usa TeamsController) |
| **Subtotal** | | **58** | |

### Grupo 2: Parcialmente Wired (algunos endpoints sin FE)

| Controlador | Unwired | Total | Detalle |
|-------------|---------|-------|---------|
| `UserActivitiesController` | 4 | 5 | Solo GET feed wired (friendsAPI) |
| `TeamsController` | 3 | 13 | updateTeam, deleteTeam, updateTeamScore no llamados |
| `TeamMembersController` | 6 | 9 | transfer-ownership, bulk ops sin FE |
| `FriendshipsController` | 1 | 11 | checkFriendshipStatus sin FE |
| **Subtotal** | **14** | | |

### Grupo 3: Admin-Only (no requieren Student Portal UI)

| Controlador | Endpoints | Nota |
|-------------|-----------|------|
| `SchoolsController` | 7 | social-admin tag |
| `ClassroomMembersController` | N/A | Teacher Portal |
| `ClassroomsController` | N/A | Teacher Portal |

**Total student-facing unwired: ~63 endpoints (~7% de 904 totales)**

---

## Decision Arquitectonica Requerida (Pre-requisito)

Antes de implementar, resolver el problema de dual-controller:

| Dominio | Opcion A: Consolidar en controller existente usado por FE | Opcion B: Migrar FE al controller mas completo |
|---------|----------------------------------------------------------|------------------------------------------------|
| **Guilds/Teams** | Mantener `TeamsController` (ya wired), deprecar `GuildsController` | Migrar FE a `GuildsController` (tiene join-request workflow) |
| **Friends** | Mantener `FriendshipsController` (mas endpoints), deprecar `FriendsController` | Unificar ambos en uno |

**Recomendacion:** Opcion A para ambos — menor esfuerzo, menor riesgo de regresion.

---

## Plan de Implementacion por Prioridad

### P1-HIGH: Core Gameplay Loop (5-6 dias)

#### 1a. Peer Challenges — Browse + Create + Participate (EFFORT: L)

**API:**
```
features/gamification/social/api/
  peerChallenges.api.ts        # 14 endpoints CRUD + start/complete/cancel
  challengeParticipants.api.ts # 15 endpoints join/score/forfeit/rewards
```

**Types:**
```
features/gamification/social/types/
  challenges.types.ts          # PeerChallenge, ChallengeParticipant, ChallengeStatus, etc.
```

**Hooks:**
```
features/gamification/social/hooks/
  usePeerChallenges.ts         # React Query: list open/active, create, manage
  useChallengeParticipants.ts  # React Query: join, accept, score, forfeit
```

**Pages + Components:**
```
apps/student/pages/
  PeerChallengesPage.tsx       # Thin Shell: tabs Open/Active/Completed

apps/student/components/challenges/
  ChallengeCard.tsx            # Card reutilizable
  ChallengeInviteModal.tsx     # Modal invitar amigo
  ChallengeResultsView.tsx     # Vista resultados + rankings
  PeerChallengesList.tsx       # Lista filtrable
  ChallengeParticipantCard.tsx # Participante con score/status
```

#### 1b. User Follows (EFFORT: M)

**API:** `followsAPI.ts` (7 endpoints: follow/unfollow/followers/following/mutual/counts)
**Hook:** `useFollows.ts` (React Query)
**UI:** Integrate into existing FriendsPage and EnhancedProfilePage (follow button, follower counts)

### P2-MEDIUM: Enhanced Social (3-4 dias)

#### 2a. Team Challenges Mutations (EFFORT: S)
Wire remaining 8 endpoints in existing `teamsAPI.ts` + guildsStore. Add create/complete/fail UI to GuildsPage challenges tab.

#### 2b. Activity Feed — Create + History (EFFORT: S)
Wire 3 missing endpoints in `friendsAPI.ts`. Add "My Activity" tab to profile or dashboard.

#### 2c. Guild Join Request Flow (EFFORT: M)
Wire join-request endpoints. Decision needed: use GuildsController or add to TeamsController.

### P3-LOW: Secondary Features (2-3 dias)

- Challenge admin actions (disqualify, distribute rewards)
- GuildsController member management (if not deprecated)
- Teams advanced features (updateScore, addXP, leaderboard)

---

## Estimacion Total

| Fase | Esfuerzo |
|------|----------|
| Decision arquitectonica (dual-controller) | 0.5 dias |
| P1-HIGH: Peer Challenges + Follows | 5-6 dias |
| P2-MEDIUM: Team Challenges + Feed + Guilds | 3-4 dias |
| P3-LOW: Admin + secondary | 2-3 dias |
| Tests basicos | 1.5 dias |
| **Total** | **~12-15 dias** |

---

## Dependencias

- **Pre-requisito:** Decision arquitectonica dual-controller (Guilds vs Teams, Friends vs Friendships)
- Backend ya implementado (0 cambios requeridos salvo posible deprecacion)
- RLS policies ya existen para todas las tablas
- DTOs y Response types documentados en Swagger

## Criterios de Aceptacion

- [ ] Decision dual-controller documentada en ADR
- [ ] P1-HIGH: Los 36 endpoints (peer challenges + participants + follows) tienen llamadas API
- [ ] Hooks siguen patron React Query (no useState para server state)
- [ ] Paginas siguen Thin Shell pattern (<100 lineas)
- [ ] Componentes tipados con interfaces (no `any`)
- [ ] Rutas protegidas con guards de autenticacion
- [ ] FRONTEND_INVENTORY.yml actualizado con nuevos archivos
- [ ] `npm run build` y `npm run typecheck` pasan sin errores nuevos
