# GAMILIT

**Plataforma Educativa Gamificada**

*Basado en los n**i**veles de comprensión de Daniel Cassany*

Texto base: Biografía de Marie Curie

Versión 6.0 - Documento de diseño e implementación

##### Índice




**[Separador visual - Línea decorativa]**



- **Sistema de Rangos Mayas**

  - **Descripción del sistema de rangos.**

- **Jerarquía de Rangos**

  - **Detalle de los rangos: AJAW, NACOM, AH K´IN, HALACH UINIC, K´UK´ULKAN.**

  - **Bonus ML por rango.**

- **Módulo 1: Comprensión Literal**

  - **Objetivo: Localizar información explícita sobre Marie Curie.**

  - **Ejercicio 1.1: Crucigrama Científico.**

  - **Ejercicio 1.2: Línea de Tiempo de Marie Curie**

  - **Ejercicio 1.3: Completar Espacios en Blanco**

  - **Ejercicio 1.4: Verdadero o Falso**

  - **Ejercicio 1.5: Sopa de Letras**

- **Módulo 2: Comprensión Inferencial**

  - **Ejercicio 2.1: Detective Textual**

  - **Ejercicio 2.2: Construcción de Hipótesis**

  - **Ejercicio 2.3: Predicción Narrativa**

  - **Ejercicio 2.4: Puzzle de Contexto.**

  - **Ejercicio 2.5: Rueda de Inferencias.**

- **Módulo 3: Comprensión Crítica y Valorativa**

  - **Ejercicio 3.1: Tribunal de Opiniones.**

  - **Ejercicio 3.2: Debate Digital Estructurado.**

  - **Ejercicio 3.3: Análisis de fuentes.**

  - **Ejercicio 3.4: Creación de Podcast Argumentativo**

  - **Ejercicio 3.5: Matriz de Perspectivas**

- **Módulo 4: Lectura Digital y Multimodal**

  - **Ejercicio 4.1: Verificador de Fake News.**

  - **Ejercicio 4.2: Creación de infografía Interactiva**

  - **Ejercicio 4.3: Quiz Estilo Tik Tok.**

  - **Ejercicio 4.4: Navegación Hipertextual.**

  - **Ejercicio 4.5: Análisis de Memes Educativos.**

- **Módulo 5: Producción y Expresión Lectora**

  - **OPCIÓN A: Diario Interactivo de Marie**

  - **OPCIÓN B: Resumen Visual Progresivo (Cómic Digital)**

  - **OPCIÓN C: Cápsula del Tiempo Digital**

- **Uso de ML - ****Comodines**

  - **Tipos de comodines: Pistas, Visión Lectora, Segunda Oportunidad.**

  - **Costos y penalizaciones.**

- **Diagrama de Navegación Completo**

  - **Flujo de navegación entre módulos.**

  - **Progreso y logros.**

- **Certificación Final - Rango K´UK´ULKAN**

  - **Recompensas al completar los 5 módulos.**

  - **Certificado digital y reconocimiento.**

## Sistema de Rangos Mayas




**[Separador visual - Línea decorativa]**



*La plataforma utiliza un sistema de rangos basado en la jerarquía militar maya**. **Los usuarios avanzan de rango completando módulos completos, obteniendo un nuevo rango por cada módulo completado**.*

###### Jerarquía de Rangos




**[Separador visual - Línea decorativa]**



***1AJAWMódulo 1 Completado******1******AJAW******Módulo 1 ******Completado******2NACOMMódulo 2 Completado******2******NACOM******Módulo 2 ******Completado******3AH K'INMódulo 3 Completado******3******AH K'IN******Módulo 3 ******Completado******4HALACH UINICMódulo 4 Completado******4******HALACH UINIC******Módulo 4 ******Completado******5K'UK'ULKANMódulo 5 Completado******5******K'UK'ULKAN******Módulo 5 ******Completado***


**[Elemento visual decorativo - Marco o sombra suave]**




**[Separador visual - Línea decorativa]**




**[Elemento visual decorativo - Marco o sombra suave]**




**[Separador visual - Línea decorativa]**




**[Elemento visual decorativo - Marco redondeado blanco]**




**[Separador visual - Línea decorativa]**




**[Elemento visual decorativo - Marco redondeado blanco grande]**




**[Separador visual - Línea decorativa]**




**[Elemento visual decorativo - Marco redondeado blanco]**




**[Separador visual - Línea decorativa]**



**RangoNombre MayaRequisitoML Bonus**


| *1* | **AJAW** | *Completar Módulo 1 (Comprensión Literal)* | *+50 ML* |
| --- | --- | --- | --- |
| *2* | **NACOM** | *Completar Módulo 2 (Comprensión *Inferencial*)* | *+75 ML* |
| *3* | **AH K´IN** | *Completar Módulo 3 (Comprensión Crítica)* | *+100 ML* |
| *4* | **HALACH UINIC** | *Completar Módulo 4 (Lectura Digital)* | *+125ML* |
| *5* | **K´UK´ULKAN** | *Completar Módulo 5 (Producción Lectora)* | *+150 ML* |


## MÓDULO 1: COMPRENSIÓN LITERAL




**[Separador visual - Línea decorativa]**



***Objetivo: ****Localizar información explícita del texto sobre Marie Curie**.*


**[Separador visual - Línea decorativa]**



**Rango al completar:****AJAW**

##### Ejercicio 1.1: Crucigrama Científico - DISTRIBUCIÓN 




**[Separador visual - Línea decorativa]**



**Objetivo:**

Completar un crucigrama de 15x15 casillas con términos relacionados con Marie Curie.

### Cómo resolverlo:

- Lee todas las pistas antes de empezar, tanto horizontales como verticales

- Comienza con las palabras más largas o las que estés más seguro

- Usa las intersecciones - cuando dos palabras se cruzan, la letra debe coincidir

- Cuenta las casillas - cada pista indica cuántas letras tiene la respuesta

- Revisa el texto base - todas las respuestas están en la biografía de Marie Curie

### Estrategia recomendada:

- Empieza por las palabras que conoces con certeza (como POLONIA, MARIE, CURIE)

- Las intersecciones te darán pistas para palabras difíciles

- Si te atascas, usa el comodín "Pista" para revelar una letra

##### VISUAL

***Grid del Crucigrama (1*****5*****x15)***




**Interfaz: Crucigrama Científico con Pistas**

