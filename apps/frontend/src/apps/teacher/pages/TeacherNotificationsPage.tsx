/**
 * TeacherNotificationsPage - Centro de Notificaciones para Portal Teacher
 *
 * Features:
 * - Lista completa de notificaciones con paginacion
 * - Filtros por estado (todas/leidas/no leidas)
 * - Filtros por tipo de notificacion
 * - Marcar como leida individual y masiva
 * - Eliminar notificaciones
 * - Conexion en tiempo real via WebSocket
 * - Responsive design
 *
 * Route: /teacher/notifications
 */

import { useState, useEffect, useMemo, useCallback, type ElementType } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Trash2,
  Settings,
  Filter,
  Trophy,
  TrendingUp,
  Users,
  Calendar,
  AlertCircle,
  Megaphone,
  RefreshCw,
  Check,
  BookOpen,
  MessageSquare,
  ClipboardCheck,
} from 'lucide-react';

// Layout
import { TeacherPageShell } from '../components/shared/TeacherPageShell';

// Store & Hooks
import { useNotificationsStore } from '@/features/notifications/store/notificationsStore';

// Utils
import { cn } from '@shared/utils/cn';

// Notification type icons mapping for teachers
const notificationIcons: Record<string, ElementType> = {
  achievement_unlocked: Trophy,
  rank_promoted: TrendingUp,
  assignment_submitted: ClipboardCheck,
  assignment_graded: CheckCheck,
  student_message: MessageSquare,
  class_update: BookOpen,
  system_announcement: Megaphone,
  alert: AlertCircle,
  calendar_event: Calendar,
  student_progress: TrendingUp,
  new_student: Users,
};

// Notification type labels
const notificationLabels: Record<string, string> = {
  achievement_unlocked: 'Logro Desbloqueado',
  rank_promoted: 'Subida de Rango',
  assignment_submitted: 'Tarea Entregada',
  assignment_graded: 'Tarea Calificada',
  student_message: 'Mensaje de Estudiante',
  class_update: 'Actualizacion de Clase',
  system_announcement: 'Anuncio del Sistema',
  alert: 'Alerta',
  calendar_event: 'Evento de Calendario',
  student_progress: 'Progreso de Estudiante',
  new_student: 'Nuevo Estudiante',
};

// Status filter type
type StatusFilter = 'all' | 'unread' | 'read';

