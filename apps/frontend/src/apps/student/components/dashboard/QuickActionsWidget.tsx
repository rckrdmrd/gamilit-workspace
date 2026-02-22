/**
 * QuickActionsWidget - Dashboard de Acciones Rápidas
 *
 * Widget de acceso rápido a las funcionalidades principales de gamificación:
 * - Tienda (Shop) - /shop
 * - Ranking (Leaderboard) - /leaderboard
 * - Logros (Achievements) - /achievements
 *
 * Inspirado en el diseño de GamificationPage.tsx (líneas 129-158, 378-416)
 *
 * @component
 */

import type { ComponentType } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Award, Users, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@shared/utils/cn';

interface QuickAction {
  icon: ComponentType<{ className?: string }>;
  label: string;
  description: string;
  color: string;
  path: string;
}

const quickActions: QuickAction[] = [
  {
    icon: ShoppingBag,
    label: 'Tienda',
    description: 'Compra items',
    color: 'from-purple-500 to-pink-500',
    path: '/shop',
  },
  {
    icon: Users,
    label: 'Ranking',
    description: 'Compite',
    color: 'from-blue-500 to-cyan-500',
    path: '/leaderboard',
  },
  {
    icon: Award,
    label: 'Logros',
    description: 'Ver logros',
    color: 'from-emerald-500 to-teal-500',
    path: '/achievements',
  },
];

/**
 * QuickActionsWidget Component
 *
 * Muestra botones de acceso rápido a las principales funcionalidades de gamificación
 */
export function QuickActionsWidget() {
  const navigate = useNavigate();

  const handleActionClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2"
      >
        <Sparkles className="h-6 w-6 text-amber-500" />
        <h3 className="text-lg font-bold text-gray-900">Acciones Rápidas</h3>
      </motion.div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-3 gap-4">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleActionClick(action.path)}
              className={cn(
                'group relative rounded-xl p-6 shadow-lg',
                'bg-gradient-to-br',
                action.color,
                'text-white',
                'flex flex-col items-center gap-3',
                'transition-all duration-300',
                'hover:shadow-xl',
                'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
              )}
              aria-label={`Ir a ${action.label}`}
            >
              {/* Icon */}
              <motion.div whileHover={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.5 }}>
                <Icon className="h-8 w-8" />
              </motion.div>

              {/* Text Content */}
              <div className="text-center">
                <div className="text-lg font-bold">{action.label}</div>
                <div className="text-xs opacity-90">{action.description}</div>
              </div>

              {/* Arrow Icon */}
              <motion.div
                initial={{ opacity: 0.75 }}
                whileHover={{ opacity: 1, x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowRight className="h-5 w-5 opacity-75" />
              </motion.div>

              {/* Hover Glow Effect */}
              <div
                className={cn(
                  'absolute inset-0 rounded-xl opacity-0 blur-xl transition-opacity duration-300',
                  'group-hover:opacity-30',
                  'bg-gradient-to-br',
                  action.color,
                  'pointer-events-none',
                )}
              />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
