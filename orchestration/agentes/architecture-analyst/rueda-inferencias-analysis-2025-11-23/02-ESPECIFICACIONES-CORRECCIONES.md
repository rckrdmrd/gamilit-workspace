# ESPECIFICACIONES DE CORRECCIONES: Ejercicio 2.5 Rueda de Inferencias

**Fecha:** 2025-11-23
**Analista:** Architecture-Analyst
**Prioridad:** P1 (Alta - afecta experiencia pedagógica)
**Tipo:** Mejora de UX + Corrección de lógica

---

## 📋 OVERVIEW

Este documento especifica las correcciones necesarias para resolver los problemas identificados en el ejercicio "Rueda de Inferencias" (Módulo 2.5).

**Problemas a resolver:**
1. Categorías se repiten en la ruleta
2. Criterios de calificación no diferenciados por categoría
3. Botón "Enviar Respuesta" confuso
4. Falta indicador de progreso

---

## 🔧 CORRECCIÓN 1: Prevenir Repetición de Categorías

### Descripción
Implementar lógica para que la ruleta NO pueda seleccionar una categoría que ya fue elegida en rondas anteriores.

### Agente Responsable
**Frontend-Developer**

### Archivos Afectados
- `apps/frontend/src/features/mechanics/module2/RuedaInferencias/WheelSpinner.tsx`
- `apps/frontend/src/features/mechanics/module2/RuedaInferencias/RuedaInferenciasExercise.tsx`
- `apps/frontend/src/features/mechanics/module2/RuedaInferencias/ruedaInferenciasTypes.ts`

### Especificación Técnica

#### Cambio 1.1: Agregar prop `usedCategories` a WheelSpinner

**Ubicación:** `ruedaInferenciasTypes.ts`

```typescript
export interface WheelSpinnerProps {
  categories: InferenceCategory[];
  isSpinning: boolean;
  onSpinComplete: (selectedCategory: InferenceCategory) => void;
  disabled?: boolean;
  usedCategoryIds?: string[];  // <-- NUEVO: IDs de categorías ya usadas
}
```

#### Cambio 1.2: Filtrar categorías disponibles en WheelSpinner

**Ubicación:** `WheelSpinner.tsx:23-40`

**Código actual (líneas 23-40):**
```typescript
useEffect(() => {
  if (isSpinning) {
    // Generate random rotation (3-5 full rotations + random offset)
    const fullRotations = 3 + Math.random() * 2;
    const randomDegrees = Math.random() * 360;
    const totalRotation = rotation + (fullRotations * 360) + randomDegrees;

    setRotation(totalRotation);

    // Calculate selected category after animation completes
    setTimeout(() => {
      const normalizedRotation = totalRotation % 360;
      const selectedIdx = Math.floor(normalizedRotation / segmentAngle) % categories.length;
      setSelectedIndex(selectedIdx);
      onSpinComplete(categories[selectedIdx]);
    }, 3000);
  }
}, [isSpinning]);
```

**Código propuesto (REEMPLAZAR):**
```typescript
useEffect(() => {
  if (isSpinning) {
    // Filter out already used categories
    const availableCategories = categories.filter(
      cat => !usedCategoryIds?.includes(cat.id)
    );

    // If no available categories (shouldn't happen), use all
    const selectableCategories = availableCategories.length > 0
      ? availableCategories
      : categories;

    // Randomly select from available categories
    const randomIndex = Math.floor(Math.random() * selectableCategories.length);
    const selectedCategory = selectableCategories[randomIndex];

    // Find index in original categories array for visual rotation
    const visualIndex = categories.findIndex(cat => cat.id === selectedCategory.id);
    const targetAngle = visualIndex * segmentAngle;

    // Generate rotation to land on target angle
    const fullRotations = 3 + Math.random() * 2; // 3-5 full rotations
    const totalRotation = rotation + (fullRotations * 360) + targetAngle;

    setRotation(totalRotation);

    // Complete spin after animation
    setTimeout(() => {
      setSelectedIndex(visualIndex);
      onSpinComplete(selectedCategory);
    }, 3000);
  }
}, [isSpinning, usedCategoryIds]);
```

