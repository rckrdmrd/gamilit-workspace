import React, { useEffect, useState } from 'react';
import { useNotificationsStore } from '../store/notificationsStore';
import { NotificationDropdown } from './NotificationDropdown';
import './NotificationBell.css';

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  // Using Zustand selectors to prevent unnecessary re-renders
  const unreadCount = useNotificationsStore((state) => state.unreadCount);
  const fetchUnreadCount = useNotificationsStore((state) => state.fetchUnreadCount);

  useEffect(() => {
    // Initial fetch
    fetchUnreadCount();

    // Poll every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    const handleUnreadUpdated = () => {
      fetchUnreadCount();
    };
    window.addEventListener('gamilit:notifications:unread-updated', handleUnreadUpdated);

    return () => {
      clearInterval(interval);
      window.removeEventListener('gamilit:notifications:unread-updated', handleUnreadUpdated);
    };
  }, [fetchUnreadCount]);

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
