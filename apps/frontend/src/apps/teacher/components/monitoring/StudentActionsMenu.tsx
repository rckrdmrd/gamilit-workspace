/**
 * StudentActionsMenu Component
 *
 * Dropdown menu with actions for managing a student.
 * Includes view details, send message, suspend/unblock, and view history.
 *
 * @module StudentActionsMenu
 * @since US-PM-006
 */

import { useState, useRef, useEffect } from 'react';
import {
  MoreVertical,
  User,
  MessageSquare,
  Ban,
  Unlock,
  History,
  AlertCircle,
} from 'lucide-react';
import type { StudentMonitoring } from '../../types';

// ============================================================================
// TYPES
// ============================================================================

interface StudentActionsMenuProps {
  /** Student data */
  student: StudentMonitoring;
  /** Whether the student is currently blocked */
  isBlocked?: boolean;
  /** Callback for viewing student details */
  onViewDetails: () => void;
  /** Callback for sending a message */
  onSendMessage?: () => void;
  /** Callback for suspending the student */
  onSuspend: () => void;
  /** Callback for unblocking the student */
  onUnblock: () => void;
  /** Callback for viewing student history */
  onViewHistory?: () => void;
  /** Callback for viewing student alerts */
  onViewAlerts?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Dropdown menu for student actions
 *
 * Features:
 * - Click outside to close
 * - Conditional suspend/unblock based on status
 * - Icon indicators for each action
 * - Keyboard navigation (Escape to close)
 *
 * @example
 * ```tsx
 * <StudentActionsMenu
 *   student={student}
 *   isBlocked={student.is_blocked}
 *   onViewDetails={() => setSelectedStudent(student)}
 *   onSuspend={() => setStudentToSuspend(student)}
 *   onUnblock={() => handleUnblock(student)}
 * />
 * ```
 */
export function StudentActionsMenu({
  student,
  isBlocked = false,
  onViewDetails,
  onSendMessage,
  onSuspend,
  onUnblock,
  onViewHistory,
  onViewAlerts,
}: StudentActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close menu on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleAction = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  return (
    <div ref={menuRef} className="relative">
      {/* Trigger Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="rounded-lg p-2 text-detective-text-secondary transition-colors hover:bg-detective-bg-secondary hover:text-detective-text"
        aria-label={`Acciones para ${student.full_name}`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 z-50 mt-1 w-48 rounded-lg border border-gray-700 bg-detective-bg-secondary shadow-lg"
          role="menu"
        >
          <div className="py-1">
            {/* View Details */}
            <button
              onClick={() => handleAction(onViewDetails)}
              className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-detective-text hover:bg-detective-bg"
              role="menuitem"
            >
              <User className="h-4 w-4 text-detective-text-secondary" />
              Ver Detalles
            </button>

            {/* Send Message */}
            {onSendMessage && (
              <button
                onClick={() => handleAction(onSendMessage)}
                className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-detective-text hover:bg-detective-bg"
                role="menuitem"
              >
                <MessageSquare className="h-4 w-4 text-detective-text-secondary" />
                Enviar Mensaje
              </button>
            )}

            {/* View Alerts */}
            {onViewAlerts && (
              <button
                onClick={() => handleAction(onViewAlerts)}
                className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-detective-text hover:bg-detective-bg"
                role="menuitem"
              >
                <AlertCircle className="h-4 w-4 text-detective-text-secondary" />
                Ver Alertas
              </button>
            )}

            {/* Divider */}
            <div className="my-1 border-t border-gray-700" />

            {/* Suspend/Unblock */}
            {isBlocked ? (
              <button
                onClick={() => handleAction(onUnblock)}
                className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-green-400 hover:bg-detective-bg"
                role="menuitem"
              >
                <Unlock className="h-4 w-4" />
                Desbloquear
              </button>
            ) : (
              <button
                onClick={() => handleAction(onSuspend)}
                className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-red-400 hover:bg-detective-bg"
                role="menuitem"
              >
                <Ban className="h-4 w-4" />
                Suspender
              </button>
            )}

            {/* View History */}
            {onViewHistory && (
              <button
                onClick={() => handleAction(onViewHistory)}
                className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-detective-text hover:bg-detective-bg"
                role="menuitem"
              >
                <History className="h-4 w-4 text-detective-text-secondary" />
                Ver Historial
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
