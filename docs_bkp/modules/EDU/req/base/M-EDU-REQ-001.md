
<!-- MIGRADO A SIMCO V2 -->
<!-- ID Original: RF-EDU-001 -->
<!-- ID Nuevo: M-EDU-REQ-001 -->
<!-- Fecha de Migración: 2025-11-07 -->

# M-EDU-REQ-001: Mecánicas de Ejercicios

## 📋 Metadata

| Campo | Valor |
|-------|-------|
| **ID** | RF-EDU-001 |
| **Módulo** | 03 - Contenido Educativo |
| **Título** | Mecánicas de Ejercicios |
| **Prioridad** | Crítica |
| **Estado** | ✅ Implementado |
| **Versión** | 1.0 |
| **Fecha Creación** | 2025-11-07 |
| **Última Actualización** | 2025-11-07 |
| **Autor** | Database Team, Pedagogical Team |
| **Stakeholders** | Product Owner, Content Team, UX Team, Backend Team, Frontend Team |

---

## 🔗 Referencias

### Implementación DDL

🗄️ **ENUM Canónico:**
- **Ubicación:** `apps/database/ddl/00-prerequisites.sql:59-65`
- **Tipo:** `educational_content.exercise_mechanic`
- **Valores:** 31 mecánicas diferentes

🗄️ **Tablas Relacionadas:**
1. **`educational_content.exercises`**
   - **Ubicación:** `apps/database/ddl/schemas/educational_content/tables/exercises.sql`
   - **Columnas clave:**
     - `mechanic` (ENUM exercise_mechanic)
     - `difficulty` (ENUM difficulty_level)
     - `content` (JSONB, estructura variable según mecánica)
     - `answer_key` (JSONB)
     - `hints` (JSONB array)

2. **`educational_content.exercise_templates`**
   - **Ubicación:** `apps/database/ddl/schemas/educational_content/tables/exercise_templates.sql`
   - **Propósito:** Plantillas reutilizables por mecánica
   - **Columnas clave:**
     - `mechanic` (ENUM exercise_mechanic)
     - `template_structure` (JSONB)

### Especificación Técnica

📘 **Documento ET Relacionado:**
- [ET-EDU-001: Implementación de Mecánicas de Ejercicios](../../02-especificaciones-tecnicas/03-contenido-educativo/ET-EDU-001-mecanicas-ejercicios.md)

### Documentos Relacionados

