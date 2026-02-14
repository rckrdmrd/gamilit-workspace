# TEMPLATE: INDICE DE USER STORY

**Version:** 1.0.0
**Fecha:** 2026-02-09
**Uso:** Indice de tareas dentro de una carpeta de User Story
**Ubicacion destino:** `projects/{p}/docs/10-requirements/epics/EPIC-{ID}/US-{ID}/_INDEX.md`
**ADR:** [ADR-0020](../../docs/90-adr/ADR-0020-jerarquia-anidada-work-items.md)

---

# US-{ID} — Indice de Tareas

> {Titulo breve de la US}

**Definicion:** [US-{ID}.md](./US-{ID}.md)
**Epic:** [EPIC-{ID}](../EPIC.md)
**Tracking:** [US-{ID}.yml]({path-relativo}/orchestration/work-items/stories/US-{ID}.yml)

---

## Tareas

| # | Task | Titulo | Capa | Subtasks | Estado |
|---|------|--------|------|----------|--------|
| 1 | [TASK-{MODULE}-{NNN}-F0-DATABASE](./TASK-{MODULE}-{NNN}-F0-DATABASE/) | {titulo} | DATABASE | {N} | pendiente |
| 2 | [TASK-{MODULE}-{NNN}-F1-BACKEND](./TASK-{MODULE}-{NNN}-F1-BACKEND/) | {titulo} | BACKEND | {N} | pendiente |
| 3 | [TASK-{MODULE}-{NNN}-F2-FRONTEND](./TASK-{MODULE}-{NNN}-F2-FRONTEND/) | {titulo} | FRONTEND | {N} | pendiente |
| 4 | [TASK-{MODULE}-{NNN}-F4-TEST](./TASK-{MODULE}-{NNN}-F4-TEST/) | {titulo} | TEST | {N} | pendiente |

---

## Secuencia de Ejecucion

```
TASK-{MODULE}-{NNN}-F0-DATABASE
    ↓
TASK-{MODULE}-{NNN}-F1-BACKEND
    ↓
TASK-{MODULE}-{NNN}-F2-FRONTEND
    ↓
TASK-{MODULE}-{NNN}-F4-TEST
```

---

*Indice generado: {YYYY-MM-DD}*
*ADR: ADR-0020 (DEC-ANID-009/012)*
