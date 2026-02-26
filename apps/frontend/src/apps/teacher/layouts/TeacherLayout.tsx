import type { ReactNode } from 'react';
import { PortalLayout } from '@shared/layouts/PortalLayout';
import type { User as UserType, UserGamificationData } from '@shared/types';
import type { User as AuthUser } from '@features/auth/types/auth.types';

interface TeacherLayoutProps {
  children: ReactNode;
  user?: UserType | AuthUser;
  gamificationData?: UserGamificationData | null;
  organizationName?: string;
  onLogout?: () => void;
}

const resolveTeacherOrgName = (name: string | undefined, platformName: string): string | undefined =>
  name ?? platformName;

export const TeacherLayout = ({
  children,
  user,
  gamificationData,
  organizationName,
  onLogout,
}: TeacherLayoutProps) => (
  <PortalLayout
    portalType="teacher"
    user={user}
    gamificationData={gamificationData}
    organizationName={organizationName}
    onLogout={onLogout}
    resolveOrgName={resolveTeacherOrgName}
  >
    {children}
  </PortalLayout>
);

export default TeacherLayout;
