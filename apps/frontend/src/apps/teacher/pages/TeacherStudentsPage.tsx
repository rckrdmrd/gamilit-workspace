import React from 'react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { useUserGamification } from '@/shared/hooks/useUserGamification';
import { TeacherLayout } from '../layouts/TeacherLayout';
import TeacherStudents from './TeacherStudents';

/**
 * TeacherStudentsPage - Wrapper para la gestión de estudiantes
 *
 * Este componente envuelve el TeacherStudents existente con el TeacherLayout
 * que incluye el sidebar de navegación y header gamificado.
 */
export default function TeacherStudentsPage() {
  const { user, logout } = useAuth();
  const { gamificationData } = useUserGamification(user?.id);

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
      <TeacherStudents />
    </TeacherLayout>
  );
}