#### Cambio 1.3: Trackear categorías usadas en RuedaInferenciasExercise

**Ubicación:** `RuedaInferenciasExercise.tsx:117`

**Agregar estado:**
```typescript
const [usedCategoryIds, setUsedCategoryIds] = useState<string[]>([]);
```

**Ubicación:** `RuedaInferenciasExercise.tsx:186-198`

**Código actual:**
```typescript
const handleWheelSpinComplete = (category: InferenceCategory) => {
  setSelectedCategory(category);
  setIsWheelSpinning(false);
  setPhase('reading');

  // Update fragment state
  setFragmentStates((prev) =>
    prev.map((state, idx) =>
      idx === currentFragmentIndex ? { ...state, categoryId: category.id } : state
    )
  );
};
```

**Código propuesto (AGREGAR al final):**
```typescript
const handleWheelSpinComplete = (category: InferenceCategory) => {
  setSelectedCategory(category);
  setIsWheelSpinning(false);
  setPhase('reading');

  // Update fragment state
  setFragmentStates((prev) =>
    prev.map((state, idx) =>
      idx === currentFragmentIndex ? { ...state, categoryId: category.id } : state
    )
  );

  // Track used category
  setUsedCategoryIds(prev => [...prev, category.id]);  // <-- NUEVO
};
```

#### Cambio 1.4: Pasar usedCategoryIds a WheelSpinner

**Ubicación:** `RuedaInferenciasExercise.tsx:420`

**Código actual:**
```typescript
<WheelSpinner
  categories={exercise.content.categories}
  isSpinning={isWheelSpinning}
  onSpinComplete={handleWheelSpinComplete}
/>
```

**Código propuesto:**
```typescript
<WheelSpinner
  categories={exercise.content.categories}
  isSpinning={isWheelSpinning}
  onSpinComplete={handleWheelSpinComplete}
  usedCategoryIds={usedCategoryIds}  // <-- NUEVO
/>
```

#### Cambio 1.5: Resetear usedCategoryIds en handleReset

**Ubicación:** `RuedaInferenciasExercise.tsx:308-329`

**Agregar línea:**
```typescript
const handleReset = () => {
  // ... código existente ...
  setUsedCategoryIds([]);  // <-- AGREGAR esta línea
};
```

### Criterios de Aceptación

- ✅ La ruleta NO puede seleccionar una categoría ya usada en rondas previas
- ✅ Si hay 4 categorías y 3 rondas, las 3 rondas tendrán categorías diferentes
- ✅ La animación de la ruleta termina visualmente en la categoría correcta
- ✅ El reset del ejercicio limpia las categorías usadas

### Testing

```typescript
// Test: No repetir categorías
describe('WheelSpinner - No repetir categorías', () => {
  it('no debe seleccionar categorías ya usadas', () => {
    const usedIds = ['cat-literal', 'cat-inferencial'];
    // ... setup component con usedCategoryIds={usedIds}
    // ... girar ruleta
    // ... verificar que selectedCategory.id NO esté en usedIds
  });

  it('debe funcionar con todas las categorías si todas fueron usadas', () => {
    const usedIds = ['cat-literal', 'cat-inferencial', 'cat-critico', 'cat-creativo'];
    // ... setup component con usedCategoryIds={usedIds}
    // ... girar ruleta
    // ... debe seleccionar alguna (fallback)
  });
});
```

---

## 🔧 CORRECCIÓN 2: Criterios de Calificación Diferenciados por Categoría

### Descripción
Implementar criterios de calificación específicos para cada tipo de inferencia (Literal, Inferencial, Crítica, Creativa).

### Agentes Responsables
1. **Database-Developer** - Actualizar seed con keywords por categoría
2. **Backend-Developer** - Implementar lógica de validación por categoría
3. **Frontend-Developer** - Mostrar feedback específico por categoría

### Parte 2.1: Actualización de Base de Datos (Database-Developer)

#### Archivos Afectados
- `apps/database/seeds/prod/educational_content/03-exercises-module2.sql`

#### Especificación: Nueva estructura de `solution`

