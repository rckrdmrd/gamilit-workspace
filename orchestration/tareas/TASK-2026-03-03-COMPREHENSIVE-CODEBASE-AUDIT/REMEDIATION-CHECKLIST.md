# Remediation Checklist — Post-Audit Action Items
**Fecha:** 2026-03-03 | **Source:** TASK-2026-03-03-COMPREHENSIVE-CODEBASE-AUDIT

Items pendientes para futuras sesiones, organizados por prioridad.

---

## P0 — Features Rotas (Funcionalidad Nula)

- [ ] **2FA OTP delivery** — `auth/services/two-factor-auth.service.ts` lines 102, 193, 320. Tres puntos de envío son stubs. Integrar con MailModule. Bloquea toda la funcionalidad 2FA.
- [ ] **Parents email verification** — `parents/services/parent-auth.service.ts:373`. Body vacío. Integrar con MailModule.
- [ ] **Parents password reset** — `parents/services/parent-auth.service.ts:391`. Retorna void silenciosamente. Generar token + enviar email.
- [ ] **Parents link verification code** — `parents/services/parent-auth.service.ts:272`. Código generado pero nunca enviado.
- [ ] **scheduled-mission.service.ts** — 4 métodos no-op: `findByUserId()`, `findUpcoming()`, `completeMission()`, `updateProgress()`. Aceptan params, no persisten datos.

## P1 — Seguridad

- [ ] **disable2FA password validation** — `auth/controllers/auth.controller.ts:462`. Password param ignorado con underscore prefix.
- [ ] **Parents refreshToken error masking** — `parent-auth.service.ts:423`. Bare catch convierte errores DB en "Token inválido".
- [ ] **cleanupRateLimitCache scheduler** — `achievements.service.ts:176`. Wired to @Cron() or @Interval() para prevenir memory leak.
- [ ] **media-files.service.ts storage leak** — `content/services/media-files.service.ts:103-104`. Delete() borra registro DB pero no archivo físico.
- [ ] **Admin notification bypass** — `notification-multichannel.controller.ts:123,215`. Admin no puede enviar notificaciones por check de ownership.

## P2 — Error Handling (ADR-045 Migration)

- [ ] **educational module** — 58 HTTP exceptions restantes. Priorizar exercises.service.ts (27 throws), media.service.ts (6), exercise-type-rubric.service.ts (7).
- [ ] **progress module** — Crear `progress/errors/progress.errors.ts` (~10 clases). Migrar exercise-submission.service.ts (22 throws).
- [ ] **parents module** — Crear `parents/errors/parents.errors.ts` (~8 clases). Migrar parent-auth.service.ts (16 throws).
- [ ] **gamification module** — 11 domain error classes faltantes identificadas (AchievementNotFoundError, MissionNotFoundError, etc.). 76 HTTP exceptions por migrar.

## P2 — Data Quality / Functional Gaps

- [ ] **StreakIndicator maxStreak always 0** — `features/gamification/components/StreakIndicator.tsx:26`. Wire `useProgression` to expose `maxStreak` from UserStats.
- [ ] **powerupsUsed silently dropped** — `features/mechanics/shared/api/mechanicsAPI.ts:276`. Secondary submission path sends empty array.
- [ ] **user-stats achievements empty array** — `gamification/services/user-stats.service.ts:392`. getUserGamificationSummary returns [] despite data existing.
- [ ] **time_spent always 00:00:00** — `progress/services/module-progress.service.ts:311,369`. Aggregate from learning_sessions.duration_seconds.
- [ ] **current_streak/longest_streak always 0** — `progress/services/module-progress.service.ts:373-374`. Query from user_stats.
- [ ] **Friend request notifications missing** — `social/services/friends.service.ts:276,380`.
- [ ] **skill_mastery achievement condition broken** — `gamification/services/achievements.service.ts:588`. Falls back to perfect_scores >= 10.

## P3 — Architecture / Design Debt

- [ ] **ExerciseSubmissionService decomposition** — 1,962 LOC, 11 deps. Extract reward distribution to event handler.
- [ ] **Exercise type Strategy pattern** — 4 correlated switches across exercises.service.ts (×2), exercise-validator.service.ts, exercise-responses.service.ts.
- [ ] **Achievement condition evaluator** — 20-case switch in achievements.service.ts. Extract to strategy registry.
- [ ] **Comodines switch elimination** — Replace 3 identical switch blocks with static field-map.
- [ ] **React Query vs Zustand unification** — Dual-store ML Coins sync ~80% reliable. WebSocket gaps remain.
- [ ] **Zustand store persistence** — 7/13 stores lack persist middleware. Data lost on refresh for achievements, leaderboards, notifications.
- [ ] **Barrel export completion** — Add index.ts to progress/, social/ modules. Add controllers/index.ts to teacher/.
- [ ] **Social module JSDoc** — ~55% coverage. Bring guilds, teams, user-activities to 80%+.

## P3 — Dead Code Cleanup (Safe Deletes)

- [ ] **7 legacy files** — All in _legacy/, zero references, annotated @deprecated. Safe to delete.
- [ ] **twoFactorAPI.ts** — Zero consumers, annotated. Safe to delete.
- [ ] **schoolsAPI.ts** — Zero consumers, annotated. Safe to delete.
- [ ] **users.types.ts** — Zero imports, annotated. Safe to delete.
- [ ] **battleStore + battles module** — Zero page consumers, annotated.
- [ ] **contentAPI.ts** — Zero direct consumers beyond barrel.
- [ ] **ShopLayout.tsx + Analytics mock components** — Zero page consumers, mock-primary.
- [ ] **SecurityService dead methods** — getAttemptHistory, cleanOldAttempts, getSecurityStats — zero callers.
- [ ] **LeaderboardMetadata entity** — Registered but never injected in any service.

## P3 — Type Deduplication

- [ ] **LeaderboardEntry** — 3 incompatible definitions across social, leaderboard, battles types.
- [ ] **ShopItem** — 2 parallel definitions (economyTypes.ts vs shopAPI.ts) with field name conflicts.
- [ ] **Achievement** — 2 usable types from different sources (social vs shared).
- [ ] **Profile** — 2 parallel definitions (shared vs auth) with null-handling differences.
- [ ] **LeaderboardType** — 3 separate union types serving same concept.

---

## Estadísticas de la Auditoría

| Métrica | Valor |
|---------|-------|
| Subagentes ejecutados | 23 (1 Opus + 12 Sonnet + 10 Haiku) |
| Archivos de código modificados | ~31 |
| Archivos de inventario modificados | 3 |
| Errores de compilación introducidos | 0 |
| TODOs/stale comments removidos | ~15 BE + ~5 FE |
| @deprecated anotaciones añadidas | ~12 |
| @deprecated zero-consumer removidos | 8 |
| Domain error classes creadas | 5 |
| HTTP exceptions migradas | 3 |
| JSDoc métodos añadidos | 9 |
| Items P0 identificados | 5 |
| Items P1 identificados | 5 |
| Items P2 identificados | 11 |
| Items P3 identificados | 21 |

---

*Generado por TASK-2026-03-03-COMPREHENSIVE-CODEBASE-AUDIT*
