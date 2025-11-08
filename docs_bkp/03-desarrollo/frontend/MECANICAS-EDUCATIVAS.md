# Mecánicas Educativas - Frontend GAMILIT Platform v2

**Proyecto:** GAMILIT Platform v2
**Fecha:** 2025-10-27
**Total de Mecánicas:** 33 (organizadas en 5 módulos)

---

## 1. Resumen Ejecutivo

GAMILIT Platform implementa **33 mecánicas educativas interactivas** organizadas en **5 módulos pedagógicos** basados en la taxonomía de comprensión lectora. Cada mecánica es un componente React independiente, reutilizable y totalmente tipado.

### Distribución de Mecánicas:

| Módulo | Enfoque Pedagógico | Mecánicas | Archivos |
|--------|-------------------|-----------|----------|
| **Módulo 1** | Comprensión Literal | 7 | 19 |
| **Módulo 2** | Comprensión Inferencial | 5 | 11 |
| **Módulo 3** | Comprensión Crítica | 5 | 5 |
| **Módulo 4** | Textos Digitales y Multimediales | 9 | 19 |
| **Módulo 5** | Producción Creativa | 3 | 3 |
| **Auxiliar** | Mecánicas de Soporte | 4+ | - |
| **TOTAL** | | **33+** | **57+** |

---

## 2. Arquitectura de Mecánicas

### 2.1 Componente Base

Todas las mecánicas heredan de `BaseExercise`:

```typescript
// features/mechanics/shared/BaseExercise.tsx
interface BaseExerciseProps {
  exerciseId: string;
  config: ExerciseConfig;
  onComplete: (result: ScoreResult) => void;
  allowHints?: boolean;
  allowPowerUps?: boolean;
  timeLimit?: number;
}

export const BaseExercise: React.FC<BaseExerciseProps> = ({
  exerciseId,
  config,
  onComplete,
  allowHints = true,
  allowPowerUps = true,
  timeLimit,
}) => {
  const [startTime] = useState(Date.now());
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [hintsUsed, setHintsUsed] = useState(0);
  const { submit, isSubmitting } = useExerciseSubmission(exerciseId);

  const handleSubmit = async () => {
    const timeSpent = (Date.now() - startTime) / 1000; // segundos
    const result = await submit({
      exerciseId,
      answers,
      timeSpent,
      hintsUsed,
    });
    onComplete(result);
  };

  return (
    <div className="exercise-container">
      <ExerciseHeader
        title={config.title}
        difficulty={config.difficulty}
        timeLimit={timeLimit}
      />

      <div className="exercise-content">
        {/* Contenido específico de la mecánica */}
      </div>

      <ExerciseFooter
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        allowHints={allowHints}
        onHintRequest={() => setHintsUsed(prev => prev + 1)}
      />
    </div>
  );
};
```

### 2.2 Types Compartidos

```typescript
// features/mechanics/shared/types.ts
export type ExerciseType =
  // Módulo 1 - Comprensión Literal
  | 'crucigrama_cientifico'
  | 'crucigrama'
  | 'linea_tiempo'
  | 'timeline'
  | 'sopa_letras'
  | 'mapa_conceptual'
  | 'emparejamiento'
  | 'verdadero_falso'
  | 'completar_espacios'
  // Módulo 2 - Comprensión Inferencial
  | 'detective_textual'
  | 'construccion_hipotesis'
  | 'prediccion_narrativa'
  | 'puzzle_contexto'
  | 'rueda_inferencias'
  // Módulo 3 - Comprensión Crítica
  | 'analisis_fuentes'
  | 'debate_digital'
  | 'matriz_perspectivas'
  | 'podcast_argumentativo'
  | 'tribunal_opiniones'
  // Módulo 4 - Textos Digitales
  | 'verificador_fakenews'
  | 'fake_news'
  | 'quiz_tiktok'
  | 'navegacion_hipertextual'
  | 'analisis_memes'
  | 'infografia_interactiva'
  | 'email_formal'
  | 'chat_literario'
  | 'ensayo_argumentativo'
  | 'resena_critica'
  // Módulo 5 - Producción Creativa
  | 'diario_multimedia'
  | 'comic_digital'
  | 'video_carta'
  // Auxiliar
  | 'call_to_action'
  | 'collage_prensa'
  | 'comprension_auditiva'
  | 'texto_movimiento';

export interface ExerciseConfig {
  title: string;
  instructions: string;
  difficulty: 'facil' | 'medio' | 'dificil' | 'experto';
  estimatedTime: number; // minutos
  maxAttempts?: number;
  comodines_allowed?: ('pistas' | 'vision_lectora' | 'segunda_oportunidad')[];
}

export interface ScoreResult {
  baseScore: number;
  timeBonus: number;
  accuracyBonus: number;
  totalScore: number;
  mlCoins: number;
  xpGained: number;
  correctAnswers: number;
  totalQuestions: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface ExerciseAttempt {
  exerciseId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  answers: Record<string, unknown>;
  correctAnswers: number;
  totalQuestions: number;
  hintsUsed: number;
  score: number;
  difficulty: 'facil' | 'medio' | 'dificil' | 'experto';
}
```

