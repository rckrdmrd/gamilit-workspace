# ANÁLISIS PRE-EJECUCIÓN: BUG-M3-SUBMIT-001 - Fallo en Envío de Respuestas M3

**Agente:** Arquitecto de Soluciones (Claude Opus 4.5)
**Tipo de tarea:** Bug Fix / Corrección Crítica
**Prioridad:** P0 (Crítico)
**Fecha análisis:** 2026-01-07
**Relacionado con:** [CORR-M3M5-001], [EAI-007]

---

## 📋 CONTEXTO DE LA TAREA

### Solicitud Original
Se han tenido problemas para guardar las respuestas o la acción del botón de enviar respuestas desde el módulo 3.

### Síntomas Reportados
- El botón de enviar respuestas no funciona correctamente en ejercicios M3
- Las respuestas no se guardan
- El usuario no recibe el mensaje de "pendiente de revisión"

---

## 🔍 ANÁLISIS DETALLADO DEL FLUJO

### Flujo de Envío (Actual)

```
┌────────────────────────────────────────────────────────────────────────┐
│ FRONTEND: AnalisisFuentesExercise.tsx                                  │
│ Línea 243: await submitExercise(exerciseId, user.id, answers)          │
└────────────────────────┬───────────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────────────────┐
│ FRONTEND: progressAPI.ts submitExercise()                              │
│ POST /api/v1/educational/exercises/{id}/submit                         │
│ Espera: { status, requiresManualReview, message }                      │
└────────────────────────┬───────────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────────────────┐
│ BACKEND: exercises.controller.ts submitExercise()                      │
│ Líneas 1025-1043: Manejo de ejercicios manuales                        │
│ ⚠️ BUG: Retorna respuesta HARDCODEADA sin flags de revisión manual     │
└────────────────────────┬───────────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────────────────┐
│ BACKEND: exercise-submission.service.ts submitExercise()               │
│ Líneas 370-373: Agrega requiresManualReview: true                      │
│ ✅ CORRECTO: El servicio SÍ incluye los flags correctos                │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🐛 BUG IDENTIFICADO

### Ubicación Exacta
**Archivo:** `apps/backend/src/modules/educational/controllers/exercises.controller.ts`
**Líneas:** 1025-1043

### Código Actual (INCORRECTO)
```typescript
// 6. MANEJO DE EJERCICIOS MANUALES
if (exercise.requires_manual_grading) {
  const submission = await this.exerciseSubmissionService.submitExercise(
    normalized.userId,
    exerciseId,
    normalized.answers,
  );

  return {
    score: submission.score || 0,
    isPerfect: false,
    rewards: {
      xp: 0,
      mlCoins: 0,
      bonuses: [],
    },
    rankUp: null,
    feedback: 'Submission sent for teacher review',
  };  // ❌ FALTA: status, requiresManualReview, message
}
```

### Problema
El controlador:
1. ✅ Correctamente llama a `exerciseSubmissionService.submitExercise()`
2. ✅ El servicio agrega `requiresManualReview: true` al objeto submission
3. ❌ **PERO** el controlador devuelve una respuesta **hardcodeada** que NO incluye:
   - `status: 'pending_review'` o `status: 'submitted'`
   - `requiresManualReview: true`
   - `message` del servicio

### Qué Espera el Frontend
**Archivo:** `apps/frontend/src/features/progress/api/progressAPI.ts`
**Líneas:** 76-81

```typescript
// Estado de la submission (para ejercicios con revision manual)
status?: 'draft' | 'submitted' | 'graded' | 'reviewed' | 'pending_review';
// Indica si el ejercicio requiere revision manual del maestro
requiresManualReview?: boolean;
// Mensaje del backend para mostrar al usuario
message?: string;
```

### Cómo lo Usa el Frontend
**Archivo:** `apps/frontend/src/features/mechanics/module3/AnalisisFuentes/AnalisisFuentesExercise.tsx`
**Líneas:** 247-258

```typescript
// CORR-AF-001: Manejar ejercicios con revisión manual
if (response.status === 'pending_review' || response.requiresManualReview) {
  setFeedback({
    type: 'info',
    title: 'Análisis Enviado',
    message: 'Tu análisis ha sido enviado para revisión del maestro...',
    pendingReview: true,
  });
  // ... mostrar modal y notificar
}
```

### Por Qué Falla
- El frontend verifica: `response.status === 'pending_review' || response.requiresManualReview`
- El backend retorna: `{ ..., feedback: 'Submission sent for teacher review' }` (sin status ni requiresManualReview)
- La condición del frontend es **SIEMPRE FALSA**
- El frontend no muestra el mensaje de "pendiente de revisión"

---

## 📊 ARCHIVOS AFECTADOS

### Backend (Corrección Necesaria)
| Archivo | Líneas | Acción |
|---------|--------|--------|
| `exercises.controller.ts` | 1032-1042 | Agregar campos faltantes |
| `submit-exercise-response.dto.ts` | Todo | Agregar campos opcionales |

### Frontend (Ya Correcto - Solo Verificación)
| Archivo | Líneas | Estado |
|---------|--------|--------|
| `AnalisisFuentesExercise.tsx` | 247-258 | ✅ Correcto |
| `progressAPI.ts` | 76-81 | ✅ Tipos correctos |

### Componentes M3 a Verificar
| Componente | Archivo | Estado |
|------------|---------|--------|
| Análisis de Fuentes | `AnalisisFuentesExercise.tsx` | ✅ Tiene manejo pending_review |
| Debate Digital | `DebateDigitalExercise.tsx` | ⚠️ Verificar |
| Matriz Perspectivas | `MatrizPerspectivasExercise.tsx` | ⚠️ Verificar |
| Podcast Argumentativo | `PodcastArgumentativoExercise.tsx` | ⚠️ Verificar |
| Tribunal Opiniones | `TribunalOpinionesExercise.tsx` | ⚠️ Verificar |

---

## 🔧 SOLUCIÓN PROPUESTA

### Cambio en exercises.controller.ts

**Código Corregido:**
```typescript
// 6. MANEJO DE EJERCICIOS MANUALES
if (exercise.requires_manual_grading) {
  const submission = await this.exerciseSubmissionService.submitExercise(
    normalized.userId,
    exerciseId,
    normalized.answers,
  );

  // BUG-M3-SUBMIT-001 FIX: Incluir campos de revisión manual
  return {
    score: submission.score || 0,
    isPerfect: false,
    rewards: {
      xp: 0,
      mlCoins: 0,
      bonuses: [],
    },
    rankUp: null,
    feedback: 'Submission sent for teacher review',
    // Campos agregados para revisión manual
    status: 'submitted',  // O 'pending_review' según preferencia
    requiresManualReview: true,
    message: (submission as any).message || 'Tu respuesta ha sido enviada para revisión del maestro. Recibirás tus recompensas cuando sea evaluada.',
  };
}
```

### Cambio en submit-exercise-response.dto.ts

**Agregar campos opcionales:**
```typescript
@ApiProperty({
  description: 'Estado de la submission (para ejercicios con revisión manual)',
  enum: ['draft', 'submitted', 'graded', 'reviewed', 'pending_review'],
  required: false,
})
status?: string;

