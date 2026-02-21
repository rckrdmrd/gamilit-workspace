/**
 * Parent-Student Link Enums
 *
 * Extracted from auth/entities/parent-student-link.entity.ts
 * to avoid DTO → Entity cross-layer imports.
 *
 * @see parent-student-link.entity.ts
 * @created 2026-02-21 - Architecture test fix
 */

export enum ParentRelationshipType {
  MOTHER = 'mother',
  FATHER = 'father',
  GUARDIAN = 'guardian',
  TUTOR = 'tutor',
  STEPPARENT = 'stepparent',
  GRANDPARENT = 'grandparent',
  OTHER = 'other',
}

export enum LinkStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  REVOKED = 'revoked',
}