**Ubicación:** Líneas 482-505

**Estructura actual:**
```json
{
  "validation": {
    "minKeywords": 2,
    "minLength": 20,
    "maxLength": 200
  },
  "fragments": [
    {
      "id": "frag-1",
      "keywords": ["pionera", "radiactividad", "nobel", ...],
      "points": 20
    }
  ]
}
```

**Estructura propuesta (REEMPLAZAR):**
```json
{
  "validation": {
    "minKeywords": 2,
    "minLength": 20,
    "maxLength": 200
  },
  "fragments": [
    {
      "id": "frag-1",
      "text": "Marie Curie fue pionera en el estudio de la radiactividad...",
      "categoryExpectations": {
        "cat-literal": {
          "keywords": ["pionera", "radiactividad", "nobel", "primera", "mujer", "premio"],
          "description": "Identifica hechos explícitos del texto",
          "example": "Marie fue la primera mujer en ganar un Nobel y ganó en dos campos científicos diferentes.",
          "points": 20
        },
        "cat-inferencial": {
          "keywords": ["impacto", "importancia", "consecuencia", "implica", "deducir", "sugiere"],
          "description": "Deduce información no explícita basándose en pistas",
          "example": "El hecho de ganar en dos campos sugiere que Marie tenía conocimientos interdisciplinarios excepcionales.",
          "points": 25
        },
        "cat-critico": {
          "keywords": ["evaluar", "analizar", "considerar", "perspectiva", "contexto", "significa"],
          "description": "Analiza y evalúa críticamente el contenido",
          "example": "Ganar dos Nobeles en una época de discriminación demuestra que Marie superó barreras estructurales significativas.",
          "points": 30
        },
        "cat-creativo": {
          "keywords": ["imaginar", "si", "podría", "nuevo", "relacionar", "aplicar", "innovar"],
          "description": "Genera ideas originales relacionadas con el texto",
          "example": "Si Marie hubiera tenido acceso a tecnología moderna, podría haber descubierto aplicaciones médicas de la radiactividad décadas antes.",
          "points": 25
        }
      }
    },
    {
      "id": "frag-2",
      "text": "A pesar de enfrentar discriminación...",
      "categoryExpectations": {
        "cat-literal": {
          "keywords": ["discriminacion", "mujer", "persistio", "laboratorio", "condiciones"],
          "description": "Identifica hechos explícitos del texto",
          "example": "Marie enfrentó discriminación por ser mujer y trabajó en condiciones difíciles.",
          "points": 20
        },
        "cat-inferencial": {
          "keywords": ["determinacion", "resiliencia", "obstaculos", "motivacion", "supero"],
          "description": "Deduce información no explícita basándose en pistas",
          "example": "Su persistencia a pesar de la discriminación muestra una determinación extraordinaria.",
          "points": 25
        },
        "cat-critico": {
          "keywords": ["injusticia", "desigualdad", "sistema", "cambio", "evaluar", "significado"],
          "description": "Analiza y evalúa críticamente el contenido",
          "example": "La discriminación que enfrentó evidencia las barreras sistemáticas contra mujeres en ciencia del siglo XX.",
          "points": 30
        },
        "cat-creativo": {
          "keywords": ["inspirar", "lecciones", "paralelo", "actual", "aplicar", "futuro"],
          "description": "Genera ideas originales relacionadas con el texto",
          "example": "Marie inspira a científicas actuales a persistir frente a obstáculos similares que aún existen.",
          "points": 25
        }
      }
    },
    {
      "id": "frag-3",
      "text": "Los cuadernos de Marie Curie todavía son radiactivos...",
      "categoryExpectations": {
        "cat-literal": {
          "keywords": ["cuadernos", "radiactivos", "plomo", "descargo", "responsabilidad"],
          "description": "Identifica hechos explícitos del texto",
          "example": "Los cuadernos están en cajas de plomo y requieren un descargo de responsabilidad.",
          "points": 20
        },
        "cat-inferencial": {
          "keywords": ["peligro", "años", "duracion", "exposicion", "consecuencias", "vida"],
          "description": "Deduce información no explícita basándose en pistas",
          "example": "Que los cuadernos sigan radiactivos décadas después indica la vida media prolongada del radio.",
          "points": 25
        },
        "cat-critico": {
          "keywords": ["riesgo", "seguridad", "conocimiento", "epoca", "precio", "ciencia"],
          "description": "Analiza y evalúa críticamente el contenido",
          "example": "Los cuadernos radiactivos son evidencia del precio que Marie pagó por avanzar la ciencia sin conocer los riesgos.",
          "points": 30
        },
        "cat-creativo": {
          "keywords": ["simbolo", "legado", "presente", "futuro", "representa", "reflexion"],
          "description": "Genera ideas originales relacionadas con el texto",
          "example": "Los cuadernos radiactivos son un símbolo tangible de cómo los descubrimientos científicos pueden tener consecuencias duraderas imprevistas.",
          "points": 25
        }
      }
    }
  ]
}
```

