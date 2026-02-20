import React from 'react';
import { cn } from '@shared/utils/cn';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Ban,
  RotateCcw,
  Circle,
  Eye,
  Star,
  Archive,
  FileEdit,
  TimerOff,
  UserPlus,
  UserX,
  PlayCircle,
} from 'lucide-react';

export type StatusType =
  // Core statuses
  | 'active'
  | 'inactive'
  | 'suspended'
  | 'pending'
  | 'completed'
  | 'in_progress'
  // User / account statuses
  | 'banned'
  // Review / submission statuses
  | 'returned'
  | 'reviewed'
  // Progress statuses
  | 'not_started'
  | 'mastered'
  // Assignment / content statuses
  | 'closed'
  | 'draft'
  | 'expired'
  // Guild / group statuses
  | 'recruiting'
  | 'full';

export interface StatusBadgeProps {
  status: StatusType;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string; // Custom label override
}

const statusConfig: Record<
  StatusType,
  {
    bg: string;
    text: string;
    border: string;
    icon: React.ElementType;
    defaultLabel: string;
  }
> = {
  // Core statuses
  active: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    icon: CheckCircle2,
    defaultLabel: 'Activo',
  },
  inactive: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    icon: XCircle,
    defaultLabel: 'Inactivo',
  },
  suspended: {
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-200',
    icon: AlertCircle,
    defaultLabel: 'Suspendido',
  },
  pending: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    icon: Clock,
    defaultLabel: 'Pendiente',
  },
  completed: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
    icon: CheckCircle2,
    defaultLabel: 'Completado',
  },
  in_progress: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-200',
    icon: PlayCircle,
    defaultLabel: 'En Progreso',
  },
  // User / account statuses
  banned: {
    bg: 'bg-red-200',
    text: 'text-red-900',
    border: 'border-red-300',
    icon: Ban,
    defaultLabel: 'Baneado',
  },
  // Review / submission statuses
  returned: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    icon: RotateCcw,
    defaultLabel: 'Devuelta',
  },
  reviewed: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-200',
    icon: Eye,
    defaultLabel: 'Revisado',
  },
  // Progress statuses
  not_started: {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    border: 'border-gray-200',
    icon: Circle,
    defaultLabel: 'No iniciado',
  },
  mastered: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-200',
    icon: Star,
    defaultLabel: 'Dominado',
  },
  // Assignment / content statuses
  closed: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
    icon: Archive,
    defaultLabel: 'Cerrada',
  },
  draft: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    icon: FileEdit,
    defaultLabel: 'Borrador',
  },
  expired: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-200',
    icon: TimerOff,
    defaultLabel: 'Expirada',
  },
  // Guild / group statuses
  recruiting: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
    icon: UserPlus,
    defaultLabel: 'Reclutando',
  },
  full: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    icon: UserX,
    defaultLabel: 'Lleno',
  },
};

const sizeStyles = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5',
};

const iconSizes = {
  sm: 'w-3 h-3',
  md: 'w-3.5 h-3.5',
  lg: 'w-4 h-4',
};

export const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, className, showIcon = true, size = 'md', label }, ref) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    const displayLabel = label || config.defaultLabel;

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full font-medium border',
          config.bg,
          config.text,
          config.border,
          sizeStyles[size],
          className
        )}
        role="status"
        aria-label={`Estado: ${displayLabel}`}
      >
        {showIcon && <Icon className={iconSizes[size]} aria-hidden="true" />}
        <span>{displayLabel}</span>
      </span>
    );
  }
);

StatusBadge.displayName = 'StatusBadge';