### 2.3 Hooks Compartidos

```typescript
// features/mechanics/shared/hooks/useExerciseSubmission.ts
export const useExerciseSubmission = (exerciseId: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addCoins } = useEconomyStore();
  const { addXP } = useRanksStore();

  const submit = async (data: ExerciseSubmissionData): Promise<ScoreResult> => {
    setIsSubmitting(true);

    try {
      const response = await mechanicsAPI.submit({
        mechanicId: exerciseId,
        answers: data.answers,
        timeSpent: data.timeSpent,
        hintsUsed: data.hintsUsed,
      });

      // Actualizar stores locales
      addCoins(response.mlCoinsEarned, 'exercise_completion');
      addXP(response.xpEarned, 'exercise_completion');

      return {
        baseScore: response.score,
        timeBonus: response.bonuses?.timeBonus || 0,
        accuracyBonus: response.bonuses?.accuracyBonus || 0,
        totalScore: response.score,
        mlCoins: response.mlCoinsEarned,
        xpGained: response.xpEarned,
        correctAnswers: response.correctAnswers,
        totalQuestions: response.totalQuestions,
        grade: calculateGrade(response.score),
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submit, isSubmitting };
};
```

---

## 3. Módulo 1: Comprensión Literal

**Objetivo Pedagógico:** Identificar información explícita en textos

**Mecánicas (7):**

### 3.1 Crucigrama Científico

**Tipo:** `crucigrama_cientifico` | `crucigrama`
**Descripción:** Crucigrama interactivo con terminología científica

**Componente:**
```typescript
// features/mechanics/module1/Crucigrama/CrucigramaExercise.tsx
interface CrucigramaProps extends BaseExerciseProps {
  grid: string[][];
  clues: {
    across: { number: number; clue: string; answer: string }[];
    down: { number: number; clue: string; answer: string }[];
  };
}

export const CrucigramaExercise: React.FC<CrucigramaProps> = ({
  grid,
  clues,
  ...baseProps
}) => {
  const [userGrid, setUserGrid] = useState<string[][]>(
    grid.map(row => row.map(() => ''))
  );
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [direction, setDirection] = useState<'across' | 'down'>('across');

  const handleCellClick = (row: number, col: number) => {
    setSelectedCell([row, col]);
  };

  const handleKeyPress = (key: string) => {
    if (!selectedCell) return;

    const [row, col] = selectedCell;
    const newGrid = [...userGrid];
    newGrid[row][col] = key.toUpperCase();
    setUserGrid(newGrid);

    // Auto-advance to next cell
    moveToNextCell(row, col, direction);
  };

  return (
    <BaseExercise {...baseProps} onComplete={(result) => {
      // Calcular aciertos
      const correct = countCorrectAnswers(userGrid, grid);
      baseProps.onComplete({
        ...result,
        correctAnswers: correct,
        totalQuestions: clues.across.length + clues.down.length,
      });
    }}>
      <div className="crucigrama-container">
        <div className="crucigrama-grid">
          {userGrid.map((row, rowIdx) => (
            <div key={rowIdx} className="crucigrama-row">
              {row.map((cell, colIdx) => (
                <CrucigramaCell
                  key={`${rowIdx}-${colIdx}`}
                  value={cell}
                  onClick={() => handleCellClick(rowIdx, colIdx)}
                  isSelected={
                    selectedCell?.[0] === rowIdx && selectedCell?.[1] === colIdx
                  }
                />
              ))}
            </div>
          ))}
        </div>

        <div className="crucigrama-clues">
          <CluesList
            title="Horizontales"
            clues={clues.across}
            direction="across"
          />
          <CluesList
            title="Verticales"
            clues={clues.down}
            direction="down"
          />
        </div>
      </div>
    </BaseExercise>
  );
};
```

