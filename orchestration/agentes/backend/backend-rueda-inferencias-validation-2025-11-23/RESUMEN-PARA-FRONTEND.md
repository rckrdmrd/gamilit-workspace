# RESUMEN PARA FRONTEND-DEVELOPER: Rueda de Inferencias API

**Fecha:** 2025-11-23
**De:** Backend-Developer
**Para:** Frontend-Developer
**Estado:** ✅ Backend COMPLETADO - Listo para integración

---

## 🎯 QUÉ SE IMPLEMENTÓ

Se implementó la validación de respuestas del ejercicio "Rueda de Inferencias" con criterios diferenciados por categoría.

**El backend ahora:**
- ✅ Valida respuestas usando keywords específicas por categoría
- ✅ Retorna feedback detallado por fragmento
- ✅ Calcula puntuación proporcional a keywords encontradas
- ✅ Maneja correctamente las 4 categorías: Literal, Inferencial, Crítico, Creativo

---

## 📥 QUÉ DEBE ENVIAR EL FRONTEND

### Formato de Submission

Al enviar el ejercicio, el frontend debe incluir:

```typescript
POST /api/progress/submissions/submit
{
  exerciseId: "uuid-del-ejercicio",
  answers: {
    fragments: {
      "frag-1": "texto de respuesta del usuario para fragmento 1...",
      "frag-2": "texto de respuesta del usuario para fragmento 2...",
      "frag-3": "texto de respuesta del usuario para fragmento 3..."
    },
    fragmentStates: [
      {
        fragmentId: "frag-1",
        categoryId: "cat-literal",      // IMPORTANTE: categoría seleccionada por la ruleta
        userText: "texto de respuesta...",
        timeSpent: 45
      },
      {
        fragmentId: "frag-2",
        categoryId: "cat-inferencial",  // IMPORTANTE: categoría seleccionada por la ruleta
        userText: "texto de respuesta...",
        timeSpent: 60
      },
      {
        fragmentId: "frag-3",
        categoryId: "cat-critico",      // IMPORTANTE: categoría seleccionada por la ruleta
        userText: "texto de respuesta...",
        timeSpent: 55
      }
    ]
  }
}
```

**⚠️ CRÍTICO:** El array `fragmentStates` es **OBLIGATORIO** para que el backend pueda validar con las keywords correctas de cada categoría.

---

## 📤 QUÉ RETORNA EL BACKEND

### Respuesta Exitosa

```typescript
{
  id: "submission-uuid",
  score: 65,              // Puntuación total obtenida
  maxScore: 100,          // Puntuación máxima posible (depende de categorías)
  isCorrect: true,        // true si score >= passing_score (70)
  status: "graded",
  feedback: "¡Excelente trabajo! Demostraste comprensión de diferentes tipos de inferencias.",

  // ⭐ NUEVO: Feedback detallado por fragmento
  details: {
    byFragment: [
      {
        fragmentId: "frag-1",
        categoryUsed: "cat-literal",
        keywordsFound: ["pionera", "radiactividad", "nobel", "primera", "mujer"],  // Keywords detectadas
        keywordsExpected: ["pionera", "radiactividad", "nobel", "primera", "mujer", "cientifico", "premio", "campos", "unica"],
        score: 12,          // Puntuación de este fragmento
        maxScore: 20,       // Máximo posible para esta categoría
        feedback: "Bien, pero podrías mejorar. Identifica hechos explícitos del texto. Ejemplo: 'Marie fue la primera mujer en ganar un Nobel y ganó en dos campos científicos diferentes.'"
      },
      {
        fragmentId: "frag-2",
        categoryUsed: "cat-inferencial",
        keywordsFound: ["determinacion", "resiliencia", "obstaculos", "supero"],
        keywordsExpected: ["determinacion", "resiliencia", "obstaculos", "motivacion", "supero", "fortaleza", "compromiso", "vocacion"],
        score: 13,
        maxScore: 25,
        feedback: "Bien, pero podrías mejorar. Deduce información no explícita basándose en pistas. Ejemplo: 'Su persistencia muestra determinación extraordinaria.'"
      },
      {
        fragmentId: "frag-3",
        categoryUsed: "cat-critico",
        keywordsFound: ["evaluar", "analizar", "contexto", "significa", "barreras", "estructural"],
        keywordsExpected: ["evaluar", "analizar", "considerar", "perspectiva", "contexto", "significa", "barreras", "historico", "estructural"],
        score: 20,
        maxScore: 30,
        feedback: "¡Excelente! Tu inferencia analiza y evalúa críticamente el contenido."
      }
    ],
    maxScore: 75            // Suma de maxScore de cada fragmento
  },

  // Rewards ganadas
  xpEarned: 65,
  mlCoinsEarned: 6
}
```

---

## 🎨 CÓMO MOSTRAR EL FEEDBACK DETALLADO

### Ejemplo de Implementación en FeedbackModal

