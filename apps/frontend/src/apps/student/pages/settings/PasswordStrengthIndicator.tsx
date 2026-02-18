import React from 'react';
import { cn } from '@shared/utils/cn';

interface PasswordStrengthIndicatorProps {
  password: string;
}

function getStrength(password: string): { score: number; label: string } {
  if (!password) return { score: 0, label: '' };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score: 1, label: 'Debil' };
  if (score <= 4) return { score: 2, label: 'Regular' };
  if (score <= 5) return { score: 3, label: 'Buena' };
  return { score: 4, label: 'Fuerte' };
}

const BAR_COLORS: Record<number, string> = {
  1: 'bg-red-500',
  2: 'bg-yellow-500',
  3: 'bg-green-400',
  4: 'bg-green-600',
};

const LABEL_COLORS: Record<number, string> = {
  1: 'text-red-600',
  2: 'text-yellow-600',
  3: 'text-green-500',
  4: 'text-green-700',
};

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
}) => {
  const { score, label } = getStrength(password);
  if (!password) return null;

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors duration-300',
              i <= score ? BAR_COLORS[score] : 'bg-gray-200',
            )}
          />
        ))}
      </div>
      <p className={cn('text-xs font-medium', LABEL_COLORS[score])}>
        {label}
      </p>
    </div>
  );
};
