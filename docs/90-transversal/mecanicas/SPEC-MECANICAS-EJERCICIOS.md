# Especificaciones de Mecanicas de Ejercicios - GAMILIT

**Version:** 1.0.0
**Fecha:** 2026-01-20
**Proyecto:** GAMILIT - Student Portal
**Estado:** SSOT (Single Source of Truth)

---

## Resumen Ejecutivo

Este documento especifica las 33 mecanicas de ejercicios implementadas en GAMILIT, detallando para cada una:
- Estructura del contenido (campo JSONB `content`)
- Formato de respuesta esperada del estudiante
- Criterios de evaluacion
- Recompensas base (XP, ML Coins)

---

## Indice de Mecanicas por Modulo

| Modulo | Cantidad | Mecanicas |
|--------|----------|-----------|
| M1 - Comprension Literal | 5 | crucigrama, linea_tiempo, sopa_letras, mapa_conceptual, emparejamiento |
| M2 - Comprension Inferencial | 5 | detective_textual, construccion_hipotesis, prediccion_narrativa, puzzle_contexto, rueda_inferencias |
| M3 - Comprension Critica | 5 | tribunal_opiniones, debate_digital, analisis_fuentes, podcast_argumentativo, matriz_perspectivas |
| M4 - Lectura Digital | 9 | verificador_fake_news, infografia_interactiva, quiz_tiktok, navegacion_hipertextual, analisis_memes, resena_critica, chat_literario, email_formal, ensayo_argumentativo |
| M5 - Produccion Lectora | 3 | diario_multimedia, comic_digital, video_carta |
| Auxiliares | 6 | comprension_auditiva, collage_prensa, texto_movimiento, call_to_action, verdadero_falso, completar_espacios |

**Total:** 33 mecanicas

---

## MODULO 1: Comprension Literal

### crucigrama (M1)

**Descripcion:** Completar un crucigrama de terminos relacionados con el tema.

**Contenido (JSONB):**
```json
{
  "question": "Completa el crucigrama sobre Marie Curie",
  "grid": {
    "rows": 15,
    "columns": 15,
    "cells": [["", "S", "O", "R", "B", "O", "N", "A", "", ""], ...]
  },
  "clues": {
    "across": [
      {"number": 1, "clue": "Universidad donde estudio Marie", "answer": "SORBONA", "row": 0, "col": 1}
    ],
    "down": [
      {"number": 2, "clue": "Premio recibido en 1903 y 1911", "answer": "NOBEL", "row": 0, "col": 3}
    ]
  }
}
```

**Respuesta Esperada:**
```json
{
  "answers": {
    "1-across": "SORBONA",
    "2-down": "NOBEL",
    "3-across": "RADIOACTIVIDAD"
  }
}
```

**Evaluacion:** Automatica - compara cada respuesta con answer (case-insensitive, sin espacios)
**Recompensas Base:** 20 XP, 5 ML Coins
**Auto-gradable:** Si

---

### linea_tiempo (M1)

**Descripcion:** Ordenar eventos cronologicamente en una linea de tiempo.

**Contenido (JSONB):**
```json
{
  "question": "Ordena cronologicamente los eventos de la vida de Marie Curie",
  "events": [
    {"id": "event-1", "text": "Nace Maria Sklodowska en Varsovia", "year": 1867, "correctPosition": 0},
    {"id": "event-2", "text": "Se traslada a Paris", "year": 1891, "correctPosition": 1},
    {"id": "event-3", "text": "Recibe primer Premio Nobel", "year": 1903, "correctPosition": 2}
  ]
}
```

**Respuesta Esperada:**
```json
{
  "orderedEventIds": ["event-1", "event-2", "event-3"]
}
```

**Evaluacion:** Automatica - compara orden con correctPosition de cada evento
**Recompensas Base:** 20 XP, 5 ML Coins
**Auto-gradable:** Si

---

### sopa_letras (M1)

**Descripcion:** Encontrar palabras ocultas en una cuadricula de letras.

**Contenido (JSONB):**
```json
{
  "question": "Encuentra las 10 palabras relacionadas con Marie Curie",
  "grid": [
    ["M", "A", "R", "I", "E", "N", "O", "B", "E", "L"],
    ["P", "O", "L", "O", "N", "I", "O", "R", "A", "D"],
    ...
  ],
  "words": [
    {"word": "MARIE", "startRow": 0, "startCol": 0, "direction": "horizontal"},
    {"word": "NOBEL", "startRow": 0, "startCol": 5, "direction": "horizontal"},
    {"word": "POLONIO", "startRow": 1, "startCol": 0, "direction": "horizontal"}
  ]
}
```

**Respuesta Esperada:**
```json
{
  "foundWords": [
    {"word": "MARIE", "startRow": 0, "startCol": 0, "endRow": 0, "endCol": 4},
    {"word": "NOBEL", "startRow": 0, "startCol": 5, "endRow": 0, "endCol": 9}
  ]
}
```

**Evaluacion:** Automatica - valida coordenadas de inicio/fin para cada palabra
**Recompensas Base:** 20 XP, 5 ML Coins (bonus)
**Auto-gradable:** Si

---

### mapa_conceptual (M1)

**Descripcion:** Construir o completar un mapa conceptual con nodos y conexiones.

**Contenido (JSONB):**
```json
{
  "question": "Completa el mapa conceptual sobre los descubrimientos de Marie Curie",
  "nodes": [
    {"id": "node-1", "label": "Marie Curie", "type": "central", "x": 200, "y": 100},
    {"id": "node-2", "label": "???", "type": "empty", "x": 100, "y": 200, "correctLabel": "Radio"},
    {"id": "node-3", "label": "???", "type": "empty", "x": 300, "y": 200, "correctLabel": "Polonio"}
  ],
  "connections": [
    {"from": "node-1", "to": "node-2", "label": "descubrio"},
    {"from": "node-1", "to": "node-3", "label": "descubrio"}
  ],
  "wordBank": ["Radio", "Polonio", "Uranio", "Torio"]
}
```

**Respuesta Esperada:**
```json
{
  "completedNodes": [
    {"nodeId": "node-2", "label": "Radio"},
    {"nodeId": "node-3", "label": "Polonio"}
  ]
}
```

