# Especificaciones de Mecanicas M1-M3 - Comprension Lectora

**Version:** 1.0.0
**Fecha:** 2026-01-20
**Modulos:** M1, M2, M3 - Comprension Literal, Inferencial y Critica
**Proyecto:** GAMILIT - Student Portal

---

## Resumen Ejecutivo

Este documento especifica las mecanicas de los Modulos 1, 2 y 3 implementadas en GAMILIT, correspondientes a los niveles de comprension lectora:
- **M1 (7 mecanicas):** Comprension Literal
- **M2 (6 mecanicas):** Comprension Inferencial
- **M3 (5 mecanicas):** Comprension Critica

Adicionalmente, incluye **4 mecanicas auxiliares** usadas transversalmente.

---

## Indice de Mecanicas

### Modulo 1 - Comprension Literal

| ID | Nombre | Evaluacion | Descripcion |
|----|--------|------------|-------------|
| M1-01 | VerdaderoFalso | Automatica | Evaluar afirmaciones V/F |
| M1-02 | CompletarEspacios | Automatica | Rellenar espacios en blanco |
| M1-03 | Emparejamiento | Automatica | Conectar elementos relacionados |
| M1-04 | SopaLetras | Automatica | Encontrar palabras ocultas |
| M1-05 | Crucigrama | Automatica | Completar crucigrama |
| M1-06 | Timeline | Automatica | Ordenar eventos cronologicamente |
| M1-07 | MapaConceptual | Automatica | Completar mapa conceptual |

### Modulo 2 - Comprension Inferencial

| ID | Nombre | Evaluacion | Descripcion |
|----|--------|------------|-------------|
| M2-01 | DetectiveTextual | Automatica | Encontrar pistas en texto |
| M2-02 | LecturaInferencial | Automatica | Responder preguntas inferenciales |
| M2-03 | ConstruccionHipotesis | Automatica | Relacionar causas y efectos |
| M2-04 | PrediccionNarrativa | Parcial | Predecir eventos narrativos |
| M2-05 | PuzzleContexto | Automatica | Ordenar fragmentos |
| M2-06 | RuedaInferencias | Manual | Generar inferencias por categoria |

### Modulo 3 - Comprension Critica

| ID | Nombre | Evaluacion | Descripcion |
|----|--------|------------|-------------|
| M3-01 | TribunalOpiniones | Parcial | Clasificar hecho/opinion/interpretacion |
| M3-02 | DebateDigital | Manual | Argumentar sobre dilemas |
| M3-03 | AnalisisFuentes | Parcial | Evaluar credibilidad de fuentes |
| M3-04 | PodcastArgumentativo | Manual | Crear podcast argumentativo |
| M3-05 | MatrizPerspectivas | Manual | Analizar multiples perspectivas |

### Mecanicas Auxiliares

| ID | Nombre | Evaluacion | Descripcion |
|----|--------|------------|-------------|
| AUX-01 | ComprensionAuditiva | Parcial | Responder preguntas de audio |
| AUX-02 | CollagePrensa | Manual | Crear collage de recortes |
| AUX-03 | TextoEnMovimiento | Automatica | Capturar palabras animadas |
| AUX-04 | CallToAction | Parcial | Identificar llamados a accion |

---

## MODULO 1: Comprension Literal

### M1-01: VerdaderoFalso

#### Descripcion
Ejercicio donde el estudiante evalua si afirmaciones sobre un texto son verdaderas o falsas.

#### Estructura de Contenido
```json
{
  "statements": [
    {
      "id": "string",
      "statement": "string",
      "explanation": "string (opcional)"
    }
  ],
  "contextText": "string (opcional)"
}
```

> **NOTA FE-059:** El campo `correctAnswer` es sanitizado por el backend y nunca se envia al frontend por seguridad.

#### Formato de Respuesta
```json
{
  "statements": {
    "statementId": "boolean"
  }
}
```

#### Criterios de Evaluacion
- **Tipo:** Automatica
- **Correcto:** Respuesta coincide con valor esperado

