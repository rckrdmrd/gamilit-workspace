import { motion } from 'framer-motion';
import {
  Bell,
  Check,
  Trash2,
  AlertCircle,
  Megaphone,
  Shield,
  Users,
  Building2,
  Activity,
  Database,
} from 'lucide-react';
import { cn } from '@shared/utils/cn';

// Notification type icons mapping for admin
const notificationIcons: Record<string, React.ElementType> = {
  system_announcement: Megaphone,
  security_alert: Shield,
  user_activity: Users,
  institution_update: Building2,
  system_health: Activity,
  database_alert: Database,
  alert: AlertCircle,
};

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

// Format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Ahora mismo';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

export interface NotificationItemProps {
  notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    status: string;
    createdAt: string;
  };
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
}) => {
  const Icon = notificationIcons[notification.type] || Bell;
  const isUnread = notification.status === 'unread';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={cn(
        'p-4 rounded-xl border transition-all',
        isUnread
          ? 'bg-white/10 border-purple-500/30 hover:border-purple-500/50'
          : 'bg-white/5 border-white/10 hover:border-white/20',
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'p-2.5 rounded-xl',
            isUnread ? 'bg-purple-500/20' : 'bg-white/10',
          )}
        >
          <Icon className={cn('w-5 h-5', isUnread ? 'text-purple-400' : 'text-gray-400')} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3
                className={cn(
                  'font-medium',
                  isUnread ? 'text-white' : 'text-gray-300',
                )}
              >
                {notification.title}
              </h3>
              <p className="text-sm text-gray-400 mt-0.5">{notification.message}</p>
            </div>
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {formatRelativeTime(notification.createdAt)}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-400">
              {notificationLabels[notification.type] || notification.type}
            </span>
            {isUnread && <span className="w-2 h-2 rounded-full bg-purple-500" />}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {isUnread && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onMarkAsRead(notification.id)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors group"
              title="Marcar como leida"
            >
              <Check className="w-4 h-4 text-gray-400 group-hover:text-green-400" />
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onDelete(notification.id)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors group"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-400" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