**Configuración desde DB:**
```json
{
  "type": "crucigrama",
  "content": {
    "grid": [
      ["C", "I", "E", "N", "C", "I", "A"],
      ["O", "", "", "", "", "", ""],
      ...
    ],
    "clues": {
      "across": [
        { "number": 1, "clue": "Estudio de la naturaleza", "answer": "CIENCIA" }
      ],
      "down": [
        { "number": 1, "clue": "Método de investigación", "answer": "CIENTÍFICO" }
      ]
    }
  }
}
```

### 3.2 Línea de Tiempo

**Tipo:** `timeline` | `linea_tiempo`
**Descripción:** Organizar eventos en orden cronológico

**Componente:**
```typescript
// features/mechanics/module1/Timeline/TimelineExercise.tsx
interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date?: string;
  image?: string;
}

interface TimelineProps extends BaseExerciseProps {
  events: TimelineEvent[];
  correctOrder: string[]; // IDs en orden correcto
}

export const TimelineExercise: React.FC<TimelineProps> = ({
  events,
  correctOrder,
  ...baseProps
}) => {
  const [orderedEvents, setOrderedEvents] = useState<TimelineEvent[]>(
    shuffleArray([...events])
  );

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(orderedEvents);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setOrderedEvents(items);
  };

  const checkOrder = () => {
    const userOrder = orderedEvents.map(e => e.id);
    const correct = userOrder.filter((id, idx) => id === correctOrder[idx]).length;
    return {
      correctAnswers: correct,
      totalQuestions: correctOrder.length,
    };
  };

  return (
    <BaseExercise {...baseProps}>
      <div className="timeline-container">
        <div className="timeline-instructions">
          Arrastra los eventos para ordenarlos cronológicamente
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="timeline">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="timeline-events"
              >
                {orderedEvents.map((event, index) => (
                  <Draggable
                    key={event.id}
                    draggableId={event.id}
                    index={index}
                  >
                    {(provided) => (
                      <TimelineEventCard
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        event={event}
                        index={index + 1}
                      />
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </BaseExercise>
  );
};
```

### 3.3 Sopa de Letras

**Tipo:** `sopa_letras`
**Descripción:** Encontrar palabras ocultas en una matriz

**Características:**
- Grid interactivo con selección de celdas
- Lista de palabras a encontrar
- Detección automática de palabras encontradas
- Timer y contador de palabras

### 3.4 Mapa Conceptual

**Tipo:** `mapa_conceptual`
**Descripción:** Conectar conceptos relacionados

**Características:**
- Nodos arrastrables
- Conexiones entre nodos
- Validación de relaciones
- Editor visual

### 3.5 Emparejamiento

**Tipo:** `emparejamiento`
**Descripción:** Unir elementos relacionados de dos columnas

**Características:**
- Drag & Drop
- Validación de pares
- Feedback inmediato
- Penalización por errores

### 3.6 Verdadero/Falso

**Tipo:** `verdadero_falso`
**Descripción:** Evaluar veracidad de afirmaciones

**Características:**
- Afirmaciones con opción V/F
- Justificación opcional
- Feedback detallado
- Explicaciones

### 3.7 Completar Espacios

**Tipo:** `completar_espacios`
**Descripción:** Completar texto con palabras faltantes

**Características:**
- Input inline
- Banco de palabras opcional
- Validación automática
- Hints disponibles

---

## 4. Módulo 2: Comprensión Inferencial

**Objetivo Pedagógico:** Deducir información implícita en textos

**Mecánicas (5):**

### 4.1 Detective Textual

**Tipo:** `detective_textual`
**Descripción:** Encontrar pistas y evidencias en un texto para resolver un caso