*Cuadrícula del Crucigrama (15x15):*
```
Fila 0:  □ □ □ □ □ □ □ □ □ □ □ □ □ □ □
Fila 1:  □ □ □ □ □ □ □ C □ □ □ □ □ □ □
Fila 2:  □ □ □ □ □ □ □ U □ □ □ □ □ □ □
Fila 3:  □ □ □ □ P □ □ R □ □ □ □ □ □ □
Fila 4:  □ □ □ S O R B O N A □ □ □ □ □
Fila 5:  □ □ □ □ L □ □ I □ □ □ □ □ □ □
Fila 6:  □ □ □ N O B E L □ □ □ □ □ □ □
Fila 7:  □ □ □ □ N □ □ □ □ □ □ □ □ □ □
Fila 8:  R A D I O A C T I V I D A D □
Fila 9:  A □ □ □ □ □ □ □ □ □ □ □ □ □ □
Fila 10: D □ □ □ □ □ □ □ □ □ □ □ □ □ □
Fila 11: I □ □ □ □ □ □ □ □ □ □ □ □ □ □
Fila 12: O □ □ □ □ □ □ □ □ □ □ □ □ □ □
Fila 13: □ □ □ □ □ □ □ □ □ □ □ □ □ □ □
Fila 14: □ □ □ □ □ □ □ □ □ □ □ □ □ □ □
```

*Panel de Pistas:*

**HORIZONTALES:**
1. Universidad donde estudió (Fila 4) → SORBONA
2. Premio recibido en 1903 y 1911 (Fila 6) → NOBEL
3. Fenómeno de emisión espontánea de radiación (Fila 8) → RADIOACTIVIDAD

**VERTICALES:**
4. Elemento químico nombrado en honor a Polonia (Col 4) → POLONIO
5. Elemento químico radiactivo descubierto (Col 1) → RADIO
6. Apellido de Marie (Col 7) → CURIE




**Pistas y Respuestas**

#**Dirección            Pista                 Respuesta**




**Tabla: Pistas del Crucigrama Científico**

**Pistas Horizontales:**

| # | Pista | Respuesta | Posición |
|---|-------|-----------|----------|
| 1 | Universidad donde estudió | SORBONA | Fila 4, Col 3 (7 letras) |
| 2 | Premio recibido en 1903 y 1911 | NOBEL | Fila 6, Col 3 (5 letras) |
| 3 | Fenómeno de emisión espontánea de radiación descubierto por Marie | RADIOACTIVIDAD | Fila 8, Col 1 (14 letras) |

**Pistas Verticales:**

| # | Pista | Respuesta | Posición |
|---|-------|-----------|----------|
| 4 | Elemento químico nombrado en honor a Polonia | POLONIO | Fila 3, Col 4 (7 letras) |
| 5 | Elemento químico radiactivo descubierto | RADIO | Fila 8, Col 1 (5 letras) |
| 6 | Apellido de Marie | CURIE | Fila 8, Col 7 (5 letras) |




##### Ejercicio 1.2: Línea de Tiempo de Marie Curie

### Descripción


**[Separador visual - Línea decorativa]**




**[Separador visual - Línea decorativa]**



Ordena cronológicamente los eventos más importantes de la vida de Marie Curie mediante drag & drop interactivo.

### Mecánica del ejercicio

• Interfaz con tarjetas arrastrables de eventos

• Validación automática al soltar cada tarjeta

• Feedback visual inmediato (verde = correcto, rojo = incorrecto)

• 3 intentos sin penalización

### Eventos a ordenar (6)

1. Nace en Varsovia, Polonia, como Maria Sklodowska (1867)

2. Se traslada a París para estudiar en la Sorbona (1891)

3. Descubre el Polonio y el Radio (1898)

4. Recibe su primer Premio Nobel de Física (1903)

5. Muerte de Pierre Curie (1906)

6. Recibe su segundo Premio Nobel, esta vez en Química (1911)

##### Ejercicio 1.3: Completar Espacios en Blanco

### Descripción


**[Separador visual - Línea decorativa]**




**[Separador visual - Línea decorativa]**



Lee el texto sobre Marie Curie y completa los espacios con las palabras correctas del banco de palabras.

### Texto del ejercicio

*"Marie Sklodowska nació en _______(1), Polonia. Su padre _______(2) era profesor de matemáticas y física, mientras que su madre _______(3) dirigía una escuela prestigiosa. La familia valoraba mucho la _______(4) y Marie mostró desde pequeña gran curiosidad por las _______(5) y _______(6)."*

### Banco de Palabras

[ Varsovia ] [ Władysław ] [ Bronisława ] [ educación ] [ ciencias ] [ Polonia ] [ matemáticas ] [ física ]

### Respuestas correctas

1. Varsovia - Ciudad natal de Marie

2. Władysław - Nombre del padre

3. Bronisława - Nombre de la madre

4. educación - Valor fundamental familiar

5. ciencias - Primer interés de Marie

6. matemáticas o física - Ambas son válidas

##### Ejercicio 1.4: Verdadero o Falso

###   Descripción


**[Separador visual - Línea decorativa]**




**[Separador visual - Línea decorativa]**



Evalúa afirmaciones sobre hechos explícitos de la juventud de Marie Curie según el contexto histórico proporcionado.

### Contexto proporcionado

*"Durante su infancia en Polonia, Marie era conocida por su insaciable curiosidad científica. Su padre le enseñó los primeros principios de las matemáticas y la física, mientras su madre la inspiró con su dedicación a la educación."*

### Afirmaciones y respuestas (10)

1. Marie mostró curiosidad excepcional por las ciencias desde muy pequeña

   Respuesta: ✅ VERDADERO

   Explicación: El texto menciona su "insaciable curiosidad científica"

2. Su padre era profesor de química solamente

   Respuesta: ❌ FALSO

   Explicación: Era profesor de matemáticas y física

3. Marie nació en Francia

   Respuesta: ❌ FALSO

   Explicación: Nació en Polonia (Varsovia)

4. Su familia valoraba mucho la educación

   Respuesta: ✅ VERDADERO

   Explicación: Explícitamente mencionado en el contexto

5. La madre de Marie dirigía una escuela

   Respuesta: ✅ VERDADERO

   Explicación: Se menciona que dirigía una escuela prestigiosa

