import { motion, AnimatePresence } from 'framer-motion';
import { InfoCard } from './infografiaInteractivaTypes';
import { Eye, EyeOff, Calendar, Grid3X3, Atom, Workflow, Heart, Info, Star, Award, Microscope } from 'lucide-react';

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

const getIconComponent = (iconName: string) => {
  return iconMap[iconName?.toLowerCase()] || Info;
};

export const InteractiveCard = ({ card, onClick }: { card: InfoCard; onClick: () => void }) => {
  const IconComponent = getIconComponent(card.icon);

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-6 cursor-pointer min-h-[200px] flex flex-col items-center justify-center text-white"
    >
      <div className="absolute top-2 right-2">
        {card.revealed ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
      </div>
      <IconComponent className="w-10 h-10 mb-3 opacity-80" />
      <h3 className="text-lg font-bold mb-2 text-center">{card.title}</h3>
      <AnimatePresence>
        {card.revealed && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-sm text-center"
          >
            {card.content}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
