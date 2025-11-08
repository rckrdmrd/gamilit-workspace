import React, { useEffect, useState } from 'react';
import { useNotificationsStore } from '../store/notificationsStore';
import { NotificationDropdown } from './NotificationDropdown';
import './NotificationBell.css';

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount, getUnreadCount } = useNotificationsStore();

  useEffect(() => {
    // Initial fetch
    getUnreadCount();

    // Poll every 30 seconds
    const interval = setInterval(() => {
      getUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [getUnreadCount]);

  return (
    <div className="notification-bell-container">
      <button
        className="notification-bell-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="notification-backdrop" onClick={() => setIsOpen(false)} />
          <NotificationDropdown onClose={() => setIsOpen(false)} />
        </>
      )}
    </div>
  );
};
