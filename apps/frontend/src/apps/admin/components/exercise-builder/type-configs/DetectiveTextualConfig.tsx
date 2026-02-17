import { Plus, Trash2, Search } from 'lucide-react';

interface Clue {
  id: string;
  text: string;
  locationHint: string;
}

interface ClueQuestion {
  id: string;
  question: string;
  answer: string;
}

interface TypeConfigProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function DetectiveTextualConfig({ config, onChange }: TypeConfigProps) {
  const passage = (config.passage as string) || '';
  const clues = (config.clues as Clue[]) || [];
  const questions = (config.questions as ClueQuestion[]) || [];

  const addClue = () => {
    const newClue: Clue = { id: `clue-${Date.now()}`, text: '', locationHint: '' };
    onChange({ ...config, clues: [...clues, newClue] });
  };

  const updateClue = (idx: number, field: string, value: string) => {
    const updated = clues.map((c, i) => (i === idx ? { ...c, [field]: value } : c));
    onChange({ ...config, clues: updated });
  };

  const removeClue = (idx: number) => {
    onChange({ ...config, clues: clues.filter((_, i) => i !== idx) });
  };

  const addQuestion = () => {
    const newQ: ClueQuestion = { id: `q-${Date.now()}`, question: '', answer: '' };
    onChange({ ...config, questions: [...questions, newQ] });
  };

  const updateQuestion = (idx: number, field: string, value: string) => {
    const updated = questions.map((q, i) => (i === idx ? { ...q, [field]: value } : q));
    onChange({ ...config, questions: updated });
  };

  const removeQuestion = (idx: number) => {
    onChange({ ...config, questions: questions.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-5">
      {/* Reading Passage */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-400">
          Pasaje de Lectura
        </label>
        <textarea
          className="input-detective w-full text-sm"
          rows={5}
          placeholder="Texto con pistas ocultas para que el estudiante descubra..."
          value={passage}
          onChange={(e) => onChange({ ...config, passage: e.target.value })}
        />
      </div>

      {/* Clues */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="flex items-center gap-1 text-sm font-medium text-gray-400">
            <Search className="h-4 w-4" /> Pistas ({clues.length})
          </label>
          <button
            type="button"
            onClick={addClue}
            className="flex items-center gap-1 rounded-lg bg-detective-orange/20 px-3 py-1.5 text-sm text-detective-orange hover:bg-detective-orange/30"
          >
            <Plus className="h-4 w-4" /> Agregar Pista
          </button>
        </div>

        <div className="space-y-3">
          {clues.map((clue, idx) => (
            <div key={clue.id} className="rounded-lg border border-gray-700 bg-gray-800/30 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-detective-orange">
                  Pista #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeClue(idx)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Texto de la Pista</label>
                  <input
                    type="text"
                    className="input-detective w-full text-sm"
                    placeholder="Que dice la pista..."
                    value={clue.text}
                    onChange={(e) => updateClue(idx, 'text', e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Donde Buscar</label>
                  <input
                    type="text"
                    className="input-detective w-full text-sm"
                    placeholder="Ej: Segundo parrafo, linea 3..."
                    value={clue.locationHint}
                    onChange={(e) => updateClue(idx, 'locationHint', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {clues.length === 0 && (
          <p className="rounded-lg bg-gray-800/30 p-4 text-center text-sm text-gray-500">
            Agrega pistas para que el detective las encuentre.
          </p>
        )}
      </div>

      {/* Questions */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-400">
            Preguntas ({questions.length})
          </label>
          <button
            type="button"
            onClick={addQuestion}
            className="flex items-center gap-1 rounded-lg bg-detective-orange/20 px-3 py-1.5 text-sm text-detective-orange hover:bg-detective-orange/30"
          >
            <Plus className="h-4 w-4" /> Agregar Pregunta
          </button>
        </div>

        <div className="space-y-3">
          {questions.map((q, idx) => (
            <div key={q.id} className="rounded-lg border border-gray-700 bg-gray-800/30 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-detective-orange">
                  Pregunta #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeQuestion(idx)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Pregunta</label>
                  <input
                    type="text"
                    className="input-detective w-full text-sm"
                    placeholder="Que debe responder el estudiante..."
                    value={q.question}
                    onChange={(e) => updateQuestion(idx, 'question', e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Respuesta Esperada</label>
                  <input
                    type="text"
                    className="input-detective w-full text-sm"
                    placeholder="Respuesta correcta..."
                    value={q.answer}
                    onChange={(e) => updateQuestion(idx, 'answer', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {questions.length === 0 && (
          <p className="rounded-lg bg-gray-800/30 p-4 text-center text-sm text-gray-500">
            Agrega preguntas sobre las pistas encontradas.
          </p>
        )}
      </div>
    </div>
  );
}

export default DetectiveTextualConfig;
