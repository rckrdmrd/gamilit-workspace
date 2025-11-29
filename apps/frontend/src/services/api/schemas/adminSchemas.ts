import { z } from 'zod';

/**
 * Zod Schemas para validación de respuestas API del portal Admin
 *
 * Estos schemas validan estructuras de datos en runtime para prevenir errores
 * cuando las respuestas del backend difieren de lo esperado.
 *
 * Relacionado con:
 * - BUG-ADMIN-006: Estructura de respuesta no validada en AdminInstitutionsPage
 * - BUG-ADMIN-007: Features array puede ser undefined
 * - BUG-ADMIN-008: Propiedades de ranks no validadas (level, minXp, multiplierXp)
 * - BUG-ADMIN-009: Parámetros con estructura asumida (key, value, dataType)
 *
 * @module adminSchemas
 */

// ============================================================================
// ORGANIZATION SCHEMAS
// ============================================================================

/**
 * Schema para Organization
 *
 * Valida estructura completa de una organización incluyendo features array
 * con fallback a array vacío si no está presente (solución BUG-ADMIN-007)
 *
 * IMPORTANTE: Este schema valida la estructura del tipo Organization del frontend
 * (apps/admin/types), NO la respuesta directa del backend
 */
export const OrganizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  plan: z.enum(['free', 'pro', 'enterprise']),
  status: z.enum(['active', 'inactive', 'suspended']),
  userCount: z.number().int().nonnegative(),
  createdAt: z.string(),
  features: z.array(z.string()).default([]), // ← BUG-ADMIN-007: default([])
  subscription: z
    .object({
      startDate: z.string(),
      endDate: z.string(),
      autoRenew: z.boolean(),
    })
    .optional(),
});

/**
 * Schema para paginación
 *
 * Estructura estándar de paginación usada en respuestas paginadas
 */
export const PaginationSchema = z.object({
  page: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
  totalItems: z.number().int().nonnegative(),
  limit: z.number().int().positive(),
});

/**
 * Schema para respuesta paginada de organizaciones
 *
 * Valida la estructura completa de la respuesta API incluyendo
 * items y metadata de paginación (solución BUG-ADMIN-006)
 */
export const PaginatedOrganizationsSchema = z.object({
  items: z.array(OrganizationSchema),
  pagination: PaginationSchema,
});

// ============================================================================
// GAMIFICATION SCHEMAS
// ============================================================================

/**
 * Schema para Maya Rank
 *
 * Valida todas las propiedades críticas de rangos Maya incluyendo:
 * - level: número entero no negativo (BUG-ADMIN-008)
 * - minXp: número entero no negativo (BUG-ADMIN-008)
 * - maxXp: número positivo o null
 * - multiplierXp: número positivo con default 1 (BUG-ADMIN-008)
 *
 * IMPORTANTE: Alineado con types/admin/gamification.types.ts MayaRankConfig interface
 * NOTA: Renombrado de MayaRank a MayaRankConfig (P2-001) para evitar conflicto con enum
 */
export const MayaRankConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  level: z.number().int().nonnegative(), // ← BUG-ADMIN-008: Validación crítica
  minXp: z.number().int().nonnegative(), // ← BUG-ADMIN-008: Validación crítica
  maxXp: z.number().int().positive().nullable(), // ← BUG-ADMIN-008: Validación crítica
  multiplierXp: z.number().positive(), // ← BUG-ADMIN-008: Validación crítica
  multiplierMlCoins: z.number().positive(), // ← BUG-ADMIN-008: Validación crítica
  bonusMlCoins: z.number().nonnegative(),
  color: z.string(),
  icon: z.string().nullable(),
  description: z.string(),
  perks: z.array(z.string()),
  isActive: z.boolean(),
  order: z.number().int().nonnegative(),
});

/**
 * Schema para Gamification Parameter
 *
 * Valida parámetros del sistema de gamificación con:
 * - key: string obligatorio (BUG-ADMIN-009)
 * - value: número (BUG-ADMIN-009)
 * - dataType: enum con valores válidos (BUG-ADMIN-009)
 * - category: enum con categorías válidas (BUG-ADMIN-009)
 *
 * IMPORTANTE: Alineado con types/admin/gamification.types.ts GamificationParameter interface
 */
export const ParameterSchema = z.object({
  id: z.string(),
  category: z.enum(['points', 'coins', 'levels', 'ranks', 'penalties', 'bonuses']), // ← BUG-ADMIN-009: Validación crítica
  key: z.string(), // ← BUG-ADMIN-009: Validación crítica
  value: z.number(), // ← BUG-ADMIN-009: Validación crítica
  defaultValue: z.number(),
  minValue: z.number().nullable(),
  maxValue: z.number().nullable(),
  description: z.string(),
  dataType: z.enum(['integer', 'decimal', 'percentage']), // ← BUG-ADMIN-009: Validación crítica
  isActive: z.boolean(),
  lastModified: z.string(),
  modifiedBy: z.string().nullable(),
});

// ============================================================================
// EXPORTED TYPES
// ============================================================================

/**
 * Type inference desde schemas Zod
 *
 * Estos tipos son generados automáticamente desde los schemas y garantizan
 * que TypeScript y la validación en runtime estén 100% sincronizados
 */
export type Organization = z.infer<typeof OrganizationSchema>;
export type PaginatedOrganizations = z.infer<typeof PaginatedOrganizationsSchema>;
export type MayaRankConfig = z.infer<typeof MayaRankConfigSchema>;
export type Parameter = z.infer<typeof ParameterSchema>;
