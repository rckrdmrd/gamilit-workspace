# Plan de Desarrollo: EPIC-GAM-F1-GAMIFICATION

**Version:** 1.2.0 | **Fecha:** 2026-02-17
**Epica:** [EPIC.md](./EPIC.md)
**SP Total:** 40
**Estado:** Completado

---

## Secuencia de Desarrollo

| Orden | US ID | Titulo | SP | Dependencias | Sprint |
|-------|-------|--------|----|-------------|--------|
| 1 | US-GAM-002 | Sistema experiencia XP | 5 | F1-AUTH, F1-EXERCISES | Sprint 7 |
| 2 | US-GAM-001 | Sistema rangos maya | 5 | US-GAM-002 | Sprint 7 |
| 3 | US-GAM-003 | Monedas lectoras (ML Coins) | 5 | US-GAM-002 | Sprint 7 |
| 4 | US-GAM-005 | Insignias basicas | 5 | US-GAM-002 | Sprint 8 |
| 5 | US-GAM-004 | Sistema ayudas | 5 | US-GAM-003 | Sprint 8 |
| 6 | US-GAM-006 | Narrativa basica | 5 | US-GAM-001 | Sprint 8 |
| 7 | US-GAM-007 | Leaderboard simple | 5 | US-GAM-002 | Sprint 9 |
| 8 | US-GAM-008 | Recompensas modulos | 5 | US-GAM-003, F1-EXERCISES | Sprint 9 |

## Enfoque Tecnico
- **Stack:** NestJS 11 / TypeScript / PostgreSQL 15 / React 19 / Redis
- **Base de datos:** Schema `gamification_system` (tablas xp_transactions, ranks, achievements, ml_coin_transactions, store_items)
- **Patron:** Event-driven (exercise completion triggers XP/coins), Observer pattern para achievements

## Estrategia de Testing
- **Unit:** xp-calculator, rank-resolver, coin-engine (Jest)
- **Integration:** /api/v1/gamification/*, /api/v1/leaderboard/* (supertest)
- **E2E:** Completar ejercicio y verificar XP, coins, rank progression (Playwright)

## Riesgos
| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|------------|
| Economia inflacionaria de ML Coins | Alta | Alto | Balanceo por formulas, limites diarios |
| Race conditions en XP concurrente | Media | Alto | Transacciones atomicas, Redis locks |
| Leaderboard performance | Media | Medio | Materialized views, cache Redis |


---

*Generado: 2026-02-10 | ADR-0020*
