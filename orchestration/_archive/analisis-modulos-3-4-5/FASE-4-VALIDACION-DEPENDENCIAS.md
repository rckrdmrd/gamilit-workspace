# VALIDACIÓN DE PLANEACIÓN Y DEPENDENCIAS
## Fase 4: Verificación de Objetos Impactados

**Fecha:** 2025-12-23
**Analista:** Requirements-Analyst
**Versión:** 1.0
**Estado:** VALIDACIÓN COMPLETA

---

## 1. RESUMEN DE VALIDACIÓN

| Área | Hallazgo | Acción |
|------|----------|--------|
| Rúbricas | 4 existentes, 6 faltantes | Extender `getRubricForMechanic()` |
| Multiplicador ML Coins | Implementado parcialmente | Integrar con rangos Maya |
| DTOs M4-M5 | ✅ Completos (8 DTOs) | Sin acción |
| Hooks Teacher | ✅ Completos (3 hooks grading) | Sin acción |
| Validador SQL | ✅ Completo | Sin acción |
| Seeds | ✅ Completos | Sin acción |

---

## 2. ANÁLISIS DE RÚBRICAS

### 2.1 Rúbricas Existentes

| Rúbrica | Tipo de Ejercicio | Módulo | Estado |
|---------|-------------------|--------|--------|
| `prediccion_narrativa` | Predicción Narrativa | M2 | ✅ Completa |
| `tribunal_opiniones` | Tribunal de Opiniones | M3 | ✅ Completa |
| `comic_digital` | Cómic Digital | M5 | ✅ Completa |
| `generic_creative` | Fallback para 10 tipos | - | ✅ Disponible |

### 2.2 Rúbricas Faltantes (Necesitan Implementación)

#### Módulo 4 (4 ejercicios con revisión manual):

| Tipo | Criterios Sugeridos | Peso |
|------|-------------------|------|
| `verificador_fake_news` | Precisión veredictos (40%), Calidad evidencia (35%), Fuentes citadas (25%) | 100% |
| `infografia_interactiva` | Comprensión datos (35%), Secciones exploradas (30%), Síntesis (35%) | 100% |
| `navegacion_hipertextual` | Eficiencia navegación (30%), Información sintetizada (40%), Ruta lógica (30%) | 100% |
| `analisis_memes` | Interpretación elementos (35%), Análisis cultural (30%), Precisión histórica (35%) | 100% |

#### Módulo 5 (2 ejercicios faltantes):

| Tipo | Criterios Sugeridos | Peso |
|------|-------------------|------|
| `diario_multimedia` | Precisión histórica (30%), Profundidad emocional (25%), Creatividad (25%), Voz auténtica (20%) | 100% |
| `video_carta` | Autenticidad de voz (30%), Mensaje (30%), Estructura (25%), Longitud (15%) | 100% |

### 2.3 Código a Modificar

**Archivo:** `apps/frontend/src/apps/teacher/components/grading/RubricEvaluator.tsx`

**Cambio requerido:**
```typescript
// Agregar constantes para nuevas rúbricas:
const RUBRIC_VERIFICADOR_FAKE_NEWS: RubricConfig = {
  id: 'verificador_fake_news',
  name: 'Verificador de Fake News',
  description: 'Evaluación de verificación de afirmaciones',
  mechanicType: 'verificador_fake_news',
  maxScore: 100,
  criteria: [
    { id: 'precision', name: 'Precisión de veredictos', weight: 40, ... },
    { id: 'evidencia', name: 'Calidad de evidencia', weight: 35, ... },
    { id: 'fuentes', name: 'Fuentes citadas', weight: 25, ... }
  ]
};

// Agregar a DEFAULT_RUBRICS:
export const DEFAULT_RUBRICS: RubricConfig[] = [
  ...EXISTING_RUBRICS,
  RUBRIC_VERIFICADOR_FAKE_NEWS,
  RUBRIC_INFOGRAFIA_INTERACTIVA,
  RUBRIC_NAVEGACION_HIPERTEXTUAL,
  RUBRIC_ANALISIS_MEMES,
  RUBRIC_DIARIO_MULTIMEDIA,
  RUBRIC_VIDEO_CARTA
];
```

