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

import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Construction,
  AlertCircle,
  Zap,
  Clock,
  Gift,
  ArrowLeft,
  BookOpen,
} from 'lucide-react';

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12"
        >
          {/* Icono de construcción grande */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="text-center mb-6"
          >
            <Construction className="w-24 h-24 mx-auto text-amber-500" />
          </motion.div>

          {/* Título del ejercicio */}
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-2"
          >
            {exercise.title}
          </motion.h1>

          {/* Subtítulo si existe */}
          {exercise.subtitle && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-center text-gray-600 mb-6"
            >
              {exercise.subtitle}
            </motion.p>
          )}

          {/* Badge "En Construcción" */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center mb-8"
          >
            <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-100 text-amber-800 rounded-full font-semibold text-sm shadow-md">
              <Construction className="w-5 h-5" />
              Ejercicio en Construcción
            </span>
          </motion.div>

          {/* Descripción del ejercicio */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-50 rounded-xl p-6 mb-8"
          >
            <h3 className="font-semibold text-gray-900 mb-3 text-lg">
              ¿De qué trata este ejercicio?
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {exercise.description}
            </p>
          </motion.div>

          {/* Información del ejercicio (3 cards) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
          >
            {/* XP Reward */}
            <div className="bg-blue-50 rounded-xl p-5 text-center border border-blue-100 hover:shadow-md transition-shadow">
              <Zap className="w-7 h-7 mx-auto text-blue-600 mb-2" />
              <p className="text-sm text-gray-600 mb-1">Recompensa XP</p>
              <p className="text-2xl font-bold text-blue-700">{exercise.xp_reward} XP</p>
            </div>

            {/* Tiempo estimado */}
            <div className="bg-purple-50 rounded-xl p-5 text-center border border-purple-100 hover:shadow-md transition-shadow">
              <Clock className="w-7 h-7 mx-auto text-purple-600 mb-2" />
              <p className="text-sm text-gray-600 mb-1">Tiempo estimado</p>
              <p className="text-2xl font-bold text-purple-700">
                {exercise.estimated_time_minutes} min
              </p>
            </div>

            {/* ML Coins */}
            <div className="bg-amber-50 rounded-xl p-5 text-center border border-amber-100 hover:shadow-md transition-shadow">
              <Gift className="w-7 h-7 mx-auto text-amber-600 mb-2" />
              <p className="text-sm text-gray-600 mb-1">ML Coins</p>
              <p className="text-2xl font-bold text-amber-700">
                {exercise.ml_coins_reward} ML
              </p>
            </div>
          </motion.div>

          {/* Mensaje informativo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 mb-8"
          >
            <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2 text-lg">
              <AlertCircle className="w-5 h-5" />
              Este ejercicio estará disponible próximamente
            </h3>
            <p className="text-amber-800 leading-relaxed">
              Actualmente estamos trabajando en implementar este ejercicio interactivo.
              Mientras tanto, te invitamos a completar los{' '}
              <span className="font-semibold">Módulos 1, 2 y 3</span> que ya están
              disponibles y completamente funcionales.
            </p>
          </motion.div>

          {/* Botones de acción */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            {/* Botón Volver al Módulo */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/modules/${moduleId}`)}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver al Módulo
            </motion.button>

            {/* Botón Ver Todos los Módulos */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/modules')}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <BookOpen className="w-5 h-5" />
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
