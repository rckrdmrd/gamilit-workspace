---
name: vercel-v0-dev
description: "Uso guiado de capacidades Vercel v0 para iteracion de UI en desarrollo"
version: 1.0.0
simco_source: docs/40-standards/ESTANDAR-SKILLS.md
category: community
priority: P1
capved_required: false
agents_compatible:
  - claude-code
  - gemini-cli
dependencies:
  - simco-task-execution
  - simco-safe-edit
triggers:
  - on_frontend_design_task
internal: false
estimated_tokens: 900
tags:
  - vercel
  - v0
  - frontend
input_schema:
  required:
    - ui_scope
    - acceptance_criteria
  optional:
    - design_references
output_schema:
  success:
    - proposed_components
    - adaptation_notes
  error:
    - error_code
    - error_message
contract_version: 1.0.0
---

# vercel-v0-dev

## Proposito
Acelerar prototipado de interfaces frontend manteniendo alineacion con estandares del proyecto.

## Cuando Usar
- En tareas de UI/componentes React.
- Para bosquejar variantes de interfaz antes de implementación final.

## Cuando NO Usar
- Para deploy de produccion.
- Para cambios backend o DDL.

## Prerequisitos
- `enable_vercel_dev_skills=true` en el registry.
- Criterios de UX claros para la tarea.

## Instrucciones
### Paso 1: Definir alcance de UI
Especificar componente/pagina, estados esperados y restricciones del diseño.

### Paso 2: Generar propuesta de interfaz
Usar output de v0 como propuesta inicial, no como version final directa.

### Paso 3: Adaptar al stack local
Ajustar componentes a convenciones React/Tailwind y estructura del proyecto.

### Paso 4: Validar consistencia
Verificar accesibilidad, naming y compatibilidad con rutas/hook existentes.

## Checklist de Validacion
- [ ] El resultado respeta el alcance de UI.
- [ ] Se adaptaron convenciones locales del proyecto.
- [ ] No se introdujeron dependencias no aprobadas.
- [ ] Se validaron estados basicos del componente.

## Referencias
- `docs/40-standards/ESTANDAR-SKILLS.md`
- `orchestration/inventarios/SKILLS-REGISTRY.yml`