#### Recompensas
- **XP Base:** 10
- **ML Coins Base:** 3

---

### M1-02: CompletarEspacios

#### Descripcion
Completar espacios en blanco en un texto usando palabras de un banco de palabras.

#### Estructura de Contenido
```json
{
  "text": "string (con marcadores ___(1)___, etc.)",
  "blanks": [
    {
      "id": "string",
      "position": "number"
    }
  ],
  "wordBank": ["string (palabras disponibles)"],
  "scenarioText": "string (opcional)"
}
```

> **NOTA FE-059:** Los campos `correctAnswer` y `alternatives` son sanitizados.

#### Formato de Respuesta
```json
{
  "blanks": {
    "blankId": "string (palabra seleccionada)"
  }
}
```

#### Criterios de Evaluacion
- **Tipo:** Automatica
- **Correcto:** Palabra coincide (case-insensitive, trim)

#### Recompensas
- **XP Base:** 15
- **ML Coins Base:** 5

---

### M1-03: Emparejamiento

#### Descripcion
Conectar elementos de dos columnas que se relacionan mediante drag-and-drop o click.

#### Estructura de Contenido
```json
{
  "cards": [
    {
      "id": "string",
      "content": "string",
      "matchId": "string (id del par correcto)",
      "type": "question | answer",
      "isFlipped": "boolean",
      "isMatched": "boolean"
    }
  ]
}
```

#### Formato de Respuesta
```json
{
  "matches": {
    "questionId": "answerId"
  }
}
```

#### Criterios de Evaluacion
- **Tipo:** Automatica
- **Correcto:** Cada par question-answer coincide con matchId

#### Recompensas
- **XP Base:** 15
- **ML Coins Base:** 5

---

### M1-04: SopaLetras

#### Descripcion
Encontrar palabras ocultas en una cuadricula de letras.

#### Estructura de Contenido
```json
{
  "grid": [["string (letra por celda)"]],
  "words": ["string (palabras a buscar)"]
}
```

#### Configuracion
```json
{
  "gridSize": {
    "rows": "number",
    "cols": "number"
  },
  "useStaticGrid": "boolean",
  "directions": ["horizontal", "vertical", "diagonal", "horizontal-reverse", "vertical-reverse", "diagonal-reverse"],
  "selectionMode": "click-drag | click-click",
  "highlightFound": "boolean"
}
```

> **NOTA FE-059:** El campo `wordsPositions` es sanitizado.

#### Formato de Respuesta
```json
{
  "foundWords": [
    {
      "word": "string",
      "startRow": "number",
      "startCol": "number",
      "endRow": "number",
      "endCol": "number"
    }
  ]
}
```

#### Criterios de Evaluacion
- **Tipo:** Automatica
- **Correcto:** Coordenadas de inicio/fin validas para cada palabra

#### Recompensas
- **XP Base:** 20
- **ML Coins Base:** 5

---

### M1-05: Crucigrama

#### Descripcion
Completar un crucigrama con pistas horizontales y verticales.

#### Estructura de Contenido
```json
{
  "grid": [
    [
      {
        "row": "number",
        "col": "number",
        "letter": "string",
        "isBlack": "boolean",
        "number": "number (opcional)",
        "numbers": ["number (si multiples pistas)"]
      }
    ]
  ],
  "clues": [
    {
      "id": "string",
      "number": "number",
      "direction": "horizontal | vertical",
      "clue": "string",
      "startRow": "number",
      "startCol": "number"
    }
  ],
  "rows": "number",
  "cols": "number"
}
```

> **NOTA FE-059:** El campo `answer` es sanitizado.

#### Formato de Respuesta
```json
{
  "answers": {
    "clueId": "string (respuesta)"
  }
}
```

#### Criterios de Evaluacion
- **Tipo:** Automatica
- **Correcto:** Respuesta coincide (case-insensitive, sin espacios)

#### Recompensas
- **XP Base:** 20
- **ML Coins Base:** 5

