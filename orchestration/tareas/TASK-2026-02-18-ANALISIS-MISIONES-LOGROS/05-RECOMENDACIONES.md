# 05-RECOMENDACIONES.md — Acciones Correctivas Priorizadas

**Tarea:** TASK-2026-02-18-ANALISIS-MISIONES-LOGROS
**Fecha:** 2026-02-18

---

## Priorizacion por Impacto y Esfuerzo

### Tier 1: Inmediato (< 30 min cada uno, alto impacto)

#### REC-001: Agregar UNIQUE Constraint a Missions (5 min)
**Resuelve:** DISC-002 (Race condition)
**Severidad bloqueada:** ALTA

```sql
-- apps/database/ddl/schemas/gamification_system/tables/06-missions.sql
ALTER TABLE gamification_system.missions
ADD CONSTRAINT missions_user_template_date_unique
  UNIQUE (user_id, template_id, mission_type, DATE(end_date));
```

**Verificacion:** Intentar INSERT duplicado y confirmar que falla con constraint violation.

---

#### REC-002: Cambiar Timezone de Cron a Mexico (10 min)
**Resuelve:** DISC-005 (Timezone UTC vs Mexico)
**Severidad bloqueada:** MEDIA

```typescript
// apps/backend/src/modules/tasks/services/missions-cron.service.ts
@Cron('0 0 * * *', { timeZone: 'America/Mexico_City' })
async handleDailyMissionsReset() { ... }

@Cron('0 0 * * 1', { timeZone: 'America/Mexico_City' })
async handleWeeklyMissionsReset() { ... }
```

**Verificacion:** Confirmar que cron fires a medianoche hora Mexico, no UTC.

---

#### REC-003: Eliminar Codigo Deprecated (15 min)
**Resuelve:** DISC-014
**Severidad bloqueada:** BAJA

Eliminar 3 archivos:
1. `apps/frontend/src/features/missions/store/missionsStore.ts`
2. `apps/frontend/src/services/api/missionsAPI.ts`
3. `apps/frontend/src/features/missions/store/__tests__/missionsStore.test.ts`

**Verificacion:** `npm run build` frontend sin errores, grep por imports de estos archivos = 0.

---

#### REC-004: Renombrar Staging Seed (5 min)
**Resuelve:** DISC-012
```bash
git mv apps/database/seeds/staging/gamification_system/02-achievements.sql \
       apps/database/seeds/staging/gamification_system/04-achievements.sql
```

---

### Tier 2: Este Sprint (1-4 horas cada uno)

#### REC-005: Deprecar Formalmente DB Function check_and_grant_achievements (1 hora)
**Resuelve:** DISC-001 (DB function incompatible)
**Severidad bloqueada:** CRITICA

**Opcion A (Recomendada):** Agregar deprecation notice y DO NOTHING
```sql
-- apps/database/ddl/schemas/gamification_system/functions/check_and_award_achievements.sql
-- Agregar al inicio del archivo:
-- @DEPRECATED: Esta funcion NO evalua correctamente los achievements seeded.
-- La evaluacion de achievements se realiza exclusivamente via backend:
--   AchievementsService.meetsConditions() (achievements.service.ts:472-778)
-- Ver: TASK-2026-02-18-ANALISIS-MISIONES-LOGROS/02-DISCREPANCIAS.md#DISC-001
--
-- Para restaurar funcionalidad DB-level, actualizar los CASE statements
-- en lineas 72-88 para coincidir con los 14 condition types de seeds.
```

**Opcion B:** Actualizar CASE statements para coincidir con seeds (2-3 horas)
- Agregar cases para: `exercise_completion`, `streak`, `module_completion`, etc.
- Requiere testing exhaustivo

---

#### REC-006: Resolver Bonus Frontend-Only (2-4 horas)
**Resuelve:** DISC-003 (Bonus promesa no cumplida)
**Severidad bloqueada:** ALTA

**Opcion A (Implementar en backend):**
```typescript
// Nuevo endpoint o logica en missions.service.ts
async checkAndGrantDailyBonus(profileId: string): Promise<BonusResult> {
  const dailyMissions = await this.findByTypeAndUser(profileId, 'daily');
  const allClaimed = dailyMissions.every(m => m.status === 'claimed');

  if (allClaimed) {
    await this.userStatsService.addXp(profileId, 500);
    await this.mlCoinsService.addCoins(profileId, 100, 'daily_bonus');
    return { granted: true, xp: 500, coins: 100 };
  }
  return { granted: false };
}
```

**Opcion B (Eliminar del frontend):**
```typescript
// useMissions.ts - Eliminar lineas 392-393
// Remover: bonusXP = (allDailyComplete ? 500 : 0)
// Remover: bonusMLCoins = (allDailyComplete ? 100 : 0)
```

**Recomendacion:** Opcion B es mas rapida y honesta. Si se quiere implementar bonus, hacerlo en siguiente sprint con Opcion A.

---

#### REC-007: Implementar Retry Job para Trigger Failures (2 horas)
**Resuelve:** DISC-006 (Trigger failures silenciosas)