- [RF-EDU-002: Niveles de Dificultad](./RF-EDU-002-niveles-dificultad.md) - 8 niveles de dificultad
- [RF-EDU-003: Taxonomía de Bloom](./RF-EDU-003-taxonomia-bloom.md) - Clasificación cognitiva
- [RF-PRG-001: Tracking de Progreso](../04-progreso-seguimiento/RF-PRG-001-tracking-progreso.md) - Intentos de ejercicios
- [RF-GAM-002: Sistema de Comodines](../02-gamificacion/RF-GAM-002-comodines.md) - Comodines en ejercicios
- [MAPEO: Requerimientos → Implementación](../../03-desarrollo/base-de-datos/MAPEO-REQUERIMIENTOS-IMPLEMENTACION.md#módulo-3-contenido-educativo)

---

## 📖 Descripción General

### Propósito

El **Sistema de Mecánicas de Ejercicios** define 31 tipos diferentes de ejercicios interactivos que cubren diversos aspectos del aprendizaje del idioma maya yucateco. Cada mecánica:

- Tiene una estructura de contenido específica
- Requiere un tipo de respuesta diferente
- Valida respuestas con lógica única
- Proporciona feedback adaptado
- Se adapta a diferentes niveles de dificultad

### Contexto Pedagógico

Las 31 mecánicas se agrupan en **7 categorías** según el objetivo pedagógico:

| Categoría | Mecánicas | Objetivo |
|-----------|-----------|----------|
| **Vocabulario** | 6 mecánicas | Reconocimiento y memorización de palabras |
| **Gramática** | 8 mecánicas | Comprensión y aplicación de reglas |
| **Lectura** | 4 mecánicas | Comprensión de textos |
| **Escritura** | 4 mecánicas | Producción escrita |
| **Audio** | 3 mecánicas | Comprensión auditiva |
| **Pronunciación** | 2 mecánicas | Producción oral |
| **Cultura** | 4 mecánicas | Conocimiento cultural maya |

### Alcance

**Incluye:**
- ✅ 31 mecánicas de ejercicios diferentes
- ✅ Estructura de contenido estandarizada (JSONB)
- ✅ Validación de respuestas por mecánica
- ✅ Sistema de hints (pistas) por mecánica
- ✅ Scoring y feedback automático
- ✅ Adaptabilidad a diferentes dificultades

**Excluye:**
- ❌ Generación automática de contenido (se crea manualmente)
- ❌ Traducción automática
- ❌ AI para corrección de escritura libre

---

## ⚙️ Requerimientos Funcionales

### Categoría 1: Vocabulario (6 mecánicas)

#### 1.1. Multiple Choice (Selección Múltiple)

**ID:** `multiple_choice`
**Descripción:** Seleccionar la respuesta correcta entre 4 opciones

**Estructura de contenido:**
```json
{
  "question": "¿Qué significa 'k'áak''?",
  "options": [
    { "id": "a", "text": "Fuego" },
    { "id": "b", "text": "Agua" },
    { "id": "c", "text": "Tierra" },
    { "id": "d", "text": "Aire" }
  ],
  "correct_answer": "a"
}
```

**Validación:**
- Respuesta: `{ "selected": "a" }`
- Correcto si: `selected === correct_answer`

---

#### 1.2. Fill in the Blank (Completar el Espacio)

**ID:** `fill_in_blank`
**Descripción:** Escribir la palabra que completa la oración

**Estructura:**
```json
{
  "sentence": "Le ___ ku ts'o'okol u k'áatik.",
  "blank_position": 1,
  "correct_answer": "paal",
  "context": "El niño está pidiendo agua",
  "accept_variations": ["páal", "paal"]
}
```

**Validación:**
- Normalizar respuesta (quitar acentos opcionales)
- Verificar contra `accept_variations`

---

#### 1.3. Matching Pairs (Emparejar)

**ID:** `matching_pairs`
**Descripción:** Conectar palabras en maya con su traducción

**Estructura:**
```json
{
  "pairs": [
    { "id": 1, "maya": "k'áak'", "spanish": "fuego" },
    { "id": 2, "maya": "ha'", "spanish": "agua" },
    { "id": 3, "maya": "lu'um", "spanish": "tierra" },
    { "id": 4, "maya": "ik'", "spanish": "viento" }
  ],
  "randomize": true
}
```

**Validación:**
- Respuesta: `[{ maya_id: 1, spanish_id: 1 }, ...]`
- Correcto si todos los pares coinciden

---

#### 1.4. Flashcard (Tarjeta de Memoria)

**ID:** `flashcard`
**Descripción:** Recordar la traducción de una palabra mostrada

**Estructura:**
```json
{
  "front": "k'áak'",
  "back": "fuego",
  "direction": "maya_to_spanish"
}
```

---

#### 1.5. Word Search (Sopa de Letras)

**ID:** `word_search`
**Descripción:** Encontrar palabras mayas en una grilla

**Estructura:**
```json
{
  "grid": [
    ["K", "A", "A", "K"],
    ["H", "A", "X", "T"],
    ...
  ],
  "words_to_find": ["KAAK", "HA", "LUUM"],
  "size": { "rows": 10, "cols": 10 }
}
```

---

#### 1.6. Image Association (Asociación con Imagen)

**ID:** `image_association`
**Descripción:** Seleccionar la palabra maya que corresponde a la imagen

**Estructura:**
```json
{
  "image_url": "/images/fire.jpg",
  "options": ["k'áak'", "ha'", "lu'um", "ik'"],
  "correct_answer": "k'áak'"
}
```

---

### Categoría 2: Gramática (8 mecánicas)

#### 2.1. Verb Conjugation (Conjugación Verbal)

**ID:** `verb_conjugation`
**Descripción:** Conjugar verbo en tiempo/persona correcta

**Estructura:**
```json
{
  "verb_infinitive": "han",
  "tense": "present",
  "person": "first_singular",
  "prompt": "Yo como",
  "correct_answer": "kin hant",
  "accept_variations": ["ki'n hant", "kin hant"]
}
```

---

#### 2.2. Sentence Builder (Constructor de Oraciones)

**ID:** `sentence_builder`
**Descripción:** Ordenar palabras para formar oración correcta

**Estructura:**
```json
{
  "words": ["Le", "paal", "ku", "han"],
  "correct_order": [0, 1, 2, 3],
  "translation": "El niño come"
}
```

---

#### 2.3. Error Detection (Detección de Errores)

**ID:** `error_detection`
**Descripción:** Identificar el error gramatical en la oración

**Estructura:**
```json
{
  "sentence": "Le paal ku hano",
  "error_position": 3,
  "error_type": "verb_conjugation",
  "correction": "hant"
}
```

---

#### 2.4. Sentence Transformation (Transformación)

**ID:** `sentence_transformation`
**Descripción:** Transformar oración (afirmativa → negativa, etc.)

**Estructura:**
```json
{
  "original": "Kin han",
  "transform_to": "negative",
  "correct_answer": "Ma' kin hant"
}
```

---

#### 2.5. Pronoun Selection (Selección de Pronombre)

**ID:** `pronoun_selection`
**Descripción:** Elegir el pronombre correcto

**Estructura:**
```json
{
  "sentence": "___ ku han",
  "context": "Él come",
  "options": ["Teen", "Le", "Tech"],
  "correct_answer": "Le"
}
```

---

#### 2.6. Possessive Forms (Formas Posesivas)

**ID:** `possessive_forms`
**Descripción:** Construir forma posesiva correcta

**Estructura:**
```json
{
  "noun": "nah",
  "owner": "first_singular",
  "correct_answer": "in nah",
  "translation": "mi casa"
}
```

---

#### 2.7. Pluralization (Pluralización)

**ID:** `pluralization`
**Descripción:** Convertir palabra a plural

**Estructura:**
```json
{
  "singular": "paal",
  "correct_plural": "paalal",
  "translation": "niños"
}
```

---

#### 2.8. Aspect Markers (Marcadores de Aspecto)

**ID:** `aspect_markers`
**Descripción:** Identificar/usar marcador de aspecto correcto

**Estructura:**
```json
{
  "sentence_template": "___ han",
  "aspect": "progressive",
  "correct_marker": "táan",
  "complete_sentence": "Táan in hant"
}
```

---

### Categoría 3: Lectura (4 mecánicas)

#### 3.1. Reading Comprehension (Comprensión Lectora)

**ID:** `reading_comprehension`
**Descripción:** Responder preguntas sobre un texto

**Estructura:**
```json
{
  "text": "Le ch'upalo'ob ku bin xíimbal ti' le k'áaxo'... (300 palabras)",
  "questions": [
    {
      "id": 1,
      "question": "¿A dónde van las niñas?",
      "type": "multiple_choice",
      "options": ["Al bosque", "A la milpa", "A la ciudad"],
      "correct_answer": "Al bosque"
    },
    ...
  ]
}
```

---

#### 3.2. True or False (Verdadero o Falso)

**ID:** `true_or_false`
**Descripción:** Determinar si afirmación sobre texto es verdadera

**Estructura:**
```json
{
  "text": "Le paal ku ts'aik ja' ti' le wakax",
  "statement": "El niño da agua a la vaca",
  "correct_answer": true
}
```

---

#### 3.3. Inference (Inferencia)

**ID:** `inference`
**Descripción:** Inferir información implícita del texto

**Estructura:**
```json
{
  "text": "Le ch'upal ku yantal ti' le k'áan. U yich ku siis",
  "question": "¿Cómo se siente la niña?",
  "correct_answer": "cansada",
  "accept_synonyms": ["fatigada", "agotada"]
}
```

---

#### 3.4. Sequence Ordering (Orden de Secuencia)

**ID:** `sequence_ordering`
**Descripción:** Ordenar eventos de una narrativa

**Estructura:**
```json
{
  "text": "Historia larga...",
  "events": [
    "El niño fue al cenote",
    "Encontró una tortuga",
    "La llevó a su casa",
    "La liberó en el río"
  ],
  "correct_order": [0, 1, 2, 3]
}
```

---

### Categoría 4: Escritura (4 mecánicas)

#### 4.1. Free Writing (Escritura Libre)

**ID:** `free_writing`
**Descripción:** Escribir 2-3 oraciones sobre un tema

**Estructura:**
```json
{
  "prompt": "Describe tu familia en maya",
  "min_words": 15,
  "max_words": 50,
  "rubric": {
    "grammar": 30,
    "vocabulary": 30,
    "coherence": 40
  }
}
```

**Nota:** Requiere revisión manual o AI

---

#### 4.2. Sentence Completion (Completar Oración)

**ID:** `sentence_completion`
**Descripción:** Completar oración con coherencia

**Estructura:**
```json
{
  "prompt": "Le paal ku bin ti'...",
  "correct_answers": [
    "le naj",
    "u nah",
    "le k'aax"
  ],
  "min_words": 2
}
```

---

#### 4.3. Translation (Traducción)

**ID:** `translation`
**Descripción:** Traducir oración de español a maya

**Estructura:**
```json
{
  "spanish": "El niño está comiendo tortillas",
  "correct_maya": "Le paal táan u hantik waaj",
  "accept_variations": [
    "Le paal ku hantik waaj",
    "Táan u hantik waaj le paalo'"
  ]
}
```

---

#### 4.4. Dictation (Dictado)

**ID:** `dictation`
**Descripción:** Escribir lo que se escucha en audio

**Estructura:**
```json
{
  "audio_url": "/audio/sentence_123.mp3",
  "correct_text": "Le paal ku bin ti' le k'aax",
  "accept_minor_errors": true,
  "max_errors_allowed": 2
}
```

---

### Categoría 5: Audio (3 mecánicas)

#### 5.1. Listening Comprehension (Comprensión Auditiva)

**ID:** `listening_comprehension`
**Descripción:** Responder preguntas sobre audio

**Estructura:**
```json
{
  "audio_url": "/audio/conversation_maya.mp3",
  "transcript": "...",
  "questions": [
    {
      "question": "¿De qué hablan?",
      "type": "multiple_choice",
      "options": [...],
      "correct_answer": "..."
    }
  ]
}
```

---

#### 5.2. Audio Matching (Emparejar Audio)

**ID:** `audio_matching`
**Descripción:** Emparejar audio con texto/imagen

**Estructura:**
```json
{
  "audios": [
    { "id": 1, "url": "/audio/word1.mp3" },
    { "id": 2, "url": "/audio/word2.mp3" }
  ],
  "texts": [
    { "id": "a", "text": "k'áak'" },
    { "id": "b", "text": "ha'" }
  ],
  "correct_pairs": [
    { "audio": 1, "text": "a" },
    { "audio": 2, "text": "b" }
  ]
}
```

---

#### 5.3. Tone Recognition (Reconocimiento de Tonos)

**ID:** `tone_recognition`
**Descripción:** Identificar tono glotal correcto

**Estructura:**
```json
{
  "audio_url": "/audio/kaak_vs_kak.mp3",
  "question": "¿La palabra tiene glotal (') o no?",
  "correct_answer": "yes_glottal",
  "word_written": "k'áak'"
}
```

---

### Categoría 6: Pronunciación (2 mecánicas)

#### 6.1. Speech Recording (Grabación de Voz)

**ID:** `speech_recording`
**Descripción:** Grabar pronunciación de palabra/frase

**Estructura:**
```json
{
  "prompt": "Pronuncia: 'K'aaba' in k'aaba' Pedro'",
  "reference_audio_url": "/audio/reference_pedro.mp3",
  "evaluation_criteria": {
    "glottal_stops": true,
    "tones": true,
    "clarity": true
  }
}
```

**Nota:** Requiere evaluación con Speech Recognition AI

---

#### 6.2. Pronunciation Comparison (Comparación)

**ID:** `pronunciation_comparison`
**Descripción:** Escuchar dos pronunciaciones y elegir correcta

**Estructura:**
```json
{
  "word": "k'áak'",
  "audio_option_a": "/audio/correct_kaak.mp3",
  "audio_option_b": "/audio/incorrect_kaak.mp3",
  "correct_option": "a"
}
```

---

### Categoría 7: Cultura (4 mecánicas)

#### 7.1. Cultural Context (Contexto Cultural)

**ID:** `cultural_context`
**Descripción:** Preguntas sobre cultura maya

**Estructura:**
```json
{
  "question": "¿Qué significa 'Halach Uinic'?",
  "type": "multiple_choice",
  "options": [
    "Sacerdote",
    "Gobernante",
    "Guerrero",
    "Campesino"
  ],
  "correct_answer": "Gobernante"
}
```

---

#### 7.2. Historical Timeline (Línea de Tiempo)

**ID:** `historical_timeline`
**Descripción:** Ordenar eventos históricos mayas

**Estructura:**
```json
{
  "events": [
    "Período Preclásico",
    "Período Clásico",
    "Período Posclásico"
  ],
  "correct_order": [0, 1, 2]
}
```

---

#### 7.3. Cultural Artifact (Artefacto Cultural)

**ID:** `cultural_artifact`
**Descripción:** Identificar artefacto maya

**Estructura:**
```json
{
  "image_url": "/images/estela_maya.jpg",
  "question": "¿Qué es este objeto?",
  "correct_answer": "Estela",
  "additional_info": "Las estelas registraban eventos importantes"
}
```

---

#### 7.4. Traditional Practice (Práctica Tradicional)

**ID:** `traditional_practice`
**Descripción:** Preguntas sobre prácticas tradicionales

**Estructura:**
```json
{
  "practice": "Ha'nal Pixan",
  "question": "¿Cuándo se celebra Ha'nal Pixan?",
  "type": "multiple_choice",
  "options": ["Enero", "Abril", "Octubre-Noviembre", "Diciembre"],
  "correct_answer": "Octubre-Noviembre"
}
```

---

## 💼 Casos de Uso

### CU-EDU-001-001: Resolver Ejercicio Multiple Choice

**Actor:** Estudiante
**Precondiciones:**
- Usuario autenticado
- Ejercicio asignado o disponible

**Flujo Principal:**

1. Usuario selecciona ejercicio de vocabulario (multiple_choice)
2. Sistema muestra:
   - Pregunta: "¿Qué significa 'k'áak''?"
   - 4 opciones: A) Fuego, B) Agua, C) Tierra, D) Aire
