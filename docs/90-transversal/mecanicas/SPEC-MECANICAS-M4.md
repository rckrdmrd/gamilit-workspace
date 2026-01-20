# Especificaciones de Mecanicas M4 - Lectura Digital

**Version:** 1.0.0
**Fecha:** 2026-01-20
**Modulo:** M4 - Lectura Digital y Pensamiento Critico
**Proyecto:** GAMILIT - Student Portal

---

## Resumen Ejecutivo

Este documento especifica las 5 mecanicas oficiales del Modulo 4 (Lectura Digital) implementadas en GAMILIT.

> **NOTA:** Segun DocumentoDeDiseño v6.1, las mecanicas EmailFormal, ChatLiterario, EnsayoArgumentativo y ResenaCritica fueron eliminadas del M4 oficial. Este documento solo cubre las 5 mecanicas implementadas.

---

## Indice de Mecanicas M4

| ID | Nombre | Evaluacion | Descripcion Breve |
|----|--------|------------|-------------------|
| M4-01 | VerificadorFakeNews | Manual | Verificar afirmaciones con fuentes |
| M4-02 | InfografiaInteractiva | Manual | Explorar infografias interactivas |
| M4-03 | QuizTikTok | Automatica | Quiz rapido estilo TikTok |
| M4-04 | NavegacionHipertextual | Manual | Navegar hipertextos para encontrar informacion |
| M4-05 | AnalisisMemes | Manual | Decodificar mensajes en memes |

---

## Especificaciones Detalladas

### M4-01: VerificadorFakeNews

#### Descripcion

Ejercicio de verificacion de noticias donde el estudiante identifica afirmaciones falsas en articulos y las verifica usando fuentes confiables. Desarrolla pensamiento critico y habilidades de fact-checking.

#### Estructura de Contenido (content JSONB)

```json
{
  "articles": [
    {
      "id": "string",
      "title": "string",
      "content": "string (texto del articulo)",
      "source": "string (nombre de la fuente)",
      "date": "string (YYYY-MM-DD)",
      "url": "string (opcional)"
    }
  ],
  "expectedClaims": [
    {
      "id": "string",
      "text": "string (afirmacion a verificar)",
      "context": "string",
      "position": {
        "start": "number",
        "end": "number"
      }
    }
  ],
  "timeLimit": "number (segundos, opcional)"
}
```

#### Formato de Respuesta del Estudiante

```json
{
  "claims": [
    {
      "claimId": "string",
      "verdict": "true | false | partially-true | unverified | misleading",
      "confidence": "number (0-1)",
      "sources": [
        {
          "name": "string",
          "url": "string",
          "credibilityScore": "number (0-100)",
          "type": "academic | news | government | encyclopedia | other"
        }
      ],
      "explanation": "string"
    }
  ]
}
```

#### Criterios de Evaluacion

- **Tipo:** Manual (requiere revision docente)
- **Criterios:**
  - Identificacion correcta de afirmaciones verificables
  - Calidad de las fuentes consultadas
  - Precision de los veredictos
  - Calidad de las explicaciones

#### Recompensas

- **XP Base:** 35
- **ML Coins Base:** 12

#### Ejemplo Completo

```json
// Contenido del ejercicio
{
  "articles": [
    {
      "id": "1",
      "title": "Marie Curie descubrio la radioactividad en 1898",
      "content": "Marie Curie, cientifica polaca-francesa, fue la primera persona en descubrir la radioactividad en 1898...",
      "source": "Science News Daily",
      "date": "2024-03-15"
    }
  ],
  "expectedClaims": [
    {
      "id": "claim-1",
      "text": "primera persona en descubrir la radioactividad",
      "context": "Afirmacion sobre el descubrimiento",
      "position": { "start": 45, "end": 89 }
    }
  ]
}

// Respuesta del estudiante
{
  "claims": [
    {
      "claimId": "claim-1",
      "verdict": "false",
      "confidence": 0.95,
      "sources": [
        {
          "name": "Nobel Prize Official",
          "url": "https://nobelprize.org",
          "credibilityScore": 98,
          "type": "government"
        }
      ],
      "explanation": "Henri Becquerel descubrio la radioactividad en 1896, no Marie Curie"
    }
  ]
}
```

