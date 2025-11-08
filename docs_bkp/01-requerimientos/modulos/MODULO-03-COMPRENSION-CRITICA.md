# Módulo 3: Comprensión Crítica

**Proyecto:** Gamilit Platform
**Módulo:** Contenido Educativo
**Archivo original:** MODULOS-EDUCATIVOS.md
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## RESUMEN DEL MÓDULO

**Objetivo Pedagógico:** Desarrollar **pensamiento crítico**, evaluación de argumentos, análisis de perspectivas, identificación de sesgos.

**Mecánicas Implementadas:** 5
**Estado:** ✅ Production-Ready (100% completitud)

### Mecánicas del Módulo

| # | Tipo | Descripción | Auto-gradable |
|---|------|-------------|---------------|
| 3.1 | `tribunal_opiniones` | Evaluación de múltiples perspectivas con detección de sesgos | ⚠️ Híbrido |
| 3.2 | `debate_digital` | Chat en tiempo real con oponente AI | ⚠️ Híbrido |
| 3.3 | `analisis_fuentes` | Analizador de credibilidad de fuentes | ⚠️ Semi |
| 3.4 | `podcast_argumentativo` | Grabación de argumento oral con análisis AI | ❌ Manual |
| 3.5 | `matriz_perspectivas` | Constructor de matriz de perspectivas | ⚠️ Semi |

---

## MECÁNICAS IMPLEMENTADAS

### 3.1 Tribunal de Opiniones

**Tipo:** `tribunal_opiniones`
**Dificultad:** ⭐⭐⭐⭐

#### Descripción

El Tribunal de Opiniones es una mecánica avanzada de pensamiento crítico que simula un proceso deliberativo donde estudiantes deben evaluar múltiples perspectivas sobre temas controversiales relacionados con Marie Curie. La interfaz presenta 3 opiniones de expertos ficticios (científico moderno, historiador y bioético) con posturas diferentes: a favor, en contra o neutral respecto a una pregunta ética o científica.

Los estudiantes leen cada opinión completa, que incluye argumentos principales, contra-argumentos, evidencia citada con niveles de credibilidad, y posibles sesgos identificados. La interfaz usa códigos visuales distintivos: iconos de ThumbsUp (verde) para posturas a favor, ThumbsDown (rojo) para contra, y Minus (gris) para neutrales.

#### Características Técnicas

- Sistema de presentación de opiniones múltiples con 3 expertos ficticios
- Indicadores visuales de postura mediante iconos lucide-react
- Tarjetas interactivas con hover effects y click selection
- Desglose estructurado de argumentos en listas
- Sistema de evidencias con niveles de credibilidad
- Detección de sesgos identificados por tipo
- Confirmación de voto en dos pasos
- Feedback modal con análisis de la selección
- Auto-guardado cada 30 segundos
- Timer interno para calcular bonus de tiempo

#### Estructura de Contenido

```typescript
interface TribunalExercise {
  id: string;
  topic: string;
  question: string;
  opinions: Opinion[];
  correctAnalysis?: {
    mostBalanced: string;
    strongestArgument: string;
    identifiedBiases: string[];
  };
}

interface Opinion {
  id: string;
  expert: {
    name: string;
    title: string;
    credentials: string;
  };
  stance: 'a_favor' | 'en_contra' | 'neutral';
  arguments: string[];
  counterarguments?: string[];
  evidence: Array<{
    source: string;
    credibility: number;
  }>;
  biases: string[];
}
```

#### Ejemplo de Contenido

**Tema:** Ética científica y riesgos personales en investigación

**Pregunta:** "¿Debería Marie Curie haber patentado sus descubrimientos del Radio y Polonio para asegurar su bienestar financiero?"

**Opinión 1: Dr. Jean Laurent (A Favor)**
- Título: Economista de Ciencia, Universidad de París
- Argumentos:
  1. Los científicos merecen compensación justa por décadas de trabajo
  2. Las patentes no impiden el progreso, solo regulan el uso comercial
  3. Marie y Pierre vivieron en pobreza innecesaria
- Sesgos detectables: Sesgo económico moderno, ignorar valores culturales de 1900

**Opinión 2: Dra. Sophie Mercier (En Contra)**
- Título: Historiadora de Ciencia, Instituto Curie
- Argumentos:
  1. La decisión refleja el ethos científico de apertura de la época
  2. Patentar hubiera retrasado aplicaciones médicas
  3. El legado es más valioso que cualquier fortuna material
- Sesgos detectables: Romanticización del sacrificio

**Opinión 3: Dr. Carlos Medina (Neutral)**
- Título: Bioético y Filósofo de Ciencia
- Argumentos:
  1. Debemos analizar desde el contexto de 1900, no desde 2025
  2. Marie tuvo autonomía para decidir
  3. Existen múltiples modelos: patente con licencia abierta
- Sesgos detectables: Ninguno mayor, análisis más equilibrado

#### Sistema de Scoring

```typescript
baseScore = 50; // Por participar
analysisBonus = 30; // Por tiempo dedicado
selectionBonus = 0 a 20; // Según balance de opinión
```

