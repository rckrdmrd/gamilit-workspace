import React from 'react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { TeacherLayout } from '../layouts/TeacherLayout';
import TeacherDashboard from './TeacherDashboard';

/**
 * TeacherDashboardPage - Wrapper que combina TeacherLayout con TeacherDashboard
 *
 * Este componente envuelve el TeacherDashboard existente con el nuevo TeacherLayout
 * que incluye el sidebar de navegación.
 */
export default function TeacherDashboardPage() {
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
      organizationName="Escuela Primaria Miguel Hidalgo"
      onLogout={handleLogout}
    >
      <TeacherDashboard />
    </TeacherLayout>
  );
}
