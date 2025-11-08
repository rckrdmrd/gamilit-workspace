# Módulo 2: Mecánicas de Comprensión Inferencial

**Objetivo Pedagógico:** Deducir información implícita en textos
**Total de Mecánicas:** 5
**Archivos de implementación:** 11

---

## Resumen del Módulo

Este módulo implementa 5 mecánicas educativas enfocadas en la comprensión inferencial de textos. Estas mecánicas ayudan a los estudiantes a deducir información que no aparece explícitamente en el texto, desarrollando habilidades de razonamiento y análisis.

---

## 1. Detective Textual

**Tipo:** `detective_textual`
**Descripción:** Encontrar pistas y evidencias en un texto para resolver un caso

### Componente destacado

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

### Características

- Tablero de evidencias
- Selección múltiple
- Conclusión por escrito
- Evaluación por criterios

### Implementación completa

```typescript
// features/mechanics/module2/DetectiveTextual/DetectiveTextualExercise.tsx
interface DetectiveTextualProps extends BaseExerciseProps {
  caseDescription: string;
  evidences: Evidence[];
  correctConclusion: string;
  requiredEvidences: string[]; // IDs de evidencias necesarias
}

export const DetectiveTextualExercise: React.FC<DetectiveTextualProps> = ({
  caseDescription,
  evidences,
  correctConclusion,
  requiredEvidences,
  ...baseProps
}) => {
  const [selectedEvidence, setSelectedEvidence] = useState<string[]>([]);
  const [conclusion, setConclusion] = useState('');
  const [showBoard, setShowBoard] = useState(false);

  const handleSubmit = () => {
    // Validar evidencias seleccionadas
    const evidenceScore = calculateEvidenceScore(
      selectedEvidence,
      requiredEvidences
    );

    // Validar conclusión (similarity check)
    const conclusionScore = calculateSimilarity(
      conclusion,
      correctConclusion
    );

    const totalScore = (evidenceScore * 0.5) + (conclusionScore * 0.5);

    return {
      correctAnswers: totalScore > 0.7 ? 1 : 0,
      totalQuestions: 1,
    };
  };

  return (
    <BaseExercise {...baseProps} onComplete={handleSubmit}>
      <div className="detective-container">
        <div className="case-description">
          <h2>El Caso</h2>
          <p>{caseDescription}</p>
        </div>

        <button onClick={() => setShowBoard(true)}>
          Examinar Evidencias
        </button>

        {showBoard && (
          <EvidenceBoard
            evidences={evidences}
            onSubmitConclusion={(evidence, conclusionText) => {
              setSelectedEvidence(evidence);
              setConclusion(conclusionText);
            }}
          />
        )}
      </div>
    </BaseExercise>
  );
};
```

---

## 2. Construcción de Hipótesis

**Tipo:** `construccion_hipotesis`
**Descripción:** Formular hipótesis basadas en información parcial

### Características

- Presentación progresiva de información
- Formulación de hipótesis
- Validación de lógica
- Retroalimentación constructiva

### Implementación

