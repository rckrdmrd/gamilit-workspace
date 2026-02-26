import type { ReactNode } from 'react';
import { PortalLayout } from '@shared/layouts/PortalLayout';
import type { User as UserType, UserGamificationData } from '@shared/types';
import type { User as AuthUser } from '@features/auth/types/auth.types';

interface AdminLayoutProps {
  children: ReactNode;
  user?: UserType | AuthUser;
  gamificationData?: UserGamificationData | null;
  organizationName?: string;
  onLogout?: () => void;
}

const resolveAdminOrgName = (name: string | undefined, platformName: string): string | undefined =>
  name === 'GAMILIT Platform Admin' ? platformName : name;

export const AdminLayout = ({
  children,
  user,
  gamificationData,
  organizationName,
  onLogout,
}: AdminLayoutProps) => (
  <PortalLayout
    portalType="admin"
    user={user}
    gamificationData={gamificationData}
    organizationName={organizationName}
    onLogout={onLogout}
    resolveOrgName={resolveAdminOrgName}
  >
    {children}
  </PortalLayout>
);

export default AdminLayout;
