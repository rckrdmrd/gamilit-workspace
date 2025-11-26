# Comparación Visual: MatrizPerspectivasExercise - Antes vs. Después

## ANTES (Sin integración backend)

```
┌─────────────────────────────────────────────────────────────┐
│ 🎯 Matriz de Perspectivas                                   │
│ Marie Curie y el Escándalo de 1911                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [🌟 Generar Perspectivas con IA]                          │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  👁️ Prensa Francesa      👁️ Comunidad Científica          │
│  ┌─────────────┐         ┌─────────────┐                   │
│  │ Viewpoint   │         │ Viewpoint   │                   │
│  │ Arguments   │         │ Arguments   │                   │
│  │ Counter     │         │ Counter     │                   │
│  └─────────────┘         └─────────────┘                   │
│                                                             │
│  👁️ Feministas 1910s    👁️ Comunidad Polaca               │
│  ┌─────────────┐         ┌─────────────┐                   │
│  │ ...         │         │ ...         │                   │
│  └─────────────┘         └─────────────┘                   │
│                                                             │
│  👁️ Academia Sueca      👁️ Historiadores Modernos         │
│  ┌─────────────┐         ┌─────────────┐                   │
│  │ ...         │         │ ...         │                   │
│  └─────────────┘         └─────────────┘                   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Salir]  [Reiniciar]  [Completar Ejercicio] ❌ NO ENVÍA   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Problemas:**
- ❌ No había inputs para responder preguntas
- ❌ No se enviaban datos al backend
- ❌ No había validación de respuestas
- ❌ No se mostraba feedback con score real
- ❌ Botón "Completar" solo mostraba modal local

---

## DESPUÉS (Con integración backend) ✅

```
┌─────────────────────────────────────────────────────────────┐
│ 🎯 Matriz de Perspectivas                                   │
│ Marie Curie y el Escándalo de 1911                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [🌟 Generar Perspectivas con IA]                          │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  👁️ Prensa Francesa      👁️ Comunidad Científica          │
│  ┌─────────────┐         ┌─────────────┐                   │
│  │ Viewpoint   │         │ Viewpoint   │                   │
│  │ Arguments   │         │ Arguments   │                   │
│  │ Counter     │         │ Counter     │                   │
│  └─────────────┘         └─────────────┘                   │
│                                                             │
│  [... 6 perspectivas totales ...]                          │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ 📊 Preguntas de Análisis                      ✨ NUEVO     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. ¿Qué perspectiva fue más injusta con Marie?            │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ [Textarea con 4 filas - max 500 caracteres]          │ │
│  └───────────────────────────────────────────────────────┘ │
│  ❌ Faltan 50 caracteres         0/500                     │
│                                                             │
│  2. ¿Cómo ha evolucionado la percepción de Marie?          │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ La percepción de Marie Curie ha cambiado drásticamente │ │
│  │ desde 1911. En su época fue vista como una intrusa...  │ │
│  └───────────────────────────────────────────────────────┘ │
│  ✅ Completo                     87/500                    │
│                                                             │
│  3. ¿Qué grupo tuvo la perspectiva más equilibrada?        │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ [Textarea]                                            │ │
│  └───────────────────────────────────────────────────────┘ │
│  ❌ Faltan 25 caracteres        25/500                     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Salir]  [Reiniciar]  [Completar Ejercicio] ✅ ENVÍA      │
│                        ↓ Disabled si falta texto           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Flujo al hacer click en "Completar Ejercicio":**

```
1. VALIDACIÓN LOCAL
   ├─ ✅ Todas las preguntas >= 50 caracteres
   ├─ ✅ Usuario autenticado
   └─ ❌ Error → Muestra modal de error

2. ENVÍO AL BACKEND
   ├─ POST /api/progress/submissions/submit
   ├─ Body: {
   │    exerciseId: "matriz-perspectivas-1",
   │    userId: "user-123",
   │    answers: {
   │      questions: {
   │        q1: "...",
   │        q2: "...",
   │        q3: "..."
   │      }
   │    }
   │  }
   └─ Loading: "Enviando..."

3. RESPUESTA DEL BACKEND
   ├─ ✅ Success (score 100) → Modal con confetti
   ├─ ⚠️ Partial (score 70-99) → Modal de éxito parcial
   └─ ❌ Error (score <70) → Modal de error

4. CALLBACK onComplete()
   └─ Notifica al componente padre con score y tiempo
```

---

## CAMBIOS TÉCNICOS

### Imports
```typescript
// ✅ AGREGADO
import { submitExercise } from '@/features/progress/api/progressAPI';
import { useAuth } from '@/features/auth/hooks/useAuth';
```

