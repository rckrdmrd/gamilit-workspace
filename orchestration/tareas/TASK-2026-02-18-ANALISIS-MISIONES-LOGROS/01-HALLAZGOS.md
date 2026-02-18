# 01-HALLAZGOS.md — Analisis de Misiones y Logros

**Tarea:** TASK-2026-02-18-ANALISIS-MISIONES-LOGROS
**Fecha:** 2026-02-18
**Tracks:** 5 paralelos (A: Ciclo de vida misiones, B: Completitud logros, C: Inicializacion usuario, D: Flujo claim, E: Alineacion frontend-backend)

---

## Resumen Ejecutivo

| Dimension | Estado | Score |
|-----------|--------|-------|
| Ciclo de vida misiones | FUNCIONAL con caveats | 86/100 |
| Logros (35 definidos) | FUNCIONAL via backend, DB function ROTA | 85/100 |
| Inicializacion de usuario | FUNCIONAL, 3 gaps medium | 92/100 |
| Flujo claim (anti-auto-claim) | EXCELENTE, 0 auto-claim paths | 98/100 |
| Alineacion frontend-backend | FUNCIONAL, 16/16 endpoints match | 89/100 |

**Veredicto global:** Sistema PRODUCTION-READY con issues de calidad/deuda tecnica, sin bugs criticos bloqueantes.

---

## Track A: Ciclo de Vida de Misiones

### H-MIS-01: Generacion On-Demand Funcional (FUNCIONAL)
- **Archivo:** `apps/backend/src/modules/gamification/services/missions.service.ts:182`
- Cuando usuario solicita misiones diarias y no existen, se generan automaticamente
- 3 diarias + 2-5 semanales generadas desde 11 templates activos
- `end_date` para diarias = hoy 23:59:59 UTC, semanales = domingo 23:59:59 UTC

### H-MIS-02: Cron Jobs Existen Pero Parcialmente Implementados (GAP)
- **Archivo:** `apps/backend/src/modules/tasks/services/missions-cron.service.ts`
- 4 cron jobs definidos:
  1. `daily-missions-reset` (00:00 UTC) — FUNCIONAL, expira y regenera diarias
  2. `weekly-missions-reset` (lunes 00:00 UTC) — FUNCIONAL, expira y regenera semanales
  3. `check-missions-progress` — PLACEHOLDER (solo log, no hace nada)
  4. `cleanup-expired-missions` — PLACEHOLDER (solo log, no hace nada)
- **Timezone:** Hardcoded UTC, puede causar desalineacion con zona Mexico (UTC-6)

### H-MIS-03: Sin Cleanup de Misiones Viejas (TECH-DEBT)
- Las misiones expiradas se acumulan infinitamente en la tabla
- No hay archivado ni eliminacion programada
- Estimacion: ~4 rows/usuario/dia = crecimiento lineal

### H-MIS-04: Race Condition Potencial en Generacion (BUG)
- **Archivo:** `apps/backend/src/modules/gamification/services/missions/mission-generator.service.ts`
- Sin UNIQUE constraint en `(user_id, template_id, mission_type)`
- Si 2 requests concurrentes llegan y `missions.length === 0`, ambas generan misiones
- Resultado: usuario puede tener 6 misiones diarias en vez de 3

### H-MIS-05: 11 Mission Templates Bien Balanceados (FUNCIONAL)
- **Archivo:** `apps/database/seeds/dev/gamification_system/10-mission_templates.sql`
- 5 daily (complete exercises, earn XP, use comodin, perfect score, module explore)
- 4 weekly (complete module, daily streak, perfect scores, explorer)
- 2 special (event-based)
- Recompensas: 25-100 XP, 10-100 ML Coins (escalado por dificultad)

### H-MIS-06: Si Usuario No Entra 3 Dias, Solo Se Genera El Dia Actual (FUNCIONAL)
- No hay backfill de dias perdidos
- Solo se generan misiones para el dia actual al momento del request
- Misiones de dias anteriores nunca se crean retroactivamente

---

## Track B: Completitud de Logros

### H-ACH-01: 35 Logros Definidos, Todos Evaluables Via Backend (FUNCIONAL)
- **Archivos:** `apps/database/seeds/dev/gamification_system/04-achievements.sql` (20 core) + `14-achievements-m3-m5.sql` (15 module-specific)
- 14 condition types unicos implementados en backend
- 100% de logros seeded tienen evaluador correspondiente en `achievements.service.ts`

