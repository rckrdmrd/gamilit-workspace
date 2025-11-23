// ========================================
// CORRECCIÓN C1.1.2: Crear CodeChallengeMethodEnum
// ========================================

/**
 * ENUM para método de desafío de código en OAuth 2.0 PKCE
 * Corresponde a: auth.code_challenge_method en PostgreSQL
 *
 * Valores en DB:
 * - s256: SHA-256 hash del code_verifier (recomendado)
 * - plain: Code verifier en texto plano (no recomendado)
 *
 * @see https://oauth.net/2/pkce/
 * @see https://datatracker.ietf.org/doc/html/rfc7636
 */
export enum CodeChallengeMethodEnum {
  S256 = 's256',
  PLAIN = 'plain'
}
