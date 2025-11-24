# GUÍA DE PRUEBAS: Respuestas de Ejemplo - Módulo 3
## COMPRENSIÓN CRÍTICA Y VALORATIVA

**Fecha:** 2025-11-23
**Propósito:** Documento de referencia para probar los 5 ejercicios del Módulo 3
**Uso:** Testing manual, QA, validación pedagógica, demos
**Nivel:** Avanzado (CEFR: B2-C1)

---

## 🎯 CÓMO USAR ESTA GUÍA

Esta guía contiene ejemplos de respuestas para los **5 ejercicios del Módulo 3** (Comprensión Crítica y Valorativa según Daniel Cassany).

**Estructura de cada ejercicio:**
- ✅ **Respuestas EXCELENTES** (80-100% puntos)
- ✅ **Respuestas ACEPTABLES** (50-79% puntos)
- ❌ **Respuestas INCORRECTAS** (0-49% puntos)
- 🔑 **Criterios de evaluación**
- 📊 **Puntuación máxima**

**Propósito:**
- Validar funcionamiento de validadores (functions validate_*)
- Probar frontend (componentes de cada tipo de ejercicio)
- Verificar que sistema de puntuación funcione correctamente
- Demos pedagógicas con profesores
- Capacitación de QA

---

# EJERCICIO 3.1: TRIBUNAL DE OPINIONES
## Evaluando Afirmaciones sobre Marie Curie

**Tipo:** `tribunal_opiniones`
**Orden:** 1
**Puntos máximos:** 100
**Tiempo estimado:** 12 minutos
**Dificultad:** Avanzada

### Descripción del Ejercicio

Analizar 8 afirmaciones sobre Marie Curie y:
1. Clasificar cada una como: **HECHO** | **OPINIÓN** | **INTERPRETACIÓN**
2. Evaluar si está: **Bien fundamentada ✅** | **Parcialmente fundamentada ⚠️** | **Sin fundamento ❌**
3. Justificar decisión en 2-3 líneas

---

### Afirmación 1: "Marie Curie murió el 4 de julio de 1934 a causa de anemia aplásica."

#### ✅ Respuesta EXCELENTE (12-13 puntos)

**Clasificación:** HECHO
**Veredicto:** Bien fundamentada ✅
**Justificación:**
```
Esta afirmación contiene dos hechos verificables objetivamente mediante registros históricos:
la fecha exacta de muerte (4 julio 1934) y la causa médica (anemia aplásica). Ambos están
documentados en certificados oficiales y biografías académicas revisadas por pares.
```

**Por qué es excelente:**
- Identifica correctamente como HECHO (verificable objetivamente)
- Veredicto correcto (Bien fundamentada)
- Justificación cita evidencia específica (registros, biografías)
- Explica por qué es verificable

---

#### ✅ Respuesta ACEPTABLE (7-11 puntos)

**Clasificación:** HECHO
**Veredicto:** Bien fundamentada ✅
**Justificación:**
```
Es un hecho verificable. Hay registros médicos que confirman que Marie murió
de anemia aplásica en julio de 1934.
```

**Por qué es aceptable:**
- Clasificación correcta
- Veredicto correcto
- Justificación válida pero menos detallada

---

#### ❌ Respuesta INCORRECTA (0-6 puntos)

**Clasificación:** OPINIÓN
**Veredicto:** Parcialmente fundamentada ⚠️
**Justificación:**
```
Creo que es verdad porque leí algo sobre eso, pero no estoy seguro.
```

**Por qué es incorrecta:**
- Clasificación errónea (es HECHO, no OPINIÓN)
- Veredicto incorrecto
- Justificación no usa criterios académicos

---

### Afirmación 2: "Marie Curie fue la científica más brillante del siglo XX."

#### ✅ Respuesta EXCELENTE (12-13 puntos)

**Clasificación:** OPINIÓN
**Veredicto:** Sin fundamento ❌
**Justificación:**
```
Esta es una opinión con juicio de valor ("más brillante") que carece de criterios objetivos
de medición. No define qué significa "brillante" ni proporciona métrica verificable para
comparar con otras científicas del siglo XX (Lise Meitner, Rosalind Franklin, Barbara
McClintock). Sin criterios claros, no es verificable académicamente.
```

**Por qué es excelente:**
- Identifica correctamente como OPINIÓN (juicio de valor)
- Veredicto correcto (Sin fundamento por falta de criterios)
- Justificación explica por qué carece de base objetiva
- Menciona ejemplos de contraejemplos potenciales

---

#### ✅ Respuesta ACEPTABLE (7-11 puntos)

**Clasificación:** OPINIÓN
**Veredicto:** Parcialmente fundamentada ⚠️
**Justificación:**
```
Es una opinión subjetiva. Aunque Marie tuvo logros importantes (2 Nobel),
decir que fue "la más brillante" es un juicio de valor sin métrica clara.
```

**Por qué es aceptable:**
- Clasificación correcta
- Veredicto razonable (podría ser Sin fundamento también)
- Justificación identifica el problema (falta métrica)

---

#### ❌ Respuesta INCORRECTA (0-6 puntos)

**Clasificación:** HECHO
**Veredicto:** Bien fundamentada ✅
**Justificación:**
```
Es verdad, Marie ganó 2 Nobel y nadie más lo hizo, así que obviamente
fue la mejor científica.
```

**Por qué es incorrecta:**
- Clasificación errónea (no es HECHO verificable)
- Veredicto incorrecto
- Justificación comete falacia (2 Nobel ≠ "más brillante")

---

### Afirmación 3: "La exposición prolongada al radio contribuyó a la enfermedad que causó la muerte de Marie Curie."

#### ✅ Respuesta EXCELENTE (12-13 puntos)

**Clasificación:** INTERPRETACIÓN
**Veredicto:** Bien fundamentada ✅
**Justificación:**
```
Esta es una interpretación razonable basada en evidencia médica sólida. Sabemos que Marie
trabajó con radio sin protección durante décadas, que el radio causa daño a médula ósea,
y que murió de anemia aplásica (enfermedad hematológica). Aunque no hay prueba causal
directa del 100%, la evidencia circunstancial es muy fuerte según análisis médicos posteriores.
```

**Por qué es excelente:**
- Clasificación correcta (deducción razonable, no 100% demostrable)
- Veredicto apropiado (bien fundamentada con evidencia)
- Justificación muestra pensamiento matizado (reconoce límites pero valida inferencia)

---

#### ✅ Respuesta ACEPTABLE (7-11 puntos)

**Clasificación:** INTERPRETACIÓN
**Veredicto:** Parcialmente fundamentada ⚠️
**Justificación:**
```
Es una interpretación con evidencia (trabajó con material radiactivo, murió de enfermedad
de sangre), pero no está 100% comprobado que el radio fuera la causa directa.
```

**Por qué es aceptable:**
- Clasificación correcta
- Veredicto razonable (conservador pero válido)
- Justificación identifica evidencia y limitación

---

#### ❌ Respuesta INCORRECTA (0-6 puntos)

**Clasificación:** OPINIÓN
**Veredicto:** Sin fundamento ❌
**Justificación:**
```
Es solo una suposición. Nadie sabe realmente por qué murió Marie.
```

**Por qué es incorrecta:**
- Clasificación errónea (hay evidencia, no es mera opinión)
- Veredicto incorrecto (hay bases sólidas)
- Justificación ignora evidencia médica disponible

---