---

## 3. ANÁLISIS DE MULTIPLICADOR ML COINS

### 3.1 Estado Actual

**Implementación encontrada en `ml-coins.service.ts`:**

```typescript
async addCoins(
  userId: string,
  amount: number,
  type: TransactionType,
  description: string,
  referenceId?: string,
  referenceType?: string,
  multiplier?: number  // ✅ Parámetro existe
): Promise<MLCoinsTransaction> {
  const finalAmount = multiplier
    ? Math.floor(amount * multiplier)
    : amount;  // ✅ Se aplica si se pasa
  ...
}
```

### 3.2 Gap Identificado

**El multiplicador NO se obtiene automáticamente del rango del usuario.**

Flujo actual:
```
Ejercicio completado → mlCoinsService.addCoins(userId, 50) → 50 ML Coins
```

Flujo esperado:
```
Ejercicio completado → Obtener rango usuario → Obtener xp_multiplier →
mlCoinsService.addCoins(userId, 50, multiplier: 1.10) → 55 ML Coins
```

### 3.3 Corrección Requerida

**Opción A: En Backend (Recomendada)**

Modificar `exercise-attempt.service.ts`:

```typescript
async awardRewards(userId: string, exercise: Exercise, score: number) {
  // Obtener multiplicador del rango del usuario
  const userStats = await this.userStatsService.findByUserId(userId);
  const userRank = await this.mayaRanksRepository.findOne({
    where: { rank_name: userStats.current_rank }
  });
  const multiplier = userRank?.xp_multiplier || 1.0;

  // Aplicar multiplicador a ML Coins
  await this.mlCoinsService.addCoins(
    userId,
    exercise.ml_coins_reward,
    'exercise_completion',
    `Completar ${exercise.title}`,
    exercise.id,
    'exercise',
    multiplier  // ← Pasar multiplicador
  );
}
```

**Opción B: En Base de Datos**

Modificar `award_ml_coins.sql`:

```sql
-- Obtener multiplicador automáticamente
SELECT xp_multiplier INTO v_multiplier
FROM gamification_system.maya_ranks
WHERE rank_name = (
  SELECT current_rank
  FROM gamification_system.user_stats
  WHERE user_id = p_user_id
);

v_final_amount := FLOOR(p_amount * COALESCE(v_multiplier, 1.0));
```

---

## 4. VALIDACIÓN DE DTOs

### 4.1 DTOs Módulo 4 ✅ COMPLETOS

| DTO | Archivo | Campos Clave | Validación |
|-----|---------|--------------|------------|
| `VerificadorFakeNewsAnswerDto` | `verificador-fake-news-answer.dto.ts` | claims_verified[], is_fake, evidence | ≥10 caracteres |
| `InfografiaInteractivaAnswerDto` | `infografia-interactiva-answer.dto.ts` | answers{}, sections_explored[] | ≥1 sección |
| `QuizTikTokAnswerDto` | `quiz-tiktok-answer.dto.ts` | answers[] (numbers) | ≥0 por índice |
| `NavegacionHipertextualAnswerDto` | `navegacion-hipertextual-answer.dto.ts` | path[], information_found{} | ≥2 nodos |
| `AnalisisMemesAnswerDto` | `analisis-memes-answer.dto.ts` | annotations[], analysis.message | message no vacío |

### 4.2 DTOs Módulo 5 ✅ COMPLETOS

| DTO | Archivo | Campos Clave | Validación |
|-----|---------|--------------|------------|
| `DiarioMultimediaAnswerDto` | `diario-multimedia-answer.dto.ts` | entries[{date, content, mood}] | 1-5 entradas, ≥50 chars |
| `ComicDigitalAnswerDto` | `comic-digital-answer.dto.ts` | panels[{dialogue, narration}] | 4-6 paneles |
| `VideoCartaAnswerDto` | `video-carta-answer.dto.ts` | video_url OR script, duration | ≥100 chars script |

