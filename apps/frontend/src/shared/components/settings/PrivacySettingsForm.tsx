import { motion } from 'framer-motion';
import { Shield, AlertCircle } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { SaveButton, type SaveStatus } from '@shared/components/feedback/SaveButton';
import { cn } from '@shared/utils/cn';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface PrivacyToggleItem {
  key: string;
  label: string;
  description?: string;
  value: boolean;
}

export interface PrivacyVisibilityOption {
  value: string;
  label: string;
}

export interface PrivacySettingsFormProps {
  /** Card title */
  title?: string;
  /** Subtitle below title */
  subtitle?: string;

  /** Profile visibility select */
  profileVisibility: string;
  onVisibilityChange: (value: string) => void;
  /** Options for the visibility select (defaults to public/friends/private) */
  visibilityOptions?: PrivacyVisibilityOption[];

  /** Toggle items */
  toggles: PrivacyToggleItem[];
  onToggleChange: (key: string, value: boolean) => void;

  /** Optional privacy notice (omit to hide) */
  showPrivacyNotice?: boolean;
  privacyNoticeText?: string;

  /** Save handling */
  saveStatus: SaveStatus;
  onSave: () => void;

  /** Loading state (shows spinner instead of content) */
  loading?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Default visibility options                                         */
/* ------------------------------------------------------------------ */

const DEFAULT_VISIBILITY_OPTIONS: PrivacyVisibilityOption[] = [
  { value: 'public', label: 'Publico (Todos)' },
  { value: 'friends', label: 'Solo amigos' },
  { value: 'private', label: 'Privado' },
];

/* ------------------------------------------------------------------ */
/*  Toggle row sub-component                                           */
/* ------------------------------------------------------------------ */

function ToggleRow({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
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
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PrivacySettingsForm({
  title = 'Privacidad',
  subtitle,
  profileVisibility,
  onVisibilityChange,
  visibilityOptions = DEFAULT_VISIBILITY_OPTIONS,
  toggles,
  onToggleChange,
  showPrivacyNotice = false,
  privacyNoticeText,
  saveStatus,
  onSave,
  loading = false,
}: PrivacySettingsFormProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <DetectiveCard>
        <h2 className="mb-1 flex items-center gap-2 text-2xl font-bold text-detective-text">
          <Shield className="h-6 w-6 text-detective-orange" />
          {title}
        </h2>
        {subtitle && (
          <p className="mb-4 text-sm text-detective-text-secondary">{subtitle}</p>
        )}
        <div className="mb-6 h-1 w-16 rounded-full bg-gradient-to-r from-detective-orange to-transparent" />

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-detective-orange border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Profile Visibility */}
            <div>
              <label className="mb-2 block text-sm font-medium text-detective-text">
                Visibilidad del perfil
              </label>
              <select
                value={profileVisibility}
                onChange={(e) => onVisibilityChange(e.target.value)}
                className="input-detective w-full cursor-pointer"
              >
                {visibilityOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-detective-text-secondary">
                Controla quien puede ver tu perfil y actividad
              </p>
            </div>

            {/* Privacy Toggles */}
            <div className="space-y-3">
              {toggles.map((toggle) => (
                <ToggleRow
                  key={toggle.key}
                  checked={toggle.value}
                  onChange={(val) => onToggleChange(toggle.key, val)}
                  label={toggle.label}
                  description={toggle.description}
                />
              ))}
            </div>

            {/* Privacy Notice */}
            {showPrivacyNotice && (
              <div className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Proteccion de Datos y Privacidad
                  </p>
                  <p className="mt-1 text-xs text-blue-600">
                    {privacyNoticeText ||
                      'Tu informacion personal esta protegida segun las politicas de privacidad de la institucion.'}
                  </p>
                </div>
              </div>
            )}

            <SaveButton
              status={saveStatus}
              onClick={onSave}
              idleLabel="Guardar Privacidad"
              idleIcon={<Shield className="h-4 w-4" />}
            />
          </div>
        )}
      </DetectiveCard>
    </motion.div>
  );
}