```typescript
// Nuevo: apps/backend/src/modules/tasks/services/user-init-retry.service.ts
@Cron('*/5 * * * *') // Cada 5 minutos
async retryPendingInitializations() {
  const pending = await this.dataSource.query(`
    SELECT * FROM audit_logging.pending_user_initialization
    WHERE resolved = false AND retries < 3
    ORDER BY created_at ASC LIMIT 10
  `);

  for (const record of pending) {
    try {
      await this.dataSource.query(
        'SELECT gamilit.initialize_user_stats_retry($1)',
        [record.profile_id]
      );
      await this.markResolved(record.id);
    } catch (error) {
      await this.incrementRetries(record.id);
      this.logger.error(`Retry failed for ${record.profile_id}: ${error}`);
    }
  }
}
```

---

#### REC-008: Consolidar API Layer de Achievements (2 horas)
**Resuelve:** DISC-008 (Doble capa API)

1. Mover metodos de `gamificationApi.ts` relacionados con achievements a `achievementsAPI.ts`
2. Actualizar `AchievementsPage.tsx` para usar solo `achievementsAPI`
3. Eliminar metodos duplicados de `gamificationApi.ts`

---

### Tier 3: Siguiente Sprint (4+ horas cada uno) — IMPLEMENTADO 2026-02-18

#### REC-009: Migration template_id TEXT -> UUID (2-3 horas) — COMPLETADO
**Resuelve:** DISC-004

```sql
-- 1. Add temporary UUID column
ALTER TABLE gamification_system.missions ADD COLUMN template_uuid UUID;

-- 2. Backfill using name mapping
UPDATE gamification_system.missions m
SET template_uuid = mt.id
FROM gamification_system.mission_templates mt
WHERE m.template_id = mt.name;

-- 3. Drop old column, rename new
ALTER TABLE gamification_system.missions DROP COLUMN template_id;
ALTER TABLE gamification_system.missions RENAME COLUMN template_uuid TO template_id;

-- 4. Add FK
ALTER TABLE gamification_system.missions
ADD CONSTRAINT missions_template_id_fkey
  FOREIGN KEY (template_id) REFERENCES gamification_system.mission_templates(id);

-- 5. Update trigger function to use UUIDs
```

---

#### REC-010: Implementar Cleanup de Misiones Expiradas (1.5 horas) — COMPLETADO
**Resuelve:** DISC-007

```typescript
// missions-cron.service.ts - Implementar el cron job placeholder
@Cron('0 3 * * *', { timeZone: 'America/Mexico_City' }) // 3am
async cleanupExpiredMissions() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 90);

  const result = await this.missionsRepo
    .createQueryBuilder()
    .delete()
    .where('status = :status', { status: 'expired' })
    .andWhere('end_date < :cutoff', { cutoff: cutoffDate })
    .execute();

  this.logger.log(`Cleaned up ${result.affected} expired missions older than 90 days`);
}
```

---

#### REC-011: Crear Logros de Categoria Collection (2-3 horas) — COMPLETADO
**Resuelve:** DISC-010

Crear seed file `apps/database/seeds/dev/gamification_system/15-achievements-collection.sql`:

| Nombre | Condicion | XP | Coins | Rarity |
|--------|-----------|----|----|--------|
| Coleccionista de Logros | Desbloquear 5 logros | 50 | 30 | common |
| Maestro de Niveles | Nivel 3+ en todos los modulos | 200 | 150 | rare |
| Coleccionista de Avatares | Equipar 10+ items cosmeticos | 100 | 75 | rare |
| Millonario ML | Acumular 10,000 ML Coins | 300 | 250 | epic |
| Cazador de Tesoros | Comprar todos los items de tienda | 250 | 200 | legendary |

---

#### REC-012: Estandarizar Reward Field Names en Backend (4 horas) — COMPLETADO
**Resuelve:** DISC-009

Asegurar que TODAS las respuestas de achievements usen:
```json
{
  "rewards": {
    "xp": 100,
    "ml_coins": 50
  }
}
```

Eliminar variantes: `ml_coins_reward`, `points_value`, `xp_reward`.

---

## Roadmap de Implementacion

```
SEMANA 1 (Inmediato):
  ├─ REC-001: UNIQUE constraint misiones ✅ (5 min)
  ├─ REC-002: Timezone Mexico ✅ (10 min)
  ├─ REC-003: Delete deprecated ✅ (15 min)
  ├─ REC-004: Rename staging seed ✅ (5 min)
  └─ Subtotal: ~35 minutos

SEMANA 2 (Este Sprint):
  ├─ REC-005: Deprecar DB function ✅ (1 hora)
  ├─ REC-006: Resolver bonus UI ✅ (2 horas)
  ├─ REC-007: Retry job init ✅ (2 horas)
  └─ REC-008: Consolidar API layer ✅ (2 horas)
  └─ Subtotal: ~7 horas

SEMANA 3-4 (Siguiente Sprint):
  ├─ REC-009: Migration template_id ✅ (3 horas)
  ├─ REC-010: Cleanup misiones ✅ (1.5 horas)
  ├─ REC-011: Logros collection ✅ (3 horas)
  └─ REC-012: Estandarizar rewards ✅ (4 horas)
  └─ Subtotal: ~11.5 horas

TOTAL ESTIMADO: ~19 horas
```