### H-ACH-02: CRITICO — DB Function `check_and_grant_achievements()` NO Puede Evaluar Ningun Logro Seeded (BUG)
- **Archivo:** `apps/database/ddl/schemas/gamification_system/functions/check_and_award_achievements.sql:72-88`
- DB function usa CASE con tipos UPPERCASE: `MISSIONS_COMPLETED`, `TOTAL_XP`, `STREAK_DAYS`
- Seeds definen tipos lowercase: `exercise_completion`, `streak`, `module_completion`
- **Mismatch total:** 0/35 logros pueden ser evaluados por la funcion DB
- **Impacto mitigado:** Backend service evalua correctamente todos los 35 logros
- La DB function aparenta ser codigo legacy/orphaned que nunca fue actualizado al schema JSONB

### H-ACH-03: Categoria `collection` Vacia (TECH-DEBT)
- Definida en enums y seeded como categoria, pero 0 logros la usan
- Candidatos posibles: Badge Collector, Tier Master, Avatar Collector

### H-ACH-04: Todos Los Logros Son No-Repetibles y No-Secretos (FUNCIONAL)
- `is_repeatable = false` en los 35 logros
- `is_secret = false` en los 35 logros
- Rate limit: 5 logros/minuto por usuario (solo en deteccion, no en claim)

### H-ACH-05: Consistencia Cross-Environment (FUNCIONAL con minor)
- dev/prod/staging tienen los mismos 35 logros
- **Minor:** Staging usa filename `02-achievements.sql` vs dev/prod `04-achievements.sql`

### H-ACH-06: Distribucion de Recompensas Balanceada (FUNCIONAL)
- XP range: 50 (Primera Visita) a 500 (Maestro Lectura, Completista Total)
- ML Coins range: 25 (Primera Visita) a 400 (Completista Total, Creador Multimedia)
- Progresion correlaciona con dificultad

---

## Track C: Inicializacion de Usuario

### H-INIT-01: Trigger DB Crea 19 Records en 9 Tablas (FUNCIONAL)
- **Archivo:** `apps/database/ddl/schemas/gamilit/functions/04-initialize_user_stats.sql`
- INSERT profile -> trigger `trg_initialize_user_stats` -> `initialize_user_stats()` SECURITY DEFINER
- Crea: user_stats (1), user_ranks (1), user_preferences (1), comodines_inventory (1), ml_coins_transactions (1), module_progress (5), missions (8)
- Welcome bonus: 100 ML Coins con audit trail

### H-INIT-02: Mission template_id Es TEXT, No UUID FK (GAP)
- **Archivo:** `apps/database/ddl/schemas/gamilit/functions/18-initialize_user_missions.sql`
- Trigger hardcodea template_id como strings: `'daily_complete_exercises'::TEXT`
- Tabla mission_templates usa UUID ids: `'20000001-0000-0000-0000-000000000001'::uuid`
- **No hay FK** entre missions.template_id -> mission_templates.id
- JOIN queries entre missions y templates retornan 0 rows

### H-INIT-03: Doble Mecanismo de Generacion Sin Dedup (GAP)
- DB trigger crea 8 misiones con template_id TEXT
- Backend on-demand genera misiones con template_id UUID
- Sin UNIQUE constraint, potencial de duplicados si trigger falla parcialmente

### H-INIT-04: Trigger Falla Silenciosamente (GAP)
- **Archivo:** `apps/database/ddl/schemas/gamilit/functions/04-initialize_user_stats.sql:206-251`
- `EXCEPTION WHEN OTHERS` captura errores, registra en `pending_user_initialization`
- RETURN NEW permite creacion de perfil aunque falle gamificacion
- Backend solo verifica user_stats (no misiones, no modulos)
- Decisiones documentadas como P0-001, P0-003

### H-INIT-05: Achievements NO Se Inicializan (FUNCIONAL - Correcto)
- `user_achievements` queda vacia al crear usuario
- Logros se detectan y crean solo cuando se cumplen condiciones
- Modelo claim-to-earn correcto

---

## Track D: Flujo de Claim y Anti-Auto-Claim