**Evaluacion:** Automatica - compara labels con correctLabel de cada nodo
**Recompensas Base:** 25 XP, 8 ML Coins
**Auto-gradable:** Si

---

### emparejamiento (M1)

**Descripcion:** Conectar elementos de dos columnas que se relacionan.

**Contenido (JSONB):**
```json
{
  "question": "Empareja cada termino con su definicion",
  "options": [
    {"id": "left-1", "text": "Polonio", "label": "right-1"},
    {"id": "right-1", "text": "Elemento nombrado por Polonia"},
    {"id": "left-2", "text": "Radio", "label": "right-2"},
    {"id": "right-2", "text": "Elemento que brilla en la oscuridad"}
  ]
}
```

**Respuesta Esperada:**
```json
{
  "matches": [
    {"left": "left-1", "right": "right-1"},
    {"left": "left-2", "right": "right-2"}
  ]
}
```

**Evaluacion:** Automatica - valida que cada par left-right corresponda con label
**Recompensas Base:** 15 XP, 5 ML Coins
**Auto-gradable:** Si

---

## MODULO 2: Comprension Inferencial

### detective_textual (M2)

**Descripcion:** Analizar un pasaje para encontrar informacion implicita y pistas textuales.

**Contenido (JSONB):**
```json
{
  "question": "Analiza el siguiente pasaje y responde las preguntas",
  "passage": "Marie Curie trabajaba largas horas en un laboratorio mal ventilado...",
  "clues": [
    {"id": "clue-1", "text": "laboratorio mal ventilado", "significance": "condiciones peligrosas"},
    {"id": "clue-2", "text": "tubos de ensayo en los bolsillos", "significance": "falta de proteccion"}
  ],
  "questions": [
    {
      "id": "q1",
      "text": "Por que los cuadernos de Marie brillaban en la oscuridad?",
      "options": [
        {"id": "a", "text": "Usaba tinta fluorescente", "isCorrect": false},
        {"id": "b", "text": "Estaban contaminados con material radiactivo", "isCorrect": true},
        {"id": "c", "text": "Escribia con lapiz luminoso", "isCorrect": false}
      ]
    }
  ]
}
```

**Respuesta Esperada:**
```json
{
  "selectedAnswers": {
    "q1": "b"
  },
  "identifiedClues": ["clue-1", "clue-2"]
}
```

**Evaluacion:** Automatica - valida seleccion de respuestas correctas
**Recompensas Base:** 25 XP, 8 ML Coins
**Auto-gradable:** Si

---

### construccion_hipotesis (M2)

**Descripcion:** Conectar causas con sus efectos logicos.

**Contenido (JSONB):**
```json
{
  "question": "Relaciona cada causa con sus posibles consecuencias",
  "causes": [
    {
      "id": "cause-1",
      "text": "Marie decidio no patentar el proceso de aislamiento del radio",
      "validEffects": ["effect-1", "effect-2", "effect-3"]
    }
  ],
  "effects": [
    {"id": "effect-1", "text": "Otros cientificos pudieron continuar la investigacion"},
    {"id": "effect-2", "text": "No obtuvo riquezas de su descubrimiento"},
    {"id": "effect-3", "text": "La medicina avanzo mas rapidamente"},
    {"id": "effect-4", "text": "Demostro su independencia cientifica"}
  ]
}
```

**Respuesta Esperada:**
```json
{
  "hypotheses": [
    {"causeId": "cause-1", "effectIds": ["effect-1", "effect-2", "effect-3"]}
  ]
}
```

**Evaluacion:** Automatica - valida que effectIds esten en validEffects de la causa
**Recompensas Base:** 25 XP, 8 ML Coins
**Auto-gradable:** Si

---

### prediccion_narrativa (M2)

**Descripcion:** Predecir eventos basandose en el contexto historico.

**Contenido (JSONB):**
```json
{
  "question": "Predice que sucedio cuando Marie presento su candidatura",
  "context": "Ano 1911. Marie ya gano Nobel de Fisica (1903). Es viuda desde 1906.",
  "narrative_start": "Cuando Marie presento su candidatura a la Academia de Ciencias Francesa en 1911...",
  "predictions": [
    {"id": "pred-1", "text": "Fue aceptada inmediatamente con honores", "isCorrect": false},
    {"id": "pred-2", "text": "Fue rechazada por ser mujer, a pesar de sus logros", "isCorrect": true},
    {"id": "pred-3", "text": "Decidio retirar su candidatura", "isCorrect": false}
  ],
  "explanation": "La Academia era conservadora, nunca habia admitido mujeres"
}
```

**Respuesta Esperada:**
```json
{
  "selectedPrediction": "pred-2",
  "justification": "La Academia era muy conservadora y no aceptaba mujeres"
}
```

**Evaluacion:** Automatica (seleccion) + parcial manual (justificacion)
**Recompensas Base:** 25 XP, 8 ML Coins
**Auto-gradable:** Parcial

---

### puzzle_contexto (M2)

**Descripcion:** Ordenar fragmentos para formar una inferencia coherente.

**Contenido (JSONB):**
```json
{
  "question": "Ordena los fragmentos para formar una inferencia coherente",
  "fragments": [
    {"id": "frag-a", "text": "demostro una determinacion extraordinaria", "correctPosition": 2},
    {"id": "frag-b", "text": "A pesar de las barreras sociales y economicas", "correctPosition": 0},
    {"id": "frag-c", "text": "que enfrento como mujer inmigrante", "correctPosition": 1},
    {"id": "frag-d", "text": "convirtiendose en pionera de la ciencia moderna", "correctPosition": 3}
  ]
}
```

**Respuesta Esperada:**
```json
{
  "orderedFragmentIds": ["frag-b", "frag-c", "frag-a", "frag-d"]
}
```

**Evaluacion:** Automatica - compara orden con correctPosition
**Recompensas Base:** 20 XP, 5 ML Coins
**Auto-gradable:** Si

---

### rueda_inferencias (M2)

**Descripcion:** Generar inferencias en categorias aleatorias (literal, inferencial, critico, creativo).

