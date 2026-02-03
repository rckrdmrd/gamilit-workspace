# ANALISIS DETALLADO: EJERCICIOS M3-M5, PORTAL TEACHER Y SISTEMA DE RECOMPENSAS

**Agente:** Claude Opus 4.5 (Orchestrator Agent)
**Fecha:** 2026-01-07
**Version:** 1.0
**Estado:** FASE 2 - ANALISIS DETALLADO

---

## RESUMEN EJECUTIVO

Este documento presenta el analisis exhaustivo de la funcionalidad de ejercicios de los modulos 3, 4 y 5, su integracion con el portal Teacher (pagina review), el sistema de calificacion y asignacion de recompensas post-evaluacion del maestro.

### Hallazgos Principales

| Categoria | Estado | Observaciones |
|-----------|--------|---------------|
| Documentacion M3 | CORREGIDO | CORR-M3-001-002 aplicada - seeds actualizados |
| Documentacion M4 | INCONSISTENTE | Discrepancia entre RF-M4-001 y tipos reales |
| Documentacion M5 | INCONSISTENTE | Discrepancia entre RF-M5-001 y tipos reales |
| Portal Teacher | FUNCIONAL | Vista teacher_pending_reviews corregida (CORR-009) |
| Sistema Recompensas | FUNCIONAL | Triggers multi-objetivo implementados v2.5.0 |
| Integracion Misiones | FUNCIONAL | 8/8 tipos de objetivos cubiertos |

---

## PARTE 1: INVENTARIO DE DOCUMENTACION VS CODIGO

### 1.1 Modulo 3 - Lectura Critica

#### Documentacion (RF-M3-001)

| # | Tipo | Nombre | XP | ML Coins |
|---|------|--------|-----|----------|
| 3.1 | `analisis_fuentes` | Analisis de Fuentes Historicas | 150 | 30 |
| 3.2 | `debate_digital` | Debate Digital Estructurado | 150 | 30 |
| 3.3 | `matriz_perspectivas` | Matriz de Perspectivas | 150 | 30 |
| 3.4 | `podcast_argumentativo` | Podcast Argumentativo | 150 | 30 |
| 3.5 | `tribunal_opiniones` | Tribunal de Opiniones | 150 | 30 |

#### Codigo (Seeds 04-exercises-module3.sql)

| # | Tipo | order_index | requires_manual_grading | Estado |
|---|------|-------------|-------------------------|--------|
| 1 | `tribunal_opiniones` | 1 | TRUE | OK |
| 2 | `debate_digital` | 2 | TRUE | OK |
| 3 | `analisis_fuentes` | 3 | TRUE | CORREGIDO (CORR-M3-001) |
| 4 | `podcast_argumentativo` | 4 | TRUE | OK |
| 5 | `matriz_perspectivas` | 5 | TRUE | OK |

**VALIDACION:** 5/5 ejercicios correctos - SINCRONIZADO

---

### 1.2 Modulo 4 - Lectura Digital

#### Documentacion RF-M4-001 (Desactualizada)

| # | Tipo | Descripcion | Validacion |
|---|------|-------------|------------|
| 1 | `linea_tiempo` | Linea de tiempo interactiva | Manual |
| 2 | `mapa_mental` | Mapa mental/conceptual | Manual |
| 3 | `infografia` | Infografia digital | Manual |
| 4 | `podcast` | Audio/Podcast | Manual |
| 5 | `video_resumen` | Video resumen | Manual |

#### Documentacion 03-FLUJO-VALIDACION (Actual)

| # | Tipo | Nombre | Evaluacion |
|---|------|--------|------------|
| 4.1 | `verificador_fake_news` | Verificador Fake News | MANUAL |
| 4.2 | `infografia_interactiva` | Infografia Interactiva | MANUAL |
| 4.3 | `quiz_tiktok` | Quiz TikTok | AUTO (excepcion) |
| 4.4 | `navegacion_hipertextual` | Navegacion Hipertextual | MANUAL |
| 4.5 | `analisis_memes` | Analisis de Memes | MANUAL |

