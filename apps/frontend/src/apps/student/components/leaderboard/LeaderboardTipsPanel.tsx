import { motion } from 'framer-motion';
import { Sparkles, Award, Trophy, Zap, Users } from 'lucide-react';

export function LeaderboardTipsPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.7 }}
      className="rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6"
    >
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-purple-500" />
        <h3 className="text-lg font-bold text-detective-text">Tips para Subir</h3>
      </div>
      <ul className="space-y-2 text-sm text-detective-text-secondary">
        <li className="flex items-start gap-2">
          <Award className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-500" />
          <span>Completa ejercicios diariamente</span>
        </li>
        <li className="flex items-start gap-2">
          <Trophy className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-500" />
          <span>Desbloquea logros para bonus</span>
        </li>
        <li className="flex items-start gap-2">
          <Zap className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-500" />
          <span>Mantén rachas activas</span>
        </li>
        <li className="flex items-start gap-2">
          <Users className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-500" />
          <span>Participa en desafios sociales</span>
        </li>
      </ul>
    </motion.div>
  );
}