**Contenido (JSONB):**
```json
{
  "question": "Genera una inferencia segun la categoria asignada",
  "fragments": [
    {
      "id": "frag-1",
      "text": "Marie Curie fue pionera en el estudio de la radiactividad...",
      "keywords": ["pionera", "radiactividad", "nobel", "primera", "mujer"]
    }
  ],
  "categories": ["literal", "inferencial", "critico", "creativo"],
  "timeLimit": 30,
  "minLength": 20,
  "maxLength": 200
}
```

**Respuesta Esperada:**
```json
{
  "inferences": [
    {
      "fragmentId": "frag-1",
      "category": "inferencial",
      "text": "Marie tuvo que superar barreras de genero significativas en una epoca donde las mujeres no eran aceptadas en ciencia",
      "timeSpent": 25
    }
  ]
}
```

**Evaluacion:** Manual - docente evalua coherencia de inferencia con categoria
**Recompensas Base:** 30 XP, 10 ML Coins
**Auto-gradable:** No (requiere revision manual)

---

## MODULO 3: Comprension Critica

### tribunal_opiniones (M3)

**Descripcion:** Clasificar afirmaciones como HECHO, OPINION o INTERPRETACION.

**Contenido (JSONB):**
```json
{
  "question": "Clasifica cada afirmacion y evalua su fundamentacion",
  "statements": [
    {
      "id": "stmt-1",
      "text": "Marie Curie murio el 4 de julio de 1934 a causa de anemia aplasica",
      "correctType": "HECHO",
      "correctVerdict": "bien_fundamentada"
    },
    {
      "id": "stmt-2",
      "text": "Marie Curie fue la cientifica mas brillante del siglo XX",
      "correctType": "OPINION",
      "correctVerdict": "sin_fundamento"
    }
  ],
  "types": ["HECHO", "OPINION", "INTERPRETACION"],
  "verdicts": ["bien_fundamentada", "parcialmente_fundamentada", "sin_fundamento"]
}
```

**Respuesta Esperada:**
```json
{
  "classifications": [
    {"statementId": "stmt-1", "type": "HECHO", "verdict": "bien_fundamentada", "justification": "Dato verificable en registros oficiales"},
    {"statementId": "stmt-2", "type": "OPINION", "verdict": "sin_fundamento", "justification": "Mas brillante no es medible objetivamente"}
  ]
}
```

**Evaluacion:** Automatica (tipo/veredicto) + Manual (justificacion)
**Recompensas Base:** 30 XP, 10 ML Coins
**Auto-gradable:** Parcial

---

### debate_digital (M3)

**Descripcion:** Argumentar sobre dilemas eticos con evidencias.

**Contenido (JSONB):**
```json
{
  "question": "Debate: La fama afecto negativamente la investigacion de Marie Curie?",
  "topic": "Impacto de la fama en la investigacion cientifica",
  "positions": {
    "favor": {
      "label": "La fama afecto negativamente",
      "suggestedArguments": ["Invasion de privacidad", "Tiempo perdido en eventos"]
    },
    "contra": {
      "label": "La fama beneficio",
      "suggestedArguments": ["Mayor financiacion", "Reconocimiento institucional"]
    }
  },
  "minArguments": 3,
  "requireEvidence": true
}
```

**Respuesta Esperada:**
```json
{
  "position": "contra",
  "arguments": [
    {
      "claim": "Mayor financiacion para laboratorio",
      "evidence": "Laboratorio mejorado despues del Nobel; pudo contratar asistentes",
      "strength": "muy_fuerte"
    },
    {
      "claim": "Reconocimiento institucional",
      "evidence": "Primera mujer profesora en la Sorbona (1906)",
      "strength": "fuerte"
    }
  ],
  "conclusion": "La fama, aunque tuvo costos personales, fue crucial para avanzar su investigacion"
}
```

**Evaluacion:** Manual - docente evalua calidad de argumentacion
**Recompensas Base:** 35 XP, 12 ML Coins
**Auto-gradable:** No (requiere revision manual)

---

### analisis_fuentes (M3)

**Descripcion:** Ordenar fuentes segun credibilidad usando metodo CRAAP.

**Contenido (JSONB):**
```json
{
  "question": "Ordena las fuentes de mayor a menor credibilidad",
  "sources": [
    {
      "id": "src-1",
      "title": "Nobel Lectures: Physics 1901-1921",
      "author": "Nobel Foundation",
      "year": 1967,
      "type": "primary",
      "correctRank": 1,
      "score": 100
    },
    {
      "id": "src-2",
      "title": "Blog personal anonimo",
      "author": "Anonimo",
      "year": 2023,
      "type": "blog",
      "correctRank": 5,
      "score": 15
    }
  ],
  "craapCriteria": ["currency", "relevance", "authority", "accuracy", "purpose"]
}
```

**Respuesta Esperada:**
```json
{
  "rankedSources": ["src-1", "src-3", "src-4", "src-5", "src-2"],
  "evaluations": [
    {
      "sourceId": "src-1",
      "scores": {
        "currency": 8,
        "relevance": 10,
        "authority": 10,
        "accuracy": 10,
        "purpose": 10
      },
      "justification": "Fuente primaria oficial de la Fundacion Nobel"
    }
  ]
}
```

**Evaluacion:** Automatica (orden) + Manual (evaluaciones)
**Recompensas Base:** 30 XP, 10 ML Coins
**Auto-gradable:** Parcial

---

### podcast_argumentativo (M3)

**Descripcion:** Crear un episodio de podcast sobre dilemas eticos.

**Contenido (JSONB):**
```json
{
  "question": "Crea un episodio de podcast sobre el dilema etico seleccionado",
  "topics": [
    {"id": "topic-1", "title": "Sacrificio Personal vs Bienestar Familiar"},
    {"id": "topic-2", "title": "Patentes vs Ciencia Abierta"},
    {"id": "topic-3", "title": "Responsabilidad del Cientifico"}
  ],
  "structure": {
    "introduction": {"duration": "30-45 seg", "description": "Presentacion del tema y tesis"},
    "development": {"duration": "90-120 seg", "description": "3 argumentos con evidencias"},
    "counterargument": {"duration": "30-45 seg", "description": "Reconocer perspectiva opuesta"},
    "conclusion": {"duration": "30-45 seg", "description": "Sintesis y reflexion final"}
  },
  "allowAudioUpload": true,
  "allowScriptOnly": true
}
```

