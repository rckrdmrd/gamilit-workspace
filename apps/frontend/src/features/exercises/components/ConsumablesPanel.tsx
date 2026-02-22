/**
 * ConsumablesPanel
 *
 * Displays the user's real comodines inventory and allows usage during exercises.
 * Replaces the mock PowerUpBar with actual backend API integration.
 *
 * @version 1.0.0
 * @since Phase 3 - Exercise System Restructuring
 */

import type { ComponentType } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Eye, RotateCcw, Zap } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { useExerciseContext } from '../context/ExerciseContext';
import type { ComodinType } from '@/features/gamification/economy/api/comodinesAPI';

// ============================================================================
// COMODIN CONFIG
// ============================================================================

interface ComodinConfig {
  type: ComodinType;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  iconColor: string;
  bgColor: string;
}

const COMODIN_CONFIGS: ComodinConfig[] = [
  {
    type: 'pistas',
    label: 'Pistas',
    description: 'Revela una pista para ayudarte',
    icon: Lightbulb,
    iconColor: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
  {
    type: 'vision_lectora',
    label: 'Visión Lectora',
    description: 'Resalta palabras clave del texto',
    icon: Eye,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    type: 'segunda_oportunidad',
    label: 'Segunda Oportunidad',
    description: 'Permite corregir una respuesta incorrecta',
    icon: RotateCcw,
    iconColor: 'text-green-600',
    bgColor: 'bg-green-100',
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

export const ConsumablesPanel = () => {
  const { comodines } = useExerciseContext();
  const { inventory, canUse, useComodin: activateComodin, usageLimits, isLoading, error } = comodines;

  if (isLoading) {
    return (
      <DetectiveCard hoverable={false}>
        <h3 className="mb-3 text-sm font-bold text-detective-text">Comodines</h3>
        <div className="flex items-center justify-center py-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Zap className="h-5 w-5 text-detective-orange" />
          </motion.div>
        </div>
      </DetectiveCard>
    );
  }

  if (!inventory) {
    return null;
  }

  return (
    <DetectiveCard hoverable={false}>
      <h3 className="mb-3 text-sm font-bold text-detective-text">Comodines</h3>

      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {COMODIN_CONFIGS.map((config) => {
          const item = inventory[config.type];
          const limits = usageLimits[config.type];
          const available = item?.available ?? 0;
          const isUsable = canUse(config.type);
          const isActive = limits.used > 0;
          const Icon = config.icon;

          return (
            <div
              key={config.type}
              className={`flex items-center gap-2 rounded-lg border-2 p-2 transition-colors ${
                isActive
                  ? 'border-green-300 bg-green-50'
                  : isUsable
                    ? 'border-gray-200 bg-white hover:border-detective-orange/30'
                    : 'border-gray-100 bg-gray-50 opacity-60'
              }`}
            >
              <div className={`flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full ${config.bgColor}`}>
                <Icon className={`h-4 w-4 ${config.iconColor}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <p className="text-xs font-bold text-detective-text">{config.label}</p>
                  {isActive && (
                    <span className="rounded-full bg-green-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      Activo
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-detective-text-secondary">{config.description}</p>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="font-semibold text-detective-orange">x{available}</span>
                  <span className="text-detective-text-secondary">
                    {limits.used}/{limits.max} usados
                  </span>
                  {item?.cost > 0 && (
                    <span className="text-detective-gold">{item.cost} ML</span>
                  )}
                </div>
              </div>
              <DetectiveButton
                variant="primary"
                size="sm"
                onClick={() => activateComodin(config.type)}
                disabled={!isUsable}
                className="shrink-0"
              >
                Usar
              </DetectiveButton>
            </div>
          );
        })}
      </div>
    </DetectiveCard>
  );
};
