# Tareas -- EPIC-GAM-F1-GAMIFICATION

Estado: COMPLETADO | US: 8 | Tareas: 24 | Subtareas: 0

---

## Por US

### US-GAM-001: Sistema de rangos Maya (8 SP)

| Tarea | Horas Est. | Horas Real | Estado |
|-------|------------|------------|--------|
| B.1 Entidades MayaRank, RankHistory + RankService (calcular, updateUserRank, progreso) | 8h | 8h | Done |
| B.2 Endpoints GET /rank, GET /rank/history | - | - | Done |
| F.1 RankDisplay con barra de progreso hacia siguiente rango | 10h | 10h | Done |
| F.2 RankUpModal con confetti y descripcion narrativa | - | - | Done |
| D.1 Iconos SVG para 5 rangos (novato a sabio) | 4h | 4h | Done |
| T.1 Tests unitarios RankService (calculate, detect rankUp, max rank) | 2h | 2h | Done |

### US-GAM-002: Sistema de experiencia XP (7 SP)

| Tarea | Horas Est. | Horas Real | Estado |
|-------|------------|------------|--------|
| B.1 Entidad XPTransaction + XPService (awardXP, getXPHistory) | 8h | 8h | Done |
| B.2 Endpoints GET /xp, GET /xp/history | - | - | Done |
| F.1 XPNotification flotante (+X XP) con auto-dismiss | 8h | 8h | Done |
| F.2 Dashboard muestra XP total y nivel | - | - | Done |
| T.1 Tests unitarios XPService | 4h | 4h | Done |

### US-GAM-003: Monedas lectoras ML Coins (6 SP)

| Tarea | Horas Est. | Horas Real | Estado |
|-------|------------|------------|--------|
| B.1 Entidad CoinTransaction + CoinsService (award, spend, validar saldo) | 6h | 6h | Done |
| B.2 Endpoints GET /coins, POST /coins/spend | - | - | Done |
| F.1 CoinsDisplay en dashboard + notificacion al ganar | 6h | 6h | Done |
| T.1 Tests unitarios CoinsService | 4h | 4h | Done |

### US-GAM-004: Sistema de ayudas (7 SP)

| Tarea | Horas Est. | Horas Real | Estado |
|-------|------------|------------|--------|
| B.1 HelpUsage entity + HelpService (3 tipos, costos fijos, max 1/tipo) | 8h | 8h | Done |
| B.2 Endpoints POST /help/use, GET /help/available | - | - | Done |
| F.1 HelpButtons en actividades (Pista, Eliminar opcion, Tiempo extra) | 8h | 8h | Done |
| F.2 Agregar hints al seed data de actividades | 2h | 2h | Done |
| T.1 Tests unitarios HelpService | 2h | 2h | Done |

### US-GAM-005: Insignias basicas (8 SP)

| Tarea | Horas Est. | Horas Real | Estado |
|-------|------------|------------|--------|
| B.1 Entidades Badge, UserBadge + BadgesService (check, award, gallery) | 8h | 8h | Done |
| B.2 Seed data 10 insignias con criterios | - | - | Done |
| F.1 BadgeGallery (desbloqueadas/bloqueadas) + BadgeUnlockModal | 8h | 8h | Done |
| D.1 Imagenes/iconos para 10 insignias | 6h | 6h | Done |
| T.1 Tests unitarios BadgesService | 2h | 2h | Done |

### US-GAM-006: Narrativa basica (6 SP)

| Tarea | Horas Est. | Horas Real | Estado |
|-------|------------|------------|--------|
| B.1 NarrativeMessage entity + NarrativeService (getMessage, storyProgress) | 4h | 4h | Done |
| B.2 Seed data mensajes narrativos (Ixchel) | 4h | 4h | Done |
| F.1 NarrativeMessage component + StoryProgressPage | 6h | 6h | Done |
| D.1 Diseno personaje guia Ixchel | 2h | 2h | Done |

### US-GAM-007: Leaderboard simple (8 SP)

| Tarea | Horas Est. | Horas Real | Estado |
|-------|------------|------------|--------|
| B.1 LeaderboardService (global top 10, getUserPosition, caching 5min) | 8h | 8h | Done |
| B.2 Endpoints GET /leaderboard, GET /leaderboard/position/:userId | - | - | Done |
| F.1 LeaderboardPage + LeaderboardRow (medallas top 3, highlight usuario) | 12h | 12h | Done |
| F.2 Auto-refresh cada 30s | 2h | 2h | Done |
| T.1 Tests unitarios LeaderboardService (top 10, ties, position) | 2h | 2h | Done |

### US-GAM-008: Recompensas por completar modulos (5 SP)

| Tarea | Horas Est. | Horas Real | Estado |
|-------|------------|------------|--------|
| B.1 ModulesService.completeModule (XP + coins + badge + anti-duplicado) | 6h | 6h | Done |
| B.2 Endpoints POST /modules/:id/complete, GET /modules/completed | - | - | Done |
| F.1 ModuleCompletionModal (recompensas + mensaje Ixchel) | 4h | 4h | Done |
| F.2 CompletedModulesSection en dashboard | 2h | 2h | Done |
| T.1 Tests unitarios ModulesService completion | 2h | 2h | Done |

---

## Resumen

| Area | Horas Est. | Horas Real |
|------|------------|------------|
| Backend | 56h | 56h |
| Frontend | 54h | 54h |
| Diseno | 12h | 12h |
| Testing | 18h | 18h |
| **Total** | **140h** | **140h** |

| Metrica | Valor |
|---------|-------|
| Total SP | 55 |
| Presupuesto | $20,100 MXN |
| Sprint | Sprint-1 (Mes 1) |
