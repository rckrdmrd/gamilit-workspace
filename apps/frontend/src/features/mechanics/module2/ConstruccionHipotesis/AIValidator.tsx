import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, Lightbulb } from 'lucide-react';
import type { HypothesisValidation } from '../../shared/aiTypes';

interface AIValidatorProps {
  validation: HypothesisValidation | null;
  loading: boolean;
}

export const AIValidator: React.FC<AIValidatorProps> = ({ validation, loading }) => {
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-lg p-6 shadow-card"
      >
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-detective-orange"></div>
          <span className="text-detective-base text-detective-text">
            Analizando hipótesis con IA...
          </span>
        </div>
      </motion.div>
    );
  }

  if (!validation) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Overall Validation */}
      <div
        className={`rounded-lg p-6 shadow-card ${validation.isValid ? 'bg-green-50 border-2 border-green-300' : 'bg-yellow-50 border-2 border-yellow-300'}`}
      >
        <div className="flex items-start gap-3 mb-4">
          {validation.isValid ? (
            <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-8 h-8 text-yellow-600 flex-shrink-0" />
          )}
          <div>
            <h3 className="text-detective-lg font-bold text-detective-blue mb-2">
              {validation.isValid ? '¡Hipótesis Válida!' : 'Hipótesis Mejorable'}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-detective-sm text-detective-text-secondary">
                Precisión Científica:
              </span>
              <div className="flex-1 bg-white rounded-full h-3 overflow-hidden max-w-xs">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${validation.scientificAccuracy * 100}%` }}
                  className="h-full bg-gradient-to-r from-detective-orange to-detective-gold"
                />
              </div>
              <span className="text-detective-sm font-bold text-detective-orange">
                {Math.round(validation.scientificAccuracy * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Variables Analysis */}
      <div className="bg-white rounded-lg p-6 shadow-card">
        <h4 className="text-detective-base font-semibold text-detective-blue mb-4">
          Análisis de Variables
        </h4>
        <div className="space-y-3">
          {validation.variables.map((variable) => (
            <div
              key={variable.name}
              className="flex items-center justify-between p-3 bg-detective-bg rounded-lg"
            >
              <div className="flex-1">
                <span className="text-detective-sm font-medium text-detective-text">
                  {variable.name}
                </span>
                <span className="text-detective-xs text-detective-text-secondary ml-2">
                  ({variable.type})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-detective-orange h-full rounded-full"
                    style={{ width: `${variable.relevance * 100}%` }}
                  />
                </div>
                <span className="text-detective-xs font-medium">
                  {Math.round(variable.relevance * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Suggestions */}
      {validation.suggestions.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-detective-gold" />
            <h4 className="text-detective-base font-semibold text-detective-blue">
              Sugerencias de Mejora
            </h4>
          </div>
          <ul className="space-y-2">
            {validation.suggestions.map((suggestion, idx) => (
              <li key={idx} className="flex items-start gap-2 text-detective-sm text-detective-text">
                <span className="text-detective-orange font-bold">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Research Questions */}
      {validation.researchQuestions.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-card">
          <h4 className="text-detective-base font-semibold text-detective-blue mb-4">
            Preguntas de Investigación Relacionadas
          </h4>
          <ul className="space-y-2">
            {validation.researchQuestions.map((question, idx) => (
              <li key={idx} className="flex items-start gap-2 text-detective-sm text-detective-text">
                <span className="text-detective-blue font-bold">{idx + 1}.</span>
                <span>{question}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
};