---

### M1-06: Timeline

#### Descripcion
Ordenar eventos cronologicamente en una linea de tiempo mediante drag-and-drop.

#### Estructura de Contenido
```json
{
  "events": [
    {
      "id": "string",
      "year": "number",
      "title": "string",
      "description": "string",
      "imageUrl": "string (opcional)",
      "category": "string"
    }
  ]
}
```

> **NOTA FE-059:** El campo `correctOrder` es sanitizado.

#### Formato de Respuesta
```json
{
  "order": ["string (event IDs en orden)"]
}
```

#### Criterios de Evaluacion
- **Tipo:** Automatica
- **Correcto:** Orden coincide con orden cronologico por year

#### Recompensas
- **XP Base:** 20
- **ML Coins Base:** 5

---

### M1-07: MapaConceptual

#### Descripcion
Completar un mapa conceptual conectando nodos con relaciones.

#### Estructura de Contenido
```json
{
  "nodes": [
    {
      "id": "string",
      "label": "string",
      "x": "number",
      "y": "number",
      "category": "string"
    }
  ],
  "connections": [
    {
      "id": "string",
      "fromId": "string",
      "toId": "string",
      "label": "string"
    }
  ],
  "correctConnections": ["string (connection IDs)"]
}
```

#### Formato de Respuesta
```json
{
  "connections": [
    {
      "fromId": "string",
      "toId": "string"
    }
  ]
}
```

#### Criterios de Evaluacion
- **Tipo:** Automatica
- **Correcto:** Conexiones coinciden con correctConnections

#### Recompensas
- **XP Base:** 25
- **ML Coins Base:** 8

---

## MODULO 2: Comprension Inferencial

### M2-01: DetectiveTextual

#### Descripcion
Analizar un pasaje para encontrar pistas textuales y responder preguntas de inferencia.

#### Estructura de Contenido
```json
{
  "content": {
    "passage": "string",
    "questions": [
      {
        "id": "string",
        "question": "string",
        "options": ["string"],
        "correctAnswer": "number (indice)",
        "explanation": "string",
        "inference_type": "causa_efecto | contexto_situacional | motivacion"
      }
    ]
  }
}
```

#### Formato de Respuesta
```json
{
  "questions": {
    "questionId": "number (indice seleccionado)"
  }
}
```

#### Criterios de Evaluacion
- **Tipo:** Automatica
- **Correcto:** Indice coincide con correctAnswer

#### Recompensas
- **XP Base:** 25
- **ML Coins Base:** 8

---

### M2-02: LecturaInferencial

#### Descripcion
Ejercicio de comprension con preguntas de diferentes tipos de inferencia.

#### Estructura de Contenido
```json
{
  "content": {
    "passage": "string",
    "questions": [
      {
        "id": "string",
        "question": "string",
        "options": ["string"],
        "correctAnswer": "number",
        "explanation": "string",
        "inference_type": "causa_efecto | contexto_situacional | motivacion | prediccion | conclusion | interpretacion"
      }
    ]
  },
  "config": {
    "timePerQuestion": "number (opcional)",
    "allowReview": "boolean",
    "showExplanations": "boolean",
    "shuffleQuestions": "boolean",
    "shuffleOptions": "boolean"
  }
}
```

#### Formato de Respuesta
```json
{
  "questions": {
    "questionId": "number (indice)"
  }
}
```

#### Criterios de Evaluacion
- **Tipo:** Automatica
- **Correcto:** Indice coincide con correctAnswer

#### Recompensas
- **XP Base:** 25
- **ML Coins Base:** 8

---

### M2-03: ConstruccionHipotesis (CausaEfecto)

#### Descripcion
Relacionar causas con sus posibles consecuencias mediante drag-and-drop.

#### Estructura de Contenido
```json
{
  "content": {
    "causes": [
      {
        "id": "string",
        "text": "string"
      }
    ],
    "consequences": [
      {
        "id": "string",
        "text": "string"
      }
    ]
  },
  "config": {
    "allowMultiple": "boolean (permitir multiples efectos por causa)",
    "showFeedback": "boolean",
    "dragAndDrop": "boolean"
  }
}
```

