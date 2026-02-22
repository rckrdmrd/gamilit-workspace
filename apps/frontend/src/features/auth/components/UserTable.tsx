import { useMemo } from 'react';
import { Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import { StatusBadge, StatusType } from '@shared/components/base/StatusBadge';
import { DataTable, Column, RowAction } from '@shared/components/common/DataTable';
import type { User } from '@features/auth/types/auth.types';

interface UserTableProps {
  users: User[];
  currentUserId?: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onActivate?: (id: string) => void;
  onDeactivate?: (id: string) => void;
}

const getRoleBadge = (role: string) => {
  const colors = {
    'student': 'bg-blue-100 text-blue-800',
    'admin_teacher': 'bg-green-100 text-green-800',
    'super_admin': 'bg-purple-100 text-purple-800'
  };
  return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

const getRoleLabel = (role: string) => {
  const labels = {
    'student': 'Estudiante',
    'admin_teacher': 'Profesor',
    'super_admin': 'Super Admin'
  };
  return labels[role as keyof typeof labels] || role;
};

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};

const getStatusType = (user: User): StatusType => {
  return user.isActive === false ? 'inactive' : 'active';
};

export const UserTable = ({
  users,
  currentUserId,
  onEdit,
  onDelete,
  onActivate,
  onDeactivate,
}: UserTableProps) => {
  const columns: Column<User>[] = useMemo(() => [
    {
      key: 'fullName',
      label: 'Usuario',
      render: (user) => (
        <span className="text-detective-body font-medium">
          {user.fullName}
          {user.id === currentUserId && (
            <span className="ml-2 text-xs text-detective-orange font-normal">(Tu)</span>
          )}
        </span>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (user) => (
        <span className="text-detective-small">{user.email}</span>
      ),
    },
    {
      key: 'role',
      label: 'Rol',
      render: (user) => (
        <span className={`px-2 py-1 rounded text-xs ${getRoleBadge(user.role)}`}>
          {getRoleLabel(user.role)}
        </span>
      ),
    },
    {
      key: 'isActive',
      label: 'Estado',
      render: (user) => <StatusBadge status={getStatusType(user)} />,
    },
    {
      key: 'createdAt',
      label: 'Fecha Creacion',
      render: (user) => (
        <span className="text-detective-small">{formatDate(user.createdAt)}</span>
      ),
    },
  ], [currentUserId]);

  const rowActions: RowAction<User>[] = useMemo(() => {
    const actions: RowAction<User>[] = [];

    if (onActivate) {
      actions.push({
        key: 'activate',
        label: 'Activar usuario',
        icon: <UserCheck className="w-4 h-4" />,
        onClick: (user) => onActivate(user.id),
        hidden: (user) => user.id === currentUserId || user.isActive !== false,
      });
    }

    if (onDeactivate) {
      actions.push({
        key: 'deactivate',
        label: 'Desactivar usuario',
        icon: <UserX className="w-4 h-4" />,
        onClick: (user) => onDeactivate(user.id),
        hidden: (user) => user.id === currentUserId || user.isActive === false,
        variant: 'danger',
      });
    }

    actions.push(
      {
        key: 'edit',
        label: 'Editar usuario',
        icon: <Edit className="w-4 h-4" />,
        onClick: (user) => onEdit(user.id),
      },
      {
        key: 'delete',
        label: 'Eliminar usuario',
        icon: <Trash2 className="w-4 h-4" />,
        onClick: (user) => onDelete(user.id),
        disabled: (user) => user.id === currentUserId,
        variant: 'danger',
      },
    );

    return actions;
  }, [currentUserId, onEdit, onDelete, onActivate, onDeactivate]);

  return (
    <DataTable<User>
      data={users}
      columns={columns}
      rowActions={rowActions}
      rowKey={(user) => user.id}
      emptyMessage="No se encontraron usuarios"
      striped={false}
      hoverable
    />
  );
};
