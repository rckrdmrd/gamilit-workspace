import type { ReactNode } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout';
import { useAdminPageSetup } from '../../hooks/useAdminPageSetup';

export interface AdminPageShellProps {
  children: ReactNode;
}

/**
 * AdminPageShell - Wrapper that eliminates admin page boilerplate
 *
 * Combines useAdminPageSetup + AdminLayout into a single wrapper.
 * Pages just pass children — no need to manually wire useAuth,
 * useUserGamification, displayGamificationData, or handleLogout.
 *
 * @example
 * ```tsx
 * export default function AdminSomePage() {
 *   return (
 *     <AdminPageShell>
 *       <h1>Page Content</h1>
 *     </AdminPageShell>
 *   );
 * }
 * ```
 */
export function AdminPageShell({ children }: AdminPageShellProps) {
  const { user, displayGamificationData, handleLogout } = useAdminPageSetup();

  return (
    <AdminLayout
      user={user || undefined}
      gamificationData={displayGamificationData}
      organizationName="GAMILIT Platform Admin"
      onLogout={handleLogout}
    >
      {children}
    </AdminLayout>
  );
}