**Respuesta Esperada:**
```json
{
  "topicId": "topic-2",
  "type": "script",
  "script": {
    "introduction": "Bienvenidos a este episodio sobre el dilema de patentar descubrimientos cientificos...",
    "arguments": [
      {"point": "Beneficio de la humanidad", "evidence": "Marie permitio que otros investigaran..."},
      {"point": "Avance de la medicina", "evidence": "El radio se uso para tratar cancer..."}
    ],
    "counterargument": "Algunos argumentan que patentar habria financiado mas investigacion...",
    "conclusion": "En conclusion, la decision de Marie de no patentar..."
  },
  "audioUrl": null,
  "duration": null
}
```

**Evaluacion:** Manual - docente evalua claridad, solidez argumentativa, profundidad
**Recompensas Base:** 40 XP, 15 ML Coins
**Auto-gradable:** No (requiere revision manual)

---

### matriz_perspectivas (M3)

**Descripcion:** Analizar como diferentes grupos percibieron a Marie Curie.

**Contenido (JSONB):**
```json
{
  "question": "Analiza las diferentes perspectivas sobre Marie Curie",
  "perspectives": [
    {
      "id": "persp-1",
      "group": "Comunidad cientifica (1903)",
      "initialView": "Escepticismo inicial hacia mujer cientifica",
      "evidence": "Casi no fue nominada al Nobel",
      "evolution": "Reconocimiento gradual tras evidencia irrefutable"
    },
    {
      "id": "persp-2",
      "group": "Prensa francesa (1911)",
      "initialView": "Sensacionalismo sobre vida personal",
      "evidence": "Escandalo amoroso eclipso segundo Nobel"
    }
  ],
  "analysisQuestions": [
    "Que perspectiva fue mas injusta con Marie?",
    "Como ha evolucionado la percepcion?",
    "Que grupo tuvo perspectiva mas equilibrada?"
  ]
}
```

**Respuesta Esperada:**
```json
{
  "perspectiveAnalysis": [
    {
      "perspectiveId": "persp-1",
      "analysis": "La comunidad cientifica mostro sesgo de genero...",
      "modernView": "Hoy Marie es reconocida como pionera"
    }
  ],
  "questionAnswers": {
    "q1": "La prensa sensacionalista de 1911 fue mas injusta...",
    "q2": "La percepcion evoluciono de escepticismo a reconocimiento universal...",
    "q3": "Los historiadores modernos tienen la perspectiva mas equilibrada..."
  }
}
```

**Evaluacion:** Manual - docente evalua profundidad y equilibrio del analisis
**Recompensas Base:** 35 XP, 12 ML Coins
**Auto-gradable:** No (requiere revision manual)

---

## MODULO 4: Lectura Digital

### verificador_fake_news (M4)

**Descripcion:** Identificar afirmaciones falsas y verificar informacion con fuentes confiables.

**Contenido (JSONB):**
```json
{
  "question": "Verifica las afirmaciones del siguiente articulo",
  "article": {
    "title": "Marie Curie: La cientifica que gano 3 Premios Nobel",
    "source": "Blog de ciencia popular",
    "text": "Marie Curie gano 3 Premios Nobel por sus descubrimientos..."
  },
  "claims": [
    {"id": "claim-1", "text": "Marie Curie gano 3 Premios Nobel", "isFake": true},
    {"id": "claim-2", "text": "Descubrio el radio y el polonio", "isFake": false},
    {"id": "claim-3", "text": "Fue la primera mujer en ensenar en la Sorbona", "isFake": false}
  ],
  "verificationTools": ["wikipedia", "nobel_official", "google_scholar", "snopes"],
  "config": {
    "factCheckTools": true,
    "sourceVerification": true,
    "claimExtraction": true,
    "confidenceScoring": true
  }
}
```

**Respuesta Esperada:**
```json
{
  "claims_verified": [
    {
      "claim_id": "claim-1",
      "is_fake": true,
      "evidence": "Marie Curie gano 2 Premios Nobel, no 3. Gano el de Fisica en 1903 y el de Quimica en 1911. Verificado en Nobel Prize official website."
    },
    {
      "claim_id": "claim-2",
      "is_fake": false,
      "evidence": "Confirmado en publicaciones cientificas de 1898 y registros historicos."
    }
  ]
}
```

**Evaluacion:** Manual - docente evalua calidad de evidencia y verificacion
**Recompensas Base:** 35 XP, 12 ML Coins
**Auto-gradable:** No (requiere revision manual)

---

### infografia_interactiva (M4)

**Descripcion:** Extraer informacion de visualizaciones interactivas.

**Contenido (JSONB):**
```json
{
  "question": "Explora la infografia y responde las preguntas",
  "infographic": {
    "title": "Marie Curie: 150 Anos de Legado Cientifico",
    "sections": [
      {"id": "timeline", "type": "visual_timeline", "data": {...}},
      {"id": "discoveries", "type": "icon_grid", "data": {...}},
      {"id": "impact", "type": "flowchart", "data": {...}}
    ]
  },
  "questions": [
    {"id": "q1", "text": "Cuantos anos vivio Marie Curie?", "section": "timeline", "correctAnswer": "67"},
    {"id": "q2", "text": "Que aplicacion medica surgio de sus descubrimientos?", "section": "impact"}
  ],
  "config": {
    "interactiveElements": true,
    "dataVisualization": true,
    "clickableRegions": true
  }
}
```

**Respuesta Esperada:**
```json
{
  "answers": {
    "q1": "67 anos",
    "q2": "Tratamientos de cancer y radioterapia"
  },
  "sections_explored": ["timeline", "discoveries", "impact"]
}
```

**Evaluacion:** Manual - docente evalua exploracion y respuestas
**Recompensas Base:** 30 XP, 10 ML Coins
**Auto-gradable:** No (requiere revision manual)

---

### quiz_tiktok (M4)

**Descripcion:** Responder preguntas rapidas en formato dinamico estilo TikTok.

