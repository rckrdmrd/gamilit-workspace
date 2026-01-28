/**
 * ThemePreview Component for EXT-008 White Label System
 *
 * A live preview component that shows how branding changes will appear
 * in the actual application UI.
 *
 * @module features/admin/branding/components/ThemePreview
 * @see ET-WL-001-theming.md
 */

import React from 'react';
import { Bell, User, Search, Home, BookOpen, Trophy, Settings } from 'lucide-react';
import { getContrastTextColor } from '@/utils/color.utils';

interface ThemePreviewProps {
  /** Platform name to display */
  platformName: string;
  /** Logo URL (optional) */
  logoUrl?: string | null;
  /** Primary brand color */
  primaryColor: string;
  /** Secondary brand color */
  secondaryColor: string;
  /** Accent color (optional) */
  accentColor?: string;
}

/**
 * ThemePreview Component
 *
 * Provides a miniature preview of the application UI with:
 * - Header with logo and navigation
 * - Sidebar with menu items
 * - Button examples
 * - Card examples
 * - Badge examples
 *
 * All elements use the provided colors to show real-time preview.
 *
 * @example
 * ```tsx
 * <ThemePreview
 *   platformName="My Platform"
 *   logoUrl="https://example.com/logo.png"
 *   primaryColor="#3b82f6"
 *   secondaryColor="#1d4ed8"
 * />
 * ```
 */
export const ThemePreview: React.FC<ThemePreviewProps> = ({
  platformName,
  logoUrl,
  primaryColor,
  secondaryColor,
  accentColor = '#f59e0b',
}) => {
  const primaryTextColor = getContrastTextColor(primaryColor);
  const secondaryTextColor = getContrastTextColor(secondaryColor);

  return (
    <div className="w-full overflow-hidden rounded-lg border border-detective-border bg-gray-50 shadow-sm">
      {/* Preview Label */}
      <div className="bg-gray-100 px-4 py-2 text-xs font-medium text-gray-500">
        Live Preview
      </div>

      {/* Preview Container */}
      <div className="relative min-h-[360px] scale-[0.85] origin-top-left" style={{ width: '117.6%' }}>
        {/* Header */}
        <header
          className="flex h-12 items-center justify-between px-4"
          style={{ backgroundColor: primaryColor }}
        >
          {/* Logo / Platform Name */}
          <div className="flex items-center gap-2">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-7 max-w-[100px] object-contain" />
            ) : (
              <span
                className="text-sm font-bold"
                style={{ color: primaryTextColor === 'light' ? '#fff' : '#1f2937' }}
              >
                {platformName}
              </span>
            )}
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-3">
            <Search
              className="h-4 w-4"
              style={{ color: primaryTextColor === 'light' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)' }}
            />
            <Bell
              className="h-4 w-4"
              style={{ color: primaryTextColor === 'light' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)' }}
            />
            <div
              className="h-6 w-6 rounded-full"
              style={{ backgroundColor: primaryTextColor === 'light' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }}
            >
              <User
                className="h-full w-full p-1"
                style={{ color: primaryTextColor === 'light' ? '#fff' : '#1f2937' }}
              />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex h-[308px]">
          {/* Sidebar */}
          <nav className="w-48 bg-white border-r border-gray-200 p-3">
            <div className="space-y-1">
              {[
                { icon: Home, label: 'Dashboard', active: true },
                { icon: BookOpen, label: 'Modules', active: false },
                { icon: Trophy, label: 'Achievements', active: false },
                { icon: Settings, label: 'Settings', active: false },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs ${
                    item.active ? 'font-medium' : 'text-gray-600'
                  }`}
                  style={item.active ? {
                    backgroundColor: `${primaryColor}15`,
                    color: primaryColor,
                  } : undefined}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </nav>

          {/* Content Area */}
          <div className="flex-1 bg-gray-50 p-4">
            {/* Page Title */}
            <h1 className="mb-4 text-lg font-bold text-gray-800">Dashboard</h1>

            {/* Stats Cards */}
            <div className="mb-4 grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-white p-3 shadow-sm">
                <div className="text-xs text-gray-500">Total XP</div>
                <div className="text-lg font-bold" style={{ color: primaryColor }}>1,250</div>
              </div>
              <div className="rounded-lg bg-white p-3 shadow-sm">
                <div className="text-xs text-gray-500">Level</div>
                <div className="text-lg font-bold" style={{ color: secondaryColor }}>12</div>
              </div>
              <div className="rounded-lg bg-white p-3 shadow-sm">
                <div className="text-xs text-gray-500">Streak</div>
                <div className="text-lg font-bold" style={{ color: accentColor }}>7 days</div>
              </div>
            </div>

            {/* Button Examples */}
            <div className="mb-4 flex gap-2">
              <button
                className="rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
                style={{
                  backgroundColor: primaryColor,
                  color: primaryTextColor === 'light' ? '#fff' : '#1f2937',
                }}
              >
                Primary Button
              </button>
              <button
                className="rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
                style={{
                  backgroundColor: secondaryColor,
                  color: secondaryTextColor === 'light' ? '#fff' : '#1f2937',
                }}
              >
                Secondary
              </button>
              <button
                className="rounded-md border px-3 py-1.5 text-xs font-medium"
                style={{
                  borderColor: primaryColor,
                  color: primaryColor,
                }}
              >
                Outline
              </button>
            </div>

            {/* Badge Examples */}
            <div className="flex gap-2">
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{
                  backgroundColor: `${primaryColor}20`,
                  color: primaryColor,
                }}
              >
                Active
              </span>
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{
                  backgroundColor: `${secondaryColor}20`,
                  color: secondaryColor,
                }}
              >
                Completed
              </span>
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{
                  backgroundColor: `${accentColor}20`,
                  color: accentColor,
                }}
              >
                New
              </span>
            </div>

            {/* Progress Bar Example */}
            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs text-gray-600">Module Progress</span>
                <span className="text-xs font-medium" style={{ color: primaryColor }}>65%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: '65%',
                    background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemePreview;
