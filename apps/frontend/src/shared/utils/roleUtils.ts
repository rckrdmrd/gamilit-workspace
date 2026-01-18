/**
 * Role Utilities
 *
 * Utilities for normalizing and working with user roles.
 *
 * IMPORTANTE - MAPEO CON BASE DE DATOS:
 * La BD usa `auth_management.gamilit_role` con solo 3 valores:
 * - 'student'       -> GamilityRoleEnum.STUDENT
 * - 'admin_teacher' -> GamilityRoleEnum.ADMIN_TEACHER
 * - 'super_admin'   -> GamilityRoleEnum.SUPER_ADMIN
 *
 * El frontend acepta 7 roles para mayor claridad semantica, pero estos
 * deben normalizarse a los 3 valores canonicos al comunicarse con el backend.
 *
 * @see /shared/types/user.types.ts - UserRole type definition
 * @see DISCREPANCIAS-BE-FE-2026-01-18.md - Discrepancia 5
 *
 * @module roleUtils
 */

import type { UserRole } from '../types/user.types';

/**
 * Canonical roles that exist in the database
 * These are the only valid values for the gamilit_role ENUM
 */
export type GamilityRole = 'student' | 'admin_teacher' | 'super_admin';

/**
 * Alias roles used in frontend for semantic clarity
 * These map to canonical roles when communicating with backend
 */
export type FrontendAliasRole = 'teacher' | 'admin' | 'institution_admin' | 'content_creator';

/**
 * Role hierarchy levels for permission checking
 */
export const ROLE_HIERARCHY: Record<GamilityRole, number> = {
  student: 1,
  admin_teacher: 2,
  super_admin: 3,
};

/**
 * Mapping from frontend alias roles to canonical database roles
 */
const ROLE_ALIAS_MAP: Record<string, GamilityRole> = {
  // Canonical roles (map to themselves)
  student: 'student',
  admin_teacher: 'admin_teacher',
  super_admin: 'super_admin',

  // Alias roles -> canonical roles
  teacher: 'admin_teacher',
  admin: 'admin_teacher',
  institution_admin: 'admin_teacher',
  content_creator: 'admin_teacher', // TODO: Define separate role if needed
};

/**
 * Normalizes a user role to its canonical database value
 *
 * Use this function when sending role data to the backend or when
 * comparing roles for permission checks.
 *
 * @param role - The UserRole value (can be alias or canonical)
 * @returns The canonical GamilityRole value
 *
 * @example
 * ```typescript
 * const canonicalRole = normalizeRole('teacher');
 * // Returns: 'admin_teacher'
 *
 * const canonicalRole = normalizeRole('student');
 * // Returns: 'student'
 *
 * const canonicalRole = normalizeRole('institution_admin');
 * // Returns: 'admin_teacher'
 * ```
 */
export const normalizeRole = (role: UserRole | string): GamilityRole => {
  const normalized = ROLE_ALIAS_MAP[role.toLowerCase()];

  if (!normalized) {
    console.warn(`[roleUtils] Unknown role "${role}", defaulting to "student"`);
    return 'student';
  }

  return normalized;
};

/**
 * Alias for normalizeRole - provides clearer intent
 *
 * @param role - The UserRole value
 * @returns The canonical GamilityRole value
 */
export const getCanonicalRole = normalizeRole;

/**
 * Checks if a role is a canonical database role
 *
 * @param role - The role to check
 * @returns true if the role is canonical, false if it's an alias
 *
 * @example
 * ```typescript
 * isCanonicalRole('student'); // true
 * isCanonicalRole('admin_teacher'); // true
 * isCanonicalRole('teacher'); // false (alias)
 * ```
 */
export const isCanonicalRole = (role: string): role is GamilityRole => {
  return ['student', 'admin_teacher', 'super_admin'].includes(role);
};

/**
 * Checks if a role is an alias (not canonical)
 *
 * @param role - The role to check
 * @returns true if the role is an alias
 */
export const isAliasRole = (role: string): role is FrontendAliasRole => {
  return ['teacher', 'admin', 'institution_admin', 'content_creator'].includes(role);
};

/**
 * Checks if a user has at least the required role level
 *
 * Uses role hierarchy: student < admin_teacher < super_admin
 *
 * @param userRole - The user's current role
 * @param requiredRole - The minimum required role
 * @returns true if user has sufficient permissions
 *
 * @example
 * ```typescript
 * hasMinimumRole('super_admin', 'admin_teacher'); // true
 * hasMinimumRole('student', 'admin_teacher'); // false
 * hasMinimumRole('teacher', 'admin_teacher'); // true (teacher normalizes to admin_teacher)
 * ```
 */
export const hasMinimumRole = (
  userRole: UserRole | string,
  requiredRole: GamilityRole
): boolean => {
  const normalizedUserRole = normalizeRole(userRole);
  return ROLE_HIERARCHY[normalizedUserRole] >= ROLE_HIERARCHY[requiredRole];
};

/**
 * Gets the display name for a role (in Spanish)
 *
 * @param role - The role
 * @returns Human-readable role name
 *
 * @example
 * ```typescript
 * getRoleDisplayName('admin_teacher'); // 'Profesor/Administrador'
 * getRoleDisplayName('teacher'); // 'Profesor'
 * getRoleDisplayName('student'); // 'Estudiante'
 * ```
 */
export const getRoleDisplayName = (role: UserRole | string): string => {
  const displayNames: Record<string, string> = {
    // Canonical roles
    student: 'Estudiante',
    admin_teacher: 'Profesor/Administrador',
    super_admin: 'Super Administrador',

    // Alias roles (more specific names)
    teacher: 'Profesor',
    admin: 'Administrador',
    institution_admin: 'Administrador de Institucion',
    content_creator: 'Creador de Contenido',
  };

  return displayNames[role.toLowerCase()] || 'Usuario';
};

/**
 * Gets all alias roles that map to a canonical role
 *
 * @param canonicalRole - The canonical role
 * @returns Array of alias roles that map to this canonical role
 *
 * @example
 * ```typescript
 * getAliasesForRole('admin_teacher');
 * // Returns: ['teacher', 'admin', 'institution_admin', 'content_creator']
 * ```
 */
export const getAliasesForRole = (canonicalRole: GamilityRole): string[] => {
  return Object.entries(ROLE_ALIAS_MAP)
    .filter(([alias, canonical]) => canonical === canonicalRole && alias !== canonicalRole)
    .map(([alias]) => alias);
};
