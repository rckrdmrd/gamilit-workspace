# Módulo 2: Comprensión Inferencial

**Proyecto:** Gamilit Platform
**Módulo:** Contenido Educativo
**Archivo original:** MODULOS-EDUCATIVOS.md
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## RESUMEN DEL MÓDULO

**Objetivo Pedagógico:** Desarrollar la capacidad de **deducir información implícita**, hacer inferencias, construir hipótesis a partir de evidencias del texto.

**Mecánicas Implementadas:** 5
**Estado:** ✅ Production-Ready (100% completitud)

### Mecánicas del Módulo

| # | Tipo | Descripción | Auto-gradable |
|---|------|-------------|---------------|
| 2.1 | `detective_textual` | Investigación con tablero de evidencias y pistas AI | ✅ Sí |
| 2.2 | `construccion_hipotesis` | Constructor del método científico con validador AI | ⚠️ Semi |
| 2.3 | `prediccion_narrativa` | Predicción de historia con continuación AI | ⚠️ Semi |
| 2.4 | `puzzle_contexto` | Ensamblado de piezas de contexto con drag-and-drop | ✅ Sí |
| 2.5 | `rueda_inferencias` | Visualizador de rueda con mapeo de conexiones | ⚠️ Semi |

---

## MECÁNICAS IMPLEMENTADAS

### 2.1 Detective Textual

**Tipo:** `detective_textual`
**Descripción:** Interfaz de investigación con tablero de evidencias y sistema de pistas AI.

**Características Técnicas:**
- Tablero de evidencias con drag-and-drop
- Herramienta de lupa virtual para análisis de texto
- Sistema de pistas AI (costo: 15 ML Coins)
- Descubrimiento y validación de conexiones
- Scoring en tiempo real

**Estructura de Contenido:**
```typescript
{
  text: string, // Texto principal para analizar
  questions: Array<{
    id: string,
    question: string,
    type: 'inference' | 'connection' | 'hypothesis',
    correctAnswer: string,
    explanation: string,
    evidenceLocation: {
      startIndex: number,
      endIndex: number
    }
  }>,
  cluesAvailable: string[] // Pistas disponibles
}
```

**Ejemplo de Caso:**
- **Texto:** Extracto de carta de Marie Curie describiendo síntomas de fatiga y sangrado
- **Inferencia 1:** "¿Qué podría estar causando estos síntomas?" → Exposición prolongada a radiación
- **Evidencia:** Fragmento donde menciona trabajo con materiales radiactivos sin protección
- **Conexión:** Relacionar síntomas con conocimiento moderno sobre efectos de radiación

**Scoring:**
- Base: 60 puntos × (conexiones correctas / total conexiones)
- Discovery Bonus: 30 puntos × (evidencias descubiertas / total evidencias)
- Base Points: 10 puntos por participación
- Penalty: -10 puntos por pista AI usada

**Auto-gradable:** ✅ Sí (validación de conexiones predefinidas)

---

### 2.2 Construcción de Hipótesis

**Tipo:** `construccion_hipotesis`
**Descripción:** Constructor del método científico con validador de hipótesis AI.

**Características Técnicas:**
- Sistema de selección de variables (independiente, dependiente, controladas)
- Constructor de statement de hipótesis
- Template del método científico
- Validación AI de estructura de hipótesis
- Análisis de relevancia de variables

**Estructura de Contenido:**
```typescript
{
  scenario: string, // Escenario científico de Marie Curie
  variables: Array<{
    id: string,
    name: string,
    type: 'independent' | 'dependent' | 'controlled',
    description: string,
    isRelevant: boolean
  }>,
  expectedHypothesis: {
    template: string, // "Si [X], entonces [Y], porque [Z]"
    validVariables: string[] // IDs de variables correctas
  }
}
```

**Ejemplo de Escenario:**
"Marie Curie observó que diferentes muestras de pechblenda emitían distintos niveles de radiación. Quiso investigar qué factores influían en esta diferencia."

**Variables:**
- **Independiente:** Concentración de uranio en la muestra
- **Dependiente:** Nivel de radiación emitida
- **Controladas:** Temperatura, tamaño de muestra, tiempo de medición