### Afirmación 4: "Marie Curie ganó dos Premios Nobel: uno en Física (1903) y otro en Química (1911)."

#### ✅ Respuesta EXCELENTE (12-13 puntos)

**Clasificación:** HECHO
**Veredicto:** Bien fundamentada ✅
**Justificación:**
```
Hecho verificable 100% mediante registros oficiales de la Fundación Nobel. Las fechas,
disciplinas y razones (física 1903 por radiactividad con Pierre y Becquerel; química 1911
por descubrimiento de radio y polonio) están documentadas en archivos históricos oficiales.
```

**Por qué es excelente:**
- Clasificación perfecta
- Veredicto correcto
- Justificación menciona fuente primaria (Fundación Nobel)
- Incluye detalles verificables adicionales

---

### Afirmación 5: "Pierre Curie merecía más crédito que Marie por el descubrimiento del radio."

#### ✅ Respuesta EXCELENTE (12-13 puntos)

**Clasificación:** OPINIÓN
**Veredicto:** Sin fundamento ❌
**Justificación:**
```
Esta es una opinión con juicio de valor ("merecía más") que carece de evidencia histórica.
Los registros muestran colaboración equitativa y múltiples fuentes (incluidas notas de
laboratorio) documentan contribuciones equivalentes. Afirmar que uno "merecía más" sin
criterios objetivos es subjetivo y contradice evidencia histórica de trabajo conjunto.
```

**Por qué es excelente:**
- Clasificación correcta (juicio de valor subjetivo)
- Veredicto apropiado (contradice evidencia)
- Justificación cita evidencia contraria (notas de laboratorio)

---

### Afirmación 6: "Si Marie Curie no hubiera emigrado a Francia, probablemente no habría logrado sus descubrimientos."

#### ✅ Respuesta EXCELENTE (12-13 puntos)

**Clasificación:** INTERPRETACIÓN
**Veredicto:** Bien fundamentada ✅
**Justificación:**
```
Esta es una interpretación contrafactual razonable basada en hechos históricos verificables:
Polonia estaba bajo ocupación rusa con universidades cerradas a mujeres, mientras Francia
tenía la Sorbona con mejores recursos y (limitada) apertura a mujeres científicas. La
evidencia de contexto histórico respalda fuertemente esta interpretación, aunque no sea
demostrable al 100% (contrafactuales nunca lo son).
```

**Por qué es excelente:**
- Clasificación correcta (interpretación con evidencia)
- Veredicto apropiado (bien fundamentada en contexto)
- Muestra pensamiento matizado (reconoce límite inherente de contrafactuales)

---

### Afirmación 7: "Marie Curie fue la primera mujer en recibir un Premio Nobel."

#### ✅ Respuesta EXCELENTE (12-13 puntos)

**Clasificación:** HECHO
**Veredicto:** Bien fundamentada ✅
**Justificación:**
```
Hecho 100% verificable en registros históricos de la Fundación Nobel. Marie recibió el
Premio Nobel de Física en 1903, convirtiéndose en la primera mujer galardonada en cualquier
categoría desde la creación de los premios en 1901.
```

**Por qué es excelente:**
- Clasificación perfecta
- Veredicto correcto
- Justificación menciona fuente verificable y contexto temporal

---

### Afirmación 8: "La decisión de Marie de no patentar el proceso de aislamiento del radio fue ingenua e irresponsable."

#### ✅ Respuesta EXCELENTE (12-13 puntos)

**Clasificación:** OPINIÓN
**Veredicto:** Sin fundamento ❌
**Justificación:**
```
Esta es una opinión con juicios de valor negativos ("ingenua", "irresponsable") que ignora
el contexto ético de la decisión. Fuentes históricas (incluida biografía de Eve Curie)
documentan que fue decisión deliberada basada en principios éticos de ciencia abierta.
Calificarla como "ingenua" es anacrónico e ignora valores científicos de la época. Sin
evidencia de que fuera error o falta de juicio, estos adjetivos carecen de fundamento.
```

**Por qué es excelente:**
- Clasificación correcta (juicio de valor)
- Veredicto apropiado (ignora contexto y evidencia)
- Justificación muestra pensamiento histórico contextualizado
- Identifica anacronismo

---

## Tabla Resumen - Tribunal de Opiniones

| # | Afirmación (resumida) | Clasificación Correcta | Veredicto Correcto |
|---|----------------------|------------------------|-------------------|
| 1 | Muerte 4 julio 1934 | HECHO | ✅ Bien fundamentada |
| 2 | Científica más brillante | OPINIÓN | ❌ Sin fundamento |
| 3 | Radio causó enfermedad | INTERPRETACIÓN | ✅ Bien fundamentada |
| 4 | 2 Nobel (Física, Química) | HECHO | ✅ Bien fundamentada |
| 5 | Pierre merecía más crédito | OPINIÓN | ❌ Sin fundamento |
| 6 | Sin Francia no habría logros | INTERPRETACIÓN | ✅ Bien fundamentada |
| 7 | Primera mujer con Nobel | HECHO | ✅ Bien fundamentada |
| 8 | No patentar fue ingenuo | OPINIÓN | ❌ Sin fundamento |

---

# EJERCICIO 3.2: DEBATE DIGITAL ESTRUCTURADO
## ¿La fama afectó negativamente la investigación de Marie Curie?

**Tipo:** `debate_digital`
**Orden:** 2
**Puntos máximos:** 100
**Tiempo estimado:** 10 minutos (⏱ ACTUALIZADO GAP-004)
**Dificultad:** Avanzada

### Descripción del Ejercicio

Participar en debate estructurado defendiendo una postura asignada aleatoriamente:
- **Postura A:** La fama afectó NEGATIVAMENTE su investigación
- **Postura B:** La fama BENEFICIÓ su investigación

**Estructura del debate:**
1. **Preparación** (3 min): Leer fuentes, construir 3 argumentos
2. **Apertura** (1 min): Declaración de tesis
3. **Desarrollo** (2 min): Exponer 3 argumentos con evidencia
4. **Réplica** (2 min): Refutar argumentos contrarios
5. **Contra-réplica** (2 min): Defender posición
6. **Cierre** (30 seg): Conclusión contundente
7. **Votación** (30 seg): Otros estudiantes votan

---

## POSTURA A: La fama afectó NEGATIVAMENTE

### ✅ Argumento EXCELENTE (Argumento 1 de 3)

**Afirmación:**
```
La fama trajo invasión de privacidad que interrumpió constantemente el trabajo científico
de Marie Curie, especialmente tras el escándalo de 1911.
```

**Evidencia:**
```
Tras la publicación de su supuesta relación con Paul Langevin (científico casado) en 1911,
la prensa sensacionalista francesa acampó frente a su casa, publicó cartas privadas robadas,
y la acosó con preguntas sobre su vida personal en lugar de su trabajo científico. Eve Curie
documenta en su biografía que Marie tuvo que refugiarse en casa de amigos para escapar del
acoso periodístico, perdiendo semanas de trabajo de laboratorio en momento crítico (justo
antes de recibir su segundo Nobel).
```

**Razonamiento:**
```
Este acoso mediático no solo le quitó tiempo valioso de investigación (semanas refugiada),
sino que afectó su salud mental y concentración. Un científico requiere períodos prolongados
de concentración profunda; el estrés constante del acoso periodístico es incompatible con
trabajo científico de alta calidad. Por lo tanto, la fama derivada del Nobel tuvo impacto
negativo demostrable en su capacidad de investigar efectivamente durante ese período.
```

