# Módulo 1: Comprensión Literal

**Proyecto:** Gamilit Platform
**Módulo:** Contenido Educativo
**Archivo original:** MODULOS-EDUCATIVOS.md
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## RESUMEN DEL MÓDULO

**Objetivo Pedagógico:** Desarrollar la capacidad de identificar información **explícita** del texto: hechos, datos, fechas, nombres, eventos concretos.

**Mecánicas Implementadas:** 5
**Estado:** ✅ Production-Ready (100% completitud)

### Mecánicas del Módulo

| # | Tipo | Descripción | Auto-gradable |
|---|------|-------------|---------------|
| 1.1 | `linea_tiempo` | Ordenar eventos cronológicos con drag & drop | ✅ Sí |
| 1.2 | `emparejamiento` | Juego de memoria para emparejar fechas/eventos | ✅ Sí |
| 1.3 | `verdadero_falso` | Evaluar afirmaciones sobre hechos explícitos | ✅ Sí |
| 1.4 | `completar_espacios` | Fill-in-the-blank en texto sobre Marie Curie | ✅ Sí |
| 1.5 | `crucigrama_cientifico` | Crucigrama con vocabulario científico | ✅ Sí |

---

## MECÁNICAS IMPLEMENTADAS

### 1.1 Línea de Tiempo

**Tipo:** `linea_tiempo`
**Descripción:** Ordena eventos cronológicos mediante drag & drop con física realista.

**Características Técnicas:**
- Drag & drop con Framer Motion Reorder
- Animaciones fluidas con física
- Validación de orden cronológico
- Botón "Mezclar" para reiniciar
- Feedback visual de progreso

**Estructura de Contenido:**
```typescript
{
  events: Array<{
    id: string,
    year: number,
    title: string,
    description: string,
    imageUrl?: string
  }>,
  correctOrder: string[] // IDs en orden correcto
}
```

**Ejemplo de Contenido (6 eventos):**
1. Nacimiento en Varsovia (1867)
2. Estudios en la Sorbona (1891)
3. Descubrimiento del Polonio (1898)
4. Primer Nobel de Física (1903)
5. Muerte de Pierre Curie (1906)
6. Segundo Nobel de Química (1911)

**Scoring:**
- Base: 100 puntos × (posiciones correctas / total eventos)
- Penalty: -2 puntos por cada swap/movimiento
- Perfect Bonus: +20 puntos si orden 100% correcto en primer intento

**Auto-gradable:** ✅ Sí (comparación de orden)

---

### 1.2 Emparejamiento

**Tipo:** `emparejamiento`
**Descripción:** Juego de memoria para emparejar fechas con eventos de la vida de Marie Curie.

**Características Técnicas:**
- Tarjetas con animación de flip (Framer Motion)
- Sistema de matching con feedback visual
- Barajar automático al iniciar
- Contador de intentos
- Animaciones de success/fail

**Estructura de Contenido:**
```typescript
{
  pairs: Array<{
    id: string,
    left: string,  // Ej: "1867"
    right: string, // Ej: "Nacimiento en Varsovia"
    category: 'date-event' | 'term-definition' | 'person-achievement'
  }>
}
```

**Ejemplo de Pares (8):**
- 1867 ↔ Nacimiento en Varsovia
- 1891 ↔ Ingreso a la Sorbona
- 1898 ↔ Descubrimiento del Radio
- 1903 ↔ Primer Premio Nobel
- 1906 ↔ Muerte de Pierre Curie
- 1911 ↔ Segundo Premio Nobel
- Radio ↔ Símbolo: Ra
- Polonio ↔ Nombre por Polonia

**Scoring:**
- Base: 100 puntos × (pares correctos / total pares)
- Penalty: -2 puntos por cada intento fallido
- Time Bonus: +10 puntos si completa en <90 segundos
- Perfect Bonus: +15 puntos si no hay errores

**Auto-gradable:** ✅ Sí (matching automático)

---

### 1.3 Verdadero o Falso

**Tipo:** `verdadero_falso`
**Descripción:** Evalúa afirmaciones sobre hechos explícitos de Marie Curie.

**Características Técnicas:**
- Statements con botones V/F
- Feedback inmediato con explicación
- Progress bar visual
- Sistema de scoring por respuesta

**Estructura de Contenido:**
```typescript
{
  statements: Array<{
    id: string,
    text: string,
    correctAnswer: boolean,
    explanation: string,
    difficulty: 'easy' | 'medium' | 'hard'
  }>
}
```

**Ejemplo de Statements (10):**
1. "Marie Curie nació en Francia" → **Falso** (Nació en Polonia)
2. "Marie Curie ganó dos Premios Nobel" → **Verdadero**
3. "El símbolo del Radio es Ra" → **Verdadero**
4. "Pierre Curie descubrió la radioactividad solo" → **Falso** (Colaboraron)
5. "Marie Curie fue la primera mujer en ganar un Nobel" → **Verdadero**

**Scoring:**
- Easy: 5 puntos por respuesta correcta
- Medium: 7 puntos
- Hard: 10 puntos
- Penalty: -3 puntos por respuesta incorrecta
- Perfect Streak: +15 puntos si todas correctas