**Bonificaciones:**
- Análisis profundo: +20 puntos si identifica 5+ sesgos
- Selección balanceada: +10 puntos si elige opinión neutral
- Tiempo reflexivo: +10 puntos si dedica >3 minutos

**Multiplicadores:** Rango Maya (1.0x - 2.0x), Dificultad (1.3x)

**Auto-gradable:** ⚠️ Híbrido (50% Automático, 50% Revisión)

**Tiempo Estimado:** 12-15 minutos

---

### 3.2 Debate Digital

**Tipo:** `debate_digital`
**Dificultad:** ⭐⭐⭐⭐

#### Descripción

Chat en tiempo real con oponente AI sobre temas controversiales. Los estudiantes construyen y defienden argumentos en formato conversacional.

#### Características Técnicas

- Interfaz de chat en tiempo real
- Oponente AI con respuestas contextuales
- Indicadores de escritura ("IA está escribiendo...")
- Scoring de fuerza de argumentos
- Identificación de dispositivos retóricos
- Historial de mensajes

#### Estructura de Contenido

```typescript
{
  topic: string,
  aiPersona: {
    name: string,
    stance: string,
    argumentationStyle: 'logical' | 'emotional' | 'balanced'
  },
  evaluationCriteria: {
    argumentStrength: number,
    rhetoricalDevices: string[],
    logicalFallacies: string[]
  }
}
```

#### Ejemplo de Debate

**Tema:** "¿Debería Marie Curie haber patentado sus descubrimientos?"

**Flujo:**
1. Usuario: "Sí, hubiera asegurado su futuro financiero"
2. AI: "Pero hubiera limitado el acceso a tratamientos médicos"
3. Usuario: "Podría haber usado las regalías para investigación"

**Scoring:**
- Argument strength promedio: 50 puntos
- Rhetorical devices: 20 puntos
- Logical consistency: 20 puntos
- Counter-arguments: 10 puntos

**Auto-gradable:** ⚠️ Semi (AI scoring de argumentos)

**Tiempo Estimado:** 8-12 minutos

---

### 3.3 Análisis de Fuentes

**Tipo:** `analisis_fuentes`
**Dificultad:** ⭐⭐⭐

#### Descripción

Analizador de credibilidad de fuentes con detección de sesgos.

#### Características Técnicas

- Scoring de credibilidad (0-100%)
- Detección de nivel de sesgo
- Rating de reporte factual
- Flags de advertencia
- Fact-checking de claims
- Comparación de múltiples fuentes

#### Estructura de Contenido

```typescript
{
  sources: Array<{
    id: string,
    title: string,
    author: string,
    credibilityScore: number,
    biasLevel: 'left' | 'center' | 'right' | 'mixed',
    factualReporting: 'high' | 'medium' | 'low',
    redFlags: string[],
    strengths: string[]
  }>,
  claims: Array<{
    text: string,
    veracity: boolean,
    confidence: number,
    supportingSources: string[]
  }>
}
```

#### Ejemplo de Fuentes

1. **Nobel Prize Official Website**
   - Credibilidad: 99%
   - Sesgo: Center
   - Fortalezas: Fuente primaria, revisión editorial rigurosa

2. **Wikipedia - Marie Curie**
   - Credibilidad: 78%
   - Sesgo: Center
   - Red Flags: Fuente terciaria, errores ocasionales

3. **Science Blog Personal**
   - Credibilidad: 42%
   - Red Flags: Sin revisión de pares, autor sin credenciales

**Scoring:**
- Identificación de fuente más creíble: 40 puntos
- Detección de red flags: 30 puntos
- Fact-checking correcto: 30 puntos

**Auto-gradable:** ⚠️ Semi

**Tiempo Estimado:** 10-12 minutos

---

### 3.4 Podcast Argumentativo

**Tipo:** `podcast_argumentativo`
**Dificultad:** ⭐⭐⭐⭐⭐

#### Descripción

Grabación de audio de 2-3 minutos argumentando sobre Marie Curie con análisis de 4 dimensiones.

#### Características Técnicas

- Grabación con Web Audio API
- Timer en tiempo real
- Transcripción automática
- Análisis de: Claridad, Lógica, Evidencia, Persuasión
- Feedback y sugerencias

#### Estructura de Contenido

```typescript
{
  topic: string,
  prompt: string,
  timeLimit: number,
  evaluationCriteria: {
    clarity: number,
    logic: number,
    evidence: number,
    persuasion: number
  },
  requiredElements: string[]
}
```

#### Ejemplo

**Tema:** "El Legado de Marie Curie"
**Prompt:** "Graba un podcast de 2-3 minutos argumentando sobre el impacto de Marie Curie. Incluye: introducción, tesis, 2+ evidencias, conclusión."

**Análisis AI:**
- Clarity: 85/100
- Logic: 70/100
- Evidence: 60/100
- Persuasion: 75/100

**Auto-gradable:** ❌ No (requiere revisión humana/AI)

**Tiempo Estimado:** 15-20 minutos

---

### 3.5 Matriz de Perspectivas

