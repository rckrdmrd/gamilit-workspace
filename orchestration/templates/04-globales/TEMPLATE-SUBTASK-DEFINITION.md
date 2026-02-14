# TEMPLATE: DEFINICION DE SUBTAREA

**Version:** 1.0.0
**Fecha:** 2026-02-09
**Uso:** Definicion de subtarea dentro de una carpeta de tarea
**Ubicacion destino:** `projects/{p}/docs/10-requirements/epics/EPIC-{ID}/US-{ID}/TASK-{NNN}-{slug}/SUBTASK-{NNN}-{slug}.md`
**ADR:** [ADR-0020](../../docs/90-adr/ADR-0020-jerarquia-anidada-work-items.md)

---

# SUBTASK-{NNN}: {Titulo de la Subtarea}

## Metadatos

| Campo | Valor |
|-------|-------|
| **Subtask ID** | SUBTASK-{NNN} |
| **Task** | TASK-{NNN} |
| **User Story** | US-{ID} |
| **Capa** | database / backend / frontend / testing |
| **SP Estimados** | {SP} |
| **Estado** | pendiente / en-progreso / completada |

---

## Descripcion

{Descripcion especifica de lo que se debe implementar. Suficiente detalle para
que un agente pueda ejecutar sin ambiguedad.}

---

## Artefactos

| Tipo | Ruta | Accion |
|------|------|--------|
| {tipo} | {ruta relativa} | crear / modificar |

---

## Criterios de Aceptacion

- [ ] {criterio especifico 1}
- [ ] {criterio especifico 2}

---

*Template: TEMPLATE-SUBTASK-DEFINITION.md v1.0.0*
*Sistema: SIMCO v4.0.0 + CAPVED*
*ADR: ADR-0020 (DEC-ANID-011)*
