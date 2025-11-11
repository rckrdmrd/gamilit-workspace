import React from 'react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { TeacherLayout } from '../layouts/TeacherLayout';

/**
 * TeacherResourcesPage - Página de recursos educativos
 *
 * Placeholder para la funcionalidad de gestión de recursos educativos,
 * materiales didácticos y biblioteca de contenidos.
 */
export default function TeacherResourcesPage() {
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
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Recursos Educativos</h1>
        <p className="text-gray-600">Esta pantalla está en desarrollo.</p>
      </div>
    </TeacherLayout>
  );
}