#### Codigo (Seeds 05-exercises-module4.sql)

| # | Tipo | requires_manual_grading | auto_grade en codigo | Estado |
|---|------|-------------------------|---------------------|--------|
| 1 | `verificador_fake_news` | TRUE | NO | OK |
| 2 | `infografia_interactiva` | TRUE | NO | OK |
| 3 | `quiz_tiktok` | TRUE | SI (gradeQuizTiktok) | INCONSISTENTE |
| 4 | `navegacion_hipertextual` | TRUE | NO | OK |
| 5 | `analisis_memes` | TRUE | NO | OK |

**INCONSISTENCIA CRITICA: GAP-M4-001**
- `quiz_tiktok` tiene `requires_manual_grading = true` en BD
- PERO existe funcion `gradeQuizTiktok()` en `exercise-grading.service.ts:420`
- RESULTADO: Se crea ManualReview innecesario cuando ya fue auto-gradado

**INCONSISTENCIA DOCUMENTACION: GAP-DOC-M4-001**
- RF-M4-001 lista tipos diferentes a los implementados
- Debe actualizarse para reflejar tipos reales

---

### 1.3 Modulo 5 - Produccion Creativa

#### Documentacion RF-M5-001 (Desactualizada)

| # | Tipo | Descripcion |
|---|------|-------------|
| 1 | `ensayo` | Ensayo creativo |
| 2 | `carta` | Carta al personaje |
| 3 | `proyecto_multimedia` | Proyecto multimedia |

#### Documentacion 03-FLUJO-VALIDACION (Actual)

| # | Tipo | Nombre |
|---|------|--------|
| 5.A | `diario_multimedia` | Diario Multimedia |
| 5.B | `comic_digital` | Comic Digital |
| 5.C | `video_carta` | Video-Carta |

#### Codigo (Seeds 06-exercises-module5.sql)

| # | Tipo | requires_manual_grading | Estado |
|---|------|-------------------------|--------|
| 1 | `diario_multimedia` | TRUE | OK |
| 2 | `comic_digital` | TRUE | OK |
| 3 | `video_carta` | TRUE | OK |

**INCONSISTENCIA DOCUMENTACION: GAP-DOC-M5-001**
- RF-M5-001 lista tipos diferentes a los implementados
- Tipos correctos son: `diario_multimedia`, `comic_digital`, `video_carta`
- Documento debe actualizarse

---

## PARTE 2: ANALISIS DEL PORTAL TEACHER

### 2.1 Arquitectura del Portal Teacher

```
PORTAL TEACHER
|
+-- /teacher/dashboard (TeacherDashboardPage)
|     +-- PendingSubmissionsList (muestra pendientes M3-M5)
|
+-- /teacher/reviews (TeacherReviewPanelPage) [PRINCIPAL]
|     +-- ReviewList (tabla de pendientes)
|     +-- ReviewDetail (panel de calificacion)
|
+-- /teacher/responses (TeacherExerciseResponsesPage)
      +-- ResponsesTable (todas las respuestas)
      +-- ResponseDetailModal (detalle de respuesta)
```

### 2.2 Componentes Clave

| Componente | Ubicacion | Estado | Observaciones |
|------------|-----------|--------|---------------|
| TeacherReviewPanelPage | apps/teacher/pages/ | FUNCIONAL | Pagina principal de revision |
| ReviewList | components/review-panel/ | FUNCIONAL | Filtros por modulo funcionan |
| ReviewDetail | components/review-panel/ | FUNCIONAL | Rubrica y feedback |
| manualReviewExercises.ts | constants/ | FUNCIONAL | Lista 12 tipos correctos |
| useManualReviews.ts | hooks/ | FUNCIONAL | Hook para gestionar revisiones |

### 2.3 Vista teacher_pending_reviews

**Estado:** CORREGIDO (CORR-009)

