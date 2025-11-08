import React from 'react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { TeacherLayout } from '../layouts/TeacherLayout';
import TeacherAnalytics from './TeacherAnalytics';

/**
 * TeacherAnalyticsPage - Wrapper para análisis y estadísticas
 *
 * Este componente envuelve el TeacherAnalytics existente con el TeacherLayout
 * que incluye el sidebar de navegación y header gamificado.
 */
export default function TeacherAnalyticsPage() {
  const { user, logout } = useAuth();

  // Mock gamification data - reemplazar con datos reales del API
  const gamificationData = {
    level: 15,
    xp: 2450,
    xp_to_next: 3000,
    ml: 1250,
    rank: 'Mentor Experto',
    badges: ['first_class', 'streak_master', '100_students'],
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <TeacherLayout
      user={user ?? undefined}
      gamificationData={gamificationData}
      organizationName="GLIT Platform"
      onLogout={handleLogout}
    >
      <TeacherAnalytics />
    </TeacherLayout>
  );
}
