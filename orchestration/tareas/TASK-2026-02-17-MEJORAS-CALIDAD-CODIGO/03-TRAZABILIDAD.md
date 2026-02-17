# 03-TRAZABILIDAD.md - Matriz de Trazabilidad

**Tarea:** TASK-2026-02-17-MEJORAS-CALIDAD-CODIGO
**Fecha:** 2026-02-17
**Version:** 1.0.0
**Sistema:** SIMCO v4.0.0

---

## 1. Trazabilidad de Gaps de Calidad (MQ)

| ID | EPIC | Standard | Evidence File | Status |
|----|------|----------|--------------|--------|
| MQ-001 | EPIC-GAM-F4-VALIDATION | ESTANDAR-TESTING + jest.config.js | `apps/backend/jest.config.js` (line: coverageThreshold=50%), `CLAUDE.md` (line: "Minimo 80% test coverage objetivo") | Pendiente |
| MQ-002 | EPIC-GAM-F4-VALIDATION | backend-profesional/05-manejo-errores.md | `apps/backend/src/modules/` — servicios usan HttpException directamente | Pendiente |
| MQ-003 | EPIC-GAM-F4-VALIDATION | ESTANDAR-SKILLS.md Section 3.2 | `orchestration/skills/` — directorio existe pero sin los 4 skills P1 | Pendiente |
| MQ-004 | EPIC-GAM-F4-VALIDATION | ESTANDAR-DOCUMENTACION | `orchestration/tareas/` — 15+ tareas sin campo epic_ref | Pendiente |
| MQ-005 | EPIC-GAM-F4-VALIDATION | backend-profesional/03-repository-pattern.md | `apps/backend/src/modules/**/*.service.ts` — @InjectRepository directo | Pendiente |
| MQ-006 | EPIC-GAM-F4-VALIDATION | PRINCIPIO-CLEAN-ARCHITECTURE | `docs/90-adr/` — no existe ADR de Clean Architecture | Pendiente |
| MQ-007 | EPIC-GAM-F4-VALIDATION | ESTANDAR-CODIGO | `apps/backend/` — `npm run lint` reporta 911 no-explicit-any | Pendiente |
| MQ-008 | EPIC-GAM-F4-VALIDATION | ESTANDAR-SKILLS.md | `orchestration/skills/` — sin skill simco-apply-backend-standard | Pendiente |
| MQ-009 | EPIC-GAM-F4-VALIDATION | PRINCIPIO-VALIDACION-OBLIGATORIA | `apps/frontend/src/` — multiplierMap hardcoded vs backend config | Pendiente |
| MQ-010 | EPIC-GAM-F4-VALIDATION | backend-profesional/04-domain-driven-design.md | `apps/backend/src/modules/gamification/` — XP, MLCoins como primitivos | Pendiente |

---

## 2. Trazabilidad de Correcciones Tecnicas (CORR)

| ID | EPIC | Standard | Evidence File | Status |
|----|------|----------|--------------|--------|
| CORR-01 | EPIC-GAM-F4-VALIDATION | ESTANDAR-CODIGO | `apps/backend/src/config/env.validation.ts` | Completado |
| CORR-02 | EPIC-GAM-F4-VALIDATION | ESTANDAR-CODIGO (ESLint) | `apps/backend/` — lint clean de no-case-declarations | Completado |
| CORR-03 | EPIC-GAM-F4-VALIDATION | ESTANDAR-DATABASE-PROFESIONAL | `apps/database/ddl/schemas/gamification_system/triggers/28-*.sql`, `apps/database/scripts/init-database.sh` | Pendiente |
| CORR-04 | EPIC-GAM-F4-VALIDATION | ESTANDAR-DATABASE-PROFESIONAL (RLS) | `apps/database/ddl/` — RLS policies, `init-database.sh` runtime count | Pendiente |
| CORR-05 | EPIC-GAM-F4-VALIDATION | ESTANDAR-DATABASE-PROFESIONAL (Seeds) | `apps/database/seeds/` — 30 errores en ejecucion | Pendiente |

---

## 3. Mapeo a EPICs del Backlog

| EPIC | Items Asociados | Prioridad Max | Estado |
|------|----------------|---------------|--------|
| EPIC-WS-004 (Mejoras de Calidad de Codigo) | MQ-001 a MQ-010 | P0 | Nuevo |
| EPIC-WS-005 (Correcciones Tecnicas Pendientes) | CORR-01 a CORR-05 | P0 | Nuevo (2 completados) |
| EPIC-GAM-F4-VALIDATION | Todos (referencia cruzada) | P0 | En progreso |

---

## 4. Mapeo a Standards

| Standard | Items que lo referencian |
|----------|------------------------|
| ESTANDAR-TESTING | MQ-001 |
| ESTANDAR-CODIGO | MQ-007, CORR-01, CORR-02 |
| ESTANDAR-SKILLS.md | MQ-003, MQ-008 |
| ESTANDAR-DOCUMENTACION | MQ-004 |
| ESTANDAR-DATABASE-PROFESIONAL | CORR-03, CORR-04, CORR-05 |
| backend-profesional/03-repository-pattern.md | MQ-005 |
| backend-profesional/04-domain-driven-design.md | MQ-010 |
| backend-profesional/05-manejo-errores.md | MQ-002 |
| PRINCIPIO-CLEAN-ARCHITECTURE | MQ-006 |
| PRINCIPIO-VALIDACION-OBLIGATORIA | MQ-009 |

---

## 5. Cadena de Dependencias

```
CORR-01 (Completado) -----> Sin dependientes
CORR-02 (Completado) -----> Sin dependientes
CORR-03 (Pendiente)  -----> CORR-04 -----> CORR-05
MQ-001 (Pendiente)   -----> Sin dependientes
MQ-002 (Pendiente)   -----> Sin dependientes
MQ-003 (Pendiente)   -----> MQ-008
MQ-004 (Pendiente)   -----> Sin dependientes
MQ-006 (Pendiente)   -----> MQ-005 -----> MQ-010
MQ-007 (Pendiente)   -----> Sin dependientes
MQ-009 (Pendiente)   -----> Sin dependientes
```

---

## 6. Verificacion de Completitud

| Aspecto | Esperado | Actual | Gap |
|---------|----------|--------|-----|
| Items P0 | 1 MQ + 2 CORR | MQ-001 pendiente, CORR-01/02 completados | 1 pendiente |
| Items P1 | 3 MQ + 2 CORR | MQ-002/003/004, CORR-03/04 todos pendientes | 5 pendientes |
| Items P2 | 5 MQ + 1 CORR | MQ-005/006/007/008/009, CORR-05 todos pendientes | 6 pendientes |
| Items P3 | 1 MQ | MQ-010 pendiente | 1 pendiente |
| **Total** | **15 items** | **2 completados, 13 pendientes** | **13 pendientes** |

---

*Generado por: Claude Code | Fecha: 2026-02-17*
