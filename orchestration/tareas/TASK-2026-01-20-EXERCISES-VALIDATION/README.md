# TASK-2026-01-20-EXERCISES-VALIDATION

## Validacion de Funcionamiento de Ejercicios M1-M5 - GAMILIT

**Estado:** EN PROGRESO (Fase Analisis)
**Prioridad:** P0
**Creado:** 2026-01-20
**Metodologia:** CAPVED

---

## Resumen Ejecutivo

Tarea de validacion exhaustiva del funcionamiento de cada ejercicio dentro de los 5 modulos (M1-M5), verificando que componentes compartidos (botones, hints, acciones) esten correctamente integrados y documentados.

### Metricas del Analisis

| Metrica | Valor |
|---------|-------|
| Ejercicios analizados | 30 |
| Ejercicios auxiliares | 4 |
| Modulos cubiertos | 5 |
| Componentes compartidos | 15 |
| Hooks compartidos | 6 |
| Gaps identificados | 10 |
| Gaps criticos | 4 |
| Subtareas planificadas | 12 |
| Horas estimadas | 40h |

---

## Estructura de Carpeta

```
TASK-2026-01-20-EXERCISES-VALIDATION/
├── README.md           <- Este archivo
├── METADATA.yml        <- Metadatos de la tarea
├── SUBTASKS.yml        <- Plan de subtareas CAPVED
└── prompts/            <- Prompts de subagentes (a crear)
```

---

## Gaps Identificados

### Criticos (P0)

| ID | Titulo | Impacto |
|----|--------|---------|
| GAP-EX-001 | Emparejamiento sin envio a backend | Progreso no se registra |
| GAP-EX-002 | Progreso no actualiza en tiempo real | Sin reconocimiento inmediato |
| GAP-EX-003 | Respuestas abiertas no visibles en Teacher Portal | Imposible evaluar |
| GAP-EX-004 | Multimedia no reproducible en Teacher Portal | Imposible evaluar M5 |

### Medios (P1)

| ID | Titulo |
|----|--------|
| GAP-EX-005 | Rubrica sin estructura formal |
| GAP-EX-006 | Validacion semantica faltante |
| GAP-EX-007 | Mecanicas M4 removidas sin documentar |
| GAP-EX-008 | Documentacion de integracion faltante |

### Menores (P2)

| ID | Titulo |
|----|--------|
| GAP-EX-009 | Alternativas de respuesta no documentadas |
| GAP-EX-010 | Estados de validacion ambiguos |

---

## Plan de Ejecucion

### FASE 1: Validacion de Componentes Compartidos (P0)
- SUBTASK-1.1: Validar SubmitExerciseButton en todos los ejercicios (3h)
- SUBTASK-1.2: Validar Sistema de Hints/Ayudas (2h)
- SUBTASK-1.3: Validar FeedbackModal y ExerciseFeedback (2h)

### FASE 2: Validacion por Modulo (P1)
- SUBTASK-2.1: Validar Modulo 1 - Comprension Literal (4h)
- SUBTASK-2.2: Validar Modulo 2 - Comprension Inferencial (3h)
- SUBTASK-2.3: Validar Modulo 3 - Comprension Critica (4h)
- SUBTASK-2.4: Validar Modulo 4 - Lectura Digital (3h)
- SUBTASK-2.5: Validar Modulo 5 - Produccion Lectora (4h)

### FASE 3: Documentacion de Integracion (P1)
- SUBTASK-3.1: Documentar Flujo de Envio de Respuestas (3h)
- SUBTASK-3.2: Documentar Ciclo de Vida de Estados (2h)
- SUBTASK-3.3: Crear Guia de Patrones de Componentes (3h)

### FASE 4: Resolucion de Gaps Criticos (P0)
- SUBTASK-4.1: Resolver GAP-EX-001 - Emparejamiento (2h)
- SUBTASK-4.2: Documentar Arquitectura Dual de Progreso (2h)

