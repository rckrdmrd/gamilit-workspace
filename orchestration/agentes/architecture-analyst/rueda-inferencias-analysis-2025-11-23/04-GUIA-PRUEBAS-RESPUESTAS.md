# GUÍA DE PRUEBAS: Respuestas de Ejemplo por Categoría

**Fecha:** 2025-11-23
**Propósito:** Documento de referencia para probar el ejercicio "Rueda de Inferencias"
**Uso:** Testing manual, QA, validación pedagógica

---

## 🎯 CÓMO USAR ESTA GUÍA

Esta guía contiene ejemplos de respuestas para cada combinación de **fragmento + categoría**.

**Estructura:**
- 3 fragmentos de texto
- 4 categorías posibles (Literal, Inferencial, Crítico, Creativo)
- 12 combinaciones totales (3 × 4)

**Para cada combinación encontrarás:**
- ✅ **Respuesta EXCELENTE** (80-100% puntos)
- ✅ **Respuesta ACEPTABLE** (50-79% puntos)
- ❌ **Respuesta INCORRECTA** (0-49% puntos)
- 🔑 **Palabras clave esperadas**
- 📊 **Puntuación máxima**

---

## 📖 FRAGMENTO 1: Los Logros de Marie Curie

**Texto del fragmento:**
> "Marie Curie fue pionera en el estudio de la radiactividad, convirtiéndose en la primera mujer en ganar un Premio Nobel y la única persona en ganar en dos campos científicos diferentes."

---

### 📘 FRAGMENTO 1 + CATEGORÍA LITERAL (20 puntos)

**Objetivo:** Identificar hechos explícitos del texto

**🔑 Palabras clave esperadas:**
`["pionera", "radiactividad", "nobel", "primera", "mujer", "cientifico", "premio", "campos", "unica"]`

#### ✅ Respuesta EXCELENTE (18-20 puntos)
```
"Marie Curie fue pionera en el estudio de la radiactividad, fue la primera
mujer en ganar un Premio Nobel y la única persona en ganarlo en dos campos
científicos diferentes."
```
**Palabras clave encontradas:** pionera, radiactividad, nobel, primera, mujer, campos, cientifico, unica (8/9)
**Puntuación esperada:** 20 puntos
**Feedback:** "¡Excelente! Tu inferencia identifica hechos explícitos del texto."

#### ✅ Respuesta ACEPTABLE (12-17 puntos)
```
"Marie fue la primera mujer en recibir un Nobel y ganó premios en dos
campos científicos."
```
**Palabras clave encontradas:** primera, mujer, nobel, campos, cientifico (5/9)
**Puntuación esperada:** 12 puntos
**Feedback:** "Bien, pero podrías mejorar. Identifica hechos explícitos del texto. Ejemplo: 'Marie fue la primera mujer en ganar un Nobel y ganó en dos campos científicos diferentes.'"

#### ❌ Respuesta INCORRECTA (0-11 puntos)
```
"Marie Curie era muy inteligente y trabajadora."
```
**Palabras clave encontradas:** 0/9
**Puntuación esperada:** 0 puntos
**Feedback:** "Intenta nuevamente. Identifica hechos explícitos del texto. Ejemplo: 'Marie fue la primera mujer en ganar un Nobel y ganó en dos campos científicos diferentes.'"

---

### 🔍 FRAGMENTO 1 + CATEGORÍA INFERENCIAL (25 puntos)

**Objetivo:** Deducir información no explícita basándose en pistas

**🔑 Palabras clave esperadas:**
`["impacto", "importancia", "consecuencia", "implica", "deducir", "sugiere", "interdisciplinario", "excepcional", "destacada"]`

#### ✅ Respuesta EXCELENTE (20-25 puntos)
```
"Ganar en dos campos científicos sugiere que Marie tenía conocimientos
interdisciplinarios excepcionales, lo que implica una capacidad
intelectual destacada."
```
**Palabras clave encontradas:** sugiere, interdisciplinario, excepcional, implica, destacada (5/9)
**Puntuación esperada:** 25 puntos
**Feedback:** "¡Excelente! Tu inferencia deduce información no explícita basándose en pistas del texto."

