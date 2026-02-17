import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@shared/utils/cn';

interface Hypothesis {
  id: string;
  text: string;
  evidence: string[];
  isCorrect: boolean;
}

interface TypeConfigProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function ConstruccionHipotesisConfig({ config, onChange }: TypeConfigProps) {
  const passage = (config.passage as string) || '';
  const hypotheses = (config.hypotheses as Hypothesis[]) || [];

  const addHypothesis = () => {
    const newH: Hypothesis = {
      id: `hyp-${Date.now()}`,
      text: '',
      evidence: [''],
      isCorrect: false,
    };
    onChange({ ...config, hypotheses: [...hypotheses, newH] });
  };

  const updateHypothesis = (idx: number, field: string, value: unknown) => {
    const updated = hypotheses.map((h, i) => (i === idx ? { ...h, [field]: value } : h));
    onChange({ ...config, hypotheses: updated });
  };

  const removeHypothesis = (idx: number) => {
    onChange({ ...config, hypotheses: hypotheses.filter((_, i) => i !== idx) });
  };

  const addEvidence = (hypIdx: number) => {
    const updated = hypotheses.map((h, i) =>
      i === hypIdx ? { ...h, evidence: [...h.evidence, ''] } : h
    );
    onChange({ ...config, hypotheses: updated });
  };

  const updateEvidence = (hypIdx: number, evIdx: number, value: string) => {
    const updated = hypotheses.map((h, i) => {
      if (i !== hypIdx) return h;
      const ev = h.evidence.map((e, j) => (j === evIdx ? value : e));
      return { ...h, evidence: ev };
    });
    onChange({ ...config, hypotheses: updated });
  };

  const removeEvidence = (hypIdx: number, evIdx: number) => {
    const updated = hypotheses.map((h, i) => {
      if (i !== hypIdx) return h;
      return { ...h, evidence: h.evidence.filter((_, j) => j !== evIdx) };
    });
    onChange({ ...config, hypotheses: updated });
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
          placeholder="Texto del pasaje de lectura..."
          value={passage}
          onChange={(e) => onChange({ ...config, passage: e.target.value })}
        />
      </div>

      {/* Hypotheses */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-400">
            Hipotesis ({hypotheses.length})
          </label>
          <button
            type="button"
            onClick={addHypothesis}
            className="flex items-center gap-1 rounded-lg bg-detective-orange/20 px-3 py-1.5 text-sm text-detective-orange hover:bg-detective-orange/30"
          >
            <Plus className="h-4 w-4" /> Agregar Hipotesis
          </button>
        </div>

        <div className="space-y-3">
          {hypotheses.map((hyp, idx) => (
            <div key={hyp.id} className="rounded-lg border border-gray-700 bg-gray-800/30 p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-detective-orange">
                    Hipotesis #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateHypothesis(idx, 'isCorrect', !hyp.isCorrect)}
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-medium',
                      hyp.isCorrect
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-700/50 text-gray-500 hover:bg-gray-600/50'
                    )}
                  >
                    {hyp.isCorrect ? 'Correcta' : 'Incorrecta'}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeHypothesis(idx)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mb-2">
                <label className="mb-1 block text-xs text-gray-500">Texto</label>
                <input
                  type="text"
                  className="input-detective w-full text-sm"
                  placeholder="La hipotesis del estudiante..."
                  value={hyp.text}
                  onChange={(e) => updateHypothesis(idx, 'text', e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Evidencia de Soporte</label>
                {hyp.evidence.map((ev, ei) => (
                  <div key={ei} className="mb-1 flex items-center gap-2">
                    <input
                      type="text"
                      className="input-detective flex-1 text-sm"
                      placeholder={`Evidencia ${ei + 1}`}
                      value={ev}
                      onChange={(e) => updateEvidence(idx, ei, e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => removeEvidence(idx, ei)}
                      className={cn(
                        'text-red-400 hover:text-red-300',
                        hyp.evidence.length <= 1 && 'invisible'
                      )}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addEvidence(idx)}
                  className="mt-1 flex items-center gap-1 text-xs text-gray-400 hover:text-detective-orange"
                >
                  <Plus className="h-3 w-3" /> Agregar evidencia
                </button>
              </div>
            </div>
          ))}
        </div>

        {hypotheses.length === 0 && (
          <p className="rounded-lg bg-gray-800/30 p-4 text-center text-sm text-gray-500">
            Agrega hipotesis para que los estudiantes evaluen.
          </p>
        )}
      </div>
    </div>
  );
}

export default ConstruccionHipotesisConfig;