export default function TeacherNotificationsPage() {
  // Store
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationsStore();

  // Local state
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  // Refresh notifications
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchNotifications();
    await fetchUnreadCount();
    setTimeout(() => setIsRefreshing(false), 500);
  }, [fetchNotifications, fetchUnreadCount]);

  // Handle mark as read
  const handleMarkAsRead = useCallback(
    async (notificationId: string) => {
      await markAsRead(notificationId);
      await fetchUnreadCount();
    },
    [markAsRead, fetchUnreadCount],
  );

  // Handle mark all as read
  const handleMarkAllAsRead = useCallback(async () => {
    await markAllAsRead();
    await fetchUnreadCount();
  }, [markAllAsRead, fetchUnreadCount]);

  // Handle delete
  const handleDelete = useCallback(
    async (notificationId: string) => {
      await deleteNotification(notificationId);
      await fetchUnreadCount();
    },
    [deleteNotification, fetchUnreadCount],
  );

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      // Status filter
      if (statusFilter === 'unread' && notification.status !== 'unread') return false;
      if (statusFilter === 'read' && notification.status !== 'read') return false;

      // Type filter
      if (typeFilter !== 'all' && notification.type !== typeFilter) return false;

      return true;
    });
  }, [notifications, statusFilter, typeFilter]);

  // Get unique notification types from current notifications
  const availableTypes = useMemo(() => {
    const types = new Set(notifications.map((n) => n.type));
    return Array.from(types);
  }, [notifications]);

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
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
  };

  return (
    <TeacherPageShell>
      <div className="detective-container py-6 sm:py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-detective-text">Notificaciones</h1>
              <p className="text-detective-text-secondary">
                {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todas leidas'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 min-w-[44px] min-h-[44px] rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <RefreshCw className={cn('w-5 h-5 text-white', isRefreshing && 'animate-spin')} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'p-2 min-w-[44px] min-h-[44px] rounded-lg transition-colors',
                showFilters ? 'bg-orange-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white',
              )}
            >
              <Filter className="w-5 h-5" />
            </motion.button>

            {unreadCount > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Marcar todas</span>
              </motion.button>
            )}

            <Link
              to="/teacher/settings/notifications"
              className="p-2 min-w-[44px] min-h-[44px] rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Settings className="w-5 h-5 text-white" />
            </Link>
          </div>
        </div>

        {/* Filters */}
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
                  {/* Status Filter */}
                  <div className="space-y-2">
                    <label className="text-sm text-detective-text-secondary">Estado</label>
                    <div className="flex gap-2">
                      {(['all', 'unread', 'read'] as StatusFilter[]).map((status) => (
                        <button
                          key={status}
                          onClick={() => setStatusFilter(status)}
                          className={cn(
                            'px-3 py-1 rounded-lg text-sm transition-colors',
                            statusFilter === status
                              ? 'bg-orange-500 text-white'
                              : 'bg-white/10 text-detective-text-secondary hover:bg-white/20',
                          )}
                        >
                          {status === 'all' ? 'Todas' : status === 'unread' ? 'No leidas' : 'Leidas'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Type Filter */}
                  <div className="space-y-2">
                    <label className="text-sm text-detective-text-secondary">Tipo</label>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-white/10 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-orange-500"
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

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredNotifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 rounded-full bg-white/5 mb-4">
              <Bell className="w-12 h-12 text-detective-text-secondary" />
            </div>
            <h3 className="text-lg font-medium text-detective-text mb-2">Sin notificaciones</h3>
            <p className="text-detective-text-secondary">
              {statusFilter !== 'all'
                ? `No hay notificaciones ${statusFilter === 'unread' ? 'sin leer' : 'leidas'}`
                : 'No tienes notificaciones por el momento'}
            </p>
          </div>
        )}

        {/* Notifications List */}
        {!isLoading && filteredNotifications.length > 0 && (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {filteredNotifications.map((notification) => {
                const Icon = notificationIcons[notification.type] || Bell;
                const isUnread = notification.status === 'unread';

                return (
                  <motion.div
                    key={notification.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className={cn(
                      'p-4 rounded-xl border transition-all',
                      isUnread
                        ? 'bg-white/10 border-orange-500/30 hover:border-orange-500/50'
                        : 'bg-white/5 border-white/10 hover:border-white/20',
                    )}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className={cn(
                          'p-2.5 rounded-xl',
                          isUnread ? 'bg-orange-500/20' : 'bg-white/10',
                        )}
                      >
                        <Icon className={cn('w-5 h-5', isUnread ? 'text-orange-400' : 'text-detective-text-secondary')} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3
                              className={cn(
                                'font-medium',
                                isUnread ? 'text-detective-text' : 'text-detective-text-secondary',
                              )}
                            >
                              {notification.title}
                            </h3>
                            <p className="text-sm text-detective-text-secondary mt-0.5">{notification.message}</p>
                          </div>
                          <span className="text-xs text-detective-text-secondary whitespace-nowrap">
                            {formatRelativeTime(notification.createdAt)}
                          </span>
                        </div>

                        {/* Type Badge */}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-detective-text-secondary">
                            {notificationLabels[notification.type] || notification.type}
                          </span>
                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-orange-500" />
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {isUnread && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors group"
                            title="Marcar como leida"
                          >
                            <Check className="w-4 h-4 text-detective-text-secondary group-hover:text-green-400" />
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(notification.id)}
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors group"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4 text-detective-text-secondary group-hover:text-red-400" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
      </div>
    </TeacherPageShell>
  );
}
