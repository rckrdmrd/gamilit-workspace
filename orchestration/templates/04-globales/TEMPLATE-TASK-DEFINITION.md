# TEMPLATE: DEFINICION DE TAREA

**Version:** 2.0.0
**Fecha:** 2026-02-10
**Uso:** Definicion de tarea anidada dentro de una User Story
**Ubicacion destino:** `projects/{p}/docs/10-requirements/epics/EPIC-{ID}/US-{ID}/TASK-{MODULE}-{NNN}-F{N}-{CAPA}/TASK-{MODULE}-{NNN}-F{N}-{CAPA}.md`
**ADR:** [ADR-0020](../../docs/90-adr/ADR-0020-jerarquia-anidada-work-items.md) (DEC-ANID-010/012)
**Convencion:** [CONVENCION-NAMING-TASKS.md v2.0.0](./CONVENCION-NAMING-TASKS.md)

---

# TASK-{MODULE}-{NNN}-F{N}-{CAPA}: {Titulo de la Tarea}

## Metadatos

| Campo | Valor |
|-------|-------|
| **Task ID** | TASK-{MODULE}-{NNN}-F{N}-{CAPA} |
| **User Story** | US-{ID} |
| **Epic** | EPIC-{ID} |
| **Capa** | DATABASE / BACKEND / FRONTEND / TEST / INTEGRATION |
| **Tipo** | implementation / configuration / test / documentation |
| **Prioridad** | P0 / P1 / P2 / P3 |
| **SP Estimados** | {SP} |
| **Estado** | pendiente / en-progreso / completada |
| **Depende de** | TASK-{prev} / — |

---

## Descripcion

{Que se debe hacer y por que. Contexto suficiente para que un agente pueda ejecutar
esta tarea de manera autonoma. 2-3 parrafos.}

---

## Alcance

- {item de alcance 1}
- {item de alcance 2}
- {item de alcance 3}

---

## Artefactos Esperados

| Tipo | Ruta Relativa | Accion |
|------|---------------|--------|
| {entity/controller/page/schema/test} | {ruta desde raiz del proyecto} | crear / modificar |

---

## Criterios de Aceptacion

- [ ] {criterio 1}
- [ ] {criterio 2}
- [ ] {criterio 3}
- [ ] Build pasa sin errores (si aplica)
- [ ] Lint pasa sin errores (si aplica)

---

## Subtareas (si aplica)

| # | Subtask ID | Titulo | Archivo |
|---|-----------|--------|---------|
| 1 | SUBTASK-{MODULE}-{NNN}-F{N}-01 | {titulo} | [SUBTASK-{MODULE}-{NNN}-F{N}-01-{slug}.md](./SUBTASK-{MODULE}-{NNN}-F{N}-01-{slug}.md) |
| 2 | SUBTASK-{MODULE}-{NNN}-F{N}-02 | {titulo} | [SUBTASK-{MODULE}-{NNN}-F{N}-02-{slug}.md](./SUBTASK-{MODULE}-{NNN}-F{N}-02-{slug}.md) |

---

## Notas

- {nota tecnica o consideracion adicional}

---

*Template: TEMPLATE-TASK-DEFINITION.md v2.0.0*
*Sistema: SIMCO v4.0.0 + CAPVED*
*ADR: ADR-0020 (DEC-ANID-010/012)*
