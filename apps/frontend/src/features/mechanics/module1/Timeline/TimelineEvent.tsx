import { motion, type DragControls } from 'framer-motion';
import { GripVertical, Calendar } from 'lucide-react';
import { TimelineEvent as TimelineEventType } from './timelineTypes';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';

export interface TimelineEventProps {
  event: TimelineEventType;
  index: number;
  dragControls?: DragControls;
}

export const TimelineEvent = ({ event, index, dragControls }: TimelineEventProps) => {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <DetectiveCard variant="default" padding="md" className="flex items-center gap-2 sm:gap-4">
        <div
          className="flex min-h-[44px] min-w-[44px] items-center justify-center cursor-grab touch-none"
          onPointerDown={(e) => dragControls?.start(e)}
        >
          <GripVertical className="w-5 h-5 text-detective-text-secondary" />
        </div>
        <div className="flex items-center gap-3 w-10 h-10 sm:w-12 sm:h-12 bg-detective-orange text-white rounded-full justify-center font-bold">
          {index + 1}
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-detective-text">{event.title}</h4>
          <p className="text-sm text-detective-text-secondary">{event.description}</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-bold text-detective-text">{event.year}</span>
        </div>
      </DetectiveCard>
    </motion.div>
  );
};
