# PLAN DE IMPLEMENTACIÓN: Integración Ejercicios M3-M5

**TASK-ID:** TASK-2026-01-19-010
**Fecha:** 2026-01-19
**Estado:** EN PLANEACIÓN
**Prioridad:** P1 (Alta)

---

## 1. CONTEXTO

### 1.1 Objetivo
Integrar correctamente el guardado de respuestas, visualización en teacher/reviews y gamificación para todos los ejercicios de los módulos 3, 4 y 5.

### 1.2 Referencia Funcional
El **Ejercicio 1 del Módulo 3 (Análisis de Fuentes)** ya funciona correctamente:
- Guarda respuestas en formato `{ ranking: string[] }`
- Se integra con `TeacherReviewPanelPage`
- El maestro puede calificar y las recompensas se distribuyen

### 1.3 Estado Actual del Sistema

| Componente | Estado | Notas |
|------------|--------|-------|
| Backend - ExerciseSubmission | ✅ Funcional | Detecta `requires_manual_grading` |
| Trigger BD - ManualReview | ✅ Funcional | Crea review automáticamente |
| Frontend - submitExercise() | ✅ Funcional | Usado por M3 |
| Frontend - useExerciseSubmission | ✅ Funcional | Usado por M4-M5 |
| Teacher - ReviewPanelPage | ✅ Funcional | Lista y detalle de reviews |
| Teacher - ReviewDetail | ✅ Funcional | Calificación con rúbrica |
| ExerciseContentRenderer | ⚠️ Genérico | Necesita renderers específicos |
| Gamificación | ✅ Funcional | Se activa al calificar |

---

## 2. ANÁLISIS POR EJERCICIO

### 2.1 MÓDULO 3 - Pensamiento Crítico (5 ejercicios)

| # | Ejercicio | Formato Respuesta | Renderer | Estado |
|---|-----------|-------------------|----------|--------|
| 1 | Análisis de Fuentes | `{ ranking: string[] }` | TextResponse | ✅ OK |
| 2 | Matriz Perspectivas | `{ questions: { q1, q2, q3 } }` | TextResponse | ⚠️ Revisar |
| 3 | Debate Digital | `{ position, response, arguments[], messageCount }` | TextResponse | ⚠️ Revisar |
| 4 | Podcast Argumentativo | `{ topicId, script, audioUrl? }` | Podcast | ✅ OK |
| 5 | Tribunal Opiniones | `{ evaluations: [{ statementId, classification, verdict, justification? }] }` | TextResponse | ⚠️ Revisar |

### 2.2 MÓDULO 4 - Alfabetización Digital (5 ejercicios)

| # | Ejercicio | Formato Respuesta | Renderer | Estado |
|---|-----------|-------------------|----------|--------|
| 1 | Verificador Fake News | `{ claims_verified[], verifiedClaims[], metadata }` | Multimedia | ⚠️ Revisar |
| 2 | Quiz TikTok | `{ answers[], swipeHistory[], score }` | Multimedia | ⚠️ Revisar |
| 3 | Navegación Hipertextual | `{ path[], information_found, metadata }` | Multimedia | ⚠️ Revisar |
| 4 | Análisis de Memes | `{ annotations[], analysis, metadata }` | Multimedia | ⚠️ Revisar |
| 5 | Infografía Interactiva | `{ answers, sections_explored[], metadata }` | Multimedia | ⚠️ Revisar |

### 2.3 MÓDULO 5 - Producción Creativa (3 ejercicios)

| # | Ejercicio | Formato Respuesta | Renderer | Estado |
|---|-----------|-------------------|----------|--------|
| 1 | Diario Multimedia | `{ entries[], totalEntries, totalWords, metadata }` | Multimedia | ⚠️ Revisar |
| 2 | Cómic Digital | `{ panels[], metadata }` | Multimedia | ⚠️ Revisar |
| 3 | Video Carta | `{ video_url, sections[], metadata }` | Multimedia | ⚠️ Revisar |

---

## 3. SUBTAREAS DE IMPLEMENTACIÓN

### FASE 1: Renderers Específicos para Teacher Review (P1)

#### SUBTASK-001: Crear Renderer para Análisis de Fuentes
- **Archivo:** `ExerciseContentRenderer.tsx`
- **Objetivo:** Mostrar ranking de fuentes de forma visual (1º, 2º, 3º...)
- **Formato:** `{ ranking: ["src-3", "src-1", "src-2"] }`
- **Validación:** Verificar integración con ReviewDetail

#### SUBTASK-002: Crear Renderer para Matriz de Perspectivas
- **Archivo:** `ExerciseContentRenderer.tsx`
- **Objetivo:** Mostrar preguntas y respuestas en formato estructurado
- **Formato:** `{ questions: { q1: "respuesta1", q2: "respuesta2", q3: "respuesta3" } }`

#### SUBTASK-003: Crear Renderer para Debate Digital
- **Archivo:** `ExerciseContentRenderer.tsx`
- **Objetivo:** Mostrar posición, argumentos y historial del debate
- **Formato:** `{ position, response, arguments[], messageCount }`

#### SUBTASK-004: Crear Renderer para Tribunal de Opiniones
- **Archivo:** `ExerciseContentRenderer.tsx`
- **Objetivo:** Mostrar evaluaciones de afirmaciones con clasificación y veredicto
- **Formato:** `{ evaluations: [{ statementId, classification, verdict, justification? }] }`

