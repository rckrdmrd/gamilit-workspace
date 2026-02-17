import { Plus, Trash2 } from 'lucide-react';

interface ContextPuzzle {
  id: string;
  sentence: string;
  targetWord: string;
  correctMeaning: string;
  distractors: string[];
}

interface TypeConfigProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function PuzzleContextoConfig({ config, onChange }: TypeConfigProps) {
  const puzzles = (config.puzzles as ContextPuzzle[]) || [];

  const addPuzzle = () => {
    const newP: ContextPuzzle = {
      id: `pz-${Date.now()}`,
      sentence: '',
      targetWord: '',
      correctMeaning: '',
      distractors: [''],
    };
    onChange({ ...config, puzzles: [...puzzles, newP] });
  };

  const updatePuzzle = (idx: number, field: string, value: unknown) => {
    const updated = puzzles.map((p, i) => (i === idx ? { ...p, [field]: value } : p));
    onChange({ ...config, puzzles: updated });
  };

  const removePuzzle = (idx: number) => {
    onChange({ ...config, puzzles: puzzles.filter((_, i) => i !== idx) });
  };

  const addDistractor = (pzIdx: number) => {
    const updated = puzzles.map((p, i) =>
      i === pzIdx ? { ...p, distractors: [...p.distractors, ''] } : p
    );
    onChange({ ...config, puzzles: updated });
  };

  const updateDistractor = (pzIdx: number, dIdx: number, value: string) => {
    const updated = puzzles.map((p, i) => {
      if (i !== pzIdx) return p;
      const dists = p.distractors.map((d, j) => (j === dIdx ? value : d));
      return { ...p, distractors: dists };
    });
    onChange({ ...config, puzzles: updated });
  };

  const removeDistractor = (pzIdx: number, dIdx: number) => {
    const updated = puzzles.map((p, i) => {
      if (i !== pzIdx) return p;
      return { ...p, distractors: p.distractors.filter((_, j) => j !== dIdx) };
    });
    onChange({ ...config, puzzles: updated });
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-400">
            Oraciones con Palabras Clave ({puzzles.length})
          </label>
          <button
            type="button"
            onClick={addPuzzle}
            className="flex items-center gap-1 rounded-lg bg-detective-orange/20 px-3 py-1.5 text-sm text-detective-orange hover:bg-detective-orange/30"
          >
            <Plus className="h-4 w-4" /> Agregar Oracion
          </button>
        </div>

        <div className="space-y-3">
          {puzzles.map((pz, idx) => (
            <div key={pz.id} className="rounded-lg border border-gray-700 bg-gray-800/30 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-detective-orange">
                  Oracion #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removePuzzle(idx)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mb-2">
                <label className="mb-1 block text-xs text-gray-500">Oracion</label>
                <input
                  type="text"
                  className="input-detective w-full text-sm"
                  placeholder="La oracion que contiene la palabra clave..."
                  value={pz.sentence}
                  onChange={(e) => updatePuzzle(idx, 'sentence', e.target.value)}
                />
              </div>
              <div className="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Palabra Objetivo</label>
                  <input
                    type="text"
                    className="input-detective w-full text-sm"
                    placeholder="Ej: efimero"
                    value={pz.targetWord}
                    onChange={(e) => updatePuzzle(idx, 'targetWord', e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Significado Correcto</label>
                  <input
                    type="text"
                    className="input-detective w-full text-sm"
                    placeholder="Que dura poco tiempo"
                    value={pz.correctMeaning}
                    onChange={(e) => updatePuzzle(idx, 'correctMeaning', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Distractores</label>
                {pz.distractors.map((dist, di) => (
                  <div key={di} className="mb-1 flex items-center gap-2">
                    <input
                      type="text"
                      className="input-detective flex-1 text-sm"
                      placeholder={`Significado incorrecto ${di + 1}`}
                      value={dist}
                      onChange={(e) => updateDistractor(idx, di, e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => removeDistractor(idx, di)}
                      className="text-red-400 hover:text-red-300"
                      disabled={pz.distractors.length <= 1}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addDistractor(idx)}
                  className="mt-1 flex items-center gap-1 text-xs text-gray-400 hover:text-detective-orange"
                >
                  <Plus className="h-3 w-3" /> Agregar distractor
                </button>
              </div>
            </div>
          ))}
        </div>

        {puzzles.length === 0 && (
          <p className="rounded-lg bg-gray-800/30 p-4 text-center text-sm text-gray-500">
            Agrega oraciones con palabras clave para descifrar por contexto.
          </p>
        )}
      </div>
    </div>
  );
}

export default PuzzleContextoConfig;