3. Usuario selecciona opción "A"
4. Usuario presiona "Verificar"
5. Sistema valida:
   ```typescript
   const correct = userAnswer === "a"; // true
   ```
6. Sistema muestra:
   - ✅ "¡Correcto!"
   - Otorga 15 XP
   - Otorga 5 ML Coins
7. Sistema registra intento en `exercise_attempts`

**Postcondiciones:**
- Ejercicio marcado como completado
- XP y ML Coins acreditados
- Progress tracking actualizado

---

### CU-EDU-001-002: Usar Comodín "Pista" en Ejercicio

**Actor:** Estudiante
**Precondiciones:**
- Usuario en ejercicio activo
- Usuario tiene pistas disponibles

**Flujo Principal:**

1. Usuario intenta ejercicio de gramática (verb_conjugation)
2. Usuario no sabe la respuesta
3. Usuario presiona "💡 Usar Pista" (tiene 5 disponibles)
4. Sistema:
   - Deduce 1 pista del inventario
   - Muestra pista #1: "Este verbo es irregular en presente"
5. Usuario intenta responder, falla
6. Usuario presiona "💡 Usar Pista" nuevamente
7. Sistema muestra pista #2: "El marcador de aspecto es 'táan'"
8. Usuario intenta y acierta
9. Sistema otorga XP completo (sin penalización)

