import { type CSSProperties } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface DraggableConsequenceProps {
  id: string;
  text: string;
  disabled?: boolean;
}

export const DraggableConsequence = ({ id, text, disabled = false }: DraggableConsequenceProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled,
  });

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div
        className={`rounded-lg border-2 p-2 sm:p-4 transition-all ${
          isDragging
            ? 'scale-105 shadow-lg ring-2 ring-detective-orange opacity-50'
            : 'border-detective-border bg-white hover:border-orange-400 hover:shadow-md'
        } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
      >
        <div className="flex items-center gap-3">
          {!disabled && (
            <div
              className="flex min-h-[44px] min-w-[44px] items-center justify-center cursor-grab touch-none"
              {...listeners}
            >
              <GripVertical className="h-5 w-5 flex-shrink-0 text-detective-text-secondary" />
            </div>
          )}
          <span className="flex-1 text-detective-sm text-detective-text">{text}</span>
        </div>
      </div>
    </div>
  );
};