**Correcciones aplicadas:**
1. `p.username` → `p.email` (columna correcta)
2. Removido `e.mechanic_type` (no existe)
3. `m.module_order` → `m.order_index AS module_order`
4. `es.time_spent` → `es.time_spent_seconds`
5. `es.attempts` → `es.attempt_number`
6. `es.answers` → `es.answer_data`
7. Removidas columnas inexistentes: `graded_by`, `metadata`, `tenant_id`

---

## PARTE 3: SISTEMA DE RECOMPENSAS

### 3.1 Arquitectura Dual-Table

```
FLUJO A: AUTOCORREGIBLES (M1, M2, quiz_tiktok)
|
exercise_attempts
    |
    +-- TRIGGER: trg_update_user_stats_on_exercise
    |     +-- UPDATE user_stats (XP, ML Coins)
    |
    +-- TRIGGER: trg_update_missions_on_exercise
          +-- UPDATE missions (objectives)


FLUJO B: REVISION MANUAL (M3, M4, M5)
|
exercise_submissions
    |
    +-- status: submitted → pending_review
    |
    +-- [MAESTRO CALIFICA]
    |
    +-- status: graded (is_correct, score)
    |
    +-- TRIGGER: trg_update_user_stats_on_submission
    |     +-- UPDATE user_stats (XP, ML Coins)
    |
    +-- TRIGGER: trg_update_missions_on_submission
          +-- UPDATE missions (objectives)
```

### 3.2 Calculo de Recompensas

**Formula XP:** (Actualizada 2026-01-18 - alineada con ExerciseSubmissionService.claimRewards())
```
base_xp = exercise.xp_reward || 100
score_multiplier = score / max_score
rank_multiplier = getRankXpMultiplier(userId)  // Multiplicador del rango Maya

xp_earned = floor(base_xp * score_multiplier * rank_multiplier)

// Bonificaciones
if (score == max_score && !hint_used) xp_earned += 50  // Perfect score: +50 fijo

// Penalización
xp_earned = max(0, xp_earned - (hints_count * 5))  // -5 XP por hint usado
```

**Formula ML Coins:** (Actualizada 2026-01-18)
```
base_coins = exercise.ml_coins_reward || 20
coins_earned = floor(base_coins * (score / max_score))

if (score == max_score && !hint_used) coins_earned += 10  // Perfect bonus: +10 fijo

net_coins = max(0, coins_earned - ml_coins_spent)
```

### 3.3 Comparacion M1-M2 vs M3-M5

| Aspecto | M1-M2 (Automatico) | M3-M5 (Manual) |
|---------|-------------------|----------------|
| Tabla principal | exercise_attempts | exercise_submissions |
| Trigger evento | AFTER INSERT | AFTER UPDATE (status=graded) |
| Cuando se otorga XP | Inmediato | Cuando maestro califica |
| Reintentos | Ilimitados | 1 entrega (puede devolverse) |
| Anti-farming | Solo primer acierto | N/A |
| Actualiza misiones | Si | Si (via triggers) |

### 3.4 Triggers de Misiones (v2.5.0)

| Tipo Objetivo | Funcion | Tabla Origen | Estado |
|---------------|---------|--------------|--------|
| `complete_exercises` | update_missions_on_exercise_complete | exercise_attempts | IMPLEMENTADO |
| `correct_streak` | update_missions_on_correct_streak | exercise_attempts | IMPLEMENTADO |
| `earn_xp` | update_missions_on_earn_xp | user_stats | IMPLEMENTADO |
| `use_comodines` | update_missions_on_use_comodines | comodin_usage_log | IMPLEMENTADO |
| `daily_streak` | update_missions_on_daily_streak | user_stats | IMPLEMENTADO |
| `perfect_scores` | update_missions_on_perfect_scores | exercise_attempts | IMPLEMENTADO |
| `complete_modules` | update_missions_on_complete_modules | module_progress | IMPLEMENTADO |
| `explore_modules` | update_missions_on_explore_modules | module_progress | IMPLEMENTADO |

---

## PARTE 4: INCONSISTENCIAS IDENTIFICADAS

