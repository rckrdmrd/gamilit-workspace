# INDICE DE PROMPTS - TASK-2026-01-20-STUDENT-PORTAL-ANALYSIS

**Version:** 1.0.0
**Fecha:** 2026-01-20
**Proposito:** Documentar prompts usados para analisis y mejora continua

---

## Resumen de Prompts

| Archivo | Fase | Perfil | Tipo |
|---------|------|--------|------|
| PROMPT-EXPLORE-FRONTEND.md | Exploracion | Explore Agent | Investigacion |
| PROMPT-EXPLORE-BACKEND.md | Exploracion | Explore Agent | Investigacion |
| PROMPT-SUBTASK-1.2.md | FASE-1 | @PERFIL_BACKEND + @PERFIL_FRONTEND | Implementacion |
| PROMPT-SUBTASK-2.2.md | FASE-2 | @PERFIL_DOCUMENTATION | Documentacion |
| PROMPT-SUBTASK-2.3.md | FASE-2 | @PERFIL_TESTING | Planificacion |
| PROMPT-SUBTASK-3.1.md | FASE-3 | @PERFIL_ARCHITECT | Evaluacion |
| PROMPT-SUBTASK-4.1.md | FASE-4 | @PERFIL_DOCUMENTATION | Actualizacion |

---

## Estructura de Cada Prompt

Cada archivo de prompt sigue esta estructura:

```markdown
# PROMPT: [Nombre de la Subtarea]

**Perfil:** [Perfil(es) requerido(s)]
**Gap/Tipo:** [Gap relacionado o tipo de tarea]
**Tipo:** [Implementacion/Documentacion/Evaluacion/etc.]

---

## Prompt Enviado
[El prompt textual enviado al subagente]

---

## Contexto Adicional
[Informacion complementaria proporcionada]

---

## Resultado Obtenido
[Resumen del resultado y entregables]

---

## Uso en Mejora Continua
[Como reutilizar este prompt para tareas similares]
```

---

## Uso de Este Catalogo

### Para Tareas Similares

1. Identificar el tipo de tarea (exploracion, implementacion, documentacion, etc.)
2. Buscar prompt similar en este catalogo
3. Adaptar parametros especificos
4. Mantener estructura y validaciones

### Para Mejora de Directivas

1. Analizar patrones exitosos en prompts
2. Identificar secciones que siempre se incluyen
3. Proponer actualizacion de directivas SIMCO

### Para Onboarding

1. Usar prompts como ejemplos de comunicacion con subagentes
2. Mostrar nivel de detalle esperado
3. Ilustrar estructura de contexto

---

## Metricas de Prompts

| Metrica | Valor |
|---------|-------|
| Total de prompts documentados | 7 |
| Prompts de exploracion | 2 |
| Prompts de implementacion | 1 |
| Prompts de documentacion | 3 |
| Prompts de evaluacion | 1 |

---

## Recomendaciones

### Elementos Esenciales en Todo Prompt

1. **Perfil claro:** Indicar perfil(es) requerido(s)
2. **Contexto suficiente:** Background y estado actual
3. **Tarea especifica:** Que hacer paso a paso
4. **Archivos relevantes:** Rutas exactas a explorar/modificar
5. **Validacion:** Como verificar que se completo correctamente
6. **Commit message:** Formato esperado del commit

### Anti-patrones a Evitar

1. Prompts vagos sin archivos especificos
2. Falta de criterios de validacion
3. Omitir contexto de la tarea padre
4. No especificar entregables esperados

---

*Indice generado: 2026-01-20*
