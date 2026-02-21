/**
 * Parent Account Enums
 *
 * Extracted from auth/entities/parent-account.entity.ts
 * to avoid DTO → Entity cross-layer imports.
 *
 * @see parent-account.entity.ts
 * @created 2026-02-21 - Architecture test fix
 */

export enum RelationshipType {
  MOTHER = 'mother',
  FATHER = 'father',
  GUARDIAN = 'guardian',
  TUTOR = 'tutor',
  OTHER = 'other',
}

export enum NotificationFrequency {
  REALTIME = 'realtime',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  ON_DEMAND = 'on_demand',
}

export enum ReportFormat {
  EMAIL = 'email',
  IN_APP = 'in_app',
  BOTH = 'both',
}