6. Marie Curie ganó su primer Nobel a los 20 años

   Respuesta: ❌ FALSO

   Explicación: Lo ganó en 1903, cuando tenía 36 años

7. El nombre original de Marie era Maria Sklodowska

   Respuesta: ✅ VERDADERO

   Explicación: Nombre de nacimiento confirmado

8. Marie fue la primera mujer en ganar un Premio Nobel

   Respuesta: ✅ VERDADERO

   Explicación: Hecho histórico verificable

9. Su padre no apoyaba su interés en las ciencias

   Respuesta: ❌ FALSO

   Explicación: Le enseñó matemáticas y física

10. Marie estudió en la Universidad de Varsovia

   Respuesta: ❌ FALSO

   Explicación: Estudió en la Sorbona de París

##### Ejercicio 1.5: Sopa de Letras (BONUS)

###   Descripción


**[Separador visual - Línea decorativa]**




**[Separador visual - Línea decorativa]**



Encuentra palabras clave relacionadas con Marie Curie en una sopa de letras interactiva. Este es un    ejercicio bonus opcional.

### Mecánica

• Grid de 12x12 letras

• Direcciones: Horizontal, vertical y diagonal

• Selección: Click y arrastrar para marcar palabras

• Feedback: Palabras encontradas se iluminan permanentemente

• Tiempo límite: 10 minutos

### Palabras a encontrar (10)

MARIE • CURIE • POLONIA • NOBEL • RADIO • POLONIO • PARIS • SORBONA • CIENCIA • FÍSICA

## MÓDULO 2: COMPRENSIÓN INFERENCIAL




**[Separador visual - Línea decorativa]**



***Objetivo: ****Leer entre líneas, hacer deducciones y anticipar ideas**.*


**[Separador visual - Línea decorativa]**



**Rango al completar:****NACOM**

###### Ejercicio 2.1: Detective Textual




**[Separador visual - Línea decorativa]**



**  *****Descripción***


**[Separador visual - Línea decorativa]**



 *Leer fragmentos y seleccionar la inferencia correcta entre 3 opciones**.*

***Fragmento******: ****"Marie se puso un abrigo grueso antes de entrar al laboratorio donde trabajaba con sustancias radiactivas"*

***Pregunta: ****¿Qué puedes inferir sobre las condiciones del labo**r**atorio?*

- *A) El laboratorio tenía calefacción moderna*

- ***B) El laboratorio era muy frío, probablemente sin calefacción ****✓*

- *C) Marie era muy friolenta*

***Explicación: ****En la época, los laboratorios carecían de comodidades básicas y Marie trabajaba en condiciones precarias**.*

###### Ejercicio 2.2: Construcción de Hipótesis




**[Separador visual - Línea decorativa]**



**  *****Relaciones Causa-Efecto sobre Marie Curie***


**[Separador visual - Línea decorativa]**



** Objetivo**

Conectar causas con sus consecuencias lógicas sobre decisiones de Marie Curie.

**Cómo resolverlo:**

      Lee la CAUSA en la columna izquierda

Analiza las CONSECUENCIAS disponibles en la derecha

Arrastra las consecuencias correctas hacia la causa

Cada causa puede tener 1-3 consecuencias

**Piensa en:**

**     ** Efectos inmediatos

Efectos a largo plazo

Impacto en otros

**Ejemplo:**

CAUSA: "Marie no patentó el proceso del radio"

CONSECUENCIAS:

✅ "Otros científicos pudieron investigar"

✅ "No obtuvo riquezas"

✅ "La medicina avanzó más rápido"

***CAUSA****CONSECUENCIAS (Arrastrar las correctas)*


|  *•*    ***Marie decidió no patentar el proceso de ****•* ***aislamiento del radio*** *•* | *-+ ****Otros científicos pudieron continuar la investigación*** *-+ ****No obtuvo riquezas de su descubrimiento*** *-+ ****La medicina avanzó más rápidamente*** |
| --- | --- |
|  *•* | *-+ ****Demostró su independencia*** |
|  | ***científica*** |
| ***Marie continuó trabajando después de la ****•* | *-+ ****Completó investigaciones*** |
| ***muerte de Pierre*** | ***pendientes*** |
| *•* | *-+ ****Se convirtió en la primera profesora*** |
|  | ***de la Sorbona*** |


###### 

###### 

###### 

###### 

###### 

###### 

###### 

###### 

###### Ejercicio 2.3: Predicción Narrativa




**[Separador visual - Línea decorativa]**



**Objetivo**

Predecir cómo continúa o termina un párrafo basándote en el contexto histórico.

**Cómo resolverlo:**

Lee el inicio del párrafo incompleto

**Identifica:**

Época histórica

Contexto social

Personalidad de los personajes

Analiza las 4 opciones de continuación

**Descarta las que sean:**

Anacrónicas (no corresponden a la época)

Contrarias al carácter del personaje

Históricamente incorrectas

Selecciona la más coherente con el contexto

**Pistas clave:**

Recuerda el contexto de discriminación de género de la época

Marie era perseverante pero modesta

Los hechos históricos no se pueden cambiar

***Inicio del párrafo: ****"Cuando Marie presentó su candidatura a la Academia de Ciencias Francesa en 1911, siendo ya ganadora del Nobel..."*

**¿Cómo continúa más probablemente?**

- *fue aceptada inmediatamente con honores*

- ***fue rechazada por ser mujer, a pesar de sus logros ****✓*

- *decidió **r**etirar su candidatura*

- *fue elegida presidenta de la Academia*

**Pista contextual****: **Considera los prejuicios de género de la época.

###### Ejercicio 2.4: Puzzle de Contexto




**[Separador visual - Línea decorativa]**



**  *****Ordenar fragmentos para crear una inferencia coherente***


**[Separador visual - Línea decorativa]**



**Fragmentos DesordenadosOrden Correcto**




**[Separador visual - Línea decorativa]**



*A) demostró una determinación extraordinaria*


| *B) A pesar de las barreras sociales y económicas* |
| --- |
| *C) que enfrentó como mujer inmigrante* |
| *D) convirtiéndose en pionera de la ciencia moderna* |


***Inferencia completa: ****"A pesar de las barreras sociales y económicas que enfrentó como mujer inmigrante, demostró una determinación extraordinaria, convirtiéndose en pionera de la ciencia moderna**.**"*

###### Ejercicio 2.5: Rueda de Inferencias




**[Separador visual - Línea decorativa]**



***Mecánica del Juego***

