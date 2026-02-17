# 02-PLAN-IMPLEMENTACION-ISSUES.md - Cierre Residual Full

**Fecha:** 2026-02-17  
**Estado:** En ejecucion documental

---

## Issues derivados

### ISSUE-FULL-DOC-001

**Titulo:** Completar cobertura E2E admin en `docs/30-ux-ui/flujos/admin/`  
**Capas:** FE/BE/DB/Docs  
**Prioridad:** P1  
**Estado:** IMPLEMENTADO

**Criterios de aceptacion:**

- Existen flujos `FL-ADM-01..04`.
- Cada flujo contiene Mermaid + secuencia FE->BE->DB.
- Matriz de trazabilidad y catalogo global actualizados.

---

### ISSUE-FULL-DOC-002

**Titulo:** Completar cobertura E2E parents en `docs/30-ux-ui/flujos/parents/` y `docs/60-portals/parents/`  
**Capas:** FE/BE/DB/Docs  
**Prioridad:** P1  
**Estado:** IMPLEMENTADO

**Criterios de aceptacion:**

- Existen flujos `FL-PRN-01..03`.
- Existe `PORTAL-PARENTS-GUIDE.md`.
- Matrices de cobertura/trazabilidad reflejan parents.

---

### ISSUE-FULL-PLAN-001

**Titulo:** Consolidar endpoints `parents/*` en API reference  
**Capas:** Docs API  
**Prioridad:** P2  
**Estado:** PLANIFICADO (sin ejecucion de codigo)

**Que falta:**

- Seccion dedicada de endpoints parents en `docs/40-api/API-REFERENCE.md`.

**Donde debe implementarse:**

- `docs/40-api/API-REFERENCE.md`

**Perfil responsable:**

- `@PERFIL_DOCS_MAINTAINER` + `@PERFIL_BACKEND_NESTJS` (validacion de contrato)

**Criterio de aceptacion:**

- Endpoints `parents/*` listados con request/response y trazabilidad a `FL-PRN-01..03`.

---

## Orden de ejecucion recomendado

1. ISSUE-FULL-DOC-001 (admin)
2. ISSUE-FULL-DOC-002 (parents)
3. ISSUE-FULL-PLAN-001 (API reference parents)
