// ========================================
// CORRECCIÓN C1.1.1: Crear AalLevelEnum
// ========================================

/**
 * ENUM para nivel de garantía de autenticación (Authentication Assurance Level)
 * Corresponde a: auth.aal_level en PostgreSQL
 *
 * Valores en DB:
 * - aal1: Autenticación de factor único
 * - aal2: Autenticación de dos factores
 * - aal3: Autenticación de múltiples factores con hardware
 *
 * @see https://supabase.com/docs/guides/auth/auth-mfa
 */
export enum AalLevelEnum {
  AAL1 = 'aal1',
  AAL2 = 'aal2',
  AAL3 = 'aal3'
}
