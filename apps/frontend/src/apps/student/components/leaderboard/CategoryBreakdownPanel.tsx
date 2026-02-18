import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import { cn } from '@shared/utils/cn';

interface CategoryBreakdownPanelProps {
  progress: { completedExercises?: number; completedModules?: number; currentStreak?: number } | null | undefined;
  achievements: Array<{ unlocked: boolean }> | null | undefined;
}

export function CategoryBreakdownPanel({ progress, achievements }: CategoryBreakdownPanelProps) {
  const categoryStats = useMemo(() => {
    const exercisesCompleted = progress?.completedExercises || 0;
    const achievementsEarned = achievements?.filter(a => a.unlocked).length || 0;
    const modulesCompleted = progress?.completedModules || 0;
    const currentStreak = progress?.currentStreak || 0;

    const exerciseContribution = exercisesCompleted * 50;
    const achievementContribution = achievementsEarned * 100;
    const moduleContribution = modulesCompleted * 200;
    const streakContribution = currentStreak * 10;

    const total = exerciseContribution + achievementContribution + moduleContribution + streakContribution;

    if (total === 0) {
      return [
        { category: 'Ejercicios', value: 0, color: 'bg-blue-500' },
        { category: 'Logros', value: 0, color: 'bg-purple-500' },
        { category: 'Módulos', value: 0, color: 'bg-green-500' },
        { category: 'Rachas', value: 0, color: 'bg-orange-500' },
      ];
    }

    return [
      { category: 'Ejercicios', value: Math.round((exerciseContribution / total) * 100), color: 'bg-blue-500' },
      { category: 'Logros', value: Math.round((achievementContribution / total) * 100), color: 'bg-purple-500' },
      { category: 'Módulos', value: Math.round((moduleContribution / total) * 100), color: 'bg-green-500' },
      { category: 'Rachas', value: Math.round((streakContribution / total) * 100), color: 'bg-orange-500' },
    ];
  }, [progress, achievements]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
      className="rounded-xl bg-white p-6 shadow-lg"
    >
      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-detective-text">
        <BarChart3 className="h-5 w-5 text-detective-orange" />
        Desglose de Puntos
      </h3>
      <div className="space-y-4">
        {categoryStats.map((stat, index) => (
          <motion.div
            key={stat.category}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
          >
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-semibold text-detective-text">{stat.category}</span>
              <span className="text-detective-text-secondary">{stat.value}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stat.value}%` }}
                transition={{ duration: 1, delay: 0.7 + index * 0.1 }}
                className={cn(stat.color, 'h-2 rounded-full')}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