**Tipo:** `matriz_perspectivas`
**Dificultad:** ⭐⭐⭐⭐

#### Descripción

Constructor de matriz de perspectivas con generación AI.

#### Características Técnicas

- Generación AI de múltiples perspectivas
- Argumentos para cada perspectiva
- Identificación de contra-argumentos
- Awareness de sesgos
- Análisis de factores contextuales

#### Estructura de Contenido

```typescript
{
  topic: string,
  perspectives: Array<{
    id: string,
    viewpoint: string,
    arguments: string[],
    counterarguments: string[],
    biases: string[],
    contextualFactors: string[]
  }>
}
```

#### Ejemplo

**Tema:** "El trabajo de Marie Curie y los riesgos de la radiación"

**Perspectiva 1: Contexto Histórico**
- Viewpoint: "Expectativas limitadas para mujeres en ciencia"
- Argumentos: Restricciones universitarias, acceso a laboratorios
- Sesgos: Prejuicio de género

**Perspectiva 2: Ética Científica Moderna**
- Viewpoint: "La seguridad debe ser prioridad"
- Argumentos: Valor de vida, protocolos modernos
- Sesgos: Presentismo

**Perspectiva 3: Igualdad de Género**
- Viewpoint: "Marie Curie como símbolo de lucha"
- Argumentos: Demostró capacidad, abrió caminos
- Sesgos: Romanticización

**Scoring:**
- Identificación de 3+ perspectivas: 40 puntos
- Calidad de argumentos: 30 puntos
- Detección de sesgos: 20 puntos
- Análisis contextual: 10 puntos

**Auto-gradable:** ⚠️ Semi

**Tiempo Estimado:** 15-20 minutos

---

## INTEGRACIÓN CON GAMIFICACIÓN

### ML Coins y XP por Mecánica

| Mecánica | ML Coins | XP Base |
|----------|----------|---------|
| Tribunal de Opiniones | 40 | 80 |
| Debate Digital | 35 | 70 |
| Análisis de Fuentes | 30 | 60 |
| Podcast Argumentativo | 50 | 100 |
| Matriz de Perspectivas | 40 | 80 |

### Achievements Desbloqueables

- **Detective de Sesgos:** Identificar todos los sesgos en primer intento
- **Debatidor Incansable:** Enviar 10+ mensajes en debate
- **Analista Crítico:** Obtener 90+ puntos en Tribunal
- **Podcaster Profesional:** 95+ puntos en Podcast
- **Perspectivas Maestro:** Completar 5 matrices con score >85

---

## RESPONSIVE DESIGN Y ACCESIBILIDAD

### Estándares WCAG 2.1 AA

- ✅ Contraste de color >4.5:1
- ✅ ARIA labels en elementos interactivos
- ✅ Navegación por teclado
- ✅ Focus indicators visibles
- ✅ Screen reader support

### Consideraciones Especiales

- **Podcast Argumentativo:** Alternativa para estudiantes sin micrófono
- **Debate Digital:** Timeout de sesión 30 minutos
- **Tribunal:** Confirmación de voto en dos pasos

---

## 🔗 Referencias a Implementación

### Documento Principal
📄 **[MODULOS-EDUCATIVOS.md](./MODULOS-EDUCATIVOS.md#-referencias-a-implementación)** - Referencias completas de las 31 mecánicas

### Específico para Módulo 3 - Comprensión Crítica

**Database:**
- `educational_content.exercises` WHERE `type` IN ('analisis_argumento', 'ensayo_corto', 'evaluacion_fuentes', 'comparar_versiones', 'analisis_critico')
- `educational_content.modules` WHERE `name` = 'Comprensión Crítica'

**Backend:**
- `apps/backend/src/modules/educational/services/grading/analisis-argumento.grader.ts`
- `apps/backend/src/modules/educational/services/grading/ensayo-corto.grader.ts` - Manual grading required
- `apps/backend/src/modules/educational/services/grading/evaluacion-fuentes.grader.ts`
- `apps/backend/src/modules/educational/services/grading/comparar-versiones.grader.ts`
- `apps/backend/src/modules/educational/services/grading/analisis-critico.grader.ts`

**Frontend:**
- `apps/frontend/src/features/educational/components/exercises/AnalisisArgumentoExercise.tsx` - Identificar argumentos
- `apps/frontend/src/features/educational/components/exercises/EnsayoCortoExercise.tsx` - TipTap rich text editor
- `apps/frontend/src/features/educational/components/exercises/EvaluacionFuentesExercise.tsx` - Evaluar credibilidad
- `apps/frontend/src/features/educational/components/exercises/CompararVersionesExercise.tsx` - Comparar textos
- `apps/frontend/src/features/educational/components/exercises/AnalisisCriticoExercise.tsx` - Pensamiento crítico

**Seed Data:**
- `apps/database/seed/exercises/modulo-3-ejercicios.json` - 5 ejercicios sobre Marie Curie

---

**Documento preparado por:** Equipo de Análisis Técnico
**Última actualización:** 2025-11-01
**Versión:** 2.0 (Modularizado)