- *Girar la ruleta virtual para obtener una categoría*

- *Leer el fragmento presentado*

- *Escribir una inferencia en 30 segundos*

- *Competencia por equipos con puntuación*

**CategoríaFragmentoInferencia EsperadaPuntos**


|  ***Emociones no expresadas*** | *"Marie trabajó 4 años procesando toneladas de pechblenda"* | *Frustración, cansancio, pero también esperanza y determinación* |   *20* |
| --- | --- | --- | --- |
|  ***Contexto social*** | *"Marie usaba su apellido de casada en publicaciones"* | *Era más aceptable publicar como mujer casada que soltera* |   *20* |


### MÓDULO 3: COMPRENSIÓN CRÍTICA V VALORATIVA


**[Separador visual - Línea decorativa]**






**[Separador visual - Línea decorativa]**



***Objetivo: ****Emitir juicios, identificar intenciones del autor, argumentar posturas**.*

**Rango al completar:****AH K´IN**

###### Ejercicio 3.1: Tribunal de Opiniones




**[Separador visual - Línea decorativa]**



**  *****Clasificar afirmaciones usando tarjetas digitales arrastrables***


**[Separador visual - Línea decorativa]**



** Objetivo**

Evaluar diferentes opiniones sobre Marie Curie y determinar cuáles están bien fundamentadas.

**Cómo resolverlo:**

**      **Lee la opinión presentada

**Identifica:**

La afirmación principal

Las evidencias que la apoyan

Los argumentos usados

**Evalúa según criterios:**

¿Tiene evidencia factual?

¿Es lógicamente coherente?

¿Evita falacias?

**Asigna un veredicto:**

"Bien fundamentada" ✅

"Parcialmente fundamentada" ⚠️

"Sin fundamento" ❌

Justifica tu decisión en 2-3 líneas

**Criterios de evaluación:**

Evidencia > Opinión

Hechos > Suposiciones

Lógica > Emoción

*Afirmación sobre Marie Curie*

*ClasificaciónJustificación*


| *"Marie Curie murió el 4 de julio de 1934"* |  ***HECHO*** | *Dato histórico verificable en registros* |
| --- | --- | --- |
| *"Fue la científica más brillante del siglo XX**"* |  ***OPINIÓN*** | *Juicio de valor subjetivo, no medible* |
| *"Su exposición al radio contribuyó a su enfermedad"* |  ***INTERPRETACIÓN*** | *Deducción basada en evidencia, no confirmada definitivamente* |


###### Ejercicio 3.2: Debate Digital Estructurado


**[Separador visual - Línea decorativa]**






**[Separador visual - Línea decorativa]**



***Tema: ******11 ******¿La fama afectó negativamente la investigación de Marie Curie?***

**Objetivo**

Participar en un debate argumentado sobre decisiones controversiales de Marie Curie.

**Cómo resolverlo:**

**Fase 1: Preparación (5 minutos)**

**  **         Recibe tu postura (asignada aleatoriamente)

Lee las fuentes de información disponibles

Prepara 3 argumentos principales

Anticipa posibles contra-argumentos

**Fase 2: Debate (10 minutos)**

**      **    Apertura (1 min): Presenta tu postura principal

Desarrollo (2 min): Expón tus 3 argumentos

Réplica (2 min): Responde a argumentos contrarios

Contra-réplica (2 min): Defiende tu posición

Cierre (30 seg): Conclusión contundente

**Fase 3: Votación**

**       **  Otros usuarios votan el mejor argumento

Se evalúa: claridad, evidencia, persuasión

**Tips para ganar:**

Usa datos concretos

Cita fuentes

Mantén respeto

Sé conciso

**RolArgumentos PrincipalesEvidencia del Texto**


|   ***A FAVOR*** | *Invasión de privacidad* *Tiempo perdido en eventos* *Presión mediática* | *Escándalo tras muerte de Pierre* *Múltiples ceremonias obligatorias* *Acoso periodístico documentado* |
| --- | --- | --- |
|   ***EN CONTRA*** | *Mayor financiación* *Reconocimiento institucional* *Mejores recursos* | *Laboratorio mejorado post-Nobel* *Colaboraciones internacionales* *Apoyo gubernamental* |


###### Ejercicio 3.3: Análisis de Fuentes




**[Separador visual - Línea decorativa]**



***Evaluar credibilidad de 5 textos sobre Marie usando checklist interactivo***


**[Separador visual - Línea decorativa]**



**Objetivo**

Evaluar la confiabilidad de diferentes fuentes de información sobre Marie Curie.

**Cómo resolverlo:**

**      **    Examina cada fuente presentada

**Aplica el método CRAAP:**

Currency (Actualidad): ¿Cuándo se publicó?

Relevance (Relevancia): ¿Es pertinente?

Authority (Autoridad): ¿Quién es el autor?

Accuracy (Precisión): ¿Es verificable?

Purpose (Propósito): ¿Por qué se escribió?

Asigna puntuación (1-5) en cada criterio

**Clasifica la fuente:**

Muy confiable (20-25 puntos)

Confiable (15-19 puntos)

Cuestionable (10-14 puntos)

No confiable (<10 puntos)

**Señales de alerta:**

Sin autor identificable

Sin fecha de publicación

Lenguaje emotivo excesivo

Sin referencias

*FuenteAutorFechaCredibilidadProblemas/Fortalezas*


| *Biografía oficial UNESCO* |  *Historiadores verificados* |   *2020* |   ***ALTA*** |  *Fuentes primarias, ✓* *Revisión académica* |
| --- | --- | --- | --- | --- |
| *Blog "Mujeres increíbles"* |   *Anónimo* |   *Sin fecha* |  |  *X Sin autor, X Sin referencias* |
| *Wikipedia - Marie Curie* |  *Múltiples editores* |  *Actualización continua* |   *MEDIA* |  *± Verificar referencias**,* *± Posibles errores* |


###### Ejercicio 3.4: Creación de Podcast Argumentativo




**[Separador visual - Línea decorativa]**



**  *****Estructura del Podcast (2 minutos)***


**[Separador visual - Línea decorativa]**



**Tema: **Impacto de Marie Curie en la equidad de género en ciencia

**Crear un podcast de 3 minutos defendiendo o criticando una decisión de Marie Curie.**

**Cómo resolverlo:**

Elige tu tema de la lista disponible

**Estructura tu podcast:**

