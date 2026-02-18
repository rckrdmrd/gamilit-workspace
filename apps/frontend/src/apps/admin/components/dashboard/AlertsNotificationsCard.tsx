import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { AlertCircle, ShieldCheck } from 'lucide-react';

interface AlertItem {
  id: string;
  severity: string;
  title: string;
  message: string;
  dismissed: boolean;
}

interface AlertsNotificationsCardProps {
  alerts: AlertItem[] | null;
  flaggedContentCount?: number | null;
  onDismissAlert: (id: string) => void;
}

/**
 * AlertsNotificationsCard - Alerts & notifications panel for the admin dashboard
 *
 * Shows up to 5 alerts sorted by severity, or a flagged-content fallback + empty state.
 * Extracted from AdminDashboardPage inline rendering.
 */
export const AlertsNotificationsCard: React.FC<AlertsNotificationsCardProps> = ({
  alerts,
  flaggedContentCount,
  onDismissAlert,
}) => {
  return (
    <DetectiveCard>
      <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-detective-text">
        <AlertCircle className="h-6 w-6 text-orange-500" />
        Alertas y Notificaciones
      </h2>

      {alerts && alerts.length > 0 ? (
        <div className="space-y-3">
          {alerts.slice(0, 5).map((alert) => (
            <div
              key={alert.id}
              className={`flex items-start gap-3 rounded-lg border p-3 ${
                alert.severity === 'high'
                  ? 'border-red-500/30 bg-red-900/20'
                  : alert.severity === 'medium'
                    ? 'border-yellow-500/30 bg-yellow-900/20'
                    : 'border-blue-500/30 bg-blue-900/20'
              }`}
            >
              <AlertCircle
                className={`mt-0.5 h-5 w-5 ${
                  alert.severity === 'high'
                    ? 'text-red-500'
                    : alert.severity === 'medium'
                      ? 'text-yellow-500'
                      : 'text-blue-500'
                }`}
              />
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${
                    alert.severity === 'high'
                      ? 'text-red-400'
                      : alert.severity === 'medium'
                        ? 'text-yellow-400'
                        : 'text-blue-400'
                  }`}
                >
                  {alert.title}
                </p>
                <p className="mt-1 text-xs text-detective-text-secondary">
                  {alert.message}
                </p>
              </div>
              {!alert.dismissed && (
                <button
                  onClick={() => onDismissAlert(alert.id)}
                  className="text-xs text-detective-text-secondary hover:text-detective-text"
                >
                  {'\u2715'}
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {flaggedContentCount !== null &&
            flaggedContentCount !== undefined &&
            flaggedContentCount > 0 && (
              <div className="flex items-start gap-3 rounded-lg border border-yellow-500/30 bg-yellow-900/20 p-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-yellow-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-400">
                    {flaggedContentCount} Contenido Flagged
                  </p>
                  <p className="mt-1 text-xs text-detective-text-secondary">
                    Requiere revision
                  </p>
                </div>
              </div>
            )}

          <div className="py-4 text-center text-sm text-detective-text-secondary">
            <p>No hay alertas activas en este momento</p>
            <p className="mt-1 text-xs">{'\u24D8'} Sistema de alertas en tiempo real proximamente</p>
          </div>
        </div>
      )}
    </DetectiveCard>
  );
};
