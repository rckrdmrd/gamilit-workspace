import { Plus, Trash2 } from 'lucide-react';

interface RubricCriterion {
  id: string;
  name: string;
  maxScore: number;
}

interface TypeConfigProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function PodcastArgumentativoConfig({ config, onChange }: TypeConfigProps) {
  const topic = (config.topic as string) || '';
  const thesis = (config.thesis as string) || '';
  const introduction = (config.introduction as string) || '';
  const mainArguments = (config.mainArguments as string[]) || [];
  const counterarguments = (config.counterarguments as string[]) || [];
  const conclusion = (config.conclusion as string) || '';
  const rubric = (config.rubric as RubricCriterion[]) || [];

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

  /* --- Rubric --- */
  const addRubricCriterion = () => {
    const r: RubricCriterion = { id: `rub-${Date.now()}`, name: '', maxScore: 10 };
    onChange({ ...config, rubric: [...rubric, r] });
  };

  const updateRubric = (idx: number, field: string, value: unknown) => {
    const updated = rubric.map((r, i) => (i === idx ? { ...r, [field]: value } : r));
    onChange({ ...config, rubric: updated });
  };

  const removeRubric = (idx: number) => {
    onChange({ ...config, rubric: rubric.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-5">
      {/* Topic & Thesis */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-400">Tema</label>
          <input
            type="text"
            className="input-detective w-full"
            placeholder="Tema del podcast..."
            value={topic}
            onChange={(e) => onChange({ ...config, topic: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-400">Tesis</label>
          <input
            type="text"
            className="input-detective w-full"
            placeholder="Declaracion de tesis principal..."
            value={thesis}
            onChange={(e) => onChange({ ...config, thesis: e.target.value })}
          />
        </div>
      </div>

      {/* Argument Structure */}
      <div className="rounded-lg border border-gray-700 bg-gray-800/20 p-4">
        <h4 className="mb-3 text-sm font-semibold text-detective-orange">
          Estructura Argumentativa
        </h4>

        {/* Introduction */}
        <div className="mb-3">
          <label className="mb-1 block text-xs text-gray-500">Introduccion</label>
          <textarea
            className="input-detective w-full text-sm"
            rows={2}
            placeholder="Como debe comenzar el podcast..."
            value={introduction}
            onChange={(e) => onChange({ ...config, introduction: e.target.value })}
          />
        </div>

        {/* Main Arguments */}
        <div className="mb-3">
          <div className="mb-1 flex items-center justify-between">
            <label className="text-xs text-gray-500">
              Argumentos Principales ({mainArguments.length})
            </label>
            <button
              type="button"
              onClick={() => addToList('mainArguments', mainArguments)}
              className="flex items-center gap-1 text-xs text-detective-orange hover:text-orange-300"
            >
              <Plus className="h-3 w-3" /> Agregar
            </button>
          </div>
          {mainArguments.map((arg, idx) => (
            <div key={idx} className="mb-1 flex items-center gap-2">
              <input
                type="text"
                className="input-detective flex-1 text-sm"
                placeholder={`Argumento ${idx + 1}`}
                value={arg}
                onChange={(e) => updateList('mainArguments', mainArguments, idx, e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeFromList('mainArguments', mainArguments, idx)}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Counterarguments */}
        <div className="mb-3">
          <div className="mb-1 flex items-center justify-between">
            <label className="text-xs text-gray-500">
              Contraargumentos ({counterarguments.length})
            </label>
            <button
              type="button"
              onClick={() => addToList('counterarguments', counterarguments)}
              className="flex items-center gap-1 text-xs text-detective-orange hover:text-orange-300"
            >
              <Plus className="h-3 w-3" /> Agregar
            </button>
          </div>
          {counterarguments.map((arg, idx) => (
            <div key={idx} className="mb-1 flex items-center gap-2">
              <input
                type="text"
                className="input-detective flex-1 text-sm"
                placeholder={`Contraargumento ${idx + 1}`}
                value={arg}
                onChange={(e) =>
                  updateList('counterarguments', counterarguments, idx, e.target.value)
                }
              />
              <button
                type="button"
                onClick={() => removeFromList('counterarguments', counterarguments, idx)}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Conclusion */}
        <div>
          <label className="mb-1 block text-xs text-gray-500">Conclusion</label>
          <textarea
            className="input-detective w-full text-sm"
            rows={2}
            placeholder="Como debe cerrar el podcast..."
            value={conclusion}
            onChange={(e) => onChange({ ...config, conclusion: e.target.value })}
          />
        </div>
      </div>

      {/* Rubric */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-400">
            Rubrica ({rubric.length})
          </label>
          <button
            type="button"
            onClick={addRubricCriterion}
            className="flex items-center gap-1 rounded-lg bg-detective-orange/20 px-3 py-1.5 text-sm text-detective-orange hover:bg-detective-orange/30"
          >
            <Plus className="h-4 w-4" /> Agregar Criterio
          </button>
        </div>
        <div className="space-y-2">
          {rubric.map((r, idx) => (
            <div key={r.id} className="flex items-center gap-3">
              <input
                type="text"
                className="input-detective flex-1 text-sm"
                placeholder="Nombre del criterio"
                value={r.name}
                onChange={(e) => updateRubric(idx, 'name', e.target.value)}
              />
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">Max:</span>
                <input
                  type="number"
                  className="input-detective w-16 text-sm"
                  min={1}
                  max={100}
                  value={r.maxScore}
                  onChange={(e) =>
                    updateRubric(idx, 'maxScore', parseInt(e.target.value) || 10)
                  }
                />
              </div>
              <button
                type="button"
                onClick={() => removeRubric(idx)}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        {rubric.length === 0 && (
          <p className="rounded-lg bg-gray-800/30 p-4 text-center text-sm text-gray-500">
            Agrega criterios para la rubrica de evaluacion.
          </p>
        )}
      </div>
    </div>
  );
}

export default PodcastArgumentativoConfig;