**Contenido (JSONB):**
```json
{
  "question": "Quiz rapido sobre Marie Curie",
  "questions": [
    {
      "id": "q1",
      "text": "En que ciudad nacio Marie Curie?",
      "options": ["Paris", "Varsovia", "Berlin", "Londres"],
      "correctIndex": 1,
      "timeLimit": 10
    },
    {
      "id": "q2",
      "text": "Cuantos Premios Nobel gano?",
      "options": ["1", "2", "3", "4"],
      "correctIndex": 1,
      "timeLimit": 10
    }
  ],
  "config": {
    "timeLimit": 10,
    "swipeInterface": true,
    "quickFeedback": true,
    "sharable": true
  }
}
```

**Respuesta Esperada:**
```json
{
  "answers": [1, 1, 2],
  "timePerQuestion": [8.5, 6.2, 9.1]
}
```

**Evaluacion:** Automatica - compara indices con correctIndex
**Recompensas Base:** 15 XP, 5 ML Coins
**Auto-gradable:** Si

---

### navegacion_hipertextual (M4)

**Descripcion:** Seguir hipervinculos para encontrar informacion especifica.

**Contenido (JSONB):**
```json
{
  "question": "Que experimentos realizo Marie Curie para aislar el radio?",
  "startNode": "mainArticle",
  "nodes": {
    "mainArticle": {
      "title": "Marie Curie: Pionera de la Radiactividad",
      "content": "Marie Curie revoluciono la ciencia...",
      "links": [
        {"id": "radiactividad", "text": "descubrimientos en radiactividad"},
        {"id": "aislamiento", "text": "aislamiento de elementos radiactivos"}
      ]
    },
    "aislamiento": {
      "title": "Proceso de Aislamiento del Radio",
      "content": "El proceso de aislamiento requirio 4 anos...",
      "isTarget": true
    }
  },
  "optimalPath": ["mainArticle", "aislamiento"],
  "config": {
    "hyperlinks": true,
    "pathTracking": true,
    "informationSynthesis": true
  }
}
```

**Respuesta Esperada:**
```json
{
  "path": ["mainArticle", "aislamiento", "proceso"],
  "information_found": {
    "experiment_type": "Cristalizacion fraccionada",
    "materials": "Pechblenda (8 toneladas)",
    "duration": "4 anos (1898-1902)",
    "result": "0.1 gramos de radio puro"
  }
}
```

**Evaluacion:** Manual - docente evalua eficiencia de navegacion y sintesis
**Recompensas Base:** 30 XP, 10 ML Coins
**Auto-gradable:** No (requiere revision manual)

---

### analisis_memes (M4)

**Descripcion:** Decodificar mensajes en memes sobre Marie Curie.

**Contenido (JSONB):**
```json
{
  "question": "Analiza el siguiente meme sobre Marie Curie",
  "meme": {
    "id": "meme1",
    "imageUrl": "/memes/marie-curie-glowing.jpg",
    "format": "Drake Hotline Bling",
    "topText": "Proteccion contra radiacion",
    "bottomText": "Seguir experimentando sin proteccion"
  },
  "analysisPrompts": [
    "Cual es el mensaje principal del meme?",
    "Que formato de meme se utiliza?",
    "Es historicamente exacto?",
    "Por que es gracioso/ironico?"
  ],
  "config": {
    "visualAnalysis": true,
    "culturalReferences": true,
    "humorDecoding": true
  }
}
```

**Respuesta Esperada:**
```json
{
  "annotations": [
    {"x": 120.5, "y": 85.3, "text": "Aqui se puede ver un ejemplo de ironia historica"},
    {"x": 200.0, "y": 150.0, "text": "El gesto de rechazo/aceptacion crea el contraste humoristico"}
  ],
  "analysis": {
    "message": "Marie Curie priorizaba su investigacion sobre su seguridad personal, sin conocer los peligros de la radiacion",
    "format": "Drake Hotline Bling",
    "historicalAccuracy": true,
    "humorType": "Ironia historica"
  }
}
```

**Evaluacion:** Manual - docente evalua identificacion del mensaje y analisis
**Recompensas Base:** 30 XP, 10 ML Coins
**Auto-gradable:** No (requiere revision manual)

---

### resena_critica (M4)

**Descripcion:** Escribir una resena critica de un texto o articulo.

**Contenido (JSONB):**
```json
{
  "question": "Escribe una resena critica del siguiente articulo",
  "article": {
    "title": "El legado de Marie Curie en la medicina moderna",
    "author": "Dr. Jean Dupont",
    "source": "Journal of Science History",
    "text": "..."
  },
  "criteria": ["tesis_clara", "argumentos_solidos", "evidencia", "conclusion"],
  "minWords": 200,
  "maxWords": 400
}
```

**Respuesta Esperada:**
```json
{
  "review": {
    "summary": "El articulo presenta el impacto de Marie Curie en la medicina...",
    "strengths": ["Buena documentacion historica", "Fuentes verificables"],
    "weaknesses": ["Falta de perspectiva critica", "Omision de controversias"],
    "evaluation": "El articulo es informativo pero carece de analisis critico...",
    "recommendation": "Recomendado con reservas para lectores interesados en historia de la ciencia"
  },
  "wordCount": 287
}
```

**Evaluacion:** Manual - docente evalua calidad de analisis critico
**Recompensas Base:** 35 XP, 12 ML Coins
**Auto-gradable:** No (requiere revision manual)

---

### chat_literario (M4)

**Descripcion:** Participar en un chat simulado sobre un texto literario.

**Contenido (JSONB):**
```json
{
  "question": "Participa en el chat sobre el texto de Marie Curie",
  "text": "Extracto de autobiografia de Marie Curie...",
  "chatPrompts": [
    {"role": "moderator", "message": "Que creen que sintio Marie al descubrir el radio?"},
    {"role": "student", "message": "placeholder"}
  ],
  "minResponses": 5,
  "minWordsPerResponse": 30
}
```

**Respuesta Esperada:**
```json
{
  "responses": [
    {"promptId": 1, "response": "Creo que Marie sintio una mezcla de emocion y alivio despues de 4 anos de trabajo..."},
    {"promptId": 2, "response": "..."}
  ]
}
```

**Evaluacion:** Manual - docente evalua calidad de participacion
**Recompensas Base:** 30 XP, 10 ML Coins
**Auto-gradable:** No (requiere revision manual)