#### Notas de Implementacion

- **Frontend:** `apps/frontend/src/features/mechanics/module4/VerificadorFakeNews/`
- **Componente:** `VerificadorFakeNewsExercise.tsx`
- **Tipos:** `verificadorFakeNewsTypes.ts`
- **Mock Data:** `verificadorFakeNewsMockData.ts`

---

### M4-02: InfografiaInteractiva

#### Descripcion

Ejercicio donde el estudiante explora una infografia interactiva haciendo clic en tarjetas de informacion para revelar contenido y responder preguntas basadas en la visualizacion.

#### Estructura de Contenido (content JSONB)

```json
{
  "cards": [
    {
      "id": "string",
      "title": "string",
      "content": "string",
      "position": {
        "x": "number",
        "y": "number"
      },
      "icon": "string (nombre del icono)",
      "revealed": "boolean"
    }
  ],
  "backgroundImage": "string (URL, opcional)"
}
```

#### Formato de Respuesta del Estudiante

```json
{
  "revealedCards": ["string (card IDs)"],
  "score": "number",
  "timeSpent": "number (segundos)",
  "hintsUsed": "number"
}
```

#### Criterios de Evaluacion

- **Tipo:** Manual (requiere revision docente)
- **Criterios:**
  - Exploracion completa de la infografia
  - Comprension del contenido revelado
  - Tiempo de interaccion

#### Recompensas

- **XP Base:** 30
- **ML Coins Base:** 10

#### Ejemplo Completo

```json
// Contenido del ejercicio
{
  "cards": [
    {
      "id": "c1",
      "title": "Primer Nobel",
      "content": "Premio Nobel de Fisica en 1903",
      "position": { "x": 100, "y": 100 },
      "icon": "trophy",
      "revealed": false
    },
    {
      "id": "c2",
      "title": "Segundo Nobel",
      "content": "Premio Nobel de Quimica en 1911",
      "position": { "x": 300, "y": 100 },
      "icon": "trophy",
      "revealed": false
    },
    {
      "id": "c3",
      "title": "Descubrimiento",
      "content": "Descubrio Radio y Polonio",
      "position": { "x": 200, "y": 250 },
      "icon": "atom",
      "revealed": false
    }
  ]
}

// Respuesta del estudiante
{
  "revealedCards": ["c1", "c2", "c3"],
  "score": 100,
  "timeSpent": 180,
  "hintsUsed": 0
}
```

#### Notas de Implementacion

- **Frontend:** `apps/frontend/src/features/mechanics/module4/InfografiaInteractiva/`
- **Componente:** `InfografiaInteractivaExercise.tsx`
- **Tipos:** `infografiaInteractivaTypes.ts`

---

### M4-03: QuizTikTok

#### Descripcion

Quiz rapido con formato vertical estilo TikTok. Preguntas de opcion multiple con limite de tiempo, disenado para engagement rapido y consumo movil.

#### Estructura de Contenido (content JSONB)

```json
{
  "questions": [
    {
      "id": "string",
      "question": "string",
      "options": ["string (4 opciones)"],
      "correctAnswer": "number (indice 0-3)",
      "backgroundVideo": "string (URL, opcional)",
      "backgroundColor": "string (hex color)"
    }
  ]
}
```

#### Formato de Respuesta del Estudiante

```json
{
  "answers": ["number (indices seleccionados)"],
  "timePerQuestion": ["number (segundos por pregunta)"]
}
```

#### Criterios de Evaluacion

- **Tipo:** Automatica
- **Correcto:** Si el indice seleccionado coincide con `correctAnswer`
- **Puntuacion:** Basada en respuestas correctas y tiempo

#### Recompensas

- **XP Base:** 15
- **ML Coins Base:** 5

#### Ejemplo Completo

