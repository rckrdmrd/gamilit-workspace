/**
 * UnderConstructionExercise Component
 *
 * GAP-005 Resolution - Component for exercises in backlog modules
 * FECHA: 2025-11-23
 * FRONTEND-DEVELOPER
 *
 * Displays a user-friendly "Under Construction" message for exercises
 * that are designed but not yet implemented (is_active = false).
 *
 * Especificación: orchestration/agentes/architecture-analyst/gap-analysis/ESTRATEGIA-MODULOS-4-5-EN-CONSTRUCCION.md
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Construction, AlertCircle, Zap, Clock, Gift, ArrowLeft, BookOpen } from 'lucide-react';

interface UnderConstructionExerciseProps {
  exercise: {
    id: string;
    title: string;
    subtitle?: string;
    description: string;
    module_id?: string;
    module?: {
      id: string;
      title: string;
      module_code: string;
    };
    estimated_time_minutes: number;
    xp_reward: number;
    ml_coins_reward: number;
  };
  // Optional props to maintain compatibility with Exercise component interface
  onComplete?: () => void;
  onProgressUpdate?: (update: any) => void;
  actionsRef?: React.MutableRefObject<any>;
}

export const UnderConstructionExercise: React.FC<UnderConstructionExerciseProps> = ({
  exercise,
}) => {
  const navigate = useNavigate();

  // Extract module ID from exercise.module_id or exercise.module.id
  const moduleId = exercise.module?.id || exercise.module_id || '';
  const moduleTitle = exercise.module?.title || 'el módulo';

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      {/* Contenedor central */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl bg-white p-8 shadow-2xl sm:p-12"
        >
          {/* Icono de construcción grande */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mb-6 text-center"
          >
            <Construction className="mx-auto h-24 w-24 text-amber-500" />
          </motion.div>

          {/* Título del ejercicio */}
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-2 text-center text-3xl font-bold text-gray-900 sm:text-4xl"
          >
            {exercise.title}
          </motion.h1>

          {/* Subtítulo si existe */}
          {exercise.subtitle && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-6 text-center text-lg text-gray-600"
            >
              {exercise.subtitle}
            </motion.p>
          )}

          {/* Badge "En Construcción" */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-8 flex justify-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-5 py-2.5 text-sm font-semibold text-amber-800 shadow-md">
              <Construction className="h-5 w-5" />
              Ejercicio en Construcción
            </span>
          </motion.div>

          {/* Descripción del ejercicio */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-8 rounded-xl bg-gray-50 p-6"
          >
            <h3 className="mb-3 text-lg font-semibold text-gray-900">
              ¿De qué trata este ejercicio?
            </h3>
            <p className="leading-relaxed text-gray-700">{exercise.description}</p>
          </motion.div>

          {/* Información del ejercicio (3 cards) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3"
          >
            {/* XP Reward */}
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 text-center transition-shadow hover:shadow-md">
              <Zap className="mx-auto mb-2 h-7 w-7 text-blue-600" />
              <p className="mb-1 text-sm text-gray-600">Recompensa XP</p>
              <p className="text-2xl font-bold text-blue-700">{exercise.xp_reward} XP</p>
            </div>

            {/* Tiempo estimado */}
            <div className="rounded-xl border border-purple-100 bg-purple-50 p-5 text-center transition-shadow hover:shadow-md">
              <Clock className="mx-auto mb-2 h-7 w-7 text-purple-600" />
              <p className="mb-1 text-sm text-gray-600">Tiempo estimado</p>
              <p className="text-2xl font-bold text-purple-700">
                {exercise.estimated_time_minutes} min
              </p>
            </div>

            {/* ML Coins */}
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-5 text-center transition-shadow hover:shadow-md">
              <Gift className="mx-auto mb-2 h-7 w-7 text-amber-600" />
              <p className="mb-1 text-sm text-gray-600">ML Coins</p>
              <p className="text-2xl font-bold text-amber-700">{exercise.ml_coins_reward} ML</p>
            </div>
          </motion.div>

          {/* Mensaje informativo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mb-8 rounded-xl border-2 border-amber-200 bg-amber-50 p-6"
          >
            <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold text-amber-900">
              <AlertCircle className="h-5 w-5" />
              Este ejercicio estará disponible próximamente
            </h3>
            <p className="leading-relaxed text-amber-800">
              Actualmente estamos trabajando en implementar este ejercicio interactivo. Mientras
              tanto, te invitamos a completar los{' '}
              <span className="font-semibold">Módulos 1, 2 y 3</span> que ya están disponibles y
              completamente funcionales.
            </p>
          </motion.div>

          {/* Botones de acción */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex flex-col gap-4 sm:flex-row"
          >
            {/* Botón Volver al Módulo */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/modules/${moduleId}`)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:from-blue-600 hover:to-blue-700"
            >
              <ArrowLeft className="h-5 w-5" />
              Volver al Módulo
            </motion.button>

            {/* Botón Ver Todos los Módulos */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/modules')}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:from-amber-600 hover:to-orange-600"
            >
              <BookOpen className="h-5 w-5" />
              Ver Todos los Módulos
            </motion.button>
          </motion.div>

          {/* Información del módulo padre */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 text-center text-sm text-gray-500"
          >
            Parte del <span className="font-semibold">{moduleTitle}</span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default UnderConstructionExercise;