---

## Matriz de Riesgo Post-Implementacion

| Riesgo | Pre-Fix | Post-Fix | Delta |
|--------|---------|----------|-------|
| Misiones duplicadas (race condition) | MEDIO-ALTO | NINGUNO | -100% |
| Timezone desalineado | MEDIO | NINGUNO | -100% |
| DB function incompatible | BAJO (mitigado) | NINGUNO | Documentado |
| Bonus no entregado | MEDIO (UX) | NINGUNO | -100% |
| Trigger failures invisibles | BAJO | NINGUNO | -100% |
| Template_id sin referential integrity | MEDIO | NINGUNO | -100% |
| Tabla missions crecimiento infinito | BAJO | NINGUNO | -100% |

---

## Verificacion Post-Fix Checklist

### Diaria:
- [ ] Cron `daily-missions-reset` ejecuto a medianoche Mexico
- [ ] Usuario ejemplo tiene exactamente 3 misiones diarias activas
- [ ] No hay misiones duplicadas (query de verificacion)

### Semanal:
- [ ] Cron `weekly-missions-reset` ejecuto lunes a medianoche Mexico
- [ ] Usuario ejemplo tiene 2-5 misiones semanales activas

### Post-Deploy:
- [ ] `npm run build` backend sin errores
- [ ] `npm run build` frontend sin errores
- [ ] Seeds cargan sin errores (76 seeds, 0 errores)
- [ ] Registro de nuevo usuario crea 19 records correctamente
- [ ] Claim de logro otorga XP + ML Coins correctamente
- [ ] Claim de mision otorga XP + ML Coins correctamente
- [ ] No hay auto-claim en ningun flujo

### Query de Verificacion de Duplicados:
```sql
SELECT user_id, mission_type, DATE(end_date), COUNT(*) as count
FROM gamification_system.missions
WHERE DATE(end_date) = CURRENT_DATE
GROUP BY user_id, mission_type, DATE(end_date)
HAVING COUNT(*) > 3;
-- Debe retornar 0 rows
```

---

## Validacion de Estandares Post-Implementacion (2026-02-18)

### Auditoria de Codigo (21 checks)
- **18/21 PASS** — DTOs, entities, seeds, cron service, module registration
- **3 FAIL (pre-existentes, no introducidos por REC):**
  1. FK naming convention: `{table}_{col}_fkey` (patron PostgreSQL) vs `fk_{table}_to_{ref}` (SIMCO-DDL doc) — afecta 298+ FKs en todo el proyecto
  2. SECURITY DEFINER ausente en `initialize_user_missions` — runtime OK por BYPASSRLS=true
  3. FKs anonimas en `16-classroom_missions.sql` — inline REFERENCES es patron adoptado en todo el proyecto

**Dictamen:** Las 3 desviaciones son deuda tecnica de patron pre-existente. No se corrigen aisladamente para evitar inconsistencia.

### Documentacion Actualizada
- **INVENTARIOS:** DATABASE (v8.7.0), BACKEND (v4.4.0), FRONTEND (v7.1.0), MASTER (v10.8.0), SEEDS (v3.1.0) — todos sincronizados
- **SCHEMA REFS:** 11-missions.md (v2.0.0 reescrito), _INDEX.md (v2.1.0), COHERENCE-ENTITIES-DDL.md (v2.2.0)
- **SPECS:** SPEC-ACHIEVEMENTS.md (v1.1.0) — GAP-P1-008 resuelto, deprecations anotadas
- **FLUJOS:** FLUJO-LOGROS-MISIONES-CLAIM.md (v2.0.0 reescrito), FLUJO-DASHBOARD-PROGRESO.md (v1.1.0), FLUJO-EJERCICIO-COMPLETO.md (v1.2.0)

### Conformidad con Principios
| Principio | Estado | Evidencia |
|-----------|--------|-----------|
| P-CAPVED | CUMPLIDO | Analisis → Hallazgos → Recomendaciones → Implementacion → Documentacion |
| P-VALIDACION-OBLIGATORIA | CUMPLIDO | tsc --noEmit 0 errores backend, 0 nuevos frontend |
| P-NO-ASUMIR | CUMPLIDO | Lecturas exhaustivas antes de cada cambio |
| P-ANTI-DUPLICACION | CUMPLIDO | useMissions hook reutilizado, missionsStore/missionsAPI eliminados |
| P-DOC-PRIMERO | CUMPLIDO | Docs actualizados post-implementacion |
| RC2 Coherencia | CUMPLIDO | DDL → Entity → DTO → Flujo sincronizados |
| SOLID-SRP | CUMPLIDO | PendingInitializationsCronService separado de MissionsCronService |
| DRY | CUMPLIDO | Template UUID lookups centralizados en trigger |
