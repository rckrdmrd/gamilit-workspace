import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@shared/utils/cn';

// Notification type labels
const notificationLabels: Record<string, string> = {
  system_announcement: 'Anuncio del Sistema',
  security_alert: 'Alerta de Seguridad',
  user_activity: 'Actividad de Usuarios',
  institution_update: 'Actualizacion de Institucion',
  system_health: 'Estado del Sistema',
  database_alert: 'Alerta de Base de Datos',
  alert: 'Alerta General',
};

type StatusFilter = 'all' | 'unread' | 'read';

export interface NotificationFiltersProps {
  statusFilter: StatusFilter;
  typeFilter: string;
  availableTypes: string[];
  showFilters: boolean;
  onStatusFilterChange: (status: StatusFilter) => void;
  onTypeFilterChange: (type: string) => void;
}

export const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  statusFilter,
  typeFilter,
  availableTypes,
  showFilters,
  onStatusFilterChange,
  onTypeFilterChange,
}) => (
  <AnimatePresence>
    {showFilters && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="overflow-hidden"
      >
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Estado</label>
              <div className="flex gap-2">
                {(['all', 'unread', 'read'] as StatusFilter[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => onStatusFilterChange(status)}
                    className={cn(
                      'px-3 py-1 rounded-lg text-sm transition-colors',
                      statusFilter === status
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20',
                    )}
                  >
                    {status === 'all' ? 'Todas' : status === 'unread' ? 'No leidas' : 'Leidas'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400">Tipo</label>
              <select
                value={typeFilter}
                onChange={(e) => onTypeFilterChange(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-white/10 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Todos los tipos</option>
                {availableTypes.map((type) => (
                  <option key={type} value={type}>
                    {notificationLabels[type] || type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);
