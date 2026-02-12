# SIMCO: ORCHESTRATOR VALIDATION LOOP

**Version:** 1.0.0
**Sistema:** SIMCO v4.0
**Proposito:** Protocolo estandar de validacion post-subagente
**Fecha:** 2026-02-11

---

## PRINCIPIO

> Todo output de subagente (Claude, Gemini CLI, Trae, Windsurf) DEBE ser validado
> por el orquestador antes de declarar la tarea completada. La confianza ciega en
> output de agentes ha producido conteos fabricados, archivos vacios, y datos
> inconsistentes en produccion.

---

## PROTOCOLO DE 6 PASOS

### Paso 1: Output Existence

```yaml
VERIFICAR:
  - ¿El subagente retorno output? (no vacio, no 0-byte)
  - ¿El output file existe en disco? (para background agents)
  - Si output vacio o 0-byte: FAILED — rerun in foreground

EVIDENCIA_REAL:
  - Background agents on Windows: 30%+ return empty output files
  - Gemini CLI background: nearly 100% empty on Windows
  - Solution: always run critical tasks in foreground
```

### Paso 2: Filesystem Verify

```yaml
VERIFICAR:
  - ¿Los archivos que el agente dice haber creado EXISTEN en disco?
  - ¿Los archivos modificados tienen contenido no-vacio?
  - Usar: Glob para verificar existencia, Read para contenido

EVIDENCIA_REAL:
  - erp-core inventory YAMLs: agent claimed 149 tests, reality was 41
  - erp-core: agent claimed 480 frontend files, reality was 246
  - Solution: ALWAYS cross-validate with filesystem
```

### Paso 3: Content Validation

```yaml
VERIFICAR:
  - ¿El contenido cumple la especificacion de la tarea?
  - ¿No hay placeholders (// ..., /* ... */, TODO sin implementar)?
  - ¿El formato es correcto (YAML valido, MD con frontmatter)?
  - Usar: Grep para placeholders, Read para spot-check

CRITERIOS:
  - 0 placeholders permitidos
  - Formato consistente con estandares del proyecto
  - Contenido coherente (no texto lorem ipsum o repetido)
```

### Paso 4: Cross-Layer Coherence

```yaml
VERIFICAR:
  - ¿DDL ↔ Entity parity? (tablas = entities)
  - ¿Backend ↔ Frontend coherence? (endpoints consumidos existen)
  - ¿Docs ↔ Code alignment? (documentado = implementado)
  - ¿YAML tracking ↔ filesystem? (status reflects reality)

CUANDO_APLICA:
  - Siempre que la tarea toque multiples capas
  - Post-auditoria (verificar que correcciones no rompieron otra capa)
```

### Paso 5: Technical Validation

```yaml
VERIFICAR:
  - TypeScript: tsc --noEmit (si aplica)
  - Lint: eslint (si aplica)
  - Build: npm run build (si aplica)
  - Tests: npm test (si existen tests para el modulo)

CUANDO_APLICA:
  - Siempre que se modifique codigo fuente
  - NO aplica para cambios solo de documentacion/YAML

NOTA: Si el proyecto no compila antes de la tarea, documentar
      estado previo y no bloquear por errores pre-existentes
```

### Paso 6: Count Validation

```yaml
VERIFICAR:
  - ¿Conteos reportados por agente coinciden con filesystem?
  - Usar: find + wc o Glob para contar archivos reales
  - Comparar: agente dice N archivos → filesystem tiene N archivos

EVIDENCIA_REAL:
  - Gemini CLI reported 8 test files, reality was 55 (85% undercount)
  - Trading platform: 468 tasks marked completed, tracking said 0
  - Solution: NEVER trust agent counts without filesystem verification

TOLERANCIA:
  - Conteos exactos: 0% tolerancia (deben coincidir)
  - Si diferencia > 5%: NEEDS_RECOUNT
```

---

## VERDICTS

```yaml
VERDICTS:
  APPROVED:
    condicion: "6/6 pasos pasan"
    accion: "Marcar tarea completada, actualizar tracking"

  FAILED:
    condicion: "Paso 1 o 2 fallan (output no existe o archivos vacios)"
    accion: "Rerun subagente en foreground, NO continuar"

  PARTIAL:
    condicion: "Pasos 3-5 fallan parcialmente"
    accion: "Documentar gaps, crear subtareas de remediacion"

  NEEDS_RECOUNT:
    condicion: "Paso 6 falla (conteos no coinciden)"
    accion: "Re-contar con filesystem, actualizar reportes con datos reales"
```

---

## FLUJO INTEGRADO

```
Subagente completa tarea
         │
         ▼
    Paso 1: Output Existence
         │
    ┌────┴────┐
   FAIL     PASS
    │         │
    ▼         ▼
  FAILED  Paso 2: Filesystem Verify
              │
         ┌────┴────┐
        FAIL     PASS
         │         │
         ▼         ▼
       FAILED  Paso 3-5: Content + Coherence + Technical
                   │
              ┌────┴────┐
            FAIL     PASS
              │         │
              ▼         ▼
          PARTIAL  Paso 6: Count Validation
                       │
                  ┌────┴────┐
                FAIL     PASS
                  │         │
                  ▼         ▼
           NEEDS_RECOUNT  APPROVED
```

---

## SHORTCUTS (para tareas simples)

```yaml
SHORTCUT_DOCS_ONLY:
  descripcion: "Tarea solo modifica documentacion/YAML"
  pasos_requeridos: [1, 2, 3, 6]
  pasos_skip: [4, 5]

SHORTCUT_SINGLE_FILE:
  descripcion: "Tarea modifica 1 solo archivo"
  pasos_requeridos: [1, 2, 3, 5]
  pasos_skip: [4, 6]
```

---

## REFERENCIAS

| Documento | Proposito |
|-----------|-----------|
| `SIMCO-ORCHESTRATION-PATTERNS.md` | Patrones que usan este loop |
| `SIMCO-DELEGACION-PARALELA.md` | Protocolo de delegacion |
| `PROTOCOLO-HANDOFF.md` | Handoff entre agentes |
| `SIMCO-PLATFORM-CONSTRAINTS.md` | Restricciones de plataforma |

---

**Version:** 1.0.0 | **Sistema:** SIMCO v4.0 | **Tipo:** Directiva de Validacion