```tsx
// En RuedaInferenciasExercise.tsx, al recibir la respuesta del backend:

const handleSubmitExercise = async () => {
  const response = await submitExercise(exerciseId, {
    fragments: {
      "frag-1": fragment1Text,
      "frag-2": fragment2Text,
      "frag-3": fragment3Text
    },
    fragmentStates: fragmentStates  // Array de { fragmentId, categoryId, userText, timeSpent }
  });

  setFeedback({
    type: response.isCorrect ? 'success' : 'partial',
    title: response.isCorrect ? '¡Buen trabajo!' : 'Sigue practicando',
    message: response.feedback,
    score: response.score,
    xpEarned: response.xpEarned,
    mlCoinsEarned: response.mlCoinsEarned,
    details: response.details  // ⭐ NUEVO: feedback detallado
  });
};

// En el modal de feedback:
{feedback.details && (
  <div className="mt-4 space-y-3">
    <h4 className="font-semibold text-lg">Detalles por ronda:</h4>
    {feedback.details.byFragment.map((detail, idx) => {
      const categoryNames = {
        'cat-literal': 'Literal',
        'cat-inferencial': 'Inferencial',
        'cat-critico': 'Crítico',
        'cat-creativo': 'Creativo'
      };

      return (
        <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          {/* Header con puntuación */}
          <div className="flex justify-between items-center mb-3">
            <div>
              <span className="font-medium">Fragmento {idx + 1}</span>
              <span className="ml-2 text-sm text-gray-600">
                ({categoryNames[detail.categoryUsed]})
              </span>
            </div>
            <span className="text-lg font-bold">
              {detail.score}/{detail.maxScore} pts
            </span>
          </div>

          {/* Feedback pedagógico */}
          <p className="text-sm text-gray-700 mb-3">{detail.feedback}</p>

          {/* Keywords encontradas */}
          {detail.keywordsFound.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-semibold text-green-700 mb-1">
                ✓ Palabras clave encontradas ({detail.keywordsFound.length}/{detail.keywordsExpected.length}):
              </p>
              <div className="flex flex-wrap gap-1">
                {detail.keywordsFound.map((keyword, i) => (
                  <span key={i} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Indicador visual de progreso */}
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  (detail.score / detail.maxScore) >= 0.8 ? 'bg-green-500' :
                  (detail.score / detail.maxScore) >= 0.5 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${(detail.score / detail.maxScore) * 100}%` }}
              />
            </div>
          </div>
        </div>
      );
    })}
  </div>
)}
```

---

## 📊 PUNTUACIÓN POR CATEGORÍA

Cada categoría tiene diferente puntuación máxima:

| Categoría | Puntos Máximos | Descripción |
|-----------|----------------|-------------|
| **Literal** | 20 puntos | Identifica hechos explícitos |
| **Inferencial** | 25 puntos | Deduce información implícita |
| **Crítico** | 30 puntos | Analiza y evalúa críticamente |
| **Creativo** | 25 puntos | Genera ideas originales |

**Ejemplo de puntuación total:**
- Si ruleta selecciona: Literal + Inferencial + Crítico
- Puntuación máxima = 20 + 25 + 30 = **75 puntos**

---

## 🔍 CÓMO FUNCIONA LA VALIDACIÓN

1. **Backend recibe** las respuestas + fragmentStates
2. **Para cada fragmento:**
   - Identifica qué categoría usó el estudiante (de fragmentStates)
   - Obtiene las keywords esperadas para esa categoría
   - Busca las keywords en la respuesta del usuario (case-insensitive)
   - Calcula score: `round(categoryPoints * (keywordsFound / keywordsExpected))`
3. **Genera feedback:**
   - Si score >= 80% → "¡Excelente!"
   - Si score >= 50% → "Bien, pero podrías mejorar..." + ejemplo
   - Si score < 50% → "Intenta nuevamente..." + ejemplo
4. **Retorna** resultado con score total y detalles por fragmento

---

## ✅ CHECKLIST DE INTEGRACIÓN

### Envío de Datos

- [ ] Frontend envía `fragmentStates` array con cada submission
- [ ] Cada fragmentState incluye: fragmentId, categoryId, userText, timeSpent
- [ ] categoryId corresponde a la categoría seleccionada por la ruleta
- [ ] Los IDs de fragmentos coinciden con los del ejercicio en BD

### Mostrar Feedback

- [ ] Modal de feedback muestra puntuación total
- [ ] Modal muestra detalles por cada fragmento (ronda)
- [ ] Se muestran keywords encontradas
- [ ] Se muestra feedback pedagógico específico
- [ ] Se indica la categoría usada en cada ronda
- [ ] Indicador visual de progreso por fragmento

### Testing

- [ ] Probar con respuesta perfecta (todas las keywords)
- [ ] Probar con respuesta parcial (algunas keywords)
- [ ] Probar con respuesta incorrecta (ninguna keyword)
- [ ] Probar con diferentes combinaciones de categorías
- [ ] Verificar que puntuación total se calcula correctamente

---

## 🐛 TROUBLESHOOTING

### "Score siempre es 0"
**Causa:** No se están enviando fragmentStates o categoryId es incorrecto
**Solución:** Verificar que el array fragmentStates se envía correctamente

### "Feedback genérico, no específico por categoría"
**Causa:** fragmentStates no incluye categoryId
**Solución:** Asegurar que cada fragmentState tiene categoryId de la ruleta

### "KeywordsFound vacío pero debería haber coincidencias"
**Causa:** El texto del usuario no incluye las palabras exactas
**Solución:** La validación es case-insensitive pero busca palabras exactas (no sinónimos)

---

## 📞 CONTACTO

Si tienes dudas sobre la integración, revisa:
- **Traza completa:** `orchestration/agentes/backend/backend-rueda-inferencias-validation-2025-11-23/TRAZA-IMPLEMENTACION.md`
- **Casos de prueba:** `orchestration/agentes/architecture-analyst/rueda-inferencias-analysis-2025-11-23/04-GUIA-PRUEBAS-RESPUESTAS.md`
- **Tests unitarios:** `apps/backend/src/modules/progress/services/__tests__/exercise-submission.service.spec.ts`

---

**Backend listo para integración ✅**
**Próximo paso:** Frontend-Developer implementa visualización de feedback detallado

---

**Preparado por:** Backend-Developer
**Fecha:** 2025-11-23
**Versión:** 1.0
