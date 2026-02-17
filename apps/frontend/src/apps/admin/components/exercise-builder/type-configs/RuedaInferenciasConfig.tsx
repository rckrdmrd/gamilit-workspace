import { Plus, Trash2, Target } from 'lucide-react';
import { cn } from '@shared/utils/cn';

interface Inference {
  id: string;
  text: string;
  evidence: string;
  isCorrect: boolean;
}

interface TypeConfigProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function RuedaInferenciasConfig({ config, onChange }: TypeConfigProps) {
  const centralTheme = (config.centralTheme as string) || '';
  const inferences = (config.inferences as Inference[]) || [];

  const addInference = () => {
    const newInf: Inference = {
      id: `inf-${Date.now()}`,
      text: '',
      evidence: '',
      isCorrect: false,
    };
    onChange({ ...config, inferences: [...inferences, newInf] });
  };

  const updateInference = (idx: number, field: string, value: unknown) => {
    const updated = inferences.map((inf, i) => (i === idx ? { ...inf, [field]: value } : inf));
    onChange({ ...config, inferences: updated });
  };

  const removeInference = (idx: number) => {
    onChange({ ...config, inferences: inferences.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-5">
      {/* Central Theme */}
      <div>
        <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-400">
          <Target className="h-4 w-4" /> Tema / Pregunta Central
        </label>
        <input
          type="text"
          className="input-detective w-full"
          placeholder="Ej: Que podemos inferir sobre la organizacion social maya?"
          value={centralTheme}
          onChange={(e) => onChange({ ...config, centralTheme: e.target.value })}
        />
      </div>

      {/* Inferences */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-400">
            Inferencias ({inferences.length})
          </label>
          <button
            type="button"
            onClick={addInference}
            className="flex items-center gap-1 rounded-lg bg-detective-orange/20 px-3 py-1.5 text-sm text-detective-orange hover:bg-detective-orange/30"
          >
            <Plus className="h-4 w-4" /> Agregar Inferencia
          </button>
        </div>

        <div className="space-y-3">
          {inferences.map((inf, idx) => (
            <div key={inf.id} className="rounded-lg border border-gray-700 bg-gray-800/30 p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-detective-orange">
                    Inferencia #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateInference(idx, 'isCorrect', !inf.isCorrect)}
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-medium',
                      inf.isCorrect
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-700/50 text-gray-500 hover:bg-gray-600/50'
                    )}
                  >
                    {inf.isCorrect ? 'Valida' : 'Invalida'}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeInference(idx)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mb-2">
                <label className="mb-1 block text-xs text-gray-500">Texto de la Inferencia</label>
                <input
                  type="text"
                  className="input-detective w-full text-sm"
                  placeholder="La inferencia que el estudiante debe evaluar..."
                  value={inf.text}
                  onChange={(e) => updateInference(idx, 'text', e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Evidencia de Soporte</label>
                <input
                  type="text"
                  className="input-detective w-full text-sm"
                  placeholder="Cita o referencia textual que soporta la inferencia..."
                  value={inf.evidence}
                  onChange={(e) => updateInference(idx, 'evidence', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        {inferences.length === 0 && (
          <p className="rounded-lg bg-gray-800/30 p-4 text-center text-sm text-gray-500">
            Agrega inferencias para la rueda radial.
          </p>
        )}
      </div>
    </div>
  );
}

export default RuedaInferenciasConfig;