### 4.1 Inconsistencias Criticas (P0)

| ID | Descripcion | Impacto | Ubicacion |
|----|-------------|---------|-----------|
| GAP-M4-001 | quiz_tiktok marcado como manual pero tiene auto-grading | ManualReview innecesario creado | Seeds M4 + exercise-grading.service.ts |

### 4.2 Inconsistencias de Documentacion (P1)

| ID | Descripcion | Archivos Afectados |
|----|-------------|--------------------|
| GAP-DOC-M4-001 | RF-M4-001 lista tipos incorrectos | RF-M4-001-ejercicios-m4.md |
| GAP-DOC-M5-001 | RF-M5-001 lista tipos incorrectos | RF-M5-001-ejercicios-m5.md |
| GAP-DOC-CONST-001 | manualReviewExercises.ts no esta sincronizado con seeds | apps/teacher/constants/manualReviewExercises.ts |

### 4.3 Inconsistencias de Codigo (P2)

| ID | Descripcion | Impacto |
|----|-------------|---------|
| GAP-CODE-001 | M3 sin validacion en exercise_validation_config | Error generico si se intenta auto-validar |
| GAP-CODE-002 | Desbalance de recompensas entre creativos y automaticos | Incentivos desbalanceados |
| GAP-FE-001 | Frontend ResponseDetailModal usa lista hardcodeada | Mantenimiento dificil |

---

## PARTE 5: VALIDACION DE DEPENDENCIAS

### 5.1 Dependencias del Campo requires_manual_grading

El campo `requires_manual_grading` tiene **11 dependencias** en el sistema:

| Componente | Archivo | Linea | Tipo de Uso |
|------------|---------|-------|-------------|
| DDL | 02-exercises.sql | 45, 112 | Definicion, Indice |
| Vista | teacher_pending_reviews.sql | 96 | Filtro WHERE |
| Funcion | create_manual_review_on_submission.sql | 49, 54 | Condicion logica |
| Entity | exercise.entity.ts | 193-203 | Mapeo TypeORM |
| Service | exercise-submission.service.ts | 231, 344 | Validacion |
| Service | exercise-validator.service.ts | 614-621 | Consulta |
| Controller | exercises.controller.ts | 993 | Branching |
| Constante | manualReviewExercises.ts | 5-18 | Lista frontend |
| Pagina | TeacherReviewPanelPage.tsx | 45 | Filtrado |
| Hook | useManualReviews.ts | 23 | Query |
| Componente | ReviewList.tsx | 67 | Render condicional |

### 5.2 Dependencias del Sistema de Recompensas

```
ExerciseRewardsService
    |
    +-- UserStatsService.addXp()
    |     +-- TRIGGER: trg_update_missions_on_earn_xp
    |
    +-- MLCoinsService.addCoins()
    |
    +-- MissionsService.updateProgress()
    |
    +-- RanksService.checkPromotion()
          +-- Promocion de rango Maya si aplica
```

### 5.3 Dependencias de la Vista teacher_pending_reviews

```
teacher_pending_reviews (Vista)
    |
    +-- educational_content.exercises (JOIN)
    +-- educational_content.modules (JOIN)
    +-- progress_tracking.exercise_submissions (JOIN)
    +-- user_management.profiles (JOIN)
    +-- social_features.teacher_classrooms (JOIN)
```

---

## PARTE 6: MATRIZ DE CUMPLIMIENTO

### 6.1 Requisitos vs Implementacion

| Requisito | Documentado | Implementado | Validado | Estado |
|-----------|-------------|--------------|----------|--------|
| M3 ejercicios con evaluacion manual | SI | SI | SI | OK |
| M4 ejercicios con evaluacion manual | SI (desactualizado) | SI | SI | ACTUALIZAR DOC |
| M5 ejercicios con evaluacion manual | SI (desactualizado) | SI | SI | ACTUALIZAR DOC |
| Portal Teacher muestra pendientes | SI | SI | SI | OK |
| Maestro puede calificar | SI | SI | SI | OK |
| Recompensas se asignan post-calificacion | SI | SI | SI | OK |
| Misiones se actualizan | SI | SI | SI | OK |
| Notificacion al estudiante | SI | SI | PARCIAL | VERIFICAR |