**Auto-gradable:** ✅ Sí (comparación booleana)

---

### 1.4 Completar Espacios

**Tipo:** `completar_espacios`
**Descripción:** Fill-in-the-blank en texto sobre Marie Curie.

**Características Técnicas:**
- Texto con gaps editables
- Validación en tiempo real
- Hints disponibles (costo: 10 ML Coins)
- Sistema de autocorrección

**Estructura de Contenido:**
```typescript
{
  text: string, // Texto con placeholders {gap1}, {gap2}, etc.
  gaps: Array<{
    id: string,
    correctAnswer: string,
    alternativeAnswers?: string[], // Sinónimos aceptados
    hint?: string
  }>
}
```

**Ejemplo de Texto:**
"Marie Curie nació en {1} en el año {2}. Estudió en la Universidad de la {3} en París. Descubrió dos elementos químicos: {4} y {5}. Ganó su primer Premio Nobel en {6} y el segundo en {7}."

**Respuestas:**
1. Varsovia (alt: Warsaw)
2. 1867
3. Sorbona
4. Radio / Polonio (orden intercambiable)
5. Polonio / Radio
6. 1903
7. 1911

**Scoring:**
- Base: 100 puntos × (gaps correctos / total gaps)
- Penalty: -5 puntos por hint usado
- Case-insensitive: Acepta mayúsculas/minúsculas
- Synonym-aware: Acepta alternativas válidas

**Auto-gradable:** ✅ Sí (validación con alternativas)

---

### 1.5 Crucigrama Científico

**Tipo:** `crucigrama_cientifico`
**Descripción:** Crucigrama interactivo con vocabulario científico relacionado con los descubrimientos de Marie Curie.

**Características Técnicas:**
- Grid interactivo con validación en tiempo real
- Navegación con teclado (flechas, backspace)
- Auto-guardado de progreso
- Sistema de pistas con costo en ML Coins (15 coins)
- Validación automática de palabras completadas

**Estructura de Contenido:**
```typescript
{
  grid: {
    rows: number,
    cols: number,
    cells: Array<{row, col, value, isBlack, number}>
  },
  clues: {
    across: Array<{number, clue, answer}>,
    down: Array<{number, clue, answer}>
  }
}
```

**Ejemplo de Contenido:**
- Horizontal 1: "Elemento descubierto por Marie Curie con símbolo Ra" → RADIO
- Vertical 1: "País de origen de Marie Curie" → POLONIA
- Horizontal 3: "Mineral del que se extrajo el radio" → PECHBLENDA

**Scoring:**
- Base: 100 puntos × (palabras correctas / total palabras)
- Penalty: -5 puntos por pista usada
- Time Bonus: +10 puntos si completa en <50% tiempo límite

**Auto-gradable:** ✅ Sí (validación automática case-insensitive)

---

## CONTENIDO EDUCATIVO: MARIE CURIE

### Cobertura de Contenido en el Módulo

Todo el material educativo está centrado en Marie Curie y estructurado para desarrollar comprensión literal a través de su historia.

#### Temas Cubiertos

**Biografía:**
- Infancia en Polonia (Varsovia)
- Estudios en la Universidad de la Sorbona (París)
- Matrimonio con Pierre Curie
- Vida familiar y balance con la ciencia
- Años finales y legado

**Descubrimientos Científicos:**
- Descubrimiento del Radio (Ra)
- Descubrimiento del Polonio (Po)
- Teoría de la Radioactividad
- Trabajo con pechblenda (mineral de uranio)
- Estudios sobre radiación

**Contexto Histórico:**
- Situación de Polonia bajo ocupación rusa (s. XIX)
- París como centro científico europeo
- Restricciones para mujeres en ciencia (1900s)
- Primera Guerra Mundial (unidades móviles de rayos X)

**Reconocimientos:**
- Premio Nobel de Física (1903) - compartido con Pierre Curie y Henri Becquerel
- Premio Nobel de Química (1911) - único en su categoría
- Primera mujer en ganar Nobel
- Primera persona en ganar 2 Nobels en diferentes categorías

#### Línea de Tiempo Principal (8 Eventos)

1. **1867** - Nacimiento en Varsovia, Polonia
2. **1891** - Ingreso a la Universidad de la Sorbona, París
3. **1895** - Matrimonio con Pierre Curie
4. **1898** - Descubrimiento del Polonio y Radio
5. **1903** - Premio Nobel de Física (compartido)
6. **1906** - Muerte de Pierre Curie (accidente)
7. **1911** - Premio Nobel de Química (individual)
8. **1934** - Muerte por anemia aplásica (exposición a radiación)

#### Vocabulario Científico (50+ Términos)

- Radioactividad, radiación, radioactivo
- Radio, Polonio, Uranio, Pechblenda
- Átomo, elemento, compuesto
- Laboratorio, experimento, hipótesis
- Isótopo, emisión, decaimiento
- Rayos X, rayos alfa/beta/gamma
- Física, química, ciencia
- Nobel, reconocimiento, premio