#### ✅ Respuesta ACEPTABLE (13-19 puntos)
```
"Ganar dos Nobeles sugiere que Marie tenía una importancia muy grande
para la ciencia."
```
**Palabras clave encontradas:** sugiere, importancia (2/9)
**Puntuación esperada:** 14 puntos
**Feedback:** "Bien, pero podrías mejorar. Deduce información no explícita basándose en pistas. Ejemplo: 'El hecho de ganar en dos campos sugiere que Marie tenía conocimientos interdisciplinarios excepcionales.'"

#### ❌ Respuesta INCORRECTA (0-12 puntos)
```
"Marie Curie ganó dos premios Nobel en diferentes campos científicos."
```
**Palabras clave encontradas:** 0/9 (esto es literal, no inferencial)
**Puntuación esperada:** 0 puntos
**Feedback:** "Intenta nuevamente. Deduce información no explícita basándose en pistas. Ejemplo: 'El hecho de ganar en dos campos sugiere que Marie tenía conocimientos interdisciplinarios excepcionales.'"

---

### 💡 FRAGMENTO 1 + CATEGORÍA CRÍTICO (30 puntos)

**Objetivo:** Analizar y evaluar críticamente el contenido

**🔑 Palabras clave esperadas:**
`["evaluar", "analizar", "considerar", "perspectiva", "contexto", "significa", "barreras", "historico", "estructural"]`

#### ✅ Respuesta EXCELENTE (24-30 puntos)
```
"Al analizar el contexto histórico, ganar dos Nobeles en época de
discriminación significa que Marie superó barreras estructurales.
Esto evalúa su impacto desde la perspectiva de género."
```
**Palabras clave encontradas:** analizar, contexto, historico, significa, barreras, estructural, evaluar, perspectiva (8/9)
**Puntuación esperada:** 30 puntos
**Feedback:** "¡Excelente! Tu inferencia analiza y evalúa críticamente el contenido."

#### ✅ Respuesta ACEPTABLE (15-23 puntos)
```
"Es importante considerar que los logros de Marie deben evaluarse en el
contexto de su época, donde las mujeres enfrentaban muchas barreras."
```
**Palabras clave encontradas:** considerar, evaluarse, contexto, barreras (4/9)
**Puntuación esperada:** 20 puntos
**Feedback:** "Bien, pero podrías mejorar. Analiza y evalúa críticamente el contenido. Ejemplo: 'Ganar dos Nobeles en época de discriminación demuestra que Marie superó barreras estructurales significativas.'"

#### ❌ Respuesta INCORRECTA (0-14 puntos)
```
"Marie Curie ganó dos premios Nobel, lo cual es impresionante."
```
**Palabras clave encontradas:** 0/9
**Puntuación esperada:** 0 puntos
**Feedback:** "Intenta nuevamente. Analiza y evalúa críticamente el contenido. Ejemplo: 'Ganar dos Nobeles en época de discriminación demuestra que Marie superó barreras estructurales significativas.'"

---

### 🎨 FRAGMENTO 1 + CATEGORÍA CREATIVO (25 puntos)

**Objetivo:** Generar ideas originales relacionadas con el texto

**🔑 Palabras clave esperadas:**
`["imaginar", "si", "podría", "nuevo", "relacionar", "aplicar", "innovar", "futuro", "actual", "inspirar"]`

#### ✅ Respuesta EXCELENTE (20-25 puntos)
```
"Si Marie hubiera tenido tecnología moderna, podría haber descubierto
aplicaciones médicas décadas antes. Imaginar esto inspira nuevas
investigaciones actuales sobre el futuro de la medicina."
```
**Palabras clave encontradas:** si, podría, imaginar, aplicar, futuro, inspira, actual (7/10)
**Puntuación esperada:** 25 puntos
**Feedback:** "¡Excelente! Tu inferencia genera ideas originales relacionadas con el texto."

#### ✅ Respuesta ACEPTABLE (13-19 puntos)
```
"Los logros de Marie podrían inspirar a científicas actuales a innovar
en nuevos campos interdisciplinarios."
```
**Palabras clave encontradas:** podría, inspirar, actual, innovar, nuevo (5/10)
**Puntuación esperada:** 16 puntos
**Feedback:** "Bien, pero podrías mejorar. Genera ideas originales relacionadas con el texto. Ejemplo: 'Si Marie hubiera tenido tecnología moderna, podría haber descubierto aplicaciones médicas décadas antes.'"

