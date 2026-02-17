import { Plus, Trash2 } from 'lucide-react';

interface TypeConfigProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function DebateDigitalConfig({ config, onChange }: TypeConfigProps) {
  const topic = (config.topic as string) || '';
  const proPosition = (config.proPosition as string) || '';
  const proArguments = (config.proArguments as string[]) || [];
  const conPosition = (config.conPosition as string) || '';
  const conArguments = (config.conArguments as string[]) || [];
  const expectedConclusions = (config.expectedConclusions as string[]) || [];

  const updateList = (key: string, list: string[], idx: number, value: string) => {
    const updated = list.map((item, i) => (i === idx ? value : item));
    onChange({ ...config, [key]: updated });
  };

  const addToList = (key: string, list: string[]) => {
    onChange({ ...config, [key]: [...list, ''] });
  };

  const removeFromList = (key: string, list: string[], idx: number) => {
    onChange({ ...config, [key]: list.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-5">
      {/* Topic */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-400">
          Tema del Debate
        </label>
        <input
          type="text"
          className="input-detective w-full"
          placeholder="Ej: Es necesario preservar las lenguas indigenas en la educacion moderna?"
          value={topic}
          onChange={(e) => onChange({ ...config, topic: e.target.value })}
        />
      </div>

      {/* Pro Side */}
      <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
        <h4 className="mb-3 text-sm font-semibold text-green-400">Posicion A FAVOR</h4>
        <div className="mb-3">
          <label className="mb-1 block text-xs text-gray-500">Posicion</label>
          <input
            type="text"
            className="input-detective w-full text-sm"
            placeholder="Tesis a favor..."
            value={proPosition}
            onChange={(e) => onChange({ ...config, proPosition: e.target.value })}
          />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-xs text-gray-500">Argumentos ({proArguments.length})</label>
            <button
              type="button"
              onClick={() => addToList('proArguments', proArguments)}
              className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300"
            >
              <Plus className="h-3 w-3" /> Agregar
            </button>
          </div>
          {proArguments.map((arg, idx) => (
            <div key={idx} className="mb-1 flex items-center gap-2">
              <input
                type="text"
                className="input-detective flex-1 text-sm"
                placeholder={`Argumento ${idx + 1}`}
                value={arg}
                onChange={(e) => updateList('proArguments', proArguments, idx, e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeFromList('proArguments', proArguments, idx)}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Con Side */}
      <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
        <h4 className="mb-3 text-sm font-semibold text-red-400">Posicion EN CONTRA</h4>
        <div className="mb-3">
          <label className="mb-1 block text-xs text-gray-500">Posicion</label>
          <input
            type="text"
            className="input-detective w-full text-sm"
            placeholder="Tesis en contra..."
            value={conPosition}
            onChange={(e) => onChange({ ...config, conPosition: e.target.value })}
          />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-xs text-gray-500">Argumentos ({conArguments.length})</label>
            <button
              type="button"
              onClick={() => addToList('conArguments', conArguments)}
              className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
            >
              <Plus className="h-3 w-3" /> Agregar
            </button>
          </div>
          {conArguments.map((arg, idx) => (
            <div key={idx} className="mb-1 flex items-center gap-2">
              <input
                type="text"
                className="input-detective flex-1 text-sm"
                placeholder={`Argumento ${idx + 1}`}
                value={arg}
                onChange={(e) => updateList('conArguments', conArguments, idx, e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeFromList('conArguments', conArguments, idx)}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Expected Conclusions */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-400">
            Conclusiones Esperadas ({expectedConclusions.length})
          </label>
          <button
            type="button"
            onClick={() => addToList('expectedConclusions', expectedConclusions)}
            className="flex items-center gap-1 rounded-lg bg-detective-orange/20 px-3 py-1.5 text-sm text-detective-orange hover:bg-detective-orange/30"
          >
            <Plus className="h-4 w-4" /> Agregar
          </button>
        </div>
        {expectedConclusions.map((c, idx) => (
          <div key={idx} className="mb-1 flex items-center gap-2">
            <input
              type="text"
              className="input-detective flex-1 text-sm"
              placeholder={`Conclusion ${idx + 1}`}
              value={c}
              onChange={(e) => updateList('expectedConclusions', expectedConclusions, idx, e.target.value)}
            />
            <button
              type="button"
              onClick={() => removeFromList('expectedConclusions', expectedConclusions, idx)}
              className="text-red-400 hover:text-red-300"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DebateDigitalConfig;
