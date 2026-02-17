# SIMCO: AUDITORIA DE FLUJOS END-TO-END

**Version:** 1.0.0  
**Fecha:** 2026-02-17  
**Alias sugerido:** @SIMCO-AUDITORIA-FLUJOS

---

## Proposito

Estandarizar como los agentes ejecutan auditorias de consistencia por flujo:

- Frontend (accion real)
- Backend (endpoint y reglas)
- Datos (persistencia y estado)
- Documentacion (trazabilidad y evidencia)

---

## Cuándo aplicar

Aplicar esta directiva cuando una tarea incluya:

- "auditoria de flujos", "analisis end-to-end"
- "validar compra/recompensas/calificacion"
- "comparar analisis vs integracion documental"

---

## Procedimiento operativo

1. Cargar base documental:
   - `docs/30-ux-ui/flujos/README.md`
   - `docs/30-ux-ui/flujos/TRACEABILITY-MATRIX.md`
   - `docs/30-ux-ui/flujos/AUDITORIA-CONSISTENCIA-FE-BE-DB.md`
2. Ejecutar checklist `FE-01..DOC-02` por flujo.
3. Registrar hallazgos en `orchestration/tareas/TASK-*/01-HALLAZGOS.md`.
4. Convertir gaps en issues implementables en `02-PLAN-IMPLEMENTACION-ISSUES.md`.
5. Asignar perfiles responsables en `03-ASIGNACION-AGENTES-Y-ACCESO.md`.
6. Actualizar:
   - `docs/30-ux-ui/flujos/AUDITORIA-P0-RESULTADOS.md` (o equivalente por oleada)
   - `docs/30-ux-ui/flujos/VALIDACION-ANALISIS-VS-INTEGRACION.md`
   - `docs/30-ux-ui/flujos/COBERTURA-TOTAL-PROCESOS.md` (cuando el alcance sea total)

---

## Asignacion recomendada de perfiles

- Analisis y normalizacion documental: `@PERFIL_DOCS_MAINTAINER`
- Correcciones backend: `@PERFIL_BACKEND_NESTJS`
- Consistencia transaccional/BD: `@PERFIL_DATABASE_POSTGRESQL`
- Coordinacion multi-capa: `@PERFIL_ORQUESTADOR`

---

## Evidencia minima obligatoria

1. Documento de resultados de oleada (P0/P1/P2).
2. Tarea en `orchestration/tareas/` con 3 archivos canonicos.
3. Referencias cruzadas activas desde docs y directivas.

---

## Implementacion actual de referencia

- `docs/30-ux-ui/flujos/AUDITORIA-P0-RESULTADOS.md`
- `orchestration/tareas/TASK-2026-02-17-AUDITORIA-FLUJOS-P0/`
- `docs/30-ux-ui/flujos/AUDITORIA-RESIDUAL-FULL.md`
- `orchestration/tareas/TASK-2026-02-17-CIERRE-RIESGOS-RESIDUALES-FULL/`