### 6.2 Archivos a Modificar

| Archivo | Tipo de Cambio | Prioridad |
|---------|----------------|-----------|
| RF-M4-001-ejercicios-m4.md | Actualizar tipos de ejercicios | P1 |
| RF-M5-001-ejercicios-m5.md | Actualizar tipos de ejercicios | P1 |
| 05-exercises-module4.sql | Cambiar quiz_tiktok a requires_manual_grading=false | P0 |
| manualReviewExercises.ts | Verificar sincronizacion | P2 |

---

## PARTE 7: RECOMENDACIONES

### 7.1 Correcciones Inmediatas (P0)

1. **GAP-M4-001: Corregir quiz_tiktok**
   - Cambiar `requires_manual_grading = false` en seed M4
   - O remover auto-grading de exercise-grading.service.ts

### 7.2 Actualizaciones de Documentacion (P1)

1. **GAP-DOC-M4-001: Actualizar RF-M4-001**
   - Cambiar tipos a: verificador_fake_news, infografia_interactiva, quiz_tiktok, navegacion_hipertextual, analisis_memes

2. **GAP-DOC-M5-001: Actualizar RF-M5-001**
   - Cambiar tipos a: diario_multimedia, comic_digital, video_carta

### 7.3 Mejoras de Codigo (P2)

1. **GAP-CODE-002: Balancear recompensas**
   - Agregar multiplicador para ejercicios creativos
   - Considerar: creative_multiplier = 1.25

2. **GAP-FE-001: Centralizar constantes**
   - Mover lista hardcodeada de ResponseDetailModal a constante compartida

---

## PARTE 8: PROXIMOS PASOS

### Fase 3: Planeacion

1. Crear plan detallado de correcciones
2. Definir orden de ejecucion
3. Estimar tiempos

### Fase 4: Validacion del Plan

1. Verificar que el plan cubra todas las inconsistencias
2. Analizar dependencias de cada cambio
3. Identificar riesgos

### Fase 5: Refinamiento

1. Ajustar plan segun validacion
2. Preparar scripts de rollback

### Fase 6: Ejecucion

1. Aplicar correcciones en orden de prioridad
2. Ejecutar validaciones incrementales

### Fase 7: Validacion Final

1. Ejecutar tests end-to-end
2. Verificar flujo completo: estudiante → maestro → recompensas

---

## ANEXO A: FLUJO COMPLETO DE VALIDACION M3-M5