Introducción (30 seg): Presenta el tema

Desarrollo (2 min): 3 argumentos principales

Conclusión (30 seg): Resumen y llamada a la reflexión

Graba usando el botón de grabación

**Incluye:**

Al menos 3 datos verificables

2 citas o referencias

Tu opinión personal fundamentada

Revisa antes de enviar (puedes regrabar)

**Elementos clave:**

Habla claro y pausado

Usa transiciones ("en primer lugar", "además", "por lo tanto")

Varía el tono para mantener interés

**Guión Sugerido:**

- ***Introducción (0:00-0:20)***

  - *Hook**: **"¿Sabían que Marie Curie fue rechazada de la Academia de Ciencias pese a tener un Nobel?"*

  - *Tesis**: **"Marie Curie no solo revolucionó la ciencia, s**i**no que abrió puertas para generaciones de mujeres científicas"*

- ***Argumentos (0******:******20-1:30)***

  - *Argumento 1**: **Primera mujer en ganar un Nobel (evidencia)*

  - *Argumento 2**: **Primera profesora en la Sorbona (impacto)*

  - *Argumento 3**: **Modelo para futuras científicas (legado)*

- ***Conclusión (1:30******-******2:00)***

  - *Síntesis de impacto*

  - *Llamado a la acción*

###### Ejercicio 3.5: Matriz de Perspectivas


**[Separador visual - Línea decorativa]**






**[Separador visual - Línea decorativa]**



***Evento: "Marie gana el Nobel de Química en 1911 en medio de escándalo personal"***

**Objetivo:**

Analizar un evento desde múltiples puntos de vista diferentes.

**Cómo resolverlo:**

Lee el evento central (ej: "Marie gana el Nobel")

**Completa la matriz con perspectivas de:**

**         **Marie Curie misma

Pierre Curie

Científicos contemporáneos

La prensa de la época

Mujeres de la época

La sociedad polaca

**Para cada perspectiva incluye:**

Reacción emocional

Opinión sobre el evento

Consecuencias percibidas

Basa tus respuestas en el contexto histórico

**Considera:**

Prejuicios de la época

Contexto político

Roles de género

Nacionalismo

*Perspectiva*

**Visión del Evento**

**Intereses/Sesgos**


|  ***Marie Curie*** | *Reconocimiento merecido por trabajo científico* | *Separar vida personal de logros profesionales* |
| --- | --- | --- |
| ***Prensa de la época*** | *Escándalo más importante que el logro* | *Vender periódicos, sensacionalismo* |
| ***Comunidad científica*** |  *División entre apoyo y rechazo* | *Mantener "reputación" de la ciencia* |
| ***Mujeres de la época*** |  *Inspiración y esperanza* | *Ver posibilidades en campos vedados* |


### MÓDULO 4: LECTURA DIGITAL Y MULTIMODAL


**[Separador visual - Línea decorativa]**



***Objetivo: ****Comprender y analizar textos en formatos digitales**.*


**[Separador visual - Línea decorativa]**



**Fuente base: **https://digitalcommons.fiu.edu/led/vol1 ss9/3


**[Elemento gráfico - Símbolo o decoración]**

/|





**[Separador visual - Línea decorativa]**



**Rango al completar:****HALACH UINIC**

###### Ejercicio 4.1: Verificador de Fake News




**[Separador visual - Línea decorativa]**



***l *****I*****dentificar noticias falsas sobre Marie Curie***

**Objetivo**

Identificar noticias falsas sobre Marie Curie usando herramientas de verificación.

**Cómo resolverlo:**

**     ** Lee la noticia completa

**Identifica elementos sospechosos:**

Titulares sensacionalistas

Fechas imposibles

Citas sin fuente

Imágenes manipuladas

**Usa las herramientas:**

Verificador de fechas

Buscador de fuentes

Detector de imágenes

**Marca cada elemento como:**

✅ Verificado

⚠️ Dudoso

❌ Falso

Escribe tu veredicto final con justificación

**Red flags comunes:**

"Científicos ODIAN este descubrimiento"

Fechas que no coinciden con la vida de Marie

Fotos obviamente modernas

Gramática deficiente

**TitularVeracidadSeñales de Alerta**


|   *"Marie Curie inventó la bomba atómica"* |     | *Anacronismo (murió antes del Proyecto Manhattan)* *Confusión con radiactividad* |
| --- | --- | --- |
| *"Curie: Primera mujer en ganar dos Nobel en diferentes ciencias"* |    |  *Verificable en nobelprize**.**org* |
|  *"Marie Curie brillaba en la oscuridad por la radiación"* |     | *Exageración sensacionalista* *Mito popular sin base científica* |
| *"Sus cuadernos siguen siendo radiactivos después de 100 años"* |    | *Confirmado por Biblioteca Nacional de Francia* |
| *"Marie Curie fue espiada por ser comunista"* |    | *Sin evidencia histórica* *Confusión de épocas* |
| *"Rechazó patentar sus descubrimientos para beneficio de la humanidad"* |    | *Documentado en sus escritos* |


###### Ejercicio 4.2: Creación de infografía Interactiva




**[Separador visual - Línea decorativa]**



**l *****Elementos arrastrables sobre descubrimientos científicos***

**Objetivo**

Diseñar una infografía sobre los logros de Marie Curie.

**Cómo resolverlo:**

Selecciona plantilla base

**Organiza la información:**

Título principal

5 datos clave

Línea de tiempo

2 gráficos/estadísticas

3 imágenes

**Usa las herramientas:**

Arrastra elementos

Cambia colores

Ajusta tamaños

Añade iconos

**Hazla interactiva:**

Añade enlaces

Tooltips informativos

Animaciones simples

Revisa coherencia visual

**Principios de diseño:**

Menos es más

Jerarquía visual clara

Colores consistentes

Fuentes legibles

**Secciones de la infografía****:**

- ***Línea de Tiempo Visual***

  - *1898**: **Descubrimiento Polonio (arrastrar fecha correcta)*

  - *1898**: **Descubrimiento Radio (arrastrar fecha correcta)*

  - *1903: Primer Nobel (arrastrar premio correcto)*

  - *1911**: **Segundo Nobel (arrastrar premio correcto)*

- ***Datos Estadísticos***

  - *8 toneladas de pechblenda procesadas*

  - *0**.**1 gramo de radio aislado*

  - *4 años de trabajo continuo*

