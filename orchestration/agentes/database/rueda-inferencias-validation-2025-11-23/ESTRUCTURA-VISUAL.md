# Estructura Visual: categoryExpectations

**Fecha:** 2025-11-23
**Ejercicio:** Rueda de Inferencias (rueda_inferencias)

---

## Diagrama de Estructura

```
exercises (table)
│
└─── solution (JSONB field)
     │
     ├─── validation
     │    ├── minKeywords: 2
     │    ├── minLength: 20
     │    └── maxLength: 200
     │
     └─── fragments [array]
          │
          ├─── Fragment 1 (frag-1)
          │    ├── id: "frag-1"
          │    ├── text: "Marie Curie fue pionera..."
          │    └── categoryExpectations
          │         ├── cat-literal (20 pts)
          │         │    ├── keywords: ["pionera", "radiactividad", ...]
          │         │    ├── description: "Identifica hechos..."
          │         │    └── example: "Marie fue la primera..."
          │         │
          │         ├── cat-inferencial (25 pts)
          │         │    ├── keywords: ["impacto", "importancia", ...]
          │         │    ├── description: "Deduce información..."
          │         │    └── example: "El hecho de ganar..."
          │         │
          │         ├── cat-critico (30 pts)
          │         │    ├── keywords: ["evaluar", "analizar", ...]
          │         │    ├── description: "Analiza y evalúa..."
          │         │    └── example: "Ganar dos Nobeles..."
          │         │
          │         └── cat-creativo (25 pts)
          │              ├── keywords: ["imaginar", "si", ...]
          │              ├── description: "Genera ideas..."
          │              └── example: "Si Marie hubiera..."
          │
          ├─── Fragment 2 (frag-2)
          │    ├── id: "frag-2"
          │    ├── text: "A pesar de enfrentar..."
          │    └── categoryExpectations (4 categorías)
          │
          └─── Fragment 3 (frag-3)
               ├── id: "frag-3"
               ├── text: "Los cuadernos de Marie..."
               └── categoryExpectations (4 categorías)
```

---

## Ejemplo Completo: Fragment 1

### Texto del fragmento
```
"Marie Curie fue pionera en el estudio de la radiactividad,
convirtiéndose en la primera mujer en ganar un Premio Nobel
y la única persona en ganar en dos campos científicos diferentes."
```

### Categorías disponibles

#### 🔵 cat-literal (20 puntos)
**Tipo de inferencia:** Identifica hechos explícitos del texto

**Keywords esperados (9):**
- pionera
- radiactividad
- nobel
- primera
- mujer
- cientifico
- premio
- campos
- unica

**Descripción:**
"Identifica hechos explícitos del texto"

**Ejemplo de respuesta correcta:**
"Marie fue la primera mujer en ganar un Nobel y ganó en dos campos científicos diferentes."

---

#### 🟢 cat-inferencial (25 puntos)
**Tipo de inferencia:** Deduce información no explícita basándose en pistas

**Keywords esperados (9):**
- impacto
- importancia
- consecuencia
- implica
- deducir
- sugiere
- interdisciplinario
- excepcional
- destacada

**Descripción:**
"Deduce información no explícita basándose en pistas"

**Ejemplo de respuesta correcta:**
"El hecho de ganar en dos campos sugiere que Marie tenía conocimientos interdisciplinarios excepcionales."

---

#### 🟠 cat-critico (30 puntos)
**Tipo de inferencia:** Analiza y evalúa críticamente el contenido

**Keywords esperados (9):**
- evaluar
- analizar
- considerar
- perspectiva
- contexto
- significa
- barreras
- historico
- estructural

**Descripción:**
"Analiza y evalúa críticamente el contenido"

**Ejemplo de respuesta correcta:**
"Ganar dos Nobeles en una época de discriminación demuestra que Marie superó barreras estructurales significativas."

---

#### 🟣 cat-creativo (25 puntos)
**Tipo de inferencia:** Genera ideas originales relacionadas con el texto

**Keywords esperados (10):**
- imaginar
- si
- podría
- nuevo
- relacionar
- aplicar
- innovar
- futuro
- actual
- inspirar

**Descripción:**
"Genera ideas originales relacionadas con el texto"

**Ejemplo de respuesta correcta:**
"Si Marie hubiera tenido acceso a tecnología moderna, podría haber descubierto aplicaciones médicas de la radiactividad décadas antes."

---

## Flujo de Validación (Backend)

