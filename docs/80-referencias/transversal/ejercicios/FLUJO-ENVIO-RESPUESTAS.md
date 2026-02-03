# Flujo de Envio de Respuestas - GAMILIT

**Version:** 2.0.0
**Fecha:** 2026-01-20
**Proyecto:** GAMILIT - Student Portal
**Tipo:** Documentacion Tecnica
**Actualizacion:** Agregada seccion de componentes compartidos y ejemplos de integracion

---

## Indice

1. [Introduccion](#introduccion)
2. [Diagrama de Secuencia General](#diagrama-de-secuencia-general)
3. [Componentes Involucrados](#componentes-involucrados)
   - [SubmitExerciseButton](#21-submitexercisebutton)
   - [useExerciseSubmission Hook](#22-useexercisesubmission-hook)
   - [FeedbackModal](#23-feedbackmodal)
4. [Flujo A: progressAPI.submitExercise()](#flujo-a-progressapisubmitexercise-m1-m3)
5. [Flujo B: useExerciseSubmission Hook](#flujo-b-useexercisesubmission-hook-m4-m5)
6. [Formato de Request/Response por Modulo](#formato-de-requestresponse-por-modulo)
7. [Manejo de Errores](#manejo-de-errores)
8. [Ejemplos de Codigo](#ejemplos-de-codigo)

---

## Introduccion

Este documento describe los dos flujos de envio de respuestas implementados en GAMILIT para ejercicios de comprension lectora:

1. **Flujo A: `progressAPI.submitExercise()`** - Usado por mecanicas M1-M3 (basicas)
2. **Flujo B: `useExerciseSubmission` hook** - Usado por mecanicas M4-M5 (version SECURE)

Ambos flujos envian respuestas al backend para validacion server-side, reciben resultados con score y recompensas, e invalidan el cache de React Query para refrescar el dashboard del estudiante.

---

## Diagrama de Secuencia General

```
+-------------+      +-------------------+      +----------------+      +-------------+      +------------+
| Estudiante  |      |     Frontend      |      |     API        |      |   Backend   |      |     DB     |
+-------------+      +-------------------+      +----------------+      +-------------+      +------------+
      |                      |                        |                      |                    |
      | 1. Click Submit      |                        |                      |                    |
      |--------------------->|                        |                      |                    |
      |                      |                        |                      |                    |
      |                      | 2. SubmitExerciseButton|                      |                    |
      |                      |     .onClick()         |                      |                    |
      |                      |--------+               |                      |                    |
      |                      |        |               |                      |                    |
      |                      |<-------+               |                      |                    |
      |                      |                        |                      |                    |
      |                      | 3. useExerciseSubmission                      |                    |
      |                      |    .submitExercise()   |                      |                    |
      |                      |--------+               |                      |                    |
      |                      |        |               |                      |                    |
      |                      |<-------+               |                      |                    |
      |                      |                        |                      |                    |
      |                      | 4. POST /exercises/:id/submit                 |                    |
      |                      |----------------------->|                      |                    |
      |                      |                        |                      |                    |
      |                      |                        | 5. JWT Auth          |                    |
      |                      |                        |--------------------->|                    |
      |                      |                        |                      |                    |
      |                      |                        |                      | 6. validate_and_audit()
      |                      |                        |                      |------------------->|
      |                      |                        |                      |                    |
      |                      |                        |                      | 7. Score + Rewards |
      |                      |                        |                      |<-------------------|
      |                      |                        |                      |                    |
      |                      |                        | 8. Response          |                    |
      |                      |<-----------------------|<---------------------|                    |
      |                      |                        |                      |                    |
      |                      | 9. FeedbackModal o     |                      |                    |
      |                      |    ExerciseFeedback    |                      |                    |
      |                      |--------+               |                      |                    |
      |                      |        |               |                      |                    |
      |                      |<-------+               |                      |                    |
      |                      |                        |                      |                    |
      | 10. Muestra Resultado|                        |                      |                    |
      |<---------------------|                        |                      |                    |
      |                      |                        |                      |                    |
```

---

## Componentes Involucrados

### 2.1 SubmitExerciseButton

**Ubicacion:** `/apps/frontend/src/shared/components/mechanics/SubmitExerciseButton.tsx`

Componente reutilizable para el boton de envio de ejercicios. Estandariza el comportamiento y estados visuales en todos los ejercicios.

#### Props

| Prop | Tipo | Default | Descripcion |
|------|------|---------|-------------|
| `isSubmitting` | `boolean` | - | Indica si se esta enviando |
| `isSubmitted` | `boolean` | - | Indica si ya fue enviado |
| `onClick` | `() => void` | - | Callback cuando se hace click |
| `disabled` | `boolean` | `false` | Si el boton esta deshabilitado |
| `label` | `string` | `'Enviar Respuestas'` | Texto del boton en estado normal |
| `loadingLabel` | `string` | `'Enviando...'` | Texto durante envio |
| `submittedLabel` | `string` | `'Enviado'` | Texto despues de enviar |
| `variant` | `'primary' \| 'gold' \| 'blue'` | `'primary'` | Variante visual |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamano del boton |
| `fullWidth` | `boolean` | `false` | Ancho completo |

#### Estados Visuales

| Estado | Icono | Color | Descripcion |
|--------|-------|-------|-------------|
| `default` | Send | primary/gold/blue | Listo para enviar |
| `loading` | Loader2 (animado) | primary | Enviando... |
| `submitted` | CheckCircle | green | Ya enviado |
| `disabled` | Send | gris | No cumple requisitos |

#### Ejemplo de Uso

```tsx
import { SubmitExerciseButton } from '@shared/components/mechanics/SubmitExerciseButton';

<SubmitExerciseButton
  isSubmitting={isSubmitting}
  isSubmitted={isSubmitted}
  onClick={handleSubmit}
  disabled={!isValid || answeredCount < totalQuestions}
  label="Enviar Verificacion"
  variant="gold"
  fullWidth
/>
```

#### Nota de Implementacion

**IMPORTANTE:** Segun la validacion de FASE-1, este componente actualmente NO se usa en ningun ejercicio. Los 30 ejercicios existentes usan botones inline personalizados. Se recomienda evaluar su integracion para consistencia UX.

---

### 2.2 useExerciseSubmission Hook

Existen **dos versiones** de este hook en el codebase:

#### Version A: `/features/exercises/hooks/useExerciseSubmission.ts` (Simple)

Usado por ejercicios M1-M3. Proporciona funcionalidad basica de envio.

```typescript
interface UseExerciseSubmissionOptions {
  onSuccess?: (result: ExerciseSubmissionResult) => void;
  onError?: (error: Error) => void;
}

const {
  submitExercise,  // async (submission) => Promise<Result>
  isSubmitting,    // boolean
  error,           // Error | null
  result,          // ExerciseSubmissionResult | null
  reset,           // () => void
} = useExerciseSubmission(options);
```

#### Version B: `/features/mechanics/shared/hooks/useExerciseSubmission.ts` (SECURE)

Usado por ejercicios M4-M5. Incluye validacion Zod, tracking anti-cheat y manejo de rate limiting.

```typescript
interface UseExerciseSubmissionOptions {
  onSuccess?: (result: SubmissionResult) => void;
  onError?: (error: any) => void;
  onRateLimitError?: (retryAfter: number) => void;
  trackHints?: boolean;
  trackPowerups?: boolean;
}

const {
  // Mutation state
  submit,              // (answers) => void
  submitAsync,         // async (answers) => Promise<Result>
  isSubmitting,        // boolean
  isSuccess,           // boolean
  isError,             // boolean
  error,               // Error | null
  data,                // SubmissionResult | null
  reset,               // () => void

  // Helper functions
  recordHintUsed,      // () => void
  recordPowerupUsed,   // (powerup) => void
  getTimeElapsed,      // () => number (seconds)
  resetTracking,       // () => void

  // Tracking data
  hintsUsed,           // number
  powerupsUsed,        // string[]
  sessionId,           // string (UUID)
  startTime,           // number (timestamp)
} = useExerciseSubmission(exerciseId, options);
```

#### Comparativa

| Caracteristica | Version A (Simple) | Version B (SECURE) |
|----------------|-------------------|-------------------|
| Validacion Zod | No | Si |
| Tracking Hints | No | Si |
| Tracking Powerups | No | Si |
| Session ID | No | Si (anti-cheat) |
| Rate Limiting | No | Si |
| Cache Invalidation | Manual | Automatica |
| Modulos | M1-M3 | M4-M5 |

---

### 2.3 FeedbackModal

**Ubicacion:** `/apps/frontend/src/shared/components/mechanics/FeedbackModal.tsx`

Modal animado para mostrar el resultado del ejercicio con soporte para confetti, rewards y detalles por pregunta.

#### Props

| Prop | Tipo | Default | Descripcion |
|------|------|---------|-------------|
| `isOpen` | `boolean` | - | Controla visibilidad del modal |
| `feedback` | `FeedbackData` | - | Datos del feedback a mostrar |
| `onClose` | `() => void` | - | Callback al cerrar |
| `onRetry` | `() => void` | opcional | Callback para reintentar |
| `onNext` | `() => void` | opcional | Callback para siguiente ejercicio |

#### Interface FeedbackData

```typescript
interface FeedbackData {
  type: 'success' | 'error' | 'partial' | 'info';
  title: string;
  message: string;
  score?: number;              // Score 0-100
  xpEarned?: number;           // XP ganado
  mlCoinsEarned?: number;      // ML Coins ganados
  showConfetti?: boolean;      // Activar confetti
  details?: Array<{            // Detalles por pregunta
    score: number;
    maxScore: number;
    feedback: string;
    categoryUsed?: string;
    keywordsFound?: string[];
    keywordsExpected?: string[];
  }>;
  pendingReview?: boolean;     // Para M3-M5 (revision manual)
}
```

#### Cuando Usar Cada Tipo

| Tipo | Cuando Usar | Icono | Color |
|------|-------------|-------|-------|
| `success` | Score >= 100% o ejercicio perfecto | CheckCircle2 | verde |
| `partial` | Score >= 70% pero < 100% | Info | amarillo |
| `error` | Score < 70% o fallo | XCircle | rojo |
| `info` | Informacion general, pendingReview | Info | azul |

#### Seccion pendingReview (M3-M5)

Para ejercicios que requieren revision manual del docente:

```tsx
<FeedbackModal
  isOpen={showFeedback}
  feedback={{
    type: 'info',
    title: 'Respuesta Enviada',
    message: 'Tu trabajo ha sido enviado para revision.',
    pendingReview: true,  // Activa seccion especial
  }}
  onClose={handleClose}
/>
```

Muestra un mensaje explicando que el progreso se actualizo pero las recompensas (XP, ML Coins) se asignaran cuando el maestro complete la evaluacion.

---

### 2.4 Componente Alternativo: ExerciseFeedback

**Ubicacion:** `/apps/frontend/src/features/exercises/components/ExerciseFeedback.tsx`

Version inline (no modal) del feedback. Actualmente **no se usa** en ningun ejercicio pero esta disponible para casos donde no se desea interrumpir el flujo con un modal.

---

## Flujo A: progressAPI.submitExercise() (M1-M3)

### Descripcion General

Funcion directa de API para ejercicios autocorregibles de los modulos 1, 2 y 3 (Comprension Literal, Inferencial y Critica). Es el metodo mas simple y directo.

### Ubicacion del Codigo

```
/apps/frontend/src/features/progress/api/progressAPI.ts
```

### Endpoint Destino

```
POST /api/v1/educational/exercises/:exerciseId/submit
```

### Payload Enviado (DTO)

```typescript
interface BackendPayload {
  answers: unknown;        // Respuestas en formato especifico de la mecanica
  startedAt: number;       // Timestamp de inicio (Date.now())
  hintsUsed: number;       // Numero de pistas usadas (default: 0)
  powerupsUsed: string[];  // Array de comodines usados (default: [])
}
```

**Ejemplo de Payload:**
```json
{
  "answers": {
    "stmt-1": true,
    "stmt-2": false,
    "stmt-3": true
  },
  "startedAt": 1705756800000,
  "hintsUsed": 0,
  "powerupsUsed": []
}
```

### Validaciones

#### Frontend (Minimas)
- Verifica que `FEATURE_FLAGS.USE_MOCK_DATA` este desactivado
- El payload se construye directamente sin validacion Zod

#### Backend (Completas)
1. **JwtAuthGuard:** Verifica autenticacion via JWT
2. **normalizeSubmitData():** Normaliza formato antiguo/nuevo
3. **ExerciseAnswerValidator:** Valida estructura segun `exercise_type`
4. **PostgreSQL validate_and_audit():** Calcula score y audita

### Response Esperada

```typescript
interface SubmitExerciseResponse {
  attemptId: string;
  score: number;              // 0-100
  isPerfect: boolean;
  correctAnswersCount: number;
  totalQuestions: number;
  rewards: {
    mlCoins: number;
    xp: number;
    bonuses: {
      perfectScore?: number;
      noHints?: number;
      speedBonus?: number;
      firstAttempt?: number;
    };
  };
  feedback: {
    overall: string;
    answerReview: Array<{
      questionId: string;
      isCorrect: boolean;
      userAnswer: string;
      correctAnswer: string;
      explanation?: string;
    }>;
  };
  achievements?: Array<{
    id: string;
    name: string;
    icon: string;
    rarity: string;
  }>;
  rankUp?: {
    newRank: string;
    previousRank?: string;
    bonusMLCoins: number;
    newMultiplier: number;
  } | null;
  correctAnswers?: unknown;
  explanations?: Record<string, string>;
  createdAt: Date;
  status?: 'draft' | 'submitted' | 'graded' | 'reviewed' | 'pending_review';
  requiresManualReview?: boolean;
  message?: string;
}
```

### Manejo de Errores

```typescript
try {
  const { data } = await apiClient.post<ApiResponse<SubmitExerciseResponse>>(
    `${API_ENDPOINTS.educational.exercise(exerciseId)}/submit`,
    backendPayload,
  );
  return data.data;
} catch (error) {
  throw handleAPIError(error);
}
```

El `handleAPIError` procesa errores HTTP y los transforma en mensajes amigables para el usuario.

### Cache Invalidation

**No implementada automaticamente.** La invalidacion del cache debe manejarse manualmente en el componente que llama a la funcion:

```typescript
// Ejemplo manual despues de submit
queryClient.invalidateQueries({ queryKey: ['dashboard'] });
queryClient.invalidateQueries({ queryKey: ['userModules'] });
```

---

## Flujo B: useExerciseSubmission Hook (M4-M5)

### Descripcion General

Hook React seguro para ejercicios de Modulos 4 y 5 que incluye:
- Validacion client-side con Zod antes de enviar
- Tracking de tiempo para anti-cheat
- Manejo de rate limiting
- Invalidacion automatica de cache
- Tracking de hints y powerups

### Ubicacion del Codigo

```
/apps/frontend/src/features/mechanics/shared/hooks/useExerciseSubmission.ts
```

### Endpoint Destino

```
POST /api/v1/educational/exercises/:exerciseId/submit
```

### Payload Enviado (DTO con Validacion Zod)

```typescript
const SubmitExerciseSchema = z.object({
  answers: z
    .record(z.string(), z.any())
    .refine((answers) => Object.keys(answers).length > 0, {
      message: 'At least one answer is required',
    }),
  startedAt: z.number().int().positive(),
  hintsUsed: z.number().int().min(0).max(10).default(0),
  powerupsUsed: z.array(
    z.enum(['pistas', 'vision_lectora', 'segunda_oportunidad'])
  ).default([]),
  sessionId: z.string().uuid().optional(),
});

type SubmitExercisePayload = z.infer<typeof SubmitExerciseSchema>;
```

**Ejemplo de Payload:**
```json
{
  "answers": {
    "q1": "respuesta1",
    "q2": "respuesta2"
  },
  "startedAt": 1705756800000,
  "hintsUsed": 1,
  "powerupsUsed": ["pistas"],
  "sessionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Validaciones

#### Frontend (Zod - Obligatorias)

```typescript
// 1. Validacion antes de enviar
try {
  SubmitExerciseSchema.parse(payload);
} catch (error) {
  if (error instanceof z.ZodError) {
    throw new Error(`Validation error: ${error.issues[0].message}`);
  }
  throw error;
}
```

Validaciones Zod:
- `answers`: Objeto no vacio con al menos una respuesta
- `startedAt`: Numero entero positivo (timestamp)
- `hintsUsed`: Entero entre 0 y 10
- `powerupsUsed`: Array de enums validos
- `sessionId`: UUID opcional (para tracking anti-cheat)

#### Backend (Identicas al Flujo A)

1. **JwtAuthGuard:** Verifica autenticacion via JWT
2. **normalizeSubmitData():** Normaliza formato
3. **ExerciseAnswerValidator:** Valida estructura
4. **PostgreSQL validate_and_audit():** Scoring

### Response Esperada

```typescript
interface SubmissionResult {
  attemptId: string;
  score: number;
  isPerfect: boolean;
  correctAnswersCount: number;
  totalQuestions: number;
  rewards: {
    mlCoins: number;
    xp: number;
    bonuses: {
      perfectScore?: number;
      noHints?: number;
      speedBonus?: number;
      firstAttempt?: number;
    };
  };
  feedback: {
    overall: string;
    answerReview: Array<{
      questionId: string;
      isCorrect: boolean;
      userAnswer: string;
      correctAnswer: string;
      explanation?: string;
    }>;
  };
  achievements: Array<{
    id: string;
    name: string;
    icon: string;
    rarity: string;
  }>;
  // SEGURIDAD: Solo disponibles DESPUES de submission
  correctAnswers: Record<string, unknown>;
  explanations: Record<string, string>;
  createdAt: string;
  status?: 'draft' | 'submitted' | 'graded' | 'reviewed' | 'pending_review';
  requiresManualReview?: boolean;
}
```

### Manejo de Errores

```typescript
onError: (error: any) => {
  // 1. Rate Limiting (429)
  if (error.response?.status === 429) {
    const retryAfter = error.response.data?.error?.retryAfter || 5;
    if (options.onRateLimitError) {
      options.onRateLimitError(retryAfter);
    } else {
      toast.error(`Too many attempts. Please wait ${retryAfter} seconds.`);
    }
    return;
  }

  // 2. Errores de Validacion (400)
  if (error.response?.status === 400) {
    const errorCode = error.response.data?.error?.code;

    switch (errorCode) {
      case 'SUBMISSION_TOO_FAST':
        toast.error('Please take time to complete the exercise.');
        break;
      case 'SESSION_EXPIRED':
        toast.error('Session expired. Please refresh and try again.');
        break;
      case 'VALIDATION_ERROR':
        toast.error('Invalid submission data. Please try again.');
        break;
      default:
        toast.error(error.response.data?.error?.message || 'Submission failed');
    }
    return;
  }

  // 3. Otros errores
  if (options.onError) {
    options.onError(error);
  } else {
    toast.error('Failed to submit exercise. Please try again.');
  }
}
```

### Cache Invalidation (Automatica)

```typescript
onSuccess: async (result) => {
  if (user?.id) {
    console.log('[useExerciseSubmission] Invalidating dashboard and modules cache...');
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      queryClient.invalidateQueries({ queryKey: ['dashboard', user.id] }),
      queryClient.invalidateQueries({ queryKey: ['userModules'] }),
      queryClient.invalidateQueries({ queryKey: ['userModules', user.id] }),
    ]);
    console.log('[useExerciseSubmission] Cache invalidated successfully');
  }

  // Callback personalizado
  if (options.onSuccess) {
    options.onSuccess(result);
  }

  // Toast de exito
  toast.success(`Score: ${result.score}%`, {
    icon: result.isPerfect ? '...' : '...',
    duration: 3000,
  });
}
```

### Funciones Helper del Hook

```typescript
const {
  // Estado de mutation
  submit,              // Funcion para enviar (async)
  submitAsync,         // Version async/await
  isSubmitting,        // Boolean de estado
  isSuccess,
  isError,
  error,
  data,
  reset,

  // Funciones helper
  recordHintUsed,      // Registra uso de pista
  recordPowerupUsed,   // Registra uso de powerup
  getTimeElapsed,      // Tiempo transcurrido en segundos
  resetTracking,       // Reset de tracking (para retry)

  // Datos de tracking
  hintsUsed,
  powerupsUsed,
  sessionId,
  startTime,
} = useExerciseSubmission('exercise-123', options);
```

---

## Diagrama de Secuencia

### Flujo General (Ambos Metodos)

```
+-------------+      +-------------+      +------------------+      +-------------+      +------------+
| Estudiante  |      |  Frontend   |      |      API         |      |   Backend   |      |    DB      |
+-------------+      +-------------+      +------------------+      +-------------+      +------------+
      |                    |                      |                       |                    |
      | 1. Click Submit    |                      |                       |                    |
      |------------------->|                      |                       |                    |
      |                    |                      |                       |                    |
      |                    | 2. Validar (Zod*)    |                       |                    |
      |                    |--+                   |                       |                    |
      |                    |  |                   |                       |                    |
      |                    |<-+                   |                       |                    |
      |                    |                      |                       |                    |
      |                    | 3. POST /exercises/:id/submit               |                    |
      |                    |--------------------->|                       |                    |
      |                    |                      |                       |                    |
      |                    |                      | 4. JWT Auth           |                    |
      |                    |                      |---------------------->|                    |
      |                    |                      |                       |                    |
      |                    |                      |                       | 5. Normalizar      |
      |                    |                      |                       |----+               |
      |                    |                      |                       |    |               |
      |                    |                      |                       |<---+               |
      |                    |                      |                       |                    |
      |                    |                      |                       | 6. Validar Schema  |
      |                    |                      |                       |----+               |
      |                    |                      |                       |    |               |
      |                    |                      |                       |<---+               |
      |                    |                      |                       |                    |
      |                    |                      |                       | 7. validate_and_audit()
      |                    |                      |                       |------------------->|
      |                    |                      |                       |                    |
      |                    |                      |                       | 8. Score + Audit   |
      |                    |                      |                       |<-------------------|
      |                    |                      |                       |                    |
      |                    |                      |                       | 9. Create Attempt  |
      |                    |                      |                       |------------------->|
      |                    |                      |                       |                    |
      |                    |                      |                       | 10. Trigger Stats  |
      |                    |                      |                       |<-------------------|
      |                    |                      |                       |                    |
      |                    |                      | 11. Response          |                    |
      |                    |<---------------------|<----------------------|                    |
      |                    |                      |                       |                    |
      |                    | 12. Invalidar Cache* |                       |                    |
      |                    |--+                   |                       |                    |
      |                    |  |                   |                       |                    |
      |                    |<-+                   |                       |                    |
      |                    |                      |                       |                    |
      | 13. Mostrar Result |                      |                       |                    |
      |<-------------------|                      |                       |                    |
      |                    |                      |                       |                    |

* Solo en Flujo B (useExerciseSubmission)
```

### Leyenda del Diagrama

| Paso | Descripcion | Flujo A | Flujo B |
|------|-------------|---------|---------|
| 1 | Estudiante hace click en boton de enviar | Si | Si |
| 2 | Validacion Zod en frontend | No | Si |
| 3 | Request HTTP POST al backend | Si | Si |
| 4 | JwtAuthGuard valida token | Si | Si |
| 5 | normalizeSubmitData() normaliza payload | Si | Si |
| 6 | ExerciseAnswerValidator valida estructura | Si | Si |
| 7 | PostgreSQL validate_and_audit() | Si | Si |
| 8 | Retorna score y feedback | Si | Si |
| 9 | Crea ExerciseAttempt | Si | Si |
| 10 | Trigger actualiza user_stats | Si | Si |
| 11 | Response con rewards | Si | Si |
| 12 | Invalidacion automatica de cache | No | Si |
| 13 | Muestra resultado al estudiante | Si | Si |

---

## Tabla Comparativa

| Caracteristica | Flujo A (progressAPI) | Flujo B (useExerciseSubmission) |
|----------------|----------------------|--------------------------------|
| **Modulos** | M1, M2, M3 | M4, M5 |
| **Tipo** | Funcion directa | React Hook |
| **Validacion Frontend** | Ninguna | Zod Schema |
| **Anti-Cheat** | Basico (startedAt) | Avanzado (sessionId, tracking) |
| **Rate Limiting** | No manejado | Manejado con retry |
| **Cache Invalidation** | Manual | Automatica |
| **Tracking Hints** | No | Si (recordHintUsed) |
| **Tracking Powerups** | No | Si (recordPowerupUsed) |
| **Tiempo Transcurrido** | Calculado en backend | Disponible en frontend |
| **Estado de Loading** | Manual | Automatico (isSubmitting) |
| **Toast Notifications** | Manual | Automaticas |
| **Reintentos** | Manual | resetTracking() |
| **Endpoint** | Mismo | Mismo |
| **Response** | Identica | Identica |
| **Seguridad Server-Side** | Completa | Completa |

---

## Backend: Procesamiento de Submission

### Controller: ExercisesController.submitExercise()

**Ubicacion:** `/apps/backend/src/modules/educational/controllers/exercises.controller.ts`

### Flujo de Procesamiento

```typescript
@UseGuards(JwtAuthGuard)
@Post('exercises/:id/submit')
async submitExercise(
  @Param('id') exerciseId: string,
  @Body() dto: SubmitExerciseDto,
  @Request() req: AuthRequest,
): Promise<SubmitExerciseResponseDto> {

  // 1. NORMALIZACION
  const normalized = this.normalizeSubmitData(dto, req);

  // 2. OBTENER EJERCICIO
  const exercise = await this.exercisesService.findById(exerciseId);
  if (!exercise) {
    throw new NotFoundException(`Exercise ${exerciseId} not found`);
  }

  // 3. PRE-SANITIZACION (casos especiales como tribunal_opiniones)
  // ... sanitizacion de campos especificos ...

  // 4. VALIDACION PRE-SQL
  await ExerciseAnswerValidator.validate(
    exercise.exercise_type,
    normalized.answers,
  );

  // 5. CONVERSION USUARIO -> PERFIL
  const profileId = await this.getProfileId(normalized.userId);

  // 6. MANEJO DE EJERCICIOS MANUALES
  if (exercise.requires_manual_grading) {
    // Crear submission para revision docente
    return {
      score: 0,
      isPerfect: false,
      status: 'submitted',
      requiresManualReview: true,
      message: 'Tu respuesta ha sido enviada para revision...'
    };
  }

  // 7. FLUJO AUTOCORREGIBLE
  // 7.1 Obtener intentos previos
  const previousAttempts = await this.exerciseAttemptService
    .findByUserAndExercise(profileId, exerciseId);
  const attemptNumber = previousAttempts.length + 1;

  // 7.2 Validacion y scoring en PostgreSQL
  const validationResult = await this.dataSource.query(`
    SELECT * FROM educational_content.validate_and_audit(
      $1::UUID, $2::UUID, $3::JSONB, $4::INTEGER
    )
  `, [exerciseId, profileId, JSON.stringify(normalized.answers), attemptNumber]);

  const score = validationResult[0].score || 0;
  const isCorrect = score >= (exercise.passing_score || 70);
  const feedback = validationResult[0].feedback || '';

  // 7.3 Anti-farming: XP solo en primer acierto
  const hasCorrectAttemptBefore = previousAttempts.some(a => a.is_correct);
  const isFirstCorrectAttempt = !hasCorrectAttemptBefore && isCorrect;

  let xpEarned = 0;
  let mlCoinsEarned = 0;

  if (isFirstCorrectAttempt) {
    xpEarned = exercise.xp_reward || 0;
    mlCoinsEarned = exercise.ml_coins_reward || 0;
  }

  // 7.4 Crear attempt (trigger actualiza user_stats)
  await this.exerciseAttemptService.create({
    user_id: profileId,
    exercise_id: exerciseId,
    submitted_answers: normalized.answers,
    is_correct: isCorrect,
    score: score,
    xp_earned: xpEarned,
    ml_coins_earned: mlCoinsEarned,
    time_spent_seconds: normalized.timeSpentSeconds,
    hints_used: normalized.hintsUsed,
    comodines_used: normalized.powerupsUsed,
  });

  // 8. RESPONSE
  return {
    score: score,
    isPerfect: score === 100 && normalized.hintsUsed === 0,
    rewards: {
      xp: xpEarned,
      mlCoins: mlCoinsEarned,
      bonuses: [],
    },
    feedback: feedback,
    isFirstCorrectAttempt: isFirstCorrectAttempt,
    rankUp: null,
  };
}
```

### Normalizacion de Datos

El metodo `normalizeSubmitData()` maneja compatibilidad entre formatos:

| Campo | Formato Nuevo (Prioridad) | Formato Antiguo (Fallback) |
|-------|---------------------------|---------------------------|
| answers | `dto.answers` | `dto.submitted_answers` |
| startedAt | `dto.startedAt` | `dto.started_at` |
| hintsUsed | `dto.hintsUsed` | `dto.hints_used` |
| powerupsUsed | `dto.powerupsUsed` | `dto.powerups_used`, `dto.comodines_used` |
| userId | `req.user.id` (JWT) | `dto.userId` |

---

## Recomendaciones

### Para Nuevas Mecanicas

1. **Mecanicas Autocorregibles Simples:** Usar `progressAPI.submitExercise()`
2. **Mecanicas con Tracking Avanzado:** Usar `useExerciseSubmission` hook
3. **Mecanicas con Revision Manual:** Usar `progressAPI.submitExercise()` (backend detecta `requires_manual_grading`)

### Mejoras Sugeridas

1. **Unificar Flujos:** Considerar migrar M1-M3 a `useExerciseSubmission` para consistencia
2. **Agregar Zod a Flujo A:** Implementar validacion frontend opcional
3. **Rate Limiting Global:** Implementar en API Gateway en lugar de por hook
4. **Offline Support:** Agregar cola de submissions para conexion intermitente

### Seguridad

1. **NUNCA** validar respuestas en frontend (solo estructura)
2. **SIEMPRE** confiar en la validacion server-side
3. **Anti-farming:** El backend otorga XP/MLCoins solo en primer acierto correcto
4. **Sanitizacion:** El backend nunca envia `correctAnswers` antes de submission

---

## Referencias

### Archivos de Codigo

- Frontend API: `/apps/frontend/src/features/progress/api/progressAPI.ts`
- Frontend Hook (Simple): `/apps/frontend/src/features/exercises/hooks/useExerciseSubmission.ts`
- Frontend Hook (SECURE): `/apps/frontend/src/features/mechanics/shared/hooks/useExerciseSubmission.ts`
- Backend Controller: `/apps/backend/src/modules/educational/controllers/exercises.controller.ts`
- Backend DTO: `/apps/backend/src/modules/educational/dto/submit-exercise.dto.ts`
- Validator: `/apps/backend/src/modules/progress/dto/answers/exercise-answer.validator.ts`

### Documentacion Relacionada

- Especificaciones M1-M3: `/docs/90-transversal/mecanicas/SPEC-MECANICAS-M1-M3.md`
- Sistema de Recompensas: `/docs/90-transversal/sistema-recompensas/`
- Arquitectura Database: `/docs/90-transversal/arquitectura-database/`

---

## Formato de Request/Response por Modulo

### M1 - Comprension Literal (Auto-evaluado)

| Mecanica | Formato Answers | Ejemplo |
|----------|-----------------|---------|
| **VerdaderoFalso** | `{ statements: { "id": boolean } }` | `{ statements: { "1": true, "2": false } }` |
| **CompletarEspacios** | `{ blanks: { "blankId": "word" } }` | `{ blanks: { "b1": "revolucion", "b2": "independencia" } }` |
| **Emparejamiento** | `{ matches: [{ leftId, rightId }] }` | `{ matches: [{ leftId: "l1", rightId: "r2" }] }` |
| **SopaLetras** | `{ words: string[] }` | `{ words: ["HISTORIA", "MAYA"] }` |
| **Crucigrama** | `{ clues: { "clueId": "answer" } }` | `{ clues: { "1-across": "CULTURA" } }` |
| **Timeline** | `{ events: string[] }` | `{ events: ["ev3", "ev1", "ev2"] }` |
| **MapaConceptual** | `{ connections: string[] }` | `{ connections: ["n1-n2", "n2-n3"] }` |

### M2 - Comprension Inferencial (Auto-evaluado excepto RuedaInferencias)

| Mecanica | Formato Answers | Ejemplo |
|----------|-----------------|---------|
| **DetectiveTextual** | `{ selections: { "fragId": "type" } }` | `{ selections: { "f1": "hecho", "f2": "opinion" } }` |
| **CausaEfecto** | `{ connections: { "causeId": "effectId" } }` | `{ connections: { "c1": "e2" } }` |
| **PrediccionNarrativa** | `{ prediction: string, reasoning: string }` | `{ prediction: "opt1", reasoning: "..." }` |
| **PuzzleContexto** | `{ answer: string }` | `{ answer: "significado_correcto" }` |
| **RuedaInferencias** | `{ inferences: { "catId": string } }` | `{ inferences: { "quien": "...", "que": "..." } }` |

### M3 - Comprension Critica (Evaluacion Manual)

| Mecanica | Formato Answers | Campos Especiales |
|----------|-----------------|-------------------|
| **TribunalOpiniones** | `{ evaluations: [...] }` | Array de evaluaciones con justificacion |
| **DebateDigital** | `{ position: string, response: string }` | Posicion + argumentacion |
| **AnalisisFuentes** | `{ ranking: [...] }` | Array ordenado de fuentes |
| **PodcastArgumentativo** | `{ script: string, audioUrl?: string }` | Guion + URL audio grabado |
| **MatrizPerspectivas** | `{ questions: {...} }` | Respuestas abiertas por pregunta |

### M4 - Lectura Digital (Evaluacion Manual)

| Mecanica | Formato Answers | Campos Especiales |
|----------|-----------------|-------------------|
| **VerificadorFakeNews** | `{ analysis: {...} }` | Analisis de fuentes y verificacion |
| **InfografiaInteractiva** | `{ responses: {...} }` | Respuestas por seccion |
| **QuizTikTok** | `{ selections: [...] }` | Selecciones con justificacion |
| **NavegacionHipertextual** | `{ path: [...], synthesis: string }` | Ruta de navegacion + sintesis |
| **AnalisisMemes** | `{ analysis: {...} }` | Decodificacion de mensajes |

### M5 - Produccion Lectora (Evaluacion Manual + Multimedia)

| Mecanica | Formato Answers | Campos Especiales |
|----------|-----------------|-------------------|
| **DiarioMultimedia** | `{ entries: [...], mediaUrls: [...] }` | Entradas + URLs de media |
| **ComicDigital** | `{ panels: [...] }` | Array de paneles con contenido |
| **VideoCarta** | `{ videoUrl: string, transcript?: string }` | URL video + transcripcion |

**NOTA IMPORTANTE (GAP-EX-004):** Los ejercicios M5 con multimedia actualmente almacenan URLs `blob:` temporales que no son accesibles por el Teacher Portal. Se requiere implementar servicio de upload a S3/GCS para URLs permanentes.

---

## Manejo de Errores

### Errores Comunes y Respuestas

| Codigo HTTP | Codigo Error | Mensaje | Accion Recomendada |
|-------------|--------------|---------|-------------------|
| 400 | `VALIDATION_ERROR` | "Invalid submission data" | Verificar formato de answers |
| 400 | `SUBMISSION_TOO_FAST` | "Please take time..." | Usuario envio muy rapido |
| 400 | `SESSION_EXPIRED` | "Session expired" | Refrescar pagina |
| 401 | `UNAUTHORIZED` | "Authentication required" | Redirigir a login |
| 404 | `EXERCISE_NOT_FOUND` | "Exercise not found" | Verificar exerciseId |
| 429 | `RATE_LIMITED` | "Too many attempts" | Esperar retryAfter segundos |
| 500 | `INTERNAL_ERROR` | "Server error" | Reintentar o contactar soporte |

### Patron de Manejo de Errores

```typescript
try {
  const response = await submitExercise(exerciseId, userId, answers);
  // Exito
  setFeedback({
    type: response.isPerfect ? 'success' : response.score >= 70 ? 'partial' : 'error',
    title: response.isPerfect ? 'Perfecto!' : 'Buen intento',
    message: response.feedback?.overall || `Score: ${response.score}%`,
    score: response.score,
    xpEarned: response.rewards?.xp,
    mlCoinsEarned: response.rewards?.mlCoins,
    showConfetti: response.isPerfect,
  });
} catch (error) {
  // Error
  console.error('[Exercise Submission Error]', error);
  setFeedback({
    type: 'error',
    title: 'Error al Enviar',
    message: error.message || 'Hubo un problema. Intenta nuevamente.',
  });
}
```

---

## Ejemplos de Codigo

### Ejemplo 1: Ejercicio M1 Simple (VerdaderoFalso)

```tsx
// VerdaderoFalsoExercise.tsx
import { useState } from 'react';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import { submitExercise } from '@/features/progress/api/progressAPI';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useInvalidateDashboard } from '@/shared/hooks';

export const VerdaderoFalsoExercise = ({ exercise, onComplete }) => {
  const { user } = useAuth();
  const { syncAndInvalidate } = useInvalidateDashboard();

  const [statements, setStatements] = useState(
    exercise.statements.map(stmt => ({ ...stmt, userAnswer: null }))
  );
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (statementId, answer) => {
    if (showResults) return;
    setStatements(prev =>
      prev.map(stmt =>
        stmt.id === statementId ? { ...stmt, userAnswer: answer } : stmt
      )
    );
  };

  const handleCheck = async () => {
    // 1. Validar completitud
    const allAnswered = statements.every(s => s.userAnswer !== null);
    if (!allAnswered) {
      setFeedback({
        type: 'error',
        title: 'Ejercicio Incompleto',
        message: 'Responde todas las preguntas antes de verificar.',
      });
      setShowFeedback(true);
      return;
    }

    // 2. Validar autenticacion
    if (!user?.id) {
      setFeedback({
        type: 'error',
        title: 'Error de Autenticacion',
        message: 'Debes estar autenticado para enviar.',
      });
      setShowFeedback(true);
      return;
    }

    setShowResults(true);

    try {
      // 3. Preparar payload
      const statementsAnswers = {};
      statements.forEach(s => {
        statementsAnswers[String(s.id)] = s.userAnswer;
      });

      // 4. Enviar al backend
      const response = await submitExercise(
        exercise.id,
        user.id,
        { statements: statementsAnswers }
      );

      // 5. Mostrar feedback
      setFeedback({
        type: response.isPerfect ? 'success' : response.score >= 70 ? 'partial' : 'error',
        title: response.isPerfect ? 'Perfecto!' : 'Buen trabajo!',
        message: response.feedback?.overall || `Score: ${response.score}%`,
        score: response.score,
        xpEarned: response.rewards?.xp,
        mlCoinsEarned: response.rewards?.mlCoins,
        showConfetti: response.isPerfect,
      });
      setShowFeedback(true);

      // 6. Sincronizar cache
      await syncAndInvalidate();

    } catch (error) {
      setFeedback({
        type: 'error',
        title: 'Error al Enviar',
        message: 'Hubo un problema. Intenta nuevamente.',
      });
      setShowFeedback(true);
    }
  };

  return (
    <>
      {/* ... UI de statements ... */}

      <button onClick={handleCheck} disabled={showResults}>
        Verificar Respuestas
      </button>

      {feedback && (
        <FeedbackModal
          isOpen={showFeedback}
          feedback={feedback}
          onClose={() => {
            setShowFeedback(false);
            if (feedback.type === 'success') onComplete?.();
          }}
          onRetry={() => {
            setShowFeedback(false);
            setShowResults(false);
            setStatements(exercise.statements.map(s => ({ ...s, userAnswer: null })));
          }}
        />
      )}
    </>
  );
};
```

### Ejemplo 2: Ejercicio M4 con Hook SECURE

```tsx
// VerificadorFakeNewsExercise.SECURE.tsx
import { useState, useCallback } from 'react';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import { useExerciseSubmission } from '@/features/mechanics/shared/hooks/useExerciseSubmission';

export const VerificadorFakeNewsExercise = ({ exercise, onComplete }) => {
  const [analysis, setAnalysis] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Hook SECURE con tracking de hints y powerups
  const {
    submit,
    isSubmitting,
    data: result,
    recordHintUsed,
    recordPowerupUsed,
    getTimeElapsed,
  } = useExerciseSubmission(exercise.id, {
    trackHints: true,
    trackPowerups: true,
    onSuccess: (result) => {
      setFeedback({
        type: result.isPerfect ? 'success' : 'info',
        title: 'Analisis Enviado',
        message: result.feedback?.overall || 'Tu analisis ha sido enviado para revision.',
        score: result.score,
        xpEarned: result.rewards?.xp,
        mlCoinsEarned: result.rewards?.mlCoins,
        pendingReview: result.requiresManualReview,
        showConfetti: result.isPerfect,
      });
      setShowFeedback(true);
    },
    onError: (error) => {
      setFeedback({
        type: 'error',
        title: 'Error',
        message: error.message || 'Error al enviar.',
      });
      setShowFeedback(true);
    },
    onRateLimitError: (retryAfter) => {
      setFeedback({
        type: 'error',
        title: 'Demasiados Intentos',
        message: `Espera ${retryAfter} segundos antes de reintentar.`,
      });
      setShowFeedback(true);
    },
  });

  const handleHintClick = useCallback(() => {
    recordHintUsed();
    // Mostrar hint...
  }, [recordHintUsed]);

  const handleSubmit = useCallback(() => {
    // El hook maneja validacion Zod automaticamente
    submit({ analysis });
  }, [submit, analysis]);

  return (
    <>
      {/* ... UI de analisis ... */}

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Enviando...' : 'Enviar Analisis'}
      </button>

      <button onClick={handleHintClick}>
        Usar Pista (costo: 15 ML Coins)
      </button>

      {feedback && (
        <FeedbackModal
          isOpen={showFeedback}
          feedback={feedback}
          onClose={() => {
            setShowFeedback(false);
            if (feedback.type === 'success') onComplete?.();
          }}
        />
      )}
    </>
  );
};
```

### Ejemplo 3: Ejercicio M3 con pendingReview

```tsx
// TribunalOpinionesExercise.tsx
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import { submitExercise } from '@/features/progress/api/progressAPI';

// ... setup ...

const handleSubmit = async () => {
  try {
    const response = await submitExercise(
      exercise.id,
      user.id,
      { evaluations }
    );

    // Ejercicios M3 siempre requieren revision manual
    setFeedback({
      type: 'info',
      title: 'Evaluacion Enviada',
      message: response.message || 'Tu trabajo ha sido enviado para revision.',
      pendingReview: true,  // Activa seccion especial en FeedbackModal
    });
    setShowFeedback(true);

  } catch (error) {
    // ... manejo de error ...
  }
};

// En el FeedbackModal con pendingReview=true se muestra:
// - Icono de reloj
// - "Tu progreso ha sido actualizado"
// - "Tu trabajo esta en espera de validacion por tu maestro"
// - Nota: "Las recompensas se asignaran cuando tu maestro complete la evaluacion"
```

### Ejemplo 4: Integracion Completa con SubmitExerciseButton

```tsx
// Ejemplo recomendado para futuros ejercicios
import { SubmitExerciseButton } from '@shared/components/mechanics/SubmitExerciseButton';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import { useExerciseSubmission } from '@/features/exercises/hooks/useExerciseSubmission';

export const NuevoEjercicio = ({ exercise, onComplete }) => {
  const { submitExercise, isSubmitting, result, reset } = useExerciseSubmission();
  const [answers, setAnswers] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const isValid = Object.keys(answers).length >= exercise.minAnswers;
  const isSubmitted = result !== null;

  const handleSubmit = async () => {
    const response = await submitExercise({
      userId: user.id,
      exerciseId: exercise.id,
      answers,
    });

    if (response) {
      setFeedback({
        type: response.is_correct ? 'success' : 'error',
        title: response.is_correct ? 'Correcto!' : 'Intenta de nuevo',
        message: response.feedback,
        score: response.score_percentage,
        xpEarned: response.xp_earned,
        mlCoinsEarned: response.ml_coins_earned,
        showConfetti: response.score_percentage === 100,
      });
      setShowFeedback(true);
    }
  };

  const handleReset = () => {
    setAnswers({});
    reset();
    setShowFeedback(false);
  };

  return (
    <>
      {/* UI del ejercicio */}

      {/* Boton estandarizado */}
      <SubmitExerciseButton
        isSubmitting={isSubmitting}
        isSubmitted={isSubmitted}
        onClick={handleSubmit}
        disabled={!isValid}
        label="Enviar Respuestas"
        variant="gold"
        fullWidth
      />

      {/* Modal de feedback */}
      {feedback && (
        <FeedbackModal
          isOpen={showFeedback}
          feedback={feedback}
          onClose={() => {
            setShowFeedback(false);
            if (feedback.type === 'success') onComplete?.();
          }}
          onRetry={handleReset}
        />
      )}
    </>
  );
};
```

---

## Checklist para Nuevos Ejercicios

Al implementar un nuevo ejercicio, verificar:

- [ ] Usar `submitExercise` de progressAPI (M1-M3) o `useExerciseSubmission` hook (M4-M5)
- [ ] Validar que usuario este autenticado antes de enviar
- [ ] Validar que todas las respuestas requeridas esten completas
- [ ] Preparar payload en formato correcto para el tipo de ejercicio
- [ ] Implementar `FeedbackModal` con todos los campos (score, xpEarned, mlCoinsEarned)
- [ ] Para M3-M5: Usar `pendingReview: true` en feedback
- [ ] Invalidar cache despues de submission exitosa
- [ ] Manejar errores con mensajes amigables
- [ ] Permitir retry si score < 70%

---

*Documento SSOT - GAMILIT Student Portal*
*Version 2.0.0 - 2026-01-20*
