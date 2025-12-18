import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@shared/constants/database.constants';

/**
 * UserPurchase Entity (gamification_system.user_purchases)
 *
 * @description Registro de compras de items del shop por usuario
 * @schema gamification_system
 * @table user_purchases
 *
 * IMPORTANTE:
 * - Historial completo de compras de items del shop
 * - Relación con ml_coins_transactions para tracking de pagos
 * - Soporte para items consumibles con expiración
 * - Estados: pending, completed, refunded, expired
 *
 * @see DDL: apps/database/ddl/schemas/gamification_system/tables/user_purchases.sql
 */
@Entity({ schema: DB_SCHEMAS.GAMIFICATION, name: DB_TABLES.GAMIFICATION.USER_PURCHASES })
@Index('idx_user_purchases_user_id', ['user_id'])
@Index('idx_user_purchases_item_id', ['item_id'])
@Index('idx_user_purchases_tenant_id', ['tenant_id'])
@Index('idx_user_purchases_status', ['status'])
@Index('idx_user_purchases_user_item', ['user_id', 'item_id'])
@Index('idx_user_purchases_purchased_at', ['purchased_at'])
export class UserPurchase {
  /**
   * Identificador único de la compra (UUID)
   */
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  /**
   * ID del usuario comprador (FK → auth_management.users)
   */
  @Column({ type: 'uuid' })
    user_id!: string;

  /**
   * ID del item comprado (FK → shop_items)
   */
  @Column({ type: 'uuid' })
    item_id!: string;

  /**
   * ID del tenant (FK → auth_management.tenants)
   */
  @Column({ type: 'uuid', nullable: true })
    tenant_id?: string;

  // =====================================================
  // PURCHASE DETAILS
  // =====================================================

  /**
   * Cantidad comprada
   */
  @Column({ type: 'integer', default: 1 })
    quantity!: number;

  /**
   * Precio pagado en ML Coins (por unidad)
   */
  @Column({ type: 'integer' })
    price_paid!: number;

  /**
   * Descuento aplicado en ML Coins (valor absoluto)
   */
  @Column({ type: 'integer', default: 0 })
    discount_applied!: number;

  /**
   * ID de la transacción de ML Coins (FK → ml_coins_transactions)
   */
  @Column({ type: 'uuid', nullable: true })
    transaction_id?: string;

  // =====================================================
  // STATUS & LIFECYCLE
  // =====================================================

  /**
   * Estado de la compra
   * Valores: pending, completed, refunded, expired
   */
  @Column({ type: 'text', default: 'completed' })
    status!: string;

  /**
   * Fecha y hora de expiración (para items temporales)
   */
  @Column({ type: 'timestamp with time zone', nullable: true })
    expires_at?: Date;

  /**
   * Fecha y hora de consumo (para items consumibles)
   */
  @Column({ type: 'timestamp with time zone', nullable: true })
    consumed_at?: Date;

  /**
   * Si el item está activo (no consumido ni expirado)
   */
  @Column({ type: 'boolean', default: true })
    is_active!: boolean;

  // =====================================================
  // METADATA & AUDIT
  // =====================================================

  /**
   * Metadatos adicionales en formato JSON
   * Ejemplo: {"applied_at": "...", "effect": {...}}
   */
  @Column({ type: 'jsonb', default: {} })
    metadata!: Record<string, unknown>;

  /**
   * Fecha y hora de la compra (timestamp de creación del registro)
   * NOTA: La tabla usa purchased_at como timestamp de creación, no tiene created_at
   */
  @Column({ type: 'timestamp with time zone', default: () => 'gamilit.now_mexico()' })
    purchased_at!: Date;

  // =====================================================
  // HELPER METHODS
  // =====================================================

  /**
   * Verifica si la compra ha expirado
   */
  isExpired(): boolean {
    return !!(this.expires_at && new Date() > this.expires_at);
  }

  /**
   * Verifica si el item ha sido consumido
   */
  isConsumed(): boolean {
    return !!this.consumed_at;
  }

  /**
   * Calcula el costo total de la compra
   */
  getTotalCost(): number {
    return this.price_paid * this.quantity;
  }
}
