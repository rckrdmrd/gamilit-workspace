# 04-MATRIZ-MISIONES.md — Tabla de Mission Templates y Ciclo de Vida

**Tarea:** TASK-2026-02-18-ANALISIS-MISIONES-LOGROS
**Fecha:** 2026-02-18
**Fuentes:** `10-mission_templates.sql` (11 templates) + `18-initialize_user_missions.sql` (8 hardcoded)

---

## Mission Templates (11 seeded)

**Archivo:** `apps/database/seeds/dev/gamification_system/10-mission_templates.sql`

| # | Template Name | Type | Min Level | Priority | XP Reward | ML Coins | is_active | Condicion |
|---|--------------|------|-----------|----------|-----------|----------|-----------|-----------|
| 1 | Completar ejercicios de lectura | daily | 1 | 3 | 50 | 25 | true | Completar N ejercicios de lectura |
| 2 | Ganar XP | daily | 1 | 2 | 30 | 15 | true | Ganar N puntos de XP |
| 3 | Usar comodin | daily | 2 | 1 | 25 | 10 | true | Usar N comodines |
| 4 | Puntuacion perfecta | daily | 3 | 2 | 75 | 40 | true | N ejercicios con 100% |
| 5 | Explorar modulo | daily | 1 | 1 | 40 | 20 | true | Completar ejercicio en N modulos |
| 6 | Completar modulo semanal | weekly | 1 | 3 | 100 | 50 | true | Completar N% de un modulo |
| 7 | Racha diaria | weekly | 1 | 2 | 75 | 40 | true | Mantener racha N dias |
| 8 | Puntuaciones perfectas semanales | weekly | 2 | 2 | 100 | 50 | true | N puntuaciones perfectas en la semana |
| 9 | Explorador semanal | weekly | 1 | 1 | 80 | 35 | true | Ejercicios en N modulos diferentes |
| 10 | Evento especial 1 | special | 1 | 1 | 150 | 75 | true | Evento temporal |
| 11 | Evento especial 2 | special | 1 | 1 | 200 | 100 | true | Evento temporal |

---

## Misiones Hardcodeadas por Trigger DB (8)

**Archivo:** `apps/database/ddl/schemas/gamilit/functions/18-initialize_user_missions.sql`

| # | template_id (TEXT) | Type | Title | XP | ML Coins | end_date |
|---|-------------------|------|-------|----|----|----------|
| 1 | daily_complete_exercises | daily | Completa 3 ejercicios | 50 | 25 | Hoy 23:59:59 UTC |
| 2 | daily_earn_xp | daily | Gana 100 XP | 30 | 15 | Hoy 23:59:59 UTC |
| 3 | daily_use_comodin | daily | Usa un comodin | 25 | 10 | Hoy 23:59:59 UTC |
| 4 | weekly_complete_module | weekly | Avanza en un modulo | 100 | 50 | Domingo 23:59:59 UTC |
| 5 | weekly_daily_streak | weekly | Mantener racha 5 dias | 75 | 40 | Domingo 23:59:59 UTC |
| 6 | weekly_perfect_scores | weekly | 3 puntuaciones perfectas | 100 | 50 | Domingo 23:59:59 UTC |
| 7 | weekly_explorer | weekly | Ejercicios en 3 modulos | 80 | 35 | Domingo 23:59:59 UTC |
| 8 | weekly_master_learner | weekly | Completar 10 ejercicios | 80 | 35 | Domingo 23:59:59 UTC |

**NOTA:** Los template_id son TEXT strings, NO UUIDs. No hacen referencia FK a mission_templates. Ver DISC-004.

---

## Ciclo de Vida Completo de una Mision

