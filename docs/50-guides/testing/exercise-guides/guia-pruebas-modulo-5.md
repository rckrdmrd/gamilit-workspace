---
titulo: Guía de Pruebas Módulo 5 Producción Creativa
tipo: guia
dominio: testing
ultima_actualizacion: 2026-02-27
---

# GUIA DE PRUEBAS - MODULO 5: PRODUCCION CREATIVA
## Ejemplos de Respuestas para Testing QA

**Fecha:** 2025-12-18
**Version:** 1.0
**Modulo:** MOD-05-PRODUCCION - Produccion y Expresion Lectora
**Autor:** Database-Agent / Architecture-Analyst
**Fuente:** `apps/database/seeds/prod/educational_content/06-exercises-module5.sql`

---

## INDICE

1. [Ejercicio 5.1: Diario Multimedia](#ejercicio-51-diario-multimedia)
2. [Ejercicio 5.2: Comic Digital](#ejercicio-52-comic-digital)
3. [Ejercicio 5.3: Video-Carta](#ejercicio-53-video-carta)
4. [Casos de Uso](#casos-de-uso)

---

## PROPOSITO DE ESTA GUIA

Esta guia proporciona **ejemplos detallados de respuestas** para cada ejercicio del Modulo 5, clasificadas en tres niveles de calidad:

- **EXCELENTE (80-100 puntos):** Respuestas completas, creativas y que demuestran comprension profunda del personaje
- **ACEPTABLE (50-79 puntos):** Respuestas parcialmente correctas con algunos errores o falta de profundidad
- **INCORRECTA (0-49 puntos):** Respuestas con errores significativos, anacronismos o falta de comprension

**NOTA IMPORTANTE:**
- **TODOS los ejercicios del Modulo 5 requieren revision manual** por un docente
- El estudiante solo necesita completar **1 de los 3 ejercicios** para aprobar el modulo
- Cada ejercicio otorga **500 XP** (alcanzando el rango K'UK'ULKAN)

**Audiencia:** QA testers, desarrolladores frontend/backend, docentes, demos

---

## EJERCICIO 5.1: DIARIO MULTIMEDIA

**Tipo:** `diario_multimedia`
**Dificultad:** Intermediate
**Tiempo estimado:** 40 minutos
**XP:** 500
**Puntos de aprobacion:** 70
**Requiere revision manual:** Si

### Configuracion del Ejercicio

```json
{
    "allowMultimedia": true,
    "minEntries": 3,
    "maxEntries": 5,
    "formats": ["text", "image", "audio", "video"],
    "minWordsPerEntry": 150,
    "maxWordsPerEntry": 400,
    "requireDates": true,
    "historicalAccuracyRequired": true,
    "multimediaOptional": true,
    "layouts": ["simple", "journal", "notebook", "letter"],
    "fonts": ["handwriting", "typewriter", "modern"],
    "autoSave": true,
    "characterLimit": 2000
}
```

### Contenido del Ejercicio

**Contexto:** El estudiante escribe un diario desde la perspectiva de Marie Curie durante el descubrimiento del radio (1898-1899).

**Prompts disponibles:**

| # | Fecha | Titulo | Mood |
|---|-------|--------|------|
| 1 | 1898-12-15 | El Dia del Descubrimiento | excitement |
| 2 | 1898-12-20 | Reflexiones sobre Dificultades | determination |
| 3 | 1898-12-26 | Suenos para el Futuro | hope |
| 4 | 1899-01-05 | Primera Aplicacion Medica | anticipation |
| 5 | 1899-02-14 | Amor y Ciencia | love |

### RESPUESTA EXCELENTE (95-100 puntos)

**3 entradas completas con precision historica y profundidad emocional:**

```json
{
    "entries": [
        {
            "id": "entry1",
            "date": "1898-12-15",
            "title": "El Dia del Descubrimiento",
            "content": "Querido diario,\n\nHoy, 15 de diciembre de 1898, es un dia que nunca olvidare. Despues de cuatro anos de trabajo incansable, Pierre y yo finalmente lo logramos. En la oscuridad de nuestro laboratorio, el radio brillo con una luz azul-verde eterea que parecia magica.\n\nMis manos estan agrietadas por el frio y el trabajo con acidos. He procesado toneladas de pechblenda en ese hangar helado. Hubo dias donde dude, donde el cansancio era insoportable. Pero hoy, todo cobra sentido.\n\nEl radio pesa apenas 0.1 gramos, pero representa anos de fe, perseverancia y amor por la ciencia. Pierre me abrazo cuando vimos la luminiscencia. No dijimos nada; no hacian falta palabras.\n\nEste descubrimiento abrira nuevas puertas en fisica y, espero, en medicina. Imagino un futuro donde la radiactividad ayude a curar enfermedades. Pero por ahora, simplemente contemplo este pequeno milagro brillante.\n\nCon emocion y gratitud,\nMarie",
            "mood": "excitement",
            "weather": "Frio invernal en Paris",
            "location": "Laboratorio en Rue Lhomond",
            "wordCount": 172,
            "multimedia": null,
            "template": "template_classic"
        },
        {
            "id": "entry2",
            "date": "1898-12-20",
            "title": "Reflexiones sobre Dificultades",
            "content": "Querido diario,\n\nCinco dias han pasado desde el descubrimiento. El entusiasmo inicial da paso a la reflexion. Miro mis manos marcadas por los acidos y recuerdo cada hora en ese cobertizo sin calefaccion.\n\nCuatro anos. Cuatro anos de procesar toneladas de pechblenda en condiciones que nadie deberia soportar. Hubo noches donde Pierre y yo apenas teniamos dinero para comer. Recuerdo el invierno de 1896, cuando el frio era tan intenso que mis instrumentos se congelaban.\n\nPero nunca me permiti la derrota. Cada vez que sentia el agotamiento vencerme, miraba a Pierre. Su fe inquebrantable en nuestro trabajo me daba fuerzas. El es mi roca, mi companero en esta aventura cientifica que pocos comprenden.\n\nLos sacrificios fueron enormes. Nuestra hija Irene apenas me ve. El dinero es escaso. Pero la ciencia exige dedicacion total. Solo espero que algun dia Irene entienda por que su madre pasaba mas tiempo en el laboratorio que en casa.\n\nCon determinacion renovada,\nMarie",
            "mood": "determination",
            "weather": "Nieve ligera",
            "location": "Apartamento en Paris",
            "wordCount": 186,
            "multimedia": null,
            "template": "template_classic"
        },
        {
            "id": "entry3",
            "date": "1898-12-26",
            "title": "Suenos para el Futuro",
            "content": "Querido diario,\n\nNavidad ha pasado silenciosamente. Pierre y yo intercambiamos pequenos regalos, pero nuestro verdadero regalo es el radio que brilla en el laboratorio.\n\nHoy reflexiono sobre el futuro. Este elemento que hemos aislado tiene propiedades extraordinarias. Ya hemos observado que puede afectar tejido biologico. Imagino medicos usando radiacion para destruir tumores, para curar enfermedades que hoy son sentencias de muerte.\n\nPero tambien pienso en los peligros. Esta sustancia es poderosa. En manos equivocadas, podria causar dano. Los cientificos tenemos una responsabilidad enorme: buscar la verdad, pero tambien proteger a la humanidad de los peligros de nuestros descubrimientos.\n\nComo mujer en la ciencia, enfrento obstaculos adicionales. Los colegas hombres a veces me miran con escepticismo. Pero cada descubrimiento es mi respuesta silenciosa. Espero que las mujeres del futuro no tengan que luchar tanto por el reconocimiento que merecen.\n\nQue el nuevo siglo traiga mas luz al mundo, literal y figurativamente.\n\nCon esperanza,\nMarie",
            "mood": "hope",
            "weather": "Noche clara y fria",
            "location": "Junto a la ventana del apartamento",
            "wordCount": 195,
            "multimedia": null,
            "template": "template_classic"
        }
    ],
    "totalEntries": 3,
    "totalWords": 553,
    "submittedAt": "2025-01-15T14:30:00Z"
}
```

**Criterios cumplidos:**
- 3 entradas completas (minimo requerido)
- Todas >150 palabras
- Precision historica impecable (fechas, contexto, detalles)
- Voz autentica de Marie Curie
- Profundidad emocional conmovedora
- Referencias a Pierre, Irene, condiciones del laboratorio
- Reflexiones sobre igualdad de genero y responsabilidad cientifica

**Feedback del sistema:**
> "Excelente trabajo! Tu diario captura magistralmente la voz de Marie Curie. La precision historica es impecable y la profundidad emocional es conmovedora. Has demostrado verdadera empatia con el personaje. 100/100 puntos."

---

### RESPUESTA ACEPTABLE (65-79 puntos)

**3 entradas basicas, correctas pero poco profundas:**

```json
{
    "entries": [
        {
            "id": "entry1",
            "date": "1898-12-15",
            "title": "El Dia del Descubrimiento",
            "content": "Querido diario,\n\nHoy descubrimos el radio. Pierre y yo estamos muy contentos. El radio brilla en la oscuridad y es muy bonito. Trabajamos mucho tiempo para encontrarlo.\n\nEl laboratorio esta frio pero no importa porque estamos felices. Marie.",
            "mood": "excitement",
            "wordCount": 42,
            "template": "template_classic"
        },
        {
            "id": "entry2",
            "date": "1898-12-20",
            "title": "Dificultades",
            "content": "Querido diario,\n\nFue dificil trabajar estos anos. El laboratorio no tenia calefaccion. Pero Pierre me ayudo mucho. Juntos pudimos hacer el descubrimiento.\n\nMarie.",
            "mood": "determination",
            "wordCount": 29,
            "template": "template_classic"
        },
        {
            "id": "entry3",
            "date": "1898-12-26",
            "title": "El Futuro",
            "content": "Querido diario,\n\nEspero que el radio ayude a la medicina. Seria bueno poder curar enfermedades con el. La ciencia es importante.\n\nMarie.",
            "mood": "hope",
            "wordCount": 24,
            "template": "template_classic"
        }
    ],
    "totalEntries": 3,
    "totalWords": 95,
    "submittedAt": "2025-01-15T14:30:00Z"
}
```

**Problemas identificados:**
- Entradas muy cortas (<150 palabras cada una)
- Falta profundidad emocional
- Voz generica (no captura personalidad de Marie)
- Sin detalles historicos especificos
- Sin referencias a Irene, la Sorbona, u otros detalles biograficos

**Scoring:**
- Estructura correcta: 40 puntos
- Entradas presentes: 20 puntos
- Precision historica basica: 10 puntos
- Total: ~70 puntos

**Feedback del sistema:**
> "Tus entradas cumplen con los requisitos basicos pero son muy cortas y poco profundas. Investiga mas sobre la vida de Marie Curie e incluye detalles especificos sobre su laboratorio, su familia, y sus emociones. Las entradas deben tener al menos 150 palabras cada una. 68/100 puntos."

---

### RESPUESTA INCORRECTA (0-49 puntos)

**Escenario 1: Anacronismos y errores historicos**

```json
{
    "entries": [
        {
            "id": "entry1",
            "date": "1898-12-15",
            "title": "Descubrimiento",
            "content": "Querido diario,\n\nHoy descubrimos el radio. Le mande un mensaje de texto a mi mama para contarle. Despues vi las noticias en la television sobre otros cientificos.\n\nPierre y yo tomamos un cafe en Starbucks para celebrar. La computadora nos ayudo a calcular los resultados. Que dia tan especial!\n\nMarie",
            "mood": "excitement",
            "wordCount": 52,
            "template": "template_classic"
        }
    ],
    "totalEntries": 1,
    "totalWords": 52,
    "submittedAt": "2025-01-15T14:30:00Z"
}
```

**Errores criticos:**
- Solo 1 entrada (minimo son 3)
- Anacronismos graves: mensajes de texto (1898), television, Starbucks (1971), computadora
- No captura la epoca ni el personaje
- Muy corta (<150 palabras)

**Feedback del sistema:**
> "Tu diario contiene errores historicos graves. En 1898 no existian telefonos celulares, television, ni Starbucks. Debes investigar como era la vida en esa epoca. Ademas, necesitas al menos 3 entradas de minimo 150 palabras cada una. 15/100 puntos."

---

**Escenario 2: Estructura invalida**

```json
{
    "entries": "Hoy Marie Curie descubrio el radio",
    "totalEntries": 1
}
```

**Error de validacion:**
- `entries` debe ser un array de objetos, no un string
- Falta estructura requerida por entrada (id, date, content, etc.)

**Feedback del sistema:**
> "Error de formato: El campo 'entries' debe ser un array de objetos. Cada entrada debe tener 'id', 'date', 'title', 'content', y 'mood'. Por favor, corrige la estructura."

---

### Validacion Backend

```sql
SELECT * FROM educational_content.validate_module4_module5_answer(
    'diario_multimedia',
    '{
        "entries": [
            {
                "id": "entry1",
                "date": "1898-12-15",
                "content": "Entrada de al menos 150 palabras..."
            }
        ],
        "totalEntries": 1
    }'::jsonb,
    100
);
-- Resultado: is_valid=TRUE (estructura valida), requires_manual_review=TRUE
```

---

## EJERCICIO 5.2: COMIC DIGITAL

**Tipo:** `comic_digital`
**Dificultad:** Intermediate
**Tiempo estimado:** 50 minutos
**XP:** 500
**Puntos de aprobacion:** 70
**Requiere revision manual:** Si

### Configuracion del Ejercicio

```json
{
    "minPanels": 4,
    "maxPanels": 6,
    "requireDialogue": true,
    "requireNarration": true,
    "requireCaption": true,
    "allowSketches": true,
    "allowDigitalDrawing": true,
    "visualStyles": ["realistic", "cartoon", "manga", "sketch", "minimalist"],
    "colorOptions": ["black_white", "grayscale", "full_color", "sepia", "two_tone"],
    "speechBubbleTypes": ["round", "square", "thought", "shout", "whisper", "narration"]
}
```

### Contenido del Ejercicio

**Objetivo:** Crear un comic de 4-6 vinetas narrando el descubrimiento del radio.

**Story Beats sugeridos:**

| # | Titulo | Escena | Mood |
|---|--------|--------|------|
| 1 | El Laboratorio Humilde | Marie y Pierre con pechblenda, 1898 | determination |
| 2 | La Anomalia | Marie descubre anomalia en mediciones | excitement |
| 3 | Anos de Trabajo | Montaje de 4 anos de trabajo duro | perseverance |
| 4 | Brilla en la Oscuridad! | El radio brilla con luz azul-verde | triumph |
| 5 | Medicina del Futuro | Aplicacion medica del radio | hope |
| 6 | Legado Inmortal | Marie mayor reflexionando | bittersweet |

### RESPUESTA EXCELENTE (95-100 puntos)

**Comic de 4 vinetas con narrativa clara y elementos visuales efectivos:**

```json
{
    "panels": [
        {
            "panelNumber": 1,
            "title": "El Laboratorio Humilde",
            "layout": "full_width",
            "visualDescription": "Hangar frio y destartalado. Marie y Pierre con batas manchadas examinan un mineral oscuro. Vapor sale de sus bocas por el frio. Equipo cientifico basico en mesas de madera.",
            "dialogue": [
                {
                    "character": "Marie",
                    "type": "round",
                    "text": "Este mineral contiene algo extraordinario, Pierre. La radiacion es demasiado intensa para ser solo uranio."
                },
                {
                    "character": "Pierre",
                    "type": "round",
                    "text": "Entonces debemos aislarlo, por muy dificil que sea."
                }
            ],
            "narration": "Paris, 1898. En un cobertizo sin calefaccion, Marie y Pierre Curie investigan un mineral llamado pechblenda.",
            "visualStyle": "sketch",
            "mood": "determination",
            "colorScheme": "sepia"
        },
        {
            "panelNumber": 2,
            "title": "Anos de Trabajo",
            "layout": "split_horizontal",
            "visualDescription": "Panel dividido mostrando paso del tiempo: Marie revolviendo calderos enormes, manos agrietadas, calendarios cambiando de 1898 a 1902.",
            "dialogue": [
                {
                    "character": "Marie",
                    "type": "thought",
                    "text": "No puedo rendirme. El secreto esta ahi, esperando ser descubierto."
                }
            ],
            "narration": "Cuatro anos. Ocho toneladas de pechblenda. Trabajo manual extenuante bajo condiciones imposibles.",
            "visualStyle": "sketch",
            "mood": "perseverance",
            "colorScheme": "sepia"
        },
        {
            "panelNumber": 3,
            "title": "Brilla en la Oscuridad!",
            "layout": "full_width",
            "visualDescription": "Laboratorio completamente oscuro. Un pequeno recipiente emite luz azul-verde brillante. Caras de Marie y Pierre iluminadas con expresiones de asombro y alegria.",
            "dialogue": [
                {
                    "character": "Pierre",
                    "type": "whisper",
                    "text": "Es... hermoso. Como pequenas luces de hadas."
                },
                {
                    "character": "Marie",
                    "type": "round",
                    "text": "Lo logramos, Pierre. Aislamos el radio."
                }
            ],
            "narration": "15 de diciembre de 1898. Marie y Pierre aislan 0.1 gramos de radio puro. El elemento brilla con luz propia.",
            "visualStyle": "sketch",
            "mood": "triumph",
            "colorScheme": "sepia",
            "specialEffect": "glow_effect_radio"
        },
        {
            "panelNumber": 4,
            "title": "Un Legado que Brilla",
            "layout": "full_width",
            "visualDescription": "Marie mayor en su oficina del Instituto Curie. Foto de Pierre en el escritorio. Por la ventana se ve Paris moderno.",
            "dialogue": [
                {
                    "character": "Marie",
                    "type": "thought",
                    "text": "Pierre, lo que comenzamos juntos cambio el mundo. Tu legado vive en cada tratamiento de cancer, en cada avance de la fisica nuclear."
                }
            ],
            "narration": "Marie Curie: primera mujer en ganar un Premio Nobel, unica persona en ganar dos Nobel en ciencias diferentes. Su luz sigue brillando.",
            "visualStyle": "sketch",
            "mood": "bittersweet",
            "colorScheme": "sepia"
        }
    ],
    "totalPanels": 4,
    "layout": "classic_4",
    "style": "sketch",
    "colorScheme": "sepia",
    "coverTitle": "El Descubrimiento del Radio: La Historia de Marie Curie"
}
```

**Criterios cumplidos:**
- 4 paneles completos (minimo requerido)
- Narrativa clara con arco dramatico (setup, rising action, climax, resolution)
- Dialogos significativos que muestran personalidad
- Narracion que provee contexto historico
- Descripciones visuales detalladas
- Consistencia de estilo (sepia, sketch)
- Precision historica (fechas, hechos, detalles)
- Uso efectivo de diferentes tipos de globos (round, thought, whisper)

**Feedback del sistema:**
> "Excelente comic! Tu narrativa visual es clara y emotiva. Los dialogos son naturales y revelan la personalidad de los personajes. Las descripciones visuales son detalladas y el arco narrativo es efectivo. 100/100 puntos."

---

### RESPUESTA ACEPTABLE (65-79 puntos)

**Comic de 4 vinetas basico, comprensible pero poco memorable:**

```json
{
    "panels": [
        {
            "panelNumber": 1,
            "title": "Panel 1",
            "visualDescription": "Marie en laboratorio",
            "dialogue": [
                {
                    "character": "Marie",
                    "text": "Vamos a descubrir el radio"
                }
            ],
            "narration": "Marie trabaja en su laboratorio"
        },
        {
            "panelNumber": 2,
            "title": "Panel 2",
            "visualDescription": "Marie trabajando",
            "dialogue": [
                {
                    "character": "Marie",
                    "text": "Es dificil pero seguire"
                }
            ],
            "narration": "Pasan muchos anos"
        },
        {
            "panelNumber": 3,
            "title": "Panel 3",
            "visualDescription": "Radio brillando",
            "dialogue": [
                {
                    "character": "Marie",
                    "text": "Lo logre!"
                }
            ],
            "narration": "Descubre el radio"
        },
        {
            "panelNumber": 4,
            "title": "Panel 4",
            "visualDescription": "Marie feliz",
            "dialogue": [
                {
                    "character": "Marie",
                    "text": "Estoy muy contenta"
                }
            ],
            "narration": "Fin"
        }
    ],
    "totalPanels": 4,
    "style": "sketch"
}
```

**Problemas identificados:**
- Dialogos muy cortos y genericos
- Sin Pierre (personaje clave)
- Descripciones visuales muy vagas
- Narracion sin contexto historico
- Titulos genericos ("Panel 1", etc.)
- Sin detalles de epoca o atmosfera
- Falta consistencia de estilo (no especifica colorScheme)

**Scoring:**
- Estructura completa: 40 puntos
- 4 paneles presentes: 20 puntos
- Narrativa basica comprensible: 10 puntos
- Total: ~70 puntos

**Feedback del sistema:**
> "Tu comic cumple con los requisitos basicos pero es poco memorable. Los dialogos son muy cortos y genericos. Falta Pierre, que es personaje clave. Las descripciones visuales necesitan mas detalle. Incluye fechas, detalles del laboratorio, y emociones mas profundas. 68/100 puntos."

---

### RESPUESTA INCORRECTA (0-49 puntos)

**Escenario 1: Menos de 4 paneles**

```json
{
    "panels": [
        {
            "panelNumber": 1,
            "title": "El Radio",
            "dialogue": [{"character": "Marie", "text": "Descubri el radio"}],
            "narration": "Marie descubre el radio"
        }
    ],
    "totalPanels": 1
}
```

**Errores criticos:**
- Solo 1 panel (minimo son 4)
- Sin desarrollo narrativo
- Sin descripciones visuales
- Informacion insuficiente

**Feedback del sistema:**
> "Tu comic tiene solo 1 panel. Se requieren al menos 4 paneles para contar la historia. Un comic necesita: introduccion, desarrollo, climax y resolucion. 20/100 puntos."

---

**Escenario 2: Sin dialogos ni narracion**

```json
{
    "panels": [
        {"panelNumber": 1, "visualDescription": "Marie en laboratorio"},
        {"panelNumber": 2, "visualDescription": "Marie trabajando"},
        {"panelNumber": 3, "visualDescription": "Radio brillando"},
        {"panelNumber": 4, "visualDescription": "Marie sonriendo"}
    ],
    "totalPanels": 4
}
```

**Errores criticos:**
- Sin dialogos (requerido)
- Sin narracion (requerido)
- Descripciones muy breves
- No cuenta una historia, solo imagenes estaticas

**Feedback del sistema:**
> "Tu comic no tiene dialogos ni narracion. Ambos son requeridos. Un comic necesita que los personajes hablen y un narrador que de contexto. Sin esto, no hay historia. 30/100 puntos."

---

### Validacion Backend

```sql
SELECT * FROM educational_content.validate_module4_module5_answer(
    'comic_digital',
    '{
        "panels": [
            {"panelNumber": 1, "dialogue": [{"character": "Marie", "text": "Hola"}], "narration": "1898"}
        ],
        "totalPanels": 1
    }'::jsonb,
    100
);
-- Resultado: is_valid=TRUE (estructura valida), requires_manual_review=TRUE
-- NOTA: La validacion SQL solo verifica estructura, no contenido
```

---

## EJERCICIO 5.3: VIDEO-CARTA

**Tipo:** `video_carta`
**Dificultad:** Advanced
**Tiempo estimado:** 60 minutos
**XP:** 500
**Puntos de aprobacion:** 70
**Requiere revision manual:** Si

### Configuracion del Ejercicio

```json
{
    "videoRequired": false,
    "scriptAlternative": true,
    "videoOptional": true,
    "minDuration": 120,
    "maxDuration": 300,
    "minWords": 400,
    "maxWords": 600,
    "allowedFormats": ["mp4", "webm", "mov", "script"],
    "recordingOptions": {
        "webcam": true,
        "audioOnly": true,
        "scriptOnly": true
    },
    "deliveryGuidelines": {
        "pace": "moderate (120-150 words per minute)",
        "tone": "warm, wise, inspirational"
    }
}
```

### Contenido del Ejercicio

**Contexto:**
- Ano: 1925
- Edad de Marie: 58 anos
- Ubicacion: Instituto Curie, Paris
- Logros: 2 Nobel, fundadora del Instituto Curie, pionera en radioterapia

**Temas sugeridos:**
1. Educacion para Mujeres
2. Etica Cientifica
3. Perseverancia
4. Legado Personal

### RESPUESTA EXCELENTE (95-100 puntos)

**Guion completo de 487 palabras con estructura clara y mensaje inspirador:**

```json
{
    "type": "script",
    "title": "Mensaje de Marie Curie al Siglo XXI",
    "script": {
        "introduction": "Buenos dias, jovenes del siglo XXI. Soy Marie Curie, y les hablo desde el ano 1925. Tengo 58 anos, dos premios Nobel, y una vida dedicada a la ciencia. Pero no les hablo para presumir de logros, sino para compartir lo que aprendi en este largo camino.\n\nSi pudiera enviar un mensaje a traves del tiempo, seria este: no dejen que nada ni nadie les diga que no pueden.",
        "body": [
            {
                "theme": "Educacion",
                "content": "La educacion fue mi liberacion. Naci en una Polonia ocupada donde las mujeres no podian asistir a la universidad. Mi padre, profesor de fisica, me enseno que el conocimiento no tiene genero. Cruce Europa para estudiar en la Sorbona, llegando a Paris con apenas dinero para comer.\n\nVivia en una buhardilla sin calefaccion. Estudiaba bajo la luz de velas porque no podia pagar electricidad. Pero cada libro, cada clase, era una puerta que se abria. La educacion no es un privilegio; es un derecho humano fundamental. Luchen por el."
            },
            {
                "theme": "Perseverancia",
                "content": "Hubo dias oscuros. Cuando mi esposo Pierre murio en un accidente, senti que mi mundo se derrumbaba. Cuando la Academia de Ciencias me rechazo por ser mujer, el mismo ano que gane mi segundo Nobel, la ironia era dolorosa.\n\nPero aprendi que los obstaculos son inevitables; lo que define tu caracter es como respondes a ellos. Cada rechazo me hizo mas fuerte. Cada fracaso me enseno algo valioso. La perseverancia no es no caer; es levantarse cada vez que caes."
            },
            {
                "theme": "Responsabilidad",
                "content": "Como cientifica, descubri el poder de la radiactividad. Este poder puede curar enfermedades, pero tambien puede destruir. Los cientificos tenemos una responsabilidad enorme: buscar la verdad, pero tambien considerar las consecuencias de nuestros descubrimientos.\n\nLa ciencia es neutral, pero los cientificos no lo son. Debemos usar nuestro conocimiento para el bien de la humanidad, no para su destruccion. Que sus descubrimientos siempre sirvan para sanar, no para herir."
            }
        ],
        "conclusion": "Jovenes del siglo XXI: tienen herramientas que yo solo podia sonar. Computadoras, comunicacion instantanea, acceso a toda la informacion del mundo. Usenlas sabiamente.\n\nQue mi historia les inspire a perseguir sus suenos sin importar los obstaculos. Si una mujer polaca pudo ganar dos premios Nobel en una epoca donde las mujeres no votaban, ustedes pueden lograr cualquier cosa.\n\nNo busquen fama o fortuna. Busquen la verdad. Busquen hacer del mundo un lugar mejor. Y nunca, jamas, dejen de aprender.\n\nCon carino y esperanza,\nMarie Curie"
    },
    "wordCount": 487,
    "themes_covered": ["education", "perseverance", "responsibility"],
    "submittedAt": "2025-01-15T16:00:00Z"
}
```

**Criterios cumplidos:**
- Estructura clara (introduccion, 3 temas, conclusion)
- 487 palabras (dentro del rango 400-600)
- Voz autentica de Marie Curie a los 58 anos
- Referencias a hechos reales (rechazo de Academia, muerte de Pierre, Polonia ocupada)
- Mensaje inspirador y atemporal
- Conexion emocional sin ser melodramatico
- Tono sabio, calido, apropiado para la edad y experiencia

**Feedback del sistema:**
> "Video-carta excepcional! Tu guion captura perfectamente la voz de Marie Curie. Los temas son relevantes y el mensaje es inspirador sin ser melodramatico. La estructura es clara y la conclusion es poderosa. 100/100 puntos."

---

### RESPUESTA ACEPTABLE (65-79 puntos)

**Guion de 250 palabras, demasiado corto pero con mensaje correcto:**

```json
{
    "type": "script",
    "title": "Mensaje de Marie Curie",
    "script": {
        "introduction": "Hola, soy Marie Curie. Les escribo desde 1925.",
        "body": [
            {
                "theme": "General",
                "content": "Gane dos premios Nobel y descubri el radio. Fue dificil porque soy mujer y la ciencia era para hombres. Pero trabaje mucho y lo logre.\n\nMi consejo es que estudien mucho y no se rindan. La ciencia es importante para el mundo."
            }
        ],
        "conclusion": "Espero que hagan cosas buenas. Adios."
    },
    "wordCount": 68,
    "themes_covered": ["general"],
    "submittedAt": "2025-01-15T16:00:00Z"
}
```

**Problemas identificados:**
- Muy corto (68 palabras, minimo son 400)
- Solo 1 tema desarrollado superficialmente
- Introduccion y conclusion demasiado breves
- Tono informal ("Hola", "Adios")
- Sin detalles historicos especificos
- Sin profundidad emocional
- No desarrolla temas clave (educacion para mujeres, etica, etc.)

**Scoring:**
- Estructura presente: 30 puntos
- Mensaje basico correcto: 20 puntos
- Voz parcialmente autentica: 15 puntos
- Penalizacion por longitud: -15 puntos
- Total: ~50-65 puntos

**Feedback del sistema:**
> "Tu guion es demasiado corto (68 palabras). Se requieren al menos 400 palabras. El mensaje es correcto pero muy superficial. Desarrolla mas los temas: habla sobre tu vida en Polonia, tu relacion con Pierre, tus luchas como mujer en ciencia, y tu vision del futuro. 55/100 puntos."

---

### RESPUESTA INCORRECTA (0-49 puntos)

**Escenario 1: Anacronismos y tono incorrecto**

```json
{
    "type": "script",
    "title": "Mensaje de Marie",
    "script": {
        "introduction": "Hey que onda! Soy Marie, la de los Nobel. Les mando este video porque esta cool hablar con el futuro.",
        "body": [
            {
                "theme": "Ciencia",
                "content": "La ciencia es super padre. Mi laboratorio tenia wifi muy lento pero igual descubri el radio. Si quieren ser cientificos, estudien en Stanford o MIT."
            }
        ],
        "conclusion": "Bueno eso es todo, suscribanse a mi canal y denle like. Bye!"
    },
    "wordCount": 72,
    "themes_covered": ["ciencia"],
    "submittedAt": "2025-01-15T16:00:00Z"
}
```

**Errores criticos:**
- Tono completamente incorrecto (jerga moderna, YouTuber)
- Anacronismos graves (wifi, Stanford, likes, suscribirse)
- No captura personalidad ni epoca de Marie
- Muy corto
- Sin mensaje significativo

**Feedback del sistema:**
> "Tu guion tiene errores graves. En 1925 no existia wifi, YouTube, ni likes. El tono es completamente inadecuado para Marie Curie, una cientifica seria de 58 anos. Investiga como hablaban las personas de esa epoca y captura la sabiduria de una mujer que ha vivido y sufrido mucho. 10/100 puntos."

---

**Escenario 2: Contenido historicamente incorrecto**

```json
{
    "type": "script",
    "title": "Marie Curie",
    "script": {
        "introduction": "Soy Marie Curie, la primera persona en ganar un Premio Nobel.",
        "body": [
            {
                "theme": "Logros",
                "content": "Naci en Francia y descubri la penicilina. Mi esposo Albert Einstein me ayudo mucho en el laboratorio. Ganamos juntos el Nobel de Medicina."
            }
        ],
        "conclusion": "Gracias a mi descubrimiento, ahora existe la television."
    },
    "wordCount": 56,
    "themes_covered": ["logros"]
}
```

**Errores criticos:**
- Marie no fue la PRIMERA persona en ganar Nobel (Wilhelm Rontgen fue el primero en 1901)
- Marie nacio en POLONIA, no Francia
- No descubrio la penicilina (fue Alexander Fleming)
- Su esposo era PIERRE CURIE, no Albert Einstein
- Gano Nobel de FISICA y QUIMICA, no Medicina
- La television no tiene relacion con sus descubrimientos

**Feedback del sistema:**
> "Tu guion contiene multiples errores historicos graves. Marie Curie nacio en POLONIA, su esposo era PIERRE CURIE, descubrio el RADIO y el POLONIO (no la penicilina), y gano Nobel de FISICA y QUIMICA. Por favor, investiga los hechos basicos antes de escribir. 5/100 puntos."

---

### Validacion Backend

```sql
SELECT * FROM educational_content.validate_module4_module5_answer(
    'video_carta',
    '{
        "type": "script",
        "script": {
            "introduction": "Introduccion...",
            "body": [{"theme": "Tema", "content": "Contenido..."}],
            "conclusion": "Conclusion..."
        },
        "wordCount": 450
    }'::jsonb,
    100
);
-- Resultado: is_valid=TRUE (estructura valida), requires_manual_review=TRUE
```

---

## CASOS DE USO

### 1. Testing QA Manual

**Objetivo:** Verificar que el frontend maneja correctamente las respuestas del Modulo 5

**Procedimiento:**
1. Usar ejemplos de "RESPUESTA EXCELENTE" para verificar flujo completo
2. Usar ejemplos de "RESPUESTA ACEPTABLE" para verificar feedback parcial
3. Usar ejemplos de "RESPUESTA INCORRECTA" para verificar validacion de errores
4. Probar estructuras invalidas para verificar mensajes de error

**Checklist de validacion:**

- [ ] Diario Multimedia: Valida entries[] con minimo 1 entrada (máximo 5)
- [ ] Comic Digital: Valida panels[] con minimo 4 paneles + dialogos + narracion
- [ ] Video-Carta: Valida script{} con introduccion + body[] + conclusion

---

### 2. Testing Backend/API

**Endpoint:** `POST /api/v1/student/exercises/{exerciseId}/submit`

**Test Case 5.1: Diario Multimedia - Respuesta valida**
```json
{
    "exerciseId": "uuid-diario",
    "answers": {
        "entries": [
            {"id": "entry1", "date": "1898-12-15", "content": "Texto de 150+ palabras..."}
        ],
        "totalEntries": 1
    }
}
```
**Respuesta esperada:**
```json
{
    "structureValid": true,
    "requiresManualReview": true,
    "message": "Respuesta registrada. Un docente evaluara tu trabajo creativo."
}
```

**Test Case 5.2: Comic Digital - Estructura invalida**
```json
{
    "exerciseId": "uuid-comic",
    "answers": {
        "panels": "texto invalido"
    }
}
```
**Respuesta esperada:**
```json
{
    "structureValid": false,
    "error": "El campo 'panels' debe ser un array de objetos"
}
```

---

### 3. Demos Pedagogicas

**Flujo de demo (20 minutos):**

1. **Diario Multimedia (8 min):**
   - Mostrar prompts con contexto historico
   - Demostrar templates disponibles (clasico, cientifico, carta)
   - Escribir una entrada de ejemplo
   - Mostrar rubrica de evaluacion

2. **Comic Digital (7 min):**
   - Mostrar herramientas de dibujo/composicion
   - Demostrar story beats sugeridos
   - Crear un panel de ejemplo
   - Mostrar tipos de globos de dialogo

3. **Video-Carta (5 min):**
   - Mostrar opciones (video, audio, script)
   - Leer extracto de guion de ejemplo
   - Explicar estructura requerida
   - Mostrar rubrica de autenticidad

---

### 4. Rubricas para Docentes

**Diario Multimedia (Revision Manual):**

| Criterio | 0-25 | 26-50 | 51-75 | 76-100 |
|----------|------|-------|-------|--------|
| Creatividad | Copia directa | Ideas basicas | Perspectiva personal | Voz unica y original |
| Precision Historica | Multiples errores | Algunos errores | Mayormente correcto | Impecable |
| Profundidad Emocional | Superficial | Basica | Desarrollada | Conmovedora |
| Requisitos | <3 entradas/<150 palabras | 3 entradas basicas | 3+ entradas completas | 3+ entradas excepcionales |

**Comic Digital (Revision Manual):**

| Criterio | 0-25 | 26-50 | 51-75 | 76-100 |
|----------|------|-------|-------|--------|
| Narrativa | Incoherente | Basica | Clara | Memorable |
| Visual | Sin descripciones | Vagas | Detalladas | Cinematograficas |
| Dialogos | Ausentes | Genericos | Naturales | Reveladores |
| Estructura | <4 paneles | 4 paneles basicos | Arco narrativo claro | Arco + impacto emocional |

**Video-Carta (Revision Manual):**

| Criterio | 0-25 | 26-50 | 51-75 | 76-100 |
|----------|------|-------|-------|--------|
| Autenticidad | No captura voz | Parcial | Buena | Magistral |
| Mensaje | Vago/incorrecto | Basico | Claro | Inspirador |
| Estructura | Sin estructura | Parcial | Completa | Fluida y efectiva |
| Longitud | <200 palabras | 200-399 | 400-500 | 400-600 + impacto |

---

## REFERENCIAS

### Fuente de Verdad
- **Seeds PROD:** `apps/database/seeds/prod/educational_content/06-exercises-module5.sql`
- **Documento de Diseno:** `docs/00-vision-general/DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md` lineas 976-1119
- **Validador SQL:** `apps/database/ddl/schemas/educational_content/functions/23-validate_module4_module5.sql`

### Frontend Components
- `apps/frontend/src/features/mechanics/module5/DiarioMultimedia/`
- `apps/frontend/src/features/mechanics/module5/ComicDigital/`
- `apps/frontend/src/features/mechanics/module5/VideoCarta/`

### Documentacion Relacionada
- `docs/80-references/transversal/EJERCICIOS-PREGUNTAS-RESPUESTAS.md` (seccion Modulo 5)

---

## DIFERENCIAS CON MODULO 4

| Aspecto | Modulo 4 | Modulo 5 |
|---------|----------|----------|
| Naturaleza | Analitica (verificar, extraer, navegar) | Creativa (crear, escribir, expresar) |
| Evaluacion automatica | Quiz TikTok (1 de 5) | Ninguno |
| Revision manual | 4 de 5 ejercicios | TODOS (3 de 3) |
| XP por ejercicio | 100 | 500 |
| Eleccion | Todos obligatorios | 1 de 3 |
| Tiempo promedio | 10-20 min | 40-60 min |
| Tipo de respuesta | Estructurada (JSON fijo) | Abierta (creatividad) |

---

## CONCLUSION

Esta guia proporciona **ejemplos exhaustivos** de respuestas en 3 niveles de calidad para todos los ejercicios del Modulo 5. Usala para:

- **QA:** Validar estructura de respuestas y feedback del sistema
- **Desarrollo:** Implementar componentes con test data realista
- **Demos:** Mostrar funcionalidad a stakeholders
- **Docentes:** Entender criterios de evaluacion para revision manual
- **Testing API:** Verificar endpoints de validacion

**IMPORTANTE:**
- TODOS los ejercicios del Modulo 5 requieren revision manual por un docente
- El estudiante solo debe completar 1 de los 3 ejercicios
- Cada ejercicio otorga 500 XP (cantidad para alcanzar rango K'UK'ULKAN)
- La evaluacion es 100% subjetiva/creativa, no hay respuestas "correctas" sino "mejores"

---

**Documento generado:** 2025-12-18
**Autor:** Database-Agent / Architecture-Analyst
**Version:** 1.0
**Estado:** Listo para uso en QA, desarrollo y demos