```
1. Frontend envía:
   {
     fragmentId: "frag-1",
     categoryId: "cat-inferencial",
     userAnswer: "Marie tuvo conocimientos excepcionales en física y química porque ganó en dos campos"
   }

2. Backend busca en solution:
   solution
     ->fragments[0] (donde id === "frag-1")
     ->categoryExpectations
     ->cat-inferencial
     ->keywords

3. Backend valida:
   - minLength: 20 ✓ (respuesta tiene 94 caracteres)
   - maxLength: 200 ✓ (respuesta tiene 94 caracteres)
   - minKeywords: 2 ✓ (encontró: "conocimientos", "excepcionales", "campos")

4. Backend calcula score:
   - Keywords encontrados: 3 de 9
   - Ratio: 3/9 = 0.33
   - Score: 25 pts × 0.33 = 8 pts

5. Backend genera feedback:
   {
     fragmentId: "frag-1",
     categoryUsed: "cat-inferencial",
     keywordsFound: ["conocimientos", "excepcionales", "campos"],
     keywordsExpected: ["impacto", "importancia", ...],
     score: 8,
     maxScore: 25,
     feedback: "Bien, pero podrías mejorar. Deduce información no explícita..."
   }
```

---

## Distribución de Puntos

### Por Categoría

| Categoría | Puntos | % del fragmento |
|-----------|--------|-----------------|
| cat-literal | 20 | 20% |
| cat-inferencial | 25 | 25% |
| cat-critico | 30 | 30% |
| cat-creativo | 25 | 25% |
| **TOTAL** | **100** | **100%** |

### Por Ejercicio Completo

| Elemento | Fragmentos | Pts/Fragmento | Total |
|----------|------------|---------------|-------|
| Fragment 1 | 1 | 100 | 100 |
| Fragment 2 | 1 | 100 | 100 |
| Fragment 3 | 1 | 100 | 100 |
| **TOTAL EJERCICIO** | **3** | **100** | **300** |

**Nota:** El `max_points` del ejercicio es 100 (no 300), por lo que el sistema de scoring debe normalizar o solo evaluar 1 fragmento por intento.

---

## Matriz de Validación

### Criterios de Calificación

```
Puntuación por Keywords encontrados:

Ratio       | Score         | Feedback
------------|---------------|----------
≥ 80%       | Full points   | "¡Excelente!"
50-79%      | Partial       | "Bien, pero podrías mejorar..."
< 50%       | Low           | "Intenta nuevamente..."
```

### Ejemplo de Calificación

**Respuesta del estudiante:** "Marie tuvo conocimientos excepcionales"

**Categoría:** cat-inferencial

**Keywords esperados (9):**
impacto, importancia, consecuencia, implica, deducir, sugiere, interdisciplinario, excepcional, destacada

**Keywords encontrados (1):**
excepcional

**Cálculo:**
- Ratio: 1/9 = 0.11 (11%)
- Categoría: < 50% → Low score
- Score: 25 × 0.11 = 2.75 pts (redondeado a 3 pts)
- Feedback: "Intenta nuevamente. Deduce información no explícita basándose en pistas. Ejemplo: El hecho de ganar en dos campos sugiere que Marie tenía conocimientos interdisciplinarios excepcionales."

---

## JSON Completo (Fragment 1)

```json
{
  "id": "frag-1",
  "text": "Marie Curie fue pionera en el estudio de la radiactividad, convirtiéndose en la primera mujer en ganar un Premio Nobel y la única persona en ganar en dos campos científicos diferentes.",
  "categoryExpectations": {
    "cat-literal": {
      "keywords": ["pionera", "radiactividad", "nobel", "primera", "mujer", "cientifico", "premio", "campos", "unica"],
      "description": "Identifica hechos explícitos del texto",
      "example": "Marie fue la primera mujer en ganar un Nobel y ganó en dos campos científicos diferentes.",
      "points": 20
    },
    "cat-inferencial": {
      "keywords": ["impacto", "importancia", "consecuencia", "implica", "deducir", "sugiere", "interdisciplinario", "excepcional", "destacada"],
      "description": "Deduce información no explícita basándose en pistas",
      "example": "El hecho de ganar en dos campos sugiere que Marie tenía conocimientos interdisciplinarios excepcionales.",
      "points": 25
    },
    "cat-critico": {
      "keywords": ["evaluar", "analizar", "considerar", "perspectiva", "contexto", "significa", "barreras", "historico", "estructural"],
      "description": "Analiza y evalúa críticamente el contenido",
      "example": "Ganar dos Nobeles en una época de discriminación demuestra que Marie superó barreras estructurales significativas.",
      "points": 30
    },
    "cat-creativo": {
      "keywords": ["imaginar", "si", "podría", "nuevo", "relacionar", "aplicar", "innovar", "futuro", "actual", "inspirar"],
      "description": "Genera ideas originales relacionadas con el texto",
      "example": "Si Marie hubiera tenido acceso a tecnología moderna, podría haber descubierto aplicaciones médicas de la radiactividad décadas antes.",
      "points": 25
    }
  }
}
```

---

**Generado por:** Database-Agent
**Fecha:** 2025-11-23 22:29:00
**Versión:** 1.0
