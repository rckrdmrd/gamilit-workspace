/**
 * NotificationsPage - Centro de Notificaciones para GLIT Platform
 *
 * Features:
 * - Lista completa de notificaciones con paginación
 * - Filtros por estado (todas/leídas/no leídas)
 * - Filtros por tipo de notificación
 * - Marcar como leída individual y masiva
 * - Eliminar notificaciones
 * - Conexión en tiempo real vía WebSocket
 * - Responsive design
 *
 * Route: /student/notifications
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
  Target,
  Users,
  Calendar,
  AlertCircle,
  Megaphone,
  RefreshCw,
  Check,
  Coins,
  BookOpen,
} from 'lucide-react';

// Components
import { StudentPageShell } from '../components/shared/StudentPageShell';

// Store & Hooks
import { useNotificationsStore } from '@/features/notifications/store/notificationsStore';
import { useWebSocket } from '@/features/notifications/hooks/useWebSocket';

// Utils
import { cn } from '@shared/utils/cn';

// Notification type icons mapping
const notificationIcons: Record<string, ElementType> = {
  achievement_unlocked: Trophy,
  rank_promoted: TrendingUp,
  mission_completed: Target,
  mission_expired: AlertCircle,
  friend_request: Users,
  friend_accepted: Users,
  assignment_created: Calendar,
  assignment_graded: CheckCheck,
  module_unlocked: BookOpen,
  coins_received: Coins,
  system_announcement: Megaphone,
};

// Notification type labels
const notificationLabels: Record<string, string> = {
  achievement_unlocked: 'Logro Desbloqueado',
  rank_promoted: 'Subida de Rango',
  mission_completed: 'Misión Completada',
  mission_expired: 'Misión Expirada',
  friend_request: 'Solicitud de Amistad',
  friend_accepted: 'Amistad Aceptada',
  assignment_created: 'Nueva Tarea',
  assignment_graded: 'Tarea Calificada',
  module_unlocked: 'Módulo Desbloqueado',
  coins_received: 'ML Coins Recibidas',
  system_announcement: 'Anuncio del Sistema',
};

// Status filter type
type StatusFilter = 'all' | 'unread' | 'read';

export default function NotificationsPage() {
  // WebSocket connection for real-time notifications
  const { isConnected: _isConnected } = useWebSocket();

  // Store - Using Zustand selectors to prevent unnecessary re-renders
  const notifications = useNotificationsStore((state) => state.notifications);
  const unreadCount = useNotificationsStore((state) => state.unreadCount);
  const isLoading = useNotificationsStore((state) => state.isLoading);
  const error = useNotificationsStore((state) => state.error);
  const fetchNotifications = useNotificationsStore((state) => state.fetchNotifications);
  const fetchUnreadCount = useNotificationsStore((state) => state.fetchUnreadCount);
  const markAsRead = useNotificationsStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationsStore((state) => state.markAllAsRead);
  const deleteNotification = useNotificationsStore((state) => state.deleteNotification);

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

  // Get unique notification types for filter
  const notificationTypes = useMemo(() => {
    const types = new Set(notifications.map((n) => n.type));
    return Array.from(types);
  }, [notifications]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    return date.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' });
  };

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    const Icon = notificationIcons[type] || Bell;
    return Icon;
  };

  // Get notification color
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'achievement_unlocked':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'rank_promoted':
        return 'bg-purple-500/20 text-purple-400';
      case 'mission_completed':
        return 'bg-green-500/20 text-green-400';
      case 'mission_expired':
        return 'bg-red-500/20 text-red-400';
      case 'friend_request':
      case 'friend_accepted':
        return 'bg-blue-500/20 text-blue-400';
      case 'assignment_created':
      case 'assignment_graded':
        return 'bg-orange-500/20 text-orange-400';
      case 'coins_received':
        return 'bg-amber-500/20 text-amber-400';
      case 'module_unlocked':
        return 'bg-indigo-500/20 text-indigo-400';
      default:
        return 'bg-detective-surface-elevated text-detective-text-secondary';
    }
  };

  return (
    <StudentPageShell>
      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 p-3">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-detective-text">
                Centro de Notificaciones
              </h1>
              <p className="text-sm text-detective-text-secondary">
                {unreadCount > 0
                  ? `${unreadCount} notificación${unreadCount > 1 ? 'es' : ''} sin leer`
                  : 'Todas las notificaciones leídas'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 rounded-lg bg-detective-surface px-3 py-2 text-sm font-medium text-detective-text-secondary shadow-sm transition-colors hover:bg-detective-surface-elevated"
            >
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
              <span className="hidden sm:inline">Actualizar</span>
            </motion.button>

            {unreadCount > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 rounded-lg bg-detective-orange px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-detective-orange-dark"
              >
                <CheckCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Marcar todas</span>
              </motion.button>
            )}

            <Link
              to="/settings/notifications"
              className="flex items-center gap-2 rounded-lg bg-detective-surface px-3 py-2 text-sm font-medium text-detective-text-secondary shadow-sm transition-colors hover:bg-detective-surface-elevated"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Preferencias</span>
            </Link>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 rounded-xl bg-detective-surface p-4 shadow-sm"
        >
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                statusFilter === 'all'
                  ? 'bg-detective-orange text-white'
                  : 'bg-detective-bg-secondary text-detective-text-secondary hover:bg-detective-bg',
              )}
            >
              Todas
            </button>
            <button
              onClick={() => setStatusFilter('unread')}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                statusFilter === 'unread'
                  ? 'bg-detective-orange text-white'
                  : 'bg-detective-bg-secondary text-detective-text-secondary hover:bg-detective-bg',
              )}
            >
              No leídas {unreadCount > 0 && `(${unreadCount})`}
            </button>
            <button
              onClick={() => setStatusFilter('read')}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                statusFilter === 'read'
                  ? 'bg-detective-orange text-white'
                  : 'bg-detective-bg-secondary text-detective-text-secondary hover:bg-detective-bg',
              )}
            >
              Leídas
            </button>

            {/* Type Filter Dropdown */}
            <div className="relative ml-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 rounded-lg bg-detective-bg-secondary px-4 py-2 text-sm font-medium text-detective-text-secondary transition-colors hover:bg-detective-bg"
              >
                <Filter className="h-4 w-4" />
                <span>
                  {typeFilter === 'all'
                    ? 'Todos los tipos'
                    : notificationLabels[typeFilter] || typeFilter}
                </span>
              </button>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 z-10 mt-2 w-56 rounded-lg bg-detective-surface shadow-lg ring-1 ring-black/5"
                  >
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setTypeFilter('all');
                          setShowFilters(false);
                        }}
                        className={cn(
                          'flex w-full items-center gap-2 px-4 py-2 text-sm',
                          typeFilter === 'all'
                            ? 'bg-detective-orange/10 text-detective-orange'
                            : 'text-detective-text-secondary hover:bg-detective-surface-elevated',
                        )}
                      >
                        <Bell className="h-4 w-4" />
                        Todos los tipos
                      </button>
                      {notificationTypes.map((type) => {
                        const Icon = getNotificationIcon(type);
                        return (
                          <button
                            key={type}
                            onClick={() => {
                              setTypeFilter(type);
                              setShowFilters(false);
                            }}
                            className={cn(
                              'flex w-full items-center gap-2 px-4 py-2 text-sm',
                              typeFilter === type
                                ? 'bg-detective-orange/10 text-detective-orange'
                                : 'text-detective-text-secondary hover:bg-detective-surface-elevated',
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            {notificationLabels[type] || type}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-lg border-2 border-red-500/30 bg-red-500/10 p-4 text-red-400"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <p className="font-semibold">{error}</p>
            </div>
            <button onClick={handleRefresh} className="mt-2 text-sm underline hover:no-underline">
              Reintentar
            </button>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-detective-orange" />
          </div>
        )}

        {/* Notifications List */}
        {!isLoading && (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredNotifications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center rounded-xl bg-detective-surface py-12 text-center shadow-sm"
                >
                  <Bell className="mb-4 h-16 w-16 text-detective-text-secondary/40" />
                  <h3 className="mb-2 text-lg font-semibold text-detective-text">
                    No hay notificaciones
                  </h3>
                  <p className="text-sm text-detective-text-secondary">
                    {statusFilter === 'unread'
                      ? '¡Excelente! No tienes notificaciones sin leer'
                      : 'Las notificaciones aparecerán aquí'}
                  </p>
                </motion.div>
              ) : (
                filteredNotifications.map((notification, index) => {
                  const Icon = getNotificationIcon(notification.type);
                  const colorClass = getNotificationColor(notification.type);

                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        'group relative flex items-start gap-4 rounded-xl bg-detective-surface p-4 shadow-sm transition-all hover:shadow-md',
                        notification.status === 'unread' && 'border-l-4 border-detective-orange',
                      )}
                    >
                      {/* Icon */}
                      <div className={cn('flex-shrink-0 rounded-full p-3', colorClass)}>
                        <Icon className="h-5 w-5" />
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4
                              className={cn(
                                'text-sm font-semibold',
                                notification.status === 'unread'
                                  ? 'text-detective-text'
                                  : 'text-detective-text-secondary',
                              )}
                            >
                              {notification.title}
                            </h4>
                            <p
                              className={cn(
                                'mt-1 text-sm',
                                notification.status === 'unread'
                                  ? 'text-detective-text-secondary'
                                  : 'text-detective-text-secondary/70',
                              )}
                            >
                              {notification.message}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            {notification.status === 'unread' && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="rounded-lg p-2 text-detective-text-secondary transition-colors hover:bg-detective-surface-elevated hover:text-green-400"
                                title="Marcar como leída"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(notification.id)}
                              className="rounded-lg p-2 text-detective-text-secondary transition-colors hover:bg-detective-surface-elevated hover:text-red-400"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Metadata */}
                        <div className="mt-2 flex items-center gap-3 text-xs text-detective-text-secondary">
                          <span>{formatDate(notification.createdAt)}</span>
                          <span className="rounded-full bg-detective-bg-secondary px-2 py-0.5">
                            {notificationLabels[notification.type] || notification.type}
                          </span>
                          {notification.status === 'unread' && (
                            <span className="flex items-center gap-1 text-detective-orange">
                              <span className="h-2 w-2 rounded-full bg-detective-orange"></span>
                              Nueva
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Bottom Spacing */}
      <div className="h-16" />
    </StudentPageShell>
  );
}
