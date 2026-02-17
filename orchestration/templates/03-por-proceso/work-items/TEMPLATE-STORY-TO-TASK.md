# TEMPLATE: STORY -> TASK CAPVED

**Version:** 1.0.0  
**Fecha:** 2026-02-17  
**Uso:** convertir una User Story en una o más tareas técnicas CAPVED trazables.

---

## 1) Entrada (Story)

```yaml
story:
  id: "US-GAM-XXX-YY"
  epic_id: "EPIC-GAM-XXX"
  title: "{titulo}"
  priority: "P0|P1|P2|P3"
  acceptance_criteria:
    - "{AC-1}"
    - "{AC-2}"
  scope:
    - "backend|frontend|database|docs|devops"
```

## 2) Salida (Task metadata)

```yaml
task:
  id: "TASK-GAMILIT-XXX"
  type: "task|defect|spike|chore"
  story_id: "{US-ID}"
  scope:
    - "{backend|frontend|database|docs|devops}"
  mode: "FULL|QUICK|ANALYSIS"
  assignees:
    - "{perfil_agente}"
  status: "todo"
```

## 3) Mapeo de criterios Story -> Task

```yaml
criteria_mapping:
  - story_ac: "{AC-1}"
    task_deliverable: "{entregable tecnico}"
    validation: "{build|lint|test|validacion_doc}"
  - story_ac: "{AC-2}"
    task_deliverable: "{entregable tecnico}"
    validation: "{build|lint|test|validacion_doc}"
```

## 4) Fases CAPVED mínimas por task

```yaml
capved_required:
  c: "definir contexto y alcance"
  a: "analizar impacto y dependencias"
  p: "planificar subtareas y orden"
  v: "validar plan antes de ejecutar"
  e: "ejecutar cambios"
  d: "documentar evidencia y cierre"
```

## 5) Checklist de conversión

- [ ] `story_id` enlazado en task metadata.
- [ ] Criterios de aceptación mapeados a entregables técnicos.
- [ ] Scope técnico bien clasificado.
- [ ] Perfil/agente asignado.
- [ ] Salida CAPVED trazable en `orchestration/trazas`.