> **NOTA FE-059:** El campo `correctCauseIds` es sanitizado.

#### Formato de Respuesta
```json
{
  "matches": {
    "causeId": ["consequenceIds"]
  }
}
```

#### Criterios de Evaluacion
- **Tipo:** Automatica
- **Correcto:** Consecuencias asignadas estan en validEffects de la causa

#### Recompensas
- **XP Base:** 25
- **ML Coins Base:** 8

---

### M2-04: PrediccionNarrativa

#### Descripcion
Predecir eventos futuros basandose en el contexto de la historia.

#### Estructura de Contenido
```json
{
  "scenarios": [
    {
      "id": "string",
      "context": "string",
      "beginning": "string",
      "question": "string",
      "predictions": [
        {
          "id": "string",
          "text": "string",
          "explanation": "string"
        }
      ],
      "contextualHint": "string (opcional)"
    }
  ]
}
```

> **NOTA FE-059:** El campo `isCorrect` es sanitizado.

#### Formato de Respuesta
```json
{
  "answers": [
    {
      "scenarioId": "string",
      "selectedPredictionId": "string",
      "isCorrect": "boolean | null"
    }
  ]
}
```

#### Criterios de Evaluacion
- **Tipo:** Parcial (seleccion automatica, justificacion manual)
- **Correcto:** Prediccion seleccionada tiene isCorrect=true

#### Recompensas
- **XP Base:** 25
- **ML Coins Base:** 8

---

### M2-05: PuzzleContexto

#### Descripcion
Ordenar fragmentos de texto para formar una inferencia coherente.

#### Estructura de Contenido
```json
{
  "completeInference": "string (texto completo correcto)",
  "fragments": [
    {
      "id": "string",
      "label": "string (A, B, C, D)",
      "text": "string"
    }
  ]
}
```

> **NOTA FE-059:** Los campos `correctPosition` y `correctOrder` son sanitizados.

#### Formato de Respuesta
```json
{
  "currentOrder": ["string (fragment IDs en orden)"]
}
```

#### Criterios de Evaluacion
- **Tipo:** Automatica
- **Correcto:** Orden coincide con correctOrder

#### Recompensas
- **XP Base:** 20
- **ML Coins Base:** 5

---

### M2-06: RuedaInferencias

#### Descripcion
Ejercicio con ruleta que asigna categorias aleatorias para generar inferencias de texto libre.

#### Estructura de Contenido
```json
{
  "categories": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "color": "string (hex)",
      "icon": "string"
    }
  ],
  "fragments": [
    {
      "id": "string",
      "text": "string",
      "difficulty": "easy | medium | hard",
      "hints": ["string"]
    }
  ],
  "settings": {
    "timeLimit": "number (segundos, default 30)",
    "minTextLength": "number (default 20)",
    "maxTextLength": "number (default 200)",
    "wheelAnimation": "boolean",
    "showTimer": "boolean",
    "allowSkip": "boolean"
  }
}
```

#### Formato de Respuesta
```json
{
  "fragments": {
    "fragmentId": "string (texto de inferencia)"
  },
  "fragmentStates": [
    {
      "fragmentId": "string",
      "categoryId": "string",
      "userText": "string",
      "timeSpent": "number"
    }
  ]
}
```

#### Criterios de Evaluacion
- **Tipo:** Manual (requiere revision docente)
- **Criterios:**
  - Coherencia de la inferencia con la categoria asignada
  - Profundidad del analisis
  - Uso apropiado del texto fuente

#### Recompensas
- **XP Base:** 30
- **ML Coins Base:** 10

---

## MODULO 3: Comprension Critica

### M3-01: TribunalOpiniones

#### Descripcion
Clasificar afirmaciones como HECHO, OPINION o INTERPRETACION y evaluar si estan bien fundamentadas.

