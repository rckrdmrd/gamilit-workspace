import React from 'react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { TeacherLayout } from '../layouts/TeacherLayout';
import TeacherGamification from './TeacherGamification';

/**
 * TeacherGamificationPage - Página de gestión de gamificación
 */
export default function TeacherGamificationPage() {
  const { user, logout } = useAuth();

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
      <TeacherGamification />
    </TeacherLayout>
  );
}
