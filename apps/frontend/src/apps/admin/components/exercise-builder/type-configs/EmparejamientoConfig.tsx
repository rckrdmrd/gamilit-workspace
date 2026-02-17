import { Plus, Trash2, Shuffle } from 'lucide-react';

interface MatchPair {
  id: string;
  left: string;
  right: string;
}

interface TypeConfigProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function EmparejamientoConfig({ config, onChange }: TypeConfigProps) {
  const pairs = (config.pairs as MatchPair[]) || [];

  const addPair = () => {
    const newPair: MatchPair = { id: `pair-${Date.now()}`, left: '', right: '' };
    onChange({ ...config, pairs: [...pairs, newPair] });
  };

  const updatePair = (idx: number, field: 'left' | 'right', value: string) => {
    const updated = pairs.map((p, i) => (i === idx ? { ...p, [field]: value } : p));
    onChange({ ...config, pairs: updated });
  };

  const removePair = (idx: number) => {
    onChange({ ...config, pairs: pairs.filter((_, i) => i !== idx) });
  };

  const shuffledRight = [...pairs]
    .sort(() => Math.random() - 0.5)
    .map((p) => p.right)
    .filter(Boolean);

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-400">
            Pares de Emparejamiento ({pairs.length})
          </label>
          <button
            type="button"
            onClick={addPair}
            className="flex items-center gap-1 rounded-lg bg-detective-orange/20 px-3 py-1.5 text-sm text-detective-orange hover:bg-detective-orange/30"
          >
            <Plus className="h-4 w-4" /> Agregar Par
          </button>
        </div>

        {/* Column Headers */}
        {pairs.length > 0 && (
          <div className="mb-2 grid grid-cols-[1fr_1fr_32px] gap-3 px-1">
            <span className="text-xs font-semibold uppercase text-gray-500">Columna A</span>
            <span className="text-xs font-semibold uppercase text-gray-500">Columna B</span>
            <span />
          </div>
        )}

        <div className="space-y-2">
          {pairs.map((pair, idx) => (
            <div key={pair.id} className="grid grid-cols-[1fr_1fr_32px] items-center gap-3">
              <input
                type="text"
                className="input-detective text-sm"
                placeholder={`Item A-${idx + 1}`}
                value={pair.left}
                onChange={(e) => updatePair(idx, 'left', e.target.value)}
              />
              <input
                type="text"
                className="input-detective text-sm"
                placeholder={`Item B-${idx + 1}`}
                value={pair.right}
                onChange={(e) => updatePair(idx, 'right', e.target.value)}
              />
              <button
                type="button"
                onClick={() => removePair(idx)}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {pairs.length === 0 && (
          <p className="rounded-lg bg-gray-800/30 p-4 text-center text-sm text-gray-500">
            Agrega pares de conceptos para emparejar.
          </p>
        )}
      </div>

      {/* Shuffle Preview */}
      {pairs.length >= 2 && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Shuffle className="h-4 w-4 text-gray-400" />
            <label className="text-sm font-medium text-gray-400">
              Vista Previa (Columna B mezclada)
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              {pairs.map((p, i) => (
                <div
                  key={i}
                  className="rounded bg-gray-800/50 px-3 py-1.5 text-sm text-gray-300"
                >
                  {p.left || `Item A-${i + 1}`}
                </div>
              ))}
            </div>
            <div className="space-y-1">
              {shuffledRight.map((text, i) => (
                <div
                  key={i}
                  className="rounded bg-gray-800/50 px-3 py-1.5 text-sm text-gray-300"
                >
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmparejamientoConfig;
