# CORR-009: Analisis Inicial - Integracion Ejercicios M3-M5 con Portal Teacher

**Fecha:** 2026-01-07
**Estado:** EN ANALISIS
**Version:** 1.0
**Autor:** Arquitecto de Integracion

---

## 1. RESUMEN EJECUTIVO

Este documento presenta el analisis inicial de las integraciones necesarias entre los ejercicios de los modulos 3, 4 y 5 con el portal Teacher para calificacion manual y las mecanicas de gamificacion (XP, ML Coins, Misiones, etc.).

### 1.1 Alcance

| Modulo | Nombre | Ejercicios | Requieren Calificacion Manual |
|--------|--------|------------|-------------------------------|
| M3 | Lectura Critica | 5 | 5 (100%) |
| M4 | Alfabetizacion Digital | 5 | 5 (100%) |
| M5 | Produccion Creativa | 3 | 3 (100%) |
| **Total** | | **13** | **13 (100%)** |

---

## 2. INVENTARIO DE EJERCICIOS

### 2.1 Modulo 3 - Lectura Critica (MOD-03-CRITICA)

| Order | Ejercicio | Tipo | Manual Grading | XP | ML Coins |
|-------|-----------|------|----------------|-----|----------|
| 1 | Tribunal de Opiniones | tribunal_opiniones | TRUE | 150 | 30 |
| 2 | Debate Digital | debate_digital | TRUE | 150 | 30 |
| 3 | Analisis de Fuentes (CRAAP) | analisis_fuentes | TRUE | 150 | 30 |
| 4 | Podcast Argumentativo | podcast_argumentativo | TRUE | 150 | 30 |
| 5 | Matriz de Perspectivas | matriz_perspectivas | TRUE | 150 | 30 |

### 2.2 Modulo 4 - Alfabetizacion Digital (MOD-04-DIGITAL)

| Order | Ejercicio | Tipo | Manual Grading | XP | ML Coins |
|-------|-----------|------|----------------|-----|----------|
| 1 | Verificador Fake News | verificador_fake_news | TRUE | 100 | 20 |
| 2 | Infografia Interactiva | infografia_interactiva | TRUE | 100 | 20 |
| 3 | Quiz TikTok | quiz_tiktok | TRUE* | 100 | 20 |
| 4 | Navegacion Hipertextual | navegacion_hipertextual | TRUE | 100 | 20 |
| 5 | Analisis de Memes | analisis_memes | TRUE | 100 | 20 |

> *NOTA: Quiz TikTok podria ser automatico dado que son preguntas de opcion multiple con respuestas correctas definidas.

### 2.3 Modulo 5 - Produccion Creativa (MOD-05-PRODUCCION)

| Order | Ejercicio | Tipo | Manual Grading | XP | ML Coins |
|-------|-----------|------|----------------|-----|----------|
| 1 | Diario Multimedia | diario_multimedia | TRUE | 500 | 100 |
| 2 | Comic Digital | comic_digital | TRUE | 500 | 100 |
| 3 | Video-Carta | video_carta | TRUE | 500 | 100 |

---

## 3. ARQUITECTURA ACTUAL

### 3.1 Flujo de Calificacion Manual Existente

```
[Estudiante]
    |
    v
[ExerciseSubmissionService.submit()]
    |
    v
[Ejercicio requiere calificacion manual?]
    |-- NO --> [ExerciseGradingService.autoGrade()] --> [Rewards]
    |
    YES
    |
    v
[ManualReview creado (status: pending)]
    |
    v
[Teacher Portal - Lista de pendientes]
    |
    v
[ManualReviewService.completeReview()]
    |
    v
[ExerciseSubmissionService.gradeSubmission()]
    |
    v
[ExerciseSubmissionService.claimRewards()]
    |
    v
[ExerciseRewardsService.claimRewards()]
    |
    +-> [UserStatsService.addXp()]
    +-> [MLCoinsService.addCoins()]
    +-> [MissionsService.updateProgress()]
```

### 3.2 Servicios Clave

