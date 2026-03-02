import { type CSSProperties } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { GripVertical, Calendar, Grid3X3, Atom, Workflow, Heart, Info, Star, Award, Microscope } from 'lucide-react';

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

interface DraggableCardProps {
  id: string;
  title: string;
  content: string;
  icon?: string;
  isDragging?: boolean;
}

export const DraggableCard = ({ id, title, content, icon, isDragging: _isDragging }: DraggableCardProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging: isCurrentlyDragging } = useDraggable({
    id,
  });
  const IconComponent = getIconComponent(icon);

  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: isCurrentlyDragging ? 50 : 'auto' as CSSProperties['zIndex'],
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
        <IconComponent className="w-8 h-8 mb-2 opacity-80" />
        <h3 className="text-detective-base font-bold mb-1 text-center">{title}</h3>
        <p className="text-detective-sm opacity-90 text-center">{content}</p>
      </motion.div>
    </div>
  );
};
