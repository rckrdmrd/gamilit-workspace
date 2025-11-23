// ========================================
// CORRECCIÓN C1.1.5: Crear BucketTypeEnum
// ========================================

/**
 * ENUM para tipo de bucket de almacenamiento
 * Corresponde a: storage.buckettype en PostgreSQL
 *
 * Valores en DB:
 * - STANDARD: Bucket estándar para archivos generales
 * - ANALYTICS: Bucket para datos de analytics y métricas
 *
 * NOTA: Valores en mayúsculas según definición en DB
 */
export enum BucketTypeEnum {
  STANDARD = 'STANDARD',
  ANALYTICS = 'ANALYTICS'
}
