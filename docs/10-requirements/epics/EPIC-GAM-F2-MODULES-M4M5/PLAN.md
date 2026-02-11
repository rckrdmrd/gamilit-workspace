# Plan de Desarrollo: EPIC-GAM-F2-MODULES-M4M5

**Version:** 1.0.0 | **Fecha:** 2026-02-10
**Epica:** [EPIC.md](./EPIC.md)
**SP Total:** 30
**Estado:** Completado

---

## Secuencia de Desarrollo

| Orden | US ID | Titulo | SP | Dependencias | Sprint |
|-------|-------|--------|----|-------------|--------|
| 1 | US-M4-001 | Backend DTOs M4 | 5 | F1-EXERCISES | Sprint 10 |
| 2 | US-M5-001 | Backend DTOs M5 | 5 | F1-EXERCISES | Sprint 10 |
| 3 | US-M4M5-001 | Seeds M4-M5 | 3 | US-M4-001, US-M5-001 | Sprint 10 |
| 4 | US-M4-002 | Gamificacion M4 | 5 | US-M4-001, F1-GAMIFICATION | Sprint 11 |
| 5 | US-M5-002 | Calificacion M5 | 5 | US-M5-001 | Sprint 11 |
| 6 | US-M4M5-002 | Progreso M4-M5 | 3 | US-M4-002, US-M5-002 | Sprint 11 |
| 7 | US-M4M5-003 | Notificaciones M4-M5 | 3 | US-M4M5-002 | Sprint 12 |

## Enfoque Tecnico
- **Stack:** NestJS 11 / TypeScript / PostgreSQL 16 / React 19 / Vite 7.x
- **Base de datos:** Schema `educational_content` (extension de exercises con tipos M4/M5, lectura digital + produccion)
- **Patron:** Modulos educativos extensibles, validadores especificos por tipo M4/M5

## Estrategia de Testing
- **Unit:** m4-validators, m5-grading, seed-loader (Jest)
- **Integration:** /api/v1/exercises/m4/*, /api/v1/exercises/m5/* (supertest)
- **E2E:** Completar ejercicio M4 (lectura digital), completar M5 (produccion) (Playwright)

## Riesgos
| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|------------|
| Calificacion manual M5 compleja | Alta | Alto | Interface de revision clara, rubric predefinida |
| Seeds inconsistentes | Media | Medio | Validacion de schema, tests de seed integrity |
| Integracion con gamificacion existente | Media | Medio | Reutilizar hooks existentes, extension no modificacion |

---

*Generado: 2026-02-10 | ADR-0020*
