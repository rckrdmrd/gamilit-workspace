import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@shared/constants';

/**
 * ContentCategory Entity (content_management.content_categories)
 *
 * @description Categorías jerárquicas para organización de contenido.
 * @schema content_management
 * @table content_categories
 *
 * IMPORTANTE:
 * - Soporta jerarquías (parent_category_id self-referential)
 * - Slug único para URLs amigables
 * - Display order para ordenamiento personalizado
 * - Iconos y colores para UI
 * - is_active para ocultar categorías sin eliminarlas
 *
 * @see DDL: apps/database/ddl/schemas/content_management/tables/content_categories.sql
 */
@Entity({ schema: DB_SCHEMAS.CONTENT, name: DB_TABLES.CONTENT.CONTENT_CATEGORIES })
@Index('idx_content_categories_parent_id', ['parent_category_id'], {
  where: 'parent_category_id IS NOT NULL',
})
@Index('idx_content_categories_slug', ['slug'])
@Index('idx_content_categories_is_active', ['is_active'])
@Index('idx_content_categories_display_order', ['display_order'])
export class ContentCategory {
  /**
   * Identificador único de la categoría (UUID)
   */
  @PrimaryGeneratedColumn('uuid')
    id!: string;

  /**
   * Nombre de la categoría
   * @example 'Comprensión Lectora', 'Matemáticas', 'Ciencias'
   */
  @Column({ type: 'varchar', length: 100 })
    name!: string;

  /**
   * Slug único para URLs amigables
   * @example 'comprension-lectora', 'matematicas-basicas'
   */
  @Column({ type: 'varchar', length: 100, unique: true })
    slug!: string;

  /**
   * Descripción de la categoría
   */
  @Column({ type: 'text', nullable: true })
    description?: string;

  /**
   * ID de la categoría padre (para jerarquías)
   * NULL para categorías de nivel raíz
   */
  @Column({ type: 'uuid', nullable: true })
    parent_category_id?: string;

  /**
   * Orden de visualización
   * Usado para ordenar categorías en UI
   */
  @Column({ type: 'integer', default: 0 })
    display_order!: number;

  /**
   * Indica si la categoría está activa
   */
  @Column({ type: 'boolean', default: true })
    is_active!: boolean;

  /**
   * Icono de la categoría (nombre o emoji)
   * @example 'book', 'calculator', '📚', '🔢'
   */
  @Column({ type: 'varchar', length: 50, nullable: true })
    icon?: string;

  /**
   * Color de la categoría (hex, rgb, o nombre)
   * @example '#3498db', 'rgb(52, 152, 219)', 'blue'
   */
  @Column({ type: 'varchar', length: 20, nullable: true })
    color?: string;

  /**
   * Fecha y hora de creación
   */
  @CreateDateColumn({ type: 'timestamp with time zone' })
    created_at!: Date;

  /**
   * Fecha y hora de última actualización
   */
  @UpdateDateColumn({ type: 'timestamp with time zone' })
    updated_at!: Date;

  // =====================================================
  // Relaciones
  // =====================================================

  /**
   * Categoría padre (para jerarquías)
   * Relación ManyToOne: Muchas categorías pueden pertenecer a una categoría padre
   * FK: content_categories.parent_category_id → content_categories.id (self-referential)
   *
   * NOTA: ON DELETE SET NULL - Si se elimina la categoría padre, las hijas quedan sin padre
   */
  @ManyToOne(() => ContentCategory, (category) => category.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parent_category_id', referencedColumnName: 'id' })
    parent?: ContentCategory;

  /**
   * Subcategorías (hijos)
   * Relación OneToMany: Una categoría puede tener múltiples subcategorías
   */
  @OneToMany(() => ContentCategory, (category) => category.parent)
    children?: ContentCategory[];
}
