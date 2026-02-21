/**
 * Certificate Enums
 *
 * Extracted from progress/entities/certificate.entity.ts
 * to avoid DTO → Entity cross-layer imports.
 *
 * @see certificate.entity.ts
 * @created 2026-02-21 - Architecture test fix
 */

/**
 * Certificate Status Enum
 */
export enum CertificateStatus {
  PENDING = 'pending',
  ISSUED = 'issued',
  REVOKED = 'revoked',
  EXPIRED = 'expired',
}

/**
 * Certificate Type Enum
 */
export enum CertificateType {
  MODULE_COMPLETION = 'module_completion',
  COURSE_COMPLETION = 'course_completion',
  ACHIEVEMENT = 'achievement',
  SKILL_MASTERY = 'skill_mastery',
}
