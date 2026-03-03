import { useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import type { Cause, Consequence } from './causaEfectoTypes';

interface DroppableCauseZoneProps {
  cause: Cause;
  index: number;
  matchedConsequences: Consequence[];
  validated: boolean;
  onRemove: (causeId: string, consequenceId: string) => void;
}

export const DroppableCauseZone = ({
  cause,
  index,
  matchedConsequences,
  validated,
  onRemove,
}: DroppableCauseZoneProps) => {
  const { isOver, setNodeRef } = useDroppable({ id: cause.id });

  return (
    <div ref={setNodeRef}>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className={`rounded-lg border-2 bg-white p-2 sm:p-4 transition-all ${
          isOver ? 'scale-105 border-orange-500 bg-orange-50' : 'border-blue-300'
        } ${!validated ? 'min-h-[120px]' : ''}`}
      >
        <div className="mb-3 flex items-start gap-2">
          <span className="text-2xl font-bold text-blue-600">{index + 1}</span>
          <p className="flex-1 text-detective-sm font-medium text-detective-text">{cause.text}</p>
        </div>

        {matchedConsequences.length > 0 && (
          <div className="mt-3 space-y-2 pl-8">
            {matchedConsequences.map((consequence) => (
              <div
                key={consequence.id}
                className="group relative rounded-lg border-2 border-orange-300 bg-orange-50 p-3 text-detective-xs text-orange-900"
              >
                <div className="flex items-center gap-2">
                  <span className="flex-1">{consequence.text}</span>
                  {!validated && (
                    <button
                      onClick={() => onRemove(cause.id, consequence.id)}
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center opacity-70 hover:opacity-100 text-red-400 hover:text-red-600 transition-all"
                      title="Quitar"
                      aria-label="Eliminar consecuencia"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {matchedConsequences.length === 0 && !validated && (
          <div className="mt-2 flex items-center justify-center rounded-lg border-2 border-dashed border-detective-border py-6">
            <p className="text-center text-detective-xs italic text-detective-text-secondary">
              Arrastra consecuencias aquí
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
