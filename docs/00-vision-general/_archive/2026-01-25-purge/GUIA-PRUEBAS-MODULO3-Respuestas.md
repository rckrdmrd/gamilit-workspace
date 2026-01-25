# Guía de Pruebas - Módulo 3: Comprensión Crítica y Valorativa

**Versión:** 1.0.0
**Fecha:** 2025-11-24
**Módulo:** MOD-03-CRITICA
**Propósito:** Testing QA, demos pedagógicas, validación de ejercicios

---

## Índice

1. [Ejercicio 3.1: Tribunal de Opiniones](#ejercicio-31-tribunal-de-opiniones)
2. [Ejercicio 3.2: Debate Digital](#ejercicio-32-debate-digital)
3. [Ejercicio 3.3: Análisis de Fuentes](#ejercicio-33-análisis-de-fuentes)
4. [Ejercicio 3.4: Podcast Argumentativo](#ejercicio-34-podcast-argumentativo)
5. [Ejercicio 3.5: Matriz de Perspectivas](#ejercicio-35-matriz-de-perspectivas)
6. [Matriz de Cobertura de Pruebas](#matriz-de-cobertura-de-pruebas)
7. [Gaps y Limitaciones Conocidas](#gaps-y-limitaciones-conocidas)

---

## Ejercicio 3.1: Tribunal de Opiniones

**Tipo:** `tribunal_opiniones`
**Order Index:** 1
**Dificultad:** Advanced
**Puntos Máximos:** 100 | **Passing Score:** 70

### Descripción

Analiza afirmaciones sobre Marie Curie. Clasifica cada una como **HECHO**, **OPINIÓN** o **INTERPRETACIÓN**, y determina si está bien fundamentada.

### Respuestas Correctas

| ID | Afirmación | Tipo Correcto | Veredicto | Explicación |
|----|-----------|---------------|-----------|-------------|
| `stmt-1` | "Marie Curie murió el 4 de julio de 1934 a causa de anemia aplásica." | **HECHO** | ✅ Bien fundamentada | Dato histórico verificable en registros oficiales de defunción y médicos. |
| `stmt-2` | "Marie Curie fue la científica más brillante del siglo XX." | **OPINIÓN** | ❌ Sin fundamento | Juicio de valor subjetivo. "Más brillante" no es medible objetivamente y depende de criterios personales. |
| `stmt-3` | "La exposición prolongada al radio contribuyó a la enfermedad que causó la muerte de Marie Curie." | **INTERPRETACIÓN** | ✅ Bien fundamentada | Deducción razonable basada en evidencia médica. Su anemia aplásica es consistente con exposición prolongada a radiación. |
| `stmt-4` | "Marie Curie ganó dos Premios Nobel: uno en Física (1903) y otro en Química (1911)." | **HECHO** | ✅ Bien fundamentada | Dato verificable en registros oficiales de la Fundación Nobel. |
| `stmt-5` | "Pierre Curie merecía más crédito que Marie por el descubrimiento del radio." | **OPINIÓN** | ❌ Sin fundamento | Opinión sin evidencia que la respalde. Los registros muestran contribuciones iguales o superiores de Marie. |
| `stmt-6` | "Si Marie Curie no hubiera emigrado a Francia, probablemente no habría logrado sus descubrimientos." | **INTERPRETACIÓN** | ⚠️ Parcialmente fundamentada | Interpretación con algo de base (Francia ofrecía mejores oportunidades), pero especulativa sobre alternativas. |
| `stmt-7` | "Marie Curie fue la primera mujer en recibir un Premio Nobel." | **HECHO** | ✅ Bien fundamentada | Dato histórico verificable. Marie recibió el Nobel de Física en 1903, siendo la primera mujer. |
| `stmt-8` | "La decisión de Marie de no patentar el proceso de aislamiento del radio fue ingenua e irresponsable." | **OPINIÓN** | ❌ Sin fundamento | Juicio de valor con lenguaje peyorativo (ingenua, irresponsable). Su decisión fue ética y deliberada. |

### Sistema de Puntuación

```
Por cada afirmación (8 total):
- Tipo correcto: +5 puntos
- Veredicto correcto: +10 puntos
- Justificación buena: +5 puntos (mínimo 30 caracteres)
- Total por afirmación: 20 puntos

Puntuación máxima: 160 puntos (escalado a 100)
Passing score: 70%
```

### Ejemplo de Respuesta JSON para Testing

```json
{
  "evaluations": [
    {
      "statementId": "stmt-1",
      "classification": "hecho",
      "verdict": "bien_fundamentada",
      "justification": "Dato verificable en registros oficiales de defunción."
    },
    {
      "statementId": "stmt-2",
      "classification": "opinion",
      "verdict": "sin_fundamento",
      "justification": "Juicio subjetivo sin criterios objetivos de medición."
    },
    {
      "statementId": "stmt-3",
      "classification": "interpretacion",
      "verdict": "bien_fundamentada",
      "justification": "Deducción médica razonable basada en síntomas y exposición documentada."
    },
    {
      "statementId": "stmt-4",
      "classification": "hecho",
      "verdict": "bien_fundamentada",
      "justification": "Registros oficiales de la Fundación Nobel lo confirman."
    },
    {
      "statementId": "stmt-5",
      "classification": "opinion",
      "verdict": "sin_fundamento",
      "justification": "Sin evidencia histórica que respalde esta afirmación."
    },
    {
      "statementId": "stmt-6",
      "classification": "interpretacion",
      "verdict": "parcialmente_fundamentada",
      "justification": "Base razonable pero especulativo sobre alternativas históricas."
    },
    {
      "statementId": "stmt-7",
      "classification": "hecho",
      "verdict": "bien_fundamentada",
      "justification": "Dato histórico verificable en registros del Nobel 1903."
    },
    {
      "statementId": "stmt-8",
      "classification": "opinion",
      "verdict": "sin_fundamento",
      "justification": "Lenguaje peyorativo sin evidencia. Decisión ética deliberada."
    }
  ]
}
```

---

## Ejercicio 3.2: Debate Digital

**Tipo:** `debate_digital`
**Order Index:** 2
**Dificultad:** Advanced
**Puntos Máximos:** 100 | **Passing Score:** 70

### Descripción

Participa en un debate estructurado sobre: **"¿La fama afectó negativamente la investigación de Marie Curie?"**

### Características Especiales

> **IMPORTANTE:** Este ejercicio NO tiene respuesta única correcta. Se evalúa la calidad de la argumentación, no la postura elegida.

### Estructura del Debate

```
Tiempo total: 10 minutos (600 segundos)

Fase 1: Preparación (3 min)
- Recibir postura asignada aleatoriamente
- Leer fuentes disponibles
- Preparar 3 argumentos principales

Fase 2: Debate (6 min)
- Apertura (1 min): Presentar postura
- Desarrollo (2 min): Exponer argumentos
- Réplica (2 min): Responder contraargumentos
- Contra-réplica (1 min): Defender posición

Fase 3: Cierre (1 min)
- Conclusión + votación
```

### Argumentos de Referencia

#### Postura: A FAVOR (La fama afectó negativamente)

| ID | Argumento | Evidencia | Fortaleza |
|----|-----------|-----------|-----------|
| `arg1-1` | Invasión de privacidad que interrumpía su trabajo científico | El escándalo tras la muerte de Pierre en 1911 causó acoso periodístico constante frente a su casa | Muy fuerte |
| `arg1-2` | Tiempo perdido en eventos y ceremonias obligatorias | Múltiples ceremonias de premiación, conferencias y eventos sociales que le restaban tiempo de laboratorio | Fuerte |
| `arg1-3` | Presión mediática que afectó su salud mental | Acoso periodístico documentado durante el escándalo Langevin; cartas amenazantes; tuvo que refugiarse en casa de amigos | Fuerte |

**Contraargumentos a anticipar:**
- La fama le dio acceso a mejores recursos y financiación
- El reconocimiento validó su trabajo ante escépticos
- Las colaboraciones internacionales enriquecieron su investigación

#### Postura: EN CONTRA (La fama benefició su investigación)

| ID | Argumento | Evidencia | Fortaleza |
|----|-----------|-----------|-----------|
| `arg2-1` | Mayor financiación para su laboratorio e investigación | Laboratorio mejorado significativamente después del Nobel; pudo contratar asistentes y adquirir equipos | Muy fuerte |
| `arg2-2` | Reconocimiento institucional que abrió puertas | Primera mujer profesora en la Sorbona (1906); acceso a instituciones antes vedadas | Fuerte |
| `arg2-3` | Colaboraciones internacionales y mejores recursos | Apoyo gubernamental francés; donaciones de instituciones americanas; red global de científicos colaboradores | Fuerte |
| `arg2-4` | Plataforma para promover la ciencia y mujeres en STEM | Su fama inspiró a generaciones de mujeres científicas; usó su visibilidad para promover la ciencia | Media |

**Contraargumentos a anticipar:**
- El acoso mediático interrumpía constantemente su trabajo
- Los eventos sociales consumían tiempo valioso
- La presión pública afectó su bienestar personal

### Rúbrica de Evaluación

| Criterio | Peso | Descripción |
|----------|------|-------------|
| Claridad | 20% | Argumentos claros y bien estructurados |
| Evidencia | 30% | Uso de evidencias históricas verificables |
| Lógica | 25% | Coherencia lógica del razonamiento |
| Contraargumentos | 25% | Anticipación y refutación de contraargumentos |

### Ejemplo de Respuesta JSON para Testing

```json
{
  "position": "a_favor",
  "response": "La fama de Marie Curie, aunque trajo reconocimiento, tuvo un impacto negativo significativo en su investigación científica. En primer lugar, la invasión constante de su privacidad tras el escándalo Langevin de 1911 interrumpió su trabajo de laboratorio, obligándola a refugiarse en casa de amigos para escapar del acoso periodístico. Además, las múltiples ceremonias y eventos obligatorios consumían tiempo valioso que podría haber dedicado a sus investigaciones sobre radiactividad. Por último, la presión mediática afectó su salud mental y bienestar, documentado en las cartas amenazantes que recibía. Si bien es cierto que la fama le proporcionó mayor financiación, el costo personal y profesional superó estos beneficios.",
  "arguments": [
    "Invasión de privacidad documentada durante escándalo Langevin",
    "Tiempo perdido en ceremonias y eventos obligatorios",
    "Impacto negativo en salud mental por presión mediática"
  ]
}
```

---

## Ejercicio 3.3: Análisis de Fuentes

**Tipo:** `analisis_fuentes`
**Order Index:** 3
**Dificultad:** Advanced
**Puntos Máximos:** 100 | **Passing Score:** 70

### Descripción

Analiza 5 fuentes sobre Marie Curie y ordénalas según su credibilidad (de más a menos confiable) aplicando el método CRAAP.

### Fuentes Disponibles

| ID | Título | Autor | Institución | Fecha | Tipo | Credibilidad |
|----|--------|-------|-------------|-------|------|--------------|
| `src1` | "Marie Curie and the Science of Radioactivity" | Dr. Naomi Pasachoff (historiadora de ciencia) | American Institute of Physics | 2020 | Artículo académico revisado por pares | 95/100 - Muy Alta |
| `src2` | "Mujeres en la Ciencia: Marie Curie" | Blog personal anónimo | N/A | 2023 | Blog personal no verificado | 15/100 - Muy Baja |
| `src3` | "Madame Curie: A Biography" | Eve Curie (hija de Marie) | Editorial Heinemann | 1937 | Biografía escrita por familiar | 75/100 - Alta (con sesgo potencial) |
| `src4` | "Artículo de periódico sensacionalista" | Reporter desconocido | Le Petit Journal | 1911 | Prensa amarillista de época | 25/100 - Baja |
| `src5` | "Nobel Lectures: Physics 1901-1921" | Nobel Foundation | Nobel Foundation | 1967 (documentos de 1903) | Fuente primaria oficial | 100/100 - Máxima |

### Respuesta Correcta: Orden de Credibilidad

```
1º (Más confiable):    src5 - Nobel Foundation (fuente primaria oficial)
2º:                    src1 - Artículo académico revisado por pares
3º:                    src3 - Biografía familiar (alta pero con sesgo afectivo)
4º:                    src4 - Prensa sensacionalista (baja credibilidad)
5º (Menos confiable):  src2 - Blog anónimo sin fuentes (muy baja credibilidad)
```

### Justificación del Ranking

| Posición | ID | Razón |
|----------|-----|-------|
| 1 | `src5` | **Fuente primaria oficial**: Documentos originales de institución reconocida mundialmente (Nobel Foundation). Máxima credibilidad académica. |
| 2 | `src1` | **Artículo académico**: Historiadora reconocida, revisión por pares, más de 50 fuentes citadas, institución prestigiosa (AIP). |
| 3 | `src3` | **Biografía familiar**: Eve Curie es fuente primaria valiosa con acceso único, pero tiene sesgo afectivo natural como hija. Alta credibilidad con reservas. |
| 4 | `src4` | **Prensa sensacionalista**: Reporter desconocido, lenguaje emotivo ("Escándalo"), enfoque en chismes sobre Nobel. Valor histórico limitado. |
| 5 | `src2` | **Blog anónimo**: Sin autor identificable, sin fuentes citadas, afirmaciones sin evidencia ("Pierre hizo todo el trabajo"). No usar en contextos académicos. |

### Método CRAAP Aplicado

```
CRAAP = Currency, Relevance, Authority, Accuracy, Purpose

src5 (Nobel Foundation):
- Currency: ✅ Documentos históricos originales (máximo valor)
- Relevance: ✅ Directamente sobre Marie Curie
- Authority: ✅ Institución Nobel (máxima autoridad)
- Accuracy: ✅ Documentos primarios verificables
- Purpose: ✅ Registro histórico oficial
TOTAL: 25/25 puntos

src2 (Blog anónimo):
- Currency: ⚠️ 2023 pero sin fecha específica
- Relevance: ✅ Trata sobre Marie
- Authority: ❌ Autor anónimo, sin credenciales
- Accuracy: ❌ Sin fuentes citadas
- Purpose: ❌ Propósito cuestionable, afirmaciones falsas
TOTAL: 5/25 puntos
```

### Ejemplo de Respuesta JSON para Testing

```json
{
  "ranking": ["src5", "src1", "src3", "src4", "src2"]
}
```

---

## Ejercicio 3.4: Podcast Argumentativo

**Tipo:** `podcast_argumentativo`
**Order Index:** 4
**Dificultad:** Advanced
**Puntos Máximos:** 100 | **Passing Score:** 70

### Descripción

Crea un podcast de **2 minutos** (120 segundos) argumentando sobre un dilema ético en la vida de Marie Curie.

### Características Especiales

> **IMPORTANTE:** Este ejercicio acepta audio grabado O guión escrito. La evaluación es por rúbrica, no hay respuesta única correcta.

### Topics Disponibles

#### Topic 1: Sacrificio Personal vs Bienestar Familiar
**Pregunta:** Marie dedicó tanto tiempo al laboratorio que descuidó su salud y tiempo familiar. ¿Fue justificado este sacrificio?

**Puntos clave a abordar:**
- Impacto en sus hijas (Irène y Ève)
- Riesgos de salud ignorados (exposición a radiación)
- Magnitud de sus contribuciones científicas

#### Topic 2: Patentes vs Ciencia Abierta
**Pregunta:** ¿Fue correcto que los Curie no patentaran sus descubrimientos a pesar de su pobreza?

**Puntos clave a abordar:**
- Beneficio para la humanidad (medicina, investigación)
- Derechos de los inventores
- Impacto en desarrollo médico (tratamiento del cáncer)

#### Topic 3: Responsabilidad del Científico
**Pregunta:** ¿Tenía Marie responsabilidad por los usos bélicos posteriores de la radiactividad?

**Puntos clave a abordar:**
- Armas nucleares desarrolladas posteriormente
- Intención vs consecuencias
- Responsabilidad del conocimiento científico

### Estructura Requerida

```
INTRODUCCIÓN (30 segundos):
- Hook: Pregunta provocadora o dato sorprendente
- Tesis: Declaración clara de tu postura

DESARROLLO (60 segundos):
- Argumento 1 con evidencia (20s)
- Argumento 2 con evidencia (20s)
- Argumento 3 con evidencia (20s)

CONCLUSIÓN (30 segundos):
- Síntesis de puntos principales
- Reflexión final / llamada a la acción
```

### Ejemplo de Guión para Testing (Topic 1)

```
[INTRODUCCIÓN - 30 segundos]
¿Sabían que Marie Curie trabajaba tan intensamente que a veces olvidaba
comer durante días enteros? Hoy les voy a argumentar por qué, a pesar de
los sacrificios personales, la dedicación de Marie Curie estaba justificada
por la magnitud de sus contribuciones a la humanidad.

[DESARROLLO - 60 segundos]
En primer lugar, sus descubrimientos salvaron millones de vidas. El radio
que aisló se convirtió en tratamiento pionero contra el cáncer, beneficiando
a incontables pacientes desde principios del siglo XX.

Además, Marie demostró que la excelencia científica no tiene género.
Al convertirse en la primera mujer en ganar un Premio Nobel, y luego la
primera persona en ganar dos en diferentes ciencias, abrió puertas para
generaciones de científicas que vinieron después.

Por último, sus propias hijas entendieron y apoyaron su misión. Irène
siguió sus pasos y también ganó un Nobel, mientras Eve escribió su
biografía preservando su legado.

[CONCLUSIÓN - 30 segundos]
En conclusión, aunque Marie Curie sacrificó tiempo personal y salud,
el impacto de su trabajo transformó la medicina, la física y las
oportunidades para las mujeres en ciencia. Su legado demuestra que
algunos sacrificios, por difíciles que sean, pueden cambiar el mundo
para mejor. La pregunta que les dejo es: ¿qué sacrificios estamos
dispuestos a hacer por el bien mayor?
```

### Rúbrica de Evaluación

| Criterio | Peso | Descripción |
|----------|------|-------------|
| Claridad | 25% | Expresión clara, estructura lógica, fácil de seguir |
| Argumentación | 35% | Argumentos sólidos con evidencias verificables |
| Pensamiento Crítico | 25% | Profundidad de análisis, considera múltiples perspectivas |
| Presentación | 15% | Calidad de audio (si grabado) o redacción (si guión) |

### Ejemplo de Respuesta JSON para Testing

```json
{
  "topicId": "topic-1",
  "script": "¿Sabían que Marie Curie trabajaba tan intensamente que a veces olvidaba comer durante días enteros? Hoy les voy a argumentar por qué, a pesar de los sacrificios personales, la dedicación de Marie Curie estaba justificada por la magnitud de sus contribuciones a la humanidad. En primer lugar, sus descubrimientos salvaron millones de vidas. El radio que aisló se convirtió en tratamiento pionero contra el cáncer, beneficiando a incontables pacientes desde principios del siglo XX. Además, Marie demostró que la excelencia científica no tiene género. Al convertirse en la primera mujer en ganar un Premio Nobel, y luego la primera persona en ganar dos en diferentes ciencias, abrió puertas para generaciones de científicas que vinieron después. Por último, sus propias hijas entendieron y apoyaron su misión. Irène siguió sus pasos y también ganó un Nobel, mientras Eve escribió su biografía preservando su legado. En conclusión, aunque Marie Curie sacrificó tiempo personal y salud, el impacto de su trabajo transformó la medicina, la física y las oportunidades para las mujeres en ciencia.",
  "audioUrl": null
}
```

---

## Ejercicio 3.5: Matriz de Perspectivas

**Tipo:** `matriz_perspectivas`
**Order Index:** 5
**Dificultad:** Advanced
**Puntos Máximos:** 100 | **Passing Score:** 70

### Descripción

Analiza el evento: **"Marie gana el Nobel de Química en 1911 en medio de escándalo personal"** desde 6 perspectivas diferentes.

### Perspectivas a Analizar

| ID | Grupo | Perspectiva Histórica | Evidencia |
|----|-------|----------------------|-----------|
| `persp-1` | Comunidad científica (1903) | Inicial escepticismo hacia mujer científica | Casi no fue nominada al Nobel; tuvieron que insistir en incluirla |
| `persp-2` | Prensa francesa (1911) | Sensacionalismo sobre su vida personal | Escándalo amoroso eclipsó su segundo Nobel temporalmente |
| `persp-3` | Movimiento feminista (1920s-presente) | Símbolo de empoderamiento femenino | Primera mujer en logros múltiples sin precedentes |
| `persp-4` | Polonia (toda época) | Heroína nacional y orgullo patrio | Nombró elemento polonio por su país ocupado |
| `persp-5` | Marie Curie (personal) | Reconocimiento merecido, pero invasión de privacidad dolorosa | Cartas personales donde expresa frustración por el escándalo eclipsando su Nobel |
| `persp-6` | Pierre Curie (póstuma) | Orgullo por logros continuados de Marie | Cartas donde expresaba admiración por el talento de Marie |

### Preguntas de Análisis con Respuestas Esperadas

| ID | Pregunta | Respuesta Esperada |
|----|----------|-------------------|
| `q1` | ¿Qué perspectiva fue más injusta con Marie? | La prensa sensacionalista de 1911 que enfocó en su vida personal ignorando su segundo Nobel |
| `q2` | ¿Cómo ha evolucionado la percepción de Marie con el tiempo? | De escepticismo inicial a reconocimiento universal como pionera científica y feminista |
| `q3` | ¿Qué grupo tuvo la perspectiva más equilibrada? | Historiadores modernos que contextualizan sus logros y limitaciones |

### Respuestas Modelo por Perspectiva

#### Marie Curie (perspectiva personal)

| Aspecto | Respuesta Modelo |
|---------|-----------------|
| **Reacción Emocional** | Orgullo por el reconocimiento científico mezclado con dolor y frustración por la invasión de su privacidad durante el escándalo Langevin |
| **Opinión sobre el Evento** | El Nobel es un reconocimiento merecido a años de trabajo científico riguroso que debería evaluarse independientemente de su vida personal |
| **Consecuencias Percibidas** | Validación científica internacional pero también mayor escrutinio público. Necesidad de separar vida personal de logros profesionales |

#### Prensa de la época

| Aspecto | Respuesta Modelo |
|---------|-----------------|
| **Reacción Emocional** | Entusiasmo por el escándalo, interés sensacionalista en vida privada de figura pública |
| **Opinión sobre el Evento** | El escándalo es más "noticiable" que el logro científico; enfoque en aspectos morales sobre méritos científicos |
| **Consecuencias Percibidas** | Oportunidad de vender periódicos; cuestionar si una mujer de "moral cuestionable" merece reconocimientos |

#### Mujeres de la época

| Aspecto | Respuesta Modelo |
|---------|-----------------|
| **Reacción Emocional** | Inspiración y esperanza; admiración por romper barreras aparentemente imposibles |
| **Opinión sobre el Evento** | Demostración de que las mujeres pueden alcanzar los más altos logros científicos; el escándalo es irrelevante frente a sus méritos |
| **Consecuencias Percibidas** | Apertura de posibilidades antes vedadas; modelo a seguir para futuras generaciones |

#### Comunidad científica

| Aspecto | Respuesta Modelo |
|---------|-----------------|
| **Reacción Emocional** | División entre apoyo y rechazo; algunos orgullosos de colega brillante, otros incómodos por escándalo |
| **Opinión sobre el Evento** | Tensión entre reconocer mérito científico indiscutible y preocupación por "reputación" de la ciencia |
| **Consecuencias Percibidas** | Presión para separar juicio científico de juicio moral; precedente complejo para futuras mujeres científicas |

#### Pierre Curie (perspectiva póstuma)

| Aspecto | Respuesta Modelo |
|---------|-----------------|
| **Reacción Emocional** | Orgullo por los logros continuados de Marie tras su muerte; satisfacción de que continuara el legado científico |
| **Opinión sobre el Evento** | Validación del trabajo conjunto; Marie merece reconocimiento pleno por sus contribuciones independientes |
| **Consecuencias Percibidas** | El legado científico de ambos perdura; Marie demuestra que sus capacidades siempre igualaron o superaron las de él |

#### Polonia

| Aspecto | Respuesta Modelo |
|---------|-----------------|
| **Reacción Emocional** | Orgullo patriótico intenso; reivindicación de "hija de Polonia" en escenario mundial |
| **Opinión sobre el Evento** | Prueba de la excelencia polaca a pesar de siglos de ocupación; Marie representa lo mejor de la nación |
| **Consecuencias Percibidas** | Símbolo de resistencia y excelencia nacional; inspiración para generaciones de polacos |

### Ejemplo de Respuesta JSON para Testing

```json
{
  "questions": {
    "q1": "La prensa sensacionalista de 1911 que enfocó en su vida personal ignorando su segundo Nobel de Química. En lugar de celebrar un logro científico sin precedentes, prefirieron vender periódicos con escándalos sobre su supuesta relación con Paul Langevin.",
    "q2": "La percepción evolucionó de escepticismo inicial hacia mujer científica a reconocimiento universal. Hoy Marie Curie es celebrada como pionera científica y feminista, símbolo de excelencia académica que trascendió barreras de género.",
    "q3": "Los historiadores modernos que pueden contextualizar sus logros considerando las limitaciones de su época, reconociendo tanto sus contribuciones extraordinarias como los desafíos personales y sociales que enfrentó."
  }
}
```

---

## Matriz de Cobertura de Pruebas

### Estado de Implementación por Capa

| Ejercicio | Seeds DB | Frontend | Backend DTO | Validación SQL | Estado |
|-----------|----------|----------|-------------|----------------|--------|
| 3.1 Tribunal | ✅ Completo | ✅ Completo | ✅ | ✅ | **PRODUCTION** |
| 3.2 Debate | ✅ Completo | ⚠️ No envía a backend | ✅ | ✅ | **PARCIAL** |
| 3.3 Análisis Fuentes | ✅ Completo | ⚠️ No envía ranking | ✅ | ✅ | **PARCIAL** |
| 3.4 Podcast | ✅ Completo | ⚠️ Transcripción mock | ✅ | ✅ (técnica) | **PARCIAL** |
| 3.5 Matriz | ✅ Completo | ⚠️ No envía respuestas | ✅ | ✅ | **PARCIAL** |

### Tipos de Validación por Ejercicio

| Ejercicio | Tipo Validación | Respuesta Única | Fuzzy Match | Evaluación Manual |
|-----------|-----------------|-----------------|-------------|-------------------|
| 3.1 Tribunal | Exacta + Heurística | ✅ Sí | 0.75 | ❌ No |
| 3.2 Debate | Rúbrica | ✅ Sí | 0.75 | ⚠️ Opcional |
| 3.3 Análisis | Exacta (orden) | ✅ Sí | ❌ No | ❌ No |
| 3.4 Podcast | Técnica + Rúbrica | ✅ Sí | ❌ No | ✅ Recomendado |
| 3.5 Matriz | Heurística | ✅ Sí | 0.75 | ⚠️ Opcional |

---

## Gaps y Limitaciones Conocidas

### Resueltos (2025-11-24)

1. ~~**Frontend → Backend Integration (Ejercicios 3.2-3.5)**~~
   - ✅ **RESUELTO:** Todos los ejercicios (3.1-3.5) ahora envían respuestas al backend con `submitExercise()`
   - Integración implementada con `useAuth` para autenticación de usuario
   - Respuestas se persisten en base de datos vía `progress_tracking.exercise_submissions`

### Críticos (Requieren Atención)

1. **Podcast: Transcripción Hardcoded**
   - El componente usa transcripción mock en lugar de Speech-to-Text real
   - **Impacto:** No se valida contenido real del audio grabado

2. **Podcast: Sin Validación de Contenido**
   - Backend solo valida formato (mp3/wav), duración (2-5 min), tamaño (<50MB)
   - **Impacto:** Cualquier audio que cumpla requisitos técnicos pasará

### Moderados

3. **Debate/Podcast: Evaluación por Rúbrica sin Respuesta Correcta**
   - Por diseño, estos ejercicios no tienen respuesta única
   - Requieren evaluación cualitativa que el sistema no puede automatizar completamente

4. **Matriz de Perspectivas: Baja Interactividad**
   - Usuario actualmente solo observa perspectivas generadas
   - No hay mecanismo de ranking o selección

### Recomendaciones para Testing Manual

```
EJERCICIO 3.1 (Tribunal):
✅ Probar todas las 8 afirmaciones con respuestas correctas
✅ Verificar cálculo de score
✅ Confirmar persistencia en BD

EJERCICIO 3.2 (Debate):
✅ Probar ambas posturas (a_favor, en_contra)
✅ Verificar que argumentos se muestran correctamente
✅ Confirmar persistencia en BD (submitExercise integrado 2025-11-24)

EJERCICIO 3.3 (Análisis):
✅ Probar drag & drop del ranking
✅ Verificar orden correcto: src5 > src1 > src3 > src4 > src2
✅ Confirmar persistencia en BD (submitExercise integrado 2025-11-24)

EJERCICIO 3.4 (Podcast):
✅ Probar grabación de audio (funciona)
✅ Verificar que guión alternativo es aceptado
✅ Confirmar persistencia en BD (submitExercise integrado 2025-11-24)
⚠️ No esperar validación de contenido real (limitación conocida)

EJERCICIO 3.5 (Matriz):
✅ Verificar que 6 perspectivas se muestran
✅ Probar respuestas a 3 preguntas de análisis
✅ Confirmar persistencia en BD (submitExercise integrado 2025-11-24)
```

---

**Documento generado por:** Architecture-Analyst
**Fuente de datos:** `apps/database/seeds/dev/educational_content/04-exercises-module3.sql`
**Última actualización:** 2025-11-24 (Integración frontend→backend completada)