**Puntuación esperada:** 32-35 puntos (de 100 total)

**Por qué es excelente:**
- Estructura clara: Afirmación + Evidencia + Razonamiento
- Evidencia específica (escándalo 1911, fuente citada)
- Razonamiento lógico válido
- Conecta evidencia con tesis general

---

### ✅ Argumento ACEPTABLE (Argumento 2 de 3)

**Afirmación:**
```
La fama obligó a Marie a dedicar tiempo a ceremonias y eventos públicos que le restaban
tiempo de laboratorio.
```

**Evidencia:**
```
Como ganadora del Nobel, Marie fue invitada a múltiples ceremonias, conferencias y eventos
oficiales en diferentes países. Estos eventos requerían preparación, viaje y participación.
```

**Razonamiento:**
```
Cada hora dedicada a estos eventos sociales era una hora menos de investigación. Para un
científico, el tiempo de laboratorio es limitado y valioso.
```

**Puntuación esperada:** 20-24 puntos

**Por qué es aceptable:**
- Estructura presente pero menos elaborada
- Evidencia válida pero menos específica (no cita fechas/ejemplos concretos)
- Razonamiento correcto pero genérico

---

### ❌ Argumento INCORRECTO

**Afirmación:**
```
La fama fue mala para Marie porque todos la molestaban.
```

**Evidencia:**
```
La gente siempre quería hablar con ella y eso era molesto.
```

**Razonamiento:**
```
Si te molestan mucho, no puedes trabajar bien.
```

**Puntuación esperada:** 5-10 puntos

**Por qué es incorrecta:**
- Lenguaje coloquial ("molestaban", "molesto")
- Sin evidencia histórica específica
- Razonamiento vago
- Sin fuentes citadas

---

## POSTURA B: La fama BENEFICIÓ su investigación

### ✅ Argumento EXCELENTE (Argumento 1 de 3)

**Afirmación:**
```
La fama del Nobel proporcionó a Marie Curie acceso a financiación significativamente mayor,
lo que permitió mejoras cruciales en su laboratorio y capacidad de investigación.
```

**Evidencia:**
```
Tras ganar el Premio Nobel de Física en 1903, el gobierno francés y donantes privados
incrementaron sustancialmente el presupuesto del laboratorio de los Curie. Esto permitió
contratar asistentes de investigación especializados, adquirir equipos de medición más
precisos, y comprar materiales radiactivos costosos necesarios para aislar radio en
cantidades científicamente útiles. Antes del Nobel, trabajaban en condiciones precarias
en un cobertizo inadecuado; después, obtuvieron instalaciones profesionales.
```

**Razonamiento:**
```
La investigación científica experimental requiere recursos materiales: equipos, materiales,
asistentes técnicos. Al proporcionar estos recursos críticos que antes no tenían, la fama
del Nobel directamente habilitó investigaciones que hubieran sido imposibles con limitaciones
previas. El segundo Nobel (Química 1911) por aislamiento del radio fue resultado directo de
tener los recursos que la fama del primer Nobel proporcionó.
```

**Puntuación esperada:** 32-35 puntos

**Por qué es excelente:**
- Evidencia muy específica (recursos concretos obtenidos)
- Razonamiento causal claro
- Conecta evidencia con resultado verificable (segundo Nobel)

---

### ✅ Argumento ACEPTABLE

**Afirmación:**
```
El reconocimiento del Nobel le dio a Marie credibilidad institucional que abrió puertas
previamente cerradas.
```

**Evidencia:**
```
En 1906, tras la muerte de Pierre y como ganadora del Nobel, Marie fue nombrada profesora
en la Sorbona, convirtiéndose en la primera mujer en ese puesto. Antes del Nobel, esto
habría sido impensable dado los prejuicios de género de la época.
```

**Razonamiento:**
```
Tener una posición oficial en la universidad más prestigiosa de Francia le dio autoridad,
acceso a estudiantes talentosos, y legitimidad académica para continuar su investigación.
```

**Puntuación esperada:** 22-26 puntos

**Por qué es aceptable:**
- Evidencia histórica válida y específica
- Razonamiento claro
- Podría mejorar con más detalles sobre impacto en investigación

---

### Estrategia de Réplica EXCELENTE

**Contexto:** El oponente argumentó que el escándalo de 1911 fue negativo.

**Réplica:**
```
Mi oponente menciona correctamente el escándalo de 1911, que sin duda fue doloroso
personalmente. Sin embargo, esto no refuta mi argumento principal: debemos separar
costos personales de impacto en investigación científica.

Los datos muestran que a pesar del acoso periodístico de 1911, Marie:
1. Recibió su segundo Nobel ese mismo año (Comité Nobel claramente no consideró que el
   escándalo invalidara su trabajo)
2. Continuó produciendo investigación de alta calidad en años siguientes
3. Fundó el Instituto del Radio en 1914 (posible por recursos obtenidos gracias a fama)

Si bien el escándalo causó sufrimiento personal innegable, la evidencia muestra que su
producción científica no disminuyó significativamente. Por lo tanto, aunque la fama tuvo
costos personales, el balance neto para su INVESTIGACIÓN (que es el tema del debate)
fue positivo gracias a recursos y reconocimiento obtenidos.
```

**Puntuación esperada:** 18-22 puntos (de refutación)

**Por qué es excelente:**
- Reconoce punto válido del oponente ("sin duda doloroso")
- Distingue claramente el tema (impacto en investigación vs. vida personal)
- Proporciona evidencia contraria específica (3 puntos numerados)
- Mantiene respeto absoluto (ataca argumento, no persona)

---

## Criterios de Evaluación - Debate Digital

| Criterio | Peso | Qué se evalúa |
|----------|------|---------------|
| **Claridad** | 25% | ¿Los argumentos son comprensibles? |
| **Evidencia** | 30% | ¿Cita hechos históricos específicos y fuentes? |
| **Lógica** | 25% | ¿El razonamiento es válido? |
| **Persuasión** | 20% | ¿Convence? ¿Anticipa contraargumentos? |

**Puntuación:**
- **80-100 puntos:** Excelente - Argumentos sólidos con evidencia específica
- **60-79 puntos:** Bueno - Argumentos válidos, evidencia presente pero menos detallada
- **40-59 puntos:** Aceptable - Argumentos presentes pero débiles
- **0-39 puntos:** Insuficiente - Sin evidencia, razonamiento inválido

---

# EJERCICIO 3.3: ANÁLISIS DE FUENTES HISTÓRICAS
## Evalúa la Credibilidad usando Criterio CRAAP

**Tipo:** `analisis_fuentes`
**Orden:** 3
**Puntos máximos:** 100
**Tiempo estimado:** 18 minutos
**Dificultad:** Avanzada

### Descripción del Ejercicio

Ordenar 5 fuentes sobre Marie Curie de **MÁS a MENOS confiable** usando el método académico CRAAP:
- **C**urrency (Actualidad)
- **R**elevance (Relevancia)
- **A**uthority (Autoridad)
- **A**ccuracy (Precisión)
- **P**urpose (Propósito)

---

## Las 5 Fuentes a Evaluar

### Fuente 1: Artículo Académico Reciente
- **Título:** "Marie Curie and the Science of Radioactivity"
- **Autor:** Dr. Naomi Pasachoff (historiadora de ciencia)
- **Institución:** American Institute of Physics
- **Fecha:** 2020
- **Tipo:** Artículo académico revisado por pares
- **Citas:** Más de 50 fuentes primarias y secundarias
- **Credibilidad real:** 95/100

