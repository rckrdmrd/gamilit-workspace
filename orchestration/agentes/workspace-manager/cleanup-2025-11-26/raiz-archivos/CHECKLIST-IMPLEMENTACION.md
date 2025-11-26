# Checklist de Implementación: Fix LecturaInferencial

**Archivo:** `/apps/frontend/src/features/mechanics/module2/LecturaInferencial/LecturaInferencialExercise.tsx`

---

## PASO 1: AGREGAR IMPORTS

- [ ] Agregar línea 8: `import { submitExercise } from '@/features/progress/api/progressAPI';`
- [ ] Agregar línea 9: `import { useAuth } from '@/features/auth/hooks/useAuth';`

**Verificación:** Los imports deben estar después de otros imports

---

## PASO 2: OBTENER USER DEL HOOK

- [ ] En el componente, después de la desestructuración de props (línea 14):
  ```typescript
  const { user } = useAuth();
  ```

**Verificación:** `user` debe estar disponible en todo el componente

---

## PASO 3: AGREGAR ESTADO isSubmitting

- [ ] Agregar después del estado `startTime` (línea 20):
  ```typescript
  const [isSubmitting, setIsSubmitting] = useState(false);
  ```

**Verificación:** Estado debe estar en el bloque de useState declarations

---

## PASO 4: REFACTORIZAR handleCheck()

### 4.1 Cambiar firma a async
- [ ] Línea 63: Cambiar `const handleCheck = useCallback(() => {`
  a `const handleCheck = useCallback(async () => {`

### 4.2 Mantener rama de "ya validado"
- [ ] Línea 64-85: Mantener el bloque `if (validated) { ... return; }`
  - Este código muestra los resultados nuevamente si ya fue validado

### 4.3 Mantener validación de preguntas respondidas
- [ ] Línea 88-97: Mantener el bloque que valida que todas estén respondidas
  - Este código verifica `answeredCount < questions.length`

### 4.4 AGREGAR validación de usuario
- [ ] Antes de `setIsSubmitting(true)`, agregar:
  ```typescript
  // Validar que usuario está autenticado
  if (!user?.id) {
    setFeedback({
      type: 'error',
      title: 'Error de Autenticación',
      message: 'Debes estar autenticado para enviar el ejercicio.',
    });
    setShowFeedback(true);
    return;
  }
  ```

### 4.5 AGREGAR setIsSubmitting(true)
- [ ] Antes del try-catch, agregar:
  ```typescript
  setIsSubmitting(true);
  ```

### 4.6 ENVOLVER EN try-catch
- [ ] Reemplazar el código LOCAL de cálculo con:

```typescript
try {
  // Preparar respuestas en formato DTO
  const userAnswers: Record<string, string> = {};
  Object.entries(selectedAnswers).forEach(([questionId, optionIndex]) => {
    userAnswers[questionId] = String(optionIndex);
  });

  // CRÍTICO: Enviar al backend
  const response = await submitExercise(exerciseId, user.id, { 
    questions: userAnswers 
  });

  // Marcar como validado
  setValidated(true);

  // Mostrar feedback DEL SERVIDOR
  setFeedback({
    type: response.isPerfect ? 'success' : response.score >= 70 ? 'partial' : 'error',
    title: response.isPerfect
      ? '¡Perfecto!'
      : response.score >= 70
        ? '¡Buen trabajo!'
        : 'Intenta de nuevo',
    message: response.feedback?.overall || 
      `Respondiste correctamente ${response.correctAnswersCount} de ${response.totalQuestions} preguntas.`,
    score: response.score,  // DEL SERVIDOR
    showConfetti: response.isPerfect,  // DEL SERVIDOR
  });

  // Guardar respuestas validadas
  const validatedAnswers: QuestionAnswer[] = questions.map((q) => {
    const selectedOption = selectedAnswers[q.id];
    return {
      questionId: q.id,
      selectedOption,
      isCorrect: response.feedback?.answerReview?.find(a => a.questionId === q.id)?.isCorrect || false,
      timeSpent: Math.floor((new Date().getTime() - startTime.getTime()) / 1000),
    };
  });

  setAnswers(validatedAnswers);
  setShowFeedback(true);

  console.log('✅ [LecturaInferencial] Submission successful:', {
    attemptId: response.attemptId,
    score: response.score,
    rewards: response.rewards,
  });
} catch (error) {
  console.error('❌ [LecturaInferencial] Submission error:', error);
  setFeedback({
    type: 'error',
    title: 'Error al Enviar',
    message: 'Hubo un problema al enviar tu respuesta. Por favor, intenta nuevamente.',
  });
  setShowFeedback(true);
} finally {
  setIsSubmitting(false);
}
```

### 4.7 ACTUALIZAR dependencies del useCallback
- [ ] Línea 266-272 (final del useCallback):
  Cambiar `[selectedAnswers, validated, answers, questions, startTime]`
  a `[selectedAnswers, validated, answers, questions, startTime, user, exerciseId]`

---

## PASO 5: NO CAMBIAR OTROS MÉTODOS

- [ ] `handleSelectOption()` - Sin cambios (línea 54-61)
- [ ] `handleReset()` - Sin cambios (línea 135-141)
- [ ] `actionsRef` effect - Sin cambios (línea 144-151)
- [ ] `getInferenceTypeLabel()` - Sin cambios (línea 153-163)
- [ ] Render JSX - Sin cambios (línea 165-354)