**Componente destacado:**
```typescript
// features/mechanics/module2/DetectiveTextual/EvidenceBoard.tsx
interface Evidence {
  id: string;
  text: string;
  location: string;
  type: 'physical' | 'testimony' | 'document';
  isRelevant: boolean;
}

export const EvidenceBoard: React.FC<EvidenceBoardProps> = ({
  evidences,
  onSubmitConclusion,
}) => {
  const [selectedEvidence, setSelectedEvidence] = useState<string[]>([]);
  const [conclusion, setConclusion] = useState('');

  return (
    <div className="evidence-board">
      <div className="evidence-grid">
        {evidences.map((evidence) => (
          <EvidenceCard
            key={evidence.id}
            evidence={evidence}
            isSelected={selectedEvidence.includes(evidence.id)}
            onSelect={() => toggleEvidence(evidence.id)}
          />
        ))}
      </div>

      <div className="conclusion-panel">
        <h3>Tu Conclusión</h3>
        <textarea
          value={conclusion}
          onChange={(e) => setConclusion(e.target.value)}
          placeholder="Escribe tu conclusión basada en las evidencias..."
        />
        <button onClick={() => onSubmitConclusion(selectedEvidence, conclusion)}>
          Resolver Caso
        </button>
      </div>
    </div>
  );
};
```

**Características:**
- Tablero de evidencias
- Selección múltiple
- Conclusión por escrito
- Evaluación por criterios

### 4.2 Construcción de Hipótesis

**Tipo:** `construccion_hipotesis`
**Descripción:** Formular hipótesis basadas en información parcial

**Características:**
- Presentación progresiva de información
- Formulación de hipótesis
- Validación de lógica
- Retroalimentación constructiva

### 4.3 Predicción Narrativa

**Tipo:** `prediccion_narrativa`
**Descripción:** Predecir continuación de una historia

**Características:**
- Historia incompleta
- Opciones de continuación
- Justificación de elección
- Análisis de consistencia

### 4.4 Puzzle de Contexto

**Tipo:** `puzzle_contexto`
**Descripción:** Reconstruir contexto a partir de fragmentos

**Características:**
- Fragmentos desordenados
- Drag & Drop para ordenar
- Análisis de coherencia
- Pistas graduales

### 4.5 Rueda de Inferencias

**Tipo:** `rueda_inferencias`
**Descripción:** Hacer inferencias a partir de observaciones

**Características:**
- Observaciones visuales
- Cadena de inferencias
- Conexiones lógicas
- Validación de razonamiento

---

## 5. Módulo 3: Comprensión Crítica

**Objetivo Pedagógico:** Analizar, evaluar y juzgar textos

**Mecánicas (5):**

### 5.1 Análisis de Fuentes

**Tipo:** `analisis_fuentes`
**Descripción:** Evaluar credibilidad y sesgo de fuentes

**Características:**
- Múltiples fuentes
- Criterios de evaluación
- Detección de sesgos
- Comparación crítica

### 5.2 Debate Digital

**Tipo:** `debate_digital`
**Descripción:** Argumentar posiciones sobre un tema

**Características:**
- Formato de debate
- Argumentos y contraargumentos
- Sistema de turnos
- Evaluación de calidad argumentativa

### 5.3 Matriz de Perspectivas

**Tipo:** `matriz_perspectivas`
**Descripción:** Analizar múltiples puntos de vista

**Características:**
- Grid de perspectivas
- Análisis comparativo
- Identificación de sesgos
- Síntesis crítica

### 5.4 Podcast Argumentativo

**Tipo:** `podcast_argumentativo`
**Descripción:** Crear argumentos en formato audio

**Características:**
- Grabación de audio
- Estructura argumentativa
- Evidencias y ejemplos
- Revisión por pares

### 5.5 Tribunal de Opiniones

**Tipo:** `tribunal_opiniones`
**Descripción:** Evaluar argumentos como un juez

**Características:**
- Casos presentados
- Argumentos pro/contra
- Veredicto fundamentado
- Justificación detallada

---

## 6. Módulo 4: Textos Digitales y Multimediales

**Objetivo Pedagógico:** Interpretar textos digitales, visuales y multimodales

**Mecánicas (9):**

### 6.1 Verificador de Fake News

**Tipo:** `verificador_fakenews` | `fake_news`
**Descripción:** Identificar noticias falsas y verificar información

