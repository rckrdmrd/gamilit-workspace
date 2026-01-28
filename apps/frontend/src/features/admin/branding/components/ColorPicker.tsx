/**
 * ColorPicker Component for EXT-008 White Label System
 *
 * A color picker component with visual picker, hex input, and preset colors.
 * Used in the admin branding settings to customize brand colors.
 *
 * @module features/admin/branding/components/ColorPicker
 * @see ET-WL-004-css-runtime-variables.md
 */

import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import {
  isValidHexColor,
  getContrastTextColor,
  PRESET_COLORS,
} from '@/utils/color.utils';

interface ColorPickerProps {
  /** Label for the color picker */
  label: string;
  /** Current color value (hex format) */
  value: string;
  /** Callback when color changes */
  onChange: (color: string) => void;
  /** Optional description text */
  description?: string;
  /** Custom preset colors (defaults to PRESET_COLORS) */
  presetColors?: string[];
  /** Whether the picker is disabled */
  disabled?: boolean;
  /** Error message to display */
  error?: string;
}

/**
 * ColorPicker Component
 *
 * Provides a visual color picker with:
 * - Color preview swatch
 * - Hex input field
 * - Dropdown with visual picker
 * - Preset color palette
 *
 * @example
 * ```tsx
 * <ColorPicker
 *   label="Primary Color"
 *   value="#f97316"
 *   onChange={handleColorChange}
 *   description="Main brand color used for buttons and accents"
 * />
 * ```
 */
export const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  value,
  onChange,
  description,
  presetColors = PRESET_COLORS,
  disabled = false,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [inputError, setInputError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync input value with prop value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * Handle hex input change
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    // Auto-add # prefix if missing
    if (newValue && !newValue.startsWith('#')) {
      newValue = '#' + newValue;
    }

    setInputValue(newValue);
    setInputError(null);

    // Validate and apply if valid
    if (isValidHexColor(newValue)) {
      onChange(newValue.toLowerCase());
    } else if (newValue.length > 1) {
      setInputError('Invalid hex color');
    }
  };

  /**
   * Handle input blur - validate and reset if invalid
   */
  const handleInputBlur = () => {
    if (!isValidHexColor(inputValue)) {
      setInputValue(value);
      setInputError(null);
    }
  };

  /**
   * Handle preset color selection
   */
  const handlePresetClick = (color: string) => {
    setInputValue(color);
    setInputError(null);
    onChange(color);
  };

  /**
   * Handle native color input change
   */
  const handleNativeColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value.toLowerCase();
    setInputValue(newColor);
    setInputError(null);
    onChange(newColor);
  };

  const textColor = getContrastTextColor(value);

  return (
    <div ref={containerRef} className="relative">
      {/* Label */}
      <label className="mb-2 block text-sm font-medium text-detective-text">
        {label}
      </label>

      {/* Input Container */}
      <div className="flex items-center gap-2">
        {/* Color Swatch Button */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            flex h-10 w-10 items-center justify-center rounded-lg border-2
            transition-all duration-200
            ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-105'}
            ${isOpen ? 'border-detective-orange ring-2 ring-detective-orange/30' : 'border-detective-border'}
          `}
          style={{ backgroundColor: value }}
          aria-label={`Select ${label}`}
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            style={{ color: textColor === 'light' ? '#fff' : '#1f2937' }}
          />
        </button>

        {/* Hex Input */}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          disabled={disabled}
          placeholder="#000000"
          maxLength={7}
          className={`
            h-10 w-28 rounded-lg border px-3 font-mono text-sm
            bg-detective-card text-detective-text
            focus:border-detective-orange focus:ring-2 focus:ring-detective-orange/20
            disabled:cursor-not-allowed disabled:opacity-50
            ${inputError || error ? 'border-red-500' : 'border-detective-border'}
          `}
        />
      </div>

      {/* Description */}
      {description && (
        <p className="mt-1 text-sm text-detective-text-secondary">{description}</p>
      )}

      {/* Error Message */}
      {(inputError || error) && (
        <p className="mt-1 text-sm text-red-500">{inputError || error}</p>
      )}

      {/* Dropdown Panel */}
      {isOpen && !disabled && (
        <div
          className="
            absolute left-0 top-full z-50 mt-2 w-64
            rounded-lg border border-detective-border bg-white p-4
            shadow-lg
          "
        >
          {/* Native Color Picker */}
          <div className="mb-4">
            <label className="mb-2 block text-xs font-medium text-detective-text-secondary">
              Custom Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={value}
                onChange={handleNativeColorChange}
                className="h-10 w-full cursor-pointer rounded border border-detective-border"
              />
            </div>
          </div>

          {/* Preset Colors */}
          <div>
            <label className="mb-2 block text-xs font-medium text-detective-text-secondary">
              Preset Colors
            </label>
            <div className="grid grid-cols-6 gap-2">
              {presetColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handlePresetClick(color)}
                  className={`
                    relative h-8 w-8 rounded-lg border-2 transition-all
                    hover:scale-110 focus:outline-none focus:ring-2 focus:ring-detective-orange/50
                    ${value === color ? 'border-detective-orange' : 'border-transparent'}
                  `}
                  style={{ backgroundColor: color }}
                  title={color}
                >
                  {value === color && (
                    <Check
                      className="absolute inset-0 m-auto h-4 w-4"
                      style={{
                        color: getContrastTextColor(color) === 'light' ? '#fff' : '#1f2937'
                      }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Current Value Display */}
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-gray-50 p-2">
            <div
              className="h-6 w-6 rounded border border-gray-200"
              style={{ backgroundColor: value }}
            />
            <span className="font-mono text-sm text-gray-600">{value}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
