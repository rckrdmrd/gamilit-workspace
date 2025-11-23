# GAMILIT – Plataforma Educativa Gamificada
**Sistema de comprensión lectora gamificado basado en Daniel Cassany**
**Texto base:** Biografía de Marie Curie

**Versión:** 6.4 (Actualizado 2025-11-23)
**Tipo de documento:** Documento de diseño e implementación

**Cambios en v6.4:**
- ✅ Ejercicio 3.4: Duración de podcast ajustada a 2 minutos (desarrollo reducido a 1 min)
- ✅ Ejercicio 5C: Estructura de guión actualizada a 4 secciones (Introducción 30s, Mensaje Principal 90s, Reflexiones 45s, Cierre 15s)
- ✅ Ejercicio 5C: Total de video optimizado a 180 segundos (3 minutos exactos)

**Cambios en v6.3:**
- ✅ Módulo 3 actualizado con instrucciones detalladas "Cómo resolverlo" para cada ejercicio
- ✅ Agregadas mecánicas específicas: tarjetas arrastrables, checklist interactivo, guión de podcast
- ✅ Tablas de ejemplos mejoradas con más detalle
- ✅ Estructura de debate digital estructurada con tiempos específicos

**Cambios en v6.2:**
- ✅ Umbrales de XP sincronizados con implementación DB v2.0 (valores realistas y alcanzables)
- ✅ Bonus ML Coins actualizados según configuración en producción
- ✅ Multiplicadores XP ajustados a implementación real
- ⚠️ Multiplicador ML Coins marcado como "Pendiente Implementación" (no existe en DB actual)

---

## 📝 Nota de Terminología

**Exercise Types (Tipos de Ejercicio):**
En este documento se definen 23 tipos de ejercicios distribuidos en 5 módulos educativos. En la implementación técnica, estos tipos se denominan `exercise_type` (no "mecánicas", ya que "mecánicas" se refiere más al sistema de gamificación).

**Términos clave:**
- **exercise_type**: Tipo específico de ejercicio (ej: `crucigrama`, `detective_textual`, `debate_digital`)
- **Módulo**: Agrupación pedagógica de 3-5 ejercicios con un objetivo de comprensión específico
- **XP (Experience Points)**: Puntos de experiencia que determinan el rango del usuario
- **ML Coins (Monedas Lectoras)**: Moneda virtual para comprar comodines y ayudas
- **Rango Maya**: Nivel jerárquico del usuario basado en XP acumulado

---

## Índice

