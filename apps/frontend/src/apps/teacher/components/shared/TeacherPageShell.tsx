import type { ReactNode } from 'react';
import { TeacherLayout } from '../../layouts/TeacherLayout';
import { useTeacherPageSetup } from '../../hooks/useTeacherPageSetup';

interface TeacherPageShellProps {
  children: ReactNode;
}

/**
 * TeacherPageShell - Wrapper that eliminates teacher page boilerplate
 *
 * Combines useTeacherPageSetup + TeacherLayout into a single wrapper.
 * Pages just pass children — no need to manually wire useAuth,
 * useUserGamification, displayGamificationData, or handleLogout.
 *
 * This component replaces the withTeacherLayout HOC pattern with
 * a composable PageShell pattern consistent with AdminPageShell.
 *
 * @example
 * ```tsx
 * export default function TeacherSomePage() {
 *   return (
 *     <TeacherPageShell>
 *       <h1>Page Content</h1>
 *     </TeacherPageShell>
 *   );
 * }
 * ```
 */
export function TeacherPageShell({ children }: TeacherPageShellProps) {
  const { user, displayGamificationData, handleLogout } = useTeacherPageSetup();

  return (
    <TeacherLayout
      user={user ?? undefined}
      gamificationData={displayGamificationData}
      organizationName={user?.organization?.name || 'Mi Institucion'}
      onLogout={handleLogout}
    >
      {children}
    </TeacherLayout>
  );
}

export type { TeacherPageShellProps };
