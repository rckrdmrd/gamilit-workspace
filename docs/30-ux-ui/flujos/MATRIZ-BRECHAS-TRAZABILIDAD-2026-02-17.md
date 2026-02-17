# Matriz de Brechas de Trazabilidad

**Version:** 1.0.0  
**Fecha:** 2026-02-17  
**Estado:** Activo

---

## Objetivo

Registrar brechas entre documentacion de procesos/flujos y planeacion ejecutable para su cierre controlado en backlog.

---

## Matriz de brechas

| Gap ID | Tipo | Evidencia | Impacto | Nivel recomendado | Prioridad |
|--------|------|-----------|---------|-------------------|-----------|
| GAP-TRZ-001 | Colision de identificador de flujo | `FL-TCH-04` duplicado en `COBERTURA-TOTAL-PROCESOS.md` | Ambiguedad en trazabilidad y reportes | Task inmediata + Story de normalizacion | P0 |
| GAP-TRZ-002 | Flujos sin documento dedicado por ID | `FL-STU-05`, `FL-STU-06`, `FL-SHR-02` referencian documentos compartidos | Cobertura no atomica por flujo | Story de modelado documental | P1 |
| GAP-TRZ-003 | Diferencia cobertura declarada vs artefactos | 43 filas `FL-*` vs 39 `FLUJO-*.md` | Riesgo de sobreestimar completitud | Task de reconciliacion + validacion automatizada | P1 |
| GAP-TRZ-004 | Estandar de template aplicado parcialmente | 14 flujos cumplen encabezados completos del template | Calidad heterogenea, menor mantenibilidad | Epic de normalizacion por oleadas | P1 |
| GAP-TRZ-005 | Mapeo no explicito EPIC-WS -> EPIC-GAM | `orchestration/scrum/BACKLOG.yml` y `orchestration/work-items/epics/_INDEX.yml` usan taxonomias distintas | Doble planeacion sin puente formal | Story de mapeo operativo-funcional | P1 |
| GAP-TRZ-006 | Backend social sin integracion FE completa | Nota en cobertura total: 40 endpoints social backend-only | Deuda funcional y brecha de experiencia | Epic funcional + tasks FE/BFF | P1 |
| GAP-TRZ-007 | Falta de campo obligatorio ADR/skills/patrones en templates | Templates de EPIC/US/TASK no fuerzan referencia sistematica | Mejora tecnica no trazable por item | Tasks de estandarizacion de templates | P0 |
| GAP-TRZ-008 | Falta de ciclo operativo de mantenimiento formalizado | No existe rutina unica de auditoria y cierre de trazabilidad por sprint | Degradacion progresiva de calidad documental | Story de gobernanza continua | P1 |

---

## Priorizacion por fase

### Fase inmediata (P0)

- GAP-TRZ-001
- GAP-TRZ-007

### Fase corta (P1)

- GAP-TRZ-002
- GAP-TRZ-003
- GAP-TRZ-004
- GAP-TRZ-005
- GAP-TRZ-006
- GAP-TRZ-008

---

## Relacion con backlog de mejora

Brechas vinculadas a `EPIC-WS-006` (creada para esta iniciativa de trazabilidad y calidad de planeacion) y a items nuevos `TRZ-*` dentro de `orchestration/scrum/BACKLOG.yml`.

---

## Referencias

- `docs/30-ux-ui/flujos/AUDITORIA-FASE1-CALIDAD-FLUJOS-2026-02-17.md`
- `docs/30-ux-ui/flujos/COBERTURA-TOTAL-PROCESOS.md`
- `docs/30-ux-ui/flujos/TRACEABILITY-MATRIX.md`
- `orchestration/scrum/BACKLOG.yml`
- `orchestration/work-items/epics/_INDEX.yml`
