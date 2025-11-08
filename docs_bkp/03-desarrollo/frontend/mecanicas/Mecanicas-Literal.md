# Módulo 1: Mecánicas de Comprensión Literal

**Objetivo Pedagógico:** Identificar información explícita en textos
**Total de Mecánicas:** 7
**Archivos de implementación:** 19

---

## Resumen del Módulo

Este módulo implementa 7 mecánicas educativas enfocadas en la comprensión literal de textos. Estas mecánicas ayudan a los estudiantes a identificar y procesar información que aparece explícitamente en el texto, desarrollando habilidades fundamentales de lectura.

### Arquitectura de Mecánicas

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

### Types Compartidos

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
  | 'completar_espacios';

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

### Hooks Compartidos

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

## 1. Crucigrama Científico

**Tipo:** `crucigrama_cientifico` | `crucigrama`
**Descripción:** Crucigrama interactivo con terminología científica

### Componente

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

### Configuración desde DB

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

---

## 2. Línea de Tiempo

**Tipo:** `timeline` | `linea_tiempo`
**Descripción:** Organizar eventos en orden cronológico

### Componente

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

---

## 3. Sopa de Letras

**Tipo:** `sopa_letras`
**Descripción:** Encontrar palabras ocultas en una matriz

### Características

- Grid interactivo con selección de celdas
- Lista de palabras a encontrar
- Detección automática de palabras encontradas
- Timer y contador de palabras

### Implementación

```typescript
// features/mechanics/module1/SopaLetras/SopaLetrasExercise.tsx
interface SopaLetrasProps extends BaseExerciseProps {
  grid: string[][];
  words: string[];
}

export const SopaLetrasExercise: React.FC<SopaLetrasProps> = ({
  grid,
  words,
  ...baseProps
}) => {
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [selectedCells, setSelectedCells] = useState<[number, number][]>([]);

  const handleCellSelect = (row: number, col: number) => {
    setSelectedCells(prev => [...prev, [row, col]]);
  };

  const checkWord = () => {
    const selectedWord = selectedCells
      .map(([r, c]) => grid[r][c])
      .join('');

    if (words.includes(selectedWord)) {
      setFoundWords(prev => [...prev, selectedWord]);
    }
    setSelectedCells([]);
  };

  return (
    <BaseExercise {...baseProps}>
      <div className="sopa-letras-container">
        <div className="grid">
          {grid.map((row, rowIdx) => (
            <div key={rowIdx} className="row">
              {row.map((letter, colIdx) => (
                <SopaCell
                  key={`${rowIdx}-${colIdx}`}
                  letter={letter}
                  isSelected={selectedCells.some(
                    ([r, c]) => r === rowIdx && c === colIdx
                  )}
                  onClick={() => handleCellSelect(rowIdx, colIdx)}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="words-list">
          <h3>Palabras a encontrar:</h3>
          {words.map(word => (
            <WordItem
              key={word}
              word={word}
              found={foundWords.includes(word)}
            />
          ))}
        </div>
      </div>
    </BaseExercise>
  );
};
```

---

## 4. Mapa Conceptual

**Tipo:** `mapa_conceptual`
**Descripción:** Conectar conceptos relacionados

### Características

- Nodos arrastrables
- Conexiones entre nodos
- Validación de relaciones
- Editor visual

---

## 5. Emparejamiento

**Tipo:** `emparejamiento`
**Descripción:** Unir elementos relacionados de dos columnas

### Características

- Drag & Drop
- Validación de pares
- Feedback inmediato
- Penalización por errores

---

## 6. Verdadero/Falso

**Tipo:** `verdadero_falso`
**Descripción:** Evaluar veracidad de afirmaciones

### Características

- Afirmaciones con opción V/F
- Justificación opcional
- Feedback detallado
- Explicaciones

---

## 7. Completar Espacios

**Tipo:** `completar_espacios`
**Descripción:** Completar texto con palabras faltantes

### Características

- Input inline
- Banco de palabras opcional
- Validación automática
- Hints disponibles

---

## Ubicación en el Código

**Directorio:** `/src/features/mechanics/module1/`

**Estructura:**
```
module1/
├── Crucigrama/
│   ├── CrucigramaExercise.tsx
│   ├── CrucigramaCell.tsx
│   ├── CluesList.tsx
│   └── types.ts
├── Timeline/
│   ├── TimelineExercise.tsx
│   ├── TimelineEventCard.tsx
│   └── types.ts
├── SopaLetras/
├── MapaConceptual/
├── Emparejamiento/
├── VerdaderoFalso/
└── CompletarEspacios/
```

---

**Última actualización:** 2025-10-27
**Versión:** 1.0
