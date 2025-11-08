# Educational API

**Proyecto:** Gamilit Platform
**Módulo:** API Reference
**Categoría:** Educational Content
**Archivo original:** API-REFERENCE.md
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## Tipos Utilizados

Esta API utiliza los siguientes tipos definidos en [tipos-compartidos](../../tipos-compartidos/):

### DifficultyLevel (Enum)
**Fuente:** [TYPES-EDUCATIONAL-MODULES.md](../../tipos-compartidos/TYPES-EDUCATIONAL-MODULES.md#difficultylevel)

```typescript
type DifficultyLevel =
  | 'very_easy'      // Muy fácil
  | 'easy'           // Fácil
  | 'beginner'       // Principiante
  | 'intermediate'   // Intermedio
  | 'medium'         // Medio
  | 'advanced'       // Avanzado
  | 'hard'           // Difícil
  | 'very_hard';     // Muy difícil
```

**Uso en API:** Campo `difficulty` en módulos y ejercicios.

### ExerciseType (Enum)
**Fuente:** [TYPES-EDUCATIONAL-MODULES.md](../../tipos-compartidos/TYPES-EDUCATIONAL-MODULES.md#exercisetype)

27 mecánicas educativas disponibles:
- **Módulo 1:** crucigrama_cientifico, crucigrama, linea_tiempo, timeline, sopa_letras, mapa_conceptual, emparejamiento, verdadero_falso, completar_espacios
- **Módulo 2:** detective_textual, construccion_hipotesis, prediccion_narrativa, puzzle_contexto, rueda_inferencias
- **Módulo 3:** analisis_fuentes, debate_digital, matriz_perspectivas, podcast_argumentativo, tribunal_opiniones
- **Módulo 4:** verificador_fakenews, fake_news, quiz_tiktok, navegacion_hipertextual, analisis_memes, infografia_interactiva, email_formal, chat_literario, ensayo_argumentativo, resena_critica
- **Módulo 5:** diario_multimedia, comic_digital, video_carta

**Uso en API:** Campo `exerciseType` en ejercicios.

### Module (Interface)
**Fuente:** [TYPES-EDUCATIONAL-MODULES.md](../../tipos-compartidos/TYPES-EDUCATIONAL-MODULES.md#module)

Campos clave:
- `difficulty_level?: DifficultyLevel`
- `xp_reward?: number`
- `ml_coins_reward?: number`
- `exercises_count?: number`

### Exercise (Interface)
**Fuente:** [TYPES-EDUCATIONAL-MODULES.md](../../tipos-compartidos/TYPES-EDUCATIONAL-MODULES.md#exercise)

Campos clave:
- `type: ExerciseType`
- `difficulty_level?: DifficultyLevel`
- `max_attempts?: number`
- `enable_hints?: boolean`

---

## Modules Endpoints

### GET /api/educational/modules
Listar módulos

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Module 1: Literal Comprehension",
      "description": "...",
      "orderIndex": 1,
      "difficulty": "beginner",
      "totalExercises": 15,
      "estimatedDuration": 120,
      "xpReward": 100,
      "mlCoinsReward": 50
    }
  ]
}
```

---

### GET /api/educational/modules/:id
Detalle de módulo

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Module 1",
    "description": "...",
    "exercises": [
      {
        "id": "uuid",
        "title": "Crucigrama Cientifico",
        "exerciseType": "crucigrama_cientifico",
        "difficulty": "beginner",
        "isUnlocked": true
      }
    ],
    "progressPercentage": 45,
    "completedExercises": 7
  }
}
```

---

## Exercises Endpoints

### GET /api/educational/exercises/:id
Detalle de ejercicio

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Crucigrama Cientifico",
    "instructions": "...",
    "exerciseType": "crucigrama_cientifico",
    "difficulty": "beginner",
    "content": {
      "grid": { "rows": 10, "cols": 10 },
      "clues": {
        "across": [...],
        "down": [...]
      }
    },
    "rewards": {
      "xp": 20,
      "mlCoins": 10
    },
    "allowHints": true,
    "maxAttempts": 3,
    "userProgress": {
      "attempts": 1,
      "bestScore": 85,
      "completed": false
    }
  }
}
```

---

### POST /api/educational/exercises/:id/submit
Enviar respuesta de ejercicio

**Request:**
```json
{
  "userId": "uuid",
  "answers": { "question_1": "answer_1" },
  "timeSpent": 180,
  "powerupsUsed": ["pista"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "attemptId": "uuid",
    "score": 85,
    "isPerfect": false,
    "correctAnswers": 17,
    "totalQuestions": 20,
    "rewards": {
      "mlCoins": 8,
      "xp": 17,
      "bonuses": { "speedBonus": 5 }
    },
    "feedback": {
      "overall": "Great job!",
      "answerReview": [...]
    },
    "achievements": []
  }
}
```

---

**Última actualización:** 2025-11-01
