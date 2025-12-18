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
        className={`relative rounded-detective border-2 border-dashed p-4 min-h-[140px] flex flex-col items-center justify-center transition-all ${
          isOver
            ? 'border-detective-orange bg-detective-orange/10 scale-105'
            : isCorrect
              ? 'border-green-500 bg-green-50'
              : isOccupied
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 bg-white'
        }`}
      >
        {/* Status Icon */}
        <div className="absolute top-2 right-2">
          {isCorrect ? (
            <CheckCircle className="w-6 h-6 text-green-500" />
          ) : (
            <Circle className="w-6 h-6 text-gray-400" />
          )}
        </div>

        {/* Zone Title */}
        <h4 className="text-detective-sm font-bold text-detective-text mb-2 text-center">{title}</h4>

        {/* Dropped Card Preview or Placeholder */}
        {droppedCard ? (
          <div className="text-center">
            <p className="text-detective-xs text-detective-text-secondary font-medium">
              {droppedCard.title}
            </p>
          </div>
        ) : (
          <div className="text-center text-gray-400 text-detective-xs">
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