```
CREACION
  ├─ Via trigger DB (registro usuario): 3 daily + 5 weekly inmediatas
  └─ Via backend on-demand (findByTypeAndUser): si missions.length === 0

ESTADOS (MissionStatusEnum):
  active → in_progress → completed → claimed
                                   └→ expired (si end_date < NOW())

GENERACION DIARIA (Cron: 00:00 UTC)
  1. daily-missions-reset cron job fires
  2. Expire old dailies: UPDATE status='expired' WHERE end_date < NOW()
  3. Generate new dailies for active users
  4. 3 templates seleccionados con weighted random (por priority)

GENERACION SEMANAL (Cron: lunes 00:00 UTC)
  1. weekly-missions-reset cron job fires
  2. Expire old weeklies
  3. Generate 2-5 new weekly missions
  4. Templates seleccionados con weighted random

PROGRESO
  1. Usuario completa ejercicio
  2. Trigger DB: trg_update_missions_on_earn_xp
  3. Backend: mission-progress.service.ts actualiza objectives[].current
  4. Cuando current >= target: status → 'completed'
  5. Notificacion push al usuario

CLAIM (POST /gamification/missions/{id}/claim)
  1. Validar: status === 'completed'
  2. Validar: user_id === profileId (ownership)
  3. Distribuir ML Coins via MLCoinsService.addCoins()
  4. Distribuir XP via UserStatsService.addXp()
  5. UPDATE status = 'claimed', claimed_at = NOW()
  6. Retornar { mission, rewards, rewards_granted }

EXPIRACION
  1. Cron job verifica end_date < NOW()
  2. UPDATE status = 'expired'
  3. Misiones expiradas NO se pueden reclamar
  4. Sin cleanup (se acumulan — TECH-DEBT)
```

---

## Flujo de Seleccion de Templates

```
mission-generator.service.ts:

1. Query templates WHERE type = $type AND is_active = true AND min_level <= user.level
2. Weighted random selection (priority field):
   - priority=3: 3x probabilidad
   - priority=2: 2x probabilidad
   - priority=1: 1x probabilidad
3. Seleccionar N templates sin repeticion:
   - daily: 3 templates
   - weekly: 2-5 templates
4. Para cada template:
   - Crear mission con objectives from template
   - Set end_date = tipo-specific deadline
   - Set status = 'active'
   - Set rewards from template.rewards
5. Guardar en DB
```

---

## Verificacion de End Dates

| Tipo | end_date Calculo | Ejemplo (si hoy es martes 2026-02-18) |
|------|-----------------|---------------------------------------|
| daily | Hoy 23:59:59 UTC | 2026-02-18T23:59:59Z |
| weekly | Proximo domingo 23:59:59 UTC | 2026-02-22T23:59:59Z |
| special | Definido por evento | Variable |

**NOTA:** UTC puede causar que misiones "diarias" para usuarios en Mexico (UTC-6) expiren a las 6pm hora local. Ver DISC-005.

---

## Resumen de Gaps en Ciclo de Vida

| Aspecto | Estado | Detalle |
|---------|--------|---------|
| Generacion al crear usuario | FUNCIONAL | 8 misiones via trigger |
| Generacion on-demand | FUNCIONAL | Si no hay misiones, genera nuevas |
| Cron diario | FUNCIONAL | Expira y regenera |
| Cron semanal | FUNCIONAL | Expira y regenera |
| Progreso tracking | FUNCIONAL | Via triggers + backend |
| Claim individual | FUNCIONAL | Atomico con rewards |
| Claim bulk | FUNCIONAL | Graceful degradation |
| Race condition | BUG | Sin UNIQUE constraint |
| Cleanup/archive | MISSING | Misiones se acumulan |
| Timezone | GAP | UTC vs Mexico |
| Backfill dias perdidos | N/A | Solo genera dia actual |
| template_id referential | GAP | TEXT vs UUID sin FK |

---

## Estadisticas de Recompensas por Tipo

### Daily (si se completan las 3)
| Metrica | Min | Max | Tipico |
|---------|-----|-----|--------|
| XP por dia | 105 | 155 | 120 |
| ML Coins por dia | 50 | 75 | 60 |

### Weekly (si se completan las 5)
| Metrica | Min | Max | Tipico |
|---------|-----|-----|--------|
| XP por semana | 335 | 435 | 385 |
| ML Coins por semana | 175 | 225 | 200 |

### Totales Semanales Potenciales (daily x7 + weekly)
| Metrica | Estimado |
|---------|----------|
| XP semanal max | ~1,520 (daily max x7 + weekly max) |
| ML Coins semanal max | ~750 (daily max x7 + weekly max) |