**Postcondiciones:**
- 2 pistas usadas
- Ejercicio completado
- XP otorgado

---

## 🔒 Consideraciones de Seguridad

### 1. Validación de Respuestas

| Riesgo | Mitigación |
|--------|------------|
| **Manipulación de respuestas en frontend** | Validación SIEMPRE en backend |
| **Timing attacks (ver respuesta en código)** | Answer key nunca enviado al frontend |
| **Bypass de límites de intentos** | Validación en DB con triggers |

### 2. Código Backend

```typescript
// ❌ NUNCA enviar answer_key al frontend
// ✅ Solo enviar después de validar

async getExercise(exerciseId: string) {
  const exercise = await this.exerciseRepo.findOne(exerciseId);

  // Remover answer_key antes de enviar
  const { answer_key, ...exerciseForFrontend } = exercise;

  return exerciseForFrontend;
}

async submitAnswer(userId: string, exerciseId: string, answer: any) {
  // Obtener answer_key en backend
  const exercise = await this.exerciseRepo.findOne(exerciseId);

  // Validar según mecánica
  const isCorrect = this.validateAnswer(exercise.mechanic, answer, exercise.answer_key);

  return { correct: isCorrect };
}
```

---

## ✅ Criterios de Aceptación

### CA-EDU-001-001: Estructura de Ejercicios

