import type { ElementType } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Trophy, Target, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickAction {
  id: string;
  label: string;
  icon: ElementType;
  path: string;
  color: string;
  bgColor: string;
}

const quickActions: QuickAction[] = [
  {
    id: 'continue',
    label: 'Continuar',
    icon: BookOpen,
    path: '/modules',
    color: 'text-detective-orange',
    bgColor: 'bg-detective-orange/10',
  },
  {
    id: 'achievements',
    label: 'Logros',
    icon: Trophy,
    path: '/gamification',
    color: 'text-detective-gold',
    bgColor: 'bg-detective-gold/10',
  },
  {
    id: 'missions',
    label: 'Misiones',
    icon: Target,
    path: '/missions',
    color: 'text-detective-blue',
    bgColor: 'bg-detective-blue/10',
  },
  {
    id: 'schedule',
    label: 'Calendario',
    icon: Calendar,
    path: '/schedule',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
];

export function QuickActionsPanel() {
  const navigate = useNavigate();

  return (
    <div className="rounded-detective bg-white p-4 shadow-card-detective">
      <h3 className="mb-4 text-lg font-bold text-detective-text">Acciones Rápidas</h3>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {quickActions.map((action, index) => {
          const Icon = action.icon;

          return (
            <motion.button
              key={action.id}
              onClick={() => navigate(action.path)}
              className={`flex flex-col items-center justify-center p-4 ${action.bgColor} min-h-[44px] min-w-[44px] touch-manipulation rounded-lg transition-shadow hover:shadow-md`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{
                  y: [0, -4, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  delay: index * 0.2,
                  ease: 'easeInOut',
                }}
              >
                <Icon className={`h-6 w-6 ${action.color} mb-2`} />
              </motion.div>
              <span className="text-center text-xs font-medium text-detective-text">
                {action.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