1. [Sistema de Rangos Mayas](#sistema-de-rangos-mayas)  
2. [Jerarquía de Rangos](#jerarquía-de-rangos)  
3. [Módulo 1: Comprensión Literal](#módulo-1-comprensión-literal)  
   - Ejercicio 1.1: Crucigrama Científico  
   - Ejercicio 1.2: Línea de Tiempo de Marie Curie  
   - Ejercicio 1.3: Completar Espacios en Blanco  
   - Ejercicio 1.4: Verdadero o Falso  
   - Ejercicio 1.5: Sopa de Letras (BONUS)  
4. [Módulo 2: Comprensión Inferencial](#módulo-2-comprensión-inferencial)  
   - Ejercicio 2.1: Detective Textual  
   - Ejercicio 2.2: Construcción de Hipótesis  
   - Ejercicio 2.3: Predicción Narrativa  
   - Ejercicio 2.4: Puzzle de Contexto  
   - Ejercicio 2.5: Rueda de Inferencias  
5. [Módulo 3: Comprensión Crítica y Valorativa](#módulo-3-comprensión-crítica-y-valorativa)  
   - Ejercicio 3.1: Tribunal de Opiniones  
   - Ejercicio 3.2: Debate Digital Estructurado  
   - Ejercicio 3.3: Análisis de Fuentes  
   - Ejercicio 3.4: Creación de Podcast Argumentativo  
   - Ejercicio 3.5: Matriz de Perspectivas  
6. [Módulo 4: Lectura Digital y Multimodal](#módulo-4-lectura-digital-y-multimodal)  
   - Ejercicio 4.1: Verificador de Fake News  
   - Ejercicio 4.2: Creación de Infografía Interactiva  
   - Ejercicio 4.3: Quiz Estilo TikTok  
   - Ejercicio 4.4: Navegación Hipertextual  
   - Ejercicio 4.5: Análisis de Memes Educativos  
7. [Módulo 5: Producción y Expresión Lectora](#módulo-5-producción-y-expresión-lectora)  
   - Opción A: Diario Interactivo de Marie  
   - Opción B: Resumen Visual Progresivo (Cómic Digital)  
   - Opción C: Cápsula del Tiempo Digital  
8. [Sistema de Puntuación y Economía](#sistema-de-puntuación-y-economía)  
9. [Sistema de Monedas Lectoras (ML)](#sistema-de-monedas-lectoras-ml)  
10. [Diagrama de Navegación Completo](#diagrama-de-navegación-completo)  
11. [Certificación Final – Rango K´UK´ULKAN](#certificación-final--rango-kukulkan)  
12. [Resumen de Progresión de Rangos](#resumen-de-progresión-de-rangos)  

---

## Sistema de Rangos Mayas

La plataforma utiliza un sistema de rangos basado en la jerarquía militar maya.
Los usuarios avanzan de rango acumulando **Puntos de Experiencia (XP)** al completar ejercicios y módulos.

**Concepto clave:** Los rangos se obtienen por XP acumulado total, no por módulos completados. Esto permite progresión flexible y recompensa la dedicación continua.

---

## Jerarquía de Rangos

### Tabla de Rangos y Umbrales de XP

| Nivel | Rango Maya       | Umbral XP Mínimo | Umbral XP Máximo | Bonus por Subida | Multiplicador XP | Multiplicador ML Coins |
|-------|------------------|------------------|------------------|------------------|------------------|------------------------|
| 1     | **AJAW**         | 0                | 499              | -                | 1.00x            | 🔸 N/I                 |
| 2     | **NACOM**        | 500              | 999              | +100 ML          | 1.10x (+10%)     | 🔸 N/I                 |
| 3     | **AH K´IN**      | 1,000            | 1,499            | +250 ML          | 1.15x (+15%)     | 🔸 N/I                 |
| 4     | **HALACH UINIC** | 1,500            | 2,249            | +500 ML          | 1.20x (+20%)     | 🔸 N/I                 |
| 5     | **K´UK´ULKAN**   | 2,250            | ∞                | +1,000 ML        | 1.25x (+25%)     | 🔸 N/I                 |

**🔸 N/I = No Implementado:** El multiplicador ML Coins está en backlog (fase futura). Actualmente solo se aplica el multiplicador XP y el bonus único de ML Coins al subir de rango.

### Descripción de Columnas

- **Umbral XP**: Cantidad de XP total acumulado necesario para alcanzar el rango
- **Bonus por Subida**: ML Coins otorgados de forma única al alcanzar el nuevo rango
- **Multiplicador XP**: Porcentaje adicional de XP ganado por ejercicio completado (✅ Implementado)
- **Multiplicador ML Coins**: 🔸 Pendiente implementación (backlog fase futura)

### Ejemplos de Progresión

**Nota:** Con 5 módulos de 500 XP cada uno = **2,500 XP máximo alcanzable** completando todo el contenido disponible.

| Rango Actual      | XP para Subir | Ejercicios Aproximados (100 XP/ejercicio) | Módulos Equivalentes | Tiempo Estimado |
|-------------------|---------------|-------------------------------------------|---------------------|-----------------|
| Ajaw → Nacom      | 500 XP        | ~5 ejercicios                             | 1 módulo            | 2-3 días        |
| Nacom → Ah K'in   | 1,000 XP      | ~10 ejercicios                            | 2 módulos           | 5-7 días        |
| Ah K'in → Halach  | 1,500 XP      | ~15 ejercicios                            | 3 módulos           | 10-14 días      |
| Halach → K'uk'ulkan | 2,250 XP    | ~22-23 ejercicios                         | 4.5 módulos         | 3-4 semanas     |

**Progresión completa:** Completar todos los 5 módulos (23 ejercicios) otorga ~2,500 XP, suficiente para alcanzar K'uk'ulkan.

---

## MÓDULO 1: COMPRENSIÓN LITERAL

**Objetivo:** Localizar información explícita del texto sobre Marie Curie.  
**Rango al completar:** `AJAW`

---

### Ejercicio 1.1: Crucigrama Científico – DISTRIBUCIÓN

**Objetivo:**  
Completar un crucigrama de **15×15 casillas** con términos relacionados con Marie Curie.

**Cómo resolverlo:**

1. Leer todas las pistas antes de empezar (horizontales y verticales).  
2. Comenzar con las palabras más largas o las que se conozcan con seguridad.  
3. Usar las intersecciones: cuando dos palabras se cruzan, la letra debe coincidir.  
4. Contar las casillas: cada pista indica cuántas letras tiene la respuesta.  
5. Revisar el texto base: todas las respuestas están en la biografía de Marie Curie.

**Estrategia recomendada:**

- Empezar por palabras seguras (por ejemplo: `POLONIA`, `MARIE`, `CURIE`).  
- Aprovechar las intersecciones para deducir palabras difíciles.  
- Si el usuario se atasca, permitir el uso del comodín **“Pista”** para revelar una letra.

#### Pistas y Respuestas del Crucigrama (Implementadas en Seeds)

**HORIZONTALES (3 pistas):**

1. **Pista 1 (H1):** Universidad donde estudió
   - **Respuesta:** SORBONA
   - **Posición:** Fila 4, Columna 3
   - **Longitud:** 7 letras

2. **Pista 2 (H2):** Premio recibido en 1903 y 1911
   - **Respuesta:** NOBEL
   - **Posición:** Fila 6, Columna 3
   - **Longitud:** 5 letras

3. **Pista 3 (H3):** Fenómeno de emisión espontánea de radiación descubierto por Marie
   - **Respuesta:** RADIOACTIVIDAD
   - **Posición:** Fila 8, Columna 1
   - **Longitud:** 14 letras

**VERTICALES (3 pistas):**

4. **Pista 4 (V1):** Elemento químico nombrado en honor a Polonia
   - **Respuesta:** POLONIO
   - **Posición:** Fila 3, Columna 4
   - **Longitud:** 7 letras

5. **Pista 5 (V2):** Elemento químico radiactivo descubierto
   - **Respuesta:** RADIO
   - **Posición:** Fila 8, Columna 1
   - **Longitud:** 5 letras

6. **Pista 6 (V3):** Apellido de Marie
   - **Respuesta:** CURIE
   - **Posición:** Fila 8, Columna 7
   - **Longitud:** 5 letras

#### Representación textual del crucigrama (Grid 15×15)

```text
Grid 15×15 con las 6 palabras distribuidas:

   1  2  3  4  5  6  7  8  9 10 11 12 13 14 15
1  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■
2  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■
3  ■  ■  ■  P  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■
4  ■  ■  S  O  R  B  O  N  A  ■  ■  ■  ■  ■  ■  ← H1: SORBONA
5  ■  ■  ■  L  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■
6  ■  ■  N  O  B  E  L  ■  ■  ■  ■  ■  ■  ■  ■  ← H2: NOBEL
7  ■  ■  ■  N  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■
8  R  A  D  I  O  A  C  T  I  V  I  D  A  D  ■  ← H3: RADIOACTIVIDAD
9  ■  ■  ■  O  ■  ■  U  ■  ■  ■  ■  ■  ■  ■  ■
10 ■  ■  ■  ■  ■  ■  R  ■  ■  ■  ■  ■  ■  ■  ■
11 ■  ■  ■  ■  ■  ■  I  ■  ■  ■  ■  ■  ■  ■  ■
12 ■  ■  ■  ■  ■  ■  E  ■  ■  ■  ■  ■  ■  ■  ■
13 ■  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■
14 ■  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■
15 ■  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■  ■
         ↑                    ↑
      V1: POLONIO          V3: CURIE
      V2: RADIO (columna 1, fila 8-12)
```

**Intersecciones:**
- SORBONA (H1) × POLONIO (V1) = letra 'O' (fila 4, col 4)
- NOBEL (H2) × POLONIO (V1) = letra 'O' (fila 6, col 4)
- RADIOACTIVIDAD (H3) × RADIO (V2) = letra 'R' (fila 8, col 1)
- RADIOACTIVIDAD (H3) × CURIE (V3) = letra 'C' (fila 8, col 7)

> Estas pistas y posiciones están implementadas en los seeds de la base de datos en:
> - `apps/database/seeds/dev/educational_content/02-exercises-module1.sql`
> - `apps/database/seeds/prod/educational_content/02-exercises-module1.sql`

---

### Ejercicio 1.2: Línea de Tiempo de Marie Curie

**Descripción:**  
Ordenar cronológicamente los eventos más importantes de la vida de Marie Curie mediante un componente **drag & drop** interactivo.

**Mecánica del ejercicio:**

- Interfaz con **tarjetas arrastrables** de eventos.  
- Validación automática al soltar cada tarjeta.  
- *Feedback* visual inmediato:  
  - Verde = correcto  
  - Rojo = incorrecto  
- 3 intentos sin penalización.

**Eventos a ordenar (6):**

1. Nace en Varsovia, Polonia, como Maria Sklodowska (1867).  
2. Se traslada a París para estudiar en la Sorbona (1891).  
3. Descubre el Polonio y el Radio (1898).  
4. Recibe su primer Premio Nobel de Física (1903).  
5. Muerte de Pierre Curie (1906).  
6. Recibe su segundo Premio Nobel, esta vez en Química (1911).

**Representación textual sugerida (línea de tiempo):**

```text
[1867] Nace en Varsovia, Polonia (Maria Sklodowska)
   ↓
[1891] Llega a París para estudiar en la Sorbona
   ↓
[1898] Descubre el Polonio y el Radio
   ↓
[1903] Primer Premio Nobel de Física
   ↓
[1906] Muerte de Pierre Curie
   ↓
[1911] Segundo Premio Nobel (Química)
```

---

### Ejercicio 1.3: Completar Espacios en Blanco

**Descripción:**  
Leer el texto sobre Marie Curie y completar los espacios con las palabras correctas de un banco de palabras.

**Texto del ejercicio:**

> "Marie Sklodowska nació en _______(1), Polonia.  
> Su padre _______(2) era profesor de matemáticas y física, mientras que su madre _______(3) dirigía una escuela prestigiosa.  
> La familia valoraba mucho la _______(4) y Marie mostró desde pequeña gran curiosidad por las _______(5) y _______(6)."

**Banco de Palabras:**

- `[ Varsovia ]`
- `[ Władysław ]`
- `[ Bronisława ]`
- `[ educación ]`
- `[ ciencias ]`
- `[ Polonia ]`
- `[ matemáticas ]`
- `[ física ]`

**Respuestas correctas:**

1. **Varsovia** – Ciudad natal de Marie.  
2. **Władysław** – Nombre del padre.  
3. **Bronisława** – Nombre de la madre.  
4. **educación** – Valor fundamental familiar.  
5. **ciencias** – Primer interés de Marie.  
6. **matemáticas** o **física** – Ambas válidas.

---

### Ejercicio 1.4: Verdadero o Falso

**Descripción:**  
Evaluar afirmaciones sobre hechos explícitos de la juventud de Marie Curie según un contexto histórico.

**Contexto proporcionado:**

> "Durante su infancia en Polonia, Marie era conocida por su insaciable curiosidad científica.  
> Su padre le enseñó los primeros principios de las matemáticas y la física, mientras su madre la inspiró con su dedicación a la educación."

**Afirmaciones y respuestas (10):**

1. Marie mostró curiosidad excepcional por las ciencias desde muy pequeña.  
   - **Respuesta:** ✅ VERDADERO  
   - **Explicación:** Se menciona su "insaciable curiosidad científica".

2. Su padre era profesor de química solamente.  
   - **Respuesta:** ❌ FALSO  
   - **Explicación:** Era profesor de matemáticas y física.

3. Marie nació en Francia.  
   - **Respuesta:** ❌ FALSO  
   - **Explicación:** Nació en Polonia (Varsovia).

4. Su familia valoraba mucho la educación.  
   - **Respuesta:** ✅ VERDADERO  
   - **Explicación:** Se menciona explícitamente.

5. La madre de Marie dirigía una escuela.  
   - **Respuesta:** ✅ VERDADERO  
   - **Explicación:** Dirigía una escuela prestigiosa.

6. Marie Curie ganó su primer Nobel a los 20 años.  
   - **Respuesta:** ❌ FALSO  
   - **Explicación:** Lo ganó en 1903, con 36 años aproximadamente.

7. El nombre original de Marie era Maria Sklodowska.  
   - **Respuesta:** ✅ VERDADERO.

8. Marie fue la primera mujer en ganar un Premio Nobel.  
   - **Respuesta:** ✅ VERDADERO.

9. Su padre no apoyaba su interés en las ciencias.  
   - **Respuesta:** ❌ FALSO  
   - **Explicación:** Él le enseñó matemáticas y física.

10. Marie estudió en la Universidad de Varsovia.  
    - **Respuesta:** ❌ FALSO  
    - **Explicación:** Estudió en la Sorbona de París.

---

### Ejercicio 1.5: Sopa de Letras (BONUS)

**Descripción:**  
Encontrar palabras clave relacionadas con Marie Curie en una sopa de letras interactiva.  
Ejercicio **bonus** opcional.

**Mecánica:**

- Cuadrícula de **12×12 letras**.  
- Direcciones válidas: horizontal, vertical y diagonal.  
- Selección por click + arrastrar para marcar palabras.  
- *Feedback* visual: palabras encontradas permanecen iluminadas.  
- Tiempo límite: 10 minutos.

**Palabras a encontrar (10):**

`MARIE`, `CURIE`, `POLONIA`, `NOBEL`, `RADIO`, `POLONIO`, `PARIS`, `SORBONA`, `CIENCIA`, `FISICA`

#### Representación textual de la sopa de letras (12×12)

```text
J X E I R U C U S T P M
P O L O N I A Q M F Y C
A I C N E I C F N I T X
Y M F M P S V G P S E P
M F E G A O X N B I C Y
A I Z L H R L P A C C J
A W J A M B I O A A B T
F W C Z T O X E N R R O
W F J W Y N K O A I I Z
L E B O N A N V K D O S
E R N W Z Y L B A T B G
F H O P W U W R W J R W
```

> Todas las palabras de la lista están ocultas en la cuadrícula, en alguna de las direcciones permitidas.

---

## MÓDULO 2: COMPRENSIÓN INFERENCIAL

**Objetivo:** Leer entre líneas, hacer deducciones y anticipar ideas.  
**Rango al completar:** `NACOM`

---

### Ejercicio 2.1: Detective Textual

**Descripción:**  
Leer fragmentos y seleccionar la inferencia correcta entre 3 opciones.

**Ejemplo de fragmento:**

> "Marie se puso un abrigo grueso antes de entrar al laboratorio donde trabajaba con sustancias radiactivas."

**Pregunta:**  
¿Qué puedes inferir sobre las condiciones del laboratorio?

- A) El laboratorio tenía calefacción moderna.  
- B) El laboratorio era muy frío, probablemente sin calefacción. ✅  
- C) Marie era muy friolenta.

**Explicación:**  
En la época, los laboratorios carecían de comodidades básicas y Marie trabajaba en condiciones precarias.

---

### Ejercicio 2.2: Construcción de Hipótesis

**Relaciones causa–efecto sobre Marie Curie**

**Objetivo:**  
Conectar causas con sus consecuencias lógicas sobre decisiones de Marie Curie.

**Cómo resolverlo:**

1. Leer la **CAUSA** en la columna izquierda.  
2. Analizar las **CONSECUENCIAS** disponibles a la derecha.  
3. Arrastrar las consecuencias correctas hacia cada causa.  
4. Cada causa puede tener entre 1 y 3 consecuencias.

Se consideran:

- Efectos inmediatos.  
- Efectos a largo plazo.  
- Impacto en otras personas.

**Ejemplo:**

- **CAUSA:** "Marie no patentó el proceso del radio".  
- **CONSECUENCIAS correctas:**  
  - Otros científicos pudieron investigar.  
  - No obtuvo riquezas de su descubrimiento.  
  - La medicina avanzó más rápido.

#### Representación en tabla

```text
CAUSA                                      →  CONSECUENCIAS (arrastrar las correctas)
----------------------------------------------------------------------------------------
Marie decidió no patentar el proceso de    →  [+] Otros científicos pudieron continuar
aislamiento del radio                         la investigación
                                            [+] No obtuvo riquezas de su descubrimiento
                                            [+] La medicina avanzó más rápidamente
                                            [ ] Demostró su independencia científica

Marie continuó trabajando después de la    →  [+] Completó investigaciones pendientes
muerte de Pierre                            [+] Se convirtió en la primera profesora
                                                 de la Sorbona
                                            ...
```

(La implementación puede mostrar las consecuencias como tarjetas arrastrables.)

---

### Ejercicio 2.3: Predicción Narrativa

**Objetivo:**  
Predecir cómo continúa o termina un párrafo basándose en el contexto histórico.

**Cómo resolverlo:**

1. Leer el inicio del párrafo incompleto.  
2. Identificar:
   - Época histórica.  
   - Contexto social.  
   - Personalidad de los personajes.  
3. Analizar las 4 opciones de continuación.  
4. Descartar las que sean:
   - Anacrónicas.  
   - Contrarias al carácter del personaje.  
   - Históricamente incorrectas.  
5. Seleccionar la opción más coherente.

**Pistas clave:**

- Contexto de discriminación de género.  
- Marie era perseverante pero modesta.  
- Los hechos históricos no cambian.

**Inicio del párrafo:**

> "Cuando Marie presentó su candidatura a la Academia de Ciencias Francesa en 1911, siendo ya ganadora del Nobel..."

**Opciones:**

A. Fue aceptada inmediatamente con honores.  
B. Fue rechazada por ser mujer, a pesar de sus logros. ✅  
C. Decidió retirar su candidatura.  
D. Fue elegida presidenta de la Academia.

**Pista contextual:** considerar prejuicios de género de la época.

---

### Ejercicio 2.4: Puzzle de Contexto

**Objetivo:**  
Ordenar fragmentos para crear una inferencia coherente.

**Fragmentos desordenados:**

- A) "demostró una determinación extraordinaria"  
- B) "A pesar de las barreras sociales y económicas"  
- C) "que enfrentó como mujer inmigrante"  
- D) "convirtiéndose en pionera de la ciencia moderna"

**Orden correcto:**

> "A pesar de las barreras sociales y económicas que enfrentó como mujer inmigrante, demostró una determinación extraordinaria, convirtiéndose en pionera de la ciencia moderna."

---

### Ejercicio 2.5: Rueda de Inferencias

**Mecánica del juego:**

- Girar una ruleta virtual para obtener una **categoría**.  
- Leer el fragmento presentado.  
- Escribir una inferencia en 30 segundos.  
- Competencia por equipos con puntuación.

#### Representación textual de la “rueda”

En lugar de la rueda visual, se puede mostrar una lista de categorías y seleccionar aleatoriamente una:

```text
Categorías posibles:
1. Emociones no expresadas
2. Contexto social
3. Motivaciones ocultas
4. Consecuencias a largo plazo
...
```

#### Ejemplos de categorías y fragmentos

| Categoría                | Fragmento                                        | Inferencia esperada                                               | Puntos |
|--------------------------|--------------------------------------------------|-------------------------------------------------------------------|--------|
| Emociones no expresadas  | "Marie trabajó 4 años procesando toneladas de pechblenda" | Frustración, cansancio, pero también esperanza y determinación   | 20     |
| Contexto social          | "Marie usaba su apellido de casada en publicaciones"       | Era más aceptable publicar como mujer casada que como soltera    | 20     |

---

## MÓDULO 3: COMPRENSIÓN CRÍTICA Y VALORATIVA

**Objetivo:** Emitir juicios, identificar intenciones del autor, argumentar posturas.
**Rango al completar:** `AH K´IN`

---

### Ejercicio 3.1: Tribunal de Opiniones

**Mecánica:** Clasificar afirmaciones usando tarjetas digitales arrastrables.

**Objetivo:**
Evaluar diferentes opiniones sobre Marie Curie y determinar cuáles están bien fundamentadas.

**Cómo resolverlo:**

1. Lee la opinión presentada.
2. Identifica:
   - La afirmación principal.
   - Las evidencias que la apoyan.
   - Los argumentos usados.
3. Evalúa según criterios:
   - ¿Tiene evidencia factual?
   - ¿Es lógicamente coherente?
   - ¿Evita falacias?
4. Asigna un veredicto:
   - `Bien fundamentada` ✅
   - `Parcialmente fundamentada` ⚠️
   - `Sin fundamento` ❌
5. Justifica tu decisión en 2–3 líneas.

**Criterios de evaluación:**

- Evidencia > Opinión
- Hechos > Suposiciones
- Lógica > Emoción

#### Ejemplos

| Afirmación sobre Marie Curie | Clasificación | Justificación |
|------------------------------|---------------|---------------|
| "Marie Curie murió el 4 de julio de 1934" | HECHO | Dato histórico verificable en registros |
| "Fue la científica más brillante del siglo XX" | OPINIÓN | Juicio de valor subjetivo, no medible |
| "Su exposición al radio contribuyó a su enfermedad" | INTERPRETACIÓN | Deducción basada en evidencia, no confirmada definitivamente |

---

### Ejercicio 3.2: Debate Digital Estructurado

**Tema:**
> ¿La fama afectó negativamente la investigación de Marie Curie?

**Objetivo:**
Participar en un debate argumentado sobre decisiones controversiales de Marie Curie.

**Cómo resolverlo:**

**Fase 1: Preparación (5 minutos)**
- Recibe tu postura (asignada aleatoriamente).
- Lee las fuentes de información disponibles.
- Prepara 3 argumentos principales.
- Anticipa posibles contra-argumentos.

**Fase 2: Debate (10 minutos)**
- **Apertura (1 min):** Presenta tu postura principal.
- **Desarrollo (2 min):** Expón tus 3 argumentos.
- **Réplica (2 min):** Responde a argumentos contrarios.
- **Contra-réplica (2 min):** Defiende tu posición.
- **Cierre (30 seg):** Conclusión contundente.

**Fase 3: Votación**
- Otros usuarios votan el mejor argumento.
- Se evalúa: claridad, evidencia, persuasión.

**Tips para ganar:**
- Usa datos concretos.
- Cita fuentes.
- Mantén respeto.
- Sé conciso.

#### Ejemplo de argumentos

| Rol | Argumentos Principales | Evidencia del Texto |
|-----|------------------------|---------------------|
| **A FAVOR** | Invasión de privacidad / Tiempo perdido en eventos / Presión mediática | Escándalo tras muerte de Pierre / Múltiples ceremonias obligatorias / Acoso periodístico documentado |
| **EN CONTRA** | Mayor financiación / Reconocimiento institucional / Mejores recursos | Laboratorio mejorado post-Nobel / Colaboraciones internacionales / Apoyo gubernamental |

---

### Ejercicio 3.3: Análisis de Fuentes

**Mecánica:** Evaluar credibilidad de 5 textos sobre Marie usando checklist interactivo.

**Objetivo:**
Evaluar la confiabilidad de diferentes fuentes de información sobre Marie Curie.

**Cómo resolverlo:**

1. Examina cada fuente presentada.
2. Aplica el método **CRAAP**:
   - **Currency** (Actualidad): ¿Cuándo se publicó?
   - **Relevance** (Relevancia): ¿Es pertinente?
   - **Authority** (Autoridad): ¿Quién es el autor?
   - **Accuracy** (Precisión): ¿Es verificable?
   - **Purpose** (Propósito): ¿Por qué se escribió?
3. Asigna puntuación (1-5) en cada criterio.
4. Clasifica la fuente:
   - **Muy confiable** (20-25 puntos)
   - **Confiable** (15-19 puntos)
   - **Cuestionable** (10-14 puntos)
   - **No confiable** (<10 puntos)

**Señales de alerta:**
- Sin autor identificable.
- Sin fecha de publicación.
- Lenguaje emotivo excesivo.
- Sin referencias.

#### Ejemplos de evaluación

| Fuente | Autor | Fecha | Credibilidad | Problemas / Fortalezas |
|--------|-------|-------|--------------|------------------------|
| Biografía oficial UNESCO | Historiadores verificados | 2020 | **ALTA** | ✓ Fuentes primarias, ✓ Revisión académica |
| Blog "Mujeres increíbles" | Anónimo | Sin fecha | **BAJA** | ✗ Sin autor, ✗ Sin referencias |
| Wikipedia – Marie Curie | Múltiples editores | Actualización continua | **MEDIA** | ± Verificar referencias, ± Posibles errores |

---

### Ejercicio 3.4: Creación de Podcast Argumentativo

**Tema:**
> Impacto de Marie Curie en la equidad de género en ciencia.

**Objetivo:**
Crear un podcast de 2 minutos defendiendo o criticando una decisión de Marie Curie.

**Cómo resolverlo:**

1. Elige tu tema de la lista disponible.
2. Estructura tu podcast:
   - **Introducción (30 seg):** Presenta el tema.
   - **Desarrollo (1 min):** 3 argumentos principales.
   - **Conclusión (30 seg):** Resumen y llamada a la reflexión.
3. Graba usando el botón de grabación.
4. Incluye:
   - Al menos 3 datos verificables.
   - 2 citas o referencias.
   - Tu opinión personal fundamentada.
5. Revisa antes de enviar (puedes regrabar).

**Elementos clave:**
- Habla claro y pausado.
- Usa transiciones ("en primer lugar", "además", "por lo tanto").
- Varía el tono para mantener interés.

#### Guión Sugerido

**Introducción (0:00-0:20)**
- *Hook:* "¿Sabían que Marie Curie fue rechazada de la Academia de Ciencias pese a tener un Nobel?"
- *Tesis:* "Marie Curie no solo revolucionó la ciencia, sino que abrió puertas para generaciones de mujeres científicas."

**Argumentos (0:20-1:30)**
- **Argumento 1:** Primera mujer en ganar un Nobel (evidencia).
- **Argumento 2:** Primera profesora en la Sorbona (impacto).
- **Argumento 3:** Modelo para futuras científicas (legado).

**Conclusión (1:30-2:00)**
- Síntesis de impacto.
- Llamado a la acción.

---

### Ejercicio 3.5: Matriz de Perspectivas

**Evento:**
> "Marie gana el Nobel de Química en 1911 en medio de escándalo personal."

**Objetivo:**
Analizar un evento desde múltiples puntos de vista diferentes.

**Cómo resolverlo:**

1. Lee el evento central (ej: "Marie gana el Nobel").
2. Completa la matriz con perspectivas de:
   - Marie Curie misma.
   - Pierre Curie.
   - Científicos contemporáneos.
   - La prensa de la época.
   - Mujeres de la época.
   - La sociedad polaca.
3. Para cada perspectiva incluye:
   - Reacción emocional.
   - Opinión sobre el evento.
   - Consecuencias percibidas.
4. Basa tus respuestas en el contexto histórico.
5. Considera:
   - Prejuicios de la época.
   - Contexto político.
   - Roles de género.
   - Nacionalismo.

#### Ejemplo de matriz

| Perspectiva | Visión del Evento | Intereses / Sesgos |
|-------------|-------------------|-------------------|
| **Marie Curie** | Reconocimiento merecido por trabajo científico | Separar vida personal de logros profesionales |
| **Prensa de la época** | Escándalo más importante que el logro | Vender periódicos, sensacionalismo |
| **Comunidad científica** | División entre apoyo y rechazo | Mantener "reputación" de la ciencia |
| **Mujeres de la época** | Inspiración y esperanza | Ver posibilidades en campos vedados |

---

## MÓDULO 4: LECTURA DIGITAL Y MULTIMODAL

**Objetivo:** Comprender y analizar textos en formatos digitales.  
**Fuente base sugerida:** (artículo académico digital)  

**Rango al completar:** `HALACH UINIC`

---

### Ejercicio 4.1: Verificador de Fake News

**Objetivo:**  
Identificar noticias falsas sobre Marie Curie usando herramientas de verificación digital.

**Mecánica:**

1. Leer la noticia completa.  
2. Identificar elementos sospechosos:
   - Titulares sensacionalistas.  
   - Fechas imposibles.  
   - Citas sin fuente.  
   - Imágenes manipuladas.  
3. Usar herramientas:
   - Verificador de fechas.  
   - Buscador de fuentes.  
   - Detector de imágenes.  
4. Marcar elementos:
   - ✅ Verificado.  
   - ⚠ Dudoso.  
   - ❌ Falso.  
5. Escribir veredicto final con justificación.

**Red flags comunes:**

- "Científicos ODIAN este descubrimiento".  
- Fechas que no coinciden con la vida de Marie.  
- Fotos obviamente modernas.  
- Gramática deficiente.

#### Ejemplos de titulares

| Titular                                                      | Veracidad | Señales de alerta / notas                         |
|-------------------------------------------------------------|-----------|---------------------------------------------------|
| "Marie Curie inventó la bomba atómica"                      | ❌        | Anacronismo; murió antes del Proyecto Manhattan. |
| "Curie: Primera mujer en ganar dos Nobel en diferentes ciencias" | ✅ | Verificable en nobelprize.org.                   |
| "Marie Curie brillaba en la oscuridad por la radiación"     | ❌/⚠      | Exageración sensacionalista; mito popular.        |
| "Sus cuadernos siguen siendo radiactivos después de 100 años" | ✅ | Confirmado por Bibliothèque Nationale de France. |
| "Marie Curie fue espiada por ser comunista"                 | ❌        | Sin evidencia histórica; confusión de épocas.     |
| "Rechazó patentar sus descubrimientos para beneficio de la humanidad" | ✅ | Documentado en sus escritos.                    |

---

### Ejercicio 4.2: Creación de Infografía Interactiva

**Objetivo:**  
Diseñar una infografía digital sobre los logros de Marie Curie.

**Mecánica:**

- Seleccionar plantilla base.  
- Organizar información:
  - Título principal.  
  - 5 datos clave.  
  - Línea de tiempo.  
  - 2 gráficos/estadísticas.  
  - 3 imágenes.  
- Herramientas:
  - Arrastrar elementos.  
  - Cambiar colores, tamaños, iconos.  
- Hacerla interactiva:
  - Enlaces a sitios oficiales.  
  - Tooltips informativos.  
  - Animaciones simples.

**Principios de diseño:**

- Menos es más.  
- Jerarquía visual clara.  
- Paleta de colores consistente.  
- Fuentes legibles.

**Secciones sugeridas:**

1. **Línea de tiempo visual:**
   - 1898: descubrimiento del Polonio.  
   - 1898: descubrimiento del Radio.  
   - 1903: primer Nobel.  
   - 1911: segundo Nobel.

2. **Datos estadísticos:**
   - 8 toneladas de pechblenda procesadas.  
   - 0.1 gramos de radio aislado.  
   - 4 años de trabajo continuo.

3. **Enlaces verificados:**
   - Instituto Curie.  
   - Museo Marie Curie.  
   - Archivo Nobel.

---

### Ejercicio 4.3: Quiz Estilo TikTok

**Objetivo:**  
Responder 10 preguntas rápidas en formato vertical en 60 segundos.

**Mecánica:**

- Iniciar el quiz.  
- Responder cada pregunta en ~6 segundos.  
- No se puede retroceder a preguntas anteriores.  
- Efectos visuales acompañan las respuestas.

**Guión temporal (ejemplo):**

| Segundo | Contenido                                                                        | Efecto visual                             |
|---------|----------------------------------------------------------------------------------|-------------------------------------------|
| 0–5     | "¿Cuánto sabes de Marie Curie?"                                                 | Texto animado + música trending           |
| 5–15    | Pregunta 1: "¿Cuántos Nobel ganó?" (A) 1 (B) 2 ✅ (C) 3                         | Cuenta regresiva 3–2–1                    |
| 15–25   | Pregunta 2: "¿Qué elemento nombró por Polonia?" (A) Radio (B) Polonio ✅ (C) Curio | Transición rápida                      |
| 25–35   | Pregunta 3: "¿Primera mujer profesora en...?" (A) Oxford (B) Sorbona ✅ (C) Cambridge | Efecto de revelación                |
| 35–50   | Datos curiosos rápidos (verdadero o falso)                                      | Texto en movimiento                       |
| 50–60   | "¿Cuántas acertaste?" – fin del juego                                           | Pantalla final                            |

---

### Ejercicio 4.4: Navegación Hipertextual

**Objetivo:**  
Encontrar 5 “tesoros” de información navegando entre páginas enlazadas.

**Mecánica:**

1. Empezar en una página principal sobre Marie.  
2. Buscar palabras en azul (enlaces).  
3. Navegar a páginas relacionadas.  
4. Encontrar los “tesoros”:
   - 🏆 Primer elemento descubierto.  
   - 📅 Fecha de llegada a París.  
   - 👤 Nombre del mentor.  
   - 🔬 Término "radioactividad".  
   - 📍 Dirección del laboratorio.

**Estrategia:**

- Tomar notas de las páginas visitadas.  
- Usar *breadcrumbs* o migas de pan.  
- Prestar atención a palabras en negritas.

---

### Ejercicio 4.5: Análisis de Memes Educativos

**Objetivo:**  
Evaluar la precisión y valor educativo de memes sobre Marie Curie o radiactividad.

**Mecánica:**

1. Observar el meme (imagen + texto).  
2. Identificar:
   - Mensaje principal.  
   - Humor o ironía.  
   - Información implícita.  
3. Evaluar:
   - ¿Es históricamente correcto?  
   - ¿Es educativo o solo entretenido?  
   - ¿Perpetúa estereotipos?  
4. Calificar (1–5 estrellas) en:
   - Precisión histórica.  
   - Valor educativo.  
   - Creatividad.  
5. Crear un meme propio corrigiendo errores comúnmente vistos.

**Consideraciones:**

- El humor no justifica información falsa.  
- Los anacronismos son frecuentes.  
- Verificar fechas y hechos.

---

## MÓDULO 5: PRODUCCIÓN Y EXPRESIÓN LECTORA

**Objetivo:** Crear contenido original basado en lo aprendido.  
**Nota:** El usuario debe elegir y completar **SOLO UNO** de los 3 ejercicios disponibles.  
**Rango al completar:** `K´UK´ULKAN`

---

### OPCIÓN A: Diario Interactivo de Marie

**Objetivo:**  
Escribir 5 entradas de diario desde la perspectiva de Marie Curie.

**Mecánica:**

- Seleccionar 5 momentos clave de su vida.  
- Cada entrada debe incluir:
  - Fecha específica.  
  - Saludo personal ("Querido diario...").  
  - Descripción del evento del día.  
  - Sentimientos y reflexiones.  
  - Esperanzas o temores.  
  - Despedida.  
- Usar lenguaje acorde a finales del siglo XIX / principios del XX.  
- Mínimo 150 palabras por entrada.  

**Momentos sugeridos:**

- Llegada a París (1891).  
- Descubrimiento del Radio (1898).  
- Primer Nobel (1903).  
- Muerte de Pierre (1906).  
- Segundo Nobel (1911).  

#### Tabla de ejemplos de entradas

| Fecha                 | Evento                            | Elementos requeridos                                                 | Extensión                    |
|-----------------------|------------------------------------|----------------------------------------------------------------------|------------------------------|
| 20 de abril de 1902   | Aislamiento del radio puro        | Descripción del proceso, emociones del momento, reflexión sobre el futuro, imagen del laboratorio | 200–300 palabras + imagen   |
| 5 de noviembre de 1906| Primera clase en la Sorbona       | Nerviosismo inicial, reacción del público, pensamientos sobre Pierre, audio simulado (opcional)    | 250–350 palabras            |
| 10 de diciembre de 1911| Segundo Nobel en medio de escándalo | Conflicto interno, orgullo vs. dolor, reflexión sobre la fama, collage digital de prensa          | 300–400 palabras + collage  |

---

### OPCIÓN B: Resumen Visual Progresivo (Cómic Digital)

**Objetivo:**  
Crear un cómic de 6 viñetas resumiendo la vida de Marie Curie.

**Mecánica:**

1. Planificar la historia:
   - Viñeta 1: Infancia en Polonia.  
   - Viñeta 2: Viaje a París.  
   - Viñeta 3: Encuentro con Pierre.  
   - Viñeta 4: Descubrimientos.  
   - Viñeta 5: Premios Nobel.  
   - Viñeta 6: Legado.

2. Para cada viñeta:
   - Dibujo o imagen de biblioteca.  
   - Globos de diálogo.  
   - Recuadros de narrador.  
   - Onomatopeyas (si procede).

3. Mantener coherencia:
   - Estilo visual consistente.  
   - Progresión narrativa clara.  
   - Balance texto–imagen.

**Tips visuales:**

- Usar distintos planos (general, medio, primer plano).  
- Colores para representar emociones.  
- Poco texto para mayor impacto.

#### Ejemplo en formato tabla

| Viñeta | Escena               | Diálogo / Narración                              | Elementos visuales                     |
|--------|----------------------|--------------------------------------------------|----------------------------------------|
| 1      | Infancia en Polonia  | "En Varsovia, los sueños parecían imposibles..."| Marie niña con libros "prohibidos".    |
| 2      | Llegada a París      | "¡La Sorbona! Por fin puedo estudiar libremente."| Marie frente a la universidad.         |
| 3      | Encuentro con Pierre | "La ciencia nos unió más que el amor."          | Laboratorio compartido.                |
| 4      | Descubrimiento del radio | "¡Brilla en la oscuridad! ¡Lo logramos!"    | Frasco luminoso.                        |
| 5      | Primer Nobel         | "Primera mujer... pero no la última."           | Ceremonia de premiación.              |
| 6      | Legado               | "Abrí puertas que ya no se cerrarán."           | Montaje de científicas modernas.      |

---

### OPCIÓN C: Cápsula del Tiempo Digital

**Objetivo:**
Crear un video de 2–3 minutos como si Marie Curie dejara un mensaje para el futuro.

**Mecánica:**

1. Escribir guion:
   - **Introducción (30 seg):** Saludo y presentación personal con contexto
   - **Mensaje Principal (90 seg):** Logros, desafíos y reflexiones sobre la ciencia
   - **Reflexiones y Advertencias (45 seg):** Peligros de la radiación y ética científica
   - **Cierre (15 seg):** Esperanzas para el futuro y despedida

2. Grabar frente a la cámara o usando un avatar.

3. Caracterización:
   - Vestuario de época o bata de laboratorio.
   - Hablar en primera persona.
   - Tono de época.

4. Edición (opcional):
   - Música de fondo suave.
   - Imágenes de apoyo.
   - Subtítulos.

**Elementos clave:**

- Mantener contacto visual con la cámara.
- Hablar pausado y claro.
- Usar gestos apropiados.
- Transmitir emoción.

#### Guion Sugerido

**Introducción (30 segundos)**
- "Soy Marie Curie, escribo desde 1934..."
- Presentación personal y contexto

**Mensaje Principal (90 segundos)**
- A las futuras científicas: "No permitan que las barreras..."
- Sobre la ciencia: "La radiactividad es solo el principio..."
- Sobre la igualdad: "Espero que en su tiempo..."

**Reflexiones y Advertencias (45 segundos)**
- Peligros de la radiación (lo que ahora sabemos)
- Importancia de la ética científica

**Cierre (15 segundos)**
- Esperanzas para el futuro
- Despedida inspiradora

**Elementos de Producción:**

- **Fondo:** laboratorio vintage o moderno
- **Vestuario:** época o bata de laboratorio
- **Props:** elementos de laboratorio, libros
- **Efectos:** filtro sepia opcional

---

## Sistema de Puntuación y Economía

### Puntos XP por Módulo

| Módulo            | Nº de ejercicios | XP por ejercicio | XP total módulo | Rango obtenido    |
|-------------------|------------------|------------------|-----------------|-------------------|
| 1 – Literal       | 5                | 100 XP           | 500 XP          | AJAW              |
| 2 – Inferencial   | 5                | 100 XP           | 500 XP          | NACOM             |
| 3 – Crítica       | 5                | 100 XP           | 500 XP          | AH K´IN           |
| 4 – Digital       | 5                | 100 XP           | 500 XP          | HALACH UINIC      |
| 5 – Producción    | 1 de 3 opciones  | 500 XP           | 500 XP          | K´UK´ULKAN        |

> Nota: La suma de XP por módulo mantiene una progresión lineal pero ligada a la obtención de rangos mayas.

---

## Sistema de Monedas Lectoras (ML)

### Ganancia de ML

- Por ejercicio completado: **+20 ML** (base, antes de multiplicador).
- Por respuesta correcta: **+5 ML** (base, antes de multiplicador).
- Por módulo completado: **+50 ML** (base, antes de multiplicador).
- Bonus por completar módulo sin comodines: **+30 ML**.
- **Bonus único por subida de rango:**
  - Ajaw → Nacom: **+100 ML**
  - Nacom → Ah K'in: **+250 ML**
  - Ah K'in → Halach Uinic: **+500 ML**
  - Halach Uinic → K'uk'ulkan: **+1,000 ML**

**⚠️ Nota sobre Multiplicadores ML Coins:**
Los multiplicadores de ML Coins por rango (1.00x a 2.00x) están documentados pero **NO implementados en la versión actual**. Esta funcionalidad está en el backlog para fases futuras. Actualmente solo se aplican:
- ✅ Bonus único de ML al subir de rango
- ✅ Multiplicadores de XP por rango (1.00x a 1.25x)

### Uso de ML – Comodines

| Comodín            | Costo (ML) | Penalización de XP |
|--------------------|-----------:|--------------------|
| **Pistas**         | 15 ML      | –10 % de XP        |
| **Visión Lectora** | 25 ML      | –20 % de XP        |
| **Segunda Oportunidad** | 40 ML | –30 % de XP        |

> El diseño incentiva completar ejercicios sin comodines para maximizar XP, pero permite apoyo moderado usando ML.

---

## Diagrama de Navegación Completo

Representación textual del flujo de navegación entre módulos:

```text
INICIO
  ↓
Pantalla de bienvenida GAMILIT
  ↓
Selección de texto base: "Biografía de Marie Curie"
  ↓
[Módulo 1 – Comprensión Literal]
  ↓ (al completar, se otorga rango AJAW)
[Módulo 2 – Comprensión Inferencial]
  ↓ (rango NACOM)
[Módulo 3 – Comprensión Crítica y Valorativa]
  ↓ (rango AH K´IN)
[Módulo 4 – Lectura Digital y Multimodal]
  ↓ (rango HALACH UINIC)
[Módulo 5 – Producción y Expresión Lectora (elegir A/B/C)]
  ↓ (rango K´UK´ULKAN)
  ↓
Certificación final + estadísticas + tabla de líderes
```

Puntos clave:

- Cada módulo se desbloquea al completar el anterior.  
- El usuario puede revisar módulos previos para mejorar puntaje (sin modificar rangos ya obtenidos).  
- El perfil del usuario muestra:
  - Rango actual.  
  - XP total.  
  - ML disponibles.  
  - Progreso por módulo.  

---

## Certificación Final – Rango K´UK´ULKAN

**Al alcanzar 2,250 XP y obtener el rango K´UK´ULKAN:**

- RANGO: **K´UK´ULKAN**
  - Máximo nivel en la jerarquía militar maya.
  - Alcanzable completando ~4.5 módulos con excelencia (2,250 XP)

**Recompensas:**

- Certificado digital de completación.
- **+1,000 ML** de bonus por alcanzar el rango máximo.
- Insignia (badge) de `K´UK´ULKAN` con efectos visuales épicos.
- **Multiplicador permanente de 1.25x (+25%)** en XP ganado.
- Acceso a estadísticas completas de desempeño.
- Reconocimiento en la **tabla de líderes**.
- Avatar frame animado exclusivo.
- Perks exclusivos: mentor_access, exclusive_events, hall_of_fame, downloadable_certificate.

---

## Resumen de Progresión de Rangos

| Rango Maya     | XP Requerido | ML Coins por Subida | Multiplicador XP | Multiplicador ML | Status     |
|----------------|--------------|---------------------|------------------|------------------|-----------|
| AJAW           | 0 - 499      | -                   | 1.00x            | 🔸 N/I           | Iniciado  |
| NACOM          | 500 - 999    | +100 ML             | 1.10x (+10%)     | 🔸 N/I           | Explorador|
| AH K´IN        | 1,000 - 1,499| +250 ML             | 1.15x (+15%)     | 🔸 N/I           | Analítico |
| HALACH UINIC   | 1,500 - 2,249| +500 ML             | 1.20x (+20%)     | 🔸 N/I           | Crítico   |
| K´UK´ULKAN     | 2,250+       | +1,000 ML           | 1.25x (+25%)     | 🔸 N/I           | Maestro   |

**Notas:**
- Los rangos se obtienen automáticamente al alcanzar el umbral de XP especificado.
- Los multiplicadores XP se aplican inmediatamente al obtener el nuevo rango.
- 🔸 N/I: Multiplicador ML Coins no implementado (backlog fase futura).

---

**Sistema de Comprensión Lectora Gamificado – v6.4**
Basado en los niveles de Daniel Cassany
© 2025 – Documento de Diseño e Implementación – GAMILIT

---

**Historial de versiones:**
- v6.4 (2025-11-23): Ajustes en ejercicios de Módulos 3 y 5
  - ✅ Ejercicio 3.4 (Podcast): Duración ajustada a 2 minutos
  - ✅ Ejercicio 5C (Cápsula del Tiempo): Nueva estructura de guión en 4 secciones
- v6.3 (2025-11-20): Mejoras en Módulo 3
  - ✅ Instrucciones detalladas "Cómo resolverlo" agregadas
  - ✅ Mecánicas específicas documentadas
- v6.2 (2025-11-19): Sincronización completa con implementación DB v2.0
  - ✅ Umbrales XP ajustados a valores realistas (0-499, 500-999, 1k-1.5k, 1.5k-2.2k, 2.2k+)
  - ✅ Bonus ML Coins actualizados (100, 250, 500, 1000)
  - ✅ Multiplicadores XP alineados (1.00x, 1.10x, 1.15x, 1.20x, 1.25x)
  - ⚠️ Multiplicador ML Coins marcado como pendiente (no implementado en DB)
- v6.1.1 (2025-11-18): Homologación preliminar con documentación técnica
