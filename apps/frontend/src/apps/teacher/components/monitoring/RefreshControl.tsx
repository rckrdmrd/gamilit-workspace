import { useState, useEffect } from 'react';
import { RefreshCw, ChevronDown, Clock } from 'lucide-react';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import type { RefreshInterval } from '../../hooks/useStudentMonitoring';

interface RefreshControlProps {
  interval: RefreshInterval;
  onIntervalChange: (interval: RefreshInterval) => void;
  onRefresh: () => void;
  loading?: boolean;
  lastUpdate: Date | null;
}

const INTERVAL_OPTIONS = [
  { value: 0, label: 'Manual', description: 'Sin actualización automática' },
  { value: 15000, label: '15 segundos', description: 'Actualización rápida' },
  { value: 30000, label: '30 segundos', description: 'Balanceado' },
  { value: 60000, label: '60 segundos', description: 'Menor frecuencia' },
] as const;

/**
 * RefreshControl Component
 *
 * Provides controls for:
 * - Manual refresh button
 * - Auto-refresh interval selector
 * - Countdown timer showing seconds until next refresh
 * - Last update timestamp
 */
export function RefreshControl({
  interval,
  onIntervalChange,
  onRefresh,
  loading = false,
  lastUpdate,
}: RefreshControlProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Calculate countdown for next refresh
  useEffect(() => {
    if (interval === 0 || !lastUpdate) {
      setCountdown(0);
      return;
    }

    const updateCountdown = () => {
      const now = new Date();
      const timeSinceUpdate = now.getTime() - lastUpdate.getTime();
      const timeUntilNext = interval - timeSinceUpdate;
      const secondsRemaining = Math.max(0, Math.ceil(timeUntilNext / 1000));
      setCountdown(secondsRemaining);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, [interval, lastUpdate]);

  const getTimeSinceLastUpdate = (date: Date | null): string => {
    if (!date) return 'Nunca';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);

    if (diffSecs < 60) {
      return `Hace ${diffSecs} seg`;
    } else if (diffMins < 60) {
      return `Hace ${diffMins} min`;
    } else {
      return `Hace ${diffHours} hrs`;
    }
  };

  const currentOption = INTERVAL_OPTIONS.find((opt) => opt.value === interval);

  return (
    <div className="flex items-center gap-3">
      {/* Countdown & Last Update Info */}
      <div className="hidden flex-col items-end text-xs md:flex">
        {interval > 0 && countdown > 0 && (
          <div className="flex items-center gap-1 text-detective-text-secondary">
            <Clock className="h-3 w-3" />
            <span>Actualizando en {countdown}s</span>
          </div>
        )}
        <div className="text-detective-text-secondary">{getTimeSinceLastUpdate(lastUpdate)}</div>
      </div>

      {/* Interval Selector */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="border-detective-border flex items-center gap-2 rounded-lg border bg-detective-bg-secondary px-4 py-2 text-detective-text transition-colors hover:border-detective-orange"
        >
          <span className="text-sm font-medium">{currentOption?.label}</span>
          <ChevronDown className="h-4 w-4" />
        </button>

        {showDropdown && (
          <>
            {/* Overlay to close dropdown */}
            <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />

            {/* Dropdown menu */}
            <div className="bg-detective-bg-card border-detective-border absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-lg border shadow-lg">
              {INTERVAL_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onIntervalChange(option.value);
                    setShowDropdown(false);
                  }}
                  className={`w-full px-4 py-3 text-left transition-colors hover:bg-detective-bg-secondary ${
                    interval === option.value
                      ? 'border-l-4 border-detective-orange bg-detective-orange/10'
                      : ''
                  }`}
                >
                  <div className="font-medium text-detective-text">{option.label}</div>
                  <div className="mt-1 text-xs text-detective-text-secondary">
                    {option.description}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Manual Refresh Button */}
      <DetectiveButton onClick={onRefresh} variant="secondary" disabled={loading}>
        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        <span className="ml-2 hidden sm:inline">Actualizar</span>
      </DetectiveButton>
    </div>
  );
}