#### ❌ Respuesta INCORRECTA (0-12 puntos)
```
"Marie Curie fue muy importante para la ciencia."
```
**Palabras clave encontradas:** 0/10
**Puntuación esperada:** 0 puntos
**Feedback:** "Intenta nuevamente. Genera ideas originales relacionadas con el texto. Ejemplo: 'Si Marie hubiera tenido tecnología moderna, podría haber descubierto aplicaciones médicas décadas antes.'"

---

## 📖 FRAGMENTO 2: Discriminación y Persistencia

**Texto del fragmento:**
> "A pesar de enfrentar discriminación por ser mujer en un campo dominado por hombres, Marie persistió en su investigación, trabajando en condiciones difíciles en un laboratorio improvisado."

---

### 📘 FRAGMENTO 2 + CATEGORÍA LITERAL (20 puntos)

**Objetivo:** Identificar hechos explícitos del texto

**🔑 Palabras clave esperadas:**
`["discriminacion", "mujer", "persistio", "investigacion", "laboratorio", "condiciones", "dificiles", "hombres", "campo"]`

#### ✅ Respuesta EXCELENTE (18-20 puntos)
```
"Marie enfrentó discriminación por ser mujer en un campo dominado por
hombres, pero persistió en su investigación trabajando en condiciones
difíciles en un laboratorio improvisado."
```
**Palabras clave encontradas:** discriminacion, mujer, campo, hombres, persistio, investigacion, condiciones, dificiles, laboratorio (9/9)
**Puntuación esperada:** 20 puntos

#### ✅ Respuesta ACEPTABLE (12-17 puntos)
```
"Marie fue discriminada por ser mujer pero continuó su investigación en
un laboratorio con malas condiciones."
```
**Palabras clave encontradas:** discriminacion, mujer, investigacion, laboratorio, condiciones (5/9)
**Puntuación esperada:** 12 puntos

#### ❌ Respuesta INCORRECTA (0-11 puntos)
```
"Marie era muy valiente y determinada."
```
**Palabras clave encontradas:** 0/9
**Puntuación esperada:** 0 puntos

---

### 🔍 FRAGMENTO 2 + CATEGORÍA INFERENCIAL (25 puntos)

**Objetivo:** Deducir información no explícita basándose en pistas

**🔑 Palabras clave esperadas:**
`["determinacion", "resiliencia", "obstaculos", "motivacion", "supero", "fortaleza", "compromiso", "vocacion"]`

#### ✅ Respuesta EXCELENTE (20-25 puntos)
```
"Su persistencia muestra determinación y resiliencia extraordinarias.
Superar tales obstáculos requiere motivación profunda y fortaleza,
sugiriendo un compromiso total con su vocación científica."
```
**Palabras clave encontradas:** determinacion, resiliencia, supero, obstaculos, motivacion, fortaleza, compromiso, vocacion (8/8)
**Puntuación esperada:** 25 puntos

#### ✅ Respuesta ACEPTABLE (13-19 puntos)
```
"Marie demostró mucha determinación al superar los obstáculos y seguir
con su investigación."
```
**Palabras clave encontradas:** determinacion, supero, obstaculos (3/8)
**Puntuación esperada:** 15 puntos

#### ❌ Respuesta INCORRECTA (0-12 puntos)
```
"Marie trabajó en un laboratorio improvisado con condiciones difíciles."
```
**Palabras clave encontradas:** 0/8 (esto es literal, no inferencial)
**Puntuación esperada:** 0 puntos

---

### 💡 FRAGMENTO 2 + CATEGORÍA CRÍTICO (30 puntos)

**Objetivo:** Analizar y evaluar críticamente el contenido

**🔑 Palabras clave esperadas:**
`["injusticia", "desigualdad", "sistema", "cambio", "evaluar", "significado", "estructural", "social", "genero"]`

#### ✅ Respuesta EXCELENTE (24-30 puntos)
```
"Al evaluar esto, la discriminación evidencia injusticia y desigualdad
estructural del sistema científico. El significado trasciende lo
personal, representando un desafío a las barreras sociales de género."
```
**Palabras clave encontradas:** evaluar, discriminacion, injusticia, desigualdad, estructural, sistema, significado, social, genero (9/9)
**Puntuación esperada:** 30 puntos