- ***Enlaces Verificados***

  - *Instituto Curie (oficial)*

  - *Museo Marie Curie*

  - *Archivo Nobel*

###### Ejercicio 4.3: Quiz Estilo Tik Tok




**[Separador visual - Línea decorativa]**



**l ***** *****Guión***** para Video de 60 segundos***

**Objetivo**

Responder 10 preguntas rápidas en formato vertical en 60 segundos.

**Cómo resolverlo:**

Prepárate - el quiz empieza al dar "INICIAR"

Responde rápido - 6 segundos por pregunta

Tipos de interacción:

Click en la respuesta correcta

No puedes regresar a preguntas anteriores

El tiempo corre continuamente

**      Tips de velocidad:**

Lee rápido la pregunta clave

Confía en tu primer instinto

Los efectos visuales te dan pistas

**SegundoContenidoEfecto Visual**


|  *0-5* |  *"¿Cuánto sabes de Marie Curie?*  | *Texto animado + música trending* |
| --- | --- | --- |
|  *5-15* | *Pregunta 1: "¿Cuántos Nobel ganó?"* *A) 1 B) 2✓ C) 3* |  *Countdown 3-2-1* |
|   *15-25* | *Pregunta 2: "¿Qué elemento nombró por Polonia?"* *A) Radio B) Polonio✓ C) Curio* |   *Transición rápida* |
|  *25-35* | *Pregunta 3: "¿Primera mujer profesora en?"* *A) Oxford B) Sorbona✓ C) Cambridge* |  *Efecto de revelación* |
| *35-50* | *Datos curiosos rápidos verdadero o falso* | *Texto en movimiento* |
| *50-60* | *"¿Cuántas acertaste?*”  | Fin del Juego |


###### Ejercicio 4.4: Navegación Hipertextual




**[Separador visual - Línea decorativa]**



**l ***** ******Crear mapa de navegación de lectura digital***

**Objetivo**

Encontrar 5 "tesoros" de información navegando por páginas enlazadas.

**Cómo resolverlo:**

Comienza en la página principal sobre Marie

Busca palabras en azul (enlaces)

Haz clic para navegar a páginas relacionadas

**Encuentra los tesoros:**

🏆 Primer elemento descubierto

📅 Fecha de llegada a París

👤 Nombre del mentor

🔬 Término "radioactividad"

📍 Dirección del laboratorio

**Estrategia:**

Toma notas de dónde has estado

Los breadcrumbs te muestran el camino

Palabras en negrita suelen ser importantes

***t._	Radiactividad  [➔  Instituto Curie]t._	Recursos�	Videos [➔ YouTube educativo]�	Podcasts [➔ Spotify]t._	Papers [➔ Academia.edu]Documentar: • Ruta tomada• Tiempo en cada página• Hallazgos clave******t._	******Radiactividad  [******➔  ******Instituto Curie]******t._	******Recursos******�	Videos [******➔ ******YouTube educativo]******�	Podcasts [******➔ ******Spotify]******t._	******Papers [******➔ ******Academia.edu]******Documentar: • Ruta tomada• Tiempo en cada página• Hallazgos clave******Página Principal: "Marie Curie Digital"�I I I1�Biografía�	Infancia [ enlace interno]�	Educación [ enlace interno]¡  Logros [ enlace interno]Descubrimientos�Polonio[➔  Wikipedia verificada]�Radio[➔ Encyclopedia Britannica]******Página Principal: "Marie Curie Digital"******�******I I I******1******�******Biografía******�	******Infancia [ enlace interno]******�	******Educación [ enlace interno]******¡****** ****** Logros [ enlace interno]******Descubrimientos******�Polonio[******➔  ******Wikipedia verificada]******�Radio[******➔ ******Encyclopedia Britannica]***


**[Separador visual - Línea decorativa]**




**[Separador visual - Línea decorativa]**



###### Ejercicio 4.5: Análisis de Memes Educativos




**[Separador visual - Línea decorativa]**



**l ***** ******Crear y evaluar memes sobre radiactividad***

**Objetivo**

Evaluar la precisión y valor educativo de memes sobre Marie Curie.

Cómo resolverlo:

Observa el meme completo (imagen + texto)

**Identifica:**

El mensaje principal

El humor o ironía

La información implícita

**Evalúa:**

¿Es históricamente correcto?

¿Es educativo o solo entretenido?

¿Perpetúa estereotipos?

Califica (1-5 estrellas) en:

Precisión histórica

Valor educativo

Creatividad

Crea tu propio meme corrigiendo errores

**Consideraciones:**

El humor no justifica información falsa

Los anacronismos son comunes

Verifica fechas y hechos

*Plantilla Meme*

**Concepto Científico**

**Efectividad Pedagógica**

***Media - explica cambio de investigaciónNovio: PierreMira a: Radiactividad Novia: MagnetismoDistracted BoyfriendAlta - contraste claro de seguridadX "Guardar radio en el bolsillo""Usar protección contra la radiaciónDrake Format******Media - explica cambio de investigación******Novio******: ******Pierre******Mira a******: ******Radiactividad Novia: Magnetismo******Distracted Boyfriend******Alta - contraste claro de seguridad******X ******"Guardar radio en el bolsillo"******"Usar ******protección contra****** la****** ******radiación******Drake Format******Alta - ironía histórica educativaMujer: "¡El radio es peligroso!"Gato (Marie): *sigue investigando*Woman Velling at Cat******Alta - ironía histórica educativa******Mujer******: ******"¡El radio es peligroso!******"******Gato (Marie)******: *******sigue investigando*******Woman Velling at Cat***


**[Separador visual - Línea decorativa]**




**[Separador visual - Línea decorativa]**



# MÓDULO 5: PRODUCCIÓN Y EXPRESIÓN LECTORA


**[Separador visual - Línea decorativa]**



***Objetivo:***** **Crear contenido original basado en lo aprendido


**[Separador visual - Línea decorativa]**



***Nota: ****El usuario debe elegir y completar SOLO UNO de los 3 ejercicios disponibles.*

**Rango al completar:****K´UK´ULKAN**

##### OPCIÓN A: Diario Interactivo de Marie




**[Separador visual - Línea decorativa]**



**l ***** ******Escribir entradas en primera persona con multimedia***

**Objetivo**

Escribir 5 entradas de diario desde la perspectiva de Marie Curie.

**Cómo resolverlo:**