#### Estructura de Contenido
```json
{
  "content": {
    "statements": [
      {
        "id": "string",
        "text": "string",
        "topic": "string (opcional)",
        "source": "string (opcional)",
        "correctClassification": "hecho | opinion | interpretacion",
        "correctVerdict": "bien_fundamentada | parcialmente_fundamentada | sin_fundamento",
        "explanation": "string"
      }
    ],
    "evaluationCriteria": {
      "evidencia": "string",
      "logica": "string",
      "falacias": "string"
    },
    "classificationHelp": {
      "hecho": "string",
      "opinion": "string",
      "interpretacion": "string"
    }
  }
}
```

#### Formato de Respuesta
```json
{
  "evaluations": [
    {
      "statementId": "string",
      "classification": "hecho | opinion | interpretacion",
      "verdict": "bien_fundamentada | parcialmente_fundamentada | sin_fundamento",
      "justification": "string (opcional)"
    }
  ]
}
```

#### Criterios de Evaluacion
- **Tipo:** Parcial (clasificacion automatica, justificacion manual)
- **Correcto:** Classification y verdict coinciden con correctos

#### Recompensas
- **XP Base:** 30
- **ML Coins Base:** 10

---

### M3-02: DebateDigital

#### Descripcion
Argumentar sobre dilemas eticos en formato de debate digital con IA o entre estudiantes.

#### Estructura de Contenido
```json
{
  "topic": "string",
  "positions": {
    "favor": {
      "label": "string",
      "suggestedArguments": ["string"]
    },
    "contra": {
      "label": "string",
      "suggestedArguments": ["string"]
    }
  },
  "minArguments": "number",
  "requireEvidence": "boolean"
}
```

#### Formato de Respuesta
```json
{
  "position": "a_favor | en_contra | neutral",
  "response": "string (argumento completo)",
  "arguments": ["string"],
  "messageCount": "number"
}
```

#### Criterios de Evaluacion
- **Tipo:** Manual (requiere revision docente)
- **Criterios:**
  - Calidad de los argumentos
  - Uso de evidencia
  - Logica y coherencia
  - Respeto a posiciones contrarias

#### Recompensas
- **XP Base:** 35
- **ML Coins Base:** 12

---

### M3-03: AnalisisFuentes

#### Descripcion
Evaluar y ordenar fuentes segun su credibilidad usando metodo CRAAP.

#### Estructura de Contenido
```json
{
  "sources": [
    {
      "id": "string",
      "title": "string",
      "url": "string",
      "excerpt": "string",
      "type": "academic | news | blog | social"
    }
  ]
}
```

> **NOTA FE-059:** El campo `credibilityScore` es sanitizado.

#### Formato de Respuesta
```json
{
  "ranking": ["string (source IDs ordenados por credibilidad)"],
  "startedAt": "string (ISO 8601)"
}
```

#### Criterios de Evaluacion
- **Tipo:** Parcial (orden automatico, evaluaciones manuales)
- **Correcto:** Orden coincide con ranking esperado

#### Recompensas
- **XP Base:** 30
- **ML Coins Base:** 10

---

### M3-04: PodcastArgumentativo

#### Descripcion
Crear un episodio de podcast argumentativo (audio o script) sobre un dilema etico.

#### Estructura de Contenido
```json
{
  "topics": [
    {
      "id": "string",
      "title": "string"
    }
  ],
  "structure": {
    "introduction": {
      "duration": "string",
      "description": "string"
    },
    "development": {
      "duration": "string",
      "description": "string"
    },
    "counterargument": {
      "duration": "string",
      "description": "string"
    },
    "conclusion": {
      "duration": "string",
      "description": "string"
    }
  },
  "allowAudioUpload": "boolean",
  "allowScriptOnly": "boolean"
}
```

#### Formato de Respuesta
```json
{
  "topicId": "string",
  "type": "audio | script",
  "recording": {
    "audioBlob": "Blob | null",
    "transcription": "string",
    "duration": "number"
  },
  "script": {
    "introduction": "string",
    "arguments": [
      {
        "point": "string",
        "evidence": "string"
      }
    ],
    "counterargument": "string",
    "conclusion": "string"
  }
}
```