#### ✅ Respuesta ACEPTABLE (15-23 puntos)
```
"La discriminación que sufrió Marie muestra la desigualdad del sistema
de esa época, lo cual es importante evaluar desde una perspectiva de
género."
```
**Palabras clave encontradas:** discriminacion, desigualdad, sistema, evaluar, genero (5/9)
**Puntuación esperada:** 20 puntos

#### ❌ Respuesta INCORRECTA (0-14 puntos)
```
"Marie trabajó duro a pesar de las dificultades."
```
**Palabras clave encontradas:** 0/9
**Puntuación esperada:** 0 puntos

---

### 🎨 FRAGMENTO 2 + CATEGORÍA CREATIVO (25 puntos)

**Objetivo:** Generar ideas originales relacionadas con el texto

**🔑 Palabras clave esperadas:**
`["inspirar", "lecciones", "paralelo", "actual", "aplicar", "futuro", "relacionar", "si", "modelo", "ejemplo"]`

#### ✅ Respuesta EXCELENTE (20-25 puntos)
```
"Marie puede inspirar a científicas actuales con obstáculos similares.
Si aplicamos las lecciones al futuro, relacionamos su ejemplo con
movimientos por igualdad de género en STEM. Es un modelo poderoso."
```
**Palabras clave encontradas:** inspirar, actual, si, aplicar, lecciones, futuro, relacionar, ejemplo, modelo (9/10)
**Puntuación esperada:** 25 puntos

#### ✅ Respuesta ACEPTABLE (13-19 puntos)
```
"Marie puede servir de inspiración y ejemplo para mujeres actuales en
la ciencia que enfrentan discriminación similar."
```
**Palabras clave encontradas:** inspirar, ejemplo, actual (3/10)
**Puntuación esperada:** 13 puntos

#### ❌ Respuesta INCORRECTA (0-12 puntos)
```
"Marie enfrentó muchas dificultades pero no se rindió."
```
**Palabras clave encontradas:** 0/10
**Puntuación esperada:** 0 puntos

---

## 📖 FRAGMENTO 3: Cuadernos Radiactivos

**Texto del fragmento:**
> "Los cuadernos de Marie Curie todavía son radiactivos y se guardan en cajas especiales de plomo. Las personas que quieren consultarlos deben firmar un descargo de responsabilidad."

---

### 📘 FRAGMENTO 3 + CATEGORÍA LITERAL (20 puntos)

**Objetivo:** Identificar hechos explícitos del texto

**🔑 Palabras clave esperadas:**
`["cuadernos", "radiactivos", "plomo", "cajas", "descargo", "responsabilidad", "guardan", "consultar", "personas"]`

#### ✅ Respuesta EXCELENTE (18-20 puntos)
```
"Los cuadernos de Marie Curie todavía son radiactivos y están guardados
en cajas de plomo. Las personas que quieren consultarlos deben firmar
un descargo de responsabilidad."
```
**Palabras clave encontradas:** cuadernos, radiactivos, cajas, plomo, personas, consultar, descargo, responsabilidad, guardan (9/9)
**Puntuación esperada:** 20 puntos

#### ✅ Respuesta ACEPTABLE (12-17 puntos)
```
"Los cuadernos están en cajas de plomo porque son radiactivos y hay que
firmar un descargo para verlos."
```
**Palabras clave encontradas:** cuadernos, cajas, plomo, radiactivos, descargo (5/9)
**Puntuación esperada:** 12 puntos

#### ❌ Respuesta INCORRECTA (0-11 puntos)
```
"Marie Curie trabajó con materiales peligrosos."
```
**Palabras clave encontradas:** 0/9
**Puntuación esperada:** 0 puntos

---

### 🔍 FRAGMENTO 3 + CATEGORÍA INFERENCIAL (25 puntos)

**Objetivo:** Deducir información no explícita basándose en pistas

**🔑 Palabras clave esperadas:**
`["peligro", "duracion", "exposicion", "consecuencias", "vida", "media", "decadas", "riesgo", "salud"]`

#### ✅ Respuesta EXCELENTE (20-25 puntos)
```
"Que sigan radiactivos décadas después indica vida media larga del radio,
implicando exposición constante al peligro. Las consecuencias para su
salud fueron inevitables por el riesgo prolongado."
```
**Palabras clave encontradas:** decadas, vida, media, exposicion, peligro, consecuencias, salud, riesgo (8/9)
**Puntuación esperada:** 25 puntos

