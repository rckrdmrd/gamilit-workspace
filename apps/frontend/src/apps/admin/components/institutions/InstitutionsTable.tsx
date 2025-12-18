import React from 'react';
import { Users, Calendar, Edit, Eye, Settings, TrendingUp } from 'lucide-react';
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
 * - Nombre de la institución
 * - Plan suscrito
 * - Estado (activo/inactivo/suspendido)
 * - Número de usuarios activos
 * - Fecha de creación
 * - Acciones: ver detalle, editar, gestionar features
 *
 * @component
 */
export const InstitutionsTable: React.FC<InstitutionsTableProps> = ({
  institutions,
  loading = false,
  onView,
  onEdit,
  onManageFeatures,
}) => {
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
      return 'Fecha inválida';
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
      <div className="rounded-lg border border-gray-700 bg-detective-bg-secondary p-12 text-center">
        <div className="mb-4 text-6xl">🏢</div>
        <h3 className="mb-2 text-lg font-semibold text-detective-text">
          No hay instituciones
        </h3>
        <p className="text-detective-text-secondary">
          No se encontraron instituciones que coincidan con los filtros aplicados
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-700 bg-detective-bg-secondary">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-700 bg-detective-bg">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-detective-text">
                Institución
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-detective-text">
                Plan
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-detective-text">
                Estado
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-detective-text">
                Usuarios
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-detective-text">
                Fecha Creación
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-detective-text">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {institutions.map((institution) => (
              <tr
                key={institution.id}
                className="transition-colors hover:bg-detective-bg/50"
              >
                {/* Institución */}
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-detective-text">{institution.name}</p>
                    <p className="text-xs text-gray-400">ID: {institution.id}</p>
                  </div>
                </td>

                {/* Plan */}
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      planColors[institution.plan] || planColors.free
                    }`}
                  >
                    <TrendingUp className="h-3.5 w-3.5" />
                    {institution.plan.toUpperCase()}
                  </span>
                </td>

                {/* Estado */}
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      statusColors[institution.status] || statusColors.inactive
                    }`}
                  >
                    {statusLabels[institution.status] || 'Desconocido'}
                  </span>
                </td>

                {/* Usuarios */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-detective-text">
                      {institution.userCount ?? 0}
                    </span>
                  </div>
                </td>

                {/* Fecha */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-detective-text-secondary">
                    <Calendar className="h-4 w-4" />
                    {formatDate(institution.createdAt)}
                  </div>
                </td>

                {/* Acciones */}
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    {onView && (
                      <button
                        onClick={() => onView(institution)}
                        className="rounded-lg bg-blue-500/20 p-2 text-blue-500 transition-colors hover:bg-blue-500/30"
                        title="Ver detalle"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(institution)}
                        className="rounded-lg bg-purple-500/20 p-2 text-purple-500 transition-colors hover:bg-purple-500/30"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    )}
                    {onManageFeatures && (
                      <button
                        onClick={() => onManageFeatures(institution)}
                        className="rounded-lg bg-orange-500/20 p-2 text-orange-500 transition-colors hover:bg-orange-500/30"
                        title="Gestionar features"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer con contador */}
      <div className="border-t border-gray-700 bg-detective-bg px-6 py-3">
        <p className="text-sm text-detective-text-secondary">
          Mostrando {institutions.length} instituciones
        </p>
      </div>
    </div>
  );
};