```json
// Contenido del ejercicio
{
  "questions": [
    {
      "id": "q1",
      "question": "En que ano nacio Marie Curie?",
      "options": ["1865", "1867", "1870", "1872"],
      "correctAnswer": 1,
      "backgroundColor": "#f59e0b"
    },
    {
      "id": "q2",
      "question": "Cuantos Premios Nobel gano?",
      "options": ["1", "2", "3", "4"],
      "correctAnswer": 1,
      "backgroundColor": "#3b82f6"
    },
    {
      "id": "q3",
      "question": "Que elemento descubrio primero?",
      "options": ["Radio", "Polonio", "Curio", "Uranio"],
      "correctAnswer": 1,
      "backgroundColor": "#8b5cf6"
    }
  ]
}

// Respuesta del estudiante
{
  "answers": [1, 1, 1],
  "timePerQuestion": [8.5, 6.2, 9.1]
}
```

#### Notas de Implementacion

- **Frontend:** `apps/frontend/src/features/mechanics/module4/QuizTikTok/`
- **Componente:** `QuizTikTokExercise.tsx`
- **Tipos:** `quizTikTokTypes.ts`
- **Auto-gradable:** Si

---

### M4-04: NavegacionHipertextual

#### Descripcion

Ejercicio de navegacion donde el estudiante sigue enlaces hipertextuales para encontrar informacion especifica, simulando la navegacion web real y el pensamiento de busqueda.

#### Estructura de Contenido (content JSONB)

```json
{
  "nodes": [
    {
      "id": "string",
      "title": "string",
      "content": "string",
      "links": [
        {
          "targetId": "string",
          "label": "string"
        }
      ]
    }
  ],
  "startNodeId": "string",
  "targetNodeId": "string"
}
```

#### Formato de Respuesta del Estudiante

```json
{
  "currentNodeId": "string",
  "visitedNodes": ["string (node IDs visitados)"],
  "score": "number",
  "timeSpent": "number",
  "hintsUsed": "number"
}
```

#### Criterios de Evaluacion

- **Tipo:** Manual (requiere revision docente)
- **Criterios:**
  - Eficiencia de la ruta (pasos minimos)
  - Llegada al nodo objetivo
  - Comprension de la informacion encontrada

#### Recompensas

- **XP Base:** 30
- **ML Coins Base:** 10

#### Ejemplo Completo

```json
// Contenido del ejercicio
{
  "nodes": [
    {
      "id": "n1",
      "title": "Inicio",
      "content": "Marie Curie fue una cientifica polaca...",
      "links": [
        { "targetId": "n2", "label": "Infancia" },
        { "targetId": "n3", "label": "Estudios" }
      ]
    },
    {
      "id": "n2",
      "title": "Infancia",
      "content": "Nacio en Varsovia en 1867...",
      "links": [
        { "targetId": "n3", "label": "Siguiente" }
      ]
    },
    {
      "id": "n3",
      "title": "Estudios",
      "content": "Estudio en la Sorbona...",
      "links": [
        { "targetId": "n1", "label": "Volver" }
      ]
    }
  ],
  "startNodeId": "n1",
  "targetNodeId": "n3"
}

// Respuesta del estudiante
{
  "currentNodeId": "n3",
  "visitedNodes": ["n1", "n3"],
  "score": 100,
  "timeSpent": 120,
  "hintsUsed": 0
}
```

#### Notas de Implementacion

- **Frontend:** `apps/frontend/src/features/mechanics/module4/NavegacionHipertextual/`
- **Componente:** `NavegacionHipertextualExercise.tsx`
- **Tipos:** `navegacionHipertextualTypes.ts`

---

### M4-05: AnalisisMemes

#### Descripcion

Ejercicio de analisis visual donde el estudiante decodifica mensajes en memes, identificando elementos de texto, contexto, humor y critica social.

#### Estructura de Contenido (content JSONB)

```json
{
  "memeUrl": "string (URL de la imagen)",
  "memeTitle": "string",
  "expectedAnnotations": [
    {
      "id": "string",
      "x": "number",
      "y": "number",
      "text": "string",
      "category": "texto | contexto | humor | critica"
    }
  ]
}
```

#### Formato de Respuesta del Estudiante

