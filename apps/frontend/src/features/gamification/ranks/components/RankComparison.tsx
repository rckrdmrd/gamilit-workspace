/**
 * RankComparison Component
 *
 * Compare current rank with target rank showing differences and benefits.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Coins, CheckCircle } from 'lucide-react';
import { cn } from '@shared/utils/cn';
import { RankBadgeAdvanced } from './RankBadgeAdvanced';
import { useRank } from '../hooks/useRank';
import type { MayaRank } from '../types/ranksTypes';

export interface RankComparisonProps {
  targetRank?: MayaRank;
  showNextRank?: boolean;
  className?: string;
}

/**
 * RankComparison Component
 */
export const RankComparison: React.FC<RankComparisonProps> = ({
  targetRank,
  showNextRank = true,
  className = '',
}) => {
  const { compareToNext, compareToRank } = useRank();

  // Get comparison data
  const comparison = targetRank ? compareToRank(targetRank) : showNextRank ? compareToNext() : null;

  if (!comparison) {
    return (
      <div className={cn('py-8 text-center', className)}>
        <div className="text-detective-text-secondary">
          <p>Has alcanzado el rango máximo</p>
          <p className="mt-1 text-sm">Considera prestigiar para continuar progresando</p>
        </div>
      </div>
    );
  }

  const { current, target, mlCoinsDifference, multiplierIncrease, newBenefits } = comparison;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="text-center">
        <h3 className="mb-2 text-xl font-bold text-detective-text">Comparación de Rangos</h3>
        <p className="text-sm text-detective-text-secondary">Progreso hacia el siguiente rango</p>
      </div>

      {/* Rank Badges Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center gap-6"
      >
        <div className="flex flex-col items-center gap-3">
          <RankBadgeAdvanced rank={current.id} showGlow={false} animated={false} />
          <div className="text-center">
            <div className="font-bold text-detective-text">{current.nameSpanish}</div>
            <div className="text-sm text-detective-text-secondary">
              {current.multiplier.toFixed(2)}x multiplicador
            </div>
          </div>
        </div>

        <ArrowRight className="h-8 w-8 text-gray-400" />

        <div className="flex flex-col items-center gap-3">
          <RankBadgeAdvanced rank={target.id} showGlow={true} animated={true} />
          <div className="text-center">
            <div className="font-bold text-detective-text">{target.nameSpanish}</div>
            <div className="text-sm text-detective-text-secondary">
              {target.multiplier.toFixed(2)}x multiplicador
            </div>
          </div>
        </div>
      </motion.div>

      {/* Requirements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6"
      >
        <h4 className="mb-4 font-bold text-detective-text">
          Requisitos para alcanzar {target.nameSpanish}
        </h4>

        <div className="space-y-3">
          {/* ML Coins Required */}
          <div className="flex items-center justify-between rounded-lg bg-white p-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 p-2">
                <Coins className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-detective-text">ML Coins Necesarios</div>
                <div className="text-sm text-detective-text-secondary">
                  {target.mlCoinsRequired.toLocaleString()} ML Coins en total
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-amber-600">
                {mlCoinsDifference.toLocaleString()}
              </div>
              <div className="text-xs text-detective-text-secondary">más por ganar</div>
            </div>
          </div>

          {/* Multiplier Increase */}
          <div className="flex items-center justify-between rounded-lg bg-white p-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 p-2">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-detective-text">Aumento de Multiplicador</div>
                <div className="text-sm text-detective-text-secondary">
                  De {current.multiplier.toFixed(2)}x a {target.multiplier.toFixed(2)}x
                </div>
              </div>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              +{(multiplierIncrease * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      </motion.div>

      {/* New Benefits */}
      {newBenefits.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6"
        >
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h4 className="font-bold text-detective-text">Beneficios que Desbloquearás</h4>
          </div>

          <ul className="space-y-2">
            {newBenefits.map((benefit, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="flex items-start gap-3 rounded-lg bg-white p-3"
              >
                <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-detective-text">{benefit}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Motivation Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-center text-white"
      >
        <p className="mb-1 text-lg font-semibold">¡Sigue así, Detective!</p>
        <p className="text-sm opacity-90">
          Estás a {mlCoinsDifference.toLocaleString()} ML Coins de alcanzar {target.nameSpanish}
        </p>
      </motion.div>
    </div>
  );
};
