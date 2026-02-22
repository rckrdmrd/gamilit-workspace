/**
 * ParentDashboardPage
 *
 * EXT-011 Parent Portal - Dashboard Page
 *
 * @description Main dashboard for parent portal showing linked students,
 * progress summaries, activities, and assignments.
 *
 * @see ET-PAR-002-portal-dashboard.md
 * @created 2026-01-27
 */

import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Modal } from '@shared/components/common/Modal';
import { useParentStore } from '@/features/parent/store/parentStore';
import { RelationshipType } from '@/features/parent/types/parent.types';
import { ChildProgressCard } from '@/features/parent/ChildProgressCard';
import {
  Users,
  Bell,
  Calendar,
  TrendingUp,
  Award,
  Clock,
  Plus,
  LogOut,
  AlertCircle,
} from 'lucide-react';

export const ParentDashboardPage = () => {
  const navigate = useNavigate();
  const {
    account,
    students,
    progressSummaries,
    recentActivities,
    upcomingAssignments,
    unreadNotifications,
    isLoading,
    error,
    loadDashboard,
    logout,
    selectStudent,
  } = useParentStore();

  const [showLinkModal, setShowLinkModal] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleLogout = () => {
    logout();
    navigate('/parent/login');
  };

  const handleViewProgress = (studentId: string) => {
    selectStudent(studentId);
    navigate(`/parent/child/${studentId}`);
  };

  if (isLoading && students.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" aria-live="polite">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👨‍👩‍👧‍👦</span>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Portal de Padres</h1>
                <p className="text-xs text-gray-500">
                  Bienvenido, {account?.displayName || 'Padre'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications (decorative — no dedicated page) */}
              <span
                className="relative p-2 text-gray-600 rounded-full"
                aria-label={`Notificaciones${unreadNotifications > 0 ? ` (${unreadNotifications} sin leer)` : ''}`}
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center" aria-hidden="true">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </span>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Cerrar sesion"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg"
            role="alert"
          >
            <AlertCircle className="w-5 h-5" aria-hidden="true" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Students Section */}
        <section className="mb-8" role="region" aria-label="Mis hijos">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Mis Hijos
            </h2>
            <button
              onClick={() => setShowLinkModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Vincular Hijo
            </button>
          </div>

          {students.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-8 text-center shadow-sm"
            >
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No tienes hijos vinculados
              </h3>
              <p className="text-gray-600 mb-4">
                Vincula a tu hijo usando el codigo que recibio al registrarse.
              </p>
              <button
                onClick={() => setShowLinkModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Vincular Hijo
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map((student, index) => {
                const progress = progressSummaries.find(
                  (p) => p.studentId === student.studentId,
                );
                return (
                  <motion.div
                    key={student.studentId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ChildProgressCard
                      student={student}
                      progress={progress}
                      onViewProgress={() => handleViewProgress(student.studentId)}
                    />
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* Stats Overview */}
        {students.length > 0 && (
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8" role="region" aria-label="Resumen de estadisticas">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">XP Esta Semana</p>
                  <p className="text-xl font-bold text-gray-900">
                    {progressSummaries.reduce((sum, p) => sum + p.xpThisWeek, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Award className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ejercicios</p>
                  <p className="text-xl font-bold text-gray-900">
                    {progressSummaries.reduce((sum, p) => sum + p.exercisesCompletedThisWeek, 0)}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Racha Promedio</p>
                  <p className="text-xl font-bold text-gray-900">
                    {Math.round(
                      progressSummaries.reduce((sum, p) => sum + p.currentStreak, 0) /
                        (progressSummaries.length || 1),
                    )}{' '}
                    dias
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tareas Pendientes</p>
                  <p className="text-xl font-bold text-gray-900">
                    {upcomingAssignments.filter((a) => a.status === 'pending').length}
                  </p>
                </div>
              </div>
            </motion.div>
          </section>
        )}

        {/* Recent Activity & Assignments */}
        {students.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <section role="region" aria-label="Actividad reciente">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Actividad Reciente</h2>
                <span className="text-sm text-gray-400 flex items-center gap-1">
                  Actividad Reciente
                </span>
              </div>

              <div className="bg-white rounded-xl shadow-sm divide-y">
                {recentActivities.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No hay actividad reciente
                  </div>
                ) : (
                  recentActivities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="p-4 flex items-start gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {activity.activityType === 'exercise_completed' && (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        )}
                        {activity.activityType === 'achievement_unlocked' && (
                          <Award className="w-4 h-4 text-yellow-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.studentName}
                        </p>
                        <p className="text-sm text-gray-600">{activity.title}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(activity.timestamp).toLocaleDateString('es-MX', {
                            weekday: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      {activity.xpEarned && (
                        <span className="text-sm font-semibold text-green-600">
                          +{activity.xpEarned} XP
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Upcoming Assignments */}
            <section role="region" aria-label="Tareas proximas">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Tareas Proximas</h2>
                <span className="text-sm text-gray-400 flex items-center gap-1">
                  Tareas Proximas
                </span>
              </div>

              <div className="bg-white rounded-xl shadow-sm divide-y">
                {upcomingAssignments.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No hay tareas pendientes
                  </div>
                ) : (
                  upcomingAssignments.slice(0, 5).map((assignment) => (
                    <div key={assignment.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {assignment.title}
                          </p>
                          <p className="text-sm text-gray-600">
                            {assignment.studentName}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            assignment.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : assignment.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {assignment.status === 'pending'
                            ? 'Pendiente'
                            : assignment.status === 'in_progress'
                              ? 'En Progreso'
                              : 'Atrasada'}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(assignment.dueDate).toLocaleDateString('es-MX')}
                        </span>
                        {assignment.className && (
                          <span>{assignment.className}</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Link Student Modal */}
      {showLinkModal && (
        <LinkStudentModal onClose={() => setShowLinkModal(false)} />
      )}
    </div>
  );
};

// Link Student Modal Component
const LinkStudentModal = ({ onClose }: { onClose: () => void }) => {
  const { linkStudent, isLoading, error } = useParentStore();
  const [studentCode, setStudentCode] = useState('');
  const [relationshipType, setRelationshipType] = useState('father');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await linkStudent({
        studentCode,
        relationshipType: relationshipType as RelationshipType,
      });
      onClose();
    } catch {
      // Error handled by store
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      animated
      size="md"
      title="Vincular Hijo"
      showCloseButton={false}
      className="rounded-xl shadow-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Codigo del Estudiante
          </label>
          <input
            type="text"
            value={studentCode}
            onChange={(e) => setStudentCode(e.target.value.toUpperCase())}
            placeholder="Ej: STU-ABC123"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Tu hijo recibio este codigo al registrarse en GAMILIT
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tu relacion
          </label>
          <select
            value={relationshipType}
            onChange={(e) => setRelationshipType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="father">Padre</option>
            <option value="mother">Madre</option>
            <option value="guardian">Tutor Legal</option>
            <option value="grandparent">Abuelo/a</option>
            <option value="other">Otro</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {isLoading ? 'Vinculando...' : 'Vincular'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ParentDashboardPage;