#### Migración de datos existentes

**IMPORTANTE:** Este cambio NO es breaking change porque:
- El campo `solution` es JSONB y se puede modificar sin alterar el schema
- Las respuestas ya enviadas por estudiantes NO se verán afectadas
- Solo se mejora la forma de validar respuestas futuras

**Comando para aplicar:**
```sql
-- apps/database/migrations/rueda-inferencias-category-criteria.sql

UPDATE educational_content.exercises
SET solution = '{
  "validation": { ... },  -- JSON completo como arriba
  "fragments": [ ... ]
}'::jsonb
WHERE exercise_type = 'rueda_inferencias'
  AND module_id = (SELECT id FROM educational_content.modules WHERE module_code = 'MOD-02-INFERENCIAL');
```

### Parte 2.2: Lógica de Validación en Backend (Backend-Developer)

#### Archivos Afectados
- `apps/backend/src/modules/progress/services/exercise-submission.service.ts` (crear función de validación)
- `apps/backend/src/modules/progress/dto/responses/` (crear DTO de respuesta con feedback por categoría)

#### Especificación: Función de validación

**Ubicación:** Crear nueva función en `exercise-submission.service.ts`

```typescript
/**
 * Validate Rueda Inferencias answers with category-specific criteria
 */
private validateRuedaInferencias(
  answers: RuedaInferenciasAnswersDto,
  solution: any,
  fragmentStates: FragmentState[]
): {
  score: number;
  maxScore: number;
  feedback: {
    overall: string;
    byFragment: Array<{
      fragmentId: string;
      categoryUsed: string;
      keywordsFound: string[];
      keywordsExpected: string[];
      score: number;
      maxScore: number;
      feedback: string;
    }>;
  };
} {
  let totalScore = 0;
  let maxScore = 0;
  const feedbackByFragment = [];

  const fragments = solution.fragments;

  for (const fragment of fragments) {
    const userAnswer = answers.fragments[fragment.id];

    // Find category used for this fragment
    const fragmentState = fragmentStates.find(fs => fs.fragmentId === fragment.id);
    const categoryId = fragmentState?.categoryId || 'cat-literal'; // default

    const categoryExpectation = fragment.categoryExpectations[categoryId];

    if (!categoryExpectation) {
      // Fallback si no hay expectativas para esa categoría
      continue;
    }

    maxScore += categoryExpectation.points;

    // Validate keywords
    const expectedKeywords = categoryExpectation.keywords;
    const userAnswerLower = userAnswer.toLowerCase();

    const foundKeywords = expectedKeywords.filter(keyword =>
      userAnswerLower.includes(keyword.toLowerCase())
    );

    // Calculate score based on keywords found
    const minKeywords = solution.validation.minKeywords;
    let fragmentScore = 0;

    if (foundKeywords.length >= minKeywords) {
      // Full points if minimum keywords found
      const keywordRatio = Math.min(foundKeywords.length / expectedKeywords.length, 1);
      fragmentScore = Math.round(categoryExpectation.points * keywordRatio);
    }

    totalScore += fragmentScore;

    // Generate feedback
    let feedback = '';
    if (fragmentScore >= categoryExpectation.points * 0.8) {
      feedback = `¡Excelente! Tu inferencia ${categoryExpectation.description.toLowerCase()}.`;
    } else if (fragmentScore >= categoryExpectation.points * 0.5) {
      feedback = `Bien, pero podrías mejorar. ${categoryExpectation.description}. Ejemplo: "${categoryExpectation.example}"`;
    } else {
      feedback = `Intenta nuevamente. ${categoryExpectation.description}. Ejemplo: "${categoryExpectation.example}"`;
    }

    feedbackByFragment.push({
      fragmentId: fragment.id,
      categoryUsed: categoryId,
      keywordsFound: foundKeywords,
      keywordsExpected: expectedKeywords,
      score: fragmentScore,
      maxScore: categoryExpectation.points,
      feedback,
    });
  }

  return {
    score: totalScore,
    maxScore,
    feedback: {
      overall: totalScore >= maxScore * 0.75
        ? '¡Excelente trabajo! Demostraste comprensión de diferentes tipos de inferencias.'
        : 'Buen intento. Revisa los ejemplos para mejorar tus inferencias.',
      byFragment: feedbackByFragment,
    },
  };
}
```