---

### email_formal (M4)

**Descripcion:** Redactar un correo electronico formal.

**Contenido (JSONB):**
```json
{
  "question": "Redacta un correo formal como si fueras Marie Curie",
  "scenario": "Escribir al comite Nobel agradeciendoles por el premio de 1911",
  "recipient": "Comite Nobel",
  "requirements": ["saludo_formal", "introduccion", "cuerpo", "despedida_formal"],
  "minWords": 150,
  "maxWords": 300
}
```

**Respuesta Esperada:**
```json
{
  "email": {
    "to": "Comite Nobel",
    "subject": "Agradecimiento por el Premio Nobel de Quimica 1911",
    "greeting": "Estimados miembros del Comite Nobel,",
    "body": "Me dirijo a ustedes para expresar mi mas sincero agradecimiento...",
    "closing": "Con mis mas distinguidas consideraciones,",
    "signature": "Marie Curie"
  },
  "wordCount": 187
}
```

**Evaluacion:** Manual - docente evalua formalidad y contenido
**Recompensas Base:** 25 XP, 8 ML Coins
**Auto-gradable:** No (requiere revision manual)

---

### ensayo_argumentativo (M4)

**Descripcion:** Escribir un ensayo argumentativo sobre un tema relacionado.

**Contenido (JSONB):**
```json
{
  "question": "Escribe un ensayo argumentativo sobre el tema seleccionado",
  "topics": [
    "El papel de las mujeres en la ciencia del siglo XX",
    "Etica en la investigacion cientifica",
    "El precio del progreso cientifico"
  ],
  "structure": ["introduccion", "tesis", "argumentos", "contraargumento", "conclusion"],
  "minWords": 400,
  "maxWords": 600
}
```

**Respuesta Esperada:**
```json
{
  "essay": {
    "title": "El papel de las mujeres en la ciencia del siglo XX",
    "introduction": "A lo largo del siglo XX, las mujeres lucharon por un lugar en la ciencia...",
    "thesis": "Marie Curie demostro que el genero no determina la capacidad cientifica",
    "arguments": [
      {"point": "Primer argumento", "evidence": "..."},
      {"point": "Segundo argumento", "evidence": "..."}
    ],
    "counterargument": "Algunos argumentan que...",
    "conclusion": "En conclusion, Marie Curie abrio el camino..."
  },
  "wordCount": 523,
  "topicSelected": 0
}
```

**Evaluacion:** Manual - docente evalua estructura, argumentacion y evidencia
**Recompensas Base:** 40 XP, 15 ML Coins
**Auto-gradable:** No (requiere revision manual)

---

## MODULO 5: Produccion Lectora

### diario_multimedia (M5)

**Descripcion:** Crear un diario desde la perspectiva de Marie Curie.

**Contenido (JSONB):**
```json
{
  "question": "Crea un diario desde la perspectiva de Marie Curie en 1898",
  "context": {
    "year": "1898",
    "setting": "Laboratorio en Paris",
    "events": ["Descubrimiento del radio", "Trabajo con Pierre"]
  },
  "prompts": [
    {"date": "1898-12-15", "title": "El Dia del Descubrimiento", "mood": "excitement"},
    {"date": "1898-12-20", "title": "Reflexiones sobre Dificultades", "mood": "determination"},
    {"date": "1898-12-26", "title": "Suenos para el Futuro", "mood": "hope"}
  ],
  "config": {
    "allowMultimedia": true,
    "minEntries": 3,
    "maxEntries": 5,
    "formats": ["text", "image", "audio", "video"],
    "minWordsPerEntry": 50,
    "layouts": ["simple", "journal", "notebook", "letter"]
  }
}
```

**Respuesta Esperada:**
```json
{
  "entries": [
    {
      "id": "entry1",
      "date": "1898-12-15",
      "title": "El Dia del Descubrimiento",
      "content": "Querido diario, hoy es un dia que nunca olvidare. Despues de cuatro anos de trabajo incansable, Pierre y yo finalmente lo logramos...",
      "mood": "excitement",
      "weather": "Frio invernal en Paris",
      "location": "Laboratorio en Rue Lhomond",
      "wordCount": 156,
      "template": "template_classic"
    }
  ],
  "totalEntries": 3,
  "totalWords": 468
}
```

**Evaluacion:** Manual - docente evalua creatividad, precision historica, expresion
**Recompensas Base:** 500 XP, 50 ML Coins
**Auto-gradable:** No (requiere revision manual)

---

### comic_digital (M5)

**Descripcion:** Crear un comic de 4-6 vinetas narrando el descubrimiento del radio.

**Contenido (JSONB):**
```json
{
  "question": "Crea un comic de 4-6 vinetas sobre el descubrimiento del radio",
  "storyBeats": [
    {"panel": 1, "title": "El Laboratorio Humilde", "scene": "Marie y Pierre con pechblenda"},
    {"panel": 2, "title": "La Anomalia", "scene": "Marie descubre anomalia en mediciones"},
    {"panel": 3, "title": "Anos de Trabajo", "scene": "Montaje de 4 anos de trabajo"},
    {"panel": 4, "title": "Brilla en la Oscuridad!", "scene": "El radio brilla con luz azul-verde"}
  ],
  "characters": [
    {"name": "Marie Curie", "description": "Mujer de ~31 anos, cabello oscuro recogido"},
    {"name": "Pierre Curie", "description": "Hombre de ~39 anos, barba"}
  ],
  "config": {
    "minPanels": 4,
    "maxPanels": 6,
    "requireDialogue": true,
    "requireNarration": true,
    "allowSketches": true,
    "allowDigitalDrawing": true
  }
}
```

**Respuesta Esperada:**
```json
{
  "panels": [
    {
      "panelNumber": 1,
      "dialogue": "Marie: Este mineral contiene algo extraordinario, Pierre.",
      "narration": "1898. En un laboratorio frio de Paris...",
      "imageUrl": "https://storage.example.com/panel1.png",
      "visualDescription": "Marie y Pierre observan un mineral oscuro sobre la mesa del laboratorio"
    },
    {
      "panelNumber": 2,
      "dialogue": "Pierre: Debemos aislarlo, por muy dificil que sea.",
      "narration": "Los Curie inician anos de arduo trabajo."
    }
  ]
}
```