### Fuente 2: Blog Anónimo
- **Título:** "Mujeres en la Ciencia: Marie Curie"
- **Autor:** Blog personal anónimo
- **Institución:** N/A
- **Fecha:** 2023
- **Tipo:** Blog personal no verificado
- **Extracto:** "Marie Curie fue sobrevalorada. Su esposo Pierre hizo todo el trabajo real..."
- **Citas:** Sin fuentes citadas
- **Credibilidad real:** 15/100

### Fuente 3: Biografía Familiar
- **Título:** "Madame Curie: A Biography"
- **Autor:** Eve Curie (hija de Marie)
- **Institución:** Editorial Heinemann
- **Fecha:** 1937
- **Tipo:** Biografía escrita por familiar
- **Citas:** Fuente primaria (testimonios directos)
- **Credibilidad real:** 75/100 (alta pero con sesgo afectivo potencial)

### Fuente 4: Prensa Sensacionalista
- **Título:** Artículo de periódico sensacionalista
- **Autor:** Reporter desconocido
- **Institución:** Le Petit Journal
- **Fecha:** 1911
- **Tipo:** Prensa amarillista de época
- **Extracto:** "Escándalo: La viuda Curie mantiene romance... ¿Merece el Nobel una mujer de moral cuestionable?"
- **Citas:** Rumores y especulaciones
- **Credibilidad real:** 25/100

### Fuente 5: Documento Oficial Nobel
- **Título:** "Nobel Lectures: Physics 1901-1921"
- **Autor:** Nobel Foundation
- **Institución:** Nobel Foundation
- **Fecha:** 1967 (compilación de documentos de 1903)
- **Tipo:** Fuente primaria oficial
- **Extracto:** "Marie Curie lecture: On the discovery of radium and polonium..."
- **Citas:** Documentos originales
- **Credibilidad real:** 100/100

---

## ✅ ORDEN CORRECTO (Respuesta Excelente)

### Orden de Más a Menos Confiable:

**1º - Fuente 5** (Nobel Foundation - Documentos oficiales)
**2º - Fuente 1** (Artículo académico Dr. Pasachoff 2020)
**3º - Fuente 3** (Biografía de Eve Curie 1937)
**4º - Fuente 4** (Prensa sensacionalista 1911)
**5º - Fuente 2** (Blog anónimo)

**Puntuación esperada:** 90-100 puntos

### Justificación del Orden:

**#1 - Fuente 5 (100 puntos CRAAP):**
```
Máxima credibilidad. Es fuente primaria oficial de la institución más autorizada
(Nobel Foundation). Los documentos de 1903 son contemporáneos y el discurso de Marie
es directo. Aunque compilación es de 1967, contiene materiales originales sin
interpretación intermedia. Currency: Documentos originales. Relevance: 100% directa.
Authority: Máxima (Nobel Foundation). Accuracy: Documentos originales sin filtro.
Purpose: Histórico-académico.
```

**#2 - Fuente 1 (95 puntos CRAAP):**
```
Muy alta credibilidad. Artículo académico reciente (2020) por historiadora especializada,
publicado por institución reconocida (American Institute of Physics), revisado por pares,
con más de 50 fuentes citadas. Currency: Muy actual. Relevance: Alta. Authority: Experta
reconocida. Accuracy: Verificable (50+ fuentes). Purpose: Académico-educativo.
```

**#3 - Fuente 3 (75 puntos CRAAP):**
```
Alta credibilidad con reservas. Biografía escrita por hija de Marie (Eve Curie) en 1937,
basada en testimonios directos (fuente primaria valiosa). SIN EMBARGO, tiene sesgo
afectivo inevitable: hija tiende a presentar madre positivamente. Authority: Alta (testigo
directo) pero con sesgo familiar. Accuracy: Alta en hechos observados, cuestionable en
interpretaciones. Purpose: Homenaje familiar + histórico.
```

**#4 - Fuente 4 (25 puntos CRAAP):**
```
Baja credibilidad. Prensa sensacionalista de 1911 con lenguaje moralizante y juicios
personales ("¿Merece el Nobel...?"). Aunque es documento histórico que refleja prejuicios
de época, NO es fuente confiable sobre hechos científicos de Marie. Authority: Baja
(reporter desconocido). Accuracy: Basada en rumores. Purpose: Sensacionalismo, vender
periódicos, no informar objetivamente.
```

**#5 - Fuente 2 (15 puntos CRAAP):**
```
Muy baja credibilidad. Blog anónimo reciente (2023) sin fuentes citadas que hace
afirmaciones infundadas ("Pierre hizo todo el trabajo real"). Authority: Ninguna (anónimo).
Accuracy: Sin verificación. Purpose: Opinión personal sin respaldo. NO debe usarse en
contextos académicos.
```

---

## ✅ Respuesta ACEPTABLE

**Orden:**
1. Fuente 5
2. Fuente 1
3. Fuente 3
4. Fuente 2
5. Fuente 4

**Puntuación esperada:** 60-75 puntos

**Por qué es aceptable:**
- Top 3 correctas (5, 1, 3)
- Error menor: invirtió orden de las dos últimas (2 y 4)
- Fuente 4 tiene valor histórico mínimo vs Fuente 2 que no tiene ninguno
- Muestra comprensión general pero no perfecta

---

## ❌ Respuesta INCORRECTA

**Orden:**
1. Fuente 2 (blog más reciente)
2. Fuente 4 (periódico histórico)
3. Fuente 1 (artículo académico)
4. Fuente 3 (biografía vieja)
5. Fuente 5 (documentos muy antiguos)

**Puntuación esperada:** 0-30 puntos

**Por qué es incorrecta:**
- Prioriza fecha reciente sobre autoridad y accuracy
- No distingue entre fuente primaria oficial vs blog anónimo
- Penaliza documentos históricos valiosos por ser "antiguos"
- Muestra incomprensión fundamental del método CRAAP

---

## Tabla Resumen CRAAP

| Fuente | C (Actualidad) | R (Relevancia) | A (Autoridad) | A (Precisión) | P (Propósito) | Total | Ranking |
|--------|---------------|----------------|---------------|---------------|---------------|-------|---------|
| **Fuente 5** (Nobel) | 5 | 5 | 5 | 5 | 5 | 25/25 | #1 |
| **Fuente 1** (Académica) | 5 | 5 | 5 | 5 | 4 | 24/25 | #2 |
| **Fuente 3** (Biografía) | 3 | 5 | 4 | 4 | 3 | 19/25 | #3 |
| **Fuente 4** (Prensa) | 2 | 3 | 1 | 1 | 1 | 8/25 | #4 |
| **Fuente 2** (Blog) | 4 | 2 | 1 | 1 | 1 | 9/25 | #5 |

---

# EJERCICIO 3.4: PODCAST ARGUMENTATIVO
## Crea un Episodio sobre Ética Científica

**Tipo:** `podcast_argumentativo`
**Orden:** 4
**Puntos máximos:** 100
**Tiempo estimado:** 30 minutos (preparación + grabación)
**Duración podcast:** 2 minutos exactos (⏱ ACTUALIZADO GAP-003 per ADR-009)
**Dificultad:** Avanzada

### Descripción del Ejercicio

Crear un podcast argumentativo de 2 minutos (120 segundos) sobre un dilema ético en la vida de Marie Curie:

**Opciones de grabación:**
1. **Grabar audio** (preferido)
2. **Escribir guión** (alternativa)

