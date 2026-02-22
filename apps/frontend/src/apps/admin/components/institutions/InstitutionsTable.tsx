import { Users, Calendar, Edit, Eye, Settings, TrendingUp, Building } from 'lucide-react';
import { EmptyState } from '@shared/components/feedback/EmptyState';
import { DataTable, type Column } from '@/shared/components/common/DataTable';
import { Organization } from '../../types';

interface InstitutionsTableProps {
  institutions: Organization[];
  loading?: boolean;
  onView?: (institution: Organization) => void;
  onEdit?: (institution: Organization) => void;
  onManageFeatures?: (institution: Organization) => void;
}

/**
 * InstitutionsTable - Tabla de instituciones
 *
 * Muestra:
 * - Nombre de la institucion
 * - Plan suscrito
 * - Estado (activo/inactivo/suspendido)
 * - Numero de usuarios activos
 * - Fecha de creacion
 * - Acciones: ver detalle, editar, gestionar features
 *
 * @component
 */
export const InstitutionsTable = ({
  institutions,
  loading = false,
  onView,
  onEdit,
  onManageFeatures,
}: InstitutionsTableProps) => {
  const planColors: Record<string, string> = {
    free: 'bg-gray-500/20 text-gray-500',
    basic: 'bg-green-500/20 text-green-500',
    professional: 'bg-blue-500/20 text-blue-500',
    enterprise: 'bg-purple-500/20 text-purple-500',
  };

  const statusColors: Record<string, string> = {
    active: 'bg-green-500/20 text-green-500',
    inactive: 'bg-gray-500/20 text-gray-500',
    suspended: 'bg-red-500/20 text-red-500',
  };

  const statusLabels: Record<string, string> = {
    active: 'Activo',
    inactive: 'Inactivo',
    suspended: 'Suspendido',
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Fecha invalida';
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-700 bg-detective-bg-secondary p-12 text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-detective-orange"></div>
        <p className="text-detective-text-secondary">Cargando instituciones...</p>
      </div>
    );
  }

  if (!institutions || institutions.length === 0) {
    return (
      <div className="rounded-lg border border-gray-700 bg-detective-bg-secondary">
        <EmptyState
          icon={Building}
          title="No hay instituciones"
          description="No se encontraron instituciones que coincidan con los filtros aplicados"
        />
      </div>
    );
  }

  const columns: Column<Organization>[] = [
    {
      key: 'name',
      label: 'Institucion',
      render: (institution) => (
        <div>
          <p className="font-medium text-detective-text">{institution.name}</p>
          <p className="text-xs text-gray-400">ID: {institution.id}</p>
        </div>
      ),
    },
    {
      key: 'plan',
      label: 'Plan',
      render: (institution) => (
        <span
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
            planColors[institution.plan] || planColors.free
          }`}
        >
          <TrendingUp className="h-3.5 w-3.5" />
          {institution.plan.toUpperCase()}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Estado',
      render: (institution) => (
        <span
          className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold ${
            statusColors[institution.status] || statusColors.inactive
          }`}
        >
          {statusLabels[institution.status] || 'Desconocido'}
        </span>
      ),
    },
    {
      key: 'userCount',
      label: 'Usuarios',
      render: (institution) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-400" />
          <span className="font-medium text-detective-text">
            {institution.userCount ?? 0}
          </span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Fecha Creacion',
      render: (institution) => (
        <div className="flex items-center gap-2 text-sm text-detective-text-secondary">
          <Calendar className="h-4 w-4" />
          {formatDate(institution.createdAt)}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Acciones',
      align: 'right',
      render: (institution) => (
        <div className="flex justify-end gap-2">
          {onView && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView(institution);
              }}
              className="rounded-lg bg-blue-500/20 p-2 text-blue-500 transition-colors hover:bg-blue-500/30"
              title="Ver detalle"
            >
              <Eye className="h-4 w-4" />
            </button>
          )}
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(institution);
              }}
              className="rounded-lg bg-purple-500/20 p-2 text-purple-500 transition-colors hover:bg-purple-500/30"
              title="Editar"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
          {onManageFeatures && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onManageFeatures(institution);
              }}
              className="rounded-lg bg-orange-500/20 p-2 text-orange-500 transition-colors hover:bg-orange-500/30"
              title="Gestionar features"
            >
              <Settings className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-gray-700 bg-detective-bg-secondary">
      <DataTable<Organization>
        data={institutions}
        columns={columns}
        emptyMessage="No hay instituciones"
        hoverable
        striped={false}
      />

      {/* Footer con contador */}
      <div className="border-t border-gray-700 bg-detective-bg px-6 py-3">
        <p className="text-sm text-detective-text-secondary">
          Mostrando {institutions.length} instituciones
        </p>
      </div>
    </div>
  );
};