### Parte 2.3: Feedback en Frontend (Frontend-Developer)

#### Archivos Afectados
- `apps/frontend/src/features/mechanics/module2/RuedaInferencias/RuedaInferenciasExercise.tsx`

#### Especificación: Mostrar feedback detallado

**Ubicación:** Modificar el modal de feedback para mostrar detalles por fragmento

```typescript
// En el callback de submitExercise, procesar el feedback detallado:

setFeedback({
  type: response.isPerfect ? 'success' : response.score >= 70 ? 'partial' : 'error',
  title: response.isPerfect ? '¡Perfecto!' : response.score >= 70 ? '¡Buen trabajo!' : 'Intenta de nuevo',
  message: response.feedback.overall,
  score: response.score,
  xpEarned: response.rewards.xp,
  mlCoinsEarned: response.rewards.mlCoins,
  showConfetti: response.isPerfect,
  isCorrect: response.score >= exercise.passing_score,
  details: response.feedback.byFragment, // <-- NUEVO: feedback por fragmento
});
```

**Mostrar en FeedbackModal:**
```tsx
{feedback.details && (
  <div className="mt-4 space-y-3">
    <h4 className="font-semibold">Detalles por ronda:</h4>
    {feedback.details.map((detail, idx) => (
      <div key={idx} className="bg-gray-50 p-3 rounded border">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">Fragmento {idx + 1}</span>
          <span className="text-sm">
            {detail.score}/{detail.maxScore} puntos
          </span>
        </div>
        <p className="text-sm text-gray-700">{detail.feedback}</p>
        {detail.keywordsFound.length > 0 && (
          <div className="mt-2 text-xs">
            <span className="text-green-600">
              ✓ Palabras clave encontradas: {detail.keywordsFound.join(', ')}
            </span>
          </div>
        )}
      </div>
    ))}
  </div>
)}
```

---

## 🔧 CORRECCIÓN 3: Mejorar Flujo UX de Botones

### Descripción
Cambiar el texto y comportamiento de los botones para clarificar el flujo del ejercicio.

### Agente Responsable
**Frontend-Developer**

### Archivos Afectados
- `apps/frontend/src/features/mechanics/module2/RuedaInferencias/RuedaInferenciasExercise.tsx`

### Especificación

#### Cambio 3.1: Texto del botón según ronda

**Ubicación:** `RuedaInferenciasExercise.tsx:518-531`

**Código actual:**
```typescript
<button
  onClick={handleManualSubmit}
  disabled={!isTextValid || !isTimerRunning}
  className={...}
>
  <Send className="w-6 h-6" />
  Enviar Respuesta  {/* <-- Siempre el mismo texto */}
</button>
```

**Código propuesto:**
```typescript
<button
  onClick={handleManualSubmit}
  disabled={!isTextValid || !isTimerRunning}
  className={...}
>
  <Send className="w-6 h-6" />
  {currentFragmentIndex < exercise.content.fragments.length - 1
    ? 'Guardar y Continuar'  // <-- Rondas intermedias
    : 'Guardar Respuesta'}   // <-- Última ronda
</button>
```