**Estructura obligatoria:**
- Introducción (30 seg)
- Desarrollo (60 seg): 3 argumentos
- Conclusión (30 seg)

**Requisitos:**
- Mínimo 3 datos verificables
- Mínimo 2 citas/referencias
- Tesis clara
- Conectores discursivos
- Registro formal pero accesible

---

## TEMA SUGERIDO: "Impacto de Marie Curie en equidad de género científica"

### ✅ GUIÓN EXCELENTE (90-100 puntos)

**INTRODUCCIÓN (30 segundos ~ 75 palabras):**

```
[Tono entusiasta pero serio]

¿Sabían que en 1911, Marie Curie fue RECHAZADA de la Academia de Ciencias Francesa
pese a tener ya un Premio Nobel? Este hecho sorprendente revela la magnitud de las
barreras que enfrentaban las mujeres en ciencia a principios del siglo XX.

[Pausa breve]

A pesar de estos obstáculos extraordinarios, Marie Curie transformó radicalmente las
posibilidades para mujeres en ciencia, aunque el impacto pleno de su legado tomaría
varias décadas en materializarse. Analicemos por qué.
```

**Palabras clave:** Hook (dato sorprendente), contexto histórico, tesis clara

---

**DESARROLLO - Argumento 1 (20 segundos ~ 50 palabras):**

```
En primer lugar, Marie fue la primera mujer en ganar un Premio Nobel en 1903, compartido
con su esposo Pierre Curie y Henri Becquerel por investigaciones sobre radiactividad.
Este logro rompió una barrera de más de 200 años en las ciencias exactas, demostrando
irrefutablemente que mujeres podían contribuir al más alto nivel científico mundial.
```

**Evidencia:** Hecho verificable (Premio Nobel 1903), dato numérico (200+ años)

---

**DESARROLLO - Argumento 2 (20 segundos ~ 50 palabras):**

```
Además, tras la muerte de Pierre en 1906, Marie asumió su cátedra en la Sorbona,
convirtiéndose en la primera mujer profesora en esta institución fundada en 1257.
Según la historiadora Susan Quinn, este nombramiento "abrió las puertas de la academia
universitaria a generaciones futuras de mujeres científicas".
```

**Evidencia:** Hecho (primera profesora), cita de fuente (Susan Quinn)

---

**DESARROLLO - Argumento 3 (20 segundos ~ 50 palabras):**

```
Por último, Marie fue modelo e inspiración directa para científicas posteriores.
Lise Meitner, física nuclear y pionera en fisión atómica, declaró: "Marie Curie me
mostró que era posible para una mujer dedicar su vida a la ciencia". Estudios muestran
un incremento del 300% de mujeres en física entre 1903 y 1950.
```

**Evidencia:** Cita de científica reconocida (Lise Meitner), dato estadístico (300%)

---

**CONCLUSIÓN (30 segundos ~ 75 palabras):**

```
[Tono reflexivo]

En síntesis, Marie Curie demostró con hechos irrefutables que el talento científico
no tiene género, solo requiere oportunidad. Aunque enfrentó rechazo institucional
incluso DESPUÉS de su primer Nobel, su persistencia y excelencia científica
establecieron un precedente imposible de ignorar.

[Pausa]

Su legado nos recuerda una verdad fundamental: las barreras artificiales basadas en
género frenan el progreso de toda la humanidad, no solo de las mujeres. La ciencia
necesita los mejores cerebros disponibles, independientemente de quién los posea.

[Final contundente]

Gracias por escuchar.
```

**Puntuación esperada:** 90-100 puntos

**Por qué es excelente:**
- ✅ Duración apropiada (~300 palabras = 2 min a ritmo pausado)
- ✅ Estructura clara (Intro-Desarrollo-Conclusión)
- ✅ 5+ datos verificables (Nobel 1903, Sorbona 1906, 300% incremento, etc.)
- ✅ 2 citas de fuentes (Susan Quinn, Lise Meitner)
- ✅ Conectores discursivos ("En primer lugar", "Además", "Por último", "En síntesis")
- ✅ Tesis clara y defendida
- ✅ Hook impactante (rechazo 1911)
- ✅ Conclusión memorable
- ✅ Registro formal pero accesible

---

### ✅ GUIÓN ACEPTABLE (60-75 puntos)

**INTRODUCCIÓN:**
```
Marie Curie fue importante para las mujeres en ciencia. Voy a explicar por qué.
```

**DESARROLLO:**
```
Primero, ganó dos Premios Nobel, lo cual fue increíble para una mujer en esa época.

Segundo, fue profesora en la universidad, algo que antes no pasaba con mujeres.

Tercero, inspiró a otras científicas que vinieron después como Lise Meitner.
```

**CONCLUSIÓN:**
```
Marie Curie fue muy importante porque demostró que las mujeres pueden ser científicas
exitosas. Su ejemplo ayudó a otras mujeres.
```

**Puntuación esperada:** 60-75 puntos

**Por qué es aceptable:**
- ✅ Estructura presente
- ✅ 3 argumentos identificables
- ⚠️ Evidencia presente pero poco específica (no menciona fechas/números exactos)
- ⚠️ Sin citas de fuentes externas
- ⚠️ Conclusión válida pero genérica
- ⚠️ Lenguaje menos formal ("increíble", "muy importante")

---

### ❌ GUIÓN INCORRECTO (0-40 puntos)

```
Marie Curie era una científica polaca que trabajó con su esposo Pierre. Descubrieron el
radio y ganaron un premio. Ella era muy inteligente y trabajadora. Creo que fue importante
para las mujeres, aunque no sé mucho sobre eso. La ciencia es difícil y ella pudo hacerla
bien. Todos deberíamos ser como ella y trabajar duro. Fin.
```

**Puntuación esperada:** 0-40 puntos

**Por qué es incorrecta:**
- ❌ Sin estructura clara
- ❌ Sin tesis específica sobre tema asignado
- ❌ Sin datos verificables específicos
- ❌ Sin citas o referencias
- ❌ Sin conectores discursivos
- ❌ Lenguaje vago ("creo que", "no sé mucho")
- ❌ Conclusión genérica sin relación con argumentos
- ❌ Muy corto (< 100 palabras, no llega a 2 min)

---

## Criterios de Evaluación - Podcast

| Criterio | Peso | Qué se evalúa |
|----------|------|---------------|
| **Estructura** | 20% | ¿Tiene intro, desarrollo (3 args), conclusión? |
| **Evidencia** | 30% | ¿Cita 3+ datos verificables, 2+ fuentes? |
| **Argumentación** | 25% | ¿Defiende tesis claramente con lógica? |
| **Comunicación** | 15% | ¿Usa conectores, registro apropiado, es claro? |
| **Duración** | 10% | ¿Cerca de 2 minutos (90-150 seg aceptable)? |

**Si es GRABACIÓN de audio (no guión escrito):**
- Se evalúa además: claridad vocal, ritmo apropiado, variación tonal
- Penalización por muletillas excesivas ("eh", "este", "como que")
- Bonificación por énfasis vocal en puntos clave

---

# EJERCICIO 3.5: MATRIZ DE PERSPECTIVAS
## Análisis Multi-Perspectiva del Segundo Nobel (1911)

**Tipo:** `matriz_perspectivas`
**Orden:** 5
**Puntos máximos:** 100
**Tiempo estimado:** 30 minutos
**Dificultad:** Avanzada

### Descripción del Ejercicio