- [ ] Cada ejercicio tiene campo `mechanic` (ENUM con 31 valores)
- [ ] Contenido se almacena en JSONB flexible
- [ ] Estructura de contenido validada según mecánica
- [ ] Answer key nunca se expone en frontend

### CA-EDU-001-002: Validación de Respuestas

- [ ] Cada mecánica tiene lógica de validación específica
- [ ] Validación ocurre en backend
- [ ] Respuestas con variaciones aceptadas se reconocen
- [ ] Feedback específico por mecánica

### CA-EDU-001-003: Integración con Gamificación

- [ ] Completar ejercicio otorga XP según dificultad
- [ ] Otorga ML Coins
- [ ] Puede desbloquear achievements
- [ ] Comodines funcionan en ejercicios elegibles

### CA-EDU-001-004: Sistema de Hints

- [ ] Hasta 3 hints por ejercicio
- [ ] Hints progresivos (más específicos cada vez)
- [ ] Usar hint deduce del inventario
- [ ] Hints almacenados en campo `hints` (JSONB array)

---

## 🧪 Testing

### Test Case 1: Validar Respuesta Correcta (Multiple Choice)

```typescript
test('Multiple choice exercise validates correct answer', async () => {
  // Arrange
  const exercise = await createExercise({
    mechanic: 'multiple_choice',
    content: {
      question: "¿Qué significa 'k'áak''?",
      options: [
        { id: 'a', text: 'Fuego' },
        { id: 'b', text: 'Agua' },
        { id: 'c', text: 'Tierra' },
        { id: 'd', text: 'Aire' }
      ]
    },
    answer_key: { correct_answer: 'a' }
  });

  const user = await createUser();

  // Act
  const result = await exerciseService.submitAnswer(
    user.id,
    exercise.id,
    { selected: 'a' }
  );

  // Assert
  expect(result.correct).toBe(true);
  expect(result.xp_earned).toBeGreaterThan(0);
});
```