#### ✅ Respuesta ACEPTABLE (13-19 puntos)
```
"Los cuadernos todavía radiactivos muestran el peligro al que Marie estuvo
expuesta durante años, con consecuencias para su salud."
```
**Palabras clave encontradas:** peligro, exposicion, consecuencias, salud (4/9)
**Puntuación esperada:** 16 puntos

#### ❌ Respuesta INCORRECTA (0-12 puntos)
```
"Los cuadernos están en cajas de plomo para protegerlos."
```
**Palabras clave encontradas:** 0/9
**Puntuación esperada:** 0 puntos

---

### 💡 FRAGMENTO 3 + CATEGORÍA CRÍTICO (30 puntos)

**Objetivo:** Analizar y evaluar críticamente el contenido

**🔑 Palabras clave esperadas:**
`["riesgo", "seguridad", "conocimiento", "epoca", "precio", "ciencia", "evaluar", "significa", "evidencia"]`

#### ✅ Respuesta EXCELENTE (24-30 puntos)
```
"Los cuadernos radiactivos son evidencia del precio que Marie pagó por
la ciencia. Al evaluar esto, significa que trabajó sin conocimiento de
riesgos, común en esa época. Analiza cómo evolucionó la seguridad."
```
**Palabras clave encontradas:** evidencia, precio, ciencia, evaluar, significa, conocimiento, riesgo, epoca, seguridad (9/9)
**Puntuación esperada:** 30 puntos

#### ✅ Respuesta ACEPTABLE (15-23 puntos)
```
"Los cuadernos muestran que Marie pagó un precio por la ciencia, trabajando
sin conocer los riesgos de seguridad de su época."
```
**Palabras clave encontradas:** precio, ciencia, conocer, riesgo, seguridad, epoca (6/9)
**Puntuación esperada:** 22 puntos

#### ❌ Respuesta INCORRECTA (0-14 puntos)
```
"Los cuadernos son peligrosos y están bien guardados."
```
**Palabras clave encontradas:** 0/9
**Puntuación esperada:** 0 puntos

---

### 🎨 FRAGMENTO 3 + CATEGORÍA CREATIVO (25 puntos)

**Objetivo:** Generar ideas originales relacionadas con el texto

**🔑 Palabras clave esperadas:**
`["simbolo", "legado", "presente", "futuro", "representa", "reflexion", "si", "imaginar", "relacionar", "metafora"]`

#### ✅ Respuesta EXCELENTE (20-25 puntos)
```
"Los cuadernos son símbolo y metáfora del legado de Marie. Representan
cómo descubrimientos tienen consecuencias en el presente. Imaginar esto
invita a reflexión: ¿qué consecuencias tendrán tecnologías actuales?"
```
**Palabras clave encontradas:** simbolo, metafora, legado, representa, presente, imaginar, reflexion, futuro (8/10)
**Puntuación esperada:** 25 puntos

#### ✅ Respuesta ACEPTABLE (13-19 puntos)
```
"Los cuadernos representan un símbolo del legado de Marie y pueden servir
de reflexión sobre cómo la ciencia actual afectará al futuro."
```
**Palabras clave encontradas:** representan, simbolo, legado, reflexion, futuro (5/10)
**Puntuación esperada:** 16 puntos

#### ❌ Respuesta INCORRECTA (0-12 puntos)
```
"Los cuadernos muestran que Marie trabajó con materiales radiactivos."
```
**Palabras clave encontradas:** 0/10
**Puntuación esperada:** 0 puntos

---

## 📊 TABLA RESUMEN DE PUNTUACIONES

| Fragmento | Literal (20) | Inferencial (25) | Crítico (30) | Creativo (25) |
|-----------|-------------|------------------|--------------|---------------|
| **Fragmento 1** | 20 pts max | 25 pts max | 30 pts max | 25 pts max |
| **Fragmento 2** | 20 pts max | 25 pts max | 30 pts max | 25 pts max |
| **Fragmento 3** | 20 pts max | 25 pts max | 30 pts max | 25 pts max |

**Posibles combinaciones de 3 rondas:**

