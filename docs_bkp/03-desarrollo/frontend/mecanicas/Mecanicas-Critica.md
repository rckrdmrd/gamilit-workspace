# Módulo 3: Mecánicas de Comprensión Crítica

**Objetivo Pedagógico:** Analizar, evaluar y juzgar textos
**Total de Mecánicas:** 5
**Archivos de implementación:** 5

---

## Resumen del Módulo

Este módulo implementa 5 mecánicas educativas enfocadas en la comprensión crítica de textos. Estas mecánicas ayudan a los estudiantes a analizar, evaluar y juzgar textos desde diferentes perspectivas, desarrollando habilidades de pensamiento crítico y argumentación.

---

## 1. Análisis de Fuentes

**Tipo:** `analisis_fuentes`
**Descripción:** Evaluar credibilidad y sesgo de fuentes

### Características

- Múltiples fuentes
- Criterios de evaluación
- Detección de sesgos
- Comparación crítica

### Implementación

```typescript
// features/mechanics/module3/AnalisisFuentes/AnalisisFuentesExercise.tsx
interface SourceAnalysisProps extends BaseExerciseProps {
  sources: Source[];
  evaluationCriteria: EvaluationCriterion[];
}

interface Source {
  id: string;
  title: string;
  content: string;
  author: string;
  publisher: string;
  date: string;
  type: 'news' | 'academic' | 'blog' | 'social';
  credibilityScore?: number;
}

interface EvaluationCriterion {
  id: string;
  name: string;
  description: string;
  weight: number;
}

export const AnalisisFuentesExercise: React.FC<SourceAnalysisProps> = ({
  sources,
  evaluationCriteria,
  ...baseProps
}) => {
  const [evaluations, setEvaluations] = useState<Record<string, SourceEvaluation>>({});
  const [currentSource, setCurrentSource] = useState(0);

  const handleEvaluate = (sourceId: string, criterion: string, score: number) => {
    setEvaluations(prev => ({
      ...prev,
      [sourceId]: {
        ...prev[sourceId],
        [criterion]: score,
      },
    }));
  };

  return (
    <BaseExercise {...baseProps}>
      <div className="source-analysis-container">
        <div className="source-viewer">
          <SourceCard source={sources[currentSource]} />

          <div className="source-navigation">
            <button
              onClick={() => setCurrentSource(prev => Math.max(0, prev - 1))}
              disabled={currentSource === 0}
            >
              Anterior
            </button>
            <span>Fuente {currentSource + 1} de {sources.length}</span>
            <button
              onClick={() => setCurrentSource(prev => Math.min(sources.length - 1, prev + 1))}
              disabled={currentSource === sources.length - 1}
            >
              Siguiente
            </button>
          </div>
        </div>

        <div className="evaluation-panel">
          <h3>Evalúa esta fuente</h3>
          {evaluationCriteria.map(criterion => (
            <CriterionEvaluator
              key={criterion.id}
              criterion={criterion}
              score={evaluations[sources[currentSource].id]?.[criterion.id]}
              onScore={(score) => handleEvaluate(sources[currentSource].id, criterion.id, score)}
            />
          ))}
        </div>

        <div className="comparison-panel">
          <h3>Comparación de Fuentes</h3>
          <SourceComparisonTable
            sources={sources}
            evaluations={evaluations}
            criteria={evaluationCriteria}
          />
        </div>
      </div>
    </BaseExercise>
  );
};
```

---

## 2. Debate Digital

**Tipo:** `debate_digital`
**Descripción:** Argumentar posiciones sobre un tema

### Características

- Formato de debate
- Argumentos y contraargumentos
- Sistema de turnos
- Evaluación de calidad argumentativa

### Implementación