Selecciona 5 momentos clave de su vida

**Para cada entrada:**

Fecha específica

Saludo personal ("Querido diario...")

Descripción del evento del día

Sentimientos y reflexiones

Esperanzas o temores

Despedida

Usa lenguaje de época (finales 1800-principios 1900)

**Incluye:**

Detalles históricos precisos

Emociones creíbles

Conflictos internos

Mínimo 150 palabras por entrada

**Momentos sugeridos:**

Llegada a París (1891)

Descubrimiento del Radio (1898)

Primer Nobel (1903)

Muerte de Pierre (1906)

Segundo Nobel (1911)

**FechaEventoElementos RequeridosExtensión**


|  |  | *Descripción del* |  |
| --- | --- | --- | --- |
|  |  | *proceso* |  |
|  |  | *Emociones del* |  |
| *20 de abril de* | *Aislamiento del radio* | *momento* | *200-300* |
| *1902* | *puro* | *Reflexión sobre el* | *palabras* |
|  |  | *futuro* |  |
|  |  | *Imagen o dibujo del* |  |
|  |  | *laboratorio* |  |
|  |  | *Nerviosismo inicial* |  |
|  |  | *Reacción del público* |  |
| *5 de noviembre* | *Primera clase en la* | *Pensamientos sobre* | *250-350* |
| *de 1906* | *Sorbona* | *Pierre* | *palabras* |
|  |  | *Audio simulado* |  |
|  |  | *(opcional)* |  |
|  |  | *Conflicto interno* *Orgullo vs**. **dolor* |  |
| *1O de diciembre* *de 1911* | *Segundo Nobel en* *medio del escándalo* | *Reflexión sobre el* *precio de la fama* | *300-400* *palabras* |
|  |  | *Collage digital de prensa* |  |


###### OPCIÓN B: Resumen Visual Progresivo (Cómic Digital)




**[Separador visual - Línea decorativa]**



**l ***** ******Crear cómic de 6 viñetas resumiendo la vida de Marie***

**Objetivo**

Crear un cómic de 6 viñetas resumiendo la vida de Marie Curie.

**Cómo resolverlo:**

**Planifica tu historia:**

Viñeta 1: Introducción/infancia

Viñeta 2: Viaje a París

Viñeta 3: Encuentro con Pierre

Viñeta 4: Descubrimientos

Viñeta 5: Premios Nobel

Viñeta 6: Legado

**Para cada viñeta:**

Dibuja o selecciona imagen de biblioteca

Añade globos de diálogo

Incluye narración en recuadros

Usa onomatopeyas si es apropiado

**Mantén coherencia:**

Estilo visual consistente

Progresión narrativa clara

Balance texto-imagen

**Tips visuales:**

Usa diferentes planos (general, medio, primer plano)

Los colores pueden mostrar emociones

Menos texto, más impacto visual

**ViñetaEscenaDiálogo/NarraciónElementos Visuales**


|  *1* |  *Infancia en Polonia* | *"En Varsovia, los sueños parecían imposibles**.**.**.**"* | *Marie niña con libros prohibidos* |
| --- | --- | --- | --- |
|  *2* |  *Llegada a París* | *"¡La Sorbona! Por fin puedo estudiar libremente"* | *Ma**r**ie frente a la universidad* |
|  *3* | *Encuentro con Pierre* | *"La ciencia nos unió más que el amor"* | *Laboratorio compartido* |
|  *4* | *Descubrimiento del radio* | *"¡Brilla en la oscuridad! ¡Lo logramos!"* |  *Frasco luminoso* |
|  *5* |  *Primer Nobel* | *"Primera mujer**.**.**. **pero no la última"* | *Ceremonia de premiación* |
|  *6* |  *Legado* | *"Abrí puertas que ya no se cerrarán"* | *Montaje de científicas modernas* |


###### 

###### 

###### 

###### 

###### 

###### 

###### 

###### 

###### 

###### 

###### 

###### 

###### 

###### 

###### 

###### 

###### 

###### 

###### 

###### 

###### 

###### 

###### OPCIÓN C: Cápsula del Tiempo Digital




**[Separador visual - Línea decorativa]**



**l ***** ******Grabar video-carta de Marie al futuro (2-3 minutos)***

**Objetivo**

Crear un video de 3 minutos como si Marie Curie dejara un mensaje para el futuro.

**Cómo resolverlo:**

**Escribe el guion:**

Saludo (15 seg)

Presentación personal (30 seg)

Logros principales (45 seg)

Desafíos enfrentados (45 seg)

Mensaje sobre ciencia (30 seg)

Advertencias sobre radiación (30 seg)

Esperanzas para el futuro (30 seg)

Despedida (15 seg)

Graba frente a la cámara o usa avatar

**Caracterización:**

Viste apropiadamente (o usa filtro)

Habla en primera persona

Mantén el tono de época

**Edita (opcional):**

Añade música de fondo suave

Incluye imágenes de apoyo

Subtítulos si es necesario

**Elementos clave:**

Mantén contacto visual con cámara

Habla pausado y claro

Usa gestos apropiados

Transmite emoción

**Guión Sugerido:**

**Introducción ( segundos)**

- *"Soy Marie Curie, escribo desde 1934.**..**"*

- *Presentación personal y contexto*

**Mensaje Principal (90 segundos)**

- ***A las futuras científicas: ****"No permitan que las barreras**..**."*

- ***Sobre la ciencia: ****"La radiactividad es solo el principio.**.**.**"*

- ***Sobre la igualdad: ****"Espero que en su tiempo..**.**"*

- **Reflexiones y Advertencias (45 segundos)**

- **Peligros de la radiación (lo que ahora sabemos)**

- **Importancia de la ética científica**

- **Cierre (15 segundos)**

- **Esperanzas para el futuro**

- **Despedida inspiradora**

- **Elementos de Producción:**

- **Fondo: laboratorio vintage o moderno**

- **Vestuario: época o bata de laboratorio**

- **Props: elementos de laboratorio, libros**

- **Efectos: filtro sepia opcional**

## Sistema de Puntuación y Economía




**[Separador visual - Línea decorativa]**



###### Puntos XP por Módulo




**[Separador visual - Línea decorativa]**



      Numero de             Experiencia            Experiencia             Rango

    Módulo ejercicios        por ejercicio           total                         Obtenido