Analizar el segundo Premio Nobel de Marie Curie (1911) desde **6 perspectivas diferentes**:

1. **Periodista del escándalo** (Le Petit Journal)
2. **Comité Nobel**
3. **Comunidad científica masculina**
4. **Científicas mujeres**
5. **Marie Curie** (primera persona)
6. **Pierre Curie** (si hubiera estado vivo)
7. **Polonia** (país natal ocupado)

**Para cada perspectiva, identificar:**
- **Reacción emocional:** ¿Qué siente ante el evento?
- **Opinión:** ¿Qué piensa sobre ello?
- **Consecuencias percibidas:** ¿Qué cree que ocurrirá?

---

## Perspectiva 1: Periodista Sensacionalista (Le Petit Journal)

### ✅ Análisis EXCELENTE (16-17 puntos de 100 total)

**Reacción Emocional:**
```
Excitación profesional mezclada con indignación moral fingida. El periodista ve una
oportunidad perfecta para vender periódicos mediante el contraste dramático: "científica
laureada con Nobel vs. mujer de moral cuestionable por romance con hombre casado".
La emoción dominante es oportunismo: el escándalo personal + logro científico =
narrativa irresistible para lectores.
```

**Opinión:**
```
"Este segundo Nobel complica nuestra narrativa del escándalo. Por un lado, confirma su
genio científico (difícil negar talento de alguien con 2 Nobel), pero por otro, podemos
usarlo para cuestionar si merece tal honor dada su 'moral dudosa'. La pregunta provocadora
'¿Merece el Nobel una mujer de reputación cuestionable?' venderá más ejemplares que
reportar objetivamente sobre química del radio."
```

**Consecuencias Percibidas:**
```
"Este evento generará polémica prolongada. Defensores argumentarán que ciencia y vida
personal deben separarse; críticos dirán que premios tan prestigiosos requieren carácter
intachable. Anticipamos semanas de cartas al editor, debates públicos y oportunidades
para artículos de seguimiento. Financieramente, este escándalo sostenido beneficiará
nuestras ventas. Académicamente, probablemente Marie será recordada, pero nosotros
habremos vendido miles de copias mientras tanto."
```

**Puntuación esperada:** 16-17 puntos

**Por qué es excelente:**
- Captura cinismo característico de prensa sensacionalista de época
- Identifica tensión entre reconocer logro científico y explotar escándalo personal
- Reconoce motivación económica (vender periódicos) vs. periodismo objetivo
- Usa lenguaje apropiado al contexto histórico (1911)
- Muestra comprensión de dinámica prensa-sociedad
- Anticipa consecuencias a corto plazo (debate público) y largo plazo (ventas)

---

## Perspectiva 2: Comité Nobel

### ✅ Análisis EXCELENTE (16-17 puntos)

**Reacción Emocional:**
```
Satisfacción científica con incomodidad política. El Comité siente orgullo por reconocer
trabajo científico objetivamente excepcional (aislamiento del radio es logro monumental),
pero también ansiedad ante presión pública por el escándalo Langevin. Existe tensión entre
mantener estándares científicos rigurosos vs. ceder a presiones moralizantes externas.
```

**Opinión:**
```
"El trabajo de Marie Curie en química del radio es científicamente impecable y merece el
reconocimiento más alto. Nuestra responsabilidad es evaluar excelencia científica, no
conducta personal. Establecer precedente de negar Nobel por rumores de vida privada
destruiría credibilidad e independencia de nuestro premio. Sin embargo, reconocemos que
este premio será controversial y algunos cuestionarán nuestra decisión. Debemos defender
principio de que ciencia trasciende escándalos sociales."
```

**Consecuencias Percibidas:**
```
"Anticipamos críticas de sectores conservadores que considerarán nuestra decisión como
'tolerancia de inmoralidad'. Pero a largo plazo, la historia validará que tomamos decisión
correcta basada en méritos científicos. Este premio establecerá precedente crucial: los
Nobel reconocen contribuciones intelectuales, no virtudes personales. Si cedemos a presión
moral ahora, comprometemos futura independencia del premio."
```

**Puntuación esperada:** 16-17 puntos

**Por qué es excelente:**
- Identifica dilema ético central (mérito científico vs. presión social)
- Muestra comprensión de rol institucional del Comité
- Reconoce implicaciones de largo plazo (precedente)
- Lenguaje apropiado a voz institucional formal
- Anticipa tanto críticas como validación histórica

---

## Perspectiva 3: Comunidad Científica Masculina

### ✅ Análisis EXCELENTE (16-17 puntos)

**Reacción Emocional:**
```
División marcada entre admiración por logro científico y preocupación por reputación de
la ciencia como institución seria. Científicos progresistas sienten orgullo de que colega
talentosa sea reconocida; científicos conservadores experimentan incomodidad ante idea de
que mujer con "escándalo" represente ciencia francesa. Existe tensión generacional:
jóvenes más abiertos, veteranos más tradicionales.
```

**Opinión:**
```
[Perspectiva progresista]: "El logro de Marie es indiscutible. Aisló radio puro, determinó
peso atómico, avanzó química fundamental. El escándalo personal es irrelevante para
excelencia científica. Oponerse al premio por razones morales sería hipocresía: muchos
científicos hombres han tenido vidas personales 'cuestionables' sin que eso afecte
reconocimiento profesional."

[Perspectiva conservadora]: "Si bien el trabajo científico es sólido, el escándalo amenaza
credibilidad de la ciencia francesa ante sociedad. Las instituciones científicas dependen
de respeto público para financiación. ¿Vale la pena defender a una colega si eso daña
imagen de toda la comunidad?"
```

**Consecuencias Percibidas:**
```
"Este evento forzará conversación incómoda sobre separación entre vida profesional y
personal en ciencia. A corto plazo, habrá debates internos sobre si Academia de Ciencias
debe admitir mujeres (Marie ya fue rechazada en enero 1911). A largo plazo, si Marie
continúa produciendo ciencia de calidad pese al escándalo, fortalecerá argumento de que
talento científico no depende de género ni de perfección moral. Pero si su carrera se
deteriora por presión social, reforzará prejuicios conservadores."
```

**Puntuación esperada:** 16-17 puntos

**Por qué es excelente:**
- Reconoce división interna en comunidad científica
- Presenta ambas perspectivas (progresista vs conservadora) con argumentos válidos
- Identifica doble estándar (hombres con escándalos no pierden reconocimiento)
- Conecta con eventos históricos específicos (rechazo Academia enero 1911)
- Anticipa tanto debate inmediato como impacto de largo plazo

---

## Perspectiva 4: Marie Curie (Primera Persona)

### ✅ Análisis EXCELENTE (16-17 puntos)

**Reacción Emocional:**
```
Mezcla compleja de orgullo científico profundo, agotamiento emocional extremo y rabia
contenida ante injusticia. Siento validación profesional inmensa por reconocimiento a mi
trabajo independiente en química (este Nobel es SOLO mío, a diferencia del primero que
compartí con Pierre). Pero simultáneamente experimento indignación: ¿por qué mi vida
privada es escrutinizada de manera que ningún hombre científico enfrentaría? Estoy
físicamente exhausta del acoso periodístico y herida por rechazo de Academia de Ciencias
pese a mis credenciales.
```

