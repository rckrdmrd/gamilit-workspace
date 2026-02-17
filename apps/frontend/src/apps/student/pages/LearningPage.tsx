/**
 * LearningPage - Learning Hub with 5 Educational Modules
 *
 * Features:
 * - Grid of 5 educational modules with progress tracking
 * - Sequential unlock system (module N requires module N-1)
 * - Detective theme consistent with student portal
 * - Staggered card entry animations
 * - Navigation to individual module pages
 *
 * Route: /learning
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Lock, CheckCircle2, Star, ChevronRight, Search, Sparkles } from 'lucide-react';
import { GamifiedHeader } from '@shared/components/layout/GamifiedHeader';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useUserGamification } from '@shared/hooks/useUserGamification';

interface ModuleData {
  id: string;
  number: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  textColor: string;
  exercises: number;
}

const modules: ModuleData[] = [
  {
    id: 'module-1',
    number: 1,
    title: 'Comprension Literal',
    description: 'Identifica informacion explicita en textos: personajes, eventos, datos y detalles clave.',
    icon: '\u{1F4D6}',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    exercises: 7,
  },
  {
    id: 'module-2',
    number: 2,
    title: 'Comprension Inferencial',
    description: 'Deduce significados ocultos, hace predicciones y conecta ideas entre lineas.',
    icon: '\u{1F50D}',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    exercises: 5,
  },
  {
    id: 'module-3',
    number: 3,
    title: 'Comprension Critica',
    description: 'Evalua argumentos, analiza perspectivas y forma opiniones fundamentadas.',
    icon: '\u{2696}\u{FE0F}',
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    exercises: 5,
  },
  {
    id: 'module-4',
    number: 4,
    title: 'Literacidad Digital',
    description: 'Navega, evalua y crea contenido digital de manera critica y responsable.',
    icon: '\u{1F4BB}',
    color: 'from-green-500 to-teal-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    exercises: 9,
  },
  {
    id: 'module-5',
    number: 5,
    title: 'Produccion Textual',
    description: 'Crea textos originales aplicando todas las habilidades de comprension lectora.',
    icon: '\u{270D}\u{FE0F}',
    color: 'from-amber-500 to-yellow-500',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    exercises: 3,
  },
];

// Mock progress data (will be replaced with API data)
const mockProgress: Record<string, { progress: number; completed: number; unlocked: boolean }> = {
  'module-1': { progress: 75, completed: 5, unlocked: true },
  'module-2': { progress: 30, completed: 2, unlocked: true },
  'module-3': { progress: 0, completed: 0, unlocked: false },
  'module-4': { progress: 0, completed: 0, unlocked: false },
  'module-5': { progress: 0, completed: 0, unlocked: false },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut' as const,
    },
  },
};

export default function LearningPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { gamificationData } = useUserGamification(user?.id);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredModules = modules.filter(
    (m) =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalProgress = Math.round(
    Object.values(mockProgress).reduce((acc, p) => acc + p.progress, 0) / modules.length,
  );

  const totalCompleted = Object.values(mockProgress).reduce((acc, p) => acc + p.completed, 0);
  const totalExercises = modules.reduce((acc, m) => acc + m.exercises, 0);

  const handleModuleClick = (moduleId: string, unlocked: boolean) => {
    if (unlocked) {
      navigate(`/modules/${moduleId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800">
      <GamifiedHeader
        user={user || undefined}
        gamificationData={gamificationData}
        onLogout={async () => {
          await logout();
        }}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 p-8 text-white shadow-xl">
            <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles className="h-6 w-6" />
                  <span className="text-sm font-medium uppercase tracking-wide opacity-90">
                    Centro de Aprendizaje
                  </span>
                </div>
                <h1 className="mb-2 text-3xl font-bold md:text-4xl">
                  Casos de Detective
                </h1>
                <p className="max-w-lg text-white/80">
                  Resuelve casos de comprension lectora, avanza por los modulos y
                  desbloquea nuevos desafios.
                </p>
              </div>

              <div className="flex gap-6">
                <div className="rounded-xl bg-white/20 p-4 text-center backdrop-blur-sm">
                  <div className="text-3xl font-bold">{totalProgress}%</div>
                  <div className="text-sm opacity-80">Progreso Total</div>
                </div>
                <div className="rounded-xl bg-white/20 p-4 text-center backdrop-blur-sm">
                  <div className="text-3xl font-bold">
                    {totalCompleted}/{totalExercises}
                  </div>
                  <div className="text-sm opacity-80">Ejercicios</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar modulo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm shadow-sm transition-colors focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>
        </motion.div>

        {/* Modules Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredModules.map((module) => {
            const progress = mockProgress[module.id];
            const isUnlocked = progress?.unlocked ?? false;
            const isCompleted = (progress?.progress ?? 0) === 100;

            return (
              <motion.div key={module.id} variants={cardVariants}>
                <DetectiveCard
                  hoverable={isUnlocked}
                  className={`relative h-full transition-all duration-200 ${
                    !isUnlocked ? 'opacity-60 grayscale' : ''
                  } ${isCompleted ? 'ring-2 ring-green-400' : ''}`}
                >
                  <button
                    onClick={() => handleModuleClick(module.id, isUnlocked)}
                    disabled={!isUnlocked}
                    className="block w-full text-left"
                  >
                    {/* Module Number Badge */}
                    <div className="mb-4 flex items-start justify-between">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${module.color} text-2xl shadow-md`}
                      >
                        {isUnlocked ? module.icon : <Lock className="h-6 w-6 text-white" />}
                      </div>
                      <div className="flex items-center gap-2">
                        {isCompleted && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                            <CheckCircle2 className="h-3 w-3" />
                            Completado
                          </span>
                        )}
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-bold ${module.bgColor} ${module.textColor}`}
                        >
                          M{module.number}
                        </span>
                      </div>
                    </div>

                    {/* Title and Description */}
                    <h3 className="mb-2 text-lg font-bold text-detective-text">
                      {module.title}
                    </h3>
                    <p className="mb-4 text-sm text-detective-text-secondary">
                      {module.description}
                    </p>

                    {/* Exercises Count */}
                    <div className="mb-4 flex items-center gap-2 text-sm text-detective-text-secondary">
                      <BookOpen className="h-4 w-4" />
                      <span>
                        {progress?.completed ?? 0} / {module.exercises} ejercicios
                      </span>
                    </div>

                    {/* Progress Bar */}
                    {isUnlocked && (
                      <div className="mb-3">
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="text-detective-text-secondary">Progreso</span>
                          <span className="font-semibold text-detective-orange">
                            {progress?.progress ?? 0}%
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                          <motion.div
                            className={`h-full rounded-full bg-gradient-to-r ${module.color}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${progress?.progress ?? 0}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Locked Message */}
                    {!isUnlocked && (
                      <div className="flex items-center gap-2 rounded-lg bg-gray-100 p-3 text-xs text-gray-500">
                        <Lock className="h-4 w-4" />
                        <span>Completa el Modulo {module.number - 1} para desbloquear</span>
                      </div>
                    )}

                    {/* CTA Arrow */}
                    {isUnlocked && !isCompleted && (
                      <div className="mt-2 flex items-center justify-end gap-1 text-sm font-medium text-detective-orange">
                        Continuar
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    )}

                    {/* Stars for completed */}
                    {isCompleted && (
                      <div className="mt-2 flex items-center justify-center gap-1">
                        {[1, 2, 3].map((s) => (
                          <Star
                            key={s}
                            className="h-5 w-5 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                    )}
                  </button>
                </DetectiveCard>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Empty state for search */}
        {filteredModules.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-16 text-center"
          >
            <Search className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className="text-lg font-medium text-gray-500">
              No se encontraron modulos
            </p>
            <p className="text-sm text-gray-400">
              Intenta con otra busqueda
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
