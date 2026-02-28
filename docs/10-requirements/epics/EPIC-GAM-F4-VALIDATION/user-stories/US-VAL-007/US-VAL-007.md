---
id: "US-VAL-007"
title: "Gamification Mechanics"
type: "User Story"
status: "Pendiente"
priority: "Alta"
epic: "EPIC-GAM-F4-VALIDATION"
story_points: 13
sprint: "Sprint-16"
created_date: "2026-02-10"
updated_date: "2026-02-10"
---

# US-VAL-007: Gamification Mechanics

**Epica:** EPIC-GAM-F4-VALIDATION — Validacion Integral
**Sprint:** Sprint 16 | **SP:** 13 | **Prioridad:** Alta | **Estado:** Pendiente

---

## Descripcion

**Como** student
**Quiero** verificar que todas las mecanicas de gamificacion funcionan correctamente
**Para** confirmar que XP, ranks, coins, achievements, missions, leaderboards, shop y comodines operan end-to-end

## Criterios de Aceptacion

### CA-01: XP Calculation
XP calculado correctamente por dificultad, reflejado en user_stats

### CA-02: Maya Rank Progression
Trigger de promocion dispara al alcanzar threshold (Ajaw → K'inich → ...)

### CA-03: ML Coins
Earn + balance + spend funciona, transactions log correcto

### CA-04: Achievements
Badge aparece al cumplir condicion

### CA-05: Missions
Daily/weekly missions generadas y completables, 9 trigger wrappers funcionan

### CA-06: Leaderboards
Rankings correctos via materialized views

### CA-07: Shop
Purchase + inventory funciona, coins deducidos

### CA-08: Comodines
Usage tracked, cooldown enforced

## Tasks

| Task | Titulo | Mecanica |
|------|--------|----------|
| [TASK-VAL-007-F4-INTEG-XP](TASK-VAL-007-F4-INTEG-XP.md) | XP calculation | XP |
| [TASK-VAL-007-F4-INTEG-RANKS](TASK-VAL-007-F4-INTEG-RANKS.md) | Maya rank progression | Ranks |
| [TASK-VAL-007-F4-INTEG-COINS](TASK-VAL-007-F4-INTEG-COINS.md) | ML Coins lifecycle | Coins |
| [TASK-VAL-007-F4-INTEG-ACHIEVEMENTS](TASK-VAL-007-F4-INTEG-ACHIEVEMENTS.md) | Achievements unlock | Achievements |
| [TASK-VAL-007-F4-INTEG-MISSIONS](TASK-VAL-007-F4-INTEG-MISSIONS.md) | Missions generation + completion | Missions |
| [TASK-VAL-007-F4-INTEG-LEADERBOARD](TASK-VAL-007-F4-INTEG-LEADERBOARD.md) | Leaderboard rankings | Leaderboard |
| [TASK-VAL-007-F4-INTEG-SHOP](TASK-VAL-007-F4-INTEG-SHOP.md) | Shop purchase + inventory | Shop |
| [TASK-VAL-007-F4-INTEG-COMODINES](TASK-VAL-007-F4-INTEG-COMODINES.md) | Comodines use + cooldown | Comodines |

---

*Actualizado: 2026-02-10*
