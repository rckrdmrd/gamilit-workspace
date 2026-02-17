# TEMPLATE: CLAUDE TASK TOOL (DELEGACION ESTRUCTURADA)

**Version:** 1.0.0  
**Fecha:** 2026-02-17  
**Uso:** delegar subtareas a subagentes de Claude Code con contrato explícito.

---

## 1) Entrada mínima al subagente

```yaml
subtask_id: "ST-XXX"
task_type: "analisis|implementacion|validacion"
objective: "{resultado esperado en 1-2 lineas}"
scope:
  include:
    - "{ruta/archivo_o_carpeta_1}"
    - "{ruta/archivo_o_carpeta_2}"
  exclude:
    - "{ruta fuera de alcance}"
constraints:
  - "NO salir del alcance"
  - "NO modificar archivos no listados"
acceptance_criteria:
  - "{criterio verificable 1}"
  - "{criterio verificable 2}"
```

## 2) Selección de modelo (por complejidad)

```yaml
complexity:
  low: "modelo rapido"
  medium: "modelo balanceado"
  high: "modelo de mayor razonamiento"
```

## 3) Contrato de salida obligatorio

```yaml
summary:
  - "{1-3 bullets ejecutivos}"
files_used:
  - path: "{ruta}"
    purpose: "lectura|edicion|evidencia"
findings:
  - severity: "critico|medio|menor"
    detail: "{hallazgo}"
    evidence: "{ruta o referencia}"
decisions:
  - decision: "{decision tomada}"
    rationale: "{motivo}"
next_step:
  - "{accion concreta}"
```

## 4) Anti-patrones

- Prompt ambiguo sin objetivo verificable.
- Pedir lectura masiva sin alcance.
- Retornar volcado de contenido en vez de resumen.
- Omitir criterios de aceptación.

---

## 5) Prompt base listo para usar

```markdown
Subtarea: {ST-XXX}
Objetivo: {objetivo}
Tipo: {analisis|implementacion|validacion}

Alcance permitido:
- {ruta1}
- {ruta2}

Restricciones:
- No salgas del alcance.
- No modifiques archivos fuera de la lista.

Criterios de aceptación:
- [ ] {criterio 1}
- [ ] {criterio 2}

Formato de salida obligatorio:
1. Resumen ejecutivo (1-3 bullets)
2. Archivos usados (path + propósito)
3. Hallazgos (severidad + evidencia)
4. Decisiones (decision + rationale)
5. Siguiente paso recomendado
```
