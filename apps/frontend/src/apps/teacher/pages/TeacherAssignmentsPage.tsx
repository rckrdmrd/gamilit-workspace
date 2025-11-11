import React from 'react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { TeacherLayout } from '../layouts/TeacherLayout';
import TeacherAssignments from './TeacherAssignments';

/**
 * TeacherAssignmentsPage - Wrapper para la gestión de asignaciones
 *
 * Este componente envuelve el TeacherAssignments existente con el TeacherLayout
 * que incluye el sidebar de navegación y header gamificado.
 */
export default function TeacherAssignmentsPage() {
  const { user, logout } = useAuth();

  // Mock gamification data - reemplazar con datos reales del API
  // Format matches UserGamificationData from @shared/types
  const gamificationData = {
    userId: user?.id || 'mock-teacher-id',
    level: 15,
    totalXP: 2450,
    mlCoins: 1250,
    rank: 'Mentor Experto',
    achievements: ['first_class', 'streak_master', '100_students'],
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
      <TeacherAssignments />
    </TeacherLayout>
  );
}