| Combinación | Puntuación Máxima | Ejemplo |
|-------------|-------------------|---------|
| 3 Literales | 60 puntos | Más fácil |
| 2 Literales + 1 Inferencial | 65 puntos | |
| 1 Literal + 1 Inferencial + 1 Crítico | 75 puntos | Balanceado |
| 3 Críticos | 90 puntos | Más difícil |
| Literal + Inferencial + Creativo | 70 puntos | Variado |

**Nota:** La puntuación máxima total depende de qué categorías seleccione la ruleta.

---

## ✅ CASOS DE PRUEBA RECOMENDADOS

### Test 1: Caso Ideal (Estudiante Avanzado)
```
Ronda 1: Literal - Fragmento 1 → Respuesta excelente (20/20)
Ronda 2: Inferencial - Fragmento 2 → Respuesta excelente (25/25)
Ronda 3: Crítico - Fragmento 3 → Respuesta excelente (30/30)
TOTAL: 75/75 (100%)
```

### Test 2: Caso Medio (Estudiante Intermedio)
```
Ronda 1: Literal - Fragmento 1 → Respuesta aceptable (12/20)
Ronda 2: Inferencial - Fragmento 2 → Respuesta aceptable (15/25)
Ronda 3: Creativo - Fragmento 3 → Respuesta aceptable (13/25)
TOTAL: 40/70 (57%)
```

### Test 3: Caso Bajo (Estudiante Principiante)
```
Ronda 1: Crítico - Fragmento 1 → Respuesta incorrecta (0/30)
Ronda 2: Creativo - Fragmento 2 → Respuesta incorrecta (0/25)
Ronda 3: Inferencial - Fragmento 3 → Respuesta incorrecta (0/25)
TOTAL: 0/80 (0%)
```

### Test 4: Validar que NO se repiten categorías
```
Ronda 1: Literal seleccionada
Ronda 2: Literal NO PUEDE volver a salir ✓
Ronda 3: Solo quedan 2 categorías disponibles ✓
```

---

## 🧪 CHECKLIST DE VALIDACIÓN MANUAL

Al probar el ejercicio, verificar:

### Funcionalidad de la Ruleta
- [ ] La ruleta gira visualmente
- [ ] Se selecciona una categoría aleatoria
- [ ] La categoría seleccionada se muestra claramente
- [ ] En ronda 2, NO sale la misma categoría que ronda 1
- [ ] En ronda 3, NO sale ninguna de las 2 categorías anteriores

### Flujo de Respuestas
- [ ] Se puede escribir respuesta de 20-200 caracteres
- [ ] El contador de caracteres funciona
- [ ] El timer de 30 segundos funciona
- [ ] Botón dice "Guardar y Continuar" en rondas 1-2
- [ ] Botón dice "Guardar Respuesta" en ronda 3
- [ ] Aparece pantalla de resumen después de ronda 3
- [ ] Se pueden ver las 3 respuestas en el resumen

### Calificación
- [ ] La puntuación varía según la categoría seleccionada
- [ ] Una respuesta Literal obtiene máximo 20 puntos
- [ ] Una respuesta Inferencial obtiene máximo 25 puntos
- [ ] Una respuesta Crítica obtiene máximo 30 puntos
- [ ] Una respuesta Creativa obtiene máximo 25 puntos
- [ ] Las palabras clave se detectan correctamente (case-insensitive)

### Feedback
- [ ] Se muestra feedback general del ejercicio
- [ ] Se muestra feedback específico por cada ronda
- [ ] Se indican las palabras clave encontradas
- [ ] Se muestra la puntuación por ronda
- [ ] Los ejemplos de respuestas correctas se muestran cuando aplica

---

## 🎓 NOTAS PEDAGÓGICAS

**Para educadores/testers:**

1. **Literal es más fácil:** Los estudiantes solo necesitan extraer información explícita
2. **Inferencial requiere deducción:** Buscar pistas implícitas y sacar conclusiones
3. **Crítico es más complejo:** Requiere análisis, evaluación y contextualización
4. **Creativo es abierto:** Permite ideas originales pero debe relacionarse con el texto

**Progresión esperada:**
- Estudiantes principiantes: Mayormente respuestas literales
- Estudiantes intermedios: Combinan literal + inferencial
- Estudiantes avanzados: Dominan crítico + creativo

---

**Documento preparado por:** Architecture-Analyst
**Fecha:** 2025-11-23
**Versión:** 1.0
**Uso:** Testing manual, QA, validación pedagógica