| Servicio | Archivo | Funcion |
|----------|---------|---------|
| ManualReviewService | `teacher/services/manual-review.service.ts` | Gestion de reviews manuales |
| ExerciseRewardsService | `progress/services/grading/exercise-rewards.service.ts` | Distribucion de recompensas |
| ExerciseGradingService | `progress/services/grading/exercise-grading.service.ts` | Calificacion automatica/manual |
| UserStatsService | `gamification/services/user-stats.service.ts` | Gestion de XP y estadisticas |
| MLCoinsService | `gamification/services/ml-coins.service.ts` | Gestion de ML Coins |
| MissionsService | `gamification/services/missions.service.ts` | Gestion de misiones |

---

## 4. GAPS IDENTIFICADOS

### 4.1 Integracion Teacher Portal

| ID | Gap | Severidad | Descripcion |
|----|-----|-----------|-------------|
| GAP-T-001 | Rubrica especifica por ejercicio | ALTA | No hay rubricas especificas para cada tipo de ejercicio M3-M5 |
| GAP-T-002 | Feedback estructurado | MEDIA | El feedback es texto libre, falta estructura por criterio |
| GAP-T-003 | Vista previa de respuesta | MEDIA | Teacher no puede ver la respuesta multimedia facilmente |
| GAP-T-004 | Historial de revisiones | BAJA | No hay registro de cambios en calificaciones |

### 4.2 Integracion Gamificacion

| ID | Gap | Severidad | Descripcion |
|----|-----|-----------|-------------|
| GAP-G-001 | Logros por modulo | MEDIA | No hay achievements especificos al completar modulos M3-M5 |
| GAP-G-002 | Misiones de evaluacion | MEDIA | No hay misiones que recompensen evaluaciones de teacher |
| GAP-G-003 | Bonus por feedback | BAJA | No hay bonus cuando teacher da feedback detallado |
| GAP-G-004 | Notificacion a estudiante | ALTA | Estudiante no recibe notificacion cuando se califica |

### 4.3 Base de Datos

| ID | Gap | Severidad | Descripcion |
|----|-----|-----------|-------------|
| GAP-DB-001 | exercise_rubrics | ALTA | Falta tabla para rubricas por ejercicio |
| GAP-DB-002 | rubric_scores detallados | MEDIA | rubric_scores es JSONB sin estructura validada |
| GAP-DB-003 | Triggers de notificacion | ALTA | Falta trigger al completar review |

---

## 5. COMPONENTES A ANALIZAR POR EJERCICIO

Para cada uno de los 13 ejercicios, se requiere analisis de:

### 5.1 Fase de Analisis Detallado
- [ ] Estructura de la respuesta esperada (content, config, solution)
- [ ] Criterios de evaluacion (rubrica)
- [ ] Campos requeridos para calificacion
- [ ] Validaciones especificas

### 5.2 Fase de Planeacion
- [ ] Definir rubrica especifica del ejercicio
- [ ] Definir estructura de feedback
- [ ] Definir integracion con gamificacion
- [ ] Definir notificaciones

### 5.3 Fase de Validacion de Planeacion
- [ ] Verificar coherencia con documentacion v6.x
- [ ] Verificar dependencias de archivos
- [ ] Verificar impacto en BD

### 5.4 Fase de Ejecucion
- [ ] Implementar cambios en seeds
- [ ] Implementar cambios en backend
- [ ] Implementar cambios en frontend
- [ ] Actualizar scripts de BD

### 5.5 Fase de Validacion de Ejecucion
- [ ] Tests unitarios
- [ ] Tests de integracion
- [ ] Validacion end-to-end

---

## 6. DEPENDENCIAS CRITICAS

### 6.1 Archivos de Backend Afectados

```
apps/backend/src/modules/
├── teacher/
│   ├── services/
│   │   ├── manual-review.service.ts       [MODIFICAR]
│   │   ├── grading.service.ts             [MODIFICAR]
│   │   └── rubric-scoring.service.ts      [MODIFICAR]
│   ├── controllers/
│   │   └── manual-review.controller.ts    [VERIFICAR]
│   └── dto/
│       └── create-review.dto.ts           [MODIFICAR]
├── progress/
│   ├── services/
│   │   └── grading/
│   │       └── exercise-rewards.service.ts [VERIFICAR]
│   └── events/
│       └── exercise-submission.event.ts    [MODIFICAR]
├── gamification/
│   ├── services/
│   │   ├── achievements.service.ts        [AGREGAR logros M3-M5]
│   │   └── missions.service.ts            [AGREGAR misiones]
│   └── entities/
│       └── achievement.entity.ts          [VERIFICAR]
└── notifications/
    └── services/
        └── notifications.service.ts       [AGREGAR eventos]
```

