---
titulo: Guía de Pruebas Módulo 1 Comprensión Literal
tipo: guia
dominio: testing
ultima_actualizacion: 2026-02-27
---

# GUÍA DE PRUEBAS - MÓDULO 1: COMPRENSIÓN LITERAL
## Ejemplos de Respuestas para Testing QA

**Fecha:** 2025-11-23
**Versión:** 1.0
**Módulo:** MOD-01-LITERAL - Comprensión Literal
**Autor:** Architecture-Analyst
**Fuente:** `apps/database/seeds/prod/educational_content/02-exercises-module1.sql`

---

## 📋 ÍNDICE

1. [Ejercicio 1.1: Crucigrama Científico](#ejercicio-11-crucigrama-científico)
2. [Ejercicio 1.2: Línea de Tiempo](#ejercicio-12-línea-de-tiempo)
3. [Ejercicio 1.3: Completar Espacios en Blanco](#ejercicio-13-completar-espacios-en-blanco)
4. [Ejercicio 1.4: Verdadero o Falso](#ejercicio-14-verdadero-o-falso)
5. [Ejercicio 1.5: Sopa de Letras (BONUS)](#ejercicio-15-sopa-de-letras-bonus)
6. [Casos de Uso](#casos-de-uso)

---

## 🎯 PROPÓSITO DE ESTA GUÍA

Esta guía proporciona **ejemplos detallados de respuestas** para cada ejercicio del Módulo 1, clasificadas en tres niveles de calidad:

- **✅ EXCELENTE (80-100 puntos):** Respuestas completas, precisas y que demuestran comprensión profunda
- **⚠️ ACEPTABLE (50-79 puntos):** Respuestas parcialmente correctas con algunos errores menores
- **❌ INCORRECTA (0-49 puntos):** Respuestas con errores significativos o información incorrecta

**Audiencia:** QA testers, desarrolladores frontend/backend, diseñadores pedagógicos, demos

---

## EJERCICIO 1.1: CRUCIGRAMA CIENTÍFICO

**Tipo:** `crucigrama`
**Dificultad:** Beginner
**Tiempo estimado:** 15 minutos
**Puntos máximos:** 100
**Puntos de aprobación:** 70

### 📊 Configuración del Ejercicio

```json
{
  "gridSize": {"rows": 15, "cols": 15},
  "autoCheck": true,
  "showProgress": true,
  "caseSensitive": false,
  "allowSpaces": false
}
```

### 🎯 Claves del Crucigrama

#### Pistas Horizontales

| # | Pista | Respuesta | Longitud | Inicio |
|---|-------|-----------|----------|--------|
| 1 | Universidad donde estudió | SORBONA | 7 | (4,3) |
| 2 | Premio recibido en 1903 y 1911 | NOBEL | 5 | (6,3) |
| 3 | Fenómeno de emisión espontánea de radiación | RADIOACTIVIDAD | 14 | (8,1) |

#### Pistas Verticales

| # | Pista | Respuesta | Longitud | Inicio |
|---|-------|-----------|----------|--------|
| 4 | Elemento químico nombrado en honor a Polonia | POLONIO | 7 | (3,4) |
| 5 | Elemento químico radiactivo descubierto | RADIO | 5 | (8,1) |
| 6 | Apellido de Marie | CURIE | 5 | (8,7) |

### ✅ RESPUESTA EXCELENTE (95-100 puntos)

**Crucigrama completado correctamente:**
- ✓ Todas las palabras correctas
- ✓ Ortografía perfecta (sin acentos, mayúsculas)
- ✓ Todas las intersecciones coinciden
- ✓ Completado en tiempo razonable (< 15 minutos)

**Ejemplo de respuesta:**
```
Horizontal 1: SORBONA
Horizontal 2: NOBEL
Horizontal 3: RADIOACTIVIDAD
Vertical 4: POLONIO
Vertical 5: RADIO
Vertical 6: CURIE
```

**Scoring:**
- 6/6 palabras correctas = 100 puntos
- Sin uso de comodines = +0 bonificación
- Tiempo < 10 min = +0 bonificación (no implementado)

**Feedback del sistema:**
> "¡Excelente! Has completado el crucigrama correctamente. Demuestra comprensión sólida del vocabulario científico relacionado con Marie Curie. ✓ 100/100 puntos."

---

### ⚠️ RESPUESTA ACEPTABLE (65-79 puntos)

**Crucigrama con 1-2 errores menores:**
- ✓ 4-5 palabras correctas
- ✗ 1-2 palabras incorrectas o faltantes
- ⚠️ Puede haber usado 1 comodín

**Ejemplo de respuesta parcial:**
```
Horizontal 1: SORBONA ✓
Horizontal 2: NOVEL ✗ (error de ortografía)
Horizontal 3: RADIOACTIVIDAD ✓
Vertical 4: POLONIO ✓
Vertical 5: RADIO ✓
Vertical 6: (vacío) ✗
```

**Errores comunes:**
- "NOVEL" en lugar de "NOBEL" (error de ortografía)
- "POLONIA" en lugar de "POLONIO" (confusión entre país y elemento)
- Dejar espacios en blanco por no usar el texto de referencia
- Escribir con acentos: "RADIACIÓN" en lugar de "RADIACION"

**Scoring:**
- 4/6 palabras correctas = 67 puntos
- Uso de 1 comodín "Pista" (-15 ML Coins)
- Penalización por errores de ortografía: -10 puntos

**Feedback del sistema:**
> "Buen intento. Algunas respuestas necesitan corrección. Revisa la ortografía del Premio que Marie ganó dos veces. ⚠️ 67/100 puntos."

---

### ❌ RESPUESTA INCORRECTA (0-49 puntos)

**Crucigrama con múltiples errores:**
- ✗ 0-3 palabras correctas
- ✗ Múltiples errores de ortografía
- ✗ Palabras que no coinciden con las pistas
- ⚠️ Puede haber intentado adivinar sin consultar texto

**Ejemplo de respuesta con errores:**
```
Horizontal 1: PARIS ✗ (confusión: estudió en París, pero universidad era Sorbona)
Horizontal 2: PREMIOS ✗ (demasiadas letras, no coincide)
Horizontal 3: RADIACION ✗ (5 letras faltantes)
Vertical 4: POLONIA ✗ (país, no elemento químico)
Vertical 5: (vacío) ✗
Vertical 6: MARIE ✗ (nombre, no apellido)
```

**Errores críticos:**
- Confusión entre datos relacionados (París vs. Sorbona, Polonia vs. Polonio)
- No verificar longitud de palabras (PREMIOS tiene 7 letras, necesita 5)
- No usar intersecciones para validar (si "MARIE" cruza con "NOBEL", la "I" no coincide)
- Dejar múltiples espacios vacíos

**Scoring:**
- 0/6 palabras correctas = 0 puntos
- Uso de 2 comodines "Pista" (-30 ML Coins)
- Múltiples intentos fallidos: -0 puntos (primeros 3 intentos sin penalización)

**Feedback del sistema:**
> "Necesitas revisar el texto base más cuidadosamente. Recuerda: todas las respuestas están explícitamente mencionadas en la biografía de Marie Curie. Intenta usar las pistas disponibles. ❌ 0/100 puntos. Te quedan 2 intentos."

---

### 🔑 Keywords para Validación Automática

El validador backend verifica:
- Exactitud de cada palabra (case-insensitive)
- Longitud correcta
- Posición en grid correcta
- Intersecciones válidas (letras coincidentes)

```javascript
// Ejemplo de validación
const correctAnswers = {
  "h1": "SORBONA",
  "h2": "NOBEL",
  "h3": "RADIOACTIVIDAD",
  "v1": "POLONIO",
  "v2": "RADIO",
  "v3": "CURIE"
};
```

---

## EJERCICIO 1.2: LÍNEA DE TIEMPO

**Tipo:** `linea_tiempo`
**Dificultad:** Beginner
**Tiempo estimado:** 12 minutos
**Puntos máximos:** 100
**Puntos de aprobación:** 70

### 📊 Configuración del Ejercicio

```json
{
  "allowReordering": true,
  "showYears": true,
  "visualStyle": "horizontal",
  "dragAndDrop": true,
  "showFeedback": "immediate"
}
```

### 🎯 Eventos a Ordenar

| ID | Año | Evento | Categoría |
|----|-----|--------|-----------|
| event-1 | 1867 | Nace Maria Sklodowska en Varsovia, Polonia | Personal |
| event-2 | 1891 | Se traslada a París para estudiar en la Sorbona | Educación |
| event-3 | 1895 | Se casa con Pierre Curie | Personal |
| event-4 | 1898 | Descubre el polonio y el radio | Descubrimiento |
| event-5 | 1903 | Recibe su primer Premio Nobel de Física | Reconocimiento |
| event-6 | 1911 | Recibe su segundo Premio Nobel, en Química | Reconocimiento |
| event-7 | 1934 | Fallece debido a anemia aplásica | Personal |

### ✅ RESPUESTA EXCELENTE (100 puntos)

**Orden cronológico perfecto:**

```
[event-1] → [event-2] → [event-3] → [event-4] → [event-5] → [event-6] → [event-7]
  1867        1891        1895        1898        1903        1911        1934

Nacimiento → París → Matrimonio → Descubrimientos → Nobel Física → Nobel Química → Fallece
```

**Justificación del orden:**
1. **1867:** Nacimiento (punto de inicio lógico)
2. **1891:** Traslado a París (24 años - juventud)
3. **1895:** Matrimonio con Pierre (28 años - vida personal)
4. **1898:** Descubrimientos del polonio y radio (3 años después del matrimonio)
5. **1903:** Primer Nobel de Física (por descubrimientos de 1898)
6. **1911:** Segundo Nobel de Química (8 años después del primero, 5 años después de muerte de Pierre)
7. **1934:** Fallecimiento (67 años - fin de vida)

**Scoring:**
- 7/7 eventos en orden correcto = 100 puntos
- Primer intento = +0 bonificación
- Sin uso de comodines = +0 bonificación

**Feedback del sistema:**
> "¡Perfecto! Has ordenado todos los eventos cronológicamente. Demuestras excelente comprensión de la secuencia temporal de la vida de Marie Curie. ✓ 100/100 puntos."

---

### ⚠️ RESPUESTA ACEPTABLE (65-79 puntos)

**Orden con 1-2 inversiones menores:**

```
[event-1] → [event-2] → [event-4] → [event-3] → [event-5] → [event-6] → [event-7]
  1867        1891        1898        1895        1903        1911        1934
                          ↑____________↑
                          (inversión: 1895 y 1898 intercambiados)
```

**Errores comunes:**
- **Inversión 1895 ↔ 1898:** Confundir matrimonio (1895) con descubrimientos (1898)
- **Inversión 1903 ↔ 1911:** Confundir orden de los dos premios Nobel
- No recordar que el matrimonio (1895) precedió los descubrimientos (1898)

**Justificación parcialmente correcta:**
- Inicio y fin correctos (nacimiento 1867, muerte 1934)
- Mayoría de eventos en posición correcta
- Solo 1-2 eventos adyacentes intercambiados

**Scoring:**
- 5/7 eventos correctos = 71 puntos
- Segundo intento (tras feedback) = -0 penalización (primeros 3 intentos sin penalización)
- Uso de 1 pista (-15 ML Coins)

**Feedback del sistema (tras primer intento):**
> "Casi perfecto. Los descubrimientos del polonio y radio ocurrieron DESPUÉS del matrimonio con Pierre. El matrimonio fue en 1895, los descubrimientos en 1898. ⚠️ 71/100 puntos. Intenta de nuevo."

---

### ❌ RESPUESTA INCORRECTA (0-49 puntos)

**Orden con múltiples errores:**

```
[event-7] → [event-1] → [event-5] → [event-2] → [event-6] → [event-3] → [event-4]
  1934        1867        1903        1891        1911        1895        1898
  ↑ (error crítico: muerte primero)
```

**Errores críticos:**
- **Muerte al principio:** Ordenar fallecimiento (1934) antes del nacimiento (1867)
- **Premios Nobel antes de estudios:** Ganar Nobel antes de estudiar en París
- **Descubrimientos antes de formación:** Descubrir elementos antes de educación formal
- **Orden aleatorio:** No seguir ninguna lógica temporal

**Problemas de comprensión:**
- No entender la cronología básica de una biografía (nacimiento → formación → logros → muerte)
- Ignorar las fechas explícitas en las tarjetas
- No usar el contexto lógico (estudios antes de descubrimientos, descubrimientos antes de premios)

**Scoring:**
- 1/7 eventos correctos = 14 puntos
- Tercer intento fallido = fin del ejercicio
- Múltiples comodines usados (-45 ML Coins total)

**Feedback del sistema:**
> "El orden cronológico no es correcto. Recuerda: la historia de una persona sigue una secuencia lógica: nacimiento → estudios → trabajo → logros → muerte. Usa las fechas como guía. ❌ 14/100 puntos. Te queda 1 intento."

**Sugerencia pedagógica:**
> "Tip: Ordena primero los eventos extremos (nacimiento 1867 y muerte 1934), luego completa el medio."

---

### 🔑 Keywords para Validación Automática

```javascript
const correctOrder = ["event-1", "event-2", "event-3", "event-4", "event-5", "event-6", "event-7"];
const yearSequence = [1867, 1891, 1895, 1898, 1903, 1911, 1934];

// Validación
function validateTimeline(userOrder) {
  let correctCount = 0;
  for (let i = 0; i < userOrder.length; i++) {
    if (userOrder[i] === correctOrder[i]) {
      correctCount++;
    }
  }
  return (correctCount / correctOrder.length) * 100;
}
```

---

## EJERCICIO 1.3: COMPLETAR ESPACIOS EN BLANCO

**Tipo:** `completar_espacios`
**Dificultad:** Beginner
**Tiempo estimado:** 10 minutos
**Puntos máximos:** 100
**Puntos de aprobación:** 60

### 📊 Configuración del Ejercicio

```json
{
  "blankCount": 6,
  "allowMultipleAttempts": true,
  "showWordBank": true,
  "caseSensitive": false
}
```

### 🎯 Texto con Espacios en Blanco

**Texto completo:**
> "Marie Sklodowska nació en **___①___, Polonia**. Su padre **___②___** era profesor de matemáticas y física, mientras que su madre **___③___** dirigía una escuela prestigiosa. La familia valoraba mucho la **___④___** y Marie mostró desde pequeña gran curiosidad por las **___⑤___** y **___⑥___**."

**Banco de palabras:**
`Varsovia`, `Władysław`, `Bronisława`, `educación`, `ciencias`, `Polonia`, `matemáticas`, `física`

### ✅ RESPUESTA EXCELENTE (100 puntos)

**Todos los espacios completados correctamente:**

1. **Varsovia** ✓ (ciudad natal)
2. **Władysław** ✓ (nombre del padre)
3. **Bronisława** ✓ (nombre de la madre)
4. **educación** ✓ (valor familiar)
5. **ciencias** / **matemáticas** / **física** ✓ (cualquiera de las 3 válida)
6. **ciencias** / **matemáticas** / **física** ✓ (cualquiera de las 3 válida, DIFERENTE a espacio 5)

**🔄 ACTUALIZACIÓN 2025-11-23:** Los espacios 5 y 6 ahora aceptan **cualquiera de las 3 opciones** (ciencias, matemáticas, física) con la **restricción de que NO pueden ser la misma palabra**. Esta corrección refleja la simetría lógica del ejercicio.

**Combinaciones válidas para espacios 5 y 6 (6 combinaciones):**

| Espacio 5 | Espacio 6 | Validez | Ejemplo completo |
|-----------|-----------|---------|------------------|
| ciencias | matemáticas | ✅ VÁLIDO | "...curiosidad por las **ciencias** y **matemáticas**." |
| ciencias | física | ✅ VÁLIDO | "...curiosidad por las **ciencias** y **física**." |
| matemáticas | ciencias | ✅ VÁLIDO | "...curiosidad por las **matemáticas** y **ciencias**." |
| matemáticas | física | ✅ VÁLIDO | "...curiosidad por las **matemáticas** y **física**." |
| física | ciencias | ✅ VÁLIDO | "...curiosidad por las **física** y **ciencias**." |
| física | matemáticas | ✅ VÁLIDO | "...curiosidad por las **física** y **matemáticas**." |

**Combinaciones inválidas (redundancias - 3 combinaciones):**

| Espacio 5 | Espacio 6 | Validez | Razón |
|-----------|-----------|---------|-------|
| ciencias | ciencias | ❌ INVÁLIDO | Redundancia - no puede repetirse |
| matemáticas | matemáticas | ❌ INVÁLIDO | Redundancia - no puede repetirse |
| física | física | ❌ INVÁLIDO | Redundancia - no puede repetirse |

**Justificación:**
- Espacio ①: Contexto "nació en ___, Polonia" → ciudad polaca = **Varsovia**
- Espacio ②: "su padre ___" → nombre propio masculino polaco = **Władysław**
- Espacio ③: "su madre ___" → nombre propio femenino polaco = **Bronisława**
- Espacio ④: "valoraba la ___" → concepto abstracto = **educación**
- Espacio ⑤: "curiosidad por las ___" → **CUALQUIERA** de: ciencias, matemáticas, física
- Espacio ⑥: "curiosidad por las ___" → **CUALQUIERA** de: ciencias, matemáticas, física (DIFERENTE a espacio 5)

**Justificación pedagógica de la simetría:**
- Marie Curie estudió **matemáticas Y física** en la Sorbona ✓
- Su padre le enseñaba **matemáticas Y física** ✓
- Mostró curiosidad por las **ciencias** (término general que incluye ambas) ✓
- Todas las opciones están **históricamente documentadas** ✓
- Lógicamente, cualquier par de estas palabras es correcto siempre que NO se repitan

**Scoring:**
- 6/6 espacios correctos con cualquier combinación válida = 100 puntos
- Sin uso de comodines = +0 bonificación
- Primer intento = +0 bonificación

**Feedback del sistema:**
> "¡Excelente! Has completado todos los espacios correctamente. Demuestras comprensión precisa de los datos biográficos de Marie Curie. ✓ 100/100 puntos."

---

### ⚠️ RESPUESTA ACEPTABLE (55-75 puntos)

**4-5 espacios correctos, 1-2 errores:**

1. **Varsovia** ✓
2. **Władysław** ✓
3. **Bronisława** ✓
4. **Polonia** ✗ (error: usó país en lugar de concepto abstracto)
5. **ciencias** ✓
6. **física** ✓

**Texto resultante con error:**
> "Marie Sklodowska nació en **Varsovia, Polonia**. Su padre **Władysław** era profesor de matemáticas y física, mientras que su madre **Bronisława** dirigía una escuela prestigiosa. La familia valoraba mucho la **Polonia** y Marie mostró desde pequeña gran curiosidad por las **ciencias** y **física**."
>
> ⚠️ Error semántico: "valoraba mucho la Polonia" no tiene sentido lógico

**Errores comunes:**
- **Espacio ④:** Confundir "educación" con "Polonia" (no considerar contexto semántico)
- **Espacio ⑥:** Dejar vacío si ya usó "matemáticas" antes
- **Espacios ②/③:** Confundir nombres del padre y madre (intercambiarlos)

**Scoring:**
- 5/6 espacios correctos = 83 puntos
- 1 error semántico = -10 puntos
- Total: 73 puntos

**Feedback del sistema:**
> "Muy bien, pero hay un error. 'La familia valoraba mucho la Polonia' no es coherente. Piensa en un valor abstracto relacionado con aprendizaje. ⚠️ 73/100 puntos."

---

### ❌ RESPUESTA INCORRECTA (0-49 puntos)

#### Escenario 1: Múltiples errores gramaticales

**0-3 espacios correctos, múltiples errores:**

1. **Polonia** ✗ (ya está en el texto "Varsovia, Polonia")
2. **ciencias** ✗ (nombre propio esperado, no concepto)
3. **física** ✗ (nombre propio femenino esperado)
4. **Varsovia** ✗ (ciudad, no concepto abstracto)
5. **educación** ✗ (concepto abstracto, no campo académico)
6. **(vacío)** ✗ (no completado)

**Texto resultante con múltiples errores:**
> "Marie Sklodowska nació en **Polonia, Polonia**. Su padre **ciencias** era profesor de matemáticas y física, mientras que su madre **física** dirigía una escuela prestigiosa. La familia valoraba mucho la **Varsovia** y Marie mostró desde pequeña gran curiosidad por las **educación** y **___**."
>
> ❌ Múltiples errores gramaticales y semánticos

**Problemas críticos:**
- No considerar contexto gramatical ("su padre ciencias" es incoherente)
- Repetir palabras ya en el texto ("Polonia, Polonia")
- Ignorar género de nombres propios (padre = masculino, madre = femenino)
- No completar todos los espacios

**Scoring:**
- 0/6 espacios correctos = 0 puntos
- Múltiples errores de coherencia = penalización aplicada
- Segundo intento disponible

**Feedback del sistema:**
> "Necesitas revisar el contexto de cada espacio. Observa las pistas gramaticales: 'su padre ___' espera un nombre propio masculino, 'su madre ___' espera un nombre femenino. ❌ 0/100 puntos. Te quedan 2 intentos."

---

#### Escenario 2: Error de redundancia en espacios 5 y 6 (NUEVO 2025-11-23)

**5/6 espacios correctos, pero redundancia:**

1. **Varsovia** ✓
2. **Władysław** ✓
3. **Bronisława** ✓
4. **educación** ✓
5. **matemáticas** ✓
6. **matemáticas** ✗ (REDUNDANCIA - no puede repetir espacio 5)

**Texto resultante con redundancia:**
> "Marie Sklodowska nació en **Varsovia, Polonia**. Su padre **Władysław** era profesor de matemáticas y física, mientras que su madre **Bronisława** dirigía una escuela prestigiosa. La familia valoraba mucho la **educación** y Marie mostró desde pequeña gran curiosidad por las **matemáticas** y **matemáticas**."
>
> ❌ Error de redundancia en espacios 5 y 6

**Problema identificado:**
- Espacios 5 y 6 tienen la **misma palabra** ("matemáticas")
- El sistema rechaza redundancias: espacio 5 ≠ espacio 6
- Aunque "matemáticas" es válida para ambos espacios, NO pueden usarse simultáneamente

**Scoring:**
- 5/6 espacios correctos base = 83 puntos
- Penalización por redundancia = -50 puntos
- **Score final:** 33 puntos (REPROBADO)

**Feedback del sistema:**
> "Casi perfecto, pero hay un error: los espacios 5 y 6 no pueden tener la misma palabra. Has puesto 'matemáticas' en ambos. Elige dos palabras DIFERENTES del grupo: ciencias, matemáticas, física. ❌ 33/100 puntos. Te quedan 2 intentos."

**Correcciones válidas:**
- Cambiar espacio 6 a "física" → "matemáticas + física" ✅
- Cambiar espacio 6 a "ciencias" → "matemáticas + ciencias" ✅
- Cambiar espacio 5 a "física" → "física + matemáticas" ✅
- Cambiar espacio 5 a "ciencias" → "ciencias + matemáticas" ✅

---

#### Escenario 3: Otras redundancias posibles

**Casos de redundancia también inválidos:**

| Caso | Espacio 5 | Espacio 6 | Score | Feedback |
|------|-----------|-----------|-------|----------|
| A | ciencias | ciencias | 33 pts | "Los espacios 5 y 6 no pueden ser 'ciencias + ciencias'" |
| B | física | física | 33 pts | "Los espacios 5 y 6 no pueden ser 'física + física'" |
| C | matemáticas | matemáticas | 33 pts | "Los espacios 5 y 6 no pueden ser 'matemáticas + matemáticas'" |

**Sugerencia pedagógica:**
> "Tip: Clasifica las 8 palabras del banco antes de empezar:\n- Nombres propios masculinos: Władysław\n- Nombres propios femeninos: Bronisława\n- Lugares: Varsovia, Polonia\n- Conceptos: educación, ciencias, matemáticas, física\n\n**IMPORTANTE:** Para espacios 5 y 6, elige DOS palabras DIFERENTES de: ciencias, matemáticas, física."

---

### 🔑 Keywords para Validación Automática

**ACTUALIZADO 2025-11-23:** Espacios 5 y 6 con simetría completa

```javascript
const correctAnswers = {
  "1": "Varsovia",
  "2": "Władysław",
  "3": "Bronisława",
  "4": "educación",
  "5": "ciencias",        // Respuesta principal
  "6": "matemáticas"      // Respuesta principal
};

const alternatives = {
  "5": ["ciencias", "matemáticas", "física"],  // Espacio 5 acepta cualquiera de las 3
  "6": ["ciencias", "matemáticas", "física"]   // Espacio 6 acepta cualquiera de las 3
};

// Validación adicional requerida en backend
function validateCompletarEspacios(userAnswers) {
  // Validación básica de cada espacio
  const validationResults = {};

  for (let id in correctAnswers) {
    const userAnswer = userAnswers[id]?.toLowerCase().trim();
    const correctAnswer = correctAnswers[id].toLowerCase();
    const alternativesList = alternatives[id] || [];

    // Verificar si la respuesta es correcta o está en alternativas
    const isCorrect = userAnswer === correctAnswer ||
                      alternativesList.some(alt => alt.toLowerCase() === userAnswer);

    validationResults[id] = isCorrect;
  }

  // Validación especial: espacio 5 ≠ espacio 6 (NO redundancia)
  if (userAnswers["5"] && userAnswers["6"]) {
    const space5 = userAnswers["5"].toLowerCase().trim();
    const space6 = userAnswers["6"].toLowerCase().trim();

    if (space5 === space6) {
      return {
        valid: false,
        score: 33,  // Penalización por redundancia
        error: {
          type: "redundancia",
          message: `Los espacios 5 y 6 no pueden tener la misma palabra. Has puesto '${space5}' en ambos. Elige dos palabras DIFERENTES del grupo: ciencias, matemáticas, física.`,
          espacios: ["5", "6"]
        }
      };
    }
  }

  // Calcular score sin redundancia
  const correctCount = Object.values(validationResults).filter(v => v).length;
  const score = (correctCount / 6) * 100;

  return {
    valid: score >= 60,  // Passing score
    score: score,
    correctCount: correctCount,
    totalCount: 6,
    validationResults: validationResults
  };
}

// Casos de prueba obligatorios (11 casos)
const testCases = {
  // Casos válidos (6 combinaciones)
  valid: [
    { "5": "ciencias", "6": "matemáticas", expectedScore: 100 },
    { "5": "ciencias", "6": "física", expectedScore: 100 },
    { "5": "matemáticas", "6": "ciencias", expectedScore: 100 },
    { "5": "matemáticas", "6": "física", expectedScore: 100 },
    { "5": "física", "6": "ciencias", expectedScore: 100 },
    { "5": "física", "6": "matemáticas", expectedScore: 100 }
  ],
  // Casos inválidos (5 casos)
  invalid: [
    { "5": "ciencias", "6": "ciencias", expectedScore: 33, error: "redundancia" },
    { "5": "matemáticas", "6": "matemáticas", expectedScore: 33, error: "redundancia" },
    { "5": "física", "6": "física", expectedScore: 33, error: "redundancia" },
    { "5": "educación", "6": "matemáticas", expectedScore: 83, error: "espacio_5_incorrecto" },
    { "5": "física", "6": "Polonia", expectedScore: 83, error: "espacio_6_incorrecto" }
  ]
};
```

**Ejemplo de uso en frontend:**

```typescript
// Componente: CompletarEspaciosExercise.tsx
const handleSubmit = (userAnswers: Record<string, string>) => {
  const validation = validateCompletarEspacios(userAnswers);

  if (!validation.valid) {
    if (validation.error?.type === "redundancia") {
      // Mostrar mensaje específico de redundancia
      showError(validation.error.message);
    } else {
      // Mostrar mensaje genérico de respuestas incorrectas
      showError(`${validation.correctCount}/6 espacios correctos. Revisa tus respuestas.`);
    }
  } else {
    showSuccess(`¡Excelente! ${validation.score}/100 puntos.`);
  }
};
```

---

## EJERCICIO 1.4: VERDADERO O FALSO

**Tipo:** `verdadero_falso`
**Dificultad:** Beginner
**Tiempo estimado:** 12 minutos
**Puntos máximos:** 100
**Puntos de aprobación:** 70

### 📊 Configuración del Ejercicio

```json
{
  "statementCount": 10,
  "randomizeOrder": false,
  "showExplanations": true
}
```

### 🎯 Contexto Histórico

> "Durante su infancia en Polonia, Marie era conocida por su insaciable curiosidad científica. Su padre le enseñó los primeros principios de las matemáticas y la física, mientras su madre la inspiró con su dedicación a la educación."

### 📝 Afirmaciones a Evaluar

| ID | Afirmación | Respuesta | Explicación |
|----|------------|-----------|-------------|
| 1 | Marie mostró curiosidad excepcional por las ciencias desde muy pequeña | ✅ VERDADERO | Explícitamente mencionado en el contexto |
| 2 | Su padre era profesor de química solamente | ❌ FALSO | Era profesor de matemáticas Y física |
| 3 | Marie nació en Francia | ❌ FALSO | Nació en Polonia (Varsovia) |
| 4 | Su familia valoraba mucho la educación | ✅ VERDADERO | Explícitamente mencionado |
| 5 | La madre de Marie dirigía una escuela | ✅ VERDADERO | Mencionado: "dirigía una escuela prestigiosa" |
| 6 | Marie Curie ganó su primer Nobel a los 20 años | ❌ FALSO | Lo ganó en 1903 (~36 años) |
| 7 | El nombre original de Marie era Maria Sklodowska | ✅ VERDADERO | Nombre de nacimiento confirmado |
| 8 | Marie fue la primera mujer en ganar un Premio Nobel | ✅ VERDADERO | Hecho histórico verificable |
| 9 | Su padre no apoyaba su interés en las ciencias | ❌ FALSO | Le enseñó matemáticas y física |
| 10 | Marie estudió en la Universidad de Varsovia | ❌ FALSO | Estudió en la Sorbona de París |

### ✅ RESPUESTA EXCELENTE (100 puntos)

**10/10 afirmaciones correctas:**

```javascript
{
  "1": true,   // ✓ Curiosidad científica (explícito en contexto)
  "2": false,  // ✓ No solo química, también matemáticas y física
  "3": false,  // ✓ Nació en Polonia, no Francia
  "4": true,   // ✓ Familia valoraba educación (explícito)
  "5": true,   // ✓ Madre dirigía escuela (explícito)
  "6": false,  // ✓ Nobel en 1903 (36 años), no 20
  "7": true,   // ✓ Maria Sklodowska es su nombre de nacimiento
  "8": true,   // ✓ Primera mujer con Nobel (hecho histórico)
  "9": false,  // ✓ Padre SÍ apoyaba (le enseñó ciencias)
  "10": false  // ✓ Estudió en Sorbona (París), no Varsovia
}
```

**Justificación por afirmación:**

**Afirmación 1 (VERDADERO):**
- Evidencia textual: "Marie era conocida por su insaciable curiosidad científica"
- Confirmación: Uso de "insaciable" indica excepcionalidad

**Afirmación 2 (FALSO):**
- Evidencia textual: "Su padre le enseñó los primeros principios de las matemáticas y la física"
- Error en la afirmación: Dice "solamente química", pero texto menciona matemáticas Y física
- Palabra clave a detectar: "solamente" (palabra absoluta que requiere verificación estricta)

**Afirmación 3 (FALSO):**
- Conocimiento previo del Módulo 1: Marie nació en Varsovia, Polonia
- Contradicción directa con hechos biográficos conocidos

**Afirmación 4 (VERDADERO):**
- Evidencia textual: "La familia valoraba mucho la educación"
- Confirmación directa en el contexto proporcionado

**Afirmación 5 (VERDADERO):**
- Evidencia textual: "su madre la inspiró con su dedicación a la educación"
- Conocimiento del ejercicio 1.3: "su madre Bronisława dirigía una escuela prestigiosa"

**Afirmación 6 (FALSO):**
- Cálculo: Marie nació en 1867, ganó primer Nobel en 1903 → 1903-1867 = 36 años
- Error en la afirmación: Dice 20 años, realidad es 36 años

**Afirmación 7 (VERDADERO):**
- Conocimiento biográfico: Maria Sklodowska fue su nombre de nacimiento polaco
- Cambió a "Marie Curie" tras casarse con Pierre Curie

**Afirmación 8 (VERDADERO):**
- Hecho histórico verificable: Marie fue la primera mujer en ganar Premio Nobel (1903, Física)

**Afirmación 9 (FALSO):**
- Evidencia textual: "Su padre le enseñó los primeros principios de las matemáticas y la física"
- Contradice la afirmación: Si le enseñó, claramente SÍ apoyaba su interés

**Afirmación 10 (FALSO):**
- Conocimiento del ejercicio 1.2: Marie se trasladó a París en 1891 para estudiar en la Sorbona
- No estudió en universidad de Varsovia (Polonia no permitía mujeres en universidades en esa época)

**Scoring:**
- 10/10 correctas = 100 puntos
- Sin uso de pistas = +0 bonificación
- Primer intento = +0 bonificación

**Feedback del sistema:**
> "¡Perfecto! Has identificado correctamente todas las afirmaciones verdaderas y falsas. Demuestras excelente comprensión de los hechos biográficos explícitos de Marie Curie. ✓ 100/100 puntos."

---

### ⚠️ RESPUESTA ACEPTABLE (65-79 puntos)

**7-8/10 afirmaciones correctas:**

```javascript
{
  "1": true,   // ✓ Correcto
  "2": true,   // ✗ ERROR: Marcó verdadero cuando es falso
  "3": false,  // ✓ Correcto
  "4": true,   // ✓ Correcto
  "5": true,   // ✓ Correcto
  "6": false,  // ✓ Correcto
  "7": true,   // ✓ Correcto
  "8": true,   // ✓ Correcto
  "9": false,  // ✓ Correcto
  "10": true   // ✗ ERROR: Marcó verdadero cuando es falso
}
```

**Errores comunes:**

**Error en Afirmación 2:**
- **Marcó:** VERDADERO
- **Correcto:** FALSO
- **Causa:** No detectó la palabra "solamente" como palabra absoluta
- **Análisis:** El padre enseñaba matemáticas Y física, no SOLO química

**Error en Afirmación 10:**
- **Marcó:** VERDADERO
- **Correcto:** FALSO
- **Causa:** Confusión entre ciudad de nacimiento (Varsovia) y universidad donde estudió (Sorbona en París)
- **Análisis:** Varsovia fue su ciudad natal, pero estudió en París

**Scoring:**
- 8/10 correctas = 80 puntos
- Uso de 1 pista (-15 ML Coins) = -0 puntos en score
- Total: 80 puntos (pero con -15 ML Coins de economía)

**Feedback del sistema (tras segundo intento):**
> "Muy bien, pero revisa dos afirmaciones. Tip: La afirmación #2 contiene la palabra 'solamente' - verifica si es totalmente precisa. La afirmación #10 sobre Varsovia: ¿fue su universidad o su ciudad natal? ⚠️ 80/100 puntos."

---

### ❌ RESPUESTA INCORRECTA (0-49 puntos)

**0-6/10 afirmaciones correctas:**

```javascript
{
  "1": false,  // ✗ ERROR (debería ser true)
  "2": true,   // ✗ ERROR (debería ser false)
  "3": true,   // ✗ ERROR (debería ser false)
  "4": false,  // ✗ ERROR (debería ser true)
  "5": true,   // ✓ Correcto por casualidad
  "6": true,   // ✗ ERROR (debería ser false)
  "7": false,  // ✗ ERROR (debería ser true)
  "8": false,  // ✗ ERROR (debería ser true)
  "9": true,   // ✗ ERROR (debería ser false)
  "10": true   // ✗ ERROR (debería ser false)
}
```

**Problemas críticos:**

1. **No leyó el contexto:** Marcó afirmaciones contradiciendo explícitamente el texto proporcionado
2. **Adivinó aleatoriamente:** Patrón inconsistente (no hay lógica en las respuestas)
3. **Confusión de datos básicos:**
   - Marcó "nació en Francia" como verdadero (contradice todo el Módulo 1)
   - Marcó "padre no apoyaba" como verdadero (contradice "le enseñó matemáticas y física")
4. **No verificó con conocimiento previo:** Ignoró información de ejercicios anteriores del módulo

**Scoring:**
- 1/10 correctas = 10 puntos
- Tercer intento fallido = fin del ejercicio
- Múltiples pistas usadas (-30 ML Coins)

**Feedback del sistema:**
> "Necesitas leer el contexto histórico más cuidadosamente. Muchas respuestas contradicen información explícita del texto. Ejemplo: El texto dice claramente 'Su padre le enseñó matemáticas y física', entonces la afirmación 'Su padre no apoyaba su interés en las ciencias' es FALSA. ❌ 10/100 puntos. Te queda 1 intento."

**Sugerencia pedagógica:**
> "Estrategia recomendada:\n1. Lee el contexto completo ANTES de responder\n2. Para cada afirmación, busca evidencia textual específica\n3. Cuidado con palabras absolutas: 'solamente', 'nunca', 'siempre'\n4. Usa conocimiento previo del Módulo 1 para verificar hechos históricos"

---

### 🔑 Keywords para Validación Automática

```javascript
const correctAnswers = {
  "1": true,   // Curiosidad científica
  "2": false,  // No solo química
  "3": false,  // No nació en Francia
  "4": true,   // Valoraba educación
  "5": true,   // Madre dirigía escuela
  "6": false,  // No a los 20 años
  "7": true,   // Maria Sklodowska
  "8": true,   // Primera mujer Nobel
  "9": false,  // Padre SÍ apoyaba
  "10": false  // No estudió en Varsovia
};

// Validación estricta: debe coincidir exactamente
function validateTrueFalse(userAnswers) {
  let correctCount = 0;
  for (let id in correctAnswers) {
    if (userAnswers[id] === correctAnswers[id]) {
      correctCount++;
    }
  }
  return (correctCount / 10) * 100;
}
```

---

## EJERCICIO 1.5: SOPA DE LETRAS (BONUS)

**Tipo:** `sopa_letras`
**Dificultad:** Beginner
**Tiempo estimado:** 10 minutos
**Tiempo límite:** 10 minutos
**Puntos máximos:** 100
**Puntos de aprobación:** 70
**Nota:** Este es un ejercicio **BONUS** opcional

### 📊 Configuración del Ejercicio

```json
{
  "gridSize": {"rows": 10, "cols": 10},
  "useStaticGrid": true,
  "directions": ["horizontal", "vertical", "diagonal"],
  "selectionMode": "click-drag",
  "highlightFound": true
}
```

### 🎯 Palabras a Encontrar (10 total)

| # | Palabra | Longitud | Dirección | Inicio | Dificultad |
|---|---------|----------|-----------|--------|------------|
| 1 | MARIE | 5 | Horizontal | (9,4) | Fácil |
| 2 | CURIE | 5 | - | - | Media |
| 3 | POLONIA | 7 | Horizontal-Reverse | (3,8) | Media |
| 4 | NOBEL | 5 | Vertical | (3,0) | Media |
| 5 | RADIO | 5 | - | - | Media |
| 6 | POLONIO | 7 | - | - | Alta |
| 7 | PARIS | 5 | Vertical | (1,1) | Fácil |
| 8 | SORBONA | 7 | - | - | Alta |
| 9 | CIENCIA | 7 | - | - | Media |
| 10 | FÍSICA | 6 | - | - | Media |

### 🗂️ Grid de 10×10

```
   0   1   2   3   4   5   6   7   8   9
0  A   C   I   S   Í   F   K   A   V   S
1  É   P   M   V   V   Ó   I   A   N   Y
2  Í   A   Ü   H   D   C   N   T   M   É
3  N   R   A   I   N   O   L   O   P   É
4  O   I   T   E   B   C   I   T   R   D
5  B   S   I   R   U   N   Ó   N   A   Ó
6  E   C   O   R   O   C   Í   D   D   Í
7  L   S   I   L   X   T   M   Y   I   Ü
8  J   E   O   Í   Í   L   P   O   O   Á
9  N   P   M   A   R   I   E   E   O   V
```

### ✅ RESPUESTA EXCELENTE (100 puntos)

**10/10 palabras encontradas en tiempo:**

```javascript
{
  "MARIE": {row: 9, col: 4, direction: "horizontal", found: true},
  "CURIE": {row: 0, col: 1, direction: "diagonal", found: true},
  "POLONIA": {row: 3, col: 8, direction: "horizontal-reverse", found: true},
  "NOBEL": {row: 3, col: 0, direction: "vertical", found: true},
  "RADIO": {row: 5, col: 3, direction: "vertical", found: true},
  "POLONIO": {row: ?, col: ?, direction: "?", found: true},
  "PARIS": {row: 1, col: 1, direction: "vertical", found: true},
  "SORBONA": {row: ?, col: ?, direction: "?", found: true},
  "CIENCIA": {row: ?, col: ?, direction: "?", found: true},
  "FÍSICA": {row: 0, col: 5, direction: "vertical-reverse", found: true}
}
```

**Estrategia exitosa observada:**
1. **Palabras largas primero:** POLONIA (7), POLONIO (7), SORBONA (7) son más fáciles de ubicar visualmente
2. **Bordes y esquinas:** MARIE (fila 9), NOBEL (columna 0) están en los bordes
3. **Búsqueda sistemática:** Escanear fila por fila o columna por columna
4. **Uso de primera letra:** Buscar "P" para POLONIA, POLONIO, PARIS; "M" para MARIE

**Tiempo transcurrido:** 8 minutos 23 segundos (dentro del límite de 10 min)

**Scoring:**
- 10/10 palabras encontradas = 100 puntos
- Completado dentro del tiempo límite = +0 bonificación
- Sin uso de comodines = +0 bonificación
- Ejercicio BONUS = no afecta calificación obligatoria del módulo

**Feedback del sistema:**
> "¡Excelente! Has encontrado todas las palabras del vocabulario científico de Marie Curie. Ejercicio BONUS completado. ✓ 100/100 puntos + 100 XP adicional."

---

### ⚠️ RESPUESTA ACEPTABLE (65-79 puntos)

**7-8/10 palabras encontradas:**

```javascript
{
  "MARIE": {found: true},   // ✓
  "CURIE": {found: false},  // ✗ No encontrada
  "POLONIA": {found: true}, // ✓
  "NOBEL": {found: true},   // ✓
  "RADIO": {found: true},   // ✓
  "POLONIO": {found: false},// ✗ No encontrada
  "PARIS": {found: true},   // ✓
  "SORBONA": {found: false},// ✗ No encontrada
  "CIENCIA": {found: true}, // ✓
  "FÍSICA": {found: true}   // ✓
}
```

**Palabras no encontradas:**
- **CURIE:** Probablemente en diagonal (más difícil de ver)
- **POLONIO:** Palabra larga (7 letras) que puede estar en dirección compleja
- **SORBONA:** Palabra larga (7 letras) que requiere búsqueda cuidadosa

**Tiempo transcurrido:** 9 minutos 45 segundos (casi agotando tiempo límite)

**Scoring:**
- 7/10 palabras encontradas = 70 puntos
- Completado dentro del tiempo límite (apenas) = +0 bonificación
- Uso de 1 comodín "Pista" (-15 ML Coins) para revelar FISICA

**Feedback del sistema:**
> "Buen trabajo. Encontraste 7 de 10 palabras. Tip: Revisa las diagonales cuidadosamente - algunas palabras como CURIE pueden estar en esa dirección. ⚠️ 70/100 puntos."

---

### ❌ RESPUESTA INCORRECTA (0-49 puntos)

**Escenario 1: Tiempo agotado (0-5 palabras encontradas)**

```javascript
{
  "MARIE": {found: true},   // ✓ (fácil, fila 9)
  "CURIE": {found: false},  // ✗
  "POLONIA": {found: false},// ✗
  "NOBEL": {found: true},   // ✓ (columna 0)
  "RADIO": {found: false},  // ✗
  "POLONIO": {found: false},// ✗
  "PARIS": {found: true},   // ✓ (columna 1)
  "SORBONA": {found: false},// ✗
  "CIENCIA": {found: false},// ✗
  "FÍSICA": {found: false}  // ✗
}
```

**Tiempo transcurrido:** 10 minutos 00 segundos (TIEMPO AGOTADO)

**Problemas observados:**
- **Búsqueda no sistemática:** Buscó aleatoriamente sin método
- **No usó pistas disponibles:** Tenía comodines pero no los usó
- **Falta de práctica visual:** No escaneó eficientemente el grid

**Scoring:**
- 3/10 palabras encontradas = 30 puntos
- Tiempo agotado = fin automático del ejercicio
- No completó ejercicio = calificación parcial

**Feedback del sistema:**
> "Tiempo agotado. Encontraste 3 de 10 palabras. Este ejercicio es BONUS, así que no afecta tu calificación del módulo. Tip: Busca primero palabras largas (POLONIA, POLONIO, SORBONA) y escanea sistemáticamente. ❌ 30/100 puntos."

---

**Escenario 2: Abandonó el ejercicio**

El estudiante puede optar por NO hacer este ejercicio porque es BONUS (opcional).

**Scoring:**
- Ejercicio no iniciado = 0 puntos en este ejercicio
- **No afecta:** Calificación del módulo (es opcional)
- **Pierde:** 100 XP adicional + 20 ML Coins de recompensa

**Feedback del sistema:**
> "No completaste el ejercicio BONUS. Recuerda: los ejercicios BONUS te dan XP y ML Coins adicionales, pero son opcionales. Puedes volver a intentarlo después."

---

### 🔑 Palabras y Posiciones (para Validación)

```javascript
const wordsToFind = [
  "MARIE", "CURIE", "POLONIA", "NOBEL", "RADIO",
  "POLONIO", "PARIS", "SORBONA", "CIENCIA", "FÍSICA"
];

const wordsPositions = [
  {word: "MARIE", direction: "horizontal", startRow: 9, startCol: 4},
  {word: "POLONIA", direction: "horizontal-reverse", startRow: 3, startCol: 8},
  {word: "NOBEL", direction: "vertical", startRow: 3, startCol: 0},
  {word: "PARIS", direction: "vertical", startRow: 1, startCol: 1}
  // ... (otras posiciones según grid)
];

// Validación
function validateWordSearch(foundWords) {
  const score = (foundWords.length / wordsToFind.length) * 100;
  return {
    score: score,
    foundCount: foundWords.length,
    totalCount: wordsToFind.length,
    passed: score >= 70
  };
}
```

---

## 📊 CASOS DE USO

### 1. Testing QA Manual

**Objetivo:** Verificar que el frontend maneja correctamente las respuestas de los estudiantes

**Procedimiento:**
1. Usar ejemplos de "RESPUESTA EXCELENTE" para verificar scoring perfecto (100 pts)
2. Usar ejemplos de "RESPUESTA ACEPTABLE" para verificar scoring parcial (60-79 pts)
3. Usar ejemplos de "RESPUESTA INCORRECTA" para verificar mensajes de error y límite de intentos
4. Verificar que los feedback messages coincidan con los ejemplos

**Checklist de validación:**
- [ ] Scoring correcto para respuestas perfectas
- [ ] Scoring correcto para respuestas parciales
- [ ] Mensajes de feedback apropiados
- [ ] Límite de 3 intentos funciona correctamente
- [ ] Comodines descuentan ML Coins correctamente
- [ ] Ejercicio BONUS (1.5) es opcional y no afecta calificación del módulo

---

### 2. Testing Backend/API

**Objetivo:** Validar que los endpoints de validación funcionan correctamente

**Endpoint:** `POST /api/v1/student/exercises/{exerciseId}/submit`

**Casos de prueba:**

**Test Case 1.1: Crucigrama - Respuesta perfecta**
```json
{
  "exerciseId": "uuid-crucigrama",
  "answers": {
    "h1": "SORBONA",
    "h2": "NOBEL",
    "h3": "RADIOACTIVIDAD",
    "v1": "POLONIO",
    "v2": "RADIO",
    "v3": "CURIE"
  }
}
```
**Respuesta esperada:**
```json
{
  "score": 100,
  "passed": true,
  "feedback": "¡Excelente! Has completado el crucigrama correctamente...",
  "correctAnswers": 6,
  "totalAnswers": 6
}
```

**Test Case 1.2: Línea de Tiempo - Orden incorrecto**
```json
{
  "exerciseId": "uuid-linea-tiempo",
  "answers": {
    "order": ["event-1", "event-2", "event-4", "event-3", "event-5", "event-6", "event-7"]
  }
}
```
**Respuesta esperada:**
```json
{
  "score": 71,
  "passed": true,
  "feedback": "Casi perfecto. Los descubrimientos del polonio y radio ocurrieron DESPUÉS del matrimonio...",
  "correctPositions": 5,
  "totalPositions": 7,
  "attemptsRemaining": 2
}
```

**Test Case 1.4: Verdadero/Falso - Todas incorrectas**
```json
{
  "exerciseId": "uuid-verdadero-falso",
  "answers": {
    "1": false, "2": true, "3": true, "4": false, "5": false,
    "6": true, "7": false, "8": false, "9": true, "10": true
  }
}
```
**Respuesta esperada:**
```json
{
  "score": 10,
  "passed": false,
  "feedback": "Necesitas leer el contexto histórico más cuidadosamente...",
  "correctAnswers": 1,
  "totalAnswers": 10,
  "attemptsRemaining": 2
}
```

---

### 3. Demos Pedagógicas

**Objetivo:** Mostrar a stakeholders o maestros cómo funcionan los ejercicios

**Flujo de demo (15 minutos):**

1. **Crucigrama (3 min):**
   - Mostrar cómo completar 2-3 palabras
   - Demostrar intersecciones (letras compartidas)
   - Mostrar uso de comodín "Pista"

2. **Línea de Tiempo (2 min):**
   - Drag & drop de eventos
   - Mostrar feedback inmediato (verde/rojo)
   - Destacar importancia de fechas

3. **Completar Espacios (2 min):**
   - Mostrar banco de palabras
   - Demostrar drag & drop o selección
   - Validar coherencia gramatical

4. **Verdadero/Falso (3 min):**
   - Leer contexto histórico
   - Evaluar 2-3 afirmaciones
   - Mostrar explicaciones al finalizar

5. **Sopa de Letras BONUS (2 min):**
   - Explicar que es opcional
   - Mostrar búsqueda de 1-2 palabras
   - Destacar timer de 10 minutos

6. **Resumen (3 min):**
   - Mostrar progreso del módulo
   - XP y ML Coins ganados
   - Próximo ejercicio disponible

---

### 4. Desarrollo Frontend

**Objetivo:** Implementar componentes de ejercicios con datos de prueba

**Componente:** `CrucigramaExercise.tsx`

```typescript
// Test data para desarrollo
const testDataExcelente = {
  answers: {
    h1: "SORBONA",
    h2: "NOBEL",
    h3: "RADIOACTIVIDAD",
    v1: "POLONIO",
    v2: "RADIO",
    v3: "CURIE"
  },
  expectedScore: 100,
  expectedFeedback: "¡Excelente! Has completado el crucigrama..."
};

const testDataAceptable = {
  answers: {
    h1: "SORBONA",
    h2: "NOVEL", // error ortográfico
    h3: "RADIOACTIVIDAD",
    v1: "POLONIO",
    v2: "RADIO",
    v3: "" // vacío
  },
  expectedScore: 67,
  expectedFeedback: "Buen intento. Algunas respuestas necesitan corrección..."
};
```

---

### 5. Entrenamiento de Maestros

**Objetivo:** Capacitar a maestros para usar y evaluar resultados de estudiantes

**Material de entrenamiento:**

**Sección 1: Comprensión del Módulo 1**
- Objetivo pedagógico: Comprensión Literal (Cassany Nivel 1)
- Competencias evaluadas: Identificar información explícita, datos biográficos, vocabulario científico
- 5 ejercicios progresivos

**Sección 2: Interpretación de Resultados**

| Score | Interpretación | Acción recomendada |
|-------|----------------|---------------------|
| 90-100 | Excelente comprensión literal | Avanzar al Módulo 2 |
| 70-89 | Comprensión sólida con errores menores | Revisar conceptos con errores, luego avanzar |
| 50-69 | Comprensión parcial | Repasar ejercicios, usar pistas, reintentar |
| 0-49 | Comprensión deficiente | Revisar texto base, sesión de tutoría, reintentar |

**Sección 3: Intervenciones por Ejercicio**

**Si el estudiante falla Crucigrama:**
- Revisar vocabulario científico básico
- Practicar identificación de información explícita
- Reforzar ortografía de términos técnicos

**Si el estudiante falla Línea de Tiempo:**
- Trabajar cronología y secuencias temporales
- Practicar identificación de fechas en textos
- Reforzar comprensión de narrativas biográficas

**Si el estudiante falla Completar Espacios:**
- Revisar comprensión de contexto gramatical
- Practicar coherencia semántica
- Reforzar lectura de textos completos antes de responder

**Si el estudiante falla Verdadero/Falso:**
- Trabajar verificación de hechos contra evidencia textual
- Practicar detección de palabras absolutas ("solamente", "nunca")
- Reforzar diferencia entre inferencias y hechos explícitos

---

## 📚 REFERENCIAS

### Fuente de Verdad
- **Seeds PROD:** `apps/database/seeds/prod/educational_content/02-exercises-module1.sql`
- **Documento de Diseño:** `docs/00-vision-general/DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md`
- **Modelo Cassany:** Nivel 1 - Comprensión Literal

### Validadores Backend
- `apps/database/ddl/schemas/educational_content/functions/01-validate_crucigrama.sql`
- `apps/database/ddl/schemas/educational_content/functions/02-validate_linea_tiempo.sql`
- `apps/database/ddl/schemas/educational_content/functions/03-validate_completar_espacios.sql`
- `apps/database/ddl/schemas/educational_content/functions/04-validate_verdadero_falso.sql`
- `apps/database/ddl/schemas/educational_content/functions/05-validate_sopa_letras.sql`

### Frontend Components (Esperados)
- `apps/frontend/src/features/exercises/components/CrucigramaExercise.tsx`
- `apps/frontend/src/features/exercises/components/LineaTiempoExercise.tsx`
- `apps/frontend/src/features/exercises/components/CompletarEspaciosExercise.tsx`
- `apps/frontend/src/features/exercises/components/VerdaderoFalsoExercise.tsx`
- `apps/frontend/src/features/exercises/components/SopaLetrasExercise.tsx`

---

## 🎓 CONCLUSIÓN

Esta guía proporciona **ejemplos exhaustivos** de respuestas en 3 niveles de calidad para todos los ejercicios del Módulo 1. Úsala para:

✅ **QA:** Validar scoring y feedback del sistema
✅ **Desarrollo:** Implementar componentes con test data realista
✅ **Demos:** Mostrar funcionalidad a stakeholders
✅ **Entrenamiento:** Capacitar maestros en interpretación de resultados
✅ **Testing API:** Verificar endpoints de validación

**Próximos pasos:** Revisar guías de los Módulos 2 y 3 para comprensión inferencial y crítica.

---

**Documento generado:** 2025-11-23
**Autor:** Architecture-Analyst
**Versión:** 1.0
**Estado:** ✅ Listo para uso en QA, desarrollo y demos
