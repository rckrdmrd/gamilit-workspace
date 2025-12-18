# GUIA DE PRUEBAS - MODULO 4: LECTURA DIGITAL Y MULTIMODAL
## Ejemplos de Respuestas para Testing QA

**Fecha:** 2025-12-18
**Version:** 1.0
**Modulo:** MOD-04-DIGITAL - Lectura Digital y Multimodal
**Autor:** Database-Agent / Architecture-Analyst
**Fuente:** `apps/database/seeds/prod/educational_content/05-exercises-module4.sql`

---

## INDICE

1. [Ejercicio 4.1: Verificador de Fake News](#ejercicio-41-verificador-de-fake-news)
2. [Ejercicio 4.2: Infografia Interactiva](#ejercicio-42-infografia-interactiva)
3. [Ejercicio 4.3: Quiz TikTok](#ejercicio-43-quiz-tiktok)
4. [Ejercicio 4.4: Navegacion Hipertextual](#ejercicio-44-navegacion-hipertextual)
5. [Ejercicio 4.5: Analisis de Memes](#ejercicio-45-analisis-de-memes)
6. [Casos de Uso](#casos-de-uso)

---

## PROPOSITO DE ESTA GUIA

Esta guia proporciona **ejemplos detallados de respuestas** para cada ejercicio del Modulo 4, clasificadas en tres niveles de calidad:

- **EXCELENTE (80-100 puntos):** Respuestas completas, precisas y que demuestran comprension profunda
- **ACEPTABLE (50-79 puntos):** Respuestas parcialmente correctas con algunos errores menores
- **INCORRECTA (0-49 puntos):** Respuestas con errores significativos o informacion incorrecta

**NOTA IMPORTANTE:** Los ejercicios del Modulo 4 (excepto Quiz TikTok) **requieren revision manual** por un docente. El sistema solo valida la estructura de las respuestas, no su calidad.

**Audiencia:** QA testers, desarrolladores frontend/backend, docentes, demos

---

## EJERCICIO 4.1: VERIFICADOR DE FAKE NEWS

**Tipo:** `verificador_fake_news`
**Dificultad:** Intermediate
**Tiempo estimado:** 20 minutos
**Puntos maximos:** 100
**Puntos de aprobacion:** 70
**Requiere revision manual:** Si

### Configuracion del Ejercicio

```json
{
    "factCheckTools": true,
    "sourceVerification": true,
    "claimExtraction": true,
    "confidenceScoring": true
}
```

### Contenido del Ejercicio

**Articulo a analizar:**
- **Titulo:** "Marie Curie: La cientifica que gano 3 Premios Nobel"
- **Fuente:** Blog de ciencia popular

**Afirmaciones a verificar:**

| ID | Afirmacion | Veredicto Real | Verdad Historica |
|----|------------|----------------|------------------|
| c1 | "Marie Curie gano 3 Premios Nobel" | FALSO | Gano 2: Fisica (1903) y Quimica (1911) |
| c2 | "Descubrio el radio y el polonio" | VERDADERO | Descubiertos en 1898 |
| c3 | "Fue la primera mujer en ensenar en la Sorbona" | VERDADERO | Obtuvo catedra en 1906 |

### RESPUESTA EXCELENTE (95-100 puntos)

**Todas las afirmaciones verificadas correctamente con evidencia solida:**

```json
{
    "claims_verified": [
        {
            "claim_id": "c1",
            "is_fake": true,
            "evidence": "La afirmacion es FALSA. Marie Curie gano exactamente 2 Premios Nobel: el de Fisica en 1903 (compartido con Pierre Curie y Henri Becquerel) y el de Quimica en 1911 (en solitario). Verificado en nobelprize.org."
        },
        {
            "claim_id": "c2",
            "is_fake": false,
            "evidence": "La afirmacion es VERDADERA. Marie y Pierre Curie descubrieron el polonio en julio de 1898 y el radio en diciembre del mismo ano. Publicado en Comptes Rendus de l'Academie des Sciences."
        },
        {
            "claim_id": "c3",
            "is_fake": false,
            "evidence": "La afirmacion es VERDADERA. En 1906, tras la muerte de Pierre Curie, Marie fue nombrada profesora titular en la Sorbona, siendo la primera mujer en ocupar ese cargo. Documentado en registros de la Universidad de Paris."
        }
    ],
    "notes": "Analisis completado usando fuentes primarias: sitio oficial del Premio Nobel, archivos historicos de la Academia de Ciencias de Paris."
}
```

**Criterios cumplidos:**
- 3/3 veredictos correctos
- Evidencia detallada (>50 caracteres cada una)
- Fuentes confiables citadas
- Fechas y datos precisos

**Feedback del sistema:**
> "Excelente trabajo de verificacion. Has identificado correctamente la informacion falsa y respaldado tus conclusiones con fuentes confiables. 100/100 puntos."

---

### RESPUESTA ACEPTABLE (65-79 puntos)

**2-3 afirmaciones correctas, evidencia basica:**

```json
{
    "claims_verified": [
        {
            "claim_id": "c1",
            "is_fake": true,
            "evidence": "Es falso, gano 2 Nobel no 3."
        },
        {
            "claim_id": "c2",
            "is_fake": false,
            "evidence": "Es verdad, descubrio esos elementos."
        },
        {
            "claim_id": "c3",
            "is_fake": true,
            "evidence": "No estoy seguro pero creo que es falso."
        }
    ],
    "notes": "Verifique en internet"
}
```

**Problemas identificados:**
- Claim c3: Veredicto INCORRECTO (es verdadero, no falso)
- Evidencia muy corta para c1 y c2 (pero >= 10 caracteres)
- Evidencia de c3 muestra incertidumbre
- Fuentes no especificadas

**Scoring:**
- 2/3 veredictos correctos = 67 puntos base
- Evidencia minima = -5 puntos
- Total: ~62-70 puntos

**Feedback del sistema:**
> "Buen intento, pero hay errores. La afirmacion sobre la Sorbona ES verdadera - Marie fue la primera mujer profesora alli. Tus evidencias necesitan mas detalle y fuentes especificas. 68/100 puntos."

---

### RESPUESTA INCORRECTA (0-49 puntos)

**Escenario 1: Veredictos invertidos**

```json
{
    "claims_verified": [
        {
            "claim_id": "c1",
            "is_fake": false,
            "evidence": "Marie Curie gano muchos premios."
        },
        {
            "claim_id": "c2",
            "is_fake": true,
            "evidence": "No descubrio nada, solo ayudaba."
        }
    ],
    "notes": ""
}
```

**Errores criticos:**
- c1: Veredicto INCORRECTO (la afirmacion de 3 Nobel es falsa)
- c2: Veredicto INCORRECTO (si descubrio radio y polonio)
- c3: No verificado (falta completamente)
- Evidencias incorrectas y sexistas
- Notas vacias

**Scoring:**
- 0/3 veredictos correctos = 0 puntos base
- Afirmacion incompleta (falta c3) = -20 puntos
- Total: 0-20 puntos

**Feedback del sistema:**
> "Tus verificaciones son incorrectas. Marie Curie SI descubrio el radio y el polonio - esto esta documentado historicamente. Ademas, solo gano 2 Nobel, no 3 como afirma el articulo. Por favor, usa las herramientas de verificacion proporcionadas. 15/100 puntos."

---

**Escenario 2: Estructura invalida**

```json
{
    "claims_verified": "No se que poner aqui",
    "evidence": "Todo es verdad"
}
```

**Error de validacion:**
- `claims_verified` debe ser un array, no string
- Falta estructura requerida por claim
- El sistema rechaza la respuesta antes de evaluacion

**Feedback del sistema:**
> "Error de formato: El campo 'claims_verified' debe ser un array de objetos con claim_id, is_fake y evidence. Por favor, corrige la estructura."

---

### Validacion Backend

```sql
-- Validar estructura
SELECT * FROM educational_content.validate_module4_module5_answer(
    'verificador_fake_news',
    '{
        "claims_verified": [
            {"claim_id": "c1", "is_fake": true, "evidence": "Evidencia de al menos 10 caracteres"}
        ]
    }'::jsonb,
    100
);
-- Resultado: is_valid=TRUE, requires_manual_review=TRUE
```

---

## EJERCICIO 4.2: INFOGRAFIA INTERACTIVA

**Tipo:** `infografia_interactiva`
**Dificultad:** Intermediate
**Tiempo estimado:** 15 minutos
**Puntos maximos:** 100
**Puntos de aprobacion:** 70
**Requiere revision manual:** Si

### Configuracion del Ejercicio

```json
{
    "interactiveElements": true,
    "dataVisualization": true,
    "clickableRegions": true
}
```

### Contenido del Ejercicio

**Titulo de la Infografia:** "Marie Curie: 150 Anos de Legado Cientifico"

**Secciones disponibles:**

| ID | Tipo | Contenido |
|----|------|-----------|
| timeline | Visual timeline | 1867-1934: Principales hitos de su vida |
| discoveries | Icon grid | Radio, Polonio, Radioactividad |
| impact | Flowchart | Descubrimientos - Medicina nuclear - Tratamientos de cancer |

**Preguntas:**
1. Cuantos anos vivio Marie Curie? (Ubicacion: timeline)
2. Que aplicacion medica surgio de sus descubrimientos? (Ubicacion: impact)

### RESPUESTA EXCELENTE (95-100 puntos)

```json
{
    "answers": {
        "q1": "67 anos (nacio en 1867 y fallecio en 1934)",
        "q2": "Tratamientos de cancer mediante radioterapia, que utiliza radiacion para destruir celulas cancerosas"
    },
    "sections_explored": ["timeline", "discoveries", "impact"]
}
```

**Criterios cumplidos:**
- Ambas respuestas correctas y detalladas
- Todas las secciones exploradas
- Conexion clara entre datos visuales y respuestas

**Feedback del sistema:**
> "Excelente! Has extraido correctamente la informacion de la infografia y explorado todas las secciones. 100/100 puntos."

---

### RESPUESTA ACEPTABLE (65-79 puntos)

```json
{
    "answers": {
        "q1": "67",
        "q2": "Medicina"
    },
    "sections_explored": ["timeline", "impact"]
}
```

**Problemas identificados:**
- Respuestas correctas pero muy breves
- No exploro la seccion "discoveries"
- Falta contexto en las respuestas

**Scoring:**
- Respuestas basicas correctas: 70 puntos
- Seccion faltante: -10 puntos
- Total: ~70-75 puntos

**Feedback del sistema:**
> "Respuestas correctas pero podrian ser mas completas. No exploraste la seccion 'discoveries'. Intenta profundizar mas en cada seccion. 72/100 puntos."

---

### RESPUESTA INCORRECTA (0-49 puntos)

```json
{
    "answers": {
        "q1": "100 anos",
        "q2": "Electricidad"
    },
    "sections_explored": []
}
```

**Errores criticos:**
- q1: Incorrecto (vivio 67 anos, no 100)
- q2: Incorrecto (no esta relacionada con electricidad)
- No exploro ninguna seccion

**Feedback del sistema:**
> "Respuestas incorrectas. Marie Curie vivio 67 anos (1867-1934). Sus descubrimientos llevaron a tratamientos de cancer, no a electricidad. Debes explorar la infografia para encontrar las respuestas. 20/100 puntos."

---

### Validacion Backend

```sql
SELECT * FROM educational_content.validate_module4_module5_answer(
    'infografia_interactiva',
    '{
        "answers": {"q1": "67 anos"},
        "sections_explored": ["timeline"]
    }'::jsonb,
    100
);
-- Resultado: is_valid=TRUE (estructura valida), requires_manual_review=TRUE
```

---

## EJERCICIO 4.3: QUIZ TIKTOK

**Tipo:** `quiz_tiktok`
**Dificultad:** Elementary
**Tiempo estimado:** 5 minutos (10 segundos por pregunta)
**Puntos maximos:** 100
**Puntos de aprobacion:** 70
**Requiere revision manual:** No (evaluacion automatica)
**Intentos maximos:** 5

### Configuracion del Ejercicio

```json
{
    "timeLimit": 10,
    "swipeInterface": true,
    "quickFeedback": true,
    "sharable": true
}
```

### Preguntas y Respuestas Correctas

| # | Pregunta | Opciones | Indice Correcto | Respuesta |
|---|----------|----------|-----------------|-----------|
| 1 | En que ciudad nacio Marie Curie? | Paris, Varsovia, Berlin, Londres | **1** | Varsovia |
| 2 | Cuantos Premios Nobel gano? | 1, 2, 3, 4 | **1** | 2 |
| 3 | Que elemento nombro por su pais? | Radio, Curio, Polonio, Francio | **2** | Polonio |

### RESPUESTA EXCELENTE (100 puntos)

```json
{
    "answers": [1, 1, 2],
    "time_per_question": [6.2, 4.8, 7.1]
}
```

**Scoring automatico:**
- 3/3 correctas = 100 puntos
- Tiempo promedio: 6.03 segundos (dentro del limite)

**Feedback del sistema:**
> "Perfecto! 3/3 respuestas correctas. Conoces muy bien los datos sobre Marie Curie. 100/100 puntos + 100 XP."

---

### RESPUESTA ACEPTABLE (67 puntos)

```json
{
    "answers": [1, 1, 0],
    "time_per_question": [8.9, 5.2, 9.8]
}
```

**Scoring automatico:**
- Pregunta 1: Correcto (indice 1 = Varsovia)
- Pregunta 2: Correcto (indice 1 = 2)
- Pregunta 3: Incorrecto (indice 0 = Radio, correcto era 2 = Polonio)
- 2/3 correctas = 67 puntos

**Feedback del sistema:**
> "Bien! 2/3 respuestas correctas. El elemento que nombro por Polonia es el POLONIO (Polska = Polonia). 67/100 puntos."

---

### RESPUESTA INCORRECTA (0-33 puntos)

```json
{
    "answers": [0, 2, 3],
    "time_per_question": [10.0, 10.0, 10.0]
}
```

**Scoring automatico:**
- Pregunta 1: Incorrecto (indice 0 = Paris, correcto era 1 = Varsovia)
- Pregunta 2: Incorrecto (indice 2 = 3, correcto era 1 = 2)
- Pregunta 3: Incorrecto (indice 3 = Francio, correcto era 2 = Polonio)
- 0/3 correctas = 0 puntos
- Tiempos al limite sugieren que adivino

**Feedback del sistema:**
> "0/3 respuestas correctas. Marie Curie nacio en VARSOVIA, gano 2 Premios Nobel, y nombro al POLONIO por su pais natal Polonia. 0/100 puntos. Te quedan 4 intentos."

---

### Validacion Backend (Automatica)

```javascript
const correctAnswers = [1, 1, 2];

function validateQuizTikTok(userAnswers) {
    if (!Array.isArray(userAnswers) || userAnswers.length === 0) {
        return { valid: false, error: 'answers debe ser un array no vacio' };
    }

    let correct = 0;
    for (let i = 0; i < Math.min(userAnswers.length, correctAnswers.length); i++) {
        if (typeof userAnswers[i] !== 'number' || userAnswers[i] < 0) {
            return { valid: false, error: `Respuesta ${i+1} debe ser un numero >= 0` };
        }
        if (userAnswers[i] === correctAnswers[i]) {
            correct++;
        }
    }

    const score = Math.round((correct / correctAnswers.length) * 100);
    return {
        valid: true,
        score: score,
        correctCount: correct,
        totalCount: correctAnswers.length
    };
}
```

---

## EJERCICIO 4.4: NAVEGACION HIPERTEXTUAL

**Tipo:** `navegacion_hipertextual`
**Dificultad:** Intermediate
**Tiempo estimado:** 15 minutos
**Puntos maximos:** 100
**Puntos de aprobacion:** 70
**Requiere revision manual:** Si

### Configuracion del Ejercicio

```json
{
    "hyperlinks": true,
    "pathTracking": true,
    "informationSynthesis": true
}
```

### Pregunta de Investigacion

**"Que experimentos realizo Marie Curie para aislar el radio?"**

### Estructura del Articulo

```
mainArticle
    |-- [radioactividad] --> Historia de la radiactividad (relevancia: alta)
    |-- [aislamiento] --> Proceso de aislamiento del radio (relevancia: MUY ALTA)
            |-- [proceso] --> Detalles del experimento (relevancia: MUY ALTA)
```

**Ruta optima:** mainArticle --> aislamiento --> proceso (3 pasos)

### RESPUESTA EXCELENTE (95-100 puntos)

```json
{
    "path": ["mainArticle", "aislamiento", "proceso"],
    "information_found": {
        "experiment_type": "Cristalizacion fraccionada de sales de bario",
        "materials": "8 toneladas de pechblenda (mineral de uranio)",
        "duration": "4 anos de trabajo (1898-1902)",
        "result": "Aislaron 0.1 gramos de cloruro de radio puro",
        "method": "Disolucion, precipitacion y cristalizacion repetida para separar elementos por peso atomico",
        "conditions": "Trabajaron en un cobertizo sin ventilacion adecuada, expuestos a radiacion"
    }
}
```

**Criterios cumplidos:**
- Ruta optima (3 pasos = 100% eficiencia)
- Informacion completa y detallada
- Multiples aspectos del experimento documentados

**Feedback del sistema:**
> "Excelente navegacion! Encontraste la ruta mas eficiente y extrajiste informacion completa sobre los experimentos de Marie Curie. 100/100 puntos."

---

### RESPUESTA ACEPTABLE (65-79 puntos)

```json
{
    "path": ["mainArticle", "radioactividad", "historia", "aislamiento", "proceso"],
    "information_found": {
        "experiment_type": "Cristalizacion",
        "result": "Aislaron radio"
    }
}
```

**Problemas identificados:**
- Ruta larga (5 pasos vs 3 optimos) = -20 puntos eficiencia
- Informacion incompleta (faltan detalles importantes)
- Paso por enlace irrelevante (radioactividad, historia)

**Scoring:**
- Informacion encontrada: 50 puntos
- Eficiencia de navegacion: 60% = -12 puntos
- Total: ~70 puntos

**Feedback del sistema:**
> "Encontraste informacion basica, pero tu ruta fue ineficiente. Evita enlaces que no responden directamente a la pregunta. Faltan detalles como materiales usados y duracion. 70/100 puntos."

---

### RESPUESTA INCORRECTA (0-49 puntos)

```json
{
    "path": ["mainArticle"],
    "information_found": {
        "answer": "No encontre la informacion"
    }
}
```

**Errores criticos:**
- Solo 1 paso (no navego los enlaces)
- No encontro informacion relevante
- Ruta insuficiente (minimo 2 elementos)

**Validacion fallida:**
> "El array 'path' debe tener al menos 2 elementos (inicio y destino)"

**Feedback del sistema:**
> "No navegaste los enlaces del articulo. La informacion sobre los experimentos esta en la seccion 'aislamiento de elementos radiactivos'. Debes seguir los hipervinculos relevantes. 0/100 puntos."

---

### Validacion Backend

```sql
SELECT * FROM educational_content.validate_module4_module5_answer(
    'navegacion_hipertextual',
    '{
        "path": ["mainArticle", "aislamiento"],
        "information_found": {"experiment": "Cristalizacion fraccionada"}
    }'::jsonb,
    100
);
-- Resultado: is_valid=TRUE, requires_manual_review=TRUE
```

---

## EJERCICIO 4.5: ANALISIS DE MEMES

**Tipo:** `analisis_memes`
**Dificultad:** Intermediate
**Tiempo estimado:** 12 minutos
**Puntos maximos:** 100
**Puntos de aprobacion:** 70
**Requiere revision manual:** Si

### Configuracion del Ejercicio

```json
{
    "visualAnalysis": true,
    "culturalReferences": true,
    "humorDecoding": true
}
```

### Meme a Analizar

| Aspecto | Detalle |
|---------|---------|
| ID | meme1 |
| Formato | Drake Hotline Bling |
| Top Text | "Proteccion contra radiacion" |
| Bottom Text | "Seguir experimentando sin proteccion" |
| Imagen | Marie Curie en su laboratorio |

### RESPUESTA EXCELENTE (95-100 puntos)

```json
{
    "annotations": [
        {
            "element": "top_panel",
            "interpretation": "El gesto de rechazo de Drake representa lo que Marie Curie NO hacia: usar proteccion contra la radiacion"
        },
        {
            "element": "bottom_panel",
            "interpretation": "El gesto de aprobacion representa lo que Marie Curie SI hacia: continuar sus experimentos sin preocuparse por la proteccion"
        },
        {
            "element": "meme_format",
            "interpretation": "El formato Drake se usa para mostrar preferencias ironicas o contradictorias, aqui se aplica para crear humor sobre las decisiones de Curie"
        },
        {
            "element": "historical_context",
            "interpretation": "En la epoca de Curie (1900s), no se conocian bien los peligros de la radiacion. Sus cuadernos aun son radiactivos hoy"
        }
    ],
    "analysis": {
        "message": "Marie Curie priorizaba su investigacion cientifica sobre su seguridad personal, trabajando con materiales radiactivos sin proteccion porque en su epoca no se comprendian los riesgos",
        "humor_type": "Ironia historica - el contraste entre lo que sabemos hoy (la radiacion es peligrosa) y lo que ella hacia (ignorar proteccion)",
        "cultural_reference": "Meme Drake Hotline Bling, formato viral desde 2015 usado para mostrar preferencias",
        "historical_accuracy": true,
        "accuracy_explanation": "Es historicamente exacto. Marie Curie manipulaba muestras radiactivas con las manos desnudas, llevaba tubos de ensayo en los bolsillos, y eventualmente murio de anemia aplasica causada por exposicion a radiacion"
    }
}
```

**Criterios cumplidos:**
- 4 anotaciones detalladas de elementos
- Mensaje principal identificado correctamente
- Tipo de humor explicado
- Referencia cultural reconocida
- Evaluacion historica precisa con justificacion

**Feedback del sistema:**
> "Analisis excelente! Has decodificado todos los elementos del meme, identificado la ironia historica, y evaluado correctamente su precision. 100/100 puntos."

---

### RESPUESTA ACEPTABLE (65-79 puntos)

```json
{
    "annotations": [
        {
            "element": "imagen",
            "interpretation": "Es Drake diciendo si y no"
        },
        {
            "element": "texto",
            "interpretation": "Habla sobre proteccion"
        }
    ],
    "analysis": {
        "message": "Marie Curie no usaba proteccion",
        "humor_type": "Es gracioso",
        "cultural_reference": "Meme de internet",
        "historical_accuracy": true,
        "accuracy_explanation": "Creo que es verdad"
    }
}
```

**Problemas identificados:**
- Anotaciones muy genericas (no explican el significado)
- Mensaje correcto pero sin profundidad
- Tipo de humor no especificado
- Referencia cultural vaga
- Justificacion de precision insuficiente

**Scoring:**
- Mensaje identificado: 30 puntos
- Anotaciones basicas: 20 puntos
- Formato reconocido parcialmente: 10 puntos
- Precision correcta sin justificacion: 10 puntos
- Total: ~70 puntos

**Feedback del sistema:**
> "Identificaste el mensaje basico, pero tu analisis necesita mas profundidad. Explica POR QUE es gracioso (ironia historica), y da detalles sobre por que es historicamente exacto. 70/100 puntos."

---

### RESPUESTA INCORRECTA (0-49 puntos)

**Escenario 1: Analisis superficial**

```json
{
    "annotations": [],
    "analysis": {
        "message": "No entiendo el meme"
    }
}
```

**Errores criticos:**
- Sin anotaciones (array vacio)
- Campo analysis.message demasiado corto/no informativo
- Faltan campos requeridos (humor_type, cultural_reference, etc.)

**Validacion fallida:**
> "Campo 'analysis.message' no puede estar vacio"

---

**Escenario 2: Interpretacion incorrecta**

```json
{
    "annotations": [
        {
            "element": "drake",
            "interpretation": "Drake es un cantante famoso"
        }
    ],
    "analysis": {
        "message": "Drake esta enojado con Marie Curie",
        "humor_type": "Comedia de celebridades",
        "cultural_reference": "Cancion de Drake",
        "historical_accuracy": false,
        "accuracy_explanation": "Marie Curie nunca conocio a Drake"
    }
}
```

**Errores criticos:**
- No entendio que es un formato de meme, no sobre Drake literal
- Mensaje principal completamente incorrecto
- Tipo de humor incorrecto
- Evaluacion de precision incorrecta (el meme SI es historicamente exacto)

**Feedback del sistema:**
> "Tu interpretacion es incorrecta. Este es un formato de meme llamado 'Drake Hotline Bling' que se usa para mostrar preferencias ironicas. El meme habla sobre como Marie Curie trabajaba sin proteccion contra radiacion, no sobre Drake personalmente. 25/100 puntos."

---

### Validacion Backend

```sql
SELECT * FROM educational_content.validate_module4_module5_answer(
    'analisis_memes',
    '{
        "annotations": [
            {"element": "top_panel", "interpretation": "Representa rechazo"}
        ],
        "analysis": {
            "message": "Marie Curie no usaba proteccion"
        }
    }'::jsonb,
    100
);
-- Resultado: is_valid=TRUE, requires_manual_review=TRUE
```

---

## CASOS DE USO

### 1. Testing QA Manual

**Objetivo:** Verificar que el frontend maneja correctamente las respuestas del Modulo 4

**Procedimiento:**
1. Usar ejemplos de "RESPUESTA EXCELENTE" para verificar flujo completo
2. Usar ejemplos de "RESPUESTA ACEPTABLE" para verificar feedback parcial
3. Usar ejemplos de "RESPUESTA INCORRECTA" para verificar validacion de errores
4. Probar estructuras invalidas para verificar mensajes de error

**Checklist de validacion:**

- [ ] Verificador Fake News: Valida array claims_verified con estructura correcta
- [ ] Infografia: Valida answers{} y sections_explored[]
- [ ] Quiz TikTok: Scoring automatico funciona correctamente (0/33/67/100)
- [ ] Navegacion: Valida path[] con minimo 2 elementos
- [ ] Memes: Valida annotations[] y analysis{} con message

---

### 2. Testing Backend/API

**Endpoint:** `POST /api/v1/student/exercises/{exerciseId}/submit`

**Test Case 4.1: Verificador Fake News - Respuesta valida**
```json
{
    "exerciseId": "uuid-verificador",
    "answers": {
        "claims_verified": [
            {"claim_id": "c1", "is_fake": true, "evidence": "Marie Curie gano 2 Nobel, no 3"}
        ]
    }
}
```
**Respuesta esperada:**
```json
{
    "structureValid": true,
    "requiresManualReview": true,
    "message": "Respuesta registrada. Un docente evaluara tu trabajo."
}
```

**Test Case 4.3: Quiz TikTok - Scoring automatico**
```json
{
    "exerciseId": "uuid-quiz-tiktok",
    "answers": {
        "answers": [1, 1, 2]
    }
}
```
**Respuesta esperada:**
```json
{
    "score": 100,
    "passed": true,
    "correctCount": 3,
    "totalCount": 3,
    "requiresManualReview": false
}
```

---

### 3. Demos Pedagogicas

**Flujo de demo (15 minutos):**

1. **Verificador Fake News (4 min):**
   - Mostrar articulo con afirmaciones mixtas
   - Demostrar uso de herramientas de verificacion
   - Mostrar como estructurar evidencia

2. **Infografia Interactiva (3 min):**
   - Explorar secciones clickeables
   - Extraer datos de visualizaciones
   - Responder preguntas basadas en graficos

3. **Quiz TikTok (2 min):**
   - Mostrar interfaz de 10 segundos
   - Demostrar feedback inmediato
   - Mostrar scoring automatico

4. **Navegacion Hipertextual (3 min):**
   - Mostrar pregunta de investigacion
   - Navegar enlaces relevantes
   - Sintetizar informacion encontrada

5. **Analisis de Memes (3 min):**
   - Identificar formato del meme
   - Explicar elementos visuales y textuales
   - Evaluar precision historica

---

### 4. Rubricas para Docentes

**Verificador de Fake News (Revision Manual):**

| Criterio | 0-25 | 26-50 | 51-75 | 76-100 |
|----------|------|-------|-------|--------|
| Veredictos | 0-1 correcto | 2 correctos | Todos correctos | Todos correctos + justificacion |
| Evidencia | Ausente | Presente pero vaga | Clara y relevante | Detallada con fuentes |
| Fuentes | No citadas | Fuentes dudosas | Fuentes confiables | Multiples fuentes verificables |

**Analisis de Memes (Revision Manual):**

| Criterio | 0-25 | 26-50 | 51-75 | 76-100 |
|----------|------|-------|-------|--------|
| Mensaje | No identificado | Parcial | Correcto | Correcto + contexto |
| Formato | No reconocido | Parcial | Identificado | Identificado + explicacion uso |
| Humor | No explicado | "Es gracioso" | Tipo identificado | Tipo + mecanismo explicado |
| Historia | Incorrecto | Sin evaluar | Correcto | Correcto + evidencia |

---

## REFERENCIAS

### Fuente de Verdad
- **Seeds PROD:** `apps/database/seeds/prod/educational_content/05-exercises-module4.sql`
- **Documento de Diseno:** `docs/00-vision-general/DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md` lineas 782-965
- **Validador SQL:** `apps/database/ddl/schemas/educational_content/functions/23-validate_module4_module5.sql`

### Frontend Components
- `apps/frontend/src/features/mechanics/module4/VerificadorFakeNews/`
- `apps/frontend/src/features/mechanics/module4/InfografiaInteractiva/`
- `apps/frontend/src/features/mechanics/module4/QuizTikTok/`
- `apps/frontend/src/features/mechanics/module4/NavegacionHipertextual/`
- `apps/frontend/src/features/mechanics/module4/AnalisisMemes/`

### Documentacion Relacionada
- `docs/90-transversal/EJERCICIOS-PREGUNTAS-RESPUESTAS.md` (seccion Modulo 4)

---

## CONCLUSION

Esta guia proporciona **ejemplos exhaustivos** de respuestas en 3 niveles de calidad para todos los ejercicios del Modulo 4. Usala para:

- **QA:** Validar estructura de respuestas y feedback del sistema
- **Desarrollo:** Implementar componentes con test data realista
- **Demos:** Mostrar funcionalidad a stakeholders
- **Docentes:** Entender criterios de evaluacion para revision manual
- **Testing API:** Verificar endpoints de validacion y scoring

**IMPORTANTE:** Solo el Quiz TikTok tiene evaluacion automatica. Los otros 4 ejercicios del Modulo 4 requieren revision manual por un docente.

---

**Documento generado:** 2025-12-18
**Autor:** Database-Agent / Architecture-Analyst
**Version:** 1.0
**Estado:** Listo para uso en QA, desarrollo y demos