```typescript
// features/mechanics/module3/DebateDigital/DebateDigitalExercise.tsx
interface DebateProps extends BaseExerciseProps {
  topic: string;
  positions: DebatePosition[];
  rounds: number;
}

interface DebatePosition {
  id: string;
  title: string;
  description: string;
}

interface Argument {
  id: string;
  position: string;
  text: string;
  evidence: string[];
  round: number;
}

export const DebateDigitalExercise: React.FC<DebateProps> = ({
  topic,
  positions,
  rounds,
  ...baseProps
}) => {
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [arguments, setArguments] = useState<Argument[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentArgument, setCurrentArgument] = useState('');
  const [evidence, setEvidence] = useState<string[]>([]);

  const submitArgument = () => {
    const newArgument: Argument = {
      id: crypto.randomUUID(),
      position: selectedPosition!,
      text: currentArgument,
      evidence,
      round: currentRound,
    };

    setArguments(prev => [...prev, newArgument]);
    setCurrentArgument('');
    setEvidence([]);

    if (currentRound < rounds) {
      setCurrentRound(prev => prev + 1);
    }
  };

  return (
    <BaseExercise {...baseProps}>
      <div className="debate-container">
        <div className="debate-header">
          <h2>Tema de Debate</h2>
          <p>{topic}</p>
        </div>

        {!selectedPosition ? (
          <div className="position-selection">
            <h3>Elige tu posición</h3>
            {positions.map(position => (
              <PositionCard
                key={position.id}
                position={position}
                onSelect={() => setSelectedPosition(position.id)}
              />
            ))}
          </div>
        ) : (
          <>
            <div className="debate-progress">
              <h3>Ronda {currentRound} de {rounds}</h3>
              <ProgressBar current={currentRound} total={rounds} />
            </div>

            <div className="argument-panel">
              <h3>Tu Argumento</h3>
              <textarea
                value={currentArgument}
                onChange={(e) => setCurrentArgument(e.target.value)}
                placeholder="Presenta tu argumento..."
              />

              <div className="evidence-section">
                <h4>Evidencias</h4>
                <EvidenceInput
                  evidence={evidence}
                  onAdd={(ev) => setEvidence(prev => [...prev, ev])}
                  onRemove={(idx) => setEvidence(prev => prev.filter((_, i) => i !== idx))}
                />
              </div>

              <button onClick={submitArgument} disabled={!currentArgument}>
                Enviar Argumento
              </button>
            </div>

            <div className="arguments-history">
              <h3>Historial de Argumentos</h3>
              {arguments.map(arg => (
                <ArgumentCard key={arg.id} argument={arg} />
              ))}
            </div>
          </>
        )}
      </div>
    </BaseExercise>
  );
};
```

---

## 3. Matriz de Perspectivas

**Tipo:** `matriz_perspectivas`
**Descripción:** Analizar múltiples puntos de vista

### Características

- Grid de perspectivas
- Análisis comparativo
- Identificación de sesgos
- Síntesis crítica

### Implementación

```typescript
// features/mechanics/module3/MatrizPerspectivas/MatrizPerspectivasExercise.tsx
interface PerspectiveMatrixProps extends BaseExerciseProps {
  topic: string;
  perspectives: Perspective[];
  analysisQuestions: string[];
}

interface Perspective {
  id: string;
  name: string;
  description: string;
  viewpoint: string;
  arguments: string[];
  biases?: string[];
}

export const MatrizPerspectivasExercise: React.FC<PerspectiveMatrixProps> = ({
  topic,
  perspectives,
  analysisQuestions,
  ...baseProps
}) => {
  const [matrix, setMatrix] = useState<Record<string, Record<string, string>>>({});
  const [synthesis, setSynthesis] = useState('');

  const updateCell = (perspectiveId: string, questionId: string, value: string) => {
    setMatrix(prev => ({
      ...prev,
      [perspectiveId]: {
        ...prev[perspectiveId],
        [questionId]: value,
      },
    }));
  };

  return (
    <BaseExercise {...baseProps}>
      <div className="matrix-container">
        <div className="topic-header">
          <h2>{topic}</h2>
        </div>

        <div className="perspectives-grid">
          <table className="matrix-table">
            <thead>
              <tr>
                <th>Pregunta de Análisis</th>
                {perspectives.map(p => (
                  <th key={p.id}>{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {analysisQuestions.map((question, qIdx) => (
                <tr key={qIdx}>
                  <td className="question-cell">{question}</td>
                  {perspectives.map(perspective => (
                    <td key={perspective.id}>
                      <textarea
                        value={matrix[perspective.id]?.[qIdx] || ''}
                        onChange={(e) => updateCell(perspective.id, String(qIdx), e.target.value)}
                        placeholder="Tu análisis..."
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="perspectives-detail">
          <h3>Perspectivas Detalladas</h3>
          {perspectives.map(perspective => (
            <PerspectiveCard key={perspective.id} perspective={perspective} />
          ))}
        </div>

        <div className="synthesis-panel">
          <h3>Síntesis Crítica</h3>
          <p>Basándote en tu análisis, ¿cuál es tu conclusión sobre {topic}?</p>
          <textarea
            value={synthesis}
            onChange={(e) => setSynthesis(e.target.value)}
            placeholder="Escribe tu síntesis integrando las diferentes perspectivas..."
          />
        </div>
      </div>
    </BaseExercise>
  );
};
```