**Componente destacado:**
```typescript
// features/mechanics/module4/VerificadorFakeNews/VerificadorFakeNewsExercise.tsx
interface NewsArticle {
  id: string;
  headline: string;
  content: string;
  source: string;
  date: string;
  image?: string;
  isFake: boolean;
  redFlags?: string[];
}

export const VerificadorFakeNewsExercise: React.FC<VerificadorProps> = ({
  articles,
  ...baseProps
}) => {
  const [currentArticle, setCurrentArticle] = useState(0);
  const [verdicts, setVerdicts] = useState<Record<string, boolean>>({});
  const [justifications, setJustifications] = useState<Record<string, string>>({});

  const handleVerdict = (articleId: string, isFake: boolean, justification: string) => {
    setVerdicts(prev => ({ ...prev, [articleId]: isFake }));
    setJustifications(prev => ({ ...prev, [articleId]: justification }));
  };

  return (
    <BaseExercise {...baseProps}>
      <div className="fake-news-detector">
        <ArticleViewer article={articles[currentArticle]} />

        <FactCheckDashboard
          article={articles[currentArticle]}
          onCheckComplete={(checks) => {
            // Procesar verificaciones
          }}
        />

        <VerdictPanel
          onSubmit={(isFake, justification) => {
            handleVerdict(articles[currentArticle].id, isFake, justification);
            if (currentArticle < articles.length - 1) {
              setCurrentArticle(prev => prev + 1);
            }
          }}
        />
      </div>
    </BaseExercise>
  );
};
```

**Características:**
- Análisis de fuente
- Verificación de hechos
- Detección de señales de alerta
- Cross-referencing

### 6.2 Quiz TikTok

**Tipo:** `quiz_tiktok`
**Descripción:** Cuestionario con interfaz estilo TikTok

**Características:**
- Swipe gestures
- Videos cortos
- Preguntas rápidas
- Interfaz vertical

**Componente de Swipe:**
```typescript
// features/mechanics/module4/QuizTikTok/SwipeGesture.tsx
export const SwipeGesture: React.FC<SwipeGestureProps> = ({
  onSwipeLeft,
  onSwipeRight,
  children,
}) => {
  const [startX, setStartX] = useState(0);
  const [offsetX, setOffsetX] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentX = e.touches[0].clientX;
    setOffsetX(currentX - startX);
  };

  const handleTouchEnd = () => {
    if (offsetX > 100) {
      onSwipeRight();
    } else if (offsetX < -100) {
      onSwipeLeft();
    }
    setOffsetX(0);
  };

  return (
    <div
      className="swipeable-container"
      style={{ transform: `translateX(${offsetX}px)` }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
};
```

### 6.3 Navegación Hipertextual

**Tipo:** `navegacion_hipertextual`
**Descripción:** Navegar por documentos enlazados

**Características:**
- Hipertexto interactivo
- Breadcrumbs de navegación
- Mapa de documentos
- Tracking de rutas

### 6.4 Análisis de Memes

**Tipo:** `analisis_memes`
**Descripción:** Interpretar significado de memes

**Características:**
- Anotación de elementos visuales
- Análisis de contexto cultural
- Identificación de referencias
- Interpretación multimodal

### 6.5 Infografía Interactiva

**Tipo:** `infografia_interactiva`
**Descripción:** Explorar e interpretar infografías

**Características:**
- Elementos interactivos
- Tooltips informativos
- Preguntas contextuales
- Visualización de datos

### 6.6 Email Formal

**Tipo:** `email_formal`
**Descripción:** Redactar correos formales

**Características:**
- Editor de email
- Plantillas
- Validación de formato
- Retroalimentación de estilo

### 6.7 Chat Literario

**Tipo:** `chat_literario`
**Descripción:** Conversación con personajes literarios

**Características:**
- Interfaz de chat
- Respuestas contextuales
- Análisis de diálogo
- Coherencia narrativa

### 6.8 Ensayo Argumentativo

**Tipo:** `ensayo_argumentativo`
**Descripción:** Escribir ensayos estructurados

**Características:**
- Editor de texto
- Estructura guiada
- Verificación de argumentos
- Análisis de coherencia

### 6.9 Reseña Crítica

**Tipo:** `resena_critica`
**Descripción:** Escribir reseñas críticas

