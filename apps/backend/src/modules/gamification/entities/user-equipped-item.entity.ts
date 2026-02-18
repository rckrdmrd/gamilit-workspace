import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Unique } from 'typeorm';
import { Profile } from '../../auth/entities/profile.entity';
import { ShopItem } from './shop-item.entity';
import { ShopCategory } from './shop-category.entity';
import { DB_SCHEMAS, DB_TABLES } from '@/shared/constants/database.constants';

/**
 * UserEquippedItem Entity
 *
 * Representa un item cosmético equipado activamente por el usuario.
 * Garantiza unicidad por categoría (solo 1 avatar, 1 marco, etc.).
 *
 * @see gamification_system.user_equipped_items
 */
@Entity({ schema: DB_SCHEMAS.GAMIFICATION, name: DB_TABLES.GAMIFICATION.USER_EQUIPPED_ITEMS })
@Unique(['user_id', 'category_id']) // Enforce unique constraint in ORM
export class UserEquippedItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid' })
  category_id: string;

  @Column({ type: 'uuid' })
  item_id: string;

  @ManyToOne(() => Profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Profile;

  @ManyToOne(() => ShopCategory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: ShopCategory;

  @ManyToOne(() => ShopItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item: ShopItem;

  @CreateDateColumn({ type: 'timestamptz' })
  equipped_at: Date;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;
}