**Hipótesis Esperada:**
"Si aumentamos la concentración de uranio en la pechblenda, entonces el nivel de radiación emitida será mayor, porque el uranio es el elemento radiactivo principal."

**Scoring:**
- Variables correctas: 40 puntos
- Estructura de hipótesis válida: 40 puntos
- Razonamiento científico: 20 puntos
- AI Validation Bonus: +10 puntos si hipótesis bien fundamentada

**Auto-gradable:** ⚠️ Semi (validación AI de estructura, revisión humana de razonamiento)

---

### 2.3 Predicción Narrativa

**Tipo:** `prediccion_narrativa`
**Descripción:** Interfaz de predicción de historia con continuación AI.

**Características Técnicas:**
- Display de inicio de historia con contexto
- Input de predicción del usuario (mínimo 50 caracteres)
- Generación AI de continuación realista
- Análisis de precisión de predicción
- Generación de finales alternativos

**Estructura de Contenido:**
```typescript
{
  storyBeginning: string, // Primeras 200-300 palabras
  keywords: string[], // Keywords esperados en predicción correcta
  actualContinuation: string, // Continuación real (oculta)
  context: {
    setting: string,
    characters: string[],
    conflict: string
  }
}
```

**Ejemplo de Historia:**
**Inicio:** "Marie Curie entró al laboratorio a las 6 AM, como siempre. Pero ese día algo era diferente. La muestra de pechblenda que había estado procesando toda la semana brillaba con un resplandor tenue en la oscuridad..."

**Keywords esperados:** descubrimiento, sorpresa, radioactividad, nuevo elemento, emoción, investigación

**Continuación Real:** Marie confirmó que había aislado un nuevo elemento más radiactivo que el uranio. Lo llamó Polonio en honor a su país natal.

**Scoring:**
- Keyword matching: 50 puntos × (keywords presentes / total keywords)
- Coherencia narrativa (AI): 30 puntos
- Creatividad: 20 puntos
- Length Bonus: +10 puntos si predicción >100 palabras

**Auto-gradable:** ⚠️ Semi (scoring automático por keywords, evaluación AI de coherencia)

---

### 2.4 Puzzle de Contexto

**Tipo:** `puzzle_contexto`
**Descripción:** Ensamblado de piezas de contexto con drag-and-drop.

**Características Técnicas:**
- Drag-and-drop de piezas de contexto (Framer Motion Reorder)
- Piezas codificadas por categoría (histórico, científico, personal, social)
- Desafío de orden cronológico
- Validación AI de ensamblado
- Tracking de posición en tiempo real

**Estructura de Contenido:**
```typescript
{
  pieces: Array<{
    id: string,
    text: string, // Fragmento de contexto (50-100 palabras)
    category: 'historical' | 'scientific' | 'personal' | 'social',
    correctPosition: number, // Posición 0-indexed
    year?: number // Para contexto cronológico
  }>,
  assemblyType: 'chronological' | 'logical' | 'causal'
}
```

**Ejemplo de Piezas (6):**
1. **Personal (1867):** "Nació en Varsovia, Polonia, en una familia de maestros."
2. **Histórico (1891):** "Polonia estaba bajo ocupación rusa. Las mujeres no podían estudiar en universidades."
3. **Personal (1891):** "Viajó a París para estudiar en la Sorbona con apoyo de su hermana."
4. **Científico (1895):** "Conoció a Pierre Curie en el laboratorio. Compartían pasión por la física."
5. **Científico (1898):** "Juntos aislaron dos nuevos elementos de la pechblenda."
6. **Social (1903):** "Primera mujer en ganar el Nobel, pero enfrentó discriminación de género."

**Scoring:**
- Base: 100 puntos × (piezas en posición correcta / total piezas)
- Sequence Bonus: +20 puntos si orden 100% correcto
- Category Recognition: +5 puntos por categorizar correctamente cada pieza

**Auto-gradable:** ✅ Sí (validación de secuencia cronológica)

---

### 2.5 Rueda de Inferencias

**Tipo:** `rueda_inferencias`
**Descripción:** Visualizador de rueda de inferencias con mapeo de conexiones.

