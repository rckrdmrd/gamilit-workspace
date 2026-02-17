import { Plus, Trash2, MousePointerClick } from 'lucide-react';
import { cn } from '@shared/utils/cn';

interface BlankItem {
  id: string;
  correctAnswer: string;
  distractors: string[];
}

interface TypeConfigProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function CompletarEspaciosConfig({ config, onChange }: TypeConfigProps) {
  const passage = (config.passage as string) || '';
  const blanks = (config.blanks as BlankItem[]) || [];

  const updatePassage = (text: string) => {
    onChange({ ...config, passage: text });
  };

  const markAsBlank = () => {
    const textarea = document.getElementById('passage-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start === end) return;

    const selected = passage.substring(start, end);
    const before = passage.substring(0, start);
    const after = passage.substring(end);
    const newPassage = `${before}{{${selected}}}${after}`;

    const newBlank: BlankItem = {
      id: `blank-${Date.now()}`,
      correctAnswer: selected,
      distractors: [''],
    };

    onChange({ ...config, passage: newPassage, blanks: [...blanks, newBlank] });
  };

  const updateBlank = (idx: number, field: string, value: unknown) => {
    const updated = blanks.map((b, i) => (i === idx ? { ...b, [field]: value } : b));
    onChange({ ...config, blanks: updated });
  };

  const addDistractor = (blankIdx: number) => {
    const updated = blanks.map((b, i) =>
      i === blankIdx ? { ...b, distractors: [...b.distractors, ''] } : b
    );
    onChange({ ...config, blanks: updated });
  };

  const updateDistractor = (blankIdx: number, distIdx: number, value: string) => {
    const updated = blanks.map((b, i) => {
      if (i !== blankIdx) return b;
      const dists = b.distractors.map((d, j) => (j === distIdx ? value : d));
      return { ...b, distractors: dists };
    });
    onChange({ ...config, blanks: updated });
  };

  const removeDistractor = (blankIdx: number, distIdx: number) => {
    const updated = blanks.map((b, i) => {
      if (i !== blankIdx) return b;
      return { ...b, distractors: b.distractors.filter((_, j) => j !== distIdx) };
    });
    onChange({ ...config, blanks: updated });
  };

  const removeBlank = (idx: number) => {
    onChange({ ...config, blanks: blanks.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-5">
      {/* Passage */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-400">
          Texto del Pasaje
        </label>
        <textarea
          id="passage-textarea"
          className="input-detective w-full font-mono text-sm"
          rows={6}
          placeholder="Escribe el texto aqui. Selecciona palabras y haz clic en 'Marcar como espacio' para crear blancos."
          value={passage}
          onChange={(e) => updatePassage(e.target.value)}
        />
        <button
          type="button"
          onClick={markAsBlank}
          className="mt-2 flex items-center gap-1 rounded-lg bg-detective-orange/20 px-3 py-1.5 text-sm text-detective-orange transition-colors hover:bg-detective-orange/30"
        >
          <MousePointerClick className="h-4 w-4" />
          Marcar seleccion como espacio
        </button>
      </div>

      {/* Preview */}
      {passage && (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-400">Vista Previa</label>
          <div className="rounded-lg bg-gray-800/50 p-3 text-sm text-gray-300">
            {passage.split(/(\{\{.*?\}\})/).map((part, i) => {
              if (part.startsWith('{{') && part.endsWith('}}')) {
                return (
                  <span
                    key={i}
                    className="mx-1 inline-block min-w-[60px] border-b-2 border-detective-orange text-center text-detective-orange"
                  >
                    ____
                  </span>
                );
              }
              return <span key={i}>{part}</span>;
            })}
          </div>
        </div>
      )}

      {/* Blanks Configuration */}
      {blanks.length > 0 && (
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-400">
            Espacios ({blanks.length})
          </label>
          <div className="space-y-3">
            {blanks.map((blank, idx) => (
              <div key={blank.id} className="rounded-lg border border-gray-700 bg-gray-800/30 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-detective-orange">
                    Espacio #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeBlank(idx)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mb-2">
                  <label className="mb-1 block text-xs text-gray-500">Respuesta Correcta</label>
                  <input
                    type="text"
                    className="input-detective w-full text-sm"
                    value={blank.correctAnswer}
                    onChange={(e) => updateBlank(idx, 'correctAnswer', e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Distractores</label>
                  {blank.distractors.map((dist, di) => (
                    <div key={di} className="mb-1 flex items-center gap-2">
                      <input
                        type="text"
                        className="input-detective flex-1 text-sm"
                        placeholder={`Distractor ${di + 1}`}
                        value={dist}
                        onChange={(e) => updateDistractor(idx, di, e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => removeDistractor(idx, di)}
                        className={cn(
                          'text-red-400 hover:text-red-300',
                          blank.distractors.length <= 1 && 'invisible'
                        )}
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
        </div>
      )}
    </div>
  );
}

export default CompletarEspaciosConfig;
