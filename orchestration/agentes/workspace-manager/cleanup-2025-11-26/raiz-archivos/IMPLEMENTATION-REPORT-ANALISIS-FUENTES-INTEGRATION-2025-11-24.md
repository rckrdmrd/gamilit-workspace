# Reporte de Implementación: Integración Backend AnalisisFuentesExercise

**Fecha:** 2025-11-24
**Agente:** Frontend-Agent
**Tarea:** Integrar componente AnalisisFuentesExercise.tsx con backend usando submitExercise
**Status:** ✅ COMPLETADO

---

## 📋 Resumen Ejecutivo

Se integró exitosamente el componente `AnalisisFuentesExercise.tsx` con el backend, agregando funcionalidad de **ranking de fuentes por credibilidad** y envío de respuestas mediante `submitExercise()`.

### Cambios Principales

1. ✅ **Import de APIs necesarias**: `submitExercise`, `useAuth`
2. ✅ **Interfaz de respuestas**: `AnalisisFuentesAnswers` con campo `ranking: string[]`
3. ✅ **Estado de ranking**: `currentRanking` para almacenar orden de fuentes
4. ✅ **UI de ordenamiento**: Botones ArrowUp/ArrowDown para reordenar fuentes
5. ✅ **Submit al backend**: `handleComplete()` envía ranking mediante `submitExercise()`
6. ✅ **Feedback visual**: Modal con respuesta del backend (score, feedback, confetti)

---

## 🔧 Modificaciones Realizadas

### 1. Archivo: `analisisFuentesTypes.ts`

**Agregado:**
```typescript
// Answers format for backend submission (matches AnalisisFuentesAnswersDto)
export interface AnalisisFuentesAnswers {
  ranking: string[];  // Array of source IDs ordered by credibility (most credible first)
}
```

**Justificación:**
- Alinea 100% con el DTO del backend `AnalisisFuentesAnswersDto`
- Documenta que el ranking debe ir de más creíble (arriba) a menos creíble (abajo)

---

### 2. Archivo: `AnalisisFuentesExercise.tsx`

#### 2.1 Imports Agregados

```typescript
import { submitExercise } from '@/features/progress/api/progressAPI';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { FeedbackData } from '@/shared/components/mechanics/mechanicsTypes';
import type { AnalisisFuentesAnswers } from './analisisFuentesTypes';
import { ArrowUp, ArrowDown, Trophy } from 'lucide-react';
```

#### 2.2 Estados Nuevos

```typescript
const { user } = useAuth();
const [isSubmitting, setIsSubmitting] = useState(false);
const [currentRanking, setCurrentRanking] = useState<string[]>([]);
const [feedback, setFeedback] = useState<FeedbackData | null>(null);
```

#### 2.3 Funciones de Reordenamiento

```typescript
const moveSourceUp = (sourceId: string) => {
  const index = currentRanking.indexOf(sourceId);
  if (index > 0) {
    const newRanking = [...currentRanking];
    [newRanking[index - 1], newRanking[index]] = [newRanking[index], newRanking[index - 1]];
    setCurrentRanking(newRanking);
  }
};

const moveSourceDown = (sourceId: string) => {
  const index = currentRanking.indexOf(sourceId);
  if (index < currentRanking.length - 1) {
    const newRanking = [...currentRanking];
    [newRanking[index], newRanking[index + 1]] = [newRanking[index + 1], newRanking[index]];
    setCurrentRanking(newRanking);
  }
};
```

#### 2.4 Submit Handler Actualizado

