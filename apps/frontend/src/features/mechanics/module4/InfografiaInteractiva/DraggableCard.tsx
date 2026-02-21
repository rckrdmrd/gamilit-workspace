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

export const DraggableCard: React.FC<DraggableCardProps> = ({ id, title, content, isDragging: _isDragging }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging: isCurrentlyDragging } = useDraggable({
    id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: isCurrentlyDragging ? 50 : 'auto' as React.CSSProperties['zIndex'],
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`relative bg-gradient-to-br from-detective-blue to-detective-purple rounded-detective p-4 cursor-grab active:cursor-grabbing min-h-[120px] flex flex-col justify-center text-white shadow-detective-md transition-all ${
          isCurrentlyDragging ? 'shadow-detective-lg scale-105 ring-2 ring-detective-orange' : ''
        }`}
      >
        <div className="absolute top-2 left-2">
          <GripVertical className="w-5 h-5 opacity-50" />
        </div>
        <h3 className="text-detective-base font-bold mb-2 pl-6">{title}</h3>
        <p className="text-detective-sm opacity-90">{content}</p>
      </motion.div>
    </div>
  );
};
