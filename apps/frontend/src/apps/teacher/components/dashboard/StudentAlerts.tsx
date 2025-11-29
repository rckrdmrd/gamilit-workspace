/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  TrendingDown,
  UserX,
  Clock,
  Eye,
  MessageSquare,
  X,
  Filter,
  CheckCircle,
} from 'lucide-react';
import type { StudentAlert } from '../../types';

interface StudentAlertsProps {
  alerts: StudentAlert[];
  loading?: boolean;
  onViewStudent: (studentId: string) => void;
  onContactStudent: (studentId: string) => void;
  onDismissAlert: (alertId: string) => void;
}

const alertTypeConfig = {
  struggling: {
    icon: TrendingDown,
    label: 'Struggling Student',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-l-yellow-500',
    iconColor: 'text-yellow-600',
    iconBg: 'bg-yellow-100',
  },
  inactive: {
    icon: UserX,
    label: 'Inactive Student',
    bgColor: 'bg-orange-50',
    borderColor: 'border-l-orange-500',
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-100',
  },
  at_risk: {
    icon: AlertTriangle,
    label: 'At-Risk Student',
    bgColor: 'bg-red-50',
    borderColor: 'border-l-red-500',
    iconColor: 'text-red-600',
    iconBg: 'bg-red-100',
  },
};

const severityConfig = {
  high: {
    badge: 'bg-red-100 text-red-700',
    label: 'High Priority',
    pulseColor: 'bg-red-500',
  },
  medium: {
    badge: 'bg-orange-100 text-orange-700',
    label: 'Medium Priority',
    pulseColor: 'bg-orange-500',
  },
  low: {
    badge: 'bg-blue-100 text-blue-700',
    label: 'Low Priority',
    pulseColor: 'bg-blue-500',
  },
};

