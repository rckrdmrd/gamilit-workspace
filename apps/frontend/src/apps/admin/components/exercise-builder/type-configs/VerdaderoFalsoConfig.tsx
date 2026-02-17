import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@shared/utils/cn';

interface Statement {
  id: string;
  text: string;
  isTrue: boolean;
  explanation: string;
}

interface TypeConfigProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function VerdaderoFalsoConfig({ config, onChange }: TypeConfigProps) {
  const statements = (config.statements as Statement[]) || [];

  const addStatement = () => {
    const newStatement: Statement = {
      id: `stmt-${Date.now()}`,
      text: '',
      isTrue: true,
      explanation: '',
    };
    onChange({ ...config, statements: [...statements, newStatement] });
  };

  const updateStatement = (idx: number, field: string, value: unknown) => {
    const updated = statements.map((s, i) => (i === idx ? { ...s, [field]: value } : s));
    onChange({ ...config, statements: updated });
  };

  const removeStatement = (idx: number) => {
    onChange({ ...config, statements: statements.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-400">
            Afirmaciones ({statements.length})
          </label>
          <button
            type="button"
            onClick={addStatement}
            className="flex items-center gap-1 rounded-lg bg-detective-orange/20 px-3 py-1.5 text-sm text-detective-orange hover:bg-detective-orange/30"
          >
            <Plus className="h-4 w-4" /> Agregar Afirmacion
          </button>
        </div>

        <div className="space-y-3">
          {statements.map((stmt, idx) => (
            <div key={stmt.id} className="rounded-lg border border-gray-700 bg-gray-800/30 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-detective-orange">
                  Afirmacion #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeStatement(idx)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mb-2">
                <label className="mb-1 block text-xs text-gray-500">Texto</label>
                <input
                  type="text"
                  className="input-detective w-full text-sm"
                  placeholder="Escribe la afirmacion..."
                  value={stmt.text}
                  onChange={(e) => updateStatement(idx, 'text', e.target.value)}
                />
              </div>
              <div className="mb-2">
                <label className="mb-1 block text-xs text-gray-500">Respuesta Correcta</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => updateStatement(idx, 'isTrue', true)}
                    className={cn(
                      'rounded-lg px-4 py-1.5 text-sm font-medium transition-colors',
                      stmt.isTrue
                        ? 'bg-green-500/20 text-green-400 ring-1 ring-green-500'
                        : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
                    )}
                  >
                    Verdadero
                  </button>
                  <button
                    type="button"
                    onClick={() => updateStatement(idx, 'isTrue', false)}
                    className={cn(
                      'rounded-lg px-4 py-1.5 text-sm font-medium transition-colors',
                      !stmt.isTrue
                        ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500'
                        : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
                    )}
                  >
                    Falso
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Explicacion</label>
                <input
                  type="text"
                  className="input-detective w-full text-sm"
                  placeholder="Explica por que es verdadero o falso..."
                  value={stmt.explanation}
                  onChange={(e) => updateStatement(idx, 'explanation', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        {statements.length === 0 && (
          <p className="rounded-lg bg-gray-800/30 p-4 text-center text-sm text-gray-500">
            Agrega afirmaciones para el ejercicio de verdadero o falso.
          </p>
        )}
      </div>
    </div>
  );
}

export default VerdaderoFalsoConfig;