---

## INTEGRACIÓN CON SISTEMA DE GAMIFICACIÓN

### Sistema de Scoring Unificado

```typescript
interface ScoreResult {
  baseScore: number;        // 0-100 por precisión
  timeBonus: number;        // Bonus por velocidad
  accuracyBonus: number;    // Bonus por alta precisión (>90%)
  totalScore: number;       // Score total
  mlCoins: number;          // ML Coins ganados (con multiplicador de rango)
  xpGained: number;         // Experiencia ganada (con multiplicador de rango)
  feedback: string;         // Mensaje de retroalimentación
}
```

**Multiplicadores aplicados:**
- Rank multiplier (1.0x a 2.0x según rango Maya)
- Difficulty multiplier (easy: 1.0x, medium: 1.2x, hard: 1.5x)
- Streak bonus (+5% por día consecutivo)
- Perfect bonus (+20% si score = 100)
- First attempt bonus (+15 ML Coins si primer intento correcto)

### Sistema de Pistas (Hints)

**Características:**
- Costo: 15 ML Coins por pista
- Penalty: -10% en XP ganado
- Límite: 3 pistas máximo por ejercicio
- Validación: Verifica balance de ML Coins antes de otorgar

### Feedback y Retroalimentación

**Elementos:**
- **Inmediato:** Feedback visual durante ejercicio (correcto/incorrecto)
- **Post-completion:** Modal con confeti, score, ML Coins ganados, XP, mensaje motivacional
- **Explicaciones:** Cada respuesta incorrecta incluye explicación educativa
- **Fun Facts:** Datos curiosos sobre Marie Curie al finalizar

---

## MÉTRICAS EDUCATIVAS

### Métricas Tracked por Mecánica

- Intentos por ejercicio
- Score promedio
- Tiempo promedio de completitud
- Hints usados promedio
- Power-ups usados
- Tasa de completitud

### Métricas del Módulo

- % de ejercicios completados
- Score promedio del módulo
- Tiempo total en módulo
- Strengths (tipos de ejercicio con score >85%)
- Weaknesses (tipos de ejercicio con score <70%)

---

## RESPONSIVE DESIGN Y ACCESIBILIDAD

### Breakpoints

- **Mobile:** <640px (1 columna)
- **Tablet:** 640px-1024px (2 columnas)
- **Desktop:** >1024px (3-4 columnas)

### Touch Optimization

- Botones con tamaño mínimo 44x44px
- Touch targets espaciados (8px mínimo)
- Gestos swipe para navegación
- Drag & drop adaptado a touch

### Estándares WCAG 2.1 AA

- ✅ Contraste de color >4.5:1
- ✅ ARIA labels en elementos interactivos
- ✅ Navegación por teclado
- ✅ Focus indicators visibles
- ✅ Alt text en imágenes
- ✅ Screen reader support

### Keyboard Navigation

- `Tab` / `Shift+Tab`: Navegación entre campos
- `Enter`: Submit/continuar
- `Escape`: Cerrar modals
- `Arrow keys`: Navegación en grids y listas

---

## 🔗 Referencias a Implementación

### Documento Principal
📄 **[MODULOS-EDUCATIVOS.md](./MODULOS-EDUCATIVOS.md#-referencias-a-implementación)** - Referencias completas de las 31 mecánicas

### Específico para Módulo 1 - Comprensión Literal

**Database:**
- `educational_content.exercises` WHERE `type` IN ('linea_tiempo', 'emparejamiento', 'lectura_comprension', 'vf_justificado', 'ordenar_parrafos')
- `educational_content.modules` WHERE `name` = 'Comprensión Literal'

**Backend:**
- `apps/backend/src/modules/educational/services/grading/linea-tiempo.grader.ts`
- `apps/backend/src/modules/educational/services/grading/emparejamiento.grader.ts`
- `apps/backend/src/modules/educational/services/grading/lectura-comprension.grader.ts`
- `apps/backend/src/modules/educational/services/grading/vf-justificado.grader.ts`
- `apps/backend/src/modules/educational/services/grading/ordenar-parrafos.grader.ts`

**Frontend:**
- `apps/frontend/src/features/educational/components/exercises/LineaTiempoExercise.tsx` - Framer Motion Reorder
- `apps/frontend/src/features/educational/components/exercises/EmparejamientoExercise.tsx` - Memory game
- `apps/frontend/src/features/educational/components/exercises/LecturaComprensionExercise.tsx` - Quiz múltiple opción
- `apps/frontend/src/features/educational/components/exercises/VerdaderoFalsoJustificadoExercise.tsx` - V/F + justificación
- `apps/frontend/src/features/educational/components/exercises/OrdenarParrafosExercise.tsx` - Drag & drop párrafos

**Seed Data:**
- `apps/database/seed/exercises/modulo-1-ejercicios.json` - 5 ejercicios sobre Marie Curie

---

**Documento preparado por:** Equipo de Análisis Técnico
**Última actualización:** 2025-11-01
**Versión:** 2.0 (Modularizado)