```json
{
  "annotations": [
    {
      "id": "string",
      "x": "number",
      "y": "number",
      "text": "string (analisis del estudiante)",
      "category": "texto | contexto | humor | critica"
    }
  ],
  "score": "number",
  "timeSpent": "number",
  "hintsUsed": "number"
}
```

#### Criterios de Evaluacion

- **Tipo:** Manual (requiere revision docente)
- **Criterios:**
  - Identificacion correcta de elementos visuales
  - Comprension del mensaje implicito
  - Analisis del humor/ironia
  - Contextualizacion historica/cultural

#### Recompensas

- **XP Base:** 30
- **ML Coins Base:** 10

#### Ejemplo Completo

```json
// Contenido del ejercicio
{
  "memeUrl": "/images/marie-curie-meme.jpg",
  "memeTitle": "Marie Curie trabajando con elementos radioactivos",
  "expectedAnnotations": [
    {
      "id": "a1",
      "x": 100,
      "y": 100,
      "text": "Referencia a radioactividad",
      "category": "contexto"
    },
    {
      "id": "a2",
      "x": 200,
      "y": 150,
      "text": "Humor sobre peligros del laboratorio",
      "category": "humor"
    }
  ]
}

// Respuesta del estudiante
{
  "annotations": [
    {
      "id": "user-a1",
      "x": 105,
      "y": 98,
      "text": "El brillo azul representa la radiactividad que Marie manipulaba sin proteccion",
      "category": "contexto"
    },
    {
      "id": "user-a2",
      "x": 195,
      "y": 155,
      "text": "La ironia de que no conocia los peligros de la radiacion",
      "category": "humor"
    }
  ],
  "score": 85,
  "timeSpent": 300,
  "hintsUsed": 1
}
```

#### Notas de Implementacion

- **Frontend:** `apps/frontend/src/features/mechanics/module4/AnalisisMemes/`
- **Componente:** `AnalisisMemesExercise.tsx`
- **Tipos:** `analisisMemesTypes.ts`

---

## Tabla Resumen M4

| Mecanica | Auto-gradable | XP | ML Coins | Tiempo Est. |
|----------|---------------|-----|----------|-------------|
| VerificadorFakeNews | No | 35 | 12 | 7-10 min |
| InfografiaInteractiva | No | 30 | 10 | 5-8 min |
| QuizTikTok | Si | 15 | 5 | 2-3 min |
| NavegacionHipertextual | No | 30 | 10 | 5-8 min |
| AnalisisMemes | No | 30 | 10 | 5-7 min |

---

## Referencias de Codigo

### Frontend

```
apps/frontend/src/features/mechanics/
  module4/
    VerificadorFakeNews/
      VerificadorFakeNewsExercise.tsx
      verificadorFakeNewsTypes.ts
      verificadorFakeNewsMockData.ts
    InfografiaInteractiva/
      InfografiaInteractivaExercise.tsx
      infografiaInteractivaTypes.ts
      infografiaInteractivaMockData.ts
    QuizTikTok/
      QuizTikTokExercise.tsx
      quizTikTokTypes.ts
      quizTikTokMockData.ts
    NavegacionHipertextual/
      NavegacionHipertextualExercise.tsx
      navegacionHipertextualTypes.ts
      navegacionHipertextualMockData.ts
    AnalisisMemes/
      AnalisisMemesExercise.tsx
      analisisMemesTypes.ts
      analisisMemesMockData.ts
```

### Exportaciones

```typescript
// apps/frontend/src/features/mechanics/index.ts
export { VerificadorFakeNewsExercise } from './module4/VerificadorFakeNews/VerificadorFakeNewsExercise';
export { QuizTikTokExercise } from './module4/QuizTikTok/QuizTikTokExercise';
export { AnalisisMemesExercise } from './module4/AnalisisMemes/AnalisisMemesExercise';
export { InfografiaInteractivaExercise } from './module4/InfografiaInteractiva/InfografiaInteractivaExercise';
export { NavegacionHipertextualExercise } from './module4/NavegacionHipertextual/NavegacionHipertextualExercise';
```

---

*Documento SSOT - GAMILIT Student Portal*
*Version 1.0.0 - 2026-01-20*
