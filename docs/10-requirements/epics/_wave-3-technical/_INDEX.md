# Wave 3 — EPICs Tecnicas (COMPLETADAS)

> EPICs organizadas por capa tecnica. Wave 3 completada — 11 EPICs, 162 SP.

**Estado:** COMPLETADO (todas las EPICs)
**Tipo:** Tecnicas (por capa: scaffold, database, backend, frontend, etc.)
**Reorganizado:** 2026-02-07 — Movidas a subcarpeta para dar paso a EPICs funcionales

---

## EPICs

| Epic ID | Titulo | SP | Estado |
|---------|--------|-----|--------|
| EPIC-GAM-SCAFFOLD | Scaffolding Gamilit | 5 | completed |
| EPIC-GAM-REQUIREMENTS | Requerimientos Gamilit | 13 | completed |
| EPIC-GAM-ARCHITECTURE | Arquitectura Gamificacion | 13 | completed |
| EPIC-GAM-DATABASE | Esquema BD Gamilit | 21 | completed |
| EPIC-GAM-BACKEND | Backend Gamilit | 34 | completed |
| EPIC-GAM-FRONTEND | Frontend Gamilit | 34 | completed |
| EPIC-GAM-K8S | Kubernetes Gamilit | 8 | completed |
| EPIC-GAM-TESTING | Tests Gamilit | 13 | completed |
| EPIC-GAM-DEVOPS | DevOps Gamilit | 8 | completed |
| EPIC-GAM-DOCS | Documentacion Gamilit | 8 | completed |
| EPIC-GAM-INTEGRATION | Integracion Gamilit | 5 | completed |

## Flujo de Dependencias

```
SCAFFOLD -> REQUIREMENTS -> ARCHITECTURE -> DATABASE -> BACKEND -> FRONTEND -> K8S -> TESTING -> DEVOPS -> DOCS -> INTEGRATION
```

## Nota

Estas EPICs representan el desarrollo tecnico por capas del MVP de Gamilit.
Las EPICs funcionales (por feature: auth, ejercicios, gamificacion, portales, etc.)
se encuentran en el directorio padre `epics/` con nomenclatura `EPIC-GAM-F{N}-{ID}`.

---

*Reorganizado: 2026-02-07 | TASK-2026-02-07-REESTRUCTURA-DOCUMENTAL*
