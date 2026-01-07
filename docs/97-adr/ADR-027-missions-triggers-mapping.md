# ADR-027: Mapeo de Triggers de Misiones - BD como Fuente de Verdad

**Estado:** Aprobado
**Fecha:** 2025-01-04
**Origen:** Extraido de TRACE-GAP-002 (archivos historicos)

---

## Contexto

El sistema de misiones de GAMILIT utiliza triggers de base de datos para actualizar automaticamente el progreso de las misiones cuando los usuarios realizan acciones. Existio una inconsistencia entre los tipos de objetivos que el backend generaba y los que los triggers de BD reconocian.

### Problema Original

| Fuente | Tipos Generados |
|--------|-----------------|
| **BD (triggers)** | `complete_exercises`, `earn_xp`, `use_comodines`, `daily_streak` |
| **Backend (missions.service.ts)** | `complete_exercises`, `correct_streak`, `study_time`, `consecutive_days` |

Los triggers de BD buscaban tipos que el backend no generaba, causando que las misiones no se actualizaran.

---

## Decision

**Principio rector:** Los triggers de BD son la fuente de verdad para los tipos de objetivos de misiones.

El backend debe generar misiones con tipos de objetivos que los triggers de BD reconocen:

| Tipo BD (Correcto) | Descripcion |
|--------------------|-------------|
| `complete_exercises` | Completar N ejercicios |
| `earn_xp` | Ganar N puntos XP |
| `use_comodines` | Usar N comodines |
| `daily_streak` | Mantener racha de N dias |
| `perfect_scores` | Obtener N puntuaciones perfectas |
| `complete_modules` | Completar N modulos |
| `explore_modules` | Explorar N modulos |

---

## Mapeo de Triggers de BD

Los siguientes triggers existen en la base de datos y deben respetarse:

| Trigger | Tabla | Tipo de Objetivo | Evento |
|---------|-------|------------------|--------|
| `trg_update_missions_on_exercise` | `progress_tracking.exercise_submissions` | `complete_exercises` | AFTER INSERT |
| `trg_update_missions_on_earn_xp` | `gamification_system.user_stats` | `earn_xp` | AFTER UPDATE (total_xp) |
| `trg_update_missions_on_use_comodines` | `gamification_system.inventory_transactions` | `use_comodines` | AFTER INSERT |
| `trg_update_missions_on_daily_streak` | `gamification_system.user_stats` | `daily_streak` | AFTER UPDATE (current_streak) |
| `trg_update_missions_on_perfect_scores` | `progress_tracking.exercise_submissions` | `perfect_scores` | AFTER INSERT/UPDATE (score=100) |
| `trg_update_missions_on_complete_modules` | `progress_tracking.module_progress` | `complete_modules` | AFTER UPDATE |
| `trg_update_missions_on_explore_modules` | `progress_tracking.module_progress` | `explore_modules` | AFTER INSERT/UPDATE |

---

## Ubicacion de Archivos

**Triggers DDL:**
```
apps/database/ddl/schemas/gamification_system/triggers/
├── 27-trg_update_missions_on_earn_xp.sql
├── 28-trg_update_missions_on_use_comodines.sql
├── 29-trg_update_missions_on_daily_streak.sql
├── 30-trg_update_missions_on_perfect_scores.sql
├── 31-trg_update_missions_on_complete_modules.sql
├── 32-trg_update_missions_on_explore_modules.sql
└── 33-trg_update_missions_on_exercise.sql
```

**Backend Service:**
```
apps/backend/src/modules/gamification/services/missions.service.ts
```

---

## Consecuencias

### Positivas
- Consistencia entre BD y backend
- Triggers funcionan automaticamente sin logica adicional en backend
- Fuente unica de verdad para tipos de objetivos

### Negativas
- Agregar nuevos tipos de mision requiere crear trigger en BD primero
- El backend debe mantenerse sincronizado con los tipos de BD

### Mitigacion
- Documentar nuevos triggers en este ADR
- Validar tipos en backend contra lista de tipos conocidos

---

## Referencias

- Traza original: `docs/archivados/historicos-2025/trazas/TRACE-GAP-002.md`
- Servicio de misiones: `apps/backend/src/modules/gamification/services/missions.service.ts`

---

**Autor:** Architecture-Analyst
**Version:** 1.0