```typescript
// features/mechanics/module2/ConstruccionHipotesis/ConstruccionHipotesisExercise.tsx
interface HypothesisProps extends BaseExerciseProps {
  scenario: string;
  clues: Clue[];
  validHypotheses: string[];
}

interface Clue {
  id: string;
  text: string;
  order: number;
  revealed: boolean;
}

export const ConstruccionHipotesisExercise: React.FC<HypothesisProps> = ({
  scenario,
  clues,
  validHypotheses,
  ...baseProps
}) => {
  const [revealedClues, setRevealedClues] = useState<Clue[]>([clues[0]]);
  const [hypothesis, setHypothesis] = useState('');
  const [hypothesisHistory, setHypothesisHistory] = useState<string[]>([]);

  const revealNextClue = () => {
    const nextIndex = revealedClues.length;
    if (nextIndex < clues.length) {
      setRevealedClues(prev => [...prev, clues[nextIndex]]);
    }
  };

  const submitHypothesis = () => {
    setHypothesisHistory(prev => [...prev, hypothesis]);
    setHypothesis('');
  };

  return (
    <BaseExercise {...baseProps}>
      <div className="hypothesis-container">
        <div className="scenario">
          <h2>Escenario</h2>
          <p>{scenario}</p>
        </div>

        <div className="clues-panel">
          <h3>Pistas</h3>
          {revealedClues.map((clue, idx) => (
            <ClueCard key={clue.id} clue={clue} index={idx + 1} />
          ))}
          {revealedClues.length < clues.length && (
            <button onClick={revealNextClue}>
              Revelar siguiente pista
            </button>
          )}
        </div>

        <div className="hypothesis-panel">
          <h3>Tu Hipótesis</h3>
          <textarea
            value={hypothesis}
            onChange={(e) => setHypothesis(e.target.value)}
            placeholder="Formula tu hipótesis basándote en las pistas..."
          />
          <button onClick={submitHypothesis}>
            Guardar Hipótesis
          </button>
        </div>

        <div className="history">
          <h3>Historial de Hipótesis</h3>
          {hypothesisHistory.map((h, idx) => (
            <HypothesisHistoryItem
              key={idx}
              hypothesis={h}
              cluesAvailable={idx + 1}
            />
          ))}
        </div>
      </div>
    </BaseExercise>
  );
};
```

---

## 3. Predicción Narrativa

**Tipo:** `prediccion_narrativa`
**Descripción:** Predecir continuación de una historia

### Características

- Historia incompleta
- Opciones de continuación
- Justificación de elección
- Análisis de consistencia

### Implementación

```typescript
// features/mechanics/module2/PrediccionNarrativa/PrediccionNarrativaExercise.tsx
interface PredictionProps extends BaseExerciseProps {
  storyBeginning: string;
  continuationOptions: ContinuationOption[];
  correctContinuation: string;
}

interface ContinuationOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export const PrediccionNarrativaExercise: React.FC<PredictionProps> = ({
  storyBeginning,
  continuationOptions,
  correctContinuation,
  ...baseProps
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [justification, setJustification] = useState('');

  return (
    <BaseExercise {...baseProps}>
      <div className="prediction-container">
        <div className="story-section">
          <h2>Historia</h2>
          <div className="story-text">{storyBeginning}</div>
        </div>

        <div className="options-section">
          <h3>¿Qué crees que sucederá después?</h3>
          {continuationOptions.map(option => (
            <OptionCard
              key={option.id}
              option={option}
              isSelected={selectedOption === option.id}
              onSelect={() => setSelectedOption(option.id)}
            />
          ))}
        </div>

        <div className="justification-section">
          <h3>¿Por qué elegiste esta opción?</h3>
          <textarea
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Explica tu razonamiento basándote en pistas del texto..."
          />
        </div>
      </div>
    </BaseExercise>
  );
};
```

---

## 4. Puzzle de Contexto

**Tipo:** `puzzle_contexto`
**Descripción:** Reconstruir contexto a partir de fragmentos

### Características

- Fragmentos desordenados
- Drag & Drop para ordenar
- Análisis de coherencia
- Pistas graduales

### Implementación

```typescript
// features/mechanics/module2/PuzzleContexto/PuzzleContextoExercise.tsx
interface PuzzleProps extends BaseExerciseProps {
  fragments: TextFragment[];
  correctOrder: string[];
  hints: string[];
}

interface TextFragment {
  id: string;
  text: string;
  order: number;
}

export const PuzzleContextoExercise: React.FC<PuzzleProps> = ({
  fragments,
  correctOrder,
  hints,
  ...baseProps
}) => {
  const [orderedFragments, setOrderedFragments] = useState<TextFragment[]>(
    shuffleArray([...fragments])
  );
  const [usedHints, setUsedHints] = useState(0);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(orderedFragments);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setOrderedFragments(items);
  };

  const useHint = () => {
    if (usedHints < hints.length) {
      setUsedHints(prev => prev + 1);
    }
  };

  return (
    <BaseExercise {...baseProps}>
      <div className="puzzle-container">
        <div className="instructions">
          <h3>Instrucciones</h3>
          <p>Ordena los fragmentos para reconstruir el contexto coherente</p>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="fragments">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="fragments-list"
              >
                {orderedFragments.map((fragment, index) => (
                  <Draggable
                    key={fragment.id}
                    draggableId={fragment.id}
                    index={index}
                  >
                    {(provided) => (
                      <FragmentCard
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        fragment={fragment}
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

        {usedHints < hints.length && (
          <button onClick={useHint}>Usar Pista</button>
        )}

        {usedHints > 0 && (
          <div className="hints">
            {hints.slice(0, usedHints).map((hint, idx) => (
              <div key={idx} className="hint">
                Pista {idx + 1}: {hint}
              </div>
            ))}
          </div>
        )}
      </div>
    </BaseExercise>
  );
};
```