@ApiProperty({
  description: 'Indica si el ejercicio requiere revisión manual del maestro',
  example: true,
  required: false,
})
requiresManualReview?: boolean;

@ApiProperty({
  description: 'Mensaje del backend para mostrar al usuario',
  example: 'Tu respuesta ha sido enviada para revisión del maestro.',
  required: false,
})
message?: string;
```

---

## ⚠️ ANÁLISIS DE IMPACTO

### Ejercicios Afectados
- **Módulo 3:** 5/5 ejercicios (todos tienen requires_manual_grading=TRUE)
- **Módulo 4:** 4/5 ejercicios (excepto quiz_tiktok)
- **Módulo 5:** 3/3 ejercicios

### Flujos Afectados
1. Envío de ejercicios M3-M5
2. Visualización de mensaje "pendiente de revisión"
3. Flujo de notificación al estudiante

### Riesgo
- **Probabilidad de regresión:** Baja (cambio aditivo)
- **Impacto si falla:** Alto (usuarios no pueden enviar ejercicios)

---

## ✅ VALIDACIONES REQUERIDAS

### Pre-Ejecución
- [x] Verificar que exercises tienen requires_manual_grading=TRUE en BD
- [x] Verificar estructura de SubmitExerciseResponse en frontend
- [x] Identificar todos los componentes M3 afectados

### Post-Ejecución
- [ ] Compilación backend sin errores
- [ ] Test endpoint POST /exercises/:id/submit con ejercicio M3
- [ ] Verificar response incluye status y requiresManualReview
- [ ] Verificar frontend muestra mensaje "pendiente de revisión"
- [ ] Verificar todos los componentes M3 muestran mensaje correcto

---

## 📚 REFERENCIAS

### Documentación
- `orchestration/reportes/VALIDACION-EJECUCION-M3-M5-2026-01-07.md`
- `docs/90-transversal/sistema-recompensas/03-FLUJO-VALIDACION-MAESTRO-M3-M5.md`

### Código Fuente
- `apps/backend/src/modules/educational/controllers/exercises.controller.ts:1025-1043`
- `apps/backend/src/modules/progress/services/exercise-submission.service.ts:355-374`
- `apps/frontend/src/features/progress/api/progressAPI.ts:35-82`
- `apps/frontend/src/features/mechanics/module3/AnalisisFuentes/AnalisisFuentesExercise.tsx:243-258`

---

## 🚀 CONCLUSIÓN

### Causa Raíz
El controlador de ejercicios devuelve una respuesta hardcodeada que no incluye los campos `status`, `requiresManualReview` y `message` que el frontend necesita para mostrar el mensaje de "pendiente de revisión".

### Solución
Agregar los campos faltantes en la respuesta del controlador cuando `exercise.requires_manual_grading` es true.

### Complejidad
- **Estimada:** Baja (cambio de ~10 líneas)
- **Archivos a modificar:** 2

### Estado
✅ **APROBADO PARA EJECUCIÓN**

---

*Documento generado según TEMPLATE-ANALISIS.md del sistema SIMCO*