**Características:**
- Plantilla de reseña
- Criterios de evaluación
- Soporte multimedia
- Publicación

---

## 7. Módulo 5: Producción Creativa

**Objetivo Pedagógico:** Crear textos originales con intención comunicativa

**Mecánicas (3):**

### 7.1 Diario Multimedia

**Tipo:** `diario_multimedia`
**Descripción:** Crear entradas de diario con multimedia

**Características:**
- Editor de texto rico
- Inserción de imágenes
- Grabación de audio
- Formateo personalizado

### 7.2 Comic Digital

**Tipo:** `comic_digital`
**Descripción:** Crear comics con herramientas digitales

**Características:**
- Editor de viñetas
- Banco de personajes
- Globos de diálogo
- Efectos visuales

### 7.3 Video Carta

**Tipo:** `video_carta`
**Descripción:** Grabar mensajes en video

**Características:**
- Grabación de video
- Edición básica
- Guión estructurado
- Revisión

---

## 8. Mecánicas Auxiliares

**Mecánicas de soporte y transición:**

### 8.1 Call to Action

**Tipo:** `call_to_action`
**Descripción:** Presentación motivacional

### 8.2 Collage de Prensa

**Tipo:** `collage_prensa`
**Descripción:** Crear collages temáticos

### 8.3 Comprensión Auditiva

**Tipo:** `comprension_auditiva`
**Descripción:** Ejercicios basados en audio

### 8.4 Texto en Movimiento

**Tipo:** `texto_movimiento`
**Descripción:** Textos con animaciones

---

## 9. Sistema de Scoring

### 9.1 Cálculo de Puntuación

```typescript
// features/mechanics/shared/scoring.ts
export const calculateScore = (
  correctAnswers: number,
  totalQuestions: number,
  timeSpent: number,
  estimatedTime: number,
  hintsUsed: number,
  difficulty: string
): ScoreResult => {
  // Base score (0-100)
  const baseScore = (correctAnswers / totalQuestions) * 100;

  // Time bonus (max 20 points)
  const timeRatio = timeSpent / (estimatedTime * 60);
  const timeBonus = timeRatio < 0.8 ? 20 * (0.8 - timeRatio) / 0.8 : 0;

  // Accuracy bonus (max 10 points)
  const accuracy = correctAnswers / totalQuestions;
  const accuracyBonus = accuracy === 1 ? 10 : accuracy > 0.9 ? 5 : 0;

  // Hint penalty
  const hintPenalty = hintsUsed * 5;

  // Difficulty multiplier
  const difficultyMultiplier = {
    facil: 1.0,
    medio: 1.2,
    dificil: 1.5,
    experto: 2.0,
  }[difficulty] || 1.0;

  const totalScore = Math.max(
    0,
    (baseScore + timeBonus + accuracyBonus - hintPenalty) * difficultyMultiplier
  );

  // Calculate rewards
  const mlCoins = Math.floor(totalScore * 0.5);
  const xpGained = Math.floor(totalScore * 2);

  return {
    baseScore,
    timeBonus,
    accuracyBonus,
    totalScore: Math.round(totalScore),
    mlCoins,
    xpGained,
    correctAnswers,
    totalQuestions,
    grade: calculateGrade(totalScore),
  };
};

const calculateGrade = (score: number): ScoreResult['grade'] => {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
};
```

### 9.2 Feedback al Usuario

```typescript
// features/mechanics/shared/components/FeedbackModal.tsx
export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  result,
  onClose,
}) => {
  const feedbackMessage = getFeedbackMessage(result.grade);
  const showConfetti = result.grade === 'A+' || result.grade === 'A';

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {showConfetti && <Confetti />}

      <div className="feedback-content">
        <h2 className={`grade grade-${result.grade}`}>{result.grade}</h2>

        <p className="feedback-message">{feedbackMessage}</p>

        <div className="score-breakdown">
          <ScoreItem label="Puntuación Base" value={result.baseScore} />
          <ScoreItem label="Bonus de Tiempo" value={result.timeBonus} />
          <ScoreItem label="Bonus de Precisión" value={result.accuracyBonus} />
          <Divider />
          <ScoreItem
            label="Total"
            value={result.totalScore}
            highlight
          />
        </div>

        <div className="rewards">
          <RewardBadge
            icon="Coins"
            label="ML Coins"
            value={result.mlCoins}
          />
          <RewardBadge
            icon="Zap"
            label="XP Ganado"
            value={result.xpGained}
          />
        </div>

        <div className="stats">
          <Stat
            label="Respuestas Correctas"
            value={`${result.correctAnswers}/${result.totalQuestions}`}
          />
        </div>

        <button onClick={onClose} className="btn-primary">
          Continuar
        </button>
      </div>
    </Modal>
  );
};
```

