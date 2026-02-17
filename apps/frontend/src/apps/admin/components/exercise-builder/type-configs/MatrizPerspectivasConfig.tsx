import { Plus, Trash2 } from 'lucide-react';

interface Perspective {
  id: string;
  name: string;
  viewpoint: string;
  keyArguments: string[];
}

interface TypeConfigProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function MatrizPerspectivasConfig({ config, onChange }: TypeConfigProps) {
  const topic = (config.topic as string) || '';
  const perspectives = (config.perspectives as Perspective[]) || [];
  const analysisCriteria = (config.analysisCriteria as string[]) || [];

  /* --- Perspectives --- */
  const addPerspective = () => {
    const p: Perspective = {
      id: `persp-${Date.now()}`,
      name: '',
      viewpoint: '',
      keyArguments: [''],
    };
    onChange({ ...config, perspectives: [...perspectives, p] });
  };

  const updatePerspective = (idx: number, field: string, value: unknown) => {
    const updated = perspectives.map((p, i) => (i === idx ? { ...p, [field]: value } : p));
    onChange({ ...config, perspectives: updated });
  };

  const removePerspective = (idx: number) => {
    onChange({ ...config, perspectives: perspectives.filter((_, i) => i !== idx) });
  };

  const addArgument = (pIdx: number) => {
    const updated = perspectives.map((p, i) =>
      i === pIdx ? { ...p, keyArguments: [...p.keyArguments, ''] } : p
    );
    onChange({ ...config, perspectives: updated });
  };

  const updateArgument = (pIdx: number, aIdx: number, value: string) => {
    const updated = perspectives.map((p, i) => {
      if (i !== pIdx) return p;
      const args = p.keyArguments.map((a, j) => (j === aIdx ? value : a));
      return { ...p, keyArguments: args };
    });
    onChange({ ...config, perspectives: updated });
  };

  const removeArgument = (pIdx: number, aIdx: number) => {
    const updated = perspectives.map((p, i) => {
      if (i !== pIdx) return p;
      return { ...p, keyArguments: p.keyArguments.filter((_, j) => j !== aIdx) };
    });
    onChange({ ...config, perspectives: updated });
  };

  /* --- Criteria --- */
  const addCriterion = () => onChange({ ...config, analysisCriteria: [...analysisCriteria, ''] });
  const updateCriterion = (idx: number, value: string) => {
    const updated = analysisCriteria.map((c, i) => (i === idx ? value : c));
    onChange({ ...config, analysisCriteria: updated });
  };
  const removeCriterion = (idx: number) => {
    onChange({ ...config, analysisCriteria: analysisCriteria.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-5">
      {/* Topic */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-400">Tema</label>
        <input
          type="text"
          className="input-detective w-full"
          placeholder="Ej: Impacto del turismo en sitios arqueologicos mayas"
          value={topic}
          onChange={(e) => onChange({ ...config, topic: e.target.value })}
        />
      </div>

      {/* Perspectives */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-400">
            Perspectivas ({perspectives.length})
          </label>
          <button
            type="button"
            onClick={addPerspective}
            className="flex items-center gap-1 rounded-lg bg-detective-orange/20 px-3 py-1.5 text-sm text-detective-orange hover:bg-detective-orange/30"
          >
            <Plus className="h-4 w-4" /> Agregar Perspectiva
          </button>
        </div>

        <div className="space-y-3">
          {perspectives.map((persp, idx) => (
            <div key={persp.id} className="rounded-lg border border-gray-700 bg-gray-800/30 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-detective-orange">
                  Perspectiva #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removePerspective(idx)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Nombre / Rol</label>
                  <input
                    type="text"
                    className="input-detective w-full text-sm"
                    placeholder="Ej: Historiador"
                    value={persp.name}
                    onChange={(e) => updatePerspective(idx, 'name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Punto de Vista</label>
                  <input
                    type="text"
                    className="input-detective w-full text-sm"
                    placeholder="Posicion general..."
                    value={persp.viewpoint}
                    onChange={(e) => updatePerspective(idx, 'viewpoint', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Argumentos Clave</label>
                {persp.keyArguments.map((arg, ai) => (
                  <div key={ai} className="mb-1 flex items-center gap-2">
                    <input
                      type="text"
                      className="input-detective flex-1 text-sm"
                      placeholder={`Argumento ${ai + 1}`}
                      value={arg}
                      onChange={(e) => updateArgument(idx, ai, e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => removeArgument(idx, ai)}
                      className="text-red-400 hover:text-red-300"
                      disabled={persp.keyArguments.length <= 1}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArgument(idx)}
                  className="mt-1 flex items-center gap-1 text-xs text-gray-400 hover:text-detective-orange"
                >
                  <Plus className="h-3 w-3" /> Agregar argumento
                </button>
              </div>
            </div>
          ))}
          {perspectives.length === 0 && (
            <p className="rounded-lg bg-gray-800/30 p-4 text-center text-sm text-gray-500">
              Agrega perspectivas para la matriz.
            </p>
          )}
        </div>
      </div>

      {/* Analysis Criteria */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-400">
            Criterios de Analisis ({analysisCriteria.length})
          </label>
          <button
            type="button"
            onClick={addCriterion}
            className="flex items-center gap-1 rounded-lg bg-detective-orange/20 px-3 py-1.5 text-sm text-detective-orange hover:bg-detective-orange/30"
          >
            <Plus className="h-4 w-4" /> Agregar
          </button>
        </div>
        {analysisCriteria.map((c, idx) => (
          <div key={idx} className="mb-1 flex items-center gap-2">
            <input
              type="text"
              className="input-detective flex-1 text-sm"
              placeholder="Ej: Uso de evidencia"
              value={c}
              onChange={(e) => updateCriterion(idx, e.target.value)}
            />
            <button
              type="button"
              onClick={() => removeCriterion(idx)}
              className="text-red-400 hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MatrizPerspectivasConfig;