---

## 4. Podcast Argumentativo

**Tipo:** `podcast_argumentativo`
**Descripción:** Crear argumentos en formato audio

### Características

- Grabación de audio
- Estructura argumentativa
- Evidencias y ejemplos
- Revisión por pares

### Implementación

```typescript
// features/mechanics/module3/PodcastArgumentativo/PodcastArgumentativoExercise.tsx
interface PodcastProps extends BaseExerciseProps {
  topic: string;
  structure: PodcastStructure;
  maxDuration: number; // segundos
}

interface PodcastStructure {
  introduction: string;
  mainPoints: string[];
  conclusion: string;
}

export const PodcastArgumentativoExercise: React.FC<PodcastProps> = ({
  topic,
  structure,
  maxDuration,
  ...baseProps
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [script, setScript] = useState('');

  const startRecording = async () => {
    // Implementación de grabación de audio
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  return (
    <BaseExercise {...baseProps}>
      <div className="podcast-container">
        <div className="topic-section">
          <h2>Tema del Podcast</h2>
          <p>{topic}</p>
        </div>

        <div className="structure-guide">
          <h3>Estructura Sugerida</h3>
          <StructureGuide structure={structure} />
        </div>

        <div className="script-editor">
          <h3>Guión (Opcional)</h3>
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="Escribe tu guión aquí..."
          />
        </div>

        <div className="recording-panel">
          <h3>Grabación</h3>
          <div className="recorder-controls">
            {!isRecording ? (
              <button onClick={startRecording}>
                Iniciar Grabación
              </button>
            ) : (
              <>
                <span className="recording-indicator">Grabando... {duration}s</span>
                <button onClick={stopRecording}>
                  Detener Grabación
                </button>
              </>
            )}
          </div>

          {audioBlob && (
            <div className="audio-preview">
              <h4>Vista Previa</h4>
              <audio controls src={URL.createObjectURL(audioBlob)} />
            </div>
          )}
        </div>

        <div className="requirements-checklist">
          <h3>Checklist</h3>
          <ChecklistItem
            label="Introducción clara del tema"
            checked={/* validación */}
          />
          <ChecklistItem
            label="Al menos 3 argumentos principales"
            checked={/* validación */}
          />
          <ChecklistItem
            label="Conclusión convincente"
            checked={/* validación */}
          />
        </div>
      </div>
    </BaseExercise>
  );
};
```

---

## 5. Tribunal de Opiniones

**Tipo:** `tribunal_opiniones`
**Descripción:** Evaluar argumentos como un juez

### Características

- Casos presentados
- Argumentos pro/contra
- Veredicto fundamentado
- Justificación detallada

### Implementación

