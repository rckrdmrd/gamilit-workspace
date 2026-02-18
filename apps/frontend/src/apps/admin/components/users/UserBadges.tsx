/**
 * UserBadges - Reusable badge renderers for user role and status
 *
 * Extracts the inline getRoleBadge/getStatusBadge functions from AdminUsersPage
 * into standalone components that can be shared across admin views.
 */

import { CheckCircle, XCircle } from 'lucide-react';

const ROLE_COLORS: Record<string, string> = {
  student: 'bg-blue-100 text-blue-700',
  admin_teacher: 'bg-purple-100 text-purple-700',
  super_admin: 'bg-red-100 text-red-700',
};

const ROLE_LABELS: Record<string, string> = {
  student: 'Estudiante',
  admin_teacher: 'Profesor',
  super_admin: 'Super Admin',
};

interface StatusConfig {
  label: string;
  color: string;
  icon: typeof CheckCircle;
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  active: { label: 'Activo', color: 'text-green-600', icon: CheckCircle },
  inactive: { label: 'Inactivo', color: 'text-gray-600', icon: XCircle },
  suspended: { label: 'Suspendido', color: 'text-red-600', icon: XCircle },
  banned: { label: 'Baneado', color: 'text-red-700', icon: XCircle },
  pending: { label: 'Pendiente', color: 'text-yellow-600', icon: XCircle },
};

export function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-medium ${ROLE_COLORS[role] || 'bg-gray-100 text-gray-700'}`}
    >
      {ROLE_LABELS[role] || role}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    color: 'text-gray-600',
    icon: XCircle,
  };
  const Icon = config.icon;
  return (
    <span className={`flex items-center gap-1 ${config.color}`}>
      <Icon className="h-4 w-4" />
      <span className="text-sm">{config.label}</span>
    </span>
  );
}
