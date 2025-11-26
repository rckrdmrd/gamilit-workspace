# Resumen Ejecutivo: Comparación Flujo Módulo 2

**Fecha:** 2025-11-26  
**Estado:** DetectiveTextual ✅ vs LecturaInferencial ❌

---

## PROBLEMA EN 30 SEGUNDOS

| Métrica | Detective | Lectura Inferencial |
|---------|-----------|-------------------|
| Importa submitExercise | ✓ | ✗ |
| Valida con backend | ✓ | ✗ |
| Score del servidor | ✓ | ✗ (local) |
| Rewards generados | ✓ | ✗ |
| Anti-cheating | ✓ | ✗ |
| Achievements unlock | ✓ | ✗ |
| Ranking actualizado | ✓ | ✗ |

## LO QUE FALTA

```typescript
// Imports (2 líneas)
import { submitExercise } from '@/features/progress/api/progressAPI';
import { useAuth } from '@/features/auth/hooks/useAuth';

// Hook (1 línea)
const { user } = useAuth();

// Estado (1 línea)
const [isSubmitting, setIsSubmitting] = useState(false);

// En handleCheck: cambiar handleCheck() a async y:
const response = await submitExercise(exerciseId, user.id, { questions: userAnswers });
```

---

## DIFERENCIA CLAVE

### DetectiveTextual (FUNCIONA)
```
Usuario → handleSubmitSolution() → submitExercise() → Backend → Rewards ✓
```

### LecturaInferencial (ROTO)
```
Usuario → handleCheck() → Valida LOCAL → No hay backend → Rewards ✗
```

---

## ARCHIVO A CAMBIAR

**Único archivo:** `/apps/frontend/src/features/mechanics/module2/LecturaInferencial/LecturaInferencialExercise.tsx`

**Líneas críticas:**
- Línea 1-7: Agregar imports
- Línea 14: Agregar useAuth
- Línea 20: Agregar isSubmitting state
- Línea 63-133: Refactorizar handleCheck() (hacer async + submitExercise)

**Esfuerzo:** 30 minutos  
**Complejidad:** Baja (copy-paste de DetectiveTextual)

---

## VERIFICACIÓN RÁPIDA

**Antes:** LecturaInferencial línea 63-133
```typescript
const handleCheck = useCallback(() => {
  // ... valida local ...
  const isCorrect = selectedOption === q.correctAnswer; // ❌ LOCAL
  const finalScore = calculateScore(...); // ❌ LOCAL
  // ❌ NO llama submitExercise()
```

**Después:** Debe llamar submitExercise()
```typescript
const handleCheck = useCallback(async () => {
  // ... valida que usuario está autenticado ...
  const response = await submitExercise(...); // ✅ BACKEND
  setFeedback({
    score: response.score, // ✅ DEL SERVIDOR
    isPerfect: response.isPerfect, // ✅ DEL SERVIDOR
  });
```

---

## IMPACTO EN USUARIO

| Escenario | Ahora | Después Fix |
|-----------|-------|-----------|
| Completa ejercicio | Score local (falso) | Score validado (real) |
| Podría falsificar respuestas | SÍ ❌ | NO ✓ |
| Recibe rewards | NO | SÍ |
| Puede subir ranking | NO | SÍ |
| Desbloquea achievements | NO | SÍ |

---

## PRÓXIMOS PASOS

1. Leer documento completo: `FLUJO-COMPARATIVO-EJERCICIOS-MODULO2.md`
2. Aplicar cambios a LecturaInferencialExercise.tsx
3. Probar con curl o Postman:
   ```
   POST /api/progress/submissions/submit
   {
     "userId": "test-user",
     "exerciseId": "lectura-1",
     "answers": {
       "questions": {
         "q1": "0",
         "q2": "1",
         "q3": "2"
       }
     }
   }
   ```
4. Verificar que rewards aparecen en UI

---

## PUNTO DE REFERENCIA

**DetectiveTextual ya funciona correctamente:**
- Línea 17: importa submitExercise ✓
- Línea 18: importa useAuth ✓
- Línea 186: llama submitExercise() ✓
- Línea 189-201: usa response del servidor ✓

**LecturaInferencial debe copiar este patrón.**