**Evaluacion:** Manual - docente evalua narrativa, visual, precision, creatividad
**Recompensas Base:** 500 XP, 50 ML Coins
**Auto-gradable:** No (requiere revision manual)

---

### video_carta (M5)

**Descripcion:** Grabar un mensaje como Marie Curie (1925) al siglo XXI.

**Contenido (JSONB):**
```json
{
  "question": "Graba un video-carta desde la perspectiva de Marie Curie en 1925",
  "context": {
    "year": 1925,
    "age": 58,
    "location": "Instituto Curie, Paris",
    "achievements": ["Primera mujer Nobel", "Dos premios Nobel", "Fundadora Instituto Curie"]
  },
  "themes": [
    {"id": "education", "title": "Educacion para Mujeres"},
    {"id": "ethics", "title": "Etica Cientifica"},
    {"id": "perseverance", "title": "Perseverancia"},
    {"id": "legacy", "title": "Legado Personal"}
  ],
  "config": {
    "videoRequired": false,
    "scriptAlternative": true,
    "minDuration": 120,
    "maxDuration": 300,
    "minWords": 400,
    "maxWords": 600,
    "allowedFormats": ["mp4", "webm", "mov", "script"]
  }
}
```

**Respuesta Esperada:**
```json
{
  "video_url": "https://youtu.be/example123",
  "sections": [
    {"title": "Introduccion y presentacion personal", "duration_seconds": 45},
    {"title": "Aprendizajes sobre educacion", "duration_seconds": 120},
    {"title": "Reflexion sobre perseverancia", "duration_seconds": 90},
    {"title": "Conclusiones y compromisos futuros", "duration_seconds": 60}
  ]
}
```

**O alternativa de script:**
```json
{
  "type": "script",
  "script": {
    "introduction": "Buenos dias, jovenes del siglo XXI. Soy Marie Curie...",
    "body": [
      {"theme": "education", "content": "La educacion fue mi liberacion..."},
      {"theme": "perseverance", "content": "Hubo dias oscuros..."}
    ],
    "conclusion": "Que mi historia les inspire..."
  },
  "wordCount": 487,
  "themes_covered": ["education", "perseverance", "legacy"]
}
```

**Evaluacion:** Manual - docente evalua autenticidad, mensaje, presentacion, emocion
**Recompensas Base:** 500 XP, 50 ML Coins
**Auto-gradable:** No (requiere revision manual)

---

## MECANICAS AUXILIARES

### verdadero_falso (Auxiliar)

**Descripcion:** Evaluar afirmaciones como verdaderas o falsas.

**Contenido (JSONB):**
```json
{
  "question": "Indica si las siguientes afirmaciones son verdaderas o falsas",
  "context": "Durante su infancia en Polonia, Marie era conocida por su insaciable curiosidad cientifica...",
  "statements": [
    {"id": "s1", "text": "Marie mostro curiosidad excepcional por las ciencias desde muy pequena", "correctAnswer": true},
    {"id": "s2", "text": "Su padre era profesor de quimica solamente", "correctAnswer": false},
    {"id": "s3", "text": "Marie nacio en Francia", "correctAnswer": false}
  ],
  "explanations": {
    "s1": "El texto menciona su insaciable curiosidad cientifica",
    "s2": "Era profesor de matematicas y fisica",
    "s3": "Nacio en Polonia (Varsovia)"
  }
}
```

**Respuesta Esperada:**
```json
{
  "answers": {
    "s1": true,
    "s2": false,
    "s3": false
  }
}
```

**Evaluacion:** Automatica - compara con correctAnswer
**Recompensas Base:** 10 XP, 3 ML Coins
**Auto-gradable:** Si

---

### completar_espacios (Auxiliar)

**Descripcion:** Completar espacios en blanco en un texto.

**Contenido (JSONB):**
```json
{
  "question": "Marie Sklodowska nacio en ___(1)___, Polonia. Su padre ___(2)___ era profesor...",
  "blanks": [
    {"id": "blank-1", "position": 1, "correctAnswer": ["Varsovia"]},
    {"id": "blank-2", "position": 2, "correctAnswer": ["Wladyslaw", "Vladislav"]},
    {"id": "blank-3", "position": 3, "correctAnswer": ["Bronislawa"]}
  ],
  "wordBank": ["Varsovia", "Paris", "Wladyslaw", "Pierre", "Bronislawa", "Eva"]
}
```

**Respuesta Esperada:**
```json
{
  "answers": ["Varsovia", "Wladyslaw", "Bronislawa"]
}
```

**Evaluacion:** Automatica - compara con correctAnswer (case-insensitive, trim)
**Recompensas Base:** 15 XP, 5 ML Coins
**Auto-gradable:** Si

---

### comprension_auditiva (Auxiliar)

**Descripcion:** Escuchar un audio y responder preguntas de comprension.

**Contenido (JSONB):**
```json
{
  "question": "Escucha el audio y responde las preguntas",
  "audioUrl": "/audio/marie-curie-biography.mp3",
  "audioDuration": 180,
  "transcript": "Marie Curie nacio en Varsovia en 1867...",
  "questions": [
    {"id": "q1", "text": "En que ano nacio Marie Curie?", "correctAnswer": "1867"},
    {"id": "q2", "text": "Donde nacio?", "correctAnswer": "Varsovia"}
  ],
  "allowReplay": true,
  "maxReplays": 3
}
```

**Respuesta Esperada:**
```json
{
  "answers": {
    "q1": "1867",
    "q2": "Varsovia"
  },
  "replaysUsed": 1
}
```

**Evaluacion:** Automatica/Parcial - depende del tipo de pregunta
**Recompensas Base:** 20 XP, 5 ML Coins
**Auto-gradable:** Parcial

---

### collage_prensa (Auxiliar)

**Descripcion:** Crear un collage con recortes de prensa sobre un tema.

