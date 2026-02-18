/**
 * AdminNotificationsPage - Centro de Notificaciones para Portal Admin
 *
 * Features:
 * - Lista completa de notificaciones con paginacion
 * - Filtros por estado (todas/leidas/no leidas)
 * - Filtros por tipo de notificacion
 * - Marcar como leida individual y masiva
 * - Eliminar notificaciones
 * - Conexion en tiempo real via WebSocket
 *
 * Route: /admin/notifications
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Bell, RefreshCw } from 'lucide-react';

// Layout
import { AdminPageShell } from '../components/shared';

// Components
import { NotificationHeader } from '../components/notifications/NotificationHeader';
import { NotificationFilters } from '../components/notifications/NotificationFilters';
import { NotificationItem } from '../components/notifications/NotificationItem';

// Store
import { useNotificationsStore } from '@/features/notifications/store/notificationsStore';

// Status filter type
type StatusFilter = 'all' | 'unread' | 'read';

export default function AdminNotificationsPage() {
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
      if (statusFilter === 'unread' && notification.status !== 'unread') return false;
      if (statusFilter === 'read' && notification.status !== 'read') return false;
      if (typeFilter !== 'all' && notification.type !== typeFilter) return false;
      return true;
    });
  }, [notifications, statusFilter, typeFilter]);

  // Get unique notification types
  const availableTypes = useMemo(() => {
    const types = new Set(notifications.map((n) => n.type));
    return Array.from(types);
  }, [notifications]);

  return (
    <AdminPageShell>
      <div className="space-y-6">
        <NotificationHeader
          unreadCount={unreadCount}
          isRefreshing={isRefreshing}
          showFilters={showFilters}
          onRefresh={handleRefresh}
          onToggleFilters={() => setShowFilters(!showFilters)}
          onMarkAllAsRead={handleMarkAllAsRead}
        />

        <NotificationFilters
          statusFilter={statusFilter}
          typeFilter={typeFilter}
          availableTypes={availableTypes}
          showFilters={showFilters}
          onStatusFilterChange={setStatusFilter}
          onTypeFilterChange={setTypeFilter}
        />

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredNotifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 rounded-full bg-white/5 mb-4">
              <Bell className="w-12 h-12 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Sin notificaciones</h3>
            <p className="text-gray-400">No tienes notificaciones por el momento</p>
          </div>
        )}

        {/* Notifications List */}
        {!isLoading && filteredNotifications.length > 0 && (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </AdminPageShell>
  );
}
