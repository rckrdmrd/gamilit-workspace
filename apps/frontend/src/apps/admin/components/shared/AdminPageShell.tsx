import React from 'react';
import { AdminLayout } from '../../layouts/AdminLayout';
import { useAdminPageSetup } from '../../hooks/useAdminPageSetup';

interface AdminPageShellProps {
  children: React.ReactNode;
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
export const AdminPageShell: React.FC<AdminPageShellProps> = ({ children }) => {
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
};
