import { Plus, Trash2, Scale } from 'lucide-react';

interface EvidenceItem {
  id: string;
  text: string;
  tags: string[];
}

interface TypeConfigProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function TribunalOpinionesConfig({ config, onChange }: TypeConfigProps) {
  const caseDescription = (config.caseDescription as string) || '';
  const prosecution = (config.prosecution as string) || '';
  const defense = (config.defense as string) || '';
  const evidence = (config.evidence as EvidenceItem[]) || [];
  const verdictCriteria = (config.verdictCriteria as string[]) || [];

  /* --- Evidence --- */
  const addEvidence = () => {
    const e: EvidenceItem = { id: `ev-${Date.now()}`, text: '', tags: [''] };
    onChange({ ...config, evidence: [...evidence, e] });
  };

  const updateEvidence = (idx: number, field: string, value: unknown) => {
    const updated = evidence.map((e, i) => (i === idx ? { ...e, [field]: value } : e));
    onChange({ ...config, evidence: updated });
  };

  const removeEvidence = (idx: number) => {
    onChange({ ...config, evidence: evidence.filter((_, i) => i !== idx) });
  };

  const addTag = (evIdx: number) => {
    const updated = evidence.map((e, i) =>
      i === evIdx ? { ...e, tags: [...e.tags, ''] } : e
    );
    onChange({ ...config, evidence: updated });
  };

  const updateTag = (evIdx: number, tIdx: number, value: string) => {
    const updated = evidence.map((e, i) => {
      if (i !== evIdx) return e;
      const tags = e.tags.map((t, j) => (j === tIdx ? value : t));
      return { ...e, tags };
    });
    onChange({ ...config, evidence: updated });
  };

  const removeTag = (evIdx: number, tIdx: number) => {
    const updated = evidence.map((e, i) => {
      if (i !== evIdx) return e;
      return { ...e, tags: e.tags.filter((_, j) => j !== tIdx) };
    });
    onChange({ ...config, evidence: updated });
  };

  /* --- Verdict Criteria --- */
  const addCriterion = () => {
    onChange({ ...config, verdictCriteria: [...verdictCriteria, ''] });
  };

  const updateCriterion = (idx: number, value: string) => {
    const updated = verdictCriteria.map((c, i) => (i === idx ? value : c));
    onChange({ ...config, verdictCriteria: updated });
  };

  const removeCriterion = (idx: number) => {
    onChange({ ...config, verdictCriteria: verdictCriteria.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-5">
      {/* Case Description */}
      <div>
        <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-400">
          <Scale className="h-4 w-4" /> Descripcion del Caso
        </label>
        <textarea
          className="input-detective w-full text-sm"
          rows={4}
          placeholder="Describe el caso que el estudiante debe juzgar..."
          value={caseDescription}
          onChange={(e) => onChange({ ...config, caseDescription: e.target.value })}
        />
      </div>

      {/* Positions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-3">
          <label className="mb-1 block text-sm font-semibold text-blue-400">
            Posicion de Acusacion
          </label>
          <textarea
            className="input-detective w-full text-sm"
            rows={3}
            placeholder="Argumentos de la acusacion..."
            value={prosecution}
            onChange={(e) => onChange({ ...config, prosecution: e.target.value })}
          />
        </div>
        <div className="rounded-lg border border-purple-500/30 bg-purple-500/5 p-3">
          <label className="mb-1 block text-sm font-semibold text-purple-400">
            Posicion de Defensa
          </label>
          <textarea
            className="input-detective w-full text-sm"
            rows={3}
            placeholder="Argumentos de la defensa..."
            value={defense}
            onChange={(e) => onChange({ ...config, defense: e.target.value })}
          />
        </div>
      </div>

      {/* Evidence Items */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-400">
            Evidencia ({evidence.length})
          </label>
          <button
            type="button"
            onClick={addEvidence}
            className="flex items-center gap-1 rounded-lg bg-detective-orange/20 px-3 py-1.5 text-sm text-detective-orange hover:bg-detective-orange/30"
          >
            <Plus className="h-4 w-4" /> Agregar Evidencia
          </button>
        </div>
        <div className="space-y-3">
          {evidence.map((ev, idx) => (
            <div key={ev.id} className="rounded-lg border border-gray-700 bg-gray-800/30 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-detective-orange">
                  Evidencia #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeEvidence(idx)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mb-2">
                <label className="mb-1 block text-xs text-gray-500">Texto</label>
                <textarea
                  className="input-detective w-full text-sm"
                  rows={2}
                  placeholder="Descripcion de la evidencia..."
                  value={ev.text}
                  onChange={(e) => updateEvidence(idx, 'text', e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Etiquetas</label>
                <div className="flex flex-wrap items-center gap-1">
                  {ev.tags.map((tag, ti) => (
                    <div key={ti} className="flex items-center gap-1">
                      <input
                        type="text"
                        className="input-detective w-28 text-xs"
                        placeholder="Etiqueta"
                        value={tag}
                        onChange={(e) => updateTag(idx, ti, e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => removeTag(idx, ti)}
                        className="text-red-400 hover:text-red-300"
                        disabled={ev.tags.length <= 1}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addTag(idx)}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-detective-orange"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {evidence.length === 0 && (
            <p className="rounded-lg bg-gray-800/30 p-4 text-center text-sm text-gray-500">
              Agrega evidencia para el tribunal.
            </p>
          )}
        </div>
      </div>

      {/* Verdict Criteria */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-400">
            Criterios de Veredicto ({verdictCriteria.length})
          </label>
          <button
            type="button"
            onClick={addCriterion}
            className="flex items-center gap-1 rounded-lg bg-detective-orange/20 px-3 py-1.5 text-sm text-detective-orange hover:bg-detective-orange/30"
          >
            <Plus className="h-4 w-4" /> Agregar
          </button>
        </div>
        {verdictCriteria.map((c, idx) => (
          <div key={idx} className="mb-1 flex items-center gap-2">
            <input
              type="text"
              className="input-detective flex-1 text-sm"
              placeholder={`Criterio ${idx + 1}`}
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

export default TribunalOpinionesConfig;
