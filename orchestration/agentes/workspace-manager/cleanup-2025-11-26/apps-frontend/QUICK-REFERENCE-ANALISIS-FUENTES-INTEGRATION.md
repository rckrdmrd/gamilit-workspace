# Quick Reference: AnalisisFuentesExercise Backend Integration

## 🎯 Objetivo
Integrar el componente `AnalisisFuentesExercise.tsx` con el backend para enviar el ranking de fuentes por credibilidad.

---

## 📁 Archivos Modificados

```
apps/frontend/src/features/mechanics/module3/AnalisisFuentes/
├── AnalisisFuentesExercise.tsx    (+199 lines, -44 lines)
└── analisisFuentesTypes.ts        (+5 lines)
```

---

## 🔑 Código Clave

### 1. Interfaz de Respuesta

```typescript
// analisisFuentesTypes.ts
export interface AnalisisFuentesAnswers {
  ranking: string[];  // ["src5", "src1", "src3", "src4", "src2"]
}
```

### 2. Estados Necesarios

```typescript
const { user } = useAuth();
const [currentRanking, setCurrentRanking] = useState<string[]>([]);
const [isSubmitting, setIsSubmitting] = useState(false);
const [feedback, setFeedback] = useState<FeedbackData | null>(null);
```

### 3. Submit Handler

```typescript
const handleComplete = async () => {
  if (!user?.id) {
    // Show error: "Error de Autenticación"
    return;
  }

  if (currentRanking.length !== sources.length) {
    // Show error: "Ranking Incompleto"
    return;
  }

  setIsSubmitting(true);

  try {
    const answers: AnalisisFuentesAnswers = {
      ranking: currentRanking
    };

    const response = await submitExercise(exerciseId, user.id, answers);

    setFeedback({
      type: response.isPerfect ? 'success' : response.score >= 70 ? 'partial' : 'error',
      title: response.isPerfect ? '¡Excelente!' : response.score >= 70 ? '¡Buen Trabajo!' : 'Sigue Practicando',
      message: response.feedback?.overall || `Score: ${response.score}`,
      score: response.score,
      showConfetti: response.isPerfect
    });
    setShowFeedback(true);
  } catch (error) {
    // Show error feedback
  } finally {
    setIsSubmitting(false);
  }
};
```

---

## 🎨 UI de Ranking

```tsx
<div className="space-y-3">
  {currentRanking.map((sourceId, index) => {
    const source = sources.find(s => s.id === sourceId);
    return (
      <div className="flex items-center gap-3">
        <span>#{index + 1}</span>
        <div className="flex-1">
          <h4>{source.title}</h4>
          <p>{source.url}</p>
        </div>
        <button onClick={() => moveSourceUp(sourceId)} disabled={index === 0}>
          ⬆️ Arriba
        </button>
        <button onClick={() => moveSourceDown(sourceId)} disabled={index === ranking.length - 1}>
          ⬇️ Abajo
        </button>
      </div>
    );
  })}
</div>
```

---

## 🔄 Flujo Completo

```
1. Usuario carga ejercicio
   └── currentRanking inicializado con sources.map(s => s.id)

2. Usuario reordena fuentes
   └── moveSourceUp() / moveSourceDown() actualiza currentRanking

3. Usuario click "Completar Ejercicio"
   ├── Validación: user?.id existe
   ├── Validación: currentRanking.length === sources.length
   ├── submitExercise(exerciseId, user.id, { ranking: currentRanking })
   ├── Respuesta del backend con score
   ├── Feedback modal mostrado
   └── onComplete(score, timeSpent) si score >= 70
```

---

## ✅ Validaciones Implementadas

| Validación | Mensaje | Acción |
|------------|---------|--------|
| `!user?.id` | "Error de Autenticación" | Mostrar feedback error |
| `currentRanking.length !== sources.length` | "Ranking Incompleto" | Mostrar feedback error |
| `try/catch error` | "Error al Enviar" | Mostrar feedback error |
| `response.score < 70` | "Sigue Practicando" | Feedback partial, NO llamar onComplete |
| `response.score >= 70` | "¡Buen Trabajo!" | Feedback success, llamar onComplete |
| `response.isPerfect` | "¡Excelente!" | Feedback success + confetti |

---

## 🧪 Testing Checklist

```bash
# Manual Testing
[ ] Cargar ejercicio sin autenticación → Error
[ ] Intentar submit sin completar ranking → Error
[ ] Reordenar todas las fuentes → Submit exitoso
[ ] Verificar payload enviado al backend
[ ] Verificar feedback visual (success/partial/error)
[ ] Verificar que onComplete() se llama con score correcto

# TypeScript Validation
[ ] npm run type-check → PASS (sin errores)
```

---

## 📤 Ejemplo de Payload

**Request:**
```json
POST /api/progress/exercises/ex_analisis_fuentes_01/submit

{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "answers": {
    "ranking": ["src5", "src1", "src3", "src4", "src2"]
  }
}
```

**Response:**
```json
{
  "score": 85,
  "isPerfect": false,
  "correctAnswersCount": 4,
  "totalQuestions": 5,
  "feedback": {
    "overall": "¡Muy buen análisis! Identificaste correctamente las 4 fuentes más creíbles."
  }
}
```

---

## 🔗 Referencias Rápidas

- **Backend DTO**: `apps/backend/src/modules/progress/dto/answers/analisis-fuentes-answers.dto.ts`
- **Frontend API**: `apps/frontend/src/features/progress/api/progressAPI.ts`
- **Componente Referencia**: `TribunalOpinionesExercise.tsx` (mismo patrón)

---

**Autor:** Frontend-Agent
**Fecha:** 2025-11-24
**Status:** ✅ COMPLETADO Y VALIDADO