---

## 5. Rueda de Inferencias

**Tipo:** `rueda_inferencias`
**Descripción:** Hacer inferencias a partir de observaciones

### Características

- Observaciones visuales
- Cadena de inferencias
- Conexiones lógicas
- Validación de razonamiento

### Implementación

```typescript
// features/mechanics/module2/RuedaInferencias/RuedaInferenciasExercise.tsx
interface InferenceWheelProps extends BaseExerciseProps {
  observation: Observation;
  inferenceSteps: InferenceStep[];
}

interface Observation {
  id: string;
  text: string;
  image?: string;
}

interface InferenceStep {
  id: string;
  question: string;
  expectedAnswer: string;
  type: 'what_i_see' | 'what_i_know' | 'what_i_infer';
}

export const RuedaInferenciasExercise: React.FC<InferenceWheelProps> = ({
  observation,
  inferenceSteps,
  ...baseProps
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);

  const handleAnswerChange = (stepId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [stepId]: answer }));
  };

  const goToNextStep = () => {
    if (currentStep < inferenceSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  return (
    <BaseExercise {...baseProps}>
      <div className="inference-wheel-container">
        <div className="observation-panel">
          <h2>Observación</h2>
          {observation.image && (
            <img src={observation.image} alt="Observación" />
          )}
          <p>{observation.text}</p>
        </div>

        <div className="inference-steps">
          <InferenceWheel currentStep={currentStep} totalSteps={inferenceSteps.length} />

          <div className="current-step">
            <h3>{inferenceSteps[currentStep].question}</h3>
            <textarea
              value={answers[inferenceSteps[currentStep].id] || ''}
              onChange={(e) =>
                handleAnswerChange(inferenceSteps[currentStep].id, e.target.value)
              }
              placeholder="Tu respuesta..."
            />
            <button onClick={goToNextStep} disabled={currentStep === inferenceSteps.length - 1}>
              Siguiente Paso
            </button>
          </div>
        </div>

        <div className="inference-summary">
          <h3>Resumen de Inferencias</h3>
          {Object.entries(answers).map(([stepId, answer]) => {
            const step = inferenceSteps.find(s => s.id === stepId);
            return (
              <div key={stepId} className="inference-item">
                <strong>{step?.question}</strong>
                <p>{answer}</p>
              </div>
            );
          })}
        </div>
      </div>
    </BaseExercise>
  );
};
```

---

## Ubicación en el Código

**Directorio:** `/src/features/mechanics/module2/`

**Estructura:**
```
module2/
├── DetectiveTextual/
│   ├── DetectiveTextualExercise.tsx
│   ├── EvidenceBoard.tsx
│   ├── EvidenceCard.tsx
│   ├── ConclusionPanel.tsx
│   └── types.ts
├── ConstruccionHipotesis/
│   ├── ConstruccionHipotesisExercise.tsx
│   ├── ClueCard.tsx
│   ├── HypothesisPanel.tsx
│   └── types.ts
├── PrediccionNarrativa/
│   ├── PrediccionNarrativaExercise.tsx
│   ├── OptionCard.tsx
│   └── types.ts
├── PuzzleContexto/
│   ├── PuzzleContextoExercise.tsx
│   ├── FragmentCard.tsx
│   └── types.ts
└── RuedaInferencias/
    ├── RuedaInferenciasExercise.tsx
    ├── InferenceWheel.tsx
    └── types.ts
```

---

**Última actualización:** 2025-10-27
**Versión:** 1.0