**Opinión:**
```
"Este segundo Nobel confirma lo que siempre supe: mi trabajo científico es excelente y
merece reconocimiento máximo. El aislamiento del radio en forma pura requirió años de
trabajo meticuloso, cálculos precisos y perseverancia física extrema. Este premio valida
esos esfuerzos.

Sin embargo, el precio personal ha sido devastador. La hipocresía de la sociedad francesa
es evidente: aplaudieron mi trabajo cuando me convino a sus narrativas de 'viuda virtuosa
dedicada a ciencia de su difunto esposo', pero me crucificaron cuando fui mujer completa
con vida emocional propia. El doble estándar es inaceptable: hombres científicos tienen
amantes sin que eso cuestione su trabajo.

El Comité Nobel tuvo coraje de separar ciencia de moralina social. Respeto eso."
```

**Consecuencias Percibidas:**
```
"Este Nobel cambiará percepción histórica de mí. Mientras algunos contemporáneos me
juzgarán más por escándalo que por ciencia, la historia me recordará por descubrimientos.
Generaciones futuras de mujeres científicas tal vez encontrarán algo de inspiración en
que persistí pese a todo.

Personalmente, sé que este escándalo me ha dañado irreparablemente en Francia. Aunque
continúe investigando, nunca seré totalmente aceptada por establishment académico francés.
Me refugiaré en trabajo científico, que nunca me traiciona como lo hace la sociedad.

A corto plazo, consideraré rechazar el Nobel para evitar más controversia. [Histórico:
Albert Einstein la convenció de aceptarlo]. A largo plazo, espero que este premio ayude
a normalizar presencia de mujeres en ciencia, aunque sea a través de mi sufrimiento."
```

**Puntuación esperada:** 16-17 puntos

**Por qué es excelente:**
- Voz en primera persona creíble y emocionalmente auténtica
- Reconoce complejidad emocional (orgullo + dolor + rabia)
- Identifica diferencia crucial: Nobel 1903 compartido vs 1911 solo suyo
- Conecta con hechos históricos (rechazo Academia, consideró rechazar Nobel)
- Muestra consciencia de doble estándar y su injusticia
- Anticipa legado a largo plazo vs sufrimiento inmediato

---

## Perspectiva 5: Pierre Curie (Contrafactual - si hubiera vivido)

### ✅ Análisis EXCELENTE (16-17 puntos)

**Reacción Emocional:**
```
[Perspectiva especulativa basada en cartas y escritos de Pierre]

Orgullo profundo por el segundo Nobel de Marie, mezclado con tristeza de no estar presente
para apoyarla durante el escándalo. Pierre experimentaría frustración intensa ante la
hipocresía social: él mismo defendió públicamente contribuciones de Marie cuando otros las
minimizaban, y ahora la sociedad la atacaría de manera que nunca hubieran atacado a un
hombre científico. Sentiría rabia impotente ante imposibilidad de protegerla del acoso
periodístico.
```

**Opinión:**
```
"El segundo Nobel de Marie valida lo que siempre sostuve: ella es científica brillante de
manera INDEPENDIENTE de mí. Durante años, observé cómo nuestro trabajo conjunto era
atribuido principalmente a mí por prejuicios de género. Este Nobel en Química, otorgado
solo a ella por trabajo posterior a mi muerte, demuestra irrefutablemente su genio autónomo.

El escándalo Langevin me indignaría profundamente. La sociedad francesa tiene audacia de
juzgar vida personal de Marie cuando su contribución científica es monumental. Si yo
estuviera vivo, habría defendido públicamente su derecho a vida privada y denunciado doble
estándar. Hubiera escrito cartas a periódicos y usado mi posición para apoyarla.

El hecho de que comité Nobel haya otorgado premio pese a presión social me restauraría
fe en integridad científica."
```

**Consecuencias Percibidas:**
```
"De haber estado presente, habría:
1. Acompañado a Marie a ceremonia en Estocolmo para demostrar apoyo público
2. Publicado defensa en journals científicos sobre separación ciencia-vida privada
3. Usado mi influencia en Academia de Ciencias para presionar por su admisión
4. Protegido físicamente a Marie y nuestras hijas del acoso periodístico

A largo plazo, confío que la historia validará a Marie. Sus descubrimientos perdurarán;
los escándalos serán olvidados. Futuras generaciones la estudiarán por radiactividad,
no por supuestas indiscreciones.

Mi tristeza es no poder presenciar este momento de triunfo con ella. Habríamos celebrado
juntos, sabiendo que este premio confirma lo que siempre supimos: Marie es una de las
mentes científicas más grandes de nuestra época."
```

**Puntuación esperada:** 16-17 puntos

**Por qué es excelente:**
- Perspectiva contrafactual creíble basada en actitud histórica de Pierre
- Reconoce que Pierre defendía públicamente contribuciones de Marie
- Identifica cómo Pierre habría respondido específicamente (cartas, defensa pública)
- Voz consistente con valores conocidos de Pierre (integridad científica)
- Conecta emoción personal (orgullo por Marie) con principios (justicia)

---

## Perspectiva 6: Polonia (Nación Ocupada)

### ✅ Análisis EXCELENTE (16-17 puntos)

**Reacción Emocional:**
```
Orgullo nacionalista intenso mezclado con frustración compleja. Los polacos sienten
exaltación patriótica: "Una de los nuestros alcanzó la cima científica mundial pese a
que Polonia está ocupada y borrada del mapa". Marie representa resiliencia polaca y
capacidad intelectual que ninguna ocupación puede suprimir. Pero simultáneamente existe
dolor porque Marie representa oficialmente a FRANCIA, no a Polonia (que no existe como
país independiente en 1911). Es símbolo de orgullo y pérdida al mismo tiempo.
```

**Opinión:**
```
"Maria Skłodowska [nombre polaco de Marie] es prueba viviente de que Polonia, aunque
ocupada militarmente, no está muerta cultural ni intelectualmente. Que una mujer polaca
nacida en Varsovia bajo ocupación rusa haya alcanzado cumbre científica mundial con DOS
Premios Nobel demuestra que el espíritu polaco sobrevive y florece incluso en exilio.

El escándalo francés nos parece hipocresía típica de potencias occidentales: cuando les
conviene, celebran a Maria; cuando no, la crucifican. Nosotros valoramos su legado
científico independientemente de juicios morales franceses.

Es amargo que Maria tuviera que emigrar para alcanzar su potencial. Si Polonia fuera
libre, con universidades abiertas a mujeres, ¿cuántas más 'Marie Curie' tendríamos? Ella
es lo que Polonia podría ser si fuéramos independientes."
```

**Consecuencias Percibidas:**
```
"Este segundo Nobel fortalece narrativa nacionalista polaca de resistencia cultural. En
escuelas clandestinas (prohibidas por ocupantes), profesores usarán ejemplo de Maria
para inspirar a estudiantes: 'La opresión política no puede suprimir genio intelectual'.

A largo plazo, cuando Polonia recupere independencia [histórico: 1918], Maria será
reclamada como heroína nacional. Habrá estatuas, escuelas con su nombre, celebraciones.
Ella será símbolo dual: excelencia científica Y resiliencia nacional.

El hecho de que ninguna universidad polaca pudo educarla (porque estábamos ocupados) se
convertirá en acusación contra ocupantes: 'Miren qué perdieron por suprimir educación
polaca'. Maria es simultáneamente celebración de lo que Polonia ES y lamento de lo que
Polonia PODRÍA HABER SIDO si fuéramos libres.

Además, el éxito de una mujer polaca desafía tanto ocupación externa como patriarcado
interno. Maria probará que mujeres polacas, dada oportunidad, pueden igualar a cualquier
hombre."
```

