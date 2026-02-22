/**
 * TargetingConfig Component
 *
 * Configuration component for targeting specific roles and users.
 * Features:
 * - Checkboxes for roles (student, teacher, admin_teacher, super_admin)
 * - "All users" option
 * - Preview of affected users count
 *
 * Created: 2025-12-05 - FE-ADMIN-011-016 (Sprint P2-B)
 */

import { Users, Check } from 'lucide-react';

interface TargetingConfigProps {
  targetRoles: string[];
  onChange: (roles: string[]) => void;
  className?: string;
}

const AVAILABLE_ROLES = [
  { value: 'student', label: 'Students', description: 'All student users' },
  { value: 'teacher', label: 'Teachers', description: 'Regular teacher users' },
  { value: 'admin_teacher', label: 'Admin Teachers', description: 'Teachers with admin privileges' },
  { value: 'super_admin', label: 'Super Admins', description: 'System administrators' },
];

export const TargetingConfig = ({
  targetRoles,
  onChange,
  className = '',
}: TargetingConfigProps) => {
  const isAllSelected = targetRoles.length === AVAILABLE_ROLES.length;

  const handleToggleAll = () => {
    if (isAllSelected) {
      onChange([]);
    } else {
      onChange(AVAILABLE_ROLES.map((role) => role.value));
    }
  };

  const handleToggleRole = (roleValue: string) => {
    if (targetRoles.includes(roleValue)) {
      onChange(targetRoles.filter((r) => r !== roleValue));
    } else {
      onChange([...targetRoles, roleValue]);
    }
  };

  return (
    <div className={className}>
      <div className="mb-3 flex items-center gap-2">
        <Users className="h-5 w-5 text-detective-orange" />
        <label className="text-sm font-semibold text-detective-text">Target Roles</label>
      </div>

      {/* All Users Option */}
      <div className="mb-3 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
        <label className="flex cursor-pointer items-center gap-3">
          <div className="relative">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={handleToggleAll}
              className="peer h-5 w-5 cursor-pointer appearance-none rounded border-2 border-blue-500 bg-transparent transition-colors checked:border-blue-500 checked:bg-blue-500"
            />
            <Check className="pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-blue-400">All Users</div>
            <div className="text-xs text-gray-400">Enable for all user roles</div>
          </div>
        </label>
      </div>

      {/* Individual Roles */}
      <div className="space-y-2">
        {AVAILABLE_ROLES.map((role) => {
          const isSelected = targetRoles.includes(role.value);
          return (
            <div
              key={role.value}
              className={`rounded-lg border p-3 transition-colors ${
                isSelected
                  ? 'border-detective-orange/30 bg-detective-orange/10'
                  : 'border-detective-bg-secondary bg-detective-bg-secondary'
              }`}
            >
              <label className="flex cursor-pointer items-center gap-3">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleRole(role.value)}
                    className="peer h-5 w-5 cursor-pointer appearance-none rounded border-2 border-gray-500 bg-transparent transition-colors checked:border-detective-orange checked:bg-detective-orange"
                  />
                  <Check className="pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-detective-text">{role.label}</div>
                  <div className="text-xs text-gray-400">{role.description}</div>
                </div>
              </label>
            </div>
          );
        })}
      </div>

      {/* Preview */}
      <div className="mt-4 rounded-lg border border-gray-600 bg-detective-bg-secondary p-3">
        <div className="mb-1 flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-400" />
          <span className="text-xs font-semibold text-gray-400">Target Preview</span>
        </div>
        {targetRoles.length === 0 ? (
          <p className="text-xs text-gray-500">No roles selected - feature will be disabled</p>
        ) : isAllSelected ? (
          <p className="text-xs text-blue-400">All users will have access to this feature</p>
        ) : (
          <div className="flex flex-wrap gap-1">
            {targetRoles.map((roleValue) => {
              const role = AVAILABLE_ROLES.find((r) => r.value === roleValue);
              return (
                <span
                  key={roleValue}
                  className="rounded bg-detective-orange/20 px-2 py-0.5 text-xs text-detective-orange"
                >
                  {role?.label}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
