import { Plus, Trash2 } from 'lucide-react';

interface CrucigramaWord {
  id: string;
  answer: string;
  clue: string;
  direction: 'across' | 'down';
  row: number;
  col: number;
}

interface TypeConfigProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function CrucigramaConfig({ config, onChange }: TypeConfigProps) {
  const rows = (config.rows as number) || 10;
  const cols = (config.cols as number) || 10;
  const words = (config.words as CrucigramaWord[]) || [];

  const updateGrid = (field: string, value: number) => {
    onChange({ ...config, [field]: Math.max(5, Math.min(20, value)) });
  };

  const addWord = () => {
    const newWord: CrucigramaWord = {
      id: `word-${Date.now()}`,
      answer: '',
      clue: '',
      direction: 'across',
      row: 0,
      col: 0,
    };
    onChange({ ...config, words: [...words, newWord] });
  };

  const updateWord = (idx: number, field: string, value: unknown) => {
    const updated = words.map((w, i) => (i === idx ? { ...w, [field]: value } : w));
    onChange({ ...config, words: updated });
  };

  const removeWord = (idx: number) => {
    onChange({ ...config, words: words.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-5">
      {/* Grid Size */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-400">
          Tamano de la Cuadricula
        </label>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Filas:</span>
            <input
              type="number"
              className="input-detective w-20 text-sm"
              min={5}
              max={20}
              value={rows}
              onChange={(e) => updateGrid('rows', parseInt(e.target.value) || 10)}
            />
          </div>
          <span className="text-gray-500">x</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Columnas:</span>
            <input
              type="number"
              className="input-detective w-20 text-sm"
              min={5}
              max={20}
              value={cols}
              onChange={(e) => updateGrid('cols', parseInt(e.target.value) || 10)}
            />
          </div>
        </div>
      </div>

      {/* Words List */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-400">
            Palabras ({words.length})
          </label>
          <button
            type="button"
            onClick={addWord}
            className="flex items-center gap-1 rounded-lg bg-detective-orange/20 px-3 py-1.5 text-sm text-detective-orange hover:bg-detective-orange/30"
          >
            <Plus className="h-4 w-4" /> Agregar Palabra
          </button>
        </div>

        <div className="space-y-3">
          {words.map((word, idx) => (
            <div key={word.id} className="rounded-lg border border-gray-700 bg-gray-800/30 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-detective-orange">
                  Palabra #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeWord(idx)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Respuesta</label>
                  <input
                    type="text"
                    className="input-detective w-full text-sm uppercase"
                    placeholder="PALABRA"
                    value={word.answer}
                    onChange={(e) => updateWord(idx, 'answer', e.target.value.toUpperCase())}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Pista</label>
                  <input
                    type="text"
                    className="input-detective w-full text-sm"
                    placeholder="Pista para esta palabra..."
                    value={word.clue}
                    onChange={(e) => updateWord(idx, 'clue', e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Direccion</label>
                  <select
                    className="input-detective w-full text-sm"
                    value={word.direction}
                    onChange={(e) => updateWord(idx, 'direction', e.target.value)}
                  >
                    <option value="across">Horizontal</option>
                    <option value="down">Vertical</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="mb-1 block text-xs text-gray-500">Fila</label>
                    <input
                      type="number"
                      className="input-detective w-full text-sm"
                      min={0}
                      max={rows - 1}
                      value={word.row}
                      onChange={(e) => updateWord(idx, 'row', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="mb-1 block text-xs text-gray-500">Columna</label>
                    <input
                      type="number"
                      className="input-detective w-full text-sm"
                      min={0}
                      max={cols - 1}
                      value={word.col}
                      onChange={(e) => updateWord(idx, 'col', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {words.length === 0 && (
          <p className="rounded-lg bg-gray-800/30 p-4 text-center text-sm text-gray-500">
            Agrega palabras para construir el crucigrama.
          </p>
        )}
      </div>
    </div>
  );
}

export default CrucigramaConfig;
