---
name: simco-safe-edit
description: "Edicion segura con cambios minimos y sin placeholders"
version: 1.0.0
simco_source: orchestration/directivas/simco/SIMCO-EDICION-SEGURA.md
category: core
priority: P0
capved_required: false
agents_compatible:
  - claude-code
  - gemini-cli
  - windsurf
  - trae
dependencies: []
triggers:
  - on_file_edit
internal: true
estimated_tokens: 800
tags:
  - edicion
  - seguridad
  - calidad
input_schema:
  required:
    - target_files
    - change_goal
  optional:
    - coding_constraints
output_schema:
  success:
    - changed_files
    - lint_or_validation_status
  error:
    - error_code
    - error_message
contract_version: 1.0.0
---

# simco-safe-edit

## Proposito
Garantizar que toda edicion sea precisa, reversible y libre de placeholders o bloques incompletos.

## Cuando Usar
- Antes de modificar cualquier archivo en el repositorio.
- Cuando se refactoriza codigo con riesgo de regresion.

## Cuando NO Usar
- Si la tarea es solo lectura o analisis sin cambios.

## Instrucciones
### Paso 1: Verificar contexto y objetivo del archivo
Confirmar por que el archivo se toca y que cambio puntual se espera.

### Paso 2: Aplicar cambio minimo necesario
Editar solo el bloque necesario, conservando estilo, convenciones y coherencia del archivo.

### Paso 3: Verificar ausencia de side effects
Despues de aplicar el cambio, verificar que:
- Los imports del archivo siguen siendo validos (no se rompio ninguna referencia).
- Los exports del archivo siguen exponiendo la misma interfaz publica (a menos que el cambio lo requiera explicitamente).
- Las type signatures de funciones/metodos modificados son compatibles con los callers existentes.
- Si se renombro algo, verificar todas las referencias en el proyecto con busqueda global.

### Paso 4: Revisar patrones prohibidos
Comprobar que no se agreguen placeholders (`TODO` sin resolver, elipsis o codigo incompleto). Buscar activamente:
- `// ...` o `/* ... */` -- bloques omitidos
- `TODO` o `FIXME` sin ticket asociado
- Funciones vacias o con `throw new Error('Not implemented')`
- Comentarios tipo `// rest of the code` que ocultan contenido eliminado

### Paso 5: Evaluar tamano del diff
Si el diff total supera 50 lineas, considerar dividir en ediciones mas pequenas y verificables:
- Separar cambios estructurales (renaming, moves) de cambios logicos (nueva funcionalidad).
- Cada edicion parcial debe dejar el archivo en estado compilable.
- Verificar que cada edicion parcial pasa validacion antes de continuar.

### Paso 6: Validar impacto inmediato
Ejecutar validaciones basicas relacionadas al archivo editado:
- TypeScript: `npm run typecheck` o `npm run build` segun el proyecto.
- Lint: `npm run lint` para verificar estilo.
- Tests: Ejecutar tests del modulo afectado si existen.

## Manejo de Errores

| Escenario | Accion | Ejemplo |
|-----------|--------|---------|
| File not found | Verificar ruta, buscar archivo renombrado o movido, confirmar con usuario | Entity movida de `modules/old/` a `modules/new/` |
| Edit conflict (old_string no unico) | Proporcionar mas contexto en old_string para hacer match unico | Multiples `return null;` -> incluir funcion completa como contexto |
| Style violation | Corregir para seguir convencion del archivo existente (tabs vs spaces, semicolons) | Archivo usa 4 spaces pero editor inserto tabs -> corregir |
| Placeholder detected | Eliminar placeholder, implementar logica completa o marcar con ticket | `// TODO` sin implementar -> implementar o crear issue |
| Import break | Verificar path relativo, buscar re-exports, actualizar barrel files si aplica | Import de `./old-path` falla -> actualizar a `./new-path` |
| Diff too large | Dividir en ediciones incrementales, verificar compilacion entre cada una | 200 lineas cambiadas -> split en 4 ediciones de 50 |

## Formato de Salida

```yaml
safe_edit_result:
  changed_files:
    - path: "apps/backend/src/modules/gamification/services/shop.service.ts"
      lines_changed: 12
      change_type: "modification"
  lint_or_validation_status:
    typecheck: "pass"
    lint: "pass"
    tests: "pass" | "skipped"
  side_effects_checked: true
  placeholder_scan: "clean"
  diff_size_lines: 12
  warnings: []
```

## Checklist de Validacion
- [ ] El cambio es acotado al objetivo.
- [ ] No se introdujeron placeholders ni bloques incompletos.
- [ ] Se verifico ausencia de side effects (imports, exports, types).
- [ ] El archivo mantiene consistencia de estilo.
- [ ] El diff no supera 50 lineas por edicion (o fue dividido).
- [ ] La validacion minima paso (typecheck, lint, tests).

## Referencias
- `orchestration/directivas/simco/SIMCO-EDICION-SEGURA.md`
