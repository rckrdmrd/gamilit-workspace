# Diagrama de Secuencia: Módulo 2 Ejercicios

## 1. DETECTIVE TEXTUAL (FUNCIONAL)

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ TIMELINE: DETECTIVE TEXTUAL EXERCISE - FLUJO CORRECTO                          │
└────────────────────────────────────────────────────────────────────────────────┘

┌─────────────┐              ┌──────────────────┐            ┌──────────────────┐
│   Usuario   │              │ DetectiveTextual │            │   progressAPI    │
│             │              │   Component      │            │   Backend        │
└──────┬──────┘              └────────┬─────────┘            └────────┬─────────┘
       │                              │                               │
       │ 1. Click "Verificar"         │                               │
       ├─────────────────────────────>│                               │
       │                              │                               │
       │                              │ 2. Valida condiciones locales │
       │                              │    - Conexiones válidas?      │
       │                              │    - Usuario autenticado?     │
       │                              │                               │
       │                              │ 3. Prepara DTO               │
       │                              │    { connections: [...] }    │
       │                              │                               │
       │                              │ 4. submitExercise()          │
       │                              ├──────────────────────────────>│
       │                              │                               │
       │                              │    POST /api/progress/        │
       │                              │    submissions/submit         │
       │                              │    Payload: {userId, ...}    │
       │                              │                               │
       │                              │                               │
       │                              │ 5. Backend Validación        │
       │                              │<──────────────────────────────┤
       │                              │    SubmitExerciseResponse     │
       │                              │    {                          │
       │                              │      score: 85,              │
       │                              │      isPerfect: false,       │
       │                              │      rewards: {              │
       │                              │        mlCoins: 20,          │
       │                              │        xp: 100,              │
       │                              │        bonuses: {...}        │
       │                              │      },                      │
       │                              │      feedback: {...},        │
       │                              │      achievements: []        │
       │                              │    }                         │
       │                              │                               │
       │ 6. setFeedback() con server │                               │
       │<─────────────────────────────┤                               │
       │    FeedbackData                                              │
       │                              │                               │
       │ 7. Modal muestra feedback    │                               │
       │    - Score: 85               │                               │
       │    - Rewards: +20 ML, +100XP│                               │
       │                              │                               │
       │ 8. onComplete() callback     │                               │
       ├─────────────────────────────>│                               │
       │    (score, timeSpent)        │                               │
       │                              │                               │
       │ 9. ExercisePage recibe score │                               │
       │    DEL SERVIDOR ✓            │                               │
       └──────────────────────────────┴───────────────────────────────┘

RESULTADO: Usuario recibe REWARDS REALES - Flujo completo funcionando ✓
```

---

## 2. LECTURA INFERENCIAL (INCORRECTO - ACTUAL)

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ TIMELINE: LECTURA INFERENCIAL EXERCISE - FLUJO ROTO                            │
└────────────────────────────────────────────────────────────────────────────────┘

┌─────────────┐              ┌──────────────────┐            ┌──────────────────┐
│   Usuario   │              │  LecturaInferencial  │        │   progressAPI    │
│             │              │   Component      │            │   Backend        │
└──────┬──────┘              └────────┬─────────┘            └────────┬─────────┘
       │                              │                               │
       │ 1. Click "Verificar"         │                               │
       ├─────────────────────────────>│                               │
       │                              │                               │
       │                              │ 2. handleCheck()             │
       │                              │                               │
       │                              │ 3. Valida todas las ques.    │
       │                              │    respondidas?              │
       │                              │                               │
       │                              │ 4. Calcula correctas LOCAL  │
       │                              │    const isCorrect =         │
       │                              │    selectedOption ===        │
       │                              │    q.correctAnswer ❌ LOCAL  │
       │                              │                               │
       │                              │ 5. Calcula score LOCAL       │
       │                              │    finalScore = calculate... │
       │                              │    ❌ SIN VALIDACIÓN         │
       │                              │                               │
       │                              │ ❌ NO LLAMA submitExercise() │
       │                              │ ❌ NO ENVÍA AL BACKEND      │
       │                              │ ❌ NO HAY VALIDACIÓN        │
       │                              │                               │
       │ 6. setFeedback() LOCAL       │                               │
       │<─────────────────────────────┤                               │
       │    FeedbackData (LOCAL)                                      │
       │                              │                               │
       │ 7. Modal muestra feedback    │                               │
       │    - Score: 100 (calculado)  │                               │
       │    ❌ Sin Rewards!           │                               │
       │    ❌ Sin Validation!        │                               │
       │                              │                               │
       │ 8. onComplete() callback     │                               │
       ├─────────────────────────────>│                               │
       │    (score LOCAL, timeSpent)  │                               │
       │                              │                               │
       │ 9. ExercisePage recibe score │                               │
       │    LOCAL (FALSO) ❌          │                               │
       │    Backend nunca se enteró   │                               │
       │    Rewards nunca se dieron   │                               │
       └──────────────────────────────┴───────────────────────────────┘

RESULTADO: Usuario recibe SCORE FALSO - SIN REWARDS - Flujo INCOMPLETO ❌
```