### Test Case 2: Validar con Variaciones (Fill in Blank)

```typescript
test('Fill in blank accepts valid variations', async () => {
  const exercise = await createExercise({
    mechanic: 'fill_in_blank',
    content: {
      sentence: "Le ___ ku ts'o'okol u k'áatik.",
      blank_position: 1
    },
    answer_key: {
      correct_answer: 'paal',
      accept_variations: ['paal', 'páal']
    }
  });

  // Probar con acento
  const result1 = await exerciseService.submitAnswer(
    user.id,
    exercise.id,
    { answer: 'páal' }
  );

  expect(result1.correct).toBe(true);

  // Probar sin acento
  const result2 = await exerciseService.submitAnswer(
    user.id,
    exercise.id,
    { answer: 'paal' }
  );

  expect(result2.correct).toBe(true);
});
```

---

## 📊 Métricas y Análisis

### KPIs a Monitorear

| Métrica | Cálculo | Objetivo |
|---------|---------|----------|
| **Tasa de éxito por mecánica** | `(aciertos / intentos) GROUP BY mechanic` | >60% |
| **Mecánicas más difíciles** | Mecánicas con menor tasa de éxito | Ajustar dificultad |
| **Uso de hints por mecánica** | Promedio de hints usados | Identificar mecánicas confusas |
| **Tiempo promedio por mecánica** | `AVG(time_to_complete) GROUP BY mechanic` | Balancear tiempos |

---

## 🔗 Referencias Adicionales

### Documentación Relacionada

- [ET-EDU-001: Implementación de Mecánicas](../../02-especificaciones-tecnicas/03-contenido-educativo/ET-EDU-001-mecanicas-ejercicios.md)
- [RF-EDU-002: Niveles de Dificultad](./RF-EDU-002-niveles-dificultad.md)
- [RF-PRG-001: Tracking de Progreso](../04-progreso-seguimiento/RF-PRG-001-tracking-progreso.md)

### Referencias Pedagógicas

- Anderson, L. W., & Krathwohl, D. R. (2001). "A Taxonomy for Learning, Teaching, and Assessing"
- Duolingo Research: "Exercise Type Effectiveness Study" (2019)

---

## 📅 Historial de Cambios

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2025-11-07 | Database Team | Creación del documento |

---

**Documento:** `docs/01-requerimientos/03-contenido-educativo/RF-EDU-001-mecanicas-ejercicios.md`
**Propósito:** Requerimientos funcionales de las 31 mecánicas de ejercicios
**Audiencia:** Product Owner, Content Team, Developers
