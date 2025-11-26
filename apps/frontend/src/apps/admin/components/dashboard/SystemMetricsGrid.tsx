/**
 * SystemMetricsGrid Component
 *
 * Grid of system metrics cards with animated counters and trend indicators.
 * Displays key system statistics with sparkline charts and color-coded statuses.
 *
 * Features:
 * - 6 metric cards (users, orgs, sessions, flagged content, uptime, storage)
 * - Animated counter components
 * - Trend indicators (↑↓) with percentages
 * - Sparkline mini-charts
 * - Hover tooltips
 * - Color-coded by status
 * - Responsive grid layout
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Building,
  Activity,
  Flag,
  Clock,
  HardDrive,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import type { SystemMetrics } from '../../types';

interface SystemMetricsGridProps {
  metrics: SystemMetrics | null;
  loading?: boolean;
}

interface MetricCardData {
  label: string;
  value: number | null;
  trend?: number | null;
  icon: React.ElementType;
  color: string;
  unit?: string;
  sparklineData?: number[];
  tooltip?: string;
}

export const SystemMetricsGrid: React.FC<SystemMetricsGridProps> = ({
  metrics,
  loading = false,
}) => {
  // ============================================================================
  // METRIC CARDS DATA
  // ============================================================================

  const getMetricCards = (): MetricCardData[] => {
    if (!metrics) return [];

    return [
      {
        label: 'Total Users',
        value: metrics.totalUsers,
        trend: metrics.userGrowth,
        icon: Users,
        color: 'blue',
        tooltip: 'Total registered users in the system',
      },
      {
        label: 'Organizations',
        value: metrics.totalOrganizations,
        trend: metrics.organizationGrowth,
        icon: Building,
        color: 'purple',
        tooltip: 'Active organizations',
      },
      {
        label: 'Active Sessions',
        value: metrics.activeSessions,
        icon: Activity,
        color: 'green',
        tooltip: 'Currently active user sessions',
      },
      {
        label: 'Flagged Content',
        value: metrics.flaggedContentCount,
        icon: Flag,
        color:
          metrics.flaggedContentCount !== null && metrics.flaggedContentCount > 10
            ? 'red'
            : 'yellow',
        tooltip: 'Content items pending moderation',
      },
      {
        label: 'System Uptime',
        value: metrics.systemUptime,
        icon: Clock,
        color: 'cyan',
        unit: 'uptime',
        tooltip: 'Time since last system restart',
      },
      {
        label: 'Storage Used',
        value: metrics.storageUsed,
        icon: HardDrive,
        color:
          metrics.storageUsed !== null &&
          metrics.storageTotal !== null &&
          metrics.storageUsed / metrics.storageTotal > 0.8
            ? 'orange'
            : 'indigo',
        unit: 'storage',
        tooltip:
          metrics.storageUsed !== null && metrics.storageTotal !== null
            ? `${((metrics.storageUsed / metrics.storageTotal) * 100).toFixed(1)}% of total capacity`
            : 'Storage data not available',
      },
    ];
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (loading || !metrics) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <DetectiveCard key={i} className="animate-pulse">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-detective-bg-secondary" />
              <div className="flex-1">
                <div className="mb-2 h-4 w-24 rounded bg-detective-bg-secondary" />
                <div className="h-6 w-16 rounded bg-detective-bg-secondary" />
              </div>
            </div>
          </DetectiveCard>
        ))}
      </div>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  const metricCards = getMetricCards();

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {metricCards.map((card, index) => (
        <MetricCard key={card.label} card={card} index={index} metrics={metrics} />
      ))}
    </div>
  );
};

// ============================================================================
// METRIC CARD COMPONENT
// ============================================================================

interface MetricCardProps {
  card: MetricCardData;
  index: number;
  metrics: SystemMetrics;
}

const MetricCard: React.FC<MetricCardProps> = ({ card, index, metrics }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const Icon = card.icon;
  const TrendIcon =
    card.trend !== undefined && card.trend !== null ? getTrendIcon(card.trend) : null;

  // Animated counter effect
  useEffect(() => {
    // Skip animation if value is null
    if (card.value === null) {
      return;
    }

    const duration = 1000;
    const steps = 60;
    const increment = card.value / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (card.value !== null) {
        setDisplayValue(Math.min(increment * currentStep, card.value));

        if (currentStep >= steps) {
          clearInterval(timer);
          setDisplayValue(card.value);
        }
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [card.value]);

  // Format the display value
  const getFormattedValue = (): string => {
    // Handle null values
    if (card.value === null) {
      return 'N/A';
    }

    if (card.unit === 'uptime') {
      return formatUptime(card.value);
    }
    if (card.unit === 'storage') {
      return `${displayValue.toFixed(1)} GB`;
    }
    return formatNumber(Math.round(displayValue));
  };

  // Get color classes
  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string; border: string }> = {
      blue: { bg: 'bg-blue-500/20', text: 'text-blue-500', border: 'border-blue-500/30' },
      purple: { bg: 'bg-purple-500/20', text: 'text-purple-500', border: 'border-purple-500/30' },
      green: { bg: 'bg-green-500/20', text: 'text-green-500', border: 'border-green-500/30' },
      yellow: { bg: 'bg-yellow-500/20', text: 'text-yellow-500', border: 'border-yellow-500/30' },
      red: { bg: 'bg-red-500/20', text: 'text-red-500', border: 'border-red-500/30' },
      cyan: { bg: 'bg-cyan-500/20', text: 'text-cyan-500', border: 'border-cyan-500/30' },
      orange: { bg: 'bg-orange-500/20', text: 'text-orange-500', border: 'border-orange-500/30' },
      indigo: { bg: 'bg-indigo-500/20', text: 'text-indigo-500', border: 'border-indigo-500/30' },
    };
    return colorMap[color] || colorMap.blue;
  };

  const colors = getColorClasses(card.color);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <DetectiveCard
        className={`border ${colors.border} hover-lift group relative overflow-hidden`}
        title={card.tooltip}
      >
        {/* Background gradient */}
        <div
          className={`absolute inset-0 ${colors.bg} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
        />

        <div className="relative">
          <div className="mb-3 flex items-start justify-between">
            <div className={`p-3 ${colors.bg} rounded-lg`}>
              <Icon className={`h-6 w-6 ${colors.text}`} />
            </div>

            {/* Trend indicator */}
            {card.trend !== undefined && card.trend !== null && TrendIcon && (
              <div className={`flex items-center gap-1 ${getTrendColor(card.trend)}`}>
                <TrendIcon className="h-4 w-4" />
                <span className="text-sm font-semibold">{Math.abs(card.trend).toFixed(1)}%</span>
              </div>
            )}
          </div>

          <div>
            <p className="text-detective-small mb-1 text-gray-400">{card.label}</p>
            <motion.p
              className={`text-3xl font-bold ${colors.text}`}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.5 }}
            >
              {getFormattedValue()}
            </motion.p>

            {/* Additional info */}
            {card.unit === 'storage' && metrics.storageTotal !== null && (
              <p className="text-detective-small mt-2 text-gray-500">
                of {metrics.storageTotal} GB total
              </p>
            )}

            {card.trend !== undefined && card.trend !== null && (
              <p className="text-detective-small mt-2 text-gray-500">
                {card.trend > 0 ? 'Up' : card.trend < 0 ? 'Down' : 'No change'} from last period
              </p>
            )}
          </div>

          {/* Mini sparkline for some metrics */}
          {card.sparklineData && (
            <div className="mt-3 h-8">
              <MiniSparkline data={card.sparklineData} color={card.color} />
            </div>
          )}
        </div>
      </DetectiveCard>
    </motion.div>
  );
};

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

/**
 * Get trend color
 */
const getTrendColor = (trend: number): string => {
  if (trend > 0) return 'text-green-500';
  if (trend < 0) return 'text-red-500';
  return 'text-gray-500';
};

/**
 * Get trend icon
 */
const getTrendIcon = (trend: number) => {
  if (trend > 0) return TrendingUp;
  if (trend < 0) return TrendingDown;
  return Minus;
};

/**
 * Format large numbers
 */
const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
};

/**
 * Format uptime
 */
const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);

  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
};

/**
 * Mini sparkline chart component
 */
interface MiniSparklineProps {
  data: number[];
  color: string;
}

const MiniSparkline: React.FC<MiniSparklineProps> = ({ data, color }) => {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = ((max - value) / range) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={`var(--${color}-500)`}
        strokeWidth="2"
        className="opacity-50"
      />
    </svg>
  );
};