---

## 3. LECTURA INFERENCIAL (CORRECTO - DESPUÉS DE FIX)

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ TIMELINE: LECTURA INFERENCIAL EXERCISE - FLUJO CORREGIDO                       │
└────────────────────────────────────────────────────────────────────────────────┘

┌─────────────┐              ┌──────────────────┐            ┌──────────────────┐
│   Usuario   │              │  LecturaInferencial  │        │   progressAPI    │
│             │              │   Component      │            │   Backend        │
└──────┬──────┘              └────────┬─────────┘            └────────┬─────────┘
       │                              │                               │
       │ 1. Click "Verificar"         │                               │
       ├─────────────────────────────>│                               │
       │                              │                               │
       │                              │ 2. handleCheck() async       │
       │                              │                               │
       │                              │ 3. Valida usuario autent.    │
       │                              │    if (!user?.id) error      │
       │                              │                               │
       │                              │ 4. Prepara DTO               │
       │                              │    { questions: {...} }      │
       │                              │                               │
       │                              │ 5. submitExercise() ✓        │
       │                              ├──────────────────────────────>│
       │                              │                               │
       │                              │    POST /api/progress/       │
       │                              │    submissions/submit        │
       │                              │    Payload: {userId, ...}    │
       │                              │                               │
       │                              │                               │
       │                              │ 6. Backend Validación        │
       │                              │<──────────────────────────────┤
       │                              │    SubmitExerciseResponse     │
       │                              │    {                          │
       │                              │      score: 100, ✓           │
       │                              │      isPerfect: true, ✓      │
       │                              │      rewards: {              │
       │                              │        mlCoins: 30, ✓        │
       │                              │        xp: 150, ✓            │
       │                              │        bonuses: {...}        │
       │                              │      },                      │
       │                              │      feedback: {...}, ✓      │
       │                              │      achievements: [...]  ✓  │
       │                              │    }                         │
       │                              │                               │
       │ 7. setFeedback() server data │                               │
       │<─────────────────────────────┤                               │
       │    FeedbackData                                              │
       │                              │                               │
       │ 8. Modal muestra feedback    │                               │
       │    - Score: 100 (validado)   │                               │
       │    - Rewards: +30 ML, +150XP │                               │
       │    - Achievements unlock ✓   │                               │
       │                              │                               │
       │ 9. onComplete() callback     │                               │
       ├─────────────────────────────>│                               │
       │    (score, timeSpent)        │                               │
       │                              │                               │
       │ 10. ExercisePage recibe      │                               │
       │     score DEL SERVIDOR ✓     │                               │
       │     Rewards ya procesados    │                               │
       └──────────────────────────────┴───────────────────────────────┘