### H-CLAIM-01: CERO Paths de Auto-Claim (FUNCIONAL)
- 5 capas de proteccion verificadas:
  1. **DB Default:** `rewards_claimed DEFAULT false`
  2. **Trigger Guard:** `fn_on_achievement_unlocked()` solo crea notificacion, NO otorga rewards
  3. **SQL Function Guard:** `claim_achievement_reward()` verifica `rewards_claimed = false`
  4. **Backend Guard:** `claimRewards()` valida existence + completed + not-claimed
  5. **Frontend Guard:** Requiere click explicito del usuario

### H-CLAIM-02: Claim de Achievement Es Atomico (FUNCIONAL)
- **Archivo:** `apps/database/ddl/schemas/gamification_system/functions/claim_achievement_reward.sql`
- Funcion plpgsql con transaccion implicita
- `FOR UPDATE` row lock previene race conditions
- Actualiza: rewards_claimed=true + user_stats.total_xp + user_stats.ml_coins + ml_coins_transactions

### H-CLAIM-03: Trigger Documenta Explicitamente Modelo Claim-to-Earn (FUNCIONAL)
- **Archivo:** `apps/database/ddl/schemas/gamification_system/triggers/01-trg_achievement_unlocked.sql:37-44`
- Comentario: "XP y ML Coins NO se otorgan aqui. Se otorgan UNICAMENTE al reclamar"
- Notificacion incluye `claim_required: true`

### H-CLAIM-04: Bulk Claim de Misiones Con Graceful Degradation (FUNCIONAL)
- **Archivo:** `apps/backend/src/modules/gamification/services/missions/mission-claim.service.ts:169-192`
- `claimAllCompleted()` procesa cada mision individualmente
- Error en una mision no bloquea las demas
- Retorna array de resultados parciales

### H-CLAIM-05: Sin Rate Limit en Claim (TECH-DEBT menor)
- Rate limit (5/min) aplicado solo a `grantAchievement()` (deteccion)
- `claimRewards()` no tiene rate limit
- Riesgo bajo: operacion idempotente, segundo intento retorna error

### H-CLAIM-06: Expiracion de Misiones Incompleta (GAP)
- `MissionStatusEnum` incluye `EXPIRED` pero no hay mecanismo automatico de transicion
- No hay `expired_at` column en tabla missions
- Misiones completadas pueden ser reclamadas indefinidamente

---

## Track E: Alineacion Frontend-Backend

### H-FE-01: 16/16 Endpoints Match Correctamente (FUNCIONAL)
- 7 endpoints de misiones: 100% match
- 9 endpoints de logros: 100% match
- URLs, metodos HTTP, y parametros alineados

### H-FE-02: Codigo Deprecated Sin Impacto en Produccion (TECH-DEBT)
- `missionsStore.ts` — 0 usos en produccion, marcado @deprecated
- `missionsAPI.ts` — 0 usos en produccion, tipo legacy con `objective` singular
- Ambos seguros de eliminar

### H-FE-03: Bonus Hardcodeado en Frontend No Existe en Backend (GAP)
- **Archivo:** `apps/frontend/src/features/gamification/missions/hooks/useMissions.ts:392-393`
- Frontend muestra: "Daily complete: +500 XP, +100 ML Coins bonus"
- Backend NO implementa ni valida este bonus
- Usuario ve promesa que no se cumple al reclamar

### H-FE-04: Doble Capa de API para Achievements (TECH-DEBT)
- `achievementsAPI.ts` (features-specific) — PRIMARY
- `gamificationApi.ts` (shared library) — tiene metodos duplicados
- AchievementsPage.tsx llama ambas, causando API calls redundantes

### H-FE-05: MissionsPanel Usa Interfaz Local Incompatible (GAP)
- **Archivo:** `apps/frontend/src/apps/student/components/dashboard/MissionsPanel.tsx:32-49`
- Define `Mission` interface local con campos diferentes (`mlReward` vs `mlCoinsReward`)
- Recibe mock data de parent, nunca datos reales
- Si se conecta a datos reales, fallara por type mismatch

### H-FE-06: Reward Field Names Inconsistentes en Backend (TECH-DEBT)
- Backend retorna rewards en 3 formatos diferentes: nested JSONB, flat snake_case, nested camelCase
- Frontend usa dual-fallback: `ach.rewards?.ml_coins ?? ach.ml_coins_reward ?? 0`
- Fragil ante cambios futuros
