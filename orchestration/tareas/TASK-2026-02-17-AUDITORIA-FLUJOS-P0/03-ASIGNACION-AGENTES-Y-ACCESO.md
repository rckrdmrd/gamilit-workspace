# 03-ASIGNACION-AGENTES-Y-ACCESO.md

**Fecha:** 2026-02-17  
**Tarea:** TASK-2026-02-17-AUDITORIA-FLUJOS-P0

---

## Asignacion de issues por perfil

| Issue | Perfil principal | Perfil soporte | Razon |
|------|------------------|----------------|-------|
| ISSUE-P0-STORE-001 | `@PERFIL_BACKEND_NESTJS` | `PERFIL-GAMIFICATION-SPECIALIST` (proyecto gamilit) | Regla de negocio de compra |
| ISSUE-P0-STORE-002 | `@PERFIL_BACKEND_NESTJS` | `@PERFIL_DATABASE_POSTGRESQL` | Atomicidad/transacciones |
| ISSUE-P0-MISS-001 | `@PERFIL_BACKEND_NESTJS` | `@PERFIL_DATABASE_POSTGRESQL` | Consistencia claim y rewards |
| ISSUE-P1-REV-001 | `@PERFIL_BACKEND_NESTJS` | `PERFIL-INTEGRATION-VALIDATOR.md` | Coherencia review/rewards/notificacion |

---

## Procedimiento de acceso para agentes

1. Leer `orchestration/agents/perfiles/_MAP.md` para seleccionar perfil.
2. Leer `orchestration/directivas/simco/SIMCO-WORK-ITEMS.md`.
3. Cargar esta tarea:
   - `01-HALLAZGOS.md`
   - `02-PLAN-IMPLEMENTACION-ISSUES.md`
   - `03-ASIGNACION-AGENTES-Y-ACCESO.md`
4. Ejecutar con CAPVED y triggers activos.
5. Actualizar `docs/30-ux-ui/flujos/VALIDACION-ANALISIS-VS-INTEGRACION.md` al cerrar cada issue.

---

## Rutas canonicas de referencia

- `docs/30-ux-ui/flujos/AUDITORIA-P0-RESULTADOS.md`
- `docs/30-ux-ui/flujos/AUDITORIA-CONSISTENCIA-FE-BE-DB.md`
- `docs/30-ux-ui/flujos/TRACEABILITY-MATRIX.md`
- `orchestration/directivas/simco/SIMCO-WORK-ITEMS.md`
- `orchestration/agents/perfiles/_MAP.md`