### FASE 5: Actualizacion de Especificaciones (P2)
- SUBTASK-5.1: Actualizar SPEC-MECANICAS con hallazgos (2h)
- SUBTASK-5.2: Crear Reporte Final de Validacion (2h)

---

## Componentes Compartidos Identificados

### Botones
| Componente | Ruta | Uso |
|------------|------|-----|
| SubmitExerciseButton | `shared/components/mechanics/` | Envio de respuestas |
| DetectiveButton | `shared/components/base/` | Botones estilizados |

### Feedback
| Componente | Ruta | Uso |
|------------|------|-----|
| ExerciseFeedback | `features/exercises/components/` | Feedback inline |
| FeedbackModal | `shared/components/mechanics/` | Modal con confetti |
| CompletionModal | `apps/student/components/exercise/` | Modal de finalizacion |

### Hints
| Componente | Ruta | Uso |
|------------|------|-----|
| HintModal | `apps/student/components/exercise/` | Pistas con costo ML |
| HintSystem | `shared/components/mechanics/` | Pistas sin costo |

### Hooks
| Hook | Ruta | Uso |
|------|------|-----|
| useExerciseSubmission | `features/exercises/hooks/` | Envio seguro |
| useExerciseTimer | `features/exercises/hooks/` | Timer |
| useExerciseRewards | `features/exercises/hooks/` | Recompensas |
| useExercisePowerUps | `apps/student/hooks/` | Power-ups |
| useExerciseAutoSave | `apps/student/hooks/` | Auto-guardado |
| useExerciseState | `apps/student/hooks/` | Estado local |

---

## Ejercicios por Modulo

### M1 - Comprension Literal (7)
- Crucigrama, VerdaderoFalso, Emparejamiento, SopaLetras
- CompletarEspacios, MapaConceptual, Timeline

### M2 - Comprension Inferencial (6)
- DetectiveTextual, ConstruccionHipotesis, PrediccionNarrativa
- PuzzleContexto, RuedaInferencias, LecturaInferencial

### M3 - Comprension Critica (5)
- TribunalOpiniones, DebateDigital, AnalisisFuentes
- PodcastArgumentativo, MatrizPerspectivas

### M4 - Lectura Digital (5)
- VerificadorFakeNews, InfografiaInteractiva, QuizTikTok
- NavegacionHipertextual, AnalisisMemes

### M5 - Produccion Lectora (3)
- DiarioMultimedia, ComicDigital, VideoCarta

### Auxiliares (4)
- ComprensionAuditiva, CollagePrensa, TextoEnMovimiento, CallToAction

---

## Agentes Requeridos

| Fase | Perfil |
|------|--------|
| 1.1, 1.2, 1.3, 2.1-2.5 | @PERFIL_FRONTEND |
| 2.1, 2.3, 2.5 | @PERFIL_BACKEND (adicional) |
| 3.1, 3.2, 3.3, 5.1, 5.2 | @PERFIL_DOCUMENTATION |
| 4.2 | @PERFIL_ARCHITECT |
| 3.2 | @PERFIL_REQUIREMENTS |

---

## Referencias

- [Tarea Relacionada: Student Portal Analysis](../TASK-2026-01-20-STUDENT-PORTAL-ANALYSIS/)
- [SPEC Mecanicas M1-M3](../../analisis/../../../docs/90-transversal/mecanicas/SPEC-MECANICAS-M1-M3.md)
- [SPEC Mecanicas M4](../../analisis/../../../docs/90-transversal/mecanicas/SPEC-MECANICAS-M4.md)
- [SPEC Mecanicas M5](../../analisis/../../../docs/90-transversal/mecanicas/SPEC-MECANICAS-M5.md)
- [Analisis Previo M3-M5](../../analisis/ANALISIS-VALIDACION-EJERCICIOS-M3-M5-2026-01-08.md)
- [Inventario de Componentes](../../../docs/95-guias-desarrollo/frontend/COMPONENTES-INVENTARIO.md)

---

*Ultima actualizacion: 2026-01-20*
