/**
 * ChildProgressPage
 *
 * EXT-011 Parent Portal - Child Progress Detail Page
 *
 * @description Detailed progress view for a specific child.
 * @see ET-PAR-002-portal-dashboard.md
 * @created 2026-01-27
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useParentStore } from '@/features/parent/store/parentStore';
import { WeeklyReportView } from '@/features/parent/WeeklyReportView';
import {
  ArrowLeft,
  TrendingUp,
  Award,
  Flame,
  Target,
  BookOpen,
  Star,
} from 'lucide-react';
import { parentAPI } from '@/features/parent/api/parentAPI';
import type { RecentActivity, UpcomingAssignment, WeeklyReport } from '@/features/parent/types/parent.types';

export const ChildProgressPage = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const { students, progressSummaries, loadStudentProgress, isLoading: _isLoading } = useParentStore();

  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [assignments, setAssignments] = useState<UpcomingAssignment[]>([]);
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'activities' | 'reports'>('overview');
  const [isLoadingData, setIsLoadingData] = useState(true);

  const student = students.find((s) => s.studentId === studentId);
  const progress = progressSummaries.find((p) => p.studentId === studentId);

  useEffect(() => {
    if (!studentId) return;

    const loadData = async () => {
      setIsLoadingData(true);
      try {
        await Promise.all([
          loadStudentProgress(studentId),
          parentAPI.getStudentActivities(studentId, 20).then(setActivities),
          parentAPI.getStudentAssignments(studentId, 10).then(setAssignments),
          parentAPI.getWeeklyReports(10).then(setReports),
        ]);
      } catch (error) {
        console.error('Error loading student data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, [studentId, loadStudentProgress]);

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Estudiante no encontrado</p>
          <Link to="/parent/dashboard" className="text-indigo-600 hover:underline">
            Volver al Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const initials = student.displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <button
              onClick={() => navigate('/parent/dashboard')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Volver al dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              {student.avatarUrl ? (
                <img
                  src={student.avatarUrl}
                  alt={student.displayName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  {initials}
                </div>
              )}
              <div>
                <h1 className="font-bold text-gray-900">{student.displayName}</h1>
                {progress && (
                  <p className="text-sm text-gray-500">
                    Nivel {progress.currentLevel} - {progress.currentRank}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <nav className="flex gap-2 mb-6 bg-white p-1 rounded-lg shadow-sm inline-flex" role="tablist" aria-label="Secciones de progreso">
          {[
            { id: 'overview', label: 'Resumen' },
            { id: 'activities', label: 'Actividades' },
            { id: 'reports', label: 'Reportes' },
          ].map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
              onClick={() => setActiveTab(tab.id as 'overview' | 'activities' | 'reports')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {isLoadingData ? (
          <div className="space-y-6 py-4" aria-live="polite" aria-label="Cargando datos">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-200 rounded-lg w-9 h-9" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-16 bg-gray-200 rounded" />
                      <div className="h-5 w-10 bg-gray-200 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="animate-pulse bg-white rounded-xl p-6 shadow-sm space-y-3">
              <div className="h-4 w-40 bg-gray-200 rounded" />
              <div className="h-3 w-full bg-gray-200 rounded" />
              <div className="h-3 w-3/4 bg-gray-200 rounded" />
            </div>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && progress && (
              <div className="space-y-6" id="tabpanel-overview" role="tabpanel" aria-label="Resumen">
                {/* Main Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <Star className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">XP Total</p>
                        <p className="text-xl font-bold text-gray-900">
                          {progress.totalXp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Flame className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Racha Actual</p>
                        <p className="text-xl font-bold text-gray-900">
                          {progress.currentStreak} dias
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <BookOpen className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Modulos</p>
                        <p className="text-xl font-bold text-gray-900">
                          {progress.modulesCompleted}/{progress.modulesInProgress + progress.modulesCompleted}
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
                        <Target className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Precision</p>
                        <p className="text-xl font-bold text-gray-900">
                          {Math.round(progress.averageAccuracyThisWeek)}%
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Weekly Summary */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Resumen de la Semana
                  </h3>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-indigo-600">
                        {progress.xpThisWeek.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">XP Ganados</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">
                        {progress.exercisesCompletedThisWeek}
                      </p>
                      <p className="text-sm text-gray-500">Ejercicios</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-yellow-600">
                        {progress.recentAchievements.length}
                      </p>
                      <p className="text-sm text-gray-500">Logros</p>
                    </div>
                  </div>
                </div>

                {/* Upcoming Assignments */}
                {assignments.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Tareas Pendientes
                    </h3>
                    <div className="space-y-3">
                      {assignments.map((assignment) => (
                        <div
                          key={assignment.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{assignment.title}</p>
                            <p className="text-sm text-gray-500">
                              {assignment.className || 'Sin clase asignada'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(assignment.dueDate).toLocaleDateString('es-MX')}
                            </p>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                assignment.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {assignment.status === 'pending' ? 'Pendiente' : 'Atrasada'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Activities Tab */}
            {activeTab === 'activities' && (
              <div className="bg-white rounded-xl shadow-sm divide-y" id="tabpanel-activities" role="tabpanel" aria-label="Actividades">
                {activities.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No hay actividades recientes
                  </div>
                ) : (
                  activities.map((activity) => (
                    <div key={activity.id} className="p-4 flex items-start gap-4">
                      <div
                        className={`p-2 rounded-lg ${
                          activity.activityType === 'exercise_completed'
                            ? 'bg-green-100'
                            : activity.activityType === 'achievement_unlocked'
                              ? 'bg-yellow-100'
                              : activity.activityType === 'level_up'
                                ? 'bg-purple-100'
                                : 'bg-gray-100'
                        }`}
                      >
                        {activity.activityType === 'exercise_completed' && (
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        )}
                        {activity.activityType === 'achievement_unlocked' && (
                          <Award className="w-5 h-5 text-yellow-600" />
                        )}
                        {activity.activityType === 'level_up' && (
                          <Star className="w-5 h-5 text-purple-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(activity.timestamp).toLocaleDateString('es-MX', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
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
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && studentId && (
              <div id="tabpanel-reports" role="tabpanel" aria-label="Reportes">
              <WeeklyReportView
                studentId={studentId}
                reports={reports.filter((r) => r.studentId === studentId)}
              />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ChildProgressPage;