RESULTADO: Usuario recibe SCORE REAL + REWARDS - Flujo COMPLETO ✓
```

---

## 4. COMPARACIÓN DE BRANCHES (Control Flow)

### DetectiveTextual

```
┌─ handleSubmitSolution()
│
├─ 1. Validaciones locales
│  ├─ hasConnections? ✓
│  ├─ hasDiscoveredEvidence? ✓
│  └─ user?.id? ✓
│
├─ 2. setIsSubmitting(true)
│
├─ 3. try {
│  │
│  ├─ Prepara payload { connections: [...] }
│  │
│  ├─ await submitExercise() ← ← ← ENVÍA AL BACKEND
│  │
│  ├─ Recibe response (SubmitExerciseResponse)
│  │
│  ├─ setFeedback({
│  │   type: response.isPerfect ? 'success' : ...,
│  │   score: response.score,        ← DEL SERVIDOR
│  │   rewards: response.rewards,    ← DEL SERVIDOR
│  │ })
│  │
│  └─ setShowFeedback(true)
│
└─ finally {
   └─ setIsSubmitting(false)
   }
```

### LecturaInferencial (ANTES)

```
┌─ handleCheck()
│
├─ 1. Validaciones locales
│  ├─ answeredCount === questions.length? ✓
│  └─ (falta: user?.id?)
│
├─ 2. NO setIsSubmitting()
│
├─ Calcula localmente
│  ├─ validatedAnswers.map(q =>
│  │  const isCorrect = selectedOption === q.correctAnswer ← LOCAL
│  │ )
│  │
│  ├─ finalScore = calculateScore(...) ← LOCAL
│  │
│  └─ setAnswers(validatedAnswers)
│
├─ ❌ NO LLAMA submitExercise()
│
├─ setFeedback({
│  │ type: ...,
│  │ score: finalScore,              ← LOCAL (FALSO)
│  │ (no hay rewards)
│  })
│
└─ setShowFeedback(true)
```

### LecturaInferencial (DESPUÉS)

```
┌─ handleCheck() async ← CAMBIAR A ASYNC
│
├─ 1. Validaciones locales
│  ├─ answeredCount === questions.length? ✓
│  ├─ user?.id? ✓ ← AGREGAR
│  └─ setIsSubmitting(true) ← AGREGAR
│
├─ 2. try {
│  │
│  ├─ Prepara payload { questions: {...} }
│  │
│  ├─ await submitExercise() ← ← ← ENVÍA AL BACKEND (AGREGAR)
│  │
│  ├─ Recibe response (SubmitExerciseResponse)
│  │
│  ├─ setFeedback({
│  │   type: response.isPerfect ? 'success' : ...,
│  │   score: response.score,        ← DEL SERVIDOR (CAMBIAR)
│  │   rewards: response.rewards,    ← DEL SERVIDOR (AGREGAR)
│  │ })
│  │
│  └─ setShowFeedback(true)
│
└─ finally {
   └─ setIsSubmitting(false)
   }
```

---

## 5. COMPONENTES INVOLUCRADOS

```
ARQUITECTURA: Flujo de Datos

┌──────────────────────────────────────────────────────────────┐
│                                                                │
│  ExercisePage                                                  │
│  ├─ handleProgressUpdate()  ← Recibe progreso + respuestas    │
│  ├─ handleSubmit()          ← Envía al backend si es necesario│
│  └─ onProgressUpdate prop   ← Pasa a mecánica               │
│                                                                │
└────────────┬─────────────────────────────────┬────────────────┘
             │                                 │
             │ onProgressUpdate callback      │
             │                                │ onComplete callback
             ↓                                ↓
   ┌─────────────────────────┐    ┌──────────────────────────┐
   │DetectiveTextualExercise │    │LecturaInferencialExercise│
   │                         │    │                          │
   │ handleSubmitSolution()  │    │ handleCheck()            │
   │   ↓                     │    │   ↓                      │
   │ submitExercise() ✓      │    │ submitExercise() ❌      │
   │   ↓                     │    │   (DEBE SER AGREGADO)   │
   │ response del servidor ✓ │    │                          │
   │   ↓                     │    │ Score LOCAL ❌           │
   │ setFeedback() con resp  │    │   (DEBE CAMBIAR)        │
   └──────────┬──────────────┘    └────────────┬─────────────┘
              │                                │
              └────────┬─────────────────────┬─┘
                       │                     │
                       ↓ rewards ✓            ↓ rewards ❌
                  User actualizado      User incompleto
```

---

## 6. PAYLOADS Y RESPONSES

### DetectiveTextual → Backend

```
REQUEST:
POST /api/progress/submissions/submit
{
  "userId": "user-123",
  "exerciseId": "detective-001",
  "answers": {
    "connections": [
      {
        "from": "evidence-1",
        "to": "evidence-2",
        "relationship": "causa"
      },
      {
        "from": "evidence-2",
        "to": "evidence-3",
        "relationship": "contradice"
      }
    ]
  }
}

RESPONSE (200 OK):
{
  "attemptId": "attempt-xyz",
  "score": 85,
  "isPerfect": false,
  "correctAnswersCount": 2,
  "totalQuestions": 3,
  "rewards": {
    "mlCoins": 20,
    "xp": 100,
    "bonuses": {
      "speedBonus": 10
    }
  },
  "feedback": {
    "overall": "¡Buen trabajo!",
    "answerReview": [...]
  },
  "achievements": [],
  "rankUp": null,
  "createdAt": "2025-11-26T10:30:00Z"
}
```

### LecturaInferencial → Backend (DEBE SER)

```
REQUEST:
POST /api/progress/submissions/submit
{
  "userId": "user-123",
  "exerciseId": "lectura-001",
  "answers": {
    "questions": {
      "q1": "0",
      "q2": "2",
      "q3": "1"
    }
  }
}

RESPONSE (200 OK):
{
  "attemptId": "attempt-abc",
  "score": 100,
  "isPerfect": true,
  "correctAnswersCount": 3,
  "totalQuestions": 3,
  "rewards": {
    "mlCoins": 30,
    "xp": 150,
    "bonuses": {
      "perfectScore": 50,
      "speedBonus": 15
    }
  },
  "feedback": {
    "overall": "¡Perfecto!",
    "answerReview": [...]
  },
  "achievements": [
    {
      "id": "perfect-score",
      "name": "Puntuación Perfecta",
      "icon": "trophy",
      "rarity": "legendary"
    }
  ],
  "rankUp": null,
  "createdAt": "2025-11-26T10:35:00Z"
}
```

---

## 7. ESTADO DEL COMPONENT ANTES Y DESPUÉS

### DetectiveTextual - Estado Final ✓

```javascript
{
  progress: {
    investigationId: "detective-001",
    discoveredEvidence: ["evidence-1", "evidence-2", "evidence-3"],
    connections: [
      { id: "conn-1", fromEvidenceId: "e1", toEvidenceId: "e2", relationship: "causa", userCreated: true },
      { id: "conn-2", fromEvidenceId: "e2", toEvidenceId: "e3", relationship: "contradice", userCreated: true }
    ],
    hypotheses: [],
    hintsUsed: 0,
    timeSpent: 180,
    score: 85  ← DEL SERVIDOR ✓
  },
  feedback: {
    type: "partial",
    title: "¡Buen trabajo!",
    message: "Has identificado 2 de 3 conexiones correctamente.",
    score: 85,  ← DEL SERVIDOR ✓
    showConfetti: false
  },
  showFeedback: true,
  validated: true
}
```

### LecturaInferencial - Estado Final (ACTUAL) ❌

```javascript
{
  selectedAnswers: {
    "q1": 0,
    "q2": 1,
    "q3": 2
  },
  answers: [
    { questionId: "q1", selectedOption: 0, isCorrect: true, timeSpent: 30 },
    { questionId: "q2", selectedOption: 1, isCorrect: true, timeSpent: 25 },
    { questionId: "q3", selectedOption: 2, isCorrect: true, timeSpent: 20 }
  ],
  feedback: {
    type: "success",
    title: "¡Excelente trabajo!",
    message: "Respondiste correctamente 3 de 3 preguntas (100%).",
    score: 100,  ← LOCAL (FALSO) ❌
    showConfetti: true
  },
  showFeedback: true,
  validated: true,
  // ❌ NO HAY REWARDS EN FEEDBACK
  // ❌ NO HAY ACHIEVEMENTS
}
```

### LecturaInferencial - Estado Final (DESPUÉS DE FIX) ✓

```javascript
{
  selectedAnswers: {
    "q1": 0,
    "q2": 1,
    "q3": 2
  },
  answers: [
    { questionId: "q1", selectedOption: 0, isCorrect: true, timeSpent: 30 },
    { questionId: "q2", selectedOption: 1, isCorrect: true, timeSpent: 25 },
    { questionId: "q3", selectedOption: 2, isCorrect: true, timeSpent: 20 }
  ],
  feedback: {
    type: "success",
    title: "¡Perfecto!",
    message: "Respondiste correctamente 3 de 3 preguntas.",
    score: 100,  ← DEL SERVIDOR ✓
    showConfetti: true,
    rewards: {  ← AGREGAR (DEL SERVIDOR)
      mlCoins: 30,
      xp: 150,
      bonuses: {
        perfectScore: 50,
        speedBonus: 15
      }
    },
    achievements: [  ← AGREGAR
      {
        id: "perfect-score",
        name: "Puntuación Perfecta",
        icon: "trophy",
        rarity: "legendary"
      }
    ]
  },
  showFeedback: true,
  validated: true,
  isSubmitting: false
}
```

---

## CONCLUSIÓN VISUAL

```
DETECTIVE TEXTUAL        LECTURA INFERENCIAL
      ✓                         ❌

User → Event              User → Event
  ↓                         ↓
Handler                   Handler
  ↓                         ↓
Validate                  Validate
  ↓                         ↓
Backend ← ← ← ← ← ← ← NO BACKEND
  ↓                         ↓
Response                  Local Calc
  ↓                         ↓
Feedback ✓                Feedback ❌
  ↓                         ↓
Rewards ✓                 Rewards ❌
  ↓                         ↓
Complete ✓                Complete (FAKE) ❌
```