#### Criterios de Evaluacion
- **Tipo:** Manual (requiere revision docente)
- **Criterios:**
  - Claridad de la tesis
  - Solidez argumentativa
  - Uso de evidencia
  - Estructura del podcast

#### Recompensas
- **XP Base:** 40
- **ML Coins Base:** 15

---

### M3-05: MatrizPerspectivas

#### Descripcion
Analizar como diferentes grupos o epocas percibieron un mismo tema o personaje.

#### Estructura de Contenido
```json
{
  "topic": "string",
  "description": "string",
  "perspectiveCount": "number (minimo requerido)"
}
```

#### Formato de Respuesta
```json
{
  "perspectives": [
    {
      "id": "string",
      "viewpoint": "string",
      "arguments": ["string"],
      "counterarguments": ["string"],
      "biases": ["string"]
    }
  ]
}
```

#### Criterios de Evaluacion
- **Tipo:** Manual (requiere revision docente)
- **Criterios:**
  - Identificacion de perspectivas diversas
  - Analisis de sesgos
  - Equilibrio en la presentacion
  - Profundidad del analisis

#### Recompensas
- **XP Base:** 35
- **ML Coins Base:** 12

---

## MECANICAS AUXILIARES

### AUX-01: ComprensionAuditiva

#### Descripcion
Escuchar un audio y responder preguntas de comprension.

#### Estructura de Contenido
```json
{
  "audioUrl": "string",
  "audioTitle": "string",
  "audioDuration": "number (segundos)",
  "questions": [
    {
      "id": "string",
      "time": "number (momento en el audio)",
      "question": "string",
      "options": ["string"],
      "correctAnswer": "number"
    }
  ]
}
```

#### Formato de Respuesta
```json
{
  "answers": {
    "questionId": "number (indice)"
  },
  "currentTime": "number",
  "showResults": "boolean"
}
```

#### Criterios de Evaluacion
- **Tipo:** Parcial (automatico para opcion multiple)

#### Recompensas
- **XP Base:** 20
- **ML Coins Base:** 5

---

### AUX-02: CollagePrensa

#### Descripcion
Crear un collage con recortes de prensa y titulares.

#### Estructura de Contenido
```json
{
  "newspaperTitle": "string",
  "newspaperDate": "string",
  "canvasAspectRatio": "string",
  "minCanvasHeight": "number",
  "defaultHeadlineText": "string",
  "defaultBodyText": "string"
}
```

#### Formato de Respuesta
```json
{
  "elements": [
    {
      "id": "string",
      "type": "image | text | headline",
      "content": "string",
      "x": "number",
      "y": "number",
      "width": "number",
      "height": "number",
      "rotation": "number"
    }
  ],
  "uploadedFiles": [
    {
      "id": "string",
      "name": "string",
      "url": "string",
      "type": "string"
    }
  ]
}
```

#### Criterios de Evaluacion
- **Tipo:** Manual (requiere revision docente)

#### Recompensas
- **XP Base:** 25
- **ML Coins Base:** 8

---

### AUX-03: TextoEnMovimiento

#### Descripcion
Interactuar con texto animado, creando composiciones con diferentes animaciones.

#### Estructura de Contenido
```json
{
  "animations": [
    {
      "id": "string",
      "name": "string",
      "variants": {
        "hidden": {},
        "visible": {}
      }
    }
  ],
  "availableColors": ["string (hex)"],
  "minDuration": "number",
  "maxDuration": "number",
  "minFontSize": "number",
  "maxFontSize": "number",
  "defaultText": "string"
}
```

#### Formato de Respuesta
```json
{
  "texts": [
    {
      "id": "string",
      "text": "string",
      "animation": "string",
      "duration": "number",
      "color": "string",
      "fontSize": "number"
    }
  ],
  "isPlaying": "boolean"
}
```