**Características Técnicas:**
- Hub de texto central con inferencias radiando
- Visualización de confianza de nodos
- Linkeo de evidencias
- Sugerencias AI de inferencias
- Mapeo interactivo de conexiones
- Indicadores de nivel de confianza

**Estructura de Contenido:**
```typescript
{
  centralText: string, // Texto principal (100-200 palabras)
  inferences: Array<{
    id: string,
    text: string, // Inferencia (20-30 palabras)
    confidence: number, // 0-100%
    evidence: string[], // Referencias al texto central
    type: 'causal' | 'temporal' | 'comparative' | 'hypothetical'
  }>,
  connections: Array<{
    from: string, // inference id
    to: string,   // inference id
    relationship: string
  }>
}
```

**Ejemplo:**
**Texto Central:** "Marie Curie trabajó con materiales radiactivos sin protección durante décadas. Desarrolló anemia aplásica y murió en 1934."

**Inferencias:**
1. "La exposición prolongada a radiación causó su enfermedad" (Confianza: 95%)
2. "No conocían los peligros de la radiación en 1900" (Confianza: 90%)
3. "Su trabajo acortó su vida pero salvó millones después" (Confianza: 85%)

**Conexiones:**
- Inferencia 1 → Inferencia 2 (relación: "explica por qué")
- Inferencia 1 → Inferencia 3 (relación: "contrasta con")

**Scoring:**
- Inferencias correctas: 60 puntos × (inferencias válidas / total esperadas)
- Confidence accuracy: 20 puntos × (precisión de niveles de confianza)
- Connection mapping: 20 puntos × (conexiones correctas / total esperadas)

**Auto-gradable:** ⚠️ Semi (validación de inferencias predefinidas + AI scoring de extras)

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

---

## MÉTRICAS EDUCATIVAS

### Métricas Tracked por Mecánica

- Intentos por ejercicio
- Score promedio
- Tiempo promedio de completitud
- Hints usados promedio
- Power-ups usados
- Tasa de completitud
- Calidad de inferencias (para mecánicas con AI scoring)

### Métricas del Módulo

- % de ejercicios completados
- Score promedio del módulo
- Tiempo total en módulo
- Strengths (tipos de ejercicio con score >85%)
- Weaknesses (tipos de ejercicio con score <70%)
- Progresión en capacidad inferencial

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

---

## 🔗 Referencias a Implementación

### Documento Principal
📄 **[MODULOS-EDUCATIVOS.md](./MODULOS-EDUCATIVOS.md#-referencias-a-implementación)** - Referencias completas de las 31 mecánicas

### Específico para Módulo 2 - Comprensión Inferencial

**Database:**
- `educational_content.exercises` WHERE `type` IN ('resumen_interactivo', 'mapa_conceptual', 'preguntas_inferenciales', 'completar_texto', 'debate_digital')
- `educational_content.modules` WHERE `name` = 'Comprensión Inferencial'

**Backend:**
- `apps/backend/src/modules/educational/services/grading/resumen-interactivo.grader.ts`
- `apps/backend/src/modules/educational/services/grading/mapa-conceptual.grader.ts`
- `apps/backend/src/modules/educational/services/grading/preguntas-inferenciales.grader.ts`
- `apps/backend/src/modules/educational/services/grading/completar-texto.grader.ts`
- `apps/backend/src/modules/educational/services/grading/debate-digital.grader.ts`

**Frontend:**
- `apps/frontend/src/features/educational/components/exercises/ResumenInteractivoExercise.tsx` - Selección de frases clave
- `apps/frontend/src/features/educational/components/exercises/MapaConceptualExercise.tsx` - React Flow para nodos
- `apps/frontend/src/features/educational/components/exercises/PreguntasInferencialesExercise.tsx` - Preguntas de inferencia
- `apps/frontend/src/features/educational/components/exercises/CompletarTextoExercise.tsx` - Fill-in-the-blank
- `apps/frontend/src/features/educational/components/exercises/DebateDigitalExercise.tsx` - Foro de debate

**Seed Data:**
- `apps/database/seed/exercises/modulo-2-ejercicios.json` - 5 ejercicios sobre Marie Curie

---

**Documento preparado por:** Equipo de Análisis Técnico
**Última actualización:** 2025-11-01
**Versión:** 2.0 (Modularizado)
