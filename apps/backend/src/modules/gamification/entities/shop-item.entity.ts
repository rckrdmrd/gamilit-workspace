import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@shared/constants/database.constants';
import { ShopItemCategoryEnum } from '@shared/constants/enums.constants';

/**
 * ShopItem Entity (gamification_system.shop_items)
 *
 * @description Items disponibles para compra en la tienda con ML Coins
 * @schema gamification_system
 * @table shop_items
 *
 * IMPORTANTE:
 * - Catálogo de items comprables (cosméticos, boosts, perfiles, etc)
 * - Soporte para descuentos temporales y stock limitado
 * - Requisitos de desbloqueo (rank, level, achievement)
 * - Efectos de items consumibles en effect_data
 *
 * @see DDL: apps/database/ddl/schemas/gamification_system/tables/shop_items.sql
 */
@Entity({ schema: DB_SCHEMAS.GAMIFICATION, name: DB_TABLES.GAMIFICATION.SHOP_ITEMS })
@Index('idx_shop_items_tenant_id', ['tenant_id'])
@Index('idx_shop_items_category_id', ['category_id'])
@Index('idx_shop_items_category', ['category'])
@Index('idx_shop_items_available', ['is_available'], { where: 'is_available = true' })
@Index('idx_shop_items_price', ['price'])
export class ShopItem {
  /**
   * Identificador único del item (UUID)
   */
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  /**
   * ID del tenant (FK → auth_management.tenants)
   */
  @Column({ type: 'uuid', nullable: true })
    tenant_id?: string;

  // =====================================================
  // BASIC INFORMATION
  // =====================================================

  /**
   * Nombre del item
   * Ejemplo: 'Avatar Maya Warrior', 'XP Boost 2x', 'Profile Frame Gold'
   */
  @Column({ type: 'text' })
    name!: string;

  /**
   * Descripción del item
   */
  @Column({ type: 'text', nullable: true })
    description?: string;

  /**
   * Icono del item (emoji o nombre de icono)
   * Ejemplo: '🎭', 'rocket', 'star'
   */
  @Column({ type: 'text', default: 'gift' })
    icon!: string;

  /**
   * URL de imagen del item
   */
  @Column({ type: 'text', nullable: true })
    image_url?: string;

  // =====================================================
  // CATEGORIZATION
  // =====================================================

  /**
   * ID de la categoría (FK → shop_categories)
   */
  @Column({ type: 'uuid', nullable: true })
    category_id?: string;

  /**
   * Categoría del item (ENUM)
   * Valores: cosmetics, profile, guild, social, consumable
   */
  @Column({ type: 'enum', enum: ShopItemCategoryEnum })
    category!: ShopItemCategoryEnum;

  /**
   * Rareza del item
   * Valores: common, rare, epic, legendary
   */
  @Column({ type: 'text', default: 'common' })
    rarity!: string;

  /**
   * Tags del item para búsqueda y filtrado
   * Ejemplo: ['avatar', 'maya', 'limited']
   */
  @Column({ type: 'text', array: true, default: [] })
    tags!: string[];

  // =====================================================
  // PRICING & DISCOUNTS
  // =====================================================

  /**
   * Precio base en ML Coins
   */
  @Column({ type: 'integer' })
    price!: number;

  /**
   * Precio con descuento (si aplica)
   */
  @Column({ type: 'integer', nullable: true })
    discount_price?: number;

  /**
   * Fecha y hora de fin del descuento
   */
  @Column({ type: 'timestamp with time zone', nullable: true })
    discount_ends_at?: Date;

  // =====================================================
  // AVAILABILITY & STOCK
  // =====================================================

  /**
   * Si el item está disponible para compra
   */
  @Column({ type: 'boolean', default: true })
    is_available!: boolean;

  /**
   * Stock disponible (null = ilimitado)
   */
  @Column({ type: 'integer', nullable: true })
    stock?: number;

  /**
   * Máximo de compras por usuario (null = sin límite)
   */
  @Column({ type: 'integer', nullable: true })
    max_per_user?: number;

  // =====================================================
  // UNLOCK REQUIREMENTS
  // =====================================================

  /**
   * Rango Maya requerido para comprar
   * Ejemplo: 'Ajaw', 'Nacom', 'Ah K\'in'
   */
  @Column({ type: 'text', nullable: true })
    required_rank?: string;

  /**
   * Nivel mínimo requerido
   */
  @Column({ type: 'integer', nullable: true })
    required_level?: number;

  /**
   * ID del achievement requerido (FK → achievements)
   */
  @Column({ type: 'uuid', nullable: true })
    required_achievement_id?: string;

  // =====================================================
  // CONSUMABLE PROPERTIES
  // =====================================================

  /**
   * Si el item es consumible (se gasta al usar)
   */
  @Column({ type: 'boolean', default: false })
    is_consumable!: boolean;

  /**
   * Duración en días (para items temporales)
   */
  @Column({ type: 'integer', nullable: true })
    duration_days?: number;

  /**
   * Datos del efecto del item (JSONB)
   * Ejemplo: {"type": "xp_boost", "multiplier": 2.0, "duration_minutes": 60}
   */
  @Column({ type: 'jsonb', nullable: true })
    effect_data?: Record<string, unknown>;

  // =====================================================
  // METADATA & AUDIT
  // =====================================================

  /**
   * Metadatos adicionales en formato JSON
   */
  @Column({ type: 'jsonb', default: {} })
    metadata!: Record<string, unknown>;

  /**
   * ID del usuario que creó el item
   */
  @Column({ type: 'uuid', nullable: true })
    created_by?: string;

  /**
   * Fecha y hora de creación del registro
   */
  @CreateDateColumn({ type: 'timestamp with time zone' })
    created_at!: Date;

  /**
   * Fecha y hora de última actualización del registro
   */
  @UpdateDateColumn({ type: 'timestamp with time zone' })
    updated_at!: Date;

  // =====================================================
  // HELPER METHODS
  // =====================================================

  /**
   * Obtiene el precio actual (con descuento si aplica)
   */
  getCurrentPrice(): number {
    if (
      this.discount_price !== null &&
      this.discount_price !== undefined &&
      this.discount_ends_at &&
      new Date() < this.discount_ends_at
    ) {
      return this.discount_price;
    }
    return this.price;
  }

  /**
   * Verifica si el item tiene descuento activo
   */
  hasActiveDiscount(): boolean {
    return !!(this.discount_price && this.discount_ends_at && new Date() < this.discount_ends_at);
  }

  /**
   * Verifica si hay stock disponible
   */
  hasStock(): boolean {
    return this.stock === null || this.stock === undefined || this.stock > 0;
  }
}
