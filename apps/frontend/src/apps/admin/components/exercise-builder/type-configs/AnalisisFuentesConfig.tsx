import { Plus, Trash2, FileText } from 'lucide-react';

interface Source {
  id: string;
  title: string;
  author: string;
  excerpt: string;
  credibilityFactors: string[];
}

interface SourceQuestion {
  id: string;
  question: string;
  answer: string;
}

interface TypeConfigProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function AnalisisFuentesConfig({ config, onChange }: TypeConfigProps) {
  const sources = (config.sources as Source[]) || [];
  const criteria = (config.criteria as string[]) || [];
  const questions = (config.questions as SourceQuestion[]) || [];

  /* --- Sources --- */
  const addSource = () => {
    const s: Source = {
      id: `src-${Date.now()}`,
      title: '',
      author: '',
      excerpt: '',
      credibilityFactors: [''],
    };
    onChange({ ...config, sources: [...sources, s] });
  };

  const updateSource = (idx: number, field: string, value: unknown) => {
    const updated = sources.map((s, i) => (i === idx ? { ...s, [field]: value } : s));
    onChange({ ...config, sources: updated });
  };

  const removeSource = (idx: number) => {
    onChange({ ...config, sources: sources.filter((_, i) => i !== idx) });
  };

  const addCredFactor = (srcIdx: number) => {
    const updated = sources.map((s, i) =>
      i === srcIdx ? { ...s, credibilityFactors: [...s.credibilityFactors, ''] } : s
    );
    onChange({ ...config, sources: updated });
  };

  const updateCredFactor = (srcIdx: number, fIdx: number, value: string) => {
    const updated = sources.map((s, i) => {
      if (i !== srcIdx) return s;
      const factors = s.credibilityFactors.map((f, j) => (j === fIdx ? value : f));
      return { ...s, credibilityFactors: factors };
    });
    onChange({ ...config, sources: updated });
  };

  const removeCredFactor = (srcIdx: number, fIdx: number) => {
    const updated = sources.map((s, i) => {
      if (i !== srcIdx) return s;
      return { ...s, credibilityFactors: s.credibilityFactors.filter((_, j) => j !== fIdx) };
    });
    onChange({ ...config, sources: updated });
  };

  /* --- Criteria --- */
  const addCriterion = () => onChange({ ...config, criteria: [...criteria, ''] });
  const updateCriterion = (idx: number, value: string) => {
    const updated = criteria.map((c, i) => (i === idx ? value : c));
    onChange({ ...config, criteria: updated });
  };
  const removeCriterion = (idx: number) => {
    onChange({ ...config, criteria: criteria.filter((_, i) => i !== idx) });
  };

  /* --- Questions --- */
  const addQuestion = () => {
    const q: SourceQuestion = { id: `q-${Date.now()}`, question: '', answer: '' };
    onChange({ ...config, questions: [...questions, q] });
  };
  const updateQuestion = (idx: number, field: string, value: string) => {
    const updated = questions.map((q, i) => (i === idx ? { ...q, [field]: value } : q));
    onChange({ ...config, questions: updated });
  };
  const removeQuestion = (idx: number) => {
    onChange({ ...config, questions: questions.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-5">
      {/* Sources */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="flex items-center gap-1 text-sm font-medium text-gray-400">
            <FileText className="h-4 w-4" /> Fuentes ({sources.length})
          </label>
          <button type="button" onClick={addSource} className="flex items-center gap-1 rounded-lg bg-detective-orange/20 px-3 py-1.5 text-sm text-detective-orange hover:bg-detective-orange/30">
            <Plus className="h-4 w-4" /> Agregar Fuente
          </button>
        </div>
        <div className="space-y-3">
          {sources.map((src, idx) => (
            <div key={src.id} className="rounded-lg border border-gray-700 bg-gray-800/30 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-detective-orange">Fuente #{idx + 1}</span>
                <button type="button" onClick={() => removeSource(idx)} className="text-red-400 hover:text-red-300">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Titulo</label>
                  <input type="text" className="input-detective w-full text-sm" placeholder="Titulo de la fuente" value={src.title} onChange={(e) => updateSource(idx, 'title', e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Autor</label>
                  <input type="text" className="input-detective w-full text-sm" placeholder="Nombre del autor" value={src.author} onChange={(e) => updateSource(idx, 'author', e.target.value)} />
                </div>
              </div>
              <div className="mb-2">
                <label className="mb-1 block text-xs text-gray-500">Extracto</label>
                <textarea className="input-detective w-full text-sm" rows={3} placeholder="Texto de la fuente..." value={src.excerpt} onChange={(e) => updateSource(idx, 'excerpt', e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">Factores de Credibilidad</label>
                {src.credibilityFactors.map((f, fi) => (
                  <div key={fi} className="mb-1 flex items-center gap-2">
                    <input type="text" className="input-detective flex-1 text-sm" placeholder={`Factor ${fi + 1}`} value={f} onChange={(e) => updateCredFactor(idx, fi, e.target.value)} />
                    <button type="button" onClick={() => removeCredFactor(idx, fi)} className="text-red-400 hover:text-red-300" disabled={src.credibilityFactors.length <= 1}>
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => addCredFactor(idx)} className="mt-1 flex items-center gap-1 text-xs text-gray-400 hover:text-detective-orange">
                  <Plus className="h-3 w-3" /> Agregar factor
                </button>
              </div>
            </div>
          ))}
          {sources.length === 0 && (
            <p className="rounded-lg bg-gray-800/30 p-4 text-center text-sm text-gray-500">Agrega fuentes para analizar.</p>
          )}
        </div>
      </div>

      {/* Evaluation Criteria */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-400">Criterios de Evaluacion ({criteria.length})</label>
          <button type="button" onClick={addCriterion} className="flex items-center gap-1 rounded-lg bg-detective-orange/20 px-3 py-1.5 text-sm text-detective-orange hover:bg-detective-orange/30">
            <Plus className="h-4 w-4" /> Agregar
          </button>
        </div>
        <div className="space-y-1">
          {criteria.map((c, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input type="text" className="input-detective flex-1 text-sm" placeholder="Ej: Fuente primaria vs secundaria" value={c} onChange={(e) => updateCriterion(idx, e.target.value)} />
              <button type="button" onClick={() => removeCriterion(idx)} className="text-red-400 hover:text-red-300">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Questions */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-400">Preguntas de Comparacion ({questions.length})</label>
          <button type="button" onClick={addQuestion} className="flex items-center gap-1 rounded-lg bg-detective-orange/20 px-3 py-1.5 text-sm text-detective-orange hover:bg-detective-orange/30">
            <Plus className="h-4 w-4" /> Agregar
          </button>
        </div>
        <div className="space-y-2">
          {questions.map((q, idx) => (
            <div key={q.id} className="grid grid-cols-1 gap-2 rounded-lg border border-gray-700 bg-gray-800/30 p-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-gray-500">Pregunta</label>
                <input type="text" className="input-detective w-full text-sm" placeholder="Pregunta..." value={q.question} onChange={(e) => updateQuestion(idx, 'question', e.target.value)} />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-gray-500">Respuesta</label>
                  <input type="text" className="input-detective w-full text-sm" placeholder="Respuesta..." value={q.answer} onChange={(e) => updateQuestion(idx, 'answer', e.target.value)} />
                </div>
                <button type="button" onClick={() => removeQuestion(idx)} className="mb-1 text-red-400 hover:text-red-300">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AnalisisFuentesConfig;