```typescript
// features/mechanics/module3/TribunalOpiniones/TribunalOpinionesExercise.tsx
interface TribunalProps extends BaseExerciseProps {
  case: Case;
  arguments: CaseArgument[];
}

interface Case {
  id: string;
  title: string;
  description: string;
  context: string;
}

interface CaseArgument {
  id: string;
  side: 'pro' | 'contra';
  text: string;
  evidence: string[];
  strength: number;
}

export const TribunalOpinionesExercise: React.FC<TribunalProps> = ({
  case: caseData,
  arguments: caseArguments,
  ...baseProps
}) => {
  const [verdict, setVerdict] = useState<'pro' | 'contra' | null>(null);
  const [justification, setJustification] = useState('');
  const [argumentScores, setArgumentScores] = useState<Record<string, number>>({});

  const scoreArgument = (argumentId: string, score: number) => {
    setArgumentScores(prev => ({ ...prev, [argumentId]: score }));
  };

  return (
    <BaseExercise {...baseProps}>
      <div className="tribunal-container">
        <div className="case-presentation">
          <h2>Caso: {caseData.title}</h2>
          <p className="case-description">{caseData.description}</p>
          <div className="case-context">
            <h3>Contexto</h3>
            <p>{caseData.context}</p>
          </div>
        </div>

        <div className="arguments-section">
          <div className="arguments-pro">
            <h3>Argumentos a Favor</h3>
            {caseArguments
              .filter(arg => arg.side === 'pro')
              .map(arg => (
                <ArgumentCard
                  key={arg.id}
                  argument={arg}
                  score={argumentScores[arg.id]}
                  onScore={(score) => scoreArgument(arg.id, score)}
                />
              ))}
          </div>

          <div className="arguments-contra">
            <h3>Argumentos en Contra</h3>
            {caseArguments
              .filter(arg => arg.side === 'contra')
              .map(arg => (
                <ArgumentCard
                  key={arg.id}
                  argument={arg}
                  score={argumentScores[arg.id]}
                  onScore={(score) => scoreArgument(arg.id, score)}
                />
              ))}
          </div>
        </div>

        <div className="verdict-panel">
          <h3>Tu Veredicto</h3>
          <div className="verdict-options">
            <button
              className={verdict === 'pro' ? 'selected' : ''}
              onClick={() => setVerdict('pro')}
            >
              A Favor
            </button>
            <button
              className={verdict === 'contra' ? 'selected' : ''}
              onClick={() => setVerdict('contra')}
            >
              En Contra
            </button>
          </div>

          <div className="justification-section">
            <h4>Justificación de tu Veredicto</h4>
            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Explica las razones de tu decisión, citando los argumentos evaluados..."
            />
          </div>
        </div>

        <div className="scoring-summary">
          <h3>Resumen de Evaluaciones</h3>
          <ScoringSummaryTable
            arguments={caseArguments}
            scores={argumentScores}
          />
        </div>
      </div>
    </BaseExercise>
  );
};
```

---

## Ubicación en el Código

**Directorio:** `/src/features/mechanics/module3/`

**Estructura:**
```
module3/
├── AnalisisFuentes/
│   ├── AnalisisFuentesExercise.tsx
│   ├── SourceCard.tsx
│   ├── CriterionEvaluator.tsx
│   ├── SourceComparisonTable.tsx
│   └── types.ts
├── DebateDigital/
│   ├── DebateDigitalExercise.tsx
│   ├── PositionCard.tsx
│   ├── ArgumentCard.tsx
│   ├── EvidenceInput.tsx
│   └── types.ts
├── MatrizPerspectivas/
│   ├── MatrizPerspectivasExercise.tsx
│   ├── PerspectiveCard.tsx
│   └── types.ts
├── PodcastArgumentativo/
│   ├── PodcastArgumentativoExercise.tsx
│   ├── StructureGuide.tsx
│   ├── ChecklistItem.tsx
│   └── types.ts
└── TribunalOpiniones/
    ├── TribunalOpinionesExercise.tsx
    ├── ArgumentCard.tsx
    ├── ScoringSummaryTable.tsx
    └── types.ts
```

---

**Última actualización:** 2025-10-27
**Versión:** 1.0
