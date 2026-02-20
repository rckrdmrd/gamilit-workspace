import { GamifiedHeader } from '@shared/components/layout/GamifiedHeader';
import { useStudentPageSetup } from '../../hooks/useStudentPageSetup';
import type { ReactNode } from 'react';

export interface StudentPageShellProps {
  children: ReactNode;
  /** Whether to show the GamifiedHeader (some pages like exercises may not need it) */
  showHeader?: boolean;
}

/**
 * StudentPageShell - Wrapper that eliminates student page boilerplate
 *
 * Combines useStudentPageSetup + GamifiedHeader into a single wrapper.
 * Pages just pass children -- no need to manually wire useAuth,
 * useUserGamification, displayGamificationData, or handleLogout.
 *
 * Unlike AdminPageShell which wraps AdminLayout, the student portal
 * uses GamifiedHeader directly (no layout wrapper component).
 *
 * @example
 * ```tsx
 * export default function StudentSomePage() {
 *   return (
 *     <StudentPageShell>
 *       <h1>Page Content</h1>
 *     </StudentPageShell>
 *   );
 * }
 * ```
 */
export function StudentPageShell({ children, showHeader = true }: StudentPageShellProps) {
  const { user, displayGamificationData, handleLogout } = useStudentPageSetup();

  return (
    <>
      {showHeader && (
        <GamifiedHeader
          user={user || undefined}
          gamificationData={displayGamificationData}
          onLogout={handleLogout}
        />
      )}
      {children}
    </>
  );
}