**Contenido (JSONB):**
```json
{
  "question": "Crea un collage con articulos sobre Marie Curie",
  "articles": [
    {"id": "art-1", "title": "Nobel Prize 1903", "source": "Le Figaro", "thumbnail": "..."},
    {"id": "art-2", "title": "Scientific Breakthrough", "source": "Nature", "thumbnail": "..."}
  ],
  "canvas": {"width": 800, "height": 600},
  "minArticles": 4,
  "requireCaption": true
}
```

**Respuesta Esperada:**
```json
{
  "collage": {
    "articles": [
      {"articleId": "art-1", "x": 50, "y": 50, "width": 200, "height": 150, "caption": "El primer Nobel"},
      {"articleId": "art-2", "x": 300, "y": 100, "width": 180, "height": 140, "caption": "Descubrimiento del radio"}
    ]
  },
  "title": "El legado de Marie Curie en la prensa"
}
```

**Evaluacion:** Manual - docente evalua seleccion y organizacion
**Recompensas Base:** 25 XP, 8 ML Coins
**Auto-gradable:** No (requiere revision manual)

---

### texto_movimiento (Auxiliar)

**Descripcion:** Interactuar con texto animado o en movimiento.

**Contenido (JSONB):**
```json
{
  "question": "Captura las palabras clave mientras se mueven",
  "words": [
    {"word": "RADIO", "speed": "slow", "points": 10},
    {"word": "POLONIO", "speed": "medium", "points": 15},
    {"word": "NOBEL", "speed": "fast", "points": 20}
  ],
  "duration": 60,
  "targetScore": 50
}
```

**Respuesta Esperada:**
```json
{
  "capturedWords": ["RADIO", "POLONIO", "NOBEL"],
  "score": 45,
  "timeUsed": 55
}
```

**Evaluacion:** Automatica - suma de puntos de palabras capturadas
**Recompensas Base:** 15 XP, 5 ML Coins
**Auto-gradable:** Si

---

### call_to_action (Auxiliar)

**Descripcion:** Identificar y evaluar llamados a la accion en textos.

**Contenido (JSONB):**
```json
{
  "question": "Identifica los llamados a la accion en el texto",
  "text": "Marie Curie nos inspira a perseguir nuestros suenos. Dona ahora para apoyar a mujeres en ciencia. Inscribete en nuestro programa...",
  "callsToAction": [
    {"id": "cta-1", "text": "Dona ahora", "type": "donation", "highlighted": [45, 55]},
    {"id": "cta-2", "text": "Inscribete en nuestro programa", "type": "enrollment", "highlighted": [78, 108]}
  ]
}
```

**Respuesta Esperada:**
```json
{
  "identifiedCTAs": [
    {"ctaId": "cta-1", "type": "donation", "effectiveness": "media", "justification": "..."},
    {"ctaId": "cta-2", "type": "enrollment", "effectiveness": "alta", "justification": "..."}
  ]
}
```

**Evaluacion:** Parcial automatica + manual
**Recompensas Base:** 20 XP, 5 ML Coins
**Auto-gradable:** Parcial

---

## Tabla Resumen de Mecanicas

| Mecanica | Modulo | Auto-gradable | XP Base | ML Coins | Manual |
|----------|--------|---------------|---------|----------|--------|
| crucigrama | M1 | Si | 20 | 5 | No |
| linea_tiempo | M1 | Si | 20 | 5 | No |
| sopa_letras | M1 | Si | 20 | 5 | No |
| mapa_conceptual | M1 | Si | 25 | 8 | No |
| emparejamiento | M1 | Si | 15 | 5 | No |
| detective_textual | M2 | Si | 25 | 8 | No |
| construccion_hipotesis | M2 | Si | 25 | 8 | No |
| prediccion_narrativa | M2 | Parcial | 25 | 8 | Parcial |
| puzzle_contexto | M2 | Si | 20 | 5 | No |
| rueda_inferencias | M2 | No | 30 | 10 | Si |
| tribunal_opiniones | M3 | Parcial | 30 | 10 | Parcial |
| debate_digital | M3 | No | 35 | 12 | Si |
| analisis_fuentes | M3 | Parcial | 30 | 10 | Parcial |
| podcast_argumentativo | M3 | No | 40 | 15 | Si |
| matriz_perspectivas | M3 | No | 35 | 12 | Si |
| verificador_fake_news | M4 | No | 35 | 12 | Si |
| infografia_interactiva | M4 | No | 30 | 10 | Si |
| quiz_tiktok | M4 | Si | 15 | 5 | No |
| navegacion_hipertextual | M4 | No | 30 | 10 | Si |
| analisis_memes | M4 | No | 30 | 10 | Si |
| resena_critica | M4 | No | 35 | 12 | Si |
| chat_literario | M4 | No | 30 | 10 | Si |
| email_formal | M4 | No | 25 | 8 | Si |
| ensayo_argumentativo | M4 | No | 40 | 15 | Si |
| diario_multimedia | M5 | No | 500 | 50 | Si |
| comic_digital | M5 | No | 500 | 50 | Si |
| video_carta | M5 | No | 500 | 50 | Si |
| verdadero_falso | Aux | Si | 10 | 3 | No |
| completar_espacios | Aux | Si | 15 | 5 | No |
| comprension_auditiva | Aux | Parcial | 20 | 5 | Parcial |
| collage_prensa | Aux | No | 25 | 8 | Si |
| texto_movimiento | Aux | Si | 15 | 5 | No |
| call_to_action | Aux | Parcial | 20 | 5 | Parcial |

---

## Referencias

### Archivos de Codigo

- **Enum de tipos:** `/apps/backend/src/shared/constants/enums.constants.ts` (ExerciseTypeEnum)
- **Entity de ejercicios:** `/apps/backend/src/modules/educational/entities/exercise.entity.ts`
- **DTOs de respuestas M4:** `/apps/backend/src/modules/educational/dto/module4/`
- **DTOs de respuestas M5:** `/apps/backend/src/modules/educational/dto/module5/`
- **Componentes frontend:** `/apps/frontend/src/features/exercises/components/`

### Documentacion Relacionada

- `EJERCICIOS-PREGUNTAS-RESPUESTAS.md` - Preguntas y respuestas de todos los ejercicios
- `DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md` - Documento de diseno original

---

*Documento generado automaticamente - GAMILIT Student Portal*
*Version 1.0.0 - 2026-01-20*
