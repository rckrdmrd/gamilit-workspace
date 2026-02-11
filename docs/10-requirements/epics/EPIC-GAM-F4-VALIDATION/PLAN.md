# Plan de Desarrollo: EPIC-GAM-F4-VALIDATION

**Version:** 1.0.0 | **Fecha:** 2026-02-10
**Epica:** [EPIC.md](./EPIC.md)
**SP Total:** 89
**Estado:** En Progreso

---

## Secuencia de Desarrollo

| Orden | US ID | Titulo | SP | Dependencias | Fase |
|-------|-------|--------|----|-------------|------|
| 1 | US-VAL-001 | Environment Setup | 8 | ninguna | F0 |
| 2 | US-VAL-002 | Database Integrity | 13 | US-VAL-001 | F1 |
| 3 | US-VAL-003 | Backend API Smoke | 13 | US-VAL-001 | F2 |
| 4 | US-VAL-004 | Frontend Portal Load | 13 | US-VAL-001 | F3 |
| 5 | US-VAL-005 | User Lifecycle Integration | 8 | US-VAL-002, US-VAL-003, US-VAL-004 | F4a |
| 6 | US-VAL-006 | Exercise Submission Integration | 13 | US-VAL-005 | F4b |
| 7 | US-VAL-007 | Gamification Mechanics | 13 | US-VAL-006 | F4c |
| 8 | US-VAL-008 | DB-Backend Coherence Audit | 5 | US-VAL-002, US-VAL-003 | F4d |
| 9 | US-VAL-009 | Findings Documentation | 3 | US-VAL-007, US-VAL-008 | F5 |

## Enfoque Tecnico

- **Stack:** PostgreSQL 16 / NestJS 11 / TypeScript 5.7 / React 19 / Vite 6 / Socket.IO 4.8+
- **Base de datos:** 18 schemas, 171 tablas, 299 FKs, 282 RLS policies
- **Validacion:** Queries SQL directos, curl/httpie API calls, browser checks, DB verification post-action
- **Patron:** Bottom-up (infra → DB → backend → frontend → integration → gamification → docs)

## Estrategia de Testing

- **F0:** Verificar servicios y builds
- **F1:** SQL queries contra information_schema + test data inserts
- **F2:** curl endpoints, npm run test (833+ tests)
- **F3:** Browser navigation, npm run test:run
- **F4:** End-to-end flows con verificacion DB post-accion
- **F5:** Reporte consolidado con hallazgos clasificados

## Riesgos

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|------------|
| DDL errores en schemas reescritos F5 | Media | Alto | Validar cada schema individual antes de full recreate |
| Seeds obsoletos post-restructuring | Media | Medio | Verificar conteos esperados vs reales |
| Frontend routes desactualizadas | Baja | Medio | Comparar App.tsx routes vs paginas reales |
| WebSocket handshake falla | Baja | Medio | Verificar Redis disponible y CORS configurado |

---

*Generado: 2026-02-10 | EPIC-GAM-F4-VALIDATION*
