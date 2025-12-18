import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@shared/constants/database.constants';

/**
 * ShopCategory Entity (gamification_system.shop_categories)
 *
 * @description Categorías de la tienda para organizar items del shop
 * @schema gamification_system
 * @table shop_categories
 *
 * IMPORTANTE:
 * - Tabla de catálogo de categorías (cosméticos, perfil, guild, social, consumibles)
 * - Usada para filtrar y organizar items en el frontend ShopPage
 * - Relación 1:N con shop_items
 *
 * @see DDL: apps/database/ddl/schemas/gamification_system/tables/shop_categories.sql
 */
@Entity({ schema: DB_SCHEMAS.GAMIFICATION, name: DB_TABLES.GAMIFICATION.SHOP_CATEGORIES })
export class ShopCategory {
  /**
   * Identificador único de la categoría (UUID)
   */
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  /**
   * Nombre único de la categoría (slug)
   * Ejemplo: 'cosmetics', 'profile', 'guild', 'social', 'consumable'
   */
  @Column({ type: 'text', unique: true })
    name!: string;

  /**
   * Nombre para mostrar en UI
   * Ejemplo: 'Cosméticos', 'Perfil', 'Gremios', 'Social', 'Consumibles'
   */
  @Column({ type: 'text' })
    display_name!: string;

  /**
   * Descripción de la categoría
   */
  @Column({ type: 'text', nullable: true })
    description?: string;

  /**
   * Icono de la categoría (emoji o nombre de icono)
   * Ejemplo: 'package', 'user', 'shield', 'chat', 'zap'
   */
  @Column({ type: 'text', default: 'package' })
    icon!: string;

  /**
   * Color de la categoría para UI
   * Ejemplo: 'blue', 'purple', 'green', 'yellow', 'red'
   */
  @Column({ type: 'text', default: 'gray' })
    color!: string;

  /**
   * Orden de visualización (menor = primero)
   */
  @Column({ type: 'integer', default: 0 })
    display_order!: number;

  /**
   * Si la categoría está activa y visible
   */
  @Column({ type: 'boolean', default: true })
    is_active!: boolean;

  /**
   * Metadatos adicionales en formato JSON
   */
  @Column({ type: 'jsonb', default: {} })
    metadata!: Record<string, unknown>;

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
}
