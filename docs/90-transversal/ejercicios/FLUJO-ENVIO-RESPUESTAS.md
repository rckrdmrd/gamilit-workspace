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
- Frontend Hook: `/apps/frontend/src/features/mechanics/shared/hooks/useExerciseSubmission.ts`
- Backend Controller: `/apps/backend/src/modules/educational/controllers/exercises.controller.ts`
- Backend DTO: `/apps/backend/src/modules/educational/dto/submit-exercise.dto.ts`
- Validator: `/apps/backend/src/modules/progress/dto/answers/exercise-answer.validator.ts`

### Documentacion Relacionada

- Especificaciones M1-M3: `/docs/90-transversal/mecanicas/SPEC-MECANICAS-M1-M3.md`
- Sistema de Recompensas: `/docs/90-transversal/sistema-recompensas/`
- Arquitectura Database: `/docs/90-transversal/arquitectura-database/`

---

*Documento SSOT - GAMILIT Student Portal*
*Version 1.0.0 - 2026-01-20*
