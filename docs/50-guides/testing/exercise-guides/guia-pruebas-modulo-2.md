---
titulo: Guía de Pruebas Módulo 2 Comprensión Inferencial
tipo: guia
dominio: testing
ultima_actualizacion: 2026-02-27
---

# GUÍA DE PRUEBAS - MÓDULO 2: COMPRENSIÓN INFERENCIAL
## Ejemplos de Respuestas para Testing QA

**Fecha:** 2025-11-23
**Versión:** 1.0
**Módulo:** MOD-02-INFERENCIAL - Comprensión Inferencial
**Autor:** Architecture-Analyst
**Fuente:** `apps/database/seeds/prod/educational_content/03-exercises-module2.sql`

---

## 📋 ÍNDICE

1. [Ejercicio 2.1: Detective Textual](#ejercicio-21-detective-textual)
2. [Ejercicio 2.2: Relaciones Causa-Efecto](#ejercicio-22-relaciones-causa-efecto)
3. [Ejercicio 2.3: Predicción Narrativa](#ejercicio-23-predicción-narrativa)
4. [Ejercicio 2.4: Puzzle de Contexto](#ejercicio-24-puzzle-de-contexto)
5. [Ejercicio 2.5: Rueda de Inferencias](#ejercicio-25-rueda-de-inferencias)
6. [Casos de Uso](#casos-de-uso)

---

## 🎯 PROPÓSITO DE ESTA GUÍA

Esta guía proporciona **ejemplos detallados de respuestas** para cada ejercicio del Módulo 2, clasificadas en tres niveles de calidad:

- **✅ EXCELENTE (80-100 puntos):** Respuestas que demuestran comprensión inferencial sofisticada
- **⚠️ ACEPTABLE (50-79 puntos):** Respuestas con inferencias básicas pero incompletas
- **❌ INCORRECTA (0-49 puntos):** Respuestas que confunden hechos con inferencias o hacen deducciones incorrectas

**Audiencia:** QA testers, desarrolladores frontend/backend, diseñadores pedagógicos, demos

---

## EJERCICIO 2.1: DETECTIVE TEXTUAL

**Tipo:** `detective_textual`
**Dificultad:** Intermediate
**Tiempo estimado:** 25 minutos
**Puntos máximos:** 100
**Puntos de aprobación:** 75

### 📊 Configuración del Ejercicio

```json
{
  "showHints": true,
  "timePerQuestion": 90,
  "allowReview": true
}
```

### 📖 Pasaje del Ejercicio

> "Marie Curie trabajaba largas horas en un laboratorio mal ventilado, rodeada de materiales radiactivos. A menudo llevaba tubos de ensayo con radio en los bolsillos de su bata de trabajo. Sus cuadernos de investigación brillaban misteriosamente en la oscuridad de la noche. A pesar de sentirse frecuentemente fatigada y con dolores, Marie continuaba su investigación sin descanso, convencida de que su trabajo beneficiaría a la humanidad."

### 🎯 Preguntas y Respuestas Correctas

| Pregunta | Tipo Inferencia | Respuesta Correcta | Índice |
|----------|-----------------|-------------------|--------|
| ¿Por qué los cuadernos de Marie brillaban en la oscuridad? | causa_efecto | Estaban contaminados con material radiactivo | 1 |
| ¿Qué podemos inferir sobre las condiciones de seguridad? | contexto_situacional | Eran inadecuadas y peligrosas para la salud | 1 |
| ¿Qué sugiere el texto sobre la relación entre sus síntomas físicos y su trabajo? | causa_efecto | La fatiga y dolores probablemente eran causados por la exposición a radiación | 1 |
| ¿Qué motivación impulsaba a Marie a continuar trabajando? | motivacion | La convicción de que su trabajo ayudaría a la humanidad | 1 |

---

### ✅ RESPUESTA EXCELENTE (95-100 puntos)

**4/4 preguntas correctas con razonamiento inferencial sólido**

#### Pregunta 1: ¿Por qué los cuadernos de Marie brillaban en la oscuridad?

**Respuesta seleccionada:** Opción 1 - "Estaban contaminados con material radiactivo"

**Razonamiento esperado del estudiante:**
> "El texto menciona que Marie trabajaba con materiales radiactivos sin protección, llevando tubos de ensayo con radio en los bolsillos. Es lógico inferir que sus cuadernos, constantemente manipulados con manos contaminadas y expuestos al radio, absorbieron radiación. La radiactividad del radio-226 causa luminiscencia (brillo en la oscuridad) debido a la ionización del aire circundante. Esta es la única explicación científicamente plausible."

**Por qué es excelente:**
- ✓ Conecta evidencia textual ("trabajaba con materiales radiactivos", "tubos en bolsillos") con conclusión
- ✓ Aplica conocimiento científico básico (radiactividad → luminiscencia)
- ✓ Descarta alternativas ilógicas (tinta fluorescente, lápiz luminoso)
- ✓ Identifica relación causa-efecto clara

---

#### Pregunta 2: ¿Qué podemos inferir sobre las condiciones de seguridad en su laboratorio?

**Respuesta seleccionada:** Opción 1 - "Eran inadecuadas y peligrosas para la salud"

**Razonamiento esperado:**
> "Múltiples pistas textuales indican falta de seguridad: (1) 'laboratorio mal ventilado' - esencial para evacuar gases radiactivos, (2) 'llevaba tubos de ensayo con radio en los bolsillos' - inexistente protocolo de contención, (3) 'trabajaba largas horas' sin pausas para descontaminación. En conjunto, estas prácticas demuestran ausencia total de medidas de protección radiológica, lo que era peligrosísimo."

**Por qué es excelente:**
- ✓ Identifica MÚLTIPLES pistas textuales (laboratorio mal ventilado + tubos en bolsillos + largas horas)
- ✓ Infiere contexto histórico (época sin protocolos de seguridad radiológica)
- ✓ Evalúa impacto combinado de múltiples factores
- ✓ No juzga anacrónicamente (reconoce que en esa época no se conocían los riesgos)

---

#### Pregunta 3: ¿Qué sugiere el texto sobre la relación entre sus síntomas físicos y su trabajo?

**Respuesta seleccionada:** Opción 1 - "La fatiga y dolores probablemente eran causados por la exposición a radiación"

**Razonamiento esperado:**
> "El texto yuxtapone dos informaciones: exposición constante a radiación + síntomas de fatiga y dolores. Aunque no dice explícitamente que la radiación causó los síntomas, la conexión es inferible: (1) Exposición prolongada a radio → daño celular conocido, (2) Síntomas crónicos no explicados de otra forma, (3) 'A pesar de' indica persistencia de síntomas durante el trabajo radiactivo. Históricamente, sabemos que Marie falleció de anemia aplásica causada por radiación."

**Por qué es excelente:**
- ✓ Identifica yuxtaposición textual como pista de causalidad
- ✓ Aplica razonamiento hipotético-deductivo (exposición → síntomas)
- ✓ Reconoce limitaciones de la inferencia ("probablemente", no certeza absoluta)
- ✓ Evita afirmar causalidad directa sin evidencia explícita, pero infiere relación razonable

---

#### Pregunta 4: ¿Qué motivación impulsaba a Marie a continuar trabajando a pesar de sus malestares?

**Respuesta seleccionada:** Opción 1 - "La convicción de que su trabajo ayudaría a la humanidad"

**Razonamiento esperado:**
> "Esta inferencia está casi explícitamente señalada: 'Marie continuaba su investigación sin descanso, convencida de que su trabajo beneficiaría a la humanidad'. La palabra clave 'convencida' indica motivación interna fuerte. El texto descarta motivaciones externas (fama, presión de otros, dinero) al enfatizar su perseverancia 'a pesar de' malestares, sugiriendo motivación intrínseca y altruista."

**Por qué es excelente:**
- ✓ Identifica evidencia textual casi explícita ("convencida de que... beneficiaría a la humanidad")
- ✓ Reconoce que aunque está casi explícito, sigue siendo inferencia (no dice directamente "su motivación era...")
- ✓ Descarta otras motivaciones usando evidencia negativa ("a pesar de" malestares → no es por fama o dinero)

---

**Scoring Total:**
- 4/4 preguntas correctas = 100 puntos
- Razonamiento inferencial sofisticado demostrado
- Tiempo promedio por pregunta: 5 minutos (total 20 min, dentro del límite de 25 min)

**Feedback del sistema:**
> "¡Excelente trabajo detective! Has demostrado capacidad excepcional de comprensión inferencial. Identificaste correctamente las relaciones causa-efecto, contexto situacional, síntomas-exposición y motivaciones personales basándote en pistas textuales. ✓ 100/100 puntos."

---

### ⚠️ RESPUESTA ACEPTABLE (70-79 puntos)

**3/4 preguntas correctas, 1 error en inferencia contextual**

#### Error en Pregunta 2: Condiciones de seguridad

**Respuesta seleccionada (incorrecta):** Opción 2 - "Cumplían con los estándares modernos de seguridad"

**Razonamiento erróneo del estudiante:**
> "El texto no menciona problemas de seguridad graves, y Marie era una científica profesional, así que probablemente seguía protocolos estándar."

**Por qué es aceptable (pero con error):**
- ✗ Ignora pistas textuales explícitas ("mal ventilado", "tubos en bolsillos")
- ✗ Asume protocolos inexistentes en la época (~1900)
- ✗ Comete anacronismo (juzga con estándares modernos)
- ✓ Pero las otras 3 preguntas están correctas

**Feedback del sistema para este error:**
> "Revisa la pregunta 2. El texto proporciona varias pistas sobre las condiciones del laboratorio: 'mal ventilado', 'llevaba tubos de ensayo con radio en los bolsillos'. ¿Qué sugieren estas prácticas sobre la seguridad? Recuerda: en esa época (1900) no se conocían los peligros de la radiación como hoy."

---

**Scoring Total:**
- 3/4 preguntas correctas = 75 puntos
- Razonamiento inferencial básico pero con 1 error significativo
- Segundo intento usado para corregir

**Feedback del sistema:**
> "Buen trabajo en 3 de 4 inferencias. Tu error en la pregunta sobre seguridad sugiere que necesitas considerar más cuidadosamente el contexto histórico y las pistas textuales. Recuerda: inferir no es adivinar, sino deducir lógicamente basándose en evidencia del texto. ⚠️ 75/100 puntos."

---

### ❌ RESPUESTA INCORRECTA (0-49 puntos)

**1-2/4 preguntas correctas, múltiples errores de inferencia**

#### Error en Pregunta 1: ¿Por qué brillaban los cuadernos?

**Respuesta seleccionada (incorrecta):** Opción 0 - "Usaba tinta especial fluorescente para escribir"

**Razonamiento erróneo:**
> "Probablemente usaba tinta especial para tomar notas en la oscuridad del laboratorio."

**Por qué es incorrecta:**
- ✗ No hay evidencia textual de tinta fluorescente
- ✗ Ignora pista clave: trabajaba con materiales radiactivos
- ✗ Inventa explicación sin base en el texto
- ✗ No conecta el brillo con la radiactividad mencionada

---

#### Error en Pregunta 3: Relación síntomas-trabajo

**Respuesta seleccionada (incorrecta):** Opción 0 - "Sus síntomas no tenían relación con su investigación"

**Razonamiento erróneo:**
> "El texto no dice explícitamente que la radiación causó sus síntomas, así que no podemos asumir una relación."

**Por qué es incorrecta:**
- ✗ Confunde "no explícito" con "no inferible"
- ✗ Ignora yuxtaposición textual (exposición radiactiva + síntomas crónicos)
- ✗ No aplica razonamiento inferencial básico
- ✗ Falla en reconocer pistas de causalidad

---

**Scoring Total:**
- 1/4 preguntas correctas = 25 puntos
- Confusión fundamental entre hechos explícitos e inferencias
- Múltiples intentos agotados

**Feedback del sistema:**
> "Necesitas desarrollar tu capacidad de inferencia. Inferir significa deducir información NO explícita basándose en pistas del texto. Ejemplo: Si el texto dice 'trabajaba con materiales radiactivos' y 'sus cuadernos brillaban', puedes inferir que la radiación contaminó los cuadernos. No necesita decirlo explícitamente. ❌ 25/100 puntos. Revisa las explicaciones y vuelve a intentar."

---

### 🔑 Keywords para Validación Automática

```javascript
const correctAnswers = {
  "q1": 1,  // Contaminación radiactiva
  "q2": 1,  // Condiciones inadecuadas
  "q3": 1,  // Radiación causó síntomas
  "q4": 1   // Motivación humanitaria
};

const inferenceTypes = {
  "q1": "causa_efecto",
  "q2": "contexto_situacional",
  "q3": "causa_efecto",
  "q4": "motivacion"
};
```

---

## EJERCICIO 2.2: RELACIONES CAUSA-EFECTO

**Tipo:** `construccion_hipotesis`
**Dificultad:** Intermediate
**Tiempo estimado:** 20 minutos
**Puntos máximos:** 100
**Puntos de aprobación:** 70

### 📊 Configuración del Ejercicio

```json
{
  "allowMultiple": true,
  "showFeedback": true,
  "dragAndDrop": true
}
```

### 🎯 Causas y Consecuencias

#### CAUSA 1: "Marie decidió no patentar el proceso de aislamiento del radio"

**Consecuencias correctas:**
- **e1:** "Otros científicos pudieron continuar la investigación" ✓
- **e2:** "No obtuvo riquezas de su descubrimiento" ✓
- **e3:** "La medicina avanzó más rápidamente" ✓

**Consecuencias incorrectas (distractores):**
- **e4:** "Demostró su independencia científica" ✗ (no relacionado causalmente con la decisión de no patentar)

---

#### CAUSA 2: "Marie continuó trabajando después de la muerte de Pierre"

**Consecuencias correctas:**
- **e5:** "Completó investigaciones pendientes" ✓
- **e6:** "Se convirtió en la primera profesora de la Sorbona" ✓

**Consecuencias incorrectas:**
- **e4:** "Demostró su independencia científica" ✓ (pertenece a c2, no a c1)

---

### ✅ RESPUESTA EXCELENTE (100 puntos)

**Emparejamiento perfecto de causas con todas sus consecuencias correctas**

```javascript
{
  "c1": ["e1", "e2", "e3"],  // Marie no patentó → 3 consecuencias
  "c2": ["e4", "e5", "e6"]   // Marie continuó tras muerte Pierre → 3 consecuencias
}
```

#### Justificación Causa 1 → Consecuencias

**c1 → e1: "No patentar → Otros científicos pudieron investigar"**
> **Razonamiento:** Si Marie hubiera patentado el proceso de aislamiento del radio, habría tenido derechos exclusivos sobre el método. Al NO patentar, el conocimiento quedó en dominio público, permitiendo que otros científicos (como Otto Hahn, Lise Meitner) continuaran investigando radioactividad sin restricciones legales. Relación causal directa.

**c1 → e2: "No patentar → No obtuvo riquezas"**
> **Razonamiento:** Las patentes otorgan derechos de explotación comercial. El proceso de aislamiento del radio tenía enorme valor comercial (medicina, industria). Al renunciar a la patente, Marie renunció a royalties y ganancias económicas sustanciales. Relación causa-efecto económica clara.

**c1 → e3: "No patentar → La medicina avanzó más rápidamente"**
> **Razonamiento:** Al estar en dominio público, múltiples investigadores pudieron experimentar simultáneamente con aplicaciones médicas del radio (radioterapia para cáncer). Sin barreras de patentes, la investigación médica se aceleró. Efecto a largo plazo verificable históricamente.

---

#### Justificación Causa 2 → Consecuencias

**c2 → e4: "Continuó trabajando → Demostró independencia científica"**
> **Razonamiento:** Tras la muerte de Pierre (1906), Marie podría haber abandonado la ciencia (común en viudas de la época). Al continuar su investigación de forma independiente, demostró que sus logros científicos no dependían de Pierre, sino de su propio talento. Consecuencia de su decisión de persistir.

**c2 → e5: "Continuó trabajando → Completó investigaciones pendientes"**
> **Razonamiento:** Marie y Pierre tenían proyectos de investigación en curso en 1906. Al continuar trabajando, Marie pudo finalizar el aislamiento del radio puro (1910) y otros estudios iniciados conjuntamente. Efecto directo inmediato de su decisión.

**c2 → e6: "Continuó trabajando → Primera profesora de la Sorbona"**
> **Razonamiento:** La Sorbona ofreció a Marie la cátedra de Pierre tras su muerte. Si hubiera rechazado y abandonado la ciencia, no habría asumido este cargo histórico. Al aceptar y continuar, se convirtió en la primera mujer profesora de la Sorbona (1906). Consecuencia institucional de su decisión.

---

**Scoring:**
- Causa 1: 3/3 consecuencias correctas = 50 puntos
- Causa 2: 3/3 consecuencias correctas = 50 puntos
- Total: 100 puntos
- Sin uso de comodines

**Feedback del sistema:**
> "¡Excelente análisis causal! Has identificado correctamente todas las consecuencias de cada decisión, demostrando comprensión sofisticada de relaciones causa-efecto múltiples. Reconoces efectos inmediatos (no obtuvo riquezas, completó investigaciones), efectos a largo plazo (medicina avanzó), y efectos en múltiples dominios (económico, científico, institucional). ✓ 100/100 puntos."

---

### ⚠️ RESPUESTA ACEPTABLE (65-79 puntos)

**Emparejamiento con 1-2 errores menores**

```javascript
{
  "c1": ["e1", "e2", "e4"],  // ✗ Error: e4 no pertenece a c1
  "c2": ["e5", "e6"]         // ✓ Correcto, pero falta e4
}
```

#### Error Identificado

**c1 → e4: "No patentar → Demostró independencia científica" ✗**

**Por qué es incorrecto:**
- La independencia científica de Marie se demostró al continuar trabajando DESPUÉS de la muerte de Pierre, no por la decisión de no patentar
- No hay relación causal lógica entre "renunciar a patente" y "demostrar independencia"
- Confusión entre decisiones altruistas (no patentar) y decisiones de persistencia (continuar investigando)

**Consecuencia omitida:**
- Falta conectar **e3** ("La medicina avanzó más rápidamente") con **c1**
- Esta es una consecuencia a largo plazo válida de no patentar

---

**Scoring:**
- Causa 1: 2/3 consecuencias correctas (e1, e2) + 1 incorrecta (e4) = 33 puntos
- Causa 2: 2/3 consecuencias correctas (e5, e6), falta e4 = 33 puntos
- Total: 66 puntos

**Feedback del sistema:**
> "Buen intento. Has identificado la mayoría de las relaciones causales correctamente. Sin embargo: (1) 'Demostrar independencia científica' NO es consecuencia de no patentar, sino de continuar trabajando tras la muerte de Pierre. (2) Te falta identificar que 'La medicina avanzó más rápidamente' SÍ es consecuencia de no patentar (conocimiento en dominio público). ⚠️ 66/100 puntos."

---

### ❌ RESPUESTA INCORRECTA (0-49 puntos)

**Emparejamiento con múltiples errores y omisiones**

```javascript
{
  "c1": ["e1"],              // Falta e2, e3
  "c2": ["e2", "e4", "e5"]   // ✗ e2 pertenece a c1, no c2
}
```

#### Errores Críticos

**Error 1: c2 → e2 "Continuó trabajando → No obtuvo riquezas" ✗**
- No hay relación causal entre continuar trabajando y no obtener riquezas
- Las riquezas no obtenidas se deben a NO PATENTAR (c1), no a continuar trabajando
- Confusión fundamental entre ambas decisiones

**Error 2: Omisión de e3 y e6**
- No identificó que "medicina avanzó" es consecuencia de no patentar
- No identificó que "primera profesora Sorbona" es consecuencia de continuar trabajando

---

**Scoring:**
- Causa 1: 1/3 consecuencias correctas = 17 puntos
- Causa 2: 2/3 correctas (e4, e5) + 1 incorrecta (e2) = 17 puntos
- Total: 34 puntos

**Feedback del sistema:**
> "Necesitas mejorar tu análisis de relaciones causales. Confundes las consecuencias de dos decisiones diferentes: (1) No patentar → consecuencias económicas y científicas, (2) Continuar trabajando tras muerte de Pierre → consecuencias personales e institucionales. No obtuvo riquezas porque NO PATENTÓ, no porque continuó trabajando. Revisa la lógica causal de cada decisión. ❌ 34/100 puntos. Te quedan 2 intentos."

---

### 🔑 Respuestas Correctas para Validación

```javascript
const correctCausalMappings = {
  "c1": ["e1", "e2", "e3"],  // No patentar
  "c2": ["e4", "e5", "e6"]   // Continuar tras muerte Pierre
};

const distractors = {
  "e4": "Pertenece a c2 (continuar trabajando), NO a c1 (no patentar)"
};
```

---

## EJERCICIO 2.3: PREDICCIÓN NARRATIVA

**Tipo:** `prediccion_narrativa`
**Dificultad:** Intermediate-Advanced
**Tiempo estimado:** 15 minutos
**Puntos máximos:** 100
**Puntos de aprobación:** 70

### 📊 Configuración del Ejercicio

```json
{
  "showContext": true,
  "allowExplanations": true
}
```

### 📖 Escenario de Predicción

**Contexto Histórico:**
> "Año 1911. Marie Curie ya ha ganado el Premio Nobel de Física (1903) junto a Pierre Curie y Henri Becquerel por sus investigaciones sobre la radiactividad. Ahora, siendo viuda desde 1906, ha continuado sus investigaciones y ha aislado el radio puro, un logro científico extraordinario."

**Inicio Narrativo:**
> "Cuando Marie presentó su candidatura a la Academia de Ciencias Francesa en 1911, siendo ya ganadora del Nobel..."

**Pregunta:** ¿Cómo continúa más probablemente?

### 🎯 Opciones de Predicción

| ID | Predicción | Correcta | Explicación |
|----|-----------|----------|-------------|
| p1 | Fue aceptada inmediatamente con honores | ❌ | Ignora prejuicios de género de la época |
| p2 | Fue rechazada por ser mujer, a pesar de sus logros | ✅ | Predicción histórica correcta |
| p3 | Decidió retirar su candidatura | ❌ | Contradice personalidad perseverante de Marie |
| p4 | Fue elegida presidenta de la Academia | ❌ | Completamente anacrónico |

---

### ✅ RESPUESTA EXCELENTE (100 puntos)

**Predicción correcta con razonamiento histórico sofisticado**

**Respuesta seleccionada:** Opción p2 - "Fue rechazada por ser mujer, a pesar de sus logros"

**Razonamiento esperado del estudiante:**
> "Aunque Marie tenía méritos científicos excepcionales (Nobel de Física 1903, aislamiento del radio puro), la predicción correcta considera el contexto histórico de 1911:
>
> **FILTRO 1 - Contexto de época:** La Academia de Ciencias Francesa era profundamente conservadora y nunca había admitido mujeres en sus más de 200 años de historia (fundada 1666). Los prejuicios de género institucionales eran extremos en instituciones científicas del s.XX.
>
> **FILTRO 2 - Coherencia con personalidad:** Marie era perseverante y no se rendía ante obstáculos (evidencia: continuó investigando tras muerte de Pierre). Esto descarta p3 (retirar candidatura).
>
> **FILTRO 3 - Plausibilidad histórica:** El contexto menciona que 'presentó su candidatura', sugiriendo que el proceso llegó a votación. La tensión narrativa entre 'logros excepcionales' vs. 'siendo mujer' sugiere conflicto entre mérito y prejuicio.
>
> **FILTRO 4 - Anacronismos:** p1 (aceptación inmediata) y p4 (presidenta) son anacrónicas. La Academia no admitiría mujeres hasta 1979, 68 años después.
>
> **Conclusión:** La predicción p2 es la única que reconcilia: (1) méritos excepcionales, (2) prejuicios institucionales de 1911, (3) personalidad perseverante de Marie, (4) realidad histórica verificable (fue rechazada 30-28, ganó segundo Nobel ese mismo año en Química)."

**Por qué es excelente:**
- ✓ Aplica 4 filtros de validación sistemáticamente
- ✓ Considera contexto histórico (instituciones conservadoras del s.XX)
- ✓ Evalúa coherencia con personalidad del personaje (perseverante, no se rinde)
- ✓ Detecta y descarta anacronismos (p4: presidenta en 1911)
- ✓ Reconoce tensión narrativa entre mérito y prejuicio como pista textual
- ✓ Conoce hecho histórico real (fue rechazada, luego ganó segundo Nobel)

---

**Scoring:**
- Predicción correcta = 100 puntos
- Razonamiento histórico demostrado
- Primer intento correcto

**Feedback del sistema:**
> "¡Excelente predicción histórica! Has considerado correctamente el contexto de discriminación de género en instituciones científicas de 1911, la personalidad perseverante de Marie, y evitaste anacronismos. Históricamente, Marie fue rechazada por la Academia por un voto (30-28). Irónicamente, ese mismo año ganó su segundo Nobel en Química, convirtiéndose en la primera persona en ganar dos premios Nobel. ✓ 100/100 puntos."

---

### ⚠️ RESPUESTA ACEPTABLE (65-79 puntos)

**Predicción incorrecta con razonamiento parcialmente válido**

**Respuesta seleccionada:** Opción p1 - "Fue aceptada inmediatamente con honores"

**Razonamiento erróneo del estudiante:**
> "Marie tenía méritos científicos excepcionales: ganó el Premio Nobel de Física en 1903 y aisló el radio puro. Una institución científica seria como la Academia de Ciencias Francesa debería reconocer el talento basándose en logros, no en género. Por lo tanto, lo más lógico es que fuera aceptada."

**Por qué es aceptable (pero con error):**
- ✓ Reconoce méritos excepcionales de Marie
- ✓ Aplica razonamiento lógico (méritos → reconocimiento)
- ✗ Ignora contexto histórico crítico (prejuicios de género de 1911)
- ✗ Juzga con valores modernos (meritocracia) en lugar de realidad histórica
- ✗ No considera que instituciones de 1911 NO eran meritocráticas con mujeres
- ⚠️ Razonamiento es válido en un mundo ideal, pero no en contexto histórico real

**Feedback del sistema (segundo intento):**
> "Tu razonamiento sobre los méritos de Marie es correcto, pero olvidas considerar el contexto histórico. En 1911, las instituciones científicas europeas eran profundamente conservadoras y discriminaban sistemáticamente a las mujeres, independientemente de sus logros. La Academia de Ciencias Francesa no admitiría a su primera mujer hasta 1979. Recuerda: predice lo que PROBABLEMENTE sucedió según las normas de la época, no lo que DEBERÍA haber sucedido según valores modernos. ⚠️ 65/100 puntos."

---

**Scoring después de corrección en segundo intento:**
- Primer intento: p1 (incorrecta) = 0 puntos
- Segundo intento: p2 (correcta) = 100 puntos
- Penalización por uso de pista (-15 ML Coins)
- Score final: 100 puntos (sin penalización en score, solo en economía)

---

### ❌ RESPUESTA INCORRECTA (0-49 puntos)

**Predicción anacrónica con razonamiento ahistórico**

**Respuesta seleccionada:** Opción p4 - "Fue elegida presidenta de la Academia"

**Razonamiento erróneo:**
> "Marie era la científica más brillante de su tiempo. Si la Academia la aceptaba, obviamente la harían presidenta para reconocer su genialidad."

**Por qué es incorrecta:**
- ✗ Completamente anacrónica (ignora que fue rechazada, no aceptada)
- ✗ No considera contexto histórico (Academia nunca había tenido mujeres miembros)
- ✗ Sobre-extrapola (de "presentar candidatura" a "ser presidenta" hay enorme salto)
- ✗ Ignora pistas textuales (contexto menciona "presentó candidatura", no "fue elegida presidenta")
- ✗ Confunde reconocimiento moderno de Marie con realidad histórica de 1911
- ✗ No aplica ningún filtro de plausibilidad histórica

**Problemas fundamentales:**
1. **Anacronismo extremo:** Proyecta valores y prácticas del s.XXI al año 1911
2. **Ignorancia del contexto:** No considera discriminación de género institucional
3. **Sobre-interpretación:** Inventa evento (presidencia) no sugerido por el texto
4. **Falta de conocimiento histórico:** No sabe que fue rechazada

---

**Scoring:**
- Primer intento: p4 (incorrecta) = 0 puntos
- Segundo intento: p3 (incorrecta) = 0 puntos
- Tercer intento: p1 (incorrecta) = 0 puntos
- Score final: 0 puntos, intentos agotados

**Feedback del sistema:**
> "Tus predicciones no consideran el contexto histórico de 1911. Recuerda:\n- En 1911, las mujeres enfrentaban discriminación sistemática en instituciones científicas\n- La Academia de Ciencias Francesa nunca había admitido mujeres (y no lo haría hasta 1979)\n- Marie era perseverante (no retiraría su candidatura)\n- Predecir que fue 'elegida presidenta' ignora completamente la realidad histórica\n\nLa respuesta correcta era p2: 'Fue rechazada por ser mujer, a pesar de sus logros'. Históricamente, fue rechazada por un voto (30-28). Ese mismo año ganó su segundo Nobel en Química. ❌ 0/100 puntos."

**Sugerencia pedagógica:**
> "Estrategia para predicciones históricas:\n1. Leer contexto histórico cuidadosamente (época, lugar, normas sociales)\n2. Aplicar filtros: ¿Es posible para la época? ¿Coherente con personalidad? ¿Históricamente plausible?\n3. Evitar juzgar con valores modernos\n4. Considerar prejuicios sociales de la época (género, clase, nacionalidad)"

---

### 🔑 Respuesta Correcta para Validación

```javascript
const correctPrediction = {
  "pred-1": "p2"  // Fue rechazada por ser mujer
};

const explanations = {
  "p1": "Anacrónico - ignora prejuicios de género de 1911",
  "p2": "✓ CORRECTO - Rechazada 30-28, luego ganó 2º Nobel",
  "p3": "Contradice personalidad perseverante de Marie",
  "p4": "Completamente anacrónico - Academia no admitió mujeres hasta 1979"
};
```

---

## EJERCICIO 2.4: PUZZLE DE CONTEXTO

**Tipo:** `puzzle_contexto`
**Dificultad:** Intermediate
**Tiempo estimado:** 15 minutos
**Puntos máximos:** 100
**Puntos de aprobación:** 70

### 📊 Configuración del Ejercicio

```json
{
  "dragAndDrop": true,
  "allowReordering": true,
  "showValidation": "onComplete"
}
```

### 🎯 Fragmentos a Ordenar

**Inferencia completa correcta:**
> "A pesar de las barreras sociales y económicas que enfrentó como mujer inmigrante, demostró una determinación extraordinaria, convirtiéndose en pionera de la ciencia moderna."

**Fragmentos desordenados:**
- **Fragmento A:** "demostró una determinación extraordinaria" (posición correcta: 2)
- **Fragmento B:** "A pesar de las barreras sociales y económicas" (posición correcta: 0)
- **Fragmento C:** "que enfrentó como mujer inmigrante" (posición correcta: 1)
- **Fragmento D:** "convirtiéndose en pionera de la ciencia moderna" (posición correcta: 3)

### 📐 Estructura Sintáctica de la Inferencia

```
[CONECTOR ADVERSATIVO] + [ESPECIFICACIÓN RELATIVA] + [ACCIÓN PRINCIPAL] + [RESULTADO GERUNDIO]
        ↓                          ↓                          ↓                      ↓
    Fragmento B              Fragmento C              Fragmento A            Fragmento D
   (posición 0)            (posición 1)            (posición 2)          (posición 3)
```

---

### ✅ RESPUESTA EXCELENTE (100 puntos)

**Orden perfecto con razonamiento sintáctico correcto**

```javascript
{
  "frag-b": 0,  // "A pesar de las barreras sociales y económicas"
  "frag-c": 1,  // "que enfrentó como mujer inmigrante"
  "frag-a": 2,  // "demostró una determinación extraordinaria"
  "frag-d": 3   // "convirtiéndose en pionera de la ciencia moderna"
}
```

**Razonamiento sintáctico esperado:**

#### Posición 0: Fragmento B - "A pesar de las barreras sociales y económicas"

**Justificación:**
> "Este fragmento debe ir primero porque:
> - Comienza con conector adversativo 'A pesar de' que típicamente inicia oraciones
> - Establece el contexto/obstáculo que será contrariado por la acción principal
> - Sintácticamente, 'A pesar de' requiere complemento (las barreras...) + cláusula principal después"

---

#### Posición 1: Fragmento C - "que enfrentó como mujer inmigrante"

**Justificación:**
> "Este fragmento debe ir segundo porque:
> - Comienza con pronombre relativo 'que' que REQUIERE antecedente inmediato
> - El antecedente es 'barreras' del fragmento B ('barreras... QUE enfrentó')
> - Especifica y amplía el tipo de barreras (como mujer inmigrante)
> - Sintácticamente, completa la cláusula subordinada iniciada en B"

---

#### Posición 2: Fragmento A - "demostró una determinación extraordinaria"

**Justificación:**
> "Este fragmento debe ir tercero porque:
> - Contiene el verbo principal de la oración ('demostró')
> - Sujeto implícito es Marie Curie (sujeto de toda la oración)
> - Completa la estructura adversativa: A pesar de X (fragmentos B+C), HIZO Y (fragmento A)
> - Contrasta con los obstáculos mencionados anteriormente"

---

#### Posición 3: Fragmento D - "convirtiéndose en pionera de la ciencia moderna"

**Justificación:**
> "Este fragmento debe ir último porque:
> - Gerundio 'convirtiéndose' indica consecuencia/resultado de la acción anterior
> - Sintácticamente, gerundios de resultado van al final de la oración
> - Expresa el desenlace final: obstáculos (B+C) → acción (A) → resultado (D)
> - Cierra la inferencia con el impacto/legado de Marie"

---

**Inferencia completa resultante:**
> "**A pesar de las barreras sociales y económicas** **que enfrentó como mujer inmigrante**, **demostró una determinación extraordinaria**, **convirtiéndose en pionera de la ciencia moderna**."

**Verificación de coherencia:**
- ✓ Gramática: Concordancia sujeto-verbo, uso correcto de pronombre relativo 'que', gerundio de resultado
- ✓ Semántica: Progresión lógica (obstáculos → respuesta → resultado)
- ✓ Sintaxis: Estructura adversativa completa (A pesar de X, Y, Z)
- ✓ Fluidez: La oración suena natural al leerla en voz alta

---

**Scoring:**
- 4/4 fragmentos en posición correcta = 100 puntos
- Razonamiento sintáctico demostrado
- Primer intento correcto

**Feedback del sistema:**
> "¡Perfecto! Has ordenado los fragmentos siguiendo la lógica sintáctica correcta: conector adversativo (A pesar de) → especificación relativa (que enfrentó) → verbo principal (demostró) → gerundio de resultado (convirtiéndose). La inferencia resultante es gramaticalmente correcta y semánticamente coherente. ✓ 100/100 puntos."

---

### ⚠️ RESPUESTA ACEPTABLE (65-79 puntos)

**Orden con 1 inversión menor**

```javascript
{
  "frag-b": 0,  // ✓ Correcto
  "frag-a": 1,  // ✗ ERROR: debería ser frag-c
  "frag-c": 2,  // ✗ ERROR: debería ser frag-a
  "frag-d": 3   // ✓ Correcto
}
```

**Inferencia resultante (incorrecta):**
> "A pesar de las barreras sociales y económicas **demostró una determinación extraordinaria** **que enfrentó como mujer inmigrante**, convirtiéndose en pionera de la ciencia moderna."
>
> ⚠️ **Error sintáctico:** "determinación extraordinaria que enfrentó" es incoherente. El pronombre relativo "que" se refiere a "determinación", lo cual no tiene sentido. Debería referirse a "barreras".

**Errores identificados:**
1. **Fragmentos A y C invertidos:** El pronombre relativo "que" en fragmento C necesita "barreras" como antecedente, no "determinación"
2. **Incoherencia semántica:** "demostró determinación que enfrentó" no es lógico

**Scoring:**
- 2/4 fragmentos en posición correcta (B, D) = 50 puntos
- Penalización por error sintáctico grave (-0, ya reflejado en score bajo)
- Segundo intento usado para corregir = 50 puntos (sin bonificación)

**Feedback del sistema:**
> "Casi correcto, pero hay un error sintáctico. El pronombre relativo 'que' en el fragmento C debe referirse a 'barreras' (del fragmento B), no a 'determinación' (del fragmento A). Lee la oración en voz alta: '...determinación extraordinaria que enfrentó como mujer inmigrante' no tiene sentido. Intenta: 'barreras... que enfrentó como mujer inmigrante'. ⚠️ 50/100 puntos."

---

**Orden correcto tras segundo intento:**
```javascript
{
  "frag-b": 0,
  "frag-c": 1,  // ✓ Corregido
  "frag-a": 2,  // ✓ Corregido
  "frag-d": 3
}
```

**Scoring final:** 100 puntos (tras corrección en segundo intento)

---

### ❌ RESPUESTA INCORRECTA (0-49 puntos)

**Orden completamente aleatorio**

```javascript
{
  "frag-d": 0,  // ✗ Gerundio al inicio (incorrecto)
  "frag-a": 1,  // ✗ Verbo principal sin contexto
  "frag-b": 2,  // ✗ Conector adversativo en medio
  "frag-c": 3   // ✗ Pronombre relativo sin antecedente
}
```

**Inferencia resultante (completamente incoherente):**
> "**Convirtiéndose en pionera de la ciencia moderna** **demostró una determinación extraordinaria** **a pesar de las barreras sociales y económicas** **que enfrentó como mujer inmigrante**."
>
> ❌ **Múltiples errores:**
> - Gerundio al inicio (no hay verbo principal que preceda)
> - "A pesar de" en medio (debería iniciar la estructura adversativa)
> - Pronombre "que" sin antecedente claro (¿se refiere a "económicas"? ¿a "barreras"?)

**Errores críticos:**
1. **No reconoce conectores de inicio:** "A pesar de" debe iniciar la oración
2. **No respeta dependencias sintácticas:** Pronombre "que" necesita antecedente inmediato
3. **Ignora reglas de gerundios:** Gerundios de resultado van al final, no al inicio
4. **No verifica coherencia:** La oración resultante no tiene sentido lógico

**Scoring:**
- 0/4 fragmentos en posición correcta = 0 puntos
- Tercer intento: orden aleatorio diferente = 0 puntos
- Intentos agotados

**Feedback del sistema:**
> "El orden de los fragmentos no es correcto. Recuerda las reglas sintácticas básicas:
> 1. Conectores como 'A pesar de' generalmente INICIAN la oración
> 2. Pronombres relativos ('que') REQUIEREN un antecedente inmediatamente antes
> 3. Gerundios de resultado ('convirtiéndose') van al FINAL de la oración
> 4. La estructura lógica es: Obstáculo (A pesar de...) → Acción (demostró...) → Resultado (convirtiéndose...)
>
> ❌ 0/100 puntos. Revisa las explicaciones y estudia la estructura sintáctica de oraciones adversativas."

---

### 🔑 Respuesta Correcta para Validación

```javascript
const correctOrder = {
  "frag-b": 0,  // "A pesar de las barreras sociales y económicas"
  "frag-c": 1,  // "que enfrentó como mujer inmigrante"
  "frag-a": 2,  // "demostró una determinación extraordinaria"
  "frag-d": 3   // "convirtiéndose en pionera de la ciencia moderna"
};

const completeInference = "A pesar de las barreras sociales y económicas que enfrentó como mujer inmigrante, demostró una determinación extraordinaria, convirtiéndose en pionera de la ciencia moderna.";
```

---

## EJERCICIO 2.5: RUEDA DE INFERENCIAS

**Tipo:** `rueda_inferencias`
**Dificultad:** Intermediate-Advanced
**Tiempo estimado:** 20 minutos
**Puntos máximos:** 100
**Puntos de aprobación:** 75

### 📊 Configuración del Ejercicio

```json
{
  "wheelAnimation": true,
  "showTimer": true,
  "allowSkip": false
}
```

### 🎯 Mecánica del Ejercicio

1. **Girar la ruleta:** Selecciona aleatoriamente una categoría de inferencia (Literal, Inferencial, Crítico, Creativo)
2. **Fragmento asignado:** Sistema muestra uno de 3 fragmentos sobre Marie Curie
3. **Tiempo límite:** 30 segundos para escribir inferencia
4. **Validación:** Sistema evalúa usando keywords esperados para esa categoría

### 📖 Fragmentos Disponibles

#### FRAGMENTO 1: Logros de Marie

> "Marie Curie fue pionera en el estudio de la radiactividad, convirtiéndose en la primera mujer en ganar un Premio Nobel y la única persona en ganar en dos campos científicos diferentes."

#### FRAGMENTO 2: Discriminación y Persistencia

> "A pesar de enfrentar discriminación por ser mujer en un campo dominado por hombres, Marie persistió en su investigación, trabajando en condiciones difíciles en un laboratorio improvisado."

#### FRAGMENTO 3: Cuadernos Radiactivos

> "Los cuadernos de Marie Curie todavía son radiactivos y se guardan en cajas especiales de plomo. Las personas que quieren consultarlos deben firmar un descargo de responsabilidad."

---

### ✅ RESPUESTAS EXCELENTES (25-30 puntos cada una)

#### Fragmento 1 + Categoría LITERAL (20 puntos esperados)

**Inferencia ejemplo:**
> "Marie fue la primera mujer en ganar un Nobel y la única persona en ganar en dos campos científicos diferentes: Física (1903) y Química (1911)."

**Análisis de calidad:**
- ✓ **Identifica hechos explícitos:** "primera mujer", "dos campos", "única persona"
- ✓ **Usa keywords esperados:** "primera", "mujer", "nobel", "científico", "campos"
- ✓ **No infiere:** Se limita a reformular información explícita del texto
- ✓ **Precisión:** Agrega fechas correctas (1903, 1911) demostrando conocimiento

**Scoring:** 20/20 puntos (categoría Literal)

---

#### Fragmento 1 + Categoría INFERENCIAL (25 puntos esperados)

**Inferencia ejemplo:**
> "El hecho de ganar Nobeles en dos campos diferentes (Física y Química) sugiere que Marie tenía conocimientos interdisciplinarios excepcionales y una capacidad única de aplicar principios físicos a problemas químicos, lo que era extremadamente raro en su época."

**Análisis de calidad:**
- ✓ **Va más allá de lo explícito:** No solo dice "ganó dos Nobeles", sino que DEDUCE qué implica esto
- ✓ **Usa keywords inferencial:** "sugiere", "implica", "excepcional", "interdisciplinario", "capacidad"
- ✓ **Aplica conocimiento previo:** Reconoce que especialización dual era rara
- ✓ **Establece conexiones:** Física + Química = conocimiento interdisciplinario

**Scoring:** 25/25 puntos (categoría Inferencial)

---

#### Fragmento 1 + Categoría CRÍTICO (30 puntos esperados)

**Inferencia ejemplo:**
> "Ganar dos Nobeles en una época de discriminación estructural contra mujeres en ciencia (principios s.XX) no solo demuestra talento excepcional, sino también resiliencia extraordinaria para superar barreras sistemáticas que otros científicos masculinos no enfrentaban. Esto significa que sus logros son aún más notables considerando el contexto histórico de exclusión."

**Análisis de calidad:**
- ✓ **Evalúa críticamente:** No solo describe, sino que ANALIZA el significado profundo
- ✓ **Usa keywords crítico:** "significa", "considerar", "contexto", "barreras", "estructural", "histórico"
- ✓ **Perspectiva crítica:** Compara condiciones de Marie vs. científicos masculinos
- ✓ **Juicio fundamentado:** "Más notables" está justificado por análisis de contexto

**Scoring:** 30/30 puntos (categoría Crítico)

---

#### Fragmento 1 + Categoría CREATIVO (25 puntos esperados)

**Inferencia ejemplo:**
> "Si Marie hubiera tenido acceso a tecnología moderna (aceleradores de partículas, técnicas de espectroscopia avanzada), podría haber descubierto aplicaciones médicas de la radiactividad décadas antes. Imagino que habría sido pionera en medicina nuclear, desarrollando tratamientos contra el cáncer basados en isótopos radiactivos mucho antes de los años 1950s."

**Análisis de calidad:**
- ✓ **Genera ideas originales:** Pensamiento contrafactual ("si hubiera tenido...")
- ✓ **Usa keywords creativo:** "imaginar", "si", "podría", "futuro", "aplicar", "innovar"
- ✓ **Conecta con presente/futuro:** Relaciona descubrimientos históricos con medicina moderna
- ✓ **Creatividad fundamentada:** No es fantasía pura, sino extrapolación razonable

**Scoring:** 25/25 puntos (categoría Creativo)

---

#### Fragmento 2 + Categoría INFERENCIAL (25 puntos esperados)

**Inferencia ejemplo:**
> "Su persistencia a pesar de la discriminación y condiciones difíciles demuestra una motivación intrínseca profunda y determinación extraordinaria. Esto sugiere que Marie estaba impulsada por pasión genuina por la ciencia, no por reconocimiento externo, ya que trabajó en condiciones adversas que habrían desanimado a alguien motivado solo por fama."

**Análisis de calidad:**
- ✓ **Deduce motivación:** Infiere causas internas (pasión) de comportamiento observado (persistencia)
- ✓ **Keywords inferencial:** "demuestra", "sugiere", "determinación", "motivación", "impulsada"
- ✓ **Razonamiento lógico:** Condiciones adversas + persistencia = motivación intrínseca
- ✓ **Contraste:** Compara motivación intrínseca vs. extrínseca

**Scoring:** 25/25 puntos

---

#### Fragmento 3 + Categoría INFERENCIAL (25 puntos esperados)

**Inferencia ejemplo:**
> "Que los cuadernos sigan radiactivos más de 100 años después indica que la vida media del radio-226 es extremadamente larga (1,600 años). Esto también sugiere que Marie estuvo expuesta a niveles peligrosos de radiación durante décadas, ya que todo lo que tocaba (cuadernos, ropa, herramientas) se contaminaba permanentemente."

**Análisis de calidad:**
- ✓ **Infiere propiedades físicas:** De "todavía radiactivos" deduce vida media prolongada
- ✓ **Keywords inferencial:** "indica", "sugiere", "implica", "consecuencias", "exposición"
- ✓ **Conexión causa-efecto:** Cuadernos radiactivos → Marie expuesta crónicamente
- ✓ **Conocimiento científico:** Menciona vida media del radio-226 correctamente

**Scoring:** 25/25 puntos

---

#### Fragmento 3 + Categoría CRÍTICO (30 puntos esperados)

**Inferencia ejemplo:**
> "Los cuadernos radiactivos son evidencia tangible del precio personal que Marie pagó por avanzar la ciencia sin conocer los riesgos de la radiación. Esto nos obliga a reflexionar sobre las consecuencias imprevistas del progreso científico: cada avance puede tener costos humanos que solo se revelan décadas después. Críticamente, esto también cuestiona la responsabilidad de las instituciones científicas de proteger a sus investigadores, incluso cuando los riesgos no son totalmente comprendidos."

**Análisis de calidad:**
- ✓ **Análisis crítico profundo:** Evalúa significado ético y social del hecho
- ✓ **Keywords crítico:** "evidencia", "reflexionar", "consecuencias", "cuestiona", "responsabilidad"
- ✓ **Perspectiva ética:** Considera precio humano del progreso científico
- ✓ **Dimensión institucional:** Analiza responsabilidad de instituciones

**Scoring:** 30/30 puntos

---

### ⚠️ RESPUESTAS ACEPTABLES (15-24 puntos)

#### Fragmento 1 + Categoría INFERENCIAL (parcial)

**Inferencia ejemplo:**
> "Marie ganó dos Nobeles, lo que muestra que era muy talentosa."

**Análisis de calidad:**
- ✓ **Intenta inferir:** "muestra que era talentosa" es una deducción básica
- ⚠️ **Keywords limitados:** Solo "muestra" (inferencial básico), falta "sugiere", "implica", "excepcional"
- ✗ **Poco desarrollada:** No explica QUÉ tipo de talento (interdisciplinario)
- ✗ **No profundiza:** No menciona rareza histórica de logro dual

**Scoring:** 18/25 puntos (aceptable pero básico)

**Feedback:**
> "Buena inferencia básica. Para mejorar: ¿Qué TIPO de talento sugiere ganar en dos campos diferentes? ¿Por qué es excepcional?"

---

#### Fragmento 3 + Categoría CRÍTICO (parcial)

**Inferencia ejemplo:**
> "Los cuadernos radiactivos muestran que Marie trabajó con materiales peligrosos. Esto es importante para la historia de la ciencia."

**Análisis de calidad:**
- ✓ **Identifica relevancia:** Reconoce importancia histórica
- ⚠️ **Keywords mínimos:** Solo "importante" (crítico muy básico)
- ✗ **No analiza:** No evalúa QUÉ significa o QUÉ cuestiona
- ✗ **No contextualiza:** No menciona conocimiento limitado de la época
- ✗ **Superficial:** No profundiza en dimensiones éticas, sociales o científicas

**Scoring:** 16/30 puntos (aceptable pero superficial)

**Feedback:**
> "Reconoces la importancia, pero falta análisis crítico. ¿Qué SIGNIFICA que los cuadernos sigan radiactivos? ¿Qué nos dice sobre el precio del progreso científico? ¿Qué responsabilidades tenían las instituciones?"

---

### ❌ RESPUESTAS INCORRECTAS (0-14 puntos)

#### Fragmento 1 + Categoría INFERENCIAL (error)

**Inferencia ejemplo:**
> "Marie Curie fue la primera mujer en ganar un Premio Nobel."

**Análisis de problemas:**
- ✗ **No es inferencia:** Solo repite información explícita del texto
- ✗ **Es respuesta LITERAL:** Debería estar en categoría Literal, no Inferencial
- ✗ **No deduce nada nuevo:** No va más allá del texto
- ✗ **Keywords incorrectos:** No usa "sugiere", "implica", "deducir", etc.

**Scoring:** 5/25 puntos (confunde categorías)

**Feedback:**
> "Esta es una respuesta LITERAL (reformula lo explícito), no INFERENCIAL (deduce lo implícito). Para categoría Inferencial, debes ir MÁS ALLÁ del texto. ¿Qué IMPLICA o SUGIERE el hecho de ganar dos Nobeles? ❌ 5/25 puntos."

---

#### Fragmento 2 + Categoría CREATIVO (fuera de tema)

**Inferencia ejemplo:**
> "Marie era muy inteligente y trabajadora."

**Análisis de problemas:**
- ✗ **No es creativo:** No genera ideas nuevas ni relaciona con presente/futuro
- ✗ **Es respuesta LITERAL básica:** Solo describe características obvias
- ✗ **No usa imaginación:** No hay pensamiento "si...", "podría...", "imaginar..."
- ✗ **Keywords ausentes:** No hay "futuro", "aplicar", "relacionar", "innovar"

**Scoring:** 3/25 puntos (categoría completamente incorrecta)

**Feedback:**
> "Esto es una descripción literal, no una idea creativa. Para categoría Creativo, debes: (1) Imaginar escenarios alternativos ('¿Qué si Marie hubiera...?'), (2) Relacionar con presente/futuro, (3) Generar aplicaciones innovadoras. ❌ 3/25 puntos."

---

#### Fragmento 3 + Categoría CRÍTICO (sin análisis)

**Inferencia ejemplo:**
> "Los cuadernos están en cajas de plomo porque son radiactivos."

**Análisis de problemas:**
- ✗ **No es crítico:** No analiza, evalúa ni cuestiona nada
- ✗ **Es respuesta LITERAL:** Solo reformula información explícita
- ✗ **No hay juicio:** No evalúa significado, implicaciones o consecuencias
- ✗ **Keywords ausentes:** No hay "analizar", "evaluar", "significa", "consecuencias", "cuestiona"

**Scoring:** 2/30 puntos (categoría incorrecta + sin contenido crítico)

**Feedback:**
> "Esto solo describe un hecho, no lo analiza críticamente. Para categoría Crítico, debes EVALUAR y CUESTIONAR. ¿Qué SIGNIFICA que estén radiactivos 100 años después? ¿Qué consecuencias tuvo para Marie? ¿Qué responsabilidades implica? ❌ 2/30 puntos."

---

### 🔑 Keywords Esperados por Categoría

#### Categoría LITERAL
```javascript
{
  keywords: ["pionera", "radiactividad", "nobel", "primera", "mujer", "científico", "premio", "campos", "única"],
  description: "Identifica hechos explícitos del texto",
  points: 20
}
```

#### Categoría INFERENCIAL
```javascript
{
  keywords: ["impacto", "importancia", "consecuencia", "implica", "deducir", "sugiere", "interdisciplinario", "excepcional", "destacada", "determinación"],
  description: "Deduce información no explícita basándose en pistas",
  points: 25
}
```

#### Categoría CRÍTICO
```javascript
{
  keywords: ["evaluar", "analizar", "considerar", "perspectiva", "contexto", "significa", "barreras", "histórico", "estructural", "consecuencias", "responsabilidad"],
  description: "Analiza y evalúa críticamente el contenido",
  points: 30
}
```

#### Categoría CREATIVO
```javascript
{
  keywords: ["imaginar", "si", "podría", "nuevo", "relacionar", "aplicar", "innovar", "futuro", "actual", "inspirar", "modelo"],
  description: "Genera ideas originales relacionadas con el texto",
  points: 25
}
```

---

## 📊 CASOS DE USO

### 1. Testing QA del Módulo 2

**Objetivo:** Validar que el backend evalúa correctamente inferencias de diferentes calidades

**Escenarios de prueba:**

#### Test Case 2.1: Detective Textual - Todas correctas
```json
{
  "exerciseId": "uuid-detective-textual",
  "answers": {
    "q1": 1,  // Cuadernos brillaban: contaminación radiactiva
    "q2": 1,  // Seguridad: inadecuada y peligrosa
    "q3": 1,  // Síntomas: causados por radiación
    "q4": 1   // Motivación: ayudar a humanidad
  }
}
```
**Respuesta esperada:**
```json
{
  "score": 100,
  "passed": true,
  "feedback": "¡Excelente trabajo detective!...",
  "inferenceTypes": ["causa_efecto", "contexto_situacional", "causa_efecto", "motivacion"]
}
```

#### Test Case 2.2: Causa-Efecto - Error en emparejamiento
```json
{
  "exerciseId": "uuid-causa-efecto",
  "answers": {
    "c1": ["e1", "e2", "e4"],  // Error: e4 no pertenece a c1
    "c2": ["e5", "e6"]
  }
}
```
**Respuesta esperada:**
```json
{
  "score": 66,
  "passed": false,
  "feedback": "Buen intento. 'Demostrar independencia científica' NO es consecuencia de no patentar...",
  "errors": {
    "c1": "e4 no es consecuencia de no patentar",
    "c1_missing": "e3 falta"
  }
}
```

#### Test Case 2.5: Rueda Inferencias - Respuesta literal en categoría inferencial
```json
{
  "exerciseId": "uuid-rueda-inferencias",
  "fragmentId": "frag-1",
  "category": "cat-inferencial",
  "userInference": "Marie fue la primera mujer en ganar un Premio Nobel.",
  "timeSpent": 15
}
```
**Respuesta esperada:**
```json
{
  "score": 5,
  "passed": false,
  "feedback": "Esta es una respuesta LITERAL (reformula lo explícito), no INFERENCIAL...",
  "keywordsFound": 0,
  "keywordsExpected": 2,
  "categoryMismatch": true
}
```

---

### 2. Desarrollo Frontend - Componentes de Respuesta Abierta

**Componente:** `RuedaInferenciasExercise.tsx`

```typescript
interface InferenceResponse {
  fragmentId: string;
  category: 'cat-literal' | 'cat-inferencial' | 'cat-critico' | 'cat-creativo';
  userText: string;
  timeSpent: number;
}

// Test data para desarrollo
const testDataExcelente: InferenceResponse = {
  fragmentId: "frag-1",
  category: "cat-inferencial",
  userText: "El hecho de ganar Nobeles en dos campos diferentes sugiere que Marie tenía conocimientos interdisciplinarios excepcionales...",
  timeSpent: 25
};

const testDataIncorrecta: InferenceResponse = {
  fragmentId: "frag-1",
  category: "cat-inferencial",
  userText: "Marie fue la primera mujer en ganar un Nobel.",  // Literal, no inferencial
  timeSpent: 10
};
```

---

### 3. Entrenamiento de Maestros

**Sección: Interpretación de Inferencias Estudiantiles**

| Tipo Inferencia | Calidad Alta | Calidad Media | Calidad Baja |
|-----------------|--------------|---------------|--------------|
| **Causa-Efecto** | Identifica mecanismo causal ("radio → daño → anemia") | Identifica relación ("trabajó con radio y tuvo anemia") | Confunde correlación con causa ("radio y anemia sucedieron") |
| **Contextual** | Evalúa múltiples factores (ventilación + tubos + horas) | Identifica 1-2 factores (mal ventilado) | No considera contexto (no menciona condiciones) |
| **Motivacional** | Infiere valores internos (altruismo, pasión) + evidencia | Identifica motivación básica ("quería ayudar") | Adivina sin evidencia ("por fama") |
| **Predictiva** | Aplica 4 filtros (época, personalidad, historia, anacronismos) | Aplica 1-2 filtros (solo méritos o solo época) | Ignora contexto histórico completamente |

---

## 📚 REFERENCIAS

### Fuente de Verdad
- **Seeds PROD:** `apps/database/seeds/prod/educational_content/03-exercises-module2.sql`
- **Documento de Diseño:** `docs/00-vision-general/DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md`
- **Modelo Cassany:** Nivel 2 - Comprensión Inferencial

### Validadores Backend
- `apps/database/ddl/schemas/educational_content/functions/06-validate_detective_textual.sql`
- `apps/database/ddl/schemas/educational_content/functions/07-validate_construccion_hipotesis.sql`
- `apps/database/ddl/schemas/educational_content/functions/08-validate_prediccion_narrativa.sql`
- `apps/database/ddl/schemas/educational_content/functions/09-validate_puzzle_contexto.sql`
- `apps/database/ddl/schemas/educational_content/functions/10-validate_rueda_inferencias.sql`

---

## 🎓 CONCLUSIÓN

Esta guía proporciona **ejemplos exhaustivos** de respuestas inferenciales en 3 niveles de calidad para todos los ejercicios del Módulo 2. Úsala para:

✅ **QA:** Validar evaluación de inferencias de diferentes calidades
✅ **Desarrollo:** Implementar validación de respuestas abiertas con NLP básico
✅ **Demos:** Mostrar ejercicios de pensamiento inferencial a stakeholders
✅ **Entrenamiento:** Capacitar maestros en evaluación de comprensión inferencial
✅ **Testing API:** Verificar endpoints de validación de texto libre

**Próximos pasos:** Revisar GUIA-PRUEBAS-MODULO3 para comprensión crítica y valorativa.

---

**Documento generado:** 2025-11-23
**Autor:** Architecture-Analyst
**Versión:** 1.0
**Estado:** ✅ Listo para uso en QA, desarrollo y demos
