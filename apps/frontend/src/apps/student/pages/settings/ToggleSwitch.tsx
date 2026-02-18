import React from 'react';
import { cn } from '@shared/utils/cn';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  label,
  description,
}) => (
  <label className="flex cursor-pointer items-start justify-between rounded-lg bg-detective-bg p-4 transition-colors hover:bg-orange-50">
    <div className="flex-1 pr-4">
      <p className="font-medium text-detective-text">{label}</p>
      {description && (
        <p className="mt-1 text-sm text-detective-text-secondary">{description}</p>
      )}
    </div>
    <button
      role="switch"
      type="button"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative mt-0.5 inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-detective-orange/40 focus:ring-offset-2',
        checked ? 'bg-detective-orange' : 'bg-gray-300',
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
          checked ? 'translate-x-5' : 'translate-x-0',
        )}
      />
    </button>
  </label>
);
