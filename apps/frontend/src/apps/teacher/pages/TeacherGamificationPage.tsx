import React from 'react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { TeacherLayout } from '../layouts/TeacherLayout';
import TeacherGamification from './TeacherGamification';

/**
 * TeacherGamificationPage - Página de gestión de gamificación
 */
export default function TeacherGamificationPage() {
  const { user, logout } = useAuth();

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
      organizationName="Escuela Primaria Miguel Hidalgo"
      onLogout={handleLogout}
    >
      <TeacherGamification />
    </TeacherLayout>
  );
}
