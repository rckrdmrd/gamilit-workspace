import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { CheckCircle, Circle } from 'lucide-react';
import { InfoCard } from './infografiaInteractivaTypes';

interface DroppableZoneProps {
  id: string;
  title: string;
  position: { x: number; y: number };
  isCorrect: boolean;
  isOccupied: boolean;
  droppedCard?: InfoCard;
}

export const DroppableZone: React.FC<DroppableZoneProps> = ({
  id,
  title,
  isCorrect,
  isOccupied,
  droppedCard,
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div ref={setNodeRef}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`relative flex min-h-[140px] flex-col items-center justify-center rounded-detective border-2 border-dashed p-4 transition-all ${
          isOver
            ? 'scale-105 border-detective-orange bg-detective-orange/10'
            : isCorrect
              ? 'border-green-500 bg-green-50'
              : isOccupied
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 bg-white'
        }`}
      >
        {/* Status Icon */}
        <div className="absolute right-2 top-2">
          {isCorrect ? (
            <CheckCircle className="h-6 w-6 text-green-500" />
          ) : (
            <Circle className="h-6 w-6 text-gray-400" />
          )}
        </div>

        {/* Zone Title */}
        <h4 className="mb-2 text-center text-detective-sm font-bold text-detective-text">
          {title}
        </h4>

        {/* Dropped Card Preview or Placeholder */}
        {droppedCard ? (
          <div className="text-center">
            <p className="text-detective-xs font-medium text-detective-text-secondary">
              {droppedCard.title}
            </p>
          </div>
        ) : (
          <div className="text-center text-detective-xs text-gray-400">
            <p>Arrastra aquí</p>
          </div>
        )}

        {/* Feedback Messages */}
        {isOver && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -bottom-8 left-0 right-0 text-center text-detective-xs font-medium text-detective-orange"
          >
            Suelta aquí
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