```
ESTUDIANTE                          BACKEND                           BD                              MAESTRO
    |                                  |                               |                                  |
    | 1. Completa ejercicio M3/M4/M5   |                               |                                  |
    |---------------------------------→|                               |                                  |
    |                                  | 2. POST /exercises/:id/submit |                                  |
    |                                  |------------------------------→|                                  |
    |                                  |                               | 3. INSERT exercise_submissions   |
    |                                  |                               |    status = 'submitted'          |
    |                                  |                               |    is_correct = NULL             |
    |                                  |                               |    xp_earned = 0                 |
    |                                  |                               |                                  |
    |                                  |                               | 4. TRIGGER: create_manual_review |
    |                                  |                               |    INSERT manual_reviews         |
    |                                  |                               |    status = 'pending'            |
    |                                  |                               |                                  |
    |                                  |←------------------------------|                                  |
    |                                  | 5. { status: 'pending_review' }                                  |
    |←---------------------------------|                               |                                  |
    | 6. Muestra: "Enviado para        |                               |                                  |
    |    revision del maestro"         |                               |                                  |
    |                                  |                               |                                  |
    |                                  |                               |                                  | 7. Ve notificacion
    |                                  |                               |                                  |    "Nuevo ejercicio pendiente"
    |                                  |                               |                                  |
    |                                  |                               |                                  | 8. GET /teacher/reviews/pending
    |                                  |                               |←---------------------------------|
    |                                  |                               | 9. SELECT FROM                   |
    |                                  |                               |    teacher_pending_reviews       |
    |                                  |                               |--------------------------------→|
    |                                  |                               |                                  | 10. Ve ejercicio en lista
    |                                  |                               |                                  |
    |                                  |                               |                                  | 11. Selecciona ejercicio
    |                                  |                               |                                  |     Evalua con rubrica
    |                                  |                               |                                  |     Asigna score: 85/100
    |                                  |                               |                                  |     Escribe feedback
    |                                  |                               |                                  |
    |                                  |                               |                                  | 12. PUT /teacher/reviews/:id/complete
    |                                  |←---------------------------------|←-------------------------------|
    |                                  | 13. ManualReviewService         |                                  |
    |                                  |     .completeReview()           |                                  |
    |                                  |------------------------------→|                                  |
    |                                  |                               | 14. UPDATE exercise_submissions  |
    |                                  |                               |     status = 'graded'            |
    |                                  |                               |     score = 85                   |
    |                                  |                               |     is_correct = true            |
    |                                  |                               |                                  |
    |                                  |                               | 15. TRIGGER: update_user_stats   |
    |                                  |                               |     total_xp += 168              |
    |                                  |                               |     ml_coins += 8                |
    |                                  |                               |                                  |
    |                                  |                               | 16. TRIGGER: update_missions     |
    |                                  |                               |     objectives[].current += 1    |
    |                                  |                               |                                  |
    |                                  |←------------------------------|                                  |
    |                                  | 17. { rewards: { xp: 168,     |                                  |
    |                                  |        mlCoins: 8, rankUp } } |                                  |
    |                                  |                               |--------------------------------→|
    |                                  |                               |                                  | 18. Muestra: "Revision completada"
    |                                  |                               |                                  |     +168 XP, +8 ML Coins
    |                                  |                               |                                  |
    | 19. NotificationService.create() |                               |                                  |
    |←---------------------------------|                               |                                  |
    | 20. Ve notificacion:             |                               |                                  |
    |     "Tu ejercicio fue calificado"|                               |                                  |
    |     Score: 85/100                |                               |                                  |
    |     +168 XP, +8 ML Coins         |                               |                                  |
    |                                  |                               |                                  |
```

---

## ANEXO B: LISTA COMPLETA DE EJERCICIOS CON EVALUACION MANUAL

| Modulo | Tipo | Nombre | XP Base | ML Coins Base |
|--------|------|--------|---------|---------------|
| M3 | `tribunal_opiniones` | Tribunal de Opiniones | 150 | 30 |
| M3 | `debate_digital` | Debate Digital Estructurado | 150 | 30 |
| M3 | `analisis_fuentes` | Analisis de Fuentes Historicas | 150 | 30 |
| M3 | `podcast_argumentativo` | Podcast Argumentativo | 150 | 30 |
| M3 | `matriz_perspectivas` | Matriz de Perspectivas | 150 | 30 |
| M4 | `verificador_fake_news` | Verificador Fake News | 150 | 30 |
| M4 | `infografia_interactiva` | Infografia Interactiva | 150 | 30 |
| M4 | `navegacion_hipertextual` | Navegacion Hipertextual | 150 | 30 |
| M4 | `analisis_memes` | Analisis de Memes | 150 | 30 |
| M5 | `diario_multimedia` | Diario Multimedia | 200 | 40 |
| M5 | `comic_digital` | Comic Digital | 200 | 40 |
| M5 | `video_carta` | Video-Carta | 200 | 40 |

**Nota:** quiz_tiktok (M4) es auto-gradable y NO deberia estar en esta lista.

---

**Creado por:** Claude Opus 4.5 (Orchestrator Agent)
**Fecha:** 2026-01-07
**Version:** 1.0
**Estado:** ANALISIS COMPLETADO - PENDIENTE PLANEACION