### 6.2 Archivos de Base de Datos Afectados

```
apps/database/
├── ddl/schemas/
│   ├── educational_content/
│   │   └── tables/
│   │       └── XX-exercise_rubrics.sql    [CREAR]
│   ├── progress_tracking/
│   │   ├── tables/
│   │   │   └── manual_reviews.sql         [VERIFICAR]
│   │   └── functions/
│   │       └── XX-on_review_complete.sql  [CREAR]
│   └── notifications/
│       └── functions/
│           └── XX-notify_grade.sql        [CREAR]
└── seeds/prod/
    ├── educational_content/
    │   ├── 04-exercises-module3.sql       [VERIFICAR rubric_config]
    │   ├── 05-exercises-module4.sql       [VERIFICAR rubric_config]
    │   └── 06-exercises-module5.sql       [VERIFICAR rubric_config]
    └── gamification_system/
        └── XX-achievements-m3-m5.sql      [CREAR]
```

### 6.3 Archivos de Frontend Afectados

```
apps/frontend/src/
├── apps/teacher/
│   ├── pages/
│   │   └── GradingPage.tsx               [MODIFICAR]
│   ├── components/
│   │   ├── RubricForm.tsx                [CREAR]
│   │   └── SubmissionViewer.tsx          [MODIFICAR]
│   └── hooks/
│       └── useManualReview.ts            [VERIFICAR]
└── features/
    └── gamification/
        └── components/
            └── GradeNotification.tsx     [CREAR]
```

---

## 7. PLAN DE TAREAS (Alto Nivel)

| ID | Tarea | Dependencias | Prioridad |
|----|-------|--------------|-----------|
| T-001 | Analisis detallado M3 (5 ejercicios) | - | P0 |
| T-002 | Analisis detallado M4 (5 ejercicios) | - | P0 |
| T-003 | Analisis detallado M5 (3 ejercicios) | - | P0 |
| T-004 | Crear tabla exercise_rubrics | T-001,002,003 | P0 |
| T-005 | Actualizar seeds con rubric_config | T-004 | P1 |
| T-006 | Implementar rubrica en backend | T-004,005 | P1 |
| T-007 | Implementar vista rubrica frontend | T-006 | P1 |
| T-008 | Crear achievements M3-M5 | T-001,002,003 | P2 |
| T-009 | Crear notificaciones calificacion | T-006 | P2 |
| T-010 | Homologacion y documentacion | T-001..009 | P3 |

---

## 8. PROXIMOS PASOS

1. **Inmediato:** Crear documentos de analisis detallado para cada modulo
2. **Fase 1:** Definir rubricas especificas por ejercicio
3. **Fase 2:** Implementar cambios en BD y recrear
4. **Fase 3:** Implementar cambios en backend
5. **Fase 4:** Implementar cambios en frontend
6. **Fase 5:** Validacion end-to-end
7. **Fase 6:** Documentacion y homologacion

---

## 9. REFERENCIAS

- `docs/00-vision-general/DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md`
- `docs/01-fase-alcance-inicial/EAI-002-actividades/especificaciones/ET-EDU-001-mecanicas-ejercicios.md`
- `docs/00-vision-general/GUIA-PRUEBAS-MODULO4-Respuestas-Ejemplo.md`
- `docs/00-vision-general/GUIA-PRUEBAS-MODULO5-Respuestas-Ejemplo.md`
- `orchestration/reportes/correcciones/CORR-007-FLUJO-EVALUACION-MANUAL-M3-M5.md`

---

**Estado:** ANALISIS INICIAL COMPLETADO
**Siguiente:** Crear analisis detallado por modulo