| 1.- Literal | 5 | 100 xp | 500 xp total | AJAW |
| --- | --- | --- | --- | --- |
| 2.- Inferencial | 5 | 100 xp | 500 xp total | NACOM |
| 3.- Crítica | 5 | 100 xp | 500 xp total | HOLOCATE |
| 4.- Digital | 5 | 100 xp | 500 xp total | HALACH UINIC |
| 5.- Producción | 1 de 3 opciones | 500 xp | 500 xp total | K´UK´ULKAN |


###### 

###### 

###### 

###### 

###### 

###### 

###### 


|  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |
|  |  |  |  |  |  |
|  |  |  |  |  |  |
|  |  |  |  |    |


###### 

###### 

###### 

###### Sistema de Monedas Lectoras (ML}




**[Separador visual - Línea decorativa]**



**l ***** ******Ganancia de ML***

- *Por ejercicio completado: ****20 ML***

- *Por respuesta correcta**: ****5 ML***

- *Por módulo completado: ****50 ML***

- *Bonus sin comodines**: ****30 ML***

- *Bonus por rango nuevo**: ****50-150 ML ****(según el rango)*

**l ***** ******Uso de ML - Comodines***

**ComodínCostoPenalización XP**


| Pistas | 15 ML | -10% |
| --- | --- | --- |
| Visión Lectora | 25 ML | -20% |
| Segunda Oportunidad | 40 ML | -30% |





**Interfaz: Tienda de Comodines y Ejercicio de Timeline**

*Sección Superior - Tienda de Comodines:*
┌──────────────────────────────────────────────────────────┐
│ 🪙 100 ML                    Tienda de Comodines         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐    │
│  │   PISTA     │  │   VISIÓN     │  │  SEGUNDA    │    │
│  │             │  │   LECTORA    │  │ OPORTUNIDAD │    │
│  │  Sugiere    │  │              │  │             │    │
│  │  palabras   │  │  Subraya un  │  │ Le brinda   │    │
│  │  claves que │  │  fragmento   │  │ al jugador  │    │
│  │  pueden ser │  │  del texto   │  │ una 2da     │    │
│  │  esenciales │  │  que contiene│  │ oportunidad │    │
│  │  para la    │  │  la info     │  │ para        │    │
│  │  comprensión│  │  relevante   │  │ seleccionar │    │
│  │  del texto  │  │              │  │ una opción  │    │
│  │             │  │              │  │ en caso de  │    │
│  │   15 ML     │  │   25 ML      │  │ falla 1ra   │    │
│  │             │  │              │  │ vez         │    │
│  │             │  │              │  │   40 ML     │    │
│  └─────────────┘  └──────────────┘  └─────────────┘    │
└──────────────────────────────────────────────────────────┘

*Sección Inferior - Ejercicio Timeline:*
┌──────────────────────────────────────────────────────────┐
│ ⏱ Tiempo estimado: 15 minutos                           │
│                                                          │
│ Ordena cronológicamente los eventos más importantes de  │
│ la vida de Marie Curie.                                 │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │         📖                                      │    │
│  │   Contenido del Ejercicio: timeline             │    │
│  │   El contenido específico del ejercicio se      │    │
│  │   implementará aquí.                            │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  [Volver al Módulo]            [Completar Ejercicio]    │
└──────────────────────────────────────────────────────────┘




# Diagrama de Navegación Completo




**[Separador visual - Línea decorativa]**






**Diagrama: Flujo de Navegación Principal**

```
┌─────────────────────────┐
│       INICIO            │
│   [Login/Registro]      │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────────────────────┐
│    SELECCIÓN DE MÓDULO                  │
├─────────────────────────────────────────┤
│ [✓] Módulo 1 → Desbloqueado → NACOM    │
│ [🔒] Módulo 2 → Requiere NACOM → BATAB │
│ [🔒] Módulo 3 → Requiere BATAB → HOLCATTE │
│ [🔒] Módulo 4 → Requiere HOLCATTE → GUERRERO │
│ [🔒] Módulo 5 → Requiere GUERRERO → MERCENARIO │
└───────────┬─────────────────────────────┘
            │
            ▼
```






**Diagrama: Flujo del Sistema de Ejercicios**

```
┌─────────────────────────────────┐
│   EJERCICIOS POR MÓDULO         │
├─────────────────────────────────┤
│ Módulos 1-4: Completar 5        │
│              ejercicios         │
│ Módulo 5: Elegir 1 de 3         │
│           opciones              │
│                                 │
│ [Sistema de Comodines           │
│  Disponible]                    │
│  💡 Pistas (15 ML)              │
│  👁 Visión (25 ML)               │
│  🔄 Segunda Oportunidad (40 ML) │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│   PROGRESO Y LOGROS             │
├─────────────────────────────────┤
│ Completar Módulo → Nuevo Rango  │
│                     Maya        │
│ Bonus ML → Economía del Sistema │
└─────────────────────────────────┘
```






**Diagrama: Requisitos para Mercenario**
```
┌─────────────────────────────────────────────┐
│ 5/5 Módulos = MERCENARIO (Máximo Rango)     │
└─────────────────────────────────────────────┘
```



# Certificación Final - Rango K´UK´ULKAN




**[Separador visual - Línea decorativa]**



**Al Completar los 5 Módulos**


**Icono: Trofeo**

🏆
[Icono de trofeo dorado sobre base marrón - representa logros y certificación]




#### RANGO: K´UK´ULKAN

*Máximo nivel en la jerarquía militar maya*

- *Certificado digital de completación*

- *150 ML de bonus final*

- *Badge de *K´UK´ULKAN

- *Acceso a estadísticas completas*

- *Reconocimiento en tabla de líderes*

###### Resumen de Progresión de Rangos




**[Separador visual - Línea decorativa]**



Rango MayaMódulos CompletadosML Acumuladas (mínimo)Status


| **AJAW** | *1* | 280 | *Iniciado* |
| --- | --- | --- | --- |
| **NACOM** | *2* | 610 | *Explorador* |
| **AH K´IN** | *3* | 965 | *Analítico* |
| **HALACH UINIC** | *4* | 1345 | *Crítico* |
| **K´UK´ULKAN** | *5* | 1850 | *Maestro* |





**[Separador visual - Línea decorativa]**



Sistema de Comprensión Lectora Gamificado - v6.0 Basado en los niveles de Daniel Cassany

© 2025 - Documento de Diseño e Implementación