/**
 * RolloutSlider Component
 *
 * Slider component for controlling feature flag rollout percentage (0-100%).
 * Features:
 * - Visual indicators at 25%, 50%, 75%
 * - Tooltip showing current percentage
 * - Color gradients based on rollout level
 *
 * Created: 2025-12-05 - FE-ADMIN-011-016 (Sprint P2-B)
 */

import React, { useState } from 'react';

interface RolloutSliderProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

export const RolloutSlider: React.FC<RolloutSliderProps> = ({
  value,
  onChange,
  disabled = false,
  className = '',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseInt(e.target.value, 10));
  };

  // Determine color based on percentage
  const getColor = (percentage: number) => {
    if (percentage === 0) return '#6B7280'; // gray
    if (percentage <= 25) return '#EF4444'; // red
    if (percentage <= 50) return '#F59E0B'; // amber
    if (percentage <= 75) return '#10B981'; // green
    return '#3B82F6'; // blue (100%)
  };

  const color = getColor(value);

  // Marker positions
  const markers = [
    { value: 0, label: '0%' },
    { value: 25, label: '25%' },
    { value: 50, label: '50%' },
    { value: 75, label: '75%' },
    { value: 100, label: '100%' },
  ];

  return (
    <div className={`relative ${className}`}>
      {/* Label and Value */}
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm text-gray-400">Rollout Percentage</label>
        <div className="relative">
          <span
            className="cursor-help text-lg font-bold transition-colors"
            style={{ color }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            {value}%
          </span>
          {showTooltip && (
            <div className="absolute right-0 top-8 z-10 whitespace-nowrap rounded bg-detective-bg-secondary px-3 py-2 text-xs text-gray-300 shadow-lg">
              {value === 0 && 'Disabled for all users'}
              {value > 0 && value < 25 && 'Testing phase - limited rollout'}
              {value >= 25 && value < 50 && 'Early adoption phase'}
              {value >= 50 && value < 75 && 'Majority rollout'}
              {value >= 75 && value < 100 && 'Near-complete rollout'}
              {value === 100 && 'Full rollout - all users'}
            </div>
          )}
        </div>
      </div>

      {/* Slider Container */}
      <div className="relative">
        {/* Slider Track with Gradient */}
        <div className="relative h-2 overflow-hidden rounded-lg bg-detective-bg-secondary">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${value}%`,
              backgroundColor: color,
            }}
          />
        </div>

        {/* Slider Input */}
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className="absolute inset-0 h-2 w-full cursor-pointer appearance-none bg-transparent opacity-0"
        />

        {/* Markers */}
        <div className="relative mt-2 flex justify-between">
          {markers.map((marker) => (
            <div key={marker.value} className="flex flex-col items-center">
              <div
                className={`h-1 w-1 rounded-full ${
                  value >= marker.value ? 'bg-detective-orange' : 'bg-gray-600'
                }`}
              />
              <span className="mt-1 text-xs text-gray-500">{marker.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Status Text */}
      <div className="mt-2 text-xs text-gray-400">
        {value === 0 && 'Feature disabled for all users'}
        {value > 0 && value < 100 && `Enabled for approximately ${value}% of target users`}
        {value === 100 && 'Feature enabled for all target users'}
      </div>
    </div>
  );
};
