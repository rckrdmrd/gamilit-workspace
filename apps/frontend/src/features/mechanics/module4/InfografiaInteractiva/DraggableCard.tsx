import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { GripVertical } from 'lucide-react';

interface DraggableCardProps {
  id: string;
  title: string;
  content: string;
  isDragging?: boolean;
}

export const DraggableCard: React.FC<DraggableCardProps> = ({
  id,
  title,
  content,
  isDragging: _isDragging,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isCurrentlyDragging,
  } = useDraggable({
    id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isCurrentlyDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`to-detective-purple shadow-detective-md relative flex min-h-[120px] cursor-grab flex-col justify-center rounded-detective bg-gradient-to-br from-detective-blue p-4 text-white transition-all active:cursor-grabbing ${
          isCurrentlyDragging ? 'shadow-detective-lg ring-2 ring-detective-orange' : ''
        }`}
      >
        <div className="absolute left-2 top-2">
          <GripVertical className="h-5 w-5 opacity-50" />
        </div>
        <h3 className="mb-2 pl-6 text-detective-base font-bold">{title}</h3>
        <p className="text-detective-sm opacity-90">{content}</p>
      </motion.div>
    </div>
  );
};