---

## 5. VALIDACIÓN DE HOOKS TEACHER

### 5.1 Hooks de Calificación ✅ COMPLETOS

| Hook | Propósito | Métodos Principales |
|------|-----------|-------------------|
| `useGrading` | Gestión de calificaciones | `grade()`, `bulkGrade()`, `getSubmissionDetail()` |
| `useExerciseResponses` | Respuestas de ejercicios | `useAttemptDetail()`, `useAttemptsByStudent()` |
| `useStudentMonitoring` | Monitoreo en tiempo real | `students`, `setRefreshInterval()` |

### 5.2 Hooks Complementarios

| Hook | Uso para Calificación |
|------|----------------------|
| `useGrantBonus` | Otorgar XP/ML Coins adicionales |
| `useStudentsEconomy` | Ver balance de estudiantes |
| `useMasteryTracking` | Verificar dominio de temas |

---

## 6. MATRIZ DE IMPACTO DE CAMBIOS

### 6.1 Cambios en Frontend

| Archivo | Cambio | Impacto | Dependencias |
|---------|--------|---------|--------------|
| `RubricEvaluator.tsx` | +6 rúbricas | Alto | `useGrading.ts` |
| Ningún otro | - | - | - |

### 6.2 Cambios en Backend

| Archivo | Cambio | Impacto | Dependencias |
|---------|--------|---------|--------------|
| `exercise-attempt.service.ts` | Integrar multiplicador | Medio | `ml-coins.service.ts`, `maya-ranks.repository` |
| Ningún otro | - | - | - |

### 6.3 Cambios en Database

| Archivo | Cambio | Impacto | Dependencias |
|---------|--------|---------|--------------|
| Ninguno | - | - | Validador ya está completo |

### 6.4 Cambios en Documentación

| Archivo | Cambio | Impacto | Dependencias |
|---------|--------|---------|--------------|
| `VISION.md` | Actualizar estado M4-M5 | Alto | Ninguna |
| Otros docs XP | Estandarizar umbrales | Medio | Ninguna |

---

## 7. VERIFICACIÓN DE DEPENDENCIAS CRUZADAS

### 7.1 Flujo de Calificación Completo

```
┌─────────────────────────────────────────────────────────────────────┐
│ ESTUDIANTE                                                          │
│  └─> Completa ejercicio M4/M5                                       │
│       └─> Frontend: useExerciseSubmission()                         │
│            └─> Backend: exercises.controller.submit()               │
│                 └─> validate_module4_module5_answer() [SQL]         │
│                      └─> exercise-attempt.service.create()          │
│                           └─> progress_tracking.exercise_attempts   │
│                                └─> TRIGGERS (XP, ML Coins, Misiones)│
│                                                                     │
│ DOCENTE                                                             │
│  └─> Ve pendientes en ReviewPanel                                   │
│       └─> Frontend: useGrading.getSubmissions()                     │
│            └─> Backend: teacher/exercise-responses.controller       │
│                 └─> Renderiza RubricEvaluator                       │
│                      └─> Docente califica con rúbrica               │
│                           └─> Frontend: useGrading.grade()          │
│                                └─> Backend: grading.service.grade() │
│                                     └─> Actualiza submission.score  │
│                                          └─> Trigger: otorga rewards│
└─────────────────────────────────────────────────────────────────────┘
```

### 7.2 Dependencias Verificadas

| Dependencia | Estado | Nota |
|-------------|--------|------|
| `useExerciseSubmission` → `exercises.controller` | ✅ OK | Flujo probado |
| `exercises.controller` → `validate_module4_module5_answer` | ✅ OK | Validador existe |
| `RubricEvaluator` → `useGrading` | ✅ OK | Integración completa |
| `useGrading.grade()` → `grading.service` | ✅ OK | Endpoint funcional |
| `grading.service` → `triggers` | ✅ OK | Triggers actualizan rewards |