#### Cambio 3.2: Agregar indicador de progreso visible

**Ubicación:** `RuedaInferenciasExercise.tsx:366-376` (header)

**Código actual:**
```typescript
<div className="flex items-center gap-4 text-sm">
  <div>
    📊 Fragmento {currentFragmentIndex + 1} de {exercise.content.fragments.length}
  </div>
  <div>⏱️ Tiempo: ...</div>
  {score > 0 && <div>⭐ Puntuación: {score}/100</div>}
</div>
```

**Código propuesto (AGREGAR indicador visual):**
```typescript
<div className="space-y-2">
  <div className="flex items-center gap-4 text-sm">
    <div>
      📊 Ronda {currentFragmentIndex + 1} de {exercise.content.fragments.length}
    </div>
    <div>⏱️ Tiempo: ...</div>
    {score > 0 && <div>⭐ Puntuación: {score}/100</div>}
  </div>

  {/* Barra de progreso visual */}
  <div className="flex gap-2">
    {exercise.content.fragments.map((_, idx) => (
      <div
        key={idx}
        className={`h-2 flex-1 rounded ${
          idx < currentFragmentIndex
            ? 'bg-green-500'  // Completado
            : idx === currentFragmentIndex
            ? 'bg-blue-500 animate-pulse'  // Actual
            : 'bg-gray-300'  // Pendiente
        }`}
      />
    ))}
  </div>
</div>
```

#### Cambio 3.3: Pantalla de resumen antes de envío final

**Ubicación:** Agregar nueva fase antes de `completed`

**Agregar nueva fase:**
```typescript
type GamePhase = 'intro' | 'spinning' | 'reading' | 'writing' | 'summary' | 'completed' | 'feedback';
```

**Modificar handleSaveFragment:**
```typescript
const handleSaveFragment = useCallback(() => {
  // ... código existente para guardar ...

  if (currentFragmentIndex < exercise.content.fragments.length - 1) {
    // Continuar a siguiente fragmento
    setCurrentFragmentIndex((prev) => prev + 1);
    setPhase('intro');
    // ...
  } else {
    // Mostrar resumen antes de enviar
    setPhase('summary');  // <-- CAMBIAR: antes era 'completed'
  }
}, [currentFragmentIndex, currentText, exercise.content.fragments.length]);
```

**Agregar fase de summary en el render:**
```tsx
{/* Summary Phase - Antes de enviar */}
{phase === 'summary' && (
  <AnimatePresence mode="wait">
    <motion.div
      key="summary"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-300">
        <h3 className="text-xl font-bold text-blue-900 mb-4">
          Resumen de tus respuestas
        </h3>

        {fragmentStates.map((state, idx) => (
          <div key={idx} className="mb-4 p-4 bg-white rounded border">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold">Ronda {idx + 1}</span>
              <span className="text-sm text-gray-600">
                (Categoría: {exercise.content.categories.find(c => c.id === state.categoryId)?.name})
              </span>
              <CheckCircle2 className="w-4 h-4 text-green-600 ml-auto" />
            </div>
            <p className="text-sm text-gray-700 italic">
              "{state.userText.substring(0, 100)}..."
            </p>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={() => {
            // Volver a editar última respuesta
            setCurrentFragmentIndex(exercise.content.fragments.length - 1);
            setPhase('writing');
          }}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-4 px-8 rounded-lg"
        >
          Editar Última Respuesta
        </button>

        <button
          onClick={() => {
            setPhase('completed');
            handleSubmitExercise();
          }}
          disabled={isSubmitting}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg flex items-center gap-3"
        >
          <Send className="w-6 h-6" />
          {isSubmitting ? 'Enviando...' : 'Enviar Ejercicio Completo'}
        </button>
      </div>
    </motion.div>
  </AnimatePresence>
)}
```

### Criterios de Aceptación