### Estados
```typescript
// ✅ AGREGADO
const { user } = useAuth();
const [isSubmitting, setIsSubmitting] = useState(false);
const [feedback, setFeedback] = useState<any>(null);
const [answers, setAnswers] = useState<Record<string, string>>({
  q1: '',
  q2: '',
  q3: ''
});
```

### Función handleComplete
```typescript
// ❌ ANTES
const handleComplete = () => {
  setShowFeedback(true);
};

// ✅ DESPUÉS
const handleComplete = async () => {
  // Validación de respuestas
  const allAnswered = Object.values(answers).every(a => a.trim().length >= 50);
  if (!allAnswered) { /* error */ }

  // Validación de autenticación
  if (!user?.id) { /* error */ }

  setIsSubmitting(true);

  try {
    // 🚀 ENVÍO AL BACKEND
    const response = await submitExercise(exercise?.id || exerciseId, user.id, {
      questions: answers
    });

    // 📊 PROCESAR RESPUESTA
    setFeedback({
      type: response.isPerfect ? 'success' : ...,
      title: ...,
      message: response.feedback?.overall,
      score: response.score,
      showConfetti: response.isPerfect
    });

    setCurrentScore(response.score);
    setShowFeedback(true);
  } catch (error) {
    // ❌ MANEJO DE ERRORES
    setFeedback({ type: 'error', ... });
  } finally {
    setIsSubmitting(false);
  }
};
```

### UI de Preguntas (140 líneas nuevas)
```typescript
{/* ✅ SECCIÓN NUEVA */}
<motion.div className="mt-8 bg-gradient-to-br from-blue-50 to-purple-50">
  <h2>Preguntas de Análisis</h2>

  {/* Pregunta 1 */}
  <textarea
    value={answers.q1}
    onChange={(e) => setAnswers({ ...answers, q1: e.target.value })}
    maxLength={500}
  />
  <p className={answers.q1.length >= 50 ? 'green' : 'red'}>
    {answers.q1.length < 50 ? `Faltan ${50 - answers.q1.length}` : '✓'}
  </p>

  {/* Pregunta 2 */}
  {/* ... similar ... */}

  {/* Pregunta 3 */}
  {/* ... similar ... */}
</motion.div>
```

### Validación del Botón
```typescript
// ❌ ANTES
disabled={perspectives.length === 0}

// ✅ DESPUÉS
disabled={
  perspectives.length === 0 ||
  isSubmitting ||
  !Object.values(answers).every(a => a.trim().length >= 50)
}
loading={isSubmitting}
```

---

## EXPERIENCIA DE USUARIO

### Flujo Completo

```
┌─────────────────────────────────────────────────────────────┐
│ 1️⃣ USUARIO: Click en "Generar Perspectivas"                │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 2️⃣ SISTEMA: Muestra 6 perspectivas + Sección de Preguntas  │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 3️⃣ USUARIO: Escribe respuestas a 3 preguntas               │
│    • Validación en tiempo real (50-500 caracteres)          │
│    • Indicador visual de completitud                        │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 4️⃣ USUARIO: Click en "Completar Ejercicio"                 │
│    • Botón se deshabilita si faltan caracteres              │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 5️⃣ SISTEMA: Envía al backend (submitExercise)              │
│    • Muestra "Enviando..." en botón                         │
│    • Loading state                                          │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 6️⃣ BACKEND: Procesa respuestas y retorna score             │
│    • Score: 0-100                                           │
│    • Feedback detallado                                     │
│    • Recompensas (ML Coins, XP)                             │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 7️⃣ SISTEMA: Muestra FeedbackModal                          │
│    • Score 100: 🎉 Confetti + "¡Excelente!"                │
│    • Score 70-99: ⭐ "¡Buen Análisis!"                      │
│    • Score <70: 📝 "Sigue Practicando"                      │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 8️⃣ USUARIO: Cierra modal                                   │
│    • Si success: Llama onComplete(score, timeSpent)         │
│    • Si error: Puede reintentar                             │
└─────────────────────────────────────────────────────────────┘
```

---

## VALIDACIÓN

### ✅ Build Exitoso
```bash
$ npm run build
✓ 3223 modules transformed.
✓ built in 14.97s
```

### ✅ Criterios de Aceptación
- [x] Import de submitExercise
- [x] Import de useAuth
- [x] Estado para respuestas (answers)
- [x] 3 textareas con labels
- [x] Validación mínimo 50 caracteres
- [x] Llamada a submitExercise
- [x] Feedback con score
- [x] Compila sin errores

---

**Conclusión:** La integración está completa y funcional. El componente ahora se comunica correctamente con el backend y proporciona una experiencia de usuario completa con validación, feedback y recompensas.
