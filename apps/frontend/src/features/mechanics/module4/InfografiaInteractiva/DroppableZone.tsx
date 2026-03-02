import { useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, Calendar, Grid3X3, Atom, Workflow, Heart, Info, Star, Award, Microscope } from 'lucide-react';
import { InfoCard } from './infografiaInteractivaTypes';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  calendar: Calendar,
  grid: Grid3X3,
  atom: Atom,
  workflow: Workflow,
  heart: Heart,
  info: Info,
  star: Star,
  award: Award,
  microscope: Microscope,
};

const getIconComponent = (iconName?: string) => {
  if (!iconName) return Info;
  return iconMap[iconName.toLowerCase()] || Info;
};

interface DroppableZoneProps {
  id: string;
  title: string;
  position: { x: number; y: number };
  icon?: string;
  isCorrect: boolean;
  isOccupied: boolean;
  droppedCard?: InfoCard;
}

export const DroppableZone = ({
  id,
  title,
  icon,
  isCorrect,
  isOccupied,
  droppedCard,
}: DroppableZoneProps) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });
  const IconComponent = getIconComponent(icon);

  return (
    <div ref={setNodeRef}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`relative rounded-detective border-2 border-dashed p-4 min-h-[140px] flex flex-col items-center justify-center transition-all ${
          isOver
            ? 'border-detective-orange bg-detective-orange/10 scale-105'
            : isCorrect
              ? 'border-detective-success bg-detective-success/10'
              : isOccupied
                ? 'border-detective-danger bg-detective-danger/10'
                : 'border-detective-border bg-white'
        }`}
      >
        {/* Status Icon */}
        <div className="absolute top-2 right-2">
          {isCorrect ? (
            <CheckCircle className="w-6 h-6 text-green-500" />
          ) : (
            <Circle className="w-6 h-6 text-detective-text-secondary" />
          )}
        </div>

        {/* Zone Icon */}
        <IconComponent className="w-8 h-8 mb-2 text-detective-text-secondary opacity-60" />

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
          <div className="text-center text-detective-text-secondary text-detective-xs">
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