```typescript
const handleComplete = async () => {
  // Validate user is authenticated
  if (!user?.id) {
    setFeedback({
      type: 'error',
      title: 'Error de Autenticación',
      message: 'Debes estar autenticado para enviar el ejercicio.'
    });
    setShowFeedback(true);
    return;
  }

  // Validate ranking is complete
  if (currentRanking.length !== sources.length) {
    setFeedback({
      type: 'error',
      title: 'Ranking Incompleto',
      message: 'Debes ordenar todas las fuentes antes de enviar.'
    });
    setShowFeedback(true);
    return;
  }

  setIsSubmitting(true);

  try {
    const answers: AnalisisFuentesAnswers = {
      ranking: currentRanking
    };

    const response = await submitExercise(exerciseId, user.id, answers);

    // Create feedback based on response
    setFeedback({
      type: response.isPerfect ? 'success' : response.score >= 70 ? 'partial' : 'error',
      title: response.isPerfect ? '¡Excelente Análisis!' : response.score >= 70 ? '¡Buen Trabajo!' : 'Sigue Practicando',
      message: response.feedback?.overall || `Has obtenido ${response.score} puntos en el ranking de fuentes.`,
      score: response.score,
      showConfetti: response.isPerfect
    });
    setShowFeedback(true);
  } catch (error) {
    console.error('[AnalisisFuentes] Submission error:', error);
    setFeedback({
      type: 'error',
      title: 'Error al Enviar',
      message: 'Hubo un problema al enviar tu respuesta. Intenta nuevamente.'
    });
    setShowFeedback(true);
  } finally {
    setIsSubmitting(false);
  }
};
```

#### 2.5 Sección UI de Ranking

Se agregó una nueva sección visual entre "Fact Checker" y "Action Buttons":

```tsx
{/* Ranking Section */}
<div className="bg-white rounded-detective p-6 border-2 border-detective-border-light mt-6">
  <div className="flex items-center gap-3 mb-4">
    <Trophy className="w-6 h-6 text-detective-gold" />
    <h3 className="text-detective-lg font-semibold text-detective-blue">
      Ordena las Fuentes por Credibilidad
    </h3>
  </div>
  <p className="text-detective-sm text-detective-text-secondary mb-4">
    Ordena las fuentes de más creíble (arriba) a menos creíble (abajo). Este ranking se enviará al completar el ejercicio.
  </p>
  <div className="space-y-3">
    {currentRanking.map((sourceId, index) => {
      const source = sources.find(s => s.id === sourceId);
      if (!source) return null;
      return (
        <motion.div
          key={sourceId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200"
        >
          <div className="flex items-center gap-2 min-w-[80px]">
            <span className="text-2xl font-bold text-detective-orange">
              #{index + 1}
            </span>
          </div>
          <div className="flex-1">
            <h4 className="text-detective-base font-semibold">{source.title}</h4>
            <p className="text-detective-xs text-detective-text-secondary">{source.url}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => moveSourceUp(sourceId)}
              disabled={index === 0}
              className="p-2 rounded-lg bg-detective-blue text-white hover:bg-detective-blue-dark disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Mover arriba (más creíble)"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => moveSourceDown(sourceId)}
              disabled={index === currentRanking.length - 1}
              className="p-2 rounded-lg bg-detective-orange text-white hover:bg-detective-orange-dark disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Mover abajo (menos creíble)"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      );
    })}
  </div>
</div>
```

#### 2.6 Botón de Completar Actualizado

```tsx
<DetectiveButton
  variant="primary"
  onClick={handleComplete}
  disabled={isSubmitting}
  loading={isSubmitting}
>
  {isSubmitting ? 'Enviando...' : 'Completar Ejercicio'}
</DetectiveButton>
```

#### 2.7 FeedbackModal Actualizado

```tsx
{/* Feedback Modal */}
{feedback && (
  <FeedbackModal
    isOpen={showFeedback}
    feedback={feedback}
    onClose={() => {
      setShowFeedback(false);
      if (feedback.type === 'success' || (feedback.score && feedback.score >= 70)) {
        onComplete?.(feedback.score || 0, timeSpent);
      }
    }}
    onRetry={handleReset}
  />
)}
```

---

## ✅ Criterios de Aceptación Cumplidos

| Criterio | Status | Notas |
|----------|--------|-------|
| Import de submitExercise agregado | ✅ | Línea 11 |
| Import de useAuth agregado | ✅ | Línea 12 |
| Estado para almacenar ranking de fuentes | ✅ | `currentRanking: string[]` |
| Llamada a submitExercise con formato {ranking: string[]} | ✅ | Líneas 197-202 |
| Manejo de error try/catch | ✅ | Líneas 213-220 |
| Feedback mostrado al usuario | ✅ | Líneas 204-212 |
| Compila sin errores TypeScript | ✅ | Validado con `tsc --noEmit` |
| NO modifica lógica de drag & drop existente | ✅ | Solo se agregaron botones de ordenamiento simples |
| Mantiene compatibilidad con props existentes | ✅ | No se modificaron props |
| Llama onComplete() después de submit exitoso | ✅ | Líneas 505-508 |