---

## 10. Integración con Backend

### 10.1 API de Mecánicas

```typescript
// features/mechanics/shared/api/mechanicsAPI.ts
export const mechanicsAPI = {
  submit: async (data: MechanicSubmission): Promise<MechanicResult> => {
    const response = await apiClient.post('/mechanics/submit', data);
    return response.data;
  },

  getExercise: async (exerciseId: string): Promise<Exercise> => {
    const response = await apiClient.get(`/mechanics/exercises/${exerciseId}`);
    return response.data;
  },

  getAttempts: async (exerciseId: string): Promise<ExerciseAttempt[]> => {
    const response = await apiClient.get(
      `/mechanics/exercises/${exerciseId}/attempts`
    );
    return response.data;
  },
};
```

### 10.2 Configuración Dinámica

Las mecánicas obtienen su configuración desde la base de datos:

```sql
-- educational_content.exercises
SELECT
  id,
  module_id,
  title,
  type, -- ExerciseType
  config, -- JSONB con configuración específica
  content, -- JSONB con contenido del ejercicio
  xp_reward,
  ml_coins_reward,
  max_attempts,
  comodines_allowed
FROM educational_content.exercises
WHERE id = $1;
```

**Ejemplo de `config` para Crucigrama:**
```json
{
  "type": "crucigrama",
  "difficulty": "medio",
  "estimatedTime": 15,
  "grid": {
    "rows": 10,
    "cols": 10,
    "cells": [ ... ]
  },
  "clues": {
    "across": [ ... ],
    "down": [ ... ]
  },
  "hints": [
    "La primera palabra es un sinónimo de 'estudio'",
    "Busca palabras relacionadas con el método científico"
  ]
}
```

---

## 11. Mejores Prácticas

### 11.1 Desarrollo de Nuevas Mecánicas

**Checklist:**

1. ✅ Heredar de `BaseExercise`
2. ✅ Definir props tipadas
3. ✅ Implementar validación de respuestas
4. ✅ Calcular scoring correctamente
5. ✅ Proveer feedback claro
6. ✅ Manejar errores gracefully
7. ✅ Probar con datos reales de DB
8. ✅ Documentar configuración esperada

### 11.2 Testing

```typescript
// features/mechanics/module1/Crucigrama/__tests__/Crucigrama.test.tsx
describe('CrucigramaExercise', () => {
  it('should render grid correctly', () => {
    const { container } = render(
      <CrucigramaExercise
        grid={mockGrid}
        clues={mockClues}
        exerciseId="test-123"
        config={mockConfig}
        onComplete={mockOnComplete}
      />
    );

    expect(container.querySelectorAll('.crucigrama-cell')).toHaveLength(100);
  });

  it('should validate answers correctly', () => {
    // Test implementation
  });

  it('should calculate score based on time and accuracy', () => {
    // Test implementation
  });
});
```

### 11.3 Accesibilidad

- Keyboard navigation
- Screen reader support
- Color contrast
- Font size adjustable
- Alternative text for images

---

## 12. Roadmap de Mecánicas

### Fase Actual (v2.0)
- ✅ 33 mecánicas implementadas
- ✅ Sistema de scoring completo
- ✅ Integración con gamificación
- ✅ Configuración desde DB

### Próximas Mecánicas (v2.1)
- 🔄 Realidad Aumentada (AR)
- 🔄 Reconocimiento de voz
- 🔄 Generación con IA
- 🔄 Colaboración en tiempo real

### Futuro (v3.0)
- 📋 VR experiences
- 📋 Adaptive difficulty
- 📋 Personalized learning paths
- 📋 AI tutoring

---

**Documento generado:** 2025-10-27
**Versión:** 1.0
**Total de Mecánicas:** 33+
**Líneas de Código:** ~15,000+