**Verificación:** Solo modificar la lógica de handleCheck, no el UI

---

## PASO 6: TESTING

### 6.1 Test manual básico
- [ ] Abre LecturaInferencial en navegador
- [ ] Selecciona todas las respuestas
- [ ] Haz click en "Verificar"
- [ ] Verifica que se abre la consola del navegador
- [ ] Busca log: `✅ [LecturaInferencial] Submission successful`
- [ ] Verifica que `feedback.rewards` aparece en la modal

### 6.2 Test con DevTools
- [ ] Abre Chrome DevTools (F12)
- [ ] Ve a Network tab
- [ ] Selecciona todas las respuestas
- [ ] Haz click en "Verificar"
- [ ] Busca request POST a `/api/progress/submissions/submit`
- [ ] Verifica payload:
  ```json
  {
    "userId": "...",
    "exerciseId": "...",
    "answers": {
      "questions": {
        "q1": "0",
        "q2": "1",
        ...
      }
    }
  }
  ```
- [ ] Verifica que response incluye `rewards` y `score`

### 6.3 Test de error
- [ ] Sin estar autenticado, intenta completar ejercicio
- [ ] Debe aparecer error: "Error de Autenticación"
- [ ] El botón "Verificar" debe estar deshabilitado mientras se envía

---

## PASO 7: VALIDACIÓN DE CÓDIGO

### 7.1 Lint
- [ ] Ejecutar: `npm run lint` o `eslint apps/frontend/src/features/mechanics/module2/LecturaInferencial/`
- [ ] Verificar que no hay errores

### 7.2 Type checking
- [ ] Ejecutar: `npm run type-check` o similar
- [ ] Verificar que LecturaInferencialExercise.tsx compila sin errores

### 7.3 Imports
- [ ] Verificar que `submitExercise` existe en progressAPI
- [ ] Verificar que `useAuth` existe y está exportado

---

## PASO 8: COMPARACIÓN CON DETECTIVE TEXTUAL

- [ ] Comparar estructura de `handleCheck()` con `handleSubmitSolution()` de DetectiveTextual
- [ ] Verificar que ambos:
  - [ ] Validan usuario autenticado
  - [ ] Preparan payload en DTO format
  - [ ] Llaman `submitExercise()`
  - [ ] Usan `response` del servidor para feedback
  - [ ] Tienen try-catch con error handling

---

## CAMBIOS RESUMIDOS

| Línea | Cambio | Antes | Después |
|-------|--------|-------|---------|
| 1-9 | Importar submitExercise, useAuth | 7 imports | 9 imports |
| 14 | useAuth hook | N/A | `const { user } = useAuth();` |
| 20 | isSubmitting state | N/A | `const [isSubmitting, setIsSubmitting] = useState(false);` |
| 63 | handleCheck signature | `() => {` | `async () => {` |
| 174 | User validation | N/A | `if (!user?.id) { error }` |
| 180 | setIsSubmitting | N/A | `setIsSubmitting(true);` |
| 182 | try block | N/A | try-catch-finally |
| 188 | submitExercise call | N/A | `await submitExercise(...)` |
| 195 | Score source | Local | `response.score` |
| 200 | isPerfect source | Local | `response.isPerfect` |
| 266 | useCallback deps | Old deps | New deps + user + exerciseId |

---

## ARCHIVOS DE REFERENCIA

**Para copiar código, ver:**
- Funcional: `/apps/frontend/src/features/mechanics/module2/DetectiveTextual/DetectiveTextualExercise.tsx`
- Línea 17: Imports
- Línea 27: useAuth
- Línea 29: isSubmitting state
- Línea 149-220: handleSubmitSolution (patrón a seguir)
- Línea 186: submitExercise call
- Línea 189-201: Usar response

**Documentación adicional:**
- Completa: `FLUJO-COMPARATIVO-EJERCICIOS-MODULO2.md`
- Resumen: `RESUMEN-EJECÚTIVO-MÓDULO2.md`
- Diagramas: `DIAGRAMA-SECUENCIA-MÓDULO2.md`

---

## VERIFICACIÓN FINAL

- [ ] Archivo compila sin errores
- [ ] No hay warnings de linting
- [ ] submitExercise es importado
- [ ] useAuth es importado
- [ ] handleCheck es async
- [ ] submitExercise es llamado con DTO format correcto
- [ ] response del servidor es usado para feedback
- [ ] Rewards aparecen en la modal
- [ ] User recibe score validado
- [ ] Error handling está en place
- [ ] Tests manuales pasan
- [ ] Comportamiento es idéntico a DetectiveTextual

---

## TIEMPO ESTIMADO

- Lectura: 10 minutos
- Implementación: 20 minutos
- Testing: 10 minutos
- **Total: 40 minutos**

---

## NOTAS

- Si encuentras dificultades, compara línea por línea con DetectiveTextual
- El patrón es exactamente el mismo, solo con diferentes datos (connections vs questions)
- Si el backend retorna error, verifica payload format en Network tab
- Si no ves rewards, verifica que response incluye `rewards` field