---

## 🎨 Flujo de Usuario

1. **Analizar fuentes** (opcional): El usuario puede hacer click en cada fuente para ver su análisis de credibilidad
2. **Verificar afirmaciones** (opcional): El usuario puede usar el fact-checker para verificar claims
3. **Ordenar fuentes** (OBLIGATORIO):
   - El usuario ve todas las fuentes listadas con botones ⬆️ ⬇️
   - Usa los botones para ordenar de más creíble (#1) a menos creíble (#N)
4. **Completar ejercicio**:
   - Click en "Completar Ejercicio"
   - Validación de autenticación y ranking completo
   - Envío al backend mediante `submitExercise()`
   - Mostrar feedback con score y mensaje del backend
   - Si score ≥ 70, llamar a `onComplete()` con score y timeSpent

---

## 🔄 Integración con Backend

### Endpoint Consumido
```
POST /api/progress/exercises/:exerciseId/submit
```

### Payload Enviado
```json
{
  "userId": "uuid",
  "answers": {
    "ranking": ["src5", "src1", "src3", "src4", "src2"]
  }
}
```

### Respuesta Esperada
```typescript
interface SubmitExerciseResponse {
  score: number;
  isPerfect: boolean;
  correctAnswersCount?: number;
  totalQuestions?: number;
  feedback?: {
    overall: string;
    details?: any;
  };
}
```

---

## 🧪 Testing Recomendado

### Manual
1. Cargar ejercicio sin autenticación → Error: "Error de Autenticación"
2. Intentar completar sin ordenar → Error: "Ranking Incompleto"
3. Ordenar todas las fuentes → Envío exitoso
4. Verificar que el ranking enviado coincida con el orden visual
5. Verificar feedback visual (success, partial, error) según score

### Automatizado (Propuesto)
```typescript
describe('AnalisisFuentesExercise - Backend Integration', () => {
  it('should submit ranking to backend when complete button clicked', async () => {
    // Arrange: Mock submitExercise
    // Act: User reorders sources and clicks complete
    // Assert: submitExercise called with correct ranking
  });

  it('should show success feedback when score >= 70', async () => {
    // Arrange: Mock response with score 85
    // Act: Complete exercise
    // Assert: Success feedback shown
  });

  it('should not submit if user not authenticated', async () => {
    // Arrange: Mock useAuth to return null user
    // Act: Click complete
    // Assert: Error feedback shown, submitExercise not called
  });
});
```

---

## 📝 Notas Adicionales

### Respuesta Correcta Esperada
Según comentarios en el código:
```typescript
// La respuesta correcta es: ["src5", "src1", "src3", "src4", "src2"]
```

### Diferencia con Implementación Anterior
- **Antes**: El componente NO enviaba respuestas al backend
- **Después**: El componente envía el ranking mediante `submitExercise()` y muestra feedback basado en la respuesta del servidor

### Compatibilidad
- ✅ Compatible con `TribunalOpinionesExercise.tsx` (mismo patrón de submit)
- ✅ Compatible con `FeedbackModal` existente
- ✅ Compatible con `progressAPI.ts` y `SubmitExerciseResponse`

---

## 📚 Referencias

- **Backend DTO**: `apps/backend/src/modules/progress/dto/answers/analisis-fuentes-answers.dto.ts`
- **Frontend API**: `apps/frontend/src/features/progress/api/progressAPI.ts`
- **Componente Referencia**: `apps/frontend/src/features/mechanics/module3/TribunalOpiniones/TribunalOpinionesExercise.tsx`
- **Prompt Seguido**: `orchestration/prompts/PROMPT-FRONTEND-AGENT.md`

---

**Reporte generado por:** Frontend-Agent (Claude Code)
**Validación TypeScript:** ✅ PASS (sin errores)
**Status Final:** ✅ LISTO PARA TESTING
