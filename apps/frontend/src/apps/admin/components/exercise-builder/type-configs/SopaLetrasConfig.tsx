import { Plus, Trash2 } from 'lucide-react';

interface TypeConfigProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function SopaLetrasConfig({ config, onChange }: TypeConfigProps) {
  const gridSize = (config.gridSize as number) || 12;
  const words = (config.words as string[]) || [];
  const allowDiagonal = (config.allowDiagonal as boolean) ?? true;
  const allowBackwards = (config.allowBackwards as boolean) ?? false;

  const addWord = () => {
    onChange({ ...config, words: [...words, ''] });
  };

  const updateWord = (idx: number, value: string) => {
    const updated = words.map((w, i) => (i === idx ? value.toUpperCase() : w));
    onChange({ ...config, words: updated });
  };

  const removeWord = (idx: number) => {
    onChange({ ...config, words: words.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-5">
      {/* Grid Settings */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-400">
          Configuracion de la Cuadricula
        </label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs text-gray-500">Tamano (NxN)</label>
            <input
              type="number"
              className="input-detective w-full text-sm"
              min={8}
              max={20}
              value={gridSize}
              onChange={(e) =>
                onChange({
                  ...config,
                  gridSize: Math.max(8, Math.min(20, parseInt(e.target.value) || 12)),
                })
              }
            />
          </div>
          <div className="flex items-end gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-400">
              <input
                type="checkbox"
                checked={allowDiagonal}
                onChange={(e) => onChange({ ...config, allowDiagonal: e.target.checked })}
                className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-detective-orange focus:ring-detective-orange"
              />
              Diagonal
            </label>
          </div>
          <div className="flex items-end gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-400">
              <input
                type="checkbox"
                checked={allowBackwards}
                onChange={(e) => onChange({ ...config, allowBackwards: e.target.checked })}
                className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-detective-orange focus:ring-detective-orange"
              />
              Al reves
            </label>
          </div>
        </div>
      </div>

      {/* Words */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-400">
            Palabras a Esconder ({words.length})
          </label>
          <button
            type="button"
            onClick={addWord}
            className="flex items-center gap-1 rounded-lg bg-detective-orange/20 px-3 py-1.5 text-sm text-detective-orange hover:bg-detective-orange/30"
          >
            <Plus className="h-4 w-4" /> Agregar Palabra
          </button>
        </div>

        <div className="space-y-2">
          {words.map((word, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                className="input-detective flex-1 text-sm uppercase"
                placeholder={`Palabra ${idx + 1}`}
                value={word}
                onChange={(e) => updateWord(idx, e.target.value)}
              />
              <span className="text-xs text-gray-500">{word.length} letras</span>
              <button
                type="button"
                onClick={() => removeWord(idx)}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {words.length === 0 && (
          <p className="rounded-lg bg-gray-800/30 p-4 text-center text-sm text-gray-500">
            Agrega palabras para esconder en la sopa de letras.
          </p>
        )}

        {words.some((w) => w.length > gridSize) && (
          <p className="mt-2 text-xs text-red-400">
            Algunas palabras exceden el tamano de la cuadricula ({gridSize}).
          </p>
        )}
      </div>
    </div>
  );
}

export default SopaLetrasConfig;
