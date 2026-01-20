# Indice de Prompts - TASK-2026-01-20-EXERCISES-VALIDATION

## Proposito

Esta carpeta contiene los prompts utilizados para los subagentes de la tarea de validacion de ejercicios M1-M5. Sirve para:

1. **Reproducibilidad** - Poder replicar la tarea con los mismos contextos
2. **Mejora Continua** - Analizar y mejorar los prompts para futuras tareas
3. **Documentacion** - Registrar exactamente que contexto recibio cada agente

---

## Prompts Disponibles

### Fase 1: Validacion de Componentes Compartidos

| Prompt | Perfil | Descripcion |
|--------|--------|-------------|
| [PROMPT-SUBTASK-1.1.md](./PROMPT-SUBTASK-1.1.md) | @PERFIL_FRONTEND | Validar SubmitExerciseButton en 30 ejercicios |
| [PROMPT-SUBTASK-1.2.md](./PROMPT-SUBTASK-1.2.md) | @PERFIL_FRONTEND | Validar Sistema de Hints/Ayudas |
| [PROMPT-SUBTASK-1.3.md](./PROMPT-SUBTASK-1.3.md) | @PERFIL_FRONTEND | Validar FeedbackModal y ExerciseFeedback |

### Fase 2: Validacion por Modulo

| Prompt | Perfil | Descripcion |
|--------|--------|-------------|
| [PROMPT-SUBTASK-2.1.md](./PROMPT-SUBTASK-2.1.md) | @PERFIL_FRONTEND + @PERFIL_BACKEND | Validar M1 Comprension Literal |
| [PROMPT-SUBTASK-2.2.md](./PROMPT-SUBTASK-2.2.md) | @PERFIL_FRONTEND | Validar M2 Comprension Inferencial |
| [PROMPT-SUBTASK-2.3.md](./PROMPT-SUBTASK-2.3.md) | @PERFIL_FRONTEND + @PERFIL_BACKEND | Validar M3 Comprension Critica |
| [PROMPT-SUBTASK-2.4.md](./PROMPT-SUBTASK-2.4.md) | @PERFIL_FRONTEND | Validar M4 Lectura Digital |
| [PROMPT-SUBTASK-2.5.md](./PROMPT-SUBTASK-2.5.md) | @PERFIL_FRONTEND + @PERFIL_BACKEND | Validar M5 Produccion Lectora |

### Fase 3: Documentacion de Integracion

| Prompt | Perfil | Descripcion |
|--------|--------|-------------|
| [PROMPT-SUBTASK-3.1.md](./PROMPT-SUBTASK-3.1.md) | @PERFIL_DOCUMENTATION | Documentar Flujo Envio Respuestas |
| [PROMPT-SUBTASK-3.2.md](./PROMPT-SUBTASK-3.2.md) | @PERFIL_DOCUMENTATION + @PERFIL_REQUIREMENTS | Documentar Ciclo Vida Estados |
| [PROMPT-SUBTASK-3.3.md](./PROMPT-SUBTASK-3.3.md) | @PERFIL_DOCUMENTATION | Crear Guia Patrones Componentes |

### Fase 4: Resolucion de Gaps Criticos

| Prompt | Perfil | Descripcion |
|--------|--------|-------------|
| [PROMPT-SUBTASK-4.1.md](./PROMPT-SUBTASK-4.1.md) | @PERFIL_FRONTEND + @PERFIL_BACKEND | Resolver GAP-EX-001 Emparejamiento |
| [PROMPT-SUBTASK-4.2.md](./PROMPT-SUBTASK-4.2.md) | @PERFIL_ARCHITECT | Documentar Arquitectura Dual Progreso |

### Fase 5: Actualizacion de Especificaciones

| Prompt | Perfil | Descripcion |
|--------|--------|-------------|
| [PROMPT-SUBTASK-5.1.md](./PROMPT-SUBTASK-5.1.md) | @PERFIL_DOCUMENTATION | Actualizar SPEC-MECANICAS |
| [PROMPT-SUBTASK-5.2.md](./PROMPT-SUBTASK-5.2.md) | @PERFIL_DOCUMENTATION | Crear Reporte Final Validacion |

---

## Estructura de Cada Prompt

Cada prompt sigue la estructura estandar:

```markdown
# PROMPT-SUBTASK-X.X

## Perfil Asignado
@PERFIL_XXX

## Objetivo
[Descripcion clara del objetivo]

## Contexto Necesario
[Lista de archivos y referencias]

## Instrucciones
[Pasos a seguir]

## Entregables Esperados
[Lista de archivos a crear/modificar]

## Criterios de Aceptacion
[Como validar que la tarea esta completa]
```

---

## Archivos de Contexto Comunes

Estos archivos son contexto compartido entre multiples prompts:

### Componentes Compartidos
- `/apps/frontend/src/shared/components/mechanics/SubmitExerciseButton.tsx`
- `/apps/frontend/src/shared/components/mechanics/FeedbackModal.tsx`
- `/apps/frontend/src/shared/components/mechanics/HintSystem.tsx`

### Hooks Compartidos
- `/apps/frontend/src/features/exercises/hooks/useExerciseSubmission.ts`
- `/apps/frontend/src/features/exercises/hooks/useExerciseRewards.ts`
- `/apps/frontend/src/features/exercises/hooks/useExerciseTimer.ts`

### Documentacion Existente
- `docs/90-transversal/mecanicas/SPEC-MECANICAS-M1-M3.md`
- `docs/90-transversal/mecanicas/SPEC-MECANICAS-M4.md`
- `docs/90-transversal/mecanicas/SPEC-MECANICAS-M5.md`
- `docs/95-guias-desarrollo/frontend/COMPONENTES-INVENTARIO.md`

### Gaps Identificados
- `orchestration/tareas/TASK-2026-01-20-EXERCISES-VALIDATION/README.md`
- `orchestration/tareas/TASK-2026-01-20-EXERCISES-VALIDATION/METADATA.yml`

---

## Notas de Uso

1. **Antes de ejecutar**: Leer el prompt completo y verificar que los archivos de contexto existen
2. **Durante ejecucion**: Seguir las instrucciones en orden
3. **Despues de ejecutar**: Verificar criterios de aceptacion y documentar resultados

---

*Ultima actualizacion: 2026-01-20*