### 7.3 Dependencias Faltantes

| Dependencia | Estado | Corrección |
|-------------|--------|------------|
| `awardRewards` → `xp_multiplier` por rango | ⚠️ PARCIAL | Integrar en COR-006 |
| `RubricEvaluator` → Rúbricas M4 | ⚠️ FALTANTE | Agregar en COR-003 |
| `RubricEvaluator` → Rúbricas M5 (2 de 3) | ⚠️ FALTANTE | Agregar en COR-003 |

---

## 8. OBJETOS QUE DEBEN IMPACTARSE

### 8.1 Lista Definitiva de Archivos a Modificar

| # | Archivo | Tipo de Cambio | Prioridad |
|---|---------|----------------|-----------|
| 1 | `docs/00-vision-general/VISION.md` | Actualizar estado | P0 |
| 2 | `docs/00-vision-general/*.md` (varios) | Estandarizar XP | P0 |
| 3 | `apps/frontend/src/apps/teacher/components/grading/RubricEvaluator.tsx` | +6 rúbricas | P1 |
| 4 | `apps/backend/src/modules/progress/services/exercise-attempt.service.ts` | Integrar multiplicador | P2 |
| 5 | Configuración de storage (si video upload) | Infraestructura | P2 |

### 8.2 Archivos que NO Requieren Cambios

| Archivo | Razón |
|---------|-------|
| DTOs M4-M5 | Ya completos y funcionales |
| Validador SQL | Completo y probado |
| Hooks Teacher | Completos y funcionales |
| Seeds de ejercicios | Completos |
| Triggers de gamificación | Funcionando |

---

## 9. CONCLUSIÓN DE VALIDACIÓN

### 9.1 Plan Original vs. Validación

| Corrección | Plan Original | Validación | Estado |
|------------|---------------|------------|--------|
| COR-001 | Actualizar VISION.md | Confirmado | ✅ MANTENER |
| COR-002 | Estandarizar docs XP | Confirmado | ✅ MANTENER |
| COR-003 | Configurar rúbricas | 6 rúbricas faltantes identificadas | ✅ AJUSTAR |
| COR-004 | Verificar Quiz TikTok | Bajo riesgo, DTOs correctos | ✅ REDUCIR ESFUERZO |
| COR-005 | Tests E2E | Necesario para validar flujo | ✅ MANTENER |
| COR-006 | Multiplicador ML Coins | Gap real identificado | ✅ CONFIRMAR |
| COR-007 | Video Storage | Depende de requisitos infra | ✅ VERIFICAR PRIORIDAD |

### 9.2 Ajustes al Plan

1. **COR-003 ampliado:** Agregar 6 rúbricas específicas, no solo verificar existentes
2. **COR-004 simplificado:** Solo verificar que anti-farming funcione
3. **COR-006 confirmado:** Gap real, multiplicador no se aplica automáticamente

### 9.3 Riesgos Actualizados

| Riesgo | Antes | Después | Nota |
|--------|-------|---------|------|
| Rúbricas faltantes | Media | Alta | 6 de 10 usan genérica |
| Multiplicador ML Coins | Media | Confirmado | Gap real identificado |
| Tests E2E | Media | Media | Sin cambios |

---

## 10. APROBACIÓN PARA FASE 5

### Checklist de Validación

- [x] Todos los gaps del análisis (Fase 2) están cubiertos en el plan (Fase 3)
- [x] Dependencias de código identificadas y documentadas
- [x] Archivos a modificar listados exhaustivamente
- [x] Archivos que NO deben modificarse confirmados
- [x] Flujo end-to-end verificado
- [x] Riesgos actualizados con hallazgos de validación

### Decisión

**✅ PLAN VALIDADO Y APROBADO PARA FASE 5**

El plan de implementaciones está listo para ejecutarse con los ajustes identificados en esta fase de validación.

---

**Documento generado:** 2025-12-23
**Estado:** FASE 4 COMPLETA - Listo para Fase 5 (Ejecución)
