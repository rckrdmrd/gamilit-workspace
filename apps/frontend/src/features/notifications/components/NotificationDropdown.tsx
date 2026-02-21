import React, { useEffect } from 'react';
import { useNotificationsStore } from '../store/notificationsStore';
import type { Notification } from '@/services/api/notificationsAPI';
import './NotificationDropdown.css';

interface NotificationDropdownProps {
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  // Using Zustand selectors to prevent unnecessary re-renders
  const notifications = useNotificationsStore((state) => state.notifications) ?? [];
  const isLoading = useNotificationsStore((state) => state.isLoading);
  const fetchNotifications = useNotificationsStore((state) => state.fetchNotifications);
  const markAsRead = useNotificationsStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationsStore((state) => state.markAllAsRead);
  const deleteNotification = useNotificationsStore((state) => state.deleteNotification);

  // Ensure notifications is always an array
  const safeNotifications = notifications ?? [];

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const resolveNotificationType = (notification: Notification): string => {
    const dataType = notification.data?.notificationType;
    const originalType = notification.data?.original_type;
    if (typeof dataType === 'string') return dataType;
    if (typeof originalType === 'string') return originalType;
    return notification.type;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'achievement':
      case 'achievement_unlocked': return '🏆';
      case 'mission':
      case 'rank_up': return '🎉';
      case 'rank_promoted': return '🎉';
      case 'streak_milestone': return '🔥';
      case 'social':
      case 'friend_request': return '👥';
      case 'friend_accepted': return '✅';
      case 'level_up': return '⬆️';
      case 'assignment':
      case 'exercise_feedback': return '📝';
      case 'shop_purchase': return '🛒';
      case 'gamification': return '🎮';
      case 'mission_rewards_claimed': return '🎯';
      case 'ml_coins_earned': return '💰';
      case 'coins_earned':
      case 'coins_received': return '💰';
      case 'mission_completed': return '✨';
      case 'system': return '📢';
      case 'system_announcement': return '📢';
      default: return '📬';
    }
  };

  const formatTimestamp = (date: Date | string | undefined | null) => {
    if (!date) return '';

    const now = new Date();
    const notifDate = date instanceof Date ? date : new Date(date);

    // Validate date is valid
    if (isNaN(notifDate.getTime())) return '';

    const diffMs = now.getTime() - notifDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return notifDate.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="notification-dropdown">
      <div className="notification-header">
        <h3>Notificaciones</h3>
        {safeNotifications.length > 0 && (
          <button onClick={markAllAsRead} className="mark-all-read">
            Marcar todas como leídas
          </button>
        )}
      </div>

      <div className="notification-list">
        {isLoading && (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Cargando...</p>
          </div>
        )}

        {!isLoading && safeNotifications.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <p>No tienes notificaciones</p>
          </div>
        )}

        {!isLoading && safeNotifications.map(notification => (
          <div
            key={notification.id}
            className={`notification-item ${notification.status === 'read' ? 'read' : 'unread'}`}
            onClick={() => {
              if (notification.status === 'unread') {
                markAsRead(notification.id);
              }
            }}
          >
            <div className="notification-icon">
              {getNotificationIcon(resolveNotificationType(notification))}
            </div>
            <div className="notification-content">
              <h4>{notification.title}</h4>
              <p>{notification.message}</p>
              <span className="notification-time">
                {formatTimestamp(notification.createdAt)}
              </span>
            </div>
            <button
              className="delete-button"
              onClick={(e) => {
                e.stopPropagation();
                deleteNotification(notification.id);
              }}
              aria-label="Eliminar notificación"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {safeNotifications.length > 0 && (
        <div className="notification-footer">
          <button onClick={onClose} className="close-button">Cerrar</button>
        </div>
      )}
    </div>
  );
};