#### SUBTASK-005: Crear Renderer para Verificador Fake News
- **Archivo:** `ExerciseContentRenderer.tsx`
- **Objetivo:** Mostrar claims verificados con evidencia
- **Formato:** `{ claims_verified[], verifiedClaims[], metadata }`

#### SUBTASK-006: Crear Renderer para Quiz TikTok
- **Archivo:** `ExerciseContentRenderer.tsx`
- **Objetivo:** Mostrar respuestas con historial de swipes
- **Formato:** `{ answers[], swipeHistory[], score }`

#### SUBTASK-007: Crear Renderer para Navegación Hipertextual
- **Archivo:** `ExerciseContentRenderer.tsx`
- **Objetivo:** Mostrar camino de navegación e información encontrada
- **Formato:** `{ path[], information_found, metadata }`

#### SUBTASK-008: Crear Renderer para Análisis de Memes
- **Archivo:** `ExerciseContentRenderer.tsx`
- **Objetivo:** Mostrar anotaciones sobre el meme
- **Formato:** `{ annotations[], analysis, metadata }`

#### SUBTASK-009: Crear Renderer para Infografía Interactiva
- **Archivo:** `ExerciseContentRenderer.tsx`
- **Objetivo:** Mostrar secciones exploradas y respuestas
- **Formato:** `{ answers, sections_explored[], metadata }`

#### SUBTASK-010: Crear Renderer para Diario Multimedia
- **Archivo:** `ExerciseContentRenderer.tsx`
- **Objetivo:** Mostrar entradas del diario con contenido y mood
- **Formato:** `{ entries[], totalEntries, totalWords, metadata }`

#### SUBTASK-011: Crear Renderer para Cómic Digital
- **Archivo:** `ExerciseContentRenderer.tsx`
- **Objetivo:** Mostrar paneles del cómic con diálogos
- **Formato:** `{ panels[], metadata }`

#### SUBTASK-012: Crear Renderer para Video Carta
- **Archivo:** `ExerciseContentRenderer.tsx`
- **Objetivo:** Mostrar video y secciones completadas
- **Formato:** `{ video_url, sections[], metadata }`

### FASE 2: Validación de Integración (P1)

#### SUBTASK-013: Test de Flujo Completo M3
- Crear submission desde cada ejercicio M3
- Verificar aparece en TeacherReviewPanel
- Verificar ReviewDetail muestra contenido correcto
- Calificar y verificar gamificación

#### SUBTASK-014: Test de Flujo Completo M4
- Igual que SUBTASK-013 para M4

#### SUBTASK-015: Test de Flujo Completo M5
- Igual que SUBTASK-013 para M5

### FASE 3: Correcciones de Compatibilidad (P2)

#### SUBTASK-016: Normalizar Formato de Respuestas
- Verificar que todos los ejercicios envían en formato correcto
- Corregir si hay discrepancias entre hook y función directa

#### SUBTASK-017: Sincronizar Tipos TypeScript
- Crear/actualizar tipos en `exercise-submission.types.ts`
- Asegurar compatibilidad frontend-backend

### FASE 4: Documentación (P2)

#### SUBTASK-018: Documentar Formatos de Respuesta
- Crear referencia de formatos por ejercicio
- Actualizar inventarios

---

## 4. ORDEN DE EJECUCIÓN

```
┌─────────────────────────────────────────────────────────────────────┐
│ FASE 1: Renderers Específicos                                       │
│ SUBTASK-001 → SUBTASK-012 (en paralelo por módulo)                 │
│                                                                     │
│ M3: 001, 002, 003, 004 (en paralelo)                               │
│ M4: 005, 006, 007, 008, 009 (en paralelo)                          │
│ M5: 010, 011, 012 (en paralelo)                                    │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ FASE 2: Validación de Integración                                   │
│ SUBTASK-013 → SUBTASK-014 → SUBTASK-015 (secuencial)               │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ FASE 3: Correcciones (si aplica)                                    │
│ SUBTASK-016, SUBTASK-017 (según hallazgos)                         │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ FASE 4: Documentación                                               │
│ SUBTASK-018                                                         │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 5. CRITERIOS DE ACEPTACIÓN

### Por Ejercicio:
1. [ ] Respuestas se guardan correctamente en BD
2. [ ] Aparece en TeacherReviewPanel
3. [ ] ReviewDetail muestra respuestas legibles
4. [ ] Maestro puede calificar con rúbrica
5. [ ] Gamificación se activa al calificar

### Global:
1. [ ] Build pasa sin errores
2. [ ] Lint pasa sin errores
3. [ ] Tests existentes pasan
4. [ ] Documentación actualizada

---

## 6. DEPENDENCIAS

### Técnicas:
- `ExerciseContentRenderer.tsx` (archivo principal a modificar)
- `ReviewDetail.tsx` (consumidor del renderer)
- `manualReviewApi.ts` (API de reviews)

### Datos:
- Ejercicios con `requires_manual_grading = true` en BD
- Trigger `trg_create_manual_review_on_submission` activo

---

## 7. RIESGOS Y MITIGACIÓN

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Formato de respuesta inconsistente | Media | Alto | Validar con Zod antes de enviar |
| Renderer no cubre todos los casos | Media | Medio | Usar FallbackRenderer mejorado |
| Trigger BD no se ejecuta | Baja | Alto | Verificar logs de BD |

---

## 8. PRÓXIMOS PASOS

1. **Aprobación del plan** por el usuario
2. **Priorizar FASE 1** - Renderers específicos
3. **Ejecutar en paralelo** por módulo
4. **Validar** después de cada fase

---

*Generado según metodología CAPVED del sistema SIMCO*
