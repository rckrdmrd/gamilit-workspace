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
import { Search, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { GamifiedHeader } from '@shared/components/layout/GamifiedHeader';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useUserGamification } from '@shared/hooks/useUserGamification';
import { useUserModules } from '@/apps/student/hooks/useUserModules';
import { ModuleCard } from '@/apps/student/components/learning/ModuleCard';

/** Per-module Tailwind styling (indexed by module order 0-4). */
const MODULE_STYLES = [
  { color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
  { color: 'from-purple-500 to-pink-500', bgColor: 'bg-purple-50', textColor: 'text-purple-700' },
  { color: 'from-orange-500 to-red-500', bgColor: 'bg-orange-50', textColor: 'text-orange-700' },
  { color: 'from-green-500 to-teal-500', bgColor: 'bg-green-50', textColor: 'text-green-700' },
  { color: 'from-amber-500 to-yellow-500', bgColor: 'bg-amber-50', textColor: 'text-amber-700' },
];

const DEFAULT_STYLE = MODULE_STYLES[0];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function LearningPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { gamificationData } = useUserGamification(user?.id);
  const { modules, loading, error, refresh } = useUserModules();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredModules = modules.filter(
    (m) =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalProgress =
    modules.length > 0
      ? Math.round(modules.reduce((acc, m) => acc + m.progress, 0) / modules.length)
      : 0;

  const totalCompleted = modules.reduce((acc, m) => acc + m.completedExercises, 0);
  const totalExercises = modules.reduce((acc, m) => acc + m.totalExercises, 0);

  const handleModuleClick = (moduleId: string) => {
    navigate(`/modules/${moduleId}`);
  };

  const getModuleStyle = (index: number) => MODULE_STYLES[index] ?? DEFAULT_STYLE;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800">
      <GamifiedHeader
        user={user || undefined}
        gamificationData={gamificationData}
        onLogout={logout}
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
            <label htmlFor="learning-search" className="sr-only">Buscar modulo</label>
            <input
              id="learning-search"
              type="text"
              placeholder="Buscar modulo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm shadow-sm transition-colors focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="mb-4 h-10 w-10 animate-spin text-detective-orange" />
            <p className="text-sm text-gray-500">Cargando modulos...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="mb-4 h-10 w-10 text-red-400" />
            <p className="mb-2 text-lg font-medium text-gray-700">Error al cargar modulos</p>
            <p className="mb-4 text-sm text-gray-500">{error.message}</p>
            <button
              onClick={() => refresh()}
              className="rounded-lg bg-detective-orange px-4 py-2 text-sm font-medium text-white hover:bg-detective-orange/90"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Modules Grid */}
        {!loading && !error && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredModules.map((mod, index) => (
              <ModuleCard
                key={mod.id}
                module={mod}
                index={index}
                style={getModuleStyle(index)}
                onModuleClick={handleModuleClick}
              />
            ))}
          </motion.div>
        )}

        {/* Empty state for search */}
        {!loading && !error && filteredModules.length === 0 && (
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