**Puntuación esperada:** 16-17 puntos

**Por qué es excelente:**
- Captura paradoja emocional (orgullo + frustración)
- Contexto histórico específico (Polonia ocupada 1795-1918)
- Usa nombre polaco original (Maria Skłodowska)
- Conecta logro individual con narrativa nacional de resistencia
- Anticipa uso propagandístico/educativo en escuelas clandestinas
- Reconoce que Marie es símbolo de pérdida (tuvo que emigrar) y esperanza
- Identifica doble desafío: ocupación + patriarcado

---

## ✅ Respuesta ACEPTABLE (60-75 puntos)

### Perspectiva: Periodista Sensacionalista

**Reacción emocional:**
```
Emoción porque el escándalo + Nobel = buena noticia para vender periódicos.
```

**Opinión:**
```
Marie ganó el Nobel pero su vida personal es cuestionable. Esto genera controversia.
```

**Consecuencias percibidas:**
```
Habrá debate público y nosotros venderemos más copias.
```

**Puntuación esperada:** 10-12 puntos (de 16-17 posibles)

**Por qué es aceptable:**
- Identifica elementos clave (escándalo, Nobel, vender periódicos)
- Demasiado breve y poco desarrollado
- Falta profundidad psicológica
- Válido pero superficial

---

## ❌ Respuesta INCORRECTA (0-40 puntos)

### Perspectiva: Marie Curie

**Reacción emocional:**
```
Feliz por ganar Nobel.
```

**Opinión:**
```
Es bueno ganar premios.
```

**Consecuencias percibidas:**
```
Será más famosa.
```

**Puntuación esperada:** 2-4 puntos

**Por qué es incorrecta:**
- Simplista, ignora complejidad emocional del contexto (escándalo)
- No muestra comprensión de situación histórica
- Respuestas genéricas aplicables a cualquier premiado
- Sin voz específica de la perspectiva asignada
- Ignora tensión escándalo/logro científico

---

## Tabla Resumen - Matriz de Perspectivas

| Perspectiva | Emoción Dominante | Opinión Clave | Consecuencia Principal |
|-------------|-------------------|---------------|------------------------|
| **Periodista sensacionalista** | Oportunismo | Escándalo + Nobel = ventas | Polémica prolongada |
| **Comité Nobel** | Orgullo científico + ansiedad política | Ciencia > vida privada | Precedente crucial |
| **Comunidad científica** | División (progresistas vs conservadores) | Debate mérito vs moralidad | Conversación sobre género en ciencia |
| **Marie Curie** | Orgullo + agotamiento + rabia | Trabajo validado, sociedad hipócrita | Legado científico vs sufrimiento presente |
| **Pierre Curie** | Orgullo por Marie + tristeza por ausencia | Marie es científica brillante independiente | Defensa pública si estuviera vivo |
| **Polonia ocupada** | Orgullo nacionalista + frustración | Símbolo resiliencia polaca | Heroína nacional, crítica a ocupación |

---

# RESUMEN DE PUNTUACIÓN - TODOS LOS EJERCICIOS

## Ejercicio 3.1: Tribunal de Opiniones
- **Excelente:** 80-100 puntos (clasificación + veredicto + justificación correctas)
- **Aceptable:** 50-79 puntos (clasificación correcta, justificación válida pero simple)
- **Insuficiente:** 0-49 puntos (clasificación incorrecta o sin justificación adecuada)

## Ejercicio 3.2: Debate Digital
- **Excelente:** 80-100 puntos (evidencia específica, lógica sólida, persuasivo)
- **Aceptable:** 60-79 puntos (argumentos presentes, evidencia válida pero genérica)
- **Insuficiente:** 0-59 puntos (sin evidencia, lógica débil)

## Ejercicio 3.3: Análisis de Fuentes
- **Excelente:** 90-100 puntos (orden perfecto: 5-1-3-4-2 con justificación CRAAP)
- **Aceptable:** 60-89 puntos (top 3 correctas, errores menores en últimas 2)
- **Insuficiente:** 0-59 puntos (orden incorrecto, no aplica método CRAAP)

## Ejercicio 3.4: Podcast Argumentativo
- **Excelente:** 85-100 puntos (estructura perfecta, 3+ datos, 2+ citas, 2 min duración)
- **Aceptable:** 60-84 puntos (estructura presente, evidencia válida, menos detallada)
- **Insuficiente:** 0-59 puntos (sin estructura, sin evidencia específica, muy corto)

## Ejercicio 3.5: Matriz de Perspectivas
- **Excelente:** 80-100 puntos (6 perspectivas con profundidad psicológica y contexto)
- **Aceptable:** 60-79 puntos (perspectivas presentes pero poco desarrolladas)
- **Insuficiente:** 0-59 puntos (respuestas genéricas, sin voz específica de perspectiva)

---

# 🔑 PALABRAS CLAVE PARA VALIDADORES

## Tribunal de Opiniones
**HECHO:** `["verificable", "registros", "documentado", "fecha", "oficial"]`
**OPINIÓN:** `["subjetivo", "valor", "criterio", "juicio", "preferencia"]`
**INTERPRETACIÓN:** `["deducción", "razonable", "sugiere", "probable", "evidencia circunstancial"]`

## Debate Digital
**Evidencia:** `["según", "documentado", "fecha", "fuente", "registros", "biografía", "histórico"]`
**Lógica:** `["por lo tanto", "en consecuencia", "esto demuestra", "la evidencia muestra"]`
**Conectores:** `["en primer lugar", "además", "por último", "sin embargo", "no obstante"]`

## Análisis de Fuentes (CRAAP)
**Currency:** `["actual", "reciente", "contemporáneo", "fecha", "vigente"]`
**Relevance:** `["relevante", "apropiado", "pertinente", "relacionado"]`
**Authority:** `["autor", "experto", "institución", "revisado por pares", "académico", "oficial"]`
**Accuracy:** `["verificable", "fuentes citadas", "precisión", "evidencia"]`
**Purpose:** `["propósito", "objetivo", "sesgo", "intención", "académico", "sensacionalismo"]`

## Podcast Argumentativo
**Estructura:** `["introducción", "desarrollo", "conclusión", "en primer lugar", "además"]`
**Evidencia:** `["según", "datos", "cifras", "porcentaje", "año", "fecha"]`
**Citas:** `["como afirmó", "según X", "declaró", "fuente"]`

## Matriz de Perspectivas
**Emociones:** `["orgullo", "frustración", "rabia", "tristeza", "entusiasmo", "ansiedad"]`
**Opiniones:** `["considero", "creo", "desde mi perspectiva", "opino"]`
**Consecuencias:** `["resultará en", "causará", "llevará a", "impactará", "a largo plazo"]`

---

**FIN DE LA GUÍA DE PRUEBAS**

**Fecha:** 2025-11-23
**Versión:** 1.0
**Uso:** Testing QA, validación pedagógica, capacitación
**Estado:** ✅ Completa y lista para uso

**Próximos pasos:**
1. QA: Usar estas respuestas para probar validadores del Módulo 3
2. Frontend: Verificar que componentes acepten y muestren estas respuestas correctamente
3. Backend: Validar que sistema de puntuación coincide con puntuaciones esperadas aquí
4. Pedagógico: Usar ejemplos EXCELENTES en demos con profesores

**Todos los 5 ejercicios del Módulo 3 tienen ejemplos de respuestas detalladas** ✅
