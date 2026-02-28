---
titulo: "Plan de Desarrollo: EPIC-GAM-F1-EXERCISES"
tipo: plan
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# Plan de Desarrollo: EPIC-GAM-F1-EXERCISES

**Version:** 1.0.0 | **Fecha:** 2026-02-10
**Epica:** [EPIC.md](./EPIC.md)
**SP Total:** 45
**Estado:** Completado

---

## Secuencia de Desarrollo

| Orden | US ID | Titulo | SP | Dependencias | Sprint |
|-------|-------|--------|----|-------------|--------|
| 1 | US-ACT-001 | Mecanica opcion multiple | 5 | F1-AUTH | Sprint 4 |
| 2 | US-ACT-002 | Mecanica verdadero/falso | 5 | US-ACT-001 | Sprint 4 |
| 3 | US-ACT-003 | Mecanica completar texto | 5 | US-ACT-001 | Sprint 4 |
| 4 | US-ACT-004 | Mecanica drag and drop | 8 | US-ACT-001 | Sprint 5 |
| 5 | US-ACT-005 | Mecanica ordenamiento | 5 | US-ACT-001 | Sprint 5 |
| 6 | US-ACT-006 | Mecanica asociacion | 5 | US-ACT-001 | Sprint 5 |
| 7 | US-ACT-007 | Sistema feedback basico | 5 | US-ACT-001..006 | Sprint 6 |
| 8 | US-ACT-008 | Navegacion actividades | 7 | US-ACT-007 | Sprint 6 |

## Enfoque Tecnico
- **Stack:** NestJS 11 / TypeScript / PostgreSQL 15 / React 19 / Vite 6.x
- **Base de datos:** Schema `educational_content` (tablas exercises, exercise_types, exercise_attempts)
- **Patron:** Strategy pattern por tipo de ejercicio, validadores especificos por mecanica

## Estrategia de Testing
- **Unit:** exercise-validators, scoring-engine (Jest)
- **Integration:** /api/v1/exercises/*, /api/v1/attempts/* (supertest)
- **E2E:** Completar ejercicio de cada tipo, verificar scoring (Playwright)

## Riesgos
| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|------------|
| Drag-and-drop cross-browser | Alta | Medio | Usar libreria probada (dnd-kit), testing multi-browser |
| Validacion de respuestas abiertas | Media | Alto | Definir criterios claros, normalizar texto |
| Performance con muchos ejercicios | Baja | Medio | Paginacion, lazy loading |

---

*Generado: 2026-02-10 | ADR-0020*