- ✅ El botón dice "Guardar y Continuar" en rondas intermedias
- ✅ El botón dice "Guardar Respuesta" en la última ronda
- ✅ Se muestra una pantalla de resumen con todas las respuestas antes del envío final
- ✅ Hay un botón claro "Enviar Ejercicio Completo" en la pantalla de resumen
- ✅ La barra de progreso muestra visualmente el avance (rondas completadas vs pendientes)

---

## 🔧 CORRECCIÓN 4 (BONUS): Indicador de Categorías Disponibles

### Descripción
Mostrar visualmente qué categorías ya fueron usadas.

### Agente Responsable
**Frontend-Developer**

### Especificación

**Ubicación:** `RuedaInferenciasExercise.tsx` - Agregar debajo del header

```tsx
{/* Categorías usadas */}
<div className="bg-gray-50 rounded-lg p-4 border">
  <h4 className="text-sm font-semibold text-gray-700 mb-2">
    Categorías seleccionadas:
  </h4>
  <div className="flex gap-2">
    {exercise.content.categories.map(category => {
      const isUsed = usedCategoryIds.includes(category.id);
      return (
        <div
          key={category.id}
          className={`px-3 py-1 rounded text-sm ${
            isUsed
              ? 'bg-green-100 border border-green-500 text-green-800'
              : 'bg-gray-200 text-gray-500'
          }`}
        >
          {category.icon} {category.name}
          {isUsed && ' ✓'}
        </div>
      );
    })}
  </div>
</div>
```

---

## 📊 RESUMEN DE CAMBIOS POR AGENTE

### Frontend-Developer

**Prioridad:** P1 (Alta)
**Archivos:**
- `apps/frontend/src/features/mechanics/module2/RuedaInferencias/WheelSpinner.tsx`
- `apps/frontend/src/features/mechanics/module2/RuedaInferencias/RuedaInferenciasExercise.tsx`
- `apps/frontend/src/features/mechanics/module2/RuedaInferencias/ruedaInferenciasTypes.ts`

**Cambios:**
1. Implementar prevención de repetición de categorías (Corrección 1)
2. Mejorar textos de botones y agregar fase de summary (Corrección 3)
3. Agregar indicador visual de categorías usadas (Corrección 4)
4. Mostrar feedback detallado por fragmento (Parte de Corrección 2)

**Estimación:** 4-6 horas
**Testing requerido:** Unitario + E2E del flujo completo

---

### Backend-Developer

**Prioridad:** P1 (Alta)
**Archivos:**
- `apps/backend/src/modules/progress/services/exercise-submission.service.ts`

**Cambios:**
1. Implementar función de validación con criterios por categoría (Corrección 2.2)
2. Retornar feedback estructurado por fragmento

**Estimación:** 3-4 horas
**Testing requerido:** Unitario de lógica de validación

---

### Database-Developer

**Prioridad:** P1 (Alta)
**Archivos:**
- `apps/database/seeds/prod/educational_content/03-exercises-module2.sql`
- `apps/database/migrations/` (crear nueva migración)

**Cambios:**
1. Actualizar estructura de `solution` con criterios por categoría (Corrección 2.1)
2. Crear migración para aplicar a BD existente

**Estimación:** 2-3 horas
**Testing requerido:** Verificar que seed carga correctamente

---

## ✅ CHECKLIST DE VALIDACIÓN FINAL

Después de todas las implementaciones, verificar:

- [ ] La ruleta NO repite categorías ya seleccionadas
- [ ] Cada categoría tiene keywords y criterios específicos en BD
- [ ] El backend valida respuestas según la categoría seleccionada
- [ ] El frontend muestra feedback detallado por ronda
- [ ] Los botones tienen textos claros ("Guardar y Continuar" vs "Enviar Ejercicio")
- [ ] Hay una pantalla de resumen antes del envío final
- [ ] La barra de progreso muestra el avance de rondas
- [ ] Se muestran visualmente las categorías ya usadas
- [ ] Los tests unitarios y E2E pasan
- [ ] La experiencia del usuario es clara y sin confusiones

---

**Documentado por:** Architecture-Analyst
**Fecha:** 2025-11-23
**Estado:** Especificaciones completas, listas para delegación
**Estimación total:** 9-13 horas de desarrollo
