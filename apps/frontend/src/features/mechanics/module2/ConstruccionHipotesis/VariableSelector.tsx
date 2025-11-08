import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, FlaskConical } from 'lucide-react';
import type { Variable } from './construccionHipotesisTypes';

interface VariableSelectorProps {
  availableVariables: Variable[];
  selectedVariables: Variable[];
  onSelectVariable: (variable: Variable) => void;
  onRemoveVariable: (variableId: string) => void;
}

const variableTypeColors = {
  independent: 'bg-blue-100 text-blue-800 border-blue-300',
  dependent: 'bg-green-100 text-green-800 border-green-300',
  controlled: 'bg-yellow-100 text-yellow-800 border-yellow-300',
};

const variableTypeLabels = {
  independent: 'Independiente',
  dependent: 'Dependiente',
  controlled: 'Controlada',
};

export const VariableSelector: React.FC<VariableSelectorProps> = ({
  availableVariables,
  selectedVariables,
  onSelectVariable,
  onRemoveVariable,
}) => {
  const selectedIds = selectedVariables.map((v) => v.id);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <FlaskConical className="w-5 h-5 text-detective-orange" />
          <h3 className="text-detective-lg font-semibold text-detective-blue">
            Variables Seleccionadas
          </h3>
        </div>

        <div className="space-y-3 mb-4">
          <AnimatePresence>
            {selectedVariables.map((variable) => (
              <motion.div
                key={variable.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`p-4 rounded-lg border-2 ${variableTypeColors[variable.type]}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-detective-xs font-bold uppercase">
                        {variableTypeLabels[variable.type]}
                      </span>
                      {variable.unit && (
                        <span className="text-detective-xs opacity-70">({variable.unit})</span>
                      )}
                    </div>
                    <h4 className="text-detective-base font-semibold mb-1">{variable.name}</h4>
                    <p className="text-detective-xs opacity-80">{variable.description}</p>
                  </div>
                  <button
                    onClick={() => onRemoveVariable(variable.id)}
                    className="flex-shrink-0 p-1 hover:bg-red-200 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {selectedVariables.length === 0 && (
            <p className="text-detective-sm text-detective-text-secondary text-center py-8">
              Selecciona variables de la lista para construir tu hipótesis
            </p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-card">
        <h3 className="text-detective-lg font-semibold text-detective-blue mb-4">
          Variables Disponibles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {availableVariables
            .filter((v) => !selectedIds.includes(v.id))
            .map((variable) => (
              <motion.button
                key={variable.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectVariable(variable)}
                className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${variableTypeColors[variable.type]}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Plus className="w-4 h-4" />
                  <span className="text-detective-xs font-bold uppercase">
                    {variableTypeLabels[variable.type]}
                  </span>
                </div>
                <h4 className="text-detective-sm font-semibold mb-1">{variable.name}</h4>
                <p className="text-detective-xs opacity-80">{variable.description}</p>
              </motion.button>
            ))}
        </div>
      </div>
    </div>
  );
};
