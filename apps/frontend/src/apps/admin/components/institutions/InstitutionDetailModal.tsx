import { useEffect, useState } from 'react';
import { Modal } from '@shared/components/common/Modal';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { InstitutionStats, InstitutionStatsData } from './InstitutionStats';
import { Organization } from '../../types';
import {
  Building2,
  Calendar,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Users,
  Settings,
  X,
  ExternalLink,
} from 'lucide-react';

interface InstitutionDetailModalProps {
  isOpen: boolean;
  institution: Organization | null;
  stats?: InstitutionStatsData | null;
  loading?: boolean;
  onClose: () => void;
  onEdit?: (institution: Organization) => void;
  onManageFeatures?: (institution: Organization) => void;
}

/**
 * InstitutionDetailModal - Modal con detalles completos de la institución
 *
 * Muestra:
 * - Información general (nombre, tipo, plan, estado)
 * - Datos de contacto
 * - Información de suscripción
 * - Estadísticas de uso (usuarios, ejercicios, progreso)
 * - Features habilitadas
 * - Acciones: editar, gestionar features
 *
 * @component
 */
export const InstitutionDetailModal = ({
  isOpen,
  institution,
  stats,
  loading = false,
  onClose,
  onEdit,
  onManageFeatures,
}: InstitutionDetailModalProps) => {
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (isOpen && institution && !stats) {
      setLoadingStats(true);
      // Simular carga de stats
      setTimeout(() => setLoadingStats(false), 500);
    }
  }, [isOpen, institution, stats]);

  if (!institution) return null;

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

  const typeLabels: Record<string, string> = {
    school: 'Escuela',
    university: 'Universidad',
    corporate: 'Corporativo',
    individual: 'Individual',
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-700 pb-4">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-detective-orange/20">
              <Building2 className="h-8 w-8 text-detective-orange" />
            </div>
            <div>
              <h2 className="break-words text-2xl font-bold text-detective-text">
                {institution.name}
              </h2>
              <p className="mt-1 text-sm text-detective-text-secondary">
                ID: {institution.id}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span
                  className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                    planColors[institution.plan] || planColors.free
                  }`}
                >
                  {institution.plan.toUpperCase()}
                </span>
                <span
                  className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                    statusColors[institution.status] || statusColors.inactive
                  }`}
                >
                  {statusLabels[institution.status] || 'Desconocido'}
                </span>
                {institution.type && (
                  <span className="rounded-lg bg-gray-500/20 px-3 py-1 text-xs font-semibold text-gray-400">
                    {typeLabels[institution.type] || institution.type}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-detective-text"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Estadísticas */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-detective-text">
            Estadísticas de Uso
          </h3>
          <InstitutionStats stats={stats ?? null} loading={loadingStats || loading} />
        </div>

        {/* Información General */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Información de Contacto */}
          {institution.contact && (
            <div className="rounded-lg border border-gray-700 bg-detective-bg-secondary p-4">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-detective-text">
                <Users className="h-5 w-5 text-detective-orange" />
                Contacto
              </h3>
              <div className="space-y-3">
                {institution.contact.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-detective-text-secondary">Email</p>
                      <a
                        href={`mailto:${institution.contact.email}`}
                        className="text-sm text-detective-text hover:text-detective-orange"
                      >
                        {institution.contact.email}
                      </a>
                    </div>
                  </div>
                )}
                {institution.contact.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-detective-text-secondary">Teléfono</p>
                      <p className="text-sm text-detective-text">
                        {institution.contact.phone}
                      </p>
                    </div>
                  </div>
                )}
                {institution.contact.address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-detective-text-secondary">Dirección</p>
                      <p className="text-sm text-detective-text">
                        {institution.contact.address}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Información de Suscripción */}
          <div className="rounded-lg border border-gray-700 bg-detective-bg-secondary p-4">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-detective-text">
              <CreditCard className="h-5 w-5 text-detective-orange" />
              Suscripción
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-detective-text-secondary">Fecha de Inicio</p>
                  <p className="text-sm text-detective-text">
                    {institution.subscription?.startDate
                      ? formatDate(institution.subscription.startDate)
                      : formatDate(institution.createdAt)}
                  </p>
                </div>
              </div>
              {institution.subscription?.endDate && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-detective-text-secondary">Fecha de Fin</p>
                    <p className="text-sm text-detective-text">
                      {formatDate(institution.subscription.endDate)}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-xs text-detective-text-secondary">
                    Renovación Automática
                  </p>
                  <p className="text-sm text-detective-text">
                    {institution.subscription?.autoRenew ? 'Sí' : 'No'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Habilitadas */}
        {institution.features && institution.features.length > 0 && (
          <div className="rounded-lg border border-gray-700 bg-detective-bg-secondary p-4">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-detective-text">
              <Settings className="h-5 w-5 text-detective-orange" />
              Features Habilitadas
            </h3>
            <div className="flex flex-wrap gap-2">
              {institution.features.map((feature) => (
                <span
                  key={feature}
                  className="rounded-lg bg-blue-500/20 px-3 py-1.5 text-sm font-medium text-blue-500"
                >
                  {feature.replace(/_/g, ' ').toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex justify-end gap-3 border-t border-gray-700 pt-4">
          <DetectiveButton variant="secondary" onClick={onClose}>
            Cerrar
          </DetectiveButton>
          {onManageFeatures && (
            <DetectiveButton
              variant="secondary"
              onClick={() => {
                onManageFeatures(institution);
                onClose();
              }}
            >
              <Settings className="h-4 w-4" />
              Gestionar Features
            </DetectiveButton>
          )}
          {onEdit && (
            <DetectiveButton
              variant="primary"
              onClick={() => {
                onEdit(institution);
                onClose();
              }}
            >
              <ExternalLink className="h-4 w-4" />
              Editar Institución
            </DetectiveButton>
          )}
        </div>
      </div>
    </Modal>
  );
};
