import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@shared/utils/cn';

interface PredictionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface TypeConfigProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function PrediccionNarrativaConfig({ config, onChange }: TypeConfigProps) {
  const storyFragment = (config.storyFragment as string) || '';
  const stopPoint = (config.stopPoint as string) || '';
  const options = (config.options as PredictionOption[]) || [];

  const addOption = () => {
    const newOpt: PredictionOption = {
      id: `opt-${Date.now()}`,
      text: '',
      isCorrect: false,
    };
    onChange({ ...config, options: [...options, newOpt] });
  };

  const updateOption = (idx: number, field: string, value: unknown) => {
    const updated = options.map((o, i) => (i === idx ? { ...o, [field]: value } : o));
    onChange({ ...config, options: updated });
  };

  const removeOption = (idx: number) => {
    onChange({ ...config, options: options.filter((_, i) => i !== idx) });
  };

  const setCorrect = (idx: number) => {
    const updated = options.map((o, i) => ({ ...o, isCorrect: i === idx }));
    onChange({ ...config, options: updated });
  };

  return (
    <div className="space-y-5">
      {/* Story Fragment */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-400">
          Fragmento de la Historia
        </label>
        <textarea
          className="input-detective w-full text-sm"
          rows={5}
          placeholder="El inicio de la historia que el estudiante leera..."
          value={storyFragment}
          onChange={(e) => onChange({ ...config, storyFragment: e.target.value })}
        />
      </div>

      {/* Stop Point */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-400">
          Punto de Detencion
        </label>
        <input
          type="text"
          className="input-detective w-full text-sm"
          placeholder="Ej: El protagonista llega a una encrucijada y debe decidir..."
          value={stopPoint}
          onChange={(e) => onChange({ ...config, stopPoint: e.target.value })}
        />
        <p className="mt-1 text-xs text-gray-500">
          Describe donde se detiene la historia para que el estudiante prediga.
        </p>
      </div>

      {/* Prediction Options */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-400">
            Opciones de Prediccion ({options.length})
          </label>
          <button
            type="button"
            onClick={addOption}
            className="flex items-center gap-1 rounded-lg bg-detective-orange/20 px-3 py-1.5 text-sm text-detective-orange hover:bg-detective-orange/30"
          >
            <Plus className="h-4 w-4" /> Agregar Opcion
          </button>
        </div>

        <div className="space-y-2">
          {options.map((opt, idx) => (
            <div
              key={opt.id}
              className={cn(
                'flex items-center gap-3 rounded-lg border p-3',
                opt.isCorrect
                  ? 'border-green-500/50 bg-green-500/5'
                  : 'border-gray-700 bg-gray-800/30'
              )}
            >
              <button
                type="button"
                onClick={() => setCorrect(idx)}
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs transition-colors',
                  opt.isCorrect
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-gray-600 text-gray-600 hover:border-gray-400'
                )}
                title="Marcar como correcta"
              >
                {opt.isCorrect && '\u2713'}
              </button>
              <input
                type="text"
                className="input-detective flex-1 text-sm"
                placeholder={`Opcion ${idx + 1}: Que podria pasar despues...`}
                value={opt.text}
                onChange={(e) => updateOption(idx, 'text', e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeOption(idx)}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {options.length === 0 && (
          <p className="rounded-lg bg-gray-800/30 p-4 text-center text-sm text-gray-500">
            Agrega 3-4 opciones de prediccion (una correcta).
          </p>
        )}
      </div>
    </div>
  );
}

export default PrediccionNarrativaConfig;