const AlertCard: React.FC<{
  alert: StudentAlert;
  index: number;
  onViewStudent: (studentId: string) => void;
  onContactStudent: (studentId: string) => void;
  onDismiss: (alertId: string) => void;
}> = ({ alert, index, onViewStudent, onContactStudent, onDismiss }) => {
  const config = alertTypeConfig[alert.type];
  const severityInfo = severityConfig[alert.severity];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`relative ${config.bgColor} ${config.borderColor} rounded-lg border border-l-4 border-gray-200 p-5 transition-all duration-300 hover:shadow-lg`}
    >
      {/* Pulse animation for high priority */}
      {alert.severity === 'high' && (
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`absolute right-4 top-4 h-3 w-3 rounded-full ${severityInfo.pulseColor}`}
        />
      )}

      <div className="mb-4 flex items-start justify-between">
        <div className="flex flex-1 items-start gap-3">
          {/* Alert Icon */}
          <div className={`p-3 ${config.iconBg} rounded-lg`}>
            <Icon className={`h-5 w-5 ${config.iconColor}`} />
          </div>

          {/* Alert Content */}
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <h3 className="font-bold text-gray-800">{alert.studentName}</h3>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${severityInfo.badge}`}
              >
                {severityInfo.label}
              </span>
            </div>
            <p className="mb-1 text-sm text-gray-600">{config.label}</p>
            <p className="text-sm text-gray-500">{alert.classroomName}</p>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={() => onDismiss(alert.id)}
          className="rounded-lg p-1.5 transition-colors hover:bg-white/50"
          title="Dismiss alert"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      {/* Alert Message */}
      <div className="mb-4 rounded-lg bg-white/60 p-3">
        <p className="mb-1 text-sm font-medium text-gray-800">{alert.message}</p>
        <p className="text-xs text-gray-600">{alert.details}</p>
      </div>

      {/* Metadata */}
      <div className="mb-4 flex items-center gap-2 text-xs text-gray-500">
        <Clock className="h-3 w-3" />
        <span>
          {new Date(alert.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onViewStudent(alert.studentId)}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
        >
          <Eye className="h-4 w-4" />
          View Student
        </button>
        <button
          onClick={() => onContactStudent(alert.studentId)}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          <MessageSquare className="h-4 w-4" />
          Contact
        </button>
      </div>
    </motion.div>
  );
};

const EmptyState: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 py-12 text-center"
    >
      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <CheckCircle className="h-10 w-10 text-green-600" />
      </div>
      <h3 className="mb-2 text-xl font-bold text-gray-800">All Students Are Doing Great!</h3>
      <p className="text-sm text-gray-600">No alerts requiring attention at this time</p>
    </motion.div>
  );
};

const SkeletonCard: React.FC = () => {
  return (
    <div className="animate-pulse rounded-lg border border-l-4 border-gray-200 border-l-gray-300 bg-white p-5">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex flex-1 items-start gap-3">
          <div className="h-11 w-11 rounded-lg bg-gray-200" />
          <div className="flex-1">
            <div className="mb-2 h-4 w-32 rounded bg-gray-200" />
            <div className="mb-1 h-3 w-24 rounded bg-gray-200" />
            <div className="h-3 w-28 rounded bg-gray-200" />
          </div>
        </div>
      </div>
      <div className="mb-4 rounded-lg bg-gray-100 p-3">
        <div className="mb-1 h-4 w-full rounded bg-gray-200" />
        <div className="h-3 w-3/4 rounded bg-gray-200" />
      </div>
      <div className="flex gap-2">
        <div className="h-9 flex-1 rounded-lg bg-gray-200" />
        <div className="h-9 flex-1 rounded-lg bg-gray-200" />
      </div>
    </div>
  );
};

export const StudentAlerts: React.FC<StudentAlertsProps> = ({
  alerts,
  loading = false,
  onViewStudent,
  onContactStudent,
  onDismissAlert,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'struggling' | 'inactive' | 'at_risk'>(
    'all',
  );
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredAlerts = alerts.filter((alert) => {
    if (filterType !== 'all' && alert.type !== filterType) return false;
    if (filterSeverity !== 'all' && alert.severity !== filterSeverity) return false;
    return true;
  });

  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    // Sort by severity first (high > medium > low)
    const severityOrder = { high: 3, medium: 2, low: 1 };
    const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
    if (severityDiff !== 0) return severityDiff;

    // Then by date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (alerts.length === 0) {
    return <EmptyState />;
  }

  return (
    <div>
      {/* Header with Filters */}
      <div className="mb-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">
            Student Alerts ({sortedAlerts.length})
          </h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              showFilters || filterType !== 'all' || filterSeverity !== 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
            {(filterType !== 'all' || filterSeverity !== 'all') && (
              <span className="ml-1 rounded-full bg-white/20 px-1.5 py-0.5 text-xs">
                {(filterType !== 'all' ? 1 : 0) + (filterSeverity !== 'all' ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {/* Filter Options */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 overflow-hidden rounded-lg bg-gray-50 p-4"
            >
              <div>
                <p className="mb-2 text-xs font-semibold text-gray-600">Alert Type</p>
                <div className="flex flex-wrap gap-2">
                  {['all', 'struggling', 'inactive', 'at_risk'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type as any)}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                        filterType === type
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {type === 'at_risk'
                        ? 'At-Risk'
                        : type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold text-gray-600">Severity</p>
                <div className="flex flex-wrap gap-2">
                  {['all', 'high', 'medium', 'low'].map((severity) => (
                    <button
                      key={severity}
                      onClick={() => setFilterSeverity(severity as any)}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                        filterSeverity === severity
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {severity.charAt(0).toUpperCase() + severity.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Alerts List */}
      {sortedAlerts.length === 0 ? (
        <div className="rounded-lg bg-gray-50 py-8 text-center">
          <p className="text-gray-600">No alerts match your filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {sortedAlerts.map((alert, index) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                index={index}
                onViewStudent={onViewStudent}
                onContactStudent={onContactStudent}
                onDismiss={onDismissAlert}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