#### Criterios de Evaluacion
- **Tipo:** Automatica (basado en completitud)

#### Recompensas
- **XP Base:** 15
- **ML Coins Base:** 5

---

### AUX-04: CallToAction

#### Descripcion
Crear campanas con llamados a la accion sobre temas estudiados.

#### Estructura de Contenido
```json
{
  "availableCauses": ["string"],
  "availableTags": ["string"],
  "minGoal": "number",
  "maxGoal": "number",
  "goalStep": "number",
  "minSignatures": "number",
  "maxSignatures": "number"
}
```

#### Formato de Respuesta
```json
{
  "campaigns": [
    {
      "id": "string",
      "title": "string",
      "cause": "string",
      "description": "string",
      "goal": "number",
      "signatures": "number",
      "tags": ["string"]
    }
  ]
}
```

#### Criterios de Evaluacion
- **Tipo:** Parcial (estructura automatica, contenido manual)

#### Recompensas
- **XP Base:** 20
- **ML Coins Base:** 5

---

## Tabla Resumen M1-M3 + Auxiliares

| Mecanica | Modulo | Auto-gradable | XP | ML Coins |
|----------|--------|---------------|-----|----------|
| VerdaderoFalso | M1 | Si | 10 | 3 |
| CompletarEspacios | M1 | Si | 15 | 5 |
| Emparejamiento | M1 | Si | 15 | 5 |
| SopaLetras | M1 | Si | 20 | 5 |
| Crucigrama | M1 | Si | 20 | 5 |
| Timeline | M1 | Si | 20 | 5 |
| MapaConceptual | M1 | Si | 25 | 8 |
| DetectiveTextual | M2 | Si | 25 | 8 |
| LecturaInferencial | M2 | Si | 25 | 8 |
| ConstruccionHipotesis | M2 | Si | 25 | 8 |
| PrediccionNarrativa | M2 | Parcial | 25 | 8 |
| PuzzleContexto | M2 | Si | 20 | 5 |
| RuedaInferencias | M2 | No | 30 | 10 |
| TribunalOpiniones | M3 | Parcial | 30 | 10 |
| DebateDigital | M3 | No | 35 | 12 |
| AnalisisFuentes | M3 | Parcial | 30 | 10 |
| PodcastArgumentativo | M3 | No | 40 | 15 |
| MatrizPerspectivas | M3 | No | 35 | 12 |
| ComprensionAuditiva | Aux | Parcial | 20 | 5 |
| CollagePrensa | Aux | No | 25 | 8 |
| TextoEnMovimiento | Aux | Si | 15 | 5 |
| CallToAction | Aux | Parcial | 20 | 5 |

---

## Referencias de Codigo

### Frontend - Estructura de Directorios

```
apps/frontend/src/features/mechanics/
  module1/
    VerdaderoFalso/
    CompletarEspacios/
    Emparejamiento/
    SopaLetras/
    Crucigrama/
    Timeline/
    MapaConceptual/
  module2/
    DetectiveTextual/
    LecturaInferencial/
    ConstruccionHipotesis/
    PrediccionNarrativa/
    PuzzleContexto/
    RuedaInferencias/
  module3/
    TribunalOpiniones/
    DebateDigital/
    AnalisisFuentes/
    PodcastArgumentativo/
    MatrizPerspectivas/
  auxiliar/
    ComprensionAuditiva/
    CollagePrensa/
    TextoEnMovimiento/
    CallToAction/
```

### Nota de Seguridad (FE-059)

Todos los campos que contienen respuestas correctas son sanitizados por el backend antes de enviarse al frontend:
- `correctAnswer`
- `isCorrect`
- `correctPosition`
- `correctOrder`
- `correctCauseIds`
- `credibilityScore`
- `wordsPositions`
- `answer` (en crucigramas)
- `alternatives`

La validacion siempre se realiza en el servidor para prevenir trampas.

---

*Documento SSOT - GAMILIT Student Portal*
*Version 1.0.0 - 2026-01-20*
