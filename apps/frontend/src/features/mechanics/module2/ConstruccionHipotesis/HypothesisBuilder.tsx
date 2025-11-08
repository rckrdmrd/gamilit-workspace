import React from 'react';
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import type { Variable, Hypothesis } from './construccionHipotesisTypes';

interface HypothesisBuilderProps {
  hypothesis: Partial<Hypothesis>;
  onUpdate: (hypothesis: Partial<Hypothesis>) => void;
}

export const HypothesisBuilder: React.FC<HypothesisBuilderProps> = ({ hypothesis, onUpdate }) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-card space-y-6">
      <div>
        <label className="block text-detective-sm font-medium text-detective-text mb-2">
          Enunciado de la Hipótesis *
        </label>
        <textarea
          value={hypothesis.statement || ''}
          onChange={(e) => onUpdate({ ...hypothesis, statement: e.target.value })}
          placeholder="Si... entonces... porque..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-detective-orange resize-none"
          rows={4}
        />
        <p className="text-detective-xs text-detective-text-secondary mt-1">
          Usa el formato: "Si [cambio variable independiente], entonces [efecto en variable dependiente], porque [razonamiento científico]"
        </p>
      </div>

      <div>
        <label className="block text-detective-sm font-medium text-detective-text mb-2">
          Predicción Específica *
        </label>
        <textarea
          value={hypothesis.prediction || ''}
          onChange={(e) => onUpdate({ ...hypothesis, prediction: e.target.value })}
          placeholder="¿Qué resultados específicos esperas observar?"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-detective-orange resize-none"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-detective-sm font-medium text-detective-text mb-2">
          Razonamiento Científico *
        </label>
        <textarea
          value={hypothesis.reasoning || ''}
          onChange={(e) => onUpdate({ ...hypothesis, reasoning: e.target.value })}
          placeholder="Explica por qué esperas estos resultados basándote en principios científicos..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-detective-orange resize-none"
          rows={4}
        />
      </div>
    </div>
  );
};
